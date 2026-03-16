'use client';

/**
 * GradientWipe - Premium Content Reveal Animation
 * 
 * Creates a "painted in" reveal effect where content appears through
 * an animated gradient mask that sweeps across the element.
 * 
 * Inspiration:
 * - Linear.app headline reveals
 * - Stripe landing page text animations  
 * - Apple keynote text reveals
 * - 2024/2025 "cinematic UI" trend
 * 
 * Features:
 * - Smooth gradient mask animation (left-to-right, diagonal, etc.)
 * - Configurable direction, duration, and easing
 * - Optional shimmer trail effect
 * - Trigger on mount, scroll, or value change
 * - Respects prefers-reduced-motion
 * - Works with any content (text, images, components)
 */

import { useEffect, useRef, useState, useCallback, ReactNode, memo, useMemo } from 'react';

type WipeDirection = 'left' | 'right' | 'up' | 'down' | 'diagonal';

interface GradientWipeProps {
  children: ReactNode;
  /** Direction of the wipe animation */
  direction?: WipeDirection;
  /** Animation duration in ms */
  duration?: number;
  /** Delay before animation starts (ms) */
  delay?: number;
  /** CSS easing function */
  easing?: string;
  /** Gradient spread width (affects softness of edge) */
  spread?: number;
  /** Show shimmer trail during reveal */
  shimmer?: boolean;
  /** Shimmer color */
  shimmerColor?: string;
  /** Trigger mode */
  trigger?: 'mount' | 'inView' | 'manual';
  /** Manual trigger state (when trigger='manual') */
  isRevealed?: boolean;
  /** Intersection threshold (when trigger='inView') */
  threshold?: number;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Additional className */
  className?: string;
  /** Inline style override */
  style?: React.CSSProperties;
}

// Convert direction to gradient angle
function getGradientAngle(direction: WipeDirection): number {
  switch (direction) {
    case 'left': return 270;
    case 'right': return 90;
    case 'up': return 0;
    case 'down': return 180;
    case 'diagonal': return 135;
    default: return 90;
  }
}

// Get initial and final gradient positions based on direction
function getGradientPositions(direction: WipeDirection, spread: number) {
  // Position is the center of the gradient
  // We animate from -spread (fully hidden) to 100+spread (fully revealed)
  const start = -spread;
  const end = 100 + spread;
  return { start, end };
}

export const GradientWipe = memo(function GradientWipe({
  children,
  direction = 'right',
  duration = 800,
  delay = 0,
  easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
  spread = 30,
  shimmer = true,
  shimmerColor = 'rgba(255, 255, 255, 0.5)',
  trigger = 'mount',
  isRevealed: manualRevealed,
  threshold = 0.2,
  onComplete,
  className = '',
  style = {},
}: GradientWipeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Check for reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Animation loop using requestAnimationFrame
  const animate = useCallback(() => {
    if (startTimeRef.current === null) {
      startTimeRef.current = performance.now();
    }

    const elapsed = performance.now() - startTimeRef.current;
    const rawProgress = Math.min(elapsed / duration, 1);
    
    // Apply easing (approximation of cubic-bezier(0.4, 0, 0.2, 1))
    const easedProgress = 1 - Math.pow(1 - rawProgress, 3);
    
    setProgress(easedProgress);

    if (rawProgress < 1) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      setIsAnimating(false);
      setHasRevealed(true);
      onComplete?.();
    }
  }, [duration, onComplete]);

  // Start animation
  const startAnimation = useCallback(() => {
    if (isAnimating || hasRevealed || prefersReducedMotion) return;
    
    setIsAnimating(true);
    startTimeRef.current = null;
    
    // Apply delay
    setTimeout(() => {
      animationRef.current = requestAnimationFrame(animate);
    }, delay);
  }, [animate, delay, hasRevealed, isAnimating, prefersReducedMotion]);

  // Handle different trigger modes
  useEffect(() => {
    if (prefersReducedMotion) {
      setHasRevealed(true);
      return;
    }

    if (trigger === 'mount') {
      startAnimation();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [trigger, startAnimation, prefersReducedMotion]);

  // Intersection Observer for inView trigger
  useEffect(() => {
    if (trigger !== 'inView' || prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRevealed) {
          startAnimation();
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [trigger, threshold, hasRevealed, startAnimation, prefersReducedMotion]);

  // Manual trigger
  useEffect(() => {
    if (trigger === 'manual' && manualRevealed && !hasRevealed) {
      startAnimation();
    }
  }, [trigger, manualRevealed, hasRevealed, startAnimation]);

  // Calculate gradient mask
  const gradientMask = useMemo(() => {
    if (prefersReducedMotion || hasRevealed) {
      return 'none';
    }

    const angle = getGradientAngle(direction);
    const { start, end } = getGradientPositions(direction, spread);
    const currentPos = start + (end - start) * progress;
    
    // Create gradient: transparent (revealed) -> black (hidden)
    // The gradient edge creates the "wipe" effect
    const halfSpread = spread / 2;
    
    return `linear-gradient(
      ${angle}deg,
      black 0%,
      black ${currentPos - halfSpread}%,
      transparent ${currentPos}%,
      transparent ${currentPos + halfSpread}%,
      transparent 100%
    )`;
  }, [direction, spread, progress, prefersReducedMotion, hasRevealed]);

  // Shimmer overlay gradient
  const shimmerGradient = useMemo(() => {
    if (!shimmer || prefersReducedMotion || hasRevealed || !isAnimating) {
      return 'none';
    }

    const angle = getGradientAngle(direction);
    const { start, end } = getGradientPositions(direction, spread);
    const currentPos = start + (end - start) * progress;
    
    return `linear-gradient(
      ${angle}deg,
      transparent ${currentPos - spread}%,
      ${shimmerColor} ${currentPos - 5}%,
      ${shimmerColor} ${currentPos + 5}%,
      transparent ${currentPos + spread}%
    )`;
  }, [shimmer, direction, spread, progress, shimmerColor, prefersReducedMotion, hasRevealed, isAnimating]);

  // For reduced motion, just show content immediately
  if (prefersReducedMotion) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`gradient-wipe ${className}`}
      style={{
        position: 'relative',
        ...style,
      }}
    >
      {/* Content layer */}
      <div
        className="gradient-wipe-content"
        style={{
          WebkitMaskImage: hasRevealed ? 'none' : gradientMask,
          maskImage: hasRevealed ? 'none' : gradientMask,
          opacity: hasRevealed ? 1 : (progress > 0 ? 1 : 0),
        }}
      >
        {children}
      </div>
      
      {/* Shimmer overlay */}
      {shimmer && isAnimating && (
        <div
          className="gradient-wipe-shimmer"
          style={{
            position: 'absolute',
            inset: 0,
            background: shimmerGradient,
            pointerEvents: 'none',
            mixBlendMode: 'overlay',
          }}
          aria-hidden="true"
        />
      )}
      
      <style jsx>{`
        .gradient-wipe {
          /* Container styles */
        }
        
        .gradient-wipe-content {
          transition: opacity 0.15s ease;
          will-change: mask-image, -webkit-mask-image;
        }
        
        .gradient-wipe-shimmer {
          will-change: background;
        }
      `}</style>
    </div>
  );
});

/**
 * GradientWipeText - Convenience wrapper for text reveals
 */
interface GradientWipeTextProps extends Omit<GradientWipeProps, 'children'> {
  text: string;
  /** Element type */
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
  /** Text className */
  textClassName?: string;
}

export const GradientWipeText = memo(function GradientWipeText({
  text,
  as: Component = 'span',
  textClassName = '',
  ...wipeProps
}: GradientWipeTextProps) {
  return (
    <GradientWipe {...wipeProps}>
      <Component className={textClassName}>{text}</Component>
    </GradientWipe>
  );
});

/**
 * GradientWipeNumber - Animated number reveal with gradient wipe
 */
interface GradientWipeNumberProps extends Omit<GradientWipeProps, 'children'> {
  value: number;
  /** Number of decimal places */
  decimals?: number;
  /** Prefix (e.g., "$") */
  prefix?: string;
  /** Suffix (e.g., "%") */
  suffix?: string;
  /** Number className */
  numberClassName?: string;
}

export const GradientWipeNumber = memo(function GradientWipeNumber({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  numberClassName = '',
  ...wipeProps
}: GradientWipeNumberProps) {
  const formattedValue = value.toFixed(decimals);
  const displayText = `${prefix}${formattedValue}${suffix}`;
  
  return (
    <GradientWipe {...wipeProps}>
      <span className={numberClassName}>{displayText}</span>
    </GradientWipe>
  );
});

/**
 * GradientWipeGroup - Staggered reveal for multiple items
 */
interface GradientWipeGroupProps {
  children: ReactNode[];
  /** Base direction for all items */
  direction?: WipeDirection;
  /** Base duration per item */
  duration?: number;
  /** Stagger delay between items (ms) */
  stagger?: number;
  /** Initial delay before first item (ms) */
  initialDelay?: number;
  /** Trigger mode */
  trigger?: 'mount' | 'inView';
  /** Intersection threshold */
  threshold?: number;
  /** Container className */
  className?: string;
}

export const GradientWipeGroup = memo(function GradientWipeGroup({
  children,
  direction = 'right',
  duration = 600,
  stagger = 100,
  initialDelay = 0,
  trigger = 'mount',
  threshold = 0.2,
  className = '',
}: GradientWipeGroupProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldTrigger, setShouldTrigger] = useState(trigger === 'mount');

  // Intersection Observer for inView trigger
  useEffect(() => {
    if (trigger !== 'inView') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldTrigger(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [trigger, threshold]);

  return (
    <div ref={containerRef} className={`gradient-wipe-group ${className}`}>
      {children.map((child, index) => (
        <GradientWipe
          key={index}
          direction={direction}
          duration={duration}
          delay={initialDelay + index * stagger}
          trigger="manual"
          isRevealed={shouldTrigger}
        >
          {child}
        </GradientWipe>
      ))}
    </div>
  );
});

export default GradientWipe;
