import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Drone = ({ startPos = [0, 0, 0], speed = 0.5, range = [10, 5], index = 0 }) => {
  const droneRef = useRef();
  
  // Create refs for the 4 propellers so we can spin them on useFrame
  const p1Ref = useRef();
  const p2Ref = useRef();
  const p3Ref = useRef();
  const p4Ref = useRef();

  // Floating phases for flight variance
  const phaseOffset = useMemo(() => index * Math.PI * 0.35, [index]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // 1. Hover / flight animation path (Lissajous figure for natural drift)
    const t = time * speed + phaseOffset;
    const x = startPos[0] + Math.sin(t) * range[0];
    const z = startPos[2] + Math.cos(t) * range[1];
    const y = startPos[1] + Math.sin(time * 2.5 + phaseOffset) * 0.4; // Bobbing height

    if (droneRef.current) {
      droneRef.current.position.set(x, y, z);
      
      // Calculate tangent travel direction for slight banking tilt
      const dx = Math.cos(t) * range[0] * speed;
      const dz = -Math.sin(t) * range[1] * speed;
      
      // Yaw rotation (turn to point in flight direction)
      const targetYaw = Math.atan2(dx, dz);
      droneRef.current.rotation.y = THREE.MathUtils.lerp(droneRef.current.rotation.y, targetYaw, 0.1);
      
      // Banking tilt (pitch and roll proportional to velocity components)
      const targetRoll = -dx * 0.25;
      const targetPitch = dz * 0.15;
      droneRef.current.rotation.z = THREE.MathUtils.lerp(droneRef.current.rotation.z, targetRoll, 0.1);
      droneRef.current.rotation.x = THREE.MathUtils.lerp(droneRef.current.rotation.x, targetPitch, 0.1);
    }

    // 2. Spin props rapidly
    const propSpeed = 25.0;
    if (p1Ref.current) p1Ref.current.rotation.y += propSpeed * state.delta;
    if (p2Ref.current) p2Ref.current.rotation.y += propSpeed * state.delta;
    if (p3Ref.current) p3Ref.current.rotation.y += propSpeed * state.delta;
    if (p4Ref.current) p4Ref.current.rotation.y += propSpeed * state.delta;
  });

  return (
    <group ref={droneRef} position={startPos}>
      {/* Chassis Body */}
      <mesh>
        <boxGeometry args={[0.25, 0.04, 0.25]} />
        <meshStandardMaterial
          color="#1b1d22"
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* Cockpit Core Core Dome */}
      <mesh position={[0, 0.03, 0.05]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial
          color="#00f0ff"
          emissive="#00b4d8"
          emissiveIntensity={1.5}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Propeller Arms */}
      {/* Arm 1 (Front Right) */}
      <mesh position={[0.15, 0.015, 0.15]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.12, 0.015, 0.03]} />
        <meshStandardMaterial color="#1b1d22" roughness={0.4} />
      </mesh>
      {/* Arm 2 (Front Left) */}
      <mesh position={[-0.15, 0.015, 0.15]} rotation={[0, -Math.PI / 4, 0]}>
        <boxGeometry args={[0.12, 0.015, 0.03]} />
        <meshStandardMaterial color="#1b1d22" roughness={0.4} />
      </mesh>
      {/* Arm 3 (Back Right) */}
      <mesh position={[0.15, 0.015, -0.15]} rotation={[0, -Math.PI / 4, 0]}>
        <boxGeometry args={[0.12, 0.015, 0.03]} />
        <meshStandardMaterial color="#1b1d22" roughness={0.4} />
      </mesh>
      {/* Arm 4 (Back Left) */}
      <mesh position={[-0.15, 0.015, -0.15]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.12, 0.015, 0.03]} />
        <meshStandardMaterial color="#1b1d22" roughness={0.4} />
      </mesh>

      {/* Propeller Blades (thin cylinders) */}
      <mesh ref={p1Ref} position={[0.2, 0.035, 0.2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.005, 8]} />
        <meshStandardMaterial color="#333" transparent opacity={0.6} />
      </mesh>
      <mesh ref={p2Ref} position={[-0.2, 0.035, 0.2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.005, 8]} />
        <meshStandardMaterial color="#333" transparent opacity={0.6} />
      </mesh>
      <mesh ref={p3Ref} position={[0.2, 0.035, -0.2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.005, 8]} />
        <meshStandardMaterial color="#333" transparent opacity={0.6} />
      </mesh>
      <mesh ref={p4Ref} position={[-0.2, 0.035, -0.2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.005, 8]} />
        <meshStandardMaterial color="#333" transparent opacity={0.6} />
      </mesh>

      {/* Blinking Navigation Lights */}
      {/* Front Light (Green) */}
      <mesh position={[0, 0, 0.14]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial color="#39ff14" />
      </mesh>

      {/* Rear Light (Blinking Red) */}
      <mesh position={[0, 0, -0.14]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial color="#ff003c" />
      </mesh>
    </group>
  );
};

export default Drone;
