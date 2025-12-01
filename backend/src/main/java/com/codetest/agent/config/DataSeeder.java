package com.codetest.agent.config;

import com.codetest.agent.domain.Conversation;
import com.codetest.agent.domain.Message;
import com.codetest.agent.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Configuration
@RequiredArgsConstructor
public class DataSeeder {

    private final ConversationRepository conversationRepository;

    @Bean
    public CommandLineRunner seedData() {
        return args -> {
            if (conversationRepository.count() == 0) {
                System.out.println("🌱 Seeding initial data skipped.");
            }
        };
    }
}
