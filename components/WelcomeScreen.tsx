
import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

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
    const interval = setInterval(() => {
      setCursedThe(generateCursedText("THE", 0.08));
      setCursedMachine(generateCursedText("NIGHTMARE MACHINE", 0.1));
      setFilterSeed(Math.random() * 100);

      if (Math.random() > 0.98) {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 120);
      }
    }, 1600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-void flex flex-col items-center justify-center overflow-hidden font-mono select-none text-center">
      <svg className="hidden">
        <defs>
          <filter id="distort">
            <feTurbulence type="fractalNoise" baseFrequency="0.01 0.1" numOctaves="2" seed={filterSeed} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={isGlitching ? "25" : "1.5"} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 w-full h-12 bg-gradient-to-r from-transparent via-red-600 to-transparent blur-3xl animate-[copper_32s_ease-in-out_infinite]"></div>
        <div className="absolute top-1/2 w-full h-12 bg-gradient-to-r from-transparent via-purple-600 to-transparent blur-3xl animate-[copper_40s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute top-3/4 w-full h-12 bg-gradient-to-r from-transparent via-blue-600 to-transparent blur-3xl animate-[copper_48s_ease-in-out_infinite]"></div>
      </div>

      <div className="absolute inset-0 pointer-events-none z-[210] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[size:100%_6px]"></div>
      
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-[90vw] p-10 gap-12">
        
        <div className="flex flex-col items-center gap-6">
          <ChevronUp className="text-gray-600 w-8 h-8 opacity-20" />
          
          <div className="p-12 md:p-20 flex flex-col items-center gap-4 transition-all duration-700 group">
            <div className="relative flex items-center justify-center overflow-visible z-20">
                <div 
                  className={`relative transition-all duration-1000 ${isGlitching ? 'scale-[1.12] brightness-200' : 'scale-100'}`}
                  style={{ filter: 'url(#distort)' }}
                >
                  <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-[0.5em] uppercase text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.4)] animate-[logo-throb_24s_ease-in-out_infinite] relative whitespace-nowrap">
                      {cursedThe}
                      <span className="absolute inset-0 text-red-600 opacity-40 -translate-x-1 translate-y-0.5 mix-blend-screen pointer-events-none animate-[aberration-red_18s_ease-in-out_infinite]">{cursedThe}</span>
                      <span className="absolute inset-0 text-cyan-400 opacity-40 translate-x-1 -translate-y-0.5 mix-blend-screen pointer-events-none animate-[aberration-cyan_21s_ease-in-out_infinite]">{cursedThe}</span>
                  </h1>
                </div>
            </div>

            <div className="relative w-full flex items-center justify-center overflow-visible mt-2 z-10">
                <div 
                  className={`relative transition-all duration-1000 ${isGlitching ? 'scale-[1.06] translate-x-1 brightness-150' : 'scale-100'}`}
                  style={{ filter: 'url(#distort)' }}
                >
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-[0.3em] uppercase text-white drop-shadow-[0_0_35px_rgba(255,255,255,0.4)] animate-[logo-throb_24s_ease-in-out_infinite] relative whitespace-nowrap">
                      <span className="relative z-10">{cursedMachine}</span>
                      
                      <span className="absolute inset-0 text-red-600 opacity-40 -translate-x-2 translate-y-1 mix-blend-screen pointer-events-none animate-[aberration-red_18s_ease-in-out_infinite]">
                      {cursedMachine}
                      </span>
                      <span className="absolute inset-0 text-cyan-400 opacity-40 translate-x-2 -translate-y-1 mix-blend-screen pointer-events-none animate-[aberration-cyan_21s_ease-in-out_infinite]">
                      {cursedMachine}
                      </span>
                  </h1>
                </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
          <ChevronUp className="text-gray-600 w-8 h-8 opacity-20" />
          
          <button
            onClick={onStart}
            className="group relative w-full py-8 bg-transparent border border-fresh-blood/40 text-fresh-blood font-bold uppercase text-5xl tracking-[1em] transition-all hover:bg-fresh-blood/10 hover:text-fresh-blood hover:shadow-[0_0_70px_rgba(136,8,8,0.3)] active:scale-95 overflow-hidden rounded-sm"
          >
            <span className="relative z-10 font-bold">ENTER</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[copper_3s_linear_infinite]"></div>
          </button>
          
          <ChevronUp className="text-gray-600 w-8 h-8 opacity-20" />
        </div>
      </div>

      <div className="absolute bottom-10 w-full flex justify-center px-10">
        <div className="p-6 md:p-8 max-w-4xl">
          <p className="text-[10px] md:text-xs text-gray-600 font-mono uppercase tracking-[0.4em] leading-relaxed opacity-60">
            THE MACHINE IS A CLOSED-LOOP SYSTEM. PSYCHOLOGICAL INTEGRITY CANNOT BE GUARANTEED.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes copper {
          0% { transform: translateX(-100%) translateY(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(100%) translateY(0); opacity: 0; }
        }

        @keyframes logo-throb {
          0%, 100% { 
            transform: scale(1); 
            filter: drop-shadow(0 0 35px rgba(255,255,255,0.4)) blur(0px);
          }
          50% { 
            transform: scale(1.02); 
            filter: drop-shadow(0 0 65px rgba(255,255,255,0.6)) blur(0.5px);
          }
        }

        @keyframes aberration-red {
          0%, 100% { transform: translate(-1.5px, 0.5px); opacity: 0.4; }
          50% { transform: translate(-4px, -2px); opacity: 0.7; }
        }

        @keyframes aberration-cyan {
          0%, 100% { transform: translate(1.5px, -0.5px); opacity: 0.4; }
          50% { transform: translate(4px, 2px); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};
