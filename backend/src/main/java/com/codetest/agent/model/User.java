package com.codetest.agent.model;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@Document(collection = "users")
public class User {
    @Id
    private String id;

    private String email;
    private String password; // Encrypted
    private String name;

    private AuthProvider provider;
    private String providerId; // Google sub, etc.

    private Role role;

    public enum AuthProvider {
        LOCAL, GOOGLE
    }

    public enum Role {
        USER, ADMIN
    }
}
