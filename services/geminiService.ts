
import { GoogleGenAI } from "@google/genai";
import { GameState, SimulationConfig, NpcState, ScenarioConcepts, CharacterProfile, SourceAnalysisResult, RoomNode } from "../types";
import { PLAYER_SYSTEM_INSTRUCTION, SIMULATOR_INSTRUCTION, NARRATOR_INSTRUCTION } from "../constants";
import { 
  parseSimulatorResponse, 
  parseNarratorResponse, 
  parseScenarioConcepts, 
  parseCharacterProfile, 
  parseSourceAnalysis, 
  parseHydratedCharacter,
  ParseError 
} from "../parsers";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// === HELPER: Deep Merge ===
function deepMerge(target: any, source: any): any {
    if (typeof target !== 'object' || target === null) return source;
    if (typeof source !== 'object' || source === null) return source;
    
    // Arrays: Replace logic (unless specific append logic is needed, but for state updates, strict replacement is safer to avoid dupes)
    if (Array.isArray(source)) {
        return source;
    }

    const out = { ...target };
    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            const val = source[key];
            if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
                out[key] = deepMerge(target[key], val);
            } else {
                out[key] = val;
            }
        }
    }
    return out;
}

// === HELPER: Merge NPC States ===
const mergeNpcStates = (current: NpcState[], incoming: any[]): NpcState[] => {
    if (!incoming || incoming.length === 0) return current;
    
    // Map current NPCs by Name for easy lookup
    const currentMap = new Map(current.map(n => [n.name, n]));
    const merged: NpcState[] = [];
    
    incoming.forEach((inc, idx) => {
        // Sanitize short_term_buffer if present (fix String vs Object issue)
        if (inc.dialogue_state?.memory?.short_term_buffer) {
            inc.dialogue_state.memory.short_term_buffer = inc.dialogue_state.memory.short_term_buffer.map((entry: any) => {
                if (typeof entry === 'string') {
                    return {
                        speaker: "Unknown",
                        text: entry,
                        sentiment: "Neutral",
                        turn: 0,
                        timestamp: Date.now()
                    };
                }
                return entry;
            });
        }

        // Attempt Match
        let match: NpcState | undefined;
        if (inc.name) {
            match = currentMap.get(inc.name);
        }
        
        // Fallback to Index if names match or if name is missing but structure implies update
        if (!match && idx < current.length) {
             const potentialMatch = current[idx];
             // If incoming has no name, or names match, use it. 
             // If incoming has NEW name, it's a replacement/new char.
             if (!inc.name || inc.name === potentialMatch.name) {
                 match = potentialMatch;
             }
        }
        
        if (match) {
            merged.push(deepMerge(match, inc));
        } else {
            // New Character (or full replacement)
            // Ensure basic required fields exist if they are missing from partial
            const base: Partial<NpcState> = {
                active_injuries: [],
                fracture_state: 0,
                knowledge_state: [],
                resources_held: [],
                ...inc
            };
            merged.push(base as NpcState);
        }
    });
    
    return merged;
};

export const generateAutoPlayerAction = async (gameState: GameState): Promise<string> => {
  const ai = getAI();
  const res = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `CURRENT SITUATION: ${JSON.stringify(gameState)}\n\nYOUR IMMEDIATE ACTION:`,
    config: { systemInstruction: PLAYER_SYSTEM_INSTRUCTION }
  });
  return res.text || "";
};

export const hydrateUserCharacter = async (description: string, cluster: string): Promise<Partial<NpcState>> => {
  const ai = getAI();
  const prompt = `Based on the description: "${description}" and the horror theme "${cluster}", generate a JSON object for a partial NpcState.
  Include: name, archetype, background_origin, psychology (stress_level, dominant_instinct), appearance.
  Return ONLY JSON.`;
  
  const res = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: 'application/json' }
  });
  
  try {
      return parseHydratedCharacter(res.text || "{}");
  } catch (e) {
      console.error("hydrateUserCharacter parse failed:", e);
      return {};
  }
};

export const generateCalibrationField = async (field: string, cluster: string, intensity: string, count?: number, existingValue?: string): Promise<string> => {
    const ai = getAI();
    let prompt = `Generate a creative, horror-themed value for the field: "${field}".
    Context: Horror Theme: ${cluster}, Intensity: ${intensity}.`;
    
    if (field === 'Visual Motif') {
        prompt += `\nSTRICT CONSTRAINT: Use short, simple phrases and general cinematic motifs (e.g. "Grainy 16mm film", "Cold fluorescent lighting", "Rust and decay"). Do NOT write full sentences. Keep it under 10 words.`;
    }

    if (field === 'Specimen Targets') {
        prompt += `\nSTRICT CONSTRAINT: Use brief, simple descriptions (e.g. "A group of lost hikers", "A solitary night watchman"). Avoid flowery prose. Keep it factual and concise.`;
    }

    if (count) prompt += `\nTarget Population Count: ${count}.`;
    if (existingValue) prompt += `\nRefine this existing idea: "${existingValue}".`;
    
    prompt += `\nOutput ONLY the content text, no conversational filler.`;

    const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
    });
    return res.text?.trim() || "";
};

export const generateScenarioConcepts = async (cluster: string, intensity: string, mode: string): Promise<ScenarioConcepts | null> => {
    const ai = getAI();
    const prompt = `Generate a cohesive, frightening horror scenario configuration.
    Theme: ${cluster}
    Intensity: ${intensity}
    Perspective: ${mode}

    Return a JSON object with the following fields (all are strings):
    - villain_name
    - villain_appearance (Physical description)
    - villain_methods (How they hunt/haunt)
    - primary_goal (What the villain wants)
    - victim_description (Who are the victims?)
    - survivor_name (Protagonist name)
    - survivor_background (Protagonist backstory)
    - survivor_traits (Protagonist flaws/strengths)
    - location_description (The setting)
    - visual_motif (Cinematic style, e.g. "Grainy VHS", "High Contrast Black & White")

    Ensure all fields are thematically linked and coherent.
    Return ONLY JSON.`;

    const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });

    try {
        return parseScenarioConcepts(res.text || "{}");
    } catch (e) {
        console.error("generateScenarioConcepts parse failed:", e);
        return null;
    }
};

export const generateCharacterProfile = async (cluster: string, intensity: string, role: string): Promise<CharacterProfile> => {
    const ai = getAI();
    const prompt = `Generate a cohesive character profile for a "${role}" in a horror story.
    Theme: ${cluster}
    Intensity: ${intensity}
    
    Output JSON with fields:
    - name: Full name
    - background: A short backstory (1-2 sentences) establishing why they are here.
    - traits: Key personality traits, flaws, or physical features.
    
    Return ONLY JSON.`;

    const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });

    try {
        return parseCharacterProfile(res.text || "{}");
    } catch (e) {
        console.error("generateCharacterProfile parse failed:", e);
        return { name: "Unknown", background: "Unknown", traits: "Unknown" };
    }
};

export const analyzeSourceMaterial = async (file: File): Promise<SourceAnalysisResult> => {
  const ai = getAI();
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const base64Content = base64Data.split(',')[1];

  const prompt = `Analyze this source material (Image or Document) for a horror simulation setup.
  Extract the following structured data to help configure a roleplay scenario:
  1. A list of key characters found in the source (Name, their suggested Role like 'Survivor' or 'Villain', a brief Description, and key Traits).
  2. A detailed description of the main setting/location.
  3. A visual motif or aesthetic style description (e.g. 'Grainy 16mm', 'Oil Painting').
  4. The dominant horror theme (choose best fit: Flesh, System, Haunting, Self, Blasphemy, Survival, Desire).

  Return strictly valid JSON matching this schema:
  {
    "characters": [{ "name": "...", "role": "...", "description": "...", "traits": "..." }],
    "location": "...",
    "visual_motif": "...",
    "theme_cluster": "..."
  }`;

  const res = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: file.type, data: base64Content } },
        { text: prompt }
      ]
    },
    config: { responseMimeType: 'application/json' }
  });

  try {
      return parseSourceAnalysis(res.text || "{}");
  } catch (e) {
      console.error("analyzeSourceMaterial parse failed:", e);
      return { characters: [], location: "", visual_motif: "", theme_cluster: "" };
  }
};

export const analyzeImageContext = async (file: File, context: string): Promise<string> => {
  const ai = getAI();
  
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  
  const base64Content = base64Data.split(',')[1];
  
  let promptText = "Analyze this image.";
  if (context === 'Visual Motif') {
      promptText = "Analyze the aesthetic style of this image. Provide a Visual Motif description using ONLY short, simple phrases (e.g. 'Grainy 16mm film', 'High contrast noir', 'VHS static'). Do not use full sentences. Output ONLY the description.";
  } else if (context === 'Specimen Targets') {
      promptText = "Analyze the characters or figures in this image. Describe them briefly as 'Specimen Targets' for a horror story. Focus on archetype, appearance, and vibe. Use brief, simple descriptions suitable for a character profile. Do not narrate.";
  }

  const res = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: file.type, data: base64Content } },
        { text: promptText }
      ]
    }
  });

  return res.text?.trim() || "";
};

// Backwards compatibility alias
export const analyzeVisualMotifImage = (file: File) => analyzeImageContext(file, 'Visual Motif');

export const generateNpcPortrait = async (npc: NpcState): Promise<string | null> => {
    const ai = getAI();
    // Construct a vivid prompt based on state
    const prompt = `A high-quality, moody horror portrait of ${npc.name}, a ${npc.archetype}. 
    Appearance: ${npc.physical?.build || 'Average'}, ${npc.physical?.height || ''}. 
    ${npc.physical?.hair_style ? `Hair: ${npc.physical.hair_style}` : ''}.
    ${npc.physical?.eye_color ? `Eyes: ${npc.physical.eye_color}` : ''}.
    Clothing: ${npc.physical?.clothing_style || 'Worn clothes'}.
    Distinguishing feature: ${npc.physical?.distinguishing_feature || 'None'}.
    Current State: ${npc.psychology?.emotional_state || 'Neutral'}. Stress level: ${npc.psychology?.stress_level || 0}%.
    ${npc.active_injuries.length > 0 ? `Injuries: ${npc.active_injuries.map(i => i.location + ' ' + i.type).join(', ')}.` : ''}
    Art Style: Dark, cinematic, high contrast, psychological horror aesthetic. 
    Close up character portrait, facing forward. High detail, 4k.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: {
                imageConfig: { aspectRatio: "1:1" }
            }
        });
        
        // Extract image
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    } catch (e) {
        console.error("Portrait Generation Failed", e);
    }
    return null;
}

export const processGameTurn = async (
    gameState: GameState, 
    action: string, 
    files: File[] = [],
    onStreamUpdate?: (text: string, phase: 'logic' | 'narrative') => void
): Promise<{ gameState: GameState, storyText: string, imageUrl?: string }> => {
    const ai = getAI();

    // 0. IMAGE EDITING / GENERATION PATH
    const imageFile = files.find(f => f.type.startsWith('image/'));
    if (imageFile) {
        try {
            const base64Data = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(imageFile);
            });
            const base64Content = base64Data.split(',')[1];

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        { inlineData: { mimeType: imageFile.type, data: base64Content } },
                        { text: action || "Enhance this image with a horror aesthetic." }
                    ]
                }
            });

            let generatedImage = undefined;
            let generatedText = "The machine reconfigures the visual data...";

            if (response.candidates?.[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        generatedImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    } else if (part.text) {
                        generatedText = part.text;
                    }
                }
            }
            
            if (generatedImage) {
                return {
                    gameState,
                    storyText: generatedText || "Visual reconfiguration complete.",
                    imageUrl: generatedImage
                };
            }
        } catch (e) {
            console.error("Image Processing Failed", e);
        }
    }

    // 1. Simulation Step (Logic) - STREAMED
    if (onStreamUpdate) onStreamUpdate("\n>>> INITIALIZING LOGIC SIMULATION...\n", 'logic');
    
    const simStream = await ai.models.generateContentStream({
        model: 'gemini-3-pro-preview',
        contents: `CURRENT STATE: ${JSON.stringify(gameState)}\nUSER ACTION: ${action}`,
        config: { 
            systemInstruction: SIMULATOR_INSTRUCTION,
            responseMimeType: 'application/json' 
        }
    });

    let simText = "";
    for await (const chunk of simStream) {
        const t = chunk.text;
        if (t) {
            simText += t;
            if (onStreamUpdate) onStreamUpdate(t, 'logic');
        }
    }

    let simulatedState = gameState;
    try {
        // NOTE: parsed is now partially typed as 'any' for complex nested objects due to schema relaxation
        const parsed = parseSimulatorResponse(simText || "{}");
        
        simulatedState = {
            ...gameState,
            ...parsed,
            // Use Deep Merge for meta to preserve partial updates like player_profile.traits only
            meta: deepMerge(gameState.meta, parsed.meta || {}),
            // Use Deep Merge for critical states
            villain_state: deepMerge(gameState.villain_state, parsed.villain_state || {}),
            narrative: deepMerge(gameState.narrative, parsed.narrative || {}),
            location_state: deepMerge(gameState.location_state, parsed.location_state || {}),
            // Special Merging for NPCs
            npc_states: mergeNpcStates(gameState.npc_states || [], parsed.npc_states || []),
            suggested_actions: parsed.suggested_actions || []
        };

        if (!simulatedState.narrative.visual_motif && gameState.narrative.visual_motif) {
            simulatedState.narrative.visual_motif = gameState.narrative.visual_motif;
        }
        if (!simulatedState.meta.player_profile && gameState.meta.player_profile) {
            simulatedState.meta.player_profile = gameState.meta.player_profile;
        }
        if (gameState.villain_state.victim_profile && !simulatedState.villain_state.victim_profile) {
            simulatedState.villain_state.victim_profile = gameState.villain_state.victim_profile;
        }

    } catch (e) {
        if (e instanceof ParseError) {
            console.error("Simulator parse error:", e.message);
            if (onStreamUpdate) onStreamUpdate(`\n[PARSE ERROR] ${e.message}\n`, 'logic');
        } else {
            console.error("Simulator critical error", e);
        }
    }

    // 2. Narration Step (Prose) - STREAMED
    if (onStreamUpdate) onStreamUpdate("\n>>> SYNTHESIZING NARRATIVE...\n", 'narrative');

    const narrStream = await ai.models.generateContentStream({
        model: 'gemini-3-pro-preview',
        contents: `USER ACTION: ${action}\nSIMULATED STATE: ${JSON.stringify(simulatedState)}`,
        config: { 
            systemInstruction: NARRATOR_INSTRUCTION,
            responseMimeType: 'application/json'
        }
    });

    let narrText = "";
    for await (const chunk of narrStream) {
        const t = chunk.text;
        if (t) {
            narrText += t;
            if (onStreamUpdate) onStreamUpdate(t, 'narrative');
        }
    }

    let finalState = simulatedState;
    let finalStoryText = "";

    try {
        const parsed = parseNarratorResponse(narrText || '{"storyText":""}');
        
        if (parsed.gameState) {
            // Base merge using deepMerge logic
            finalState = deepMerge(simulatedState, parsed.gameState);
            
            // CRITICAL FIX: If Narrator returned an npc_states array, it was likely just replaced by deepMerge.
            // We need to re-run mergeNpcStates logic to ensure we didn't wipe out non-updated fields with partial data.
            // We pass the ORIGINAL simulatedState.npc_states and the NEW incoming partial array.
            if (parsed.gameState.npc_states) {
                finalState.npc_states = mergeNpcStates(simulatedState.npc_states || [], parsed.gameState.npc_states);
            }
        }
        
        finalStoryText = parsed.storyText;
    } catch (e) {
        if (e instanceof ParseError) {
            console.error("Narrator parse error:", e.message);
            finalStoryText = narrText || "The narrative dissolves into static...";
        } else {
            console.error("Narrator critical error", e);
        }
    }
    
    // Preservation Strategy for options generated by Simulator if Narrator dropped them
    if (simulatedState.suggested_actions && (!finalState.suggested_actions || finalState.suggested_actions.length === 0)) {
        finalState = {
            ...finalState,
            suggested_actions: simulatedState.suggested_actions
        };
    }

    let generatedImageUrl: string | undefined;

    // [IMAGE GENERATION TRIGGER - SELF PORTRAIT]
    if (finalStoryText.includes('[SELF_PORTRAIT]')) {
        const villain = finalState.villain_state;
        const motif = finalState.narrative.visual_motif || "Cinematic Horror";
        
        const prompt = `A terrifying, cinematic self-portrait of the horror antagonist "${villain.name}". 
        Form/Appearance: ${villain.archetype}. 
        Visual Style: ${motif}. 
        High contrast, nightmare fuel, photorealistic 8k, Unreal Engine 5 render style. The image should be striking and evoke dread.`;

        try {
            const imageRes = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: prompt }] },
                config: { imageConfig: { aspectRatio: '16:9' } }
            });
            
            for (const part of imageRes.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    generatedImageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    finalStoryText = finalStoryText.replace(/\[SELF_PORTRAIT\]/g, ''); 
                }
            }
        } catch (e) {
            console.error("Portrait Generation Failed", e);
        }
    }
    // [IMAGE GENERATION TRIGGER - ESTABLISHING SHOT]
    else if (finalStoryText.includes('[ESTABLISHING_SHOT]')) {
        const loc = finalState.location_state;
        const currentRoom = loc.room_map[loc.current_room_id] as RoomNode | undefined;
        const motif = finalState.narrative.visual_motif || "Cinematic Horror";
        const cluster = finalState.meta.active_cluster || "Horror";
        
        const prompt = `A cinematic wide establishing shot of a horror environment. 
        Location: ${currentRoom?.name || "Unknown Area"}. 
        Details: ${currentRoom?.description_cache || loc.architectural_notes.join(', ') || "ominous shadows"}. 
        Atmosphere: ${loc.weather_state}, ${loc.time_of_day}.
        Visual Style: ${motif}. 
        Thematic Aesthetic: ${cluster}.
        High fidelity, 8k, atmospheric lighting, volumetric fog, hyper-realistic.`;

        try {
            const imageRes = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: prompt }] },
                config: { imageConfig: { aspectRatio: '16:9' } }
            });
            
            for (const part of imageRes.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    generatedImageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    finalStoryText = finalStoryText.replace(/\[ESTABLISHING_SHOT\]/g, ''); 
                }
            }
        } catch (e) {
            console.error("Establishing Shot Generation Failed", e);
        }
    }

    return {
        gameState: finalState,
        storyText: finalStoryText,
        imageUrl: generatedImageUrl
    };
};

export const runStressTest = async (config: SimulationConfig, initialState: GameState, onLog: (log: string, cycle: number) => void): Promise<void> => {
    const ai = getAI();
    let currentState = JSON.parse(JSON.stringify(initialState));
    let logBuffer = "";
    
    const log = (msg: string) => {
        logBuffer += `[${new Date().toLocaleTimeString()}] ${msg}\n`;
        onLog(logBuffer, 0); 
    };

    log("Starting Stress Test...");

    for (let i = 1; i <= config.cycles; i++) {
        log(`\n--- CYCLE ${i}/${config.cycles} ---`);
        onLog(logBuffer, i);
        
        log("Generating Auto-Player Action...");
        try {
            const actionRes = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `STATE: ${JSON.stringify(currentState)}\nACTION:`,
                config: { systemInstruction: PLAYER_SYSTEM_INSTRUCTION }
            });
            const action = actionRes.text || "Wait.";
            log(`Action: "${action}"`);

            log("Simulating Outcome...");
            const simRes = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `STATE: ${JSON.stringify(currentState)}\nACTION: ${action}`,
                config: { 
                    systemInstruction: SIMULATOR_INSTRUCTION,
                    responseMimeType: 'application/json'
                }
            });

            const nextState = parseSimulatorResponse(simRes.text || "{}");
            currentState = { ...currentState, ...nextState };
            log(`State Updated. Turn: ${currentState.meta?.turn}`);
            
        } catch (e) {
            log(`FATAL ERROR: ${e}`);
            break;
        }
    }
    log("\nStress Test Complete.");
};
