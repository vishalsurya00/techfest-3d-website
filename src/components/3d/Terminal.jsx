import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

const Terminal = ({
  index,
  name,
  color = '#00ffa0',
  position = [0, 0, 0],
  activeTerminalId,
  onClick,
  labOpacity = 1.0,
}) => {
  const diskRef = useRef();
  const matRef = useRef();
  const [hovered, setHovered] = useState(false);

  const isActive = activeTerminalId === index;

  // Refs for smooth transitions in useFrame
  const scaleFactor = useRef(1.0);
  const glowFactor = useRef(1.0);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Rotate the holographic disk
    if (diskRef.current) {
      diskRef.current.rotation.y = time * 0.8;
      // Add subtle bobbing
      diskRef.current.position.y = -0.2 + Math.sin(time * 2.0 + index) * 0.05;
    }

    // 2. Smoothly lerp scale on hover or active status
    const targetScale = hovered ? 1.2 : (isActive ? 1.12 : 1.0);
    scaleFactor.current = THREE.MathUtils.lerp(scaleFactor.current, targetScale, delta * 5.0);
    if (diskRef.current) {
      diskRef.current.scale.set(scaleFactor.current, scaleFactor.current, scaleFactor.current);
    }

    // 3. Smoothly lerp glow intensity
    const targetGlow = hovered ? 3.5 : (isActive ? 2.6 : 1.25);
    glowFactor.current = THREE.MathUtils.lerp(glowFactor.current, targetGlow, delta * 5.0);
    if (matRef.current) {
      matRef.current.emissiveIntensity = glowFactor.current;
    }
  });

  return (
    <group position={position}>
      {/* Pedestal Stand (metallic) */}
      <mesh position={[0, -1.0, 0]}>
        <boxGeometry args={[0.26, 1.2, 0.26]} />
        <meshStandardMaterial
          color="#121620"
          roughness={0.25}
          metalness={0.8}
          transparent
          opacity={labOpacity}
        />
      </mesh>

      {/* Pedestal Accent Rings */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.03, 16]} />
        <meshStandardMaterial
          color="#222a36"
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={labOpacity}
        />
      </mesh>
      
      <mesh position={[0, -0.38, 0]}>
        <torusGeometry args={[0.185, 0.01, 8, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={labOpacity * 0.5}
        />
      </mesh>

      {/* Floating Holographic Projector Disk */}
      <mesh
        ref={diskRef}
        position={[0, -0.2, 0]}
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
        <cylinderGeometry args={[0.34, 0.34, 0.06, 16]} />
        <meshStandardMaterial
          ref={matRef}
          color={color}
          emissive={color}
          emissiveIntensity={1.25}
          roughness={0.15}
          metalness={0.9}
          transparent
          opacity={labOpacity * 0.72}
        />
      </mesh>

      {/* Light cone projecting upwards */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.18, 0.3, 0.8, 16, 1, true]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={labOpacity * (hovered || isActive ? 0.18 : 0.09)}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Holographic Text Tag floating above the terminal */}
      <Html position={[0, 0.65, 0]} center distanceFactor={14}>
        <div
          className="terminal-label"
          style={{
            color: color,
            border: `1px solid ${color}66`,
            background: 'rgba(3, 10, 8, 0.82)',
            boxShadow: `0 0 12px ${color}35`,
            fontFamily: 'var(--font-cyber)',
            fontSize: '9.5px',
            fontWeight: 'bold',
            letterSpacing: '1.5px',
            padding: '4px 8px',
            borderRadius: '4px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            opacity: labOpacity * (hovered || isActive ? 1.0 : 0.75),
            transform: hovered ? 'scale(1.08) translateY(-3px)' : 'scale(1.0)',
            transition: 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            textShadow: `0 0 4px ${color}`,
          }}
        >
          {name}
        </div>
      </Html>
    </group>
  );
};

export default Terminal;
