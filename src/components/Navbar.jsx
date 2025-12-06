import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [lang, setLang] = useState('KR');
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const loginRef = useRef(null);
    const navigate = useNavigate();

    const { isLoggedIn, login, register, logout } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleLogin = (e) => {
        e.preventDefault();
        if (!isLoggedIn) {
            setIsLoginOpen(!isLoginOpen);
            setIsRegisterMode(false); // Reset to login mode when opening
            setEmail('');
            setPassword('');
            setName('');
        }
    };

    const validateEmail = (email) => {
        if (!email) return '이메일을 입력해주세요.';
        if (!email.includes('@')) return "이메일 주소에 '@'를 포함해 주세요.";
        return '';
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const error = validateEmail(email);
        if (error) {
            toast.error(error);
            return;
        }

        try {
            await login(email, password);
            setIsLoginOpen(false);
            toast.success('로그인되었습니다!');
            navigate('/ai-mentoring');
        } catch (error) {
            toast.error('로그인 실패: 이메일 또는 비밀번호를 확인해주세요.');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const error = validateEmail(email);
        if (error) {
            toast.error(error);
            return;
        }

        try {
            await register(email, password, name);
            setIsLoginOpen(false);
            toast.success('회원가입이 완료되었습니다!');
            navigate('/ai-mentoring');
        } catch (error) {
            toast.error('회원가입 실패: 이미 존재하는 이메일이거나 오류가 발생했습니다.');
        }
    };

    const handleGoogleLogin = () => {
        import('@capacitor/core').then(({ Capacitor }) => {
            const baseUrl = Capacitor.isNativePlatform() ? 'http://10.0.2.2:8080' : 'http://localhost:8080';
            window.location.href = `${baseUrl}/oauth2/authorization/google`;
        });
    };

    const handleLogout = (e) => {
        e.preventDefault();
        logout();
        setIsMenuOpen(false);
        toast.success('로그아웃되었습니다.');
        navigate('/');
    };

    useEffect(() => {
        if (isLoginOpen) {
            gsap.fromTo(loginRef.current,
                { y: -20, opacity: 0, scale: 0.95 },
                { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }
            );
        }
    }, [isLoginOpen]);

    // Close login dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (loginRef.current && !loginRef.current.contains(event.target)) {
                const loginLink = event.target.closest('a[href="#"]');
                if (!loginLink || loginLink.textContent !== '로그인') {
                    setIsLoginOpen(false);
                }
            }
        };

        if (isLoginOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isLoginOpen]);

    return (
        <nav className="navbar">
            <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                <img src={`${import.meta.env.BASE_URL}assets/logo.svg`} alt="CodeGenie Logo" className="logo-img" />
                <div className="brand-name">Code<span>Genie</span></div>
            </div>

            <div className={`nav-container ${isMenuOpen ? 'active' : ''}`}>
                <ul className="nav-links">
                    <li><Link to="/ai-mentoring" onClick={() => setIsMenuOpen(false)}>AI 멘토링</Link></li>
                    {isLoggedIn ? (
                        <>
                            <li><Link to="/history" onClick={() => setIsMenuOpen(false)}>대화 기록</Link></li>
                            <li><a href="#" onClick={handleLogout}>로그아웃</a></li>
                        </>
                    ) : (
                        <li><a href="#" onClick={toggleLogin} className={isLoginOpen ? 'active-link' : ''}>로그인</a></li>
                    )}
                </ul>

                {/* Login/Register Dropdown */}
                {isLoginOpen && !isLoggedIn && (
                    <div className="login-dropdown" ref={loginRef}>
                        <div className="login-header">
                            <h3>{isRegisterMode ? <span>Join CodeGenie! <span style={{ background: 'none', WebkitTextFillColor: 'initial' }}>🚀</span></span> : <span>Welcome Back! <span style={{ background: 'none', WebkitTextFillColor: 'initial' }}>👋</span></span>}</h3>
                            <p>{isRegisterMode ? '코딩 여정을 시작해보세요.' : '오늘도 코딩 실력을 키워볼까요?'}</p>
                        </div>
                        <form className="login-form" onSubmit={isRegisterMode ? handleRegister : handleLogin} noValidate>
                            {isRegisterMode && (
                                <div className="input-group">
                                    <input
                                        type="text"
                                        placeholder="이름"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                            )}
                            <div className="input-group">
                                <input
                                    type="email"
                                    placeholder="이메일"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <input
                                    type="password"
                                    placeholder="비밀번호"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="login-btn">
                                {isRegisterMode ? '회원가입' : '로그인'}
                            </button>

                            <div className="auth-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <div className="toggle-mode">
                                    {isRegisterMode ? (
                                        <p style={{ color: '#666' }}>이미 계정이 있으신가요? <span onClick={() => setIsRegisterMode(false)} style={{ color: '#007bff', cursor: 'pointer', fontWeight: 'bold' }}>로그인</span></p>
                                    ) : (
                                        <p style={{ color: '#666' }}>계정이 없으신가요? <span onClick={() => setIsRegisterMode(true)} style={{ color: '#007bff', cursor: 'pointer', fontWeight: 'bold' }}>회원가입</span></p>
                                    )}
                                </div>

                                {!isRegisterMode && (
                                    <>
                                        <div className="login-divider" style={{ margin: 0 }}>OR</div>
                                        <button type="button" className="google-btn" onClick={handleGoogleLogin}>
                                            <svg className="icon" width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" fillRule="evenodd" />
                                                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.715H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" fillRule="evenodd" />
                                                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" fillRule="evenodd" />
                                                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.159 6.656 3.58 9 3.58z" fill="#EA4335" fillRule="evenodd" />
                                            </svg>
                                            <span>
                                                <span style={{ color: '#4285F4' }}>G</span>
                                                <span style={{ color: '#EA4335' }}>o</span>
                                                <span style={{ color: '#FBBC05' }}>o</span>
                                                <span style={{ color: '#4285F4' }}>g</span>
                                                <span style={{ color: '#34A853' }}>l</span>
                                                <span style={{ color: '#EA4335' }}>e</span>
                                                로 계속하기
                                            </span>
                                        </button>
                                    </>
                                )}
                            </div>
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
