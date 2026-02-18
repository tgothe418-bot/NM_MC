
import { GoogleGenAI } from "@google/genai";
import { zodToJsonSchema } from "zod-to-json-schema";
import { 
  GameState, 
  NpcState, 
  SourceAnalysisResult,
  ScenarioConcepts,
  CharacterProfile, 
  SimulationConfig,
  ChatMessage
} from '../types';
import {
  ScenarioConceptsSchema,
  CharacterProfileSchema
} from '../schemas';
import { 
  parseSimulatorResponse, 
  parseNarratorResponse, 
  parseSourceAnalysis, 
  parseScenarioConcepts, 
  parseCharacterProfile, 
  parseHydratedCharacter
} from '../parsers';
import { SIMULATOR_INSTRUCTION } from '../prompts/simulator';
import { NARRATOR_INSTRUCTION } from '../prompts/narrator';
import { constructVoiceManifesto } from './dialogueEngine';
import { constructSensoryManifesto } from './sensoryEngine';
import { constructLocationManifesto, constructRoomGenerationRules } from './locationEngine';
import { PLAYER_SYSTEM_INSTRUCTION } from '../prompts/instructions';
import { updateNpcMemories } from './memorySystem';

// --- INITIALIZATION (Singleton Pattern) ---
let aiInstance: GoogleGenAI | null = null;

export const initializeGemini = (apiKey: string) => {
    aiInstance = new GoogleGenAI({ apiKey });
};

const getAI = () => {
    if (!aiInstance) throw new Error("Gemini Client not initialized.");
    return aiInstance;
};

// --- ARCHITECT (Chat Companion) FUNCTIONS ---

export const generateArchitectResponse = async (
    history: { role: 'user' | 'model', text: string }[], 
    systemInstruction: string
): Promise<string> => {
    const ai = getAI();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview', 
            contents: history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
            config: {
                systemInstruction: systemInstruction,
            }
        });
        return response.text || "...";
    } catch (e) {
        console.error("Architect Error:", e);
        return "I am having trouble connecting to the neural lattice. Please repeat that.";
    }
};

export const extractScenarioFromChat = async (history: { role: 'user' | 'model', text: string }[]): Promise<SimulationConfig> => {
    const ai = getAI();
    const transcript = history.map(h => `${h.role.toUpperCase()}: ${h.text}`).join('\n');
    const extractionPrompt = `Analyze the following creative conversation and extract a valid Horror Scenario Configuration JSON.
    
    Transcript:
    ${transcript}
    
    Return JSON matching ScenarioConceptsSchema. 
    Infer any missing fields with creative defaults based on the tone of the chat.
    Mode should be 'Survivor' or 'Villain'.
    Intensity should be 'Level 3' if unspecified.
    Cluster should be one of: Flesh, System, Haunting, Self, Blasphemy, Survival, Desire.
    `;

    try {
        const res = await ai.models.generateContent({
            model: 'gemini-3-pro-preview', 
            contents: [{ role: 'user', parts: [{ text: extractionPrompt }] }],
            config: { responseMimeType: 'application/json' }
        });

        const concepts = parseScenarioConcepts(res.text || "{}");
        
        return {
            perspective: 'First Person',
            mode: history.some(h => h.text.toLowerCase().includes('villain') || h.text.toLowerCase().includes('hunter')) ? 'Villain' : 'Survivor',
            starting_point: 'Prologue',
            cluster: concepts.theme_cluster || 'Flesh',
            intensity: concepts.intensity || 'Level 3',
            cycles: 0,
            ...concepts,
            villain_name: concepts.villain_name || "Unknown Entity",
            villain_appearance: concepts.villain_appearance || "Unknown",
            villain_methods: concepts.villain_methods || "Unknown",
            victim_description: concepts.victim_description || "",
            survivor_name: concepts.survivor_name || "Survivor",
            survivor_background: concepts.survivor_background || "Unknown",
            survivor_traits: concepts.survivor_traits || "Unknown",
            location_description: concepts.location_description || "Unknown Location",
            visual_motif: concepts.visual_motif || "Cinematic",
            primary_goal: concepts.primary_goal || "Survive",
            victim_count: 3
        } as SimulationConfig;

    } catch (e) {
        console.error("Extraction Error:", e);
        throw e;
    }
};

// [OPTIMIZATION C] Context Summarization
export const summarizeHistory = async (history: { role: 'user' | 'model', text: string }[]): Promise<string> => {
    const ai = getAI();
    // Only summarize if history is long
    if (history.length < 10) return "";

    const transcript = history.map(h => `${h.role}: ${h.text}`).join('\n');
    const prompt = `Summarize the following narrative arc into a single detailed paragraph. Preserve key facts, injuries, and current objectives.\n\n${transcript}`;

    try {
        const res = await ai.models.generateContent({
            model: 'gemini-3-flash-preview', 
            contents: { parts: [{ text: prompt }] }
        });
        return res.text || "";
    } catch (e) {
        return "";
    }
};

// --- GAME LOOP ---

// [OPTIMIZATION A] Parallel Pipeline Implementation
export const processGameTurn = async (
  currentState: GameState, 
  userAction: string, 
  files: File[] = [],
  onStreamLogic?: (chunk: string, phase: 'logic' | 'narrative') => void
): Promise<{ gameState: GameState, storyText: string, imagePromise?: Promise<string | undefined> }> => {
  const ai = getAI();

  // 1. CONSTRUCT CONTEXT (Unchanged)
  const sensoryManifesto = constructSensoryManifesto(currentState);
  const voiceManifesto = constructVoiceManifesto(currentState.npc_states, currentState.meta.active_cluster);
  const locationManifesto = constructLocationManifesto(currentState.location_state);
  const roomRules = constructRoomGenerationRules(currentState);

  const contextBlock = `
  ${JSON.stringify(currentState)}
  [PRIOR NARRATIVE SUMMARY]: ${currentState.narrative.past_summary || "None"}
  ${sensoryManifesto}
  ${voiceManifesto}
  ${locationManifesto}
  ${roomRules}
  `;

  // 2. SIMULATOR PHASE (Logic) - (Unchanged logic, just ensure onStreamLogic calls are safe)
  if (onStreamLogic) onStreamLogic("initializing logic engine...\n", 'logic');

  let partialState: any = {};
  
  try {
      const simResponse = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp', // Suggestion: Use Flash for Logic (Faster)
        contents: {
            parts: [
                { text: contextBlock },
                { text: `USER ACTION: "${userAction}"` }
            ]
        },
        // Inject summary into System Instruction for better retention
        config: { 
            systemInstruction: SIMULATOR_INSTRUCTION + `\n\n[LONG TERM MEMORY]: ${currentState.narrative.past_summary || "No prior history."}`, 
            responseMimeType: 'application/json' 
        }
      });
      
      const simText = simResponse.text || "{}";
      partialState = parseSimulatorResponse(simText);
      
      if (partialState._analysis && onStreamLogic) {
         const { intent, complexity, success_probability } = partialState._analysis;
         let log = `\n[INTENT RECOGNITION]\n> INTENT: ${intent}\n> COMPLEXITY: ${complexity}\n> PROBABILITY: ${success_probability}\n`; 
         onStreamLogic(log, 'logic');
         delete partialState._analysis;
      }

  } catch (e) {
      console.error("Simulator Error:", e);
      partialState = {};
  }
  
  // MERGE STATE (Unchanged)
  let newLocationState = { ...currentState.location_state };
  if (partialState.location_state) {
      newLocationState = { ...newLocationState, ...partialState.location_state };
      if (partialState.location_state.room_map) {
          newLocationState.room_map = { ...currentState.location_state.room_map, ...partialState.location_state.room_map };
      }
  }

  const updatedState: GameState = {
      ...currentState,
      ...partialState,
      meta: { ...currentState.meta, ...(partialState.meta || {}) },
      villain_state: { ...currentState.villain_state, ...(partialState.villain_state || {}) },
      narrative: { ...currentState.narrative, ...(partialState.narrative || {}) },
      location_state: newLocationState, 
  };

  // 3. NARRATOR PHASE (Prose)
  if (onStreamLogic) onStreamLogic("rendering narrative...\n", 'narrative');

  let finalStoryText = "*The vision blurs...*";
  let narratorStateUpdates = {};
  let imagePromise: Promise<string | undefined> | undefined; // Decoupled Promise

  try {
      const narratorResponse = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: {
              parts: [
                  { text: JSON.stringify(updatedState) },
                  { text: `USER ACTION: "${userAction}"` },
                  { text: `SIMULATOR OUTCOME: ${JSON.stringify(partialState)}` }
              ]
          },
          config: { 
              systemInstruction: NARRATOR_INSTRUCTION + `\n\n[LONG TERM MEMORY]: ${updatedState.narrative.past_summary || "No prior history."}`, 
              responseMimeType: 'application/json' 
          }
      });

      const narrText = narratorResponse.text || "{}";
      const narrResult = parseNarratorResponse(narrText) as { story_text: string, game_state?: GameState };
      
      finalStoryText = narrResult.story_text;
      narratorStateUpdates = narrResult.game_state || {};
      
      // 4. IMAGE GENERATION (NON-BLOCKING)
      let hasVisualTag = finalStoryText.includes('[ESTABLISHING_SHOT]') || finalStoryText.includes('[SELF_PORTRAIT]');
      // Clean tags from text
      finalStoryText = finalStoryText.replace(/\[ESTABLISHING_SHOT\]|\[SELF_PORTRAIT\]/g, '');

      const requestFromState = updatedState.narrative.illustration_request || (narratorStateUpdates as any)?.narrative?.illustration_request;
      
      if (requestFromState || hasVisualTag) {
          if (onStreamLogic) onStreamLogic("queuing visual artifact...\n", 'narrative');
          
          let prompt = typeof requestFromState === 'string' ? requestFromState : "Establishing Shot";
          // Trigger the promise but DO NOT await it here
          imagePromise = generateImage(
              prompt, 
              updatedState.narrative.visual_motif,
              updatedState.location_state.room_map[updatedState.location_state.current_room_id]?.description_cache,
              false 
          );
      }

  } catch (e) {
      console.error("Narrator Error:", e);
  }

  // 5. MEMORY CONSOLIDATION (New Step)
  // Create a temporary history object for the current turn to update memory immediately
  const turnHistory = [
      { role: 'user', text: userAction, timestamp: Date.now() },
      { role: 'model', text: finalStoryText, timestamp: Date.now() }
  ] as ChatMessage[];

  // Combine simulator and narrator updates
  const stateForMemory = {
      ...updatedState,
      ...narratorStateUpdates,
      narrative: {
          ...updatedState.narrative,
          ...(narratorStateUpdates as any).narrative,
      }
  };

  // Run the memory update on the full state
  const stateWithMemory = updateNpcMemories(stateForMemory, turnHistory);

  // CLEAR THE REQUEST IN THE STATE SO IT DOESN'T LOOP
  const finalState = {
      ...stateWithMemory,
      narrative: { 
        ...stateWithMemory.narrative, 
        illustration_request: null // Ensure we clear this
      }
  };

  return {
      gameState: finalState,
      storyText: finalStoryText,
      imagePromise // Return the promise to the UI
  };
};

// --- HELPER FUNCTIONS ---

export const generateAutoPlayerAction = async (state: GameState): Promise<string> => {
    const ai = getAI();
    try {
        const prompt = `Current Situation: ${state.narrative.illustration_request || "Survival situation"}\nLast Narrative: (Implicit)\nGenerate a single sentence action for the player.`;
        const res = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: { parts: [{ text: JSON.stringify(state) }, { text: prompt }] },
            config: { systemInstruction: PLAYER_SYSTEM_INSTRUCTION }
        });
        return res.text || "Wait and watch.";
    } catch (e) {
        return "Wait.";
    }
};

export const generateImage = async (
    prompt: string, 
    motif: string, 
    context: string = "", 
    allowCharacters: boolean = true
): Promise<string | undefined> => {
    const ai = getAI();
    let fullPrompt = `Horror Art. Style: ${motif}. Scene: ${context}. Detail: ${prompt}. Photorealistic, cinematic lighting, 8k. No text.`;
    
    if (!allowCharacters) {
        fullPrompt += " CRITICAL: NO PEOPLE, NO CHARACTERS, NO FIGURES, NO FACES. The scene must be completely empty and devoid of life. Liminal space, atmospheric, ominous.";
    }
    
    try {
        const res = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview', // Upgraded to Pro Image
            contents: { parts: [{ text: fullPrompt }] },
            config: {
                imageConfig: {
                    aspectRatio: "16:9",
                    imageSize: "1K"
                }
            }
        });
        
        if (res.candidates?.[0]?.content?.parts) {
            for (const part of res.candidates[0].content.parts) {
                if (part.inlineData) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        }
    } catch (e) {
        console.error("Image Gen Error", e);
    }
    return undefined;
};

// New Helper for NPC Portraits
export const generateNpcPortrait = async (npc: NpcState): Promise<string | undefined> => {
    const prompt = `Portrait of a horror character. ${npc.archetype}. ${npc.physical?.distinguishing_feature}. ${npc.physical?.clothing_style}. ${npc.physical?.build}. Mood: ${npc.psychology?.emotional_state}. Style: Dark, Cinematic, Photorealistic.`;
    // Reuse generateImage logic
    return generateImage(prompt, "Cinematic Horror", "Character Portrait", false); 
};

// Robust Helper for MIME types
const getMimeType = (file: File): string => {
    if (file.type && file.type !== 'application/octet-stream') return file.type;
    const ext = file.name.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'jpg': case 'jpeg': return 'image/jpeg';
        case 'png': return 'image/png';
        case 'webp': return 'image/webp';
        case 'heic': return 'image/heic';
        case 'heif': return 'image/heif';
        case 'pdf': return 'application/pdf';
        case 'txt': return 'text/plain';
        case 'md': return 'text/markdown';
        case 'json': return 'application/json';
        case 'csv': return 'text/csv';
        default: return 'text/plain';
    }
}

export const analyzeSourceMaterial = async (file: File): Promise<SourceAnalysisResult> => {
  const ai = getAI();
  const mime = getMimeType(file);
  const isText = mime.startsWith('text/') || 
                 mime === 'application/json' ||
                 mime.includes('csv') || 
                 mime.includes('markdown') ||
                 file.name.endsWith('.md');

  let parts: any[] = [];

  try {
      if (isText) {
          const textContent = await fileToText(file);
          parts = [{ text: `[SOURCE MATERIAL: ${file.name}]\n${textContent}` }];
      } else {
          const base64Data = await fileToBase64(file);
          const base64Content = base64Data.split(',')[1];
          parts = [{ inlineData: { mimeType: mime, data: base64Content } }];
      }

      const prompt = `Analyze this source material for a horror simulation setup.
      
      CRITICAL INSTRUCTION: Extract ALL characters, including:
      1. The Protagonists/Survivors.
      2. The ANTAGONIST (Villain, Monster, AI, Mastercomputer). Even if it is a machine or abstract entity (like AM), it MUST be listed as a character with the role 'Antagonist' or 'Villain'.
      
      ALSO EXTRACT:
      - Aesthetics (Visual Motif)
      - Intensity Level (1-5)
      - Core Themes
      - Plot Elements (Hooks)

      Return a valid JSON object matching this structure exactly:
      {
        "characters": [
          { 
            "name": "Name", 
            "role": "Archetype/Job (e.g. 'Survivor', 'Antagonist', 'AI')", 
            "description": "Detailed bio. For Antagonists, describe their form and origin.", 
            "traits": "Personality traits.",
            "goal": "Primary objective (e.g. 'Torture forever', 'Escape'). Essential for Antagonists.",
            "methodology": "Methods of torment/attack. Essential for Antagonists."
          }
        ],
        "location": "Detailed description of the setting/environment found in the source",
        "visual_motif": "Cinematic visual style description (e.g. Grainy 16mm, Digital Glitch)",
        "theme_cluster": "One of: Flesh, System, Haunting, Self, Blasphemy, Survival, Desire",
        "intensity": "Level 1 to 5",
        "plot_hook": "The immediate situation, conflict, or inciting incident present in the source."
      }`;

      parts.push({ text: prompt });

      const res = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', // Upgraded to Pro
        contents: [{ role: 'user', parts: parts }],
        config: { 
            responseMimeType: 'application/json'
        }
      });

      return parseSourceAnalysis(res.text || "{}");
  } catch (e) {
      console.error("Analysis Failed:", e);
      throw e;
  }
};

export const generateCalibrationField = async (
    field: string, 
    cluster: string, 
    intensity: string, 
    existingContext?: string, 
    refinementInput?: string
): Promise<string> => {
    const ai = getAI();
    let prompt = `Generate a creative, horror-themed value for the field: "${field}".
    Context: Cluster=${cluster}, Intensity=${intensity}.`;
    
    if (existingContext) prompt += `\nExisting Context: ${existingContext}`;
    if (refinementInput) prompt += `\nRefine this existing value: "${refinementInput}"`;
    
    const res = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', // Upgraded to Pro
        contents: { parts: [{ text: prompt }] },
    });
    return res.text?.trim() || "";
};

export const hydrateUserCharacter = async (description: string, cluster: string): Promise<Partial<NpcState>> => {
    const ai = getAI();
    const prompt = `Hydrate this character description into a partial JSON state. Cluster: ${cluster}. Input: "${description}"`;
    const res = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', // Upgraded to Pro
        contents: { parts: [{ text: prompt }] },
        config: { responseMimeType: 'application/json' }
    });
    return parseHydratedCharacter(res.text || "{}");
};

export const extractCharactersFromText = async (text: string, cluster: string): Promise<Partial<NpcState>[]> => {
  const ai = getAI();
  const prompt = `Analyze the following text which describes a group of characters for a horror simulation (Theme: ${cluster}).
  
  Extract EACH character into a JSON object.
  Return a JSON ARRAY.
  
  Schema per character:
  {
    "name": "String",
    "archetype": "String (Role/Job)",
    "background_origin": "String (Brief bio including traits)",
    "personality": { "dominant_trait": "String", "fatal_flaw": "String" },
    "physical": { "distinguishing_feature": "String" }
  }
  
  Input Text:
  "${text}"`;

  try {
      const res = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', // Upgraded to Pro
        contents: { parts: [{ text: prompt }] },
        config: { responseMimeType: 'application/json' }
      });
      
      const json = JSON.parse(res.text || "[]");
      if (Array.isArray(json)) return json;
      return [];
  } catch (e) {
      console.error("Failed to parse character extraction", e);
      return [];
  }
};

export const analyzeImageContext = async (file: File, aspect: string): Promise<string> => {
    const ai = getAI();
    const mime = getMimeType(file);
    const base64Data = await fileToBase64(file);
    
    if (!mime.startsWith('image/')) {
        return "Analysis not supported for this file type.";
    }

    const res = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
            parts: [
                { inlineData: { mimeType: mime, data: base64Data.split(',')[1] } },
                { text: `Analyze this image and describe the ${aspect} in 1-2 evocative sentences.` }
            ]
        }
    });
    return res.text?.trim() || "";
};

export const generateCharacterProfile = async (cluster: string, intensity: string, role: string): Promise<CharacterProfile> => {
    const ai = getAI();
    const jsonSchema = zodToJsonSchema(CharacterProfileSchema, "profile");

    const res = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', // Upgraded to Pro
        contents: { parts: [{ text: `Generate a horror character profile. Role: ${role}. Cluster: ${cluster}. Intensity: ${intensity}.` }] },
        config: { 
            responseMimeType: 'application/json',
            responseSchema: jsonSchema.definitions?.profile as any
        }
    });
    return parseCharacterProfile(res.text || "{}");
};

export const generateScenarioConcepts = async (cluster: string, intensity: string, mode: string): Promise<ScenarioConcepts> => {
    const ai = getAI();
    const jsonSchema = zodToJsonSchema(ScenarioConceptsSchema, "concepts");

    const res = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', // Upgraded to Pro
        contents: { parts: [{ text: `Generate a full scenario concept JSON object. Cluster: ${cluster}, Mode: ${mode}, Intensity: ${intensity}.` }] },
        config: {
             responseMimeType: 'application/json',
             responseSchema: jsonSchema.definitions?.concepts as any
        }
    });
    return parseScenarioConcepts(res.text || "{}");
};

// Utils
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const fileToText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
    });
};
