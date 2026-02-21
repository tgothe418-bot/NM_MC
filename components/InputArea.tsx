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
                    className="text-xs px-3 py-1.5 border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-200 rounded-sm transition-all"
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
               className="p-3 bg-gray-900 border border-gray-700 text-gray-500 hover:text-indigo-400 transition-colors"
           >
               <Paperclip className="w-5 h-5" />
           </button>

           <input 
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               placeholder="What do you do?"
               disabled={isLoading}
               className="flex-1 bg-gray-900 border border-gray-700 p-3 text-gray-200 focus:border-indigo-500 focus:outline-none transition-all font-mono text-sm"
           />

           <button 
               onClick={handleSend}
               disabled={!input.trim() || isLoading}
               className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
           >
               <Send className="w-5 h-5" />
           </button>
       </div>
    </div>
  );
};