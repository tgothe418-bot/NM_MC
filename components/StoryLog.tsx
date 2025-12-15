import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { Image, FileText } from 'lucide-react';
import { SigilLoader } from './SigilLoader';

interface StoryLogProps {
  history: ChatMessage[];
  isLoading: boolean;
  activeCluster?: string;
}

// Zalgo / Glitch Text Generator
const generateZalgo = (text: string, intensity: number = 1): string => {
  const chars = text.split('');
  // Simplified glitch chars
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

// Map clusters to Tailwind colors defined in index.html
const getHighlightColor = (cluster?: string) => {
  if (!cluster || cluster === "None") return "text-green-200 drop-shadow-[0_0_8px_rgba(134,239,172,0.3)]";
  
  if (cluster.includes("Flesh")) return "text-fresh-blood drop-shadow-[0_0_8px_rgba(220,20,60,0.4)]";
  if (cluster.includes("System")) return "text-system-cyan drop-shadow-[0_0_8px_rgba(0,255,255,0.3)]";
  if (cluster.includes("Haunting")) return "text-haunt-gold drop-shadow-[0_0_8px_rgba(180,83,9,0.3)]";
  if (cluster.includes("Self")) return "text-psych-lavender drop-shadow-[0_0_8px_rgba(75,0,130,0.4)]";
  if (cluster.includes("Blasphemy")) return "text-blasphemy-sulfur drop-shadow-[0_0_8px_rgba(255,215,0,0.3)]";
  if (cluster.includes("Survival")) return "text-survival-ice drop-shadow-[0_0_8px_rgba(165,242,243,0.4)]";
  
  return "text-green-200";
};

// Map clusters to italic/accent colors
const getAccentColor = (cluster?: string) => {
  if (!cluster || cluster === "None") return "text-gray-400";

  if (cluster.includes("Flesh")) return "text-red-300";
  if (cluster.includes("System")) return "text-green-400";
  if (cluster.includes("Haunting")) return "text-haunt-dust";
  if (cluster.includes("Self")) return "text-indigo-300";
  if (cluster.includes("Blasphemy")) return "text-purple-300";
  if (cluster.includes("Survival")) return "text-cyan-200";

  return "text-gray-400";
};

// House of Leaves Stylizer + Specific Color Cues
const applyTypographicAnomalies = (text: string): React.ReactNode[] => {
  // Regex to match specific color words and HoL keywords
  // Keywords: house (blue), minotaur (red/strike)
  // Colors: Russet, Crimson Lake, Cerulean Sky, etc.
  const regex = /(\b(?:house|home|dwelling|hallway|hallways|corridor|room|rooms|walls|structure|place)\b|\b(?:minotaur|beast|monster|threat|horror)\b|\b(?:russet|crimson lake|crimson|cerulean sky|cerulean|cobalt|vermilion|ochre|umber|sienna|viridian)\b)/gi;
  
  const parts = text.split(regex);
  
  return parts.map((part, index) => {
    const lower = part.toLowerCase();
    
    // 1. The House (Blue)
    if (['house', 'home', 'dwelling', 'hallway', 'hallways', 'corridor', 'room', 'rooms', 'walls', 'structure', 'place'].includes(lower)) {
       return <span key={index} className="text-[#3b82f6] font-bold">{part}</span>;
    }
    
    // 2. The Minotaur (Red / Struck)
    if (['minotaur', 'beast', 'monster', 'threat', 'horror'].includes(lower)) {
       return (
         <span key={index} className="text-[#dc2626] font-bold relative inline-block">
            <span className="relative z-10">{part}</span>
            {/* Optional Strikethrough effect for 'Minotaur' specific style */}
            {lower === 'minotaur' && <span className="absolute left-0 top-1/2 w-full h-[1px] bg-red-500 transform -translate-y-1/2"></span>}
         </span>
       );
    }

    // 3. Specific Color Cues (As described in screenshot)
    if (lower.includes('russet')) return <span key={index} style={{ color: '#80461B' }} className="font-bold">{part}</span>;
    if (lower.includes('crimson')) return <span key={index} style={{ color: '#DC143C' }} className="font-bold">{part}</span>;
    if (lower.includes('cerulean')) return <span key={index} style={{ color: '#007BA7' }} className="font-bold">{part}</span>;
    if (lower.includes('cobalt')) return <span key={index} style={{ color: '#0047AB' }} className="font-bold">{part}</span>;
    if (lower.includes('vermilion')) return <span key={index} style={{ color: '#E34234' }} className="font-bold">{part}</span>;
    if (lower.includes('ochre')) return <span key={index} style={{ color: '#CC7722' }} className="font-bold">{part}</span>;
    if (lower.includes('umber')) return <span key={index} style={{ color: '#635147' }} className="font-bold">{part}</span>;
    if (lower.includes('sienna')) return <span key={index} style={{ color: '#882D17' }} className="font-bold">{part}</span>;
    if (lower.includes('viridian')) return <span key={index} style={{ color: '#40826D' }} className="font-bold">{part}</span>;

    return part;
  });
};

// Helper component to parse and render bold/italic/footnote markdown
const FormattedText: React.FC<{ text: string, cluster?: string }> = ({ text, cluster }) => {
  // 1. Check for Glitch Markers (e.g. from System cluster)
  const isSystem = cluster?.includes("System");
  
  // Split by footnotes: [^1]
  const parts = text.split(/(\[\^\d+\])/g);
  const highlightClass = getHighlightColor(cluster);
  const accentClass = getAccentColor(cluster);

  return (
    <span>
      {parts.map((part, k) => {
        // Handle Footnote Reference
        if (part.match(/^\[\^\d+\]$/)) {
            return (
                <sup key={k} className="text-xs text-haunt-gold cursor-help ml-0.5 select-none hover:text-white transition-colors">
                    {part}
                </sup>
            );
        }

        // Apply Glitch to System Text randomly
        let displayPart = part;
        if (isSystem && Math.random() > 0.95) {
             displayPart = generateZalgo(part, 3);
        }

        // Split by bold: **text**
        const boldParts = displayPart.split(/(\*\*[^*]+\*\*)/g);
        
        return (
          <span key={k}>
            {boldParts.map((subPart, i) => {
              // Handle Bold
              if (subPart.startsWith('**') && subPart.endsWith('**')) {
                return (
                  <strong key={i} className={`font-bold tracking-wide transition-colors duration-500 ${highlightClass}`}>
                    {subPart.slice(2, -2)}
                  </strong>
                );
              }
              
              // Handle Italics within non-bold parts
              const italicParts = subPart.split(/(\*[^*]+\*)/g);
              return (
                <span key={i}>
                  {italicParts.map((innerPart, j) => {
                    if (innerPart.startsWith('*') && innerPart.endsWith('*')) {
                      return (
                        <em key={j} className={`italic font-serif tracking-wide ${accentClass}`}>
                          {innerPart.slice(1, -1)}
                        </em>
                      );
                    }
                    // Apply Typographic Anomalies (House of Leaves style) to normal text
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

  // Extract footnotes from the latest model message
  const latestModelMsg = [...history].reverse().find(m => m.role === 'model');
  const footnotes: string[] = [];
  if (latestModelMsg) {
      // Regex to find footnote definitions at end of text e.g. [^1]: Text
      const regex = /\[\^(\d+)\]:\s*(.*)/g;
      let match;
      while ((match = regex.exec(latestModelMsg.text)) !== null) {
          footnotes.push(`${match[1]}. ${match[2]}`);
      }
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-12 custom-scrollbar bg-transparent relative z-10">
      <div className="max-w-3xl mx-auto space-y-8 pb-32">
        
        {/* Intro Spacer */}
        <div className="h-4"></div>

        {history.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fadeIn`}
          >
            {msg.role === 'user' ? (
              <div className="bg-gray-900 text-gray-300 px-6 py-3 rounded-2xl rounded-tr-none max-w-[80%] border border-gray-700 font-serif text-lg shadow-lg">
                {msg.text}
              </div>
            ) : (
              <div className="max-w-full w-full">
                {/* Generated Image rendering */}
                {msg.imageUrl && (
                  <div className="mb-6 rounded overflow-hidden border border-gray-800 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative group">
                    <img 
                      src={msg.imageUrl} 
                      alt="Neural hallucination" 
                      className="w-full h-auto opacity-80 group-hover:opacity-100 transition-opacity duration-1000 grayscale hover:grayscale-0"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 text-[10px] text-gray-400 font-mono flex items-center gap-1 uppercase tracking-widest backdrop-blur-sm border border-gray-700">
                      <Image className="w-3 h-3" /> Neural Visualization
                    </div>
                  </div>
                )}
                
                <div className="prose prose-invert prose-p:font-serif prose-p:text-gray-300 prose-p:leading-relaxed prose-headings:font-sans prose-headings:tracking-widest prose-headings:text-gray-500 prose-strong:text-green-200 max-w-full w-full">
                  {msg.text.split('\n').map((line, i) => {
                    if (!line.trim()) return <div key={i} className="h-2" />;
                    
                    // Skip footnote definitions in main text body (they are rendered separately)
                    if (line.match(/^\[\^\d+\]:/)) return null;

                    const isBlockquote = line.trim().startsWith('>');
                    const content = isBlockquote ? line.trim().slice(1).trim() : line;
                    
                    return (
                      <p 
                        key={i} 
                        className={`mb-3 text-lg ${
                          isBlockquote 
                            ? 'pl-6 border-l-4 border-haunt-gold/70 italic text-gray-300 font-serif text-xl tracking-wide my-8 py-4 bg-black/40 rounded-r shadow-[inset_10px_0_20px_-10px_rgba(0,0,0,0.8)]' 
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
            
            {/* Timestamp / Meta */}
            <span className="text-[10px] text-gray-700 mt-2 font-mono uppercase">
              {msg.role === 'user' ? 'YOU' : 'ARCHITECT'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        
        {/* ERGODIC FOOTNOTE RENDERER */}
        {footnotes.length > 0 && (
            <div className="mt-12 pt-6 border-t border-gray-800/50">
                <div className="flex items-center gap-2 mb-4 text-xs font-mono text-gray-500 uppercase tracking-widest">
                    <FileText className="w-3 h-3" /> Footnotes / Addendum
                </div>
                <ul className="space-y-3">
                    {footnotes.map((note, i) => (
                        <li key={i} className="text-xs text-gray-400 font-serif leading-relaxed pl-4 border-l border-gray-800">
                            <span className="font-bold text-haunt-gold mr-2">[{note.split('.')[0]}]</span>
                            <FormattedText text={note.split('.').slice(1).join('.')} cluster={activeCluster} />
                        </li>
                    ))}
                </ul>
            </div>
        )}

        {isLoading && (
          <SigilLoader cluster={activeCluster} text="Simulating Consequences..." />
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};