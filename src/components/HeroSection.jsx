import React, { useState, useEffect } from 'react';
import './HeroSection.css';

const HeroSection = () => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      // Calculate normalized position relative to center of viewport
      const x = (clientX - window.innerWidth / 2) / window.innerWidth;
      const y = (clientY - window.innerHeight / 2) / window.innerHeight;
      
      // We set coordinates with a multiplier to control intensity of parallax
      setCoords({ x: x * 35, y: y * 35 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="hero-container">
      {/* Visual Ambient Overlays */}
      <div className="hero-grid-overlay" />
      <div className="screen-flare" />
      <div className="vignette" />
      <div className="scanlines" />

      {/* Sci-Fi HUD Outer Frame Lines */}
      <div className="hud-frame">
        <div className="hud-corner hud-corner-tl" />
        <div className="hud-corner hud-corner-tr" />
        <div className="hud-corner hud-corner-bl" />
        <div className="hud-corner hud-corner-br" />
      </div>

      {/* Cyber HUD Side labels */}
      <div className="hud-details-left">
        <span>SECTOR // 07-X</span>
        <span>LATENCY // 12MS</span>
        <span>SYS.LOAD // 41.2%</span>
      </div>
      <div className="hud-details-right">
        <span>COORDS // 47.92.83</span>
        <span>FREQ // 948.12GHZ</span>
        <span>SECURE // LINK.ESTABLISHED</span>
      </div>

      {/* Center Interactive Parallax Area */}
      <div 
        className="hero-content"
        style={{
          transform: `translate3d(${coords.x}px, ${coords.y}px, 0)`,
          transition: 'transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}
      >
        <span className="hero-tagline">INITIATING QUANTUM LINK</span>
        
        <div className="hero-title-wrapper">
          <h1 className="hero-title">TECHVERSE</h1>
          <div className="hero-title-glow-layer">TECHVERSE</div>
        </div>

        <p className="hero-subtitle">Journey Through the Future</p>

        {/* Enter Universe Sci-fi button */}
        <div className="enter-btn-wrapper">
          <button 
            className="enter-btn"
            onClick={() => console.log("Initializing Universe Shift...")}
          >
            Enter Universe
            <svg className="enter-btn-arrow" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Bouncing Scroll Indicator at the bottom */}
      <div className="hero-footer">
        <span className="scroll-text">Scroll to Begin the Experience</span>
        <div className="down-arrow-container">
          <svg className="down-arrow-svg" viewBox="0 0 24 24" fill="none">
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
