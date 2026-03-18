'use client';

import { useEffect, useState, useRef, ReactNode, CSSProperties } from 'react';

/**
 * AuroraWash - Subtle Northern Lights Background Animation
 * 
 * Inspiration:
 * - Aceternity UI's Aurora Background component (Feb 2026)
 * - Apple's visionOS ambient lighting effects
 * - 2026 "Living Interfaces" trend — backgrounds that breathe
 * - Northern lights / aurora borealis light patterns
 * - Premium SaaS dashboards with animated gradient accents
 * 
 * Creates a subtle, flowing aurora effect using layered gradient animations.
 * Multiple gradient blobs slowly drift across the background, creating
 * an organic, breathing effect that feels alive without being distracting.
 * 
 * Features:
 * - Multiple layered gradients with independent animation timing
 * - Configurable color schemes (aurora, sunset, ocean, custom)
 * - Intensity control for subtlety
 * - GPU-accelerated CSS animations (background-position)
 * - Full prefers-reduced-motion support (static gradient fallback)
 * - Light/dark theme aware
 * - Can wrap content or be used as absolute positioned background
 * 
 * Usage:
 * <AuroraWash variant="aurora">
 *   <CardContent />
 * </AuroraWash>
 * 
 * // Or as background layer
 * <div className="relative">
 *   <AuroraWash asBackground variant="ocean" intensity="subtle" />
 *   <Content className="relative z-10" />
 * </div>
 */

type AuroraVariant = 'aurora' | 'sunset' | 'ocean' | 'emerald' | 'purple' | 'custom';
type AuroraIntensity = 'subtle' | 'medium' | 'vivid';

interface AuroraWashProps {
  /** Visual variant / color scheme */
  variant?: AuroraVariant;
  /** Effect intensity */
  intensity?: AuroraIntensity;
  /** Animation speed multiplier (1 = 60s cycle, 0.5 = 30s, 2 = 120s) */
  speed?: number;
  /** Render as absolute positioned background layer */
  asBackground?: boolean;
  /** Custom gradient colors (when variant="custom") */
  colors?: {
    primary: string;
    secondary: string;
    tertiary?: string;
  };
  /** Border radius to match container */
  borderRadius?: number | string;
  /** Additional class name */
  className?: string;
  /** Content (when not asBackground) */
  children?: ReactNode;
}

// Color presets for each variant
const VARIANT_COLORS: Record<Exclude<AuroraVariant, 'custom'>, { primary: string; secondary: string; tertiary: string }> = {
  aurora: {
    primary: 'rgba(34, 197, 94, 0.4)',    // Emerald green
    secondary: 'rgba(59, 130, 246, 0.3)', // Blue
    tertiary: 'rgba(168, 85, 247, 0.25)', // Purple
  },
  sunset: {
    primary: 'rgba(251, 146, 60, 0.35)',  // Orange
    secondary: 'rgba(236, 72, 153, 0.3)', // Pink
    tertiary: 'rgba(168, 85, 247, 0.25)', // Purple
  },
  ocean: {
    primary: 'rgba(6, 182, 212, 0.35)',   // Cyan
    secondary: 'rgba(59, 130, 246, 0.3)', // Blue
    tertiary: 'rgba(34, 197, 94, 0.2)',   // Green accent
  },
  emerald: {
    primary: 'rgba(16, 185, 129, 0.4)',   // Emerald
    secondary: 'rgba(34, 197, 94, 0.3)',  // Green
    tertiary: 'rgba(6, 182, 212, 0.2)',   // Cyan accent
  },
  purple: {
    primary: 'rgba(168, 85, 247, 0.4)',   // Purple
    secondary: 'rgba(139, 92, 246, 0.3)', // Violet
    tertiary: 'rgba(236, 72, 153, 0.25)', // Pink accent
  },
};

// Intensity multipliers for opacity
const INTENSITY_MULTIPLIERS: Record<AuroraIntensity, number> = {
  subtle: 0.5,
  medium: 0.75,
  vivid: 1,
};

export function AuroraWash({
  variant = 'aurora',
  intensity = 'medium',
  speed = 1,
  asBackground = false,
  colors,
  borderRadius = 0,
  className = '',
  children,
}: AuroraWashProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Get colors based on variant
  const getColors = () => {
    if (variant === 'custom' && colors) {
      return {
        primary: colors.primary,
        secondary: colors.secondary,
        tertiary: colors.tertiary || colors.secondary,
      };
    }
    return VARIANT_COLORS[variant as Exclude<AuroraVariant, 'custom'>] || VARIANT_COLORS.aurora;
  };

  const variantColors = getColors();
  const opacityMultiplier = INTENSITY_MULTIPLIERS[intensity];
  const animationDuration = 60 / speed;

  // Apply opacity multiplier to colors
  const adjustOpacity = (color: string, multiplier: number): string => {
    // Parse rgba and adjust alpha
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/);
    if (match) {
      const [, r, g, b, a = '1'] = match;
      const newAlpha = parseFloat(a) * multiplier;
      return `rgba(${r}, ${g}, ${b}, ${newAlpha.toFixed(3)})`;
    }
    return color;
  };

  const primary = adjustOpacity(variantColors.primary, opacityMultiplier);
  const secondary = adjustOpacity(variantColors.secondary, opacityMultiplier);
  const tertiary = adjustOpacity(variantColors.tertiary, opacityMultiplier);

  // Background gradient layers
  const backgroundImage = `
    radial-gradient(ellipse 80% 80% at 50% -20%, ${primary}, transparent 50%),
    radial-gradient(ellipse 70% 70% at 80% 50%, ${secondary}, transparent 50%),
    radial-gradient(ellipse 60% 60% at 20% 80%, ${tertiary}, transparent 50%),
    radial-gradient(ellipse 50% 50% at 70% 100%, ${primary}, transparent 45%)
  `;

  const staticBackground = `
    radial-gradient(ellipse 80% 80% at 50% 20%, ${primary}, transparent 50%),
    radial-gradient(ellipse 70% 70% at 75% 60%, ${secondary}, transparent 50%),
    radial-gradient(ellipse 60% 60% at 25% 75%, ${tertiary}, transparent 50%)
  `;

  const style: CSSProperties = {
    backgroundImage: prefersReducedMotion ? staticBackground : backgroundImage,
    backgroundSize: '200% 200%',
    borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
    ...(prefersReducedMotion ? {} : {
      animation: `auroraWash ${animationDuration}s ease-in-out infinite`,
    }),
    // Ensure GPU acceleration
    willChange: prefersReducedMotion ? 'auto' : 'background-position',
    transform: 'translateZ(0)',
  };

  // Inject keyframes on mount
  useEffect(() => {
    if (!mounted || prefersReducedMotion) return;
    
    const styleId = 'aurora-wash-keyframes';
    if (document.getElementById(styleId)) return;
    
    const styleSheet = document.createElement('style');
    styleSheet.id = styleId;
    styleSheet.textContent = `
      @keyframes auroraWash {
        0%, 100% {
          background-position: 0% 0%, 100% 50%, 0% 100%, 100% 100%;
        }
        25% {
          background-position: 100% 0%, 0% 100%, 50% 50%, 50% 0%;
        }
        50% {
          background-position: 50% 100%, 50% 0%, 100% 50%, 0% 50%;
        }
        75% {
          background-position: 0% 50%, 100% 100%, 50% 0%, 100% 50%;
        }
      }
    `;
    document.head.appendChild(styleSheet);
    
    return () => {
      // Don't remove - other instances may need it
    };
  }, [mounted, prefersReducedMotion]);

  if (asBackground) {
    return (
      <div
        className={`aurora-wash-bg ${className}`}
        style={{
          ...style,
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'hidden',
        }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className={`aurora-wash ${className}`}
      style={{
        ...style,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
}

/**
 * AuroraCard - Card wrapper with aurora wash background
 * 
 * Pre-styled card component with aurora wash effect and glass styling.
 * Perfect for highlighting important content like big earnings beats.
 */
interface AuroraCardProps extends Omit<AuroraWashProps, 'asBackground' | 'children'> {
  children: ReactNode;
  /** Enable glass morphism overlay */
  glass?: boolean;
  /** Padding size */
  padding?: 'sm' | 'md' | 'lg';
}

export function AuroraCard({
  children,
  variant = 'aurora',
  intensity = 'subtle',
  glass = true,
  padding = 'md',
  borderRadius = 16,
  className = '',
  ...props
}: AuroraCardProps) {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-8',
  };

  return (
    <div
      className={`aurora-card relative overflow-hidden ${className}`}
      style={{ borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius }}
    >
      <AuroraWash
        asBackground
        variant={variant}
        intensity={intensity}
        borderRadius={borderRadius}
        {...props}
      />
      
      {/* Glass overlay */}
      {glass && (
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.03) 100%)',
            borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
          }}
          aria-hidden="true"
        />
      )}
      
      {/* Border */}
      <div
        className="absolute inset-0 pointer-events-none z-[2]"
        style={{
          borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
        aria-hidden="true"
      />
      
      {/* Content */}
      <div className={`relative z-10 ${paddingClasses[padding]}`}>
        {children}
      </div>
    </div>
  );
}

/**
 * AuroraText - Text with aurora gradient behind it
 * 
 * Creates a glowing aurora effect behind text for emphasis.
 */
interface AuroraTextProps {
  children: ReactNode;
  variant?: AuroraVariant;
  intensity?: AuroraIntensity;
  className?: string;
}

export function AuroraText({
  children,
  variant = 'aurora',
  intensity = 'medium',
  className = '',
}: AuroraTextProps) {
  const variantColors = VARIANT_COLORS[variant as Exclude<AuroraVariant, 'custom'>] || VARIANT_COLORS.aurora;
  const opacityMultiplier = INTENSITY_MULTIPLIERS[intensity] * 0.6; // Reduced for text

  return (
    <span 
      className={`aurora-text relative inline-block ${className}`}
      style={{
        textShadow: `
          0 0 20px ${variantColors.primary.replace(/[\d.]+\)$/, `${opacityMultiplier})`)}),
          0 0 40px ${variantColors.secondary.replace(/[\d.]+\)$/, `${opacityMultiplier * 0.6})`)}),
          0 0 60px ${variantColors.tertiary.replace(/[\d.]+\)$/, `${opacityMultiplier * 0.4})`)})
        `,
      }}
    >
      {children}
    </span>
  );
}

export default AuroraWash;
