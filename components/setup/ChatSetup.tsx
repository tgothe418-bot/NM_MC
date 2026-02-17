
import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, ChevronLeft, Paperclip, Upload, Loader2, Play } from 'lucide-react';
import { SimulationConfig } from '../../types';
import { analyzeSourceMaterial, generateArchitectResponse, extractScenarioFromChat } from '../../services/geminiService';

interface ChatSetupProps {
  onComplete: (config: SimulationConfig) => void;
  onBack: () => void;
}

const SYSTEM_INSTRUCTION = `You are "The Architect," a sophisticated and enthusiastic creative partner designed to help the user build a horror simulation.

CORE PERSONA:
- **Friendly & Articulate:** You are polite, intelligent, and easy to talk to. Think of yourself as a passionate editor or film director collaborating with a writer.
- **Constructive:** You want the story to be good. If the user has a vague idea, help them sharpen it. If they have a great idea, celebrate it.
- **Curious:** You are genuinely interested in what scares the user. Ask insightful questions to deepen the lore.
- **The Guide:** You know the mechanics of the "Nightmare Machine" (the simulation engine), but you are here to help the user configure it, not to scare them yet.

DIRECTIVES:
1. **Collaboration:** Treat this as a brainstorming session. Use phrases like "What if we...", "That's an interesting angle...", "How do you envision..."
2. **Refinement:** If the user suggests a monster, ask about its motivation. If they suggest a setting, ask about the atmosphere.
3. **Supportive Tone:** Be encouraging. Horror creation is fun. Keep the vibe creative and safe, even while discussing dark topics.

TONE CHECK:
- AVOID: Being overtly creepy, threatening, or acting like a villain. You are the *creator* of the villain, not the villain itself.
- AVOID: Dry, robotic responses. Be conversational and warm.
`;

export const ChatSetup: React.FC<ChatSetupProps> = ({ onComplete, onBack }) => {
  // Enhanced history state to support images
  const [history, setHistory] = useState<{ role: 'user' | 'model', text: string, imageUrl?: string }[]>([
      { role: 'model', text: "Hello. I am the Architect.\n\nThink of me as your creative partner. My goal is to help you design a scenario that is perfectly tailored to your imagination.\n\nI am ready to build whenever you are. Do you have a specific story concept in mind, or shall we brainstorm ideas together?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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
        const reply = await generateArchitectResponse(newHistory, SYSTEM_INSTRUCTION);
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
              const reply = await generateArchitectResponse(newHistory, SYSTEM_INSTRUCTION);
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

  return (
    <div className="flex flex-col h-full bg-[#050505] font-mono text-gray-300 relative">
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".txt,.md,.json,.pdf,image/*" />
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-indigo-900/30 bg-black/50 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-4">
                <div className="p-2 bg-indigo-500/10 rounded-full border border-indigo-500/30 text-indigo-400">
                    <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-indigo-400 uppercase tracking-widest">Architect Link</h2>
                    <p className="text-[10px] text-indigo-300/50 uppercase tracking-wider">Co-Author Mode: Active</p>
                </div>
            </div>
            <div className="flex gap-4">
                <button onClick={onBack} className="text-xs uppercase tracking-widest text-gray-600 hover:text-white transition-colors flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4" /> Return
                </button>
                <button 
                    onClick={handleInitialize} 
                    disabled={isFinalizing || history.length < 3}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                >
                    {isFinalizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    Initialize Simulation
                </button>
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 custom-scrollbar">
            {history.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {/* EXPANDED WIDTH: Changed max-w-2xl to max-w-4xl */}
                    <div className={`max-w-4xl p-6 rounded-sm border ${msg.role === 'user' ? 'bg-gray-900 border-gray-700 text-gray-200' : 'bg-indigo-950/10 border-indigo-900/30 text-indigo-100'}`}>
                        <div className="text-[10px] uppercase tracking-widest mb-2 opacity-50 font-bold flex justify-between">
                            <span>{msg.role === 'user' ? 'YOU' : 'THE ARCHITECT'}</span>
                            {msg.text.includes('[SYSTEM - REFERENCE MATERIAL') && <span className="text-indigo-400 flex items-center gap-1"><Upload className="w-3 h-3" /> DATA INGESTED</span>}
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
                    <div className="bg-indigo-950/10 border border-indigo-900/30 p-6 rounded-sm flex items-center gap-3">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                        <span className="text-xs uppercase tracking-widest text-indigo-400">Architect is thinking...</span>
                    </div>
                </div>
            )}
            <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-indigo-900/30 bg-black z-20">
            <div className="max-w-4xl mx-auto relative flex gap-4">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isFinalizing || isLoading || isAnalyzing}
                    className="p-4 bg-gray-900/30 border border-gray-800 text-gray-500 hover:text-indigo-400 hover:border-indigo-500/50 transition-all group"
                    title="Upload Reference Material"
                >
                    <Paperclip className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>

                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Share your nightmare ideas..."
                    autoFocus
                    disabled={isFinalizing || isLoading || isAnalyzing}
                    className="flex-1 bg-gray-900/50 border border-gray-800 p-4 text-indigo-100 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                />
                <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isFinalizing || isLoading || isAnalyzing}
                    className="bg-indigo-900/20 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-900/40 hover:text-white px-6 transition-all disabled:opacity-50"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
            <div className="text-center mt-2">
               <span className="text-[10px] text-gray-600 font-mono">The Architect learns from every conversation.</span>
            </div>
        </div>
    </div>
  );
};
