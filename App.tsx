


import React, { useState, useEffect, useRef } from 'react';
import { StatusPanel } from './components/StatusPanel';
import { StoryLog } from './components/StoryLog';
import { InputArea } from './components/InputArea';
import { ClusterAmbience } from './components/ClusterAmbience';
import { SimulationModal } from './components/SimulationModal';
import { VoiceControl } from './components/VoiceControl';
import { sendMessageToGemini, initializeGemini, generateAutoPlayerAction, generateSimulationAnalysis, generateHorrorImage } from './services/geminiService';
import { GameState, ChatMessage, NarrativeEvent, NpcState, SimulationConfig, VillainState, NpcRelation, DialogueState } from './types';
import { parseResponse } from './utils';
import { INITIAL_GREETING } from './constants';
import { LORE_LIBRARY } from './loreLibrary';
import { constructVoiceManifesto, updateDialogueState } from './services/dialogueEngine';
import { constructSensoryManifesto } from './services/sensoryEngine';
import { generateProceduralNpc } from './services/npcGenerator';
import { ttsService } from './services/ttsService';
import { Terminal, Cpu } from 'lucide-react';

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
    // Pacing Defaults
    target_duration: "Medium (30-50)",
    target_turn_count: 40
  },
  co_author_state: {
    name: "Unnamed", // Starts as Unnamed to trigger the Naming Phase
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
  },
  star_game: {
    is_active: false,
    turn: 0,
    boards: [],
    mira_countdown: [],
    last_resonance: ""
  }
};

/**
 * Ensures incomplete NPC states from the LLM have valid psychological fields.
 * Now also hydrates the new DialogueMemory structures.
 */
const hydrateNpcStates = (incomingNpcs: any[]): NpcState[] => {
    if (!Array.isArray(incomingNpcs)) return [];
    
    return incomingNpcs.map((npc) => {
        const psych = npc.psychology || {};
        const dialog = npc.dialogue_state || {};
        
        return {
            ...npc,
            psychology: {
                current_thought: psych.current_thought || "Processing...",
                emotional_state: psych.emotional_state || "Unknown",
                sanity_percentage: psych.sanity_percentage ?? 100,
                resilience_level: psych.resilience_level || "Moderate",
                stress_level: psych.stress_level ?? 0,
                dominant_instinct: psych.dominant_instinct || "Freeze"
            },
            dialogue_state: {
                voice_profile: dialog.voice_profile || { tone: "Neutral", vocabulary: [], quirks: [], forbidden_topics: [] },
                mood_state: dialog.mood_state || "Neutral",
                last_topic: dialog.last_topic || "",
                // NEW: Stateful Memory Logic
                memory: dialog.memory || { 
                    short_term_buffer: [], 
                    long_term_summary: npc.background_origin || "No prior history.", 
                    last_social_maneuver: null 
                },
                current_social_intent: dialog.current_social_intent || 'OBSERVE',
                conversation_history: dialog.conversation_history || [] // Legacy Support
            }
        } as NpcState;
    });
};

const calculateNpcFunctionalState = (npcStates: NpcState[]): NpcState[] => {
  return npcStates.map(npc => {
    if (npc.fracture_state === 4) return npc;

    let mobility = 100;
    let manipulation = 100;
    let perception = 100;

    const currentPain = npc.pain_level || 0;
    const currentShock = npc.shock_level || 0;

    if (currentPain > 50) {
        const painPenalty = Math.floor((currentPain - 50) / 5); 
        perception -= painPenalty;
        manipulation -= painPenalty;
    }
    if (currentShock > 30) {
        const shockPenalty = Math.floor((currentShock - 30) / 2);
        mobility -= shockPenalty;
        manipulation -= shockPenalty;
        perception -= shockPenalty;
    }

    if (npc.active_injuries && npc.active_injuries.length > 0) {
      npc.active_injuries.forEach(injury => {
        let applied = false;
        const description = (injury.description || "").toLowerCase();
        const functionalImpact = (injury.functional_impact || "").toLowerCase();
        const location = (injury.location || "").toLowerCase();
        
        const mobMatch = functionalImpact.match(/mobility reduced by (\d+)%/);
        if (mobMatch) {
            mobility -= parseInt(mobMatch[1]);
            applied = true;
        }

        const manMatch = functionalImpact.match(/manipulation reduced by (\d+)%/);
        if (manMatch) {
            manipulation -= parseInt(manMatch[1]);
            applied = true;
        }

        const perMatch = functionalImpact.match(/perception reduced by (\d+)%/);
        if (perMatch) {
            perception -= parseInt(perMatch[1]);
            applied = true;
        }

        if (!applied) {
           let penalty = 0;
           switch (injury.depth) {
               case 'SURFACE': penalty = 5; break;
               case 'DEEP_TISSUE': penalty = 20; break;
               case 'STRUCTURAL': penalty = 40; break;
               default: penalty = 5;
           }
           
           if (location.includes('leg') || location.includes('foot') || location.includes('ankle')) {
               mobility -= penalty;
           } else if (location.includes('hand') || location.includes('arm') || location.includes('shoulder')) {
               manipulation -= penalty;
           } else if (location.includes('head') || location.includes('eye')) {
               perception -= penalty;
           } else {
               mobility -= (penalty / 2);
           }
        }
      });
    }

    return {
        ...npc,
        mobility_score: Math.max(0, mobility),
        manipulation_score: Math.max(0, manipulation),
        perception_score: Math.max(0, perception)
    };
  });
};

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [history, setHistory] = useState<ChatMessage[]>([{
    role: 'model',
    text: INITIAL_GREETING,
    timestamp: Date.now()
  }]);
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationConfig, setSimulationConfig] = useState<SimulationConfig | null>(null);
  const [simulationReport, setSimulationReport] = useState<string | null>(null);
  const [showSimModal, setShowSimModal] = useState(false);
  
  const stateRef = useRef(gameState);
  
  useEffect(() => {
    stateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    if (process.env.API_KEY) {
      setApiKey(process.env.API_KEY);
      initializeGemini();
    }
  }, []);

  const handleSendMessage = async (text: string) => {
    setIsLoading(true);
    const userMsg: ChatMessage = { role: 'user', text, timestamp: Date.now() };
    setHistory(prev => [...prev, userMsg]);
    
    try {
      const imageTriggerRegex = /\b(show me|generate|create|draw|paint|picture of|image of|photo of|illustration of)\b/i;
      const wantsImage = imageTriggerRegex.test(text);

      let generatedImageUrl: string | undefined = undefined;

      if (wantsImage) {
           const cluster = gameState.meta.active_cluster;
           const visualContext = gameState.narrative.visual_motif || "";
           const prompt = `${text}. ${visualContext}`;
           
           const imageUrl = await generateHorrorImage(prompt, {
               activeCluster: cluster,
           });
           
           if (imageUrl) {
               generatedImageUrl = imageUrl;
           }
      }

      // 1. UPDATE DIALOGUE BUFFERS FOR ALL NPCs (Memory Injection)
      // We essentially "tell" the NPCs what the user just said so they can remember it next turn
      const updatedNpcsPreCall = gameState.npc_states.map(npc => {
          return updateDialogueState(npc, "User", text);
      });

      // 2. Construct Dynamic Contexts using the updated states
      const voiceManifesto = constructVoiceManifesto(updatedNpcsPreCall);
      const sensoryManifesto = constructSensoryManifesto(gameState);
      
      // 3. Send Message to Gemini
      const responseText = await sendMessageToGemini(
          text, 
          gameState.narrative.active_events,
          voiceManifesto,
          sensoryManifesto
      );
      
      // 4. Parse Response (JSON)
      const { gameState: newGameState, storyText } = parseResponse(responseText);
      
      // 5. Update State
      if (newGameState) {
        // Hydrate and clean
        const hydratedNpcs = hydrateNpcStates(newGameState.npc_states || []);
        const functionalNpcs = calculateNpcFunctionalState(hydratedNpcs);

        setGameState(prev => ({
          ...prev,
          ...newGameState,
          npc_states: functionalNpcs,
          meta: { ...prev.meta, ...newGameState.meta },
          villain_state: { ...prev.villain_state, ...newGameState.villain_state }
        }));
      }

      // 6. Add Response to History
      const modelMsg: ChatMessage = { 
          role: 'model', 
          text: storyText, 
          gameState: newGameState || undefined,
          imageUrl: generatedImageUrl,
          timestamp: Date.now() 
      };
      
      setHistory(prev => [...prev, modelMsg]);

      // 7. Trigger Text-to-Speech
      if (ttsService.getEnabled()) {
          ttsService.speak(storyText);
      }

    } catch (error) {
      console.error("Interaction failed:", error);
      const errorMsg: ChatMessage = { 
          role: 'model', 
          text: "[SYSTEM CRITICAL FAILURE] The Architect is unresponsive. Connection severed.", 
          timestamp: Date.now() 
      };
      setHistory(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isSimulating && !isLoading && simulationConfig) {
       const runSimulationTurn = async () => {
           if (gameState.meta.turn >= simulationConfig.cycles) {
               setIsSimulating(false);
               const analysis = await generateSimulationAnalysis(
                   history.map(m => `[${m.role.toUpperCase()}]: ${m.text}`).join('\n')
               );
               setSimulationReport(analysis);
               return;
           }

           const recentHistory = history.slice(-5).map(m => `[${m.role.toUpperCase()}]: ${m.text}`).join('\n');
           const action = await generateAutoPlayerAction(recentHistory, gameState, simulationConfig);
           
           await handleSendMessage(action);
       };

       const timer = setTimeout(runSimulationTurn, 2000); 
       return () => clearTimeout(timer);
    }
  }, [isSimulating, isLoading, gameState.meta.turn, simulationConfig]);


  const startSimulation = (config: SimulationConfig) => {
      setSimulationConfig(config);
      setSimulationReport(null);
      setIsSimulating(true);
  };

  return (
    <div className="flex h-screen w-full bg-void text-gray-200 overflow-hidden font-sans relative">
      
      <ClusterAmbience 
          activeCluster={gameState.meta.active_cluster} 
          weatherState={gameState.location_state.weather_state}
          threatLevel={gameState.villain_state.threat_scale}
          locationState={gameState.location_state.current_state}
      />

      <div className="relative z-10 flex w-full h-full max-w-7xl mx-auto border-x border-gray-900 shadow-2xl bg-black/40 backdrop-blur-sm">
        
        <div className="hidden lg:block h-full bg-black/60 relative z-20">
           <StatusPanel gameState={gameState} />
        </div>

        <div className="flex-1 flex flex-col h-full relative z-10">
            
            <div className="h-14 border-b border-gray-800 flex items-center justify-between px-6 bg-black/80 backdrop-blur">
                <div className="flex items-center gap-3">
                   <Terminal className="w-5 h-5 text-gray-500" />
                   <h1 className="font-serif text-xl tracking-wider text-gray-300">THE NIGHTMARE MACHINE <span className="text-xs font-mono text-gray-600 align-top ml-1">v3.1</span></h1>
                </div>
                
                <div className="flex items-center gap-4">
                    <VoiceControl 
                        onProcessAction={async (action) => {
                             await handleSendMessage(action);
                             return "Action processed."; 
                        }}
                        onInputProgress={(text, isFinal) => {
                        }}
                    />

                    <button 
                      onClick={() => setShowSimModal(true)}
                      className={`p-2 rounded hover:bg-gray-800 transition-colors ${isSimulating ? 'text-system-green animate-pulse' : 'text-gray-500'}`}
                      title="Simulation Protocol"
                    >
                       <Cpu className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <StoryLog 
               history={history} 
               isLoading={isLoading} 
               activeCluster={gameState.meta.active_cluster}
            />

            <div className="p-6 pb-8 bg-gradient-to-t from-black via-black/90 to-transparent">
                <InputArea 
                  onSend={handleSendMessage} 
                  isLoading={isLoading || isSimulating} 
                  onSnapshot={() => handleSendMessage("Generate a visual snapshot of the current scene.")}
                />
            </div>
        </div>

      </div>

      <SimulationModal 
         isOpen={showSimModal} 
         onClose={() => setShowSimModal(false)}
         onRunSimulation={startSimulation}
         isSimulating={isSimulating}
         simulationReport={simulationReport}
         initialPerspective={gameState.meta.perspective}
         initialMode={gameState.meta.mode}
         initialStart={gameState.meta.starting_point}
         initialCluster={gameState.meta.active_cluster !== "None" ? gameState.meta.active_cluster : "Flesh"}
         initialIntensity={gameState.meta.intensity_level}
      />

    </div>
  );
};

export default App;
