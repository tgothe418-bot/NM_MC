
import { GoogleGenAI, Chat } from "@google/genai";
import { SYSTEM_INSTRUCTION, PLAYER_SYSTEM_INSTRUCTION, ANALYST_SYSTEM_INSTRUCTION } from "../constants";
import { NarrativeEvent, SimulationConfig } from "../types";

let chatSession: Chat | null = null;

export const initializeGemini = () => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    chatSession = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.9,
        responseMimeType: 'application/json',
      },
    });
  } catch (error) {
    console.error("Failed to initialize Gemini:", error);
  }
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Robust Retry Wrapper for API Calls
const withRetry = async <T>(
  operation: () => Promise<T>, 
  context: string = "API Call"
): Promise<T> => {
  let attempt = 0;
  const maxAttempts = 5;
  const baseDelay = 2000;

  while (attempt < maxAttempts) {
    try {
      return await operation();
    } catch (error: any) {
      attempt++;
      
      // Identify retryable errors (Rate Limits, Server Overload)
      const isRetryable = error.status === 429 || 
                         error.status === 503 || 
                         (error.message && (
                            error.message.includes('429') || 
                            error.message.includes('quota') || 
                            error.message.includes('RESOURCE_EXHAUSTED')
                         ));

      if (isRetryable && attempt < maxAttempts) {
        let delay = baseDelay * Math.pow(2, attempt - 1);
        
        // Smart Delay: Parse specific retry duration from Gemini error message
        const match = error.message?.match(/retry in ([0-9.]+)s/);
        if (match && match[1]) {
           delay = Math.ceil(parseFloat(match[1]) * 1000) + 1000;
        }
        
        console.warn(`Gemini API busy (${context}). Retrying in ${Math.round(delay/1000)}s...`);
        await wait(delay);
        continue;
      }
      
      console.error(`Gemini API Error (${context}):`, error);
      throw error;
    }
  }
  throw new Error(`Failed ${context} after ${maxAttempts} attempts.`);
};

export const generateCalibrationField = async (
  field: string, 
  cluster: string, 
  intensity: string, 
  count?: number, 
  existingValue?: string
): Promise<string> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let instructions = `Be creative, unsettling, and highly detailed. Stay true to the specific tropes and aesthetics of the selected cluster. 
Output ONLY the generated text. No preamble, no quotes.`;

    if (existingValue && existingValue.trim().length > 0) {
      instructions = `The user has provided some initial notes: "${existingValue}". 
Your task is to EXPAND and REFINE these notes. Maintain the core idea but add depth, atmospheric detail, and transgressive weight appropriate for the ${cluster} cluster and ${intensity} intensity. 
Output ONLY the expanded text. No preamble, no quotes.`;
    } else {
      if (field === 'Specimen Targets' && count) {
        instructions = `Generate exactly ${count} named characters with evocative backgrounds who will serve as the victims/survivors in this story. 
For each character, include their name, archetype, and a 'Genesis Sin' or a deep psychological vulnerability that makes them a target for the Machine. 
Format as a structured list or catalog of specimens. Use a tone appropriate for the ${cluster} cluster and ${intensity} intensity.`;
      }

      if (field === 'Primary Objective') {
        instructions = `Generate a very brief, simple, and vague primary objective. It should be evocative and unsettling but lack specific mechanical detail. One short sentence maximum. 
Stay true to the ${cluster} theme. Output ONLY the text.`;
      }

      if (field === 'Entity Name') {
        instructions = `Generate a single, terrifying, and thematically appropriate name or title for a horror antagonist. 
Appropriate for ${cluster} cluster and ${intensity} intensity. 
Output ONLY the name. No quotes, no descriptions.`;
      }
    }

    const prompt = `As the Horror Story Architect, generate a relevant entry for the field "${field}" in an interactive horror simulation.
Cluster: ${cluster}
Intensity: ${intensity}
Context: The user is playing as an Antagonist/Predator.
${instructions}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.8,
      },
    });
    return response.text?.trim() || "";
  }, `Generate Calibration Field: ${field}`);
};

export const sendMessageToGemini = async (
  message: string, 
  injectedEvents?: NarrativeEvent[],
  dialogueManifesto?: string,
  sensoryManifesto?: string
): Promise<string> => {
  if (!chatSession) {
    throw new Error("Gemini API not initialized. Please provide an API Key.");
  }

  // Explicitly structure the prompt to separate User Action from System Injections
  let finalMessage = `USER ACTION: ${message}`;
  
  // 1. Inject Narrative Events
  if (injectedEvents && injectedEvents.length > 0) {
    const eventDescriptions = injectedEvents.map(e => 
      `EVENT TRIGGERED: "${e.name}" - ${e.description}. Required Effects: ${JSON.stringify(e.effects)}`
    ).join('\n');
    
    finalMessage += `\n\n*** SYSTEM ALERT: NARRATIVE EVENTS TRIGGERED ***\n[INSTRUCTION: Integrate these events into the immediate narrative and update Game State accordingly.]\n${eventDescriptions}`;
  }

  // 2. Inject Dialogue Manifesto (The New Dynamic Engine)
  if (dialogueManifesto) {
      finalMessage += dialogueManifesto;
  }

  // 3. Inject Sensory Manifesto
  if (sensoryManifesto) {
      finalMessage += sensoryManifesto;
  }

  // 4. State Update Instruction - Reinforced
  finalMessage += `\n\n[SYSTEM INSTRUCTION]:\n1. You MUST update 'long_term_summary' in 'dialogue_state.memory' for any active NPCs to compress key events from this turn.\n2. Maintain the specified Social Intent for each NPC.`;

  return withRetry(async () => {
    const response = await chatSession!.sendMessage({ message: finalMessage });
    return response.text || "";
  }, "Narrative Generation");
};

export const generateAutoPlayerAction = async (historyText: string, gameState: any, config?: SimulationConfig): Promise<string> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let instructions = PLAYER_SYSTEM_INSTRUCTION;
    
    if (config) {
        instructions += `\n\nSIMULATION PARAMETERS:
- Perspective: ${config.perspective}
- Role/Mode: ${config.mode}
- Theme/Cluster: ${config.cluster}
- Entry Point: ${config.starting_point}
- Intensity: ${config.intensity}
- Visual Motif: ${config.visual_motif || "Default specific to Cluster"}`;
        
        if (config.mode === 'Villain' && config.victim_count) {
             instructions += `\n- Victim Count: ${config.victim_count}`;
        }

instructions += `\n\nCRITICAL INSTRUCTION:
If asked about Visual Motif, describe: "${config.visual_motif || "A terrifying, cinematic scene matching the active cluster"}".
If the simulation is already in progress, act according to the assigned Role (${config.mode}).`;
    }

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `CURRENT NARRATIVE:\n${historyText}\n\nCURRENT STATE:\n${JSON.stringify(gameState)}`,
        config: {
        systemInstruction: instructions,
        temperature: 1.0, 
        }
    });
    return response.text?.trim() || "I hesitate, unsure what to do.";
  }, "Auto-Player Action");
};

export const generateSimulationAnalysis = async (gameLog: string): Promise<string> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `GAMEPLAY LOG:\n${gameLog}`,
        config: {
        systemInstruction: ANALYST_SYSTEM_INSTRUCTION
        }
    });
    return response.text || "Analysis incomplete.";
  }, "Simulation Analysis");
};

export interface ImageGenerationOptions {
  activeCluster?: string;
  styleOverride?: string;
  aspectRatio?: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
}

export const generateHorrorImage = async (
  prompt: string, 
  options: ImageGenerationOptions = {}
): Promise<string | null> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Determine style based on Active Cluster
    let aestheticStyle = "Dark atmospheric horror art, highly detailed, cinematic lighting, 8k resolution.";
    const cluster = options.activeCluster || "";

    if (cluster.includes("System") || prompt.includes("System")) {
        aestheticStyle = "Datamoshing aesthetic, compression artifacts, glitch art, high contrast cyan and black, industrial noise texture, CRT distortion.";
    } else if (cluster.includes("Flesh") || prompt.includes("Flesh")) {
        aestheticStyle = "New French Extremity style, visceral body horror, medical lighting, wet organic textures, dark crimson palette, Francis Bacon style.";
    } else if (cluster.includes("Blasphemy") || prompt.includes("Blasphemy")) {
        aestheticStyle = "Cinema of Transgression style, grainy 16mm film texture, punk zine aesthetic, high contrast black and white photocopy style, gritty, occult symbols.";
    } else if (cluster.includes("Survival") || prompt.includes("Survival")) {
        aestheticStyle = "The Void aesthetic, vast empty landscapes, liminal space, whiteout fog, minimalist horror, cold blue and grey palette.";
    } else if (cluster.includes("Haunting") || prompt.includes("Haunting")) {
        aestheticStyle = "Gothic horror aesthetic, spectral lighting, dust particles, decaying victorian textures, eerie shadows, sepia undertones.";
    } else if (cluster.includes("Self") || prompt.includes("Self")) {
        aestheticStyle = "Surrealist horror, hall of mirrors, shattered glass, impossible geometry, psychological distortion, dream logic.";
    } else if (cluster.includes("Desire") || prompt.includes("Desire")) {
        aestheticStyle = "Dark Romanticism aesthetic, lush red velvet textures, soft focus, chiaroscuro lighting, decadent decay, ominous beauty.";
    }

    const effectiveStyle = options.styleOverride || aestheticStyle;
    const aspectRatio = options.aspectRatio || "1:1";

    const styledPrompt = `${effectiveStyle} Context: ${prompt}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: styledPrompt }]
      },
      config: {
        imageConfig: {
            aspectRatio: aspectRatio
        }
      }
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          return `data:${mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  }, "Image Generation");
};
