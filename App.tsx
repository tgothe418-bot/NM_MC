

import React, { useState, useEffect, useRef } from 'react';
import { GameState, SimulationConfig, ChatMessage, NpcState } from './types';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SetupOverlay } from './components/SetupOverlay';
import { StatusPanel } from './components/StatusPanel';
import { StoryLog } from './components/StoryLog';
import { InputArea } from './components/InputArea';
import { SimulationModal } from './components/SimulationModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { VoiceControl } from './components/VoiceControl';
import { INITIAL_GREETING } from './constants';
import { generateAutoPlayerAction, processGameTurn } from './services/geminiService';
import { getDefaultLocationState } from './services/locationEngine';

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
  const [streamedLogic, setStreamedLogic] = useState("");
  const [streamPhase, setStreamPhase] = useState<'logic' | 'narrative'>('logic');

  // Helper to ensure global API key access if set via modal
  useEffect(() => {
    if (apiKey && !process.env.API_KEY) {
      Object.assign(process.env, { API_KEY: apiKey });
    }
  }, [apiKey]);

  const handleSetupComplete = (config: SimulationConfig) => {
    // Initialize Game State based on config
    const newState: GameState = {
        meta: {
            turn: config.starting_point === 'Prologue' ? 50 : config.starting_point === 'In Media Res' ? 25 : 10,
            perspective: config.perspective,
            mode: config.mode as 'Survivor' | 'Villain',
            intensity_level: config.intensity,
            active_cluster: config.cluster,
            // If survivor fields are present, store them in meta so Gemini knows who the user is
            player_profile: config.survivor_name || config.survivor_background ? {
                name: config.survivor_name || "Survivor",
                background: config.survivor_background || "No history provided.",
                traits: config.survivor_traits || "Unknown"
            } : undefined
        },
        villain_state: {
            name: config.villain_name || "The Entity",
            archetype: config.villain_appearance || "Unknown Horror",
            threat_scale: 1,
            primary_goal: config.primary_goal || "Consumption",
            current_tactic: "Stalking",
            victim_profile: config.victim_description || "Unknown Victims"
        },
        npc_states: [], // Will be populated by Simulator
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
    handleSendMessage("BEGIN SIMULATION. ESTABLISH CONTEXT. GENERATE VISUALS.", [], newState);
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
    setStreamedLogic("");
    setStreamPhase('logic');

    // CRITICAL: Use overrideState if provided (initial setup), otherwise use current state
    const currentState = overrideState || gameState;

    try {
        const result = await processGameTurn(currentState, text, files, (chunk, phase) => {
            setStreamPhase(phase);
            setStreamedLogic(prev => prev + chunk);
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

  // Wrapper for Voice/Status Panel
  const processAction = async (action: string): Promise<string> => {
     await handleSendMessage(action);
     // Return the last model message text
     return history[history.length - 1]?.text || ""; 
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
    <div className="flex h-screen bg-[#050505] text-gray-200 overflow-hidden font-sans">
        
        {/* Left Panel: Status & Diagnostics */}
        <StatusPanel 
            gameState={gameState} 
            onProcessAction={processAction} 
            onOpenSimulation={() => setShowSimModal(true)}
            isTesting={autoMode.active}
            onAbortTest={() => setAutoMode({ active: false, remainingCycles: 0 })}
            onUpdateNpc={handleUpdateNpc}
            onReset={handleResetGame}
        />

        {/* Center: Main Narrative Log */}
        <div className="flex-1 flex flex-col relative">
            <StoryLog 
                history={history} 
                isLoading={isLoading} 
                activeCluster={gameState.meta.active_cluster}
                showLogic={showLogic}
                streamedLogic={streamedLogic}
                streamPhase={streamPhase}
            />
            
            <div className="p-6 bg-gradient-to-t from-black via-black to-transparent z-20">
                <InputArea 
                    onSend={(text, files) => handleSendMessage(text, files)} 
                    isLoading={isLoading} 
                    onAdvance={() => handleSendMessage("Wait. Observe.")}
                    showLogic={showLogic}
                    onToggleLogic={() => setShowLogic(!showLogic)}
                    options={gameState.suggested_actions}
                />
            </div>
            
            {/* Overlay Controls */}
            <div className="absolute top-6 right-6 z-30">
                <VoiceControl onProcessAction={processAction} />
            </div>
        </div>

        {/* Simulation Modal */}
        <SimulationModal 
            isOpen={showSimModal} 
            onClose={() => setShowSimModal(false)}
            onRunSimulation={(config) => {
                setShowSimModal(false);
                // If cycles provided, start auto-pilot
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