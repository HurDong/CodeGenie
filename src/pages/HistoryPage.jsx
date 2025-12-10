import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import AuroraBackground from '../components/ui/AuroraBackground';

const HistoryPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock conversation history data - 알고리즘 문제 중심
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    // ... (rest of the effect)
    if (loading) return;
    let isMounted = true;

    const fetchHistory = async () => {
      // Admin Mock Data Override
      // Check for various admin identifiers
      const isAdmin = user?.name === 'admin' || user?.email === 'admin' || 
                      user?.email === 'admin@codegenie.com' || user?.name === 'Admin Developer';

      console.log('Running fetchHistory. isAdmin:', isAdmin, 'User:', user);

      if (isAdmin) {
          console.log("Admin user detected, using mock history data");
          if (isMounted) {
            setConversations(MOCK_HISTORY_DATA);
          }
          return;
      }

      try {
        const data = await api.getHistory();
        if (!isMounted) return;

        if (Array.isArray(data)) {
          const mappedData = data.map(item => ({
            ...item,
            topics: item.topics || [],
            category: item.category || 'etc',
            date: new Date(item.updatedAt || item.createdAt || Date.now()),
            status: item.status || 'ongoing'
          }));
          setConversations(mappedData);
        } else {
          console.error("History data is not an array:", data);
          setConversations([]);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Failed to fetch history:", error);
          setConversations([]);
        }
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, [user, loading]);

  const categories = {
    all: { label: '전체', icon: '📚', color: '#6366f1' },
    implementation: { label: '구현', icon: '⚙️', color: '#14b8a6' },
    graph: { label: '그래프/탐색', icon: '🕸️', color: '#8b5cf6' },
    greedy: { label: '그리디', icon: '💰', color: '#10b981' },
    etc: { label: '기타', icon: '📌', color: '#64748b' },
    dp: { label: '동적 프로그래밍', icon: '🔢', color: '#ec4899' },
    backtracking: { label: '백트래킹', icon: '🔙', color: '#a855f7' },
    search: { label: '이분 탐색', icon: '🔍', color: '#06b6d4' },
    sort: { label: '정렬', icon: '📊', color: '#f59e0b' },
    'two-pointer': { label: '투 포인터', icon: '👉', color: '#ef4444' }
  };

  const statusConfig = {
    new: { label: '신규', color: '#3b82f6' },
    ongoing: { label: '진행중', color: '#f59e0b' },
    resolved: { label: '완료', color: '#10b981' }
  };

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = selectedFilter === 'all' || conv.category === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  // Calculate statistics
  const stats = {
    total: conversations.length,
    resolved: conversations.filter(c => c.status === 'resolved').length,
    ongoing: conversations.filter(c => c.status === 'ongoing').length,
    streak: (() => {
      // 학습 연속일 계산: 대화가 있었던 날짜들을 추출하고 연속된 날짜 계산
      const dates = conversations
        .map(c => {
          const d = new Date(c.date);
          return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        })
        .sort((a, b) => b - a); // 최신순 정렬

      if (dates.length === 0) return 0;

      const uniqueDates = [...new Set(dates)];
      const today = new Date();
      const todayTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

      // 오늘 또는 어제부터 시작하는지 확인
      const oneDayMs = 24 * 60 * 60 * 1000;
      let streak = 0;
      let currentDate = todayTime;

      // 오늘 대화가 없으면 어제부터 시작
      if (!uniqueDates.includes(todayTime)) {
        currentDate = todayTime - oneDayMs;
      }

      // 연속된 날짜 카운트
      for (const date of uniqueDates) {
        if (date === currentDate) {
          streak++;
          currentDate -= oneDayMs;
        } else if (date < currentDate) {
          break;
        }
      }

      return streak;
    })(),
    maxStreak: (() => {
      // 최고 연속일 계산: 전체 기간에서 가장 긴 연속일 찾기
      const dates = conversations
        .map(c => {
          const d = new Date(c.date);
          return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        })
        .sort((a, b) => a - b); // 오래된순 정렬

      if (dates.length === 0) return 0;

      const uniqueDates = [...new Set(dates)];
      const oneDayMs = 24 * 60 * 60 * 1000;

      let maxStreak = 0;
      let currentStreak = 1;

      for (let i = 1; i < uniqueDates.length; i++) {
        if (uniqueDates[i] - uniqueDates[i - 1] === oneDayMs) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          maxStreak = Math.max(maxStreak, currentStreak);
          currentStreak = 1;
        }
      }

      return Math.max(maxStreak, currentStreak);
    })()
  };

  const formatDate = (date) => {
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) {
      return `${hours}시간 전`;
    } else if (hours < 48) {
      return '어제';
    } else {
      return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
    }
  };

  const handleRowClick = (convId) => {
    navigate('/ai-mentoring', { state: { conversationId: convId } });
  };

  return (
    <div className="history-page" style={{ minHeight: '100vh', width: '100%', position: 'relative' }}>
      <Navbar />
      <AuroraBackground>
          {/* Background Grid - Fixed */}
          <div style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              pointerEvents: 'none',
              zIndex: 0
          }} />

          {/* Scrollable Container */}
          <div className="history-container" style={{
             position: 'relative',
             zIndex: 1,
             boxSizing: 'border-box',
             padding: '1.5rem 2rem', /* Exact Dashboard Padding */
             paddingTop: '40px', /* Header Offset */
             paddingBottom: '60px',
             maxWidth: '1600px',
             margin: '0 auto',
             width: '100%' /* Fill parent */
          }}>
        <div className="history-header">
          <h1>대화 기록</h1>
          <p>AI 멘토와 나눈 모든 대화를 확인하고 관리하세요</p>
        </div>

        {/* Layout Container - Matching Dashboard Grid Gap */}
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem' /* Same gap as Dashboard */
        }}>
            
            {/* 1. Stats Block - Matching UserInfoSection Style */}
            <div style={{
                background: 'rgba(30, 41, 59, 0.6)',
                backdropFilter: 'blur(12px)',
                borderRadius: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '2rem 3rem',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '2rem',
                alignItems: 'center'
            }}>
                {[
                    { label: '총 대화', value: stats.total, icon: '💬', color: '#818cf8' },
                    { label: '완료', value: stats.resolved, icon: '✅', color: '#34d399' },
                    { label: '진행중', value: stats.ongoing, icon: '🔥', color: '#fbbf24' },
                    { label: '학습 연속일', value: `${stats.streak}일`, sub: `최고 기록: ${stats.maxStreak}일`, icon: '📆', color: '#f472b6' }
                ].map((stat, idx) => (
                    <div key={idx} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center', // Center align like Dashboard stats
                        justifyContent: 'center'
                    }}>
                        <div style={{ fontSize: '1rem', color: '#94a3b8', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{stat.icon}</span> {stat.label}
                        </div>
                        <div style={{ fontSize: '2.2rem', fontWeight: '700', color: stat.color === '#818cf8' ? '#fff' : stat.color }}>
                            {stat.value}
                        </div>
                        {stat.sub && (
                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                                {stat.sub}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* 2. Controls Block - Independent Glass Panel */}
            <div style={{
                background: 'rgba(30, 41, 59, 0.6)',
                backdropFilter: 'blur(12px)',
                borderRadius: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '1.5rem 2rem', // Compact padding for toolbar
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
            }}>
                <div className="search-wrapper" style={{ width: '100%' }}>
                    <input
                    type="text"
                    placeholder="대화 제목이나 주제로 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                    style={{ 
                        width: '100%', 
                        padding: '16px 20px', 
                        borderRadius: '12px',
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        fontSize: '1rem',
                        boxSizing: 'border-box'
                    }}
                    />
                </div>

                <div className="filter-tabs" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {Object.entries(categories)
                        .sort((a, b) => {
                            const [keyA, valA] = a;
                            const [keyB, valB] = b;
                            
                            // 1. 'All' always comes first
                            if (keyA === 'all') return -1;
                            if (keyB === 'all') return 1;
                            
                            // 2. 'Etc' always comes last
                            if (keyA === 'etc') return 1;
                            if (keyB === 'etc') return -1;
                            
                            // 3. Rest sorted alphabetically by label (Korean)
                            return valA.label.localeCompare(valB.label, 'ko');
                        })
                        .map(([key, { label, icon, color }]) => (
                    <button
                        key={key}
                        className={`filter-tab ${selectedFilter === key ? 'active' : ''}`}
                        onClick={() => setSelectedFilter(key)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            border: `1px solid ${selectedFilter === key ? color : 'rgba(255,255,255,0.1)'}`,
                            background: selectedFilter === key ? `${color}15` : 'rgba(15,23,42,0.4)',
                            color: selectedFilter === key ? color : '#94a3b8',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s',
                            fontWeight: selectedFilter === key ? '600' : '400'
                        }}
                    >
                        <span>{icon}</span> {label}
                    </button>
                    ))}
                </div>
            </div>

            {/* 3. Conversations Table - Independent Glass Panel */}
            <div className="conversations-table" style={{ 
                display: 'flex', 
                flexDirection: 'column',
                background: 'rgba(30, 41, 59, 0.6)', // Main glass background
                backdropFilter: 'blur(12px)',
                borderRadius: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
                overflow: 'hidden',
                minHeight: '400px'
            }}>
                <div className="table-header" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '2fr 1fr 1fr 1fr', 
                    padding: '24px 32px', 
                    background: 'rgba(15, 23, 42, 0.4)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    color: '#94a3b8', 
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    letterSpacing: '0.02em'
                }}>
                    <div>제목</div>
                    <div style={{ textAlign: 'center' }}>카테고리</div>
                    <div style={{ textAlign: 'center' }}>상태</div>
                    <div style={{ textAlign: 'right' }}>날짜</div>
                </div>

                <div className="table-body" style={{ display: 'flex', flexDirection: 'column' }}>
                    {filteredConversations.length > 0 ? (
                    filteredConversations.map((conv, index) => (
                        <div
                        key={conv.id}
                        className="table-row"
                        onClick={() => handleRowClick(conv.id)}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr 1fr 1fr',
                            alignItems: 'center',
                            padding: '24px 32px',
                            borderBottom: index !== filteredConversations.length - 1 ? '1px solid rgba(255, 255, 255, 0.03)' : 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            background: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                        >
                            <div className="col-title">
                                <div className="title-main" style={{ color: '#f1f5f9', fontWeight: '500', fontSize: '1.05rem', marginBottom: '6px' }}>{conv.title}</div>
                                <div className="title-topics" style={{ display: 'flex', gap: '8px' }}>
                                {conv.topics.map((topic, idx) => (
                                    <span key={idx} className="topic" style={{ 
                                        fontSize: '0.8rem', 
                                        color: '#64748b', 
                                    }}>#{topic}</span>
                                ))}
                                </div>
                            </div>
                            <div className="col-category" style={{ textAlign: 'center' }}>
                                <span className="category-badge" style={{ 
                                    color: categories[conv.category].color,
                                    background: `${categories[conv.category].color}10`,
                                    padding: '6px 14px',
                                    borderRadius: '20px',
                                    fontSize: '0.85rem',
                                    fontWeight: '500',
                                    display: 'inline-block'
                                }}>
                                {categories[conv.category].label}
                                </span>
                            </div>
                            <div className="col-status" style={{ textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
                                <span style={{ 
                                    color: statusConfig[conv.status].color,
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontWeight: '600'
                                }}>
                                    <span style={{ 
                                        width: '8px', 
                                        height: '8px', 
                                        borderRadius: '50%', 
                                        backgroundColor: statusConfig[conv.status].color,
                                        boxShadow: `0 0 10px ${statusConfig[conv.status].color}`
                                    }}></span>
                                    {statusConfig[conv.status].label}
                                </span>
                            </div>
                            <div className="col-date" style={{ textAlign: 'right', color: '#64748b', fontSize: '0.9rem' }}>{formatDate(conv.date)}</div>
                        </div>
                    ))
                    ) : (
                    <div className="empty-state" style={{ padding: '80px', textAlign: 'center', color: '#94a3b8' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.5 }}>📂</div>
                        <p style={{ fontSize: '1.1rem' }}>아직 대화 기록이 없습니다</p>
                        <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '8px' }}>새로운 멘토링을 시작해보세요!</p>
                    </div>
                    )}
                </div>
            </div>
        </div>
        </div>
      </AuroraBackground>
    </div>
  );
};

export default HistoryPage;

