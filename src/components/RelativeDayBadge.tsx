'use client';

import { useMemo, useState, useEffect } from 'react';

/**
 * RelativeDayBadge
 * 
 * 2026 Trend: "Contextual Data Storytelling" + "Human-First Numbers"
 * 
 * Transforms dates into intuitive, human-readable phrases:
 * - "Today" (with pulse animation)
 * - "Tomorrow" (with subtle glow)
 * - "In 2 days"
 * - "In 3 days" / "In 4 days"
 * - "Last Friday" / "2 days ago"
 * - "Yesterday"
 * 
 * Instead of forcing users to calculate "what day is March 25?",
 * this component speaks naturally: "That's in 3 days."
 * 
 * Features:
 * - Smart day-of-week context ("This Thursday", "Next Monday")
 * - Visual hierarchy: today > tomorrow > this week > next week
 * - Animated entrance with staggered reveal
 * - Color-coded by temporal proximity
 * - Respects prefers-reduced-motion
 * - Light/dark mode adaptive
 * 
 * @example
 * <RelativeDayBadge date={new Date('2026-03-25')} />
 * // → "In 3 days" or "This Wednesday"
 */

interface RelativeDayBadgeProps {
  /** The date to describe */
  date: Date;
  /** Show day-of-week context for near dates (default: true) */
  showDayName?: boolean;
  /** Compact mode - shorter labels (default: false) */
  compact?: boolean;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md';
  /** Animation delay in ms (for staggered reveals) */
  delay?: number;
  /** Custom className */
  className?: string;
  /** Callback when badge becomes "today" (for live updates) */
  onBecameToday?: () => void;
}

type TemporalProximity = 
  | 'today' 
  | 'tomorrow' 
  | 'this-week' 
  | 'next-week' 
  | 'far-future' 
  | 'yesterday' 
  | 'recent-past' 
  | 'distant-past';

interface RelativeInfo {
  label: string;
  shortLabel: string;
  proximity: TemporalProximity;
  daysOffset: number;
  isWeekend: boolean;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getDaysDifference(date1: Date, date2: Date): number {
  const d1 = getStartOfDay(date1);
  const d2 = getStartOfDay(date2);
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

function getRelativeInfo(targetDate: Date, showDayName: boolean): RelativeInfo {
  const today = new Date();
  const daysOffset = getDaysDifference(today, targetDate);
  const dayOfWeek = targetDate.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const dayName = DAY_NAMES[dayOfWeek];
  const dayNameShort = DAY_NAMES_SHORT[dayOfWeek];
  
  // Today
  if (daysOffset === 0) {
    return {
      label: 'Today',
      shortLabel: 'Today',
      proximity: 'today',
      daysOffset,
      isWeekend,
    };
  }
  
  // Tomorrow
  if (daysOffset === 1) {
    return {
      label: 'Tomorrow',
      shortLabel: 'Tmrw',
      proximity: 'tomorrow',
      daysOffset,
      isWeekend,
    };
  }
  
  // Yesterday
  if (daysOffset === -1) {
    return {
      label: 'Yesterday',
      shortLabel: 'Yest',
      proximity: 'yesterday',
      daysOffset,
      isWeekend,
    };
  }
  
  // This week (2-6 days ahead)
  if (daysOffset >= 2 && daysOffset <= 6) {
    return {
      label: showDayName ? `This ${dayName}` : `In ${daysOffset} days`,
      shortLabel: showDayName ? dayNameShort : `${daysOffset}d`,
      proximity: 'this-week',
      daysOffset,
      isWeekend,
    };
  }
  
  // Next week (7-13 days ahead)
  if (daysOffset >= 7 && daysOffset <= 13) {
    return {
      label: showDayName ? `Next ${dayName}` : `In ${daysOffset} days`,
      shortLabel: showDayName ? `Next ${dayNameShort}` : `${daysOffset}d`,
      proximity: 'next-week',
      daysOffset,
      isWeekend,
    };
  }
  
  // Far future (14+ days)
  if (daysOffset >= 14) {
    const weeks = Math.floor(daysOffset / 7);
    if (weeks === 2) {
      return {
        label: '2 weeks out',
        shortLabel: '2wk',
        proximity: 'far-future',
        daysOffset,
        isWeekend,
      };
    }
    return {
      label: `In ${weeks} weeks`,
      shortLabel: `${weeks}wk`,
      proximity: 'far-future',
      daysOffset,
      isWeekend,
    };
  }
  
  // Recent past (2-6 days ago)
  if (daysOffset >= -6 && daysOffset <= -2) {
    const daysAgo = Math.abs(daysOffset);
    return {
      label: showDayName ? `Last ${dayName}` : `${daysAgo} days ago`,
      shortLabel: showDayName ? `Last ${dayNameShort}` : `${daysAgo}d ago`,
      proximity: 'recent-past',
      daysOffset,
      isWeekend,
    };
  }
  
  // Distant past (7+ days ago)
  const daysAgo = Math.abs(daysOffset);
  const weeksAgo = Math.floor(daysAgo / 7);
  return {
    label: weeksAgo === 1 ? 'Last week' : `${weeksAgo} weeks ago`,
    shortLabel: weeksAgo === 1 ? '1wk ago' : `${weeksAgo}wk ago`,
    proximity: 'distant-past',
    daysOffset,
    isWeekend,
  };
}

export function RelativeDayBadge({
  date,
  showDayName = true,
  compact = false,
  size = 'sm',
  delay = 0,
  className = '',
  onBecameToday,
}: RelativeDayBadgeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentDay, setCurrentDay] = useState(() => new Date());
  
  // Update current day at midnight
  useEffect(() => {
    const checkDay = () => {
      const now = new Date();
      const currentDayStart = getStartOfDay(currentDay);
      const nowDayStart = getStartOfDay(now);
      
      if (nowDayStart.getTime() !== currentDayStart.getTime()) {
        setCurrentDay(now);
        
        // Check if target date just became "today"
        if (getDaysDifference(now, date) === 0) {
          onBecameToday?.();
        }
      }
    };
    
    // Check every minute
    const interval = setInterval(checkDay, 60000);
    return () => clearInterval(interval);
  }, [currentDay, date, onBecameToday]);
  
  // Staggered entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  const info = useMemo(() => getRelativeInfo(date, showDayName), [date, showDayName, currentDay]);
  
  const label = compact ? info.shortLabel : info.label;
  
  // Size classes
  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 rounded',
    sm: 'text-xs px-2 py-0.5 rounded-md',
    md: 'text-sm px-2.5 py-1 rounded-lg',
  };
  
  // Proximity-based styles
  const proximityStyles: Record<TemporalProximity, string> = {
    'today': 'relative-day-today bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-semibold',
    'tomorrow': 'relative-day-tomorrow bg-sky-500/15 text-sky-400 border-sky-500/25',
    'this-week': 'relative-day-this-week bg-violet-500/10 text-violet-400 border-violet-500/20',
    'next-week': 'relative-day-next-week bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    'far-future': 'relative-day-far bg-zinc-700/10 text-zinc-500 border-zinc-700/20',
    'yesterday': 'relative-day-yesterday bg-amber-500/10 text-amber-400/80 border-amber-500/20',
    'recent-past': 'relative-day-past bg-zinc-600/10 text-zinc-500 border-zinc-600/20',
    'distant-past': 'relative-day-distant bg-zinc-800/10 text-zinc-600 border-zinc-800/20',
  };
  
  // Light mode overrides
  const lightModeStyles: Record<TemporalProximity, string> = {
    'today': 'light:bg-emerald-100 light:text-emerald-700 light:border-emerald-200',
    'tomorrow': 'light:bg-sky-100 light:text-sky-700 light:border-sky-200',
    'this-week': 'light:bg-violet-100 light:text-violet-700 light:border-violet-200',
    'next-week': 'light:bg-zinc-100 light:text-zinc-600 light:border-zinc-200',
    'far-future': 'light:bg-zinc-50 light:text-zinc-500 light:border-zinc-200',
    'yesterday': 'light:bg-amber-50 light:text-amber-700 light:border-amber-200',
    'recent-past': 'light:bg-zinc-100 light:text-zinc-500 light:border-zinc-200',
    'distant-past': 'light:bg-zinc-50 light:text-zinc-400 light:border-zinc-100',
  };
  
  return (
    <span
      className={`
        relative-day-badge
        inline-flex items-center gap-1
        border font-medium tracking-wide
        transition-all duration-300 ease-out
        ${sizeClasses[size]}
        ${proximityStyles[info.proximity]}
        ${lightModeStyles[info.proximity]}
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}
        ${className}
      `}
      title={`${info.daysOffset >= 0 ? 'In' : ''} ${Math.abs(info.daysOffset)} day${Math.abs(info.daysOffset) !== 1 ? 's' : ''}${info.daysOffset < 0 ? ' ago' : ''}`}
      data-proximity={info.proximity}
      data-days-offset={info.daysOffset}
    >
      {/* Today pulse indicator */}
      {info.proximity === 'today' && (
        <span className="relative-day-pulse" aria-hidden="true">
          <span className="relative-day-pulse-ring" />
          <span className="relative-day-pulse-dot" />
        </span>
      )}
      
      {/* Tomorrow subtle glow */}
      {info.proximity === 'tomorrow' && (
        <span className="relative-day-glow" aria-hidden="true" />
      )}
      
      {label}
    </span>
  );
}

/**
 * RelativeDayBadgeInline - Minimal inline variant for card subtitles
 */
export function RelativeDayBadgeInline({
  date,
  className = '',
}: {
  date: Date;
  className?: string;
}) {
  const info = useMemo(() => getRelativeInfo(date, false), [date]);
  
  const colorClasses: Record<TemporalProximity, string> = {
    'today': 'text-emerald-400',
    'tomorrow': 'text-sky-400',
    'this-week': 'text-violet-400',
    'next-week': 'text-zinc-400',
    'far-future': 'text-zinc-500',
    'yesterday': 'text-amber-400/80',
    'recent-past': 'text-zinc-500',
    'distant-past': 'text-zinc-600',
  };
  
  return (
    <span className={`text-xs font-medium ${colorClasses[info.proximity]} ${className}`}>
      {info.shortLabel}
    </span>
  );
}

/**
 * useRelativeDay hook - For custom implementations
 */
export function useRelativeDay(date: Date, showDayName = true): RelativeInfo {
  const [currentDay, setCurrentDay] = useState(() => new Date());
  
  useEffect(() => {
    const checkDay = () => {
      const now = new Date();
      const currentDayStart = getStartOfDay(currentDay);
      const nowDayStart = getStartOfDay(now);
      
      if (nowDayStart.getTime() !== currentDayStart.getTime()) {
        setCurrentDay(now);
      }
    };
    
    const interval = setInterval(checkDay, 60000);
    return () => clearInterval(interval);
  }, [currentDay]);
  
  return useMemo(() => getRelativeInfo(date, showDayName), [date, showDayName, currentDay]);
}
