import React from 'react';
import Navbar from '../components/Navbar';
import AlgorithmSkillTree from '../components/AlgorithmSkillTree';
import { useAuth } from '../context/AuthContext';
import AuroraBackground from '../components/ui/AuroraBackground';
import '../index.css';
import './DashboardPage.css';

import lampLevel1 from '../assets/badges/lamp_level_1.png';
import lampLevel2 from '../assets/badges/lamp_level_2.png';
import lampLevel3 from '../assets/badges/lamp_level_3.png';
import lampLevel4 from '../assets/badges/lamp_level_4.png';
import lampLevel5 from '../assets/badges/lamp_level_5.png';

const InfoTooltip = ({ type }) => {
    const [isVisible, setIsVisible] = React.useState(false);

    const content = type === 'tier' ? (
        <div style={{ minWidth: '200px' }}>
            <div style={{ color: '#fbbf24', fontWeight: '700', marginBottom: '6px', fontSize: '0.9rem' }}>🏆 티어 (Total Solved)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '4px 12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span>Diamond</span> <span style={{ color: 'var(--text-primary)' }}>100+ 문제</span>
                <span>Platinum</span> <span style={{ color: 'var(--text-primary)' }}>50+ 문제</span>
                <span>Gold</span> <span style={{ color: 'var(--text-primary)' }}>20+ 문제</span>
                <span>Silver</span> <span style={{ color: 'var(--text-primary)' }}>10+ 문제</span>
                <span>Bronze</span> <span style={{ color: 'var(--text-primary)' }}>기본</span>
            </div>
        </div>
    ) : (
        <div style={{ minWidth: '220px' }}>
            <div style={{ color: '#f472b6', fontWeight: '700', marginBottom: '6px', fontSize: '0.9rem' }}>⚡ 레벨 (Streak)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '4px 12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span>God of Genie</span> <span style={{ color: 'var(--text-primary)' }}>30일 연속</span>
                <span>Grandmaster</span> <span style={{ color: 'var(--text-primary)' }}>14일 연속</span>
                <span>Sorcerer</span> <span style={{ color: 'var(--text-primary)' }}>7일 연속</span>
                <span>Apprentice</span> <span style={{ color: 'var(--text-primary)' }}>3일 연속</span>
                <span>Novice</span> <span style={{ color: 'var(--text-primary)' }}>기본</span>
            </div>
        </div>
    );

    return (
        <div 
            style={{ position: 'relative', display: 'inline-flex', marginLeft: '6px', verticalAlign: 'middle', zIndex: 50 }}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                border: '1px solid var(--text-secondary)',
                color: 'var(--text-secondary)',
                fontSize: '0.7rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'help',
                transition: 'all 0.2s',
                marginTop: '-1px',
                opacity: 0.7
            }}>
                ?
            </div>
            {isVisible && (
                <div style={{
                    position: 'absolute',
                    top: '24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    backdropFilter: 'blur(12px)',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    width: 'max-content',
                    boxShadow: 'var(--shadow-soft)',
                    fontSize: '0.85rem',
                    lineHeight: '1.5',
                    color: 'var(--text-primary)',
                    pointerEvents: 'none',
                    textAlign: 'left'
                }}>
                    {content}
                    {/* Arrow */}
                    <div style={{
                        position: 'absolute',
                        top: '-4px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 0,
                        height: 0,
                        borderLeft: '4px solid transparent',
                        borderRight: '4px solid transparent',
                        borderBottom: '4px solid var(--glass-border)'
                    }}></div>
                </div>
            )}
        </div>
    );
};

const UserInfoSection = ({ user, userStats }) => {
    // Fallback if data is not yet loaded
    const stats = userStats || {
        streakDays: 0,
        totalSolved: 0,
        level: 1,
        levelTitle: 'Novice',
        currentTier: 'Bronze',
        daysToNextLevel: 30
    };

    const userLevel = stats.level;
    const badgeImages = [lampLevel1, lampLevel2, lampLevel3, lampLevel4, lampLevel5];
    const currentBadge = badgeImages[userLevel - 1] || lampLevel1;
    const levelTitle = stats.levelTitle;
    const streakDays = stats.streakDays;

    return (
        <div className="dashboard-card user-info-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                <div className="user-avatar-container">
                    <img 
                        src={currentBadge} 
                        alt={`Level ${userLevel} Badge`} 
                        style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover' 
                        }} 
                    />
                </div>
                
                <div>
                    <h2 className="user-name">
                        {user?.name || 'Developer'}
                    </h2>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span className="user-level-badge">
                            Lv. {userLevel} {levelTitle}
                            <InfoTooltip type="level" />
                        </span>
                        <div style={{ width: '1px', height: '20px', background: 'var(--card-border)' }}></div>
                        <span className="user-next-level">다음 레벨까지 {30 - streakDays}일 남음</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '4rem', marginRight: '3rem' }}>
                <div className="stat-item">
                    <div className="stat-label">총 해결 문제</div>
                    <div className="stat-value">{stats.totalSolved}</div>
                </div>
                <div className="stat-item">
                    <div className="stat-label">현재 티어</div>
                    <div className="stat-value tier">
                        {stats.currentTier}
                        <InfoTooltip type="tier" />
                    </div>
                </div>
                <div className="stat-item">
                    <div className="stat-label">연속 학습</div>
                    <div className="stat-value streak">{stats.streakDays}일</div>
                </div>
            </div>
        </div>
    );
};

const CustomDropdown = ({ options, selectedValue, onChange }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef(null);

    // Close on click outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedLabel = options.find(opt => opt.value === selectedValue)?.label || selectedValue;

    return (
        <div ref={dropdownRef} style={{ position: 'relative', minWidth: '100px', fontFamily: '"Inter", sans-serif' }}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="custom-dropdown-trigger"
                style={{
                    boxShadow: isOpen ? '0 0 0 2px rgba(99, 102, 241, 0.5)' : 'none'
                }}
            >
                <span>{selectedLabel}</span>
                <span style={{ 
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity: 0.7 
                }}>
                    ▼
                </span>
            </div>

            {/* Dropdown Menu */}
            <div className="custom-dropdown-menu" style={{
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.95)',
                pointerEvents: isOpen ? 'auto' : 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                {options.map((option) => (
                    <div
                        key={option.value}
                        onClick={() => {
                            onChange(option.value);
                            setIsOpen(false);
                        }}
                        className={`dropdown-option ${selectedValue === option.value ? 'selected' : ''}`}
                    >
                        {option.label}
                    </div>
                ))}
            </div>
        </div>
    );
};

const StreakCalendar = ({ activityLogs }) => {
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = React.useState(currentYear);
    const containerRef = React.useRef(null);
    const scrollRef = React.useRef(null);

    // 1. Generate Calendar Data for Selected Year
    const { daysData, monthLabels } = React.useMemo(() => {
        // Transform activityLogs to Map for fast lookup
        const logMap = new Map();
        if (activityLogs) {
            activityLogs.forEach(log => {
                logMap.set(log.date, log.count);
            });
        }

        const data = [];
        const labels = [];
        
        // Define range: Jan 1 to Dec 31 of selectedYear
        const startDate = new Date(selectedYear, 0, 1);
        const endDate = new Date(selectedYear, 11, 31);
        
        // Align start date to the previous Sunday for Grid alignment
        const dayOfWeek = startDate.getDay(); // 0 (Sun) - 6 (Sat)
        const loopStart = new Date(startDate);
        loopStart.setDate(loopStart.getDate() - dayOfWeek);

        let currentDate = new Date(loopStart);
        let lastMonth = -1;
        let index = 0;
        
        // Loop until we cover the end date
        while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const month = currentDate.getMonth(); 
            const isWithinYear = currentDate.getFullYear() === selectedYear;

            // Generate Day Data
            // If the day is before Jan 1 of selected year (padding), count is -1 (hidden)
            let count = -1;
            if (isWithinYear) {
                // Use real data from map
                count = logMap.get(dateStr) !== undefined ? logMap.get(dateStr) : 0;
            }

            data.push({
                date: dateStr,
                count: count, 
                isVisible: isWithinYear
            });

            // Calculate Month Labels
            if (isWithinYear && month !== lastMonth) {
                const colIndex = Math.floor(index / 7);
                labels.push({ 
                    text: `${month + 1}월`, 
                    colIndex
                });
                lastMonth = month;
            }

            currentDate.setDate(currentDate.getDate() + 1);
            index++;
        }
        return { daysData: data, monthLabels: labels };
    }, [selectedYear, currentYear]);

    // Tooltip State
    const [tooltip, setTooltip] = React.useState({ visible: false, x: 0, y: 0, date: '', count: 0 });

    // Scroll Logic
    React.useEffect(() => {
        if (scrollRef.current) {
            if (selectedYear === currentYear) {
                // Scroll to end for current year
                scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
            } else {
                // Scroll to start for past years
                scrollRef.current.scrollLeft = 0;
            }
        }
    }, [selectedYear, currentYear]);

    const getLevelColor = (count) => {
        if (count === -1) return 'transparent'; // Padding days
        if (count === 0) return 'var(--calendar-empty)'; // Empty
        if (count <= 1) return '#312e81'; // Level 1 (Deep Indigo)
        if (count <= 2) return '#4f46e5'; // Level 2 (Indigo)
        if (count <= 3) return '#8b5cf6'; // Level 3 (Violet)
        return '#d8b4fe'; // Level 4 (Bright Purple - Max)
    };

    const yearOptions = [
        { value: currentYear, label: `${currentYear}년` },
        { value: currentYear - 1, label: `${currentYear - 1}년` },
        { value: currentYear - 2, label: `${currentYear - 2}년` },
    ];

    return (
        <div ref={containerRef} className="dashboard-card streak-card" style={{ position: 'relative' }}>
           
            {/* Header */}
            <div className="streak-header">
                <h3 className="streak-title">
                    <span style={{ fontSize: '1.4rem' }}>🌱</span> 스트릭 (Streak)
                </h3>
                
                {/* Custom Dropdown for Year Selection */}
                <CustomDropdown 
                    options={yearOptions}
                    selectedValue={selectedYear}
                    onChange={(val) => setSelectedYear(val)}
                />
            </div>
            
            {/* Calendar Grid Container */}
            <div ref={scrollRef} className="streak-grid-container">
                {/* Labels Layer */}
                <div style={{ position: 'relative', height: '14px', marginBottom: '4px', width: 'max-content' }}>
                    {monthLabels.map((label, i) => (
                        <div key={i} className="month-label" style={{ left: `${label.colIndex * 14}px` }}>
                            {label.text}
                        </div>
                    ))}
                </div>

                {/* The Grid itself */}
                <div style={{
                    display: 'grid',
                    gridTemplateRows: 'repeat(7, 10px)', 
                    gridAutoFlow: 'column', 
                    gap: '4px',
                    height: 'max-content',
                    minWidth: 'max-content' 
                }}>
                    {daysData.map((day, index) => (
                        <div 
                            key={index} 
                            className="calendar-day"
                            style={{
                                background: getLevelColor(day.count),
                                cursor: day.isVisible ? 'pointer' : 'default',
                                opacity: day.isVisible ? 1 : 0, // Truly hide padding days
                            }}
                            onMouseEnter={(e) => {
                                if (!containerRef.current || !day.isVisible) return;
                                const containerRect = containerRef.current.getBoundingClientRect();
                                const rect = e.target.getBoundingClientRect();
                                
                                setTooltip({
                                    visible: true,
                                    x: rect.left - containerRect.left + (rect.width / 2),
                                    y: rect.top - containerRect.top - 10,
                                    date: day.date,
                                    count: day.count
                                });
                            }}
                            onMouseLeave={() => setTooltip(prev => ({ ...prev, visible: false }))}
                        />
                    ))}
                </div>
            </div>

            {/* Custom Tooltip Portal/Overlay */}
            {tooltip.visible && (
                <div style={{
                    position: 'absolute',
                    top: tooltip.y,
                    left: tooltip.x,
                    transform: 'translate(-50%, -100%)',
                    background: 'var(--glass-bg)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    color: 'var(--text-color)',
                    fontSize: '0.8rem',
                    pointerEvents: 'none',
                    zIndex: 20, 
                    whiteSpace: 'nowrap',
                    boxShadow: 'var(--shadow-soft)',
                    border: '1px solid var(--glass-border)',
                    backdropFilter: 'blur(8px)'
                }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '2px' }}>{tooltip.date}</div>
                    <div style={{ fontWeight: 'bold' }}>
                        {tooltip.count > 0 ? `🚀 ${tooltip.count}개의 챌린지 완료` : '💤 활동 없음'}
                    </div>
                    {/* Arrow */}
                    <div style={{
                        position: 'absolute',
                        bottom: '-4px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 0,
                        height: 0,
                        borderLeft: '4px solid transparent',
                        borderRight: '4px solid transparent',
                        borderTop: '4px solid var(--glass-bg)' // Need to match bg
                    }}></div>
                </div>
            )}
            
            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 'auto' }}>
                <span>Less</span>
                <div style={{ width: '10px', height: '10px', background: 'var(--calendar-empty)', borderRadius: '2px' }}></div>
                <div style={{ width: '10px', height: '10px', background: '#312e81', borderRadius: '2px' }}></div>
                <div style={{ width: '10px', height: '10px', background: '#4f46e5', borderRadius: '2px' }}></div>
                <div style={{ width: '10px', height: '10px', background: '#8b5cf6', borderRadius: '2px' }}></div>
                <div style={{ width: '10px', height: '10px', background: '#d8b4fe', borderRadius: '2px' }}></div>
                <span>More</span>
            </div>
        </div>
    );
};

const DashboardPage = () => {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch('/api/dashboard', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setDashboardData(data);
                } else {
                    console.error("Failed to fetch dashboard data");
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
         return (
            <div className="dashboard-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Loading...
            </div>
         );
    }

    return (
        <div className="dashboard-page">
            <Navbar />
            <AuroraBackground>
                {/* Background Grid */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: 'linear-gradient(var(--grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--grid-color) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    pointerEvents: 'none',
                    zIndex: 0
                }} />

                <div className="dashboard-layout">
                    
                    {/* 0. Header (New) */}
                    <div style={{ gridColumn: '1 / -1', marginBottom: '1rem' }}>
                        <h1 className="dashboard-header-title">대시보드</h1>
                        <p className="dashboard-header-desc">나의 학습 현황과 성장을 한눈에 확인하세요</p>
                    </div>

                    {/* 1. User Info (Top Row - Spans 2) */}
                    <div style={{ gridColumn: '1 / -1', minHeight: '0', position: 'relative', zIndex: 10 }}>
                        <UserInfoSection user={user} userStats={dashboardData?.userStats} />
                    </div>

                    {/* 2. Streak Calendar (Bottom Left) */}
                    <div style={{ minHeight: '0' }}>
                        <StreakCalendar activityLogs={dashboardData?.activityLogs} />
                    </div>

                    {/* 3. Skill Tree (Bottom Right) */}
                    <div style={{ minHeight: '0' }}>
                        <div className="dashboard-card skill-tree-card">
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexShrink: 0 }}>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}> 🌳 Algorithm Tree</h2>
                            </div>
                            <div style={{ flex: 1, position: 'relative', width: '100%', minHeight: 0 }}>
                                <AlgorithmSkillTree data={dashboardData?.skillTree} />
                            </div>
                        </div>
                    </div>

                </div>
            </AuroraBackground>
        </div>
    );
};

export default DashboardPage;

