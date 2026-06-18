import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Nebula = ({ scrollProgress = 0 }) => {
  const groupRef = useRef();
  const dustRef = useRef();

  useEffect(() => {
    if (dustRef.current) {
      dustRef.current.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1000);
    }
  }, []);

  // 1. Procedural texture generators for offline reliability and fast load times
  const textures = useMemo(() => {
    const generateCanvasTexture = (colorString) => {
      const size = 512;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Draw a soft radial gradient with color stop blending
      const center = size / 2;
      const grad = ctx.createRadialGradient(center, center, 0, center, center, center);
      
      grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      grad.addColorStop(0.15, `rgba(${colorString}, 0.5)`);
      grad.addColorStop(0.4, `rgba(${colorString}, 0.15)`);
      grad.addColorStop(0.7, `rgba(${colorString}, 0.05)`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    };

    // Color definitions (cyan, purple, magenta)
    return {
      cyan: generateCanvasTexture('0, 240, 255'),
      purple: generateCanvasTexture('189, 0, 255'),
      magenta: generateCanvasTexture('255, 0, 122'),
    };
  }, []);

  // 2. Setup large nebula clouds in 3D Space
  const cloudCount = 8;
  const clouds = useMemo(() => {
    const items = [];
    const types = ['cyan', 'purple', 'magenta'];
    
    for (let i = 0; i < cloudCount; i++) {
      const type = types[i % types.length];
      items.push({
        position: [
          (Math.random() - 0.5) * 150,     // X
          (Math.random() - 0.5) * 150,     // Y
          -Math.random() * 400 - 100,      // Z (depth layout)
        ],
        scale: Math.random() * 120 + 100,  // Scale size
        rotationSpeed: (Math.random() - 0.5) * 0.015,
        baseRotation: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.12 + 0.08,
        texture: textures[type],
      });
    }
    return items;
  }, [textures]);

  // 3. Floating dust particle coordinates
  const dustCount = 300;
  const [dustPositions, dustVelocities] = useMemo(() => {
    const pos = new Float32Array(dustCount * 3);
    const vel = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 250;      // X
      pos[i * 3 + 1] = (Math.random() - 0.5) * 250;  // Y
      pos[i * 3 + 2] = -Math.random() * 500;         // Z

      vel[i * 3] = (Math.random() - 0.5) * 0.02;     // VX
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.02; // VY
      vel[i * 3 + 2] = Math.random() * 0.05 + 0.02;  // VZ (slowly drifting forward)
    }

    return [pos, vel];
  }, []);

  // Soft dust texture
  const dustTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(0, 240, 255, 0.4)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Rotate nebula meshes slowly
    if (groupRef.current) {
      groupRef.current.children.forEach((mesh, index) => {
        const cloud = clouds[index];
        if (cloud) {
          mesh.rotation.z = cloud.baseRotation + time * cloud.rotationSpeed;
          // Apply slight slow drift
          mesh.position.y += Math.sin(time * 0.05 + index) * 0.005;
        }
      });
    }

    // Drift dust particles forward
    if (dustRef.current) {
      const geo = dustRef.current.geometry;
      const positions = geo.attributes.position.array;

      for (let i = 0; i < dustCount; i++) {
        // Apply velocity + scroll zoom multiplier
        const scrollFactor = 1.0 + scrollProgress * 15.0;
        positions[i * 3] += dustVelocities[i * 3];
        positions[i * 3 + 1] += dustVelocities[i * 3 + 1];
        positions[i * 3 + 2] += dustVelocities[i * 3 + 2] * scrollFactor;

        // Wrap around camera depth
        if (positions[i * 3 + 2] > 50) {
          positions[i * 3 + 2] = -500;
          positions[i * 3] = (Math.random() - 0.5) * 250;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 250;
        }
      }
      geo.attributes.position.needsUpdate = true;
    }
  });

  const dustGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1000);
    return geo;
  }, [dustPositions]);

  return (
    <>
      {/* Nebula Cloud Planes */}
      <group ref={groupRef}>
        {clouds.map((cloud, idx) => (
          <mesh key={idx} position={cloud.position}>
            <planeGeometry args={[cloud.scale, cloud.scale]} />
            <meshBasicMaterial
              map={cloud.texture}
              transparent
              opacity={cloud.opacity}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>

      {/* Floating Glowing Dust */}
      <points ref={dustRef} geometry={dustGeometry}>
        <pointsMaterial
          size={2.5}
          map={dustTexture}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.6}
        />
      </points>
    </>
  );
};

export default Nebula;
