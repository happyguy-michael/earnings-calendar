'use client';

import { useEffect, useState, useRef } from 'react';
import './MonthBoundaryBadge.css';

/**
 * MonthBoundaryBadge - Visual indicator for the first day of a new month
 * 
 * When a calendar week spans two months (e.g., March 31 → April 1), this
 * component adds a subtle but elegant badge to the first day of the new month.
 * Helps users quickly orient themselves when navigating between weeks.
 * 
 * Inspiration:
 * - Apple Calendar's month transition indicators
 * - Linear's subtle date context badges
 * - Google Calendar's "first of month" emphasis
 * - 2026 trend: Micro-contextual UI elements
 * 
 * Features:
 * - Animated entrance with spring physics
 * - Subtle glow effect on first appearance
 * - Theme-aware styling (light/dark)
 * - Respects prefers-reduced-motion
 * - Compact design that doesn't clutter
 */

interface MonthBoundaryBadgeProps {
  /** The date to check */
  date: Date;
  /** Previous day's date (to detect month change) */
  previousDate?: Date;
  /** Animation delay in ms */
  delay?: number;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Show full month name vs abbreviated */
  abbreviated?: boolean;
  /** Optional className for additional styling */
  className?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_ABBREV = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function MonthBoundaryBadge({
  date,
  previousDate,
  delay = 0,
  size = 'sm',
  abbreviated = true,
  className = '',
}: MonthBoundaryBadgeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Check if this is the first day of a new month (day 1 OR month changed from previous day)
  const isFirstOfMonth = date.getDate() === 1;
  const isMonthBoundary = previousDate && date.getMonth() !== previousDate.getMonth();
  const shouldShow = isFirstOfMonth || isMonthBoundary;

  // Intersection Observer for scroll-triggered animation
  useEffect(() => {
    if (!shouldShow) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setTimeout(() => {
            setIsVisible(true);
            setHasAnimated(true);
          }, delay);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [shouldShow, delay, hasAnimated]);

  // Reset animation when date changes significantly
  useEffect(() => {
    setHasAnimated(false);
    setIsVisible(false);
  }, [date.getMonth(), date.getFullYear()]);

  if (!shouldShow) return null;

  const monthName = abbreviated 
    ? MONTH_ABBREV[date.getMonth()] 
    : MONTH_NAMES[date.getMonth()];

  return (
    <div
      ref={ref}
      className={`month-boundary-badge ${size} ${isVisible ? 'visible' : ''} ${className}`}
      aria-label={`First day of ${MONTH_NAMES[date.getMonth()]}`}
    >
      <span className="month-boundary-icon">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d="M1 3.5h8M3 1v2M7 1v2M1.5 5v3.5h7V5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="month-boundary-text">{monthName}</span>
      <span className="month-boundary-glow" aria-hidden="true" />
    </div>
  );
}

/**
 * Hook to get the previous weekday date for month boundary detection
 */
export function usePreviousWeekday(currentDate: Date, dayIndex: number): Date | undefined {
  if (dayIndex === 0) return undefined; // Monday has no previous day in the week
  
  const prevDate = new Date(currentDate);
  prevDate.setDate(prevDate.getDate() - 1);
  return prevDate;
}

/**
 * MonthTransitionDivider - Subtle vertical line between months in a week
 * 
 * Shows a thin gradient divider when there's a month change between days.
 * More subtle than the badge, can be used alongside or as alternative.
 */
interface MonthTransitionDividerProps {
  showDivider: boolean;
  delay?: number;
}

export function MonthTransitionDivider({ 
  showDivider, 
  delay = 0 
}: MonthTransitionDividerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (showDivider) {
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    }
    setIsVisible(false);
  }, [showDivider, delay]);

  if (!showDivider) return null;

  return (
    <div 
      className={`month-transition-divider ${isVisible ? 'visible' : ''}`}
      aria-hidden="true"
    />
  );
}
