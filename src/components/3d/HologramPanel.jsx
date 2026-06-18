import React, { useEffect } from 'react';
import './HologramPanel.css';

const HologramPanel = ({ node, onClose }) => {
  useEffect(() => {
    const handleDocumentClick = (e) => {
      // If click target is not within the panel, close it
      const panelEl = document.querySelector('.hologram-panel');
      if (panelEl && !panelEl.contains(e.target)) {
        onClose();
      }
    };

    // Use a small delay before attaching the listener to avoid capturing
    // the same click event that opened the panel
    const timer = setTimeout(() => {
      document.addEventListener('click', handleDocumentClick);
    }, 120);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [onClose]);

  if (!node) return null;

  return (
    <div className="hologram-panel" onClick={(e) => e.stopPropagation()}>
      {/* Sci-Fi Decorative Top Line */}
      <div className="hp-hud-line hp-hud-top-decor" />
      
      {/* Sci-Fi Corners */}
      <div className="hp-hud-corner hp-hud-tl" />
      <div className="hp-hud-corner hp-hud-tr" />
      <div className="hp-hud-corner hp-hud-bl" />
      <div className="hp-hud-corner hp-hud-br" />

      {/* Header with Title and Close Button */}
      <div className="hologram-panel__header">
        <h4 className="hologram-panel__title">{node.title}</h4>
        <button 
          className="hologram-panel__close-btn" 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close details"
        >
          &times;
        </button>
      </div>

      {/* Content Body */}
      <div className="hologram-panel__body">
        <div className="hologram-panel__icon">
          {node.icon}
        </div>
        <p className="hologram-panel__desc">{node.description}</p>
        
        {/* Technical Data Sub-box */}
        <div className="hologram-panel__tech-details">
          <span>SYS STATUS: ACTIVE</span>
          <span>LATENCY: 1.4ms</span>
        </div>
      </div>
    </div>
  );
};

export default HologramPanel;
