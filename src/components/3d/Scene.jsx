import React, { useEffect, useRef } from 'react';
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
  isTransitionActive = false
}) => {
  const { camera, scene } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  const sectionGroupRef = useRef();

  // Handle background and fog
  useEffect(() => {
    scene.background = new THREE.Color("#05020a");
    scene.fog = new THREE.FogExp2('#05020a', 0.0018);
  }, [scene]);

  // Handle mouse movement for parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouse.current = {
        x: (e.clientX / window.innerWidth) - 0.5,
        y: (e.clientY / window.innerHeight) - 0.5
      };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Custom clock tracking local time progression (pauses when modal is active)
  const timeRef = useRef(0);

  // Smooth scroll tracking to slow down all scroll-driven camera transitions
  const smoothScroll = useRef(scrollProgress);

  // Smooth lookAt target tracking
  const currentLookAt = useRef(new THREE.Vector3(0, 0, -6.0));

  // Zoom progression state (0 to 1) for smooth ease-in-out click transitions
  const zoomProgress = useRef(0);

  // Derive per-section progress for lighting
  const heroProgress = Math.min(1, Math.max(0, scrollProgress * 6.0));
  const cityProgress = Math.min(1, Math.max(0, (scrollProgress - 0.1667) * 6.0));
  const labProgress = Math.min(1, Math.max(0, (scrollProgress - 0.3333) * 6.0));

  useFrame((state, delta) => {
    // Update custom time tracking (freezes when active item is selected)
    const isPaused = activeIslandId !== null || activeCubeId !== null || activeNodeId !== null || activeTerminalId !== null || robotActive;
    const isZoomed = isPaused;
    if (!isPaused) {
      timeRef.current += delta;
    }
    const time = timeRef.current;

    // Smooth scroll tracking
    const scrollTrackingSpeed = 1.6; 
    smoothScroll.current = THREE.MathUtils.lerp(
      smoothScroll.current,
      scrollProgress,
      1 - Math.exp(-scrollTrackingSpeed * delta)
    );
    const pCurrent = smoothScroll.current;

    // Calculate parent group Z translation (brings active section to Z ~ 0)
    const sectionZOffsets = [0, 60, 120, 190, 260, 320];
    const segmentZ = pCurrent * 6.0;
    const idxZ = Math.min(5, Math.floor(segmentZ));
    const fracZ = segmentZ - idxZ;
    
    const groupZOffset = idxZ >= 5 
      ? sectionZOffsets[5] 
      : THREE.MathUtils.lerp(sectionZOffsets[idxZ], sectionZOffsets[idxZ + 1], fracZ);

    if (sectionGroupRef.current) {
      sectionGroupRef.current.position.z = groupZOffset;
    }

    // Define camera positions for each section
    const sectionCamPositions = [
      new THREE.Vector3(0, 0.0, 8.0),
      new THREE.Vector3(0, 0.5, 6.0),
      new THREE.Vector3(0, 1.5, 7.5),
      new THREE.Vector3(0, 0.0, 7.0),
      new THREE.Vector3(0, 1.0, 8.0),
      new THREE.Vector3(0, 1.0, 7.5),
      new THREE.Vector3(0, 0.5, 8.0)
    ];

    const segmentCam = pCurrent * 6.0;
    const idxCam = Math.min(5, Math.floor(segmentCam));
    const fracCam = segmentCam - idxCam;

    let scrollCamPos = new THREE.Vector3();
    scrollCamPos.lerpVectors(sectionCamPositions[idxCam], sectionCamPositions[idxCam + 1], fracCam);

    // Define camera lookAt targets for each section
    const sectionTargets = [
      new THREE.Vector3(0, 0.0, -6.0),
      new THREE.Vector3(0, -3.0, -5.0),
      new THREE.Vector3(0, -1.8, -5.0),
      new THREE.Vector3(0, 0.0, -5.0),
      new THREE.Vector3(0, -0.5, -5.0),
      new THREE.Vector3(0, 0.0, -6.0)
    ];

    const segmentTarget = pCurrent * 5.0;
    const idxTarget = Math.min(4, Math.floor(segmentTarget));
    const fracTarget = segmentTarget - idxTarget;

    let scrollLookAt = new THREE.Vector3();
    scrollLookAt.lerpVectors(sectionTargets[idxTarget], sectionTargets[idxTarget + 1], fracTarget);

    // Calculate Zoom Camera Position and Target if a modal item is selected
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

    // Interpolate between Scroll Camera and Zoom Camera (with ease-in-out)
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

    // Apply Camera Position with Parallax
    const targetCamX = mouse.current.x * 1.5;
    const targetCamY = -mouse.current.y * 1.5;

    const trackingRate = 1.47;
    const lerpFactor = 1 - Math.exp(-trackingRate * delta);

    camera.position.x += (targetCamPos.x + targetCamX - camera.position.x) * lerpFactor;
    camera.position.y += (targetCamPos.y + targetCamY - camera.position.y) * lerpFactor;
    camera.position.z += (targetCamPos.z - camera.position.z) * lerpFactor;

    // Orient camera to look at target
    currentLookAt.current.lerp(finalLookAt, lerpFactor);
    const tiltedLookAt = new THREE.Vector3().copy(currentLookAt.current);
    tiltedLookAt.x += mouse.current.x * 1.2;
    tiltedLookAt.y -= mouse.current.y * 1.2;

    // Ensure lookAt target coordinates are valid
    if (isNaN(tiltedLookAt.x) || isNaN(tiltedLookAt.y) || isNaN(tiltedLookAt.z)) {
      tiltedLookAt.set(0, 0, 0);
    }
    camera.lookAt(tiltedLookAt);

    // Safety clamp camera coordinates to prevent extreme positions
    camera.position.x = Math.max(-10, Math.min(10, camera.position.x));
    camera.position.y = Math.max(-5, Math.min(5, camera.position.y));
    camera.position.z = Math.max(2, Math.min(12, camera.position.z));
  });

  return (
    <>
      <ambientLight color="#120626" intensity={2.25} />
      
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
        intensity={4.0}
      />

      {/* Translated Section Group */}
      <group ref={sectionGroupRef}>
        {/* Earth Group (contains Earth mesh and the spaceship) */}
        <group>
          <ThreeErrorBoundary name="Earth" position={[-3.8, -0.2, 0]}>
            <Earth scrollProgress={heroProgress} />
          </ThreeErrorBoundary>
          <ThreeErrorBoundary name="Spaceship">
            <Spaceship scrollProgress={heroProgress} />
          </ThreeErrorBoundary>
        </group>

        {/* 3D Glowing Portal — first portal */}
        <ThreeErrorBoundary name="Portal 1" position={[0, 0, -6.0]}>
          <Portal scrollProgress={scrollProgress} position={[0, 0, -6.0]} isFinal={false} />
        </ThreeErrorBoundary>

        {/* 3D Glowing Portal — second/final portal at Z = -320 */}
        <ThreeErrorBoundary name="Portal 2" position={[0, 0, -320.0]}>
          <Portal scrollProgress={scrollProgress} position={[0, 0, -320.0]} isFinal={true} />
        </ThreeErrorBoundary>

        {/* 3D AI City */}
        <ThreeErrorBoundary name="AI City" position={[0, -4.5, -60]}>
          <AICity scrollProgress={scrollProgress} activeNodeId={activeNodeId} setActiveNodeId={setActiveNodeId} />
        </ThreeErrorBoundary>

        {/* 3D Robotics Lab */}
        <ThreeErrorBoundary name="Robotics Lab" position={[0, -4.8, -120]}>
          <RoboticsLab scrollProgress={scrollProgress} activeTerminalId={activeTerminalId} setActiveTerminalId={setActiveTerminalId} robotActive={robotActive} setRobotActive={setRobotActive} />
        </ThreeErrorBoundary>

        {/* 3D Quantum Innovation Hub */}
        <ThreeErrorBoundary name="Quantum Hub" position={[0, 0, -190]}>
          <QuantumHub scrollProgress={scrollProgress} activeIslandId={activeIslandId} setActiveIslandId={setActiveIslandId} />
        </ThreeErrorBoundary>

        {/* 3D Innovation Gallery */}
        <ThreeErrorBoundary name="Innovation Gallery" position={[0, 0, -260]}>
          <InnovationGallery scrollProgress={scrollProgress} activeCubeId={activeCubeId} setActiveCubeId={setActiveCubeId} />
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

      {/* Background starfield and nebula */}
      <Starfield scrollProgress={scrollProgress} />
      <Nebula scrollProgress={scrollProgress} />
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
  isTransitionActive = false
}) => {
  const isModalOpen = activeCubeId !== null || activeIslandId !== null || activeNodeId !== null || activeTerminalId !== null || robotActive;
  const shouldBlur = isModalOpen || isTransitionActive;

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
          isTransitionActive={isTransitionActive}
        />
      </Canvas>
    </div>
  );
};

export default Scene;
