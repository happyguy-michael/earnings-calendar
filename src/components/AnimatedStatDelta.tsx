'use client';

import { useEffect, useState, useRef, ReactNode, memo, CSSProperties } from 'react';

/**
 * AnimatedStatDelta - Flying delta indicator when values change
 * 
 * Shows the change amount (+5, -3) with a small animated indicator that
 * flies up/down from the number and fades out. Inspired by gaming UIs,
 * financial dashboards, and 2026's "kinetic feedback" trend.
 * 
 * Features:
 * - Direction-aware animation (increase flies up, decrease flies down)
 * - Color-coded feedback (green for increase, red for decrease)
 * - Configurable fly distance and duration
 * - Optional glow effect for emphasis
 * - Stacks multiple rapid changes (shows cumulative delta)
 * - Respects prefers-reduced-motion
 * - GPU-accelerated with will-change hints
 * 
 * Inspiration:
 * - Video game damage/heal numbers
 * - Stock ticker change indicators
 * - Figma's collaborative cursor labels
 * - Apple's Dynamic Island value transitions
 * - 2026 "Kinetic Feedback" design trend
 * 
 * @example
 * // Basic usage - wraps any numeric display
 * <AnimatedStatDelta value={totalEarnings}>
 *   <span className="text-3xl font-bold">{totalEarnings}</span>
 * </AnimatedStatDelta>
 * 
 * @example
 * // With custom styling
 * <AnimatedStatDelta 
 *   value={beatRate} 
 *   suffix="%" 
 *   showSign={true}
 *   glow={true}
 *   flyDistance={40}
 * >
 *   <CountUp value={beatRate} />%
 * </AnimatedStatDelta>
 */

interface DeltaParticle {
  id: number;
  delta: number;
  direction: 'up' | 'down';
  timestamp: number;
}

interface AnimatedStatDeltaProps {
  /** The numeric value to track for changes */
  value: number;
  /** Content to wrap (the main number display) */
  children: ReactNode;
  /** Skip animation on initial render */
  skipInitial?: boolean;
  /** Duration of the fly animation in ms */
  duration?: number;
  /** Distance the delta flies in pixels */
  flyDistance?: number;
  /** Show + sign for positive changes */
  showSign?: boolean;
  /** Suffix to append (e.g., "%" or "pts") */
  suffix?: string;
  /** Prefix to prepend (e.g., "$") */
  prefix?: string;
  /** Enable glow effect on the flying number */
  glow?: boolean;
  /** Font size of the delta (default: 0.75em) */
  fontSize?: string;
  /** Custom class name */
  className?: string;
  /** Position relative to content */
  position?: 'top-right' | 'top-left' | 'top-center' | 'inline-right' | 'inline-left';
  /** Debounce rapid changes (ms) - combines deltas within this window */
  debounce?: number;
  /** Maximum number of simultaneous particles */
  maxParticles?: number;
  /** Reverse color (decrease = good, increase = bad) */
  reverseColors?: boolean;
  /** Custom inline styles */
  style?: CSSProperties;
  /** Callback when delta is shown */
  onDelta?: (delta: number, direction: 'up' | 'down') => void;
}

function AnimatedStatDeltaComponent({
  value,
  children,
  skipInitial = true,
  duration = 800,
  flyDistance = 30,
  showSign = true,
  suffix = '',
  prefix = '',
  glow = true,
  fontSize = '0.7em',
  className = '',
  position = 'top-right',
  debounce = 100,
  maxParticles = 5,
  reverseColors = false,
  style,
  onDelta,
}: AnimatedStatDeltaProps) {
  const [particles, setParticles] = useState<DeltaParticle[]>([]);
  const prevValueRef = useRef<number>(value);
  const isInitialRef = useRef(true);
  const pendingDeltaRef = useRef<number>(0);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const particleIdRef = useRef(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Track value changes and spawn particles
  useEffect(() => {
    // Skip initial render if configured
    if (isInitialRef.current) {
      isInitialRef.current = false;
      if (skipInitial) {
        prevValueRef.current = value;
        return;
      }
    }

    // Calculate delta
    const delta = value - prevValueRef.current;
    
    if (delta === 0) return;

    // Accumulate delta for debouncing
    pendingDeltaRef.current += delta;
    prevValueRef.current = value;

    // Clear existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce to combine rapid changes
    debounceTimeoutRef.current = setTimeout(() => {
      const finalDelta = pendingDeltaRef.current;
      if (finalDelta === 0) return;

      const direction: 'up' | 'down' = finalDelta > 0 ? 'up' : 'down';
      
      // Create new particle
      const newParticle: DeltaParticle = {
        id: particleIdRef.current++,
        delta: finalDelta,
        direction,
        timestamp: Date.now(),
      };

      // Add particle, respecting max limit
      setParticles(prev => {
        const updated = [...prev, newParticle];
        return updated.slice(-maxParticles);
      });

      // Callback
      onDelta?.(finalDelta, direction);

      // Reset pending delta
      pendingDeltaRef.current = 0;

      // Remove particle after animation completes
      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== newParticle.id));
      }, duration);
    }, debounce);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [value, skipInitial, debounce, duration, maxParticles, onDelta]);

  // Format delta for display
  const formatDelta = (delta: number): string => {
    const sign = delta > 0 && showSign ? '+' : '';
    const absValue = Math.abs(delta);
    // Format with reasonable precision
    const formatted = Number.isInteger(absValue) 
      ? absValue.toString() 
      : absValue.toFixed(1);
    return `${sign}${prefix}${formatted}${suffix}`;
  };

  // Position styles
  const positionStyles: Record<string, CSSProperties> = {
    'top-right': { 
      position: 'absolute', 
      top: '-0.25em', 
      right: '-0.5em',
      transformOrigin: 'bottom center',
    },
    'top-left': { 
      position: 'absolute', 
      top: '-0.25em', 
      left: '-0.5em',
      transformOrigin: 'bottom center',
    },
    'top-center': { 
      position: 'absolute', 
      top: '-0.25em', 
      left: '50%',
      transform: 'translateX(-50%)',
      transformOrigin: 'bottom center',
    },
    'inline-right': { 
      position: 'relative',
      marginLeft: '0.25em',
      display: 'inline-block',
      transformOrigin: 'left center',
    },
    'inline-left': { 
      position: 'relative',
      marginRight: '0.25em',
      display: 'inline-block',
      transformOrigin: 'right center',
    },
  };

  // Don't render particles if reduced motion
  if (prefersReducedMotion) {
    return (
      <span className={`stat-delta-wrapper ${className}`} style={style}>
        {children}
      </span>
    );
  }

  const isInline = position.startsWith('inline');

  return (
    <>
      <style jsx>{`
        .stat-delta-wrapper {
          position: relative;
          display: inline-block;
        }
        
        .stat-delta-particle {
          pointer-events: none;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
          z-index: 10;
          will-change: transform, opacity;
          animation: deltaFly var(--duration) cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .stat-delta-particle.up {
          color: ${reverseColors ? '#ef4444' : '#22c55e'};
          --fly-direction: -1;
        }
        
        .stat-delta-particle.down {
          color: ${reverseColors ? '#22c55e' : '#ef4444'};
          --fly-direction: 1;
        }
        
        .stat-delta-particle.glow.up {
          text-shadow: 
            0 0 8px ${reverseColors ? 'rgba(239, 68, 68, 0.6)' : 'rgba(34, 197, 94, 0.6)'},
            0 0 16px ${reverseColors ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'};
        }
        
        .stat-delta-particle.glow.down {
          text-shadow: 
            0 0 8px ${reverseColors ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)'},
            0 0 16px ${reverseColors ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
        }
        
        @keyframes deltaFly {
          0% {
            opacity: 0;
            transform: translateY(0) scale(0.5);
          }
          15% {
            opacity: 1;
            transform: translateY(calc(var(--fly-direction) * var(--fly-distance) * 0.15)) scale(1.1);
          }
          30% {
            opacity: 1;
            transform: translateY(calc(var(--fly-direction) * var(--fly-distance) * 0.3)) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(calc(var(--fly-direction) * var(--fly-distance))) scale(0.8);
          }
        }
        
        /* Inline variant uses horizontal movement */
        .stat-delta-particle.inline {
          animation: deltaFlyInline var(--duration) cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        @keyframes deltaFlyInline {
          0% {
            opacity: 0;
            transform: translateX(0) scale(0.5);
          }
          15% {
            opacity: 1;
            transform: translateX(calc(var(--fly-direction) * 4px)) scale(1.1);
          }
          30% {
            opacity: 1;
            transform: translateX(calc(var(--fly-direction) * 8px)) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateX(calc(var(--fly-direction) * 16px)) scale(0.8);
          }
        }
        
        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .stat-delta-particle {
            animation: none;
            opacity: 0;
          }
        }
      `}</style>
      
      <span className={`stat-delta-wrapper ${className}`} style={style}>
        {children}
        
        {/* Delta particles */}
        {particles.map((particle) => (
          <span
            key={particle.id}
            className={`stat-delta-particle ${particle.direction} ${glow ? 'glow' : ''} ${isInline ? 'inline' : ''}`}
            style={{
              ...positionStyles[position],
              fontSize,
              '--duration': `${duration}ms`,
              '--fly-distance': `${flyDistance}px`,
            } as CSSProperties}
          >
            {formatDelta(particle.delta)}
          </span>
        ))}
      </span>
    </>
  );
}

// Memoize to prevent unnecessary re-renders
export const AnimatedStatDelta = memo(AnimatedStatDeltaComponent);

/**
 * useStatDelta - Hook to track deltas imperatively
 * Useful when you want to trigger deltas from events rather than value changes
 */
export function useStatDelta() {
  const [delta, setDelta] = useState<{ value: number; key: number } | null>(null);
  const keyRef = useRef(0);

  const showDelta = (value: number) => {
    keyRef.current += 1;
    setDelta({ value, key: keyRef.current });
    
    // Clear after animation
    setTimeout(() => setDelta(null), 1000);
  };

  return { delta, showDelta };
}

/**
 * StatDeltaBadge - Standalone delta badge for manual placement
 */
interface StatDeltaBadgeProps {
  delta: number;
  visible: boolean;
  duration?: number;
  glow?: boolean;
  suffix?: string;
  showSign?: boolean;
  className?: string;
}

export const StatDeltaBadge = memo(function StatDeltaBadge({
  delta,
  visible,
  duration = 800,
  glow = true,
  suffix = '',
  showSign = true,
  className = '',
}: StatDeltaBadgeProps) {
  if (!visible) return null;
  
  const direction = delta >= 0 ? 'up' : 'down';
  const sign = delta > 0 && showSign ? '+' : '';
  const formatted = `${sign}${Math.abs(delta)}${suffix}`;
  
  return (
    <>
      <style jsx>{`
        .delta-badge {
          display: inline-flex;
          align-items: center;
          padding: 2px 6px;
          border-radius: 6px;
          font-size: 0.75em;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
          animation: badgePop ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        .delta-badge.up {
          color: #22c55e;
          background: rgba(34, 197, 94, 0.15);
        }
        
        .delta-badge.down {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.15);
        }
        
        .delta-badge.glow.up {
          box-shadow: 0 0 12px rgba(34, 197, 94, 0.3);
        }
        
        .delta-badge.glow.down {
          box-shadow: 0 0 12px rgba(239, 68, 68, 0.3);
        }
        
        @keyframes badgePop {
          0% {
            opacity: 0;
            transform: scale(0.5) translateY(4px);
          }
          30% {
            opacity: 1;
            transform: scale(1.1) translateY(0);
          }
          50% {
            transform: scale(1);
          }
          80% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: scale(0.9) translateY(-4px);
          }
        }
      `}</style>
      
      <span className={`delta-badge ${direction} ${glow ? 'glow' : ''} ${className}`}>
        {direction === 'up' ? '↑' : '↓'} {formatted}
      </span>
    </>
  );
});

export default AnimatedStatDelta;
