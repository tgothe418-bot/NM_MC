
import { GoogleGenAI, Type } from "@google/genai";
import { 
  GameState, 
  NpcState, 
  SourceAnalysisResult,
  ScenarioConcepts,
  CharacterProfile, 
} from '../types';
import { 
  parseSimulatorResponse, 
  parseNarratorResponse, 
  parseSourceAnalysis, 
  parseScenarioConcepts, 
  parseCharacterProfile, 
  parseHydratedCharacter
} from '../parsers';
import { SIMULATOR_INSTRUCTION } from '../prompts/simulator';
import { NARRATION_PROFILES } from './ttsService';
import { NARRATOR_INSTRUCTION } from '../prompts/narrator';
import { constructVoiceManifesto } from './dialogueEngine';
import { constructSensoryManifesto } from './sensoryEngine';
import { constructLocationManifesto, constructRoomGenerationRules } from './locationEngine';
import { PLAYER_SYSTEM_INSTRUCTION } from '../prompts/instructions';

// --- INITIALIZATION ---
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- GAME LOOP ---

export const processGameTurn = async (
  currentState: GameState, 
  userAction: string, 
  files: File[] = [],
  onStreamLogic?: (chunk: string, phase: 'logic' | 'narrative') => void
): Promise<{ gameState: GameState, storyText: string, imageUrl?: string }> => {
  const ai = getAI();

  // 1. CONSTRUCT CONTEXT
  const sensoryManifesto = constructSensoryManifesto(currentState);
  const voiceManifesto = constructVoiceManifesto(currentState.npc_states, currentState.meta.active_cluster);
  const locationManifesto = constructLocationManifesto(currentState.location_state);
  const roomRules = constructRoomGenerationRules(currentState);

  const contextBlock = `
  ${JSON.stringify(currentState)}
  
  ${sensoryManifesto}
  ${voiceManifesto}
  ${locationManifesto}
  ${roomRules}
  `;

  // 2. SIMULATOR PHASE (Logic)
  if (onStreamLogic) onStreamLogic("initializing logic engine...\n", 'logic');

  const simResponse = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
        parts: [
            { text: contextBlock },
            { text: `USER ACTION: "${userAction}"` }
        ]
    },
    config: {
        systemInstruction: SIMULATOR_INSTRUCTION,
        responseMimeType: 'application/json'
    }
  });

  const simText = simResponse.text || "{}";
  if (onStreamLogic) onStreamLogic(simText + "\n\n", 'logic');
  
  const partialState = parseSimulatorResponse(simText) as any;
  
  const updatedState: GameState = {
      ...currentState,
      ...partialState,
      meta: { ...currentState.meta, ...partialState.meta },
      villain_state: { ...currentState.villain_state, ...partialState.villain_state },
      narrative: { ...currentState.narrative, ...partialState.narrative },
  };

  // 3. NARRATOR PHASE (Prose)
  if (onStreamLogic) onStreamLogic("rendering narrative...\n", 'narrative');

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
          systemInstruction: NARRATOR_INSTRUCTION,
          responseMimeType: 'application/json'
      }
  });

  const narrText = narratorResponse.text || "{}";
  const narrResult = parseNarratorResponse(narrText) as { story_text: string, game_state?: GameState };
  
  // DETECT & STRIP VISUAL TAGS
  let finalStoryText = narrResult.story_text;
  let hasVisualTag = false;

  if (finalStoryText.includes('[ESTABLISHING_SHOT]')) {
      hasVisualTag = true;
      finalStoryText = finalStoryText.replace(/\[ESTABLISHING_SHOT\]/g, '');
  }
  if (finalStoryText.includes('[SELF_PORTRAIT]')) {
      hasVisualTag = true; // Use same flag for now, or distinguish if needed
      finalStoryText = finalStoryText.replace(/\[SELF_PORTRAIT\]/g, '');
  }

  // 4. IMAGE GENERATION (If requested via State OR Tag)
  let imageUrl: string | undefined;
  const requestFromState = updatedState.narrative.illustration_request || narrResult.game_state?.narrative.illustration_request;
  
  // Consolidate trigger
  const triggerImage = requestFromState || hasVisualTag;

  if (triggerImage) {
      if (onStreamLogic) onStreamLogic("generating visual artifact...\n", 'narrative');
      
      let prompt = typeof requestFromState === 'string' ? requestFromState : "Establishing Shot";
      
      // Override character requests to ensure atmospheric purity
      if (prompt.toLowerCase().includes('portrait') || prompt.toLowerCase().includes('self')) {
          prompt = "Atmospheric view of the current location. Empty and ominous.";
      }
      
      imageUrl = await generateImage(
          prompt, 
          updatedState.narrative.visual_motif,
          updatedState.location_state.room_map[updatedState.location_state.current_room_id]?.description_cache,
          false // Force Environment Mode (No characters)
      );
      
      // Clear request from state so it doesn't loop
      updatedState.narrative.illustration_request = null;
      if (narrResult.game_state?.narrative) {
          narrResult.game_state.narrative.illustration_request = null;
      }
  }

  const finalState = {
      ...updatedState,
      ...(narrResult.game_state || {})
  };

  return {
      gameState: finalState,
      storyText: finalStoryText, // Return cleaned text
      imageUrl
  };
};

// --- HELPER FUNCTIONS ---

export const generateAutoPlayerAction = async (state: GameState): Promise<string> => {
    const ai = getAI();
    const prompt = `Current Situation: ${state.narrative.illustration_request || "Survival situation"}\nLast Narrative: (Implicit)\nGenerate a single sentence action for the player.`;
    const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ text: JSON.stringify(state) }, { text: prompt }] },
        config: { systemInstruction: PLAYER_SYSTEM_INSTRUCTION }
    });
    return res.text || "Wait and watch.";
};

export const generateImage = async (
    prompt: string, 
    motif: string, 
    context: string = "", 
    allowCharacters: boolean = true
): Promise<string | undefined> => {
    const ai = getAI();
    // Optimize prompt for the model
    let fullPrompt = `Horror Art. Style: ${motif}. Scene: ${context}. Detail: ${prompt}. Photorealistic, cinematic lighting, 8k. No text.`;
    
    if (!allowCharacters) {
        fullPrompt += " CRITICAL: NO PEOPLE, NO CHARACTERS, NO FIGURES, NO FACES. The scene must be completely empty and devoid of life. Liminal space, atmospheric, ominous.";
    }
    
    try {
        const res = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: fullPrompt }] },
            config: {}
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

export const analyzeSourceMaterial = async (file: File): Promise<SourceAnalysisResult> => {
  const ai = getAI();
  const isText = file.type.startsWith('text/') || 
                 file.name.endsWith('.txt') || 
                 file.name.endsWith('.md') || 
                 file.name.endsWith('.csv') || 
                 file.name.endsWith('.json');

  let parts: any[] = [];

  if (isText) {
      const textContent = await fileToText(file);
      parts = [{ text: `[SOURCE MATERIAL: ${file.name}]\n${textContent}` }];
  } else {
      const base64Data = await fileToBase64(file);
      const base64Content = base64Data.split(',')[1];
      parts = [{ inlineData: { mimeType: file.type, data: base64Content } }];
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
    model: 'gemini-3-pro-preview',
    contents: { parts: parts },
    config: { 
        responseMimeType: 'application/json'
    }
  });

  return parseSourceAnalysis(res.text || "{}");
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
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ text: prompt }] },
    });
    return res.text?.trim() || "";
};

export const hydrateUserCharacter = async (description: string, cluster: string): Promise<Partial<NpcState>> => {
    const ai = getAI();
    const prompt = `Hydrate this character description into a partial JSON state. Cluster: ${cluster}. Input: "${description}"`;
    const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
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
        model: 'gemini-3-flash-preview',
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

export const generateNpcPortrait = async (npc: NpcState): Promise<string | undefined> => {
    return generateImage(
        `Portrait of ${npc.name}, ${npc.archetype}. ${npc.physical.distinguishing_feature}. Horror style.`, 
        "Dark, Cinematic, detailed",
        "",
        true // Allow characters for portraits
    );
};

export const analyzeImageContext = async (file: File, aspect: string): Promise<string> => {
    const ai = getAI();
    const base64Data = await fileToBase64(file);
    const res = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
            parts: [
                { inlineData: { mimeType: file.type, data: base64Data.split(',')[1] } },
                { text: `Analyze this image and describe the ${aspect} in 1-2 evocative sentences.` }
            ]
        }
    });
    return res.text?.trim() || "";
};

export const generateCharacterProfile = async (cluster: string, intensity: string, role: string): Promise<CharacterProfile> => {
    const ai = getAI();
    const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ text: `Generate a horror character profile. Role: ${role}. Cluster: ${cluster}. Intensity: ${intensity}.` }] },
        config: { 
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    background: { type: Type.STRING },
                    traits: { type: Type.STRING }
                }
            }
        }
    });
    return parseCharacterProfile(res.text || "{}");
};

export const generateScenarioConcepts = async (cluster: string, intensity: string, mode: string): Promise<ScenarioConcepts> => {
    const ai = getAI();
    const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ text: `Generate a full scenario concept JSON object. Cluster: ${cluster}, Mode: ${mode}, Intensity: ${intensity}.` }] },
        config: {
             responseMimeType: 'application/json',
             responseSchema: {
                type: Type.OBJECT,
                properties: {
                    villain_name: { type: Type.STRING },
                    villain_appearance: { type: Type.STRING },
                    villain_methods: { type: Type.STRING },
                    primary_goal: { type: Type.STRING },
                    victim_description: { type: Type.STRING },
                    survivor_name: { type: Type.STRING },
                    survivor_background: { type: Type.STRING },
                    survivor_traits: { type: Type.STRING },
                    location_description: { type: Type.STRING },
                    visual_motif: { type: Type.STRING }
                }
             }
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
