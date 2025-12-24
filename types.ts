

// Types for the Nightmare Machine simulation engine

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
}

export interface VillainState {
  name: string; 
  archetype: string; 
  threat_scale: number; 
  primary_goal: string;
  current_tactic: string; 
}

export interface HiddenAgenda {
  goal: string;
  constraint: string;
  progress_level: number;
}

export type SocialManeuver = 
  | 'CONFESS' | 'DEFLECT' | 'INTIMIDATE' | 'PLACATE' | 'OBSERVE' 
  | 'ATTACK' | 'GASLIGHT' | 'BEG' | 'BARGAIN' | 'ENLIGHTEN' 
  | 'DEBASE' | 'TRANSFIX';

export interface DialogueEntry {
  speaker: string; 
  text: string;
  sentiment: string;
  turn: number;
  timestamp: number;
}

export interface DialogueMemory {
  short_term_buffer: DialogueEntry[]; 
  long_term_summary: string; 
}

export interface VoiceSignature {
  rhythm: 'Staccato' | 'Lyrical' | 'Breathless' | 'Monotone' | 'Erratic';
  syntax_complexity: 'Simple' | 'Academic' | 'Broken' | 'Flowery';
  catchphrases: string[];
  ticks: string[]; 
  cultural_markers: string[]; 
}

export interface DialogueState {
  voice_profile: {
    tone: string;
    vocabulary: string[];
    quirks: string[];
    forbidden_topics: string[];
  };
  voice_signature?: VoiceSignature; 
  memory: DialogueMemory;
  last_social_maneuver: SocialManeuver | null;
  current_social_intent: SocialManeuver; 
  mood_state: string;
  conversation_history: DialogueEntry[];
}

export interface KnowledgeNode {
  topic: string;
  details: string;
  is_secret: boolean;
}

export interface NpcTraits {
  [key: string]: any;
}

export interface PsychologicalProfile {
  archetype: string;
  core_trauma: string;
  breaking_point_trigger: string;
  shadow_self: string; 
  moral_compass: 'Altruistic' | 'Utilitarian' | 'Self-Preserving' | 'Nihilistic';
}

export interface ClusterResonance {
  primary_cluster: string; 
  secondary_cluster: string; 
  resonance_score: number; 
}

export interface NpcState {
  name: string;
  archetype: string; 
  background_origin: string;
  origin?: {
    region: string;
    ethnicity: string;
    native_language: string;
  };
  resonance_signature?: ClusterResonance;
  hidden_agenda: HiddenAgenda;
  psychology: {
    stress_level: number;
    current_thought: string;
    dominant_instinct: string;
    resilience_level?: string;
    emotional_state?: string;
    sanity_percentage?: number;
    profile?: PsychologicalProfile;
  };
  dialogue_state: DialogueState;
  active_injuries: { location: string; type: string; description: string; }[];
  fracture_state: number;
  consciousness: string;
  personality?: {
    dominant_trait: string;
    fatal_flaw: string;
    coping_mechanism: string;
    moral_alignment: string;
  };
  physical?: {
    height: string;
    build: string;
    distinguishing_feature: string;
    clothing_style: string;
  };
  relationship_state?: {
    trust: number;
    fear: number;
    secretKnowledge: boolean;
  };
  knowledge_state?: KnowledgeNode[];
  meta?: {
    intensity_level: string;
  };
  fracture_vectors?: {
    fear: number;
    isolation: number;
    guilt: number;
    paranoia: number;
  };
  disassociation_index?: number;
  secondary_goal?: string;
  relationships_to_other_npcs?: Record<string, string>;
  memory_stream?: any[];
  current_intent?: { goal: string; target: string; urgency: number };
  physical_state?: string;
  willpower?: number;
  devotion?: number;
  resources_held?: string[];
  trust_level?: number;
  agency_level?: string;
  narrative_role?: string;
  pain_level?: number;
  shock_level?: number;
  mobility_score?: number;
  manipulation_score?: number;
  perception_score?: number;
  current_state?: string;
}

export interface RoomExit {
  direction: string;
  target_node_id: string | null; 
}

export interface RoomNode {
  id: string;
  name: string;
  archetype: string;
  description_cache: string;
  exits: RoomExit[];
  hazards: string[];
  items: string[];
}

export interface LocationState {
  current_room_id: string;
  room_map: Record<string, RoomNode>;
  fidelity_status: 'Coherent' | 'Fraying' | 'Corrupted' | 'Dissolving';
  spatial_logic: string; 
  current_state: number;
  weather_state: string;
  time_of_day: string;
  architectural_notes: string[];
}

export interface GameState {
  meta: {
    turn: number;
    perspective: string;
    mode: 'Survivor' | 'Villain' | 'Pending';
    intensity_level: string;
    active_cluster: string;
  };
  villain_state: VillainState;
  npc_states: NpcState[];
  location_state: LocationState;
  narrative: {
    visual_motif: string;
    illustration_request: string | null;
  };
  co_author_state?: any; 
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