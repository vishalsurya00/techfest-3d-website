import React, { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import Drone from './Drone';
import Hologram from './Hologram';
import EnergyRoad from './EnergyRoad';
import AICore from './AICore';


const AICity = ({ scrollProgress = 0, activeNodeId = null, setActiveNodeId }) => {
  useEffect(() => {
    console.log("AI City Loaded");
  }, []);
  // 1. Calculate opacity fade-in and fade-out based on scroll progress
  const cityOpacity = useMemo(() => {
    const fadeIn = THREE.MathUtils.smoothstep(scrollProgress, 0.1667, 0.20);
    const fadeOut = 1.0 - THREE.MathUtils.smoothstep(scrollProgress, 0.28, 0.3333);
    return fadeIn * fadeOut;
  }, [scrollProgress]);

  // 2. Generate building grid parameters (runs unconditionally before any returns)
  const gridSize = 6;
  const buildings = useMemo(() => {
    const list = [];
    const colors = ['#00f0ff', '#bd00ff', '#ff007a'];
    
    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        // Leave the center empty for a central energy beacon and hologram pad
        if (x >= 2 && x <= 3 && z >= 2 && z <= 3) continue;

        // Skip random slots to make layout organic
        if (Math.random() > 0.82) continue;

        const posX = (x - (gridSize - 1) / 2) * 5.8;
        const posZ = -60 + (z - (gridSize - 1) / 2) * 5.8;
        
        // Random building heights and widths
        const height = Math.random() * 7.5 + 3.0;
        const width = Math.random() * 0.5 + 1.2;
        const depth = Math.random() * 0.5 + 1.2;
        
        // Pick a window glow color scheme
        const color = colors[(x + z) % colors.length];

        list.push({
          id: `${x}-${z}`,
          position: [posX, height / 2 - 9.0, posZ], // Shift down relative to horizon
          size: [width, height, depth],
          color,
          height,
          // Blinking rate phase
          blinkPhase: Math.random() * Math.PI * 2,
        });
      }
    }
    return list;
  }, []);

  // 3. Skyscraper material with procedural window grid shader
  const skyscraperMaterial = (colorHex, blinkPhase) => {
    const color = new THREE.Color(colorHex);
    return new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: color },
        uOpacity: { value: cityOpacity },
        uBlinkPhase: { value: blinkPhase },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;

        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uOpacity;
        uniform float uBlinkPhase;
        varying vec2 vUv;
        varying vec3 vNormal;

        void main() {
          // Dark metallic body color base
          vec3 baseColor = vec3(0.04, 0.02, 0.08);

          // 1. Draw glowing grid of office windows
          // Repeat X 6 times, Y based on vertical scaling
          float gridX = sin(vUv.x * 24.0) * 0.5 + 0.5;
          float gridY = sin(vUv.y * 36.0) * 0.5 + 0.5;
          
          // Step grid to create square window slots
          float windowMask = step(0.78, gridX) * step(0.78, gridY);

          // Filter windows: top and bottom borders have no windows
          if (vUv.y > 0.94 || vUv.y < 0.06) {
            windowMask = 0.0;
          }

          // 2. Slow blinking window animations
          float blink = 0.75 + 0.25 * sin(uTime * 1.5 + uBlinkPhase);
          vec3 windowColor = uColor * blink;

          // 3. Highlight side trims (structural neon stripes)
          float edgeStripe = step(0.97, vUv.x) + step(vUv.x, 0.03);
          vec3 trimColor = uColor * 1.3;

          // Mix base building color with neon windows and side stripes
          vec3 finalColor = mix(baseColor, windowColor, windowMask * 0.55);
          finalColor = mix(finalColor, trimColor, edgeStripe * 0.7);

          // 4. Subtle lighting height-based gradient fade
          finalColor *= (0.4 + vUv.y * 0.6);

          gl_FragColor = vec4(finalColor, uOpacity);
        }
      `
    });
  };

  // Update uTime in materials (sharing a hook is easier, but standard update works)
  const materialRefs = [];
  const addMaterialRef = (mat) => {
    if (mat && !materialRefs.includes(mat)) {
      materialRefs.push(mat);
    }
  };

  const handleFrameUpdate = (time) => {
    materialRefs.forEach((mat) => {
      if (mat.uniforms && mat.uniforms.uTime) {
        mat.uniforms.uTime.value = time;
        mat.uniforms.uOpacity.value = cityOpacity;
      }
    });
  };

  // Early return ONLY right before the actual JSX return to satisfy React Hooks execution order rules
  if (cityOpacity <= 0) return null;

  return (
    <group>
      {/* Frame updater that injects uTime into building materials */}
      <FrameUpdater onUpdate={handleFrameUpdate} />

      {/* 1. Base Platform (Gigantic floating slab) */}
      <mesh position={[0, -9.3, -60]}>
        <cylinderGeometry args={[20, 21, 0.6, 6]} />
        <meshStandardMaterial
          color="#080412"
          roughness={0.4}
          metalness={0.9}
          transparent
          opacity={cityOpacity}
        />
      </mesh>
      
      {/* Platform glowing edge border */}
      <mesh position={[0, -9.0, -60]}>
        <cylinderGeometry args={[20.05, 20.05, 0.1, 6, 1, true]} />
        <meshBasicMaterial
          color="#bd00ff"
          transparent
          opacity={cityOpacity * 0.7}
        />
      </mesh>

      {/* 2. Procedural Building Grid */}
      {buildings.map((building) => {
        const mat = skyscraperMaterial(building.color, building.blinkPhase);
        addMaterialRef(mat);
        return (
          <mesh
            key={building.id}
            position={building.position}
            castShadow
            receiveShadow
          >
            <boxGeometry args={building.size} />
            <primitive object={mat} attach="material" />
          </mesh>
        );
      })}

      {/* 3. Center Energy Beacon (Vertical beams rising from core) */}
      <mesh position={[0, 11.0, -60]}>
        <cylinderGeometry args={[0.16, 0.16, 40, 8, 1, true]} />
        <meshBasicMaterial
          color="#00f0ff"
          transparent
          opacity={cityOpacity * 0.45}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      <mesh position={[0, 11.0, -60]}>
        <cylinderGeometry args={[0.06, 0.06, 40, 8, 1, true]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={cityOpacity * 0.75}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 4. Skyscraper Holograms */}
      <Hologram position={[-5.8, 1.2, -66]} scale={1.2} type="knot" color="#ff007a" />
      <Hologram position={[5.8, -1.8, -54]} scale={0.9} type="sphere" color="#00f0ff" />
      
      {/* 5. Center Interactive AI Core (Glowing sphere, orbiting nodes, info panels) */}
      <AICore position={[0, -4.5, -60]} cityOpacity={cityOpacity} activeNodeId={activeNodeId} setActiveNodeId={setActiveNodeId} />

      {/* 5. Energy Roads Grid */}
      <EnergyRoad start={[-5.8, -1.0, -66]} end={[5.8, -1.0, -66]} color="#ff007a" />
      <EnergyRoad start={[5.8, -3.0, -66]} end={[5.8, -3.0, -54]} color="#00f0ff" />
      <EnergyRoad start={[-5.8, -5.0, -54]} end={[-5.8, -5.0, -66]} color="#bd00ff" />
      <EnergyRoad start={[-5.8, -4.0, -54]} end={[5.8, -4.0, -54]} color="#00f0ff" />

      {/* 6. Flying City Drones */}
      <Drone startPos={[-10, 0, -50]} speed={0.4} range={[8, 4]} index={1} />
      <Drone startPos={[10, 3, -70]} speed={0.6} range={[6, 8]} index={2} />
      <Drone startPos={[-2, -2, -58]} speed={0.5} range={[12, 3]} index={3} />
    </group>
  );
};

const FrameUpdater = ({ onUpdate }) => {
  useFrame((state) => {
    onUpdate(state.clock.getElapsedTime());
  });
  return null;
};

export default AICity;
