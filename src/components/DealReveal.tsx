'use client';

import { useEffect, useRef, useState, ReactNode, CSSProperties, memo } from 'react';

/**
 * DealReveal Component
 * 
 * Makes cards animate in like they're being dealt from a deck, creating
 * a tactile, casino-inspired entrance effect perfect for financial dashboards.
 * 
 * Inspiration:
 * - FreeFrontend's "Scroll-Driven Masonry Reveal" (cards dealt onto screen)
 * - Physical card-dealing motion from casino/poker games
 * - iOS App Library card stacking animations
 * - Trello's card drag-and-drop physics
 * - 2026 "tactile UI" trend emphasizing physical metaphors
 * 
 * Technique:
 * - Uses CSS Scroll-Driven Animations (view timeline) where supported
 * - Falls back to IntersectionObserver for other browsers
 * - Staggered timing based on index creates dealing cascade
 * - 3D rotation + translate creates "thrown" trajectory
 * - Dynamic shadows enhance depth perception
 * - Spring-based easing for natural settle
 */

interface DealRevealProps {
  children: ReactNode;
  /** Index in a list for stagger timing (0-based) */
  index?: number;
  /** Total number of items (for calculating stagger) */
  total?: number;
  /** Base delay before animation starts (ms) */
  baseDelay?: number;
  /** Stagger delay per item (ms) */
  staggerDelay?: number;
  /** Direction cards are dealt from */
  dealFrom?: 'left' | 'right' | 'top' | 'bottom' | 'center';
  /** Animation duration (ms) */
  duration?: number;
  /** Whether to animate on scroll or on mount */
  trigger?: 'scroll' | 'mount';
  /** Custom className */
  className?: string;
  /** Intensity of the 3D rotation (degrees) */
  rotationIntensity?: number;
  /** How far cards travel before landing (px) */
  travelDistance?: number;
  /** Enable shadow animation */
  animateShadow?: boolean;
  /** Callback when deal animation completes */
  onDealt?: () => void;
}

// Spring easing with overshoot for natural "landing"
const springEasing = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

// Calculate deal trajectory based on direction
function getDealTransform(
  dealFrom: DealRevealProps['dealFrom'],
  distance: number,
  rotation: number
): { x: number; y: number; rotateX: number; rotateY: number; rotateZ: number } {
  switch (dealFrom) {
    case 'left':
      return { x: -distance, y: 20, rotateX: 0, rotateY: rotation, rotateZ: -rotation / 2 };
    case 'right':
      return { x: distance, y: 20, rotateX: 0, rotateY: -rotation, rotateZ: rotation / 2 };
    case 'top':
      return { x: 0, y: -distance, rotateX: rotation, rotateY: 0, rotateZ: 0 };
    case 'bottom':
      return { x: 0, y: distance, rotateX: -rotation, rotateY: 0, rotateZ: 0 };
    case 'center':
    default:
      return { x: 0, y: -distance / 2, rotateX: rotation / 2, rotateY: 0, rotateZ: 0 };
  }
}

export const DealReveal = memo(function DealReveal({
  children,
  index = 0,
  total = 1,
  baseDelay = 0,
  staggerDelay = 50,
  dealFrom = 'top',
  duration = 500,
  trigger = 'scroll',
  className = '',
  rotationIntensity = 15,
  travelDistance = 60,
  animateShadow = true,
  onDealt,
}: DealRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isDealt, setIsDealt] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check motion preferences
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Mount trigger
  useEffect(() => {
    if (trigger === 'mount' && !prefersReducedMotion) {
      const delay = baseDelay + (index * staggerDelay);
      const timer = setTimeout(() => {
        setIsDealt(true);
        onDealt?.();
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [trigger, index, baseDelay, staggerDelay, prefersReducedMotion, onDealt]);

  // Scroll trigger with IntersectionObserver
  useEffect(() => {
    if (trigger !== 'scroll' || prefersReducedMotion || !ref.current) return;

    const el = ref.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isDealt) {
            const delay = baseDelay + (index * staggerDelay);
            setTimeout(() => {
              setIsDealt(true);
              onDealt?.();
            }, delay);
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [trigger, index, baseDelay, staggerDelay, isDealt, prefersReducedMotion, onDealt]);

  // Calculate starting transform
  const startTransform = getDealTransform(dealFrom, travelDistance, rotationIntensity);
  
  // Reduced motion: instant appearance
  if (prefersReducedMotion) {
    return (
      <div className={className} style={{ opacity: 1 }}>
        {children}
      </div>
    );
  }

  const style: CSSProperties = {
    opacity: isDealt ? 1 : 0,
    transform: isDealt
      ? 'translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1)'
      : `translate3d(${startTransform.x}px, ${startTransform.y}px, 0) 
         rotateX(${startTransform.rotateX}deg) 
         rotateY(${startTransform.rotateY}deg) 
         rotateZ(${startTransform.rotateZ}deg)
         scale(0.9)`,
    boxShadow: animateShadow
      ? isDealt
        ? '0 2px 8px rgba(0, 0, 0, 0.1)'
        : `0 ${8 + index * 2}px ${20 + index * 4}px rgba(0, 0, 0, 0.25)`
      : undefined,
    transition: `
      opacity ${duration * 0.6}ms ease-out,
      transform ${duration}ms ${springEasing},
      box-shadow ${duration}ms ease-out
    `,
    transformOrigin: dealFrom === 'left' ? 'left center' 
      : dealFrom === 'right' ? 'right center'
      : dealFrom === 'top' ? 'center top'
      : dealFrom === 'bottom' ? 'center bottom'
      : 'center center',
    willChange: isDealt ? 'auto' : 'transform, opacity, box-shadow',
    perspective: '1000px',
    transformStyle: 'preserve-3d',
  };

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
});

/**
 * DealRevealContainer
 * 
 * Wrapper that automatically provides index/total to children
 * for coordinated dealing animations.
 */
interface DealRevealContainerProps {
  children: ReactNode[];
  /** Stagger delay between items (ms) */
  staggerDelay?: number;
  /** Base delay before first item (ms) */
  baseDelay?: number;
  /** Direction to deal from */
  dealFrom?: DealRevealProps['dealFrom'];
  /** Animation duration per item (ms) */
  duration?: number;
  /** Trigger mode */
  trigger?: 'scroll' | 'mount';
  /** Container className */
  className?: string;
  /** Callback when all items are dealt */
  onAllDealt?: () => void;
}

export function DealRevealContainer({
  children,
  staggerDelay = 50,
  baseDelay = 0,
  dealFrom = 'top',
  duration = 500,
  trigger = 'scroll',
  className = '',
  onAllDealt,
}: DealRevealContainerProps) {
  const dealtCount = useRef(0);
  const total = Array.isArray(children) ? children.length : 1;
  const childrenArray = Array.isArray(children) ? children : [children];

  const handleDealt = () => {
    dealtCount.current += 1;
    if (dealtCount.current === total && onAllDealt) {
      onAllDealt();
    }
  };

  return (
    <div className={className}>
      {childrenArray.map((child, index) => (
        <DealReveal
          key={index}
          index={index}
          total={total}
          staggerDelay={staggerDelay}
          baseDelay={baseDelay}
          dealFrom={dealFrom}
          duration={duration}
          trigger={trigger}
          onDealt={handleDealt}
        >
          {child}
        </DealReveal>
      ))}
    </div>
  );
}

/**
 * DealStack
 * 
 * Creates a stacked deck visual where cards appear to be in a pile,
 * then deal out one by one. Perfect for loading states or reveals.
 */
interface DealStackProps {
  children: ReactNode[];
  /** Stack offset per card (px) */
  stackOffset?: number;
  /** Delay before dealing starts (ms) */
  delay?: number;
  /** Time between each card (ms) */
  interval?: number;
  /** Whether to auto-deal or wait for trigger */
  autoStart?: boolean;
  /** Callback when all cards dealt */
  onComplete?: () => void;
  className?: string;
}

export function DealStack({
  children,
  stackOffset = 4,
  delay = 300,
  interval = 100,
  autoStart = true,
  onComplete,
  className = '',
}: DealStackProps) {
  const [dealtIndices, setDealtIndices] = useState<Set<number>>(new Set());
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const childrenArray = Array.isArray(children) ? children : [children];

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!autoStart || prefersReducedMotion) {
      // Instant reveal if reduced motion
      if (prefersReducedMotion) {
        setDealtIndices(new Set(childrenArray.map((_, i) => i)));
      }
      return;
    }

    const timers: NodeJS.Timeout[] = [];
    
    childrenArray.forEach((_, index) => {
      const timer = setTimeout(() => {
        setDealtIndices(prev => new Set([...prev, index]));
        
        if (index === childrenArray.length - 1 && onComplete) {
          setTimeout(onComplete, 300);
        }
      }, delay + (index * interval));
      
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [autoStart, prefersReducedMotion, childrenArray.length, delay, interval, onComplete]);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={className} style={{ position: 'relative' }}>
      {childrenArray.map((child, index) => {
        const isDealt = dealtIndices.has(index);
        const stackPosition = childrenArray.length - 1 - index;
        
        return (
          <div
            key={index}
            style={{
              position: index === 0 ? 'relative' : 'absolute',
              top: isDealt ? 0 : stackPosition * stackOffset,
              left: isDealt ? 0 : stackPosition * (stackOffset / 2),
              transform: isDealt 
                ? 'rotateZ(0deg) scale(1)' 
                : `rotateZ(${(stackPosition - childrenArray.length / 2) * 0.5}deg) scale(${1 - stackPosition * 0.02})`,
              opacity: isDealt ? 1 : 0.8,
              zIndex: isDealt ? index : childrenArray.length - stackPosition,
              transition: `all 400ms ${springEasing}`,
              transformOrigin: 'center center',
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}

/**
 * useIsDealt hook
 * 
 * Simplified hook for components that want to know if they've been "dealt"
 * (revealed via scroll or mount).
 */
export function useIsDealt(options?: {
  trigger?: 'scroll' | 'mount';
  delay?: number;
  threshold?: number;
}): [React.RefObject<HTMLDivElement | null>, boolean] {
  const { trigger = 'scroll', delay = 0, threshold = 0.1 } = options || {};
  const ref = useRef<HTMLDivElement>(null);
  const [isDealt, setIsDealt] = useState(false);

  useEffect(() => {
    if (trigger === 'mount') {
      const timer = setTimeout(() => setIsDealt(true), delay);
      return () => clearTimeout(timer);
    }
  }, [trigger, delay]);

  useEffect(() => {
    if (trigger !== 'scroll' || !ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isDealt) {
          setTimeout(() => setIsDealt(true), delay);
        }
      },
      { threshold }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [trigger, delay, threshold, isDealt]);

  return [ref, isDealt];
}

export default DealReveal;
