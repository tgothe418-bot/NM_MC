
import React, { useState, useEffect } from 'react';
import { Terminal, Skull, ChevronRight } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

const generateCursedText = (text: string, intensity: number = 0.2): string => {
  const combining = [
    '\u0300', '\u0301', '\u0302', '\u0303', '\u0304', '\u0305', '\u0306', '\u0307',
    '\u0320', '\u0321', '\u0322', '\u0323', '\u0324', '\u0325', '\u0326', '\u0327',
    '\u033d', '\u0342', '\u0343', '\u0344', '\u034a', '\u034b', '\u034c', '\u0350',
    '\u0351', '\u0352', '\u0357', '\u0358', '\u0363', '\u0364', '\u0365', '\u0366'
  ];
  
  return text.split('').map(char => {
    if (char === ' ') return char;
    let result = char;
    if (Math.random() < intensity) {
      const num = Math.floor(Math.random() * 4) + 1;
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

  useEffect(() => {
    // Frequency slowed by another 50% relative to previous version (800ms -> 1600ms)
    const interval = setInterval(() => {
      // Periodic cursed text updates
      setCursedThe(generateCursedText("THE", 0.08));
      setCursedMachine(generateCursedText("NIGHTMARE MACHINE", 0.1));
      
      // Update SVG filter seed for "vibrating" displacement
      setFilterSeed(Math.random() * 100);

      // Glitch burst checks slowed and made even rarer
      if (Math.random() > 0.98) {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 120);
      }
    }, 1600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-void flex flex-col items-center justify-center overflow-hidden font-mono select-none text-center">
      {/* SVG Filters for Cursed Distortion */}
      <svg className="hidden">
        <defs>
          <filter id="distort">
            <feTurbulence type="fractalNoise" baseFrequency="0.01 0.1" numOctaves="2" seed={filterSeed} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={isGlitching ? "25" : "1.5"} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* AMIGA Copper Bars Background Effect - Doubled animation durations for smoothness */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 w-full h-12 bg-gradient-to-r from-transparent via-red-600 to-transparent blur-3xl animate-[copper_32s_ease-in-out_infinite]"></div>
        <div className="absolute top-1/2 w-full h-12 bg-gradient-to-r from-transparent via-purple-600 to-transparent blur-3xl animate-[copper_40s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute top-3/4 w-full h-12 bg-gradient-to-r from-transparent via-blue-600 to-transparent blur-3xl animate-[copper_48s_ease-in-out_infinite]"></div>
      </div>

      {/* CRT Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none z-[210] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[size:100%_6px]"></div>
      
      {/* Main Layout Container */}
      <div className="relative z-10 flex flex-col items-center justify-between w-full h-full max-w-7xl px-10 py-10 gap-4">
        
        {/* GROUPED TITLES: mt-24/mt-32/mt-40 pushes the logo down from the top edge to be more central */}
        <div className="flex flex-col items-center justify-center gap-0 mt-24 md:mt-32 lg:mt-40 w-full transition-all duration-1000">
          {/* "THE" */}
          <div className="relative flex items-center justify-center overflow-visible z-20">
              <div 
                className={`relative transition-all duration-1000 ${isGlitching ? 'scale-[1.12] brightness-200' : 'scale-100'}`}
                style={{ filter: 'url(#distort)' }}
              >
                <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold tracking-[0.5em] uppercase text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.4)] animate-[logo-throb_24s_ease-in-out_infinite] relative whitespace-nowrap">
                    {cursedThe}
                    <span className="absolute inset-0 text-red-600 opacity-60 -translate-x-1 translate-y-0.5 mix-blend-screen pointer-events-none animate-[aberration-red_18s_ease-in-out_infinite]">{cursedThe}</span>
                    <span className="absolute inset-0 text-cyan-400 opacity-60 translate-x-1 -translate-y-0.5 mix-blend-screen pointer-events-none animate-[aberration-cyan_21s_ease-in-out_infinite]">{cursedThe}</span>
                </h1>
              </div>
          </div>

          {/* "NIGHTMARE MACHINE" - Replaced negative margin with positive to lower and separate it from "THE" */}
          <div className="relative w-full flex items-center justify-center overflow-visible mt-6 md:mt-10 lg:mt-12 z-10">
              <div 
                className={`relative transition-all duration-1000 ${isGlitching ? 'scale-[1.06] translate-x-1 brightness-150' : 'scale-100'}`}
                style={{ filter: 'url(#distort)' }}
              >
                {/* Main Throbbing Text - Animation slowed significantly */}
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-[0.3em] uppercase text-white drop-shadow-[0_0_35px_rgba(255,255,255,0.4)] animate-[logo-throb_24s_ease-in-out_infinite] relative whitespace-nowrap">
                    <span className="relative z-10">{cursedMachine}</span>
                    
                    {/* Chromatic Aberration Layers - Durations further slowed */}
                    <span className="absolute inset-0 text-red-600 opacity-60 -translate-x-2 translate-y-1 mix-blend-screen pointer-events-none animate-[aberration-red_18s_ease-in-out_infinite]">
                    {cursedMachine}
                    </span>
                    <span className="absolute inset-0 text-cyan-400 opacity-60 translate-x-2 -translate-y-1 mix-blend-screen pointer-events-none animate-[aberration-cyan_21s_ease-in-out_infinite]">
                    {cursedMachine}
                    </span>
                    <span className="absolute inset-0 text-green-500 opacity-40 translate-x-0.5 mix-blend-screen pointer-events-none animate-[aberration-green_30s_ease-in-out_infinite]">
                    {cursedMachine}
                    </span>
                </h1>
              </div>
          </div>
        </div>

        {/* STATIC CONTROL PANEL */}
        <div className="relative flex flex-col items-center justify-center gap-10 w-full max-w-4xl border border-indigo-500/20 bg-black/40 backdrop-blur-sm p-12 md:p-20 shadow-[0_0_50px_rgba(79,70,229,0.05)] mb-12">
          <div className="absolute -top-px -left-px w-6 h-6 border-t-2 border-l-2 border-indigo-500/40"></div>
          <div className="absolute -top-px -right-px w-6 h-6 border-t-2 border-r-2 border-indigo-500/40"></div>
          <div className="absolute -bottom-px -left-px w-6 h-6 border-b-2 border-l-2 border-indigo-500/40"></div>
          <div className="absolute -bottom-px -right-px w-6 h-6 border-b-2 border-r-2 border-indigo-500/40"></div>
          
          <div className="flex items-center gap-8 text-fresh-blood opacity-60 text-base tracking-[0.6em] uppercase font-bold animate-fadeIn">
            <span className="h-px w-20 bg-fresh-blood/40"></span>
            NEURAL LINK READY
            <span className="h-px w-20 bg-fresh-blood/40"></span>
          </div>

          <button
            onClick={onStart}
            className="group relative px-20 py-8 bg-transparent border-2 border-fresh-blood text-fresh-blood font-bold uppercase text-2xl tracking-[0.5em] transition-all hover:bg-fresh-blood hover:text-black hover:shadow-[0_0_70px_rgba(136,8,8,0.7)] active:scale-95 overflow-hidden rounded-sm z-20"
          >
            <span className="relative z-10 flex items-center gap-4">
              Tether Consciousness <ChevronRight className="w-8 h-8" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[copper_4s_linear_infinite]"></div>
          </button>
          
          <div className="absolute bottom-4 left-6 text-[8px] text-gray-700 uppercase tracking-widest opacity-40">
            Link: Active // Volition: Confirmed // Trauma: Queued
          </div>
        </div>
      </div>

      {/* Mandatory Psychological Disclaimer */}
      <div className="absolute bottom-6 w-full text-center px-10">
        <p className="text-xs md:text-sm text-gray-600 font-mono uppercase tracking-[0.3em] max-w-5xl mx-auto leading-relaxed opacity-40">
          By initializing, you accept all psychological outcomes. The Machine is indifferent to your regret.
        </p>
      </div>

      <style>{`
        @keyframes copper {
          0% { transform: translateX(-100%) translateY(0); opacity: 0; }
          50% { opacity: 0.9; }
          100% { transform: translateX(100%) translateY(0); opacity: 0; }
        }

        @keyframes logo-throb {
          0%, 100% { 
            transform: scale(1); 
            filter: drop-shadow(0 0 35px rgba(255,255,255,0.4)) blur(0px);
          }
          50% { 
            transform: scale(1.03); 
            filter: drop-shadow(0 0 65px rgba(255,255,255,0.6)) blur(0.8px);
          }
        }

        @keyframes aberration-red {
          0%, 100% { transform: translate(-1.5px, 0.5px); opacity: 0.6; }
          50% { transform: translate(-6px, -3px); opacity: 0.8; }
        }

        @keyframes aberration-cyan {
          0%, 100% { transform: translate(1.5px, -0.5px); opacity: 0.6; }
          50% { transform: translate(6px, 3px); opacity: 0.8; }
        }

        @keyframes aberration-green {
          0%, 100% { transform: translate(0.5px, 0.5px); opacity: 0.4; }
          50% { transform: translate(-3px, -3px); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};
