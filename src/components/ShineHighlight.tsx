'use client';

import { useState, useEffect, useCallback, useRef, ReactNode, CSSProperties } from 'react';

interface ShineHighlightProps {
  /** Content to apply shine effect to */
  children: ReactNode;
  /** Trigger shine animation (pass changing value to trigger) */
  trigger?: unknown;
  /** Duration of shine sweep in ms (default: 600) */
  duration?: number;
  /** Shine color (default: white) */
  color?: string;
  /** Shine intensity 0-1 (default: 0.6) */
  intensity?: number;
  /** Angle of shine sweep in degrees (default: 120 - diagonal) */
  angle?: number;
  /** Whether to loop continuously */
  loop?: boolean;
  /** Loop interval in ms if loop is true (default: 3000) */
  loopInterval?: number;
  /** Additional className */
  className?: string;
  /** Style override */
  style?: CSSProperties;
}

/**
 * ShineHighlight - Sweeping shine effect to highlight changes.
 * 
 * Creates an elegant highlight effect where a bright shine sweeps
 * across the element, drawing attention to value changes. Perfect for:
 * - Stat counters when values update
 * - Badges when status changes
 * - Important notifications
 * - Premium accent on key metrics
 * 
 * The effect respects prefers-reduced-motion and can be triggered
 * by value changes or set to loop for persistent attention.
 * 
 * @example
 * // Trigger on value change
 * <ShineHighlight trigger={count}>
 *   <span>{count}</span>
 * </ShineHighlight>
 * 
 * // Looping attention-grabber
 * <ShineHighlight loop loopInterval={4000} color="#60a5fa">
 *   <Badge>NEW</Badge>
 * </ShineHighlight>
 */
export function ShineHighlight({
  children,
  trigger,
  duration = 600,
  color = 'white',
  intensity = 0.6,
  angle = 120,
  loop = false,
  loopInterval = 3000,
  className = '',
  style,
}: ShineHighlightProps) {
  const [isShining, setIsShining] = useState(false);
  const prevTriggerRef = useRef<unknown>(trigger);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);

  // Trigger shine when trigger value changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (trigger !== prevTriggerRef.current) {
      prevTriggerRef.current = trigger;
      setIsShining(true);
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setIsShining(false);
      }, duration);
    }
  }, [trigger, duration]);

  // Loop mode
  useEffect(() => {
    if (!loop) return;

    const interval = setInterval(() => {
      setIsShining(true);
      setTimeout(() => setIsShining(false), duration);
    }, loopInterval);

    // Trigger initial shine
    setIsShining(true);
    setTimeout(() => setIsShining(false), duration);

    return () => clearInterval(interval);
  }, [loop, loopInterval, duration]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Calculate gradient direction from angle
  const gradientDirection = `${angle}deg`;

  return (
    <>
      <div 
        className={`shine-highlight ${isShining ? 'shining' : ''} ${className}`}
        style={style}
      >
        {children}
        <div className="shine-overlay" aria-hidden="true" />
      </div>
      <style jsx>{`
        .shine-highlight {
          position: relative;
          display: inline-flex;
          overflow: hidden;
        }
        
        .shine-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            ${gradientDirection},
            transparent 0%,
            transparent 30%,
            rgba(${color === 'white' ? '255, 255, 255' : hexToRgb(color)}, ${intensity}) 50%,
            transparent 70%,
            transparent 100%
          );
          opacity: 0;
          transform: translateX(-100%);
        }
        
        .shine-highlight.shining .shine-overlay {
          animation: shine-sweep ${duration}ms ease-out forwards;
        }
        
        @keyframes shine-sweep {
          0% {
            opacity: 1;
            transform: translateX(-100%);
          }
          100% {
            opacity: 0;
            transform: translateX(100%);
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .shine-overlay {
            display: none;
          }
        }
      `}</style>
    </>
  );
}

/**
 * ShineText - Text with periodic shine effect for emphasis.
 */
export function ShineText({
  children,
  interval = 5000,
  duration = 800,
  color = 'white',
  className = '',
}: {
  children: ReactNode;
  interval?: number;
  duration?: number;
  color?: string;
  className?: string;
}) {
  return (
    <ShineHighlight
      loop
      loopInterval={interval}
      duration={duration}
      color={color}
      intensity={0.4}
      angle={110}
      className={className}
    >
      {children}
    </ShineHighlight>
  );
}

/**
 * ShineNumber - Number that shines when value changes.
 */
export function ShineNumber({
  value,
  format = (n) => String(n),
  duration = 600,
  color = '#60a5fa',
  className = '',
}: {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  color?: string;
  className?: string;
}) {
  return (
    <ShineHighlight
      trigger={value}
      duration={duration}
      color={color}
      intensity={0.5}
      angle={90}
      className={className}
    >
      <span>{format(value)}</span>
    </ShineHighlight>
  );
}

/**
 * ShineBadge - Badge with attention-grabbing shine loop.
 */
export function ShineBadge({
  children,
  variant = 'blue',
  interval = 4000,
  className = '',
}: {
  children: ReactNode;
  variant?: 'blue' | 'green' | 'purple' | 'gold' | 'white';
  interval?: number;
  className?: string;
}) {
  const colorMap = {
    blue: '#60a5fa',
    green: '#22c55e',
    purple: '#a78bfa',
    gold: '#fbbf24',
    white: 'white',
  };

  return (
    <ShineHighlight
      loop
      loopInterval={interval}
      duration={700}
      color={colorMap[variant]}
      intensity={0.5}
      angle={115}
      className={className}
    >
      {children}
    </ShineHighlight>
  );
}

// Helper to convert hex to rgb string
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
  }
  // Fallback for named colors or rgba
  return '255, 255, 255';
}

export default ShineHighlight;
