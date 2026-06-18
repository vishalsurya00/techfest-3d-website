import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const EnergyRoad = ({ start = [0, 0, 0], end = [0, 0, 10], color = '#00f0ff', radius = 0.035 }) => {
  const meshRef = useRef();

  // 1. Calculate length, center position, and rotation matrix to align cylinder between start and end coordinates
  const [position, rotation, length] = useMemo(() => {
    const vStart = new THREE.Vector3(...start);
    const vEnd = new THREE.Vector3(...end);
    
    // Position: midpoint between start and end
    const pos = new THREE.Vector3().addVectors(vStart, vEnd).multiplyScalar(0.5);
    
    // Length: distance between points
    const len = vStart.distanceTo(vEnd);
    
    // Rotation: calculate quaternion to align cylinder along the vector direction
    const direction = new THREE.Vector3().subVectors(vEnd, vStart).normalize();
    const up = new THREE.Vector3(0, 1, 0); // Default cylinder axis is Y
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
    const rot = new THREE.Euler().setFromQuaternion(quaternion);

    return [pos.toArray(), rot.toArray(), len];
  }, [start, end]);

  // 2. Custom Glowing Pulse Shader
  const energyShader = useMemo(() => {
    return {
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
      },
      vertexShader: `
        varying vec2 vUv;
        varying float vEdgeGlow;

        void main() {
          vUv = uv;
          // Normal edge falloff (for tube thickness glow)
          vec3 n = normalize(normalMatrix * normal);
          vEdgeGlow = pow(1.0 - abs(n.z), 1.5);

          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        varying vec2 vUv;
        varying float vEdgeGlow;

        void main() {
          // Create a sharp traveling pulse along the length (V coordinate)
          // Frequency is 8.0, speed is 6.0
          float pulse = sin(vUv.y * 12.0 - uTime * 14.0) * 0.5 + 0.5;
          pulse = pow(pulse, 8.0); // Concentrates the pulse into bright packets

          // Subtle base background pipeline glow
          float alpha = 0.12 + pulse * 0.88;

          // Apply edge glow to make the cylinder look volumetric
          alpha *= (0.4 + vEdgeGlow * 0.6);

          gl_FragColor = vec4(uColor, alpha * 0.85);
        }
      `
    };
  }, [color]);

  useFrame((state) => {
    energyShader.uniforms.uTime.value = state.clock.getElapsedTime();
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={new THREE.Euler(...rotation.slice(0, 3))}
    >
      {/* Cylinder pointing along Y-axis, aligned via math */}
      <cylinderGeometry args={[radius, radius, length, 8, 1, true]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={energyShader.vertexShader}
        fragmentShader={energyShader.fragmentShader}
        uniforms={energyShader.uniforms}
      />
    </mesh>
  );
};

export default EnergyRoad;
