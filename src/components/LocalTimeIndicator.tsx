'use client';

import { useState, useEffect, useMemo, memo } from 'react';

/**
 * LocalTimeIndicator
 * 
 * A compact badge showing earnings time in the user's local timezone,
 * with the original ET time in a tooltip. Essential for international
 * users who need to plan around US market earnings.
 * 
 * Inspiration:
 * - Google Calendar's timezone conversion display
 * - Flight booking sites showing local arrival times
 * - Trading platforms with multi-timezone support
 * - 2026 "Global by default" trend - respecting international users
 * 
 * Key Insight: US earnings happen at inconvenient hours for most of the world.
 * A 4pm ET after-hours report is 4am in Singapore, 9pm in London.
 * Users need this context to decide whether to stay up or check tomorrow.
 * 
 * Features:
 * - Auto-detects user's timezone from browser
 * - Shows local time only if different from ET
 * - Handles DST correctly for both zones
 * - Animated entrance on viewport intersection
 * - Compact badge or inline text variants
 * - Hover tooltip with full details
 * - Respects prefers-reduced-motion
 * - Light/dark mode support
 */

interface LocalTimeIndicatorProps {
  /** Report time: 'pre' (9:30 AM ET) or 'post' (4:00 PM ET) */
  session: 'pre' | 'post';
  /** Date string (YYYY-MM-DD) for accurate DST calculation */
  date?: string;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md';
  /** Show ET time alongside local time */
  showET?: boolean;
  /** Show timezone abbreviation */
  showTimezone?: boolean;
  /** Variant: badge or inline text */
  variant?: 'badge' | 'inline';
  /** Show "tomorrow" or "same day" context */
  showDayContext?: boolean;
  /** Animation delay in ms */
  delay?: number;
  /** Additional class name */
  className?: string;
}

interface TimeConversion {
  etTime: string;
  etAmPm: string;
  localTime: string;
  localAmPm: string;
  localTimezone: string;
  isSameTimezone: boolean;
  isNextDay: boolean;
  isPreviousDay: boolean;
  hoursDiff: number;
}

/**
 * Get Eastern Time offset in hours (handles DST)
 */
function getETOffset(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  // US DST: 2nd Sunday of March to 1st Sunday of November
  const marchFirst = new Date(year, 2, 1);
  const dstStartDay = 14 - marchFirst.getDay();
  const dstStart = new Date(year, 2, dstStartDay, 2, 0, 0);
  
  const novFirst = new Date(year, 10, 1);
  const dstEndDay = novFirst.getDay() === 0 ? 1 : 8 - novFirst.getDay();
  const dstEnd = new Date(year, 10, dstEndDay, 2, 0, 0);
  
  // EDT (UTC-4) or EST (UTC-5)
  return date >= dstStart && date < dstEnd ? -4 : -5;
}

/**
 * Calculate time conversion from ET to local
 */
function calculateTimeConversion(
  session: 'pre' | 'post',
  dateStr?: string
): TimeConversion {
  // Parse date or use today
  const baseDate = dateStr ? new Date(dateStr + 'T12:00:00') : new Date();
  
  // ET session times
  const etHour = session === 'pre' ? 9 : 16;
  const etMinute = session === 'pre' ? 30 : 0;
  
  // Create Date in ET
  const etOffset = getETOffset(baseDate);
  const utcHour = etHour - etOffset; // Convert ET to UTC
  
  // Create UTC date
  const utcDate = new Date(baseDate);
  utcDate.setUTCHours(utcHour, etMinute, 0, 0);
  
  // Get local time from UTC date
  const localHours = utcDate.getHours();
  const localMinutes = utcDate.getMinutes();
  const localDate = utcDate.getDate();
  const originalDate = baseDate.getDate();
  
  // Check if day changed
  const isNextDay = localDate > originalDate;
  const isPreviousDay = localDate < originalDate;
  
  // Format times
  const formatTime = (h: number, m: number) => {
    const h12 = h % 12 || 12;
    const mStr = m.toString().padStart(2, '0');
    return `${h12}:${mStr}`;
  };
  
  const getAmPm = (h: number) => h >= 12 ? 'PM' : 'AM';
  
  // Get local timezone abbreviation
  const localTimezone = Intl.DateTimeFormat('en-US', { 
    timeZoneName: 'short' 
  }).formatToParts(utcDate).find(p => p.type === 'timeZoneName')?.value || '';
  
  // Calculate if same timezone (within 30 min tolerance)
  const localOffsetMinutes = -utcDate.getTimezoneOffset();
  const etOffsetMinutes = etOffset * 60;
  const isSameTimezone = Math.abs(localOffsetMinutes - etOffsetMinutes) < 30;
  
  // Hours difference
  const hoursDiff = (localOffsetMinutes - etOffsetMinutes) / 60;
  
  return {
    etTime: formatTime(etHour, etMinute),
    etAmPm: getAmPm(etHour),
    localTime: formatTime(localHours, localMinutes),
    localAmPm: getAmPm(localHours),
    localTimezone,
    isSameTimezone,
    isNextDay,
    isPreviousDay,
    hoursDiff,
  };
}

export const LocalTimeIndicator = memo(function LocalTimeIndicator({
  session,
  date,
  size = 'sm',
  showET = false,
  showTimezone = true,
  variant = 'badge',
  showDayContext = true,
  delay = 0,
  className = '',
}: LocalTimeIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  const conversion = useMemo(() => {
    if (!mounted) return null;
    return calculateTimeConversion(session, date);
  }, [session, date, mounted]);
  
  // Don't render if same timezone (user is in ET)
  if (!conversion || conversion.isSameTimezone) {
    return null;
  }
  
  const sizeClasses = {
    xs: 'lti-xs',
    sm: 'lti-sm',
    md: 'lti-md',
  };
  
  // Build day context label
  const dayContextLabel = conversion.isNextDay 
    ? '+1d' 
    : conversion.isPreviousDay 
    ? '-1d' 
    : null;
  
  // Build display text
  const displayTime = `${conversion.localTime} ${conversion.localAmPm}`;
  const etDisplay = `${conversion.etTime} ${conversion.etAmPm} ET`;
  
  // Tooltip content
  const tooltipText = [
    `${etDisplay}`,
    `= ${displayTime}${showTimezone ? ` ${conversion.localTimezone}` : ''}`,
    conversion.isNextDay ? '(next day)' : '',
    conversion.isPreviousDay ? '(previous day)' : '',
    `(${conversion.hoursDiff >= 0 ? '+' : ''}${conversion.hoursDiff}h from ET)`,
  ].filter(Boolean).join(' ');
  
  return (
    <>
      <span 
        className={`local-time-indicator ${sizeClasses[size]} ${variant === 'badge' ? 'lti-badge' : 'lti-inline'} ${isVisible ? 'lti-visible' : ''} ${className}`}
        title={tooltipText}
        aria-label={`Local time: ${displayTime}${dayContextLabel ? ` (${dayContextLabel})` : ''}`}
      >
        {/* Globe icon for visual context */}
        <svg 
          className="lti-icon" 
          viewBox="0 0 16 16" 
          fill="none"
          aria-hidden="true"
        >
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
          <ellipse cx="8" cy="8" rx="3" ry="6.5" stroke="currentColor" strokeWidth="1" />
          <line x1="1.5" y1="8" x2="14.5" y2="8" stroke="currentColor" strokeWidth="1" />
        </svg>
        
        {/* Time display */}
        <span className="lti-time">
          {showET && (
            <>
              <span className="lti-et">{conversion.etTime}</span>
              <span className="lti-arrow">→</span>
            </>
          )}
          <span className="lti-local">{conversion.localTime}</span>
          <span className="lti-ampm">{conversion.localAmPm}</span>
          {showTimezone && (
            <span className="lti-tz">{conversion.localTimezone}</span>
          )}
          {showDayContext && dayContextLabel && (
            <span className={`lti-day-badge ${conversion.isNextDay ? 'lti-next' : 'lti-prev'}`}>
              {dayContextLabel}
            </span>
          )}
        </span>
      </span>
      
      <style jsx>{`
        .local-time-indicator {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-mono, ui-monospace, monospace);
          font-feature-settings: 'tnum';
          white-space: nowrap;
          opacity: 0;
          transform: translateY(4px);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        
        .lti-visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        /* Size variants */
        .lti-xs {
          font-size: 10px;
          gap: 3px;
        }
        .lti-sm {
          font-size: 11px;
        }
        .lti-md {
          font-size: 12px;
          gap: 5px;
        }
        
        /* Badge variant */
        .lti-badge {
          padding: 3px 6px;
          border-radius: 6px;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.2);
          color: #8b5cf6;
        }
        
        :global(.dark) .lti-badge {
          background: rgba(139, 92, 246, 0.15);
          border-color: rgba(139, 92, 246, 0.3);
          color: #a78bfa;
        }
        
        /* Inline variant */
        .lti-inline {
          color: #6b7280;
        }
        
        :global(.dark) .lti-inline {
          color: #9ca3af;
        }
        
        /* Icon */
        .lti-icon {
          width: 12px;
          height: 12px;
          flex-shrink: 0;
          opacity: 0.7;
        }
        
        .lti-xs .lti-icon {
          width: 10px;
          height: 10px;
        }
        
        .lti-md .lti-icon {
          width: 14px;
          height: 14px;
        }
        
        /* Time parts */
        .lti-time {
          display: inline-flex;
          align-items: center;
          gap: 2px;
        }
        
        .lti-et {
          opacity: 0.6;
        }
        
        .lti-arrow {
          opacity: 0.4;
          font-size: 0.9em;
          margin: 0 2px;
        }
        
        .lti-local {
          font-weight: 600;
        }
        
        .lti-ampm {
          font-size: 0.85em;
          opacity: 0.8;
          margin-left: 1px;
        }
        
        .lti-tz {
          font-size: 0.8em;
          opacity: 0.6;
          margin-left: 3px;
        }
        
        /* Day change badge */
        .lti-day-badge {
          font-size: 0.75em;
          font-weight: 700;
          padding: 1px 4px;
          border-radius: 4px;
          margin-left: 4px;
        }
        
        .lti-next {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }
        
        :global(.dark) .lti-next {
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
        }
        
        .lti-prev {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
        }
        
        :global(.dark) .lti-prev {
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
        }
        
        /* Hover state */
        .lti-badge:hover {
          background: rgba(139, 92, 246, 0.15);
          border-color: rgba(139, 92, 246, 0.35);
        }
        
        :global(.dark) .lti-badge:hover {
          background: rgba(139, 92, 246, 0.2);
          border-color: rgba(139, 92, 246, 0.4);
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .local-time-indicator {
            transition: opacity 0.15s ease;
            transform: none;
          }
        }
      `}</style>
    </>
  );
});

/**
 * LocalTimeTooltip - Hover wrapper that shows local time conversion
 * 
 * Use this to wrap existing time displays and add local time context on hover.
 */
interface LocalTimeTooltipProps {
  session: 'pre' | 'post';
  date?: string;
  children: React.ReactNode;
  className?: string;
}

export function LocalTimeTooltip({ 
  session, 
  date, 
  children, 
  className = '' 
}: LocalTimeTooltipProps) {
  const [mounted, setMounted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const conversion = useMemo(() => {
    if (!mounted) return null;
    return calculateTimeConversion(session, date);
  }, [session, date, mounted]);
  
  // If same timezone, just render children without tooltip
  if (!conversion || conversion.isSameTimezone) {
    return <>{children}</>;
  }
  
  const tooltipText = `Your time: ${conversion.localTime} ${conversion.localAmPm} ${conversion.localTimezone}${
    conversion.isNextDay ? ' (next day)' : conversion.isPreviousDay ? ' (prev day)' : ''
  }`;
  
  return (
    <span 
      className={`ltt-wrapper ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      style={{ position: 'relative', display: 'inline-flex', cursor: 'help' }}
    >
      {children}
      {showTooltip && (
        <span 
          className="ltt-tooltip"
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '6px',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            zIndex: 50,
            pointerEvents: 'none',
            animation: 'ltt-fadeIn 0.15s ease',
          }}
        >
          {tooltipText}
        </span>
      )}
      <style jsx>{`
        @keyframes ltt-fadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(4px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </span>
  );
}

export default LocalTimeIndicator;
