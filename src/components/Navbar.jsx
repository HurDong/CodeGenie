import React, { useState, useEffect } from 'react';
import gsap from 'gsap';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [lang, setLang] = useState('KR');

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    useEffect(() => {
        if (isMenuOpen) {
            gsap.from('.nav-links li', {
                opacity: 0,
                y: 20,
                duration: 0.5,
                stagger: 0.1,
                ease: 'power2.out',
                delay: 0.2
            });
        }
    }, [isMenuOpen]);

    return (
        <nav className="navbar">
            <div className="logo">
                <img src="/assets/logo.png" alt="CodeGenie Logo" className="logo-img" />
                <div className="brand-name">Code<span>Genie</span></div>
            </div>

            <div className={`nav-container ${isMenuOpen ? 'active' : ''}`}>
                <ul className="nav-links">
                    <li><a href="#hero" onClick={() => setIsMenuOpen(false)}>홈</a></li>
                    <li><a href="#features" onClick={() => setIsMenuOpen(false)}>핵심 기능</a></li>
                    <li><a href="#process" onClick={() => setIsMenuOpen(false)}>작동 원리</a></li>
                    <li><a href="#demo" onClick={() => setIsMenuOpen(false)}>체험하기</a></li>
                </ul>

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
