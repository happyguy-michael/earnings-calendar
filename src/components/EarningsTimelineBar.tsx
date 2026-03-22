'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Earning } from '@/lib/types';

/**
 * EarningsTimelineBar - Horizontal timeline showing earnings release times
 * 
 * Inspiration:
 * - Airport/train station departure boards
 * - Gantt chart timeline visualizations  
 * - Apple Calendar's day timeline view
 * - Linear's progress timeline indicators
 * - Bloomberg Terminal's market session bars
 * 
 * Features:
 * - Horizontal bar representing a trading day
 * - Pre-market (6-9:30 AM ET) and after-hours (4-8 PM ET) zones
 * - Regular hours zone (9:30 AM - 4 PM ET) shown as gap
 * - Earnings shown as dots/markers at their release time
 * - Live "now" indicator that moves across the timeline
 * - Beat/miss coloring for completed earnings
 * - Hover tooltips showing company details
 * - Compact enough to fit in day column headers
 * - Full light/dark mode and reduced motion support
 * 
 * Usage:
 * <EarningsTimelineBar
 *   earnings={todaysEarnings}
 *   isToday={true}
 *   compact={true}
 * />
 */

interface EarningsTimelineBarProps {
  /** Earnings for this day */
  earnings: Earning[];
  /** Whether this is today (shows live indicator) */
  isToday?: boolean;
  /** Compact mode for tight spaces */
  compact?: boolean;
  /** Show session labels */
  showLabels?: boolean;
  /** Height of the bar */
  height?: number;
  /** Custom className */
  className?: string;
}

// Market session times in minutes from midnight (ET)
const SESSIONS = {
  preStart: 6 * 60,       // 6:00 AM
  preEnd: 9.5 * 60,       // 9:30 AM
  regularStart: 9.5 * 60, // 9:30 AM
  regularEnd: 16 * 60,    // 4:00 PM
  postStart: 16 * 60,     // 4:00 PM
  postEnd: 20 * 60,       // 8:00 PM
};

// Total timeline span (6 AM to 8 PM = 14 hours = 840 minutes)
const TIMELINE_START = SESSIONS.preStart;
const TIMELINE_END = SESSIONS.postEnd;
const TIMELINE_SPAN = TIMELINE_END - TIMELINE_START;

function getETMinutesFromMidnight(): number {
  const now = new Date();
  const etString = now.toLocaleString('en-US', { 
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false 
  });
  const [hours, minutes] = etString.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToPercent(minutes: number): number {
  return ((minutes - TIMELINE_START) / TIMELINE_SPAN) * 100;
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${hour12}:${mins.toString().padStart(2, '0')} ${period}`;
}

interface TimelineEarning extends Earning {
  position: number; // percentage position on timeline
  minutesFromMidnight: number;
}

function parseEarningTime(earning: Earning): number | null {
  // If we have specific time info, use it
  // For now, place pre-market at 7:00 AM and after-hours at 4:30 PM as defaults
  if (earning.time === 'pre') {
    return 7 * 60; // 7:00 AM
  } else if (earning.time === 'post') {
    return 16.5 * 60; // 4:30 PM
  }
  return null;
}

export function EarningsTimelineBar({
  earnings,
  isToday = false,
  compact = false,
  showLabels = !compact,
  height = compact ? 8 : 16,
  className = '',
}: EarningsTimelineBarProps) {
  const [nowMinutes, setNowMinutes] = useState<number | null>(null);
  const [hoveredEarning, setHoveredEarning] = useState<string | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Update current time for today
  useEffect(() => {
    if (!isToday) return;

    const updateTime = () => {
      setNowMinutes(getETMinutesFromMidnight());
    };

    updateTime();
    const interval = setInterval(updateTime, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isToday]);

  // Process earnings into timeline positions
  const timelineEarnings = useMemo((): TimelineEarning[] => {
    return earnings
      .map((e) => {
        const minutes = parseEarningTime(e);
        if (minutes === null) return null;
        return {
          ...e,
          minutesFromMidnight: minutes,
          position: minutesToPercent(minutes),
        };
      })
      .filter((e): e is TimelineEarning => e !== null)
      .sort((a, b) => a.minutesFromMidnight - b.minutesFromMidnight);
  }, [earnings]);

  // Calculate now indicator position
  const nowPosition = useMemo(() => {
    if (!isToday || nowMinutes === null) return null;
    if (nowMinutes < TIMELINE_START || nowMinutes > TIMELINE_END) return null;
    return minutesToPercent(nowMinutes);
  }, [isToday, nowMinutes]);

  // Session zone positions
  const preMarketZone = {
    left: minutesToPercent(SESSIONS.preStart),
    width: minutesToPercent(SESSIONS.preEnd) - minutesToPercent(SESSIONS.preStart),
  };
  
  const regularZone = {
    left: minutesToPercent(SESSIONS.regularStart),
    width: minutesToPercent(SESSIONS.regularEnd) - minutesToPercent(SESSIONS.regularStart),
  };
  
  const afterHoursZone = {
    left: minutesToPercent(SESSIONS.postStart),
    width: minutesToPercent(SESSIONS.postEnd) - minutesToPercent(SESSIONS.postStart),
  };

  if (timelineEarnings.length === 0) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className={`earnings-timeline ${compact ? 'compact' : ''} ${className}`}
      role="img"
      aria-label={`Earnings timeline with ${timelineEarnings.length} reports`}
    >
      {/* Labels */}
      {showLabels && (
        <div className="timeline-labels">
          <span className="timeline-label pre">Pre</span>
          <span className="timeline-label gap">Market</span>
          <span className="timeline-label post">AH</span>
        </div>
      )}

      {/* Timeline bar */}
      <div className="timeline-bar" style={{ height }}>
        {/* Session zones */}
        <div 
          className="timeline-zone pre-market"
          style={{ left: `${preMarketZone.left}%`, width: `${preMarketZone.width}%` }}
          aria-hidden="true"
        />
        <div 
          className="timeline-zone regular-hours"
          style={{ left: `${regularZone.left}%`, width: `${regularZone.width}%` }}
          aria-hidden="true"
        />
        <div 
          className="timeline-zone after-hours"
          style={{ left: `${afterHoursZone.left}%`, width: `${afterHoursZone.width}%` }}
          aria-hidden="true"
        />

        {/* Earnings markers */}
        {timelineEarnings.map((earning) => {
          const isHovered = hoveredEarning === earning.ticker;
          const resultColor = 
            earning.result === 'beat' ? 'var(--accent-green)' :
            earning.result === 'miss' ? 'var(--accent-red)' :
            'var(--accent-amber)';

          return (
            <div
              key={earning.ticker}
              className={`timeline-marker ${earning.result || 'pending'} ${isHovered ? 'hovered' : ''}`}
              style={{ 
                left: `${earning.position}%`,
                '--marker-color': resultColor,
              } as React.CSSProperties}
              onMouseEnter={() => setHoveredEarning(earning.ticker)}
              onMouseLeave={() => setHoveredEarning(null)}
              role="button"
              tabIndex={0}
              aria-label={`${earning.ticker} reports at ${formatTime(earning.minutesFromMidnight)}`}
            >
              {/* Tooltip */}
              {isHovered && !compact && (
                <div className="timeline-tooltip">
                  <div className="tooltip-ticker">{earning.ticker}</div>
                  <div className="tooltip-time">{formatTime(earning.minutesFromMidnight)} ET</div>
                  {earning.result && (
                    <div className={`tooltip-result ${earning.result}`}>
                      {earning.result === 'beat' ? '✓ Beat' : '✗ Miss'}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Now indicator */}
        {nowPosition !== null && (
          <div 
            className="timeline-now"
            style={{ left: `${nowPosition}%` }}
            aria-label={`Current time: ${formatTime(nowMinutes!)}`}
          >
            <div className="now-line" />
            {!compact && <div className="now-label">Now</div>}
          </div>
        )}
      </div>

      <style jsx>{`
        .earnings-timeline {
          position: relative;
          padding: ${showLabels ? '20px 0 4px' : '4px 0'};
          user-select: none;
        }

        .earnings-timeline.compact {
          padding: 2px 0;
        }

        /* Labels */
        .timeline-labels {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
          padding: 0 2px;
        }

        .timeline-label {
          font-size: 9px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
        }

        .timeline-label.pre {
          color: var(--accent-amber);
        }

        .timeline-label.gap {
          color: var(--text-tertiary);
          flex: 1;
          text-align: center;
        }

        .timeline-label.post {
          color: var(--accent-purple);
        }

        /* Bar */
        .timeline-bar {
          position: relative;
          border-radius: ${height / 2}px;
          background: var(--bg-tertiary);
          overflow: visible;
        }

        /* Session zones */
        .timeline-zone {
          position: absolute;
          top: 0;
          bottom: 0;
          border-radius: ${height / 2}px;
        }

        .timeline-zone.pre-market {
          background: linear-gradient(90deg, 
            rgba(251, 191, 36, 0.2) 0%,
            rgba(251, 191, 36, 0.1) 100%
          );
        }

        .timeline-zone.regular-hours {
          background: rgba(100, 116, 139, 0.1);
        }

        .timeline-zone.after-hours {
          background: linear-gradient(90deg,
            rgba(168, 85, 247, 0.1) 0%,
            rgba(168, 85, 247, 0.2) 100%
          );
        }

        /* Markers */
        .timeline-marker {
          position: absolute;
          top: 50%;
          width: ${compact ? 6 : 10}px;
          height: ${compact ? 6 : 10}px;
          margin-left: ${compact ? -3 : -5}px;
          margin-top: ${compact ? -3 : -5}px;
          border-radius: 50%;
          background: var(--marker-color);
          cursor: pointer;
          z-index: 2;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
                      box-shadow 0.2s ease;
        }

        .timeline-marker.hovered {
          transform: scale(1.4);
          box-shadow: 0 0 0 3px rgba(var(--marker-color-rgb, 251, 191, 36), 0.3),
                      0 2px 8px rgba(0, 0, 0, 0.2);
          z-index: 10;
        }

        .timeline-marker.beat {
          --marker-color: var(--accent-green, #22c55e);
        }

        .timeline-marker.miss {
          --marker-color: var(--accent-red, #ef4444);
        }

        .timeline-marker.pending {
          --marker-color: var(--accent-amber, #f59e0b);
          animation: ${prefersReducedMotion ? 'none' : 'markerPulse 2s ease-in-out infinite'};
        }

        @keyframes markerPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        /* Tooltip */
        .timeline-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 8px;
          padding: 8px 12px;
          background: rgba(15, 15, 25, 0.95);
          backdrop-filter: blur(8px);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
          white-space: nowrap;
          z-index: 20;
          animation: ${prefersReducedMotion ? 'none' : 'tooltipAppear 0.15s ease-out'};
        }

        @keyframes tooltipAppear {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .tooltip-ticker {
          font-size: 12px;
          font-weight: 600;
          color: white;
        }

        .tooltip-time {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.6);
          margin-top: 2px;
        }

        .tooltip-result {
          font-size: 10px;
          font-weight: 500;
          margin-top: 4px;
        }

        .tooltip-result.beat {
          color: var(--accent-green);
        }

        .tooltip-result.miss {
          color: var(--accent-red);
        }

        /* Now indicator */
        .timeline-now {
          position: absolute;
          top: -4px;
          bottom: -4px;
          z-index: 5;
        }

        .now-line {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2px;
          margin-left: -1px;
          background: var(--accent-blue, #3b82f6);
          border-radius: 1px;
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
        }

        .now-label {
          position: absolute;
          top: -18px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 9px;
          font-weight: 600;
          color: var(--accent-blue);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Light mode */
        :global(html.light) .timeline-bar {
          background: rgba(0, 0, 0, 0.06);
        }

        :global(html.light) .timeline-zone.pre-market {
          background: linear-gradient(90deg,
            rgba(251, 191, 36, 0.15) 0%,
            rgba(251, 191, 36, 0.08) 100%
          );
        }

        :global(html.light) .timeline-zone.regular-hours {
          background: rgba(0, 0, 0, 0.04);
        }

        :global(html.light) .timeline-zone.after-hours {
          background: linear-gradient(90deg,
            rgba(168, 85, 247, 0.08) 0%,
            rgba(168, 85, 247, 0.15) 100%
          );
        }

        :global(html.light) .timeline-tooltip {
          background: rgba(255, 255, 255, 0.95);
          border-color: rgba(0, 0, 0, 0.1);
        }

        :global(html.light) .tooltip-ticker {
          color: var(--text-primary);
        }

        :global(html.light) .tooltip-time {
          color: var(--text-muted);
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .timeline-marker {
            transition: none;
          }

          .timeline-marker.pending {
            animation: none;
          }

          .timeline-tooltip {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * EarningsTimelineCompact - Ultra-compact version for cramped spaces
 * Just shows dots on a line with color-coded results
 */
export function EarningsTimelineCompact({
  earnings,
  isToday = false,
  className = '',
}: {
  earnings: Earning[];
  isToday?: boolean;
  className?: string;
}) {
  return (
    <EarningsTimelineBar
      earnings={earnings}
      isToday={isToday}
      compact={true}
      showLabels={false}
      height={4}
      className={className}
    />
  );
}

export default EarningsTimelineBar;
