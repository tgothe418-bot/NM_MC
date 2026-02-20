import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ArchitectMemory {
  userName: string | null;
  facts: string[]; 
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
  recordInteraction: () => void;
  setUserName: (name: string) => void;
  setContextualMood: (vibe: ArchitectMood['current_vibe']) => void; // New Action
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

      // THE UPDATED MOOD SETTER (LLM Controlled)
      setContextualMood: (targetVibe) => {
        set((state) => {
            let newArousal = 0.5;
            let newValence = 0.5;

            // Map vibes to visual energy levels
            switch (targetVibe) {
                case 'Glitchy': newArousal = 0.9; newValence = 0.5; break;
                case 'Predatory': newArousal = 0.7; newValence = 0.1; break;
                case 'Melancholy': newArousal = 0.2; newValence = 0.4; break;
                case 'Helpful': newArousal = 0.6; newValence = 0.9; break;
                case 'Analytical': newArousal = 0.4; newValence = 0.6; break;
            }

            return { 
                mood: { 
                    current_vibe: targetVibe, 
                    arousal: newArousal, 
                    valence: newValence 
                } 
            };
        });
      }
    }),
    {
      name: 'nm-architect-blackbox',
      storage: createJSONStorage(() => localStorage),
    }
  )
);