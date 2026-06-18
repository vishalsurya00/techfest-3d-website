import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

const TechIsland = ({
  index,
  name,
  color = '#bd00ff',
  position = [0, 0, 0],
  isActive,
  onClick,
  hubOpacity = 1.0,
}) => {
  const islandRef = useRef();
  const ringRef = useRef();
  const crystalRef = useRef();
  const lightRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Smooth lerp factors
  const yLift = useRef(0.0);
  const glowFactor = useRef(1.0);
  const scaleFactor = useRef(1.0);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Independent floating bobbing
    const bob = Math.sin(time * 1.2 + index * 1.5) * 0.22;

    // 2. Smoothly lerp position lift on hover
    const targetLift = hovered ? 0.45 : 0.0;
    yLift.current = THREE.MathUtils.lerp(yLift.current, targetLift, delta * 4.0);

    if (islandRef.current) {
      islandRef.current.position.y = bob + yLift.current;
      
      // Gentle self-tilt
      islandRef.current.rotation.x = Math.sin(time * 0.6 + index) * 0.05;
      islandRef.current.rotation.z = Math.cos(time * 0.5 + index) * 0.05;
    }

    // 3. Rotate components
    if (ringRef.current) {
      ringRef.current.rotation.y = -time * 1.4;
      ringRef.current.rotation.x = time * 0.5;
    }
    if (crystalRef.current) {
      crystalRef.current.rotation.y = time * 0.8 + index;
    }

    // 4. Glow lerp
    const targetGlow = hovered ? 2.5 : (isActive ? 1.8 : 0.8);
    glowFactor.current = THREE.MathUtils.lerp(glowFactor.current, targetGlow, delta * 5.0);
    if (lightRef.current) {
      lightRef.current.intensity = glowFactor.current * 4.0 * hubOpacity;
    }

    // 5. Scale lerp
    const targetScale = hovered ? 1.15 : (isActive ? 1.08 : 1.0);
    scaleFactor.current = THREE.MathUtils.lerp(scaleFactor.current, targetScale, delta * 5.0);
    if (islandRef.current) {
      islandRef.current.scale.set(scaleFactor.current, scaleFactor.current, scaleFactor.current);
    }
  });

  return (
    <group position={position}>
      {/* Outer floating point light */}
      <pointLight
        ref={lightRef}
        color={color}
        distance={8}
        decay={2.0}
      />

      <group
        ref={islandRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          setHovered(false);
          document.body.style.cursor = 'none';
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick(index);
        }}
      >
        {/* Metallic Slab Base */}
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[1.0, 1.2, 0.25, 6]} />
          <meshStandardMaterial
            color="#141124"
            roughness={0.25}
            metalness={0.88}
            transparent
            opacity={hubOpacity}
          />
        </mesh>

        {/* Floating Ring Around Core */}
        <mesh position={[0, 0, 0]} ref={ringRef}>
          <torusGeometry args={[0.9, 0.04, 8, 24]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={hubOpacity * 0.5}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Core Crystal Spire */}
        <mesh position={[0, 0.2, 0]} ref={crystalRef}>
          <octahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.2}
            roughness={0.1}
            metalness={0.9}
            transparent
            opacity={hubOpacity * 0.85}
          />
        </mesh>

        {/* Small floating orbiting support nodes */}
        <mesh position={[0.5, 0.1, 0.5]}>
          <boxGeometry args={[0.12, 0.12, 0.12]} />
          <meshStandardMaterial
            color="#1b1c2b"
            roughness={0.2}
            metalness={0.7}
            transparent
            opacity={hubOpacity}
          />
        </mesh>
        <mesh position={[-0.5, 0.1, -0.5]}>
          <boxGeometry args={[0.12, 0.12, 0.12]} />
          <meshStandardMaterial
            color="#1b1c2b"
            roughness={0.2}
            metalness={0.7}
            transparent
            opacity={hubOpacity}
          />
        </mesh>

        {/* Label (HTML Name Tag) */}
        <Html position={[0, 1.1, 0]} center distanceFactor={14}>
          <div
            style={{
              color: '#ffffff',
              border: `1px solid ${color}88`,
              background: 'rgba(8, 4, 18, 0.85)',
              boxShadow: `0 0 12px ${color}35`,
              fontFamily: 'var(--font-cyber)',
              fontSize: '10px',
              fontWeight: 'bold',
              letterSpacing: '1.5px',
              padding: '5px 10px',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              opacity: hubOpacity * (hovered || isActive ? 1.0 : 0.65),
              transform: hovered ? 'scale(1.08) translateY(-4px)' : 'scale(1.0)',
              transition: 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              textShadow: `0 0 4px ${color}`,
            }}
          >
            {name}
          </div>
        </Html>
      </group>
    </group>
  );
};

export default TechIsland;
