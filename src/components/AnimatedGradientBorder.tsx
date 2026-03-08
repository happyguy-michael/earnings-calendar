'use client';

import { ReactNode, useState, useMemo } from 'react';

interface AnimatedGradientBorderProps {
  children: ReactNode;
  /** Enable the animated border effect */
  active?: boolean;
  /** Only animate on hover (default: true) */
  hoverOnly?: boolean;
  /** Border width in pixels */
  borderWidth?: number;
  /** Border radius in pixels */
  borderRadius?: number;
  /** Animation duration in seconds */
  duration?: number;
  /** Gradient color preset */
  colorPreset?: 'rainbow' | 'fire' | 'ocean' | 'aurora' | 'beat' | 'miss' | 'premium';
  /** Custom colors (overrides preset) - array of oklch or hex colors */
  colors?: string[];
  /** Glow intensity (0 = none, 1 = strong) */
  glowIntensity?: number;
  /** Additional class names */
  className?: string;
  /** Background color for the inner content */
  backgroundColor?: string;
}

/**
 * AnimatedGradientBorder - Premium animated conic-gradient border
 * 
 * Uses CSS @property for smooth angle interpolation, creating a 
 * spinning rainbow border effect on hover.
 * 
 * Features:
 * - Smooth CSS-only animation (no JS animation loop)
 * - Multiple color presets (rainbow, fire, ocean, aurora, beat, miss)
 * - Configurable glow intensity
 * - Respects prefers-reduced-motion
 * - Only animates on hover by default (not distracting)
 * 
 * Based on: https://codetv.dev/blog/animated-css-gradient-border
 */
export function AnimatedGradientBorder({
  children,
  active = true,
  hoverOnly = true,
  borderWidth = 2,
  borderRadius = 16,
  duration = 3,
  colorPreset = 'rainbow',
  colors,
  glowIntensity = 0.3,
  className = '',
  backgroundColor = 'rgba(20, 20, 30, 0.98)',
}: AnimatedGradientBorderProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Color presets using OKLCH for better gradients
  const colorPresets: Record<string, string[]> = {
    rainbow: ['oklch(0.75 0.32 0)', 'oklch(0.75 0.32 120)', 'oklch(0.75 0.32 240)', 'oklch(0.75 0.32 360)'],
    fire: ['oklch(0.65 0.3 25)', 'oklch(0.75 0.35 55)', 'oklch(0.7 0.32 40)', 'oklch(0.65 0.3 25)'],
    ocean: ['oklch(0.65 0.22 220)', 'oklch(0.72 0.25 200)', 'oklch(0.62 0.22 240)', 'oklch(0.65 0.22 220)'],
    aurora: ['oklch(0.65 0.25 280)', 'oklch(0.72 0.3 160)', 'oklch(0.68 0.28 200)', 'oklch(0.65 0.25 280)'],
    beat: ['oklch(0.68 0.22 145)', 'oklch(0.73 0.26 155)', 'oklch(0.65 0.2 135)', 'oklch(0.68 0.22 145)'],
    miss: ['oklch(0.62 0.24 25)', 'oklch(0.68 0.28 15)', 'oklch(0.58 0.22 35)', 'oklch(0.62 0.24 25)'],
    premium: ['oklch(0.7 0.18 280)', 'oklch(0.75 0.22 320)', 'oklch(0.72 0.2 260)', 'oklch(0.7 0.18 280)'],
  };
  
  const gradientColors = colors || colorPresets[colorPreset] || colorPresets.rainbow;
  
  // Build conic gradient stops
  const gradientStops = useMemo(() => {
    return gradientColors.map((color, i) => {
      const angle = (i / (gradientColors.length - 1)) * 360;
      return `${color} ${angle}deg`;
    }).join(', ');
  }, [gradientColors]);
  
  // Determine if animation should play
  const shouldAnimate = active && (!hoverOnly || isHovered);
  
  // Calculate glow size based on intensity
  const glowSize = Math.round(20 * glowIntensity);
  
  return (
    <div
      className={`agb-wrapper ${shouldAnimate ? 'agb-animating' : ''} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        '--agb-border-width': `${borderWidth}px`,
        '--agb-border-radius': `${borderRadius}px`,
        '--agb-duration': `${duration}s`,
        '--agb-gradient-stops': gradientStops,
        '--agb-glow-size': `${glowSize}px`,
        '--agb-bg-color': backgroundColor,
      } as React.CSSProperties}
    >
      <div className="agb-content">
        {children}
      </div>
    </div>
  );
}

/**
 * Compact variant for badges and small elements
 */
export function AnimatedGradientBadge({
  children,
  colorPreset = 'premium',
  className = '',
  active = true,
}: {
  children: ReactNode;
  colorPreset?: 'rainbow' | 'fire' | 'ocean' | 'aurora' | 'beat' | 'miss' | 'premium';
  className?: string;
  active?: boolean;
}) {
  return (
    <AnimatedGradientBorder
      active={active}
      borderWidth={1.5}
      borderRadius={8}
      duration={2}
      colorPreset={colorPreset}
      glowIntensity={0.15}
      backgroundColor="rgba(25, 25, 35, 0.95)"
      className={className}
    >
      {children}
    </AnimatedGradientBorder>
  );
}

export default AnimatedGradientBorder;
