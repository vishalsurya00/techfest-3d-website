import React, { useEffect } from 'react';
import './InfoPanel.css';

const InfoPanel = ({ node, onClose }) => {
  useEffect(() => {
    const handleDocumentClick = (e) => {
      // If click target is not within the panel, close it
      const panelEl = document.querySelector('.info-panel');
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
    <div className="info-panel" onClick={(e) => e.stopPropagation()}>
      {/* Sci-Fi Decorative Top Line */}
      <div className="ip-hud-line ip-hud-top-decor" />
      
      {/* Sci-Fi Corners */}
      <div className="ip-hud-corner ip-hud-tl" />
      <div className="ip-hud-corner ip-hud-tr" />
      <div className="ip-hud-corner ip-hud-bl" />
      <div className="ip-hud-corner ip-hud-br" />

      {/* Header with Title and Close Button */}
      <div className="info-panel__header">
        <h4 className="info-panel__title">{node.title}</h4>
        <button 
          className="info-panel__close-btn" 
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
      <div className="info-panel__body">
        <div className="info-panel__icon">
          {node.icon}
        </div>
        <p className="info-panel__desc">{node.description}</p>
      </div>
    </div>
  );
};

export default InfoPanel;
