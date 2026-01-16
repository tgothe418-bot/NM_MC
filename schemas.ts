
import { z } from 'zod';

// Basic Types
export const RoomExitSchema = z.object({
  direction: z.string(),
  target_node_id: z.string().nullable(),
});

// Spatial / Grid Schemas
export const TileTypeSchema = z.enum(['Floor', 'Wall', 'Void', 'Hazard', 'Cover']);

export const GridCellSchema = z.object({
  x: z.number(),
  y: z.number(),
  type: TileTypeSchema,
  description: z.string().optional(),
  occupant_id: z.string().optional(),
});

export const GridLayoutSchema = z.object({
  width: z.number(),
  height: z.number(),
  cells: z.array(z.array(GridCellSchema)),
});

export const RoomNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  archetype: z.string(),
  description_cache: z.string(),
  exits: z.array(RoomExitSchema),
  hazards: z.array(z.string()),
  items: z.array(z.string()),
  grid_layout: GridLayoutSchema.optional(),
});

export const LocationStateSchema = z.object({
  current_room_id: z.string(),
  room_map: z.record(z.string(), RoomNodeSchema),
  fidelity_status: z.string(),
  spatial_logic: z.string(),
  current_state: z.number(),
  weather_state: z.string(),
  time_of_day: z.string(),
  architectural_notes: z.array(z.string()),
});

export const HiddenAgendaSchema = z.object({
  goal: z.string(),
  constraint: z.string(),
  progress_level: z.number(),
});

export const DialogueEntrySchema = z.object({
  speaker: z.string(),
  text: z.string(),
  sentiment: z.string(),
  turn: z.number(),
  timestamp: z.number(),
});

export const MemoryEpisodeSchema = z.object({
  id: z.string(),
  turn: z.number(),
  description: z.string(),
  emotional_impact: z.number(),
  involved_actors: z.array(z.string()),
});

export const DialogueMemorySchema = z.object({
  short_term_buffer: z.array(DialogueEntrySchema),
  long_term_summary: z.string(),
  episodic_logs: z.array(MemoryEpisodeSchema),
  known_facts: z.array(z.string()),
});

export const VoiceSignatureSchema = z.object({
  rhythm: z.enum(['Measured', 'Staccato', 'Monotone', 'Lyrical', 'Breathless', 'Erratic', 'Rapid', 'Whispering', 'Booming', 'Halting']),
  syntax_complexity: z.enum(['Simple', 'Precise', 'Vague', 'Academic', 'Broken', 'Flowery', 'Street', 'Technical', 'Formal']),
  catchphrases: z.array(z.string()),
  ticks: z.array(z.string()),
  cultural_markers: z.array(z.string()),
});

export const SocialManeuverSchema = z.enum([
  'OBSERVE', 'GASLIGHT', 'ATTACK', 'DEFLECT', 'PLACATE', 'BEG', 'CONFESS', 'BARGAIN', 'INTIMIDATE', 'SEDUCE', 'IGNORE'
]);

export const DialogueStateSchema = z.object({
  voice_profile: z.object({
    tone: z.string(),
    vocabulary: z.array(z.string()),
    quirks: z.array(z.string()),
    forbidden_topics: z.array(z.string()),
  }),
  memory: DialogueMemorySchema,
  last_social_maneuver: SocialManeuverSchema,
  mood_state: z.string(),
  current_social_intent: SocialManeuverSchema,
  conversation_history: z.array(DialogueEntrySchema),
  voice_signature: VoiceSignatureSchema.optional(),
});

export const PsychologicalProfileSchema = z.object({
  archetype: z.string(),
  core_trauma: z.string(),
  breaking_point_trigger: z.string(),
  shadow_self: z.string(),
  moral_compass: z.string(),
});

export const NpcStateSchema = z.object({
  name: z.string(),
  archetype: z.string(),
  origin: z.object({
    region: z.string(),
    ethnicity: z.string(),
    native_language: z.string(),
  }),
  background_origin: z.string(),
  hidden_agenda: HiddenAgendaSchema,
  psychology: z.object({
    stress_level: z.number(),
    current_thought: z.string(),
    dominant_instinct: z.string(),
    sanity_percentage: z.number(),
    resilience_level: z.string(),
    emotional_state: z.string(),
    profile: PsychologicalProfileSchema,
  }),
  dialogue_state: DialogueStateSchema,
  active_injuries: z.array(z.object({
    location: z.string(),
    type: z.string(),
    description: z.string(),
  })),
  fracture_state: z.number(),
  consciousness: z.string(),
  personality: z.object({
    dominant_trait: z.string(),
    fatal_flaw: z.string(),
    coping_mechanism: z.string(),
    moral_alignment: z.string(),
  }),
  physical: z.object({
    height: z.string(),
    build: z.string(),
    distinguishing_feature: z.string(),
    clothing_style: z.string(),
    hair_style: z.string(),
    eye_color: z.string(),
  }),
  relationship_state: z.object({
    trust: z.number(),
    fear: z.number(),
    secretKnowledge: z.boolean(),
  }),
  current_intent: z.object({
    goal: z.string(),
    target: z.string(),
    urgency: z.number(),
  }),
  knowledge_state: z.array(z.object({
    topic: z.string(),
    details: z.string(),
    is_secret: z.boolean(),
  })),
  fracture_vectors: z.object({
    fear: z.number(),
    isolation: z.number(),
    guilt: z.number(),
    paranoia: z.number(),
  }),
  resources_held: z.array(z.string()),
  portrait_url: z.string().optional(),
});

export const VillainStateSchema = z.object({
  name: z.string(),
  archetype: z.string(),
  threat_scale: z.number(),
  primary_goal: z.string(),
  current_tactic: z.string(),
  victim_profile: z.string().optional(),
});

export const GameStateSchema = z.object({
  meta: z.object({
    turn: z.number(),
    perspective: z.string(),
    mode: z.enum(['Survivor', 'Villain']),
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
    illustration_request: z.string().nullable(),
  }),
  suggested_actions: z.array(z.string()),
});

export const SimulatorResponseSchema = z.any();

export const NarratorResponseSchema = z.object({
  story_text: z.string(),
  // Relaxed to z.any() to allow partial updates from LLM without strict validation failure
  game_state: z.any().optional(),
});

export const ClusterResonanceSchema = z.object({
    cluster: z.string(),
    score: z.number()
});

export const ParsedCharacterSchema = z.object({
  name: z.string(),
  role: z.string(),
  description: z.string(),
  traits: z.string(),
  goal: z.string().optional(),
  methodology: z.string().optional(),
});

export const SourceAnalysisResultSchema = z.object({
  characters: z.array(ParsedCharacterSchema).default([]),
  location: z.string().default(""),
  visual_motif: z.string().default(""),
  theme_cluster: z.string().default(""),
  intensity: z.string().default(""),
  plot_hook: z.string().default(""),
});

export const ScenarioConceptsSchema = z.object({
  villain_name: z.string().nullable().optional(),
  villain_appearance: z.string().nullable().optional(),
  villain_methods: z.string().nullable().optional(),
  primary_goal: z.string().nullable().optional(),
  victim_description: z.string().nullable().optional(),
  survivor_name: z.string().nullable().optional(),
  survivor_background: z.string().nullable().optional(),
  survivor_traits: z.string().nullable().optional(),
  location_description: z.string().nullable().optional(),
  visual_motif: z.string().nullable().optional(),
});

export const CharacterProfileSchema = z.object({
  name: z.string(),
  background: z.string(),
  traits: z.string(),
});

export const HydratedCharacterSchema = z.any();
