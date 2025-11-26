package com.codetest.agent.controller;

import com.codetest.agent.domain.Conversation;
import com.codetest.agent.domain.Message;
import com.codetest.agent.service.ChatService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allow all for dev
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/chat/start")
    public Conversation startChat(@RequestBody StartChatRequest request) {
        return chatService.startChat(request.getMode(), request.getProblemText(), request.getUserCode());
    }

    @PostMapping("/chat/message")
    public Message sendMessage(@RequestBody SendMessageRequest request) {
        return chatService.sendMessage(request.getConversationId(), request.getContent());
    }

    @GetMapping("/history")
    public List<Conversation> getHistory() {
        return chatService.getAllConversations();
    }

    @GetMapping("/history/{id}")
    public Conversation getConversation(@PathVariable String id) {
        return chatService.getConversation(id);
    }

    @Data
    static class StartChatRequest {
        private String mode;
        private String problemText;
        private String userCode;
    }

    @Data
    static class SendMessageRequest {
        private String conversationId;
        private String content;
    }
}
