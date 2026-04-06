
import { GameState } from '../types';
import { LORE_LIBRARY } from '../loreLibrary';
import { STYLE_GUIDE } from './styleGuide';

/**
 * THE SENSORY ENGINE (Sensorium V4.1 - Style Aware)
 */

const getRandomElements = (arr: string[], count: number): string[] => {
    if (!arr || arr.length === 0) return [];
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

export const constructSensoryManifesto = (gameState: GameState): string => {
    // 1. Identify Active Cluster
    const activeClusterName = gameState.meta?.active_cluster || "None";
    if (activeClusterName === "None") return "";

    const clusterKey = Object.keys(LORE_LIBRARY).find(key => activeClusterName.includes(key));
    if (!clusterKey) return "";
    const lore = LORE_LIBRARY[clusterKey];
    const style = STYLE_GUIDE.cluster_palettes[clusterKey as keyof typeof STYLE_GUIDE.cluster_palettes] || STYLE_GUIDE.cluster_palettes.Flesh;

    // 2. Determine Intensity
    const locationState = gameState.location_state?.current_state || 0;
    const threatLevel = gameState.villain_state?.threat_scale || 0;
    
    let intensityDescriptor = "SUBTLE / BACKGROUND";
    let quantity = 2; // Reduced quantity for better restraint

    if (locationState >= 3 || threatLevel >= 4) {
        intensityDescriptor = "OVERWHELMING / NIGHTMARE";
        quantity = 4;
    } else if (locationState >= 2 || threatLevel >= 3) {
        intensityDescriptor = "INTENSE / VISCERAL";
        quantity = 3;
    }

    // 3. Select Sensory Seeds
    const smells = getRandomElements(lore.sensoryInjectors.smell, quantity);
    const sounds = getRandomElements(lore.sensoryInjectors.sound, quantity);
    const touches = getRandomElements(lore.sensoryInjectors.touch, quantity);
    const verbs = getRandomElements(style.preferred_verbs, 5); // Inject preferred verbs
    const concepts = getRandomElements(style.key_concepts, 3);

    // 4. Construct the Manifesto
    let manifesto = `\n\n*** SENSORY & STYLE MANIFESTO (CLUSTER: ${lore.displayName.toUpperCase()}) ***\n`;
    manifesto += `AESTHETIC PROTOCOL: ${style.prose_style}\n`;
    manifesto += `CORE CONCEPTS: ${concepts.join(" | ")}\n`;
    
    manifesto += `\nCRITICAL INTEGRATION RULES (STRICT):\n`;
    STYLE_GUIDE.narrative_rules.forEach(rule => {
      manifesto += ` - ${rule}\n`;
    });

    manifesto += `\nVOCABULARY BLACKLIST (NEVER USE THESE VERBATIM):\n`;
    const randomBlacklist = getRandomElements(STYLE_GUIDE.vocabulary_blacklist, 5); 
    STYLE_GUIDE.vocabulary_blacklist.forEach(word => {
      manifesto += ` - "${word}"\n`;
    });
    
    manifesto += `\nPREFERRED VERBS (USE THESE TO DRIVE ACTION):\n`;
    manifesto += ` - ${verbs.join(", ")}\n`;

    manifesto += `\nSENSORY ANCHORS (USE AS CONCEPTUAL SEEDS ONLY):\n`;
    manifesto += ` - SMELL: ${smells.join(", ")}\n`;
    manifesto += ` - SOUND: ${sounds.join(", ")}\n`;
    manifesto += ` - TOUCH: ${touches.join(", ")}\n`;
    
    if (gameState.location_state?.weather_state) {
        manifesto += `\nATMOSPHERE: ${gameState.location_state.weather_state} (Time: ${gameState.location_state.time_of_day})\n`;
    }

    // Integrated Liminal Logic
    if (["System", "Self", "Haunting", "Survival"].some(c => activeClusterName.includes(c))) {
        manifesto += constructLiminalManifesto(activeClusterName);
    }

    manifesto += `\n*** END MANIFESTO ***\n`;

    return manifesto;
};

export const constructLiminalManifesto = (activeClusterName: string): string => {
  // Based on "Liminal Space" aesthetic papers
  const liminalTriggers: Record<string, string[]> = {
    "System": [
      "Anachronistic Technology (CRT TVs, old vending machines)",
      "Endless Server Racks humming in the dark",
      "Fluorescent lights buzzing with a rhythmic pattern"
    ],
    "Haunting": [
      "Functional Mismatch (A playground in a basement)",
      "Furniture covered in dusty white sheets",
      "Acoustic Deadness (Sound does not carry)"
    ],
    "Self": [
      "Mirrors that reflect slightly delayed movements",
      "Infinite Repetition (Hallways that don't end)",
      "Childhood bedrooms perfectly preserved but devoid of color"
    ],
    "Survival": [
      "Abandoned campsites with still-warm embers",
      "Emergency broadcast systems playing on loop",
      "Rations scattered across a blood-stained floor"
    ],
    "Flesh": [
      "Walls that breathe softly",
      "Puddles of unidentifiable viscous fluid",
      "The smell of copper and ozone"
    ],
    "Blasphemy": [
      "Geometric shapes that hurt to look at",
      "Whispers in a language that shouldn't exist",
      "Shadows stretching towards the light source"
    ],
    "Desire": [
      "Velvet ropes leading to nowhere",
      "The scent of cheap perfume and stale sweat",
      "Muzak playing slightly out of tune"
    ]
  };

  const defaultTriggers = [
    "Anachronistic Technology (CRT TVs, old vending machines)",
    "Infinite Repetition (Hallways that don't end)",
    "Functional Mismatch (A playground in a basement)",
    "Acoustic Deadness (Sound does not carry)"
  ];

  const triggersForCluster = liminalTriggers[activeClusterName] || defaultTriggers;
  const selectedTrigger = triggersForCluster[Math.floor(Math.random() * triggersForCluster.length)];
  
  return `
  *** LIMITAL AESTHETIC PROTOCOL ***
  Apply 'Kenopsia': Describe the space as if it is waiting for people who will never arrive.
  Use 'Flat Lighting' and 'Muted Textures'.
  Mandatory Element: ${selectedTrigger}
  `;
};
