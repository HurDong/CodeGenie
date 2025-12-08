import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AlgorithmSkillTree from '../components/AlgorithmSkillTree';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import AuroraBackground from '../components/ui/AuroraBackground';
import '../index.css';

const DashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total: 0,
        resolved: 0,
        streak: 0,
        recent: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const history = await api.getHistory();
                if (Array.isArray(history)) {
                    const total = history.length;
                    const resolved = history.filter(c => c.status === 'resolved').length;
                    const dates = history.map(c => new Date(c.updatedAt || c.createdAt).toDateString());
                    const uniqueDates = [...new Set(dates)];
                    
                    setStats({
                        total,
                        resolved,
                        streak: uniqueDates.length,
                        recent: history.slice(0, 3)
                    });
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="dashboard-page" style={{ minHeight: '100vh', position: 'relative' }}>
            <Navbar />
            <AuroraBackground>
                {/* Grid Overlay for Texture */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
                    backgroundSize: '30px 30px',
                    pointerEvents: 'none',
                    zIndex: 0
                }} />

                <div className="dashboard-container" style={{ 
                    maxWidth: '1200px', 
                    margin: '0 auto', 
                    padding: '2rem', 
                    paddingTop: '100px',
                    position: 'relative',
                    zIndex: 1,
                    width: '100%'
                }}>
                    {/* Welcome Header */}
                    <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
                        <h1 style={{ 
                            fontSize: '2.5rem', 
                            fontWeight: '800', 
                            marginBottom: '0.5rem',
                            background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textShadow: '0 2px 10px rgba(0,0,0,0.1)'
                        }}>
                            반갑습니다, {user?.name || 'User'}님! 👋
                        </h1>
                        <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
                            오늘도 새로운 알고리즘 행성을 탐험해볼까요?
                        </p>
                    </header>

                    {/* Stats Grid */}
                    <div className="stats-grid" style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                        gap: '1.5rem', 
                        marginBottom: '3rem' 
                    }}>
                        <div className="stat-card" style={{ 
                            background: 'rgba(30, 41, 59, 0.6)', 
                            backdropFilter: 'blur(12px)',
                            padding: '1.5rem', 
                            borderRadius: '1.5rem', 
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
                            transition: 'transform 0.2s',
                            cursor: 'default'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>📚</span> 총 학습
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#60a5fa' }}>{stats.total}</div>
                        </div>
                        <div className="stat-card" style={{ 
                            background: 'rgba(30, 41, 59, 0.6)', 
                            backdropFilter: 'blur(12px)',
                            padding: '1.5rem', 
                            borderRadius: '1.5rem', 
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>✅</span> 해결한 문제
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#34d399' }}>{stats.resolved}</div>
                        </div>
                        <div className="stat-card" style={{ 
                            background: 'rgba(30, 41, 59, 0.6)', 
                            backdropFilter: 'blur(12px)',
                            padding: '1.5rem', 
                            borderRadius: '1.5rem', 
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>🔥</span> 누적 학습일
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#f472b6' }}>{stats.streak}일</div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="dashboard-main" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '2rem' }}>
                        
                        {/* Left Col: Algorithm Graph via Three.js */}
                        <div className="graph-section" style={{
                            background: 'rgba(15, 23, 42, 0.6)',
                            backdropFilter: 'blur(12px)',
                            borderRadius: '1.5rem',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            padding: '1.5rem',
                            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
                            position: 'relative' 
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '700',color: '#e2e8f0' }}> 🌳 알고리즘 스킬 트리</h2>
                                <span style={{ fontSize: '0.8rem', padding: '4px 12px', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>Growth Path</span>
                            </div>
                            <AlgorithmSkillTree />
                            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#64748b', textAlign: 'center' }}>
                                * 상단 버튼을 클릭하여 다양한 시각화 모드를 체험해보세요!
                            </p>
                        </div>

                        {/* Right Col: Recent Activity & Quick Actions */}
                        <div className="side-section" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            
                            {/* Recent Activity */}
                            <div className="recent-activity" style={{ 
                                background: 'rgba(30, 41, 59, 0.6)', 
                                backdropFilter: 'blur(12px)',
                                padding: '1.5rem', 
                                borderRadius: '1.5rem', 
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
                            }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', color: '#e2e8f0' }}>최근 활동</h3>
                                <div className="activity-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {loading ? (
                                        <p style={{ color: '#64748b' }}>로딩 중...</p>
                                    ) : stats.recent.length > 0 ? (
                                        stats.recent.map(item => (
                                            <div key={item.id} onClick={() => navigate('/ai-mentoring', { state: { conversationId: item.id } })} style={{ 
                                                padding: '1rem', 
                                                background: 'rgba(255, 255, 255, 0.03)', 
                                                borderRadius: '1rem', 
                                                cursor: 'pointer', 
                                                transition: 'all 0.2s',
                                                border: '1px solid transparent'
                                            }} 
                                            onMouseEnter={e => {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                                e.currentTarget.style.borderColor = 'transparent';
                                            }}
                                            className="activity-item">
                                                <div style={{ fontWeight: '600', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#f1f5f9' }}>
                                                    {item.title}
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                                    {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ padding: '2rem 0', textAlign: 'center', color: '#64748b' }}>
                                            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</p>
                                            <p style={{ fontSize: '0.9rem' }}>아직 활동 내역이 없습니다.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Action */}
                            <div className="quick-start" style={{ 
                                background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)', 
                                padding: '2rem', 
                                borderRadius: '1.5rem', 
                                textAlign: 'center',
                                boxShadow: '0 10px 30px -5px rgba(79, 70, 229, 0.4)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.5rem', color: 'white' }}>오늘의 문제</h3>
                                    <p style={{ fontSize: '0.95rem', opacity: 0.9, marginBottom: '1.5rem', color: '#e0e7ff' }}>
                                        AI 멘토가 엄선한 문제를 풀어보세요!
                                    </p>
                                    <button 
                                        onClick={() => navigate('/ai-mentoring')}
                                        style={{ 
                                            background: 'white', 
                                            color: '#4f46e5', 
                                            border: 'none', 
                                            padding: '1rem 2rem', 
                                            borderRadius: '50px', 
                                            fontWeight: '700', 
                                            cursor: 'pointer', 
                                            width: '100%',
                                            fontSize: '1rem',
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                            transition: 'transform 0.2s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        바로 시작하기 🚀
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AuroraBackground>
        </div>
    );
};

export default DashboardPage;
