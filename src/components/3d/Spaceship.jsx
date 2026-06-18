import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Spaceship = ({ scrollProgress = 0 }) => {
  const shipRef = useRef();
  const trailPointsRef = useRef();

  useEffect(() => {
    if (trailPointsRef.current) {
      trailPointsRef.current.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1000);
    }
  }, []);
  
  // 1. Setup spaceship parameters
  const orbitRadius = 2.6;
  const baseSpeed = 0.6;
  
  // 2. Engine trail configurations
  const trailLength = 50;
  const [trailPositions, trailAges] = useMemo(() => {
    const pos = new Float32Array(trailLength * 3);
    const age = new Float32Array(trailLength);
    // Initialize points off-screen or at origin
    for (let i = 0; i < trailLength; i++) {
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;
      age[i] = i / trailLength; // Normalized age (0 = newest, 1 = oldest)
    }
    return [pos, age];
  }, []);

  const trailTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(0, 240, 255, 1.0)');
    grad.addColorStop(0.3, 'rgba(189, 0, 255, 0.5)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }, []);

  // Track theta angle
  const stateRef = useRef({ theta: 0 });

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const data = stateRef.current;

    // 1. Calculate speed based on scroll
    // Spaceship boosts briefly when user scrolls (bell-curve peak acceleration)
    const scrollBoost = Math.max(0, Math.sin(scrollProgress * Math.PI)) * 2.8;
    const currentSpeed = baseSpeed + scrollBoost;
    
    // Accumulate orbit angle
    data.theta += state.delta * currentSpeed;

    // 2. Calculate orbit coordinates relative to Earth origin
    // We add a tilt to the orbit plane (Y variance) so it feels multi-dimensional
    const x = Math.cos(data.theta) * orbitRadius;
    const z = Math.sin(data.theta) * orbitRadius;
    const y = Math.sin(data.theta * 1.5) * 0.4 - 0.1; // Slightly angled

    if (shipRef.current) {
      shipRef.current.position.set(x, y, z);

      // 3. Orient spaceship along travel vector (tangent of orbit)
      const tangentX = -Math.sin(data.theta) * orbitRadius;
      const tangentZ = Math.cos(data.theta) * orbitRadius;
      const tangentY = Math.cos(data.theta * 1.5) * 0.4 * 1.5;

      const targetPos = new THREE.Vector3(x + tangentX, y + tangentY, z + tangentZ);
      shipRef.current.lookAt(targetPos);

      // 4. Banking (Roll) tilt
      // Tilt (roll) into the center of orbit (Earth is at 0, 0, 0)
      // The roll angle is determined by speed and current orientation
      shipRef.current.rotateOnAxis(new THREE.Vector3(0, 0, 1), 0.5 + Math.sin(time * 2) * 0.05);
      
      // Pitch/Wobble adjustment for game-like turbulence
      shipRef.current.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.sin(time * 5) * 0.05);

      // 5. Update engine trail particle buffer
      if (trailPointsRef.current) {
        const geo = trailPointsRef.current.geometry;
        const positions = geo.attributes.position.array;

        // Shift all points back
        for (let i = trailLength - 1; i > 0; i--) {
          positions[i * 3] = positions[(i - 1) * 3];
          positions[i * 3 + 1] = positions[(i - 1) * 3 + 1];
          positions[i * 3 + 2] = positions[(i - 1) * 3 + 2];
        }

        // Force update the matrix so world position is accurate and non-NaN
        shipRef.current.updateMatrix();
        shipRef.current.updateMatrixWorld();
        
        // Get absolute world position of thruster (back of the ship)
        const thrusterOffset = new THREE.Vector3(0, 0, -0.25);
        thrusterOffset.applyMatrix4(shipRef.current.matrixWorld);
        
        // Add current thruster position at head of trail
        positions[0] = thrusterOffset.x;
        positions[1] = thrusterOffset.y;
        positions[2] = thrusterOffset.z;

        geo.attributes.position.needsUpdate = true;
      }
    }
  });

  const trailGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1000);
    return geo;
  }, [trailPositions]);

  return (
    <group>
      {/* Spaceship Model Construction (Sleek sci-fi look) */}
      <group ref={shipRef}>
        {/* Cockpit */}
        <mesh position={[0, 0.03, 0.05]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial
            color="#00f0ff"
            roughness={0.1}
            metalness={0.9}
            emissive="#00b4d8"
            emissiveIntensity={1.5}
          />
        </mesh>

        {/* Main Body (sleek fuselage) */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.06, 0.4, 16]} />
          <meshStandardMaterial
            color="#1d152a"
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        {/* Nose Cone */}
        <mesh position={[0, 0, 0.23]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.02, 0.06, 16]} />
          <meshStandardMaterial
            color="#00f0ff"
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>

        {/* Right Wing */}
        <mesh position={[0.13, -0.01, -0.05]} rotation={[0, -0.2, -0.15]}>
          <boxGeometry args={[0.22, 0.015, 0.1]} />
          <meshStandardMaterial
            color="#2a004f"
            roughness={0.25}
            metalness={0.75}
          />
        </mesh>
        
        {/* Left Wing */}
        <mesh position={[-0.13, -0.01, -0.05]} rotation={[0, 0.2, 0.15]}>
          <boxGeometry args={[0.22, 0.015, 0.1]} />
          <meshStandardMaterial
            color="#2a004f"
            roughness={0.25}
            metalness={0.75}
          />
        </mesh>

        {/* Engine Thruster Flame (Pulsing cone) */}
        <mesh position={[0, 0, -0.22]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.025, 0.08, 8]} />
          <meshBasicMaterial
            color="#00f0ff"
          />
        </mesh>
      </group>

      {/* Engine Exhaust Trail */}
      <points ref={trailPointsRef} geometry={trailGeometry}>
        <pointsMaterial
          size={0.16}
          map={trailTexture}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.8}
        />
      </points>
    </group>
  );
};

export default Spaceship;
