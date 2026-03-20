'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { Earning } from '@/lib/types';

interface SeasonProgressProps {
  earnings: Earning[];
  className?: string;
  /** Show expanded view with more details */
  expanded?: boolean;
  /** Animation delay in ms */
  delay?: number;
}

interface SeasonStats {
  quarter: string;
  year: number;
  weekNumber: number;
  totalWeeks: number;
  totalEarnings: number;
  reportedCount: number;
  beatCount: number;
  missCount: number;
  pendingCount: number;
  beatRate: number;
  progressPercent: number;
  phase: 'early' | 'peak' | 'late' | 'wrap-up';
  momentum: 'accelerating' | 'steady' | 'decelerating';
}

/**
 * Get the current fiscal quarter based on typical earnings season timing.
 * Q1 earnings: April-May (Jan-Mar fiscal quarter)
 * Q2 earnings: July-Aug (Apr-Jun fiscal quarter)
 * Q3 earnings: Oct-Nov (Jul-Sep fiscal quarter)
 * Q4 earnings: Jan-Feb (Oct-Dec fiscal quarter)
 */
function getCurrentSeason(date: Date): { quarter: string; year: number } {
  const month = date.getMonth(); // 0-indexed
  const year = date.getFullYear();
  
  // Determine which quarter's earnings are being reported
  if (month >= 0 && month <= 1) {
    // Jan-Feb: Q4 earnings from previous year
    return { quarter: 'Q4', year: year - 1 };
  } else if (month >= 3 && month <= 4) {
    // Apr-May: Q1 earnings
    return { quarter: 'Q1', year };
  } else if (month >= 6 && month <= 7) {
    // Jul-Aug: Q2 earnings
    return { quarter: 'Q2', year };
  } else if (month >= 9 && month <= 10) {
    // Oct-Nov: Q3 earnings
    return { quarter: 'Q3', year };
  }
  
  // In between seasons (Mar, Jun, Sep, Dec) - show upcoming
  if (month === 2) return { quarter: 'Q1', year };
  if (month === 5) return { quarter: 'Q2', year };
  if (month === 8) return { quarter: 'Q3', year };
  return { quarter: 'Q4', year };
}

/**
 * Calculate the week number within earnings season (1-6 typical).
 * Earnings season typically runs ~6 weeks with peak in weeks 2-4.
 */
function getSeasonWeek(date: Date): { weekNumber: number; totalWeeks: number; phase: SeasonStats['phase'] } {
  const month = date.getMonth();
  const day = date.getDate();
  const totalWeeks = 6;
  
  // Approximate week within the ~6 week earnings season
  let weekNumber: number;
  
  // Different start dates for each earnings season
  if (month === 0) {
    // January: Q4 earnings start mid-month
    weekNumber = day < 10 ? 1 : day < 17 ? 2 : day < 24 ? 3 : 4;
  } else if (month === 1) {
    // February: weeks 4-6 of Q4 season
    weekNumber = day < 7 ? 4 : day < 14 ? 5 : 6;
  } else if (month === 3) {
    // April: Q1 earnings start mid-month
    weekNumber = day < 10 ? 1 : day < 17 ? 2 : day < 24 ? 3 : 4;
  } else if (month === 4) {
    // May: weeks 4-6 of Q1 season
    weekNumber = day < 7 ? 4 : day < 14 ? 5 : 6;
  } else if (month === 6) {
    // July: Q2 earnings start mid-month
    weekNumber = day < 10 ? 1 : day < 17 ? 2 : day < 24 ? 3 : 4;
  } else if (month === 7) {
    // August: weeks 4-6 of Q2 season
    weekNumber = day < 7 ? 4 : day < 14 ? 5 : 6;
  } else if (month === 9) {
    // October: Q3 earnings start mid-month
    weekNumber = day < 10 ? 1 : day < 17 ? 2 : day < 24 ? 3 : 4;
  } else if (month === 10) {
    // November: weeks 4-6 of Q3 season
    weekNumber = day < 7 ? 4 : day < 14 ? 5 : 6;
  } else {
    // Off-season
    weekNumber = 0;
  }
  
  // Determine phase
  let phase: SeasonStats['phase'];
  if (weekNumber <= 1) phase = 'early';
  else if (weekNumber <= 3) phase = 'peak';
  else if (weekNumber <= 5) phase = 'late';
  else phase = 'wrap-up';
  
  return { weekNumber: Math.max(1, weekNumber), totalWeeks, phase };
}

/**
 * SeasonProgress - Macro context indicator for earnings season
 * 
 * Shows where we are in the earnings calendar:
 * - Current quarter being reported
 * - Week number within the ~6 week season
 * - Progress bar showing % reported
 * - Beat rate momentum indicator
 * 
 * Design: Compact pill badge that expands on hover to show details.
 * Inspired by GitHub's contribution activity and Vercel's deploy status.
 */
export function SeasonProgress({ 
  earnings, 
  className = '',
  expanded = false,
  delay = 0,
}: SeasonProgressProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  const stats = useMemo((): SeasonStats => {
    const now = new Date();
    const { quarter, year } = getCurrentSeason(now);
    const { weekNumber, totalWeeks, phase } = getSeasonWeek(now);
    
    const reported = earnings.filter(e => e.eps !== undefined && e.eps !== null);
    const beats = reported.filter(e => e.result === 'beat');
    const misses = reported.filter(e => e.result === 'miss');
    const pending = earnings.length - reported.length;
    
    const beatRate = reported.length > 0 
      ? Math.round((beats.length / reported.length) * 100)
      : 0;
    
    const progressPercent = earnings.length > 0
      ? Math.round((reported.length / earnings.length) * 100)
      : 0;
    
    // Determine momentum based on recent beat rate trend
    // In a real app, this would compare to historical data
    let momentum: SeasonStats['momentum'] = 'steady';
    if (beatRate >= 75) momentum = 'accelerating';
    else if (beatRate < 50) momentum = 'decelerating';
    
    return {
      quarter,
      year,
      weekNumber,
      totalWeeks,
      totalEarnings: earnings.length,
      reportedCount: reported.length,
      beatCount: beats.length,
      missCount: misses.length,
      pendingCount: pending,
      beatRate,
      progressPercent,
      phase,
      momentum,
    };
  }, [earnings]);
  
  // Animate progress bar
  useEffect(() => {
    if (!mounted) return;
    
    const timer = setTimeout(() => {
      setAnimatedProgress(stats.progressPercent);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [mounted, stats.progressPercent]);
  
  // Phase-specific styling
  const phaseConfig = useMemo(() => {
    switch (stats.phase) {
      case 'early':
        return {
          icon: '🌅',
          label: 'Early Season',
          color: 'var(--accent-blue)',
          bgClass: 'season-phase-early',
        };
      case 'peak':
        return {
          icon: '🔥',
          label: 'Peak Season',
          color: 'var(--success)',
          bgClass: 'season-phase-peak',
        };
      case 'late':
        return {
          icon: '🌙',
          label: 'Late Season',
          color: 'var(--accent-purple)',
          bgClass: 'season-phase-late',
        };
      case 'wrap-up':
        return {
          icon: '✨',
          label: 'Wrapping Up',
          color: 'var(--warning)',
          bgClass: 'season-phase-wrapup',
        };
    }
  }, [stats.phase]);
  
  // Momentum indicator
  const momentumIcon = useMemo(() => {
    switch (stats.momentum) {
      case 'accelerating': return '📈';
      case 'decelerating': return '📉';
      default: return '➡️';
    }
  }, [stats.momentum]);
  
  const showExpanded = expanded || isHovered;
  
  return (
    <div 
      ref={progressRef}
      className={`season-progress ${mounted ? 'mounted' : ''} ${showExpanded ? 'expanded' : ''} ${phaseConfig.bgClass} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="status"
      aria-label={`${stats.quarter} ${stats.year} Earnings Season - Week ${stats.weekNumber} of ${stats.totalWeeks}`}
    >
      {/* Compact view */}
      <div className="season-progress-compact">
        <span className="season-progress-phase-icon" aria-hidden="true">
          {phaseConfig.icon}
        </span>
        <span className="season-progress-label">
          <span className="season-quarter">{stats.quarter} {stats.year}</span>
          <span className="season-separator">•</span>
          <span className="season-week">Week {stats.weekNumber}</span>
        </span>
        
        {/* Mini progress arc */}
        <div className="season-progress-mini" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              opacity="0.15"
            />
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke={phaseConfig.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={`${(animatedProgress / 100) * 62.83} 62.83`}
              transform="rotate(-90 12 12)"
              style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
          </svg>
          <span className="season-progress-mini-text">{stats.progressPercent}%</span>
        </div>
      </div>
      
      {/* Expanded details (shown on hover or when expanded prop is true) */}
      <div className="season-progress-details">
        {/* Progress bar */}
        <div className="season-progress-bar-container">
          <div className="season-progress-bar">
            <div 
              className="season-progress-bar-fill"
              style={{ 
                width: `${animatedProgress}%`,
                backgroundColor: phaseConfig.color,
              }}
            />
            {/* Week markers */}
            {Array.from({ length: stats.totalWeeks - 1 }).map((_, i) => (
              <div 
                key={i}
                className="season-progress-marker"
                style={{ left: `${((i + 1) / stats.totalWeeks) * 100}%` }}
                aria-hidden="true"
              />
            ))}
          </div>
          <div className="season-progress-labels">
            <span>Week 1</span>
            <span>Week {stats.totalWeeks}</span>
          </div>
        </div>
        
        {/* Stats row */}
        <div className="season-progress-stats">
          <div className="season-stat">
            <span className="season-stat-value season-stat-reported">{stats.reportedCount}</span>
            <span className="season-stat-label">Reported</span>
          </div>
          <div className="season-stat">
            <span className="season-stat-value season-stat-beat">{stats.beatCount}</span>
            <span className="season-stat-label">Beats</span>
          </div>
          <div className="season-stat">
            <span className="season-stat-value season-stat-miss">{stats.missCount}</span>
            <span className="season-stat-label">Misses</span>
          </div>
          <div className="season-stat">
            <span className="season-stat-value season-stat-pending">{stats.pendingCount}</span>
            <span className="season-stat-label">Pending</span>
          </div>
        </div>
        
        {/* Beat rate with momentum */}
        <div className="season-progress-momentum">
          <span className="season-momentum-icon" aria-hidden="true">{momentumIcon}</span>
          <span className="season-momentum-rate">{stats.beatRate}% beat rate</span>
          <span className="season-momentum-label">
            {stats.momentum === 'accelerating' && 'Strong momentum'}
            {stats.momentum === 'steady' && 'Steady pace'}
            {stats.momentum === 'decelerating' && 'Softening'}
          </span>
        </div>
      </div>
      
      {/* Animated gradient border on hover */}
      <div className="season-progress-glow" aria-hidden="true" />
    </div>
  );
}

/**
 * Compact inline version for header use
 */
export function SeasonProgressBadge({ 
  earnings,
  className = '',
}: Omit<SeasonProgressProps, 'expanded' | 'delay'>) {
  const stats = useMemo(() => {
    const now = new Date();
    const { quarter, year } = getCurrentSeason(now);
    const { weekNumber, totalWeeks } = getSeasonWeek(now);
    
    const reported = earnings.filter(e => e.eps !== undefined && e.eps !== null);
    const progressPercent = earnings.length > 0
      ? Math.round((reported.length / earnings.length) * 100)
      : 0;
    
    return { quarter, year, weekNumber, totalWeeks, progressPercent };
  }, [earnings]);
  
  return (
    <span className={`season-badge ${className}`}>
      <span className="season-badge-quarter">{stats.quarter}</span>
      <span className="season-badge-separator">•</span>
      <span className="season-badge-week">Wk {stats.weekNumber}</span>
      <span className="season-badge-progress">{stats.progressPercent}%</span>
    </span>
  );
}

export default SeasonProgress;
