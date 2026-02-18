
import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage } from '../types';
import { Loader2, Upload } from 'lucide-react';

interface StoryLogProps {
  history: ChatMessage[];
  isLoading: boolean;
  className?: string;
}

export const StoryLog: React.FC<StoryLogProps> = ({ history, isLoading, className = "" }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isLoading]);

  return (
    <div className={`flex-1 overflow-y-auto p-6 md:p-12 space-y-8 custom-scrollbar ${className}`}>
      {history.map((msg, idx) => (
        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
          <div className={`max-w-3xl p-6 rounded-sm border ${
            msg.role === 'user' 
              ? 'bg-gray-900 border-gray-700 text-gray-200' 
              : 'bg-indigo-950/10 border-indigo-500/30 text-indigo-100'
          }`}>
            <div className="text-[10px] uppercase tracking-widest mb-2 opacity-50 font-bold flex justify-between">
                <span>{msg.role === 'user' ? 'YOU' : 'NARRATOR'}</span>
                {msg.text.includes('[SYSTEM - REFERENCE MATERIAL') && <span className="flex items-center gap-1"><Upload className="w-3 h-3" /> DATA</span>}
            </div>

            {msg.imageUrl && (
                <div className="mb-4 rounded overflow-hidden border border-gray-700 bg-black/50">
                    <img src={msg.imageUrl} alt="Visual Artifact" className="w-full h-auto max-h-[500px] object-contain" />
                </div>
            )}

            <div className="prose prose-invert prose-sm md:prose-base leading-relaxed whitespace-pre-wrap font-serif">
               <ReactMarkdown remarkPlugins={[remarkGfm]}>
                 {msg.text}
               </ReactMarkdown>
            </div>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start animate-pulse">
            <div className="bg-indigo-950/10 border border-indigo-500/30 p-6 rounded-sm flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span className="text-xs uppercase tracking-widest text-indigo-400">Dreaming...</span>
            </div>
        </div>
      )}
      
      <div ref={bottomRef} />
    </div>
  );
};
