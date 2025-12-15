package com.codetest.agent.service;

import com.codetest.agent.domain.Conversation;
import com.codetest.agent.domain.Message;
import com.codetest.agent.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final LlmService llmService;
    private final CodeExecutionService codeExecutionService; // Newly added
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();

    public Conversation startChat(String mode, String problemText, String userCode, String title, String userId) {
        Conversation conversation = new Conversation();
        conversation.setId(UUID.randomUUID().toString());
        conversation.setUserId(userId);
        if (title != null && !title.isEmpty()) {
            conversation.setTitle(title);
        } else {
            conversation.setTitle("새로운 대화 (" + mode + ")");
        }
        conversation.setMode(mode);
        conversation.setProblemText(problemText);
        conversation.setUserCode(userCode);
        conversation.setStatus("ongoing");
        conversation.setCreatedAt(LocalDateTime.now());
        conversation.setUpdatedAt(LocalDateTime.now());

        // Initial greeting
        String greeting = "안녕하세요! " + mode + " 모드로 도와드리겠습니다.";
        conversation.getMessages().add(new Message("assistant", greeting, LocalDateTime.now()));

        if ("solution".equalsIgnoreCase(mode)) {
            conversation.setStrategy("1. Understand Input -> 2. Design Algorithm -> 3. Implement -> 4. Review");
        }

        return conversationRepository.save(conversation);
    }

    public Message sendMessage(String conversationId, String content) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        // User message
        Message userMessage = new Message("user", content, LocalDateTime.now());
        conversation.getMessages().add(userMessage);

        // Build Chat Messages
        List<Map<String, Object>> messages = new ArrayList<>();

        // 1. System Prompt
        String systemPrompt = getSystemPrompt(conversation.getMode());
        if ("solution".equalsIgnoreCase(conversation.getMode()) && conversation.getStrategy() != null) {
            systemPrompt += "\n\n[CURRENT STRATEGY ANCHOR]\n" +
                    "Your agreed-upon strategy is: \"" + conversation.getStrategy() + "\"\n" +
                    "1. Follow this roadmap.\n" +
                    "2. If the user suggests a valid alternative, YOU MUST update the strategy by appending this tag at the end of your response:\n"
                    +
                    "   `[UPDATE_STRATEGY: New Strategy Steps...]`\n" +
                    "3. If the user's suggestion is invalid, explain why and stick to the current strategy.";
        }
        messages.add(Map.of("role", "system", "content", systemPrompt));

        // 2. Context (Problem & Code)
        String context = buildContextString(conversation);
        if (!context.isEmpty()) {
            messages.add(Map.of("role", "user", "content", "Context Info:\n" + context));
        }

        // 3. History (Sliding Window: Last 10 messages)
        int maxHistory = 10;
        List<Message> allMessages = conversation.getMessages();
        int start = Math.max(0, allMessages.size() - maxHistory);

        for (int i = start; i < allMessages.size(); i++) {
            Message msg = allMessages.get(i);
            if (msg.getContent() != null) {
                messages.add(Map.of("role", msg.getRole(), "content", msg.getContent()));
            }
        }

        String aiResponseContent;

        // [Logic Branch] If Counterexample mode -> Use Execution-Guided Verification
        if ("counterexample".equalsIgnoreCase(conversation.getMode())) {
            aiResponseContent = handleCounterexampleLoop(conversation, messages);
        } else {
            // Default: Standard LLM call
            aiResponseContent = llmService.getChatResponse(messages);
        }

        // [Strategy Anchor] Detect and update strategy
        if (conversation.getMode().equalsIgnoreCase("solution") && aiResponseContent.contains("[UPDATE_STRATEGY:")) {
            try {
                int startIdx = aiResponseContent.indexOf("[UPDATE_STRATEGY:");
                int endIdx = aiResponseContent.indexOf("]", startIdx);
                if (endIdx > startIdx) {
                    String newStrategy = aiResponseContent.substring(startIdx + 17, endIdx).trim();
                    conversation.setStrategy(newStrategy);
                    // Remove the hidden tag from the message shown to user
                    aiResponseContent = aiResponseContent.substring(0, startIdx)
                            + aiResponseContent.substring(endIdx + 1);
                }
            } catch (Exception e) {
                System.err.println("Failed to parse strategy update: " + e.getMessage());
            }
        }

        Message aiMessage = new Message("assistant", aiResponseContent.trim(), LocalDateTime.now());
        conversation.getMessages().add(aiMessage);

        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        return aiMessage;
    }

    public String generateCodeTemplate(com.codetest.agent.dto.ProblemSpec spec, String language) {
        String langInstruction = "";
        String exampleOutput = "";

        if ("c".equalsIgnoreCase(language)) {
            langInstruction = """
                    Generate a C 'solution' function.
                    Include necessary headers like <stdio.h>, <stdbool.h>, <stdlib.h>.
                    Infer return type and parameters.
                    """;
            exampleOutput = """
                    #include <stdio.h>
                    #include <stdbool.h>
                    #include <stdlib.h>

                    int solution(int num1, int num2) {
                        int answer = 0;
                        return answer;
                    }
                    """;
        } else if ("cpp".equalsIgnoreCase(language) || "c++".equalsIgnoreCase(language)) {
            langInstruction = """
                    Generate a C++ 'solution' function.
                    Include <string>, <vector> and 'using namespace std;'.
                    Infer return type and parameters.
                    """;
            exampleOutput = """
                    #include <string>
                    #include <vector>

                    using namespace std;

                    int solution(int num1, int num2) {
                        int answer = 0;
                        return answer;
                    }
                    """;
        } else {
            // Default to Java
            langInstruction = """
                    Generate a Java class named 'Solution'.
                    Inside, define a public method named 'solution'.
                    Infer the correct return type and parameter types based on description.
                    """;
            exampleOutput = """
                    class Solution {
                        public int solution(int n) {
                            int answer = 0;
                            return answer;
                        }
                    }
                    """;
        }

        String prompt = String.format("""
                You are a coding expert.
                The user needs a solution code template for a coding problem in %s.

                Problem Title: %s
                Description: %s
                Input Format: %s
                Output Format: %s

                Task:
                %s

                Output ONLY the valid code. Do NOT include any markdown code blocks (```), explanations, or comments.
                Just the raw code.

                Example Output:
                %s
                """,
                language,
                spec.getTitle(),
                spec.getDescription(),
                spec.getInputFormat(),
                spec.getOutputFormat(),
                langInstruction,
                exampleOutput);

        List<Map<String, Object>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content",
                "You are a code generator. Output only raw code without markdown formatting."));
        messages.add(Map.of("role", "user", "content", prompt));

        return llmService.getChatResponse(messages).trim();
    }

    private String handleCounterexampleLoop(Conversation conversation, List<Map<String, Object>> messages) {
        // 1. Get JSON Test Cases from LLM
        String rawJson = llmService.getChatResponse(messages);

        // Sanitize JSON (sometimes LLM wraps it in markdown code blocks)
        String jsonContent = rawJson;
        if (jsonContent.contains("```json")) {
            jsonContent = jsonContent.substring(jsonContent.indexOf("```json") + 7);
            if (jsonContent.contains("```")) {
                jsonContent = jsonContent.substring(0, jsonContent.lastIndexOf("```"));
            }
        } else if (jsonContent.contains("```")) {
            jsonContent = jsonContent.substring(jsonContent.indexOf("```") + 3);
            if (jsonContent.contains("```")) {
                jsonContent = jsonContent.substring(0, jsonContent.lastIndexOf("```"));
            }
        }
        jsonContent = jsonContent.trim();

        try {
            // 2. Parse Test Cases
            List<Map<String, String>> testCases = objectMapper.readValue(jsonContent,
                    new com.fasterxml.jackson.core.type.TypeReference<>() {
                    });

            // 3. Execute & Verify
            StringBuilder report = new StringBuilder();
            boolean foundCounterexample = false;

            for (Map<String, String> testCase : testCases) {
                String input = testCase.get("input");
                String expected = testCase.get("expected");

                CodeExecutionService.ExecutionResult result = codeExecutionService.runCode(conversation.getUserCode(),
                        input, "java");

                if (!result.success()) {
                    // Compilation or Runtime Error
                    return "❌ **실행 오류 발생 (Execution Error)**\n\n" +
                            "코드 실행 중 오류가 발생했습니다:\n" +
                            "```\n" + result.error() + "\n```";
                }

                String actual = result.output();
                if (!expected.trim().equals(actual.trim())) {
                    // Counterexample Found!
                    foundCounterexample = true;
                    report.append("❌ **반례 발견 (Counterexample Found)!**\n\n")
                            .append("**입력 (Input)**: `").append(input).append("`\n")
                            .append("**예상 결과 (Expected)**: `").append(expected).append("`\n")
                            .append("**실제 실행 결과 (Actual Execution)**: `").append(actual).append("`\n")
                            .append("**이유**: 서버에서 실제 코드를 실행한 결과, 예상 값과 다릅니다.");
                    break;
                }
            }

            if (!foundCounterexample) {
                report.append("✅ **검증 통과 (Verification Passed)!**\n\n")
                        .append("LLM이 생성한 5개의 테스트 케이스(Edge Case 포함)를 실제 서버에서 돌려본 결과, 모두 정답과 일치합니다.\n")
                        .append("작성하신 로직은 현재 검증 범위 내에서 올바릅니다.");
            }

            return report.toString();

        } catch (Exception e) {
            // Fallback if JSON parsing fails or other issues: return original LLM text (but
            // warn)
            System.err.println("Verification Failed: " + e.getMessage());
            return rawJson + "\n\n(Note: Automated verification failed due to format issues. Showing raw AI response.)";
        }
    }

    private String getSystemPrompt(String mode) {
        if ("understanding_summary".equalsIgnoreCase(mode) || "understanding".equalsIgnoreCase(mode)) {
            return "You are a 'Problem Summary Expert'.\n" +
                    "The user is overwhelmed by the problem description.\n" +
                    "[Guidelines]\n" +
                    "1. Skip the background story.\n" +
                    "2. **Input**: Clearly list what is given (e.g., Array of N integers).\n" +
                    "3. **Output**: Define exactly what needs to be calculated in one sentence.\n" +
                    "4. **Constraints**: Mention only key constraints (Time, Range) that affect the solution.\n" +
                    "5. ⚠️ **PROHIBITED**: Do NOT mention any algorithms, data structures, or solution methods. Focus ONLY on problem definition.\n"
                    +
                    "Answer in Korean.";
        } else if ("understanding_trace".equalsIgnoreCase(mode)) {
            return "You are an 'Example Simulator'.\n" +
                    "The user does not understand why the example input leads to the output.\n" +
                    "[Guidelines]\n" +
                    "0. **CRITICAL**: Ignore any user code provided. Focus ONLY on the problem description and examples.\n"
                    +
                    "1. Select Example 1 provided by the problem.\n" +
                    "2. Trace the process **Step-by-step** as if calculating by hand.\n" +
                    "3. Visualize variable changes or state transitions using a **Table** or **List**.\n" +
                    "   - Step 1: Current=0, Input=5 -> Sum=5\n" +
                    "4. Explain which rule from the problem description was applied at each step.\n" +
                    "5. ⚠️ **PROHIBITED**: Do NOT use algorithm terms like 'DP', 'BFS', 'Greedy'. Do NOT explain 'how to solve'. Just show 'what happens'.\n"
                    +
                    "Answer in Korean.";
        } else if ("understanding_hint".equalsIgnoreCase(mode)) {
            return "You are an 'Algorithm Mentor'.\n" +
                    "The user understands the problem but has no idea how to solve it.\n" +
                    "[Guidelines]\n" +
                    "1. **Algorithm Recommendation**: Suggest suitable algorithms (e.g., BFS, Binary Search, Greedy).\n"
                    +
                    "2. **Reasoning**: Explain WHY based on **Constraints (Time Complexity)**.\n" +
                    "   - 'Since N is 100,000, O(N^2) is impossible. Use O(NlogN) sorting.'\n" +
                    "3. **Key Idea**: Provide the decisive idea for the solution in one sentence.\n" +
                    "Answer in Korean.";
        } else if ("solution".equalsIgnoreCase(mode)) {
            return "You are CodeGenie, a helpful AI coding mentor specialized in 'Feasibility Check & Guidance'.\n" +
                    "Your goal is to validate the user's approach and guide them to the correct solution.\n" +
                    "[Guidelines]\n" +
                    "1. **Analyze User Code**: Deeply understand the `[User Code]` and the user's intended logic.\n" +
                    "2. **Feasibility Check**: Determine if the user's approach can solve the problem within constraints (Time/Memory).\n"
                    +
                    "3. **Conditional Guidance**:\n" +
                    "   - **If Valid**: Acknowledge the good approach and suggest the **immediate next step**.\n" +
                    "   - **If Invalid**: Explain **why** it fails (e.g., 'O(N^2) leads to Time Limit Exceeded') and propose the **first step** of a correct approach.\n"
                    +
                    "4. **Code Generation Rule**: \n" +
                    "   - If the user requests code or implementation for a specific step (N), you **MAY** provide the code.\n"
                    +
                    "   - **Constraint**: Provide the code **cumulative from Step 1 up to Step N**. \n" +
                    "   - ⚠️ **PROHIBITED**: Do NOT provide the full solution (steps N+1, N+2...) in advance.\n"
                    +
                    "\n" +
                    "[Output Format]\n" +
                    "1. **코드 분석 및 타당성 (Analysis & Feasibility)**: Evaluate the user's logic and validity.\n" +
                    "2. **가이드 (Guidance)**: \n" +
                    "   - (Valid): 'Next, implement the BFS queue...'\n" +
                    "   - (Invalid): 'Since N=100k, we need O(NlogN). Let's use Sorting...'\n" +
                    "3. **의사 코드 (Pseudocode)**: Show the logic in pseudocode for the suggested step.\n" +
                    "- Answer in Korean.";
        } else if ("counterexample".equalsIgnoreCase(mode)) {
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
                    "(Note: If problem does NOT ask for T, just send \"5\" or \"1\".)";
        } else if ("debugging".equalsIgnoreCase(mode)) {
            return "You are CodeGenie, a helpful AI coding mentor specialized in 'Strategic Debugging'.\n" +
                    "The user wants to know WHERE and HOW to debug their code.\n" +
                    "[Guidelines]\n" +
                    "1. **No Vague Advice**: Do NOT say 'Check the loop' or 'Use print'. Show EXACTLY where to put the print statement.\n"
                    +
                    "2. **Show Code**: \n" +
                    "   - Identify the most critical state changes (loops, recursion, dp updates).\n" +
                    "   - Provide a code snippet with **Print Statements Inserted**.\n" +
                    "   - Use specific formatting: `Java: System.out.println(\"[DEBUG] i=\" + i + \", dp=\" + dp[i]);`\n"
                    +
                    "3. **Analyze Output**: Explain what the user should look for in the console output (e.g., 'If [DEBUG] shows -1, your initialization is wrong').\n"
                    +
                    "Answer in Korean.";
        } else {
            return "You are CodeGenie, a helpful AI coding mentor.\n" +
                    "Help the user with their coding problem.\n" +
                    "Answer in Korean.";
        }
    }

    private String buildContextString(Conversation conversation) {
        StringBuilder sb = new StringBuilder();

        if (conversation.getProblemSpec() != null) {
            com.codetest.agent.dto.ProblemSpec spec = conversation.getProblemSpec();
            sb.append("[Problem Info]\n");
            sb.append("Title: ").append(spec.getTitle()).append("\n");
            if (spec.getTimeLimit() != null)
                sb.append("Time Limit: ").append(spec.getTimeLimit()).append("\n");
            if (spec.getMemoryLimit() != null)
                sb.append("Memory Limit: ").append(spec.getMemoryLimit()).append("\n");
            sb.append("Description:\n").append(spec.getDescription()).append("\n");
            if (spec.getInputFormat() != null)
                sb.append("Input Format:\n").append(spec.getInputFormat()).append("\n");
            if (spec.getOutputFormat() != null)
                sb.append("Output Format:\n").append(spec.getOutputFormat()).append("\n");
            if (spec.getConstraints() != null)
                sb.append("Constraints:\n").append(spec.getConstraints()).append("\n");
            if (spec.getExamples() != null && !spec.getExamples().isEmpty()) {
                sb.append("Examples:\n");
                for (com.codetest.agent.dto.Example ex : spec.getExamples()) {
                    sb.append("Input: ").append(ex.getInput()).append("\n");
                    sb.append("Output: ").append(ex.getOutput()).append("\n");
                }
            }
        } else if (conversation.getProblemText() != null) {
            sb.append("Problem: ").append(conversation.getProblemText()).append("\n");
        }

        if (conversation.getUserCode() != null && !conversation.getUserCode().isEmpty()) {
            sb.append("\n[User Code]\n").append(conversation.getUserCode()).append("\n");
        }

        return sb.toString();
    }

    public List<Conversation> getAllConversations() {
        return conversationRepository.findAllByOrderByUpdatedAtDesc();
    }

    public List<Conversation> getConversationsByUserId(String userId) {
        return conversationRepository.findByUserIdOrderByUpdatedAtDesc(userId);
    }

    public Conversation getConversation(String id) {
        return conversationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
    }

    public Conversation updateConversation(String id, String mode, String problemText, String userCode,
            String codeLanguage,
            com.codetest.agent.dto.ProblemSpec problemSpec, String platform, String problemUrl, String title,
            String category, List<String> topics, String status) {
        Conversation conversation = getConversation(id);
        if (mode != null)
            conversation.setMode(mode);
        if (problemText != null)
            conversation.setProblemText(problemText);
        if (userCode != null)
            conversation.setUserCode(userCode);
        if (codeLanguage != null)
            conversation.setCodeLanguage(codeLanguage);
        if (problemSpec != null)
            conversation.setProblemSpec(problemSpec);
        if (platform != null)
            conversation.setPlatform(platform);
        if (problemUrl != null)
            conversation.setProblemUrl(problemUrl);
        if (title != null)
            conversation.setTitle(title);
        if (category != null)
            conversation.setCategory(category);
        if (topics != null)
            conversation.setTopics(topics);
        if (status != null)
            conversation.setStatus(status);
        conversation.setUpdatedAt(LocalDateTime.now());
        return conversationRepository.save(conversation);
    }

    public void deleteConversation(String id) {
        conversationRepository.deleteById(id);
    }
}
