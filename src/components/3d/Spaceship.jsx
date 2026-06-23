import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Spaceship = ({ scrollProgress = 0 }) => {
  const shipRef = useRef();
  const trailPointsRef = useRef();

  useEffect(() => {
    console.log("Spaceship Loaded");
    if (trailPointsRef.current) {
      trailPointsRef.current.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1000);
    }
  }, []);
  
  // 1. Setup spaceship parameters
  const orbitRadius = 1.56; // Reduced by 40% (2.6 * 0.6)
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

    // Cap delta to prevent NaNs
    const delta = Math.min(0.1, state.delta);

    // 1. Speeds and angular updates
    const scrollBoost = Math.max(0, Math.sin(scrollProgress * Math.PI)) * 3.2;
    const currentSpeed = baseSpeed + scrollBoost;
    data.theta += delta * currentSpeed;

    // 2. Define Position 1: Earth Orbit (Local relative to Earth origin)
    // Earth is positioned at [-3.8, -0.2, 0] to [-7.0, -0.2, 8.0]
    // Since the spaceship is in the same parent group, its local coordinates
    // are relative to the parent group.
    const earthX = -3.8;
    const earthY = -0.2;
    const earthZ = 0;
    const orbitX = earthX + Math.cos(data.theta) * orbitRadius;
    const orbitZ = earthZ + Math.sin(data.theta) * orbitRadius;
    const orbitY = earthY + Math.sin(data.theta * 1.5) * 0.4 - 0.1;
    const posOrbit = new THREE.Vector3(orbitX, orbitY, orbitZ);

    // Define Position 2: Centered Warp (Relative to the camera view)
    // At warp, camera is zoom-moving. The spaceship centers in the viewport
    // centered relative to the scene at [0, -0.85, -2.5] in camera space
    // Let's translate it into world space relative to the camera
    const cam = state.camera;
    cam.updateMatrixWorld();
    const posWarp = new THREE.Vector3(0, -0.85, -3.2).applyMatrix4(cam.matrixWorld);

    // Define Position 3: Portal Hover / Orbit
    // Portal is centered at [0, 0, -6.0]
    const portalRadius = 1.3;
    const portalX = Math.cos(data.theta * 0.8) * portalRadius;
    const portalZ = -6.0 + Math.sin(data.theta * 0.8) * portalRadius;
    const portalY = Math.sin(data.theta * 1.2) * 0.3; // gentle hover wave
    const posPortalOrbit = new THREE.Vector3(portalX, portalY, portalZ);

    // 3. Blend positions based on scroll progress
    let finalPos = new THREE.Vector3();
    let targetLook = new THREE.Vector3();
    let isWarping = false;

    // Thruster scale factors
    let thrusterScale = 1.0;

    if (scrollProgress < 0.20) {
      // Phase 1: Normal Earth Orbit
      finalPos.copy(posOrbit);
      
      const tangentX = -Math.sin(data.theta) * orbitRadius;
      const tangentZ = Math.cos(data.theta) * orbitRadius;
      const tangentY = Math.cos(data.theta * 1.5) * 0.4 * 1.5;
      targetLook.set(orbitX + tangentX, orbitY + tangentY, orbitZ + tangentZ);
    } else if (scrollProgress >= 0.20 && scrollProgress < 0.36) {
      // Transition from Orbit to Warp
      const t = THREE.MathUtils.smoothstep(scrollProgress, 0.20, 0.36);
      finalPos.lerpVectors(posOrbit, posWarp, t);
      
      // Look direction blends to forward (facing away from camera)
      const forwardDir = new THREE.Vector3(0, 0, -5).applyQuaternion(cam.quaternion).add(finalPos);
      const tangentX = -Math.sin(data.theta) * orbitRadius;
      const tangentZ = Math.cos(data.theta) * orbitRadius;
      const tangentY = Math.cos(data.theta * 1.5) * 0.4 * 1.5;
      const orbitLook = new THREE.Vector3(orbitX + tangentX, orbitY + tangentY, orbitZ + tangentZ);
      
      targetLook.lerpVectors(orbitLook, forwardDir, t);
      thrusterScale = 1.0 + t * 4.5; // Fire booster
      isWarping = true;
    } else if (scrollProgress >= 0.36 && scrollProgress < 0.56) {
      // Phase 2: Full Warp (centered in front of camera)
      finalPos.copy(posWarp);
      targetLook.set(0, 0, -5).applyQuaternion(cam.quaternion).add(finalPos);
      thrusterScale = 5.5 + Math.sin(time * 25.0) * 0.5; // Pulsing warp drive
      isWarping = true;
    } else if (scrollProgress >= 0.56 && scrollProgress < 0.68) {
      // Transition from Warp to Portal Orbit
      const t = THREE.MathUtils.smoothstep(scrollProgress, 0.56, 0.68);
      finalPos.lerpVectors(posWarp, posPortalOrbit, t);
      
      const portalTangentX = -Math.sin(data.theta * 0.8) * portalRadius;
      const portalTangentZ = Math.cos(data.theta * 0.8) * portalRadius;
      const portalTangentY = Math.cos(data.theta * 1.2) * 0.3 * 1.2;
      const portalLook = new THREE.Vector3(portalX + portalTangentX, portalY + portalTangentY, portalZ + portalTangentZ);
      const forwardDir = new THREE.Vector3(0, 0, -5).applyQuaternion(cam.quaternion).add(finalPos);

      targetLook.lerpVectors(forwardDir, portalLook, t);
      thrusterScale = 5.5 - t * 4.5; // Decelerate booster
    } else {
      // Phase 3: Portal Orbit Hover
      finalPos.copy(posPortalOrbit);
      
      const portalTangentX = -Math.sin(data.theta * 0.8) * portalRadius;
      const portalTangentZ = Math.cos(data.theta * 0.8) * portalRadius;
      const portalTangentY = Math.cos(data.theta * 1.2) * 0.3 * 1.2;
      targetLook.set(portalX + portalTangentX, portalY + portalTangentY, portalZ + portalTangentZ);
      thrusterScale = 1.0 + Math.sin(time * 5.0) * 0.1;
    }

    // Apply computed position
    if (shipRef.current) {
      shipRef.current.position.copy(finalPos);
      shipRef.current.lookAt(targetLook);

      // Add a slight tilt wobble or screen shake effect during warp
      if (isWarping) {
        // High-frequency vibration
        const jitterX = (Math.random() - 0.5) * 0.015;
        const jitterY = (Math.random() - 0.5) * 0.015;
        shipRef.current.position.x += jitterX;
        shipRef.current.position.y += jitterY;
        
        // Banking alignment straight
        shipRef.current.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.sin(time * 35.0) * 0.05);
      } else {
        // Normal orbital banking tilt
        shipRef.current.rotateOnAxis(new THREE.Vector3(0, 0, 1), 0.5 + Math.sin(time * 2.0) * 0.05);
        shipRef.current.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.sin(time * 5.0) * 0.05);
      }

      // Scale engine thruster cone mesh
      const thrusterMesh = shipRef.current.children[5]; // Flame mesh is index 5
      if (thrusterMesh) {
        thrusterMesh.scale.set(thrusterScale, thrusterScale, thrusterScale);
      }

      // Update engine trail particle buffer
      if (trailPointsRef.current) {
        const geo = trailPointsRef.current.geometry;
        const positions = geo.attributes.position.array;

        // Shift points back
        for (let i = trailLength - 1; i > 0; i--) {
          positions[i * 3] = positions[(i - 1) * 3];
          positions[i * 3 + 1] = positions[(i - 1) * 3 + 1];
          positions[i * 3 + 2] = positions[(i - 1) * 3 + 2];
        }

        // Get absolute world position of thruster
        shipRef.current.updateMatrix();
        shipRef.current.updateMatrixWorld();
        const thrusterOffset = new THREE.Vector3(0, 0, -0.25);
        thrusterOffset.applyMatrix4(shipRef.current.matrixWorld);

        positions[0] = thrusterOffset.x;
        positions[1] = thrusterOffset.y;
        positions[2] = thrusterOffset.z;

        geo.attributes.position.needsUpdate = true;
        
        // Update pointsMaterial size based on warp booster fire
        trailPointsRef.current.material.size = 0.16 * (1.0 + (thrusterScale - 1.0) * 0.5);
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
      {/* Spaceship Model Construction (Sleek sci-fi look) - Scaled down by 40% */}
      <group ref={shipRef} scale={0.6}>
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
