
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from "@google/genai";
import { float32To16BitPCM, arrayBufferToBase64, base64ToFloat32Array } from "./audioUtils";

export interface VoiceConfig {
  voiceName: string;
}

// Function Declaration for the Game Action Tool
const SUBMIT_ACTION_TOOL: FunctionDeclaration = {
  name: "submit_action",
  description: "Submit the user's spoken action or statement to the Nightmare Machine game engine.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: {
        type: Type.STRING,
        description: "The exact words spoken by the user that constitute their action."
      }
    },
    required: ["action"]
  }
};

type ActionProcessor = (action: string) => Promise<string>;
type InputProgressCallback = (text: string, isFinal: boolean) => void;

export class LiveClient {
  private ai: GoogleGenAI;
  private sessionPromise: Promise<any> | null = null;
  private inputContext: AudioContext | null = null;
  private outputContext: AudioContext | null = null;
  private inputProcessor: ScriptProcessorNode | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private nextStartTime: number = 0;
  
  private onAction: ActionProcessor;
  private onInputProgress: InputProgressCallback | null = null;

  constructor(onAction: ActionProcessor, onInputProgress?: InputProgressCallback) {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    this.onAction = onAction;
    if (onInputProgress) this.onInputProgress = onInputProgress;
  }

  async connect(config: VoiceConfig, systemInstruction: string) {
    this.disconnect(); // Ensure clean state

    this.inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    this.sessionPromise = this.ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: () => {
          console.log("Gemini Live: Connected");
          this.startAudioInput(stream);
        },
        onmessage: (msg: LiveServerMessage) => this.handleMessage(msg),
        onclose: () => console.log("Gemini Live: Closed"),
        onerror: (err) => console.error("Gemini Live Error:", err),
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: config.voiceName } }
        },
        inputAudioTranscription: { model: "google_speech" }, // Enable Real-time Transcription
        systemInstruction: systemInstruction,
        tools: [{ functionDeclarations: [SUBMIT_ACTION_TOOL] }],
      }
    });

    return this.sessionPromise;
  }

  private startAudioInput(stream: MediaStream) {
    if (!this.inputContext) return;

    this.inputSource = this.inputContext.createMediaStreamSource(stream);
    this.inputProcessor = this.inputContext.createScriptProcessor(4096, 1, 1);

    this.inputProcessor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBuffer = float32To16BitPCM(inputData);
      const base64Data = arrayBufferToBase64(pcmBuffer);

      if (this.sessionPromise) {
        this.sessionPromise.then(session => {
          session.sendRealtimeInput({
            media: {
              mimeType: 'audio/pcm;rate=16000',
              data: base64Data
            }
          });
        });
      }
    };

    this.inputSource.connect(this.inputProcessor);
    this.inputProcessor.connect(this.inputContext.destination);
  }

  private async handleMessage(msg: LiveServerMessage) {
    // 1. Handle Audio Output (Narrator Voice)
    const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (audioData && this.outputContext) {
      const float32 = base64ToFloat32Array(audioData);
      const buffer = this.outputContext.createBuffer(1, float32.length, 24000);
      buffer.getChannelData(0).set(float32);

      const source = this.outputContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.outputContext.destination);

      const now = this.outputContext.currentTime;
      const startTime = Math.max(now, this.nextStartTime);
      source.start(startTime);
      this.nextStartTime = startTime + buffer.duration;
    }

    // 2. Handle Real-time Input Transcription (User Voice -> Text)
    const transcription = msg.serverContent?.inputTranscription;
    if (transcription && transcription.text && this.onInputProgress) {
        // Stream text to UI
        this.onInputProgress(transcription.text, false);
    }
    
    // 3. Handle Turn Completion (Finalize Text)
    if (msg.serverContent?.turnComplete && this.onInputProgress) {
        this.onInputProgress("", true); // Signal completion/reset
    }

    // 4. Handle Tool Calls (Bridging Voice to Game Engine)
    if (msg.toolCall) {
      for (const fc of msg.toolCall.functionCalls) {
        if (fc.name === 'submit_action') {
          const actionText = (fc.args as any).action;
          
          try {
             // Call the main game engine (App.tsx)
             const resultText = await this.onAction(actionText);

             // Send the result back to the Live Model so it can narrate it
             this.sessionPromise?.then(session => {
                session.sendToolResponse({
                   functionResponses: [
                     {
                       id: fc.id,
                       name: fc.name,
                       response: { result: resultText }
                     }
                   ]
                });
             });

          } catch (e) {
             console.error("Game Engine Tool Error", e);
             this.sessionPromise?.then(session => {
                session.sendToolResponse({
                   functionResponses: [
                     {
                       id: fc.id,
                       name: fc.name,
                       response: { error: "The Nightmare Machine is unresponsive." }
                     }
                   ]
                });
             });
          }
        }
      }
    }
  }

  disconnect() {
    // Clean up Web Audio
    if (this.inputSource) this.inputSource.disconnect();
    if (this.inputProcessor) this.inputProcessor.disconnect();
    if (this.inputContext) this.inputContext.close();
    if (this.outputContext) this.outputContext.close();
    
    // Attempt to close session if possible
    if (this.sessionPromise) {
        this.sessionPromise.then(session => {
            if (session.close) session.close();
        });
    }

    this.inputContext = null;
    this.outputContext = null;
    this.sessionPromise = null;
    this.nextStartTime = 0;
  }
}
