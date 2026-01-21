
import React from 'react';
import { Settings, Upload, Terminal, MessageSquare } from 'lucide-react';
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
      
      {/* 1. UPLOAD */}
      <div className="group relative w-full h-full border border-gray-800 bg-black/60 p-10 backdrop-blur-sm flex flex-col hover:border-system-green/50 transition-colors duration-500">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-system-green to-transparent opacity-30 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        <div className="space-y-6 mb-8">
             <div className="flex items-center gap-5 text-white">
                 <div className="p-4 bg-system-green/10 rounded-full border border-system-green/30 text-system-green group-hover:scale-110 transition-transform duration-500">
                    <Upload className="w-8 h-8" />
                 </div>
                 <h3 className="text-3xl font-bold uppercase tracking-widest group-hover:text-system-green transition-colors">Upload Reference</h3>
             </div>
             <div>
                <div className="text-xs font-mono font-bold text-system-green uppercase tracking-[0.3em] mb-3">Drag & Drop</div>
                <p className="text-sm text-gray-500 uppercase leading-relaxed tracking-widest max-w-md">
                    Have a script, story bible, or image? Upload it here. The system will analyze it and extract characters, themes, and settings automatically.
                </p>
             </div>
        </div>
        
        <div className="flex-1 flex flex-col justify-center border-t border-gray-800/50 pt-6">
            <SourceUploader />
        </div>
      </div>

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
                > Configure
            </span>
        </div>
      </button>
    </div>

    {/* FOOTER: DEBUG MODE */}
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
                    Autonomous Test Loop
                </div>
            </div>
        </button>
    </div>

  </div>
);
