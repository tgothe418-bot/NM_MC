import React, { useState, useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
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

  const baseClasses = floating ? 'absolute pointer-events-none z-0 ghost-animate-wander' : 'pointer-events-none z-0';
  const positionClass = className.includes('absolute') || className.includes('fixed') || className.includes('relative') ? '' : 'relative';

  // --- Procedural Blinking ---
  const [blinkScale, setBlinkScale] = useState(1);
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let innerTimeoutId: NodeJS.Timeout;
    const triggerBlink = () => {
      const nextBlink = Math.random() * 4000 + 2000; // 2000ms to 6000ms
      timeoutId = setTimeout(() => {
        setBlinkScale(0);
        innerTimeoutId = setTimeout(() => {
          setBlinkScale(1);
          triggerBlink();
        }, 100);
      }, nextBlink);
    };
    triggerBlink();
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(innerTimeoutId);
    };
  }, []);

  // --- Gaze Tracking ---
  const pupilX = useSpring(0, { stiffness: 100, damping: 10 });
  const pupilY = useSpring(0, { stiffness: 100, damping: 10 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = (e.clientY / window.innerHeight) * 2 - 1;
      pupilX.set(normX);
      pupilY.set(normY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [pupilX, pupilY]);

  const pupilOffsetX = useTransform(pupilX, [-1, 1], [-3, 3]);
  const pupilOffsetY = useTransform(pupilY, [-1, 1], [-3, 3]);

  const baseLeftPupilX = isSad ? 59 : 61;
  const baseRightPupilX = isSad ? 79 : 81;
  const basePupilY = isHostile ? 40 : 41;

  const leftPupilCx = useTransform(pupilOffsetX, x => baseLeftPupilX + x);
  const rightPupilCx = useTransform(pupilOffsetX, x => baseRightPupilX + x);
  const pupilCy = useTransform(pupilOffsetY, y => basePupilY + y);

  // --- Asymmetrical Rendering for Glitchy Vibe ---
  const [glitchOffset, setGlitchOffset] = useState(0);
  useEffect(() => {
    if (vibe === 'Glitchy') {
      const interval = setInterval(() => {
        setGlitchOffset(Math.random() * 4 - 2); // Random offset between -2 and 2
      }, 200);
      return () => clearInterval(interval);
    } else {
      setGlitchOffset(0);
    }
  }, [vibe]);

  const eyeRx = isHostile ? 4 : 5;
  const baseEyeRy = isHostile ? 3 : 6;
  const rightEyeRy = vibe === 'Glitchy' ? baseEyeRy + glitchOffset : baseEyeRy;

  const leftEyebrowD = isHostile 
    ? (vibe === 'Glitchy' ? "M 55 35 L 65 39" : "M 55 33 L 65 37")
    : (isSad ? "M 55 37 L 65 33" : "");
  const rightEyebrowD = isHostile
    ? (vibe === 'Glitchy' ? "M 85 31 L 75 35" : "M 85 33 L 75 37")
    : (isSad ? "M 85 37 L 75 33" : "");

  // --- Dynamic Mouth Amplitude ---
  let mouthD = "";
  if (isHostile) {
    const qY = 50 - (arousal * 8); 
    mouthD = `M 65 52 Q 70 ${qY} 75 52`;
  } else if (isSad) {
    const qY = 48 - (arousal * 5); 
    mouthD = `M 65 52 Q 70 ${qY} 75 52`;
  } else {
    const qY = 55 + (arousal * 10); 
    mouthD = `M 65 50 Q 70 ${qY} 75 50`;
  }

  const springTransition = { type: "spring" as const, stiffness: 100, damping: 10 };

  return (
    <div className={`${baseClasses} ${positionClass} flex items-center justify-center ${className}`}>
      <style>{`
        @keyframes ghost-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-10px) rotate(2deg); }
          50% { transform: translateY(-5px) rotate(-2deg); }
          75% { transform: translateY(-15px) rotate(1deg); }
        }
        @keyframes ghost-wander {
          0%, 100% { left: 50%; top: 5%; transform: translateX(-50%); }
          25% { left: 75%; top: 25%; transform: translateX(-50%); }
          50% { left: 25%; top: 55%; transform: translateX(-50%); }
          75% { left: 70%; top: 20%; transform: translateX(-50%); }
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
        className={`ghost-animate-float w-full h-full drop-shadow-2xl pointer-events-none`}
        style={{ filter: `drop-shadow(0px 0px 8px ${glowColor})`, transition: 'filter 0.7s' }}
      >
        <defs>
          <linearGradient id="ghostGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={coreColor} stopOpacity="0.9" />
            <stop offset="100%" stopColor={coreColor} stopOpacity="0.2" />
          </linearGradient>
        </defs>

        <motion.g>
          <path 
            className="ghost-animate-tail"
            fill="url(#ghostGrad)" 
            d="M 30 80 Q 50 90 70 80 Q 90 70 110 80 L 110 40 L 30 40 Z" 
            style={{ transition: 'fill 0.7s' }}
          />
          <path 
            fill="url(#ghostGrad)" 
            d={vibe === 'Predatory' ? "M 30 40 L 70 10 L 110 40 Z" : "M 30 40 C 30 10, 110 10, 110 40 Z"} 
            className="transition-all duration-700"
            style={{ transition: 'fill 0.7s, d 0.7s' }}
          />

          <motion.g stroke="white" strokeWidth="1" animate={{ opacity: 0.1 + (arousal * 0.4) }} transition={springTransition} fill="none">
             <path d="M 40 40 L 40 60 L 50 60" />
             <circle cx="50" cy="60" r="1.5" fill="white" />
             <path d="M 100 35 L 100 55 L 90 55 L 90 70" />
             <circle cx="90" cy="70" r="1.5" fill="white" />
          </motion.g>

          <motion.g>
            <motion.ellipse 
              animate={{ cx: 60, cy: 40, rx: eyeRx, ry: baseEyeRy, scaleY: blinkScale }} 
              transition={springTransition} 
              fill="white" 
              style={{ transformOrigin: "60px 40px" }}
            />
            <motion.ellipse 
              animate={{ cx: 80, cy: 40, rx: eyeRx, ry: rightEyeRy, scaleY: blinkScale }} 
              transition={springTransition} 
              fill="white" 
              style={{ transformOrigin: "80px 40px" }}
            />
            <motion.circle 
              cx={leftPupilCx} 
              cy={pupilCy} 
              r="2" 
              fill="#0f172a" 
            />
            <motion.circle 
              cx={rightPupilCx} 
              cy={pupilCy} 
              r="2" 
              fill="#0f172a" 
            />
            
            {(isHostile || isSad) && (
               <motion.path 
                 animate={{ d: leftEyebrowD }} 
                 transition={springTransition}
                 stroke="white" 
                 strokeWidth={isHostile ? 2 : 1.5} 
                 strokeLinecap="round" 
               />
            )}
            {(isHostile || isSad) && (
               <motion.path 
                 animate={{ d: rightEyebrowD }} 
                 transition={springTransition}
                 stroke="white" 
                 strokeWidth={isHostile ? 2 : 1.5} 
                 strokeLinecap="round" 
               />
            )}
          </motion.g>

          <motion.path 
            animate={{ d: mouthD }} 
            transition={springTransition}
            stroke="white" 
            strokeWidth="2" 
            fill="none" 
            strokeLinecap="round"
          />
        </motion.g>
      </svg>
    </div>
  );
};
