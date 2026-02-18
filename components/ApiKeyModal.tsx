import React from 'react';

export const ApiKeyModal: React.FC = () => {
  // Check if API key is present in environment
  const hasKey = !!process.env.API_KEY;

  if (hasKey) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
      <div className="w-full max-w-md p-8 bg-gray-900 border border-red-500/50 rounded-sm shadow-[0_0_50px_rgba(220,38,38,0.2)] text-center space-y-6">
         <h2 className="text-xl font-mono font-bold text-red-500 uppercase tracking-widest animate-pulse">
            System Error
         </h2>
         <p className="text-gray-400 font-mono text-sm leading-relaxed">
            The Neural Link cannot be established.
            <br/><br/>
            <span className="text-white">API_KEY environment variable is missing.</span>
         </p>
         <div className="text-[10px] text-gray-600 font-mono uppercase tracking-widest border-t border-gray-800 pt-4">
             Fatal Exception // 0x000000
         </div>
      </div>
    </div>
  );
};
