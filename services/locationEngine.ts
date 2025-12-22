
import { LocationState, RoomNode } from '../types';

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
