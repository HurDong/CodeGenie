import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const HistoryPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock conversation history data - 알고리즘 문제 중심
  const [conversations] = useState([
    {
      id: 1,
      title: '동적 프로그래밍 - 피보나치',
      date: new Date('2025-11-25T14:30:00'),
      category: 'dp',
      messageCount: 15,
      duration: '25분',
      topics: ['동적 프로그래밍'],
      lastMessage: '동적 프로그래밍의 핵심은 중복 계산을 제거하는 것입니다...',
      status: 'resolved'
    },
    {
      id: 2,
      title: 'DFS/BFS - 미로 탈출',
      date: new Date('2025-11-25T13:15:00'),
      category: 'graph',
      messageCount: 18,
      duration: '32분',
      topics: ['그래프/탐색'],
      lastMessage: 'BFS는 최단 경로를 찾는 데 유용합니다. 큐를 활용하여...',
      status: 'ongoing'
    },
    {
      id: 3,
      title: '그리디 알고리즘 - 동전 거스름돈',
      date: new Date('2025-11-25T11:20:00'),
      category: 'greedy',
      messageCount: 12,
      duration: '18분',
      topics: ['그리디'],
      lastMessage: '그리디가 항상 최적해를 보장하는지 증명이 필요합니다...',
      status: 'resolved'
    },
    {
      id: 4,
      title: '이분 탐색 - 정렬된 배열',
      date: new Date('2025-11-24T16:45:00'),
      category: 'search',
      messageCount: 10,
      duration: '15분',
      topics: ['이분 탐색'],
      lastMessage: '이분 탐색의 종료 조건과 경계값 처리가 핵심입니다...',
      status: 'resolved'
    },
    {
      id: 5,
      title: '정렬 알고리즘 비교',
      date: new Date('2025-11-24T10:30:00'),
      category: 'sort',
      messageCount: 22,
      duration: '35분',
      topics: ['정렬'],
      lastMessage: '각 정렬 알고리즘의 장단점과 사용 시나리오를 이해했습니다...',
      status: 'resolved'
    },
    {
      id: 6,
      title: '투 포인터 - 부분합 구하기',
      date: new Date('2025-11-23T15:00:00'),
      category: 'two-pointer',
      messageCount: 14,
      duration: '22분',
      topics: ['투 포인터'],
      lastMessage: '투 포인터 기법으로 O(n²)을 O(n)으로 개선했습니다...',
      status: 'resolved'
    },
    {
      id: 7,
      title: '백트래킹 - N-Queen 문제',
      date: new Date('2025-11-22T14:00:00'),
      category: 'backtracking',
      messageCount: 28,
      duration: '45분',
      topics: ['백트래킹'],
      lastMessage: '가지치기를 통해 불필요한 탐색을 줄이는 것이 핵심입니다...',
      status: 'resolved'
    },
    {
      id: 8,
      title: '구현 - 시뮬레이션 문제',
      date: new Date('2025-11-21T16:30:00'),
      category: 'implementation',
      messageCount: 15,
      duration: '28분',
      topics: ['구현'],
      lastMessage: '복잡한 조건을 차근차근 구현하는 것이 중요합니다...',
      status: 'resolved'
    },
    {
      id: 9,
      title: '기타 - 문제 풀이 전략',
      date: new Date('2025-11-20T11:00:00'),
      category: 'etc',
      messageCount: 8,
      duration: '12분',
      topics: ['기타'],
      lastMessage: '알고리즘 문제를 효과적으로 접근하는 방법에 대해 논의했습니다...',
      status: 'ongoing'
    }
  ]);

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
    <div className="history-page">
      <Navbar />
      
      <div className="history-container">
        {/* Header */}
        <div className="history-header">
          <h1>대화 기록</h1>
          <p>AI 멘토와 나눈 모든 대화를 확인하고 관리하세요</p>
        </div>

        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-item">
            <div className="stat-label">총 대화</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">완료</div>
            <div className="stat-value">{stats.resolved}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">진행중</div>
            <div className="stat-value">{stats.ongoing}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">학습 연속일</div>
            <div className="stat-value">
              {stats.streak}일
              {stats.streak === stats.maxStreak && stats.streak > 0 ? ' 🔥' : ''}
            </div>
            <div className="stat-subtitle">
              최고 기록: {stats.maxStreak}일
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="history-controls">
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
            {Object.entries(categories).map(([key, { label }]) => (
              <button
                key={key}
                className={`filter-tab ${selectedFilter === key ? 'active' : ''}`}
                onClick={() => setSelectedFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversations Table */}
        <div className="conversations-table">
          <div className="table-header">
            <div className="col-title">제목</div>
            <div className="col-category">카테고리</div>
            <div className="col-status">상태</div>
            <div className="col-date">날짜</div>
          </div>

          <div className="table-body">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  className="table-row"
                  onClick={() => handleRowClick(conv.id)}
                >
                  <div className="col-title">
                    <div className="title-main">{conv.title}</div>
                    <div className="title-topics">
                      {conv.topics.map((topic, idx) => (
                        <span key={idx} className="topic">{topic}</span>
                      ))}
                    </div>
                  </div>
                  <div className="col-category">
                    <span className="category-badge" style={{ color: categories[conv.category].color }}>
                      {categories[conv.category].label}
                    </span>
                  </div>
                  <div className="col-status">
                    <span className="status-dot" style={{ backgroundColor: statusConfig[conv.status].color }}></span>
                    {statusConfig[conv.status].label}
                  </div>
                  <div className="col-date">{formatDate(conv.date)}</div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>검색 결과가 없습니다</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;

