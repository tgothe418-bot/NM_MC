
export interface TTSVoice {
  name: string;
  lang: string;
  isDefault: boolean;
  localService: boolean;
  voiceURI: string;
}

export interface NarrationProfile {
  id: string;
  name: string;
  description: string;
  rate: number;
  pitch: number;
}

export const NARRATION_PROFILES: NarrationProfile[] = [
  { id: 'storyteller', name: 'The Storyteller', description: 'Warm, natural, and balanced.', rate: 1.0, pitch: 1.0 },
  { id: 'architect', name: 'The Architect', description: 'Deep, authoritative, and precise.', rate: 0.95, pitch: 0.9 },
  { id: 'whisper', name: 'The Whisper', description: 'Soft, eerie, and higher pitched.', rate: 0.9, pitch: 1.15 },
  { id: 'beast', name: 'The Beast', description: 'Slow, guttural, and menacing.', rate: 0.8, pitch: 0.6 },
  { id: 'glitch', name: 'The Glitch', description: 'Rapid, anxious, and uneven.', rate: 1.25, pitch: 1.1 },
  { id: 'oracle', name: 'The Oracle', description: 'Very slow, deliberate, and dreamlike.', rate: 0.7, pitch: 1.0 },
];

class TTSService {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private isEnabled: boolean = false;
  private currentProfile: NarrationProfile = NARRATION_PROFILES[0]; // Default: Storyteller

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
    
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  private loadVoices() {
    this.voices = this.synth.getVoices();
    // Try to set a default "spooky" or serious voice if available
    if (!this.selectedVoice && this.voices.length > 0) {
      // Prefer Google US English or similar high-quality voices
      const preferred = this.voices.find(v => 
        (v.name.includes("Google US English") || v.name.includes("Samantha")) && v.lang.startsWith("en")
      );
      this.selectedVoice = preferred || this.voices[0];
    }
  }

  getVoices(): TTSVoice[] {
    return this.voices
      .filter(v => v.lang.startsWith('en')) // Filter for English for now to reduce noise
      .map(v => ({
        name: v.name,
        lang: v.lang,
        isDefault: v.default,
        localService: v.localService,
        voiceURI: v.voiceURI
      }));
  }

  setVoice(voiceName: string) {
    const voice = this.voices.find(v => v.name === voiceName);
    if (voice) {
      this.selectedVoice = voice;
    }
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

  stop() {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
  }

  speak(text: string) {
    if (!this.isEnabled) return;
    
    // Cancel any existing speech to avoid overlap
    this.stop();

    // Clean text of markdown/artifacts for better reading
    const cleanText = text
      .replace(/\*\*/g, '')      // Remove bold
      .replace(/\*/g, '')        // Remove italics
      .replace(/\[\^.*?\]/g, '') // Remove footnotes like [^1]
      .replace(/```.*?```/gs, 'System Output.') // Skip code blocks
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    // Apply active profile settings
    utterance.rate = this.currentProfile.rate;
    utterance.pitch = this.currentProfile.pitch;
    
    this.synth.speak(utterance);
  }
}

export const ttsService = new TTSService();
