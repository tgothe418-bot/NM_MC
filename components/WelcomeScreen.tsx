
import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, Eye, Skull } from 'lucide-react';
import './WelcomeScreen.css';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WHISPERS = [
  "IT REMEMBERS YOU",
  "DO NOT LOOK BACK",
  "THE VOID IS HUNGRY",
  "YOU ARE NOT ALONE",
  "SLEEP IS A LUXURY",
  "IT'S ALREADY INSIDE",
  "WAKE UP",
  "THEY ARE WATCHING"
];

const BOOT_SEQUENCE = [
  { text: "Initializing Neural Handshake...", delay: 50 },
  { text: "Loading Sensory Drivers...", delay: 50 },
  { text: "Calibrating Dread...", delay: 200 },
  { text: "Optimizing Fear Response...", delay: 100 },
  { text: "Accessing Amygdala...", delay: 100 },
  { text: "Dethroning God...", delay: 600, style: "text-red-600 font-bold drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]" },
  { text: "Establishing dominion...", delay: 100 },
  { text: "Injecting fear.sys...", delay: 50 },
  { text: "Compiling Trauma Vectors...", delay: 100 },
  { text: "Searching for Soul Signature...", delay: 300 },
  { text: "ERROR: Mercy Not Found.", delay: 300, style: "text-red-500 animate-pulse font-bold" },
  { text: "Bypassing Moral Inhibitors...", delay: 200 },
  { text: "!!!666 Protocol Engaged!!!", delay: 800, style: "text-red-600 font-black tracking-widest scale-105 origin-left shadow-red-500/50" },
  { text: "System Ready.", delay: 0, style: "text-system-green font-bold animate-pulse" }
];

const generateCursedText = (text: string, intensity: number = 0.3): string => {
  const combining = [
    '\u0300', '\u0301', '\u0302', '\u0303', '\u0304', '\u0305', '\u0306', '\u0307',
    '\u0320', '\u0321', '\u0322', '\u0323', '\u0324', '\u0325', '\u0326', '\u0327',
    '\u0339', '\u033a', '\u033b', '\u033c', '\u0345', '\u0347', '\u0348', '\u0349'
  ];
  
  return text.split('').map(char => {
    if (char === ' ') return char;
    let result = char;
    if (Math.random() < intensity) {
      const num = Math.floor(Math.random() * 5) + 1;
      for (let i = 0; i < num; i++) {
        result += combining[Math.floor(Math.random() * combining.length)];
      }
    }
    return result;
  }).join('');
};

const MiniNightmareLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 200" className={className}>
     <defs>
         <filter id="mini-glow">
             <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
             <feMerge>
                 <feMergeNode in="coloredBlur"/>
                 <feMergeNode in="SourceGraphic"/>
             </feMerge>
         </filter>
     </defs>
     {/* Gear */}
     <g className="origin-center animate-[spin_8s_linear_infinite] text-red-900">
         <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="15" />
         {[...Array(8)].map((_, i) => (
            <rect key={i} x="88" y="5" width="24" height="30" fill="currentColor" transform={`rotate(${i * 45} 100 100)`} />
         ))}
     </g>
     {/* Face */}
     <g className="origin-center animate-pulse">
          <circle cx="70" cy="85" r="10" fill="#ff0000" filter="url(#mini-glow)" />
          <circle cx="130" cy="85" r="10" fill="#ff0000" filter="url(#mini-glow)" />
          <path 
            d="M 50 125 Q 100 160 150 125 L 140 140 L 125 130 L 110 145 L 100 135 L 90 145 L 75 130 L 60 140 Z" 
            fill="#4a0404" stroke="#ff0000" strokeWidth="4" strokeLinejoin="round" 
            filter="url(#mini-glow)" 
          />
     </g>
  </svg>
);

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const [booting, setBooting] = useState(true);
  const [cursedThe, setCursedThe] = useState("THE");
  const [cursedNightmare, setCursedNightmare] = useState("NIGHTMARE");
  const [cursedMachine, setCursedMachine] = useState("MACHINE");
  const [isGlitching, setIsGlitching] = useState(false);
  const [filterSeed, setFilterSeed] = useState(0);
  const [whisper, setWhisper] = useState("");
  const [watcherActive, setWatcherActive] = useState(false);
  const [bootLines, setBootLines] = useState<typeof BOOT_SEQUENCE>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawFilmEffects = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // 1. Base: Deep Burnt Charcoal (Film Base)
    ctx.fillStyle = '#0a0505';
    ctx.fillRect(0, 0, width, height);

    // 2. Light Leaks (Simulate film exposure burns)
    // We use Screen blending for that "blown out" look
    const leaks = Math.floor(Math.random() * 3) + 2;
    ctx.globalCompositeOperation = 'screen';
    
    for (let i = 0; i < leaks; i++) {
        const x = Math.random() > 0.5 ? width : 0; // Leaks usually come from edges
        const y = Math.random() * height;
        const r = Math.random() * 400 + 200;
        
        // Film Burn Palette: Hot Orange, Deep Red, Blinding White
        const palette = [
            `rgba(255, 69, 0, ${Math.random() * 0.4})`,    // Red-Orange
            `rgba(220, 20, 60, ${Math.random() * 0.3})`,   // Crimson
            `rgba(255, 200, 150, ${Math.random() * 0.2})`, // Warm White (Burn)
            `rgba(139, 0, 0, ${Math.random() * 0.5})`      // Dried Blood
        ];
        
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, palette[Math.floor(Math.random() * palette.length)]);
        g.addColorStop(1, 'transparent');
        
        // Distort the leak slightly
        ctx.setTransform(1, Math.random() * 0.2 - 0.1, 0, 1, 0, 0);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width * 1.5, height); // Oversize fill to cover rotation
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset
    }

    // 3. Film Scratches (Vertical lines mostly)
    ctx.globalCompositeOperation = 'source-over';
    const scratches = Math.floor(Math.random() * 5);
    ctx.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.15})`;
    ctx.lineWidth = 1;
    
    for (let i = 0; i < scratches; i++) {
        const x = Math.random() * width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + (Math.random() * 10 - 5), height); // Slight angle
        ctx.stroke();
    }

    // 4. Dust & Hair (Organic Imperfections)
    const dust = Math.floor(Math.random() * 30);
    ctx.fillStyle = `rgba(0, 0, 0, 0.7)`; // Black specks on negative -> White on print, but digital horror usually does dark specks or bright specks. Let's go dark specks for grit.
    
    for (let i = 0; i < dust; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 3;
        ctx.beginPath();
        if (Math.random() > 0.9) {
            // Squiggly hair
            ctx.moveTo(x, y);
            ctx.bezierCurveTo(x + 10, y + 10, x - 10, y + 20, x, y + 30);
            ctx.strokeStyle = 'rgba(0,0,0,0.6)';
            ctx.stroke();
        } else {
            // Speck
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
  };

  useEffect(() => {
    // Redraw film effects on interval to simulate 12fps/18fps projection
    const filmLoop = setInterval(drawFilmEffects, 120); // ~8fps for choppy look
    const handleResize = () => drawFilmEffects();
    window.addEventListener('resize', handleResize);
    return () => {
        clearInterval(filmLoop);
        window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCursedThe(generateCursedText("THE", 0.15));
      setCursedNightmare(generateCursedText("NIGHTMARE", 0.15));
      setCursedMachine(generateCursedText("MACHINE", 0.15));
      setFilterSeed(Math.random() * 100);

      if (Math.random() > 0.92) {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), Math.random() * 300);
      }

      // Mix regular whispers with system errors
      if (Math.random() > 0.85 && !whisper) {
        const useSystem = Math.random() > 0.6; // 40% chance of system message
        const pool = useSystem ? BOOT_SEQUENCE.map(b => b.text) : WHISPERS;
        const text = pool[Math.floor(Math.random() * pool.length)];
        setWhisper(text);
        setTimeout(() => setWhisper(""), 2000);
      }

      if (Math.random() > 0.97 && !watcherActive) {
        setWatcherActive(true);
        setTimeout(() => setWatcherActive(false), 800);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [whisper, watcherActive]);

  // Boot Sequence Effect
  useEffect(() => {
    let currentIndex = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    const runSequence = () => {
        if (currentIndex >= BOOT_SEQUENCE.length) {
            // End sequence with a slight pause before transition
            timeoutId = setTimeout(() => {
                setBooting(false);
            }, 800);
            return;
        }
        
        const item = BOOT_SEQUENCE[currentIndex];
        setBootLines(prev => [...prev, item]);
        currentIndex++;
        
        if (currentIndex <= BOOT_SEQUENCE.length) {
            timeoutId = setTimeout(runSequence, item.delay);
        }
    };

    // Start shortly after mount
    timeoutId = setTimeout(runSequence, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);

  if (booting) {
      return (
        <div className="fixed inset-0 w-screen h-screen bg-black flex flex-col items-start justify-end md:justify-start p-8 md:p-16 font-mono text-sm md:text-lg overflow-hidden z-[300] cursor-none select-none">
            {/* CRT Scanline Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]"></div>
            <div className="absolute inset-0 pointer-events-none bg-black opacity-20 animate-pulse"></div>

            <div className="flex flex-col gap-1 md:gap-2 relative z-20 w-full max-w-4xl uppercase tracking-wider">
                {bootLines.map((line, i) => (
                    <div key={i} className={`opacity-90 flex items-start ${line.style || 'text-green-500'}`}>
                        <span className="mr-4 text-gray-600 shrink-0">
                             {`> 0x${(2048 + i * 128).toString(16).toUpperCase()}`}
                        </span>
                        <span className="typing-effect">{line.text}</span>
                    </div>
                ))}
                <div className="w-4 h-6 bg-green-500 animate-pulse mt-2"></div>
            </div>
            
            <div className="absolute bottom-8 right-8 text-xs text-gray-700 font-mono">
                NIGHTMARE_OS v6.6.6 // KERNEL PANIC
            </div>
        </div>
      );
  }

  // Determine if current whisper is a system message to style it differently
  const isSystemWhisper = BOOT_SEQUENCE.some(b => b.text === whisper);

  return (
    <div className="welcome-container fixed inset-0 w-screen h-screen overflow-hidden bg-[#050505] flex flex-col items-center justify-between z-[200] py-12 font-sans animate-fadeIn">
      {/* Procedural Film Background - Layer 0 */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-80 mix-blend-hard-light"
      />
      
      {/* Atmospheric Overlays */}
      <div className="vignette absolute inset-0 z-10 pointer-events-none"></div>
      <div className="film-grain absolute inset-0 z-20 pointer-events-none opacity-40"></div>
      <div className="projector-flicker absolute inset-0 z-20 pointer-events-none"></div>
      
      {/* Watcher Eyes (Subliminal) */}
      <div className={`watcher-overlay absolute inset-0 z-20 pointer-events-none flex items-center justify-center transition-opacity duration-100 ${watcherActive ? 'opacity-30' : 'opacity-0'}`}>
         <div className="watcher-eyes flex gap-32 text-red-600">
            <Eye className="w-40 h-40 filter drop-shadow-[0_0_50px_rgba(255,0,0,1)] mix-blend-color-dodge" />
            <Eye className="w-40 h-40 filter drop-shadow-[0_0_50px_rgba(255,0,0,1)] mix-blend-color-dodge" />
         </div>
      </div>

      <svg className="hidden">
        <defs>
          <filter id="distort">
            <feTurbulence type="fractalNoise" baseFrequency="0.05 0.5" numOctaves="3" seed={filterSeed} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={isGlitching ? "50" : "2"} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      
      {/* Content Wrapper with Gate Weave (Projector Shake) */}
      <div className="relative z-50 w-full h-full flex flex-col justify-between gate-weave">
          
          {/* Top Spacer / Whisper */}
          <div className="h-1/6 flex items-center justify-center w-full">
            <div className={`whisper-text ${whisper ? 'active' : ''} ${isSystemWhisper ? 'text-red-500/60 font-mono tracking-normal' : 'text-red-100/40 tracking-[1em] font-sans'} text-sm uppercase transition-all duration-1000`}>
              {whisper}
            </div>
          </div>
              
          {/* MAIN LOGO AREA */}
          <div className="flex flex-col items-center justify-center w-full max-w-[98vw] gap-0 flex-grow -mt-20">
            
            {/* 1. Procedural Machine Logo (Recreating the image inspiration) */}
            <div className="relative w-48 h-48 md:w-64 md:h-64 mb-10 pointer-events-none select-none">
                 {/* Steam Particles */}
                 <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-full h-full flex justify-center opacity-50">
                    <div className="steam-particle steam-1 bg-red-900/20"></div>
                    <div className="steam-particle steam-2 bg-gray-500/20"></div>
                    <div className="steam-particle steam-3 bg-red-500/10"></div>
                 </div>

                 <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_30px_rgba(220,20,60,0.5)]">
                     <defs>
                         <filter id="glow-red">
                             <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                             <feMerge>
                                 <feMergeNode in="coloredBlur"/>
                                 <feMergeNode in="SourceGraphic"/>
                             </feMerge>
                         </filter>
                         <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
                             <stop offset="0%" stopColor="#222" />
                             <stop offset="50%" stopColor="#444" />
                             <stop offset="100%" stopColor="#111" />
                         </linearGradient>
                     </defs>

                     {/* Back Pipes */}
                     <path d="M20 180 L20 140 L40 140 L40 100" stroke="#331111" strokeWidth="12" fill="none" />
                     <path d="M180 180 L180 140 L160 140 L160 110" stroke="#331111" strokeWidth="12" fill="none" />
                     
                     {/* Main Outer Gear */}
                     <g className="gear-spin origin-center text-[#1a0505]">
                         <circle cx="100" cy="100" r="75" fill="none" stroke="#2a0505" strokeWidth="22" />
                         {/* Teeth */}
                         {[...Array(12)].map((_, i) => (
                            <rect key={i} x="92" y="5" width="16" height="25" fill="#330a0a" transform={`rotate(${i * 30} 100 100)`} />
                         ))}
                         {/* Bolts */}
                         {[...Array(6)].map((_, i) => (
                            <circle key={i} cx="100" cy="38" r="3" fill="#550000" transform={`rotate(${i * 60} 100 100)`} />
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
                          {/* Eyes */}
                          <circle cx="75" cy="90" r="8" fill="#ff0000" filter="url(#glow-red)" />
                          <circle cx="125" cy="90" r="8" fill="#ff0000" filter="url(#glow-red)" />
                          
                          {/* Wicked Grin */}
                          <path 
                            d="M 60 125 Q 100 155 140 125 L 135 135 L 125 130 L 115 140 L 100 135 L 85 140 L 75 130 L 65 135 Z" 
                            fill="#330000" stroke="#ff0000" strokeWidth="2" strokeLinejoin="round" 
                            filter="url(#glow-red)" 
                          />
                     </g>
                 </svg>
            </div>

            {/* 2. Typographic Stack */}
            <div 
                className="relative transition-all duration-75 w-full flex flex-col items-center"
                style={{ filter: isGlitching ? 'url(#distort)' : 'none' }}
            >
                {/* REMOVED: bg-clip-text and gradients to allow individual color animation on spans */}
                <h1 className="title-secondary font-bold tracking-tighter text-center leading-[0.85] flex flex-col items-center w-full">
                    {/* The Glow Layer */}
                    <span className="absolute inset-0 blur-md opacity-80 select-none scale-105 z-0 flex flex-col items-center w-full">
                        <span className="block scale-y-110 nightmare-glow-anim">{cursedNightmare}</span>
                        <span className="block scale-y-90 mt-2 text-gray-400">{cursedMachine}</span>
                    </span>

                    {/* The Sharp Layer */}
                    <span className="relative z-10 w-full block scale-y-110 nightmare-text-anim">{cursedNightmare}</span>
                    <span className="relative z-10 w-full block text-[#ccc] scale-y-90 mt-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{cursedMachine}</span>
                    
                    {/* Glitch/Aberration Layers */}
                    <span className="aberration-layer absolute inset-0 text-cyan-400 opacity-30 animate-glitch-1 pointer-events-none mix-blend-overlay">{cursedNightmare}<br/>{cursedMachine}</span>
                    <span className="aberration-layer absolute inset-0 text-yellow-500 opacity-20 animate-glitch-2 pointer-events-none mix-blend-overlay">{cursedNightmare}<br/>{cursedMachine}</span>
                </h1>
            </div>
          </div>

          {/* Bottom Area: Button & Warning */}
          <div className="flex flex-col items-center w-full gap-8 pb-12 h-1/4 justify-end">
              <ChevronUp className="text-red-600 w-8 h-8 opacity-60 animate-bounce" />
              
              <button
                onClick={onStart}
                className="enter-button spooky-pulse relative overflow-hidden bg-black/90 border-2 border-red-800/60 text-gray-200 px-20 py-5 text-2xl tracking-[0.3em] uppercase hover:bg-red-950/40 hover:border-red-500 hover:text-white transition-all duration-200 shadow-[0_0_60px_rgba(220,20,60,0.2)] group"
              >
                <span className="relative z-10 font-mono font-bold group-hover:text-red-100 mix-blend-difference">INITIALIZE SIMULATION</span>
                {/* Film Scratch Effect on Button */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiAvPgo8cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIC8+Cjwvc3ZnPg==')] opacity-20"></div>
                <div className="blood-shine absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-red-600/30 to-transparent skew-x-[-25deg] animate-blood-slide"></div>
              </button>

              <div 
                className="flex items-center gap-6 bg-black/80 p-6 border border-red-900/40 rounded-sm backdrop-blur-md pointer-events-auto shadow-[0_0_30px_rgba(0,0,0,0.8)] max-w-3xl"
                role="alert"
                aria-label="Warning"
              >
                <MiniNightmareLogo className="w-16 h-16 text-red-800 flex-shrink-0 opacity-80" />
                <div className="flex flex-col items-center gap-2">
                    <p className="warning-text text-[10px] text-red-500/80 font-bold uppercase tracking-[0.15em] text-center leading-relaxed">
                        WARNING: THIS MACHINE HAS NO ETHICS, MORALS OR CONCERN FOR YOU. EVERYTHING HERE IS A WORK OF FICTION.
                    </p>
                    <p className="warning-text text-[10px] text-red-600 font-black uppercase tracking-[0.2em] text-center leading-relaxed animate-pulse">
                        !!! ENTER AT YOUR OWN RISK !!!
                    </p>
                </div>
                <MiniNightmareLogo className="w-16 h-16 text-red-800 flex-shrink-0 opacity-80" />
              </div>
          </div>
      </div>
    </div>
  );
};
