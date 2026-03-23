
import { useState, useCallback, useEffect, useRef, useReducer } from 'react';
import { get, set, del } from 'idb-keyval';
import { GameState, ChatMessage, SimulationConfig, NpcState, NarrativePhase } from '../types';
import { getDefaultLocationState } from '../services/locationEngine';
import { generateProceduralNpc } from '../services/npcGenerator';
import { processGameTurn, generateAutoPlayerAction, initializeGemini, summarizeHistory, evaluateNarrativeTransition, classifyUserIntent, generateArchitectResponse } from '../services/geminiService';
import { useAutoPilot } from './useAutoPilot';
import { useArchitectStore } from '../store/architectStore';
import { updateNpcMemories } from '../services/memorySystem';

export interface SaveSlot {
    id: string;
    timestamp: number;
    name: string;
    summary: string;
    gameState: GameState;
    history: ChatMessage[];
}

const DEFAULT_GAME_STATE: GameState = {
    meta: { turn: 50, perspective: 'First Person', mode: 'Survivor', intensity_level: 'Level 3', active_cluster: 'None' },
    villain_state: { name: 'Unknown', archetype: 'Unknown', threat_scale: 0, primary_goal: 'Unknown', current_tactic: 'None' },
    npc_states: [],
    location_state: getDefaultLocationState(),
    narrative: { visual_motif: '', illustration_request: null, past_summary: '' },
    suggested_actions: []
};

// --- REDUCER DEFINITIONS ---

export type GameAction = 
  | { type: 'UPDATE_FULL_STATE'; payload: GameState }
  | { type: 'PATCH_STATE'; payload: Partial<GameState> }
  | { type: 'SET_TURN'; payload: number }
  | { type: 'UPDATE_NPC'; payload: { index: number; updates: Partial<NpcState> } }
  | { type: 'APPEND_SUMMARY'; payload: string }
  | { type: 'UPDATE_LOCATION_IMAGE'; payload: string };

const gameReducer = (state: GameState, action: GameAction): GameState => {
    switch (action.type) {
        case 'UPDATE_FULL_STATE':
            return action.payload;
        case 'PATCH_STATE':
            return { ...state, ...action.payload };
        case 'SET_TURN':
            return { 
                ...state, 
                meta: { ...state.meta, turn: action.payload } 
            };
        case 'UPDATE_NPC':
            const newNpcs = [...state.npc_states];
            if (newNpcs[action.payload.index]) {
                newNpcs[action.payload.index] = { 
                    ...newNpcs[action.payload.index], 
                    ...action.payload.updates 
                };
            }
            return { ...state, npc_states: newNpcs };
        case 'APPEND_SUMMARY':
            return {
                ...state,
                narrative: {
                    ...state.narrative,
                    past_summary: (state.narrative.past_summary || "") + "\n\n" + action.payload
                }
            };
        case 'UPDATE_LOCATION_IMAGE':
            return {
                ...state,
                location_state: {
                    ...state.location_state,
                    current_environment_image: action.payload
                }
            };
        default:
            return state;
    }
};

const applyStateCommands = (currentState: GameState, commands: any[]): GameState => {
    let newState = { ...currentState };
    newState.npc_states = [...newState.npc_states];
    
    for (const cmd of commands) {
        const { action, target_id, value, reason } = cmd;
        const npcIndex = newState.npc_states.findIndex(n => n.name === target_id);
        const isPlayer = target_id === currentState.meta.player_profile?.name || target_id === 'player';
        
        let targetNpc = npcIndex !== -1 ? { ...newState.npc_states[npcIndex] } : null;
        
        switch (action) {
            case 'DAMAGE_ENTITY':
                if (targetNpc) {
                    targetNpc.active_injuries = [...targetNpc.active_injuries, { location: 'Unknown', type: 'Damage', description: String(value) }];
                }
                break;
            case 'HEAL_ENTITY':
                if (targetNpc && targetNpc.active_injuries.length > 0) {
                    targetNpc.active_injuries = targetNpc.active_injuries.slice(1);
                }
                break;
            case 'UPDATE_STRESS':
                if (targetNpc) {
                    targetNpc.psychology = { ...targetNpc.psychology, stress_level: targetNpc.psychology.stress_level + Number(value) };
                }
                break;
            case 'MOVE_ROOM':
                newState.location_state = { ...newState.location_state, current_room_id: String(value) };
                break;
            case 'ADD_INVENTORY':
                if (targetNpc) {
                    targetNpc.resources_held = [...targetNpc.resources_held, String(value)];
                }
                break;
            case 'CONSUME_ITEM':
                if (targetNpc) {
                    targetNpc.resources_held = targetNpc.resources_held.filter(i => i !== String(value));
                }
                break;
            case 'ADVANCE_VILLAIN_AGENDA':
                newState.villain_state = { ...newState.villain_state, threat_scale: newState.villain_state.threat_scale + Number(value) };
                break;
            default:
                console.warn(`Unknown command action: ${action} for target ${target_id}`);
        }
        
        if (targetNpc && npcIndex !== -1) {
            newState.npc_states[npcIndex] = targetNpc;
        }
    }
    
    return newState;
};

export const useGameEngine = () => {
    // --- STATE ---
    const [isInitialized, setIsInitialized] = useState(false);
    
    // Core Game Data (Reducer)
    const [gameState, dispatch] = useReducer(gameReducer, DEFAULT_GAME_STATE);
    
    // Use persisted chat history from the Architect Store
    const history = useArchitectStore(state => state.messages);
    const setHistory = useArchitectStore(state => state.setMessages);

    // UI/Process State
    const [isLoading, setIsLoading] = useState(false);
    const [autoMode, setAutoMode] = useState({ active: false, remainingCycles: 0 });
    
    // Streaming State
    const [logicStream, setLogicStream] = useState("");
    const [narrativeStream, setNarrativeStream] = useState("");
    const [streamPhase, setStreamPhase] = useState<'logic' | 'narrative'>('logic');

    // Refs for safety (avoid stale closures in timeouts)
    const processingRef = useRef(false);
    const turnRef = useRef(gameState.meta.turn);
    const isSummarizing = useRef<boolean>(false);

    // Sync turnRef with state
    useEffect(() => {
        turnRef.current = gameState.meta.turn;
    }, [gameState.meta.turn]);

    // Initialize Service immediately
    useEffect(() => {
        // Use GEMINI_API_KEY as primary, fallback to API_KEY (selected via dialog)
        const key = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
        initializeGemini(key);
    }, []);

    // --- ACTIONS ---

    const initializeGame = useCallback((config: SimulationConfig) => {
        // 1. DETERMINISTIC GENERATION
        let initialNpcs: NpcState[] = [];
        const usedNames = new Set<string>();
        const takenRoles = new Set<string>();

        const isVillainMode = config.mode === 'Villain';
        const playerName = isVillainMode ? config.villain_name : config.survivor_name;

        if (config.pre_generated_npcs && config.pre_generated_npcs.length > 0) {
            initialNpcs = config.pre_generated_npcs;
        } else if (config.parsed_characters && config.parsed_characters.length > 0) {
            // Filter out the active player so they aren't duplicated as an NPC
            const npcCharacters = config.parsed_characters.filter(c => c.name !== playerName);
            
            initialNpcs = npcCharacters.map(c => {
                // Generate a procedural base for stats/mechanics
                const base = generateProceduralNpc(config.cluster, config.intensity, usedNames, config.lore_context, takenRoles);
                
                // Overwrite with High-Fidelity Source Lore
                const deepLore = `[SOURCE MATERIAL]: ${c.name} is a ${c.role}. ${c.description}. Traits: ${c.traits}`;
                
                return {
                    ...base,
                    name: c.name,
                    archetype: c.role,
                    background_origin: deepLore,
                    personality: {
                        ...base.personality,
                        dominant_trait: c.traits || base.personality.dominant_trait
                    },
                    dialogue_state: {
                        ...base.dialogue_state,
                        memory: {
                            ...base.dialogue_state.memory,
                            long_term_summary: deepLore
                        }
                    }
                };
            });
        } else {
            const victimCount = config.victim_count || 3;
            initialNpcs = Array.from({ length: victimCount }).map(() => 
                generateProceduralNpc(config.cluster, config.intensity, usedNames, config.lore_context, takenRoles)
            );
        }

        const playerProfile = isVillainMode 
            ? {
                name: config.villain_name || "The Entity",
                background: `ROLE: Antagonist. ARCHETYPE: ${config.villain_appearance}. GOAL: ${config.primary_goal}.`,
                traits: config.villain_methods || "Cruelty"
            }
            : {
                name: config.survivor_name || "The Survivor",
                background: config.survivor_background || "A survivor caught in a nightmare.",
                traits: config.survivor_traits || "Will to live"
            };

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
            npc_states: initialNpcs,
            location_state: {
                ...getDefaultLocationState(),
                architectural_notes: config.location_description ? [config.location_description] : []
            },
            narrative: {
                visual_motif: config.visual_motif || "Standard Cinematic",
                illustration_request: "Establishing Shot",
                // CRITICAL: Inject the Source Material Plot Hook directly into the narrative engine's memory
                past_summary: config.plot_hook ? `[CORE DIRECTIVE / LORE]:\n${config.plot_hook}\n\n` : "",
                transition_gate: config.transition_gate
            },
            lore_context: config.lore_context,
            suggested_actions: []
        };
        
        dispatch({ type: 'UPDATE_FULL_STATE', payload: newState });
        setHistory([]); 
        setIsInitialized(true);
        
        if (config.cycles > 0) {
            setAutoMode({ active: true, remainingCycles: config.cycles });
        }
        
        handleSendMessage("BEGIN SIMULATION. ESTABLISH CONTEXT.", [], newState);
    }, []);

    const handleSendMessage = useCallback(async (text: string, files: File[] = [], overrideState?: GameState) => {
        if (processingRef.current) return;
        
        processingRef.current = true;
        setIsLoading(true);
        setLogicStream("");
        setNarrativeStream("");
        setStreamPhase('logic');

        try {
            // Phase 1: Intent Routing
            const intent = await classifyUserIntent(text);
            if (intent === 'SYSTEM_COMMAND' || intent === 'OOC_CLARIFICATION') {
                const architectMemory = useArchitectStore.getState().memory;
                const architectResponse = await generateArchitectResponse(
                    history.concat({ role: 'user', text, timestamp: Date.now() }), 
                    "You are the Architect, a helpful AI companion.",
                    overrideState || gameState,
                    architectMemory
                );
                setHistory(prev => [...prev, { role: 'user', text, timestamp: Date.now() }, { role: 'model', text: architectResponse, timestamp: Date.now() }]);
                setIsLoading(false);
                processingRef.current = false;
                return;
            }

            // --- NARRATIVE METRONOME (Step 1 & 3) ---
            const { narrative: metronome, incrementTurnCount, advancePhase } = useArchitectStore.getState();
            incrementTurnCount();
            
            // Get updated metronome state (for CURRENT turn context)
            const updatedMetronome = useArchitectStore.getState().narrative;

            if (!text.includes("BEGIN SIMULATION")) {
                setHistory(prev => [...prev, { role: 'user', text, timestamp: Date.now() }]);
            }

            const currentState = overrideState || gameState;
            
            // processGameTurn now returns { stateCommands, narrativeMetadata, storyText, imagePromise }
            const result = await processGameTurn(currentState, updatedMetronome, text, history, files, (chunk, phase) => {
                setStreamPhase(phase);
                if (phase === 'logic') setLogicStream(prev => prev + chunk);
                else setNarrativeStream(prev => prev + chunk);
            });
            
            // Apply commands
            let newState = applyStateCommands(currentState, result.stateCommands);
            
            const messageTimestamp = Date.now();
            const newMessage: ChatMessage = {
                role: 'model',
                text: result.storyText,
                gameState: newState,
                imageUrl: undefined, // Initially undefined
                timestamp: messageTimestamp
            };
            
            const userMessage: ChatMessage = {
                role: 'user',
                text,
                timestamp: Date.now()
            };
            
            const recentHistory = [...history, userMessage, newMessage];
            newState = updateNpcMemories(newState, recentHistory, result.narrativeMetadata.entities_addressed);
            
            // Semantic Trigger (Step 3 & 4)
            if ((result.narrativeMetadata.narrative_escalation || Math.abs(result.narrativeMetadata.tension_delta) >= 3) && metronome.currentPhase !== 'Resolution') {
                let condition = "";
                let nextPhase: NarrativePhase | null = null;

                switch (metronome.currentPhase) {
                    case 'Act1_Setup':
                        // RPP: Use the custom transition gate if available, otherwise fallback to the default
                        condition = gameState.narrative.transition_gate || "Has the user clearly committed to investigating the anomaly or been trapped by the nightmare? (The Inciting Incident is fully engaged; user cannot walk away).";
                        nextPhase = 'Act2_RisingAction';
                        break;
                    case 'Act2_RisingAction':
                        condition = "Has the user faced significant escalating resistance and reached a 'Midpoint' or 'All-Is-Lost' moment where they must confront the primary antagonist or concept?";
                        nextPhase = 'Act3_Climax';
                        break;
                    case 'Act3_Climax':
                        condition = "Has the user made a definitive choice or has the core tension been resolved?";
                        nextPhase = 'Resolution';
                        break;
                }

                if (nextPhase && condition) {
                    evaluateNarrativeTransition(history, condition).then(async (evalResult) => {
                        if (evalResult.conditionMet) {
                            console.log(`[NARRATIVE ARCHITECT]: Advancing to ${nextPhase}. Reason: ${evalResult.reason}`);
                            
                            // --- EPISODIC COMPRESSION (Step 4) ---
                            if (nextPhase === 'Act3_Climax') {
                                console.log("[NARRATIVE ARCHITECT]: Executing Episodic Compression for Climax...");
                                const historyToSummarize = [...history, userMessage, newMessage];
                                const summarizedTimestamps = historyToSummarize.map(msg => msg.timestamp);
                                const summary = await summarizeHistory(historyToSummarize);
                                if (summary) {
                                    // Update GameState with the new summary and purge history
                                    dispatch({ type: 'APPEND_SUMMARY', payload: summary });
                                    // Purge old messages from the active context array to free up tokens
                                    // We keep the last 2 messages for immediate continuity
                                    const timestampsToRemove = summarizedTimestamps.slice(0, -2);
                                    setHistory(prev => prev.filter(msg => !timestampsToRemove.includes(msg.timestamp)));
                                }
                            }

                            advancePhase(nextPhase as NarrativePhase);
                        }
                    }).catch(err => console.error("Narrative evaluation failed", err));
                }
            }
            
            // 1. Immediate Update: State and Text
            dispatch({ type: 'UPDATE_FULL_STATE', payload: newState });
            
            // CONTEXT WINDOW HYGIENE (Rolling Summary)
            // If history gets too long (e.g. > 20 turns), trim it and summarize the oldest chunk.
            if (history.length > 20 && !isSummarizing.current) {
                isSummarizing.current = true;
                const PRUNE_COUNT = 10;
                const historyToSummarize = history.slice(0, PRUNE_COUNT);
                
                // Keep history intact while summarizing
                setHistory(prev => [...prev, newMessage]);
                
                const summarizedTimestamps = historyToSummarize.map(msg => msg.timestamp);

                // Trigger summary generation in background
                summarizeHistory(historyToSummarize).then(summary => {
                    if (summary) {
                        dispatch({ type: 'APPEND_SUMMARY', payload: `[ARCHIVED MEMORY]: ${summary}` });
                        // Filter the state history against these specific timestamps
                        setHistory(prev => prev.filter(msg => !summarizedTimestamps.includes(msg.timestamp)));
                    }
                }).catch(err => console.error("Summary failed", err)).finally(() => {
                    isSummarizing.current = false;
                });

            } else {
                setHistory(prev => [...prev, newMessage]);
            }

            setIsLoading(false); // Unlock UI immediately for next turn

            // 2. Deferred Update: Image (Non-Blocking)
            if (result.imagePromise) {
                result.imagePromise.then(imageUrl => {
                    if (imageUrl) {
                        dispatch({ type: 'UPDATE_LOCATION_IMAGE', payload: imageUrl });
                    }
                }).catch(err => console.error("Background Image Generation Failed", err));
            }

        } catch (e: any) {
            console.error("Game Loop Error:", e);
            
            const isRateLimit = e?.message === "RATE_LIMIT_EXCEEDED" || e?.status === 429 || e?.message?.includes('429') || e?.message?.includes('Rate Limit') || e?.message?.includes('quota');
            
            setHistory(prev => [...prev, { 
                role: 'model', 
                text: isRateLimit 
                    ? "SYSTEM HALT: Cognitive Overload (Rate Limit Exceeded). Please wait before continuing." 
                    : "CRITICAL FAILURE: Simulation Desync.", 
                timestamp: Date.now() 
            }]);
            setIsLoading(false);
            setAutoMode({ active: false, remainingCycles: 0 });
        } finally {
            processingRef.current = false;
        }
    }, [gameState, history]); 

    const resetGame = useCallback(() => {
        setAutoMode({ active: false, remainingCycles: 0 });
        setHistory([]);
        dispatch({ type: 'UPDATE_FULL_STATE', payload: DEFAULT_GAME_STATE });
        setIsInitialized(false);
    }, []);

    // --- SAVE / LOAD SYSTEM (Directive 1: Migrated to IndexedDB) ---

    const getSaves = async (): Promise<SaveSlot[]> => {
        try {
            const data = await get<SaveSlot[]>('nightmare_machine_saves');
            return data || [];
        } catch (e) {
            console.error("Failed to read saves", e);
            return [];
        }
    };

    const saveSession = async (name: string) => {
        try {
            const saves = await getSaves();
            const newSlot: SaveSlot = {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                name: name || `Session ${saves.length + 1}`,
                summary: `Turn ${gameState.meta.turn} - ${gameState.meta.active_cluster}`,
                gameState: gameState,
                history: history
            };
            const updatedSaves = [newSlot, ...saves];
            await set('nightmare_machine_saves', updatedSaves);
            return true;
        } catch (e) {
            console.error("Save failed", e);
            return false;
        }
    };

    const loadSession = async (slotId: string) => {
        const saves = await getSaves();
        const slot = saves.find(s => s.id === slotId);
        if (slot) {
            dispatch({ type: 'UPDATE_FULL_STATE', payload: slot.gameState });
            setHistory(slot.history);
            setIsInitialized(true);
            return true;
        }
        return false;
    };

    const deleteSave = async (slotId: string) => {
        const saves = await getSaves();
        const updated = saves.filter(s => s.id !== slotId);
        await set('nightmare_machine_saves', updated);
    };

    // --- AUTO-PILOT SYSTEM ---
    useAutoPilot({
        config: autoMode,
        gameState,
        isLoading,
        isInitialized,
        onTrigger: async () => {
            // Generate action only if we are still clear to proceed
            const action = await generateAutoPlayerAction(gameState);
            if (action) {
                await handleSendMessage(action);
            }
        },
        onStop: () => setAutoMode({ active: false, remainingCycles: 0 }),
        onDecrement: () => setAutoMode(prev => ({ ...prev, remainingCycles: prev.remainingCycles - 1 }))
    });

    return {
        // Data
        gameState,
        history,
        isInitialized,
        isLoading,
        autoMode,
        streams: { logicStream, narrativeStream, streamPhase },
        
        // Actions
        dispatch, // Exposed for granular updates
        initializeGame,
        sendMessage: handleSendMessage,
        resetGame,
        setAutoMode,
        toggleLogic: () => {}, // Logic toggle is UI state, handled in App
        
        // Persistence
        saveSession,
        loadSession,
        deleteSave,
        getSaves
    };
};
