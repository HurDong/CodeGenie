package com.codetest.agent.controller;

import com.codetest.agent.domain.Conversation;
import com.codetest.agent.domain.Message;
import com.codetest.agent.dto.ApiResponse;
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
    public ApiResponse<Conversation> startChat(@RequestBody StartChatRequest request) {
        Conversation conversation = chatService.startChat(request.getMode(), request.getProblemText(),
                request.getUserCode());
        return ApiResponse.success(conversation, "대화가 시작되었습니다.");
    }

    @PostMapping("/chat/message")
    public ApiResponse<Message> sendMessage(@RequestBody SendMessageRequest request) {
        Message message = chatService.sendMessage(request.getConversationId(), request.getContent());
        return ApiResponse.success(message);
    }

    @GetMapping("/history")
    public ApiResponse<List<Conversation>> getHistory() {
        List<Conversation> history = chatService.getAllConversations();
        return ApiResponse.success(history);
    }

    @GetMapping("/history/{id}")
    public ApiResponse<Conversation> getConversation(@PathVariable String id) {
        Conversation conversation = chatService.getConversation(id);
        return ApiResponse.success(conversation);
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
