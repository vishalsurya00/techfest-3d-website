import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Hologram = ({ position = [0, 0, 0], scale = 1, type = 'knot', color = '#00f0ff' }) => {
  const meshRef = useRef();

  // Custom Holographic Scanning Shader
  const hologramShader = useMemo(() => {
    return {
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;

        void main() {
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        varying vec3 vPosition;
        varying vec3 vNormal;

        void main() {
          // 1. Create horizontal scanlines using a sine wave over Y
          float scanline = sin(vPosition.y * 25.0 - uTime * 6.0) * 0.5 + 0.5;
          
          // 2. Simulate projection flicker/noise
          float flicker = 0.85 + 0.15 * sin(uTime * 60.0) * cos(uTime * 25.0);
          
          // Occasional random connection drops
          if (sin(uTime * 12.0) > 0.98) {
            flicker = 0.2;
          }

          // 3. Fresnel edge glow (hologram glow on contours)
          // Since it's a wireframe, standard normal facing works
          float edgeGlow = pow(1.0 - abs(vNormal.z), 2.0);
          
          // Blend components together
          float alpha = (0.25 + scanline * 0.45 + edgeGlow * 0.3) * flicker;
          
          gl_FragColor = vec4(uColor, alpha * 0.65);
        }
      `
    };
  }, [color]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    hologramShader.uniforms.uTime.value = time;

    if (meshRef.current) {
      // Slow rotation on multiple axes
      meshRef.current.rotation.y = time * 0.25;
      meshRef.current.rotation.x = time * 0.12;
      
      // Floating vertical bobbing
      meshRef.current.position.y = position[1] + Math.sin(time * 1.5) * 0.15 * scale;
    }
  });

  return (
    <group position={position}>
      {/* 1. Rotating wireframe hologram mesh */}
      <mesh ref={meshRef} scale={scale}>
        {type === 'knot' ? (
          <torusKnotGeometry args={[0.6, 0.18, 64, 8]} />
        ) : (
          <sphereGeometry args={[0.7, 16, 16]} />
        )}
        <shaderMaterial
          transparent
          wireframe
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexShader={hologramShader.vertexShader}
          fragmentShader={hologramShader.fragmentShader}
          uniforms={hologramShader.uniforms}
        />
      </mesh>

      {/* 2. Hologram pedestal projector pad */}
      <mesh position={[0, -0.85 * scale, 0]}>
        <cylinderGeometry args={[0.55 * scale, 0.65 * scale, 0.08 * scale, 16]} />
        <meshStandardMaterial
          color="#150b24"
          roughness={0.4}
          metalness={0.8}
        />
      </mesh>

      {/* 3. Pedestal laser ring emitter */}
      <mesh position={[0, -0.81 * scale, 0]}>
        <cylinderGeometry args={[0.45 * scale, 0.45 * scale, 0.02 * scale, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
};

export default Hologram;
