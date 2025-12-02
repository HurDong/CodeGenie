package com.codetest.agent;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CodeGenieApplication {

    public static void main(String[] args) {
        SpringApplication.run(CodeGenieApplication.class, args);
    }

    @org.springframework.context.annotation.Bean
    public org.springframework.boot.CommandLineRunner commandLineRunner(org.springframework.core.env.Environment env) {
        return args -> {
            String clientId = env.getProperty("GOOGLE_CLIENT_ID");
            System.out.println("==================================================");
            System.out.println("Loaded GOOGLE_CLIENT_ID: " + clientId);
            System.out.println("==================================================");
        };
    }

}
