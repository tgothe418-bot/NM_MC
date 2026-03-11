
import React from 'react';
import { Settings, Upload, MessageSquare, Bug } from 'lucide-react';
import { SetupMode } from './types';
import { SourceUploader } from './SourceUploader';

interface Props {
  onSelect: (mode: SetupMode) => void;
}

export const ChoiceModeSelector: React.FC<Props> = ({ onSelect }) => (
  <div className="flex flex-col items-center justify-center min-h-screen h-full space-y-12 animate-fadeIn p-8 md:p-12 relative z-10 overflow-y-auto custom-scrollbar bg-[#030303]">
    
    {/* HEADER */}
    <div className="text-center space-y-4 flex-shrink-0">
      <h2 className="text-5xl md:text-7xl font-serif italic tracking-wider text-white drop-shadow-md">
        S C E N A R I O &nbsp; S E T U P
      </h2>
      <div className="relative inline-block">
           <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.6em] relative z-10">
              CHOOSE YOUR METHOD
           </p>
      </div>
    </div>

    {/* MAIN DOMINANT AREA */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-[1600px] flex-grow max-h-[600px]">
      
      {/* 1. TEST / DEBUG MODE (Replaces Upload) */}
      <button 
        onClick={() => onSelect('simulation')}
        className="group relative w-full h-full border border-gray-800 bg-black/80 hover:bg-gray-900/40 hover:border-amber-500/50 transition-all duration-500 flex flex-col p-10 text-left space-y-8 overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        <div className="space-y-6">
             <div className="flex items-center gap-5 text-white">
                 <div className="p-4 bg-amber-900/20 rounded-full border border-amber-500/30 text-amber-500 group-hover:scale-110 transition-transform duration-500">
                    <Bug className="w-8 h-8" />
                 </div>
                 <h3 className="text-3xl font-bold uppercase tracking-widest group-hover:text-amber-500 transition-colors">Test / Debug</h3>
             </div>
             <div>
                <div className="text-xs font-mono font-bold text-amber-500 uppercase tracking-[0.3em] mb-3">Logic Probe</div>
                <p className="text-sm text-gray-500 uppercase leading-relaxed tracking-widest">
                    Automated Stress-Test & Logic Probe. Run diagnostic simulations to verify narrative consistency, mechanical balance, and state-mutation integrity.
                </p>
             </div>
        </div>

        <div className="mt-auto border-t border-gray-800/50 pt-6 opacity-60 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-500 flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                Diagnostic
            </span>
        </div>
      </button>

      {/* 2. CHAT */}
      <button 
        onClick={() => onSelect('chat')}
        className="group relative w-full h-full border border-gray-800 bg-black/80 hover:bg-gray-900/40 hover:border-indigo-500/50 transition-all duration-500 flex flex-col p-10 text-left space-y-8 overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        <div className="space-y-6">
             <div className="flex items-center gap-5 text-white">
                 <div className="p-4 bg-indigo-900/20 rounded-full border border-indigo-500/30 text-indigo-400 group-hover:scale-110 transition-transform duration-500">
                    <MessageSquare className="w-8 h-8" />
                 </div>
                 <h3 className="text-3xl font-bold uppercase tracking-widest group-hover:text-indigo-400 transition-colors">Chat</h3>
             </div>
             <div>
                <div className="text-xs font-mono font-bold text-indigo-500 uppercase tracking-[0.3em] mb-3">Neural Link</div>
                <p className="text-sm text-gray-500 uppercase leading-relaxed tracking-widest">
                    The personification of the engine. A conversational companion. Speak with the Architect about fear, existence, or build a scenario when you are ready. Upload reference files to train the conversation.
                </p>
             </div>
        </div>

        <div className="mt-auto border-t border-gray-800/50 pt-6 opacity-60 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-indigo-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                Active
            </span>
        </div>
      </button>

      {/* 3. MANUAL */}
      <button 
        onClick={() => onSelect('manual')}
        className="group relative w-full h-full border border-gray-800 bg-black/80 hover:bg-gray-900/40 hover:border-fresh-blood/50 transition-all duration-500 flex flex-col p-10 text-left space-y-8 overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-fresh-blood to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        <div className="space-y-6">
             <div className="flex items-center gap-5 text-white">
                 <div className="p-4 bg-fresh-blood/10 rounded-full border border-fresh-blood/30 text-fresh-blood group-hover:scale-110 transition-transform duration-500">
                    <Settings className="w-8 h-8" />
                 </div>
                 <h3 className="text-3xl font-bold uppercase tracking-widest group-hover:text-red-100 transition-colors">Manual Setup</h3>
             </div>
             <div>
                <div className="text-xs font-mono font-bold text-fresh-blood uppercase tracking-[0.3em] mb-3">Custom Config</div>
                <p className="text-sm text-gray-500 uppercase leading-relaxed tracking-widest">
                    Full control. Manually define every parameter: specific characters, detailed locations, rules of engagement, and narrative intensity.
                </p>
             </div>
        </div>

        <div className="mt-auto border-t border-gray-800/50 pt-6 opacity-60 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-fresh-blood">
                &gt; Configure
            </span>
        </div>
      </button>
    </div>
  </div>
);
