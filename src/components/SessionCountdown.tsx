'use client';

import { useState, useEffect, useMemo, memo, useCallback } from 'react';

/**
 * SessionCountdown - Live countdown to next market session with liquid progress
 * 
 * Inspiration:
 * - Dribbble 2026 "Real-Time Awareness" trend — showing temporal context
 * - Apple's live activities with smooth progress animations
 * - Trading platform pre-market countdowns
 * - Liquid glass aesthetics from iOS 26 / visionOS
 * 
 * Shows: Time until next pre-market or after-hours session starts
 * Gives traders context: "How long until the next batch of earnings drops?"
 */

type SessionType = 'pre' | 'post' | 'market' | 'closed';

interface SessionInfo {
  type: SessionType;
  label: string;
  icon: string;
  startTime: string; // HH:MM in ET
  endTime: string;   // HH:MM in ET
  color: string;
  bgColor: string;
}

const SESSIONS: SessionInfo[] = [
  { 
    type: 'pre', 
    label: 'Pre-Market', 
    icon: '🌅', 
    startTime: '04:00', 
    endTime: '09:30',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
  },
  { 
    type: 'market', 
    label: 'Market Open', 
    icon: '📈', 
    startTime: '09:30', 
    endTime: '16:00',
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.1)',
  },
  { 
    type: 'post', 
    label: 'After Hours', 
    icon: '🌙', 
    startTime: '16:00', 
    endTime: '20:00',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
  },
];

// Market is closed outside these hours (20:00 - 04:00) and on weekends
const CLOSED_SESSION: SessionInfo = {
  type: 'closed',
  label: 'Market Closed',
  icon: '😴',
  startTime: '20:00',
  endTime: '04:00',
  color: '#6b7280',
  bgColor: 'rgba(107, 114, 128, 0.1)',
};

function getETTime(): Date {
  const now = new Date();
  const etString = now.toLocaleString('en-US', { timeZone: 'America/New_York' });
  return new Date(etString);
}

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function getCurrentSession(etNow: Date): { current: SessionInfo; next: SessionInfo; progress: number; minutesUntilNext: number } {
  const dayOfWeek = etNow.getDay();
  const currentMinutes = etNow.getHours() * 60 + etNow.getMinutes();
  
  // Weekend check (Saturday = 6, Sunday = 0)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    // Calculate minutes until Monday 4 AM
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 2;
    const minutesUntilMonday = (daysUntilMonday * 24 * 60) - currentMinutes + parseTimeToMinutes('04:00');
    
    return {
      current: CLOSED_SESSION,
      next: SESSIONS[0], // Pre-market Monday
      progress: 0,
      minutesUntilNext: minutesUntilMonday,
    };
  }
  
  // Find current session
  for (const session of SESSIONS) {
    const start = parseTimeToMinutes(session.startTime);
    const end = parseTimeToMinutes(session.endTime);
    
    if (currentMinutes >= start && currentMinutes < end) {
      const sessionDuration = end - start;
      const elapsed = currentMinutes - start;
      const progress = (elapsed / sessionDuration) * 100;
      
      // Find next session
      const currentIndex = SESSIONS.indexOf(session);
      const nextSession = currentIndex < SESSIONS.length - 1 
        ? SESSIONS[currentIndex + 1] 
        : dayOfWeek === 5 
          ? CLOSED_SESSION // Friday after-hours → weekend
          : SESSIONS[0]; // Next day pre-market
      
      let minutesUntilNext = end - currentMinutes;
      
      return {
        current: session,
        next: nextSession,
        progress,
        minutesUntilNext,
      };
    }
  }
  
  // Before pre-market (00:00 - 04:00) or after post-market (20:00 - 24:00)
  if (currentMinutes < parseTimeToMinutes('04:00')) {
    const minutesUntilPreMarket = parseTimeToMinutes('04:00') - currentMinutes;
    return {
      current: CLOSED_SESSION,
      next: SESSIONS[0],
      progress: 0,
      minutesUntilNext: minutesUntilPreMarket,
    };
  }
  
  // After post-market - next day or weekend
  const isThursday = dayOfWeek === 4;
  const isFriday = dayOfWeek === 5;
  
  let minutesUntilPreMarket: number;
  if (isFriday) {
    // Friday after 8 PM → Monday 4 AM
    minutesUntilPreMarket = (3 * 24 * 60) - currentMinutes + parseTimeToMinutes('04:00');
  } else {
    // Next day 4 AM
    minutesUntilPreMarket = (24 * 60) - currentMinutes + parseTimeToMinutes('04:00');
  }
  
  return {
    current: CLOSED_SESSION,
    next: SESSIONS[0],
    progress: 0,
    minutesUntilNext: minutesUntilPreMarket,
  };
}

function formatCountdown(minutes: number): { hours: number; mins: number; secs: number } {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  const secs = Math.floor((minutes % 1) * 60);
  return { hours, mins, secs };
}

function formatTimeRemaining(minutes: number): string {
  const { hours, mins } = formatCountdown(minutes);
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

// Liquid progress bar with glass effect
function LiquidProgressBar({ 
  progress, 
  color, 
  height = 6,
  animated = true,
}: { 
  progress: number; 
  color: string; 
  height?: number;
  animated?: boolean;
}) {
  return (
    <div className="liquid-progress-container">
      <div className="liquid-progress-track">
        <div 
          className="liquid-progress-fill"
          style={{
            width: `${Math.min(100, Math.max(0, progress))}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
          }}
        >
          {animated && (
            <>
              <div className="liquid-shine" />
              <div className="liquid-bubble bubble-1" />
              <div className="liquid-bubble bubble-2" />
              <div className="liquid-bubble bubble-3" />
            </>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .liquid-progress-container {
          width: 100%;
          position: relative;
        }
        
        .liquid-progress-track {
          width: 100%;
          height: ${height}px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: ${height}px;
          overflow: hidden;
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        
        .liquid-progress-fill {
          height: 100%;
          border-radius: ${height}px;
          position: relative;
          transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }
        
        .liquid-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: liquidShine 2.5s ease-in-out infinite;
        }
        
        .liquid-bubble {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          animation: bubbleFloat 3s ease-in-out infinite;
        }
        
        .bubble-1 {
          width: 4px;
          height: 4px;
          right: 15%;
          top: 50%;
          transform: translateY(-50%);
          animation-delay: 0s;
        }
        
        .bubble-2 {
          width: 3px;
          height: 3px;
          right: 35%;
          top: 50%;
          transform: translateY(-50%);
          animation-delay: 0.5s;
        }
        
        .bubble-3 {
          width: 2px;
          height: 2px;
          right: 55%;
          top: 50%;
          transform: translateY(-50%);
          animation-delay: 1s;
        }
        
        @keyframes liquidShine {
          0% { left: -100%; }
          50% { left: 100%; }
          100% { left: 100%; }
        }
        
        @keyframes bubbleFloat {
          0%, 100% { 
            opacity: 0.6;
            transform: translateY(-50%) scale(1);
          }
          50% { 
            opacity: 1;
            transform: translateY(-70%) scale(1.2);
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .liquid-shine,
          .liquid-bubble {
            animation: none;
          }
          
          .liquid-progress-fill {
            transition: none;
          }
        }
        
        @media (prefers-color-scheme: light) {
          .liquid-progress-track {
            background: rgba(0, 0, 0, 0.05);
            border-color: rgba(0, 0, 0, 0.08);
          }
        }
      `}</style>
    </div>
  );
}

// Animated flip digit (single digit)
function FlipDigit({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' | 'lg' }) {
  const [currentValue, setCurrentValue] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);
  
  useEffect(() => {
    if (value !== currentValue) {
      setIsFlipping(true);
      const timer = setTimeout(() => {
        setCurrentValue(value);
        setIsFlipping(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [value, currentValue]);
  
  const sizeClasses = {
    sm: 'digit-sm',
    md: 'digit-md',
    lg: 'digit-lg',
  };
  
  return (
    <span className={`flip-digit ${sizeClasses[size]} ${isFlipping ? 'flipping' : ''}`}>
      <span className="digit-value">{currentValue.toString().padStart(2, '0')}</span>
      
      <style jsx>{`
        .flip-digit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-variant-numeric: tabular-nums;
          font-weight: 700;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 6px;
          padding: 2px 6px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .digit-sm { 
          font-size: 14px;
          padding: 1px 4px;
          border-radius: 4px;
        }
        
        .digit-md { 
          font-size: 18px;
        }
        
        .digit-lg { 
          font-size: 24px;
          padding: 4px 8px;
        }
        
        .digit-value {
          color: #fff;
          transition: transform 0.15s ease, opacity 0.15s ease;
        }
        
        .flip-digit.flipping .digit-value {
          transform: rotateX(90deg);
          opacity: 0.5;
        }
        
        @media (prefers-color-scheme: light) {
          .flip-digit {
            background: rgba(0, 0, 0, 0.08);
            border-color: rgba(0, 0, 0, 0.1);
          }
          
          .digit-value {
            color: #18181b;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .digit-value {
            transition: none;
          }
        }
      `}</style>
    </span>
  );
}

interface SessionCountdownProps {
  /** Show detailed breakdown with hours/minutes/seconds */
  detailed?: boolean;
  /** Show session progress bar */
  showProgress?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Animation delay in ms */
  delay?: number;
  /** Compact mode - just shows countdown */
  compact?: boolean;
  /** Show next session info */
  showNextSession?: boolean;
}

export const SessionCountdown = memo(function SessionCountdown({
  detailed = false,
  showProgress = true,
  size = 'md',
  delay = 0,
  compact = false,
  showNextSession = true,
}: SessionCountdownProps) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [secondsOffset, setSecondsOffset] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      setNow(getETTime());
    }, delay);
    
    // Update every second for countdown
    const interval = setInterval(() => {
      setNow(getETTime());
      setSecondsOffset(prev => (prev + 1) % 60);
    }, 1000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [delay]);

  const sessionData = useMemo(() => {
    if (!now) return null;
    return getCurrentSession(now);
  }, [now]);

  if (!mounted || !sessionData) {
    return (
      <div className={`session-countdown-skeleton ${size}`}>
        <div className="skeleton-shimmer" />
        <style jsx>{`
          .session-countdown-skeleton {
            height: 40px;
            width: 180px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            overflow: hidden;
            position: relative;
          }
          
          .skeleton-shimmer {
            position: absolute;
            inset: 0;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.08),
              transparent
            );
            animation: shimmer 1.5s infinite;
          }
          
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  const { current, next, progress, minutesUntilNext } = sessionData;
  const { hours, mins, secs } = formatCountdown(minutesUntilNext - secondsOffset / 60);
  const isInSession = current.type !== 'closed';
  
  return (
    <div 
      className={`session-countdown ${size} ${compact ? 'compact' : ''}`}
      style={{ 
        '--session-color': current.color,
        '--session-bg': current.bgColor,
        '--next-color': next.color,
      } as React.CSSProperties}
    >
      {/* Current session indicator */}
      <div className="session-current">
        <span className="session-icon">{current.icon}</span>
        <div className="session-info">
          <span className="session-label">{current.label}</span>
          {isInSession && !compact && (
            <span className="session-progress-text">{Math.round(progress)}% complete</span>
          )}
        </div>
      </div>
      
      {/* Progress bar for active session */}
      {showProgress && isInSession && (
        <div className="session-progress">
          <LiquidProgressBar 
            progress={progress} 
            color={current.color}
            height={size === 'lg' ? 8 : size === 'md' ? 6 : 4}
          />
        </div>
      )}
      
      {/* Countdown to next session */}
      {showNextSession && (
        <div className="session-next">
          <div className="next-label">
            <span className="next-icon">{next.icon}</span>
            <span>{next.label} in</span>
          </div>
          
          <div className="countdown-display">
            {detailed || !compact ? (
              <>
                {hours > 0 && (
                  <>
                    <FlipDigit value={hours} size={size === 'lg' ? 'lg' : size === 'md' ? 'md' : 'sm'} />
                    <span className="countdown-separator">h</span>
                  </>
                )}
                <FlipDigit value={mins} size={size === 'lg' ? 'lg' : size === 'md' ? 'md' : 'sm'} />
                <span className="countdown-separator">m</span>
                {detailed && (
                  <>
                    <FlipDigit value={secs} size={size === 'lg' ? 'lg' : size === 'md' ? 'md' : 'sm'} />
                    <span className="countdown-separator">s</span>
                  </>
                )}
              </>
            ) : (
              <span className="countdown-compact">{formatTimeRemaining(minutesUntilNext)}</span>
            )}
          </div>
        </div>
      )}
      
      <style jsx>{`
        .session-countdown {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 14px 16px;
          background: var(--session-bg);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          backdrop-filter: blur(12px);
          font-family: var(--font-sans, system-ui, sans-serif);
          animation: fadeSlideIn 0.4s ease backwards;
        }
        
        .session-countdown.compact {
          flex-direction: row;
          align-items: center;
          padding: 8px 12px;
          gap: 12px;
        }
        
        .session-countdown.sm {
          padding: 10px 12px;
          gap: 8px;
          font-size: 12px;
        }
        
        .session-countdown.lg {
          padding: 18px 20px;
          gap: 14px;
        }
        
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
        }
        
        .session-current {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .session-icon {
          font-size: 20px;
          line-height: 1;
        }
        
        .sm .session-icon { font-size: 16px; }
        .lg .session-icon { font-size: 26px; }
        
        .session-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .compact .session-info {
          flex-direction: row;
          align-items: center;
          gap: 8px;
        }
        
        .session-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--session-color);
        }
        
        .sm .session-label { font-size: 12px; }
        .lg .session-label { font-size: 16px; }
        
        .session-progress-text {
          font-size: 11px;
          color: rgba(156, 163, 175, 0.7);
        }
        
        .session-progress {
          margin-top: 2px;
        }
        
        .compact .session-progress {
          flex: 1;
          margin: 0;
        }
        
        .session-next {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }
        
        .compact .session-next {
          padding: 0;
          border: none;
          margin-left: auto;
          gap: 10px;
        }
        
        .next-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: rgba(156, 163, 175, 0.8);
        }
        
        .sm .next-label { font-size: 10px; }
        
        .next-icon {
          font-size: 14px;
          opacity: 0.8;
        }
        
        .countdown-display {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .countdown-separator {
          font-size: 12px;
          font-weight: 500;
          color: rgba(156, 163, 175, 0.6);
          margin: 0 1px;
        }
        
        .countdown-compact {
          font-size: 16px;
          font-weight: 700;
          color: var(--next-color);
          font-variant-numeric: tabular-nums;
        }
        
        @media (prefers-color-scheme: light) {
          .session-countdown {
            background: color-mix(in srgb, var(--session-bg) 50%, white);
            border-color: rgba(0, 0, 0, 0.08);
          }
          
          .session-next {
            border-color: rgba(0, 0, 0, 0.06);
          }
          
          .session-progress-text,
          .next-label,
          .countdown-separator {
            color: rgba(82, 82, 91, 0.7);
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .session-countdown {
            animation: none;
          }
        }
        
        @media print {
          .session-countdown {
            border: 1px solid #ccc;
            background: #f9f9f9;
          }
        }
      `}</style>
    </div>
  );
});

/**
 * SessionCountdownBadge - Ultra-compact inline badge version
 */
export const SessionCountdownBadge = memo(function SessionCountdownBadge({
  delay = 0,
}: {
  delay?: number;
}) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [secondsOffset, setSecondsOffset] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      setNow(getETTime());
    }, delay);
    
    const interval = setInterval(() => {
      setNow(getETTime());
      setSecondsOffset(prev => (prev + 1) % 60);
    }, 1000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [delay]);

  const sessionData = useMemo(() => {
    if (!now) return null;
    return getCurrentSession(now);
  }, [now]);

  if (!mounted || !sessionData) {
    return null;
  }

  const { current, next, minutesUntilNext } = sessionData;
  const isInSession = current.type !== 'closed';
  
  return (
    <span 
      className="session-badge"
      style={{ '--badge-color': isInSession ? current.color : next.color } as React.CSSProperties}
      title={isInSession 
        ? `${current.label} active` 
        : `${next.label} in ${formatTimeRemaining(minutesUntilNext)}`
      }
    >
      <span className="badge-icon">{isInSession ? current.icon : next.icon}</span>
      <span className="badge-text">
        {isInSession ? 'Live' : formatTimeRemaining(minutesUntilNext)}
      </span>
      {isInSession && <span className="badge-dot" />}
      
      <style jsx>{`
        .session-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          font-size: 11px;
          color: var(--badge-color);
          backdrop-filter: blur(8px);
        }
        
        .badge-icon {
          font-size: 12px;
          line-height: 1;
        }
        
        .badge-text {
          font-weight: 600;
          font-variant-numeric: tabular-nums;
        }
        
        .badge-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--badge-color);
          animation: dotPulse 2s ease-in-out infinite;
        }
        
        @keyframes dotPulse {
          0%, 100% { 
            opacity: 1;
            transform: scale(1);
          }
          50% { 
            opacity: 0.5;
            transform: scale(0.8);
          }
        }
        
        @media (prefers-color-scheme: light) {
          .session-badge {
            background: rgba(0, 0, 0, 0.04);
            border-color: rgba(0, 0, 0, 0.08);
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .badge-dot {
            animation: none;
          }
        }
      `}</style>
    </span>
  );
});

export default SessionCountdown;
