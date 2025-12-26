import React, { useState, useEffect, useRef } from 'react';
import { StatusPanel } from './components/StatusPanel';
import { StoryLog } from './components/StoryLog';
import { InputArea } from './components/InputArea';
import { ClusterAmbience } from './components/ClusterAmbience';
import { SimulationModal } from './components/SimulationModal';
import { SetupOverlay } from './components/SetupOverlay';
import { WelcomeScreen } from './components/WelcomeScreen';
import { sendMessageToGemini, initializeGemini, generateAutoPlayerAction, generateSimulationAnalysis, generateHorrorImage, generateCinematicVideo, generateNpcActions, simulateTurn, generateCalibrationField } from './services/geminiService';
import { GameState, ChatMessage, SimulationConfig, NpcState } from './types';
import { constructVoiceManifesto } from './services/dialogueEngine';
import { constructSensoryManifesto } from './services/sensoryEngine';
import { constructLocationManifesto, getDefaultLocationState, constructRoomGenerationRules } from './services/locationEngine';
import { createNpcFactory } from './services/npcGenerator';
import { Terminal, Lock, Key, Activity } from 'lucide-react';

const INITIAL_STATE: GameState = {
  meta: { turn: 0, perspective: "Pending", mode: 'Pending', intensity_level: "Level 1", active_cluster: "None" },
  villain_state: { name: "Unknown", archetype: "Unknown", threat_scale: 0, primary_goal: "Dormant", current_tactic: "Dormant" },
  npc_states: [],
  location_state: getDefaultLocationState(),
  narrative: { visual_motif: "", illustration_request: null }
};

const App: React.FC = () => {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [isSplashComplete, setIsSplashComplete] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showKeySelection, setShowKeySelection] = useState(true);

  // Auto-Pilot State
  const [autoMode, setAutoMode] = useState<{ active: boolean; remainingCycles: number }>({
    active: false,
    remainingCycles: 0
  });

  // Simulation Modal State
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [simulationReport, setSimulationReport] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      const has = await (window as any).aistudio.hasSelectedApiKey();
      if (has) { setShowKeySelection(false); initializeGemini(); }
    };
    check();
  }, []);

  const handleSelectKey = async () => {
    await (window as any).aistudio.openSelectKey();
    setShowKeySelection(false);
    initializeGemini();
  };

  const handleWelcomeComplete = () => {
    setIsSplashComplete(true);
  };

  // --- AUTO-PILOT LOGIC ---
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const runAutoTurn = async () => {
      if (autoMode.active && autoMode.remainingCycles > 0 && !isLoading && isInitialized) {
        // Delay slightly for realism/pacing
        timeoutId = setTimeout(async () => {
          try {
            // Generate action based on current state
            const action = await generateAutoPlayerAction(gameState);
            if (action) {
              // Feed action into the main loop
              await handleSendMessage(`[AUTO-ACTION]: ${action}`);
              // Decrement counter
              setAutoMode(prev => ({ ...prev, remainingCycles: prev.remainingCycles - 1 }));
            }
          } catch (e) {
            console.error("Auto-Pilot Failed:", e);
            setAutoMode({ active: false, remainingCycles: 0 }); // Abort on error
          }
        }, 3000); // 3-second delay between turns
      } else if (autoMode.active && autoMode.remainingCycles <= 0) {
        setAutoMode({ active: false, remainingCycles: 0 });
      }
    };

    runAutoTurn();

    return () => clearTimeout(timeoutId);
  }, [autoMode, isLoading, isInitialized, gameState]); // Re-run when state settles

  const handleSendMessage = async (text: string, isInitial = false, stateOverride?: GameState): Promise<string> => {
    setIsLoading(true);
    if (!isInitial) setHistory(prev => [...prev, { role: 'user', text, timestamp: Date.now() }]);

    // Use override if provided, otherwise current state
    const currentState = stateOverride || gameState;

    try {
      // Pass 0: NPC Agency (with fallback)
      let npcActions: string[] = [];
      try {
        // We must use currentState here to ensure initial conditions are respected
        npcActions = await generateNpcActions(currentState, text);
      } catch (err) {
        console.warn("NPC Agency skipped due to error:", err);
      }

      // Pass 1: Simulation
      let simulated = await simulateTurn(currentState, text, npcActions);
      
      // Pass 1.5: Room Enrichment
      // If the user moved to a new room, we ensure the description is rich and cluster-specific.
      const prevRoomId = currentState.location_state.current_room_id;
      const currRoomId = simulated.location_state.current_room_id;
      
      if (currRoomId !== prevRoomId) {
          const room = simulated.location_state.room_map[currRoomId];
          // We check if it needs enrichment (always enrich new rooms for high fidelity)
          if (room) {
              const generationRules = constructRoomGenerationRules(simulated);
              try {
                const enrichedDesc = await generateCalibrationField(
                    "Atmospheric Description",
                    simulated.meta.active_cluster,
                    simulated.meta.intensity_level,
                    undefined,
                    `Describe the location "${room.name}".\nCONTEXT: ${generationRules}.\nCURRENT DRAFT: ${room.description_cache || "None"}`
                );
                
                if (enrichedDesc) {
                    simulated.location_state.room_map[currRoomId] = {
                        ...room,
                        description_cache: enrichedDesc
                    };
                }
              } catch (e) {
                console.warn("Room enrichment failed, using default:", e);
              }
          }
      }

      const voiceM = constructVoiceManifesto(simulated.npc_states);
      const sensoryM = constructSensoryManifesto(simulated);
      const locationM = constructLocationManifesto(simulated.location_state);
      
      // Pass 2: Narration
      // Note: sendMessageToGemini internally handles the JSON schema correction for rooms array
      const responseText = await sendMessageToGemini(text, simulated, voiceM + sensoryM + locationM);
      const parsed = JSON.parse(responseText);
      
      const nextState = {
        ...parsed.game_state,
        location_state: {
          ...parsed.game_state.location_state,
          // Merge map from simulated state with updates from narrator
          room_map: { 
              ...simulated.location_state.room_map, 
              ...(parsed.game_state.location_state.room_map || {}) 
          }
        }
      };

      setGameState(nextState);
      setHistory(prev => [...prev, { role: 'model', text: parsed.story_text, timestamp: Date.now() }]);
      return parsed.story_text;
    } catch (e) {
      console.error(e);
      return "The connection fails.";
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupComplete = async (config: SimulationConfig) => {
    setIsInitialized(true);

    // If auto-pilot cycles are requested, initialize the auto mode state
    if (config.cycles > 0) {
      setAutoMode({
        active: true,
        remainingCycles: config.cycles
      });
    }

    // Determine pacing vars based on starting_point
    let startTurn = 1;
    let startThreat = 1;
    let pacingInstruction = "PACING: SLOW BURN. Establish atmosphere before threat.";

    if (config.starting_point === 'In Media Res') {
        startTurn = 20;
        startThreat = 3;
        pacingInstruction = "PACING: IMMEDIATE ACTION. The user is already in danger. Bypass introductions. The threat is active and present.";
    } else if (config.starting_point === 'Climax') {
        startTurn = 45;
        startThreat = 5;
        pacingInstruction = "PACING: CLIMAX. The end is here. High stakes, immediate confrontation. Maximum intensity. No buildup.";
    }
    
    // CONSTRUCT INITIAL STATE FROM CONFIG
    // This ensures fidelity from Turn 0 by passing the configured state directly to the simulator
    // instead of relying on generic defaults or prompts alone.
    
    // 1. Location
    const initialLocation = getDefaultLocationState(config.cluster);
    if (config.location_description) {
        const startRoomId = initialLocation.current_room_id;
        initialLocation.room_map[startRoomId].description_cache = config.location_description;
        initialLocation.room_map[startRoomId].name = "Starting Location";
    }

    // 2. Villain
    const initialVillainState = {
        name: config.villain_name || "Unknown Entity",
        archetype: config.villain_appearance || "Unknown Archetype",
        threat_scale: startThreat,
        primary_goal: config.primary_goal || "Unknown",
        current_tactic: config.villain_methods || "Dormant"
    };

    // 3. Generate NPCs (Client-Side)
    let initialNpcs: NpcState[] = [];
    if (config.mode === 'Villain' && config.victim_count) {
        // First one uses the description (The "Hero" / Focus)
        if (config.victim_description) {
            initialNpcs.push(await createNpcFactory(config.cluster, config.intensity, config.victim_description));
        } else {
            initialNpcs.push(await createNpcFactory(config.cluster, config.intensity));
        }
        
        // The rest are procedural fillers
        for (let i = 1; i < (config.victim_count || 1); i++) {
            initialNpcs.push(await createNpcFactory(config.cluster, config.intensity));
        }
    }

    // 4. Meta & Narrative
    const initialMeta = {
        turn: startTurn,
        perspective: config.perspective,
        mode: config.mode as any,
        intensity_level: config.intensity,
        active_cluster: config.cluster
    };
    
    const initialNarrative = {
        visual_motif: config.visual_motif || "",
        illustration_request: null
    };

    const initialState: GameState = {
        ...INITIAL_STATE,
        meta: initialMeta,
        villain_state: initialVillainState,
        location_state: initialLocation,
        narrative: initialNarrative,
        npc_states: initialNpcs // Simulator will see these immediately
    };

    setGameState(initialState);
    
    // Construct Prompt
    let startPrompt = `INITIALIZE SIMULATION.
    [CONFIGURATION]
    - Mode: ${config.mode}
    - Perspective: ${config.perspective}
    - Theme: ${config.cluster} (${config.intensity})
    - Visual Style: ${config.visual_motif || "Standard"}
    - Starting Location: ${config.location_description || "Standard"}
    - Temporal Point: ${config.starting_point} (Start at Turn ${startTurn})
    
    ${pacingInstruction}
    `;

    if (config.mode === 'Villain') {
        startPrompt += `
    [ANTAGONIST SETUP]
    - Name: ${config.villain_name}
    - Goal: ${config.primary_goal}
    - Methods: ${config.villain_methods}
    
    [ACTIVE SUBJECTS]:
    ${JSON.stringify(initialNpcs.map(n => ({ name: n.name, archetype: n.archetype, origin: n.background_origin })))}

    DIRECTIVE: These subjects are present in the starting location. Initiate the narrative.
        `;
    } else {
        startPrompt += `
    [SURVIVAL SETUP]
    - Threat: ${config.villain_name || "Hidden"}
    
    DIRECTIVE: Establish the atmosphere. The threat is present but maybe not yet visible.
        `;
    }

    // Pass the fully constructed initial state to the engine
    await handleSendMessage(startPrompt, true, initialState);
  };

  // --- Modal & Test Handlers ---

  const handleOpenSimulation = () => {
    setIsSimulationModalOpen(true);
  };

  const handleCloseSimulation = () => {
    setIsSimulationModalOpen(false);
  };

  const handleRunSimulationFromModal = async (config: SimulationConfig, continueSession: boolean = false) => {
    setIsSimulationModalOpen(false);

    if (continueSession) {
         // Update meta-state locally first to reflect changes immediately
         setGameState(prev => ({
             ...prev,
             meta: {
                 ...prev.meta,
                 perspective: config.perspective,
                 mode: config.mode as any,
                 intensity_level: config.intensity,
                 active_cluster: config.cluster
             }
         }));

         // Inject into current session
         const updatePrompt = `
SYSTEM OVERRIDE: PARAMETER RE-CALIBRATION
[NEW CONFIGURATION]:
- Perspective: ${config.perspective}
- Mode: ${config.mode}
- Intensity: ${config.intensity}
- Cluster: ${config.cluster}
- Temporal Adjustment: ${config.starting_point}
${config.mode === 'Villain' ? `
- Villain Identity: ${config.villain_name || "Unchanged"}
- Goal: ${config.primary_goal || "Unchanged"}
- Methods: ${config.villain_methods || "Unchanged"}
` : ''}

DIRECTIVE: Acknowledge these changes and seamlessly integrate them into the ongoing narrative. 
If the Mode changed (e.g., to Villain), shift the narrative voice immediately.
         `;
         await handleSendMessage(updatePrompt, false);
    } else {
        // Reset Standard
        setHistory([]);
        setIsInitialized(true);
        setAutoMode({ active: false, remainingCycles: 0 }); // Reset auto mode
        
        // Slight delay to allow UI to clear
        setTimeout(async () => {
           // We reuse the explicit initialization logic logic for fidelity
           await handleSetupComplete(config);
        }, 500);
    }
  };

  if (showKeySelection) {
    return (
      <div className="fixed inset-0 bg-void flex items-center justify-center p-6 z-[300]">
        <div className="bg-terminal border border-fresh-blood p-12 max-w-xl text-center space-y-10 shadow-2xl">
          <Lock className="w-20 h-20 text-fresh-blood mx-auto animate-pulse" />
          <h2 className="text-3xl font-mono text-white uppercase">Neural Key Required</h2>
          <button onClick={handleSelectKey} className="w-full bg-fresh-blood text-black font-bold py-6 font-mono flex items-center justify-center gap-4">
            <Key /> Select Neural Key
          </button>
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-xs text-gray-500 block uppercase">Billing Docs</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-void text-gray-200 overflow-hidden font-sans relative">
      {isSplashComplete && (
        <ClusterAmbience 
          activeCluster={gameState.meta.active_cluster} 
          threatLevel={gameState.villain_state.threat_scale} 
        />
      )}
      
      {!isSplashComplete && <WelcomeScreen onStart={handleWelcomeComplete} />}
      {isSplashComplete && !isInitialized && <SetupOverlay onComplete={handleSetupComplete} />}
      
      <div className={`relative z-10 flex w-full h-full bg-black/40 backdrop-blur-md transition-all duration-1000 ${isInitialized ? 'opacity-100' : 'opacity-0'}`}>
        <div className="hidden lg:block h-full">
           <StatusPanel 
                gameState={gameState} 
                onProcessAction={handleSendMessage} 
                onOpenSimulation={handleOpenSimulation} 
                isTesting={isTesting || autoMode.active} 
                onAbortTest={() => {
                  setIsTesting(false);
                  setAutoMode({ active: false, remainingCycles: 0 });
                }} 
            />
        </div>
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="h-16 border-b border-gray-800 flex items-center px-8 bg-black/80">
                <Terminal className="w-6 h-6 mr-4 text-gray-500" />
                <h1 className="font-serif text-2xl tracking-widest">NIGHTMARE MACHINE <span className="text-xs text-gray-600 ml-2">v3.5</span></h1>
                {autoMode.active && (
                  <div className="ml-auto flex items-center gap-2 px-4 py-1 bg-amber-900/30 border border-amber-600/50 rounded text-amber-500 text-xs font-mono uppercase tracking-widest animate-pulse">
                    <Activity className="w-3 h-3" /> Auto-Pilot Active ({autoMode.remainingCycles})
                  </div>
                )}
            </div>
            <StoryLog history={history} isLoading={isLoading} activeCluster={gameState.meta.active_cluster} />
            <div className="p-8 bg-gradient-to-t from-black to-transparent">
                <InputArea onSend={handleSendMessage} isLoading={isLoading || autoMode.active} />
            </div>
        </div>
      </div>

      <SimulationModal
        isOpen={isSimulationModalOpen}
        onClose={handleCloseSimulation}
        onRunSimulation={handleRunSimulationFromModal}
        isTesting={isTesting}
        simulationReport={simulationReport}
        initialPerspective={gameState.meta.perspective}
        initialMode={gameState.meta.mode}
        initialStart="Prologue"
        initialCluster={gameState.meta.active_cluster}
        initialIntensity={gameState.meta.intensity_level}
        isSessionActive={isInitialized}
        currentVillainState={gameState.villain_state}
      />
    </div>
  );
};

export default App;