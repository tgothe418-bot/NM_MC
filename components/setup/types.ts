
import React from 'react';
import { ParsedCharacter } from '../../types';

export type SetupMode = 'choice' | 'manual' | 'guided' | 'simulation';

export interface GuidedOption {
  id: string;
  label: string;
  sub?: string;
  desc?: string;
  icon?: React.ElementType;
  color?: string;
  tooltip?: string;
}

export interface GuidedQuestion {
  q: string;
  sub?: string;
  key: string;
  type: 'binary' | 'grid' | 'text' | 'list';
  placeholder?: string;
  hasHelper?: boolean;
  options?: GuidedOption[];
}

export interface SetupState {
  perspective: string;
  mode: string;
  startingPoint: string;
  selectedClusters: string[];
  intensity: string;
  visualMotif: string;
  locationDescription: string;
  // Villain
  villainName: string;
  villainAppearance: string;
  villainMethods: string;
  victimDescription: string;
  primaryGoal: string;
  victimCount: number;
  // Survivor
  survivorName: string;
  survivorBackground: string;
  survivorTraits: string;
  // Parsed Data
  parsedCharacters: ParsedCharacter[];
}

export interface SetupActions {
  setPerspective: (v: string) => void;
  setMode: (v: string) => void;
  setStartingPoint: (v: string) => void;
  setSelectedClusters: (v: string[] | ((prev: string[]) => string[])) => void;
  setIntensity: (v: string) => void;
  setVisualMotif: (v: string) => void;
  setLocationDescription: (v: string | ((prev: string) => string)) => void;
  setVillainName: (v: string) => void;
  setVillainAppearance: (v: string) => void;
  setVillainMethods: (v: string) => void;
  setVictimDescription: (v: string) => void;
  setPrimaryGoal: (v: string) => void;
  setVictimCount: (v: number) => void;
  setSurvivorName: (v: string) => void;
  setSurvivorBackground: (v: string) => void;
  setSurvivorTraits: (v: string) => void;
  setParsedCharacters: (v: ParsedCharacter[] | ((prev: ParsedCharacter[]) => ParsedCharacter[])) => void;
}
