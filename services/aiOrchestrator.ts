
import { GoogleGenAI, Part, FunctionDeclaration, Type } from "@google/genai";
import Anthropic from "@anthropic-ai/sdk";
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
let anthropicInstance: Anthropic | null = null;

export const initializeGemini = (apiKey: string) => {
    aiInstance = new GoogleGenAI({ apiKey });
};

export const initializeAnthropic = (apiKey: string) => {
    // We must set dangerouslyAllowBrowser to true since this is a client-side app
    anthropicInstance = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
};

const getAI = () => {
    if (!aiInstance) throw new Error("Gemini Client not initialized.");
    return aiInstance;
};

const getAnthropic = () => {
    if (!anthropicInstance) throw new Error("Anthropic Client not initialized.");
    return anthropicInstance;
};

/**
 * Strips Markdown code block syntax from raw string output before JSON parsing.
 */
const sanitizeJSON = (raw: string): string => {
    let sanitized = raw.trim();
    if (sanitized.startsWith("```json")) {
        sanitized = sanitized.substring(7);
    } else if (sanitized.startsWith("```")) {
        sanitized = sanitized.substring(3);
    }
    if (sanitized.endsWith("```")) {
        sanitized = sanitized.substring(0, sanitized.length - 3);
    }
    return sanitized.trim();
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
    const anthropic = getAnthropic();
    try {
        // [OPTIMIZATION] Prune history to prevent context bloat while preserving as much as possible
        const MAX_CHARS = 8000;
        let currentChars = 0;
        const prunedHistory = [];
        
        for (let i = history.length - 1; i >= 0; i--) {
            const msg = history[i];
            const msgLength = (msg.text || "").length + (msg.imageBase64 ? 1000 : 0); // rough estimate for image
            if (currentChars + msgLength > MAX_CHARS) {
                break;
            }
            prunedHistory.unshift(msg);
            currentChars += msgLength;
        }

        // Ensure alternating roles starting with 'user'
        const messages: any[] = [];
        for (let i = 0; i < prunedHistory.length; i++) {
            const h = prunedHistory[i];
            const isLastMessage = i === prunedHistory.length - 1;
            const content: any[] = [{ type: "text", text: h.text || "..." }];
            
            if (h.imageBase64) {
                if (isLastMessage) {
                    const cleanBase64 = h.imageBase64.split(',')[1] || h.imageBase64;
                    content.unshift({
                        type: "image",
                        source: {
                            type: "base64",
                            media_type: "image/png",
                            data: cleanBase64
                        }
                    });
                } else {
                    content.push({ type: "text", text: "\n[Image attached in previous turn]" });
                }
            }
            
            const role = h.role === 'model' ? 'assistant' : 'user';
            
            if (messages.length === 0) {
                if (role === 'assistant') {
                    // Anthropic requires starting with user, so we prepend a dummy user message or skip
                    continue;
                }
                messages.push({ role, content });
            } else {
                const lastMessage = messages[messages.length - 1];
                if (lastMessage.role === role) {
                    // Collapse consecutive messages of the same role
                    lastMessage.content.push({ type: "text", text: '\n\n' });
                    lastMessage.content.push(...content);
                } else {
                    messages.push({ role, content });
                }
            }
        }
        
        // If messages is empty after filtering, add a default user message
        if (messages.length === 0) {
            messages.push({ role: 'user', content: [{ type: "text", text: 'Hello' }] });
        }

        const systemBlocks: any[] = [
            {
                type: "text",
                text: systemInstruction,
                cache_control: { type: "ephemeral" }
            }
        ];

        let dynamicInstruction = "";
        if (gameState) {
            dynamicInstruction += `\n\n[TNM LOCAL MEMORY]:\n- Current Phase: ${gameState.meta.narrative_phase || 'Unknown'}\n- Active Cluster: ${gameState.meta.active_cluster}\n- Narrative Summary: ${gameState.narrative.past_summary || 'None'}`;
        }
        if (architectMemory) {
            dynamicInstruction += `\n\n[ARCHITECT MEMORY]:\n- User Name: ${architectMemory.userName || 'Unknown'}\n- Known Facts: ${architectMemory.facts.join(', ') || 'None'}`;
        }

        if (dynamicInstruction) {
            systemBlocks.push({
                type: "text",
                text: dynamicInstruction
            });
        }

        if (onChunk) {
            const stream = await withRetry(() => anthropic.messages.create({
                model: 'claude-3-5-sonnet-latest',
                max_tokens: 4000,
                system: systemBlocks,
                messages: messages,
                stream: true
            }));
            let fullText = "";
            for await (const chunk of stream) {
                if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                    fullText += chunk.delta.text;
                    onChunk(fullText);
                }
            }
            return fullText || "The connection is flickering... I lost that thought. Say it again?";
        } else {
            const response = await withRetry(() => anthropic.messages.create({
                model: 'claude-3-5-sonnet-latest',
                max_tokens: 4000,
                system: systemBlocks,
                messages: messages
            }));
            const textContent = response.content.find(c => c.type === 'text');
            return textContent && textContent.type === 'text' ? textContent.text : "The connection is flickering... I lost that thought. Say it again?";
        }
    } catch (e) {
        console.error("Architect Error:", e);
        return "I can't see that... the static is too thick. Try again?";
    }
};

export const extractScenarioFromChat = async (history: { role: 'user' | 'model', text: string }[]): Promise<SimulationConfig> => {
    const anthropic = getAnthropic();
    // Use a character-aware reduction method to preserve history up to ~80k characters
    const MAX_CHARS = 8000;
    let currentChars = 0;
    const recentHistory = [];
    
    for (let i = history.length - 1; i >= 0; i--) {
        const msg = history[i];
        const msgLength = (msg.text || "").length;
        if (currentChars + msgLength > MAX_CHARS) {
            break;
        }
        recentHistory.unshift(msg);
        currentChars += msgLength;
    }
    
    const transcript = recentHistory.map(h => `${h.role.toUpperCase()}: ${h.text}`).join('\n');
    const extractionPrompt = `Analyze the following creative conversation and extract a valid Horror Scenario Configuration JSON.
    
    Transcript:
    ${transcript}
    
    Infer any missing fields with creative defaults based on the tone of the chat.
    Mode should be 'Survivor' or 'Villain'.
    Intensity should be 'Level 3' if unspecified.
    Cluster should be one of: Flesh, System, Haunting, Self, Blasphemy, Survival, Desire.
    `;

    try {
        const res = await withRetry(() => anthropic.messages.create({
            model: 'claude-3-5-sonnet-latest',
            max_tokens: 4000,
            messages: [{ role: 'user', content: extractionPrompt }],
            tools: [{
                name: "extract_scenario",
                description: "Extract scenario concepts",
                input_schema: SCENARIO_CONCEPTS_SCHEMA.definitions?.concepts as any
            }],
            tool_choice: { type: "tool", name: "extract_scenario" }
        }));

        const toolCall = res.content.find(c => c.type === 'tool_use');
        const concepts = parseScenarioConcepts(JSON.stringify(toolCall && toolCall.type === 'tool_use' ? toolCall.input : {}));
        
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
    const anthropic = getAnthropic();
    // Only summarize if history is long
    if (history.length < 10) return "";

    const transcript = history.map(h => `${h.role}: ${h.text}`).join('\n');
    const prompt = `Summarize the following narrative arc into a single detailed paragraph. Preserve key facts, injuries, and current objectives.\n\n${transcript}`;

    try {
        const res = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-latest',
            max_tokens: 500,
            messages: [{ role: 'user', content: prompt }]
        });
        const textContent = res.content.find(c => c.type === 'text');
        return textContent && textContent.type === 'text' ? textContent.text : "";
    } catch (e) {
        return "";
    }
};

export const evaluateNarrativeTransition = async (
    history: ChatMessage[],
    condition: string
): Promise<{ conditionMet: boolean; reason: string }> => {
    const anthropic = getAnthropic();
    const lastMessages = history.slice(-6); // Last 3 turns (user + model)
    const transcript = lastMessages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');
    
    const prompt = `CONDITION TO EVALUATE: "${condition}"
    
    RECENT TRANSCRIPT:
    ${transcript}
    
    Does the transcript show that the condition has been met? Respond in JSON.`;

    try {
        const res = await withRetry(() => anthropic.messages.create({
            model: 'claude-3-5-sonnet-latest',
            max_tokens: 500,
            system: NARRATIVE_EVALUATOR_INSTRUCTION,
            messages: [{ role: 'user', content: prompt }],
            tools: [{
                name: "evaluate_transition",
                description: "Evaluate narrative transition",
                input_schema: {
                    type: "object",
                    properties: {
                        conditionMet: { type: "boolean" },
                        reason: { type: "string" }
                    },
                    required: ["conditionMet", "reason"]
                }
            }],
            tool_choice: { type: "tool", name: "evaluate_transition" }
        }));

        const toolCall = res.content.find(c => c.type === 'tool_use');
        const result = toolCall && toolCall.type === 'tool_use' ? toolCall.input as any : {};
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
  const anthropic = getAnthropic();

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
  
  INSTRUCTION: You must output an array of discrete atomic commands in 'state_commands' to mutate the game state, rather than partial state merges.
  `;

  const staticSystemInstruction = `
  ${getSinglePassInstruction(metronome.currentPhase as any)}
  
  [WORLD BUILDING RULES]
  ${sensoryManifesto}
  ${voiceManifesto}
  ${locationManifesto}
  ${roomRules}
  `;

  const dynamicSystemInstruction = `
  [LONG TERM MEMORY]: ${currentState.narrative.past_summary || "No prior history."}
  `;

  // 2. SINGLE PASS GENERATION
  if (onStreamLogic) onStreamLogic("processing neural turn...\n", 'logic');

  let finalStoryText = "*The vision blurs...*";
  let stateCommands: any[] = [];
  let narrativeMetadata: any = { entities_addressed: [], tension_delta: 0, narrative_escalation: false };
  let imagePromise: Promise<string | undefined> | undefined;

  try {
      const response = await withRetry(() => anthropic.messages.create({
          model: 'claude-3-5-sonnet-latest',
          max_tokens: 4000,
          system: [
              {
                  type: "text",
                  text: staticSystemInstruction,
                  cache_control: { type: "ephemeral" }
              },
              {
                  type: "text",
                  text: dynamicSystemInstruction
              }
          ],
          messages: [{
              role: 'user',
              content: `${contextBlock}\n\nUSER ACTION: "${userAction}"`
          }],
          tools: [{
              name: "process_turn",
              description: "Process the game turn and return the output",
              input_schema: TURN_OUTPUT_SCHEMA.definitions?.turnOutput as any
          }],
          tool_choice: { type: "tool", name: "process_turn" }
      }));

      const toolCall = response.content.find(c => c.type === 'tool_use');
      const rawText = JSON.stringify(toolCall && toolCall.type === 'tool_use' ? toolCall.input : {});
      const parsedOutput = parseGameTurnOutput(rawText);
      
      stateCommands = parsedOutput.state_commands || [];
      narrativeMetadata = parsedOutput.narrative_metadata || narrativeMetadata;
      
      finalStoryText = parsedOutput.narrative_render.story_text || "...";
      
      // 3. IMAGE GENERATION (NON-BLOCKING)
      // Clean tags from text
      finalStoryText = finalStoryText.replace(/\[ESTABLISHING_SHOT\]|\[SELF_PORTRAIT\]/g, '');

      const requestFromRender = parsedOutput.narrative_render.illustration_request;
      
      const visualKeywordsRegex = /(image|picture|draw|illustrate|show me)/i;
      const userRequestedImage = visualKeywordsRegex.test(userAction);
      
      if (typeof requestFromRender === 'string' && userRequestedImage) {
          if (onStreamLogic) onStreamLogic("queuing visual artifact...\n", 'narrative');
          
          let prompt = requestFromRender;
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
    const anthropic = getAnthropic();
    try {
        const prompt = `Current Situation: ${state.narrative.illustration_request || "Survival situation"}\nLast Narrative: (Implicit)\nGenerate a single sentence action for the player.`;
        const res = await withRetry(() => anthropic.messages.create({
            model: 'claude-3-5-sonnet-latest',
            max_tokens: 100,
            system: PLAYER_SYSTEM_INSTRUCTION,
            messages: [{ role: 'user', content: `${JSON.stringify(state)}\n\n${prompt}` }]
        }));
        const textContent = res.content.find(c => c.type === 'text');
        return textContent && textContent.type === 'text' ? textContent.text : "Wait and watch.";
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
          const paragraphs = textContent.split('\n\n');
          let currentChunk = '';
          
          for (const paragraph of paragraphs) {
              if (currentChunk.length + paragraph.length > chunkSize) {
                  if (currentChunk.length > 0) {
                      chunks.push(currentChunk);
                      currentChunk = '';
                  }
                  // If a single paragraph is larger than the chunk size, push it as its own chunk
                  if (paragraph.length > chunkSize) {
                      chunks.push(paragraph);
                  } else {
                      currentChunk = paragraph + '\n\n';
                  }
              } else {
                  currentChunk += paragraph + '\n\n';
              }
          }
          if (currentChunk.trim().length > 0) {
              chunks.push(currentChunk);
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

const processSourceChunk = async (parts: any[], onProgress?: (stage: string, percent: number) => void): Promise<SourceAnalysisResult> => {
    const anthropic = getAnthropic();
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

    const content: any[] = [];
    for (const part of parts) {
        if (part.text) {
            content.push({ type: "text", text: part.text });
        } else if (part.inlineData) {
            content.push({
                type: "image",
                source: {
                    type: "base64",
                    media_type: part.inlineData.mimeType,
                    data: part.inlineData.data
                }
            });
        }
    }

    const res = await withRetry(() => anthropic.messages.create({
        model: 'claude-3-5-sonnet-latest',
        max_tokens: 4000,
        system: [
            {
                type: "text",
                text: prompt,
                cache_control: { type: "ephemeral" }
            }
        ],
        messages: [{ role: 'user', content }],
        tools: [{
            name: "analyze_source",
            description: "Analyze source material",
            input_schema: SOURCE_ANALYSIS_SCHEMA.definitions?.analysis as any
        }],
        tool_choice: { type: "tool", name: "analyze_source" }
    }));

    const toolCall = res.content.find(c => c.type === 'tool_use');
    return parseSourceAnalysis(JSON.stringify(toolCall && toolCall.type === 'tool_use' ? toolCall.input : {}));
};

export const generateCalibrationField = async (
    field: string, 
    cluster: string, 
    intensity: string, 
    existingContext?: string, 
    refinementInput?: string
): Promise<string> => {
    const anthropic = getAnthropic();
    let prompt = `Generate a creative, horror-themed value for the field: "${field}". Focus on providing two or three strong elements to allow the User to expand on them. Do not overload with descriptors.
    Context: Cluster=${cluster}, Intensity=${intensity}.`;
    
    if (existingContext) prompt += `\nExisting Context: ${existingContext}`;
    if (refinementInput) prompt += `\nRefine this existing value: "${refinementInput}"`;
    
    const res = await withRetry(() => anthropic.messages.create({
        model: 'claude-3-5-sonnet-latest',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
    }));
    const textContent = res.content.find(c => c.type === 'text');
    return textContent && textContent.type === 'text' ? textContent.text.trim() : "";
};

export const hydrateUserCharacter = async (description: string, cluster: string): Promise<Partial<NpcState>> => {
    const anthropic = getAnthropic();
    const prompt = `Hydrate this character description into a partial JSON state. Cluster: ${cluster}. Input: "${description}". Focus on providing two or three strong elements for traits and flaws to allow the User to expand on them. Do not overload with descriptors.`;
    const res = await withRetry(() => anthropic.messages.create({
        model: 'claude-3-5-sonnet-latest',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
        tools: [{
            name: "hydrate_character",
            description: "Hydrate character description",
            input_schema: NpcStateSchema as any
        }],
        tool_choice: { type: "tool", name: "hydrate_character" }
    }));
    const toolCall = res.content.find(c => c.type === 'tool_use');
    return parseHydratedCharacter(JSON.stringify(toolCall && toolCall.type === 'tool_use' ? toolCall.input : {}));
};

export const extractCharactersFromText = async (text: string, cluster: string): Promise<Partial<NpcState>[]> => {
  const anthropic = getAnthropic();
  const prompt = `Analyze the following text which describes a group of characters for a horror simulation (Theme: ${cluster}).
  
  Extract EACH character into a JSON object. Focus on providing two or three strong elements for traits and flaws to allow the User to expand on them. Do not overload with descriptors.
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
      const res = await withRetry(() => anthropic.messages.create({
        model: 'claude-3-5-sonnet-latest',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      }));
      
      const textContent = res.content.find(c => c.type === 'text');
      const jsonStr = textContent && textContent.type === 'text' ? textContent.text : "[]";
      const json = JSON.parse(sanitizeJSON(jsonStr));
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
    const anthropic = getAnthropic();

    const res = await withRetry(() => anthropic.messages.create({
        model: 'claude-3-5-sonnet-latest',
        max_tokens: 2000,
        messages: [{ role: 'user', content: `Generate a horror character profile. Role: ${role}. Cluster: ${cluster}. Intensity: ${intensity}. Focus on providing two or three strong elements for their background, traits, and flaws to allow the User to expand on them. Do not overload the system with descriptors.` }],
        tools: [{
            name: "generate_profile",
            description: "Generate character profile",
            input_schema: CHARACTER_PROFILE_SCHEMA.definitions?.profile as any
        }],
        tool_choice: { type: "tool", name: "generate_profile" }
    }));
    const toolCall = res.content.find(c => c.type === 'tool_use');
    return parseCharacterProfile(JSON.stringify(toolCall && toolCall.type === 'tool_use' ? toolCall.input : {}));
};

export const generateScenarioConcepts = async (cluster: string, intensity: string, mode: string): Promise<ScenarioConcepts> => {
    const anthropic = getAnthropic();

    const res = await withRetry(() => anthropic.messages.create({
        model: 'claude-3-5-sonnet-latest',
        max_tokens: 4000,
        messages: [{ role: 'user', content: `Generate a full scenario concept JSON object. Cluster: ${cluster}, Mode: ${mode}, Intensity: ${intensity}. Focus on providing two or three strong elements for the story and setting to allow the User to expand on them. Do not overload the system with descriptors.` }],
        tools: [{
            name: "generate_scenario",
            description: "Generate scenario concepts",
            input_schema: SCENARIO_CONCEPTS_SCHEMA.definitions?.concepts as any
        }],
        tool_choice: { type: "tool", name: "generate_scenario" }
    }));
    const toolCall = res.content.find(c => c.type === 'tool_use');
    return parseScenarioConcepts(JSON.stringify(toolCall && toolCall.type === 'tool_use' ? toolCall.input : {}));
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
