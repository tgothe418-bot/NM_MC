
import { z } from 'zod';
import { 
  GameStateSchema, 
  NpcStateSchema,
  VillainStateSchema,
  LocationStateSchema,
  HiddenAgendaSchema,
  DialogueEntrySchema,
  MemoryEpisodeSchema,
  DialogueMemorySchema,
  VoiceSignatureSchema,
  DialogueStateSchema,
  PsychologicalProfileSchema,
  ClusterResonanceSchema,
  RoomExitSchema,
  RoomNodeSchema,
  SocialManeuverSchema,
  ParsedCharacterSchema,
  SourceAnalysisResultSchema,
  ScenarioConceptsSchema,
  CharacterProfileSchema
} from './schemas';

// Re-export Schema-Derived Types
export type GameState = z.infer<typeof GameStateSchema>;
export type NpcState = z.infer<typeof NpcStateSchema>;
export type VillainState = z.infer<typeof VillainStateSchema>;
export type LocationState = z.infer<typeof LocationStateSchema>;
export type HiddenAgenda = z.infer<typeof HiddenAgendaSchema>;
export type DialogueEntry = z.infer<typeof DialogueEntrySchema>;
export type MemoryEpisode = z.infer<typeof MemoryEpisodeSchema>;
export type DialogueMemory = z.infer<typeof DialogueMemorySchema>;
export type VoiceSignature = z.infer<typeof VoiceSignatureSchema>;
export type DialogueState = z.infer<typeof DialogueStateSchema>;
export type PsychologicalProfile = z.infer<typeof PsychologicalProfileSchema>;
export type ClusterResonance = z.infer<typeof ClusterResonanceSchema>;
export type RoomExit = z.infer<typeof RoomExitSchema>;
export type RoomNode = z.infer<typeof RoomNodeSchema>;
export type SocialManeuver = z.infer<typeof SocialManeuverSchema>;
export type ParsedCharacter = z.infer<typeof ParsedCharacterSchema>;
export type SourceAnalysisResult = z.infer<typeof SourceAnalysisResultSchema>;
export type ScenarioConcepts = z.infer<typeof ScenarioConceptsSchema>;
export type CharacterProfile = z.infer<typeof CharacterProfileSchema>;

// Types NOT covered by Schema (Configuration, UI, etc.)

export interface ClusterWeights {
  [key: string]: string;
}

export interface SimulationConfig {
  perspective: string;
  mode: string;
  starting_point: string; 
  cluster: string;
  intensity: string;
  cycles: number;
  victim_count?: number; 
  visual_motif?: string; 
  location_description?: string; 
  villain_name?: string;
  villain_appearance?: string;
  villain_methods?: string;
  primary_goal?: string;
  victim_description?: string;
  // Survivor Fields
  survivor_name?: string;
  survivor_background?: string;
  survivor_traits?: string;
}

export interface KnowledgeNode {
  topic: string;
  details: string;
  is_secret: boolean;
}

export interface NpcTraits {
  [key: string]: any;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  gameState?: GameState;
  imageUrl?: string; 
  videoUrl?: string;
  timestamp: number;
}

export interface NarrativeEvent {
  name: string;
  description: string;
  effects: any[];
}

export interface ClusterLore {
  id: string;
  displayName: string;
  philosophy: string;
  coreAxiom: string;
  mood: string;
  villains: any[];
  environments: any[];
  sensoryInjectors: {
    smell: string[];
    sound: string[];
    touch: string[];
    taste: string[];
  };
  npcArchetypes: any[];
}

export interface ArchivedCharacter {
  character_id: string;
  name: string;
  origin_story: string;
  archetype: string;
  fracture_state: number;
  permanent_traits: string[];
  fracture_vectors: {
    fear: number;
    isolation: number;
    guilt: number;
    paranoia: number;
  };
  narrative_role: string;
  behavioral_loop: string;
  dialogue_sample: {
    greeting: string;
    warning: string;
    farewell: string;
  };
  resources_held: string[];
  special_conditions: {
    trigger: string;
    effect: string;
  };
}