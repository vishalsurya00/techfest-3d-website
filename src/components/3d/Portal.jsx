import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Portal = ({ scrollProgress = 0, position = [0, 0, -6.0], isFinal = false, onLoad, onWarning }) => {
  useEffect(() => {
    console.log("Portal Loaded");
    if (onLoad) onLoad('portal');
  }, [onLoad]);
  const portalRef = useRef();
  const discRef = useRef();
  const pointsRef = useRef();
  const lightRef = useRef();

  // 1. Calculate portal opacity dynamically based on whether it is the final portal or first portal
  const portalOpacity = useMemo(() => {
    if (isFinal) {
      return THREE.MathUtils.smoothstep(scrollProgress, 0.73, 0.8333);
    } else {
      const appear = THREE.MathUtils.smoothstep(scrollProgress, 0.04, 0.12);
      const fadeOut = 1 - THREE.MathUtils.smoothstep(scrollProgress, 0.167, 0.23);
      return appear * fadeOut;
    }
  }, [scrollProgress, isFinal]);

  // 2. Swirling energy disc ShaderMaterial
  const [portalShader, shaderError] = useMemo(() => {
    try {
      const mat = new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: 0 },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform float uOpacity;
          varying vec2 vUv;

          void main() {
            // Convert UV to centered coordinates (-0.5 to 0.5)
            vec2 uv = vUv - vec2(0.5);
            float r = length(uv);
            float theta = atan(uv.y, uv.x);

            // Hard radial cutoff at disc boundary
            if (r > 0.5) discard;

            // Double spiral arm vortex energy swirl
            float swirl = theta - r * 12.0 + uTime * 3.5;
            float pattern = sin(swirl * 2.0) * 0.5 + 0.5;

            // Radial brightness profile: hot bright core
            float core = smoothstep(0.5, 0.0, r);

            // Neon color palette interpolation
            vec3 cyan = vec3(0.0, 0.94, 1.0);
            vec3 purple = vec3(0.74, 0.0, 1.0);
            vec3 color = mix(purple, cyan, pattern);

            // Add intensive white glowing core
            color += vec3(0.8, 0.9, 1.0) * pow(core, 4.0) * 1.8;

            // Fade out towards the outer edges
            float alpha = smoothstep(0.5, 0.35, r) * uOpacity;

            gl_FragColor = vec4(color, alpha);
          }
        `
      });
      return [mat, null];
    } catch (err) {
      return [null, err];
    }
  }, []);

  // 3. Volumetric particles setup
  const particleCount = 150;
  const particles = useMemo(() => {
    const list = [];
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 2.0 + 0.5; // Orbit radius between 0.5 and 2.5
      const speed = Math.random() * 0.4 + 0.15;
      const yOffset = (Math.random() - 0.5) * 0.3; // Slight depth deviation
      const phase = Math.random() * Math.PI * 2;
      
      list.push({ angle, radius, speed, yOffset, phase });
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = yOffset;
    }
    return { list, positions };
  }, []);

  const particleGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(particles.positions, 3));
    return geo;
  }, [particles]);

  const [particleTexture, textureError] = useMemo(() => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(0, 240, 255, 1.0)');
      grad.addColorStop(0.3, 'rgba(189, 0, 255, 0.6)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);
      return [new THREE.CanvasTexture(canvas), null];
    } catch (err) {
      return [null, err];
    }
  }, []);

  useEffect(() => {
    if (shaderError && onWarning) {
      onWarning(`Portal shader failed: ${shaderError.message}`);
    }
    if (textureError && onWarning) {
      onWarning(`Portal particle texture failed: ${textureError.message}`);
    }
  }, [shaderError, textureError, onWarning]);

  // 4. Frame animation loop
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Pulse scale and light intensity
    if (portalRef.current) {
      const scalePulse = 1.0 + Math.sin(time * 2.5) * 0.03;
      portalRef.current.scale.setScalar(scalePulse);
      portalRef.current.rotation.z = time * 0.12; // Slow rotation of the entire portal assembly
    }

    if (discRef.current && discRef.current.material) {
      discRef.current.material.uniforms.uTime.value = time;
      discRef.current.material.uniforms.uOpacity.value = portalOpacity;
    }

    if (lightRef.current) {
      // Pulse light intensity (ranging between 2.0 and 8.0)
      lightRef.current.intensity = (5.0 + Math.sin(time * 4.0) * 3.0) * portalOpacity;
    }

    // Animate particles spiraling into the portal vortex
    if (pointsRef.current) {
      const geo = pointsRef.current.geometry;
      const positions = geo.attributes.position.array;
      
      particles.list.forEach((p, idx) => {
        // Increment angle
        p.angle += state.delta * p.speed * 2.5;

        // Spiral inward: decrease radius over time, reset if too close to core
        const spiralSpeed = 0.25;
        let currentRadius = p.radius - (time * spiralSpeed) % p.radius;
        if (currentRadius < 0.15) {
          currentRadius = p.radius;
        }

        // Calculate positions
        positions[idx * 3] = Math.cos(p.angle) * currentRadius;
        positions[idx * 3 + 1] = Math.sin(p.angle) * currentRadius;
        positions[idx * 3 + 2] = p.yOffset + Math.sin(time * 3.0 + p.phase) * 0.03;
      });

      geo.attributes.position.needsUpdate = true;
    }
  });

  // Early return right before return statement to keep Hooks order consistent
  if (portalOpacity <= 0) return null;

  return (
    <group ref={portalRef} position={position}>
      {/* A. Core Swirling Energy Disc */}
      <mesh ref={discRef}>
        <circleGeometry args={[2.0, 64]} />
        <primitive object={portalShader} attach="material" />
      </mesh>

      {/* B. Outer Thin Torus Border Ring */}
      <mesh>
        <torusGeometry args={[2.01, 0.04, 16, 100]} />
        <meshBasicMaterial
          color="#bd00ff"
          transparent
          opacity={portalOpacity * 0.8}
        />
      </mesh>
      
      <mesh>
        <torusGeometry args={[1.97, 0.015, 16, 100]} />
        <meshBasicMaterial
          color="#00f0ff"
          transparent
          opacity={portalOpacity * 0.9}
        />
      </mesh>

      {/* C. Swirling Volumetric Energy Particles */}
      <points ref={pointsRef} geometry={particleGeometry}>
        <pointsMaterial
          size={0.18}
          map={particleTexture}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={portalOpacity * 0.75}
        />
      </points>

      {/* D. Pulsing center point light */}
      <pointLight
        ref={lightRef}
        color="#00f0ff"
        distance={25}
        decay={2.0}
      />
    </group>
  );
};

export default Portal;
