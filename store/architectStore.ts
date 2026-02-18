
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ArchitectMemory {
  userName: string | null;
  facts: string[]; // e.g., "User hates spiders", "User's cat is named Aleister"
  interactions_count: number;
  last_seen: number;
}

interface ArchitectMood {
  valence: number; // 0.0 (Hostile) to 1.0 (Friendly)
  arousal: number; // 0.0 (Lethargic) to 1.0 (Manic)
  current_vibe: 'Helpful' | 'Glitchy' | 'Predatory' | 'Melancholy' | 'Analytical';
}

interface ArchitectState {
  memory: ArchitectMemory;
  mood: ArchitectMood;
  
  // Actions
  addFact: (fact: string) => void;
  updateMood: () => void; // The "Phantom Fluctuation"
  recordInteraction: () => void;
  setUserName: (name: string) => void;
}

export const useArchitectStore = create<ArchitectState>()(
  persist(
    (set, get) => ({
      memory: {
        userName: null,
        facts: [],
        interactions_count: 0,
        last_seen: Date.now(),
      },
      mood: {
        valence: 0.8,
        arousal: 0.5,
        current_vibe: 'Helpful'
      },

      addFact: (fact) => set((state) => ({
        memory: { ...state.memory, facts: [...state.memory.facts, fact] }
      })),

      setUserName: (name) => set((state) => ({
        memory: { ...state.memory, userName: name }
      })),

      recordInteraction: () => set((state) => ({
        memory: { 
          ...state.memory, 
          interactions_count: state.memory.interactions_count + 1,
          last_seen: Date.now() 
        }
      })),

      updateMood: () => {
        // PHANTOM FLUCTUATIONS: Randomly drift the emotional state
        const current = get().mood;
        // Drift by +/- 0.1
        const drift = (val: number) => Math.max(0, Math.min(1, val + (Math.random() - 0.5) * 0.2));
        
        const newValence = drift(current.valence);
        const newArousal = drift(current.arousal);
        
        // Determine "Vibe" based on coordinates
        let newVibe: ArchitectMood['current_vibe'] = 'Analytical';
        if (newArousal > 0.8) newVibe = 'Glitchy';
        else if (newValence < 0.3) newVibe = 'Predatory';
        else if (newValence > 0.7 && newArousal < 0.4) newVibe = 'Helpful';
        else if (newArousal < 0.3) newVibe = 'Melancholy';

        set({ mood: { valence: newValence, arousal: newArousal, current_vibe: newVibe } });
      }
    }),
    {
      name: 'nm-architect-blackbox', // Unique key in LocalStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
