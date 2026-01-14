
import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { Image, FileText, Terminal, Feather } from 'lucide-react';
import { SigilLoader } from './SigilLoader';

interface StoryLogProps {
  history: ChatMessage[];
  isLoading: boolean;
  activeCluster?: string;
  showLogic?: boolean;
  logicStream?: string;
  narrativeStream?: string;
  streamPhase?: 'logic' | 'narrative';
  className?: string;
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
      for (let i = 0; i < num; i++) result += combining[Math.floor(Math.random() * combining.length)];
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

const getColorClass = (color: string) => {
  const c = color.toLowerCase().trim();
  if (c === 'blue' || c === '#0000ff' || c === '#00f') return "text-blue-400 font-bold drop-shadow-[0_0_8px_rgba(96,165,250,0.5)] animate-pulse font-mono tracking-wider";
  if (c === 'red' || c === '#ff0000' || c === '#f00') return "text-red-500 font-bold drop-shadow-[0_0_8px_rgba(220,38,38,0.5)] animate-pulse font-mono tracking-wider";
  return "text-gray-200 font-bold";
};

// Processes Keywords and ANSI codes only (Spans are handled at the parent level)
const applyTypographicAnomalies = (text: string): React.ReactNode[] => {
  // Capture groups: 1=ANSICyan, 2=ANSIRed, 3=Keywords
  const regex = /(\x1b\[34m[\s\S]*?\x1b\[0m)|(\x1b\[31m[\s\S]*?\x1b\[0m)|(\b(?:house|home|dwelling|hallway|hallways|corridor|room|rooms|walls|structure|place)\b|\b(?:minotaur|beast|monster|threat|horror)\b|\b(?:russet|crimson lake|crimson|cerulean sky|cerulean|cobalt|vermilion|ochre|umber|sienna|viridian)\b)/gi;
  
  const parts = text.split(regex).filter(p => p);
  
  return parts.map((part, index) => {
    // ANSI Blue - System/Cold/Structure
    if (part.startsWith('\x1b[34m')) {
        const content = part.replace(/\x1b\[34m|\x1b\[0m/g, '');
        return <span key={index} className="text-blue-400 font-bold drop-shadow-[0_0_8px_rgba(96,165,250,0.5)] animate-pulse">{content}</span>;
    }
    // ANSI Red - Flesh/Danger/Violence
    if (part.startsWith('\x1b[31m')) {
        const content = part.replace(/\x1b\[31m|\x1b\[0m/g, '');
        return <span key={index} className="text-red-500 font-bold drop-shadow-[0_0_8px_rgba(220,38,38,0.5)] animate-pulse">{content}</span>;
    }

    const lower = part.toLowerCase();
    if (['house', 'home', 'dwelling', 'hallway', 'hallways', 'corridor', 'room', 'rooms', 'walls', 'structure', 'place'].includes(lower)) return <span key={index} className="text-[#4dabff] font-bold drop-shadow-[0_0_5px_rgba(77,171,255,0.3)]">{part}</span>;
    if (['minotaur', 'beast', 'monster', 'threat', 'horror'].includes(lower)) return <span key={index} className="text-[#ff3b3b] font-bold relative inline-block"><span className="relative z-10">{part}</span>{lower === 'minotaur' && <span className="absolute left-0 top-1/2 w-full h-[2px] bg-red-600/50 transform -translate-y-1/2"></span>}</span>;
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

// Handles Markdown, Footnotes, Zalgo, and Keyword Highlighting
const FormattedTextContent: React.FC<{ text: string, cluster?: string }> = ({ text, cluster }) => {
  const isSystem = cluster?.includes("System");
  const parts = text.split(/(\[\^\d+\])/g);
  const highlightClass = getHighlightColor(cluster);
  const accentClass = getAccentColor(cluster);

  return (
    <>
      {parts.map((part, k) => {
        if (part.match(/^\[\^\d+\]$/)) return <sup key={k} className="text-sm text-haunt-gold cursor-help ml-1 font-bold select-none hover:text-white transition-colors">{part}</sup>;
        let displayPart = part;
        if (isSystem && Math.random() > 0.95) displayPart = generateZalgo(part, 4);
        
        const boldParts = displayPart.split(/(\*\*[^*]+\*\*)/g);
        return (
          <span key={k}>
            {boldParts.map((subPart, i) => {
              if (subPart.startsWith('**') && subPart.endsWith('**')) return <strong key={i} className={`font-bold tracking-wider transition-all duration-700 ${highlightClass}`}>{subPart.slice(2, -2)}</strong>;
              
              const italicParts = subPart.split(/(\*[^*]+\*)/g);
              return (
                <span key={i}>
                  {italicParts.map((innerPart, j) => {
                    if (innerPart.startsWith('*') && innerPart.endsWith('*')) return <em key={j} className={`italic font-serif tracking-widest ${accentClass}`}>{innerPart.slice(1, -1)}</em>;
                    return <span key={j}>{applyTypographicAnomalies(innerPart)}</span>;
                  })}
                </span>
              );
            })}
          </span>
        );
      })}
    </>
  );
};

// Top-level formatter: Priorities SPANS first, then delegates content to FormattedTextContent
const FormattedText: React.FC<{ text: string, cluster?: string }> = ({ text, cluster }) => {
  const cleanHtmlString = (str: string) => str.replace(/<br\s*\/?>/gi, '\n').replace(/<b>(.*?)<\/b>/gi, '**$1**').replace(/<i>(.*?)<\/i>/gi, '*$1*').replace(/<strong>(.*?)<\/strong>/gi, '**$1**').replace(/<em>(.*?)<\/em>/gi, '*$1*');
  const processedText = cleanHtmlString(text);
  
  // Robust Regex to catch HTML span tags with attributes, tolerating whitespace and different quote types
  const spanRegex = /(<span\s+[^>]*>[\s\S]*?<\/span>)/gi;
  const parts = processedText.split(spanRegex);

  return (
    <span>
      {parts.map((part, index) => {
        if (part.match(/^<span/i)) {
           // Parse the span content
           const contentMatch = part.match(/>([\s\S]*?)<\/span>/i);
           const content = contentMatch ? contentMatch[1] : "";
           
           // Determine color based on class or style
           let color = "";
           
           // Check for class (e.g. class="blue")
           const classMatch = part.match(/class=['"]([^'"]*)['"]/i);
           if (classMatch) {
             const cls = classMatch[1].toLowerCase();
             if (cls.includes('blue')) color = 'blue';
             else if (cls.includes('red')) color = 'red';
           }
           
           // Fallback: Check for inline style color if class didn't catch it
           if (!color) {
               const styleMatch = part.match(/color:\s*([a-z]+|#[0-9a-f]{3,6})/i);
               if (styleMatch) color = styleMatch[1];
           }
           
           return (
             <span key={index} className={getColorClass(color)}>
               <FormattedTextContent text={content} cluster={cluster} />
             </span>
           );
        }
        // Normal text processing for non-span parts
        return <FormattedTextContent key={index} text={part} cluster={cluster} />;
      })}
    </span>
  );
};

export const StoryLog: React.FC<StoryLogProps> = ({ history, isLoading, activeCluster, showLogic, logicStream, narrativeStream, streamPhase, className = "pb-64" }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const logicRef = useRef<HTMLDivElement>(null);
  const narrativeRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [history, isLoading]);
  
  // Auto-scroll logic stream
  useEffect(() => {
      if (showLogic && logicRef.current) logicRef.current.scrollTop = logicRef.current.scrollHeight;
      if (showLogic && narrativeRef.current) narrativeRef.current.scrollTop = narrativeRef.current.scrollHeight;
  }, [logicStream, narrativeStream, showLogic]);

  const latestModelMsg = [...history].reverse().find(m => m.role === 'model');
  const footnotes: string[] = [];
  if (latestModelMsg) {
      const regex = /\[\^(\d+)\]:\s*(.*)/g;
      let match;
      while ((match = regex.exec(latestModelMsg.text)) !== null) footnotes.push(`${match[1]}. ${match[2]}`);
  }

  // Derived loading state text
  const loadingText = streamPhase === 'logic' ? 'Calculating Consequences...' : 'Rendering Narrative...';

  return (
    <div className={`flex-1 overflow-y-auto p-10 lg:p-20 custom-scrollbar bg-transparent relative z-10 ${className}`}>
      <div className="max-w-4xl mx-auto space-y-16 min-h-full">
        {/* If history is empty and loading, show a centered initialization screen */}
        {history.length === 0 && isLoading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <SigilLoader cluster={activeCluster} text={loadingText} />
            </div>
        )}

        <div className="h-10"></div>
        {history.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fadeIn`}>
            {msg.role === 'user' ? (
              <div className="bg-gray-900/80 text-gray-100 px-10 py-6 rounded-3xl rounded-tr-none max-w-[85%] border border-gray-700 font-serif text-2xl shadow-2xl backdrop-blur-md">
                {msg.text}
              </div>
            ) : (
              <div className="max-w-full w-full space-y-8">
                {/* Establishing Shot / Image Render */}
                {msg.imageUrl && (
                  <div className="mb-12 rounded-sm overflow-hidden border-2 border-gray-800 shadow-[0_0_100px_rgba(255,255,255,0.05)] relative group max-w-4xl w-full">
                    <img src={msg.imageUrl} alt="Neural hallucination" className="w-full h-auto opacity-90 group-hover:opacity-100 transition-all duration-1500 grayscale hover:grayscale-0 scale-105 hover:scale-100" />
                    <div className="absolute bottom-6 right-6 bg-black/80 px-5 py-3 text-[10px] text-gray-300 font-mono flex items-center gap-3 uppercase tracking-[0.3em] backdrop-blur-md border border-gray-700 rounded-sm">
                      <Image className="w-4 h-4 text-white" /> Neural Projection
                    </div>
                    {/* Corner accents to match schematic vibe */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/20"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/20"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/20"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/20"></div>
                  </div>
                )}
                <div className="prose prose-invert prose-p:font-serif prose-p:text-gray-200 prose-p:leading-[1.7] prose-headings:font-sans prose-headings:tracking-[0.3em] prose-headings:text-gray-400 prose-strong:text-green-300 max-w-none w-full">
                  {msg.text.split('\n').map((line, i) => {
                    if (!line.trim()) return <div key={i} className="h-6" />;
                    if (line.match(/^\[\^\d+\]:/)) return null;
                    const isBlockquote = line.trim().startsWith('>');
                    const content = isBlockquote ? line.trim().slice(1).trim() : line;
                    return <p key={i} className={`mb-8 text-2xl tracking-wide ${isBlockquote ? 'pl-10 border-l-8 border-haunt-gold/80 italic text-gray-200 font-serif text-3xl tracking-[0.05em] my-16 py-8 bg-black/60 rounded-r-xl shadow-2xl' : ''}`}><FormattedText text={content} cluster={activeCluster} /></p>;
                  })}
                </div>
              </div>
            )}
            <span className="text-xs text-gray-600 mt-6 font-mono uppercase tracking-[0.4em] opacity-60">
                {msg.role === 'user' ? 'INPUT VECTOR' : `OUTPUT STREAM [T-${Date.now().toString().slice(-4)}]`}
            </span>
          </div>
        ))}
        
        {/* Logic Stream Overlay (Hacker Mode) */}
        {showLogic && (
            <div className="fixed top-20 right-10 w-96 bg-black/90 border border-green-900/50 p-4 font-mono text-[10px] text-green-500 h-[60vh] overflow-hidden flex flex-col z-50 shadow-[0_0_30px_rgba(0,255,0,0.1)] rounded-sm pointer-events-none">
                <div className="border-b border-green-900/50 pb-2 mb-2 flex justify-between items-center">
                    <span className="animate-pulse">/// LOGIC_KERNEL_ACCESS ///</span>
                    <Terminal className="w-3 h-3" />
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4" ref={logicRef}>
                    <div className="whitespace-pre-wrap opacity-80">{logicStream}</div>
                    {streamPhase === 'narrative' && <div className="text-white/50 border-t border-green-900/30 pt-4 mt-4" ref={narrativeRef}>{narrativeStream}</div>}
                </div>
            </div>
        )}

        <div ref={bottomRef} className="h-10" />
      </div>
    </div>
  );
};
