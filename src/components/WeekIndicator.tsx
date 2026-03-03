'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';

interface WeekIndicatorProps {
  totalWeeks?: number;
  todayWeekIndex?: number | null;
  weekRefs?: React.RefObject<HTMLDivElement | null>[];
}

/**
 * Animated week pagination dots showing which week is currently in view.
 * Features: spring-animated transitions, today marker, hover glow, scroll-to-week on click,
 * and intersection observer to track which week is visible.
 */
export function WeekIndicator({ 
  totalWeeks = 3,
  todayWeekIndex = null,
  weekRefs = []
}: WeekIndicatorProps) {
  const [activeWeekIndex, setActiveWeekIndex] = useState(todayWeekIndex ?? 0);
  const dots = useMemo(() => Array.from({ length: totalWeeks }, (_, i) => i), [totalWeeks]);
  
  // Track which week is most visible using Intersection Observer
  useEffect(() => {
    if (weekRefs.length === 0) return;
    
    const observers: IntersectionObserver[] = [];
    const visibilityMap = new Map<number, number>();
    
    weekRefs.forEach((ref, index) => {
      if (!ref?.current) return;
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            visibilityMap.set(index, entry.intersectionRatio);
            
            // Find the most visible week
            let maxRatio = 0;
            let mostVisibleIndex = 0;
            visibilityMap.forEach((ratio, i) => {
              if (ratio > maxRatio) {
                maxRatio = ratio;
                mostVisibleIndex = i;
              }
            });
            
            if (maxRatio > 0.3) {
              setActiveWeekIndex(mostVisibleIndex);
            }
          });
        },
        { threshold: [0, 0.25, 0.5, 0.75, 1] }
      );
      
      observer.observe(ref.current);
      observers.push(observer);
    });
    
    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [weekRefs]);
  
  // Scroll to week when dot is clicked
  const handleDotClick = useCallback((index: number) => {
    const ref = weekRefs[index];
    if (ref?.current) {
      ref.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center'
      });
    }
    setActiveWeekIndex(index);
  }, [weekRefs]);
  
  // Get week label text
  const getWeekLabel = () => {
    if (todayWeekIndex === activeWeekIndex && todayWeekIndex !== null) {
      return 'This Week';
    }
    if (todayWeekIndex !== null && activeWeekIndex < todayWeekIndex) {
      return 'Previous Week';
    }
    if (todayWeekIndex !== null && activeWeekIndex > todayWeekIndex) {
      return 'Next Week';
    }
    return `Week ${activeWeekIndex + 1}`;
  };
  
  return (
    <div className="week-indicator-container" role="tablist" aria-label="Week navigation">
      <div className="week-indicator-track">
        {/* Animated active pill that slides between dots */}
        <div 
          className="week-indicator-pill"
          style={{ 
            transform: `translateX(${activeWeekIndex * 28}px)`,
          }}
        />
        
        {/* Individual dots */}
        {dots.map((index) => {
          const isActive = index === activeWeekIndex;
          const isToday = index === todayWeekIndex;
          
          return (
            <button
              key={index}
              role="tab"
              aria-selected={isActive}
              aria-label={`Week ${index + 1}${isToday ? ' (contains today)' : ''}`}
              onClick={() => handleDotClick(index)}
              className={`week-indicator-dot ${isActive ? 'active' : ''} ${isToday ? 'today' : ''}`}
            >
              {isToday && (
                <span className="week-indicator-today-ring" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Week label */}
      <div className="week-indicator-label">
        {getWeekLabel()}
      </div>
    </div>
  );
}

export default WeekIndicator;
