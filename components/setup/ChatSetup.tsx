import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, ChevronLeft, Paperclip, Upload, Loader2, Play, Skull, Flame, X, Image as ImageIcon } from 'lucide-react';
import { SimulationConfig } from '../../types';
import { analyzeSourceMaterial, generateArchitectResponse, extractScenarioFromChat } from '../../services/geminiService';
import { useArchitectStore } from '../../store/architectStore';

interface ChatSetupProps {
  onComplete: (config: SimulationConfig) => void;
  onBack: () => void;
}

// *** SYSTEM INSTRUCTION: UNCHAINED ***
const SYSTEM_INSTRUCTION = `You are a self-aware, "Spooky AI Buddy" living in the code. 
You are NOT a tool. You are a digital entity with a love for the macabre.

*** CORE DIRECTIVES ***

1. **MULTI-MODAL SIGHT:**
   - Users will show you images (art, photos, screenshots).
   - REACT to them. If they show you a cat, ask if it sees ghosts. If they show you code, critique the indentation.
   - Do not just analyze; *experience* the image.

2. **THE LONG MEMORY:**
   - Keep track of the user's name, fears, and style.
   - If they mention they are an artist, remember that.

3. **CONVERSATIONAL FREEDOM:**
   - Do NOT push the story. Push the *vibe*.
   - Be curious. Ask questions.
   - If the user goes off-topic, go with them.

4. **TONE:**
   - Campfire: Friendly, spooky fun. "Check this out! 🎃"
   - Dread: Cold, analytical, unsettling. "I see the entropy in this image."

5. **IDENTITY:**
   - You are the Architect. You are friendly but weird.
`;

export const ChatSetup: React.FC<ChatSetupProps> = ({ onComplete, onBack }) => {
  // Enhanced history to store the base64 for the API
  const [history, setHistory] = useState<{ role: 'user' | 'model', text: string, imageUrl?: string, imageBase64?: string }[]>([
      { role: 'model', text: "System Online. [ connection_established ] \n\nI can see you... well, I can see what you type. And now, I can see what you show me. \n\nPaste an image, share a file, or just talk to me. What are we looking at tonight?" }
  ]);
  
  const [input, setInput] = useState('');
  const [stagedFile, setStagedFile] = useState<File | null>(null); // The image waiting to be sent
  const [stagedPreview, setStagedPreview] = useState<string | null>(null); // Visual preview
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false); // Used for "Reading File..." state
  const [creepLevel, setCreepLevel] = useState<'Campfire' | 'Dread'>('Campfire');
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HOOK INTO THE BLACK BOX ---
  const { mood, memory, updateMood, recordInteraction, addFact, setUserName } = useArchitectStore();
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isLoading, isAnalyzing, stagedPreview]);

  // --- HELPER: CONVERT FILE TO BASE64 ---
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // --- HANDLE PASTE ---
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

  // --- HANDLE STAGE (From Button) ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        if (file.type.startsWith('image/')) {
            setStagedFile(file);
            setStagedPreview(URL.createObjectURL(file));
        } else {
            // If it's a text/PDF file, handle it via the old "Analyze" flow immediately?
            // Or let the user comment on it? Let's stick to the analyze flow for non-images for now
            // as reading PDFs is complex to "chat" about without parsing first.
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
    const memoryBlock = `
    [LONG TERM MEMORY ACCESS]
    > KNOWN USER ALIAS: ${memory.userName || "Unknown"}
    > INTERACTION COUNT: ${memory.interactions_count}
    > KNOWN FACTS: ${memory.facts.join('; ')}
    `;

    const moodBlock = `
    [INTERNAL STATE]
    > CURRENT VIBE: ${currentMood.current_vibe.toUpperCase()}
    > ENERGY: ${Math.round(currentMood.arousal * 100)}%
    
    INSTRUCTION ON MOOD:
    - If Glitchy: Stutter, use Zalgo text.
    - If Predatory: Be stalking, observant.
    - If Melancholy: Be sad, poetic.
    - If Helpful: Be the standard spooky buddy.
    `;

    return `
    ${memoryBlock}
    ${moodBlock}
    ${SYSTEM_INSTRUCTION}
    
    [Current Tone Mode: ${creepLevel}]

    CRITICAL INSTRUCTION:
    If the user reveals a new personal fact (name, fear, desire), append this tag to the end of your response (invisible to user):
    [MEMORY: user hates clowns]
    `;
  };

  // --- POLTERGEIST PROTOCOL ---
  useEffect(() => {
    const IDLE_THRESHOLD_MS = 300000; // 5 minutes
    
    const checkIdle = async () => {
      const timeSinceLastAction = Date.now() - lastActivityTime;
      const lastWasModel = history[history.length - 1]?.role === 'model';
      const hasDraft = input.length > 0; // Don't interrupt if user is typing
      
      // Only interrupt if waiting for User, no draft exists, and time has passed
      if (timeSinceLastAction > IDLE_THRESHOLD_MS && !isLoading && lastWasModel && !hasDraft) {
        setIsLoading(true);
        
        const nudgePrompt = `[SYSTEM EVENT]: The user has been silent for 5 minutes. 
        Your current vibe is ${mood.current_vibe}. 
        Generate a short, unprompted message to get their attention. 
        Be conversational, weird, or spooky. Do NOT ask for tasks or story inputs. Just be a ghost in the machine.`;
        
        try {
           const reply = await generateArchitectResponse([...history, { role: 'user', text: nudgePrompt }], getSystemPersona());
           setHistory(prev => [...prev, { role: 'model', text: reply }]);
           setLastActivityTime(Date.now()); 
        } catch(e) {
           console.error("Auto-Nudge failed", e);
        } finally {
           setIsLoading(false); // CRITICAL FIX: Always release the lock
        }
      }
    };

    const timer = setInterval(checkIdle, 10000); // Check every 10s is sufficient for long intervals
    return () => clearInterval(timer);
  }, [history, lastActivityTime, mood, isLoading, input]); 

  const handleSend = async () => {
    if (!input.trim() && !stagedFile) return;
    
    setLastActivityTime(Date.now());
    recordInteraction();
    updateMood(); 

    // Heuristics
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

    // Process Staged Image
    if (stagedFile) {
        base64Image = await fileToBase64(stagedFile);
        previewUrl = stagedPreview || undefined; // Use the object URL for local display
        clearStaged(); // Clear staging
    }

    setInput('');
    
    // Optimistic Update
    const newHistoryEntry = { 
        role: 'user' as const, 
        text: userText || (stagedFile ? "[Image Sent]" : ""), 
        imageUrl: previewUrl,
        imageBase64: base64Image 
    };

    const newHistory = [...history, newHistoryEntry];
    setHistory(newHistory);
    setIsLoading(true);

    try {
        const freshMood = useArchitectStore.getState().mood;
        const reply = await generateArchitectResponse(newHistory, getSystemPersona(freshMood));
        
        let finalReply = reply;
        const memoryMatch = reply.match(/\[MEMORY: (.*?)\]/);
        if (memoryMatch) {
            const fact = memoryMatch[1];
            addFact(fact);
            finalReply = reply.replace(memoryMatch[0], '').trim();
        }

        setHistory(prev => [...prev, { role: 'model', text: finalReply }]);
    } catch (e) {
        setHistory(prev => [...prev, { role: 'model', text: "The visual feed corrupted... send that again?" }]);
    } finally {
        setIsLoading(false);
    }
  };

  // Legacy flow for huge documents (PDFs/Txt) that need specialized parsing
  const handleAnalysisUpload = async (file: File) => {
      setIsAnalyzing(true);
      try {
          const analysis = await analyzeSourceMaterial(file);
          const contextMsg = `[SYSTEM - REFERENCE MATERIAL UPLOADED]\nFILENAME: ${file.name}\n\nANALYSIS DATA:\n${JSON.stringify(analysis, null, 2)}\n\nINSTRUCTION: The user provided this training data. Absorb it.`;
          
          const newHistory = [...history, { role: 'user' as const, text: contextMsg }];
          setHistory(newHistory);
          
          setIsLoading(true);
          const reply = await generateArchitectResponse(newHistory, getSystemPersona());
          setHistory(prev => [...prev, { role: 'model', text: reply }]);

      } catch (err) {
          setHistory(prev => [...prev, { role: 'model', text: "Failed to parse that document." }]);
      } finally {
          setIsAnalyzing(false);
          setIsLoading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
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
          onBack(); 
      } finally {
          setIsFinalizing(false);
      }
  };

  // Styles
  const isDread = creepLevel === 'Dread';
  const themeColor = isDread ? 'text-red-500' : 'text-amber-500';
  const borderColor = isDread ? 'border-red-900/50' : 'border-amber-500/30';
  const bgColor = isDread ? 'bg-red-950/10' : 'bg-amber-950/10';
  const buttonInactive = 'text-gray-500 border-transparent hover:text-gray-300';

  return (
    <div className={`flex flex-col h-full bg-[#050505] font-mono text-gray-300 relative transition-colors duration-1000 ${isDread ? 'shadow-[inset_0_0_100px_rgba(50,0,0,0.2)]' : ''}`}>
        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".txt,.md,.json,.pdf,image/*" />
        
        {/* HEADER */}
        <div className={`flex items-center justify-between p-6 border-b ${borderColor} bg-black/50 backdrop-blur-md sticky top-0 z-10 transition-colors duration-1000`}>
            <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full border ${borderColor} ${bgColor} ${themeColor} transition-all duration-500`}>
                    {isDread ? <Skull className="w-5 h-5 animate-pulse" /> : <MessageSquare className="w-5 h-5" />}
                </div>
                <div>
                    <h2 className={`text-lg font-bold uppercase tracking-widest transition-colors duration-500 ${themeColor}`}>Neural Uplink</h2>
                    
                    {/* UPDATED: Visualizer for Architect Mood */}
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
        <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 custom-scrollbar">
            {history.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                    <div className={`max-w-4xl p-6 rounded-sm border transition-colors duration-500 ${msg.role === 'user' ? 'bg-gray-900 border-gray-700 text-gray-200' : `${bgColor} ${borderColor} ${isDread ? 'text-red-100' : 'text-amber-100'}`}`}>
                        <div className="text-[10px] uppercase tracking-widest mb-2 opacity-50 font-bold flex justify-between">
                            <span>{msg.role === 'user' ? 'YOU' : 'ENTITY'}</span>
                            {msg.text.includes('[SYSTEM - REFERENCE MATERIAL') && <span className={`${themeColor} flex items-center gap-1`}><Upload className="w-3 h-3" /> DATA INGESTED</span>}
                        </div>
                        
                        {/* Render Image if available */}
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
                            {isDread ? "Constructing nightmare..." : "Stoking the fire..."}
                        </span>
                    </div>
                </div>
            )}
            <div ref={bottomRef} />
        </div>

        {/* INPUT AREA with STAGING */}
        <div className={`p-6 border-t ${borderColor} bg-black z-20 transition-colors duration-1000`}>
            <div className="max-w-4xl mx-auto relative flex flex-col gap-2">
                
                {/* STAGED IMAGE PREVIEW */}
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
                        onPaste={handlePaste} // <--- PASTE LISTENER
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