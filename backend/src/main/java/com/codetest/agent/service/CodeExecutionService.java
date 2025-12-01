package com.codetest.agent.service;

import com.codetest.agent.dto.ExecutionRequest;
import com.codetest.agent.dto.ExecutionResponse;
import com.codetest.agent.dto.TestCase;
import com.codetest.agent.dto.TestResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
public class CodeExecutionService {

    private static final long TIMEOUT_SECONDS = 10; // Max execution time

    public ExecutionResponse execute(ExecutionRequest request) {
        if (request.getTestCases() != null && !request.getTestCases().isEmpty()) {
            return executeWithTestCases(request);
        }

        String language = request.getLanguage().toLowerCase();
        String code = request.getCode();

        try {
            // Build Docker command with Base64 encoded code
            List<String> command = buildDockerCommand(language, code, null);

            // Execute
            ProcessResult result = runProcess(command);

            return new ExecutionResponse(result.output, result.error, result.executionTime, result.exitCode, null, true);

        } catch (Exception e) {
            log.error("Execution failed", e);
            return new ExecutionResponse("", "Internal Server Error: " + e.getMessage(), 0, -1, null, false);
        }
    }

    private ExecutionResponse executeWithTestCases(ExecutionRequest request) {
        String language = request.getLanguage().toLowerCase();
        String code = request.getCode();
        List<TestResult> results = new ArrayList<>();
        boolean allPassed = true;
        long totalTime = 0;

        for (TestCase testCase : request.getTestCases()) {
            try {
                List<String> command = buildDockerCommand(language, code, testCase.getInput());
                ProcessResult result = runProcess(command);
                totalTime += result.executionTime;

                String actualOutput = result.output.trim();
                String expectedOutput = testCase.getExpectedOutput().trim();
                boolean passed = actualOutput.equals(expectedOutput) && result.exitCode == 0;

                if (!passed) allPassed = false;

                results.add(new TestResult(
                        testCase.getInput(),
                        testCase.getExpectedOutput(),
                        actualOutput,
                        passed,
                        result.error
                ));

            } catch (Exception e) {
                log.error("Test case execution failed", e);
                results.add(new TestResult(
                        testCase.getInput(),
                        testCase.getExpectedOutput(),
                        "",
                        false,
                        "Internal Error: " + e.getMessage()
                ));
                allPassed = false;
            }
        }

        return new ExecutionResponse("", "", totalTime, 0, results, allPassed);
    }

    private static class ProcessResult {
        String output;
        String error;
        long executionTime;
        int exitCode;

        public ProcessResult(String output, String error, long executionTime, int exitCode) {
            this.output = output;
            this.error = error;
            this.executionTime = executionTime;
            this.exitCode = exitCode;
        }
    }

    private ProcessResult runProcess(List<String> command) throws IOException, InterruptedException {
        long startTime = System.currentTimeMillis();
        ProcessBuilder pb = new ProcessBuilder(command);
        pb.redirectErrorStream(false); // Keep stdout and stderr separate

        Process process = pb.start();

        String output = readStream(process.getInputStream());
        String error = readStream(process.getErrorStream());

        boolean finished = process.waitFor(TIMEOUT_SECONDS, TimeUnit.SECONDS);
        long executionTime = System.currentTimeMillis() - startTime;

        if (!finished) {
            process.destroyForcibly();
            return new ProcessResult("", "Execution timed out after " + TIMEOUT_SECONDS + "s", executionTime, -1);
        }

        return new ProcessResult(output, error, executionTime, process.exitValue());
    }

    private List<String> buildDockerCommand(String language, String code, String input) {
        String encodedCode = java.util.Base64.getEncoder().encodeToString(code.getBytes());
        String encodedInput = input != null ? java.util.Base64.getEncoder().encodeToString(input.getBytes()) : null;

        List<String> cmd = new ArrayList<>();
        cmd.add("docker");
        cmd.add("run");
        cmd.add("--rm"); // Remove container after exit
        cmd.add("--memory=128m"); // Limit memory
        cmd.add("--cpus=0.5"); // Limit CPU

        switch (language) {
            case "python":
                cmd.add("python:3.9-slim");
                cmd.add("sh");
                cmd.add("-c");
                String pyCmd = "echo \"" + encodedCode + "\" | base64 -d > script.py";
                if (encodedInput != null) {
                    pyCmd += " && echo \"" + encodedInput + "\" | base64 -d | python script.py";
                } else {
                    pyCmd += " && python script.py";
                }
                cmd.add(pyCmd);
                break;
            case "java":
                cmd.add("eclipse-temurin:17-jdk-alpine");
                cmd.add("sh");
                cmd.add("-c");
                // Decode base64 to file and run directly (Single-File Source-Code Programs)
                String javaCmd = "echo \"" + encodedCode + "\" | base64 -d > Main.java";
                if (encodedInput != null) {
                    javaCmd += " && echo \"" + encodedInput + "\" | base64 -d | java Main.java";
                } else {
                    javaCmd += " && java Main.java";
                }
                cmd.add(javaCmd);
                break;
            case "cpp":
                cmd.add("gcc:latest");
                cmd.add("sh");
                cmd.add("-c");
                // Decode base64 to file, compile and run
                String cppCmd = "echo \"" + encodedCode + "\" | base64 -d > main.cpp && g++ -o main main.cpp";
                if (encodedInput != null) {
                    cppCmd += " && echo \"" + encodedInput + "\" | base64 -d | ./main";
                } else {
                    cppCmd += " && ./main";
                }
                cmd.add(cppCmd);
                break;
            default:
                throw new IllegalArgumentException("Unsupported language: " + language);
        }

        return cmd;
    }

    private String readStream(java.io.InputStream inputStream) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))) {
            return reader.lines().collect(Collectors.joining("\n"));
        }
    }
}
