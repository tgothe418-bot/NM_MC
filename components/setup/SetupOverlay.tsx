
import React, { useState } from 'react';
import { SimulationConfig } from '../../types';
import { SetupMode } from './types';
import { ChoiceModeSelector } from './ChoiceModeSelector';
import { GuidedSetup } from './GuidedSetup';
import { ManualSetup } from './ManualSetup';
import { SimulationSetup } from './SimulationSetup';
import { ChatSetup } from './ChatSetup';
import { NpcSelector } from './NpcSelector';

interface SetupOverlayProps {
  onComplete: (config: SimulationConfig) => void;
}

export const SetupOverlay: React.FC<SetupOverlayProps> = ({ onComplete }) => {
  const [setupMode, setSetupMode] = useState<SetupMode>('choice');
  const [pendingConfig, setPendingConfig] = useState<SimulationConfig | null>(null);

  const handleInitialSetupComplete = (config: SimulationConfig) => {
    setPendingConfig(config);
    setSetupMode('npc-selection');
  };

  return (
    <div className="fixed inset-0 z-[100] w-full h-full bg-[#030303] text-gray-200 font-sans overflow-hidden">
        {setupMode === 'choice' && (
            <ChoiceModeSelector onSelect={setSetupMode} />
        )}
        
        {setupMode === 'guided' && (
            <GuidedSetup 
                onComplete={handleInitialSetupComplete} 
                onBack={() => setSetupMode('choice')} 
            />
        )}
        
        {setupMode === 'manual' && (
            <ManualSetup 
                onComplete={handleInitialSetupComplete} 
                onBack={() => setSetupMode('choice')} 
            />
        )}

        {setupMode === 'chat' && (
            <ChatSetup
                onComplete={handleInitialSetupComplete}
                onBack={() => setSetupMode('choice')}
            />
        )}

        {/* Note: Simulation Setup usually skips manual NPC selection as it's a diagnostic tool, keeping direct onComplete */}
        {setupMode === 'simulation' && (
            <SimulationSetup 
                onRun={onComplete} 
                onBack={() => setSetupMode('choice')} 
            />
        )}

        {setupMode === 'npc-selection' && pendingConfig && (
            <NpcSelector 
                config={pendingConfig}
                onConfirm={onComplete}
                onBack={() => setSetupMode('choice')}
            />
        )}
    </div>
  );
};
