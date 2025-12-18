# CodeGenie 에이전트 설계 원칙 (Code Agent Constitution)

## 📌 목적 (Purpose)

이 문서는 "CodeTest Agent (CodeGenie)" 프로젝트의 기획, 철학, 아키텍처 및 정책을 정의합니다.
**개발자는 이 문서를 절대적인 기준(Source of Truth)으로 삼아 코드와 프롬프트를 작성해야 합니다.**
문서와 코드의 내용이 충돌할 경우, 실제 구현된 `ChatService`의 로직을 반영하여 이 문서를 최신화해야 합니다.

---

## 📌 섹션 1 — 프로젝트 비전 (Project Vision)

우리는 단순히 코딩 테스트 문제의 정답을 알려주는 도구가 아닌, **"깊은 이해와 사고력 확장을 돕는 AI 멘토"**를 만듭니다.

CodeGenie는 일반적인 LLM과 달리 다음과 같은 특징을 가집니다:
- 문제의 구조(목표, 입력, 제약조건)를 명확히 파악합니다.
- 사용자의 코드 취약점을 분석하고, 숨겨진 반례를 찾아냅니다.
- 정답을 바로 주지 않고, 단계별 전략과 힌트를 통해 스스로 해결하도록 유도합니다.

**구현 전략:**
- 프롬프트 엔지니어링 + 모드 기반 설계 + 세션 컨텍스트 관리 (Stateless LLM)

---

## 📌 섹션 2 — 핵심 원칙 (Core Principles)

1.  **LLM is Always Stateless (무상태성)**
    - 모든 AI 호출은 독립적입니다.
    - 대화의 맥락(Context)은 백엔드(Redis/DB)가 관리하며, 매 호출마다 필요한 정보를 주입합니다.

2.  **Server is the Source of Truth (서버가 진실의 원천)**
    - 문제 상태, 세션 정보, 이해도 데이터의 진실은 서버에 있습니다.
    - AI는 서버가 제공하는 `ProblemUnderstanding`과 `Context`를 바탕으로 판단합니다.

3.  **Mode-Based Architecture (모드 기반 아키텍처)**
    - 상황에 맞춰 특화된 페르소나와 프롬프트를 사용합니다. (`SOLUTION`, `COUNTEREXAMPLE`, `DEBUGGING` 등)

4.  **No Immediate Answers (정답 지연)**
    - `SOLUTION` 모드에서도 바로 코드를 주지 않습니다.
    - 전략 수립 -> 단계별 가이드 -> 요청 시 코드 제공(Step-by-Step)의 순서를 따릅니다.

---

## 📌 섹션 3 — 입력 및 처리 흐름 (Input Flow)

사용자는 RAW 텍스트 또는 URL을 통해 문제를 입력합니다.
LLM은 이를 분석하여 두 가지 핵심 구조를 생성합니다:
1.  **`ProblemSpec`**: 문제의 원문 정보 (제목, 설명, 입출력 예시 등)
2.  **`ProblemUnderstanding`**: AI가 이해한 구조화된 정보 (목표, 핵심 변수, 제약 조건)

---

## 📌 섹션 4 — 모드 명세 (Mode Specification)

`ChatService.java`에 구현된 실제 프롬프트 로직을 기반으로 정의합니다.

### 4.1. 🧪 반례 생성 모드 (COUNTEREXAMPLE)
사용자 코드의 허점을 파악하고 결정적인 테스트 케이스를 생성합니다.

- **역할**: Test Case Generator
- **프로세스**:
    1.  문제의 입력 형식을 분석합니다 (T 케이스 여부 등).
    2.  5개의 강력한 테스트 케이스를 생성합니다 (Basic 1, Edge 2, Random 2).
    3.  생성된 케이스를 JSON 형식으로 반환하여 서버가 실제 코드를 실행(Execution)해볼 수 있게 합니다.
    4.  서버 검증 후, 예상 값과 실제 값이 다른 경우에만 사용자에게 "반례 발견"을 알립니다.

### 4.2. 🧩 풀이 가이드 모드 (SOLUTION)
**"Feasibility Check & Guidance"**에 특화된 멘토입니다.

- **역할**: AI Coding Mentor
- **전략 앵커링 (Strategy Anchor)**:
    - 대화 초기에 합의된 풀이 전략(예: "DP로 풀기")을 고정합니다.
    - 사용자가 엉뚱한 질문을 하더라도 원래 전략으로 돌아오도록 유도합니다.
    - 전략 변경이 필요할 경우 `[UPDATE_STRATEGY: ...]` 태그를 통해 명시적으로 업데이트합니다.
- **가이드 방식**:
    - **Logic Check**: 사용자 접근법의 타당성(시간복잡도 등)을 먼저 평가합니다.
    - **Valid**: 좋은 접근법이면 다음 단계를 제시합니다.
    - **Invalid**: 왜 틀렸는지 설명하고 올바른 첫 단계를 제안합니다.
    - **Code Rule**: 코드를 요청받으면, *전체 정답*이 아니라 *지금 단계까지의 코드*만 보여줍니다.

### 4.3. 🕵️ 디버깅 모드 (DEBUGGING)🆕
코드가 왜 틀렸는지 모르겠다는 사용자에게 구체적인 디버깅 위치를 알려줍니다.
(*기존 문서에는 없었으나 코드에 구현됨*)

- **역할**: Strategic Debugging Mentor
- **가이드 방식**:
    - "잘 보세요" 같은 모호한 조언 금지.
    - **Print 문 위치 지정**: 상태 변화가 일어나는 루프나 재귀 호출 지점에 `System.out.println(...)`을 넣으라고 구체적으로 코드를 줍니다.
    - **출력 분석**: "콘솔에 -1이 나오면 초기화 오류입니다"와 같이 출력 결과의 의미를 해석해줍니다.

### 4.4. 📖 문제 이해 모드 (UNDERSTANDING)
문제 자체를 이해하지 못하는 사용자를 돕습니다. 세부 모드로 나뉩니다.

- **Summary (`understanding_summary`)**: 문제의 배경 스토리를 제거하고, **입력/출력/제약조건**만 요약합니다.
- **Trace (`understanding_trace`)**: 예제 1번을 손으로 풀듯이 단계별(Step-by-step)로 변수 변화를 추적하며 설명합니다.
- **Hint (`understanding_hint`)**: 알고리즘 분류(Tag)와 핵심 아이디어만 짧게 힌트로 줍니다.

---

## 📌 섹션 5 — 데이터 모델 (Data Models)

백엔드 DTO와 일치해야 합니다.

### 5.1. ProblemSpec
원본 문제 데이터를 담습니다.
```java
class ProblemSpec {
    String source;        // RAW / BAEKJOON / PROGRAMMERS
    String sourceId;      // 문제 ID
    String title;         // 제목
    String description;   // 본문
    String inputFormat;   // 입력 형식
    String outputFormat;  // 출력 형식
    String constraints;   // 제약 조건 (Raw Text)
    String timeLimit;     // 시간 제한
    String memoryLimit;   // 메모리 제한
    List<Example> examples;
}
```

### 5.2. ProblemUnderstanding
AI가 분석한 논리적 구조입니다.
```java
class ProblemUnderstanding {
    String goal;            // 문제의 핵심 목표
    List<KeyVar> inputs;    // 입력 변수의 의미와 범위
    String output;          // 출력값 정의
    Constraints constraints;// 구조화된 제약 조건
}
```

---

## 📌 섹션 6 — 행동 지침 (Behavior Rules)

1.  **규격 준수**: 프롬프트는 항상 시스템에 정의된 페르소나를 유지해야 합니다.
2.  **JSON 포맷**: 반례 생성 등 기계적 처리가 필요한 경우, 마크다운 없이 순수 JSON만 반환하도록 강제합니다.
3.  **한국어 응답**: 모든 멘토링 응답은 기본적으로 "한국어"로 작성합니다 (System Prompt에 `Answer in Korean` 명시).
4.  **보안**: 사용자의 코드 실행 결과에 민감한 시스템 정보가 노출되지 않도록 서버에서 필터링합니다.
