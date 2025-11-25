import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Features = () => {
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.feature-card', {
                scrollTrigger: {
                    trigger: '.features-grid',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                },
                y: 50,
                opacity: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: 'power2.out'
            });

            gsap.from('.section-title', {
                scrollTrigger: {
                    trigger: '.section-title',
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                },
                y: 30,
                opacity: 0,
                duration: 1,
                ease: 'power2.out'
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section id="features" className="features-section" ref={sectionRef}>
            <h2 className="section-title">왜 <span>CodeGenie</span>인가요?</h2>
            <div className="features-grid">
                <div className="feature-card" id="feature-understanding">
                    <div className="icon">🧠</div>
                    <h3>심층 문제 이해</h3>
                    <p>단순 텍스트 매칭이 아닙니다. 문제의 핵심 목표, 입력 변수, 제약 조건을 구조적으로 파악하여 정확한 가이드를 제공합니다.</p>
                </div>
                <div className="feature-card" id="feature-counterexample">
                    <div className="icon">⚡</div>
                    <h3>반례 생성 모드</h3>
                    <p>내 코드가 왜 틀렸는지 모르겠나요? 경계값, 히든 케이스, 논리적 허점을 파고드는 날카로운 반례를 제시합니다.</p>
                </div>
                <div className="feature-card" id="feature-solution">
                    <div className="icon">🗺️</div>
                    <h3>단계별 솔루션</h3>
                    <p>바로 정답을 알려주지 않습니다. 문제 분해부터 자료구조 선택, 알고리즘 설계까지 소크라테스식 문답으로 사고력을 키워줍니다.</p>
                </div>
                <div className="feature-card" id="feature-weakness">
                    <div className="icon">🛡️</div>
                    <h3>약점 분석</h3>
                    <p>조건문 누락, Off-by-one 에러 등 사용자의 코드 패턴을 분석하여 자주 실수하는 약점을 짚어줍니다.</p>
                </div>
            </div>
        </section>
    );
};

export default Features;
