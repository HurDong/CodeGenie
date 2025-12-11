package com.codetest.agent.dto.dashboard;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SkillTreeNodeDto {
    private String date; // YYYY-MM-DD
    private String title;
    private String description;
    private String type; // "start", "learning", "milestone", "achievement", "challenge", "current"
    private boolean highlight;
}
