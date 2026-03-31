'use client';

import { useState, useEffect, useCallback, useRef, memo } from 'react';

/**
 * DayAnchorNav - Floating day-of-week quick navigation
 * 
 * A floating mini-navigation that lets users quickly jump between
 * day columns within the earnings week view. Shows the current day
 * in view with a smooth highlight indicator.
 * 
 * 2026 UI Trend: "Spatial Anchoring" - helping users understand where
 * they are in content-dense layouts through persistent navigation hints.
 * 
 * Inspiration:
 * - Notion's table of contents indicator
 * - Medium's reading progress + anchor navigation
 * - Linear's issue list section indicators
 * - Bloomberg Terminal's keyboard navigation hints
 * - Apple Calendar's day quick-jump
 * 
 * Features:
 * - Floating pill on the side of the viewport
 * - Active day indicator with animated transition
 * - Click to smooth-scroll to day column
 * - Keyboard accessible (Tab + Enter to activate)
 * - Today badge with accent color
 * - Earnings count badge per day
 * - Collapses on small screens / expands on hover
 * - Respects prefers-reduced-motion
 * - Auto-hides when scrolling fast (velocity detection)
 * - Sticky positioning with safe area awareness
 * 
 * @example
 * <DayAnchorNav
 *   days={['2026-03-30', '2026-03-31', '2026-04-01', '2026-04-02', '2026-04-03']}
 *   earningsPerDay={{ '2026-03-31': 5, '2026-04-01': 3 }}
 *   todayDate="2026-03-31"
 * />
 */

interface DayAnchorNavProps {
  /** Array of dates for the week (ISO strings) */
  days: string[];
  /** Map of date to earnings count */
  earningsPerDay?: Record<string, number>;
  /** Today's date (ISO string) for highlighting */
  todayDate?: string;
  /** Position on screen */
  position?: 'left' | 'right';
  /** Offset from edge in px */
  edgeOffset?: number;
  /** Vertical position */
  verticalPosition?: 'top' | 'center' | 'bottom';
  /** Vertical offset in px */
  verticalOffset?: number;
  /** Whether to show earnings count badges */
  showCounts?: boolean;
  /** Whether to collapse to icons only */
  collapsible?: boolean;
  /** Whether to hide during fast scroll */
  hideOnFastScroll?: boolean;
  /** Fast scroll velocity threshold (px/ms) */
  scrollVelocityThreshold?: number;
  /** ID prefix for day column elements to scroll to */
  dayColumnIdPrefix?: string;
  /** Custom className */
  className?: string;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const DAY_LABELS_SHORT = ['M', 'T', 'W', 'T', 'F'];

function getDayIndex(dateStr: string): number {
  const date = new Date(dateStr);
  const day = date.getDay();
  // Convert Sunday (0) to 6, Monday (1) to 0, etc.
  return day === 0 ? 6 : day - 1;
}

function DayAnchorNavComponent({
  days,
  earningsPerDay = {},
  todayDate,
  position = 'right',
  edgeOffset = 16,
  verticalPosition = 'center',
  verticalOffset = 0,
  showCounts = true,
  collapsible = true,
  hideOnFastScroll = true,
  scrollVelocityThreshold = 2,
  dayColumnIdPrefix = 'day-column-',
  className = '',
}: DayAnchorNavProps) {
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState(!collapsible);
  const [isHidden, setIsHidden] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(Date.now());
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Check for reduced motion preference
  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Intersection observer to detect which day is in view
  useEffect(() => {
    if (!mounted) return;

    const observers: IntersectionObserver[] = [];
    const dayElements: Element[] = [];

    days.forEach((date, index) => {
      const element = document.getElementById(`${dayColumnIdPrefix}${index}`);
      if (element) {
        dayElements.push(element);
        
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
                setActiveDayIndex(index);
              }
            });
          },
          {
            root: null,
            rootMargin: '-20% 0px -20% 0px',
            threshold: [0.3, 0.5, 0.7],
          }
        );
        
        observer.observe(element);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [days, dayColumnIdPrefix, mounted]);

  // Scroll velocity detection for auto-hide
  useEffect(() => {
    if (!hideOnFastScroll || !mounted) return;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const currentTime = Date.now();
      const deltaY = Math.abs(currentY - lastScrollY.current);
      const deltaTime = currentTime - lastScrollTime.current;
      
      const velocity = deltaTime > 0 ? deltaY / deltaTime : 0;
      
      if (velocity > scrollVelocityThreshold) {
        setIsHidden(true);
        
        // Clear existing timeout
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
        
        // Show again after scroll slows/stops
        hideTimeoutRef.current = setTimeout(() => {
          setIsHidden(false);
        }, 300);
      }
      
      lastScrollY.current = currentY;
      lastScrollTime.current = currentTime;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [hideOnFastScroll, scrollVelocityThreshold, mounted]);

  // Handle click to scroll to day
  const handleDayClick = useCallback((index: number) => {
    const element = document.getElementById(`${dayColumnIdPrefix}${index}`);
    if (element) {
      const headerOffset = 120; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
      
      setActiveDayIndex(index);
    }
  }, [dayColumnIdPrefix, prefersReducedMotion]);

  // Calculate vertical position
  const getVerticalStyle = () => {
    switch (verticalPosition) {
      case 'top':
        return { top: `${120 + verticalOffset}px` };
      case 'bottom':
        return { bottom: `${100 + verticalOffset}px` };
      case 'center':
      default:
        return { top: '50%', transform: 'translateY(-50%)' };
    }
  };

  if (!mounted) return null;

  // Only show for weeks with 5 days (Mon-Fri)
  if (days.length !== 5) return null;

  return (
    <>
      <nav
        ref={navRef}
        className={`
          day-anchor-nav
          day-anchor-nav-${position}
          ${isExpanded ? 'expanded' : 'collapsed'}
          ${isHidden ? 'hidden' : ''}
          ${prefersReducedMotion ? 'reduced-motion' : ''}
          ${className}
        `}
        style={{
          [position]: edgeOffset,
          ...getVerticalStyle(),
        }}
        aria-label="Day navigation"
        onMouseEnter={() => collapsible && setIsExpanded(true)}
        onMouseLeave={() => collapsible && setIsExpanded(false)}
        onFocus={() => collapsible && setIsExpanded(true)}
        onBlur={(e) => {
          if (collapsible && !navRef.current?.contains(e.relatedTarget)) {
            setIsExpanded(false);
          }
        }}
      >
        {/* Active indicator */}
        <div 
          className="day-anchor-indicator"
          style={{
            transform: `translateY(${activeDayIndex * 36}px)`,
          }}
          aria-hidden="true"
        />

        {/* Day buttons */}
        <div className="day-anchor-list" role="list">
          {days.map((date, index) => {
            const isToday = date === todayDate;
            const isActive = index === activeDayIndex;
            const count = earningsPerDay[date] || 0;
            const dayLabel = DAY_LABELS[index];
            const dayLabelShort = DAY_LABELS_SHORT[index];

            return (
              <button
                key={date}
                className={`
                  day-anchor-item
                  ${isActive ? 'active' : ''}
                  ${isToday ? 'today' : ''}
                  ${count === 0 ? 'empty' : ''}
                `}
                onClick={() => handleDayClick(index)}
                role="listitem"
                aria-current={isActive ? 'true' : undefined}
                aria-label={`${dayLabel}${isToday ? ' (Today)' : ''}: ${count} earnings`}
                title={`${dayLabel}${isToday ? ' (Today)' : ''} - ${count} earnings`}
              >
                <span className="day-anchor-label">
                  <span className="day-anchor-label-full">{dayLabel}</span>
                  <span className="day-anchor-label-short">{dayLabelShort}</span>
                </span>
                
                {isToday && (
                  <span className="day-anchor-today-dot" aria-hidden="true" />
                )}
                
                {showCounts && count > 0 && (
                  <span className="day-anchor-count" aria-hidden="true">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <style jsx>{`
        .day-anchor-nav {
          position: fixed;
          z-index: 40;
          display: flex;
          flex-direction: column;
          padding: 6px;
          background: linear-gradient(135deg, rgba(30, 30, 45, 0.95) 0%, rgba(20, 20, 30, 0.98) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          box-shadow: 
            0 4px 24px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.05) inset;
          transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: auto;
        }

        /* Light mode */
        :global(html.light) .day-anchor-nav {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
          border-color: rgba(0, 0, 0, 0.08);
          box-shadow: 
            0 4px 24px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(0, 0, 0, 0.05) inset;
        }

        .day-anchor-nav.hidden {
          opacity: 0;
          pointer-events: none;
          transform: translateY(-50%) scale(0.95);
        }

        .day-anchor-nav-right.hidden {
          transform: translateY(-50%) translateX(10px) scale(0.95);
        }

        .day-anchor-nav-left.hidden {
          transform: translateY(-50%) translateX(-10px) scale(0.95);
        }

        .day-anchor-nav.reduced-motion {
          transition: none;
        }

        .day-anchor-nav.reduced-motion .day-anchor-indicator {
          transition: none;
        }

        .day-anchor-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
          position: relative;
        }

        .day-anchor-indicator {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 34px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 10px;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          pointer-events: none;
          z-index: 0;
        }

        :global(html.light) .day-anchor-indicator {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%);
          border-color: rgba(59, 130, 246, 0.25);
        }

        .day-anchor-item {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 8px 12px;
          min-width: 44px;
          height: 34px;
          border: none;
          background: transparent;
          border-radius: 10px;
          cursor: pointer;
          transition: color 0.2s ease;
          color: var(--text-secondary, #a1a1aa);
          font-size: 13px;
          font-weight: 500;
          text-align: left;
          white-space: nowrap;
        }

        .day-anchor-item:hover {
          color: var(--text-primary, #e4e4e7);
        }

        .day-anchor-item:focus-visible {
          outline: 2px solid rgba(59, 130, 246, 0.5);
          outline-offset: 2px;
        }

        .day-anchor-item.active {
          color: var(--accent-blue, #3b82f6);
          font-weight: 600;
        }

        .day-anchor-item.today {
          color: var(--accent-blue, #3b82f6);
        }

        .day-anchor-item.empty {
          opacity: 0.5;
        }

        .day-anchor-label {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .day-anchor-label-full {
          display: block;
        }

        .day-anchor-label-short {
          display: none;
        }

        /* Collapsed state */
        .day-anchor-nav.collapsed .day-anchor-label-full {
          display: none;
        }

        .day-anchor-nav.collapsed .day-anchor-label-short {
          display: block;
        }

        .day-anchor-nav.collapsed .day-anchor-count {
          display: none;
        }

        .day-anchor-nav.collapsed .day-anchor-item {
          justify-content: center;
          padding: 8px;
          min-width: 34px;
        }

        .day-anchor-today-dot {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 6px;
          height: 6px;
          background: var(--accent-blue, #3b82f6);
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
          animation: todayDotPulse 2s ease-in-out infinite;
        }

        .day-anchor-nav.collapsed .day-anchor-today-dot {
          top: 4px;
          right: 4px;
          width: 5px;
          height: 5px;
        }

        @keyframes todayDotPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.2); }
        }

        .day-anchor-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          font-size: 10px;
          font-weight: 600;
          color: var(--text-muted, #71717a);
          background: rgba(255, 255, 255, 0.08);
          border-radius: 6px;
        }

        :global(html.light) .day-anchor-count {
          background: rgba(0, 0, 0, 0.06);
        }

        .day-anchor-item.active .day-anchor-count {
          background: rgba(59, 130, 246, 0.2);
          color: var(--accent-blue, #3b82f6);
        }

        /* Hide on mobile by default (can be enabled with media query override) */
        @media (max-width: 1024px) {
          .day-anchor-nav {
            display: none;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .day-anchor-nav,
          .day-anchor-indicator,
          .day-anchor-item {
            transition: none;
          }
          
          .day-anchor-today-dot {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}

export const DayAnchorNav = memo(DayAnchorNavComponent);

/**
 * Hook to extract day anchor data from earnings
 */
export function useDayAnchorData(
  weekStart: Date,
  earnings: Array<{ date: string }>
): {
  days: string[];
  earningsPerDay: Record<string, number>;
  todayDate: string | undefined;
} {
  const days: string[] = [];
  const earningsPerDay: Record<string, number> = {};
  
  // Generate 5 days starting from weekStart (Monday)
  for (let i = 0; i < 5; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    days.push(dateStr);
    earningsPerDay[dateStr] = 0;
  }

  // Count earnings per day
  earnings.forEach((earning) => {
    if (earningsPerDay[earning.date] !== undefined) {
      earningsPerDay[earning.date]++;
    }
  });

  // Get today's date
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayDate = days.includes(todayStr) ? todayStr : undefined;

  return { days, earningsPerDay, todayDate };
}

export default DayAnchorNav;
