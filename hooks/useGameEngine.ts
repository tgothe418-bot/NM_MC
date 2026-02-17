
import { useState, useCallback, useEffect, useRef, useReducer } from 'react';
import { GameState, ChatMessage, SimulationConfig, NpcState } from '../types';
import { getDefaultLocationState } from '../services/locationEngine';
import { generateProceduralNpc } from '../services/npcGenerator';
import { processGameTurn, generateAutoPlayerAction, initializeGemini, summarizeHistory } from '../services/geminiService';
import { useAutoPilot } from './useAutoPilot';

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
  | { type: 'APPEND_SUMMARY'; payload: string };

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
        default:
            return state;
    }
};

export const useGameEngine = (initialApiKey: string) => {
    // --- STATE ---
    const [apiKey, setApiKey] = useState(initialApiKey);
    const [isInitialized, setIsInitialized] = useState(false);
    
    // Core Game Data (Reducer)
    const [gameState, dispatch] = useReducer(gameReducer, DEFAULT_GAME_STATE);
    
    const [history, setHistory] = useState<ChatMessage[]>([]);

    // UI/Process State
    const [isLoading, setIsLoading] = useState(false);
    const [autoMode, setAutoMode] = useState({ active: false, remainingCycles: 0 });
    
    // Streaming State
    const [logicStream, setLogicStream] = useState("");
    const [narrativeStream, setNarrativeStream] = useState("");
    const [streamPhase, setStreamPhase] = useState<'logic' | 'narrative'>('logic');

    // Refs for safety (avoid stale closures in timeouts)
    const processingRef = useRef(false);

    // Initialize Service when Key Changes
    useEffect(() => {
        if (apiKey) {
            initializeGemini(apiKey);
        }
    }, [apiKey]);

    // --- ACTIONS ---

    const initializeGame = useCallback((config: SimulationConfig) => {
        // 1. DETERMINISTIC GENERATION
        let initialNpcs: NpcState[] = [];
        
        if (config.pre_generated_npcs && config.pre_generated_npcs.length > 0) {
            initialNpcs = config.pre_generated_npcs;
        } else {
            const victimCount = config.victim_count || 3;
            const usedNames = new Set<string>();
            initialNpcs = Array.from({ length: victimCount }).map(() => 
                generateProceduralNpc(config.cluster, config.intensity, usedNames, config.lore_context)
            );
        }

        const isVillainMode = config.mode === 'Villain';
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
                past_summary: ""
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
        
        // Initial Trigger
        handleSendMessage("BEGIN SIMULATION. ESTABLISH CONTEXT.", [], newState);
    }, []);

    const handleSendMessage = useCallback(async (text: string, files: File[] = [], overrideState?: GameState) => {
        if (processingRef.current) return;
        
        processingRef.current = true;
        setIsLoading(true);
        setLogicStream("");
        setNarrativeStream("");
        setStreamPhase('logic');

        if (!text.includes("BEGIN SIMULATION")) {
            setHistory(prev => [...prev, { role: 'user', text, timestamp: Date.now() }]);
        }

        const currentState = overrideState || gameState;

        try {
            // processGameTurn now returns { gameState, storyText, imagePromise }
            const result = await processGameTurn(currentState, text, files, (chunk, phase) => {
                setStreamPhase(phase);
                if (phase === 'logic') setLogicStream(prev => prev + chunk);
                else setNarrativeStream(prev => prev + chunk);
            });
            
            // 1. Immediate Update: State and Text
            dispatch({ type: 'UPDATE_FULL_STATE', payload: result.gameState });
            
            const messageTimestamp = Date.now();
            const newMessage: ChatMessage = {
                role: 'model',
                text: result.storyText,
                gameState: result.gameState,
                imageUrl: undefined, // Initially undefined
                timestamp: messageTimestamp
            };

            // CONTEXT WINDOW HYGIENE (Rolling Summary)
            // If history gets too long (e.g. > 20 turns), trim it and summarize the oldest chunk.
            if (history.length > 20) {
                const PRUNE_COUNT = 10;
                const historyToSummarize = history.slice(0, PRUNE_COUNT);
                const historyToKeep = history.slice(PRUNE_COUNT);
                
                // Optimistic visual update: Prune history immediately
                setHistory([...historyToKeep, newMessage]);
                
                // Trigger summary generation in background
                summarizeHistory(historyToSummarize).then(summary => {
                    if (summary) {
                        dispatch({ type: 'APPEND_SUMMARY', payload: `[ARCHIVED MEMORY]: ${summary}` });
                    }
                }).catch(err => console.error("Summary failed", err));

            } else {
                setHistory(prev => [...prev, newMessage]);
            }

            setIsLoading(false); // Unlock UI immediately for next turn

            // 2. Deferred Update: Image (Non-Blocking)
            if (result.imagePromise) {
                result.imagePromise.then(imageUrl => {
                    if (imageUrl) {
                        setHistory(prev => prev.map(msg => 
                            msg.timestamp === messageTimestamp 
                                ? { ...msg, imageUrl: imageUrl }
                                : msg
                        ));
                    }
                }).catch(err => console.error("Background Image Generation Failed", err));
            }

        } catch (e) {
            console.error("Game Loop Error:", e);
            setHistory(prev => [...prev, { 
                role: 'model', 
                text: "CRITICAL FAILURE: Simulation Desync.", 
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

    // --- SAVE / LOAD SYSTEM ---

    const getSaves = (): SaveSlot[] => {
        try {
            const data = localStorage.getItem('nightmare_machine_saves');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Failed to read saves", e);
            return [];
        }
    };

    const saveSession = (name: string) => {
        try {
            const saves = getSaves();
            const newSlot: SaveSlot = {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                name: name || `Session ${saves.length + 1}`,
                summary: `Turn ${gameState.meta.turn} - ${gameState.meta.active_cluster}`,
                gameState: gameState,
                history: history
            };
            const updatedSaves = [newSlot, ...saves];
            localStorage.setItem('nightmare_machine_saves', JSON.stringify(updatedSaves));
            return true;
        } catch (e) {
            console.error("Save failed", e);
            return false;
        }
    };

    const loadSession = (slotId: string) => {
        const saves = getSaves();
        const slot = saves.find(s => s.id === slotId);
        if (slot) {
            dispatch({ type: 'UPDATE_FULL_STATE', payload: slot.gameState });
            setHistory(slot.history);
            setIsInitialized(true);
            return true;
        }
        return false;
    };

    const deleteSave = (slotId: string) => {
        const saves = getSaves();
        const updated = saves.filter(s => s.id !== slotId);
        localStorage.setItem('nightmare_machine_saves', JSON.stringify(updated));
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
        apiKey,
        gameState,
        history,
        isInitialized,
        isLoading,
        autoMode,
        streams: { logicStream, narrativeStream, streamPhase },
        
        // Actions
        setApiKey,
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