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
                request.getUserCode(), request.getTitle());
        return ApiResponse.success(conversation, "대화가 시작되었습니다.");
    }

    @PostMapping("/chat/message")
    public ResponseEntity<ApiResponse<Message>> sendMessage(@RequestBody SendMessageRequest request) {
        try {
            Message message = chatService.sendMessage(request.getConversationId(), request.getContent());
            return ResponseEntity.ok(ApiResponse.success(message));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage()));
        }
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

    @PutMapping("/chat/{id}")
    public ApiResponse<Conversation> updateConversation(@PathVariable String id,
            @RequestBody UpdateConversationRequest request) {
        Conversation conversation = chatService.updateConversation(id, request.getProblemText(), request.getUserCode(),
                request.getCodeLanguage(), request.getProblemSpec(), request.getPlatform(), request.getProblemUrl(),
                request.getTitle());
        return ApiResponse.success(conversation, "대화 정보가 업데이트되었습니다.");
    }

    @Data
    static class StartChatRequest {
        private String mode;
        private String problemText;
        private String userCode;
        private String title;
    }

    @Data
    static class SendMessageRequest {
        private String conversationId;
        private String content;
    }

    @Data
    static class UpdateConversationRequest {
        private String problemText;
        private String userCode;
        private String codeLanguage;
        private com.codetest.agent.dto.ProblemSpec problemSpec;
        private String platform;
        private String problemUrl;
        private String title;
    }
}
