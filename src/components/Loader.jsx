import React, { useEffect, useState } from 'react';
import './Loader.css';

const Loader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Increment loader percentage with randomized speed
    let timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          // Wait briefly, then trigger fade out
          setTimeout(() => {
            setIsFadingOut(true);
            setTimeout(() => {
              onComplete();
            }, 800); // Wait for CSS fade-out animation
          }, 400);
          return 100;
        }
        const step = Math.floor(Math.random() * 8) + 4;
        return Math.min(100, prev + step);
      });
    }, 70);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className={`boot-loader-overlay ${isFadingOut ? 'fade-out' : ''}`}>
      <div className="boot-loader-content">
        <div className="loader-hud-tag">// SYSTEM INITIALIZATION</div>
        
        {/* TECHVERSE Logo with glowing duplicate layer */}
        <div className="loader-logo-wrapper">
          <h1 className="loader-logo">TECHVERSE</h1>
          <div className="loader-logo-glow">TECHVERSE</div>
        </div>

        {/* Loading Progress line */}
        <div className="loader-progress-container">
          <div className="loader-progress-bar" style={{ width: `${progress}%` }} />
        </div>

        {/* Status logs and percentage */}
        <div className="loader-status-wrapper">
          <span className="loader-status-text">
            {progress < 25 && "STABILIZING VOLUMETRIC GRID..."}
            {progress >= 25 && progress < 55 && "ESTABLISHING NEURAL CONNECTIVITY..."}
            {progress >= 55 && progress < 85 && "SYNCHRONIZING QUANTUM METRIC..."}
            {progress >= 85 && progress < 100 && "BOOTING SECURE COMMUNICATIONS LINK..."}
            {progress === 100 && "SYSTEM ONLINE // DISPATCHING CORE"}
          </span>
          <span className="loader-percentage">{progress}%</span>
        </div>
      </div>
      
      {/* Sci-fi Overlay Scanline */}
      <div className="loader-scanline" />
    </div>
  );
};

export default Loader;
