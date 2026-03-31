'use client';

import { ReactNode, useMemo } from 'react';

/**
 * MetricGradientBg
 * 
 * Adds a subtle animated gradient background to stat cards based on metric value.
 * Inspired by Outcrowd's "Dashboard Widgets for Business Performance Tracking"
 * which uses contextual gradient fills to reinforce numeric data.
 * 
 * Key principle: You should be able to "feel" the metric without reading the number.
 * - High values (success) → Green gradient with upward flow
 * - Medium values (neutral) → Gray/blue neutral gradient  
 * - Low values (warning) → Amber/red gradient with subtle tension
 * 
 * The gradient subtly animates (breathing effect) to add life without distraction.
 */

type MetricVariant = 'rate' | 'count' | 'delta' | 'custom';
type ThresholdPreset = 'beat-rate' | 'completion' | 'neutral';

interface MetricGradientBgProps {
  children: ReactNode;
  /** The numeric value to base gradient on */
  value: number;
  /** Max value for percentage calculation (default 100) */
  maxValue?: number;
  /** Preset thresholds for common metrics */
  preset?: ThresholdPreset;
  /** Custom thresholds [low, high] (values below low = warning, above high = success) */
  thresholds?: [number, number];
  /** How intense the gradient is (0-1, default 0.15) */
  intensity?: number;
  /** Animation speed in ms (default 4000) */
  animationDuration?: number;
  /** Border radius in px (default 20) */
  borderRadius?: number;
  /** Enable subtle pulse animation */
  pulse?: boolean;
  /** Custom class name */
  className?: string;
  /** Disabled - no gradient shown */
  disabled?: boolean;
}

// Preset thresholds
const PRESETS: Record<ThresholdPreset, [number, number]> = {
  'beat-rate': [50, 75],      // <50% warning, >75% success
  'completion': [30, 80],     // <30% warning, >80% success
  'neutral': [0, 100],        // Always neutral
};

// Gradient color palettes
const GRADIENTS = {
  success: {
    start: 'rgba(34, 197, 94, VAR_INTENSITY)', // green-500
    mid: 'rgba(16, 185, 129, VAR_INTENSITY_MID)', // emerald-500
    end: 'rgba(20, 184, 166, VAR_INTENSITY_END)', // teal-500
    glow: 'rgba(34, 197, 94, 0.3)',
  },
  warning: {
    start: 'rgba(245, 158, 11, VAR_INTENSITY)', // amber-500
    mid: 'rgba(251, 146, 60, VAR_INTENSITY_MID)', // orange-400
    end: 'rgba(239, 68, 68, VAR_INTENSITY_END)', // red-500
    glow: 'rgba(245, 158, 11, 0.3)',
  },
  neutral: {
    start: 'rgba(113, 113, 122, VAR_INTENSITY)', // zinc-500
    mid: 'rgba(82, 82, 91, VAR_INTENSITY_MID)', // zinc-600
    end: 'rgba(63, 63, 70, VAR_INTENSITY_END)', // zinc-700
    glow: 'rgba(113, 113, 122, 0.2)',
  },
  exceptional: {
    start: 'rgba(34, 197, 94, VAR_INTENSITY)', // green
    mid: 'rgba(59, 130, 246, VAR_INTENSITY_MID)', // blue
    end: 'rgba(139, 92, 246, VAR_INTENSITY_END)', // violet
    glow: 'rgba(34, 197, 94, 0.4)',
  },
};

export function MetricGradientBg({
  children,
  value,
  maxValue = 100,
  preset = 'beat-rate',
  thresholds,
  intensity = 0.15,
  animationDuration = 4000,
  borderRadius = 20,
  pulse = true,
  className = '',
  disabled = false,
}: MetricGradientBgProps) {
  // Calculate normalized value (0-100)
  const normalizedValue = Math.min(100, Math.max(0, (value / maxValue) * 100));
  
  // Get thresholds
  const [lowThreshold, highThreshold] = thresholds || PRESETS[preset];
  
  // Determine gradient variant based on value
  const variant = useMemo(() => {
    if (normalizedValue <= lowThreshold) return 'warning';
    if (normalizedValue >= highThreshold) {
      // Exceptional performance (>90% for beat-rate)
      if (preset === 'beat-rate' && normalizedValue >= 90) return 'exceptional';
      return 'success';
    }
    return 'neutral';
  }, [normalizedValue, lowThreshold, highThreshold, preset]);
  
  // Calculate dynamic intensity based on how far from thresholds
  const dynamicIntensity = useMemo(() => {
    if (variant === 'neutral') return intensity * 0.5;
    
    // Increase intensity the further from threshold
    if (variant === 'success' || variant === 'exceptional') {
      const distance = normalizedValue - highThreshold;
      const maxDistance = 100 - highThreshold;
      return intensity * (0.8 + (distance / maxDistance) * 0.5);
    }
    if (variant === 'warning') {
      const distance = lowThreshold - normalizedValue;
      const maxDistance = lowThreshold;
      return intensity * (0.8 + (distance / maxDistance) * 0.5);
    }
    return intensity;
  }, [variant, normalizedValue, highThreshold, lowThreshold, intensity]);
  
  // Build gradient colors with intensity
  const gradientColors = useMemo(() => {
    const palette = GRADIENTS[variant];
    const baseIntensity = dynamicIntensity;
    const midIntensity = baseIntensity * 0.6;
    const endIntensity = baseIntensity * 0.3;
    
    return {
      start: palette.start
        .replace('VAR_INTENSITY', baseIntensity.toFixed(2))
        .replace('VAR_INTENSITY_MID', midIntensity.toFixed(2))
        .replace('VAR_INTENSITY_END', endIntensity.toFixed(2)),
      mid: palette.mid
        .replace('VAR_INTENSITY', baseIntensity.toFixed(2))
        .replace('VAR_INTENSITY_MID', midIntensity.toFixed(2))
        .replace('VAR_INTENSITY_END', endIntensity.toFixed(2)),
      end: palette.end
        .replace('VAR_INTENSITY', baseIntensity.toFixed(2))
        .replace('VAR_INTENSITY_MID', midIntensity.toFixed(2))
        .replace('VAR_INTENSITY_END', endIntensity.toFixed(2)),
      glow: palette.glow,
    };
  }, [variant, dynamicIntensity]);
  
  if (disabled) {
    return <>{children}</>;
  }
  
  // Gradient angle changes based on variant
  const gradientAngle = variant === 'warning' ? 180 : variant === 'exceptional' ? 135 : 145;
  
  return (
    <div 
      className={`metric-gradient-bg-wrapper ${className}`}
      style={{
        position: 'relative',
        borderRadius: `${borderRadius}px`,
        overflow: 'hidden',
      }}
    >
      {/* Animated gradient background */}
      <div
        className={`metric-gradient-bg ${pulse ? 'metric-gradient-pulse' : ''}`}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: `${borderRadius}px`,
          background: `linear-gradient(${gradientAngle}deg, ${gradientColors.start}, ${gradientColors.mid} 50%, ${gradientColors.end})`,
          opacity: 1,
          pointerEvents: 'none',
          zIndex: 0,
          transition: 'background 0.8s ease-out, opacity 0.5s ease-out',
        }}
        aria-hidden="true"
      />
      
      {/* Subtle inner glow for exceptional values */}
      {(variant === 'exceptional' || variant === 'success') && normalizedValue >= 85 && (
        <div
          className="metric-gradient-inner-glow"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: `${borderRadius}px`,
            boxShadow: `inset 0 0 30px ${gradientColors.glow}`,
            opacity: 0.6,
            pointerEvents: 'none',
            zIndex: 0,
          }}
          aria-hidden="true"
        />
      )}
      
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
      
      <style jsx>{`
        .metric-gradient-pulse {
          animation: metric-gradient-breathe ${animationDuration}ms ease-in-out infinite;
        }
        
        @keyframes metric-gradient-breathe {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.85;
            transform: scale(1.01);
          }
        }
        
        /* Subtle shimmer overlay for exceptional values */
        .metric-gradient-bg-wrapper:has(.metric-gradient-inner-glow)::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: ${borderRadius}px;
          background: linear-gradient(
            110deg,
            transparent 25%,
            rgba(255, 255, 255, 0.05) 50%,
            transparent 75%
          );
          animation: metric-shimmer 6s ease-in-out infinite;
          pointer-events: none;
          z-index: 0;
        }
        
        @keyframes metric-shimmer {
          0% {
            transform: translateX(-100%);
          }
          50%, 100% {
            transform: translateX(100%);
          }
        }
        
        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .metric-gradient-pulse {
            animation: none;
          }
          .metric-gradient-bg-wrapper::after {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Simple variant indicators for stat labels
 */
export function MetricTrendIndicator({ 
  trend 
}: { 
  trend: 'up' | 'down' | 'neutral' 
}) {
  const colors = {
    up: '#22c55e',
    down: '#ef4444',
    neutral: '#71717a',
  };
  
  const arrows = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };
  
  return (
    <span
      style={{
        color: colors[trend],
        fontSize: '0.75rem',
        fontWeight: 600,
        marginLeft: '4px',
      }}
    >
      {arrows[trend]}
    </span>
  );
}

export default MetricGradientBg;
