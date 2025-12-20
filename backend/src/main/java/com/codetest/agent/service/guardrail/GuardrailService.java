package com.codetest.agent.service.guardrail;

public interface GuardrailService {
    ValidationResult validate(String mode, String userContent);
}
