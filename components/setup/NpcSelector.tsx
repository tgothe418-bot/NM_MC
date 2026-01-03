
import React, { useEffect, useState } from 'react';
import { Users, RefreshCw, Check, AlertCircle, Play, User } from 'lucide-react';
import { SimulationConfig, NpcState } from '../../types';
import { generateProceduralNpc } from '../../services/npcGenerator';

interface NpcSelectorProps {
  config: SimulationConfig;
  onConfirm: (finalConfig: SimulationConfig) => void;
  onBack: () => void;
}

export const NpcSelector: React.FC<NpcSelectorProps> = ({ config, onConfirm, onBack }) => {
  const [candidates, setCandidates] = useState<NpcState[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [isGenerating, setIsGenerating] = useState(true);
  
  // Default pool size
  const POOL_SIZE = 6;
  const RECOMMENDED_COUNT = config.victim_count || 3;

  useEffect(() => {
    generateBatch();
  }, []);

  const generateBatch = () => {
    setIsGenerating(true);
    // Slight timeout to allow UI to render the loading state
    setTimeout(() => {
        const newPool = Array.from({ length: POOL_SIZE }).map(() => 
            generateProceduralNpc(config.cluster, config.intensity)
        );
        setCandidates(newPool);
        // Pre-select the recommended amount
        setSelectedIndices(new Set(Array.from({ length: RECOMMENDED_COUNT }, (_, i) => i)));
        setIsGenerating(false);
    }, 100);
  };

  const toggleSelection = (index: number) => {
    const newSet = new Set(selectedIndices);
    if (newSet.has(index)) {
        newSet.delete(index);
    } else {
        newSet.add(index);
    }
    setSelectedIndices(newSet);
  };

  const handleConfirm = () => {
    const selectedNpcs = candidates.filter((_, i) => selectedIndices.has(i));
    onConfirm({
        ...config,
        pre_generated_npcs: selectedNpcs,
        victim_count: selectedNpcs.length // Sync count
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#030303] animate-fadeIn relative overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 p-8 md:p-12 border-b border-gray-900 bg-black/50 backdrop-blur-md z-10">
            <div className="flex justify-between items-start">
                <div className="space-y-2">
                    <h2 className="text-3xl md:text-4xl font-mono font-bold text-gray-200 uppercase tracking-tight flex items-center gap-4">
                        <Users className="w-8 h-8 text-system-green" /> Subject Selection
                    </h2>
                    <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.2em]">
                        Select active participants for the simulation.
                    </p>
                </div>
                <button 
                    onClick={generateBatch} 
                    disabled={isGenerating}
                    className="flex items-center gap-2 text-system-green hover:text-white transition-colors border border-system-green/30 px-4 py-2 hover:bg-system-green/10 rounded-sm disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    <span className="text-xs font-mono uppercase tracking-widest hidden md:inline">Reroll Pool</span>
                </button>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12">
            {isGenerating ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
                    <RefreshCw className="w-12 h-12 text-system-green animate-spin" />
                    <div className="text-sm font-mono uppercase tracking-widest text-system-green animate-pulse">Synthesizing Neural Profiles...</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                    {candidates.map((npc, idx) => {
                        const isSelected = selectedIndices.has(idx);
                        return (
                            <button
                                key={idx}
                                onClick={() => toggleSelection(idx)}
                                className={`relative text-left p-6 border-2 transition-all duration-300 group flex flex-col h-full min-h-[280px]
                                    ${isSelected 
                                        ? 'border-system-green bg-system-green/5 shadow-[0_0_30px_rgba(16,185,129,0.1)]' 
                                        : 'border-gray-800 bg-black hover:border-gray-600 opacity-60 hover:opacity-100'
                                    }`}
                            >
                                {/* Selection Indicator */}
                                <div className={`absolute top-4 right-4 w-6 h-6 border flex items-center justify-center transition-colors
                                    ${isSelected ? 'bg-system-green border-system-green text-black' : 'border-gray-700 bg-black text-transparent'}
                                `}>
                                    <Check className="w-4 h-4" />
                                </div>

                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-sm ${isSelected ? 'bg-system-green/20 text-system-green' : 'bg-gray-900 text-gray-500'}`}>
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-200 uppercase tracking-wide">{npc.name}</div>
                                            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{npc.archetype.split('(')[0]}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3 pt-4 border-t border-gray-800/50">
                                        <div>
                                            <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">Origin</div>
                                            <div className="text-xs text-gray-400 font-mono">{npc.origin.region}</div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">Core Drive</div>
                                            <div className="text-xs text-gray-300 italic">"{npc.hidden_agenda.goal}"</div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">Trauma Anchor</div>
                                            <div className="text-xs text-red-400/80">{npc.psychology.profile.core_trauma}</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="pt-4 mt-auto">
                                    <div className="text-[9px] font-mono text-gray-600 uppercase flex gap-4">
                                        <span>Sanity: {Math.round(npc.psychology.sanity_percentage)}%</span>
                                        <span className={npc.resources_held.length > 0 ? 'text-system-green' : 'text-gray-600'}>
                                            Items: {npc.resources_held.length}
                                        </span>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-900 bg-black/80 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-6 z-20">
            <div className="flex items-center gap-4">
                <div className="text-gray-500 font-mono text-xs uppercase tracking-widest">
                    Selected: <span className="text-system-green font-bold text-lg">{selectedIndices.size}</span>
                </div>
                {selectedIndices.size === 0 && (
                    <div className="text-amber-500 text-xs flex items-center gap-2 animate-pulse">
                        <AlertCircle className="w-4 h-4" /> Simulation requires at least 1 subject.
                    </div>
                )}
            </div>

            <div className="flex gap-4 w-full md:w-auto">
                <button 
                    onClick={onBack}
                    className="px-8 py-4 border border-gray-800 text-gray-500 hover:text-white hover:border-white transition-colors font-mono uppercase tracking-widest text-xs"
                >
                    Back
                </button>
                <button 
                    onClick={handleConfirm}
                    disabled={selectedIndices.size === 0}
                    className="flex-1 md:flex-none px-12 py-4 bg-system-green text-black font-bold font-mono uppercase tracking-[0.2em] hover:bg-green-400 transition-colors flex items-center justify-center gap-3 disabled:opacity-20 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                    <Play className="w-4 h-4 fill-black" /> Initiate
                </button>
            </div>
        </div>
    </div>
  );
};
