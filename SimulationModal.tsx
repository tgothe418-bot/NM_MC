import React, { useState, useEffect } from 'react';

export const ApiKeyModal: React.FC = () => {
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      try {
        // @ts-ignore
        if (window.aistudio && window.aistudio.hasSelectedApiKey) {
          // @ts-ignore
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasKey(selected);
        } else {
          // Fallback if aistudio is not available
          setHasKey(!!process.env.API_KEY || !!process.env.GEMINI_API_KEY);
        }
      } catch (e) {
        setHasKey(!!process.env.API_KEY || !!process.env.GEMINI_API_KEY);
      } finally {
        setIsChecking(false);
      }
    };
    checkKey();
  }, []);

  if (isChecking || hasKey) return null;

  const handleSelectKey = async () => {
    try {
      setErrorMsg(null);
      // @ts-ignore
      if (window.aistudio && window.aistudio.openSelectKey) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
        // The instructions say: "To mitigate this, you MUST assume the key selection was successful after triggering openSelectKey() and proceed to the app. Do not add delay to mitigate the race condition."
        setHasKey(true);
      } else {
        setErrorMsg("API Key selector is not available in this environment.");
      }
    } catch (e: any) {
      console.error("Failed to open key selector:", e);
      setErrorMsg(e?.message || "Failed to open key selector.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
      <div className="w-full max-w-md p-8 bg-gray-900 border border-red-500/50 rounded-sm shadow-[0_0_50px_rgba(220,38,38,0.2)] text-center space-y-6">
         <h2 className="text-xl font-mono font-bold text-red-500 uppercase tracking-widest animate-pulse">
            Neural Link Disconnected
         </h2>
         <p className="text-gray-400 font-mono text-sm leading-relaxed">
            The simulation requires a valid API key to process cognitive functions.
            <br/><br/>
            <span className="text-white block mb-2">Please select your Google Cloud API Key to continue.</span>
         </p>
         
         {errorMsg && (
            <div className="text-red-500 text-xs font-mono bg-red-900/20 p-2 border border-red-500/30">
                ERROR: {errorMsg}
            </div>
         )}

         <button 
            onClick={handleSelectKey}
            className="w-full py-3 bg-red-900/20 hover:bg-red-900/40 border border-red-500/50 text-red-500 font-mono uppercase tracking-widest transition-all"
         >
            Select API Key
         </button>

         <div className="text-[10px] text-gray-600 font-mono uppercase tracking-widest border-t border-gray-800 pt-4 mt-6">
             Awaiting Authorization // 0x000000
         </div>
      </div>
    </div>
  );
};

