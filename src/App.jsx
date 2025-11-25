import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Process from './components/Process';
import Demo from './components/Demo';
import Footer from './components/Footer';
import AiMentoringPage from './pages/AiMentoringPage';
import HistoryPage from './pages/HistoryPage';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  useEffect(() => {
    // Enhanced scroll animations for section transitions with smooth, fluid motion
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

    return () => {
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
    <Router basename={import.meta.env.BASE_URL}>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/ai-mentoring" element={<AiMentoringPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
