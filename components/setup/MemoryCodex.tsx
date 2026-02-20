import React from 'react';
import { useArchitectStore } from '../../store/architectStore';

export function MemoryCodex() {
    const facts = useArchitectStore(state => state.memory.facts);

    if (facts.length === 0) return null;

    return (
        <div className="border border-gray-800 bg-[#0a0a0a] p-4 text-xs font-mono mt-4">
            <h3 className="text-red-500/80 mb-2 uppercase tracking-widest border-b border-gray-800 pb-1">
                Data Extracted
            </h3>
            <ul className="space-y-2 text-gray-400">
                {facts.map((fact, index) => (
                    <li key={index} className="flex gap-2">
                        <span className="text-gray-600">&gt;</span> 
                        {fact}
                    </li>
                ))}
            </ul>
        </div>
    );
}
