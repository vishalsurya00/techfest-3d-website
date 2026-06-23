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
    console.error(`Error caught in HTML component [${this.props.name}]:`, error, errorInfo);
    if (this.props.onCrash) {
      this.props.onCrash(this.props.name);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '24px',
          margin: '20px',
          border: '2px dashed #ff0055',
          borderRadius: '12px',
          background: 'rgba(255, 0, 85, 0.12)',
          color: '#ffffff',
          fontFamily: 'var(--font-cyber)',
          textAlign: 'center',
          boxShadow: '0 0 20px rgba(255, 0, 85, 0.2)',
          backdropFilter: 'blur(10px)',
          pointerEvents: 'auto'
        }}>
          <h3 style={{ fontSize: '18px', color: '#ff0055', marginBottom: '8px', letterSpacing: '2px' }}>
            // ERROR: {this.props.name.toUpperCase()} CRASHED
          </h3>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', margin: '0 0 12px 0' }}>
            The component failed to render. Diagnostic logs have been captured.
          </p>
          <pre style={{
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '12px',
            borderRadius: '6px',
            fontSize: '11px',
            color: '#ff3b30',
            textAlign: 'left',
            overflowX: 'auto',
            margin: '0'
          }}>
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
