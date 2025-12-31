import React, { useState, useEffect, useRef } from 'react';
import { Terminal, ShieldAlert, Cpu, Eye, Settings, Image, Zap, Play, Check, Users, Target, UserCheck, Skull, Wand2, Info, ChevronRight, MessageSquare, Monitor, Loader2, Sparkles, StickyNote, Bot, Activity, Layers, Timer, Clapperboard, MapPin, Hourglass, Fingerprint, Ghost, Flame, Radio, Upload, UserPlus } from 'lucide-react';
import { SimulationConfig } from '../types';
import { generateCalibrationField, analyzeImageContext, generateCharacterProfile } from '../services/geminiService';
import { NeuralPet } from './NeuralPet';

interface SetupOverlayProps {
  onComplete: (config: SimulationConfig) => void;
}

const STARTING_POINT_OPTIONS = [
  { id: 'Prologue', label: 'Prologue', desc: 'The Slow Burn (50 Turns Remaining)' },
  { id: 'In Media Res', label: 'In Media Res', desc: 'Active Threat (25 Turns Remaining)' },
  { id: 'Climax', label: 'The Climax', desc: 'Immediate Finale (10 Turns Remaining)' },
];

const CLUSTER_OPTIONS = [
  { 
    id: 'Flesh', 
    label: 'THE FLESH', 
    desc: 'Visceral & Organic', 
    color: 'border-red-900 text-red-500',
    tooltip: "Bio-organic horror focused on the fragility of the physical form. Expect wet textures, medical gore, and atavistic resurgence."
  },
  { 
    id: 'System', 
    label: 'THE SYSTEM', 
    desc: 'Digital & Industrial', 
    color: 'border-system-green text-system-green',
    tooltip: "Technological dread and the cold logic of an indifferent machine. Expect glitch art, data corruption, and industrial noise."
  },
  { 
    id: 'Haunting', 
    label: 'THE HAUNTING', 
    desc: 'Eerie & Spectral', 
    color: 'border-haunt-gold text-haunt-gold',
    tooltip: "The eerie presence of agency in desolate landscapes. Expect lingering trauma, spectral apparitions, and the weight of history."
  },
  { 
    id: 'Self', 
    label: 'THE SELF', 
    desc: 'Psychological & Ego', 
    color: 'border-psych-indigo text-indigo-400',
    tooltip: "Psychological erosion and the breakdown of identity. Expect hall-of-mirror effects, dissociation, and meta-narrative collapse."
  },
  { 
    id: 'Blasphemy', 
    label: 'THE BLASPHEMY', 
    desc: 'Transgressive & Profane', 
    color: 'border-blasphemy-purple text-purple-400',
    tooltip: "Shock-driven horror exploring the intersection of the sacred and the profane. Expect inverted rituals and systematic moral erosion."
  },
  { 
    id: 'Survival', 
    label: 'THE VOID', 
    desc: 'Desolate & Cold', 
    color: 'border-survival-ice text-cyan-400',
    tooltip: "Existential cold and the absolute indifference of nature. Expect whiteouts, starvation cycles, and the silence of the void."
  },
  { 
    id: 'Desire', 
    label: 'THE HUNGER', 
    desc: 'Predatory & Lush', 
    color: 'border-rose-900 text-rose-500',
    tooltip: "The intertwining of Eros and Thanatos. Expect predatory intimacy, decadent decay, and the ultimate consumption of the beloved."
  },
];

const INTENSITY_OPTIONS = [
  { id: 'Level 1', label: 'Level 1: The Uncanny', desc: 'Atmospheric disquiet; no on-screen violence.' },
  { id: 'Level 2', label: 'Level 2: The Dread', desc: 'Elevated anxiety; brief restrained violence.' },
  { id: 'Level 3', label: 'Level 3: The Visceral', desc: 'Hard R; survival horror stakes and gore.' },
  { id: 'Level 4', label: 'Level 4: The Grotesque', desc: 'Disturbing medical/process horror.' },
  { id: 'Level 5', label: 'Level 5: The Transgressive', desc: 'Apotheosis; philosophical and absolute excess.' },
];

const Tooltip: React.FC<{ text: string }> = ({ text }) => (
  <div className="absolute bottom-full mb-2 left-0 w-80 p-4 bg-black border border-gray-700 text-xs text-gray-300 font-mono leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-[0_0_30px_rgba(0,0,0,0.9)] backdrop-blur-md rounded-sm border-l-4 border-l-fresh-blood">
    <div className="flex items-center gap-2 mb-2 text-fresh-blood uppercase font-bold tracking-tighter text-sm">
      <Info className="w-4 h-4" /> System Intel
    </div>
    {text}
  </div>
);

export const SetupOverlay: React.FC<SetupOverlayProps> = ({ onComplete }) => {
  const [setupMode, setSetupMode] = useState<'choice' | 'manual' | 'guided' | 'simulation'>('choice');
  const [perspective, setPerspective] = useState('First Person (Direct Immersion)');
  const [mode, setMode] = useState('The Survivor (Prey Protocol)');
  const [startingPoint, setStartingPoint] = useState('Prologue');
  const [selectedClusters, setSelectedClusters] = useState<string[]>(['Flesh']);
  const [intensity, setIntensity] = useState('Level 3: The Visceral');
  const [visualMotif, setVisualMotif] = useState('');
  const [locationDescription, setLocationDescription] = useState('');
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [testCycles, setTestCycles] = useState(10);

  const [generatingFields, setGeneratingFields] = useState<Record<string, boolean>>({});
  const [activeImageField, setActiveImageField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isVillain = mode.includes('Antagonist') || mode.includes('Predator');
  
  // Villain Fields
  const [villainName, setVillainName] = useState('');
  const [villainAppearance, setVillainAppearance] = useState('');
  const [villainMethods, setVillainMethods] = useState('');
  const [victimDescription, setVictimDescription] = useState('');
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [victimCount, setVictimCount] = useState(3);

  // Survivor Fields
  const [survivorName, setSurvivorName] = useState('');
  const [survivorBackground, setSurvivorBackground] = useState('');
  const [survivorTraits, setSurvivorTraits] = useState('');

  const [guidedStep, setGuidedStep] = useState(0);
  const [guidedAnswers, setGuidedAnswers] = useState<string[]>([]);
  const [guidedInput, setGuidedInput] = useState('');
  const guidedEndRef = useRef<HTMLDivElement>(null);

  const GUIDED_QUESTIONS = [
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
      options: CLUSTER_OPTIONS.map(o => ({
          id: o.id,
          label: o.label,
          sub: o.desc,
          desc: o.tooltip,
          icon: o.id === 'Flesh' ? Activity : o.id === 'System' ? Cpu : o.id === 'Haunting' ? Ghost : o.id === 'Self' ? Fingerprint : o.id === 'Blasphemy' ? Zap : o.id === 'Survival' ? Radio : Flame
      }))
    },
    {
        q: "Who are you in this nightmare?",
        sub: "Define your avatar. Leave blank to remain a cipher.",
        placeholder: "e.g. A disgraced surgeon with shaking hands...",
        key: "character_description",
        type: "text",
        hasHelper: true // Enables "Help me build them" in guided
    },
    {
      q: "Where does this ordeal begin?",
      sub: "Define the architecture of the starting location.",
      placeholder: "e.g. A sterile hospital basement, a decaying Victorian mansion, the cockpit of a dying spaceship...",
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
      options: INTENSITY_OPTIONS.map(o => ({
          id: o.id,
          label: o.label,
          desc: o.desc
      }))
    }
  ];

  const handleGenerateField = async (field: string, useNotes: boolean = false) => {
    setGeneratingFields(prev => ({ ...prev, [field]: true }));
    let existingValue = '';
    
    // Mapping inputs for refinement
    if (field === 'Entity Name') existingValue = villainName;
    else if (field === 'Form & Appearance') existingValue = villainAppearance;
    else if (field === 'Modus Operandi') existingValue = villainMethods;
    else if (field === 'Specimen Targets') existingValue = victimDescription;
    else if (field === 'Primary Objective') existingValue = primaryGoal;
    else if (field === 'Visual Motif') existingValue = visualMotif;
    else if (field === 'Initial Location') existingValue = locationDescription;
    else if (field === 'Identity Name') existingValue = survivorName;
    else if (field === 'Backstory') existingValue = survivorBackground;
    else if (field === 'Traits & Flaws') existingValue = survivorTraits;

    try {
      const result = await generateCalibrationField(
        field, 
        selectedClusters.join(', '), 
        intensity,
        field === 'Specimen Targets' ? victimCount : undefined,
        useNotes ? existingValue : undefined
      );
      if (field === 'Entity Name') setVillainName(result);
      else if (field === 'Form & Appearance') setVillainAppearance(result);
      else if (field === 'Modus Operandi') setVillainMethods(result);
      else if (field === 'Specimen Targets') setVictimDescription(result);
      else if (field === 'Primary Objective') setPrimaryGoal(result);
      else if (field === 'Visual Motif') setVisualMotif(result);
      else if (field === 'Initial Location') setLocationDescription(result);
      else if (field === 'Identity Name') setSurvivorName(result);
      else if (field === 'Backstory') setSurvivorBackground(result);
      else if (field === 'Traits & Flaws') setSurvivorTraits(result);
    } catch (error) {
      console.error("Failed to generate field:", error);
    } finally {
      setGeneratingFields(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleGenerateCharacter = async () => {
      setGeneratingFields(prev => ({ ...prev, 'character_builder': true }));
      try {
          const profile = await generateCharacterProfile(selectedClusters.join(', '), intensity, isVillain ? 'Villain' : 'Survivor');
          
          if (isVillain) {
              setVillainName(profile.name);
              setVillainAppearance(`${profile.traits} \n\n ${profile.background}`);
              setPrimaryGoal("To survive/hunt"); 
          } else {
              setSurvivorName(profile.name);
              setSurvivorBackground(profile.background);
              setSurvivorTraits(profile.traits);
              // For guided mode input sync
              if (setupMode === 'guided') {
                  setGuidedInput(`${profile.name}: ${profile.background} (${profile.traits})`);
              }
          }
      } catch (e) {
          console.error("Character Gen Error", e);
      } finally {
          setGeneratingFields(prev => ({ ...prev, 'character_builder': false }));
      }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const field = activeImageField || 'Visual Motif';
      
      setGeneratingFields(prev => ({ ...prev, [field]: true }));
      try {
        const description = await analyzeImageContext(file, field);
        if (field === 'Visual Motif') {
            setVisualMotif(description);
            if (setupMode === 'guided') {
                setGuidedInput(description);
            }
        } else if (field === 'Specimen Targets') {
            setVictimDescription(description);
        }
      } catch (error) {
        console.error("Failed to analyze image:", error);
      } finally {
        setGeneratingFields(prev => ({ ...prev, [field]: false }));
        if (fileInputRef.current) fileInputRef.current.value = '';
        setActiveImageField(null);
      }
    }
  };

  const triggerImageUpload = (field: string = 'Visual Motif') => {
    setActiveImageField(field);
    fileInputRef.current?.click();
  };

  const ActionButtons = ({ fieldKey, value }: { fieldKey: string; value: string }) => (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => handleGenerateField(fieldKey)}
        disabled={generatingFields[fieldKey]}
        className="p-1.5 hover:bg-white/5 rounded-sm transition-colors text-gray-500 hover:text-fresh-blood disabled:opacity-50"
        title={`Generate ${fieldKey}`}
      >
        {generatingFields[fieldKey] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
      </button>
      {value?.trim() && (
        <button
          type="button"
          onClick={() => handleGenerateField(fieldKey, true)}
          disabled={generatingFields[fieldKey]}
          className="p-1.5 hover:bg-white/5 rounded-sm transition-colors text-gray-500 hover:text-haunt-gold disabled:opacity-50"
          title={`Refine ${fieldKey} with existing notes`}
        >
          {generatingFields[fieldKey] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
        </button>
      )}
    </div>
  );

  const handleGuidedNext = (answer?: string) => {
    if (isCalibrating) return;

    const val = answer || guidedInput;
    const currentQ = GUIDED_QUESTIONS[guidedStep];

    if (!currentQ) return;
    
    // Auto-advance logic for simple options
    if (!val && !currentQ.options) return;

    const currentKey = currentQ.key;
    if (currentKey === 'mode') setMode(val === 'Survivor' ? 'The Survivor (Prey Protocol)' : 'The Antagonist (Predator Protocol)');
    if (currentKey === 'perspective') setPerspective(val === 'First Person' ? 'First Person (Direct Immersion)' : 'Third Person (Observational Dread)');
    if (currentKey === 'starting_point') setStartingPoint(val);
    if (currentKey === 'cluster') setSelectedClusters([val]);
    if (currentKey === 'location_description') setLocationDescription(val);
    if (currentKey === 'visual_motif') setVisualMotif(val);
    if (currentKey === 'character_description') {
        setSurvivorBackground(val); // Simple mapping for guided
    }
    if (currentKey === 'intensity') {
        const levelNum = val.split(':')[0].trim();
        setIntensity(levelNum);
    }
    setGuidedAnswers([...guidedAnswers, val]);
    setGuidedInput('');
    if (guidedStep < GUIDED_QUESTIONS.length - 1) setGuidedStep(guidedStep + 1);
    else handleStart();
  };

  const toggleCluster = (id: string) => {
    setSelectedClusters(prev => 
      prev.includes(id) 
        ? (prev.length > 1 ? prev.filter(c => c !== id) : prev) 
        : [...prev, id]
    );
  };

  const handleStart = () => {
    setIsCalibrating(true);
    setTimeout(() => {
      onComplete({
        perspective: perspective.split(' (')[0],
        mode: mode.includes('Survivor') ? 'Survivor' : 'Villain',
        starting_point: startingPoint,
        cluster: selectedClusters.join(', '),
        intensity: intensity.split(':')[0].trim(),
        cycles: setupMode === 'simulation' ? testCycles : 0,
        visual_motif: visualMotif,
        location_description: locationDescription,
        // Villain Params
        villain_name: isVillain ? villainName : undefined,
        villain_appearance: isVillain ? villainAppearance : undefined,
        villain_methods: villainMethods,
        victim_description: isVillain ? victimDescription : undefined,
        primary_goal: isVillain ? primaryGoal : undefined,
        victim_count: isVillain ? victimCount : undefined,
        // Survivor Params
        survivor_name: !isVillain ? survivorName : undefined,
        survivor_background: !isVillain ? survivorBackground : undefined,
        survivor_traits: !isVillain ? survivorTraits : undefined,
      });
    }, 2000);
  };

  useEffect(() => {
    guidedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [guidedStep, guidedAnswers]);

  const renderGuidedMode = () => {
    const currentQuestion = GUIDED_QUESTIONS[guidedStep];
    if (!currentQuestion) return null;

    return (
      <div className="flex flex-col h-full bg-[#030303] animate-fadeIn p-6 md:p-10 relative overflow-hidden font-serif">
        {/* Progress Header */}
        <div className="flex gap-2 mb-8 flex-shrink-0">
          {GUIDED_QUESTIONS.map((_, i) => (
            <div key={i} className={`h-1 flex-1 transition-all duration-1000 ${i <= guidedStep ? 'bg-haunt-gold' : 'bg-gray-800'}`} />
          ))}
        </div>

        <div className="flex-1 flex flex-col lg:flex-row gap-12 overflow-hidden">
            {/* Left Column: Question & Interaction */}
            <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar pr-4">
                
                {/* Question Block - Taking significant visual weight */}
                <div className="mb-10 space-y-6 animate-fadeIn" key={`q-${guidedStep}`}>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl text-gray-100 leading-tight italic font-serif">
                        {currentQuestion.q}
                    </h2>
                    {currentQuestion.sub && (
                        <p className="text-gray-500 font-mono text-sm uppercase tracking-widest leading-relaxed border-l-2 border-haunt-gold/30 pl-4 py-1">
                            {currentQuestion.sub}
                        </p>
                    )}
                </div>

                {/* Interaction Area - Pushed to bottom or flex filled */}
                <div className="flex-1 flex flex-col justify-end pb-10">
                    {currentQuestion.options ? (
                        <div className={`grid gap-6 ${currentQuestion.type === 'grid' ? 'grid-cols-2 lg:grid-cols-3' : currentQuestion.type === 'list' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                            {currentQuestion.options.map((opt: any) => (
                                <button
                                    key={opt.id}
                                    onClick={() => handleGuidedNext(opt.id)}
                                    disabled={isCalibrating}
                                    className={`group relative border border-gray-800 bg-black/40 text-left p-8 hover:border-haunt-gold hover:bg-haunt-gold/5 transition-all rounded-sm flex flex-col gap-4 ${isCalibrating ? 'opacity-50' : ''}`}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div className="text-xs font-mono text-gray-500 group-hover:text-haunt-gold uppercase tracking-[0.2em]">{opt.sub || "Selection"}</div>
                                        {opt.icon && <opt.icon className="w-6 h-6 text-gray-600 group-hover:text-haunt-gold transition-colors" />}
                                    </div>
                                    <div className="text-3xl uppercase tracking-wider font-bold text-gray-200 group-hover:text-white font-serif">{opt.label}</div>
                                    {opt.desc && <div className="text-xs text-gray-500 leading-relaxed font-mono opacity-80 border-t border-gray-800 pt-3 mt-1 group-hover:border-haunt-gold/30">{opt.desc}</div>}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="max-w-3xl space-y-8 mt-4 relative">
                            <input 
                                type="text"
                                value={guidedInput}
                                onChange={(e) => setGuidedInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleGuidedNext()}
                                placeholder={currentQuestion.placeholder}
                                autoFocus
                                disabled={isCalibrating}
                                className="w-full bg-transparent border-b-2 border-gray-800 text-gray-100 text-3xl py-4 focus:outline-none focus:border-haunt-gold transition-all font-serif italic disabled:opacity-50 placeholder:text-gray-800 pr-12"
                            />
                            {currentQuestion.key === 'visual_motif' && (
                                <button 
                                    onClick={() => triggerImageUpload('Visual Motif')}
                                    disabled={isCalibrating || generatingFields['Visual Motif']}
                                    className="absolute right-4 top-4 text-gray-500 hover:text-haunt-gold transition-colors"
                                    title="Upload Image Reference"
                                >
                                    {generatingFields['Visual Motif'] ? <Loader2 className="w-6 h-6 animate-spin" /> : <Image className="w-6 h-6" />}
                                </button>
                            )}
                            {currentQuestion.hasHelper && (
                                <div className="absolute right-4 top-4 flex gap-2">
                                    <button
                                        onClick={handleGenerateCharacter}
                                        disabled={generatingFields['character_builder']}
                                        className="text-gray-500 hover:text-haunt-gold transition-colors flex items-center gap-2 bg-black/50 px-3 py-1 rounded-sm border border-gray-800 hover:border-haunt-gold/50"
                                        title="Help me build them"
                                    >
                                        {generatingFields['character_builder'] ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                        <span className="text-xs font-mono uppercase tracking-widest hidden md:inline">Help me build them</span>
                                    </button>
                                </div>
                            )}
                            <div className="flex justify-end">
                                <button 
                                    onClick={() => handleGuidedNext()} 
                                    disabled={!guidedInput.trim() || isCalibrating} 
                                    className="flex items-center gap-4 bg-haunt-gold text-black px-10 py-4 rounded-sm font-mono text-xs font-bold uppercase tracking-[0.3em] hover:bg-white transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                                >
                                    Confirm Signal <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Neural Pet (Top) & Manifest (Bottom) */}
            <div className="w-1/3 hidden lg:flex flex-col border-l border-gray-900 bg-[#050505] min-w-[350px]">
                {/* Machine Visualization Area (Top) - Fixed Height relative to viewport or flex grow */}
                <div className="flex-1 flex flex-col items-center justify-center relative p-8 border-b border-gray-900 overflow-hidden">
                    <div className="absolute top-6 left-6 text-[10px] font-mono text-red-600 uppercase tracking-[0.3em] z-10 font-bold border border-red-900/30 px-3 py-1 bg-red-950/10">Machine</div>
                    
                    {/* The Pet Graphic Container */}
                    <div className="relative w-full h-full flex items-center justify-center">
                        <NeuralPet 
                            step={guidedStep} 
                            answers={guidedAnswers}
                            currentInput={guidedInput}
                        />
                    </div>
                    
                    <div className="absolute bottom-6 w-full text-center">
                         <div className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.4em] animate-pulse">Waiting for Seed...</div>
                    </div>
                </div>
                
                {/* Session Manifest (Bottom) */}
                <div className="h-1/3 min-h-[200px] p-8 overflow-y-auto custom-scrollbar bg-black/40">
                    <div className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.4em] border-b border-gray-800 pb-4 mb-4 sticky top-0 bg-black/40 backdrop-blur-sm">Session Manifest</div>
                    <div className="space-y-3">
                        {guidedAnswers.map((ans, i) => (
                            <div key={i} className="flex justify-between items-start text-xs text-gray-500 font-mono animate-fadeIn border-l-2 border-gray-800 pl-3 py-1 group hover:border-haunt-gold transition-colors">
                                <span className="opacity-50 uppercase tracking-wider">{GUIDED_QUESTIONS[i]?.key}</span>
                                <span className="text-haunt-gold uppercase font-bold text-right ml-4 group-hover:text-white transition-colors line-clamp-2">{ans}</span>
                            </div>
                        ))}
                        {guidedAnswers.length === 0 && <div className="text-center text-xs text-gray-800 italic pt-10 uppercase tracking-widest">Awaiting Input...</div>}
                    </div>
                </div>
            </div>
        </div>

        <div className="pt-6 flex justify-between items-center border-t border-gray-900 mt-2 flex-shrink-0">
           <button onClick={() => setSetupMode('choice')} className="text-gray-600 hover:text-white transition-colors text-xs font-mono uppercase tracking-[0.4em]">Disconnect Session</button>
           <div className="text-[10px] font-mono text-gray-800 uppercase tracking-[0.5em]">Calibration in Progress // Step {guidedStep + 1} of {GUIDED_QUESTIONS.length}</div>
        </div>
      </div>
    );
  };

  const renderChoiceMode = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-12 animate-fadeIn p-8 md:p-16 relative z-10 overflow-hidden">
      <div className="text-center space-y-4 mb-4">
        <h2 className="text-5xl md:text-6xl font-serif italic tracking-wider text-white drop-shadow-md">
          I N I T I A L &nbsp; C A L I B R A T I O N
        </h2>
        <div className="relative inline-block">
             <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.4em] relative z-10">
                SELECT YOUR PATH INTO THE MACHINE
             </p>
             <p className="absolute top-0 left-0 w-full text-gray-500 font-mono text-xs uppercase tracking-[0.4em] animate-glitch opacity-50 pointer-events-none">
                WELCOME TO THE MACHINE
             </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-7xl flex-1 max-h-[60vh]">
        <button 
          onClick={() => setSetupMode('guided')}
          className="group relative h-full w-full border border-gray-800 bg-black/80 hover:bg-gray-900/40 hover:border-haunt-gold/50 transition-all duration-500 flex flex-col items-center justify-center text-center p-12 space-y-6 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-haunt-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="p-6 rounded-full border border-haunt-gold/20 bg-haunt-gold/5 group-hover:scale-110 group-hover:border-haunt-gold/50 transition-transform duration-500 relative z-10">
            <MessageSquare className="w-10 h-10 text-haunt-gold" />
          </div>
          <div className="relative z-10 space-y-3">
            <h3 className="text-2xl font-bold text-white uppercase tracking-widest">Lets Tell A Story Together</h3>
            <div className="text-xs font-mono font-bold text-haunt-gold uppercase tracking-[0.3em]">Guided Synthesis</div>
          </div>
          <p className="text-xs text-gray-500 uppercase leading-relaxed tracking-widest max-w-sm relative z-10 opacity-60 group-hover:opacity-100 transition-opacity">
            The Machine acts as your guide. Through evocative questioning, we will weave the fabric of your trauma together.
          </p>
        </button>

        <button 
          onClick={() => setSetupMode('manual')}
          className="group relative h-full w-full border border-gray-800 bg-black/80 hover:bg-gray-900/40 hover:border-fresh-blood/50 transition-all duration-500 flex flex-col items-center justify-center text-center p-12 space-y-6 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-fresh-blood/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="p-6 rounded-full border border-fresh-blood/20 bg-fresh-blood/5 group-hover:scale-110 group-hover:border-fresh-blood/50 transition-transform duration-500 relative z-10">
            <Settings className="w-10 h-10 text-fresh-blood" />
          </div>
          <div className="relative z-10 space-y-3">
            <h3 className="text-2xl font-bold text-white uppercase tracking-widest">I Want To Tell A Story</h3>
            <div className="text-xs font-mono font-bold text-fresh-blood uppercase tracking-[0.3em]">Manual Calibration</div>
          </div>
          <p className="text-xs text-gray-500 uppercase leading-relaxed tracking-widest max-w-sm relative z-10 opacity-60 group-hover:opacity-100 transition-opacity">
            Direct dashboard access. For architects who already know the exact shape of the nightmare they wish to inhabit.
          </p>
        </button>
      </div>

      <button 
        onClick={() => setSetupMode('simulation')}
        className="group relative w-full max-w-7xl border border-gray-800 bg-black/80 hover:bg-gray-900/40 hover:border-amber-500/50 transition-all duration-500 flex items-center justify-center p-10 space-x-12 overflow-hidden min-h-[180px]"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="p-5 rounded-full border border-amber-500/20 bg-amber-500/5 group-hover:scale-110 group-hover:border-amber-500/50 transition-transform duration-500 relative z-10 flex-shrink-0">
             <Bot className="w-8 h-8 text-amber-500" />
        </div>
        <div className="flex flex-col items-start relative z-10 space-y-2 text-left">
            <h3 className="text-xl font-bold text-white uppercase tracking-widest">Tell Me A Story</h3>
            <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-[0.2em]">Test Protocol</span>
                <span className="text-[10px] text-gray-600 uppercase tracking-widest">Diagnostic Sequence // Autonomous Diagnostics</span>
            </div>
            <p className="text-[11px] text-gray-500 uppercase leading-relaxed tracking-widest max-w-2xl pt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                The machine executes a self-contained test loop. No user input required. Used for validating narrative pathfinding and atmospheric cohesion.
            </p>
        </div>
      </button>

      <div className="absolute bottom-6 left-0 w-full text-center">
        <p className="text-[10px] text-gray-700 font-mono uppercase tracking-[0.6em] animate-pulse">
            System idling... Awaiting User Volition.
        </p>
      </div>
    </div>
  );

  const renderManualMode = () => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="h-2 bg-fresh-blood/20 relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-fresh-blood w-1/4 animate-[scanline_2s_linear_infinite]" />
      </div>
      <div className="flex-1 p-12 md:p-16 space-y-12 overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between border-b border-fresh-blood/30 pb-10">
          <div className="flex items-center gap-6">
            <ShieldAlert className="w-14 h-14 text-fresh-blood animate-pulse" />
            <div>
              <h2 className="font-mono text-5xl font-bold tracking-[0.25em] uppercase text-fresh-blood">Manual Calibration</h2>
              <p className="text-sm font-mono text-gray-500 tracking-[0.4em] uppercase mt-2">Direct Hardware Interface // Neural Synchronization</p>
            </div>
          </div>
          <button 
            onClick={() => setSetupMode('choice')}
            className="text-gray-600 hover:text-white transition-colors text-xs uppercase tracking-[0.5em] flex items-center gap-3 border border-gray-800 px-8 py-4 bg-black/40 hover:bg-gray-800/40"
          >
            Switch Mode
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          <div className="space-y-4 group relative">
            <label className="text-sm font-mono text-gray-400 uppercase flex items-center gap-3 tracking-[0.3em]">
              <Eye className="w-6 h-6 text-fresh-blood" /> Narrative Lens
            </label>
            <select 
              value={perspective} 
              onChange={(e) => setPerspective(e.target.value)}
              className="w-full bg-black border-2 border-gray-800 text-gray-200 p-6 font-mono text-lg focus:border-fresh-blood outline-none transition-all hover:bg-gray-900 cursor-pointer appearance-none rounded-sm"
            >
              <option value="First Person (Direct Immersion)">First Person (Direct Immersion)</option>
              <option value="Third Person (Observational Dread)">Third Person (Observational Dread)</option>
            </select>
          </div>
          <div className="space-y-4 group relative">
            <label className="text-sm font-mono text-gray-400 uppercase flex items-center gap-3 tracking-[0.3em]">
              <Cpu className="w-6 h-6 text-fresh-blood" /> Specimen Role
            </label>
            <select 
              value={mode} 
              onChange={(e) => setMode(e.target.value)}
              className="w-full bg-black border-2 border-gray-800 text-gray-200 p-6 font-mono text-lg focus:border-fresh-blood outline-none transition-all hover:bg-gray-900 cursor-pointer appearance-none rounded-sm"
            >
              <option value="The Survivor (Prey Protocol)">The Survivor (Prey Protocol)</option>
              <option value="The Antagonist (Predator Protocol)">The Antagonist (Predator Protocol)</option>
            </select>
          </div>
          <div className="space-y-4 group relative">
            <label className="text-sm font-mono text-gray-400 uppercase flex items-center gap-3 tracking-[0.3em]">
              <Hourglass className="w-6 h-6 text-fresh-blood" /> Temporal Point
            </label>
            <select 
              value={startingPoint} 
              onChange={(e) => setStartingPoint(e.target.value)}
              className="w-full bg-black border-2 border-gray-800 text-gray-200 p-6 font-mono text-lg focus:border-fresh-blood outline-none transition-all hover:bg-gray-900 cursor-pointer appearance-none rounded-sm"
            >
              {STARTING_POINT_OPTIONS.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.label} - {opt.desc}</option>
              ))}
            </select>
          </div>
          
          <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-6">
            <label className="text-sm font-mono text-gray-400 uppercase flex items-center gap-3 tracking-[0.3em]">
              <Settings className="w-6 h-6 text-fresh-blood" /> Thematic Resonance Clusters
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {CLUSTER_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => toggleCluster(opt.id)}
                  className={`p-5 border-2 text-left rounded-sm transition-all duration-300 relative group overflow-visible ${
                    selectedClusters.includes(opt.id)
                      ? `${opt.color} bg-black ring-2 ring-fresh-blood/50 shadow-[inset_0_0_20px_rgba(136,8,8,0.3)]`
                      : 'border-gray-800 text-gray-600 hover:border-gray-600 hover:bg-gray-900/50'
                  }`}
                >
                  <div className="relative z-10 flex flex-col justify-between h-full space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="text-xs font-bold uppercase tracking-widest leading-none">{opt.label}</div>
                      {selectedClusters.includes(opt.id) && <Check className="w-4 h-4 flex-shrink-0" />}
                    </div>
                    <div className="text-[10px] opacity-60 leading-tight uppercase tracking-tighter">{opt.desc}</div>
                  </div>
                  <Tooltip text={opt.tooltip} />
                </button>
              ))}
            </div>
          </div>
          <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-terminal/40 p-10 border border-gray-800 space-y-10 rounded-sm">
             <div className="text-fresh-blood font-mono text-xl font-bold uppercase tracking-[0.4em] flex items-center gap-5 border-b border-fresh-blood/10 pb-5">
                <MapPin className="w-8 h-8" /> Environmental Matrix
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4 group relative">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-mono text-gray-400 uppercase flex items-center gap-3 tracking-[0.3em]">
                            Initial Location
                        </label>
                        <ActionButtons fieldKey="Initial Location" value={locationDescription} />
                    </div>
                    <textarea 
                        value={locationDescription}
                        onChange={(e) => setLocationDescription(e.target.value)}
                        placeholder="Describe the architecture of the starting ordeal..."
                        className="w-full h-32 bg-black border-2 border-gray-800 text-gray-200 p-6 font-mono text-sm focus:border-fresh-blood outline-none transition-all resize-none custom-scrollbar placeholder:text-gray-900 hover:bg-gray-900 rounded-sm"
                    />
                </div>
                <div className="space-y-4 group relative">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-mono text-gray-400 uppercase flex items-center gap-3 tracking-[0.3em]">
                            <Image className="w-6 h-6 text-fresh-blood" /> Visual Motif
                        </label>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => triggerImageUpload('Visual Motif')}
                                disabled={generatingFields['Visual Motif']}
                                className="p-1.5 hover:bg-white/5 rounded-sm transition-colors text-gray-500 hover:text-fresh-blood disabled:opacity-50"
                                title="Upload Image Reference"
                            >
                                <Upload className="w-3.5 h-3.5" />
                            </button>
                            <ActionButtons fieldKey="Visual Motif" value={visualMotif} />
                        </div>
                    </div>
                    <input 
                        type="text"
                        value={visualMotif}
                        onChange={(e) => setVisualMotif(e.target.value)}
                        placeholder="e.g. Grainy 8mm film, Neon Noir..."
                        className="w-full bg-black border-2 border-gray-800 text-gray-200 p-6 font-mono text-lg focus:border-fresh-blood outline-none transition-all placeholder:text-gray-900 hover:bg-gray-900 rounded-sm"
                    />
                </div>
             </div>
          </div>
          <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-4 group relative">
            <label className="text-sm font-mono text-gray-400 uppercase flex items-center gap-3 tracking-[0.3em]">
              <Zap className="w-6 h-6 text-fresh-blood" /> Fidelity Level
            </label>
            <select 
              value={intensity} 
              onChange={(e) => setIntensity(e.target.value)}
              className="w-full bg-black border-2 border-gray-800 text-gray-200 p-6 font-mono text-lg focus:border-fresh-blood outline-none transition-all hover:bg-gray-900 cursor-pointer appearance-none rounded-sm"
            >
                {INTENSITY_OPTIONS.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
            </select>
          </div>
          {isVillain && (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-12 border-y-2 border-fresh-blood/20 py-16 animate-fadeIn bg-red-950/5 px-8">
              <div className="text-red-500 font-mono text-2xl font-bold uppercase tracking-[0.5em] flex items-center gap-6">
                 <Target className="w-10 h-10 animate-pulse" /> Antagonist Specifications
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                <div className="space-y-4 group relative">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-gray-500 uppercase flex items-center gap-3 tracking-[0.2em]">
                      <Skull className="w-5 h-5" /> Entity Name
                    </label>
                    <ActionButtons fieldKey="Entity Name" value={villainName} />
                  </div>
                  <input 
                    type="text"
                    value={villainName}
                    onChange={(e) => setVillainName(e.target.value)}
                    placeholder="Enter your name or title..."
                    className="w-full bg-black border-2 border-gray-800 text-gray-200 p-6 font-mono text-sm focus:border-red-600 outline-none transition-all placeholder:text-gray-900 hover:bg-gray-900 rounded-sm"
                  />
                </div>
                <div className="space-y-4 group relative">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-gray-500 uppercase flex items-center gap-3 tracking-[0.2em]">
                      <Skull className="w-5 h-5" /> Form & Appearance
                    </label>
                    <ActionButtons fieldKey="Form & Appearance" value={villainAppearance} />
                  </div>
                  <textarea 
                    value={villainAppearance}
                    onChange={(e) => setVillainAppearance(e.target.value)}
                    placeholder="Describe your physical form..."
                    className="w-full h-48 bg-black border-2 border-gray-800 text-gray-200 p-6 font-mono text-sm focus:border-red-600 outline-none transition-all resize-none custom-scrollbar placeholder:text-gray-900 hover:bg-gray-900 rounded-sm"
                  />
                </div>
                <div className="space-y-4 group relative">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-gray-500 uppercase flex items-center gap-3 tracking-[0.2em]">
                      <Wand2 className="w-5 h-5" /> Modus Operandi
                    </label>
                    <ActionButtons fieldKey="Modus Operandi" value={villainMethods} />
                  </div>
                  <textarea 
                    value={villainMethods}
                    onChange={(e) => setVillainMethods(e.target.value)}
                    placeholder="How do you stalk?"
                    className="w-full h-48 bg-black border-2 border-gray-800 text-gray-200 p-6 font-mono text-sm focus:border-red-600 outline-none transition-all resize-none custom-scrollbar placeholder:text-gray-900 hover:bg-gray-900 rounded-sm"
                  />
                </div>
                <div className="space-y-4 group relative">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-gray-500 uppercase flex items-center gap-3 tracking-[0.2em]">
                      <Users className="w-5 h-5" /> Specimen Targets
                    </label>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => triggerImageUpload('Specimen Targets')}
                            disabled={generatingFields['Specimen Targets']}
                            className="p-1.5 hover:bg-white/5 rounded-sm transition-colors text-gray-500 hover:text-fresh-blood disabled:opacity-50"
                            title="Upload Image Reference for Victims"
                        >
                            <Upload className="w-3.5 h-3.5" />
                        </button>
                        <ActionButtons fieldKey="Specimen Targets" value={victimDescription} />
                    </div>
                  </div>
                  <textarea 
                    value={victimDescription}
                    onChange={(e) => setVictimDescription(e.target.value)}
                    placeholder="Who are the victims?"
                    className="w-full h-48 bg-black border-2 border-gray-800 text-gray-200 p-6 font-mono text-sm focus:border-red-600 outline-none transition-all resize-none custom-scrollbar placeholder:text-gray-900 hover:bg-gray-900 rounded-sm"
                  />
                </div>
                <div className="space-y-4 group relative">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-gray-500 uppercase flex items-center gap-3 tracking-[0.2em]">
                      <Target className="w-5 h-5" /> Primary Objective
                    </label>
                    <ActionButtons fieldKey="Primary Objective" value={primaryGoal} />
                  </div>
                  <input 
                    type="text"
                    value={primaryGoal}
                    onChange={(e) => setPrimaryGoal(e.target.value)}
                    placeholder="What is your ultimate goal?"
                    className="w-full bg-black border-2 border-gray-800 text-gray-200 p-6 font-mono text-sm focus:border-red-600 outline-none transition-all placeholder:text-gray-900 hover:bg-gray-900 rounded-sm"
                  />
                </div>
                <div className="space-y-4 group relative">
                  <label className="text-xs font-mono text-gray-500 uppercase flex items-center gap-3 tracking-[0.2em]">
                    Population Count
                  </label>
                  <div className="flex items-center gap-6 bg-black border-2 border-gray-800 p-6 rounded-sm">
                    <input 
                      type="range"
                      min="1"
                      max="10"
                      value={victimCount}
                      onChange={(e) => setVictimCount(parseInt(e.target.value) || 1)}
                      className="flex-1 accent-fresh-blood h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-fresh-blood font-mono text-xl w-8 font-bold">{victimCount}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isVillain && (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-12 border-y-2 border-system-green/20 py-16 animate-fadeIn bg-green-950/5 px-8">
              <div className="flex justify-between items-center border-b border-system-green/20 pb-6 mb-6">
                  <div className="text-system-green font-mono text-2xl font-bold uppercase tracking-[0.5em] flex items-center gap-6">
                     <UserCheck className="w-10 h-10 animate-pulse" /> Protagonist Identity
                  </div>
                  <button
                    onClick={handleGenerateCharacter}
                    disabled={generatingFields['character_builder']}
                    className="flex items-center gap-3 px-6 py-3 border border-system-green/50 hover:bg-system-green/10 text-system-green transition-all rounded-sm uppercase font-mono text-xs tracking-widest disabled:opacity-50"
                  >
                     {generatingFields['character_builder'] ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                     Help Me Build Them
                  </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4 group relative">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-gray-500 uppercase flex items-center gap-3 tracking-[0.2em]">
                      <Users className="w-5 h-5" /> Identity Name
                    </label>
                    <ActionButtons fieldKey="Identity Name" value={survivorName} />
                  </div>
                  <input 
                    type="text"
                    value={survivorName}
                    onChange={(e) => setSurvivorName(e.target.value)}
                    placeholder="Who are you?"
                    className="w-full bg-black border-2 border-gray-800 text-gray-200 p-6 font-mono text-sm focus:border-system-green outline-none transition-all placeholder:text-gray-900 hover:bg-gray-900 rounded-sm"
                  />
                </div>
                
                <div className="space-y-4 group relative md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-gray-500 uppercase flex items-center gap-3 tracking-[0.2em]">
                      <StickyNote className="w-5 h-5" /> Backstory & Origin
                    </label>
                    <ActionButtons fieldKey="Backstory" value={survivorBackground} />
                  </div>
                  <textarea 
                    value={survivorBackground}
                    onChange={(e) => setSurvivorBackground(e.target.value)}
                    placeholder="What brought you here? What are you running from?"
                    className="w-full h-32 bg-black border-2 border-gray-800 text-gray-200 p-6 font-mono text-sm focus:border-system-green outline-none transition-all resize-none custom-scrollbar placeholder:text-gray-900 hover:bg-gray-900 rounded-sm"
                  />
                </div>

                <div className="space-y-4 group relative md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-gray-500 uppercase flex items-center gap-3 tracking-[0.2em]">
                      <Fingerprint className="w-5 h-5" /> Traits & Flaws
                    </label>
                    <ActionButtons fieldKey="Traits & Flaws" value={survivorTraits} />
                  </div>
                  <textarea 
                    value={survivorTraits}
                    onChange={(e) => setSurvivorTraits(e.target.value)}
                    placeholder="Your strengths, your weaknesses, your scars..."
                    className="w-full h-32 bg-black border-2 border-gray-800 text-gray-200 p-6 font-mono text-sm focus:border-system-green outline-none transition-all resize-none custom-scrollbar placeholder:text-gray-900 hover:bg-gray-900 rounded-sm"
                  />
                </div>
              </div>
            </div>
          )}

        </div>
        <div className="pt-16 pb-12 border-t-2 border-fresh-blood/10 flex flex-col items-center flex-shrink-0 bg-black/20">
          <button
            onClick={handleStart}
            disabled={isCalibrating}
            className={`group relative w-full max-w-2xl py-8 bg-fresh-blood text-black font-mono font-bold uppercase tracking-[0.6em] transition-all hover:bg-red-700 active:scale-[0.98] ${isCalibrating ? 'opacity-50 cursor-not-allowed' : ''} shadow-[0_0_50px_rgba(136,8,8,0.5)] rounded-sm text-xl`}
          >
            <span className="relative z-10 flex items-center justify-center gap-6">
              {isCalibrating ? <>CALIBRATING SENSORS...</> : <><Play className="w-8 h-8 fill-black" /> INITIALIZE SIMULATION</>}
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderSimulationMode = () => (
    <div className="flex flex-col h-full overflow-hidden bg-[#0a0a0a]">
      {/* Header */}
      <div className="p-10 border-b border-amber-500/20 bg-amber-950/10 flex-shrink-0 flex items-center gap-6">
         <Bot className="w-12 h-12 text-amber-500" />
         <div>
            <h2 className="text-4xl font-serif italic text-amber-500 tracking-wide">Telling you a story about...</h2>
            <p className="text-sm font-mono text-amber-700/80 uppercase tracking-widest mt-1">Sit back. I'll handle the nightmare.</p>
         </div>
      </div>

      {/* Scrollable Form */}
      <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
         
         {/* Story Length */}
         <div className="space-y-4 p-6 border border-gray-800 rounded-sm bg-black/40">
            <label className="text-xs font-mono text-amber-600 uppercase tracking-[0.2em] flex items-center gap-2">
               <Timer className="w-4 h-4" /> Story Length
            </label>
            <div className="flex items-center gap-6">
                <input 
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={testCycles}
                  onChange={(e) => setTestCycles(parseInt(e.target.value))}
                  className="flex-1 accent-amber-500 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-amber-500 font-mono text-xl w-16 text-right font-bold">{testCycles} Turns</span>
            </div>
         </div>

         {/* Clusters (Reuse from Manual) */}
         <div className="space-y-6">
            <label className="text-sm font-mono text-gray-400 uppercase flex items-center gap-3 tracking-[0.3em]">
              <Settings className="w-6 h-6 text-amber-600" /> Thematic Ingredients
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {CLUSTER_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => toggleCluster(opt.id)}
                  className={`p-4 border text-left rounded-sm transition-all duration-300 relative group ${
                    selectedClusters.includes(opt.id)
                      ? `border-amber-600 bg-amber-900/20 text-amber-500`
                      : 'border-gray-800 text-gray-600 hover:border-gray-600 hover:bg-gray-900/50'
                  }`}
                >
                  <div className="text-xs font-bold uppercase tracking-widest mb-2">{opt.label}</div>
                  {selectedClusters.includes(opt.id) && <Check className="absolute top-2 right-2 w-3 h-3" />}
                </button>
              ))}
            </div>
         </div>

         {/* Mode & Intensity Row */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-4">
                <label className="text-xs font-mono text-gray-500 uppercase tracking-widest">Focus</label>
                <select 
                  value={mode} 
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full bg-black border border-gray-800 text-gray-300 p-4 font-mono text-sm focus:border-amber-600 outline-none rounded-sm"
                >
                  <option value="The Survivor (Prey Protocol)">Survivor's Perspective</option>
                  <option value="The Antagonist (Predator Protocol)">Villain's Perspective</option>
                </select>
             </div>
             <div className="space-y-4">
                <label className="text-xs font-mono text-gray-500 uppercase tracking-widest">Intensity</label>
                <select 
                  value={intensity} 
                  onChange={(e) => setIntensity(e.target.value)}
                  className="w-full bg-black border border-gray-800 text-gray-300 p-4 font-mono text-sm focus:border-amber-600 outline-none rounded-sm"
                >
                    {INTENSITY_OPTIONS.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                </select>
             </div>
         </div>

         {/* Location & Motif */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <label className="text-xs font-mono text-gray-500 uppercase tracking-widest">Setting</label>
                    <ActionButtons fieldKey="Initial Location" value={locationDescription} />
                </div>
                <textarea 
                    value={locationDescription}
                    onChange={(e) => setLocationDescription(e.target.value)}
                    placeholder="Where does the story take place?"
                    className="w-full h-32 bg-black border border-gray-800 text-gray-300 p-4 font-mono text-sm focus:border-amber-600 outline-none resize-none rounded-sm"
                />
            </div>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <label className="text-xs font-mono text-gray-500 uppercase tracking-widest">Visual Style</label>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => triggerImageUpload('Visual Motif')}
                            disabled={generatingFields['Visual Motif']}
                            className="p-1.5 hover:bg-white/5 rounded-sm transition-colors text-gray-500 hover:text-amber-500 disabled:opacity-50"
                            title="Upload Image Reference"
                        >
                            <Upload className="w-3.5 h-3.5" />
                        </button>
                        <ActionButtons fieldKey="Visual Motif" value={visualMotif} />
                    </div>
                </div>
                <textarea 
                    value={visualMotif}
                    onChange={(e) => setVisualMotif(e.target.value)}
                    placeholder="Cinematic style..."
                    className="w-full h-32 bg-black border border-gray-800 text-gray-300 p-4 font-mono text-sm focus:border-amber-600 outline-none resize-none rounded-sm"
                />
            </div>
         </div>

         {/* Conditional Villain Fields */}
         {mode.includes('Antagonist') && (
             <div className="p-8 border border-red-900/30 bg-red-950/10 rounded-sm space-y-6">
                 <div className="text-red-500 font-mono text-sm uppercase tracking-[0.2em] font-bold">Villain Definition</div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-[10px] font-mono text-gray-500 uppercase">Name</label>
                            <ActionButtons fieldKey="Entity Name" value={villainName} />
                        </div>
                        <input value={villainName} onChange={e => setVillainName(e.target.value)} className="w-full bg-black border border-gray-800 p-3 text-sm text-red-200 focus:border-red-600 outline-none" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-[10px] font-mono text-gray-500 uppercase">Goal</label>
                            <ActionButtons fieldKey="Primary Objective" value={primaryGoal} />
                        </div>
                        <input value={primaryGoal} onChange={e => setPrimaryGoal(e.target.value)} className="w-full bg-black border border-gray-800 p-3 text-sm text-red-200 focus:border-red-600 outline-none" />
                    </div>
                 </div>
             </div>
         )}
         
         {!isVillain && (
             <div className="p-8 border border-green-900/30 bg-green-950/10 rounded-sm space-y-6">
                 <div className="flex justify-between items-center">
                     <div className="text-system-green font-mono text-sm uppercase tracking-[0.2em] font-bold">Survivor Definition</div>
                     <button
                        onClick={handleGenerateCharacter}
                        disabled={generatingFields['character_builder']}
                        className="text-[10px] font-mono uppercase tracking-widest text-system-green hover:text-white transition-colors disabled:opacity-50"
                     >
                        {generatingFields['character_builder'] ? "Building..." : "Auto-Build"}
                     </button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-[10px] font-mono text-gray-500 uppercase">Name</label>
                            <ActionButtons fieldKey="Identity Name" value={survivorName} />
                        </div>
                        <input value={survivorName} onChange={e => setSurvivorName(e.target.value)} className="w-full bg-black border border-gray-800 p-3 text-sm text-gray-200 focus:border-system-green outline-none rounded-sm" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-[10px] font-mono text-gray-500 uppercase">Background</label>
                            <ActionButtons fieldKey="Backstory" value={survivorBackground} />
                        </div>
                        <input value={survivorBackground} onChange={e => setSurvivorBackground(e.target.value)} className="w-full bg-black border border-gray-800 p-3 text-sm text-gray-200 focus:border-system-green outline-none rounded-sm" />
                    </div>
                 </div>
             </div>
         )}

      </div>

      {/* Footer Actions */}
      <div className="p-8 border-t border-gray-800 bg-black/40 flex justify-between items-center flex-shrink-0">
          <button 
            onClick={() => setSetupMode('choice')}
            className="text-xs font-mono text-gray-500 hover:text-white uppercase tracking-widest transition-colors"
          >
            Back to Selection
          </button>
          
          <button
            onClick={handleStart}
            disabled={isCalibrating}
            className={`px-10 py-4 bg-amber-600 text-black font-mono font-bold uppercase tracking-[0.2em] hover:bg-amber-500 transition-all rounded-sm ${isCalibrating ? 'opacity-50' : ''}`}
          >
            {isCalibrating ? 'Weaving...' : 'Begin Story'}
          </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] bg-black text-gray-200 font-sans selection:bg-fresh-blood selection:text-black">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={handleImageUpload}
      />
      {setupMode === 'choice' && renderChoiceMode()}
      {setupMode === 'manual' && renderManualMode()}
      {setupMode === 'guided' && renderGuidedMode()}
      {setupMode === 'simulation' && renderSimulationMode()}
    </div>
  );
};