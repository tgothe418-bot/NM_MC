
import { z } from 'zod';

// ============ Enums & Literals ============

export const SocialManeuverSchema = z.enum([
  'CONFESS', 'DEFLECT', 'INTIMIDATE', 'PLACATE', 'OBSERVE',
  'ATTACK', 'GASLIGHT', 'BEG', 'BARGAIN', 'ENLIGHTEN',
  'DEBASE', 'TRANSFIX'
]);

export const RhythmSchema = z.enum([
  'Staccato', 'Lyrical', 'Breathless', 'Monotone', 'Erratic',
  'Measured', 'Rapid', 'Whispering', 'Halting', 'Booming'
]);

export const SyntaxComplexitySchema = z.enum([
  'Simple', 'Academic', 'Broken', 'Flowery', 'Technical',
  'Vague', 'Precise', 'Street', 'Formal'
]);

export const MoralCompassSchema = z.enum([
  'Altruistic', 'Utilitarian', 'Self-Preserving', 'Nihilistic', 'Loyalist'
]);

export const FidelityStatusSchema = z.enum([
  'Coherent', 'Fraying', 'Corrupted', 'Dissolving', 'Degrading'
]);

export const ModeSchema = z.enum(['Survivor', 'Villain', 'Pending']);

// ============ Building Blocks ============

export const VoiceSignatureSchema = z.object({
  rhythm: RhythmSchema,
  syntax_complexity: SyntaxComplexitySchema,
  catchphrases: z.array(z.string()),
  ticks: z.array(z.string()),
  cultural_markers: z.array(z.string())
});

export const DialogueEntrySchema = z.object({
  speaker: z.string(),
  text: z.string(),
  sentiment: z.string(),
  turn: z.number(),
  timestamp: z.number(),
  type: z.enum(['dialogue', 'action', 'observation', 'internal']).optional(),
  importance: z.number().min(0).max(100).optional(),
  tags: z.array(z.string()).optional()
});

export const MemoryEpisodeSchema = z.object({
  id: z.string(),
  turn: z.number(),
  description: z.string(),
  emotional_impact: z.number().min(-10).max(10),
  involved_actors: z.array(z.string())
});

export const DialogueMemorySchema = z.object({
  short_term_buffer: z.array(DialogueEntrySchema),
  long_term_summary: z.string(),
  episodic_logs: z.array(MemoryEpisodeSchema),
  known_facts: z.array(z.string())
});

export const DialogueStateSchema = z.object({
  voice_profile: z.object({
    tone: z.string(),
    vocabulary: z.array(z.string()),
    quirks: z.array(z.string()),
    forbidden_topics: z.array(z.string())
  }),
  voice_signature: VoiceSignatureSchema.optional(),
  memory: DialogueMemorySchema,
  last_social_maneuver: SocialManeuverSchema.nullable(),
  current_social_intent: SocialManeuverSchema,
  mood_state: z.string(),
  conversation_history: z.array(DialogueEntrySchema)
});

export const HiddenAgendaSchema = z.object({
  goal: z.string(),
  constraint: z.string(),
  progress_level: z.number()
});

export const PsychologicalProfileSchema = z.object({
  archetype: z.string(),
  core_trauma: z.string(),
  breaking_point_trigger: z.string(),
  shadow_self: z.string(),
  moral_compass: MoralCompassSchema
});

export const InjurySchema = z.object({
  location: z.string(),
  type: z.string(),
  description: z.string()
});

export const FractureVectorsSchema = z.object({
  fear: z.number(),
  isolation: z.number(),
  guilt: z.number(),
  paranoia: z.number()
});

export const ClusterResonanceSchema = z.object({
  primary_cluster: z.string(),
  secondary_cluster: z.string(),
  resonance_score: z.number()
});

// ============ Core State Objects ============

export const NpcStateSchema = z.object({
  name: z.string(),
  archetype: z.string(),
  background_origin: z.string(),
  portrait_url: z.string().optional(),
  origin: z.object({
    region: z.string(),
    ethnicity: z.string(),
    native_language: z.string()
  }).optional(),
  resonance_signature: ClusterResonanceSchema.optional(),
  hidden_agenda: HiddenAgendaSchema,
  psychology: z.object({
    stress_level: z.number(),
    current_thought: z.string(),
    dominant_instinct: z.string(),
    resilience_level: z.string().optional(),
    emotional_state: z.string().optional(),
    sanity_percentage: z.number().optional(),
    profile: PsychologicalProfileSchema.optional()
  }),
  dialogue_state: DialogueStateSchema,
  active_injuries: z.array(InjurySchema),
  fracture_state: z.number(),
  consciousness: z.string(),
  personality: z.object({
    dominant_trait: z.string(),
    fatal_flaw: z.string(),
    coping_mechanism: z.string(),
    moral_alignment: z.string()
  }).optional(),
  physical: z.object({
    height: z.string(),
    build: z.string(),
    distinguishing_feature: z.string(),
    clothing_style: z.string(),
    hair_style: z.string().optional(),
    eye_color: z.string().optional(),
    skin_tone: z.string().optional()
  }).optional(),
  relationship_state: z.object({
    trust: z.number(),
    fear: z.number(),
    secretKnowledge: z.boolean()
  }).optional(),
  knowledge_state: z.array(z.object({
    topic: z.string(),
    details: z.string(),
    is_secret: z.boolean()
  })).optional(),
  meta: z.object({
    intensity_level: z.string()
  }).optional(),
  fracture_vectors: FractureVectorsSchema.optional(),
  disassociation_index: z.number().optional(),
  secondary_goal: z.string().optional(),
  relationships_to_other_npcs: z.record(z.string(), z.string()).optional(),
  memory_stream: z.array(z.any()).optional(),
  current_intent: z.object({
    goal: z.string(),
    target: z.string(),
    urgency: z.number()
  }).optional(),
  physical_state: z.string().optional(),
  willpower: z.number().optional(),
  devotion: z.number().optional(),
  resources_held: z.array(z.string()).optional(),
  trust_level: z.number().optional(),
  agency_level: z.string().optional(),
  narrative_role: z.string().optional(),
  pain_level: z.number().optional(),
  shock_level: z.number().optional(),
  mobility_score: z.number().optional(),
  manipulation_score: z.number().optional(),
  perception_score: z.number().optional(),
  current_state: z.string().optional()
});

export const VillainStateSchema = z.object({
  name: z.string(),
  archetype: z.string(),
  threat_scale: z.number(),
  primary_goal: z.string(),
  current_tactic: z.string(),
  victim_profile: z.string().optional()
});

export const RoomExitSchema = z.object({
  direction: z.string(),
  target_node_id: z.string().nullable()
});

export const RoomNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  archetype: z.string(),
  description_cache: z.string(),
  exits: z.array(RoomExitSchema),
  hazards: z.array(z.string()),
  items: z.array(z.string())
});

export const LocationStateSchema = z.object({
  current_room_id: z.string(),
  room_map: z.record(z.string(), RoomNodeSchema),
  fidelity_status: FidelityStatusSchema,
  spatial_logic: z.string(),
  current_state: z.number(),
  weather_state: z.string(),
  time_of_day: z.string(),
  architectural_notes: z.array(z.string())
});

// ============ Main GameState ============

export const GameStateSchema = z.object({
  meta: z.object({
    turn: z.number(),
    perspective: z.string(),
    mode: ModeSchema,
    intensity_level: z.string(),
    active_cluster: z.string(),
    player_profile: z.object({
      name: z.string(),
      background: z.string(),
      traits: z.union([z.string(), z.array(z.string())])
    }).optional()
  }),
  villain_state: VillainStateSchema,
  npc_states: z.array(NpcStateSchema),
  location_state: LocationStateSchema,
  narrative: z.object({
    visual_motif: z.string(),
    illustration_request: z.string().nullable()
  }),
  suggested_actions: z.array(z.string()).optional(),
  co_author_state: z.unknown().optional()
});

// ============ LLM Response Schemas ============

// SimulatorResponseSchema: 
// Relaxed to allow partial updates ("diffs") from the LLM without strict validation failures.
// Complex objects like npc_states, villain_state, and location_state are typed as `z.any()` 
// to defer merging logic to the application layer (geminiService.ts).
export const SimulatorResponseSchema = GameStateSchema.partial().extend({
  npc_states: z.array(z.any()).optional(),
  villain_state: z.record(z.string(), z.any()).optional(),
  location_state: z.record(z.string(), z.any()).optional(),
  meta: z.record(z.string(), z.any()).optional(),
  suggested_actions: z.array(z.string()).optional(),
});

// What the NARRATOR returns
// Uses preprocess to map snake_case (prompted) to camelCase (app logic)
export const NarratorResponseSchema = z.preprocess(
  (val: any) => {
    if (typeof val === 'object' && val !== null) {
      return {
        gameState: val.gameState || val.game_state,
        storyText: val.storyText || val.story_text || "",
      };
    }
    return val;
  },
  z.object({
    // Relaxed GameState for Narrator response to support partial updates
    gameState: GameStateSchema.partial().extend({
      npc_states: z.array(z.any()).optional(),
      villain_state: z.record(z.string(), z.any()).optional(),
      location_state: z.record(z.string(), z.any()).optional(),
      meta: z.record(z.string(), z.any()).optional(),
    }).optional(),
    storyText: z.string().default(""), 
  })
);

// generateScenarioConcepts response
export const ScenarioConceptsSchema = z.object({
  villain_name: z.string(),
  villain_appearance: z.string(),
  villain_methods: z.string(),
  primary_goal: z.string(),
  victim_description: z.string(),
  survivor_name: z.string(),
  survivor_background: z.string(),
  survivor_traits: z.string(),
  location_description: z.string(),
  visual_motif: z.string(),
});

// generateCharacterProfile response
export const CharacterProfileSchema = z.object({
  name: z.string().default("Unknown"),
  background: z.string().default("No history available."),
  traits: z.string().default("Survival Instinct"),
});

// analyzeSourceMaterial response
export const ParsedCharacterSchema = z.object({
  name: z.string(),
  role: z.string(),
  description: z.string(),
  traits: z.string(),
});

export const SourceAnalysisResultSchema = z.object({
  characters: z.array(ParsedCharacterSchema).default([]),
  location: z.string().default(""),
  visual_motif: z.string().default(""),
  theme_cluster: z.string().default(""),
});

// hydrateUserCharacter response (partial NpcState)
export const HydratedCharacterSchema = NpcStateSchema.partial();
