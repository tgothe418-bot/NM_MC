import { LocationState, RoomNode, GameState } from '../types';
import { LORE_LIBRARY } from '../loreLibrary';

const CLUSTER_ARCHITECTURE: Record<string, string[]> = {
  "Flesh": [
    "Bio-mechanical integration with pulsing synthetic muscle walls",
    "Rib-cage vaulted ceilings dripping with nutrient fluid",
    "Floors composed of semi-translucent dermis over rushing veins",
    "Surgical steel reinforcements bolted into bone-like struts",
    "Sphincter-based entryways that react to proximity",
    "Calcified furniture grown from the floor",
    "Ventilation systems that sound like labored breathing"
  ],
  "System": [
    "Brutalist concrete suffocated by infinite server rack monoliths",
    "Bundles of cabling hanging like jungle vines (Cable-rot)",
    "Non-euclidean corridors that loop back on themselves",
    "Sterile chrome surfaces reflecting distorted avatars",
    "Glass floors revealing endless shafts of blue data-light",
    "Walls composed of humming, hot cooling fans",
    "Recursion errors manifesting as flickering architectural geometry"
  ],
  "Haunting": [
    "Victorian decay with wallpaper peeling like dead skin",
    "Impossible angles that hurt the eyes to focus on",
    "Dust-choked parlors where the air is stagnant and cold",
    "Corridors that stretch longer when looked at directly",
    "Floorboards that bleed ancient, dry rot",
    "Windows looking out onto a grey, featureless void",
    "Furniture draped in sheets that seem to breathe"
  ],
  "Self": [
    "Mirrored labyrinths reflecting slight variations of the observer",
    "Replicas of childhood rooms with proportions slightly wrong",
    "Endless liminal hallways with buzzing fluorescent lights",
    "Architecture that dissolves into static when not observed",
    "Doors that lead to the exact same room",
    "Walls covered in framed photos of the observer sleeping",
    "Domestic settings made uncanny by lack of personal detail"
  ],
  "Blasphemy": [
    "Desecrated cathedral architecture inverted and sunk into filth",
    "Altars constructed from industrial waste and bone",
    "Stained glass depicting profane, biological processes",
    "Walls smeared with ritualistic graffiti in unknown scripts",
    "Rust-eaten iron grates covering bottomless pits",
    "Urban decay accelerated to the point of liquefaction",
    "Sacred geometry corrupted into jagged, hurtful shapes"
  ],
  "Survival": [
    "Frozen bunkers with frost-locked blast doors",
    "Natural cave systems smoothed by unnatural winds",
    "Makeshift shelters built from debris and frozen corpses",
    "Industrial infrastructure stripped of all warmth and utility",
    "Wind-scoured stone bridges over glacial crevasses",
    "Observation posts abandoned in the middle of a meal",
    "Metal surfaces so cold they burn skin on contact"
  ],
  "Desire": [
    "Opulent boudoirs where the velvet is damp to the touch",
    "Labyrinthine hotels with too many doors",
    "Overgrown gardens where flowers smell of meat",
    "Ballrooms with gold leaf peeling to reveal raw muscle",
    "Soft, suffocating textiles draping every surface",
    "Mirrors that flatter the subject but darken the background",
    "Furniture designed for restraint rather than comfort"
  ]
};

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
  if (!loc || !loc.room_map) return "";
  const current = loc.room_map[loc.current_room_id];
  if (!current) return "";

  let m = `\n\n*** L. LOCATION MANIFESTO ***\nCURRENT: "${current.name}"\nCACHE: ${current.description_cache}\nEXITS:\n`;
  if (current.exits && Array.isArray(current.exits)) {
    current.exits.forEach(e => {
        let targetName = "UNEXPLORED";
        if (e.target_node_id) {
            const targetRoom = loc.room_map[e.target_node_id];
            targetName = targetRoom ? targetRoom.name : "UNKNOWN_AREA";
        }
        m += ` - ${e.direction}: ${targetName}\n`;
    });
  }
  m += `[SYSTEM]: If entering UNEXPLORED, Simulator MUST generate a NEW node.\n`;
  
  if (loc.architectural_notes && loc.architectural_notes.length > 0) {
      m += `ARCHITECTURAL CONTEXT (Active Details): ${loc.architectural_notes.join(" | ")}\n`;
  }
  
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

  const archThemes = CLUSTER_ARCHITECTURE[clusterKey] || ["Generic", "Decay"];

  return `
    [LOCATION GENERATION PROTOCOL]
    TARGET AESTHETIC: ${lore.displayName}
    MOOD: ${lore.mood}
    PHILOSOPHY: ${lore.philosophy}
    SENSORY PALETTE:
      - Smells: ${smell}
      - Sounds: ${sound}
      - Textures: ${touch}
    ARCHITECTURAL THEMES (Source Material):
      - ${archThemes.join("\n      - ")}
    INTENSITY LEVEL: ${intensity}
    DIRECTIVE: If generating a NEW RoomNode, populate 'description_cache' with specific, high-fidelity details matching this aesthetic. The description should be 2-3 sentences long and evocative.
    UPDATE: Populate 'location_state.architectural_notes' with 3-5 distinct, evocative phrases describing the structural environment. These should be derived from the ARCHITECTURAL THEMES but adapted to the current room context.
  `;
};