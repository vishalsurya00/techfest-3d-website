import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Earth = ({ scrollProgress = 0, onLoad, onWarning }) => {
  const earthRef = useRef();
  const cloudsRef = useRef();
  const glowRef = useRef();
  const earthGroupRef = useRef();

  // 1. Procedural texture generation for Earth, Specular Map, and Clouds
  const [textures, error] = useMemo(() => {
    try {
      const width = 1024;
      const height = 512;
      
      // Value noise setup
      const gridSize = 16;
      const grid = [];
      for (let i = 0; i <= gridSize; i++) {
        grid[i] = [];
        for (let j = 0; j <= gridSize; j++) {
          grid[i][j] = Math.random();
        }
      }

      const sampleNoise = (x, y) => {
        const x1 = Math.floor(x) % gridSize;
        const y1 = Math.floor(y) % gridSize;
        const x2 = (x1 + 1) % gridSize;
        const y2 = (y1 + 1) % gridSize;

        const tx = x - Math.floor(x);
        const ty = y - Math.floor(y);

        const sx = tx * tx * (3 - 2 * tx);
        const sy = ty * ty * (3 - 2 * ty);

        const n00 = grid[x1][y1];
        const n10 = grid[x2][y1];
        const n01 = grid[x1][y2];
        const n11 = grid[x2][y2];

        const nx0 = n00 * (1 - sx) + n10 * sx;
        const nx1 = n01 * (1 - sx) + n11 * sx;

        return nx0 * (1 - sy) + nx1 * sy;
      };

      const fbm = (x, y, octaves) => {
        let val = 0;
        let amp = 0.5;
        let freq = 1.0;
        for (let i = 0; i < octaves; i++) {
          val += amp * sampleNoise(x * freq, y * freq);
          amp *= 0.5;
          freq *= 2.0;
        }
        return val;
      };

      // Canvas 1: Earth Diffuse Texture & Specular Map
      const earthCanvas = document.createElement('canvas');
      earthCanvas.width = width;
      earthCanvas.height = height;
      const earthCtx = earthCanvas.getContext('2d');

      const specCanvas = document.createElement('canvas');
      specCanvas.width = width;
      specCanvas.height = height;
      const specCtx = specCanvas.getContext('2d');

      const earthImgData = earthCtx.createImageData(width, height);
      const specImgData = specCtx.createImageData(width, height);

      // Canvas 2: Clouds Texture
      const cloudsCanvas = document.createElement('canvas');
      cloudsCanvas.width = width;
      cloudsCanvas.height = height;
      const cloudsCtx = cloudsCanvas.getContext('2d');
      const cloudsImgData = cloudsCtx.createImageData(width, height);

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const nx = (x / width) * gridSize;
          const ny = (y / height) * gridSize;

          // FBM values
          const h = fbm(nx, ny, 5); // Surface height
          const c = fbm(nx + 10, ny + 10, 4); // Clouds density

          const idx = (y * width + x) * 4;
          const latitude = Math.abs(y - height / 2) / (height / 2); // Latitude 0 to 1

          let r, g, b, specVal;

          // Realistic surface generation
          if (latitude > 0.85 && h > 0.35) {
            // Polar ice caps
            r = 245; g = 250; b = 255;
            specVal = 40; // Ice is slightly reflective
          } else if (h < 0.46) {
            // Oceans
            const depth = h / 0.46;
            r = Math.floor(5 + depth * 10);
            g = Math.floor(25 + depth * 30);
            b = Math.floor(70 + depth * 75);
            specVal = 255; // Oceans are highly specular/reflective
          } else {
            // Landmass
            const elevation = (h - 0.46) / 0.54;
            specVal = 0; // Land is rough and non-reflective
            
            if (elevation < 0.1) {
              // Sandy shores
              r = 195; g = 175; b = 130;
            } else if (elevation < 0.5) {
              // Vegetation / forests
              const v = (elevation - 0.1) / 0.4;
              r = Math.floor(40 + v * 15);
              g = Math.floor(105 - v * 25);
              b = Math.floor(45 - v * 10);
            } else {
              // Mountains / highlands
              const m = (elevation - 0.5) / 0.5;
              r = Math.floor(100 + m * 50);
              g = Math.floor(90 + m * 40);
              b = Math.floor(80 + m * 30);
            }
          }

          // Write Earth Diffuse
          earthImgData.data[idx] = r;
          earthImgData.data[idx + 1] = g;
          earthImgData.data[idx + 2] = b;
          earthImgData.data[idx + 3] = 255;

          // Write Specular Map (grayscale)
          specImgData.data[idx] = specVal;
          specImgData.data[idx + 1] = specVal;
          specImgData.data[idx + 2] = specVal;
          specImgData.data[idx + 3] = 255;

          // Clouds mapping (White clouds with alpha transparency based on noise)
          let cloudAlpha = 0;
          if (c > 0.42) {
            cloudAlpha = Math.floor((c - 0.42) * 2.5 * 255);
            cloudAlpha = Math.min(255, cloudAlpha);
          }
          cloudsImgData.data[idx] = 255;
          cloudsImgData.data[idx + 1] = 255;
          cloudsImgData.data[idx + 2] = 255;
          cloudsImgData.data[idx + 3] = cloudAlpha;
        }
      }

      earthCtx.putImageData(earthImgData, 0, 0);
      specCtx.putImageData(specImgData, 0, 0);
      cloudsCtx.putImageData(cloudsImgData, 0, 0);

      const earthTex = new THREE.CanvasTexture(earthCanvas);
      earthTex.colorSpace = THREE.SRGBColorSpace;
      const specTex = new THREE.CanvasTexture(specCanvas);
      const cloudsTex = new THREE.CanvasTexture(cloudsCanvas);

      return [[earthTex, specTex, cloudsTex], null];
    } catch (err) {
      return [[null, null, null], err];
    }
  }, []);

  useEffect(() => {
    console.log("Earth Loaded");
    if (onLoad) onLoad('earth');
    if (error && onWarning) {
      onWarning(`Earth textures failed to generate: ${error.message}`);
    }
  }, [onLoad, onWarning, error]);

  const [earthTexture, specularMap, cloudsTexture] = textures;

  // 2. Custom Atmosphere Glow Shader
  const atmosphereGlowShader = useMemo(() => {
    return {
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        
        void main() {
          vec3 viewDir = normalize(vViewPosition);
          // Dot product for Fresnel effect edge glow
          float intensity = pow(0.7 - dot(vNormal, viewDir), 2.5);
          
          // Atmospheric color: Electric neon blue glow
          vec3 atmosphereColor = vec3(0.0, 0.55, 1.0);
          
          gl_FragColor = vec4(atmosphereColor, intensity * 0.95);
        }
      `,
    };
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Constant slow rotation
    if (earthRef.current) {
      earthRef.current.rotation.y = time * 0.04;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = time * 0.052; // Clouds rotate slightly faster
    }

    // Scroll interpolation: Earth flies past the camera (moves behind and wide)
    if (earthGroupRef.current) {
      const startX = -3.8;
      const targetX = -7.0;
      
      const startZ = 0.0;
      const targetZ = 8.0;

      // Smooth interpolation
      const currentX = THREE.MathUtils.lerp(startX, targetX, scrollProgress);
      const currentZ = THREE.MathUtils.lerp(startZ, targetZ, scrollProgress);

      earthGroupRef.current.position.x = currentX;
      earthGroupRef.current.position.z = currentZ;

      // Scale Earth down by 40% (base scale 0.6)
      const currentScale = THREE.MathUtils.lerp(0.6, 0.6 * 0.9, scrollProgress);
      earthGroupRef.current.scale.setScalar(currentScale);
    }
  });

  return (
    <group ref={earthGroupRef} position={[-3.8, -0.2, 0]}>
      {/* 1. Core Earth Sphere */}
      <mesh ref={earthRef} castShadow receiveShadow>
        <sphereGeometry args={[1.8, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.7}
          metalness={0.15}
          roughnessMap={specularMap} // Use specular map inversely as roughness
          bumpMap={earthTexture}      // Add texture relief
          bumpScale={0.03}
        />
      </mesh>

      {/* 2. Clouds Layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[1.82, 64, 64]} />
        <meshStandardMaterial
          map={cloudsTexture}
          transparent
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </mesh>

      {/* 3. Outer Atmospheric Glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.93, 64, 64]} />
        <shaderMaterial
          transparent
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          vertexShader={atmosphereGlowShader.vertexShader}
          fragmentShader={atmosphereGlowShader.fragmentShader}
        />
      </mesh>
    </group>
  );
};

export default Earth;
