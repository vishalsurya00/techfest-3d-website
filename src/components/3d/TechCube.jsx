import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import HologramRing from './HologramRing';

const TechCube = ({
  index,
  name,
  color = '#00f0ff',
  position = [0, 0, 0],
  isActive,
  centerPosition = [0, 0, 0],
  onClick,
  galleryOpacity = 1.0,
  isPaused = false,
}) => {
  const groupRef = useRef();
  const cubeRef = useRef();
  const wireRef = useRef();
  const lightRef = useRef();
  const localParticlesRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Smoothed values
  const lerpedY = useRef(0);
  const lerpedScale = useRef(1);
  const lerpedGlow = useRef(1);
  const lerpedX = useRef(position[0]);
  const lerpedZ = useRef(position[2]);
  const lerpedParticleSpeed = useRef(1.0);
  const lerpedSpeedMultiplier = useRef(1.0);

  // Local clock ref that pauses when selection is active
  const timeRef = useRef(0);

  // Local particles orbiting the cube
  const particleCount = 35;
  const [particlePositions] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = 0.55 + Math.random() * 0.75; // Small cloud around the cube
      
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return [pos];
  }, []);

  useFrame((state, delta) => {
    if (!isPaused) {
      timeRef.current += delta;
    }
    const time = timeRef.current;

    // 1. Floating bob
    const bob = Math.sin(time * 1.0 + index * 0.8) * 0.18;

    // 2. Smooth hover lift
    const targetLift = hovered ? 0.35 : 0;
    lerpedY.current = THREE.MathUtils.lerp(lerpedY.current, targetLift, delta * 5.0);

    // 3. Scale on hover / active
    const targetScale = hovered ? 1.18 : isActive ? 1.12 : 1.0;
    lerpedScale.current = THREE.MathUtils.lerp(lerpedScale.current, targetScale, delta * 5.0);

    // 4. Glow intensity
    const targetGlow = hovered ? 3.0 : isActive ? 2.2 : 1.0;
    lerpedGlow.current = THREE.MathUtils.lerp(lerpedGlow.current, targetGlow, delta * 5.0);

    // 5. Keep cube in its orbit position (active cube does not move to center anymore)
    const targetX = position[0];
    const targetZ = position[2];
    lerpedX.current = THREE.MathUtils.lerp(lerpedX.current, targetX, delta * 3.0);
    lerpedZ.current = THREE.MathUtils.lerp(lerpedZ.current, targetZ, delta * 3.0);

    // 5.5 Particle speed up on hover
    const targetParticleSpeed = hovered ? 3.8 : 1.0;
    lerpedParticleSpeed.current = THREE.MathUtils.lerp(lerpedParticleSpeed.current, targetParticleSpeed, delta * 4.0);

    if (localParticlesRef.current) {
      localParticlesRef.current.rotation.y = time * 0.7 * lerpedParticleSpeed.current;
      localParticlesRef.current.rotation.x = Math.sin(time * 0.3) * 0.15 * lerpedParticleSpeed.current;
      localParticlesRef.current.rotation.z = time * 0.4 * lerpedParticleSpeed.current;
    }

    // 5.6 Hologram ring speed up on hover
    const targetSpeedMult = hovered ? 2.6 : 1.0;
    lerpedSpeedMultiplier.current = THREE.MathUtils.lerp(lerpedSpeedMultiplier.current, targetSpeedMult, delta * 5.0);

    if (groupRef.current) {
      groupRef.current.position.x = lerpedX.current;
      groupRef.current.position.y = position[1] + bob + lerpedY.current;
      groupRef.current.position.z = lerpedZ.current;
      groupRef.current.scale.setScalar(lerpedScale.current);
    }

    // 6. Cube slow rotation
    if (cubeRef.current) {
      cubeRef.current.rotation.y = time * 0.4 + index;
      cubeRef.current.rotation.x = time * 0.25;
    }

    if (wireRef.current) {
      wireRef.current.rotation.y = -time * 0.5 + index;
      wireRef.current.rotation.z = time * 0.3;
    }

    // 7. Dynamic point light
    if (lightRef.current) {
      lightRef.current.intensity = lerpedGlow.current * 3.5 * galleryOpacity;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Point light for colored glow */}
      <pointLight
        ref={lightRef}
        color={color}
        distance={7}
        decay={2.0}
      />

      {/* Nearby particles that move faster on hover */}
      <points ref={localParticlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.038}
          color={color}
          transparent
          opacity={galleryOpacity * 0.75}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Interactive group */}
      <group
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'none';
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick(index);
        }}
      >
        {/* Solid inner cube */}
        <mesh ref={cubeRef}>
          <boxGeometry args={[0.65, 0.65, 0.65]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2.2}
            roughness={0.15}
            metalness={0.85}
            transparent
            opacity={galleryOpacity * 0.88}
          />
        </mesh>

        {/* Wireframe outer cube */}
        <mesh ref={wireRef}>
          <boxGeometry args={[0.85, 0.85, 0.85]} />
          <meshBasicMaterial
            color={color}
            wireframe
            transparent
            opacity={galleryOpacity * 0.6}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Reflective floor plane (simulates reflection) */}
        <mesh position={[0, -0.85, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.6, 24]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={galleryOpacity * 0.1}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Holographic rings beneath */}
      <HologramRing
        color={color}
        radius={0.7}
        speed={(0.8 + index * 0.1) * lerpedSpeedMultiplier.current}
        opacity={galleryOpacity}
        isPaused={isPaused}
      />

      {/* Label */}
      <Html position={[0, 1.0, 0]} center distanceFactor={14}>
        <div
          style={{
            color: '#ffffff',
            border: `1px solid ${color}77`,
            background: 'rgba(6, 3, 16, 0.88)',
            boxShadow: `0 0 14px ${color}30`,
            fontFamily: 'var(--font-cyber)',
            fontSize: '9px',
            fontWeight: 'bold',
            letterSpacing: '1.5px',
            padding: '5px 11px',
            borderRadius: '4px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            opacity: galleryOpacity * (hovered || isActive ? 1.0 : 0.6),
            transform: hovered ? 'scale(1.1) translateY(-3px)' : 'scale(1.0)',
            transition: 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            textShadow: `0 0 5px ${color}`,
          }}
        >
          {name}
        </div>
      </Html>
    </group>
  );
};

export default TechCube;
