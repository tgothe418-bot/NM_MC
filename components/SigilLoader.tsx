


import React from 'react';
import { Eye, Radio, Zap, Activity, Ghost, Fingerprint, Database, Heart } from 'lucide-react';

interface SigilLoaderProps {
  cluster?: string;
  text?: string;
}

export const SigilLoader: React.FC<SigilLoaderProps> = ({ cluster, text = "Simulating Consequences..." }) => {
  // Determine Type
  let type = 'generic';
  if (cluster?.includes("Flesh")) type = 'flesh';
  if (cluster?.includes("System")) type = 'system';
  if (cluster?.includes("Haunting")) type = 'haunting';
  if (cluster?.includes("Self")) type = 'self';
  if (cluster?.includes("Blasphemy")) type = 'blasphemy';
  if (cluster?.includes("Survival")) type = 'survival';
  if (cluster?.includes("Desire")) type = 'desire';

  // Renderers
  const renderSystem = () => (
    <div className="relative w-32 h-32 flex items-center justify-center text-system-green drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]">
        {/* Outer Ring - Dashed */}
        <svg className="absolute inset-0 w-full h-full animate-[spin_4s_linear_infinite]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="10 5" opacity="0.5" />
        </svg>
        {/* Inner Glitch Ring */}
        <svg className="absolute inset-0 w-full h-full animate-glitch" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="60 40" />
        </svg>
        {/* Core Data */}
        <div className="flex flex-col items-center animate-pulse relative z-10">
            <Database className="w-8 h-8" />
            <div className="text-[8px] font-mono mt-1 tracking-tighter">PROCESSING</div>
        </div>
        {/* Scanline */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-system-green/20 to-transparent h-1/4 w-full animate-system-scan opacity-30 pointer-events-none rounded-full overflow-hidden"></div>
    </div>
  );

  const renderFlesh = () => (
    <div className="relative w-32 h-32 flex items-center justify-center text-fresh-blood drop-shadow-[0_0_15px_rgba(220,20,60,0.8)]">
        {/* Pulsing Organ */}
        <div className="absolute inset-0 bg-red-900/20 rounded-full animate-flesh-pulse blur-xl"></div>
        <svg className="absolute inset-0 w-full h-full animate-[spin_20s_linear_infinite]" viewBox="0 0 100 100">
             <path d="M50 10 Q70 10 80 30 T90 60 Q80 90 50 90 T10 60 Q20 30 50 10" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
             <path d="M50 15 Q65 15 75 35 T85 65 Q75 85 50 85 T15 65 Q25 35 50 15" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.4" transform="rotate(45 50 50)" />
        </svg>
        <Activity className="w-10 h-10 animate-heartbeat text-red-500 relative z-10" />
    </div>
  );

  const renderHaunting = () => (
    <div className="relative w-32 h-32 flex items-center justify-center text-haunt-gold drop-shadow-[0_0_15px_rgba(180,83,9,0.6)]">
        <div className="absolute inset-0 bg-amber-900/10 rounded-full animate-haunt-pulse blur-md"></div>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            {/* Rotating Runes/Ring */}
            <g className="animate-[spin_10s_linear_infinite_reverse] origin-center">
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <circle cx="50" cy="5" r="2" fill="currentColor" opacity="0.8" />
                <circle cx="50" cy="95" r="2" fill="currentColor" opacity="0.8" />
                <circle cx="5" cy="50" r="2" fill="currentColor" opacity="0.8" />
                <circle cx="95" cy="50" r="2" fill="currentColor" opacity="0.8" />
            </g>
        </svg>
        <Ghost className="w-8 h-8 animate-bounce opacity-80 relative z-10" style={{ animationDuration: '3s' }} />
    </div>
  );
  
  const renderSurvival = () => (
      <div className="relative w-32 h-32 flex items-center justify-center text-survival-ice drop-shadow-[0_0_15px_rgba(165,242,243,0.5)]">
         <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
             <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
             <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
             <line x1="50" y1="50" x2="50" y2="5" stroke="currentColor" strokeWidth="2" className="animate-[spin_2s_linear_infinite] origin-center" />
         </svg>
         <Radio className="w-8 h-8 animate-pulse relative z-10" />
      </div>
  );

  const renderBlasphemy = () => (
      <div className="relative w-32 h-32 flex items-center justify-center text-blasphemy-purple drop-shadow-[0_0_15px_rgba(85,0,85,0.8)]">
          <svg className="absolute inset-0 w-full h-full animate-[spin_3s_linear_infinite]" viewBox="0 0 100 100">
              <polygon points="50,5 61,38 95,38 68,59 79,91 50,70 21,91 32,59 5,38 39,38" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>
          <Zap className="w-8 h-8 animate-pulse text-yellow-500 relative z-10" />
      </div>
  );
  
  const renderSelf = () => (
      <div className="relative w-32 h-32 flex items-center justify-center text-psych-indigo drop-shadow-[0_0_15px_rgba(75,0,130,0.6)]">
          <div className="absolute inset-0 border-2 border-current rounded-full animate-ping opacity-20"></div>
          <svg className="absolute inset-0 w-full h-full animate-[spin_8s_linear_infinite]" viewBox="0 0 100 100">
              <rect x="25" y="25" width="50" height="50" fill="none" stroke="currentColor" strokeWidth="1" />
              <rect x="25" y="25" width="50" height="50" fill="none" stroke="currentColor" strokeWidth="1" transform="rotate(45 50 50)" />
          </svg>
          <Fingerprint className="w-8 h-8 opacity-80 relative z-10" />
      </div>
  );

  const renderDesire = () => (
      <div className="relative w-32 h-32 flex items-center justify-center text-rose-500 drop-shadow-[0_0_15px_rgba(225,29,72,0.6)]">
          <div className="absolute inset-0 bg-rose-900/20 rounded-full animate-pulse blur-xl"></div>
          <svg className="absolute inset-0 w-full h-full animate-[spin_10s_linear_infinite]" viewBox="0 0 100 100">
              {/* Thorns */}
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 8" />
          </svg>
          <Heart className="w-10 h-10 animate-heartbeat text-rose-600 relative z-10" />
      </div>
  );

  const renderGeneric = () => (
    <div className="relative w-32 h-32 flex items-center justify-center text-gray-500 drop-shadow-[0_0_10px_rgba(107,114,128,0.5)]">
         {/* Layer 1: The Outer Ward (Counter-Clockwise Slow) */}
         <svg className="absolute inset-0 w-full h-full animate-[spin_12s_linear_infinite_reverse] opacity-40" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <path d="M50 2 L50 15 M98 50 L85 50 M50 98 L50 85 M2 50 L15 50" stroke="currentColor" strokeWidth="1" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="2 2" />
         </svg>

         {/* Layer 2: The Geometric Seal (Clockwise Medium) */}
         <svg className="absolute inset-0 w-3/4 h-3/4 m-auto animate-[spin_6s_linear_infinite]" viewBox="0 0 100 100">
             <rect x="20" y="20" width="60" height="60" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.8" />
             <rect x="20" y="20" width="60" height="60" fill="none" stroke="currentColor" strokeWidth="1" transform="rotate(45 50 50)" opacity="0.8" />
         </svg>

         {/* Layer 3: The Core (Pulse) */}
         <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-3 h-3 bg-current rounded-full animate-pulse shadow-[0_0_20px_currentColor]"></div>
         </div>
         
         {/* Layer 4: Inner Orbit (Clockwise Fast) */}
         <svg className="absolute inset-0 w-1/2 h-1/2 m-auto animate-[spin_3s_linear_infinite]" viewBox="0 0 100 100">
             <circle cx="50" cy="10" r="3" fill="currentColor" />
             <path d="M50 10 L50 90" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
             <path d="M10 50 L90 50" stroke="currentColor" strokeWidth="0.5" opacity="0.5" transform="rotate(45 50 50)" />
         </svg>
         
         <div className="absolute inset-0 flex items-center justify-center z-10">
             <Eye className="w-6 h-6 animate-pulse opacity-50" />
         </div>
    </div>
  );

  let content;
  let colorClass = "text-gray-500";

  switch (type) {
      case 'system': 
          content = renderSystem(); 
          colorClass = "text-system-green";
          break;
      case 'flesh': 
          content = renderFlesh(); 
          colorClass = "text-fresh-blood";
          break;
      case 'haunting': 
          content = renderHaunting(); 
          colorClass = "text-haunt-gold";
          break;
      case 'survival': 
          content = renderSurvival(); 
          colorClass = "text-survival-ice";
          break;
      case 'blasphemy': 
          content = renderBlasphemy(); 
          colorClass = "text-blasphemy-purple";
          break;
      case 'self': 
          content = renderSelf(); 
          colorClass = "text-psych-indigo";
          break;
      case 'desire':
          content = renderDesire();
          colorClass = "text-rose-500";
          break;
      default: 
          content = renderGeneric();
          break;
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fadeIn w-full">
      <div className="scale-125 transform transition-transform duration-700">
        {content}
      </div>
      <div className={`mt-10 font-serif text-sm italic tracking-widest animate-pulse opacity-80 ${colorClass}`}>
         {text}
      </div>
    </div>
  );
};
