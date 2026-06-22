import React, { useEffect } from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, description, icon, color = '#00f0ff', futureApps }) => {
  // Listen for Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    // Only close if user clicked directly on the overlay backdrop
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="portal-modal-overlay" 
      onClick={handleOverlayClick}
      style={{ '--accent-color': color }}
    >
      <div className="portal-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Sci-Fi Decorative Frames */}
        <div className="modal-accent-line" />
        <div className="modal-corner modal-tl" />
        <div className="modal-corner modal-tr" />
        <div className="modal-corner modal-bl" />
        <div className="modal-corner modal-br" />

        {/* Close Button */}
        <button 
          className="modal-close-btn" 
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>

        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-icon-wrapper" style={{ color: color }}>
            {icon}
          </div>
          <h2 className="modal-title">{title}</h2>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          <p className="modal-description">{description}</p>

          {/* Render Future Applications if they exist (for cubes) */}
          {futureApps && futureApps.length > 0 && (
            <div className="modal-future-section">
              <span className="modal-future-label">// FUTURE APPLICATIONS</span>
              <ul className="modal-future-list">
                {futureApps.map((app, idx) => (
                  <li key={idx} className="modal-future-item">
                    <span className="modal-bullet" style={{ background: color }} />
                    {app}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
