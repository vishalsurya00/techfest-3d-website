import React from 'react';

class ThreeErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`Error caught in 3D component [${this.props.name}]:`, error, errorInfo);
    if (this.props.onCrash) {
      this.props.onCrash(this.props.name);
    }
  }

  render() {
    if (this.state.hasError) {
      // 3D Fallback: a pulsing red wireframe box showing the component crashed
      return (
        <mesh position={this.props.position || [0, 0, 0]}>
          <boxGeometry args={[1.5, 1.5, 1.5]} />
          <meshBasicMaterial 
            color="#ff0055" 
            wireframe 
            transparent 
            opacity={0.8}
          />
        </mesh>
      );
    }

    return this.props.children;
  }
}

export default ThreeErrorBoundary;
