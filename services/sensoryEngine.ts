
import { GameState } from '../types';
import { LORE_LIBRARY } from '../loreLibrary';

/**
 * THE SENSORY ENGINE (Sensorium V3.0)
 * 
 * This module replaces the static text lists in constants.ts.
 * It dynamically constructs a "Sensory Manifesto" based on the Active Cluster
 * and the current Location State (intensity).
 * 
 * This ensures the LLM stays "in character" for the specific sub-genre of horror
 * (e.g., sticking to "Flesh" descriptions without drifting into "Cosmic" ones).
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

    // Find the matching lore entry
    // Handles "Cluster 1 (Flesh)" matching "Flesh"
    const clusterKey = Object.keys(LORE_LIBRARY).find(key => activeClusterName.includes(key));
    
    if (!clusterKey) return "";
    const lore = LORE_LIBRARY[clusterKey];

    // 2. Determine Intensity based on Location State & Threat
    const locationState = gameState.location_state?.current_state || 0;
    const threatLevel = gameState.villain_state?.threat_scale || 0;
    
    let intensityDescriptor = "SUBTLE / BACKGROUND";
    let quantity = 3; // Number of sensory details to pick

    if (locationState >= 3 || threatLevel >= 4) {
        intensityDescriptor = "OVERWHELMING / NIGHTMARE";
        quantity = 6;
    } else if (locationState >= 2 || threatLevel >= 3) {
        intensityDescriptor = "INTENSE / VISCERAL";
        quantity = 5;
    } else if (locationState >= 1) {
        intensityDescriptor = "UNCANNY / NOTICEABLE";
        quantity = 4;
    }

    // 3. Select Specific Sensory Details
    const smells = getRandomElements(lore.sensoryInjectors.smell, quantity);
    const sounds = getRandomElements(lore.sensoryInjectors.sound, quantity);
    const touches = getRandomElements(lore.sensoryInjectors.touch, quantity);
    
    // 4. Construct the Manifesto String
    let manifesto = `\n\n*** SENSORY ENGINE MANIFESTO (CLUSTER: ${lore.displayName.toUpperCase()}) ***\n`;
    manifesto += `CONTEXT: The user is currently in a ${intensityDescriptor} state of reality.\n`;
    manifesto += `CORE AXIOM: "${lore.coreAxiom}"\n`;
    manifesto += `INSTRUCTION: You MUST weave the following specific sensory details into your response.\n`;
    
    manifesto += `CRITICAL INTEGRATION RULES:\n`;
    manifesto += `   1. **NO RAW DATA**: Do not paste technical terms (like 'Pantone 448 C') or exact list items if they sound mechanical. Transform them into descriptive prose (e.g., 'the color of bruised liver').\n`;
    manifesto += `   2. **SHOW, DON'T TELL**: Do not say "You smell X". Describe the sensation of X filling the lungs.\n`;
    manifesto += `   3. **PALETTE**: Use THESE specific textures:\n`;
    
    manifesto += `   - OLFACTORY (Smell): ${smells.join(", ")}\n`;
    manifesto += `   - AUDITORY (Sound): ${sounds.join(", ")}\n`;
    manifesto += `   - TACTILE (Touch): ${touches.join(", ")}\n`;
    
    // Add weather context if applicable
    if (gameState.location_state?.weather_state) {
        manifesto += `   - ATMOSPHERE: ${gameState.location_state.weather_state} (Time: ${gameState.location_state.time_of_day})\n`;
    }

    // Add visual motif suggestion
    if (gameState.narrative?.visual_motif) {
        manifesto += `   - VISUAL GUIDE: ${gameState.narrative.visual_motif} (Use this as an aesthetic guide, do not quote it verbatim)\n`;
    }

    manifesto += `*** END SENSORY MANIFESTO ***\n`;

    return manifesto;
};
