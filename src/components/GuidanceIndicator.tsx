'use client';

import { useState, useEffect, useRef, useMemo, memo } from 'react';

/**
 * GuidanceIndicator
 * 
 * Shows forward guidance direction with animated visual feedback.
 * Guidance is often as important as earnings results for stock movement.
 * 
 * Features:
 * - Direction indicator (raised/maintained/lowered/withdrawn)
 * - Strength visualization (how much guidance changed)
 * - Animated arrow with spring physics
 * - Pulsing glow for significant changes
 * - Tooltip with detailed breakdown
 * - Light/dark mode support
 * - Reduced motion support
 * 
 * 2026 Design Trends:
 * - Directional momentum indicators
 * - Spring-based animations
 * - Contextual micro-information
 * - Semantic color coding
 */

export type GuidanceDirection = 'raised' | 'maintained' | 'lowered' | 'withdrawn' | 'initiated';

interface GuidanceIndicatorProps {
  /** Direction of guidance change */
  direction: GuidanceDirection;
  /** Magnitude of change as percentage (e.g., 5 = 5% higher guidance) */
  magnitude?: number;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Show the text label */
  showLabel?: boolean;
  /** Show magnitude badge when available */
  showMagnitude?: boolean;
  /** Animation delay in ms */
  delay?: number;
  /** Enable pulse animation for significant changes */
  pulseOnSignificant?: boolean;
  /** Threshold for "significant" change (default 10%) */
  significantThreshold?: number;
  /** Custom className */
  className?: string;
  /** Show compact inline variant */
  inline?: boolean;
}

// Configuration for each guidance direction
const directionConfig = {
  raised: {
    label: 'Raised',
    shortLabel: 'Raised',
    icon: '↑',
    arrowRotation: -45,
    color: 'emerald',
    bgClass: 'bg-emerald-500/10 dark:bg-emerald-400/10',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    borderClass: 'border-emerald-500/30',
    glowClass: 'shadow-emerald-500/30',
    arrowClass: 'text-emerald-500',
    description: 'Forward guidance increased',
    sentiment: 'bullish',
  },
  maintained: {
    label: 'Maintained',
    shortLabel: 'Held',
    icon: '→',
    arrowRotation: 0,
    color: 'slate',
    bgClass: 'bg-slate-500/10 dark:bg-slate-400/10',
    textClass: 'text-slate-600 dark:text-slate-400',
    borderClass: 'border-slate-500/30',
    glowClass: 'shadow-slate-500/20',
    arrowClass: 'text-slate-500',
    description: 'Forward guidance unchanged',
    sentiment: 'neutral',
  },
  lowered: {
    label: 'Lowered',
    shortLabel: 'Cut',
    icon: '↓',
    arrowRotation: 45,
    color: 'red',
    bgClass: 'bg-red-500/10 dark:bg-red-400/10',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500/30',
    glowClass: 'shadow-red-500/30',
    arrowClass: 'text-red-500',
    description: 'Forward guidance reduced',
    sentiment: 'bearish',
  },
  withdrawn: {
    label: 'Withdrawn',
    shortLabel: 'Withdrawn',
    icon: '⊘',
    arrowRotation: 0,
    color: 'orange',
    bgClass: 'bg-orange-500/10 dark:bg-orange-400/10',
    textClass: 'text-orange-600 dark:text-orange-400',
    borderClass: 'border-orange-500/30',
    glowClass: 'shadow-orange-500/30',
    arrowClass: 'text-orange-500',
    description: 'Forward guidance suspended',
    sentiment: 'uncertain',
  },
  initiated: {
    label: 'Initiated',
    shortLabel: 'New',
    icon: '✦',
    arrowRotation: 0,
    color: 'blue',
    bgClass: 'bg-blue-500/10 dark:bg-blue-400/10',
    textClass: 'text-blue-600 dark:text-blue-400',
    borderClass: 'border-blue-500/30',
    glowClass: 'shadow-blue-500/30',
    arrowClass: 'text-blue-500',
    description: 'New forward guidance provided',
    sentiment: 'neutral',
  },
};

// Size configurations
const sizeConfig = {
  xs: {
    container: 'h-4',
    padding: 'px-1 py-0.5',
    text: 'text-[9px]',
    gap: 'gap-0.5',
    iconSize: 'w-2.5 h-2.5 text-[8px]',
    arrowSize: 'w-3 h-3',
    magnitudeText: 'text-[8px]',
  },
  sm: {
    container: 'h-5',
    padding: 'px-1.5 py-0.5',
    text: 'text-[10px]',
    gap: 'gap-1',
    iconSize: 'w-3 h-3 text-[10px]',
    arrowSize: 'w-3.5 h-3.5',
    magnitudeText: 'text-[9px]',
  },
  md: {
    container: 'h-6',
    padding: 'px-2 py-1',
    text: 'text-xs',
    gap: 'gap-1.5',
    iconSize: 'w-4 h-4 text-xs',
    arrowSize: 'w-4 h-4',
    magnitudeText: 'text-[10px]',
  },
  lg: {
    container: 'h-8',
    padding: 'px-3 py-1.5',
    text: 'text-sm',
    gap: 'gap-2',
    iconSize: 'w-5 h-5 text-sm',
    arrowSize: 'w-5 h-5',
    magnitudeText: 'text-xs',
  },
};

// Animated arrow component
const AnimatedArrow = memo(function AnimatedArrow({
  rotation,
  colorClass,
  size,
  animated,
  delay,
  pulse,
}: {
  rotation: number;
  colorClass: string;
  size: string;
  animated: boolean;
  delay: number;
  pulse: boolean;
}) {
  const [isVisible, setIsVisible] = useState(!animated);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [animated, delay]);

  return (
    <div
      className={`
        ${size} flex items-center justify-center
        transition-all duration-500 ease-out
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
        ${pulse ? 'animate-pulse' : ''}
      `}
      style={{
        transform: isVisible ? `rotate(${rotation}deg)` : `rotate(${rotation + 180}deg)`,
        transitionDelay: `${delay}ms`,
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`w-full h-full ${colorClass}`}
      >
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </div>
  );
});

export const GuidanceIndicator = memo(function GuidanceIndicator({
  direction,
  magnitude,
  size = 'sm',
  showLabel = true,
  showMagnitude = true,
  delay = 0,
  pulseOnSignificant = true,
  significantThreshold = 10,
  className = '',
  inline = false,
}: GuidanceIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useRef(false);

  const config = directionConfig[direction];
  const sizeStyles = sizeConfig[size];

  // Check if change is significant
  const isSignificant = useMemo(() => {
    if (!magnitude) return false;
    return Math.abs(magnitude) >= significantThreshold;
  }, [magnitude, significantThreshold]);

  // Should pulse?
  const shouldPulse = pulseOnSignificant && isSignificant && !prefersReducedMotion.current;

  // Check reduced motion preference
  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Intersection observer for entrance animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  // Format magnitude for display
  const formattedMagnitude = useMemo(() => {
    if (magnitude === undefined || magnitude === null) return null;
    const sign = magnitude > 0 ? '+' : '';
    return `${sign}${magnitude.toFixed(1)}%`;
  }, [magnitude]);

  // Inline variant (just icon + optional magnitude)
  if (inline) {
    return (
      <span
        ref={containerRef}
        className={`
          inline-flex items-center ${sizeStyles.gap}
          transition-all duration-300
          ${isVisible ? 'opacity-100' : 'opacity-0'}
          ${className}
        `}
        title={`Guidance ${config.label}${formattedMagnitude ? ` (${formattedMagnitude})` : ''}`}
      >
        <span className={`${config.arrowClass} ${sizeStyles.text} font-semibold`}>
          {config.icon}
        </span>
        {showMagnitude && formattedMagnitude && (
          <span className={`${config.textClass} ${sizeStyles.magnitudeText} font-mono`}>
            {formattedMagnitude}
          </span>
        )}
      </span>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="img"
      aria-label={`Guidance ${config.label}${formattedMagnitude ? `, ${formattedMagnitude}` : ''}`}
    >
      {/* Main badge */}
      <div
        className={`
          inline-flex items-center ${sizeStyles.gap} ${sizeStyles.padding}
          ${config.bgClass} ${config.textClass}
          rounded-full font-medium ${sizeStyles.text}
          border ${config.borderClass}
          transition-all duration-500
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
          ${shouldPulse ? config.glowClass : ''}
          ${shouldPulse ? 'shadow-lg' : ''}
        `}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {/* Animated arrow */}
        {direction !== 'withdrawn' && direction !== 'initiated' ? (
          <AnimatedArrow
            rotation={config.arrowRotation}
            colorClass={config.arrowClass}
            size={sizeStyles.arrowSize}
            animated={!prefersReducedMotion.current}
            delay={delay + 100}
            pulse={shouldPulse}
          />
        ) : (
          <span className={`${sizeStyles.iconSize} flex items-center justify-center`}>
            {config.icon}
          </span>
        )}

        {/* Label */}
        {showLabel && (
          <span className="whitespace-nowrap">{config.shortLabel}</span>
        )}

        {/* Magnitude badge */}
        {showMagnitude && formattedMagnitude && (
          <span
            className={`
              ${sizeStyles.magnitudeText} font-mono font-semibold
              px-1 py-0.5 rounded
              bg-white/10 dark:bg-black/20
              transition-all duration-300
              ${isVisible ? 'opacity-100' : 'opacity-0'}
            `}
            style={{ transitionDelay: `${delay + 200}ms` }}
          >
            {formattedMagnitude}
          </span>
        )}
      </div>

      {/* Tooltip on hover */}
      {isHovered && (
        <div
          className={`
            absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50
            px-3 py-2 rounded-lg
            bg-slate-900/95 dark:bg-slate-800/95
            text-white text-xs
            shadow-xl backdrop-blur-sm
            whitespace-nowrap
            animate-in fade-in slide-in-from-bottom-1 duration-200
          `}
        >
          <div className="font-medium mb-0.5">{config.label} Guidance</div>
          <div className="text-slate-300 text-[10px]">{config.description}</div>
          
          {formattedMagnitude && (
            <div className="mt-1.5 pt-1.5 border-t border-slate-700 text-[10px]">
              <span className="text-slate-400">Change: </span>
              <span className={config.textClass}>{formattedMagnitude}</span>
            </div>
          )}

          {isSignificant && (
            <div className="mt-1 text-amber-400 text-[10px]">
              ⚡ Significant change
            </div>
          )}

          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="border-4 border-transparent border-t-slate-900/95 dark:border-t-slate-800/95" />
          </div>
        </div>
      )}
    </div>
  );
});

/**
 * Compact icon-only variant
 */
export const GuidanceIcon = memo(function GuidanceIcon({
  direction,
  size = 'sm',
  className = '',
}: Pick<GuidanceIndicatorProps, 'direction' | 'size' | 'className'>) {
  const config = directionConfig[direction];
  const sizeStyles = sizeConfig[size];

  return (
    <span
      className={`
        inline-flex items-center justify-center
        ${sizeStyles.iconSize}
        ${config.textClass}
        ${className}
      `}
      title={`Guidance ${config.label}`}
    >
      {config.icon}
    </span>
  );
});

/**
 * Horizontal guidance bar showing direction and strength
 */
export const GuidanceBar = memo(function GuidanceBar({
  direction,
  magnitude = 0,
  size = 'md',
  delay = 0,
  className = '',
}: Pick<GuidanceIndicatorProps, 'direction' | 'magnitude' | 'size' | 'delay' | 'className'>) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const config = directionConfig[direction];
  
  // Normalize magnitude to bar width (cap at 20% = 100% bar width)
  const barWidth = Math.min(100, (Math.abs(magnitude || 0) / 20) * 100);
  const isPositive = direction === 'raised' || direction === 'initiated';

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  const barHeight = size === 'xs' ? 'h-1' : size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      role="img"
      aria-label={`Guidance ${config.label}: ${magnitude ? `${magnitude > 0 ? '+' : ''}${magnitude}%` : 'no change'}`}
    >
      {/* Track */}
      <div className={`w-full ${barHeight} rounded-full bg-slate-200 dark:bg-slate-700/50 overflow-hidden`}>
        {/* Center line for reference */}
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-400/30" />
        
        {/* Fill bar */}
        <div
          className={`
            absolute top-0 bottom-0 ${barHeight} rounded-full
            ${config.bgClass.replace('/10', '/60')}
            transition-all duration-700 ease-out
          `}
          style={{
            width: isVisible ? `${barWidth / 2}%` : '0%',
            left: isPositive ? '50%' : `${50 - barWidth / 2}%`,
            transitionDelay: `${delay + 100}ms`,
          }}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-1 text-[9px] text-slate-500">
        <span>-20%</span>
        <span className={config.textClass}>{config.shortLabel}</span>
        <span>+20%</span>
      </div>
    </div>
  );
});

/**
 * Hook for programmatic guidance data
 */
export function useGuidanceData(
  previousGuidance: number | null,
  newGuidance: number | null
) {
  return useMemo(() => {
    // No previous guidance
    if (previousGuidance === null && newGuidance !== null) {
      return {
        direction: 'initiated' as GuidanceDirection,
        magnitude: undefined,
        isSignificant: true,
      };
    }

    // Guidance withdrawn
    if (previousGuidance !== null && newGuidance === null) {
      return {
        direction: 'withdrawn' as GuidanceDirection,
        magnitude: undefined,
        isSignificant: true,
      };
    }

    // Both null
    if (previousGuidance === null || newGuidance === null) {
      return {
        direction: 'maintained' as GuidanceDirection,
        magnitude: undefined,
        isSignificant: false,
      };
    }

    // Calculate change
    const change = ((newGuidance - previousGuidance) / Math.abs(previousGuidance)) * 100;
    const absChange = Math.abs(change);

    let direction: GuidanceDirection;
    if (absChange < 1) {
      direction = 'maintained';
    } else if (change > 0) {
      direction = 'raised';
    } else {
      direction = 'lowered';
    }

    return {
      direction,
      magnitude: change,
      isSignificant: absChange >= 10,
    };
  }, [previousGuidance, newGuidance]);
}

export default GuidanceIndicator;
