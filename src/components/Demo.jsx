import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Demo = () => {
    const [messages, setMessages] = useState([
        { sender: 'agent', text: '안녕하세요! 코드를 분석해 드릴까요? "분석 시작하기" 버튼을 눌러주세요.' }
    ]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [showHighlight, setShowHighlight] = useState(false);
    const chatBodyRef = useRef(null);
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.demo-container', {
                scrollTrigger: {
                    trigger: '#demo',
                    start: 'top 75%',
                    toggleActions: 'play none none reverse'
                },
                y: 40,
                opacity: 0,
                duration: 0.8,
                ease: 'power2.out'
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);

    const runDemo = () => {
        setIsAnalyzing(true);

        // 1. User Message
        setMessages(prev => [...prev, { sender: 'user', text: '이 코드가 왜 틀렸는지 모르겠어. 1부터 n까지 합을 구하는 거 아니야?' }]);

        // 2. Simulate Thinking
        setTimeout(() => {
            // 3. Agent Response
            setMessages(prev => [...prev, { sender: 'agent', text: '코드의 로직은 대부분 맞지만, <strong>반례(Counterexample)</strong>가 존재합니다.' }]);

            setTimeout(() => {
                setMessages(prev => [...prev, { sender: 'agent', text: '만약 <strong>n = 1</strong>이라면 어떻게 될까요?' }]);

                // Highlight Error Line
                setShowHighlight(true);

                setTimeout(() => {
                    setMessages(prev => [...prev, { sender: 'agent', text: '반복문 조건이 <code>i < n</code>으로 되어 있어서, n=1일 때 루프가 실행되지 않고 0을 반환합니다. <code>i <= n</code>으로 수정해 보세요.' }]);
                    setIsComplete(true);
                    setIsAnalyzing(false);
                }, 1500);
            }, 1500);
        }, 1000);
    };

    return (
        <section id="demo" className="demo-section" ref={sectionRef}>
            <h2 className="section-title">직접 <span>경험</span>해보세요</h2>
            <div className="demo-container">
                <div className="demo-ide">
                    <div className="ide-header">
                        <span className="dot red"></span>
                        <span className="dot yellow"></span>
                        <span className="dot green"></span>
                        <span className="filename">Solution.java</span>
                    </div>
                    <div className="ide-body">
                        <div className="line-numbers">
                            1<br />2<br />3<br />4<br />5<br />6<br />7<br />8
                        </div>
                        <pre className="code-content"><code>
                            <span className="keyword">public</span> <span className="keyword">int</span> <span className="function">solution</span>(<span className="keyword">int</span> n) {'{'}
                            {'\n'}    <span className="comment">// 1부터 n까지의 합을 반환</span>
                            {'\n'}    <span className="keyword">int</span> sum = 0;
                            {'\n'}    <span className="keyword">for</span> (<span className="keyword">int</span> i = 1; i &lt; n; i++) {'{'}
                            {'\n'}        sum += i;
                            {'\n'}    {'}'}
                            {'\n'}    <span className="keyword">return</span> sum;
                            {'\n'}{'}'}
                        </code></pre>
                        <div className="error-highlight" style={{ opacity: showHighlight ? 1 : 0 }}></div>
                    </div>
                </div>

                <div className="demo-chat">
                    <div className="chat-header">
                        <div className="agent-profile">
                            <div className="agent-avatar">🧞‍♂️</div>
                            <div className="agent-info">
                                <div className="name">CodeGenie</div>
                                <div className="status">Online</div>
                            </div>
                        </div>
                    </div>
                    <div className="chat-body" ref={chatBodyRef}>
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender}`} dangerouslySetInnerHTML={{ __html: msg.text }}></div>
                        ))}
                    </div>
                    <div className="chat-input-area">
                        <button
                            className="run-demo-btn"
                            onClick={runDemo}
                            disabled={isAnalyzing || isComplete}
                        >
                            {isComplete ? (
                                <><span className="icon">✅</span> 분석 완료</>
                            ) : isAnalyzing ? (
                                <><span className="icon">⏳</span> 분석 중...</>
                            ) : (
                                <><span className="icon">▶</span> 분석 시작하기</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Demo;
