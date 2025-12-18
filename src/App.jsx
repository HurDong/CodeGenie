import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Hero from './components/Hero';
import Features from './components/Features';
import Process from './components/Process';
import Demo from './components/Demo';
import Footer from './components/Footer';
import AiMentoringPage from './pages/AiMentoringPage';
import HistoryPage from './pages/HistoryPage';
import DashboardPage from './pages/DashboardPage';
import OAuthCallback from './components/OAuthCallback';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  useEffect(() => {
    // Enhanced scroll animations for section transitions with smooth, fluid motion
    const ctx = gsap.context(() => {
        const sections = gsap.utils.toArray('section');

        sections.forEach((section, index) => {
        // Skip hero section as it has its own animations
        if (index === 0) return;

        // Smooth parallax effect on scroll with elastic easing
        gsap.fromTo(section,
            {
            y: 150,
            opacity: 0,
            scale: 0.92
            },
            {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 2,
            ease: 'elastic.out(1, 0.6)',
            scrollTrigger: {
                trigger: section,
                start: 'top 85%',
                end: 'top 15%',
                scrub: 2.5,
                toggleActions: 'play none none reverse'
            }
            }
        );
        });

        // Add subtle parallax to section backgrounds with slower, smoother motion
        gsap.utils.toArray('.features-grid, .process-steps, .demo-container').forEach((element) => {
        gsap.to(element, {
            y: -30,
            scrollTrigger: {
            trigger: element,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 4
            }
        });
        });
    });

    return () => {
      if(ctx) ctx.revert();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <>
        <Navbar />
        <main>
            <Hero />
            <Features />
            <Process />
            <Demo />
        </main>
        <Footer />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router basename={import.meta.env.BASE_URL}>
          <div className="App">
            <Toaster
              position="top-center" // ... (truncated for brevity in thought, but full content will be in tool call)
              containerStyle={{
                zIndex: 99999,
              }}
              toastOptions={{
                style: {
                  background: 'var(--toast-bg)',
                  color: 'var(--toast-text)',
                  border: '1px solid var(--toast-border)',
                maxWidth: '500px',
                wordBreak: 'keep-all',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              {/* <Route path="/monimo" element={<MonimoLandingPage />} /> - Removed per user request */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/ai-mentoring" element={<AiMentoringPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/oauth/callback" element={<OAuthCallback />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
