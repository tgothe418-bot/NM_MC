
import React, { useState, useEffect, useRef } from 'react';
import { StatusPanel } from './components/StatusPanel';
import { StoryLog } from './components/StoryLog';
import { InputArea } from './components/InputArea';
import { ClusterAmbience } from './components/ClusterAmbience';
import { SimulationModal } from './components/SimulationModal';
import { SetupOverlay } from './components/SetupOverlay';
import { WelcomeScreen } from './components/WelcomeScreen';
import { sendMessageToGemini, initializeGemini, generateAutoPlayerAction, generateSimulationAnalysis, generateHorrorImage } from './services/geminiService';
import { GameState, ChatMessage, NpcState, SimulationConfig } from './types';
import { parseResponse } from './utils';
import { constructVoiceManifesto, updateDialogueState } from './services/dialogueEngine';
import { constructSensoryManifesto } from './services/sensoryEngine';
import { ttsService } from './services/ttsService';
import { Terminal } from 'lucide-react';

const INITIAL_STATE: GameState = {
  meta: {
    turn: 0,
    custodian_name: "Unknown",
    perspective: "Pending",
    mode: 'Pending',
    starting_point: "Pending",
    intensity_level: "PENDING",
    active_cluster: "None",
    cluster_weights: {
      "Cluster 1 (Flesh)": "0%",
      "Cluster 2 (System)": "0%",
      "Cluster 3 (Haunting)": "0%",
      "Cluster 4 (Self)": "0%",
      "Cluster 5 (Blasphemy)": "0%",
      "Cluster 6 (Survival)": "0%"
    },
    target_duration: "Medium (30-50)",
    target_turn_count: 40
  },
  co_author_state: {
    name: "Unnamed",
    archetype: "Auto-Generated",
    tone: "Neutral",
    dominance_level: 50,
    creativity_temperature: 50,
    relationship_to_user: "Unknown",
    current_obsession: "None",
    meta_commentary_frequency: "Medium"
  },
  villain_state: {
    name: "Unknown",
    archetype: "Unknown",
    cluster_alignment: "None",
    intensity_level: "1",
    species_nature: "Unknown",
    primary_goal: "Establish Dominance",
    secondary_goal: "Feed on Fear",
    obsession_flaw: "Unknown",
    vulnerability_key: "Unknown",
    threat_scale: 0,
    hunt_pattern: "Dormant",
    current_tactic: "Dormant",
    territory: "Unknown",
    manifestation_style: "Unknown"
  },
  npc_states: [],
  location_state: {
    name: "Unknown",
    archetype: "Unknown",
    cluster_alignment: "None",
    current_state: 0,
    dominant_sensory_palette: {
      primary_sense: "None",
      secondary_sense: "None",
      intensity: "Low"
    },
    time_of_day: "Unknown",
    weather_state: "Unknown",
    active_hazards: [],
    hidden_resources: [],
    location_secret: {
      nature: "Unknown",
      revelation_trigger: "Unknown",
      consequence: "Unknown",
      discovery_state: "Hidden"
    },
    spatial_logic: "Euclidean",
    relationship_to_villain: "Neutral"
  },
  narrative: {
    active_prices: [],
    sensory_focus: "Silence",
    visual_motif: "",
    illustration_request: null,
    active_events: [],
    narrative_debt: [],
    unreliable_architect_level: 0
  },
  history: {
    recentKeywords: []
  },
  narrativeFlags: {
    lastUserTone: "Neutral",
    pacing_mode: "Dread Building",
    is_ooc: false,
    input_type: "text"
  }
};

const hydrateNpcStates = (incomingNpcs: any[]): NpcState[] => {
    if (!Array.isArray(incomingNpcs)) return [];
    return incomingNpcs.map((npc) => ({
        ...npc,
        relationship_state: npc.relationship_state || { trust: 50, fear: 20, secretKnowledge: false },
        psychology: {
            current_thought: npc.psychology?.current_thought || "Processing...",
            emotional_state: npc.psychology?.emotional_state || "Unknown",
            sanity_percentage: npc.psychology?.sanity_percentage ?? 100,
            resilience_level: npc.psychology?.resilience_level || "Moderate",
            stress_level: npc.psychology?.stress_level ?? 0,
            dominant_instinct: npc.psychology?.dominant_instinct || "Freeze"
        },
        dialogue_state: {
            voice_profile: npc.dialogue_state?.voice_profile || { tone: "Neutral", vocabulary: [], quirks: [], forbidden_topics: [] },
            memory: npc.dialogue_state?.memory || { short_term_buffer: [], long_term_summary: npc.background_origin || "No prior history recorded." },
            last_social_maneuver: npc.dialogue_state?.last_social_maneuver || 'OBSERVE',
            mood_state: npc.dialogue_state?.mood_state || "Neutral",
            current_social_intent: npc.dialogue_state?.current_social_intent || 'OBSERVE',
            conversation_history: npc.dialogue_state?.conversation_history || []
        }
    } as NpcState));
};

const App: React.FC = () => {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [isSplashComplete, setIsSplashComplete] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationConfig, setSimulationConfig] = useState<SimulationConfig | null>(null);
  const [simulationReport, setSimulationReport] = useState<string | null>(null);
  const [showSimModal, setShowSimModal] = useState(false);
  
  useEffect(() => {
    if (process.env.API_KEY) initializeGemini();
  }, []);

  const handleSendMessage = async (text: string, isInternalInitialCall: boolean = false): Promise<string> => {
    setIsLoading(true);
    if (!isInternalInitialCall) {
      const userMsg: ChatMessage = { role: 'user', text, timestamp: Date.now() };
      setHistory(prev => [...prev, userMsg]);
    }
    
    try {
      const updatedNpcsPreCall = gameState.npc_states.map(npc => updateDialogueState(npc, "User", text));
      const voiceManifesto = constructVoiceManifesto(updatedNpcsPreCall);
      const sensoryManifesto = constructSensoryManifesto(gameState);
      
      const responseText = await sendMessageToGemini(text, gameState.narrative.active_events, voiceManifesto, sensoryManifesto);
      const { gameState: newGameState, storyText } = parseResponse(responseText);
      
      if (newGameState) {
        setGameState(prev => ({
          ...prev,
          ...newGameState,
          npc_states: hydrateNpcStates(newGameState.npc_states || []),
          meta: { ...prev.meta, ...newGameState.meta }
        }));
      }

      setHistory(prev => [...prev, { role: 'model', text: storyText, gameState: newGameState || undefined, timestamp: Date.now() }]);
      if (ttsService.getEnabled()) ttsService.speak(storyText);
      
      return storyText;

    } catch (error) {
      console.error("Interaction failed:", error);
      const errorMsg = "[SYSTEM CRITICAL FAILURE] Architect unresponsive.";
      setHistory(prev => [...prev, { role: 'model', text: errorMsg, timestamp: Date.now() }]);
      return errorMsg;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupComplete = async (config: SimulationConfig) => {
    setGameState(prev => ({
      ...prev,
      meta: {
        ...prev.meta,
        perspective: config.perspective,
        mode: config.mode as 'Survivor' | 'Villain',
        starting_point: config.starting_point,
        intensity_level: config.intensity,
        active_cluster: config.cluster
      }
    }));
    setIsInitialized(true);
    
    let startPrompt = `INITIALIZE SIMULATION: 
Perspective: ${config.perspective}
Mode: ${config.mode}
Starting Point: ${config.starting_point}
Cluster: ${config.cluster}
Intensity: ${config.intensity}
Visual Motif: ${config.visual_motif || "Default specific to Cluster"}`;

    if (config.mode === 'Villain') {
        startPrompt += `\n\nUSER-DEFINED ANTAGONIST PROFILE:
- Entity Name: ${config.villain_name || "Unknown"}
- Form & Appearance: ${config.villain_appearance || "N/A"}
- Modus Operandi & Methods: ${config.villain_methods || "N/A"}
- Primary Goal: ${config.primary_goal || "N/A"}
- Target Victims: ${config.victim_description || "N/A"}
- Initial Victim Count: ${config.victim_count || 3}

INSTRUCTION: You MUST respect the user's choices for their villain persona and the victims provided. Set up the opening scene from the perspective of the Predator.`;
    }

    startPrompt += `\n\nTASK: Generate the opening 'Tales From the Crypt' style greeting. Then ask for the user's name (or title of terror if Villain) to tether them to the machine.`;
    
    await handleSendMessage(startPrompt, true);
  };

  useEffect(() => {
    if (isSimulating && !isLoading && simulationConfig) {
       const runSimulationTurn = async () => {
           if (gameState.meta.turn >= simulationConfig.cycles) {
               setIsSimulating(false);
               const analysis = await generateSimulationAnalysis(history.map(m => `[${m.role.toUpperCase()}]: ${m.text}`).join('\n'));
               setSimulationReport(analysis);
               return;
           }
           const action = await generateAutoPlayerAction(history.slice(-5).map(m => `[${m.role.toUpperCase()}]: ${m.text}`).join('\n'), gameState, simulationConfig);
           await handleSendMessage(action);
       };
       const timer = setTimeout(runSimulationTurn, 2000); 
       return () => clearTimeout(timer);
    }
  }, [isSimulating, isLoading, gameState.meta.turn]);

  return (
    <div className="flex h-screen w-full bg-void text-gray-200 overflow-hidden font-sans relative items-center justify-center">
      <ClusterAmbience 
          activeCluster={gameState.meta.active_cluster} 
          weatherState={gameState.location_state.weather_state}
          threatLevel={gameState.villain_state.threat_scale}
          locationState={gameState.location_state.current_state}
          visualMotif={gameState.narrative.visual_motif}
      />

      {!isSplashComplete && (
        <WelcomeScreen onStart={() => setIsSplashComplete(true)} />
      )}

      {isSplashComplete && !isInitialized && (
        <SetupOverlay onComplete={handleSetupComplete} />
      )}

      <div className={`relative z-10 flex w-[95%] h-[92%] border border-gray-900 shadow-[0_0_120px_rgba(0,0,0,0.9)] bg-black/50 backdrop-blur-xl transition-all duration-1000 overflow-hidden rounded-xl ${isInitialized ? 'opacity-100' : 'opacity-0 pointer-events-none translate-y-4'}`}>
        <div className="hidden lg:block h-full bg-black/60 relative z-20">
           <StatusPanel 
            gameState={gameState} 
            onProcessAction={handleSendMessage}
            onOpenSimulation={() => setShowSimModal(true)}
            isSimulating={isSimulating}
           />
        </div>
        <div className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
            <div className="h-20 border-b border-gray-800 flex items-center justify-between px-10 bg-black/80 backdrop-blur">
                <div className="flex items-center gap-5">
                   <Terminal className="w-8 h-8 text-gray-500" />
                   <h1 className="font-serif text-3xl tracking-widest text-gray-100">THE NIGHTMARE MACHINE <span className="text-sm font-mono text-gray-600 align-top ml-2">v3.1</span></h1>
                </div>
            </div>
            <StoryLog history={history} isLoading={isLoading} activeCluster={gameState.meta.active_cluster} />
            <div className="px-10 py-10 bg-gradient-to-t from-black via-black/90 to-transparent">
                <InputArea onSend={handleSendMessage} isLoading={isLoading || isSimulating} />
            </div>
        </div>
      </div>
      <SimulationModal isOpen={showSimModal} onClose={() => setShowSimModal(false)} onRunSimulation={config => { setSimulationConfig(config); setIsSimulating(true); }} isSimulating={isSimulating} simulationReport={simulationReport} />
    </div>
  );
};

export default App;
