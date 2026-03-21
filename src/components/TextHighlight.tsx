'use client';

import { useEffect, useState, useRef, ReactNode, CSSProperties } from 'react';

/**
 * TextHighlight - Animated Marker/Highlighter Effect
 * 
 * Inspired by:
 * - Hand-drawn highlighter pen animations
 * - Stripe's animated text emphasis
 * - Linear's product landing pages
 * - Editorial design highlighting
 * 
 * Creates an animated highlighter effect that "draws" behind text,
 * mimicking a real highlighter marker. Perfect for emphasizing
 * key stats, important values, or call-to-action text.
 * 
 * The highlight animates in from left-to-right with a slight
 * hand-drawn wobble effect, giving it an organic feel.
 * 
 * Usage:
 * <TextHighlight color="green" animate="onView">
 *   +5.2% BEAT
 * </TextHighlight>
 * 
 * <TextHighlight color="amber" delay={200}>
 *   94% odds
 * </TextHighlight>
 */

type HighlightColor = 'green' | 'red' | 'amber' | 'blue' | 'purple' | 'pink' | 'cyan';
type AnimateTrigger = 'onMount' | 'onView' | 'onHover' | 'always';

interface TextHighlightProps {
  children: ReactNode;
  /** Highlight color */
  color?: HighlightColor;
  /** When to animate the highlight */
  animate?: AnimateTrigger;
  /** Animation duration (ms) */
  duration?: number;
  /** Delay before animation starts (ms) */
  delay?: number;
  /** Highlight height as percentage of text (0.3 = 30%) */
  height?: number;
  /** Vertical offset - where highlight sits (0 = middle, 1 = bottom) */
  offset?: number;
  /** Add hand-drawn wobble effect */
  wobble?: boolean;
  /** Highlight opacity (0-1) */
  opacity?: number;
  /** Border radius in pixels */
  radius?: number;
  /** Additional class for the text */
  className?: string;
  /** Additional class for the highlight */
  highlightClassName?: string;
}

// Color palettes for different highlight colors
const highlightColors: Record<HighlightColor, { light: string; dark: string }> = {
  green: {
    light: 'rgba(74, 222, 128, 0.4)',   // green-400/40
    dark: 'rgba(34, 197, 94, 0.35)',    // green-500/35
  },
  red: {
    light: 'rgba(248, 113, 113, 0.4)',  // red-400/40
    dark: 'rgba(239, 68, 68, 0.35)',    // red-500/35
  },
  amber: {
    light: 'rgba(251, 191, 36, 0.45)',  // amber-400/45
    dark: 'rgba(245, 158, 11, 0.4)',    // amber-500/40
  },
  blue: {
    light: 'rgba(96, 165, 250, 0.4)',   // blue-400/40
    dark: 'rgba(59, 130, 246, 0.35)',   // blue-500/35
  },
  purple: {
    light: 'rgba(168, 85, 247, 0.4)',   // purple-500/40
    dark: 'rgba(139, 92, 246, 0.35)',   // violet-500/35
  },
  pink: {
    light: 'rgba(236, 72, 153, 0.4)',   // pink-500/40
    dark: 'rgba(219, 39, 119, 0.35)',   // pink-600/35
  },
  cyan: {
    light: 'rgba(34, 211, 238, 0.4)',   // cyan-400/40
    dark: 'rgba(6, 182, 212, 0.35)',    // cyan-500/35
  },
};

// Generate wobble path for SVG clip-path
function generateWobblePath(wobbleIntensity: number = 0.02): string {
  const points: string[] = [];
  const steps = 20;
  
  // Top edge (left to right) with wobble
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * 100;
    const y = Math.sin(i * 0.8) * wobbleIntensity * 100;
    points.push(`${x}% ${y}%`);
  }
  
  // Right edge
  points.push('100% 100%');
  
  // Bottom edge (right to left) with wobble
  for (let i = steps; i >= 0; i--) {
    const x = (i / steps) * 100;
    const y = 100 + Math.sin(i * 0.6 + 2) * wobbleIntensity * 100;
    points.push(`${x}% ${y}%`);
  }
  
  return `polygon(${points.join(', ')})`;
}

export function TextHighlight({
  children,
  color = 'amber',
  animate = 'onView',
  duration = 600,
  delay = 0,
  height = 0.4,
  offset = 0.7,
  wobble = true,
  opacity = 1,
  radius = 2,
  className = '',
  highlightClassName = '',
}: TextHighlightProps) {
  const [isAnimating, setIsAnimating] = useState(animate === 'always');
  const [progress, setProgress] = useState(animate === 'always' ? 100 : 0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const animationRef = useRef<number | null>(null);
  
  const colorPalette = highlightColors[color];
  const wobblePath = wobble ? generateWobblePath(0.015) : 'none';
  
  // Animate the highlight drawing effect
  const animateHighlight = () => {
    if (hasAnimated && animate !== 'onHover' && animate !== 'always') return;
    
    const startTime = performance.now();
    setIsAnimating(true);
    
    const tick = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);
      
      // Ease-out-cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - rawProgress, 3);
      setProgress(eased * 100);
      
      if (rawProgress < 1) {
        animationRef.current = requestAnimationFrame(tick);
      } else {
        setIsAnimating(false);
        setHasAnimated(true);
      }
    };
    
    setTimeout(() => {
      animationRef.current = requestAnimationFrame(tick);
    }, delay);
  };
  
  // Reset animation (for hover mode)
  const resetHighlight = () => {
    if (animate === 'onHover') {
      setProgress(0);
      setHasAnimated(false);
    }
  };
  
  // Intersection Observer for onView trigger
  useEffect(() => {
    if (animate !== 'onView' || !containerRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            animateHighlight();
          }
        });
      },
      { threshold: 0.5 }
    );
    
    observer.observe(containerRef.current);
    
    return () => observer.disconnect();
  }, [animate, hasAnimated]);
  
  // Mount animation
  useEffect(() => {
    if (animate === 'onMount') {
      animateHighlight();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // Mouse handlers for hover animation
  const handleMouseEnter = () => {
    if (animate === 'onHover') {
      animateHighlight();
    }
  };
  
  const handleMouseLeave = () => {
    if (animate === 'onHover') {
      resetHighlight();
    }
  };
  
  const containerStyle: CSSProperties = {
    position: 'relative',
    display: 'inline',
    isolation: 'isolate',
  };
  
  const highlightStyle: CSSProperties = {
    position: 'absolute',
    left: '-2px',
    right: '-2px',
    top: `${offset * 100 - height * 50}%`,
    height: `${height * 100}%`,
    background: `linear-gradient(90deg, ${colorPalette.light}, ${colorPalette.dark})`,
    opacity: opacity,
    borderRadius: `${radius}px`,
    clipPath: wobble ? wobblePath : 'none',
    transform: 'translateZ(0)',
    zIndex: -1,
    // The key animation: scale from left
    transformOrigin: 'left center',
    width: `${progress}%`,
    transition: isAnimating ? 'none' : 'width 0.3s ease-out',
  };
  
  const textStyle: CSSProperties = {
    position: 'relative',
    zIndex: 1,
  };
  
  return (
    <span
      ref={containerRef}
      style={containerStyle}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span
        className={highlightClassName}
        style={highlightStyle}
        aria-hidden="true"
      />
      <span style={textStyle}>{children}</span>
    </span>
  );
}

/**
 * HighlightedValue - Pre-styled for numeric values (EPS, percentages)
 */
export function HighlightedValue({
  value,
  positive,
  animate = 'onView',
  className = '',
}: {
  value: string | number;
  positive?: boolean;
  animate?: AnimateTrigger;
  className?: string;
}) {
  // Auto-detect positive/negative from value if not specified
  const isPositive = positive ?? (
    typeof value === 'number' 
      ? value >= 0 
      : !String(value).startsWith('-')
  );
  
  return (
    <TextHighlight
      color={isPositive ? 'green' : 'red'}
      animate={animate}
      height={0.35}
      offset={0.75}
      className={className}
    >
      {typeof value === 'number' && value >= 0 ? '+' : ''}
      {value}
    </TextHighlight>
  );
}

/**
 * HighlightedBeat - Styled for BEAT badges
 */
export function HighlightedBeat({
  percentage,
  animate = 'onView',
  delay = 0,
}: {
  percentage: string | number;
  animate?: AnimateTrigger;
  delay?: number;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <TextHighlight
        color="green"
        animate={animate}
        delay={delay}
        height={0.5}
        offset={0.65}
        duration={500}
      >
        <span className="font-semibold text-green-600 dark:text-green-400">
          +{percentage}%
        </span>
      </TextHighlight>
      <TextHighlight
        color="green"
        animate={animate}
        delay={delay + 150}
        height={0.6}
        offset={0.6}
        duration={400}
      >
        <span className="text-xs font-bold uppercase tracking-wider text-green-700 dark:text-green-300">
          BEAT
        </span>
      </TextHighlight>
    </span>
  );
}

/**
 * HighlightedMiss - Styled for MISS badges
 */
export function HighlightedMiss({
  percentage,
  animate = 'onView',
  delay = 0,
}: {
  percentage: string | number;
  animate?: AnimateTrigger;
  delay?: number;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <TextHighlight
        color="red"
        animate={animate}
        delay={delay}
        height={0.5}
        offset={0.65}
        duration={500}
      >
        <span className="font-semibold text-red-600 dark:text-red-400">
          {percentage}%
        </span>
      </TextHighlight>
      <TextHighlight
        color="red"
        animate={animate}
        delay={delay + 150}
        height={0.6}
        offset={0.6}
        duration={400}
      >
        <span className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-300">
          MISS
        </span>
      </TextHighlight>
    </span>
  );
}

/**
 * HighlightedOdds - Styled for probability percentages
 */
export function HighlightedOdds({
  odds,
  animate = 'onView',
  delay = 0,
}: {
  odds: number;
  animate?: AnimateTrigger;
  delay?: number;
}) {
  // Color based on odds confidence
  const color: HighlightColor = 
    odds >= 80 ? 'green' : 
    odds >= 60 ? 'amber' : 
    'blue';
  
  return (
    <TextHighlight
      color={color}
      animate={animate}
      delay={delay}
      height={0.45}
      offset={0.7}
      duration={450}
    >
      <span className="font-medium">
        {odds}%
        <span className="text-xs ml-0.5 opacity-70">odds</span>
      </span>
    </TextHighlight>
  );
}

/**
 * TextHighlightGroup - Stagger multiple highlights
 */
export function TextHighlightGroup({
  children,
  staggerDelay = 100,
  animate = 'onView',
}: {
  children: ReactNode[];
  staggerDelay?: number;
  animate?: AnimateTrigger;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      {children.map((child, index) => (
        <TextHighlight
          key={index}
          color="amber"
          animate={animate}
          delay={index * staggerDelay}
        >
          {child}
        </TextHighlight>
      ))}
    </span>
  );
}

export default TextHighlight;
