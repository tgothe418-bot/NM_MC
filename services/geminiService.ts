
import { GoogleGenAI, Chat, Type } from "@google/genai";
import { SIMULATOR_INSTRUCTION, NARRATOR_INSTRUCTION, PLAYER_SYSTEM_INSTRUCTION, ANALYST_SYSTEM_INSTRUCTION } from "../constants";
import { NarrativeEvent, SimulationConfig, GameState, NpcState } from "../types";

let chatSession: Chat | null = null;

const GAME_STATE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    meta: {
      type: Type.OBJECT,
      properties: {
        turn: { type: Type.INTEGER },
        intensity_level: { type: Type.STRING },
        active_cluster: { type: Type.STRING },
        perspective: { type: Type.STRING },
        mode: { type: Type.STRING }
      }
    },
    villain_state: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        threat_scale: { type: Type.INTEGER },
        primary_goal: { type: Type.STRING }
      }
    },
    npc_states: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          archetype: { type: Type.STRING },
          hidden_agenda: {
            type: Type.OBJECT,
            properties: {
              goal: { type: Type.STRING },
              progress_level: { type: Type.INTEGER }
            }
          },
          psychology: {
            type: Type.OBJECT,
            properties: {
              stress_level: { type: Type.INTEGER },
              current_thought: { type: Type.STRING }
            }
          },
          active_injuries: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                location: { type: Type.STRING },
                description: { type: Type.STRING }
              }
            }
          }
        }
      }
    },
    location_state: {
      type: Type.OBJECT,
      properties: {
        current_room_id: { type: Type.STRING },
        room_map: {
          type: Type.OBJECT,
          additionalProperties: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              description_cache: { type: Type.STRING },
              exits: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    direction: { type: Type.STRING },
                    target_node_id: { type: Type.STRING, nullable: true }
                  }
                }
              }
            }
          }
        }
      }
    },
    narrative: {
      type: Type.OBJECT,
      properties: {
        visual_motif: { type: Type.STRING }
      }
    }
  }
};

const NARRATOR_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    story_text: { type: Type.STRING },
    game_state: GAME_STATE_SCHEMA
  },
  required: ["story_text", "game_state"]
};

export const initializeGemini = () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  chatSession = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: NARRATOR_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: NARRATOR_RESPONSE_SCHEMA
    },
  });
};

const withRetry = async <T>(op: () => Promise<T>): Promise<T> => {
  let attempt = 0;
  while (attempt < 3) {
    try { return await op(); }
    catch (e) { attempt++; if (attempt === 3) throw e; await new Promise(r => setTimeout(r, 2000)); }
  }
  throw new Error("Retry failed");
};

export const generateNpcActions = async (gameState: GameState, userAction: string): Promise<string[]> => {
  if (!gameState.npc_states?.length) return [];
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const actions: string[] = [];
  for (const npc of gameState.npc_states) {
    const prompt = `NPC: ${npc.name}, Goal: ${npc.hidden_agenda.goal}, User: ${userAction}. Decide ONE discrete action they take to advance their goal. One sentence.`;
    const res = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    actions.push(`${npc.name}: ${res.text}`);
  }
  return actions;
};

export const simulateTurn = async (gameState: GameState, userAction: string, npcActions: string[]): Promise<GameState> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `STATE: ${JSON.stringify(gameState)}\nUSER: ${userAction}\nNPCs: ${npcActions.join('\n')}\nUpdate state logic.`;
  const res = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: SIMULATOR_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: GAME_STATE_SCHEMA
    }
  });
  return JSON.parse(res.text || "{}");
};

export const sendMessageToGemini = async (userAction: string, simulatedState: GameState, manifestos: string): Promise<string> => {
  if (!chatSession) throw new Error("Not initialized");
  const prompt = `SIMULATED STATE: ${JSON.stringify(simulatedState)}\nUSER ACTION: ${userAction}\n${manifestos}`;
  const res = await chatSession.sendMessage({ message: prompt });
  return res.text || "";
};

// Fix: Updated generateCalibrationField to accept additional context for calibration
export const generateCalibrationField = async (field: string, cluster: string, intensity: string, count?: number, existingValue?: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const countContext = count ? ` Generate for ${count} subjects.` : "";
  const baseContext = existingValue ? ` Refine this content: ${existingValue}.` : "";
  const res = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Field: ${field}, Theme: ${cluster}, Fidelity: ${intensity}.${countContext}${baseContext} Generate evocative content.`,
  });
  return res.text?.trim() || "";
};

export const generateHorrorImage = async (prompt: string, options: any): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const res = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio: options.aspectRatio || "1:1" } }
  });
  const part = res.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return part ? `data:image/png;base64,${part.inlineData.data}` : null;
};

export const generateCinematicVideo = async (prompt: string, config: any): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let op = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    config: { numberOfVideos: 1, resolution: config.resolution, aspectRatio: config.aspectRatio }
  });
  while (!op.done) {
    await new Promise(r => setTimeout(r, 10000));
    op = await ai.operations.getVideosOperation({ operation: op });
  }
  const uri = op.response?.generatedVideos?.[0]?.video?.uri;
  if (uri) {
    const res = await fetch(`${uri}&key=${process.env.API_KEY}`);
    return URL.createObjectURL(await res.blob());
  }
  return null;
};

export const generateSimulationAnalysis = async (log: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const res = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: log,
    config: { systemInstruction: ANALYST_SYSTEM_INSTRUCTION }
  });
  return res.text;
};

export const generateAutoPlayerAction = async (log: string, state: any, config: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const res = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `LOG: ${log}\nSTATE: ${JSON.stringify(state)}`,
    config: { systemInstruction: PLAYER_SYSTEM_INSTRUCTION }
  });
  return res.text || "I hesitate.";
};
