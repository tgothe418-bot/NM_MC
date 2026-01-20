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
// Strips Markdown code blocks (```json ... ```) which Gemini often includes
const cleanAndParse = <T>(text: string, schema: z.ZodSchema<T>, fallback: T): T => {
    try {
        let cleanText = text.trim();
        // Remove markdown code blocks if present
        if (cleanText.startsWith('```')) {
            cleanText = cleanText.replace(/^```(json)?/, '').replace(/```$/, '');
        }
        
        // Remove any leading/trailing non-JSON text if necessary (basic heuristic)
        const firstBrace = cleanText.indexOf('{');
        const lastBrace = cleanText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            cleanText = cleanText.substring(firstBrace, lastBrace + 1);
        }

        const json = JSON.parse(cleanText);
        const result = schema.safeParse(json);

        if (result.success) {
            return result.data;
        } else {
            console.warn("Schema Validation Failed (using partial/fallback):", result.error);
            // Attempt to merge fallback with partial data if possible
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