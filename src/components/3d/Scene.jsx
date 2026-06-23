import React, { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Starfield from './Starfield';
import Nebula from './Nebula';
import Earth from './Earth';
import Spaceship from './Spaceship';
import Portal from './Portal';
import AICity from './AICity';
import RoboticsLab from './RoboticsLab';
import QuantumHub from './QuantumHub';
import InnovationGallery from './InnovationGallery';
import ThreeErrorBoundary from './ThreeErrorBoundary';

// Inner component to access R3F hooks (useFrame, useThree)
const SceneContent = ({ 
  scrollProgress = 0, 
  activeIslandId = null, 
  setActiveIslandId, 
  activeCubeId = null, 
  setActiveCubeId, 
  activeNodeId = null, 
  setActiveNodeId, 
  activeTerminalId = null, 
  setActiveTerminalId, 
  robotActive = false, 
  setRobotActive, 
  onCrash,
  // New diagnostic props:
  isCameraAnimDisabled = false,
  isDiagLightsEnabled = false,
  isShowTestObjects = false,
  cameraResetTrigger = 0,
  onLoad,
  onWarning,
  failedComponents = [],
  loadedCounts = {},
  isTransitionActive = false
}) => {
  const { camera, scene } = useThree();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const sectionGroupRef = useRef();

  // Helper to determine if a section is failed or has not loaded yet
  const isSectionInvalid = (secIndex) => {
    const failed = failedComponents || [];
    const loaded = loadedCounts || {};

    const componentNames = [
      [], // Hero
      ['AI City'],
      ['Robotics Lab'],
      ['Quantum Hub'],
      ['Innovation Gallery'],
      ['Portal 2']
    ];

    // Check if failed
    const isFailed = componentNames[secIndex].some(name => failed.includes(name));
    if (isFailed) return true;

    // Check if loaded
    if (secIndex === 1 && !loaded.aiCity) return true;
    if (secIndex === 2 && !loaded.robotics) return true;
    if (secIndex === 3 && !loaded.quantumHub) return true;
    if (secIndex === 4 && !loaded.innovationGallery) return true;
    if (secIndex === 5 && !loaded.portal) return true;

    return false;
  };

  // Helper to get safe clamped scroll progress
  const getSafeScrollProgress = (scrollVal) => {
    const thresholds = [0.1667, 0.3333, 0.50, 0.6667, 0.8333, 1.0];
    
    // Determine what target section this scrollVal falls into
    let targetSec = 0;
    for (let i = 0; i < thresholds.length; i++) {
      if (scrollVal <= thresholds[i]) {
        targetSec = i;
        break;
      }
    }

    // Check if any section from 0 up to targetSec is invalid
    let safeSec = 0;
    for (let i = 0; i <= targetSec; i++) {
      if (isSectionInvalid(i)) {
        break; // Stop before this invalid section
      }
      safeSec = i;
    }

    if (safeSec < targetSec) {
      return thresholds[safeSec];
    }
    return scrollVal;
  };

  const safeScrollProgress = getSafeScrollProgress(scrollProgress);

  // Define progress variables in outer scope to resolve ReferenceErrors in JSX
  const heroProgress = Math.min(1, Math.max(0, safeScrollProgress * 6.0));
  const cityProgress = Math.min(1, Math.max(0, (safeScrollProgress - 0.1667) * 6.0));
  const labProgress = Math.min(1, Math.max(0, (safeScrollProgress - 0.3333) * 6.0));

  // Custom clock tracking local time progression (pauses when modal is active)
  const timeRef = useRef(0);

  // Smooth scroll tracking to slow down all scroll-driven camera transitions
  const smoothScroll = useRef(safeScrollProgress);

  // Smooth lookAt target tracking
  const currentLookAt = useRef(new THREE.Vector3(0, 0, -6.0));

  // Zoom progression state (0 to 1) for smooth ease-in-out click transitions
  const zoomProgress = useRef(0);

  // Keep track of reset trigger
  const lastResetTrigger = useRef(0);

  // Handle background and fog dynamically
  useEffect(() => {
    scene.background = new THREE.Color("#05020a");
    if (isDiagLightsEnabled) {
      scene.fog = null;
    } else {
      scene.fog = new THREE.FogExp2('#05020a', 0.0018);
    }
  }, [isDiagLightsEnabled, scene]);

  // Handle mouse movement for parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      setMouse({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state, delta) => {
    // 0. Handle Camera Reset
    if (cameraResetTrigger !== lastResetTrigger.current) {
      lastResetTrigger.current = cameraResetTrigger;
      camera.position.set(0, 0, 8);
      currentLookAt.current.set(0, 0, 0);
      camera.lookAt(0, 0, 0);
    }

    // 0. Update custom time tracking (freezes when active item is selected)
    const isPaused = activeIslandId !== null || activeCubeId !== null || activeNodeId !== null || activeTerminalId !== null || robotActive;
    const isZoomed = isPaused;
    if (!isPaused) {
      timeRef.current += delta;
    }
    const time = timeRef.current;

    // Derive per-section progress for sub-components (6 sections) used inside loop
    const safeScrollFrame = getSafeScrollProgress(scrollProgress);
    const scrollTrackingSpeed = 1.6; 
    smoothScroll.current = THREE.MathUtils.lerp(
      smoothScroll.current,
      safeScrollFrame,
      1 - Math.exp(-scrollTrackingSpeed * delta)
    );
    const pCurrent = smoothScroll.current;

    // Calculate parent group Z translation (brings active section to Z ~ 0)
    const sectionZOffsets = [0, 60, 120, 190, 260, 320];
    const segmentZ = pCurrent * 6.0; // 0 to 6 (matches camera mapping)
    const idxZ = Math.min(5, Math.floor(segmentZ));
    const fracZ = segmentZ - idxZ;
    
    const groupZOffset = idxZ >= 5 
      ? sectionZOffsets[5] 
      : THREE.MathUtils.lerp(sectionZOffsets[idxZ], sectionZOffsets[idxZ + 1], fracZ);

    if (sectionGroupRef.current) {
      sectionGroupRef.current.position.z = groupZOffset;
    }

    if (!isCameraAnimDisabled) {
      // Define camera positions for each section (all Z between 6.0 and 8.0, all Y between 0.0 and 1.5)
      const sectionCamPositions = [
        new THREE.Vector3(0, 0.0, 8.0),   // Hero start
        new THREE.Vector3(0, 0.5, 6.0),   // Hero end / AI City start
        new THREE.Vector3(0, 1.5, 7.5),   // AI City end / Robotics start
        new THREE.Vector3(0, 0.0, 7.0),   // Robotics end / Quantum start
        new THREE.Vector3(0, 1.0, 8.0),   // Quantum end / Gallery start
        new THREE.Vector3(0, 1.0, 7.5),   // Gallery end / Final Portal start
        new THREE.Vector3(0, 0.5, 8.0)    // Final Portal end
      ];

      const segmentCam = pCurrent * 6.0; // 6 segments (0 to 6)
      const idxCam = Math.min(5, Math.floor(segmentCam));
      const fracCam = segmentCam - idxCam;

      let scrollCamPos = new THREE.Vector3();
      scrollCamPos.lerpVectors(sectionCamPositions[idxCam], sectionCamPositions[idxCam + 1], fracCam);

      // Define camera lookAt targets for each section (all Z around -5.0 / -6.0)
      const sectionTargets = [
        new THREE.Vector3(0, 0.0, -6.0),    // Hero
        new THREE.Vector3(0, -3.0, -5.0),   // AI City
        new THREE.Vector3(0, -1.8, -5.0),   // Robotics Lab
        new THREE.Vector3(0, 0.0, -5.0),    // Quantum Hub
        new THREE.Vector3(0, -0.5, -5.0),   // Gallery
        new THREE.Vector3(0, 0.0, -6.0)     // Final Portal
      ];

      const segmentTarget = pCurrent * 5.0; // 5 segments (0 to 5)
      const idxTarget = Math.min(4, Math.floor(segmentTarget));
      const fracTarget = segmentTarget - idxTarget;

      let scrollLookAt = new THREE.Vector3();
      scrollLookAt.lerpVectors(sectionTargets[idxTarget], sectionTargets[idxTarget + 1], fracTarget);

      // 1.5. Calculate Zoom Camera Position and Target if selected
      let zoomCamPos = new THREE.Vector3();
      let zoomLookAt = new THREE.Vector3();

      if (activeIslandId !== null) {
        const orbitRadius = 9.0;
        const angle = (activeIslandId * Math.PI * 2) / 5 + time * 0.12;
        const islandX = Math.cos(angle) * orbitRadius;
        const islandZ = -190 + Math.sin(angle) * orbitRadius;
        const islandY = -1.0 + Math.sin(time * 1.5 + activeIslandId) * 0.35 + 0.4;

        zoomCamPos.set(islandX * 0.58, islandY + 1.0, islandZ + 4.2 + groupZOffset);
        zoomLookAt.set(islandX, islandY, islandZ + groupZOffset);
      } else if (activeCubeId !== null) {
        const orbitRadius = 8.0;
        const angle = (activeCubeId / 8) * Math.PI * 2;
        const cubeX = Math.cos(angle) * orbitRadius;
        const cubeZ = -260 + Math.sin(angle) * orbitRadius;
        const cubeY = Math.sin(time * 1.0 + activeCubeId * 0.8) * 0.18;

        zoomCamPos.set(cubeX * 0.62, cubeY + 1.2, cubeZ + 4.0 + groupZOffset);
        zoomLookAt.set(cubeX, cubeY, cubeZ + groupZOffset);
      } else if (activeNodeId !== null) {
        zoomCamPos.set(0, -4.5 + 2.0, -60 + 9.0 + groupZOffset);
        zoomLookAt.set(0, -4.5, -60 + groupZOffset);
      } else if (activeTerminalId !== null) {
        if (activeTerminalId === 0) {
          zoomCamPos.set(-3.6, -3.4 + 1.2, -116.5 + 4.0 + groupZOffset);
          zoomLookAt.set(-3.6, -3.4, -116.5 + groupZOffset);
        } else if (activeTerminalId === 1) {
          zoomCamPos.set(0, -3.4 + 1.2, -115.0 + 4.0 + groupZOffset);
          zoomLookAt.set(0, -3.4, -115.0 + groupZOffset);
        } else if (activeTerminalId === 2) {
          zoomCamPos.set(3.6, -3.4 + 1.2, -116.5 + 4.0 + groupZOffset);
          zoomLookAt.set(3.6, -3.4, -116.5 + groupZOffset);
        }
      } else if (robotActive) {
        zoomCamPos.set(0, -1.8 + 1.5, -120 + 4.8 + groupZOffset);
        zoomLookAt.set(0, -1.8 + 0.5, -120 + groupZOffset);
      }

      // 1.6. Interpolate between Scroll Camera and Zoom Camera (with ease-in-out)
      const targetZoom = isZoomed ? 1.0 : 0.0;
      const zoomSpeed = 2.0; 
      zoomProgress.current = THREE.MathUtils.lerp(
        zoomProgress.current,
        targetZoom,
        1 - Math.exp(-zoomSpeed * delta)
      );

      const easeT = THREE.MathUtils.smoothstep(zoomProgress.current, 0, 1);

      const targetCamPos = new THREE.Vector3().lerpVectors(scrollCamPos, zoomCamPos, easeT);
      const finalLookAt = new THREE.Vector3().lerpVectors(scrollLookAt, zoomLookAt, easeT);

      // 2. Apply Camera Position with Parallax
      const targetCamX = mouse.x * 1.5;
      const targetCamY = -mouse.y * 1.5;

      const trackingRate = 1.47;
      const lerpFactor = 1 - Math.exp(-trackingRate * delta);

      camera.position.x += (targetCamPos.x + targetCamX - camera.position.x) * lerpFactor;
      camera.position.y += (targetCamPos.y + targetCamY - camera.position.y) * lerpFactor;
      camera.position.z += (targetCamPos.z - camera.position.z) * lerpFactor;

      // 4. Orient camera to look at target
      currentLookAt.current.lerp(finalLookAt, lerpFactor);
      const tiltedLookAt = new THREE.Vector3().copy(currentLookAt.current);
      tiltedLookAt.x += mouse.x * 1.2;
      tiltedLookAt.y -= mouse.y * 1.2;

      // Ensure lookAt target coordinates are valid
      if (isNaN(tiltedLookAt.x) || isNaN(tiltedLookAt.y) || isNaN(tiltedLookAt.z)) {
        tiltedLookAt.set(0, 0, 0);
      }
      camera.lookAt(tiltedLookAt);
    } else {
      // If camera animations are disabled, ensure the camera looks at the current look-at target
      const targetLook = currentLookAt.current ? currentLookAt.current : new THREE.Vector3(0, 0, 0);
      if (isNaN(targetLook.x) || isNaN(targetLook.y) || isNaN(targetLook.z)) {
        targetLook.set(0, 0, 0);
      }
      camera.lookAt(targetLook);
    }

    // Safety Bounds Check (Before Clamping)
    const isOutOfBounds = 
      camera.position.x < -10 || camera.position.x > 10 ||
      camera.position.y < -5 || camera.position.y > 5 ||
      camera.position.z < 2 || camera.position.z > 12;

    if (isOutOfBounds) {
      if (onWarning) {
        onWarning("Camera Out Of Bounds");
      }
      camera.position.set(0, 0, 8);
      currentLookAt.current.set(0, 0, 0);
      camera.lookAt(0, 0, 0);
    }

    // Strict clamping of camera coordinates
    camera.position.x = Math.max(-10, Math.min(10, camera.position.x));
    camera.position.y = Math.max(-5, Math.min(5, camera.position.y));
    camera.position.z = Math.max(2, Math.min(12, camera.position.z));

    const camPosEl = document.getElementById('debug-cam-pos');
    if (camPosEl) {
      camPosEl.textContent = `X: ${camera.position.x.toFixed(2)}, Y: ${camera.position.y.toFixed(2)}, Z: ${camera.position.z.toFixed(2)}`;
    }
  });

  return (
    <>
      <ambientLight color="#120626" intensity={isDiagLightsEnabled ? 3.75 : 2.25} />
      
      {/* Bright solar light (Electric Blue) */}
      <directionalLight
        position={[6, 3, 5]}
        color="#00f0ff"
        intensity={6.25}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Rim fill light (Neon Purple) */}
      <directionalLight
        position={[-6, -3, -5]}
        color="#bd00ff"
        intensity={isDiagLightsEnabled ? 6.25 : 4.0}
      />

      {/* Diagnostic grid helper and test objects */}
      {isShowTestObjects && (
        <group>
          <gridHelper args={[30, 30, '#00ffa0', '#444444']} position={[0, -2, 0]} />
          
          {/* Red cube at [0,0,0] */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.6, 0.6, 0.6]} />
            <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.2} />
          </mesh>

          {/* Green sphere at [3,0,0] */}
          <mesh position={[3, 0, 0]}>
            <sphereGeometry args={[0.4, 32, 32]} />
            <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.2} />
          </mesh>

          {/* Blue cube at [-3,0,0] */}
          <mesh position={[-3, 0, 0]}>
            <boxGeometry args={[0.6, 0.6, 0.6]} />
            <meshStandardMaterial color="#0000ff" emissive="#0000ff" emissiveIntensity={0.2} />
          </mesh>
        </group>
      )}

      {/* Translated Section Group */}
      <group ref={sectionGroupRef}>
        {/* Earth Group (contains Earth mesh and the spaceship) — uses heroProgress */}
        <group>
          <ThreeErrorBoundary name="Earth" onCrash={onCrash} position={[-3.8, -0.2, 0]}>
            <Earth scrollProgress={heroProgress} onLoad={onLoad} onWarning={onWarning} />
          </ThreeErrorBoundary>
          <ThreeErrorBoundary name="Spaceship" onCrash={onCrash}>
            <Spaceship scrollProgress={heroProgress} />
          </ThreeErrorBoundary>
        </group>

        {/* 3D Glowing Portal — first portal */}
        <ThreeErrorBoundary name="Portal 1" onCrash={onCrash} position={[0, 0, -6.0]}>
          <Portal scrollProgress={safeScrollProgress} position={[0, 0, -6.0]} isFinal={false} onLoad={onLoad} onWarning={onWarning} />
        </ThreeErrorBoundary>

        {/* 3D Glowing Portal — second/final portal at Z = -320 */}
        <ThreeErrorBoundary name="Portal 2" onCrash={onCrash} position={[0, 0, -320.0]}>
          <Portal scrollProgress={safeScrollProgress} position={[0, 0, -320.0]} isFinal={true} onLoad={onLoad} onWarning={onWarning} />
        </ThreeErrorBoundary>

        {/* 3D AI City — uses raw scrollProgress for opacity timing */}
        <ThreeErrorBoundary name="AI City" onCrash={onCrash} position={[0, -4.5, -60]}>
          <AICity scrollProgress={safeScrollProgress} activeNodeId={activeNodeId} setActiveNodeId={setActiveNodeId} onLoad={onLoad} onWarning={onWarning} />
        </ThreeErrorBoundary>

        {/* 3D Robotics Lab — uses raw scrollProgress for transition/fading */}
        <ThreeErrorBoundary name="Robotics Lab" onCrash={onCrash} position={[0, -4.8, -120]}>
          <RoboticsLab scrollProgress={safeScrollProgress} activeTerminalId={activeTerminalId} setActiveTerminalId={setActiveTerminalId} robotActive={robotActive} setRobotActive={setRobotActive} onLoad={onLoad} onWarning={onWarning} />
        </ThreeErrorBoundary>

        {/* 3D Quantum Innovation Hub — uses raw scrollProgress for fading */}
        <ThreeErrorBoundary name="Quantum Hub" onCrash={onCrash} position={[0, 0, -190]}>
          <QuantumHub scrollProgress={safeScrollProgress} activeIslandId={activeIslandId} setActiveIslandId={setActiveIslandId} onLoad={onLoad} onWarning={onWarning} />
        </ThreeErrorBoundary>

        {/* 3D Innovation Gallery — uses raw scrollProgress for fading */}
        <ThreeErrorBoundary name="Innovation Gallery" onCrash={onCrash} position={[0, 0, -260]}>
          <InnovationGallery scrollProgress={safeScrollProgress} activeCubeId={activeCubeId} setActiveCubeId={setActiveCubeId} onLoad={onLoad} onWarning={onWarning} />
        </ThreeErrorBoundary>

        {/* City overhead ambient light — fades in during city phase, fades out in lab phase */}
        <pointLight
          position={[0, 15, -60]}
          color="#00f0ff"
          intensity={cityProgress * (1.0 - labProgress) * 10.0}
          distance={80}
          decay={2}
        />
        <pointLight
          position={[0, -5, -60]}
          color="#bd00ff"
          intensity={cityProgress * (1.0 - labProgress) * 5.0}
          distance={60}
          decay={2}
        />
      </group>

      {/* Background starfield and nebula — uses raw scrollProgress, computes heroPhase internally */}
      <Starfield scrollProgress={safeScrollProgress} />
      <Nebula scrollProgress={safeScrollProgress} />
    </>
  );
};

const Scene = ({ 
  scrollProgress = 0, 
  activeIslandId = null, 
  setActiveIslandId, 
  activeCubeId = null, 
  setActiveCubeId, 
  activeNodeId = null, 
  setActiveNodeId, 
  activeTerminalId = null, 
  setActiveTerminalId, 
  robotActive = false, 
  setRobotActive, 
  onSceneMount, 
  onCanvasCreated, 
  onCrash,
  isCameraAnimDisabled = false,
  isDiagLightsEnabled = false,
  isShowTestObjects = false,
  cameraResetTrigger = 0,
  onLoad,
  onWarning,
  failedComponents = [],
  loadedCounts = {},
  isTransitionActive = false
}) => {
  const isModalOpen = activeCubeId !== null || activeIslandId !== null || activeNodeId !== null || activeTerminalId !== null || robotActive;
  const shouldBlur = isModalOpen || isTransitionActive;

  useEffect(() => {
    console.log("Scene Mounted");
    if (onSceneMount) onSceneMount();
  }, [onSceneMount]);

  return (
    <div className={`webgl-canvas ${shouldBlur ? 'gallery-blur' : ''} ${isModalOpen ? 'scene-interactions-disabled' : ''}`}>
      <Canvas
        camera={{ position: [0, 0, 5.8], fov: 45, near: 0.1, far: 2000 }}
        shadows
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl, scene }) => {
          scene.fog = new THREE.FogExp2('#05020a', 0.0018);
          scene.background = new THREE.Color("#05020a");
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.1;
          console.log("Canvas Created");
          if (onCanvasCreated) onCanvasCreated();
        }}
      >
        <SceneContent 
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
          onCrash={onCrash}
          isCameraAnimDisabled={isCameraAnimDisabled}
          isDiagLightsEnabled={isDiagLightsEnabled}
          isShowTestObjects={isShowTestObjects}
          cameraResetTrigger={cameraResetTrigger}
          onLoad={onLoad}
          onWarning={onWarning}
          failedComponents={failedComponents}
          loadedCounts={loadedCounts}
          isTransitionActive={isTransitionActive}
        />
      </Canvas>
    </div>
  );
};

export default Scene;
