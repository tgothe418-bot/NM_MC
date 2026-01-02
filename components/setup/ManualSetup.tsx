
import React, { useState } from 'react';
import { ShieldAlert, Sparkles, Loader2, Play, Users, Eye, Cpu, Hourglass, Settings, Check, MapPin, Image, Upload, Zap } from 'lucide-react';
import { useSetupStore } from './store';
import { SimulationConfig, ParsedCharacter } from '../../types';
import { SourceUploader } from './SourceUploader';
import { ManualCharacterSection } from './ManualCharacterSection';
import { generateCalibrationField, generateScenarioConcepts, analyzeImageContext } from '../../services/geminiService';

interface Props {
  onComplete: (config: SimulationConfig) => void;
  onBack: () => void;
}

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
  { id: 'Level 1', label: 'Level 1', desc: 'The Shadow (Spooky & Safe)' },
  { id: 'Level 2', label: 'Level 2', desc: 'The Dread (Psychological)' },
  { id: 'Level 3', label: 'Level 3', desc: 'The Visceral (Survival Horror)' },
  { id: 'Level 4', label: 'Level 4', desc: 'The Grotesque (Extreme)' },
  { id: 'Level 5', label: 'Level 5', desc: 'The Abyssal (Unfiltered)' }
];

export const ManualSetup: React.FC<Props> = ({ onComplete, onBack }) => {
  const store = useSetupStore();
  const [loadingFields, setLoadingFields] = useState<Record<string, boolean>>({});
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleStart = () => {
      setIsCalibrating(true);
      setTimeout(() => {
          onComplete({
              perspective: store.perspective.split(' (')[0],
              mode: store.mode.includes('Survivor') ? 'Survivor' : 'Villain',
              starting_point: store.startingPoint,
              cluster: store.selectedClusters.join(', '),
              intensity: store.intensity,
              cycles: 0,
              visual_motif: store.visualMotif,
              location_description: store.locationDescription,
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
      }, 2000);
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

  const handleCharacterSelect = (char: ParsedCharacter) => {
      const roleLower = char.role.toLowerCase();
      const isVillain = roleLower.includes('antagonist') || roleLower.includes('villain') || roleLower.includes('monster') || roleLower.includes('killer');
      
      // 1. Set Role & Profile
      if (isVillain) {
          store.setMode('The Antagonist (Predator Protocol)');
          store.setVillainName(char.name);
          store.setVillainAppearance(`${char.description}\n\n[Traits]: ${char.traits}`);
      } else {
          store.setMode('The Survivor (Prey Protocol)');
          store.setSurvivorName(char.name);
          store.setSurvivorBackground(char.description);
          store.setSurvivorTraits(char.traits);
      }

      // 2. Populate "Specimen Targets" / Other Characters
      // Filter out the selected character from the list
      const others = store.parsedCharacters.filter(c => c.name !== char.name);
      
      if (others.length > 0) {
          store.setVictimCount(others.length);
          
          // Construct a rich profile list of the targets
          const othersDescription = others.map(c => 
              `SUBJECT: ${c.name}\nROLE: ${c.role}\nPROFILE: ${c.description}\nTRAITS: ${c.traits}`
          ).join('\n\n');
          
          store.setVictimDescription(othersDescription);
      } else {
          // If no other characters found, clear it or leave default
          store.setVictimCount(1);
          store.setVictimDescription('');
      }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#030303]">
        <input type="file" ref={fileInputRef} onChange={onImageUpload} className="hidden" accept="image/*" />
        <div className="flex-1 p-12 md:p-16 space-y-12 overflow-y-auto custom-scrollbar">
            <div className="flex justify-between border-b border-fresh-blood/30 pb-10">
                <div className="flex gap-6"><ShieldAlert className="w-14 h-14 text-fresh-blood animate-pulse" /><div><h2 className="font-mono text-5xl font-bold tracking-[0.25em] text-fresh-blood">MANUAL CALIBRATION</h2><p className="text-sm font-mono text-gray-500 tracking-[0.4em] mt-2">Direct Hardware Interface</p></div></div>
                <div className="flex gap-4">
                    <button onClick={handleAutoPopulate} disabled={isGeneratingIdeas} className="text-fresh-blood flex items-center gap-3 border border-fresh-blood px-6 py-4 bg-fresh-blood/10 hover:bg-fresh-blood/30 disabled:opacity-50">{isGeneratingIdeas ? <Loader2 className="animate-spin" /> : <Sparkles />} Ideas</button>
                    <button onClick={onBack} className="text-gray-600 hover:text-white border border-gray-800 px-8 py-4">Back</button>
                </div>
            </div>

            <SourceUploader />

            {store.parsedCharacters.length > 0 && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="flex items-center gap-3 text-sm font-mono uppercase tracking-[0.3em] text-gray-400 border-b border-gray-800 pb-2"><Users className="w-4 h-4" /> Detected Neural Signals</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {store.parsedCharacters.map((char, i) => (
                            <button 
                                key={i} 
                                onClick={() => handleCharacterSelect(char)} 
                                className="text-left bg-black border border-gray-800 p-6 hover:border-fresh-blood group transition-colors"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-bold text-gray-200 font-mono group-hover:text-white">{char.name}</div>
                                    <span className="text-[10px] uppercase font-mono text-gray-600 border border-gray-800 px-2 py-0.5 rounded group-hover:text-fresh-blood group-hover:border-fresh-blood/30">
                                        {char.role}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500 line-clamp-3 leading-relaxed">{char.description}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
                <div className="space-y-4"><label className="text-sm font-mono text-gray-400 flex gap-3"><Eye className="text-fresh-blood" /> Lens</label><select value={store.perspective} onChange={(e) => store.setPerspective(e.target.value)} className="w-full bg-black border-2 border-gray-800 p-6 text-lg"><option>First Person (Direct Immersion)</option><option>Third Person (Observational Dread)</option></select></div>
                <div className="space-y-4"><label className="text-sm font-mono text-gray-400 flex gap-3"><Cpu className="text-fresh-blood" /> Role</label><select value={store.mode} onChange={(e) => store.setMode(e.target.value)} className="w-full bg-black border-2 border-gray-800 p-6 text-lg"><option>The Survivor (Prey Protocol)</option><option>The Antagonist (Predator Protocol)</option></select></div>
                <div className="space-y-4"><label className="text-sm font-mono text-gray-400 flex gap-3"><Hourglass className="text-fresh-blood" /> Time</label><select value={store.startingPoint} onChange={(e) => store.setStartingPoint(e.target.value)} className="w-full bg-black border-2 border-gray-800 p-6 text-lg"><option>Prologue</option><option>In Media Res</option><option>The Climax</option></select></div>
                
                <div className="col-span-full space-y-6"><label className="text-sm font-mono text-gray-400 flex gap-3"><Settings className="text-fresh-blood" /> Resonance</label><div className="grid grid-cols-7 gap-4">{CLUSTER_OPTIONS.map(o => (<button key={o.id} onClick={() => store.setSelectedClusters(prev => prev.includes(o.id) ? prev.filter(c => c !== o.id) : [...prev, o.id])} className={`p-5 border-2 text-left transition-all ${store.selectedClusters.includes(o.id) ? `${o.color} bg-black ring-2 ring-fresh-blood/50` : 'border-gray-800 text-gray-600'}`}><div className="font-bold text-xs uppercase">{o.label}</div><div className="text-[10px] opacity-60">{o.desc}</div></button>))}</div></div>
                
                <div className="col-span-full bg-terminal/40 p-10 border border-gray-800 space-y-10 rounded-sm">
                    <div className="text-fresh-blood font-mono text-xl font-bold uppercase tracking-widest border-b border-fresh-blood/10 pb-5 flex gap-5"><MapPin className="w-8 h-8" /> Environmental Matrix</div>
                    <div className="grid grid-cols-2 gap-12">
                        <div className="space-y-4"><div className="flex justify-between"><label className="text-sm font-mono text-gray-400">Location</label><button onClick={() => handleGenerate('Initial Location')} className="text-gray-500 hover:text-fresh-blood">{loadingFields['Initial Location'] ? <Loader2 className="animate-spin" /> : <Sparkles />}</button></div><textarea value={store.locationDescription} onChange={e => store.setLocationDescription(e.target.value)} className="w-full h-32 bg-black border-2 border-gray-800 p-6 text-sm outline-none resize-none" /></div>
                        <div className="space-y-4"><div className="flex justify-between"><label className="text-sm font-mono text-gray-400">Visual Motif</label><div className="flex gap-2"><button onClick={triggerImageUpload} className="text-gray-500 hover:text-fresh-blood"><Upload /></button><button onClick={() => handleGenerate('Visual Motif')} className="text-gray-500 hover:text-fresh-blood">{loadingFields['Visual Motif'] ? <Loader2 className="animate-spin" /> : <Sparkles />}</button></div></div><input value={store.visualMotif} onChange={e => store.setVisualMotif(e.target.value)} className="w-full bg-black border-2 border-gray-800 p-6 text-lg outline-none" /></div>
                    </div>
                </div>

                <div className="col-span-full space-y-6">
                    <label className="text-sm font-mono text-gray-400 flex gap-3"><Zap className="text-fresh-blood" /> Intensity</label>
                    <div className="grid gap-1 bg-black border border-gray-800 p-1">
                        {INTENSITY_OPTIONS.map(opt => (
                            <button 
                                key={opt.id} 
                                onClick={() => store.setIntensity(opt.id)} 
                                className={`p-4 text-left border-l-2 transition-all flex justify-between items-center group ${store.intensity === opt.id ? 'bg-gray-900 border-fresh-blood text-white' : 'border-transparent text-gray-500 hover:bg-gray-900/50'}`}
                            >
                                <span className="font-bold">{opt.label}</span>
                                <span className={`text-xs font-mono uppercase tracking-wider transition-opacity ${store.intensity === opt.id ? 'opacity-100 text-fresh-blood' : 'opacity-40 group-hover:opacity-70'}`}>
                                    {opt.desc}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
                
                <ManualCharacterSection loadingFields={loadingFields} setLoadingFields={setLoadingFields} />
            </div>
            
            <div className="pt-16 pb-12 border-t-2 border-fresh-blood/10 flex flex-col items-center bg-black/20">
                <button onClick={handleStart} disabled={isCalibrating} className="w-full max-w-2xl py-8 bg-fresh-blood text-black font-mono font-bold uppercase tracking-[0.6em] hover:bg-red-700 transition-all shadow-[0_0_50px_rgba(136,8,8,0.5)]"><span className="flex items-center justify-center gap-6">{isCalibrating ? 'CALIBRATING...' : <><Play className="fill-black" /> INITIALIZE</>}</span></button>
            </div>
        </div>
    </div>
  );
};
