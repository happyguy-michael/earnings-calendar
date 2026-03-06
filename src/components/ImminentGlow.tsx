'use client';

import { useState, useEffect, useMemo } from 'react';

interface ImminentGlowProps {
  /** Target date for the earnings report */
  targetDate: Date;
  /** Time string like "BMO" (before market open) or "AMC" (after market close) */
  time?: string;
  /** Minutes threshold for "imminent" state (default: 15) */
  imminentMinutes?: number;
  /** Minutes threshold for "urgent" state (default: 5) */
  urgentMinutes?: number;
  /** Whether the component is active (typically only for today's pending) */
  active?: boolean;
}

/**
 * Calculate approximate report time based on date and time string.
 * BMO: 7:00 AM ET / AMC: 4:00 PM ET
 */
function getReportTime(date: Date, time?: string): Date {
  const reportDate = new Date(date);
  
  if (time?.toUpperCase() === 'BMO') {
    // Before market open - typically 7:00 AM ET (12:00 UTC)
    reportDate.setHours(7, 0, 0, 0);
  } else if (time?.toUpperCase() === 'AMC') {
    // After market close - typically 4:00 PM ET (21:00 UTC)
    reportDate.setHours(16, 0, 0, 0);
  } else {
    // Default to end of day
    reportDate.setHours(23, 59, 59, 999);
  }
  
  return reportDate;
}

/**
 * ImminentGlow - Pulsing ambient halo effect for earnings reporting soon.
 * 
 * Creates visual urgency for imminent earnings releases:
 * - Amber breathing glow when within 15 minutes
 * - Red pulsing glow when within 5 minutes
 * - Intensity increases as time approaches
 * - Respects prefers-reduced-motion
 * 
 * Designed to wrap earnings cards and add a subtle but attention-grabbing
 * effect that complements the FlipCountdownBadge.
 */
export function ImminentGlow({ 
  targetDate, 
  time, 
  imminentMinutes = 15,
  urgentMinutes = 5,
  active = true 
}: ImminentGlowProps) {
  const [minutesUntil, setMinutesUntil] = useState<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  // Calculate target report time
  const reportTime = useMemo(
    () => getReportTime(targetDate, time), 
    [targetDate, time]
  );
  
  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  // Update time remaining every 10 seconds
  useEffect(() => {
    if (!active) return;
    
    const updateTime = () => {
      const now = new Date();
      const diff = reportTime.getTime() - now.getTime();
      const minutes = Math.floor(diff / (1000 * 60));
      setMinutesUntil(minutes);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 10000);
    
    return () => clearInterval(interval);
  }, [reportTime, active]);
  
  // Don't render if not active, past time, or outside imminent window
  if (!active || minutesUntil === null || minutesUntil < 0 || minutesUntil > imminentMinutes) {
    return null;
  }
  
  const isUrgent = minutesUntil <= urgentMinutes;
  
  // Calculate intensity based on time remaining (0-1 scale, higher = more urgent)
  const intensity = 1 - (minutesUntil / imminentMinutes);
  
  // Animation speed increases with urgency
  const animationDuration = isUrgent ? '1s' : '2s';
  
  return (
    <>
      {/* Outer breathing glow */}
      <div 
        className={`imminent-glow-outer ${isUrgent ? 'urgent' : ''}`}
        style={{
          '--glow-intensity': intensity,
          '--glow-duration': animationDuration,
        } as React.CSSProperties}
        aria-hidden="true"
      />
      
      {/* Inner pulse ring */}
      <div 
        className={`imminent-glow-inner ${isUrgent ? 'urgent' : ''}`}
        style={{
          '--glow-intensity': intensity,
          '--glow-duration': animationDuration,
        } as React.CSSProperties}
        aria-hidden="true"
      />
      
      {/* Reduced motion: static glow only */}
      {prefersReducedMotion && (
        <div 
          className={`imminent-glow-static ${isUrgent ? 'urgent' : ''}`}
          style={{ '--glow-intensity': intensity } as React.CSSProperties}
          aria-hidden="true"
        />
      )}
    </>
  );
}

/**
 * useImminentState - Hook to check if an earnings report is imminent.
 * 
 * Returns state information for conditional rendering/styling.
 */
export function useImminentState(
  targetDate: Date, 
  time?: string,
  imminentMinutes = 15,
  urgentMinutes = 5
): { isImminent: boolean; isUrgent: boolean; minutesUntil: number | null } {
  const [minutesUntil, setMinutesUntil] = useState<number | null>(null);
  
  const reportTime = useMemo(
    () => getReportTime(targetDate, time), 
    [targetDate, time]
  );
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const diff = reportTime.getTime() - now.getTime();
      const minutes = Math.floor(diff / (1000 * 60));
      setMinutesUntil(minutes);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 10000);
    
    return () => clearInterval(interval);
  }, [reportTime]);
  
  const isImminent = minutesUntil !== null && minutesUntil >= 0 && minutesUntil <= imminentMinutes;
  const isUrgent = minutesUntil !== null && minutesUntil >= 0 && minutesUntil <= urgentMinutes;
  
  return { isImminent, isUrgent, minutesUntil };
}

export default ImminentGlow;
