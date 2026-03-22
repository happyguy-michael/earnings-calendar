'use client';

import { useEffect, useState, useRef, useMemo, createContext, useContext } from 'react';

/**
 * StaggeredEntrance - Cascade animation for list items appearing on screen
 * 
 * Inspiration:
 * - 2024/2025 "Choreographed Motion" trend — items animate in sequence
 * - Stripe's card entrance animations
 * - Linear.app's list item reveals
 * - Apple's iOS list animations with spring physics
 * - Framer Motion stagger effects
 * 
 * Features:
 * - Children animate in sequentially with configurable delay
 * - Multiple animation styles: fade, slideUp, slideDown, scale, fadeSlide
 * - Spring-based easing for natural motion
 * - Intersection Observer triggers animation when in view
 * - Configurable direction (forwards, backwards, center-out)
 * - Full prefers-reduced-motion support
 * - Reset capability for re-triggering animations
 * 
 * Usage:
 * <StaggeredEntrance delay={80} animation="fadeSlide">
 *   <Card>Item 1</Card>
 *   <Card>Item 2</Card>
 *   <Card>Item 3</Card>
 * </StaggeredEntrance>
 */

interface StaggeredEntranceProps {
  /** Child elements to animate */
  children: React.ReactNode;
  /** Delay between each item in ms */
  delay?: number;
  /** Initial delay before first item animates */
  initialDelay?: number;
  /** Animation style */
  animation?: 'fade' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'fadeSlide' | 'pop';
  /** Animation direction through items */
  direction?: 'forwards' | 'backwards' | 'center-out';
  /** Animation duration per item in ms */
  duration?: number;
  /** Whether animation has played (controlled mode) */
  hasAnimated?: boolean;
  /** Callback when all items have animated */
  onComplete?: () => void;
  /** Trigger animation on mount vs on intersection */
  trigger?: 'mount' | 'intersection';
  /** Intersection observer threshold */
  threshold?: number;
  /** Reset animation when children change */
  resetOnChildrenChange?: boolean;
  /** Custom className for wrapper */
  className?: string;
  /** As prop for semantic HTML */
  as?: 'div' | 'ul' | 'ol' | 'section' | 'article' | 'nav';
}

interface StaggeredItemProps {
  /** Index of this item in the list */
  index: number;
  /** Total count of items */
  count: number;
  /** Delay per item */
  delay: number;
  /** Initial delay */
  initialDelay: number;
  /** Animation style */
  animation: StaggeredEntranceProps['animation'];
  /** Animation direction */
  direction: StaggeredEntranceProps['direction'];
  /** Duration per item */
  duration: number;
  /** Whether animation is active */
  isActive: boolean;
  /** Whether to reduce motion */
  reduceMotion: boolean;
  /** Child content */
  children: React.ReactNode;
}

// Context for staggered animation state
const StaggerContext = createContext<{
  isActive: boolean;
  getDelay: (index: number) => number;
  animation: StaggeredEntranceProps['animation'];
  duration: number;
  reduceMotion: boolean;
}>({
  isActive: false,
  getDelay: () => 0,
  animation: 'fadeSlide',
  duration: 400,
  reduceMotion: false,
});

function getAnimationStyles(
  animation: StaggeredEntranceProps['animation'],
  isActive: boolean,
  reduceMotion: boolean
): React.CSSProperties {
  if (reduceMotion) {
    return {
      opacity: isActive ? 1 : 0,
      transition: 'opacity 0.2s ease',
    };
  }

  const baseHidden: React.CSSProperties = { opacity: 0 };
  const baseVisible: React.CSSProperties = { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' };

  const animations: Record<NonNullable<typeof animation>, { hidden: React.CSSProperties; visible: React.CSSProperties }> = {
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    slideUp: {
      hidden: { opacity: 0, transform: 'translate3d(0, 20px, 0)' },
      visible: baseVisible,
    },
    slideDown: {
      hidden: { opacity: 0, transform: 'translate3d(0, -20px, 0)' },
      visible: baseVisible,
    },
    slideLeft: {
      hidden: { opacity: 0, transform: 'translate3d(20px, 0, 0)' },
      visible: baseVisible,
    },
    slideRight: {
      hidden: { opacity: 0, transform: 'translate3d(-20px, 0, 0)' },
      visible: baseVisible,
    },
    scale: {
      hidden: { opacity: 0, transform: 'scale(0.9)' },
      visible: baseVisible,
    },
    fadeSlide: {
      hidden: { opacity: 0, transform: 'translate3d(0, 16px, 0)' },
      visible: baseVisible,
    },
    pop: {
      hidden: { opacity: 0, transform: 'scale(0.85)' },
      visible: { opacity: 1, transform: 'scale(1)' },
    },
  };

  return isActive ? animations[animation!].visible : animations[animation!].hidden;
}

function calculateDelay(
  index: number,
  count: number,
  direction: StaggeredEntranceProps['direction'],
  delay: number,
  initialDelay: number
): number {
  switch (direction) {
    case 'backwards':
      return initialDelay + (count - 1 - index) * delay;
    case 'center-out': {
      const center = Math.floor(count / 2);
      const distanceFromCenter = Math.abs(index - center);
      return initialDelay + distanceFromCenter * delay;
    }
    case 'forwards':
    default:
      return initialDelay + index * delay;
  }
}

function StaggeredItem({
  index,
  count,
  delay,
  initialDelay,
  animation,
  direction,
  duration,
  isActive,
  reduceMotion,
  children,
}: StaggeredItemProps) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const itemDelay = calculateDelay(index, count, direction, delay, initialDelay);

  useEffect(() => {
    if (!isActive) {
      setHasAnimated(false);
      return;
    }

    const timeout = setTimeout(() => {
      setHasAnimated(true);
    }, itemDelay);

    return () => clearTimeout(timeout);
  }, [isActive, itemDelay]);

  const styles = getAnimationStyles(animation, hasAnimated, reduceMotion);
  
  const transitionStyle: React.CSSProperties = reduceMotion
    ? {}
    : {
        transition: `opacity ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1), transform ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
        willChange: hasAnimated ? 'auto' : 'opacity, transform',
      };

  return (
    <div
      style={{ ...styles, ...transitionStyle }}
      data-stagger-index={index}
    >
      {children}
    </div>
  );
}

export function StaggeredEntrance({
  children,
  delay = 80,
  initialDelay = 0,
  animation = 'fadeSlide',
  direction = 'forwards',
  duration = 400,
  hasAnimated: controlledHasAnimated,
  onComplete,
  trigger = 'intersection',
  threshold = 0.1,
  resetOnChildrenChange = true,
  className = '',
  as: Component = 'div',
}: StaggeredEntranceProps) {
  const [isActive, setIsActive] = useState(trigger === 'mount');
  const [reduceMotion, setReduceMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const childArray = useMemo(() => 
    Array.isArray(children) ? children.filter(Boolean) : children ? [children] : [],
    [children]
  );
  const prevChildCount = useRef(childArray.length);

  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Reset animation when children change (if enabled)
  useEffect(() => {
    if (resetOnChildrenChange && childArray.length !== prevChildCount.current) {
      setIsActive(false);
      // Re-trigger after a frame
      requestAnimationFrame(() => {
        setIsActive(trigger === 'mount' || controlledHasAnimated !== false);
      });
    }
    prevChildCount.current = childArray.length;
  }, [childArray.length, resetOnChildrenChange, trigger, controlledHasAnimated]);

  // Intersection observer for trigger='intersection'
  useEffect(() => {
    if (trigger !== 'intersection' || !containerRef.current) return;
    if (controlledHasAnimated !== undefined) {
      setIsActive(controlledHasAnimated);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsActive(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: '50px' }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [trigger, threshold, controlledHasAnimated]);

  // Call onComplete when all items have animated
  useEffect(() => {
    if (!isActive || !onComplete || childArray.length === 0) return;

    const totalDuration = initialDelay + (childArray.length - 1) * delay + duration;
    const timeout = setTimeout(onComplete, totalDuration);

    return () => clearTimeout(timeout);
  }, [isActive, onComplete, childArray.length, initialDelay, delay, duration]);

  return (
    <Component
      ref={containerRef as any}
      className={`staggered-entrance ${className}`}
      data-stagger-active={isActive}
    >
      {childArray.map((child, index) => (
        <StaggeredItem
          key={index}
          index={index}
          count={childArray.length}
          delay={delay}
          initialDelay={initialDelay}
          animation={animation}
          direction={direction}
          duration={duration}
          isActive={isActive}
          reduceMotion={reduceMotion}
        >
          {child}
        </StaggeredItem>
      ))}
    </Component>
  );
}

/**
 * useStaggeredEntrance - Hook for manual control over staggered animations
 * 
 * Returns animation state and controls for custom implementations.
 */
export function useStaggeredEntrance(itemCount: number, options?: {
  delay?: number;
  initialDelay?: number;
  animation?: StaggeredEntranceProps['animation'];
  direction?: StaggeredEntranceProps['direction'];
  duration?: number;
}) {
  const [isActive, setIsActive] = useState(false);
  const [animatedItems, setAnimatedItems] = useState<Set<number>>(new Set());
  const [reduceMotion, setReduceMotion] = useState(false);

  const {
    delay = 80,
    initialDelay = 0,
    animation = 'fadeSlide',
    direction = 'forwards',
    duration = 400,
  } = options || {};

  // Check for reduced motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Animate items when active
  useEffect(() => {
    if (!isActive) {
      setAnimatedItems(new Set());
      return;
    }

    const timeouts: NodeJS.Timeout[] = [];
    
    for (let i = 0; i < itemCount; i++) {
      const itemDelay = calculateDelay(i, itemCount, direction, delay, initialDelay);
      const timeout = setTimeout(() => {
        setAnimatedItems(prev => new Set(prev).add(i));
      }, itemDelay);
      timeouts.push(timeout);
    }

    return () => timeouts.forEach(clearTimeout);
  }, [isActive, itemCount, direction, delay, initialDelay]);

  const getItemProps = (index: number): React.CSSProperties & { 'data-stagger-index': number } => {
    const hasAnimated = animatedItems.has(index);
    return {
      ...getAnimationStyles(animation, hasAnimated, reduceMotion),
      transition: reduceMotion
        ? 'opacity 0.2s ease'
        : `opacity ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1), transform ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
      'data-stagger-index': index,
    };
  };

  return {
    isActive,
    start: () => setIsActive(true),
    reset: () => {
      setIsActive(false);
      setAnimatedItems(new Set());
    },
    isItemAnimated: (index: number) => animatedItems.has(index),
    getItemProps,
    allAnimated: animatedItems.size === itemCount,
    animatedCount: animatedItems.size,
  };
}

/**
 * StaggeredList - Pre-styled list with staggered item animations
 * 
 * A convenience wrapper for common list patterns with built-in
 * staggered animations and semantic HTML.
 */
interface StaggeredListProps extends Omit<StaggeredEntranceProps, 'as'> {
  /** List items */
  items: React.ReactNode[];
  /** List type */
  listType?: 'ul' | 'ol';
  /** Item className */
  itemClassName?: string;
  /** Gap between items */
  gap?: number;
}

export function StaggeredList({
  items,
  listType = 'ul',
  itemClassName = '',
  gap = 8,
  className = '',
  ...staggerProps
}: StaggeredListProps) {
  const ListComponent = listType;

  return (
    <StaggeredEntrance
      as={listType}
      className={className}
      {...staggerProps}
    >
      {items.map((item, index) => (
        <li 
          key={index} 
          className={itemClassName}
          style={{ marginBottom: index < items.length - 1 ? gap : 0 }}
        >
          {item}
        </li>
      ))}
    </StaggeredEntrance>
  );
}

/**
 * StaggeredGrid - Grid layout with staggered item animations
 */
interface StaggeredGridProps extends Omit<StaggeredEntranceProps, 'as'> {
  /** Grid items */
  items: React.ReactNode[];
  /** Number of columns */
  columns?: number | { sm?: number; md?: number; lg?: number };
  /** Gap between items */
  gap?: number;
  /** Item className */
  itemClassName?: string;
}

export function StaggeredGrid({
  items,
  columns = 3,
  gap = 16,
  itemClassName = '',
  className = '',
  direction = 'forwards',
  ...staggerProps
}: StaggeredGridProps) {
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: typeof columns === 'number'
      ? `repeat(${columns}, 1fr)`
      : `repeat(${columns.sm || 1}, 1fr)`,
    gap: `${gap}px`,
  };

  return (
    <StaggeredEntrance
      className={className}
      direction={direction}
      {...staggerProps}
    >
      <div style={gridStyle}>
        {items.map((item, index) => (
          <div key={index} className={itemClassName}>
            {item}
          </div>
        ))}
      </div>
    </StaggeredEntrance>
  );
}

export default StaggeredEntrance;
