
import { 
  GameStateSchema, 
  SourceAnalysisResultSchema,
  ScenarioConceptsSchema,
  CharacterProfileSchema,
  NpcStateSchema,
} from './schemas';
import { GameState, SourceAnalysisResult, ScenarioConcepts, CharacterProfile, NpcState } from './types';
import { z } from 'zod';

// --- HELPER: ROBUST JSON EXTRACTION ---
// Scans for the first valid JSON object or array by balancing braces/brackets.
// Ignores characters inside strings.
const extractJson = (str: string): string | null => {
    // 1. Collect all possible start indices
    const starts: { index: number, char: string }[] = [];
    for (let i = 0; i < str.length; i++) {
        if (str[i] === '{' || str[i] === '[') {
            starts.push({ index: i, char: str[i] });
        }
    }

    // 2. Iterate through potential starts
    for (const startObj of starts) {
        const { index: start, char: open } = startObj;
        const close = open === '{' ? '}' : ']';
        
        let balance = 0;
        let inString = false;
        let escaped = false;

        for (let i = start; i < str.length; i++) {
            const c = str[i];

            if (escaped) {
                escaped = false;
                continue;
            }

            if (c === '\\') {
                escaped = true;
                continue;
            }

            if (c === '"') {
                inString = !inString;
                continue;
            }

            if (!inString) {
                if (c === open) {
                    balance++;
                } else if (c === close) {
                    balance--;
                    if (balance === 0) {
                        // Found a matching closing brace.
                        // Attempt to parse this substring to verify validity.
                        const candidate = str.substring(start, i + 1);
                        try {
                            JSON.parse(candidate);
                            // If parse succeeds, we found our JSON.
                            return candidate;
                        } catch (e) {
                            // If parse fails (e.g. { key: "value" } garbage inside?), keep searching.
                            break; // Stop extending this candidate, try next start position.
                        }
                    }
                }
            }
        }
    }
    
    return null;
};

// --- HELPER: CLEAN & PARSE ---
const cleanAndParse = <T>(text: string, schema: z.ZodSchema<T>, fallback: T): T => {
    try {
        let cleanText = text.trim();
        
        // 1. Remove markdown code blocks if present
        const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
        const match = cleanText.match(codeBlockRegex);
        if (match) {
            cleanText = match[1];
        }

        // 2. Attempt robust extraction
        const extracted = extractJson(cleanText);
        if (extracted) {
            cleanText = extracted;
        } 
        
        const json = JSON.parse(cleanText);
        const result = schema.safeParse(json);

        if (result.success) {
            return result.data;
        } else {
            console.warn("Schema Validation Failed:", result.error);
            // Handle Array vs Object fallback merging
            if (Array.isArray(fallback) && Array.isArray(json)) {
                return [...fallback, ...json] as unknown as T;
            }
            return { ...fallback, ...json }; 
        }
    } catch (e) {
        console.error("JSON Parse Error:", e);
        return fallback;
    }
};

// --- EXPORTED PARSERS ---

export const parseSimulatorResponse = (text: string): Partial<GameState> => {
    // We allow Partial GameState because the Simulator might only return updates
    return cleanAndParse(
        text, 
        GameStateSchema.partial(), 
        {}
    );
};

export const parseNarratorResponse = (text: string): { story_text: string, game_state?: Partial<GameState> } => {
    const Schema = z.object({
        story_text: z.string(),
        game_state: GameStateSchema.partial().optional()
    });

    return cleanAndParse(text, Schema, { 
        story_text: "The transmission is garbled. (Data corruption detected)." 
    });
};

export const parseSourceAnalysis = (text: string): SourceAnalysisResult => {
    const fallback: SourceAnalysisResult = {
        characters: [],
        location: "Unknown",
        visual_motif: "Dark",
        theme_cluster: "Survival",
        intensity: "Level 1",
        plot_hook: "Unknown"
    };
    return cleanAndParse(text, SourceAnalysisResultSchema, fallback);
};

export const parseScenarioConcepts = (text: string): ScenarioConcepts => {
    return cleanAndParse(text, ScenarioConceptsSchema, {});
};

export const parseCharacterProfile = (text: string): CharacterProfile => {
    return cleanAndParse(text, CharacterProfileSchema, { 
        name: "Unknown", 
        background: "N/A", 
        traits: "N/A" 
    });
};

export const parseHydratedCharacter = (text: string): Partial<NpcState> => {
    return cleanAndParse(text, NpcStateSchema.partial(), {});
};
