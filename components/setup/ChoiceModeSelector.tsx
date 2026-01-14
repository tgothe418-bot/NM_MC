
import React from 'react';
import { Settings, Bot, Upload, Terminal } from 'lucide-react';
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
        I N I T I A L &nbsp; C A L I B R A T I O N
      </h2>
      <div className="relative inline-block">
           <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.6em] relative z-10">
              SELECT YOUR PATH INTO THE MACHINE
           </p>
      </div>
    </div>

    {/* MAIN DOMINANT AREA */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-7xl flex-grow max-h-[600px]">
      
      {/* LEFT: TRAINING DATA INJECTION */}
      <div className="group relative w-full h-full border border-gray-800 bg-black/60 p-10 backdrop-blur-sm flex flex-col hover:border-system-green/50 transition-colors duration-500">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-system-green to-transparent opacity-30 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        <div className="space-y-6 mb-8">
             <div className="flex items-center gap-5 text-white">
                 <div className="p-4 bg-system-green/10 rounded-full border border-system-green/30 text-system-green group-hover:scale-110 transition-transform duration-500">
                    <Upload className="w-8 h-8" />
                 </div>
                 <h3 className="text-3xl font-bold uppercase tracking-widest group-hover:text-system-green transition-colors">Training Data</h3>
             </div>
             <div>
                <div className="text-xs font-mono font-bold text-system-green uppercase tracking-[0.3em] mb-3">Data Injection</div>
                <p className="text-sm text-gray-500 uppercase leading-relaxed tracking-widest max-w-md">
                    Upload scripts, lore, or aesthetic references. The Machine will extract parameters to seed the simulation.
                </p>
             </div>
        </div>
        
        <div className="flex-1 flex flex-col justify-center border-t border-gray-800/50 pt-6">
            <SourceUploader />
        </div>
      </div>

      {/* RIGHT: MANUAL CALIBRATION */}
      <button 
        onClick={() => onSelect('manual')}
        className="group relative w-full h-full border border-gray-800 bg-black/80 hover:bg-gray-900/40 hover:border-fresh-blood/50 transition-all duration-500 flex flex-col items-center justify-center text-center p-12 space-y-8 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-fresh-blood/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <div className="p-8 rounded-full border border-fresh-blood/20 bg-fresh-blood/5 group-hover:scale-110 group-hover:border-fresh-blood/50 transition-transform duration-500 relative z-10 shadow-[0_0_30px_rgba(136,8,8,0.1)]">
          <Settings className="w-16 h-16 text-fresh-blood" />
        </div>
        
        <div className="relative z-10 space-y-4">
          <h3 className="text-4xl font-bold text-white uppercase tracking-widest group-hover:text-red-100 transition-colors">I Want To Tell A Story</h3>
          <div className="text-sm font-mono font-bold text-fresh-blood uppercase tracking-[0.4em]">Manual Calibration</div>
        </div>
        
        <p className="text-sm text-gray-500 uppercase leading-relaxed tracking-widest max-w-lg relative z-10 opacity-60 group-hover:opacity-100 transition-opacity">
          Direct dashboard access. For architects who already know the exact shape of the nightmare they wish to inhabit.
        </p>
      </button>
    </div>

    {/* FOOTER: DEBUG MODE (Small Place) */}
    <div className="w-full flex justify-center pb-6 flex-shrink-0">
        <button 
            onClick={() => onSelect('simulation')}
            className="group flex items-center gap-4 px-6 py-3 rounded-full border border-gray-900 hover:border-amber-900/50 bg-black hover:bg-amber-900/10 transition-all opacity-50 hover:opacity-100"
        >
            <div className="p-1.5 rounded-full bg-gray-900 group-hover:bg-amber-900/20 text-gray-600 group-hover:text-amber-500 transition-colors">
                <Terminal className="w-3 h-3" />
            </div>
            <div className="text-left">
                <div className="text-[10px] font-mono font-bold text-gray-500 group-hover:text-amber-500 uppercase tracking-widest transition-colors">
                    Tell Me A Story
                </div>
                <div className="text-[8px] font-mono text-gray-700 uppercase tracking-wider">
                    Debug Protocol // Autonomous Test Loop
                </div>
            </div>
        </button>
    </div>

  </div>
);
