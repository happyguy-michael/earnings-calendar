'use client';

import { useEffect, useState, useRef } from 'react';

/**
 * DisasterMiss - Dramatic visual treatment for significant earnings misses
 * 
 * Counterpart to ExceptionalGlow - provides visual symmetry for the negative side.
 * Useful for traders watching for overreaction buy opportunities.
 * 
 * Features:
 * - Red pulsing ring effect that radiates outward
 * - Triggers for significant misses (>-15% surprise)
 * - "Catastrophic" mode for massive misses (>-25%)
 * - Subtle "crack" overlay for dramatic effect
 * - Respects prefers-reduced-motion
 * - Intersection observer for viewport-triggered animation
 */

interface DisasterMissProps {
  /** The surprise percentage (negative for misses) */
  surprise: number;
  /** Threshold to show the effect (default: -15%) */
  threshold?: number;
  /** "Catastrophic" threshold for enhanced effect (default: -25%) */
  catastrophicThreshold?: number;
  /** Animation delay in ms */
  delay?: number;
  /** Whether the component is active */
  active?: boolean;
  children: React.ReactNode;
}

export function DisasterMiss({
  surprise,
  threshold = -15,
  catastrophicThreshold = -25,
  delay = 0,
  active = true,
  children,
}: DisasterMissProps) {
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
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.5, rootMargin: '20px' }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const isDisaster = surprise <= threshold;
  const isCatastrophic = surprise <= catastrophicThreshold;
  const shouldAnimate = active && isDisaster && isVisible && !prefersReducedMotion;

  // Number of pulse rings based on magnitude
  const ringCount = isCatastrophic ? 3 : 2;

  return (
    <div 
      ref={ref}
      className="disaster-miss-wrapper"
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      {/* Pulse rings */}
      {shouldAnimate && (
        <div
          className="disaster-miss-rings"
          style={{
            position: 'absolute',
            inset: '-6px',
            pointerEvents: 'none',
          }}
        >
          {Array.from({ length: ringCount }).map((_, i) => (
            <div
              key={i}
              className={`disaster-miss-ring ${isCatastrophic ? 'catastrophic' : 'disaster'}`}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '9999px',
                border: `1.5px solid ${isCatastrophic ? 'rgba(220, 38, 38, 0.4)' : 'rgba(239, 68, 68, 0.35)'}`,
                animation: `disaster-pulse 2.5s ease-out infinite`,
                animationDelay: `${delay + i * 600}ms`,
                opacity: 0,
              }}
            />
          ))}
        </div>
      )}

      {/* Crack overlay for catastrophic misses */}
      {shouldAnimate && isCatastrophic && (
        <div className="disaster-miss-crack">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="crack-svg"
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '12px',
              height: '12px',
              opacity: 0,
              animation: 'crack-appear 0.4s ease-out forwards',
              animationDelay: `${delay + 400}ms`,
            }}
          >
            <path
              d="M12 2L10 8L6 9L9 12L7 18L12 15L17 18L15 12L18 9L14 8L12 2Z"
              stroke="rgba(220, 38, 38, 0.8)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="rgba(220, 38, 38, 0.2)"
              className="crack-path"
            />
          </svg>
        </div>
      )}

      {/* Static glow for reduced motion */}
      {active && isDisaster && prefersReducedMotion && (
        <div
          className="disaster-miss-static"
          style={{
            position: 'absolute',
            inset: '-3px',
            borderRadius: '9999px',
            boxShadow: `0 0 8px ${isCatastrophic ? 'rgba(220, 38, 38, 0.6)' : 'rgba(239, 68, 68, 0.5)'}`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Content */}
      <div className="disaster-miss-content">{children}</div>

      <style jsx>{`
        @keyframes disaster-pulse {
          0% {
            opacity: 0.7;
            transform: scale(1);
          }
          50% {
            opacity: 0.25;
          }
          100% {
            opacity: 0;
            transform: scale(1.7);
          }
        }

        @keyframes crack-appear {
          0% {
            opacity: 0;
            transform: scale(0.5) rotate(-10deg);
          }
          60% {
            opacity: 1;
            transform: scale(1.2) rotate(5deg);
          }
          100% {
            opacity: 0.9;
            transform: scale(1) rotate(0deg);
          }
        }

        @keyframes crack-shake {
          0%, 100% {
            transform: translateX(0) rotate(0deg);
          }
          25% {
            transform: translateX(-1px) rotate(-2deg);
          }
          75% {
            transform: translateX(1px) rotate(2deg);
          }
        }

        .disaster-miss-ring.catastrophic {
          border-color: rgba(185, 28, 28, 0.45);
        }

        .crack-path {
          animation: crack-shake 0.3s ease-in-out;
          animation-delay: 0.5s;
        }

        @media (prefers-reduced-motion: reduce) {
          .disaster-miss-ring,
          .crack-svg,
          .crack-path {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Disaster Miss Indicator - Shows a warning icon for significant misses
 * Counterpart to MonsterBeatIcon
 */
export function DisasterMissIcon({ 
  surprise,
  threshold = -25,
}: { 
  surprise: number;
  threshold?: number;
}) {
  if (surprise > threshold) return null;

  return (
    <span 
      className="disaster-miss-icon"
      title={`Significant miss: ${surprise.toFixed(1)}%`}
      style={{
        display: 'inline-flex',
        fontSize: '12px',
        marginRight: '2px',
        animation: 'disaster-shake 0.6s ease-in-out infinite',
      }}
    >
      📉
      <style jsx>{`
        @keyframes disaster-shake {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          25% {
            transform: translateY(1px) scale(0.95);
          }
          50% {
            transform: translateY(-1px) scale(1.02);
          }
          75% {
            transform: translateY(0.5px) scale(0.98);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .disaster-miss-icon {
            animation: none !important;
          }
        }
      `}</style>
    </span>
  );
}

/**
 * SeverityIndicator - Combined beat/miss magnitude indicator
 * Shows appropriate visual treatment based on surprise direction and magnitude
 */
export function SeverityIndicator({
  surprise,
  beatThreshold = 15,
  missThreshold = -15,
  children,
}: {
  surprise: number;
  beatThreshold?: number;
  missThreshold?: number;
  children: React.ReactNode;
}) {
  // Import and use ExceptionalGlow for beats, DisasterMiss for misses
  // This is a convenience wrapper that handles both cases
  
  if (surprise >= beatThreshold) {
    // Would use ExceptionalGlow here - but to avoid circular deps,
    // we just return with beat styling
    return (
      <div className="severity-beat" style={{ position: 'relative' }}>
        {children}
      </div>
    );
  }
  
  if (surprise <= missThreshold) {
    return (
      <DisasterMiss surprise={surprise}>
        {children}
      </DisasterMiss>
    );
  }
  
  return <>{children}</>;
}
