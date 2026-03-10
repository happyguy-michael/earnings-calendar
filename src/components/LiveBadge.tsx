'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

interface LiveBadgeProps {
  time: 'pre' | 'post';
  isToday: boolean;
  isPending: boolean;
}

/**
 * LiveBadge v2 - Premium time-aware earnings session indicator
 * 
 * Features:
 * - Real-time countdown to/during market sessions
 * - Pulsing glow animation when live
 * - Glassmorphic styling with color states
 * - States: "Ended", "Live", "Starting in Xm", "Upcoming"
 * - Respects prefers-reduced-motion
 * - Full light/dark mode support
 * 
 * Market Sessions (ET):
 * - Pre-market: 6:00 AM - 9:30 AM ET
 * - After-hours: 4:00 PM - 8:00 PM ET
 */

// Market session times in ET (Eastern Time)
const SESSIONS = {
  pre: {
    start: { hours: 6, minutes: 0 },   // 6:00 AM ET
    end: { hours: 9, minutes: 30 },    // 9:30 AM ET
    label: 'Pre-Market',
    shortLabel: 'Pre',
  },
  post: {
    start: { hours: 16, minutes: 0 },  // 4:00 PM ET
    end: { hours: 20, minutes: 0 },    // 8:00 PM ET
    label: 'After Hours',
    shortLabel: 'AH',
  },
};

function getETTime(): Date {
  // Get current time in ET timezone
  const now = new Date();
  const etString = now.toLocaleString('en-US', { timeZone: 'America/New_York' });
  return new Date(etString);
}

function getMinutesUntil(targetHours: number, targetMinutes: number, etNow: Date): number {
  const targetMinutesOfDay = targetHours * 60 + targetMinutes;
  const currentMinutesOfDay = etNow.getHours() * 60 + etNow.getMinutes();
  return targetMinutesOfDay - currentMinutesOfDay;
}

function formatCountdown(minutes: number): string {
  if (minutes <= 0) return '';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

type SessionState = 'ended' | 'live' | 'soon' | 'upcoming' | 'waiting';

interface SessionStatus {
  state: SessionState;
  countdown?: string;
  label: string;
  shortLabel: string;
}

function getSessionStatus(session: typeof SESSIONS.pre | typeof SESSIONS.post, etNow: Date): SessionStatus {
  const currentMinutes = etNow.getHours() * 60 + etNow.getMinutes();
  const startMinutes = session.start.hours * 60 + session.start.minutes;
  const endMinutes = session.end.hours * 60 + session.end.minutes;
  
  // After session ended
  if (currentMinutes >= endMinutes) {
    return { 
      state: 'ended', 
      label: 'Ended',
      shortLabel: session.shortLabel,
    };
  }
  
  // During session
  if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
    const remainingMinutes = endMinutes - currentMinutes;
    return { 
      state: 'live', 
      countdown: formatCountdown(remainingMinutes),
      label: 'LIVE',
      shortLabel: 'LIVE',
    };
  }
  
  // Before session
  const minutesUntilStart = startMinutes - currentMinutes;
  
  // Starting within 30 minutes - "soon" state
  if (minutesUntilStart <= 30 && minutesUntilStart > 0) {
    return {
      state: 'soon',
      countdown: formatCountdown(minutesUntilStart),
      label: `In ${formatCountdown(minutesUntilStart)}`,
      shortLabel: formatCountdown(minutesUntilStart),
    };
  }
  
  // Starting within 2 hours - show countdown
  if (minutesUntilStart <= 120 && minutesUntilStart > 0) {
    return {
      state: 'upcoming',
      countdown: formatCountdown(minutesUntilStart),
      label: `In ${formatCountdown(minutesUntilStart)}`,
      shortLabel: session.shortLabel,
    };
  }
  
  // Waiting for session (more than 2 hours away)
  return {
    state: 'waiting',
    label: session.label,
    shortLabel: session.shortLabel,
  };
}

export function LiveBadge({ time, isToday, isPending }: LiveBadgeProps) {
  const [status, setStatus] = useState<SessionStatus | null>(null);
  const [mounted, setMounted] = useState(false);
  const prefersReducedMotion = useRef(false);
  
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }, []);

  // Update status every 30 seconds
  useEffect(() => {
    if (!isToday || !isPending) return;
    
    const session = SESSIONS[time];
    
    const updateStatus = () => {
      const etNow = getETTime();
      setStatus(getSessionStatus(session, etNow));
    };
    
    updateStatus();
    const interval = setInterval(updateStatus, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [isToday, isPending, time]);

  // Don't show badge for non-today or reported earnings
  if (!isToday || !isPending || !mounted || !status) {
    return null;
  }

  // Don't show if session has ended
  if (status.state === 'ended') {
    return null;
  }

  const isLive = status.state === 'live';
  const isSoon = status.state === 'soon';
  const isUpcoming = status.state === 'upcoming';

  return (
    <div 
      className={`live-badge-v2 ${status.state}`}
      data-state={status.state}
      aria-label={isLive ? `Live now, ${status.countdown} remaining` : status.label}
    >
      {/* Pulsing glow for live state */}
      {isLive && !prefersReducedMotion.current && (
        <span className="live-badge-glow" aria-hidden="true" />
      )}
      
      {/* Dot indicator */}
      <span className={`live-badge-dot ${isLive ? 'pulsing' : ''}`} />
      
      {/* Label text */}
      <span className="live-badge-text">
        {isLive ? 'LIVE' : isSoon ? status.countdown : status.shortLabel}
      </span>
      
      {/* Countdown for live state */}
      {isLive && status.countdown && (
        <span className="live-badge-countdown">{status.countdown}</span>
      )}
      
      {/* Soon indicator - breathing animation */}
      {isSoon && !prefersReducedMotion.current && (
        <span className="live-badge-soon-glow" aria-hidden="true" />
      )}
    </div>
  );
}

// Compact inline dot version - enhanced with mini countdown
export function LiveDot({ isToday, isPending, time }: { isToday: boolean; isPending: boolean; time?: 'pre' | 'post' }) {
  const [isLive, setIsLive] = useState(false);
  const [isSoon, setIsSoon] = useState(false);
  
  useEffect(() => {
    if (!isToday || !isPending || !time) return;
    
    const session = SESSIONS[time];
    
    const checkStatus = () => {
      const etNow = getETTime();
      const status = getSessionStatus(session, etNow);
      setIsLive(status.state === 'live');
      setIsSoon(status.state === 'soon');
    };
    
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, [isToday, isPending, time]);

  if (!isToday || !isPending) {
    return null;
  }

  return (
    <span 
      className={`live-dot-inline ${isLive ? 'live' : ''} ${isSoon ? 'soon' : ''}`}
      title={isLive ? 'Reporting now' : isSoon ? 'Reporting soon' : 'Reporting today'}
      aria-label={isLive ? 'Live now' : 'Reporting today'}
    />
  );
}
