
import React, { useRef, useState } from 'react';
import { FileUp, Loader2, FileText, X } from 'lucide-react';
import { analyzeSourceMaterial } from '../../services/geminiService';
import { useSetupStore } from './store';

const MAX_SOURCE_FILES = 5;

// Valid clusters matching the keys in ManualSetup/Global Types
const KNOWN_CLUSTERS = ['Flesh', 'System', 'Haunting', 'Self', 'Blasphemy', 'Survival', 'Desire'];

export const SourceUploader: React.FC = () => {
  const { 
    visualMotif, 
    selectedClusters, 
    setLocationDescription, 
    setVisualMotif, 
    setSelectedClusters, 
    setParsedCharacters,
    setIntensity
  } = useSetupStore();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSourceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: File[] = Array.from(e.target.files);
      const slotsRemaining = MAX_SOURCE_FILES - files.length;
      const filesToProcess = newFiles.slice(0, slotsRemaining);
      
      if (filesToProcess.length === 0) return;

      setFiles(prev => [...prev, ...filesToProcess]);
      setIsAnalyzing(true);
      
      try {
        for (const file of filesToProcess) {
            const result = await analyzeSourceMaterial(file);
            
            // 1. Context Merging (Location)
            if (result.location) {
                 setLocationDescription(prev => prev ? `${prev}\n\n[Location Context from ${file.name}]:\n${result.location}` : result.location);
            }
            
            // 2. Visual Motif (Set if empty)
            if (result.visual_motif && !visualMotif) {
                 setVisualMotif(result.visual_motif);
            }
            
            // 3. Theme Cluster (Add if matched)
            if (result.theme_cluster) {
                 const match = KNOWN_CLUSTERS.find(c => result.theme_cluster.toLowerCase().includes(c.toLowerCase()));
                 if (match) {
                     // Add to selected clusters if not already present
                     setSelectedClusters(prev => {
                         if (!prev.includes(match)) return [...prev, match];
                         return prev;
                     });
                 }
            }
            
            // 4. Intensity Adjustment
            if (result.intensity) {
                 // Robust extraction for "Level 3", "level 3", "3", etc.
                 const levelMatch = result.intensity.match(/[1-5]/);
                 if (levelMatch) {
                     setIntensity(`Level ${levelMatch[0]}`);
                 }
            }
            
            // 5. Characters
            if (result.characters && result.characters.length > 0) {
                setParsedCharacters(prev => [...prev, ...result.characters]);
            }
        }
      } catch (err) {
        console.error("Source analysis failed", err);
      } finally {
        setIsAnalyzing(false);
        if (inputRef.current) inputRef.current.value = '';
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
        <input type="file" ref={inputRef} onChange={handleSourceUpload} className="hidden" accept="image/*,.pdf,.txt" multiple />
        
        <div 
            className={`border-2 border-dashed transition-all relative group cursor-pointer bg-gray-900/20 p-8 rounded-sm
                ${files.length >= MAX_SOURCE_FILES 
                    ? 'border-gray-800 opacity-50 cursor-not-allowed' 
                    : 'border-gray-800 hover:border-gray-600'
                }`}
            onClick={() => {
                if (files.length < MAX_SOURCE_FILES) inputRef.current?.click();
            }}
        >
            <div className="flex flex-col items-center justify-center gap-4 text-center">
                {isAnalyzing ? (
                    <>
                        <Loader2 className="w-10 h-10 text-fresh-blood animate-spin" />
                        <div className="text-sm font-mono uppercase tracking-widest text-fresh-blood animate-pulse">Analyzing Neural Patterns...</div>
                    </>
                ) : (
                    <>
                        <FileUp className="w-10 h-10 text-gray-600 group-hover:text-gray-400 transition-colors" />
                        <div>
                            <div className="text-sm font-mono uppercase tracking-widest text-gray-400 group-hover:text-gray-200">Ingest Source Material</div>
                            <div className="text-[10px] text-gray-600 font-mono uppercase mt-1">
                                Upload PDF, Text, or Image to extract characters, setting, and intensity
                            </div>
                            <div className="text-[9px] text-gray-600 font-mono uppercase mt-4">
                                Capacity: {files.length} / {MAX_SOURCE_FILES} Slots Used
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>

        {files.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {files.map((file, idx) => (
                    <div key={idx} className="relative group bg-black border border-gray-800 p-3 rounded-sm flex flex-col items-center justify-center aspect-square overflow-hidden hover:border-fresh-blood/50 transition-colors">
                        {file.type.startsWith('image/') ? (
                            <img src={URL.createObjectURL(file)} alt="preview" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                        ) : (
                            <FileText className="w-10 h-10 text-gray-600 mb-2 group-hover:text-gray-400" />
                        )}
                        <div className="relative z-10 text-[9px] text-gray-400 font-mono text-center truncate w-full px-2 bg-black/60 py-1 mt-auto">
                            {file.name}
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1">
                            <button 
                                onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                className="text-gray-500 hover:text-red-500 p-1 bg-black/80 rounded-sm border border-gray-700 hover:border-red-500 transition-all"
                                title="Remove Source"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};
