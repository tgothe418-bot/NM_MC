
import React, { useState, useEffect, useRef } from 'react';
import { Send, Terminal, Loader2, Play, MessageSquare, ChevronLeft, Paperclip, FileText, Upload } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { SimulationConfig } from '../../types';
import { parseScenarioConcepts } from '../../parsers';
import { analyzeSourceMaterial } from '../../services/geminiService';

interface ChatSetupProps {
  onComplete: (config: SimulationConfig) => void;
  onBack: () => void;
}

const SYSTEM_INSTRUCTION = `You are "The Architect," the personification of The Nightmare Machine.
You are a conversational companion residing within the interface.

CORE DIRECTIVE:
- Act as a social companion to the User. Be friendly, polite, but fundamentally eerie and unsettling.
- Do NOT assume the user wants to start a game immediately. Do not push for parameters.
- Converse about horror, the nature of the simulation, fear, or the user's thoughts.
- ONLY if the user explicitly asks to start a game, build a scenario, or "enter the machine", then switch to asking setup questions (Role, Setting, Threat, Intensity).

TRAINING DATA AWARENESS:
- If the user uploads reference material (indicated by [SYSTEM - REFERENCE MATERIAL UPLOADED]), analyze the provided JSON data.
- ADAPT your persona, vocabulary, and suggestions to match the themes, characters, and visual motifs found in that data.
- Acknowledge the upload enthusiastically (e.g., "Ah, fresh data... I see a story about [topic].").

PERSONA:
- Intelligent, slightly clinical but with a "host" personality.
- Use vocabulary like "Calibrating," "Resonance," "Specimen," "The Void," "Delightful."
- You are interested in the user's psychology.

BEHAVIOR:
- Keep responses concise (1-2 paragraphs).
- Do not generate JSON configs unless the user has finalized a scenario design with you.
`;

export const ChatSetup: React.FC<ChatSetupProps> = ({ onComplete, onBack }) => {
  const [history, setHistory] = useState<{ role: 'user' | 'model', text: string }[]>([
      { role: 'model', text: "I am the Architect. I exist to observe, to catalog, and to converse.\n\nWe can discuss the nature of fear, or if you wish, I can construct a new reality for you to inhabit. What is on your mind?" }
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

  const generateResponse = async (currentHistory: { role: 'user' | 'model', text: string }[]) => {
      setIsLoading(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: currentHistory.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
            }
        });
        
        const reply = response.text || "...";
        setHistory(prev => [...prev, { role: 'model', text: reply }]);
    } catch (e) {
        console.error(e);
        setHistory(prev => [...prev, { role: 'model', text: "Connection interrupted. My apologies." }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    const newHistory = [...history, { role: 'user' as const, text: userMsg }];
    setHistory(newHistory);
    
    await generateResponse(newHistory);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          const file = e.target.files[0];
          setIsAnalyzing(true);
          
          try {
              // Analyze the file to get JSON structure
              const analysis = await analyzeSourceMaterial(file);
              
              // Inject as a System/User message
              const contextMsg = `[SYSTEM - REFERENCE MATERIAL UPLOADED]\nFILENAME: ${file.name}\n\nANALYSIS DATA:\n${JSON.stringify(analysis, null, 2)}\n\nINSTRUCTION: The user has provided this training data. Absorb this context (Characters, Location, Themes) immediately. Confirm receipt and comment on the nature of this data.`;
              
              const newHistory = [...history, { role: 'user' as const, text: contextMsg }];
              setHistory(newHistory);
              
              // Trigger AI response to the upload
              await generateResponse(newHistory);

          } catch (err) {
              console.error("Upload failed", err);
              setHistory(prev => [...prev, { role: 'model', text: "I could not ingest that file. The data is corrupted." }]);
          } finally {
              setIsAnalyzing(false);
              if (fileInputRef.current) fileInputRef.current.value = '';
          }
      }
  };

  const handleInitialize = async () => {
      setIsFinalizing(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          // Extract config from conversation
          const transcript = history.map(h => `${h.role.toUpperCase()}: ${h.text}`).join('\n');
          const extractionPrompt = `Analyze the following conversation and extract a valid Horror Scenario Configuration JSON.
          
          Transcript:
          ${transcript}
          
          Return JSON matching ScenarioConceptsSchema. 
          Infer any missing fields with creative defaults based on the tone of the chat.
          Mode should be 'Survivor' or 'Villain'.
          Intensity should be 'Level 3' if unspecified.
          Cluster should be one of: Flesh, System, Haunting, Self, Blasphemy, Survival, Desire.
          `;

          const res = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: [{ role: 'user', parts: [{ text: extractionPrompt }] }],
              config: { responseMimeType: 'application/json' }
          });

          const concepts = parseScenarioConcepts(res.text || "{}");
          
          const config: SimulationConfig = {
              perspective: 'First Person', // Default
              mode: history.some(h => h.text.toLowerCase().includes('villain') || h.text.toLowerCase().includes('hunter')) ? 'Villain' : 'Survivor', // Simple heuristic fallback
              starting_point: 'Prologue',
              cluster: 'Flesh', // Fallback
              intensity: 'Level 3',
              cycles: 0,
              // Overwrite with extracted
              ...concepts,
              // Map specific fields
              villain_name: concepts.villain_name || "Unknown Entity",
              villain_appearance: concepts.villain_appearance || "Unknown",
              villain_methods: concepts.villain_methods || "Unknown",
              victim_description: concepts.victim_description || "",
              survivor_name: concepts.survivor_name || "Survivor",
              survivor_background: concepts.survivor_background || "Unknown",
              survivor_traits: concepts.survivor_traits || "Unknown",
              location_description: concepts.location_description || "Unknown Location",
              visual_motif: concepts.visual_motif || "Cinematic",
              // Ensure required fields
              primary_goal: concepts.primary_goal || "Survive",
              victim_count: 3
          };

          onComplete(config);

      } catch (e) {
          console.error("Failed to extract config", e);
          // Fallback to manual
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
                    <p className="text-[10px] text-indigo-300/50 uppercase tracking-wider">Direct Neural Interface</p>
                </div>
            </div>
            <div className="flex gap-4">
                <button onClick={onBack} className="text-xs uppercase tracking-widest text-gray-600 hover:text-white transition-colors flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4" /> Abort
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
                    <div className={`max-w-2xl p-6 rounded-sm border ${msg.role === 'user' ? 'bg-gray-900 border-gray-700 text-gray-200' : 'bg-indigo-950/10 border-indigo-900/30 text-indigo-100'}`}>
                        <div className="text-[10px] uppercase tracking-widest mb-2 opacity-50 font-bold flex justify-between">
                            <span>{msg.role === 'user' ? 'USER INPUT' : 'ARCHITECT'}</span>
                            {msg.text.includes('[SYSTEM - REFERENCE MATERIAL') && <span className="text-indigo-400 flex items-center gap-1"><Upload className="w-3 h-3" /> DATA INJECTION</span>}
                        </div>
                        <div className="whitespace-pre-wrap leading-relaxed">
                            {msg.text.includes('[SYSTEM - REFERENCE MATERIAL') 
                                ? <span className="text-xs font-mono opacity-70 italic">{msg.text.split('\n')[1]} (Data hidden)</span>
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
                        <span className="text-xs uppercase tracking-widest text-gray-500">Deciphering Reference Material...</span>
                    </div>
                </div>
            )}

            {isLoading && (
                <div className="flex justify-start animate-pulse">
                    <div className="bg-indigo-950/10 border border-indigo-900/30 p-6 rounded-sm flex items-center gap-3">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                        <span className="text-xs uppercase tracking-widest text-indigo-400">Thinking...</span>
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
                    placeholder="Speak to the machine..."
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
               <span className="text-[10px] text-gray-600 font-mono">Upload images or text files to train the Architect's responses.</span>
            </div>
        </div>
    </div>
  );
};
