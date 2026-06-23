import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import OrbitNode from './OrbitNode';

// Helper to get random point on a sphere of specific radius
const getRandomPointOnSphere = (radius) => {
  const u = Math.random();
  const v = Math.random();
  const theta = u * 2.0 * Math.PI;
  const clampedVal = Math.max(-1.0, Math.min(1.0, 2.0 * v - 1.0));
  const phi = Math.acos(clampedVal);
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.sin(phi) * Math.sin(theta);
  const z = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
};

// Jagged Electric Arc Line Component
const ArcLine = ({ start, end, tick, color, cityOpacity }) => {
  const geomRef = useRef();

  const points = useMemo(() => {
    const segments = 8;
    const noiseWidth = 0.4;
    const pts = [];
    const dir = new THREE.Vector3().subVectors(end, start);
    dir.normalize();

    // Find perpendicular directions
    const tangent = new THREE.Vector3(0, 1, 0);
    if (Math.abs(dir.dot(tangent)) > 0.9) {
      tangent.set(1, 0, 0);
    }
    const bitangent = new THREE.Vector3().crossVectors(dir, tangent).normalize();
    tangent.crossVectors(dir, bitangent).normalize();

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const p = new THREE.Vector3().lerpVectors(start, end, t);

      if (i > 0 && i < segments) {
        const angle = Math.random() * Math.PI * 2.0;
        const r = (Math.random() - 0.5) * noiseWidth * Math.sin(t * Math.PI);
        const disp = new THREE.Vector3()
          .addScaledVector(tangent, Math.cos(angle) * r)
          .addScaledVector(bitangent, Math.sin(angle) * r);
        p.add(disp);
      }
      pts.push(p);
    }
    return pts;
  }, [start, end, tick]);

  // Convert points to Flat32Array
  const positionArray = useMemo(() => {
    const arr = new Float32Array(points.length * 3);
    for (let i = 0; i < points.length; i++) {
      arr[i * 3] = points[i].x;
      arr[i * 3 + 1] = points[i].y;
      arr[i * 3 + 2] = points[i].z;
    }
    return arr;
  }, [points]);

  useEffect(() => {
    if (geomRef.current) {
      geomRef.current.setAttribute(
        'position',
        new THREE.BufferAttribute(positionArray, 3)
      );
      geomRef.current.attributes.position.needsUpdate = true;
      geomRef.current.computeBoundingSphere();
    }
  }, [positionArray]);

  return (
    <line>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[positionArray, 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={cityOpacity * (Math.random() * 0.7 + 0.3)} // Flickering opacity
        blending={THREE.AdditiveBlending}
        linewidth={1.5}
      />
    </line>
  );
};

// Electric Arcs Container Component
const ElectricArcs = ({ cityOpacity }) => {
  const [tick, setTick] = useState(0);
  const [arcs, setArcs] = useState([]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const newTick = Math.floor(time * 12); // change every ~83ms
    
    if (newTick !== tick) {
      setTick(newTick);
      const newArcs = [];
      const innerRadius = 1.35; // sphere core radius
      const outerRadius = 1.75; // cage radius

      for (let i = 0; i < 4; i++) {
        const start = getRandomPointOnSphere(innerRadius);
        const end = getRandomPointOnSphere(outerRadius);
        const color = Math.random() > 0.4 ? '#00f0ff' : '#bd00ff';
        newArcs.push({ id: i, start, end, color });
      }
      setArcs(newArcs);
    }
  });

  return (
    <group>
      {arcs.map((arc) => (
        <ArcLine
          key={arc.id}
          start={arc.start}
          end={arc.end}
          tick={tick}
          color={arc.color}
          cityOpacity={cityOpacity}
        />
      ))}
    </group>
  );
};

// Drifting Particles Component
const DriftingParticles = ({ count = 90, cityOpacity }) => {
  const pointsRef = useRef();

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const colorOptions = [new THREE.Color('#00f0ff'), new THREE.Color('#bd00ff'), new THREE.Color('#ff007a')];

    for (let i = 0; i < count; i++) {
      const radius = 2.4 + Math.random() * 2.8;
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const clampedVal = Math.max(-1.0, Math.min(1.0, 2.0 * v - 1.0));
      const phi = Math.acos(clampedVal);

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      const c = colorOptions[Math.floor(Math.random() * 3)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    return [pos, col];
  }, [count]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.045;
      pointsRef.current.rotation.x += delta * 0.015;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.065}
        vertexColors
        transparent
        opacity={cityOpacity * 0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// Main AICore Component
const AICore = ({ position = [0, -4.5, -60], cityOpacity = 1.0, activeNodeId = null, setActiveNodeId }) => {
  const coreMeshRef = useRef();
  const cageMeshRef = useRef();
  const pointLightRef = useRef();

  // 1. Technologies metadata
  const nodeData = useMemo(() => [
    {
      title: 'Artificial Intelligence',
      label: 'AI Core',
      color: '#00f0ff',
      description: 'Self-evolving neural architectures capable of cognitive adaptation and autonomous reasoning across hyper-dimensional space.',
      icon: (
        <svg viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="10" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="24" cy="24" r="3" fill="currentColor" />
          <path d="M24 14V6M24 42v-8M14 24H6M42 24h-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M17.17 17.17l-4.24-4.24M35.07 35.07l-4.24-4.24M17.17 30.83l-4.24 4.24M35.07 12.93l-4.24 4.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      title: 'Machine Learning',
      label: 'Machine Learning',
      color: '#bd00ff',
      description: 'Deep statistical learning models that synthesize raw data patterns into predictive intelligence in real-time.',
      icon: (
        <svg viewBox="0 0 48 48" fill="none">
          <path d="M6 38l10-14 8 10 8-18 10 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="16" cy="24" r="2.5" fill="currentColor" opacity="0.8" />
          <circle cx="24" cy="34" r="2.5" fill="currentColor" opacity="0.8" />
          <circle cx="32" cy="16" r="2.5" fill="currentColor" opacity="0.8" />
        </svg>
      ),
    },
    {
      title: 'Robotics',
      label: 'Robotics',
      color: '#ff007a',
      description: 'Autonomous cybernetic systems engineered with high-precision locomotion and advanced environmental perception.',
      icon: (
        <svg viewBox="0 0 48 48" fill="none">
          <path d="M6 40h12M12 40V28m0 0l12-10 10 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M34 22l4-2m0 0a2 2 0 10-2-2m2 2l-2 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="12" cy="28" r="3" fill="currentColor" />
          <circle cx="24" cy="18" r="3" fill="currentColor" />
        </svg>
      ),
    },
    {
      title: 'Quantum Computing',
      label: 'Quantum Comp.',
      color: '#00f0ff',
      description: 'Quantum-state superposition and entanglement processors accelerating computational speeds exponentially.',
      icon: (
        <svg viewBox="0 0 48 48" fill="none">
          <ellipse cx="24" cy="24" rx="18" ry="6" stroke="currentColor" strokeWidth="1.5" transform="rotate(30 24 24)" />
          <ellipse cx="24" cy="24" rx="18" ry="6" stroke="currentColor" strokeWidth="1.5" transform="rotate(-30 24 24)" />
          <ellipse cx="24" cy="24" rx="18" ry="6" stroke="currentColor" strokeWidth="1.5" transform="rotate(90 24 24)" />
          <circle cx="24" cy="24" r="4" fill="currentColor" />
          <circle cx="12" cy="17" r="1.5" fill="currentColor" />
          <circle cx="36" cy="31" r="1.5" fill="currentColor" />
        </svg>
      ),
    },
    {
      title: 'Cyber Security',
      label: 'Cyber Security',
      color: '#bd00ff',
      description: 'Quantum-encrypted firewall matrices and predictive threat detection shielding the digital metropolis from intrusion.',
      icon: (
        <svg viewBox="0 0 48 48" fill="none">
          <path d="M24 6l14 4v12c0 9-6 17-14 20-8-3-14-11-14-20V10l14-4z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 20h8v8h-8z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M22 20v-3a2 2 0 014 0v3" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      title: 'Internet of Things',
      label: 'IoT Edge',
      color: '#ff007a',
      description: 'A synchronized network of edge sensors and smart devices weaving a seamless web of ambient intelligence.',
      icon: (
        <svg viewBox="0 0 48 48" fill="none">
          <rect x="18" y="18" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="24" cy="24" r="2" fill="currentColor" />
          <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="40" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8" cy="40" r="3" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="40" cy="40" r="3" stroke="currentColor" strokeWidth="1.5" />
          <path d="M11 11l9 9M37 11l-9 9M11 37l9-9M37 37l-9-9" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
        </svg>
      ),
    },
  ], []);

  // 2. Custom energy sphere shader material
  const sphereShader = useMemo(() => {
    return {
      uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color('#00f0ff') },
        uColor2: { value: new THREE.Color('#bd00ff') },
        uOpacity: { value: 1.0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform float uOpacity;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        float energyPattern(vec3 p) {
          float w1 = sin(p.x * 2.5 + uTime * 1.6) * cos(p.y * 2.5 - uTime * 1.9);
          float w2 = sin(p.z * 3.0 + uTime * 2.3) * cos(p.x * 1.5 - uTime * 1.3);
          return (w1 + w2) * 0.5 + 0.5;
        }

        void main() {
          // Fresnel rim glow
          float fresnel = pow(1.0 - abs(vNormal.z), 2.5);

          // Energy swirl pattern
          float pattern = energyPattern(vPosition * 1.6);

          // Mix primary colors
          vec3 baseColor = mix(uColor1, uColor2, pattern);

          // Add heavy white/cyan hot core center highlight
          vec3 finalColor = baseColor + vec3(fresnel * 0.85) * uColor1 + vec3(pattern * 0.3);

          // Pulsing
          float pulse = 0.85 + 0.15 * sin(uTime * 4.0);
          finalColor *= pulse;

          // Transparency: edges are bright (fresnel), center has base opacity
          float alpha = (0.3 + fresnel * 0.7) * uOpacity * pulse;

          gl_FragColor = vec4(finalColor, alpha);
        }
      `
    };
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Rotate core and containment cage
    if (coreMeshRef.current) {
      coreMeshRef.current.rotation.y = time * 0.15;
      coreMeshRef.current.rotation.z = time * 0.05;
      
      // Micro pulsing scale
      const scale = 1.0 + Math.sin(time * 4.0) * 0.04;
      coreMeshRef.current.scale.set(scale, scale, scale);
    }

    if (cageMeshRef.current) {
      cageMeshRef.current.rotation.y = -time * 0.12;
      cageMeshRef.current.rotation.x = time * 0.06;
    }

    // Update shader uniforms
    if (sphereShader.uniforms) {
      sphereShader.uniforms.uTime.value = time;
      sphereShader.uniforms.uOpacity.value = cityOpacity;
    }

    // Pulse point light intensity
    if (pointLightRef.current) {
      pointLightRef.current.intensity = (4.0 + Math.sin(time * 4.0) * 1.5) * cityOpacity;
      
      // Shift point light color between blue and purple
      const t = (Math.sin(time * 1.8) + 1.0) / 2.0;
      pointLightRef.current.color.lerpColors(
        new THREE.Color('#00f0ff'),
        new THREE.Color('#bd00ff'),
        t
      );
    }
  });

  const handleNodeClick = (index) => {
    setActiveNodeId(index === activeNodeId ? null : index);
  };

  return (
    <group position={position}>
      {/* 1. Pulsing Point Light Emitted from the Core */}
      <pointLight
        ref={pointLightRef}
        distance={25}
        decay={2}
      />

      {/* 2. Central Energy Sphere */}
      <mesh ref={coreMeshRef}>
        <sphereGeometry args={[1.35, 32, 32]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexShader={sphereShader.vertexShader}
          fragmentShader={sphereShader.fragmentShader}
          uniforms={sphereShader.uniforms}
        />
      </mesh>

      {/* 3. Outer Containment Wireframe Cage */}
      <mesh ref={cageMeshRef} scale={1.72}>
        <icosahedronGeometry args={[1, 2]} />
        <meshBasicMaterial
          color="#00f0ff"
          wireframe
          transparent
          opacity={cityOpacity * 0.28}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 4. Animated Jagged Electric Arcs */}
      <ElectricArcs cityOpacity={cityOpacity} />

      {/* 5. Floating Dust Particles around the Core */}
      <DriftingParticles count={110} cityOpacity={cityOpacity} />

      {/* 6. Orbiting Nodes (arranged at 4.8 orbit radius) */}
      {nodeData.map((node, index) => (
        <OrbitNode
          key={node.title}
          index={index}
          name={node.title}
          label={node.label}
          color={node.color}
          orbitRadius={4.8}
          activeNodeId={activeNodeId}
          onClick={handleNodeClick}
          cityOpacity={cityOpacity}
        />
      ))}


    </group>
  );
};

export default AICore;
