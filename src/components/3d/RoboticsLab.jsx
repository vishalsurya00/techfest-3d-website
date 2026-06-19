import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import Robot from './Robot';
import Terminal from './Terminal';
import HologramPanel from './HologramPanel';
import Drone from './Drone';

// Spark / Steam particles near machinery
const SteamParticles = ({ position = [0, 0, 0], count = 25, labOpacity = 1.0 }) => {
  const pointsRef = useRef();

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.8; // X
      pos[i * 3 + 1] = Math.random() * 2.0;       // Y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.8; // Z
      spd[i] = Math.random() * 0.3 + 0.15;        // Rise speed
    }
    return [pos, spd];
  }, [count]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      const positionsAttr = pointsRef.current.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        // Rise upwards
        positionsAttr[i * 3 + 1] += speeds[i] * delta * 2.0;
        
        // Random horizontal drift
        positionsAttr[i * 3] += (Math.random() - 0.5) * 0.05 * delta;
        positionsAttr[i * 3 + 2] += (Math.random() - 0.5) * 0.05 * delta;

        // Reset if too high
        if (positionsAttr[i * 3 + 1] > 2.5) {
          positionsAttr[i * 3 + 1] = 0.0;
          positionsAttr[i * 3] = (Math.random() - 0.5) * 0.8;
          positionsAttr[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
        }
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#aae5ff"
        transparent
        opacity={labOpacity * 0.25}
        blending={THREE.NormalBlending}
        depthWrite={false}
      />
    </points>
  );
};

// Animated Mechanical Welder Arm
const RoboticArm = ({ position = [0, 0, 0], angleOffset = 0, side = 1, labOpacity = 1.0 }) => {
  const baseRef = useRef();
  const lowerArmRef = useRef();
  const upperArmRef = useRef();
  const sparkLightRef = useRef();
  const [sparking, setSparking] = useState(false);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const t = time * 1.1 + angleOffset;

    // 1. Joint angles
    const baseRot = Math.sin(t * 0.5) * 0.6; // yaw base swing
    const lowerRot = Math.sin(t) * 0.35 - 0.45; // pitch lower segment
    const upperRot = Math.cos(t * 1.2) * 0.4 + 0.6; // pitch upper segment

    if (baseRef.current) baseRef.current.rotation.y = baseRot;
    if (lowerArmRef.current) lowerArmRef.current.rotation.x = lowerRot;
    if (upperArmRef.current) upperArmRef.current.rotation.x = upperRot;

    // 2. Spark light trigger (sparks when welding arm reaches its maximum downward extension)
    const isExtendedDown = Math.sin(t) < -0.8;
    setSparking(isExtendedDown);

    if (sparkLightRef.current) {
      sparkLightRef.current.intensity = isExtendedDown ? (Math.random() * 8.0 + 3.0) * labOpacity : 0;
    }
  });

  return (
    <group position={position}>
      {/* Base Column */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.8, 16]} />
        <meshStandardMaterial color="#1a1d24" roughness={0.35} metalness={0.7} transparent opacity={labOpacity} />
      </mesh>

      {/* Rotating Joint Base */}
      <group ref={baseRef} position={[0, 0.8, 0]}>
        <mesh position={[0, 0.15, 0]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color="#12151b" roughness={0.2} transparent opacity={labOpacity} />
        </mesh>

        {/* Lower Arm Segment */}
        <group ref={lowerArmRef} position={[0, 0.15, 0]}>
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 1.2, 12]} />
            <meshStandardMaterial color="#2d3440" roughness={0.3} metalness={0.8} transparent opacity={labOpacity} />
          </mesh>

          {/* Elbow Joint */}
          <group ref={upperArmRef} position={[0, 1.2, 0]}>
            <mesh>
              <sphereGeometry args={[0.14, 12, 12]} />
              <meshStandardMaterial color="#12151b" roughness={0.2} transparent opacity={labOpacity} />
            </mesh>

            {/* Upper Arm Segment */}
            <mesh position={[0, 0.45, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 0.9, 12]} />
              <meshStandardMaterial color="#2d3440" roughness={0.3} metalness={0.8} transparent opacity={labOpacity} />
            </mesh>

            {/* Welding Head Tool */}
            <group position={[0, 0.9, 0]}>
              <mesh rotation={[0, 0, 0]}>
                <coneGeometry args={[0.07, 0.25, 8]} />
                <meshStandardMaterial color="#0d0f14" roughness={0.4} metalness={0.9} transparent opacity={labOpacity} />
              </mesh>
              
              {/* Welding tip nozzle */}
              <mesh position={[0, 0.15, 0]}>
                <cylinderGeometry args={[0.015, 0.015, 0.1, 8]} />
                <meshStandardMaterial color="#ff7a00" emissive="#ff3c00" emissiveIntensity={sparking ? 2.5 : 0.0} transparent opacity={labOpacity} />
              </mesh>

              {/* Spark glow point light */}
              <pointLight
                ref={sparkLightRef}
                color="#00ffa0"
                distance={6}
                decay={2}
              />
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};

// Main RoboticsLab Component
const RoboticsLab = ({ scrollProgress = 0 }) => {
  const conveyorBoxRef = useRef([]);
  const warningLightRef = useRef();

  // 1. Calculate opacity based on scroll (5-section layout):
  // - Fades in between 0.40 and 0.48
  // - Fades out between 0.60 and 0.74
  const labOpacity = useMemo(() => {
    if (scrollProgress < 0.60) {
      return THREE.MathUtils.smoothstep(scrollProgress, 0.40, 0.48);
    } else {
      return 1.0 - THREE.MathUtils.smoothstep(scrollProgress, 0.60, 0.74);
    }
  }, [scrollProgress]);

  // Terminal metadata definitions
  const terminalData = useMemo(() => [
    {
      title: 'Autonomous Systems',
      description: 'Self-correcting vehicular navigation matrices and machine learning sensory interfaces for drone locomotion.',
      icon: (
        <svg viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="10" stroke="currentColor" strokeWidth="1.5" />
          <path d="M24 14V6M24 42v-8M14 24H6M42 24h-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M8 8l8 8M40 8l-8 8M8 40l8-8M40 40l-8-8" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        </svg>
      )
    },
    {
      title: 'Industrial Robots',
      description: 'Heavy duty multi-axis articulation armatures engineered for micro-millimeter precision welding and assembly.',
      icon: (
        <svg viewBox="0 0 48 48" fill="none">
          <path d="M8 40h32M12 40V24m0 0l16-12 12 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="28" cy="12" r="3" fill="currentColor" />
          <rect x="20" y="28" width="8" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )
    },
    {
      title: 'Medical Robotics',
      description: 'Micro-manipulator teleoperation platforms enabling sub-millimeter surgical accuracy and real-time biometric feedback.',
      icon: (
        <svg viewBox="0 0 48 48" fill="none">
          <path d="M24 8v32M8 24h32" stroke="currentColor" strokeWidth="2.0" strokeLinecap="round" />
          <rect x="18" y="18" width="12" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="24" cy="24" r="2.5" fill="currentColor" />
        </svg>
      )
    }
  ], []);

  // Track conveyor box positions
  const boxOffsets = [0, 5, 10, 15];

  const [activeTerminalId, setActiveTerminalId] = useState(null);
  const [robotActive, setRobotActive] = useState(false);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Conveyor Belt box sliding animation (looping position x)
    boxOffsets.forEach((offset, idx) => {
      const box = conveyorBoxRef.current[idx];
      if (box) {
        // Speed: 1.4 units/sec. Width is 16.0 (-8.0 to 8.0)
        const totalPath = 16.0;
        const speed = 1.6;
        const currentPos = ((time * speed + offset) % totalPath) - (totalPath / 2.0);
        box.position.x = currentPos;
        
        // Bob box slightly based on position to simulate conveyor vibration
        box.position.y = -4.05 + Math.sin(currentPos * 8.0) * 0.012;
      }
    });

    // 2. Warning Light Blinking (Pulse red occasionally)
    if (warningLightRef.current) {
      // Blink twice quickly every 4 seconds
      const cycle = time % 4.0;
      let intensity = 0;
      if ((cycle > 1.0 && cycle < 1.15) || (cycle > 1.3 && cycle < 1.45)) {
        intensity = 4.0 * labOpacity;
      }
      warningLightRef.current.intensity = intensity;
    }
  });

  const handleTerminalClick = (index) => {
    setActiveTerminalId(index === activeTerminalId ? null : index);
  };

  if (labOpacity <= 0) return null;

  return (
    <group>
      {/* Dynamic Lab Lights */}
      {/* Blue Ambient / Top Fill light */}
      <directionalLight
        position={[0, 12, -120]}
        color="#0080ff"
        intensity={2.8 * labOpacity}
      />
      <pointLight
        position={[0, 5, -120]}
        color="#00ffff"
        intensity={4.0 * labOpacity}
        distance={35}
        decay={2}
      />

      {/* Red Warning Beacon */}
      <pointLight
        ref={warningLightRef}
        position={[0, 4.5, -128]}
        color="#ff0000"
        distance={25}
        decay={2.0}
      />
      
      {/* Red Warning Beacon Mesh */}
      <mesh position={[0, 4.5, -128.1]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial
          color="#ff0000"
          transparent
          opacity={labOpacity}
        />
      </mesh>

      {/* 1. Metallic Floor Slab */}
      <mesh position={[0, -4.8, -120]} receiveShadow>
        <boxGeometry args={[32, 0.4, 30]} />
        <meshStandardMaterial
          color="#151922"
          roughness={0.22}
          metalness={0.85}
          transparent
          opacity={labOpacity}
        />
      </mesh>

      {/* Floor Grid Accents (Basic grid lines) */}
      <gridHelper
        args={[30, 15, '#00ffa0', '#202b3c']}
        position={[0, -4.58, -120]}
        rotation={[0, 0, 0]}
        transparent
        opacity={labOpacity * 0.15}
      />

      {/* 2. Robotic Arms */}
      <RoboticArm position={[-6.2, -4.6, -125]} angleOffset={0} side={-1} labOpacity={labOpacity} />
      <RoboticArm position={[6.2, -4.6, -125]} angleOffset={Math.PI} side={1} labOpacity={labOpacity} />

      {/* 3. Conveyor Belt Assembly (at the back wall) */}
      <group position={[0, 0, -127]}>
        {/* Conveyor Bed Slab */}
        <mesh position={[0, -4.2, 0]}>
          <boxGeometry args={[16.2, 0.15, 0.7]} />
          <meshStandardMaterial color="#0d0f14" roughness={0.4} metalness={0.9} transparent opacity={labOpacity} />
        </mesh>
        
        {/* Conveyor Bed Supports */}
        <mesh position={[-6.0, -4.5, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.5]} />
          <meshStandardMaterial color="#1a1c22" transparent opacity={labOpacity} />
        </mesh>
        <mesh position={[6.0, -4.5, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.5]} />
          <meshStandardMaterial color="#1a1c22" transparent opacity={labOpacity} />
        </mesh>
        <mesh position={[0, -4.5, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.5]} />
          <meshStandardMaterial color="#1a1c22" transparent opacity={labOpacity} />
        </mesh>

        {/* Sliding box items on the belt */}
        {boxOffsets.map((offset, idx) => (
          <mesh
            key={idx}
            ref={(el) => (conveyorBoxRef.current[idx] = el)}
            position={[0, -4.05, 0]}
          >
            <boxGeometry args={[0.42, 0.28, 0.42]} />
            <meshStandardMaterial
              color={idx % 2 === 0 ? '#ff7a00' : '#2d3440'}
              roughness={0.3}
              metalness={0.7}
              transparent
              opacity={labOpacity}
            />
          </mesh>
        ))}
      </group>

      {/* 4. Generator Machinery Panels on Back Wall */}
      <mesh position={[-9.0, -3.8, -127]}>
        <boxGeometry args={[1.5, 1.2, 0.8]} />
        <meshStandardMaterial color="#1c202c" roughness={0.3} transparent opacity={labOpacity} />
      </mesh>
      
      <mesh position={[9.0, -3.8, -127]}>
        <boxGeometry args={[1.5, 1.2, 0.8]} />
        <meshStandardMaterial color="#1c202c" roughness={0.3} transparent opacity={labOpacity} />
      </mesh>

      {/* 5. Glowing Power Cables running along back wall */}
      <mesh position={[0, -4.52, -124]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.035, 0.035, 12, 8]} />
        <meshStandardMaterial
          color="#00ffa0"
          emissive="#00ffa0"
          emissiveIntensity={1.0}
          transparent
          opacity={labOpacity * 0.8}
        />
      </mesh>

      {/* 6. Smoke / Steam effects near generators */}
      <SteamParticles position={[-9.0, -3.2, -126.5]} count={20} labOpacity={labOpacity} />
      <SteamParticles position={[9.0, -3.2, -126.5]} count={20} labOpacity={labOpacity} />

      {/* 7. Center Humanoid Robot */}
      <Robot
        position={[0, -1.8, -120]}
        active={robotActive}
        onClick={() => setRobotActive(!robotActive)}
        onClose={() => setRobotActive(false)}
        labOpacity={labOpacity}
      />

      {/* 8. Patrolling Drones */}
      <Drone startPos={[-6, 1.2, -116]} speed={0.45} range={[4, 3]} index={4} />
      <Drone startPos={[6, 0.8, -124]} speed={0.5} range={[3, 5]} index={5} />

      {/* 9. Interactive Holographic Terminals (arranged in semi-circle) */}
      <Terminal
        index={0}
        name="Autonomous Systems"
        color="#00ffa0"
        position={[-3.6, -3.4, -116.5]}
        activeTerminalId={activeTerminalId}
        onClick={handleTerminalClick}
        labOpacity={labOpacity}
      />
      <Terminal
        index={1}
        name="Industrial Robots"
        color="#00ffa0"
        position={[0, -3.4, -115.0]}
        activeTerminalId={activeTerminalId}
        onClick={handleTerminalClick}
        labOpacity={labOpacity}
      />
      <Terminal
        index={2}
        name="Medical Robotics"
        color="#00ffa0"
        position={[3.6, -3.4, -116.5]}
        activeTerminalId={activeTerminalId}
        onClick={handleTerminalClick}
        labOpacity={labOpacity}
      />

      {/* 10. Hologram detail panel floating above active terminal */}
      {activeTerminalId !== null && (
        <Html
          position={
            activeTerminalId === 0
              ? [-3.6, -2.4, -116.5]
              : activeTerminalId === 1
              ? [0, -2.4, -115.0]
              : [3.6, -2.4, -116.5]
          }
          center
          distanceFactor={12}
        >
          <HologramPanel
            node={terminalData[activeTerminalId]}
            onClose={() => setActiveTerminalId(null)}
          />
        </Html>
      )}

    </group>
  );
};

export default RoboticsLab;
