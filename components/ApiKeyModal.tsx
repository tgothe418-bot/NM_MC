
import React, { useState } from 'react';
import { Key, Lock } from 'lucide-react';

interface ApiKeyModalProps {
  onSetKey: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSetKey }) => {
  const [inputKey, setInputKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputKey.trim()) {
      onSetKey(inputKey.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4">
      <div className="bg-terminal border border-blood-red max-w-md w-full p-8 shadow-[0_0_30px_rgba(74,4,4,0.5)] rounded-sm relative overflow-hidden">
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blood-red to-transparent opacity-50"></div>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blood-red/20 rounded-full border border-blood-red/50">
            <Lock className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-2xl font-serif text-gray-200 tracking-wide">AUTHENTICATION REQUIRED</h2>
        </div>

        <p className="text-gray-400 mb-6 font-mono text-sm leading-relaxed">
          Accessing The Nightmare Machine requires a valid Google GenAI API key. 
          Your key acts as the tether to the simulation.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="Paste API Key here..."
              className="w-full bg-black border border-gray-700 text-gray-100 pl-10 pr-4 py-3 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-900 transition-all font-mono text-sm placeholder-gray-600"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blood-red hover:bg-red-900 text-gray-200 font-bold py-3 px-4 rounded-sm transition-colors duration-300 font-mono tracking-widest border border-red-800 uppercase"
          >
            Initialize System
          </button>
        </form>
        
        <div className="mt-6 text-center">
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs text-gray-600 hover:text-red-400 underline transition-colors">
                Get API Key via Google AI Studio
            </a>
        </div>
      </div>
    </div>
  );
};