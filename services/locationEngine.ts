
import { LocationState, GameState } from '../types';

/**
 * THE LOCATION ENGINE V4.0 (Spatial Fidelity & Environmental Persistence)
 */

export const getDefaultLocationState = (cluster: string = "None"): LocationState => ({
    name: "Unknown Space",
    archetype: "Unknown",
    cluster_alignment: cluster,
    current_state: 0,
    dominant_sensory_palette: {
      primary_sense: "Sight",
      secondary_sense: "Sound",
      intensity: "Low"
    },
    time_of_day: "Stagnant",
    weather_state: "Still",
    active_hazards: [],
    hidden_resources: [],
    location_secret: {
      nature: "Unknown",
      revelation_trigger: "Unknown",
      consequence: "Unknown",
      discovery_state: "Hidden"
    },
    spatial_logic: "Euclidean",
    relationship_to_villain: "Neutral",
    fidelity_status: 'Coherent',
    architectural_notes: [],
    entanglement_level: 0
});

/**
 * Updates the location state based on turn progression and threat levels.
 * This is the "independent state tracking" logic.
 */
export const updateLocationState = (currentState: LocationState, gameState: GameState): LocationState => {
    const turn = gameState.meta.turn;
    const threat = gameState.villain_state.threat_scale || 0;

    let newState = { ...currentState };

    // 1. Fidelity Erosion
    // As turn count or threat increases, the location frays.
    if (threat >= 4 || turn > 30) {
        newState.fidelity_status = 'Dissolving';
        newState.spatial_logic = 'Non-Euclidean';
    } else if (threat >= 3 || turn > 15) {
        newState.fidelity_status = 'Corrupted';
    } else if (threat >= 2 || turn > 5) {
        newState.fidelity_status = 'Fraying';
    }

    // 2. Entanglement
    // The machine becomes more "aware" of the specimens.
    newState.entanglement_level = Math.min(100, (turn * 2) + (threat * 10));

    // 3. Narrative Severity (0-3)
    if (newState.entanglement_level > 80) newState.current_state = 3; // Nightmare
    else if (newState.entanglement_level > 50) newState.current_state = 2; // Hostile
    else if (newState.entanglement_level > 20) newState.current_state = 1; // Uncanny
    else newState.current_state = 0; // Safeish

    return newState;
};

/**
 * Constructs a "Location Manifesto" to force Gemini to respect environmental history.
 */
export const constructLocationManifesto = (location: LocationState): string => {
    let manifesto = `\n\n*** L. LOCATION & ARCHITECTURE MANIFESTO (FIDELITY: ${location.fidelity_status.toUpperCase()}) ***\n`;
    manifesto += `CURRENT SPACE: "${location.name}" (${location.archetype}).\n`;
    manifesto += `SPATIAL LOGIC: ${location.spatial_logic}.\n`;
    manifesto += `ENTANGLEMENT: ${location.entanglement_level}% (The architecture is ${location.entanglement_level > 50 ? 'actively predatory' : 'observational'}).\n`;
    
    const notes = Array.isArray(location.architectural_notes) ? location.architectural_notes : [];
    if (notes.length > 0) {
        manifesto += `PERSISTENT DETAILS (DO NOT CONTRADICT):\n`;
        notes.forEach(note => {
            manifesto += ` - ${note}\n`;
        });
    }

    manifesto += `\nENVIRONMENTAL RULES:\n`;
    if (location.fidelity_status === 'Dissolving') {
        manifesto += ` - Geometry is a lie. Rooms loop. Doors open into the sky or the past.\n`;
    }
    if (location.fidelity_status === 'Corrupted') {
        manifesto += ` - Surfaces are reactive. Walls sweat or bleed. Footsteps echo before they are taken.\n`;
    }

    const hazards = Array.isArray(location.active_hazards) ? location.active_hazards : [];
    manifesto += `ACTIVE HAZARDS: ${hazards.join(', ') || 'None perceived'}.\n`;
    manifesto += `ATMOSPHERE: ${location.weather_state} | ${location.time_of_day}.\n`;
    manifesto += `[SYSTEM]: Update 'architectural_notes' if the User modifies the space or new areas are revealed.\n`;
    manifesto += `*** END MANIFESTO ***\n`;

    return manifesto;
};
