package com.codetest.agent.dto;

import lombok.Data;
import java.util.List;

@Data
public class ProblemSpec {
    private String source; // RAW / BAEKJOON / PROGRAMMERS
    private String sourceId; // Problem ID (if available)
    private String title;
    private String description;
    private String inputFormat;
    private String outputFormat;
    private String constraints; // Original constraint text
    private String timeLimit; // e.g., "1 second"
    private String memoryLimit; // e.g., "128 MB"
    private List<Example> examples;
}
