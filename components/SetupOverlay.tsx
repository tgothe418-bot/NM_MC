
import React, { useState } from 'react';
import { SimulationConfig } from '../types';
import { SetupMode } from './setup/types';
import { ChoiceModeSelector } from './setup/ChoiceModeSelector';
import { GuidedSetup } from './setup/GuidedSetup';
import { ManualSetup } from './setup/ManualSetup';
import { SimulationSetup } from './setup/SimulationSetup';

interface SetupOverlayProps {
  onComplete: (config: SimulationConfig) => void;
}

export const SetupOverlay: React.FC<SetupOverlayProps> = ({ onComplete }) => {
  const [setupMode, setSetupMode] = useState<SetupMode>('choice');

  return (
    <div className="fixed inset-0 z-[100] w-full h-full bg-[#030303] text-gray-200 font-sans overflow-hidden">
        {setupMode === 'choice' && <ChoiceModeSelector onSelect={setSetupMode} />}
        {setupMode === 'guided' && <GuidedSetup onComplete={onComplete} onBack={() => setSetupMode('choice')} />}
        {setupMode === 'manual' && <ManualSetup onComplete={onComplete} onBack={() => setSetupMode('choice')} />}
        {setupMode === 'simulation' && <SimulationSetup onRun={onComplete} onBack={() => setSetupMode('choice')} />}
    </div>
  );
};
