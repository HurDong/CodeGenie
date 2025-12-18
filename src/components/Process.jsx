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
                <div className="process-line"></div>
                <div className="step-card">
                    <div className="step-node">
                        <div className="step-number">1</div>
                    </div>
                    <div className="step-content">
                        <h3>문제 & 코드 입력</h3>
                        <p>백준 문제 URL과 당신이 작성한 코드를 입력하세요. CodeGenie가 즉시 분석을 시작합니다.</p>
                    </div>
                </div>
                <div className="step-card">
                    <div className="step-node">
                        <div className="step-number">2</div>
                    </div>
                    <div className="step-content">
                        <h3>AI 심층 분석</h3>
                        <p>문제의 핵심 요구사항과 당신의 코드 로직을 대조 분석하여, 놓치고 있는 부분을 파악합니다.</p>
                    </div>
                </div>
                <div className="step-card">
                    <div className="step-node">
                        <div className="step-number">3</div>
                    </div>
                    <div className="step-content">
                        <h3>맞춤형 전략 수립</h3>
                        <p>단순 정답 확인이 아닌, '반례 생성' 또는 '단계별 힌트' 중 현재 상황에 가장 필요한 전략을 선택하세요.</p>
                    </div>
                </div>
                <div className="step-card">
                    <div className="step-node">
                        <div className="step-number">4</div>
                    </div>
                    <div className="step-content">
                        <h3>실력 향상 피드백</h3>
                        <p>치명적인 반례와 논리적인 가이드를 통해, '틀렸습니다'를 '맞았습니다'로 바꾸는 경험을 제공합니다.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Process;
