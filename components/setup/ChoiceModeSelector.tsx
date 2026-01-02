
import React from 'react';
import { MessageSquare, Settings, Bot } from 'lucide-react';
import { SetupMode } from './types';

interface Props {
  onSelect: (mode: SetupMode) => void;
}

export const ChoiceModeSelector: React.FC<Props> = ({ onSelect }) => (
  <div className="flex flex-col items-center justify-center h-full space-y-12 animate-fadeIn p-8 md:p-16 relative z-10 overflow-hidden bg-[#030303]">
    <div className="text-center space-y-4 mb-4">
      <h2 className="text-5xl md:text-6xl font-serif italic tracking-wider text-white drop-shadow-md">
        I N I T I A L &nbsp; C A L I B R A T I O N
      </h2>
      <div className="relative inline-block">
           <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.4em] relative z-10">
              SELECT YOUR PATH INTO THE MACHINE
           </p>
           <p className="absolute top-0 left-0 w-full text-gray-500 font-mono text-xs uppercase tracking-[0.4em] animate-glitch opacity-50 pointer-events-none">
              WELCOME TO THE MACHINE
           </p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-7xl flex-1 max-h-[60vh]">
      <button 
        onClick={() => onSelect('guided')}
        className="group relative h-full w-full border border-gray-800 bg-black/80 hover:bg-gray-900/40 hover:border-haunt-gold/50 transition-all duration-500 flex flex-col items-center justify-center text-center p-12 space-y-6 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-haunt-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="p-6 rounded-full border border-haunt-gold/20 bg-haunt-gold/5 group-hover:scale-110 group-hover:border-haunt-gold/50 transition-transform duration-500 relative z-10">
          <MessageSquare className="w-10 h-10 text-haunt-gold" />
        </div>
        <div className="relative z-10 space-y-3">
          <h3 className="text-2xl font-bold text-white uppercase tracking-widest">Lets Tell A Story Together</h3>
          <div className="text-xs font-mono font-bold text-haunt-gold uppercase tracking-[0.3em]">Guided Synthesis</div>
        </div>
        <p className="text-xs text-gray-500 uppercase leading-relaxed tracking-widest max-w-sm relative z-10 opacity-60 group-hover:opacity-100 transition-opacity">
          The Machine acts as your guide. Through evocative questioning, we will weave the fabric of your trauma together.
        </p>
      </button>

      <button 
        onClick={() => onSelect('manual')}
        className="group relative h-full w-full border border-gray-800 bg-black/80 hover:bg-gray-900/40 hover:border-fresh-blood/50 transition-all duration-500 flex flex-col items-center justify-center text-center p-12 space-y-6 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-fresh-blood/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="p-6 rounded-full border border-fresh-blood/20 bg-fresh-blood/5 group-hover:scale-110 group-hover:border-fresh-blood/50 transition-transform duration-500 relative z-10">
          <Settings className="w-10 h-10 text-fresh-blood" />
        </div>
        <div className="relative z-10 space-y-3">
          <h3 className="text-2xl font-bold text-white uppercase tracking-widest">I Want To Tell A Story</h3>
          <div className="text-xs font-mono font-bold text-fresh-blood uppercase tracking-[0.3em]">Manual Calibration</div>
        </div>
        <p className="text-xs text-gray-500 uppercase leading-relaxed tracking-widest max-w-sm relative z-10 opacity-60 group-hover:opacity-100 transition-opacity">
          Direct dashboard access. For architects who already know the exact shape of the nightmare they wish to inhabit.
        </p>
      </button>
    </div>

    <button 
      onClick={() => onSelect('simulation')}
      className="group relative w-full max-w-7xl border border-gray-800 bg-black/80 hover:bg-gray-900/40 hover:border-amber-500/50 transition-all duration-500 flex items-center justify-center p-10 space-x-12 overflow-hidden min-h-[180px]"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="p-5 rounded-full border border-amber-500/20 bg-amber-500/5 group-hover:scale-110 group-hover:border-amber-500/50 transition-transform duration-500 relative z-10 flex-shrink-0">
           <Bot className="w-8 h-8 text-amber-500" />
      </div>
      <div className="flex flex-col items-start relative z-10 space-y-2 text-left">
          <h3 className="text-xl font-bold text-white uppercase tracking-widest">Tell Me A Story</h3>
          <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-[0.2em]">Test Protocol</span>
              <span className="text-[10px] text-gray-600 uppercase tracking-widest">Diagnostic Sequence // Autonomous Diagnostics</span>
          </div>
          <p className="text-[11px] text-gray-500 uppercase leading-relaxed tracking-widest max-w-2xl pt-2 opacity-60 group-hover:opacity-100 transition-opacity">
              The machine executes a self-contained test loop. No user input required. Used for validating narrative pathfinding and atmospheric cohesion.
          </p>
      </div>
    </button>

    <div className="absolute bottom-6 left-0 w-full text-center">
      <p className="text-[10px] text-gray-700 font-mono uppercase tracking-[0.6em] animate-pulse">
          System idling... Awaiting User Volition.
      </p>
    </div>
  </div>
);
