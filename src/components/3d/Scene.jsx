import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Starfield from './Starfield';
import Nebula from './Nebula';
import Earth from './Earth';
import Spaceship from './Spaceship';
import HyperspaceTunnel from './HyperspaceTunnel';
import AICity from './AICity';

// Inner component to access R3F hooks (useFrame, useThree)
const SceneContent = ({ scrollProgress = 0 }) => {
  const { camera, scene } = useThree();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

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

    // 1. Camera Positions & Targets interpolation across scroll timeline
    let targetCamPos = new THREE.Vector3();
    let targetLookAt = new THREE.Vector3();
    let shakeIntensity = 0;

    // Define color variables for fog interpolation
    const spaceColor = new THREE.Color('#05020a');
    const tunnelColor = new THREE.Color('#100525');
    const cityColor = new THREE.Color('#080417');

    let currentFogColor = new THREE.Color();
    let currentFogDensity = 0.0018;

    if (scrollProgress < 0.2) {
      // Phase 1: Earth Orbit
      // Camera is close, viewing Earth on the left
      const t = THREE.MathUtils.smoothstep(scrollProgress, 0.0, 0.2);
      const z = THREE.MathUtils.lerp(5.8, 5.0, t);
      
      targetCamPos.set(0, 0, z);
      targetLookAt.set(0, 0, -5.0); // Facing straight

      currentFogColor.copy(spaceColor);
      currentFogDensity = 0.0018;
    } else if (scrollProgress >= 0.2 && scrollProgress < 0.6) {
      // Phase 2: Hyperspace Warp Jump
      const t = THREE.MathUtils.smoothstep(scrollProgress, 0.2, 0.6);
      
      // Camera flies rapidly forward into the tunnel (z drops from 5.0 to 1.5)
      const z = THREE.MathUtils.lerp(5.0, 1.5, t);
      targetCamPos.set(0, 0, z);
      targetLookAt.set(0, 0, -5.0); // Pointing forward

      // Compute screen shake (bell-curve peaking in the middle of acceleration)
      shakeIntensity = Math.sin(t * Math.PI) * 0.09;

      // Blend fog to deep tunnel violet
      currentFogColor.lerpColors(spaceColor, tunnelColor, t);
      currentFogDensity = THREE.MathUtils.lerp(0.0018, 0.006, t);
    } else {
      // Phase 3: AI City Arrival
      const t = THREE.MathUtils.smoothstep(scrollProgress, 0.6, 1.0);
      
      // Camera exits the tunnel, rises up, and angles down to overlook the city
      // final camera overlooks the city at [0, 4.5, -30] looking towards [0, -9.0, -60.0]
      const startX = 0;
      const targetX = 0;
      const startY = 0;
      const targetY = 5.2; // Elevate camera view
      const startZ = 1.5;
      const targetZ = -34.0; // Fly close to city edge

      const x = THREE.MathUtils.lerp(startX, targetX, t);
      const y = THREE.MathUtils.lerp(startY, targetY, t);
      const z = THREE.MathUtils.lerp(startZ, targetZ, t);

      targetCamPos.set(x, y, z);
      
      // Blend camera look-at from forward vector to looking down at city core
      const startLook = new THREE.Vector3(0, 0, -40);
      const targetLook = new THREE.Vector3(0, -9.0, -60.0);
      targetLookAt.lerpVectors(startLook, targetLook, t);

      // Blend fog to city volumetric indigo
      currentFogColor.lerpColors(tunnelColor, cityColor, t);
      currentFogDensity = THREE.MathUtils.lerp(0.006, 0.012, t); // Volumetric density
    }

    // 2. Apply Camera Position Parallax (Cinematic mouse drift)
    // Reduce parallax slightly during warp shake to avoid vector conflicts
    const parallaxFactor = scrollProgress >= 0.2 && scrollProgress < 0.6 ? 0.3 : 1.0;
    const targetCamX = mouse.x * 1.5 * parallaxFactor;
    const targetCamY = -mouse.y * 1.5 * parallaxFactor;

    camera.position.x += (targetCamPos.x + targetCamX - camera.position.x) * 0.04;
    camera.position.y += (targetCamPos.y + targetCamY - camera.position.y) * 0.04;
    camera.position.z += (targetCamPos.z - camera.position.z) * 0.04;

    // 3. Screen Shake (add high-frequency noise offset to camera coords)
    if (shakeIntensity > 0) {
      camera.position.x += (Math.random() - 0.5) * shakeIntensity;
      camera.position.y += (Math.random() - 0.5) * shakeIntensity;
      camera.position.z += (Math.random() - 0.5) * shakeIntensity * 0.5;
    }

    // 4. Orient camera to look at interpolated target path
    const currentLookAt = new THREE.Vector3(0, 0, -100);
    // Smoothly lerp look-at vectors
    currentLookAt.copy(targetLookAt);
    
    // Add minor tilt rotation based on mouse parallax coordinates
    camera.lookAt(currentLookAt);
    camera.rotation.y += -mouse.x * 0.08 * parallaxFactor;
    camera.rotation.x += mouse.y * 0.08 * parallaxFactor;

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

      {/* Earth Group (contains Earth mesh and the spaceship) */}
      <group>
        <Earth scrollProgress={scrollProgress} />
        <Spaceship scrollProgress={scrollProgress} />
      </group>

      {/* 3D Hyperspace Tunnel Overlay */}
      <HyperspaceTunnel scrollProgress={scrollProgress} />

      {/* 3D Floating AI City metropolis */}
      <AICity scrollProgress={scrollProgress} />

      {/* Background starfield and gaseous nebula layers */}
      <Starfield scrollProgress={scrollProgress} />
      <Nebula scrollProgress={scrollProgress} />
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
