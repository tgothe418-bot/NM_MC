
import { GoogleGenAI, Part, FunctionDeclaration, Type } from "@google/genai";
import { zodToJsonSchema } from "zod-to-json-schema";
import { 
  GameStateSchema, 
  SourceAnalysisResultSchema,
  ScenarioConceptsSchema,
  CharacterProfileSchema,
  NpcStateSchema,
  GameTurnOutputSchema
} from '../schemas';
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
  parseGameTurnOutput,
  parseSourceAnalysis, 
  parseScenarioConcepts, 
  parseCharacterProfile, 
  parseHydratedCharacter
} from '../parsers';
import { getSinglePassInstruction, PLAYER_SYSTEM_INSTRUCTION, NARRATIVE_EVALUATOR_INSTRUCTION } from '../prompts/instructions';
import { constructVoiceManifesto } from './dialogueEngine';
import { constructSensoryManifesto } from './sensoryEngine';
import { constructLocationManifesto, constructRoomGenerationRules } from './locationEngine';
import { updateNpcMemories } from './memorySystem';

// --- SCHEMA PARSING (Module Scope for Efficiency) ---
const TURN_OUTPUT_SCHEMA = zodToJsonSchema(GameTurnOutputSchema as any, "turnOutput");
const SOURCE_ANALYSIS_SCHEMA = zodToJsonSchema(SourceAnalysisResultSchema as any, "analysis");
const CHARACTER_PROFILE_SCHEMA = zodToJsonSchema(CharacterProfileSchema as any, "profile");
const SCENARIO_CONCEPTS_SCHEMA = zodToJsonSchema(ScenarioConceptsSchema as any, "concepts");

// --- INITIALIZATION (Singleton Pattern) ---
let aiInstance: GoogleGenAI | null = null;

export const initializeGemini = (apiKey: string) => {
    aiInstance = new GoogleGenAI({ apiKey });
};

const getAI = () => {
    if (!aiInstance) throw new Error("Gemini Client not initialized.");
    return aiInstance;
};

/**
 * Utility to wrap Gemini API calls with exponential backoff for rate limits (429).
 */
const withRetry = async <T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 1000): Promise<T> => {
    let lastError: unknown; // [FIX: Directive 3]
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error: unknown) { // [FIX: Directive 3]
            lastError = error;
            
            // [FIX: Directive 3] Implement proper type narrowing
            let isRateLimit = false;
            if (error instanceof Error) {
                isRateLimit = error.message.includes('429');
            } else if (typeof error === 'object' && error !== null) {
                const e = error as Record<string, unknown>;
                isRateLimit = String(e.message || '').includes('429') || 
                             e.status === 'RESOURCE_EXHAUSTED' ||
                             e.code === 429;
            }
            
            if (isRateLimit && i < maxRetries - 1) {
                const delay = initialDelay * Math.pow(2, i);
                console.warn(`Gemini Rate Limit Hit. Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw error;
        }
    }
    throw lastError;
};

// --- ARCHITECT (Chat Companion) FUNCTIONS ---

import { useArchitectStore } from '../store/architectStore';

export const generateArchitectResponse = async (
    history: { role: 'user' | 'model', text: string, imageBase64?: string }[], 
    systemInstruction: string,
    gameState?: GameState,
    architectMemory?: any,
    onChunk?: (text: string) => void
): Promise<string> => {
    const ai = getAI();
    try {
        // [OPTIMIZATION] Prune history to last 10 turns to prevent context bloat
        const prunedHistory = history.slice(-10);

        // Ensure alternating roles starting with 'user'
        const contents: any[] = [];
        for (let i = 0; i < prunedHistory.length; i++) {
            const h = prunedHistory[i];
            const isLastMessage = i === prunedHistory.length - 1;
            const parts: Part[] = [{ text: h.text || "..." }];
            if (h.imageBase64) {
                if (isLastMessage) {
                    const cleanBase64 = h.imageBase64.split(',')[1] || h.imageBase64;
                    parts.push({
                        inlineData: {
                            mimeType: 'image/png',
                            data: cleanBase64
                        }
                    });
                } else {
                    parts.push({ text: "\n[Image attached in previous turn]" });
                }
            }
            
            if (contents.length === 0) {
                if (h.role === 'model') {
                    // Gemini requires starting with user, so we prepend a dummy user message or skip
                    continue;
                }
                contents.push({ role: h.role, parts });
            } else {
                const lastContent = contents[contents.length - 1];
                if (lastContent.role === h.role) {
                    // Collapse consecutive messages of the same role
                    lastContent.parts.push({ text: '\n\n' });
                    lastContent.parts.push(...parts);
                } else {
                    contents.push({ role: h.role, parts });
                }
            }
        }
        
        // If contents is empty after filtering, add a default user message
        if (contents.length === 0) {
            contents.push({ role: 'user', parts: [{ text: 'Hello' }] });
        }

        let fullInstruction = systemInstruction;
        if (gameState) {
            fullInstruction += `\n\n[TNM LOCAL MEMORY]:\n- Current Phase: ${gameState.meta.narrative_phase || 'Unknown'}\n- Active Cluster: ${gameState.meta.active_cluster}\n- Narrative Summary: ${gameState.narrative.past_summary || 'None'}`;
        }
        if (architectMemory) {
            fullInstruction += `\n\n[ARCHITECT MEMORY]:\n- User Name: ${architectMemory.userName || 'Unknown'}\n- Known Facts: ${architectMemory.facts.join(', ') || 'None'}`;
        }

        if (onChunk) {
            const stream = await withRetry(() => ai.models.generateContentStream({
                model: 'gemini-3-flash-preview', 
                contents: contents,
                config: {
                    systemInstruction: fullInstruction,
                    tools: [{ urlContext: {} }]
                }
            }));
            let fullText = "";
            for await (const chunk of stream) {
                const c = chunk as any;
                if (c.text) {
                    fullText += c.text;
                    onChunk(fullText);
                }
            }
            return fullText || "The connection is flickering... I lost that thought. Say it again?";
        } else {
            const response = await withRetry(() => ai.models.generateContent({
                model: 'gemini-3-flash-preview', 
                contents: contents,
                config: {
                    systemInstruction: fullInstruction,
                    tools: [{ urlContext: {} }]
                }
            }));
            return response.text || "The connection is flickering... I lost that thought. Say it again?";
        }
    } catch (e) {
        console.error("Architect Error:", e);
        return "I can't see that... the static is too thick. Try again?";
    }
};

export const extractScenarioFromChat = async (history: { role: 'user' | 'model', text: string }[]): Promise<SimulationConfig> => {
    const ai = getAI();
    // Only use the last 15 messages for extraction to avoid token limits
    const recentHistory = history.slice(-15);
    const transcript = recentHistory.map(h => `${h.role.toUpperCase()}: ${h.text}`).join('\n');
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
        const res = await withRetry(() => ai.models.generateContent({
            model: 'gemini-3-flash-preview', 
            contents: [{ role: 'user', parts: [{ text: extractionPrompt }] }],
            config: { 
                responseMimeType: 'application/json',
                tools: [{ urlContext: {} }]
            }
        }));

        const concepts = parseScenarioConcepts(res.text || "{}");
        
        return {
            perspective: 'First Person',
            mode: history.some(h => h.text.toLowerCase().includes('villain') || h.text.toLowerCase().includes('hunter')) ? 'Villain' : 'Survivor',
            starting_point: 'Prologue',
            cluster: concepts.theme_cluster || 'Flesh',
            intensity: concepts.intensity || 'Level 3',
            cycles: 0,
            ...concepts,
            villain_name: concepts.villain_name || (concepts.villains && concepts.villains.length > 0 ? concepts.villains.join(', ') : "Unknown Entity"),
            villain_appearance: concepts.villain_appearance || concepts.form_and_appearance || "Unknown",
            villain_methods: concepts.villain_methods || concepts.modus_operandi || "Unknown",
            victim_description: concepts.victim_description || (concepts.victims && concepts.victims.length > 0 ? concepts.victims.join(', ') : ""),
            survivor_name: concepts.survivor_name || "Survivor",
            survivor_background: concepts.survivor_background || "Unknown",
            survivor_traits: concepts.survivor_traits || "Unknown",
            location_description: concepts.location_description || "Unknown Location",
            visual_motif: concepts.visual_motif || concepts.aesthetics || "Cinematic",
            primary_goal: concepts.primary_goal || concepts.objectives || "Survive",
            victim_count: Math.min(concepts.population_count || 3, 10),
            parsed_characters: concepts.parsed_characters || []
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

export const evaluateNarrativeTransition = async (
    history: ChatMessage[],
    condition: string
): Promise<{ conditionMet: boolean; reason: string }> => {
    const ai = getAI();
    const lastMessages = history.slice(-6); // Last 3 turns (user + model)
    const transcript = lastMessages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');
    
    const prompt = `CONDITION TO EVALUATE: "${condition}"
    
    RECENT TRANSCRIPT:
    ${transcript}
    
    Does the transcript show that the condition has been met? Respond in JSON.`;

    try {
        const res = await withRetry(() => ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { 
                systemInstruction: NARRATIVE_EVALUATOR_INSTRUCTION,
                responseMimeType: 'application/json' 
            }
        }));

        const result = JSON.parse(res.text || "{}");
        return {
            conditionMet: !!result.conditionMet,
            reason: result.reason || "No reason provided."
        };
    } catch (e) {
        console.error("Narrative Evaluation Failed:", e);
        return { conditionMet: false, reason: "Evaluator error." };
    }
};

// --- GAME LOOP ---

/**
 * Creates a minimized version of the NPC state for LLM context, stripping out heavy flavor text.
 */
const getSlimNpcState = (npc: NpcState) => {
    return {
        name: npc.name,
        archetype: npc.archetype,
        status: npc.consciousness,
        stress: npc.psychology.stress_level,
        sanity: npc.psychology.sanity_percentage,
        thought: npc.psychology.current_thought,
        intent: npc.current_intent.goal,
        injuries: npc.active_injuries.map(i => `${i.location} (${i.type})`),
        inventory: npc.resources_held,
        // We omit background_origin and long_term_summary here to save tokens.
        // The Dialogue Engine will provide specific acting notes instead.
    };
};

// [OPTIMIZATION A] Parallel Pipeline Implementation -> NOW SINGLE PASS
export const processGameTurn = async (
  currentState: GameState, 
  metronome: { currentPhase: string; turnCount: number },
  userAction: string, 
  history: ChatMessage[] = [],
  files: File[] = [],
  onStreamLogic?: (chunk: string, phase: 'logic' | 'narrative') => void
): Promise<{ stateCommands: any[], narrativeMetadata: any, storyText: string, imagePromise?: Promise<string | undefined> }> => {
  const ai = getAI();

  // Find Player NPC to include in the Slim State
  const playerNpc = currentState.npc_states.find(n => n.name === currentState.meta.player_profile?.name) 
                 || currentState.npc_states.find(n => n.archetype.includes('Survivor'));

  // [OPTIMIZATION] Slim Focus State Construction
  // We strip away the full room_map history and other heavy objects to save tokens.
  const slimNpcs = currentState.npc_states.map(getSlimNpcState);

  const focusState = {
      // CURRENT CONTEXT (Crucial)
      location: currentState.location_state.room_map[currentState.location_state.current_room_id],
      
      // Active entities in the scene (We send slim versions)
      active_npcs: slimNpcs,
      
      threat: currentState.villain_state,
      
      // NARRATIVE CONTEXT (The Story So Far)
      // We explicitly pass the summary string.
      memory: currentState.narrative.past_summary,
      
      // PLAYER STATUS (Extracted for focus)
      player_status: playerNpc ? {
          name: playerNpc.name,
          health: playerNpc.active_injuries, // Injuries serve as health status
          inventory: playerNpc.resources_held,
          psych: {
              stress: playerNpc.psychology.stress_level,
              sanity: playerNpc.psychology.sanity_percentage,
              thought: playerNpc.psychology.current_thought
          }
      } : "Unknown/Disembodied",
      
      // META Context
      meta: {
          turn: currentState.meta.turn,
          mode: currentState.meta.mode,
          intensity: currentState.meta.intensity_level,
          cluster: currentState.meta.active_cluster,
          narrative_phase: metronome.currentPhase
      }
  };

  // 1. CONSTRUCT CONTEXT
  const sensoryManifesto = constructSensoryManifesto(currentState);
  const voiceManifesto = constructVoiceManifesto(currentState.npc_states, currentState.meta.active_cluster);
  const locationManifesto = constructLocationManifesto(currentState.location_state);
  const roomRules = constructRoomGenerationRules(currentState);

  const recentHistory = history.slice(-5).map(h => `${h.role.toUpperCase()}: ${h.text}`).join('\n');

  const contextBlock = `
  ${JSON.stringify(focusState)}
  [PRIOR NARRATIVE SUMMARY]: ${currentState.narrative.past_summary || "None"}
  [RECENT HISTORY]:
  ${recentHistory}
  
  ${sensoryManifesto}
  ${voiceManifesto}
  ${locationManifesto}
  ${roomRules}
  
  INSTRUCTION: You must output an array of discrete atomic commands in 'state_commands' to mutate the game state, rather than partial state merges.
  `;

  // 2. SINGLE PASS GENERATION
  if (onStreamLogic) onStreamLogic("processing neural turn...\n", 'logic');

  let finalStoryText = "*The vision blurs...*";
  let stateCommands: any[] = [];
  let narrativeMetadata: any = { entities_addressed: [], tension_delta: 0, narrative_escalation: false };
  let imagePromise: Promise<string | undefined> | undefined;

  try {
      const response = await withRetry(() => ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [{
              role: 'user',
              parts: [
                  { text: contextBlock },
                  { text: `USER ACTION: "${userAction}"` }
              ]
          }],
          config: { 
              systemInstruction: getSinglePassInstruction(metronome.currentPhase as any) + `\n\n[LONG TERM MEMORY]: ${currentState.narrative.past_summary || "No prior history."}`, 
              responseMimeType: 'application/json',
              responseSchema: TURN_OUTPUT_SCHEMA.definitions?.turnOutput as any,
              tools: [{ urlContext: {} }]
          }
      }));

      const rawText = response.text || "{}";
      const parsedOutput = parseGameTurnOutput(rawText);
      
      stateCommands = parsedOutput.state_commands || [];
      narrativeMetadata = parsedOutput.narrative_metadata || narrativeMetadata;
      
      finalStoryText = parsedOutput.narrative_render.story_text || "...";
      
      // 3. IMAGE GENERATION (NON-BLOCKING)
      let hasVisualTag = finalStoryText.includes('[ESTABLISHING_SHOT]') || finalStoryText.includes('[SELF_PORTRAIT]');
      // Clean tags from text
      finalStoryText = finalStoryText.replace(/\[ESTABLISHING_SHOT\]|\[SELF_PORTRAIT\]/g, '');

      const requestFromRender = parsedOutput.narrative_render.illustration_request;
      
      if (requestFromRender || hasVisualTag) {
          if (onStreamLogic) onStreamLogic("queuing visual artifact...\n", 'narrative');
          
          let prompt = typeof requestFromRender === 'string' ? requestFromRender : "Establishing Shot";
          // Trigger the promise but DO NOT await it here
          imagePromise = generateImage(
              prompt, 
              currentState.narrative.visual_motif, // Use current state motif
              currentState.location_state.room_map[currentState.location_state.current_room_id]?.description_cache,
              false 
          );
      }

  } catch (e: any) {
      console.error("Single Pass Engine Error:", e);
      if (e?.message === "RATE_LIMIT_EXCEEDED" || e?.status === 429 || e?.message?.includes('429') || e?.message?.includes('Rate Limit') || e?.message?.includes('quota')) {
          throw e;
      }
      finalStoryText = "The machine screams in binary. (Engine Failure)";
  }
  
  return {
      stateCommands,
      narrativeMetadata,
      storyText: finalStoryText,
      imagePromise // Return the promise to the UI
  } as any; // Temporary cast, will be handled in useGameEngine
};

// --- HELPER FUNCTIONS ---

export const generateAutoPlayerAction = async (state: GameState): Promise<string> => {
    const ai = getAI();
    try {
        const prompt = `Current Situation: ${state.narrative.illustration_request || "Survival situation"}\nLast Narrative: (Implicit)\nGenerate a single sentence action for the player.`;
        const res = await withRetry(() => ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ role: 'user', parts: [{ text: JSON.stringify(state) }, { text: prompt }] }],
            config: { systemInstruction: PLAYER_SYSTEM_INSTRUCTION }
        }));
        return res.text || "Wait and watch.";
    } catch (e: any) {
        console.error("Error in generateAutoPlayerAction:", e);
        if (e?.status === 429 || e?.message?.includes('429') || e?.message?.includes('Rate Limit') || e?.message?.includes('quota')) {
            throw new Error("RATE_LIMIT_EXCEEDED");
        }
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

export const analyzeSourceMaterial = async (
  file: File,
  onProgress?: (stage: string, percent: number) => void
): Promise<SourceAnalysisResult> => {
  const ai = getAI();
  const mime = getMimeType(file);
  const isText = mime.startsWith('text/') || 
                 mime === 'application/json' ||
                 mime.includes('csv') || 
                 mime.includes('markdown') ||
                 file.name.endsWith('.md');

  try {
      if (onProgress) onProgress("Reading local memory buffer...", 15);
      
      let textContent = "";
      if (isText) {
          textContent = await fileToText(file);
      } else {
          // For non-text, we can't easily chunk, so we just pass it as is
          const base64Data = await fileToBase64(file);
          const base64Content = base64Data.split(',')[1];
          return await processSourceChunk([{ inlineData: { mimeType: mime, data: base64Content } }], onProgress);
      }

      if (onProgress) onProgress("Encoding neural stream for ingestion...", 45);

      // Chunking logic
      const chunkSize = 80000;
      if (textContent.length > 100000) {
          const chunks: string[] = [];
          for (let i = 0; i < textContent.length; i += chunkSize) {
              chunks.push(textContent.slice(i, i + chunkSize));
          }
          
          const results: SourceAnalysisResult[] = new Array(chunks.length);
          const limit = 3; // Concurrency limit
          for (let i = 0; i < chunks.length; i += limit) {
              const batch = chunks.slice(i, i + limit);
              const batchResults = await Promise.all(batch.map((chunk, idx) => {
                  const chunkIndex = i + idx;
                  return processSourceChunk([{ text: `[SOURCE MATERIAL CHUNK ${chunkIndex + 1}/${chunks.length}]\n${chunk}` }]);
              }));
              batchResults.forEach((res, idx) => results[i + idx] = res);
              if (onProgress) onProgress(`Processed ${Math.min(i + limit, chunks.length)} of ${chunks.length} chunks...`, 45 + Math.floor((Math.min(i + limit, chunks.length) / chunks.length) * 30));
          }
          
          if (onProgress) onProgress("Synthesizing character archetypes and environmental data...", 75);
          
          // Merge results
          const mergedResult: SourceAnalysisResult = {
              characters: [],
              location: results[0]?.location,
              visual_motif: results[0]?.visual_motif,
              theme_cluster: results[0]?.theme_cluster,
              intensity: results[0]?.intensity,
              plot_hook: results[0]?.plot_hook,
              form_and_appearance: results[0]?.form_and_appearance,
              modus_operandi: results[0]?.modus_operandi,
              aesthetics: results[0]?.aesthetics,
              population_count: results[0]?.population_count,
              objectives: results[0]?.objectives,
              villains: [],
              victims: [],
              rpp_transition_gate: results[0]?.rpp_transition_gate,
              rpp_voice_manifesto: results[0]?.rpp_voice_manifesto,
              rpp_primary_vectors: []
          };
          
          const seenCharacters = new Set<string>();
          const seenVectors = new Set<string>();
          const seenVillains = new Set<string>();
          const seenVictims = new Set<string>();
          
          for (const res of results) {
              if (res.characters) {
                  for (const char of res.characters) {
                      if (!seenCharacters.has(char.name)) {
                          seenCharacters.add(char.name);
                          mergedResult.characters!.push(char);
                      }
                  }
              }
              if (res.rpp_primary_vectors) {
                  for (const vec of res.rpp_primary_vectors) {
                      if (!seenVectors.has(vec)) {
                          seenVectors.add(vec);
                          mergedResult.rpp_primary_vectors!.push(vec);
                      }
                  }
              }
              if (res.villains) {
                  for (const villain of res.villains) {
                      if (!seenVillains.has(villain)) {
                          seenVillains.add(villain);
                          mergedResult.villains!.push(villain);
                      }
                  }
              }
              if (res.victims) {
                  for (const victim of res.victims) {
                      if (!seenVictims.has(victim)) {
                          seenVictims.add(victim);
                          mergedResult.victims!.push(victim);
                      }
                  }
              }
          }
          
          if (onProgress) onProgress("Ingestion complete. Neural patterns stabilized.", 100);
          return mergedResult;
      } else {
          const result = await processSourceChunk([{ text: `[SOURCE MATERIAL: ${file.name}]\n${textContent}` }], onProgress);
          if (onProgress) onProgress("Ingestion complete. Neural patterns stabilized.", 100);
          return result;
      }

  } catch (e) {
      console.error("Analysis Failed:", e);
      throw e;
  }
};

const processSourceChunk = async (parts: Part[], onProgress?: (stage: string, percent: number) => void): Promise<SourceAnalysisResult> => {
    const ai = getAI();
    const prompt = `You are the Reference Processing Protocol (RPP) for The Nightmare Machine. 
Analyze the following source material and extract its narrative architecture into strictly formatted JSON.

EXECUTE THE FOLLOWING EXTRACTION FILTERS:
1. characters: Extract the main characters (name, role, description, physical/psychological traits).
2. location: The primary setting.
3. theme_cluster: Categorize strictly as one of: Flesh, System, Haunting, Survival, Self, Blasphemy, Desire.
4. plot_hook: The core premise or starting anomaly.
5. form_and_appearance: Describe the physical form and appearance of the primary threat or villain.
6. modus_operandi: Describe how the threat operates, its methods, and patterns.
7. aesthetics: Describe the visual motif, atmosphere, and aesthetic style of the material.
8. population_count: Estimate the number of victims or people present in the location (number).
9. objectives: What are the primary goals of the characters or the threat?
10. villains: List the names or designations of the villains/threats.
11. victims: List the names or descriptions of the victims.
12. rpp_transition_gate: Identify the 'Point of No Return'. Formulate a strict boolean question that determines if Act 1 is over (e.g., "Has the user inhaled the gas?" or "Did they enter the basement?").
13. rpp_voice_manifesto: Define the author's prose style, pacing, and how the syntax should degrade as the climax approaches.
14. rpp_primary_vectors: Identify which psychological stats this story targets. Return an array containing any of: "fear", "isolation", "guilt", "paranoia".`;

    const fullParts = [...parts, { text: prompt }];

    const res = await withRetry(() => ai.models.generateContent({
        model: 'gemini-3-flash-preview', 
        contents: [{ role: 'user', parts: fullParts }],
        config: { 
            responseMimeType: 'application/json',
            responseSchema: SOURCE_ANALYSIS_SCHEMA.definitions?.analysis as any
        }
    }));

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
    
    const res = await withRetry(() => ai.models.generateContent({
        model: 'gemini-3-flash-preview', // Downgraded to Flash
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
    }));
    return res.text?.trim() || "";
};

export const hydrateUserCharacter = async (description: string, cluster: string): Promise<Partial<NpcState>> => {
    const ai = getAI();
    const prompt = `Hydrate this character description into a partial JSON state. Cluster: ${cluster}. Input: "${description}"`;
    const res = await withRetry(() => ai.models.generateContent({
        model: 'gemini-3-flash-preview', // Downgraded to Flash
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { responseMimeType: 'application/json' }
    }));
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
      const res = await withRetry(() => ai.models.generateContent({
        model: 'gemini-3-flash-preview', // Downgraded to Flash
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { responseMimeType: 'application/json' }
      }));
      
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

    const res = await withRetry(() => ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{
            role: 'user',
            parts: [
                { inlineData: { mimeType: mime, data: base64Data.split(',')[1] } },
                { text: `Analyze this image and describe the ${aspect} in 1-2 evocative sentences.` }
            ]
        }]
    }));
    return res.text?.trim() || "";
};

export const generateCharacterProfile = async (cluster: string, intensity: string, role: string): Promise<CharacterProfile> => {
    const ai = getAI();

    const res = await withRetry(() => ai.models.generateContent({
        model: 'gemini-3-flash-preview', 
        contents: [{ role: 'user', parts: [{ text: `Generate a horror character profile. Role: ${role}. Cluster: ${cluster}. Intensity: ${intensity}.` }] }],
        config: { 
            responseMimeType: 'application/json',
            responseSchema: CHARACTER_PROFILE_SCHEMA.definitions?.profile as any
        }
    }));
    return parseCharacterProfile(res.text || "{}");
};

export const generateScenarioConcepts = async (cluster: string, intensity: string, mode: string): Promise<ScenarioConcepts> => {
    const ai = getAI();

    const res = await withRetry(() => ai.models.generateContent({
        model: 'gemini-3-flash-preview', 
        contents: [{ role: 'user', parts: [{ text: `Generate a full scenario concept JSON object. Cluster: ${cluster}, Mode: ${mode}, Intensity: ${intensity}.` }] }],
        config: {
             responseMimeType: 'application/json',
             responseSchema: SCENARIO_CONCEPTS_SCHEMA.definitions?.concepts as any
        }
    }));
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
        reader.onload = () => {
            let text = reader.result as string;
            resolve(text);
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
};
