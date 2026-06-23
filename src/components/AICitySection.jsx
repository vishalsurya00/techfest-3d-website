import React from 'react';
import FloatingCard from './FloatingCard';
import './AICitySection.css';

const AICitySection = ({ scrollProgress = 0, isTransitionActive = false }) => {
  // Heading fade-in + slide-up animation
  const headingOpacity = isTransitionActive ? 0 : Math.min(1, Math.max(0, scrollProgress * 3.5));
  const headingY = Math.max(0, 50 - scrollProgress * 175);

  // Cards staggered fade-in based on scroll
  const cardOpacity = (i) => {
    const delay = 0.15 + i * 0.12;
    return Math.min(1, Math.max(0, (scrollProgress - delay) * 4));
  };

  // HUD frame opacity
  const hudOpacity = Math.min(1, Math.max(0, (scrollProgress - 0.05) * 5));

  // Card data with inline SVG icons
  const cards = [
    {
      title: 'Artificial Intelligence',
      description: 'Autonomous systems that think, learn, and evolve beyond human cognitive boundaries.',
      icon: (
        <svg viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="10" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="24" cy="24" r="3" fill="currentColor" />
          <path d="M24 14V6M24 42v-8M14 24H6M42 24h-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M17.17 17.17l-4.24-4.24M35.07 35.07l-4.24-4.24M17.17 30.83l-4.24 4.24M35.07 12.93l-4.24 4.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      title: 'Machine Learning',
      description: 'Algorithms that discover hidden patterns across the vast fabric of raw data.',
      icon: (
        <svg viewBox="0 0 48 48" fill="none">
          <path d="M6 38l10-14 8 10 8-18 10 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="16" cy="24" r="2.5" fill="currentColor" opacity="0.8" />
          <circle cx="24" cy="34" r="2.5" fill="currentColor" opacity="0.8" />
          <circle cx="32" cy="16" r="2.5" fill="currentColor" opacity="0.8" />
        </svg>
      ),
    },
    {
      title: 'Neural Networks',
      description: 'Digital synapses firing across quantum-scale architectures in real-time.',
      icon: (
        <svg viewBox="0 0 48 48" fill="none">
          <circle cx="10" cy="14" r="3" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="10" cy="34" r="3" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="24" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="24" cy="24" r="3" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="24" cy="38" r="3" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="38" cy="14" r="3" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="38" cy="34" r="3" stroke="currentColor" strokeWidth="1.5" />
          <line x1="13" y1="14" x2="21" y2="11" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          <line x1="13" y1="14" x2="21" y2="24" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          <line x1="13" y1="34" x2="21" y2="24" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          <line x1="13" y1="34" x2="21" y2="38" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          <line x1="27" y1="10" x2="35" y2="14" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          <line x1="27" y1="24" x2="35" y2="14" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          <line x1="27" y1="24" x2="35" y2="34" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          <line x1="27" y1="38" x2="35" y2="34" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        </svg>
      ),
    },
  ];

  return (
    <section className="ai-city-section">
      {/* HUD Frame */}
      <div className="ai-city-hud-frame" style={{ opacity: hudOpacity }}>
        <div className="hud-corner hud-corner-tl" />
        <div className="hud-corner hud-corner-tr" />
        <div className="hud-corner hud-corner-bl" />
        <div className="hud-corner hud-corner-br" />
      </div>

      {/* Section Heading with scroll-triggered fade-in + slide-up */}
      <div
        className="ai-city-heading"
        style={{
          opacity: headingOpacity,
          transform: `translateY(${headingY}px)`,
        }}
      >
        <span className="ai-city-tagline">// SECTOR 02 — NEURAL HUB</span>
        <h2 className="ai-city-title">AI CITY</h2>
        <p className="ai-city-subtitle">&ldquo;Where Intelligence Comes Alive&rdquo;</p>
      </div>

      {/* Floating Glass Cards */}
      <div className="ai-city-cards">
        {cards.map((card, i) => (
          <div
            key={card.title}
            className="floating-card-wrapper"
            style={{
              opacity: cardOpacity(i),
            }}
          >
            <FloatingCard
              title={card.title}
              description={card.description}
              icon={card.icon}
              index={i}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default AICitySection;
