package com.codetest.agent.dto;

import lombok.Data;

@Data
public class Example {
    private String input;
    private String output;
    private String explanation;
    @com.fasterxml.jackson.annotation.JsonProperty("isUserDefined")
    private boolean isUserDefined;
}
