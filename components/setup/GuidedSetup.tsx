
import React, { useState, useRef } from 'react';
import { ChevronRight, Image, Loader2, UserPlus, Eye, Clapperboard, Activity, Cpu, Ghost, Fingerprint, Zap, Radio, Flame, UserCheck, Skull } from 'lucide-react';
import { useSetupStore } from './store';
import { GuidedQuestion } from './types';
import { NeuralPet } from '../NeuralPet';
import { analyzeImageContext, generateCharacterProfile } from '../../services/geminiService';
import { SimulationConfig } from '../../types';

interface Props {
  onComplete: (config: SimulationConfig) => void;
  onBack: () => void;
}

const CLUSTER_OPTIONS = [
  { id: 'Flesh', label: 'THE FLESH', desc: 'Body Horror & Biological', tooltip: "Bio-organic horror focused on the fragility of the physical form.", icon: Activity },
  { id: 'System', label: 'THE SYSTEM', desc: 'Cyberpunk Dystopia & Glitch', tooltip: "Technological dread and the cold logic of an indifferent machine.", icon: Cpu },
  { id: 'Haunting', label: 'THE HAUNTING', desc: 'Gothic Dread & Spectral', tooltip: "The eerie presence of agency in desolate landscapes.", icon: Ghost },
  { id: 'Self', label: 'THE SELF', desc: 'Psychological Thriller', tooltip: "Psychological erosion and the breakdown of identity.", icon: Fingerprint },
  { id: 'Blasphemy', label: 'THE BLASPHEMY', desc: 'Cult Horror & Transgression', tooltip: "Shock-driven horror exploring the intersection of the sacred and the profane.", icon: Zap },
  { id: 'Survival', label: 'THE VOID', desc: 'Environmental Survival', tooltip: "Existential cold and the absolute indifference of nature.", icon: Radio },
  { id: 'Desire', label: 'THE HUNGER', desc: 'Gothic Romance & Predatory', tooltip: "The intertwining of Eros and Thanatos.", icon: Flame },
];

const INTENSITY_OPTIONS = [
  { id: 'Level 1', label: 'Level 1: The Shadow', desc: 'Spooky & Safe.' },
  { id: 'Level 2', label: 'Level 2: The Dread', desc: 'Psychological Horror.' },
  { id: 'Level 3', label: 'Level 3: The Visceral', desc: 'Survival Horror (Rated R).' },
  { id: 'Level 4', label: 'Level 4: The Grotesque', desc: 'Extreme Horror.' },
  { id: 'Level 5', label: 'Level 5: The Abyssal', desc: 'Unfiltered Transgression.' }
];

const QUESTIONS: GuidedQuestion[] = [
    {
      q: "The machine hums as it samples your pulse. Tell me... who is the center of this tragedy?",
      sub: "A hunter seeking truth through violence, or the hunted, desperate for one more breath?",
      key: "mode",
      type: "binary",
      options: [
        { id: "Survivor", label: "The Survivor", sub: "Prey Protocol", desc: "You are weak. You are hunted. Survival is the only victory.", icon: UserCheck },
        { id: "Villain", label: "The Entity", sub: "Predator Protocol", desc: "You are the hunger. You are the fear. Make them suffer.", icon: Skull }
      ]
    },
    {
      q: "Through which lens shall we observe the decay?",
      sub: "Do you wish to feel the heat of the trauma directly, or observe from a cinematic distance?",
      key: "perspective",
      type: "binary",
      options: [
        { id: "First Person", label: "First Person", sub: "Direct Immersion", desc: "See through their eyes. Feel their pain. No escape.", icon: Eye },
        { id: "Third Person", label: "Third Person", sub: "Cinematic Dread", desc: "The camera lingers. You see what lies behind them.", icon: Clapperboard }
      ]
    },
    {
      q: "Choose your resonance. Which flavor of despair speaks to you?",
      sub: "The machine offers seven paths to oblivion.",
      key: "cluster",
      type: "grid",
      options: CLUSTER_OPTIONS
    },
    {
        q: "Who are you in this nightmare?",
        sub: "Define your avatar. Leave blank to remain a cipher.",
        placeholder: "e.g. A disgraced surgeon with shaking hands...",
        key: "character_description",
        type: "text",
        hasHelper: true
    },
    {
      q: "Where does this ordeal begin?",
      sub: "Define the architecture of the starting location.",
      placeholder: "e.g. A sterile hospital basement, a decaying Victorian mansion...",
      key: "location_description",
      type: "text"
    },
    {
      q: "Describe the visual motif of this nightmare.",
      sub: "Describe it manually, or attach an image to let the machine extract its soul.",
      placeholder: "e.g. Gritty 70s slasher, Static-heavy VHS...",
      key: "visual_motif",
      type: "text"
    },
    {
      q: "Finally... how much fidelity can your psyche withstand?",
      sub: "Choose your intensity gradient.",
      key: "intensity",
      type: "list",
      options: INTENSITY_OPTIONS
    }
];

export const GuidedSetup: React.FC<Props> = ({ onComplete, onBack }) => {
  const store = useSetupStore();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  
  const fileRef = useRef<HTMLInputElement>(null);

  const handleNext = (val?: string) => {
    const answer = val || input;
    const q = QUESTIONS[step];
    
    if (!answer && !q.options) return;

    // Update Global State
    if (q.key === 'mode') store.setMode(answer === 'Survivor' ? 'The Survivor (Prey Protocol)' : 'The Antagonist (Predator Protocol)');
    if (q.key === 'perspective') store.setPerspective(answer === 'First Person' ? 'First Person (Direct Immersion)' : 'Third Person (Observational Dread)');
    if (q.key === 'cluster') store.setSelectedClusters([answer]);
    if (q.key === 'location_description') store.setLocationDescription(answer);
    if (q.key === 'visual_motif') store.setVisualMotif(answer);
    if (q.key === 'character_description') store.setSurvivorBackground(answer);
    if (q.key === 'intensity') {
        const level = answer.split(':')[0].trim();
        store.setIntensity(level);
    }

    setAnswers([...answers, answer]);
    setInput('');
    
    if (step < QUESTIONS.length - 1) {
        setStep(step + 1);
    } else {
        finish();
    }
  };

  const finish = () => {
      setIsCalibrating(true);
      setTimeout(() => {
          const intensityObj = INTENSITY_OPTIONS.find(o => o.id === store.intensity);
          const intensityStr = intensityObj ? `${intensityObj.label} - ${intensityObj.desc}` : store.intensity;
          
          onComplete({
              perspective: store.perspective.split(' (')[0],
              mode: store.mode.includes('Survivor') ? 'Survivor' : 'Villain',
              starting_point: 'Prologue',
              cluster: store.selectedClusters.join(', '),
              intensity: intensityStr,
              cycles: 0,
              visual_motif: store.visualMotif,
              location_description: store.locationDescription,
              survivor_background: store.survivorBackground,
              survivor_name: store.survivorName,
          });
      }, 2000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
          setIsProcessing(true);
          try {
              const desc = await analyzeImageContext(e.target.files[0], 'Visual Motif');
              store.setVisualMotif(desc);
              setInput(desc); 
          } finally {
              setIsProcessing(false);
          }
      }
  };

  const handleGenChar = async () => {
      setIsProcessing(true);
      try {
          const profile = await generateCharacterProfile(store.selectedClusters.join(', '), store.intensity, 'Survivor');
          store.setSurvivorName(profile.name);
          store.setSurvivorBackground(profile.background);
          store.setSurvivorTraits(profile.traits);
          setInput(`${profile.name}: ${profile.background}`);
      } finally {
          setIsProcessing(false);
      }
  };

  const q = QUESTIONS[step];

  return (
    <div className="flex flex-col h-full bg-[#030303] animate-fadeIn p-6 md:p-10 relative overflow-hidden font-serif">
        <div className="flex gap-2 mb-8 flex-shrink-0">
          {QUESTIONS.map((_, i) => (
            <div key={i} className={`h-1 flex-1 transition-all duration-1000 ${i <= step ? 'bg-haunt-gold' : 'bg-gray-800'}`} />
          ))}
        </div>

        <div className="flex-1 flex flex-col lg:flex-row gap-12 overflow-hidden">
            <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar pr-4">
                <div className="mb-10 space-y-6 animate-fadeIn" key={`q-${step}`}>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl text-gray-100 leading-tight italic font-serif">{q.q}</h2>
                    {q.sub && <p className="text-gray-500 font-mono text-sm uppercase tracking-widest border-l-2 border-haunt-gold/30 pl-4 py-1">{q.sub}</p>}
                </div>

                <div className="flex-1 flex flex-col justify-end pb-10">
                    {q.options ? (
                        <div className={`grid gap-6 ${q.type === 'grid' ? 'grid-cols-2 lg:grid-cols-3' : q.type === 'list' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                            {q.options.map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => handleNext(opt.id)}
                                    disabled={isCalibrating}
                                    className={`group relative border border-gray-800 bg-black/40 text-left p-8 hover:border-haunt-gold hover:bg-haunt-gold/5 transition-all rounded-sm flex flex-col gap-4 ${isCalibrating ? 'opacity-50' : ''}`}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div className="text-xs font-mono text-gray-500 group-hover:text-haunt-gold uppercase tracking-[0.2em]">{opt.sub || "Selection"}</div>
                                        {opt.icon && <opt.icon className="w-6 h-6 text-gray-600 group-hover:text-haunt-gold transition-colors" />}
                                    </div>
                                    <div className="text-3xl uppercase tracking-wider font-bold text-gray-200 group-hover:text-white font-serif">{opt.label}</div>
                                    {opt.desc && <div className="text-xs text-gray-500 leading-relaxed font-mono opacity-80 border-t border-gray-800 pt-3 mt-1">{opt.desc}</div>}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="max-w-3xl space-y-8 mt-4 relative">
                            <input 
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                                placeholder={q.placeholder}
                                autoFocus
                                disabled={isCalibrating || isProcessing}
                                className="w-full bg-transparent border-b-2 border-gray-800 text-gray-100 text-3xl py-4 focus:outline-none focus:border-haunt-gold transition-all font-serif italic disabled:opacity-50 placeholder:text-gray-800 pr-12"
                            />
                            {q.key === 'visual_motif' && (
                                <>
                                    <input type="file" ref={fileRef} className="hidden" onChange={handleImageUpload} accept="image/*" />
                                    <button onClick={() => fileRef.current?.click()} disabled={isProcessing} className="absolute right-4 top-4 text-gray-500 hover:text-haunt-gold transition-colors">
                                        {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Image className="w-6 h-6" />}
                                    </button>
                                </>
                            )}
                            {q.hasHelper && (
                                <button onClick={handleGenChar} disabled={isProcessing} className="absolute right-4 top-4 text-gray-500 hover:text-haunt-gold transition-colors flex items-center gap-2 bg-black/50 px-3 py-1 rounded-sm border border-gray-800">
                                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                    <span className="text-xs font-mono uppercase hidden md:inline">Help me build them</span>
                                </button>
                            )}
                            <div className="flex justify-end">
                                <button onClick={() => handleNext()} disabled={!input.trim() || isCalibrating} className="flex items-center gap-4 bg-haunt-gold text-black px-10 py-4 rounded-sm font-mono text-xs font-bold uppercase tracking-[0.3em] hover:bg-white transition-colors disabled:opacity-20">
                                    Confirm Signal <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="w-1/3 hidden lg:flex flex-col border-l border-gray-900 bg-[#050505] min-w-[350px]">
                <div className="flex-1 flex flex-col items-center justify-center relative p-8 border-b border-gray-900 overflow-hidden">
                    <div className="absolute top-6 left-6 text-[10px] font-mono text-red-600 uppercase tracking-[0.3em] z-10 font-bold border border-red-900/30 px-3 py-1 bg-red-950/10">Machine</div>
                    <div className="relative w-full h-full flex items-center justify-center">
                        <NeuralPet step={step} answers={answers} currentInput={input} />
                    </div>
                </div>
                <div className="h-1/3 min-h-[200px] p-8 overflow-y-auto custom-scrollbar bg-black/40">
                    <div className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.4em] border-b border-gray-800 pb-4 mb-4 sticky top-0 bg-black/40 backdrop-blur-sm">Session Manifest</div>
                    <div className="space-y-3">
                        {answers.map((ans, i) => (
                            <div key={i} className="flex justify-between items-start text-xs text-gray-500 font-mono animate-fadeIn border-l-2 border-gray-800 pl-3 py-1 group hover:border-haunt-gold transition-colors">
                                <span className="opacity-50 uppercase tracking-wider">{QUESTIONS[i]?.key}</span>
                                <span className="text-haunt-gold uppercase font-bold text-right ml-4 group-hover:text-white transition-colors line-clamp-2">{ans}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        <div className="pt-6 flex justify-between items-center border-t border-gray-900 mt-2 flex-shrink-0">
           <button onClick={onBack} className="text-gray-600 hover:text-white transition-colors text-xs font-mono uppercase tracking-[0.4em]">Disconnect Session</button>
           <div className="text-[10px] font-mono text-gray-800 uppercase tracking-[0.5em]">Calibration in Progress // Step {step + 1} of {QUESTIONS.length}</div>
        </div>
    </div>
  );
};
