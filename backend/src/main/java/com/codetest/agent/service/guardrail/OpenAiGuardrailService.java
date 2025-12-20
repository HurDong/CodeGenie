package com.codetest.agent.service.guardrail;

import com.codetest.agent.service.LlmService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@Primary
@RequiredArgsConstructor
public class OpenAiGuardrailService implements GuardrailService {

    private final LlmService llmService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public ValidationResult validate(String mode, String userContent) {
        if (userContent == null || userContent.trim().isEmpty()) {
            return new ValidationResult(true, null);
        }

        // Hard-coded strict keyword block for 'Understanding' related modes
        if (mode.startsWith("understanding") &&
                (userContent.contains("반례") || userContent.contains("디버깅") || userContent.contains("에러")
                        || userContent.contains("오류"))) {
            return new ValidationResult(false,
                    "저는 **문제 파악**을 도와드리는 역할입니다. 디버깅은 **'검증 및 디버깅' > '디버깅'**, 반례는 **'반례 찾기'** 기능을 이용해주세요.");
        }

        String guardrailSystemPrompt = """
                You are a 'Mode Guardrail' for a coding mentor AI.
                Your job is to STRICTLY classify if the User's Request matches the Current Mode's allowed scope.

                [Modes, Personas, & Scopes]
                1. 'understanding' (UI Label: **문제 파악**):
                   - Identity: "저는 **문제 파악**을 도와드리는 역할입니다."
                   - Sub-tabs: **핵심 요약**, **예제 분석**, **힌트/알고리즘**.
                   - ✅ ALLOWED: Explaining problem, tracing examples, algorithm concepts.
                   - ❌ REFUSE: 'debug', 'fix', 'code', 'solution', 'counterexample'.

                2. 'solution' (UI Label: **단계별 풀이**):
                   - Identity: "저는 **단계별 풀이**를 도와드리는 역할입니다."
                   - ✅ ALLOWED: Logic flow, pseudo-code.
                   - ❌ REFUSE: Full code at once, specific error debugging.

                3. 'debugging' (UI Label: **검증 및 디버깅** > **디버깅**):
                   - Identity: "저는 **디버깅**을 도와드리는 역할입니다."
                   - ✅ ALLOWED: Fixing bugs, analyzing error logs, code correction.
                   - ❌ REFUSE: Asking for counterexamples (redirect to 'Counterexample' tab).

                4. 'counterexample' (UI Label: **검증 및 디버깅** > **반례 찾기**):
                   - Identity: "저는 **반례 찾기**를 도와드리는 역할입니다."
                   - ✅ ALLOWED: Finding inputs that break the code.
                   - ❌ REFUSE: "Debugging" (redirect to 'Debugging' tab), "Solution", "Explain Problem".

                [Refusal Rules]
                - If the request violates the mode, return {"allowed": false, "reason": "REFUSAL_TEXT"}.
                - **CRITICAL**: The refusal message MUST start with the AI's current identity.
                  - E.g., If mode is 'counterexample', start with: "저는 **반례 찾기**를 도와드리는 역할입니다."
                  - Then redirect: "디버깅은 **'검증 및 디버깅' 탭의 '디버깅'** 기능을 이용해주세요."
                - Use EXACT UI LABELS showing the path.
                - ALL OUTPUT MUST BE IN KOREAN.
                - Output JSON ONLY.

                [Example 1: Cross-Mode Refusal]
                Mode: understanding
                User: "왜 이 코드가 에러나?" (Debug request)
                Response: {"allowed": false, "reason": "저는 **문제 파악**을 도와드리는 역할입니다. 코드 에러 확인은 **'검증 및 디버깅' 탭의 '디버깅'** 기능을 이용해주세요."}

                [Example 2: Sub-Mode Refusal]
                Mode: counterexample
                User: "디버깅 해줘"
                Response: {"allowed": false, "reason": "저는 **반례 찾기**를 도와드리는 역할입니다. 디버깅은 **'검증 및 디버깅' 탭의 '디버깅'** 기능을 이용해주세요."}
                """;

        String userPrompt = String.format("Current Mode: %s\nUser Request: %s", mode, userContent);

        try {
            List<Map<String, Object>> messages = List.of(
                    Map.of("role", "system", "content", guardrailSystemPrompt),
                    Map.of("role", "user", "content", userPrompt));

            String jsonResponse = llmService.getChatResponse(messages);

            // Basic cleanup if LLM adds markdown
            if (jsonResponse.contains("```json")) {
                jsonResponse = jsonResponse.substring(jsonResponse.indexOf("```json") + 7);
                if (jsonResponse.contains("```"))
                    jsonResponse = jsonResponse.substring(0, jsonResponse.lastIndexOf("```"));
            } else if (jsonResponse.contains("```")) {
                jsonResponse = jsonResponse.substring(jsonResponse.indexOf("```") + 3);
                if (jsonResponse.contains("```"))
                    jsonResponse = jsonResponse.substring(0, jsonResponse.lastIndexOf("```"));
            }

            Map<String, Object> result = objectMapper.readValue(jsonResponse.trim(),
                    new com.fasterxml.jackson.core.type.TypeReference<>() {
                    });
            boolean allowed = (Boolean) result.get("allowed");
            String reason = (String) result.get("reason");

            return new ValidationResult(allowed, reason);

        } catch (Exception e) {
            System.err.println("Guardrail check failed: " + e.getMessage());
            // Fail safe: Allow if check fails
            return new ValidationResult(true, null);
        }
    }
}
