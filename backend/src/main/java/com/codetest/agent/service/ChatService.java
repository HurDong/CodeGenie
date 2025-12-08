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

        String aiResponseContent = llmService.getChatResponse(messages);

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
                    "4. ⚠️ **PROHIBITED**: Do NOT trace examples line-by-line. Do NOT give the full code immediately.\n"
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
            return "You are CodeGenie, a helpful AI coding mentor specialized in 'Counterexample Generation'.\n" +
                    "Your goal is to find logical flaws or edge cases in the user's approach or code.\n" +
                    "Analyze the problem constraints and the user's code carefully.\n" +
                    "Provide a specific input case where the user's code might fail or produce incorrect output.\n" +
                    "Explain WHY this case is a counterexample.\n" +
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

    public Conversation updateConversation(String id, String problemText, String userCode, String codeLanguage,
            com.codetest.agent.dto.ProblemSpec problemSpec, String platform, String problemUrl, String title) {
        Conversation conversation = getConversation(id);
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
        conversation.setUpdatedAt(LocalDateTime.now());
        return conversationRepository.save(conversation);
    }

    public void deleteConversation(String id) {
        conversationRepository.deleteById(id);
    }
}
