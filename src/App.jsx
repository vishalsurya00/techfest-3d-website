import React, { useState, useEffect } from 'react';
import Scene from './components/3d/Scene';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';

function App() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const maxScroll = docHeight - windowHeight;
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate AI City Title opacity and vertical slide translation
  // Starts fading/sliding in at scrollProgress = 0.78, fully active at 0.98
  const cityTitleOpacity = Math.max(0, Math.min(1, (scrollProgress - 0.78) * 5.0));
  const cityTitleTranslateY = 20 - Math.min(20, (scrollProgress - 0.78) * 100);

  return (
    <div className="fade-in-load">
      {/* 3D Interactive WebGL Universe Background */}
      <Scene scrollProgress={scrollProgress} />

      {/* Floating Glassmorphism Navbar */}
      <Navbar />

      {/* HUD Hero Section Layer */}
      <HeroSection scrollProgress={scrollProgress} />

      {/* AI City Title Overlay */}
      <div 
        className="city-title-overlay"
        style={{
          opacity: cityTitleOpacity,
          transform: `translate(-50%, calc(-50% + ${cityTitleTranslateY}px))`,
          pointerEvents: cityTitleOpacity > 0.1 ? 'auto' : 'none'
        }}
      >
        <h1 className="city-title">AI CITY</h1>
        <p className="city-subtitle">"Where Intelligence Comes Alive"</p>
      </div>
    </div>
  );
}

export default App;
