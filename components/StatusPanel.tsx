
import React, { useState } from 'react';
import { GameState, NpcState } from '../types';
import { Skull, Radio, Users, Eye, Brain, ChevronUp, ChevronDown, Activity, ZapOff, Stethoscope, Cpu, FileText, Square, Target, BookOpen, Power, GripHorizontal } from 'lucide-react';
import { CharacterPortrait } from './CharacterPortrait';

interface StatusPanelProps {
  gameState: GameState;
  onOpenSimulation: () => void;
  isTesting: boolean;
  onAbortTest: () => void;
  onUpdateNpc?: (index: number, updates: Partial<NpcState>) => void;
  onReset?: () => void;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({ 
    gameState, 
    onOpenSimulation, 
    isTesting, 
    onAbortTest,
    onUpdateNpc,
    onReset
}) => {
  const { meta, villain_state, npc_states } = gameState;
  const threatLevel = villain_state?.threat_scale || 0;
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedNpcs, setExpandedNpcs] = useState<Record<string, boolean>>({});

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
        className={`fixed bottom-0 left-0 right-0 z-40 bg-[#080808]/95 backdrop-blur-xl border-t border-gray-800 transition-all duration-500 ease-in-out flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.8)] ${isExpanded ? 'h-[85vh]' : 'h-12 hover:bg-[#0a0a0a]'}`}
    >
      {/* COLLAPSED HEADER / TAB */}
      <div 
        className="h-12 w-full flex items-center justify-between px-6 cursor-pointer border-b border-gray-800/0 hover:border-gray-800 transition-colors group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
         <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${isTesting ? 'bg-amber-500 animate-pulse' : meta.mode === 'Villain' ? 'bg-red-500' : 'bg-system-green'}`}></div>
                 <span className="font-mono text-xs font-bold text-gray-300 uppercase tracking-widest">
                    {isTesting ? 'TEST PROTOCOL' : `${meta.mode} MODE`}
                 </span>
             </div>
             
             <div className="h-4 w-[1px] bg-gray-800"></div>

             <div className="font-mono text-xs text-gray-500 uppercase tracking-widest">
                 TURN: <span className="text-gray-200 font-bold">{meta.turn}</span>
             </div>

             <div className="hidden md:flex items-center gap-2">
                 <div className="h-4 w-[1px] bg-gray-800 mx-2"></div>
                 <span className="font-mono text-[10px] text-gray-600 uppercase tracking-widest">Threat</span>
                 <div className="flex gap-1 h-1.5 w-16">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                        <div key={lvl} className={`flex-1 rounded-full ${lvl <= threatLevel ? getThreatColor(threatLevel) : 'bg-gray-800'}`} />
                    ))}
                 </div>
             </div>
         </div>

         <div className="absolute left-1/2 top-0 transform -translate-x-1/2 h-full flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity">
             <GripHorizontal className="w-6 h-6 text-gray-600" />
         </div>

         <div className="flex items-center gap-4">
             {villain_state?.name && (
                 <span className="hidden md:block font-serif italic text-gray-500 text-xs tracking-wider">
                     {villain_state.name}
                 </span>
             )}
             <button className="text-gray-500 hover:text-white transition-colors">
                 {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
             </button>
         </div>
      </div>

      {/* EXPANDED CONTENT */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* COL 1: SYSTEM & VILLAINS */}
            <div className="space-y-8">
                {/* Controls */}
                <div className="bg-[#0c0c0c] p-6 border border-gray-800 rounded-sm space-y-6">
                    <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                        <span className="text-xs font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Radio className="w-4 h-4" /> System Control
                        </span>
                        <div className="flex gap-2">
                            {onReset && (
                                <button onClick={onReset} className="p-2 border border-gray-700 hover:border-red-500 text-gray-500 hover:text-red-500 rounded-sm transition-colors" title="Reset Session">
                                    <Power className="w-4 h-4" />
                                </button>
                            )}
                            {isTesting ? (
                                <button onClick={onAbortTest} className="p-2 border border-red-900 bg-red-900/20 text-red-500 hover:bg-red-900 hover:text-white rounded-sm transition-colors animate-pulse">
                                    <Square className="w-4 h-4 fill-current" />
                                </button>
                            ) : (
                                <button onClick={onOpenSimulation} className="p-2 border border-gray-700 hover:border-system-green text-gray-500 hover:text-system-green rounded-sm transition-colors">
                                    <Cpu className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">Theme</div>
                            <div className="text-haunt-gold font-mono font-bold text-xs">{activeClusterKey}</div>
                        </div>
                        <div>
                            <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">Intensity</div>
                            <div className="text-gray-300 font-mono font-bold text-xs">{meta.intensity_level}</div>
                        </div>
                    </div>
                </div>

                {/* Villain State */}
                <div className="bg-[#0c0c0c] p-6 border border-gray-800 rounded-sm relative overflow-hidden group">
                     <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                         <Skull className="w-24 h-24 text-red-500" />
                     </div>
                     <div className="relative z-10 space-y-6">
                         <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-[0.2em] border-b border-red-900/20 pb-4">
                             <Eye className="w-4 h-4" /> Antagonist State
                         </div>
                         <div>
                             <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">Entity Name</div>
                             <div className="text-xl font-serif text-gray-100 tracking-wide">{villain_state?.name || "Unknown"}</div>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                             <div className="bg-black/40 p-3 border border-gray-800/50 rounded-sm">
                                 <div className="text-[8px] text-red-800 uppercase font-bold mb-1">Archetype</div>
                                 <div className="text-[10px] text-gray-400 font-mono">{villain_state?.archetype}</div>
                             </div>
                             <div className="bg-black/40 p-3 border border-gray-800/50 rounded-sm">
                                 <div className="text-[8px] text-red-800 uppercase font-bold mb-1">Goal</div>
                                 <div className="text-[10px] text-gray-400 font-mono line-clamp-2">{villain_state?.primary_goal}</div>
                             </div>
                         </div>
                     </div>
                </div>
            </div>

            {/* COL 2 & 3: SUBJECTS (Spans 2 cols) */}
            <div className="lg:col-span-2 bg-[#0c0c0c] border border-gray-800 rounded-sm flex flex-col">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-black/20">
                     <div className="flex items-center gap-3 text-gray-400 font-bold text-xs uppercase tracking-[0.2em]">
                         <Users className="w-4 h-4" /> Active Subjects ({npc_states?.length || 0})
                     </div>
                     <button onClick={handleExportNpcData} className="text-gray-600 hover:text-white transition-colors" title="Export Data">
                        <FileText className="w-4 h-4" />
                     </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar max-h-[600px]">
                    {(!npc_states || npc_states.length === 0) && (
                        <div className="text-center py-20 text-gray-700 font-mono text-xs uppercase tracking-widest">No life signs detected.</div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {npc_states?.map((npc, idx) => {
                            if (!npc) return null;
                            const isExpanded = expandedNpcs[npc.name];
                            const isAnomaly = npc.fracture_state === 4;
                            const stress = npc.psychology?.stress_level || 0;
                            const isInjured = npc.active_injuries?.length > 0;
                            const memories = npc.dialogue_state?.memory?.episodic_logs || [];
                            
                            return (
                                <div key={idx} className={`rounded-sm border transition-all ${isAnomaly ? 'bg-black border-system-green/30' : 'bg-black/40 border-gray-800 hover:border-gray-700'}`}>
                                    <div className="p-3 flex items-start gap-4">
                                        <CharacterPortrait npc={npc} onUpdateNpc={(updates) => onUpdateNpc && onUpdateNpc(idx, updates)} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <button onClick={() => toggleNpc(npc.name)} className="text-left group">
                                                    <div className={`font-bold text-xs uppercase tracking-wider truncate ${isAnomaly ? 'text-system-green' : 'text-gray-300 group-hover:text-white'}`}>{npc.name}</div>
                                                    <div className="text-[9px] text-gray-600 font-mono mt-0.5">{npc.archetype}</div>
                                                </button>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${stress > 70 ? 'bg-red-600' : 'bg-green-600'}`} />
                                                    <button onClick={() => toggleNpc(npc.name)}>
                                                        {isExpanded ? <ChevronUp className="w-3 h-3 text-gray-500" /> : <ChevronDown className="w-3 h-3 text-gray-500" />}
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            {/* Quick Stats Bar */}
                                            <div className="mt-2 h-1 w-full bg-gray-900 rounded-full overflow-hidden flex">
                                                <div className="h-full bg-indigo-600" style={{ width: `${Math.min(100, stress)}%` }} />
                                            </div>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="px-3 pb-3 pt-2 border-t border-gray-800/50 text-[10px] space-y-3 bg-black/20">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="bg-black/40 p-2 rounded border border-gray-800/30">
                                                    <div className="text-[8px] text-gray-600 uppercase tracking-wider mb-1">State</div>
                                                    <div className="text-gray-300">{npc.psychology?.emotional_state}</div>
                                                </div>
                                                <div className="bg-black/40 p-2 rounded border border-gray-800/30">
                                                    <div className="text-[8px] text-gray-600 uppercase tracking-wider mb-1">Instinct</div>
                                                    <div className="text-gray-300">{npc.psychology?.dominant_instinct}</div>
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <div className="text-[8px] text-haunt-gold uppercase tracking-wider mb-1 font-bold">Personality</div>
                                                <div className="text-gray-400 italic leading-relaxed">"{npc.personality?.dominant_trait}". <span className="text-red-900">{npc.personality?.fatal_flaw}.</span></div>
                                            </div>

                                            {isInjured && (
                                                <div>
                                                    <div className="text-[8px] text-red-500 uppercase tracking-wider mb-1 font-bold flex items-center gap-2"><Stethoscope className="w-3 h-3" /> Trauma</div>
                                                    {npc.active_injuries.map((inj, i) => (
                                                        <div key={i} className="text-gray-500 pl-2 border-l border-red-900/30 mb-1">{inj.location} ({inj.type})</div>
                                                    ))}
                                                </div>
                                            )}

                                            {memories.length > 0 && (
                                                <div>
                                                    <div className="text-[8px] text-indigo-400 uppercase tracking-wider mb-1 font-bold flex items-center gap-2"><BookOpen className="w-3 h-3" /> Memory</div>
                                                    <div className="text-gray-500 italic truncate">"{memories[memories.length-1].description}"</div>
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
      )}
    </div>
  );
};
