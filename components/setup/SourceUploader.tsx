
import React, { useRef, useState } from 'react';
import { FileUp, Loader2, FileText, X } from 'lucide-react';
import { analyzeSourceMaterial } from '../../services/geminiService';
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
    setSurvivorBackground
  } = useSetupStore();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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
            const result = await analyzeSourceMaterial(file);
            
            if (result.location) {
                 setLocationDescription(prev => prev ? `${prev}\n\n[Location Context from ${file.name}]:\n${result.location}` : result.location);
            }
            if (result.visual_motif && !visualMotif) {
                 setVisualMotif(result.visual_motif);
            }
            if (result.theme_cluster) {
                 const match = KNOWN_CLUSTERS.find(c => result.theme_cluster.toLowerCase().includes(c.toLowerCase()));
                 if (match) {
                     setSelectedClusters(prev => {
                         if (!prev.includes(match)) return [...prev, match];
                         return prev;
                     });
                 }
            }
            if (result.intensity) {
                 const levelMatch = result.intensity.match(/[1-5]/);
                 if (levelMatch) {
                     setIntensity(`Level ${levelMatch[0]}`);
                 }
            }
            if (result.characters && result.characters.length > 0) {
                setParsedCharacters(prev => [...prev, ...result.characters]);
            }
            if (result.plot_hook) {
                setSurvivorBackground(prev => prev ? `${prev}\n\n[SCENARIO CONTEXT / PLOT HOOK]: ${result.plot_hook}` : `[SCENARIO CONTEXT / PLOT HOOK]: ${result.plot_hook}`);
            }
        }
      } catch (err) {
        console.error("Source analysis failed", err);
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
                className={`w-full border-2 border-dashed transition-all relative group cursor-pointer bg-gray-900/20 rounded-sm
                    ${compact ? 'p-3 border-gray-800 hover:border-gray-600' : 'h-full p-6 md:p-8 border-gray-700 hover:border-gray-500 hover:bg-gray-900/40'}
                    ${files.length >= MAX_SOURCE_FILES ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onClick={() => {
                    if (files.length < MAX_SOURCE_FILES) inputRef.current?.click();
                }}
            >
                <div className={`flex items-center justify-center text-center ${compact ? 'flex-row gap-4' : 'flex-col gap-3'}`}>
                    {isAnalyzing ? (
                        <>
                            <Loader2 className={`${compact ? 'w-4 h-4' : 'w-8 h-8'} text-fresh-blood animate-spin`} />
                            <div className="text-xs font-mono uppercase tracking-widest text-fresh-blood animate-pulse">Extracting Data...</div>
                        </>
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
