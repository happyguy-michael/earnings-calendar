'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import './LiveMarketClock.css';

interface LiveMarketClockProps {
  /** Show seconds (default: false for cleaner look) */
  showSeconds?: boolean;
  /** Show timezone label (default: true) */
  showTimezone?: boolean;
  /** Compact mode for header placement */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Calculate current Eastern Time
 * Handles EST (UTC-5) and EDT (UTC-4) based on DST
 */
function getEasternTime(): Date {
  const now = new Date();
  
  // Get the UTC time
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  
  // Calculate if DST is in effect (US rules: 2nd Sunday March to 1st Sunday November)
  const year = now.getFullYear();
  
  // Find 2nd Sunday of March
  const marchFirst = new Date(year, 2, 1);
  const marchSunday = 14 - marchFirst.getDay();
  const dstStart = new Date(year, 2, marchSunday, 2, 0, 0);
  
  // Find 1st Sunday of November
  const novFirst = new Date(year, 10, 1);
  const novSunday = novFirst.getDay() === 0 ? 1 : 8 - novFirst.getDay();
  const dstEnd = new Date(year, 10, novSunday, 2, 0, 0);
  
  // Check if we're in DST
  const isDST = now >= dstStart && now < dstEnd;
  
  // ET offset: -4 for EDT (summer), -5 for EST (winter)
  const etOffset = isDST ? -4 : -5;
  
  // Create new Date in Eastern Time
  return new Date(utc + (etOffset * 3600000));
}

/**
 * Single animated digit with flip effect
 */
const AnimatedDigit = memo(function AnimatedDigit({ 
  value, 
  prevValue 
}: { 
  value: string; 
  prevValue: string;
}) {
  const hasChanged = value !== prevValue;
  
  return (
    <span className={`lmc-digit ${hasChanged ? 'lmc-digit-flip' : ''}`} data-value={value}>
      {value}
    </span>
  );
});

/**
 * LiveMarketClock - Real-time Eastern Time display
 * 
 * Shows the current US Eastern Time (ET) with smooth digit animations.
 * Essential for tracking market hours and earnings timing.
 * 
 * Features:
 * - Live updating clock (every second or minute)
 * - Smooth flip animation on digit changes
 * - Automatic EST/EDT handling
 * - Compact mode for header integration
 * - Pulse animation on the colon separator
 * - Respects prefers-reduced-motion
 * 
 * 2026 Trend: Motion-driven interfaces with purposeful animation
 */
export function LiveMarketClock({
  showSeconds = false,
  showTimezone = true,
  compact = false,
  className = '',
}: LiveMarketClockProps) {
  const [time, setTime] = useState<Date | null>(null);
  const [prevTime, setPrevTime] = useState<Date | null>(null);
  
  // Update time
  useEffect(() => {
    const updateTime = () => {
      setPrevTime(time);
      setTime(getEasternTime());
    };
    
    // Initial update
    updateTime();
    
    // Update interval based on whether we show seconds
    const interval = setInterval(updateTime, showSeconds ? 1000 : 1000);
    
    return () => clearInterval(interval);
  }, [showSeconds, time]);
  
  // Format time parts
  const timeParts = useMemo(() => {
    if (!time) return null;
    
    const hours24 = time.getHours();
    const hours12 = hours24 % 12 || 12;
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    const ampm = hours24 >= 12 ? 'PM' : 'AM';
    
    // Calculate previous values for animation
    const prevHours24 = prevTime?.getHours() ?? hours24;
    const prevHours12 = prevHours24 % 12 || 12;
    const prevMinutes = prevTime?.getMinutes() ?? minutes;
    const prevSeconds = prevTime?.getSeconds() ?? seconds;
    
    // Determine timezone label
    const year = new Date().getFullYear();
    const marchFirst = new Date(year, 2, 1);
    const marchSunday = 14 - marchFirst.getDay();
    const dstStart = new Date(year, 2, marchSunday, 2, 0, 0);
    const novFirst = new Date(year, 10, 1);
    const novSunday = novFirst.getDay() === 0 ? 1 : 8 - novFirst.getDay();
    const dstEnd = new Date(year, 10, novSunday, 2, 0, 0);
    const now = new Date();
    const isDST = now >= dstStart && now < dstEnd;
    const tzLabel = isDST ? 'EDT' : 'EST';
    
    return {
      hoursStr: hours12.toString().padStart(2, '0'),
      prevHoursStr: prevHours12.toString().padStart(2, '0'),
      minutesStr: minutes.toString().padStart(2, '0'),
      prevMinutesStr: prevMinutes.toString().padStart(2, '0'),
      secondsStr: seconds.toString().padStart(2, '0'),
      prevSecondsStr: prevSeconds.toString().padStart(2, '0'),
      ampm,
      tzLabel,
    };
  }, [time, prevTime]);
  
  // Don't render until we have time (avoid hydration mismatch)
  if (!timeParts) {
    return (
      <div className={`lmc-container lmc-loading ${compact ? 'lmc-compact' : ''} ${className}`}>
        <span className="lmc-placeholder">--:--</span>
        {showTimezone && <span className="lmc-tz">ET</span>}
      </div>
    );
  }
  
  return (
    <div className={`lmc-container ${compact ? 'lmc-compact' : ''} ${className}`}>
      {/* Hours */}
      <span className="lmc-digits">
        <AnimatedDigit 
          value={timeParts.hoursStr[0]} 
          prevValue={timeParts.prevHoursStr[0]} 
        />
        <AnimatedDigit 
          value={timeParts.hoursStr[1]} 
          prevValue={timeParts.prevHoursStr[1]} 
        />
      </span>
      
      {/* Colon separator with pulse */}
      <span className="lmc-colon">:</span>
      
      {/* Minutes */}
      <span className="lmc-digits">
        <AnimatedDigit 
          value={timeParts.minutesStr[0]} 
          prevValue={timeParts.prevMinutesStr[0]} 
        />
        <AnimatedDigit 
          value={timeParts.minutesStr[1]} 
          prevValue={timeParts.prevMinutesStr[1]} 
        />
      </span>
      
      {/* Seconds (optional) */}
      {showSeconds && (
        <>
          <span className="lmc-colon lmc-colon-sec">:</span>
          <span className="lmc-digits lmc-seconds">
            <AnimatedDigit 
              value={timeParts.secondsStr[0]} 
              prevValue={timeParts.prevSecondsStr[0]} 
            />
            <AnimatedDigit 
              value={timeParts.secondsStr[1]} 
              prevValue={timeParts.prevSecondsStr[1]} 
            />
          </span>
        </>
      )}
      
      {/* AM/PM indicator */}
      <span className="lmc-ampm">{timeParts.ampm}</span>
      
      {/* Timezone label */}
      {showTimezone && (
        <span className="lmc-tz">{timeParts.tzLabel}</span>
      )}
    </div>
  );
}

export default LiveMarketClock;
