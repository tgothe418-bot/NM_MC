import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import './WelcomeScreen.css'; // Import the new styles

interface WelcomeScreenProps {
  onStart: () => void;
}

const generateCursedText = (text: string, intensity: number = 0.2): string => {
  const combining = [
    '\u0300', '\u0301', '\u0302', '\u0303', '\u0304', '\u0305', '\u0306', '\u0307',
    '\u0320', '\u0321', '\u0322', '\u0323', '\u0324', '\u0325', '\u0326', '\u0327'
  ];
  
  return text.split('').map(char => {
    if (char === ' ') return char;
    let result = char;
    if (Math.random() < intensity) {
      const num = Math.floor(Math.random() * 3) + 1; // Reduced max from 4 to 3 for legibility
      for (let i = 0; i < num; i++) {
        result += combining[Math.floor(Math.random() * combining.length)];
      }
    }
    return result;
  }).join('');
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const [cursedThe, setCursedThe] = useState("THE");
  const [cursedMachine, setCursedMachine] = useState("NIGHTMARE MACHINE");
  const [isGlitching, setIsGlitching] = useState(false);
  const [filterSeed, setFilterSeed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // Reduced intensity slightly to preserve the "Premium" look
      setCursedThe(generateCursedText("THE", 0.05));
      setCursedMachine(generateCursedText("NIGHTMARE MACHINE", 0.05));
      setFilterSeed(Math.random() * 100);

      if (Math.random() > 0.95) {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 150);
      }
    }, 2000); // Slower update cycle for less chaotic UI
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="welcome-container">
      {/* SVG Filter Definition - Kept for the severe glitch moments */}
      <svg className="hidden">
        <defs>
          <filter id="distort">
            <feTurbulence type="fractalNoise" baseFrequency="0.01 0.1" numOctaves="2" seed={filterSeed} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={isGlitching ? "30" : "0"} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Atmospheric Background Layers */}
      <div className="fog-layer">
        <div className="fog-beam" style={{ top: '20%', animationDelay: '0s' }}></div>
        <div className="fog-beam" style={{ top: '60%', animationDelay: '-5s' }}></div>
      </div>

      <div className="scanlines"></div>
      
      {/* Main Content Wrapper - Animates In */}
      <div className="content-entrance">
        
        {/* Top Decorative Icon */}
        <ChevronUp className="text-gray-600 w-6 h-6 opacity-30 animate-bounce" />
          
        {/* Title Section */}
        <div className="flex flex-col items-center group">
            
            {/* "THE" */}
            <div 
              className="relative transition-all duration-200"
              style={{ filter: isGlitching ? 'url(#distort)' : 'none' }}
            >
                <h1 className="title-primary">
                    {cursedThe}
                    {/* CSS Animation Layers */}
                    <span className="aberration-layer aberration-red">{cursedThe}</span>
                    <span className="aberration-layer aberration-cyan">{cursedThe}</span>
                </h1>
            </div>

            {/* "NIGHTMARE MACHINE" */}
            <div 
              className="relative mt-4 transition-all duration-200"
              style={{ filter: isGlitching ? 'url(#distort)' : 'none' }}
            >
                <h1 className="title-secondary">
                    <span className="relative z-10">{cursedMachine}</span>
                    <span className="aberration-layer aberration-red" style={{ animationDelay: '0.1s' }}>{cursedMachine}</span>
                    <span className="aberration-layer aberration-cyan" style={{ animationDelay: '0.1s' }}>{cursedMachine}</span>
                </h1>
            </div>
        </div>

        {/* Action Section */}
        <div className="flex flex-col items-center gap-8 w-full max-w-xl">
          <button
            onClick={onStart}
            className="enter-button group"
          >
            <span className="relative z-10">ENTER SYSTEM</span>
            {/* Subtle sweep effect on hover */}
            <div className="absolute inset-0 bg-white/5 -translate-x-full group-hover:animate-[copper_1s_linear_infinite]"></div>
          </button>
        </div>

        {/* Footer Warning */}
        <div className="absolute bottom-10 p-6 opacity-50">
          <p className="text-xs text-red-900/60 font-mono uppercase tracking-[0.3em] text-center">
            Psychological Integrity Cannot Be Guaranteed
          </p>
        </div>

      </div>
    </div>
  );
};