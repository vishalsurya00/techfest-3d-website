import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const EnergyBeam = ({ start, end, color = '#bd00ff', radius = 0.02, speed = 1.5 }) => {
  const lineRef = useRef();
  const sphereRefs = useRef([React.createRef(), React.createRef(), React.createRef()]);

  const startVec = useMemo(() => new THREE.Vector3(...start), [start]);
  const endVec = useMemo(() => new THREE.Vector3(...end), [end]);

  // Cylinder positioning math
  const [position, rotation, length] = useMemo(() => {
    // Position: midpoint between start and end
    const pos = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
    
    // Length: distance between points
    const len = startVec.distanceTo(endVec);
    
    // Rotation: calculate quaternion to align cylinder along the vector direction
    const direction = new THREE.Vector3().subVectors(endVec, startVec).normalize();
    const up = new THREE.Vector3(0, 1, 0); // Cylinder's default axis is Y
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
    const rot = new THREE.Euler().setFromQuaternion(quaternion);

    return [pos.toArray(), rot.toArray(), len];
  }, [startVec, endVec]);

  // Traveling pulses positions updating
  useFrame((state) => {
    const time = state.clock.getElapsedTime() * speed;

    sphereRefs.current.forEach((ref, index) => {
      if (ref.current) {
        // Offset each pulse by 1/3 of the loop length
        const progress = (time + index / 3.0) % 1.0;
        
        // Lerp position from center (start) to island (end)
        ref.current.position.lerpVectors(startVec, endVec, progress);
      }
    });
  });

  return (
    <group>
      {/* Thin glowing beam line cylinder */}
      <mesh
        ref={lineRef}
        position={position}
        rotation={new THREE.Euler(...rotation.slice(0, 3))}
      >
        <cylinderGeometry args={[radius, radius, length, 6, 1, true]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 3 Traveling glowing energy pulses */}
      {sphereRefs.current.map((ref, idx) => (
        <mesh ref={ref} key={idx}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
};

export default EnergyBeam;
