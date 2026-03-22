'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * AnimatedPercentSign - Micro-animation for percentage displays
 * 
 * A subtle but delightful detail: the % sign animates in slightly after
 * the number finishes counting up. Creates a "landing" effect that makes
 * the stat feel complete.
 * 
 * 2026 Design Trend: "Sequenced micro-animations" - instead of everything
 * animating at once, elements animate in sequence to guide the eye and
 * create rhythm. Seen in Linear, Stripe, Vercel dashboards.
 * 
 * Animation options:
 * - fadeSlide: Fades in while sliding up (default, most subtle)
 * - scale: Scales up from 0 with bounce
 * - rotate: Spins in from 90deg rotation
 * - pop: Quick scale overshoot (1.0 → 1.2 → 1.0)
 * - typewriter: Appears character by character (for "%" = instant, adds cursor blink)
 * 
 * Features:
 * - Respects prefers-reduced-motion
 * - GPU-accelerated animations
 * - Configurable delay for sequencing after CountUp
 * - Optional suffix support (%, pts, bps)
 * - Color customization
 * - Size variants
 * 
 * Usage:
 * <span><CountUp end={90} duration={1000} /><AnimatedPercentSign delay={800} /></span>
 */

export type AnimationVariant = 'fadeSlide' | 'scale' | 'rotate' | 'pop' | 'typewriter';
export type SignSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AnimatedPercentSignProps {
  /** Animation variant */
  variant?: AnimationVariant;
  /** Delay before animation starts (ms) - sync with number animation */
  delay?: number;
  /** Animation duration (ms) */
  duration?: number;
  /** Custom suffix text (default: '%') */
  suffix?: string;
  /** Custom color (inherits by default) */
  color?: string;
  /** Size variant */
  size?: SignSize;
  /** Opacity when fully visible */
  finalOpacity?: number;
  /** Whether to show a subtle glow on completion */
  glowOnComplete?: boolean;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

const sizeMap: Record<SignSize, { fontSize: string; offset: string }> = {
  xs: { fontSize: '0.65em', offset: '2px' },
  sm: { fontSize: '0.75em', offset: '3px' },
  md: { fontSize: '0.85em', offset: '4px' },
  lg: { fontSize: '0.9em', offset: '5px' },
  xl: { fontSize: '1em', offset: '0px' },
};

export function AnimatedPercentSign({
  variant = 'fadeSlide',
  delay = 800,
  duration = 400,
  suffix = '%',
  color,
  size = 'md',
  finalOpacity = 1,
  glowOnComplete = false,
  className = '',
  style = {},
}: AnimatedPercentSignProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showGlow, setShowGlow] = useState(false);
  const prefersReducedMotion = useRef(false);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      prefersReducedMotion.current = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
    }

    // Start animation after delay
    const timer = setTimeout(() => {
      setIsVisible(true);
      hasAnimated.current = true;

      // Trigger glow effect after animation completes
      if (glowOnComplete) {
        setTimeout(() => {
          setShowGlow(true);
          // Remove glow after brief moment
          setTimeout(() => setShowGlow(false), 600);
        }, duration);
      }
    }, prefersReducedMotion.current ? 0 : delay);

    return () => clearTimeout(timer);
  }, [delay, duration, glowOnComplete]);

  const sizeStyles = sizeMap[size];

  // Get animation-specific styles
  const getAnimationStyles = (): React.CSSProperties => {
    if (prefersReducedMotion.current) {
      return { opacity: isVisible ? finalOpacity : 0 };
    }

    const baseTransition = `all ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;

    switch (variant) {
      case 'fadeSlide':
        return {
          opacity: isVisible ? finalOpacity : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(4px)',
          transition: baseTransition,
        };

      case 'scale':
        return {
          opacity: isVisible ? finalOpacity : 0,
          transform: isVisible ? 'scale(1)' : 'scale(0)',
          transition: baseTransition,
        };

      case 'rotate':
        return {
          opacity: isVisible ? finalOpacity : 0,
          transform: isVisible ? 'rotate(0deg)' : 'rotate(90deg)',
          transformOrigin: 'center center',
          transition: baseTransition,
        };

      case 'pop':
        return {
          opacity: isVisible ? finalOpacity : 0,
          transform: isVisible ? 'scale(1)' : 'scale(0.5)',
          transition: `opacity ${duration * 0.5}ms ease, transform ${duration}ms cubic-bezier(0.175, 0.885, 0.32, 1.275)`,
        };

      case 'typewriter':
        return {
          opacity: isVisible ? finalOpacity : 0,
          transition: `opacity ${duration * 0.3}ms ease`,
        };

      default:
        return {
          opacity: isVisible ? finalOpacity : 0,
          transition: `opacity ${duration}ms ease`,
        };
    }
  };

  return (
    <>
      <span
        className={`animated-percent-sign ${className}`}
        style={{
          display: 'inline-block',
          fontSize: sizeStyles.fontSize,
          marginLeft: '0.05em',
          verticalAlign: 'baseline',
          position: 'relative',
          top: sizeStyles.offset,
          color: color || 'inherit',
          willChange: 'transform, opacity',
          ...getAnimationStyles(),
          ...style,
        }}
        aria-hidden="true"
      >
        {suffix}
        
        {/* Glow effect on completion */}
        {glowOnComplete && (
          <span
            style={{
              position: 'absolute',
              inset: '-4px',
              background: 'currentColor',
              borderRadius: '50%',
              filter: 'blur(8px)',
              opacity: showGlow ? 0.4 : 0,
              transition: 'opacity 300ms ease',
              pointerEvents: 'none',
              zIndex: -1,
            }}
          />
        )}
      </span>

      <style jsx>{`
        /* Typewriter cursor blink effect */
        .animated-percent-sign[data-variant="typewriter"]::after {
          content: '';
          display: inline-block;
          width: 1px;
          height: 0.9em;
          background: currentColor;
          margin-left: 1px;
          animation: cursor-blink 0.8s step-end infinite;
          animation-delay: 0.5s;
          opacity: 0;
        }
        
        @keyframes cursor-blink {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }

        @media (prefers-reduced-motion: reduce) {
          .animated-percent-sign {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </>
  );
}

/**
 * AnimatedSuffix - Generic version for any suffix (pts, bps, x, etc.)
 */
export function AnimatedSuffix(props: AnimatedPercentSignProps) {
  return <AnimatedPercentSign {...props} />;
}

/**
 * SequencedStat - Combines a number with animated suffix
 * Handles the sequencing automatically
 */
interface SequencedStatProps {
  /** The number value */
  value: number;
  /** Suffix to show (%, pts, bps, x) */
  suffix?: string;
  /** Number animation duration */
  numberDuration?: number;
  /** Format function for the number */
  formatNumber?: (n: number) => string;
  /** Animation variant for suffix */
  suffixVariant?: AnimationVariant;
  /** Suffix size */
  suffixSize?: SignSize;
  /** Additional class name */
  className?: string;
}

export function SequencedStat({
  value,
  suffix = '%',
  numberDuration = 1000,
  formatNumber = (n) => n.toFixed(0),
  suffixVariant = 'fadeSlide',
  suffixSize = 'md',
  className = '',
}: SequencedStatProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / numberDuration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(value * eased);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [value, numberDuration]);

  return (
    <span className={`sequenced-stat ${className}`}>
      <span className="sequenced-stat-number">
        {formatNumber(displayValue)}
      </span>
      <AnimatedPercentSign
        suffix={suffix}
        variant={suffixVariant}
        size={suffixSize}
        delay={numberDuration * 0.7}
        duration={300}
      />
    </span>
  );
}

export default AnimatedPercentSign;
