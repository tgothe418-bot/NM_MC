
import { 
  NpcState, 
  PersonalityProfile, 
  PhysicalFeatures, 
  PsychologicalState, 
  VoiceProfile, 
  NpcTraits, 
  FractureVectors,
  Injury 
} from '../types';

/**
 * NPC GENERATOR ENGINE (V2.0 - DEEP TEXTURE)
 * * Generates characters with specific hobbies, regrets, and physical totems 
 * to create immediate narrative buy-in.
 */

const FIRST_NAMES = [
  "Elias", "Mara", "Jonas", "Silas", "Caleb", "Ivy", "Ezra", "Thalia", "Felix", "Rowan",
  "Iris", "Julian", "Beatrix", "Soren", "Lyra", "Gideon", "Hazel", "Atticus", "Freya", "Miles",
  "August", "Clara", "Jasper", "Ophelia", "Arthur", "Mabel", "Finn", "Elara", "Hugo", "Maeve",
  "Orion", "Nova", "Cyrus", "Salome", "Judah", "Vesper", "Kit", "Remi", "Dahlia", "Bram"
];

const LAST_NAMES = [
  "Vance", "Blackwood", "Thorne", "Holloway", "Crane", "Mercer", "Vale", "Locke", "Winter", "Grave",
  "Cross", "Sterling", "Moss", "Frost", "Pike", "Wolf", "Crow", "Steel", "Reed", "Ash",
  "Hawthorne", "Lovelace", "Sombers", "Nox", "Grimm", "Styx", "Vane", "Kain", "Moriarty"
];

// Specific, granular hobbies to ground the character
const HOBBIES = [
  "Mycology (Mushrooms)", "Vintage Radio Repair", "Taxidermy", "Lockpicking", "Urban Exploration",
  "Botany", "Violin", "Chess", "Sketching", "Astronomy", "Genealogy", "Origami", 
  "Analog Photography", "Poetry", "Knitting", "Insect Collection", "Watchmaking", "Cryptography"
];

// Dark secrets to fuel the 'Guilt' and 'Paranoia' vectors
const REGRETS = [
  "Left a sibling behind", "Stole money for addiction", "Failed to save a patient", 
  "Cheated on a spouse who died", "Ignored a cry for help", "Sold a family heirloom",
  "Caused a car accident", "Lied in court", "Abandoned a child", "Plagiarized life's work"
];

const CLUSTER_FLAVORS: Record<string, {
  backgrounds: string[];
  flaws: string[];
  quirks: string[];
  fears: string[];
  voices: string[];
  appearances: string[];
  items: string[]; // "Totems" they carry
  hooks: string[]; // One-sentence micro-stories
}> = {
  "Flesh": {
    backgrounds: ["Butcher", "Disgraced Surgeon", "Bodybuilder", "Tattoo Artist", "Veterinarian"],
    flaws: ["Squeamish", "Hypochondriac", "Masochistic", "Addict", "Gluttonous"],
    quirks: ["Scratches phantom itches", "Cracks knuckles constantly", "Inspects food suspiciously", "Obsessed with hygiene"],
    fears: ["Infection", "Amputation", "Parasites", "Needles", "Suffocation"],
    voices: ["Clinical", "Breathless", "Wet/Moist", "Strained", "Detached"],
    appearances: ["Pale and sickly", "Overweight and sweating", "Covered in surgical scars", "Immaculate suit", "Blood-stained scrubs"],
    items: ["A jar of teeth", "Scalpel wrapped in cloth", "Packet of smelling salts", "Anatomy textbook", "Pills"],
    hooks: ["Came here to find a cure for a disease that doesn't exist yet.", "Wants to transcend the limitations of skin."]
  },
  "System": {
    backgrounds: ["Backend Dev", "Data Clerk", "Electrician", "White Hat Hacker", "Archivist"],
    flaws: ["Paranoid", "Cold", "Obsessive", "Dissociated", "Calculated"],
    quirks: ["Speaks in boolean logic", "Avoids eye contact", "Checks exits", "Taps rhythms on surfaces"],
    fears: ["Surveillance", "Loss of Identity", "Automation", "Silence", "Mirrors"],
    voices: ["Monotone", "Rapid-fire", "Whispering", "Mechanical", "Stuttering"],
    appearances: ["Disheveled hoodie", "Glasses with taped bridge", "Utility belt", "Business casual (torn)", "Cyberpunk aesthetic"],
    items: ["Encrypted USB drive", "Geiger counter", "Broken smartphone", "Notebook of binary code", "Multimeter"],
    hooks: ["Found a pattern in the static and followed it here.", "Believes this reality is a simulation to be broken."]
  },
  "Haunting": {
    backgrounds: ["Medium", "Local Historian", "Gravekeeper", "Antique Dealer", "Librarian"],
    flaws: ["Superstitious", "Guilt-ridden", "Passive", "Delusional", "Melancholic"],
    quirks: ["Mutters prayers", "Touches wood", "Stares at nothing", "Hums quietly"],
    fears: ["The Dark", "Being Alone", "Reflections", "Possession", "Cold"],
    voices: ["Trembling", "Hushed", "Melodic", "Mournful", "Distant"],
    appearances: ["Victorian gothic", "Faded cardigan", "Always shivering", "Wearing a locket", "Dusty coat"],
    items: ["A planchette", "Vial of holy water", "Photo of a dead relative", "Iron nail", "Sage bundle"],
    hooks: ["Is being followed by a ghost they cannot see.", "Came to apologize to the dead."]
  },
  "Survival": {
    backgrounds: ["Alpinist", "Ex-Military", "Hunter", "Park Ranger", "Geologist"],
    flaws: ["Ruthless", "Hoarder", "Untrusting", "Aggressive", "Desperate"],
    quirks: ["Counts supplies", "Sharpens knife", "Paces", "Sleeps with one eye open"],
    fears: ["Starvation", "Freezing", "Betrayal", "Wild Animals", "Weakness"],
    voices: ["Gruff", "Commanding", "Hoarse", "Silent", "Sharp"],
    appearances: ["Heavy parka", "Camouflage", "Athletic gear", "Bandaged hands", "Sunken eyes"],
    items: ["Compass", "Rusted hunting knife", "Box of waterproof matches", "Paracord bracelet", "Empty flask"],
    hooks: ["Survived a plane crash once; determined to survive this.", "Looking for their lost expedition team."]
  },
  "Blasphemy": {
    backgrounds: ["Defrocked Priest", "Occultist", "Nun", "Art Restorer", "Theology Student"],
    flaws: ["Zealous", "Heretical", "Guilt-ridden", "Arrogant", "Sinful"],
    quirks: ["Quotes scripture", "Clutches rosary", "Laughs inappropriately", "Self-flagellates"],
    fears: ["Hell", "Judgment", "Demons", "Corruption", "God"],
    voices: ["Preachy", "Mocking", "Solemn", "Chanting", "Hysterical"],
    appearances: ["Clerical collar (torn)", "Black robes", "Heavy jewelry", "Covered in ash", "Bleeding palms"],
    items: ["Inverted cross", "Burnt bible pages", "Vial of anointing oil", "Bone fragment", "Silver coin"],
    hooks: ["Sought to find God, but found something else.", "Believes they are the vessel for a new messiah."]
  },
  "Self": {
    backgrounds: ["Method Actor", "Psychologist", "Abstract Artist", "Influencer", "Mirror Maker"],
    flaws: ["Narcissistic", "Dissociative", "Insecure", "Vain", "Envious"],
    quirks: ["Checks reflection", "Talks to self", "Mimics others", "Forgets name"],
    fears: ["Ugliness", "Being Forgotten", "Doppelgangers", "Insanity", "Aging"],
    voices: ["Dramatic", "Childlike", "Echoing", "Sarcastic", "Flat"],
    appearances: ["Glamorous (ruined)", "Bandaged face", "Wearing a mask", "Mismatched clothes", "Perfect makeup"],
    items: ["Hand mirror", "Polaroid camera", "Journal of dreams", "Prescription tranquilizers", "Lipstick"],
    hooks: ["Doesn't know if they are the original or the copy.", "Is documenting their own descent into madness."]
  }
};

const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Generates logical strengths/weaknesses based on background
const generateTraits = (flaw: string, background: string, hobby: string): NpcTraits => {
  const strengths = ["Willpower", "Observation", "Stealth", "Persuasion", "Strength"];
  
  // Add hobby-specific strength
  if (hobby.includes("Lockpicking")) strengths.push("Mechanics");
  if (hobby.includes("Cardio") || hobby.includes("Hiking")) strengths.push("Endurance");
  if (hobby.includes("Chess")) strengths.push("Strategy");
  if (hobby.includes("First Aid")) strengths.push("Medicine");

  return {
    strengths: [pickRandom(strengths), pickRandom(strengths)], // Give 2 strengths now
    weaknesses: [flaw, pickRandom(["Asthma", "Bad Knees", "Poor Eyesight", "Insomnia", "Addiction"])],
    hopes: [pickRandom(["To see the sunrise", "To forgive", "To escape", "To find answers", "To protect someone", "To forget"])]
  };
};

export const generateProceduralNpc = (
  clusterName: string = "Flesh", 
  intensity: string = "R", 
  genderHint?: string
): NpcState => {
  // 1. Resolve Flavor Profile based on Cluster
  let flavor = CLUSTER_FLAVORS[clusterName];
  if (!flavor) {
      const key = Object.keys(CLUSTER_FLAVORS).find(k => clusterName.includes(k));
      flavor = key ? CLUSTER_FLAVORS[key] : CLUSTER_FLAVORS["Flesh"]; 
  }

  // 2. Roll Core Identity
  const firstName = pickRandom(FIRST_NAMES);
  const lastName = pickRandom(LAST_NAMES);
  const fullName = `${firstName} ${lastName}`;
  const background = pickRandom(flavor.backgrounds);
  const hobby = pickRandom(HOBBIES);
  const regret = pickRandom(REGRETS);
  const hook = pickRandom(flavor.hooks);
  
  // 3. Roll Psychological Profile
  const flaw = pickRandom(flavor.flaws);
  const fear = pickRandom(flavor.fears);
  const quirk = pickRandom(flavor.quirks);
  const voiceTone = pickRandom(flavor.voices);
  const appearance = pickRandom(flavor.appearances);
  const totemItem = pickRandom(flavor.items);

  // 4. Construct Narrative Background (The "Deep Texture")
  // Combines background + hobby + regret + fear into a rich origin string with varied templates
  const richOrigin = (() => {
      const b = background;
      const h = hobby.toLowerCase();
      const r = regret.toLowerCase();
      const f = fear.toLowerCase();
      const t = totemItem.toLowerCase();
      
      const templates = [
        `${b}. Devoted to ${h}. Haunted by the fact that they ${r}. ${hook}`,
        `A former ${b.toLowerCase()} who finds solace in ${h}. They harbor a deep shame because they ${r}.`,
        `Driven by a fear of ${f}, this ${b.toLowerCase()} arrived here seeking redemption after they ${r}.`,
        `${hook} In their old life, they were a ${b.toLowerCase()} who ${r}.`,
        `Outwardly a ${b.toLowerCase()}, inwardly a mess of guilt because they ${r}. They clutch a ${t} for comfort.`,
        `${b} with a fixation on ${h}. Terrified of ${f}. They believe this place is punishment because they ${r}.`
      ];
      return pickRandom(templates);
  })();

  // 5. Build Sub-Objects
  const personality: PersonalityProfile = {
      dominant_trait: pickRandom(["Stoic", "Neurotic", "Optimistic", "Cynical", "Aggressive", "Passive", "Analytical"]),
      fatal_flaw: flaw,
      coping_mechanism: pickRandom(["Humor", "Denial", "Prayer", "Analysis", "Violence", "Dissociation", `Obsessing over ${hobby.split(' ')[0]}`]),
      moral_alignment: pickRandom(["Selfish", "Altruistic", "Pragmatic", "Chaotic", "Lawful"])
  };

  const physical: PhysicalFeatures = {
      height: pickRandom(["Short", "Average", "Tall", "Towering", "Lanky"]),
      build: pickRandom(["Thin", "Athletic", "Heavy", "Fraught", "Wiry"]),
      distinguishing_feature: appearance,
      clothing_style: background
  };

  // Determine starting fracture based on regret (Guilt) and random variance
  const startingGuilt = Math.floor(Math.random() * 20);
  const startingFear = Math.floor(Math.random() * 10) + 5;

  const psychology: PsychologicalState = {
      current_thought: "Keep moving. Don't look at the shadows.",
      emotional_state: "Anxious",
      sanity_percentage: 100,
      resilience_level: "Moderate"
  };

  const voice: VoiceProfile = {
      tone: voiceTone,
      vocabulary: [],
      quirks: [quirk],
      forbidden_topics: [fear, regret.split(' ')[0]] // They won't talk about their fear or the subject of their regret
  };

  const traits = generateTraits(flaw, background, hobby);

  // 6. Final Object Assembly
  return {
      name: fullName,
      archetype: background, // "Butcher", "Hacker", etc.
      background_origin: richOrigin, // THE NEW DEEP FIELD
      
      personality,
      physical,
      psychology,
      
      // -- Legacy / Compatibility Fields --
      current_state: "Wandering",
      visual_anchor: appearance,
      
      // Inject starting variance so they don't all start at 0
      fracture_vectors: { 
        fear: startingFear, 
        isolation: 0, 
        guilt: startingGuilt, // Regret fuels this
        paranoia: 0, 
        faith: 0, 
        exhaustion: 0 
      } as FractureVectors,
      
      fracture_state: 0,
      disassociation_index: 0.0,
      primary_goal: "Survive",
      secondary_goal: "Redemption", // Linked to regret
      
      demographics: {
          gender: genderHint || pickRandom(["Male", "Female", "Non-Binary"]),
          age: Math.floor(Math.random() * 40 + 20).toString(),
          appearance: `${appearance}. Carries ${totemItem}.`,
          aesthetic: background
      },
      
      generated_traits: traits,
      
      // Default social state
      relationship_state: { trust: 50, fear: 10, secretKnowledge: false },
      relationships_to_other_npcs: {},
      memory_stream: [],
      current_intent: { goal: 'Survive', target: 'Self', urgency: 1 },
      
      dialogue_state: {
          voice_profile: voice,
          last_topic: "",
          conversation_history: [],
          mood_state: "Neutral"
      },
      
      // Redundant fields kept for type compatibility
      fatal_flaw: flaw,
      specific_fear: fear,
      knowledge_state: [],
      physical_state: "Healthy",
      active_injuries: [],
      willpower: Math.floor(Math.random() * 40) + 30, // 30-70 range
      devotion: Math.floor(Math.random() * 40) + 10,
      
      // The "Totem" is their starting resource
      resources_held: [totemItem],
      
      trust_level: 2,
      agency_level: "Moderate",
      narrative_role: "Victim",
      pain_level: 0,
      shock_level: 0,
      consciousness: "Alert",
      mobility_score: 100,
      manipulation_score: 100,
      perception_score: 100
  };
};
