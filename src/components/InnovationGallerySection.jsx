import React from 'react';
import './InnovationGallerySection.css';

const InnovationGallerySection = ({ scrollProgress = 0, activeCubeId }) => {
  // Title animations based on scroll progress
  const headingOpacity = Math.min(1, Math.max(0, scrollProgress * 4.0));
  const headingY = Math.max(0, 50 - scrollProgress * 150);

  // HUD frame opacity
  const hudOpacity = Math.min(1, Math.max(0, (scrollProgress - 0.05) * 5.0));

  // Instruction tooltip opacity
  const instructionOpacity = Math.min(1, Math.max(0, (scrollProgress - 0.35) * 3.0));

  return (
    <section className="innovation-gallery-section">
      {/* Invisible Snap Points */}
      <div 
        className="gallery-snap-start" 
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
        className="gallery-snap-end" 
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

      <div className="gallery-sticky-content">
        {/* HUD Frame */}
        <div className="gallery-hud-frame" style={{ opacity: hudOpacity }}>
          <div className="hud-corner hud-corner-tl" />
          <div className="hud-corner hud-corner-tr" />
          <div className="hud-corner hud-corner-bl" />
          <div className="hud-corner hud-corner-br" />
        </div>

        {/* Section Heading */}
        <div
          className="gallery-heading"
          style={{
            opacity: headingOpacity,
            transform: `translateY(${headingY}px)`,
          }}
        >
          <span className="gallery-tagline">// SECTOR 05 — EXHIBITION HALL</span>
          <h2 className="gallery-title">INNOVATION GALLERY</h2>
          <p className="gallery-subtitle">Holographic Technology Exhibition</p>
        </div>

        {/* Interactive Instructions */}
        <div
          className="gallery-instruction"
          style={{ opacity: instructionOpacity }}
        >
          <span>
            {activeCubeId !== null
              ? "[ CLICK OUTSIDE CUBE TO RETURN ]"
              : "[ HOVER & CLICK CUBES TO EXPLORE TECHNOLOGIES ]"
            }
          </span>
        </div>
      </div>
    </section>
  );
};

export default InnovationGallerySection;
