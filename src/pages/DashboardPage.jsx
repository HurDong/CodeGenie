import React from 'react';
import Navbar from '../components/Navbar';
import AlgorithmSkillTree from '../components/AlgorithmSkillTree';
import { useAuth } from '../context/AuthContext';
import AuroraBackground from '../components/ui/AuroraBackground';
import '../index.css';

const UserInfoSection = ({ user }) => {
    // Mock Data (In real app, calculate from history)
    const currentStreak = 12; 
    const maxStreak = 45;
    const totalActiveDays = 142;

    const getStreakRank = (streak) => {
        if (streak >= 30) return { title: "Diamond Inferno", color: "#60a5fa", icon: "💎", min: 30, next: 100 };
        if (streak >= 14) return { title: "Gold Blaze", color: "#fbbf24", icon: "🥇", min: 14, next: 30 };
        if (streak >= 7) return { title: "Silver Flame", color: "#94a3b8", icon: "🥈", min: 7, next: 14 };
        if (streak >= 3) return { title: "Bronze Spark", color: "#b45309", icon: "🥉", min: 3, next: 7 };
        return { title: "Sprout", color: "#4ade80", icon: "🌱", min: 0, next: 3 };
    };

    const rank = getStreakRank(currentStreak);
    const progress = Math.min(100, ((currentStreak - rank.min) / (rank.next - rank.min)) * 100);

    return (
        <div style={{
            background: 'rgba(30, 41, 59, 0.6)',
            backdropFilter: 'blur(12px)',
            borderRadius: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '2rem',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '100%'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ 
                    width: '100px', height: '100px', 
                    borderRadius: '50%', 
                    background: `linear-gradient(135deg, ${rank.color}, #a855f7)`, // Dynamic border color
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '3.5rem', 
                    boxShadow: `0 0 20px ${rank.color}80`,
                    border: '4px solid rgba(255,255,255,0.1)'
                }}>
                    {rank.icon}
                </div>
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#f8fafc', marginBottom: '0.25rem' }}>
                        {user?.name || 'Developer'}
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ 
                                fontSize: '1.1rem', 
                                fontWeight: '700', 
                                color: rank.color,
                                textShadow: `0 0 10px ${rank.color}40`
                            }}>
                                {rank.title}
                            </span>
                            <span style={{ fontSize: '0.9rem', color: '#64748b' }}> | {currentStreak}일 연속 학습 중 🔥</span>
                        </div>
                        
                        {/* Progress Bar to Next Rank */}
                        <div style={{ width: '200px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ 
                                width: `${progress}%`, 
                                height: '100%', 
                                background: rank.color, 
                                borderRadius: '3px',
                                transition: 'width 1s ease-out'
                            }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                            다음 랭크까지 <b>{rank.next - currentStreak}일</b> 남음
                        </span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '3rem', marginRight: '2rem' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.5rem' }}>현재 스트릭</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#fbbf24' }}>{currentStreak}일</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.5rem' }}>최장 스트릭</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#f472b6' }}>{maxStreak}일</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.5rem' }}>총 활동일</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#fff' }}>{totalActiveDays}</div>
                </div>
            </div>
        </div>
    );
};

const StreakCalendar = () => {
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = React.useState(currentYear);
    const containerRef = React.useRef(null);
    const scrollRef = React.useRef(null);

    // 1. Generate Calendar Data for Selected Year
    const { daysData, monthLabels } = React.useMemo(() => {
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
                // Mock data: Random activity
                // Make today/future empty if in current year? Optional.
                // For simplicity, just random data for the whole year range valid.
                // (In a real app, you'd cap at Today if current year)
                if (selectedYear === currentYear && currentDate > new Date()) {
                    count = 0; // Future days empty
                } else {
                    count = Math.random() > 0.7 ? Math.floor(Math.random() * 5) : 0;
                }
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
        if (count <= 1) return '#4c1d95'; // Level 1 (Deep Violet)
        if (count <= 2) return '#7c3aed'; // Level 2 (Violet)
        if (count <= 3) return '#a855f7'; // Level 3 (Purple)
        return '#f0abfc'; // Level 4 (Neon Fuchsia - Max)
    };

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
                
                {/* Year Selector */}
                <select 
                    value={selectedYear} 
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: '#e2e8f0',
                        padding: '4px 8px',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        outline: 'none'
                    }}
                >
                    <option value={currentYear}>{currentYear}년</option>
                    <option value={currentYear - 1}>{currentYear - 1}년</option>
                    <option value={currentYear - 2}>{currentYear - 2}년</option>
                </select>
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
                <div style={{ width: '10px', height: '10px', background: '#4c1d95', borderRadius: '2px' }}></div>
                <div style={{ width: '10px', height: '10px', background: '#7c3aed', borderRadius: '2px' }}></div>
                <div style={{ width: '10px', height: '10px', background: '#a855f7', borderRadius: '2px' }}></div>
                <div style={{ width: '10px', height: '10px', background: '#f0abfc', borderRadius: '2px' }}></div>
                <span>More</span>
            </div>
        </div>
    );
};

const DashboardPage = () => {
    const { user } = useAuth();

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
                    maxWidth: '1400px', 
                    margin: '0 auto', 
                    padding: '1.5rem 2rem', 
                    paddingTop: '80px',
                    height: '100%',
                    display: 'grid',
                    gridTemplateRows: 'minmax(0, 0.8fr) minmax(0, 1.6fr)', // 2x2 proportion adjustment (User info smaller height)
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1.5rem',
                    position: 'relative',
                    zIndex: 1,
                    boxSizing: 'border-box'
                }}>
                    
                    {/* 1. User Info (Top Row - Spans 2) */}
                    <div style={{ gridColumn: '1 / -1', minHeight: '0' }}>
                        <UserInfoSection user={user} />
                    </div>

                    {/* 2. Streak Calendar (Bottom Left) */}
                    <div style={{ minHeight: '0' }}>
                        <StreakCalendar />
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
                                <AlgorithmSkillTree />
                            </div>
                        </div>
                    </div>

                </div>
            </AuroraBackground>
        </div>
    );
};

export default DashboardPage;
