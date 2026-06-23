import React from 'react';

export const islands = [
  {
    title: 'Quantum Computing',
    color: '#00f0ff',
    description: 'Superconducting qubit arrays leveraging superposition and entanglement to calculate previously unsolvable cryptographic and optimization matrices.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <rect x="8" y="8" width="32" height="32" rx="4" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M24 8v10M24 30v10M8 24h10M30 24h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M14 14l5 5M29 29l5 5M14 30l5-5M29 19l5 5" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
      </svg>
    )
  },
  {
    title: 'Artificial General Intelligence',
    color: '#ff007a',
    description: 'Self-improving neural network fabrics executing across globally distributed edge nodes, matching human cognitive flexibility in reasoning and coding.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="14" r="4" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="28" r="4" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="36" cy="28" r="4" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="24" cy="38" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M24 18l-9 7M24 18l9 7M15 30l6 5M33 30l-6 5M16 28h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  },
  {
    title: 'Brain-Computer Interface',
    color: '#bd00ff',
    description: 'Ultra-low latency neural telemetry interfaces resolving high-density cortical signals into seamless digital execution vectors.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <path d="M14 16c0-4 4-8 10-8s10 4 10 8c0 5-3 8-5 11v5h-10v-5c-2-3-5-6-5-11z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M20 32v6M28 32v6M18 42h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="24" cy="16" r="2.5" fill="currentColor" />
        <path d="M18 16h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      </svg>
    )
  },
  {
    title: 'Space Technology',
    color: '#ff7a00',
    description: 'Deep space telemetry and gravitational assist mechanics governing ion-drive exploratory drone deployment in remote solar systems.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <path d="M16 32l16-16M18 14l16 16M24 8l16 16-8 8-16-16L24 8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="36" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 40a16 16 0 0120-20" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      </svg>
    )
  },
  {
    title: 'Sustainable Energy',
    color: '#00ffa0',
    description: 'High-yield magnetic confinement fusion reactors delivering stable, infinite grid-level clean energy output.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="1.5" />
        <path d="M24 10v28M10 24h28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="24" cy="24" r="5" fill="currentColor" />
      </svg>
    )
  }
];

export const cubes = [
  {
    title: 'Artificial Intelligence',
    color: '#00f0ff',
    description: 'Advanced neural architectures enabling machines to perceive, reason, and act with unprecedented cognitive capabilities across domains.',
    futureApps: ['Autonomous Systems', 'Medical Diagnostics', 'Creative AI'],
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="18" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 36c0-6 5-10 12-10s12 4 12 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="24" cy="18" r="2" fill="currentColor" />
        <path d="M18 12l-4-4M30 12l4-4M24 10V5" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
      </svg>
    )
  },
  {
    title: 'Machine Learning',
    color: '#ff007a',
    description: 'Self-optimizing algorithms that iteratively improve from data patterns, powering predictive models and intelligent decision systems.',
    futureApps: ['Drug Discovery', 'Climate Modeling', 'Financial Forecasting'],
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <path d="M8 38l8-12 6 8 8-16 10 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="16" cy="26" r="2" fill="currentColor" />
        <circle cx="22" cy="34" r="2" fill="currentColor" />
        <circle cx="30" cy="18" r="2" fill="currentColor" />
      </svg>
    )
  },
  {
    title: 'Robotics',
    color: '#bd00ff',
    description: 'Autonomous mechatronic systems integrating perception, planning, and manipulation to augment human capability in hazardous and precision environments.',
    futureApps: ['Surgical Robots', 'Space Exploration', 'Smart Manufacturing'],
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <rect x="14" y="16" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="20" cy="24" r="2" fill="currentColor" />
        <circle cx="28" cy="24" r="2" fill="currentColor" />
        <path d="M18 32v6M30 32v6M24 16v-6M20 10h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  },
  {
    title: 'Internet of Things',
    color: '#00ffa0',
    description: 'Billions of interconnected sensors and edge devices forming a global mesh network enabling real-time monitoring and intelligent automation.',
    futureApps: ['Smart Cities', 'Precision Agriculture', 'Industrial IoT'],
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="4" fill="currentColor" />
        <circle cx="24" cy="24" r="10" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 3" />
        <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
        <circle cx="14" cy="14" r="2" fill="currentColor" opacity="0.7" />
        <circle cx="34" cy="14" r="2" fill="currentColor" opacity="0.7" />
        <circle cx="34" cy="34" r="2" fill="currentColor" opacity="0.7" />
        <circle cx="14" cy="34" r="2" fill="currentColor" opacity="0.7" />
      </svg>
    )
  },
  {
    title: 'Blockchain',
    color: '#ff7a00',
    description: 'Decentralized cryptographic ledger technology ensuring immutable, transparent, and trustless data integrity across distributed networks.',
    futureApps: ['Digital Identity', 'Supply Chain', 'Decentralized Finance'],
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <rect x="16" y="8" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="16" y="30" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M24 18v12" stroke="currentColor" strokeWidth="1.5" />
        <path d="M18 18v4l-6 4v4M30 18v4l6 4v4" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
      </svg>
    )
  },
  {
    title: 'Cyber Security',
    color: '#00e0c0',
    description: 'Zero-trust defensive frameworks and quantum-resistant encryption protocols protecting critical digital infrastructure from advanced persistent threats.',
    futureApps: ['Quantum Encryption', 'AI Threat Detection', 'Zero-Knowledge Proofs'],
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <path d="M24 6l14 6v12c0 10-6 16-14 20C16 40 10 34 10 24V12l14-6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M20 24l4 4 6-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    title: 'AR / VR',
    color: '#c840ff',
    description: 'Immersive spatial computing platforms blending digital overlays with physical reality, enabling new paradigms for training, collaboration, and entertainment.',
    futureApps: ['Virtual Classrooms', 'Digital Twin Ops', 'Immersive Healthcare'],
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <rect x="8" y="16" width="32" height="18" rx="4" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="18" cy="25" r="4" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="30" cy="25" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M22 25h4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M14 16l-2-4M34 16l2-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    )
  },
  {
    title: 'Space Technology',
    color: '#ffcc00',
    description: 'Ion-drive propulsion, orbital manufacturing, and deep-space telemetry systems enabling humanity\'s expansion beyond Earth orbit.',
    futureApps: ['Mars Colonization', 'Orbital Factories', 'Asteroid Mining'],
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <path d="M16 32l16-16M18 14l16 16M24 8l16 16-8 8-16-16L24 8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="36" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 40a16 16 0 0120-20" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      </svg>
    )
  }
];

export const aiCoreNodes = [
  {
    title: 'Artificial Intelligence',
    label: 'AI Core',
    color: '#00f0ff',
    description: 'Self-evolving neural architectures capable of cognitive adaptation and autonomous reasoning across hyper-dimensional space.',
    techMeta: ['SYS STATUS: ACTIVE', 'LATENCY: 1.4ms'],
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
    techMeta: ['SYS STATUS: ACTIVE', 'LATENCY: 0.8ms'],
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
    techMeta: ['SYS STATUS: ACTIVE', 'LATENCY: 2.1ms'],
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
    techMeta: ['SYS STATUS: ACTIVE', 'LATENCY: 0.2ms'],
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
    techMeta: ['SYS STATUS: ACTIVE', 'LATENCY: 1.1ms'],
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
    techMeta: ['SYS STATUS: ACTIVE', 'LATENCY: 3.6ms'],
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
];

export const terminalData = [
  {
    title: 'Autonomous Systems',
    color: '#00ffa0',
    description: 'Self-correcting vehicular navigation matrices and machine learning sensory interfaces for drone locomotion.',
    techMeta: ['SUBSYSTEM: NAVIGATION', 'STATUS: OPERATIONAL'],
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="10" stroke="currentColor" strokeWidth="1.5" />
        <path d="M24 14V6M24 42v-8M14 24H6M42 24h-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 8l8 8M40 8l-8 8M8 40l8-8M40 40l-8-8" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      </svg>
    )
  },
  {
    title: 'Industrial Robots',
    color: '#00ffa0',
    description: 'Heavy duty multi-axis articulation armatures engineered for micro-millimeter precision welding and assembly.',
    techMeta: ['SUBSYSTEM: FABRICATION', 'STATUS: OPERATIONAL'],
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <path d="M8 40h32M12 40V24m0 0l16-12 12 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="28" cy="12" r="3" fill="currentColor" />
        <rect x="20" y="28" width="8" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  },
  {
    title: 'Medical Robotics',
    color: '#00ffa0',
    description: 'Micro-manipulator teleoperation platforms enabling sub-millimeter surgical accuracy and real-time biometric feedback.',
    techMeta: ['SUBSYSTEM: MEDICAL', 'STATUS: OPERATIONAL'],
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <path d="M24 8v32M8 24h32" stroke="currentColor" strokeWidth="2.0" strokeLinecap="round" />
        <rect x="18" y="18" width="12" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="24" cy="24" r="2.5" fill="currentColor" />
      </svg>
    )
  }
];

export const robotInfo = {
  title: 'Robotics Research Lab',
  color: '#00f0ff',
  description: 'Welcome to the Robotics Research Lab. This facility houses advanced mechatronic systems, precision welding armatures, and a fully autonomous humanoid platform engineered for adaptive motion and environmental perception.',
  techMeta: ['FACILITY: ACTIVE', 'CLEARANCE: LEVEL 3'],
  icon: (
    <svg viewBox="0 0 48 48" fill="none">
      <rect x="14" y="16" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="20" cy="24" r="2" fill="currentColor" />
      <circle cx="28" cy="24" r="2" fill="currentColor" />
      <path d="M18 32v6M30 32v6M24 16v-6M20 10h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
};
