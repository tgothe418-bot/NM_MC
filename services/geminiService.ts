
import { GoogleGenAI, Chat, Type } from "@google/genai";
import { SIMULATOR_INSTRUCTION, NARRATOR_INSTRUCTION, PLAYER_SYSTEM_INSTRUCTION, ANALYST_SYSTEM_INSTRUCTION } from "../constants";
import { SimulationConfig, GameState } from "../types";

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

const ROOM_MAP_SCHEMA = {
  type: Type.OBJECT,
  additionalProperties: {
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
  }
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
        room_map: ROOM_MAP_SCHEMA,
        fidelity_status: { type: Type.STRING },
        current_state: { type: Type.INTEGER },
        weather_state: { type: Type.STRING },
        time_of_day: { type: Type.STRING }
      },
      required: ["current_room_id", "room_map", "fidelity_status", "current_state"]
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

/**
 * PASS 0: NPC AGENT ACTIONS (FLASH)
 */
export const generateNpcActions = async (gameState: GameState, userAction: string): Promise<string[]> => {
  if (!gameState.npc_states?.length) return [];
  
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      You are the Agent Engine. For each active NPC, decide ONE discrete action they take to advance their hidden goal.
      USER ACTION: ${userAction}
      NPCS: ${JSON.stringify(gameState.npc_states.map(n => ({ 
        name: n.name, 
        goal: n.hidden_agenda.goal, 
        stress: n.psychology.stress_level,
        thought: n.psychology.current_thought
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
    const prompt = `
      [SYSTEM INSTRUCTION]: You are the SIMULATOR. Process the mechanical consequences of the user and NPC actions.
      [CURRENT STATE]: ${JSON.stringify(gameState)}
      [USER ACTION]: ${userAction}
      [NPC INTENTIONS]: ${npcActions.join('\n')}
      
      Update all numeric metrics, injuries, and the spatial map.
      If the user enters a new area (UNEXPLORED), create a NEW RoomNode with unique ID.
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

    return JSON.parse(res.text || "{}");
  });
};

/**
 * PASS 2: THE NARRATOR (PRO)
 */
export const sendMessageToGemini = async (userAction: string, simulatedState: GameState, manifestos: string): Promise<string> => {
  if (!chatSession) throw new Error("Narrator Chat Session not initialized");
  
  const prompt = `
    [SIMULATED STATE - GROUND TRUTH]: ${JSON.stringify(simulatedState)}
    [USER ACTION]: ${userAction}
    ${manifestos}
    
    Narrate the results of this simulation. Adhere to the cluster aesthetic and sensory manifesto.
  `;
  
  const res = await chatSession.sendMessage({ message: prompt });
  return res.text || "";
};

// Fix: Added return statement to fix the missing return error
export const generateCalibrationField = async (field: string, cluster: string, intensity: string, count?: number, existingValue?: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const countContext = count ? ` Generate for ${count} subjects.` : "";
  const baseContext = existingValue ? ` Refine this content: ${existingValue}.` : "";
  
  const res = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Field: ${field}, Theme: ${cluster}, Fidelity: ${intensity}.${countContext}${baseContext} Generate`,
  });
  return res.text || "";
};

// Fix: Implemented missing generateAutoPlayerAction
export const generateAutoPlayerAction = async (gameState: GameState): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const res = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on the following game state, suggest a realistic horror movie protagonist action: ${JSON.stringify(gameState)}`,
    config: { systemInstruction: PLAYER_SYSTEM_INSTRUCTION }
  });
  return res.text || "";
};

// Fix: Implemented missing generateSimulationAnalysis
export const generateSimulationAnalysis = async (gameState: GameState): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const res = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analyze the psychological collapse in this simulation: ${JSON.stringify(gameState)}`,
    config: { systemInstruction: ANALYST_SYSTEM_INSTRUCTION }
  });
  return res.text || "";
};

// Fix: Implemented missing generateHorrorImage
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

// Fix: Implemented missing generateCinematicVideo
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
