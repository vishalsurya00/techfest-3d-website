import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

const OrbitNode = ({
  index,
  name,
  label,
  color,
  orbitRadius = 4.8,
  activeNodeId,
  onClick,
  cityOpacity = 1.0,
}) => {
  const groupRef = useRef();
  const meshRef = useRef();
  const outerRingRef = useRef();
  const materialRef = useRef();

  const [hovered, setHovered] = useState(false);

  const isActive = activeNodeId === index;
  const anyNodeActive = activeNodeId !== null;

  // Use refs to store and smoothly lerp values without causing react re-renders inside useFrame
  const angleRef = useRef((index * Math.PI * 2) / 6);
  const speedFactor = useRef(1.0);
  const scaleFactor = useRef(1.0);
  const glowFactor = useRef(1.0);

  useFrame((state, delta) => {
    // 1. Calculate target orbit speed multiplier
    let targetSpeed = 1.0;
    if (isActive) {
      targetSpeed = 0.0; // Stop orbiting when active
    } else if (hovered) {
      targetSpeed = 0.15; // Slow down on hover
    } else if (anyNodeActive) {
      targetSpeed = 0.08; // Slow down all other nodes when one is open
    }

    // Lerp orbit speed factor
    speedFactor.current = THREE.MathUtils.lerp(speedFactor.current, targetSpeed, delta * 3.5);

    // Accumulate angle based on speed
    // Base speed: 0.18 radians per second
    angleRef.current += delta * 0.18 * speedFactor.current;

    // 2. Compute orbit coordinates (XZ plane) with vertical wave bobbing
    const x = Math.cos(angleRef.current) * orbitRadius;
    const z = Math.sin(angleRef.current) * orbitRadius;
    const y = Math.sin(angleRef.current * 2.0 + index) * 0.45; // Waving motion

    if (groupRef.current) {
      groupRef.current.position.set(x, y, z);
    }

    // 3. Rotate the outer containment ring
    if (outerRingRef.current) {
      outerRingRef.current.rotation.x += delta * 1.2;
      outerRingRef.current.rotation.y += delta * 0.6;
    }

    // 4. Smooth scale transition
    const targetScale = hovered ? 1.35 : (isActive ? 1.2 : 1.0);
    scaleFactor.current = THREE.MathUtils.lerp(scaleFactor.current, targetScale, delta * 5.0);
    if (meshRef.current) {
      meshRef.current.scale.setScalar(scaleFactor.current);
    }

    // 5. Smooth glow transition
    const targetGlow = hovered ? 2.5 : (isActive ? 1.8 : 1.0);
    glowFactor.current = THREE.MathUtils.lerp(glowFactor.current, targetGlow, delta * 5.0);
    if (materialRef.current) {
      materialRef.current.emissiveIntensity = glowFactor.current;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Node Clickable Sphere & Glow */}
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer'; // Fallback highlight cursor state
        }}
        onPointerOut={(e) => {
          setHovered(false);
          document.body.style.cursor = 'none'; // Revert to CustomCursor
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick(index);
        }}
      >
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial
          ref={materialRef}
          color={color}
          emissive={color}
          emissiveIntensity={1.0}
          roughness={0.15}
          metalness={0.9}
          transparent
          opacity={cityOpacity}
        />
      </mesh>

      {/* Outer Rotating Cyber Ring */}
      <mesh ref={outerRingRef}>
        <torusGeometry args={[0.34, 0.02, 8, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={cityOpacity * 0.55}
          wireframe
        />
      </mesh>

      {/* Subtle Bottom Projection Emitter Beam */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 1.2, 8, 1, true]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={cityOpacity * 0.22}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 2D HTML Tech Name Floating Tag */}
      <Html position={[0, 0.55, 0]} center distanceFactor={16}>
        <div
          className="node-label"
          style={{
            color: color,
            border: `1px solid ${color}66`,
            background: 'rgba(6, 3, 15, 0.82)',
            boxShadow: `0 0 12px ${color}40`,
            fontFamily: 'var(--font-cyber)',
            fontSize: '9px',
            fontWeight: 'bold',
            letterSpacing: '1.5px',
            padding: '3px 7px',
            borderRadius: '4px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            opacity: cityOpacity * (hovered || isActive ? 1.0 : 0.75),
            transform: hovered ? 'scale(1.1) translateY(-3px)' : 'scale(1.0)',
            transition: 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            textShadow: `0 0 4px ${color}`,
          }}
        >
          {label}
        </div>
      </Html>
    </group>
  );
};

export default OrbitNode;
