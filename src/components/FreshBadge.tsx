'use client';

import { useMemo, useState, useEffect } from 'react';

interface FreshBadgeProps {
  reportedAt: Date;
  time: 'pre' | 'post';
  freshnessHours?: number; // How many hours to consider "fresh"
  className?: string;
}

/**
 * Get the approximate report time for an earnings release.
 * Pre-market: ~7:00 AM ET (reports usually out by market open 9:30)
 * After-hours: ~4:30 PM ET (reports usually out right after close)
 */
function getReportTime(date: Date, time: 'pre' | 'post'): Date {
  const reportDate = new Date(date);
  if (time === 'pre') {
    // Pre-market typically reported 6-8 AM ET
    reportDate.setHours(7, 0, 0, 0);
  } else {
    // After hours typically reported 4-5 PM ET
    reportDate.setHours(16, 30, 0, 0);
  }
  return reportDate;
}

/**
 * Animated "FRESH" badge for recently reported earnings.
 * Shows a pulsing indicator to highlight breaking news.
 * Auto-hides after freshnessHours have passed.
 */
export function FreshBadge({ 
  reportedAt, 
  time, 
  freshnessHours = 4,
  className = '' 
}: FreshBadgeProps) {
  const [isVisible, setIsVisible] = useState(true);
  
  const { isFresh, hoursAgo, minutesAgo } = useMemo(() => {
    const now = new Date();
    const reportTime = getReportTime(reportedAt, time);
    const diffMs = now.getTime() - reportTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    return {
      isFresh: diffHours >= 0 && diffHours < freshnessHours,
      hoursAgo: Math.floor(diffHours),
      minutesAgo: diffMinutes,
    };
  }, [reportedAt, time, freshnessHours]);
  
  // Check freshness periodically
  useEffect(() => {
    if (!isFresh) {
      setIsVisible(false);
      return;
    }
    
    // Re-check every minute
    const interval = setInterval(() => {
      const now = new Date();
      const reportTime = getReportTime(reportedAt, time);
      const diffMs = now.getTime() - reportTime.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      
      if (diffHours >= freshnessHours) {
        setIsVisible(false);
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, [reportedAt, time, freshnessHours, isFresh]);
  
  if (!isVisible || !isFresh) return null;
  
  // Determine display text
  const displayText = minutesAgo < 60 
    ? `${minutesAgo}m ago` 
    : `${hoursAgo}h ago`;
  
  return (
    <span className={`fresh-badge ${className}`} title={`Reported ${displayText}`}>
      <span className="fresh-badge-pulse" aria-hidden="true" />
      <span className="fresh-badge-pulse fresh-badge-pulse-delayed" aria-hidden="true" />
      <span className="fresh-badge-content">
        <svg 
          width="10" 
          height="10" 
          viewBox="0 0 10 10" 
          fill="currentColor"
          className="fresh-badge-icon"
        >
          <circle cx="5" cy="5" r="3" />
        </svg>
        <span className="fresh-badge-text">FRESH</span>
      </span>
    </span>
  );
}

/**
 * Compact version for tight spaces - just the dot with pulse.
 */
export function FreshDot({ 
  reportedAt, 
  time, 
  freshnessHours = 4 
}: Omit<FreshBadgeProps, 'className'>) {
  const isFresh = useMemo(() => {
    const now = new Date();
    const reportTime = getReportTime(reportedAt, time);
    const diffMs = now.getTime() - reportTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return diffHours >= 0 && diffHours < freshnessHours;
  }, [reportedAt, time, freshnessHours]);
  
  if (!isFresh) return null;
  
  return (
    <span className="fresh-dot" title="Just reported">
      <span className="fresh-dot-pulse" aria-hidden="true" />
      <span className="fresh-dot-core" />
    </span>
  );
}

export default FreshBadge;
