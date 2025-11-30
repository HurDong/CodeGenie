package com.codetest.agent.service;

import com.codetest.agent.dto.ExecutionRequest;
import com.codetest.agent.dto.ExecutionResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
public class CodeExecutionService {

    private static final String TEMP_DIR = System.getProperty("java.io.tmpdir");
    private static final long TIMEOUT_SECONDS = 10; // Max execution time

    public ExecutionResponse execute(ExecutionRequest request) {
        String language = request.getLanguage().toLowerCase();
        String code = request.getCode();

        try {
            // Build Docker command with Base64 encoded code
            List<String> command = buildDockerCommand(language, code);

            // Execute
            long startTime = System.currentTimeMillis();
            ProcessBuilder pb = new ProcessBuilder(command);
            pb.redirectErrorStream(false); // Keep stdout and stderr separate

            Process process = pb.start();

            // Read output
            String output = readStream(process.getInputStream());
            String error = readStream(process.getErrorStream());

            boolean finished = process.waitFor(TIMEOUT_SECONDS, TimeUnit.SECONDS);
            long executionTime = System.currentTimeMillis() - startTime;

            if (!finished) {
                process.destroyForcibly();
                return new ExecutionResponse("", "Execution timed out after " + TIMEOUT_SECONDS + "s", executionTime,
                        -1);
            }

            int exitCode = process.exitValue();

            return new ExecutionResponse(output, error, executionTime, exitCode);

        } catch (Exception e) {
            log.error("Execution failed", e);
            return new ExecutionResponse("", "Internal Server Error: " + e.getMessage(), 0, -1);
        }
    }

    private List<String> buildDockerCommand(String language, String code) {
        String encodedCode = java.util.Base64.getEncoder().encodeToString(code.getBytes());
        List<String> cmd = new ArrayList<>();
        cmd.add("docker");
        cmd.add("run");
        cmd.add("--rm"); // Remove container after exit
        cmd.add("--memory=128m"); // Limit memory
        cmd.add("--cpus=0.5"); // Limit CPU

        // No volume mount needed anymore!

        switch (language) {
            case "python":
                cmd.add("python:3.9-slim");
                cmd.add("sh");
                cmd.add("-c");
                // Decode base64 to file and run
                cmd.add("echo \"" + encodedCode + "\" | base64 -d > script.py && python script.py");
                break;
            case "java":
                cmd.add("eclipse-temurin:17-jdk-alpine");
                cmd.add("sh");
                cmd.add("-c");
                // Decode base64 to file and run directly (Single-File Source-Code Programs)
                cmd.add("echo \"" + encodedCode + "\" | base64 -d > Main.java && java Main.java");
                break;
            case "cpp":
                cmd.add("gcc:latest");
                cmd.add("sh");
                cmd.add("-c");
                // Decode base64 to file, compile and run
                cmd.add("echo \"" + encodedCode + "\" | base64 -d > main.cpp && g++ -o main main.cpp && ./main");
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
