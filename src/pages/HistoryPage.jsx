import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import AuroraBackground from '../components/ui/AuroraBackground';

import './HistoryPage.css';

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
      // 학습 연속일 계산
      const dates = conversations
        .map(c => {
          const d = new Date(c.date);
          return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        })
        .sort((a, b) => b - a);

      if (dates.length === 0) return 0;

      const uniqueDates = [...new Set(dates)];
      const today = new Date();
      const todayTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
      const oneDayMs = 24 * 60 * 60 * 1000;
      let streak = 0;
      let currentDate = todayTime;

      if (!uniqueDates.includes(todayTime)) {
        currentDate = todayTime - oneDayMs;
      }

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
      // 최고 연속일 계산
      const dates = conversations
        .map(c => {
          const d = new Date(c.date);
          return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        })
        .sort((a, b) => a - b);

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
    <div className="history-page">
      <Navbar />
      <AuroraBackground>
          {/* Background Grid */}
          <div className="bg-grid" />

          {/* Scrollable Container */}
          <div className="history-container">
            <div className="history-header">
              <h1>대화 기록</h1>
              <p>AI 멘토와 나눈 모든 대화를 확인하고 관리하세요</p>
            </div>

            {/* Layout Container */}
            <div className="history-layout">
                
                {/* 1. Stats Block */}
                <div className="history-card history-stats-card">
                    {[
                        { label: '총 대화', value: stats.total, icon: '💬', color: '#818cf8' },
                        { label: '완료', value: stats.resolved, icon: '✅', color: '#34d399' },
                        { label: '진행중', value: stats.ongoing, icon: '🔥', color: '#fbbf24' },
                        { label: '학습 연속일', value: `${stats.streak}일`, sub: `최고 기록: ${stats.maxStreak}일`, icon: '📆', color: '#f472b6' }
                    ].map((stat, idx) => (
                        <div key={idx} className="history-stat-item">
                            <div className="history-stat-label">
                                <span>{stat.icon}</span> {stat.label}
                            </div>
                            <div className="history-stat-value" style={{ color: stat.color === '#818cf8' && document.documentElement.getAttribute('data-theme') === 'light' ? 'var(--text-primary)' : stat.color }}>
                                {/* Note: For specific color logic, we might keep inline, or rely on CSS classes if we want more theme control for colors */}
                                <span style={{ color: stat.color }}>{stat.value}</span>
                            </div>
                            {stat.sub && (
                                <div className="history-stat-sub">
                                    {stat.sub}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* 2. Controls Block */}
                <div className="history-card history-controls-card">
                    <div className="search-wrapper">
                        <input
                        type="text"
                        placeholder="대화 제목이나 주제로 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                        />
                    </div>

                    <div className="filter-tabs">
                        {Object.entries(categories)
                            .sort((a, b) => {
                                const [keyA, valA] = a;
                                const [keyB, valB] = b;
                                if (keyA === 'all') return -1;
                                if (keyB === 'all') return 1;
                                if (keyA === 'etc') return 1;
                                if (keyB === 'etc') return -1;
                                return valA.label.localeCompare(valB.label, 'ko');
                            })
                            .map(([key, { label, icon, color }]) => (
                        <button
                            key={key}
                            className={`filter-tab ${selectedFilter === key ? 'active' : ''}`}
                            onClick={() => setSelectedFilter(key)}
                            style={{
                                // Dynamic theme aware styles for button border/bg when active
                                borderColor: selectedFilter === key ? color : 'transparent',
                                backgroundColor: selectedFilter === key ? `${color}15` : undefined,
                                color: selectedFilter === key ? color : undefined
                            }}
                        >
                            <span>{icon}</span> {label}
                        </button>
                        ))}
                    </div>
                </div>

                {/* 3. Conversations Table */}
                <div className="history-card history-table-card">
                    <div className="table-header">
                        <div>제목</div>
                        <div style={{ textAlign: 'center' }}>카테고리</div>
                        <div style={{ textAlign: 'center' }}>상태</div>
                        <div style={{ textAlign: 'right' }}>날짜</div>
                    </div>

                    <div className="table-body">
                        {filteredConversations.length > 0 ? (
                        filteredConversations.map((conv, index) => (
                            <div
                            key={conv.id}
                            className="table-row"
                            onClick={() => handleRowClick(conv.id)}
                            >
                                <div className="col-title">
                                    <div className="title-main">{conv.title}</div>
                                    <div className="title-topics">
                                    {conv.topics.map((topic, idx) => (
                                        <span key={idx} className="topic">#{topic}</span>
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
                                <div className="col-date">{formatDate(conv.date)}</div>
                            </div>
                        ))
                        ) : (
                        <div className="empty-state">
                            <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.5 }}>📂</div>
                            <p style={{ fontSize: '1.1rem' }}>아직 대화 기록이 없습니다</p>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px' }}>새로운 멘토링을 시작해보세요!</p>
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

