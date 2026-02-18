
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Activity, FastForward, Paperclip, X, 
  FileText, ChevronRight, MessageSquare, Eye, 
  Zap, Hand, CornerDownLeft
} from 'lucide-react';

interface InputAreaProps {
  onSend: (text: string, files: File[]) => void;
  onAdvance?: () => void;
  isLoading: boolean;
  inputType?: 'text' | 'choice_yes_no';
  externalValue?: string;
  options?: string[];
  isSidebar?: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ 
  onSend, 
  onAdvance, 
  isLoading, 
  inputType = 'text', 
  externalValue, 
  options,
  isSidebar = false
}) => {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (externalValue !== undefined) {
      setText(externalValue);
    }
  }, [externalValue]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((text.trim() || files.length > 0) && !isLoading) {
      onSend(text, files);
      setText('');
      setFiles([]);
    }
  };

  const handleOptionClick = (option: string) => {
    if (!isLoading) {
      setText(option);
      if (textareaRef.current) {
        textareaRef.current.focus();
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.selectionStart = textareaRef.current.value.length;
                textareaRef.current.selectionEnd = textareaRef.current.value.length;
            }
        }, 0);
      }
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
    
    if (lower.startsWith('"') || lower.startsWith("'") || lower.startsWith('ask') || lower.startsWith('say') || lower.startsWith('shout') || lower.startsWith('whisper') || lower.startsWith('threaten') || lower.startsWith('speak')) {
      return { 
        icon: MessageSquare, 
        style: "border-indigo-800/60 text-indigo-300 bg-indigo-950/20 hover:bg-indigo-900/60 hover:border-indigo-400 hover:text-white hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]",
        label: "Dialogue"
      };
    }
    if (lower.startsWith('examine') || lower.startsWith('look') || lower.startsWith('scan') || lower.startsWith('inspect') || lower.startsWith('read') || lower.startsWith('search') || lower.startsWith('check')) {
       return { 
        icon: Eye, 
        style: "border-cyan-800/60 text-cyan-300 bg-cyan-950/20 hover:bg-cyan-900/60 hover:border-cyan-400 hover:text-white hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]",
        label: "Observe"
      };
    }
    if (lower.startsWith('attack') || lower.startsWith('fight') || lower.startsWith('shoot') || lower.startsWith('kill') || lower.startsWith('run') || lower.startsWith('flee') || lower.startsWith('destroy')) {
       return { 
        icon: Zap, 
        style: "border-red-800/60 text-red-300 bg-red-950/20 hover:bg-red-900/60 hover:border-red-400 hover:text-white hover:shadow-[0_0_15px_rgba(220,38,38,0.3)]",
        label: "Action"
      };
    }
    if (lower.startsWith('take') || lower.startsWith('grab') || lower.startsWith('use') || lower.startsWith('open') || lower.startsWith('pick') || lower.startsWith('enter') || lower.startsWith('barricade')) {
       return { 
        icon: Hand, 
        style: "border-amber-800/60 text-amber-300 bg-amber-950/20 hover:bg-amber-900/60 hover:border-amber-400 hover:text-white hover:shadow-[0_0_15px_rgba(217,119,6,0.3)]",
        label: "Interact"
      };
    }
    return { 
      icon: ChevronRight, 
      style: "border-gray-800 bg-black/60 text-gray-400 hover:text-white hover:border-gray-500 hover:bg-gray-800",
      label: "Option"
    };
  };

  return (
    <div className={`relative w-full mx-auto flex flex-col gap-4 ${isSidebar ? 'h-full' : 'max-w-[1600px]'}`}>
      
      {options && options.length > 0 && !isLoading && (
        <div className={`flex gap-3 mb-2 animate-fadeIn pb-2 ${isSidebar ? 'flex-col overflow-y-auto flex-1 min-h-0 custom-scrollbar pr-2' : 'flex-wrap justify-end'}`}>
          {isSidebar && <div className="mt-auto" />}
          {isSidebar && <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3 border-b border-gray-800 pb-2 shrink-0 flex justify-between items-center">
              <span>Suggested Vectors</span>
              <span className="text-[9px] opacity-50">Click to Edit</span>
          </div>}
          
          {options.map((option, idx) => {
            const { icon: Icon, style } = getActionStyle(option);
            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(option)}
                className={`relative px-4 py-4 border rounded-sm text-sm font-mono tracking-wide transition-all duration-300 flex items-start gap-4 group backdrop-blur-md shadow-lg ${style} ${isSidebar ? 'w-full text-left shrink-0 whitespace-normal h-auto' : ''}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity group-hover:scale-110 duration-200" />
                </div>
                
                <div className="flex-1 min-w-0">
                    <span className={`font-semibold leading-relaxed block ${isSidebar ? 'break-words' : 'truncate'}`}>{option}</span>
                </div>

                {isSidebar && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-black/50 px-2 py-1 rounded border border-white/10">
                        <span className="text-[9px] uppercase tracking-widest text-white">Use</span>
                        <CornerDownLeft className="w-3 h-3 text-white" />
                    </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      <form onSubmit={handleSubmit} className={`relative group ${isSidebar ? (!options || options.length === 0 ? 'mt-auto' : '') : ''}`}>
        <div className={`absolute -inset-1 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-lg blur-md opacity-30 group-hover:opacity-70 transition duration-1000 ${isLoading ? 'animate-pulse' : ''}`}></div>
        <div className={`relative flex flex-col bg-black/90 border-2 rounded-lg p-3 shadow-3xl transition-all duration-700 backdrop-blur-xl border-gray-800 group-hover:border-gray-700`}>
          
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
            <div className="flex flex-col gap-1 pb-1">
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
                className="p-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-all disabled:opacity-20 disabled:cursor-not-allowed relative group/attach"
                title="Attach Data"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              {onAdvance && (
                <button
                  type="button"
                  onClick={onAdvance}
                  disabled={isLoading}
                  className="p-2 rounded-lg text-gray-500 hover:text-amber-500 hover:bg-gray-800 transition-all disabled:opacity-20 disabled:cursor-not-allowed group/adv relative"
                  title="Advance Narrative"
                >
                   <FastForward className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="relative w-full px-2 self-center">
              <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isLoading ? "Re-simulating..." : "Volition..."}
                  disabled={isLoading}
                  rows={1}
                  className={`w-full bg-transparent text-gray-100 placeholder-gray-700 px-2 py-3 focus:outline-none resize-none font-serif text-xl max-h-96 disabled:opacity-50 transition-all`}
                  style={{ minHeight: '50px' }}
              />
            </div>
            
            <button
              type="submit"
              disabled={(!text.trim() && files.length === 0) || isLoading}
              className={`p-3 rounded-lg text-gray-600 hover:text-white hover:bg-gray-800 transition-all disabled:opacity-10 disabled:cursor-not-allowed self-end`}
            >
              {isLoading ? <Activity className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
