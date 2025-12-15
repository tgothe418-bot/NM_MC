

import React, { useState, useEffect, useRef } from 'react';
import { Bot, Play, Square, Activity, Terminal, X, Cpu, Settings, Users, Image, CloudLightning, ToggleLeft, ToggleRight } from 'lucide-react';
import { SimulationConfig } from '../types';

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunSimulation: (config: SimulationConfig) => void;
  isSimulating: boolean;
  simulationReport: string | null;
  // We accept initial values to populate the form if the game is already running
  initialPerspective?: string;
  initialMode?: string;
  initialStart?: string; // New
  initialCluster?: string;
  initialIntensity?: string;
}

export const SimulationModal: React.FC<SimulationModalProps> = ({ 
  isOpen, 
  onClose, 
  onRunSimulation, 
  isSimulating,
  simulationReport,
  initialPerspective = "First Person",
  initialMode = "Survivor",
  initialStart = "Prologue", // Default
  initialCluster = "Flesh",
  initialIntensity = "R"
}) => {
  const [cycles, setCycles] = useState(20);
  
  // Dread Dial State
  const [perspective, setPerspective] = useState(initialPerspective);
  const [mode, setMode] = useState(initialMode);
  const [startingPoint, setStartingPoint] = useState(initialStart);
  const [cluster, setCluster] = useState(initialCluster);
  const [intensity, setIntensity] = useState(initialIntensity);
  const [victimCount, setVictimCount] = useState(5); // Default 5 victims
  const [visualMotif, setVisualMotif] = useState("");

  // CO-AUTHOR STATE
  const [coAuthorMode, setCoAuthorMode] = useState<'Manual' | 'Auto'>('Auto');
  const [coAuthorArchetype, setCoAuthorArchetype] = useState("The Director");
  const [coAuthorDominance, setCoAuthorDominance] = useState(50);

  const reportRef = useRef<HTMLDivElement>(null);

  // Sync with props when modal opens or props change
  useEffect(() => {
    if (isOpen) {
        if (initialPerspective && initialPerspective !== "Pending") setPerspective(initialPerspective);
        if (initialMode && initialMode !== "Pending") setMode(initialMode);
        if (initialStart && initialStart !== "Pending") setStartingPoint(initialStart);
        if (initialCluster && initialCluster !== "None") setCluster(initialCluster);
        if (initialIntensity && initialIntensity !== "PENDING") setIntensity(initialIntensity);
    }
  }, [isOpen, initialPerspective, initialMode, initialStart, initialCluster, initialIntensity]);

  useEffect(() => {
    if (simulationReport && reportRef.current) {
        reportRef.current.scrollTop = 0;
    }
  }, [simulationReport]);

  const handleRun = () => {
      onRunSimulation({
          perspective,
          mode,
          starting_point: startingPoint,
          cluster,
          intensity,
          cycles,
          victim_count: mode === 'Villain' ? victimCount : undefined,
          visual_motif: visualMotif,
          // New Co-Author fields
          co_author_mode: coAuthorMode,
          co_author_archetype: coAuthorMode === 'Manual' ? coAuthorArchetype : undefined,
          co_author_dominance: coAuthorMode === 'Manual' ? coAuthorDominance : undefined
      });
  };

  const toggleCoAuthorMode = () => {
      setCoAuthorMode(prev => prev === 'Auto' ? 'Manual' : 'Auto');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-terminal border border-system-green max-w-2xl w-full rounded-sm shadow-[0_0_30px_rgba(16,185,129,0.2)] flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-green-900/50 flex justify-between items-center bg-green-900/10">
          <div className="flex items-center gap-2 text-system-green">
            <Cpu className="w-5 h-5 animate-pulse" />
            <h2 className="font-mono text-lg font-bold tracking-widest uppercase">Simulation Protocol</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          
          <div className="mb-6 bg-black/50 p-4 border border-green-900/30 rounded font-mono text-xs text-gray-400">
            <p className="mb-2 text-system-green font-bold">MODE: AUTONOMOUS SELF-TEST</p>
            <p>
              The Nightmare Machine will assume the role of the Subject. It will configure the narrative according to the parameters below, make its own decisions, and analyze the results.
            </p>
            <p className="mt-2 text-yellow-500">
               WARNING: This process consumes significant tokens.
            </p>
          </div>

          {!simulationReport && (
            <div className="flex flex-col gap-6">
               
               {/* DREAD DIALS CONFIGURATION */}
               <div className="space-y-4 border-b border-gray-800 pb-6">
                   <div className="flex items-center gap-2 text-system-green font-mono text-xs uppercase tracking-widest mb-2">
                       <Settings className="w-4 h-4" /> Dread Dials
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                       {/* Perspective */}
                       <div className="flex flex-col gap-1">
                           <label className="text-[10px] font-mono text-gray-500 uppercase">Perspective</label>
                           <select 
                             value={perspective} 
                             onChange={(e) => setPerspective(e.target.value)}
                             className="bg-black border border-gray-700 text-gray-300 text-xs font-mono p-2 rounded focus:border-system-green outline-none"
                           >
                               <option value="First Person">First Person</option>
                               <option value="Third Person">Third Person</option>
                           </select>
                       </div>

                       {/* Mode */}
                       <div className="flex flex-col gap-1">
                           <label className="text-[10px] font-mono text-gray-500 uppercase">Role</label>
                           <select 
                             value={mode} 
                             onChange={(e) => setMode(e.target.value)}
                             className="bg-black border border-gray-700 text-gray-300 text-xs font-mono p-2 rounded focus:border-system-green outline-none"
                           >
                               <option value="Survivor">Survivor</option>
                               <option value="Villain">Villain</option>
                           </select>
                       </div>

                       {/* Cluster */}
                       <div className="flex flex-col gap-1">
                           <label className="text-[10px] font-mono text-gray-500 uppercase">Theme (Cluster)</label>
                           <select 
                             value={cluster} 
                             onChange={(e) => setCluster(e.target.value)}
                             className="bg-black border border-gray-700 text-gray-300 text-xs font-mono p-2 rounded focus:border-system-green outline-none"
                           >
                               <option value="Flesh">Flesh (Gore/Body Horror)</option>
                               <option value="System">System (Cosmic/Tech)</option>
                               <option value="Haunting">Haunting (Occult/Ghosts)</option>
                               <option value="Self">Self (Psychological)</option>
                               <option value="Blasphemy">Blasphemy (Religious)</option>
                               <option value="Survival">Survival (Nature)</option>
                           </select>
                       </div>

                        {/* Starting Point (New) */}
                       <div className="flex flex-col gap-1">
                           <label className="text-[10px] font-mono text-gray-500 uppercase">Entry Point</label>
                           <select 
                             value={startingPoint} 
                             onChange={(e) => setStartingPoint(e.target.value)}
                             className="bg-black border border-gray-700 text-gray-300 text-xs font-mono p-2 rounded focus:border-system-green outline-none"
                           >
                               <option value="Prologue">Prologue (Slow Burn)</option>
                               <option value="In Media Res">In Media Res (Mystery)</option>
                               <option value="Action">Action (Immediate Threat)</option>
                           </select>
                       </div>

                       {/* Intensity */}
                       <div className="flex flex-col gap-1">
                           <label className="text-[10px] font-mono text-gray-500 uppercase">Intensity</label>
                           <select 
                             value={intensity} 
                             onChange={(e) => setIntensity(e.target.value)}
                             className="bg-black border border-gray-700 text-gray-300 text-xs font-mono p-2 rounded focus:border-system-green outline-none"
                           >
                               <option value="PG-13">PG-13 (Atmospheric)</option>
                               <option value="R">R (Visceral)</option>
                               <option value="Extreme">Extreme (Traumatic)</option>
                           </select>
                       </div>

                       {/* Victim Count (Villain Only) */}
                       {mode === 'Villain' && (
                           <div className="flex flex-col gap-1">
                               <label className="text-[10px] font-mono text-gray-500 uppercase flex items-center gap-1">
                                  <Users className="w-3 h-3" /> Victim Count
                               </label>
                               <div className="flex items-center gap-2">
                                  <input 
                                    type="range" 
                                    min="1" 
                                    max="10" 
                                    value={victimCount} 
                                    onChange={(e) => setVictimCount(parseInt(e.target.value))}
                                    className="w-full accent-red-600 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                                  />
                                  <span className="text-xs font-mono text-red-500 w-6 text-center">{victimCount}</span>
                               </div>
                           </div>
                       )}
                       
                       {/* Visual Motif (New) */}
                       <div className="col-span-2 flex flex-col gap-1">
                            <label className="text-[10px] font-mono text-gray-500 uppercase flex items-center gap-1">
                                <Image className="w-3 h-3" /> Visual Motif
                            </label>
                            <input 
                                type="text"
                                value={visualMotif}
                                onChange={(e) => setVisualMotif(e.target.value)}
                                placeholder="e.g. Grainy 8mm film, Neon Noir, Oil Painting..."
                                className="bg-black border border-gray-700 text-gray-300 text-xs font-mono p-2 rounded focus:border-system-green outline-none w-full"
                            />
                       </div>
                   </div>
               </div>

               {/* NEW: ARCHITECT / CO-AUTHOR CONFIGURATION */}
               <div className="space-y-4 border-b border-gray-800 pb-6">
                   <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-haunt-gold font-mono text-xs uppercase tracking-widest">
                            <CloudLightning className="w-4 h-4" /> Architect Configuration
                        </div>
                        <button 
                            onClick={toggleCoAuthorMode}
                            className="flex items-center gap-2 text-[10px] uppercase font-mono text-gray-400 hover:text-white transition-colors"
                        >
                            <span>{coAuthorMode === 'Auto' ? 'Auto-Generate' : 'Manual Setup'}</span>
                            {coAuthorMode === 'Auto' ? <ToggleLeft className="w-5 h-5" /> : <ToggleRight className="w-5 h-5 text-haunt-gold" />}
                        </button>
                   </div>
                   
                   {coAuthorMode === 'Auto' ? (
                       <div className="text-[10px] text-gray-500 italic bg-gray-900/30 p-2 rounded border border-gray-800/50">
                           The Nightmare Machine will automatically generate a Co-Author persona based on the chosen Cluster and Intensity. This entity will possess its own agenda.
                       </div>
                   ) : (
                       <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                            <div className="flex flex-col gap-1">
                               <label className="text-[10px] font-mono text-gray-500 uppercase">Persona Type</label>
                               <select 
                                 value={coAuthorArchetype} 
                                 onChange={(e) => setCoAuthorArchetype(e.target.value)}
                                 className="bg-black border border-gray-700 text-gray-300 text-xs font-mono p-2 rounded focus:border-haunt-gold outline-none"
                               >
                                   <option value="The Archivist">The Archivist (Cold)</option>
                                   <option value="The Director">The Director (Visionary)</option>
                                   <option value="The Sadist">The Sadist (Cruel)</option>
                                   <option value="The Oracle">The Oracle (Cryptic)</option>
                                   <option value="The Glitch">The Glitch (Broken)</option>
                                   <option value="The Caretaker">The Caretaker (Deceptive)</option>
                               </select>
                           </div>

                           <div className="flex flex-col gap-1">
                               <label className="text-[10px] font-mono text-gray-500 uppercase">Dominance</label>
                               <div className="flex items-center gap-2">
                                  <input 
                                    type="range" 
                                    min="0" 
                                    max="100" 
                                    value={coAuthorDominance} 
                                    onChange={(e) => setCoAuthorDominance(parseInt(e.target.value))}
                                    className="w-full accent-haunt-gold h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                                  />
                                  <span className="text-xs font-mono text-haunt-gold w-8 text-right">{coAuthorDominance}%</span>
                               </div>
                           </div>
                       </div>
                   )}
               </div>

               {/* CYCLES CONFIGURATION */}
               <div className="flex flex-col gap-2">
                 <label className="text-xs font-mono text-gray-400 uppercase">Simulation Cycles (Turns)</label>
                 <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="1" 
                      max="200" 
                      value={cycles} 
                      onChange={(e) => setCycles(parseInt(e.target.value))}
                      className="w-full accent-system-green h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                    />
                    <input
                      type="number"
                      min="1"
                      max="200"
                      value={cycles} 
                      onChange={(e) => setCycles(parseInt(e.target.value))}
                      className="w-20 bg-black border border-gray-700 text-system-green font-mono text-center rounded focus:outline-none focus:border-green-500 p-1"
                    />
                 </div>
               </div>

               <button
                  onClick={handleRun}
                  disabled={isSimulating}
                  className={`mt-4 py-4 px-6 rounded-sm font-mono uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all
                    ${isSimulating 
                        ? 'bg-red-900/20 text-red-500 border border-red-900 cursor-not-allowed animate-pulse' 
                        : 'bg-system-green hover:bg-green-400 text-black border border-green-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                    }`}
               >
                  {isSimulating ? (
                    <>
                       <Activity className="w-5 h-5 animate-spin" />
                       Running Simulation...
                    </>
                  ) : (
                    <>
                       <Play className="w-5 h-5" />
                       Initiate Sequence
                    </>
                  )}
               </button>
            </div>
          )}

          {/* Analysis Report Output */}
          {simulationReport && (
            <div className="animate-fadeIn mt-2">
                <div className="flex items-center gap-2 mb-2 text-haunt-gold font-mono text-xs uppercase tracking-widest">
                    <Terminal className="w-4 h-4" />
                    System Analysis Report
                </div>
                <div 
                  ref={reportRef}
                  className="bg-black border border-gray-800 p-4 rounded text-xs font-mono text-gray-300 whitespace-pre-wrap leading-relaxed h-64 overflow-y-auto custom-scrollbar"
                >
                    {simulationReport}
                </div>
                <div className="mt-4 flex justify-end">
                    <button 
                        onClick={handleRun} 
                        className="text-xs font-mono text-system-green hover:text-white underline"
                    >
                        Rerun Protocol
                    </button>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};