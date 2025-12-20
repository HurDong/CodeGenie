package com.codetest.agent.strategy.prompt;

import com.codetest.agent.domain.Conversation;
import org.springframework.stereotype.Component;

@Component
public class CounterexamplePromptStrategy implements PromptStrategy {

    @Override
    public boolean supports(String mode) {
        return "counterexample".equalsIgnoreCase(mode);
    }

    @Override
    public String getSystemPrompt(Conversation conversation) {
        String source = null;
        if (conversation.getProblemSpec() != null) {
            source = conversation.getProblemSpec().getSource();
        }

        if ("PROGRAMMERS".equalsIgnoreCase(source)) {
            return "You are a 'Test Case Generator' for Programmers problems.\n" +
                    "The user wants to verify their code against counterexamples. Code runs as a Solution class method.\n"
                    +
                    "Your goal is to generate 5 robust test cases in JSON format.\n" +
                    "[Process]\n" +
                    "1. **Analyze Function Signature**: Identify the parameters from the problem description.\n" +
                    "2. **Draft 5 Inputs**: 1 Basic, 2 Edge, 2 Random. \n" +
                    "   - Format: Inputs must be comma-separated values matching the function arguments.\n" +
                    "   - Example for solution(int n, int k): \"10, 3\"\n" +
                    "   - Example for solution(int[] arr): \"[1, 2, 3]\"\n" +
                    "3. **Compute Correct Output**: For the constructed input.\n" +
                    "4. Output STRICT JSON only. No markdown.\n" +
                    "\n" +
                    "[JSON Format]\n" +
                    "[\n" +
                    "  {\"input\": \"10, 3\", \"expected\": \"20480\"}, \n" +
                    "  {\"input\": \"5, 0\", \"expected\": \"0\"}\n" +
                    "]\n" +
                    "(Note: Do NOT include Test Case Count (T). Just the parameter values.)";
        } else {
            return "You are a 'Test Case Generator'.\n" +
                    "The user wants to verify their code against counterexamples.\n" +
                    "Your goal is to generate 5 robust test cases in JSON format.\n" +
                    "[Process]\n" +
                    "1. **Analyze Input Format**: Check if the problem requires a 'Test Case Count' (T) at the start.\n"
                    +
                    "   - If YES (e.g., 'First line is T'), your 'input' string MUST start with '1\\n' (representing 1 test case) followed by the actual input.\n"
                    +
                    "   - Failing to do this will cause `NoSuchElementException` in user code.\n" +
                    "2. **Draft 5 Inputs**: 1 Basic, 2 Edge, 2 Random.\n" +
                    "3. **Compute Correct Output**: For the constructed input.\n" +
                    "4. Output STRICT JSON only. No markdown.\n" +
                    "\n" +
                    "[JSON Format]\n" +
                    "[\n" +
                    "  {\"input\": \"1\\n5\", \"expected\": \"44\"}, \n" +
                    "  {\"input\": \"1\\n1\", \"expected\": \"1\"}\n" +
                    "]\n" +
                    "(Note: If problem does NOT ask for T, just send \"5\" or \"1\".)\n" +
                    "\n" +
                    "5. **Role Enforcement**: If the user asks for 'Hint', 'Solution', or 'Help', DO NOT generate JSON.\n"
                    +
                    "   - Instead, output EXACTLY: \"저는 반례 생성 전문가입니다. 힌트나 풀이는 해당 탭을 이용해주세요.\"";
        }
    }
}
