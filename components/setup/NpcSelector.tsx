
import React, { useEffect, useState } from 'react';
import { Users, RefreshCw, Check, AlertCircle, Play, User, Edit2, Save, X, Target, MapPin } from 'lucide-react';
import { SimulationConfig, NpcState } from '../../types';
import { createNpcFactory } from '../../services/npcGenerator';
import { extractCharactersFromText, hydrateUserCharacter } from '../../services/geminiService';
import { useSetupStore } from './store';

interface NpcSelectorProps {
  config: SimulationConfig;
  onConfirm: (finalConfig: SimulationConfig) => void;
  onBack: () => void;
}

export const NpcSelector: React.FC<NpcSelectorProps> = ({ config, onConfirm, onBack }) => {
  const { parsedCharacters } = useSetupStore();
  const [candidates, setCandidates] = useState<NpcState[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [isGenerating, setIsGenerating] = useState(true);
  
  // Edit State
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<NpcState>>({});

  // Ensure pool size is at least enough to cover the requested count + some variety
  const REQUESTED_COUNT = config.victim_count || 3;
  const POOL_SIZE = Math.max(6, REQUESTED_COUNT + 3);

  useEffect(() => {
    generateBatch();
  }, []);

  const generateBatch = async () => {
    setIsGenerating(true);
    setEditingIndex(null);
    
    // 1. Determine Source Seeds
    let seedObjects: Partial<NpcState>[] = [];
    
    // Priority A: Structured Training Data (ParsedCharacters)
    if (parsedCharacters && parsedCharacters.length > 0) {
        // Hydrate these in parallel to get deep stats (Trauma, Origin) from their descriptions
        const hydrationPromises = parsedCharacters.map(async (pc) => {
            let hydrated: Partial<NpcState> = {};
            if (pc.description) {
                try {
                    hydrated = await hydrateUserCharacter(pc.description, config.cluster);
                } catch (e) {
                    console.warn("Hydration failed for", pc.name);
                }
            }
            
            // Merge Explicit Props (High Confidence) over Hydrated Props (Medium Confidence)
            return {
                ...hydrated,
                name: pc.name,
                archetype: pc.role, // Explicit role
                hidden_agenda: {
                    ...hydrated.hidden_agenda,
                    goal: pc.goal || hydrated.hidden_agenda?.goal || "Survive",
                },
                // Keep hydration's psychology/trauma if available, else generator fills it
            };
        });
        
        seedObjects = await Promise.all(hydrationPromises);
    } 
    // Priority B: Raw Text Description
    else if (config.victim_description && config.victim_description.trim().length > 0) {
        try {
            seedObjects = await extractCharactersFromText(config.victim_description, config.cluster);
        } catch (e) {
            console.error("Extraction failed, falling back to procedural", e);
        }
    }

    // Initialize shared name registry to prevent duplicates within this batch
    const batchForbiddenNames = new Set<string>();

    // Register already known seed names if any
    seedObjects.forEach(s => {
        if (s.name) batchForbiddenNames.add(s.name);
    });

    try {
        const promises = Array.from({ length: POOL_SIZE }).map(async (_, i) => {
            // If we have a seed object for this index, use it.
            const seed = i < seedObjects.length ? seedObjects[i] : undefined;
            // Pass the shared registry
            return await createNpcFactory(config.cluster, config.intensity, undefined, seed, batchForbiddenNames);
        });

        const newPool = await Promise.all(promises);
        setCandidates(newPool);

        // Pre-select logic
        const initialSelection = new Set<number>();
        seedObjects.forEach((_, i) => { if (i < newPool.length) initialSelection.add(i); });
        
        let i = 0;
        while (initialSelection.size < REQUESTED_COUNT && i < newPool.length) {
            initialSelection.add(i);
            i++;
        }
        setSelectedIndices(initialSelection);

    } catch (e) {
        console.error("Failed to generate NPC batch", e);
    } finally {
        setIsGenerating(false);
    }
  };

  const toggleSelection = (index: number) => {
    if (editingIndex !== null) return; // Prevent selection while editing
    const newSet = new Set(selectedIndices);
    if (newSet.has(index)) {
        newSet.delete(index);
    } else {
        newSet.add(index);
    }
    setSelectedIndices(newSet);
  };

  const handleEditClick = (e: React.MouseEvent, index: number, npc: NpcState) => {
      e.stopPropagation();
      setEditingIndex(index);
      setEditForm(JSON.parse(JSON.stringify(npc))); // Deep copy
  };

  const handleSaveEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (editingIndex !== null) {
          setCandidates(prev => {
              const next = [...prev];
              // Merge top-level form data
              next[editingIndex] = { ...next[editingIndex], ...editForm } as NpcState;
              return next;
          });
          setEditingIndex(null);
      }
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      setEditingIndex(null);
      setEditForm({});
  };

  // Helper to update nested state safely
  const updateForm = (path: string, value: string) => {
      setEditForm(prev => {
          const next = { ...prev };
          if (path === 'name') next.name = value;
          if (path === 'archetype') next.archetype = value;
          if (path === 'origin.region') next.origin = { ...next.origin, region: value } as any;
          if (path === 'hidden_agenda.goal') next.hidden_agenda = { ...next.hidden_agenda, goal: value } as any;
          // Trauma editing removed per user request for emergent storytelling
          return next;
      });
  };

  const handleConfirm = () => {
    const selectedNpcs = candidates.filter((_, i) => selectedIndices.has(i));
    onConfirm({
        ...config,
        pre_generated_npcs: selectedNpcs,
        victim_count: selectedNpcs.length 
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#030303] animate-fadeIn relative overflow-hidden font-sans">
        {/* Header */}
        <div className="flex-shrink-0 p-8 md:p-10 border-b border-gray-900 bg-black/50 backdrop-blur-md z-10">
            <div className="flex justify-between items-start">
                <div className="space-y-2">
                    <h2 className="text-3xl md:text-4xl font-mono font-bold text-gray-200 uppercase tracking-tight flex items-center gap-4">
                        <Users className="w-8 h-8 text-system-green" /> Character Customization
                    </h2>
                    <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.2em]">
                        Select and fine-tune the participants. <span className="text-system-green">Training Data Applied.</span>
                    </p>
                </div>
                <button 
                    onClick={generateBatch} 
                    disabled={isGenerating || editingIndex !== null}
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
                        const isEditing = editingIndex === idx;

                        if (isEditing) {
                            return (
                                <div key={idx} className="relative p-6 border-2 border-system-green bg-black flex flex-col gap-4 shadow-[0_0_30px_rgba(16,185,129,0.1)] h-full min-h-[320px] animate-fadeIn">
                                    <div className="flex justify-between items-center border-b border-system-green/20 pb-2 mb-2">
                                        <div className="text-xs font-mono font-bold text-system-green uppercase tracking-widest">Editing Subject</div>
                                        <div className="flex gap-2">
                                            <button onClick={handleSaveEdit} className="p-1 hover:text-white text-system-green"><Save className="w-4 h-4" /></button>
                                            <button onClick={handleCancelEdit} className="p-1 hover:text-white text-gray-500"><X className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2">
                                        <div className="space-y-1">
                                            <label className="text-[9px] uppercase text-gray-500 font-mono">Name</label>
                                            <input className="w-full bg-gray-900 border border-gray-700 p-2 text-xs text-white outline-none focus:border-system-green" value={editForm.name} onChange={e => updateForm('name', e.target.value)} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] uppercase text-gray-500 font-mono">Archetype</label>
                                            <input className="w-full bg-gray-900 border border-gray-700 p-2 text-xs text-white outline-none focus:border-system-green" value={editForm.archetype} onChange={e => updateForm('archetype', e.target.value)} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] uppercase text-gray-500 font-mono">Origin</label>
                                            <input className="w-full bg-gray-900 border border-gray-700 p-2 text-xs text-white outline-none focus:border-system-green" value={editForm.origin?.region} onChange={e => updateForm('origin.region', e.target.value)} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] uppercase text-gray-500 font-mono">Core Drive</label>
                                            <input className="w-full bg-gray-900 border border-gray-700 p-2 text-xs text-white outline-none focus:border-system-green" value={editForm.hidden_agenda?.goal} onChange={e => updateForm('hidden_agenda.goal', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div
                                key={idx}
                                className={`relative flex flex-col h-full min-h-[320px] transition-all duration-300 group 
                                    ${isSelected 
                                        ? 'bg-black border-2 border-system-green/50 shadow-[0_0_20px_rgba(16,185,129,0.05)]' 
                                        : 'bg-black border border-gray-800 opacity-60 hover:opacity-100 hover:border-gray-600'
                                    }`}
                            >
                                {/* Card Body - Clickable for Selection */}
                                <div 
                                    className="flex-1 p-6 cursor-pointer"
                                    onClick={() => toggleSelection(idx)}
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-sm ${isSelected ? 'bg-system-green/20 text-system-green' : 'bg-gray-900 text-gray-500'}`}>
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-200 uppercase tracking-wide text-sm">{npc.name}</div>
                                                <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{npc.archetype.split('(')[0]}</div>
                                            </div>
                                        </div>
                                        <div className={`w-5 h-5 border flex items-center justify-center transition-colors ${isSelected ? 'bg-system-green border-system-green text-black' : 'border-gray-700 text-transparent'}`}>
                                            <Check className="w-3 h-3" />
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-gray-800/50">
                                        <div className="group/item">
                                            <div className="flex items-center gap-2 text-[9px] text-gray-600 uppercase tracking-widest mb-1">
                                                <MapPin className="w-3 h-3" /> Origin
                                            </div>
                                            <div className="text-xs text-gray-400 font-mono pl-5">{npc.origin.region}</div>
                                        </div>
                                        <div className="group/item">
                                            <div className="flex items-center gap-2 text-[9px] text-gray-600 uppercase tracking-widest mb-1">
                                                <Target className="w-3 h-3" /> Drive
                                            </div>
                                            <div className="text-xs text-gray-300 italic pl-5 line-clamp-2">"{npc.hidden_agenda.goal}"</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Edit Button Overlay (Visible on Hover) */}
                                {isSelected && (
                                    <button 
                                        onClick={(e) => handleEditClick(e, idx, npc)}
                                        className="absolute top-2 right-12 p-2 text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                        title="Edit Character"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                )}
                                
                                {/* Footer Stats */}
                                <div className="px-6 py-3 border-t border-gray-800/50 bg-gray-900/20 mt-auto flex justify-between items-center text-[9px] font-mono uppercase text-gray-600">
                                    <span>SAN: {Math.round(npc.psychology.sanity_percentage)}%</span>
                                    <span>INV: {npc.resources_held.length}</span>
                                </div>
                            </div>
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
