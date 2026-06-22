import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const QuantumCrystal = ({ hubOpacity = 1.0, isPaused = false }) => {
  const crystalGroupRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const shardGroupRef = useRef();

  // Define 8 orbiting shards/fragments
  const shards = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 8; i++) {
      arr.push({
        radius: 1.6 + Math.random() * 0.8,
        speed: 0.6 + Math.random() * 0.8,
        offset: Math.random() * Math.PI * 2,
        yOffset: (Math.random() - 0.5) * 0.8,
        scale: 0.06 + Math.random() * 0.08,
      });
    }
    return arr;
  }, []);

  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (!isPaused) {
      timeRef.current += delta;
    }
    const time = timeRef.current;

    // 1. Crystal main group rotation & pulsing scale
    if (crystalGroupRef.current) {
      crystalGroupRef.current.rotation.y = time * 0.25;
      crystalGroupRef.current.rotation.x = time * 0.15;
      
      const pulseScale = 1.0 + Math.sin(time * 2.2) * 0.08;
      crystalGroupRef.current.scale.set(pulseScale, pulseScale, pulseScale);
    }

    // 2. Expand energy ring 1
    if (ring1Ref.current) {
      const progress1 = (time * 0.8) % 1.0;
      const scale1 = progress1 * 4.5 + 0.5;
      ring1Ref.current.scale.set(scale1, scale1, 1);
      
      // Fade out as it expands
      if (ring1Ref.current.material) {
        ring1Ref.current.material.opacity = (1.0 - progress1) * 0.45 * hubOpacity;
      }
    }

    // 3. Expand energy ring 2 (out of phase with ring 1)
    if (ring2Ref.current) {
      const progress2 = (time * 0.8 + 0.5) % 1.0;
      const scale2 = progress2 * 4.5 + 0.5;
      ring2Ref.current.scale.set(scale2, scale2, 1);
      
      // Fade out as it expands
      if (ring2Ref.current.material) {
        ring2Ref.current.material.opacity = (1.0 - progress2) * 0.45 * hubOpacity;
      }
    }

    // 4. Update orbiting shards
    if (shardGroupRef.current) {
      shardGroupRef.current.children.forEach((child, idx) => {
        const shard = shards[idx];
        const angle = time * shard.speed + shard.offset;
        child.position.x = Math.cos(angle) * shard.radius;
        child.position.z = Math.sin(angle) * shard.radius;
        child.position.y = Math.sin(time * 1.5 + idx) * 0.15 + shard.yOffset;
        
        child.rotation.y = time * 1.5 + idx;
        child.rotation.x = time * 0.8;
      });
    }
  });

  return (
    <group>
      {/* Central Light Source */}
      <pointLight
        position={[0, 0, 0]}
        color="#bd00ff"
        intensity={6.0 * hubOpacity}
        distance={18}
        decay={1.8}
      />
      <pointLight
        position={[0, 0, 0]}
        color="#00f0ff"
        intensity={4.0 * hubOpacity}
        distance={12}
        decay={2.0}
      />

      {/* Crystal Cluster Group */}
      <group ref={crystalGroupRef}>
        {/* Core tall octahedron crystal */}
        <mesh>
          <octahedronGeometry args={[0.9, 0]} />
          {/* Elongate the geometry to make it a needle-like crystal */}
          <meshStandardMaterial
            color="#bd00ff"
            emissive="#bd00ff"
            emissiveIntensity={1.8}
            roughness={0.1}
            metalness={0.9}
            transparent
            opacity={hubOpacity * 0.9}
          />
        </mesh>
        
        {/* Intersecting secondary crystal rotated (Electric Blue) */}
        <mesh rotation={[0, 0, Math.PI / 4]} scale={[0.65, 1.25, 0.65]}>
          <octahedronGeometry args={[0.7, 0]} />
          <meshStandardMaterial
            color="#00f0ff"
            emissive="#00f0ff"
            emissiveIntensity={1.6}
            roughness={0.1}
            metalness={0.9}
            transparent
            opacity={hubOpacity * 0.85}
          />
        </mesh>

        {/* Third intersecting crystal (Pink/Magenta accent) */}
        <mesh rotation={[Math.PI / 4, 0, 0]} scale={[0.55, 1.15, 0.55]}>
          <octahedronGeometry args={[0.7, 0]} />
          <meshStandardMaterial
            color="#ff007a"
            emissive="#ff007a"
            emissiveIntensity={1.4}
            roughness={0.1}
            metalness={0.9}
            transparent
            opacity={hubOpacity * 0.85}
          />
        </mesh>
      </group>

      {/* Volumetric Glowing Core Ring (rotated to lie horizontally) */}
      <group rotation={[Math.PI / 2, 0, 0]}>
        <mesh ref={ring1Ref}>
          <ringGeometry args={[0.5, 0.58, 32]} />
          <meshBasicMaterial
            color="#00f0ff"
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
        <mesh ref={ring2Ref}>
          <ringGeometry args={[0.5, 0.58, 32]} />
          <meshBasicMaterial
            color="#bd00ff"
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Orbiting Crystal Shards/Fragments */}
      <group ref={shardGroupRef}>
        {shards.map((shard, idx) => (
          <mesh key={idx} scale={[shard.scale, shard.scale * 2.0, shard.scale]}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
              color={idx % 2 === 0 ? '#00f0ff' : '#bd00ff'}
              emissive={idx % 2 === 0 ? '#00f0ff' : '#bd00ff'}
              emissiveIntensity={1.2}
              roughness={0.2}
              metalness={0.8}
              transparent
              opacity={hubOpacity * 0.8}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};

export default QuantumCrystal;
