

import React from 'react';
import { ResponsiveContainer, RadialBarChart, RadialBar, Legend, Tooltip } from 'recharts';
import { ClusterWeights } from '../types';
import { cleanPercentage } from '../utils';

interface ClusterRadarProps {
  weights: ClusterWeights;
}

export const ClusterRadar: React.FC<ClusterRadarProps> = ({ weights }) => {
  const data = [
    {
      name: 'Flesh',
      value: cleanPercentage(weights['Cluster 1 (Flesh)']),
      fill: '#880808', // Blood Red
    },
    {
      name: 'System',
      value: cleanPercentage(weights['Cluster 2 (System)']),
      fill: '#10b981', // System Green
    },
    {
      name: 'Haunt',
      value: cleanPercentage(weights['Cluster 3 (Haunting)']),
      fill: '#b45309', // Decay Gold
    },
    {
      name: 'Self',
      value: cleanPercentage(weights['Cluster 4 (Self)']),
      fill: '#6366f1', // Psychological Indigo
    },
    {
      name: 'Blasphemy',
      value: cleanPercentage(weights['Cluster 5 (Blasphemy)']),
      fill: '#9333ea', // Ritual Purple
    },
    {
      name: 'Survival',
      value: cleanPercentage(weights['Cluster 6 (Survival)']),
      fill: '#06b6d4', // Ice Cyan
    },
  ];

  return (
    <div className="w-full h-64 bg-black/50 border border-gray-800 rounded-sm p-2 relative overflow-hidden">
      <div className="absolute top-2 left-2 text-xs font-mono text-gray-500 uppercase tracking-widest z-10">
        Thematic Resonance
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart 
          cx="50%" 
          cy="50%" 
          innerRadius="20%" 
          outerRadius="90%" 
          barSize={15} 
          data={data}
          startAngle={180} 
          endAngle={0}
        >
          <RadialBar
            label={{ position: 'insideStart', fill: '#fff', fontSize: 10 }}
            background
            dataKey="value"
          />
          <Legend 
            iconSize={8} 
            layout="vertical" 
            verticalAlign="middle" 
            wrapperStyle={{ right: 0, top: 0, bottom: 0, fontSize: '10px', fontFamily: 'monospace' }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#000', border: '1px solid #333', fontSize: '12px' }}
            itemStyle={{ color: '#ccc' }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
};