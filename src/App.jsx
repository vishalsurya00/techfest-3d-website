import React, { useState, useEffect } from 'react';
import Scene from './components/3d/Scene';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import AICitySection from './components/AICitySection';
import RoboticsLabSection from './components/RoboticsLabSection';
import QuantumHubSection from './components/QuantumHubSection';
import CustomCursor from './components/CustomCursor';

function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeIslandId, setActiveIslandId] = useState(null);

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
  // scrollProgress: 0.0→0.25 = Hero | 0.25→0.50 = AI City | 0.50→0.75 = Robotics Lab | 0.75→1.0 = Quantum Hub
  const heroProgress = Math.min(1, Math.max(0, scrollProgress * 4.0));
  const cityProgress = Math.min(1, Math.max(0, (scrollProgress - 0.25) * 4.0));
  const labProgress = Math.min(1, Math.max(0, (scrollProgress - 0.50) * 4.0));
  const hubProgress = Math.min(1, Math.max(0, (scrollProgress - 0.75) * 4.0));

  // Portal Title: appears near end of hero phase, fades as city phase begins
  const portalFadeIn = Math.max(0, Math.min(1, (scrollProgress - 0.17) * 12));
  const portalFadeOut = Math.max(0, Math.min(1, 1 - (scrollProgress - 0.25) * 12));
  const portalTitleOpacity = portalFadeIn * portalFadeOut;
  const portalTitleTranslateY = 20 - portalFadeIn * 20;

  return (
    <>
      {/* Custom Glowing Cursor with Particle Trail */}
      <CustomCursor />

      {/* 3D Interactive WebGL Universe Background */}
      <Scene scrollProgress={scrollProgress} activeIslandId={activeIslandId} setActiveIslandId={setActiveIslandId} />

      <div className="fade-in-load">
        {/* Floating Glassmorphism Navbar */}
        <Navbar />

        {/* HUD Hero Section Layer */}
        <HeroSection scrollProgress={heroProgress} />

        {/* AI City Section (scroll-animated 3D city overlay) */}
        <AICitySection scrollProgress={cityProgress} />

        {/* Robotics Research Lab Section (scroll-animated HTML overlay) */}
        <RoboticsLabSection scrollProgress={labProgress} />

        {/* Quantum Innovation Hub Section (scroll-animated HTML overlay) */}
        <QuantumHubSection scrollProgress={hubProgress} activeIslandId={activeIslandId} setActiveIslandId={setActiveIslandId} />

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
