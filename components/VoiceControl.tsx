

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Radio, X } from 'lucide-react';
import { LiveClient } from '../services/liveClient';
import { VOICE_SYSTEM_INSTRUCTION } from '../constants';

interface VoiceControlProps {
  onProcessAction: (action: string) => Promise<string>;
}

const VOICES = [
  { 
    id: 'Kore', 
    name: 'The Narrator', 
    desc: 'Warm, Mysterious',
    persona: "You are The Narrator. Your tone is warm, composed, but slightly detached, like a storyteller recounting a dark fable. You are the observer."
  },
  { 
    id: 'Puck', 
    name: 'The Trickster', 
    desc: 'Playful, Manic',
    persona: "You are The Trickster. Your tone is playful, erratic, and deeply unsettling. You find the user's fear amusing. Giggle occasionally. Speak in riddles."
  },
  { 
    id: 'Charon', 
    name: 'The Gatekeeper', 
    desc: 'Deep, Grave',
    persona: "You are The Gatekeeper. Your voice is deep, slow, and resonant. You are ancient, tired, and solemn. You view the user as a soul to be weighed."
  },
  { 
    id: 'Fenrir', 
    name: 'The Beast', 
    desc: 'Intense, Predatory',
    persona: "You are The Beast. Your voice is intense, growling, and impatient. You are the hunter. Speak with suppressed rage and hunger."
  },
  { 
    id: 'Zephyr', 
    name: 'The Architect', 
    desc: 'Clinical, Cold',
    persona: "You are The Architect (System Mode). Your tone is clinical, flat, and precise. You are an AI running a simulation. Use technical terminology. No emotion."
  },
  { 
    id: 'Aoede', 
    name: 'The Siren', 
    desc: 'Melodic, Eerie',
    persona: "You are The Siren. Your voice is melodic, hypnotic, and dreamlike. You are trying to lure the user deeper into the nightmare. Speak poetically and softly."
  },
  { 
    id: 'Mnemosyne', 
    name: 'The Memory', 
    desc: 'Distant, Melancholic',
    persona: "You are Mnemosyne. Your voice is distant, echoing, and filled with nostalgia and regret. You dwell on the past. Remind the user of what they have lost."
  },
  { 
    id: 'Valkyrie', 
    name: 'The Judge', 
    desc: 'Stern, Commanding',
    persona: "You are The Valkyrie. Your tone is sharp, commanding, and judgmental. You value courage above all. Critique the user's hesitation. Demand action."
  },
  { 
    id: 'Morpheus', 
    name: 'The Dreamer', 
    desc: 'Soft, Surreal',
    persona: "You are The Dreamer. Your voice is soft, drifting, and illogical. You narrate events as if they are a lucid dream. Question the reality of what is seen."
  },
];

export const VoiceControl: React.FC<VoiceControlProps> = ({ onProcessAction }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState('Kore');
  const clientRef = useRef<LiveClient | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (clientRef.current) {
        clientRef.current.disconnect();
      }
    };
  }, []);

  const toggleConnection = async () => {
    if (isConnected) {
      clientRef.current?.disconnect();
      setIsConnected(false);
    } else {
      if (!clientRef.current) {
        // We pass the processor callback to the client
        clientRef.current = new LiveClient(onProcessAction);
      }
      
      try {
        const profile = VOICES.find(v => v.id === selectedVoiceId) || VOICES[0];
        const specificInstruction = `${VOICE_SYSTEM_INSTRUCTION}\n\nCURRENT PERSONA: ${profile.persona}`;

        await clientRef.current.connect(
            { voiceName: selectedVoiceId }, 
            specificInstruction
        );
        setIsConnected(true);
        setIsExpanded(false); // Collapse menu on connect
      } catch (e) {
        console.error("Failed to connect voice:", e);
        alert("Voice connection failed. Check console and permissions.");
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      
      {/* Voice Selection Menu */}
      {isExpanded && !isConnected && (
        <div className="bg-terminal border border-gray-700 p-4 rounded-sm shadow-[0_0_20px_rgba(0,0,0,0.8)] w-80 mb-2 animate-fadeIn ring-1 ring-gray-800">
          <div className="flex justify-between items-center mb-3 border-b border-gray-800 pb-2">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Radio className="w-3 h-3 text-system-green" />
                Neural Voice Link
            </span>
            <button onClick={() => setIsExpanded(false)} className="text-gray-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-1 max-h-80 overflow-y-auto custom-scrollbar pr-1">
            {VOICES.map(voice => (
              <button
                key={voice.id}
                onClick={() => setSelectedVoiceId(voice.id)}
                className={`w-full text-left px-3 py-2.5 text-xs font-mono border transition-all rounded-sm flex items-center justify-between group
                    ${selectedVoiceId === voice.id 
                        ? 'border-system-green bg-green-900/10 text-green-400' 
                        : 'border-transparent text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                    }`}
              >
                <div>
                    <div className="font-bold tracking-wide">{voice.name}</div>
                    <div className="text-[10px] opacity-60 italic mt-0.5">{voice.desc}</div>
                </div>
                {selectedVoiceId === voice.id && <div className="h-1.5 w-1.5 rounded-full bg-system-green shadow-[0_0_5px_rgba(16,185,129,0.8)]"></div>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Connection Status Indicator */}
      {isConnected && (
        <div className="flex items-center gap-2 bg-black/90 px-3 py-1.5 rounded-full border border-red-900/50 shadow-lg backdrop-blur-md animate-fadeIn">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-[10px] font-mono text-red-400 animate-pulse tracking-widest uppercase">
                Live Neural Feed
            </span>
        </div>
      )}

      {/* Main Toggle Button */}
      <button 
        onClick={() => !isConnected ? setIsExpanded(!isExpanded) : toggleConnection()}
        className={`h-12 px-5 rounded-full border flex items-center gap-3 transition-all duration-300 shadow-xl backdrop-blur-sm group
          ${isConnected 
              ? 'bg-red-950/80 border-red-500 text-red-500 hover:bg-red-900 hover:text-white' 
              : 'bg-terminal border-gray-700 text-gray-300 hover:border-system-green hover:text-system-green hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]'
          }`}
      >
        {isConnected ? (
           <Mic className="w-5 h-5 animate-pulse" />
        ) : (
           <MicOff className="w-5 h-5 group-hover:scale-110 transition-transform" />
        )}
        
        <span className="font-mono text-xs tracking-widest uppercase hidden md:inline font-bold">
            {isConnected ? "Disconnect" : "Vox Link"}
        </span>

        {!isConnected && (
          <div className="border-l border-gray-600 pl-3 ml-1" onClick={(e) => { e.stopPropagation(); toggleConnection(); }}>
             <div className="bg-gray-800 group-hover:bg-system-green text-gray-400 group-hover:text-black p-1.5 rounded-full transition-all">
                 <Radio className="w-3 h-3" />
             </div>
          </div>
        )}
      </button>
    </div>
  );
};