
import React, { useState, useEffect } from 'react';
import { Save, Download, Trash2, X, HardDrive, Clock, FileText, ChevronRight } from 'lucide-react';
import { SaveSlot } from '../hooks/useGameEngine';

interface SaveLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => boolean;
  onLoad: (id: string) => boolean;
  onDelete: (id: string) => void;
  getSaves: () => SaveSlot[];
}

export const SaveLoadModal: React.FC<SaveLoadModalProps> = ({ 
    isOpen, onClose, onSave, onLoad, onDelete, getSaves 
}) => {
    const [activeTab, setActiveTab] = useState<'save' | 'load'>('save');
    const [saveName, setSaveName] = useState('');
    const [saves, setSaves] = useState<SaveSlot[]>([]);

    useEffect(() => {
        if (isOpen) {
            setSaves(getSaves());
            setSaveName(`Protocol ${new Date().toLocaleTimeString()}`);
        }
    }, [isOpen, getSaves]);

    const handleSave = () => {
        if (onSave(saveName)) {
            setSaves(getSaves()); // Refresh list
            onClose();
        }
    };

    const handleLoad = (id: string) => {
        if (window.confirm("Overwrite current reality? Unsaved progress will be lost.")) {
            if (onLoad(id)) onClose();
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Delete this timeline permanently?")) {
            onDelete(id);
            setSaves(getSaves());
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 font-mono">
            <div className="bg-[#0a0a0a] border border-gray-800 w-full max-w-2xl max-h-[80vh] flex flex-col rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
                
                {/* Decorative Header */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-system-green to-transparent opacity-20"></div>

                <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-black/50">
                    <div className="flex items-center gap-3 text-system-green">
                        <HardDrive className="w-5 h-5 animate-pulse" />
                        <h2 className="text-lg font-bold uppercase tracking-[0.2em]">Memory Core</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-800">
                    <button 
                        onClick={() => setActiveTab('save')}
                        className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all hover:bg-white/5
                            ${activeTab === 'save' ? 'text-white border-b-2 border-system-green bg-white/5' : 'text-gray-600'}`}
                    >
                        Write to Disk
                    </button>
                    <button 
                        onClick={() => setActiveTab('load')}
                        className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all hover:bg-white/5
                            ${activeTab === 'load' ? 'text-white border-b-2 border-system-green bg-white/5' : 'text-gray-600'}`}
                    >
                        Read Data ({saves.length})
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1 min-h-[300px]">
                    
                    {activeTab === 'save' && (
                        <div className="space-y-8 animate-fadeIn">
                            <div className="space-y-4">
                                <label className="text-xs text-gray-500 uppercase tracking-widest block">Session Identifier</label>
                                <input 
                                    value={saveName}
                                    onChange={(e) => setSaveName(e.target.value)}
                                    className="w-full bg-black border border-gray-700 p-4 text-white focus:border-system-green outline-none font-mono text-sm placeholder-gray-700"
                                    placeholder="Enter save name..."
                                />
                            </div>
                            <div className="p-4 border border-gray-800 bg-gray-900/20 rounded-sm">
                                <div className="text-[10px] text-gray-500 mb-2 uppercase tracking-widest">System Warning</div>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    Committing current state to non-volatile memory. 
                                    Existing narrative threads will be preserved.
                                    Maximum storage capacity is limited by browser constraints.
                                </p>
                            </div>
                            <button 
                                onClick={handleSave}
                                disabled={!saveName.trim()}
                                className="w-full py-4 bg-system-green/10 border border-system-green/50 text-system-green hover:bg-system-green hover:text-black font-bold uppercase tracking-widest text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                <Save className="w-4 h-4" /> Execute Save
                            </button>
                        </div>
                    )}

                    {activeTab === 'load' && (
                        <div className="space-y-3 animate-fadeIn">
                            {saves.length === 0 ? (
                                <div className="text-center py-20 text-gray-600 text-xs uppercase tracking-widest">
                                    No Data Fragments Found
                                </div>
                            ) : (
                                saves.map((slot) => (
                                    <div key={slot.id} className="group border border-gray-800 bg-black/40 hover:border-gray-600 p-4 transition-all flex justify-between items-center">
                                        <div className="space-y-1">
                                            <div className="text-sm text-gray-200 font-bold tracking-wide group-hover:text-system-green transition-colors">{slot.name}</div>
                                            <div className="flex items-center gap-3 text-[10px] text-gray-500 font-mono">
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(slot.timestamp).toLocaleString()}</span>
                                                <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {slot.summary}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleLoad(slot.id)}
                                                className="p-2 border border-gray-700 hover:border-system-green text-gray-400 hover:text-system-green rounded-sm transition-colors"
                                                title="Load"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(slot.id)}
                                                className="p-2 border border-gray-700 hover:border-red-500 text-gray-400 hover:text-red-500 rounded-sm transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
