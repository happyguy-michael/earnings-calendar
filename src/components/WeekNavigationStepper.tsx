'use client';

import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useHaptic } from './HapticFeedback';

/**
 * WeekNavigationStepper
 * 
 * Floating dot navigation showing which week is currently in view.
 * Allows quick jumps between weeks with smooth scrolling.
 * 
 * Inspiration:
 * - iOS page dots (but vertical for scroll context)
 * - Notion's table of contents navigator
 * - Modern dashboard scroll indicators
 * 
 * Features:
 * - Auto-hides when not scrolling (appears on scroll)
 * - Active dot highlights with animated expansion
 * - Subtle gradient glow on active week
 * - Tooltip shows week date range on hover
 * - Click to scroll to that week
 * - Keyboard accessible (arrow keys to navigate)
 * - Respects prefers-reduced-motion
 * - Mobile: smaller, right-edge positioned
 * - Desktop: right side with labels on hover
 */

interface WeekInfo {
  id: string;
  label: string;
  shortLabel: string;
  startDate: string;
  isCurrentWeek?: boolean;
}

interface WeekNavigationStepperProps {
  /** Array of week IDs to track */
  weeks: WeekInfo[];
  /** Currently active week index */
  activeWeekIndex?: number;
  /** Callback when user clicks a week dot */
  onNavigate?: (weekId: string, index: number) => void;
  /** Custom class name */
  className?: string;
}

const WeekNavigationStepper = memo(function WeekNavigationStepper({
  weeks,
  activeWeekIndex: controlledActiveIndex,
  onNavigate,
  className = '',
}: WeekNavigationStepperProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prefersReducedMotion = useRef(false);
  const { trigger: haptic } = useHaptic();

  // Use controlled index if provided
  const currentActiveIndex = controlledActiveIndex ?? activeIndex;

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }, []);

  // Scroll spy: detect which week is in view
  useEffect(() => {
    const handleScroll = () => {
      // Show stepper on scroll
      setIsVisible(true);
      
      // Clear previous hide timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      
      // Hide after 2s of no scrolling
      hideTimeoutRef.current = setTimeout(() => {
        if (!isExpanded) {
          setIsVisible(false);
        }
      }, 2000);

      // Find which week is currently most visible
      if (scrollTimeoutRef.current) return; // Debounce
      
      scrollTimeoutRef.current = setTimeout(() => {
        const viewportCenter = window.innerHeight / 2;
        let closestIndex = 0;
        let closestDistance = Infinity;

        weeks.forEach((week, index) => {
          const element = document.getElementById(week.id);
          if (element) {
            const rect = element.getBoundingClientRect();
            const elementCenter = rect.top + rect.height / 2;
            const distance = Math.abs(elementCenter - viewportCenter);
            
            if (distance < closestDistance) {
              closestDistance = distance;
              closestIndex = index;
            }
          }
        });

        setActiveIndex(closestIndex);
        scrollTimeoutRef.current = null;
      }, 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [weeks, isExpanded]);

  // Handle dot click - scroll to week
  const handleDotClick = useCallback((weekId: string, index: number) => {
    const element = document.getElementById(weekId);
    if (element) {
      const headerOffset = 80; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: prefersReducedMotion.current ? 'auto' : 'smooth',
      });

      haptic('light');
      onNavigate?.(weekId, index);
    }
  }, [onNavigate, haptic]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const newIndex = Math.max(0, currentActiveIndex - 1);
      handleDotClick(weeks[newIndex].id, newIndex);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const newIndex = Math.min(weeks.length - 1, currentActiveIndex + 1);
      handleDotClick(weeks[newIndex].id, newIndex);
    }
  }, [currentActiveIndex, weeks, handleDotClick]);

  if (weeks.length <= 1) return null;

  return (
    <>
      <nav
        ref={containerRef}
        className={`week-nav-stepper ${isVisible ? 'visible' : ''} ${isExpanded ? 'expanded' : ''} ${className}`}
        role="navigation"
        aria-label="Week navigation"
        onMouseEnter={() => {
          setIsExpanded(true);
          setIsVisible(true);
        }}
        onMouseLeave={() => {
          setIsExpanded(false);
          // Don't immediately hide - let scroll handler manage it
        }}
        onKeyDown={handleKeyDown}
      >
        <div className="week-nav-track">
          {weeks.map((week, index) => {
            const isActive = index === currentActiveIndex;
            const isHovered = index === hoveredIndex;
            const isCurrent = week.isCurrentWeek;
            
            return (
              <button
                key={week.id}
                onClick={() => handleDotClick(week.id, index)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`week-nav-dot ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}
                aria-label={`Go to ${week.label}`}
                aria-current={isActive ? 'true' : undefined}
                tabIndex={0}
              >
                {/* Dot */}
                <span className="week-nav-dot-inner">
                  {/* Active glow ring */}
                  {isActive && (
                    <span className="week-nav-dot-glow" />
                  )}
                  {/* Current week indicator */}
                  {isCurrent && (
                    <span className="week-nav-dot-pulse" />
                  )}
                </span>
                
                {/* Label (visible on hover/expand) */}
                <span 
                  className={`week-nav-label ${isExpanded || isHovered ? 'visible' : ''}`}
                >
                  {week.shortLabel}
                  {isCurrent && <span className="week-nav-now">now</span>}
                </span>
              </button>
            );
          })}
        </div>
        
        {/* Scroll hint at edges */}
        {currentActiveIndex > 0 && (
          <div className="week-nav-hint-top">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </div>
        )}
        {currentActiveIndex < weeks.length - 1 && (
          <div className="week-nav-hint-bottom">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        )}
      </nav>

      <style jsx>{`
        .week-nav-stepper {
          position: fixed;
          right: 16px;
          top: 50%;
          transform: translateY(-50%) translateX(20px);
          z-index: 40;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          opacity: 0;
          transition: opacity 0.3s ease, transform 0.3s ease;
          pointer-events: none;
        }

        .week-nav-stepper.visible {
          opacity: 1;
          transform: translateY(-50%) translateX(0);
          pointer-events: auto;
        }

        .week-nav-track {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 8px;
          background: rgba(24, 24, 27, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
        }

        .week-nav-dot {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          outline: none;
        }

        .week-nav-dot:focus-visible .week-nav-dot-inner {
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
        }

        .week-nav-dot-inner {
          position: relative;
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          flex-shrink: 0;
        }

        .week-nav-dot:hover .week-nav-dot-inner {
          background: rgba(255, 255, 255, 0.6);
          transform: scale(1.2);
        }

        .week-nav-dot.active .week-nav-dot-inner {
          width: 10px;
          height: 10px;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
        }

        .week-nav-dot.current .week-nav-dot-inner {
          background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
        }

        .week-nav-dot.active.current .week-nav-dot-inner {
          background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
        }

        .week-nav-dot-glow {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%);
          animation: glow-pulse 2s ease-in-out infinite;
        }

        .week-nav-dot-pulse {
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 2px solid currentColor;
          opacity: 0;
          animation: dot-pulse 2s ease-out infinite;
        }

        .week-nav-dot.current .week-nav-dot-pulse {
          color: #10b981;
        }

        .week-nav-label {
          position: absolute;
          right: calc(100% + 8px);
          white-space: nowrap;
          font-size: 11px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.7);
          padding: 4px 8px;
          background: rgba(24, 24, 27, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          opacity: 0;
          transform: translateX(8px);
          transition: all 0.2s ease;
          pointer-events: none;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .week-nav-label.visible {
          opacity: 1;
          transform: translateX(0);
        }

        .week-nav-now {
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #10b981;
          background: rgba(16, 185, 129, 0.15);
          padding: 2px 4px;
          border-radius: 3px;
        }

        .week-nav-hint-top,
        .week-nav-hint-bottom {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          color: rgba(255, 255, 255, 0.3);
          animation: hint-bounce 1.5s ease-in-out infinite;
        }

        .week-nav-hint-top {
          top: -20px;
        }

        .week-nav-hint-bottom {
          bottom: -20px;
          animation-delay: 0.75s;
        }

        @keyframes glow-pulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(1.3);
          }
        }

        @keyframes dot-pulse {
          0% {
            transform: scale(0.8);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }

        @keyframes hint-bounce {
          0%, 100% {
            opacity: 0.3;
            transform: translateX(-50%) translateY(0);
          }
          50% {
            opacity: 0.6;
            transform: translateX(-50%) translateY(-3px);
          }
        }

        /* Light mode */
        :global(html.light) .week-nav-track {
          background: rgba(255, 255, 255, 0.9);
          border-color: rgba(0, 0, 0, 0.1);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
        }

        :global(html.light) .week-nav-dot-inner {
          background: rgba(0, 0, 0, 0.2);
        }

        :global(html.light) .week-nav-dot:hover .week-nav-dot-inner {
          background: rgba(0, 0, 0, 0.4);
        }

        :global(html.light) .week-nav-label {
          background: rgba(255, 255, 255, 0.95);
          border-color: rgba(0, 0, 0, 0.1);
          color: rgba(0, 0, 0, 0.7);
        }

        :global(html.light) .week-nav-hint-top,
        :global(html.light) .week-nav-hint-bottom {
          color: rgba(0, 0, 0, 0.2);
        }

        /* Mobile adjustments */
        @media (max-width: 768px) {
          .week-nav-stepper {
            right: 8px;
          }

          .week-nav-track {
            padding: 6px;
            gap: 10px;
            border-radius: 12px;
          }

          .week-nav-dot-inner {
            width: 6px;
            height: 6px;
          }

          .week-nav-dot.active .week-nav-dot-inner {
            width: 8px;
            height: 8px;
          }

          .week-nav-label {
            display: none;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .week-nav-stepper {
            transition: opacity 0.15s ease;
            transform: translateY(-50%);
          }

          .week-nav-stepper.visible {
            transform: translateY(-50%);
          }

          .week-nav-dot-inner {
            transition: background 0.15s ease;
          }

          .week-nav-dot-glow,
          .week-nav-dot-pulse {
            animation: none;
          }

          .week-nav-hint-top,
          .week-nav-hint-bottom {
            animation: none;
            opacity: 0.3;
          }

          .week-nav-label {
            transition: opacity 0.15s ease;
            transform: none;
          }

          .week-nav-label.visible {
            transform: none;
          }
        }
      `}</style>
    </>
  );
});

/**
 * Hook to generate week info from week start dates
 */
export function useWeekNavigation(weekDates: Date[]): WeekInfo[] {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  const formatShortLabel = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isCurrentWeek = (weekStart: Date) => {
    const now = new Date();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return now >= weekStart && now <= weekEnd;
  };

  return weekDates.map((date, index) => {
    const weekEnd = new Date(date);
    weekEnd.setDate(weekEnd.getDate() + 4); // Weekdays only
    
    return {
      id: `week-${index}`,
      label: `Week of ${formatDate(date)} - ${formatDate(weekEnd)}`,
      shortLabel: formatShortLabel(date),
      startDate: date.toISOString().split('T')[0],
      isCurrentWeek: isCurrentWeek(date),
    };
  });
}

export default WeekNavigationStepper;
