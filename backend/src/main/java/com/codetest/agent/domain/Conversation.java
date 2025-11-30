package com.codetest.agent.domain;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "conversations")
public class Conversation {
    @Id
    private String id;
    private String title;
    private String mode; // SOLUTION, COUNTEREXAMPLE, UNDERSTANDING
    private String problemText;
    private String userCode;
    private String codeLanguage;
    private String platform; // baekjoon, programmers
    private String problemUrl;
    private com.codetest.agent.dto.ProblemSpec problemSpec;
    private String status; // ongoing, resolved
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<Message> messages = new ArrayList<>();
}
