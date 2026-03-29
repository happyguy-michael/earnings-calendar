'use client';

import { useState, useEffect, useRef, useMemo, memo } from 'react';

/**
 * VolatilityIndicator
 * 
 * Shows the historical earnings volatility for a stock.
 * Earnings volatility = typical price move magnitude after earnings reports.
 * 
 * Inspiration:
 * - Bloomberg Terminal's implied volatility gauges
 * - Options pricing volatility indicators (IV rank/percentile)
 * - Trading platform "Expected Move" displays
 * - Market Chameleon earnings volatility metrics
 * 
 * 2026 Design Trends:
 * - Risk visualization through visual density/intensity
 * - Animated wave patterns for dynamic data
 * - Subtle but informative micro-badges
 * - Contextual coloring (calm=blue, volatile=orange/red)
 * 
 * Why this matters:
 * Not all earnings are equal. NVDA might move 10% post-earnings while
 * PG moves 2%. Knowing the typical volatility helps traders:
 * - Size positions appropriately
 * - Set realistic profit/loss expectations
 * - Choose between stock and options strategies
 * 
 * @example
 * <VolatilityIndicator ticker="NVDA" size="sm" />
 * <VolatilityIndicator ticker="PG" size="xs" showLabel />
 */

type VolatilityLevel = 'low' | 'moderate' | 'high' | 'extreme';

interface VolatilityIndicatorProps {
  /** Stock ticker symbol */
  ticker: string;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md';
  /** Show text label */
  showLabel?: boolean;
  /** Show percentage range */
  showRange?: boolean;
  /** Animation delay in ms */
  delay?: number;
  /** Enable animated wave effect */
  animated?: boolean;
  /** Custom className */
  className?: string;
}

// Volatility data simulation based on ticker characteristics
// In production, this would come from historical options/price data
function getVolatilityMetrics(ticker: string): { 
  level: VolatilityLevel;
  avgMove: number;  // Average post-earnings move %
  maxMove: number;  // Max historical move %
  ivRank: number;   // IV percentile 0-100
} {
  // Hash-based pseudo-random for consistent results per ticker
  let hash = 0;
  for (let i = 0; i < ticker.length; i++) {
    hash = ((hash << 5) - hash) + ticker.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash);
  
  // Known high-volatility tickers (tech, meme, growth)
  const highVolTickers = ['NVDA', 'TSLA', 'AMD', 'GME', 'AMC', 'COIN', 'MSTR', 'ARM', 'SMCI', 'PLTR', 'RIVN', 'LCID', 'SNOW', 'NET', 'CRWD', 'ZS', 'DDOG', 'MDB'];
  const extremeVolTickers = ['GME', 'AMC', 'MSTR', 'COIN'];
  const lowVolTickers = ['PG', 'JNJ', 'KO', 'PEP', 'WMT', 'VZ', 'T', 'SO', 'DUK', 'XOM', 'CVX', 'MCD', 'HD', 'LOW'];
  
  // Determine base volatility
  let avgMove: number;
  let level: VolatilityLevel;
  
  if (extremeVolTickers.includes(ticker)) {
    avgMove = 12 + (seed % 10);  // 12-22%
    level = 'extreme';
  } else if (highVolTickers.includes(ticker)) {
    avgMove = 7 + (seed % 6);    // 7-13%
    level = 'high';
  } else if (lowVolTickers.includes(ticker)) {
    avgMove = 1.5 + (seed % 200) / 100;  // 1.5-3.5%
    level = 'low';
  } else {
    // Default: moderate volatility based on hash
    avgMove = 3 + (seed % 500) / 100;  // 3-8%
    level = avgMove > 5.5 ? 'high' : avgMove > 3.5 ? 'moderate' : 'low';
  }
  
  // Calculate max move (typically 1.5-2.5x average)
  const maxMultiplier = 1.5 + (seed % 100) / 100;
  const maxMove = avgMove * maxMultiplier;
  
  // IV rank simulates where current IV is vs historical range
  const ivRank = 20 + (seed % 60);  // 20-80 typical range
  
  return { level, avgMove, maxMove, ivRank };
}

// Visual configuration per volatility level
const levelConfig: Record<VolatilityLevel, {
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  barCount: number;
  description: string;
}> = {
  low: {
    label: 'Low Volatility',
    shortLabel: 'Low Vol',
    color: '#22d3ee',        // Cyan
    bgColor: 'rgba(34, 211, 238, 0.12)',
    borderColor: 'rgba(34, 211, 238, 0.25)',
    glowColor: 'rgba(34, 211, 238, 0.3)',
    barCount: 1,
    description: 'Typically calm around earnings',
  },
  moderate: {
    label: 'Moderate Volatility',
    shortLabel: 'Mod Vol',
    color: '#60a5fa',        // Blue
    bgColor: 'rgba(96, 165, 250, 0.12)',
    borderColor: 'rgba(96, 165, 250, 0.25)',
    glowColor: 'rgba(96, 165, 250, 0.3)',
    barCount: 2,
    description: 'Average earnings movement',
  },
  high: {
    label: 'High Volatility',
    shortLabel: 'High Vol',
    color: '#f97316',        // Orange
    bgColor: 'rgba(249, 115, 22, 0.12)',
    borderColor: 'rgba(249, 115, 22, 0.3)',
    glowColor: 'rgba(249, 115, 22, 0.35)',
    barCount: 3,
    description: 'Expect significant price swings',
  },
  extreme: {
    label: 'Extreme Volatility',
    shortLabel: 'Extreme',
    color: '#ef4444',        // Red
    bgColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
    glowColor: 'rgba(239, 68, 68, 0.4)',
    barCount: 4,
    description: 'Major price moves expected',
  },
};

export const VolatilityIndicator = memo(function VolatilityIndicator({
  ticker,
  size = 'sm',
  showLabel = false,
  showRange = false,
  delay = 0,
  animated = true,
  className = '',
}: VolatilityIndicatorProps) {
  const [isVisible, setIsVisible] = useState(!animated);
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Calculate volatility metrics
  const metrics = useMemo(() => getVolatilityMetrics(ticker), [ticker]);
  const config = levelConfig[metrics.level];

  // Intersection observer for entrance animation
  useEffect(() => {
    if (!animated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          const timer = setTimeout(() => setIsVisible(true), delay);
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [animated, delay, isVisible]);

  // Size-specific dimensions
  const sizeConfig = {
    xs: { barWidth: 2, barGap: 1, barHeight: [4, 6, 8, 10], fontSize: '9px', padding: '2px 4px' },
    sm: { barWidth: 3, barGap: 1.5, barHeight: [5, 8, 11, 14], fontSize: '10px', padding: '3px 6px' },
    md: { barWidth: 4, barGap: 2, barHeight: [6, 10, 14, 18], fontSize: '11px', padding: '4px 8px' },
  };
  const sz = sizeConfig[size];

  // Accessibility label
  const ariaLabel = `${config.label}: Average ${metrics.avgMove.toFixed(1)}% post-earnings move`;

  return (
    <div
      ref={ref}
      className={`volatility-indicator volatility-indicator--${size} volatility-indicator--${metrics.level} ${isVisible ? 'is-visible' : ''} ${isHovered ? 'is-hovered' : ''} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="img"
      aria-label={ariaLabel}
      title={`${config.description}\nAvg move: ±${metrics.avgMove.toFixed(1)}%`}
      style={{
        '--vol-color': config.color,
        '--vol-bg': config.bgColor,
        '--vol-border': config.borderColor,
        '--vol-glow': config.glowColor,
        '--vol-font-size': sz.fontSize,
        '--vol-padding': sz.padding,
      } as React.CSSProperties}
    >
      {/* Bar visualization */}
      <div className="volatility-bars">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`volatility-bar ${i < config.barCount ? 'active' : 'inactive'}`}
            style={{
              width: sz.barWidth,
              height: sz.barHeight[i],
              animationDelay: `${delay + i * 50}ms`,
            }}
          />
        ))}
      </div>

      {/* Label */}
      {showLabel && (
        <span className="volatility-label">
          {size === 'xs' ? config.shortLabel.split(' ')[0] : config.shortLabel}
        </span>
      )}

      {/* Range badge */}
      {showRange && (
        <span className="volatility-range">
          ±{metrics.avgMove.toFixed(1)}%
        </span>
      )}

      {/* Hover tooltip */}
      {isHovered && (
        <div className="volatility-tooltip">
          <div className="volatility-tooltip__header">{config.label}</div>
          <div className="volatility-tooltip__row">
            <span>Avg Move:</span>
            <span>±{metrics.avgMove.toFixed(1)}%</span>
          </div>
          <div className="volatility-tooltip__row">
            <span>Max Move:</span>
            <span>±{metrics.maxMove.toFixed(1)}%</span>
          </div>
          <div className="volatility-tooltip__row">
            <span>IV Rank:</span>
            <span>{metrics.ivRank}%</span>
          </div>
          <div className="volatility-tooltip__desc">{config.description}</div>
        </div>
      )}
    </div>
  );
});

/**
 * VolatilityDot - Ultra-compact dot indicator for list views
 */
export const VolatilityDot = memo(function VolatilityDot({
  ticker,
  className = '',
}: Pick<VolatilityIndicatorProps, 'ticker' | 'className'>) {
  const metrics = useMemo(() => getVolatilityMetrics(ticker), [ticker]);
  const config = levelConfig[metrics.level];

  return (
    <span
      className={`volatility-dot volatility-dot--${metrics.level} ${className}`}
      title={`${config.label}: ±${metrics.avgMove.toFixed(1)}% avg move`}
      style={{ '--vol-color': config.color } as React.CSSProperties}
    />
  );
});

/**
 * VolatilityWaves - Animated wave visualization for high volatility
 */
export const VolatilityWaves = memo(function VolatilityWaves({
  ticker,
  size = 'sm',
  className = '',
}: Pick<VolatilityIndicatorProps, 'ticker' | 'size' | 'className'>) {
  const [isAnimating, setIsAnimating] = useState(false);
  const metrics = useMemo(() => getVolatilityMetrics(ticker), [ticker]);
  const config = levelConfig[metrics.level];

  // Only show waves for high/extreme volatility
  if (metrics.level !== 'high' && metrics.level !== 'extreme') {
    return null;
  }

  return (
    <div
      className={`volatility-waves volatility-waves--${size} ${isAnimating ? 'is-animating' : ''} ${className}`}
      onMouseEnter={() => setIsAnimating(true)}
      onMouseLeave={() => setIsAnimating(false)}
      title={`${config.label}: Expect big moves`}
      style={{ '--vol-color': config.color } as React.CSSProperties}
    >
      <svg viewBox="0 0 24 12" className="volatility-wave-svg">
        <path
          className="volatility-wave-path"
          d="M0 6 Q3 2, 6 6 T12 6 T18 6 T24 6"
          fill="none"
          strokeWidth="1.5"
        />
        <path
          className="volatility-wave-path volatility-wave-path--delayed"
          d="M0 6 Q3 10, 6 6 T12 6 T18 6 T24 6"
          fill="none"
          strokeWidth="1"
          opacity="0.5"
        />
      </svg>
    </div>
  );
});

/**
 * Hook to get volatility metrics for programmatic use
 */
export function useVolatility(ticker: string) {
  return useMemo(() => getVolatilityMetrics(ticker), [ticker]);
}

export default VolatilityIndicator;
