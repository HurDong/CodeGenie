package com.codetest.agent.dto;

import lombok.Data;
import java.util.List;

@Data
public class ProblemUnderstanding {
    private String goal;            // Core goal of the problem
    private List<KeyVar> inputs;    // Input variable names / meanings / ranges
    private String output;          // Output definition
    private Constraints constraints;
}
