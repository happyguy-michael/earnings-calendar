'use client';

import { useRef, useEffect, useState, ReactNode } from 'react';

interface ParallaxFloatProps {
  children: ReactNode;
  /** Float intensity - how much the element moves relative to scroll (default 0.05 = 5%) */
  intensity?: number;
  /** Direction of float: 'up' means element moves up as page scrolls down */
  direction?: 'up' | 'down';
  /** Maximum offset in pixels to prevent excessive movement */
  maxOffset?: number;
  /** Delay before the effect kicks in (stagger support) */
  delay?: number;
  /** Additional CSS class */
  className?: string;
  /** Enable/disable the effect */
  enabled?: boolean;
}

/**
 * ParallaxFloat - Subtle floating effect on scroll for premium layered feel
 * 
 * Features:
 * - Smooth parallax movement based on scroll position
 * - Configurable intensity and direction
 * - Performance optimized with requestAnimationFrame
 * - Respects prefers-reduced-motion
 * - Optional delay for staggered effects
 * - Mobile-friendly with reduced intensity on touch devices
 */
export function ParallaxFloat({
  children,
  intensity = 0.05,
  direction = 'up',
  maxOffset = 30,
  delay = 0,
  className = '',
  enabled = true,
}: ParallaxFloatProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const [offset, setOffset] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Check for reduced motion preference and touch device
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);
    
    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);
    
    // Detect touch device
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    
    return () => motionQuery.removeEventListener('change', handleMotionChange);
  }, []);

  // Handle delay activation
  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setIsActive(true), delay);
      return () => clearTimeout(timer);
    } else {
      setIsActive(true);
    }
  }, [delay]);

  // Parallax scroll effect
  useEffect(() => {
    if (!enabled || !isActive || prefersReducedMotion) return;

    // Reduce intensity on mobile for subtlety
    const effectiveIntensity = isTouchDevice ? intensity * 0.5 : intensity;

    const handleScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const element = elementRef.current;
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Calculate how far through the viewport the element is
        // 0 = at bottom of viewport, 1 = at top of viewport
        const viewportProgress = 1 - (rect.top / windowHeight);
        
        // Only apply effect when element is somewhat visible
        if (viewportProgress > -0.5 && viewportProgress < 1.5) {
          // Calculate offset based on viewport position
          const rawOffset = (viewportProgress - 0.5) * 100 * effectiveIntensity;
          const clampedOffset = Math.max(-maxOffset, Math.min(maxOffset, rawOffset));
          
          // Apply direction
          const finalOffset = direction === 'up' ? -clampedOffset : clampedOffset;
          
          setOffset(finalOffset);
        }
      });
    };

    handleScroll(); // Initial calculation
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [enabled, isActive, prefersReducedMotion, isTouchDevice, intensity, direction, maxOffset]);

  // If disabled or reduced motion, just render children without effect
  if (!enabled || prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={elementRef}
      className={`parallax-float ${className}`}
      style={{
        transform: `translateY(${offset}px)`,
        transition: 'transform 0.15s cubic-bezier(0.22, 1, 0.36, 1)',
        willChange: isActive ? 'transform' : 'auto',
      }}
    >
      {children}
    </div>
  );
}

/**
 * ParallaxFloatGroup - Wrapper that applies staggered parallax to children
 * 
 * Usage:
 * <ParallaxFloatGroup staggerDelay={50}>
 *   <StatCard />
 *   <StatCard />
 *   <StatCard />
 * </ParallaxFloatGroup>
 */
interface ParallaxFloatGroupProps {
  children: ReactNode;
  /** Delay between each child's parallax activation (ms) */
  staggerDelay?: number;
  /** Base intensity for all children */
  intensity?: number;
  /** Enable varied intensities per child for more organic feel */
  variedIntensity?: boolean;
  className?: string;
}

export function ParallaxFloatGroup({
  children,
  staggerDelay = 50,
  intensity = 0.04,
  variedIntensity = true,
  className = '',
}: ParallaxFloatGroupProps) {
  const childArray = Array.isArray(children) ? children : [children];

  return (
    <div className={`parallax-float-group ${className}`}>
      {childArray.map((child, index) => {
        // Vary intensity slightly per child for more organic feel
        const childIntensity = variedIntensity
          ? intensity * (0.8 + (index % 3) * 0.2)
          : intensity;

        return (
          <ParallaxFloat
            key={index}
            intensity={childIntensity}
            delay={index * staggerDelay}
            direction={index % 2 === 0 ? 'up' : 'up'} // Subtle variation
          >
            {child}
          </ParallaxFloat>
        );
      })}
    </div>
  );
}

export default ParallaxFloat;
