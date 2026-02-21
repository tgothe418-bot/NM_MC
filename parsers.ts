
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

// ... (keep helper functions extractJson and cleanAndParse) ...

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
