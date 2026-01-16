
import React from 'react';
import { GridLayout, GridCell } from '../types';
import { User, Skull, AlertTriangle, Box, Ghost } from 'lucide-react';

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
            gap: '2px',
            aspectRatio: `${width}/${height}`
        }} 
        className="w-full relative z-10"
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
  let bgClass = "bg-gray-900/40"; 
  let content = null;
  let borderClass = "border-transparent";

  // 1. Terrain Styling
  switch (cell.type) {
    case 'Wall':
      bgClass = "bg-gray-800 shadow-inner";
      borderClass = "border-gray-700/50";
      // Diagonal hatch pattern for walls using CSS gradient simulation logic (simplified here)
      break;
    case 'Void':
      bgClass = "bg-black"; 
      break;
    case 'Hazard':
      bgClass = "bg-red-900/10";
      borderClass = "border-red-900/30";
      content = <AlertTriangle className="w-3 h-3 text-red-600 opacity-60" />;
      break;
    case 'Cover':
      bgClass = "bg-amber-900/10";
      borderClass = "border-amber-900/30";
      content = <Box className="w-3 h-3 text-amber-600 opacity-60" />;
      break;
    case 'Floor':
    default:
        // Minimal dot for floor
        content = <div className="w-0.5 h-0.5 rounded-full bg-gray-700/50" />;
        break;
  }

  // 2. Occupant Layer (Overrides Terrain visual if present)
  if (cell.occupant_id) {
    if (cell.occupant_id === 'Player') {
        content = <User className="w-4 h-4 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />;
        borderClass = "border-cyan-500/30";
        bgClass = "bg-cyan-900/20";
    } else if (cell.occupant_id.toLowerCase().includes('entity') || cell.occupant_id.toLowerCase().includes('killer') || cell.occupant_id.toLowerCase().includes('horror')) {
        content = <Skull className="w-4 h-4 text-red-500 animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" />;
        borderClass = "border-red-500/30";
        bgClass = "bg-red-900/20";
    } else {
        // NPC / Other
        content = <Ghost className="w-3.5 h-3.5 text-gray-400" />;
        borderClass = "border-gray-600/30";
    }
  }

  return (
    <div 
        className={`relative flex items-center justify-center rounded-[1px] transition-all duration-300 hover:z-20 border ${bgClass} ${borderClass} aspect-square group`}
    >
      {content}
      
      {/* Hover Info */}
      {(cell.description || cell.occupant_id) && (
          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black border border-gray-700 text-white text-[8px] px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-30 shadow-xl font-mono tracking-wide">
              {cell.occupant_id ? <span className="text-cyan-400 font-bold block">{cell.occupant_id}</span> : null}
              {cell.description}
          </div>
      )}
    </div>
  );
};
