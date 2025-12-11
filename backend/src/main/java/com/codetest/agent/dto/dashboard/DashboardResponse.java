package com.codetest.agent.dto.dashboard;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class DashboardResponse {
    private UserStatsDto userStats;
    private List<ActivityLogDto> activityLogs;
    private List<SkillTreeNodeDto> skillTree;
}
