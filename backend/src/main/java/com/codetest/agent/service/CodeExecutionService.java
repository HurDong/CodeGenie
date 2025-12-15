package com.codetest.agent.service;

import com.codetest.agent.dto.ExecutionRequest;
import com.codetest.agent.dto.ExecutionResponse;
import com.codetest.agent.dto.TestCase;
import com.codetest.agent.dto.TestResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@Slf4j
public class CodeExecutionService {

    private static final long COMPILE_TIME_LIMIT_MS = 5000;
    private static final long EXECUTION_TIME_LIMIT_MS = 2000;

    /**
     * Main entry point: Executes code against multiple test cases.
     * 1. Creates Temp Dir
     * 2. Compiles Code
     * 3. Runs each Test Case
     * 4. Returns consolidated results
     */
    // --- Main Logic ---

    public ExecutionResponse execute(ExecutionRequest request) {
        String runId = UUID.randomUUID().toString();
        Path tempDir = null;
        ExecutionResponse response = new ExecutionResponse();
        response.setTestResults(new ArrayList<>());

        try {
            tempDir = Files.createTempDirectory("codegenie_" + runId);

            // 1. Prepare Code
            // If user code has 'class Solution', we rename it if needed, or leave it.
            // But we assume the file should be named Solution.java usually.
            // If user code defines 'public class Main', we handle that too.
            // Let's rely on prepareJavaCode logic properly.

            // Logic:
            // If code has "public static void main", treating as standard Main execution.
            // If NOT, we treat as Solution execution requiring ReflectionRunner.

            boolean hasMain = hasMainMethod(request.getCode());
            String finalCode;
            String mainClassName;

            if (hasMain) {
                // Determine class name ? Or force Solution/Main?
                // Logic in prepareJavaCode replaces "public class X" with "public class
                // Solution"
                // Let's stick to Solution.java as the user file.
                finalCode = prepareJavaCode(request.getCode(), "Solution");
                mainClassName = "Solution";
            } else {
                // It is a Solution class without main.
                // We ensure it is "public class Solution"
                finalCode = prepareJavaCode(request.getCode(), "Solution");
                mainClassName = "ReflectionRunner";
            }

            Path sourcePath = tempDir.resolve("Solution.java");
            Files.writeString(sourcePath, finalCode);

            if (!hasMain) {
                // Write ReflectionRunner
                Path runnerPath = tempDir.resolve("ReflectionRunner.java");
                Files.writeString(runnerPath, REFLECTION_RUNNER_SOURCE);
            }

            // 2. Compile
            // If hasMain is false, we need to compile ReflectionRunner.java too?
            // Passing useReflectionRunner flag
            CompilationResult compileResult = compileJava(sourcePath, !hasMain, tempDir);

            if (!compileResult.success()) {
                response.setAllPassed(false);
                response.setError("Compilation Failed:\n" + compileResult.output());
                response.setExitCode(1);
                return response;
            }

            // 3. Run Test Cases
            boolean allPassed = true;
            if (request.getTestCases() != null && !request.getTestCases().isEmpty()) {
                for (TestCase testCase : request.getTestCases()) {
                    // If hasMain -> Run Solution
                    // If !hasMain -> Run ReflectionRunner
                    TestResult result = runSingleTestCase(tempDir, mainClassName, testCase);
                    response.getTestResults().add(result);
                    if (!result.isPassed()) {
                        allPassed = false;
                    }
                }
            } else {
                // Run once
                TestResult result = runSingleTestCase(tempDir, mainClassName, new TestCase("", ""));
                result.setPassed(true);
                response.getTestResults().add(result);
                response.setOutput(result.getActualOutput());
            }

            response.setAllPassed(allPassed);
            response.setExitCode(0);

        } catch (Exception e) {
            log.error("Execution failed", e);
            response.setError("System Error: " + e.getMessage());
            response.setAllPassed(false);
        } finally {
            if (tempDir != null) {
                deleteDirectory(tempDir.toFile());
            }
        }

        return response;
    }

    public ExecutionResult runCode(String userCode, String input, String language) {
        ExecutionRequest request = new ExecutionRequest(language, userCode, List.of(new TestCase(input, "")));
        ExecutionResponse response = execute(request);

        if (response.getError() != null && !response.getError().isEmpty()) {
            return new ExecutionResult(false, "", response.getError());
        }

        if (response.getTestResults().isEmpty()) {
            return new ExecutionResult(false, "", "No results");
        }

        TestResult tr = response.getTestResults().get(0);
        if (tr.getError() != null && !tr.getError().isEmpty()) {
            return new ExecutionResult(false, tr.getActualOutput(), tr.getError());
        }

        return new ExecutionResult(true, tr.getActualOutput(), "");
    }

    // --- Helper Methods ---

    // --- Helper Methods ---

    // --- Helper Methods ---

    private boolean hasMainMethod(String code) {
        return code.contains("public static void main");
    }

    private CompilationResult compileJava(Path sourcePath, boolean useReflectionRunner, Path tempDir)
            throws IOException, InterruptedException {
        List<String> command = new ArrayList<>();
        command.add("javac");
        command.add("-encoding");
        command.add("UTF-8");
        command.add(sourcePath.toString());

        if (useReflectionRunner) {
            command.add(tempDir.resolve("ReflectionRunner.java").toString());
        }

        ProcessBuilder compileBuilder = new ProcessBuilder(command);
        compileBuilder.redirectErrorStream(true);
        Process compileProcess = compileBuilder.start();

        // Close stdin
        compileProcess.getOutputStream().close();

        // Capture output
        StringBuilder output = new StringBuilder();
        Thread outputThread = new Thread(() -> {
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(compileProcess.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            } catch (IOException e) {
                // Ignore
            }
        });
        outputThread.start();

        boolean finished = compileProcess.waitFor(15000, TimeUnit.MILLISECONDS);

        if (!finished) {
            compileProcess.destroyForcibly();
            outputThread.interrupt();
            return new CompilationResult(false, "Compilation Time Limit Exceeded (15s)");
        }

        outputThread.join(1000);

        if (compileProcess.exitValue() != 0) {
            return new CompilationResult(false, output.toString());
        }
        return new CompilationResult(true, output.toString());
    }

    private TestResult runSingleTestCase(Path tempDir, String className, TestCase testCase) {
        TestResult result = new TestResult();
        result.setInput(testCase.getInput());
        result.setExpectedOutput(testCase.getExpectedOutput());

        try {
            ProcessBuilder runBuilder = new ProcessBuilder("java", "-cp", tempDir.toString(), className,
                    "-Dfile.encoding=UTF-8");
            runBuilder.directory(tempDir.toFile());

            Process runProcess = runBuilder.start();

            // Write Input
            if (testCase.getInput() != null) {
                try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(runProcess.getOutputStream()))) {
                    writer.write(testCase.getInput());
                    writer.flush();
                }
            } else {
                runProcess.getOutputStream().close();
            }

            CommonProcessOutput outputHandler = new CommonProcessOutput(runProcess);
            outputHandler.start();

            boolean finished = runProcess.waitFor(EXECUTION_TIME_LIMIT_MS, TimeUnit.MILLISECONDS);

            if (!finished) {
                runProcess.destroyForcibly();
                result.setPassed(false);
                result.setError("Time Limit Exceeded");
                result.setActualOutput("");
            } else {
                outputHandler.join();
                String stdout = outputHandler.getStdout();
                String stderr = outputHandler.getStderr();

                String separator = "===CODEGENIE_OUTPUT_START===";
                String outputForValidation = stdout;
                String outputForDisplay = stdout;

                if (stdout.contains(separator)) {
                    String[] parts = stdout.split(separator);
                    // parts[0] is logs, parts[1] is result
                    if (parts.length > 1) {
                        outputForValidation = parts[1].trim();

                        String logs = parts[0].trim();
                        String resultValue = parts[1].trim();

                        if (!logs.isEmpty()) {
                            outputForDisplay = logs + "\n\n👉 결과값: " + resultValue;
                        } else {
                            outputForDisplay = resultValue;
                        }

                    } else {
                        outputForValidation = "";
                        outputForDisplay = stdout.replace(separator, "").trim();
                    }
                } else {
                    // Fallback for cases without separator (e.g. usage of Main class)
                    outputForDisplay = stdout.trim();
                }

                result.setActualOutput(outputForDisplay.trim());

                if (runProcess.exitValue() != 0) {
                    result.setPassed(false);
                    // If we have semantic error but also exit code !0 (unlikely for logic error,
                    // but likely for crash)
                    // If we found a result but also crashed? rare.
                    result.setError("Runtime Error: " + stderr);
                } else {
                    if (testCase.getExpectedOutput() == null || testCase.getExpectedOutput().isEmpty()) {
                        result.setPassed(true);
                    } else {
                        // Normalize line endings and trim
                        String expected = testCase.getExpectedOutput().trim().replace("\r\n", "\n");
                        String actual = outputForValidation.trim().replace("\r\n", "\n");
                        result.setPassed(expected.equals(actual));
                    }
                }
            }

        } catch (Exception e) {
            result.setPassed(false);
            result.setError("Execution Error: " + e.getMessage());
        }
        return result;
    }

    private String prepareJavaCode(String code, String className) {
        if (code.contains("class " + className)) {
            return code;
        }
        return code.replaceAll("public\\s+class\\s+\\w+", "public class " + className);
    }

    // Helper class to capture stdout and stderr in background threads
    private static class CommonProcessOutput {
        private final Process process;
        private final StringBuilder stdout = new StringBuilder();
        private final StringBuilder stderr = new StringBuilder();
        private Thread outThread;
        private Thread errThread;

        public CommonProcessOutput(Process process) {
            this.process = process;
        }

        public void start() {
            outThread = new Thread(() -> readStream(process.getInputStream(), stdout));
            errThread = new Thread(() -> readStream(process.getErrorStream(), stderr));
            outThread.start();
            errThread.start();
        }

        public void join() throws InterruptedException {
            if (outThread != null)
                outThread.join(1000);
            if (errThread != null)
                errThread.join(1000);
        }

        public String getStdout() {
            return stdout.toString();
        }

        public String getStderr() {
            return stderr.toString();
        }

        private void readStream(InputStream is, StringBuilder sb) {
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(is))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line).append("\n");
                }
            } catch (IOException e) {
                // Ignore
            }
        }
    }

    // --- Reflection Runner Wrapper Code ---
    // This wrapper handles parsing input arguments from stdin based on the method
    // signature
    // and printing the result to stdout.
    private static final String REFLECTION_RUNNER_SOURCE = """
            import java.lang.reflect.Method;
            import java.util.*;
            import java.io.*;
            import java.util.regex.*;

            public class ReflectionRunner {
                public static void main(String[] args) {
                    try {
                        Class<?> clazz = Class.forName("Solution");
                        Method method = null;
                        for (Method m : clazz.getDeclaredMethods()) {
                            if (m.getName().equals("solution")) { // Convention: 'solution'
                                method = m;
                                break;
                            }
                        }
                        if (method == null) {
                            // Fallback: use the first public method that returns something
                            for (Method m : clazz.getMethods()) {
                                if (m.getDeclaringClass() != Object.class && !m.getName().equals("main")) {
                                    method = m;
                                    break;
                                }
                            }
                        }

                        if (method == null) {
                            System.err.println("No solution method found in Solution class.");
                            System.exit(1);
                        }

                        Object instance = clazz.getDeclaredConstructor().newInstance();
                        Class<?>[] paramTypes = method.getParameterTypes();
                        Object[] params = new Object[paramTypes.length];

                        Scanner scanner = new Scanner(System.in);
                        scanner.useDelimiter("[,\\\\s]+");
                        // Use a custom delimiter pattern? Maybe just tokenize by whitespace unless string contains spaces.
                        // Ideally, we parse tokens based on type.

                        // Simple Parser:
                        // If type is int/long/double -> scanner.next[Type]()
                        // If type is String -> scanner.next()
                        // If type is array -> parse [a, b, c] string

                        for (int i = 0; i < paramTypes.length; i++) {
                            params[i] = parseArg(scanner, paramTypes[i]);
                        }

                        Object result = method.invoke(instance, params);
                        System.out.println("===CODEGENIE_OUTPUT_START===");
                        printResult(result);

                    } catch (Throwable e) {
                        e.printStackTrace();
                        System.exit(1);
                    }
                }

                private static Object parseArg(Scanner scanner, Class<?> type) {
                    if (type == int.class) return scanner.nextInt();
                    if (type == long.class) return scanner.nextLong();
                    if (type == double.class) return scanner.nextDouble();
                    if (type == String.class) return scanner.next();
                    if (type == int[].class) {
                        // Parse array string e.g. [1, 2, 3] or [1,2,3]
                        // Consume token. Since array might have spaces, this is tricky with simple Scanner.
                        // Assuming input format is properly spaced or we read whole remaining line?
                        // Let's assume input text provided by user matches tokens.
                        // But array inputs like `[1, 2, 3]` are often passed as single token logic if we use regex.

                         String token = scanner.findInLine(Pattern.compile("\\\\[.*\\\\]"));
                         if (token == null) token = scanner.next(); // Fallback

                         token = token.replaceAll("[\\\\[\\\\]]", "");
                         if (token.trim().isEmpty()) return new int[0];
                         String[] parts = token.split("[,\\\\s]+");
                         int[] arr = new int[parts.length];
                         for(int i=0; i<parts.length; i++) arr[i] = Integer.parseInt(parts[i].trim());
                         return arr;
                    }
                    if (type == String[].class) {
                         String token = scanner.findInLine(Pattern.compile("\\\\[.*\\\\]"));
                         if (token == null) token = scanner.next();
                         token = token.replaceAll("[\\\\[\\\\]]", "");
                         if (token.trim().isEmpty()) return new String[0];
                         return token.split("[,\\\\s]+");
                    }
                    return null;
                }

                private static void printResult(Object result) {
                    if (result == null) {
                        System.out.println("null");
                    } else if (result.getClass().isArray()) {
                        if (result instanceof int[]) System.out.println(Arrays.toString((int[]) result));
                        else if (result instanceof long[]) System.out.println(Arrays.toString((long[]) result));
                        else if (result instanceof double[]) System.out.println(Arrays.toString((double[]) result));
                        else if (result instanceof Object[]) System.out.println(Arrays.deepToString((Object[]) result));
                        else System.out.println(result); // Fallback
                    } else {
                        System.out.println(result);
                    }
                }
            }
            """;

    private void deleteDirectory(File directory) {
        File[] allContents = directory.listFiles();
        if (allContents != null) {
            for (File file : allContents) {
                deleteDirectory(file);
            }
        }
        directory.delete();
    }

    // Inner Classes
    public record ExecutionResult(boolean success, String output, String error) {
    }

    private record CompilationResult(boolean success, String output) {
    }

}
