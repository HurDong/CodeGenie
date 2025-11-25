import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Process = () => {
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.step-card', {
                scrollTrigger: {
                    trigger: '.process-steps',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                },
                y: 30,
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
        <section id="process" className="process-section" ref={sectionRef}>
            <h2 className="section-title">어떻게 <span>작동</span>하나요?</h2>
            <div className="process-steps">
                <div className="step-card">
                    <div className="step-number">1</div>
                    <h3>문제 입력</h3>
                    <p>문제 텍스트나 URL을 입력하면 AI가 핵심 정보를 파싱합니다.</p>
                </div>
                <div className="step-card">
                    <div className="step-number">2</div>
                    <h3>이해 검증</h3>
                    <p>AI가 파악한 문제의 목표와 제약조건을 요약해 보여주고 확인받습니다.</p>
                </div>
                <div className="step-card">
                    <div className="step-number">3</div>
                    <h3>모드 선택</h3>
                    <p>반례를 찾을지(Counterexample), 풀이 힌트를 얻을지(Solution) 선택합니다.</p>
                </div>
                <div className="step-card">
                    <div className="step-number">4</div>
                    <h3>멘토링 실행</h3>
                    <p>선택한 모드에 맞춰 최적화된 피드백과 가이드를 제공합니다.</p>
                </div>
            </div>
        </section>
    );
};

export default Process;
