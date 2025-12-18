# 🧞‍♂️ CodeGenie (코드지니) - 사고력을 키우는 AI 코딩 멘토

> **🚀 Live Demo**: [https://hurdong.github.io/CodeGenie/](https://hurdong.github.io/CodeGenie/)

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

### 1️⃣ 🧪 AI 멘토링 (AI Mentoring)
**"내 코드가 왜 틀렸지?"** 🤔 고민될 때, 통과하지 못하는 결정적인 **반례**를 제시합니다.
- **반례 모드 (Counterexample)**: 엣지 케이스(최소/최대값, Null 등)를 찾아내고 논리적 오류를 지적합니다.
- **풀이 모드 (Solution)**: 문제의 핵심을 요약하고, 최적의 알고리즘을 제안하며, 3단계 힌트로 정답을 유도합니다. (정답 코드는 마지막에만 공개!)
- **디버깅 모드 (Debugging)**: "왜 틀렸는지 모르겠어요" 😭 문제 해결을 위해 정확한 `Print` 디버깅 위치와 원인 분석을 제공합니다.
- **문제 이해 모드 (Understanding)**: 복잡한 문제 지문을 핵심만 요약하거나, 예제 입출력의 흐름을 단계별로 추적(Trace)해줍니다.

### 2️⃣ 📊 대시보드 (Dashboard)
나의 학습 현황을 한눈에 파악하세요.
- **학습 통계**: 현재 랭크(Bronze ~ Ruby), 레벨, 경험치를 시각적으로 확인합니다.
- **스트릭(Streak)**: 매일매일의 학습 기록을 잔디 심기🌱로 관리합니다.
- **알고리즘 유니버스 (3D Graph)**: 내가 정복한 알고리즘 지식들을 아름다운 3D 인터랙티브 그래프로 탐험해보세요! 🌌

### 3️⃣ 🕰️ 히스토리 (History)
과거의 멘토링 세션을 언제든 복습할 수 있습니다.
- **복습 기능**: 이전에 나누었던 대화 내용과 코드를 다시 확인하며 부족한 점을 보완합니다.

---

## 🛠️ 기술 스택 (Tech Stack)

### 🎨 Frontend (Web & Mobile)
- **Framework**: ⚛️ React 19
- **Build Tool**: ⚡ Vite
- **Mobile**: 📱 Capacitor (Android Support)
- **Styling**: 💅 Vanilla CSS (Modern), ✨ GSAP & Framer Motion (Animations)
- **Visualization**: 🌌 Three.js, React Three Fiber, React Force Graph
- **Language**: 💛 JavaScript (ESNext)

### ⚙️ Backend (Server & API)
- **Language**: ☕ Java 17
- **Framework**: 🍃 Spring Boot 3.2
- **Database**: 🍃 MongoDB (Data Store), ⚡ Redis (Session & Cache)
- **AI Integration**: 🤖 Spring AI (OpenAI API)
- **Security**: 🔐 Spring Security, JWT, OAuth2 (Google)
- **Build Tool**: 🐘 Gradle

---

## 📚 상세 문서 (Documentation)

더 자세한 설계와 스펙이 궁금하시다면 아래 문서를 참고하세요:
- [📄 API Specification](docs/api_spec.md): 백엔드 API 명세서
- [🧠 Code Agent Constitution](docs/code-agent-spec.md): AI 에이전트 설계 원칙 및 데이터 모델
- [🏗️ System Architecture](docs/ARCHITECTURE.md): 시스템 아키텍처 및 다이어그램

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
브라우저에서 `http://localhost:3000`으로 접속하여 **CodeGenie**를 만나보세요! ✨

### 4. 배포 (Deployment) ☁️
GitHub Pages에 배포하려면 다음 명령어를 실행하세요:
```bash
npm run deploy
```

### 5. 모바일 빌드 (Android) 🤖
Capacitor를 사용하여 안드로이드 앱으로 빌드할 수 있습니다.
```bash
npx cap sync
npx cap open android
```


