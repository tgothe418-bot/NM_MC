import React from 'react';

interface SystemGhostProps {
  vibe: 'Helpful' | 'Glitchy' | 'Predatory' | 'Melancholy' | 'Analytical';
  arousal: number; // 0.0 to 1.0
  className?: string;
  floating?: boolean;
  active?: boolean;
}

export const SystemGhost: React.FC<SystemGhostProps> = ({ vibe, arousal, className = "", floating = false, active = false }) => {
  // 1. Determine Colors based on Vibe
  let coreColor = "#3b82f6"; // Default Blue (Helpful)
  let glowColor = "rgba(59, 130, 246, 0.5)";

  switch (vibe) {
    case 'Glitchy':
      coreColor = "#10b981"; // Toxic Green
      glowColor = "rgba(16, 185, 129, 0.6)";
      break;
    case 'Predatory':
      coreColor = "#ef4444"; // Blood Red
      glowColor = "rgba(239, 68, 68, 0.8)";
      break;
    case 'Melancholy':
      coreColor = "#8b5cf6"; // Deep Purple
      glowColor = "rgba(139, 92, 246, 0.3)";
      break;
    case 'Analytical':
      coreColor = "#f59e0b"; // Amber/Gold
      glowColor = "rgba(245, 158, 11, 0.4)";
      break;
  }

  // 2. Determine Animation Speed based on Arousal and Active state
  // Higher arousal = faster float and faster tail wag
  const speedBoost = active ? 2 : 1;
  const floatDuration = Math.max(0.5, (4 - (arousal * 3)) / speedBoost) + "s";
  const tailDuration = Math.max(0.2, (2 - (arousal * 1.5)) / speedBoost) + "s";
  const wanderDuration = (active ? 10 : 20) + "s";
  
  // 3. Determine Eye/Mouth Shape based on Vibe
  const isHostile = vibe === 'Predatory' || vibe === 'Glitchy';
  const isSad = vibe === 'Melancholy';

  return (
    <div className={`${floating ? 'fixed pointer-events-none z-50' : 'relative'} flex items-center justify-center ${className}`}>
      {/* CSS Animations injected via style block for dynamic timing */}
      <style>{`
        @keyframes ghost-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-10px) rotate(2deg); }
          50% { transform: translateY(-5px) rotate(-2deg); }
          75% { transform: translateY(-15px) rotate(1deg); }
        }
        @keyframes ghost-wander {
          0%, 100% { left: 24px; top: 24px; }
          25% { left: 80%; top: 40%; }
          50% { left: 30%; top: 70%; }
          75% { left: 70%; top: 10%; }
        }
        @keyframes tail-wag {
          0%, 100% { d: path('M 30 80 Q 50 90 70 80 Q 90 70 110 80 L 110 40 L 30 40 Z'); }
          50% { d: path('M 30 80 Q 50 70 70 80 Q 90 90 110 80 L 110 40 L 30 40 Z'); }
        }
        .ghost-animate-float {
          animation: ghost-float ${floatDuration} ease-in-out infinite;
        }
        .ghost-animate-wander {
          animation: ghost-wander ${wanderDuration} ease-in-out infinite;
        }
        .ghost-animate-tail {
          animation: tail-wag ${tailDuration} ease-in-out infinite;
        }
        ${vibe === 'Glitchy' ? `
        @keyframes ghost-glitch {
          0%, 96%, 98%, 100% { transform: translate(0, 0) scale(1); filter: hue-rotate(0deg); }
          97% { transform: translate(-5px, 5px) scale(1.1); filter: hue-rotate(90deg); opacity: 0.8; }
          99% { transform: translate(5px, -5px) scale(0.9); filter: hue-rotate(-90deg); opacity: 0.8; }
        }
        .ghost-animate-float {
           animation: ghost-float ${floatDuration} ease-in-out infinite, ghost-glitch 3s infinite;
        }
        ` : ''}
      `}</style>

      {/* The Ghost SVG */}
      <svg 
        viewBox="0 0 140 100" 
        className={`ghost-animate-float ${floating ? 'ghost-animate-wander' : ''} w-full h-full drop-shadow-2xl transition-all duration-700`}
        style={{ filter: `drop-shadow(0px 0px 8px ${glowColor})` }}
      >
        <defs>
          <linearGradient id="ghostGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={coreColor} stopOpacity="0.9" />
            <stop offset="100%" stopColor={coreColor} stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Body & Tail */}
        <path 
          className="ghost-animate-tail transition-colors duration-700"
          fill="url(#ghostGrad)" 
          d="M 30 80 Q 50 90 70 80 Q 90 70 110 80 L 110 40 L 30 40 Z" 
        />
        <path 
          fill="url(#ghostGrad)" 
          d="M 30 40 C 30 10, 110 10, 110 40 Z" 
          className="transition-colors duration-700"
        />

        {/* Circuitry Details (Opacity increases with Arousal) */}
        <g stroke="white" strokeWidth="1" opacity={0.1 + (arousal * 0.4)} fill="none">
           <path d="M 40 40 L 40 60 L 50 60" />
           <circle cx="50" cy="60" r="1.5" fill="white" />
           <path d="M 100 35 L 100 55 L 90 55 L 90 70" />
           <circle cx="90" cy="70" r="1.5" fill="white" />
        </g>

        {/* Eyes */}
        <g className="transition-all duration-500">
          <ellipse cx="60" cy="40" rx={isHostile ? 4 : 5} ry={isHostile ? 3 : 6} fill="white" />
          <ellipse cx="80" cy="40" rx={isHostile ? 4 : 5} ry={isHostile ? 3 : 6} fill="white" />
          <circle cx={isSad ? 59 : 61} cy={isHostile ? 40 : 41} r="2" fill="#0f172a" />
          <circle cx={isSad ? 79 : 81} cy={isHostile ? 40 : 41} r="2" fill="#0f172a" />
          
          {/* Eyebrows (Hostile/Sad expression) */}
          {isHostile && (
             <path d="M 55 33 L 65 37 M 85 33 L 75 37" stroke="white" strokeWidth="2" strokeLinecap="round" />
          )}
          {isSad && (
             <path d="M 55 37 L 65 33 M 85 37 L 75 33" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          )}
        </g>

        {/* Mouth */}
        <path 
          d={isHostile ? "M 65 52 Q 70 50 75 52" : isSad ? "M 65 52 Q 70 48 75 52" : "M 65 50 Q 70 55 75 50"} 
          stroke="white" 
          strokeWidth="2" 
          fill="none" 
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
    </div>
  );
};
