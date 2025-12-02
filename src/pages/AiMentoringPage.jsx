import React, { useState, useEffect, useRef } from "react";
import toast from 'react-hot-toast';
import Navbar from "../components/Navbar";
import "../index.css";
import Editor from 'react-simple-code-editor';
import { api } from "../api/client";
import LanguageSelector from "../components/ui/LanguageSelector";
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/themes/prism-okaidia.css'; // Dark theme
import "./CodeEditor.css"; // Code editor styles
import UserProfile from "../components/UserProfile";

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
  const [chatSessions, setChatSessions] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);


  const [activeMode, setActiveMode] = useState(MODES.SOLUTION.id);
  const [input, setInput] = useState("");
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [tempProblemData, setTempProblemData] = useState({
    title: "",
    description: "",
    inputFormat: "",
    outputFormat: "",
    constraints: "",
    timeLimit: "",
    memoryLimit: "",
    examples: []
  });
  const [activeProblemTab, setActiveProblemTab] = useState("description");
  const [problemStep, setProblemStep] = useState("input"); // input | review
  const [tempCodeText, setTempCodeText] = useState("");
  const [tempCodeLanguage, setTempCodeLanguage] = useState("java");
  const [testCases, setTestCases] = useState([]);

  const [tempPlatform, setTempPlatform] = useState("baekjoon");
  const [tempProblemUrl, setTempProblemUrl] = useState("");
  const [isFetching, setIsFetching] = useState(false);

  // Title Modal State
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [titleModalMode, setTitleModalMode] = useState('create'); // 'create' | 'edit'
  const [tempTitle, setTempTitle] = useState("");
  const [targetChatId, setTargetChatId] = useState(null);

  const messagesEndRef = useRef(null);



  // Get current active chat
  const activeChat =
    chatSessions.find((chat) => chat.id === activeChatId) || chatSessions[0];
  const messages = activeChat?.messages || [];
  const currentMode =
    MODES[Object.keys(MODES).find((key) => MODES[key].id === activeMode)] ||
    MODES.SOLUTION;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChatId, messages.length]); // Scroll when chat changes or new messages arrive

  // Fetch history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await api.getHistory();
        if (Array.isArray(history)) {
          setChatSessions(history);
          if (history.length > 0) {
            setActiveChatId(history[0].id);
          }
        } else {
          console.error("History is not an array:", history);
          setChatSessions([]);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
        setChatSessions([]);
      }
    };
    fetchHistory();
  }, []);

  // Update mode when switching chats
  useEffect(() => {
    if (activeChat?.mode) {
      setActiveMode(activeChat.mode);
    }
  }, [activeChat?.mode]);

  const handleNewChat = () => {
    setTempTitle("");
    setTitleModalMode('create');
    setShowTitleModal(true);
  };

  const handleEditTitle = (chat) => {
    setTempTitle(chat.title);
    setTargetChatId(chat.id);
    setTitleModalMode('edit');
    setShowTitleModal(true);
  };

  const handleTitleSubmit = async () => {
    if (!tempTitle.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }

    try {
      if (titleModalMode === 'create') {
        const newChat = await api.startChat(activeMode, "", "", tempTitle);
        setChatSessions((prev) => [newChat, ...prev]);
        setActiveChatId(newChat.id);
        toast.success("새 대화가 시작되었습니다.");
      } else {
        // Edit mode
        await api.updateConversation(targetChatId, { title: tempTitle });
        setChatSessions((prev) => prev.map(chat =>
          chat.id === targetChatId ? { ...chat, title: tempTitle } : chat
        ));
        toast.success("제목이 수정되었습니다.");
      }
      setShowTitleModal(false);
    } catch (error) {
      console.error("Failed to save title:", error);
      toast.error("작업에 실패했습니다.");
    }
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
    if (activeChat?.problemSpec) {
      setTempProblemData(activeChat.problemSpec);
      setProblemStep("review");
    } else {
      setTempProblemData({
        title: "",
        description: activeChat?.problemText || "",
        inputFormat: "",
        outputFormat: "",
        constraints: "",
        timeLimit: "",
        memoryLimit: "",
        examples: []
      });
      setProblemStep("input");
    }
    setTempPlatform(activeChat?.platform || "baekjoon");
    setTempProblemUrl(activeChat?.problemUrl || "");
    setShowProblemModal(true);
  };

  // Default code templates
  const DEFAULT_CODE = {
    java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, CodeGenie!");
    }
}`,
    python: `print("Hello, CodeGenie!")`,
    cpp: `#include <iostream>

int main() {
    std::cout << "Hello, CodeGenie!" << std::endl;
    return 0;
}`,
    c: `#include <stdio.h>

int main() {
    printf("Hello, CodeGenie!\\n");
    return 0;
}`
  };

  const handleOpenCodeModal = () => {
    const savedCode = activeChat?.userCode;
    const savedLanguage = activeChat?.codeLanguage || "java";

    setTempCodeLanguage(savedLanguage);
    // Use saved code if exists, otherwise use default template for the language
    setTempCodeText(savedCode || DEFAULT_CODE[savedLanguage]);

    // Initialize test cases from problem spec if available
    if (activeChat?.problemSpec?.examples && activeChat.problemSpec.examples.length > 0) {
      setTestCases(activeChat.problemSpec.examples.map(ex => ({
        input: ex.input,
        expectedOutput: ex.output
      })));
    } else {
      setTestCases([{ input: "", expectedOutput: "" }]);
    }

    setShowCodeModal(true);
  };

  const handleSaveProblem = async () => {
    try {
      let chatId = activeChatId;
      if (!chatId) {
        const newChat = await api.startChat(activeMode, "", "");
        setChatSessions((prev) => [newChat, ...prev]);
        setActiveChatId(newChat.id);
        chatId = newChat.id;
      }

      await api.updateConversation(chatId, {
        problemSpec: tempProblemData,
        problemText: tempProblemData.description, // Fallback
        platform: tempPlatform,
        problemUrl: tempProblemUrl
      });

      setChatSessions((prevSessions) =>
        prevSessions.map((chat) => {
          if (chat.id === chatId) {
            return {
              ...chat,
              problemSpec: tempProblemData,
              problemText: tempProblemData.description,
              platform: tempPlatform,
              problemUrl: tempProblemUrl,
            };
          }
          return chat;
        })
      );
      setShowProblemModal(false);
    } catch (error) {
      console.error("Failed to save problem:", error);
      toast.error("문제 정보를 저장하는데 실패했습니다.");
    }
  };

  const handleSaveCode = async () => {
    try {
      let chatId = activeChatId;
      if (!chatId) {
        const newChat = await api.startChat(activeMode, "", "");
        setChatSessions((prev) => [newChat, ...prev]);
        setActiveChatId(newChat.id);
        chatId = newChat.id;
      }

      await api.updateConversation(chatId, {
        userCode: tempCodeText,
        codeLanguage: tempCodeLanguage
      });

      setChatSessions((prevSessions) =>
        prevSessions.map((chat) => {
          if (chat.id === chatId) {
            return { ...chat, userCode: tempCodeText, codeLanguage: tempCodeLanguage };
          }
          return chat;
        })
      );
      setShowCodeModal(false);
      toast.success("코드가 저장되었습니다.");
    } catch (error) {
      console.error("Failed to save code:", error);
      toast.error("코드 저장 실패");
    }
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
        setTempProblemData(data);
        setProblemStep("review");
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
        toast((t) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '250px' }}>
            <div style={{ fontWeight: '600' }}>서버 연결 실패 (백엔드 실행 필요)</div>
            <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>데모 데이터를 대신 불러오시겠습니까?</div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button
                onClick={() => toast.dismiss(t.id)}
                style={{
                  padding: '6px 12px',
                  background: 'transparent',
                  color: '#94a3b8',
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                취소
              </button>
              <button
                onClick={() => {
                  setTempProblemData({
                    title: "A+B",
                    description: "두 정수 A와 B를 입력받은 다음, A+B를 출력하는 프로그램을 작성하시오.",
                    inputFormat: "첫째 줄에 A와 B가 주어진다. (0 < A, B < 10)",
                    outputFormat: "첫째 줄에 A+B를 출력한다.",
                    constraints: "",
                    timeLimit: "1초",
                    memoryLimit: "128MB",
                    examples: [{ input: "1 2", output: "3" }]
                  });
                  setProblemStep("review");
                  toast.dismiss(t.id);
                }}
                style={{
                  padding: '6px 12px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '500'
                }}
              >
                불러오기
              </button>
            </div>
          </div>
        ), {
          duration: 8000,
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '16px',
          },
        });
        return;
      }

      toast.error(`문제 정보를 가져오는데 실패했습니다: ${error.message}`);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const currentChatId = activeChatId;
    const userMessageContent = input;
    setInput("");

    // Optimistic update
    const tempMessage = {
      role: "user",
      content: userMessageContent,
      timestamp: new Date().toISOString()
    };

    setChatSessions((prevSessions) =>
      prevSessions.map((chat) => {
        if (chat.id === currentChatId) {
          return {
            ...chat,
            messages: [...chat.messages, tempMessage],
          };
        }
        return chat;
      })
    );

    try {
      const aiMessage = await api.sendMessage(currentChatId, userMessageContent);

      setChatSessions((prevSessions) =>
        prevSessions.map((chat) => {
          if (chat.id === currentChatId) {
            return {
              ...chat,
              messages: [...chat.messages, aiMessage],
            };
          }
          return chat;
        })
      );
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("메시지 전송 실패");
    }
  };

  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);

  const handleRunCode = async () => {
    if (!tempCodeText.trim()) {
      toast.error("코드를 입력해주세요.");
      return;
    }

    setIsExecuting(true);
    setExecutionResult(null);

    try {
      const validTestCases = testCases.filter(tc => tc.input.trim() || tc.expectedOutput.trim());
      const result = await api.executeCode(tempCodeLanguage, tempCodeText, validTestCases);
      setExecutionResult(result);
      if (result.exitCode === 0) {
        toast.success("실행 완료");
      } else {
        toast.error("실행 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Execution failed:", error);
      toast.error("코드 실행에 실패했습니다.");
      setExecutionResult({
        error: "Server connection failed or timeout.",
        output: "",
        executionTimeMs: 0,
        exitCode: -1
      });
    } finally {
      setIsExecuting(false);
    }
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
                  <div className="history-item-content">
                    <div
                      className="history-item-title"
                    >
                      {chat.title}
                    </div>
                    <div className="history-item-date">
                      {new Date(chat.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    className="history-edit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditTitle(chat);
                    }}
                    title="제목 수정"
                  >
                    ✏️
                  </button>
                </div>
              );
            })}
          </div>
          <UserProfile />
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
                    {msg.content ? msg.content.split("\n").map((line, i) => (
                      <p key={i}>{line}</p>
                    )) : null}
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
              {/* Context Status Indicators - New IDE Style */}
              <div className="ide-controls">
                <button
                  className={`ide-btn ${activeChat?.problemText ? "active" : ""}`}
                  onClick={handleOpenProblemModal}
                  title={activeChat?.problemText ? "문제 수정" : "문제 입력"}
                >
                  <span className="icon">📄</span>
                  <span className="label">문제</span>
                  <div className="status-dot" title={activeChat?.problemText ? "입력됨" : "미입력"}></div>
                </button>
                <button
                  className={`ide-btn ${activeChat?.userCode ? "active" : ""}`}
                  onClick={handleOpenCodeModal}
                  title={activeChat?.userCode ? "코드 수정" : "코드 입력"}
                >
                  <span className="icon">⚡</span>
                  <span className="label">코드</span>
                  <div className="status-dot" title={activeChat?.userCode ? "작성됨" : "미작성"}></div>
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
      </div >

      {/* Problem Modal */}
      {
        showProblemModal && (
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

                {problemStep === 'input' ? (
                  <div className="step-input">
                    <label className="input-group-label">플랫폼 선택</label>
                    <div className="platform-grid">
                      <div
                        className={`platform-card ${tempPlatform === "baekjoon" ? "selected" : ""}`}
                        onClick={() => setTempPlatform("baekjoon")}
                      >
                        <img src="/CodeGenie/assets/boj_logo.png" alt="Baekjoon" className="platform-logo" />
                        <span className="platform-name">백준 (BOJ)</span>
                      </div>
                      <div
                        className={`platform-card ${tempPlatform === "programmers" ? "selected" : ""}`}
                        onClick={() => setTempPlatform("programmers")}
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
                        style={{ flex: 1 }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleFetchProblem();
                        }}
                      />
                      <button
                        className="modal-btn save"
                        style={{
                          whiteSpace: 'nowrap',
                          padding: '0 1.5rem',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          border: '1px solid var(--accent-color)',
                          height: '3.4rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onClick={handleFetchProblem}
                        disabled={isFetching}
                      >
                        {isFetching ? "분석 중..." : "가져오기"}
                      </button>
                    </div>

                    <div className="divider" style={{ margin: '2rem 0', display: 'flex', alignItems: 'center', gap: '1rem', color: '#64748b' }}>
                      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #334155, transparent)' }}></div>
                      <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>또는</span>
                      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #334155, transparent)' }}></div>
                    </div>

                    <button
                      className="modal-btn"
                      style={{
                        width: '100%',
                        background: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid #475569',
                        color: '#e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s',
                        padding: '1rem'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)';
                        e.currentTarget.style.borderColor = '#94a3b8';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(30, 41, 59, 0.5)';
                        e.currentTarget.style.borderColor = '#475569';
                        e.currentTarget.style.transform = 'none';
                      }}
                      onClick={() => setProblemStep('review')}
                    >
                      <span style={{ fontSize: '1.2rem' }}>✏️</span>
                      <span style={{ fontWeight: '600' }}>직접 입력하기</span>
                    </button>
                  </div>
                ) : (
                  <div className="step-review" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0, color: '#e2e8f0', fontSize: '1.1rem' }}>문제 정보 확인 및 수정</h4>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {tempProblemUrl && (
                          <button
                            className="ide-btn"
                            onClick={() => {
                              let url = tempProblemUrl;
                              if (tempPlatform === 'baekjoon' && /^\d+$/.test(url)) {
                                url = `https://www.acmicpc.net/problem/${url}`;
                              }
                              window.open(url, '_blank');
                            }}
                            style={{
                              padding: '6px 12px',
                              fontSize: '0.85rem',
                              background: 'rgba(59, 130, 246, 0.1)',
                              borderColor: 'rgba(59, 130, 246, 0.3)',
                              color: '#60a5fa',
                              gap: '6px'
                            }}
                            title="원본 문제 새 창에서 열기"
                          >
                            <span>🔗</span> 원본 보기
                          </button>
                        )}
                        <button
                          className="ide-btn"
                          onClick={() => setProblemStep('input')}
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.85rem',
                            gap: '6px'
                          }}
                        >
                          <span>↺</span> 다시 가져오기
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="input-group-label">문제 제목</label>
                      <input
                        className="modal-input"
                        value={tempProblemData.title || ""}
                        onChange={(e) => setTempProblemData({ ...tempProblemData, title: e.target.value })}
                        placeholder="문제 제목"
                      />
                    </div>

                    <div className="info-grid">
                      <div className="info-row">
                        <div className="info-col">
                          <label className="input-group-label">시간 제한</label>
                          <input
                            className="modal-input"
                            value={tempProblemData.timeLimit || ""}
                            onChange={(e) => setTempProblemData({ ...tempProblemData, timeLimit: e.target.value })}
                            placeholder="예: 1초"
                          />
                        </div>
                        <div className="info-col">
                          <label className="input-group-label">메모리 제한</label>
                          <input
                            className="modal-input"
                            value={tempProblemData.memoryLimit || ""}
                            onChange={(e) => setTempProblemData({ ...tempProblemData, memoryLimit: e.target.value })}
                            placeholder="예: 128MB"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="input-group-label">문제 설명</label>
                      <textarea
                        className="modal-textarea"
                        value={tempProblemData.description || ""}
                        onChange={(e) => setTempProblemData({ ...tempProblemData, description: e.target.value })}
                        placeholder="문제 설명을 입력하세요."
                        rows="8"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label className="input-group-label">입력 형식</label>
                        <textarea
                          className="modal-textarea"
                          value={tempProblemData.inputFormat || ""}
                          onChange={(e) => setTempProblemData({ ...tempProblemData, inputFormat: e.target.value })}
                          rows="4"
                        />
                      </div>
                      <div>
                        <label className="input-group-label">출력 형식</label>
                        <textarea
                          className="modal-textarea"
                          value={tempProblemData.outputFormat || ""}
                          onChange={(e) => setTempProblemData({ ...tempProblemData, outputFormat: e.target.value })}
                          rows="4"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="input-group-label">예제 ({tempProblemData.examples?.length || 0})</label>
                      <div className="examples-list">
                        {(tempProblemData.examples || []).map((ex, idx) => (
                          <div key={idx} className="example-item" style={{ marginBottom: '1rem', border: '1px solid #333', padding: '1rem', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                              <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>예제 {idx + 1}</span>
                              <button
                                onClick={() => {
                                  const newExamples = [...tempProblemData.examples];
                                  newExamples.splice(idx, 1);
                                  setTempProblemData({ ...tempProblemData, examples: newExamples });
                                }}
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                              >
                                삭제
                              </button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                              <div>
                                <label style={{ fontSize: '0.8rem', color: '#888' }}>입력</label>
                                <textarea
                                  className="modal-textarea"
                                  value={ex.input}
                                  onChange={(e) => {
                                    const newExamples = [...tempProblemData.examples];
                                    newExamples[idx].input = e.target.value;
                                    setTempProblemData({ ...tempProblemData, examples: newExamples });
                                  }}
                                  rows="3"
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: '0.8rem', color: '#888' }}>출력</label>
                                <textarea
                                  className="modal-textarea"
                                  value={ex.output}
                                  onChange={(e) => {
                                    const newExamples = [...tempProblemData.examples];
                                    newExamples[idx].output = e.target.value;
                                    setTempProblemData({ ...tempProblemData, examples: newExamples });
                                  }}
                                  rows="3"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => setTempProblemData({
                          ...tempProblemData,
                          examples: [...(tempProblemData.examples || []), { input: "", output: "" }]
                        })}
                        className="modal-btn secondary"
                        style={{ width: '100%', marginTop: '0.5rem' }}
                      >
                        + 예제 추가
                      </button>
                    </div>
                  </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="modal-btn cancel"
                onClick={() => setShowProblemModal(false)}
              >
                취소
              </button>
              {problemStep === 'review' && (
                <button className="modal-btn save" onClick={handleSaveProblem}>
                  저장하기
                </button>
              )}
            </div>
          </div>
        </div>
  )
}

      {/* Code Modal */}
      {
        showCodeModal && (
          <div className="modal-overlay" onClick={() => setShowCodeModal(false)}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>⌨️ 코드 입력</h3>
                <div className="language-selector-wrapper">
                  <LanguageSelector
                    currentLanguage={tempCodeLanguage}
                    onLanguageChange={(newLang) => {
                      setTempCodeLanguage(newLang);
                      // If current code is empty or matches one of the default templates, switch to new template
                      const isDefaultOrEmpty = !tempCodeText.trim() || Object.values(DEFAULT_CODE).some(code => code.trim() === tempCodeText.trim());

                      if (isDefaultOrEmpty) {
                        setTempCodeText(DEFAULT_CODE[newLang]);
                      }
                    }}
                  />
                </div>
                <button
                  className="modal-close"
                  onClick={() => setShowCodeModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body code-body">
                <div className="code-editor-wrapper">
                  <Editor
                    value={tempCodeText}
                    onValueChange={(code) => setTempCodeText(code)}
                    highlight={(code) => highlight(code, languages[tempCodeLanguage] || languages.clike)}
                    padding={15}
                    className="code-editor"
                    style={{
                      fontFamily: '"Fira Code", "Fira Mono", monospace',
                      fontSize: 14,
                      minHeight: '300px',
                    }}
                    placeholder="// 여기에 코드를 붙여넣거나 작성하세요..."
                  />
                </div>

                {/* Bottom Tabs */}
                <div className="bottom-tabs" style={{ marginTop: '1rem', borderTop: '1px solid #333' }}>
                  <div className="tab-headers" style={{ display: 'flex', borderBottom: '1px solid #333' }}>
                    <button
                      className={`tab-btn ${!executionResult ? 'active' : ''}`}
                      onClick={() => setExecutionResult(null)}
                      style={{
                        padding: '10px 16px',
                        background: !executionResult ? 'rgba(255,255,255,0.05)' : 'transparent',
                        border: 'none',
                        borderBottom: !executionResult ? '2px solid #3b82f6' : '2px solid transparent',
                        color: !executionResult ? '#fff' : '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}
                    >
                      테스트 케이스 설정
                    </button>
                    <button
                      className={`tab-btn ${executionResult ? 'active' : ''}`}
                      onClick={() => {
                        if (executionResult) {
                          // Just switch tab if result exists
                        }
                      }}
                      style={{
                        padding: '10px 16px',
                        background: executionResult ? 'rgba(255,255,255,0.05)' : 'transparent',
                        border: 'none',
                        borderBottom: executionResult ? '2px solid #3b82f6' : '2px solid transparent',
                        color: executionResult ? '#fff' : '#94a3b8',
                        cursor: executionResult ? 'pointer' : 'default',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        opacity: executionResult ? 1 : 0.5
                      }}
                    >
                      실행 결과 {executionResult && (executionResult.allPassed ? '✅' : '❌')}
                    </button>
                  </div>

                  <div className="tab-content" style={{ padding: '1rem', minHeight: '200px' }}>
                    {!executionResult ? (
                      /* Test Cases Input Tab */
                      <div className="test-cases-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                            코드를 실행할 때 사용할 테스트 케이스를 입력하세요.
                          </span>
                          <button
                            onClick={() => setTestCases([...testCases, { input: "", expectedOutput: "" }])}
                            style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' }}
                          >
                            + 케이스 추가
                          </button>
                        </div>
                        <div className="test-cases-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '5px' }}>
                          {testCases.map((tc, idx) => (
                            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 30px', gap: '1rem', alignItems: 'start', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid #333' }}>
                              <div>
                                <label style={{ display: 'block', color: '#64748b', fontSize: '0.8rem', marginBottom: '4px' }}>입력 (Input)</label>
                                <textarea
                                  value={tc.input}
                                  onChange={(e) => {
                                    const newCases = [...testCases];
                                    newCases[idx].input = e.target.value;
                                    setTestCases(newCases);
                                  }}
                                  className="modal-textarea"
                                  rows="2"
                                  style={{ fontSize: '0.9rem', padding: '0.5rem', minHeight: '60px', resize: 'vertical', width: '100%', background: '#0f172a' }}
                                />
                              </div>
                              <div>
                                <label style={{ display: 'block', color: '#64748b', fontSize: '0.8rem', marginBottom: '4px' }}>예상 출력 (Expected Output)</label>
                                <textarea
                                  value={tc.expectedOutput}
                                  onChange={(e) => {
                                    const newCases = [...testCases];
                                    newCases[idx].expectedOutput = e.target.value;
                                    setTestCases(newCases);
                                  }}
                                  className="modal-textarea"
                                  rows="2"
                                  style={{ fontSize: '0.9rem', padding: '0.5rem', minHeight: '60px', resize: 'vertical', width: '100%', background: '#0f172a' }}
                                />
                              </div>
                              <button
                                onClick={() => {
                                  const newCases = [...testCases];
                                  newCases.splice(idx, 1);
                                  setTestCases(newCases);
                                }}
                                style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', marginTop: '2rem', padding: '4px' }}
                                title="삭제"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* Execution Result Tab */
                      <div className="terminal-output" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div className="terminal-header" style={{ marginBottom: '1rem' }}>
                          <span style={{ fontSize: '1rem', fontWeight: '600', color: '#e2e8f0' }}>
                            {executionResult.testResults ? "테스트 결과 리포트" : "콘솔 출력"}
                          </span>
                          <span className="execution-time" style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                            ⏱ 소요 시간: {executionResult.executionTimeMs}ms
                          </span>
                        </div>
                        <div className="terminal-body" style={{ flex: 1, overflowY: 'auto', maxHeight: '250px' }}>
                          {executionResult.testResults ? (
                            <div className="test-results-list">
                              <div style={{
                                marginBottom: '1rem',
                                padding: '1rem',
                                borderRadius: '8px',
                                background: executionResult.allPassed ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                border: `1px solid ${executionResult.allPassed ? 'rgba(74, 222, 128, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                              }}>
                                <span style={{ fontSize: '1.5rem' }}>{executionResult.allPassed ? "🎉" : "⚠️"}</span>
                                <div>
                                  <div style={{ fontWeight: 'bold', color: executionResult.allPassed ? '#4ade80' : '#ef4444', fontSize: '1.1rem' }}>
                                    {executionResult.allPassed ? "모든 테스트 케이스 통과!" : "일부 테스트 케이스 실패"}
                                  </div>
                                  <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginTop: '2px' }}>
                                    총 {executionResult.testResults.length}개 중 {executionResult.testResults.filter(r => r.passed).length}개 성공
                                  </div>
                                </div>
                              </div>

                              {executionResult.testResults.map((res, idx) => (
                                <div key={idx} style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: `4px solid ${res.passed ? '#4ade80' : '#ef4444'}` }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '1rem', color: '#e2e8f0' }}>Case #{idx + 1}</span>
                                    <span style={{
                                      color: res.passed ? '#4ade80' : '#ef4444',
                                      fontSize: '0.85rem',
                                      fontWeight: 'bold',
                                      padding: '4px 10px',
                                      borderRadius: '4px',
                                      background: res.passed ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                                    }}>
                                      {res.passed ? "PASS" : "FAIL"}
                                    </span>
                                  </div>
                                  <div style={{ display: 'grid', gap: '8px', fontSize: '0.9rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
                                      <span style={{ color: '#94a3b8' }}>입력값:</span>
                                      <code style={{ fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: '4px', color: '#e2e8f0' }}>{res.input}</code>
                                    </div>
                                    {!res.passed ? (
                                      <>
                                        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
                                          <span style={{ color: '#94a3b8' }}>예상 결과:</span>
                                          <code style={{ fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: '4px', color: '#a5f3fc' }}>{res.expectedOutput}</code>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
                                          <span style={{ color: '#94a3b8' }}>실제 결과:</span>
                                          <code style={{ fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: '4px', color: '#fca5a5' }}>{res.actualOutput || "(출력 없음)"}</code>
                                        </div>
                                        {res.error && (
                                          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px', marginTop: '4px' }}>
                                            <span style={{ color: '#ef4444' }}>에러:</span>
                                            <span style={{ color: '#ef4444', fontFamily: 'monospace' }}>{res.error}</span>
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
                                        <span style={{ color: '#94a3b8' }}>출력값:</span>
                                        <code style={{ fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: '4px', color: '#94a3b8' }}>{res.actualOutput}</code>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <>
                              {executionResult.output && (
                                <pre className="output-text" style={{ padding: '1rem', background: '#0f172a', borderRadius: '6px' }}>{executionResult.output}</pre>
                              )}
                              {executionResult.error && (
                                <pre className="error-text" style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px' }}>{executionResult.error}</pre>
                              )}
                              {executionResult.exitCode !== 0 && !executionResult.error && (
                                <div className="exit-code-error">
                                  Process exited with code {executionResult.exitCode}
                                </div>
                              )}
                              {!executionResult.output && !executionResult.error && (
                                <div className="empty-output" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>출력 결과가 없습니다.</div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-footer space-between">
                  <div className="left-actions">
                    <button
                      className={`neon-run-btn ${isExecuting ? 'loading' : ''}`}
                      onClick={handleRunCode}
                      disabled={isExecuting}
                    >
                      {isExecuting ? (
                        <>
                          <span className="spinner"></span> 실행 중...
                        </>
                      ) : (
                        <>
                          <span className="play-icon">▶</span> 코드 실행
                        </>
                      )}
                    </button>
                  </div>
                  <div className="right-actions">
                    <button
                      className="neon-cancel-btn"
                      onClick={() => setShowCodeModal(false)}
                    >
                      취소
                    </button>
                    <button className="neon-save-btn" onClick={handleSaveCode}>
                      저장하기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }


      {/* Title Modal */}
      {
        showTitleModal && (
          <div className="modal-overlay" onClick={() => setShowTitleModal(false)}>
            <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{titleModalMode === 'create' ? '새 대화 시작' : '제목 수정'}</h3>
                <button className="modal-close" onClick={() => setShowTitleModal(false)}>✕</button>
              </div>
              <div className="modal-body">
                <label className="input-group-label">대화 주제 (제목)</label>
                <input
                  className="modal-input"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  placeholder="예: 백준 1000번 문제 풀이"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTitleSubmit();
                  }}
                />
              </div>
              <div className="modal-footer">
                <button className="modal-btn cancel" onClick={() => setShowTitleModal(false)}>취소</button>
                <button className="modal-btn save" onClick={handleTitleSubmit}>
                  {titleModalMode === 'create' ? '시작하기' : '저장하기'}
                </button>
              </div>
            </div>
          </div>
        )
      }

    </div >
  );
};

export default AiMentoringPage;
