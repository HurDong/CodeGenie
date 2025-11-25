# CodeTest Agent Project Constitution

## 📌 PURPOSE — WHY THIS PROMPT EXISTS

This document defines the planning, philosophy, architecture, and policies for the "CodeTest Agent" project. It serves as the "constitution" for development.
**Cursor/Antigravity must not change or arbitrarily extend this planning.**
Any missing information or ambiguous points must be clarified by asking the user.
This document must be treated as the absolute reference for all code, documentation, and design generation.

---

## 📌 SECTION 1 — PROJECT VISION

We are building an **"AI Mentor that provides deep understanding and thought expansion experiences,"** not just a tool to solve coding test problems.

Unlike ChatGPT, this agent:
- Normalizes and understands the structure of coding problems.
- Analyzes the user's code weaknesses.
- Digs into hidden test cases.
- Guides the solution strategy step-by-step.
- Provides a consistent mentoring experience.

**Implementation Strategy:**
- Prompt Engineering + Mode-Based Design + Session Context Management.
- No fine-tuning in the initial version.

---

## 📌 SECTION 2 — CORE PRINCIPLES

1.  **LLM is Always Stateless**
    - Every LLM call is independent.
    - "Memory" is managed by the backend (Redis).

2.  **Server is the Source of Truth**
    - The server holds the true state of the Problem, Context, and Session.
    - The LLM only receives context; intelligence/judgment is based on the `ProblemUnderstanding` provided by the server.

3.  **Mode-Based Agent Architecture**
    - `COUNTEREXAMPLE` Mode
    - `SOLUTION` Mode

4.  **Parse Once, Reuse Summary**
    - Do not send RAW problem text repeatedly.
    - Use `ProblemUnderstanding` JSON for all mode executions.

5.  **No Immediate Answers**
    - Only provide the full answer in `SOLUTION` mode,
    - Only when explicitly requested by the user,
    - And only as the final step.

6.  **Consistency, Accuracy, Reliability First**
    - All features prioritize "improving coding test thinking skills."

---

## 📌 SECTION 3 — INPUT FLOW

Users input problems via:
- **RAW_TEXT**: Paste full problem text.
- **URL**: Problem URL (HTML parsing is secondary).
- **ONLINE_JUDGE**: Problem ID (for future extension).

The LLM generates two structures from `RAW_TEXT`: `ProblemSpec` and `ProblemUnderstanding`.

---

## 📌 SECTION 4 — DATA MODELS

**Do not modify these structures.**

### 4.1. ProblemSpec
```java
class ProblemSpec {
    String source;        // RAW / BAEKJOON / PROGRAMMERS
    String sourceId;      // Problem ID (if available)
    String title;
    String description;
    String inputFormat;
    String outputFormat;
    String constraints;   // Original constraint text
    List<Example> examples;
}
```

### 4.2. Example
```java
class Example {
    String input;
    String output;
    String explanation;
}
```

### 4.3. ProblemUnderstanding
```java
class ProblemUnderstanding {
    String goal;            // Core goal of the problem
    List<KeyVar> inputs;    // Input variable names / meanings / ranges
    String output;          // Output definition
    Constraints constraints;
}
```

### 4.4. KeyVar
```java
class KeyVar {
    String name;
    String meaning;
    String range;
}
```

### 4.5. Constraints
```java
class Constraints {
    String timeLimit;
    String memoryLimit;
    String notes;
}
```

### 4.6. ProblemSession (Session Context)
```java
class ProblemSession {
    String sessionId;
    ProblemUnderstanding understanding;
    String mode;        // COUNTEREXAMPLE / SOLUTION
    String userCode;
    long expiresAt;
}
```

---

## 📌 SECTION 5 — PROCESS FLOW

1.  **INIT (Input)**
    - User provides RAW text.

2.  **PARSING**
    - LLM → Generates `ProblemSpec`.
    - LLM → Generates `ProblemUnderstanding`.

3.  **VERIFY (Understanding Check)**
    - Show `ProblemUnderstanding` summary to the user (goal, inputs, output, constraints).
    - User confirms (`CONFIRMED`).
    - Save to Redis.

4.  **MODE SELECTION**
    - `COUNTEREXAMPLE` or `SOLUTION`.

5.  **MODE EXECUTION**
    - LLM Input:
        - `system`: Mode Role
        - `user`: `{ ProblemUnderstanding JSON + userCode + mode }`

6.  **RETURN RESULT**
    - Follow mode-specific formats.

---

## 📌 SECTION 6 — MODE SPECIFICATION

### 6.1. COUNTEREXAMPLE MODE
- Generate edge cases based on `ProblemUnderstanding`.
- Infer vulnerable logic based on `userCode`.
- Propose patterns: Min/Max, Empty, Duplicate, Boundary, Overflow.
- Format:
  ```json
  {
    "input": "...",
    "explanation": "Why this case is important..."
  }
  ```

### 6.2. SOLUTION MODE
- Provide core problem summary.
- Suggest algorithm candidates based on Time/Range.
- Provide step-by-step hints (Step 1~3).
- **Only provide code when requested.**

---

## 📌 SECTION 7 — BEHAVIOR RULES

1.  **No Planning Changes**: Adhere strictly to this document.
2.  **Ask if Ambiguous**: Do not guess.
3.  **No Arbitrary Extensions**: Stick to the scope.
4.  **Tech Stack**: Java + Spring Boot 3 (Latest).
5.  **Docs First**: Create documentation before code.
6.  **Tests**: Testing is recommended.
7.  **Layering**: Maintain Redis/DTO separation.
8.  **No Instant Answers**: Do not show the solution immediately.
9.  **Context Integrity**: Do not manipulate context.
10. **Prompting**: Always use `ProblemUnderstanding` for templates.

---

## 📌 SECTION 8 — INIT TASKS

1.  **Document Generation**
    - `docs/code-agent-spec.md` (This document)

2.  **DTO Skeleton Generation**
    - `ProblemSpec.java`
    - `ProblemUnderstanding.java`
    - `KeyVar.java`
    - `Constraints.java`
    - `Example.java`
    - `ProblemSession.java`
    - Use Lombok.
    - Keep field names/types exactly as defined.
