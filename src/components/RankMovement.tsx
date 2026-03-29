'use client';

import { useState, useEffect, useRef, useMemo } from 'react';

type MovementDirection = 'up' | 'down' | 'same' | 'new' | 'reentry';
type MovementSize = 'xs' | 'sm' | 'md' | 'lg';

interface RankMovementProps {
  /** Current position (1-based) */
  currentRank: number;
  /** Previous position (1-based), null if new entry */
  previousRank: number | null;
  /** Size preset */
  size?: MovementSize;
  /** Show delta number alongside arrow ("+3", "−5") */
  showDelta?: boolean;
  /** Animation delay in ms */
  delay?: number;
  /** Enable entrance animation */
  animate?: boolean;
  /** Enable continuous arrow bounce animation */
  bounceArrow?: boolean;
  /** Compact mode - just arrow, no delta */
  compact?: boolean;
  /** Re-entry mode (was off chart, came back) */
  isReentry?: boolean;
  /** Custom "new" label */
  newLabel?: string;
  /** Threshold: only show if delta >= this */
  minDelta?: number;
  /** CSS class name */
  className?: string;
}

/**
 * RankMovement - Chart position change indicator
 * 
 * 2026 Design Trend: "Temporal Context" — showing how data changed over time
 * rather than just current state. Users want to understand momentum and trends
 * at a glance.
 * 
 * Inspired by:
 * - Spotify/Apple Music chart movements (↑3, ↓5, =)
 * - Sports league tables with position arrows
 * - Gaming leaderboard movements
 * - Stock screener rank changes
 * 
 * Features:
 * - Directional arrows with micro-bounce animation
 * - Delta numbers for significant movements (+12, −8)
 * - "NEW" badge for fresh entries
 * - "RE" badge for re-entries after absence
 * - Color-coded: green (up), red (down), neutral (same)
 * - Entrance animation with scale + fade
 * - Optional continuous bounce on arrow
 * - Full prefers-reduced-motion support
 * 
 * Use cases:
 * - Beat probability rank changes week-over-week
 * - Analyst consensus movement on watchlist
 * - Sector leaderboard position shifts
 * - "Most anticipated earnings" ranking changes
 */
export function RankMovement({
  currentRank,
  previousRank,
  size = 'sm',
  showDelta = true,
  delay = 0,
  animate = true,
  bounceArrow = false,
  compact = false,
  isReentry = false,
  newLabel = 'NEW',
  minDelta = 0,
  className = '',
}: RankMovementProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate movement direction and delta
  const { direction, delta } = useMemo((): { direction: MovementDirection; delta: number } => {
    if (previousRank === null) {
      return { direction: isReentry ? 'reentry' : 'new', delta: 0 };
    }
    
    const change = previousRank - currentRank; // Positive = improved (moved up)
    
    if (change > 0) {
      return { direction: 'up', delta: change };
    } else if (change < 0) {
      return { direction: 'down', delta: Math.abs(change) };
    }
    return { direction: 'same', delta: 0 };
  }, [currentRank, previousRank, isReentry]);

  // Viewport animation trigger
  useEffect(() => {
    if (!animate) {
      setIsVisible(true);
      setHasAnimated(true);
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      setHasAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setTimeout(() => {
              setIsVisible(true);
              setHasAnimated(true);
            }, delay);
          }
        });
      },
      { threshold: 0.1, rootMargin: '20px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [animate, delay, hasAnimated]);

  // Don't render if below threshold
  if (direction !== 'new' && direction !== 'reentry' && delta < minDelta) {
    return null;
  }

  // Don't render same if not showing
  if (direction === 'same' && compact) {
    return null;
  }

  // Size configurations
  const sizeConfig = {
    xs: { fontSize: '9px', iconSize: '10px', padding: '1px 4px', gap: '2px' },
    sm: { fontSize: '10px', iconSize: '12px', padding: '2px 6px', gap: '3px' },
    md: { fontSize: '12px', iconSize: '14px', padding: '3px 8px', gap: '4px' },
    lg: { fontSize: '14px', iconSize: '18px', padding: '4px 10px', gap: '5px' },
  };

  // Direction-based styling
  const directionStyles = {
    up: {
      color: '#22c55e',
      bg: 'rgba(34, 197, 94, 0.1)',
      border: 'rgba(34, 197, 94, 0.2)',
      arrow: '↑',
      ariaLabel: `Moved up ${delta} position${delta !== 1 ? 's' : ''}`,
    },
    down: {
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.2)',
      arrow: '↓',
      ariaLabel: `Dropped ${delta} position${delta !== 1 ? 's' : ''}`,
    },
    same: {
      color: '#71717a',
      bg: 'rgba(113, 113, 122, 0.08)',
      border: 'rgba(113, 113, 122, 0.15)',
      arrow: '–',
      ariaLabel: 'Position unchanged',
    },
    new: {
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.1)',
      border: 'rgba(139, 92, 246, 0.2)',
      arrow: '★',
      ariaLabel: 'New entry',
    },
    reentry: {
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.2)',
      arrow: '↻',
      ariaLabel: 'Re-entered chart',
    },
  };

  const config = sizeConfig[size];
  const style = directionStyles[direction];

  // Arrow bounce keyframes (inline style approach)
  const bounceAnimation = bounceArrow && (direction === 'up' || direction === 'down')
    ? `rank-movement-bounce-${direction} 1s ease-in-out infinite`
    : 'none';

  return (
    <>
      {/* Keyframe injection for bounce animation */}
      <style jsx global>{`
        @keyframes rank-movement-bounce-up {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes rank-movement-bounce-down {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(2px); }
        }
      `}</style>
      
      <div
        ref={containerRef}
        className={`rank-movement ${className}`}
        role="status"
        aria-label={style.ariaLabel}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: config.gap,
          padding: config.padding,
          fontSize: config.fontSize,
          fontWeight: 600,
          fontFamily: 'var(--font-mono, ui-monospace, monospace)',
          letterSpacing: '-0.01em',
          backgroundColor: style.bg,
          border: `1px solid ${style.border}`,
          borderRadius: '4px',
          color: style.color,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'scale(1)' : 'scale(0.85)',
          transition: animate 
            ? 'opacity 0.25s ease-out, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            : 'none',
          whiteSpace: 'nowrap',
          lineHeight: 1.2,
        }}
      >
        {/* Arrow/icon */}
        <span
          style={{
            fontSize: config.iconSize,
            lineHeight: 1,
            animation: bounceAnimation,
          }}
          aria-hidden="true"
        >
          {style.arrow}
        </span>

        {/* Delta or label */}
        {direction === 'new' && !compact && (
          <span style={{ fontSize: config.fontSize }}>{newLabel}</span>
        )}
        
        {direction === 'reentry' && !compact && (
          <span style={{ fontSize: config.fontSize }}>RE</span>
        )}
        
        {showDelta && !compact && (direction === 'up' || direction === 'down') && delta > 0 && (
          <span style={{ fontSize: config.fontSize }}>
            {direction === 'up' ? '+' : '−'}{delta}
          </span>
        )}
      </div>
    </>
  );
}

/**
 * RankMovementCompact - Minimal version, just shows arrow with color
 */
export function RankMovementCompact({
  currentRank,
  previousRank,
  size = 'xs',
  delay = 0,
  className = '',
}: Pick<RankMovementProps, 'currentRank' | 'previousRank' | 'size' | 'delay' | 'className'>) {
  return (
    <RankMovement
      currentRank={currentRank}
      previousRank={previousRank}
      size={size}
      delay={delay}
      compact
      showDelta={false}
      className={className}
    />
  );
}

/**
 * RankMovementInline - For inline text usage with minimal styling
 */
interface RankMovementInlineProps {
  currentRank: number;
  previousRank: number | null;
  className?: string;
}

export function RankMovementInline({
  currentRank,
  previousRank,
  className = '',
}: RankMovementInlineProps) {
  const delta = previousRank !== null ? previousRank - currentRank : 0;
  
  if (previousRank === null) {
    return (
      <span 
        className={className}
        style={{ 
          color: '#8b5cf6', 
          fontSize: '0.85em',
          fontWeight: 500,
        }}
      >
        NEW
      </span>
    );
  }
  
  if (delta === 0) {
    return (
      <span 
        className={className}
        style={{ 
          color: '#71717a',
          fontSize: '0.85em',
        }}
      >
        –
      </span>
    );
  }
  
  return (
    <span 
      className={className}
      style={{ 
        color: delta > 0 ? '#22c55e' : '#ef4444',
        fontSize: '0.85em',
        fontWeight: 500,
      }}
    >
      {delta > 0 ? '↑' : '↓'}{Math.abs(delta)}
    </span>
  );
}

/**
 * ChartPosition - Combined rank + movement display
 * Shows "#3 ↑2" style display
 */
interface ChartPositionProps {
  currentRank: number;
  previousRank: number | null;
  total?: number;
  size?: MovementSize;
  showOrdinal?: boolean;
  delay?: number;
  className?: string;
}

export function ChartPosition({
  currentRank,
  previousRank,
  total,
  size = 'sm',
  showOrdinal = false,
  delay = 0,
  className = '',
}: ChartPositionProps) {
  const getOrdinal = (n: number): string => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const sizeConfig = {
    xs: { fontSize: '10px', gap: '4px' },
    sm: { fontSize: '11px', gap: '5px' },
    md: { fontSize: '13px', gap: '6px' },
    lg: { fontSize: '15px', gap: '8px' },
  };

  const config = sizeConfig[size];
  const rankDisplay = showOrdinal ? getOrdinal(currentRank) : `#${currentRank}`;

  return (
    <span
      className={`chart-position ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: config.gap,
        fontFamily: 'var(--font-mono, ui-monospace, monospace)',
        fontSize: config.fontSize,
        fontWeight: 600,
      }}
    >
      <span style={{ color: '#e4e4e7' }}>
        {rankDisplay}
        {total && <span style={{ opacity: 0.5 }}>/{total}</span>}
      </span>
      <RankMovement
        currentRank={currentRank}
        previousRank={previousRank}
        size={size}
        delay={delay}
        compact
        showDelta
      />
    </span>
  );
}

/**
 * Mover - Emoji-enhanced movement indicator for fun contexts
 */
interface MoverProps {
  currentRank: number;
  previousRank: number | null;
  size?: MovementSize;
  className?: string;
}

export function Mover({ currentRank, previousRank, size = 'sm', className = '' }: MoverProps) {
  const delta = previousRank !== null ? previousRank - currentRank : 0;
  
  const sizeConfig = {
    xs: { fontSize: '12px' },
    sm: { fontSize: '14px' },
    md: { fontSize: '16px' },
    lg: { fontSize: '20px' },
  };

  // Fun emoji selection based on movement magnitude
  const getEmoji = (): string => {
    if (previousRank === null) return '🆕';
    if (delta === 0) return '➖';
    if (delta >= 10) return '🚀';
    if (delta >= 5) return '🔥';
    if (delta > 0) return '📈';
    if (delta <= -10) return '💀';
    if (delta <= -5) return '📉';
    return '⬇️';
  };

  return (
    <span
      className={className}
      role="img"
      aria-label={
        previousRank === null 
          ? 'New entry' 
          : delta === 0 
            ? 'No change' 
            : `${delta > 0 ? 'Up' : 'Down'} ${Math.abs(delta)}`
      }
      style={{ fontSize: sizeConfig[size].fontSize }}
    >
      {getEmoji()}
    </span>
  );
}

export default RankMovement;
