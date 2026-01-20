
import { useEffect, useRef } from 'react';
import { GameState } from '../types';

interface AutoPilotConfig {
  active: boolean;
  remainingCycles: number;
}

interface UseAutoPilotProps {
  config: AutoPilotConfig;
  gameState: GameState;
  isLoading: boolean;
  isInitialized: boolean;
  onTrigger: () => Promise<void>;
  onStop: () => void;
  onDecrement: () => void;
}

export const useAutoPilot = ({
  config,
  isLoading,
  isInitialized,
  onTrigger,
  onStop,
  onDecrement
}: UseAutoPilotProps) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const configRef = useRef(config);

  // Keep ref synced to avoid stale closures in the timeout
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    // 1. Clear any existing timer immediately if dependencies change
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // 2. Safety Checks: Must be active, initialized, and NOT loading
    if (!config.active || config.remainingCycles <= 0 || !isInitialized || isLoading) {
      // If we ran out of cycles, strictly turn it off
      if (config.active && config.remainingCycles <= 0) {
        onStop();
      }
      return;
    }

    // 3. Set Timer
    timeoutRef.current = setTimeout(async () => {
      // CRITICAL: Double-check "Lock" inside the callback
      // If user clicked send 1ms ago, isLoading might not have flushed yet in this closure,
      // but if we are unmounted or changed, the cleanup would have killed this timeout.
      
      // Execute Turn
      try {
        await onTrigger();
        onDecrement();
      } catch (e) {
        console.error("Auto-Pilot Execution Failed", e);
        onStop();
      }
    }, 3500); // 3.5s delay for pacing

    // 4. Cleanup on unmount or dependency change (e.g. user actions set isLoading=true)
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [config.active, config.remainingCycles, isLoading, isInitialized, onTrigger, onStop, onDecrement]);

  return {};
};
