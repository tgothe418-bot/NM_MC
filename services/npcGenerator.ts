

import { 
  NpcState, 
  VoiceSignature, 
  PsychologicalProfile 
} from '../types';
import { getDefaultDialogueState } from './dialogueEngine';
import { hydrateUserCharacter } from './geminiService';

/**
 * NPC GENERATOR ENGINE (V4.0 - MOSAIC CHARACTERIZATION)
 */

// --- DATA POOLS ---

const ORIGIN_POOLS = {
  "Americas": {
    names_masc: ["Mateo", "Elijah", "Santiago", "Caleb", "Diego", "Wyatt", "Malik", "Dante", "Leo", "Julian"],
    names_fem: ["Sofia", "Chloe", "Valentina", "Zoe", "Luna", "Maya", "Naomi", "Elena", "Ava", "Isabella"],
    surnames: ["Reyes", "Washington", "Castillo", "Moreau", "Blackwood", "Vega", "Price", "Hayes", "Rivera", "Brooks"],
    regions: ["New Orleans, USA", "Mexico City", "Vancouver, BC", "Sao Paulo, Brazil", "Chicago, USA", "Bogota, Colombia"]
  },
  "Euro_Slavic": {
    names_masc: ["Dmitri", "Luka", "Nikolai", "Viktor", "Marek", "Adrian", "Elias", "Sebastian", "Felix", "Jasper"],
    names_fem: ["Katya", "Elena", "Nadia", "Petra", "Ivana", "Sylvie", "Oksana", "Clara", "Freya", "Beatrix"],
    surnames: ["Volkov", "Kovac", "Novak", "Dimitrov", "Petrov", "Sokolov", "Morozov", "Wagner", "Hoffman", "Weber"],
    regions: ["Kyiv", "Prague", "Berlin", "St. Petersburg", "Warsaw", "Budapest", "Vienna"]
  },
  "Asia_Pacific": {
    names_masc: ["Kenji", "Wei", "Arjun", "Hiro", "Min-ho", "Ravi", "Jin", "Ren", "Kai", "Akira"],
    names_fem: ["Yuki", "Mei", "Priya", "Hana", "Ji-woo", "Leila", "Sora", "Aiko", "Yuna", "Emi"],
    surnames: ["Tanaka", "Chen", "Patel", "Kim", "Yamamoto", "Singh", "Nguyen", "Lee", "Wu", "Gupta"],
    regions: ["Tokyo", "Seoul", "Mumbai", "Shanghai", "Singapore", "Bangkok", "Manila"]
  },
  "West_Africa": {
    names_masc: ["Kwame", "Amara", "Tunde", "Chidi", "Kofi", "Emeka", "Idris", "Zayn", "Malik", "Omar"],
    names_fem: ["Zainab", "Nneka", "Amina", "Chioma", "Fatima", "Yara", "Imani", "Nia", "Asha", "Zola"],
    surnames: ["Okonkwo", "Mensah", "Diallo", "Sow", "Adeybayo", "Conteh", "Traore", "Kamara"],
    regions: ["Lagos", "Accra", "Dakar", "Nairobi", "Cairo", "Casablanca"]
  }
};

const PSYCH_ARCHETYPES: Record<string, Partial<PsychologicalProfile>> = {
  // --- THE RATIONALISTS ---
  "The Skeptic": {
    breaking_point_trigger: "Undeniable supernatural proof",
    shadow_self: "The Catatonic",
    moral_compass: 'Utilitarian'
  },
  "The Academic": {
    breaking_point_trigger: "Illogic / Non-Euclidean geometry",
    shadow_self: "The Cultist", // They worship what they cannot explain
    moral_compass: 'Utilitarian'
  },
  "The Strategist": {
    breaking_point_trigger: "Total loss of control / Chaos",
    shadow_self: "The Tyrant", // Imposes order through cruelty
    moral_compass: 'Utilitarian'
  },
  "The Medic": {
    breaking_point_trigger: "Inability to heal a loved one",
    shadow_self: "The Angel of Mercy", // Euthanizes to prevent suffering
    moral_compass: 'Altruistic'
  },

  // --- THE EMOTIONALISTS ---
  "The Martyr": {
    breaking_point_trigger: "Failure to save a dependent",
    shadow_self: "The Avenger",
    moral_compass: 'Altruistic'
  },
  "The Nurturer": {
    breaking_point_trigger: "Corruption of the innocent",
    shadow_self: "The Devourer", // Consumes to keep them "safe" inside
    moral_compass: 'Altruistic'
  },
  "The Lover": {
    breaking_point_trigger: "Betrayal or loss of the beloved",
    shadow_self: "The Stalker",
    moral_compass: 'Self-Preserving' // Preserving the "Us"
  },
  "The Artist": {
    breaking_point_trigger: "Destruction of their life's work",
    shadow_self: "The Vandal", // Destroys all beauty
    moral_compass: 'Nihilistic'
  },

  // --- THE SURVIVORS ---
  "The Rat": {
    breaking_point_trigger: "Imminent physical pain",
    shadow_self: "The Collaborator",
    moral_compass: 'Self-Preserving'
  },
  "The Soldier": {
    breaking_point_trigger: "Betrayal by command / Futility",
    shadow_self: "The Butcher",
    moral_compass: 'Utilitarian'
  },
  "The Loner": {
    breaking_point_trigger: "Forced intimacy / Crowds",
    shadow_self: "The Solipsist", // Believes others aren't real
    moral_compass: 'Self-Preserving'
  },
  "The Scavenger": {
    breaking_point_trigger: "Starvation / Total lack of resources",
    shadow_self: "The Hoarder",
    moral_compass: 'Self-Preserving'
  },

  // --- THE BROKEN ---
  "The Addict": {
    breaking_point_trigger: "Withdrawal / Sobriety",
    shadow_self: "The Fiend",
    moral_compass: 'Nihilistic'
  },
  "The Guilt-Ridden": {
    breaking_point_trigger: "Forgiveness (They cannot accept it)",
    shadow_self: "The Flagellant", // Seeks pain as penance
    moral_compass: 'Altruistic'
  },
  "The Nihilist": {
    breaking_point_trigger: "Proof of a benevolent God/Meaning",
    shadow_self: "The Zealot", // Clings to the new meaning violently
    moral_compass: 'Nihilistic'
  },
  "The Innocent": {
    breaking_point_trigger: "Direct participation in violence",
    shadow_self: "The Conduit", // Empty vessel for the horror
    moral_compass: 'Altruistic'
  },

  // --- THE SOCIAL ---
  "The Leader": {
    breaking_point_trigger: "Mutiny / Loss of respect",
    shadow_self: "The Pariah",
    moral_compass: 'Utilitarian'
  },
  "The Follower": {
    breaking_point_trigger: "Death of the Leader",
    shadow_self: "The Fanatic", // Will follow *anything* else
    moral_compass: 'Altruistic'
  },
  "The Hedonist": {
    breaking_point_trigger: "Sensory deprivation",
    shadow_self: "The Masochist", // Pain is the only sensation left
    moral_compass: 'Self-Preserving'
  },
  "The Gossip": {
    breaking_point_trigger: "Silence / Being ignored",
    shadow_self: "The Screamer",
    moral_compass: 'Self-Preserving'
  }
};

const TRAUMAS = [
  // Physical / Survival
  "Sole survivor of a house fire that killed their twin.",
  "Spent 3 days trapped in a collapsed mine listening to others die.",
  "Was a child soldier in a conflict no one remembers.",
  "Survived a plane crash by eating the other passengers.",
  "Lost an arm in industrial machinery; sometimes feels it grasping.",
  "Buried alive for six hours due to a prank gone wrong.",
  "Drifted at sea for weeks, drinking turtle blood.",

  // Medical / Biological
  "Accidentally administered a fatal dose to a pediatric patient.",
  "Woke up during surgery but couldn't move or scream.",
  "Born with a parasitic twin that was surgically removed.",
  "Participated in a drug trial that erased their childhood memories.",
  "Their body rejected a heart transplant from a murderer.",
  "Carries a dormant, unknown virus from a deep-jungle expedition.",

  // Psychological / Social
  "Witnessed a parent's suicide on their 10th birthday.",
  "Sold out their sibling to clear a gambling debt.",
  "Gaslit their spouse into an asylum to steal an inheritance.",
  "Lost a child in a crowd and never found them.",
  "Was the favorite child of a serial killer.",
  "Catfished someone who then committed suicide on livestream.",
  "Stalked by a stranger who looked exactly like them for a year.",

  // Cosmic / Weird
  "Saw something in a telescope that looked back.",
  "Read a book that didn't exist, and now quotes it in sleep.",
  "Discovered a hidden room in their house where someone had been living.",
  "Received phone calls from their own number for a month.",
  "Found their own obituary in a newspaper from 1950.",
  "Cannot recognize faces (Prosopagnosia) after a lightning strike.",
  "Has a recurring dream of drowning in a city of black geometry."
];

const HOBBIES = ["Mycology", "Radio Repair", "Taxidermy", "Lockpicking", "Urban Exploration", "Botany", "Violin", "Chess", "Sketching", "Astronomy", "Genealogy", "Origami", "Photography", "Poetry", "Knitting", "Insect Collection", "Watchmaking", "Cryptography", "Anatomy", "Natural Philosophy", "Cartography", "Fire Building", "Scavenging", "Journaling", "Gourmet Cooking", "Hacking", "Serial Killer History"];

const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const pickRandomKey = (obj: any) => Object.keys(obj)[Math.floor(Math.random() * Object.keys(obj).length)];

export const generateProceduralNpc = (clusterName: string = "Flesh", intensity: string = "Level 3", startingPoint: string = "Prologue"): NpcState => {
  
  // Calculate numeric intensity for scaling
  const intensityLevel = parseInt(intensity.replace(/\D/g, '')) || 3;
  const isHighIntensity = intensityLevel >= 4;

  // 1. Select Cultural Origin
  const originKey = pickRandomKey(ORIGIN_POOLS);
  const pool = ORIGIN_POOLS[originKey as keyof typeof ORIGIN_POOLS];
  const gender = Math.random() > 0.5 ? 'masc' : 'fem';
  const firstName = gender === 'masc' ? pickRandom(pool.names_masc) : pickRandom(pool.names_fem);
  const lastName = pickRandom(pool.surnames);
  const region = pickRandom(pool.regions);

  // 2. Select Psychology
  const archKey = pickRandomKey(PSYCH_ARCHETYPES);
  const basePsych = PSYCH_ARCHETYPES[archKey];
  const trauma = pickRandom(TRAUMAS);
  const hobby = pickRandom(HOBBIES);

  // 3. Construct Voice Signature
  const voiceSig: VoiceSignature = {
    rhythm: pickRandom(['Staccato', 'Lyrical', 'Breathless', 'Monotone', 'Erratic']),
    syntax_complexity: pickRandom(['Simple', 'Academic', 'Broken', 'Flowery']),
    catchphrases: [],
    ticks: pickRandom([
      ["Rubs thumb against forefinger", "Avoids eye contact"],
      ["Chews lip", "Checks watch"],
      ["Hums unconsciously", "Clenches jaw"],
      ["Touches holy symbol", "Whispers prayers"],
      ["Scratches phantom itch", "Cracks knuckles"],
      ["Stares at light sources", "Picks at skin"]
    ]),
    cultural_markers: [region]
  };

  const richOrigin = `From ${region}. ${archKey}. ${trauma} They speak with a ${voiceSig.rhythm} rhythm. Their hobby of ${hobby.toLowerCase()} masks a deep anxiety.`;

  // 4. Determine Flaws & Personality
  const flaw = pickRandom(["Cowardice", "Greed", "Wrath", "Envy", "Pride", "Sloth", "Lust", "Addiction", "Fanaticism"]);
  const trait = pickRandom(["Resourceful", "Paranoid", "Charming", "Aggressive", "Stoic", "Manic"]);

  return {
    name: `${firstName} ${lastName}`,
    archetype: archKey,
    origin: {
      region: region,
      ethnicity: originKey,
      native_language: "English (localized)"
    },
    background_origin: richOrigin,
    hidden_agenda: {
      goal: "Survive at any cost",
      constraint: "Must not reveal the trauma",
      progress_level: 0
    },
    psychology: {
      stress_level: intensityLevel * 10,
      current_thought: "Keep moving.",
      dominant_instinct: pickRandom(['Fight', 'Flight', 'Freeze', 'Fawn']),
      sanity_percentage: 100,
      resilience_level: isHighIntensity ? 'Fragile' : 'Moderate',
      emotional_state: "Anxious",
      profile: {
        archetype: archKey,
        core_trauma: trauma,
        breaking_point_trigger: basePsych.breaking_point_trigger!,
        shadow_self: basePsych.shadow_self!,
        moral_compass: (basePsych.moral_compass as any) || 'Self-Preserving'
      }
    },
    dialogue_state: {
      ...getDefaultDialogueState(richOrigin),
      voice_signature: voiceSig,
      // Map legacy profile for UI compatibility
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
        dominant_trait: trait,
        fatal_flaw: flaw,
        coping_mechanism: pickRandom(["Prayer", "Dissociation", "Violence", "Self-Harm"]),
        moral_alignment: basePsych.moral_compass || "Neutral"
    },
    physical: {
        height: pickRandom(["Tall", "Short", "Average"]),
        build: pickRandom(["Wiry", "Heavy", "Athletic", "Frail"]),
        distinguishing_feature: pickRandom(["Scarred hands", "Piercing eyes", "Twitchy posture", "Immaculate clothing", "Smell of tobacco"]),
        clothing_style: "Worn utilitarian"
    },
    relationship_state: { trust: 25, fear: intensityLevel * 10, secretKnowledge: isHighIntensity },
    relationships_to_other_npcs: {},
    memory_stream: [],
    current_intent: { goal: 'Survive', target: 'Self', urgency: 5 },
    knowledge_state: [],
    physical_state: "Tense",
    willpower: isHighIntensity ? 30 : 60,
    devotion: isHighIntensity ? 20 : 40,
    resources_held: [hobby], // They often carry items related to their hobby
    trust_level: 1,
    agency_level: "Low",
    narrative_role: "Survivor",
    pain_level: 0,
    shock_level: 0,
    mobility_score: 100,
    manipulation_score: 100,
    perception_score: 100,
    fracture_vectors: { fear: intensityLevel * 10, isolation: 10, guilt: 20, paranoia: 10 },
    current_state: "Active",
    disassociation_index: 0,
    secondary_goal: "Redemption"
  };
};

/**
 * ASYNC FACTORY: Creates an NPC either procedurally OR via Semantic Resonance 
 * if a user description is provided.
 */
export const createNpcFactory = async (
  cluster: string, 
  intensity: string, 
  userDescription?: string
): Promise<NpcState> => {
  
  // PATH A: High-Fidelity User Character (Semantic Resonance)
  if (userDescription && userDescription.trim().length > 5) {
    try {
      const hydratedPartial = await hydrateUserCharacter(userDescription, cluster);
      
      // Merge with required runtime fields that might be missing from the LLM response
      const base = generateProceduralNpc(cluster, intensity); // Get a "skeleton" for safe defaults
      
      return {
        ...base, // Use base for stats like health/fracture vectors
        ...hydratedPartial, // Overwrite identity/voice/psychology with LLM data
        // Ensure deeply nested objects are merged correctly if needed
        psychology: {
          ...base.psychology,
          ...hydratedPartial.psychology,
          // Ensure profile is correctly set if partial has it
          profile: hydratedPartial.psychology?.profile || base.psychology.profile
        },
        dialogue_state: {
             ...base.dialogue_state,
             ...(hydratedPartial.dialogue_state || {}),
        }
      };
    } catch (e) {
      console.warn("Semantic Resonance Failed, falling back to procedural:", e);
      return generateProceduralNpc(cluster, intensity);
    }
  }

  // PATH B: Pure Procedural (Mosaic)
  return generateProceduralNpc(cluster, intensity);
};