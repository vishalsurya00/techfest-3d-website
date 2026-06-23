import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import TechCube from './TechCube';
import { cubes } from '../../data/universeData';

// Floating particles + light streaks
const GalleryParticles = ({ count = 1800, opacity = 1.0, isPaused = false }) => {
  const pointsRef = useRef();
  const timeRef = useRef(0);

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 2.0 + Math.random() * 14.0;
      const height = (Math.random() - 0.5) * 8.0;

      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = height;
      pos[i * 3 + 2] = Math.sin(angle) * r;
      sz[i] = 0.03 + Math.random() * 0.06;
    }
    return [pos, sz];
  }, [count]);

  useFrame((state, delta) => {
    if (!isPaused) {
      timeRef.current += delta;
    }
    const time = timeRef.current;
    if (pointsRef.current) {
      pointsRef.current.rotation.y = time * 0.03;
      pointsRef.current.rotation.x = Math.sin(time * 0.1) * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#a0c8ff"
        transparent
        opacity={0.35 * opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// Light streaks — thin rotating line segments
const LightStreaks = ({ count = 12, opacity = 1.0, isPaused = false }) => {
  const groupRef = useRef();
  const timeRef = useRef(0);

  const streaks = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = 5 + Math.random() * 8;
      arr.push({
        x: Math.cos(angle) * r,
        z: Math.sin(angle) * r,
        y: (Math.random() - 0.5) * 4,
        length: 1.5 + Math.random() * 3,
        speed: 0.3 + Math.random() * 0.5,
        color: ['#00f0ff', '#bd00ff', '#00e0c0'][i % 3],
      });
    }
    return arr;
  }, [count]);

  useFrame((state, delta) => {
    if (!isPaused) {
      timeRef.current += delta;
    }
    const time = timeRef.current;
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {streaks.map((s, i) => (
        <mesh
          key={i}
          position={[s.x, s.y, s.z]}
          rotation={[0, (i / count) * Math.PI * 2, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.005, 0.005, s.length, 4, 1, true]} />
          <meshBasicMaterial
            color={s.color}
            transparent
            opacity={0.2 * opacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
};

// Central floating platform
const CentralPlatform = ({ opacity = 1.0, isPaused = false }) => {
  const platformRef = useRef();
  const outerRingRef = useRef();
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (!isPaused) {
      timeRef.current += delta;
    }
    const time = timeRef.current;
    if (platformRef.current) {
      platformRef.current.rotation.y = time * 0.08;
    }
    if (outerRingRef.current) {
      outerRingRef.current.rotation.y = -time * 0.15;
    }
  });

  return (
    <group position={[0, -2.0, 0]}>
      {/* Main disc */}
      <mesh ref={platformRef} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[3.5, 3.8, 0.12, 32]} />
        <meshStandardMaterial
          color="#0a0620"
          roughness={0.2}
          metalness={0.9}
          transparent
          opacity={opacity * 0.8}
        />
      </mesh>

      {/* Glowing rim ring */}
      <mesh ref={outerRingRef} position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.65, 0.03, 8, 64]} />
        <meshBasicMaterial
          color="#00f0ff"
          transparent
          opacity={0.4 * opacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Inner decorative ring */}
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.0, 0.02, 8, 48]} />
        <meshBasicMaterial
          color="#bd00ff"
          transparent
          opacity={0.25 * opacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Upward glow from platform */}
      <pointLight
        position={[0, 0.5, 0]}
        color="#00f0ff"
        intensity={2.5 * opacity}
        distance={10}
        decay={2}
      />
    </group>
  );
};

const InnovationGallery = ({ scrollProgress = 0, activeCubeId = null, setActiveCubeId, onLoad, onWarning }) => {
  useEffect(() => {
    console.log("Innovation Gallery Loaded");
    if (onLoad) onLoad('innovationGallery');
  }, [onLoad]);
  const isPaused = activeCubeId !== null;

  // Gallery fades in during its scroll phase (6-section layout: 0.6667 to 0.8333)
  const galleryOpacity = useMemo(() => {
    const fadeIn = THREE.MathUtils.smoothstep(scrollProgress, 0.6667, 0.70);
    const fadeOut = 1.0 - THREE.MathUtils.smoothstep(scrollProgress, 0.79, 0.8333);
    return fadeIn * fadeOut;
  }, [scrollProgress]);

  // Arrange cubes in a circle with larger radius
  const cubesWithPositions = useMemo(() => {
    const radius = 8.0; // Spacing increased from 5.5 to 8.0
    return cubes.map((cube, i) => {
      const angle = (i / 8) * Math.PI * 2;
      return {
        ...cube,
        position: [
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius,
        ],
      };
    });
  }, []);

  const handleCubeClick = (index) => {
    setActiveCubeId(index === activeCubeId ? null : index);
  };

  if (galleryOpacity <= 0) return null;

  return (
    <group position={[0, 0, -260]}>
      {/* Floating particles */}
      <GalleryParticles count={1500} opacity={galleryOpacity} isPaused={isPaused} />

      {/* Light streaks */}
      <LightStreaks count={14} opacity={galleryOpacity} isPaused={isPaused} />

      {/* Central platform */}
      <CentralPlatform opacity={galleryOpacity} isPaused={isPaused} />

      {/* Cinematic lighting */}
      <pointLight position={[4, 6, 4]} color="#00f0ff" intensity={3.0 * galleryOpacity} distance={20} decay={2} />
      <pointLight position={[-4, 4, -4]} color="#bd00ff" intensity={2.5 * galleryOpacity} distance={18} decay={2} />
      <pointLight position={[0, -3, 6]} color="#00e0c0" intensity={2.0 * galleryOpacity} distance={15} decay={2} />

      {/* Tech Cubes */}
      {cubesWithPositions.map((cube, i) => (
        <TechCube
          key={i}
          index={i}
          name={cube.title}
          color={cube.color}
          position={cube.position}
          isActive={activeCubeId === i}
          centerPosition={[0, 0, 0]}
          onClick={handleCubeClick}
          galleryOpacity={galleryOpacity}
          isPaused={isPaused}
        />
      ))}
    </group>
  );
};

export default InnovationGallery;
