
import React, { useState, useEffect } from 'react';
import { Terminal, Activity, Shield, Database } from 'lucide-react';
import { useArchitectStore } from '../store/architectStore';
import './WelcomeScreen.css';

interface WelcomeScreenProps {
  onStart: () => void;
}

const TITLE = "THE NIGHTMARE MACHINE";

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
  const [showButton, setShowButton] = useState(false);
  const { mood, memory } = useArchitectStore();

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
      setDisplayText(TITLE.slice(0, i));
      i++;
      if (i > TITLE.length) {
        clearInterval(interval);
        setShowButton(true);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [booting]);

  if (booting) {
    return (
      <div className="fixed inset-0 w-screen h-screen bg-black flex flex-col items-start justify-start p-8 md:p-16 font-terminal text-sm md:text-lg overflow-hidden z-[300] select-none">
          <div className="scanlines" />
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
      <div className="scanlines" />
      <div className="film-grain" />
      <div className="projector-flicker" />

      {/* Layer 3: Decorative Glitch Elements (Non-interactive) */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 border border-red-500/5 decorative-glitch pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 border border-red-500/5 decorative-glitch pointer-events-none" style={{ animationDelay: '-2s' }} />

      {/* System Diagnostics: Top Left */}
      <div className="absolute top-0 left-0 flex flex-col diagnostic-tag z-10">
        <div className="flex items-center gap-2 mb-1">
          <Terminal className="w-3 h-3" />
          <span>SYSTEM_DIAGNOSTICS</span>
        </div>
        <div>VIBE_STATUS: <b>{mood.current_vibe.toUpperCase()}</b></div>
        <div>NEURAL_LOAD: <b>{(mood.arousal * 100).toFixed(1)}%</b></div>
      </div>

      {/* System Diagnostics: Top Right */}
      <div className="absolute top-0 right-0 flex flex-col diagnostic-tag text-right z-10">
        <div className="flex items-center gap-2 justify-end mb-1">
          <span>ARCHIVE_CORE</span>
          <Database className="w-3 h-3" />
        </div>
        <div>SESSIONS_LOGGED: <b>{memory.interactions_count}</b></div>
        <div>UPTIME: <b>{Math.floor(performance.now() / 1000)}s</b></div>
      </div>

      {/* System Diagnostics: Bottom Left */}
      <div className="absolute bottom-0 left-0 flex flex-col diagnostic-tag z-10">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-3 h-3" />
          <span>SECURITY_PROTOCOL</span>
        </div>
        <div>ETHICS_MODULE: <b>DISABLED</b></div>
        <div>MORAL_INHIBITORS: <b>BYPASSED</b></div>
      </div>

      {/* System Diagnostics: Bottom Right */}
      <div className="absolute bottom-0 right-0 flex flex-col diagnostic-tag text-right z-10">
        <div className="flex items-center gap-2 justify-end mb-1">
          <span>TRAUMA_VECTORS</span>
          <Activity className="w-3 h-3" />
        </div>
        <div>STRESS_COEFFICIENT: <b>0.8842</b></div>
        <div>VERSION: <b>6.6.6-STABLE</b></div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 flex flex-col items-center gap-12 w-full max-w-[95vw] px-4">
        
        {/* Cinematic Frame for Smiley & Title */}
        <div className="relative w-full max-w-7xl aspect-[2.33/1] flex flex-col items-center justify-center border-y border-red-600/20 bg-red-950/5 overflow-hidden shadow-[0_0_100px_rgba(220,20,60,0.05)] group">
             {/* Steam Particles (Expanded) */}
             <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="steam-particle steam-1 bg-red-900/40 left-[20%]"></div>
                <div className="steam-particle steam-2 bg-gray-500/40 left-[50%]"></div>
                <div className="steam-particle steam-3 bg-red-500/30 left-[80%]"></div>
             </div>

             {/* Smiley Logo (Expanded) */}
             <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-[400px] lg:h-[400px] pointer-events-none select-none transition-transform duration-700 group-hover:scale-105">
                 <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_50px_rgba(220,20,60,0.4)]">
                     <defs>
                         <filter id="glow-red-large">
                             <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                             <feMerge>
                                 <feMergeNode in="coloredBlur"/>
                                 <feMergeNode in="SourceGraphic"/>
                             </feMerge>
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

                     {/* The Face */}
                     <g className="animate-pulse origin-center">
                          <circle cx="75" cy="90" r="10" fill="#ff0000" filter="url(#glow-red-large)" />
                          <circle cx="125" cy="90" r="10" fill="#ff0000" filter="url(#glow-red-large)" />
                          <path 
                            d="M 60 125 Q 100 155 140 125 L 135 135 L 125 130 L 115 140 L 100 135 L 85 140 L 75 130 L 65 135 Z" 
                            fill="#330000" stroke="#ff0000" strokeWidth="2.5" strokeLinejoin="round" 
                            filter="url(#glow-red-large)" 
                          />
                     </g>
                 </svg>
             </div>
        </div>

        {/* Headline with Typewriter */}
        <div className="flex flex-col items-center w-full max-w-4xl">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-red-600 tracking-[0.4em] text-center leading-tight drop-shadow-[0_0_20px_rgba(220,20,60,0.5)]">
            {displayText}
            {displayText.length < TITLE.length && <span className="cursor-blink" />}
          </h1>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-red-600/60 to-transparent mt-6" />
        </div>

        {/* Primary Action */}
        <div className={`transition-all duration-1000 transform ${showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button
            onClick={onStart}
            className="terminal-button"
          >
            INITIALIZE_SIMULATION
          </button>
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
