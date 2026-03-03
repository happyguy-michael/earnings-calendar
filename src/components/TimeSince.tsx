'use client';

import { useState, useEffect } from 'react';

interface TimeSinceProps {
  /** The date/time when the earnings were reported */
  reportedAt: Date;
  /** Report time: pre-market or after hours */
  time: 'pre' | 'post' | 'intraday' | undefined;
  /** Compact mode for inline display */
  compact?: boolean;
}

/**
 * Get the actual report time based on pre/post market
 */
function getReportTime(date: Date, time: 'pre' | 'post' | 'intraday' | undefined): Date {
  const reportTime = new Date(date);
  if (time === 'pre') {
    // Pre-market reports typically come out around 6:30-7:00 AM ET
    reportTime.setHours(7, 0, 0, 0);
  } else if (time === 'post') {
    // After-hours reports typically come out around 4:00-4:30 PM ET
    reportTime.setHours(16, 15, 0, 0);
  } else {
    reportTime.setHours(16, 0, 0, 0);
  }
  return reportTime;
}

/**
 * Format time since report
 */
function formatTimeSince(ms: number): { value: string; isRecent: boolean; isVeryRecent: boolean } {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  // Very recent: under 30 minutes
  const isVeryRecent = minutes < 30;
  // Recent: under 4 hours
  const isRecent = hours < 4;

  if (minutes < 1) {
    return { value: 'Just now', isRecent: true, isVeryRecent: true };
  }
  if (minutes < 60) {
    return { value: `${minutes}m ago`, isRecent: true, isVeryRecent };
  }
  if (hours < 24) {
    const remainingMins = minutes % 60;
    if (remainingMins > 0 && hours < 4) {
      return { value: `${hours}h ${remainingMins}m ago`, isRecent, isVeryRecent: false };
    }
    return { value: `${hours}h ago`, isRecent, isVeryRecent: false };
  }
  if (days === 1) {
    return { value: 'Yesterday', isRecent: false, isVeryRecent: false };
  }
  return { value: `${days}d ago`, isRecent: false, isVeryRecent: false };
}

/**
 * TimeSinceBadge - Shows how long ago earnings were reported
 * 
 * Features:
 * - Real-time updating (every minute)
 * - "NEW" pulse badge for very recent results (<30 min)
 * - Gradient glow for recent results (<4 hours)
 * - Compact mode for card display
 * - Respects prefers-reduced-motion
 */
export function TimeSinceBadge({ reportedAt, time, compact = false }: TimeSinceProps) {
  const [timeSince, setTimeSince] = useState<{ value: string; isRecent: boolean; isVeryRecent: boolean } | null>(null);

  useEffect(() => {
    const reportTime = getReportTime(reportedAt, time);
    
    const update = () => {
      const now = Date.now();
      const diff = now - reportTime.getTime();
      
      // Only show if report has happened
      if (diff < 0) {
        setTimeSince(null);
        return;
      }
      
      // Don't show if more than 7 days ago
      if (diff > 7 * 24 * 60 * 60 * 1000) {
        setTimeSince(null);
        return;
      }
      
      setTimeSince(formatTimeSince(diff));
    };

    update();
    // Update every minute
    const interval = setInterval(update, 60000);

    return () => clearInterval(interval);
  }, [reportedAt, time]);

  if (!timeSince) return null;

  if (compact) {
    return (
      <span className={`time-since-compact ${timeSince.isRecent ? 'recent' : ''} ${timeSince.isVeryRecent ? 'very-recent' : ''}`}>
        {timeSince.isVeryRecent && <span className="new-dot" />}
        <span className="time-since-value">{timeSince.value}</span>
      </span>
    );
  }

  return (
    <div className={`time-since-badge ${timeSince.isRecent ? 'recent' : ''} ${timeSince.isVeryRecent ? 'very-recent' : ''}`}>
      {timeSince.isVeryRecent && (
        <span className="new-badge">
          <span className="new-badge-pulse" />
          NEW
        </span>
      )}
      <span className="time-since-icon">✓</span>
      <span className="time-since-text">
        <span className="time-since-label">Reported</span>
        <span className="time-since-value">{timeSince.value}</span>
      </span>
    </div>
  );
}

/**
 * Inline time indicator for earnings cards
 */
export function TimeSinceInline({ reportedAt, time }: Omit<TimeSinceProps, 'compact'>) {
  const [timeSince, setTimeSince] = useState<{ value: string; isRecent: boolean; isVeryRecent: boolean } | null>(null);

  useEffect(() => {
    const reportTime = getReportTime(reportedAt, time);
    
    const update = () => {
      const now = Date.now();
      const diff = now - reportTime.getTime();
      
      if (diff < 0 || diff > 48 * 60 * 60 * 1000) {
        setTimeSince(null);
        return;
      }
      
      setTimeSince(formatTimeSince(diff));
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [reportedAt, time]);

  if (!timeSince) return null;

  return (
    <span className={`time-since-inline ${timeSince.isVeryRecent ? 'pulse' : ''}`}>
      {timeSince.value}
    </span>
  );
}
