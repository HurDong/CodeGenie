import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import "../index.css"; // Ensure we have access to global styles
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/themes/prism-okaidia.css'; // Dark theme
import "./CodeEditor.css"; // Code editor styles

// Mode configurations
const MODES = {
  COUNTEREXAMPLE: {
    id: "counterexample",
    name: "반례 생성",
    icon: "🧪",
    description: "코드의 오류를 찾는 반례 제시",
    placeholder: "질문을 입력하세요...",
    color: "#ef4444",
  },
  SOLUTION: {
    id: "solution",
    name: "단계별 풀이",
    icon: "🧩",
    description: "문제 해결 전략을 단계별로 안내",
    placeholder: "질문을 입력하세요...",
    color: "#3b82f6",
  },
  UNDERSTANDING: {
    id: "understanding",
    name: "문제 이해",
    icon: "🏗️",
    description: "문제를 구조화하여 이해",
    placeholder: "질문을 입력하세요...",
    color: "#10b981",
  },
};

const AiMentoringPage = () => {
  // Initial dummy data for chat sessions
  const [chatSessions, setChatSessions] = useState([
    {
      id: 1,
      title: "알고리즘 복잡도 분석...",
      mode: MODES.SOLUTION.id,
      problemText: "배열에서 최댓값을 찾는 문제입니다...",
      userCode: "function findMax(arr) {\n  return Math.max(...arr);\n}",
      messages: [
        {
          id: 1,
          role: "assistant",
          content: "안녕하세요! 알고리즘 복잡도에 대해 궁금하신가요?",
        },
        { id: 2, role: "user", content: "네, 빅오 표기법이 헷갈려요." },
        {
          id: 3,
          role: "assistant",
          content:
            "빅오 표기법은 알고리즘의 효율성을 나타내는 지표입니다. 구체적으로 어떤 부분이 어려우신가요?",
        },
      ],
    },
    {
      id: 2,
      title: "React 상태관리 질문",
      mode: MODES.UNDERSTANDING.id,
      problemText: "",
      userCode: "",
      messages: [
        {
          id: 1,
          role: "assistant",
          content: "React 상태관리에 대해 도와드릴까요?",
        },
        { id: 2, role: "user", content: "Redux랑 Context API 차이가 뭐야?" },
        {
          id: 3,
          role: "assistant",
          content:
            "Redux는 전역 상태 관리를 위한 라이브러리이고, Context API는 React 내장 기능입니다. 규모가 큰 앱에서는 Redux가 유리할 수 있습니다.",
        },
      ],
    },
    {
      id: 3,
      title: "Java Spring Boot 설정",
      mode: MODES.COUNTEREXAMPLE.id,
      problemText: "",
      userCode: "",
      messages: [
        {
          id: 1,
          role: "assistant",
          content: "Spring Boot 설정 관련 문제입니다. 무엇을 도와드릴까요?",
        },
      ],
    },
  ]);

  const [activeChatId, setActiveChatId] = useState(1);
  const [activeMode, setActiveMode] = useState(MODES.SOLUTION.id);
  const [input, setInput] = useState("");
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [tempProblemText, setTempProblemText] = useState("");
  const [tempCodeText, setTempCodeText] = useState("");
  const [tempCodeLanguage, setTempCodeLanguage] = useState("java"); // 언어 선택

  const [tempPlatform, setTempPlatform] = useState("baekjoon");
  const [tempProblemUrl, setTempProblemUrl] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const messagesEndRef = useRef(null);

  // Get current active chat
  const activeChat =
    chatSessions.find((chat) => chat.id === activeChatId) || chatSessions[0];
  const messages = activeChat ? activeChat.messages : [];
  const currentMode =
    MODES[Object.keys(MODES).find((key) => MODES[key].id === activeMode)] ||
    MODES.SOLUTION;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChatId]);

  // Update mode when switching chats
  useEffect(() => {
    if (activeChat) {
      setActiveMode(activeChat.mode || MODES.SOLUTION.id);
    }
  }, [activeChatId, activeChat]);

  const handleNewChat = () => {
    const newChatId = Date.now();
    const newChat = {
      id: newChatId,
      title: "새로운 대화",
      mode: activeMode,
      problemText: "",
      userCode: "",
      messages: [
        {
          id: Date.now(),
          role: "assistant",
          content: `안녕하세요! CodeGenie AI 멘토입니다. \n${currentMode.icon} ${currentMode.name} 모드로 도와드리겠습니다!`,
        },
      ],
    };
    setChatSessions((prev) => [newChat, ...prev]);
    setActiveChatId(newChatId);
  };

  const handleModeChange = (newMode) => {
    setActiveMode(newMode);
    setChatSessions((prevSessions) =>
      prevSessions.map((chat) => {
        if (chat.id === activeChatId) {
          return { ...chat, mode: newMode };
        }
        return chat;
      })
    );
  };

  const handleOpenProblemModal = () => {
    setTempProblemText(activeChat?.problemText || "");
    setTempPlatform(activeChat?.platform || "baekjoon");
    setTempProblemUrl(activeChat?.problemUrl || "");
    setShowProblemModal(true);
  };

  const handleOpenCodeModal = () => {
    setTempCodeText(activeChat?.userCode || "");
    setTempCodeLanguage(activeChat?.codeLanguage || "java");

    setShowCodeModal(true);
  };

  const handleSaveProblem = () => {
    setChatSessions((prevSessions) =>
      prevSessions.map((chat) => {
        if (chat.id === activeChatId) {
          return {
            ...chat,
            problemText: tempProblemText,
            platform: tempPlatform,
            problemUrl: tempProblemUrl,
          };
        }
        return chat;
      })
    );
    setShowProblemModal(false);
  };

  const handleSaveCode = () => {
    setChatSessions((prevSessions) =>
      prevSessions.map((chat) => {
        if (chat.id === activeChatId) {
          return { ...chat, userCode: tempCodeText, codeLanguage: tempCodeLanguage };
        }
        return chat;
      })
    );
    setShowCodeModal(false);
  };

  const handleFetchProblem = async () => {
    if (!tempProblemUrl) return;
    setIsFetching(true);
    try {
      const response = await fetch(`/api/parse?url=${encodeURIComponent(tempProblemUrl)}&platform=${tempPlatform}`);

      const contentType = response.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");

      if (isJson) {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || `Server error: ${response.status}`);
        }
        if (data.error) {
          throw new Error(data.error);
        }
        setTempProblemText(data.content);
      } else {
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Server error: ${response.status} - ${text.substring(0, 100)}`);
        }
        throw new Error("Received non-JSON response from server");
      }

    } catch (error) {
      console.error("Error fetching problem:", error);

      // Fallback to demo data if server is unreachable
      const isServerError = error.message.includes("Failed to fetch") || error.message.includes("Server error");

      if (isServerError) {
        if (confirm("서버에 연결할 수 없습니다. (백엔드 실행 필요)\n데모 데이터를 대신 불러오시겠습니까?")) {
          setTempProblemText(
            `[데모 데이터] ${tempPlatform === 'baekjoon' ? '백준' : '프로그래머스'} 문제 예시\n\n` +
            `문제: 두 정수 A와 B를 입력받은 다음, A+B를 출력하는 프로그램을 작성하시오.\n\n` +
            `입력: 첫째 줄에 A와 B가 주어진다. (0 < A, B < 10)\n` +
            `출력: 첫째 줄에 A+B를 출력한다.\n\n` +
            `(실제 데이터를 가져오려면 백엔드 서버를 실행해야 합니다)`
          );
          return;
        }
      }

      alert(`문제 정보를 가져오는데 실패했습니다: ${error.message}`);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = {
      id: Date.now(),
      role: "user",
      content: input,
    };

    setChatSessions((prevSessions) =>
      prevSessions.map((chat) => {
        if (chat.id === activeChatId) {
          let newTitle = chat.title;
          if (chat.messages.length <= 1 && chat.title === "새로운 대화") {
            newTitle =
              input.length > 15 ? input.substring(0, 15) + "..." : input;
          }
          return {
            ...chat,
            title: newTitle,
            messages: [...chat.messages, newMessage],
          };
        }
        return chat;
      })
    );

    setInput("");

    // Simulate AI response based on mode and context
    setTimeout(() => {
      let aiContent = "";
      const hasProblem = activeChat.problemText?.trim();
      const hasCode = activeChat.userCode?.trim();

      switch (activeMode) {
        case MODES.COUNTEREXAMPLE.id:
          if (!hasCode) {
            aiContent =
              '🧪 코드가 등록되지 않았습니다.\n상단 우측의 "⌨️" 버튼을 눌러 분석할 코드를 입력해주세요.';
          } else {
            aiContent =
              "🧪 반례를 분석 중입니다...\n\n입력된 코드에서 다음과 같은 엣지 케이스를 발견했습니다:\n- 빈 배열일 때\n- 음수 입력일 때\n- 경계값 초과 시\n\n(현재는 데모 버전입니다)";
          }
          break;
        case MODES.SOLUTION.id:
          if (!hasProblem) {
            aiContent =
              '🧩 문제가 등록되지 않았습니다.\n상단 우측의 "📄" 버튼을 눌러 풀이할 문제를 입력해주세요.';
          } else {
            aiContent =
              "🧩 단계별 풀이를 시작합니다:\n\n**Step 1**: 문제의 핵심 파악\n먼저 입력과 출력의 관계를 이해해야 합니다.\n\n**Step 2**: 알고리즘 선택\n시간 복잡도를 고려하여 적절한 방법을 찾아봅시다.\n\n(현재는 데모 버전입니다)";
          }
          break;
        case MODES.UNDERSTANDING.id:
          if (!hasProblem) {
            aiContent =
              '🏗️ 문제가 등록되지 않았습니다.\n상단 우측의 "📄" 버튼을 눌러 분석할 문제를 입력해주세요.';
          } else {
            aiContent =
              "🏗️ 문제를 구조화합니다:\n\n**Goal**: 무엇을 구해야 하나요?\n**Input**: 입력 데이터의 형식과 범위\n**Output**: 기대되는 출력 형식\n**Constraints**: 시간/공간 제약사항\n\n(현재는 데모 버전입니다)";
          }
          break;
        default:
          aiContent =
            "좋은 질문이네요! 잠시만 기다려주시면 분석해 드릴게요. (현재는 데모 버전입니다)";
      }

      const aiResponse = {
        id: Date.now() + 1,
        role: "assistant",
        content: aiContent,
      };

      setChatSessions((prevSessions) =>
        prevSessions.map((chat) => {
          if (chat.id === activeChatId) {
            return {
              ...chat,
              messages: [...chat.messages, aiResponse],
            };
          }
          return chat;
        })
      );
    }, 1000);
  };

  return (
    <div className="ai-mentoring-page">
      <Navbar />
      <div className="chat-layout">
        {/* Sidebar - Chat History */}
        <aside className="chat-sidebar">
          <div className="new-chat-btn" onClick={handleNewChat}>
            <span>+</span> 새로운 대화
          </div>
          <div className="history-list">
            {chatSessions.map((chat) => {
              const chatMode =
                MODES[
                Object.keys(MODES).find((key) => MODES[key].id === chat.mode)
                ] || MODES.SOLUTION;
              return (
                <div
                  key={chat.id}
                  className={`history-item ${chat.id === activeChatId ? "active" : ""
                    }`}
                  onClick={() => setActiveChatId(chat.id)}
                >
                  <span className="icon">{chatMode.icon}</span>
                  <span className="text">{chat.title}</span>
                </div>
              );
            })}
          </div>
          <div className="user-profile">
            <div className="avatar">👤</div>
            <div className="info">
              <span className="name">User</span>
              <span className="plan">Free Plan</span>
            </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="chat-main">
          <div className="messages-container">
            {messages.map((msg) => (
              <div key={msg.id} className={`message-wrapper ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === "assistant" ? "🧞‍♂️" : "👤"}
                </div>
                <div className="message-content">
                  <div className="message-bubble">
                    {msg.content.split("\n").map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-area">
            {/* Mode Selector and Context Controls */}
            <div className="controls-row">
              <div className="mode-selector">
                {Object.values(MODES).map((mode) => (
                  <button
                    key={mode.id}
                    className={`mode-btn ${activeMode === mode.id ? "active" : ""
                      }`}
                    onClick={() => handleModeChange(mode.id)}
                    title={mode.description}
                    style={{
                      "--mode-color": mode.color,
                    }}
                  >
                    <span className="mode-icon">{mode.icon}</span>
                    <span className="mode-name">{mode.name}</span>
                  </button>
                ))}
              </div>

              {/* Context Status Indicators */}
              <div className="context-status">
                <button
                  className={`context-btn ${activeChat?.problemText ? "has-content" : ""
                    }`}
                  onClick={handleOpenProblemModal}
                  title={activeChat?.problemText ? "문제 수정" : "문제 입력"}
                >
                  <span className="context-icon">📄</span>
                  <span className="context-label">문제</span>
                  <span className="context-status-badge">
                    {activeChat?.problemText ? "완료" : "미입력"}
                  </span>
                </button>
                <button
                  className={`context-btn ${activeChat?.userCode ? "has-content" : ""
                    }`}
                  onClick={handleOpenCodeModal}
                  title={activeChat?.userCode ? "코드 수정" : "코드 입력"}
                >
                  <span className="context-icon">⌨️</span>
                  <span className="context-label">코드</span>
                  <span className="context-status-badge">
                    {activeChat?.userCode ? "완료" : "미입력"}
                  </span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSendMessage} className="input-form">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={currentMode.placeholder}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <button
                type="submit"
                className="send-btn"
                disabled={!input.trim()}
              >
                ➤
              </button>
            </form>

            <p className="disclaimer">
              CodeGenie는 실수를 할 수 있습니다. 중요한 정보는 확인이
              필요합니다.
            </p>
          </div>
        </main>
      </div>

      {/* Problem Modal */}
      {showProblemModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowProblemModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📄 문제 입력</h3>
              <button
                className="modal-close"
                onClick={() => setShowProblemModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">

              <label className="input-group-label">플랫폼 선택</label>
              <div className="platform-grid">
                <div
                  className={`platform-card ${tempPlatform === "baekjoon" ? "selected" : ""
                    }`}
                  onClick={() => {
                    if (tempPlatform !== "baekjoon") {
                      setTempPlatform("baekjoon");
                      setTempProblemUrl("");
                      setTempProblemText("");
                    }
                  }}
                >
                  <img src="/CodeGenie/assets/boj_logo.png" alt="Baekjoon" className="platform-logo" />
                  <span className="platform-name">백준 (BOJ)</span>
                </div>
                <div
                  className={`platform-card ${tempPlatform === "programmers" ? "selected" : ""
                    }`}
                  onClick={() => {
                    if (tempPlatform !== "programmers") {
                      setTempPlatform("programmers");
                      setTempProblemUrl("");
                      setTempProblemText("");
                    }
                  }}
                >
                  <img src="/CodeGenie/assets/pgm_logo.png" alt="Programmers" className="platform-logo" />
                  <span className="platform-name">프로그래머스</span>
                </div>
              </div>

              <label className="input-group-label">문제 링크 또는 번호</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  className="modal-input"
                  value={tempProblemUrl}
                  onChange={(e) => setTempProblemUrl(e.target.value)}
                  placeholder={
                    tempPlatform === "baekjoon"
                      ? "예: 1000 또는 https://www.acmicpc.net/problem/1000"
                      : "예: 문제 URL 또는 제목"
                  }
                  style={{ marginBottom: '1.5rem', flex: 1 }}
                />
                <button
                  className="modal-btn save"
                  style={{ height: '52px', whiteSpace: 'nowrap' }}
                  onClick={handleFetchProblem}
                  disabled={isFetching}
                >
                  {isFetching ? "가져오는 중..." : "가져오기"}
                </button>
              </div>

              <label className="input-group-label">
                문제 내용 (직접 입력/메모)
              </label>
              <textarea
                className="modal-textarea"
                value={tempProblemText}
                onChange={(e) => setTempProblemText(e.target.value)}
                placeholder="문제의 핵심 내용이나 제약조건을 복사해두면 더 정확한 답변을 받을 수 있습니다."
                rows="6"
              />
            </div>
            <div className="modal-footer">
              <button
                className="modal-btn cancel"
                onClick={() => setShowProblemModal(false)}
              >
                취소
              </button>
              <button className="modal-btn save" onClick={handleSaveProblem}>
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Code Modal with Language Selection & Syntax Highlighting */}
      {showCodeModal && (
        <div className="modal-overlay" onClick={() => setShowCodeModal(false)}>
          <div className="modal-content code-editor-modal" onClick={(e) => e.stopPropagation()}>

            {/* VS Code Style Header */}
            <div className="code-editor-header">
              <div className="window-controls">
                <span className="dot red" onClick={() => setShowCodeModal(false)}></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <div className="editor-filename">
                Solution.{tempCodeLanguage === 'java' ? 'java' : tempCodeLanguage === 'python' ? 'py' : 'cpp'}
              </div>
              <button className="modal-close" onClick={() => setShowCodeModal(false)}>✕</button>
            </div>

            {/* Language Tabs */}
            <div className="language-selector">
              <button
                className={`lang-tab ${tempCodeLanguage === 'java' ? 'active' : ''}`}
                onClick={() => setTempCodeLanguage('java')}
              >
                <span className="lang-icon">☕</span> Java
              </button>
              <button
                className={`lang-tab ${tempCodeLanguage === 'python' ? 'active' : ''}`}
                onClick={() => setTempCodeLanguage('python')}
              >
                <span className="lang-icon">🐍</span> Python
              </button>
              <button
                className={`lang-tab ${tempCodeLanguage === 'cpp' ? 'active' : ''}`}
                onClick={() => setTempCodeLanguage('cpp')}
              >
                <span className="lang-icon">⚡</span> C++
              </button>
            </div>

            {/* Code Area */}
            <div className="code-editor-body">
              <Editor
                className="code-editor-wrapper"
                value={tempCodeText}
                onValueChange={code => setTempCodeText(code)}
                highlight={code => {
                  let grammar;
                  switch (tempCodeLanguage) {
                    case 'java': grammar = languages.java; break;
                    case 'python': grammar = languages.python; break;
                    case 'cpp': grammar = languages.cpp; break;
                    default: grammar = languages.clike;
                  }
                  return highlight(code, grammar || languages.clike);
                }}
                padding={15}
                style={{
                  fontFamily: '"Consolas", "Courier New", monospace',
                  fontSize: 14,
                  backgroundColor: '#1e1e1e',
                  minHeight: '100%',
                  color: '#d4d4d4',
                }}
                textareaClassName="code-editor-textarea"
              />
            </div>

            {/* Footer */}
            <div className="code-editor-footer">
              <button className="modal-btn cancel" onClick={() => setShowCodeModal(false)}>
                취소
              </button>
              <button className="modal-btn save" onClick={handleSaveCode}>
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiMentoringPage;
