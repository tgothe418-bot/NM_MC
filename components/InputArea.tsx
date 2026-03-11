import React, { useState, useRef } from 'react';
import { Send, Paperclip } from 'lucide-react';

interface InputAreaProps {
  onSend: (text: string, files: File[]) => void;
  isLoading: boolean;
  options?: string[];
  isSidebar?: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ 
  onSend, 
  isLoading, 
  options = [],
  isSidebar = false 
}) => {
  const [input, setInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input, []);
    setInput('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          onSend("", Array.from(e.target.files));
          if (fileInputRef.current) fileInputRef.current.value = '';
      }
  };

  return (
    <div className="flex flex-col gap-4">
       {options.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
            {options.map((opt, i) => (
                <button 
                    key={i}
                    onClick={() => onSend(opt, [])}
                    disabled={isLoading}
                    className="text-xs px-3 py-1.5 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-200 rounded-sm transition-all uppercase tracking-wider"
                >
                    {opt}
                </button>
            ))}
        </div>
       )}

       <div className="relative flex gap-2">
           <input 
               type="file" 
               ref={fileInputRef} 
               onChange={handleFileUpload} 
               className="hidden" 
               multiple 
           />
           <button
               onClick={() => fileInputRef.current?.click()}
               disabled={isLoading}
               className="p-3 bg-black border border-red-900/50 text-red-900 hover:text-red-500 transition-colors"
           >
               <Paperclip className="w-5 h-5" />
           </button>

           <input 
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               placeholder={isLoading ? "The Machine is processing..." : "What do you do?"}
               disabled={isLoading}
               className={`flex-1 bg-black border ${isLoading ? 'border-red-900 animate-pulse' : 'border-red-900/50'} p-3 text-red-100 focus:border-red-600 focus:outline-none transition-all font-mono text-sm placeholder-red-900/40`}
           />

           <button 
               onClick={handleSend}
               disabled={!input.trim() || isLoading}
               className="p-3 bg-red-900 hover:bg-red-700 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-[0_0_15px_rgba(220,38,38,0.2)]"
           >
               {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
           </button>
       </div>
    </div>
  );
};