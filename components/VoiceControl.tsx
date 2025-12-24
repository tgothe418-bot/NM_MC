
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Radio, X, Activity, Volume2, VolumeX, MessageSquare } from 'lucide-react';
import { LiveClient } from '../services/liveClient';
import { ttsService, TTSVoice, NARRATION_PROFILES } from '../services/ttsService';
import { VOICE_SYSTEM_INSTRUCTION } from '../constants';

interface VoiceControlProps {
  onProcessAction: (action: string) => Promise<string>;
  onInputProgress?: (text: string, isFinal: boolean) => void;
}

const LIVE_VOICES = [
  { 
    id: 'Kore', 
    name: 'The Narrator', 
    desc: 'Warm, Mysterious',
    persona: "You are The Narrator. Your tone is warm, composed, but slightly detached, like a storyteller recounting a dark fable."
  },
  { 
    id: 'Puck', 
    name: 'The Trickster', 
    desc: 'Playful, Manic',
    persona: "You are The Trickster. Your tone is playful, erratic, and deeply unsettling."
  },
  { 
    id: 'Charon', 
    name: 'The Gatekeeper', 
    desc: 'Deep, Grave',
    persona: "You are The Gatekeeper. Your voice is deep, slow, and resonant. You are ancient, tired, and solemn."
  },
  { 
    id: 'Fenrir', 
    name: 'The Beast', 
    desc: 'Intense, Predatory',
    persona: "You are The Beast. Your voice is intense, growling, and impatient."
  },
  { 
    id: 'Zephyr', 
    name: 'The Architect', 
    desc: 'Clinical, Cold',
    persona: "You are The Architect (System Mode). Your tone is clinical, flat, and precise."
  },
];

export const VoiceControl: React.FC<VoiceControlProps> = ({ onProcessAction, onInputProgress }) => {
  // Live Input State
  const [isConnected, setIsConnected] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedLiveVoiceId, setSelectedLiveVoiceId] = useState('Kore');
  const clientRef = useRef<LiveClient | null>(null);

  // TTS Output State
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [availableTtsVoices, setAvailableTtsVoices] = useState<TTSVoice[]>([]);
  const [selectedTtsVoiceId, setSelectedTtsVoiceId] = useState<string>(NARRATION_PROFILES[0].id);

  useEffect(() => {
    // The new service loads instantly (hardcoded profiles), so no polling needed.
    const voices = ttsService.getVoices();
    setAvailableTtsVoices(voices);
    
    // Default to 'The Storyteller' or first available
    if (voices.length > 0) {
        // We actually want to track PROFILE ID now, not voice name
        setSelectedTtsVoiceId(voices[0].id);
        ttsService.setProfile(voices[0].id);
    }
    
    return () => {
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
        clientRef.current = new LiveClient(onProcessAction, onInputProgress);
      }
      
      try {
        const profile = LIVE_VOICES.find(v => v.id === selectedLiveVoiceId) || LIVE_VOICES[0];
        const specificInstruction = `${VOICE_SYSTEM_INSTRUCTION}\n\nCURRENT PERSONA: ${profile.persona}`;

        await clientRef.current.connect(
            { voiceName: selectedLiveVoiceId }, 
            specificInstruction
        );
        setIsConnected(true);
        setIsExpanded(false); 
      } catch (e) {
        console.error("Failed to connect voice:", e);
        alert("Voice connection failed. Check console and permissions.");
      }
    }
  };

  const toggleTts = () => {
      const newState = !ttsEnabled;
      setTtsEnabled(newState);
      ttsService.setEnabled(newState);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = e.target.value;
      setSelectedTtsVoiceId(id);
      ttsService.setProfile(id);
  };

  return (
    <div className="relative z-50 flex flex-col gap-2">
      
      {/* Voice Selection Menu (Flyout) */}
      {isExpanded && !isConnected && (
        <div className="absolute top-0 left-full ml-2 bg-terminal border border-gray-700 p-4 rounded-sm shadow-[0_0_20px_rgba(0,0,0,0.8)] w-80 animate-fadeIn ring-1 ring-gray-800 flex flex-col gap-4">
          
          <div className="flex justify-between items-center border-b border-gray-800 pb-2">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Radio className="w-3 h-3 text-system-green" />
                Audio Configuration
            </span>
            <button onClick={() => setIsExpanded(false)} className="text-gray-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* SECTION 1: LIVE INPUT VOICE (GEMINI) */}
          <div>
              <div className="text-[10px] font-mono text-gray-500 uppercase mb-2">Live Neural Response</div>
              <div className="grid grid-cols-1 gap-1 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                {LIVE_VOICES.map(voice => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedLiveVoiceId(voice.id)}
                    className={`w-full text-left px-3 py-2 text-xs font-mono border transition-all rounded-sm flex items-center justify-between group
                        ${selectedLiveVoiceId === voice.id 
                            ? 'border-system-green bg-green-900/10 text-green-400' 
                            : 'border-transparent text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                        }`}
                  >
                    <div>
                        <div className="font-bold tracking-wide">{voice.name}</div>
                        <div className="text-[9px] opacity-60 italic">{voice.desc}</div>
                    </div>
                    {selectedLiveVoiceId === voice.id && <div className="h-1.5 w-1.5 rounded-full bg-system-green shadow-[0_0_5px_rgba(16,185,129,0.8)]"></div>}
                  </button>
                ))}
              </div>
              <button 
                onClick={toggleConnection}
                className="w-full mt-2 bg-system-green text-black font-bold font-mono text-xs uppercase py-2 rounded-sm hover:bg-green-400 transition-colors flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
              >
                 <Activity className="w-3 h-3" /> Connect Live Link
              </button>
          </div>

          <div className="border-t border-gray-800"></div>

          {/* SECTION 2: TTS OUTPUT (GEMINI) */}
          <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                  <div className="text-[10px] font-mono text-gray-500 uppercase">Prose Narration</div>
                  <button onClick={toggleTts} className={`${ttsEnabled ? 'text-system-green' : 'text-gray-600'}`}>
                      {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
              </div>
              
              <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-gray-500 font-mono">Architectural Voice</label>
                  <select 
                      value={selectedTtsVoiceId}
                      onChange={handleProfileChange}
                      disabled={!ttsEnabled}
                      className="w-full bg-black border border-gray-700 text-gray-300 text-[10px] font-mono p-2 rounded focus:border-system-green outline-none disabled:opacity-50"
                  >
                      {availableTtsVoices.map((v) => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                  </select>
              </div>
          </div>

        </div>
      )}

      {/* Toggle Buttons */}
      <div className="flex flex-col gap-2">
          <button 
            onClick={() => isConnected ? toggleConnection() : setIsExpanded(!isExpanded)}
            className={`bg-black/80 p-2 rounded-sm border backdrop-blur transition-all flex items-center gap-2 group w-full
              ${isConnected 
                  ? 'border-red-500 text-red-500 hover:bg-red-900/20' 
                  : 'border-gray-700 text-gray-200 hover:border-gray-500 hover:text-white'
              }`}
            title={isConnected ? "Disconnect Voice" : "Open Audio Settings"}
          >
            {isConnected ? <Mic className="w-4 h-4 animate-pulse" /> : <MicOff className="w-4 h-4" />}
            <span className="hidden group-hover:block font-mono text-[10px] uppercase tracking-widest whitespace-nowrap">
                {isConnected ? "Disconnect" : "Audio Link"}
            </span>
          </button>

          {!isExpanded && (
             <button 
               onClick={toggleTts}
               className={`bg-black/80 p-2 rounded-sm border backdrop-blur transition-all flex items-center gap-2 group w-full
                 ${ttsEnabled 
                     ? 'border-system-green text-system-green hover:bg-green-900/20' 
                     : 'border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300'
                 }`}
               title={ttsEnabled ? "Mute Narration" : "Enable Narration"}
             >
               {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
               <span className="hidden group-hover:block font-mono text-[10px] uppercase tracking-widest whitespace-nowrap">
                   {ttsEnabled ? "Narrating" : "Muted"}
               </span>
             </button>
          )}
      </div>
    </div>
  );
};
