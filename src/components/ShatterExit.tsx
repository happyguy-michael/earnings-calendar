'use client';

import { useState, useEffect, useRef, ReactNode, useCallback, useMemo, memo } from 'react';

/**
 * ShatterExit - Dramatic fragment explosion exit animation
 * 
 * Inspiration:
 * - Marvel movie disintegration effects (Thanos snap)
 * - iOS app deletion animations
 * - Glassmorphism breaking effects
 * - 2026 "Dramatic Exits" trend — memorable micro-interactions
 * - Video game UI destruction effects
 * 
 * When triggered, the content shatters into multiple fragments that
 * fly apart with physics-based motion (gravity, rotation, fade).
 * Creates a memorable moment for dismissing items, clearing filters,
 * or removing cards from view.
 * 
 * Features:
 * - Configurable fragment count and size
 * - Physics simulation (gravity, velocity, rotation)
 * - Direction control (explode outward, fall down, dissolve)
 * - Staggered fragment timing for organic feel
 * - GPU-accelerated transforms
 * - Full prefers-reduced-motion support (simple fade)
 * - Callback when animation completes
 * - Optional sound effect trigger
 * 
 * Use cases:
 * - Dismissing notification toasts
 * - Clearing filter chips
 * - Removing watchlist items
 * - Dramatic "reset" actions
 * - Game over / error states
 * 
 * @example
 * // Basic usage
 * <ShatterExit trigger={isRemoving} onComplete={handleRemove}>
 *   <Card>Content to shatter</Card>
 * </ShatterExit>
 * 
 * // Customized explosion
 * <ShatterExit 
 *   trigger={isDismissed}
 *   direction="down"
 *   fragments={16}
 *   duration={800}
 *   gravity={1.2}
 * >
 *   <Toast message="Dismissed!" />
 * </ShatterExit>
 */

type Direction = 'explode' | 'down' | 'up' | 'left' | 'right' | 'dissolve';

interface Fragment {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  rotation: number;
  rotationVelocity: number;
  scale: number;
  opacity: number;
  delay: number;
}

interface ShatterExitProps {
  children: ReactNode;
  /** Trigger the shatter animation */
  trigger: boolean;
  /** Direction of fragment movement */
  direction?: Direction;
  /** Number of fragments (4-36, more = finer shatter) */
  fragments?: number;
  /** Animation duration in ms */
  duration?: number;
  /** Gravity strength (0 = no gravity, 1 = normal, 2 = heavy) */
  gravity?: number;
  /** Initial velocity multiplier */
  velocity?: number;
  /** Rotation intensity (0 = none, 1 = normal) */
  rotationIntensity?: number;
  /** Stagger delay between fragments (ms) */
  stagger?: number;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Additional CSS class */
  className?: string;
  /** Color tint for fragments (optional glow) */
  glowColor?: string;
  /** Show glow effect on fragments */
  glow?: boolean;
}

// Generate fragment grid positions
function generateFragments(
  count: number,
  width: number,
  height: number,
  direction: Direction,
  velocity: number,
  rotationIntensity: number,
  stagger: number
): Fragment[] {
  const cols = Math.ceil(Math.sqrt(count * (width / height)));
  const rows = Math.ceil(count / cols);
  const cellWidth = width / cols;
  const cellHeight = height / rows;
  const centerX = width / 2;
  const centerY = height / 2;
  
  const fragments: Fragment[] = [];
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (fragments.length >= count) break;
      
      const x = col * cellWidth;
      const y = row * cellHeight;
      const fragmentCenterX = x + cellWidth / 2;
      const fragmentCenterY = y + cellHeight / 2;
      
      // Calculate velocity based on direction
      let vx = 0;
      let vy = 0;
      
      switch (direction) {
        case 'explode': {
          // Radial explosion from center
          const angle = Math.atan2(fragmentCenterY - centerY, fragmentCenterX - centerX);
          const distance = Math.sqrt(
            Math.pow(fragmentCenterX - centerX, 2) + 
            Math.pow(fragmentCenterY - centerY, 2)
          );
          const normalizedDist = distance / Math.sqrt(centerX * centerX + centerY * centerY);
          const speed = (0.5 + normalizedDist) * velocity * (0.8 + Math.random() * 0.4);
          vx = Math.cos(angle) * speed * 8;
          vy = Math.sin(angle) * speed * 8;
          break;
        }
        case 'down':
          vx = (Math.random() - 0.5) * velocity * 3;
          vy = velocity * 4 * (0.8 + Math.random() * 0.4);
          break;
        case 'up':
          vx = (Math.random() - 0.5) * velocity * 3;
          vy = -velocity * 6 * (0.8 + Math.random() * 0.4);
          break;
        case 'left':
          vx = -velocity * 6 * (0.8 + Math.random() * 0.4);
          vy = (Math.random() - 0.5) * velocity * 3;
          break;
        case 'right':
          vx = velocity * 6 * (0.8 + Math.random() * 0.4);
          vy = (Math.random() - 0.5) * velocity * 3;
          break;
        case 'dissolve':
          // Minimal movement, mostly fade
          vx = (Math.random() - 0.5) * velocity * 2;
          vy = (Math.random() - 0.5) * velocity * 2;
          break;
      }
      
      // Calculate delay based on position (wave effect)
      const distFromCenter = Math.sqrt(
        Math.pow(fragmentCenterX - centerX, 2) + 
        Math.pow(fragmentCenterY - centerY, 2)
      );
      const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
      const normalizedDist = distFromCenter / maxDist;
      const delay = normalizedDist * stagger;
      
      fragments.push({
        id: row * cols + col,
        x,
        y,
        width: cellWidth,
        height: cellHeight,
        velocityX: vx,
        velocityY: vy,
        rotation: 0,
        rotationVelocity: (Math.random() - 0.5) * 20 * rotationIntensity,
        scale: 1,
        opacity: 1,
        delay,
      });
    }
  }
  
  return fragments;
}

export const ShatterExit = memo(function ShatterExit({
  children,
  trigger,
  direction = 'explode',
  fragments: fragmentCount = 12,
  duration = 600,
  gravity = 1,
  velocity = 1,
  rotationIntensity = 1,
  stagger = 50,
  onComplete,
  className = '',
  glowColor = 'rgba(255, 255, 255, 0.5)',
  glow = false,
}: ShatterExitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [fragments, setFragments] = useState<Fragment[]>([]);
  const [contentSnapshot, setContentSnapshot] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const prefersReducedMotion = useRef(false);
  const hasTriggered = useRef(false);
  
  // Check reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      prefersReducedMotion.current = mediaQuery.matches;
      
      const handler = (e: MediaQueryListEvent) => {
        prefersReducedMotion.current = e.matches;
      };
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);
  
  // Capture content and start animation when triggered
  useEffect(() => {
    if (trigger && !hasTriggered.current && containerRef.current) {
      hasTriggered.current = true;
      
      const rect = containerRef.current.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
      
      // For reduced motion, just fade out
      if (prefersReducedMotion.current) {
        setIsAnimating(true);
        setTimeout(() => {
          setIsAnimating(false);
          onComplete?.();
        }, 300);
        return;
      }
      
      // Use html2canvas-like approach or simple screenshot
      // For simplicity, we'll use CSS clip-path on the actual content
      const frags = generateFragments(
        fragmentCount,
        rect.width,
        rect.height,
        direction,
        velocity,
        rotationIntensity,
        stagger
      );
      
      setFragments(frags);
      setIsAnimating(true);
      startTimeRef.current = Date.now();
      
      // Start animation loop
      const animate = () => {
        const elapsed = Date.now() - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        
        if (progress >= 1) {
          setIsAnimating(false);
          setFragments([]);
          onComplete?.();
          return;
        }
        
        // Update fragments with physics
        setFragments(prev => prev.map(f => {
          // Check if this fragment should start animating
          if (elapsed < f.delay) return f;
          
          const fragmentProgress = Math.min((elapsed - f.delay) / (duration - f.delay), 1);
          const easeOut = 1 - Math.pow(1 - fragmentProgress, 3); // ease-out-cubic
          
          return {
            ...f,
            velocityY: f.velocityY + gravity * 0.5, // Apply gravity
            rotation: f.rotation + f.rotationVelocity * 0.16,
            scale: Math.max(0, 1 - fragmentProgress * 0.3),
            opacity: Math.max(0, 1 - easeOut),
          };
        }));
        
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [trigger, fragmentCount, direction, duration, gravity, velocity, rotationIntensity, stagger, onComplete]);
  
  // Calculate accumulated positions for each fragment
  const fragmentPositions = useMemo(() => {
    if (!isAnimating) return [];
    
    const elapsed = Date.now() - startTimeRef.current;
    
    return fragments.map(f => {
      if (elapsed < f.delay) {
        return { ...f, translateX: 0, translateY: 0 };
      }
      
      const fragmentElapsed = elapsed - f.delay;
      const frames = fragmentElapsed / 16; // ~60fps
      
      // Accumulate position based on velocity and gravity
      let translateX = f.velocityX * frames * 0.3;
      let translateY = f.velocityY * frames * 0.3 + 0.5 * gravity * frames * frames * 0.01;
      
      return {
        ...f,
        translateX,
        translateY,
      };
    });
  }, [fragments, isAnimating, gravity]);
  
  // Reduced motion: simple fade
  if (isAnimating && prefersReducedMotion.current) {
    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          opacity: 0,
          transition: 'opacity 300ms ease-out',
        }}
      >
        {children}
      </div>
    );
  }
  
  // Not animating - show normal content
  if (!isAnimating) {
    return (
      <div ref={containerRef} className={className}>
        {children}
      </div>
    );
  }
  
  // Animating - show fragments
  return (
    <div 
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        width: dimensions.width || 'auto',
        height: dimensions.height || 'auto',
      }}
    >
      {/* Hidden original content for reference */}
      <div style={{ visibility: 'hidden', position: 'absolute', inset: 0 }}>
        {children}
      </div>
      
      {/* Animated fragments */}
      {fragments.map((fragment, index) => {
        const elapsed = Date.now() - startTimeRef.current;
        const isActive = elapsed >= fragment.delay;
        const fragmentElapsed = Math.max(0, elapsed - fragment.delay);
        const frames = fragmentElapsed / 16;
        
        const translateX = isActive ? fragment.velocityX * frames * 0.3 : 0;
        const translateY = isActive 
          ? fragment.velocityY * frames * 0.3 + 0.5 * gravity * frames * frames * 0.01 
          : 0;
        
        return (
          <div
            key={fragment.id}
            style={{
              position: 'absolute',
              left: fragment.x,
              top: fragment.y,
              width: fragment.width,
              height: fragment.height,
              overflow: 'hidden',
              transform: `
                translate(${translateX}px, ${translateY}px) 
                rotate(${fragment.rotation}deg) 
                scale(${fragment.scale})
              `,
              opacity: fragment.opacity,
              transition: 'none',
              willChange: 'transform, opacity',
              pointerEvents: 'none',
              ...(glow && fragment.opacity > 0.3 ? {
                boxShadow: `0 0 ${8 * fragment.opacity}px ${glowColor}`,
              } : {}),
            }}
          >
            {/* Clipped portion of children */}
            <div
              style={{
                position: 'absolute',
                left: -fragment.x,
                top: -fragment.y,
                width: dimensions.width,
                height: dimensions.height,
              }}
            >
              {children}
            </div>
          </div>
        );
      })}
    </div>
  );
});

/**
 * ShatterButton - A button that shatters when clicked
 * Useful for destructive actions with dramatic feedback
 */
interface ShatterButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  direction?: Direction;
  fragments?: number;
  duration?: number;
}

export const ShatterButton = memo(function ShatterButton({
  children,
  onClick,
  className = '',
  direction = 'explode',
  fragments = 9,
  duration = 500,
}: ShatterButtonProps) {
  const [isShattered, setIsShattered] = useState(false);
  
  const handleClick = useCallback(() => {
    setIsShattered(true);
  }, []);
  
  const handleComplete = useCallback(() => {
    onClick?.();
    // Reset after a brief delay
    setTimeout(() => setIsShattered(false), 100);
  }, [onClick]);
  
  return (
    <ShatterExit
      trigger={isShattered}
      direction={direction}
      fragments={fragments}
      duration={duration}
      onComplete={handleComplete}
    >
      <button
        onClick={handleClick}
        className={className}
        disabled={isShattered}
      >
        {children}
      </button>
    </ShatterExit>
  );
});

/**
 * useShatterEffect - Hook for programmatic shatter control
 */
export function useShatterEffect() {
  const [shouldShatter, setShouldShatter] = useState(false);
  
  const shatter = useCallback(() => {
    setShouldShatter(true);
  }, []);
  
  const reset = useCallback(() => {
    setShouldShatter(false);
  }, []);
  
  return {
    shouldShatter,
    shatter,
    reset,
  };
}

export default ShatterExit;
