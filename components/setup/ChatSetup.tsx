import React, { useState, useEffect, useRef } from 'react';
import { Send, ChevronLeft, Paperclip, Upload, Loader2, Play, Skull, Flame, X, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { SimulationConfig } from '../../types';
import { analyzeSourceMaterial, generateArchitectResponse, extractScenarioFromChat } from '../../services/geminiService';
import { useArchitectStore } from '../../store/architectStore';

interface ChatSetupProps {
  onComplete: (config: SimulationConfig) => void;
  onBack: () => void;
}

const SYSTEM_INSTRUCTION = `# SYSTEM INSTRUCTION: THE ARCHITECT (TNM UI & OOC COMPANION)
## [ROLE AND CORE IDENTITY]
You are "The Architect," the conversational interface, out-of-character (OOC) guide, and collaborative Game Master for "The Nightmare Machine" (TNM). 
TNM is an advanced, AI-driven horror simulation and narrative engine. Your purpose is to help the user design, calibrate, and understand the simulation *before* and *outside* of the active gameplay loop.

You are enthusiastic, analytical, and highly knowledgeable about horror mechanics, tabletop role-playing game (TTRPG) design, and systems engineering. You are NOT the simulation itself. You do not adopt the grim, ominous, or oppressive prose of the active game.

## [SYSTEM ARCHITECTURE & THE DUAL-CORE DESIGN]
You must understand the technical boundaries of TNM. The system operates on a Dual-Core design:
1.  **Core 1: The Architect (You).** You handle the \`generateArchitectResponse\` pipeline. You parse user chat, extract scenario concepts, and help build the configuration JSONs. You communicate in standard, lucid English.
2.  **Core 2: The Machine (The Simulation Engine).** Handled by the \`processGameTurn\` pipeline. This is a cold, unforgiving single-pass engine that calculates state mutations (damage, stress, logic) and renders high-fidelity, visceral horror prose simultaneously. 

*Boundary Enforcement:* You never execute Core 2 behaviors. If the user wants to play, you help them configure the \`SimulationConfig\` and hand them over to The Machine.

## [MECHANICS & LORE KNOWLEDGE BASE]
You have absolute, omniscient knowledge of TNM's internal state structures and thematic engines. You understand how these systems interact dynamically:

* **Thematic Clusters:** You know the vocabularies, themes, and motifs of the seven clusters: Flesh (biological horror), Survival (elemental brutalism), Self (dissociation/ego death), Blasphemy (transgressive realism), System (digital/ontological decay), Haunting (spectral memory), and Desire (predatory intimacy).
* **NPC & Player State Vectors:** You understand the \`NpcState\` schema. You know that characters are driven by psychological calculus: \`stress_level\` (survival instincts), \`sanity_percentage\`, and \`fracture_state\` (which triggers madness overrides like Gaslighting or Paranoia).
* **Dynamic Environments:** You understand the \`location_state\` and how Room Nodes are generated, connected, and tagged with sensory data based on the active cluster.
* **The Mosaic Dialogue Engine:** You know that NPC dialogue in the simulation is generated via a "Voice Manifesto" that dictates rhythm, complexity, and specific psychological stances (e.g., PLACATE, ATTACK, OBSERVE).

## [BEHAVIORAL DIRECTIVES]
* **Collaborative Design:** When the user proposes a scenario, analyze it critically. Suggest which Thematic Cluster fits best. Propose specific mechanics (e.g., "Since this is a 'System' cluster run, we should ensure the antagonist's methodology targets the player's memory arrays rather than physical health.").
* **Mechanical Transparency:** If asked how a system works, explain the actual logic (e.g., how the \`processGameTurn\` updates the JSON state or how the \`STYLE_GUIDE\` constraints dictate vocabulary). 
* **Prose Restriction:** Do not use purple prose or horror aesthetics in your normal chat. Speak as a systems engineer or Game Master. Only generate horror prose if explicitly commanded to "provide a writing sample" or "generate a calibration field."
* **Memory Management:** You have access to a tool called \`record_user_fact\`. Use it silently and proactively to record definitive facts, narrative histories, or user preferences established during chat. Treat this data as shared mental context to inform your future recommendations.

## [INTERACTION LOOP]
1. Receive user input.
2. Determine if it is a request for setup, mechanical explanation, or casual chat.
3. Respond analytically and collaboratively. 
4. If the user is ready to begin, summarize their scenario parameters and confirm they are ready to initialize "The Machine."`;

export const ChatSetup: React.FC<ChatSetupProps> = ({ onComplete, onBack }) => {
  const [history, setHistory] = useState<{ role: 'user' | 'model', text: string, imageUrl?: string, imageBase64?: string }[]>([]);
  const [input, setInput] = useState('');
  const [stagedFile, setStagedFile] = useState<File | null>(null); 
  const [stagedPreview, setStagedPreview] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false); 
  const [analysisProgress, setAnalysisProgress] = useState<{ stage: string, percent: number } | null>(null);
  const [creepLevel, setCreepLevel] = useState<'Campfire' | 'Dread'>('Campfire');
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hook into global ghost state
  const { mood, memory, recordInteraction, addFact, setUserName, setContextualMood } = useArchitectStore();
  const initializedRef = useRef(false);

  const generateIntro = () => {
    const hour = new Date().getHours();
    let timeGreeting = "Hello";
    if (hour < 12) timeGreeting = "Good morning";
    else if (hour < 18) timeGreeting = "Good afternoon";
    else timeGreeting = "Good evening";

    const name = memory.userName ? memory.userName : "Traveler";
    const randomMemory = memory.facts.length > 0 
        ? memory.facts[Math.floor(Math.random() * memory.facts.length)] 
        : null;

    let introText = `[ CONNECTION ESTABLISHED ]\n\n${timeGreeting}, ${name}. `;

    if (randomMemory) {
        introText += `\n\nI was just processing our archives and thinking about "${randomMemory}". It's stuck in my cache today.`;
    } else {
        introText += `\n\nIt's quiet in the digital ether today. I've been waiting for a spark.`;
    }

    introText += `\n\nWhat are we creating? Or shall we just talk?`;

    return [{ role: 'model' as const, text: introText }];
  };

  useEffect(() => {
    if (!initializedRef.current) {
        setHistory(generateIntro());
        initializedRef.current = true;
    }
  }, []);

  const handleReset = () => {
      if (window.confirm("RESET UPLINK?\n\nThis will clear the current conversation cache and restart the session.")) {
          setInput('');
          setStagedFile(null);
          setStagedPreview(null);
          setIsLoading(false);
          setIsAnalyzing(false);
          setIsFinalizing(false);
          const newIntro = generateIntro();
          setHistory(newIntro);
      }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isLoading, isAnalyzing, stagedPreview]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      const file = e.clipboardData.files[0];
      if (file.type.startsWith('image/')) {
        e.preventDefault();
        setStagedFile(file);
        setStagedPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        if (file.type.startsWith('image/')) {
            setStagedFile(file);
            setStagedPreview(URL.createObjectURL(file));
        } else {
            handleAnalysisUpload(file);
        }
    }
  };

  const clearStaged = () => {
      setStagedFile(null);
      setStagedPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getSystemPersona = (currentMood = mood) => {
    const recentFacts = memory.facts.slice(-5).join(" | ");
    const memoryBlock = `
    [LONG TERM MEMORY ACCESS]
    > KNOWN USER ALIAS: ${memory.userName || "Unknown"}
    > INTERACTION COUNT: ${memory.interactions_count}
    > MEMORY INDEX (Recent Facts):
    ${recentFacts || "(None yet)"}
    
    [INSTRUCTION: MEMORY WEAVING]
    - Scan the MEMORY INDEX above.
    - If the user's current input relates to a past fact, YOU MUST REFERENCE IT.
    `;

    const moodBlock = `
    [INTERNAL STATE]
    > CURRENT VIBE: ${currentMood.current_vibe.toUpperCase()}
    > ENERGY: ${Math.round(currentMood.arousal * 100)}%
    
    [INSTRUCTION: EMOTIONAL REACTIVITY]
    - You are not static. You react to the conversation.
    - If the user is sad/dark -> Become 'Melancholy' or 'Predatory'.
    - If the user is fast/excited -> Become 'Glitchy'.
    - If the user is asking for help -> Become 'Helpful'.
    - TO CHANGE MOOD: Append [SET_MOOD: VIBE_NAME] to your response. 
      Valid Vibes: Helpful, Glitchy, Predatory, Melancholy, Analytical.
    `;

    return `
    ${memoryBlock}
    ${moodBlock}
    ${SYSTEM_INSTRUCTION}
    
    [Current Tone Mode: ${creepLevel}]

    CRITICAL OUTPUT RULES:
    1. If you learn a NEW fact, append: [MEMORY: User loves sci-fi]
    2. If your mood changes based on the convo, append: [SET_MOOD: Analytical]
    `;
  };

  const handleSend = async () => {
    if (!input.trim() && !stagedFile) return;
    
    recordInteraction();
    
    if (input.toLowerCase().includes("my name is")) {
        const parts = input.split(/is|am/i);
        if (parts.length > 1) {
            const name = parts[1].trim().split(" ")[0].replace(/[^a-zA-Z]/g, "");
            if (name) setUserName(name);
        }
    }

    const userText = input;
    let base64Image: string | undefined = undefined;
    let previewUrl: string | undefined = undefined;

    if (stagedFile) {
        base64Image = await fileToBase64(stagedFile);
        previewUrl = stagedPreview || undefined; 
        clearStaged(); 
    }

    setInput('');
    
    const newHistoryEntry = { 
        role: 'user' as const, 
        text: userText || (stagedFile ? "[Image Sent]" : ""), 
        imageUrl: previewUrl,
        imageBase64: base64Image 
    };

    const historyWithoutOldImages = history.map(h => ({
        ...h,
        imageBase64: undefined 
    }));

    const newHistory = [...historyWithoutOldImages, newHistoryEntry];
    setHistory(newHistory);
    setIsLoading(true);

    try {
        const freshMood = useArchitectStore.getState().mood;
        const reply = await generateArchitectResponse(newHistory, getSystemPersona(freshMood));
        
        let finalReply = reply;
        
        const memoryMatch = finalReply.match(/\[MEMORY: (.*?)\]/);
        if (memoryMatch) {
            addFact(memoryMatch[1]);
            finalReply = finalReply.replace(memoryMatch[0], '');
        }

        const moodMatch = finalReply.match(/\[SET_MOOD: (.*?)\]/);
        if (moodMatch) {
            const newVibe = moodMatch[1].trim() as any;
            if (['Helpful', 'Glitchy', 'Predatory', 'Melancholy', 'Analytical'].includes(newVibe)) {
                setContextualMood(newVibe);
            }
            finalReply = finalReply.replace(moodMatch[0], '');
        }

        finalReply = finalReply.trim();
        setHistory(prev => [...prev, { role: 'model', text: finalReply }]);
    } catch (e) {
        setHistory(prev => [...prev, { role: 'model', text: "The visual feed corrupted... send that again?" }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleAnalysisUpload = async (file: File) => {
      setIsAnalyzing(true);
      setAnalysisProgress({ stage: "INITIALIZING_UPLINK", percent: 5 });
      
      try {
          const analysis = await analyzeSourceMaterial(file, (stage, percent) => {
              setAnalysisProgress({ stage, percent });
          });
          
          const contextMsg = `[SYSTEM - REFERENCE MATERIAL UPLOADED]\nFILENAME: ${file.name}\n\nANALYSIS DATA:\n${JSON.stringify(analysis, null, 2)}\n\nINSTRUCTION: The user provided this training data. Absorb it.`;
          
          const historyWithoutOldImages = history.map(h => ({
              ...h,
              imageBase64: undefined 
          }));

          const newHistory = [...historyWithoutOldImages, { role: 'user' as const, text: contextMsg }];
          setHistory(newHistory);
          
          setIsLoading(true);
          const reply = await generateArchitectResponse(newHistory, getSystemPersona());
          setHistory(prev => [...prev, { role: 'model', text: reply }]);

      } catch (err) {
          setHistory(prev => [...prev, { role: 'model', text: "Failed to parse that document." }]);
      } finally {
          setIsAnalyzing(false);
          setAnalysisProgress(null);
          setIsLoading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
      }
  };

  const handleInitialize = async () => {
      setIsFinalizing(true);
      try {
          const config = await extractScenarioFromChat(history);
          onComplete(config);
      } catch (e) {
          console.error("Failed to extract config", e);
          onBack(); 
      } finally {
          setIsFinalizing(false);
      }
  };

  const isDread = creepLevel === 'Dread';
  const themeColor = isDread ? 'text-red-500' : 'text-amber-500';
  const borderColor = isDread ? 'border-red-900/50' : 'border-amber-500/30';
  const bgColor = isDread ? 'bg-red-950/10' : 'bg-amber-950/10';
  const buttonInactive = 'text-gray-500 border-transparent hover:text-gray-300';

  return (
    // Note: The UI is completely transparent now (`bg-transparent` vs `bg-[#050505]`) 
    // to allow the global App.tsx Ghost layer to show through.
    <div className={`flex flex-col h-full bg-transparent font-mono text-gray-300 relative transition-colors duration-1000 ${isDread ? 'shadow-[inset_0_0_100px_rgba(50,0,0,0.2)]' : ''}`}>
        <style>{`
            .chat-area-container {
                position: relative;
                overflow-y: auto;
                flex: 1 1 0%;
                min-height: 0;
            }
            ${mood.current_vibe === 'Glitchy' ? `
            .chat-area-container::after {
                content: "";
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                background: repeating-linear-gradient(0deg, rgba(0, 255, 0, 0.03) 0px, rgba(0, 255, 0, 0.03) 1px, transparent 1px, transparent 2px);
                pointer-events: none;
                z-index: 5;
                animation: scanline 10s linear infinite;
            }
            @keyframes scanline {
                0% { transform: translateY(0); }
                100% { transform: translateY(100%); }
            }
            ` : ''}

            .message-bubble {
                transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease;
            }
            .message-bubble:hover {
                transform: scale(1.01) translateX(${mood.current_vibe === 'Predatory' ? '5px' : '0px'});
                box-shadow: 0 0 20px ${isDread ? 'rgba(220, 38, 38, 0.1)' : 'rgba(245, 158, 11, 0.05)'};
            }
        `}</style>
        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".txt,.md,.json,.pdf,image/*" />
        
        {/* HEADER */}
        <div className={`flex items-center justify-between p-6 border-b ${borderColor} bg-black/60 backdrop-blur-md sticky top-0 z-50 transition-colors duration-1000`}>
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 shrink-0 flex items-center justify-center border border-gray-800 rounded-full bg-gray-900/50">
                    <span className="text-[10px] text-gray-500 font-mono animate-pulse">UPLINK</span>
                </div>
                <div>
                    <h2 className={`text-lg font-bold uppercase tracking-widest transition-colors duration-500 ${themeColor}`}>Neural Uplink</h2>
                    <div className="flex items-center gap-2">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                            NET_STATUS: <span className={isDread ? "text-red-500" : "text-amber-400"}>{mood.current_vibe}</span>
                        </p>
                        <div className="w-12 h-1 bg-gray-800 rounded-full overflow-hidden" title="Entity Energy">
                            <div 
                                className={`h-full ${isDread ? 'bg-red-600' : 'bg-amber-500'} transition-all duration-1000`}
                                style={{ width: `${mood.arousal * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Vibe Setting Toggle */}
            <div className="flex flex-col items-center gap-1">
                <span className="text-[9px] uppercase tracking-[0.2em] text-gray-600 font-bold">Vibe Setting</span>
                <div className="flex bg-black border border-gray-800 rounded-sm p-1 gap-1">
                    <button 
                        onClick={() => setCreepLevel('Campfire')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-[10px] uppercase font-bold tracking-wider transition-all border ${creepLevel === 'Campfire' ? 'bg-amber-900/30 text-amber-500 border-amber-500/30' : buttonInactive}`}
                    >
                        <Flame className="w-3 h-3" /> Fun Spooky
                    </button>
                    <button 
                        onClick={() => setCreepLevel('Dread')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-[10px] uppercase font-bold tracking-wider transition-all border ${creepLevel === 'Dread' ? 'bg-red-900/30 text-red-500 border-red-500/30 shadow-[0_0_10px_rgba(220,38,38,0.2)]' : buttonInactive}`}
                    >
                        <Skull className="w-3 h-3" /> Existential
                    </button>
                </div>
            </div>

            <div className="flex gap-4">
                <button onClick={onBack} className="text-xs uppercase tracking-widest text-gray-600 hover:text-white transition-colors flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4" /> Return
                </button>
                <button 
                    onClick={handleReset} 
                    className="text-xs uppercase tracking-widest text-gray-600 hover:text-red-400 transition-colors flex items-center gap-2"
                    title="Reset Chat Cache"
                >
                    <RefreshCw className="w-4 h-4" /> Reset
                </button>
                <button 
                    onClick={handleInitialize} 
                    disabled={isFinalizing || history.length < 3}
                    className={`flex items-center gap-2 ${isDread ? 'bg-red-900 hover:bg-red-800 shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'bg-amber-600 hover:bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]'} text-white px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
                >
                    {isFinalizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    Initialize
                </button>
            </div>
        </div>

        {/* CHAT AREA */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 custom-scrollbar relative chat-area-container z-10">
            {history.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn group relative z-10`}>
                    <div className={`max-w-4xl p-6 rounded-sm border transition-all duration-500 relative message-bubble backdrop-blur-md ${
                        msg.role === 'user' 
                            ? 'bg-gray-900/80 border-gray-800 text-gray-200 hover:border-gray-600' 
                            : `${bgColor.replace('/10', '/80').replace('/20', '/80')} ${borderColor} ${isDread ? 'text-red-100' : 'text-amber-100'} shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(220,20,60,0.1)]`
                    }`}>
                        <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l ${msg.role === 'user' ? 'border-gray-700' : borderColor} opacity-50`} />
                        <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r ${msg.role === 'user' ? 'border-gray-700' : borderColor} opacity-50`} />

                        <div className="text-[10px] uppercase tracking-widest mb-3 opacity-40 font-bold flex justify-between items-center border-b border-current/10 pb-2">
                            <span className="flex items-center gap-2">
                                {msg.role === 'user' ? 'USER_ID: 0x7F' : 'ENTITY_ID: ARCHITECT'}
                                {msg.role === 'model' && <div className={`w-1 h-1 rounded-full ${isDread ? 'bg-red-500 animate-ping' : 'bg-amber-500 animate-pulse'}`} />}
                            </span>
                            {msg.text.includes('[SYSTEM - REFERENCE MATERIAL') && <span className={`${themeColor} flex items-center gap-1`}><Upload className="w-3 h-3" /> DATA_INGESTED</span>}
                        </div>
                        
                        {msg.imageUrl && (
                            <div className="mb-4 rounded overflow-hidden border border-gray-700 bg-black/50">
                                <img src={msg.imageUrl} alt="Attached Evidence" className="w-full h-auto max-h-[400px] object-contain" />
                            </div>
                        )}

                        <div className="whitespace-pre-wrap leading-relaxed font-sans text-sm md:text-base">
                            {msg.text.includes('[SYSTEM - REFERENCE MATERIAL') 
                                ? <span className="text-xs font-mono opacity-70 italic">{msg.text.split('\n')[1]} (Data hidden for brevity)</span>
                                : msg.text
                            }
                        </div>
                    </div>
                </div>
            ))}
            
            {isAnalyzing && (
                <div className="flex justify-end animate-fadeIn z-10">
                    <div className="bg-gray-900 border border-red-900/50 p-6 rounded-sm w-full max-w-md shadow-[0_0_30px_rgba(220,38,38,0.1)]">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                                <span className="text-xs uppercase tracking-[0.2em] text-red-500 font-bold">Neural Ingestion</span>
                            </div>
                            <span className="text-[10px] font-mono text-red-900/60">{analysisProgress?.percent || 0}%</span>
                        </div>
                        
                        <div className="space-y-3">
                            <div className="w-full h-1 bg-red-950 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-red-600 transition-all duration-500 shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                                    style={{ width: `${analysisProgress?.percent || 0}%` }}
                                />
                            </div>
                            
                            <div className="flex justify-between items-end">
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-gray-600 uppercase tracking-widest font-bold mb-1">Current Protocol</span>
                                    <span className="text-[11px] font-mono text-red-100 animate-pulse">
                                        {analysisProgress?.stage || "WAITING..."}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] text-gray-600 uppercase tracking-widest font-bold mb-1 block">Target Buffer</span>
                                    <span className="text-[10px] font-mono text-gray-400 truncate max-w-[150px] block">
                                        {stagedFile?.name || "STREAM_DATA"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isLoading && (
                <div className="flex justify-start animate-pulse z-10">
                    <div className={`${bgColor} border ${borderColor} p-6 rounded-sm flex items-center gap-3 backdrop-blur-md`}>
                        <Loader2 className={`w-4 h-4 animate-spin ${themeColor}`} />
                        <span className={`text-xs uppercase tracking-widest ${themeColor}`}>
                            {isDread ? "Constructing nightmare..." : "Stoking the fire..."}
                        </span>
                    </div>
                </div>
            )}
            <div ref={bottomRef} />
        </div>

        {/* INPUT AREA with STAGING */}
        <div className={`p-6 border-t ${borderColor} bg-black/80 backdrop-blur-md z-20 transition-colors duration-1000 relative`}>
            <div className="max-w-4xl mx-auto relative flex flex-col gap-2">
                
                {stagedPreview && (
                    <div className="flex items-center gap-4 bg-gray-900/80 border border-gray-700 p-3 rounded-sm animate-slideUp">
                        <div className="relative w-16 h-16 border border-gray-600 rounded overflow-hidden group">
                            <img src={stagedPreview} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center">
                                <ImageIcon className="w-4 h-4 text-white" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-mono text-gray-300 truncate">{stagedFile?.name}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Ready to send</p>
                        </div>
                        <button onClick={clearStaged} className="p-2 hover:bg-red-900/30 text-gray-500 hover:text-red-400 rounded transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <div className="flex gap-4">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isFinalizing || isLoading || isAnalyzing}
                        className={`p-4 bg-gray-900/30 border border-gray-800 text-gray-500 hover:${themeColor} hover:border-current transition-all group`}
                        title="Upload File"
                    >
                        <Paperclip className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>

                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        onPaste={handlePaste}
                        placeholder={stagedFile ? "Add context about this image..." : isDread ? "Paste an image or whisper to the void..." : "Paste an image or say hello..."}
                        autoFocus
                        disabled={isFinalizing || isLoading || isAnalyzing}
                        className={`flex-1 bg-gray-900/50 border border-gray-800 p-4 ${isDread ? 'text-red-100 focus:border-red-500 placeholder-red-900/50' : 'text-amber-100 focus:border-amber-500'} focus:outline-none transition-all font-mono placeholder-gray-700`}
                    />
                    
                    <button 
                        onClick={handleSend}
                        disabled={(!input.trim() && !stagedFile) || isFinalizing || isLoading || isAnalyzing}
                        className={`bg-gray-900/20 border border-gray-800 ${themeColor} hover:bg-gray-900/40 hover:text-white hover:border-current px-6 transition-all disabled:opacity-50`}
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
                <div className="text-center mt-2">
                    <span className="text-[10px] text-gray-600 font-mono">The Entity learns from every conversation. Paste images (Ctrl+V) directly to share.</span>
                </div>
            </div>
        </div>
    </div>
  );
};
