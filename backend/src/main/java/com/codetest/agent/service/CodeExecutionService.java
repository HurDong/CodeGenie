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
    public ExecutionResponse execute(ExecutionRequest request) {
        String runId = UUID.randomUUID().toString();
        Path tempDir = null;
        ExecutionResponse response = new ExecutionResponse();
        response.setTestResults(new ArrayList<>());

        try {
            // 1. Prepare Workspace
            tempDir = Files.createTempDirectory("codegenie_" + runId);

            // 2. Prepare Code (Java specific)
            String finalCode = prepareJavaCode(request.getCode(), "Solution");
            Path sourcePath = tempDir.resolve("Solution.java");
            Files.writeString(sourcePath, finalCode);

            // 3. Compile
            CompilationResult compileResult = compileJava(sourcePath);
            if (!compileResult.success) {
                response.setAllPassed(false);
                response.setError("Compilation Failed:\n" + compileResult.output);
                response.setExitCode(1); // Compilation error
                return response;
            }

            // 4. Run Test Cases
            boolean allPassed = true;
            if (request.getTestCases() != null && !request.getTestCases().isEmpty()) {
                for (TestCase testCase : request.getTestCases()) {
                    TestResult result = runSingleTestCase(tempDir, "Solution", testCase);
                    response.getTestResults().add(result);
                    if (!result.isPassed()) {
                        allPassed = false;
                    }
                }
            } else {
                // If no test cases provided, just run once with empty input (or raw run)
                // This is useful for "Run" button without specific tests
                // We create a dummy result or just capture output.
                // For structure consistency, let's treat it as 1 case with empty input.
                TestResult result = runSingleTestCase(tempDir, "Solution", new TestCase("", ""));
                // Since there is no expected output, we mark passed=true or just leave as is.
                // But usually "Run" means "Check stdout".
                // Let's set passed = true for this ad-hoc case.
                result.setPassed(true);
                response.getTestResults().add(result);
                response.setOutput(result.getActualOutput()); // Set main output
            }

            response.setAllPassed(allPassed);
            response.setExitCode(0); // Success flow

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

    /**
     * Legacy/Helper Adapter for single execution.
     * Used by ChatService or simple calls.
     */
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

    private CompilationResult compileJava(Path sourcePath) throws IOException, InterruptedException {
        ProcessBuilder compileBuilder = new ProcessBuilder("javac", "-encoding", "UTF-8", sourcePath.toString());
        compileBuilder.redirectErrorStream(true);
        Process compileProcess = compileBuilder.start();

        // Close stdin to prevent hanging if process expects input
        compileProcess.getOutputStream().close();

        // Capture output in a separate thread to prevent deadlock
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

        boolean finished = compileProcess.waitFor(15000, TimeUnit.MILLISECONDS); // Increased to 15s

        if (!finished) {
            compileProcess.destroyForcibly();
            outputThread.interrupt();
            return new CompilationResult(false, "Compilation Time Limit Exceeded (15s)");
        }

        outputThread.join(1000); // Wait for reader to finish

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
            ProcessBuilder runBuilder = new ProcessBuilder("java", "-cp", tempDir.toString(), className);
            runBuilder.directory(tempDir.toFile());

            Process runProcess = runBuilder.start();

            // Write Input
            if (testCase.getInput() != null) {
                try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(runProcess.getOutputStream()))) {
                    writer.write(testCase.getInput());
                    writer.flush();
                } // Stream closed automatically
            } else {
                runProcess.getOutputStream().close();
            }

            // Capture output streams slightly differently to avoid deadlock
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

                result.setActualOutput(stdout.trim());

                if (runProcess.exitValue() != 0) {
                    result.setPassed(false);
                    result.setError("Runtime Error: " + stderr);
                } else {
                    if (testCase.getExpectedOutput() == null || testCase.getExpectedOutput().isEmpty()) {
                        result.setPassed(true);
                    } else {
                        result.setPassed(testCase.getExpectedOutput().trim().equals(stdout.trim()));
                    }
                }
            }

        } catch (Exception e) {
            result.setPassed(false);
            result.setError("Execution Error: " + e.getMessage());
        }
        return result;
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

    private String prepareJavaCode(String code, String className) {
        if (code.contains("class " + className)) {
            return code;
        }
        return code.replaceAll("public\\s+class\\s+\\w+", "public class " + className);
    }

    private void deleteDirectory(File directory) {
        File[] allContents = directory.listFiles();
        if (allContents != null) {
            for (File file : allContents) {
                deleteDirectory(file);
            }
        }
        directory.delete();
    }

    // Inner Classes / Records
    public record ExecutionResult(boolean success, String output, String error) {
    }

    private record CompilationResult(boolean success, String output) {
    }
}
