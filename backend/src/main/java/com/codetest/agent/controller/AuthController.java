package com.codetest.agent.controller;

import com.codetest.agent.dto.AuthDto;
import com.codetest.agent.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthDto.AuthResponse> register(@RequestBody AuthDto.RegisterRequest request) {
        log.info("Received register request - email: {}, name: {}", request.getEmail(), request.getName());
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDto.AuthResponse> login(@RequestBody AuthDto.LoginRequest request) {
        log.info("Received login request - email: {}", request.getEmail());
        return ResponseEntity.ok(authService.login(request));
    }

    @org.springframework.web.bind.annotation.PutMapping("/profile")
    public ResponseEntity<AuthDto.AuthResponse> updateProfile(
            @RequestBody AuthDto.UpdateProfileRequest request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        log.info("Received update profile request - user: {}, name: {}, email: {}", userDetails.getUsername(),
                request.getName(), request.getEmail());
        return ResponseEntity.ok(authService.updateProfile(userDetails.getUsername(), request));
    }
}
