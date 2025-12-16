
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

export const VoiceControl: React.FC<VoiceControlProps> = ({ onProcessAction, onInputProgress }) => {
  // Live Input State
  const [isConnected, setIsConnected] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedLiveVoiceId, setSelectedLiveVoiceId] = useState('Kore');
  const clientRef = useRef<LiveClient | null>(null);

  // TTS Output State
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [availableTtsVoices, setAvailableTtsVoices] = useState<TTSVoice[]>([]);
  const [selectedTtsVoice, setSelectedTtsVoice] = useState<string>('');
  const [selectedProfileId, setSelectedProfileId] = useState<string>(NARRATION_PROFILES[0].id);

  useEffect(() => {
    // Initialize TTS voices
    const voices = ttsService.getVoices();
    setAvailableTtsVoices(voices);
    if (voices.length > 0) {
        setSelectedTtsVoice(voices[0].name);
    }
    
    // Poll for voice loading (some browsers load async)
    const interval = setInterval(() => {
        const v = ttsService.getVoices();
        if (v.length > 0 && availableTtsVoices.length === 0) {
             setAvailableTtsVoices(v);
             setSelectedTtsVoice(v[0].name);
        }
    }, 1000);

    return () => {
      clearInterval(interval);
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

  const handleTtsVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const name = e.target.value;
      setSelectedTtsVoice(name);
      ttsService.setVoice(name);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = e.target.value;
      setSelectedProfileId(id);
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
              <div className="text-[10px] font-mono text-gray-500 uppercase mb-2">Neural Input Voice (Gemini Live)</div>
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
                 <Activity className="w-3 h-3" /> Connect Live
              </button>
          </div>

          <div className="border-t border-gray-800"></div>

          {/* SECTION 2: TTS OUTPUT (BROWSER) */}
          <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                  <div className="text-[10px] font-mono text-gray-500 uppercase">Text Narration (TTS)</div>
                  <button onClick={toggleTts} className={`${ttsEnabled ? 'text-system-green' : 'text-gray-600'}`}>
                      {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
              </div>
              
              <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-gray-500 font-mono">System Voice</label>
                  <select 
                      value={selectedTtsVoice}
                      onChange={handleTtsVoiceChange}
                      disabled={!ttsEnabled}
                      className="w-full bg-black border border-gray-700 text-gray-300 text-[10px] font-mono p-2 rounded focus:border-system-green outline-none disabled:opacity-50"
                  >
                      {availableTtsVoices.map((v, i) => (
                          <option key={i} value={v.name}>{v.name.slice(0, 30)}</option>
                      ))}
                  </select>
              </div>

              <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-gray-500 font-mono">Narration Mood</label>
                  <select 
                      value={selectedProfileId}
                      onChange={handleProfileChange}
                      disabled={!ttsEnabled}
                      className="w-full bg-black border border-gray-700 text-gray-300 text-[10px] font-mono p-2 rounded focus:border-system-green outline-none disabled:opacity-50"
                  >
                      {NARRATION_PROFILES.map((p) => (
                          <option key={p.id} value={p.id}>{p.name} ({p.description})</option>
                      ))}
                  </select>
              </div>
          </div>

        </div>
      )}

      {/* Toggle Buttons */}
      <div className="flex flex-col gap-2">
          {/* Main Live Toggle */}
          <button 
            onClick={() => isConnected ? toggleConnection() : setIsExpanded(!isExpanded)}
            className={`bg-black/80 p-2 rounded-sm border backdrop-blur transition-all flex items-center gap-2 group w-full
              ${isConnected 
                  ? 'border-red-500 text-red-500 hover:bg-red-900/20' 
                  : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200'
              }`}
            title={isConnected ? "Disconnect Voice" : "Open Audio Settings"}
          >
            {isConnected ? (
               <Mic className="w-5 h-5 animate-pulse" />
            ) : (
               <MicOff className="w-5 h-5" />
            )}
            
            <span className="hidden group-hover:block font-mono text-xs uppercase tracking-widest whitespace-nowrap">
                {isConnected ? "Disconnect" : "Audio Link"}
            </span>
          </button>

          {/* Quick TTS Toggle (Visible when menu closed) */}
          {!isExpanded && (
             <button 
               onClick={toggleTts}
               className={`bg-black/80 p-2 rounded-sm border backdrop-blur transition-all flex items-center gap-2 group w-full
                 ${ttsEnabled 
                     ? 'border-system-green text-system-green hover:bg-green-900/20' 
                     : 'border-gray-700 text-gray-600 hover:border-gray-500 hover:text-gray-400'
                 }`}
               title={ttsEnabled ? "Mute Narration" : "Enable Narration"}
             >
               {ttsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
               <span className="hidden group-hover:block font-mono text-xs uppercase tracking-widest whitespace-nowrap">
                   {ttsEnabled ? "Narrating" : "Muted"}
               </span>
             </button>
          )}
      </div>
    </div>
  );
};
