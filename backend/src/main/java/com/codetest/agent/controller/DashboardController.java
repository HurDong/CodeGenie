package com.codetest.agent.controller;

import com.codetest.agent.dto.dashboard.DashboardResponse;
import com.codetest.agent.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {
        // userDetails.getUsername() returns the email based on AuthService
        // implementation
        String email = userDetails.getUsername();
        log.info("Fetching dashboard data for user: {}", email);
        return ResponseEntity.ok(dashboardService.getDashboardData(email));
    }
}
