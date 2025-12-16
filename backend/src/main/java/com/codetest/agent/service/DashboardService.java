package com.codetest.agent.service;

import com.codetest.agent.dto.dashboard.*;
import com.codetest.agent.model.User;
import com.codetest.agent.repository.UserRepository;
import com.codetest.agent.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final ConversationRepository conversationRepository;

    public DashboardResponse getDashboardData(String email) {
        // Fetch user
        User user = userRepository.findByEmail(email).orElse(null);
        String userName = (user != null) ? user.getName() : "Developer";

        // Admin check: If user is missing or has ADMIN role, return Mock Data
        // Ideally we check authenticated user role, but for now checking the User
        // entity is fine.
        if (user == null || user.getRole() == User.Role.ADMIN) {
            return getMockDashboardData(userName);
        }

        // Real User Data Logic
        List<com.codetest.agent.domain.Conversation> conversations = conversationRepository
                .findByUserIdOrderByUpdatedAtDesc(email);

        // 1. Calculate User Stats
        // Assuming "resolved" status means solved.
        int totalSolved = (int) conversations.stream()
                .filter(c -> "resolved".equalsIgnoreCase(c.getStatus()))
                .count();

        int streakDays = calculateStreak(conversations);
        int level = calculateLevel(streakDays);

        UserStatsDto userStats = UserStatsDto.builder()
                .name(userName)
                .streakDays(streakDays)
                .totalSolved(totalSolved)
                .currentRank(calculateRank(totalSolved))
                .level(level)
                .levelTitle(getLevelTitle(level))
                .daysToNextLevel(30 - streakDays > 0 ? 30 - streakDays : 0)
                .build();

        // 2. Generate Activity Log
        List<ActivityLogDto> activityLogs = generateRealActivityLogs(conversations);

        // 3. Generate Skill Tree
        List<SkillTreeNodeDto> skillTree = generateRealSkillTree(conversations);

        return DashboardResponse.builder()
                .userStats(userStats)
                .activityLogs(activityLogs)
                .skillTree(skillTree)
                .build();
    }

    private DashboardResponse getMockDashboardData(String userName) {
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

        List<ActivityLogDto> activityLogs = generateMockActivityLogs();
        List<SkillTreeNodeDto> skillTree = generateMockSkillTree();

        return DashboardResponse.builder()
                .userStats(userStats)
                .activityLogs(activityLogs)
                .skillTree(skillTree)
                .build();
    }

    private int calculateStreak(List<com.codetest.agent.domain.Conversation> conversations) {
        if (conversations.isEmpty())
            return 0;

        List<LocalDate> activeDates = conversations.stream()
                .map(c -> c.getUpdatedAt() != null ? c.getUpdatedAt().toLocalDate() : c.getCreatedAt().toLocalDate())
                .distinct()
                .sorted((d1, d2) -> d2.compareTo(d1)) // Descending
                .collect(Collectors.toList());

        if (activeDates.isEmpty())
            return 0;

        int streak = 0;
        LocalDate checkDate = LocalDate.now();

        // Check today
        if (activeDates.contains(checkDate)) {
            streak++;
            checkDate = checkDate.minusDays(1);
        } else if (activeDates.contains(checkDate.minusDays(1))) {
            // If not today, but yesterday was active, streak is alive
            checkDate = checkDate.minusDays(1);
        } else {
            return 0; // Streak broken
        }

        // Count backwards consecutive days
        while (activeDates.contains(checkDate)) {
            streak++;
            checkDate = checkDate.minusDays(1);
        }

        // Fix: If we started by incrementing for Today, we effectively double counted
        // if we don't handle the loop carefully.
        // But the previous logic: if Today active -> streak=1, check=Yesterday. While
        // loop checks Yesterday.
        // It's correct to accumulate.
        // However, if Today NOT active but Yesterday active -> check=Yesterday. While
        // loop checks Yesterday -> streak++ -> check=DayBefore.
        // If streak was 0 initially, now it is 1. Correct.

        // Wait, if activeToday was true: streak=1. Check=Yesterday. Loop found
        // Yesterday: streak=2. Correct (Today + Yesterday).

        return streak;
    }

    private String calculateRank(int totalSolved) {
        if (totalSolved >= 100)
            return "Diamond";
        if (totalSolved >= 50)
            return "Platinum";
        if (totalSolved >= 20)
            return "Gold";
        if (totalSolved >= 10)
            return "Silver";
        return "Bronze";
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

    private List<ActivityLogDto> generateRealActivityLogs(List<com.codetest.agent.domain.Conversation> conversations) {
        java.util.Map<String, Integer> dateCounts = new java.util.HashMap<>();
        for (com.codetest.agent.domain.Conversation c : conversations) {
            LocalDate date = c.getUpdatedAt() != null ? c.getUpdatedAt().toLocalDate() : c.getCreatedAt().toLocalDate();
            String key = date.toString();
            dateCounts.put(key, dateCounts.getOrDefault(key, 0) + 1);
        }

        List<ActivityLogDto> logs = new ArrayList<>();
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusYears(1).withDayOfYear(1);
        LocalDate end = today.plusMonths(1);

        LocalDate curr = start;
        while (!curr.isAfter(end)) {
            String dStr = curr.toString();
            logs.add(ActivityLogDto.builder()
                    .date(dStr)
                    .count(dateCounts.getOrDefault(dStr, 0))
                    .build());
            curr = curr.plusDays(1);
        }
        return logs;
    }

    private List<SkillTreeNodeDto> generateRealSkillTree(List<com.codetest.agent.domain.Conversation> conversations) {
        List<SkillTreeNodeDto> tree = new ArrayList<>();

        // 1. Start Node
        tree.add(SkillTreeNodeDto.builder()
                .date("2024-01-01")
                .title("Start")
                .description("Journey Begins")
                .type("start")
                .build());

        // 2. Filter Resolved & Sort Oldest -> Newest
        List<com.codetest.agent.domain.Conversation> solvedConversations = conversations.stream()
                .filter(c -> "resolved".equalsIgnoreCase(c.getStatus()))
                .sorted((c1, c2) -> {
                    LocalDate d1 = c1.getUpdatedAt() != null ? c1.getUpdatedAt().toLocalDate()
                            : c1.getCreatedAt().toLocalDate();
                    LocalDate d2 = c2.getUpdatedAt() != null ? c2.getUpdatedAt().toLocalDate()
                            : c2.getCreatedAt().toLocalDate();
                    return d1.compareTo(d2);
                })
                .collect(Collectors.toList());

        // 3. Map to Nodes
        for (com.codetest.agent.domain.Conversation c : solvedConversations) {
            String topic = (c.getTopics() != null && !c.getTopics().isEmpty()) ? c.getTopics().get(0) : c.getCategory();
            if (topic == null)
                topic = "Coding";

            tree.add(SkillTreeNodeDto.builder()
                    .date(c.getUpdatedAt() != null ? c.getUpdatedAt().toLocalDate().toString()
                            : LocalDate.now().toString())
                    .title(c.getTitle())
                    .description(topic)
                    .type("milestone")
                    .build());
        }

        // 4. Current Node
        tree.add(SkillTreeNodeDto.builder()
                .date(LocalDate.now().toString())
                .title("Current")
                .description("Keep going!")
                .type("current")
                .build());

        return tree;
    }

    private List<ActivityLogDto> generateMockActivityLogs() {
        List<ActivityLogDto> logs = new ArrayList<>();
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusYears(1).withDayOfYear(1);
        LocalDate endDate = today.plusMonths(1);

        LocalDate current = startDate;
        Random random = new Random();

        while (!current.isAfter(endDate)) {
            if (current.isAfter(today)) {
                logs.add(ActivityLogDto.builder().date(current.toString()).count(0).build());
            } else {
                int count = (random.nextDouble() > 0.6) ? random.nextInt(5) + 1 : 0;
                logs.add(ActivityLogDto.builder().date(current.toString()).count(count).build());
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
