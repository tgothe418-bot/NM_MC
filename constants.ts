import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { NarrativePhase, ChatMessage } from '../types';

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

interface NarrativeMetronome {
  currentPhase: NarrativePhase;
  turnCount: number;
}

interface ArchitectState {
  memory: ArchitectMemory;
  mood: ArchitectMood;
  narrative: NarrativeMetronome;
  
  // NEW: Persisted Chat History
  messages: ChatMessage[];
  
  // Actions
  addFact: (fact: string) => void;
  recordInteraction: () => void;
  setUserName: (name: string) => void;
  setContextualMood: (vibe: ArchitectMood['current_vibe']) => void;
  
  // NEW: Message Actions
  addMessage: (message: ChatMessage) => void;
  setMessages: (updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  clearMessages: () => void;

  resetMemory: () => void;
  advancePhase: (newPhase: NarrativePhase) => void;
  incrementTurnCount: () => void;
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
      narrative: {
        currentPhase: 'Act1_Setup',
        turnCount: 0,
      },
      
      // NEW: Initial state for messages
      messages: [],

      addFact: (fact) => set((state) => ({
        memory: { ...state.memory, facts: [...state.memory.facts, fact] }
      })),

      // NEW: Append a message to the history
      addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
      })),

      // NEW: Update messages (supports functional updates)
      setMessages: (updater) => set((state) => ({
        messages: typeof updater === 'function' ? updater(state.messages) : updater
      })),

      // NEW: Clear history if needed
      clearMessages: () => set(() => ({
        messages: []
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

      resetMemory: () => set(() => ({
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
        narrative: {
          currentPhase: 'Act1_Setup',
          turnCount: 0,
        },
        messages: [] // Clear messages on full reset
      })),

      advancePhase: (newPhase) => set((state) => ({
        narrative: { ...state.narrative, currentPhase: newPhase }
      })),

      incrementTurnCount: () => set((state) => ({
        narrative: { ...state.narrative, turnCount: state.narrative.turnCount + 1 }
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