package com.codetest.agent.strategy.prompt;

import com.codetest.agent.domain.Conversation;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(Ordered.LOWEST_PRECEDENCE)
public class DefaultPromptStrategy implements PromptStrategy {

    @Override
    public boolean supports(String mode) {
        return true; // Fallback
    }

    @Override
    public String getSystemPrompt(Conversation conversation) {
        return "You are CodeGenie, a helpful AI coding mentor.\n" +
                "Help the user with their coding problem.\n" +
                "Answer in Korean.";
    }
}
