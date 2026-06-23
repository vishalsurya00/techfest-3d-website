import React from 'react';
import './RoboticsLabSection.css';

const RoboticsLabSection = ({ scrollProgress = 0, isTransitionActive = false }) => {
  // Heading fade-in + slide-up animation
  // Enters between progress 0.1 and 0.4, fades out near end of page scroll
  const headingOpacity = isTransitionActive ? 0 : Math.min(1, Math.max(0, scrollProgress * 4.0)) * (1.0 - Math.max(0, (scrollProgress - 0.82) * 5.5));
  const headingY = Math.max(0, 50 - scrollProgress * 150);

  // HUD frame opacity
  const hudOpacity = Math.min(1, Math.max(0, (scrollProgress - 0.05) * 5.0)) * (1.0 - Math.max(0, (scrollProgress - 0.88) * 8.0));

  // Instruction tooltip opacity (tells user to interact with elements)
  const instructionOpacity = Math.min(1, Math.max(0, (scrollProgress - 0.4) * 3.0)) * (1.0 - Math.max(0, (scrollProgress - 0.9) * 10.0));

  return (
    <section className="robotics-lab-section">
      {/* HUD Frame */}
      <div className="robotics-lab-hud-frame" style={{ opacity: hudOpacity }}>
        <div className="hud-corner hud-corner-tl" />
        <div className="hud-corner hud-corner-tr" />
        <div className="hud-corner hud-corner-bl" />
        <div className="hud-corner hud-corner-br" />
      </div>

      {/* Section Heading */}
      <div
        className="robotics-lab-heading"
        style={{
          opacity: headingOpacity,
          transform: `translateY(${headingY}px)`,
        }}
      >
        <span className="robotics-lab-tagline">// SECTOR 03 — CYBERNETIC ASSEMBLY</span>
        <h2 className="robotics-lab-title">ROBOTICS LAB</h2>
        <p className="robotics-lab-subtitle">&ldquo;Engineering the Future of Locomotion&rdquo;</p>
      </div>

      {/* Lab Interactive Instructions */}
      <div 
        className="robotics-lab-instruction"
        style={{ opacity: instructionOpacity }}
      >
        <span>[ CLICK TERMINALS & ROBOT TO INTERACT ]</span>
      </div>
    </section>
  );
};

export default RoboticsLabSection;
