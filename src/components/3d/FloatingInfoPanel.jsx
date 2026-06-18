import React, { useEffect } from 'react';
import './FloatingInfoPanel.css';

const FloatingInfoPanel = ({ island, onClose }) => {
  useEffect(() => {
    const handleDocumentClick = (e) => {
      // Close the panel if the user clicks outside it
      const panelEl = document.querySelector('.quantum-info-panel');
      if (panelEl && !panelEl.contains(e.target)) {
        onClose();
      }
    };

    // Delay attaching to prevent immediate close on the opening click event
    const timer = setTimeout(() => {
      document.addEventListener('click', handleDocumentClick);
    }, 120);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [onClose]);

  if (!island) return null;

  return (
    <div className="quantum-info-panel" onClick={(e) => e.stopPropagation()}>
      {/* Sci-Fi Decorative Top Line */}
      <div className="qp-hud-line qp-hud-top-decor" />
      
      {/* Sci-Fi Corners */}
      <div className="qp-hud-corner qp-hud-tl" />
      <div className="qp-hud-corner qp-hud-tr" />
      <div className="qp-hud-corner qp-hud-bl" />
      <div className="qp-hud-corner qp-hud-br" />

      {/* Header with Title and Close Button */}
      <div className="quantum-info-panel__header">
        <h4 className="quantum-info-panel__title">{island.title}</h4>
        <button 
          className="quantum-info-panel__close-btn" 
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
      <div className="quantum-info-panel__body">
        <div className="quantum-info-panel__icon">
          {island.icon}
        </div>
        <p className="quantum-info-panel__desc">{island.description}</p>
      </div>
    </div>
  );
};

export default FloatingInfoPanel;
