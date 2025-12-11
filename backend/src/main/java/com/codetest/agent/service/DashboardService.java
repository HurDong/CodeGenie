package com.codetest.agent.service;

import com.codetest.agent.dto.dashboard.*;
import com.codetest.agent.model.User;
import com.codetest.agent.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;

    public DashboardResponse getDashboardData(String email) {
        // Fetch user
        User user = userRepository.findByEmail(email).orElse(null);
        String userName = (user != null) ? user.getName() : "Developer";

        // 1. Calculate User Stats (Mock Logic)
        int streakDays = 12; // Mock
        int totalSolved = 142; // Mock
        int level = calculateLevel(streakDays);

        UserStatsDto userStats = UserStatsDto.builder()
                .name(userName)
                .streakDays(streakDays)
                .totalSolved(totalSolved)
                .currentRank("Gold I")
                .level(level)
                .levelTitle(getLevelTitle(level))
                .daysToNextLevel(30 - streakDays)
                .build();

        // 2. Generate Activity Bundle (Calendar Data)
        List<ActivityLogDto> activityLogs = generateMockActivityLogs();

        // 3. Generate Skill Tree Data
        List<SkillTreeNodeDto> skillTree = generateMockSkillTree();

        return DashboardResponse.builder()
                .userStats(userStats)
                .activityLogs(activityLogs)
                .skillTree(skillTree)
                .build();
    }

    private int calculateLevel(int streak) {
        if (streak >= 30)
            return 5;
        if (streak >= 14)
            return 4;
        if (streak >= 7)
            return 3;
        if (streak >= 3)
            return 2;
        return 1;
    }

    private String getLevelTitle(int level) {
        switch (level) {
            case 5:
                return "God of Genie";
            case 4:
                return "Grandmaster";
            case 3:
                return "Sorcerer";
            case 2:
                return "Apprentice";
            default:
                return "Novice";
        }
    }

    private List<ActivityLogDto> generateMockActivityLogs() {
        List<ActivityLogDto> logs = new ArrayList<>();
        LocalDate today = LocalDate.now();
        // Generate data for the last 2 years + future (similar to frontend logic)
        // Frontend logic generates on the fly based on random. Let's provide stable
        // data.
        LocalDate startDate = today.minusYears(1).withDayOfYear(1);
        LocalDate endDate = today.plusMonths(1);

        LocalDate current = startDate;
        Random random = new Random();

        while (!current.isAfter(endDate)) {
            if (current.isAfter(today)) {
                // Future: 0 count
                logs.add(ActivityLogDto.builder()
                        .date(current.toString())
                        .count(0)
                        .build());
            } else {
                int count = 0;
                // Randomly populate
                if (random.nextDouble() > 0.6) {
                    count = random.nextInt(5) + 1;
                }
                logs.add(ActivityLogDto.builder()
                        .date(current.toString())
                        .count(count)
                        .build());
            }
            current = current.plusDays(1);
        }
        return logs;
    }

    private List<SkillTreeNodeDto> generateMockSkillTree() {
        return List.of(
                SkillTreeNodeDto.builder().date("2024-01-10").title("Start").description("Hello World!").type("start")
                        .build(),
                SkillTreeNodeDto.builder().date("2024-01-12").title("Variables").description("기초 다지기").type("learning")
                        .build(),
                SkillTreeNodeDto.builder().date("2024-01-15").title("Conditionals").description("if/else")
                        .type("learning").build(),
                SkillTreeNodeDto.builder().date("2024-01-20").title("Loops").description("반복문").type("learning")
                        .build(),
                SkillTreeNodeDto.builder().date("2024-02-01").title("Arrays").description("데이터 구조").type("learning")
                        .build(),
                SkillTreeNodeDto.builder().date("2024-02-14").title("Functions").description("함수화").type("milestone")
                        .build(),
                SkillTreeNodeDto.builder().date("2024-02-20").title("Silver Rank").description("알고리즘 해결")
                        .type("achievement").highlight(true).build(),
                SkillTreeNodeDto.builder().date("2024-03-01").title("DP").description("동적계획법").type("challenge")
                        .build(),
                SkillTreeNodeDto.builder().date("2024-03-10").title("Current").description("성장 중 🚀").type("current")
                        .build());
    }
}
