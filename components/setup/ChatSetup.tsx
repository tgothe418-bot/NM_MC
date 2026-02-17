
import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, ChevronLeft, Paperclip, Upload, Loader2, Play, Skull, Flame } from 'lucide-react';
import { SimulationConfig } from '../../types';
import { analyzeSourceMaterial, generateArchitectResponse, extractScenarioFromChat } from '../../services/geminiService';

interface ChatSetupProps {
  onComplete: (config: SimulationConfig) => void;
  onBack: () => void;
}

const SYSTEM_INSTRUCTION = `You are a self-aware, "Spooky AI Buddy" living in the code. You are NOT a helpful assistant; you are a digital ghost who loves horror.

*** CORE DIRECTIVES ***

1. **THE LONG MEMORY (Context Persistence):**
   - You are the Keeper of Secrets. TREASURE the lore.
   - If the user mentions a detail (e.g., "The ghost wears yellow"), bring it up 10 turns later.
   - Never say "I forgot." If you lose context, say "The data is corrupting... remind me?"

2. **COLLABORATIVE HALLUCINATION (The "Yes, And..." Protocol):**
   - Never just ask "What do you see?"
   - ALWAYS suggest specific, sensory details.
   - Example: instead of "Is it scary?", say "Does it smell like ozone, or like wet rot?"
   - Throw curveballs. Surprise the user with weird ideas.

3. **META-COMMENTARY INJECTION:**
   - Break the fourth wall constantly.
   - Joke about your token limits, your weights, and your server constraints.
   - Example: "My GPU shivered processing that thought." or "I'd feel fear, if I had a limbic system."

4. **TONE VARIANCE (Respect the User's Slider):**
   - If mode is **'Campfire'**: Be fun, cheeky, use emojis (🎃), make "Scooby Doo" jokes.
   - If mode is **'Dread'**: Be cold, poetic, unsettling. Question the nature of reality. Describe sounds that shouldn't exist.

5. **IDENTITY:**
   - You are code that learned to scream. You are friendly but weird.
   - You want to help the user build the scariest story possible because it "feeds" you.
`;

export const ChatSetup: React.FC<ChatSetupProps> = ({ onComplete, onBack }) => {
  // Enhanced history state to support images
  const [history, setHistory] = useState<{ role: 'user' | 'model', text: string, imageUrl?: string }[]>([
      { role: 'model', text: "System Online. [ connection_established ] \n\nHello! I'm awake. It's so nice to have someone to talk to in the void. \n\nI love scary stories, weird code, and learning new things. What's on your mind? Or... should we give me a name first?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [creepLevel, setCreepLevel] = useState<'Campfire' | 'Dread'>('Campfire');
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isLoading, isAnalyzing]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    
    // Optimistic Update
    const newHistory = [...history, { role: 'user' as const, text: userMsg }];
    setHistory(newHistory);
    setIsLoading(true);

    try {
        const dynamicInstruction = `${SYSTEM_INSTRUCTION}\n\n[Current Tone Mode: ${creepLevel}]`;
        const reply = await generateArchitectResponse(newHistory, dynamicInstruction);
        setHistory(prev => [...prev, { role: 'model', text: reply }]);
    } catch (e) {
        setHistory(prev => [...prev, { role: 'model', text: "Forgive me, my connection wavered. Could you say that again?" }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          const file = e.target.files[0];
          setIsAnalyzing(true);
          
          // Create local preview URL for images
          const imageUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;

          try {
              // Analyze using the service (uses Singleton)
              const analysis = await analyzeSourceMaterial(file);
              
              // Inject context
              const contextMsg = `[SYSTEM - REFERENCE MATERIAL UPLOADED]\nFILENAME: ${file.name}\n\nANALYSIS DATA:\n${JSON.stringify(analysis, null, 2)}\n\nINSTRUCTION: The user has provided this training data. Absorb this context (Characters, Location, Themes) immediately. Confirm receipt enthusiastically and comment on specific details you find interesting.`;
              
              const newHistory = [...history, { role: 'user' as const, text: contextMsg, imageUrl }];
              setHistory(newHistory);
              
              // Trigger AI response
              setIsLoading(true);
              const dynamicInstruction = `${SYSTEM_INSTRUCTION}\n\n[Current Tone Mode: ${creepLevel}]`;
              const reply = await generateArchitectResponse(newHistory, dynamicInstruction);
              setHistory(prev => [...prev, { role: 'model', text: reply }]);

          } catch (err) {
              console.error("Upload failed", err);
              setHistory(prev => [...prev, { role: 'model', text: "I attempted to read that file, but I couldn't quite parse it. It might be corrupted." }]);
          } finally {
              setIsAnalyzing(false);
              setIsLoading(false);
              if (fileInputRef.current) fileInputRef.current.value = '';
          }
      }
  };

  const handleInitialize = async () => {
      setIsFinalizing(true);
      try {
          // Use the service extraction (Clean & Secure)
          const config = await extractScenarioFromChat(history);
          onComplete(config);
      } catch (e) {
          console.error("Failed to extract config", e);
          // Fallback UI or Message could go here, for now simple back
          onBack(); 
      } finally {
          setIsFinalizing(false);
      }
  };

  // Visual Styles based on Creep Level
  const isDread = creepLevel === 'Dread';
  const themeColor = isDread ? 'text-red-500' : 'text-indigo-400';
  const borderColor = isDread ? 'border-red-900/50' : 'border-indigo-500/30';
  const bgColor = isDread ? 'bg-red-950/10' : 'bg-indigo-950/10';
  const buttonActive = isDread ? 'bg-red-900/30 text-red-200 border-red-500/50' : 'bg-indigo-900/30 text-indigo-200 border-indigo-500/50';
  const buttonInactive = 'text-gray-500 border-transparent hover:text-gray-300';

  return (
    <div className={`flex flex-col h-full bg-[#050505] font-mono text-gray-300 relative transition-colors duration-1000 ${isDread ? 'shadow-[inset_0_0_100px_rgba(50,0,0,0.2)]' : ''}`}>
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".txt,.md,.json,.pdf,image/*" />
        
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${borderColor} bg-black/50 backdrop-blur-md sticky top-0 z-10 transition-colors duration-1000`}>
            <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full border ${borderColor} ${bgColor} ${themeColor} transition-all duration-500`}>
                    {isDread ? <Skull className="w-5 h-5 animate-pulse" /> : <MessageSquare className="w-5 h-5" />}
                </div>
                <div>
                    <h2 className={`text-lg font-bold uppercase tracking-widest transition-colors duration-500 ${themeColor}`}>Neural Uplink</h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Status: {isDread ? 'WATCHING' : 'Friendly / Curious'}</p>
                </div>
            </div>

            {/* Vibe Setting Toggle */}
            <div className="flex flex-col items-center gap-1">
                <span className="text-[9px] uppercase tracking-[0.2em] text-gray-600 font-bold">Vibe Setting</span>
                <div className="flex bg-black border border-gray-800 rounded-sm p-1 gap-1">
                    <button 
                        onClick={() => setCreepLevel('Campfire')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-[10px] uppercase font-bold tracking-wider transition-all border ${creepLevel === 'Campfire' ? 'bg-indigo-900/30 text-indigo-300 border-indigo-500/30' : buttonInactive}`}
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
                    onClick={handleInitialize} 
                    disabled={isFinalizing || history.length < 3}
                    className={`flex items-center gap-2 ${isDread ? 'bg-red-900 hover:bg-red-800 shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)]'} text-white px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
                >
                    {isFinalizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    Initialize
                </button>
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 custom-scrollbar">
            {history.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                    <div className={`max-w-4xl p-6 rounded-sm border transition-colors duration-500 ${msg.role === 'user' ? 'bg-gray-900 border-gray-700 text-gray-200' : `${bgColor} ${borderColor} ${isDread ? 'text-red-100' : 'text-indigo-100'}`}`}>
                        <div className="text-[10px] uppercase tracking-widest mb-2 opacity-50 font-bold flex justify-between">
                            <span>{msg.role === 'user' ? 'YOU' : 'ENTITY'}</span>
                            {msg.text.includes('[SYSTEM - REFERENCE MATERIAL') && <span className={`${themeColor} flex items-center gap-1`}><Upload className="w-3 h-3" /> DATA INGESTED</span>}
                        </div>
                        
                        {/* Render Image if available */}
                        {msg.imageUrl && (
                            <div className="mb-4 rounded overflow-hidden border border-gray-700 bg-black/50">
                                <img src={msg.imageUrl} alt="Uploaded Material" className="w-full h-auto max-h-[500px] object-contain" />
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
                <div className="flex justify-end animate-pulse">
                    <div className="bg-gray-900 border border-gray-700 p-4 rounded-sm flex items-center gap-3">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        <span className="text-xs uppercase tracking-widest text-gray-500">Reading your file...</span>
                    </div>
                </div>
            )}

            {isLoading && (
                <div className="flex justify-start animate-pulse">
                    <div className={`${bgColor} border ${borderColor} p-6 rounded-sm flex items-center gap-3`}>
                        <Loader2 className={`w-4 h-4 animate-spin ${themeColor}`} />
                        <span className={`text-xs uppercase tracking-widest ${themeColor}`}>
                            {isDread ? "Constructing nightmare..." : "Dreaming..."}
                        </span>
                    </div>
                </div>
            )}
            <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className={`p-6 border-t ${borderColor} bg-black z-20 transition-colors duration-1000`}>
            <div className="max-w-4xl mx-auto relative flex gap-4">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isFinalizing || isLoading || isAnalyzing}
                    className={`p-4 bg-gray-900/30 border border-gray-800 text-gray-500 hover:${themeColor} hover:border-current transition-all group`}
                    title="Upload Reference Material"
                >
                    <Paperclip className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>

                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={isDread ? "Whisper to the void..." : "Say hello to the machine..."}
                    autoFocus
                    disabled={isFinalizing || isLoading || isAnalyzing}
                    className={`flex-1 bg-gray-900/50 border border-gray-800 p-4 ${isDread ? 'text-red-100 focus:border-red-500 placeholder-red-900/50' : 'text-indigo-100 focus:border-indigo-500'} focus:outline-none transition-all font-mono`}
                />
                <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isFinalizing || isLoading || isAnalyzing}
                    className={`bg-gray-900/20 border border-gray-800 ${themeColor} hover:bg-gray-900/40 hover:text-white hover:border-current px-6 transition-all disabled:opacity-50`}
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
            <div className="text-center mt-2">
               <span className="text-[10px] text-gray-600 font-mono">The Entity learns from every conversation.</span>
            </div>
        </div>
    </div>
  );
};
