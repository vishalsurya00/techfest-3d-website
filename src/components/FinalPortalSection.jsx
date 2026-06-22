import React from 'react';
import './FinalPortalSection.css';

const FinalPortalSection = ({ scrollProgress = 0 }) => {
  // Final Portal starts at 0.833 of scrollProgress (5/6)
  const portalProgress = Math.min(1, Math.max(0, (scrollProgress - 0.833) * 6.0));
  
  const headingOpacity = Math.min(1, Math.max(0, portalProgress * 4.0));
  const headingY = Math.max(0, 50 - portalProgress * 150);
  const hudOpacity = Math.min(1, Math.max(0, (portalProgress - 0.05) * 5.0));
  const instructionOpacity = Math.min(1, Math.max(0, (portalProgress - 0.35) * 3.0));

  const handleEnterPortal = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <section className="final-portal-section">
      {/* Invisible Snap Points */}
      <div 
        className="portal-snap-start" 
        style={{ 
          position: 'absolute', 
          top: 0, 
          height: '1px', 
          width: '1px', 
          scrollSnapAlign: 'start', 
          scrollSnapStop: 'always', 
          pointerEvents: 'none' 
        }} 
      />
      <div 
        className="portal-snap-end" 
        style={{ 
          position: 'absolute', 
          top: '100vh', 
          height: '1px', 
          width: '1px', 
          scrollSnapAlign: 'start', 
          scrollSnapStop: 'always', 
          pointerEvents: 'none' 
        }} 
      />

      <div className="portal-sticky-content">
        {/* HUD Frame */}
        <div className="portal-hud-frame" style={{ opacity: hudOpacity }}>
          <div className="hud-corner hud-corner-tl" />
          <div className="hud-corner hud-corner-tr" />
          <div className="hud-corner hud-corner-bl" />
          <div className="hud-corner hud-corner-br" />
        </div>

        {/* Heading */}
        <div 
          className="final-portal-heading"
          style={{
            opacity: headingOpacity,
            transform: `translateY(${headingY}px)`
          }}
        >
          <span className="final-portal-tagline">// SECTOR 06 — THE ENDLESS REALM</span>
          <h2 className="final-portal-title">FINAL PORTAL</h2>
          <p className="final-portal-subtitle">Step Into the Next Dimension</p>
        </div>

        {/* Enter Portal Sci-fi Button */}
        <div 
          className="portal-cta-wrapper"
          style={{ 
            opacity: headingOpacity,
            transform: `translateY(${headingY * 0.5}px)`,
            pointerEvents: headingOpacity > 0.1 ? 'auto' : 'none'
          }}
        >
          <button className="portal-enter-btn" onClick={handleEnterPortal}>
            ENTER PORTAL
            <svg className="portal-btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Instructions */}
        <div 
          className="final-portal-instruction"
          style={{ opacity: instructionOpacity }}
        >
          <span>[ CLICK TO RESTART THE CHRONOLOGY ]</span>
        </div>
      </div>
    </section>
  );
};

export default FinalPortalSection;
