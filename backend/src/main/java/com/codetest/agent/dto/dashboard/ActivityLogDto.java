package com.codetest.agent.dto.dashboard;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ActivityLogDto {
    private String date; // YYYY-MM-DD
    private int count; // Activity count (solved problems, etc.)
}
