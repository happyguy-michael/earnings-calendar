'use client';

import { useState, useEffect, useMemo, memo } from 'react';

/**
 * SessionProgressBar
 * 
 * A sleek horizontal progress bar showing the current trading session
 * and progress through the trading day. Inspired by Vercel's deployment
 * timeline and Linear's progress indicators.
 * 
 * Features:
 * - Visual timeline: Pre-Market → Regular → After-Hours
 * - Animated progress fill with gradient
 * - Pulsing indicator for current position
 * - Subtle glow effects on active segment
 * - Real-time updates (every 30 seconds)
 * - Respects prefers-reduced-motion
 * - Theme-aware (light/dark mode)
 * - Weekend handling (shows "Markets Closed")
 * 
 * Visual Design:
 * - Thin elegant bar (4px height)
 * - Gradient fills for each session phase
 * - Glowing dot indicator for current time
 * - Segment labels with subtle animation on hover
 */

interface SessionSegment {
  id: 'pre-market' | 'regular' | 'after-hours' | 'closed';
  label: string;
  shortLabel: string;
  startMinutes: number; // Minutes from midnight ET
  endMinutes: number;
  color: string;
  gradientFrom: string;
  gradientTo: string;
}

const SESSIONS: SessionSegment[] = [
  {
    id: 'pre-market',
    label: 'Pre-Market',
    shortLabel: 'Pre',
    startMinutes: 4 * 60,      // 4:00 AM
    endMinutes: 9 * 60 + 30,   // 9:30 AM
    color: '#f59e0b',
    gradientFrom: '#f59e0b',
    gradientTo: '#fbbf24',
  },
  {
    id: 'regular',
    label: 'Regular Hours',
    shortLabel: 'Regular',
    startMinutes: 9 * 60 + 30, // 9:30 AM
    endMinutes: 16 * 60,       // 4:00 PM
    color: '#10b981',
    gradientFrom: '#10b981',
    gradientTo: '#34d399',
  },
  {
    id: 'after-hours',
    label: 'After-Hours',
    shortLabel: 'After',
    startMinutes: 16 * 60,     // 4:00 PM
    endMinutes: 20 * 60,       // 8:00 PM
    color: '#8b5cf6',
    gradientFrom: '#8b5cf6',
    gradientTo: '#a78bfa',
  },
];

// Total trading day span (4 AM to 8 PM = 16 hours)
const DAY_START = 4 * 60;   // 4:00 AM
const DAY_END = 20 * 60;    // 8:00 PM
const TOTAL_MINUTES = DAY_END - DAY_START; // 960 minutes

function getETTime(): { hours: number; minutes: number; dayOfWeek: number } {
  const now = new Date();
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  const utcDay = now.getUTCDay();
  
  // EST is UTC-5, EDT is UTC-4
  const month = now.getUTCMonth();
  const isDST = month >= 2 && month <= 10; // March to November
  const etOffset = isDST ? 4 : 5;
  
  let etHours = utcHours - etOffset;
  let etDay = utcDay;
  if (etHours < 0) {
    etHours += 24;
    etDay = (etDay - 1 + 7) % 7;
  }
  
  return { hours: etHours, minutes: utcMinutes, dayOfWeek: etDay };
}

function getCurrentSession(etMinutes: number): SessionSegment | null {
  for (const session of SESSIONS) {
    if (etMinutes >= session.startMinutes && etMinutes < session.endMinutes) {
      return session;
    }
  }
  return null;
}

interface SessionProgressBarProps {
  /** Show segment labels */
  showLabels?: boolean;
  /** Compact mode (shorter height) */
  compact?: boolean;
  /** Additional class name */
  className?: string;
}

const SessionProgressBar = memo(function SessionProgressBar({
  showLabels = true,
  compact = false,
  className = '',
}: SessionProgressBarProps) {
  const [etTime, setEtTime] = useState<{ hours: number; minutes: number; dayOfWeek: number } | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Update time
  useEffect(() => {
    const update = () => setEtTime(getETTime());
    update();
    const interval = setInterval(update, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const { currentSession, progress, isClosed, isWeekend, progressPercent, indicatorPosition } = useMemo(() => {
    if (!etTime) {
      return { currentSession: null, progress: 0, isClosed: true, isWeekend: false, progressPercent: 0, indicatorPosition: 0 };
    }

    const { hours, minutes, dayOfWeek } = etTime;
    const etMinutes = hours * 60 + minutes;
    
    // Weekend check
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    if (isWeekend) {
      return { currentSession: null, progress: 0, isClosed: true, isWeekend: true, progressPercent: 0, indicatorPosition: 0 };
    }

    // Before/after trading hours
    if (etMinutes < DAY_START || etMinutes >= DAY_END) {
      return { 
        currentSession: null, 
        progress: 0, 
        isClosed: true, 
        isWeekend: false, 
        progressPercent: etMinutes >= DAY_END ? 100 : 0,
        indicatorPosition: etMinutes >= DAY_END ? 100 : 0,
      };
    }

    const currentSession = getCurrentSession(etMinutes);
    const overallProgress = ((etMinutes - DAY_START) / TOTAL_MINUTES) * 100;
    
    // Progress within current session
    let sessionProgress = 0;
    if (currentSession) {
      const sessionDuration = currentSession.endMinutes - currentSession.startMinutes;
      sessionProgress = ((etMinutes - currentSession.startMinutes) / sessionDuration) * 100;
    }

    return {
      currentSession,
      progress: sessionProgress,
      isClosed: !currentSession,
      isWeekend: false,
      progressPercent: overallProgress,
      indicatorPosition: overallProgress,
    };
  }, [etTime]);

  if (!etTime) {
    // Loading state
    return (
      <div className={`session-progress-bar loading ${className}`}>
        <div className="session-progress-track">
          <div className="session-progress-skeleton" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div 
        className={`session-progress-bar ${compact ? 'compact' : ''} ${isClosed ? 'closed' : ''} ${className}`}
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={currentSession ? `${currentSession.label}: ${Math.round(progress)}% complete` : 'Markets closed'}
      >
        {/* Labels */}
        {showLabels && !compact && (
          <div className="session-progress-labels">
            {SESSIONS.map((session) => {
              const isActive = currentSession?.id === session.id;
              const isPast = !isClosed && currentSession && 
                SESSIONS.indexOf(currentSession) > SESSIONS.indexOf(session);
              
              return (
                <span 
                  key={session.id}
                  className={`session-label ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}`}
                  style={{ 
                    '--segment-color': session.color,
                    width: `${((session.endMinutes - session.startMinutes) / TOTAL_MINUTES) * 100}%`,
                  } as React.CSSProperties}
                >
                  {compact ? session.shortLabel : session.label}
                </span>
              );
            })}
          </div>
        )}

        {/* Track */}
        <div className="session-progress-track">
          {/* Segments background */}
          {SESSIONS.map((session, i) => {
            const width = ((session.endMinutes - session.startMinutes) / TOTAL_MINUTES) * 100;
            const left = ((session.startMinutes - DAY_START) / TOTAL_MINUTES) * 100;
            const isActive = currentSession?.id === session.id;
            const isPast = !isClosed && currentSession && 
              SESSIONS.indexOf(currentSession) > SESSIONS.indexOf(session);
            
            return (
              <div
                key={session.id}
                className={`session-segment ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}`}
                style={{
                  '--segment-color': session.color,
                  '--segment-gradient-from': session.gradientFrom,
                  '--segment-gradient-to': session.gradientTo,
                  left: `${left}%`,
                  width: `${width}%`,
                } as React.CSSProperties}
              >
                {/* Fill for active/past segments */}
                {(isActive || isPast) && (
                  <div 
                    className="session-segment-fill"
                    style={{
                      width: isPast ? '100%' : `${progress}%`,
                    }}
                  />
                )}
              </div>
            );
          })}

          {/* Current position indicator */}
          {!isClosed && currentSession && (
            <div 
              className={`session-indicator ${prefersReducedMotion ? 'reduced-motion' : ''}`}
              style={{
                left: `${indicatorPosition}%`,
                '--indicator-color': currentSession.color,
              } as React.CSSProperties}
            >
              <span className="session-indicator-dot" />
              <span className="session-indicator-pulse" />
            </div>
          )}
        </div>

        {/* Status text */}
        {showLabels && (
          <div className="session-progress-status">
            {isWeekend ? (
              <span className="status-text closed">Weekend · Markets Closed</span>
            ) : isClosed ? (
              <span className="status-text closed">Markets Closed</span>
            ) : currentSession && (
              <span className="status-text active" style={{ color: currentSession.color }}>
                {currentSession.label} · {Math.round(progress)}% complete
              </span>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .session-progress-bar {
          width: 100%;
          padding: 8px 0;
        }

        .session-progress-bar.compact {
          padding: 4px 0;
        }

        .session-progress-labels {
          display: flex;
          margin-bottom: 6px;
        }

        .session-label {
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: rgba(255, 255, 255, 0.4);
          text-align: center;
          transition: color 0.3s ease, transform 0.2s ease;
        }

        .session-label.active {
          color: var(--segment-color);
          transform: translateY(-1px);
        }

        .session-label.past {
          color: rgba(255, 255, 255, 0.25);
        }

        .session-progress-track {
          position: relative;
          height: 4px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          overflow: visible;
        }

        .session-progress-bar.compact .session-progress-track {
          height: 3px;
        }

        .session-segment {
          position: absolute;
          top: 0;
          height: 100%;
          background: rgba(255, 255, 255, 0.06);
          transition: background 0.3s ease;
        }

        .session-segment:first-child {
          border-radius: 4px 0 0 4px;
        }

        .session-segment:last-child {
          border-radius: 0 4px 4px 0;
        }

        .session-segment.active,
        .session-segment.past {
          background: rgba(255, 255, 255, 0.1);
        }

        .session-segment-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: linear-gradient(90deg, var(--segment-gradient-from), var(--segment-gradient-to));
          border-radius: inherit;
          transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .session-segment.active .session-segment-fill {
          box-shadow: 0 0 8px var(--segment-color);
        }

        .session-indicator {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          z-index: 10;
          pointer-events: none;
        }

        .session-indicator-dot {
          display: block;
          width: 10px;
          height: 10px;
          background: var(--indicator-color);
          border-radius: 50%;
          border: 2px solid rgba(10, 10, 15, 0.8);
          box-shadow: 
            0 0 0 2px var(--indicator-color),
            0 0 12px var(--indicator-color);
        }

        .session-indicator-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--indicator-color);
          opacity: 0;
          animation: indicator-pulse 2s ease-out infinite;
        }

        .session-indicator.reduced-motion .session-indicator-pulse {
          animation: none;
        }

        @keyframes indicator-pulse {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0.6;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }

        .session-progress-status {
          margin-top: 8px;
          text-align: center;
        }

        .status-text {
          font-size: 11px;
          font-weight: 500;
        }

        .status-text.closed {
          color: rgba(255, 255, 255, 0.35);
        }

        .status-text.active {
          font-weight: 600;
        }

        .session-progress-skeleton {
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.05) 0%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0.05) 100%
          );
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.5s infinite;
          border-radius: 4px;
        }

        @keyframes skeleton-shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        /* Light mode */
        :global(html.light) .session-label {
          color: rgba(0, 0, 0, 0.35);
        }

        :global(html.light) .session-label.past {
          color: rgba(0, 0, 0, 0.2);
        }

        :global(html.light) .session-progress-track {
          background: rgba(0, 0, 0, 0.06);
        }

        :global(html.light) .session-segment {
          background: rgba(0, 0, 0, 0.04);
        }

        :global(html.light) .session-segment.active,
        :global(html.light) .session-segment.past {
          background: rgba(0, 0, 0, 0.06);
        }

        :global(html.light) .session-indicator-dot {
          border-color: rgba(255, 255, 255, 0.9);
        }

        :global(html.light) .status-text.closed {
          color: rgba(0, 0, 0, 0.4);
        }

        /* Closed state */
        .session-progress-bar.closed .session-progress-track {
          opacity: 0.5;
        }

        /* Hover effects */
        .session-segment {
          cursor: default;
        }

        .session-label:hover {
          color: rgba(255, 255, 255, 0.6);
        }

        .session-label.active:hover {
          color: var(--segment-color);
        }

        /* Mobile adjustments */
        @media (max-width: 640px) {
          .session-label {
            font-size: 9px;
          }

          .session-indicator-dot {
            width: 8px;
            height: 8px;
          }

          .status-text {
            font-size: 10px;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .session-indicator-pulse {
            animation: none;
          }

          .session-segment-fill {
            transition: none;
          }

          .session-progress-skeleton {
            animation: none;
            background: rgba(255, 255, 255, 0.08);
          }
        }
      `}</style>
    </>
  );
});

/**
 * Compact inline version for header use
 */
export function SessionProgressInline({ className = '' }: { className?: string }) {
  return <SessionProgressBar showLabels={false} compact className={className} />;
}

export { SessionProgressBar };
export default SessionProgressBar;
