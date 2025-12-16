
import React, { useState, useEffect, useRef } from 'react';
import { StatusPanel } from './components/StatusPanel';
import { StoryLog } from './components/StoryLog';
import { InputArea } from './components/InputArea';
import { ClusterAmbience } from './components/ClusterAmbience';
import { SimulationModal } from './components/SimulationModal';
import { VoiceControl } from './components/VoiceControl';
import { sendMessageToGemini, initializeGemini, generateAutoPlayerAction, generateSimulationAnalysis, generateHorrorImage } from './services/geminiService';
import { GameState, ChatMessage, NarrativeEvent, NpcState, SimulationConfig, VillainState, NpcRelation } from './types';
import { parseResponse } from './utils';
import { INITIAL_GREETING } from './constants';
import { LORE_LIBRARY } from './loreLibrary';
import { constructVoiceManifesto } from './services/dialogueEngine';
import { constructSensoryManifesto } from './services/sensoryEngine';
import { generateProceduralNpc } from './services/npcGenerator';
import { ttsService } from './services/ttsService'; // Import TTS Service
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
    }
  },
  co_author_state: {
    name: "The Architect",
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
    visual_motif: "", // Default empty
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

const calculateNpcFunctionalState = (npcStates: NpcState[]): NpcState[] => {
  return npcStates.map(npc => {
    // If it's an anomaly/ghost, skip calculations
    if (npc.fracture_state === 4) return npc;

    // Reset scores to a baseline before applying penalties
    let mobility = 100;
    let manipulation = 100;
    let perception = 100;

    // 1. Global Pain/Shock Penalties (Distraction Factor)
    const currentPain = npc.pain_level || 0;
    const currentShock = npc.shock_level || 0;

    // Pain > 50 starts reducing Perception and Manipulation (Distraction)
    if (currentPain > 50) {
        const painPenalty = Math.floor((currentPain - 50) / 5); // Max ~10 penalty at 100 pain
        perception -= painPenalty;
        manipulation -= painPenalty;
    }
    // Shock > 30 reduces everything (Systemic shutdown)
    if (currentShock > 30) {
        const shockPenalty = Math.floor((currentShock - 30) / 2); // Max ~35 penalty at 100 shock
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
        const type = (injury.type || "").toLowerCase();

        // 1. Direct Regex Parsing from Functional Impact string
        // e.g. "Mobility reduced by 40%"
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

        // 2. Fallback Heuristics: If no explicit % was found, calculate based on Location & Depth
        if (!applied) {
           let penalty = 0;
           // Base penalty by depth
           switch (injury.depth) {
               case 'SURFACE': penalty = 5; break;
               case 'DEEP_TISSUE': penalty = 20; break;
               case 'STRUCTURAL': penalty = 50; break;
               default: penalty = 10;
           }

           // Modifiers by Injury Type
           if (type.includes('fracture') || type.includes('break') || type.includes('bone')) penalty += 10;
           if (type.includes('amputation') || type.includes('degloving') || type.includes('severed')) penalty += 30;
           
           // --- LOCATION MAPPING ---

           // LEGS / LOCOMOTION
           if (location.match(/(leg|femur|tibia|fibula|knee|patella|thigh|calf|hamstring|quadricep|shin)/)) {
               mobility -= penalty;
               // Severe leg injuries limit carrying capacity/balance (manipulation slightly)
               if (penalty > 20) manipulation -= 10; 
           }
           // FEET / ANKLES
           else if (location.match(/(foot|feet|ankle|heel|toe|metatarsal)/)) {
               mobility -= (penalty * 0.8); // Slightly less than whole leg, but still hinders walking
           }
           // ARMS / UPPER LIMBS
           else if (location.match(/(arm|humerus|radius|ulna|elbow|shoulder|clavicle|bicep|tricep|axilla|forearm)/)) {
               manipulation -= penalty;
               // Arm injuries affect balance slightly
               if (penalty > 30) mobility -= 10;
           }
           // HANDS / WRISTS
           else if (location.match(/(hand|wrist|palm|finger|thumb|knuckle|metacarpal)/)) {
               manipulation -= (penalty * 1.2); // Hands are critical for manipulation
           }
           // HEAD / SENSORY
           else if (location.match(/(head|skull|face|jaw|temple|scalp)/)) {
               perception -= penalty;
               // Head injuries cause dizziness
               if (penalty > 15) {
                   mobility -= 10;
                   manipulation -= 10;
               }
           }
           // EYES
           else if (location.match(/(eye|orbit|vision)/)) {
               perception -= (penalty * 2); // Eyes are critical
               manipulation -= 20; // Hard to manipulate without depth perception
           }
           // EARS
           else if (location.match(/(ear|auditory)/)) {
               perception -= penalty; 
               if (penalty > 20) mobility -= 15; // Vertigo/Balance
           }
           // TORSO / CORE
           else if (location.match(/(chest|rib|torso|abdomen|stomach|back|spine|pelvis|hip|lung|heart)/)) {
               // Core injuries affect everything moderately
               mobility -= (penalty * 0.6);
               manipulation -= (penalty * 0.4);
               // Breathing issues (Ribs/Lungs)
               if (location.includes('lung') || location.includes('rib')) {
                   mobility -= 10;
               }
               // Spine/Back issues
               if (location.includes('spine') || location.includes('back')) {
                   mobility -= 20;
                   manipulation -= 10;
               }
           }
           // NECK / THROAT
           else if (location.match(/(neck|throat|cervical|windpipe)/)) {
               perception -= 10; // Turning head is painful
               mobility -= 10;
               manipulation -= 10;
           }
           // DEFAULT FALLBACK
           else {
               // If location is vague, hit mobility slightly
               mobility -= (penalty * 0.5);
           }
        }
      });
    }

    // Clamp values
    return {
      ...npc,
      mobility_score: Math.max(0, Math.min(100, Math.round(mobility))),
      manipulation_score: Math.max(0, Math.min(100, Math.round(manipulation))),
      perception_score: Math.max(0, Math.min(100, Math.round(perception)))
    };
  });
};

const calculateNpcPsychologicalState = (npcStates: NpcState[], gameState: GameState): NpcState[] => {
  const { villain_state, location_state, meta } = gameState;
  const threat = villain_state?.threat_scale || 0;
  const cluster = meta?.active_cluster || "";
  const locationIntensity = location_state?.current_state || 0;

  return npcStates.map(npc => {
    // Skip ghosts/anomalies (State 4) as they are static narrative devices usually
    if (npc.fracture_state === 4) return npc;

    // Clone vectors to avoid mutation
    let fear = npc.fracture_vectors.fear;
    let isolation = npc.fracture_vectors.isolation;
    let guilt = npc.fracture_vectors.guilt;
    let paranoia = npc.fracture_vectors.paranoia;
    let faith = npc.fracture_vectors.faith || 0;
    let exhaustion = npc.fracture_vectors.exhaustion || 0;

    // --- 1. THE DREAD CREEP (Passive Environmental Pressure) ---
    // The higher the threat/intensity, the more the vectors climb naturally per turn.
    
    // Base creep from Threat Level
    if (threat >= 2) fear += 1;
    if (threat >= 4) { fear += 2; paranoia += 1; }
    
    // Base creep from Location Intensity (The Atmosphere)
    if (locationIntensity >= 2) {
        isolation += 1;
        paranoia += 1;
    }
    if (locationIntensity >= 3) {
        // Nightmare state affects everything
        fear += 2;
        exhaustion += 2;
    }

    // --- 2. CLUSTER RESONANCE ---
    // Certain clusters target specific vectors more aggressively.
    if (cluster.includes("Flesh")) {
        // Body Horror: Isolation (Dysmorphia) + Fear
        if (npc.active_injuries.length > 0) {
             isolation += 2; 
             fear += 2;
        }
    } else if (cluster.includes("System")) {
        // Surveillance: Paranoia
        paranoia += 2;
        if (locationIntensity >= 1) isolation += 1; // Dehumanization
    } else if (cluster.includes("Haunting")) {
        // Ghosts: Guilt (Past) + Fear
        guilt += 1;
        if (locationIntensity >= 2) fear += 2;
    } else if (cluster.includes("Self")) {
        // Psychological: Guilt + Isolation + Paranoia
        guilt += 1;
        isolation += 1;
        paranoia += 1;
    } else if (cluster.includes("Blasphemy")) {
        // Religious: Guilt + Faith (Crisis)
        guilt += 2;
        // If they have High Faith, it cracks faster here
        if (faith > 50) faith -= 2; 
    } else if (cluster.includes("Survival")) {
        // Nature: Exhaustion + Isolation
        exhaustion += 2;
        isolation += 1;
    }

    // --- 3. TRAUMA & INJURY ---
    // Physical pain translates to psychological fracture.
    if ((npc.pain_level || 0) > 30) {
        exhaustion += 2;
    }
    if ((npc.pain_level || 0) > 60) {
        fear += 3;
        // Severe pain isolates the sufferer from reality
        isolation += 2; 
    }
    // Shock causes disassociation/isolation
    if ((npc.shock_level || 0) > 40) {
        isolation += 5;
    }

    // --- 4. SOCIAL FEEDBACK ---
    // Low trust fuels paranoia
    if (npc.relationship_state.trust < 20) {
        paranoia += 3;
    }
    // High fear fuels exhaustion (adrenaline dump)
    if (fear > 80) {
        exhaustion += 1;
    }

    // --- 5. CLAMP & CALCULATE STATE ---
    fear = Math.min(100, Math.max(0, fear));
    isolation = Math.min(100, Math.max(0, isolation));
    guilt = Math.min(100, Math.max(0, guilt));
    paranoia = Math.min(100, Math.max(0, paranoia));
    faith = Math.min(100, Math.max(0, faith));
    exhaustion = Math.min(100, Math.max(0, exhaustion));

    // Determine Fracture State based on the highest pressure point or average load
    const vectors = [fear, isolation, guilt, paranoia, exhaustion];
    const maxVector = Math.max(...vectors);
    const avgVector = vectors.reduce((a, b) => a + b, 0) / vectors.length;

    let newState = npc.fracture_state;

    // State Transitions
    // State 0: Stable
    // State 1: Cracked (Signs of stress)
    // State 2: Shattered (Active delusion/panic)
    // State 3: Broken (Catatonic/Psychotic/Hostile)

    if (maxVector > 90 || avgVector > 75) {
        newState = 3;
    } else if (maxVector > 75 || avgVector > 50) {
        newState = Math.max(newState, 2);
    } else if (maxVector > 50 || avgVector > 30) {
        newState = Math.max(newState, 1);
    }

    // Update Disassociation Index based on Isolation/Shock
    let newDisassociation = npc.disassociation_index;
    if (isolation > 80 || (npc.shock_level || 0) > 70) {
        newDisassociation = Math.min(1.0, newDisassociation + 0.1);
    } else if (isolation < 40 && (npc.shock_level || 0) < 20) {
        // Recovery if safe
        newDisassociation = Math.max(0.0, newDisassociation - 0.05);
    }

    // If State 3, trigger specific psychological flags if not already set
    let breakingPointResult = npc.breaking_point_result;
    if (newState === 3 && npc.fracture_state < 3) {
        // Just broke
        breakingPointResult = breakingPointResult || "PSYCHOTIC BREAK";
    }

    return {
        ...npc,
        fracture_vectors: { fear, isolation, guilt, paranoia, faith, exhaustion },
        fracture_state: newState,
        breaking_point_result: breakingPointResult,
        disassociation_index: parseFloat(newDisassociation.toFixed(2))
    };
  });
};

// Applies passive relationship shifts based on simulation rules
const calculateNpcSocialState = (npcStates: NpcState[], villainState: VillainState): NpcState[] => {
  return npcStates.map(npc => {
    if (npc.fracture_state === 4) return npc; // Ignore ghosts

    // --- 1. PLAYER RELATIONSHIP DYNAMICS ---
    let { trust, fear } = npc.relationship_state;

    // Passive Fear Gain from Threat Level (The Dread Creep)
    if (villainState.threat_scale >= 3) {
      fear += 2; // Gradual creep
    }
    if (villainState.threat_scale >= 4) {
      fear += 5; // Panic acceleration
    }

    // Pain induced Fear
    if ((npc.pain_level || 0) > 60) {
      fear += 3;
    }

    // Panic erodes Trust (Irrationality)
    if (fear > 80) {
      trust -= 2; 
    }

    // Decay of Trust in High Isolation (Paranoia)
    if (npc.fracture_vectors.isolation > 70) {
        trust -= 1;
    }

    // --- 2. INTER-NPC DYNAMICS (EXPANDED) ---
    // Iterate through current relationships and update them
    let newRelationships: Record<string, NpcRelation> = {};
    if (npc.relationships_to_other_npcs) {
        Object.keys(npc.relationships_to_other_npcs).forEach(targetName => {
            let rel = { ...npc.relationships_to_other_npcs[targetName] };
            
            // If the relationship is just a string (old format), we should have caught it in hydration, 
            // but for safety, if it's missing or malformed, skip logic.
            if (typeof rel !== 'object') return;

            // -- Logic A: Paranoia Poisoning --
            if (npc.fracture_vectors.paranoia > 50) {
                rel.trust -= 2; // Paranoia makes you trust everyone less
            }

            // -- Logic B: The Fear of the Broken --
            // Find the target NPC to check their state
            const target = npcStates.find(t => t.name === targetName);
            if (target) {
                // If target is Broken/Psychotic (State 3), fear increases massively
                if (target.fracture_state === 3) {
                    rel.fear += 5;
                    rel.trust -= 5;
                }
                
                // If target is severely injured (Pain > 70), specific archetypes react differently
                if ((target.pain_level || 0) > 70) {
                    // "The Burden" archetypes might fear being dragged down
                    if (npc.archetype.includes("Burden") || npc.archetype.includes("Coward")) {
                        rel.trust -= 2;
                    }
                    // "The Medic/Protector" archetypes gain trust (purpose)
                    if (npc.archetype.includes("Medic") || npc.archetype.includes("Protector")) {
                        rel.trust += 2;
                    }
                }
            }

            // Clamp
            rel.trust = Math.max(0, Math.min(100, rel.trust));
            rel.fear = Math.max(0, Math.min(100, rel.fear));

            newRelationships[targetName] = rel;
        });
    }

    // Clamp values 0-100 for Player Relation
    return {
      ...npc,
      relationship_state: {
        ...npc.relationship_state,
        trust: Math.max(0, Math.min(100, trust)),
        fear: Math.max(0, Math.min(100, fear))
      },
      relationships_to_other_npcs: newRelationships
    };
  });
};

const parseRelationshipString = (descriptor: string): NpcRelation => {
    const d = descriptor.toLowerCase();
    let trust = 50;
    let fear = 10;
    
    if (d.includes("ally") || d.includes("friend") || d.includes("partner") || d.includes("love") || d.includes("alliance")) {
        trust = 80; fear = 5;
    } else if (d.includes("rival") || d.includes("competitor")) {
        trust = 30; fear = 20;
    } else if (d.includes("enemy") || d.includes("hate") || d.includes("distrust")) {
        trust = 10; fear = 40;
    } else if (d.includes("fear") || d.includes("terrified")) {
        trust = 10; fear = 90;
    } else if (d.includes("pity")) {
        trust = 60; fear = 5;
    } else if (d.includes("disgust")) {
        trust = 20; fear = 20;
    } else if (d.includes("dependence")) {
        trust = 90; fear = 40;
    }
    
    return { trust, fear, descriptor };
};

// Helper to hydrate/enrich NPC states
const hydrateNpcStates = (gameState: GameState): NpcState[] => {
  const activeCluster = gameState.meta?.active_cluster || "Flesh";
  const intensity = gameState.meta?.intensity_level || "R";
  
  // 1. Initial Injection: If no NPCs exist and it's Survivor mode, spawn procedural default
  const isVillainMode = gameState.meta.mode === 'Villain';
  
  if (!gameState.npc_states || gameState.npc_states.length === 0) {
    if (isVillainMode) return [];

    // Auto-generate 2 companions for a Survivor start if none provided
    const npc1 = generateProceduralNpc(activeCluster, intensity);
    const npc2 = generateProceduralNpc(activeCluster, intensity);
    return [npc1, npc2];
  }

  // 2. Enrichment: If NPCs exist but lack deep data (from simple AI generation), hydrate them
  return gameState.npc_states.map(npc => {
    // Skip anomalies/ghosts
    if (npc.fracture_state === 4) return npc;

    // Check if deep data is missing (checking 'personality' as a flag)
    if (!npc.personality) {
        // Generate a template based on the cluster
        const template = generateProceduralNpc(activeCluster, intensity);
        
        return {
            ...npc,
            personality: template.personality,
            physical: template.physical,
            psychology: {
                current_thought: "What is happening?",
                emotional_state: "Confusion",
                sanity_percentage: 100,
                resilience_level: "Moderate"
            },
            background_origin: npc.archetype || "Unknown",
            generated_traits: template.generated_traits,
            // Retain existing name/archetype if present, else fallbacks
            name: npc.name || template.name,
            archetype: npc.archetype || template.archetype,
        };
    }
    return npc;
  });
};

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  
  // Background Image State
  const [bgImage, setBgImage] = useState<string | null>(null);
  const lastVisualParams = useRef({ motif: "", cluster: "" });
  
  // Simulation State
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationReport, setSimulationReport] = useState<string | null>(null);
  const isSimulatingRef = useRef(false); // Ref for loop access

  // Voice Input State
  const [voiceInputText, setVoiceInputText] = useState("");

  // Initialize with greeting once ready
  useEffect(() => {
    initializeGemini();
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady && history.length === 0) {
      setHistory([{
        role: 'model',
        text: INITIAL_GREETING,
        timestamp: Date.now()
      }]);
    }
  }, [isReady, history.length]);

  // --- VISUAL ENGINE HANDLER ---
  useEffect(() => {
    const handleVisuals = async () => {
      // 1. Background Generation
      const currentMotif = gameState.narrative.visual_motif;
      const currentCluster = gameState.meta.active_cluster;

      if (currentMotif && currentMotif.length > 5) {
         if (currentMotif !== lastVisualParams.current.motif || currentCluster !== lastVisualParams.current.cluster) {
             console.log("Generating background for:", currentMotif);
             lastVisualParams.current = { motif: currentMotif, cluster: currentCluster };
             try {
               // Use 16:9 for cinematic background
               const bgUrl = await generateHorrorImage(
                  currentMotif, 
                  { activeCluster: currentCluster, aspectRatio: "16:9" }
               );
               if (bgUrl) setBgImage(bgUrl);
             } catch (e) {
               console.error("BG Gen failed", e);
             }
         }
      }

      // 2. Illustration Requests (Manual user request only)
      if (gameState.narrative.illustration_request) {
        console.log("Generating illustration for:", gameState.narrative.illustration_request);
        try {
          const illusUrl = await generateHorrorImage(
             gameState.narrative.illustration_request, 
             { activeCluster: gameState.meta.active_cluster, aspectRatio: "16:9" }
          );
          if (illusUrl) {
            setHistory(prev => [...prev, {
              role: 'model',
              text: `[NEURAL VISUALIZATION GENERATED]`,
              imageUrl: illusUrl,
              timestamp: Date.now()
            }]);
            
            setGameState(prev => ({
              ...prev,
              narrative: {
                ...prev.narrative,
                illustration_request: null
              }
            }));
          }
        } catch (e) {
          console.error("Illustration failed", e);
        }
      }
    };

    handleVisuals();
  }, [gameState.narrative.visual_motif, gameState.narrative.illustration_request, gameState.meta.active_cluster]);

  // Unified function to handle game actions
  const processGameTurn = async (text: string, injectedEvents?: NarrativeEvent[]): Promise<string> => {
    // Add user message immediately
    const userMsg: ChatMessage = { role: 'user', text, timestamp: Date.now() };
    setHistory(prev => [...prev, userMsg]);
    setIsLoading(true);
    // Clear voice input display when processed
    setVoiceInputText(""); 

    try {
      // 1. DIALOGUE ENGINE: Generate Voice Manifesto
      const dialogueManifesto = constructVoiceManifesto(gameState.npc_states);

      // 2. SENSORY ENGINE: Generate Sensory Manifesto
      const sensoryManifesto = constructSensoryManifesto(gameState);

      // 3. SEND TO GEMINI (with injected manifestos)
      const rawResponse = await sendMessageToGemini(text, injectedEvents, dialogueManifesto, sensoryManifesto);
      const { gameState: newState, storyText } = parseResponse(rawResponse);

      if (newState) {
        // --- NPC HYDRATION & ENRICHMENT ---
        // Ensure all NPCs have deep psychological profiles (NPC Engine V2)
        newState.npc_states = hydrateNpcStates(newState);
        
        // --- FUNCTIONAL SCORE CALCULATION ---
        if (newState.npc_states && newState.npc_states.length > 0) {
            newState.npc_states = calculateNpcFunctionalState(newState.npc_states);
            newState.npc_states = calculateNpcPsychologicalState(newState.npc_states, newState);
            newState.npc_states = calculateNpcSocialState(newState.npc_states, newState.villain_state);
        }

        setGameState(newState);
      }

      const aiMsg: ChatMessage = {
        role: 'model',
        text: storyText,
        gameState: newState || undefined,
        timestamp: Date.now()
      };

      setHistory(prev => [...prev, aiMsg]);

      // --- TEXT TO SPEECH NARRATION ---
      // Trigger TTS if enabled in VoiceControl
      ttsService.speak(storyText);

      return storyText;

    } catch (error: any) {
      console.error(error);
      
      let errorText = "[SYSTEM ERROR] Connection to the Nightmare Machine lost. Please try again.";
      const errorMessage = error?.message || '';
      if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota') || error?.status === 429) {
          errorText = "[CRITICAL FAILURE] Neural Link Severed: API Quota Exceeded.";
      }

      const errorMsg: ChatMessage = {
        role: 'model',
        text: errorText,
        timestamp: Date.now()
      };
      setHistory(prev => [...prev, errorMsg]);
      return errorText;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (text: string) => {
    processGameTurn(text);
  };

  const handleVoiceAction = async (action: string) => {
    // We let the voice input flow naturally to the input box via handleVoiceProgress
    // But when the final action is committed by the Live Client tool, we process it here.
    return processGameTurn(action);
  };

  // New handler for streaming voice text
  const handleVoiceProgress = (text: string, isFinal: boolean) => {
      // We buffer the text into the input box so the user sees it.
      // If it's final (turn complete), we might clear it, but usually the tool call 
      // happens before turn complete, which clears it in processGameTurn.
      if (!isLoading) {
          setVoiceInputText(prev => {
              // Simple logic: if text is accumulated, replace. 
              // The API usually sends the full current utterance.
              return text;
          });
      }
  };

  // Handler for manual image generation (Snapshot)
  const handleSnapshot = async () => {
     if (isLoading) return;
     setIsLoading(true);

     try {
       // Gather context
       const locationDesc = `${gameState.location_state.name} (${gameState.location_state.archetype})`;
       const visualMotif = gameState.narrative.visual_motif || "Dark horror";
       
       const sensory = gameState.location_state.dominant_sensory_palette;
       const sensoryDesc = (sensory && sensory.primary_sense !== "None") 
          ? `Dominant Sensation: ${sensory.primary_sense}, ${sensory.secondary_sense}.` 
          : "";

       const npcDesc = gameState.npc_states
         .filter(n => n.fracture_state < 4) // Living NPCs
         .map(n => `${n.name} looks like ${n.demographics?.appearance || n.archetype}`)
         .join(". ");

       const recentEvents = history.slice(-2).filter(m => m.role === 'model').map(m => m.text).join(" ");
       
       const prompt = `
         Visualize this scene from a horror story.
         Location: ${locationDesc}.
         Visual Motif: ${visualMotif}.
         ${sensoryDesc}
         Characters: ${npcDesc}.
         The Situation: ${recentEvents.substring(0, 500)}.
       `;
       
       const imageUrl = await generateHorrorImage(
         prompt, 
         { 
           activeCluster: gameState.meta.active_cluster, 
           aspectRatio: "16:9",
         }
       );
       
       if (imageUrl) {
         setHistory(prev => [...prev, {
           role: 'model',
           text: `[SCENE CAPTURE]`,
           imageUrl: imageUrl,
           timestamp: Date.now()
         }]);
       }
     } catch(e) {
       console.error("Snapshot error", e);
     } finally {
       setIsLoading(false);
     }
  };

  const runSimulation = async (config: SimulationConfig) => {
     setIsSimulating(true);
     isSimulatingRef.current = true;
     setSimulationReport(null);

     try {
         // Loop Access Fix: We track the current context manually to avoid stale closures
         let currentContext = history.length > 0 ? history[history.length - 1].text : INITIAL_GREETING;

         for (let i = 0; i < config.cycles; i++) {
             if (!isSimulatingRef.current) break;

             // 1. Generate Player Action
             const action = await generateAutoPlayerAction(currentContext, gameState, config);
             
             // 2. Submit to Game Engine
             const newStoryText = await processGameTurn(action);
             
             // Update context for next iteration
             currentContext = newStoryText;
             
             await new Promise(resolve => setTimeout(resolve, 2000));
         }

         // Generate Analysis
         if (isSimulatingRef.current) {
             const fullLog = historyRef.current.map(m => `[${m.role.toUpperCase()}]: ${m.text}`).join('\n\n');
             const report = await generateSimulationAnalysis(fullLog);
             setSimulationReport(report);
         }

     } catch (e) {
         console.error("Simulation failed", e);
         setSimulationReport("Simulation sequence aborted due to error or instability.");
     } finally {
         setIsSimulating(false);
         isSimulatingRef.current = false;
     }
  };

  // Ref to track history for the async simulation loop
  const historyRef = useRef(history);
  useEffect(() => {
      historyRef.current = history;
  }, [history]);

  const closeSimulation = () => {
      isSimulatingRef.current = false; // Stop loop
      setIsSimulating(false);
      setIsSimModalOpen(false);
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-black overflow-hidden relative">
      
      {/* Generated Background Layer */}
      {bgImage && (
        <div className="absolute inset-0 z-0 transition-opacity duration-1000 opacity-20">
            <img 
              src={bgImage} 
              alt="Atmospheric Background" 
              className="w-full h-full object-cover filter grayscale blur-[1px] brightness-50"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_20%,black_100%)]"></div>
        </div>
      )}

      {/* Background Ambience Effect */}
      <ClusterAmbience 
        activeCluster={gameState.meta?.active_cluster || "None"} 
        weatherState={gameState.location_state?.weather_state || "Clear"}
        threatLevel={gameState.villain_state?.threat_scale || 0}
        locationState={gameState.location_state?.current_state || 0}
      />

      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsMobilePanelOpen(!isMobilePanelOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 bg-gray-900 p-2 rounded border border-gray-700 text-gray-200"
      >
        <Terminal className="w-5 h-5" />
      </button>

      {/* Main Story Area */}
      <div className="flex-1 flex flex-col h-full relative z-10">
        <header className="absolute top-0 left-0 w-full p-6 pointer-events-none flex justify-center opacity-50 z-30">
          <h1 className="text-3xl font-serif tracking-widest text-red-900/40 uppercase font-bold mix-blend-screen hidden md:block">
            The Nightmare Machine
          </h1>
        </header>

        {/* Controls Container: Simulation & Voice */}
        <div className="absolute top-4 left-4 z-40 flex flex-col gap-2 items-start">
            <button 
                onClick={() => setIsSimModalOpen(true)}
                className="bg-black/80 hover:bg-gray-900 border border-system-green/50 text-system-green p-2 rounded-sm backdrop-blur transition-all flex items-center gap-2 group shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                title="Open Simulation Protocol"
            >
                <Cpu className="w-5 h-5 group-hover:animate-pulse" />
                <span className="hidden group-hover:block font-mono text-xs uppercase tracking-widest">Simulate</span>
            </button>
            
            <VoiceControl 
                onProcessAction={handleVoiceAction} 
                onInputProgress={handleVoiceProgress} // Connect voice stream to app state
            />
        </div>

        <StoryLog 
          history={history} 
          isLoading={isLoading} 
          activeCluster={gameState.meta?.active_cluster}
        />
        
        <div className="p-4 bg-gradient-to-t from-black via-black to-transparent z-20">
          <InputArea 
            onSend={handleSendMessage} 
            onSnapshot={handleSnapshot}
            isLoading={isLoading || isSimulating} 
            inputType={gameState.narrativeFlags?.input_type || 'text'}
            externalValue={voiceInputText} // Pass voice text to input box
          />
        </div>
      </div>

      {/* Status Panel (Sidebar) */}
      <div className={`
        fixed inset-y-0 right-0 z-40 w-80 transform transition-transform duration-300 ease-in-out lg:relative lg:transform-none lg:w-96
        ${isMobilePanelOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <StatusPanel gameState={gameState} />
      </div>
      
      {/* Mobile Overlay */}
      {isMobilePanelOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-30 lg:hidden"
          onClick={() => setIsMobilePanelOpen(false)}
        />
      )}

      {/* Simulation Modal */}
      <SimulationModal 
        isOpen={isSimModalOpen}
        onClose={closeSimulation}
        onRunSimulation={runSimulation}
        isSimulating={isSimulating}
        simulationReport={simulationReport}
        initialPerspective={gameState.meta.perspective}
        initialMode={gameState.meta.mode}
        initialStart={gameState.meta.starting_point}
        initialCluster={gameState.meta.active_cluster}
        initialIntensity={gameState.meta.intensity_level}
      />
      
    </div>
  );
};

export default App;
