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

  return (
    <div className="fade-in-load">
      {/* 3D Interactive WebGL Universe Background */}
      <Scene scrollProgress={scrollProgress} />

      {/* Floating Glassmorphism Navbar */}
      <Navbar />

      {/* HUD Hero Section Layer */}
      <HeroSection scrollProgress={scrollProgress} />
    </div>
  );
}

export default App;
