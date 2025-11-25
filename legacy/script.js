// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    // Navbar Toggle Logic
    const menuToggle = document.querySelector('.menu-toggle');
    const navContainer = document.querySelector('.nav-container');

    menuToggle.addEventListener('click', () => {
        navContainer.classList.toggle('active');
        // Simple animation for menu items
        if (navContainer.classList.contains('active')) {
            gsap.from('.nav-links li', {
                opacity: 0,
                y: 20,
                duration: 0.5,
                stagger: 0.1,
                ease: 'power2.out',
                delay: 0.2
            });
        }
    });

    // Language Toggle Logic
    const langToggle = document.getElementById('langToggle');
    langToggle.addEventListener('click', () => {
        const spans = langToggle.querySelectorAll('span');
        spans.forEach(span => span.classList.toggle('active'));
        // Placeholder for actual language switch
        console.log('Language toggled');
    });

    // Hero Animation
    const heroTimeline = gsap.timeline();

    heroTimeline
        .from('.hero-title', {
            y: 50,
            opacity: 0,
            duration: 1,
            ease: 'power3.out'
        })
        .from('.hero-subtitle', {
            opacity: 0,
            y: 20,
            duration: 1,
            ease: 'power2.out'
        }, '-=0.5')
        .from('.cta-button', {
            scale: 0,
            duration: 0.8,
            ease: 'back.out(1.7)'
        }, '-=0.8')
        .from('.shape', {
            scale: 0,
            opacity: 0,
            duration: 2,
            stagger: 0.3,
            ease: 'elastic.out(1, 0.7)'
        }, '-=1.5');

    // Parallax Effect for Shapes
    document.addEventListener('mousemove', (e) => {
        const mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        const mouseY = (e.clientY / window.innerHeight - 0.5) * 2;

        gsap.to('.shape-1', { x: mouseX * 30, y: mouseY * 30, duration: 2, ease: 'power1.out' });
        gsap.to('.shape-2', { x: mouseX * -20, y: mouseY * -20, duration: 2, ease: 'power1.out' });
    });

    // Neon Ripple Effect
    const heroSection = document.querySelector('.hero-section');
    // Vibrant Neon Colors: Blue, Green, Purple, Pink
    const neonColors = ['#3b82f6', '#10b981', '#8b5cf6', '#f43f5e'];
    let lastRippleTime = 0;

    heroSection.addEventListener('mousemove', (e) => {
        const currentTime = Date.now();
        if (currentTime - lastRippleTime < 100) return; // Control creation rate
        lastRippleTime = currentTime;

        const ripple = document.createElement('div');
        ripple.classList.add('ripple');

        // Random size and color
        const size = Math.random() * 40 + 10;
        const color = neonColors[Math.floor(Math.random() * neonColors.length)];

        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.background = color;
        ripple.style.left = `${e.clientX}px`;
        ripple.style.top = `${e.clientY}px`;
        ripple.style.position = 'absolute'; // Ensure it's absolute
        ripple.style.borderRadius = '50%';
        ripple.style.pointerEvents = 'none';
        ripple.style.opacity = '0.6';
        ripple.style.filter = 'blur(10px)'; // Add blur for neon glow effect

        heroSection.appendChild(ripple);

        gsap.to(ripple, {
            scale: 4,
            opacity: 0,
            duration: 1.5,
            ease: 'power1.out',
            onComplete: () => {
                ripple.remove();
            }
        });
    });

    // Scroll Animations

    // Features Section
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

    // Process Section
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

    // Section Titles
    gsap.utils.toArray('.section-title').forEach(title => {
        gsap.from(title, {
            scrollTrigger: {
                trigger: title,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            y: 30,
            opacity: 0,
            duration: 1,
            ease: 'power2.out'
        });
    });

    // Demo Section Animation
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

    // Interactive Demo Logic
    const runDemoBtn = document.getElementById('runDemoBtn');
    const chatBody = document.getElementById('chatBody');
    const errorHighlight = document.querySelector('.error-highlight');

    if (runDemoBtn) {
        runDemoBtn.addEventListener('click', () => {
            runDemoBtn.disabled = true;
            runDemoBtn.innerHTML = '<span class="icon">⏳</span> 분석 중...';

            // 1. User Message
            addMessage('user', '이 코드가 왜 틀렸는지 모르겠어. 1부터 n까지 합을 구하는 거 아니야?');

            // 2. Simulate Thinking (Delay)
            setTimeout(() => {
                // 3. Agent Response (Counterexample)
                addMessage('agent', '코드의 로직은 대부분 맞지만, <strong>반례(Counterexample)</strong>가 존재합니다.');

                setTimeout(() => {
                    addMessage('agent', '만약 <strong>n = 1</strong>이라면 어떻게 될까요?');

                    // Highlight Error Line
                    errorHighlight.style.opacity = '1';

                    setTimeout(() => {
                        addMessage('agent', '반복문 조건이 <code>i < n</code>으로 되어 있어서, n=1일 때 루프가 실행되지 않고 0을 반환합니다. <code>i <= n</code>으로 수정해 보세요.');
                        runDemoBtn.innerHTML = '<span class="icon">✅</span> 분석 완료';
                    }, 1500);
                }, 1500);
            }, 1000);
        });
    }

    function addMessage(sender, text) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender);
        msgDiv.innerHTML = text;
        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }
});
