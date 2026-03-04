'use client';

import { useState, useEffect, useMemo } from 'react';

interface MarketSession {
  isOpen: boolean;
  phase: 'pre-market' | 'regular' | 'after-hours' | 'closed';
  nextEventLabel: string;
  nextEventTime: Date;
  progressPercent: number;
}

/**
 * Calculate market status based on US Eastern Time.
 * Pre-market: 4:00 AM - 9:30 AM ET
 * Regular: 9:30 AM - 4:00 PM ET
 * After-hours: 4:00 PM - 8:00 PM ET
 * Closed: 8:00 PM - 4:00 AM ET (and weekends)
 */
function getMarketSession(): MarketSession {
  const now = new Date();
  
  // Convert to ET (handle DST approximately)
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  const utcDay = now.getUTCDay();
  
  // EST is UTC-5, EDT is UTC-4
  // Simple approximation: use EDT March-November
  const month = now.getUTCMonth();
  const isDST = month >= 2 && month <= 10; // March (2) to November (10)
  const etOffset = isDST ? 4 : 5;
  
  let etHours = utcHours - etOffset;
  let etDay = utcDay;
  if (etHours < 0) {
    etHours += 24;
    etDay = (etDay - 1 + 7) % 7;
  }
  
  const etMinutes = utcMinutes;
  const etTotalMinutes = etHours * 60 + etMinutes;
  
  // Weekend check (Saturday = 6, Sunday = 0)
  if (etDay === 0 || etDay === 6) {
    // Calculate next Monday 4:00 AM ET
    const daysUntilMonday = etDay === 0 ? 1 : 2;
    const nextOpen = new Date(now);
    nextOpen.setUTCDate(nextOpen.getUTCDate() + daysUntilMonday);
    nextOpen.setUTCHours(4 + etOffset, 0, 0, 0);
    
    return {
      isOpen: false,
      phase: 'closed',
      nextEventLabel: 'Pre-market opens',
      nextEventTime: nextOpen,
      progressPercent: 0,
    };
  }
  
  // Market hours in minutes from midnight ET
  const preMarketOpen = 4 * 60;      // 4:00 AM
  const regularOpen = 9 * 60 + 30;    // 9:30 AM
  const regularClose = 16 * 60;       // 4:00 PM
  const afterHoursClose = 20 * 60;    // 8:00 PM
  
  // Helper to create time for today/tomorrow
  const createETTime = (hours: number, minutes: number, tomorrow = false): Date => {
    const date = new Date(now);
    if (tomorrow) {
      date.setUTCDate(date.getUTCDate() + 1);
    }
    date.setUTCHours(hours + etOffset, minutes, 0, 0);
    return date;
  };
  
  // Determine phase and next event
  if (etTotalMinutes < preMarketOpen) {
    // Before pre-market (closed overnight)
    return {
      isOpen: false,
      phase: 'closed',
      nextEventLabel: 'Pre-market opens',
      nextEventTime: createETTime(4, 0),
      progressPercent: 0,
    };
  }
  
  if (etTotalMinutes < regularOpen) {
    // Pre-market session
    const sessionDuration = regularOpen - preMarketOpen;
    const elapsed = etTotalMinutes - preMarketOpen;
    return {
      isOpen: true,
      phase: 'pre-market',
      nextEventLabel: 'Market opens',
      nextEventTime: createETTime(9, 30),
      progressPercent: (elapsed / sessionDuration) * 100,
    };
  }
  
  if (etTotalMinutes < regularClose) {
    // Regular trading hours
    const sessionDuration = regularClose - regularOpen;
    const elapsed = etTotalMinutes - regularOpen;
    return {
      isOpen: true,
      phase: 'regular',
      nextEventLabel: 'Market closes',
      nextEventTime: createETTime(16, 0),
      progressPercent: (elapsed / sessionDuration) * 100,
    };
  }
  
  if (etTotalMinutes < afterHoursClose) {
    // After-hours session
    const sessionDuration = afterHoursClose - regularClose;
    const elapsed = etTotalMinutes - regularClose;
    return {
      isOpen: true,
      phase: 'after-hours',
      nextEventLabel: 'After-hours ends',
      nextEventTime: createETTime(20, 0),
      progressPercent: (elapsed / sessionDuration) * 100,
    };
  }
  
  // After market close - next day
  // Check if tomorrow is weekend
  const tomorrowDay = (etDay + 1) % 7;
  if (tomorrowDay === 0) {
    // Tomorrow is Sunday, next pre-market is Monday
    const nextOpen = new Date(now);
    nextOpen.setUTCDate(nextOpen.getUTCDate() + 2);
    nextOpen.setUTCHours(4 + etOffset, 0, 0, 0);
    return {
      isOpen: false,
      phase: 'closed',
      nextEventLabel: 'Pre-market opens',
      nextEventTime: nextOpen,
      progressPercent: 0,
    };
  }
  if (tomorrowDay === 6) {
    // Tomorrow is Saturday, next pre-market is Monday
    const nextOpen = new Date(now);
    nextOpen.setUTCDate(nextOpen.getUTCDate() + 3);
    nextOpen.setUTCHours(4 + etOffset, 0, 0, 0);
    return {
      isOpen: false,
      phase: 'closed',
      nextEventLabel: 'Pre-market opens',
      nextEventTime: nextOpen,
      progressPercent: 0,
    };
  }
  
  return {
    isOpen: false,
    phase: 'closed',
    nextEventLabel: 'Pre-market opens',
    nextEventTime: createETTime(4, 0, true),
    progressPercent: 0,
  };
}

function formatCountdown(targetTime: Date): string {
  const now = new Date();
  const diff = targetTime.getTime() - now.getTime();
  
  if (diff <= 0) return 'now';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  }
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  
  return `${seconds}s`;
}

/**
 * Animated market status indicator showing current session and countdown.
 * Features: phase-colored indicator, progress bar during sessions,
 * countdown timer, and subtle animations.
 */
export function MarketStatus() {
  const [session, setSession] = useState<MarketSession | null>(null);
  const [countdown, setCountdown] = useState('');
  
  // Initial calculation
  useEffect(() => {
    const updateSession = () => {
      const newSession = getMarketSession();
      setSession(newSession);
      setCountdown(formatCountdown(newSession.nextEventTime));
    };
    
    updateSession();
    
    // Update every second for smooth countdown
    const interval = setInterval(updateSession, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Phase-specific styling
  const phaseConfig = useMemo(() => {
    if (!session) return null;
    
    switch (session.phase) {
      case 'pre-market':
        return {
          label: 'Pre-Market',
          color: '#f59e0b', // amber
          bgClass: 'market-status-premarket',
        };
      case 'regular':
        return {
          label: 'Market Open',
          color: '#22c55e', // green
          bgClass: 'market-status-open',
        };
      case 'after-hours':
        return {
          label: 'After Hours',
          color: '#8b5cf6', // purple
          bgClass: 'market-status-afterhours',
        };
      case 'closed':
        return {
          label: 'Market Closed',
          color: '#ef4444', // red
          bgClass: 'market-status-closed',
        };
    }
  }, [session?.phase]);
  
  if (!session || !phaseConfig) {
    // Skeleton placeholder
    return (
      <div className="market-status market-status-loading">
        <div className="market-status-dot" />
        <div className="market-status-skeleton" />
      </div>
    );
  }
  
  return (
    <div className={`market-status ${phaseConfig.bgClass}`}>
      {/* Animated status dot */}
      <span 
        className={`market-status-dot ${session.isOpen ? 'active' : ''}`}
        style={{ '--dot-color': phaseConfig.color } as React.CSSProperties}
      />
      
      {/* Status text */}
      <span className="market-status-label" style={{ color: phaseConfig.color }}>
        {phaseConfig.label}
      </span>
      
      {/* Separator */}
      <span className="market-status-separator">•</span>
      
      {/* Countdown */}
      <span className="market-status-countdown">
        {session.nextEventLabel} in <span className="market-status-time">{countdown}</span>
      </span>
      
      {/* Progress bar for active sessions */}
      {session.isOpen && (
        <div className="market-status-progress">
          <div 
            className="market-status-progress-fill"
            style={{ 
              width: `${session.progressPercent}%`,
              backgroundColor: phaseConfig.color,
            }}
          />
        </div>
      )}
    </div>
  );
}

export default MarketStatus;
