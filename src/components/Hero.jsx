import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import GridMotion from './ui/GridMotion';
import ShinyText from './ui/ShinyText';
import DecryptedText from './ui/DecryptedText';

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
        <section id="hero" className="hero-section" ref={heroRef} style={{ overflow: 'hidden' }}>
            {/* Background Animation */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
                <GridMotion items={[
                    'Java', 'Python', 'C++', 'Spring', 'React', 'Docker', 'AWS', 'Git',
                    'Algorithm', 'Data Structure', 'SQL', 'NoSQL', 'Redis', 'Kafka',
                    'CI/CD', 'Kubernetes', 'Microservices', 'REST API', 'GraphQL', 'Oauth',
                    'Clean Code', 'TDD', 'DDD', 'Design Patterns', 'Refactoring', 'Testing'
                ]} />
            </div>

            <div className="hero-content" style={{ position: 'relative', zIndex: 10 }}>
                <h1 className="hero-title">
                    <ShinyText text="사고력을 깨우는" speed={3} className="block mb-2 text-5xl font-bold" />
                    <DecryptedText 
                        text="CodeGenie"
                        speed={100}
                        maxIterations={20}
                        className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400"
                        parentClassName="block text-7xl font-extrabold mt-4"
                        revealDirection="center"
                    />
                </h1>
                <p className="hero-subtitle">
                    단순한 정답이 아닌, 깊이 있는 문제 이해와<br />
                    논리적 사고 확장을 돕는 당신의 AI 코딩 멘토
                </p>
                <button className="cta-button" onClick={scrollToDemo}>무료로 체험하기</button>
            </div>
        </section>
    );
};

export default Hero;
