import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const Hero = () => {
    const heroRef = useRef(null);

    // Use useLayoutEffect to prevent FOUC (Flash of Unstyled Content)
    React.useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Set initial state immediately
            gsap.set('.hero-title, .hero-subtitle, .cta-button, .shape', { opacity: 0 });
            gsap.set('.hero-title', { y: 50 });
            gsap.set('.hero-subtitle', { y: 20 });
            gsap.set('.cta-button', { y: 20, scale: 0.95 }); // Start slightly lower and smaller
            gsap.set('.shape', { scale: 0 });

            const tl = gsap.timeline();

            tl.to('.hero-title', {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: 'power3.out'
            })
                .to('.hero-subtitle', {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: 'power2.out'
                }, '-=0.5')
                .to('.cta-button', {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.8,
                    ease: 'power3.out' // Smoother ease without bounce
                }, '-=0.8')
                .to('.shape', {
                    scale: 1,
                    opacity: 0.4, // Restore original opacity defined in CSS
                    duration: 2,
                    stagger: 0.3,
                    ease: 'elastic.out(1, 0.7)'
                }, '-=1.5');
        }, heroRef);

        // Parallax & Ripple Logic
        const handleMouseMove = (e) => {
            const mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            const mouseY = (e.clientY / window.innerHeight - 0.5) * 2;

            gsap.to('.shape-1', { x: mouseX * 30, y: mouseY * 30, duration: 2, ease: 'power1.out' });
            gsap.to('.shape-2', { x: mouseX * -20, y: mouseY * -20, duration: 2, ease: 'power1.out' });

            // Ripple Effect
            createRipple(e);
        };

        const neonColors = ['#3b82f6', '#10b981', '#8b5cf6', '#f43f5e'];
        let lastRippleTime = 0;

        const createRipple = (e) => {
            const currentTime = Date.now();
            if (currentTime - lastRippleTime < 100) return;
            lastRippleTime = currentTime;

            const ripple = document.createElement('div');
            ripple.classList.add('ripple');

            // Style ripple
            const size = Math.random() * 40 + 10;
            const color = neonColors[Math.floor(Math.random() * neonColors.length)];

            ripple.style.width = `${size}px`;
            ripple.style.height = `${size}px`;
            ripple.style.background = color;
            ripple.style.left = `${e.clientX}px`;
            ripple.style.top = `${e.clientY}px`;
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.pointerEvents = 'none';
            ripple.style.opacity = '0.6';
            ripple.style.filter = 'blur(10px)';

            if (heroRef.current) {
                const rect = heroRef.current.getBoundingClientRect();
                ripple.style.left = `${e.clientX - rect.left}px`;
                ripple.style.top = `${e.clientY - rect.top}px`;
                heroRef.current.appendChild(ripple);

                gsap.to(ripple, {
                    scale: 4,
                    opacity: 0,
                    duration: 1.5,
                    ease: 'power1.out',
                    onComplete: () => {
                        ripple.remove();
                    }
                });
            }
        };

        const heroElement = heroRef.current;
        if (heroElement) {
            heroElement.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
            ctx.revert();
            if (heroElement) {
                heroElement.removeEventListener('mousemove', handleMouseMove);
            }
        };
    }, []);

    const scrollToDemo = () => {
        const demoSection = document.getElementById('demo');
        if (demoSection) {
            demoSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section id="hero" className="hero-section" ref={heroRef}>
            <div className="hero-content">
                <h1 className="hero-title">
                    사고력을 깨우는<br />
                    <span>CodeGenie</span>
                </h1>
                <p className="hero-subtitle">
                    단순한 정답이 아닌, 깊이 있는 문제 이해와<br />
                    논리적 사고 확장을 돕는 당신의 AI 코딩 멘토
                </p>
                <button className="cta-button" onClick={scrollToDemo}>무료로 체험하기</button>
            </div>
            <div className="hero-visual">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
            </div>
        </section>
    );
};

export default Hero;
