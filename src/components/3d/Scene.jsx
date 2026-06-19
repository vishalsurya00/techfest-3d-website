import React, { useEffect, useState } from 'react';
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

// Inner component to access R3F hooks (useFrame, useThree)
const SceneContent = ({ scrollProgress = 0, activeIslandId = null, setActiveIslandId, activeCubeId = null, setActiveCubeId }) => {
  const { camera, scene } = useThree();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  // Derive per-section progress for sub-components (5 sections now)
  const heroProgress = Math.min(1, Math.max(0, scrollProgress * 5.0));
  const cityProgress = Math.min(1, Math.max(0, (scrollProgress - 0.20) * 5.0));
  const labProgress = Math.min(1, Math.max(0, (scrollProgress - 0.40) * 5.0));
  const hubProgress = Math.min(1, Math.max(0, (scrollProgress - 0.60) * 5.0));
  const galleryProgress = Math.min(1, Math.max(0, (scrollProgress - 0.80) * 5.0));

  // Handle mouse movement for parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalize to range -0.5 to 0.5
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      setMouse({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // 1. Camera Positions & Targets — five-phase scroll timeline
    let targetCamPos = new THREE.Vector3();
    let targetLookAt = new THREE.Vector3();
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

    if (scrollProgress <= 0.20) {
      // ---- PHASE 1: Hero → Portal (scrollProgress 0.0 to 0.20) ----
      const t = THREE.MathUtils.smoothstep(scrollProgress, 0.0, 0.20);

      const z = THREE.MathUtils.lerp(5.8, 1.2, t);
      targetCamPos.set(0, 0, z);
      targetLookAt.set(0, 0, -6.0);

      const shakeP = THREE.MathUtils.smoothstep(scrollProgress, 0.04, 0.18);
      shakeIntensity = Math.sin(shakeP * Math.PI) * 0.022;

      currentFogColor.lerpColors(spaceColor, portalColor, t);
      currentFogDensity = THREE.MathUtils.lerp(0.0018, 0.005, t);

    } else if (scrollProgress > 0.20 && scrollProgress <= 0.40) {
      // ---- PHASE 2: Portal → AI City (scrollProgress 0.20 to 0.40) ----
      const t = THREE.MathUtils.smoothstep(scrollProgress, 0.20, 0.40);

      const z = THREE.MathUtils.lerp(1.2, -38, t);
      const y = THREE.MathUtils.lerp(0, 8, t);
      targetCamPos.set(0, y, z);

      const lookY = THREE.MathUtils.lerp(0, -3, t);
      const lookZ = THREE.MathUtils.lerp(-6.0, -60, t);
      targetLookAt.set(0, lookY, lookZ);

      const shakeP2 = THREE.MathUtils.smoothstep(scrollProgress, 0.20, 0.28);
      shakeIntensity = Math.sin(shakeP2 * Math.PI) * 0.015;

      currentFogColor.lerpColors(portalColor, cityFogColor, t);
      currentFogDensity = THREE.MathUtils.lerp(0.005, 0.008, t);

    } else if (scrollProgress > 0.40 && scrollProgress <= 0.60) {
      // ---- PHASE 3: AI City → Robotics Lab (scrollProgress 0.40 to 0.60) ----
      const t = THREE.MathUtils.smoothstep(scrollProgress, 0.40, 0.60);

      const z = THREE.MathUtils.lerp(-38, -112.5, t);
      const y = THREE.MathUtils.lerp(8, -1.5, t);
      targetCamPos.set(0, y, z);

      const lookY = THREE.MathUtils.lerp(-3, -1.8, t);
      const lookZ = THREE.MathUtils.lerp(-60, -120, t);
      targetLookAt.set(0, lookY, lookZ);

      const shakeP3 = THREE.MathUtils.smoothstep(scrollProgress, 0.40, 0.50);
      shakeIntensity = Math.sin(shakeP3 * Math.PI) * 0.01;

      currentFogColor.lerpColors(cityFogColor, labFogColor, t);
      currentFogDensity = THREE.MathUtils.lerp(0.008, 0.011, t);

    } else if (scrollProgress > 0.60 && scrollProgress <= 0.80) {
      // ---- PHASE 4: Robotics Lab → Quantum Hub (scrollProgress 0.60 to 0.80) ----
      const t = THREE.MathUtils.smoothstep(scrollProgress, 0.60, 0.80);

      const z = THREE.MathUtils.lerp(-112.5, -177.0, t);
      const y = THREE.MathUtils.lerp(-1.5, 3.5, t);
      targetCamPos.set(0, y, z);

      const lookY = THREE.MathUtils.lerp(-1.8, 0.0, t);
      const lookZ = THREE.MathUtils.lerp(-120, -190, t);
      targetLookAt.set(0, lookY, lookZ);

      currentFogColor.lerpColors(labFogColor, hubFogColor, t);
      currentFogDensity = THREE.MathUtils.lerp(0.011, 0.008, t);

      // Cinematic Island Zoom override in Phase 4
      if (activeIslandId !== null && t > 0.8) {
        const angle = (activeIslandId * Math.PI * 2) / 5 + time * 0.12;
        const islandX = Math.cos(angle) * 6.5;
        const islandZ = -190 + Math.sin(angle) * 6.5;
        const islandY = -1.0 + Math.sin(time * 1.5 + activeIslandId) * 0.35 + 0.4;

        targetCamPos.set(islandX * 0.62, islandY + 1.2, islandZ + 4.6);
        targetLookAt.set(islandX, islandY, islandZ);
      }

    } else {
      // ---- PHASE 5: Quantum Hub → Innovation Gallery (scrollProgress 0.80 to 1.0) ----
      const t = THREE.MathUtils.smoothstep(scrollProgress, 0.80, 1.0);

      const z = THREE.MathUtils.lerp(-177.0, -248.0, t);
      const y = THREE.MathUtils.lerp(3.5, 4.0, t);
      targetCamPos.set(0, y, z);

      const lookY = THREE.MathUtils.lerp(0.0, -0.5, t);
      const lookZ = THREE.MathUtils.lerp(-190, -260, t);
      targetLookAt.set(0, lookY, lookZ);

      currentFogColor.lerpColors(hubFogColor, galleryFogColor, t);
      currentFogDensity = THREE.MathUtils.lerp(0.008, 0.006, t);

      // Cinematic Cube Zoom override in Phase 5
      if (activeCubeId !== null && t > 0.8) {
        // Cubes are at position [0, 0, -260] + individual position
        targetCamPos.set(0, 4.5, -255);
        targetLookAt.set(0, -0.5, -260);
      }
    }

    // 2. Apply Camera Position with Parallax (Cinematic mouse drift)
    const targetCamX = mouse.x * 1.5;
    const targetCamY = -mouse.y * 1.5;

    camera.position.x += (targetCamPos.x + targetCamX - camera.position.x) * 0.04;
    camera.position.y += (targetCamPos.y + targetCamY - camera.position.y) * 0.04;
    camera.position.z += (targetCamPos.z - camera.position.z) * 0.04;

    // 3. Screen Shake (add high-frequency noise offset to camera coords)
    if (shakeIntensity > 0) {
      camera.position.x += (Math.random() - 0.5) * shakeIntensity;
      camera.position.y += (Math.random() - 0.5) * shakeIntensity;
      camera.position.z += (Math.random() - 0.5) * shakeIntensity * 0.5;
    }

    // 4. Orient camera to look at target with mouse parallax tilt
    const tiltedLookAt = new THREE.Vector3().copy(targetLookAt);
    tiltedLookAt.x += mouse.x * 1.2;
    tiltedLookAt.y -= mouse.y * 1.2;
    camera.lookAt(tiltedLookAt);

    // 5. Update volumetric fog settings dynamically
    if (scene.fog) {
      scene.fog.color.copy(currentFogColor);
      scene.fog.density = currentFogDensity;
    }
  });

  return (
    <>
      {/* Sci-Fi Lighting System */}
      <ambientLight color="#120626" intensity={1.8} />
      
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
        intensity={3.2}
      />

      {/* Earth Group (contains Earth mesh and the spaceship) — uses heroProgress */}
      <group>
        <Earth scrollProgress={heroProgress} />
        <Spaceship scrollProgress={heroProgress} />
      </group>

      {/* 3D Glowing Portal — uses raw scrollProgress for appear + fade-out */}
      <Portal scrollProgress={scrollProgress} />

      {/* 3D AI City — uses raw scrollProgress for opacity timing */}
      <AICity scrollProgress={scrollProgress} />

      {/* 3D Robotics Lab — uses raw scrollProgress for transition/fading */}
      <RoboticsLab scrollProgress={scrollProgress} />

      {/* 3D Quantum Innovation Hub — uses raw scrollProgress for fading */}
      <QuantumHub scrollProgress={scrollProgress} activeIslandId={activeIslandId} setActiveIslandId={setActiveIslandId} />

      {/* 3D Innovation Gallery — uses raw scrollProgress for fading */}
      <InnovationGallery scrollProgress={scrollProgress} activeCubeId={activeCubeId} setActiveCubeId={setActiveCubeId} />

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

const Scene = ({ scrollProgress = 0, activeIslandId = null, setActiveIslandId, activeCubeId = null, setActiveCubeId }) => {
  return (
    <div className={`webgl-canvas ${activeCubeId !== null ? 'gallery-blur' : ''}`}>
      <Canvas
        camera={{ position: [0, 0, 5.8], fov: 45, near: 0.1, far: 2000 }}
        shadows
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl, scene }) => {
          scene.fog = new THREE.FogExp2('#05020a', 0.0018);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.1;
        }}
      >
        <SceneContent scrollProgress={scrollProgress} activeIslandId={activeIslandId} setActiveIslandId={setActiveIslandId} activeCubeId={activeCubeId} setActiveCubeId={setActiveCubeId} />
      </Canvas>
    </div>
  );
};

export default Scene;
