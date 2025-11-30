package com.codetest.agent.controller;

import com.codetest.agent.dto.ExecutionRequest;
import com.codetest.agent.dto.ExecutionResponse;
import com.codetest.agent.service.CodeExecutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/execute")
@RequiredArgsConstructor
public class CodeExecutionController {

    private final CodeExecutionService executionService;

    @PostMapping
    public ResponseEntity<ExecutionResponse> executeCode(@RequestBody ExecutionRequest request) {
        ExecutionResponse response = executionService.execute(request);
        return ResponseEntity.ok(response);
    }
}
