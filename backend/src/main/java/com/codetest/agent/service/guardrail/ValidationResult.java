package com.codetest.agent.service.guardrail;

public record ValidationResult(boolean allowed, String refusalMessage) {
}
