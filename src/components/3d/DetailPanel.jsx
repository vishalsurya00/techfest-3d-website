import React, { useEffect } from 'react';
import './DetailPanel.css';

const DetailPanel = ({ cube, onClose }) => {
  useEffect(() => {
    const handleDocumentClick = (e) => {
      const panelEl = document.querySelector('.gallery-detail-panel');
      if (panelEl && !panelEl.contains(e.target)) {
        onClose();
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener('click', handleDocumentClick);
    }, 150);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [onClose]);

  if (!cube) return null;

  return (
    <div className="gallery-detail-panel" onClick={(e) => e.stopPropagation()}>
      {/* Decorative top accent */}
      <div className="gdp-accent-line" />

      {/* HUD corners */}
      <div className="gdp-corner gdp-tl" />
      <div className="gdp-corner gdp-tr" />
      <div className="gdp-corner gdp-bl" />
      <div className="gdp-corner gdp-br" />

      {/* Header */}
      <div className="gdp-header">
        <h4 className="gdp-title">{cube.title}</h4>
        <button
          className="gdp-close-btn"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close details"
        >
          &times;
        </button>
      </div>

      {/* Body */}
      <div className="gdp-body">
        {/* Icon */}
        <div className="gdp-icon" style={{ color: cube.color }}>
          {cube.icon}
        </div>

        {/* Description */}
        <p className="gdp-description">{cube.description}</p>

        {/* Future Applications */}
        <div className="gdp-future-section">
          <span className="gdp-future-label">// FUTURE APPLICATIONS</span>
          <ul className="gdp-future-list">
            {cube.futureApps.map((app, idx) => (
              <li key={idx} className="gdp-future-item">
                <span className="gdp-bullet" style={{ background: cube.color }} />
                {app}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DetailPanel;
