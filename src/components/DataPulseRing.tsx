'use client';

import { useState, useEffect, useCallback, useRef, ReactNode, CSSProperties } from 'react';

type PulseVariant = 'success' | 'error' | 'info' | 'warning' | 'neutral';

interface DataPulseRingProps {
  /** Content to wrap with pulse effect */
  children: ReactNode;
  /** Trigger pulse animation (pass changing value to trigger) */
  trigger?: unknown;
  /** Visual variant - affects ring color */
  variant?: PulseVariant;
  /** Number of pulse rings (1-4) */
  ringCount?: number;
  /** Duration of each ring expansion in ms */
  duration?: number;
  /** Max ring size as multiplier of element size */
  scale?: number;
  /** Stagger delay between rings in ms */
  stagger?: number;
  /** Ring thickness in px */
  thickness?: number;
  /** Whether to pulse on mount */
  pulseOnMount?: boolean;
  /** Whether pulse can be triggered by click */
  pulseOnClick?: boolean;
  /** Additional className */
  className?: string;
  /** Style override */
  style?: CSSProperties;
}

const VARIANT_COLORS: Record<PulseVariant, { ring: string; glow: string }> = {
  success: {
    ring: 'rgba(34, 197, 94, 0.6)',
    glow: 'rgba(34, 197, 94, 0.3)',
  },
  error: {
    ring: 'rgba(239, 68, 68, 0.6)',
    glow: 'rgba(239, 68, 68, 0.3)',
  },
  info: {
    ring: 'rgba(59, 130, 246, 0.6)',
    glow: 'rgba(59, 130, 246, 0.3)',
  },
  warning: {
    ring: 'rgba(245, 158, 11, 0.6)',
    glow: 'rgba(245, 158, 11, 0.3)',
  },
  neutral: {
    ring: 'rgba(156, 163, 175, 0.5)',
    glow: 'rgba(156, 163, 175, 0.2)',
  },
};

/**
 * DataPulseRing - Sonar-like pulse effect for data updates.
 * 
 * Creates expanding concentric rings that emanate from the element,
 * providing visual feedback that data has changed. Perfect for:
 * - Stat counters receiving new values
 * - Earnings results appearing
 * - Live data updates
 * - Notification badges
 * 
 * The effect is inspired by sonar/radar visualizations and creates
 * a premium "data arriving" feel. Multiple rings can stagger outward
 * for more dramatic effect.
 * 
 * Respects prefers-reduced-motion by showing a simple fade instead.
 * 
 * @example
 * // Basic usage - pulse on value change
 * <DataPulseRing trigger={value} variant="success">
 *   <span className="stat">{value}</span>
 * </DataPulseRing>
 * 
 * // Multiple rings with stagger
 * <DataPulseRing 
 *   trigger={data.updatedAt}
 *   variant="info"
 *   ringCount={3}
 *   stagger={150}
 * >
 *   <EarningsCard {...data} />
 * </DataPulseRing>
 * 
 * // Interactive pulse on click
 * <DataPulseRing pulseOnClick variant="neutral">
 *   <Button>Refresh</Button>
 * </DataPulseRing>
 */
export function DataPulseRing({
  children,
  trigger,
  variant = 'info',
  ringCount = 2,
  duration = 800,
  scale = 1.5,
  stagger = 100,
  thickness = 2,
  pulseOnMount = false,
  pulseOnClick = false,
  className = '',
  style,
}: DataPulseRingProps) {
  const [pulseKey, setPulseKey] = useState(0);
  const [isPulsing, setIsPulsing] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const prevTriggerRef = useRef<unknown>(trigger);
  const containerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clamp ring count
  const rings = Math.min(Math.max(ringCount, 1), 4);
  const colors = VARIANT_COLORS[variant];

  // Check reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Pulse on mount if requested
  useEffect(() => {
    if (pulseOnMount && !prefersReducedMotion) {
      // Small delay to ensure element is rendered
      const timer = setTimeout(() => triggerPulse(), 100);
      return () => clearTimeout(timer);
    }
  }, [pulseOnMount, prefersReducedMotion]);

  // Trigger pulse when trigger value changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (trigger !== prevTriggerRef.current) {
      prevTriggerRef.current = trigger;
      triggerPulse();
    }
  }, [trigger]);

  const triggerPulse = useCallback(() => {
    if (prefersReducedMotion) {
      // Simple fade for reduced motion
      setIsPulsing(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setIsPulsing(false), 400);
      return;
    }

    setPulseKey(k => k + 1);
    setIsPulsing(true);
    
    // Total animation time = duration + (stagger * (rings - 1)) + buffer
    const totalTime = duration + (stagger * (rings - 1)) + 100;
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsPulsing(false), totalTime);
  }, [duration, rings, stagger, prefersReducedMotion]);

  const handleClick = useCallback(() => {
    if (pulseOnClick) {
      triggerPulse();
    }
  }, [pulseOnClick, triggerPulse]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`data-pulse-container ${isPulsing ? 'is-pulsing' : ''} ${className}`}
      style={style}
      onClick={handleClick}
      data-variant={variant}
    >
      {/* Children content */}
      <div className="data-pulse-content">
        {children}
      </div>

      {/* Pulse rings - absolutely positioned behind content */}
      {!prefersReducedMotion && (
        <div className="data-pulse-rings" aria-hidden="true" key={pulseKey}>
          {isPulsing && [...Array(rings)].map((_, i) => (
            <div
              key={i}
              className="data-pulse-ring"
              style={{
                '--ring-delay': `${i * stagger}ms`,
                '--ring-duration': `${duration}ms`,
                '--ring-scale': scale,
                '--ring-color': colors.ring,
                '--ring-glow': colors.glow,
                '--ring-thickness': `${thickness}px`,
              } as CSSProperties}
            />
          ))}
        </div>
      )}

      {/* Reduced motion: simple glow */}
      {prefersReducedMotion && isPulsing && (
        <div 
          className="data-pulse-glow-fallback"
          style={{ '--glow-color': colors.glow } as CSSProperties}
          aria-hidden="true"
        />
      )}

      <style jsx>{`
        .data-pulse-container {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .data-pulse-content {
          position: relative;
          z-index: 1;
        }

        .data-pulse-rings {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          z-index: 0;
        }

        .data-pulse-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: inherit;
          border: var(--ring-thickness) solid var(--ring-color);
          box-shadow: 
            0 0 8px var(--ring-glow),
            inset 0 0 4px var(--ring-glow);
          animation: dataPulseExpand var(--ring-duration) cubic-bezier(0.4, 0, 0.2, 1) forwards;
          animation-delay: var(--ring-delay);
          opacity: 0;
          transform: scale(1);
          will-change: transform, opacity;
        }

        @keyframes dataPulseExpand {
          0% {
            opacity: 0.8;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 0;
            transform: scale(var(--ring-scale));
          }
        }

        /* Reduced motion fallback */
        .data-pulse-glow-fallback {
          position: absolute;
          inset: -4px;
          border-radius: inherit;
          background: var(--glow-color);
          animation: dataPulseGlow 400ms ease-out forwards;
          pointer-events: none;
          z-index: 0;
        }

        @keyframes dataPulseGlow {
          0% {
            opacity: 0;
          }
          30% {
            opacity: 0.6;
          }
          100% {
            opacity: 0;
          }
        }

        /* Variant-specific enhancements */
        .data-pulse-container[data-variant="success"] .data-pulse-ring {
          filter: hue-rotate(0deg);
        }

        .data-pulse-container[data-variant="error"] .data-pulse-ring {
          filter: saturate(1.2);
        }

        .data-pulse-container[data-variant="info"] .data-pulse-ring {
          filter: brightness(1.1);
        }

        /* Light mode adjustments */
        @media (prefers-color-scheme: light) {
          .data-pulse-ring {
            box-shadow: 
              0 0 12px var(--ring-glow),
              inset 0 0 6px var(--ring-glow);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * DataPulseIndicator - Standalone pulse indicator dot.
 * 
 * A small pulsing dot that can be placed next to elements to show
 * "live" or "updating" status. Continuously pulses at a configurable
 * interval.
 */
interface DataPulseIndicatorProps {
  variant?: PulseVariant;
  size?: 'sm' | 'md' | 'lg';
  interval?: number;
  className?: string;
}

export function DataPulseIndicator({
  variant = 'info',
  size = 'md',
  interval = 2000,
  className = '',
}: DataPulseIndicatorProps) {
  const [pulseKey, setPulseKey] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const colors = VARIANT_COLORS[variant];
  const sizes = { sm: 6, md: 8, lg: 12 };
  const dotSize = sizes[size];

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    
    const timer = setInterval(() => {
      setPulseKey(k => k + 1);
    }, interval);
    
    return () => clearInterval(timer);
  }, [interval, prefersReducedMotion]);

  return (
    <span 
      className={`data-pulse-indicator ${className}`}
      style={{
        '--dot-size': `${dotSize}px`,
        '--dot-color': colors.ring,
        '--glow-color': colors.glow,
      } as CSSProperties}
      aria-hidden="true"
    >
      <span className="data-pulse-indicator-dot" />
      {!prefersReducedMotion && (
        <span className="data-pulse-indicator-ring" key={pulseKey} />
      )}

      <style jsx>{`
        .data-pulse-indicator {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: var(--dot-size);
          height: var(--dot-size);
        }

        .data-pulse-indicator-dot {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: var(--dot-color);
          box-shadow: 0 0 6px var(--glow-color);
        }

        .data-pulse-indicator-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1.5px solid var(--dot-color);
          animation: indicatorPulse 800ms ease-out forwards;
          opacity: 0;
        }

        @keyframes indicatorPulse {
          0% {
            opacity: 0.7;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(2.5);
          }
        }
      `}</style>
    </span>
  );
}

export default DataPulseRing;
