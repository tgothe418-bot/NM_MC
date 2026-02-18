
import { GameState, NpcState, ChatMessage } from '../types';

/**
 * Scans recent history for interactions involving specific NPCs and updates their memory logs.
 */
export const updateNpcMemories = (
  gameState: GameState, 
  recentHistory: ChatMessage[]
): GameState => {
  const updatedNpcs = gameState.npc_states.map(npc => {
    // Defensive check: If dialogue state is missing, we can't update memory.
    if (!npc.dialogue_state || !npc.dialogue_state.memory) return npc;

    // 1. Filter history for this NPC's name (case-insensitive)
    const relevantChats = recentHistory.filter(msg => 
      msg.text.toLowerCase().includes(npc.name.toLowerCase()) || 
      (msg.role === 'model' && msg.text.includes(npc.name))
    );

    if (relevantChats.length === 0) return npc;

    // 2. Create new memory logs from these interactions
    const newMemories = relevantChats.map(chat => ({
      id: crypto.randomUUID(),
      turn: gameState.meta.turn,
      description: chat.role === 'user' 
        ? `Player said: "${chat.text.slice(0, 100)}..."` 
        : `I acted/said: "${chat.text.slice(0, 100)}..."`,
      emotional_impact: 1, // Default impact, can be enhanced with sentiment analysis later
      involved_actors: ['Player']
    }));

    // 3. Append to existing episodic logs, keeping only the last 10 significant ones
    const existingLogs = npc.dialogue_state.memory.episodic_logs || [];
    const updatedLogs = [...existingLogs, ...newMemories]
      .slice(-10); // Prune old memories to save tokens

    return {
      ...npc,
      dialogue_state: {
        ...npc.dialogue_state,
        memory: {
          ...npc.dialogue_state.memory,
          episodic_logs: updatedLogs
        }
      }
    };
  });

  return {
    ...gameState,
    npc_states: updatedNpcs
  };
};

/**
 * Formats an NPC's memory for the LLM Context Window.
 */
export const constructMemoryContext = (npc: NpcState): string => {
  // Defensive check for missing dialogue state
  if (!npc.dialogue_state || !npc.dialogue_state.memory) return "";

  const mem = npc.dialogue_state.memory;
  const logs = mem.episodic_logs.map(m => `[Turn ${m.turn}]: ${m.description}`).join('\n');
  const facts = mem.known_facts.join('; ');
  
  return `
  [MEMORY MODULE: ${npc.name}]
  > LONG TERM: ${mem.long_term_summary}
  > RECENT EVENTS:
  ${logs}
  > KNOWN FACTS: ${facts}
  > CURRENT OBSESSION: ${npc.psychology.current_thought}
  `;
};