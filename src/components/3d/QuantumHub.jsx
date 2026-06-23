import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import QuantumCrystal from './QuantumCrystal';
import TechIsland from './TechIsland';
import EnergyBeam from './EnergyBeam';
import { islands } from '../../data/universeData';

// Drifting spherical cloud of space orbs
const HubParticles = ({ count = 1500, opacity = 1.0, isPaused = false }) => {
  const pointsRef = useRef();
  const timeRef = useRef(0);

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
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

  useFrame((state, delta) => {
    if (!isPaused) {
      timeRef.current += delta;
    }
    const time = timeRef.current;
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

const QuantumHub = ({ scrollProgress = 0, activeIslandId = null, setActiveIslandId, onLoad, onWarning }) => {
  useEffect(() => {
    console.log("Quantum Hub Loaded");
    if (onLoad) onLoad('quantumHub');
  }, [onLoad]);
  const islandGroupRefs = useRef([
    React.createRef(),
    React.createRef(),
    React.createRef(),
    React.createRef(),
    React.createRef()
  ]);

  const isPaused = activeIslandId !== null;
  const timeRef = useRef(0);

  // Sector 4 opacity mapping: fades in starting at 0.50 and out at 0.6667 (6-section layout)
  const hubOpacity = useMemo(() => {
    const fadeIn = THREE.MathUtils.smoothstep(scrollProgress, 0.39, 0.50);
    const fadeOut = 1 - THREE.MathUtils.smoothstep(scrollProgress, 0.56, 0.6667);
    return fadeIn * fadeOut;
  }, [scrollProgress]);

  // Update dynamic orbit positions of the islands
  useFrame((state, delta) => {
    if (!isPaused) {
      timeRef.current += delta;
    }
    const time = timeRef.current;

    islandGroupRefs.current.forEach((ref, i) => {
      if (ref.current) {
        // Spacing increased from 6.5 to 9.0
        const angle = (i * Math.PI * 2) / 5 + time * 0.12;
        const x = Math.cos(angle) * 9.0;
        const z = Math.sin(angle) * 9.0;
        ref.current.position.set(x, 0, z);
      }
    });
  });

  const handleIslandClick = (index) => {
    setActiveIslandId(index === activeIslandId ? null : index);
  };

  if (hubOpacity <= 0) return null;

  return (
    <group position={[0, 0, -190]}>
      {/* Drifting particle cloud */}
      <HubParticles count={1200} opacity={hubOpacity} isPaused={isPaused} />

      {/* Center Quantum Power Crystal */}
      <QuantumCrystal hubOpacity={hubOpacity} isPaused={isPaused} />

      {/* Orbiting Tech Islands and their Beams */}
      {islands.map((island, i) => {
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
              isPaused={isPaused}
            />

            {/* Energy beam from center */}
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
    </group>
  );
};

export default QuantumHub;
