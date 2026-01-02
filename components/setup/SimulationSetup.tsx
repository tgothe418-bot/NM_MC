
import React, { useState } from 'react';
import { Bot, Loader2, Play } from 'lucide-react';
import { SimulationConfig } from '../../types';

interface Props {
  onRun: (config: SimulationConfig) => void;
  onBack: () => void;
}

export const SimulationSetup: React.FC<Props> = ({ onRun, onBack }) => {
  const [cycles, setCycles] = useState(10);
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = () => {
    setIsStarting(true);
    setTimeout(() => {
        onRun({
            perspective: 'Third Person',
            mode: 'Survivor',
            starting_point: 'Prologue',
            cluster: 'Flesh',
            intensity: 'Level 3',
            cycles: cycles,
            visual_motif: 'Diagnostic',
            location_description: 'Test Chamber',
        });
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-12 bg-[#030303] text-center space-y-8 animate-fadeIn relative z-10">
        <div className="text-amber-500 font-mono text-4xl font-bold uppercase tracking-[0.2em] flex items-center gap-4">
            <Bot className="w-12 h-12" /> Diagnostic Protocol
        </div>
        <p className="text-gray-400 font-mono text-sm max-w-xl leading-relaxed tracking-wider uppercase">
            Autonomous narrative generation testing. The system will execute a predefined number of cycles to verify logic and atmospheric cohesion.
        </p>
        
        <div className="bg-gray-900/20 p-8 border border-gray-800 rounded-sm w-full max-w-md space-y-6 backdrop-blur-sm">
            <div className="space-y-4 text-left">
                <label className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em] flex justify-between">
                    <span>Execution Cycles</span>
                    <span className="text-amber-500 font-bold">{cycles}</span>
                </label>
                <input 
                    type="range" 
                    min="5" 
                    max="50" 
                    step="5" 
                    value={cycles} 
                    onChange={(e) => setCycles(parseInt(e.target.value))}
                    className="w-full accent-amber-500 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                />
            </div>
        </div>

        <button 
            onClick={handleStart}
            disabled={isStarting}
            className={`px-12 py-4 bg-amber-500 text-black font-mono font-bold uppercase tracking-[0.2em] hover:bg-amber-400 transition-colors rounded-sm flex items-center gap-3 ${isStarting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {isStarting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-black" />}
            {isStarting ? 'Initializing...' : 'Run Diagnostics'}
        </button>

        <button 
            onClick={onBack}
            className="text-gray-600 hover:text-white transition-colors text-xs font-mono uppercase tracking-[0.2em]"
        >
            Abort Sequence
        </button>
    </div>
  );
};
