'use client';

/**
 * CheckmarkDraw — Premium SVG stroke animation for success states
 * 
 * Inspired by 2026 UI animation best practices:
 * - "Success: A quick checkmark draw in 350–450 ms" (Ripplix)
 * - Stroke animations that feel tactile and satisfying
 * - Intersection Observer for scroll-triggered reveals
 * 
 * Use cases:
 * - Earnings beat confirmations
 * - Form submission success
 * - Task completion indicators
 * - Toggle on-states with flair
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface CheckmarkDrawProps {
  /** Size in pixels (square) */
  size?: number;
  /** Stroke color */
  color?: string;
  /** Stroke width in pixels */
  strokeWidth?: number;
  /** Animation duration in ms */
  duration?: number;
  /** Delay before animation starts in ms */
  delay?: number;
  /** Easing function */
  easing?: 'linear' | 'ease-out' | 'ease-in-out' | 'spring';
  /** Trigger animation on mount */
  animateOnMount?: boolean;
  /** Trigger animation when in viewport */
  animateInView?: boolean;
  /** Show glow effect on complete */
  glow?: boolean;
  /** Glow color (defaults to stroke color) */
  glowColor?: string;
  /** Show circle background */
  showCircle?: boolean;
  /** Circle fill color */
  circleFill?: string;
  /** Circle stroke color */
  circleStroke?: string;
  /** Animate circle stroke too */
  animateCircle?: boolean;
  /** Custom class name */
  className?: string;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** External trigger (true = animate) */
  trigger?: boolean;
  /** Variant preset */
  variant?: 'default' | 'success' | 'gold' | 'minimal';
}

interface AnimatedXProps {
  /** Size in pixels (square) */
  size?: number;
  /** Stroke color */
  color?: string;
  /** Stroke width in pixels */
  strokeWidth?: number;
  /** Animation duration in ms */
  duration?: number;
  /** Delay before animation starts in ms */
  delay?: number;
  /** Easing function */
  easing?: 'linear' | 'ease-out' | 'ease-in-out' | 'spring';
  /** Trigger animation on mount */
  animateOnMount?: boolean;
  /** Trigger animation when in viewport */
  animateInView?: boolean;
  /** Show glow effect on complete */
  glow?: boolean;
  /** Custom class name */
  className?: string;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** External trigger (true = animate) */
  trigger?: boolean;
}

// ============================================================================
// VARIANT PRESETS
// ============================================================================

const variants = {
  default: {
    color: '#22c55e',
    glowColor: 'rgba(34, 197, 94, 0.5)',
    circleFill: 'rgba(34, 197, 94, 0.1)',
    circleStroke: 'rgba(34, 197, 94, 0.3)',
  },
  success: {
    color: '#22c55e',
    glowColor: 'rgba(34, 197, 94, 0.6)',
    circleFill: 'rgba(34, 197, 94, 0.15)',
    circleStroke: '#22c55e',
  },
  gold: {
    color: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.6)',
    circleFill: 'rgba(251, 191, 36, 0.1)',
    circleStroke: 'rgba(251, 191, 36, 0.4)',
  },
  minimal: {
    color: '#a1a1aa',
    glowColor: 'rgba(161, 161, 170, 0.3)',
    circleFill: 'transparent',
    circleStroke: 'transparent',
  },
};

// Easing functions for CSS
const easings = {
  'linear': 'linear',
  'ease-out': 'cubic-bezier(0.33, 1, 0.68, 1)',
  'ease-in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
  'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
};

// ============================================================================
// MAIN COMPONENT: CheckmarkDraw
// ============================================================================

export function CheckmarkDraw({
  size = 24,
  color,
  strokeWidth = 2.5,
  duration = 400,
  delay = 0,
  easing = 'ease-out',
  animateOnMount = true,
  animateInView = false,
  glow = false,
  glowColor,
  showCircle = false,
  circleFill,
  circleStroke,
  animateCircle = true,
  className = '',
  onComplete,
  trigger,
  variant = 'default',
}: CheckmarkDrawProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const hasAnimatedRef = useRef(false);

  // Merge variant with explicit props
  const variantConfig = variants[variant];
  const finalColor = color ?? variantConfig.color;
  const finalGlowColor = glowColor ?? variantConfig.glowColor;
  const finalCircleFill = circleFill ?? variantConfig.circleFill;
  const finalCircleStroke = circleStroke ?? variantConfig.circleStroke;

  // Calculate checkmark path length (approximately)
  // Checkmark goes: bottom-left -> center-bottom -> top-right
  const checkmarkLength = useMemo(() => {
    // Rough calculation for our checkmark path
    const scale = size / 24;
    return 22 * scale; // Approximate path length
  }, [size]);

  // Circle circumference
  const circleRadius = (size - strokeWidth) / 2;
  const circleCircumference = 2 * Math.PI * circleRadius;

  // Check reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Start animation
  const startAnimation = useCallback(() => {
    if (hasAnimatedRef.current && !trigger) return;
    hasAnimatedRef.current = true;
    
    setIsAnimating(true);
    setIsComplete(false);

    // Complete after animation duration + delay
    const totalDuration = prefersReducedMotion ? 0 : duration + delay;
    setTimeout(() => {
      setIsComplete(true);
      setIsAnimating(false);
      onComplete?.();
    }, totalDuration);
  }, [duration, delay, onComplete, prefersReducedMotion, trigger]);

  // Handle external trigger
  useEffect(() => {
    if (trigger === true) {
      hasAnimatedRef.current = false; // Allow re-animation
      startAnimation();
    }
  }, [trigger, startAnimation]);

  // Handle mount animation
  useEffect(() => {
    if (animateOnMount && !animateInView && trigger === undefined) {
      const timer = setTimeout(startAnimation, 50);
      return () => clearTimeout(timer);
    }
  }, [animateOnMount, animateInView, trigger, startAnimation]);

  // Handle viewport animation
  useEffect(() => {
    if (!animateInView || trigger !== undefined) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimatedRef.current) {
            startAnimation();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (svgRef.current) {
      observer.observe(svgRef.current);
    }

    return () => observer.disconnect();
  }, [animateInView, trigger, startAnimation]);

  // Checkmark path (scaled to size)
  const scale = size / 24;
  // Standard checkmark path in 24x24 viewBox
  const checkmarkPath = `M 6 12 L 10 16 L 18 8`;

  // Animation styles
  const checkmarkStyle: React.CSSProperties = prefersReducedMotion
    ? { strokeDasharray: 'none', strokeDashoffset: 0 }
    : {
        strokeDasharray: checkmarkLength,
        strokeDashoffset: isAnimating || isComplete ? 0 : checkmarkLength,
        transition: `stroke-dashoffset ${duration}ms ${easings[easing]} ${delay}ms`,
      };

  const circleStyle: React.CSSProperties = prefersReducedMotion || !animateCircle
    ? { strokeDasharray: 'none', strokeDashoffset: 0 }
    : {
        strokeDasharray: circleCircumference,
        strokeDashoffset: isAnimating || isComplete ? 0 : circleCircumference,
        transition: `stroke-dashoffset ${duration * 0.8}ms ${easings[easing]} ${delay}ms`,
        transformOrigin: 'center',
        transform: 'rotate(-90deg)',
      };

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`checkmark-draw ${className}`}
      style={{
        overflow: 'visible',
      }}
      aria-hidden="true"
    >
      {/* Glow filter */}
      {glow && (
        <defs>
          <filter id={`checkmark-glow-${size}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
      )}

      {/* Circle background */}
      {showCircle && (
        <>
          {/* Fill circle */}
          <circle
            cx="12"
            cy="12"
            r={(24 - strokeWidth * 2) / 2}
            fill={finalCircleFill}
            style={{
              opacity: isAnimating || isComplete ? 1 : 0,
              transition: `opacity ${duration * 0.5}ms ${easings[easing]} ${delay}ms`,
            }}
          />
          {/* Stroke circle */}
          <circle
            cx="12"
            cy="12"
            r={(24 - strokeWidth * 2) / 2}
            fill="none"
            stroke={finalCircleStroke}
            strokeWidth={strokeWidth * 0.6}
            strokeLinecap="round"
            style={circleStyle}
          />
        </>
      )}

      {/* Checkmark path */}
      <path
        d={checkmarkPath}
        stroke={finalColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        style={checkmarkStyle}
        filter={glow && isComplete ? `url(#checkmark-glow-${size})` : undefined}
      />

      {/* Glow overlay on complete */}
      {glow && isComplete && (
        <path
          d={checkmarkPath}
          stroke={finalGlowColor}
          strokeWidth={strokeWidth * 2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={{
            opacity: 0.4,
            filter: 'blur(3px)',
          }}
        />
      )}

      <style jsx>{`
        @keyframes checkmark-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        .checkmark-draw path:last-child {
          animation: ${glow && isComplete ? 'checkmark-pulse 2s ease-in-out infinite' : 'none'};
        }
      `}</style>
    </svg>
  );
}

// ============================================================================
// VARIANT: AnimatedX (for error/miss states)
// ============================================================================

export function AnimatedX({
  size = 24,
  color = '#ef4444',
  strokeWidth = 2.5,
  duration = 300,
  delay = 0,
  easing = 'ease-out',
  animateOnMount = true,
  animateInView = false,
  glow = false,
  className = '',
  onComplete,
  trigger,
}: AnimatedXProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const hasAnimatedRef = useRef(false);

  // X path lengths (approximately)
  const pathLength = useMemo(() => {
    const scale = size / 24;
    return 14 * scale; // Diagonal line length
  }, [size]);

  // Check reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Start animation
  const startAnimation = useCallback(() => {
    if (hasAnimatedRef.current && !trigger) return;
    hasAnimatedRef.current = true;
    
    setIsAnimating(true);
    setIsComplete(false);

    const totalDuration = prefersReducedMotion ? 0 : duration + delay;
    setTimeout(() => {
      setIsComplete(true);
      setIsAnimating(false);
      onComplete?.();
    }, totalDuration);
  }, [duration, delay, onComplete, prefersReducedMotion, trigger]);

  // Handle external trigger
  useEffect(() => {
    if (trigger === true) {
      hasAnimatedRef.current = false;
      startAnimation();
    }
  }, [trigger, startAnimation]);

  // Handle mount animation
  useEffect(() => {
    if (animateOnMount && !animateInView && trigger === undefined) {
      const timer = setTimeout(startAnimation, 50);
      return () => clearTimeout(timer);
    }
  }, [animateOnMount, animateInView, trigger, startAnimation]);

  // Handle viewport animation
  useEffect(() => {
    if (!animateInView || trigger !== undefined) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimatedRef.current) {
            startAnimation();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (svgRef.current) {
      observer.observe(svgRef.current);
    }

    return () => observer.disconnect();
  }, [animateInView, trigger, startAnimation]);

  // X paths
  const line1 = 'M 7 7 L 17 17';
  const line2 = 'M 17 7 L 7 17';

  const lineStyle = (lineDelay: number): React.CSSProperties =>
    prefersReducedMotion
      ? { strokeDasharray: 'none', strokeDashoffset: 0 }
      : {
          strokeDasharray: pathLength,
          strokeDashoffset: isAnimating || isComplete ? 0 : pathLength,
          transition: `stroke-dashoffset ${duration}ms ${easings[easing]} ${delay + lineDelay}ms`,
        };

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`animated-x ${className}`}
      style={{ overflow: 'visible' }}
      aria-hidden="true"
    >
      {/* Glow filter */}
      {glow && (
        <defs>
          <filter id={`x-glow-${size}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
      )}

      {/* First line */}
      <path
        d={line1}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
        style={lineStyle(0)}
        filter={glow && isComplete ? `url(#x-glow-${size})` : undefined}
      />

      {/* Second line (slightly delayed) */}
      <path
        d={line2}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
        style={lineStyle(duration * 0.3)}
        filter={glow && isComplete ? `url(#x-glow-${size})` : undefined}
      />
    </svg>
  );
}

// ============================================================================
// COMPOUND: CheckmarkBadge (checkmark in a pill badge)
// ============================================================================

interface CheckmarkBadgeProps extends Omit<CheckmarkDrawProps, 'showCircle'> {
  /** Text label next to checkmark */
  label?: string;
  /** Badge background color */
  bgColor?: string;
}

export function CheckmarkBadge({
  size = 16,
  label,
  bgColor = 'rgba(34, 197, 94, 0.15)',
  color = '#22c55e',
  ...props
}: CheckmarkBadgeProps) {
  return (
    <span
      className="checkmark-badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: label ? '2px 8px 2px 4px' : '4px',
        borderRadius: '9999px',
        backgroundColor: bgColor,
        fontSize: '12px',
        fontWeight: 500,
        color: color,
      }}
    >
      <CheckmarkDraw size={size} color={color} {...props} />
      {label && <span>{label}</span>}
    </span>
  );
}

// ============================================================================
// COMPOUND: ResultIcon (checkmark or X based on result)
// ============================================================================

interface ResultIconProps {
  /** Result type */
  result: 'beat' | 'miss' | 'meet';
  /** Size in pixels */
  size?: number;
  /** Animation duration */
  duration?: number;
  /** Delay before animation */
  delay?: number;
  /** Show glow effect */
  glow?: boolean;
  /** Custom class name */
  className?: string;
  /** External trigger */
  trigger?: boolean;
  /** Animate when in viewport */
  animateInView?: boolean;
}

export function ResultIcon({
  result,
  size = 20,
  duration = 400,
  delay = 0,
  glow = true,
  className = '',
  trigger,
  animateInView = false,
}: ResultIconProps) {
  if (result === 'beat' || result === 'meet') {
    return (
      <CheckmarkDraw
        size={size}
        duration={duration}
        delay={delay}
        glow={glow}
        variant={result === 'beat' ? 'success' : 'minimal'}
        className={className}
        trigger={trigger}
        animateInView={animateInView}
      />
    );
  }

  return (
    <AnimatedX
      size={size}
      duration={duration * 0.75}
      delay={delay}
      glow={glow}
      className={className}
      trigger={trigger}
      animateInView={animateInView}
    />
  );
}

// ============================================================================
// SHOWCASE: CheckmarkShowcase (for demo/testing)
// ============================================================================

export function CheckmarkShowcase() {
  const [trigger, setTrigger] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px' }}>
      <h3 style={{ color: '#fff', margin: 0 }}>CheckmarkDraw Showcase</h3>
      
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center' }}>
          <CheckmarkDraw size={32} variant="default" trigger={trigger} />
          <p style={{ color: '#71717a', fontSize: '12px', margin: '8px 0 0' }}>Default</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <CheckmarkDraw size={32} variant="success" glow trigger={trigger} />
          <p style={{ color: '#71717a', fontSize: '12px', margin: '8px 0 0' }}>Success + Glow</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <CheckmarkDraw size={32} variant="gold" showCircle trigger={trigger} />
          <p style={{ color: '#71717a', fontSize: '12px', margin: '8px 0 0' }}>Gold + Circle</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <CheckmarkDraw size={32} variant="success" showCircle glow trigger={trigger} />
          <p style={{ color: '#71717a', fontSize: '12px', margin: '8px 0 0' }}>Full</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <AnimatedX size={32} glow trigger={trigger} />
          <p style={{ color: '#71717a', fontSize: '12px', margin: '8px 0 0' }}>X (Error)</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <CheckmarkBadge label="Beat" trigger={trigger} />
        <CheckmarkBadge label="Confirmed" variant="gold" bgColor="rgba(251, 191, 36, 0.15)" trigger={trigger} />
        <ResultIcon result="beat" trigger={trigger} />
        <ResultIcon result="miss" trigger={trigger} />
      </div>

      <button
        onClick={() => {
          setTrigger(false);
          setTimeout(() => setTrigger(true), 50);
        }}
        style={{
          padding: '8px 16px',
          backgroundColor: '#3b82f6',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          width: 'fit-content',
        }}
      >
        Replay Animation
      </button>
    </div>
  );
}

export default CheckmarkDraw;
