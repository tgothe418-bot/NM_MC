

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Radio, X } from 'lucide-react';
import { LiveClient } from '../services/liveClient';
import { VOICE_SYSTEM_INSTRUCTION } from '../constants';

interface VoiceControlProps {
  onProcessAction: (action: string) => Promise<string>;
}

const VOICES = [
  { id: 'Kore', name: 'Kore', desc: 'Warm, Mysterious (Default)' },
  { id: 'Puck', name: 'Puck', desc: 'Playful, Unsettling' },
  { id: 'Charon', name: 'Charon', desc: 'Deep, Grave' },
  { id: 'Fenrir', name: 'Fenrir', desc: 'Growling, Intense' },
  { id: 'Zephyr', name: 'Zephyr', desc: 'Neutral, Calm' },
];

export const VoiceControl: React.FC<VoiceControlProps> = ({ onProcessAction }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('Kore');
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
        await clientRef.current.connect(
            { voiceName: selectedVoice }, 
            VOICE_SYSTEM_INSTRUCTION
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
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 transition-all duration-300 ${isExpanded ? 'translate-y-0' : 'translate-y-0'}`}>
      
      {/* Voice Selection Menu */}
      {isExpanded && !isConnected && (
        <div className="bg-terminal border border-gray-700 p-4 rounded-sm shadow-2xl w-64 mb-2 animate-fadeIn">
          <div className="flex justify-between items-center mb-3 border-b border-gray-800 pb-2">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Vox Channel</span>
            <button onClick={() => setIsExpanded(false)} className="text-gray-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1">
            {VOICES.map(voice => (
              <button
                key={voice.id}
                onClick={() => setSelectedVoice(voice.id)}
                className={`w-full text-left px-3 py-2 text-xs font-mono border ${selectedVoice === voice.id ? 'border-system-green bg-green-900/20 text-green-400' : 'border-transparent text-gray-400 hover:bg-gray-800'}`}
              >
                <div className="font-bold">{voice.name}</div>
                <div className="text-[10px] opacity-70 italic">{voice.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Control Button */}
      <div className="flex items-center gap-2">
        {isConnected && (
            <div className="flex items-center gap-2 bg-black/80 px-3 py-1 rounded border border-red-900/50">
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-xs font-mono text-red-400 animate-pulse tracking-widest">LIVE FEED</span>
            </div>
        )}

        <button 
          onClick={() => !isConnected ? setIsExpanded(!isExpanded) : null}
          className={`h-12 flex items-center gap-3 px-4 rounded-full border transition-all duration-300 shadow-lg backdrop-blur-sm
            ${isConnected 
                ? 'bg-red-900/20 border-red-500 text-red-500 hover:bg-red-900/40' 
                : 'bg-terminal border-gray-700 text-gray-300 hover:border-gray-500'
            }`}
        >
          {isConnected ? (
             <Mic className="w-5 h-5 animate-pulse" />
          ) : (
             <MicOff className="w-5 h-5" />
          )}
          
          <span className="font-mono text-xs tracking-widest uppercase hidden md:inline">
              {isConnected ? "TRANSMITTING" : "VOX LINK"}
          </span>

          {!isConnected && (
            <div className="border-l border-gray-700 pl-2 ml-1" onClick={(e) => { e.stopPropagation(); toggleConnection(); }}>
               <div className="bg-system-green/20 hover:bg-system-green text-system-green hover:text-black p-1 rounded transition-colors">
                   <Radio className="w-4 h-4" />
               </div>
            </div>
          )}
          
          {isConnected && (
             <div className="border-l border-red-800 pl-2 ml-1 hover:text-white cursor-pointer" onClick={toggleConnection}>
                <X className="w-4 h-4" />
             </div>
          )}
        </button>
      </div>
    </div>
  );
};