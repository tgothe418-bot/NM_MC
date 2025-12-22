
import { LocationState, RoomNode, GameState } from '../types';
import { LORE_LIBRARY } from '../loreLibrary';

export const getDefaultRoom = (id: string = "start_node", name: string = "Initial Void"): RoomNode => ({
  id,
  name,
  archetype: "Unknown",
  description_cache: "",
  exits: [{ direction: "Behind", target_node_id: null }],
  hazards: [],
  items: []
});

export const getDefaultLocationState = (cluster: string = "None"): LocationState => {
  const start = getDefaultRoom();
  return {
    current_room_id: start.id,
    room_map: { [start.id]: start },
    fidelity_status: 'Coherent',
    spatial_logic: 'Euclidean',
    current_state: 0,
    weather_state: 'Still',
    time_of_day: 'Stagnant',
    architectural_notes: []
  };
};

export const constructLocationManifesto = (loc: LocationState): string => {
  const current = loc.room_map[loc.current_room_id];
  if (!current) return "";

  let m = `\n\n*** L. LOCATION MANIFESTO ***\nCURRENT: "${current.name}"\nCACHE: ${current.description_cache}\nEXITS:\n`;
  current.exits.forEach(e => {
    const target = e.target_node_id ? loc.room_map[e.target_node_id].name : "UNEXPLORED";
    m += ` - ${e.direction}: ${target}\n`;
  });
  m += `[SYSTEM]: If entering UNEXPLORED, Simulator MUST generate a NEW node.\n`;
  return m;
};

export const constructRoomGenerationRules = (gameState: GameState): string => {
  const activeCluster = gameState.meta?.active_cluster || "None";
  const clusterKey = Object.keys(LORE_LIBRARY).find(key => activeCluster.includes(key));
  
  if (!clusterKey) return "";
  
  const lore = LORE_LIBRARY[clusterKey];
  const intensity = gameState.meta.intensity_level;
  
  // Select random sensory details to keep it fresh
  const smell = lore.sensoryInjectors.smell.slice(0, 4).join(", ");
  const sound = lore.sensoryInjectors.sound.slice(0, 4).join(", ");
  const touch = lore.sensoryInjectors.touch.slice(0, 4).join(", ");

  return `
    [LOCATION GENERATION PROTOCOL]
    TARGET AESTHETIC: ${lore.displayName}
    MOOD: ${lore.mood}
    PHILOSOPHY: ${lore.philosophy}
    SENSORY PALETTE:
      - Smells: ${smell}
      - Sounds: ${sound}
      - Textures: ${touch}
    INTENSITY LEVEL: ${intensity}
    DIRECTIVE: If generating a NEW RoomNode, populate 'description_cache' with specific, high-fidelity details matching this aesthetic. The description should be 2-3 sentences long and evocative.
  `;
};
