import React, { useEffect, useRef } from 'react';

const StarfieldCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates and target for smoothing
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      isActive: false,
    };

    // Keep track of mouse trail
    const trailPoints = [];
    const maxTrailLength = 20;

    // Handle resize
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Handle mouse move
    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.isActive = true;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleMouseLeave = () => {
      mouse.isActive = false;
    };
    document.addEventListener('mouseleave', handleMouseLeave);

    // Star Class (Background parallax stars)
    class Star {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        // z represents depth (1 to 5). Larger z means closer (moves faster).
        this.z = Math.random() * 4 + 1;
        this.radius = (Math.random() * 1.2 + 0.3) * (this.z / 3);
        this.alpha = Math.random() * 0.5 + 0.3;
        this.baseAlpha = this.alpha;
        this.twinkleSpeed = Math.random() * 0.02 + 0.005;
        this.twinklePhase = Math.random() * Math.PI * 2;
        
        // Curated colors: white, slight cyan, slight purple
        const colors = [
          'rgba(255, 255, 255, ',
          'rgba(174, 238, 255, ',
          'rgba(235, 178, 255, '
        ];
        this.colorPrefix = colors[Math.floor(Math.random() * colors.length)];
      }

      update(dx, dy, time) {
        // Apply parallax offset relative to depth (z)
        let cx = this.x - dx * (this.z * 0.05);
        let cy = this.y - dy * (this.z * 0.05);

        // Keep coordinates wrapped inside canvas
        if (cx < 0) cx += width;
        if (cx > width) cx -= width;
        if (cy < 0) cy += height;
        if (cy > height) cy -= height;

        // Twinkle effect
        this.alpha = this.baseAlpha + Math.sin(time * this.twinkleSpeed + this.twinklePhase) * 0.25;
        this.alpha = Math.max(0.1, Math.min(1, this.alpha));

        return { x: cx, y: cy };
      }

      draw(cx, cy) {
        ctx.fillStyle = `${this.colorPrefix}${this.alpha})`;
        ctx.beginPath();
        ctx.arc(cx, cy, this.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Particle Class (Floating, glowing dust particles that react slightly to mouse)
    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.radius = Math.random() * 2.5 + 1.2;
        this.alpha = Math.random() * 0.4 + 0.2;
        this.baseAlpha = this.alpha;
        
        // Glowing cyan/purple/pink colors
        const colors = [
          { r: 0, g: 240, b: 255 },   // Cyan
          { r: 189, g: 0, b: 255 },   // Purple
          { r: 255, g: 0, b: 122 }    // Pink
        ];
        this.colorObj = colors[Math.floor(Math.random() * colors.length)];
      }

      update(mx, my, dx, dy) {
        this.x += this.vx - dx * 0.02;
        this.y += this.vy - dy * 0.02;

        // Wrap around screens
        if (this.x < -10) this.x = width + 10;
        if (this.x > width + 10) this.x = -10;
        if (this.y < -10) this.y = height + 10;
        if (this.y > height + 10) this.y = -10;

        // Interactive mouse push effect
        const distDx = this.x - mx;
        const distDy = this.y - my;
        const dist = Math.sqrt(distDx * distDx + distDy * distDy);
        
        if (dist < 150) {
          const force = (150 - dist) / 150;
          this.x += (distDx / dist) * force * 1.5;
          this.y += (distDy / dist) * force * 1.5;
          this.alpha = Math.min(0.8, this.baseAlpha + force * 0.4);
        } else {
          // Fade back to base alpha
          this.alpha += (this.baseAlpha - this.alpha) * 0.05;
        }
      }

      draw() {
        const radGrd = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.radius * 2.5
        );
        radGrd.addColorStop(0, `rgba(${this.colorObj.r}, ${this.colorObj.g}, ${this.colorObj.b}, ${this.alpha})`);
        radGrd.addColorStop(0.4, `rgba(${this.colorObj.r}, ${this.colorObj.g}, ${this.colorObj.b}, ${this.alpha * 0.4})`);
        radGrd.addColorStop(1, `rgba(${this.colorObj.r}, ${this.colorObj.g}, ${this.colorObj.b}, 0)`);

        ctx.fillStyle = radGrd;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Initialize stars and particles
    const starCount = 200;
    const stars = Array.from({ length: starCount }, () => new Star());

    const particleCount = 45;
    const particles = Array.from({ length: particleCount }, () => new Particle());

    // Dampened coordinates for parallax rendering
    let interpDx = 0;
    let interpDy = 0;
    let time = 0;

    // Animation Loop
    const animate = () => {
      time++;
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse coordination with simple easing (dampening)
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      // Parallax offsets based on cursor deviation from center
      const centerX = width / 2;
      const centerY = height / 2;
      const targetDx = mouse.x - centerX;
      const targetDy = mouse.y - centerY;

      interpDx += (targetDx - interpDx) * 0.05;
      interpDy += (targetDy - interpDy) * 0.05;

      // 1. Draw Stars
      stars.forEach(star => {
        const pos = star.update(interpDx, interpDy, time);
        star.draw(pos.x, pos.y);
      });

      // 2. Draw Particles
      particles.forEach(particle => {
        particle.update(mouse.x, mouse.y, interpDx, interpDy);
        particle.draw();
      });

      // 3. Update and draw Cursor Glow Trail
      if (mouse.isActive) {
        trailPoints.push({ x: mouse.x, y: mouse.y });
        if (trailPoints.length > maxTrailLength) {
          trailPoints.shift();
        }
      } else if (trailPoints.length > 0) {
        // Shrink trail when inactive
        trailPoints.shift();
      }

      if (trailPoints.length > 1) {
        // Draw the glowing trail line
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(0, 240, 255, 0.6)';
        
        ctx.beginPath();
        ctx.moveTo(trailPoints[0].x, trailPoints[0].y);
        
        for (let i = 1; i < trailPoints.length - 1; i++) {
          const xc = (trailPoints[i].x + trailPoints[i + 1].x) / 2;
          const yc = (trailPoints[i].y + trailPoints[i + 1].y) / 2;
          ctx.quadraticCurveTo(trailPoints[i].x, trailPoints[i].y, xc, yc);
        }
        
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        
        // Draw glowing gradient particles along the trail
        trailPoints.forEach((pt, idx) => {
          const progress = idx / (trailPoints.length - 1);
          const radius = progress * 4;
          
          ctx.shadowBlur = 10;
          ctx.shadowColor = `rgba(189, 0, 255, ${progress * 0.7})`;
          
          // Interpolate color from Purple to Cyan
          const r = Math.floor(0 + (189 - 0) * (1 - progress));
          const g = Math.floor(240 + (0 - 240) * (1 - progress));
          const b = Math.floor(255 + (255 - 255) * (1 - progress));
          
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${progress * 0.8})`;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
          ctx.fill();
        });

        // Reset shadow for next render cycles
        ctx.shadowBlur = 0;
      }

      // Draw the main cursor dot
      if (mouse.isActive) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00f0ff';
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 10 + Math.sin(time * 0.15) * 2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <>
      {/* Background Nebulae using CSS radial gradients */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'radial-gradient(circle at 20% 30%, rgba(189, 0, 255, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(0, 240, 255, 0.12) 0%, transparent 50%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'block',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />
    </>
  );
};

export default StarfieldCanvas;
