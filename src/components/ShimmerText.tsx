'use client';

import { useEffect, useState, useRef, ReactNode } from 'react';

interface ShimmerTextProps {
  children: ReactNode;
  /** Animation mode */
  mode?: 'continuous' | 'hover' | 'once' | 'interval';
  /** Duration of one shimmer pass in ms */
  duration?: number;
  /** Delay before starting (ms) */
  delay?: number;
  /** Interval between shimmers for 'interval' mode (ms) */
  interval?: number;
  /** Shimmer color (defaults to white with transparency) */
  shimmerColor?: string;
  /** Width of the shimmer band as percentage */
  shimmerWidth?: number;
  /** Angle of the shimmer in degrees */
  angle?: number;
  /** Additional CSS classes */
  className?: string;
  /** Whether shimmer is enabled */
  enabled?: boolean;
}

/**
 * ShimmerText - Premium text shimmer/shine effect
 * 
 * Creates a subtle light sweep effect across text, commonly seen in
 * premium UIs like Stripe, Linear, and Apple. Can be used for:
 * - Highlighting important text or CTAs
 * - Loading/skeleton text states
 * - Premium branding elements
 * - Attention-grabbing headlines
 * 
 * Features:
 * - Multiple trigger modes (continuous, hover, once, interval)
 * - Customizable shimmer color, width, and angle
 * - Respects prefers-reduced-motion
 * - Hardware-accelerated animation
 * - Theme-aware (adjusts for light/dark mode)
 * 
 * 2026 Trend: Subtle, premium micro-interactions
 */
export function ShimmerText({
  children,
  mode = 'hover',
  duration = 1200,
  delay = 0,
  interval = 5000,
  shimmerColor,
  shimmerWidth = 50,
  angle = 120,
  className = '',
  enabled = true,
}: ShimmerTextProps) {
  const [isShimmering, setIsShimmering] = useState(false);
  const [hasShimmered, setHasShimmered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Check for theme
  useEffect(() => {
    const checkTheme = () => {
      setIsLightMode(document.documentElement.classList.contains('light'));
    };
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    return () => observer.disconnect();
  }, []);

  // Handle different modes
  useEffect(() => {
    if (!enabled || prefersReducedMotion) return;

    if (mode === 'continuous') {
      setIsShimmering(true);
      return;
    }

    if (mode === 'once' && !hasShimmered) {
      const timer = setTimeout(() => {
        setIsShimmering(true);
        setHasShimmered(true);
        
        // Stop after one pass
        setTimeout(() => {
          setIsShimmering(false);
        }, duration);
      }, delay);
      
      return () => clearTimeout(timer);
    }

    if (mode === 'interval') {
      const runShimmer = () => {
        setIsShimmering(true);
        setTimeout(() => setIsShimmering(false), duration);
      };
      
      // Initial shimmer after delay
      const initialTimer = setTimeout(() => {
        runShimmer();
        // Set up interval for subsequent shimmers
        intervalRef.current = setInterval(runShimmer, interval);
      }, delay);
      
      return () => {
        clearTimeout(initialTimer);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [mode, enabled, prefersReducedMotion, delay, duration, interval, hasShimmered]);

  // Handle hover mode
  const handleMouseEnter = () => {
    if (mode === 'hover' && enabled && !prefersReducedMotion) {
      setIsShimmering(true);
    }
  };

  const handleMouseLeave = () => {
    if (mode === 'hover') {
      // Let the current shimmer complete before stopping
      setTimeout(() => setIsShimmering(false), duration);
    }
  };

  // Determine shimmer color based on theme
  const defaultShimmerColor = isLightMode 
    ? 'rgba(255, 255, 255, 0.9)' 
    : 'rgba(255, 255, 255, 0.4)';
  const activeShimmerColor = shimmerColor || defaultShimmerColor;

  // If reduced motion, just render children
  if (prefersReducedMotion || !enabled) {
    return <span className={className}>{children}</span>;
  }

  return (
    <span
      ref={containerRef}
      className={`shimmer-text-container ${isShimmering ? 'shimmer-active' : ''} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        '--shimmer-duration': `${duration}ms`,
        '--shimmer-color': activeShimmerColor,
        '--shimmer-width': `${shimmerWidth}%`,
        '--shimmer-angle': `${angle}deg`,
      } as React.CSSProperties}
    >
      <span className="shimmer-text-content">{children}</span>
      <span className="shimmer-text-shine" aria-hidden="true" />
      
      <style jsx>{`
        .shimmer-text-container {
          position: relative;
          display: inline-block;
          overflow: hidden;
        }
        
        .shimmer-text-content {
          position: relative;
          z-index: 1;
        }
        
        .shimmer-text-shine {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            var(--shimmer-angle),
            transparent 0%,
            transparent calc(50% - var(--shimmer-width) / 2),
            var(--shimmer-color) 50%,
            transparent calc(50% + var(--shimmer-width) / 2),
            transparent 100%
          );
          background-size: 200% 100%;
          background-position: 100% 0;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s ease;
          mix-blend-mode: overlay;
        }
        
        .shimmer-text-container.shimmer-active .shimmer-text-shine {
          opacity: 1;
          animation: shimmer-sweep var(--shimmer-duration) ease-in-out;
        }
        
        .shimmer-text-container.shimmer-active[style*="continuous"] .shimmer-text-shine {
          animation: shimmer-sweep var(--shimmer-duration) ease-in-out infinite;
        }
        
        @keyframes shimmer-sweep {
          0% {
            background-position: 100% 0;
          }
          100% {
            background-position: -100% 0;
          }
        }
        
        /* For continuous mode, use infinite animation */
        .shimmer-text-container[data-mode="continuous"].shimmer-active .shimmer-text-shine {
          animation: shimmer-sweep var(--shimmer-duration) ease-in-out infinite;
        }
      `}</style>
    </span>
  );
}

/**
 * ShimmerHeadline - Pre-configured shimmer for headlines
 * Uses interval mode with slower, more dramatic shimmer
 */
export function ShimmerHeadline({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <ShimmerText
      mode="interval"
      duration={1500}
      interval={8000}
      delay={2000}
      shimmerWidth={40}
      angle={110}
      className={className}
    >
      {children}
    </ShimmerText>
  );
}

/**
 * ShimmerLink - Pre-configured shimmer for links/CTAs
 * Uses hover mode with quick, subtle shimmer
 */
export function ShimmerLink({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <ShimmerText
      mode="hover"
      duration={600}
      shimmerWidth={60}
      angle={130}
      className={className}
    >
      {children}
    </ShimmerText>
  );
}

/**
 * ShimmerBadge - Pre-configured shimmer for badges/tags
 * Uses once mode with attention-grabbing shimmer
 */
export function ShimmerBadge({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <ShimmerText
      mode="once"
      duration={800}
      delay={500}
      shimmerWidth={70}
      angle={120}
      className={className}
    >
      {children}
    </ShimmerText>
  );
}

/**
 * ShimmerLoading - Pre-configured shimmer for loading states
 * Uses continuous mode for skeleton-like effect
 */
export function ShimmerLoading({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <ShimmerText
      mode="continuous"
      duration={2000}
      shimmerWidth={30}
      angle={100}
      shimmerColor="rgba(255, 255, 255, 0.15)"
      className={className}
    >
      {children}
    </ShimmerText>
  );
}

export default ShimmerText;
