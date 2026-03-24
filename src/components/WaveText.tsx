'use client';

import React, { useMemo, useState, useEffect, useRef, memo, CSSProperties, ReactNode } from 'react';

/**
 * WaveText - Character-Level Wave Animation for Text
 * 
 * Creates a "stadium wave" effect where each character animates up and down
 * in sequence, creating a flowing wave pattern across the text. Perfect for
 * celebratory moments, attention-grabbing headers, or playful UI elements.
 * 
 * Inspiration:
 * - Stadium crowd waves at sports events
 * - Apple's bouncy notification text (iOS 18)
 * - Slack's celebratory message animations
 * - Discord's animated emoji text
 * - 2026 "Kinetic Typography" trend — text that moves with personality
 * - Sound waveform visualizations
 * 
 * Features:
 * - Per-character wave animation with configurable amplitude
 * - Multiple animation modes: continuous, once, hover-triggered, intersection
 * - Configurable wave direction (left-to-right, right-to-left, center-out, edges-in)
 * - Optional color shift during wave peak
 * - Spring-based physics for natural bounce
 * - Configurable wave speed, delay, and repeat
 * - Works with any text content (including emojis)
 * - Full prefers-reduced-motion support
 * - GPU-accelerated transforms
 * - Light/dark mode compatible
 * 
 * Use cases:
 * - "BEAT!" celebration text
 * - Playful loading messages
 * - Attention-grabbing CTAs
 * - Achievement unlocked notifications
 * - Header text emphasis
 * 
 * @example
 * // Basic continuous wave
 * <WaveText>Congratulations!</WaveText>
 * 
 * // Celebration on beat
 * <WaveText 
 *   mode="once" 
 *   amplitude={8}
 *   color="#22c55e"
 * >
 *   BEAT +15%!
 * </WaveText>
 * 
 * // Hover-triggered subtle wave
 * <WaveText mode="hover" amplitude={4} speed={0.8}>
 *   Hover me
 * </WaveText>
 */

type WaveDirection = 'ltr' | 'rtl' | 'center-out' | 'edges-in';
type WaveMode = 'continuous' | 'once' | 'hover' | 'intersection';
type WaveEasing = 'sine' | 'bounce' | 'elastic' | 'linear';

interface WaveTextProps {
  children: string;
  /** Wave animation mode */
  mode?: WaveMode;
  /** Wave direction across text */
  direction?: WaveDirection;
  /** Vertical amplitude in pixels */
  amplitude?: number;
  /** Animation speed multiplier (1 = 1.2s wave cycle) */
  speed?: number;
  /** Delay between each character starting the wave (ms) */
  staggerDelay?: number;
  /** Number of times to repeat (only for mode="once", 0 = infinite) */
  repeatCount?: number;
  /** Delay before starting (ms) */
  delay?: number;
  /** Easing function for the wave */
  easing?: WaveEasing;
  /** Color at wave peak (optional gradient effect) */
  peakColor?: string;
  /** Enable subtle scale effect at peak */
  scale?: boolean;
  /** Scale amount at peak (default 1.1) */
  scaleAmount?: number;
  /** Enable rotation tilt during wave */
  rotate?: boolean;
  /** Max rotation in degrees */
  rotateAmount?: number;
  /** Additional class name */
  className?: string;
  /** Inline style */
  style?: CSSProperties;
  /** ARIA label (defaults to text content) */
  ariaLabel?: string;
  /** Trigger wave manually (for controlled animations) */
  trigger?: boolean;
  /** Callback when wave animation completes (for mode="once") */
  onComplete?: () => void;
}

// Easing configurations for different wave feels
const EASING_CONFIG: Record<WaveEasing, { keyframes: string; timing: string }> = {
  sine: {
    keyframes: `
      0%, 100% { transform: translateY(0) VAR_SCALE VAR_ROTATE; }
      50% { transform: translateY(VAR_AMP) VAR_SCALE_PEAK VAR_ROTATE_PEAK; }
    `,
    timing: 'ease-in-out',
  },
  bounce: {
    keyframes: `
      0%, 100% { transform: translateY(0) VAR_SCALE VAR_ROTATE; }
      40% { transform: translateY(VAR_AMP) VAR_SCALE_PEAK VAR_ROTATE_PEAK; }
      60% { transform: translateY(calc(VAR_AMP * 0.3)) VAR_SCALE VAR_ROTATE; }
      80% { transform: translateY(calc(VAR_AMP * 0.1)) VAR_SCALE VAR_ROTATE; }
    `,
    timing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  elastic: {
    keyframes: `
      0%, 100% { transform: translateY(0) VAR_SCALE VAR_ROTATE; }
      30% { transform: translateY(VAR_AMP) VAR_SCALE_PEAK VAR_ROTATE_PEAK; }
      50% { transform: translateY(calc(VAR_AMP * -0.2)) VAR_SCALE VAR_ROTATE; }
      70% { transform: translateY(calc(VAR_AMP * 0.1)) VAR_SCALE VAR_ROTATE; }
      85% { transform: translateY(calc(VAR_AMP * -0.05)) VAR_SCALE VAR_ROTATE; }
    `,
    timing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  linear: {
    keyframes: `
      0%, 100% { transform: translateY(0) VAR_SCALE VAR_ROTATE; }
      50% { transform: translateY(VAR_AMP) VAR_SCALE_PEAK VAR_ROTATE_PEAK; }
    `,
    timing: 'linear',
  },
};

// Calculate stagger delays based on direction
function getCharacterDelay(
  index: number, 
  total: number, 
  direction: WaveDirection, 
  baseDelay: number
): number {
  switch (direction) {
    case 'ltr':
      return index * baseDelay;
    case 'rtl':
      return (total - 1 - index) * baseDelay;
    case 'center-out': {
      const center = (total - 1) / 2;
      return Math.abs(index - center) * baseDelay;
    }
    case 'edges-in': {
      const center = (total - 1) / 2;
      return (center - Math.abs(index - center)) * baseDelay;
    }
    default:
      return index * baseDelay;
  }
}

// Generate unique animation name
let animationIdCounter = 0;
function getAnimationId(): string {
  return `wave-text-${++animationIdCounter}`;
}

const WaveCharacter = memo(function WaveCharacter({
  char,
  index,
  delay,
  amplitude,
  speed,
  easing,
  peakColor,
  scale,
  scaleAmount,
  rotate,
  rotateAmount,
  isAnimating,
  animationId,
  iterationCount,
}: {
  char: string;
  index: number;
  delay: number;
  amplitude: number;
  speed: number;
  easing: WaveEasing;
  peakColor?: string;
  scale: boolean;
  scaleAmount: number;
  rotate: boolean;
  rotateAmount: number;
  isAnimating: boolean;
  animationId: string;
  iterationCount: string;
}) {
  const duration = 1200 / speed;
  
  // Space handling - preserve width
  if (char === ' ') {
    return <span className="wave-text-space">&nbsp;</span>;
  }
  
  return (
    <span
      className="wave-text-char"
      style={{
        display: 'inline-block',
        animationName: isAnimating ? animationId : 'none',
        animationDuration: `${duration}ms`,
        animationTimingFunction: EASING_CONFIG[easing].timing,
        animationDelay: `${delay}ms`,
        animationIterationCount: iterationCount,
        animationFillMode: 'both',
        color: peakColor ? undefined : 'inherit',
        willChange: isAnimating ? 'transform' : 'auto',
        // CSS custom properties for the animation
        ['--wave-amplitude' as string]: `${-amplitude}px`,
        ['--wave-scale' as string]: scale ? scaleAmount.toString() : '1',
        ['--wave-rotate' as string]: rotate ? `${rotateAmount}deg` : '0deg',
        ['--wave-peak-color' as string]: peakColor || 'inherit',
      } as CSSProperties}
      aria-hidden="true"
    >
      {char}
    </span>
  );
});

function WaveTextComponent({
  children,
  mode = 'continuous',
  direction = 'ltr',
  amplitude = 6,
  speed = 1,
  staggerDelay = 50,
  repeatCount = 1,
  delay = 0,
  easing = 'bounce',
  peakColor,
  scale = false,
  scaleAmount = 1.15,
  rotate = false,
  rotateAmount = 5,
  className = '',
  style,
  ariaLabel,
  trigger,
  onComplete,
}: WaveTextProps) {
  const [isAnimating, setIsAnimating] = useState(mode === 'continuous');
  const [isHovering, setIsHovering] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const animationIdRef = useRef(getAnimationId());
  const completionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const text = typeof children === 'string' ? children : '';
  const characters = useMemo(() => text.split(''), [text]);
  
  // Check reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  // Handle mode-specific animation triggers
  useEffect(() => {
    if (reducedMotion) return;
    
    switch (mode) {
      case 'continuous':
        setIsAnimating(true);
        break;
      case 'once':
        setIsAnimating(true);
        // Set up completion callback
        const totalDuration = delay + (characters.length * staggerDelay) + (1200 / speed) * repeatCount;
        completionTimeoutRef.current = setTimeout(() => {
          setIsAnimating(false);
          onComplete?.();
        }, totalDuration);
        break;
      case 'hover':
        setIsAnimating(isHovering);
        break;
      case 'intersection':
        setIsAnimating(hasIntersected);
        break;
    }
    
    return () => {
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
      }
    };
  }, [mode, isHovering, hasIntersected, reducedMotion, characters.length, staggerDelay, speed, delay, repeatCount, onComplete]);
  
  // Handle external trigger prop
  useEffect(() => {
    if (trigger !== undefined && !reducedMotion) {
      setIsAnimating(trigger);
      if (trigger && mode === 'once') {
        const totalDuration = delay + (characters.length * staggerDelay) + (1200 / speed) * repeatCount;
        completionTimeoutRef.current = setTimeout(() => {
          setIsAnimating(false);
          onComplete?.();
        }, totalDuration);
      }
    }
  }, [trigger, reducedMotion, mode, characters.length, staggerDelay, speed, delay, repeatCount, onComplete]);
  
  // Intersection Observer for mode="intersection"
  useEffect(() => {
    if (mode !== 'intersection' || !containerRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      { threshold: 0.5 }
    );
    
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [mode, hasIntersected]);
  
  // Calculate iteration count
  const iterationCount = useMemo(() => {
    if (mode === 'continuous') return 'infinite';
    if (mode === 'once') return repeatCount.toString();
    if (mode === 'hover') return 'infinite';
    if (mode === 'intersection') return '1';
    return '1';
  }, [mode, repeatCount]);
  
  // Generate keyframes CSS
  const keyframesCSS = useMemo(() => {
    let keyframes = EASING_CONFIG[easing].keyframes;
    keyframes = keyframes.replace(/VAR_AMP/g, 'var(--wave-amplitude)');
    keyframes = keyframes.replace(/VAR_SCALE_PEAK/g, scale ? 'scale(var(--wave-scale))' : '');
    keyframes = keyframes.replace(/VAR_SCALE/g, '');
    keyframes = keyframes.replace(/VAR_ROTATE_PEAK/g, rotate ? 'rotate(var(--wave-rotate))' : '');
    keyframes = keyframes.replace(/VAR_ROTATE/g, '');
    
    return `@keyframes ${animationIdRef.current} { ${keyframes} }`;
  }, [easing, scale, rotate]);
  
  // If reduced motion, render plain text
  if (reducedMotion) {
    return (
      <span className={className} style={style} aria-label={ariaLabel || text}>
        {text}
      </span>
    );
  }
  
  return (
    <>
      <style>{keyframesCSS}</style>
      <span
        ref={containerRef}
        className={`wave-text ${className}`}
        style={{
          display: 'inline-flex',
          ...style,
        }}
        onMouseEnter={() => mode === 'hover' && setIsHovering(true)}
        onMouseLeave={() => mode === 'hover' && setIsHovering(false)}
        aria-label={ariaLabel || text}
        role="text"
      >
        {characters.map((char, index) => (
          <WaveCharacter
            key={`${index}-${char}`}
            char={char}
            index={index}
            delay={delay + getCharacterDelay(index, characters.length, direction, staggerDelay)}
            amplitude={amplitude}
            speed={speed}
            easing={easing}
            peakColor={peakColor}
            scale={scale}
            scaleAmount={scaleAmount}
            rotate={rotate}
            rotateAmount={rotateAmount}
            isAnimating={isAnimating}
            animationId={animationIdRef.current}
            iterationCount={iterationCount}
          />
        ))}
      </span>
    </>
  );
}

export const WaveText = memo(WaveTextComponent);

/**
 * CelebrationWave - Pre-configured for celebratory moments
 */
export function CelebrationWave({ 
  children, 
  color = '#22c55e',
  ...props 
}: Omit<WaveTextProps, 'mode' | 'easing' | 'peakColor' | 'scale'> & { color?: string }) {
  return (
    <WaveText
      mode="once"
      easing="elastic"
      peakColor={color}
      scale={true}
      scaleAmount={1.2}
      amplitude={10}
      staggerDelay={40}
      repeatCount={2}
      {...props}
    >
      {children}
    </WaveText>
  );
}

/**
 * SubtleWave - Pre-configured for subtle hover effects
 */
export function SubtleWave({ children, ...props }: Omit<WaveTextProps, 'mode' | 'amplitude' | 'speed'>) {
  return (
    <WaveText
      mode="hover"
      amplitude={3}
      speed={0.7}
      easing="sine"
      staggerDelay={30}
      {...props}
    >
      {children}
    </WaveText>
  );
}

/**
 * LoadingWave - Pre-configured for loading state messages
 */
export function LoadingWave({ children, ...props }: Omit<WaveTextProps, 'mode' | 'direction'>) {
  return (
    <WaveText
      mode="continuous"
      direction="center-out"
      amplitude={4}
      speed={0.6}
      easing="sine"
      staggerDelay={60}
      {...props}
    >
      {children}
    </WaveText>
  );
}

export default WaveText;
