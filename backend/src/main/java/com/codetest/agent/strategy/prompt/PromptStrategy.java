package com.codetest.agent.strategy.prompt;

import com.codetest.agent.domain.Conversation;

public interface PromptStrategy {
    String getSystemPrompt(Conversation conversation);

    boolean supports(String mode);
}
