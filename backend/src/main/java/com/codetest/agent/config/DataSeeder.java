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
                System.out.println("🌱 Seeding initial data...");

                Conversation c1 = new Conversation();
                c1.setId(UUID.randomUUID().toString());
                c1.setTitle("알고리즘 복잡도 분석");
                c1.setMode("SOLUTION");
                c1.setProblemText("배열에서 최댓값을 찾는 문제입니다.");
                c1.setUserCode("function findMax(arr) { return Math.max(...arr); }");
                c1.setStatus("resolved");
                c1.setCreatedAt(LocalDateTime.now().minusDays(1));
                c1.setUpdatedAt(LocalDateTime.now().minusDays(1));
                c1.setMessages(List.of(
                        new Message("assistant", "안녕하세요! 알고리즘 복잡도에 대해 궁금하신가요?", LocalDateTime.now().minusDays(1)),
                        new Message("user", "네, 빅오 표기법이 헷갈려요.", LocalDateTime.now().minusDays(1)),
                        new Message("assistant", "빅오 표기법은 알고리즘의 효율성을 나타내는 지표입니다.", LocalDateTime.now().minusDays(1))));

                Conversation c2 = new Conversation();
                c2.setId(UUID.randomUUID().toString());
                c2.setTitle("React 상태관리 질문");
                c2.setMode("UNDERSTANDING");
                c2.setStatus("ongoing");
                c2.setCreatedAt(LocalDateTime.now().minusHours(2));
                c2.setUpdatedAt(LocalDateTime.now().minusHours(2));
                c2.setMessages(List.of(
                        new Message("assistant", "React 상태관리에 대해 도와드릴까요?", LocalDateTime.now().minusHours(2)),
                        new Message("user", "Redux랑 Context API 차이가 뭐야?", LocalDateTime.now().minusHours(2))));

                conversationRepository.saveAll(List.of(c1, c2));
                System.out.println("✅ Data seeding completed.");
            }
        };
    }
}
