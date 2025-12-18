# CodeGenie API 명세서 (API Specification)

Base URL: `/api`

---

## 1. 인증 (Auth)

### 회원가입 (Register)
새로운 사용자를 등록합니다.

- **URL**: `/auth/register`
- **Method**: `POST`
- **Content-Type**: `application/json`

**Request Body (`AuthDto.RegisterRequest`):**
```json
{
  "email": "user@example.com",  // 필수. 이메일 주소
  "password": "password123",    // 필수. 비밀번호
  "name": "홍길동"               // 필수. 사용자 이름
}
```

**Response (200 OK - `AuthDto.AuthResponse`):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "dGhpcyBpcyBhIHJlZnJl...",
  "email": "user@example.com",
  "name": "홍길동"
}
```

### 로그인 (Login)
이메일과 비밀번호로 로그인하여 액세스 토큰을 발급받습니다.

- **URL**: `/auth/login`
- **Method**: `POST`
- **Content-Type**: `application/json`

**Request Body (`AuthDto.LoginRequest`):**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK - `AuthDto.AuthResponse`):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "...",
  "email": "user@example.com",
  "name": "홍길동"
}
```

### 프로필 수정 (Update Profile)
로그인한 사용자의 프로필 정보를 수정합니다.

- **URL**: `/auth/profile`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer <token>`

**Request Body (`AuthDto.UpdateProfileRequest`):**
```json
{
  "name": "새로운이름",
  "email": "new@example.com"
}
```

---

## 2. 대시보드 (Dashboard)

### 대시보드 데이터 조회
사용자의 학습 현황, 스트릭, 스킬 트리, 활동 로그 등을 조회합니다.

- **URL**: `/dashboard`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`

**Response (200 OK - `DashboardResponse`):**
```json
{
  "userStats": {
    "name": "홍길동",
    "streakDays": 5,
    "totalSolved": 42,
    "currentTier": "Gold I",
    "level": 15,
    "levelTitle": "God of Genie",
    "daysToNextLevel": 3
  },
  "skillTree": [
    { "id": "bfs", "name": "BFS", "level": 2, "status": "unlocked" }
  ],
  "activityLogs": [
    { "type": "SOLVED", "problemTitle": "미로 탐색", "timestamp": "..." }
  ]
}
```

---

## 3. 문제 파싱 (Problem Parsing)

### 문제 정보 가져오기
백준(Baekjoon) 또는 프로그래머스(Programmers) URL에서 문제 정보를 파싱합니다.

- **URL**: `/parse`
- **Method**: `GET`

**Query Parameters:**
- `url`: 문제 URL 또는 ID (예: `1000` 또는 `https://www.acmicpc.net/problem/1000`)
- `platform`: 플랫폼 명 (`baekjoon` 또는 `programmers`)

**Response (200 OK - `ProblemSpec`):**
```json
{
  "source": "BAEKJOON",
  "sourceId": "1000",
  "title": "A+B",
  "description": "두 정수 A와 B를 입력받은 다음...",
  "inputFormat": "첫째 줄에 A와 B가 주어진다...",
  "outputFormat": "첫째 줄에 A+B를 출력한다.",
  "timeLimit": "1 second",
  "memoryLimit": "128 MB",
  "examples": [
    { "input": "1 2", "output": "3" }
  ]
}
```

---

## 4. 멘토링 채팅 (Chat)

### 새 대화 시작 (Start Chat)
새로운 멘토링 세션을 시작합니다.

- **URL**: `/chat/start`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>` (선택)

**Request Body:**
```json
{
  "mode": "SOLUTION",
  "problemText": "...",
  "userCode": "...",
  "title": "A+B 문제 풀이"
}
```

### 메시지 전송 (Send Message)
진행 중인 대화에 메시지를 보내고 AI 응답을 받습니다.

- **URL**: `/chat/message`
- **Method**: `POST`

**Request Body:**
```json
{
  "conversationId": "550e8400-e29b...",
  "content": "시간 복잡도가 어떻게 되나요?"
}
```

### 대화 목록 조회 (Get History)
사용자의 과거 대화 목록을 조회합니다.

- **URL**: `/history`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`

### 특정 대화 조회 (Get Conversation)
특정 대화의 상세 내용과 메시지 기록을 조회합니다.

- **URL**: `/history/{id}`
- **Method**: `GET`

### 대화 정보 수정 (Update Conversation)
대화의 상태나 메타데이터를 업데이트합니다.

- **URL**: `/chat/{id}`
- **Method**: `PUT`

### 대화 삭제 (Delete Conversation)
대화를 삭제합니다.

- **URL**: `/chat/{id}`
- **Method**: `DELETE`

### 코드 템플릿 생성 (Generate Template)
문제 정보를 기반으로 기본 코드 템플릿을 생성합니다.

- **URL**: `/chat/template`
- **Method**: `POST`

---

## 5. 데이터 모델 (Data Models)

백엔드에서 사용되는 주요 DTO(Data Transfer Object) 구조입니다.

### 5.1. Auth Models (`AuthDto`)
| 모델명 | 필드 | 설명 |
|--------|------|------|
| **RegisterRequest** | `email` (String) | 사용자 이메일 |
| | `password` (String) | 사용자 비밀번호 |
| | `name` (String) | 사용자 이름 |
| **LoginRequest** | `email` (String) | 사용자 이메일 |
| | `password` (String) | 사용자 비밀번호 |
| **AuthResponse** | `accessToken` (String) | JWT 액세스 토큰 |
| | `refreshToken` (String) | JWT 리프레시 토큰 |
| | `email` (String) | 사용자 이메일 |
| | `name` (String) | 사용자 이름 |

### 5.2. Dashboard Models
| 모델명 | 필드 | 설명 |
|--------|------|------|
| **UserStatsDto** | `name` (String) | 사용자 이름 |
| | `streakDays` (int) | 현재 연속 학습 일수 (Streak) |
| | `totalSolved` (int) | 총 해결 문제 수 |
| | `currentTier` (String) | 현재 티어 (예: Gold I) |
| | `level` (int) | 현재 레벨 (1~5) |
| | `levelTitle` (String) | 레벨 타이틀 (예: God of Genie) |
| | `daysToNextLevel` (int) | 다음 레벨까지 남은 일수 |
| **DashboardResponse** | `userStats` (UserStatsDto) | 사용자 통계 정보 |
| | `activityLogs` (List) | 최근 활동 로그 목록 |
| | `skillTree` (List) | 스킬 트리 정보 목록 |

### 5.3. Problem Models (`ProblemSpec`)
| 필드명 | 타입 | 설명 |
|--------|------|------|
| `source` | String | 문제 출처 (`BAEKJOON`, `PROGRAMMERS`, `RAW`) |
| `sourceId` | String | 문제 번호 또는 ID |
| `title` | String | 문제 제목 |
| `description` | String | 문제 본문 설명 |
| `inputFormat` | String | 입력 형식 설명 |
| `outputFormat` | String | 출력 형식 설명 |
| `constraints` | String | 제약 조건 (시간/메모리 등 원문) |
| `timeLimit` | String | 시간 제한 (예: "1 second") |
| `memoryLimit` | String | 메모리 제한 (예: "128 MB") |
| `examples` | List | 입출력 예시 목록 |

### 5.4. Problem Understanding (`ProblemUnderstanding`)
AI가 문제를 분석한 구조화된 데이터입니다.
| 필드명 | 타입 | 설명 |
|--------|------|------|
| `goal` | String | 문제의 핵심 목표 |
| `inputs` | List\<KeyVar> | 핵심 변수 정의 및 범위 |
| `output` | String | 출력값에 대한 정의 |
| `constraints` | Constraints | 구조화된 제약 조건 |

### 5.5. Conversation (`Conversation`)
| 필드명 | 타입 | 설명 |
|--------|------|------|
| `id` | String | 대화 고유 ID (UUID) |
| `title` | String | 대화 제목 |
| `mode` | String | 멘토링 모드 (`SOLUTION` 등) |
| `status` | String | 상태 (`ongoing` 또는 `resolved`) |
| `problemText` | String | 문제 텍스트 원문 |
| `userCode` | String | 사용자가 작성한 코드 |
| `messages` | List\<Message> | 대화 메시지 기록 |
