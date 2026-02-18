
import React from 'react';
import { GameState, NpcState } from '../types';
import { RefreshCw, Save, Settings, Activity } from 'lucide-react';
import { useArchitectStore } from '../store/architectStore';

interface StatusPanelProps {
  gameState: GameState;
  onOpenSimulation: () => void;
  isTesting: boolean;
  onAbortTest: () => void;
  onUpdateNpc: (index: number, updates: Partial<NpcState>) => void;
  onReset: () => void;
  onOpenSaveLoad: () => void;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({ 
  gameState, 
  onOpenSimulation, 
  onReset,
  onOpenSaveLoad
}) => {
  const { location_state, npc_states, villain_state } = gameState;
  const { mood } = useArchitectStore();
  const isDread = mood.valence < 0.4;

  return (
    <div className="fixed bottom-0 left-0 w-full lg:w-auto lg:right-[500px] h-16 bg-black border-t border-gray-800 flex items-center px-6 justify-between z-30">
        <div className="flex items-center gap-6">
            <div>
                <div className="text-[10px] uppercase tracking-widest text-gray-500">Location</div>
                <div className="text-sm font-bold text-indigo-400">
                    {location_state.room_map[location_state.current_room_id]?.name || "Unknown Void"}
                </div>
            </div>
            
            <div className="hidden md:block w-px h-8 bg-gray-800" />
            
            <div className="hidden md:block">
                <div className="text-[10px] uppercase tracking-widest text-gray-500">Survivors</div>
                <div className="text-sm font-mono text-gray-300">
                    {npc_states.filter(n => n.psychology.current_thought !== 'Deceased').length} / {npc_states.length}
                </div>
            </div>

            <div className="hidden md:block w-px h-8 bg-gray-800" />

            <div className="hidden md:block">
                <div className="text-[10px] uppercase tracking-widest text-gray-500">Threat</div>
                <div className="text-sm font-bold text-red-500 animate-pulse">
                    {villain_state.name}
                </div>
            </div>

            <div className="hidden lg:block w-px h-8 bg-gray-800" />

            <div className="hidden lg:block">
                <div className="text-[10px] uppercase tracking-widest text-gray-500">Uplink</div>
                <div className={`text-xs font-bold uppercase ${isDread ? 'text-red-500 animate-pulse' : 'text-indigo-400'}`}>
                    {mood.current_vibe} ({Math.round(mood.arousal * 100)}%)
                </div>
            </div>
        </div>

        <div className="flex items-center gap-2">
             <button onClick={onOpenSaveLoad} className="p-2 text-gray-500 hover:text-white transition-colors" title="Save/Load">
                <Save className="w-5 h-5" />
             </button>
             <button onClick={onOpenSimulation} className="p-2 text-gray-500 hover:text-indigo-400 transition-colors" title="Simulation Settings">
                <Activity className="w-5 h-5" />
             </button>
             <button onClick={onReset} className="p-2 text-gray-500 hover:text-red-500 transition-colors" title="Reset Session">
                <RefreshCw className="w-5 h-5" />
             </button>
        </div>
    </div>
  );
};
