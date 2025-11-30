import React, { useState, useEffect, useRef } from "react";
import toast from 'react-hot-toast';
import Navbar from "../components/Navbar";
import "../index.css";
import Editor from 'react-simple-code-editor';
import { api } from "../api/client";
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

  const [tempPlatform, setTempPlatform] = useState("baekjoon");
  const [tempProblemUrl, setTempProblemUrl] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  
  // Title Modal State
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [titleModalMode, setTitleModalMode] = useState('create'); // 'create' | 'edit'
  const [tempTitle, setTempTitle] = useState("");
  const [targetChatId, setTargetChatId] = useState(null);

  const messagesEndRef = useRef(null);

  // Tooltip State
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, text: "" });

  const handleTooltipEnter = (e, text) => {
    if (e.target.scrollWidth > e.target.clientWidth) {
      const rect = e.target.getBoundingClientRect();
      setTooltip({
        visible: true,
        x: rect.right + 15,
        y: rect.top + (rect.height / 2),
        text
      });
    }
  };

  const handleTooltipLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

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

  // Fetch history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await api.getHistory();
        setChatSessions(history);
        if (history.length > 0) {
          setActiveChatId(history[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      }
    };
    fetchHistory();
  }, []);

  // Update mode when switching chats
  useEffect(() => {
    if (activeChat) {
      setActiveMode(activeChat.mode || MODES.SOLUTION.id);
    }
  }, [activeChatId, activeChat]);

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

  const handleOpenCodeModal = () => {
    setTempCodeText(activeChat?.userCode || "");
    setTempCodeLanguage(activeChat?.codeLanguage || "java");

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
              className={`history-item ${
                chat.id === activeChatId ? "active" : ""
              }`}
              onClick={() => setActiveChatId(chat.id)}
            >
              <div className="history-item-content">
                <div 
                  className="history-item-title" 
                  onMouseEnter={(e) => handleTooltipEnter(e, chat.title)}
                  onMouseLeave={handleTooltipLeave}
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
                      style={{ height: '42px', whiteSpace: 'nowrap' }}
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
                    <h4 style={{ margin: 0, color: '#3b82f6' }}>문제 정보 확인 및 수정</h4>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {tempProblemUrl && (
                        <button
                          onClick={() => {
                            let url = tempProblemUrl;
                            if (tempPlatform === 'baekjoon' && /^\d+$/.test(url)) {
                              url = `https://www.acmicpc.net/problem/${url}`;
                            }
                            window.open(url, '_blank');
                          }}
                          style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="원본 문제 새 창에서 열기"
                        >
                          🔗 원본 보기
                        </button>
                      )}
                      <button 
                        onClick={() => setProblemStep('input')}
                        style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.9rem' }}
                      >
                        ← 다시 가져오기
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
                              ✕
                            </button>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <textarea
                              className="modal-textarea"
                              value={ex.input || ""}
                              onChange={(e) => {
                                const newExamples = [...tempProblemData.examples];
                                newExamples[idx].input = e.target.value;
                                setTempProblemData({ ...tempProblemData, examples: newExamples });
                              }}
                              placeholder="입력"
                              rows="2"
                            />
                            <textarea
                              className="modal-textarea"
                              value={ex.output || ""}
                              onChange={(e) => {
                                const newExamples = [...tempProblemData.examples];
                                newExamples[idx].output = e.target.value;
                                setTempProblemData({ ...tempProblemData, examples: newExamples });
                              }}
                              placeholder="출력"
                              rows="2"
                            />
                          </div>
                        </div>
                      ))}
                      <button
                        className="modal-btn"
                        style={{ width: '100%', marginTop: '0.5rem', backgroundColor: '#333', fontSize: '0.9rem' }}
                        onClick={() => {
                          setTempProblemData({
                            ...tempProblemData,
                            examples: [...(tempProblemData.examples || []), { input: "", output: "" }]
                          });
                        }}
                      >
                        + 예제 추가
                      </button>
                    </div>
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
                  저장
                </button>
              )}
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
      {/* Custom Tooltip */}
      {tooltip.visible && (
        <div 
          style={{
            position: 'fixed',
            top: tooltip.y,
            left: tooltip.x,
            transform: 'translateY(-50%)',
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#f1f5f9',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: '500',
            pointerEvents: 'none',
            zIndex: 10000,
            border: '1px solid rgba(59, 130, 246, 0.2)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            whiteSpace: 'nowrap',
            maxWidth: '400px',
            backdropFilter: 'blur(4px)',
          }}
        >
          {tooltip.text}
        </div>
      )}

      {/* Title Modal */}
      {showTitleModal && (
        <div className="modal-overlay" onClick={() => setShowTitleModal(false)}>
          <div className="modal-content" style={{ width: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{titleModalMode === 'create' ? '새 대화 시작' : '제목 수정'}</h3>
              <button className="modal-close" onClick={() => setShowTitleModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <label className="input-group-label">대화 제목</label>
              <input
                className="modal-input"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSubmit();
                }}
              />
            </div>
            <div className="modal-footer">
              <button className="modal-btn cancel" onClick={() => setShowTitleModal(false)}>취소</button>
              <button className="modal-btn save" onClick={handleTitleSubmit}>
                {titleModalMode === 'create' ? '시작하기' : '수정하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiMentoringPage;
