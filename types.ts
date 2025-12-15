
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

export interface DialogueEntry {
  speaker: string; 
  text: string;
  sentiment: 'Hostile' | 'Neutral' | 'Friendly' | 'Fearful';
  turn: number;
}

export interface VoiceProfile {
  tone: string; 
  vocabulary: string[]; 
  quirks: string[]; 
  forbidden_topics: string[]; 
}

export interface DialogueState {
  voice_profile: VoiceProfile;
  last_topic: string;
  conversation_history: DialogueEntry[]; 
  mood_state: string; 
}

// --- NEW NPC ENGINE TYPES ---

export interface PersonalityProfile {
  dominant_trait: string; // e.g., "Stoic", "Neurotic"
  fatal_flaw: string; // e.g., "Hesitation"
  coping_mechanism: string; // e.g., "Humor", "Dissociation"
  moral_alignment: string; // e.g., "Selfish", "Altruistic"
}

export interface PhysicalFeatures {
  height: string;
  build: string;
  distinguishing_feature: string; // e.g., "Scar above eye", "Trembling hands"
  clothing_style: string;
}

export interface PsychologicalState {
  current_thought: string; // Internal monologue snippet
  emotional_state: string; // e.g., "Panic", "Determination"
  sanity_percentage: number; // 0-100
  resilience_level: string; // "High", "Shattered"
}

export interface KnowledgeNode {
  topic: string; 
  details: string; 
  confidence: number; 
  source: string; 
}

export type InjuryDepth = 'SURFACE' | 'DEEP_TISSUE' | 'STRUCTURAL';

export interface Injury {
  location: string;
  type: 'abrasion' | 'contusion' | 'laceration' | 'incision' | 'puncture' | 'fracture' | 'avulsion' | 'degloving' | 'burn' | 'psychological';
  depth: InjuryDepth; 
  description: string; 
  functional_impact: string; 
}

export interface NpcDemographics {
  gender: string;
  age: string;
  appearance: string; // Legacy string fallback
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
  
  // New Engine Fields
  personality?: PersonalityProfile;
  physical?: PhysicalFeatures;
  psychology?: PsychologicalState;
  background_origin?: string; // Where they came from before the nightmare
  
  // Legacy/Compatibility Fields
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
  fatal_flaw?: string; // Keeping for compatibility, but moving to PersonalityProfile
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
  history_ref?: HiddenHistory;
  archive_id?: string;

  willpower: number; 
  devotion: number; 
  active_injuries: Injury[];

  pain_level: number; 
  shock_level: number; 
  consciousness: 'Alert' | 'Dazed' | 'Fading' | 'Unconscious';
  mobility_score: number; 
  manipulation_score: number; 
  perception_score: number; 
}

export interface ActiveSensoryProfile {
  primary_sense: string;
  secondary_sense: string;
  intensity: string;
}

export interface LocationSecret {
  nature: string;
  revelation_trigger: string;
  consequence: string;
  discovery_state: 'Hidden' | 'Suspected' | 'Evident' | 'Known' | 'Resolved';
}

export interface LocationState {
  name: string;
  archetype: string; 
  cluster_alignment: string;
  current_state: number; 
  dominant_sensory_palette: ActiveSensoryProfile;
  time_of_day: string;
  weather_state: string;
  active_hazards: string[];
  hidden_resources: string[];
  location_secret: LocationSecret;
  spatial_logic: string; 
  relationship_to_villain: string; 
}

export type ClusterType = 'Flesh' | 'System' | 'Haunting' | 'Self' | 'Blasphemy' | 'Survival' | 'Desire';

export interface VillainArchetype {
  name: string;
  description: string;
  goeticRank: string; 
  primaryGoal: string;
  obsessionFlaw: string;
  vulnerability: string;
}

export interface EnvironmentArchetype {
  name: string;
  description: string;
  activeHazards: string[];
}

export interface SensoryPalette {
  smell: string[];
  sound: string[];
  touch: string[];
  taste: string[];
}

export interface NPCArchetypeDef {
  defaultName?: string;
  background: string;
  archetype: string; 
  hiddenHistory: HiddenHistory;
  triggerObject: TriggerObject;
  defaultRelationship?: RelationshipState;
  defaultVolition?: Volition;
  defaultRelationships?: Record<string, string>; 
  defaultCurrentState?: string; 
  defaultWillpower?: number;
  defaultDevotion?: number;
  fatal_flaw?: string;
  specific_fear?: string;
  defaultAgendas?: string[]; 
  voice_profile?: VoiceProfile; 
}

export interface ClusterLore {
  id: ClusterType;
  displayName: string;
  philosophy: string;
  coreAxiom: string;
  mood: string;
  villains: VillainArchetype[];
  environments: EnvironmentArchetype[];
  sensoryInjectors: SensoryPalette; 
  npcArchetypes: NPCArchetypeDef[];
}

export interface DialogueSample {
  greeting: string;
  warning: string;
  farewell: string;
}

export interface SpecialConditions {
  trigger: string;
  effect: string;
}

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
  dialogue_sample: DialogueSample;
  resources_held: string[];
  special_conditions: SpecialConditions;
}

export interface SensoryRotation {
  lastSmellIndex: number;
  lastSoundIndex: number;
  lastTouchIndex: number;
  lastTasteIndex: number;
}

export interface NarrativeEvent {
  name: string;
  description: string;
  effects: EventEffect[];
}

export interface EventEffect {
  target: 'villain' | 'npc' | 'location' | 'global';
  property: string;
  value: any;
  operation: 'set' | 'increment' | 'decrement' | 'append';
}

export interface NarrativeState {
  active_prices: string[];
  sensory_focus: string;
  visual_motif: string; 
  illustration_request: string | null; 
  active_events: NarrativeEvent[];
  narrative_debt: string[]; 
  unreliable_architect_level: number; 
  style_mode?: 'Standard' | 'Ergodic' | 'Glitch' | 'CutUp' | 'Cinema' | 'Eerie'; 
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

export interface StarBoardState {
  name: string; 
  white: number; 
  black: number; 
}

export interface StarGameState {
  is_active: boolean;
  turn: number;
  boards: StarBoardState[];
  mira_countdown: string[]; 
  last_resonance: string; 
}

export type ArchitectArchetype = 
  | 'The Archivist'    
  | 'The Director'     
  | 'The Sadist'       
  | 'The Oracle'       
  | 'The Glitch'       
  | 'The Caretaker'    
  | 'Auto-Generated';  

export interface CoAuthorState {
  name: string; 
  archetype: ArchitectArchetype;
  tone: string; 
  dominance_level: number; 
  creativity_temperature: number; 
  relationship_to_user: string; 
  current_obsession: string; 
  meta_commentary_frequency: 'High' | 'Medium' | 'Low' | 'None'; 
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
  };
  villain_state: VillainState;
  npc_states: NpcState[];
  location_state: LocationState;
  narrative: NarrativeState;
  history: HistoryState;
  narrativeFlags: NarrativeFlags;
  sensory_rotation?: SensoryRotation; 
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
