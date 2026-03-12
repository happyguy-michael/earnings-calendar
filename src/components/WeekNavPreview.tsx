'use client';

import { useState, useEffect, useRef, memo } from 'react';

/**
 * WeekNavPreview - Floating preview tooltip for week navigation
 * 
 * Provides contextual feedback when hovering over navigation arrows,
 * showing what week the user will navigate to. This reduces cognitive
 * load by previewing the destination before clicking.
 * 
 * Inspired by:
 * - Linear's navigation preview hints
 * - Notion's page navigation tooltips
 * - Google Calendar's month preview on arrow hover
 * 
 * Features:
 * - Animated entrance/exit with spring physics
 * - Shows formatted date range for target week
 * - Position adapts based on button location (left/right)
 * - Subtle blur and glow for premium feel
 * - Respects prefers-reduced-motion
 * - Auto-hides after a delay if not clicked
 */

interface WeekNavPreviewProps {
  /** The target week start date */
  targetWeek: Date;
  /** Direction of navigation */
  direction: 'prev' | 'next';
  /** Whether the preview is visible */
  visible: boolean;
  /** Position relative to button (for positioning) */
  anchorRef?: React.RefObject<HTMLElement | null>;
  /** Custom class name */
  className?: string;
}

function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 4); // Friday
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const startMonth = months[weekStart.getMonth()];
  const endMonth = months[weekEnd.getMonth()];
  const startDay = weekStart.getDate();
  const endDay = weekEnd.getDate();
  
  // Same month: "Jan 6–10"
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}–${endDay}`;
  }
  
  // Different months: "Jan 27 – Feb 1"
  return `${startMonth} ${startDay} – ${endMonth} ${endDay}`;
}

function formatRelativeWeek(targetWeek: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get current week start (Monday)
  const currentWeekStart = new Date(today);
  const dayOfWeek = currentWeekStart.getDay();
  const diff = currentWeekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  currentWeekStart.setDate(diff);
  
  const targetTime = targetWeek.getTime();
  const currentTime = currentWeekStart.getTime();
  const weekDiff = Math.round((targetTime - currentTime) / (7 * 24 * 60 * 60 * 1000));
  
  if (weekDiff === 0) return 'This Week';
  if (weekDiff === 1) return 'Next Week';
  if (weekDiff === -1) return 'Last Week';
  if (weekDiff > 0) return `${weekDiff} Weeks Ahead`;
  return `${Math.abs(weekDiff)} Weeks Ago`;
}

function WeekNavPreviewComponent({
  targetWeek,
  direction,
  visible,
  anchorRef,
  className = '',
}: WeekNavPreviewProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Don't render until client-side mounted to prevent hydration mismatch
  if (!mounted) return null;

  const weekRange = formatWeekRange(targetWeek);
  const relativeLabel = formatRelativeWeek(targetWeek);
  const isCurrentWeek = relativeLabel === 'This Week';
  
  const arrowIcon = direction === 'prev' ? '←' : '→';

  return (
    <div
      className={`week-nav-preview ${visible ? 'visible' : ''} ${direction} ${className}`}
      role="tooltip"
      aria-hidden={!visible}
      style={{
        '--preview-duration': prefersReducedMotion ? '0ms' : '200ms',
      } as React.CSSProperties}
    >
      <div className="week-nav-preview-content">
        <span className="week-nav-preview-arrow">{arrowIcon}</span>
        <div className="week-nav-preview-text">
          <span className="week-nav-preview-dates">{weekRange}</span>
          {!isCurrentWeek && (
            <span className="week-nav-preview-relative">{relativeLabel}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export const WeekNavPreview = memo(WeekNavPreviewComponent);

/**
 * Hook to manage week navigation preview state
 */
export function useWeekNavPreview(currentWeekStart: Date) {
  const [previewDirection, setPreviewDirection] = useState<'prev' | 'next' | null>(null);
  const [previewWeek, setPreviewWeek] = useState<Date | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showPreview = (direction: 'prev' | 'next') => {
    // Clear any pending hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    // Calculate target week
    const targetWeek = new Date(currentWeekStart);
    targetWeek.setDate(targetWeek.getDate() + (direction === 'next' ? 7 : -7));
    
    setPreviewDirection(direction);
    setPreviewWeek(targetWeek);
  };

  const hidePreview = () => {
    // Delay hide for smoother UX
    hideTimeoutRef.current = setTimeout(() => {
      setPreviewDirection(null);
      setPreviewWeek(null);
    }, 100);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  return {
    previewDirection,
    previewWeek,
    showPreview,
    hidePreview,
    isVisible: previewDirection !== null && previewWeek !== null,
  };
}

export default WeekNavPreview;
