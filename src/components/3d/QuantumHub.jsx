import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import QuantumCrystal from './QuantumCrystal';
import TechIsland from './TechIsland';
import EnergyBeam from './EnergyBeam';
import FloatingInfoPanel from './FloatingInfoPanel';

// Drifting spherical cloud of space orbs
const HubParticles = ({ count = 1500, opacity = 1.0 }) => {
  const pointsRef = useRef();

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Spherical distribution around the hub
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 4.0 + Math.random() * 12.0;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      spd[i] = 0.05 + Math.random() * 0.12;
    }
    return [pos, spd];
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (pointsRef.current) {
      pointsRef.current.rotation.y = time * 0.04;
      pointsRef.current.rotation.x = time * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        color="#c8a2ff"
        transparent
        opacity={0.4 * opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

const QuantumHub = ({ scrollProgress = 0, activeIslandId = null, setActiveIslandId }) => {
  const islandGroupRefs = useRef([
    React.createRef(),
    React.createRef(),
    React.createRef(),
    React.createRef(),
    React.createRef()
  ]);

  // Sector 4 opacity mapping: fades in from 0.64 to 0.76 (5-section layout)
  const hubOpacity = useMemo(() => {
    return THREE.MathUtils.smoothstep(scrollProgress, 0.64, 0.76);
  }, [scrollProgress]);

  // Tech Islands data
  const islands = useMemo(() => [
    {
      title: 'Quantum Computing',
      color: '#00f0ff',
      description: 'Superconducting qubit arrays leveraging superposition and entanglement to calculate previously unsolvable cryptographic and optimization matrices.',
      icon: (
        <svg viewBox="0 0 48 48" fill="none">
          <rect x="8" y="8" width="32" height="32" rx="4" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M24 8v10M24 30v10M8 24h10M30 24h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M14 14l5 5M29 29l5 5M14 30l5-5M29 19l5 5" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
        </svg>
      )
    },
    {
      title: 'Artificial General Intelligence',
      color: '#ff007a',
      description: 'Self-improving neural network fabrics executing across globally distributed edge nodes, matching human cognitive flexibility in reasoning and coding.',
      icon: (
        <svg viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="14" r="4" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="28" r="4" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="36" cy="28" r="4" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="24" cy="38" r="4" stroke="currentColor" strokeWidth="1.5" />
          <path d="M24 18l-9 7M24 18l9 7M15 30l6 5M33 30l-6 5M16 28h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    },
    {
      title: 'Brain-Computer Interface',
      color: '#bd00ff',
      description: 'Ultra-low latency neural telemetry interfaces resolving high-density cortical signals into seamless digital execution vectors.',
      icon: (
        <svg viewBox="0 0 48 48" fill="none">
          <path d="M14 16c0-4 4-8 10-8s10 4 10 8c0 5-3 8-5 11v5h-10v-5c-2-3-5-6-5-11z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M20 32v6M28 32v6M18 42h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="24" cy="16" r="2.5" fill="currentColor" />
          <path d="M18 16h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        </svg>
      )
    },
    {
      title: 'Space Technology',
      color: '#ff7a00',
      description: 'Deep space telemetry and gravitational assist mechanics governing ion-drive exploratory drone deployment in remote solar systems.',
      icon: (
        <svg viewBox="0 0 48 48" fill="none">
          <path d="M16 32l16-16M18 14l16 16M24 8l16 16-8 8-16-16L24 8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="36" r="3" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 40a16 16 0 0120-20" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        </svg>
      )
    },
    {
      title: 'Sustainable Energy',
      color: '#00ffa0',
      description: 'High-yield magnetic confinement fusion reactors delivering stable, infinite grid-level clean energy output.',
      icon: (
        <svg viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="1.5" />
          <path d="M24 10v28M10 24h28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="24" cy="24" r="5" fill="currentColor" />
        </svg>
      )
    }
  ], []);

  // Update dynamic orbit positions of the islands
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    islandGroupRefs.current.forEach((ref, i) => {
      if (ref.current) {
        // Match the same orbit formula used in Scene.jsx for camera tracking
        const angle = (i * Math.PI * 2) / 5 + time * 0.12;
        const x = Math.cos(angle) * 6.5;
        const z = Math.sin(angle) * 6.5;
        // Floating lift bobbing is done inside TechIsland.jsx itself
        ref.current.position.set(x, 0, z);
      }
    });
  });

  const handleIslandClick = (index) => {
    setActiveIslandId(index === activeIslandId ? null : index);
  };

  if (hubOpacity <= 0) return null;

  // Compute absolute coordinate for FloatingInfoPanel overlay
  const activeIsland = activeIslandId !== null ? islands[activeIslandId] : null;

  return (
    <group position={[0, 0, -190]}>
      {/* Drifting particle cloud */}
      <HubParticles count={1200} opacity={hubOpacity} />

      {/* Center Quantum Power Crystal */}
      <QuantumCrystal hubOpacity={hubOpacity} />

      {/* Orbiting Tech Islands and their Beams */}
      {islands.map((island, i) => {
        // Pre-compute beam lines dynamically linking [0, 0, 0] to the orbiting group position
        // We render the TechIsland within a helper group positioned dynamically by useFrame
        return (
          <group key={i} ref={islandGroupRefs.current[i]}>
            {/* The island renders at origin within its orbiting parent group */}
            <TechIsland
              index={i}
              name={island.title}
              color={island.color}
              position={[0, -1.0, 0]}
              isActive={activeIslandId === i}
              onClick={handleIslandClick}
              hubOpacity={hubOpacity}
            />

            {/* We link the center [0, 0, 0] (group relative) to the island offset [0, -1, 0] */}
            <EnergyBeam
              start={[0, 0, 0]}
              end={[0, -1.0, 0]}
              color={island.color}
              radius={0.012}
              speed={1.2}
            />
          </group>
        );
      })}

      {/* Details Glass Overlay above active island */}
      {activeIslandId !== null && activeIsland && (
        <group>
          {/* Create a helper component that moves dynamically with the active island to hold the HTML overlay */}
          <group
            ref={(node) => {
              if (node) {
                // Periodically sync the overlay container position to the active island
                const time = state => state.clock.getElapsedTime();
                const angle = (activeIslandId * Math.PI * 2) / 5;
                // We'll let useFrame handle it or just rely on react-three-fiber hierarchy
              }
            }}
          >
            {/* Direct JSX helper matching current active island orbital position */}
            <ActiveIslandOverlay
              activeIslandId={activeIslandId}
              activeIsland={activeIsland}
              onClose={() => setActiveIslandId(null)}
            />
          </group>
        </group>
      )}
    </group>
  );
};

// Component to dynamically resolve position of html panel inside R3F hierarchy
const ActiveIslandOverlay = ({ activeIslandId, activeIsland, onClose }) => {
  const containerRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (containerRef.current) {
      const angle = (activeIslandId * Math.PI * 2) / 5 + time * 0.12;
      const x = Math.cos(angle) * 6.5;
      const z = Math.sin(angle) * 6.5;
      const y = -1.0 + Math.sin(time * 1.5 + activeIslandId) * 0.35 + 0.4; // sync lift

      containerRef.current.position.set(x, y + 1.8, z);
    }
  });

  return (
    <group ref={containerRef}>
      <Html center distanceFactor={14}>
        <FloatingInfoPanel
          island={activeIsland}
          onClose={onClose}
        />
      </Html>
    </group>
  );
};

export default QuantumHub;
