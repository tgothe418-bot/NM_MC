import React, { useState, useEffect } from 'react';
import { StatusPanel } from './components/StatusPanel';
import { StoryLog } from './components/StoryLog';
import { InputArea } from './components/InputArea';
import { ClusterAmbience } from './components/ClusterAmbience';
import { SimulationModal } from './components/SimulationModal';
import { SetupOverlay } from './components/SetupOverlay';
import { WelcomeScreen } from './components/WelcomeScreen';
import { sendMessageToGemini, initializeGemini, generateAutoPlayerAction, generateSimulationAnalysis, generateHorrorImage, generateCinematicVideo, generateNpcActions, simulateTurn, generateCalibrationField } from './services/geminiService';
import { GameState, ChatMessage, SimulationConfig } from './types';
import { constructVoiceManifesto } from './services/dialogueEngine';
import { constructSensoryManifesto } from './services/sensoryEngine';
import { constructLocationManifesto, getDefaultLocationState, constructRoomGenerationRules } from './services/locationEngine';
import { Terminal, Lock, Key } from 'lucide-react';

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

  const handleSendMessage = async (text: string, isInitial = false): Promise<string> => {
    setIsLoading(true);
    if (!isInitial) setHistory(prev => [...prev, { role: 'user', text, timestamp: Date.now() }]);

    try {
      // Pass 0: NPC Agency (with fallback)
      let npcActions: string[] = [];
      try {
        npcActions = await generateNpcActions(gameState, text);
      } catch (err) {
        console.warn("NPC Agency skipped due to error:", err);
      }

      // Pass 1: Simulation
      let simulated = await simulateTurn(gameState, text, npcActions);
      
      // Pass 1.5: Room Enrichment
      // If the user moved to a new room, we ensure the description is rich and cluster-specific.
      const prevRoomId = gameState.location_state.current_room_id;
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
    const startPrompt = `INITIALIZE: Cluster: ${config.cluster}, Intensity: ${config.intensity}, Role: ${config.mode}`;
    await handleSendMessage(startPrompt, true);
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
        setGameState(INITIAL_STATE);
        setIsInitialized(true);
        
        // Slight delay to allow state clear
        setTimeout(async () => {
           let startPrompt = `RE-CALIBRATE: Cluster: ${config.cluster}, Intensity: ${config.intensity}, Role: ${config.mode}, Perspective: ${config.perspective}`;
           if (config.mode === 'Villain') {
               startPrompt += `\nVILLAIN CONFIG: Name: ${config.villain_name}, Goal: ${config.primary_goal}, Appearance: ${config.villain_appearance}, Methods: ${config.villain_methods}, Victims: ${config.victim_description}`;
           }
           await handleSendMessage(startPrompt, true);
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
                isTesting={isTesting} 
                onAbortTest={() => setIsTesting(false)} 
            />
        </div>
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="h-16 border-b border-gray-800 flex items-center px-8 bg-black/80">
                <Terminal className="w-6 h-6 mr-4 text-gray-500" />
                <h1 className="font-serif text-2xl tracking-widest">NIGHTMARE MACHINE <span className="text-xs text-gray-600 ml-2">v3.5</span></h1>
            </div>
            <StoryLog history={history} isLoading={isLoading} activeCluster={gameState.meta.active_cluster} />
            <div className="p-8 bg-gradient-to-t from-black to-transparent">
                <InputArea onSend={handleSendMessage} isLoading={isLoading} />
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