'use client';

import { useState, useEffect, useRef, useMemo } from 'react';

interface ConsensusRangeBarProps {
  /** Estimated EPS/value */
  estimate: number;
  /** Actual EPS/value (null if not yet reported) */
  actual?: number | null;
  /** Low estimate (optional, will be calculated as estimate - 15% if not provided) */
  estimateLow?: number;
  /** High estimate (optional, will be calculated as estimate + 15% if not provided) */
  estimateHigh?: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to animate on mount */
  animated?: boolean;
  /** Animation delay in ms */
  delay?: number;
  /** Show numeric labels */
  showLabels?: boolean;
  /** Show surprise percentage */
  showSurprise?: boolean;
  /** Label for the metric (e.g., "EPS", "Revenue") */
  label?: string;
  /** Custom class name */
  className?: string;
}

/**
 * ConsensusRangeBar - Visualizes analyst estimate range with actual result
 * 
 * Shows a sleek horizontal bar representing the estimate range (low to high),
 * with an animated needle indicator showing where the actual result landed.
 * The bar glows green for beats, red for misses.
 */
export function ConsensusRangeBar({
  estimate,
  actual,
  estimateLow,
  estimateHigh,
  size = 'md',
  animated = true,
  delay = 0,
  showLabels = true,
  showSurprise = true,
  label,
  className = '',
}: ConsensusRangeBarProps) {
  const [isVisible, setIsVisible] = useState(!animated);
  const [needleAnimated, setNeedleAnimated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate range bounds (use provided or default to ±15% of estimate)
  const low = estimateLow ?? estimate * 0.85;
  const high = estimateHigh ?? estimate * 1.15;
  const range = high - low;

  // Calculate positions as percentages
  const estimatePosition = ((estimate - low) / range) * 100;
  const actualPosition = actual != null ? ((actual - low) / range) * 100 : null;

  // Clamp actual position to 0-100 but track if it's outside range
  const clampedActualPosition = actualPosition != null
    ? Math.max(0, Math.min(100, actualPosition))
    : null;
  const isOutsideRange = actualPosition != null && (actualPosition < 0 || actualPosition > 100);

  // Calculate surprise percentage
  const surprise = actual != null && estimate !== 0
    ? ((actual - estimate) / Math.abs(estimate)) * 100
    : null;

  // Determine result type
  const result: 'beat' | 'miss' | 'met' | 'pending' = useMemo(() => {
    if (actual == null) return 'pending';
    if (surprise != null && surprise > 0.5) return 'beat';
    if (surprise != null && surprise < -0.5) return 'miss';
    return 'met';
  }, [actual, surprise]);

  // Size configurations
  const sizeConfig = {
    sm: { height: 'h-2', labelSize: 'text-[10px]', needleWidth: 'w-1', padding: 'py-3' },
    md: { height: 'h-3', labelSize: 'text-xs', needleWidth: 'w-1.5', padding: 'py-4' },
    lg: { height: 'h-4', labelSize: 'text-sm', needleWidth: 'w-2', padding: 'py-5' },
  };

  const config = sizeConfig[size];

  // Intersection observer for animation trigger
  useEffect(() => {
    if (!animated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
            // Slight delay before needle animates in
            setTimeout(() => setNeedleAnimated(true), 200);
          }, delay);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [animated, delay]);

  // Color schemes based on result
  const colors = {
    beat: {
      bar: 'from-emerald-500/20 to-emerald-400/10',
      needle: 'bg-emerald-500',
      glow: 'shadow-emerald-500/50',
      text: 'text-emerald-500',
      ring: 'ring-emerald-500/30',
    },
    miss: {
      bar: 'from-red-500/20 to-red-400/10',
      needle: 'bg-red-500',
      glow: 'shadow-red-500/50',
      text: 'text-red-500',
      ring: 'ring-red-500/30',
    },
    met: {
      bar: 'from-amber-500/20 to-amber-400/10',
      needle: 'bg-amber-500',
      glow: 'shadow-amber-500/50',
      text: 'text-amber-500',
      ring: 'ring-amber-500/30',
    },
    pending: {
      bar: 'from-slate-500/20 to-slate-400/10',
      needle: 'bg-slate-400',
      glow: 'shadow-slate-400/30',
      text: 'text-slate-400',
      ring: 'ring-slate-400/30',
    },
  };

  const colorScheme = colors[result];

  return (
    <div 
      ref={containerRef}
      className={`relative ${config.padding} ${className}`}
    >
      {/* Label */}
      {label && (
        <div className={`${config.labelSize} text-slate-500 dark:text-slate-400 mb-1 font-medium uppercase tracking-wider`}>
          {label}
        </div>
      )}

      {/* Main bar container */}
      <div className="relative">
        {/* Track background */}
        <div 
          className={`
            ${config.height} rounded-full overflow-hidden
            bg-gradient-to-r from-slate-200 to-slate-100
            dark:from-slate-700/50 dark:to-slate-800/50
            transition-all duration-500
            ${isVisible ? 'opacity-100' : 'opacity-0'}
          `}
        >
          {/* Gradient fill based on result */}
          {actual != null && (
            <div 
              className={`
                absolute inset-0 rounded-full
                bg-gradient-to-r ${colorScheme.bar}
                transition-opacity duration-500
                ${needleAnimated ? 'opacity-100' : 'opacity-0'}
              `}
            />
          )}

          {/* Center zone indicator (estimate zone) */}
          <div 
            className="absolute top-0 bottom-0 bg-slate-300/30 dark:bg-slate-600/30"
            style={{
              left: `${estimatePosition - 5}%`,
              width: '10%',
            }}
          />
        </div>

        {/* Estimate marker (center line) */}
        <div 
          className={`
            absolute top-0 ${config.height} w-px
            bg-slate-400 dark:bg-slate-500
            transition-all duration-500
            ${isVisible ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'}
          `}
          style={{ left: `${estimatePosition}%` }}
        >
          {/* Estimate label */}
          {showLabels && (
            <div 
              className={`
                absolute -bottom-5 left-1/2 -translate-x-1/2
                ${config.labelSize} text-slate-500 dark:text-slate-400
                whitespace-nowrap font-mono
                transition-all duration-500 delay-200
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}
              `}
            >
              Est: {estimate.toFixed(2)}
            </div>
          )}
        </div>

        {/* Actual result needle */}
        {clampedActualPosition != null && (
          <div 
            className={`
              absolute -top-1 -bottom-1 ${config.needleWidth} rounded-full
              ${colorScheme.needle}
              transition-all duration-700 ease-out
              ${needleAnimated ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'}
              shadow-lg ${colorScheme.glow}
            `}
            style={{ 
              left: `${clampedActualPosition}%`,
              transform: needleAnimated 
                ? `translateX(-50%) scaleY(1)` 
                : `translateX(-50%) scaleY(0)`,
            }}
          >
            {/* Needle glow effect */}
            <div 
              className={`
                absolute inset-0 rounded-full
                ${colorScheme.needle}
                animate-pulse opacity-50
                blur-sm
              `}
            />

            {/* Actual value label */}
            {showLabels && actual != null && (
              <div 
                className={`
                  absolute -top-6 left-1/2 -translate-x-1/2
                  ${config.labelSize} ${colorScheme.text} font-semibold
                  whitespace-nowrap font-mono
                  transition-all duration-500 delay-500
                  ${needleAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}
                `}
              >
                {actual.toFixed(2)}
              </div>
            )}

            {/* Outside range indicator */}
            {isOutsideRange && (
              <div 
                className={`
                  absolute top-1/2 -translate-y-1/2
                  ${actualPosition! < 0 ? '-left-4' : '-right-4'}
                  ${config.labelSize} ${colorScheme.text}
                `}
              >
                {actualPosition! < 0 ? '◀' : '▶'}
              </div>
            )}
          </div>
        )}

        {/* Low/High range labels */}
        {showLabels && (
          <>
            <div 
              className={`
                absolute top-1/2 -translate-y-1/2 -left-1
                ${config.labelSize} text-slate-400 dark:text-slate-500 font-mono
                -translate-x-full pr-2
                transition-all duration-500 delay-100
                ${isVisible ? 'opacity-100' : 'opacity-0'}
              `}
            >
              {low.toFixed(2)}
            </div>
            <div 
              className={`
                absolute top-1/2 -translate-y-1/2 -right-1
                ${config.labelSize} text-slate-400 dark:text-slate-500 font-mono
                translate-x-full pl-2
                transition-all duration-500 delay-100
                ${isVisible ? 'opacity-100' : 'opacity-0'}
              `}
            >
              {high.toFixed(2)}
            </div>
          </>
        )}
      </div>

      {/* Surprise badge */}
      {showSurprise && surprise != null && needleAnimated && (
        <div 
          className={`
            absolute top-0 right-0
            px-2 py-0.5 rounded-full
            ${config.labelSize} font-semibold
            ${colorScheme.text}
            bg-white/80 dark:bg-slate-900/80
            ring-1 ${colorScheme.ring}
            backdrop-blur-sm
            transition-all duration-500 delay-700
            ${needleAnimated ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          `}
        >
          {surprise >= 0 ? '+' : ''}{surprise.toFixed(1)}%
        </div>
      )}
    </div>
  );
}

/**
 * Compact variant for use in cards/lists
 */
export function ConsensusRangeBarCompact({
  estimate,
  actual,
  className = '',
}: Pick<ConsensusRangeBarProps, 'estimate' | 'actual' | 'className'>) {
  const surprise = actual != null && estimate !== 0
    ? ((actual - estimate) / Math.abs(estimate)) * 100
    : null;

  const result = useMemo(() => {
    if (actual == null) return 'pending';
    if (surprise != null && surprise > 0.5) return 'beat';
    if (surprise != null && surprise < -0.5) return 'miss';
    return 'met';
  }, [actual, surprise]);

  // Calculate position (clamped to 0-100)
  const low = estimate * 0.85;
  const high = estimate * 1.15;
  const range = high - low;
  const actualPosition = actual != null
    ? Math.max(0, Math.min(100, ((actual - low) / range) * 100))
    : null;

  const colorScheme = {
    beat: { bg: 'bg-emerald-500', glow: 'shadow-emerald-500/50' },
    miss: { bg: 'bg-red-500', glow: 'shadow-red-500/50' },
    met: { bg: 'bg-amber-500', glow: 'shadow-amber-500/50' },
    pending: { bg: 'bg-slate-400', glow: '' },
  }[result];

  return (
    <div className={`relative h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 ${className}`}>
      {/* Estimate marker */}
      <div 
        className="absolute top-0 bottom-0 w-px bg-slate-400 dark:bg-slate-500"
        style={{ left: '50%' }}
      />

      {/* Actual marker */}
      {actualPosition != null && (
        <div 
          className={`absolute -top-0.5 -bottom-0.5 w-1 rounded-full ${colorScheme.bg} shadow-lg ${colorScheme.glow}`}
          style={{ left: `${actualPosition}%`, transform: 'translateX(-50%)' }}
        />
      )}
    </div>
  );
}

export default ConsensusRangeBar;
