'use client';

import { ReactNode, useState, useRef, useEffect, CSSProperties, ElementType } from 'react';

/**
 * WeightShiftText - Variable Font Weight Animation Component
 * 
 * Creates smooth font weight transitions on hover/focus using variable fonts.
 * A trending 2026 "kinetic typography" effect that adds premium fluidity to text.
 * 
 * Inspiration:
 * - Apple's variable font usage in visionOS
 * - Linear.app's smooth weight transitions
 * - Stripe's kinetic typography
 * - 2025-2026 trend: "Living Typography" with fluid font properties
 * 
 * How it works:
 * - Uses CSS transitions on font-variation-settings (wght axis)
 * - Inter and other variable fonts support smooth weight interpolation
 * - Hardware-accelerated for 60fps animations
 * 
 * Use cases:
 * - Navigation items that "strengthen" on hover
 * - Stat labels that pulse heavier when values change
 * - Ticker symbols with interactive weight shifts
 * - Headlines with dramatic hover emphasis
 * 
 * @example
 * <WeightShiftText>Hover me</WeightShiftText>
 * 
 * <WeightShiftText 
 *   from={400} 
 *   to={700} 
 *   duration={300}
 *   trigger="hover"
 * >
 *   Premium Effect
 * </WeightShiftText>
 */

type Trigger = 'hover' | 'focus' | 'both' | 'active' | 'always';
type Variant = 'subtle' | 'medium' | 'bold' | 'dramatic';

interface WeightShiftTextProps {
  children: ReactNode;
  /** Starting font weight (100-900) */
  from?: number;
  /** Target font weight on hover/focus (100-900) */
  to?: number;
  /** Transition duration in ms */
  duration?: number;
  /** Easing function */
  easing?: string;
  /** What triggers the weight shift */
  trigger?: Trigger;
  /** Preset variant (overrides from/to) */
  variant?: Variant;
  /** Also shift letter-spacing for extra effect */
  shiftSpacing?: boolean;
  /** Spacing change in em units */
  spacingDelta?: number;
  /** Optional scale on hover (subtle, like 1.02) */
  scale?: number;
  /** Tag to render (span, div, h1, etc.) */
  as?: ElementType;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Controlled active state (for programmatic triggers) */
  active?: boolean;
  /** Callback when weight shift starts */
  onShiftStart?: () => void;
  /** Callback when weight shift ends */
  onShiftEnd?: () => void;
}

// Variant presets
const VARIANTS: Record<Variant, { from: number; to: number }> = {
  subtle: { from: 400, to: 500 },
  medium: { from: 400, to: 600 },
  bold: { from: 400, to: 700 },
  dramatic: { from: 300, to: 800 },
};

export function WeightShiftText({
  children,
  from: fromProp,
  to: toProp,
  duration = 250,
  easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
  trigger = 'hover',
  variant,
  shiftSpacing = false,
  spacingDelta = 0.02,
  scale,
  as: Component = 'span',
  className = '',
  style,
  active: controlledActive,
  onShiftStart,
  onShiftEnd,
}: WeightShiftTextProps) {
  const [isActive, setIsActive] = useState(false);
  const ref = useRef<HTMLElement>(null);
  
  // Use variant presets or custom from/to
  const { from, to } = variant 
    ? VARIANTS[variant] 
    : { from: fromProp ?? 400, to: toProp ?? 600 };
  
  // Determine active state (controlled or internal)
  const active = controlledActive !== undefined ? controlledActive : isActive;
  const currentWeight = active ? to : from;
  const currentSpacing = shiftSpacing 
    ? (active ? spacingDelta : 0) 
    : undefined;
  const currentScale = scale ? (active ? scale : 1) : undefined;
  
  // Event handlers based on trigger
  const handlers: Record<string, () => void> = {};
  
  if (trigger === 'hover' || trigger === 'both') {
    handlers.onMouseEnter = () => {
      setIsActive(true);
      onShiftStart?.();
    };
    handlers.onMouseLeave = () => {
      setIsActive(false);
      onShiftEnd?.();
    };
  }
  
  if (trigger === 'focus' || trigger === 'both') {
    handlers.onFocus = () => {
      setIsActive(true);
      onShiftStart?.();
    };
    handlers.onBlur = () => {
      setIsActive(false);
      onShiftEnd?.();
    };
  }
  
  if (trigger === 'active') {
    handlers.onMouseDown = () => {
      setIsActive(true);
      onShiftStart?.();
    };
    handlers.onMouseUp = () => {
      setIsActive(false);
      onShiftEnd?.();
    };
    handlers.onMouseLeave = () => {
      setIsActive(false);
      onShiftEnd?.();
    };
  }
  
  // Build transition property
  const transitionProps = ['font-variation-settings'];
  if (shiftSpacing) transitionProps.push('letter-spacing');
  if (scale) transitionProps.push('transform');
  
  const combinedStyle: CSSProperties = {
    fontVariationSettings: `'wght' ${currentWeight}`,
    letterSpacing: currentSpacing !== undefined ? `${currentSpacing}em` : undefined,
    transform: currentScale !== undefined ? `scale(${currentScale})` : undefined,
    transition: transitionProps
      .map(prop => `${prop} ${duration}ms ${easing}`)
      .join(', '),
    display: 'inline-block',
    willChange: transitionProps.join(', '),
    ...style,
  };
  
  // Always active variant
  useEffect(() => {
    if (trigger === 'always') {
      setIsActive(true);
    }
  }, [trigger]);
  
  return (
    <Component
      ref={ref as any}
      className={`weight-shift-text ${className}`}
      style={combinedStyle}
      {...handlers}
    >
      {children}
    </Component>
  );
}

/**
 * WeightWave - Staggered weight animation across characters
 * 
 * Creates a "wave" effect where font weight ripples through each character
 * in sequence, like a wave traveling through text.
 */
interface WeightWaveProps {
  text: string;
  /** Starting font weight */
  from?: number;
  /** Peak font weight */
  to?: number;
  /** Duration for each character's animation */
  duration?: number;
  /** Delay between each character starting */
  stagger?: number;
  /** Easing function */
  easing?: string;
  /** Loop the animation */
  loop?: boolean;
  /** Pause between loops */
  loopDelay?: number;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

export function WeightWave({
  text,
  from = 400,
  to = 700,
  duration = 400,
  stagger = 50,
  easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
  loop = true,
  loopDelay = 1000,
  className = '',
  style,
}: WeightWaveProps) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const characters = text.split('');
  const totalDuration = characters.length * stagger + duration;
  
  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = [];
    
    const runWave = () => {
      // Activate each character in sequence
      characters.forEach((_, i) => {
        const timeout = setTimeout(() => {
          setActiveIndex(i);
        }, i * stagger);
        timeouts.push(timeout);
      });
      
      // Reset after wave completes
      const resetTimeout = setTimeout(() => {
        setActiveIndex(-1);
        if (loop) {
          const loopTimeout = setTimeout(runWave, loopDelay);
          timeouts.push(loopTimeout);
        }
      }, totalDuration);
      timeouts.push(resetTimeout);
    };
    
    runWave();
    
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [text, stagger, duration, loop, loopDelay, totalDuration, characters.length]);
  
  return (
    <span className={`weight-wave ${className}`} style={style}>
      {characters.map((char, i) => {
        const isActive = activeIndex >= i && activeIndex < i + Math.ceil(duration / stagger);
        const weight = isActive ? to : from;
        
        return (
          <span
            key={i}
            style={{
              fontVariationSettings: `'wght' ${weight}`,
              transition: `font-variation-settings ${duration}ms ${easing}`,
              display: char === ' ' ? 'inline' : 'inline-block',
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        );
      })}
    </span>
  );
}

/**
 * WeightPulse - Pulsing font weight effect
 * 
 * Continuously pulses font weight between two values,
 * creating a "breathing" text effect.
 */
interface WeightPulseProps {
  children: ReactNode;
  /** Minimum font weight */
  from?: number;
  /** Maximum font weight */
  to?: number;
  /** Duration of one pulse cycle */
  duration?: number;
  /** Tag to render */
  as?: ElementType;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Pause the animation */
  paused?: boolean;
}

export function WeightPulse({
  children,
  from = 400,
  to = 600,
  duration = 2000,
  as: Component = 'span',
  className = '',
  style,
  paused = false,
}: WeightPulseProps) {
  const [weight, setWeight] = useState(from);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  
  useEffect(() => {
    if (paused) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }
    
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      
      const elapsed = timestamp - startTimeRef.current;
      const progress = (elapsed % duration) / duration;
      
      // Sine wave for smooth in-out
      const sine = Math.sin(progress * Math.PI * 2);
      const normalizedSine = (sine + 1) / 2; // 0 to 1
      
      const currentWeight = from + (to - from) * normalizedSine;
      setWeight(Math.round(currentWeight));
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [from, to, duration, paused]);
  
  return (
    <Component
      className={`weight-pulse ${className}`}
      style={{
        fontVariationSettings: `'wght' ${weight}`,
        display: 'inline-block',
        ...style,
      }}
    >
      {children}
    </Component>
  );
}

/**
 * WeightReveal - Reveal text with weight animation
 * 
 * Text starts at one weight and animates to final weight,
 * often combined with opacity for a premium reveal effect.
 */
interface WeightRevealProps {
  children: ReactNode;
  /** Starting font weight (heavier feels like it's coming into focus) */
  from?: number;
  /** Final font weight */
  to?: number;
  /** Animation duration */
  duration?: number;
  /** Delay before animation starts */
  delay?: number;
  /** Easing function */
  easing?: string;
  /** Also animate opacity */
  fadeIn?: boolean;
  /** Starting opacity (if fadeIn) */
  fromOpacity?: number;
  /** Tag to render */
  as?: ElementType;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Trigger animation (set to true to start) */
  trigger?: boolean;
}

export function WeightReveal({
  children,
  from = 200,
  to = 400,
  duration = 600,
  delay = 0,
  easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
  fadeIn = true,
  fromOpacity = 0,
  as: Component = 'span',
  className = '',
  style,
  trigger = true,
}: WeightRevealProps) {
  const [hasAnimated, setHasAnimated] = useState(false);
  
  useEffect(() => {
    if (trigger && !hasAnimated) {
      const timeout = setTimeout(() => {
        setHasAnimated(true);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [trigger, delay, hasAnimated]);
  
  const isRevealed = hasAnimated;
  
  return (
    <Component
      className={`weight-reveal ${className}`}
      style={{
        fontVariationSettings: `'wght' ${isRevealed ? to : from}`,
        opacity: fadeIn ? (isRevealed ? 1 : fromOpacity) : 1,
        transition: `font-variation-settings ${duration}ms ${easing}, opacity ${duration}ms ${easing}`,
        display: 'inline-block',
        ...style,
      }}
    >
      {children}
    </Component>
  );
}

/**
 * WeightGradient - Text with weight gradient across characters
 * 
 * Each character has a different weight, creating a gradient
 * effect from light to bold across the text.
 */
interface WeightGradientProps {
  text: string;
  /** Starting font weight (left side) */
  from?: number;
  /** Ending font weight (right side) */
  to?: number;
  /** Direction of gradient */
  direction?: 'left-to-right' | 'right-to-left' | 'center-out' | 'edges-in';
  /** Animate the gradient (shift over time) */
  animate?: boolean;
  /** Animation duration for one cycle */
  animationDuration?: number;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

export function WeightGradient({
  text,
  from = 300,
  to = 700,
  direction = 'left-to-right',
  animate = false,
  animationDuration = 3000,
  className = '',
  style,
}: WeightGradientProps) {
  const [offset, setOffset] = useState(0);
  const characters = text.split('');
  
  useEffect(() => {
    if (!animate) return;
    
    let animationFrame: number;
    let startTime: number;
    
    const animateOffset = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = (elapsed % animationDuration) / animationDuration;
      setOffset(progress);
      animationFrame = requestAnimationFrame(animateOffset);
    };
    
    animationFrame = requestAnimationFrame(animateOffset);
    return () => cancelAnimationFrame(animationFrame);
  }, [animate, animationDuration]);
  
  const getWeight = (index: number) => {
    const length = characters.length - 1;
    let position: number;
    
    switch (direction) {
      case 'right-to-left':
        position = 1 - index / length;
        break;
      case 'center-out':
        position = Math.abs((index / length) - 0.5) * 2;
        break;
      case 'edges-in':
        position = 1 - Math.abs((index / length) - 0.5) * 2;
        break;
      case 'left-to-right':
      default:
        position = index / length;
    }
    
    // Apply animation offset
    if (animate) {
      position = (position + offset) % 1;
    }
    
    return Math.round(from + (to - from) * position);
  };
  
  return (
    <span className={`weight-gradient ${className}`} style={style}>
      {characters.map((char, i) => (
        <span
          key={i}
          style={{
            fontVariationSettings: `'wght' ${getWeight(i)}`,
            display: char === ' ' ? 'inline' : 'inline-block',
            transition: animate ? 'font-variation-settings 100ms linear' : undefined,
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}

export default WeightShiftText;
