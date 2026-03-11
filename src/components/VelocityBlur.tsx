'use client';

import { useEffect, useRef, useState, ReactNode, memo, createContext, useContext } from 'react';

/**
 * VelocityBlur Component
 * 
 * Applies directional motion blur during fast scrolling, creating
 * a premium sense of physical momentum and weight.
 * 
 * Inspiration:
 * - Apple's iOS momentum scrolling with motion blur
 * - Linear.app's buttery-smooth scrolling feel
 * - Framer Motion's scroll-linked animations
 * - 2024/2025 "physical UI" trend on Dribbble
 * 
 * Features:
 * - Directional blur based on scroll direction
 * - Velocity-proportional intensity
 * - Smooth blur fade in/out with easing
 * - SVG filter-based (hardware accelerated)
 * - Respects prefers-reduced-motion
 * - Configurable threshold and intensity
 * - Context provider for global velocity state
 */

interface VelocityState {
  velocity: number;
  direction: 'up' | 'down' | 'idle';
  blur: number;
}

const VelocityBlurContext = createContext<VelocityState>({
  velocity: 0,
  direction: 'idle',
  blur: 0,
});

interface VelocityBlurProviderProps {
  children: ReactNode;
  /** Scroll speed threshold to start blur (px/ms) */
  threshold?: number;
  /** Maximum blur amount (px) */
  maxBlur?: number;
  /** How quickly blur fades in (0-1, higher = faster) */
  attackSpeed?: number;
  /** How quickly blur fades out (0-1, higher = faster) */
  releaseSpeed?: number;
  /** Sensitivity multiplier for velocity → blur conversion */
  sensitivity?: number;
}

export function VelocityBlurProvider({
  children,
  threshold = 0.8,
  maxBlur = 3,
  attackSpeed = 0.25,
  releaseSpeed = 0.08,
  sensitivity = 2.5,
}: VelocityBlurProviderProps) {
  const [state, setState] = useState<VelocityState>({
    velocity: 0,
    direction: 'idle',
    blur: 0,
  });
  
  const lastScrollY = useRef(0);
  const lastTime = useRef(performance.now());
  const targetBlur = useRef(0);
  const currentBlur = useRef(0);
  const currentDirection = useRef<'up' | 'down' | 'idle'>('idle');
  const rafId = useRef<number>(0);
  const prefersReducedMotion = useRef(false);
  const idleTimeout = useRef<NodeJS.Timeout | null>(null);

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mq.matches;
    
    const handler = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Animation loop for smooth blur transitions
  useEffect(() => {
    let running = true;

    const updateLoop = () => {
      if (!running) return;

      // Spring towards target blur
      const diff = targetBlur.current - currentBlur.current;
      const speed = targetBlur.current > currentBlur.current ? attackSpeed : releaseSpeed;
      currentBlur.current += diff * speed;

      // Snap to 0 when very close to avoid floating point noise
      if (currentBlur.current < 0.01) {
        currentBlur.current = 0;
        currentDirection.current = 'idle';
      }

      // Only update state when blur changes meaningfully
      const roundedBlur = Math.round(currentBlur.current * 100) / 100;
      
      setState(prev => {
        if (prev.blur === roundedBlur && prev.direction === currentDirection.current) {
          return prev;
        }
        return {
          velocity: prev.velocity,
          direction: currentDirection.current,
          blur: roundedBlur,
        };
      });

      rafId.current = requestAnimationFrame(updateLoop);
    };

    rafId.current = requestAnimationFrame(updateLoop);

    return () => {
      running = false;
      cancelAnimationFrame(rafId.current);
    };
  }, [attackSpeed, releaseSpeed]);

  // Track scroll events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      if (prefersReducedMotion.current) return;

      const now = performance.now();
      const currentScrollY = window.scrollY;
      
      const deltaY = currentScrollY - lastScrollY.current;
      const deltaTime = now - lastTime.current;
      
      if (deltaTime > 0 && deltaTime < 100) { // Ignore very long gaps
        // Calculate velocity (px/ms)
        const rawVelocity = Math.abs(deltaY) / deltaTime;
        
        // Determine direction
        if (deltaY < -2) {
          currentDirection.current = 'up';
        } else if (deltaY > 2) {
          currentDirection.current = 'down';
        }
        
        // Calculate target blur based on velocity
        if (rawVelocity > threshold) {
          const excessVelocity = rawVelocity - threshold;
          const blurAmount = Math.min(excessVelocity * sensitivity, maxBlur);
          targetBlur.current = blurAmount;
        }
        
        // Update velocity in state
        setState(prev => ({ ...prev, velocity: rawVelocity }));
        
        // Clear any existing idle timeout
        if (idleTimeout.current) {
          clearTimeout(idleTimeout.current);
        }
        
        // Set idle timeout to fade blur when scrolling stops
        idleTimeout.current = setTimeout(() => {
          targetBlur.current = 0;
        }, 50);
      }
      
      lastScrollY.current = currentScrollY;
      lastTime.current = now;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (idleTimeout.current) {
        clearTimeout(idleTimeout.current);
      }
    };
  }, [threshold, maxBlur, sensitivity]);

  return (
    <VelocityBlurContext.Provider value={state}>
      {children}
      
      {/* SVG filter definition for directional blur */}
      <svg 
        style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} 
        aria-hidden="true"
      >
        <defs>
          {/* Vertical blur for up/down scrolling */}
          <filter id="velocity-blur-vertical" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur 
              in="SourceGraphic" 
              stdDeviation={`0 ${state.blur}`}
              result="blur"
            />
          </filter>
          
          {/* Subtle scale effect combined with blur */}
          <filter id="velocity-blur-full" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur 
              in="SourceGraphic" 
              stdDeviation={`0 ${state.blur * 0.8}`}
              result="blur"
            />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"
              result="colorized"
            />
          </filter>
        </defs>
      </svg>
    </VelocityBlurContext.Provider>
  );
}

/**
 * Hook to access current velocity blur state
 */
export function useVelocityBlur() {
  return useContext(VelocityBlurContext);
}

/**
 * VelocityBlurContainer - Wrapper that applies blur to children
 */
interface VelocityBlurContainerProps {
  children: ReactNode;
  /** Whether to apply blur (allows conditional disabling) */
  enabled?: boolean;
  /** Additional className */
  className?: string;
  /** Custom blur intensity multiplier */
  intensity?: number;
  /** Whether to add subtle y-offset during blur for motion feel */
  enableOffset?: boolean;
}

export const VelocityBlurContainer = memo(function VelocityBlurContainer({
  children,
  enabled = true,
  className = '',
  intensity = 1,
  enableOffset = true,
}: VelocityBlurContainerProps) {
  const { blur, direction } = useVelocityBlur();
  
  const effectiveBlur = enabled ? blur * intensity : 0;
  const isBlurring = effectiveBlur > 0.1;
  
  // Calculate subtle offset for motion feel
  const offsetY = enableOffset && isBlurring
    ? direction === 'down' ? -effectiveBlur * 0.5 : effectiveBlur * 0.5
    : 0;

  return (
    <div
      className={`velocity-blur-container ${className}`}
      style={{
        filter: isBlurring ? `url(#velocity-blur-vertical)` : 'none',
        transform: isBlurring ? `translateY(${offsetY}px)` : 'none',
        transition: isBlurring ? 'none' : 'transform 0.15s ease-out',
        willChange: isBlurring ? 'filter, transform' : 'auto',
      }}
    >
      {children}
    </div>
  );
});

/**
 * VelocityBlurCard - Individual card with blur effect
 * More performant than container-level blur for many cards
 */
interface VelocityBlurCardProps {
  children: ReactNode;
  className?: string;
  /** Stagger delay for wave-like blur effect */
  staggerIndex?: number;
}

export const VelocityBlurCard = memo(function VelocityBlurCard({
  children,
  className = '',
  staggerIndex = 0,
}: VelocityBlurCardProps) {
  const { blur, direction } = useVelocityBlur();
  
  // Stagger the blur effect slightly per card for wave feel
  const staggeredBlur = Math.max(0, blur - staggerIndex * 0.1);
  const isBlurring = staggeredBlur > 0.05;
  
  // More pronounced offset per card
  const offsetY = isBlurring
    ? direction === 'down' ? -staggeredBlur * 0.8 : staggeredBlur * 0.8
    : 0;

  return (
    <div
      className={`velocity-blur-card ${className}`}
      style={{
        filter: isBlurring ? `blur(0px ${staggeredBlur}px)` : 'none',
        transform: isBlurring ? `translateY(${offsetY}px) scale(${1 - staggeredBlur * 0.01})` : 'none',
        opacity: isBlurring ? 1 - staggeredBlur * 0.05 : 1,
        transition: isBlurring ? 'none' : 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
        willChange: isBlurring ? 'filter, transform, opacity' : 'auto',
      }}
    >
      {children}
    </div>
  );
});

/**
 * VelocityIndicator - Debug/UI component showing current scroll velocity
 */
export function VelocityIndicator({ className = '' }: { className?: string }) {
  const { velocity, blur, direction } = useVelocityBlur();
  
  if (blur < 0.1) return null;
  
  return (
    <div 
      className={`velocity-indicator ${className}`}
      style={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        padding: '8px 12px',
        borderRadius: 8,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)',
        color: 'white',
        fontSize: 12,
        fontFamily: 'monospace',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <span style={{ 
        transform: direction === 'up' ? 'rotate(180deg)' : 'none',
        display: 'inline-block',
      }}>
        ↓
      </span>
      <span>{velocity.toFixed(2)} px/ms</span>
      <span style={{ color: '#f59e0b' }}>blur: {blur.toFixed(1)}px</span>
    </div>
  );
}

export default VelocityBlurProvider;
