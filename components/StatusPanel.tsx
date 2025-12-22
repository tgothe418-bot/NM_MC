
import React, { useState, useEffect } from 'react';
import { GameState, NpcState } from '../types';
import { Skull, Radio, Users, Eye, Brain, CloudLightning, FileJson, ChevronDown, ChevronRight, GripVertical, Activity, Heart, ZapOff, Stethoscope, Star, Frown, User, Cpu } from 'lucide-react';
import { CHARACTER_ARCHIVE } from '../characterArchive';
import { VoiceControl } from './VoiceControl';

interface StatusPanelProps {
  gameState: GameState;
  onProcessAction: (action: string) => Promise<string>;
  onOpenSimulation: () => void;
  isSimulating: boolean;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({ gameState, onProcessAction, onOpenSimulation, isSimulating }) => {
  const { meta, villain_state, npc_states, co_author_state } = gameState;
  const threatLevel = villain_state?.threat_scale || 0;
  
  // Resizable State
  const [width, setWidth] = useState(450);
  const [isResizing, setIsResizing] = useState(false);
  
  // Accordion State
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    meta: true,
    villain: true,
    subjects: true
  });
  const [expandedNpcs, setExpandedNpcs] = useState<Record<string, boolean>>({});

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        setWidth(prev => {
            const newWidth = prev + e.movementX;
            return Math.max(350, Math.min(newWidth, 1000)); 
        });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleNpc = (name: string) => {
    setExpandedNpcs(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleExportNpcData = (e: React.MouseEvent) => {
    e.stopPropagation();
    const dataStr = JSON.stringify(npc_states, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `nightmare_subjects_turn_${meta.turn}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getThreatColor = (level: number) => {
    if (level <= 1) return 'bg-gray-700';
    if (level <= 2) return 'bg-yellow-900';
    if (level <= 3) return 'bg-orange-800';
    return 'bg-red-600 animate-pulse';
  };

  let activeClusterKey = "None";
  if (meta.active_cluster) {
      if (meta.active_cluster.includes("Flesh")) activeClusterKey = "Flesh";
      else if (meta.active_cluster.includes("System")) activeClusterKey = "System";
      else if (meta.active_cluster.includes("Haunting")) activeClusterKey = "Haunting";
      else if (meta.active_cluster.includes("Self")) activeClusterKey = "Self";
      else if (meta.active_cluster.includes("Blasphemy")) activeClusterKey = "Blasphemy";
      else if (meta.active_cluster.includes("Survival")) activeClusterKey = "Survival";
  }

  return (
    <div 
        className="h-full border-r border-gray-800 flex flex-col bg-terminal relative group select-none"
        style={{ width: `${width}px` }}
    >
      <div 
        className={`absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-system-green/50 z-50 transition-colors flex items-center justify-center ${isResizing ? 'bg-system-green' : 'bg-transparent'}`}
        onMouseDown={startResizing}
      >
        <GripVertical className="w-5 h-5 text-gray-600 opacity-0 group-hover:opacity-100" />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* NEW: SYSTEM HEADER WITH CONTROLS */}
        <div className="p-5 border-b border-gray-800 bg-black sticky top-0 z-50 shadow-2xl backdrop-blur-md">
            <div className="flex justify-between items-start mb-6">
                <div>
                   <span className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.3em] block mb-1">Session Data</span>
                   <span className="text-xl font-mono text-gray-200 uppercase tracking-widest font-bold">Turn: {meta.turn}</span>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end gap-2">
                        <VoiceControl onProcessAction={onProcessAction} />
                        <button 
                          onClick={onOpenSimulation} 
                          className={`p-2 rounded-sm border border-gray-700 bg-black/80 hover:border-system-green transition-all flex items-center gap-2 group
                            ${isSimulating ? 'text-system-green border-system-green animate-pulse' : 'text-gray-300 hover:text-white'}
                          `}
                          title="Open Simulation Protocol"
                        >
                           <Cpu className="w-4 h-4" />
                           <span className="hidden group-hover:block font-mono text-[10px] uppercase tracking-widest whitespace-nowrap">Protocol</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className={`flex items-center gap-3 px-5 py-2.5 rounded-sm border text-xs font-bold uppercase tracking-[0.2em] w-full justify-center ${meta.mode === 'Villain' ? 'border-red-900/50 text-red-500 bg-red-900/10' : 'border-system-green/30 text-system-green bg-green-900/10'}`}>
                    <Radio className="w-4 h-4 animate-pulse" />
                    {meta.mode} Protocol Active
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                     <div className="bg-black/40 p-4 rounded-sm border border-gray-800 hover:border-haunt-gold transition-colors">
                        <span className="block text-[10px] text-gray-600 uppercase tracking-[0.2em] mb-1.5">Thematic Focus</span>
                        <span className="text-haunt-gold font-mono font-bold text-base truncate block">{activeClusterKey}</span>
                     </div>
                     <div className="bg-black/40 p-4 rounded-sm border border-gray-800 hover:border-gray-500 transition-colors">
                        <span className="block text-[10px] text-gray-600 uppercase tracking-[0.2em] mb-1.5">Neural Fidelity</span>
                        <span className="text-gray-300 font-mono font-bold text-base">{meta.intensity_level}</span>
                     </div>
                </div>
            </div>
        </div>

        {co_author_state && co_author_state.archetype !== "Auto-Generated" && (
             <div className="border-b border-gray-800">
                 <button 
                   onClick={() => toggleSection('coauthor')}
                   className="w-full flex items-center justify-between p-5 bg-gray-900/30 hover:bg-gray-900/50 transition-colors"
                 >
                     <div className="flex items-center gap-3 text-system-green font-bold text-sm uppercase tracking-widest">
                         <CloudLightning className="w-4 h-4" /> Architect Link
                     </div>
                     {expandedSections['coauthor'] ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                 </button>
                 
                 {expandedSections['coauthor'] && (
                     <div className="p-6 bg-black/20 text-sm space-y-4 border-t border-gray-800/50">
                         <div className="flex justify-between items-center">
                             <span className="text-gray-500 uppercase text-xs tracking-widest">Persona</span>
                             <span className="text-system-cyan font-bold">{co_author_state.archetype}</span>
                         </div>
                         <div className="text-gray-400 italic text-base border-l-4 border-system-green/30 pl-4 py-2 leading-relaxed">
                             "{co_author_state.tone}"
                         </div>
                     </div>
                 )}
             </div>
        )}

        <div className="border-b border-gray-800">
             <button 
                onClick={() => toggleSection('villain')}
                className="w-full flex items-center justify-between p-5 bg-gray-900/30 hover:bg-gray-900/50 transition-colors"
             >
                 <div className="flex items-center gap-3 text-red-500 font-bold text-sm uppercase tracking-widest">
                     <Eye className="w-4 h-4" /> Antagonist State
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="flex gap-1 h-2.5 w-24">
                        {[1, 2, 3, 4, 5].map((lvl) => (
                            <div key={lvl} className={`flex-1 rounded-sm ${lvl <= threatLevel ? getThreatColor(threatLevel) : 'bg-gray-800'}`} />
                        ))}
                    </div>
                    {expandedSections['villain'] ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                 </div>
             </button>

             {expandedSections['villain'] && (
                 <div className="p-6 bg-red-950/10 space-y-5 relative overflow-hidden border-t border-red-900/20">
                     <div className="absolute -right-6 -top-6 opacity-5 pointer-events-none">
                         <Skull className="w-48 h-48" />
                     </div>
                     
                     <div className="relative z-10">
                         <div className="text-gray-500 text-xs uppercase tracking-widest mb-1">Entity Name</div>
                         <div className="text-2xl font-serif text-gray-100 tracking-wide">{villain_state?.name || "Unknown"}</div>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4 relative z-10">
                         <div className="bg-black/40 p-4 rounded-lg border border-red-900/30">
                             <div className="text-red-400 text-xs uppercase font-bold mb-2 tracking-widest">Archetype</div>
                             <div className="text-sm text-gray-200">{villain_state?.archetype}</div>
                         </div>
                         <div className="bg-black/40 p-4 rounded-lg border border-red-900/30">
                             <div className="text-red-400 text-xs uppercase font-bold mb-2 tracking-widest">Current Goal</div>
                             <div className="text-sm text-gray-200 line-clamp-2" title={villain_state?.primary_goal}>{villain_state?.primary_goal}</div>
                         </div>
                     </div>
                 </div>
             )}
        </div>

        <div className="flex-1 pb-20">
            <div className="flex items-center justify-between p-5 bg-gray-900/20 border-b border-gray-800 sticky top-0 z-10 backdrop-blur-xl">
                 <div className="flex items-center gap-3 text-gray-300 font-bold text-sm uppercase tracking-widest">
                     <Users className="w-5 h-5 text-gray-500" /> Active Subjects ({npc_states?.length || 0})
                 </div>
                 <button 
                    onClick={handleExportNpcData}
                    className="text-gray-600 hover:text-system-green transition-all p-2 rounded-lg hover:bg-gray-800"
                    title="Export Subject Data"
                 >
                    <FileJson className="w-6 h-6" />
                 </button>
            </div>

            <div className="p-4 space-y-4">
                {(!npc_states || npc_states.length === 0) && (
                    <div className="text-gray-600 text-center py-12 italic text-sm font-mono uppercase tracking-widest">No active specimens recorded.</div>
                )}

                {npc_states?.map((npc, idx) => {
                    const isExpanded = expandedNpcs[npc.name];
                    const isAnomaly = npc.fracture_state === 4;
                    const stress = npc.psychology?.stress_level || 0;
                    const healthStatus = npc.active_injuries?.length > 0 ? 'Injured' : 'Healthy';
                    const isPsychoticBreak = stress > 100;
                    
                    return (
                        <div 
                           key={idx} 
                           className={`rounded-xl border transition-all duration-500 overflow-hidden ${
                               isAnomaly ? 'bg-black/80 border-system-green/50 shadow-lg shadow-system-green/20' 
                               : isPsychoticBreak ? 'bg-red-950/20 border-red-900/70 animate-pulse scale-[1.02]'
                               : isExpanded ? 'bg-gray-900/40 border-gray-600 shadow-xl' : 'bg-black/40 border-gray-800 hover:border-gray-600'
                           }`}
                        >
                            <button 
                               onClick={() => toggleNpc(npc.name)}
                               className="w-full text-left p-4 flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`w-1.5 h-12 rounded-full ${isAnomaly ? 'bg-system-green shadow-[0_0_10px_rgba(16,185,129,0.5)]' : isPsychoticBreak ? 'bg-red-500' : 'bg-gray-700 group-hover:bg-gray-500 transition-colors'}`} />
                                    <div>
                                        <div className={`font-bold text-lg ${isAnomaly ? 'text-system-green font-mono' : isPsychoticBreak ? 'text-red-400 font-serif tracking-widest' : 'text-gray-100'}`}>
                                            {npc.name}
                                        </div>
                                        <div className="text-xs text-gray-500 uppercase tracking-widest font-mono mt-1">
                                            {npc.archetype}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-5">
                                    <div className="flex gap-2">
                                        <div 
                                          className={`w-3 h-3 rounded-full ${stress > 70 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse' : stress > 40 ? 'bg-orange-500' : 'bg-green-900'}`} 
                                          title={`Stress: ${stress}/100`}
                                        />
                                        <div 
                                          className={`w-3 h-3 rounded-full ${healthStatus === 'Injured' ? 'bg-red-700 shadow-[0_0_8px_rgba(185,28,28,0.5)]' : 'bg-green-900'}`}
                                          title={healthStatus} 
                                        />
                                    </div>
                                    {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
                                </div>
                            </button>

                            {isExpanded && !isAnomaly && (
                                <div className="px-6 pb-6 text-sm animate-fadeIn space-y-5 border-t border-gray-800/50 pt-4">
                                    
                                    {npc.psychology && (
                                        <div className="bg-gray-950/60 p-4 rounded-xl border border-gray-800 grid grid-cols-2 gap-4">
                                            <div className="col-span-2 flex items-center gap-2 text-xs text-indigo-400 uppercase tracking-[0.2em] font-bold border-b border-indigo-900/30 pb-2 mb-2">
                                                <Brain className="w-4 h-4" /> Psychological Profile
                                            </div>
                                            
                                            <div>
                                                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Resilience</div>
                                                <div className="text-gray-200 font-bold">{npc.psychology.resilience_level}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Dominant Instinct</div>
                                                <div className="text-gray-200 font-bold">{npc.psychology.dominant_instinct}</div>
                                            </div>
                                            
                                            <div className="col-span-2 mt-2">
                                                <div className="flex justify-between text-[10px] text-gray-400 uppercase tracking-widest mb-1.5">
                                                    <span>System Stress Load</span>
                                                    <span className={`font-bold ${stress > 100 ? 'text-red-500 animate-pulse' : 'text-indigo-400'}`}>
                                                        {stress}%
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-gray-800 rounded-full overflow-hidden shadow-inner">
                                                    <div 
                                                        className={`h-full transition-all duration-700 ${stress > 100 ? 'bg-red-600 animate-glitch' : stress > 70 ? 'bg-red-500' : 'bg-indigo-600'}`} 
                                                        style={{ width: `${Math.min(100, stress)}%` }} 
                                                    />
                                                </div>
                                            </div>

                                            <div className="col-span-2 text-base text-gray-400 italic mt-2 font-serif border-l-4 border-indigo-900/50 pl-4 py-1 leading-relaxed">
                                                "{npc.psychology.current_thought}"
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-800">
                                            <div className="flex items-center gap-2 text-xs text-haunt-gold uppercase tracking-[0.2em] font-bold mb-3">
                                                <Star className="w-4 h-4" /> Intrinsic Traits
                                            </div>
                                            <div className="space-y-3">
                                                <div className="text-haunt-gold font-bold">{npc.personality?.dominant_trait}</div>
                                                <div className="text-gray-400 flex items-center gap-2 text-sm italic">
                                                    <Frown className="w-4 h-4 text-red-900" /> {npc.personality?.fatal_flaw}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-800">
                                            <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-[0.2em] font-bold mb-3">
                                                <User className="w-4 h-4" /> Physical Matrix
                                            </div>
                                            <div className="text-sm text-gray-200 font-bold mb-1">
                                                {npc.physical?.build}, {npc.physical?.height}
                                            </div>
                                            <div className="text-xs text-gray-500 italic leading-relaxed">
                                                "{npc.physical?.distinguishing_feature}"
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-6">
                                        <div className="flex-1">
                                            <div className="flex justify-between text-xs text-purple-400 uppercase tracking-widest font-bold mb-1.5">
                                                <span className="flex items-center gap-2"><ZapOff className="w-4 h-4" /> Volition</span>
                                                <span>{npc.willpower}</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-800 rounded-full shadow-inner">
                                                <div className="h-full bg-purple-600 transition-all duration-1000" style={{ width: `${npc.willpower}%` }} />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between text-xs text-red-500 uppercase tracking-widest font-bold mb-1.5">
                                                <span className="flex items-center gap-2"><Heart className="w-4 h-4" /> Pulse</span>
                                                <span>{npc.devotion}</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-800 rounded-full shadow-inner">
                                                <div className="h-full bg-red-700 transition-all duration-1000" style={{ width: `${npc.devotion}%` }} />
                                            </div>
                                        </div>
                                    </div>

                                    {npc.active_injuries?.length > 0 && (
                                        <div className="bg-red-950/20 p-5 rounded-xl border border-red-900/40 shadow-inner">
                                            <div className="flex items-center gap-2 text-xs text-red-400 uppercase tracking-[0.2em] font-bold mb-4">
                                                <Stethoscope className="w-5 h-5" /> Trauma Record
                                            </div>
                                            <ul className="space-y-4">
                                                {npc.active_injuries.map((inj, i) => (
                                                    <li key={i} className="text-sm border-l-2 border-red-900/50 pl-4 py-1">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-gray-100 font-bold tracking-wide">{inj.location}</span>
                                                            <span className="text-[10px] uppercase font-mono border px-2 py-0.5 rounded-full text-red-200 border-red-900 bg-red-900/40 tracking-tighter">{inj.type}</span>
                                                        </div>
                                                        <div className="text-gray-400 italic text-xs leading-relaxed">
                                                            {inj.description}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            {isExpanded && isAnomaly && (
                                <div className="px-8 pb-8 text-base text-system-green font-mono space-y-4 pt-4 border-t border-system-green/20">
                                    <div className="opacity-70 text-xs tracking-[0.3em] uppercase mb-4">Anomalous Signature Detected</div>
                                    <div className="text-sm border-l-4 border-system-green/30 pl-6 py-2 bg-system-green/5">
                                        {npc.narrative_role}
                                    </div>
                                    <div className="p-6 border border-system-green/40 bg-green-950/20 rounded-xl font-bold tracking-tight text-lg shadow-inner italic">
                                        "{(CHARACTER_ARCHIVE.find(c => c.name === npc.name)?.dialogue_sample.warning) || "SYSTEM_ERROR: TEXT_NOT_FOUND"}"
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
};
