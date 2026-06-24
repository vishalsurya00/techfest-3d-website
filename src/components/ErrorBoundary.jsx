import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`Error in [${this.props.name}]:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '24px',
          margin: '20px',
          border: '1px solid rgba(0, 240, 255, 0.2)',
          borderRadius: '12px',
          background: 'rgba(5, 2, 10, 0.8)',
          color: '#ffffff',
          fontFamily: 'var(--font-cyber)',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
          pointerEvents: 'auto'
        }}>
          <h3 style={{ fontSize: '16px', color: 'var(--primary-glow)', marginBottom: '8px', letterSpacing: '2px' }}>
            SYSTEM RECALIBRATING
          </h3>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
            This module encountered an issue. Please refresh the page.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
