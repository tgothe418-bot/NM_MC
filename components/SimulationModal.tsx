
import React, { useState, useEffect, useRef } from 'react';
import { Bot, Play, Square, Activity, Terminal, X, Cpu, Settings, Users, Image, CloudLightning, ToggleLeft, ToggleRight, Eye, Zap, Layers, Timer } from 'lucide-react';
import { SimulationConfig } from '../types';

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunSimulation: (config: SimulationConfig) => void;
  isSimulating: boolean;
  simulationReport: string | null;
  initialPerspective?: string;
  initialMode?: string;
  initialStart?: string;
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
  initialStart = "Prologue",
  initialCluster = "Flesh",
  initialIntensity = "R"
}) => {
  const [cycles, setCycles] = useState(20);
  
  const [perspective, setPerspective] = useState(initialPerspective);
  const [mode, setMode] = useState(initialMode);
  const [startingPoint, setStartingPoint] = useState(initialStart);
  const [cluster, setCluster] = useState(initialCluster);
  const [intensity, setIntensity] = useState(initialIntensity);
  const [victimCount, setVictimCount] = useState(5);
  const [visualMotif, setVisualMotif] = useState("");

  const [coAuthorMode, setCoAuthorMode] = useState<'Manual' | 'Auto'>('Auto');
  const [coAuthorArchetype, setCoAuthorArchetype] = useState("The Director");
  const [coAuthorDominance, setCoAuthorDominance] = useState(50);

  const reportRef = useRef<HTMLDivElement>(null);

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
    <div className="fixed inset-0 bg-black/95 z-[150] flex items-center justify-center p-6 backdrop-blur-md">
      <div className="bg-terminal border-2 border-system-green/40 max-w-7xl w-full rounded-sm shadow-[0_0_100px_rgba(16,185,129,0.15)] flex flex-col max-h-[95vh] relative overflow-hidden animate-fadeIn">
        
        {/* Decorative Scanning Header */}
        <div className="h-1 bg-system-green/20 relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-system-green w-1/3 animate-[scanline_3s_linear_infinite]" />
        </div>

        {/* Corner Accents */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-system-green/60"></div>
        <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-system-green/60"></div>
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-system-green/60"></div>
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-system-green/60"></div>

        {/* Modal Header */}
        <div className="p-8 border-b border-system-green/20 flex justify-between items-center bg-green-950/10">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-system-green/10 rounded-sm border border-system-green/30">
              <Cpu className="w-10 h-10 text-system-green animate-pulse" />
            </div>
            <div>
              <h2 className="font-mono text-4xl font-bold tracking-[0.2em] uppercase text-system-green">Simulation Protocol</h2>
              <p className="text-xs font-mono text-gray-500 tracking-[0.4em] uppercase mt-2">Autonomous Validation // Neural Pathfinding</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-gray-600 hover:text-white hover:bg-white/5 transition-all rounded-sm border border-transparent hover:border-gray-800">
            <X className="w-8 h-8" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-10 overflow-y-auto flex-1 custom-scrollbar space-y-12">
          
          {/* Info Banner */}
          <div className="bg-black/60 p-6 border-l-4 border-system-green relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Activity className="w-24 h-24 text-system-green" />
            </div>
            <p className="text-sm font-mono text-system-green font-bold tracking-widest uppercase mb-3">MODE: AUTONOMOUS SELF-TEST</p>
            <p className="text-sm font-mono text-gray-400 leading-relaxed max-w-4xl tracking-tight">
              The Machine will assume control of a proxy subject. It will navigate the narrative path based on the technical resonance parameters defined below. High-load simulation cycles will analyze psychological divergence and terminal outcomes.
            </p>
            <p className="mt-4 text-[10px] font-mono text-orange-600 uppercase tracking-[0.3em] animate-pulse">
               WARNING: This protocol increases neural load and token expenditure.
            </p>
          </div>

          {!simulationReport && (
            <div className="space-y-16">
               
               {/* TECHNICAL PARAMETERS (DREAD DIALS) */}
               <div className="space-y-8">
                   <div className="flex items-center gap-4 text-system-green font-mono text-sm uppercase tracking-[0.4em] border-b border-system-green/10 pb-4">
                       <Settings className="w-6 h-6" /> Dread Dials
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                       {/* Perspective */}
                       <div className="space-y-3">
                           <label className="text-xs font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
                             <Eye className="w-4 h-4" /> Perspective
                           </label>
                           <select 
                             value={perspective} 
                             onChange={(e) => setPerspective(e.target.value)}
                             className="w-full bg-black border border-gray-800 text-gray-200 p-5 font-mono text-base focus:border-system-green outline-none transition-all hover:bg-gray-900 appearance-none rounded-sm"
                           >
                               <option value="First Person">First Person (Direct)</option>
                               <option value="Third Person">Third Person (Cinematic)</option>
                           </select>
                       </div>

                       {/* Mode */}
                       <div className="space-y-3">
                           <label className="text-xs font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
                             <Users className="w-4 h-4" /> Specimen Role
                           </label>
                           <select 
                             value={mode} 
                             onChange={(e) => setMode(e.target.value)}
                             className="w-full bg-black border border-gray-800 text-gray-200 p-5 font-mono text-base focus:border-system-green outline-none transition-all hover:bg-gray-900 appearance-none rounded-sm"
                           >
                               <option value="Survivor">The Survivor</option>
                               <option value="Villain">The Antagonist</option>
                           </select>
                       </div>

                       {/* Cluster */}
                       <div className="space-y-3">
                           <label className="text-xs font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
                             <Layers className="w-4 h-4" /> Thematic Cluster
                           </label>
                           <select 
                             value={cluster} 
                             onChange={(e) => setCluster(e.target.value)}
                             className="w-full bg-black border border-gray-800 text-gray-200 p-5 font-mono text-base focus:border-system-green outline-none transition-all hover:bg-gray-900 appearance-none rounded-sm"
                           >
                               <option value="Flesh">Flesh (Bio-Horror)</option>
                               <option value="System">System (Glitch/Industrial)</option>
                               <option value="Haunting">Haunting (Gothic/Decay)</option>
                               <option value="Self">Self (Psychological)</option>
                               <option value="Blasphemy">Blasphemy (Transgressive)</option>
                               <option value="Survival">Survival (Void/Cold)</option>
                               <option value="Desire">Desire (The Hunger)</option>
                           </select>
                       </div>

                        {/* Starting Point */}
                       <div className="space-y-3">
                           <label className="text-xs font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
                             <Activity className="w-4 h-4" /> Entry Point
                           </label>
                           <select 
                             value={startingPoint} 
                             onChange={(e) => setStartingPoint(e.target.value)}
                             className="w-full bg-black border border-gray-800 text-gray-200 p-5 font-mono text-base focus:border-system-green outline-none transition-all hover:bg-gray-900 appearance-none rounded-sm"
                           >
                               <option value="Prologue">Prologue (Slow Burn)</option>
                               <option value="In Media Res">In Media Res (Mystery)</option>
                               <option value="Action">Action (Crisis)</option>
                           </select>
                       </div>

                       {/* Intensity */}
                       <div className="space-y-3">
                           <label className="text-xs font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
                             <Zap className="w-4 h-4" /> Neural Fidelity
                           </label>
                           <select 
                             value={intensity} 
                             onChange={(e) => setIntensity(e.target.value)}
                             className="w-full bg-black border border-gray-800 text-gray-200 p-5 font-mono text-base focus:border-system-green outline-none transition-all hover:bg-gray-900 appearance-none rounded-sm"
                           >
                               <option value="PG-13">PG-13 (Atmospheric)</option>
                               <option value="R">R (Visceral)</option>
                               <option value="Extreme">Extreme (Apotheosis)</option>
                           </select>
                       </div>

                       {/* Victim Count or Visual Motif (Conditional) */}
                       {mode === 'Villain' ? (
                           <div className="space-y-3">
                               <label className="text-xs font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                  <Users className="w-4 h-4 text-red-600" /> Target Population
                               </label>
                               <div className="flex items-center gap-6 bg-black border border-gray-800 p-4 rounded-sm">
                                  <input 
                                    type="range" 
                                    min="1" 
                                    max="10" 
                                    value={victimCount} 
                                    onChange={(e) => setVictimCount(parseInt(e.target.value))}
                                    className="flex-1 accent-red-600 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                                  />
                                  <span className="text-xl font-mono text-red-500 w-8 text-center font-bold">{victimCount}</span>
                               </div>
                           </div>
                       ) : (
                          <div className="space-y-3">
                            <label className="text-xs font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <Image className="w-4 h-4" /> Visual Motif
                            </label>
                            <input 
                                type="text"
                                value={visualMotif}
                                onChange={(e) => setVisualMotif(e.target.value)}
                                placeholder="e.g. Grainy 8mm film, Neon Noir..."
                                className="w-full bg-black border border-gray-800 text-gray-200 p-5 font-mono text-base focus:border-system-green outline-none transition-all hover:bg-gray-900 rounded-sm"
                            />
                          </div>
                       )}
                   </div>
               </div>

               {/* ARCHITECT / CO-AUTHOR SECTION */}
               <div className="space-y-8 bg-haunt-gold/5 p-8 border border-haunt-gold/20 rounded-sm">
                   <div className="flex items-center justify-between border-b border-haunt-gold/10 pb-4">
                        <div className="flex items-center gap-4 text-haunt-gold font-mono text-sm uppercase tracking-[0.4em]">
                            <CloudLightning className="w-6 h-6 animate-pulse" /> Architect Matrix
                        </div>
                        <button 
                            onClick={toggleCoAuthorMode}
                            className="flex items-center gap-3 text-xs uppercase font-mono text-gray-400 hover:text-haunt-gold transition-colors py-2 px-4 border border-gray-800 hover:border-haunt-gold/40 rounded-sm bg-black/40"
                        >
                            <span>{coAuthorMode === 'Auto' ? 'Autonomous Synthesis' : 'Manual Assignment'}</span>
                            {coAuthorMode === 'Auto' ? <ToggleLeft className="w-6 h-6" /> : <ToggleRight className="w-6 h-6 text-haunt-gold" />}
                        </button>
                   </div>
                   
                   {coAuthorMode === 'Auto' ? (
                       <div className="text-sm font-mono text-gray-500 italic bg-black/40 p-6 rounded-sm border border-gray-800 leading-relaxed">
                           The Nightmare Machine will derive an Architect profile from the chosen cluster resonance. This persona will possess hidden motives and varying levels of narrative reliability.
                       </div>
                   ) : (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-fadeIn">
                            <div className="space-y-3">
                               <label className="text-xs font-mono text-gray-500 uppercase tracking-widest">Co-Author Persona</label>
                               <select 
                                 value={coAuthorArchetype} 
                                 onChange={(e) => setCoAuthorArchetype(e.target.value)}
                                 className="w-full bg-black border border-gray-800 text-gray-200 p-5 font-mono text-base focus:border-haunt-gold outline-none transition-all hover:bg-gray-900 appearance-none rounded-sm"
                               >
                                   <option value="The Archivist">The Archivist (Clinical/Cold)</option>
                                   <option value="The Director">The Director (Symphonic/Grand)</option>
                                   <option value="The Sadist">The Sadist (Direct/Cruel)</option>
                                   <option value="The Oracle">The Oracle (Prophetic/Distant)</option>
                                   <option value="The Glitch">The Glitch (Fractured/Unstable)</option>
                                   <option value="The Caretaker">The Caretaker (Gentle/Lies)</option>
                               </select>
                           </div>

                           <div className="space-y-3">
                               <label className="text-xs font-mono text-gray-500 uppercase tracking-widest">Matrix Dominance</label>
                               <div className="flex items-center gap-6 bg-black border border-gray-800 p-5 rounded-sm">
                                  <input 
                                    type="range" 
                                    min="0" 
                                    max="100" 
                                    value={coAuthorDominance} 
                                    onChange={(e) => setCoAuthorDominance(parseInt(e.target.value))}
                                    className="flex-1 accent-haunt-gold h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                                  />
                                  <span className="text-xl font-mono text-haunt-gold w-14 text-right font-bold">{coAuthorDominance}%</span>
                               </div>
                           </div>
                       </div>
                   )}
               </div>

               {/* SIMULATION DURATION (TURNS) */}
               <div className="space-y-8">
                 <div className="flex items-center gap-4 text-system-green font-mono text-sm uppercase tracking-[0.4em] border-b border-system-green/10 pb-4">
                     <Timer className="w-6 h-6" /> Simulation Cycles
                 </div>
                 <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
                    <div className="lg:col-span-3 flex items-center gap-10 bg-black/40 p-8 border border-gray-800 rounded-sm">
                        <input 
                          type="range" 
                          min="1" 
                          max="200" 
                          value={cycles} 
                          onChange={(e) => setCycles(parseInt(e.target.value))}
                          className="flex-1 accent-system-green h-3 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex flex-col items-center">
                          <span className="text-4xl font-mono text-system-green font-bold leading-none">{cycles}</span>
                          <span className="text-[10px] text-gray-600 uppercase tracking-widest mt-2">Iterative Turns</span>
                        </div>
                    </div>
                    <div className="bg-green-950/10 p-8 border border-system-green/20 rounded-sm flex flex-col justify-center h-full">
                       <p className="text-[10px] font-mono text-gray-500 uppercase leading-relaxed text-center">
                         Higher cycle counts allow for more profound character decay and complex narrative resolution.
                       </p>
                    </div>
                 </div>
               </div>

               {/* ACTION BUTTON */}
               <div className="pt-10 flex flex-col items-center">
                   <button
                      onClick={handleRun}
                      disabled={isSimulating}
                      className={`group relative w-full max-w-2xl py-8 font-mono font-bold uppercase tracking-[0.6em] text-2xl transition-all border-2
                        ${isSimulating 
                            ? 'bg-red-900/20 text-red-500 border-red-900 cursor-not-allowed animate-pulse' 
                            : 'bg-system-green text-black border-system-green hover:bg-green-400 hover:shadow-[0_0_60px_rgba(16,185,129,0.4)] active:scale-[0.98]'
                        } rounded-sm`}
                   >
                      <span className="relative z-10 flex items-center justify-center gap-6">
                        {isSimulating ? (
                          <>
                             <Activity className="w-10 h-10 animate-spin" />
                             PROCESSING SEQUENCE...
                          </>
                        ) : (
                          <>
                             <Play className="w-10 h-10 fill-black" />
                             INITIATE SIMULATION
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                   </button>
                   <p className="mt-8 text-xs font-mono text-gray-600 tracking-[0.4em] uppercase text-center opacity-60">
                      System will execute autonomously until terminal turn count or narrative collapse.
                   </p>
               </div>
            </div>
          )}

          {/* Analysis Report Output */}
          {simulationReport && (
            <div className="animate-fadeIn space-y-6">
                <div className="flex items-center gap-4 text-haunt-gold font-mono text-xl uppercase tracking-[0.4em] border-b border-haunt-gold/20 pb-4">
                    <Terminal className="w-8 h-8" />
                    Terminal Analysis Report
                </div>
                <div 
                  ref={reportRef}
                  className="bg-black border-2 border-gray-800 p-10 rounded-sm text-lg font-serif text-gray-300 whitespace-pre-wrap leading-[1.8] h-[500px] overflow-y-auto custom-scrollbar shadow-inner italic"
                >
                    {simulationReport}
                </div>
                <div className="flex justify-between items-center bg-black/40 p-6 border border-gray-800 rounded-sm">
                    <span className="text-xs font-mono text-gray-500 uppercase tracking-widest italic">Simulation Complete // Outcomes Recorded</span>
                    <button 
                        onClick={handleRun} 
                        className="py-4 px-10 bg-system-green text-black font-mono font-bold text-sm uppercase tracking-widest hover:bg-green-400 transition-all rounded-sm shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    >
                        Rerun Sequence
                    </button>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
