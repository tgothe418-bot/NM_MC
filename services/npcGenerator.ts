
import { 
  NpcState, 
  NpcTraits, 
} from '../types';
import { getDefaultDialogueState } from './dialogueEngine';

/**
 * NPC GENERATOR ENGINE (V3.1 - ANCESTRAL SINS & PSYCHOLOGICAL EXCAVATION)
 */

const FIRST_NAMES = ["Elias", "Mara", "Jonas", "Silas", "Caleb", "Ivy", "Ezra", "Thalia", "Felix", "Rowan", "Iris", "Julian", "Beatrix", "Soren", "Lyra", "Gideon", "Hazel", "Atticus", "Freya", "Miles", "August", "Clara", "Jasper", "Ophelia", "Arthur", "Mabel", "Finn", "Elara", "Hugo", "Maeve", "Orion", "Nova", "Cyrus", "Salome", "Judah", "Vesper", "Kit", "Remi", "Dahlia", "Bram", "Victor", "Justine", "Henry", "Elizabeth", "Robert", "Walton", "Agatha", "Safie", "William", "Alphonse", "Ely", "Boy", "Man", "Papa", "Andrew", "Jay", "Luke", "Tran", "Lucas", "Lush", "Birdy", "Johnnie", "Meg", "Susan", "Ruth", "David", "Donny", "Willie", "Eddie", "Claire", "Steven", "Amy"];
const LAST_NAMES = ["Vance", "Blackwood", "Thorne", "Holloway", "Crane", "Mercer", "Vale", "Locke", "Winter", "Grave", "Cross", "Sterling", "Moss", "Frost", "Pike", "Wolf", "Crow", "Steel", "Reed", "Ash", "Hawthorne", "Lovelace", "Sombers", "Nox", "Grimm", "Styx", "Vane", "Kain", "Moriarty", "Frankenstein", "Clerval", "Lavenza", "Moritz", "De Lacey", "Waldman", "Krempe", "Kirwin", "Beaufort", "Loughlin", "Chandler", "Crocker", "Halbard", "Carey", "Compton", "Byrne", "Ransom", "Rimbaud", "Devore"];

const HOBBIES = ["Mycology", "Radio Repair", "Taxidermy", "Lockpicking", "Urban Exploration", "Botany", "Violin", "Chess", "Sketching", "Astronomy", "Genealogy", "Origami", "Photography", "Poetry", "Knitting", "Insect Collection", "Watchmaking", "Cryptography", "Anatomy", "Natural Philosophy", "Cartography", "Fire Building", "Scavenging", "Journaling", "Gourmet Cooking", "Hacking", "Serial Killer History"];

const ANCESTRAL_SINS = [
  "They watched their younger sibling drown in an icy lake to ensure there were enough inheritance funds for themselves.",
  "They were the secret source for a tabloid that drove a beloved local teacher to public suicide.",
  "They performed a botched amateur abortion in a college dorm that resulted in a permanent haunting of their guilt.",
  "They stole the life-savings of a terminal patient while working as an orderly, buying a car they later crashed.",
  "They abandoned their platoon in the desert, taking the only working radio and water supply for their own escape.",
  "They systematically gaslit their own mother into a psychiatric ward to sell her ancestral estate.",
  "They were once part of a 'cleaning crew' for a high-profile murderer, disposing of evidence that included a child's shoe.",
  "They sold their child's location to a debt collector to settle their own gambling debts.",
  "They poisoned a rival's crops with industrial runoff, leading to a localized famine in their home village.",
  "They falsified evidence that sent an innocent man to death row, all for a minor promotion in the DA's office.",
  "They participated in 'Specimen Technics', assisting a rogue researcher in measuring the neural response to prolonged psychological degradation.",
  "They recorded a sexual assault and used it as collateral to secure a corporate merger.",
  "They deliberately caused a high-speed pileup on a highway to film the 'visceral reality' for a snuff-adjacent art project."
];

interface ClusterFlavor {
  backgrounds: string[];
  flaws: string[];
  voices: string[];
  appearances: string[];
  items: string[];
  hooks: string[];
}

const CLUSTER_FLAVORS: Record<string, ClusterFlavor> = {
  "Flesh": { backgrounds: ["Disgraced Anatomist", "Abattoir Owner", "Galvanist", "Body-Mod Artist"], flaws: ["Sadistic", "God Complex"], voices: ["Hushed", "Clinical"], appearances: ["Surgical silk", "Skin like paper"], items: ["Silver probes", "Formaldehyde jar"], hooks: ["Dissection of the ego", "Replacing the lost body"] },
  "System": { backgrounds: ["Ontological Coder", "Signal Analyst", "Transhumanist"], flaws: ["Solipsistic", "Paranoid"], voices: ["Monotone", "Static hiss"], appearances: ["Utility jacket", "Reflective lenses"], items: ["Encrypted drive", "Signal scanner"], hooks: ["Found a coordinate in static", "Upload consciousness"] },
  "Haunting": { backgrounds: ["Defrocked Exorcist", "Grieving Medium", "Antique Forger"], flaws: ["Superstitious", "Guilt-ridden"], voices: ["Mournful", "Echoing"], appearances: ["Faded funeral wear", "Bruised eyes"], items: ["Locket of hair", "Silver coin"], hooks: ["Carrying a spirit", "Purgatory belief"] },
  "Survival": { backgrounds: ["Feral Pilgrim", "Cannibal Matriarch", "Ex-Military Deserter"], flaws: ["Ruthless", "Hoarder"], voices: ["Hoarse", "Animalistic"], appearances: ["Rotted furs", "Sharpened teeth"], items: ["Bag of bones", "Human jerky"], hooks: ["Eaten loved ones", "Carrying the fire"] }
};

const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const generateProceduralNpc = (clusterName: string = "Flesh", intensity: string = "R", startingPoint: string = "Prologue"): NpcState => {
  let flavor = CLUSTER_FLAVORS[clusterName] || CLUSTER_FLAVORS["Flesh"];
  const isExtreme = intensity === "Extreme";
  const isPrologue = startingPoint === "Prologue";

  const firstName = pickRandom(FIRST_NAMES);
  const lastName = pickRandom(LAST_NAMES);
  const sin = pickRandom(ANCESTRAL_SINS);
  const background = pickRandom(flavor.backgrounds);
  
  // Depth increases exponentially for Extreme/Prologue
  const richOrigin = (isExtreme || isPrologue)
    ? `**GENESIS TRAUMA**: Before the Machine, this was ${firstName} ${lastName}, a ${background.toLowerCase()}. Their hobby of ${pickRandom(HOBBIES).toLowerCase()} was a mask for a darker truth. ${sin} They are a complicit specimen, and the simulation knows their scent.`
    : `${background}. Haunted by the past. They once ${pickRandom(["lied to a friend", "stole a watch", "broke a promise"]).toLowerCase()}.`;

  return {
      name: `${firstName} ${lastName}`,
      archetype: background,
      background_origin: richOrigin,
      personality: {
          dominant_trait: pickRandom(["Nihilistic", "Aggressive", "Clinical", "Manic"]),
          fatal_flaw: pickRandom(flavor.flaws),
          coping_mechanism: pickRandom(["Prayer", "Dissociation", "Violence", "Self-Harm"]),
          moral_alignment: isExtreme ? "Tainted" : "Neutral"
      },
      physical: {
          height: pickRandom(["Lanky", "Emaciated", "Stocky"]),
          build: pickRandom(["Wiry", "Skeletal", "Slight"]),
          distinguishing_feature: pickRandom(flavor.appearances),
          clothing_style: background
      },
      psychology: {
          current_thought: isExtreme ? "The sins of the father are finally here." : "Just keep moving.",
          emotional_state: isExtreme ? "Crushing Guilt" : "Anxious",
          sanity_percentage: isExtreme ? 60 : 100,
          resilience_level: isExtreme ? 'Fragile' : 'Moderate',
          stress_level: isExtreme ? 45 : 0,
          dominant_instinct: isExtreme ? 'Aggression' : pickRandom(['Fight', 'Flight', 'Freeze', 'Fawn'])
      },
      current_state: "Dormant",
      fracture_vectors: { fear: isExtreme ? 40 : 10, isolation: 30, guilt: isExtreme ? 80 : 10, paranoia: 20 },
      fracture_state: 0,
      disassociation_index: 0.0,
      secondary_goal: "Atonement",
      relationship_state: { trust: 25, fear: 25, secretKnowledge: isExtreme },
      relationships_to_other_npcs: {},
      memory_stream: [],
      current_intent: { goal: 'Survive', target: 'Self', urgency: 5 },
      dialogue_state: {
          ...getDefaultDialogueState(richOrigin),
          voice_profile: { tone: pickRandom(flavor.voices), vocabulary: [], quirks: [], forbidden_topics: [] },
          current_social_intent: isExtreme ? 'DEBASE' : 'OBSERVE'
      },
      knowledge_state: [],
      physical_state: "Tense",
      active_injuries: [],
      willpower: isExtreme ? 25 : 60,
      devotion: isExtreme ? 15 : 40,
      resources_held: [pickRandom(flavor.items)],
      trust_level: 1,
      agency_level: "Low",
      narrative_role: "Sacrifice",
      pain_level: 0,
      shock_level: 0,
      consciousness: "Alert",
      mobility_score: 100,
      manipulation_score: 100,
      perception_score: 100
  };
};
