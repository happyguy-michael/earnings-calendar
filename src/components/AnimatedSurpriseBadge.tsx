'use client';

import { useState, useEffect, useRef } from 'react';
import { ScrambleNumber } from './TextScramble';

interface AnimatedSurpriseBadgeProps {
  surprise: number; // Surprise percentage (can be negative)
  result: 'beat' | 'miss' | 'met';
  delay?: number; // ms before animation starts
  duration?: number; // ms for count animation
  className?: string;
}

/**
 * Animated badge showing earnings surprise percentage.
 * Features:
 * - Spring-bouncy entrance animation
 * - Counting number reveal from 0 to actual value
 * - Color-matched glow pulse on completion
 * - Accessibility: respects prefers-reduced-motion
 */
export function AnimatedSurpriseBadge({
  surprise,
  result,
  delay = 0,
  duration = 600,
  className = '',
}: AnimatedSurpriseBadgeProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [showCompletionGlow, setShowCompletionGlow] = useState(false);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const animationRef = useRef<number | null>(null);

  // Intersection Observer - only animate when visible
  useEffect(() => {
    const element = badgeRef.current;
    if (!element) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayValue(surprise);
      setIsVisible(true);
      setHasAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          // Delay before starting animation
          setTimeout(() => {
            setIsVisible(true);
            startCountAnimation();
          }, delay);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [delay, hasAnimated, surprise]);

  const startCountAnimation = () => {
    const startTime = performance.now();
    const startValue = 0;
    const endValue = surprise;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic with slight bounce at end
      let eased: number;
      if (progress < 0.9) {
        // Normal ease out
        eased = 1 - Math.pow(1 - (progress / 0.9), 3);
      } else {
        // Slight overshoot and settle
        const t = (progress - 0.9) / 0.1;
        eased = 1 + Math.sin(t * Math.PI) * 0.02;
      }

      const current = startValue + (endValue - startValue) * Math.min(eased, 1);
      setDisplayValue(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        setHasAnimated(true);
        // Trigger completion glow
        setShowCompletionGlow(true);
        setTimeout(() => setShowCompletionGlow(false), 500);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const badgeClass = result === 'beat' ? 'badge-beat' : result === 'miss' ? 'badge-miss' : 'badge-neutral';
  const formattedValue = `${displayValue >= 0 ? '+' : ''}${displayValue.toFixed(1)}%`;

  return (
    <span
      ref={badgeRef}
      className={`animated-surprise-badge badge ${badgeClass} ${className} ${isVisible ? 'visible' : ''} ${showCompletionGlow ? 'completion-glow' : ''}`}
      style={{
        '--delay': `${delay}ms`,
      } as React.CSSProperties}
    >
      <span className="badge-value tabular-nums">{formattedValue}</span>
      <style jsx>{`
        .animated-surprise-badge {
          opacity: 0;
          transform: scale(0.6);
          transition: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          position: relative;
        }
        
        .animated-surprise-badge.visible {
          opacity: 1;
          transform: scale(1);
          animation: badgeBounceIn 0.5s var(--spring-bouncy, cubic-bezier(0.34, 1.56, 0.64, 1)) forwards;
        }
        
        .animated-surprise-badge.completion-glow.badge-beat {
          animation: beatGlowPulse 0.5s ease-out forwards;
        }
        
        .animated-surprise-badge.completion-glow.badge-miss {
          animation: missGlowPulse 0.5s ease-out forwards;
        }
        
        .badge-value {
          display: inline-block;
          min-width: 3.5ch;
          text-align: center;
        }
        
        @keyframes badgeBounceIn {
          0% {
            opacity: 0;
            transform: scale(0.6);
          }
          50% {
            opacity: 1;
          }
          70% {
            transform: scale(1.08);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes beatGlowPulse {
          0% {
            box-shadow: 
              0 0 8px rgba(34, 197, 94, 0.5),
              0 0 16px rgba(34, 197, 94, 0.3),
              0 0 24px rgba(34, 197, 94, 0.2);
          }
          100% {
            box-shadow: 
              0 0 4px rgba(34, 197, 94, 0.2),
              0 0 8px rgba(34, 197, 94, 0.1);
          }
        }
        
        @keyframes missGlowPulse {
          0% {
            box-shadow: 
              0 0 8px rgba(239, 68, 68, 0.5),
              0 0 16px rgba(239, 68, 68, 0.3),
              0 0 24px rgba(239, 68, 68, 0.2);
          }
          100% {
            box-shadow: 
              0 0 4px rgba(239, 68, 68, 0.2),
              0 0 8px rgba(239, 68, 68, 0.1);
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .animated-surprise-badge {
            opacity: 1;
            transform: scale(1);
            animation: none !important;
          }
          
          .animated-surprise-badge.completion-glow {
            animation: none !important;
          }
        }
      `}</style>
    </span>
  );
}

/**
 * Compact inline version for use in earnings cards
 */
export function SurpriseCountUp({
  value,
  delay = 0,
  duration = 500,
  className = '',
}: {
  value: number;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || hasAnimated) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayValue(value);
      setHasAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setTimeout(() => {
            const startTime = performance.now();
            
            const animate = (currentTime: number) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // Ease out expo
              const eased = 1 - Math.pow(1 - progress, 4);
              setDisplayValue(value * eased);
              
              if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
              } else {
                setDisplayValue(value);
                setHasAnimated(true);
              }
            };
            
            animationRef.current = requestAnimationFrame(animate);
          }, delay);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, delay, duration, hasAnimated]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {displayValue >= 0 ? '+' : ''}{displayValue.toFixed(1)}%
    </span>
  );
}

/**
 * SurpriseScramble - Premium variant using text scramble effect
 * 
 * Characters scramble through random digits before settling on the final value.
 * Creates a high-end fintech feel for important data reveals.
 */
export function SurpriseScramble({
  value,
  delay = 0,
  duration = 600,
  className = '',
  glowColor,
}: {
  value: number;
  delay?: number;
  duration?: number;
  className?: string;
  glowColor?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  // Auto-determine glow color based on value
  const defaultGlowColor = value >= 0 ? '#22c55e' : '#ef4444';
  const formattedValue = `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <span 
      ref={ref} 
      className={`surprise-scramble tabular-nums ${className}`}
      style={{ visibility: isVisible ? 'visible' : 'hidden' }}
    >
      {isVisible ? (
        <ScrambleNumber
          text={formattedValue}
          duration={duration}
          glowColor={glowColor ?? defaultGlowColor}
          showGlow={true}
        />
      ) : (
        <span style={{ opacity: 0 }}>{formattedValue}</span>
      )}
    </span>
  );
}
