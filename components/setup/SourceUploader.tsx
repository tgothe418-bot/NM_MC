
import React, { useRef, useState } from 'react';
import { FileUp, Loader2, FileText, X } from 'lucide-react';
import { analyzeSourceMaterial } from '../../services/aiOrchestrator';
import { useSetupStore } from './store';

const MAX_SOURCE_FILES = 5;
const KNOWN_CLUSTERS = ['Flesh', 'System', 'Haunting', 'Self', 'Blasphemy', 'Survival', 'Desire'];

interface SourceUploaderProps {
  compact?: boolean;
}

export const SourceUploader: React.FC<SourceUploaderProps> = ({ compact = false }) => {
    const { 
    visualMotif, 
    setLocationDescription, 
    setVisualMotif, 
    setSelectedClusters, 
    setParsedCharacters,
    setIntensity,
    setPlotHook,
    setTransitionGate,
    setVillainName,
    setVillainAppearance,
    setVillainMethods,
    setVictimDescription,
    setPrimaryGoal,
    setVictimCount
  } = useSetupStore();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSourceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = async (newFiles: File[]) => {
      const slotsRemaining = MAX_SOURCE_FILES - files.length;
      const filesToProcess = newFiles.slice(0, slotsRemaining);
      
      if (filesToProcess.length === 0) return;

      setFiles(prev => [...prev, ...filesToProcess]);
      setIsAnalyzing(true);
      
      try {
        for (const file of filesToProcess) {
            const result = await analyzeSourceMaterial(file, (stage) => {
                setAnalysisStatus(stage);
            });
            
            if (result.location) {
                 setLocationDescription(prev => prev ? `${prev}\n\n[Location Context from ${file.name}]:\n${result.location}` : result.location);
            }
            if (result.visual_motif && !visualMotif) {
                 setVisualMotif(String(result.visual_motif));
            } else if (result.aesthetics && !visualMotif) {
                 setVisualMotif(String(result.aesthetics));
            }
            
            if (result.theme_cluster) {
                 const clusterStr = String(result.theme_cluster);
                 const match = KNOWN_CLUSTERS.find(c => clusterStr.toLowerCase().includes(c.toLowerCase()));
                 if (match) {
                     setSelectedClusters(prev => {
                         if (!prev.includes(match)) return [...prev, match];
                         return prev;
                     });
                 }
            }
            if (result.intensity) {
                 const intensityStr = String(result.intensity);
                 const levelMatch = intensityStr.match(/[1-5]/);
                 if (levelMatch) {
                     setIntensity(`Level ${levelMatch[0]}`);
                 }
            }
            if (result.characters && result.characters.length > 0) {
                setParsedCharacters(prev => [...prev, ...result.characters]);
            }
            
            if (result.form_and_appearance) {
                setVillainAppearance(result.form_and_appearance);
            }
            if (result.modus_operandi) {
                setVillainMethods(result.modus_operandi);
            }
            if (result.objectives) {
                setPrimaryGoal(result.objectives);
            }
            if (result.population_count) {
                setVictimCount(Math.min(result.population_count, 10));
            }
            if (result.villains && result.villains.length > 0) {
                setVillainName(result.villains.join(', '));
            }
            if (result.victims && result.victims.length > 0) {
                setVictimDescription(result.victims.join(', '));
            }
            
            if (result) {
                let hookStr = result.plot_hook || "";
                
                // RPP: Inject Prose Calibration
                if (result.rpp_voice_manifesto) {
                    hookStr += `\n\n[VOICE MANIFESTO]: ${result.rpp_voice_manifesto}`;
                }
                // RPP: Inject Vector Mapping
                if (result.rpp_primary_vectors && result.rpp_primary_vectors.length > 0) {
                    hookStr += `\n\n[PSYCHOLOGICAL VECTORS]: Focus narrative friction specifically on the user's ${result.rpp_primary_vectors.join(' and ')}.`;
                }
                
                setPlotHook(prev => prev ? `${prev}\n\n[SOURCE LORE]: ${hookStr}` : `[SOURCE LORE]: ${hookStr}`);
                
                // RPP: Save the Act 1 Transition Gate
                if (result.rpp_transition_gate) {
                    setTransitionGate(result.rpp_transition_gate);
                }
            }

            // Add a more significant delay between files to respect rate limits
            if (filesToProcess.indexOf(file) < filesToProcess.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
      } catch (err: any) {
        console.error("Source analysis failed", err);
        if (err?.message?.includes('429')) {
            alert("The Machine is overwhelmed by this much data. Please wait a moment or try fewer/smaller files.");
        }
      } finally {
        setIsAnalyzing(false);
        if (inputRef.current) inputRef.current.value = '';
      }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={compact ? "space-y-2" : "space-y-4"}>
        <input type="file" ref={inputRef} onChange={handleSourceUpload} className="hidden" accept="image/*,.pdf,.txt,.md,.json" multiple />
        
        <div className={`w-full ${compact ? '' : 'h-full min-h-[100px]'}`}>
            {/* Standard Upload Area */}
            <div 
                className={`w-full border-2 border-dashed transition-all relative group cursor-pointer rounded-sm
                    ${compact ? 'p-3 border-gray-800 hover:border-gray-600' : 'h-full p-6 md:p-8 border-gray-700 hover:border-gray-500 hover:bg-gray-900/40'}
                    ${isAnalyzing ? 'border-fresh-blood/40 bg-fresh-blood/5 shadow-[inset_0_0_20px_rgba(136,8,8,0.1)]' : 'bg-gray-900/20'}
                    ${files.length >= MAX_SOURCE_FILES ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onClick={() => {
                    if (files.length < MAX_SOURCE_FILES) inputRef.current?.click();
                }}
            >
                <div className={`flex items-center justify-center text-center ${compact ? 'flex-row gap-4' : 'flex-col gap-3'}`}>
                    {isAnalyzing ? (
                        <div className={`flex items-center justify-center gap-4 ${compact ? 'flex-row py-2' : 'flex-col py-4'}`}>
                            <div className="relative">
                                <Loader2 className={`${compact ? 'w-5 h-5' : 'w-12 h-12'} text-fresh-blood animate-spin`} />
                                <div className="absolute inset-0 bg-fresh-blood/20 blur-xl animate-pulse rounded-full" />
                            </div>
                            <div className={`space-y-1 ${compact ? 'text-left' : 'text-center'}`}>
                                <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-fresh-blood animate-pulse">
                                    Neural Ingestion Active
                                </div>
                                <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest max-w-[250px] leading-relaxed">
                                    {analysisStatus || "Initializing neural bridge..."}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <FileUp className={`${compact ? 'w-4 h-4' : 'w-8 h-8'} text-gray-500 group-hover:text-gray-300 transition-colors`} />
                            <div className={compact ? "text-left" : ""}>
                                <div className="text-xs font-mono uppercase tracking-widest text-gray-400 group-hover:text-gray-200">
                                    {compact ? "Add External Reference Data" : "Drop Files Here"}
                                </div>
                                {!compact && (
                                    <div className="text-[9px] text-gray-600 font-mono uppercase mt-1">
                                        Text, PDF, Images
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>

        {/* File List - Condensed for Grid view */}
        {files.length > 0 && (
            <div className={`grid gap-3 pt-2 ${compact ? 'grid-cols-4 md:grid-cols-6' : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5'}`}>
                {files.map((file, idx) => (
                    <div key={idx} className={`relative group bg-black border border-gray-800 rounded-sm flex flex-col items-center justify-center overflow-hidden hover:border-fresh-blood/50 transition-colors ${compact ? 'p-1 aspect-square' : 'p-2 aspect-square'}`}>
                        {file.type.startsWith('image/') ? (
                            <img src={URL.createObjectURL(file)} alt="preview" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" />
                        ) : (
                            <FileText className={`${compact ? 'w-4 h-4' : 'w-8 h-8'} text-gray-600 mb-2 group-hover:text-gray-400`} />
                        )}
                        {!compact && (
                            <div className="relative z-10 text-[8px] text-gray-400 font-mono text-center truncate w-full px-1 bg-black/60 py-0.5 mt-auto">
                                {file.name}
                            </div>
                        )}
                        <div className="absolute top-1 right-1 flex gap-1">
                            <button 
                                onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                className="text-gray-500 hover:text-red-500 p-0.5 bg-black/80 rounded-sm border border-gray-700 hover:border-red-500 transition-all"
                                title="Remove Source"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
        
        {files.length > 0 && (
            <div className="flex justify-between items-center text-[9px] font-mono text-gray-600 border-t border-gray-800 pt-2">
                 <span>Sources: {files.length} / {MAX_SOURCE_FILES}</span>
                 <span className="text-system-green animate-pulse">Analysis Pattern Active</span>
            </div>
        )}
    </div>
  );
};
