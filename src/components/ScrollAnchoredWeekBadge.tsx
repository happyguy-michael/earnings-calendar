'use client';

import { useState, useEffect, useRef, useMemo } from 'react';

interface WeekInfo {
  index: number;
  startDate: Date;
  endDate: Date;
  isCurrentWeek: boolean;
}

interface ScrollAnchoredWeekBadgeProps {
  /** Refs to each week section element */
  weekRefs: React.RefObject<HTMLDivElement | null>[];
  /** Starting date of each week (Mon-Fri) */
  weekStarts: Date[];
  /** Index of the week containing today (null if not in view) */
  todayWeekIndex?: number | null;
  /** Offset from top of viewport (e.g., for sticky header) */
  topOffset?: number;
  /** Hide when at top of page */
  hideAtTop?: boolean;
  /** Z-index for layering */
  zIndex?: number;
}

/**
 * Format a date range as "Mar 10-14"
 */
function formatWeekRange(start: Date, end: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const startMonth = months[start.getMonth()];
  const endMonth = months[end.getMonth()];
  
  if (startMonth === endMonth) {
    return `${startMonth} ${start.getDate()}–${end.getDate()}`;
  }
  return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}`;
}

/**
 * Get Friday of the week (assuming weekStart is Monday)
 */
function getWeekEnd(weekStart: Date): Date {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 4); // Mon + 4 = Fri
  return end;
}

/**
 * ScrollAnchoredWeekBadge - Floating week indicator that shows context during scroll
 * 
 * Inspired by iOS Calendar's floating date indicator and modern dashboard patterns.
 * Appears when scrolling through calendar content, shows which week section
 * is currently in view with smooth transitions between weeks.
 * 
 * Features:
 * - Glassmorphic design with subtle blur and gradient border
 * - Smooth scale/fade transitions when changing weeks
 * - "This Week" highlight with pulsing accent
 * - Auto-hides when at top of page or scrolled past content
 * - Respects prefers-reduced-motion
 */
export function ScrollAnchoredWeekBadge({
  weekRefs,
  weekStarts,
  todayWeekIndex = null,
  topOffset = 140,
  hideAtTop = true,
  zIndex = 40,
}: ScrollAnchoredWeekBadgeProps) {
  const [activeWeek, setActiveWeek] = useState<WeekInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevWeekRef = useRef<number | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Pre-compute week info
  const weeks = useMemo(() => {
    return weekStarts.map((start, index) => ({
      index,
      startDate: start,
      endDate: getWeekEnd(start),
      isCurrentWeek: index === todayWeekIndex,
    }));
  }, [weekStarts, todayWeekIndex]);
  
  useEffect(() => {
    if (weekRefs.length === 0 || weeks.length === 0) return;
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // Hide at top of page
      if (hideAtTop && scrollY < 100) {
        setIsVisible(false);
        return;
      }
      
      // Find which week section is most visible
      let bestMatchIndex = -1;
      let bestMatchScore = 0;
      const viewportTop = scrollY + topOffset;
      const viewportBottom = scrollY + window.innerHeight;
      const viewportCenter = viewportTop + (viewportBottom - viewportTop) * 0.3; // Bias toward top
      
      weekRefs.forEach((ref, index) => {
        const el = ref.current;
        if (!el) return;
        
        const rect = el.getBoundingClientRect();
        const elTop = rect.top + scrollY;
        const elBottom = elTop + rect.height;
        
        // Check if element is in viewport
        const overlapTop = Math.max(viewportTop, elTop);
        const overlapBottom = Math.min(viewportBottom, elBottom);
        const overlap = Math.max(0, overlapBottom - overlapTop);
        
        // Also factor in proximity to viewport center-top
        const elCenter = elTop + rect.height / 2;
        const distanceFromIdeal = Math.abs(elCenter - viewportCenter);
        const proximityBonus = 1 / (1 + distanceFromIdeal / 500);
        const score = overlap * proximityBonus;
        
        if (score > bestMatchScore) {
          bestMatchIndex = index;
          bestMatchScore = score;
        }
      });
      
      if (bestMatchIndex >= 0 && bestMatchScore > 0) {
        const newWeek = weeks[bestMatchIndex];
        
        // Trigger transition animation when week changes
        if (prevWeekRef.current !== null && prevWeekRef.current !== bestMatchIndex) {
          setIsTransitioning(true);
          setTimeout(() => setIsTransitioning(false), 200);
        }
        
        prevWeekRef.current = bestMatchIndex;
        setActiveWeek(newWeek);
        setIsVisible(true);
        
        // Auto-hide after 2s of no scrolling
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
        hideTimeoutRef.current = setTimeout(() => {
          setIsVisible(false);
        }, 2000);
        
        // Re-show on scroll
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      } else {
        setIsVisible(false);
      }
    };
    
    // Initial check
    handleScroll();
    
    // Throttled scroll listener
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [weekRefs, weeks, topOffset, hideAtTop]);
  
  // Don't render if no active week
  if (!activeWeek) return null;
  
  const weekLabel = activeWeek.isCurrentWeek ? 'This Week' : `Week ${activeWeek.index + 1}`;
  const dateRange = formatWeekRange(activeWeek.startDate, activeWeek.endDate);
  
  return (
    <>
      <div 
        className={`scroll-anchored-week-badge ${isVisible ? 'visible' : ''} ${isTransitioning ? 'transitioning' : ''} ${activeWeek.isCurrentWeek ? 'current-week' : ''}`}
        style={{ '--top-offset': `${topOffset}px`, '--z-index': zIndex } as React.CSSProperties}
        role="status"
        aria-live="polite"
        aria-label={`Viewing ${weekLabel}: ${dateRange}`}
      >
        <div className="sawb-inner">
          {/* Current week indicator dot */}
          {activeWeek.isCurrentWeek && (
            <span className="sawb-today-dot" aria-hidden="true" />
          )}
          
          {/* Week label */}
          <span className="sawb-label">{weekLabel}</span>
          
          {/* Date range */}
          <span className="sawb-range">{dateRange}</span>
        </div>
      </div>
      
      <style jsx>{`
        .scroll-anchored-week-badge {
          position: fixed;
          top: var(--top-offset, 140px);
          left: 50%;
          transform: translateX(-50%) translateY(-8px) scale(0.95);
          z-index: var(--z-index, 40);
          
          /* Glassmorphic design */
          background: linear-gradient(
            135deg,
            rgba(30, 30, 40, 0.85) 0%,
            rgba(25, 25, 35, 0.9) 100%
          );
          backdrop-filter: blur(16px) saturate(1.4);
          -webkit-backdrop-filter: blur(16px) saturate(1.4);
          
          /* Border with gradient */
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 100px;
          
          /* Shadow for depth */
          box-shadow: 
            0 4px 24px rgba(0, 0, 0, 0.3),
            0 1px 3px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          
          /* Initial hidden state */
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          
          /* Transitions */
          transition: 
            opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1),
            transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
            visibility 0.25s;
        }
        
        .scroll-anchored-week-badge.visible {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(0) scale(1);
        }
        
        .scroll-anchored-week-badge.transitioning {
          transform: translateX(-50%) translateY(0) scale(1.03);
        }
        
        /* Current week glow accent */
        .scroll-anchored-week-badge.current-week {
          border-color: rgba(139, 92, 246, 0.3);
          box-shadow: 
            0 4px 24px rgba(0, 0, 0, 0.3),
            0 1px 3px rgba(0, 0, 0, 0.2),
            0 0 20px rgba(139, 92, 246, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }
        
        .sawb-inner {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
        }
        
        .sawb-today-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6, #a78bfa);
          box-shadow: 0 0 8px rgba(139, 92, 246, 0.5);
          animation: sawb-pulse 2s ease-in-out infinite;
        }
        
        .sawb-label {
          font-size: 12px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          letter-spacing: 0.01em;
        }
        
        .scroll-anchored-week-badge.current-week .sawb-label {
          color: #a78bfa;
        }
        
        .sawb-range {
          font-size: 11px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.5);
          letter-spacing: 0.02em;
        }
        
        @keyframes sawb-pulse {
          0%, 100% { 
            opacity: 1;
            transform: scale(1);
          }
          50% { 
            opacity: 0.7;
            transform: scale(0.85);
          }
        }
        
        /* Light mode */
        :global(.light) .scroll-anchored-week-badge {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.92) 0%,
            rgba(250, 250, 252, 0.95) 100%
          );
          border-color: rgba(0, 0, 0, 0.08);
          box-shadow: 
            0 4px 24px rgba(0, 0, 0, 0.08),
            0 1px 3px rgba(0, 0, 0, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }
        
        :global(.light) .scroll-anchored-week-badge.current-week {
          border-color: rgba(139, 92, 246, 0.25);
          box-shadow: 
            0 4px 24px rgba(0, 0, 0, 0.08),
            0 1px 3px rgba(0, 0, 0, 0.05),
            0 0 16px rgba(139, 92, 246, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }
        
        :global(.light) .sawb-label {
          color: rgba(0, 0, 0, 0.85);
        }
        
        :global(.light) .scroll-anchored-week-badge.current-week .sawb-label {
          color: #7c3aed;
        }
        
        :global(.light) .sawb-range {
          color: rgba(0, 0, 0, 0.5);
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .scroll-anchored-week-badge {
            transition: opacity 0.15s ease;
          }
          
          .scroll-anchored-week-badge.visible {
            transform: translateX(-50%) translateY(0) scale(1);
          }
          
          .scroll-anchored-week-badge.transitioning {
            transform: translateX(-50%) translateY(0) scale(1);
          }
          
          .sawb-today-dot {
            animation: none;
          }
        }
        
        /* Mobile adjustments */
        @media (max-width: 640px) {
          .scroll-anchored-week-badge {
            top: calc(var(--top-offset, 140px) - 20px);
          }
          
          .sawb-inner {
            padding: 6px 12px;
            gap: 6px;
          }
          
          .sawb-label {
            font-size: 11px;
          }
          
          .sawb-range {
            font-size: 10px;
          }
          
          .sawb-today-dot {
            width: 5px;
            height: 5px;
          }
        }
      `}</style>
    </>
  );
}

export default ScrollAnchoredWeekBadge;
