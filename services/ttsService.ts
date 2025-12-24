// services/ttsService.ts

export interface TTSVoice {
  name: string;
  id: string; // The Google Voice ID (e.g., 'en-US-Journey-F')
  gender: string;
  language: string;
}

export interface NarrationProfile {
  id: string;
  name: string;
  description: string;
  googleVoiceId: string; // The specific Journey voice ID
  pitch: number; // Google allows +/- 20.0
  speakingRate: number; // 0.25 to 4.0
}

// MAPPING: These map your horror archetypes to specific "Journey" voices.
// Journey voices are usually: en-US-Journey-D (Male, Deep), F (Female, Warm), O (Female, Soothing), etc.
export const NARRATION_PROFILES: NarrationProfile[] = [
  { 
    id: 'storyteller', 
    name: 'The Storyteller', 
    description: 'Warm, natural, and balanced.', 
    googleVoiceId: 'en-US-Journey-F', // Warm female
    pitch: 0, 
    speakingRate: 1.0 
  },
  { 
    id: 'architect', 
    name: 'The Architect', 
    description: 'Deep, authoritative, and precise.', 
    googleVoiceId: 'en-US-Journey-D', // Deep male
    pitch: -2.0, 
    speakingRate: 0.9 
  },
  { 
    id: 'whisper', 
    name: 'The Whisper', 
    description: 'Soft, eerie, and higher pitched.', 
    googleVoiceId: 'en-US-Journey-O', // Soothing/Eerie if slowed
    pitch: 1.5, 
    speakingRate: 0.85 
  },
  { 
    id: 'beast', 
    name: 'The Beast', 
    description: 'Slow, guttural, and menacing.', 
    googleVoiceId: 'en-GB-Journey-D', // British Deep (often sounds more formal/sinister)
    pitch: -8.0, 
    speakingRate: 0.75 
  },
  { 
    id: 'glitch', 
    name: 'The Glitch', 
    description: 'Rapid, anxious, and uneven.', 
    googleVoiceId: 'en-US-Journey-F', 
    pitch: 4.0, 
    speakingRate: 1.3 
  },
];

class TTSService {
  private apiKey: string = "";
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = false;
  private currentProfile: NarrationProfile = NARRATION_PROFILES[0];
  private currentSource: AudioBufferSourceNode | null = null;

  constructor() {
    // Initialize API Key from env if available (Vite/Next pattern)
    // NOTE: In production, do not expose keys on the client. For this prototype, it's acceptable.
    this.apiKey = process.env.API_KEY || "";
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  setApiKey(key: string) {
    this.apiKey = key;
  }

  setProfile(profileId: string) {
    const profile = NARRATION_PROFILES.find(p => p.id === profileId);
    if (profile) {
      this.currentProfile = profile;
    }
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  getEnabled(): boolean {
    return this.isEnabled;
  }

  // Helper for the UI component
  getVoices(): TTSVoice[] {
    return NARRATION_PROFILES.map(p => ({
      name: p.name,
      id: p.id,
      gender: 'AI',
      language: 'en-US'
    }));
  }

  stop() {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch (e) {
        // Ignore errors if already stopped
      }
      this.currentSource = null;
    }
  }

  async speak(text: string) {
    if (!this.isEnabled || !this.apiKey) return;

    this.stop(); // Pre-empt any currently playing audio

    // Clean text: Remove markdown, footnotes, and code blocks
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/\[\^.*?\]/g, '')
      .replace(/```.*?```/gs, '')
      .trim();

    if (!cleanText) return;

    try {
      // We use v1beta1 to access Journey voices
      const url = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${this.apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text: cleanText },
          voice: { 
            languageCode: 'en-US', 
            name: this.currentProfile.googleVoiceId 
          },
          audioConfig: { 
            audioEncoding: 'MP3',
            pitch: this.currentProfile.pitch,
            speakingRate: this.currentProfile.speakingRate,
            // Volume gain can simulate distance/intimacy
            volumeGainDb: 0.0 
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("TTS API Error:", errorData);
        return;
      }

      const data = await response.json();
      if (data.audioContent) {
        this.playAudio(data.audioContent);
      }

    } catch (error) {
      console.error("TTS Network Error:", error);
    }
  }

  private async playAudio(base64Audio: string) {
    if (!this.audioContext) return;

    // Decode Base64 to ArrayBuffer
    const binaryString = window.atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Decode Audio and Play
    try {
      const audioBuffer = await this.audioContext.decodeAudioData(bytes.buffer);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      source.start(0);
      this.currentSource = source;
    } catch (e) {
      console.error("Audio Decode Error:", e);
    }
  }
}

export const ttsService = new TTSService();