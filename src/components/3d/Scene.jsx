import React, { useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Starfield from './Starfield';
import Nebula from './Nebula';
import Earth from './Earth';
import Spaceship from './Spaceship';
import Portal from './Portal';
import AICity from './AICity';

// Inner component to access R3F hooks (useFrame, useThree)
const SceneContent = ({ scrollProgress = 0 }) => {
  const { camera, scene } = useThree();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  // Derive per-section progress for sub-components
  const heroProgress = Math.min(1, Math.max(0, scrollProgress * 2));
  const cityProgress = Math.min(1, Math.max(0, (scrollProgress - 0.5) * 2));

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

    // 1. Camera Positions & Targets — two-phase scroll timeline
    let targetCamPos = new THREE.Vector3();
    let targetLookAt = new THREE.Vector3();
    let shakeIntensity = 0;

    // Fog color anchors
    const spaceColor = new THREE.Color('#05020a');
    const portalColor = new THREE.Color('#09041a');
    const cityFogColor = new THREE.Color('#0a0520');

    let currentFogColor = new THREE.Color();
    let currentFogDensity = 0.0018;

    if (scrollProgress <= 0.5) {
      // ---- PHASE 1: Hero → Portal (scrollProgress 0.0 to 0.5) ----
      const t = THREE.MathUtils.smoothstep(scrollProgress, 0.0, 0.5);

      // Camera moves forward from z=5.8 to z=1.2 (in front of portal at z=-6.0)
      const z = THREE.MathUtils.lerp(5.8, 1.2, t);
      targetCamPos.set(0, 0, z);
      targetLookAt.set(0, 0, -6.0);

      // Screen shake: bell-curve peaking during warp
      const shakeP = THREE.MathUtils.smoothstep(scrollProgress, 0.1, 0.42);
      shakeIntensity = Math.sin(shakeP * Math.PI) * 0.022;

      // Fog: space → portal atmosphere
      currentFogColor.lerpColors(spaceColor, portalColor, t);
      currentFogDensity = THREE.MathUtils.lerp(0.0018, 0.005, t);

    } else {
      // ---- PHASE 2: Portal → AI City (scrollProgress 0.5 to 1.0) ----
      const t = THREE.MathUtils.smoothstep(scrollProgress, 0.5, 1.0);

      // Camera flies through portal and rises to overlook the city
      const z = THREE.MathUtils.lerp(1.2, -38, t);
      const y = THREE.MathUtils.lerp(0, 8, t);
      targetCamPos.set(0, y, z);

      // Look target smoothly shifts from portal center to city center
      const lookY = THREE.MathUtils.lerp(0, -3, t);
      const lookZ = THREE.MathUtils.lerp(-6.0, -60, t);
      targetLookAt.set(0, lookY, lookZ);

      // Mild shake at the beginning of phase 2 (flying through portal)
      const shakeP2 = THREE.MathUtils.smoothstep(scrollProgress, 0.5, 0.62);
      shakeIntensity = Math.sin(shakeP2 * Math.PI) * 0.015;

      // Fog: portal → city atmosphere
      currentFogColor.lerpColors(portalColor, cityFogColor, t);
      currentFogDensity = THREE.MathUtils.lerp(0.005, 0.008, t);
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

      {/* Background starfield and nebula — uses raw scrollProgress, computes heroPhase internally */}
      <Starfield scrollProgress={scrollProgress} />
      <Nebula scrollProgress={scrollProgress} />

      {/* City overhead ambient light — fades in during city phase */}
      <pointLight
        position={[0, 15, -60]}
        color="#00f0ff"
        intensity={cityProgress * 8}
        distance={80}
        decay={2}
      />
      <pointLight
        position={[0, -5, -60]}
        color="#bd00ff"
        intensity={cityProgress * 4}
        distance={60}
        decay={2}
      />
    </>
  );
};

const Scene = ({ scrollProgress = 0 }) => {
  return (
    <div className="webgl-canvas">
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
        <SceneContent scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
};

export default Scene;
