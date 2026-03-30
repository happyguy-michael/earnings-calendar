'use client';

import { useState, useEffect, useMemo } from 'react';

/**
 * TradingDayTimeline - Visual progress bar showing current position in trading day
 * 
 * Inspiration:
 * - Bloomberg Terminal session indicators
 * - Trading platform market hour displays
 * - Dribbble "Real-Time Economic Indicator Calendar" designs
 * - 2026 "Contextual Time" trend — showing where you are, not just what time it is
 * 
 * Shows: Pre-market → Market Open → Market Close → After Hours
 * With a live marker showing current position and session-specific earnings counts
 */

interface SessionInfo {
  name: string;
  shortName: string;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  color: string;
  bgColor: string;
}

interface TradingDayTimelineProps {
  /** Number of pre-market earnings today */
  preMarketCount?: number;
  /** Number of after-hours earnings today */
  afterHoursCount?: number;
  /** Show session labels */
  showLabels?: boolean;
  /** Show earnings counts per session */
  showCounts?: boolean;
  /** Compact mode (thinner bar) */
  compact?: boolean;
  /** Animation delay in ms */
  delay?: number;
  /** Custom timezone (default: America/New_York for market hours) */
  timezone?: string;
}

const SESSIONS: SessionInfo[] = [
  {
    name: 'Pre-Market',
    shortName: 'PRE',
    startHour: 4,
    startMinute: 0,
    endHour: 9,
    endMinute: 30,
    color: '#f59e0b', // amber
    bgColor: 'rgba(245, 158, 11, 0.15)',
  },
  {
    name: 'Market Hours',
    shortName: 'MKT',
    startHour: 9,
    startMinute: 30,
    endHour: 16,
    endMinute: 0,
    color: '#10b981', // emerald
    bgColor: 'rgba(16, 185, 129, 0.15)',
  },
  {
    name: 'After Hours',
    shortName: 'AH',
    startHour: 16,
    startMinute: 0,
    endHour: 20,
    endMinute: 0,
    color: '#6366f1', // indigo
    bgColor: 'rgba(99, 102, 241, 0.15)',
  },
];

// Total trading day span in minutes (4:00 AM to 8:00 PM = 16 hours = 960 minutes)
const DAY_START_MINUTES = 4 * 60; // 4:00 AM
const DAY_END_MINUTES = 20 * 60; // 8:00 PM
const TOTAL_MINUTES = DAY_END_MINUTES - DAY_START_MINUTES;

function getSessionFromMinutes(minutes: number): SessionInfo | null {
  for (const session of SESSIONS) {
    const sessionStart = session.startHour * 60 + session.startMinute;
    const sessionEnd = session.endHour * 60 + session.endMinute;
    if (minutes >= sessionStart && minutes < sessionEnd) {
      return session;
    }
  }
  return null;
}

function getMarketTime(timezone: string = 'America/New_York'): { hours: number; minutes: number; dayOfWeek: number } {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
    weekday: 'short',
  });
  
  const parts = formatter.formatToParts(now);
  const hours = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
  const minutes = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
  const weekday = parts.find(p => p.type === 'weekday')?.value || '';
  
  const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const dayOfWeek = dayMap[weekday] ?? new Date().getDay();
  
  return { hours, minutes, dayOfWeek };
}

export function TradingDayTimeline({
  preMarketCount = 0,
  afterHoursCount = 0,
  showLabels = true,
  showCounts = true,
  compact = false,
  delay = 0,
  timezone = 'America/New_York',
}: TradingDayTimelineProps) {
  const [currentMinutes, setCurrentMinutes] = useState<number | null>(null);
  const [isWeekend, setIsWeekend] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const { hours, minutes, dayOfWeek } = getMarketTime(timezone);
      const totalMinutes = hours * 60 + minutes;
      setCurrentMinutes(totalMinutes);
      setIsWeekend(dayOfWeek === 0 || dayOfWeek === 6);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    
    const mountTimer = setTimeout(() => setMounted(true), delay);
    
    return () => {
      clearInterval(interval);
      clearTimeout(mountTimer);
    };
  }, [timezone, delay]);

  const { progress, currentSession, isBeforeMarket, isAfterMarket, sessionProgress } = useMemo(() => {
    if (currentMinutes === null) {
      return { progress: 0, currentSession: null, isBeforeMarket: false, isAfterMarket: false, sessionProgress: {} };
    }

    const clampedMinutes = Math.max(DAY_START_MINUTES, Math.min(DAY_END_MINUTES, currentMinutes));
    const progress = ((clampedMinutes - DAY_START_MINUTES) / TOTAL_MINUTES) * 100;
    const currentSession = getSessionFromMinutes(currentMinutes);
    const isBeforeMarket = currentMinutes < DAY_START_MINUTES;
    const isAfterMarket = currentMinutes >= DAY_END_MINUTES;

    // Calculate progress within each session
    const sessionProgress: Record<string, number> = {};
    for (const session of SESSIONS) {
      const sessionStart = session.startHour * 60 + session.startMinute;
      const sessionEnd = session.endHour * 60 + session.endMinute;
      const sessionDuration = sessionEnd - sessionStart;
      
      if (currentMinutes >= sessionEnd) {
        sessionProgress[session.shortName] = 100;
      } else if (currentMinutes > sessionStart) {
        sessionProgress[session.shortName] = ((currentMinutes - sessionStart) / sessionDuration) * 100;
      } else {
        sessionProgress[session.shortName] = 0;
      }
    }

    return { progress, currentSession, isBeforeMarket, isAfterMarket, sessionProgress };
  }, [currentMinutes]);

  const formatTime = (hour: number, minute: number) => {
    const h = hour % 12 || 12;
    const m = minute.toString().padStart(2, '0');
    const ampm = hour < 12 ? 'a' : 'p';
    return `${h}:${m}${ampm}`;
  };

  if (currentMinutes === null) {
    return null; // SSR safety
  }

  const barHeight = compact ? 6 : 10;

  return (
    <div
      className="trading-day-timeline"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(4px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}
    >
      {/* Status badge */}
      <div className="status-row">
        <div className="status-badge" style={{ backgroundColor: currentSession?.bgColor || 'rgba(107, 114, 128, 0.15)' }}>
          <span className="status-dot" style={{ backgroundColor: currentSession?.color || '#6b7280' }} />
          <span className="status-text" style={{ color: currentSession?.color || '#6b7280' }}>
            {isWeekend ? 'Weekend' : isBeforeMarket ? 'Pre-Open' : isAfterMarket ? 'Closed' : currentSession?.name || 'Loading'}
          </span>
        </div>
        {!isWeekend && showCounts && (preMarketCount > 0 || afterHoursCount > 0) && (
          <div className="counts">
            {preMarketCount > 0 && (
              <span className="count pre" title="Pre-market earnings">
                {preMarketCount} PRE
              </span>
            )}
            {afterHoursCount > 0 && (
              <span className="count ah" title="After-hours earnings">
                {afterHoursCount} AH
              </span>
            )}
          </div>
        )}
      </div>

      {/* Timeline bar */}
      <div className="timeline-container" style={{ height: barHeight }}>
        {SESSIONS.map((session) => {
          const sessionStart = session.startHour * 60 + session.startMinute;
          const sessionEnd = session.endHour * 60 + session.endMinute;
          const left = ((sessionStart - DAY_START_MINUTES) / TOTAL_MINUTES) * 100;
          const width = ((sessionEnd - sessionStart) / TOTAL_MINUTES) * 100;
          const isActive = currentSession?.shortName === session.shortName;
          const isDone = sessionProgress[session.shortName] === 100;

          return (
            <div
              key={session.shortName}
              className={`session-block ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
              style={{
                left: `${left}%`,
                width: `${width}%`,
                backgroundColor: session.bgColor,
              }}
            >
              {/* Progress fill within session */}
              <div
                className="session-fill"
                style={{
                  width: `${sessionProgress[session.shortName] || 0}%`,
                  backgroundColor: session.color,
                  opacity: isDone ? 0.6 : 1,
                }}
              />
            </div>
          );
        })}

        {/* Current time marker */}
        {!isWeekend && !isBeforeMarket && !isAfterMarket && (
          <div
            className="time-marker"
            style={{
              left: `${progress}%`,
              backgroundColor: currentSession?.color || '#fff',
            }}
          >
            <div className="marker-glow" style={{ backgroundColor: currentSession?.color }} />
          </div>
        )}
      </div>

      {/* Session labels */}
      {showLabels && (
        <div className="labels">
          {SESSIONS.map((session) => {
            const sessionStart = session.startHour * 60 + session.startMinute;
            const sessionEnd = session.endHour * 60 + session.endMinute;
            const left = ((sessionStart - DAY_START_MINUTES) / TOTAL_MINUTES) * 100;
            const width = ((sessionEnd - sessionStart) / TOTAL_MINUTES) * 100;
            const isActive = currentSession?.shortName === session.shortName;

            return (
              <div
                key={session.shortName}
                className={`label ${isActive ? 'active' : ''}`}
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                  color: isActive ? session.color : undefined,
                }}
              >
                <span className="label-name">{session.shortName}</span>
                <span className="label-time">
                  {formatTime(session.startHour, session.startMinute)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .trading-day-timeline {
          font-family: var(--font-sans, system-ui, sans-serif);
          width: 100%;
        }

        .status-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }

        .status-text {
          font-weight: 600;
        }

        .counts {
          display: flex;
          gap: 8px;
        }

        .count {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .count.pre {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }

        .count.ah {
          background: rgba(99, 102, 241, 0.15);
          color: #6366f1;
        }

        .timeline-container {
          position: relative;
          width: 100%;
          background: rgba(107, 114, 128, 0.1);
          border-radius: 999px;
          overflow: visible;
        }

        .session-block {
          position: absolute;
          top: 0;
          height: 100%;
          border-radius: 999px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .session-block.active {
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
        }

        .session-fill {
          height: 100%;
          transition: width 0.5s ease-out;
        }

        .time-marker {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid rgba(0, 0, 0, 0.3);
          z-index: 10;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .marker-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
          border-radius: 50%;
          opacity: 0.3;
          animation: markerPulse 2s ease-in-out infinite;
        }

        @keyframes markerPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
          50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }

        .labels {
          position: relative;
          height: 28px;
          margin-top: 6px;
        }

        .label {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          font-size: 9px;
          color: rgba(156, 163, 175, 0.8);
          transition: color 0.3s ease;
        }

        .label.active {
          font-weight: 600;
        }

        .label-name {
          font-weight: 600;
          letter-spacing: 0.03em;
        }

        .label-time {
          opacity: 0.7;
        }

        /* Light mode */
        @media (prefers-color-scheme: light) {
          .timeline-container {
            background: rgba(107, 114, 128, 0.15);
          }

          .time-marker {
            border-color: rgba(255, 255, 255, 0.8);
          }

          .label {
            color: rgba(75, 85, 99, 0.8);
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .status-dot,
          .marker-glow {
            animation: none;
          }

          .trading-day-timeline {
            transition: none;
          }

          .session-fill {
            transition: none;
          }
        }

        /* Print */
        @media print {
          .time-marker,
          .marker-glow,
          .status-dot {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * TradingDayTimelineCompact - Ultra-compact single-line version
 */
export function TradingDayTimelineCompact({
  timezone = 'America/New_York',
}: {
  timezone?: string;
}) {
  const [status, setStatus] = useState<{ session: string; color: string } | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const { hours, minutes, dayOfWeek } = getMarketTime(timezone);
      const totalMinutes = hours * 60 + minutes;
      
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        setStatus({ session: 'Weekend', color: '#6b7280' });
        return;
      }

      const currentSession = getSessionFromMinutes(totalMinutes);
      if (currentSession) {
        setStatus({ session: currentSession.shortName, color: currentSession.color });
      } else if (totalMinutes < DAY_START_MINUTES) {
        setStatus({ session: 'Pre-Open', color: '#6b7280' });
      } else {
        setStatus({ session: 'Closed', color: '#6b7280' });
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [timezone]);

  if (!status) return null;

  return (
    <span
      className="trading-day-compact"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 10,
        fontWeight: 600,
        color: status.color,
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          backgroundColor: status.color,
        }}
      />
      {status.session}
    </span>
  );
}

export default TradingDayTimeline;
