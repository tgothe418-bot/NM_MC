import React, { useState } from 'react';
import { Bot, Loader2, Play, Sparkles, Activity, Zap, Radio, Eye, Cpu, Hourglass, Settings, MapPin, Upload } from 'lucide-react';
import { SimulationConfig } from '../../types';
import { useSetupStore } from './store';
import { SourceUploader } from './SourceUploader';
import { ManualCharacterSection } from './ManualCharacterSection';
import { generateCalibrationField, generateScenarioConcepts, analyzeImageContext } from '../../services/geminiService';

const CLUSTER_OPTIONS = [
  { id: 'Flesh', label: 'THE FLESH', desc: 'Body Horror', color: 'border-red-900 text-red-500' },
  { id: 'System', label: 'THE SYSTEM', desc: 'Cyberpunk', color: 'border-system-green text-system-green' },
  { id: 'Haunting', label: 'THE HAUNTING', desc: 'Gothic Dread', color: 'border-haunt-gold text-haunt-gold' },
  { id: 'Self', label: 'THE SELF', desc: 'Psychological', color: 'border-psych-indigo text-indigo-400' },
  { id: 'Blasphemy', label: 'THE BLASPHEMY', desc: 'Transgression', color: 'border-blasphemy-purple text-purple-400' },
  { id: 'Survival', label: 'THE VOID', desc: 'Survival', color: 'border-survival-ice text-cyan-400' },
  { id: 'Desire', label: 'THE HUNGER', desc: 'Gothic Romance', color: 'border-rose-900 text-rose-500' },
];

const INTENSITY_OPTIONS = [
  { id: 'Level 1', label: 'Level 1', desc: 'The Shadow' },
  { id: 'Level 2', label: 'Level 2', desc: 'The Dread' },
  { id: 'Level 3', label: 'Level 3', desc: 'The Visceral' },
  { id: 'Level 4', label: 'Level 4', desc: 'The Grotesque' },
  { id: 'Level 5', label: 'Level 5', desc: 'The Abyssal' }
];

interface Props {
  onRun: (config: SimulationConfig) => void;
  onBack: () => void;
}

export const SimulationSetup: React.FC<Props> = ({ onRun, onBack }) => {
  const store = useSetupStore();
  const [cycles, setCycles] = useState(10);
  const [isStarting, setIsStarting] = useState(false);
  const [loadingFields, setLoadingFields] = useState<Record<string, boolean>>({});
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleStart = () => {
    setIsStarting(true);
    setTimeout(() => {
        // Normalize Mode for Config
        let mode: 'Survivor' | 'Villain' = 'Survivor';
        if (store.mode.includes('Antagonist') || store.mode.includes('Predator') || store.mode === 'Villain') {
            mode = 'Villain';
        }

        onRun({
            perspective: store.perspective.split(' (')[0],
            mode: mode,
            starting_point: store.startingPoint,
            cluster: store.selectedClusters.join(', '),
            intensity: store.intensity || 'Level 3',
            cycles: cycles,
            visual_motif: store.visualMotif,
            location_description: store.locationDescription,
            // Full Character Data Pass-through
            villain_name: store.villainName,
            villain_appearance: store.villainAppearance,
            villain_methods: store.villainMethods,
            victim_description: store.victimDescription,
            primary_goal: store.primaryGoal,
            victim_count: store.victimCount,
            survivor_name: store.survivorName,
            survivor_background: store.survivorBackground,
            survivor_traits: store.survivorTraits,
        });
    }, 1000);
  };

  const handleAutoPopulate = async () => {
      setIsGeneratingIdeas(true);
      try {
          const c = await generateScenarioConcepts(store.selectedClusters.join(', '), store.intensity, store.mode);
          if (c) {
              if (c.villain_name) store.setVillainName(c.villain_name);
              if (c.villain_appearance) store.setVillainAppearance(c.villain_appearance);
              if (c.villain_methods) store.setVillainMethods(c.villain_methods);
              if (c.primary_goal) store.setPrimaryGoal(c.primary_goal);
              if (c.victim_description) store.setVictimDescription(c.victim_description);
              if (c.survivor_name) store.setSurvivorName(c.survivor_name);
              if (c.survivor_background) store.setSurvivorBackground(c.survivor_background);
              if (c.survivor_traits) store.setSurvivorTraits(c.survivor_traits);
              if (c.location_description) store.setLocationDescription(c.location_description);
              if (c.visual_motif) store.setVisualMotif(c.visual_motif);
          }
      } finally { setIsGeneratingIdeas(false); }
  };

  const handleGenerate = async (field: string) => {
      setLoadingFields(prev => ({ ...prev, [field]: true }));
      try {
          const res = await generateCalibrationField(field, store.selectedClusters.join(', '), store.intensity);
          if (field === 'Initial Location') store.setLocationDescription(res);
          if (field === 'Visual Motif') store.setVisualMotif(res);
      } finally { setLoadingFields(prev => ({ ...prev, [field]: false })); }
  };

  const triggerImageUpload = () => fileInputRef.current?.click();
  const onImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
          setLoadingFields(prev => ({ ...prev, 'Visual Motif': true }));
          const res = await analyzeImageContext(e.target.files[0], 'Visual Motif');
          store.setVisualMotif(res);
          setLoadingFields(prev => ({ ...prev, 'Visual Motif': false }));
      }
  };

  return (
    <div className="flex flex-col h-full bg-[#030303] animate-fadeIn relative z-10 overflow-hidden">
        <input type="file" ref={fileInputRef} onChange={onImageUpload} className="hidden" accept="image/*" />
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12">
            <div className="max-w-7xl mx-auto space-y-12">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-amber-500/30 pb-8">
                    <div className="space-y-2">
                        <div className="text-amber-500 font-mono text-4xl font-bold uppercase tracking-[0.2em] flex items-center gap-4">
                            <Bot className="w-10 h-10" /> Diagnostic Protocol
                        </div>
                        <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.4em]">Autonomous Narrative Execution Engine</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={handleAutoPopulate} disabled={isGeneratingIdeas} className="text-amber-500 flex items-center gap-3 border border-amber-500/50 px-6 py-3 bg-amber-500/5 hover:bg-amber-500/20 disabled:opacity-50 transition-colors uppercase font-mono text-xs tracking-widest rounded-sm">
                            {isGeneratingIdeas ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />} Auto-Gen
                        </button>
                        <button onClick={onBack} className="text-gray-600 hover:text-white border border-gray-800 px-8 py-3 uppercase font-mono text-xs tracking-widest rounded-sm">Back</button>
                    </div>
                </div>

                {/* Source Uploader */}
                <SourceUploader />

                {/* Main Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    
                    {/* Simulation Parameters */}
                    <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 bg-gray-900/10 p-8 border border-gray-800 rounded-sm">
                        <div className="space-y-4">
                            <label className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Activity className="w-4 h-4 text-amber-500" /> Cycles
                            </label>
                            <input 
                                type="range" 
                                min="5" 
                                max="50" 
                                step="5" 
                                value={cycles} 
                                onChange={(e) => setCycles(parseInt(e.target.value))}
                                className="w-full accent-amber-500 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="text-right font-mono text-amber-500 text-sm font-bold">{cycles} Turns</div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Eye className="w-4 h-4 text-amber-500" /> Perspective
                            </label>
                            <select value={store.perspective} onChange={(e) => store.setPerspective(e.target.value)} className="w-full bg-black border border-gray-800 p-3 text-xs font-mono text-gray-300 focus:border-amber-500 outline-none rounded-sm">
                                <option>First Person (Direct Immersion)</option>
                                <option>Third Person (Observational Dread)</option>
                            </select>
                        </div>

                        <div className="space-y-4">
                            <label className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-amber-500" /> Mode
                            </label>
                            <select value={store.mode} onChange={(e) => store.setMode(e.target.value)} className="w-full bg-black border border-gray-800 p-3 text-xs font-mono text-gray-300 focus:border-amber-500 outline-none rounded-sm">
                                <option>The Survivor (Prey Protocol)</option>
                                <option>The Antagonist (Predator Protocol)</option>
                            </select>
                        </div>

                        <div className="space-y-4">
                            <label className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Hourglass className="w-4 h-4 text-amber-500" /> Starting Point
                            </label>
                            <select value={store.startingPoint} onChange={(e) => store.setStartingPoint(e.target.value)} className="w-full bg-black border border-gray-800 p-3 text-xs font-mono text-gray-300 focus:border-amber-500 outline-none rounded-sm">
                                <option>Prologue</option>
                                <option>In Media Res</option>
                                <option>The Climax</option>
                            </select>
                        </div>
                    </div>

                    {/* Cluster Grid */}
                    <div className="col-span-full space-y-6">
                        <label className="text-sm font-mono text-gray-400 flex gap-3 uppercase tracking-widest"><Settings className="text-amber-500" /> Resonance Frequency</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                            {CLUSTER_OPTIONS.map(o => (
                                <button key={o.id} onClick={() => store.setSelectedClusters(prev => prev.includes(o.id) ? prev.filter(c => c !== o.id) : [...prev, o.id])} className={`p-4 border text-left transition-all rounded-sm ${store.selectedClusters.includes(o.id) ? `${o.color} bg-black ring-1 ring-amber-500/50` : 'border-gray-800 text-gray-600 hover:border-gray-600'}`}>
                                    <div className="font-bold text-[10px] uppercase tracking-wider">{o.label}</div>
                                    <div className="text-[9px] opacity-60 mt-1">{o.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Environment Matrix */}
                    <div className="col-span-full bg-gray-900/10 p-8 border border-gray-800 space-y-10 rounded-sm">
                        <div className="text-amber-500 font-mono text-sm font-bold uppercase tracking-[0.3em] border-b border-amber-500/20 pb-4 flex gap-4">
                            <MapPin className="w-5 h-5" /> Environmental Matrix
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <label className="text-xs font-mono text-gray-400 uppercase tracking-wider">Location</label>
                                    <button onClick={() => handleGenerate('Initial Location')} className="text-gray-500 hover:text-amber-500">
                                        {loadingFields['Initial Location'] ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                                    </button>
                                </div>
                                <textarea value={store.locationDescription} onChange={e => store.setLocationDescription(e.target.value)} className="w-full h-32 bg-black border border-gray-800 p-4 text-xs font-mono text-gray-300 focus:border-amber-500 outline-none resize-none" placeholder="Describe the starting environment..." />
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <label className="text-xs font-mono text-gray-400 uppercase tracking-wider">Visual Motif</label>
                                    <div className="flex gap-2">
                                        <button onClick={triggerImageUpload} className="text-gray-500 hover:text-amber-500"><Upload className="w-4 h-4" /></button>
                                        <button onClick={() => handleGenerate('Visual Motif')} className="text-gray-500 hover:text-amber-500">
                                            {loadingFields['Visual Motif'] ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <textarea value={store.visualMotif} onChange={e => store.setVisualMotif(e.target.value)} className="w-full h-32 bg-black border border-gray-800 p-4 text-xs font-mono text-gray-300 focus:border-amber-500 outline-none resize-none" placeholder="e.g. Grainy 16mm, Digital Glitch..." />
                            </div>
                        </div>
                    </div>

                    {/* Intensity */}
                    <div className="col-span-full space-y-6">
                        <label className="text-sm font-mono text-gray-400 flex gap-3 uppercase tracking-widest"><Zap className="text-amber-500" /> Stress Threshold</label>
                        <div className="grid gap-1 bg-black border border-gray-800 p-1">
                            {INTENSITY_OPTIONS.map(opt => (
                                <button 
                                    key={opt.id} 
                                    onClick={() => store.setIntensity(opt.id)} 
                                    className={`p-3 text-left border-l-2 transition-all flex justify-between items-center group ${store.intensity === opt.id ? 'bg-gray-900 border-amber-500 text-white' : 'border-transparent text-gray-500 hover:bg-gray-900/50'}`}
                                >
                                    <span className="font-bold text-xs font-mono uppercase">{opt.label}</span>
                                    <span className={`text-[10px] font-mono uppercase tracking-wider transition-opacity ${store.intensity === opt.id ? 'opacity-100 text-amber-500' : 'opacity-40 group-hover:opacity-70'}`}>
                                        {opt.desc}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Full Character Section */}
                    <ManualCharacterSection loadingFields={loadingFields} setLoadingFields={setLoadingFields} />

                </div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-gray-800 bg-black/80 backdrop-blur-sm flex justify-center gap-6 relative z-20">
            <button 
                onClick={handleStart}
                disabled={isStarting}
                className={`px-12 py-4 bg-amber-500 text-black font-mono font-bold uppercase tracking-[0.2em] hover:bg-amber-400 transition-colors rounded-sm flex items-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.3)] ${isStarting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {isStarting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-black" />}
                {isStarting ? 'Initializing...' : 'Run Diagnostics'}
            </button>
        </div>
    </div>
  );
};