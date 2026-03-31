'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Earning } from '@/lib/types';

interface WeekData {
  weekStart: string;
  total: number;
  beats: number;
  misses: number;
  beatRate: number;
}

interface WeekOverWeekTrendProps {
  earnings: Earning[];
  currentWeekStart: string;
  weeksToCompare?: number;
  className?: string;
}

/**
 * WeekOverWeekTrend - Shows trend comparison across recent weeks
 * Displays sparkline of beat rates with current week highlighted
 */
export function WeekOverWeekTrend({
  earnings,
  currentWeekStart,
  weeksToCompare = 4,
  className = '',
}: WeekOverWeekTrendProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Group earnings by week and calculate stats
  const weeklyData = useMemo(() => {
    const weeks: Map<string, WeekData> = new Map();
    
    earnings.forEach((e) => {
      if (!e.result) return; // Only count reported earnings
      
      const date = new Date(e.date);
      const dayOfWeek = date.getDay();
      const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const weekStart = new Date(date.setDate(diff)).toISOString().split('T')[0];
      
      if (!weeks.has(weekStart)) {
        weeks.set(weekStart, { weekStart, total: 0, beats: 0, misses: 0, beatRate: 0 });
      }
      
      const week = weeks.get(weekStart)!;
      week.total++;
      if (e.result === 'beat') week.beats++;
      if (e.result === 'miss') week.misses++;
      week.beatRate = week.total > 0 ? (week.beats / week.total) * 100 : 0;
    });
    
    return Array.from(weeks.values())
      .filter(w => w.total >= 3) // Only weeks with meaningful data
      .sort((a, b) => b.weekStart.localeCompare(a.weekStart))
      .slice(0, weeksToCompare);
  }, [earnings, weeksToCompare]);

  // Find current week data and calculate trend
  const currentWeek = weeklyData.find(w => w.weekStart === currentWeekStart);
  const previousWeeks = weeklyData.filter(w => w.weekStart < currentWeekStart);
  
  const avgBeatRate = previousWeeks.length > 0
    ? previousWeeks.reduce((sum, w) => sum + w.beatRate, 0) / previousWeeks.length
    : 0;
  
  const trend = currentWeek 
    ? currentWeek.beatRate - avgBeatRate
    : 0;

  // Intersection observer for entrance animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  // Don't render if not enough data
  if (weeklyData.length < 2 || !currentWeek) {
    return null;
  }

  const trendDirection = trend > 2 ? 'up' : trend < -2 ? 'down' : 'flat';
  const trendColor = trendDirection === 'up' ? '#10b981' : trendDirection === 'down' ? '#ef4444' : '#6b7280';

  return (
    <div
      ref={containerRef}
      className={`week-over-week-trend ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="group"
      aria-label={`Week over week trend: ${trendDirection === 'up' ? 'improving' : trendDirection === 'down' ? 'declining' : 'stable'}`}
    >
      <div className="trend-container">
        {/* Mini sparkline */}
        <div className="sparkline">
          {weeklyData.slice().reverse().map((week, i) => {
            const height = Math.max(20, Math.min(100, week.beatRate));
            const isCurrent = week.weekStart === currentWeekStart;
            
            return (
              <div
                key={week.weekStart}
                className={`spark-bar ${isCurrent ? 'current' : ''}`}
                style={{
                  height: `${height}%`,
                  animationDelay: `${i * 100}ms`,
                  opacity: isVisible ? 1 : 0,
                  backgroundColor: isCurrent 
                    ? (week.beatRate >= 70 ? '#10b981' : week.beatRate >= 50 ? '#f59e0b' : '#ef4444')
                    : 'var(--spark-bar-bg)',
                }}
                title={`Week of ${week.weekStart}: ${week.beatRate.toFixed(0)}% beat rate (${week.beats}/${week.total})`}
              />
            );
          })}
        </div>

        {/* Trend indicator */}
        <div className="trend-indicator" style={{ color: trendColor }}>
          {trendDirection === 'up' && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 2L10 7H2L6 2Z" fill="currentColor" />
            </svg>
          )}
          {trendDirection === 'down' && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 10L2 5H10L6 10Z" fill="currentColor" />
            </svg>
          )}
          {trendDirection === 'flat' && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="2" y="5" width="8" height="2" fill="currentColor" rx="1" />
            </svg>
          )}
          <span className="trend-value">
            {trend > 0 ? '+' : ''}{trend.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Expanded tooltip on hover */}
      {isHovered && (
        <div className="trend-tooltip">
          <div className="tooltip-header">Week over Week</div>
          <div className="tooltip-content">
            <div className="tooltip-row">
              <span>This week:</span>
              <span className="value">{currentWeek.beatRate.toFixed(0)}%</span>
            </div>
            <div className="tooltip-row">
              <span>Avg ({previousWeeks.length}wk):</span>
              <span className="value">{avgBeatRate.toFixed(0)}%</span>
            </div>
            <div className="tooltip-row trend" style={{ color: trendColor }}>
              <span>Trend:</span>
              <span className="value">
                {trendDirection === 'up' ? '↑ Improving' : trendDirection === 'down' ? '↓ Declining' : '→ Stable'}
              </span>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .week-over-week-trend {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          background: var(--card-bg, rgba(255, 255, 255, 0.05));
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
          border-radius: 8px;
          cursor: default;
          transition: all 0.2s ease;
        }

        .week-over-week-trend:hover {
          background: var(--card-bg-hover, rgba(255, 255, 255, 0.08));
          border-color: var(--border-color-hover, rgba(255, 255, 255, 0.15));
        }

        .trend-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sparkline {
          display: flex;
          align-items: flex-end;
          gap: 3px;
          height: 24px;
          padding: 2px 0;
        }

        .spark-bar {
          width: 6px;
          min-height: 4px;
          border-radius: 2px;
          background: var(--spark-bar-bg, rgba(255, 255, 255, 0.2));
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform-origin: bottom;
        }

        .spark-bar.current {
          width: 8px;
          box-shadow: 0 0 8px currentColor;
        }

        .trend-indicator {
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: 11px;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
        }

        .trend-value {
          min-width: 32px;
        }

        .trend-tooltip {
          position: absolute;
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          background: var(--tooltip-bg, rgba(0, 0, 0, 0.9));
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
          border-radius: 8px;
          padding: 10px 12px;
          min-width: 160px;
          z-index: 100;
          animation: tooltip-enter 0.2s ease;
          backdrop-filter: blur(8px);
        }

        @keyframes tooltip-enter {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .tooltip-header {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted, rgba(255, 255, 255, 0.5));
          margin-bottom: 8px;
          padding-bottom: 6px;
          border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
        }

        .tooltip-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .tooltip-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: var(--text-secondary, rgba(255, 255, 255, 0.7));
        }

        .tooltip-row .value {
          font-weight: 600;
          color: var(--text-primary, #fff);
          font-variant-numeric: tabular-nums;
        }

        .tooltip-row.trend {
          margin-top: 4px;
          padding-top: 6px;
          border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
        }

        .tooltip-row.trend .value {
          color: inherit;
        }

        /* Light mode */
        :global(.light) .week-over-week-trend {
          --card-bg: rgba(0, 0, 0, 0.03);
          --card-bg-hover: rgba(0, 0, 0, 0.05);
          --border-color: rgba(0, 0, 0, 0.08);
          --border-color-hover: rgba(0, 0, 0, 0.12);
          --spark-bar-bg: rgba(0, 0, 0, 0.15);
          --tooltip-bg: rgba(255, 255, 255, 0.95);
          --text-muted: rgba(0, 0, 0, 0.4);
          --text-secondary: rgba(0, 0, 0, 0.6);
          --text-primary: #000;
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .spark-bar,
          .trend-tooltip {
            animation: none;
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * WeekOverWeekBadge - Ultra-compact version for inline use
 */
export function WeekOverWeekBadge({
  earnings,
  currentWeekStart,
  className = '',
}: Omit<WeekOverWeekTrendProps, 'weeksToCompare'>) {
  const weeklyData = useMemo(() => {
    const weeks: Map<string, WeekData> = new Map();
    
    earnings.forEach((e) => {
      if (!e.result) return;
      
      const date = new Date(e.date);
      const dayOfWeek = date.getDay();
      const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const weekStart = new Date(date.setDate(diff)).toISOString().split('T')[0];
      
      if (!weeks.has(weekStart)) {
        weeks.set(weekStart, { weekStart, total: 0, beats: 0, misses: 0, beatRate: 0 });
      }
      
      const week = weeks.get(weekStart)!;
      week.total++;
      if (e.result === 'beat') week.beats++;
      if (e.result === 'miss') week.misses++;
      week.beatRate = week.total > 0 ? (week.beats / week.total) * 100 : 0;
    });
    
    return Array.from(weeks.values())
      .filter(w => w.total >= 3)
      .sort((a, b) => b.weekStart.localeCompare(a.weekStart))
      .slice(0, 4);
  }, [earnings]);

  const currentWeek = weeklyData.find(w => w.weekStart === currentWeekStart);
  const previousWeeks = weeklyData.filter(w => w.weekStart < currentWeekStart);
  
  const avgBeatRate = previousWeeks.length > 0
    ? previousWeeks.reduce((sum, w) => sum + w.beatRate, 0) / previousWeeks.length
    : 0;
  
  const trend = currentWeek ? currentWeek.beatRate - avgBeatRate : 0;

  if (weeklyData.length < 2 || !currentWeek) {
    return null;
  }

  const trendDirection = trend > 2 ? 'up' : trend < -2 ? 'down' : 'flat';

  return (
    <span 
      className={`wow-badge ${trendDirection} ${className}`}
      title={`Week over week: ${trend > 0 ? '+' : ''}${trend.toFixed(0)}% vs ${previousWeeks.length} week avg`}
    >
      {trendDirection === 'up' && '↑'}
      {trendDirection === 'down' && '↓'}
      {trendDirection === 'flat' && '→'}
      <span className="trend-num">{Math.abs(trend).toFixed(0)}%</span>

      <style jsx>{`
        .wow-badge {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
          font-variant-numeric: tabular-nums;
        }

        .wow-badge.up {
          color: #10b981;
          background: rgba(16, 185, 129, 0.1);
        }

        .wow-badge.down {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .wow-badge.flat {
          color: #6b7280;
          background: rgba(107, 114, 128, 0.1);
        }

        .trend-num {
          opacity: 0.9;
        }

        :global(.light) .wow-badge.up {
          background: rgba(16, 185, 129, 0.15);
        }

        :global(.light) .wow-badge.down {
          background: rgba(239, 68, 68, 0.15);
        }

        :global(.light) .wow-badge.flat {
          background: rgba(107, 114, 128, 0.15);
        }
      `}</style>
    </span>
  );
}

/**
 * useWeekTrend - Hook for programmatic access to week trend data
 */
export function useWeekTrend(earnings: Earning[], currentWeekStart: string) {
  return useMemo(() => {
    const weeks: Map<string, WeekData> = new Map();
    
    earnings.forEach((e) => {
      if (!e.result) return;
      
      const date = new Date(e.date);
      const dayOfWeek = date.getDay();
      const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const weekStart = new Date(date.setDate(diff)).toISOString().split('T')[0];
      
      if (!weeks.has(weekStart)) {
        weeks.set(weekStart, { weekStart, total: 0, beats: 0, misses: 0, beatRate: 0 });
      }
      
      const week = weeks.get(weekStart)!;
      week.total++;
      if (e.result === 'beat') week.beats++;
      if (e.result === 'miss') week.misses++;
      week.beatRate = week.total > 0 ? (week.beats / week.total) * 100 : 0;
    });
    
    const weeklyData = Array.from(weeks.values())
      .filter(w => w.total >= 3)
      .sort((a, b) => b.weekStart.localeCompare(a.weekStart))
      .slice(0, 4);

    const currentWeek = weeklyData.find(w => w.weekStart === currentWeekStart);
    const previousWeeks = weeklyData.filter(w => w.weekStart < currentWeekStart);
    
    const avgBeatRate = previousWeeks.length > 0
      ? previousWeeks.reduce((sum, w) => sum + w.beatRate, 0) / previousWeeks.length
      : 0;
    
    const trend = currentWeek ? currentWeek.beatRate - avgBeatRate : 0;
    const direction = trend > 2 ? 'up' : trend < -2 ? 'down' : 'flat';

    return {
      currentWeek,
      previousWeeks,
      avgBeatRate,
      trend,
      direction,
      hasData: weeklyData.length >= 2 && !!currentWeek,
    };
  }, [earnings, currentWeekStart]);
}
