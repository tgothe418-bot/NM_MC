
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
  const [cursedMachine, setCursedMachine] = useState("NIGHTMARE MACHINE");
  const [isGlitching, setIsGlitching] = useState(false);
  const [filterSeed, setFilterSeed] = useState(0);
  const [whisper, setWhisper] = useState("");
  const [watcherActive, setWatcherActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawBackground = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // 1. Base Dark Void
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, width, height);

    // 2. Generate Random "Atmosphere" Blobs
    // We use screen blending to ensure they are visible against the dark background
    const blobs = Math.floor(Math.random() * 8) + 5;
    for (let i = 0; i < blobs; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = Math.random() * (Math.min(width, height) / 1.5) + 200;
        
        // Eerie Palette: Dried Blood, Bruise, Deep Rot, Cold Ash
        const palette = [
            `rgba(60, 10, 10, ${Math.random() * 0.15})`,   // Blood (Brighter)
            `rgba(20, 20, 50, ${Math.random() * 0.15})`,   // Bruise (Brighter)
            `rgba(30, 40, 30, ${Math.random() * 0.15})`,   // Rot
            `rgba(50, 50, 50, ${Math.random() * 0.1})`     // Ash
        ];
        const color = palette[Math.floor(Math.random() * palette.length)];

        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, color);
        g.addColorStop(1, 'transparent');
        
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
    }

    // 3. Generate "Scratches" / "Webs"
    // Use lighten to ensure scratches pop
    ctx.globalCompositeOperation = 'lighten';
    const lines = Math.floor(Math.random() * 15);
    ctx.beginPath();
    for (let i = 0; i < lines; i++) {
        const startX = Math.random() * width;
        const startY = Math.random() * height;
        ctx.moveTo(startX, startY);
        // Jagged line
        ctx.bezierCurveTo(
            startX + (Math.random() - 0.5) * 200, startY + (Math.random() - 0.5) * 200,
            startX + (Math.random() - 0.5) * 200, startY + (Math.random() - 0.5) * 200,
            Math.random() * width, Math.random() * height
        );
    }
    ctx.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.05 + 0.02})`;
    ctx.lineWidth = Math.random() * 1.5;
    ctx.stroke();

    // 4. Subtle "Pareidolia" Features
    ctx.globalCompositeOperation = 'source-over';
    const shapes = Math.floor(Math.random() * 3);
    for (let i = 0; i < shapes; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 100 + 50;
        
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.4})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        // Blur edges
        for(let j=0; j<10; j++) {
             ctx.fillStyle = `rgba(0,0,0,0.05)`;
             ctx.beginPath();
             ctx.arc(x, y, size + j*4, 0, Math.PI*2);
             ctx.fill();
        }
    }
  };

  // Procedural Background Generation
  useEffect(() => {
    drawBackground();
    
    // Handle resize to ensure background always fills screen
    const handleResize = () => drawBackground();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCursedThe(generateCursedText("THE", 0.15));
      setCursedMachine(generateCursedText("NIGHTMARE MACHINE", 0.15));
      setFilterSeed(Math.random() * 100);

      if (Math.random() > 0.90) {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), Math.random() * 300);
      }

      if (Math.random() > 0.85 && !whisper) {
        setWhisper(WHISPERS[Math.floor(Math.random() * WHISPERS.length)]);
        setTimeout(() => setWhisper(""), 2000);
      }

      if (Math.random() > 0.97 && !watcherActive) {
        setWatcherActive(true);
        setTimeout(() => setWatcherActive(false), 1000);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [whisper, watcherActive]);

  return (
    <div className="welcome-container fixed inset-0 w-screen h-screen overflow-hidden bg-black flex flex-col items-center justify-center z-[200]">
      {/* Procedural Background - Layer 0 */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-80"
      />
      
      {/* Atmosphere Layers - Non Interactive */}
      <div className="vignette absolute inset-0 z-10 pointer-events-none"></div>
      <div className="scanlines absolute inset-0 z-20 pointer-events-none"></div>
      <div className="static-noise absolute inset-0 z-30 pointer-events-none"></div>
      <div className="fog-layer absolute inset-0 z-10 pointer-events-none">
        <div className="fog-beam spectral" style={{ top: '10%', animationDelay: '0s' }}></div>
        <div className="fog-beam spectral" style={{ top: '80%', animationDelay: '-7s' }}></div>
      </div>
      <div className={`watcher-overlay absolute inset-0 z-20 pointer-events-none flex items-center justify-center transition-opacity duration-100 ${watcherActive ? 'opacity-20' : 'opacity-0'}`}>
         <div className="watcher-eyes flex gap-24 text-red-600">
            <Eye className="w-20 h-20 filter drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]" />
            <Eye className="w-20 h-20 filter drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]" />
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
      
      {/* Interactive Content - High Z-Index */}
      <div className="content-entrance relative z-50 flex flex-col items-center justify-center gap-8 w-full max-w-4xl p-4">
        <div className={`whisper-text ${whisper ? 'active' : ''} absolute top-[15%] text-gray-500/30 text-sm tracking-[1em] uppercase transition-all duration-1000`}>
          {whisper}
        </div>
        
        <ChevronUp className="text-red-900 w-8 h-8 opacity-40 animate-bounce mb-4" />
          
        <div className="title-wrapper flex flex-col items-center gap-4 text-center">
            <div 
              className="relative transition-all duration-75"
              style={{ filter: isGlitching ? 'url(#distort)' : 'none' }}
            >
                <h1 className="title-primary text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-cyan-400 mix-blend-screen relative">
                    {cursedThe}
                    <span className="aberration-layer absolute inset-0 text-red-600 opacity-60 animate-glitch-1 pointer-events-none">{cursedThe}</span>
                    <span className="aberration-layer absolute inset-0 text-cyan-400 opacity-60 animate-glitch-2 pointer-events-none">{cursedThe}</span>
                </h1>
            </div>

            <div 
              className="relative transition-all duration-75"
              style={{ filter: isGlitching ? 'url(#distort)' : 'none' }}
            >
                <h1 className="title-secondary text-2xl md:text-4xl font-bold tracking-[0.5em] text-white text-center">
                    <span className="relative z-10">{cursedMachine}</span>
                </h1>
            </div>
        </div>

        <div className="flex flex-col items-center gap-8 w-full mt-10">
          <button
            onClick={onStart}
            className="enter-button spooky-pulse relative overflow-hidden bg-black/60 border border-gray-400 text-white px-16 py-6 text-xl tracking-[0.3em] uppercase hover:bg-white/10 hover:border-white transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.1)] group"
          >
            <span className="relative z-10 font-mono font-bold group-hover:text-cyan-200">INITIALIZE SIMULATION</span>
            <div className="blood-shine absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg] animate-blood-slide"></div>
          </button>
        </div>
      </div>

      <div className="absolute bottom-8 w-full px-6 flex justify-center z-50 pointer-events-none">
          <div 
            className="flex items-center gap-6 bg-black/80 p-6 border border-red-900/40 rounded-sm backdrop-blur-md pointer-events-auto max-w-4xl shadow-[0_0_30px_rgba(255,0,0,0.1)]"
            role="alert"
            aria-label="Warning"
          >
            <Skull className="w-8 h-8 text-red-600 animate-pulse flex-shrink-0" aria-hidden="true" />
            <p className="warning-text text-xs md:text-sm text-red-500 font-bold uppercase tracking-widest text-center leading-relaxed">
                WARNING: THIS IS A HORROR SIMULATOR THAT HAS NO ETHICAL LIMITS.<br />BE CAUTIOUS AND DO NOT ASK FOR MORE THAN YOU ARE OK WITH.
            </p>
            <Skull className="w-8 h-8 text-red-600 animate-pulse flex-shrink-0" aria-hidden="true" />
          </div>
      </div>
    </div>
  );
};
