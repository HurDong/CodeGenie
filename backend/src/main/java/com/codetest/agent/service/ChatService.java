package com.codetest.agent.service;

import com.codetest.agent.domain.Conversation;
import com.codetest.agent.domain.Message;
import com.codetest.agent.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final LlmService llmService;

    public Conversation startChat(String mode, String problemText, String userCode) {
        Conversation conversation = new Conversation();
        conversation.setId(UUID.randomUUID().toString());
        conversation.setTitle("새로운 대화 (" + mode + ")");
        conversation.setMode(mode);
        conversation.setProblemText(problemText);
        conversation.setUserCode(userCode);
        conversation.setStatus("ongoing");
        conversation.setCreatedAt(LocalDateTime.now());
        conversation.setUpdatedAt(LocalDateTime.now());

        // Initial greeting
        String greeting = "안녕하세요! " + mode + " 모드로 도와드리겠습니다.";
        conversation.getMessages().add(new Message("assistant", greeting, LocalDateTime.now()));

        return conversationRepository.save(conversation);
    }

    public Message sendMessage(String conversationId, String content) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        // User message
        Message userMessage = new Message("user", content, LocalDateTime.now());
        conversation.getMessages().add(userMessage);

        // AI Response
        String prompt = "Mode: " + conversation.getMode() + "\n" +
                "Problem: " + conversation.getProblemText() + "\n" +
                "Code: " + conversation.getUserCode() + "\n" +
                "User: " + content;

        String aiResponseContent = llmService.getResponse(prompt);
        Message aiMessage = new Message("assistant", aiResponseContent, LocalDateTime.now());
        conversation.getMessages().add(aiMessage);

        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        return aiMessage;
    }

    public List<Conversation> getAllConversations() {
        return conversationRepository.findAllByOrderByUpdatedAtDesc();
    }

    public Conversation getConversation(String id) {
        return conversationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
    }
}
