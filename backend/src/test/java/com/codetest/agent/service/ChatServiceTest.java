package com.codetest.agent.service;

import com.codetest.agent.domain.Conversation;
import com.codetest.agent.domain.Message;
import com.codetest.agent.repository.ConversationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ChatServiceTest {

    @Mock
    private ConversationRepository conversationRepository;

    @Mock
    private LlmService llmService;

    @InjectMocks
    private ChatService chatService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void startChat_ShouldCreateNewConversation() {
        // Given
        String mode = "SOLUTION";
        String problem = "Test Problem";
        String code = "Test Code";

        when(conversationRepository.save(any(Conversation.class))).thenAnswer(i -> i.getArguments()[0]);

        // When
        Conversation result = chatService.startChat(mode, problem, code, null);

        // Then
        assertNotNull(result.getId());
        assertEquals(mode, result.getMode());
        assertEquals(1, result.getMessages().size());
        assertEquals("assistant", result.getMessages().get(0).getRole());
        verify(conversationRepository).save(any(Conversation.class));
    }

    @Test
    void sendMessage_ShouldUpdateConversationAndReturnAiResponse() {
        // Given
        String convId = UUID.randomUUID().toString();
        Conversation conversation = new Conversation();
        conversation.setId(convId);
        conversation.setMode("SOLUTION");

        when(conversationRepository.findById(convId)).thenReturn(Optional.of(conversation));
        when(llmService.getResponse(anyString())).thenReturn("AI Response");
        when(conversationRepository.save(any(Conversation.class))).thenAnswer(i -> i.getArguments()[0]);

        // When
        Message response = chatService.sendMessage(convId, "User Message");

        // Then
        assertEquals("assistant", response.getRole());
        assertEquals("AI Response", response.getContent());
        assertEquals(2, conversation.getMessages().size()); // User + AI
        verify(conversationRepository).save(conversation);
    }
}
