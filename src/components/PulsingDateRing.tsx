'use client';

import { useEffect, useState, useRef } from 'react';

interface PulsingDateRingProps {
  /** Whether this is today's date (enables animation) */
  isToday: boolean;
  /** Ring size relative to content (1 = tight fit, 1.5 = looser) */
  ringScale?: number;
  /** Primary ring color */
  color?: string;
  /** Duration of one pulse cycle in ms */
  pulseDuration?: number;
  /** Time between pulses in ms */
  pulseInterval?: number;
  /** Number of concurrent pulse rings */
  rings?: 1 | 2 | 3;
  /** Ring stroke width in pixels */
  strokeWidth?: number;
  /** Stagger delay between multiple rings in ms */
  staggerDelay?: number;
  /** Whether to pause animation when not visible */
  pauseWhenHidden?: boolean;
  /** Animation variant */
  variant?: 'pulse' | 'breathe' | 'ripple' | 'orbit';
  /** Initial delay before animation starts */
  delay?: number;
  /** Additional className */
  className?: string;
  children: React.ReactNode;
}

/**
 * PulsingDateRing - Animated ring indicator for today's date
 * 
 * Provides visual emphasis on today's date in a calendar with subtle,
 * iOS-inspired pulsing animations. Multiple variants available:
 * - pulse: Rings expand outward and fade
 * - breathe: Subtle scale breathing effect
 * - ripple: Water droplet ripple effect
 * - orbit: Rotating gradient ring
 */
export function PulsingDateRing({
  isToday,
  ringScale = 1.4,
  color = 'rgba(34, 211, 238, 0.6)',
  pulseDuration = 2000,
  pulseInterval = 3000,
  rings = 2,
  strokeWidth = 2,
  staggerDelay = 400,
  pauseWhenHidden = true,
  variant = 'pulse',
  delay = 0,
  className = '',
  children,
}: PulsingDateRingProps) {
  const [isVisible, setIsVisible] = useState(!pauseWhenHidden);
  const [hasStarted, setHasStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Visibility observer for performance
  useEffect(() => {
    if (!pauseWhenHidden || !containerRef.current) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [pauseWhenHidden]);

  // Initial delay handling
  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setHasStarted(true), delay);
      return () => clearTimeout(timer);
    }
    setHasStarted(true);
  }, [delay]);

  // Respect reduced motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const shouldAnimate = isToday && isVisible && hasStarted && !prefersReducedMotion;

  // Generate ring elements based on variant
  const renderRings = () => {
    if (!shouldAnimate) return null;

    const ringElements = [];
    const ringCount = rings;

    for (let i = 0; i < ringCount; i++) {
      const ringDelay = i * staggerDelay;
      
      switch (variant) {
        case 'pulse':
          ringElements.push(
            <div
              key={i}
              className="pulsing-date-ring-element pulse-variant"
              style={{
                '--ring-color': color,
                '--ring-scale': ringScale,
                '--pulse-duration': `${pulseDuration}ms`,
                '--pulse-interval': `${pulseInterval}ms`,
                '--ring-delay': `${ringDelay}ms`,
                '--stroke-width': `${strokeWidth}px`,
                '--total-duration': `${pulseDuration + pulseInterval}ms`,
              } as React.CSSProperties}
            />
          );
          break;

        case 'breathe':
          // Single breathing ring - subtle scale oscillation
          if (i === 0) {
            ringElements.push(
              <div
                key="breathe"
                className="pulsing-date-ring-element breathe-variant"
                style={{
                  '--ring-color': color,
                  '--breathe-duration': `${pulseDuration}ms`,
                  '--stroke-width': `${strokeWidth}px`,
                } as React.CSSProperties}
              />
            );
          }
          break;

        case 'ripple':
          ringElements.push(
            <div
              key={i}
              className="pulsing-date-ring-element ripple-variant"
              style={{
                '--ring-color': color,
                '--ring-scale': ringScale + (i * 0.15),
                '--ripple-duration': `${pulseDuration}ms`,
                '--ripple-interval': `${pulseInterval}ms`,
                '--ring-delay': `${ringDelay}ms`,
                '--stroke-width': `${Math.max(1, strokeWidth - i * 0.5)}px`,
                '--total-duration': `${pulseDuration + pulseInterval}ms`,
              } as React.CSSProperties}
            />
          );
          break;

        case 'orbit':
          // Single orbiting gradient ring
          if (i === 0) {
            ringElements.push(
              <div
                key="orbit"
                className="pulsing-date-ring-element orbit-variant"
                style={{
                  '--ring-color': color,
                  '--orbit-duration': `${pulseDuration * 2}ms`,
                  '--stroke-width': `${strokeWidth}px`,
                } as React.CSSProperties}
              />
            );
          }
          break;
      }
    }

    return ringElements;
  };

  return (
    <div 
      ref={containerRef}
      className={`pulsing-date-ring-container ${className}`}
    >
      {/* Ring layer - positioned behind content */}
      <div className="pulsing-date-ring-layer" aria-hidden="true">
        {renderRings()}
      </div>
      
      {/* Content */}
      <div className="pulsing-date-ring-content">
        {children}
      </div>

      <style jsx>{`
        .pulsing-date-ring-container {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .pulsing-date-ring-layer {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .pulsing-date-ring-content {
          position: relative;
          z-index: 1;
        }

        .pulsing-date-ring-element {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: var(--stroke-width) solid transparent;
        }

        /* Pulse variant - rings expand outward and fade */
        .pulse-variant {
          border-color: var(--ring-color);
          opacity: 0;
          transform: scale(0.8);
          animation: pulseRing var(--total-duration) ease-out infinite;
          animation-delay: var(--ring-delay);
        }

        @keyframes pulseRing {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          10% {
            opacity: 0.7;
            transform: scale(1);
          }
          60% {
            opacity: 0;
            transform: scale(var(--ring-scale));
          }
          100% {
            opacity: 0;
            transform: scale(var(--ring-scale));
          }
        }

        /* Breathe variant - subtle scale breathing */
        .breathe-variant {
          border-color: var(--ring-color);
          opacity: 0.5;
          animation: breatheRing var(--breathe-duration) ease-in-out infinite;
        }

        @keyframes breatheRing {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.08);
          }
        }

        /* Ripple variant - water droplet effect */
        .ripple-variant {
          border-color: var(--ring-color);
          opacity: 0;
          transform: scale(0.7);
          animation: rippleRing var(--total-duration) cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
          animation-delay: var(--ring-delay);
        }

        @keyframes rippleRing {
          0% {
            opacity: 0;
            transform: scale(0.85);
            border-width: var(--stroke-width);
          }
          15% {
            opacity: 0.6;
            transform: scale(1);
          }
          70% {
            opacity: 0;
            transform: scale(var(--ring-scale));
            border-width: 1px;
          }
          100% {
            opacity: 0;
            transform: scale(var(--ring-scale));
          }
        }

        /* Orbit variant - rotating gradient ring */
        .orbit-variant {
          background: conic-gradient(
            from 0deg,
            transparent 0deg,
            var(--ring-color) 60deg,
            transparent 120deg
          );
          border: none;
          -webkit-mask: radial-gradient(
            farthest-side,
            transparent calc(100% - var(--stroke-width) - 1px),
            black calc(100% - var(--stroke-width)),
            black 100%,
            transparent 100%
          );
          mask: radial-gradient(
            farthest-side,
            transparent calc(100% - var(--stroke-width) - 1px),
            black calc(100% - var(--stroke-width)),
            black 100%,
            transparent 100%
          );
          animation: orbitRing var(--orbit-duration) linear infinite;
          opacity: 0.8;
        }

        @keyframes orbitRing {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Dark mode adjustments */
        @media (prefers-color-scheme: dark) {
          .pulse-variant,
          .breathe-variant,
          .ripple-variant {
            filter: brightness(1.2);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * TodayDateIndicator - Pre-configured variant for calendar day numbers
 * 
 * Wraps a date number with subtle pulsing effect for today's date
 */
export function TodayDateIndicator({
  isToday,
  children,
  variant = 'ripple',
  delay = 0,
}: {
  isToday: boolean;
  children: React.ReactNode;
  variant?: 'pulse' | 'breathe' | 'ripple' | 'orbit';
  delay?: number;
}) {
  return (
    <PulsingDateRing
      isToday={isToday}
      variant={variant}
      color="rgba(34, 211, 238, 0.5)"
      pulseDuration={2500}
      pulseInterval={2000}
      rings={2}
      strokeWidth={2}
      staggerDelay={500}
      delay={delay}
    >
      {children}
    </PulsingDateRing>
  );
}

/**
 * LiveIndicatorRing - For showing "live" or "now" status
 * 
 * More prominent animation for attention-grabbing indicators
 */
export function LiveIndicatorRing({
  isLive,
  children,
  color = 'rgba(239, 68, 68, 0.6)',
}: {
  isLive: boolean;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <PulsingDateRing
      isToday={isLive}
      variant="pulse"
      color={color}
      pulseDuration={1500}
      pulseInterval={1000}
      rings={3}
      strokeWidth={2}
      staggerDelay={300}
      ringScale={1.6}
    >
      {children}
    </PulsingDateRing>
  );
}

export default PulsingDateRing;
