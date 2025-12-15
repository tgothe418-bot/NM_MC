import React, { useMemo, useEffect, useState } from 'react';

interface ClusterAmbienceProps {
  activeCluster: string;
  weatherState?: string;
  threatLevel?: number;
  locationState?: number; // 0=Safe, 1=Uncanny, 2=Hostile, 3=Nightmare
}

// Particle Component for generating ambient effects
const AmbientParticles: React.FC<{
  type: 'float' | 'rise' | 'fall';
  count: number;
  colorClass: string;
  minSize?: number;
  maxSize?: number;
}> = ({ type, count, colorClass, minSize = 1, maxSize = 3 }) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 10,
      duration: Math.random() * 10 + 10,
      size: Math.random() * (maxSize - minSize) + minSize,
      opacity: Math.random() * 0.5 + 0.1
    }));
  }, [count, minSize, maxSize]);

  const animClass = 
    type === 'rise' ? 'animate-particle-rise' : 
    type === 'fall' ? 'animate-snow-fall' : 
    'animate-particle-float';

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className={`absolute rounded-full ${colorClass} ${animClass}`}
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity: p.opacity
          }}
        />
      ))}
    </div>
  );
};

// Dynamic Lighting Component with rAF Animation
const DynamicLighting: React.FC<{
  cluster: string;
  threat: number;
  locationState: number;
}> = ({ cluster, threat, locationState }) => {
  const [lightPos, setLightPos] = useState({ x: 50, y: 30 });
  const [pulse, setPulse] = useState(1);

  // Animation Loop for organic movement (The Wandering Flashlight)
  useEffect(() => {
    let frameId: number;
    const animate = () => {
      const time = Date.now() / 2000; // Time factor
      
      // Calculate wandering position based on sine waves for organic feel
      // Threat increases the jitter/speed of the light
      const jitter = threat * 0.5;
      const x = 50 + Math.sin(time) * 15 + Math.cos(time * 2.5) * jitter; 
      const y = 30 + Math.cos(time * 0.8) * 10 + Math.sin(time * 1.5) * jitter;
      
      // Pulse breathes slowly
      const p = 1 + Math.sin(time * 2) * 0.05;

      setLightPos({ x, y });
      setPulse(p);
      
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [threat]);
  
  // Base light colors per cluster
  // House of Leaves Influence: 
  // "House" is Blue. "Minotaur/Threat" is Red.
  let lightColor = "rgba(255, 255, 255, 0.05)"; // Default
  
  if (cluster.includes("Flesh")) {
      lightColor = "rgba(136, 8, 8, 0.2)"; // Deep Red (Visceral)
  } else if (cluster.includes("System")) {
      lightColor = "rgba(16, 185, 129, 0.15)"; // Green (Digital)
  } else if (cluster.includes("Haunting")) {
      // Dynamic shift for Haunting/HoL theme
      // Low Threat = Navidson Blue (Mystery)
      // High Threat = Minotaur Red (Danger)
      if (threat >= 3) {
          lightColor = "rgba(180, 20, 20, 0.2)"; // Threat Red
      } else {
          lightColor = "rgba(59, 130, 246, 0.15)"; // Navidson Blue
      }
  } else if (cluster.includes("Blasphemy")) {
      lightColor = "rgba(85, 0, 85, 0.2)"; // Purple (Ritual)
  } else if (cluster.includes("Survival")) {
      lightColor = "rgba(165, 242, 243, 0.1)"; // Cyan (Cold)
  } else if (cluster.includes("Self")) {
      lightColor = "rgba(75, 0, 130, 0.15)"; // Indigo (Psych)
  }

  // Intensity logic
  const baseIntensity = 0.3 + (threat * 0.1) + (locationState * 0.1); 
  const currentIntensity = Math.min(0.9, baseIntensity * pulse);

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-10 mix-blend-soft-light transition-colors duration-1000"
      style={{
        background: `radial-gradient(circle at ${lightPos.x}% ${lightPos.y}%, ${lightColor} 0%, transparent 60%)`,
        opacity: currentIntensity
      }}
    />
  );
};

export const ClusterAmbience: React.FC<ClusterAmbienceProps> = ({ 
  activeCluster, 
  weatherState = "Clear", 
  threatLevel = 0,
  locationState = 0 
}) => {
  const isFlesh = activeCluster.includes('Flesh');
  const isSystem = activeCluster.includes('System');
  const isHaunting = activeCluster.includes('Haunting');
  const isSelf = activeCluster.includes('Self');
  const isBlasphemy = activeCluster.includes('Blasphemy');
  const isSurvival = activeCluster.includes('Survival');

  // Weather parsing
  const isRaining = weatherState.includes('Rain') || weatherState.includes('Storm') || weatherState.includes('Pouring') || weatherState.includes('Drizzle');
  const isFoggy = weatherState.includes('Fog') || weatherState.includes('Mist') || weatherState.includes('Haze') || weatherState.includes('Smoke');
  
  // Threat Level & Location State Logic for dynamic intensity
  const combinedIntensity = 0.05 + (threatLevel * 0.08) + (locationState * 0.12);
  const intensity = Math.min(0.85, combinedIntensity);

  // Scanlines are particularly distracting, so we use a specific curve.
  const scanlineOpacity = Math.min(0.6, 0.03 + (threatLevel * 0.05) + (locationState * 0.08));

  // Physiological effects logic
  const isHighThreat = threatLevel >= 3;
  const isCriticalThreat = threatLevel >= 4;
  
  // Location severity flags
  const isUncannyLocation = locationState >= 1;
  const isHostileLocation = locationState >= 2;
  const isNightmareLocation = locationState >= 3;

  // Determine Fog Color based on Cluster (Dark Atmosphere)
  let fogColorStart = "rgba(10, 10, 10, 0)";
  let fogColorMid = "rgba(20, 20, 20, 0.4)";
  
  if (isFlesh) {
      fogColorMid = "rgba(40, 10, 10, 0.3)"; // Bloody mist
  } else if (isSystem) {
      fogColorMid = "rgba(0, 30, 20, 0.2)"; // Toxic gas
  } else if (isHaunting) {
      fogColorMid = "rgba(30, 25, 10, 0.3)"; // Dust/Sepia
  } else if (isSurvival) {
      fogColorMid = "rgba(200, 220, 230, 0.1)"; // Cold white mist (lighter but still atmospheric)
  } else if (isBlasphemy) {
      fogColorMid = "rgba(30, 0, 30, 0.3)"; // Incense smoke
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      
      {/* Dynamic Lighting Overlay */}
      <DynamicLighting cluster={activeCluster} threat={threatLevel} locationState={locationState} />

      {/* Dark Atmospheric Fog Flow */}
      <div 
        className="absolute inset-0 z-[1] animate-fog-flow"
        style={{
          backgroundImage: `linear-gradient(to right, ${fogColorStart}, ${fogColorMid}, ${fogColorStart})`,
          backgroundSize: '200% 100%'
        }}
      />

      {/* --- CLUSTER BASE LAYERS --- */}

      {/* Flesh Cluster: Red pulse and heavy organic vignette */}
      {isFlesh && (
        <div style={{ opacity: intensity }}>
          <div className={`absolute inset-0 bg-red-900 mix-blend-screen ${isNightmareLocation ? 'animate-pulse' : 'animate-flesh-pulse'}`} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#4a0404_120%)] opacity-40 mix-blend-multiply" />
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-red-950/20 to-transparent" />
          {isNightmareLocation && (
             <div className="absolute inset-0 bg-red-500/10 mix-blend-overlay animate-pulse" style={{ animationDuration: '3s' }}></div>
          )}
          {/* Particles: Organic matter rising (Ash/Spores) */}
          <AmbientParticles type="rise" count={25} colorClass="bg-red-900/40" minSize={2} maxSize={6} />
        </div>
      )}

      {/* System Cluster: Grid lines and scanline */}
      {isSystem && (
        <>
          <div className={`absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] ${isNightmareLocation ? 'bg-[size:15px_15px]' : 'bg-[size:30px_30px]'} opacity-20 transition-all duration-1000`} />
          {(isHostileLocation) && (
             <div className="absolute inset-0 bg-system-green/5 mix-blend-color-dodge animate-glitch opacity-10" />
          )}
          <div 
            className="absolute inset-0 bg-gradient-to-b from-transparent via-system-green/10 to-transparent h-[15%] w-full animate-system-scan" 
            style={{ 
                opacity: scanlineOpacity, 
                animationDuration: isNightmareLocation ? '2s' : '4s' 
            }}
          />
          <div className="absolute inset-0 bg-system-green/5 mix-blend-overlay" style={{ opacity: intensity * 0.5 }} />
          {/* Particles: Static data float (Pixels) */}
          <AmbientParticles type="float" count={30} colorClass="bg-system-green/30" minSize={1} maxSize={2} />
        </>
      )}

      {/* Haunting Cluster: Spectral gold pulse and fog */}
      {isHaunting && (
        <div style={{ opacity: intensity }}>
           <div className="absolute inset-0 bg-haunt-gold animate-haunt-pulse mix-blend-screen" />
           <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black via-gray-900/40 to-transparent" />
           {isUncannyLocation && (
               <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_20%,rgba(180,83,9,0.1)_120%)] animate-pulse-slow" />
           )}
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-haunt-gold/10 via-transparent to-transparent opacity-40" />
           {/* Particles: Dust Motes (Golden) */}
           <AmbientParticles type="float" count={50} colorClass="bg-haunt-gold/40" minSize={1} maxSize={3} />
        </div>
      )}

      {/* Self Cluster: Desaturation, isolation vignette, cold */}
      {isSelf && (
        <div style={{ opacity: intensity }}>
          <div className="absolute inset-0 bg-blue-900/10 mix-blend-multiply" />
          <div 
            className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,black_140%)] opacity-60 transition-all duration-1000" 
            style={{ 
                background: `radial-gradient(circle, transparent ${isNightmareLocation ? '20%' : '40%'}, black ${isNightmareLocation ? '100%' : '140%'})` 
            }}
          />
          {isHostileLocation && (
             <div className="absolute inset-0 bg-black/20 mix-blend-soft-light animate-pulse-slow" />
          )}
          {/* Particles: Mirror Shards (White/Grey) */}
          <AmbientParticles type="float" count={15} colorClass="bg-gray-400/30" minSize={2} maxSize={4} />
        </div>
      )}

      {/* Blasphemy Cluster: Ritual Purple, Heat, haze */}
      {isBlasphemy && (
        <div style={{ opacity: intensity }}>
          <div className="absolute inset-0 bg-purple-900/20 mix-blend-screen animate-pulse-slow" />
          <div className="absolute inset-0 bg-orange-900/10 mix-blend-overlay" />
          <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,rgba(88,28,135,0.4)_120%)]" />
          {isNightmareLocation && (
              <div className="absolute inset-0 bg-gradient-to-t from-red-900/20 via-transparent to-transparent animate-pulse" />
          )}
          {/* Particles: Embers rising */}
          <AmbientParticles type="rise" count={40} colorClass="bg-orange-500/50" minSize={1} maxSize={3} />
        </div>
      )}

      {/* Survival Cluster: Ice Cyan, Whiteout, Frost */}
      {isSurvival && (
        <div style={{ opacity: intensity }}>
          <div className="absolute inset-0 bg-cyan-900/10 mix-blend-screen" />
          <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_50%,rgba(200,255,255,0.15)_100%)]" />
          {isHostileLocation && (
             <div className="absolute inset-0 bg-white/5 mix-blend-overlay animate-pulse-slow" />
          )}
          {/* Particles: Snow Falling */}
          <AmbientParticles type="fall" count={60} colorClass="bg-white/60" minSize={2} maxSize={4} />
        </div>
      )}

      {/* --- WEATHER LAYERS --- */}

      {isRaining && (
        <div className="absolute inset-0 z-10 opacity-30">
           <div className="absolute inset-0 backdrop-blur-[0.5px]" />
           <div className="absolute inset-0 bg-[repeating-linear-gradient(transparent,transparent_40px,rgba(200,200,255,0.1)_40px,rgba(200,200,255,0.05)_80px)] opacity-30 animate-rain-fall" style={{backgroundSize: '100% 200%'}}></div>
           <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_50px,rgba(200,200,255,0.05)_51px)] opacity-20 mix-blend-overlay"></div>
        </div>
      )}

      {isFoggy && (
        <div className="absolute inset-0 z-10 opacity-20 mix-blend-screen animate-fog-flow" 
             style={{
               backgroundImage: 'linear-gradient(to right, transparent, rgba(150,150,150,0.1), transparent)',
               backgroundSize: '200% 100%' 
             }}
        />
      )}

      {/* --- PHYSIOLOGICAL LAYERS --- */}

      {isHighThreat && (
        <div className={`absolute inset-0 pointer-events-none z-20 bg-[radial-gradient(circle,transparent_50%,rgba(74,4,4,0.5)_120%)] mix-blend-multiply ${isCriticalThreat ? 'animate-heartbeat-fast' : 'animate-heartbeat'}`}></div>
      )}
      
      {isNightmareLocation && (
         <div className="absolute inset-0 pointer-events-none z-10 bg-[radial-gradient(circle,transparent_30%,rgba(0,0,0,0.8)_100%)] opacity-60"></div>
      )}

    </div>
  );
};