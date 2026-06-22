import React from 'react';
import './StatusHUD.css';

const StatusHUD = () => {
  return (
    <div className="status-hud" onClick={(e) => e.stopPropagation()}>
      {/* HUD Header */}
      <div className="status-hud-header">
        <span className="status-hud-tag">// SYSTEM DIAGNOSTICS</span>
        <h4 className="status-hud-title">SYSTEM STATUS</h4>
      </div>
      
      {/* HUD Grid Rows */}
      <div className="status-hud-grid">
        <div className="status-row">
          <span className="status-label">AI Core</span>
          <div className="status-value-wrapper">
            <span className="status-value online">ONLINE</span>
            <span className="status-dot online-pulse" />
          </div>
        </div>
        
        <div className="status-row">
          <span className="status-label">Robotics</span>
          <div className="status-value-wrapper">
            <span className="status-value active-val">ACTIVE</span>
            <span className="status-dot active-pulse" />
          </div>
        </div>
        
        <div className="status-row">
          <span className="status-label">Quantum Lab</span>
          <div className="status-value-wrapper">
            <span className="status-value stable">STABLE</span>
            <span className="status-dot stable-pulse" />
          </div>
        </div>
        
        <div className="status-row">
          <span className="status-label">Innovation</span>
          <div className="status-value-wrapper">
            <span className="status-value ready">READY</span>
            <span className="status-dot ready-pulse" />
          </div>
        </div>
      </div>
      
      {/* Sci-fi Decorative HUD Corners */}
      <div className="shud-corner shud-tl" />
      <div className="shud-corner shud-tr" />
      <div className="shud-corner shud-bl" />
      <div className="shud-corner shud-br" />
    </div>
  );
};

export default StatusHUD;
