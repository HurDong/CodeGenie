package com.codetest.agent.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestResult {
    private String input;
    private String expectedOutput;
    private String actualOutput;
    private boolean passed;
    private String error;
}
