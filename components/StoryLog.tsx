
import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { Image, FileText } from 'lucide-react';
import { SigilLoader } from './SigilLoader';

interface StoryLogProps {
  history: ChatMessage[];
  isLoading: boolean;
  activeCluster?: string;
}

const generateZalgo = (text: string, intensity: number = 1): string => {
  const chars = text.split('');
  const combining = [
    '\u0300', '\u0301', '\u0302', '\u0303', '\u0304', '\u0305', '\u0306', '\u0307',
    '\u0320', '\u0321', '\u0322', '\u0323', '\u0324', '\u0325', '\u0326', '\u0327'
  ];
  
  return chars.map(char => {
    if (Math.random() > 0.9) {
      let result = char;
      const num = Math.floor(Math.random() * intensity) + 1;
      for (let i = 0; i < num; i++) {
        result += combining[Math.floor(Math.random() * combining.length)];
      }
      return result;
    }
    return char;
  }).join('');
};

const getHighlightColor = (cluster?: string) => {
  if (!cluster || cluster === "None") return "text-green-200 drop-shadow-[0_0_10px_rgba(134,239,172,0.4)]";
  
  if (cluster.includes("Flesh")) return "text-fresh-blood drop-shadow-[0_0_10px_rgba(136,8,8,0.5)]";
  if (cluster.includes("System")) return "text-system-cyan drop-shadow-[0_0_10px_rgba(0,255,255,0.4)]";
  if (cluster.includes("Haunting")) return "text-haunt-gold drop-shadow-[0_0_10px_rgba(180,83,9,0.4)]";
  if (cluster.includes("Self")) return "text-psych-lavender drop-shadow-[0_0_10px_rgba(230,230,250,0.5)]";
  if (cluster.includes("Blasphemy")) return "text-blasphemy-sulfur drop-shadow-[0_0_10px_rgba(255,215,0,0.4)]";
  if (cluster.includes("Survival")) return "text-survival-ice drop-shadow-[0_0_10px_rgba(165,242,243,0.5)]";
  
  return "text-green-200";
};

const getAccentColor = (cluster?: string) => {
  if (!cluster || cluster === "None") return "text-gray-400";

  if (cluster.includes("Flesh")) return "text-red-400";
  if (cluster.includes("System")) return "text-green-400";
  if (cluster.includes("Haunting")) return "text-haunt-dust";
  if (cluster.includes("Self")) return "text-indigo-400";
  if (cluster.includes("Blasphemy")) return "text-purple-400";
  if (cluster.includes("Survival")) return "text-cyan-300";

  return "text-gray-400";
};

const applyTypographicAnomalies = (text: string): React.ReactNode[] => {
  const regex = /(\b(?:house|home|dwelling|hallway|hallways|corridor|room|rooms|walls|structure|place)\b|\b(?:minotaur|beast|monster|threat|horror)\b|\b(?:russet|crimson lake|crimson|cerulean sky|cerulean|cobalt|vermilion|ochre|umber|sienna|viridian)\b)/gi;
  const parts = text.split(regex);
  
  return parts.map((part, index) => {
    const lower = part.toLowerCase();
    
    if (['house', 'home', 'dwelling', 'hallway', 'hallways', 'corridor', 'room', 'rooms', 'walls', 'structure', 'place'].includes(lower)) {
       return <span key={index} className="text-[#4dabff] font-bold drop-shadow-[0_0_5px_rgba(77,171,255,0.3)]">{part}</span>;
    }
    
    if (['minotaur', 'beast', 'monster', 'threat', 'horror'].includes(lower)) {
       return (
         <span key={index} className="text-[#ff3b3b] font-bold relative inline-block">
            <span className="relative z-10">{part}</span>
            {lower === 'minotaur' && <span className="absolute left-0 top-1/2 w-full h-[2px] bg-red-600/50 transform -translate-y-1/2"></span>}
         </span>
       );
    }

    if (lower.includes('russet')) return <span key={index} style={{ color: '#9e5a26' }} className="font-bold">{part}</span>;
    if (lower.includes('crimson')) return <span key={index} style={{ color: '#ff1f4c' }} className="font-bold">{part}</span>;
    if (lower.includes('cerulean')) return <span key={index} style={{ color: '#0099d1' }} className="font-bold">{part}</span>;
    if (lower.includes('cobalt')) return <span key={index} style={{ color: '#1a66ff' }} className="font-bold">{part}</span>;
    if (lower.includes('vermilion')) return <span key={index} style={{ color: '#ff4d40' }} className="font-bold">{part}</span>;
    if (lower.includes('ochre')) return <span key={index} style={{ color: '#e68a00' }} className="font-bold">{part}</span>;
    if (lower.includes('umber')) return <span key={index} style={{ color: '#8c7060' }} className="font-bold">{part}</span>;
    if (lower.includes('sienna')) return <span key={index} style={{ color: '#b33b1d' }} className="font-bold">{part}</span>;
    if (lower.includes('viridian')) return <span key={index} style={{ color: '#4da68a' }} className="font-bold">{part}</span>;

    return part;
  });
};

const FormattedText: React.FC<{ text: string, cluster?: string }> = ({ text, cluster }) => {
  const isSystem = cluster?.includes("System");
  const parts = text.split(/(\[\^\d+\])/g);
  const highlightClass = getHighlightColor(cluster);
  const accentClass = getAccentColor(cluster);

  return (
    <span>
      {parts.map((part, k) => {
        if (part.match(/^\[\^\d+\]$/)) {
            return (
                <sup key={k} className="text-sm text-haunt-gold cursor-help ml-1 font-bold select-none hover:text-white transition-colors">
                    {part}
                </sup>
            );
        }

        let displayPart = part;
        if (isSystem && Math.random() > 0.95) {
             displayPart = generateZalgo(part, 4);
        }

        const boldParts = displayPart.split(/(\*\*[^*]+\*\*)/g);
        
        return (
          <span key={k}>
            {boldParts.map((subPart, i) => {
              if (subPart.startsWith('**') && subPart.endsWith('**')) {
                return (
                  <strong key={i} className={`font-bold tracking-wider transition-all duration-700 ${highlightClass}`}>
                    {subPart.slice(2, -2)}
                  </strong>
                );
              }
              
              const italicParts = subPart.split(/(\*[^*]+\*)/g);
              return (
                <span key={i}>
                  {italicParts.map((innerPart, j) => {
                    if (innerPart.startsWith('*') && innerPart.endsWith('*')) {
                      return (
                        <em key={j} className={`italic font-serif tracking-widest ${accentClass}`}>
                          {innerPart.slice(1, -1)}
                        </em>
                      );
                    }
                    return applyTypographicAnomalies(innerPart);
                  })}
                </span>
              );
            })}
          </span>
        );
      })}
    </span>
  );
};

export const StoryLog: React.FC<StoryLogProps> = ({ history, isLoading, activeCluster }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isLoading]);

  const latestModelMsg = [...history].reverse().find(m => m.role === 'model');
  const footnotes: string[] = [];
  if (latestModelMsg) {
      const regex = /\[\^(\d+)\]:\s*(.*)/g;
      let match;
      while ((match = regex.exec(latestModelMsg.text)) !== null) {
          footnotes.push(`${match[1]}. ${match[2]}`);
      }
  }

  return (
    <div className="flex-1 overflow-y-auto p-10 lg:p-20 custom-scrollbar bg-transparent relative z-10">
      <div className="max-w-4xl mx-auto space-y-16 pb-64">
        
        <div className="h-10"></div>

        {history.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fadeIn`}
          >
            {msg.role === 'user' ? (
              <div className="bg-gray-900/80 text-gray-100 px-10 py-6 rounded-3xl rounded-tr-none max-w-[85%] border border-gray-700 font-serif text-2xl shadow-2xl backdrop-blur-md">
                {msg.text}
              </div>
            ) : (
              <div className="max-w-full w-full space-y-8">
                {msg.imageUrl && (
                  <div className="mb-10 rounded-2xl overflow-hidden border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.7)] relative group max-w-2xl">
                    <img 
                      src={msg.imageUrl} 
                      alt="Neural hallucination" 
                      className="w-full h-auto opacity-90 group-hover:opacity-100 transition-all duration-1500 grayscale hover:grayscale-0 scale-105 hover:scale-100"
                    />
                    <div className="absolute bottom-4 right-4 bg-black/70 px-4 py-2 text-xs text-gray-300 font-mono flex items-center gap-2 uppercase tracking-[0.3em] backdrop-blur-md border border-gray-700 rounded-lg">
                      <Image className="w-4 h-4" /> Neural Projection
                    </div>
                  </div>
                )}
                
                <div className="prose prose-invert prose-p:font-serif prose-p:text-gray-200 prose-p:leading-[1.7] prose-headings:font-sans prose-headings:tracking-[0.3em] prose-headings:text-gray-400 prose-strong:text-green-300 max-w-none w-full">
                  {msg.text.split('\n').map((line, i) => {
                    if (!line.trim()) return <div key={i} className="h-6" />;
                    if (line.match(/^\[\^\d+\]:/)) return null;

                    const isBlockquote = line.trim().startsWith('>');
                    const content = isBlockquote ? line.trim().slice(1).trim() : line;
                    
                    return (
                      <p 
                        key={i} 
                        className={`mb-8 text-2xl tracking-wide ${
                          isBlockquote 
                            ? 'pl-10 border-l-8 border-haunt-gold/80 italic text-gray-200 font-serif text-3xl tracking-[0.05em] my-16 py-8 bg-black/60 rounded-r-xl shadow-2xl' 
                            : ''
                        }`}
                      >
                        <FormattedText text={content} cluster={activeCluster} />
                      </p>
                    );
                  })}
                </div>
              </div>
            )}
            
            <span className="text-xs text-gray-600 mt-6 font-mono uppercase tracking-[0.4em] opacity-60">
              {msg.role === 'user' ? 'CONSCIOUSNESS' : 'ARCHITECT'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        
        {footnotes.length > 0 && (
            <div className="mt-20 pt-10 border-t border-gray-800/80">
                <div className="flex items-center gap-3 mb-8 text-sm font-mono text-gray-500 uppercase tracking-[0.4em]">
                    <FileText className="w-5 h-5" /> Sub-Neural Addendum
                </div>
                <ul className="space-y-6">
                    {footnotes.map((note, i) => (
                        <li key={i} className="text-lg text-gray-400 font-serif leading-relaxed pl-6 border-l-2 border-gray-800 transition-colors hover:border-haunt-gold/50">
                            <span className="font-bold text-haunt-gold mr-3">[{note.split('.')[0]}]</span>
                            <FormattedText text={note.split('.').slice(1).join('.')} cluster={activeCluster} />
                        </li>
                    ))}
                </ul>
            </div>
        )}

        {isLoading && (
          <SigilLoader cluster={activeCluster} text="Synchronizing Temporal Anomalies..." />
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};
