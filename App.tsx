
import React, { useState, useEffect, useRef } from 'react';
import { GameState, SimulationConfig, ChatMessage, NpcState } from './types';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SetupOverlay } from './components/SetupOverlay';
import { StatusPanel } from './components/StatusPanel';
import { StoryLog } from './components/StoryLog';
import { InputArea } from './components/InputArea';
import { SimulationModal } from './components/SimulationModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { INITIAL_GREETING } from './constants';
import { generateAutoPlayerAction, processGameTurn } from './services/geminiService';
import { getDefaultLocationState } from './services/locationEngine';
import { generateProceduralNpc } from './services/npcGenerator';

export default function App() {
  const [apiKey, setApiKey] = useState(process.env.API_KEY || "");
  const [isInitialized, setIsInitialized] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  
  const [gameState, setGameState] = useState<GameState>({
    meta: { turn: 50, perspective: 'First Person', mode: 'Survivor', intensity_level: 'Level 3', active_cluster: 'None' },
    villain_state: { name: 'Unknown', archetype: 'Unknown', threat_scale: 0, primary_goal: 'Unknown', current_tactic: 'None' },
    npc_states: [],
    location_state: getDefaultLocationState(),
    narrative: { visual_motif: '', illustration_request: null },
    suggested_actions: []
  });

  const [history, setHistory] = useState<ChatMessage[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [autoMode, setAutoMode] = useState({ active: false, remainingCycles: 0 });
  const [showSimModal, setShowSimModal] = useState(false);

  // Logic Viewing State
  const [showLogic, setShowLogic] = useState(false);
  const [logicStream, setLogicStream] = useState("");
  const [narrativeStream, setNarrativeStream] = useState("");
  const [streamPhase, setStreamPhase] = useState<'logic' | 'narrative'>('logic');

  // Helper to ensure global API key access if set via modal
  useEffect(() => {
    if (apiKey && !process.env.API_KEY) {
      Object.assign(process.env, { API_KEY: apiKey });
    }
  }, [apiKey]);

  const handleSetupComplete = (config: SimulationConfig) => {
    // 1. DETERMINISTIC GENERATION: Create victims locally
    // Use user-selected NPCs if available, otherwise generate default amount
    let initialNpcs: NpcState[] = [];
    
    if (config.pre_generated_npcs && config.pre_generated_npcs.length > 0) {
        initialNpcs = config.pre_generated_npcs;
    } else {
        const victimCount = config.victim_count || 3;
        const usedNames = new Set<string>();
        initialNpcs = Array.from({ length: victimCount }).map(() => 
            generateProceduralNpc(config.cluster, config.intensity, usedNames)
        );
    }

    const isVillainMode = config.mode === 'Villain';

    // Construct Player Profile: If Villain, the "Player" is the Entity.
    const playerProfile = isVillainMode 
        ? {
            name: config.villain_name || "The Entity",
            background: `ROLE: Antagonist/Monster. ARCHETYPE: ${config.villain_appearance || "Unknown Horror"}. GOAL: ${config.primary_goal || "Torment"}.`,
            traits: config.villain_methods || "Cruelty, Omniscience"
        }
        : (config.survivor_name || config.survivor_background ? {
            name: config.survivor_name || "Survivor",
            background: config.survivor_background || "No history provided.",
            traits: config.survivor_traits || "Unknown"
        } : undefined);

    // Initialize Game State based on config
    const newState: GameState = {
        meta: {
            turn: config.starting_point === 'Prologue' ? 50 : config.starting_point === 'In Media Res' ? 25 : 10,
            perspective: config.perspective,
            mode: config.mode as 'Survivor' | 'Villain',
            intensity_level: config.intensity,
            active_cluster: config.cluster,
            player_profile: playerProfile
        },
        villain_state: {
            name: config.villain_name || "The Entity",
            archetype: config.villain_appearance || "Unknown Horror",
            threat_scale: 1,
            primary_goal: config.primary_goal || "Consumption",
            current_tactic: "Stalking",
            victim_profile: config.victim_description || "Unknown Victims"
        },
        npc_states: initialNpcs, // Injected pre-generated NPCs
        location_state: {
            ...getDefaultLocationState(),
            architectural_notes: config.location_description ? [config.location_description] : []
        },
        narrative: {
            visual_motif: config.visual_motif || "Standard Cinematic",
            illustration_request: "Establishing Shot" // Force initial request in state
        },
        suggested_actions: []
    };
    
    setGameState(newState);
    setHistory([]); // Clear placeholder history so the first generated image sets the scene
    setShowSetup(false);
    setIsInitialized(true);
    
    // Initial Narration Trigger - MUST PASS newState to avoid stale closure state
    handleSendMessage("BEGIN SIMULATION. ESTABLISH CONTEXT. ESTABLISH CHARACTERS AND MOTIVES using the provided configuration. GENERATE VISUALS.", [], newState);
  };

  const handleResetGame = () => {
    if (window.confirm("TERMINATE SESSION?\n\nThis will wipe all narrative progress and return to the void.")) {
      // 1. Stop Auto Pilot
      setAutoMode({ active: false, remainingCycles: 0 });
      
      // 2. Clear History
      setHistory([]);

      // 3. Reset State to Default
      setGameState({
        meta: { turn: 50, perspective: 'First Person', mode: 'Survivor', intensity_level: 'Level 3', active_cluster: 'None' },
        villain_state: { name: 'Unknown', archetype: 'Unknown', threat_scale: 0, primary_goal: 'Unknown', current_tactic: 'None' },
        npc_states: [],
        location_state: getDefaultLocationState(),
        narrative: { visual_motif: '', illustration_request: null },
        suggested_actions: []
      });

      // 4. Return to Welcome Screen
      setIsInitialized(false);
      setShowSetup(false);
    }
  };

  const handleSendMessage = async (text: string, files: File[] = [], overrideState?: GameState) => {
    if (isLoading) return;

    // Add user message to history (unless it's the system start command)
    if (!text.includes("BEGIN SIMULATION")) {
        setHistory(prev => [...prev, { role: 'user', text, timestamp: Date.now() }]);
    }
    
    setIsLoading(true);
    setLogicStream("");
    setNarrativeStream("");
    setStreamPhase('logic');

    // CRITICAL: Use overrideState if provided (initial setup), otherwise use current state
    const currentState = overrideState || gameState;

    try {
        const result = await processGameTurn(currentState, text, files, (chunk, phase) => {
            setStreamPhase(phase);
            if (phase === 'logic') {
                setLogicStream(prev => prev + chunk);
            } else {
                setNarrativeStream(prev => prev + chunk);
            }
        });
        
        setGameState(result.gameState);
        setHistory(prev => [...prev, { 
            role: 'model', 
            text: result.storyText, 
            gameState: result.gameState, 
            imageUrl: result.imageUrl,
            timestamp: Date.now() 
        }]);

    } catch (e) {
        console.error("Game Loop Error:", e);
        setHistory(prev => [...prev, { 
            role: 'model', 
            text: "CRITICAL FAILURE: The simulation has desynchronized. Please reset parameters.", 
            timestamp: Date.now() 
        }]);
    } finally {
        setIsLoading(false);
    }
  };

  // State Updater for specific NPC (passed to StatusPanel -> CharacterPortrait)
  const handleUpdateNpc = (npcIndex: number, updates: Partial<NpcState>) => {
    setGameState(prev => {
      const newNpcs = [...prev.npc_states];
      if (newNpcs[npcIndex]) {
          newNpcs[npcIndex] = { ...newNpcs[npcIndex], ...updates };
      }
      return { ...prev, npc_states: newNpcs };
    });
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
              await handleSendMessage(action);
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
  }, [autoMode, isLoading, isInitialized, gameState]); 

  // --- RENDER ---

  if (!apiKey) return <ApiKeyModal onSetKey={setApiKey} />;
  
  if (!isInitialized && !showSetup) {
      return <WelcomeScreen onStart={() => setShowSetup(true)} />;
  }
  
  if (showSetup) {
      return <SetupOverlay onComplete={handleSetupComplete} />;
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#050505] text-gray-200 overflow-hidden font-sans relative">
        
        {/* LEFT COLUMN: Narrative Log */}
        <div className="flex-1 flex flex-col relative z-10 h-full overflow-hidden">
            <StoryLog 
                history={history} 
                isLoading={isLoading} 
                activeCluster={gameState.meta.active_cluster}
                showLogic={showLogic}
                logicStream={logicStream}
                narrativeStream={narrativeStream}
                streamPhase={streamPhase}
                className="pb-24" // Bottom padding for StatusPanel which is fixed
            />
        </div>

        {/* RIGHT COLUMN: Input Sidebar */}
        <div className="w-full lg:w-[450px] xl:w-[500px] border-t lg:border-t-0 lg:border-l border-gray-800 bg-[#080808]/95 z-20 flex flex-col p-6 shadow-2xl relative pb-24 lg:pb-24">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent opacity-20"></div>
            <InputArea 
                onSend={(text, files) => handleSendMessage(text, files)} 
                isLoading={isLoading} 
                onAdvance={() => handleSendMessage("Wait. Observe.")}
                showLogic={showLogic}
                onToggleLogic={() => setShowLogic(!showLogic)}
                options={gameState.suggested_actions}
                isSidebar={true}
            />
        </div>

        {/* Bottom Status Panel (Fixed Overlay) */}
        <StatusPanel 
            gameState={gameState} 
            onOpenSimulation={() => setShowSimModal(true)}
            isTesting={autoMode.active}
            onAbortTest={() => setAutoMode({ active: false, remainingCycles: 0 })}
            onUpdateNpc={handleUpdateNpc}
            onReset={handleResetGame}
        />

        {/* Simulation Modal */}
        <SimulationModal 
            isOpen={showSimModal} 
            onClose={() => setShowSimModal(false)}
            onRunSimulation={(config) => {
                setShowSimModal(false);
                if (config.cycles > 0) {
                    setAutoMode({ active: true, remainingCycles: config.cycles });
                }
            }}
            isTesting={autoMode.active}
            simulationReport={null}
            initialCluster={gameState.meta.active_cluster}
            currentVillainState={gameState.villain_state}
        />
    </div>
  );
}
