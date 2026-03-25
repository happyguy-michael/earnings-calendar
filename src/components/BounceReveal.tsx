'use client';

import { useEffect, useRef, useState, ReactNode, CSSProperties, memo } from 'react';
import { useMotionPreferences } from './MotionPreferences';

/**
 * BounceReveal - Physics-Based Entrance Animation with Satisfying Bounce
 * 
 * 2026 Design Trend: "Kinetic Design" — interfaces that feel physically grounded.
 * Elements should have weight, momentum, and settle naturally. Not just fade in,
 * but LAND with character.
 * 
 * Inspiration:
 * - iOS notification banners dropping in and settling
 * - Framer Motion's spring physics
 * - Nintendo UI transitions (menus that bounce into place)
 * - Material Design's "Aware" motion principles
 * - Slack's message arrival animations
 * 
 * Features:
 * - Viewport-triggered one-shot animation
 * - True spring physics simulation (mass, stiffness, damping)
 * - Multiple entrance directions (up, down, left, right, scale)
 * - Configurable bounce intensity and settle time
 * - Stagger delay for list animations
 * - Shadow that responds to bounce (lifts on overshoot)
 * - Subtle rotation wobble option
 * - GPU-accelerated transforms
 * - Full prefers-reduced-motion support
 * 
 * Use cases:
 * - Card reveals on scroll
 * - List item entrances
 * - Modal/dialog appearances
 * - Toast notifications
 * - Achievement unlocks
 * 
 * @example
 * // Basic usage - bounces up into view
 * <BounceReveal>
 *   <Card />
 * </BounceReveal>
 * 
 * // With stagger for lists
 * {items.map((item, i) => (
 *   <BounceReveal delay={i * 50} direction="up" intensity="playful">
 *     <ListItem key={item.id} />
 *   </BounceReveal>
 * ))}
 * 
 * // Scale bounce with wobble
 * <BounceReveal direction="scale" wobble={true} intensity="bouncy">
 *   <Badge />
 * </BounceReveal>
 */

export type BounceDirection = 'up' | 'down' | 'left' | 'right' | 'scale';
export type BounceIntensity = 'subtle' | 'natural' | 'playful' | 'bouncy' | 'dramatic';

interface BounceRevealProps {
  children: ReactNode;
  /** Direction element enters from */
  direction?: BounceDirection;
  /** Bounce intensity preset */
  intensity?: BounceIntensity;
  /** Initial distance/scale offset */
  distance?: number;
  /** Delay before animation starts (ms) */
  delay?: number;
  /** Animation duration (ms) - affects settle time */
  duration?: number;
  /** Add subtle rotation wobble during bounce */
  wobble?: boolean;
  /** Wobble intensity in degrees (default: 3) */
  wobbleAmount?: number;
  /** Animate shadow lift during overshoot */
  shadowBounce?: boolean;
  /** Trigger animation only once */
  once?: boolean;
  /** Intersection threshold (0-1) */
  threshold?: number;
  /** Root margin for intersection observer */
  rootMargin?: string;
  /** Enable animation (can disable programmatically) */
  enabled?: boolean;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Additional className */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
}

// Spring physics configurations for each intensity
const SPRING_CONFIG: Record<BounceIntensity, {
  stiffness: number;  // Higher = faster oscillation
  damping: number;    // Higher = faster settle, lower = more bouncy
  mass: number;       // Higher = more inertia
  overshoots: number; // Expected number of visible bounces
}> = {
  subtle: {
    stiffness: 400,
    damping: 30,
    mass: 1,
    overshoots: 1,
  },
  natural: {
    stiffness: 300,
    damping: 20,
    mass: 1,
    overshoots: 2,
  },
  playful: {
    stiffness: 250,
    damping: 15,
    mass: 1.2,
    overshoots: 3,
  },
  bouncy: {
    stiffness: 200,
    damping: 10,
    mass: 1.5,
    overshoots: 4,
  },
  dramatic: {
    stiffness: 150,
    damping: 8,
    mass: 2,
    overshoots: 5,
  },
};

// Default distances for each direction
const DEFAULT_DISTANCE: Record<BounceDirection, number> = {
  up: 30,
  down: -30,
  left: 30,
  right: -30,
  scale: 0.85,
};

function BounceRevealComponent({
  children,
  direction = 'up',
  intensity = 'natural',
  distance,
  delay = 0,
  duration = 600,
  wobble = false,
  wobbleAmount = 3,
  shadowBounce = false,
  once = true,
  threshold = 0.1,
  rootMargin = '0px 0px -50px 0px',
  enabled = true,
  onComplete,
  className = '',
  style,
}: BounceRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const animationFrameRef = useRef<number>(0);
  const { systemPrefersReduced, shouldAnimate } = useMotionPreferences();
  const prefersReducedMotion = systemPrefersReduced || !shouldAnimate('decorative');

  // Spring physics state
  const positionRef = useRef(0);
  const velocityRef = useRef(0);
  const rotationRef = useRef(0);
  const rotationVelocityRef = useRef(0);

  // Get initial offset
  const initialOffset = distance ?? DEFAULT_DISTANCE[direction];

  useEffect(() => {
    if (!enabled || prefersReducedMotion) {
      setIsRevealed(true);
      setHasAnimated(true);
      return;
    }

    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && (!hasAnimated || !once)) {
            // Start animation after delay
            setTimeout(() => {
              setIsRevealed(true);
            }, delay);
          } else if (!once && !entry.isIntersecting) {
            setIsRevealed(false);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, prefersReducedMotion, hasAnimated, once, threshold, rootMargin, delay]);

  // Run spring physics animation
  useEffect(() => {
    if (!isRevealed || hasAnimated || prefersReducedMotion) return;

    const element = containerRef.current;
    if (!element) return;

    const config = SPRING_CONFIG[intensity];
    const isScale = direction === 'scale';
    
    // Initialize spring from offset position
    positionRef.current = isScale ? initialOffset : initialOffset;
    velocityRef.current = 0;
    
    // Initialize wobble from slight offset
    if (wobble) {
      rotationRef.current = wobbleAmount * (Math.random() > 0.5 ? 1 : -1);
      rotationVelocityRef.current = 0;
    }

    let lastTime = performance.now();
    const targetPosition = isScale ? 1 : 0;
    const settleThreshold = isScale ? 0.001 : 0.1;
    const velocityThreshold = 0.01;
    let settledFrames = 0;
    const requiredSettledFrames = 5;

    const animate = (currentTime: number) => {
      const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1); // Cap delta to prevent jumps
      lastTime = currentTime;

      // Spring force calculation (Hooke's law + damping)
      const displacement = positionRef.current - targetPosition;
      const springForce = -config.stiffness * displacement;
      const dampingForce = -config.damping * velocityRef.current;
      const acceleration = (springForce + dampingForce) / config.mass;

      // Update velocity and position
      velocityRef.current += acceleration * deltaTime;
      positionRef.current += velocityRef.current * deltaTime;

      // Wobble spring (separate, faster settling)
      if (wobble) {
        const wobbleSpringForce = -500 * rotationRef.current;
        const wobbleDampingForce = -25 * rotationVelocityRef.current;
        const wobbleAccel = (wobbleSpringForce + wobbleDampingForce) / 0.5;
        
        rotationVelocityRef.current += wobbleAccel * deltaTime;
        rotationRef.current += rotationVelocityRef.current * deltaTime;
        
        // Add small rotation impulse on bounce (overshoot)
        if (Math.sign(velocityRef.current) !== Math.sign(displacement) && Math.abs(velocityRef.current) > 50) {
          rotationVelocityRef.current += (Math.random() - 0.5) * 100;
        }
      }

      // Apply transforms
      let transform = '';
      if (isScale) {
        transform = `scale(${positionRef.current})`;
      } else {
        const axis = direction === 'up' || direction === 'down' ? 'Y' : 'X';
        transform = `translate${axis}(${positionRef.current}px)`;
      }
      
      if (wobble) {
        transform += ` rotate(${rotationRef.current}deg)`;
      }

      element.style.transform = transform;

      // Shadow bounce effect
      if (shadowBounce && !isScale) {
        // Lift shadow during overshoot (negative overshoot = lifted)
        const overshoot = Math.max(0, -positionRef.current);
        const shadowLift = Math.min(overshoot * 0.5, 10);
        const shadowBlur = 10 + shadowLift * 2;
        const shadowOpacity = 0.1 + (shadowLift / 30);
        element.style.boxShadow = `0 ${4 + shadowLift}px ${shadowBlur}px rgba(0, 0, 0, ${shadowOpacity})`;
      }

      // Check if settled
      const isSettled = 
        Math.abs(positionRef.current - targetPosition) < settleThreshold &&
        Math.abs(velocityRef.current) < velocityThreshold &&
        (!wobble || Math.abs(rotationRef.current) < 0.1);

      if (isSettled) {
        settledFrames++;
        if (settledFrames >= requiredSettledFrames) {
          // Snap to final position
          element.style.transform = isScale ? 'scale(1)' : 'translate(0)';
          if (shadowBounce) {
            element.style.boxShadow = '';
          }
          setHasAnimated(true);
          onComplete?.();
          return;
        }
      } else {
        settledFrames = 0;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRevealed, hasAnimated, prefersReducedMotion, direction, intensity, initialOffset, wobble, wobbleAmount, shadowBounce, onComplete]);

  // Initial state styles
  const getInitialStyle = (): CSSProperties => {
    if (prefersReducedMotion) {
      return {};
    }

    if (!isRevealed) {
      const isScale = direction === 'scale';
      
      if (isScale) {
        return {
          transform: `scale(${initialOffset})`,
          opacity: 0,
        };
      }
      
      const axis = direction === 'up' || direction === 'down' ? 'Y' : 'X';
      return {
        transform: `translate${axis}(${initialOffset}px)`,
        opacity: 0,
      };
    }

    // During/after animation, opacity is 1, transform is controlled by animation
    return {
      opacity: 1,
    };
  };

  return (
    <div
      ref={containerRef}
      className={`bounce-reveal ${className}`}
      style={{
        willChange: isRevealed && !hasAnimated ? 'transform, opacity' : 'auto',
        ...getInitialStyle(),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export const BounceReveal = memo(BounceRevealComponent);

/**
 * BounceRevealGroup - Staggered bounce animations for lists
 * 
 * Automatically applies stagger delays to children for coordinated entrance.
 * 
 * @example
 * <BounceRevealGroup stagger={75} direction="up" intensity="playful">
 *   <Card>Item 1</Card>
 *   <Card>Item 2</Card>
 *   <Card>Item 3</Card>
 * </BounceRevealGroup>
 */
interface BounceRevealGroupProps extends Omit<BounceRevealProps, 'delay' | 'children'> {
  children: ReactNode[];
  /** Delay between each item (ms) */
  stagger?: number;
  /** Base delay before first item (ms) */
  baseDelay?: number;
}

export function BounceRevealGroup({
  children,
  stagger = 50,
  baseDelay = 0,
  ...props
}: BounceRevealGroupProps) {
  return (
    <>
      {children.map((child, index) => (
        <BounceReveal
          key={index}
          delay={baseDelay + index * stagger}
          {...props}
        >
          {child}
        </BounceReveal>
      ))}
    </>
  );
}

/**
 * BounceRevealList - Pre-configured for common list patterns
 */
interface BounceRevealListProps {
  items: ReactNode[];
  direction?: BounceDirection;
  intensity?: BounceIntensity;
  stagger?: number;
  className?: string;
  itemClassName?: string;
}

export function BounceRevealList({
  items,
  direction = 'up',
  intensity = 'natural',
  stagger = 50,
  className = '',
  itemClassName = '',
}: BounceRevealListProps) {
  return (
    <div className={className}>
      {items.map((item, index) => (
        <BounceReveal
          key={index}
          delay={index * stagger}
          direction={direction}
          intensity={intensity}
          className={itemClassName}
        >
          {item}
        </BounceReveal>
      ))}
    </div>
  );
}

// CSS for reduced motion and print
const cssStyles = `
/* BounceReveal - Base styles */
.bounce-reveal {
  will-change: auto;
}

/* Reduced motion: instant reveal */
@media (prefers-reduced-motion: reduce) {
  .bounce-reveal {
    transform: none !important;
    opacity: 1 !important;
    transition: none !important;
  }
}

/* Print: no transforms */
@media print {
  .bounce-reveal {
    transform: none !important;
    opacity: 1 !important;
  }
}
`;

// Inject styles once
if (typeof document !== 'undefined') {
  const styleId = 'bounce-reveal-styles';
  if (!document.getElementById(styleId)) {
    const styleSheet = document.createElement('style');
    styleSheet.id = styleId;
    styleSheet.textContent = cssStyles;
    document.head.appendChild(styleSheet);
  }
}

export default BounceReveal;
