import React, { useState, useEffect, useRef } from 'react';
import { Bot, Play, Square, Activity, Terminal, X, Cpu, Settings, Users, Image, CloudLightning, ToggleLeft, ToggleRight, Eye, Zap, Layers, Timer, RefreshCw, Lock, AlertTriangle, FileText, Download, Target, Skull, Wand2, ArrowRightCircle, Hourglass } from 'lucide-react';
import { SimulationConfig, GameState, VillainState } from '../types';
import { runStressTest } from '../services/geminiService';
import { getDefaultLocationState } from '../services/locationEngine';

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunSimulation: (config: SimulationConfig, continueSession: boolean) => void;
  isTesting: boolean;
  simulationReport: string | null;
  initialPerspective?: string;
  initialMode?: string;
  initialStart?: string;
  initialCluster?: string;
  initialIntensity?: string;
  isSessionActive?: boolean;
  currentVillainState?: VillainState;
}

const INTENSITY_OPTIONS = [
  { id: 'Level 1', label: 'Level 1: The Uncanny' },
  { id: 'Level 2', label: 'Level 2: The Dread' },
  { id: 'Level 3', label: 'Level 3: The Visceral' },
  { id: 'Level 4', label: 'Level 4: The Grotesque' },
  { id: 'Level 5', label: 'Level 5: The Transgressive' },
];

const STARTING_POINT_OPTIONS = [
  { id: 'Prologue', label: 'Prologue' },
  { id: 'In Media Res', label: 'In Media Res' },
  { id: 'Climax', label: 'The Climax' },
];

export const SimulationModal: React.FC<SimulationModalProps> = ({ 
  isOpen, 
  onClose, 
  onRunSimulation, 
  isTesting: parentIsTesting,
  simulationReport: parentReport,
  initialPerspective = "First Person",
  initialMode = "Survivor",
  initialStart = "Prologue",
  initialCluster = "Flesh",
  initialIntensity = "Level 3",
  isSessionActive = false,
  currentVillainState
}) => {
  const [cycles, setCycles] = useState(5);
  const [perspective, setPerspective] = useState(initialPerspective);
  const [mode, setMode] = useState(initialMode);
  const [startingPoint, setStartingPoint] = useState(initialStart);
  const [cluster, setCluster] = useState(initialCluster);
  const [intensity, setIntensity] = useState(initialIntensity);
  const [victimCount, setVictimCount] = useState(3);
  const [visualMotif, setVisualMotif] = useState("");
  
  // Villain Fields
  const [villainName, setVillainName] = useState("");
  const [villainAppearance, setVillainAppearance] = useState("");
  const [villainMethods, setVillainMethods] = useState("");
  const [primaryGoal, setPrimaryGoal] = useState("");
  const [victimDescription, setVictimDescription] = useState("");

  const [continueSession, setContinueSession] = useState(false);
  
  // Stress Test Local State
  const [isStressMode, setIsStressMode] = useState(false);
  const [localStressRunning, setLocalStressRunning] = useState(false);
  const [stressLog, setStressLog] = useState("");
  const [currentStressCycle, setCurrentStressCycle] = useState(0);

  const reportRef = useRef<HTMLDivElement>(null);
  const stressLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
        // Only override defaults if they are valid strings
        if (initialPerspective && initialPerspective !== "Pending") setPerspective(initialPerspective);
        if (initialMode && initialMode !== "Pending") setMode(initialMode);
        if (initialStart && initialStart !== "Pending") setStartingPoint(initialStart);
        if (initialCluster && initialCluster !== "None") setCluster(initialCluster);
        
        if (initialIntensity && initialIntensity !== "PENDING") {
            const levelMatch = initialIntensity.match(/Level \d/);
            if (levelMatch) setIntensity(levelMatch[0]);
            else setIntensity(initialIntensity);
        }

        // Initialize Villain Settings
        if (currentVillainState) {
            setVillainName(currentVillainState.name || "");
            setVillainAppearance(currentVillainState.archetype || ""); 
            setPrimaryGoal(currentVillainState.primary_goal || "");
        }

        // Default to continue session if active
        if (isSessionActive) setContinueSession(true);
        else setContinueSession(false);
        
        // Reset stress state on open
        setStressLog("");
        setLocalStressRunning(false);
        setCurrentStressCycle(0);
        setCycles(5);
    }
  }, [isOpen, initialPerspective, initialMode, initialStart, initialCluster, initialIntensity, isSessionActive, currentVillainState]);

  useEffect(() => {
    if ((parentReport || stressLog) && (reportRef.current || stressLogRef.current)) {
        if (reportRef.current) reportRef.current.scrollTop = 0;
        if (stressLogRef.current) stressLogRef.current.scrollTop = stressLogRef.current.scrollHeight;
    }
  }, [parentReport, stressLog]);

  const handleRun = () => {
      onRunSimulation({
          perspective: perspective,
          mode: mode,
          starting_point: startingPoint,
          cluster: cluster,
          intensity: intensity.split(':')[0].trim(),
          cycles,
          victim_count: mode === 'Villain' ? victimCount : undefined,
          visual_motif: visualMotif,
          villain_name: villainName,
          villain_appearance: villainAppearance,
          villain_methods: villainMethods,
          primary_goal: primaryGoal,
          victim_description: victimDescription
      }, continueSession);
  };

  const handleStressTest = async () => {
    setLocalStressRunning(true);
    setCurrentStressCycle(0);
    setStressLog(`INITIALIZING DIAGNOSTIC...\nTARGET CYCLES: ${cycles}\nCLUSTER: ${cluster}\nINTENSITY: ${intensity}\n---\n`);
    
    const config: SimulationConfig = {
      perspective,
      mode,
      starting_point: startingPoint,
      cluster,
      intensity: intensity.split(':')[0].trim(),
      cycles, // Pass the loop count explicitly
      visual_motif: visualMotif,
      villain_name: villainName,
      primary_goal: primaryGoal
    };

    // Construct a basic initial state for the stress test (bypassing App initialization)
    const initialState: GameState = {
       meta: { 
         turn: 0, 
         perspective, 
         mode: mode as 'Survivor' | 'Villain' | 'Pending', 
         intensity_level: config.intensity, 
         active_cluster: config.cluster 
       },
       villain_state: { name: villainName || "Test Entity", archetype: villainAppearance || "Stress Test Construct", threat_scale: 0, primary_goal: primaryGoal || "Validation", current_tactic: "None" },
       npc_states: [],
       location_state: getDefaultLocationState(),
       narrative: { visual_motif: visualMotif, illustration_request: null }
    };

    try {
        await runStressTest(config, initialState, (log, cycle) => {
            setStressLog(log);
            setCurrentStressCycle(cycle);
        });
    } catch (e) {
        setStressLog(prev => prev + `\nFATAL EXECUTION ERROR: ${e}`);
    } finally {
        setLocalStressRunning(false);
    }
  };

  const handleDownloadReport = () => {
      const element = document.createElement("a");
      const file = new Blob([stressLog], {type: 'text/markdown'});
      element.href = URL.createObjectURL(file);
      element.download = `nightmare_stress_report_${Date.now()}.md`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/95 z-[350] flex items-center justify-center p-6 backdrop-blur-md">
      <div className={`bg-terminal border-2 ${isStressMode ? 'border-red-600/60 shadow-[0_0_100px_rgba(220,20,60,0.2)]' : 'border-amber-500/40 shadow-[0_0_100px_rgba(245,158,11,0.1)]'} max-w-5xl w-full rounded-sm flex flex-col max-h-[90vh] relative overflow-hidden animate-fadeIn transition-colors duration-500`}>
        
        {/* Header Bar */}
        <div className={`h-1 ${isStressMode ? 'bg-red-600/30' : 'bg-amber-500/20'} relative overflow-hidden flex-shrink-0`}>
          <div className={`absolute inset-0 ${isStressMode ? 'bg-red-600' : 'bg-amber-500'} w-1/3 animate-[scanline_3s_linear_infinite]`} />
        </div>

        {/* Title Section */}
        <div className={`p-6 border-b ${isStressMode ? 'border-red-600/20 bg-red-950/20' : 'border-amber-500/20 bg-amber-950/10'} flex justify-between items-center`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-sm border ${isStressMode ? 'bg-red-600/10 border-red-600/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
              {isStressMode ? <AlertTriangle className="w-8 h-8 text-red-600 animate-pulse" /> : <Cpu className="w-8 h-8 text-amber-500 animate-pulse" />}
            </div>
            <div>
              <h2 className={`font-mono text-2xl font-bold tracking-[0.2em] uppercase ${isStressMode ? 'text-red-600' : 'text-amber-500'}`}>
                {isStressMode ? 'STRESS TEST PROTOCOL' : 'TEST CALIBRATION'}
              </h2>
              <p className="text-[10px] font-mono text-gray-500 tracking-[0.4em] uppercase mt-1">
                {isStressMode ? 'Self-Diagnostic Failure Analysis' : 'Game State Re-Calibration // Manual Reset'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-600 hover:text-white hover:bg-white/5 transition-all rounded-sm">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar space-y-10">
          
          {/* Mode Switcher */}
          {!localStressRunning && !parentIsTesting && (
              <div className="flex justify-center border-b border-gray-800 pb-8">
                  <div className="flex bg-black border border-gray-700 rounded-sm p-1">
                      <button 
                        onClick={() => setIsStressMode(false)}
                        className={`px-6 py-2 text-xs font-mono font-bold uppercase tracking-widest rounded-sm transition-all ${!isStressMode ? 'bg-amber-500 text-black' : 'text-gray-500 hover:text-white'}`}
                      >
                          Sequence Calibration
                      </button>
                      <button 
                        onClick={() => setIsStressMode(true)}
                        className={`px-6 py-2 text-xs font-mono font-bold uppercase tracking-widest rounded-sm transition-all ${isStressMode ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}
                      >
                          Stress Loop
                      </button>
                  </div>
              </div>
          )}

          {/* Settings Section (Shared) */}
          {(!parentReport && !stressLog) && (
            <div className="space-y-12 animate-fadeIn">
               {/* Parameter Controls */}
               <div className="space-y-6">
                    <div className={`flex items-center gap-4 ${isStressMode ? 'text-red-600 border-red-600/20' : 'text-amber-500 border-amber-500/10'} font-mono text-xs uppercase tracking-[0.4em] border-b pb-3`}>
                        <Settings className="w-4 h-4" /> Parameters
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <Eye className="w-3 h-3" /> Perspective
                            </label>
                            <select value={perspective} onChange={(e) => setPerspective(e.target.value)} className="w-full bg-black border border-gray-800 text-gray-200 p-3 text-xs font-mono focus:border-gray-600 outline-none transition-all rounded-sm appearance-none">
                                <option value="First Person">First Person (Direct)</option>
                                <option value="Third Person">Third Person (Cinematic)</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <Users className="w-3 h-3" /> Role
                            </label>
                            <select value={mode} onChange={(e) => setMode(e.target.value)} className="w-full bg-black border border-gray-800 text-gray-200 p-3 text-xs font-mono focus:border-gray-600 outline-none transition-all rounded-sm appearance-none">
                                <option value="Survivor">The Survivor</option>
                                <option value="Villain">The Antagonist</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <Zap className="w-3 h-3" /> Fidelity
                            </label>
                            <select value={intensity} onChange={(e) => setIntensity(e.target.value)} className="w-full bg-black border border-gray-800 text-gray-200 p-3 text-xs font-mono focus:border-gray-600 outline-none transition-all rounded-sm appearance-none">
                                {INTENSITY_OPTIONS.map(opt => (
                                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                         <div className="space-y-2">
                            <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <Hourglass className="w-3 h-3" /> Entry Point
                            </label>
                            <select value={startingPoint} onChange={(e) => setStartingPoint(e.target.value)} className="w-full bg-black border border-gray-800 text-gray-200 p-3 text-xs font-mono focus:border-gray-600 outline-none transition-all rounded-sm appearance-none">
                                {STARTING_POINT_OPTIONS.map(opt => (
                                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
               </div>

               {/* Villain specific fields */}
               {mode === 'Villain' && (
                 <div className="space-y-6 animate-fadeIn">
                     <div className={`flex items-center gap-4 text-red-500 border-red-500/20 font-mono text-xs uppercase tracking-[0.4em] border-b pb-3`}>
                         <Target className="w-4 h-4" /> Antagonist Configuration
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                             <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Entity Name</label>
                             <input type="text" value={villainName} onChange={e => setVillainName(e.target.value)} className="w-full bg-black border border-gray-800 p-3 text-xs font-mono text-gray-200 focus:border-red-600 outline-none rounded-sm" placeholder="Name..." />
                        </div>
                         <div className="space-y-2">
                             <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Primary Objective</label>
                             <input type="text" value={primaryGoal} onChange={e => setPrimaryGoal(e.target.value)} className="w-full bg-black border border-gray-800 p-3 text-xs font-mono text-gray-200 focus:border-red-600 outline-none rounded-sm" placeholder="Goal..." />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                             <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Form & Appearance</label>
                             <textarea value={villainAppearance} onChange={e => setVillainAppearance(e.target.value)} className="w-full bg-black border border-gray-800 p-3 text-xs font-mono text-gray-200 focus:border-red-600 outline-none rounded-sm resize-none h-20" placeholder="Physical description..." />
                        </div>
                        <div className="space-y-2">
                             <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Methods</label>
                             <textarea value={villainMethods} onChange={e => setVillainMethods(e.target.value)} className="w-full bg-black border border-gray-800 p-3 text-xs font-mono text-gray-200 focus:border-red-600 outline-none rounded-sm resize-none h-20" placeholder="Modus operandi..." />
                        </div>
                        <div className="space-y-2">
                             <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Victim Profile</label>
                             <textarea value={victimDescription} onChange={e => setVictimDescription(e.target.value)} className="w-full bg-black border border-gray-800 p-3 text-xs font-mono text-gray-200 focus:border-red-600 outline-none rounded-sm resize-none h-20" placeholder="Who are they?" />
                        </div>
                     </div>
                 </div>
               )}

               {/* Loop Count Section - Only relevant for Stress Mode or if we interpret it as 'Game Length' */}
               {isStressMode && (
                   <div className="space-y-6">
                     <div className={`flex items-center gap-4 text-red-600 border-red-600/20 font-mono text-xs uppercase tracking-[0.4em] border-b pb-3`}>
                         <Timer className="w-4 h-4" /> Diagnostic Cycles
                     </div>
                     <div className="p-8 bg-black/40 border border-gray-800 rounded-sm flex flex-col items-center gap-6">
                        <p className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em] text-center max-w-md">
                            "Stress Mode" runs rapid simulation cycles to induce systemic failure. Expect high API usage.
                        </p>
                        <div className="flex items-center gap-10 w-full">
                            <input 
                                type="range" 
                                min="1" 
                                max="20" 
                                value={cycles} 
                                onChange={(e) => setCycles(parseInt(e.target.value))} 
                                className={`flex-1 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-600`} 
                            />
                            <div className="flex flex-col items-center min-w-[80px]">
                                <span className={`text-5xl font-mono font-bold leading-none text-red-600`}>{cycles}</span>
                                <span className="text-[9px] text-gray-600 uppercase tracking-widest mt-2">Loops</span>
                            </div>
                        </div>
                     </div>
                   </div>
               )}

               <div className="pt-4 flex flex-col items-center space-y-6">
                   {isStressMode ? (
                        <button 
                            onClick={handleStressTest} 
                            disabled={localStressRunning} 
                            className={`group relative w-full max-w-xl py-6 font-mono font-bold uppercase tracking-[0.5em] text-xl transition-all border-2 rounded-sm 
                                ${localStressRunning ? 'bg-red-900/20 text-red-500 border-red-900 cursor-wait' : 'bg-red-600 text-white border-red-600 hover:bg-red-500 active:scale-[0.98]'}`}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-4">
                                {localStressRunning ? <><Activity className="w-6 h-6 animate-spin" /> STRESSING SYSTEM...</> : <><AlertTriangle className="w-6 h-6" /> INITIATE STRESS LOOP</>}
                            </span>
                        </button>
                   ) : (
                        <div className="w-full max-w-xl space-y-4">
                            {isSessionActive && (
                                <button 
                                    onClick={() => setContinueSession(!continueSession)}
                                    className={`w-full p-4 border rounded-sm flex items-center justify-between transition-all ${continueSession ? 'border-green-500/50 bg-green-900/10' : 'border-gray-800 bg-black'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <ArrowRightCircle className={`w-5 h-5 ${continueSession ? 'text-green-500' : 'text-gray-500'}`} />
                                        <div className="text-left">
                                            <div className={`text-xs font-mono font-bold uppercase tracking-widest ${continueSession ? 'text-green-500' : 'text-gray-400'}`}>Continue Current Session</div>
                                            <div className="text-[10px] text-gray-600">Apply parameters without resetting story</div>
                                        </div>
                                    </div>
                                    <div className={`w-3 h-3 rounded-full ${continueSession ? 'bg-green-500' : 'bg-gray-800'}`} />
                                </button>
                            )}
                        
                            <button 
                                onClick={handleRun} 
                                disabled={parentIsTesting} 
                                className={`group relative w-full py-6 font-mono font-bold uppercase tracking-[0.5em] text-xl transition-all border-2 rounded-sm 
                                    ${parentIsTesting ? 'bg-amber-900/20 text-amber-500 border-amber-900 cursor-not-allowed' : 'bg-amber-500 text-black border-amber-500 hover:bg-amber-400 active:scale-[0.98]'}`}
                            >
                                <span className="relative z-10 flex items-center justify-center gap-4">
                                    <Play className="w-6 h-6 fill-black" /> {continueSession ? 'INJECT PARAMETERS' : 'RE-CALIBRATE GAME'}
                                </span>
                            </button>
                        </div>
                   )}
               </div>
            </div>
          )}

          {/* Stress Log View */}
          {isStressMode && stressLog && (
            <div className="animate-fadeIn space-y-6 h-full flex flex-col">
                <div className="flex items-center justify-between text-red-600 font-mono text-lg uppercase tracking-[0.4em] border-b border-red-600/20 pb-3">
                    <div className="flex items-center gap-4">
                        <Activity className={`w-6 h-6 ${localStressRunning ? 'animate-spin' : ''}`} /> 
                        {localStressRunning ? `Stress Testing (Cycle ${currentStressCycle}/${cycles})` : 'Diagnostic Complete'}
                    </div>
                    {!localStressRunning && (
                        <button onClick={handleDownloadReport} className="text-xs flex items-center gap-2 hover:text-white transition-colors">
                            <Download className="w-4 h-4" /> Export Report
                        </button>
                    )}
                </div>
                <div ref={stressLogRef} className="bg-black border-2 border-gray-800 p-6 rounded-sm h-[400px] overflow-y-auto custom-scrollbar shadow-inner flex-1">
                     <pre className="font-mono text-xs text-green-500 whitespace-pre-wrap leading-relaxed">
                        {stressLog}
                     </pre>
                </div>
                <div className="flex justify-center pt-4 gap-4">
                    {localStressRunning ? (
                         <div className="text-red-500 animate-pulse font-mono text-xs uppercase tracking-widest">System under load... Do not close.</div>
                    ) : (
                        <button 
                            onClick={() => setStressLog("")} 
                            className="px-10 py-3 border border-red-600 text-red-600 font-bold uppercase font-mono tracking-widest text-sm rounded-sm hover:bg-red-600 hover:text-white transition-colors"
                        >
                            Reset Diagnostic
                        </button>
                    )}
                </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};