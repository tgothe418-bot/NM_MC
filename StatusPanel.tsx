import React, { useState, useEffect } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';

const LOGIC_STEPS = [
  "Parsing user intent...",
  "Analyzing narrative metronome...",
  "Evaluating psychological stress...",
  "Updating NPC memory matrices...",
  "Calculating threat vectors...",
  "Synthesizing environmental response...",
  "Rendering visceral prose...",
  "Finalizing state mutations..."
];

export const ThinkingIndicator: React.FC<{ error?: string }> = ({ error }) => {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (error) return;

    const interval = setInterval(() => {
      setProgress(p => {
        // Slow down as it gets closer to 99
        const increment = p < 50 ? 5 : p < 80 ? 2 : p < 95 ? 1 : 0.2;
        const next = p + increment;
        return next > 99 ? 99 : next;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [error]);

  useEffect(() => {
    if (error) return;

    const stepInterval = setInterval(() => {
      setStepIndex(s => {
        const next = s + 1;
        return next >= LOGIC_STEPS.length ? LOGIC_STEPS.length - 1 : next;
      });
    }, 1500);

    return () => clearInterval(stepInterval);
  }, [error]);

  if (error) {
    return (
      <div className="bg-black/40 border border-red-500/50 p-6 rounded-sm flex flex-col gap-2 w-full max-w-md">
        <div className="flex items-center gap-3 text-red-500">
          <AlertTriangle className="w-5 h-5" />
          <span className="text-sm font-bold uppercase tracking-widest">System Failure</span>
        </div>
        <div className="text-xs text-red-400/80 font-mono">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-black/40 border p-6 rounded-sm flex flex-col gap-3 w-full max-w-md"
         style={{
             borderColor: `rgba(var(--theme-color), calc(0.3 + (var(--ui-intensity) * 0.7)))`,
             boxShadow: `0 0 calc(var(--ui-intensity) * 20px) rgba(var(--theme-color), calc(var(--ui-intensity) * 0.2))`
         }}>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: `rgb(var(--theme-color))` }} />
                <span className="text-xs uppercase tracking-widest font-bold" style={{ color: `rgb(var(--theme-color))` }}>
                    Processing
                </span>
            </div>
            <span className="text-xs font-mono" style={{ color: `rgb(var(--theme-color))` }}>
                {Math.floor(progress)}%
            </span>
        </div>
        
        <div className="w-full h-1 bg-gray-900 rounded-full overflow-hidden">
            <div 
                className="h-full transition-all duration-200 ease-out"
                style={{ 
                    width: `${progress}%`,
                    backgroundColor: `rgb(var(--theme-color))`
                }}
            />
        </div>

        <div className="text-[10px] uppercase tracking-widest opacity-60 font-mono truncate" style={{ color: `rgb(var(--theme-color))` }}>
            &gt; {LOGIC_STEPS[stepIndex]}
        </div>
    </div>
  );
};
