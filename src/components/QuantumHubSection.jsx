import React, { useState, useEffect, useRef } from 'react';
import './QuantumHubSection.css';

const QuantumHubSection = ({ scrollProgress = 0, activeIslandId, setActiveIslandId }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef(null);
  const mainGainRef = useRef(null);
  const oscsRef = useRef([]);

  // Title animations based on scroll progress
  const headingOpacity = Math.min(1, Math.max(0, scrollProgress * 4.0));
  const headingY = Math.max(0, 50 - scrollProgress * 150);

  // HUD frame opacity
  const hudOpacity = Math.min(1, Math.max(0, (scrollProgress - 0.05) * 5.0));

  // Instruction tooltip opacity
  const instructionOpacity = Math.min(1, Math.max(0, (scrollProgress - 0.35) * 3.0));

  // Initialize Web Audio Synth
  const initAudio = () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // 1. Oscillators
      const osc1 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.value = 55.0; // A1 tone

      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.value = 55.3; // slightly detuned for chorus beating

      // 2. Filter to make it a warm low-pass drone
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 140;
      filter.Q.value = 4.0;

      // 3. LFO to sweep filter cutoff frequency for scifi "breathing" effect
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.12; // Very slow LFO

      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 65; // Modulate cutoff by +-65Hz

      // Connect LFO to filter cutoff frequency
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      // 4. Gain node for each oscillator to prevent clipping
      const oscGain1 = ctx.createGain();
      oscGain1.gain.value = 0.05;
      
      const oscGain2 = ctx.createGain();
      oscGain2.gain.value = 0.06;

      // 5. Main gain node with initial zero volume (faded out)
      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(0, ctx.currentTime);

      // 6. Connect everything
      osc1.connect(oscGain1);
      oscGain1.connect(filter);

      osc2.connect(oscGain2);
      oscGain2.connect(filter);

      filter.connect(mainGain);
      mainGain.connect(ctx.destination);

      // 7. Start sound generators
      osc1.start();
      osc2.start();
      lfo.start();

      mainGainRef.current = mainGain;
      oscsRef.current = [osc1, osc2, lfo];
    } catch (e) {
      console.warn("Web Audio API not supported or blocked: ", e);
    }
  };

  const toggleSynth = (e) => {
    e.stopPropagation();

    // 1. Initialize context if first click
    if (!audioCtxRef.current) {
      initAudio();
    }

    const ctx = audioCtxRef.current;
    if (!ctx) return;

    // Resume if suspended (browser security block)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const mainGain = mainGainRef.current;
    if (!mainGain) return;

    if (isPlaying) {
      // Fade out smoothly to prevent clicks
      mainGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
      setIsPlaying(false);
    } else {
      // Fade in smoothly
      mainGain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.6);
      setIsPlaying(true);
    }
  };

  // Clean up audio nodes on component unmount
  useEffect(() => {
    return () => {
      if (oscsRef.current.length > 0) {
        oscsRef.current.forEach(osc => {
          try { osc.stop(); } catch (err) {}
        });
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <section className="quantum-hub-section">
      {/* HUD Frame */}
      <div className="quantum-hub-hud-frame" style={{ opacity: hudOpacity }}>
        <div className="hud-corner hud-corner-tl" />
        <div className="hud-corner hud-corner-tr" />
        <div className="hud-corner hud-corner-bl" />
        <div className="hud-corner hud-corner-br" />
      </div>

      {/* Floating Speaker Wave Toggle Button */}
      <button 
        className={`quantum-audio-toggle ${isPlaying ? 'active' : ''}`}
        onClick={toggleSynth}
        title={isPlaying ? "Mute Ambient Synth" : "Activate Ambient Synth"}
        style={{ opacity: hudOpacity }}
      >
        {isPlaying ? (
          // Active state speaker icon with waves
          <svg className="audio-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
        ) : (
          // Muted state speaker icon with slash
          <svg className="audio-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
          </svg>
        )}
      </button>

      {/* Section Heading */}
      <div
        className="quantum-hub-heading"
        style={{
          opacity: headingOpacity,
          transform: `translateY(${headingY}px)`,
        }}
      >
        <span className="quantum-hub-tagline">// SECTOR 04 — QUANTUM CORE</span>
        <h2 className="quantum-hub-title">QUANTUM HUB</h2>
        <p className="quantum-hub-subtitle">Powering Next-Generation Architectures</p>
      </div>

      {/* Interactive Instructions */}
      <div 
        className="quantum-hub-instruction"
        style={{ opacity: instructionOpacity }}
      >
        <span>
          {activeIslandId !== null 
            ? "[ CLICK OUTSIDE ISLAND TO ZOOM OUT ]" 
            : "[ HOVER & CLICK ISLANDS TO ANALYZE ARCHITECTURES ]"
          }
        </span>
      </div>
    </section>
  );
};

export default QuantumHubSection;
