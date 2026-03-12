'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';

/**
 * ScrollMinimap - Visual scroll position indicator for multi-week calendar
 * 
 * A subtle vertical minimap on the right edge showing:
 * - Which weeks are in the calendar
 * - Which week is currently in view (highlighted)
 * - Quick-jump navigation to any week
 * 
 * Inspired by:
 * - VS Code minimap (scroll position context)
 * - Figma layer panel scroll indicators
 * - Medium reading progress bars
 * - Linear.app sidebar scroll indicators
 * 
 * Features:
 * - Shows all weeks as small blocks
 * - Active week highlighted with glow
 * - Click to jump to week
 * - Hover preview showing week dates
 * - Smooth scroll-linked animation
 * - Fades in when scrolled, fades out at top
 * - Respects prefers-reduced-motion
 * - Full light/dark mode support
 * 
 * Usage:
 * <ScrollMinimap
 *   weekCount={5}
 *   activeWeekIndex={2}
 *   weekDates={[{ start: '2026-03-09', end: '2026-03-13' }, ...]}
 *   onWeekClick={(index) => scrollToWeek(index)}
 * />
 */

interface WeekDate {
  start: string;
  end: string;
  label?: string;
}

interface ScrollMinimapProps {
  /** Total number of weeks in the calendar */
  weekCount: number;
  /** Currently active/visible week index (0-based) */
  activeWeekIndex: number;
  /** Optional week date ranges for hover preview */
  weekDates?: WeekDate[];
  /** Callback when a week block is clicked */
  onWeekClick?: (weekIndex: number) => void;
  /** Position on screen */
  position?: 'right' | 'left';
  /** Distance from edge (px) */
  offset?: number;
  /** Whether to show week labels on hover */
  showLabels?: boolean;
  /** Hide when at top of page */
  hideAtTop?: boolean;
  /** Minimum scroll before showing */
  showAfterScroll?: number;
  /** Custom class name */
  className?: string;
}

function formatWeekLabel(weekDate: WeekDate): string {
  if (weekDate.label) return weekDate.label;
  
  try {
    const start = new Date(weekDate.start);
    const end = new Date(weekDate.end);
    
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    const startDay = start.getDate();
    const endDay = end.getDate();
    
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay}–${endDay}`;
    }
    return `${startMonth} ${startDay} – ${endMonth} ${endDay}`;
  } catch {
    return '';
  }
}

export function ScrollMinimap({
  weekCount,
  activeWeekIndex,
  weekDates,
  onWeekClick,
  position = 'right',
  offset = 16,
  showLabels = true,
  hideAtTop = true,
  showAfterScroll = 100,
  className = '',
}: ScrollMinimapProps) {
  const [isVisible, setIsVisible] = useState(!hideAtTop);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Track scroll position for visibility
  useEffect(() => {
    if (!hideAtTop) {
      setIsVisible(true);
      return;
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsVisible(scrollY > showAfterScroll);
    };

    handleScroll(); // Initial check
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hideAtTop, showAfterScroll]);

  const handleWeekClick = useCallback((index: number) => {
    onWeekClick?.(index);
  }, [onWeekClick]);

  // Generate week blocks
  const weekBlocks = useMemo(() => {
    return Array.from({ length: weekCount }, (_, index) => ({
      index,
      isActive: index === activeWeekIndex,
      label: weekDates?.[index] ? formatWeekLabel(weekDates[index]) : `Week ${index + 1}`,
    }));
  }, [weekCount, activeWeekIndex, weekDates]);

  // Check if this is today's week
  const getTodayWeekIndicator = useCallback((index: number) => {
    if (!weekDates?.[index]) return false;
    
    try {
      const today = new Date();
      const start = new Date(weekDates[index].start);
      const end = new Date(weekDates[index].end);
      return today >= start && today <= end;
    } catch {
      return false;
    }
  }, [weekDates]);

  if (weekCount < 2) return null; // No need for minimap with 1 or 0 weeks

  return (
    <div
      ref={containerRef}
      className={`scroll-minimap ${isVisible ? 'visible' : ''} ${position} ${className}`}
      style={{
        [position]: offset,
      }}
      role="navigation"
      aria-label="Week navigation"
    >
      <div className="scroll-minimap-track">
        {weekBlocks.map((week) => {
          const isToday = getTodayWeekIndicator(week.index);
          const isHovered = hoveredIndex === week.index;
          
          return (
            <button
              key={week.index}
              className={`
                scroll-minimap-block 
                ${week.isActive ? 'active' : ''} 
                ${isToday ? 'today' : ''}
                ${isHovered ? 'hovered' : ''}
              `}
              onClick={() => handleWeekClick(week.index)}
              onMouseEnter={() => setHoveredIndex(week.index)}
              onMouseLeave={() => setHoveredIndex(null)}
              aria-label={`Jump to ${week.label}`}
              aria-current={week.isActive ? 'true' : undefined}
            >
              {/* Active indicator glow */}
              {week.isActive && (
                <span className="active-glow" aria-hidden="true" />
              )}
              
              {/* Today dot indicator */}
              {isToday && (
                <span className="today-dot" aria-hidden="true" />
              )}
              
              {/* Hover label */}
              {showLabels && isHovered && (
                <span 
                  className={`week-label ${position === 'right' ? 'label-left' : 'label-right'}`}
                  aria-hidden="true"
                >
                  {week.label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <style jsx>{`
        .scroll-minimap {
          position: fixed;
          top: 50%;
          transform: translateY(-50%);
          z-index: 40;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        
        .scroll-minimap.visible {
          opacity: 1;
          pointer-events: auto;
        }
        
        .scroll-minimap.right {
          right: var(--offset, 16px);
        }
        
        .scroll-minimap.left {
          left: var(--offset, 16px);
        }
        
        .scroll-minimap-track {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 8px 6px;
          background: rgba(15, 15, 25, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 
            0 4px 20px rgba(0, 0, 0, 0.3),
            0 0 1px rgba(255, 255, 255, 0.1);
        }
        
        .scroll-minimap-block {
          position: relative;
          width: 8px;
          height: 20px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          padding: 0;
          cursor: pointer;
          transition: 
            background 0.2s ease,
            transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
            box-shadow 0.2s ease;
        }
        
        .scroll-minimap-block:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scaleY(1.15);
        }
        
        .scroll-minimap-block:focus-visible {
          outline: none;
          box-shadow: 
            0 0 0 2px rgba(99, 102, 241, 0.5),
            0 0 10px rgba(99, 102, 241, 0.3);
        }
        
        .scroll-minimap-block.active {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          box-shadow: 
            0 0 8px rgba(99, 102, 241, 0.5),
            0 0 16px rgba(139, 92, 246, 0.3);
        }
        
        .scroll-minimap-block.today {
          border: 1px solid rgba(251, 191, 36, 0.4);
        }
        
        .scroll-minimap-block.today.active {
          border: 1px solid rgba(251, 191, 36, 0.6);
          box-shadow: 
            0 0 8px rgba(99, 102, 241, 0.5),
            0 0 16px rgba(251, 191, 36, 0.3);
        }
        
        .active-glow {
          position: absolute;
          inset: -2px;
          border-radius: 6px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3));
          filter: blur(4px);
          animation: ${prefersReducedMotion ? 'none' : 'minimap-glow-pulse 2s ease-in-out infinite'};
        }
        
        .today-dot {
          position: absolute;
          top: -3px;
          right: -3px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #f59e0b;
          box-shadow: 0 0 6px rgba(245, 158, 11, 0.6);
        }
        
        .week-label {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          padding: 6px 10px;
          background: rgba(15, 15, 25, 0.95);
          backdrop-filter: blur(8px);
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 11px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.9);
          white-space: nowrap;
          pointer-events: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          animation: ${prefersReducedMotion ? 'none' : 'label-appear 0.15s ease-out'};
        }
        
        .week-label.label-left {
          right: 100%;
          margin-right: 10px;
        }
        
        .week-label.label-right {
          left: 100%;
          margin-left: 10px;
        }
        
        @keyframes minimap-glow-pulse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }
        
        @keyframes label-appear {
          from {
            opacity: 0;
            transform: translateY(-50%) translateX(${position === 'right' ? '4px' : '-4px'});
          }
          to {
            opacity: 1;
            transform: translateY(-50%) translateX(0);
          }
        }
        
        /* Light mode */
        :global(html.light) .scroll-minimap-track {
          background: rgba(255, 255, 255, 0.8);
          border-color: rgba(0, 0, 0, 0.08);
          box-shadow: 
            0 4px 20px rgba(0, 0, 0, 0.1),
            0 0 1px rgba(0, 0, 0, 0.05);
        }
        
        :global(html.light) .scroll-minimap-block {
          background: rgba(0, 0, 0, 0.08);
        }
        
        :global(html.light) .scroll-minimap-block:hover {
          background: rgba(0, 0, 0, 0.15);
        }
        
        :global(html.light) .scroll-minimap-block.active {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
        }
        
        :global(html.light) .week-label {
          background: rgba(255, 255, 255, 0.95);
          color: rgba(0, 0, 0, 0.8);
          border-color: rgba(0, 0, 0, 0.1);
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .scroll-minimap-block {
            transition: none;
          }
          
          .active-glow {
            animation: none;
            opacity: 0.6;
          }
          
          .week-label {
            animation: none;
          }
        }
        
        /* Hide on mobile - not enough screen real estate */
        @media (max-width: 768px) {
          .scroll-minimap {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * useActiveWeekIndex - Hook to track which week is currently in view
 * 
 * Uses IntersectionObserver to detect which week card is most visible.
 * Returns the index of the most visible week.
 */
export function useActiveWeekIndex(weekRefs: React.RefObject<HTMLElement | null>[]): number {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const visibilityMap = new Map<number, number>();

    weekRefs.forEach((ref, index) => {
      if (!ref.current) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            visibilityMap.set(index, entry.intersectionRatio);
            
            // Find the most visible week
            let maxRatio = 0;
            let maxIndex = 0;
            visibilityMap.forEach((ratio, idx) => {
              if (ratio > maxRatio) {
                maxRatio = ratio;
                maxIndex = idx;
              }
            });
            
            setActiveIndex(maxIndex);
          });
        },
        {
          threshold: [0, 0.25, 0.5, 0.75, 1],
          rootMargin: '-10% 0px -10% 0px',
        }
      );

      observer.observe(ref.current);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [weekRefs]);

  return activeIndex;
}

export default ScrollMinimap;
