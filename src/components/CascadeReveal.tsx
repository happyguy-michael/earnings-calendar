'use client';

import React, { useEffect, useRef, useState, createContext, useContext, useMemo, useCallback } from 'react';

/**
 * CascadeReveal - Staggered entrance animation for groups of elements
 * 
 * When the container scrolls into view, child elements animate in with a 
 * cascading wave effect. Similar to premium patterns in Linear, Stripe, Notion.
 * 
 * Features:
 * - Intersection Observer based triggering
 * - Configurable stagger delay between items
 * - Multiple animation presets (fade, slide, scale, flip)
 * - Direction options (left, right, up, down)
 * - Once or repeat animation modes
 * - Respects prefers-reduced-motion
 */

interface CascadeConfig {
  staggerDelay: number;
  duration: number;
  easing: string;
  preset: 'fade' | 'slide' | 'scale' | 'flip' | 'blur' | 'spring';
  direction: 'up' | 'down' | 'left' | 'right';
  distance: number;
  threshold: number;
  once: boolean;
}

interface CascadeContextValue {
  isRevealed: boolean;
  getItemDelay: (index: number) => number;
  config: CascadeConfig;
}

const CascadeContext = createContext<CascadeContextValue | null>(null);

const defaultConfig: CascadeConfig = {
  staggerDelay: 60,
  duration: 500,
  easing: 'cubic-bezier(0.22, 1, 0.36, 1)', // Out-expo for smooth decel
  preset: 'slide',
  direction: 'up',
  distance: 20,
  threshold: 0.15,
  once: true,
};

// Spring easing for bounce effect
const springEasing = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

interface CascadeRevealProps {
  children: React.ReactNode;
  className?: string;
  /** Delay between each item (ms) */
  staggerDelay?: number;
  /** Animation duration per item (ms) */
  duration?: number;
  /** CSS easing function */
  easing?: string;
  /** Animation preset */
  preset?: 'fade' | 'slide' | 'scale' | 'flip' | 'blur' | 'spring';
  /** Direction for slide/flip animations */
  direction?: 'up' | 'down' | 'left' | 'right';
  /** Distance to travel for slide animations (px) */
  distance?: number;
  /** Intersection threshold (0-1) */
  threshold?: number;
  /** Only animate once */
  once?: boolean;
  /** Initial delay before cascade starts (ms) */
  delay?: number;
  /** Trigger immediately without intersection observer */
  triggerOnMount?: boolean;
}

export function CascadeReveal({
  children,
  className = '',
  staggerDelay = defaultConfig.staggerDelay,
  duration = defaultConfig.duration,
  easing = defaultConfig.easing,
  preset = defaultConfig.preset,
  direction = defaultConfig.direction,
  distance = defaultConfig.distance,
  threshold = defaultConfig.threshold,
  once = defaultConfig.once,
  delay = 0,
  triggerOnMount = false,
}: CascadeRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(triggerOnMount);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const hasTriggered = useRef(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Intersection Observer
  useEffect(() => {
    if (triggerOnMount || prefersReducedMotion) return;
    
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          if (once && hasTriggered.current) return;
          
          // Apply initial delay
          setTimeout(() => {
            setIsRevealed(true);
            hasTriggered.current = true;
          }, delay);
          
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsRevealed(false);
        }
      },
      { threshold, rootMargin: '50px 0px' }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [threshold, once, delay, triggerOnMount, prefersReducedMotion]);

  // Build config object
  const config = useMemo<CascadeConfig>(() => ({
    staggerDelay: prefersReducedMotion ? 0 : staggerDelay,
    duration: prefersReducedMotion ? 0 : duration,
    easing: preset === 'spring' ? springEasing : easing,
    preset: prefersReducedMotion ? 'fade' : preset,
    direction,
    distance: prefersReducedMotion ? 0 : distance,
    threshold,
    once,
  }), [staggerDelay, duration, easing, preset, direction, distance, threshold, once, prefersReducedMotion]);

  const getItemDelay = useCallback((index: number) => {
    return index * config.staggerDelay;
  }, [config.staggerDelay]);

  const contextValue = useMemo<CascadeContextValue>(() => ({
    isRevealed: prefersReducedMotion ? true : isRevealed,
    getItemDelay,
    config,
  }), [isRevealed, getItemDelay, config, prefersReducedMotion]);

  return (
    <CascadeContext.Provider value={contextValue}>
      <div 
        ref={containerRef} 
        className={`cascade-reveal-container ${className}`}
        data-revealed={isRevealed}
      >
        {children}
      </div>
    </CascadeContext.Provider>
  );
}

// Hook for custom implementations
export function useCascadeReveal() {
  const context = useContext(CascadeContext);
  if (!context) {
    // Return default when used outside provider
    return {
      isRevealed: true,
      getItemDelay: () => 0,
      config: defaultConfig,
    };
  }
  return context;
}

interface CascadeItemProps {
  children: React.ReactNode;
  index: number;
  className?: string;
  style?: React.CSSProperties;
  /** Override animation preset for this item */
  preset?: 'fade' | 'slide' | 'scale' | 'flip' | 'blur' | 'spring';
}

export function CascadeItem({
  children,
  index,
  className = '',
  style = {},
  preset: itemPreset,
}: CascadeItemProps) {
  const { isRevealed, getItemDelay, config } = useCascadeReveal();
  const delay = getItemDelay(index);
  const preset = itemPreset || config.preset;

  // Calculate transform based on direction
  const getInitialTransform = () => {
    const d = config.distance;
    switch (config.direction) {
      case 'up': return `translateY(${d}px)`;
      case 'down': return `translateY(-${d}px)`;
      case 'left': return `translateX(${d}px)`;
      case 'right': return `translateX(-${d}px)`;
      default: return 'translateY(0)';
    }
  };

  // Get initial styles based on preset
  const getInitialStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      opacity: 0,
      transition: `opacity ${config.duration}ms ${config.easing} ${delay}ms, transform ${config.duration}ms ${config.easing} ${delay}ms, filter ${config.duration}ms ${config.easing} ${delay}ms`,
    };

    switch (preset) {
      case 'fade':
        return base;
      case 'slide':
        return { ...base, transform: getInitialTransform() };
      case 'scale':
        return { ...base, transform: `scale(0.92) ${getInitialTransform()}` };
      case 'flip':
        return { 
          ...base, 
          transform: config.direction === 'up' || config.direction === 'down' 
            ? `perspective(600px) rotateX(${config.direction === 'up' ? 8 : -8}deg) ${getInitialTransform()}`
            : `perspective(600px) rotateY(${config.direction === 'left' ? 8 : -8}deg) ${getInitialTransform()}`,
          transformOrigin: config.direction === 'up' ? 'bottom center' : 'top center',
        };
      case 'blur':
        return { ...base, transform: getInitialTransform(), filter: 'blur(8px)' };
      case 'spring':
        return { ...base, transform: `scale(0.85) ${getInitialTransform()}` };
      default:
        return base;
    }
  };

  // Get revealed styles
  const getRevealedStyles = (): React.CSSProperties => {
    return {
      opacity: 1,
      transform: 'translateY(0) translateX(0) scale(1) rotateX(0) rotateY(0)',
      filter: 'blur(0)',
      transition: `opacity ${config.duration}ms ${config.easing} ${delay}ms, transform ${config.duration}ms ${config.easing} ${delay}ms, filter ${config.duration}ms ${config.easing} ${delay}ms`,
    };
  };

  const computedStyle: React.CSSProperties = {
    ...style,
    ...(isRevealed ? getRevealedStyles() : getInitialStyles()),
    willChange: isRevealed ? 'auto' : 'opacity, transform, filter',
  };

  return (
    <div 
      className={`cascade-item ${className}`}
      style={computedStyle}
      data-cascade-index={index}
      data-cascade-revealed={isRevealed}
    >
      {children}
    </div>
  );
}

// Auto-indexing wrapper - wraps children and auto-assigns indices
interface CascadeGroupProps {
  children: React.ReactNode;
  className?: string;
  itemClassName?: string;
  /** Starting index offset */
  startIndex?: number;
  /** Override preset for all items in group */
  preset?: 'fade' | 'slide' | 'scale' | 'flip' | 'blur' | 'spring';
}

export function CascadeGroup({
  children,
  className = '',
  itemClassName = '',
  startIndex = 0,
  preset,
}: CascadeGroupProps) {
  return (
    <div className={`cascade-group ${className}`}>
      {React.Children.map(children, (child, i) => {
        if (!React.isValidElement(child)) return child;
        return (
          <CascadeItem 
            index={startIndex + i} 
            className={itemClassName}
            preset={preset}
          >
            {child}
          </CascadeItem>
        );
      })}
    </div>
  );
}

// Convenience wrapper for a single section with automatic cascade
interface CascadeSectionProps extends Omit<CascadeRevealProps, 'children'> {
  children: React.ReactNode;
  itemClassName?: string;
  /** Override preset for all items */
  itemPreset?: 'fade' | 'slide' | 'scale' | 'flip' | 'blur' | 'spring';
}

export function CascadeSection({
  children,
  itemClassName = '',
  itemPreset,
  ...cascadeProps
}: CascadeSectionProps) {
  return (
    <CascadeReveal {...cascadeProps}>
      <CascadeGroup itemClassName={itemClassName} preset={itemPreset}>
        {children}
      </CascadeGroup>
    </CascadeReveal>
  );
}

// Styles (inline for no external CSS dependency)
export function CascadeStyles() {
  return (
    <style jsx global>{`
      .cascade-reveal-container {
        /* Container styles if needed */
      }
      
      .cascade-item {
        /* Base item styles */
      }
      
      /* Reduced motion fallback */
      @media (prefers-reduced-motion: reduce) {
        .cascade-item {
          transition: none !important;
          opacity: 1 !important;
          transform: none !important;
          filter: none !important;
        }
      }
    `}</style>
  );
}

export default CascadeReveal;
