'use client';

import { useState, useEffect, useRef, memo } from 'react';

/**
 * ResultPulse — Expanding ring animation for earnings result reveals.
 * 
 * Inspired by:
 * - Radar ping / sonar effects
 * - iOS notification ripples
 * - Achievement unlock animations
 * - Medical monitor alert pulses
 * 
 * Creates a satisfying "announcement" effect when earnings results
 * are first revealed. The pulse expands outward from the result badge
 * with color and intensity matching the result type (beat/miss).
 * 
 * Key Features:
 * - Single burst animation (not looping)
 * - Color-coded for beat (green) vs miss (red)
 * - Intensity scales with surprise magnitude
 * - Staggered multi-ring effect for dramatic reveals
 * - Respects prefers-reduced-motion
 * 
 * Usage:
 * <ResultPulse result="beat" surprise={15.5} trigger={justReported} />
 */

type ResultType = 'beat' | 'miss' | 'meet';

interface ResultPulseProps {
  /** The result type - determines color */
  result: ResultType;
  /** Surprise percentage - determines intensity (0-100+) */
  surprise?: number;
  /** Trigger the pulse animation */
  trigger: boolean;
  /** Number of concentric rings (default: 3) */
  rings?: number;
  /** Duration of animation in ms (default: 1200) */
  duration?: number;
  /** Maximum ring expansion radius in px (default: 80) */
  maxRadius?: number;
  /** Additional className */
  className?: string;
  /** Callback when animation completes */
  onComplete?: () => void;
}

// Color presets for each result type
const RESULT_COLORS: Record<ResultType, { primary: string; glow: string }> = {
  beat: {
    primary: 'rgba(34, 197, 94, 0.8)',  // Green
    glow: 'rgba(34, 197, 94, 0.3)',
  },
  miss: {
    primary: 'rgba(239, 68, 68, 0.8)',   // Red
    glow: 'rgba(239, 68, 68, 0.3)',
  },
  meet: {
    primary: 'rgba(251, 191, 36, 0.8)',  // Amber
    glow: 'rgba(251, 191, 36, 0.3)',
  },
};

// Calculate intensity multiplier from surprise percentage
function getIntensity(surprise: number = 0): number {
  const absSuprise = Math.abs(surprise);
  if (absSuprise >= 20) return 1.5;  // Monster beat/miss
  if (absSuprise >= 10) return 1.2;  // Significant
  if (absSuprise >= 5) return 1.0;   // Normal
  return 0.7;                         // Minor
}

export const ResultPulse = memo(function ResultPulse({
  result,
  surprise = 0,
  trigger,
  rings = 3,
  duration = 1200,
  maxRadius = 80,
  className = '',
  onComplete,
}: ResultPulseProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useRef(false);

  // Check reduced motion preference
  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
  }, []);

  // Trigger animation when trigger changes from false to true
  useEffect(() => {
    if (trigger && !hasTriggered && !prefersReducedMotion.current) {
      setHasTriggered(true);
      setIsAnimating(true);

      // End animation after duration
      const timer = setTimeout(() => {
        setIsAnimating(false);
        onComplete?.();
      }, duration + 200); // Add buffer for final fade

      return () => clearTimeout(timer);
    }
  }, [trigger, hasTriggered, duration, onComplete]);

  // Reset when trigger becomes false
  useEffect(() => {
    if (!trigger) {
      setHasTriggered(false);
    }
  }, [trigger]);

  if (!isAnimating) return null;

  const colors = RESULT_COLORS[result];
  const intensity = getIntensity(surprise);
  const effectiveRadius = maxRadius * intensity;

  return (
    <div
      ref={containerRef}
      className={`result-pulse ${className}`}
      aria-hidden="true"
      style={{
        '--pulse-color': colors.primary,
        '--pulse-glow': colors.glow,
        '--pulse-duration': `${duration}ms`,
        '--pulse-radius': `${effectiveRadius}px`,
        '--pulse-intensity': intensity,
      } as React.CSSProperties}
    >
      {Array.from({ length: rings }).map((_, index) => (
        <div
          key={index}
          className="result-pulse-ring"
          style={{
            '--ring-delay': `${index * (duration / rings / 2)}ms`,
            '--ring-index': index,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
});

/**
 * ResultPulseWrapper — Convenience wrapper that manages trigger state
 * based on data changes. Automatically pulses when result goes from
 * undefined to defined.
 */
interface ResultPulseWrapperProps {
  result?: 'beat' | 'miss' | 'meet';
  surprise?: number;
  children: React.ReactNode;
  className?: string;
}

export function ResultPulseWrapper({
  result,
  surprise,
  children,
  className = '',
}: ResultPulseWrapperProps) {
  const [shouldPulse, setShouldPulse] = useState(false);
  const prevResult = useRef<string | undefined>(undefined);

  // Detect when result changes from undefined to defined
  useEffect(() => {
    if (result && !prevResult.current) {
      setShouldPulse(true);
      // Reset after a frame to allow re-triggering
      const timer = setTimeout(() => setShouldPulse(false), 100);
      return () => clearTimeout(timer);
    }
    prevResult.current = result;
  }, [result]);

  return (
    <div className={`result-pulse-wrapper ${className}`}>
      {children}
      {result && (
        <ResultPulse
          result={result}
          surprise={surprise}
          trigger={shouldPulse}
        />
      )}
    </div>
  );
}

/**
 * useResultPulse — Hook for manual pulse control
 */
export function useResultPulse() {
  const [trigger, setTrigger] = useState(false);
  
  const pulse = () => {
    setTrigger(false);
    // Use requestAnimationFrame to ensure state change is processed
    requestAnimationFrame(() => {
      setTrigger(true);
    });
  };

  const reset = () => setTrigger(false);

  return { trigger, pulse, reset };
}

export default ResultPulse;
