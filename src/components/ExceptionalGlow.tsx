'use client';

import { useEffect, useState, useRef } from 'react';

/**
 * ExceptionalGlow - Pulsing ring effect for exceptional earnings results
 * 
 * Features:
 * - Concentric pulse rings that radiate outward
 * - Only triggers for truly exceptional beats (>15% surprise)
 * - Respects prefers-reduced-motion
 * - Intersection observer for viewport-triggered animation
 * - Golden glow for "monster beats" (>25%)
 */

interface ExceptionalGlowProps {
  /** The surprise percentage (only shows for beats > threshold) */
  surprise: number;
  /** Threshold to show the effect (default: 15%) */
  threshold?: number;
  /** "Monster beat" threshold for golden glow (default: 25%) */
  monsterThreshold?: number;
  /** Animation delay in ms */
  delay?: number;
  /** Whether the component is active */
  active?: boolean;
  children: React.ReactNode;
}

export function ExceptionalGlow({
  surprise,
  threshold = 15,
  monsterThreshold = 25,
  delay = 0,
  active = true,
  children,
}: ExceptionalGlowProps) {
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

  const isExceptional = surprise >= threshold;
  const isMonster = surprise >= monsterThreshold;
  const shouldAnimate = active && isExceptional && isVisible && !prefersReducedMotion;

  // Determine glow color based on magnitude
  const glowColor = isMonster
    ? 'rgba(251, 191, 36, 0.6)' // golden for monster beats
    : 'rgba(34, 197, 94, 0.5)'; // green for exceptional beats

  const ringColor = isMonster
    ? 'rgba(251, 191, 36, 0.3)'
    : 'rgba(34, 197, 94, 0.25)';

  // Number of pulse rings based on magnitude
  const ringCount = isMonster ? 3 : 2;

  return (
    <div 
      ref={ref}
      className="exceptional-glow-wrapper"
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      {/* Pulse rings */}
      {shouldAnimate && (
        <div
          className="exceptional-glow-rings"
          style={{
            position: 'absolute',
            inset: '-6px',
            pointerEvents: 'none',
          }}
        >
          {Array.from({ length: ringCount }).map((_, i) => (
            <div
              key={i}
              className={`exceptional-glow-ring ${isMonster ? 'monster' : 'exceptional'}`}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '9999px',
                border: `1.5px solid ${ringColor}`,
                animation: `exceptional-pulse 2.5s ease-out infinite`,
                animationDelay: `${delay + i * 600}ms`,
                opacity: 0,
              }}
            />
          ))}
        </div>
      )}

      {/* Static glow for reduced motion */}
      {active && isExceptional && prefersReducedMotion && (
        <div
          className="exceptional-glow-static"
          style={{
            position: 'absolute',
            inset: '-3px',
            borderRadius: '9999px',
            boxShadow: `0 0 8px ${glowColor}`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Content */}
      <div className="exceptional-glow-content">{children}</div>

      <style jsx>{`
        @keyframes exceptional-pulse {
          0% {
            opacity: 0.8;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
          }
          100% {
            opacity: 0;
            transform: scale(1.8);
          }
        }

        .exceptional-glow-ring.monster {
          border-color: rgba(251, 191, 36, 0.4);
        }

        @media (prefers-reduced-motion: reduce) {
          .exceptional-glow-ring {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Monster Beat Indicator - Shows a special icon for exceptional beats
 */
export function MonsterBeatIcon({ 
  surprise,
  threshold = 25,
}: { 
  surprise: number;
  threshold?: number;
}) {
  if (surprise < threshold) return null;

  return (
    <span 
      className="monster-beat-icon"
      title={`Exceptional beat: +${surprise.toFixed(1)}%`}
      style={{
        display: 'inline-flex',
        fontSize: '12px',
        marginRight: '2px',
        animation: 'monster-bounce 1s ease-in-out infinite',
      }}
    >
      🔥
      <style jsx>{`
        @keyframes monster-bounce {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-2px) scale(1.1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .monster-beat-icon {
            animation: none !important;
          }
        }
      `}</style>
    </span>
  );
}
