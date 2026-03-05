'use client';

import { useEffect, useState, useRef } from 'react';

/**
 * SurpriseMagnitude - A visual indicator showing the magnitude of earnings surprise
 * 
 * Features:
 * - Animated bar that fills based on surprise percentage
 * - Green for beats, red for misses
 * - Scales logarithmically for better visual range
 * - Intersection observer for viewport-triggered animation
 * - Full accessibility support with aria-label
 * - Respects prefers-reduced-motion
 */

interface SurpriseMagnitudeProps {
  /** The surprise percentage (positive = beat, negative = miss) */
  surprise: number;
  /** Maximum absolute surprise to show (caps the bar) */
  maxSurprise?: number;
  /** Width of the indicator in pixels */
  width?: number;
  /** Height of the bar in pixels */
  height?: number;
  /** Animation delay in ms */
  delay?: number;
  /** Animation duration in ms */
  duration?: number;
  /** Show the percentage label */
  showLabel?: boolean;
  /** Compact mode for tight spaces */
  compact?: boolean;
}

export function SurpriseMagnitude({
  surprise,
  maxSurprise = 30,
  width = 48,
  height = 4,
  delay = 0,
  duration = 600,
  showLabel = false,
  compact = false,
}: SurpriseMagnitudeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Intersection observer for viewport-triggered animation
  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.3, rootMargin: '50px' }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [isVisible]);

  // Calculate fill percentage (using sqrt for better visual distribution)
  const absSurprise = Math.abs(surprise);
  const clampedSurprise = Math.min(absSurprise, maxSurprise);
  // Use square root scaling for better visual distribution of values
  const fillPercent = Math.sqrt(clampedSurprise / maxSurprise) * 100;
  
  const isBeat = surprise > 0;
  const isMiss = surprise < 0;
  const isNeutral = surprise === 0;

  // Color based on result
  const barColor = isBeat 
    ? 'var(--surprise-beat-color, #22c55e)' 
    : isMiss 
    ? 'var(--surprise-miss-color, #ef4444)' 
    : 'var(--surprise-neutral-color, #71717a)';

  const bgColor = isBeat
    ? 'var(--surprise-beat-bg, rgba(34, 197, 94, 0.15))'
    : isMiss
    ? 'var(--surprise-miss-bg, rgba(239, 68, 68, 0.15))'
    : 'var(--surprise-neutral-bg, rgba(113, 113, 122, 0.15))';

  const glowColor = isBeat
    ? 'rgba(34, 197, 94, 0.4)'
    : isMiss
    ? 'rgba(239, 68, 68, 0.4)'
    : 'transparent';

  const animationStyle = prefersReducedMotion 
    ? { width: `${fillPercent}%` }
    : {
        width: isVisible ? `${fillPercent}%` : '0%',
        transition: `width ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
        transitionDelay: `${delay}ms`,
      };

  const ariaLabel = isNeutral 
    ? 'Met estimates exactly'
    : isBeat 
    ? `Beat estimates by ${surprise.toFixed(1)}%`
    : `Missed estimates by ${Math.abs(surprise).toFixed(1)}%`;

  return (
    <div 
      ref={ref}
      className={`surprise-magnitude ${compact ? 'compact' : ''}`}
      role="meter"
      aria-label={ariaLabel}
      aria-valuenow={absSurprise}
      aria-valuemin={0}
      aria-valuemax={maxSurprise}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: compact ? '4px' : '6px',
      }}
    >
      {/* Bar container */}
      <div
        className="surprise-magnitude-track"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          borderRadius: `${height / 2}px`,
          backgroundColor: bgColor,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Fill bar */}
        <div
          className="surprise-magnitude-fill"
          style={{
            height: '100%',
            backgroundColor: barColor,
            borderRadius: `${height / 2}px`,
            boxShadow: isVisible && !prefersReducedMotion ? `0 0 8px ${glowColor}` : 'none',
            ...animationStyle,
          }}
        />
        
        {/* Shimmer effect for large surprises */}
        {absSurprise > 15 && isVisible && !prefersReducedMotion && (
          <div
            className="surprise-magnitude-shimmer"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(
                90deg,
                transparent 0%,
                rgba(255, 255, 255, 0.3) 50%,
                transparent 100%
              )`,
              backgroundSize: '200% 100%',
              animation: 'surprise-shimmer 1.5s ease-in-out infinite',
              animationDelay: `${delay + duration}ms`,
              borderRadius: `${height / 2}px`,
            }}
          />
        )}
      </div>

      {/* Optional label */}
      {showLabel && (
        <span 
          className="surprise-magnitude-label"
          style={{
            fontSize: compact ? '10px' : '11px',
            fontWeight: 600,
            fontVariantNumeric: 'tabular-nums',
            color: barColor,
            minWidth: '32px',
            opacity: isVisible || prefersReducedMotion ? 1 : 0,
            transition: prefersReducedMotion ? 'none' : `opacity 300ms ease ${delay + duration * 0.5}ms`,
          }}
        >
          {surprise >= 0 ? '+' : ''}{surprise.toFixed(1)}%
        </span>
      )}

      <style jsx>{`
        @keyframes surprise-shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .surprise-magnitude-shimmer {
            animation: none !important;
          }
        }

        /* Light mode adjustments */
        :global(html.light) .surprise-magnitude-track {
          --surprise-beat-bg: rgba(34, 197, 94, 0.12);
          --surprise-miss-bg: rgba(239, 68, 68, 0.12);
          --surprise-neutral-bg: rgba(113, 113, 122, 0.12);
        }

        :global(html.light) .surprise-magnitude-fill {
          --surprise-beat-color: #16a34a;
          --surprise-miss-color: #dc2626;
        }
      `}</style>
    </div>
  );
}

/**
 * SurpriseMagnitudeCompact - A minimal version for inline use
 */
export function SurpriseMagnitudeCompact({ 
  surprise, 
  delay = 0 
}: { 
  surprise: number; 
  delay?: number;
}) {
  return (
    <SurpriseMagnitude
      surprise={surprise}
      width={32}
      height={3}
      delay={delay}
      duration={400}
      compact
    />
  );
}
