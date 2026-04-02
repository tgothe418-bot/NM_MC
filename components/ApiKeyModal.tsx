import React, { useState, useEffect } from 'react';
import { initializeAnthropic } from '../services/aiOrchestrator';

export const ApiKeyModal: React.FC = () => {
  const [anthropicKey, setAnthropicKey] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Check if API keys are present in environment
  const hasGeminiKey = !!process.env.API_KEY || !!process.env.GEMINI_API_KEY;
  const hasAnthropicKeyEnv = !!import.meta.env.VITE_ANTHROPIC_API_KEY || !!process.env.ANTHROPIC_API_KEY;

  const [hasAnthropicKey, setHasAnthropicKey] = useState(hasAnthropicKeyEnv);

  useEffect(() => {
     if (hasAnthropicKeyEnv) {
         initializeAnthropic(import.meta.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || "");
     }
  }, [hasAnthropicKeyEnv]);

  if (hasGeminiKey && hasAnthropicKey) return null;

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!hasAnthropicKey && anthropicKey) {
          initializeAnthropic(anthropicKey);
          setHasAnthropicKey(true);
      }
      setIsSubmitted(true);
  };

  if (isSubmitted && hasGeminiKey && hasAnthropicKey) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
      <div className="w-full max-w-md p-8 bg-gray-900 border border-red-500/50 rounded-sm shadow-[0_0_50px_rgba(220,38,38,0.2)] text-center space-y-6">
         <h2 className="text-xl font-mono font-bold text-red-500 uppercase tracking-widest animate-pulse">
            System Error
         </h2>
         <p className="text-gray-400 font-mono text-sm leading-relaxed">
            The Neural Link cannot be established.
            <br/><br/>
            {!hasGeminiKey && <span className="text-white block mb-2">Google API_KEY environment variable is missing.</span>}
            {!hasAnthropicKey && <span className="text-white block">Anthropic API Key is missing.</span>}
         </p>
         
         {!hasAnthropicKey && (
             <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                 <input 
                    type="password" 
                    placeholder="Enter Anthropic API Key (sk-ant-...)"
                    value={anthropicKey}
                    onChange={(e) => setAnthropicKey(e.target.value)}
                    className="w-full bg-black border border-red-900/50 text-red-500 p-2 font-mono text-sm focus:outline-none focus:border-red-500"
                 />
                 <button 
                    type="submit"
                    className="w-full bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-900/50 p-2 font-mono uppercase tracking-widest transition-colors"
                 >
                     Initialize Link
                 </button>
             </form>
         )}

         <div className="text-[10px] text-gray-600 font-mono uppercase tracking-widest border-t border-gray-800 pt-4 mt-6">
             Fatal Exception // 0x000000
         </div>
      </div>
    </div>
  );
};
