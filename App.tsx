
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
import { SystemGhost } from './components/setup/SystemGhost';

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

  // 1. Map Narrative Phase to a scalar multiplier (0.0 to 1.0)
  const phaseMultiplier = {
      'Act1_Setup': 0.1,
      'Act2_RisingAction': 0.5,
      'Act3_Climax': 1.0,
      'Resolution': 0.0
  }[gameState.narrative_state?.currentPhase || 'Act1_Setup'];

  // 2. Extract Player Stress (if available)
  const playerNpc = gameState.npc_states.find(n => n.name === gameState.meta.player_profile?.name);
  const stressLevel = playerNpc ? Math.min(playerNpc.psychology.stress_level / 100, 1.0) : 0;

  // 3. Combine into a global UI Intensity metric
  // Act III forces high intensity, but high stress in Act I can also trigger it.
  const uiIntensity = Math.max(phaseMultiplier, stressLevel);

  // 4. Map Clusters to Base Colors
  const getClusterTheme = (cluster: string) => {
      if (cluster.includes('Flesh')) return '136, 8, 8'; // Deep Red
      if (cluster.includes('System')) return '0, 255, 170'; // Toxic Green
      if (cluster.includes('Haunting')) return '180, 150, 100'; // Desaturated Gold
      if (cluster.includes('Survival')) return '100, 200, 255'; // Frost Blue
      return '100, 100, 100'; // Default Ash
  };

  const dynamicStyles = {
      '--ui-intensity': uiIntensity,
      '--theme-color': getClusterTheme(gameState.meta.active_cluster),
      // We pass the raw RGB values so we can use them with rgba() in CSS
      '--theme-glow': `rgba(var(--theme-color), calc(var(--ui-intensity) * 0.15))`
  } as React.CSSProperties;
  
  return (
    <div style={dynamicStyles} className={`theme-wrapper min-h-screen bg-[#050505] text-gray-200 font-sans relative overflow-hidden transition-colors duration-1000 cluster-${gameState.meta.active_cluster.toLowerCase()}`}>
        <div className="scanlines" />
        <SystemGhost floating={false} className="w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] opacity-20 fixed -bottom-[10%] -right-[5%] pointer-events-none z-0" />
        {!isInitialized && !showSetup && (
            <WelcomeScreen onStart={() => setShowSetup(true)} />
        )}
        
        {showSetup && (
            <SetupOverlay onComplete={(config) => {
                initializeGame(config);
                setShowSetup(false);
            }} />
        )}

        {isInitialized && !showSetup && (
            <div className="flex flex-col lg:flex-row h-screen overflow-hidden relative">
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
        )}
    </div>
  );
}
