import React, { useEffect, useRef } from 'react';

const CustomCursor = () => {
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

    // Keep track of mouse trail points
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

    let time = 0;

    // Animation Loop
    const animate = () => {
      time++;
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse coordination with simple easing (dampening)
      mouse.x += (mouse.targetX - mouse.x) * 0.12;
      mouse.y += (mouse.targetY - mouse.y) * 0.12;

      // Update and draw Cursor Glow Trail
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
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
        display: 'block',
      }}
    />
  );
};

export default CustomCursor;
