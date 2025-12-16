

import React from 'react';
import { GameState } from '../types';
import { Skull, Radio, Users, Eye, Brain, MapPin, AlertTriangle, Scale, Clock, Ghost, ShieldAlert, Activity, BookOpen, Lock, Unlock, FileText, Zap, Heart, ZapOff, Stethoscope, Gauge, Hand, Footprints, AlertOctagon, Anchor, Wrench, Target, Search, Hexagon, Bone, Flame, Droplet, Scissors, Hammer, User, Star, Frown, Smile, Link, Mic, CloudLightning, MessageSquare, Shield, MousePointer2, Download, FileJson } from 'lucide-react';
import { ClusterRadar } from './ClusterRadar';
import { LORE_LIBRARY } from '../loreLibrary';
import { CHARACTER_ARCHIVE } from '../characterArchive';

interface StatusPanelProps {
  gameState: GameState;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({ gameState }) => {
  const { meta, villain_state, npc_states, location_state, narrative, star_game, co_author_state } = gameState;
  const threatLevel = villain_state?.threat_scale || 0;
  const sensoryFocus = narrative?.sensory_focus || "Silence"; 
  
  let activeClusterKey = "None";
  let activeLore = null;
  
  if (meta.active_cluster) {
      if (meta.active_cluster.includes("Flesh")) activeClusterKey = "Flesh";
      else if (meta.active_cluster.includes("System")) activeClusterKey = "System";
      else if (meta.active_cluster.includes("Haunting")) activeClusterKey = "Haunting";
      else if (meta.active_cluster.includes("Self")) activeClusterKey = "Self";
      else if (meta.active_cluster.includes("Blasphemy")) activeClusterKey = "Blasphemy";
      else if (meta.active_cluster.includes("Survival")) activeClusterKey = "Survival";
      
      activeLore = LORE_LIBRARY[activeClusterKey];
  }

  const handleExportNpcData = () => {
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

  const getLocationColor = (level: number) => {
    if (level === 0) return 'text-green-500';
    if (level === 1) return 'text-yellow-500';
    if (level === 2) return 'text-orange-500';
    return 'text-red-600 animate-pulse';
  };

  const getInjuryDepthColor = (depth: string) => {
    if (depth === 'STRUCTURAL') return 'text-red-500 border-red-500 font-bold bg-red-950/50';
    if (depth === 'DEEP_TISSUE') return 'text-orange-400 border-orange-500 bg-orange-950/30';
    return 'text-yellow-200 border-yellow-600 bg-yellow-950/30';
  };

  const getInjuryIcon = (type: string) => {
    switch(type) {
      case 'fracture': return <Bone className="w-3 h-3 text-gray-100" />;
      case 'burn': return <Flame className="w-3 h-3 text-orange-500 animate-pulse" />;
      case 'incision': return <Scissors className="w-3 h-3 text-teal-400" />; 
      case 'laceration': return <Activity className="w-3 h-3 text-red-500" />; 
      case 'avulsion':
      case 'degloving': return <Droplet className="w-3 h-3 text-blood-red" />; 
      case 'puncture': return <Target className="w-3 h-3 text-red-400" />; 
      case 'contusion':
      case 'abrasion': return <Hammer className="w-3 h-3 text-purple-400" />; 
      case 'psychological': return <Brain className="w-3 h-3 text-pink-400" />;
      default: return <Stethoscope className="w-3 h-3 text-gray-400" />;
    }
  };

  const getInstinctColor = (instinct: string) => {
      switch(instinct) {
          case 'Fight': return 'text-red-400';
          case 'Flight': return 'text-yellow-400';
          case 'Freeze': return 'text-blue-300';
          case 'Fawn': return 'text-pink-300';
          case 'Submit': return 'text-gray-500';
          default: return 'text-gray-400';
      }
  };

  const getResilienceColor = (level: string) => {
      switch(level) {
          case 'Unbreakable': return 'text-system-green font-bold';
          case 'High': return 'text-green-400';
          case 'Moderate': return 'text-yellow-400';
          case 'Fragile': return 'text-orange-400';
          case 'Shattered': return 'text-red-500 font-bold animate-pulse';
          default: return 'text-gray-400';
      }
  };

  const getConsciousnessColor = (status: string) => {
    if (status === 'Unconscious') return 'text-red-600 animate-pulse';
    if (status === 'Fading') return 'text-orange-500';
    if (status === 'Dazed') return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="w-full lg:w-96 bg-terminal border-l border-gray-800 h-full flex flex-col overflow-y-auto custom-scrollbar font-mono text-sm">
      
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-black sticky top-0 z-10">
        <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
          <span>TURN: {meta.turn}</span>
          <span>{meta.perspective && meta.perspective !== "Pending" ? meta.perspective.toUpperCase() : "PERSPECTIVE: UNKNOWN"}</span>
        </div>
        <div className="flex justify-between items-center mb-1">
             <span className="text-xs text-gray-500">INTENSITY: {meta.intensity_level}</span>
        </div>
        
        {meta.custodian_name && meta.custodian_name !== "Unknown" && (
           <div className="flex items-center gap-1 mb-2 text-gray-400">
               <span className="text-[10px] uppercase tracking-wider text-gray-600">ARCHITECT:</span>
               <span className="text-xs font-bold text-gray-300 font-serif">{meta.custodian_name}</span>
           </div>
        )}

        <div className="flex justify-between items-center">
            <div className={`flex items-center gap-2 ${meta.mode === 'Villain' ? 'text-red-500' : 'text-system-green'}`}>
            <Radio className="w-4 h-4 animate-pulse" />
            <span className="tracking-widest uppercase text-xs">{meta.mode} MODE</span>
            </div>
            <div className="text-xs text-haunt-gold tracking-wider">
              {activeClusterKey !== "None" ? activeClusterKey.toUpperCase() : "NO SIGNAL"}
            </div>
        </div>
      </div>

      {/* CO-AUTHOR / ARCHITECT AGENTIC STATE */}
      {co_author_state && co_author_state.archetype !== "Auto-Generated" && (
          <div className="p-4 border-b border-gray-800 bg-gray-900/40 relative overflow-hidden">
              <div className="absolute inset-0 bg-system-green/5 animate-pulse pointer-events-none"></div>
              
              <h3 className="text-system-green font-bold tracking-widest uppercase mb-3 flex items-center gap-2 text-xs relative z-10">
                 <CloudLightning className="w-3 h-3" /> Architect Neural Link
              </h3>

              <div className="relative z-10 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">PERSONA</span>
                      <span className="text-system-cyan font-bold">{co_author_state.archetype}</span>
                  </div>
                  
                  <div className="text-[10px] text-gray-400 italic border-l-2 border-system-green/30 pl-2">
                      Tone: "{co_author_state.tone}"
                  </div>
              </div>
          </div>
      )}

      {/* Villain State */}
      <div className="p-4 border-b border-gray-800 relative">
         <div className="absolute top-0 right-0 p-1 opacity-20">
           <Skull className="w-24 h-24 text-red-900" />
         </div>
         <h3 className="text-red-500 font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
           <Eye className="w-4 h-4" /> Antagonist
         </h3>
         
         <div className="space-y-3 relative z-10">
           <div>
             <span className="text-gray-500 block text-xs">DESIGNATION</span>
             <span className="text-gray-200 text-lg font-serif">{villain_state?.name || "Unknown"}</span>
           </div>

           <div>
             <span className="text-gray-500 block text-xs">ARCHETYPE</span>
             <span className="text-red-400 text-sm font-bold font-serif tracking-wide">{villain_state?.archetype || "Unknown"}</span>
           </div>

           <div>
             <span className="text-gray-500 block text-xs mb-1">THREAT SCALE ({threatLevel}/5)</span>
             <div className="flex gap-1 h-2">
               {[1, 2, 3, 4, 5].map((lvl) => (
                 <div 
                   key={lvl} 
                   className={`flex-1 rounded-sm transition-all duration-500 ${lvl <= threatLevel ? getThreatColor(threatLevel) : 'bg-gray-900'}`}
                 />
               ))}
             </div>
           </div>
         </div>
      </div>

      {/* NPC States (Expanded Engine) */}
      <div className="p-4 border-b border-gray-800 flex-1">
        <div className="flex items-center justify-between mb-4">
             <h3 className="text-gray-400 font-bold tracking-widest uppercase flex items-center gap-2">
               <Users className="w-4 h-4" /> Subjects
             </h3>
             <button 
                onClick={handleExportNpcData}
                className="text-gray-600 hover:text-system-green transition-colors"
                title="Export Subject Data (JSON)"
             >
                <FileJson className="w-4 h-4" />
             </button>
        </div>
        
        <div className="space-y-6">
          {(npc_states || []).map((npc, idx) => {
             const isAnomaly = npc.fracture_state === 4;
             const archiveData = isAnomaly 
                ? CHARACTER_ARCHIVE.find(c => c.name === npc.name || c.character_id === npc.archive_id)
                : null;
             
             const willpower = npc.willpower ?? 50;
             const devotion = npc.devotion ?? 50;
             const pain = npc.pain_level ?? 0;
             const shock = npc.shock_level ?? 0;
             const consciousness = npc.consciousness || "Alert";
             const disassociation = npc.disassociation_index ?? 0;

             return (
            <div 
              key={idx} 
              className={`p-3 rounded border transition-colors relative ${
                  isAnomaly 
                  ? 'bg-black/80 border-system-green/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                  : 'bg-black/40 border-gray-800 hover:border-gray-600'
              }`}
            >
              {/* Header */}
              <div className="mb-2 mt-1">
                <span className={`font-bold block ${isAnomaly ? 'text-system-green font-mono' : 'text-gray-200'}`}>
                    {npc.name}
                </span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">{npc.archetype}</span>
                {!isAnomaly && npc.current_state && (
                  <span className="text-[10px] text-gray-400 ml-2 border-l border-gray-700 pl-2">
                    {npc.current_state}
                  </span>
                )}
              </div>

              {/* NEW: Psychological State Display (Enriched) */}
              {!isAnomaly && npc.psychology && (
                  <div className="mb-3 bg-gray-900/40 p-2 rounded border-l-2 border-indigo-500/50">
                      <div className="flex justify-between items-baseline mb-2">
                          <span className="text-[9px] text-indigo-400 uppercase tracking-wide flex items-center gap-1">
                              <Brain className="w-3 h-3" /> Psyche
                          </span>
                          <span className={`text-[9px] uppercase ${getResilienceColor(npc.psychology.resilience_level)}`}>
                              {npc.psychology.resilience_level}
                          </span>
                      </div>
                      
                      {/* Stress Bar */}
                      <div className="mb-2">
                          <div className="flex justify-between text-[8px] uppercase text-gray-500 mb-0.5">
                              <span>Stress Load</span>
                              <span>{npc.psychology.stress_level || 0}/10</span>
                          </div>
                          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-500 ${
                                    (npc.psychology.stress_level || 0) > 7 ? 'bg-red-500' : 
                                    (npc.psychology.stress_level || 0) > 4 ? 'bg-orange-500' : 'bg-indigo-500'
                                }`} 
                                style={{ width: `${((npc.psychology.stress_level || 0) / 10) * 100}%` }}
                              ></div>
                          </div>
                      </div>

                      {/* Instinct Tag */}
                      <div className="flex items-center gap-2 mb-2 text-[9px] uppercase">
                          <span className="text-gray-600 flex items-center gap-1">
                             <MousePointer2 className="w-3 h-3" /> Instinct:
                          </span>
                          <span className={`font-bold ${getInstinctColor(npc.psychology.dominant_instinct)}`}>
                             {npc.psychology.dominant_instinct}
                          </span>
                      </div>

                      <div className="w-full h-px bg-gray-800/50 mb-2"></div>

                      <p className="text-[10px] text-gray-300 italic font-serif leading-tight">
                          "{npc.psychology.current_thought}"
                      </p>
                  </div>
              )}

              {/* NEW: Physical / Appearance Display */}
              {!isAnomaly && npc.physical && (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3 text-[10px] text-gray-400 bg-gray-900/20 p-2 rounded border border-gray-800/50">
                     <span className="flex items-center gap-1"><User className="w-3 h-3 opacity-60" /> {npc.physical.build} / {npc.physical.height}</span>
                     <div className="w-full h-px bg-gray-800 my-1"></div>
                     <span className="italic opacity-80 leading-tight">"{npc.physical.distinguishing_feature}"</span>
                  </div>
              )}
              
              {/* NEW: Personality Profile */}
              {!isAnomaly && npc.personality && (
                  <div className="grid grid-cols-2 gap-2 mb-3 bg-black/30 p-2 rounded border border-gray-800/30">
                      <div className="col-span-2 flex items-center gap-2 border-b border-gray-800 pb-1 mb-1">
                          <Star className="w-3 h-3 text-haunt-gold" />
                          <span className="text-[10px] text-haunt-gold italic">{npc.personality.dominant_trait}</span>
                      </div>
                      
                      <div>
                         <div className="text-[9px] text-gray-500 uppercase flex items-center gap-1 mb-1"><Frown className="w-3 h-3" /> Flaw</div>
                         <div className="text-[10px] text-gray-300">{npc.personality.fatal_flaw}</div>
                      </div>

                      <div>
                         <div className="text-[9px] text-gray-500 uppercase flex items-center gap-1 mb-1"><ShieldAlert className="w-3 h-3" /> Cope</div>
                         <div className="text-[10px] text-gray-400">{npc.personality.coping_mechanism}</div>
                      </div>
                  </div>
              )}

              {/* Dynamic Resistance Stats */}
              {!isAnomaly && (
                 <div className="flex gap-4 mb-3 mt-2 border-b border-gray-800 pb-2">
                    <div className="flex-1">
                        <div className="flex justify-between text-[9px] uppercase text-gray-500 mb-1">
                            <span className="flex items-center gap-1"><ZapOff className="w-3 h-3 text-purple-400" /> Will</span>
                            <span className="text-gray-300">{willpower}</span>
                        </div>
                        <div className="h-1 bg-gray-900 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-600" style={{ width: `${willpower}%` }}></div>
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between text-[9px] uppercase text-gray-500 mb-1">
                            <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-red-400" /> Devotion</span>
                            <span className="text-gray-300">{devotion}</span>
                        </div>
                        <div className="h-1 bg-gray-900 rounded-full overflow-hidden">
                            <div className="h-full bg-red-800" style={{ width: `${devotion}%` }}></div>
                        </div>
                    </div>
                 </div>
              )}

              {/* Relationships */}
              {!isAnomaly && npc.relationships_to_other_npcs && Object.keys(npc.relationships_to_other_npcs).length > 0 && (
                  <div className="mb-2 bg-black/20 p-1.5 rounded border border-gray-800/30">
                      <div className="flex items-center gap-1 text-[9px] text-gray-500 uppercase tracking-widest mb-1">
                          <Link className="w-3 h-3" /> Bonds
                      </div>
                      <div className="space-y-1">
                        {Object.keys(npc.relationships_to_other_npcs).map((targetName) => {
                            const rel = npc.relationships_to_other_npcs[targetName];
                            if (typeof rel === 'object' && rel !== null) {
                               return (
                                  <div key={targetName} className="flex justify-between items-center text-[10px] text-gray-400">
                                      <span className="opacity-70">{targetName}:</span>
                                      <span className="italic text-gray-300" title={`Trust: ${rel.trust}, Fear: ${rel.fear}`}>{rel.descriptor}</span>
                                  </div>
                               );
                            }
                            return null;
                        })}
                      </div>
                  </div>
              )}

              {/* Forensic Ledger (Active Injuries) */}
              {npc.active_injuries && npc.active_injuries.length > 0 && (
                <div className="mb-3 bg-gradient-to-r from-red-950/30 to-transparent p-2 rounded border-l border-red-900/50">
                    <div className="flex items-center gap-2 text-[10px] text-red-400 uppercase tracking-widest mb-2 border-b border-red-900/40 pb-1">
                        <Stethoscope className="w-3 h-3" /> Forensic Ledger
                    </div>
                    <ul className="space-y-3">
                        {npc.active_injuries.map((inj, i) => (
                            <li key={i} className={`text-[10px] relative p-1 rounded-r ${inj.depth === 'STRUCTURAL' ? 'bg-red-900/10' : ''}`}>
                                <div className="flex justify-between items-start mb-0.5">
                                    <div className="flex items-center gap-1.5 font-bold text-gray-200">
                                        {getInjuryIcon(inj.type)}
                                        <span>{inj.location}</span>
                                    </div>
                                    <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border text-[8px] tracking-wider ${getInjuryDepthColor(inj.depth)}`}>
                                        {inj.depth.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="text-gray-400 italic mb-1 pl-5 text-[9px] leading-tight opacity-80">
                                    "{inj.description}"
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
              )}
            </div>
          )})}
          
          {(!npc_states || npc_states.length === 0) && (
            <div className="text-gray-600 text-center py-4 italic text-xs">No subjects detected.</div>
          )}
        </div>
      </div>
    </div>
  );
};