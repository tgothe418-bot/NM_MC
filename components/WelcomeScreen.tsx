
import React from 'react';
import { Terminal, Zap, Skull, ChevronRight } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="fixed inset-0 z-[200] bg-void flex flex-col items-center justify-center overflow-hidden font-mono select-none">
      {/* AMIGA Copper Bars Background Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 w-full h-12 bg-gradient-to-r from-transparent via-red-600 to-transparent blur-3xl animate-[copper_4s_ease-in-out_infinite]"></div>
        <div className="absolute top-1/2 w-full h-12 bg-gradient-to-r from-transparent via-purple-600 to-transparent blur-3xl animate-[copper_5s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute top-3/4 w-full h-12 bg-gradient-to-r from-transparent via-blue-600 to-transparent blur-3xl animate-[copper_6s_ease-in-out_infinite]"></div>
      </div>

      {/* CRT Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none z-[210] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[size:100%_6px]"></div>
      
      {/* Title Container */}
      <div className="relative z-10 text-center space-y-12 px-10">
        <div className="relative group">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-[0.3em] uppercase text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] animate-glitch">
            THE NIGHTMARE MACHINE
          </h1>
          <h1 className="absolute inset-0 text-6xl md:text-8xl lg:text-9xl font-bold tracking-[0.3em] uppercase text-red-500/20 blur-md translate-x-2 animate-pulse">
            THE NIGHTMARE MACHINE
          </h1>
          <h1 className="absolute inset-0 text-6xl md:text-8xl lg:text-9xl font-bold tracking-[0.3em] uppercase text-cyan-500/20 blur-md -translate-x-2 animate-pulse">
            THE NIGHTMARE MACHINE
          </h1>
        </div>

        <div className="flex flex-col items-center gap-10 mt-20 animate-fadeIn">
          <div className="flex items-center gap-8 text-fresh-blood opacity-60 text-base tracking-[0.6em] uppercase font-bold">
            <span className="h-px w-20 bg-fresh-blood"></span>
            NEURAL LINK READY
            <span className="h-px w-20 bg-fresh-blood"></span>
          </div>

          <button
            onClick={onStart}
            className="group relative px-20 py-8 bg-transparent border-2 border-fresh-blood text-fresh-blood font-bold uppercase text-2xl tracking-[0.5em] transition-all hover:bg-fresh-blood hover:text-black hover:shadow-[0_0_60px_rgba(136,8,8,0.7)] active:scale-95 overflow-hidden rounded-sm"
          >
            <span className="relative z-10 flex items-center gap-4">
              Tether Consciousness <ChevronRight className="w-8 h-8" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[copper_1.5s_linear_infinite]"></div>
          </button>
        </div>
      </div>

      {/* Decorative Icons */}
      <div className="absolute top-12 left-12 text-gray-800 animate-pulse opacity-40">
        <Terminal className="w-12 h-12" />
      </div>
      <div className="absolute bottom-24 right-12 text-gray-800 animate-pulse opacity-40">
        <Skull className="w-16 h-16" />
      </div>

      {/* Mandatory Psychological Disclaimer */}
      <div className="absolute bottom-12 w-full text-center px-10">
        <p className="text-sm md:text-lg text-gray-600 font-mono uppercase tracking-[0.3em] max-w-5xl mx-auto leading-relaxed opacity-50">
          By initializing, you accept all psychological outcomes. The Machine is indifferent to your regret.
        </p>
      </div>

      <style>{`
        @keyframes copper {
          0% { transform: translateX(-100%) translateY(0); opacity: 0; }
          50% { opacity: 0.9; }
          100% { transform: translateX(100%) translateY(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
