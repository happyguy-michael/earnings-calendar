'use client';

import { useEffect, useRef, useState, ReactNode, CSSProperties } from 'react';

/**
 * ScrollPerspective - Scroll-Driven 3D Depth Effect
 * 
 * 2026 Trend: "Living interfaces that respond to user actions organically"
 * Source: Material Design 3 Motion, Linear.app depth cues, Stripe dashboard 3D effects
 * 
 * As the user scrolls down, content subtly tilts in 3D space, creating
 * the sensation of looking "down into" the page. This adds physical
 * depth to flat interfaces without being distracting.
 * 
 * Features:
 * - Smooth rotateX tilt based on scroll position
 * - Configurable max rotation angle (subtle by default)
 * - Perspective origin follows viewport center
 * - Spring-physics smoothing for butter-smooth motion
 * - GPU-accelerated via CSS transforms
 * - Respects prefers-reduced-motion
 */

interface ScrollPerspectiveProps {
  children: ReactNode;
  /** Maximum rotation angle in degrees (default: 2.5) */
  maxAngle?: number;
  /** Scroll distance (px) to reach max rotation (default: 500) */
  scrollDistance?: number;
  /** Perspective depth in px (default: 1200) */
  perspective?: number;
  /** Smoothing factor 0-1, higher = smoother (default: 0.1) */
  smoothing?: number;
  /** Additional className */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
}

export function ScrollPerspective({
  children,
  maxAngle = 2.5,
  scrollDistance = 500,
  perspective = 1200,
  smoothing = 0.1,
  className = '',
  style,
}: ScrollPerspectiveProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentRotation = useRef(0);
  const targetRotation = useRef(0);
  const rafId = useRef<number>(0);
  const [mounted, setMounted] = useState(false);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    setMounted(true);
    
    if (typeof window === 'undefined') return;
    
    // Check reduced motion preference
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion.current) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Calculate target rotation based on scroll position
      // Clamp to maxAngle and use sin curve for natural ease at extremes
      const progress = Math.min(scrollY / scrollDistance, 1);
      // Sin curve gives natural acceleration/deceleration
      targetRotation.current = Math.sin(progress * Math.PI * 0.5) * maxAngle;
    };

    const animate = () => {
      // Smooth interpolation toward target
      const delta = targetRotation.current - currentRotation.current;
      
      if (Math.abs(delta) > 0.001) {
        currentRotation.current += delta * smoothing;
        
        if (containerRef.current) {
          containerRef.current.style.transform = `
            perspective(${perspective}px) 
            rotateX(${currentRotation.current}deg)
          `;
        }
      }
      
      rafId.current = requestAnimationFrame(animate);
    };

    // Initial calculation
    handleScroll();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, [maxAngle, scrollDistance, perspective, smoothing]);

  if (!mounted) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`scroll-perspective ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        transformOrigin: 'center top',
        willChange: prefersReducedMotion.current ? 'auto' : 'transform',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/**
 * ScrollPerspectiveCard - Individual cards that participate in scroll depth
 * 
 * Cards closer to the top of viewport get more tilt, cards further down
 * get progressively less tilt, creating a "fanning out" effect like
 * looking at a deck of cards from above.
 */
interface ScrollPerspectiveCardProps {
  children: ReactNode;
  /** Card index for staggered depth (0 = closest) */
  index?: number;
  /** Depth multiplier per index (default: 0.5deg) */
  depthStep?: number;
  /** Additional className */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
}

export function ScrollPerspectiveCard({
  children,
  index = 0,
  depthStep = 0.5,
  className = '',
  style,
}: ScrollPerspectiveCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [tilt, setTilt] = useState(0);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion.current) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          
          // Calculate tilt based on position in viewport
          const rect = entry.boundingClientRect;
          const viewportHeight = window.innerHeight;
          const centerOffset = (rect.top + rect.height / 2) / viewportHeight;
          // Cards near top tilt more, cards near bottom tilt less
          const tiltAmount = (1 - centerOffset) * depthStep * (index + 1);
          setTilt(Math.max(0, Math.min(tiltAmount, depthStep * 5)));
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [index, depthStep]);

  return (
    <div
      ref={cardRef}
      className={`scroll-perspective-card ${isVisible ? 'visible' : ''} ${className}`}
      style={{
        transform: isVisible && !prefersReducedMotion.current
          ? `translateZ(${-index * 2}px) rotateX(${tilt}deg)`
          : 'none',
        transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease-out',
        opacity: isVisible ? 1 : 0,
        transformStyle: 'preserve-3d',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/**
 * useScrollPerspective - Hook for custom scroll-driven transforms
 * 
 * Returns current rotation value that can be used for custom effects.
 */
export function useScrollPerspective(
  maxAngle = 2.5,
  scrollDistance = 500,
  smoothing = 0.1
): { rotation: number; progress: number } {
  const [state, setState] = useState({ rotation: 0, progress: 0 });
  const currentRotation = useRef(0);
  const targetRotation = useRef(0);
  const rafId = useRef<number>(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const progress = Math.min(scrollY / scrollDistance, 1);
      targetRotation.current = Math.sin(progress * Math.PI * 0.5) * maxAngle;
    };

    const animate = () => {
      const delta = targetRotation.current - currentRotation.current;
      
      if (Math.abs(delta) > 0.001) {
        currentRotation.current += delta * smoothing;
        const progress = Math.min(window.scrollY / scrollDistance, 1);
        setState({ 
          rotation: currentRotation.current, 
          progress 
        });
      }
      
      rafId.current = requestAnimationFrame(animate);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, [maxAngle, scrollDistance, smoothing]);

  return state;
}

export default ScrollPerspective;
