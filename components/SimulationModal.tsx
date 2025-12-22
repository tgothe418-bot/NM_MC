
import React, { useState, useEffect, useRef } from 'react';
import { Bot, Play, Square, Activity, Terminal, X, Cpu, Settings, Users, Image, CloudLightning, ToggleLeft, ToggleRight, Eye, Zap, Layers, Timer, RefreshCw, Lock } from 'lucide-react';
import { SimulationConfig } from '../types';

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunSimulation: (config: SimulationConfig) => void;
  isTesting: boolean;
  simulationReport: string | null;
  initialPerspective?: string;
  initialMode?: string;
  initialStart?: string;
  initialCluster?: string;
  initialIntensity?: string;
  isSessionActive?: boolean;
}

const INTENSITY_OPTIONS = [
  { id: 'Level 1', label: 'Level 1: The Uncanny' },
  { id: 'Level 2', label: 'Level 2: The Dread' },
  { id: 'Level 3', label: 'Level 3: The Visceral' },
  { id: 'Level 4', label: 'Level 4: The Grotesque' },
  { id: 'Level 5', label: 'Level 5: The Transgressive' },
];

export const SimulationModal: React.FC<SimulationModalProps> = ({ 
  isOpen, 
  onClose, 
  onRunSimulation, 
  isTesting,
  simulationReport,
  initialPerspective = "First Person",
  initialMode = "Survivor",
  initialStart = "Prologue",
  initialCluster = "Flesh",
  initialIntensity = "Level 3",
  isSessionActive = false
}) => {
  const [cycles, setCycles] = useState(10);
  const [perspective, setPerspective] = useState(initialPerspective);
  const [mode, setMode] = useState(initialMode);
  const [startingPoint, setStartingPoint] = useState(initialStart);
  const [cluster, setCluster] = useState(initialCluster);
  const [intensity, setIntensity] = useState(initialIntensity);
  const [victimCount, setVictimCount] = useState(5);
  const [visualMotif, setVisualMotif] = useState("");

  const [useLiveSettings, setUseLiveSettings] = useState(isSessionActive);

  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
        if (initialPerspective && initialPerspective !== "Pending") setPerspective(initialPerspective);
        if (initialMode && initialMode !== "Pending") setMode(initialMode);
        if (initialStart && initialStart !== "Pending") setStartingPoint(initialStart);
        if (initialCluster && initialCluster !== "None") setCluster(initialCluster);
        if (initialIntensity && initialIntensity !== "PENDING") {
            if (initialIntensity === "Atmospheric") setIntensity("Level 1");
            else if (initialIntensity === "Visceral") setIntensity("Level 3");
            else if (initialIntensity === "Extreme") setIntensity("Level 5");
            else setIntensity(initialIntensity);
        }
        setUseLiveSettings(isSessionActive);
    }
  }, [isOpen, initialPerspective, initialMode, initialStart, initialCluster, initialIntensity, isSessionActive]);

  useEffect(() => {
    if (simulationReport && reportRef.current) {
        reportRef.current.scrollTop = 0;
    }
  }, [simulationReport]);

  const handleRun = () => {
      onRunSimulation({
          perspective: useLiveSettings ? initialPerspective : perspective,
          mode: useLiveSettings ? initialMode : mode,
          starting_point: useLiveSettings ? initialStart : startingPoint,
          cluster: useLiveSettings ? initialCluster : cluster,
          intensity: (useLiveSettings ? initialIntensity : intensity).split(':')[0].trim(),
          cycles,
          victim_count: mode === 'Villain' ? victimCount : undefined,
          visual_motif: visualMotif
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/95 z-[150] flex items-center justify-center p-6 backdrop-blur-md">
      <div className="bg-terminal border-2 border-amber-500/40 max-w-5xl w-full rounded-sm shadow-[0_0_100px_rgba(245,158,11,0.1)] flex flex-col max-h-[90vh] relative overflow-hidden animate-fadeIn">
        
        <div className="h-1 bg-amber-500/20 relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-amber-500 w-1/3 animate-[scanline_3s_linear_infinite]" />
        </div>

        <div className="p-6 border-b border-amber-500/20 flex justify-between items-center bg-amber-950/10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-sm border border-amber-500/30">
              <Cpu className="w-8 h-8 text-amber-500 animate-pulse" />
            </div>
            <div>
              <h2 className="font-mono text-2xl font-bold tracking-[0.2em] uppercase text-amber-500">
                TEST PROTOCOL
              </h2>
              <p className="text-[10px] font-mono text-gray-500 tracking-[0.4em] uppercase mt-1">Autonomous Diagnostic Execution // Sequence Testing</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-600 hover:text-white hover:bg-white/5 transition-all rounded-sm">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar space-y-10">
          {isSessionActive && (
            <div className="bg-amber-500/5 border border-amber-500/30 p-5 flex items-center justify-between rounded-sm">
                <div className="flex items-center gap-4">
                    <RefreshCw className="w-5 h-5 text-amber-500 animate-spin-slow" />
                    <div>
                        <p className="text-xs font-mono text-amber-500 font-bold tracking-widest uppercase">Live Session Tethered</p>
                        <p className="text-[10px] font-mono text-gray-500 uppercase mt-0.5">Test will proceed from active game state</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-black border border-gray-800 text-[9px] font-mono text-gray-400 uppercase rounded-sm flex items-center gap-2">
                        <Lock className="w-3 h-3" /> {initialCluster}
                    </span>
                    <span className="px-3 py-1 bg-black border border-gray-800 text-[9px] font-mono text-gray-400 uppercase rounded-sm flex items-center gap-2">
                        <Lock className="w-3 h-3" /> {initialIntensity}
                    </span>
                </div>
            </div>
          )}

          {!simulationReport && (
            <div className="space-y-12">
               {!isSessionActive && (
                 <div className="space-y-6">
                    <div className="flex items-center gap-4 text-amber-500 font-mono text-xs uppercase tracking-[0.4em] border-b border-amber-500/10 pb-3">
                        <Settings className="w-4 h-4" /> Parameters
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <Eye className="w-3 h-3" /> Perspective
                            </label>
                            <select value={perspective} onChange={(e) => setPerspective(e.target.value)} className="w-full bg-black border border-gray-800 text-gray-200 p-3 text-xs font-mono focus:border-amber-500 outline-none transition-all rounded-sm appearance-none">
                                <option value="First Person">First Person (Direct)</option>
                                <option value="Third Person">Third Person (Cinematic)</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <Users className="w-3 h-3" /> Role
                            </label>
                            <select value={mode} onChange={(e) => setMode(e.target.value)} className="w-full bg-black border border-gray-800 text-gray-200 p-3 text-xs font-mono focus:border-amber-500 outline-none transition-all rounded-sm appearance-none">
                                <option value="Survivor">The Survivor</option>
                                <option value="Villain">The Antagonist</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <Zap className="w-3 h-3" /> Fidelity
                            </label>
                            <select value={intensity} onChange={(e) => setIntensity(e.target.value)} className="w-full bg-black border border-gray-800 text-gray-200 p-3 text-xs font-mono focus:border-amber-500 outline-none transition-all rounded-sm appearance-none">
                                {INTENSITY_OPTIONS.map(opt => (
                                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                 </div>
               )}

               <div className="space-y-6">
                 <div className="flex items-center gap-4 text-amber-500 font-mono text-xs uppercase tracking-[0.4em] border-b border-amber-500/10 pb-3">
                     <Timer className="w-4 h-4" /> Test Duration
                 </div>
                 <div className="p-8 bg-black/40 border border-gray-800 rounded-sm flex flex-col items-center gap-6">
                    <p className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em] text-center max-w-md">
                        Autonomous test mode is meant for sequence analysis. Manual control is suspended during the test.
                    </p>
                    <div className="flex items-center gap-10 w-full">
                        <input 
                            type="range" 
                            min="1" 
                            max="50" 
                            value={cycles} 
                            onChange={(e) => setCycles(parseInt(e.target.value))} 
                            className="flex-1 accent-amber-500 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer" 
                        />
                        <div className="flex flex-col items-center min-w-[80px]">
                            <span className="text-5xl font-mono text-amber-500 font-bold leading-none">{cycles}</span>
                            <span className="text-[9px] text-gray-600 uppercase tracking-widest mt-2">Cycles</span>
                        </div>
                    </div>
                 </div>
               </div>

               <div className="pt-4 flex flex-col items-center">
                   <button onClick={handleRun} disabled={isTesting} className={`group relative w-full max-w-xl py-6 font-mono font-bold uppercase tracking-[0.5em] text-xl transition-all border-2 rounded-sm ${isTesting ? 'bg-red-900/20 text-red-500 border-red-900 cursor-not-allowed' : 'bg-amber-500 text-black border-amber-500 hover:bg-amber-400 active:scale-[0.98]'}`}>
                      <span className="relative z-10 flex items-center justify-center gap-4">
                        {isTesting ? <><Activity className="w-6 h-6 animate-spin" /> SEQUENCE ACTIVE</> : <><Play className="w-6 h-6 fill-black" /> INITIATE TEST SEQUENCE</>}
                      </span>
                   </button>
                   <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest mt-4">
                       Tests can be aborted via the status panel at any time.
                   </p>
               </div>
            </div>
          )}

          {simulationReport && (
            <div className="animate-fadeIn space-y-6">
                <div className="flex items-center gap-4 text-haunt-gold font-mono text-lg uppercase tracking-[0.4em] border-b border-haunt-gold/20 pb-3">
                    <Terminal className="w-6 h-6" /> Test Sequence Analysis
                </div>
                <div ref={reportRef} className="bg-black border-2 border-gray-800 p-8 rounded-sm text-base font-serif text-gray-300 whitespace-pre-wrap leading-[1.8] h-[400px] overflow-y-auto custom-scrollbar shadow-inner italic">
                    {simulationReport}
                </div>
                <div className="flex justify-center pt-4">
                    <button 
                        onClick={() => { onClose(); }} 
                        className="px-10 py-3 bg-haunt-gold text-black font-bold uppercase font-mono tracking-widest text-sm rounded-sm hover:bg-amber-400 transition-colors"
                    >
                        Exit Test Diagnostic
                    </button>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
