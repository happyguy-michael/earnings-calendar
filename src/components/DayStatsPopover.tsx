'use client';

import { useMemo, useState } from 'react';
import { Earning } from '@/lib/types';

interface DayStatsPopoverProps {
  earnings: Earning[];
  date: Date;
  isToday: boolean;
  children: React.ReactNode;
}

interface DayStats {
  total: number;
  beats: number;
  misses: number;
  pending: number;
  avgSurprise: number | null;
  topBeat: { ticker: string; surprise: number } | null;
  topMiss: { ticker: string; surprise: number } | null;
  preMarket: number;
  afterHours: number;
}

/**
 * DayStatsPopover - Quick stats preview on day header hover
 * 
 * Features:
 * - Shows beat/miss/pending counts at a glance
 * - Displays top beat and top miss with surprise %
 * - Average surprise percentage for reported earnings
 * - Pre-market vs after-hours breakdown
 * - Smooth entrance animation with staggered rows
 * - Theme-aware glassmorphic styling
 * - Respects prefers-reduced-motion
 */
export function DayStatsPopover({ earnings, date, isToday, children }: DayStatsPopoverProps) {
  const [isHovered, setIsHovered] = useState(false);

  const stats = useMemo((): DayStats => {
    const beats = earnings.filter(e => e.result === 'beat');
    const misses = earnings.filter(e => e.result === 'miss');
    const pending = earnings.filter(e => e.eps === undefined || e.eps === null);
    const preMarket = earnings.filter(e => e.time === 'pre');
    const afterHours = earnings.filter(e => e.time === 'post');

    // Calculate surprises
    const reported = earnings.filter(e => e.eps !== undefined && e.eps !== null && e.estimate);
    const surprises = reported.map(e => {
      return ((e.eps! - e.estimate!) / Math.abs(e.estimate!)) * 100;
    });
    
    const avgSurprise = surprises.length > 0 
      ? surprises.reduce((a, b) => a + b, 0) / surprises.length 
      : null;

    // Find top beat and top miss
    let topBeat: { ticker: string; surprise: number } | null = null;
    let topMiss: { ticker: string; surprise: number } | null = null;

    beats.forEach(e => {
      if (e.estimate && e.eps !== undefined && e.eps !== null) {
        const surprise = ((e.eps - e.estimate) / Math.abs(e.estimate)) * 100;
        if (!topBeat || surprise > topBeat.surprise) {
          topBeat = { ticker: e.ticker, surprise };
        }
      }
    });

    misses.forEach(e => {
      if (e.estimate && e.eps !== undefined && e.eps !== null) {
        const surprise = ((e.eps - e.estimate) / Math.abs(e.estimate)) * 100;
        if (!topMiss || surprise < topMiss.surprise) {
          topMiss = { ticker: e.ticker, surprise };
        }
      }
    });

    return {
      total: earnings.length,
      beats: beats.length,
      misses: misses.length,
      pending: pending.length,
      avgSurprise,
      topBeat,
      topMiss,
      preMarket: preMarket.length,
      afterHours: afterHours.length,
    };
  }, [earnings]);

  // Don't show popover if no earnings
  if (earnings.length === 0) {
    return <>{children}</>;
  }

  const formatSurprise = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  return (
    <div 
      className="day-stats-popover-wrapper"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      
      <div 
        className={`day-stats-popover ${isHovered ? 'visible' : ''} ${isToday ? 'today' : ''}`}
        role="tooltip"
        aria-hidden={!isHovered}
      >
        {/* Header with date context */}
        <div className="day-stats-header">
          <span className="day-stats-date">
            {isToday ? '📅 Today' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
          <span className="day-stats-total">{stats.total} reports</span>
        </div>

        {/* Quick stats grid */}
        <div className="day-stats-grid">
          {stats.beats > 0 && (
            <div className="day-stat beat">
              <span className="day-stat-icon">📈</span>
              <span className="day-stat-value">{stats.beats}</span>
              <span className="day-stat-label">Beat{stats.beats > 1 ? 's' : ''}</span>
            </div>
          )}
          {stats.misses > 0 && (
            <div className="day-stat miss">
              <span className="day-stat-icon">📉</span>
              <span className="day-stat-value">{stats.misses}</span>
              <span className="day-stat-label">Miss{stats.misses > 1 ? 'es' : ''}</span>
            </div>
          )}
          {stats.pending > 0 && (
            <div className="day-stat pending">
              <span className="day-stat-icon">⏳</span>
              <span className="day-stat-value">{stats.pending}</span>
              <span className="day-stat-label">Pending</span>
            </div>
          )}
        </div>

        {/* Session breakdown */}
        <div className="day-stats-sessions">
          {stats.preMarket > 0 && (
            <span className="session-tag pre">
              ☀️ {stats.preMarket} pre-market
            </span>
          )}
          {stats.afterHours > 0 && (
            <span className="session-tag post">
              🌙 {stats.afterHours} after hours
            </span>
          )}
        </div>

        {/* Highlights section */}
        {(stats.topBeat || stats.topMiss || stats.avgSurprise !== null) && (
          <>
            <div className="day-stats-divider" />
            <div className="day-stats-highlights">
              {stats.topBeat && (
                <div className="day-stat-highlight beat">
                  <span className="highlight-label">Top Beat</span>
                  <span className="highlight-ticker">{stats.topBeat.ticker}</span>
                  <span className="highlight-value">{formatSurprise(stats.topBeat.surprise)}</span>
                </div>
              )}
              {stats.topMiss && (
                <div className="day-stat-highlight miss">
                  <span className="highlight-label">Worst Miss</span>
                  <span className="highlight-ticker">{stats.topMiss.ticker}</span>
                  <span className="highlight-value">{formatSurprise(stats.topMiss.surprise)}</span>
                </div>
              )}
              {stats.avgSurprise !== null && (
                <div className={`day-stat-highlight avg ${stats.avgSurprise >= 0 ? 'positive' : 'negative'}`}>
                  <span className="highlight-label">Avg Surprise</span>
                  <span className="highlight-value">{formatSurprise(stats.avgSurprise)}</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Pointer arrow */}
        <div className="day-stats-arrow" />
      </div>
    </div>
  );
}

export default DayStatsPopover;
