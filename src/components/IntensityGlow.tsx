'use client';

import { ReactNode, useMemo, CSSProperties } from 'react';

/**
 * IntensityGlow - Data-driven visual intensity component
 * 
 * Creates visual hierarchy by adapting glow intensity, saturation, and animation
 * speed based on the magnitude of the value being displayed. Exceptional values
 * naturally stand out while moderate values maintain subtlety.
 * 
 * 2026 Trend: "Data-Driven Aesthetics" - visual treatment reflects data significance
 * 
 * @example
 * // Surprise percentage - higher = more intense glow
 * <IntensityGlow value={25} maxValue={50} variant="success">
 *   <Badge>+25%</Badge>
 * </IntensityGlow>
 * 
 * @example
 * // Beat rate - intensity scales with percentage
 * <IntensityGlow value={beatRate} maxValue={100} variant="gradient">
 *   <span>{beatRate}%</span>
 * </IntensityGlow>
 */

interface IntensityGlowProps {
  /** The value that drives intensity (absolute value is used) */
  value: number;
  /** Maximum expected value for normalization (default: 100) */
  maxValue?: number;
  /** Minimum intensity (0-1) even at value=0 */
  minIntensity?: number;
  /** Maximum intensity (0-1) at maxValue */
  maxIntensity?: number;
  /** Color variant */
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'gradient' | 'custom';
  /** Custom color (when variant='custom') */
  customColor?: string;
  /** Enable pulsing animation (speed scales with intensity) */
  pulse?: boolean;
  /** Minimum pulse duration in ms at max intensity */
  minPulseDuration?: number;
  /** Maximum pulse duration in ms at min intensity */
  maxPulseDuration?: number;
  /** Enable particle sparkles at high intensity */
  sparkles?: boolean;
  /** Intensity threshold to show sparkles (0-1) */
  sparkleThreshold?: number;
  /** Number of sparkle particles */
  sparkleCount?: number;
  /** Enable ring expansion effect */
  ring?: boolean;
  /** Glow blur radius in pixels */
  blurRadius?: number;
  /** Glow spread radius in pixels */
  spreadRadius?: number;
  /** Apply to background instead of box-shadow */
  backgroundGlow?: boolean;
  /** Border radius for the glow container */
  borderRadius?: number | string;
  /** Additional className */
  className?: string;
  /** Children to wrap */
  children: ReactNode;
}

// Color configurations per variant
const VARIANT_COLORS: Record<string, { primary: string; secondary: string; hsl: string }> = {
  success: {
    primary: 'rgba(34, 197, 94, VAR)',
    secondary: 'rgba(74, 222, 128, VAR)',
    hsl: '142, 76%',
  },
  danger: {
    primary: 'rgba(239, 68, 68, VAR)',
    secondary: 'rgba(248, 113, 113, VAR)',
    hsl: '0, 84%',
  },
  warning: {
    primary: 'rgba(251, 191, 36, VAR)',
    secondary: 'rgba(252, 211, 77, VAR)',
    hsl: '43, 96%',
  },
  info: {
    primary: 'rgba(59, 130, 246, VAR)',
    secondary: 'rgba(96, 165, 250, VAR)',
    hsl: '217, 91%',
  },
  gradient: {
    primary: 'rgba(139, 92, 246, VAR)',
    secondary: 'rgba(236, 72, 153, VAR)',
    hsl: '262, 83%',
  },
};

// Calculate eased intensity (non-linear for better visual distribution)
function calculateIntensity(
  value: number,
  maxValue: number,
  minIntensity: number,
  maxIntensity: number
): number {
  const absValue = Math.abs(value);
  const normalizedValue = Math.min(absValue / maxValue, 1);
  // Ease-out quad for better visual perception
  const eased = 1 - Math.pow(1 - normalizedValue, 2);
  return minIntensity + eased * (maxIntensity - minIntensity);
}

// Generate CSS color with opacity
function colorWithOpacity(template: string, opacity: number): string {
  return template.replace('VAR', opacity.toFixed(3));
}

export function IntensityGlow({
  value,
  maxValue = 100,
  minIntensity = 0.1,
  maxIntensity = 1,
  variant = 'success',
  customColor,
  pulse = true,
  minPulseDuration = 800,
  maxPulseDuration = 3000,
  sparkles = true,
  sparkleThreshold = 0.7,
  sparkleCount = 5,
  ring = false,
  blurRadius = 20,
  spreadRadius = 4,
  backgroundGlow = false,
  borderRadius = 8,
  className = '',
  children,
}: IntensityGlowProps) {
  // Calculate intensity based on value magnitude
  const intensity = useMemo(
    () => calculateIntensity(value, maxValue, minIntensity, maxIntensity),
    [value, maxValue, minIntensity, maxIntensity]
  );

  // Get colors based on variant
  const colors = useMemo(() => {
    if (variant === 'custom' && customColor) {
      return {
        primary: customColor.replace(/[\d.]+\)$/, 'VAR)'),
        secondary: customColor.replace(/[\d.]+\)$/, 'VAR)'),
        hsl: '200, 50%', // fallback
      };
    }
    return VARIANT_COLORS[variant] || VARIANT_COLORS.success;
  }, [variant, customColor]);

  // Calculate dynamic values based on intensity
  const dynamicStyles = useMemo(() => {
    const glowOpacity = intensity * 0.6;
    const saturationBoost = 1 + intensity * 0.3; // More saturated at higher intensity
    const scaledBlur = blurRadius * (0.5 + intensity * 0.5);
    const scaledSpread = spreadRadius * intensity;
    const pulseDuration = maxPulseDuration - intensity * (maxPulseDuration - minPulseDuration);

    const primaryColor = colorWithOpacity(colors.primary, glowOpacity);
    const secondaryColor = colorWithOpacity(colors.secondary, glowOpacity * 0.7);

    const boxShadow = backgroundGlow
      ? 'none'
      : `
          0 0 ${scaledBlur}px ${scaledSpread}px ${primaryColor},
          0 0 ${scaledBlur * 1.5}px ${scaledSpread * 1.5}px ${secondaryColor}
        `;

    const backgroundImage = backgroundGlow
      ? `radial-gradient(circle at center, ${primaryColor} 0%, ${secondaryColor} 50%, transparent 70%)`
      : 'none';

    return {
      boxShadow,
      backgroundImage,
      pulseDuration,
      saturationBoost,
      intensity,
    };
  }, [
    intensity,
    colors,
    blurRadius,
    spreadRadius,
    backgroundGlow,
    minPulseDuration,
    maxPulseDuration,
  ]);

  // Show sparkles only above threshold
  const showSparkles = sparkles && intensity >= sparkleThreshold;

  // Generate sparkle positions
  const sparklePositions = useMemo(() => {
    if (!showSparkles) return [];
    return Array.from({ length: sparkleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
      size: 2 + Math.random() * 2,
      duration: 1 + Math.random() * 1,
    }));
  }, [showSparkles, sparkleCount]);

  const containerStyle: CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    borderRadius,
    // Apply saturation filter at high intensity
    filter: dynamicStyles.saturationBoost > 1.1 
      ? `saturate(${dynamicStyles.saturationBoost})` 
      : undefined,
  };

  const glowStyle: CSSProperties = {
    position: 'absolute',
    inset: backgroundGlow ? -blurRadius : 0,
    borderRadius,
    boxShadow: dynamicStyles.boxShadow,
    backgroundImage: dynamicStyles.backgroundImage,
    pointerEvents: 'none',
    zIndex: 0,
    opacity: intensity,
    transition: 'box-shadow 0.3s ease, opacity 0.3s ease, background-image 0.3s ease',
  };

  const pulseAnimation = pulse
    ? `intensity-glow-pulse ${dynamicStyles.pulseDuration}ms ease-in-out infinite`
    : undefined;

  return (
    <div className={`intensity-glow-container ${className}`} style={containerStyle}>
      {/* Glow layer */}
      <div
        className="intensity-glow-layer"
        style={{
          ...glowStyle,
          animation: pulseAnimation,
        }}
        aria-hidden="true"
      />

      {/* Ring expansion effect */}
      {ring && intensity > 0.3 && (
        <div
          className="intensity-glow-ring"
          style={{
            position: 'absolute',
            inset: -2,
            borderRadius,
            border: `2px solid ${colorWithOpacity(colors.primary, intensity * 0.4)}`,
            animation: `intensity-glow-ring-expand ${2000 / intensity}ms ease-out infinite`,
            pointerEvents: 'none',
            zIndex: 0,
          }}
          aria-hidden="true"
        />
      )}

      {/* Sparkle particles */}
      {showSparkles &&
        sparklePositions.map((sparkle) => (
          <div
            key={sparkle.id}
            className="intensity-glow-sparkle"
            style={{
              position: 'absolute',
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
              width: sparkle.size,
              height: sparkle.size,
              borderRadius: '50%',
              backgroundColor: colorWithOpacity(colors.secondary, 0.9),
              boxShadow: `0 0 ${sparkle.size * 2}px ${colorWithOpacity(colors.primary, 0.8)}`,
              animation: `intensity-glow-sparkle ${sparkle.duration}s ease-in-out infinite`,
              animationDelay: `${sparkle.delay}s`,
              pointerEvents: 'none',
              zIndex: 2,
            }}
            aria-hidden="true"
          />
        ))}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>

      {/* Keyframes injection */}
      <style jsx>{`
        @keyframes intensity-glow-pulse {
          0%,
          100% {
            opacity: ${intensity * 0.7};
            transform: scale(1);
          }
          50% {
            opacity: ${intensity};
            transform: scale(1.02);
          }
        }

        @keyframes intensity-glow-ring-expand {
          0% {
            transform: scale(1);
            opacity: ${intensity * 0.5};
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }

        @keyframes intensity-glow-sparkle {
          0%,
          100% {
            opacity: 0;
            transform: scale(0) translateY(0);
          }
          25% {
            opacity: 1;
            transform: scale(1) translateY(-5px);
          }
          50% {
            opacity: 1;
            transform: scale(1.2) translateY(-10px);
          }
          75% {
            opacity: 0.5;
            transform: scale(0.8) translateY(-15px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .intensity-glow-layer,
          .intensity-glow-ring,
          .intensity-glow-sparkle {
            animation: none !important;
          }
        }

        @media print {
          .intensity-glow-layer,
          .intensity-glow-ring,
          .intensity-glow-sparkle {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * IntensityGlowBadge - Pre-styled badge with intensity-driven glow
 * 
 * Perfect for surprise percentages, beat rates, or any numeric badge.
 */
interface IntensityGlowBadgeProps {
  value: number;
  maxValue?: number;
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'gradient';
  showSign?: boolean;
  suffix?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_STYLES = {
  sm: 'text-xs px-1.5 py-0.5 font-medium',
  md: 'text-sm px-2 py-1 font-semibold',
  lg: 'text-base px-3 py-1.5 font-bold',
};

export function IntensityGlowBadge({
  value,
  maxValue = 100,
  variant = 'success',
  showSign = true,
  suffix = '%',
  size = 'md',
  className = '',
}: IntensityGlowBadgeProps) {
  const formattedValue = useMemo(() => {
    const sign = showSign && value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}${suffix}`;
  }, [value, showSign, suffix]);

  const bgColor = useMemo(() => {
    switch (variant) {
      case 'success':
        return 'bg-emerald-500/20';
      case 'danger':
        return 'bg-red-500/20';
      case 'warning':
        return 'bg-amber-500/20';
      case 'info':
        return 'bg-blue-500/20';
      case 'gradient':
        return 'bg-purple-500/20';
      default:
        return 'bg-zinc-500/20';
    }
  }, [variant]);

  const textColor = useMemo(() => {
    switch (variant) {
      case 'success':
        return 'text-emerald-400';
      case 'danger':
        return 'text-red-400';
      case 'warning':
        return 'text-amber-400';
      case 'info':
        return 'text-blue-400';
      case 'gradient':
        return 'text-purple-400';
      default:
        return 'text-zinc-400';
    }
  }, [variant]);

  return (
    <IntensityGlow
      value={Math.abs(value)}
      maxValue={maxValue}
      variant={variant}
      pulse={Math.abs(value) > maxValue * 0.3}
      sparkles={Math.abs(value) > maxValue * 0.5}
      sparkleCount={3}
      ring={Math.abs(value) > maxValue * 0.7}
      blurRadius={12}
      spreadRadius={2}
      borderRadius={9999}
      className={className}
    >
      <span
        className={`
          inline-flex items-center justify-center rounded-full
          ${bgColor} ${textColor} ${SIZE_STYLES[size]}
          backdrop-blur-sm transition-colors
        `}
      >
        {formattedValue}
      </span>
    </IntensityGlow>
  );
}

/**
 * useIntensity - Hook for calculating intensity from value
 * 
 * Use when you need intensity value for custom styling.
 */
export function useIntensity(
  value: number,
  maxValue = 100,
  minIntensity = 0.1,
  maxIntensity = 1
): number {
  return useMemo(
    () => calculateIntensity(value, maxValue, minIntensity, maxIntensity),
    [value, maxValue, minIntensity, maxIntensity]
  );
}

/**
 * IntensityText - Text with intensity-driven styling
 * 
 * The text color saturation and optional text-shadow scale with value.
 */
interface IntensityTextProps {
  value: number;
  maxValue?: number;
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'gradient';
  glow?: boolean;
  children: ReactNode;
  className?: string;
}

export function IntensityText({
  value,
  maxValue = 100,
  variant = 'success',
  glow = true,
  children,
  className = '',
}: IntensityTextProps) {
  const intensity = useIntensity(value, maxValue, 0.3, 1);
  const colors = VARIANT_COLORS[variant] || VARIANT_COLORS.success;

  const style: CSSProperties = {
    filter: `saturate(${0.7 + intensity * 0.6})`,
    textShadow: glow
      ? `0 0 ${8 * intensity}px ${colorWithOpacity(colors.primary, intensity * 0.5)}`
      : undefined,
    transition: 'filter 0.3s ease, text-shadow 0.3s ease',
  };

  return (
    <span className={className} style={style}>
      {children}
    </span>
  );
}
