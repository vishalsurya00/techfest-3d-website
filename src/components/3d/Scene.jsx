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
  onWarning
}) => {
  const { camera, scene } = useThree();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  // Define progress variables in outer scope to resolve ReferenceErrors in JSX
  const heroProgress = Math.min(1, Math.max(0, scrollProgress * 6.0));
  const cityProgress = Math.min(1, Math.max(0, (scrollProgress - 0.1667) * 6.0));
  const labProgress = Math.min(1, Math.max(0, (scrollProgress - 0.3333) * 6.0));

  // Custom clock tracking local time progression (pauses when modal is active)
  const timeRef = useRef(0);

  // Smooth scroll tracking to slow down all scroll-driven camera transitions
  const smoothScroll = useRef(scrollProgress);

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
    const p = smoothScroll.current;
    const cityProgress = Math.min(1, Math.max(0, (p - 0.1667) * 6.0));
    const labProgress = Math.min(1, Math.max(0, (p - 0.3333) * 6.0));

    if (!isCameraAnimDisabled) {
      // 0.5. Smooth scroll progress (slowing transitions by 40%)
      const scrollTrackingSpeed = 1.6; 
      smoothScroll.current = THREE.MathUtils.lerp(
        smoothScroll.current,
        scrollProgress,
        1 - Math.exp(-scrollTrackingSpeed * delta)
      );
      const pCurrent = smoothScroll.current;

      // 1. Camera Positions & Targets — five-phase scroll timeline
      let scrollCamPos = new THREE.Vector3();
      let scrollLookAt = new THREE.Vector3();
      let shakeIntensity = 0;

      // Fog color anchors
      const spaceColor = new THREE.Color('#05020a');
      const portalColor = new THREE.Color('#09041a');
      const cityFogColor = new THREE.Color('#0a0520');
      const labFogColor = new THREE.Color('#080b18');
      const hubFogColor = new THREE.Color('#030107');
      const galleryFogColor = new THREE.Color('#040212');

      let currentFogColor = new THREE.Color();
      let currentFogDensity = 0.0018;

      if (pCurrent <= 0.1667) {
        // ---- PHASE 1: Space Gateway (Hero) ----
        const t = THREE.MathUtils.smoothstep(pCurrent, 0.0, 0.1667);
        const z = THREE.MathUtils.lerp(5.8, 1.2, t);
        scrollCamPos.set(0, 0, z);
        scrollLookAt.set(0, 0, -6.0);

        const shakeP = THREE.MathUtils.smoothstep(pCurrent, 0.03, 0.15);
        shakeIntensity = Math.sin(shakeP * Math.PI) * 0.022;

        currentFogColor.lerpColors(spaceColor, portalColor, t);
        currentFogDensity = THREE.MathUtils.lerp(0.0018, 0.005, t);

      } else if (pCurrent > 0.1667 && pCurrent <= 0.3333) {
        // ---- PHASE 2: AI City ----
        const t = THREE.MathUtils.smoothstep(pCurrent, 0.1667, 0.3333);
        const z = THREE.MathUtils.lerp(1.2, -38.0, t);
        const y = THREE.MathUtils.lerp(0, 8.0, t);
        scrollCamPos.set(0, y, z);

        const lookY = THREE.MathUtils.lerp(0, -3.0, t);
        const lookZ = THREE.MathUtils.lerp(-6.0, -60.0, t);
        scrollLookAt.set(0, lookY, lookZ);

        const shakeP2 = THREE.MathUtils.smoothstep(pCurrent, 0.1667, 0.24);
        shakeIntensity = Math.sin(shakeP2 * Math.PI) * 0.015;

        currentFogColor.lerpColors(portalColor, cityFogColor, t);
        currentFogDensity = THREE.MathUtils.lerp(0.005, 0.008, t);

      } else if (pCurrent > 0.3333 && pCurrent <= 0.50) {
        // ---- PHASE 3: Robotics Lab ----
        const t = THREE.MathUtils.smoothstep(pCurrent, 0.3333, 0.50);
        const z = THREE.MathUtils.lerp(-38.0, -112.5, t);
        const y = THREE.MathUtils.lerp(8.0, -1.5, t);
        scrollCamPos.set(0, y, z);

        const lookY = THREE.MathUtils.lerp(-3.0, -1.8, t);
        const lookZ = THREE.MathUtils.lerp(-60.0, -120.0, t);
        scrollLookAt.set(0, lookY, lookZ);

        const shakeP3 = THREE.MathUtils.smoothstep(pCurrent, 0.3333, 0.42);
        shakeIntensity = Math.sin(shakeP3 * Math.PI) * 0.01;

        currentFogColor.lerpColors(cityFogColor, labFogColor, t);
        currentFogDensity = THREE.MathUtils.lerp(0.008, 0.011, t);

      } else if (pCurrent > 0.50 && pCurrent <= 0.6667) {
        // ---- PHASE 4: Quantum Hub ----
        const t = THREE.MathUtils.smoothstep(pCurrent, 0.50, 0.6667);
        const z = THREE.MathUtils.lerp(-112.5, -177.0, t);
        const y = THREE.MathUtils.lerp(-1.5, 3.5, t);
        scrollCamPos.set(0, y, z);

        const lookY = THREE.MathUtils.lerp(-1.8, 0.0, t);
        const lookZ = THREE.MathUtils.lerp(-120.0, -190.0, t);
        scrollLookAt.set(0, lookY, lookZ);

        currentFogColor.lerpColors(labFogColor, hubFogColor, t);
        currentFogDensity = THREE.MathUtils.lerp(0.011, 0.008, t);

      } else if (pCurrent > 0.6667 && pCurrent <= 0.8333) {
        // ---- PHASE 5: Innovation Gallery ----
        const t = THREE.MathUtils.smoothstep(pCurrent, 0.6667, 0.8333);
        const z = THREE.MathUtils.lerp(-177.0, -248.0, t);
        const y = THREE.MathUtils.lerp(3.5, 4.0, t);
        scrollCamPos.set(0, y, z);

        const lookY = THREE.MathUtils.lerp(0.0, -0.5, t);
        const lookZ = THREE.MathUtils.lerp(-190.0, -260.0, t);
        scrollLookAt.set(0, lookY, lookZ);

        currentFogColor.lerpColors(hubFogColor, galleryFogColor, t);
        currentFogDensity = THREE.MathUtils.lerp(0.008, 0.006, t);

      } else {
        // ---- PHASE 6: Final Portal ----
        const t = THREE.MathUtils.smoothstep(pCurrent, 0.8333, 1.0);
        const z = THREE.MathUtils.lerp(-248.0, -315.0, t);
        const y = THREE.MathUtils.lerp(4.0, 1.5, t);
        scrollCamPos.set(0, y, z);

        const lookY = THREE.MathUtils.lerp(-0.5, 0.0, t);
        const lookZ = THREE.MathUtils.lerp(-260.0, -325.0, t);
        scrollLookAt.set(0, lookY, lookZ);

        currentFogColor.lerpColors(galleryFogColor, portalColor, t);
        currentFogDensity = THREE.MathUtils.lerp(0.006, 0.004, t);
      }

      // 1.5. Calculate Zoom Camera Position and Target if selected
      let zoomCamPos = new THREE.Vector3();
      let zoomLookAt = new THREE.Vector3();

      if (activeIslandId !== null) {
        const orbitRadius = 9.0;
        const angle = (activeIslandId * Math.PI * 2) / 5 + time * 0.12;
        const islandX = Math.cos(angle) * orbitRadius;
        const islandZ = -190 + Math.sin(angle) * orbitRadius;
        const islandY = -1.0 + Math.sin(time * 1.5 + activeIslandId) * 0.35 + 0.4;

        zoomCamPos.set(islandX * 0.58, islandY + 1.0, islandZ + 4.2);
        zoomLookAt.set(islandX, islandY, islandZ);
      } else if (activeCubeId !== null) {
        const orbitRadius = 8.0;
        const angle = (activeCubeId / 8) * Math.PI * 2;
        const cubeX = Math.cos(angle) * orbitRadius;
        const cubeZ = -260 + Math.sin(angle) * orbitRadius;
        const cubeY = Math.sin(time * 1.0 + activeCubeId * 0.8) * 0.18;

        zoomCamPos.set(cubeX * 0.62, cubeY + 1.2, cubeZ + 4.0);
        zoomLookAt.set(cubeX, cubeY, cubeZ);
      } else if (activeNodeId !== null) {
        zoomCamPos.set(0, -4.5 + 2.0, -60 + 9.0);
        zoomLookAt.set(0, -4.5, -60);
      } else if (activeTerminalId !== null) {
        if (activeTerminalId === 0) {
          zoomCamPos.set(-3.6, -3.4 + 1.2, -116.5 + 4.0);
          zoomLookAt.set(-3.6, -3.4, -116.5);
        } else if (activeTerminalId === 1) {
          zoomCamPos.set(0, -3.4 + 1.2, -115.0 + 4.0);
          zoomLookAt.set(0, -3.4, -115.0);
        } else if (activeTerminalId === 2) {
          zoomCamPos.set(3.6, -3.4 + 1.2, -116.5 + 4.0);
          zoomLookAt.set(3.6, -3.4, -116.5);
        }
      } else if (robotActive) {
        zoomCamPos.set(0, -1.8 + 1.5, -120 + 4.8);
        zoomLookAt.set(0, -1.8 + 0.5, -120);
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

      // 3. Screen Shake
      if (shakeIntensity > 0) {
        camera.position.x += (Math.random() - 0.5) * shakeIntensity;
        camera.position.y += (Math.random() - 0.5) * shakeIntensity;
        camera.position.z += (Math.random() - 0.5) * shakeIntensity * 0.5;
      }

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

      if (scene.fog) {
        scene.fog.color.copy(currentFogColor);
        scene.fog.density = currentFogDensity;
      }
    } else {
      // If camera animations are disabled, ensure the camera looks at the current look-at target
      const targetLook = currentLookAt.current ? currentLookAt.current : new THREE.Vector3(0, 0, 0);
      if (isNaN(targetLook.x) || isNaN(targetLook.y) || isNaN(targetLook.z)) {
        targetLook.set(0, 0, 0);
      }
      camera.lookAt(targetLook);
    }

    const camPosEl = document.getElementById('debug-cam-pos');
    if (camPosEl) {
      camPosEl.textContent = `X: ${camera.position.x.toFixed(2)}, Y: ${camera.position.y.toFixed(2)}, Z: ${camera.position.z.toFixed(2)}`;
    }
  });

  return (
    <>
      <ambientLight color="#120626" intensity={isDiagLightsEnabled ? 3.0 : 1.8} />
      
      {/* Bright solar light (Electric Blue) */}
      <directionalLight
        position={[6, 3, 5]}
        color="#00f0ff"
        intensity={5.0}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Rim fill light (Neon Purple) */}
      <directionalLight
        position={[-6, -3, -5]}
        color="#bd00ff"
        intensity={isDiagLightsEnabled ? 5.0 : 3.2}
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
        <Portal scrollProgress={scrollProgress} position={[0, 0, -6.0]} isFinal={false} onLoad={onLoad} onWarning={onWarning} />
      </ThreeErrorBoundary>

      {/* 3D Glowing Portal — second/final portal at Z = -320 */}
      <ThreeErrorBoundary name="Portal 2" onCrash={onCrash} position={[0, 0, -320.0]}>
        <Portal scrollProgress={scrollProgress} position={[0, 0, -320.0]} isFinal={true} onLoad={onLoad} onWarning={onWarning} />
      </ThreeErrorBoundary>

      {/* 3D AI City — uses raw scrollProgress for opacity timing */}
      <ThreeErrorBoundary name="AI City" onCrash={onCrash} position={[0, -4.5, -60]}>
        <AICity scrollProgress={scrollProgress} activeNodeId={activeNodeId} setActiveNodeId={setActiveNodeId} onLoad={onLoad} onWarning={onWarning} />
      </ThreeErrorBoundary>

      {/* 3D Robotics Lab — uses raw scrollProgress for transition/fading */}
      <ThreeErrorBoundary name="Robotics Lab" onCrash={onCrash} position={[0, -4.8, -120]}>
        <RoboticsLab scrollProgress={scrollProgress} activeTerminalId={activeTerminalId} setActiveTerminalId={setActiveTerminalId} robotActive={robotActive} setRobotActive={setRobotActive} onLoad={onLoad} onWarning={onWarning} />
      </ThreeErrorBoundary>

      {/* 3D Quantum Innovation Hub — uses raw scrollProgress for fading */}
      <ThreeErrorBoundary name="Quantum Hub" onCrash={onCrash} position={[0, 0, -190]}>
        <QuantumHub scrollProgress={scrollProgress} activeIslandId={activeIslandId} setActiveIslandId={setActiveIslandId} onLoad={onLoad} onWarning={onWarning} />
      </ThreeErrorBoundary>

      {/* 3D Innovation Gallery — uses raw scrollProgress for fading */}
      <ThreeErrorBoundary name="Innovation Gallery" onCrash={onCrash} position={[0, 0, -260]}>
        <InnovationGallery scrollProgress={scrollProgress} activeCubeId={activeCubeId} setActiveCubeId={setActiveCubeId} onLoad={onLoad} onWarning={onWarning} />
      </ThreeErrorBoundary>

      {/* Background starfield and nebula — uses raw scrollProgress, computes heroPhase internally */}
      <Starfield scrollProgress={scrollProgress} />
      <Nebula scrollProgress={scrollProgress} />

      {/* City overhead ambient light — fades in during city phase, fades out in lab phase */}
      <pointLight
        position={[0, 15, -60]}
        color="#00f0ff"
        intensity={cityProgress * (1.0 - labProgress) * 8}
        distance={80}
        decay={2}
      />
      <pointLight
        position={[0, -5, -60]}
        color="#bd00ff"
        intensity={cityProgress * (1.0 - labProgress) * 4}
        distance={60}
        decay={2}
      />
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
  onWarning
}) => {
  const isModalOpen = activeCubeId !== null || activeIslandId !== null || activeNodeId !== null || activeTerminalId !== null || robotActive;

  useEffect(() => {
    console.log("Scene Mounted");
    if (onSceneMount) onSceneMount();
  }, [onSceneMount]);

  return (
    <div className={`webgl-canvas ${isModalOpen ? 'gallery-blur scene-interactions-disabled' : ''}`}>
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
        />
      </Canvas>
    </div>
  );
};

export default Scene;
