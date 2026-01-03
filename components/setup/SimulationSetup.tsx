
import React, { useState } from 'react';
import { Bot, Loader2, Play, Upload, Activity, Zap, Radio } from 'lucide-react';
import { SimulationConfig } from '../../types';
import { useSetupStore } from './store';
import { SourceUploader } from './SourceUploader';

// Reusing option definitions for consistency
const CLUSTERS = ['Flesh', 'System', 'Haunting', 'Self', 'Blasphemy', 'Survival', 'Desire'];
const MODES = ['Survivor', 'Villain'];
const INTENSITIES = ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5'];

interface Props {
  onRun: (config: SimulationConfig) => void;
  onBack: () => void;
}

export const SimulationSetup: React.FC<Props> = ({ onRun, onBack }) => {
  const store = useSetupStore();
  const [cycles, setCycles] = useState(10);
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = () => {
    setIsStarting(true);
    setTimeout(() => {
        // Construct config from Store + Local State
        // Ensure defaults if store is empty
        const cluster = store.selectedClusters.length > 0 ? store.selectedClusters[0] : 'Flesh';
        
        // Normalize Mode
        let mode: 'Survivor' | 'Villain' = 'Survivor';
        if (store.mode.includes('Antagonist') || store.mode.includes('Predator') || store.mode === 'Villain') {
            mode = 'Villain';
        }

        onRun({
            perspective: 'Third Person', // Default for diagnostics
            mode: mode,
            starting_point: 'Prologue',
            cluster: cluster,
            intensity: store.intensity || 'Level 3',
            cycles: cycles,
            visual_motif: store.visualMotif || 'Diagnostic Overlay',
            location_description: store.locationDescription || 'Test Chamber',
            // Pass through other generated fields if they exist from SourceUploader
            villain_name: store.villainName,
            villain_appearance: store.villainAppearance,
            survivor_name: store.survivorName,
            survivor_background: store.survivorBackground
        });
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-[#030303] animate-fadeIn relative z-10 overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12">
            <div className="max-w-5xl mx-auto space-y-12">
                
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="text-amber-500 font-mono text-4xl font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-4">
                        <Bot className="w-12 h-12" /> Diagnostic Protocol
                    </div>
                    <p className="text-gray-400 font-mono text-sm max-w-xl mx-auto leading-relaxed tracking-wider uppercase">
                        Autonomous narrative generation testing. The system will execute a predefined number of cycles.
                        <br/><span className="text-amber-500/50">Upload source material to seed the test parameters.</span>
                    </p>
                </div>

                {/* Source Uploader Integration */}
                <div className="bg-gray-900/20 p-8 border border-gray-800 rounded-sm backdrop-blur-sm">
                    <h3 className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <Upload className="w-4 h-4" /> Seed Data Injection
                    </h3>
                    <SourceUploader />
                </div>

                {/* Configuration Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Left Column: Cycles & Mode */}
                    <div className="space-y-8 bg-gray-900/20 p-8 border border-gray-800 rounded-sm">
                        <div className="space-y-4">
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

                        <div className="space-y-4">
                             <label className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Activity className="w-4 h-4" /> Simulation Role
                             </label>
                             <div className="flex gap-2">
                                {MODES.map(m => {
                                    const isSelected = store.mode.includes(m) || (m === 'Survivor' && store.mode.includes('Prey')) || (m === 'Villain' && store.mode.includes('Predator'));
                                    return (
                                        <button
                                            key={m}
                                            onClick={() => store.setMode(m)}
                                            className={`flex-1 py-3 px-4 border text-xs font-mono uppercase tracking-wider transition-all rounded-sm
                                                ${isSelected
                                                    ? 'bg-amber-500/20 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                                                    : 'bg-black border-gray-800 text-gray-600 hover:border-gray-600'}`}
                                        >
                                            {m}
                                        </button>
                                    );
                                })}
                             </div>
                        </div>
                    </div>

                    {/* Right Column: Intensity & Cluster */}
                    <div className="space-y-8 bg-gray-900/20 p-8 border border-gray-800 rounded-sm">
                        <div className="space-y-4">
                             <label className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Zap className="w-4 h-4" /> Stress Threshold
                             </label>
                             <select 
                                value={store.intensity} 
                                onChange={(e) => store.setIntensity(e.target.value)}
                                className="w-full bg-black border border-gray-800 text-gray-300 text-xs font-mono uppercase p-3 focus:border-amber-500 outline-none rounded-sm"
                             >
                                {INTENSITIES.map(i => <option key={i} value={i}>{i}</option>)}
                             </select>
                        </div>

                        <div className="space-y-4">
                             <label className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Radio className="w-4 h-4" /> Thematic Cluster
                             </label>
                             <div className="grid grid-cols-2 gap-2">
                                {CLUSTERS.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => store.setSelectedClusters([c])}
                                        className={`py-2 px-2 border text-[10px] font-mono uppercase tracking-wider transition-all text-center rounded-sm
                                            ${store.selectedClusters.includes(c) 
                                                ? 'bg-amber-500/20 border-amber-500 text-amber-500' 
                                                : 'bg-black border-gray-800 text-gray-600 hover:border-gray-600'}`}
                                    >
                                        {c}
                                    </button>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-gray-800 bg-black/80 backdrop-blur-sm flex justify-center gap-6">
            <button 
                onClick={handleStart}
                disabled={isStarting}
                className={`px-12 py-4 bg-amber-500 text-black font-mono font-bold uppercase tracking-[0.2em] hover:bg-amber-400 transition-colors rounded-sm flex items-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.3)] ${isStarting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {isStarting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-black" />}
                {isStarting ? 'Initializing...' : 'Run Diagnostics'}
            </button>

            <button 
                onClick={onBack}
                disabled={isStarting}
                className="text-gray-600 hover:text-white transition-colors text-xs font-mono uppercase tracking-[0.2em] px-8 border border-transparent hover:border-gray-800 rounded-sm"
            >
                Abort
            </button>
        </div>
    </div>
  );
};
