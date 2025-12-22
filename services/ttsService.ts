
import { GoogleGenAI, Modality } from "@google/genai";

// Fix: Exported TTSVoice interface for external usage
export interface TTSVoice {
  id: string;
  name: string;
}

export const NARRATION_PROFILES = [
  { id: 'architect', name: 'The Architect', voiceName: 'Zephyr' },
  { id: 'narrator', name: 'The Narrator', voiceName: 'Kore' },
  { id: 'trickster', name: 'The Trickster', voiceName: 'Puck' },
];

function decode(base64: string) {
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
  const int16 = new Int16Array(data.buffer);
  const buffer = ctx.createBuffer(1, int16.length, 24000);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < int16.length; i++) channel[i] = int16[i] / 32768.0;
  return buffer;
}

class TTSService {
  private ctx: AudioContext | null = null;
  private node: GainNode | null = null;
  private enabled = false;
  private profile = NARRATION_PROFILES[0];

  setEnabled(v: boolean) { this.enabled = v; if (v && !this.ctx) this.init(); }
  getEnabled() { return this.enabled; }
  setProfile(id: string) { const p = NARRATION_PROFILES.find(x => x.id === id); if (p) this.profile = p; }
  // Fix: Explicitly typed return value
  getVoices(): TTSVoice[] { return NARRATION_PROFILES.map(p => ({ id: p.id, name: p.name })); }

  private init() {
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    this.node = this.ctx.createGain();
    this.node.connect(this.ctx.destination);
  }

  async speak(text: string) {
    if (!this.enabled || !text) return;
    if (!this.ctx) this.init();
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const res = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: this.profile.voiceName } } }
        }
      });
      const data = res.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (data && this.ctx && this.node) {
        const audio = await decodeAudioData(decode(data), this.ctx);
        const source = this.ctx.createBufferSource();
        source.buffer = audio;
        source.connect(this.node);
        source.start();
      }
    } catch (e) { console.error(e); }
  }
}

export const ttsService = new TTSService();
