'use client';

import React, { useRef, useEffect, useState, ReactNode, CSSProperties } from 'react';

/**
 * ClipWipeReveal - Premium hard-edge reveal animation using CSS clip-path
 * 
 * Inspired by:
 * - Apple keynote text reveals with sharp wipe transitions
 * - ESPN score reveals where numbers wipe in dramatically
 * - Bloomberg Terminal data updates with clean edge reveals
 * - 2026 "Precision Motion" trend — sharp, intentional reveals vs soft fades
 * - CSS-Tricks "Animating with Clip-Path" patterns
 * 
 * Unlike BlurReveal (soft blur-to-clear), ClipWipeReveal uses a hard edge
 * that wipes across the content. This creates a more dramatic, intentional
 * reveal perfect for important data like earnings results, prices, or scores.
 * 
 * Features:
 * - Hard-edge wipe animation using clip-path: inset()
 * - Multiple direction options (left, right, top, bottom, center)
 * - Optional highlight line that follows the wipe edge
 * - Intersection Observer for scroll-triggered reveals
 * - Staggered reveal for multiple children
 * - GPU-accelerated with will-change hints
 * - Respects prefers-reduced-motion
 * - Light/dark mode compatible
 * 
 * Usage:
 * <ClipWipeReveal>
 *   <span className="text-2xl font-bold">$1.42</span>
 * </ClipWipeReveal>
 * 
 * <ClipWipeReveal direction="center" showHighlight>
 *   <Badge variant="success">+15.3%</Badge>
 * </ClipWipeReveal>
 */

type WipeDirection = 'left' | 'right' | 'top' | 'bottom' | 'center-h' | 'center-v';

interface ClipWipeRevealProps {
  children: ReactNode;
  /** Direction of the wipe reveal */
  direction?: WipeDirection;
  /** Animation duration in ms */
  duration?: number;
  /** Delay before animation starts (ms) */
  delay?: number;
  /** Easing function */
  easing?: string;
  /** Show a highlight line at the wipe edge */
  showHighlight?: boolean;
  /** Highlight color (defaults to theme accent) */
  highlightColor?: string;
  /** Highlight width in pixels */
  highlightWidth?: number;
  /** Trigger on mount instead of scroll-into-view */
  triggerOnMount?: boolean;
  /** IntersectionObserver threshold */
  threshold?: number;
  /** HTML tag to render */
  as?: React.ElementType;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Callback when reveal animation completes */
  onRevealComplete?: () => void;
}

// Generate clip-path values based on direction and progress
function getClipPath(direction: WipeDirection, progress: number): string {
  // progress: 0 = fully hidden, 1 = fully revealed
  const hidden = 100 - (progress * 100);
  
  switch (direction) {
    case 'left':
      // Reveal from left to right
      return `inset(0 ${hidden}% 0 0)`;
    case 'right':
      // Reveal from right to left
      return `inset(0 0 0 ${hidden}%)`;
    case 'top':
      // Reveal from top to bottom
      return `inset(0 0 ${hidden}% 0)`;
    case 'bottom':
      // Reveal from bottom to top
      return `inset(${hidden}% 0 0 0)`;
    case 'center-h':
      // Reveal from center horizontally
      const halfH = hidden / 2;
      return `inset(0 ${halfH}% 0 ${halfH}%)`;
    case 'center-v':
      // Reveal from center vertically
      const halfV = hidden / 2;
      return `inset(${halfV}% 0 ${halfV}% 0)`;
    default:
      return 'inset(0 0 0 0)';
  }
}

// Get highlight position based on direction and progress
function getHighlightStyle(
  direction: WipeDirection, 
  progress: number,
  width: number,
  color: string
): CSSProperties {
  const pos = progress * 100;
  
  const baseStyle: CSSProperties = {
    position: 'absolute',
    backgroundColor: color,
    opacity: progress > 0 && progress < 1 ? 1 : 0,
    transition: 'opacity 150ms ease-out',
    pointerEvents: 'none',
    zIndex: 2,
  };
  
  switch (direction) {
    case 'left':
      return {
        ...baseStyle,
        top: 0,
        bottom: 0,
        left: `${pos}%`,
        width: `${width}px`,
        transform: 'translateX(-50%)',
      };
    case 'right':
      return {
        ...baseStyle,
        top: 0,
        bottom: 0,
        right: `${pos}%`,
        width: `${width}px`,
        transform: 'translateX(50%)',
      };
    case 'top':
      return {
        ...baseStyle,
        left: 0,
        right: 0,
        top: `${pos}%`,
        height: `${width}px`,
        transform: 'translateY(-50%)',
      };
    case 'bottom':
      return {
        ...baseStyle,
        left: 0,
        right: 0,
        bottom: `${pos}%`,
        height: `${width}px`,
        transform: 'translateY(50%)',
      };
    case 'center-h':
      // Two vertical lines expanding from center
      return {
        ...baseStyle,
        top: 0,
        bottom: 0,
        left: '50%',
        width: `${pos}%`,
        transform: 'translateX(-50%)',
        background: `linear-gradient(90deg, ${color} 0%, transparent 10%, transparent 90%, ${color} 100%)`,
      };
    case 'center-v':
      // Two horizontal lines expanding from center
      return {
        ...baseStyle,
        left: 0,
        right: 0,
        top: '50%',
        height: `${pos}%`,
        transform: 'translateY(-50%)',
        background: `linear-gradient(180deg, ${color} 0%, transparent 10%, transparent 90%, ${color} 100%)`,
      };
    default:
      return baseStyle;
  }
}

export function ClipWipeReveal({
  children,
  direction = 'left',
  duration = 600,
  delay = 0,
  easing = 'cubic-bezier(0.22, 1, 0.36, 1)', // easeOutQuint
  showHighlight = false,
  highlightColor,
  highlightWidth = 2,
  triggerOnMount = false,
  threshold = 0.3,
  as: Tag = 'div',
  className = '',
  style,
  onRevealComplete,
}: ClipWipeRevealProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(triggerOnMount);
  const [progress, setProgress] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Determine highlight color based on theme
  const resolvedHighlightColor = highlightColor || 'var(--accent-blue, #3b82f6)';

  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Intersection Observer for scroll-triggered reveal
  useEffect(() => {
    if (triggerOnMount || typeof window === 'undefined') return;

    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isComplete) {
          setIsVisible(true);
        }
      },
      { threshold, rootMargin: '20px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [triggerOnMount, threshold, isComplete]);

  // Animation loop
  useEffect(() => {
    if (!isVisible || isComplete || prefersReducedMotion) {
      if (prefersReducedMotion && isVisible) {
        setProgress(1);
        setIsComplete(true);
        onRevealComplete?.();
      }
      return;
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp + delay;
      }

      const elapsed = timestamp - startTimeRef.current;
      
      if (elapsed < 0) {
        // Still in delay period
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const rawProgress = Math.min(elapsed / duration, 1);
      
      // Apply easing manually for smooth animation
      // Using easeOutQuint approximation
      const easedProgress = 1 - Math.pow(1 - rawProgress, 3);
      
      setProgress(easedProgress);

      if (rawProgress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsComplete(true);
        onRevealComplete?.();
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible, isComplete, delay, duration, prefersReducedMotion, onRevealComplete]);

  const clipPath = prefersReducedMotion 
    ? 'inset(0 0 0 0)'
    : getClipPath(direction, progress);

  const highlightStyle = showHighlight && !prefersReducedMotion
    ? getHighlightStyle(direction, progress, highlightWidth, resolvedHighlightColor)
    : undefined;

  return (
    <Tag
      ref={containerRef as React.RefObject<HTMLDivElement>}
      className={`clip-wipe-reveal ${className}`}
      style={{
        position: 'relative',
        display: 'inline-block',
        ...style,
      }}
    >
      {/* Content with clip-path */}
      <span
        style={{
          display: 'block',
          clipPath,
          willChange: isVisible && !isComplete ? 'clip-path' : 'auto',
        }}
      >
        {children}
      </span>

      {/* Highlight line at wipe edge */}
      {showHighlight && highlightStyle && (
        <span 
          className="clip-wipe-highlight"
          style={highlightStyle}
          aria-hidden="true"
        />
      )}

      <style jsx>{`
        .clip-wipe-reveal {
          isolation: isolate;
        }

        .clip-wipe-highlight {
          box-shadow: 0 0 8px 2px ${resolvedHighlightColor};
        }

        @media (prefers-reduced-motion: reduce) {
          .clip-wipe-reveal * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </Tag>
  );
}

/**
 * ClipWipeRevealGroup - Staggered reveal for multiple items
 */
interface ClipWipeRevealGroupProps {
  children: ReactNode;
  /** Direction for all children */
  direction?: WipeDirection;
  /** Stagger delay between children (ms) */
  stagger?: number;
  /** Base duration for each child */
  duration?: number;
  /** Initial delay before first child reveals */
  initialDelay?: number;
  /** Props to pass to each ClipWipeReveal */
  revealProps?: Partial<ClipWipeRevealProps>;
  /** Additional class name */
  className?: string;
}

export function ClipWipeRevealGroup({
  children,
  direction = 'left',
  stagger = 80,
  duration = 500,
  initialDelay = 0,
  revealProps = {},
  className = '',
}: ClipWipeRevealGroupProps) {
  const childArray = React.Children.toArray(children);

  return (
    <div className={`clip-wipe-reveal-group ${className}`}>
      {childArray.map((child, index) => (
        <ClipWipeReveal
          key={index}
          direction={direction}
          duration={duration}
          delay={initialDelay + (index * stagger)}
          {...revealProps}
        >
          {child}
        </ClipWipeReveal>
      ))}
    </div>
  );
}

/**
 * ClipWipeNumber - Specialized variant for revealing numbers/prices
 * Adds a subtle scale effect for emphasis
 */
interface ClipWipeNumberProps extends Omit<ClipWipeRevealProps, 'children'> {
  value: string | number;
  /** Prefix (e.g., "$") */
  prefix?: string;
  /** Suffix (e.g., "%") */
  suffix?: string;
  /** Color variant */
  variant?: 'default' | 'success' | 'danger';
  /** Font size class */
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function ClipWipeNumber({
  value,
  prefix = '',
  suffix = '',
  variant = 'default',
  size = 'md',
  direction = 'left',
  showHighlight = true,
  ...props
}: ClipWipeNumberProps) {
  const variantColors = {
    default: 'var(--text-primary, #e4e4e7)',
    success: 'var(--success, #22c55e)',
    danger: 'var(--danger, #ef4444)',
  };

  const highlightColors = {
    default: 'var(--accent-blue, #3b82f6)',
    success: 'var(--success, #22c55e)',
    danger: 'var(--danger, #ef4444)',
  };

  const sizeClasses = {
    sm: 'text-sm font-medium',
    md: 'text-base font-semibold',
    lg: 'text-lg font-bold',
    xl: 'text-2xl font-bold',
  };

  return (
    <ClipWipeReveal
      direction={direction}
      showHighlight={showHighlight}
      highlightColor={highlightColors[variant]}
      {...props}
    >
      <span 
        className={`clip-wipe-number ${sizeClasses[size]}`}
        style={{ color: variantColors[variant] }}
      >
        {prefix}{value}{suffix}
      </span>
    </ClipWipeReveal>
  );
}

export default ClipWipeReveal;
