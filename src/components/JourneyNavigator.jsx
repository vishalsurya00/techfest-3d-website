import React from 'react';
import './JourneyNavigator.css';

const sections = [
  { name: 'Space Gateway', label: 'SECTOR 01' },
  { name: 'AI City', label: 'SECTOR 02' },
  { name: 'Robotics Lab', label: 'SECTOR 03' },
  { name: 'Quantum Hub', label: 'SECTOR 04' },
  { name: 'Innovation Gallery', label: 'SECTOR 05' },
  { name: 'Final Portal', label: 'SECTOR 06' }
];

const JourneyNavigator = ({ scrollProgress = 0 }) => {
  const activeIndex = Math.min(5, Math.floor(scrollProgress * 6));

  const handleSectionClick = (idx) => {
    window.scrollTo({
      top: idx * window.innerHeight,
      behavior: 'smooth'
    });
  };

  // Progress line fill calculations
  const fillPercentage = Math.min(100, scrollProgress * 100);

  return (
    <div className="journey-navigator" onClick={(e) => e.stopPropagation()}>
      {/* Animated Vertical Progress Line */}
      <div className="navigator-line-container">
        <div className="navigator-line-bg" />
        <div className="navigator-line-fill" style={{ height: `${fillPercentage}%` }} />
      </div>
      
      {/* Navigator Steps */}
      <div className="navigator-items">
        {sections.map((sec, i) => {
          const isActive = i === activeIndex;
          const isCompleted = i < activeIndex;
          
          return (
            <div 
              key={sec.name} 
              className={`navigator-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              onClick={() => handleSectionClick(i)}
            >
              <div className="navigator-dot-wrapper">
                <div className="navigator-dot-outer">
                  <div className="navigator-dot-inner" />
                </div>
              </div>
              <div className="navigator-text-wrapper">
                <span className="navigator-label">{sec.label}</span>
                <span className="navigator-name">{sec.name}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JourneyNavigator;
