'use client';

import { memo, useMemo, useState, useEffect } from 'react';

/**
 * EarningsDensityBadge - Visual indicator showing day activity level
 * 
 * Helps traders quickly identify which days have the most earnings activity.
 * Shows "Busy Day" 🔥 for high-density days, "Light Day" for low activity,
 * and relative indicators for days in between.
 * 
 * 2026 UX Trend: "Information density at-a-glance" - reducing cognitive load
 * by surfacing key insights without requiring manual counting.
 * 
 * Features:
 * - Animated intensity flames for busy days
 * - Gradient background matching activity level
 * - Smooth pulse animation on hover
 * - Tooltip with exact count vs average
 * - Respects prefers-reduced-motion
 * - Light/dark mode support
 * 
 * Inspired by: Robinhood market heat, Bloomberg Terminal activity indicators
 */

export type DensityLevel = 'quiet' | 'light' | 'normal' | 'busy' | 'packed';

interface EarningsDensityBadgeProps {
  /** Number of earnings on this day */
  count: number;
  /** Average daily count for the week */
  weekAverage: number;
  /** Whether this is today */
  isToday?: boolean;
  /** Optional size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show count number */
  showCount?: boolean;
  /** Custom className */
  className?: string;
}

export const EarningsDensityBadge = memo(function EarningsDensityBadge({
  count,
  weekAverage,
  isToday = false,
  size = 'md',
  showCount = true,
  className = '',
}: EarningsDensityBadgeProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Calculate density level
  const { level, label, emoji, multiplier } = useMemo(() => {
    if (count === 0) {
      return { level: 'quiet' as DensityLevel, label: 'No Reports', emoji: '💤', multiplier: 0 };
    }
    
    const ratio = weekAverage > 0 ? count / weekAverage : 1;
    
    if (ratio >= 2.0) {
      return { level: 'packed' as DensityLevel, label: 'Packed Day', emoji: '🔥', multiplier: ratio };
    }
    if (ratio >= 1.5) {
      return { level: 'busy' as DensityLevel, label: 'Busy Day', emoji: '📈', multiplier: ratio };
    }
    if (ratio >= 0.8) {
      return { level: 'normal' as DensityLevel, label: 'Normal', emoji: '', multiplier: ratio };
    }
    if (ratio >= 0.3) {
      return { level: 'light' as DensityLevel, label: 'Light Day', emoji: '🌙', multiplier: ratio };
    }
    return { level: 'quiet' as DensityLevel, label: 'Quiet Day', emoji: '✨', multiplier: ratio };
  }, [count, weekAverage]);

  // Size classes
  const sizeClasses = {
    sm: 'text-[9px] px-1.5 py-0.5 gap-0.5',
    md: 'text-[10px] px-2 py-0.5 gap-1',
    lg: 'text-xs px-2.5 py-1 gap-1.5',
  };

  // Only show badge for non-normal days
  if (level === 'normal' && !isToday) {
    return null;
  }

  // Generate tooltip text
  const tooltipText = `${count} earnings (${weekAverage.toFixed(1)} avg/day)${
    multiplier > 1 ? ` — ${multiplier.toFixed(1)}× busier than average` : 
    multiplier < 1 && multiplier > 0 ? ` — ${((1 - multiplier) * 100).toFixed(0)}% lighter than average` : ''
  }`;

  return (
    <div
      className={`earnings-density-badge density-${level} ${sizeClasses[size]} ${className}`}
      title={tooltipText}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="status"
      aria-label={`${label}: ${count} earnings`}
    >
      {/* Animated background glow for busy/packed days */}
      {(level === 'busy' || level === 'packed') && !prefersReducedMotion && (
        <div className="density-glow" />
      )}

      {/* Flame animation for packed days */}
      {level === 'packed' && !prefersReducedMotion && (
        <div className="density-flames">
          <div className="flame flame-1" />
          <div className="flame flame-2" />
          <div className="flame flame-3" />
        </div>
      )}

      {/* Content */}
      <span className="density-content">
        {emoji && <span className="density-emoji">{emoji}</span>}
        {showCount && level !== 'quiet' && (
          <span className="density-count">{count}</span>
        )}
        {(level === 'busy' || level === 'packed') && (
          <span className="density-label">{level === 'packed' ? 'Packed' : 'Busy'}</span>
        )}
        {(level === 'light' || level === 'quiet') && (
          <span className="density-label">{level === 'quiet' ? 'None' : 'Light'}</span>
        )}
      </span>

      {/* Activity bar */}
      {level !== 'quiet' && (
        <div className="density-bar-container">
          <div 
            className="density-bar-fill"
            style={{
              width: `${Math.min(100, multiplier * 50)}%`,
            }}
          />
        </div>
      )}

      <style jsx>{`
        .earnings-density-badge {
          position: relative;
          display: inline-flex;
          align-items: center;
          border-radius: 9999px;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
          backdrop-filter: blur(4px);
          transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
          overflow: hidden;
          white-space: nowrap;
        }

        /* Level-specific styling */
        .density-quiet {
          background: rgba(113, 113, 122, 0.15);
          border: 1px solid rgba(113, 113, 122, 0.2);
          color: #a1a1aa;
        }

        .density-light {
          background: rgba(139, 92, 246, 0.12);
          border: 1px solid rgba(139, 92, 246, 0.2);
          color: #a78bfa;
        }

        .density-normal {
          background: rgba(59, 130, 246, 0.12);
          border: 1px solid rgba(59, 130, 246, 0.2);
          color: #60a5fa;
        }

        .density-busy {
          background: linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(245, 158, 11, 0.2) 100%);
          border: 1px solid rgba(251, 146, 60, 0.3);
          color: #fbbf24;
        }

        .density-packed {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(251, 146, 60, 0.2) 100%);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #fca5a5;
        }

        /* Hover effects */
        .earnings-density-badge:hover {
          transform: scale(1.03);
        }

        .density-busy:hover,
        .density-packed:hover {
          box-shadow: 0 0 12px rgba(251, 146, 60, 0.3);
        }

        /* Glow effect for busy/packed */
        .density-glow {
          position: absolute;
          inset: -2px;
          border-radius: inherit;
          background: radial-gradient(circle at center, rgba(251, 146, 60, 0.3) 0%, transparent 70%);
          animation: densityPulse 2s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes densityPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }

        /* Flame animations for packed days */
        .density-flames {
          position: absolute;
          left: -2px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          gap: 1px;
          pointer-events: none;
        }

        .flame {
          width: 4px;
          height: 8px;
          border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
          background: linear-gradient(to top, #f97316 0%, #fbbf24 50%, #fef3c7 100%);
          animation: flicker 0.3s ease-in-out infinite alternate;
          opacity: 0.8;
        }

        .flame-1 { animation-delay: 0s; }
        .flame-2 { animation-delay: 0.1s; height: 10px; }
        .flame-3 { animation-delay: 0.2s; }

        @keyframes flicker {
          0% { transform: scaleY(1) scaleX(1); }
          100% { transform: scaleY(1.15) scaleX(0.9); }
        }

        /* Content styling */
        .density-content {
          display: flex;
          align-items: center;
          gap: inherit;
          position: relative;
          z-index: 1;
        }

        .density-emoji {
          font-size: 1em;
          line-height: 1;
        }

        .density-count {
          font-weight: 700;
        }

        .density-label {
          text-transform: uppercase;
          letter-spacing: 0.03em;
          opacity: 0.9;
        }

        /* Activity bar */
        .density-bar-container {
          position: absolute;
          bottom: 1px;
          left: 4px;
          right: 4px;
          height: 2px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 1px;
          overflow: hidden;
        }

        .density-bar-fill {
          height: 100%;
          border-radius: 1px;
          transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .density-quiet .density-bar-fill {
          background: #71717a;
        }

        .density-light .density-bar-fill {
          background: linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%);
        }

        .density-normal .density-bar-fill {
          background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
        }

        .density-busy .density-bar-fill {
          background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
        }

        .density-packed .density-bar-fill {
          background: linear-gradient(90deg, #ef4444 0%, #f97316 50%, #fbbf24 100%);
        }

        /* Light mode */
        :global(html.light) .density-quiet {
          background: rgba(113, 113, 122, 0.1);
          color: #71717a;
        }

        :global(html.light) .density-light {
          background: rgba(139, 92, 246, 0.1);
          color: #7c3aed;
        }

        :global(html.light) .density-normal {
          background: rgba(59, 130, 246, 0.1);
          color: #2563eb;
        }

        :global(html.light) .density-busy {
          background: linear-gradient(135deg, rgba(251, 146, 60, 0.12) 0%, rgba(245, 158, 11, 0.15) 100%);
          color: #d97706;
        }

        :global(html.light) .density-packed {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(251, 146, 60, 0.15) 100%);
          color: #dc2626;
        }

        :global(html.light) .density-bar-container {
          background: rgba(0, 0, 0, 0.08);
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .earnings-density-badge {
            transition: none;
          }
          .density-glow,
          .flame {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
});

/**
 * Compact inline variant for use in headers
 */
export const DensityIndicator = memo(function DensityIndicator({
  count,
  weekAverage,
  className = '',
}: {
  count: number;
  weekAverage: number;
  className?: string;
}) {
  const ratio = weekAverage > 0 ? count / weekAverage : 1;
  
  // Determine indicator style
  const getIndicator = () => {
    if (count === 0) return { icon: '·', color: '#71717a' };
    if (ratio >= 2.0) return { icon: '▲▲', color: '#ef4444' };
    if (ratio >= 1.5) return { icon: '▲', color: '#f59e0b' };
    if (ratio <= 0.3) return { icon: '▽', color: '#8b5cf6' };
    if (ratio <= 0.6) return { icon: '·', color: '#a1a1aa' };
    return { icon: '', color: 'transparent' };
  };

  const { icon, color } = getIndicator();

  if (!icon) return null;

  return (
    <span
      className={`density-indicator ${className}`}
      style={{ color }}
      title={`${count} earnings (${weekAverage.toFixed(1)} avg)`}
    >
      {icon}
      <style jsx>{`
        .density-indicator {
          font-size: 8px;
          font-weight: 700;
          opacity: 0.8;
          margin-left: 4px;
        }
      `}</style>
    </span>
  );
});

/**
 * Hook to calculate week density stats
 */
export function useWeekDensity(earningsByDay: number[]): {
  average: number;
  busiest: number;
  busiestIndex: number;
  lightest: number;
  lightestIndex: number;
} {
  return useMemo(() => {
    const nonZeroDays = earningsByDay.filter(c => c > 0);
    const average = nonZeroDays.length > 0 
      ? nonZeroDays.reduce((a, b) => a + b, 0) / nonZeroDays.length 
      : 0;
    
    let busiest = 0;
    let busiestIndex = 0;
    let lightest = Infinity;
    let lightestIndex = 0;

    earningsByDay.forEach((count, index) => {
      if (count > busiest) {
        busiest = count;
        busiestIndex = index;
      }
      if (count < lightest && count > 0) {
        lightest = count;
        lightestIndex = index;
      }
    });

    return {
      average,
      busiest,
      busiestIndex,
      lightest: lightest === Infinity ? 0 : lightest,
      lightestIndex,
    };
  }, [earningsByDay]);
}

export default EarningsDensityBadge;
