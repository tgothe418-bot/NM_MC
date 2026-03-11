
import { 
  GameStateSchema, 
  SourceAnalysisResultSchema,
  ScenarioConceptsSchema,
  CharacterProfileSchema,
  NpcStateSchema,
  GameTurnOutputSchema
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
        
        // 3. Remove trailing commas (common LLM mistake)
        cleanText = cleanText.replace(/,\s*([}\]])/g, '$1');
        
        const json = JSON.parse(cleanText);
        const result = schema.safeParse(json);

        if (result.success) {
            return result.data;
        } else {
            console.warn("Schema Validation Failed:", result.error);
            
            // Attempt to "heal" the object by merging with fallback and re-validating
            // This allows partial success if the LLM returned mostly correct data
            const merged = { ...fallback, ...json };
            const secondAttempt = schema.safeParse(merged);
            
            if (secondAttempt.success) {
                return secondAttempt.data;
            }

            // If healing fails, strictly return the fallback to prevent downstream crashes
            return fallback;
        }
    } catch (e) {
        console.error("JSON Parse Error:", e);
        return fallback;
    }
};

// --- EXPORTED PARSERS ---

export const parseGameTurnOutput = (text: string) => {
    const fallback = {
        state_mutations: {},
        narrative_render: {
            story_text: "The machine churns, but produces only silence. (Parse Error)",
            illustration_request: null
        }
    };
    return cleanAndParse(text, GameTurnOutputSchema, fallback);
};

export const parseSourceAnalysis = (text: string): SourceAnalysisResult => {
    const fallback: SourceAnalysisResult = {
        characters: [],
        location: "", // Changed from "Unknown" to prevent UI pollution
        visual_motif: "",
        theme_cluster: "",
        intensity: "",
        plot_hook: ""
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
