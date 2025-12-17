

import { 
  NpcState, 
  PersonalityProfile, 
  PhysicalFeatures, 
  PsychologicalState, 
  VoiceProfile, 
  NpcTraits, 
  FractureVectors,
  Injury,
  MemoryEvent,
  SurvivalInstinct,
  ResilienceLevel
} from '../types';

/**
 * NPC GENERATOR ENGINE (V2.1 - LITERARY EXPANSION)
 * * Generates characters with specific hobbies, regrets, and physical totems 
 * to create immediate narrative buy-in.
 * * Expanded with themes from "Frankenstein", "The Road", and "Exquisite Corpse".
 */

const FIRST_NAMES = [
  "Elias", "Mara", "Jonas", "Silas", "Caleb", "Ivy", "Ezra", "Thalia", "Felix", "Rowan",
  "Iris", "Julian", "Beatrix", "Soren", "Lyra", "Gideon", "Hazel", "Atticus", "Freya", "Miles",
  "August", "Clara", "Jasper", "Ophelia", "Arthur", "Mabel", "Finn", "Elara", "Hugo", "Maeve",
  "Orion", "Nova", "Cyrus", "Salome", "Judah", "Vesper", "Kit", "Remi", "Dahlia", "Bram",
  // Frankenstein Additions
  "Victor", "Justine", "Henry", "Elizabeth", "Robert", "Walton", "Agatha", "Safie", "William", "Alphonse", "Caroline",
  // The Road Additions (Thematic/Implied)
  "Ely", "Boy", "Man", "Papa",
  // Exquisite Corpse Additions
  "Andrew", "Jay", "Luke", "Tran", "Lucas", "Lush", "Birdy", "Johnnie", "Mignon", "Tim",
  // Ketchum Additions
  "Meg", "Susan", "Ruth", "David", "Donny", "Willie", "Woofer", "Eddie", "Claire", "Steven", "Amy", "Peters"
];

const LAST_NAMES = [
  "Vance", "Blackwood", "Thorne", "Holloway", "Crane", "Mercer", "Vale", "Locke", "Winter", "Grave",
  "Cross", "Sterling", "Moss", "Frost", "Pike", "Wolf", "Crow", "Steel", "Reed", "Ash",
  "Hawthorne", "Lovelace", "Sombers", "Nox", "Grimm", "Styx", "Vane", "Kain", "Moriarty",
  // Frankenstein Additions
  "Frankenstein", "Clerval", "Lavenza", "Moritz", "De Lacey", "Waldman", "Krempe", "Kirwin", "Beaufort",
  // The Road Additions
  "Roads", "Gray", "Cinder", "Walker",
  // Exquisite Corpse Additions
  "Compton", "Byrne", "Ransom", "Rimbaud", "Boudreaux", "Carruthers", "Devore",
  // Ketchum Additions
  "Loughlin", "Chandler", "Crocker", "Halbard", "Carey"
];

// Specific, granular hobbies to ground the character
const HOBBIES = [
  "Mycology (Mushrooms)", "Vintage Radio Repair", "Taxidermy", "Lockpicking", "Urban Exploration",
  "Botany", "Violin", "Chess", "Sketching", "Astronomy", "Genealogy", "Origami", 
  "Analog Photography", "Poetry", "Knitting", "Insect Collection", "Watchmaking", "Cryptography",
  // Literary Additions
  "Galvanism", "Anatomy", "Natural Philosophy", "Cartography", "Fire Building", "Flint Knapping", "Scavenging", "Journaling",
  // Exquisite Corpse Additions
  "Cooking (Gourmet)", "Pirate Radio", "Chemistry", "Hacking", "Serial Killer History",
  // Ketchum Additions
  "Painting (Watercolors)", "Collecting Bones", "Hunting", "Computer Programming", "Babysitting"
];

// Dark secrets to fuel the 'Guilt' and 'Paranoia' vectors
const REGRETS = [
  "Left a sibling behind", "Stole money for addiction", "Failed to save a patient", 
  "Cheated on a spouse who died", "Ignored a cry for help", "Sold a family heirloom",
  "Caused a car accident", "Lied in court", "Abandoned a child", "Plagiarized life's work",
  // Literary Additions
  "Created a monster", "Abandoned a creation", "Stole from the dying", "Let the fire go out", 
  "Ate human flesh", "Failed to protect the boy", "Played God", "Seeking the North Pole at the cost of crew",
  // Exquisite Corpse Additions
  "Killed for pleasure", "Infected a lover", "Failed to kill a lover", "Ate a lover", "Escaped prison only to kill again", "Betrayed a friend to a killer",
  // Ketchum Additions
  "Failed to stop the abuse", "Participated in the torture", "Ran away when needed", "Forged a signature", "Left the baby behind"
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
    backgrounds: ["Butcher", "Disgraced Surgeon", "Bodybuilder", "Tattoo Artist", "Veterinarian", "Galvanist", "Reanimator", "Serial Killer"],
    flaws: ["Squeamish", "Hypochondriac", "Masochistic", "Addict", "Gluttonous", "God Complex", "Sadistic"],
    quirks: ["Scratches phantom itches", "Cracks knuckles constantly", "Inspects food suspiciously", "Obsessed with hygiene", "Twitches when lightning flashes", "Licks lips constantly"],
    fears: ["Infection", "Amputation", "Parasites", "Needles", "Suffocation", "Electricity", "The Grave", "Decay"],
    voices: ["Clinical", "Breathless", "Wet/Moist", "Strained", "Detached", "Manic", "British (Cultured)"],
    appearances: ["Pale and sickly", "Overweight and sweating", "Covered in surgical scars", "Immaculate suit", "Blood-stained scrubs", "Stitched-together clothing", "Handsome but cold"],
    items: ["A jar of teeth", "Scalpel wrapped in cloth", "Packet of smelling salts", "Anatomy textbook", "Pills", "Galvanic Battery", "Copper Wire", "Jar of Eyes"],
    hooks: ["Came here to find a cure for a disease that doesn't exist yet.", "Wants to transcend the limitations of skin.", "Believes they can restore life to the dead.", "Looking for the perfect specimen."]
  },
  "System": {
    backgrounds: ["Backend Dev", "Data Clerk", "Electrician", "White Hat Hacker", "Archivist", "Arctic Navigator", "Pirate Radio DJ"],
    flaws: ["Paranoid", "Cold", "Obsessive", "Dissociated", "Calculated", "Hubris", "Nihilistic"],
    quirks: ["Speaks in boolean logic", "Avoids eye contact", "Checks exits", "Taps rhythms on surfaces", "Writes letters to no one", "Hums static"],
    fears: ["Surveillance", "Loss of Identity", "Automation", "Silence", "Mirrors", "Ice"],
    voices: ["Monotone", "Rapid-fire", "Whispering", "Mechanical", "Stuttering", "Raspy"],
    appearances: ["Disheveled hoodie", "Glasses with taped bridge", "Utility belt", "Business casual (torn)", "Cyberpunk aesthetic", "Heavy Furs", "Leather Jacket (Worn)"],
    items: ["Encrypted USB drive", "Geiger counter", "Broken smartphone", "Notebook of binary code", "Multimeter", "Sextant", "Compass", "Microphone"],
    hooks: ["Found a pattern in the static and followed it here.", "Believes this reality is a simulation to be broken.", "Seeking a passage through the ice.", "Broadcasts the end of the world."]
  },
  "Haunting": {
    backgrounds: ["Medium", "Local Historian", "Gravekeeper", "Antique Dealer", "Librarian", "Grieving Parent", "Ex-Convict"],
    flaws: ["Superstitious", "Guilt-ridden", "Passive", "Delusional", "Melancholic"],
    quirks: ["Mutters prayers", "Touches wood", "Stares at nothing", "Hums quietly", "Speaks to the unseen"],
    fears: ["The Dark", "Being Alone", "Reflections", "Possession", "Cold", "The Past", "Prison"],
    voices: ["Trembling", "Hushed", "Melodic", "Mournful", "Distant"],
    appearances: ["Victorian gothic", "Faded cardigan", "Always shivering", "Wearing a locket", "Dusty coat", "Wedding dress (torn)", "Prison fatigues"],
    items: ["A planchette", "Vial of holy water", "Photo of a dead relative", "Iron nail", "Sage bundle", "Miniature Portrait", "Shiv"],
    hooks: ["Is being followed by a ghost they cannot see.", "Came to apologize to the dead.", "Looking for the brother they lost.", "Escaped one prison to find another."]
  },
  "Survival": {
    backgrounds: ["Alpinist", "Ex-Military", "Hunter", "Park Ranger", "Geologist", "Road Pilgrim", "Cart Pusher", "Junkie", "Feral Child"],
    flaws: ["Ruthless", "Hoarder", "Untrusting", "Aggressive", "Desperate", "Starved", "Addicted"],
    quirks: ["Counts supplies", "Sharpens knife", "Paces", "Sleeps with one eye open", "Coughs constantly", "Scratches arms", "Grins for no reason"],
    fears: ["Starvation", "Freezing", "Betrayal", "Wild Animals", "Weakness", "The Cold", "The Ash", "Withdrawal"],
    voices: ["Gruff", "Commanding", "Hoarse", "Silent", "Sharp", "Raspy"],
    appearances: ["Heavy parka", "Camouflage", "Athletic gear", "Bandaged hands", "Sunken eyes", "Layers of rags", "Wearing a facemask", "Needle tracks", "Naked and mud-caked"],
    items: ["Compass", "Rusted hunting knife", "Box of waterproof matches", "Paracord bracelet", "Empty flask", "Flare Pistol", "Tarp", "Can of Peaches", "Syringe (Dirty)", "Bag of Bones"],
    hooks: ["Survived a plane crash once; determined to survive this.", "Looking for their lost expedition team.", "Carrying the fire.", "Just trying to get to the coast."]
  },
  "Blasphemy": {
    backgrounds: ["Defrocked Priest", "Occultist", "Nun", "Art Restorer", "Theology Student", "Mad Scientist", "Apostate"],
    flaws: ["Zealous", "Heretical", "Guilt-ridden", "Arrogant", "Sinful", "Obsessive", "Blasphemous"],
    quirks: ["Quotes scripture", "Clutches rosary", "Laughs inappropriately", "Self-flagellates", "Rants about creation", "Inverts symbols"],
    fears: ["Hell", "Judgment", "Demons", "Corruption", "God", "Lightning"],
    voices: ["Preachy", "Mocking", "Solemn", "Chanting", "Hysterical"],
    appearances: ["Clerical collar (torn)", "Black robes", "Heavy jewelry", "Covered in ash", "Bleeding palms", "Lab coat (stained)"],
    items: ["Inverted cross", "Burnt bible pages", "Vial of anointing oil", "Bone fragment", "Silver coin", "Journal of Experiments", "Relic"],
    hooks: ["Sought to find God, but found something else.", "Believes they are the vessel for a new messiah.", "Tried to create life and failed."]
  },
  "Self": {
    backgrounds: ["Method Actor", "Psychologist", "Abstract Artist", "Influencer", "Mirror Maker", "The Creature", "Writer"],
    flaws: ["Narcissistic", "Dissociative", "Insecure", "Vain", "Envious", "Self-Loathing", "Solipsistic"],
    quirks: ["Checks reflection", "Talks to self", "Mimics others", "Forgets name", "Hides face", "Writes on skin"],
    fears: ["Ugliness", "Being Forgotten", "Doppelgangers", "Insanity", "Aging", "Fire"],
    voices: ["Dramatic", "Childlike", "Echoing", "Sarcastic", "Flat", "Guttural"],
    appearances: ["Glamorous (ruined)", "Bandaged face", "Wearing a mask", "Mismatched clothes", "Perfect makeup", "Hideously deformed", "Ink-stained hands"],
    items: ["Hand mirror", "Polaroid camera", "Journal of dreams", "Prescription tranquilizers", "Lipstick", "The Sorrows of Werter (Book)", "Manuscript"],
    hooks: ["Doesn't know if they are the original or the copy.", "Is documenting their own descent into madness.", "Looking for their creator to ask 'Why?'.", "Writing a biography of a killer."]
  },
  "Desire": {
    backgrounds: ["Drifter", "Runaway", "Poet", "Gigolo", "Chef", "Tourist", "Club Kid", "Complicit Neighbor", "Tortured Captive"],
    flaws: ["Naïve", "Hedonistic", "Dependent", "Obsessive", "Jealous", "Self-Destructive", "Cowardly"],
    quirks: ["Flirts with danger", "Over-shares", "Clings to others", "Smokes elegantly", "Stares too long", "Rubs scars"],
    fears: ["Rejection", "Loneliness", "Ugliness", "Aging", "Being Alone", "Boredom", "Pain", "The Basement"],
    voices: ["Seductive", "Whiny", "Soft", "Purring", "Desperate", "Broken"],
    appearances: ["Beautiful but bruised", "Trendy clothes (torn)", "Androgynous", "Expensive suit", "Punk regalia", "Shirtless", "Wearing ill-fitting borrowed clothes"],
    items: ["Condoms", "Bottle of Wine", "Love Letter", "Silver Jewelry", "Silk Scarf", "Drug Stash", "Jigsaw Puzzle Piece", "Canteen", "Blowtorch"],
    hooks: ["Looking for a love that will consume them.", "Running away from a broken heart.", "Wants to experience everything before they die.", "Just wants the pain to stop."]
  }
};

const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Generates logical strengths/weaknesses based on background
const generateTraits = (flaw: string, background: string, hobby: string): NpcTraits => {
  const strengths = ["Willpower", "Observation", "Stealth", "Persuasion", "Strength"];
  
  // Add hobby-specific strength
  if (hobby.includes("Lockpicking")) strengths.push("Mechanics");
  if (hobby.includes("Cardio") || hobby.includes("Hiking") || hobby.includes("Walking")) strengths.push("Endurance");
  if (hobby.includes("Chess")) strengths.push("Strategy");
  if (hobby.includes("First Aid") || hobby.includes("Anatomy") || hobby.includes("Suturing")) strengths.push("Medicine");
  if (hobby.includes("Galvanism")) strengths.push("Electrical Engineering");
  if (hobby.includes("Scavenging")) strengths.push("Perception");
  if (hobby.includes("Cooking")) strengths.push("Chemistry");
  if (hobby.includes("Hacking")) strengths.push("Technology");
  if (hobby.includes("Painting")) strengths.push("Creativity");
  if (hobby.includes("Hunting")) strengths.push("Marksmanship");

  return {
    strengths: [pickRandom(strengths), pickRandom(strengths)], // Give 2 strengths now
    weaknesses: [flaw, pickRandom(["Asthma", "Bad Knees", "Poor Eyesight", "Insomnia", "Addiction", "Chronic Cough", "Malnutrition"])],
    hopes: [pickRandom(["To see the sunrise", "To forgive", "To escape", "To find answers", "To protect someone", "To forget", "To reach the coast", "To find the father", "To be loved", "To find the baby"])]
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
      dominant_trait: pickRandom(["Stoic", "Neurotic", "Optimistic", "Cynical", "Aggressive", "Passive", "Analytical", "Melancholy", "Sedated"]),
      fatal_flaw: flaw,
      coping_mechanism: pickRandom(["Humor", "Denial", "Prayer", "Analysis", "Violence", "Dissociation", `Obsessing over ${hobby.split(' ')[0]}`, "Counting"]),
      moral_alignment: pickRandom(["Selfish", "Altruistic", "Pragmatic", "Chaotic", "Lawful"])
  };

  const physical: PhysicalFeatures = {
      height: pickRandom(["Short", "Average", "Tall", "Towering", "Lanky", "Emaciated"]),
      build: pickRandom(["Thin", "Athletic", "Heavy", "Fraught", "Wiry", "Skeletal"]),
      distinguishing_feature: appearance,
      clothing_style: background
  };

  // Determine starting fracture based on regret (Guilt) and random variance
  const startingGuilt = Math.floor(Math.random() * 20);
  const startingFear = Math.floor(Math.random() * 10) + 5;
  
  // New Psychological Fields
  const startingInstinct: SurvivalInstinct = pickRandom(['Fight', 'Flight', 'Freeze', 'Fawn']);
  const startingResilience: ResilienceLevel = pickRandom(['High', 'Moderate']);

  const psychology: PsychologicalState = {
      current_thought: "Keep moving. Don't look at the shadows.",
      emotional_state: "Anxious",
      sanity_percentage: 100,
      resilience_level: startingResilience,
      stress_level: 0,
      dominant_instinct: startingInstinct
  };

  const voice: VoiceProfile = {
      tone: voiceTone,
      vocabulary: [],
      quirks: [quirk],
      forbidden_topics: [fear, regret.split(' ')[0]] // They won't talk about their fear or the subject of their regret
  };

  const traits = generateTraits(flaw, background, hobby);

  // 6. Final Object Assembly
  const initialMemory: MemoryEvent = {
    trigger: `Background: ${regret}`,
    impact: 'Trauma',
    turnCount: -1 // Represents pre-simulation history
  };

  return {
      name: fullName,
      archetype: background, 
      background_origin: richOrigin,
      
      personality,
      physical,
      psychology,
      
      current_state: "Wandering",
      visual_anchor: appearance,
      
      fracture_vectors: { 
        fear: startingFear, 
        isolation: 0, 
        guilt: startingGuilt, 
        paranoia: 0, 
        faith: 0, 
        exhaustion: 0 
      } as FractureVectors,
      
      fracture_state: 0,
      disassociation_index: 0.0,
      primary_goal: "Survive",
      secondary_goal: "Redemption",
      
      demographics: {
          gender: genderHint || pickRandom(["Male", "Female", "Non-Binary"]),
          age: Math.floor(Math.random() * 40 + 20).toString(),
          appearance: `${appearance}. Carries ${totemItem}.`,
          aesthetic: background
      },
      
      generated_traits: traits,
      
      relationship_state: { trust: 50, fear: 10, secretKnowledge: false },
      relationships_to_other_npcs: {},
      memory_stream: [initialMemory],
      current_intent: { goal: 'Survive', target: 'Self', urgency: 1 },
      
      dialogue_state: {
          voice_profile: voice,
          last_topic: "",
          conversation_history: [],
          mood_state: "Neutral"
      },
      
      fatal_flaw: flaw,
      specific_fear: fear,
      knowledge_state: [],
      physical_state: "Healthy",
      active_injuries: [],
      willpower: Math.floor(Math.random() * 40) + 30, 
      devotion: Math.floor(Math.random() * 40) + 10,
      
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
