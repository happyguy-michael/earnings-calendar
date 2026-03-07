'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook to track scroll velocity with spring-smoothed values.
 * Returns a multiplier that can be applied to animation speeds.
 * 
 * Inspired by shadcn.io scroll-velocity and Linear.app.
 */
export function useScrollVelocity(options?: {
  smoothing?: number;      // Spring smoothing factor (0-1, lower = smoother)
  sensitivity?: number;    // How much scroll affects velocity (higher = more responsive)
  maxMultiplier?: number;  // Maximum speed multiplier
  minMultiplier?: number;  // Minimum speed multiplier (for reverse/slow)
}) {
  const {
    smoothing = 0.15,
    sensitivity = 0.003,
    maxMultiplier = 4,
    minMultiplier = 0.2,
  } = options || {};

  const [velocityMultiplier, setVelocityMultiplier] = useState(1);
  const lastScrollY = useRef(0);
  const lastTime = useRef(performance.now());
  const targetVelocity = useRef(1);
  const animationFrame = useRef<number>(0);
  const currentVelocity = useRef(1);

  // Spring physics update loop
  useEffect(() => {
    let running = true;

    const updateSpring = () => {
      if (!running) return;

      // Apply spring smoothing
      const diff = targetVelocity.current - currentVelocity.current;
      currentVelocity.current += diff * smoothing;

      // Only update state if change is significant (avoid re-renders)
      const rounded = Math.round(currentVelocity.current * 100) / 100;
      setVelocityMultiplier(rounded);

      // Decay target velocity back toward 1 when not scrolling
      targetVelocity.current += (1 - targetVelocity.current) * 0.02;

      animationFrame.current = requestAnimationFrame(updateSpring);
    };

    animationFrame.current = requestAnimationFrame(updateSpring);

    return () => {
      running = false;
      cancelAnimationFrame(animationFrame.current);
    };
  }, [smoothing]);

  // Track scroll events
  useEffect(() => {
    const handleScroll = () => {
      const currentTime = performance.now();
      const currentScrollY = window.scrollY;
      
      const deltaY = currentScrollY - lastScrollY.current;
      const deltaTime = currentTime - lastTime.current;
      
      if (deltaTime > 0) {
        // Calculate velocity (pixels per millisecond)
        const rawVelocity = Math.abs(deltaY) / deltaTime;
        
        // Convert to multiplier with sensitivity
        const velocityEffect = rawVelocity * sensitivity * 100;
        
        // Calculate target: 1 = normal, > 1 = faster
        // Direction doesn't matter for speed, only magnitude
        const newTarget = 1 + Math.min(velocityEffect, maxMultiplier - 1);
        
        targetVelocity.current = Math.max(minMultiplier, Math.min(maxMultiplier, newTarget));
      }
      
      lastScrollY.current = currentScrollY;
      lastTime.current = currentTime;
    };

    // Use passive listener for performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sensitivity, maxMultiplier, minMultiplier]);

  return velocityMultiplier;
}

/**
 * Context provider for sharing scroll velocity across components.
 * Avoids multiple scroll listeners when velocity is used in several places.
 */
import { createContext, useContext, ReactNode } from 'react';

const ScrollVelocityContext = createContext<number>(1);

export function ScrollVelocityProvider({ 
  children,
  ...options
}: { 
  children: ReactNode;
  smoothing?: number;
  sensitivity?: number;
  maxMultiplier?: number;
  minMultiplier?: number;
}) {
  const velocity = useScrollVelocity(options);
  
  return (
    <ScrollVelocityContext.Provider value={velocity}>
      {children}
    </ScrollVelocityContext.Provider>
  );
}

export function useScrollVelocityValue() {
  return useContext(ScrollVelocityContext);
}

/**
 * Visual indicator component that shows current scroll velocity.
 * Useful for debugging or as a subtle UI element.
 */
export function ScrollVelocityIndicator({ className }: { className?: string }) {
  const velocity = useScrollVelocityValue();
  const isActive = velocity > 1.05;
  
  if (!isActive) return null;
  
  return (
    <div 
      className={`scroll-velocity-indicator ${className || ''}`}
      style={{
        '--velocity': velocity,
      } as React.CSSProperties}
    >
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 16 16" 
        fill="none"
        style={{
          transform: `scaleY(${Math.min(velocity, 2)})`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        <path 
          d="M8 2L8 14M8 14L4 10M8 14L12 10" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
      <span>{velocity.toFixed(1)}x</span>
    </div>
  );
}
