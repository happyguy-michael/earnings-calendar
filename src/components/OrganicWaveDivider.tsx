'use client';

import { useEffect, useState, useRef, useMemo, memo } from 'react';

/**
 * OrganicWaveDivider — Animated Flowing Wave Section Separator
 * 
 * 2026 Trend: "Liquid Design" — organic, flowing shapes that feel alive
 * Creates a smooth SVG wave animation for visual separation between sections.
 * 
 * Inspiration:
 * - Stripe's landing page wave transitions
 * - Linear's flowing gradient sections
 * - Apple's fluid interface elements
 * - "Blobitecture" and organic UI shapes trending in 2025-2026
 * - Dribbble fintech dashboards with liquid separators
 * 
 * Features:
 * - Smooth sine-wave animation using CSS transforms
 * - Multiple wave layers for depth (parallax effect)
 * - Gradient fills with optional glow
 * - Color presets matching design system
 * - Configurable wave complexity and speed
 * - Full prefers-reduced-motion support
 * - Light/dark mode adaptive
 * 
 * @example
 * <OrganicWaveDivider preset="aurora" height={80} />
 * <OrganicWaveDivider preset="ocean" layers={3} speed={0.5} />
 */

type WavePreset = 
  | 'aurora'    // Blue-purple-pink gradient
  | 'ocean'     // Teal-blue gradient
  | 'sunset'    // Orange-pink gradient
  | 'forest'    // Green gradient
  | 'flame'     // Red-orange gradient
  | 'midnight'  // Deep purple-blue
  | 'silver'    // Neutral metallic
  | 'success'   // Green success tones
  | 'warning'   // Amber warning tones
  | 'brand';    // Brand blue

interface WaveLayer {
  amplitude: number;  // Wave height multiplier
  frequency: number;  // How many waves fit
  speed: number;      // Animation speed multiplier
  opacity: number;    // Layer opacity
  offset: number;     // Phase offset
}

interface OrganicWaveDividerProps {
  /** Color preset */
  preset?: WavePreset;
  /** Total height in pixels */
  height?: number;
  /** Number of wave layers (1-4) */
  layers?: number;
  /** Animation speed multiplier (0.1-3) */
  speed?: number;
  /** Wave complexity/frequency */
  complexity?: number;
  /** Show glow effect */
  glow?: boolean;
  /** Glow intensity (0-1) */
  glowIntensity?: number;
  /** Flip wave direction (waves go down instead of up) */
  flip?: boolean;
  /** Additional className */
  className?: string;
  /** Enable/disable animation */
  animated?: boolean;
  /** Parallax scroll effect */
  parallax?: boolean;
  /** Z-index for stacking */
  zIndex?: number;
}

// Wave preset color configurations
const WAVE_COLORS: Record<WavePreset, { stops: Array<{ offset: number; color: string }>; glow: string }> = {
  aurora: {
    stops: [
      { offset: 0, color: '#3b82f6' },    // blue-500
      { offset: 0.5, color: '#8b5cf6' },  // violet-500
      { offset: 1, color: '#ec4899' },    // pink-500
    ],
    glow: 'rgba(139, 92, 246, 0.4)',
  },
  ocean: {
    stops: [
      { offset: 0, color: '#14b8a6' },    // teal-500
      { offset: 0.5, color: '#0ea5e9' },  // sky-500
      { offset: 1, color: '#3b82f6' },    // blue-500
    ],
    glow: 'rgba(14, 165, 233, 0.4)',
  },
  sunset: {
    stops: [
      { offset: 0, color: '#f97316' },    // orange-500
      { offset: 0.5, color: '#f43f5e' },  // rose-500
      { offset: 1, color: '#d946ef' },    // fuchsia-500
    ],
    glow: 'rgba(244, 63, 94, 0.4)',
  },
  forest: {
    stops: [
      { offset: 0, color: '#22c55e' },    // green-500
      { offset: 0.5, color: '#10b981' },  // emerald-500
      { offset: 1, color: '#14b8a6' },    // teal-500
    ],
    glow: 'rgba(16, 185, 129, 0.4)',
  },
  flame: {
    stops: [
      { offset: 0, color: '#ef4444' },    // red-500
      { offset: 0.5, color: '#f97316' },  // orange-500
      { offset: 1, color: '#eab308' },    // yellow-500
    ],
    glow: 'rgba(249, 115, 22, 0.4)',
  },
  midnight: {
    stops: [
      { offset: 0, color: '#6366f1' },    // indigo-500
      { offset: 0.5, color: '#8b5cf6' },  // violet-500
      { offset: 1, color: '#312e81' },    // indigo-900
    ],
    glow: 'rgba(99, 102, 241, 0.4)',
  },
  silver: {
    stops: [
      { offset: 0, color: '#6b7280' },    // gray-500
      { offset: 0.5, color: '#9ca3af' },  // gray-400
      { offset: 1, color: '#6b7280' },    // gray-500
    ],
    glow: 'rgba(156, 163, 175, 0.3)',
  },
  success: {
    stops: [
      { offset: 0, color: '#16a34a' },    // green-600
      { offset: 0.5, color: '#22c55e' },  // green-500
      { offset: 1, color: '#4ade80' },    // green-400
    ],
    glow: 'rgba(34, 197, 94, 0.4)',
  },
  warning: {
    stops: [
      { offset: 0, color: '#d97706' },    // amber-600
      { offset: 0.5, color: '#f59e0b' },  // amber-500
      { offset: 1, color: '#fbbf24' },    // amber-400
    ],
    glow: 'rgba(245, 158, 11, 0.4)',
  },
  brand: {
    stops: [
      { offset: 0, color: '#2563eb' },    // blue-600
      { offset: 0.5, color: '#3b82f6' },  // blue-500
      { offset: 1, color: '#60a5fa' },    // blue-400
    ],
    glow: 'rgba(59, 130, 246, 0.4)',
  },
};

// Generate wave layer configurations
function generateLayers(count: number, baseSpeed: number): WaveLayer[] {
  return Array.from({ length: count }, (_, i) => ({
    amplitude: 1 - (i * 0.15),           // Back layers have smaller amplitude
    frequency: 1 + (i * 0.3),            // Back layers have more waves
    speed: baseSpeed * (1 - (i * 0.2)),  // Back layers move slower (parallax)
    opacity: 1 - (i * 0.25),             // Back layers more transparent
    offset: i * 0.33,                    // Phase offset for each layer
  }));
}

// Generate smooth wave SVG path
function generateWavePath(
  width: number,
  height: number,
  amplitude: number,
  frequency: number,
  phase: number,
  flip: boolean
): string {
  const points: string[] = [];
  const segments = 100; // Smooth curve
  const waveHeight = height * 0.4 * amplitude;
  const baseY = flip ? 0 : height;
  
  // Start point
  points.push(`M 0 ${flip ? height : 0}`);
  
  // Generate wave points
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * width;
    const y = baseY + (flip ? 1 : -1) * (
      Math.sin((i / segments) * Math.PI * 2 * frequency + phase * Math.PI * 2) * waveHeight +
      Math.sin((i / segments) * Math.PI * 4 * frequency + phase * Math.PI * 3) * (waveHeight * 0.3)
    );
    points.push(`L ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  
  // Close the path
  points.push(`L ${width} ${flip ? height : 0}`);
  points.push('Z');
  
  return points.join(' ');
}

function OrganicWaveDividerComponent({
  preset = 'aurora',
  height = 60,
  layers = 3,
  speed = 1,
  complexity = 1.5,
  glow = true,
  glowIntensity = 0.5,
  flip = false,
  className = '',
  animated = true,
  parallax = false,
  zIndex = 0,
}: OrganicWaveDividerProps) {
  const [phase, setPhase] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  
  const colors = WAVE_COLORS[preset];
  const waveLayers = useMemo(
    () => generateLayers(Math.min(4, Math.max(1, layers)), speed),
    [layers, speed]
  );
  
  const gradientId = useMemo(
    () => `wave-gradient-${preset}-${Math.random().toString(36).substr(2, 9)}`,
    [preset]
  );
  
  // Check reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  // Animation loop
  useEffect(() => {
    if (prefersReducedMotion || !animated) return;
    
    const animate = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;
      
      setPhase(prev => (prev + delta * 0.15 * speed) % 1);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [prefersReducedMotion, animated, speed]);
  
  // Parallax scroll effect
  useEffect(() => {
    if (!parallax || prefersReducedMotion) return;
    
    const handleScroll = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const elementCenter = rect.top + rect.height / 2;
        const offset = (elementCenter - viewportHeight / 2) / viewportHeight;
        setScrollOffset(offset * 0.1);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [parallax, prefersReducedMotion]);

  // Static fallback for reduced motion
  const staticPhase = 0.25;

  return (
    <div
      ref={containerRef}
      className={`organic-wave-divider ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: `${height}px`,
        overflow: 'hidden',
        zIndex,
        marginTop: flip ? 0 : `-${height * 0.1}px`,
        marginBottom: flip ? `-${height * 0.1}px` : 0,
      }}
      aria-hidden="true"
    >
      <svg
        viewBox={`0 0 1440 ${height}`}
        preserveAspectRatio="none"
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      >
        <defs>
          {/* Main gradient */}
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            {colors.stops.map((stop, i) => (
              <stop
                key={i}
                offset={`${stop.offset * 100}%`}
                stopColor={stop.color}
              />
            ))}
          </linearGradient>
          
          {/* Glow filter */}
          {glow && (
            <filter id={`${gradientId}-glow`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={8 * glowIntensity} result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>
        
        {/* Render wave layers (back to front) */}
        {waveLayers.map((layer, index) => {
          const currentPhase = prefersReducedMotion || !animated
            ? staticPhase + layer.offset
            : phase + layer.offset + scrollOffset;
          
          return (
            <path
              key={index}
              d={generateWavePath(
                1440,
                height,
                layer.amplitude,
                complexity * layer.frequency,
                currentPhase * layer.speed,
                flip
              )}
              fill={`url(#${gradientId})`}
              opacity={layer.opacity * 0.7}
              filter={glow && index === waveLayers.length - 1 ? `url(#${gradientId}-glow)` : undefined}
              style={{
                transition: prefersReducedMotion ? 'none' : undefined,
              }}
            />
          );
        })}
      </svg>
      
      <style jsx>{`
        .organic-wave-divider {
          pointer-events: none;
        }
        
        /* Light mode: reduce opacity slightly */
        :global(.light) .organic-wave-divider svg path {
          opacity: calc(var(--opacity, 1) * 0.8);
        }
        
        /* Smooth dark mode transition */
        .organic-wave-divider svg path {
          transition: opacity 0.3s ease;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .organic-wave-divider svg path {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}

export const OrganicWaveDivider = memo(OrganicWaveDividerComponent);

/**
 * WaveSectionBreak — Convenience wrapper for section breaks
 * Includes spacing and optional content overlay
 */
interface WaveSectionBreakProps extends OrganicWaveDividerProps {
  /** Show gradient fade into content area */
  fadeIntoContent?: boolean;
  /** Fade height in pixels */
  fadeHeight?: number;
}

export function WaveSectionBreak({
  fadeIntoContent = false,
  fadeHeight = 40,
  ...props
}: WaveSectionBreakProps) {
  return (
    <div className="wave-section-break" style={{ position: 'relative' }}>
      <OrganicWaveDivider {...props} />
      {fadeIntoContent && (
        <div
          className="wave-fade"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: `${fadeHeight}px`,
            background: `linear-gradient(to bottom, transparent, var(--background, #09090b))`,
            pointerEvents: 'none',
          }}
        />
      )}
      <style jsx>{`
        .wave-section-break {
          margin: -1px 0; /* Prevent gap lines */
        }
      `}</style>
    </div>
  );
}

export default OrganicWaveDivider;
