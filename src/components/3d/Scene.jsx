import React, { useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Starfield from './Starfield';
import Nebula from './Nebula';
import Earth from './Earth';
import Spaceship from './Spaceship';
import Portal from './Portal';

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

    // 1. Camera Positions & Targets interpolation across scroll timeline (0.0 to 1.0)
    let targetCamPos = new THREE.Vector3();
    let targetLookAt = new THREE.Vector3();
    let shakeIntensity = 0;

    // Define color variables for fog interpolation
    const spaceColor = new THREE.Color('#05020a');
    const portalColor = new THREE.Color('#09041a');

    let currentFogColor = new THREE.Color();
    let currentFogDensity = 0.0018;

    // Smoothed transition progress
    const t = THREE.MathUtils.smoothstep(scrollProgress, 0.0, 1.0);

    // Camera moves forward from z=5.8 to z=1.2 (in front of portal at z=-6.0)
    const z = THREE.MathUtils.lerp(5.8, 1.2, t);
    targetCamPos.set(0, 0, z);
    
    // Camera is looking straight forward towards the portal center at [0, 0, -6.0]
    targetLookAt.set(0, 0, -6.0);

    // Compute screen shake (bell-curve peaking around the middle warp, scrollProgress 0.2 to 0.8)
    const shakeProgress = THREE.MathUtils.smoothstep(scrollProgress, 0.2, 0.85);
    shakeIntensity = Math.sin(shakeProgress * Math.PI) * 0.022;

    // Blend fog color and density as we approach the portal
    currentFogColor.lerpColors(spaceColor, portalColor, t);
    currentFogDensity = THREE.MathUtils.lerp(0.0018, 0.005, t);

    // 2. Apply Camera Position Parallax (Cinematic mouse drift)
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

    // 4. Orient camera to look at portal
    // Add mouse parallax offset to the lookAt target to tilt the camera dynamically
    // rather than modifying camera.rotation directly (which can desynchronize quaternion/matrix and cause NaNs)
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

      {/* Earth Group (contains Earth mesh and the spaceship) */}
      <group>
        <Earth scrollProgress={scrollProgress} />
        <Spaceship scrollProgress={scrollProgress} />
      </group>

      {/* 3D Glowing Portal (positioned at [0, 0, -6.0]) */}
      <Portal scrollProgress={scrollProgress} />

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
