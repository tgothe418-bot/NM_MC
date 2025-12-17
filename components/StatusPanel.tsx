

import React, { useState, useEffect, useRef } from 'react';
import { GameState, NpcState } from '../types';
import { Skull, Radio, Users, Eye, Brain, CloudLightning, FileJson, ChevronDown, ChevronRight, GripVertical, Activity, Heart, ZapOff, Stethoscope, Link, ShieldAlert, Star, Frown, User, MousePointer2 } from 'lucide-react';
import { LORE_LIBRARY } from '../loreLibrary';
import { CHARACTER_ARCHIVE } from '../characterArchive';

interface StatusPanelProps {
  gameState: GameState;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({ gameState }) => {
  const { meta, villain_state, npc_states, co_author_state } = gameState;
  const threatLevel = villain_state?.threat_scale || 0;
  
  // Resizable State
  const [width, setWidth] = useState(384); // Default 96 (24rem * 16px)
  const [isResizing, setIsResizing] = useState(false);
  
  // Accordion State
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    meta: true,
    villain: true,
    subjects: true
  });
  const [expandedNpcs, setExpandedNpcs] = useState<Record<string, boolean>>({});

  // --- Handlers ---

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        // Calculate new width based on mouse position
        // Assuming panel is on the left, width is just clientX (minus offset if centered)
        // Since it's in a flex container centered, this is tricky. 
        // Simplification: We look at movement delta or strictly clamp to reasonable sizes.
        // Let's rely on previous width + movementX for smoother UX if possible, 
        // but clientX is safer for absolute positioning.
        // Since layout is: [Panel][Main], simple delta works best.
        setWidth(prev => {
            const newWidth = prev + e.movementX;
            return Math.max(300, Math.min(newWidth, 800)); // Clamp between 300px and 800px
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

  // --- Helpers ---

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
      {/* Resizer Handle */}
      <div 
        className={`absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-system-green/50 z-50 transition-colors flex items-center justify-center ${isResizing ? 'bg-system-green' : 'bg-transparent'}`}
        onMouseDown={startResizing}
      >
        <GripVertical className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100" />
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">

        {/* 1. HEADER (Compact) */}
        <div className="p-3 border-b border-gray-800 bg-black sticky top-0 z-10">
            <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Turn: {meta.turn}</span>
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${meta.mode === 'Villain' ? 'border-red-900/50 text-red-500 bg-red-900/10' : 'border-system-green/30 text-system-green bg-green-900/10'}`}>
                    <Radio className="w-3 h-3" />
                    {meta.mode} Protocol
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
                 <div className="bg-gray-900/50 p-1.5 rounded border border-gray-800">
                    <span className="block text-[9px] text-gray-500 uppercase">Cluster</span>
                    <span className="text-haunt-gold font-mono">{activeClusterKey}</span>
                 </div>
                 <div className="bg-gray-900/50 p-1.5 rounded border border-gray-800">
                    <span className="block text-[9px] text-gray-500 uppercase">Intensity</span>
                    <span className="text-gray-300 font-mono">{meta.intensity_level}</span>
                 </div>
            </div>
        </div>

        {/* 2. CO-AUTHOR (Collapsible) */}
        {co_author_state && co_author_state.archetype !== "Auto-Generated" && (
             <div className="border-b border-gray-800">
                 <button 
                   onClick={() => toggleSection('coauthor')}
                   className="w-full flex items-center justify-between p-3 bg-gray-900/30 hover:bg-gray-900/50 transition-colors"
                 >
                     <div className="flex items-center gap-2 text-system-green font-bold text-xs uppercase tracking-wider">
                         <CloudLightning className="w-3 h-3" /> Architect Link
                     </div>
                     {expandedSections['coauthor'] ? <ChevronDown className="w-3 h-3 text-gray-500" /> : <ChevronRight className="w-3 h-3 text-gray-500" />}
                 </button>
                 
                 {expandedSections['coauthor'] && (
                     <div className="p-3 bg-black/20 text-xs space-y-2 border-t border-gray-800/50">
                         <div className="flex justify-between">
                             <span className="text-gray-500">Persona</span>
                             <span className="text-system-cyan">{co_author_state.archetype}</span>
                         </div>
                         <div className="text-gray-400 italic text-[11px] border-l-2 border-system-green/30 pl-2">
                             "{co_author_state.tone}"
                         </div>
                     </div>
                 )}
             </div>
        )}

        {/* 3. VILLAIN STATE (Collapsible) */}
        <div className="border-b border-gray-800">
             <button 
                onClick={() => toggleSection('villain')}
                className="w-full flex items-center justify-between p-3 bg-gray-900/30 hover:bg-gray-900/50 transition-colors"
             >
                 <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-wider">
                     <Eye className="w-3 h-3" /> Antagonist
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="flex gap-0.5 h-1.5 w-12">
                        {[1, 2, 3, 4, 5].map((lvl) => (
                            <div key={lvl} className={`flex-1 rounded-sm ${lvl <= threatLevel ? getThreatColor(threatLevel) : 'bg-gray-800'}`} />
                        ))}
                    </div>
                    {expandedSections['villain'] ? <ChevronDown className="w-3 h-3 text-gray-500" /> : <ChevronRight className="w-3 h-3 text-gray-500" />}
                 </div>
             </button>

             {expandedSections['villain'] && (
                 <div className="p-3 bg-red-950/10 space-y-3 relative overflow-hidden">
                     <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
                         <Skull className="w-32 h-32" />
                     </div>
                     
                     <div className="relative z-10">
                         <div className="text-gray-500 text-[10px] uppercase">Entity Name</div>
                         <div className="text-lg font-serif text-gray-200">{villain_state?.name || "Unknown"}</div>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-2 relative z-10">
                         <div className="bg-black/40 p-2 rounded border border-red-900/20">
                             <div className="text-red-400 text-[9px] uppercase font-bold mb-1">Archetype</div>
                             <div className="text-xs text-gray-300">{villain_state?.archetype}</div>
                         </div>
                         <div className="bg-black/40 p-2 rounded border border-red-900/20">
                             <div className="text-red-400 text-[9px] uppercase font-bold mb-1">Goal</div>
                             <div className="text-xs text-gray-300 truncate" title={villain_state?.primary_goal}>{villain_state?.primary_goal}</div>
                         </div>
                     </div>
                 </div>
             )}
        </div>

        {/* 4. SUBJECTS LIST (The Heavy Lifter) */}
        <div className="flex-1 pb-10">
            <div className="flex items-center justify-between p-3 bg-gray-900/20 border-b border-gray-800 sticky top-0 z-10 backdrop-blur-sm">
                 <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-wider">
                     <Users className="w-3 h-3" /> Subjects ({npc_states?.length || 0})
                 </div>
                 <button 
                    onClick={handleExportNpcData}
                    className="text-gray-600 hover:text-system-green transition-colors p-1 rounded hover:bg-gray-800"
                    title="Export Subject Data"
                 >
                    <FileJson className="w-4 h-4" />
                 </button>
            </div>

            <div className="p-2 space-y-2">
                {(!npc_states || npc_states.length === 0) && (
                    <div className="text-gray-600 text-center py-8 italic text-xs">No active subjects.</div>
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
                           className={`rounded border transition-all duration-300 overflow-hidden ${
                               isAnomaly ? 'bg-black/80 border-system-green/40 shadow-sm shadow-system-green/10' 
                               : isPsychoticBreak ? 'bg-red-950/20 border-red-900/60 animate-pulse'
                               : isExpanded ? 'bg-gray-900/30 border-gray-600' : 'bg-black/40 border-gray-800 hover:border-gray-700'
                           }`}
                        >
                            {/* Card Header (Always Visible) */}
                            <button 
                               onClick={() => toggleNpc(npc.name)}
                               className="w-full text-left p-2 flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-1 h-8 rounded-full ${isAnomaly ? 'bg-system-green' : isPsychoticBreak ? 'bg-red-500' : 'bg-gray-700 group-hover:bg-gray-500'}`} />
                                    <div>
                                        <div className={`font-bold text-sm ${isAnomaly ? 'text-system-green font-mono' : isPsychoticBreak ? 'text-red-400 font-serif tracking-widest' : 'text-gray-200'}`}>
                                            {npc.name}
                                        </div>
                                        <div className="text-[10px] text-gray-500 uppercase tracking-wide">
                                            {npc.archetype}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    {/* Mini Status Indicators */}
                                    <div className="flex gap-1">
                                        {/* Stress Dot */}
                                        <div 
                                          className={`w-2 h-2 rounded-full ${stress > 70 ? 'bg-red-500 animate-pulse' : stress > 40 ? 'bg-orange-500' : 'bg-green-900'}`} 
                                          title={`Stress: ${stress}/100`}
                                        />
                                        {/* Injury Dot */}
                                        <div 
                                          className={`w-2 h-2 rounded-full ${healthStatus === 'Injured' ? 'bg-red-900' : 'bg-green-900'}`}
                                          title={healthStatus} 
                                        />
                                    </div>
                                    {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                                </div>
                            </button>

                            {/* Expanded Details */}
                            {isExpanded && !isAnomaly && (
                                <div className="px-3 pb-3 text-xs animate-fadeIn">
                                    
                                    {/* Psychology Grid */}
                                    {npc.psychology && (
                                        <div className="mb-3 bg-gray-950/50 p-2 rounded border border-gray-800/50 grid grid-cols-2 gap-2">
                                            <div className="col-span-2 flex items-center gap-1 text-[9px] text-indigo-400 uppercase tracking-widest border-b border-indigo-900/30 pb-1 mb-1">
                                                <Brain className="w-3 h-3" /> Psyche
                                            </div>
                                            
                                            <div>
                                                <div className="text-[9px] text-gray-500 uppercase">Resilience</div>
                                                <div className="text-gray-300">{npc.psychology.resilience_level}</div>
                                            </div>
                                            <div>
                                                <div className="text-[9px] text-gray-500 uppercase">Instinct</div>
                                                <div className="text-gray-300">{npc.psychology.dominant_instinct}</div>
                                            </div>
                                            
                                            <div className="col-span-2 mt-1">
                                                <div className="flex justify-between text-[9px] text-gray-500 uppercase mb-0.5">
                                                    <span>Stress Load</span>
                                                    <span className={`${stress > 100 ? 'text-red-500 font-bold animate-pulse' : ''}`}>
                                                        {stress}/100
                                                    </span>
                                                </div>
                                                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full transition-all duration-500 ${stress > 100 ? 'bg-red-600 animate-glitch' : stress > 70 ? 'bg-red-500' : 'bg-indigo-500'}`} 
                                                        style={{ width: `${Math.min(100, stress)}%` }} 
                                                    />
                                                </div>
                                            </div>

                                            <div className="col-span-2 text-[10px] text-gray-400 italic mt-1 font-serif border-l-2 border-indigo-900/50 pl-2">
                                                "{npc.psychology.current_thought}"
                                            </div>
                                        </div>
                                    )}

                                    {/* Personality & Physical (Compact Row) */}
                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        <div className="bg-gray-900/30 p-2 rounded border border-gray-800/50">
                                            <div className="flex items-center gap-1 text-[9px] text-gray-500 uppercase tracking-widest mb-1">
                                                <Star className="w-3 h-3 text-haunt-gold" /> Traits
                                            </div>
                                            <div className="space-y-1 text-[10px]">
                                                <div className="text-haunt-gold">{npc.personality?.dominant_trait}</div>
                                                <div className="text-gray-400 flex items-center gap-1">
                                                    <Frown className="w-2 h-2" /> {npc.personality?.fatal_flaw}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-gray-900/30 p-2 rounded border border-gray-800/50">
                                            <div className="flex items-center gap-1 text-[9px] text-gray-500 uppercase tracking-widest mb-1">
                                                <User className="w-3 h-3 text-gray-400" /> Physical
                                            </div>
                                            <div className="text-[10px] text-gray-400">
                                                {npc.physical?.build}, {npc.physical?.height}
                                            </div>
                                            <div className="text-[9px] text-gray-500 italic mt-1 leading-tight">
                                                "{npc.physical?.distinguishing_feature}"
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Bars */}
                                    <div className="flex gap-3 mb-3">
                                        <div className="flex-1">
                                            <div className="flex justify-between text-[9px] text-purple-400 uppercase mb-0.5">
                                                <span className="flex items-center gap-1"><ZapOff className="w-3 h-3" /> Will</span>
                                                <span>{npc.willpower}</span>
                                            </div>
                                            <div className="h-1 bg-gray-800 rounded-full">
                                                <div className="h-full bg-purple-600" style={{ width: `${npc.willpower}%` }} />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between text-[9px] text-red-400 uppercase mb-0.5">
                                                <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> Devotion</span>
                                                <span>{npc.devotion}</span>
                                            </div>
                                            <div className="h-1 bg-gray-800 rounded-full">
                                                <div className="h-full bg-red-800" style={{ width: `${npc.devotion}%` }} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Relationships */}
                                    {npc.relationships_to_other_npcs && Object.keys(npc.relationships_to_other_npcs).length > 0 && (
                                        <div className="mb-3 bg-black/20 p-2 rounded border border-gray-800/30">
                                            <div className="flex items-center gap-1 text-[9px] text-gray-500 uppercase tracking-widest mb-1">
                                                <Link className="w-3 h-3" /> Bonds
                                            </div>
                                            <div className="space-y-1">
                                                {Object.entries(npc.relationships_to_other_npcs).map(([target, rel]) => (
                                                    <div key={target} className="flex justify-between items-center text-[10px]">
                                                        <span className="text-gray-400">{target}</span>
                                                        <span className="text-gray-300 italic">{rel.descriptor}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Injuries (Forensic Ledger) */}
                                    {npc.active_injuries?.length > 0 && (
                                        <div className="bg-red-950/10 p-2 rounded border border-red-900/30">
                                            <div className="flex items-center gap-1 text-[9px] text-red-400 uppercase tracking-widest mb-1">
                                                <Stethoscope className="w-3 h-3" /> Trauma
                                            </div>
                                            <ul className="space-y-2">
                                                {npc.active_injuries.map((inj, i) => (
                                                    <li key={i} className="text-[10px]">
                                                        <div className="flex justify-between text-gray-200 font-bold">
                                                            <span>{inj.location}</span>
                                                            <span className="text-[8px] uppercase border px-1 rounded text-red-300 border-red-900 bg-red-900/20">{inj.type}</span>
                                                        </div>
                                                        <div className="text-gray-500 italic leading-tight mt-0.5">
                                                            {inj.description}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                </div>
                            )}

                            {/* Anomaly Static View (Simplified) */}
                            {isExpanded && isAnomaly && (
                                <div className="px-3 pb-3 text-xs text-system-green font-mono">
                                    <div className="mb-2 opacity-80">{npc.narrative_role}</div>
                                    <div className="p-2 border border-system-green/30 bg-green-900/10 rounded">
                                        "{(CHARACTER_ARCHIVE.find(c => c.name === npc.name)?.dialogue_sample.warning) || "ERROR"}"
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