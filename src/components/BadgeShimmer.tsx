'use client';

import { useEffect, useState, useRef, ReactNode, CSSProperties } from 'react';

/**
 * BadgeShimmer - Premium Holographic Shimmer Effect
 * 
 * Inspired by:
 * - Holographic trading cards (Pokémon, sports cards)
 * - Credit card security features
 * - Apple's Dynamic Island highlights
 * - Premium membership badges
 * 
 * Creates a traveling light streak that moves across badges,
 * giving them a premium "holographic" quality. Perfect for
 * beat/miss badges to make successful results feel special.
 * 
 * The shimmer appears periodically on hover or on a timer,
 * creating subtle visual interest without being distracting.
 * 
 * Usage:
 * <BadgeShimmer variant="success">
 *   <span className="badge-beat">BEAT +5.2%</span>
 * </BadgeShimmer>
 */

type ShimmerVariant = 'success' | 'danger' | 'warning' | 'info' | 'rainbow';
type ShimmerTrigger = 'hover' | 'auto' | 'both';

interface BadgeShimmerProps {
  children: ReactNode;
  /** Color variant */
  variant?: ShimmerVariant;
  /** When to trigger the shimmer */
  trigger?: ShimmerTrigger;
  /** Interval between auto shimmers (ms) */
  interval?: number;
  /** Duration of shimmer animation (ms) */
  duration?: number;
  /** Shimmer angle (degrees) */
  angle?: number;
  /** Shimmer width as percentage of element */
  width?: number;
  /** Shimmer intensity (0-1) */
  intensity?: number;
  /** Initial delay before first auto shimmer (ms) */
  delay?: number;
  /** Disable shimmer effect */
  disabled?: boolean;
  /** Additional class */
  className?: string;
}

// Shimmer colors by variant
const shimmerColors: Record<ShimmerVariant, { primary: string; secondary: string }> = {
  success: {
    primary: 'rgba(74, 222, 128, 0.8)',  // green-400
    secondary: 'rgba(134, 239, 172, 0.6)', // green-300
  },
  danger: {
    primary: 'rgba(248, 113, 113, 0.8)',  // red-400
    secondary: 'rgba(254, 202, 202, 0.6)', // red-200
  },
  warning: {
    primary: 'rgba(251, 191, 36, 0.8)',   // amber-400
    secondary: 'rgba(253, 224, 71, 0.6)',  // yellow-300
  },
  info: {
    primary: 'rgba(96, 165, 250, 0.8)',   // blue-400
    secondary: 'rgba(147, 197, 253, 0.6)', // blue-300
  },
  rainbow: {
    primary: 'rgba(168, 85, 247, 0.7)',   // purple-500
    secondary: 'rgba(236, 72, 153, 0.7)', // pink-500
  },
};

export function BadgeShimmer({
  children,
  variant = 'success',
  trigger = 'both',
  interval = 4000,
  duration = 600,
  angle = -15,
  width = 40,
  intensity = 0.7,
  delay = 0,
  disabled = false,
  className = '',
}: BadgeShimmerProps) {
  const [isShimmering, setIsShimmering] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const colors = shimmerColors[variant];

  // Trigger shimmer animation
  const triggerShimmer = () => {
    if (disabled || isShimmering) return;
    setIsShimmering(true);
    timeoutRef.current = setTimeout(() => {
      setIsShimmering(false);
    }, duration);
  };

  // Auto shimmer on interval
  useEffect(() => {
    if (disabled || (trigger !== 'auto' && trigger !== 'both')) return;

    // Initial delay
    const initialTimeout = setTimeout(() => {
      triggerShimmer();
      
      // Start interval
      intervalRef.current = setInterval(() => {
        if (!isHovered || trigger === 'auto') {
          triggerShimmer();
        }
      }, interval);
    }, delay);

    return () => {
      clearTimeout(initialTimeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [disabled, trigger, interval, delay, isHovered]);

  // Trigger on hover
  const handleMouseEnter = () => {
    setIsHovered(true);
    if ((trigger === 'hover' || trigger === 'both') && !disabled) {
      triggerShimmer();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Respect reduced motion
  const prefersReducedMotion = typeof window !== 'undefined' 
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  if (disabled || prefersReducedMotion) {
    return <span className={className}>{children}</span>;
  }

  return (
    <span
      ref={containerRef}
      className={`badge-shimmer-container ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        '--shimmer-angle': `${angle}deg`,
        '--shimmer-width': `${width}%`,
        '--shimmer-duration': `${duration}ms`,
        '--shimmer-intensity': intensity,
        '--shimmer-primary': colors.primary,
        '--shimmer-secondary': colors.secondary,
      } as CSSProperties}
    >
      {children}
      <span 
        className={`badge-shimmer-streak ${isShimmering ? 'is-active' : ''}`}
        aria-hidden="true"
      />
    </span>
  );
}

// Variant: Continuous subtle shimmer (always on)
export function BadgeGlint({
  children,
  variant = 'success',
  speed = 3000,
  className = '',
}: {
  children: ReactNode;
  variant?: ShimmerVariant;
  speed?: number;
  className?: string;
}) {
  const colors = shimmerColors[variant];
  
  const prefersReducedMotion = typeof window !== 'undefined' 
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return <span className={className}>{children}</span>;
  }

  return (
    <span
      className={`badge-glint-container ${className}`}
      style={{
        '--glint-speed': `${speed}ms`,
        '--glint-primary': colors.primary,
        '--glint-secondary': colors.secondary,
      } as CSSProperties}
    >
      {children}
      <span className="badge-glint-line" aria-hidden="true" />
    </span>
  );
}

// Variant: Edge glow that pulses
export function BadgeEdgeGlow({
  children,
  variant = 'success',
  pulseSpeed = 2000,
  glowSize = 3,
  className = '',
}: {
  children: ReactNode;
  variant?: ShimmerVariant;
  pulseSpeed?: number;
  glowSize?: number;
  className?: string;
}) {
  const colors = shimmerColors[variant];
  
  const prefersReducedMotion = typeof window !== 'undefined' 
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return <span className={className}>{children}</span>;
  }

  return (
    <span
      className={`badge-edge-glow-container ${className}`}
      style={{
        '--edge-glow-speed': `${pulseSpeed}ms`,
        '--edge-glow-size': `${glowSize}px`,
        '--edge-glow-color': colors.primary,
      } as CSSProperties}
    >
      {children}
    </span>
  );
}
