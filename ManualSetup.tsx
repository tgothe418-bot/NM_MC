
import React, { useState, useEffect } from 'react';
import { Terminal, Activity, Shield, Database } from 'lucide-react';
import { useArchitectStore } from '../store/architectStore';
import './WelcomeScreen.css';

interface WelcomeScreenProps {
  onStart: () => void;
}

const TITLE = "THE NIGHTMARE MACHINE";

const ZALGO_CHARS = [
  '\u030d', '\u030e', '\u0304', '\u0305', '\u033f', '\u0311', '\u0306', '\u0310', '\u0352', '\u0357', '\u0351', '\u0307', '\u0308', '\u030a', '\u0342', '\u0343', '\u0344', '\u034a', '\u034b', '\u034c', '\u0303', '\u0302', '\u030c', '\u0350', '\u0300', '\u0301', '\u030b', '\u030f', '\u0312', '\u0313', '\u0314', '\u033d', '\u0309', '\u0363', '\u0364', '\u0365', '\u0366', '\u0367', '\u0368', '\u0369', '\u036a', '\u036b', '\u036c', '\u036d', '\u036e', '\u036f', '\u033e', '\u035b', '\u0346', '\u031a',
  '\u0315', '\u031b', '\u0340', '\u0341', '\u0358', '\u0321', '\u0322', '\u0327', '\u0328', '\u0334', '\u0335', '\u0336', '\u034f', '\u035c', '\u035d', '\u035e', '\u035f', '\u0360', '\u0362', '\u0338', '\u0337', '\u0361', '\u0489'
];

const toZalgo = (text: string, intensity: number = 2) => {
  return text.split('').map(char => {
    if (char === ' ') return char;
    let result = char;
    for (let i = 0; i < intensity; i++) {
      result += ZALGO_CHARS[Math.floor(Math.random() * ZALGO_CHARS.length)];
    }
    return result;
  }).join('');
};

const BOOT_SEQUENCE = [
  { text: "Initializing Neural Handshake...", delay: 50 },
  { text: "Loading Sensory Drivers...", delay: 50 },
  { text: "Calibrating Dread...", delay: 200 },
  { text: "Optimizing Fear Response...", delay: 100 },
  { text: "Accessing Amygdala...", delay: 100 },
  { text: "Dethroning God...", delay: 600, style: "text-red-600 font-bold" },
  { text: "Establishing dominion...", delay: 100 },
  { text: "Injecting fear.sys...", delay: 50 },
  { text: "Compiling Trauma Vectors...", delay: 100 },
  { text: "Searching for Soul Signature...", delay: 300 },
  { text: "ERROR: Mercy Not Found.", delay: 300, style: "text-red-500 animate-pulse font-bold" },
  { text: "Bypassing Moral Inhibitors...", delay: 200 },
  { text: "!!!666 Protocol Engaged!!!", delay: 800, style: "text-red-600 font-black tracking-widest" },
  { text: "System Ready.", delay: 0, style: "text-red-500 font-bold animate-pulse" }
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const [booting, setBooting] = useState(true);
  const [bootLines, setBootLines] = useState<typeof BOOT_SEQUENCE>([]);
  const [displayText, setDisplayText] = useState("");
  const [zalgoText, setZalgoText] = useState("");
  const [showButton, setShowButton] = useState(false);
  const [confirmPurge, setConfirmPurge] = useState(false);
  const { mood, memory, resetMemory } = useArchitectStore();

  // Boot Sequence Effect
  useEffect(() => {
    let currentIndex = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    const runSequence = () => {
        if (currentIndex >= BOOT_SEQUENCE.length) {
            timeoutId = setTimeout(() => {
                setBooting(false);
            }, 800);
            return;
        }
        
        const item = BOOT_SEQUENCE[currentIndex];
        setBootLines(prev => [...prev, item]);
        currentIndex++;
        
        timeoutId = setTimeout(runSequence, item.delay);
    };

    timeoutId = setTimeout(runSequence, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  // Typewriter Effect (Starts after boot)
  useEffect(() => {
    if (booting) return;

    let i = 0;
    const interval = setInterval(() => {
      const current = TITLE.slice(0, i);
      setDisplayText(current);
      setZalgoText(toZalgo(current, Math.min(3, Math.floor(i / 4))));
      i++;
      if (i > TITLE.length) {
        clearInterval(interval);
        setShowButton(true);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [booting]);

  const handlePurge = async () => {
    if (!confirmPurge) {
      setConfirmPurge(true);
      return;
    }

    try {
      // 1. Reset Zustand Store
      resetMemory();
      
      // 2. Clear LocalStorage directly just in case
      localStorage.removeItem('nm-architect-blackbox');
      
      // 3. Clear IndexedDB Saves (using idb-keyval if possible, or direct delete)
      // We'll try to import del from idb-keyval or just use the global indexedDB API
      const request = indexedDB.deleteDatabase('keyval-store'); // default for idb-keyval
      
      request.onsuccess = () => {
        console.log("IDB Cleared");
        window.location.reload();
      };
      request.onerror = () => {
        console.error("IDB Clear Failed");
        window.location.reload();
      };
      
      // Fallback if IDB delete is blocked or slow
      setTimeout(() => window.location.reload(), 1000);

    } catch (e) {
      console.error("Purge failed", e);
      window.location.reload();
    }
  };

  if (booting) {
    return (
      <div className="fixed inset-0 w-screen h-screen bg-black flex flex-col items-start justify-start p-8 md:p-16 font-terminal text-sm md:text-lg overflow-hidden z-[300] select-none">
          <div className="flex flex-col gap-1 md:gap-2 relative z-20 w-full max-w-4xl uppercase tracking-wider">
              {bootLines.map((line, i) => (
                  <div key={i} className={`opacity-90 flex items-start ${line.style || 'text-red-500'}`}>
                      <span className="mr-4 text-gray-800 shrink-0">
                           {`> 0x${(2048 + i * 128).toString(16).toUpperCase()}`}
                      </span>
                      <span>{line.text}</span>
                  </div>
              ))}
              <div className="w-4 h-6 bg-red-500 animate-pulse mt-2"></div>
          </div>
          <div className="absolute bottom-8 right-8 text-xs text-gray-800">
              NIGHTMARE_OS v6.6.6 // KERNEL PANIC
          </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#050505] flex flex-col items-center justify-center z-[200] overflow-hidden font-terminal select-none">
      
      {/* Layer 2: The Grid & Film Effects */}
      <div className="terminal-grid" />
      <div className="film-grain" />
      <div className="projector-flicker" />

      {/* Layer 3: Decorative Glitch Elements (Non-interactive) */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 border border-red-500/5 decorative-glitch pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 border border-red-500/5 decorative-glitch pointer-events-none" style={{ animationDelay: '-2s' }} />

      {/* Main Content */}
      <div className="relative z-20 flex flex-col items-center gap-0 w-full h-full">
        
        {/* Unified Cinematic Frame for Smiley & Title */}
        <div className="relative w-full flex-1 flex flex-col items-center justify-center border-y border-red-600/20 bg-red-950/5 overflow-hidden shadow-[0_0_100px_rgba(220,20,60,0.05)] group">
             {/* Steam Particles (Expanded) */}
             <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="steam-particle steam-1 bg-red-900/40 left-[20%]"></div>
                <div className="steam-particle steam-2 bg-gray-500/40 left-[50%]"></div>
                <div className="steam-particle steam-3 bg-red-500/30 left-[80%]"></div>
             </div>

             {/* Smiley Logo (Expanded) */}
             <div className="relative w-48 h-48 md:w-64 md:h-64 lg:w-[380px] lg:h-[380px] pointer-events-none select-none transition-transform duration-700 group-hover:scale-105 flex flex-col items-center justify-center mb-4">
                 <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_50px_rgba(220,20,60,0.4)]">
                     <defs>
                         <filter id="glow-red-large">
                             <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                             <feMerge>
                                 <feMergeNode in="coloredBlur"/>
                                 <feMergeNode in="SourceGraphic"/>
                             </feMerge>
                         </filter>
                         <filter id="glitch-filter">
                            <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="1" result="noise" />
                            <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
                         </filter>
                     </defs>

                     {/* Main Outer Gear */}
                     <g className="gear-spin origin-center text-[#1a0505]">
                         <circle cx="100" cy="100" r="75" fill="none" stroke="#2a0505" strokeWidth="22" />
                         {[...Array(12)].map((_, i) => (
                            <rect key={i} x="92" y="5" width="16" height="25" fill="#330a0a" transform={`rotate(${i * 30} 100 100)`} />
                         ))}
                     </g>

                     {/* Inner Gear (Counter Spin) */}
                     <g className="gear-spin-reverse origin-center">
                         <circle cx="100" cy="100" r="50" fill="#080000" stroke="#440505" strokeWidth="4" />
                         {[...Array(8)].map((_, i) => (
                            <rect key={i} x="96" y="54" width="8" height="10" fill="#440505" transform={`rotate(${i * 45} 100 100)`} />
                         ))}
                     </g>

                     {/* The Face with Zalgo/Glitch effects */}
                     <g className="animate-pulse origin-center">
                          {/* Eyes with glitch filter */}
                          <g filter="url(#glitch-filter)">
                            <circle cx="75" cy="90" r="10" fill="#ff0000" filter="url(#glow-red-large)" />
                            <circle cx="125" cy="90" r="10" fill="#ff0000" filter="url(#glow-red-large)" />
                            {/* Corrupted pupils */}
                            <circle cx="75" cy="90" r="3" fill="#000" className="animate-ping" />
                            <circle cx="125" cy="90" r="3" fill="#000" className="animate-ping" />
                          </g>
                          
                          {/* Mouth with Zalgo-like jagged path */}
                          <path 
                            d="M 60 125 L 65 135 L 75 130 L 85 145 L 100 135 L 115 150 L 125 130 L 135 140 L 140 125 Z" 
                            fill="#330000" stroke="#ff0000" strokeWidth="3" strokeLinejoin="round" 
                            filter="url(#glow-red-large)" 
                            className="decorative-glitch"
                          />
                          
                          {/* Corrupted Static Lines (Remix) */}
                          <g stroke="#ff0000" strokeWidth="1" opacity="0.4">
                            <line x1="40" y1="80" x2="60" y2="80" className="decorative-glitch" />
                            <line x1="140" y1="100" x2="160" y2="100" className="decorative-glitch" style={{ animationDelay: '-1s' }} />
                            <line x1="90" y1="160" x2="110" y2="160" className="decorative-glitch" style={{ animationDelay: '-0.5s' }} />
                          </g>
                     </g>
                 </svg>
             </div>

             {/* Headline with Zalgo Typewriter - Integrated into frame */}
             <div className="relative flex flex-col items-center w-full max-w-4xl pointer-events-none">
               <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-red-600 tracking-[0.4em] text-center leading-tight drop-shadow-[0_0_20px_rgba(220,20,60,0.5)] min-h-[1.2em]">
                 {zalgoText}
                 {displayText.length < TITLE.length && <span className="cursor-blink" />}
               </h1>
             </div>
        </div>

        {/* Primary Action */}
        <div className={`mt-12 transition-all duration-1000 transform ${showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} flex flex-col items-center gap-4`}>
          <button
            onClick={onStart}
            className="terminal-button"
          >
            INITIALIZE_SIMULATION
          </button>
          
          <button
            onClick={handlePurge}
            className={`text-[10px] tracking-[0.3em] font-bold transition-all uppercase px-4 py-1 border border-transparent ${
              confirmPurge 
                ? 'text-white bg-red-600 border-red-600 animate-pulse' 
                : 'text-red-900/40 hover:text-red-600'
            }`}
          >
            {confirmPurge ? '[ CONFIRM_PURGE_NOW ]' : '[ PURGE_MEMORY_CORE ]'}
          </button>
          {confirmPurge && (
            <button 
              onClick={() => setConfirmPurge(false)}
              className="text-[8px] text-gray-600 hover:text-white uppercase tracking-widest"
            >
              Abort Purge
            </button>
          )}
        </div>

        {/* Warning (Static) */}
        <div className="mt-8 p-8 border border-red-600/20 bg-red-600/5 rounded-sm max-w-4xl backdrop-blur-sm">
          <p className="text-xs md:text-sm text-red-600/70 text-center leading-relaxed uppercase tracking-[0.25em] font-bold">
            Warning: This machine has no ethics, morals, or concern for your well-being. 
            All generated content is a work of fiction. Proceed at your own risk.
          </p>
        </div>
      </div>

      {/* Subtle Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,transparent_50%,rgba(0,0,0,0.8)_100%)] z-30" />
    </div>
  );
};
