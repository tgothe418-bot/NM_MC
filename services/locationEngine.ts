
import { LocationState, RoomNode, GameState, GridLayout } from '../types';
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

const renderAsciiMap = (layout: GridLayout): string => {
    if (!layout || !layout.cells) return "[Map Corrupted]";
    
    let map = "";
    // Header (X coords)
    map += "   ";
    for(let x=0; x<layout.width; x++) map += `${x} `;
    map += "\n";

    for (let y = 0; y < layout.height; y++) {
        map += `${y}  `; // Y coord
        for (let x = 0; x < layout.width; x++) {
            // Safety check for row existence
            if (!layout.cells[y]) {
                map += "? "; 
                continue;
            }
            
            const cell = layout.cells[y][x];
            
            // Safety check for cell existence (prevents crash on undefined access)
            if (!cell) {
                map += "X ";
                continue;
            }

            let symbol = ". ";
            
            if (cell.occupant_id === 'Player') symbol = "P ";
            else if (cell.occupant_id) symbol = "E "; // Entity
            else {
                switch(cell.type) {
                    case 'Wall': symbol = "# "; break;
                    case 'Void': symbol = "  "; break;
                    case 'Hazard': symbol = "! "; break;
                    case 'Cover': symbol = "∆ "; break; // Delta for cover
                    default: symbol = ". "; // Floor
                }
            }
            map += symbol;
        }
        map += "\n";
    }
    return map;
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
  const current = loc.room_map[loc.current_room_id] as RoomNode | undefined;
  if (!current) return "";

  let m = `\n\n*** L. LOCATION MANIFESTO ***\nCURRENT: "${current.name}"\nCACHE: ${current.description_cache}\n`;
  
  if (current.grid_layout) {
      m += `\n[SPATIAL AWARENESS - CURRENT GRID]\n`;
      m += `Legend: P=Player, E=Entity, #=Wall, .=Floor, !=Hazard, ∆=Cover\n`;
      m += renderAsciiMap(current.grid_layout);
      m += `\n`;
  }

  m += `EXITS:\n`;
  if (current.exits && Array.isArray(current.exits)) {
    current.exits.forEach(e => {
        let targetName = "UNEXPLORED";
        if (e.target_node_id) {
            const targetRoom = loc.room_map[e.target_node_id] as RoomNode | undefined;
            targetName = targetRoom ? targetRoom.name : "UNKNOWN_AREA";
        }
        m += ` - ${e.direction}: ${targetName}\n`;
    });
  }
  m += `[SYSTEM]: If entering UNEXPLORED, Simulator MUST generate a NEW node with a NEW 'grid_layout'.\n`;
  
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

  // DYNAMIC FRACTURE LOGIC (Phase 3)
  // Retrieve fracture from the player object (fallback to 0)
  const playerName = gameState.meta.player_profile?.name;
  const playerNpc = gameState.npc_states.find(n => n.name === playerName);
  // Also check meta.player_profile.fracture_state if set (per new Schema)
  const fracture = gameState.meta.player_profile?.fracture_state || playerNpc?.fracture_state || 0;

  let fractureCriticals = "";
  if (fracture > 90) {
      fractureCriticals = `
      [CRITICAL: FRACTURE STATE ${fracture}% - REALITY COLLAPSE]
      - GEOMETRY: Non-Euclidean. Hallways loop endlessly. Up is down.
      - DOORS: Lead back to the current room.
      - HAZARDS: Phantom. Damage from sources that aren't there.
      `;
  } else if (fracture > 70) {
      fractureCriticals = `
      [WARNING: FRACTURE STATE ${fracture}% - SPATIAL DISTORTION]
      - GEOMETRY: Distances are wrong. 3 meters looks like 30.
      - ATMOSPHERE: Oppressive, shifting.
      `;
  }

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
    
    ${fractureCriticals}

    [MANDATORY OUTPUTS]
    1. 'description_cache': 2-3 evocative sentences matching the Aesthetic.
    2. 'grid_layout': A JSON object defining the room's shape.
       - If ${clusterKey} == 'System' or 'Flesh': Use tight, claustrophobic corridors (3x6 or 4x4).
       - If ${clusterKey} == 'Survival' or 'Haunting': Use wider spaces with 'Void' edges (6x6 or 7x5).
       - Populate 'cells' with Hazards relevant to the theme (e.g. Bio-waste for Flesh, Live Wires for System).
    3. 'architectural_notes': 3-5 distinct features derived from themes.
  `;
};
