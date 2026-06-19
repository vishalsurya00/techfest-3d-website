import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const HologramRing = ({ color = '#00f0ff', radius = 0.8, speed = 1.0, opacity = 1.0 }) => {
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const ring3Ref = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = Math.PI / 2;
      ring1Ref.current.rotation.z = time * speed * 0.8;
      // Pulsing scale
      const pulse1 = 1.0 + Math.sin(time * 2.0) * 0.06;
      ring1Ref.current.scale.set(pulse1, pulse1, 1);
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = Math.PI / 2 + 0.3;
      ring2Ref.current.rotation.z = -time * speed * 0.6;
      const pulse2 = 1.0 + Math.sin(time * 2.5 + 1.0) * 0.05;
      ring2Ref.current.scale.set(pulse2, pulse2, 1);
    }

    if (ring3Ref.current) {
      ring3Ref.current.rotation.x = Math.PI / 2 - 0.2;
      ring3Ref.current.rotation.z = time * speed * 1.1;
      const pulse3 = 1.0 + Math.sin(time * 1.8 + 2.0) * 0.07;
      ring3Ref.current.scale.set(pulse3, pulse3, 1);
    }
  });

  return (
    <group position={[0, -0.55, 0]}>
      {/* Primary ring */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[radius, 0.015, 8, 48]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.5 * opacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Secondary tilted ring */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[radius * 1.2, 0.012, 8, 48]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3 * opacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Tertiary subtle ring */}
      <mesh ref={ring3Ref}>
        <torusGeometry args={[radius * 0.7, 0.01, 8, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.25 * opacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

export default HologramRing;
