import React from 'react';
import StarfieldCanvas from './components/StarfieldCanvas';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';

function App() {
  return (
    <div className="fade-in-load">
      {/* Dynamic 60fps canvas background */}
      <StarfieldCanvas />

      {/* Floating glassmorphism navigation */}
      <Navbar />

      {/* Main cinematic hero page */}
      <HeroSection />
    </div>
  );
}

export default App;
