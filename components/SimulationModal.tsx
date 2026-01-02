import React, { useState, useEffect } from 'react';
import { X, Play, Loader2, Target, Skull, Wand2, Sparkles, Activity, ShieldAlert } from 'lucide-react';
import { VillainState, SimulationConfig } from '../types';
import { generateCalibrationField } from '../services/geminiService';

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunSimulation: (config: SimulationConfig) => void;
  isTesting: boolean;
  simulationReport: any;
  initialCluster: string;
  currentVillainState: VillainState;
}

export const SimulationModal: React.FC<SimulationModalProps> = ({ 
    isOpen, 
    onClose, 
    onRunSimulation, 
    isTesting, 
    initialCluster, 
    currentVillainState 
}) => {
    // State
    const [mode, setMode] = useState<'Survivor' | 'Villain'>('Survivor');
    const [cycles, setCycles] = useState(10);
    const [intensity, setIntensity] = useState('Level 3');
    
    // Villain Overrides
    const [villainName, setVillainName] = useState('');
    const [villainAppearance, setVillainAppearance] = useState('');
    const [villainMethods, setVillainMethods] = useState(''); 
    const [primaryGoal, setPrimaryGoal] = useState('');
    const [victimDescription, setVictimDescription] = useState('');

    const [generatingFields, setGeneratingFields] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (isOpen && currentVillainState) {
            setVillainName(currentVillainState.name || '');
            setVillainAppearance(currentVillainState.archetype || '');
            setPrimaryGoal(currentVillainState.primary_goal || '');
            setVictimDescription(currentVillainState.victim_profile || '');
        }
    }, [isOpen, currentVillainState]);

    const handleGenerateField = async (field: string, useNotes: boolean = false) => {
        setGeneratingFields(prev => ({ ...prev, [field]: true }));
        try {
            const result = await generateCalibrationField(field, initialCluster, intensity, undefined, useNotes ? (
                field === 'Entity Name' ? villainName :
                field === 'Form & Appearance' ? villainAppearance :
                field === 'Modus Operandi' ? villainMethods :
                field === 'Specimen Targets' ? victimDescription :
                field === 'Primary Objective' ? primaryGoal : ''
            ) : undefined);
            
            if (field === 'Entity Name') setVillainName(result);
            else if (field === 'Form & Appearance') setVillainAppearance(result);
            else if (field === 'Modus Operandi') setVillainMethods(result);
            else if (field === 'Specimen Targets') setVictimDescription(result);
            else if (field === 'Primary Objective') setPrimaryGoal(result);

        } catch (e) {
            console.error(e);
        } finally {
            setGeneratingFields(prev => ({ ...prev, [field]: false }));
        }
    };

    const handleRun = () => {
        const config: SimulationConfig = {
            perspective: 'Third Person',
            mode: mode,
            starting_point: 'In Media Res',
            cluster: initialCluster,
            intensity: intensity,
            cycles: cycles,
            villain_name: villainName,
            villain_appearance: villainAppearance,
            villain_methods: villainMethods,
            primary_goal: primaryGoal,
            victim_description: victimDescription
        };
        onRunSimulation(config);
    };

    const ActionButtons = ({ fieldKey, value }: { fieldKey: string; value: string }) => (
        <div className="flex gap-2">
            <button
                type="button"
                onClick={() => handleGenerateField(fieldKey)}
                disabled={generatingFields[fieldKey]}
                className="p-1 hover:bg-white/5 rounded-sm transition-colors text-gray-500 hover:text-red-500 disabled:opacity-50"
                title={`Generate ${fieldKey}`}
            >
                {generatingFields[fieldKey] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            </button>
            {value?.trim() && (
                <button
                    type="button"
                    onClick={() => handleGenerateField(fieldKey, true)}
                    disabled={generatingFields[fieldKey]}
                    className="p-1 hover:bg-white/5 rounded-sm transition-colors text-gray-500 hover:text-amber-500 disabled:opacity-50"
                    title={`Refine ${fieldKey}`}
                >
                    {generatingFields[fieldKey] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                </button>
            )}
        </div>
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#0a0a0a] border border-gray-800 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-sm shadow-2xl relative">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-800">
                    <div className="flex items-center gap-3 text-red-500">
                        <Activity className="w-5 h-5 animate-pulse" />
                        <h2 className="text-lg font-mono font-bold uppercase tracking-[0.2em]">Simulation Protocols</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    
                    {/* General Settings */}
                    <div className="space-y-4">
                         <div className="flex items-center gap-3 text-gray-400 font-mono text-xs uppercase tracking-widest border-b border-gray-800 pb-2">
                             <ShieldAlert className="w-4 h-4" /> Parameters
                         </div>
                         
                         <div className="grid grid-cols-2 gap-6">
                             <div className="space-y-2">
                                 <label className="text-[10px] text-gray-500 uppercase tracking-widest">Simulation Mode</label>
                                 <div className="flex bg-black border border-gray-800 rounded-sm p-1">
                                     <button 
                                        onClick={() => setMode('Survivor')}
                                        className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider transition-all ${mode === 'Survivor' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:text-gray-400'}`}
                                     >
                                        Survivor
                                     </button>
                                     <button 
                                        onClick={() => setMode('Villain')}
                                        className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider transition-all ${mode === 'Villain' ? 'bg-red-900/30 text-red-500' : 'text-gray-600 hover:text-gray-400'}`}
                                     >
                                        Villain
                                     </button>
                                 </div>
                             </div>

                             <div className="space-y-2">
                                 <label className="text-[10px] text-gray-500 uppercase tracking-widest">Test Cycles</label>
                                 <input 
                                    type="number" 
                                    value={cycles} 
                                    onChange={e => setCycles(parseInt(e.target.value) || 10)} 
                                    className="w-full bg-black border border-gray-800 py-2 px-3 text-gray-200 font-mono text-sm focus:border-red-500 outline-none"
                                 />
                             </div>
                         </div>
                    </div>

                    {/* Villain Overrides (Only if Villain Mode) */}
                    {mode === 'Villain' && (
                         <div className="space-y-6 animate-fadeIn">
                             <div className="flex items-center gap-3 text-red-400 font-mono text-xs uppercase tracking-widest border-b border-red-900/30 pb-2">
                                 <Skull className="w-4 h-4" /> Antagonist Override
                             </div>

                             <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                     <div className="flex justify-between items-center">
                                        <label className="text-[10px] text-gray-500 uppercase tracking-widest">Entity Name</label>
                                        <ActionButtons fieldKey="Entity Name" value={villainName} />
                                     </div>
                                     <input 
                                        value={villainName}
                                        onChange={e => setVillainName(e.target.value)}
                                        className="w-full bg-black border border-gray-800 p-3 text-xs font-mono text-red-100 focus:border-red-500 outline-none placeholder:text-gray-800"
                                        placeholder="Name of the threat..."
                                     />
                                </div>

                                <div className="space-y-2">
                                     <div className="flex justify-between items-center">
                                        <label className="text-[10px] text-gray-500 uppercase tracking-widest">Appearance</label>
                                        <ActionButtons fieldKey="Form & Appearance" value={villainAppearance} />
                                     </div>
                                     <textarea 
                                        value={villainAppearance}
                                        onChange={e => setVillainAppearance(e.target.value)}
                                        className="w-full bg-black border border-gray-800 p-3 text-xs font-mono text-gray-300 focus:border-red-500 outline-none h-20 resize-none placeholder:text-gray-800"
                                        placeholder="Visual description..."
                                     />
                                </div>
                                
                                <div className="space-y-2">
                                     <div className="flex justify-between items-center">
                                        <label className="text-[10px] text-gray-500 uppercase tracking-widest">Methods</label>
                                        <ActionButtons fieldKey="Modus Operandi" value={villainMethods} />
                                     </div>
                                     <textarea 
                                        value={villainMethods}
                                        onChange={e => setVillainMethods(e.target.value)}
                                        className="w-full bg-black border border-gray-800 p-3 text-xs font-mono text-gray-300 focus:border-red-500 outline-none h-20 resize-none placeholder:text-gray-800"
                                        placeholder="Method of operation..."
                                     />
                                </div>
                                
                                <div className="space-y-2">
                                     <div className="flex justify-between items-center">
                                        <label className="text-[10px] text-gray-500 uppercase tracking-widest">Primary Goal</label>
                                        <ActionButtons fieldKey="Primary Objective" value={primaryGoal} />
                                     </div>
                                     <input 
                                        value={primaryGoal}
                                        onChange={e => setPrimaryGoal(e.target.value)}
                                        className="w-full bg-black border border-gray-800 p-3 text-xs font-mono text-gray-300 focus:border-red-500 outline-none placeholder:text-gray-800"
                                        placeholder="Objective..."
                                     />
                                </div>

                                <div className="space-y-2">
                                     <div className="flex justify-between items-center">
                                        <label className="text-[10px] text-gray-500 uppercase tracking-widest">Target Profile</label>
                                        <ActionButtons fieldKey="Specimen Targets" value={victimDescription} />
                                     </div>
                                     <textarea 
                                        value={victimDescription}
                                        onChange={e => setVictimDescription(e.target.value)}
                                        className="w-full bg-black border border-gray-800 p-3 text-xs font-mono text-gray-300 focus:border-red-500 outline-none h-20 resize-none placeholder:text-gray-800"
                                        placeholder="Who are the victims?"
                                     />
                                </div>
                             </div>
                         </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-800 flex justify-end">
                    <button 
                        onClick={handleRun}
                        disabled={isTesting}
                        className="flex items-center gap-3 bg-red-600 hover:bg-red-500 text-black px-6 py-3 font-mono font-bold uppercase tracking-widest text-sm transition-colors rounded-sm disabled:opacity-50"
                    >
                        {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-black" />}
                        {isTesting ? 'Running...' : 'Execute Protocol'}
                    </button>
                </div>
            </div>
        </div>
    );
};