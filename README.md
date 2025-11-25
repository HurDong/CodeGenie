# 🧞‍♂️ CodeGenie (코드지니) - 사고력을 키우는 AI 코딩 멘토

## 📌 프로젝트 비전 (Project Vision)

### **"정답만 알려주는 AI는 이제 그만! 🚫"**

**CodeGenie**는 단순히 코딩 테스트 문제의 정답을 던져주는 도구가 아닙니다.
여러분이 문제의 본질을 꿰뚫고, 스스로 사고하여 해결책을 찾아낼 수 있도록 돕는 **"🧠 사고력 확장형 AI 멘토"**입니다.

ChatGPT와 같은 일반적인 LLM과 달리, **CodeGenie**는 다음과 같은 특별한 능력을 가집니다:

- 🏗️ **구조적 이해**: 문제 텍스트를 단순 독해가 아닌, **목표·입력·출력·제약조건**으로 완벽하게 구조화합니다.
- 🕵️ **취약점 탐정**: 내 코드의 논리적 허점과 약점을 날카롭게 분석합니다.
- 🛡️ **반례(Counterexample) 생성**: 숨겨진 **테스트 케이스**와 **엣지 케이스(Edge Case)**를 찾아내어 코드의 방어력을 높여줍니다.
- 🗺️ **단계별 네비게이션**: 바로 정답을 주지 않고, **Step-by-Step** 힌트와 전략으로 스스로 답을 찾게 이끌어줍니다.

---

## 🚀 주요 기능 (Key Features)

### 1️⃣ 🧪 반례 생성 (Counterexample Mode)
**"내 코드가 왜 틀렸지?"** 🤔 고민될 때, 통과하지 못하는 결정적인 **반례**를 제시합니다.
- 📉 **엣지 케이스 탐색**: 최소/최대값, 빈 값(Null), 중복 값, 경계값 등 놓치기 쉬운 함정을 발견합니다.
- 🧐 **논리적 오류 지적**: "이 입력에서는 왜 실패하는지"에 대한 명쾌한 논리적 이유를 설명합니다.

### 2️⃣ 🧩 단계별 풀이 (Solution Mode)
막막한 문제 앞에서 **해결 전략**을 단계별로 안내합니다.
- 📝 **핵심 요약**: 문제의 핵심 목표와 절대 어겨선 안 될 제약 조건을 요약해줍니다.
- ⚖️ **알고리즘 제안**: 시간 복잡도와 데이터 범위를 고려하여 **최적의 알고리즘 후보**를 추천합니다.
- 👣 **단계적 힌트**: **Step 1 → Step 2 → Step 3**로 이어지는 사고의 흐름을 가이드합니다.
- ⏳ **정답 지연 (No Spoilers)**: 여러분이 "정말 모르겠어요!"라고 외치기 전까지는 코드를 숨겨둡니다.

### 3️⃣ 🏗️ 문제 이해 및 구조화 (Problem Understanding)
- 📥 **RAW Text 파싱**: 복잡한 문제 지문을 **`ProblemSpec`**과 **`ProblemUnderstanding`** 구조로 깔끔하게 변환합니다.
- 🎯 **명확한 목표 설정**:
    - **Goal**: 무엇을 구해야 하는가?
    - **KeyVar**: 입력 변수의 의미와 범위는?
    - **Output**: 출력 형식은?
    - **Constraints**: 시간/메모리 제약은?

---

## 🛠️ 기술 스택 (Tech Stack)

### 🎨 Frontend
- **Framework**: ⚛️ React 19
- **Build Tool**: ⚡ Vite
- **Styling**: 💅 Vanilla CSS (Modern), ✨ GSAP (Animations)
- **Language**: 💛 JavaScript (ESNext)

### ⚙️ Backend (Architecture Design)
> *현재 리포지토리는 프론트엔드 중심이며, 백엔드는 아래와 같이 설계되었습니다.*
- **Core**: ☕ Java, 🍃 Spring Boot 3
- **Data Store**: 💾 Redis (Session & Context Management)
- **Architecture**: 🤖 Stateless LLM, 🏛️ Server-Side State Management

---

## 💡 핵심 원칙 (Core Principles)

1.  **🤖 LLM is Always Stateless**
    - 모든 AI 호출은 독립적입니다. 이전 대화의 기억(Context)은 **백엔드(Redis)**가 안전하게 관리하고 주입합니다.

2.  **🏛️ Server is the Source of Truth**
    - 문제의 상태, 세션 정보, 이해도 데이터의 **진실(Truth)**은 오직 서버에만 있습니다. AI는 이를 바탕으로 판단할 뿐입니다.

3.  **🎓 No Immediate Answers (정답 지연)**
    - 여러분의 **성장**이 최우선입니다. 정답 코드는 `SOLUTION` 모드의 **마지막 단계**에서, 여러분이 **원할 때만** 공개됩니다.

4.  **💎 Consistency & Reliability**
    - 모든 기능은 **"코딩 테스트 사고력 향상"**이라는 하나의 목표를 향해 일관성 있게 동작합니다.

---

## 📦 설치 및 실행 (Installation & Run)

이 프로젝트는 **React + Vite** 환경에서 쾌적하게 실행됩니다.

### 1. 프로젝트 클론 및 이동
```bash
git clone <repository-url>
cd CodeGenie
```

### 2. 의존성 설치 📥
```bash
npm install
```

### 3. 개발 서버 실행 🚀
```bash
npm run dev
```
브라우저에서 `http://localhost:5173`으로 접속하여 **CodeGenie**를 만나보세요! ✨

### 4. 백엔드 및 인프라 실행 (Docker) 🐳
백엔드(Spring Boot)와 Redis는 Docker Compose를 통해 쉽게 실행할 수 있습니다.

```bash
docker-compose up -d --build
```
- **Backend API**: `http://localhost:8080`
- **Redis**: `localhost:6379`

프론트엔드 개발 서버(`npm run dev`)는 자동으로 `/api` 요청을 로컬 Docker 백엔드로 프록시합니다.

---

## 📝 라이선스 (License)
This project is for educational and development purposes. 📚
