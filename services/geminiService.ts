import { GoogleGenAI } from "@google/genai";
import { GameState, SimulationConfig, NpcState } from "../types";
import { PLAYER_SYSTEM_INSTRUCTION, SIMULATOR_INSTRUCTION, NARRATOR_INSTRUCTION } from "../constants";
import { parseResponse } from "../utils";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

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
      return JSON.parse(res.text || "{}");
  } catch (e) {
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

export const generateCharacterProfile = async (cluster: string, intensity: string, role: string): Promise<{name: string, background: string, traits: string}> => {
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
        const data = JSON.parse(res.text || "{}");
        return {
            name: data.name || "Unknown",
            background: data.background || "No history available.",
            traits: data.traits || "Survival Instinct"
        };
    } catch (e) {
        return { name: "Unknown", background: "Unknown", traits: "Unknown" };
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
    // If the user provides an image, we assume they might want to edit it.
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

            // Iterate through parts to find image
            if (response.candidates?.[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        generatedImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    } else if (part.text) {
                        generatedText = part.text;
                    }
                }
            }
            
            // If we got an image, return early. We don't advance the game simulation logic (JSON state) for image edits.
            if (generatedImage) {
                return {
                    gameState,
                    storyText: generatedText || "Visual reconfiguration complete.",
                    imageUrl: generatedImage
                };
            }
        } catch (e) {
            console.error("Image Processing Failed", e);
            // Fallthrough to normal simulation if image gen fails
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
        const parsed = JSON.parse(simText || "{}");
        
        // CRITICAL: Deep Merge / Preservation Strategy
        // The Simulator sometimes returns partial states or resets fields. 
        // We must ensure the user's initial configuration (meta, villain, motif) persists.
        simulatedState = {
            ...gameState, // Fallback to current state
            ...parsed,    // Apply updates
            
            // Explicitly merge nested objects to prevent overwriting with undefined/partial
            meta: { 
                ...gameState.meta, 
                ...(parsed.meta || {}) 
            },
            villain_state: { 
                ...gameState.villain_state, 
                ...(parsed.villain_state || {}) 
            },
            narrative: {
                ...gameState.narrative,
                ...(parsed.narrative || {})
            },
            // Logic for arrays (replace, do not merge items, to allow removal)
            npc_states: parsed.npc_states || gameState.npc_states || [],
            location_state: parsed.location_state ? {
                ...gameState.location_state,
                ...parsed.location_state,
                room_map: { ...gameState.location_state.room_map, ...(parsed.location_state.room_map || {}) }
            } : gameState.location_state
        };

        // Safety enforcement for critical fields
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
        console.error("Simulator Parse Error", e);
        if (onStreamUpdate) onStreamUpdate(`\n[ERROR] JSON PARSE FAILED: ${e}\n`, 'logic');
    }

    // 2. Narration Step (Prose) - STREAMED
    if (onStreamUpdate) onStreamUpdate("\n>>> SYNTHESIZING NARRATIVE...\n", 'narrative');

    const narrStream = await ai.models.generateContentStream({
        model: 'gemini-3-pro-preview',
        contents: `SIMULATED STATE: ${JSON.stringify(simulatedState)}`,
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

    const parsed = parseResponse(narrText || "");
    
    // 3. Final State Resolution
    const finalState = parsed.gameState || simulatedState;
    let finalStoryText = parsed.storyText;
    let generatedImageUrl: string | undefined;

    // [IMAGE GENERATION TRIGGER]
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
                    // Remove the placeholder tag
                    finalStoryText = finalStoryText.replace(/\[SELF_PORTRAIT\]/g, ''); 
                }
            }
        } catch (e) {
            console.error("Portrait Generation Failed", e);
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
        onLog(logBuffer, 0); // Cycle updated in loop
    };

    log("Starting Stress Test...");

    for (let i = 1; i <= config.cycles; i++) {
        log(`\n--- CYCLE ${i}/${config.cycles} ---`);
        onLog(logBuffer, i);
        
        // 1. Generate Action
        log("Generating Auto-Player Action...");
        try {
            const actionRes = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `STATE: ${JSON.stringify(currentState)}\nACTION:`,
                config: { systemInstruction: PLAYER_SYSTEM_INSTRUCTION }
            });
            const action = actionRes.text || "Wait.";
            log(`Action: "${action}"`);

            // 2. Simulate
            log("Simulating Outcome...");
            const simRes = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `STATE: ${JSON.stringify(currentState)}\nACTION: ${action}`,
                config: { 
                    systemInstruction: SIMULATOR_INSTRUCTION,
                    responseMimeType: 'application/json'
                }
            });

            const nextState = JSON.parse(simRes.text || "{}");
            // Simulator instruction says "Output ONLY updated JSON state"
            currentState = nextState;
            log(`State Updated. Turn: ${currentState.meta?.turn}`);
            
        } catch (e) {
            log(`FATAL ERROR: ${e}`);
            break;
        }
    }
    log("\nStress Test Complete.");
};