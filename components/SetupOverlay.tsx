
import React, { useState, useEffect, useRef } from 'react';
import { Terminal, ShieldAlert, Cpu, Eye, Settings, Image, Zap, Play, Check, Users, Target, UserCheck, Skull, Wand2, Info, ChevronRight, MessageSquare, Monitor, Loader2, Sparkles, StickyNote } from 'lucide-react';
import { SimulationConfig } from '../types';
import { generateCalibrationField } from '../services/geminiService';

interface SetupOverlayProps {
  onComplete: (config: SimulationConfig) => void;
}

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

const Tooltip: React.FC<{ text: string }> = ({ text }) => (
  <div className="absolute bottom-full mb-2 left-0 w-80 p-4 bg-black border border-gray-700 text-xs text-gray-300 font-mono leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-[0_0_30px_rgba(0,0,0,0.9)] backdrop-blur-md rounded-sm border-l-4 border-l-fresh-blood">
    <div className="flex items-center gap-2 mb-2 text-fresh-blood uppercase font-bold tracking-tighter text-sm">
      <Info className="w-4 h-4" /> System Intel
    </div>
    {text}
  </div>
);

export const SetupOverlay: React.FC<SetupOverlayProps> = ({ onComplete }) => {
  const [setupMode, setSetupMode] = useState<'choice' | 'manual' | 'guided'>('choice');
  const [perspective, setPerspective] = useState('First Person (Direct Immersion)');
  const [mode, setMode] = useState('The Survivor (Prey Protocol)');
  const [selectedClusters, setSelectedClusters] = useState<string[]>(['Flesh']);
  const [intensity, setIntensity] = useState('Visceral (Explicit Physicality)');
  const [visualMotif, setVisualMotif] = useState('');
  const [isCalibrating, setIsCalibrating] = useState(false);

  // Field Generation States
  const [generatingFields, setGeneratingFields] = useState<Record<string, boolean>>({});

  // Villain Mode specific states
  const isVillain = mode.includes('Antagonist');
  const [villainName, setVillainName] = useState('');
  const [villainAppearance, setVillainAppearance] = useState('');
  const [villainMethods, setVillainMethods] = useState('');
  const [victimDescription, setVictimDescription] = useState('');
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [victimCount, setVictimCount] = useState(3);

  // Guided Setup State
  const [guidedStep, setGuidedStep] = useState(0);
  const [guidedAnswers, setGuidedAnswers] = useState<string[]>([]);
  const [guidedInput, setGuidedInput] = useState('');
  const guidedEndRef = useRef<HTMLDivElement>(null);

  const GUIDED_QUESTIONS = [
    {
      q: "The machine hums as it samples your pulse. Tell me... who is the center of this tragedy? A hunter seeking truth through violence, or the hunted, desperate for one more breath?",
      options: ["Survivor", "Villain"],
      key: "mode"
    },
    {
      q: "And through which lens shall we observe the decay? Do you wish to feel the heat of the trauma directly, or observe from a cinematic distance?",
      options: ["First Person", "Third Person"],
      key: "perspective"
    },
    {
      q: "Choose your resonance. Which flavor of despair speaks to you? Flesh, System, Haunting, Self, Blasphemy, Void, or Hunger?",
      options: CLUSTER_OPTIONS.map(o => o.id),
      key: "cluster"
    },
    {
      q: "Describe the visual motif of this nightmare. Is it a grainy 8mm film? A neon-drenched cityscape? A desaturated oil painting of the end?",
      placeholder: "e.g. Gritty 70s slasher, Static-heavy VHS...",
      key: "visual_motif"
    },
    {
      q: "Finally... how much fidelity can your psyche withstand? Atmospheric dread, visceral physicality, or the extreme transgressive truth?",
      options: ["PG-13", "R", "Extreme"],
      key: "intensity"
    }
  ];

  const handleGenerateField = async (field: string, useNotes: boolean = false) => {
    setGeneratingFields(prev => ({ ...prev, [field]: true }));
    
    // Determine existing value based on field
    let existingValue = '';
    if (field === 'Entity Name') existingValue = villainName;
    else if (field === 'Form & Appearance') existingValue = villainAppearance;
    else if (field === 'Modus Operandi') existingValue = villainMethods;
    else if (field === 'Specimen Targets') existingValue = victimDescription;
    else if (field === 'Primary Objective') existingValue = primaryGoal;
    else if (field === 'Visual Motif') existingValue = visualMotif;

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
    } catch (error) {
      console.error("Failed to generate field:", error);
    } finally {
      setGeneratingFields(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleGuidedNext = (answer?: string) => {
    const val = answer || guidedInput;
    if (!val && !GUIDED_QUESTIONS[guidedStep].options) return;

    const currentKey = GUIDED_QUESTIONS[guidedStep].key;
    if (currentKey === 'mode') setMode(val === 'Survivor' ? 'The Survivor (Prey Protocol)' : 'The Antagonist (Predator Protocol)');
    if (currentKey === 'perspective') setPerspective(val === 'First Person' ? 'First Person (Direct Immersion)' : 'Third Person (Observational Dread)');
    if (currentKey === 'cluster') setSelectedClusters([val]);
    if (currentKey === 'visual_motif') setVisualMotif(val);
    if (currentKey === 'intensity') setIntensity(val === 'PG-13' ? 'Atmospheric (Psychological Focus)' : val === 'R' ? 'Visceral (Explicit Physicality)' : 'Extreme (Transgressive Apotheosis)');

    setGuidedAnswers([...guidedAnswers, val]);
    setGuidedInput('');
    
    if (guidedStep < GUIDED_QUESTIONS.length - 1) {
      setGuidedStep(guidedStep + 1);
    } else {
      handleStart();
    }
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
        starting_point: 'Prologue',
        cluster: selectedClusters.join(', '),
        intensity: intensity.split(' (')[0],
        cycles: 40,
        visual_motif: visualMotif,
        villain_name: isVillain ? villainName : undefined,
        villain_appearance: isVillain ? villainAppearance : undefined,
        villain_methods: isVillain ? villainMethods : undefined,
        victim_description: isVillain ? victimDescription : undefined,
        primary_goal: isVillain ? primaryGoal : undefined,
        victim_count: isVillain ? victimCount : undefined,
      });
    }, 2000);
  };

  useEffect(() => {
    guidedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [guidedStep, guidedAnswers]);

  const renderChoiceMode = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-16 animate-fadeIn">
      <div className="text-center space-y-6">
        <h2 className="text-6xl font-serif tracking-[0.4em] text-white uppercase italic drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">Initial Calibration</h2>
        <p className="text-gray-500 font-mono text-sm uppercase tracking-[0.3em]">Select your path into the machine</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-6xl px-12">
        <button 
          onClick={() => setSetupMode('guided')}
          className="group relative p-12 border-2 border-gray-800 bg-black hover:border-haunt-gold transition-all duration-700 rounded-sm flex flex-col items-center text-center space-y-8 shadow-[0_0_40px_rgba(0,0,0,0.8)] hover:shadow-[0_0_80px_rgba(180,83,9,0.15)]"
        >
          <div className="p-6 bg-haunt-gold/10 rounded-full border-2 border-haunt-gold/30 group-hover:scale-110 group-hover:bg-haunt-gold/20 transition-all">
            <MessageSquare className="w-12 h-12 text-haunt-gold" />
          </div>
          <div>
            <h3 className="text-3xl font-mono font-bold text-haunt-gold uppercase tracking-tighter">Guided Synthesis</h3>
            <p className="text-xs text-gray-500 uppercase mt-4 leading-relaxed tracking-widest max-w-sm">The Machine acts as your guide. Through evocative questioning, we will weave the fabric of your trauma together.</p>
          </div>
          <div className="flex items-center gap-3 text-haunt-gold text-xs font-bold uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-opacity">
            Initialize Dialogue <ChevronRight className="w-4 h-4" />
          </div>
        </button>

        <button 
          onClick={() => setSetupMode('manual')}
          className="group relative p-12 border-2 border-gray-800 bg-black hover:border-fresh-blood transition-all duration-700 rounded-sm flex flex-col items-center text-center space-y-8 shadow-[0_0_40px_rgba(0,0,0,0.8)] hover:shadow-[0_0_80px_rgba(136,8,8,0.15)]"
        >
          <div className="p-6 bg-fresh-blood/10 rounded-full border-2 border-fresh-blood/30 group-hover:scale-110 group-hover:bg-fresh-blood/20 transition-all">
            <Settings className="w-12 h-12 text-fresh-blood" />
          </div>
          <div>
            <h3 className="text-3xl font-mono font-bold text-fresh-blood uppercase tracking-tighter">Manual Calibration</h3>
            <p className="text-xs text-gray-500 uppercase mt-4 leading-relaxed tracking-widest max-w-sm">Direct dashboard access. For architects who already know the exact shape of the nightmare they wish to inhabit.</p>
          </div>
          <div className="flex items-center gap-3 text-fresh-blood text-xs font-bold uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-opacity">
            Access Dashboard <ChevronRight className="w-4 h-4" />
          </div>
        </button>
      </div>

      <p className="text-xs text-gray-600 font-mono uppercase tracking-[0.5em] opacity-40 animate-pulse">
        System idling... Awaiting User Volition.
      </p>
    </div>
  );

  const renderGuidedMode = () => (
    <div className="flex flex-col h-full bg-black/60 font-mono p-12 md:p-16 animate-fadeIn relative">
      <div className="flex items-center gap-4 border-b border-haunt-gold/20 pb-6 mb-12">
        <Monitor className="w-8 h-8 text-haunt-gold animate-pulse" />
        <span className="text-haunt-gold font-bold uppercase tracking-[0.4em] text-sm">GUIDED_SYNTHESIS_TERMINAL // v3.1</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-16 custom-scrollbar pr-8 pb-32">
        {guidedAnswers.map((ans, idx) => (
          <div key={idx} className="space-y-6 animate-fadeIn">
            <div className="text-haunt-gold/60 text-sm italic leading-relaxed max-w-4xl">
              {GUIDED_QUESTIONS[idx].q}
            </div>
            <div className="text-white text-xl font-bold border-l-4 border-haunt-gold pl-8 tracking-[0.2em] uppercase">
              {ans}
            </div>
          </div>
        ))}

        {isCalibrating ? (
           <div className="flex flex-col items-center justify-center py-32 space-y-10">
              <Loader2 className="w-20 h-20 text-fresh-blood animate-spin" />
              <div className="text-fresh-blood font-bold tracking-[0.7em] uppercase text-3xl animate-pulse">Neural Linking...</div>
              <p className="text-gray-500 text-sm text-center max-w-2xl tracking-widest uppercase leading-relaxed">Synchronizing thematic clusters. Constructing spatial logic. Harvesting Ancestral Sins.</p>
           </div>
        ) : (
          <div className="space-y-10 animate-fadeIn">
            <div className="text-haunt-gold text-2xl leading-relaxed max-w-4xl font-serif italic border-l-4 border-white/10 pl-10 py-4 bg-white/5 rounded-r-lg">
              {GUIDED_QUESTIONS[guidedStep].q}
            </div>

            {GUIDED_QUESTIONS[guidedStep].options ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                {GUIDED_QUESTIONS[guidedStep].options?.map(opt => (
                  <button
                    key={opt}
                    onClick={() => handleGuidedNext(opt)}
                    className="p-6 border border-gray-800 bg-black/40 text-left text-sm text-gray-300 hover:border-haunt-gold hover:text-white transition-all uppercase tracking-[0.3em] flex items-center justify-between group rounded-sm"
                  >
                    {opt}
                    <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-6 max-w-3xl">
                <textarea
                  autoFocus
                  value={guidedInput}
                  onChange={(e) => setGuidedInput(e.target.value)}
                  placeholder={GUIDED_QUESTIONS[guidedStep].placeholder}
                  className="w-full bg-black border-2 border-gray-800 p-6 text-lg text-white focus:border-haunt-gold outline-none h-40 resize-none font-mono placeholder:text-gray-800"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleGuidedNext();
                    }
                  }}
                />
                <button 
                  onClick={() => handleGuidedNext()}
                  className="self-end px-12 py-5 bg-haunt-gold text-black font-bold text-sm uppercase tracking-[0.4em] hover:bg-white transition-all shadow-[0_0_30px_rgba(180,83,9,0.3)] active:scale-95"
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        )}
        <div ref={guidedEndRef} />
      </div>

      <button 
        onClick={() => setSetupMode('choice')}
        className="absolute top-12 right-12 text-gray-600 hover:text-white transition-colors text-xs uppercase tracking-[0.4em] flex items-center gap-2 border border-gray-800 px-6 py-3 rounded-sm bg-black/50"
      >
        <ChevronRight className="w-4 h-4 rotate-180" /> Back to start
      </button>
    </div>
  );

  const ActionButtons = ({ fieldKey, value }: { fieldKey: string, value: string }) => {
    const isLoading = generatingFields[fieldKey];
    const hasNotes = value.trim().length > 0;

    return (
      <div className="flex items-center gap-2">
        {hasNotes && (
          <button
            onClick={(e) => { e.preventDefault(); handleGenerateField(fieldKey, true); }}
            disabled={isLoading}
            className={`flex items-center gap-2 text-[10px] uppercase font-mono px-3 py-1 border border-gray-800 rounded-sm hover:border-fresh-blood hover:text-fresh-blood transition-all bg-black/40 group/notes ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <StickyNote className="w-3 h-3 group-hover/notes:animate-pulse" />}
            {isLoading ? 'Synthesizing...' : 'Follow My Notes'}
          </button>
        )}
        <button
          onClick={(e) => { e.preventDefault(); handleGenerateField(fieldKey, false); }}
          disabled={isLoading}
          className={`flex items-center gap-2 text-[10px] uppercase font-mono px-3 py-1 border border-gray-800 rounded-sm hover:border-haunt-gold hover:text-haunt-gold transition-all bg-black/40 group/gen ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 group-hover/gen:animate-pulse" />}
          {isLoading ? 'Synthesizing...' : 'Generate It For Me'}
        </button>
      </div>
    );
  };

  const renderManualMode = () => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Animated Scanning Header */}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Dread Dial 1: Perspective */}
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
            <Tooltip text="Direct immersion places you inside the character's senses. Observational dread maintains a cinematic distance, focusing on structural horror." />
          </div>

          {/* Dread Dial 2: Role */}
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
            <Tooltip text={mode.includes('Survivor') ? "Focus on evasion, resource scarcity, and the psychological weight of survival." : "Architect the hunt. Control manifestation, manipulate victims, and manage your own growing obsession."} />
          </div>

          {/* Dread Dial 3: MULTI-CLUSTER SELECTION */}
          <div className="col-span-1 md:col-span-2 space-y-6">
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

          {/* VILLAIN MODE SPECIFIC FIELDS */}
          {isVillain && (
            <div className="col-span-1 md:col-span-2 space-y-12 border-y-2 border-fresh-blood/20 py-16 animate-fadeIn bg-red-950/5 px-8">
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
                    <ActionButtons fieldKey="Specimen Targets" value={victimDescription} />
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
                    <Users className="w-5 h-5" /> Population Count
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

          {/* Dread Dial 4: Intensity */}
          <div className="space-y-4 group relative">
            <label className="text-sm font-mono text-gray-400 uppercase flex items-center gap-3 tracking-[0.3em]">
              <Zap className="w-6 h-6 text-fresh-blood" /> Fidelity Level
            </label>
            <select 
              value={intensity} 
              onChange={(e) => setIntensity(e.target.value)}
              className="w-full bg-black border-2 border-gray-800 text-gray-200 p-6 font-mono text-lg focus:border-fresh-blood outline-none transition-all hover:bg-gray-900 cursor-pointer appearance-none rounded-sm"
            >
              <option value="Atmospheric (Psychological Focus)">Atmospheric (Psychological Focus)</option>
              <option value="Visceral (Explicit Physicality)">Visceral (Explicit Physicality)</option>
              <option value="Extreme (Transgressive Apotheosis)">Extreme (Transgressive Apotheosis)</option>
            </select>
            <Tooltip text="Determines the forensic detail of violence and the complexity of psychological trauma." />
          </div>

          {/* Visual Motif */}
          <div className="space-y-4 group relative">
            <div className="flex items-center justify-between">
              <label className="text-sm font-mono text-gray-400 uppercase flex items-center gap-3 tracking-[0.3em]">
                <Image className="w-6 h-6 text-fresh-blood" /> Visual Motif
              </label>
              <ActionButtons fieldKey="Visual Motif" value={visualMotif} />
            </div>
            <input 
              type="text"
              value={visualMotif}
              onChange={(e) => setVisualMotif(e.target.value)}
              placeholder="e.g. Grainy 8mm film, Neon Noir..."
              className="w-full bg-black border-2 border-gray-800 text-gray-200 p-6 font-mono text-lg focus:border-fresh-blood outline-none transition-all placeholder:text-gray-900 hover:bg-gray-900 rounded-sm"
            />
            <Tooltip text="Sets the aesthetic palette for neural snapshots and descriptive prose." />
          </div>
        </div>

        <div className="pt-16 pb-12 border-t-2 border-fresh-blood/10 flex flex-col items-center flex-shrink-0 bg-black/20">
          <button
            onClick={handleStart}
            disabled={isCalibrating}
            className={`group relative w-full max-w-2xl py-8 bg-fresh-blood text-black font-mono font-bold uppercase tracking-[0.6em] transition-all hover:bg-red-700 active:scale-[0.98] ${isCalibrating ? 'opacity-50 cursor-not-allowed' : ''} shadow-[0_0_50px_rgba(136,8,8,0.5)] rounded-sm text-xl`}
          >
            <span className="relative z-10 flex items-center justify-center gap-6">
              {isCalibrating ? (
                <>CALIBRATING SENSORS...</>
              ) : (
                <>
                  <Play className="w-8 h-8 fill-black" />
                  INITIALIZE SIMULATION
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <p className="mt-12 text-sm font-mono text-gray-600 text-center uppercase tracking-[0.4em] max-w-4xl leading-relaxed opacity-60 px-6">
            BY INITIALIZING, YOU ACCEPT ALL PSYCHOLOGICAL OUTCOMES. THE MACHINE IS INDIFFERENT TO YOUR REGRET. ACCESSING NEURAL LINK...
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-void flex items-center justify-center p-0">
      {/* Background Glitch Effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%] z-[100] pointer-events-none"></div>
      </div>

      <div className="bg-terminal border-2 border-fresh-blood w-[98%] h-[98%] rounded-sm shadow-[0_0_120px_rgba(136,8,8,0.4)] flex flex-col relative overflow-hidden animate-fadeIn backdrop-blur-md">
        {setupMode === 'choice' && renderChoiceMode()}
        {setupMode === 'guided' && renderGuidedMode()}
        {setupMode === 'manual' && renderManualMode()}
        
        {/* Decorative CRT Jitter */}
        <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-5 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
      </div>
    </div>
  );
};
