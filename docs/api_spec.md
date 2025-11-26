# CodeGenie API Specification

Base URL: `/api`

## 1. Chat (Mentoring)

### Start a New Chat Session
Initiates a new mentoring session with a specific mode and optional context.

- **URL**: `/chat/start`
- **Method**: `POST`
- **Content-Type**: `application/json`

**Request Body:**
```json
{
  "mode": "SOLUTION",       // Required. Options: "SOLUTION", "COUNTEREXAMPLE", "UNDERSTANDING"
  "problemText": "...",     // Optional. The text of the coding problem.
  "userCode": "..."         // Optional. The user's current code.
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "대화가 시작되었습니다.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "새로운 대화 (SOLUTION)",
    "mode": "SOLUTION",
    "status": "ongoing",
    "messages": [
      {
        "role": "assistant",
        "content": "안녕하세요! SOLUTION 모드로 도와드리겠습니다.",
        "timestamp": "2023-11-27T10:00:00"
      }
    ],
    "createdAt": "2023-11-27T10:00:00",
    "updatedAt": "2023-11-27T10:00:00"
  }
}
```

---

### Send a Message
Sends a user message to an existing conversation and receives an AI response.

- **URL**: `/chat/message`
- **Method**: `POST`
- **Content-Type**: `application/json`

**Request Body:**
```json
{
  "conversationId": "550e8400-e29b-41d4-a716-446655440000",
  "content": "시간 복잡도가 어떻게 되나요?"
}
```

**Response (200 OK):**
Returns the AI's response message.
```json
{
  "status": "success",
  "data": {
    "role": "assistant",
    "content": "이 알고리즘의 시간 복잡도는 O(N)입니다.",
    "timestamp": "2023-11-27T10:05:00"
  }
}
```

## 2. History (Conversation Logs)

### Get All Conversations
Retrieves a list of all past conversation sessions, sorted by latest update.

- **URL**: `/history`
- **Method**: `GET`

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "알고리즘 복잡도 분석",
      "mode": "SOLUTION",
      "status": "resolved",
      "updatedAt": "2023-11-27T12:00:00",
      "messages": [...] 
    },
    ...
  ]
}
```

---

### Get Specific Conversation
Retrieves the full details and message history of a specific conversation.

- **URL**: `/history/{id}`
- **Method**: `GET`

**Path Parameters:**
- `id`: The UUID of the conversation.

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "알고리즘 복잡도 분석",
    "mode": "SOLUTION",
    "problemText": "...",
    "userCode": "...",
    "messages": [
      {
        "role": "assistant",
        "content": "...",
        "timestamp": "..."
      },
      {
        "role": "user",
        "content": "...",
        "timestamp": "..."
      }
    ]
  }
}
```

## 3. Data Models

### Conversation
| Field | Type | Description |
|-------|------|-------------|
| `id` | String (UUID) | Unique identifier |
| `title` | String | Title of the chat session |
| `mode` | String | Mentoring mode (`SOLUTION`, `COUNTEREXAMPLE`, `UNDERSTANDING`) |
| `status` | String | `ongoing` or `resolved` |
| `problemText` | String | The problem description |
| `userCode` | String | The code provided by the user |
| `messages` | List | List of Message objects |

### Message
| Field | Type | Description |
|-------|------|-------------|
| `role` | String | `user` or `assistant` |
| `content` | String | The text content of the message |
| `timestamp` | DateTime | When the message was created |
