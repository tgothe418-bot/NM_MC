
import React from 'react';

interface ClusterAmbienceProps {
  activeCluster: string;
  threatLevel?: number;
  locationState?: number;
  visualMotif?: string;
  weatherState?: string;
}

export const ClusterAmbience: React.FC<ClusterAmbienceProps> = ({ activeCluster, threatLevel = 0 }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      <div className="absolute inset-0 bg-black/40" />
      {activeCluster.includes("Flesh") && <div className="absolute inset-0 bg-red-900/10 animate-flesh-pulse" />}
      {activeCluster.includes("System") && <div className="absolute inset-0 bg-green-900/5 animate-glitch" />}
      {activeCluster.includes("Haunting") && <div className="absolute inset-0 bg-amber-900/5 animate-haunt-pulse" />}
      {activeCluster.includes("Desire") && <div className="absolute inset-0 bg-rose-900/5 animate-pulse-slow" />}
    </div>
  );
};
