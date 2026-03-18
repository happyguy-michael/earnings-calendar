'use client';

import { ReactNode, useEffect, useState, useRef, CSSProperties } from 'react';

/**
 * MotionPath - Animate Elements Along Curved SVG Paths
 * 
 * Uses CSS Motion Path (offset-path) to create premium curved animations.
 * Elements can fly in along arcs, orbit points, or follow custom SVG paths.
 * 
 * 2026 Trend: Motion path animations add organic, natural movement that
 * linear transforms can't achieve. Creates a sense of polish and premium feel.
 * 
 * Inspiration:
 * - Apple product reveal animations (curved fly-ins)
 * - Trading platform "order flow" visualizations
 * - Modern SaaS hero sections with floating elements
 * - Material Design motion principles (arc transitions)
 * 
 * Features:
 * - Pre-built path presets (arc, orbit, wave, bounce, swoop)
 * - Custom SVG path support
 * - Configurable timing, direction, and iterations
 * - GPU-accelerated via CSS offset-path
 * - Full prefers-reduced-motion support
 * - Auto-rotate element to follow path tangent
 * - Stagger support for multiple children
 * 
 * @example
 * // Arc entrance animation
 * <MotionPath preset="arc-in" duration={800}>
 *   <Card>Content</Card>
 * </MotionPath>
 * 
 * @example
 * // Orbital decoration
 * <MotionPath 
 *   preset="orbit" 
 *   duration={8000} 
 *   iterations={Infinity}
 *   reverse
 * >
 *   <OrbitDot />
 * </MotionPath>
 * 
 * @example
 * // Custom path
 * <MotionPath 
 *   path="M0,100 Q50,0 100,100 T200,100" 
 *   duration={1500}
 * >
 *   <FloatingElement />
 * </MotionPath>
 */

type PathPreset = 
  | 'arc-in-left'
  | 'arc-in-right'
  | 'arc-in-top'
  | 'arc-in-bottom'
  | 'swoop-in'
  | 'orbit'
  | 'orbit-ellipse'
  | 'wave'
  | 'bounce-in'
  | 'spring-in'
  | 'reveal-arc'
  | 'float-sine';

interface MotionPathProps {
  children: ReactNode;
  /** Pre-built path preset */
  preset?: PathPreset;
  /** Custom SVG path string (overrides preset) */
  path?: string;
  /** Animation duration in ms */
  duration?: number;
  /** Easing function */
  easing?: string;
  /** Delay before animation starts in ms */
  delay?: number;
  /** Number of iterations (use Infinity for infinite) */
  iterations?: number;
  /** Reverse direction */
  reverse?: boolean;
  /** Play animation forward then backward */
  alternate?: boolean;
  /** Auto-rotate element to follow path tangent */
  autoRotate?: boolean;
  /** Additional rotation offset in degrees */
  rotateOffset?: number;
  /** Start position along path (0-100%) */
  startOffset?: number;
  /** End position along path (0-100%) */
  endOffset?: number;
  /** Trigger animation on mount */
  animateOnMount?: boolean;
  /** Trigger animation (controlled) */
  animate?: boolean;
  /** Fill mode for animation */
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  /** Scale during animation (start, end) */
  scaleRange?: [number, number];
  /** Opacity during animation (start, end) */
  opacityRange?: [number, number];
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Additional className */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
  /** Index for stagger delay calculation */
  staggerIndex?: number;
  /** Delay between staggered items in ms */
  staggerDelay?: number;
}

// Pre-built SVG path definitions
const pathPresets: Record<PathPreset, string> = {
  // Arc entrance from left - element curves in from bottom-left
  'arc-in-left': 'M -100 100 Q 0 -50 100 0',
  
  // Arc entrance from right - element curves in from bottom-right
  'arc-in-right': 'M 200 100 Q 100 -50 0 0',
  
  // Arc entrance from top - element drops in with curve
  'arc-in-top': 'M 0 -100 Q 100 0 0 0',
  
  // Arc entrance from bottom - element rises with curve
  'arc-in-bottom': 'M 0 100 Q -50 50 0 0',
  
  // Dramatic swoop entrance - large curved sweep
  'swoop-in': 'M -200 50 C -100 -100 100 -100 0 0',
  
  // Circular orbit path (360°)
  'orbit': 'M 50 0 A 50 50 0 1 1 50 0.001',
  
  // Elliptical orbit (wider than tall)
  'orbit-ellipse': 'M 80 0 A 80 40 0 1 1 80 0.001',
  
  // Sine wave path for floating animation
  'wave': 'M 0 0 Q 25 -20 50 0 Q 75 20 100 0 Q 125 -20 150 0',
  
  // Bounce entrance with overshoot
  'bounce-in': 'M 0 -80 Q 50 20 0 -15 Q -20 5 0 0',
  
  // Spring entrance with oscillation
  'spring-in': 'M 0 -100 L 0 20 L 0 -10 L 0 5 L 0 0',
  
  // Reveal arc for content - subtle curve in
  'reveal-arc': 'M -30 20 Q -15 -10 0 0',
  
  // Gentle floating sine for ambient decoration
  'float-sine': 'M 0 0 C 10 -15 20 -15 30 0 C 40 15 50 15 60 0',
};

// CSS keyframes for the motion path animation
function generateKeyframes(
  startOffset: number,
  endOffset: number,
  scaleRange?: [number, number],
  opacityRange?: [number, number]
): string {
  const hasScale = scaleRange && (scaleRange[0] !== 1 || scaleRange[1] !== 1);
  const hasOpacity = opacityRange && (opacityRange[0] !== 1 || opacityRange[1] !== 1);
  
  let keyframes = `
    0% {
      offset-distance: ${startOffset}%;
      ${hasScale ? `transform: scale(${scaleRange[0]});` : ''}
      ${hasOpacity ? `opacity: ${opacityRange[0]};` : ''}
    }
    100% {
      offset-distance: ${endOffset}%;
      ${hasScale ? `transform: scale(${scaleRange[1]});` : ''}
      ${hasOpacity ? `opacity: ${opacityRange[1]};` : ''}
    }
  `;
  
  return keyframes;
}

export function MotionPath({
  children,
  preset = 'arc-in-left',
  path,
  duration = 600,
  easing = 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Snappy spring
  delay = 0,
  iterations = 1,
  reverse = false,
  alternate = false,
  autoRotate = false,
  rotateOffset = 0,
  startOffset = 0,
  endOffset = 100,
  animateOnMount = true,
  animate,
  fillMode = 'forwards',
  scaleRange,
  opacityRange,
  onComplete,
  className = '',
  style = {},
  staggerIndex = 0,
  staggerDelay = 50,
}: MotionPathProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [animationId] = useState(() => `motion-path-${Math.random().toString(36).slice(2, 9)}`);
  const elementRef = useRef<HTMLDivElement>(null);
  const hasCompletedRef = useRef(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Determine the SVG path to use
  const svgPath = path || pathPresets[preset];

  // Calculate total delay including stagger
  const totalDelay = delay + (staggerIndex * staggerDelay);

  // Handle animation trigger
  useEffect(() => {
    const shouldAnimate = animate !== undefined ? animate : animateOnMount;
    if (shouldAnimate && !prefersReducedMotion) {
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 10); // Small delay to ensure styles are applied
      return () => clearTimeout(timer);
    }
  }, [animate, animateOnMount, prefersReducedMotion]);

  // Handle animation completion
  useEffect(() => {
    if (!isAnimating || hasCompletedRef.current) return;
    
    const animationDuration = duration + totalDelay;
    const timer = setTimeout(() => {
      if (iterations === 1 && onComplete) {
        hasCompletedRef.current = true;
        onComplete();
      }
    }, animationDuration);
    
    return () => clearTimeout(timer);
  }, [isAnimating, duration, totalDelay, iterations, onComplete]);

  // Reduced motion: just render children without animation
  if (prefersReducedMotion) {
    return <div className={className} style={style}>{children}</div>;
  }

  // Generate keyframe animation
  const keyframes = generateKeyframes(
    reverse ? endOffset : startOffset,
    reverse ? startOffset : endOffset,
    scaleRange,
    opacityRange
  );

  // Build animation CSS
  const animationCSS = `
    @keyframes ${animationId} {
      ${keyframes}
    }
  `;

  // Direction value
  const direction = alternate ? 'alternate' : 'normal';
  const iterationCount = iterations === Infinity ? 'infinite' : iterations;

  // Calculate offset-rotate
  const offsetRotate = autoRotate 
    ? `auto ${rotateOffset}deg`
    : `${rotateOffset}deg`;

  return (
    <>
      <style>{animationCSS}</style>
      <div
        ref={elementRef}
        className={`motion-path-element ${className}`}
        style={{
          ...style,
          offsetPath: `path('${svgPath}')`,
          offsetRotate,
          offsetDistance: isAnimating ? undefined : `${reverse ? endOffset : startOffset}%`,
          animation: isAnimating 
            ? `${animationId} ${duration}ms ${easing} ${totalDelay}ms ${iterationCount} ${direction} ${fillMode}`
            : 'none',
          willChange: 'offset-distance, transform, opacity',
        }}
      >
        {children}
      </div>
    </>
  );
}

// ============================================
// Specialized Components
// ============================================

/**
 * MotionPathGroup - Animate multiple children with staggered timing
 */
interface MotionPathGroupProps extends Omit<MotionPathProps, 'children' | 'staggerIndex'> {
  children: ReactNode[];
  /** Delay between each child in ms */
  staggerDelay?: number;
}

export function MotionPathGroup({
  children,
  staggerDelay = 80,
  ...props
}: MotionPathGroupProps) {
  return (
    <>
      {children.map((child, index) => (
        <MotionPath
          key={index}
          {...props}
          staggerIndex={index}
          staggerDelay={staggerDelay}
        >
          {child}
        </MotionPath>
      ))}
    </>
  );
}

/**
 * OrbitElement - Element that orbits around a center point
 */
interface OrbitElementProps {
  children: ReactNode;
  /** Orbit radius in pixels */
  radius?: number;
  /** Orbit duration in ms (one full rotation) */
  duration?: number;
  /** Ellipse factor (1 = circle, >1 = wider, <1 = taller) */
  ellipseFactor?: number;
  /** Starting angle in degrees */
  startAngle?: number;
  /** Reverse direction (counter-clockwise) */
  reverse?: boolean;
  /** Additional className */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
}

export function OrbitElement({
  children,
  radius = 60,
  duration = 6000,
  ellipseFactor = 1,
  startAngle = 0,
  reverse = false,
  className = '',
  style = {},
}: OrbitElementProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [animationId] = useState(() => `orbit-${Math.random().toString(36).slice(2, 9)}`);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Calculate ellipse radii
  const rx = radius * ellipseFactor;
  const ry = radius;
  
  // Create circular/elliptical path
  // Using two arcs to create a full circle/ellipse
  const path = `M ${rx} 0 A ${rx} ${ry} 0 1 ${reverse ? 0 : 1} -${rx} 0 A ${rx} ${ry} 0 1 ${reverse ? 0 : 1} ${rx} 0`;

  // Starting offset based on angle
  const startOffset = (startAngle / 360) * 100;

  if (prefersReducedMotion) {
    // Static position at start angle
    const x = rx * Math.cos(startAngle * Math.PI / 180);
    const y = ry * Math.sin(startAngle * Math.PI / 180);
    return (
      <div 
        className={className} 
        style={{ ...style, transform: `translate(${x}px, ${y}px)` }}
      >
        {children}
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes ${animationId} {
          from { offset-distance: ${startOffset}%; }
          to { offset-distance: ${startOffset + 100}%; }
        }
      `}</style>
      <div
        className={`orbit-element ${className}`}
        style={{
          ...style,
          position: 'absolute',
          offsetPath: `path('${path}')`,
          offsetRotate: '0deg', // Don't rotate with path
          animation: `${animationId} ${duration}ms linear infinite`,
          willChange: 'offset-distance',
        }}
      >
        {children}
      </div>
    </>
  );
}

/**
 * FlyInArc - Simple arc entrance animation
 */
interface FlyInArcProps {
  children: ReactNode;
  /** Direction to fly in from */
  from?: 'left' | 'right' | 'top' | 'bottom';
  /** Animation duration in ms */
  duration?: number;
  /** Delay in ms */
  delay?: number;
  /** Show fade effect */
  fade?: boolean;
  /** Show scale effect */
  scale?: boolean;
  /** Additional className */
  className?: string;
}

export function FlyInArc({
  children,
  from = 'left',
  duration = 700,
  delay = 0,
  fade = true,
  scale = false,
  className = '',
}: FlyInArcProps) {
  const presetMap: Record<string, PathPreset> = {
    left: 'arc-in-left',
    right: 'arc-in-right',
    top: 'arc-in-top',
    bottom: 'arc-in-bottom',
  };

  return (
    <MotionPath
      preset={presetMap[from]}
      duration={duration}
      delay={delay}
      opacityRange={fade ? [0, 1] : undefined}
      scaleRange={scale ? [0.8, 1] : undefined}
      easing="cubic-bezier(0.34, 1.56, 0.64, 1)"
      className={className}
    >
      {children}
    </MotionPath>
  );
}

/**
 * FloatWave - Ambient floating animation along a wave path
 */
interface FloatWaveProps {
  children: ReactNode;
  /** Animation duration in ms */
  duration?: number;
  /** Amplitude of the wave in pixels (adjusts path) */
  amplitude?: number;
  /** Additional className */
  className?: string;
  style?: CSSProperties;
}

export function FloatWave({
  children,
  duration = 4000,
  className = '',
  style = {},
}: FloatWaveProps) {
  return (
    <MotionPath
      preset="float-sine"
      duration={duration}
      iterations={Infinity}
      alternate={true}
      easing="ease-in-out"
      fillMode="both"
      className={className}
      style={style}
    >
      {children}
    </MotionPath>
  );
}

/**
 * SwoopReveal - Dramatic swoop-in reveal animation
 */
interface SwoopRevealProps {
  children: ReactNode;
  duration?: number;
  delay?: number;
  className?: string;
}

export function SwoopReveal({
  children,
  duration = 900,
  delay = 0,
  className = '',
}: SwoopRevealProps) {
  return (
    <MotionPath
      preset="swoop-in"
      duration={duration}
      delay={delay}
      opacityRange={[0, 1]}
      scaleRange={[0.6, 1]}
      easing="cubic-bezier(0.22, 1, 0.36, 1)"
      className={className}
    >
      {children}
    </MotionPath>
  );
}
