'use client';

import { useEffect, useState, useRef, ReactNode, useMemo } from 'react';

/**
 * GlassReflection - Liquid Glass Light Beam Effect
 * 
 * Inspired by:
 * - Apple's Liquid Glass (iOS 26) - translucent surfaces with moving light
 * - Apple Card metal shimmer effect
 * - Premium fintech dashboard cards (Revolut, Linear)
 * 
 * Creates a subtle, animated light beam that sweeps across glass surfaces,
 * simulating light refraction through translucent material.
 * 
 * Features:
 * - Smooth diagonal light sweep with configurable direction
 * - Multiple beam modes: single, double, rainbow
 * - Hover-triggered or auto-cycling animation
 * - Mouse-following variant for interactive surfaces
 * - Respects prefers-reduced-motion
 * - GPU-accelerated with CSS transforms
 * 
 * Usage:
 * <GlassReflection mode="auto" interval={8000}>
 *   <StatCard>...</StatCard>
 * </GlassReflection>
 */

interface GlassReflectionProps {
  children: ReactNode;
  /** Animation trigger mode */
  mode?: 'hover' | 'auto' | 'mouse' | 'always';
  /** Width of the light beam (px) */
  beamWidth?: number;
  /** Angle of the beam sweep (degrees, 0 = horizontal left-to-right) */
  angle?: number;
  /** Animation duration (ms) */
  duration?: number;
  /** Interval between auto sweeps (ms) - only for mode="auto" */
  interval?: number;
  /** Delay before first sweep (ms) */
  delay?: number;
  /** Beam color preset or custom gradient */
  color?: 'white' | 'rainbow' | 'blue' | 'gold' | string;
  /** Opacity of the beam (0-1) */
  intensity?: number;
  /** Number of beams (1-3) */
  beamCount?: 1 | 2 | 3;
  /** Stagger delay between multiple beams (ms) */
  beamStagger?: number;
  /** Blur/softness of the beam edge (px) */
  blur?: number;
  /** Border radius to match parent (px or CSS value) */
  borderRadius?: number | string;
  /** Additional class for the container */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

// Predefined color gradients
const BEAM_COLORS = {
  white: 'rgba(255, 255, 255, 0.7)',
  rainbow: `linear-gradient(90deg, 
    rgba(255, 0, 0, 0.3), 
    rgba(255, 127, 0, 0.3), 
    rgba(255, 255, 0, 0.3), 
    rgba(0, 255, 0, 0.3), 
    rgba(0, 127, 255, 0.3), 
    rgba(139, 0, 255, 0.3)
  )`,
  blue: 'rgba(59, 130, 246, 0.6)',
  gold: 'linear-gradient(90deg, rgba(251, 191, 36, 0.4), rgba(245, 158, 11, 0.5), rgba(251, 191, 36, 0.4))',
};

export function GlassReflection({
  children,
  mode = 'hover',
  beamWidth = 120,
  angle = -15,
  duration = 800,
  interval = 5000,
  delay = 0,
  color = 'white',
  intensity = 0.5,
  beamCount = 1,
  beamStagger = 100,
  blur = 60,
  borderRadius = 16,
  className = '',
  disabled = false,
}: GlassReflectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Trigger a single sweep animation
  const triggerSweep = () => {
    if (disabled || prefersReducedMotion) return;
    
    setIsAnimating(true);
    
    // Clear any existing timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    
    // Reset after animation completes
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, duration + (beamCount - 1) * beamStagger + 50);
  };

  // Auto mode: periodic sweeps
  useEffect(() => {
    if (mode !== 'auto' || disabled || prefersReducedMotion) return;
    
    // Initial delay
    const initialTimeout = setTimeout(() => {
      triggerSweep();
      
      // Set up interval for subsequent sweeps
      intervalRef.current = setInterval(triggerSweep, interval);
    }, delay);
    
    return () => {
      clearTimeout(initialTimeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    };
  }, [mode, interval, delay, disabled, prefersReducedMotion]);

  // Always mode: continuous animation
  useEffect(() => {
    if (mode !== 'always' || disabled || prefersReducedMotion) return;
    setIsAnimating(true);
    return () => setIsAnimating(false);
  }, [mode, disabled, prefersReducedMotion]);

  // Mouse tracking for mode="mouse"
  const handleMouseMove = (e: React.MouseEvent) => {
    if (mode !== 'mouse' || disabled || prefersReducedMotion) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    if (mode === 'mouse') {
      setMousePosition(null);
    }
    if (mode === 'hover') {
      setIsAnimating(false);
    }
  };

  const handleMouseEnter = () => {
    if (mode === 'hover') {
      // Small delay before triggering to avoid accidental hovers
      setTimeout(triggerSweep, 50);
    }
  };

  // Resolve beam color
  const beamGradient = useMemo(() => {
    const baseColor = BEAM_COLORS[color as keyof typeof BEAM_COLORS] || color;
    
    // For simple colors, create a gradient with soft edges
    if (!baseColor.includes('gradient')) {
      return `linear-gradient(90deg, 
        transparent, 
        transparent 20%, 
        ${baseColor} 40%, 
        ${baseColor} 60%, 
        transparent 80%, 
        transparent
      )`;
    }
    return baseColor;
  }, [color]);

  // Generate beam elements
  const beams = useMemo(() => {
    return Array.from({ length: beamCount }, (_, i) => ({
      id: i,
      delay: i * beamStagger,
    }));
  }, [beamCount, beamStagger]);

  // Don't render effect overlay if disabled or reduced motion
  if (disabled || prefersReducedMotion) {
    return <div className={`glass-reflection-container ${className}`}>{children}</div>;
  }

  const radiusValue = typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius;

  return (
    <div
      ref={containerRef}
      className={`glass-reflection-container ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: radiusValue,
      }}
    >
      {children}
      
      {/* Light beam overlay layer */}
      <div
        className="glass-reflection-overlay"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          borderRadius: radiusValue,
          zIndex: 10,
        }}
        aria-hidden="true"
      >
        {/* Sweep beams */}
        {beams.map(beam => (
          <div
            key={beam.id}
            className={`glass-reflection-beam ${isAnimating ? 'sweeping' : ''} ${mode === 'always' ? 'continuous' : ''}`}
            style={{
              '--beam-width': `${beamWidth}px`,
              '--beam-angle': `${angle}deg`,
              '--beam-duration': `${duration}ms`,
              '--beam-delay': `${beam.delay}ms`,
              '--beam-gradient': beamGradient,
              '--beam-intensity': intensity,
              '--beam-blur': `${blur}px`,
            } as React.CSSProperties}
          />
        ))}
        
        {/* Mouse-following spotlight for mode="mouse" */}
        {mode === 'mouse' && mousePosition && (
          <div
            className="glass-reflection-spotlight"
            style={{
              '--spot-x': `${mousePosition.x}%`,
              '--spot-y': `${mousePosition.y}%`,
              '--spot-intensity': intensity * 0.8,
              '--spot-size': `${beamWidth * 1.5}px`,
            } as React.CSSProperties}
          />
        )}
      </div>

      <style jsx>{`
        .glass-reflection-beam {
          position: absolute;
          top: -50%;
          left: -150%;
          width: var(--beam-width);
          height: 200%;
          background: var(--beam-gradient);
          opacity: 0;
          transform: rotate(var(--beam-angle)) translateX(0);
          filter: blur(var(--beam-blur));
          mix-blend-mode: overlay;
          will-change: transform, opacity;
        }
        
        .glass-reflection-beam.sweeping {
          animation: beam-sweep var(--beam-duration) cubic-bezier(0.4, 0, 0.2, 1) var(--beam-delay) forwards;
        }
        
        .glass-reflection-beam.continuous {
          animation: beam-sweep-loop calc(var(--beam-duration) * 3) cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        
        @keyframes beam-sweep {
          0% {
            left: -150%;
            opacity: 0;
          }
          10% {
            opacity: var(--beam-intensity);
          }
          90% {
            opacity: var(--beam-intensity);
          }
          100% {
            left: 150%;
            opacity: 0;
          }
        }
        
        @keyframes beam-sweep-loop {
          0% {
            left: -150%;
            opacity: 0;
          }
          5% {
            opacity: var(--beam-intensity);
          }
          30% {
            opacity: var(--beam-intensity);
          }
          35% {
            left: 150%;
            opacity: 0;
          }
          100% {
            left: 150%;
            opacity: 0;
          }
        }
        
        .glass-reflection-spotlight {
          position: absolute;
          width: var(--spot-size);
          height: var(--spot-size);
          left: var(--spot-x);
          top: var(--spot-y);
          transform: translate(-50%, -50%);
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, var(--spot-intensity)) 0%,
            transparent 70%
          );
          pointer-events: none;
          mix-blend-mode: overlay;
          transition: left 0.1s ease-out, top 0.1s ease-out;
        }
        
        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .glass-reflection-beam,
          .glass-reflection-spotlight {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Preset: Premium Card Reflection
 * Perfect for stat cards and glass panels
 */
export function PremiumCardReflection({ 
  children, 
  className = '' 
}: { 
  children: ReactNode; 
  className?: string;
}) {
  return (
    <GlassReflection
      mode="auto"
      interval={8000}
      delay={Math.random() * 3000} // Stagger multiple cards
      duration={1000}
      beamWidth={100}
      angle={-20}
      color="white"
      intensity={0.35}
      blur={50}
      borderRadius={20}
      className={className}
    >
      {children}
    </GlassReflection>
  );
}

/**
 * Preset: Interactive Glass Surface
 * Light follows cursor for interactive elements
 */
export function InteractiveGlass({ 
  children, 
  className = '' 
}: { 
  children: ReactNode; 
  className?: string;
}) {
  return (
    <GlassReflection
      mode="mouse"
      beamWidth={200}
      color="white"
      intensity={0.25}
      blur={80}
      borderRadius={16}
      className={className}
    >
      {children}
    </GlassReflection>
  );
}

/**
 * Preset: Monster Beat Celebration Shimmer
 * Rainbow sweep for exceptional results
 */
export function CelebrationShimmer({ 
  children, 
  className = '',
  trigger = true,
}: { 
  children: ReactNode; 
  className?: string;
  trigger?: boolean;
}) {
  return (
    <GlassReflection
      mode={trigger ? 'always' : 'hover'}
      duration={1500}
      beamWidth={150}
      angle={-15}
      color="rainbow"
      intensity={0.5}
      beamCount={2}
      beamStagger={200}
      blur={40}
      borderRadius={14}
      className={className}
    >
      {children}
    </GlassReflection>
  );
}

export default GlassReflection;
