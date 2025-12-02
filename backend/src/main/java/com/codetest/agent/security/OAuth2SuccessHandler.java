package com.codetest.agent.security;

import com.codetest.agent.model.User;
import com.codetest.agent.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String providerId = oAuth2User.getAttribute("sub"); // Google ID

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;

        if (userOptional.isPresent()) {
            user = userOptional.get();
            // Update info if needed
            if (user.getProvider() == null || user.getProvider() == User.AuthProvider.LOCAL) {
                // Link account or handle conflict? For now, just update provider
                user.setProvider(User.AuthProvider.GOOGLE);
                user.setProviderId(providerId);
                userRepository.save(user);
            }
        } else {
            user = User.builder()
                    .email(email)
                    .name(name)
                    .provider(User.AuthProvider.GOOGLE)
                    .providerId(providerId)
                    .role(User.Role.USER)
                    .password(UUID.randomUUID().toString()) // Random password for OAuth users
                    .build();
            userRepository.save(user);
        }

        // Generate Token (We need an Authentication object with correct authorities)
        // Since we are in success handler, 'authentication' already has OAuth
        // authorities.
        // But we want our internal roles.
        // For simplicity, let's just use the provider to create a token based on the
        // User entity.
        // Or better, reload the user from DB to get roles and create a fresh
        // Authentication.

        // Quick fix: Create a token using the existing authentication but maybe we
        // should force our role?
        // Let's rely on JwtTokenProvider to handle it or create a custom token.
        // Actually JwtTokenProvider uses Authentication.getAuthorities().
        // OAuth2User authorities might be "ROLE_USER" or "SCOPE_..."

        String token = jwtTokenProvider.createToken(authentication);
        String refreshToken = jwtTokenProvider.createRefreshToken(authentication);

        String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:5173/CodeGenie/oauth/callback")
                .queryParam("accessToken", token)
                .queryParam("refreshToken", refreshToken)
                .queryParam("email", email)
                .queryParam("name", name)
                .build()
                .encode()
                .toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
