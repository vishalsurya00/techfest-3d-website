import React from 'react';

const FloatingCard = ({ title, description, icon, index = 0 }) => {
  return (
    <div className="floating-card">
      {/* Gradient overlay on hover */}
      <div className="floating-card__gradient-bg" />

      {/* SVG Icon */}
      <div className="floating-card__icon">
        {icon}
      </div>

      {/* Title */}
      <h3 className="floating-card__title">{title}</h3>

      {/* Description */}
      <p className="floating-card__description">{description}</p>

      {/* Animated shine sweep on hover */}
      <div className="floating-card__shine" />

      {/* HUD corner accents */}
      <div className="fc-hud-corner fc-hud-tl" />
      <div className="fc-hud-corner fc-hud-tr" />
      <div className="fc-hud-corner fc-hud-bl" />
      <div className="fc-hud-corner fc-hud-br" />
    </div>
  );
};

export default FloatingCard;
