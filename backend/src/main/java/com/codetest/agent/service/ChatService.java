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

    public Conversation startChat(String mode, String problemText, String userCode, String title, String userId) {
        Conversation conversation = new Conversation();
        conversation.setId(UUID.randomUUID().toString());
        conversation.setUserId(userId);
        if (title != null && !title.isEmpty()) {
            conversation.setTitle(title);
        } else {
            conversation.setTitle("새로운 대화 (" + mode + ")");
        }
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
        // AI Response
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("Mode: ").append(conversation.getMode()).append("\n");

        if (conversation.getProblemSpec() != null) {
            com.codetest.agent.dto.ProblemSpec spec = conversation.getProblemSpec();
            promptBuilder.append("[Problem Info]\n");
            promptBuilder.append("Title: ").append(spec.getTitle()).append("\n");
            if (spec.getTimeLimit() != null)
                promptBuilder.append("Time Limit: ").append(spec.getTimeLimit()).append("\n");
            if (spec.getMemoryLimit() != null)
                promptBuilder.append("Memory Limit: ").append(spec.getMemoryLimit()).append("\n");
            promptBuilder.append("Description:\n").append(spec.getDescription()).append("\n");
            if (spec.getInputFormat() != null)
                promptBuilder.append("Input Format:\n").append(spec.getInputFormat()).append("\n");
            if (spec.getOutputFormat() != null)
                promptBuilder.append("Output Format:\n").append(spec.getOutputFormat()).append("\n");
            if (spec.getConstraints() != null)
                promptBuilder.append("Constraints:\n").append(spec.getConstraints()).append("\n");
            if (spec.getExamples() != null && !spec.getExamples().isEmpty()) {
                promptBuilder.append("Examples:\n");
                for (com.codetest.agent.dto.Example ex : spec.getExamples()) {
                    promptBuilder.append("Input: ").append(ex.getInput()).append("\n");
                    promptBuilder.append("Output: ").append(ex.getOutput()).append("\n");
                }
            }
        } else {
            promptBuilder.append("Problem: ").append(conversation.getProblemText()).append("\n");
        }

        promptBuilder.append("Code: ").append(conversation.getUserCode()).append("\n");
        promptBuilder.append("User: ").append(content);

        String prompt = promptBuilder.toString();

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

    public List<Conversation> getConversationsByUserId(String userId) {
        return conversationRepository.findByUserIdOrderByUpdatedAtDesc(userId);
    }

    public Conversation getConversation(String id) {
        return conversationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
    }

    public Conversation updateConversation(String id, String problemText, String userCode, String codeLanguage,
            com.codetest.agent.dto.ProblemSpec problemSpec, String platform, String problemUrl, String title) {
        Conversation conversation = getConversation(id);
        if (problemText != null)
            conversation.setProblemText(problemText);
        if (userCode != null)
            conversation.setUserCode(userCode);
        if (codeLanguage != null)
            conversation.setCodeLanguage(codeLanguage);
        if (problemSpec != null)
            conversation.setProblemSpec(problemSpec);
        if (platform != null)
            conversation.setPlatform(platform);
        if (problemUrl != null)
            conversation.setProblemUrl(problemUrl);
        if (title != null)
            conversation.setTitle(title);
        conversation.setUpdatedAt(LocalDateTime.now());
        return conversationRepository.save(conversation);
    }

    public void deleteConversation(String id) {
        conversationRepository.deleteById(id);
    }
}
