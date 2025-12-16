package com.codetest.agent.dto.dashboard;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserStatsDto {
    private String name;
    private int streakDays;
    private int totalSolved;
    private String currentTier; // e.g., "Gold I"
    private int level; // 1-5
    private String levelTitle; // e.g., "Novice", "God of Genie"
    private int daysToNextLevel; // e.g., 18
}
