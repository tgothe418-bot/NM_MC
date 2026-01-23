
import React from 'react';
import { GridLayout, GridCell } from '../types';
import { User, Skull, AlertTriangle, Box, Ghost, Zap } from 'lucide-react';

interface RoomGridProps {
  layout?: GridLayout;
  className?: string;
  showLabels?: boolean;
}

export const RoomGrid: React.FC<RoomGridProps> = ({ layout, className = "", showLabels = true }) => {
  if (!layout || !layout.cells || !Array.isArray(layout.cells) || layout.cells.length === 0) {
      return (
          <div className={`flex items-center justify-center p-8 border border-gray-800 bg-black/40 text-gray-600 font-mono text-xs uppercase tracking-widest ${className}`}>
              No Spatial Data
          </div>
      );
  }

  const { width, height, cells } = layout;

  return (
    <div className={`w-full bg-[#0a0a0a] p-4 rounded-sm border border-gray-800 relative group/grid ${className}`}>
      {/* CRT Scanline Effect Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none opacity-20"></div>
      
      {showLabels && (
        <div className="flex justify-between items-end mb-3 border-b border-gray-800 pb-2 relative z-10">
            <span className="text-[10px] font-mono text-system-green uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-system-green rounded-full animate-pulse"></span>
                LIDAR Scan
            </span>
            <span className="text-[9px] font-mono text-gray-600">{width}x{height} // EUCLIDEAN</span>
        </div>
      )}

      <div 
        style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`,
            gap: '1px',
            aspectRatio: `${width}/${height}`
        }} 
        className="w-full relative z-10 border border-gray-800 bg-gray-900"
      >
        {cells.map((row, y) => {
          if (!Array.isArray(row)) {
             // Handle malformed data where rows are missing or flattened
             return null;
          }
          return row.map((cell, x) => (
            <GridTile key={`${x}-${y}`} cell={cell} />
          ));
        })}
      </div>
    </div>
  );
};

const GridTile: React.FC<{ cell: GridCell }> = ({ cell }) => {
  if (!cell) {
      return <div className="bg-black/50 aspect-square" />;
  }

  let bgClass = "bg-gray-900"; 
  let content = null;
  let borderClass = "";
  const typeLower = cell.type.toLowerCase();

  // 1. Terrain Styling
  if (typeLower === 'wall') {
      bgClass = "bg-gray-700 shadow-inner";
      // Diagonal stripe pattern for walls
      content = <div className="w-full h-full opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#000_2px,#000_4px)]" />;
  } else if (typeLower === 'void') {
      bgClass = "bg-black";
  } else if (typeLower === 'hazard') {
      bgClass = "bg-red-900/20";
      borderClass = "border border-red-900/30";
      content = <AlertTriangle className="w-3 h-3 text-red-600 opacity-80" />;
  } else if (typeLower === 'cover') {
      bgClass = "bg-amber-900/20";
      borderClass = "border border-amber-900/30";
      content = <Box className="w-3 h-3 text-amber-600 opacity-80" />;
  } else {
      // Floor (Default)
      bgClass = "bg-gray-800 hover:bg-gray-700 transition-colors";
      content = <div className="w-0.5 h-0.5 rounded-full bg-gray-600/50" />;
  }

  // 2. Occupant Layer (Overrides Terrain visual if present)
  if (cell.occupant_id) {
    const occLower = cell.occupant_id.toLowerCase();
    
    // Clear background to emphasize entity
    content = null;

    if (occLower === 'player' || occLower === 'you') {
        content = <User className="w-4 h-4 text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)] animate-pulse" />;
        bgClass = "bg-cyan-900/30";
        borderClass = "border border-cyan-500/50";
    } else if (occLower.includes('entity') || occLower.includes('killer') || occLower.includes('horror') || occLower.includes('villain')) {
        content = <Skull className="w-4 h-4 text-red-500 animate-pulse drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]" />;
        bgClass = "bg-red-900/30";
        borderClass = "border border-red-500/50";
    } else if (occLower.includes('anomaly') || occLower.includes('glitch')) {
        content = <Zap className="w-3.5 h-3.5 text-yellow-400 animate-spin" />;
        bgClass = "bg-yellow-900/30";
    } else {
        // NPC / Other
        content = <Ghost className="w-3.5 h-3.5 text-gray-300" />;
        bgClass = "bg-indigo-900/30";
        borderClass = "border border-indigo-500/30";
    }
  }

  return (
    <div 
        className={`relative flex items-center justify-center aspect-square transition-all duration-300 group overflow-hidden ${bgClass} ${borderClass}`}
        title={cell.occupant_id || cell.description || cell.type}
    >
      {content}
      
      {/* Tooltip Overlay */}
      {(cell.description || cell.occupant_id) && (
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 pointer-events-none" />
      )}
    </div>
  );
};
