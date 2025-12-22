
import React, { useState, useEffect } from 'react';
import { StatusPanel } from './components/StatusPanel';
import { StoryLog } from './components/StoryLog';
import { InputArea } from './components/InputArea';
import { ClusterAmbience } from './components/ClusterAmbience';
import { SimulationModal } from './components/SimulationModal';
import { SetupOverlay } from './components/SetupOverlay';
import { WelcomeScreen } from './components/WelcomeScreen';
import { sendMessageToGemini, initializeGemini, generateAutoPlayerAction, generateSimulationAnalysis, generateHorrorImage, generateCinematicVideo } from './services/geminiService';
import { GameState, ChatMessage, NpcState, SimulationConfig, LocationState } from './types';
import { parseResponse } from './utils';
import { constructVoiceManifesto, updateDialogueState } from './services/dialogueEngine';
import { constructSensoryManifesto } from './services/sensoryEngine';
import { updateLocationState, constructLocationManifesto, getDefaultLocationState } from './services/locationEngine';
import { ttsService } from './services/ttsService';
import { Terminal, Key, Lock, ExternalLink } from 'lucide-react';

const INITIAL_STATE: GameState = {
  meta: {
    turn: 0,
    custodian_name: "Unknown",
    perspective: "Pending",
    mode: 'Pending',
    starting_point: "Pending",
    intensity_level: "Level 1",
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
  location_state: getDefaultLocationState(),
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
  const [isTesting, setIsTesting] = useState(false);
  const [simulationConfig, setSimulationConfig] = useState<SimulationConfig | null>(null);
  const [simulationReport, setSimulationReport] = useState<string | null>(null);
  const [showSimModal, setShowSimModal] = useState(false);
  const [testEndTurn, setTestEndTurn] = useState<number>(0);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [showKeySelection, setShowKeySelection] = useState<boolean>(true);

  useEffect(() => {
    const checkApiKey = async () => {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      setHasApiKey(hasKey);
      if (hasKey) {
        setShowKeySelection(false);
        initializeGemini();
      }
    };
    checkApiKey();
  }, []);

  const handleSelectKey = async () => {
    await (window as any).aistudio.openSelectKey();
    setHasApiKey(true);
    setShowKeySelection(false);
    initializeGemini();
  };

  const handleSendMessage = async (text: string, isInternalInitialCall: boolean = false): Promise<string> => {
    setIsLoading(true);
    if (!isInternalInitialCall) {
      setHistory(prev => [...prev, { role: 'user', text, timestamp: Date.now() }]);
    }
    
    try {
      const updatedNpcsPreCall = gameState.npc_states.map(npc => updateDialogueState(npc, "User", text));
      const updatedLocationState = updateLocationState(gameState.location_state, gameState);
      const voiceManifesto = constructVoiceManifesto(updatedNpcsPreCall);
      const sensoryManifesto = constructSensoryManifesto(gameState);
      const locationManifesto = constructLocationManifesto(updatedLocationState);
      
      const responseText = await sendMessageToGemini(
        text, 
        gameState.narrative.active_events, 
        voiceManifesto, 
        sensoryManifesto + locationManifesto
      );
      
      const { gameState: newGameState, storyText } = parseResponse(responseText);
      
      if (newGameState) {
        const rawLocation = (newGameState.location_state || {}) as any;
        const sanitizedLocation: Partial<LocationState> = {
            ...rawLocation,
            architectural_notes: Array.isArray(rawLocation.architectural_notes) 
                ? rawLocation.architectural_notes 
                : (typeof rawLocation.architectural_notes === 'string' ? [rawLocation.architectural_notes] : []),
            active_hazards: Array.isArray(rawLocation.active_hazards) 
                ? rawLocation.active_hazards 
                : (typeof rawLocation.active_hazards === 'string' ? [rawLocation.active_hazards] : [])
        };

        setGameState(prev => ({
          ...prev,
          ...newGameState,
          npc_states: hydrateNpcStates(newGameState.npc_states || []),
          meta: { ...prev.meta, ...newGameState.meta },
          location_state: {
            ...updatedLocationState,
            ...sanitizedLocation as any
          }
        }));
      }

      setHistory(prev => [...prev, { role: 'model', text: storyText, gameState: newGameState || undefined, timestamp: Date.now() }]);
      if (ttsService.getEnabled()) ttsService.speak(storyText);
      return storyText;
    } catch (error: any) {
      console.error("Interaction failed:", error);
      if (error?.message?.includes("Requested entity was not found")) {
        setShowKeySelection(true);
      }
      const errorMsg = "[SYSTEM CRITICAL FAILURE] Architect unresponsive.";
      setHistory(prev => [...prev, { role: 'model', text: errorMsg, timestamp: Date.now() }]);
      return errorMsg;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSnapshot = async () => {
    setIsLoading(true);
    const lastMsg = history[history.length - 1]?.text || "A terrifying scene from the nightmare machine.";
    try {
      const imageUrl = await generateHorrorImage(lastMsg, { activeCluster: gameState.meta.active_cluster, highQuality: true });
      if (imageUrl) {
        setHistory(prev => [...prev, { role: 'model', text: "( The Machine projects a high-fidelity neural snapshot of your reality. )", imageUrl, timestamp: Date.now() }]);
      }
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const handleVideoCutscene = async () => {
    setIsLoading(true);
    const lastMsg = history[history.length - 1]?.text || "A cinematic horror scene unfolds.";
    try {
      const videoUrl = await generateCinematicVideo(lastMsg, { aspectRatio: "16:9", resolution: "720p" });
      if (videoUrl) {
        setHistory(prev => [...prev, { role: 'model', text: "( The Machine forced a temporal cutscene into your sensory stream. )", videoUrl, timestamp: Date.now() }]);
      }
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const handleSetupComplete = async (config: SimulationConfig) => {
    const initialLocation = {
        ...getDefaultLocationState(config.cluster),
        name: config.location_description ? "Defined Threshold" : "Initial Entry",
        architectural_notes: config.location_description ? [config.location_description] : []
    };

    setGameState(prev => ({
      ...prev,
      location_state: initialLocation,
      meta: { ...prev.meta, perspective: config.perspective, mode: config.mode as 'Survivor' | 'Villain', starting_point: config.starting_point, intensity_level: config.intensity, active_cluster: config.cluster }
    }));
    setIsInitialized(true);
    let startPrompt = `INITIALIZE SIMULATION: Perspective: ${config.perspective}, Mode: ${config.mode}, Starting Point: ${config.starting_point}, Cluster: ${config.cluster}, Intensity: ${config.intensity}`;
    if (config.location_description) {
        startPrompt += `\nINITIAL LOCATION: ${config.location_description}`;
    }
    if (config.visual_motif) {
        startPrompt += `\nVISUAL MOTIF: ${config.visual_motif}`;
    }
    if (config.mode === 'Villain') {
        startPrompt += `\n\nUSER ANTAGONIST: Name: ${config.villain_name}, Desc: ${config.villain_appearance}, Goal: ${config.primary_goal}`;
    }
    await handleSendMessage(startPrompt, true);
    
    // Automatic Test Mode check - renamed from 'simulation' path
    // IMPORTANT: It ONLY triggers if specifically requested via 'test' mode in SetupOverlay
    if (config.cycles > 0) {
        setSimulationConfig(config);
        setTestEndTurn(gameState.meta.turn + config.cycles);
        setIsTesting(true);
    }
  };

  const handleRunTest = (config: SimulationConfig) => {
    setSimulationConfig(config);
    setTestEndTurn(gameState.meta.turn + config.cycles);
    setIsTesting(true);
    setShowSimModal(false);
  };

  const handleAbortTest = () => {
    setIsTesting(false);
  };

  useEffect(() => {
    if (isTesting && !isLoading && simulationConfig) {
       const runTestTurn = async () => {
           if (gameState.meta.turn >= testEndTurn) {
               setIsTesting(false);
               const analysis = await generateSimulationAnalysis(history.map(m => `[${m.role.toUpperCase()}]: ${m.text}`).join('\n'));
               setSimulationReport(analysis);
               setShowSimModal(true);
               return;
           }
           const action = await generateAutoPlayerAction(history.slice(-5).map(m => `[${m.role.toUpperCase()}]: ${m.text}`).join('\n'), gameState, simulationConfig);
           await handleSendMessage(action);
       };
       const timer = setTimeout(runTestTurn, 3000); 
       return () => clearTimeout(timer);
    }
  }, [isTesting, isLoading, gameState.meta.turn, testEndTurn, simulationConfig, history, gameState]);

  if (showKeySelection) {
    return (
      <div className="fixed inset-0 bg-void flex items-center justify-center p-6 z-[300]">
        <div className="bg-terminal border border-fresh-blood p-12 max-w-xl w-full text-center space-y-10 shadow-[0_0_50px_rgba(136,8,8,0.3)]">
          <div className="flex justify-center"><Lock className="w-20 h-20 text-fresh-blood animate-pulse" /></div>
          <h2 className="text-3xl font-mono uppercase tracking-[0.2em] text-white">Neural Key Required</h2>
          <p className="text-gray-400 font-mono text-sm leading-relaxed">
            High-fidelity simulation (Veo/Gemini Pro) requires a paid API Key from a valid GCP project.
          </p>
          <div className="pt-4 space-y-4">
            <button onClick={handleSelectKey} className="w-full bg-fresh-blood hover:bg-red-800 text-black font-bold py-6 px-4 font-mono tracking-widest flex items-center justify-center gap-4 transition-all uppercase">
              <Key className="w-6 h-6" /> Select Neural Key
            </button>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-[10px] text-gray-600 hover:text-white transition-colors uppercase font-mono tracking-widest">
              Billing Documentation <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-void text-gray-200 overflow-hidden font-sans relative items-center justify-center">
      <ClusterAmbience activeCluster={gameState.meta.active_cluster} weatherState={gameState.location_state.weather_state} threatLevel={gameState.villain_state.threat_scale} locationState={gameState.location_state.current_state} visualMotif={gameState.narrative.visual_motif} />
      {!isSplashComplete && <WelcomeScreen onStart={() => setIsSplashComplete(true)} />}
      {isSplashComplete && !isInitialized && <SetupOverlay onComplete={handleSetupComplete} />}
      <div className={`relative z-10 flex w-[95%] h-[92%] border border-gray-900 shadow-[0_0_120px_rgba(0,0,0,0.9)] bg-black/50 backdrop-blur-xl transition-all duration-1000 overflow-hidden rounded-xl ${isInitialized ? 'opacity-100' : 'opacity-0 pointer-events-none translate-y-4'}`}>
        <div className="hidden lg:block h-full bg-black/60 relative z-20">
           <StatusPanel gameState={gameState} onProcessAction={handleSendMessage} onOpenSimulation={() => { setSimulationReport(null); setShowSimModal(true); }} isTesting={isTesting} onAbortTest={handleAbortTest} />
        </div>
        <div className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
            <div className="h-20 border-b border-gray-800 flex items-center justify-between px-10 bg-black/80 backdrop-blur">
                <div className="flex items-center gap-5">
                   <Terminal className="w-8 h-8 text-gray-500" />
                   <h1 className="font-serif text-3xl tracking-widest text-gray-100">THE NIGHTMARE MACHINE <span className="text-sm font-mono text-gray-600 align-top ml-2">v3.2</span></h1>
                </div>
            </div>
            <StoryLog history={history} isLoading={isLoading} activeCluster={gameState.meta.active_cluster} />
            <div className="px-10 py-10 bg-gradient-to-t from-black via-black/90 to-transparent">
                <InputArea onSend={handleSendMessage} onSnapshot={handleSnapshot} onVideoCutscene={handleVideoCutscene} isLoading={isLoading || isTesting} />
            </div>
        </div>
      </div>
      <SimulationModal isOpen={showSimModal} onClose={() => setShowSimModal(false)} onRunSimulation={handleRunTest} isTesting={isTesting} simulationReport={simulationReport} initialPerspective={gameState.meta.perspective} initialMode={gameState.meta.mode} initialCluster={gameState.meta.active_cluster} initialIntensity={gameState.meta.intensity_level} isSessionActive={gameState.meta.turn > 1} />
    </div>
  );
};

export default App;
