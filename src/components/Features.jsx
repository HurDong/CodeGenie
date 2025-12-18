import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

import TiltedCard from './ui/TiltedCard';

const Features = () => {
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.tilted-card-container', {
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
                <TiltedCard
                    containerHeight="320px"
                    containerWidth="100%"
                    captionText="문제의 본질을 꿰뚫는 분석"
                    rotateAmplitude={10}
                    scaleOnHover={1.05}
                    showMobileWarning={false}
                    showTooltip={false}
                    displayOverlayContent={true}
                    overlayContent={
                        <div className="text-center p-6">
                            <div className="icon text-5xl mb-4">🧠</div>
                            <h3 className="text-2xl font-bold mb-3 text-white">문제의 본질을 꿰뚫는 분석</h3>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                단순한 지문 해석을 넘어, 출제자의 의도와 핵심 제약 조건을 완벽하게 파악하여 정답으로 가는 최단 경로를 제시합니다.
                            </p>
                        </div>
                    }
                />

                <TiltedCard
                    containerHeight="320px"
                    containerWidth="100%"
                    captionText="왜 틀렸는지 모를 땐, AI 반례 생성"
                    rotateAmplitude={10}
                    scaleOnHover={1.05}
                    showMobileWarning={false}
                    showTooltip={false}
                    displayOverlayContent={true}
                    overlayContent={
                        <div className="text-center p-6">
                            <div className="icon text-5xl mb-4">⚡</div>
                            <h3 className="text-2xl font-bold mb-3 text-white">왜 틀렸는지 모를 땐, AI 반례 생성</h3>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                채점 결과 '틀렸습니다'의 좌절감, 이제 그만. 당신의 로직을 무너뜨리는 치명적인 반례를 찾아내어 논리적 구멍을 메워드립니다.
                            </p>
                        </div>
                    }
                />

                <TiltedCard
                    containerHeight="320px"
                    containerWidth="100%"
                    captionText="떠먹여 주는 정답 대신, 생각하는 힘"
                    rotateAmplitude={10}
                    scaleOnHover={1.05}
                    showMobileWarning={false}
                    showTooltip={false}
                    displayOverlayContent={true}
                    overlayContent={
                        <div className="text-center p-6">
                            <div className="icon text-5xl mb-4">🗺️</div>
                            <h3 className="text-2xl font-bold mb-3 text-white">떠먹여 주는 정답 대신, 생각하는 힘</h3>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                소크라테스식 문답법으로 문제 해결 과정을 1:1 과외하듯 안내합니다. 스스로 답을 찾는 과정을 통해 진짜 실력을 키우세요.
                            </p>
                        </div>
                    }
                />

                <TiltedCard
                    containerHeight="320px"
                    containerWidth="100%"
                    captionText="나만의 코딩 습관 정밀 진단"
                    rotateAmplitude={10}
                    scaleOnHover={1.05}
                    showMobileWarning={false}
                    showTooltip={false}
                    displayOverlayContent={true}
                    overlayContent={
                        <div className="text-center p-6">
                            <div className="icon text-5xl mb-4">🛡️</div>
                            <h3 className="text-2xl font-bold mb-3 text-white">나만의 코딩 습관 정밀 진단</h3>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                자주 범하는 실수 패턴부터 놓치기 쉬운 엣지 케이스까지. 당신도 몰랐던 코딩 습관을 분석하여 완벽한 코드로 거듭나게 돕습니다.
                            </p>
                        </div>
                    }
                />
            </div>
        </section>
    );
};

export default Features;
