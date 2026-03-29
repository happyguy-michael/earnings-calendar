'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import './YoYGrowthBadge.css';

/**
 * YoYGrowthBadge
 * 
 * Year-over-Year EPS growth visualization badge.
 * Shows how this quarter's EPS compares to the same quarter last year.
 * 
 * Inspiration: Bloomberg Terminal YoY comparisons, FactSet earnings views
 * 2026 trend: "Contextual data" - show the metric AND its historical context
 * 
 * Key insight: Absolute EPS numbers are meaningless without growth context.
 * A company beating estimates but showing YoY decline tells a different story
 * than one beating with strong growth.
 */

interface YoYGrowthBadgeProps {
  /** Current quarter EPS (actual if reported, estimate if pending) */
  currentEPS: number;
  /** Same quarter last year EPS */
  priorYearEPS: number;
  /** Whether this is actual (reported) or estimate (pending) */
  isActual?: boolean;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md';
  /** Show the percentage change */
  showPercent?: boolean;
  /** Show trend arrow */
  showArrow?: boolean;
  /** Animate on mount */
  animate?: boolean;
  /** Animation delay in ms */
  delay?: number;
  /** Additional class name */
  className?: string;
}

export function YoYGrowthBadge({
  currentEPS,
  priorYearEPS,
  isActual = true,
  size = 'sm',
  showPercent = true,
  showArrow = true,
  animate = true,
  delay = 0,
  className = '',
}: YoYGrowthBadgeProps) {
  const [isVisible, setIsVisible] = useState(!animate);
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Calculate YoY growth
  const { growthPercent, growthType, isSignificant, intensityClass } = useMemo(() => {
    if (priorYearEPS === 0) {
      // Handle edge case - can't calculate percentage from zero
      if (currentEPS > 0) return { growthPercent: 100, growthType: 'turnaround' as const, isSignificant: true, intensityClass: 'extreme' };
      if (currentEPS < 0) return { growthPercent: -100, growthType: 'decline' as const, isSignificant: true, intensityClass: 'extreme' };
      return { growthPercent: 0, growthType: 'flat' as const, isSignificant: false, intensityClass: 'neutral' };
    }

    const percent = ((currentEPS - priorYearEPS) / Math.abs(priorYearEPS)) * 100;
    
    // Determine growth type
    let growthType: 'strong-growth' | 'growth' | 'flat' | 'decline' | 'strong-decline' | 'turnaround';
    if (percent >= 50) growthType = 'strong-growth';
    else if (percent >= 10) growthType = 'growth';
    else if (percent >= -10) growthType = 'flat';
    else if (percent >= -30) growthType = 'decline';
    else if (priorYearEPS < 0 && currentEPS > 0) growthType = 'turnaround';
    else growthType = 'strong-decline';

    // Determine intensity for visual weight
    let intensityClass: 'extreme' | 'high' | 'moderate' | 'neutral';
    const absPercent = Math.abs(percent);
    if (absPercent >= 50) intensityClass = 'extreme';
    else if (absPercent >= 25) intensityClass = 'high';
    else if (absPercent >= 10) intensityClass = 'moderate';
    else intensityClass = 'neutral';

    const isSignificant = Math.abs(percent) >= 15;

    return { growthPercent: percent, growthType, isSignificant, intensityClass };
  }, [currentEPS, priorYearEPS]);

  // Format percentage for display
  const formatPercent = (val: number) => {
    if (val >= 1000 || val <= -1000) return val > 0 ? '>999%' : '<-999%';
    if (Math.abs(val) >= 100) return `${val > 0 ? '+' : ''}${Math.round(val)}%`;
    return `${val > 0 ? '+' : ''}${val.toFixed(1)}%`;
  };

  // Intersection observer for entrance animation
  useEffect(() => {
    if (!animate) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          const timer = setTimeout(() => setIsVisible(true), delay);
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [animate, delay, isVisible]);

  // Get arrow character based on growth
  const getArrow = () => {
    if (growthPercent > 5) return '↑';
    if (growthPercent < -5) return '↓';
    return '→';
  };

  // Get accessibility label
  const getAriaLabel = () => {
    const direction = growthPercent > 0 ? 'up' : growthPercent < 0 ? 'down' : 'unchanged';
    const actualStr = isActual ? 'actual' : 'estimated';
    return `Year-over-year ${actualStr} EPS ${direction} ${Math.abs(growthPercent).toFixed(1)}%`;
  };

  return (
    <div
      ref={ref}
      className={`
        yoy-growth-badge
        yoy-growth-badge--${size}
        yoy-growth-badge--${growthType}
        yoy-growth-badge--intensity-${intensityClass}
        ${isActual ? 'yoy-growth-badge--actual' : 'yoy-growth-badge--estimate'}
        ${isSignificant ? 'is-significant' : ''}
        ${isVisible ? 'is-visible' : ''}
        ${isHovered ? 'is-hovered' : ''}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="img"
      aria-label={getAriaLabel()}
    >
      <span className="yoy-growth-badge__label">YoY</span>
      
      {showArrow && (
        <span className="yoy-growth-badge__arrow">{getArrow()}</span>
      )}
      
      {showPercent && (
        <span className="yoy-growth-badge__value">
          {formatPercent(growthPercent)}
        </span>
      )}
      
      {/* Glow effect for significant changes */}
      {isSignificant && (
        <div className="yoy-growth-badge__glow" />
      )}
      
      {/* Hover tooltip showing context */}
      {isHovered && (
        <div className="yoy-growth-badge__tooltip">
          <div className="yoy-growth-badge__tooltip-row">
            <span>This Q:</span>
            <span>${currentEPS.toFixed(2)}{!isActual && ' (est)'}</span>
          </div>
          <div className="yoy-growth-badge__tooltip-row">
            <span>Last Year:</span>
            <span>${priorYearEPS.toFixed(2)}</span>
          </div>
          <div className="yoy-growth-badge__tooltip-row yoy-growth-badge__tooltip-row--delta">
            <span>Change:</span>
            <span className={growthPercent >= 0 ? 'positive' : 'negative'}>
              {formatPercent(growthPercent)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * YoYGrowthCompact
 * 
 * Ultra-compact version for inline use in earnings cards.
 * Just shows arrow and percentage.
 */
export function YoYGrowthCompact({
  currentEPS,
  priorYearEPS,
  isActual = true,
  delay = 0,
  className = '',
}: Pick<YoYGrowthBadgeProps, 'currentEPS' | 'priorYearEPS' | 'isActual' | 'delay' | 'className'>) {
  return (
    <YoYGrowthBadge
      currentEPS={currentEPS}
      priorYearEPS={priorYearEPS}
      isActual={isActual}
      size="xs"
      showPercent={true}
      showArrow={true}
      animate={true}
      delay={delay}
      className={className}
    />
  );
}

/**
 * YoYGrowthPill
 * 
 * Pill-shaped variant showing just the direction (positive/negative/flat).
 * Good for dense list views where full percentage isn't needed.
 */
export function YoYGrowthPill({
  currentEPS,
  priorYearEPS,
  className = '',
}: Pick<YoYGrowthBadgeProps, 'currentEPS' | 'priorYearEPS' | 'className'>) {
  const growthPercent = priorYearEPS !== 0
    ? ((currentEPS - priorYearEPS) / Math.abs(priorYearEPS)) * 100
    : currentEPS > 0 ? 100 : currentEPS < 0 ? -100 : 0;

  const direction = growthPercent > 5 ? 'up' : growthPercent < -5 ? 'down' : 'flat';

  return (
    <span
      className={`yoy-growth-pill yoy-growth-pill--${direction} ${className}`}
      title={`YoY: ${growthPercent >= 0 ? '+' : ''}${growthPercent.toFixed(1)}%`}
    >
      {direction === 'up' && '▲'}
      {direction === 'down' && '▼'}
      {direction === 'flat' && '●'}
    </span>
  );
}

/**
 * YoYTrendLine
 * 
 * Mini trend line showing last 4 quarters of YoY growth.
 * Provides richer context than a single number.
 */
interface YoYTrendLineProps {
  /** Array of last 4 quarters [oldest, ..., newest] */
  quarters: { currentEPS: number; priorYearEPS: number }[];
  /** Size variant */
  size?: 'sm' | 'md';
  /** Show dot markers */
  showDots?: boolean;
  /** Additional class name */
  className?: string;
}

export function YoYTrendLine({
  quarters,
  size = 'sm',
  showDots = true,
  className = '',
}: YoYTrendLineProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Calculate growth percentages
  const growths = useMemo(() => 
    quarters.map(q => {
      if (q.priorYearEPS === 0) return q.currentEPS > 0 ? 100 : q.currentEPS < 0 ? -100 : 0;
      return ((q.currentEPS - q.priorYearEPS) / Math.abs(q.priorYearEPS)) * 100;
    }),
    [quarters]
  );

  // Normalize to 0-100 range for SVG
  const maxAbs = Math.max(...growths.map(Math.abs), 50); // Min 50% scale
  const normalizedPoints = growths.map(g => 50 - (g / maxAbs) * 40); // Invert so positive is up

  // Generate SVG path
  const width = size === 'md' ? 64 : 48;
  const height = size === 'md' ? 24 : 16;
  const points = normalizedPoints.map((y, i) => ({
    x: (i / (normalizedPoints.length - 1)) * width,
    y: (y / 100) * height,
  }));

  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cpX = (prev.x + p.x) / 2;
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${p.y}, ${p.x} ${p.y}`;
  }, '');

  // Determine overall trend
  const avgGrowth = growths.reduce((a, b) => a + b, 0) / growths.length;
  const trendClass = avgGrowth > 10 ? 'positive' : avgGrowth < -10 ? 'negative' : 'neutral';

  // Intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`yoy-trend-line yoy-trend-line--${size} yoy-trend-line--${trendClass} ${isVisible ? 'is-visible' : ''} ${className}`}
      role="img"
      aria-label={`YoY trend: ${growths.map(g => `${g > 0 ? '+' : ''}${g.toFixed(0)}%`).join(', ')}`}
    >
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {/* Zero line */}
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          className="yoy-trend-line__zero"
        />
        
        {/* Gradient fill under line */}
        <defs>
          <linearGradient id={`yoy-gradient-${trendClass}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={trendClass === 'positive' ? '#22c55e' : trendClass === 'negative' ? '#ef4444' : '#a1a1aa'} stopOpacity="0.3" />
            <stop offset="100%" stopColor={trendClass === 'positive' ? '#22c55e' : trendClass === 'negative' ? '#ef4444' : '#a1a1aa'} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Area fill */}
        <path
          d={`${pathD} L ${width} ${height / 2} L 0 ${height / 2} Z`}
          className="yoy-trend-line__fill"
          fill={`url(#yoy-gradient-${trendClass})`}
        />
        
        {/* Main line */}
        <path
          d={pathD}
          className="yoy-trend-line__path"
        />
        
        {/* Dot markers */}
        {showDots && points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={size === 'md' ? 2.5 : 2}
            className={`yoy-trend-line__dot ${i === points.length - 1 ? 'yoy-trend-line__dot--current' : ''}`}
          />
        ))}
      </svg>
      
      {/* Label */}
      <span className="yoy-trend-line__label">YoY</span>
    </div>
  );
}

/**
 * Hook to calculate YoY growth from earnings data
 */
export function useYoYGrowth(currentEPS: number | undefined, priorYearEPS: number | undefined) {
  return useMemo(() => {
    if (currentEPS === undefined || priorYearEPS === undefined) {
      return { growthPercent: undefined, growthType: undefined };
    }

    if (priorYearEPS === 0) {
      if (currentEPS > 0) return { growthPercent: 100, growthType: 'turnaround' as const };
      if (currentEPS < 0) return { growthPercent: -100, growthType: 'decline' as const };
      return { growthPercent: 0, growthType: 'flat' as const };
    }

    const percent = ((currentEPS - priorYearEPS) / Math.abs(priorYearEPS)) * 100;
    
    let growthType: 'strong-growth' | 'growth' | 'flat' | 'decline' | 'strong-decline';
    if (percent >= 30) growthType = 'strong-growth';
    else if (percent >= 10) growthType = 'growth';
    else if (percent >= -10) growthType = 'flat';
    else if (percent >= -30) growthType = 'decline';
    else growthType = 'strong-decline';

    return { growthPercent: percent, growthType };
  }, [currentEPS, priorYearEPS]);
}

export default YoYGrowthBadge;
