import { 
  GameStateSchema, 
  SourceAnalysisResultSchema,
  ScenarioConceptsSchema,
  CharacterProfileSchema,
  NpcStateSchema,
} from './schemas';
import { GameState } from './types';
import { z } from 'zod';

// --- HELPER: CLEAN & PARSE ---
const cleanAndParse = <T>(text: string, schema: z.ZodSchema<T>, fallback: T): T => {
    try {
        let cleanText = text.trim();
        
        // 1. Remove markdown code blocks if present
        if (cleanText.includes('```')) {
            cleanText = cleanText.replace(/```(?:json)?/g, '').replace(/```/g, '');
        }

        // 2. Scan for JSON bounds (Object OR Array)
        const firstBrace = cleanText.indexOf('{');
        const firstBracket = cleanText.indexOf('[');
        
        let start = -1;
        let end = -1;

        // Determine which opens first: { or [
        if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
            // It's an Object
            start = firstBrace;
            end = cleanText.lastIndexOf('}');
        } else if (firstBracket !== -1) {
            // It's an Array
            start = firstBracket;
            end = cleanText.lastIndexOf(']');
        }

        // Only slice if we found valid bounds
        if (start !== -1 && end !== -1) {
            cleanText = cleanText.substring(start, end + 1);
        }

        const json = JSON.parse(cleanText);
        const result = schema.safeParse(json);

        if (result.success) {
            return result.data;
        } else {
            console.warn("Schema Validation Failed (using partial/fallback):", result.error);
            // Handle Array vs Object fallback merging
            if (Array.isArray(fallback)) {
                return Array.isArray(json) ? [...fallback, ...json] as unknown as T : fallback;
            }
            return { ...fallback, ...json }; 
        }
    } catch (e) {
        console.error("JSON Parse Error:", e, text);
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

export const parseSourceAnalysis = (text: string) => {
    const fallback = {
        characters: [],
        location: "Unknown",
        visual_motif: "Dark",
        theme_cluster: "Survival",
        intensity: "Level 1",
        plot_hook: "Unknown"
    };
    return cleanAndParse(text, SourceAnalysisResultSchema, fallback);
};

export const parseScenarioConcepts = (text: string) => {
    return cleanAndParse(text, ScenarioConceptsSchema, {});
};

export const parseCharacterProfile = (text: string) => {
    return cleanAndParse(text, CharacterProfileSchema, { 
        name: "Unknown", 
        background: "N/A", 
        traits: "N/A" 
    });
};

export const parseHydratedCharacter = (text: string) => {
    return cleanAndParse(text, NpcStateSchema.partial(), {});
};