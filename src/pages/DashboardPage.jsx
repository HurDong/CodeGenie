import React from 'react';
import Navbar from '../components/Navbar';
import AlgorithmSkillTree from '../components/AlgorithmSkillTree';
import { useAuth } from '../context/AuthContext';
import AuroraBackground from '../components/ui/AuroraBackground';
import '../index.css';

import lampLevel1 from '../assets/badges/lamp_level_1.png';
import lampLevel2 from '../assets/badges/lamp_level_2.png';
import lampLevel3 from '../assets/badges/lamp_level_3.png';
import lampLevel4 from '../assets/badges/lamp_level_4.png';
import lampLevel5 from '../assets/badges/lamp_level_5.png';

const UserInfoSection = ({ user, userStats }) => {
    // Fallback if data is not yet loaded
    const stats = userStats || {
        streakDays: 0,
        totalSolved: 0,
        level: 1,
        levelTitle: 'Novice',
        currentRank: 'Bronze',
        daysToNextLevel: 30
    };

    const userLevel = stats.level;
    const badgeImages = [lampLevel1, lampLevel2, lampLevel3, lampLevel4, lampLevel5];
    const currentBadge = badgeImages[userLevel - 1] || lampLevel1;
    const levelTitle = stats.levelTitle;
    const streakDays = stats.streakDays;

    return (
        <div style={{
            background: 'rgba(30, 41, 59, 0.6)',
            backdropFilter: 'blur(12px)',
            borderRadius: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '1.2rem 3rem', // Reduced vertical padding, increased horizontal
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '100%'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                {/* 뱃지 이미지가 아바타 대체 */}
                <div style={{
                    width: '150px', 
                    height: '150px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    filter: 'drop-shadow(0 0 25px rgba(99, 102, 241, 0.6))',
                    borderRadius: '50%',
                    overflow: 'hidden', // Circle crop
                    border: '4px solid rgba(255, 255, 255, 0.1)' // Optional ring for better definition
                }}>
                    <img 
                        src={currentBadge} 
                        alt={`Level ${userLevel} Badge`} 
                        style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover' // Fill the circle
                        }} 
                    />
                </div>
                
                <div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#f8fafc', marginBottom: '0.8rem', letterSpacing: '-0.5px' }}>
                        {user?.name || 'Developer'}
                    </h2>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{ 
                            padding: '6px 16px', 
                            background: 'rgba(56, 189, 248, 0.1)', 
                            color: '#38bdf8', 
                            borderRadius: '20px', 
                            fontSize: '1rem', 
                            border: '1px solid rgba(56, 189, 248, 0.2)',
                            fontWeight: '600',
                            letterSpacing: '0.5px'
                        }}>
                            Lv. {userLevel} {levelTitle}
                        </span>
                        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)' }}></div>
                        <span style={{ color: '#94a3b8', fontSize: '1rem' }}>다음 레벨까지 {30 - streakDays}일 남음</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '4rem', marginRight: '3rem' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1rem', color: '#94a3b8', marginBottom: '0.5rem' }}>총 해결 문제</div>
                    <div style={{ fontSize: '2.2rem', fontWeight: '700', color: '#fff' }}>{stats.totalSolved}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1rem', color: '#94a3b8', marginBottom: '0.5rem' }}>현재 랭킹</div>
                    <div style={{ fontSize: '2.2rem', fontWeight: '700', color: '#fbbf24' }}>{stats.currentRank}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1rem', color: '#94a3b8', marginBottom: '0.5rem' }}>연속 학습</div>
                    <div style={{ fontSize: '2.2rem', fontWeight: '700', color: '#f472b6' }}>{stats.streakDays}일</div>
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
                style={{
                    background: 'rgba(30, 41, 59, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '8px 16px',
                    color: '#e2e8f0',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    boxShadow: isOpen ? '0 0 0 2px rgba(99, 102, 241, 0.5)' : 'none',
                    backdropFilter: 'blur(8px)'
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
            <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '100%',
                minWidth: '120px',
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '4px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(12px)',
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.95)',
                pointerEvents: isOpen ? 'auto' : 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: 50,
                overflow: 'hidden'
            }}>
                {options.map((option) => (
                    <div
                        key={option.value}
                        onClick={() => {
                            onChange(option.value);
                            setIsOpen(false);
                        }}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            color: selectedValue === option.value ? '#a5b4fc' : '#cbd5e1',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            background: selectedValue === option.value ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                            transition: 'all 0.15s ease',
                            fontWeight: selectedValue === option.value ? '600' : '400',
                        }}
                        onMouseEnter={(e) => {
                            if (selectedValue !== option.value) e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                            if (selectedValue !== option.value) e.target.style.background = 'transparent';
                        }}
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
        if (count === 0) return 'rgba(255, 255, 255, 0.05)'; // Empty
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
        <div ref={containerRef} style={{
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(12px)',
            borderRadius: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '1.5rem',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative' 
        }}>
           
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
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
            <div ref={scrollRef} style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center',
                overflowX: 'auto',
                overflowY: 'hidden',
                paddingBottom: '10px',
                position: 'relative', 
                scrollBehavior: 'smooth'
            }}>
                {/* Labels Layer */}
                <div style={{ position: 'relative', height: '14px', marginBottom: '4px', width: 'max-content' }}>
                    {monthLabels.map((label, i) => (
                        <div key={i} style={{
                            position: 'absolute',
                            left: `${label.colIndex * 14}px`, 
                            fontSize: '0.75rem',
                            color: '#94a3b8',
                            whiteSpace: 'nowrap'
                        }}>
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
                            style={{
                                width: '10px',
                                height: '10px',
                                background: getLevelColor(day.count),
                                borderRadius: '2px',
                                cursor: day.isVisible ? 'pointer' : 'default',
                                opacity: day.isVisible ? 1 : 0, // Truly hide padding days
                                transition: 'all 0.1s'
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
                    background: 'rgba(0,0,0,0.95)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.8rem',
                    pointerEvents: 'none',
                    zIndex: 20, 
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{ color: '#cbd5e1', fontSize: '0.75rem', marginBottom: '2px' }}>{tooltip.date}</div>
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
                        borderTop: '4px solid rgba(0,0,0,0.95)'
                    }}></div>
                </div>
            )}
            
            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#64748b', marginTop: 'auto' }}>
                <span>Less</span>
                <div style={{ width: '10px', height: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '2px' }}></div>
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
                // Use relative path '/api' which works with Vite proxy AND authService config style
                // If authService uses 'https://code-genie.duckdns.org/api', we might need to match it.
                // Assuming Vite proxy set up for /api -> http://localhost:8080 or backend.
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
            <div style={{ height: '100vh', width: '100vw', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                Loading...
            </div>
         );
    }

    return (
        <div className="dashboard-page" style={{ height: '100vh', width: '100vw', overflow: 'hidden', position: 'relative' }}>
            <Navbar />
            <AuroraBackground>
                {/* Background Grid */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    pointerEvents: 'none',
                    zIndex: 0
                }} />

                <div className="dashboard-layout" style={{ 
                    maxWidth: '1600px', // Wider layout
                    margin: '0 auto', 
                    padding: '1.5rem 2rem', 
                    paddingTop: '40px', // Matched with HistoryPage
                    height: '100%',
                    display: 'grid',
                    gridTemplateRows: 'auto 260px minmax(0, 1fr)', // Added auto row for header
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1.5rem',
                    position: 'relative',
                    zIndex: 1,
                    boxSizing: 'border-box'
                }}>
                    
                    {/* 0. Header (New) */}
                    <div style={{ gridColumn: '1 / -1', marginBottom: '1rem' }}>
                        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#e2e8f0', marginBottom: '0.5rem' }}>대시보드</h1>
                        <p style={{ fontSize: '1rem', color: '#94a3b8' }}>나의 학습 현황과 성장을 한눈에 확인하세요</p>
                    </div>

                    {/* 1. User Info (Top Row - Spans 2) */}
                    <div style={{ gridColumn: '1 / -1', minHeight: '0' }}>
                        <UserInfoSection user={user} userStats={dashboardData?.userStats} />
                    </div>

                    {/* 2. Streak Calendar (Bottom Left) */}
                    <div style={{ minHeight: '0' }}>
                        <StreakCalendar activityLogs={dashboardData?.activityLogs} />
                    </div>

                    {/* 3. Skill Tree (Bottom Right) */}
                    <div style={{ minHeight: '0' }}>
                        <div style={{
                            background: 'rgba(15, 23, 42, 0.6)',
                            backdropFilter: 'blur(12px)',
                            borderRadius: '1.5rem',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            padding: '1.5rem',
                            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            position: 'relative'
                        }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexShrink: 0 }}>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#e2e8f0' }}> 🌳 Algorithm Tree</h2>
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
