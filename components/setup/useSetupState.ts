
import { create } from 'zustand';
import { SetupState, SetupActions } from './types';

// Define the store type which combines state and actions
type SetupStore = SetupState & SetupActions;

export const useSetupState = create<SetupStore>((set) => ({
  perspective: 'First Person (Direct Immersion)',
  mode: 'The Survivor (Prey Protocol)',
  startingPoint: 'Prologue',
  selectedClusters: ['Flesh'],
  intensity: 'Level 3',
  visualMotif: '',
  locationDescription: '',
  villainName: '',
  villainAppearance: '',
  villainMethods: '',
  victimDescription: '',
  primaryGoal: '',
  victimCount: 3,
  survivorName: '',
  survivorBackground: '',
  survivorTraits: '',
  parsedCharacters: [],

  setPerspective: (v) => set({ perspective: v }),
  setMode: (v) => set({ mode: v }),
  setStartingPoint: (v) => set({ startingPoint: v }),
  setSelectedClusters: (v) => set((state) => ({ 
    selectedClusters: typeof v === 'function' ? v(state.selectedClusters) : v 
  })),
  setIntensity: (v) => set({ intensity: v }),
  setVisualMotif: (v) => set({ visualMotif: v }),
  setLocationDescription: (v) => set((state) => ({ 
    locationDescription: typeof v === 'function' ? v(state.locationDescription) : v 
  })),
  setVillainName: (v) => set({ villainName: v }),
  setVillainAppearance: (v) => set({ villainAppearance: v }),
  setVillainMethods: (v) => set({ villainMethods: v }),
  setVictimDescription: (v) => set({ victimDescription: v }),
  setPrimaryGoal: (v) => set({ primaryGoal: v }),
  setVictimCount: (v) => set({ victimCount: v }),
  setSurvivorName: (v) => set({ survivorName: v }),
  setSurvivorBackground: (v) => set({ survivorBackground: v }),
  setSurvivorTraits: (v) => set({ survivorTraits: v }),
  setParsedCharacters: (v) => set((state) => ({ 
    parsedCharacters: typeof v === 'function' ? v(state.parsedCharacters) : v 
  })),
}));
