'use client';

import { memo, ReactNode, CSSProperties, useEffect, useState, useRef } from 'react';

/**
 * WavyUnderline - Animated Squiggly Underline Text Effect
 * 
 * Adds a playful, animated wavy underline beneath text content. The wave
 * animates smoothly, creating a dynamic, attention-grabbing effect that's
 * popular in 2026 premium marketing sites and editorial design.
 * 
 * Inspiration:
 * - Apple's playful marketing headlines
 * - Notion's emphasis styling
 * - Stripe's animated text highlights
 * - Editorial/magazine design squiggly annotations
 * - 2026 "expressive minimalism" trend
 * 
 * Features:
 * - SVG-based wave for crisp rendering at any size
 * - Configurable wave frequency and amplitude
 * - Multiple animation modes: flow, pulse, draw
 * - Color variants matching brand palette
 * - Hover activation option
 * - Scroll-triggered animation
 * - Full prefers-reduced-motion support
 * - Works with any text content
 * 
 * @example
 * // Basic wavy underline
 * <WavyUnderline>Important text</WavyUnderline>
 * 
 * // Animated on hover
 * <WavyUnderline animated="hover" color="accent">
 *   Hover me
 * </WavyUnderline>
 * 
 * // Draw animation on scroll
 * <WavyUnderline animated="draw" triggerOnScroll>
 *   Revealed text
 * </WavyUnderline>
 */

type AnimationMode = 'none' | 'flow' | 'pulse' | 'draw' | 'hover';
type ColorVariant = 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'muted';

interface WavyUnderlineProps {
  children: ReactNode;
  /** Animation mode for the underline */
  animated?: AnimationMode;
  /** Color variant */
  color?: ColorVariant;
  /** Custom color (overrides variant) */
  customColor?: string;
  /** Wave frequency (waves per em) */
  frequency?: number;
  /** Wave amplitude in pixels */
  amplitude?: number;
  /** Stroke width in pixels */
  strokeWidth?: number;
  /** Animation duration in ms */
  duration?: number;
  /** Trigger animation when scrolling into view */
  triggerOnScroll?: boolean;
  /** Delay before animation starts (ms) */
  delay?: number;
  /** Offset from text baseline (px) */
  offset?: number;
  /** Additional className */
  className?: string;
  /** Render as different element */
  as?: 'span' | 'div' | 'mark' | 'em' | 'strong';
}

// Color palette matching brand
const COLOR_VARIANTS: Record<ColorVariant, { stroke: string; glow: string }> = {
  default: { 
    stroke: 'var(--text-primary, #e4e4e7)', 
    glow: 'rgba(228, 228, 231, 0.3)' 
  },
  accent: { 
    stroke: 'var(--accent-purple, #8b5cf6)', 
    glow: 'rgba(139, 92, 246, 0.4)' 
  },
  success: { 
    stroke: 'var(--success, #22c55e)', 
    glow: 'rgba(34, 197, 94, 0.4)' 
  },
  warning: { 
    stroke: 'var(--warning, #f59e0b)', 
    glow: 'rgba(245, 158, 11, 0.4)' 
  },
  danger: { 
    stroke: 'var(--danger, #ef4444)', 
    glow: 'rgba(239, 68, 68, 0.4)' 
  },
  muted: { 
    stroke: 'var(--text-muted, #71717a)', 
    glow: 'rgba(113, 113, 122, 0.3)' 
  },
};

// Generate SVG wave path
function generateWavePath(
  width: number, 
  frequency: number, 
  amplitude: number
): string {
  const wavelength = width / frequency;
  const segments: string[] = [];
  
  // Start at the left edge
  segments.push(`M 0 ${amplitude}`);
  
  // Generate smooth curves
  for (let i = 0; i < frequency; i++) {
    const x1 = i * wavelength + wavelength * 0.25;
    const x2 = i * wavelength + wavelength * 0.5;
    const x3 = i * wavelength + wavelength * 0.75;
    const x4 = (i + 1) * wavelength;
    
    // Bezier curve for smooth wave
    segments.push(`C ${x1} ${amplitude * 2}, ${x2} ${amplitude * 2}, ${x2} ${amplitude}`);
    segments.push(`C ${x2} ${amplitude}, ${x3} 0, ${x4} ${amplitude}`);
  }
  
  return segments.join(' ');
}

const WavyUnderline = memo(function WavyUnderline({
  children,
  animated = 'flow',
  color = 'accent',
  customColor,
  frequency = 3,
  amplitude = 3,
  strokeWidth = 2,
  duration = 2000,
  triggerOnScroll = false,
  delay = 0,
  offset = 2,
  className = '',
  as: Component = 'span',
}: WavyUnderlineProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(!triggerOnScroll);
  const [isHovered, setIsHovered] = useState(false);
  const [containerWidth, setContainerWidth] = useState(100);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  // Get colors
  const colorConfig = COLOR_VARIANTS[color];
  const strokeColor = customColor || colorConfig.stroke;
  const glowColor = customColor ? `${customColor}66` : colorConfig.glow;
  
  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  
  // Measure container width
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);
  
  // Intersection observer for scroll trigger
  useEffect(() => {
    if (!triggerOnScroll || !containerRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.5 }
    );
    
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [triggerOnScroll, delay]);
  
  // Determine if animation should play
  const shouldAnimate = !prefersReducedMotion && (
    (animated === 'flow' && isVisible) ||
    (animated === 'pulse' && isVisible) ||
    (animated === 'draw' && isVisible) ||
    (animated === 'hover' && isHovered)
  );
  
  // Calculate wave dimensions
  const waveWidth = containerWidth;
  const waveHeight = amplitude * 2 + strokeWidth;
  const wavePath = generateWavePath(waveWidth, frequency, amplitude);
  
  // Calculate path length for draw animation
  const pathLength = waveWidth * 1.5; // Approximate
  
  // Get animation styles
  const getAnimationStyle = (): CSSProperties => {
    if (prefersReducedMotion || animated === 'none') {
      return {};
    }
    
    switch (animated) {
      case 'flow':
        return {
          animation: shouldAnimate 
            ? `wavy-flow ${duration}ms linear infinite` 
            : 'none',
        };
      case 'pulse':
        return {
          animation: shouldAnimate 
            ? `wavy-pulse ${duration}ms ease-in-out infinite` 
            : 'none',
        };
      case 'draw':
        return {
          strokeDasharray: pathLength,
          strokeDashoffset: shouldAnimate ? 0 : pathLength,
          transition: `stroke-dashoffset ${duration}ms ease-out`,
        };
      case 'hover':
        return {
          animation: shouldAnimate 
            ? `wavy-flow ${duration * 0.5}ms linear infinite` 
            : 'none',
          opacity: isHovered ? 1 : 0.5,
          transition: 'opacity 0.2s ease',
        };
      default:
        return {};
    }
  };
  
  return (
    <Component
      ref={containerRef as any}
      className={`wavy-underline-container ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        display: 'inline-block',
      }}
    >
      {/* Text content */}
      <span className="wavy-underline-text">{children}</span>
      
      {/* SVG wave underline */}
      <svg
        className="wavy-underline-svg"
        width={waveWidth}
        height={waveHeight}
        viewBox={`0 0 ${waveWidth} ${waveHeight}`}
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          bottom: -offset,
          left: 0,
          overflow: 'visible',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        {/* Glow effect layer */}
        {!prefersReducedMotion && (
          <path
            d={wavePath}
            fill="none"
            stroke={glowColor}
            strokeWidth={strokeWidth * 2.5}
            strokeLinecap="round"
            style={{
              filter: 'blur(3px)',
              ...getAnimationStyle(),
            }}
          />
        )}
        
        {/* Main wave path */}
        <path
          d={wavePath}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={getAnimationStyle()}
        />
      </svg>
      
      {/* Embedded keyframes */}
      <style jsx global>{`
        @keyframes wavy-flow {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-${100 / frequency}%);
          }
        }
        
        @keyframes wavy-pulse {
          0%, 100% {
            opacity: 0.6;
            stroke-width: ${strokeWidth}px;
          }
          50% {
            opacity: 1;
            stroke-width: ${strokeWidth * 1.5}px;
          }
        }
        
        /* Ensure text is above underline */
        .wavy-underline-text {
          position: relative;
          z-index: 1;
        }
        
        /* Light mode adjustments */
        html.light .wavy-underline-svg path {
          filter: brightness(0.9);
        }
      `}</style>
    </Component>
  );
});

/**
 * WavyHighlight - Text with wavy underline emphasis
 * Convenience wrapper for common use case
 */
interface WavyHighlightProps extends Omit<WavyUnderlineProps, 'children'> {
  children: ReactNode;
  /** Whether the highlight is active */
  active?: boolean;
}

export const WavyHighlight = memo(function WavyHighlight({
  children,
  active = true,
  ...props
}: WavyHighlightProps) {
  if (!active) {
    return <span>{children}</span>;
  }
  
  return <WavyUnderline {...props}>{children}</WavyUnderline>;
});

/**
 * WavyLink - Link with animated wavy underline on hover
 */
interface WavyLinkProps extends Omit<WavyUnderlineProps, 'animated' | 'as'> {
  href: string;
  children: ReactNode;
  external?: boolean;
}

export const WavyLink = memo(function WavyLink({
  href,
  children,
  external = false,
  ...props
}: WavyLinkProps) {
  return (
    <a 
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <WavyUnderline animated="hover" {...props}>
        {children}
      </WavyUnderline>
    </a>
  );
});

/**
 * useWavyUnderline - Hook for applying wavy underline to custom elements
 */
export function useWavyUnderline(options: {
  color?: ColorVariant;
  frequency?: number;
  amplitude?: number;
  animated?: AnimationMode;
} = {}) {
  const [isHovered, setIsHovered] = useState(false);
  
  return {
    isHovered,
    handlers: {
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
    },
    ...options,
  };
}

export { WavyUnderline };
export default WavyUnderline;
