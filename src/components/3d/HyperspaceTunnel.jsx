import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const HyperspaceTunnel = ({ scrollProgress = 0 }) => {
  const tunnelRef = useRef();
  const particlesRef = useRef();
  const lightRef = useRef();

  // 1. Generate energy ring data
  const ringCount = 25;
  const tunnelLength = 250;
  const rings = useMemo(() => {
    const items = [];
    for (let i = 0; i < ringCount; i++) {
      // Space rings evenly along the Z depth
      const z = - (i * (tunnelLength / ringCount));
      const radius = 4.0;
      // Alternate colors: cyan (primary) and purple (secondary)
      const color = i % 2 === 0 ? '#00f0ff' : '#bd00ff';
      items.push({ z, radius, color, phase: Math.random() * Math.PI * 2 });
    }
    return items;
  }, []);

  // 2. High-speed tunnel particles
  const particleCount = 800;
  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const spd = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      // Position particles in a cylindrical distribution
      const theta = Math.random() * Math.PI * 2;
      const r = Math.random() * 1.5 + 2.5; // Cylindrical radius
      pos[i * 3] = Math.cos(theta) * r; // X
      pos[i * 3 + 1] = Math.sin(theta) * r; // Y
      pos[i * 3 + 2] = -Math.random() * tunnelLength; // Z depth

      spd[i] = Math.random() * 35.0 + 25.0; // High speed
    }
    return [pos, spd];
  }, []);

  // Pre-calculate particles boundingSphere for R3F compliance
  const particlesGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 500);
    return geo;
  }, [positions]);

  // Particle texture
  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(0, 240, 255, 0.6)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }, []);

  // 3. Compute bell-curve scroll opacity
  // Transition is active between scrollProgress 0.2 and 0.65
  const getTunnelOpacity = (progress) => {
    if (progress < 0.2 || progress > 0.68) return 0;
    
    // Smoothstep interpolation
    const fadeIn = THREE.MathUtils.smoothstep(progress, 0.2, 0.32);
    const fadeOut = 1.0 - THREE.MathUtils.smoothstep(progress, 0.53, 0.68);
    return fadeIn * fadeOut;
  };

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const opacity = getTunnelOpacity(scrollProgress);

    if (opacity <= 0) {
      if (tunnelRef.current) tunnelRef.current.visible = false;
      return;
    }

    if (tunnelRef.current) tunnelRef.current.visible = true;

    // 1. Move and scale energy rings
    // Speed increases with scrollProgress
    const speedMultiplier = 1.0 + scrollProgress * 18.0;
    const ringSpeed = 40.0 * speedMultiplier * state.delta;

    tunnelRef.current.children.forEach((mesh, index) => {
      // Ignore pointLight if it's the last child
      if (index >= ringCount) return;
      
      mesh.position.z += ringSpeed;

      // Wrap ring back when it passes camera
      if (mesh.position.z > 10) {
        mesh.position.z = -tunnelLength + (mesh.position.z - 10);
      }

      // Ring pulse scale and color pulse
      const ring = rings[index];
      const scale = 1.0 + Math.sin(time * 3 + ring.phase) * 0.05;
      mesh.scale.set(scale, scale, 1.0);
      
      // Update opacity on material
      mesh.material.opacity = opacity * 0.95;
    });

    // 2. Animate particles
    if (particlesRef.current) {
      const geo = particlesRef.current.geometry;
      const posArr = geo.attributes.position.array;
      const speedZ = 65.0 * speedMultiplier * state.delta;

      for (let i = 0; i < particleCount; i++) {
        posArr[i * 3 + 2] += speeds[i] * speedMultiplier * state.delta;
        
        // Wrap particle back to depth
        if (posArr[i * 3 + 2] > 10) {
          posArr[i * 3 + 2] = -tunnelLength;
        }
      }
      geo.attributes.position.needsUpdate = true;
      particlesRef.current.material.opacity = opacity * 0.8;
    }

    // 3. Animate dynamic lighting
    if (lightRef.current) {
      lightRef.current.intensity = (4.0 + Math.sin(time * 15.0) * 1.5) * opacity;
      // Cycle light position along Z to simulate passing through energy cores
      lightRef.current.position.z = -mod(time * 60.0, 80.0);
    }
  });

  const mod = (n, m) => {
    return ((n % m) + m) % m;
  };

  const opacity = getTunnelOpacity(scrollProgress);

  return (
    <group ref={tunnelRef} visible={opacity > 0}>
      {/* 1. Energy Rings List */}
      {rings.map((ring, idx) => (
        <mesh key={idx} position={[0, 0, ring.z]}>
          <torusGeometry args={[ring.radius, 0.04, 8, 48]} />
          <meshBasicMaterial
            color={ring.color}
            transparent
            opacity={opacity * 0.9}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* 2. Fast Traveling Particle Streaks */}
      <points ref={particlesRef} geometry={particlesGeometry}>
        <pointsMaterial
          size={0.25}
          map={particleTexture}
          transparent
          opacity={opacity * 0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* 3. Pulsing Dynamic Core Light */}
      <pointLight
        ref={lightRef}
        color="#00f0ff"
        distance={25}
        decay={2.0}
        position={[0, 0, -5]}
      />
    </group>
  );
};

export default HyperspaceTunnel;
