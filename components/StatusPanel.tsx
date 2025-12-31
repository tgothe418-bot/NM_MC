
import React, { useState, useEffect } from 'react';
import { GameState, NpcState } from '../types';
import { Skull, Radio, Users, Eye, Brain, ChevronDown, ChevronRight, GripVertical, Activity, ZapOff, Stethoscope, Cpu, FileText, Square, Target, BookOpen, AlertCircle } from 'lucide-react';
import { CharacterPortrait } from './CharacterPortrait';

interface StatusPanelProps {
  gameState: GameState;
  onProcessAction: (action: string) => Promise<string>;
  onOpenSimulation: () => void;
  isTesting: boolean;
  onAbortTest: () => void;
  onUpdateNpc?: (index: number, updates: Partial<NpcState>) => void;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({ 
    gameState, 
    onProcessAction, 
    onOpenSimulation, 
    isTesting, 
    onAbortTest,
    onUpdateNpc
}) => {
  const { meta, villain_state, npc_states } = gameState;
  const threatLevel = villain_state?.threat_scale || 0;
  
  const [width, setWidth] = useState(450);
  const [isResizing, setIsResizing] = useState(false);
  
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
        className="h-full border-r border-gray-800 flex flex-col bg-[#080808] relative group select-none"
        style={{ width: `${width}px` }}
    >
      <div 
        className={`absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-red-600/50 z-50 transition-colors flex items-center justify-center ${isResizing ? 'bg-red-600' : 'bg-transparent'}`}
        onMouseDown={startResizing}
      >
        <GripVertical className="w-5 h-5 text-gray-600 opacity-0 group-hover:opacity-100" />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* SYSTEM HEADER */}
        <div className="p-5 border-b border-gray-800 bg-black sticky top-0 z-50 shadow-2xl backdrop-blur-md">
            <div className="flex justify-between items-start mb-6">
                <div>
                   <span className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.3em] block mb-1">Session Data</span>
                   <span className="text-xl font-mono text-gray-200 uppercase tracking-widest font-bold">Turn: {meta.turn}</span>
                </div>
                
                <div className="flex items-center gap-2">
                    {isTesting ? (
                        <button 
                            onClick={onAbortTest} 
                            className="p-2 rounded-sm border border-red-600 bg-red-900/20 text-red-500 hover:bg-red-600 hover:text-black transition-all animate-pulse"
                            title="Abort Test Protocol"
                        >
                            <Square className="w-4 h-4 fill-current" />
                        </button>
                    ) : (
                        <button 
                            onClick={onOpenSimulation} 
                            className="p-2 rounded-sm border border-gray-800 bg-black text-gray-500 hover:text-white hover:border-system-green transition-all"
                            title="Open Test Protocols"
                        >
                            <Cpu className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className={`flex items-center gap-3 px-5 py-1.5 rounded-sm border text-[10px] font-bold uppercase tracking-[0.2em] w-full justify-center ${isTesting ? 'border-amber-500/50 text-amber-500 bg-amber-950/20' : meta.mode === 'Villain' ? 'border-red-900/50 text-red-500 bg-red-950/20' : 'border-system-green/30 text-system-green bg-green-950/20'}`}>
                    <Radio className="w-3 h-3 animate-pulse" />
                    {isTesting ? 'TEST PROTOCOL ACTIVE' : `${meta.mode} Protocol Active`}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                     <div className="bg-[#0c0c0c] p-3 rounded-sm border border-gray-800">
                        <span className="block text-[8px] text-gray-600 uppercase tracking-[0.2em] mb-1">Thematic Focus</span>
                        <span className="text-haunt-gold font-mono font-bold text-xs truncate block">{activeClusterKey}</span>
                     </div>
                     <div className="bg-[#0c0c0c] p-3 rounded-sm border border-gray-800">
                        <span className="block text-[8px] text-gray-600 uppercase tracking-[0.2em] mb-1">Neural Fidelity</span>
                        <span className="text-gray-300 font-mono font-bold text-xs">{meta.intensity_level}</span>
                     </div>
                </div>
            </div>
        </div>

        {/* ANTAGONIST STATE */}
        <div className="border-b border-gray-800">
             <button 
                onClick={() => toggleSection('villain')}
                className="w-full flex items-center justify-between p-4 bg-[#0a0a0a] hover:bg-gray-900/30 transition-colors"
             >
                 <div className="flex items-center gap-3 text-red-600 font-bold text-[10px] uppercase tracking-[0.2em]">
                     <Eye className="w-4 h-4" /> Antagonist State
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="flex gap-1 h-1.5 w-20">
                        {[1, 2, 3, 4, 5].map((lvl) => (
                            <div key={lvl} className={`flex-1 rounded-full ${lvl <= threatLevel ? getThreatColor(threatLevel) : 'bg-gray-800'}`} />
                        ))}
                    </div>
                    {expandedSections['villain'] ? <ChevronDown className="w-3 h-3 text-gray-500" /> : <ChevronRight className="w-3 h-3 text-gray-500" />}
                 </div>
             </button>

             {expandedSections['villain'] && (
                 <div className="p-6 bg-[#0c0c0c] space-y-6 relative overflow-hidden border-t border-gray-800">
                     <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none pr-4">
                         <Skull className="w-32 h-32 text-white" />
                     </div>
                     
                     <div className="relative z-10">
                         <div className="text-gray-600 text-[9px] uppercase tracking-[0.3em] mb-1 font-mono">Entity Name</div>
                         <div className="text-2xl font-serif text-gray-100 tracking-wide">{villain_state?.name || "Unknown"}</div>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-3 relative z-10">
                         <div className="bg-black/40 p-3 rounded-sm border border-gray-800/60">
                             <div className="text-red-900 text-[8px] uppercase font-bold mb-1.5 tracking-[0.2em]">Archetype</div>
                             <div className="text-[11px] text-gray-400 uppercase font-mono">{villain_state?.archetype || "Unknown"}</div>
                         </div>
                         <div className="bg-black/40 p-3 rounded-sm border border-gray-800/60">
                             <div className="text-red-900 text-[8px] uppercase font-bold mb-1.5 tracking-[0.2em]">Current Goal</div>
                             <div className="text-[11px] text-gray-400 uppercase font-mono line-clamp-1">{villain_state?.primary_goal || "Establish Dominance"}</div>
                         </div>
                     </div>
                 </div>
             )}
        </div>

        {/* ACTIVE SUBJECTS */}
        <div className="flex-1 pb-20">
            <div className="flex items-center justify-between p-4 bg-[#0a0a0a] border-b border-gray-800 sticky top-0 z-10">
                 <div className="flex items-center gap-3 text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                     <Users className="w-4 h-4" /> Active Subjects ({npc_states?.length || 0})
                 </div>
                 <button 
                    onClick={handleExportNpcData}
                    className="text-gray-600 hover:text-white transition-all"
                 >
                    <FileText className="w-4 h-4" />
                 </button>
            </div>

            <div className="p-4 space-y-3">
                {(!npc_states || npc_states.length === 0) && (
                    <div className="text-gray-700 text-center py-16 italic text-xs font-mono uppercase tracking-[0.4em]">No active specimens recorded.</div>
                )}

                {npc_states?.map((npc, idx) => {
                    if (!npc) return null;
                    const isExpanded = expandedNpcs[npc.name];
                    const isAnomaly = npc.fracture_state === 4;
                    const stress = npc.psychology?.stress_level || 0;
                    const isInjured = npc.active_injuries?.length > 0;
                    const isPsychoticBreak = stress > 100;
                    const memories = npc.dialogue_state?.memory?.episodic_logs || [];
                    const facts = npc.dialogue_state?.memory?.known_facts || [];
                    
                    return (
                        <div 
                           key={idx} 
                           className={`rounded-sm border transition-all duration-300 overflow-hidden ${
                               isAnomaly ? 'bg-black border-system-green/50' 
                               : isPsychoticBreak ? 'bg-red-950/20 border-red-900/40'
                               : 'bg-[#0c0c0c] border-gray-800 hover:border-gray-700'
                           }`}
                        >
                            {/* Summary Row */}
                            <div className="w-full flex items-center justify-between p-3 bg-black/20 hover:bg-black/40 transition-colors">
                                <div className="flex items-center gap-4 flex-1">
                                    <CharacterPortrait 
                                        npc={npc} 
                                        onUpdateNpc={(updates) => onUpdateNpc && onUpdateNpc(idx, updates)} 
                                    />
                                    
                                    <button onClick={() => toggleNpc(npc.name)} className="flex-1 text-left">
                                        <div className={`font-bold text-sm tracking-widest uppercase ${isAnomaly ? 'text-system-green' : 'text-gray-200'}`}>
                                            {npc.name}
                                        </div>
                                        <div className="text-[9px] text-gray-600 uppercase tracking-[0.2em] font-mono mt-0.5">
                                            {npc.archetype}
                                        </div>
                                    </button>
                                </div>
                                
                                <button onClick={() => toggleNpc(npc.name)} className="flex items-center gap-4 px-2">
                                    <div className="flex gap-1.5 mr-2">
                                        <div 
                                          className={`w-2 h-2 rounded-full ${stress > 70 ? 'bg-red-600' : stress > 40 ? 'bg-orange-500' : 'bg-green-600'} shadow-[0_0_5px_rgba(0,0,0,0.5)]`} 
                                          title={`Stress: ${stress}/100`}
                                        />
                                        <div 
                                          className={`w-2 h-2 rounded-full ${isInjured ? 'bg-red-800' : 'bg-green-600'} shadow-[0_0_5px_rgba(0,0,0,0.5)]`}
                                          title={isInjured ? "Injured" : "Stable"} 
                                        />
                                    </div>
                                    {isExpanded ? <ChevronDown className="w-3 h-3 text-gray-500" /> : <ChevronRight className="w-3 h-3 text-gray-500" />}
                                </button>
                            </div>

                            {isExpanded && (
                                <div className="px-6 pb-6 text-[11px] animate-fadeIn space-y-5 border-t border-gray-800/50 pt-5 bg-black/40">
                                    
                                    {npc.psychology && (
                                        <div className="bg-black/60 p-4 rounded-sm border border-gray-800/50 grid grid-cols-2 gap-4">
                                            <div className="col-span-2 flex items-center gap-2 text-[9px] text-gray-500 uppercase tracking-[0.2em] font-bold border-b border-gray-800 pb-2 mb-1">
                                                <Brain className="w-3 h-3" /> Neural Metrics
                                            </div>
                                            
                                            <div>
                                                <div className="text-[8px] text-gray-600 uppercase tracking-widest mb-1">Resilience</div>
                                                <div className="text-gray-300 font-bold">{npc.psychology.resilience_level}</div>
                                            </div>
                                            <div>
                                                <div className="text-[8px] text-gray-600 uppercase tracking-widest mb-1">Dominant Instinct</div>
                                                <div className="text-gray-300 font-bold">{npc.psychology.dominant_instinct}</div>
                                            </div>
                                            
                                            <div className="col-span-2">
                                                <div className="flex justify-between text-[8px] text-gray-500 uppercase tracking-widest mb-1.5 font-mono">
                                                    <span>Stress Load</span>
                                                    <span>{stress}%</span>
                                                </div>
                                                <div className="h-1 bg-gray-900 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full transition-all duration-700 ${stress > 70 ? 'bg-red-600' : 'bg-indigo-600'}`} 
                                                        style={{ width: `${Math.min(100, stress)}%` }} 
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <div className="text-haunt-gold font-bold uppercase tracking-widest text-[9px] border-b border-haunt-gold/20 pb-1">Personality</div>
                                            <div className="text-gray-400 italic">"{npc.personality?.dominant_trait}"</div>
                                            <div className="text-red-900 font-bold uppercase tracking-widest text-[8px] flex items-center gap-2">
                                                <ZapOff className="w-2.5 h-2.5" /> {npc.personality?.fatal_flaw}
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <div className="text-gray-500 font-bold uppercase tracking-widest text-[9px] border-b border-gray-800 pb-1">Physical</div>
                                            <div className="text-gray-300">{npc.physical?.build}, {npc.physical?.height}</div>
                                            <div className="text-gray-600 italic">"{npc.physical?.distinguishing_feature}"</div>
                                        </div>
                                    </div>

                                    {/* MEMORY & FACTS */}
                                    {(memories.length > 0 || facts.length > 0) && (
                                        <div className="bg-indigo-950/10 p-4 rounded-sm border border-indigo-900/30">
                                            <div className="flex items-center gap-2 text-[9px] text-indigo-400 uppercase tracking-[0.2em] font-bold mb-3">
                                                <BookOpen className="w-3.5 h-3.5" /> Memory Matrix
                                            </div>
                                            
                                            {facts.length > 0 && (
                                                <div className="mb-4">
                                                     <div className="text-[8px] text-gray-600 uppercase tracking-widest mb-2 font-mono">Learned Truths</div>
                                                     <ul className="space-y-1">
                                                        {facts.slice(-3).map((f, i) => (
                                                            <li key={i} className="text-[9px] text-gray-400 border-l-2 border-indigo-500/30 pl-2">
                                                                {f}
                                                            </li>
                                                        ))}
                                                     </ul>
                                                </div>
                                            )}

                                            {memories.length > 0 && (
                                                <div>
                                                     <div className="text-[8px] text-gray-600 uppercase tracking-widest mb-2 font-mono">Traumatic Episodes</div>
                                                     <div className="space-y-2">
                                                        {memories.slice(-2).map((m, i) => (
                                                            <div key={i} className="bg-black/40 p-2 rounded border border-gray-800 flex flex-col gap-1">
                                                                <div className="flex justify-between items-center text-[8px] text-gray-500 font-mono uppercase">
                                                                    <span>Turn {m.turn}</span>
                                                                    <span className={m.emotional_impact < 0 ? 'text-red-500' : 'text-green-500'}>
                                                                        Impact: {m.emotional_impact}
                                                                    </span>
                                                                </div>
                                                                <div className="text-[10px] text-gray-300 italic">
                                                                    "{m.description}"
                                                                </div>
                                                            </div>
                                                        ))}
                                                     </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {npc.active_injuries?.length > 0 && (
                                        <div className="bg-red-950/10 p-4 rounded-sm border border-red-900/20">
                                            <div className="flex items-center gap-2 text-[9px] text-red-500 uppercase tracking-[0.2em] font-bold mb-3">
                                                <Stethoscope className="w-3.5 h-3.5" /> Trauma Record
                                            </div>
                                            <ul className="space-y-3">
                                                {npc.active_injuries.map((inj, i) => (
                                                    <li key={i} className="text-[10px] border-l border-red-900/40 pl-3">
                                                        <div className="flex justify-between items-center mb-0.5">
                                                            <span className="text-gray-300 font-bold">{inj.location}</span>
                                                            <span className="text-[8px] uppercase font-mono text-red-400">{inj.type}</span>
                                                        </div>
                                                        <div className="text-gray-500 italic text-[9px]">
                                                            {inj.description}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
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
