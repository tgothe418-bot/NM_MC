
export interface ClusterWeights {
  [key: string]: string; // e.g., "Cluster 1 (Flesh)": "40%"
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
  co_author_mode?: 'Manual' | 'Auto';
  co_author_archetype?: string;
  co_author_dominance?: number;
  villain_name?: string;
  villain_appearance?: string;
  villain_methods?: string;
  victim_description?: string;
  primary_goal?: string;
}

export interface VillainState {
  name: string; 
  archetype: string; 
  goetic_rank?: string; 
  sigil_form?: string; 
  cluster_alignment: string; 
  intensity_level: string; 
  species_nature: string;
  primary_goal: string;
  secondary_goal: string;
  obsession_flaw: string; 
  vulnerability_key: string;
  threat_scale: number; 
  hunt_pattern: string; 
  current_tactic: string; 
  territory: string;
  manifestation_style: string;
  hierarchy_mode?: 'Sole Apex' | 'Rivals' | 'Hive'; 
  rival_count?: number;
  minion_type?: string;
}

export interface FractureVectors {
  fear: number;
  isolation: number;
  guilt: number;
  paranoia: number;
  faith?: number;      
  exhaustion?: number; 
}

export type FractureVectorType = 'Trauma' | 'Paranoia' | 'Corruption' | 'Faith' | 'Exhaustion';

export interface HiddenHistory {
  description: string; 
  secondaryGoal: string; 
}

export interface TriggerObject {
  name: string;
  description: string;
  fractureImpact: number;
}

export interface RelationshipState {
  trust: number; 
  fear: number; 
  secretKnowledge: boolean; 
}

export interface NpcRelation {
  trust: number; 
  fear: number; 
  descriptor: string; 
}

export interface MemoryEvent {
  trigger: string; 
  impact: 'Trauma' | 'Bond' | 'Betrayal';
  turnCount: number; 
}

export interface Volition {
  goal: 'Survive' | 'Protect' | 'Sabotage' | 'Hide' | 'Haunt' | 'Warn';
  target: string; 
  urgency: number; 
}

export type SocialManeuver = 
  | 'CONFESS' 
  | 'DEFLECT' 
  | 'INTIMIDATE' 
  | 'PLACATE' 
  | 'OBSERVE' 
  | 'ATTACK' 
  | 'GASLIGHT' 
  | 'BEG'
  | 'BARGAIN'
  | 'ENLIGHTEN' 
  | 'DEBASE' 
  | 'TRANSFIX';

export interface DialogueEntry {
  speaker: string; 
  text: string;
  sentiment: 'Hostile' | 'Neutral' | 'Friendly' | 'Fearful';
  turn: number;
  timestamp: number;
}

export interface DialogueMemory {
  short_term_buffer: DialogueEntry[]; 
  long_term_summary: string; 
}

export interface KnowledgeNode {
  id: string;
  topic: string; 
  details: string; 
  is_secret: boolean;
  revealed: boolean;
  source: string; 
}

export interface VoiceProfile {
  tone: string; 
  vocabulary: string[]; 
  quirks: string[]; 
  forbidden_topics: string[]; 
}

export interface DialogueState {
  voice_profile: VoiceProfile;
  memory: DialogueMemory;
  last_social_maneuver: SocialManeuver | null;
  mood_state: string; 
  current_social_intent: SocialManeuver; 
  conversation_history: DialogueEntry[]; 
}

export interface PersonalityProfile {
  dominant_trait: string; 
  fatal_flaw: string; 
  coping_mechanism: string; 
  moral_alignment: string; 
}

export interface PhysicalFeatures {
  height: string;
  build: string;
  distinguishing_feature: string; 
  clothing_style: string;
}

export type ResilienceLevel = 'Unbreakable' | 'High' | 'Moderate' | 'Fragile' | 'Shattered';
export type SurvivalInstinct = 'Fight' | 'Flight' | 'Freeze' | 'Fawn' | 'Submit' | 'Aggression';

export interface PsychologicalState {
  current_thought: string; 
  emotional_state: string; 
  sanity_percentage: number; 
  resilience_level: ResilienceLevel; 
  stress_level: number; 
  dominant_instinct: SurvivalInstinct;
}

export type InjuryDepth = 'SURFACE' | 'DEEP_TISSUE' | 'STRUCTURAL' | 'TRANSCENDENTAL';

export interface Injury {
  location: string;
  type: 'abrasion' | 'contusion' | 'laceration' | 'incision' | 'puncture' | 'fracture' | 'avulsion' | 'degloving' | 'burn' | 'psychological' | 'apotheosis';
  depth: InjuryDepth; 
  description: string; 
  functional_impact: string; 
}

export interface NpcDemographics {
  gender: string;
  age: string;
  appearance: string; 
  aesthetic: string; 
}

export interface NpcTraits {
  strengths: string[];
  weaknesses: string[]; 
  hopes: string[];
}

export interface NpcState {
  name: string;
  archetype: string; 
  personality?: PersonalityProfile;
  physical?: PhysicalFeatures;
  psychology?: PsychologicalState;
  background_origin?: string; 
  visual_anchor?: string; 
  current_state: string; 
  fracture_vectors: FractureVectors;
  fracture_state: number; 
  disassociation_index: number; 
  primary_goal?: string; 
  secondary_goal: string; 
  atavistic_drive?: string; 
  demographics?: NpcDemographics;
  generated_traits?: NpcTraits;
  relationship_state: RelationshipState; 
  relationships_to_other_npcs: Record<string, NpcRelation>; 
  memory_stream: MemoryEvent[]; 
  current_intent: Volition; 
  dialogue_state: DialogueState;
  skill?: string; 
  fatal_flaw?: string; 
  specific_fear?: string; 
  agendas?: string[]; 
  breaking_point?: string;
  breaking_point_result?: string;
  knowledge_state: KnowledgeNode[]; 
  physical_state: string; 
  resources_held: string[];
  trust_level: number; 
  agency_level: string; 
  narrative_role: string; 
  archive_id?: string;
  willpower: number; 
  devotion: number; 
  active_injuries: Injury[];
  pain_level: number; 
  shock_level: number; 
  consciousness: 'Alert' | 'Dazed' | 'Fading' | 'Unconscious' | 'Apotheosis';
  mobility_score: number; 
  manipulation_score: number; 
  perception_score: number; 
  // Added meta property to fix dialogueEngine.ts error
  meta?: {
    intensity_level: string;
  };
}

export interface LocationState {
  name: string;
  archetype: string; 
  cluster_alignment: string;
  current_state: number; 
  dominant_sensory_palette: {
    primary_sense: string;
    secondary_sense: string;
    intensity: string;
  };
  time_of_day: string;
  weather_state: string;
  active_hazards: string[];
  hidden_resources: string[];
  location_secret: {
    nature: string;
    revelation_trigger: string;
    consequence: string;
    discovery_state: 'Hidden' | 'Suspected' | 'Evident' | 'Known' | 'Resolved';
  };
  spatial_logic: string; 
  relationship_to_villain: string; 
}

export interface NarrativeState {
  active_prices: string[];
  sensory_focus: string;
  visual_motif: string; 
  illustration_request: string | null; 
  active_events: NarrativeEvent[];
  narrative_debt: string[]; 
  unreliable_architect_level: number; 
}

export interface HistoryState {
  recentKeywords: string[];
}

export interface NarrativeFlags {
  lastUserTone: string;
  pacing_mode: string;
  is_ooc: boolean;
  input_type: 'text' | 'choice_yes_no';
}

export interface StarGameState {
  is_active: boolean;
  turn: number;
  boards: any[];
  mira_countdown: string[]; 
  last_resonance: string; 
}

export interface CoAuthorState {
  name: string; 
  archetype: string;
  tone: string; 
  dominance_level: number; 
  creativity_temperature: number; 
  relationship_to_user: string; 
  current_obsession: string; 
  meta_commentary_frequency: string; 
}

export interface GameState {
  meta: {
    turn: number;
    custodian_name: string;
    perspective: string;
    mode: 'Survivor' | 'Villain' | 'Pending';
    starting_point: string; 
    intensity_level: string;
    active_cluster: string;
    cluster_weights: ClusterWeights;
    target_duration: string;
    target_turn_count: number;
  };
  villain_state: VillainState;
  npc_states: NpcState[];
  location_state: LocationState;
  narrative: NarrativeState;
  history: HistoryState;
  narrativeFlags: NarrativeFlags;
  star_game?: StarGameState; 
  co_author_state?: CoAuthorState;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  gameState?: GameState;
  imageUrl?: string; 
  timestamp: number;
}

export interface NarrativeEvent {
  name: string;
  description: string;
  effects: any[];
}

// Added ClusterLore interface for loreLibrary.ts
export interface ClusterLore {
  id: string;
  displayName: string;
  philosophy: string;
  coreAxiom: string;
  mood: string;
  villains: {
    name: string;
    description: string;
    goeticRank: string;
    primaryGoal: string;
    obsessionFlaw: string;
    vulnerability: string;
  }[];
  environments: {
    name: string;
    description: string;
    activeHazards: string[];
  }[];
  sensoryInjectors: {
    smell: string[];
    sound: string[];
    touch: string[];
    taste: string[];
  };
  npcArchetypes: {
    defaultName: string;
    background: string;
    archetype: string;
    hiddenHistory: {
      description: string;
      secondaryGoal: string;
    };
    triggerObject: {
      name: string;
      description: string;
      fractureImpact: number;
    };
    defaultRelationship: { trust: number; fear: number; secretKnowledge: boolean };
    defaultVolition: Volition;
    defaultRelationships: Record<string, string>;
    defaultWillpower: number;
    defaultDevotion: number;
    fatal_flaw: string;
    specific_fear: string;
    defaultAgendas: string[];
    voice_profile: VoiceProfile;
  }[];
}

// Added ArchivedCharacter interface for characterArchive.ts
export interface ArchivedCharacter {
  character_id: string;
  name: string;
  origin_story: string;
  archetype: string;
  fracture_state: number;
  permanent_traits: string[];
  fracture_vectors: FractureVectors;
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
