
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

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const [cursedThe, setCursedThe] = useState("THE");
  const [cursedNightmare, setCursedNightmare] = useState("NIGHTMARE");
  const [cursedMachine, setCursedMachine] = useState("MACHINE");
  const [isGlitching, setIsGlitching] = useState(false);
  const [filterSeed, setFilterSeed] = useState(0);
  const [whisper, setWhisper] = useState("");
  const [watcherActive, setWatcherActive] = useState(false);
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

      if (Math.random() > 0.85 && !whisper) {
        setWhisper(WHISPERS[Math.floor(Math.random() * WHISPERS.length)]);
        setTimeout(() => setWhisper(""), 2000);
      }

      if (Math.random() > 0.97 && !watcherActive) {
        setWatcherActive(true);
        setTimeout(() => setWatcherActive(false), 800);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [whisper, watcherActive]);

  return (
    <div className="welcome-container fixed inset-0 w-screen h-screen overflow-hidden bg-[#050505] flex flex-col items-center justify-between z-[200] py-12 font-sans">
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
            <div className={`whisper-text ${whisper ? 'active' : ''} text-red-100/40 text-sm tracking-[1em] uppercase transition-all duration-1000 font-mono`}>
              {whisper}
            </div>
          </div>
              
          {/* MAIN TITLE AREA - Maximized & Blooming */}
          <div className="flex flex-col items-center justify-center w-full max-w-[98vw] gap-0 flex-grow -mt-20">
            
            {/* "THE" - Ghostly */}
            <div 
                className="relative transition-all duration-75 w-full flex justify-center"
                style={{ filter: isGlitching ? 'url(#distort)' : 'none' }}
            >
                <h1 className="title-primary font-black tracking-tighter text-[#888] mix-blend-screen relative text-center leading-[0.8] blur-[1px]">
                    {cursedThe}
                </h1>
            </div>

            {/* "NIGHTMARE MACHINE" - Halation Effect (Bloom) */}
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
                className="flex items-center gap-4 bg-black/80 p-4 border border-red-900/40 rounded-sm backdrop-blur-md pointer-events-auto shadow-[0_0_30px_rgba(0,0,0,0.8)] max-w-2xl"
                role="alert"
                aria-label="Warning"
              >
                <Skull className="w-4 h-4 text-red-600 animate-pulse flex-shrink-0" />
                <div className="flex flex-col items-center gap-1">
                    <p className="warning-text text-[10px] text-red-500/80 font-bold uppercase tracking-[0.15em] text-center leading-relaxed">
                        WARNING: THIS MACHINE HAS NO ETHICS, MORALS OR CONCERN FOR YOU. EVERYTHING HERE IS A WORK OF FICTION.
                    </p>
                    <p className="warning-text text-[10px] text-red-600 font-black uppercase tracking-[0.2em] text-center leading-relaxed animate-pulse">
                        !!! ENTER AT YOUR OWN RISK !!!
                    </p>
                </div>
                <Skull className="w-4 h-4 text-red-600 animate-pulse flex-shrink-0" />
              </div>
          </div>
      </div>
    </div>
  );
};
