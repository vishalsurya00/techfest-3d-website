import React, { useState, useEffect } from 'react';
import Scene from './components/3d/Scene';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import AICitySection from './components/AICitySection';
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

  // Derive per-section progress (0-1 within each section's scroll range)
  // scrollProgress 0.0→0.5 = Hero section | scrollProgress 0.5→1.0 = AI City section
  const heroProgress = Math.min(1, Math.max(0, scrollProgress * 2));
  const cityProgress = Math.min(1, Math.max(0, (scrollProgress - 0.5) * 2));

  // Portal Title: appears near end of hero phase, fades as city phase begins
  const portalFadeIn = Math.max(0, Math.min(1, (scrollProgress - 0.35) * 10));
  const portalFadeOut = Math.max(0, Math.min(1, 1 - (scrollProgress - 0.5) * 10));
  const portalTitleOpacity = portalFadeIn * portalFadeOut;
  const portalTitleTranslateY = 20 - portalFadeIn * 20;

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
        <HeroSection scrollProgress={heroProgress} />

        {/* AI City Section (scroll-animated 3D city overlay) */}
        <AICitySection scrollProgress={cityProgress} />

        {/* Portal Title Overlay (fixed, transitions between sections) */}
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
