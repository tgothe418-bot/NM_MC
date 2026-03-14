import React from 'react';
import { useArchitectStore } from '../../store/architectStore';

interface SystemGhostProps {
  className?: string;
  floating?: boolean;
  active?: boolean;
}

export const SystemGhost: React.FC<SystemGhostProps> = ({ className = "", floating = true, active = false }) => {
  // The Ghost is now self-aware. It pulls its own mood from the global store.
  const { mood } = useArchitectStore();
  const { current_vibe: vibe, arousal } = mood;

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
  const speedBoost = active ? 2 : 1;
  const floatDuration = Math.max(0.5, (4 - (arousal * 3)) / speedBoost) + "s";
  const tailDuration = Math.max(0.2, (2 - (arousal * 1.5)) / speedBoost) + "s";
  const wanderDuration = (active ? 10 : 20) + "s";
  
  // 3. Determine Eye/Mouth Shape based on Vibe
  const isHostile = vibe === 'Predatory' || vibe === 'Glitchy';
  const isSad = vibe === 'Melancholy';

  const baseClasses = floating ? 'fixed pointer-events-none z-0 ghost-animate-wander' : 'pointer-events-none z-0';
  const positionClass = className.includes('absolute') || className.includes('fixed') || className.includes('relative') ? '' : 'relative';

  return (
    // Z-index set to strictly stay behind modal text but over background colors
    <div className={`${baseClasses} ${positionClass} flex items-center justify-center ${className}`}>
      <style>{`
        @keyframes ghost-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-10px) rotate(2deg); }
          50% { transform: translateY(-5px) rotate(-2deg); }
          75% { transform: translateY(-15px) rotate(1deg); }
        }
        @keyframes ghost-wander {
          0%, 100% { left: 50%; top: -5%; transform: translateX(-50%); }
          25% { left: 85%; top: 20%; transform: translateX(-50%); }
          50% { left: 15%; top: 50%; transform: translateX(-50%); }
          75% { left: 80%; top: 15%; transform: translateX(-50%); }
        }
        @keyframes ghost-orbit {
          0% { left: 50%; top: 50%; transform: translate(-50%, -50%) rotate(0deg) translateX(250px) rotate(0deg); }
          100% { left: 50%; top: 50%; transform: translate(-50%, -50%) rotate(360deg) translateX(250px) rotate(-360deg); }
        }
        @keyframes tail-wag {
          0%, 100% { d: path('M 30 80 Q 50 90 70 80 Q 90 70 110 80 L 110 40 L 30 40 Z'); }
          50% { d: path('M 30 80 Q 50 70 70 80 Q 90 90 110 80 L 110 40 L 30 40 Z'); }
        }
        .ghost-animate-float {
          animation: ghost-float ${floatDuration} ease-in-out infinite;
        }
        .ghost-animate-wander {
          animation: ${active ? `ghost-orbit 4s linear infinite` : `ghost-wander ${wanderDuration} ease-in-out infinite`};
        }
        .ghost-animate-tail {
          animation: tail-wag ${tailDuration} ease-in-out infinite;
        }
        ${vibe === 'Glitchy' ? `
        @keyframes ghost-glitch {
          0%, 96%, 98%, 100% { transform: translate(0, 0) scale(1); filter: hue-rotate(0deg); }
          97% { transform: translate(-10px, 10px) scale(1.1) skewX(20deg); filter: hue-rotate(90deg); opacity: 0.5; }
          99% { transform: translate(10px, -10px) scale(0.9) skewX(-20deg); filter: hue-rotate(-90deg); opacity: 0.5; }
        }
        .ghost-animate-float {
           animation: ghost-float ${floatDuration} ease-in-out infinite, ghost-glitch 2s infinite;
        }
        ` : ''}
      `}</style>

      {/* The Ghost SVG */}
      <svg 
        viewBox="0 0 140 100" 
        className={`ghost-animate-float w-full h-full drop-shadow-2xl transition-all duration-700`}
        style={{ filter: `drop-shadow(0px 0px 8px ${glowColor})` }}
      >
        <defs>
          <linearGradient id="ghostGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={coreColor} stopOpacity="0.9" />
            <stop offset="100%" stopColor={coreColor} stopOpacity="0.2" />
          </linearGradient>
        </defs>

        <g className="transition-all duration-700">
          <path 
            className="ghost-animate-tail transition-colors duration-700"
            fill="url(#ghostGrad)" 
            d="M 30 80 Q 50 90 70 80 Q 90 70 110 80 L 110 40 L 30 40 Z" 
          />
          <path 
            fill="url(#ghostGrad)" 
            d={vibe === 'Predatory' ? "M 30 40 L 70 10 L 110 40 Z" : "M 30 40 C 30 10, 110 10, 110 40 Z"} 
            className="transition-all duration-700"
          />

          <g stroke="white" strokeWidth="1" opacity={0.1 + (arousal * 0.4)} fill="none">
             <path d="M 40 40 L 40 60 L 50 60" />
             <circle cx="50" cy="60" r="1.5" fill="white" />
             <path d="M 100 35 L 100 55 L 90 55 L 90 70" />
             <circle cx="90" cy="70" r="1.5" fill="white" />
          </g>

          <g className="transition-all duration-500">
            <ellipse cx="60" cy="40" rx={isHostile ? 4 : 5} ry={isHostile ? 3 : 6} fill="white" />
            <ellipse cx="80" cy="40" rx={isHostile ? 4 : 5} ry={isHostile ? 3 : 6} fill="white" />
            <circle cx={isSad ? 59 : 61} cy={isHostile ? 40 : 41} r="2" fill="#0f172a" />
            <circle cx={isSad ? 79 : 81} cy={isHostile ? 40 : 41} r="2" fill="#0f172a" />
            
            {isHostile && (
               <path d="M 55 33 L 65 37 M 85 33 L 75 37" stroke="white" strokeWidth="2" strokeLinecap="round" />
            )}
            {isSad && (
               <path d="M 55 37 L 65 33 M 85 37 L 75 33" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            )}
          </g>

          <path 
            d={isHostile ? "M 65 52 Q 70 50 75 52" : isSad ? "M 65 52 Q 70 48 75 52" : "M 65 50 Q 70 55 75 50"} 
            stroke="white" 
            strokeWidth="2" 
            fill="none" 
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </g>
      </svg>
    </div>
  );
};
