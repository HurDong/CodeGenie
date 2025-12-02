package com.codetest.agent.service;

public interface LlmService {
    String getResponse(String prompt);

    String getChatResponse(java.util.List<java.util.Map<String, Object>> messages);
}
