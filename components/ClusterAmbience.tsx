
import React, { useMemo, useEffect, useRef } from 'react';

interface ClusterAmbienceProps {
  activeCluster: string;
  threatLevel?: number;
  locationState?: number;
  visualMotif?: string;
  weatherState?: string;
}

const GenerativeSoundscape: React.FC<{ threatLevel: number }> = ({ threatLevel }) => {
  const ctxRef = useRef<AudioContext | null>(null);
  const oscsRef = useRef<OscillatorNode[]>([]);
  const gainsRef = useRef<GainNode[]>([]);

  useEffect(() => {
    const init = () => {
      if (ctxRef.current) return;
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const master = ctxRef.current.createGain();
      master.gain.value = 0.02;
      master.connect(ctxRef.current.destination);

      for (let i = 0; i < 6; i++) {
        const osc = ctxRef.current.createOscillator();
        const g = ctxRef.current.createGain();
        osc.connect(g);
        g.connect(master);
        osc.start();
        oscsRef.current.push(osc);
        gainsRef.current.push(g);
      }
    };

    const resume = () => ctxRef.current?.resume();
    window.addEventListener('mousedown', init);
    window.addEventListener('mousedown', resume);
    return () => {
      window.removeEventListener('mousedown', init);
      window.removeEventListener('mousedown', resume);
    };
  }, []);

  useEffect(() => {
    if (!ctxRef.current) return;
    let frame: number;
    const speed = 0.05 + (threatLevel * 0.05);
    const update = () => {
      const t = ctxRef.current!.currentTime;
      oscsRef.current.forEach((osc, i) => {
        const phase = ((t * speed) + (i / 6)) % 1;
        const freq = 40 * Math.pow(2, phase * 8);
        osc.frequency.setTargetAtTime(freq, t, 0.1);
        const vol = Math.sin(phase * Math.PI) * 0.2;
        gainsRef.current[i].gain.setTargetAtTime(vol, t, 0.1);
      });
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [threatLevel]);

  return null;
};

export const ClusterAmbience: React.FC<ClusterAmbienceProps> = ({ activeCluster, threatLevel = 0 }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      <GenerativeSoundscape threatLevel={threatLevel} />
      <div className="absolute inset-0 bg-black/40" />
      {activeCluster.includes("Flesh") && <div className="absolute inset-0 bg-red-900/10 animate-flesh-pulse" />}
      {activeCluster.includes("System") && <div className="absolute inset-0 bg-green-900/5 animate-glitch" />}
    </div>
  );
};
