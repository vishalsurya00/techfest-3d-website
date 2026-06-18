import React, { useState, useEffect } from 'react';
import Scene from './components/3d/Scene';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import CustomCursor from './components/CustomCursor';

function App() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const maxScroll = docHeight - windowHeight;
      const rawProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      const progress = Math.max(0, Math.min(1, rawProgress));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate Portal Title opacity and vertical slide translation
  // Starts fading/sliding in at scrollProgress = 0.75, fully active at 1.0
  const portalTitleOpacity = Math.max(0, Math.min(1, (scrollProgress - 0.75) * 4.0));
  const portalTitleTranslateY = 20 - Math.min(20, (scrollProgress - 0.75) * 80);

  return (
    <>
      {/* Custom Glowing Cursor with Particle Trail */}
      <CustomCursor />

      {/* 3D Interactive WebGL Universe Background */}
      <Scene scrollProgress={scrollProgress} />

      <div className="fade-in-load">
        {/* Floating Glassmorphism Navbar */}
        <Navbar />

        {/* HUD Hero Section Layer */}
        <HeroSection scrollProgress={scrollProgress} />

        {/* Portal Title Overlay */}
        <div 
          className="portal-title-overlay"
          style={{
            opacity: portalTitleOpacity,
            transform: `translate(-50%, calc(-50% + ${portalTitleTranslateY}px))`,
            pointerEvents: portalTitleOpacity > 0.1 ? 'auto' : 'none'
          }}
        >
          <h1 className="portal-title">ENTER THE AI DIMENSION</h1>
          <div className="portal-scroll-indicator">
            Continue Scrolling
            <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center' }}>
              <svg className="down-arrow-svg" viewBox="0 0 24 24" fill="none" style={{ width: '18px', height: '18px' }}>
                <path d="M7 13l5 5 5-5M7 6l5 5 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
