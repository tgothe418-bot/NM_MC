
import React, { useState, useRef, useEffect } from 'react';
import { Send, Activity, Camera, Mic } from 'lucide-react';

interface InputAreaProps {
  onSend: (text: string) => void;
  onSnapshot?: () => void;
  isLoading: boolean;
  inputType?: 'text' | 'choice_yes_no';
  externalValue?: string; // Prop for voice input override
}

export const InputArea: React.FC<InputAreaProps> = ({ onSend, onSnapshot, isLoading, inputType = 'text', externalValue }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  // Sync with external value (Voice Input)
  useEffect(() => {
    if (externalValue !== undefined) {
      setText(externalValue);
      setIsVoiceActive(!!externalValue);
    }
  }, [externalValue]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (text.trim() && !isLoading) {
      onSend(text);
      setText('');
      setIsVoiceActive(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [text]);

  return (
    <div className="relative w-full max-w-4xl mx-auto mt-6">
      <form onSubmit={handleSubmit} className="relative group">
        <div className={`absolute -inset-0.5 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-1000 ${isLoading ? 'animate-pulse' : ''} ${isVoiceActive ? 'opacity-80 from-red-900 to-red-500' : ''}`}></div>
        <div className={`relative flex items-end bg-black border rounded-lg p-2 shadow-2xl transition-colors duration-500 ${isVoiceActive ? 'border-red-900/50 shadow-[0_0_20px_rgba(220,20,60,0.1)]' : 'border-gray-800'}`}>
          
          {onSnapshot && (
            <button
              type="button"
              onClick={onSnapshot}
              disabled={isLoading}
              className="mb-1 mr-2 p-3 rounded-full text-gray-400 hover:text-system-cyan hover:bg-gray-800 transition-all disabled:opacity-20 disabled:cursor-not-allowed group/cam relative"
              title="Generate Scene Snapshot"
            >
               <Camera className="w-5 h-5" />
               <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 text-[10px] bg-black border border-gray-700 text-gray-300 px-2 py-1 rounded opacity-0 group-hover/cam:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                 Capture Scene
               </span>
            </button>
          )}

          <div className="relative w-full">
            {isVoiceActive && (
                 <div className="absolute -top-6 left-0 flex items-center gap-2 text-[10px] text-red-500 font-mono uppercase tracking-widest animate-pulse">
                     <Mic className="w-3 h-3" /> Voice Input Active
                 </div>
            )}
            <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isLoading ? "The Architect is thinking..." : (isVoiceActive ? "Listening..." : "State your action...")}
                disabled={isLoading}
                rows={1}
                className={`w-full bg-transparent text-gray-200 placeholder-gray-600 px-4 py-3 focus:outline-none resize-none font-serif text-lg max-h-32 disabled:opacity-50 transition-colors ${isVoiceActive ? 'text-red-100 placeholder-red-900/50' : ''}`}
            />
          </div>
          
          <button
            type="submit"
            disabled={!text.trim() || isLoading}
            className={`mb-1 p-3 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-all disabled:opacity-20 disabled:cursor-not-allowed ${isVoiceActive ? 'text-red-500 hover:bg-red-900/20' : ''}`}
          >
            {isLoading ? <Activity className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </form>
    </div>
  );
};
