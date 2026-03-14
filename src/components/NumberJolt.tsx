'use client';

import { useEffect, useRef, useState, ReactNode, memo, CSSProperties } from 'react';

/**
 * NumberJolt - Slot machine-style jolt animation on value change
 * 
 * Creates a brief horizontal shake + scale effect when the value changes,
 * mimicking the feel of a slot machine settling on a number. Adds energy
 * and excitement to stat cards, especially when filtering/searching.
 * 
 * Inspiration:
 * - Slot machine stopping animation
 * - Pinball score counters
 * - 2026 "Kinetic Typography" trend
 * - Ripplix guide: "Every action should respond within 100ms"
 * 
 * Features:
 * - Quick horizontal shake (3 oscillations)
 * - Subtle scale pop on settle
 * - Respects prefers-reduced-motion
 * - GPU-accelerated transforms
 * - Direction-aware: shake left for decrease, right for increase
 * - Optional haptic feedback integration
 * 
 * @example
 * <NumberJolt value={totalCount}>
 *   <span className="text-3xl font-bold">{totalCount}</span>
 * </NumberJolt>
 */

interface NumberJoltProps {
  /** The value to track for changes */
  value: number | string;
  /** Content to wrap with the jolt effect */
  children: ReactNode;
  /** Skip animation on initial render */
  skipInitial?: boolean;
  /** Duration of the jolt animation in ms */
  duration?: number;
  /** Intensity of the shake (pixels of movement) */
  intensity?: number;
  /** Number of shake oscillations */
  oscillations?: number;
  /** Scale factor at peak of animation */
  peakScale?: number;
  /** Enable direction-aware shake (increase = right, decrease = left) */
  directional?: boolean;
  /** Custom class name */
  className?: string;
  /** Trigger haptic feedback on jolt */
  haptic?: boolean;
  /** Custom inline styles */
  style?: CSSProperties;
}

function NumberJoltComponent({
  value,
  children,
  skipInitial = true,
  duration = 400,
  intensity = 4,
  oscillations = 3,
  peakScale = 1.05,
  directional = true,
  className = '',
  haptic = false,
  style,
}: NumberJoltProps) {
  const [isJolting, setIsJolting] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right' | 'neutral'>('neutral');
  const prevValueRef = useRef<number | string>(value);
  const isInitialRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Track value changes and trigger jolt
  useEffect(() => {
    // Skip initial render if configured
    if (isInitialRef.current) {
      isInitialRef.current = false;
      if (skipInitial) {
        prevValueRef.current = value;
        return;
      }
    }

    // Check if value changed
    if (prevValueRef.current !== value) {
      const numValue = typeof value === 'number' ? value : parseFloat(String(value));
      const numPrevValue = typeof prevValueRef.current === 'number' 
        ? prevValueRef.current 
        : parseFloat(String(prevValueRef.current));

      // Determine direction for directional shake
      if (directional && !isNaN(numValue) && !isNaN(numPrevValue)) {
        setDirection(numValue > numPrevValue ? 'right' : 'left');
      } else {
        setDirection('neutral');
      }

      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Trigger jolt animation
      setIsJolting(true);

      // Haptic feedback (if supported and enabled)
      if (haptic && 'vibrate' in navigator) {
        navigator.vibrate(15);
      }

      // End jolt after duration
      timeoutRef.current = setTimeout(() => {
        setIsJolting(false);
        setDirection('neutral');
      }, duration);

      prevValueRef.current = value;
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, skipInitial, duration, directional, haptic]);

  // Don't animate if reduced motion is preferred
  if (prefersReducedMotion) {
    return (
      <span className={className} style={style}>
        {children}
      </span>
    );
  }

  // Generate keyframes CSS for the jolt animation
  const generateKeyframes = () => {
    const frames: string[] = [];
    const startDir = direction === 'right' ? 1 : direction === 'left' ? -1 : 1;
    
    // Quick oscillating shake with decay
    for (let i = 0; i <= oscillations; i++) {
      const progress = i / oscillations;
      const oscillation = Math.sin(progress * Math.PI * 2) * (1 - progress);
      const offset = oscillation * intensity * startDir;
      const scale = i === 0 ? peakScale : 1 + (peakScale - 1) * (1 - progress) * 0.3;
      const percent = Math.round(progress * 100);
      
      frames.push(`${percent}% { transform: translateX(${offset}px) scale(${scale}); }`);
    }
    
    // Final settle
    frames.push('100% { transform: translateX(0) scale(1); }');
    
    return frames.join('\n');
  };

  const animationName = `numberJolt-${direction}`;
  
  return (
    <>
      <style jsx>{`
        @keyframes ${animationName} {
          ${generateKeyframes()}
        }
        
        .number-jolt-active {
          animation: ${animationName} ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1);
          will-change: transform;
        }
      `}</style>
      
      <span 
        className={`number-jolt ${isJolting ? 'number-jolt-active' : ''} ${className}`}
        style={{
          display: 'inline-block',
          ...style,
        }}
      >
        {children}
      </span>
    </>
  );
}

// Memoize to prevent unnecessary re-renders
export const NumberJolt = memo(NumberJoltComponent);

/**
 * NumberJoltGroup - Apply jolt to multiple children that share the same value trigger
 */
interface NumberJoltGroupProps {
  value: number | string;
  children: ReactNode;
  className?: string;
  duration?: number;
  intensity?: number;
}

export const NumberJoltGroup = memo(function NumberJoltGroup({
  value,
  children,
  className = '',
  duration = 400,
  intensity = 4,
}: NumberJoltGroupProps) {
  return (
    <NumberJolt 
      value={value}
      duration={duration}
      intensity={intensity}
      className={className}
    >
      {children}
    </NumberJolt>
  );
});

/**
 * Utility hook to trigger jolts imperatively
 */
export function useNumberJolt(initialValue: number | string = 0) {
  const [value, setValue] = useState(initialValue);
  const counterRef = useRef(0);

  const triggerJolt = () => {
    counterRef.current += 1;
    setValue(counterRef.current);
  };

  return { joltKey: value, triggerJolt };
}

export default NumberJolt;
