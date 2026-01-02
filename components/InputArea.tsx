

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Activity, Camera, Film, FastForward, Paperclip, X, 
  FileText, Terminal, ChevronRight, MessageSquare, Eye, 
  Zap, Hand, Mic
} from 'lucide-react';

interface InputAreaProps {
  onSend: (text: string, files: File[]) => void;
  onSnapshot?: () => void;
  onVideoCutscene?: () => void;
  onAdvance?: () => void;
  isLoading: boolean;
  inputType?: 'text' | 'choice_yes_no';
  externalValue?: string;
  showLogic?: boolean;
  onToggleLogic?: () => void;
  options?: string[];
}

export const InputArea: React.FC<InputAreaProps> = ({ onSend, onSnapshot, onVideoCutscene, onAdvance, isLoading, inputType = 'text', externalValue, showLogic, onToggleLogic, options }) => {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  useEffect(() => {
    if (externalValue !== undefined) {
      setText(externalValue);
      setIsVoiceActive(!!externalValue);
    }
  }, [externalValue]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((text.trim() || files.length > 0) && !isLoading) {
      onSend(text, files);
      setText('');
      setFiles([]);
      setIsVoiceActive(false);
    }
  };

  const handleOptionClick = (option: string) => {
    if (!isLoading) {
      onSend(option, []);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [text]);

  const getActionStyle = (action: string) => {
    const lower = action.toLowerCase();
    
    // Dialogue
    if (lower.startsWith('"') || lower.startsWith("'") || lower.startsWith('ask') || lower.startsWith('say') || lower.startsWith('shout') || lower.startsWith('whisper') || lower.startsWith('threaten') || lower.startsWith('speak')) {
      return { 
        icon: MessageSquare, 
        style: "border-indigo-800/60 text-indigo-300 bg-indigo-950/20 hover:bg-indigo-900/60 hover:border-indigo-400 hover:text-white hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]",
        label: "Dialogue"
      };
    }
    // Observation / Examine
    if (lower.startsWith('examine') || lower.startsWith('look') || lower.startsWith('scan') || lower.startsWith('inspect') || lower.startsWith('read') || lower.startsWith('search') || lower.startsWith('check')) {
       return { 
        icon: Eye, 
        style: "border-cyan-800/60 text-cyan-300 bg-cyan-950/20 hover:bg-cyan-900/60 hover:border-cyan-400 hover:text-white hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]",
        label: "Observe"
      };
    }
    // High Stakes Action / Combat
    if (lower.startsWith('attack') || lower.startsWith('fight') || lower.startsWith('shoot') || lower.startsWith('kill') || lower.startsWith('run') || lower.startsWith('flee') || lower.startsWith('destroy')) {
       return { 
        icon: Zap, 
        style: "border-red-800/60 text-red-300 bg-red-950/20 hover:bg-red-900/60 hover:border-red-400 hover:text-white hover:shadow-[0_0_15px_rgba(220,38,38,0.3)]",
        label: "Action"
      };
    }
    // Interaction
    if (lower.startsWith('take') || lower.startsWith('grab') || lower.startsWith('use') || lower.startsWith('open') || lower.startsWith('pick') || lower.startsWith('enter') || lower.startsWith('barricade')) {
       return { 
        icon: Hand, 
        style: "border-amber-800/60 text-amber-300 bg-amber-950/20 hover:bg-amber-900/60 hover:border-amber-400 hover:text-white hover:shadow-[0_0_15px_rgba(217,119,6,0.3)]",
        label: "Interact"
      };
    }
    // Default
    return { 
      icon: ChevronRight, 
      style: "border-gray-800 bg-black/60 text-gray-400 hover:text-white hover:border-gray-500 hover:bg-gray-800",
      label: "Option"
    };
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto flex flex-col gap-4">
      
      {/* Options/Suggestions Area */}
      {options && options.length > 0 && !isLoading && (
        <div className="flex flex-wrap justify-end gap-3 mb-4 animate-fadeIn">
          {options.map((option, idx) => {
            const { icon: Icon, style } = getActionStyle(option);
            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(option)}
                className={`px-5 py-3 border rounded-sm text-sm font-mono tracking-wide transition-all duration-300 flex items-center gap-3 group backdrop-blur-md shadow-lg ${style}`}
              >
                <Icon className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity group-hover:scale-110 duration-200" />
                <span className="font-semibold">{option}</span>
              </button>
            );
          })}
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative group">
        <div className={`absolute -inset-1 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-2xl blur-md opacity-30 group-hover:opacity-70 transition duration-1000 ${isLoading ? 'animate-pulse' : ''} ${isVoiceActive ? 'opacity-90 from-red-900 via-red-600 to-red-900' : ''}`}></div>
        <div className={`relative flex flex-col bg-black/90 border-2 rounded-2xl p-4 shadow-3xl transition-all duration-700 backdrop-blur-xl ${isVoiceActive ? 'border-red-900 shadow-[0_0_40px_rgba(220,20,60,0.2)]' : 'border-gray-800 group-hover:border-gray-700'}`}>
          
          {/* File Previews */}
          {files.length > 0 && (
            <div className="flex gap-3 px-2 mb-4 overflow-x-auto pb-2 custom-scrollbar">
              {files.map((file, idx) => (
                <div key={idx} className="relative flex items-center gap-3 bg-gray-900 border border-gray-700 rounded-lg p-2 pr-8 shrink-0 animate-fadeIn">
                  {file.type.startsWith('image/') ? (
                    <div className="w-8 h-8 rounded bg-gray-800 overflow-hidden relative">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt="preview" 
                          className="w-full h-full object-cover opacity-80"
                        />
                    </div>
                  ) : (
                    <FileText className="w-8 h-8 text-gray-500" />
                  )}
                  <div className="flex flex-col max-w-[120px]">
                    <span className="text-xs text-gray-300 truncate font-mono">{file.name}</span>
                    <span className="text-[9px] text-gray-600 uppercase tracking-wider">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeFile(idx)}
                    className="absolute top-1 right-1 text-gray-500 hover:text-red-500 transition-colors p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2">
            <div className="flex flex-col gap-2 pb-1">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                multiple
                accept="image/*,.txt,.md,.json,.csv"
              />
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="p-3 rounded-xl text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-all disabled:opacity-20 disabled:cursor-not-allowed relative group/attach"
                title="Attach Data"
              >
                <Paperclip className="w-6 h-6" />
                <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 text-xs bg-black border border-gray-700 text-gray-300 px-3 py-1.5 rounded-lg opacity-0 group-hover/attach:opacity-100 transition-opacity pointer-events-none whitespace-nowrap uppercase tracking-widest font-mono shadow-2xl z-20">
                   Attach Data
                </span>
              </button>

              {onAdvance && (
                <button
                  type="button"
                  onClick={onAdvance}
                  disabled={isLoading}
                  className="p-3 rounded-xl text-gray-500 hover:text-amber-500 hover:bg-gray-800 transition-all disabled:opacity-20 disabled:cursor-not-allowed group/adv relative"
                  title="Advance Narrative"
                >
                   <FastForward className="w-6 h-6" />
                   <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 text-xs bg-black border border-gray-700 text-gray-300 px-3 py-1.5 rounded-lg opacity-0 group-hover/adv:opacity-100 transition-opacity pointer-events-none whitespace-nowrap uppercase tracking-widest font-mono shadow-2xl z-20">
                     Yield Turn
                   </span>
                </button>
              )}

              {onSnapshot && (
                <button
                  type="button"
                  onClick={onSnapshot}
                  disabled={isLoading}
                  className="p-3 rounded-xl text-gray-500 hover:text-system-cyan hover:bg-gray-800 transition-all disabled:opacity-20 disabled:cursor-not-allowed group/cam relative"
                  title="Visualize Neural Landscape"
                >
                   <Camera className="w-6 h-6" />
                   <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 text-xs bg-black border border-gray-700 text-gray-300 px-3 py-1.5 rounded-lg opacity-0 group-hover/cam:opacity-100 transition-opacity pointer-events-none whitespace-nowrap uppercase tracking-widest font-mono shadow-2xl z-20">
                     Project Neural Image
                   </span>
                </button>
              )}

              {onVideoCutscene && (
                <button
                  type="button"
                  onClick={onVideoCutscene}
                  disabled={isLoading}
                  className="p-3 rounded-xl text-gray-500 hover:text-red-500 hover:bg-gray-800 transition-all disabled:opacity-20 disabled:cursor-not-allowed group/vid relative"
                  title="Cinematic Cutscene"
                >
                   <Film className="w-6 h-6" />
                   <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 text-xs bg-black border border-gray-700 text-gray-300 px-3 py-1.5 rounded-lg opacity-0 group-hover/vid:opacity-100 transition-opacity pointer-events-none whitespace-nowrap uppercase tracking-widest font-mono shadow-2xl z-20">
                     Neural Video Projection
                   </span>
                </button>
              )}

              {onToggleLogic && (
                <button
                  type="button"
                  onClick={onToggleLogic}
                  className={`p-3 rounded-xl transition-all relative group/logic ${showLogic ? 'text-green-500 bg-green-900/20' : 'text-gray-500 hover:text-green-400 hover:bg-gray-800'}`}
                  title="Toggle Logic Visualization"
                >
                   <Terminal className="w-6 h-6" />
                   <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 text-xs bg-black border border-gray-700 text-gray-300 px-3 py-1.5 rounded-lg opacity-0 group-hover/logic:opacity-100 transition-opacity pointer-events-none whitespace-nowrap uppercase tracking-widest font-mono shadow-2xl z-20">
                     {showLogic ? 'Hide Machine Logic' : 'View Untranslated Logic'}
                   </span>
                </button>
              )}
            </div>

            <div className="relative w-full px-4 self-center">
              {isVoiceActive && (
                   <div className="absolute -top-10 left-4 flex items-center gap-3 text-xs text-red-500 font-mono uppercase tracking-[0.4em] animate-pulse font-bold">
                       <Mic className="w-4 h-4" /> System Listening...
                   </div>
              )}
              <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isLoading ? "Architect is reweaving the simulation..." : (isVoiceActive ? "Speak to the Void..." : "Define your volition...")}
                  disabled={isLoading}
                  rows={1}
                  className={`w-full bg-transparent text-gray-100 placeholder-gray-700 px-2 py-4 focus:outline-none resize-none font-serif text-2xl max-h-64 disabled:opacity-50 transition-all ${isVoiceActive ? 'text-red-100 placeholder-red-900/40' : ''}`}
              />
            </div>
            
            <button
              type="submit"
              disabled={(!text.trim() && files.length === 0) || isLoading}
              className={`p-4 rounded-xl text-gray-600 hover:text-white hover:bg-gray-800 transition-all disabled:opacity-10 disabled:cursor-not-allowed self-end ${isVoiceActive ? 'text-red-500 hover:bg-red-900/30 animate-pulse' : ''}`}
            >
              {isLoading ? <Activity className="w-8 h-8 animate-spin" /> : <Send className="w-8 h-8" />}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};