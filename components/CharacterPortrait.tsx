
import React, { useState } from 'react';
import { User, RefreshCw, ZoomIn, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { NpcState } from '../types';
import { generateNpcPortrait } from '../services/geminiService';

interface CharacterPortraitProps {
    npc: NpcState;
    onUpdateNpc: (updates: Partial<NpcState>) => void;
}

export const CharacterPortrait: React.FC<CharacterPortraitProps> = ({ npc, onUpdateNpc }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleGenerate = async (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setIsGenerating(true);
        try {
            const url = await generateNpcPortrait(npc);
            if (url) {
                onUpdateNpc({ portrait_url: url });
            }
        } catch (error) {
            console.error("Portrait error", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="relative group/portrait">
            {/* Thumbnail View */}
            <div 
                className="w-12 h-12 rounded bg-black border border-gray-800 overflow-hidden relative cursor-pointer hover:border-gray-500 transition-colors"
                onClick={toggleExpand}
            >
                {npc.portrait_url ? (
                    <img src={npc.portrait_url} alt={npc.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700 bg-gray-900">
                        {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <User className="w-6 h-6" />}
                    </div>
                )}
                
                {/* Hover Overlay for Generation if Missing */}
                {!npc.portrait_url && !isGenerating && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/portrait:opacity-100 flex items-center justify-center transition-opacity">
                        <button 
                            onClick={handleGenerate}
                            className="text-gray-300 hover:text-white"
                            title="Generate Neural Portrait"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Expanded Modal */}
            {isExpanded && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn"
                    onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                >
                    <div 
                        className="bg-black border border-gray-700 max-w-lg w-full rounded-sm shadow-2xl relative flex flex-col overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-900/50">
                            <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-gray-200">{npc.name}</h3>
                            <button onClick={() => setIsExpanded(false)} className="text-gray-500 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Main Content */}
                        <div className="flex flex-col md:flex-row">
                            {/* Large Image Area */}
                            <div className="w-full md:w-1/2 aspect-square bg-gray-900 relative border-b md:border-b-0 md:border-r border-gray-800 group/image">
                                {npc.portrait_url ? (
                                    <img src={npc.portrait_url} alt={npc.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 gap-4">
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="w-10 h-10 animate-spin text-system-green" />
                                                <span className="text-xs font-mono uppercase tracking-widest animate-pulse">Synthesizing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <ImageIcon className="w-12 h-12 opacity-20" />
                                                <button 
                                                    onClick={handleGenerate}
                                                    className="px-4 py-2 border border-gray-700 hover:border-system-green hover:text-system-green transition-colors text-xs font-mono uppercase tracking-widest rounded-sm"
                                                >
                                                    Generate Portrait
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                                
                                {npc.portrait_url && !isGenerating && (
                                     <button 
                                        onClick={handleGenerate}
                                        className="absolute bottom-4 right-4 p-2 bg-black/60 backdrop-blur border border-gray-600 hover:border-white text-gray-300 hover:text-white rounded-full opacity-0 group-hover/image:opacity-100 transition-opacity"
                                        title="Regenerate Portrait"
                                     >
                                         <RefreshCw className="w-4 h-4" />
                                     </button>
                                )}
                            </div>

                            {/* Details Panel */}
                            <div className="w-full md:w-1/2 p-6 space-y-6 overflow-y-auto max-h-[60vh] custom-scrollbar bg-black/20">
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em] border-b border-gray-800 pb-1">Physical Profile</h4>
                                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-300">
                                        <div>
                                            <span className="text-gray-600 block text-[9px] uppercase tracking-wider mb-0.5">Build</span>
                                            {npc.physical?.build || "Unknown"}
                                        </div>
                                        <div>
                                            <span className="text-gray-600 block text-[9px] uppercase tracking-wider mb-0.5">Height</span>
                                            {npc.physical?.height || "Unknown"}
                                        </div>
                                        <div>
                                            <span className="text-gray-600 block text-[9px] uppercase tracking-wider mb-0.5">Hair</span>
                                            {npc.physical?.hair_style || "Unknown"}
                                        </div>
                                        <div>
                                            <span className="text-gray-600 block text-[9px] uppercase tracking-wider mb-0.5">Eyes</span>
                                            {npc.physical?.eye_color || "Unknown"}
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-gray-600 block text-[9px] uppercase tracking-wider mb-0.5">Distinguishing Feature</span>
                                            <span className="text-white italic">"{npc.physical?.distinguishing_feature || "None"}"</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-gray-600 block text-[9px] uppercase tracking-wider mb-0.5">Attire</span>
                                            {npc.physical?.clothing_style || "Unknown"}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em] border-b border-gray-800 pb-1">Current Status</h4>
                                    <div className="text-xs space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Emotional State</span>
                                            <span className={`uppercase font-bold ${npc.psychology.stress_level > 70 ? 'text-red-500' : 'text-gray-300'}`}>
                                                {npc.psychology?.emotional_state || "Neutral"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                             <span className="text-gray-500">Injuries</span>
                                             <span className="text-right text-red-400">
                                                {npc.active_injuries.length > 0 ? npc.active_injuries.length : "None"}
                                             </span>
                                        </div>
                                        {npc.active_injuries.length > 0 && (
                                            <ul className="pl-2 border-l border-red-900/30 space-y-1 mt-1">
                                                {npc.active_injuries.map((inj, i) => (
                                                    <li key={i} className="text-[10px] text-gray-400 italic">
                                                        {inj.location} ({inj.type})
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
