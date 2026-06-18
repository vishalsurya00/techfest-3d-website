import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Starfield from './Starfield';
import Nebula from './Nebula';
import Earth from './Earth';
import Spaceship from './Spaceship';

// Inner component to access R3F hooks (useFrame, useThree)
const SceneContent = ({ scrollProgress = 0 }) => {
  const { camera } = useThree();
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
    // 1. Calculate camera zoom based on scroll progress
    // At scroll=0, z=5.8. As user scrolls, z zooms forward to 3.2
    const targetZ = THREE.MathUtils.lerp(5.8, 3.2, scrollProgress);

    // 2. Mouse Parallax (interpolate camera position for 60fps cinematic damping)
    const targetCamX = mouse.x * 1.5;
    const targetCamY = -mouse.y * 1.5;

    camera.position.x += (targetCamX - camera.position.x) * 0.04;
    camera.position.y += (targetCamY - camera.position.y) * 0.04;
    camera.position.z += (targetZ - camera.position.z) * 0.04;

    // 3. Look-at tilt (camera tilts slightly towards the center of orbit/Earth group)
    camera.rotation.y = -camera.position.x * 0.08;
    camera.rotation.x = camera.position.y * 0.08;
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

      {/* Rim fill light (Neon Purple) on the opposite side */}
      <directionalLight
        position={[-6, -3, -5]}
        color="#bd00ff"
        intensity={3.2}
      />

      {/* Earth Group (contains Earth model and the orbiting spaceship) */}
      <group>
        <Earth scrollProgress={scrollProgress} />
        <Spaceship scrollProgress={scrollProgress} />
      </group>

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
          // Subtle foggy space depth
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
