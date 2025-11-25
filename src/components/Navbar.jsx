import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [lang, setLang] = useState('KR');
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const loginRef = useRef(null);

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        const storedLogin = localStorage.getItem('isLoggedIn');
        if (storedLogin === 'true') {
            setIsLoggedIn(true);
        }
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleLogin = (e) => {
        e.preventDefault();
        if (!isLoggedIn) {
            setIsLoginOpen(!isLoginOpen);
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        // Hardcoded credentials
        if (email === 'test@code.genie' && password === '1234') {
            localStorage.setItem('isLoggedIn', 'true');
            setIsLoggedIn(true);
            setIsLoginOpen(false);
            
            // Smooth scroll to the AI Mentoring section
            const demoSection = document.getElementById('demo');
            if (demoSection) {
                demoSection.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            alert('이메일 또는 비밀번호가 올바르지 않습니다.\n(Hint: test@code.genie / 1234)');
        }
    };

    const handleLogout = (e) => {
        e.preventDefault();
        localStorage.removeItem('isLoggedIn');
        setIsLoggedIn(false);
        setIsMenuOpen(false);
        // Optional: Scroll to top or stay put
    };

    useEffect(() => {
        if (isLoginOpen) {
            gsap.fromTo(loginRef.current,
                { y: -20, opacity: 0, scale: 0.95 },
                { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }
            );
        }
    }, [isLoginOpen]);

    return (
        <nav className="navbar">
            <div className="logo">
                <img src="/assets/logo.png" alt="CodeGenie Logo" className="logo-img" />
                <div className="brand-name">Code<span>Genie</span></div>
            </div>

            <div className={`nav-container ${isMenuOpen ? 'active' : ''}`}>
                <ul className="nav-links">
                    <li><a href="#demo" onClick={() => setIsMenuOpen(false)}>AI 멘토링</a></li>
                    {isLoggedIn ? (
                        <>
                            <li><a href="#" onClick={() => setIsMenuOpen(false)}>대화 기록</a></li>
                            <li><a href="#" onClick={handleLogout}>로그아웃</a></li>
                        </>
                    ) : (
                        <li><a href="#" onClick={toggleLogin} className={isLoginOpen ? 'active-link' : ''}>로그인</a></li>
                    )}
                </ul>

                {/* Login Dropdown */}
                {isLoginOpen && !isLoggedIn && (
                    <div className="login-dropdown" ref={loginRef}>
                        <div className="login-header">
                            <h3>Welcome Back! 👋</h3>
                            <p>오늘도 코딩 실력을 키워볼까요?</p>
                        </div>
                        <form className="login-form" onSubmit={handleLogin}>
                            <div className="input-group">
                                <input 
                                    type="email" 
                                    placeholder="이메일" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="input-group">
                                <input 
                                    type="password" 
                                    placeholder="비밀번호" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="login-btn">로그인</button>
                            <div className="login-divider">OR</div>
                            <button type="button" className="google-btn">
                                <span className="icon">G</span> Google로 계속하기
                            </button>
                        </form>
                    </div>
                )}

                <div className="lang-toggle" onClick={() => setLang(lang === 'KR' ? 'EN' : 'KR')}>
                    <span className={lang === 'KR' ? 'active' : ''}>KR</span>
                    <div className="separator"></div>
                    <span className={lang === 'EN' ? 'active' : ''}>EN</span>
                </div>
            </div>

            <div className="menu-toggle" onClick={toggleMenu}>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
            </div>
        </nav>
    );
};

export default Navbar;
