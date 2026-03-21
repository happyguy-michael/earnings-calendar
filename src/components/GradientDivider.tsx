'use client';

import { memo, CSSProperties } from 'react';

/**
 * GradientDivider - Animated gradient line for visual section separation
 * 
 * 2026 Design Trends:
 * - "Liquid Design" — fluid, organic interfaces that feel alive
 * - "Glassmorphism + depth" — subtle visual layers and separators
 * - "Motion as ambient life" — continuous subtle animations
 * 
 * Features:
 * - Horizontally shifting gradient animation
 * - Configurable colors and blend
 * - Soft glow effect for depth
 * - Multiple animation speeds
 * - Respects prefers-reduced-motion
 * - Light/dark mode aware
 * 
 * @example
 * // Between sections
 * <GradientDivider />
 * 
 * // Faster, with glow
 * <GradientDivider speed="fast" glow />
 * 
 * // Custom colors
 * <GradientDivider preset="aurora" />
 */

export type GradientPreset = 
  | 'default'    // Blue-purple-blue
  | 'aurora'     // Green-blue-purple-pink
  | 'sunset'     // Orange-pink-purple
  | 'ocean'      // Teal-blue-cyan
  | 'fire'       // Red-orange-yellow
  | 'success'    // Green tones
  | 'warning'    // Amber tones
  | 'danger';    // Red tones

export type AnimationSpeed = 'slow' | 'normal' | 'fast' | 'none';

interface GradientDividerProps {
  /** Color preset (default: 'default') */
  preset?: GradientPreset;
  /** Animation speed (default: 'normal') */
  speed?: AnimationSpeed;
  /** Enable soft glow effect (default: false) */
  glow?: boolean;
  /** Glow intensity 0-1 (default: 0.5) */
  glowIntensity?: number;
  /** Line height in pixels (default: 2) */
  height?: number;
  /** Margin above in pixels (default: 0) */
  marginTop?: number;
  /** Margin below in pixels (default: 0) */
  marginBottom?: number;
  /** Custom class name */
  className?: string;
  /** Fade edges to transparent (default: true) */
  fadeEdges?: boolean;
}

const PRESETS: Record<GradientPreset, string[]> = {
  default: ['#3b82f6', '#8b5cf6', '#6366f1', '#3b82f6'],
  aurora: ['#22c55e', '#06b6d4', '#8b5cf6', '#ec4899', '#22c55e'],
  sunset: ['#f97316', '#ec4899', '#8b5cf6', '#f97316'],
  ocean: ['#14b8a6', '#0ea5e9', '#06b6d4', '#14b8a6'],
  fire: ['#ef4444', '#f97316', '#fbbf24', '#f97316', '#ef4444'],
  success: ['#22c55e', '#10b981', '#059669', '#10b981', '#22c55e'],
  warning: ['#f59e0b', '#fbbf24', '#f97316', '#fbbf24', '#f59e0b'],
  danger: ['#ef4444', '#dc2626', '#f87171', '#dc2626', '#ef4444'],
};

const SPEEDS: Record<AnimationSpeed, number> = {
  slow: 8000,
  normal: 4000,
  fast: 2000,
  none: 0,
};

export const GradientDivider = memo(function GradientDivider({
  preset = 'default',
  speed = 'normal',
  glow = false,
  glowIntensity = 0.5,
  height = 2,
  marginTop = 0,
  marginBottom = 0,
  className = '',
  fadeEdges = true,
}: GradientDividerProps) {
  const colors = PRESETS[preset];
  const duration = SPEEDS[speed];
  const isAnimated = duration > 0;
  
  // Build gradient string
  const gradientStops = colors.map((color, i) => {
    const percent = (i / (colors.length - 1)) * 100;
    return `${color} ${percent}%`;
  }).join(', ');
  
  // Double the gradient for seamless looping
  const loopingGradient = `linear-gradient(90deg, ${gradientStops}, ${gradientStops})`;
  
  // Edge fade mask
  const edgeMask = fadeEdges 
    ? 'linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)'
    : 'none';
  
  const style: CSSProperties = {
    '--gradient-divider-height': `${height}px`,
    '--gradient-divider-duration': `${duration}ms`,
    '--gradient-divider-gradient': loopingGradient,
    '--gradient-divider-glow-intensity': glowIntensity,
    '--gradient-divider-mask': edgeMask,
    marginTop: marginTop > 0 ? `${marginTop}px` : undefined,
    marginBottom: marginBottom > 0 ? `${marginBottom}px` : undefined,
  } as CSSProperties;

  return (
    <>
      <div 
        className={`gradient-divider ${isAnimated ? 'animated' : ''} ${glow ? 'with-glow' : ''} ${className}`}
        style={style}
        role="separator"
        aria-hidden="true"
      >
        <div className="gradient-divider-track" />
        {glow && <div className="gradient-divider-glow" />}
      </div>
      
      <style jsx>{`
        .gradient-divider {
          position: relative;
          width: 100%;
          height: var(--gradient-divider-height);
          overflow: hidden;
        }
        
        .gradient-divider-track {
          position: absolute;
          inset: 0;
          background: var(--gradient-divider-gradient);
          background-size: 200% 100%;
          mask-image: var(--gradient-divider-mask);
          -webkit-mask-image: var(--gradient-divider-mask);
        }
        
        .gradient-divider.animated .gradient-divider-track {
          animation: gradientDividerShift var(--gradient-divider-duration) linear infinite;
        }
        
        .gradient-divider-glow {
          position: absolute;
          inset: -4px 0;
          background: var(--gradient-divider-gradient);
          background-size: 200% 100%;
          filter: blur(8px);
          opacity: var(--gradient-divider-glow-intensity);
          mask-image: var(--gradient-divider-mask);
          -webkit-mask-image: var(--gradient-divider-mask);
        }
        
        .gradient-divider.animated .gradient-divider-glow {
          animation: gradientDividerShift var(--gradient-divider-duration) linear infinite;
        }
        
        @keyframes gradientDividerShift {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: -100% 50%;
          }
        }
        
        /* Light mode adjustments */
        :global(html.light) .gradient-divider-track {
          opacity: 0.8;
        }
        
        :global(html.light) .gradient-divider-glow {
          opacity: calc(var(--gradient-divider-glow-intensity) * 0.7);
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .gradient-divider.animated .gradient-divider-track,
          .gradient-divider.animated .gradient-divider-glow {
            animation: none;
          }
        }
      `}</style>
    </>
  );
});

/**
 * VerticalGradientDivider - Vertical variant for side-by-side sections
 */
interface VerticalGradientDividerProps extends Omit<GradientDividerProps, 'marginTop' | 'marginBottom'> {
  /** Width in pixels (default: 2) */
  width?: number;
  /** Margin left in pixels (default: 0) */
  marginLeft?: number;
  /** Margin right in pixels (default: 0) */
  marginRight?: number;
}

export const VerticalGradientDivider = memo(function VerticalGradientDivider({
  preset = 'default',
  speed = 'normal',
  glow = false,
  glowIntensity = 0.5,
  width = 2,
  height,
  marginLeft = 0,
  marginRight = 0,
  className = '',
  fadeEdges = true,
}: VerticalGradientDividerProps & { height?: number }) {
  const colors = PRESETS[preset];
  const duration = SPEEDS[speed];
  const isAnimated = duration > 0;
  
  const gradientStops = colors.map((color, i) => {
    const percent = (i / (colors.length - 1)) * 100;
    return `${color} ${percent}%`;
  }).join(', ');
  
  const loopingGradient = `linear-gradient(180deg, ${gradientStops}, ${gradientStops})`;
  
  const edgeMask = fadeEdges 
    ? 'linear-gradient(180deg, transparent 0%, black 10%, black 90%, transparent 100%)'
    : 'none';
  
  const style: CSSProperties = {
    '--vgd-width': `${width}px`,
    '--vgd-height': height ? `${height}px` : '100%',
    '--vgd-duration': `${duration}ms`,
    '--vgd-gradient': loopingGradient,
    '--vgd-glow-intensity': glowIntensity,
    '--vgd-mask': edgeMask,
    marginLeft: marginLeft > 0 ? `${marginLeft}px` : undefined,
    marginRight: marginRight > 0 ? `${marginRight}px` : undefined,
  } as CSSProperties;

  return (
    <>
      <div 
        className={`vertical-gradient-divider ${isAnimated ? 'animated' : ''} ${glow ? 'with-glow' : ''} ${className}`}
        style={style}
        role="separator"
        aria-hidden="true"
      >
        <div className="vgd-track" />
        {glow && <div className="vgd-glow" />}
      </div>
      
      <style jsx>{`
        .vertical-gradient-divider {
          position: relative;
          width: var(--vgd-width);
          height: var(--vgd-height);
          overflow: hidden;
          flex-shrink: 0;
        }
        
        .vgd-track {
          position: absolute;
          inset: 0;
          background: var(--vgd-gradient);
          background-size: 100% 200%;
          mask-image: var(--vgd-mask);
          -webkit-mask-image: var(--vgd-mask);
        }
        
        .vertical-gradient-divider.animated .vgd-track {
          animation: vgdShift var(--vgd-duration) linear infinite;
        }
        
        .vgd-glow {
          position: absolute;
          inset: 0 -4px;
          background: var(--vgd-gradient);
          background-size: 100% 200%;
          filter: blur(8px);
          opacity: var(--vgd-glow-intensity);
          mask-image: var(--vgd-mask);
          -webkit-mask-image: var(--vgd-mask);
        }
        
        .vertical-gradient-divider.animated .vgd-glow {
          animation: vgdShift var(--vgd-duration) linear infinite;
        }
        
        @keyframes vgdShift {
          0% { background-position: 50% 0%; }
          100% { background-position: 50% -100%; }
        }
        
        :global(html.light) .vgd-track {
          opacity: 0.8;
        }
        
        :global(html.light) .vgd-glow {
          opacity: calc(var(--vgd-glow-intensity) * 0.7);
        }
        
        @media (prefers-reduced-motion: reduce) {
          .vertical-gradient-divider.animated .vgd-track,
          .vertical-gradient-divider.animated .vgd-glow {
            animation: none;
          }
        }
      `}</style>
    </>
  );
});

/**
 * SectionDivider - Pre-configured divider with standard spacing
 */
export const SectionDivider = memo(function SectionDivider({
  preset = 'default',
  glow = true,
  className = '',
}: {
  preset?: GradientPreset;
  glow?: boolean;
  className?: string;
}) {
  return (
    <GradientDivider
      preset={preset}
      speed="slow"
      glow={glow}
      glowIntensity={0.3}
      height={1}
      marginTop={24}
      marginBottom={24}
      className={className}
    />
  );
});

export default GradientDivider;
