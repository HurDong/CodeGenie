import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import AuroraBackground from './ui/AuroraBackground';
import ShinyText from './ui/ShinyText';
import DecryptedText from './ui/DecryptedText';
import SlotMachineText from './ui/SlotMachineText';
import CodingVisual from './ui/CodingVisual';

const Hero = () => {
    const heroRef = useRef(null);

    // Use useLayoutEffect to prevent FOUC (Flash of Unstyled Content)
    React.useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Set initial state immediately
            gsap.set('.hero-title, .hero-subtitle, .cta-button', { opacity: 0 });
            gsap.set('.hero-title', { y: 50 });
            gsap.set('.hero-subtitle', { y: 20 });
            gsap.set('.cta-button', { y: 20, scale: 0.95 });

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
                    ease: 'power3.out'
                }, '-=0.8');
        }, heroRef);

        return () => ctx.revert();
    }, []);

    const scrollToDemo = () => {
        const demoSection = document.getElementById('demo');
        if (demoSection) {
            demoSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <AuroraBackground>
            <section id="hero" className="hero-section" ref={heroRef}>
                <div className="hero-container">
                    {/* Left Content */}
                    <div className="hero-content" style={{ position: 'relative', zIndex: 10, textAlign: 'left', flex: 1 }}>
                        <h1 className="hero-title">
                            <span className="block mb-2 text-5xl font-bold">
                                <span style={{
                                    background: 'linear-gradient(to right, #fcd34d, #fb923c)', // amber-300 to orange-400
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    display: 'inline-block'
                                }}>사고력</span>
                                <span style={{ color: '#94a3b8' }}>을 깨우는</span>
                            </span>
                            <SlotMachineText
                                text="CodeGenie"
                                speed={50}
                                lockInDelay={150}
                                className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400"
                                parentClassName="block text-7xl font-extrabold mt-4"
                            />
                        </h1>
                        <p className="hero-subtitle">
                            단순한 정답이 아닌, 깊이 있는 문제 이해와<br />
                            논리적 사고 확장을 돕는 당신의 AI 코딩 멘토
                        </p>
                        <button className="cta-button" onClick={scrollToDemo}>무료로 체험하기</button>
                    </div>

                    {/* Right Visual */}
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <CodingVisual />
                    </div>
                </div>
            </section>
        </AuroraBackground>
    );
};

export default Hero;
