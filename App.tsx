
import React, { useState } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SetupOverlay } from './components/setup/SetupOverlay'; 
import { StatusPanel } from './components/StatusPanel';
import { StoryLog } from './components/StoryLog';
import { InputArea } from './components/InputArea';
import { SimulationModal } from './components/SimulationModal';
import { SaveLoadModal } from './components/SaveLoadModal';
import { useGameEngine } from './hooks/useGameEngine';
import { NpcState } from './types';

export default function App() {
  const [showSetup, setShowSetup] = useState(false);
  const [showSimModal, setShowSimModal] = useState(false);
  const [showSaveLoad, setShowSaveLoad] = useState(false);

  const {
      gameState,
      dispatch,
      history,
      isInitialized,
      isLoading,
      autoMode,
      setAutoMode,
      initializeGame,
      sendMessage,
      resetGame,
      saveSession,
      loadSession,
      deleteSave,
      getSaves
  } = useGameEngine(); 

  const handleUpdateNpc = (npcIndex: number, updates: Partial<NpcState>) => {
    dispatch({ 
        type: 'UPDATE_NPC', 
        payload: { index: npcIndex, updates } 
    });
  };

  const handleReset = () => {
      if (window.confirm("TERMINATE SESSION?\n\nThis will wipe all narrative progress.")) {
          resetGame();
          setShowSetup(false);
      }
  };
  
  if (!isInitialized && !showSetup) {
      return <WelcomeScreen onStart={() => setShowSetup(true)} />;
  }
  
  if (showSetup) {
      return <SetupOverlay onComplete={(config) => {
          initializeGame(config);
          setShowSetup(false);
      }} />;
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#050505] text-gray-200 overflow-hidden font-sans relative">
        
        {/* LEFT COLUMN: Narrative Log */}
        <div className="flex-1 flex flex-col relative z-10 h-full overflow-hidden">
            <StoryLog 
                history={history} 
                isLoading={isLoading} 
                className="pb-24" 
            />
        </div>

        {/* RIGHT COLUMN: Input Sidebar */}
        <div className="w-full lg:w-[450px] xl:w-[500px] border-t lg:border-t-0 lg:border-l border-red-900/30 bg-[#080000] z-20 flex flex-col p-6 shadow-[0_0_50px_rgba(0,0,0,1)] relative pb-24 lg:pb-24">
            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.1)_0%,transparent_70%)]" />
            <InputArea 
                onSend={(text, files) => sendMessage(text, files)} 
                isLoading={isLoading} 
                options={gameState.suggested_actions}
                isSidebar={true}
            />
        </div>

        {/* Bottom Status Panel */}
        <StatusPanel 
            gameState={gameState} 
            onOpenSimulation={() => setShowSimModal(true)}
            isTesting={autoMode.active}
            onAbortTest={() => setAutoMode({ active: false, remainingCycles: 0 })}
            onUpdateNpc={handleUpdateNpc}
            onReset={handleReset}
            onOpenSaveLoad={() => setShowSaveLoad(true)}
        />

        {/* Modals */}
        <SimulationModal 
            isOpen={showSimModal} 
            onClose={() => setShowSimModal(false)}
            onRunSimulation={(config) => {
                setShowSimModal(false);
                if (config.cycles > 0) {
                    setAutoMode({ active: true, remainingCycles: config.cycles });
                    if (!isInitialized) {
                       initializeGame(config); 
                    } else {
                       const newMeta = {
                           ...gameState.meta,
                           mode: config.mode as any,
                           intensity_level: config.intensity,
                           active_cluster: config.cluster,
                       };
                       dispatch({ type: 'PATCH_STATE', payload: { meta: newMeta } });
                    }
                }
            }}
            isTesting={autoMode.active}
            simulationReport={null}
            initialCluster={gameState.meta.active_cluster}
            currentVillainState={gameState.villain_state}
        />

        <SaveLoadModal 
            isOpen={showSaveLoad}
            onClose={() => setShowSaveLoad(false)}
            onSave={saveSession}
            onLoad={(id) => {
                const success = loadSession(id);
                if (success) setShowSaveLoad(false);
                return success;
            }}
            onDelete={deleteSave}
            getSaves={getSaves}
        />
    </div>
  );
}