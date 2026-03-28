'use client';

import { useMemo, useEffect, useState } from 'react';

/**
 * TrendComparison - Inline badge showing comparison to baseline average
 * 
 * Design inspiration:
 * - Bloomberg Terminal's delta indicators
 * - Robinhood's percent change badges
 * - Linear.app's subtle metric comparisons
 * 
 * Features:
 * - Shows delta from baseline (e.g., "↑5% vs avg")
 * - Color-coded positive/negative/neutral
 * - Animated entrance with spring physics
 * - Tooltip with explanation
 * - Respects prefers-reduced-motion
 * - Light/dark mode support
 */

interface TrendComparisonProps {
  /** Current value (0-100 for percentages, any number for counts) */
  value: number;
  /** Baseline to compare against */
  baseline: number;
  /** Type of comparison */
  type?: 'percentage' | 'count' | 'rate';
  /** Size variant */
  size?: 'xs' | 'sm' | 'md';
  /** Show the label (e.g., "vs avg", "vs last week") */
  label?: string;
  /** Threshold for neutral state (±delta considered "at average") */
  neutralThreshold?: number;
  /** Animation delay in ms */
  delay?: number;
  /** Custom class name */
  className?: string;
  /** Invert colors (e.g., for metrics where lower is better) */
  invertColors?: boolean;
  /** Show sparkle effect on positive deltas */
  sparkle?: boolean;
}

export function TrendComparison({
  value,
  baseline,
  type = 'rate',
  size = 'sm',
  label = 'vs avg',
  neutralThreshold = 2,
  delay = 0,
  className = '',
  invertColors = false,
  sparkle = false,
}: TrendComparisonProps) {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check reduced motion preference
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    
    // Delay visibility for animation
    const timer = setTimeout(() => setIsVisible(true), delay);
    
    return () => {
      clearTimeout(timer);
      mq.removeEventListener('change', handler);
    };
  }, [delay]);

  const { delta, direction, variant, icon, displayDelta } = useMemo(() => {
    const rawDelta = value - baseline;
    const absDelta = Math.abs(rawDelta);
    
    // Determine direction
    let dir: 'up' | 'down' | 'neutral';
    if (absDelta <= neutralThreshold) {
      dir = 'neutral';
    } else if (rawDelta > 0) {
      dir = 'up';
    } else {
      dir = 'down';
    }
    
    // Determine variant (positive/negative visual)
    let v: 'positive' | 'negative' | 'neutral';
    if (dir === 'neutral') {
      v = 'neutral';
    } else if (invertColors) {
      v = dir === 'up' ? 'negative' : 'positive';
    } else {
      v = dir === 'up' ? 'positive' : 'negative';
    }
    
    // Icon based on direction
    const icons = {
      up: '↑',
      down: '↓',
      neutral: '≈',
    };
    
    // Format display delta
    let display: string;
    if (dir === 'neutral') {
      display = '';
    } else if (type === 'percentage' || type === 'rate') {
      display = `${Math.round(absDelta)}%`;
    } else {
      display = Math.round(absDelta).toString();
    }
    
    return {
      delta: rawDelta,
      direction: dir,
      variant: v,
      icon: icons[dir],
      displayDelta: display,
    };
  }, [value, baseline, type, neutralThreshold, invertColors]);

  if (!mounted) return null;

  // Size classes
  const sizeClasses = {
    xs: 'text-[10px] px-1 py-0.5 gap-0.5',
    sm: 'text-xs px-1.5 py-0.5 gap-1',
    md: 'text-sm px-2 py-1 gap-1',
  };

  // Variant classes
  const variantClasses = {
    positive: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    negative: 'bg-red-500/15 text-red-400 border-red-500/30',
    neutral: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  };

  // Light mode variant classes
  const lightVariantClasses = {
    positive: 'light:bg-emerald-500/10 light:text-emerald-600 light:border-emerald-500/25',
    negative: 'light:bg-red-500/10 light:text-red-600 light:border-red-500/25',
    neutral: 'light:bg-zinc-500/10 light:text-zinc-500 light:border-zinc-500/20',
  };

  const tooltipText = direction === 'neutral'
    ? `At baseline (${Math.round(baseline)}%)`
    : `${direction === 'up' ? 'Above' : 'Below'} baseline by ${displayDelta} (baseline: ${Math.round(baseline)}%)`;

  return (
    <span
      className={`
        trend-comparison
        inline-flex items-center font-medium rounded-full border
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${lightVariantClasses[variant]}
        ${isVisible && !prefersReducedMotion ? 'animate-trend-entrance' : ''}
        ${!isVisible ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
        transition-all duration-300
        ${className}
      `}
      title={tooltipText}
      style={{
        '--trend-delay': `${delay}ms`,
      } as React.CSSProperties}
    >
      {/* Direction icon */}
      <span 
        className={`
          trend-icon
          ${direction !== 'neutral' && !prefersReducedMotion ? 'animate-trend-bounce' : ''}
        `}
        aria-hidden="true"
      >
        {icon}
      </span>
      
      {/* Delta value */}
      {displayDelta && (
        <span className="trend-delta tabular-nums font-semibold">
          {displayDelta}
        </span>
      )}
      
      {/* Label */}
      {label && direction !== 'neutral' && (
        <span className="trend-label opacity-70 font-normal">
          {label}
        </span>
      )}
      
      {/* Neutral state label */}
      {direction === 'neutral' && (
        <span className="trend-label font-normal">
          avg
        </span>
      )}
      
      {/* Sparkle effect for positive deltas */}
      {sparkle && variant === 'positive' && isVisible && !prefersReducedMotion && (
        <span className="trend-sparkle" aria-hidden="true">
          <span className="sparkle-dot" style={{ '--i': 0 } as React.CSSProperties} />
          <span className="sparkle-dot" style={{ '--i': 1 } as React.CSSProperties} />
          <span className="sparkle-dot" style={{ '--i': 2 } as React.CSSProperties} />
        </span>
      )}
    </span>
  );
}

/**
 * TrendComparisonInline - Even more minimal inline version
 */
export function TrendComparisonInline({
  value,
  baseline,
  invertColors = false,
  className = '',
}: {
  value: number;
  baseline: number;
  invertColors?: boolean;
  className?: string;
}) {
  const delta = value - baseline;
  const absDelta = Math.abs(delta);
  
  if (absDelta < 1) {
    return <span className={`text-zinc-500 ${className}`}>—</span>;
  }
  
  const isPositive = invertColors ? delta < 0 : delta > 0;
  const icon = delta > 0 ? '↑' : '↓';
  const color = isPositive ? 'text-emerald-400 light:text-emerald-600' : 'text-red-400 light:text-red-600';
  
  return (
    <span className={`${color} font-medium tabular-nums ${className}`}>
      {icon}{Math.round(absDelta)}%
    </span>
  );
}

/**
 * useTrendBaseline - Hook to calculate baseline from historical data
 */
export function useTrendBaseline(earnings: Array<{ result?: 'beat' | 'miss' | 'met' }>) {
  return useMemo(() => {
    const reported = earnings.filter(e => e.result !== undefined);
    if (reported.length === 0) return 75; // Default baseline (typical S&P 500 beat rate)
    
    const beats = reported.filter(e => e.result === 'beat');
    return Math.round((beats.length / reported.length) * 100);
  }, [earnings]);
}

export default TrendComparison;
