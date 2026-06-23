import React, { useState, useEffect, useCallback } from 'react';
import Scene from './components/3d/Scene';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import AICitySection from './components/AICitySection';
import RoboticsLabSection from './components/RoboticsLabSection';
import QuantumHubSection from './components/QuantumHubSection';
import InnovationGallerySection from './components/InnovationGallerySection';
import FinalPortalSection from './components/FinalPortalSection';
import JourneyNavigator from './components/JourneyNavigator';
import StatusHUD from './components/StatusHUD';
import Loader from './components/Loader';
import CustomCursor from './components/CustomCursor';
import Modal from './components/Modal';
import { islands, cubes, aiCoreNodes, terminalData, robotInfo } from './data/universeData';

const sectorInfo = [
  { label: 'SECTOR 01', title: 'Space Gateway', subtitle: 'Where the Journey Begins' },
  { label: 'SECTOR 02', title: 'AI City', subtitle: 'Where Intelligence Comes Alive' },
  { label: 'SECTOR 03', title: 'Robotics Lab', subtitle: 'Engineering Intelligent Motion' },
  { label: 'SECTOR 04', title: 'Quantum Hub', subtitle: 'Computing Beyond Binary Limits' },
  { label: 'SECTOR 05', title: 'Innovation Gallery', subtitle: 'A Vision of Tomorrow' },
  { label: 'SECTOR 06', title: 'Final Portal', subtitle: 'Step Into the Next Dimension' }
];

function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeIslandId, setActiveIslandId] = useState(null);
  const [activeCubeId, setActiveCubeId] = useState(null);
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [activeTerminalId, setActiveTerminalId] = useState(null);
  const [robotActive, setRobotActive] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [overlaySector, setOverlaySector] = useState(null);

  // Unified close-all handler
  const closeAllModals = useCallback(() => {
    setActiveIslandId(null);
    setActiveCubeId(null);
    setActiveNodeId(null);
    setActiveTerminalId(null);
    setRobotActive(false);
  }, []);

  // Monitor scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const maxScroll = docHeight - windowHeight;
      const rawProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      const progress = Math.max(0, Math.min(1, rawProgress));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Derive active index (6 segments)
  const activeIndex = Math.min(5, Math.max(0, Math.floor(scrollProgress * 6.0)));

  // Trigger temporary section entrance title overlays
  useEffect(() => {
    if (!isLoaded) return;

    setOverlaySector(sectorInfo[activeIndex]);

    const timer = setTimeout(() => {
      setOverlaySector(null);
    }, 2800);

    return () => clearTimeout(timer);
  }, [activeIndex, isLoaded]);

  // Derive per-section progress (6 sections)
  const heroProgress = Math.min(1, Math.max(0, scrollProgress * 6.0));
  const cityProgress = Math.min(1, Math.max(0, (scrollProgress - 0.1667) * 6.0));
  const labProgress = Math.min(1, Math.max(0, (scrollProgress - 0.3333) * 6.0));
  const hubProgress = Math.min(1, Math.max(0, (scrollProgress - 0.50) * 6.0));
  const galleryProgress = Math.min(1, Math.max(0, (scrollProgress - 0.6667) * 6.0));

  // Portal Title: appears near end of gateway phase, fades as city phase begins
  const portalFadeIn = Math.max(0, Math.min(1, (scrollProgress - 0.12) * 20));
  const portalFadeOut = Math.max(0, Math.min(1, 1 - (scrollProgress - 0.1667) * 20));
  const portalTitleOpacity = portalFadeIn * portalFadeOut;
  const portalTitleTranslateY = 20 - portalFadeIn * 20;

  return (
    <>
      {/* Custom Glowing Cursor with Particle Trail */}
      <CustomCursor />

      {/* Opening boot loader */}
      {!isLoaded && <Loader onComplete={() => setIsLoaded(true)} />}

      {/* 3D Interactive WebGL Universe Background */}
      <Scene 
        scrollProgress={scrollProgress} 
        activeIslandId={activeIslandId} 
        setActiveIslandId={setActiveIslandId} 
        activeCubeId={activeCubeId} 
        setActiveCubeId={setActiveCubeId}
        activeNodeId={activeNodeId}
        setActiveNodeId={setActiveNodeId}
        activeTerminalId={activeTerminalId}
        setActiveTerminalId={setActiveTerminalId}
        robotActive={robotActive}
        setRobotActive={setRobotActive}
      />

      <div className="fade-in-load" style={{ opacity: isLoaded ? 1 : 0 }}>
        {/* Floating Glassmorphism Navbar */}
        <Navbar />

        {/* Floating Journey Navigator on the Left */}
        <JourneyNavigator scrollProgress={scrollProgress} />

        {/* Floating Diagnostics HUD in the Top-Right */}
        <StatusHUD />

        {/* Space Gateway Section */}
        <HeroSection scrollProgress={heroProgress} />

        {/* AI City Section */}
        <AICitySection scrollProgress={cityProgress} />

        {/* Robotics Lab Section */}
        <RoboticsLabSection scrollProgress={labProgress} />

        {/* Quantum Innovation Hub Section */}
        <QuantumHubSection 
          scrollProgress={hubProgress} 
          activeIslandId={activeIslandId} 
          setActiveIslandId={setActiveIslandId} 
        />

        {/* Innovation Gallery Section */}
        <InnovationGallerySection 
          scrollProgress={galleryProgress} 
          activeCubeId={activeCubeId} 
        />

        {/* Final Portal Section */}
        <FinalPortalSection scrollProgress={scrollProgress} />

        {/* First Portal Title Overlay */}
        <div 
          className="portal-title-overlay"
          style={{
            opacity: portalTitleOpacity,
            transform: `translate(-50%, calc(-50% + ${portalTitleTranslateY}px))`,
            pointerEvents: portalTitleOpacity > 0.1 ? 'auto' : 'none'
          }}
        >
          <h1 className="portal-title">ENTER THE AI DIMENSION</h1>
          <div className="portal-scroll-indicator">
            Continue Scrolling
            <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center' }}>
              <svg className="down-arrow-svg" viewBox="0 0 24 24" fill="none" style={{ width: '18px', height: '18px' }}>
                <path d="M7 13l5 5 5-5M7 6l5 5 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Temporary sector entrance overlays */}
      {overlaySector && (
        <div key={overlaySector.title} className="sector-entrance-overlay">
          <div className="sector-entrance-content">
            <span className="sector-entrance-label">{overlaySector.label}</span>
            <h1 className="sector-entrance-title">{overlaySector.title}</h1>
            <p className="sector-entrance-subtitle">"{overlaySector.subtitle}"</p>
          </div>
        </div>
      )}

      {/* Centered Glassmorphism Details Modals */}
      {activeIslandId !== null && (
        <Modal
          isOpen={activeIslandId !== null}
          onClose={() => setActiveIslandId(null)}
          title={islands[activeIslandId].title}
          description={islands[activeIslandId].description}
          icon={islands[activeIslandId].icon}
          color={islands[activeIslandId].color}
        />
      )}
      {activeCubeId !== null && (
        <Modal
          isOpen={activeCubeId !== null}
          onClose={() => setActiveCubeId(null)}
          title={cubes[activeCubeId].title}
          description={cubes[activeCubeId].description}
          icon={cubes[activeCubeId].icon}
          color={cubes[activeCubeId].color}
          futureApps={cubes[activeCubeId].futureApps}
        />
      )}
      {activeNodeId !== null && (
        <Modal
          isOpen={activeNodeId !== null}
          onClose={() => setActiveNodeId(null)}
          title={aiCoreNodes[activeNodeId].title}
          description={aiCoreNodes[activeNodeId].description}
          icon={aiCoreNodes[activeNodeId].icon}
          color={aiCoreNodes[activeNodeId].color}
          techMeta={aiCoreNodes[activeNodeId].techMeta}
        />
      )}
      {activeTerminalId !== null && (
        <Modal
          isOpen={activeTerminalId !== null}
          onClose={() => setActiveTerminalId(null)}
          title={terminalData[activeTerminalId].title}
          description={terminalData[activeTerminalId].description}
          icon={terminalData[activeTerminalId].icon}
          color={terminalData[activeTerminalId].color}
          techMeta={terminalData[activeTerminalId].techMeta}
        />
      )}
      {robotActive && (
        <Modal
          isOpen={robotActive}
          onClose={() => setRobotActive(false)}
          title={robotInfo.title}
          description={robotInfo.description}
          icon={robotInfo.icon}
          color={robotInfo.color}
          techMeta={robotInfo.techMeta}
        />
      )}
    </>
  );
}

export default App;
