package com.codetest.agent.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExecutionResponse {
    private String output;
    private String error;
    private long executionTimeMs;
    private int exitCode;
    private java.util.List<TestResult> testResults;
    private boolean allPassed;
}
