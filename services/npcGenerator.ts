import { 
  NpcState, 
  VoiceSignature, 
  PsychologicalProfile 
} from '../types';
import { getDefaultDialogueState } from './dialogueEngine';
import { hydrateUserCharacter } from './geminiService';

/**
 * NPC GENERATOR ENGINE (V5.0 - REALISM & RESONANCE)
 * Moves beyond "Cluster-Centrism" by generating a human first, 
 * then applying the nightmare logic as a corrupting filter.
 */

// --- REALISTIC DATA POOLS ---

const JOBS = [
  "Structural Engineer", "Pediatric Nurse", "Sous Chef", "Data Archivist", 
  "Long-haul Trucker", "Botanist", "High School History Teacher", "Paramedic", 
  "Corporate Lawyer", "Janitor", "Software Developer", "Art Restorer", 
  "Yoga Instructor", "Crime Scene Cleaner", "Librarian", "Electrician"
];

const CORE_DRIVES = [
  "To atone for a past mistake",
  "To get back to their children",
  "To finish their life's work",
  "To prove they aren't crazy",
  "To find the person they lost",
  "To document the truth",
  "To purely survive, no matter the cost"
];

// Mapped to specific clusters to create thematic resonance
const CLUSTER_SPECIFIC_TRAUMAS: Record<string, string[]> = {
  "Flesh": [
    "Woke up during surgery and couldn't scream.",
    "Lost a limb that they can still feel itching.",
    "Witnessed a birth that went horribly wrong.",
    "Has a rare skin condition that makes them sensitive to touch."
  ],
  "System": [
    "Erased from all government databases overnight.",
    "Hearing a specific frequency that predicts bad events.",
    "Worked in content moderation and saw 'The Video'.",
    "Has a pacemaker that sometimes hums a tune."
  ],
  "Haunting": [
    "Inherited a house where the doors locked themselves.",
    "Can't remember the face of their dead spouse.",
    "Found their own obituary in a library archive.",
    "Smells their grandmother's perfume before accidents happen."
  ],
  "Survival": [
    "Survived a plane crash by eating the dead.",
    "Trapped in a cave for three days with a broken leg.",
    "Lost a child to hypothermia on a camping trip.",
    "Was buried alive as a prank that went too long."
  ],
  "Self": [
    "Suffers from Capgras Delusion (thinks loved ones are imposters).",
    "Has no memory of their life before age 10.",
    "Constantly sees their own doppelganger in crowds.",
    "Believes they are a character in a story."
  ],
  "Blasphemy": [
    "Raised in a cult that worshipped decay.",
    "Accidentally desecrated a grave and feels cursed.",
    "Witnessed a miracle that was actually horrific.",
    "Has intrusive thoughts about defiling sacred objects."
  ],
  "Desire": [
    "Stalked an ex-lover until they disappeared.",
    "Addicted to the feeling of fear.",
    "Has a history of falling in love with dangerous people.",
    "Ruined their family for a moment of pleasure."
  ]
};

const GENERIC_TRAUMAS = [
  "Witnessed a violent crime.",
  "Lost everything in a house fire.",
  "Betrayed by a sibling for money.",
  "Survived a terminal illness against odds."
];

// Personality Traits (The Big 5 Model - Simplified)
const PERSONALITY_TRAITS = [
  { label: "The Stoic", high: ["Resilient", "Calm"], low: ["Detached", "Cold"] },
  { label: "The Neurotic", high: ["Alert", "Sensitive"], low: ["Anxious", "Volatile"] },
  { label: "The Empath", high: ["Caring", "Insightful"], low: ["Overwhelmed", "Fragile"] },
  { label: "The Analyst", high: ["Logical", "Prepared"], low: ["Cynical", "Rigid"] },
  { label: "The Charmer", high: ["Persuasive", "Social"], low: ["Manipulative", "Fake"] }
];

const ORIGIN_POOLS = {
  "Global_North": {
    names: ["James", "Sarah", "Michael", "Emily", "David", "Jessica", "Robert", "Jennifer"],
    surnames: ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis"],
    regions: ["Chicago", "London", "Toronto", "Berlin", "Seattle"]
  },
  "Global_South": {
    names: ["Mateo", "Sofia", "Alejandro", "Valentina", "Gabriel", "Camila"],
    surnames: ["Garcia", "Rodriguez", "Martinez", "Hernandez", "Lopez"],
    regions: ["Mexico City", "Buenos Aires", "Sao Paulo", "Bogota"]
  },
   "East_Asia": {
    names: ["Kenji", "Yuki", "Wei", "Mei", "Jin", "Hana"],
    surnames: ["Tanaka", "Chen", "Kim", "Lee", "Wong"],
    regions: ["Tokyo", "Seoul", "Shanghai", "Singapore"]
  }
};

const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const pickRandomKey = (obj: any) => Object.keys(obj)[Math.floor(Math.random() * Object.keys(obj).length)];

export const generateProceduralNpc = (clusterName: string = "Flesh", intensity: string = "Level 3", startingPoint: string = "Prologue"): NpcState => {
  
  const intensityLevel = parseInt(intensity.replace(/\D/g, '')) || 3;
  const isHighIntensity = intensityLevel >= 4;

  // 1. Generate Base Human (Cluster Agnostic)
  const originKey = pickRandomKey(ORIGIN_POOLS);
  const pool = ORIGIN_POOLS[originKey as keyof typeof ORIGIN_POOLS];
  const name = `${pickRandom(pool.names)} ${pickRandom(pool.surnames)}`;
  const region = pickRandom(pool.regions);
  const job = pickRandom(JOBS);
  const drive = pickRandom(CORE_DRIVES);
  const personality = pickRandom(PERSONALITY_TRAITS);

  // 2. Select Trauma (Cluster Informed)
  // 50% chance to have a trauma specifically related to the active cluster (Thematic Resonance)
  // 50% chance to have a generic trauma (Realistic randomness)
  const useClusterTrauma = Math.random() > 0.5;
  // Normalize cluster key to match dictionary
  const normalizedCluster = Object.keys(CLUSTER_SPECIFIC_TRAUMAS).find(k => clusterName.includes(k)) || "Flesh";
  
  const trauma = useClusterTrauma 
    ? pickRandom(CLUSTER_SPECIFIC_TRAUMAS[normalizedCluster] || GENERIC_TRAUMAS)
    : pickRandom(GENERIC_TRAUMAS);

  // 3. Construct "Corruption" (How the cluster affects them)
  const richOrigin = `A ${personality.label.toLowerCase()} ${job} from ${region}. Driven to ${drive.toLowerCase()}. Trauma: ${trauma}`;

  // 4. Voice Signature
  const voiceSig: VoiceSignature = {
    rhythm: pickRandom(['Staccato', 'Lyrical', 'Breathless', 'Monotone', 'Erratic']),
    syntax_complexity: pickRandom(['Simple', 'Academic', 'Broken', 'Flowery']),
    catchphrases: [],
    ticks: pickRandom([
      ["Rubs thumb against forefinger", "Avoids eye contact"],
      ["Chews lip", "Checks watch"],
      ["Hums unconsciously", "Clenches jaw"],
      ["Touches holy symbol", "Whispers prayers"],
      ["Scratches phantom itch", "Cracks knuckles"]
    ]),
    cultural_markers: [region]
  };

  return {
    name: name,
    archetype: `${personality.label} (${job})`, // E.g., "The Stoic (Nurse)"
    origin: {
      region: region,
      ethnicity: originKey,
      native_language: "English (localized)"
    },
    background_origin: richOrigin,
    hidden_agenda: {
      goal: drive, // Their realistic drive becomes their agenda
      constraint: "Must keep their trauma secret",
      progress_level: 0
    },
    psychology: {
      stress_level: intensityLevel * 10,
      current_thought: "Just keep moving.",
      dominant_instinct: pickRandom(['Fight', 'Flight', 'Freeze', 'Fawn']),
      sanity_percentage: 100,
      resilience_level: isHighIntensity ? 'Fragile' : 'Moderate',
      emotional_state: "Anxious",
      profile: {
        archetype: personality.label,
        core_trauma: trauma,
        breaking_point_trigger: "Confrontation with the specific trauma",
        shadow_self: `The Corrupted ${job}`, // E.g., "The Corrupted Nurse"
        moral_compass: pickRandom(['Altruistic', 'Utilitarian', 'Self-Preserving'])
      }
    },
    dialogue_state: {
      ...getDefaultDialogueState(richOrigin),
      voice_signature: voiceSig,
      voice_profile: { 
        tone: voiceSig.rhythm, 
        vocabulary: [], 
        quirks: voiceSig.ticks, 
        forbidden_topics: [trauma.split(' ').slice(0, 3).join(' ')] 
      }
    },
    active_injuries: [],
    fracture_state: 0,
    consciousness: "Alert",
    personality: {
        dominant_trait: pickRandom(personality.high),
        fatal_flaw: pickRandom(personality.low),
        coping_mechanism: pickRandom(["Rationalization", "Prayer", "Humor", "Dissociation"]),
        moral_alignment: "Neutral"
    },
    relationship_state: { trust: 25, fear: intensityLevel * 10, secretKnowledge: isHighIntensity },
    current_intent: { goal: 'Survive', target: 'Self', urgency: 5 },
    // Defaults for compatibility
    knowledge_state: [],
    fracture_vectors: { fear: 10, isolation: 10, guilt: 10, paranoia: 10 }
  };
};

export const createNpcFactory = async (
  cluster: string, 
  intensity: string, 
  userDescription?: string
): Promise<NpcState> => {
  if (userDescription && userDescription.trim().length > 5) {
    try {
      const hydratedPartial = await hydrateUserCharacter(userDescription, cluster);
      const base = generateProceduralNpc(cluster, intensity);
      return { ...base, ...hydratedPartial };
    } catch (e) {
      console.warn("Semantic Resonance Failed, falling back to procedural:", e);
      return generateProceduralNpc(cluster, intensity);
    }
  }
  return generateProceduralNpc(cluster, intensity);
};