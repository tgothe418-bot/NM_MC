
import React, { useState, useEffect } from 'react';
import { ChevronUp, Eye, Skull } from 'lucide-react';
import './WelcomeScreen.css';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WHISPERS = [
  "IT REMEMBERS YOU",
  "DO NOT LOOK BACK",
  "THE VOID IS HUNGRY",
  "YOU ARE NOT ALONE",
  "SLEEP IS A LUXURY",
  "IT'S ALREADY INSIDE"
];

const generateCursedText = (text: string, intensity: number = 0.3): string => {
  const combining = [
    '\u0300', '\u0301', '\u0302', '\u0303', '\u0304', '\u0305', '\u0306', '\u0307',
    '\u0320', '\u0321', '\u0322', '\u0323', '\u0324', '\u0325', '\u0326', '\u0327',
    '\u0339', '\u033a', '\u033b', '\u033c', '\u0345', '\u0347', '\u0348', '\u0349'
  ];
  
  return text.split('').map(char => {
    if (char === ' ') return char;
    let result = char;
    if (Math.random() < intensity) {
      const num = Math.floor(Math.random() * 5) + 1;
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
  const [whisper, setWhisper] = useState("");
  const [watcherActive, setWatcherActive] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCursedThe(generateCursedText("THE", 0.15));
      setCursedMachine(generateCursedText("NIGHTMARE MACHINE", 0.15));
      setFilterSeed(Math.random() * 100);

      // Random aggressive glitching
      if (Math.random() > 0.90) {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), Math.random() * 300);
      }

      // Random whispers manifest
      if (Math.random() > 0.85 && !whisper) {
        setWhisper(WHISPERS[Math.floor(Math.random() * WHISPERS.length)]);
        setTimeout(() => setWhisper(""), 2000);
      }

      // The Watcher appears
      if (Math.random() > 0.97 && !watcherActive) {
        setWatcherActive(true);
        setTimeout(() => setWatcherActive(false), 1000);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [whisper, watcherActive]);

  return (
    <div className="welcome-container">
      <div className="vignette"></div>
      
      <svg className="hidden">
        <defs>
          <filter id="distort">
            <feTurbulence type="fractalNoise" baseFrequency="0.05 0.5" numOctaves="3" seed={filterSeed} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={isGlitching ? "50" : "2"} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Atmospheric Background Layers */}
      <div className="fog-layer">
        <div className="fog-beam spectral" style={{ top: '10%', animationDelay: '0s' }}></div>
        <div className="fog-beam spectral" style={{ top: '80%', animationDelay: '-7s' }}></div>
      </div>

      {/* The Watchers */}
      <div className={`watcher-overlay ${watcherActive ? 'visible' : ''}`}>
         <div className="watcher-eyes">
            <Eye className="eye-icon left" />
            <Eye className="eye-icon right" />
         </div>
      </div>

      <div className="scanlines"></div>
      <div className="static-noise"></div>
      
      <div className="content-entrance">
        {/* Spectral Whisper */}
        <div className={`whisper-text ${whisper ? 'active' : ''}`}>
          {whisper}
        </div>
        
        <ChevronUp className="text-red-900 w-6 h-6 opacity-20 animate-bounce" />
          
        <div className="title-wrapper">
            <div 
              className="relative transition-all duration-75"
              style={{ filter: isGlitching ? 'url(#distort)' : 'none' }}
            >
                <h1 className="title-primary">
                    {cursedThe}
                    <span className="aberration-layer aberration-red">{cursedThe}</span>
                    <span className="aberration-layer aberration-cyan">{cursedThe}</span>
                </h1>
            </div>

            <div 
              className="relative transition-all duration-75"
              style={{ filter: isGlitching ? 'url(#distort)' : 'none' }}
            >
                <h1 className="title-secondary">
                    <span className="relative z-10">{cursedMachine}</span>
                    <span className="aberration-layer aberration-red">{cursedMachine}</span>
                    <span className="aberration-layer aberration-cyan">{cursedMachine}</span>
                </h1>
            </div>
        </div>

        <div className="flex flex-col items-center gap-8 w-full max-w-xl">
          <button
            onClick={onStart}
            className="enter-button spooky-pulse"
          >
            <span className="relative z-10">INITIALIZE SIMULATION</span>
            <div className="blood-shine"></div>
          </button>
        </div>
      </div>

      <div className="absolute bottom-8 w-full px-6 flex justify-center z-50 pointer-events-none">
          <div 
            className="flex items-center gap-6 bg-black/60 p-6 border border-red-900/40 rounded-sm backdrop-blur-sm pointer-events-auto max-w-4xl shadow-[0_0_30px_rgba(255,0,0,0.1)]"
            role="alert"
            aria-label="Warning"
          >
            <Skull className="w-10 h-10 text-red-600 animate-pulse flex-shrink-0" aria-hidden="true" />
            <p className="warning-text">
                WARNING: THIS IS A HORROR SIMULATOR THAT HAS NO ETHICAL LIMITS.<br />BE CAUTIOUS AND DO NOT ASK FOR MORE THAN YOU ARE OK WITH.
            </p>
            <Skull className="w-10 h-10 text-red-600 animate-pulse flex-shrink-0" aria-hidden="true" />
          </div>
      </div>
    </div>
  );
};
