import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import TechCube from './TechCube';
import DetailPanel from './DetailPanel';

// Floating particles + light streaks
const GalleryParticles = ({ count = 1800, opacity = 1.0 }) => {
  const pointsRef = useRef();

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Disc-like distribution with some vertical spread
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

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
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
const LightStreaks = ({ count = 12, opacity = 1.0 }) => {
  const groupRef = useRef();

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

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
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
const CentralPlatform = ({ opacity = 1.0 }) => {
  const platformRef = useRef();
  const outerRingRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
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

const InnovationGallery = ({ scrollProgress = 0, activeCubeId = null, setActiveCubeId }) => {
  // Gallery fades in during its scroll phase (0.8→0.92 of raw progress)
  const galleryOpacity = useMemo(() => {
    return THREE.MathUtils.smoothstep(scrollProgress, 0.84, 0.94);
  }, [scrollProgress]);

  // 8 cubes arranged in a circle
  const cubes = useMemo(() => {
    const cubeData = [
      {
        title: 'Artificial Intelligence',
        color: '#00f0ff',
        description: 'Advanced neural architectures enabling machines to perceive, reason, and act with unprecedented cognitive capabilities across domains.',
        futureApps: ['Autonomous Systems', 'Medical Diagnostics', 'Creative AI'],
        icon: (
          <svg viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="18" r="6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 36c0-6 5-10 12-10s12 4 12 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="24" cy="18" r="2" fill="currentColor" />
            <path d="M18 12l-4-4M30 12l4-4M24 10V5" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
          </svg>
        )
      },
      {
        title: 'Machine Learning',
        color: '#ff007a',
        description: 'Self-optimizing algorithms that iteratively improve from data patterns, powering predictive models and intelligent decision systems.',
        futureApps: ['Drug Discovery', 'Climate Modeling', 'Financial Forecasting'],
        icon: (
          <svg viewBox="0 0 48 48" fill="none">
            <path d="M8 38l8-12 6 8 8-16 10 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="16" cy="26" r="2" fill="currentColor" />
            <circle cx="22" cy="34" r="2" fill="currentColor" />
            <circle cx="30" cy="18" r="2" fill="currentColor" />
          </svg>
        )
      },
      {
        title: 'Robotics',
        color: '#bd00ff',
        description: 'Autonomous mechatronic systems integrating perception, planning, and manipulation to augment human capability in hazardous and precision environments.',
        futureApps: ['Surgical Robots', 'Space Exploration', 'Smart Manufacturing'],
        icon: (
          <svg viewBox="0 0 48 48" fill="none">
            <rect x="14" y="16" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="20" cy="24" r="2" fill="currentColor" />
            <circle cx="28" cy="24" r="2" fill="currentColor" />
            <path d="M18 32v6M30 32v6M24 16v-6M20 10h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )
      },
      {
        title: 'Internet of Things',
        color: '#00ffa0',
        description: 'Billions of interconnected sensors and edge devices forming a global mesh network enabling real-time monitoring and intelligent automation.',
        futureApps: ['Smart Cities', 'Precision Agriculture', 'Industrial IoT'],
        icon: (
          <svg viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="4" fill="currentColor" />
            <circle cx="24" cy="24" r="10" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 3" />
            <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
            <circle cx="14" cy="14" r="2" fill="currentColor" opacity="0.7" />
            <circle cx="34" cy="14" r="2" fill="currentColor" opacity="0.7" />
            <circle cx="34" cy="34" r="2" fill="currentColor" opacity="0.7" />
            <circle cx="14" cy="34" r="2" fill="currentColor" opacity="0.7" />
          </svg>
        )
      },
      {
        title: 'Blockchain',
        color: '#ff7a00',
        description: 'Decentralized cryptographic ledger technology ensuring immutable, transparent, and trustless data integrity across distributed networks.',
        futureApps: ['Digital Identity', 'Supply Chain', 'Decentralized Finance'],
        icon: (
          <svg viewBox="0 0 48 48" fill="none">
            <rect x="16" y="8" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <rect x="16" y="30" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M24 18v12" stroke="currentColor" strokeWidth="1.5" />
            <path d="M18 18v4l-6 4v4M30 18v4l6 4v4" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
          </svg>
        )
      },
      {
        title: 'Cyber Security',
        color: '#00e0c0',
        description: 'Zero-trust defensive frameworks and quantum-resistant encryption protocols protecting critical digital infrastructure from advanced persistent threats.',
        futureApps: ['Quantum Encryption', 'AI Threat Detection', 'Zero-Knowledge Proofs'],
        icon: (
          <svg viewBox="0 0 48 48" fill="none">
            <path d="M24 6l14 6v12c0 10-6 16-14 20C16 40 10 34 10 24V12l14-6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M20 24l4 4 6-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )
      },
      {
        title: 'AR / VR',
        color: '#c840ff',
        description: 'Immersive spatial computing platforms blending digital overlays with physical reality, enabling new paradigms for training, collaboration, and entertainment.',
        futureApps: ['Virtual Classrooms', 'Digital Twin Ops', 'Immersive Healthcare'],
        icon: (
          <svg viewBox="0 0 48 48" fill="none">
            <rect x="8" y="16" width="32" height="18" rx="4" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="18" cy="25" r="4" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="30" cy="25" r="4" stroke="currentColor" strokeWidth="1.5" />
            <path d="M22 25h4" stroke="currentColor" strokeWidth="1.5" />
            <path d="M14 16l-2-4M34 16l2-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        )
      },
      {
        title: 'Space Technology',
        color: '#ffcc00',
        description: 'Ion-drive propulsion, orbital manufacturing, and deep-space telemetry systems enabling humanity\'s expansion beyond Earth orbit.',
        futureApps: ['Mars Colonization', 'Orbital Factories', 'Asteroid Mining'],
        icon: (
          <svg viewBox="0 0 48 48" fill="none">
            <path d="M16 32l16-16M18 14l16 16M24 8l16 16-8 8-16-16L24 8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="36" r="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 40a16 16 0 0120-20" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
          </svg>
        )
      },
    ];

    // Position 8 cubes in a circle
    const radius = 5.5;
    return cubeData.map((cube, i) => {
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

  const activeCube = activeCubeId !== null ? cubes[activeCubeId] : null;

  return (
    <group position={[0, 0, -260]}>
      {/* Floating particles */}
      <GalleryParticles count={1500} opacity={galleryOpacity} />

      {/* Light streaks */}
      <LightStreaks count={14} opacity={galleryOpacity} />

      {/* Central platform */}
      <CentralPlatform opacity={galleryOpacity} />

      {/* Cinematic lighting */}
      <pointLight position={[4, 6, 4]} color="#00f0ff" intensity={3.0 * galleryOpacity} distance={20} decay={2} />
      <pointLight position={[-4, 4, -4]} color="#bd00ff" intensity={2.5 * galleryOpacity} distance={18} decay={2} />
      <pointLight position={[0, -3, 6]} color="#00e0c0" intensity={2.0 * galleryOpacity} distance={15} decay={2} />

      {/* Tech Cubes */}
      {cubes.map((cube, i) => (
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
        />
      ))}

      {/* Detail panel for active cube */}
      {activeCubeId !== null && activeCube && (
        <ActiveCubeOverlay
          activeCube={activeCube}
          onClose={() => setActiveCubeId(null)}
        />
      )}
    </group>
  );
};

// Positioned detail overlay above center
const ActiveCubeOverlay = ({ activeCube, onClose }) => {
  return (
    <group position={[0, 2.2, 0]}>
      <Html center distanceFactor={14}>
        <DetailPanel
          cube={activeCube}
          onClose={onClose}
        />
      </Html>
    </group>
  );
};

export default InnovationGallery;
