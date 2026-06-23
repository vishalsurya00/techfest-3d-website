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
import ErrorBoundary from './components/ErrorBoundary';
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
  const [isTransitionActive, setIsTransitionActive] = useState(false);
  const [prevIndex, setPrevIndex] = useState(0);

  // Diagnostic mode states
  const [failedComponents, setFailedComponents] = useState([]);
  const [isSceneMounted, setIsSceneMounted] = useState(false);
  const [isCanvasCreated, setIsCanvasCreated] = useState(false);
  const [is3DDisabled, setIs3DDisabled] = useState(false);
  const [isAdvancedDisabled, setIsAdvancedDisabled] = useState(false);

  // New diagnostic states
  const [isCameraAnimDisabled, setIsCameraAnimDisabled] = useState(false);
  const [isDiagLightsEnabled, setIsDiagLightsEnabled] = useState(false);
  const [isShowTestObjects, setIsShowTestObjects] = useState(false);
  const [cameraResetTrigger, setCameraResetTrigger] = useState(0);
  const [loadedCounts, setLoadedCounts] = useState({
    earth: 0,
    portal: 0,
    aiCity: 0,
    robotics: 0,
    quantumHub: 0,
    innovationGallery: 0
  });
  const [warnings, setWarnings] = useState([]);

  // Error Boundary callback
  const handleComponentCrash = useCallback((name) => {
    setFailedComponents((prev) => prev.includes(name) ? prev : [...prev, name]);
  }, []);

  // Object load callback
  const handleObjectLoad = useCallback((name) => {
    setLoadedCounts((prev) => ({
      ...prev,
      [name]: (prev[name] || 0) + 1
    }));
  }, []);

  // Warning callback
  const handleWarning = useCallback((msg) => {
    setWarnings((prev) => prev.includes(msg) ? prev : [...prev, msg]);
  }, []);

  // Log App Mounted
  useEffect(() => {
    console.log("App Mounted");
  }, []);

  // Monitor Advanced Section Disable scroll behavior
  useEffect(() => {
    if (isAdvancedDisabled) {
      document.body.style.minHeight = '100vh';
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.minHeight = '';
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.minHeight = '';
      document.body.style.overflow = '';
    };
  }, [isAdvancedDisabled]);

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
    if (activeIndex !== prevIndex) {
      setPrevIndex(activeIndex);
      setIsTransitionActive(true);
      setOverlaySector(sectorInfo[activeIndex]);
    }
  }, [activeIndex, prevIndex, isLoaded]);

  useEffect(() => {
    if (isTransitionActive) {
      const timer = setTimeout(() => {
        setIsTransitionActive(false);
        setOverlaySector(null);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isTransitionActive]);

  // Derive per-section progress (6 sections)
  const heroProgress = Math.min(1, Math.max(0, scrollProgress * 6.0));
  const cityProgress = Math.min(1, Math.max(0, (scrollProgress - 0.1667) * 6.0));
  const labProgress = Math.min(1, Math.max(0, (scrollProgress - 0.3333) * 6.0));
  const hubProgress = Math.min(1, Math.max(0, (scrollProgress - 0.50) * 6.0));
  const galleryProgress = Math.min(1, Math.max(0, (scrollProgress - 0.6667) * 6.0));

  // Portal Title: appears near end of gateway phase, fades as city phase begins
  const portalFadeIn = Math.max(0, Math.min(1, (scrollProgress - 0.12) * 20));
  const portalFadeOut = Math.max(0, Math.min(1, 1 - (scrollProgress - 0.1667) * 20));
  const portalTitleOpacity = isTransitionActive ? 0 : (portalFadeIn * portalFadeOut);
  const portalTitleTranslateY = 20 - portalFadeIn * 20;

  return (
    <>
      {/* Custom Glowing Cursor with Particle Trail */}
      <CustomCursor />

      {/* Opening boot loader */}
      {!isLoaded && <Loader onComplete={() => setIsLoaded(true)} />}

      {/* 3D Interactive WebGL Universe Background */}
      {!is3DDisabled && (
        <ErrorBoundary name="Scene" onCrash={handleComponentCrash}>
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
            onSceneMount={() => setIsSceneMounted(true)}
            onCanvasCreated={() => setIsCanvasCreated(true)}
            onCrash={handleComponentCrash}
            isCameraAnimDisabled={isCameraAnimDisabled}
            isDiagLightsEnabled={isDiagLightsEnabled}
            isShowTestObjects={isShowTestObjects}
            cameraResetTrigger={cameraResetTrigger}
            onLoad={handleObjectLoad}
            onWarning={handleWarning}
            failedComponents={failedComponents}
            loadedCounts={loadedCounts}
            isTransitionActive={isTransitionActive}
          />
        </ErrorBoundary>
      )}

      <div className="fade-in-load" style={{ opacity: isLoaded ? 1 : 0 }}>
        {/* Floating Glassmorphism Navbar */}
        <ErrorBoundary name="Navbar" onCrash={handleComponentCrash}>
          <Navbar />
        </ErrorBoundary>

        {/* Floating Journey Navigator on the Left */}
        {!isAdvancedDisabled && (
          <ErrorBoundary name="JourneyNavigator" onCrash={handleComponentCrash}>
            <JourneyNavigator scrollProgress={scrollProgress} />
          </ErrorBoundary>
        )}

        {/* Floating Diagnostics HUD in the Top-Right */}
        {!isAdvancedDisabled && (
          <ErrorBoundary name="StatusHUD" onCrash={handleComponentCrash}>
            <StatusHUD />
          </ErrorBoundary>
        )}

        {/* Space Gateway Section */}
        <ErrorBoundary name="HeroSection" onCrash={handleComponentCrash}>
          <HeroSection scrollProgress={heroProgress} isTransitionActive={isTransitionActive && activeIndex === 0} />
        </ErrorBoundary>

        {!isAdvancedDisabled && (
          <>
            {/* AI City Section */}
            <ErrorBoundary name="AICitySection" onCrash={handleComponentCrash}>
              <AICitySection scrollProgress={cityProgress} isTransitionActive={isTransitionActive && activeIndex === 1} />
            </ErrorBoundary>

            {/* Robotics Lab Section */}
            <ErrorBoundary name="RoboticsLabSection" onCrash={handleComponentCrash}>
              <RoboticsLabSection scrollProgress={labProgress} isTransitionActive={isTransitionActive && activeIndex === 2} />
            </ErrorBoundary>

            {/* Quantum Innovation Hub Section */}
            <ErrorBoundary name="QuantumHubSection" onCrash={handleComponentCrash}>
              <QuantumHubSection 
                scrollProgress={hubProgress} 
                activeIslandId={activeIslandId} 
                setActiveIslandId={setActiveIslandId} 
                isTransitionActive={isTransitionActive && activeIndex === 3}
              />
            </ErrorBoundary>

            {/* Innovation Gallery Section */}
            <ErrorBoundary name="InnovationGallerySection" onCrash={handleComponentCrash}>
              <InnovationGallerySection 
                scrollProgress={galleryProgress} 
                activeCubeId={activeCubeId} 
                isTransitionActive={isTransitionActive && activeIndex === 4}
              />
            </ErrorBoundary>

            {/* Final Portal Section */}
            <ErrorBoundary name="FinalPortalSection" onCrash={handleComponentCrash}>
              <FinalPortalSection scrollProgress={scrollProgress} isTransitionActive={isTransitionActive && activeIndex === 5} />
            </ErrorBoundary>
          </>
        )}

        {/* First Portal Title Overlay */}
        {!isAdvancedDisabled && (
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
        )}
      </div>

      {/* Temporary sector entrance overlays */}
      {!isAdvancedDisabled && overlaySector && (
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

      {/* Temporary Diagnostic Debug Panel */}
      <div className="debug-panel">
        <div className="debug-panel-title">// Diagnostic Panel</div>
        
        <div className="debug-row">
          <span className="debug-label">React App Loaded:</span>
          <span className="debug-value yes">YES</span>
        </div>
        <div className="debug-row">
          <span className="debug-label">Scene Mounted:</span>
          <span className={`debug-value ${isSceneMounted ? 'yes' : 'no'}`}>
            {isSceneMounted ? 'YES' : 'NO'}
          </span>
        </div>
        <div className="debug-row">
          <span className="debug-label">Canvas Created:</span>
          <span className={`debug-value ${isCanvasCreated ? 'yes' : 'no'}`}>
            {isCanvasCreated ? 'YES' : 'NO'}
          </span>
        </div>
        <div className="debug-row">
          <span className="debug-label">Camera Pos:</span>
          <span className="debug-value" id="debug-cam-pos">
            X: 0.00, Y: 0.00, Z: 5.80
          </span>
        </div>
        <div className="debug-row">
          <span className="debug-label">Scroll Progress:</span>
          <span className="debug-value">
            {(scrollProgress * 100).toFixed(1)}%
          </span>
        </div>
        <div className="debug-row">
          <span className="debug-label">Section:</span>
          <span className="debug-value">
            {sectorInfo[activeIndex]?.title || 'Space Gateway'}
          </span>
        </div>
        <div className="debug-row">
          <span className="debug-label">Transition Active:</span>
          <span className={`debug-value ${isTransitionActive ? 'yes' : 'no'}`}>
            {isTransitionActive ? 'YES' : 'NO'}
          </span>
        </div>

        <div className="debug-row">
          <span className="debug-label">Earth Loaded:</span>
          <span className="debug-value">{loadedCounts.earth}</span>
        </div>
        <div className="debug-row">
          <span className="debug-label">Portal Loaded:</span>
          <span className="debug-value">{loadedCounts.portal}</span>
        </div>
        <div className="debug-row">
          <span className="debug-label">AI City Loaded:</span>
          <span className="debug-value">{loadedCounts.aiCity}</span>
        </div>
        <div className="debug-row">
          <span className="debug-label">Robotics Loaded:</span>
          <span className="debug-value">{loadedCounts.robotics}</span>
        </div>
        <div className="debug-row">
          <span className="debug-label">Quantum Hub Loaded:</span>
          <span className="debug-value">{loadedCounts.quantumHub}</span>
        </div>
        <div className="debug-row">
          <span className="debug-label">Innovation Gallery Loaded:</span>
          <span className="debug-value">{loadedCounts.innovationGallery}</span>
        </div>

        {failedComponents.length > 0 && (
          <div className="debug-failures">
            <div className="debug-failures-title">FAILED COMPONENTS:</div>
            <ul className="debug-failures-list">
              {failedComponents.map((name) => (
                <li key={name}>• {name}</li>
              ))}
            </ul>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="debug-warnings">
            <div className="debug-warnings-title">WARNINGS:</div>
            <ul className="debug-warnings-list">
              {warnings.map((warn, index) => (
                <li key={index}>• {warn}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="debug-buttons">
          <button 
            className="debug-btn"
            onClick={() => setCameraResetTrigger((prev) => prev + 1)}
          >
            Reset Camera
          </button>
          <button 
            className={`debug-btn ${isCameraAnimDisabled ? 'active' : ''}`}
            onClick={() => setIsCameraAnimDisabled((prev) => !prev)}
          >
            {isCameraAnimDisabled ? 'Enable Camera Anim' : 'Disable Camera Anim'}
          </button>
          <button 
            className={`debug-btn ${isDiagLightsEnabled ? 'active' : ''}`}
            onClick={() => setIsDiagLightsEnabled((prev) => !prev)}
          >
            {isDiagLightsEnabled ? 'Disable Diag Lights' : 'Enable Diag Lights'}
          </button>
          <button 
            className={`debug-btn ${isShowTestObjects ? 'active' : ''}`}
            onClick={() => setIsShowTestObjects((prev) => !prev)}
          >
            {isShowTestObjects ? 'Hide Test Objects' : 'Show Test Objects'}
          </button>
          <button 
            className={`debug-btn ${is3DDisabled ? 'active' : ''}`}
            onClick={() => {
              setIs3DDisabled((prev) => !prev);
              if (!is3DDisabled) {
                setIsSceneMounted(false);
                setIsCanvasCreated(false);
              }
            }}
          >
            {is3DDisabled ? 'Enable 3D Scene' : 'Disable 3D Scene'}
          </button>
          <button 
            className={`debug-btn ${isAdvancedDisabled ? 'active' : ''}`}
            onClick={() => setIsAdvancedDisabled((prev) => !prev)}
          >
            {isAdvancedDisabled ? 'Enable Advanced Sections' : 'Disable Advanced Sections'}
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
