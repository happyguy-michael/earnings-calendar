'use client';

import { useEffect, useState, useRef, useCallback, ReactNode, startTransition } from 'react';

interface ViewTransitionProps {
  children: ReactNode;
  /** Key that triggers transition when changed */
  transitionKey: string | number;
  /** Animation duration in ms */
  duration?: number;
  /** Whether to blur during transition */
  blur?: boolean;
  /** Amount of blur in px */
  blurAmount?: number;
  /** Slide direction */
  slideDirection?: 'left' | 'right' | 'up' | 'down' | 'none';
  /** Slide distance in px */
  slideDistance?: number;
  /** Additional className */
  className?: string;
  /** Whether transitions are enabled */
  enabled?: boolean;
}

/**
 * ViewTransition - Smooth blur-fade transitions for content changes
 * 
 * Inspired by Apple's iOS/macOS content transitions and modern dashboard UIs.
 * Creates a polished, app-like feel when content changes.
 * 
 * Features:
 * - Smooth blur-fade on content change
 * - Optional directional slide
 * - Respects prefers-reduced-motion
 * - Uses CSS transitions for performance
 * - Detects swipe direction for natural animations
 */
export function ViewTransition({
  children,
  transitionKey,
  duration = 300,
  blur = true,
  blurAmount = 8,
  slideDirection = 'none',
  slideDistance = 20,
  className = '',
  enabled = true,
}: ViewTransitionProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [currentDirection, setCurrentDirection] = useState(slideDirection);
  const prevKeyRef = useRef(transitionKey);
  const prefersReducedMotion = useRef(false);
  
  // Check for reduced motion preference
  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);
  
  // Detect direction based on key change (for week navigation)
  useEffect(() => {
    if (transitionKey !== prevKeyRef.current && enabled && !prefersReducedMotion.current) {
      // Determine direction based on numeric key change
      const isNumeric = typeof transitionKey === 'number' || !isNaN(Number(transitionKey));
      const prevNumeric = typeof prevKeyRef.current === 'number' || !isNaN(Number(prevKeyRef.current));
      
      if (isNumeric && prevNumeric && slideDirection !== 'none') {
        const current = Number(transitionKey);
        const prev = Number(prevKeyRef.current);
        setCurrentDirection(current > prev ? 'left' : 'right');
      } else {
        setCurrentDirection(slideDirection);
      }
      
      setIsTransitioning(true);
      
      // After half the duration, swap content (at peak blur/fade)
      const contentSwapTimeout = setTimeout(() => {
        startTransition(() => {
          setDisplayChildren(children);
        });
      }, duration / 2);
      
      // After full duration, end transition
      const endTimeout = setTimeout(() => {
        setIsTransitioning(false);
      }, duration);
      
      prevKeyRef.current = transitionKey;
      
      return () => {
        clearTimeout(contentSwapTimeout);
        clearTimeout(endTimeout);
      };
    } else if (transitionKey === prevKeyRef.current) {
      // Key didn't change but children might have
      setDisplayChildren(children);
    }
  }, [transitionKey, children, duration, slideDirection, enabled]);
  
  // If motion is reduced or disabled, just render children
  if (!enabled || prefersReducedMotion.current) {
    return <div className={className}>{children}</div>;
  }
  
  // Calculate transform based on direction and transition phase
  const getTransform = () => {
    if (!isTransitioning || currentDirection === 'none') return 'none';
    
    const transforms: Record<string, string> = {
      left: `translateX(-${slideDistance}px)`,
      right: `translateX(${slideDistance}px)`,
      up: `translateY(-${slideDistance}px)`,
      down: `translateY(${slideDistance}px)`,
    };
    
    return transforms[currentDirection] || 'none';
  };
  
  return (
    <div
      className={`view-transition-container ${className}`}
      style={{
        transition: `opacity ${duration / 2}ms ease-out, filter ${duration / 2}ms ease-out, transform ${duration}ms var(--spring-smooth, ease-out)`,
        opacity: isTransitioning ? 0.3 : 1,
        filter: blur && isTransitioning ? `blur(${blurAmount}px)` : 'blur(0px)',
        transform: getTransform(),
        willChange: isTransitioning ? 'opacity, filter, transform' : 'auto',
      }}
    >
      {displayChildren}
    </div>
  );
}

/**
 * useViewTransition - Hook for programmatic view transitions
 * 
 * Returns a function to trigger transitions with the View Transitions API
 * when available, with a fallback for older browsers.
 */
export function useViewTransition() {
  const startViewTransition = useCallback((callback: () => void) => {
    // Check if View Transitions API is available
    if ('startViewTransition' in document && typeof (document as any).startViewTransition === 'function') {
      (document as any).startViewTransition(callback);
    } else {
      // Fallback: just run the callback
      callback();
    }
  }, []);
  
  return { startViewTransition };
}

/**
 * CrossFade - Simple crossfade between two states
 * 
 * More lightweight alternative for simple state changes
 */
export function CrossFade({
  children,
  show,
  duration = 200,
  className = '',
}: {
  children: ReactNode;
  show: boolean;
  duration?: number;
  className?: string;
}) {
  return (
    <div
      className={`crossfade-container ${className}`}
      style={{
        transition: `opacity ${duration}ms ease-out`,
        opacity: show ? 1 : 0,
        pointerEvents: show ? 'auto' : 'none',
      }}
    >
      {children}
    </div>
  );
}

/**
 * StaggeredChildren - Stagger animation for list/grid children
 * 
 * Common pattern in modern dashboards where items animate in sequentially
 */
export function StaggeredChildren({
  children,
  staggerDelay = 50,
  initialDelay = 0,
  className = '',
  enabled = true,
}: {
  children: ReactNode;
  staggerDelay?: number;
  initialDelay?: number;
  className?: string;
  enabled?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    if (enabled) {
      const timer = setTimeout(() => setMounted(true), initialDelay);
      return () => clearTimeout(timer);
    }
  }, [enabled, initialDelay]);
  
  // Inject stagger delay CSS custom property into children
  const staggeredChildren = Array.isArray(children) 
    ? children.map((child, index) => (
        <div 
          key={index}
          className="stagger-child"
          style={{
            '--stagger-index': index,
            '--stagger-delay': `${index * staggerDelay}ms`,
            animation: mounted && enabled 
              ? `staggerFadeIn 400ms var(--spring-smooth, ease-out) calc(${initialDelay}ms + ${index * staggerDelay}ms) both`
              : 'none',
          } as React.CSSProperties}
        >
          {child}
        </div>
      ))
    : children;
  
  return (
    <div className={`staggered-container ${className}`}>
      {staggeredChildren}
    </div>
  );
}

export default ViewTransition;
