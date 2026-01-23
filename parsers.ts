
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
    // Find the first possible JSON start
    const firstBrace = str.indexOf('{');
    const firstBracket = str.indexOf('[');
    
    if (firstBrace === -1 && firstBracket === -1) return null;

    let start = -1;
    let isObject = false;

    // Determine type based on which appears first
    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
        start = firstBrace;
        isObject = true;
    } else {
        start = firstBracket;
        isObject = false;
    }

    const open = isObject ? '{' : '[';
    const close = isObject ? '}' : ']';
    
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
                    // Found the matching closing brace
                    return str.substring(start, i + 1);
                }
            }
        }
    }
    
    // If we get here, brackets were unbalanced or EOF reached without closure.
    // Return null to allow fallback strategies or return what we have? 
    // Returning null allows the caller to try a simpler slice if strict balancing fails.
    return null;
};

// --- HELPER: CLEAN & PARSE ---
const cleanAndParse = <T>(text: string, schema: z.ZodSchema<T>, fallback: T): T => {
    try {
        let cleanText = text.trim();
        
        // 1. Remove markdown code blocks if present
        if (cleanText.includes('```')) {
            cleanText = cleanText.replace(/```(?:json)?/g, '').replace(/```/g, '');
        }

        // 2. Attempt robust extraction
        const extracted = extractJson(cleanText);
        if (extracted) {
            cleanText = extracted;
        } else {
            // Fallback: Crude extraction if the robust one failed (e.g. malformed)
            // This catches cases where balancing might fail due to weird escaping but simple slice might work
            const firstBrace = cleanText.indexOf('{');
            const firstBracket = cleanText.indexOf('[');
            let start = -1;
            let end = -1;

            if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
                start = firstBrace;
                end = cleanText.lastIndexOf('}');
            } else if (firstBracket !== -1) {
                start = firstBracket;
                end = cleanText.lastIndexOf(']');
            }

            if (start !== -1 && end !== -1) {
                cleanText = cleanText.substring(start, end + 1);
            }
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
        GameStateSchema.deepPartial(), 
        {}
    );
};

export const parseNarratorResponse = (text: string): { story_text: string, game_state?: Partial<GameState> } => {
    const Schema = z.object({
        story_text: z.string(),
        game_state: GameStateSchema.deepPartial().optional()
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
