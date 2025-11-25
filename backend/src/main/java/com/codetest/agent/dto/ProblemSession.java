package com.codetest.agent.dto;

import lombok.Data;

@Data
public class ProblemSession {
    private String sessionId;
    private ProblemUnderstanding understanding;
    private String mode;        // COUNTEREXAMPLE / SOLUTION
    private String userCode;
    private long expiresAt;
}
