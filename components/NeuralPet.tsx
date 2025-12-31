
import React, { useEffect, useState } from 'react';

interface NeuralPetProps {
  step: number;
  answers: any;
  currentInput: string;
}

export const NeuralPet: React.FC<NeuralPetProps> = ({ step, answers, currentInput }) => {
  // Derive state from answers
  const mode = answers.find((a: any) => a === 'Survivor' || a === 'Villain') || 'Neutral';
  const perspective = answers.find((a: any) => a === 'First Person' || a === 'Third Person');
  const cluster = answers.find((a: any) => ['Flesh', 'System', 'Haunting', 'Self', 'Blasphemy', 'Survival', 'Desire'].includes(a));
  
  // Visual Parameters
  const [pulseSpeed, setPulseSpeed] = useState('3s');
  const [baseColor, setBaseColor] = useState('#333');
  const [eyeCount, setEyeCount] = useState(0);
  const [spikiness, setSpikiness] = useState(0);
  const [auraColor, setAuraColor] = useState('rgba(255,255,255,0.1)');

  useEffect(() => {
    // Evolve based on choices
    if (mode === 'Survivor') {
      setBaseColor('#0ea5e9'); // Sky blue
      setSpikiness(0.2);
      setAuraColor('rgba(14, 165, 233, 0.3)');
    } else if (mode === 'Villain') {
      setBaseColor('#ef4444'); // Red
      setSpikiness(0.8);
      setAuraColor('rgba(239, 68, 68, 0.3)');
    }

    if (perspective === 'First Person') {
      setEyeCount(1);
    } else if (perspective === 'Third Person') {
      setEyeCount(3);
    }

    if (cluster) {
      if (cluster === 'Flesh') setBaseColor('#881337'); // Dark Red
      if (cluster === 'System') setBaseColor('#10b981'); // Green
      if (cluster === 'Haunting') setBaseColor('#b45309'); // Gold
      if (cluster === 'Survival') setBaseColor('#06b6d4'); // Cyan
      setPulseSpeed('1s');
    }

  }, [mode, perspective, cluster, step]);

  // Generate dynamic SVG path for blob
  const [d, setD] = useState("");
  
  useEffect(() => {
    let t = 0;
    const interval = setInterval(() => {
      t += 0.1;
      // Simple blob math
      const points = [];
      const numPoints = 12;
      const radius = 40;
      const noise = 5 + (spikiness * 10);
      
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const variance = Math.sin(t * 2 + i + (spikiness * 10)) * noise;
        const r = radius + variance;
        const x = 50 + Math.cos(angle) * r;
        const y = 50 + Math.sin(angle) * r;
        points.push(`${x},${y}`);
      }
      
      // Close loop
      const pathData = `M ${points[0]} ` + points.slice(1).map(p => `L ${p}`).join(' ') + ` Z`;
      setD(pathData);
    }, 50);
    return () => clearInterval(interval);
  }, [spikiness]);

  return (
    <div className="relative w-full h-full flex items-center justify-center animate-fadeIn min-h-[200px]">
      {/* Container Aura */}
      <div 
        className="absolute inset-0 rounded-full blur-3xl transition-colors duration-1000 opacity-20 transform scale-75"
        style={{ backgroundColor: auraColor }}
      />
      
      {/* The Creature */}
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl overflow-visible max-w-[300px] max-h-[300px]">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Body */}
        <path 
          d={d} 
          fill={baseColor} 
          stroke="rgba(255,255,255,0.2)" 
          strokeWidth="1"
          className="transition-all duration-500 ease-in-out"
          filter="url(#glow)"
        />

        {/* Eyes */}
        {eyeCount === 1 && (
           <g className="animate-pulse">
             <circle cx="50" cy="50" r="12" fill="white" />
             <circle cx="50" cy="50" r="4" fill="black">
                <animate attributeName="cy" values="50;52;50" dur="3s" repeatCount="indefinite" />
             </circle>
           </g>
        )}

        {eyeCount >= 3 && (
           <g>
             <circle cx="50" cy="40" r="6" fill="white" className="animate-pulse" />
             <circle cx="50" cy="40" r="2" fill="black" />
             
             <circle cx="35" cy="60" r="4" fill="white" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
             <circle cx="35" cy="60" r="1.5" fill="black" />

             <circle cx="65" cy="60" r="4" fill="white" className="animate-pulse" style={{ animationDelay: '1s' }} />
             <circle cx="65" cy="60" r="1.5" fill="black" />
           </g>
        )}
        
        {/* "Cute" Expression / Glitch */}
        {!cluster && (
            <path d="M 40 60 Q 50 65 60 60" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        )}
      </svg>

      {/* Label Overlay - optional if not handled by parent */}
      <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
         <div className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.3em] opacity-60">
            {mode === 'Neutral' ? 'Incubating...' : `Form: ${mode}`}
         </div>
      </div>
    </div>
  );
};
