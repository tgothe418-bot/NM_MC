
import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage } from '../types';
import { Loader2, Upload, Image as ImageIcon } from 'lucide-react';

interface StoryLogProps {
  history: ChatMessage[];
  isLoading: boolean;
  currentImage?: string;
  className?: string;
}

export const StoryLog: React.FC<StoryLogProps> = ({ history, isLoading, currentImage, className = "" }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [history, isLoading, currentImage]);

  return (
    <div className={`flex-1 overflow-y-auto px-6 md:px-12 pt-6 md:pt-12 pb-4 space-y-8 custom-scrollbar ${className}`}>
      {currentImage && (
        <div className="flex justify-center animate-fadeIn mb-8">
          <div className="max-w-3xl w-full rounded-sm border transition-all duration-700 bg-black/40 text-gray-100"
               style={{
                   borderColor: `rgba(var(--theme-color), calc(0.3 + (var(--ui-intensity) * 0.7)))`,
                   boxShadow: `0 0 calc(var(--ui-intensity) * 20px) rgba(var(--theme-color), calc(var(--ui-intensity) * 0.2))`
               }}>
            <div className="text-[10px] uppercase tracking-widest p-4 opacity-50 font-bold flex items-center gap-2 border-b border-gray-800/50">
                <ImageIcon className="w-3 h-3" /> CURRENT ENVIRONMENT
            </div>
            <img src={currentImage} alt="Current Environment" className="w-full h-auto max-h-[500px] object-contain bg-black/50" />
          </div>
        </div>
      )}

      {history.map((msg, idx) => (
        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
          <div className={`max-w-3xl p-6 rounded-sm border transition-all duration-700 ${
            msg.role === 'user' 
              ? 'bg-gray-900 border-gray-700 text-gray-200' 
              : 'bg-black/40 text-gray-100'
          }`}
          style={msg.role !== 'user' ? {
              borderColor: `rgba(var(--theme-color), calc(0.3 + (var(--ui-intensity) * 0.7)))`,
              boxShadow: `0 0 calc(var(--ui-intensity) * 20px) rgba(var(--theme-color), calc(var(--ui-intensity) * 0.2))`
          } : {}}
          >
            <div className="text-[10px] uppercase tracking-widest mb-2 opacity-50 font-bold flex justify-between">
                <span>{msg.role === 'user' ? 'YOU' : 'NARRATOR'}</span>
                {msg.text.includes('[SYSTEM - REFERENCE MATERIAL') && <span className="flex items-center gap-1"><Upload className="w-3 h-3" /> DATA</span>}
            </div>

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
            <div className="bg-black/40 border p-6 rounded-sm flex items-center gap-3"
                 style={{
                     borderColor: `rgba(var(--theme-color), calc(0.3 + (var(--ui-intensity) * 0.7)))`,
                     boxShadow: `0 0 calc(var(--ui-intensity) * 20px) rgba(var(--theme-color), calc(var(--ui-intensity) * 0.2))`
                 }}>
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: `rgb(var(--theme-color))` }} />
                <span className="text-xs uppercase tracking-widest" style={{ color: `rgb(var(--theme-color))` }}>Dreaming...</span>
            </div>
        </div>
      )}
      
      <div ref={bottomRef} />
    </div>
  );
};
