'use client';

import { useEffect, useRef, useState, ReactNode, Children, cloneElement, isValidElement } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  /** Animation type */
  animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'blur';
  /** Delay before animation starts (ms) */
  delay?: number;
  /** Animation duration (ms) */
  duration?: number;
  /** Distance to travel (px) */
  distance?: number;
  /** Viewport threshold to trigger (0-1) */
  threshold?: number;
  /** Only animate once */
  once?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Easing function */
  easing?: string;
}

export function ScrollReveal({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 600,
  distance = 30,
  threshold = 0.1,
  once = true,
  className = '',
  easing = 'cubic-bezier(0.16, 1, 0.3, 1)',
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, once, prefersReducedMotion]);

  const getInitialTransform = () => {
    switch (animation) {
      case 'fade-up': return `translateY(${distance}px)`;
      case 'fade-down': return `translateY(-${distance}px)`;
      case 'fade-left': return `translateX(${distance}px)`;
      case 'fade-right': return `translateX(-${distance}px)`;
      case 'scale': return 'scale(0.95)';
      case 'blur': return 'scale(0.98)';
      default: return 'translateY(20px)';
    }
  };

  const getInitialFilter = () => {
    if (animation === 'blur') return 'blur(8px)';
    return 'none';
  };

  const style: React.CSSProperties = prefersReducedMotion
    ? {}
    : {
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'none' : getInitialTransform(),
        filter: isVisible ? 'none' : getInitialFilter(),
        transition: `opacity ${duration}ms ${easing} ${delay}ms, transform ${duration}ms ${easing} ${delay}ms, filter ${duration}ms ${easing} ${delay}ms`,
        willChange: isVisible ? 'auto' : 'opacity, transform, filter',
      };

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

interface StaggeredRevealProps {
  children: ReactNode;
  /** Animation type */
  animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'blur';
  /** Base delay before first item (ms) */
  baseDelay?: number;
  /** Delay increment between items (ms) */
  stagger?: number;
  /** Animation duration (ms) */
  duration?: number;
  /** Distance to travel (px) */
  distance?: number;
  /** Viewport threshold to trigger (0-1) */
  threshold?: number;
  /** Only animate once */
  once?: boolean;
  /** Container CSS classes */
  className?: string;
  /** Easing function */
  easing?: string;
}

export function StaggeredReveal({
  children,
  animation = 'fade-up',
  baseDelay = 0,
  stagger = 50,
  duration = 500,
  distance = 20,
  threshold = 0.05,
  once = true,
  className = '',
  easing = 'cubic-bezier(0.16, 1, 0.3, 1)',
}: StaggeredRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin: '0px 0px -30px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, once, prefersReducedMotion]);

  const getInitialTransform = () => {
    switch (animation) {
      case 'fade-up': return `translateY(${distance}px)`;
      case 'fade-down': return `translateY(-${distance}px)`;
      case 'fade-left': return `translateX(${distance}px)`;
      case 'fade-right': return `translateX(-${distance}px)`;
      case 'scale': return 'scale(0.95)';
      case 'blur': return 'scale(0.98)';
      default: return 'translateY(15px)';
    }
  };

  const getInitialFilter = () => {
    if (animation === 'blur') return 'blur(6px)';
    return 'none';
  };

  const childArray = Children.toArray(children);

  return (
    <div ref={ref} className={className}>
      {childArray.map((child, index) => {
        if (!isValidElement(child)) return child;
        
        const delay = baseDelay + index * stagger;
        
        const style: React.CSSProperties = prefersReducedMotion
          ? {}
          : {
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'none' : getInitialTransform(),
              filter: isVisible ? 'none' : getInitialFilter(),
              transition: `opacity ${duration}ms ${easing} ${delay}ms, transform ${duration}ms ${easing} ${delay}ms, filter ${duration}ms ${easing} ${delay}ms`,
              willChange: isVisible ? 'auto' : 'opacity, transform, filter',
            };
        
        return cloneElement(child as React.ReactElement<{ style?: React.CSSProperties }>, {
          style: { ...(child.props as { style?: React.CSSProperties }).style, ...style },
        });
      })}
    </div>
  );
}

// Specialized component for table rows
interface RevealTableBodyProps {
  children: ReactNode;
  /** Delay increment between rows (ms) */
  stagger?: number;
  /** Animation duration (ms) */
  duration?: number;
  /** Base delay (ms) */
  baseDelay?: number;
}

export function RevealTableBody({
  children,
  stagger = 60,
  duration = 400,
  baseDelay = 100,
}: RevealTableBodyProps) {
  const ref = useRef<HTMLTableSectionElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -20px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  const childArray = Children.toArray(children);

  return (
    <tbody ref={ref} className="divide-y divide-white/5">
      {childArray.map((child, index) => {
        if (!isValidElement(child)) return child;
        
        const delay = baseDelay + index * stagger;
        
        const style: React.CSSProperties = prefersReducedMotion
          ? {}
          : {
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'none' : 'translateX(-15px)',
              transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
            };
        
        return cloneElement(child as React.ReactElement<{ style?: React.CSSProperties }>, {
          style: { ...(child.props as { style?: React.CSSProperties }).style, ...style },
        });
      })}
    </tbody>
  );
}
