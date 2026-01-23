
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Sparkles, Cpu, Terminal } from 'lucide-react';

interface ThinkingExpanderProps {
    stream: string;
    phase: 'logic' | 'narrative';
    defaultExpanded?: boolean;
    className?: string;
}

export const ThinkingExpander: React.FC<ThinkingExpanderProps> = ({ 
    stream, 
    phase, 
    defaultExpanded = false,
    className = "" 
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const [currentStep, setCurrentStep] = useState("Initializing...");
    const contentRef = useRef<HTMLDivElement>(null);

    // Auto-scroll the content when stream updates if expanded
    useEffect(() => {
        if (isExpanded && contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [stream, isExpanded]);

    // Parse stream to update the header "status" text
    useEffect(() => {
        if (!stream) return;
        const lines = stream.trim().split('\n');
        if (lines.length > 0) {
            const lastLine = lines[lines.length - 1].trim();
            // Filter out JSON brackets or extremely long dumps for the status text
            if (lastLine.length < 60 && !lastLine.startsWith('{') && !lastLine.startsWith('}')) {
                setCurrentStep(lastLine);
            } else {
                setCurrentStep(phase === 'logic' ? "Analyzing constraints..." : "Synthesizing prose...");
            }
        }
    }, [stream, phase]);

    const getIcon = () => {
        if (phase === 'logic') return <Cpu className="w-4 h-4 text-indigo-400" />;
        return <Sparkles className="w-4 h-4 text-purple-400" />;
    };

    const getColors = () => {
        if (phase === 'logic') return "border-indigo-500/30 text-indigo-400";
        return "border-purple-500/30 text-purple-400";
    };

    return (
        <div className={`w-full max-w-3xl mx-auto my-6 rounded-sm border bg-[#0a0a0a] overflow-hidden transition-all duration-300 shadow-lg ${getColors()} ${className}`}>
            {/* Header */}
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-3 bg-gray-900/40 hover:bg-gray-900/80 transition-colors group relative"
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className="relative p-1.5 rounded-full bg-black/50 border border-gray-800">
                        {getIcon()}
                    </div>
                    <div className="flex flex-col items-start min-w-0">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 group-hover:text-gray-300 transition-colors">
                            The Machine is Thinking
                        </span>
                        <span className="text-xs font-mono truncate w-full animate-pulse opacity-80">
                            {'>'} {currentStep}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3 pr-2">
                    {/* Fake Loading Bar */}
                    <div className="hidden sm:flex gap-0.5">
                        {[1,2,3].map(i => (
                            <div key={i} className="w-1 h-3 bg-current opacity-20 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                        ))}
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 opacity-50" /> : <ChevronDown className="w-4 h-4 opacity-50" />}
                </div>
                
                {/* Progress Bar Line */}
                <div className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-current to-transparent w-full opacity-30 animate-pulse"></div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
                <div 
                    ref={contentRef}
                    className="p-4 border-t border-gray-800 bg-black/80 font-mono text-[10px] text-gray-400 max-h-64 overflow-y-auto custom-scrollbar whitespace-pre-wrap leading-relaxed relative"
                >
                    <div className="absolute top-2 right-4 text-[8px] uppercase tracking-widest opacity-30 select-none">
                        /// LOG_STREAM_ACTIVE
                    </div>
                    {stream}
                    <span className="animate-pulse inline-block w-1.5 h-3 bg-current ml-1 align-middle"></span>
                </div>
            )}
        </div>
    );
};
