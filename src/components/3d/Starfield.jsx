import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Starfield = ({ scrollProgress = 0 }) => {
  const pointsRef = useRef();

  useEffect(() => {
    if (pointsRef.current) {
      pointsRef.current.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1000);
    }
  }, []);

  // Create initial star positions and random offsets
  const count = 3500;
  const [positions, speeds, phases] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const phs = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Distribute stars in a cylinder/box around the Z axis
      pos[i * 3] = (Math.random() - 0.5) * 600; // X
      pos[i * 3 + 1] = (Math.random() - 0.5) * 600; // Y
      pos[i * 3 + 2] = -Math.random() * 1000; // Z depth

      spd[i] = Math.random() * 0.8 + 0.2; // Base speed variation
      phs[i] = Math.random() * Math.PI * 2; // Twinkle phase
    }
    return [pos, spd, phs];
  }, []);

  // Custom Shader Material uniforms
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uWarpSpeed: { value: 0 },
      uScrollProgress: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    if (!pointsRef.current) return;

    const { clock } = state;
    const time = clock.getElapsedTime();

    // Warp speed peaks at 0.5 scroll progress, then slows to a stop at 1.0 (arrival at portal)
    const warpIntensity = Math.sin(scrollProgress * Math.PI);
    const targetWarp = warpIntensity * 40.0;
    
    uniforms.uWarpSpeed.value += (targetWarp - uniforms.uWarpSpeed.value) * 0.08;
    uniforms.uScrollProgress.value = scrollProgress;
    uniforms.uTime.value = time;
  });

  // Shader definition
  const starShader = useMemo(() => {
    return {
      vertexShader: `
        uniform float uTime;
        uniform float uWarpSpeed;
        uniform float uScrollProgress;
        attribute float aSpeed;
        attribute float aPhase;
        varying float vAlpha;
        varying vec3 vColor;
        varying float vWarpSpeed;

        void main() {
          vec3 pos = position;
          vWarpSpeed = uWarpSpeed;
          
          // Calculate movement. Speed is base speed + warp multiplier
          float speedFactor = 1.0 + uWarpSpeed;
          
          // Move Z forward and wrap around depth limit
          float zOffset = uTime * 20.0 * speedFactor;
          pos.z = mod(pos.z + zOffset, 1000.0) - 1000.0;
          
          // Stars spread outwards as they zoom closer to camera
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          // Twinkle logic
          float twinkle = 0.6 + 0.4 * sin(uTime * 3.0 + aPhase);
          
          // Point size: scale up during warp to create streak effect
          float baseSize = 1.6;
          gl_PointSize = baseSize * (1.0 + uWarpSpeed * 0.4) * (300.0 / -mvPosition.z);
          
          // Alpha fadeout: fade in at distance, fade out very close to camera
          vAlpha = smoothstep(-1000.0, -800.0, pos.z) * smoothstep(-10.0, -150.0, pos.z) * twinkle;
          
          // Star color variations (white, electric blue, soft purple)
          float colorRandom = sin(aPhase);
          if (colorRandom > 0.4) {
            vColor = vec3(0.7, 0.9, 1.0); // Soft Cyan
          } else if (colorRandom < -0.4) {
            vColor = vec3(0.9, 0.8, 1.0); // Soft Purple
          } else {
            vColor = vec3(1.0, 1.0, 1.0); // Pure White
          }
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        varying vec3 vColor;
        varying float vWarpSpeed;

        void main() {
          // Circular point texture rendering, stretched during warp speed
          vec2 coord = gl_PointCoord - vec2(0.5);
          
          // Squeeze horizontally to stretch vertically (creating vertical light streaks)
          coord.x *= (1.0 + vWarpSpeed * 1.5);
          
          float dist = length(coord);
          if (dist > 0.5) discard;
          
          // Soft radial falloff for glowing look
          float intensity = smoothstep(0.5, 0.0, dist);
          
          gl_FragColor = vec4(vColor, intensity * vAlpha);
        }
      `,
    };
  }, []);

  const starGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1000);
    return geo;
  }, [positions, speeds, phases]);

  return (
    <points ref={pointsRef} geometry={starGeometry}>
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={starShader.vertexShader}
        fragmentShader={starShader.fragmentShader}
        uniforms={uniforms}
      />
    </points>
  );
};

export default Starfield;
