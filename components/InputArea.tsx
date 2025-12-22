
import React, { useState, useRef, useEffect } from 'react';
import { Send, Activity, Camera, Mic } from 'lucide-react';

interface InputAreaProps {
  onSend: (text: string) => void;
  onSnapshot?: () => void;
  isLoading: boolean;
  inputType?: 'text' | 'choice_yes_no';
  externalValue?: string; 
}

export const InputArea: React.FC<InputAreaProps> = ({ onSend, onSnapshot, isLoading, inputType = 'text', externalValue }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);

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
    <div className="relative w-full max-w-5xl mx-auto">
      <form onSubmit={handleSubmit} className="relative group">
        <div className={`absolute -inset-1 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-2xl blur-md opacity-30 group-hover:opacity-70 transition duration-1000 ${isLoading ? 'animate-pulse' : ''} ${isVoiceActive ? 'opacity-90 from-red-900 via-red-600 to-red-900' : ''}`}></div>
        <div className={`relative flex items-center bg-black/90 border-2 rounded-2xl p-4 shadow-3xl transition-all duration-700 backdrop-blur-xl ${isVoiceActive ? 'border-red-900 shadow-[0_0_40px_rgba(220,20,60,0.2)]' : 'border-gray-800 group-hover:border-gray-700'}`}>
          
          {onSnapshot && (
            <button
              type="button"
              onClick={onSnapshot}
              disabled={isLoading}
              className="p-4 rounded-xl text-gray-500 hover:text-system-cyan hover:bg-gray-800 transition-all disabled:opacity-20 disabled:cursor-not-allowed group/cam relative"
              title="Visualize Neural Landscape"
            >
               <Camera className="w-8 h-8" />
               <span className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 text-xs bg-black border border-gray-700 text-gray-300 px-3 py-1.5 rounded-lg opacity-0 group-hover/cam:opacity-100 transition-opacity pointer-events-none whitespace-nowrap uppercase tracking-widest font-mono shadow-2xl">
                 Project Neural Image
               </span>
            </button>
          )}

          <div className="relative w-full px-4">
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
            disabled={!text.trim() || isLoading}
            className={`p-4 rounded-xl text-gray-600 hover:text-white hover:bg-gray-800 transition-all disabled:opacity-10 disabled:cursor-not-allowed ${isVoiceActive ? 'text-red-500 hover:bg-red-900/30 animate-pulse' : ''}`}
          >
            {isLoading ? <Activity className="w-8 h-8 animate-spin" /> : <Send className="w-8 h-8" />}
          </button>
        </div>
      </form>
    </div>
  );
};
