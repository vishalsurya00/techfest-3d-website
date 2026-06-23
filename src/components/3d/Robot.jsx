import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Robot = ({
  position = [0, -1.8, -120],
  active = false,
  onClick,
  onClose,
  labOpacity = 1.0,
}) => {
  const robotGroupRef = useRef();
  const bodyGroupRef = useRef();
  const headRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const scanlineRef = useRef();
  
  const eyeLMatRef = useRef();
  const eyeRMatRef = useRef();

  const [hovered, setHovered] = useState(false);

  // Smooth transitions refs
  const hoverFactor = useRef(0.0);
  const eyeGlowFactor = useRef(1.0);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Idle Breathing Animation (Subtle bobbing & head tilt)
    if (bodyGroupRef.current) {
      bodyGroupRef.current.position.y = Math.sin(time * 1.8) * 0.06;
      bodyGroupRef.current.rotation.z = Math.sin(time * 0.9) * 0.015;
    }

    // 2. Head Follows Mouse Movement (Look-At effect)
    // state.pointer coordinates are normalized screen coordinates [-1, 1]
    if (headRef.current) {
      const targetYaw = state.pointer.x * 0.5; // yaw angle max 30 degrees
      const targetPitch = state.pointer.y * 0.3; // pitch angle max 18 degrees
      
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetYaw, delta * 3.5);
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -targetPitch, delta * 3.5);
    }

    // 3. Autonomous Arm Movement (subtle twitching / adjustments every few seconds)
    if (leftArmRef.current && rightArmRef.current) {
      // Natural slow swing
      const baseSwingL = Math.sin(time * 0.6) * 0.05;
      const baseSwingR = Math.cos(time * 0.6) * 0.05;
      
      // Random arm twitches (adds life)
      const twitchL = Math.sin(time * 5.0) * (Math.sin(time * 0.1) > 0.88 ? 0.06 : 0.0);
      const twitchR = Math.cos(time * 4.8) * (Math.sin(time * 0.08) > 0.88 ? 0.06 : 0.0);

      leftArmRef.current.rotation.x = baseSwingL + twitchL;
      rightArmRef.current.rotation.x = baseSwingR + twitchR;
    }

    // 4. Animate Holographic Scan Cylinder (bobbing up/down scan sweep)
    if (scanlineRef.current) {
      scanlineRef.current.rotation.y = time * 0.8;
      // Scroll scanlines vertically
      scanlineRef.current.position.y = Math.sin(time * 2.5) * 1.0;
    }

    // 5. Lerp hover properties
    const targetHover = hovered ? 1.0 : 0.0;
    hoverFactor.current = THREE.MathUtils.lerp(hoverFactor.current, targetHover, delta * 6.0);

    const targetEyeGlow = hovered ? 3.0 : (active ? 2.0 : 1.2);
    eyeGlowFactor.current = THREE.MathUtils.lerp(eyeGlowFactor.current, targetEyeGlow, delta * 6.0);

    if (eyeLMatRef.current && eyeRMatRef.current) {
      eyeLMatRef.current.emissiveIntensity = eyeGlowFactor.current;
      eyeRMatRef.current.emissiveIntensity = eyeGlowFactor.current;
    }
  });



  return (
    <group ref={robotGroupRef} position={position}>
      
      {/* ROBOT MODEL (Futuristic industrial styling) */}
      <group
        ref={bodyGroupRef}
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
          onClick();
        }}
      >
        {/* Support Stand Base (heavy cyber column) */}
        <mesh position={[0, -1.2, 0]}>
          <cylinderGeometry args={[0.2, 0.25, 0.8, 16]} />
          <meshStandardMaterial
            color="#121620"
            roughness={0.4}
            metalness={0.8}
            transparent
            opacity={labOpacity}
          />
        </mesh>
        
        <mesh position={[0, -1.55, 0]}>
          <cylinderGeometry args={[0.55, 0.6, 0.1, 16]} />
          <meshStandardMaterial
            color="#1c202c"
            roughness={0.3}
            metalness={0.7}
            transparent
            opacity={labOpacity}
          />
        </mesh>

        {/* Torso / Chest */}
        <mesh position={[0, -0.4, 0]}>
          <boxGeometry args={[0.55, 0.7, 0.45]} />
          <meshStandardMaterial
            color="#1c202c"
            roughness={0.25}
            metalness={0.78}
            transparent
            opacity={labOpacity}
          />
        </mesh>

        {/* Chest Accent Light bar */}
        <mesh position={[0, -0.28, 0.23]}>
          <boxGeometry args={[0.26, 0.03, 0.02]} />
          <meshStandardMaterial
            color="#00f0ff"
            emissive="#00f0ff"
            emissiveIntensity={hovered ? 2.5 : 1.2}
            transparent
            opacity={labOpacity}
          />
        </mesh>

        {/* Head Assembly */}
        <group ref={headRef} position={[0, 0.18, 0]}>
          {/* Neck */}
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 0.15, 12]} />
            <meshStandardMaterial
              color="#0d0f14"
              roughness={0.5}
              metalness={0.9}
              transparent
              opacity={labOpacity}
            />
          </mesh>

          {/* Head Sphere */}
          <mesh position={[0, 0.08, 0]}>
            <sphereGeometry args={[0.23, 32, 32]} />
            <meshStandardMaterial
              color="#1c202c"
              roughness={0.2}
              metalness={0.8}
              transparent
              opacity={labOpacity}
            />
          </mesh>

          {/* Glowing Eyes (Blue emissive) */}
          {/* Left Eye */}
          <mesh position={[-0.08, 0.12, 0.19]}>
            <sphereGeometry args={[0.032, 16, 16]} />
            <meshStandardMaterial
              ref={eyeLMatRef}
              color="#00f0ff"
              emissive="#00f0ff"
              emissiveIntensity={1.2}
              transparent
              opacity={labOpacity}
            />
          </mesh>
          
          {/* Right Eye */}
          <mesh position={[0.08, 0.12, 0.19]}>
            <sphereGeometry args={[0.032, 16, 16]} />
            <meshStandardMaterial
              ref={eyeRMatRef}
              color="#00f0ff"
              emissive="#00f0ff"
              emissiveIntensity={1.2}
              transparent
              opacity={labOpacity}
            />
          </mesh>

          {/* Head Antenna */}
          <mesh position={[0, 0.34, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.16, 8]} />
            <meshStandardMaterial
              color="#00f0ff"
              transparent
              opacity={labOpacity}
            />
          </mesh>
          
          <mesh position={[0, 0.42, 0]}>
            <sphereGeometry args={[0.016, 8, 8]} />
            <meshBasicMaterial
              color="#00f0ff"
              transparent
              opacity={labOpacity}
            />
          </mesh>
        </group>

        {/* Arms Assembly */}
        {/* Left Shoulder */}
        <mesh position={[-0.34, -0.15, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial
            color="#0d0f14"
            roughness={0.3}
            transparent
            opacity={labOpacity}
          />
        </mesh>
        
        {/* Left Arm Group */}
        <group ref={leftArmRef} position={[-0.34, -0.15, 0]}>
          <mesh position={[0, -0.26, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.45, 12]} />
            <meshStandardMaterial
              color="#1c202c"
              roughness={0.3}
              metalness={0.7}
              transparent
              opacity={labOpacity}
            />
          </mesh>
          <mesh position={[0, -0.52, 0]}>
            <sphereGeometry args={[0.055, 12, 12]} />
            <meshStandardMaterial
              color="#0d0f14"
              roughness={0.3}
              transparent
              opacity={labOpacity}
            />
          </mesh>
        </group>

        {/* Right Shoulder */}
        <mesh position={[0.34, -0.15, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial
            color="#0d0f14"
            roughness={0.3}
            transparent
            opacity={labOpacity}
          />
        </mesh>
        
        {/* Right Arm Group */}
        <group ref={rightArmRef} position={[0.34, -0.15, 0]}>
          <mesh position={[0, -0.26, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.45, 12]} />
            <meshStandardMaterial
              color="#1c202c"
              roughness={0.3}
              metalness={0.7}
              transparent
              opacity={labOpacity}
            />
          </mesh>
          <mesh position={[0, -0.52, 0]}>
            <sphereGeometry args={[0.055, 12, 12]} />
            <meshStandardMaterial
              color="#0d0f14"
              roughness={0.3}
              transparent
              opacity={labOpacity}
            />
          </mesh>
        </group>
      </group>

      {/* 2. Holographic Scan Cylinder (Appears & slides vertically on hover) */}
      {hovered && (
        <group ref={scanlineRef}>
          {/* Scan laser ring */}
          <mesh>
            <cylinderGeometry args={[0.82, 0.82, 0.015, 24, 1, true]} />
            <meshBasicMaterial
              color="#00f0ff"
              transparent
              opacity={labOpacity * 0.5}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Faint grid volume */}
          <mesh position={[0, -0.4, 0]}>
            <cylinderGeometry args={[0.8, 0.8, 0.8, 24, 6, true]} />
            <meshBasicMaterial
              color="#00f0ff"
              wireframe
              transparent
              opacity={labOpacity * 0.08}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}


    </group>
  );
};

export default Robot;
