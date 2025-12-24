import { GoogleGenAI, Chat, Type } from "@google/genai";
import { SIMULATOR_INSTRUCTION, NARRATOR_INSTRUCTION, PLAYER_SYSTEM_INSTRUCTION, ANALYST_SYSTEM_INSTRUCTION } from "../constants";
import { SimulationConfig, GameState, RoomNode } from "../types";
import { constructRoomGenerationRules } from "./locationEngine";

let chatSession: Chat | null = null;

/**
 * SHARED SCHEMA COMPONENTS
 */

const NPC_STATE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    archetype: { type: Type.STRING },
    hidden_agenda: {
      type: Type.OBJECT,
      properties: {
        goal: { type: Type.STRING },
        progress_level: { type: Type.INTEGER }
      },
      required: ["goal", "progress_level"]
    },
    psychology: {
      type: Type.OBJECT,
      properties: {
        stress_level: { type: Type.INTEGER },
        current_thought: { type: Type.STRING },
        dominant_instinct: { type: Type.STRING }
      },
      required: ["stress_level", "current_thought", "dominant_instinct"]
    },
    active_injuries: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          location: { type: Type.STRING },
          type: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ["location", "type", "description"]
      }
    },
    fracture_state: { type: Type.INTEGER },
    consciousness: { type: Type.STRING }
  },
  required: ["name", "archetype", "hidden_agenda", "psychology", "active_injuries", "fracture_state", "consciousness"]
};

// Replaced map with array to avoid empty properties error
const ROOM_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    name: { type: Type.STRING },
    archetype: { type: Type.STRING },
    description_cache: { type: Type.STRING },
    exits: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          direction: { type: Type.STRING },
          target_node_id: { type: Type.STRING, nullable: true }
        },
        required: ["direction"]
      }
    },
    hazards: { type: Type.ARRAY, items: { type: Type.STRING } },
    items: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["id", "name", "description_cache", "exits"]
};

const GAME_STATE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    meta: {
      type: Type.OBJECT,
      properties: {
        turn: { type: Type.INTEGER },
        perspective: { type: Type.STRING },
        mode: { type: Type.STRING },
        intensity_level: { type: Type.STRING },
        active_cluster: { type: Type.STRING }
      },
      required: ["turn", "perspective", "mode", "intensity_level", "active_cluster"]
    },
    villain_state: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        archetype: { type: Type.STRING },
        threat_scale: { type: Type.INTEGER },
        primary_goal: { type: Type.STRING },
        current_tactic: { type: Type.STRING }
      },
      required: ["name", "archetype", "threat_scale", "primary_goal", "current_tactic"]
    },
    npc_states: {
      type: Type.ARRAY,
      items: NPC_STATE_SCHEMA
    },
    location_state: {
      type: Type.OBJECT,
      properties: {
        current_room_id: { type: Type.STRING },
        rooms: { type: Type.ARRAY, items: ROOM_SCHEMA }, // Changed from room_map dict to rooms array
        fidelity_status: { type: Type.STRING },
        current_state: { type: Type.INTEGER },
        weather_state: { type: Type.STRING },
        time_of_day: { type: Type.STRING },
        architectural_notes: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["current_room_id", "rooms", "fidelity_status", "current_state"]
    },
    narrative: {
      type: Type.OBJECT,
      properties: {
        visual_motif: { type: Type.STRING },
        illustration_request: { type: Type.STRING, nullable: true }
      },
      required: ["visual_motif"]
    }
  },
  required: ["meta", "villain_state", "npc_states", "location_state", "narrative"]
};

const NARRATOR_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    story_text: { type: Type.STRING },
    game_state: GAME_STATE_SCHEMA
  },
  required: ["story_text", "game_state"]
};

const NPC_ACTIONS_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    actions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          npc_name: { type: Type.STRING },
          action: { type: Type.STRING }
        },
        required: ["npc_name", "action"]
      }
    }
  },
  required: ["actions"]
};

export const initializeGemini = () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  chatSession = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: NARRATOR_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: NARRATOR_RESPONSE_SCHEMA,
      temperature: 0.8,
    },
  });
};

const withRetry = async <T>(op: () => Promise<T>): Promise<T> => {
  let attempt = 0;
  const maxAttempts = 3;
  while (attempt < maxAttempts) {
    try {
      return await op();
    } catch (e) {
      attempt++;
      if (attempt === maxAttempts) throw e;
      await new Promise(r => setTimeout(r, 2000 * attempt));
    }
  }
  throw new Error("Retry failed after max attempts");
};

// Helper to convert internal Record<string, RoomNode> to Array for Gemini
const prepareGameStateForPrompt = (gameState: GameState): any => {
  const rooms = gameState.location_state?.room_map ? Object.values(gameState.location_state.room_map) : [];
  return {
    ...gameState,
    location_state: {
      ...gameState.location_state,
      rooms: rooms, // Pass array
      room_map: undefined // Remove map
    }
  };
};

// Helper to convert Gemini Array back to Record<string, RoomNode>
const restoreGameStateFromResponse = (parsed: any): any => {
  if (parsed.location_state && Array.isArray(parsed.location_state.rooms)) {
    const roomMap: Record<string, any> = {};
    parsed.location_state.rooms.forEach((r: any) => {
      if (r && r.id) roomMap[r.id] = r;
    });
    parsed.location_state.room_map = roomMap;
    // Keep rooms array or delete it? Let's keep it for compatibility or just rely on room_map
    // delete parsed.location_state.rooms;
  }
  return parsed;
};


/**
 * PASS 0: NPC AGENT ACTIONS (FLASH)
 */
export const generateNpcActions = async (gameState: GameState, userAction: string): Promise<string[]> => {
  if (!gameState.npc_states?.length) return [];

  // OOC / META GUARD
  // If the user input is OOC, we do not generate NPC actions to prevent the simulation from advancing inadvertently.
  if (/^(OOC:|META:)/i.test(userAction.trim())) {
    return [];
  }
  
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Filter out null/undefined NPCs to prevent 'Cannot read properties of undefined (reading 'name')'
    const validNpcs = gameState.npc_states.filter(n => n && n.name);

    if (validNpcs.length === 0) return [];

    const prompt = `
      You are the Agent Engine. For each active NPC, decide ONE discrete action they take to advance their hidden goal.
      USER ACTION: ${userAction}
      NPCS: ${JSON.stringify(validNpcs.map(n => ({ 
        name: n.name, 
        role: n.archetype, 
        goal: n.hidden_agenda?.goal, 
        psychology: {
            instinct: n.psychology?.dominant_instinct,
            thought: n.psychology?.current_thought,
            stress: n.psychology?.stress_level
        },
        status: {
            injuries: n.active_injuries?.map(i => `${i.location} (${i.type})`) || [],
            consciousness: n.consciousness,
            fracture_state: n.fracture_state
        },
        personality: n.personality
      })))}
      
      Respond in JSON format as specified.
    `;

    const res = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: NPC_ACTIONS_RESPONSE_SCHEMA
      }
    });

    const parsed = JSON.parse(res.text || '{"actions":[]}');
    return parsed.actions.map((a: any) => `${a.npc_name}: ${a.action}`);
  });
};

/**
 * PASS 1: THE SIMULATOR (FLASH)
 */
export const simulateTurn = async (gameState: GameState, userAction: string, npcActions: string[]): Promise<GameState> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const promptState = prepareGameStateForPrompt(gameState);
    const generationRules = constructRoomGenerationRules(gameState);
    
    const prompt = `
      [SYSTEM INSTRUCTION]: You are the SIMULATOR. Process the mechanical consequences of the user and NPC actions.
      [CURRENT STATE]: ${JSON.stringify(promptState)}
      [USER ACTION]: ${userAction}
      [NPC INTENTIONS]: ${npcActions.join('\n')}
      ${generationRules}
      
      Update all numeric metrics, injuries, and the spatial map.
      If the user enters a new area (UNEXPLORED), create a NEW RoomNode in 'rooms' array with a unique ID and description_cache.
    `;

    const res = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SIMULATOR_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: GAME_STATE_SCHEMA,
        temperature: 0.2, // Low temperature for consistent logic
      }
    });

    const parsed = JSON.parse(res.text || "{}");
    return restoreGameStateFromResponse(parsed);
  });
};

/**
 * PASS 2: THE NARRATOR (PRO)
 */
export const sendMessageToGemini = async (userAction: string, simulatedState: GameState, manifestos: string, customSession?: Chat): Promise<string> => {
  const session = customSession || chatSession;
  if (!session) throw new Error("Narrator Chat Session not initialized");
  
  const promptState = prepareGameStateForPrompt(simulatedState);
  
  const prompt = `
    [SIMULATED STATE - GROUND TRUTH]: ${JSON.stringify(promptState)}
    [USER ACTION]: ${userAction}
    ${manifestos}
    
    Narrate the results of this simulation. Adhere to the cluster aesthetic and sensory manifesto.
  `;
  
  const res = await session.sendMessage({ message: prompt });
  
  // Intercept the response to fix the room map structure in the JSON string
  let text = res.text || "";
  try {
     const parsed = JSON.parse(text);
     if (parsed.game_state) {
         // Fix the nested game_state
         parsed.game_state = restoreGameStateFromResponse(parsed.game_state);
         text = JSON.stringify(parsed);
     }
  } catch(e) {
      // If parsing fails, return raw text (likely empty or broken)
  }
  
  return text;
};

export const generateCalibrationField = async (field: string, cluster: string, intensity: string, count?: number, existingValue?: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const countContext = count ? ` Generate for ${count} subjects.` : "";
  const baseContext = existingValue ? ` Refine this content: ${existingValue}.` : "";
  
  const res = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      GENERATION TASK: Create content for field '${field}'. 
      THEME: ${cluster}. 
      INTENSITY: ${intensity}. 
      CONTEXT: ${countContext}${baseContext} 
      CONSTRAINT: Be concise, evocative, and punchy. Avoid flowery prose. Max 2-3 sentences or bullet points.
    `,
  });
  return res.text || "";
};

export const generateAutoPlayerAction = async (gameState: GameState): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const res = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on the following game state, suggest a realistic horror movie protagonist action: ${JSON.stringify(gameState)}`,
    config: { systemInstruction: PLAYER_SYSTEM_INSTRUCTION }
  });
  return res.text || "";
};

export const generateSimulationAnalysis = async (gameState: GameState): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const res = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analyze the psychological collapse in this simulation: ${JSON.stringify(gameState)}`,
    config: { systemInstruction: ANALYST_SYSTEM_INSTRUCTION }
  });
  return res.text || "";
};

export const generateHorrorImage = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio: "16:9" } }
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
};

export const generateCinematicVideo = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
};

// --- STRESS TEST ENGINE ---

export const runStressTest = async (
  config: SimulationConfig, 
  initialState: GameState,
  onProgress: (log: string, currentTurn: number) => void
): Promise<string> => {
  
  let markdownLog = `# NIGHTMARE MACHINE STRESS TEST REPORT
**Date:** ${new Date().toISOString()}
**Parameters:** Cluster: ${config.cluster}, Intensity: ${config.intensity}, Cycles: ${config.cycles}

---

`;

  let currentState = { ...initialState };
  
  // ISOLATION: Create specific session for this test run to prevent polluting the main game context
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const testSession = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: NARRATOR_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: NARRATOR_RESPONSE_SCHEMA,
      temperature: 0.8,
    },
  });

  for (let i = 0; i < config.cycles; i++) {
    const turnHeader = `\n## CYCLE ${i + 1}\n`;
    markdownLog += turnHeader;
    onProgress(markdownLog, i + 1);

    try {
      // 1. Auto-generate User Action
      const userAction = await generateAutoPlayerAction(currentState);
      markdownLog += `**User Action:** ${userAction}\n\n`;

      // 2. Generate NPC Actions
      const npcActions = await generateNpcActions(currentState, userAction);
      markdownLog += `**NPC Actions:**\n${npcActions.map(a => `- ${a}`).join('\n')}\n\n`;

      // 3. Simulate Turn
      const simulatedState = await simulateTurn(currentState, userAction, npcActions);
      
      // Validation: Check critical state integrity
      if (!simulatedState.location_state || !simulatedState.location_state.current_room_id) {
        throw new Error("CRITICAL: Simulation returned invalid Location State");
      }
      markdownLog += `**Simulation Status:** OK (Threat: ${simulatedState.villain_state.threat_scale})\n`;

      // 4. Narrate (using isolated testSession)
      const responseText = await sendMessageToGemini(userAction, simulatedState, "", testSession); 
      
      // 5. Parse Response
      let parsed;
      try {
        parsed = JSON.parse(responseText);
        if(!parsed.game_state || !parsed.story_text) throw new Error("Missing schema fields");
      } catch (jsonErr) {
        throw new Error(`JSON PARSE FAILURE: ${jsonErr}`);
      }

      // Update State for next loop
      currentState = {
        ...parsed.game_state,
        location_state: {
          ...parsed.game_state.location_state,
          room_map: { 
              ...simulatedState.location_state.room_map, 
              ...(parsed.game_state.location_state.room_map || {}) 
          }
        }
      };

      markdownLog += `**Narrator Output:** Valid JSON (${parsed.story_text.length} chars)\n`;
      markdownLog += `**State Snapshot:** Room: ${currentState.location_state.current_room_id}, Fidelity: ${currentState.location_state.fidelity_status}\n`;
      
    } catch (error: any) {
      markdownLog += `\n# CRITICAL FAILURE DETECTED\n`;
      markdownLog += `**Error Type:** ${error.name || "Unknown"}\n`;
      markdownLog += `**Message:** ${error.message}\n`;
      markdownLog += `**Stack Trace:**\n\`\`\`\n${error.stack || "No stack trace"}\n\`\`\`\n`;
      markdownLog += `\n**HALTING SEQUENCE.**`;
      
      onProgress(markdownLog, i + 1);
      return markdownLog; // Exit early on critical failure
    }
  }

  markdownLog += `\n# TEST COMPLETE\nAll cycles executed without critical termination.\n`;
  onProgress(markdownLog, config.cycles);
  return markdownLog;
};