'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';

interface WeekIndicatorProps {
  totalWeeks?: number;
  todayWeekIndex?: number | null;
  weekRefs?: React.RefObject<HTMLDivElement | null>[];
}

/**
 * Calculate progress through the current trading week (Mon-Fri).
 * Returns 0-100 based on current time within the week.
 * Market hours considered: 9:30 AM - 4:00 PM ET (14:30 - 21:00 UTC)
 */
function getWeekProgress(): number {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday
  
  // Weekend: return 100% (week complete)
  if (day === 0 || day === 6) return 100;
  
  // Trading days Mon(1) - Fri(5) = 5 days
  // Each day represents 20% of the week
  const dayProgress = (day - 1) * 20; // Mon=0%, Tue=20%, Wed=40%, Thu=60%, Fri=80%
  
  // Calculate intraday progress (0-20% for each day)
  // Market hours: 9:30-16:00 = 6.5 hours = 390 minutes
  // Pre-market: 4:00-9:30 = 5.5 hours
  // After-hours: 16:00-20:00 = 4 hours
  // For simplicity, use 9:30 AM - 4:00 PM as core hours
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  
  // Convert to ET (approximate, assuming local is ET for simplicity)
  // Market open: 9:30 (570 min), close: 16:00 (960 min)
  let intradayPercent: number;
  
  if (totalMinutes < 570) {
    // Before market open
    intradayPercent = 0;
  } else if (totalMinutes >= 960) {
    // After market close
    intradayPercent = 20;
  } else {
    // During market hours
    intradayPercent = ((totalMinutes - 570) / 390) * 20;
  }
  
  return Math.min(100, dayProgress + intradayPercent);
}

/**
 * Get day names with progress markers
 */
function getDayMarkers(): { day: string; position: number }[] {
  return [
    { day: 'M', position: 0 },
    { day: 'T', position: 20 },
    { day: 'W', position: 40 },
    { day: 'T', position: 60 },
    { day: 'F', position: 80 },
  ];
}

/**
 * Animated week pagination dots showing which week is currently in view.
 * Features: spring-animated transitions, today marker, hover glow, scroll-to-week on click,
 * intersection observer to track which week is visible, and week progress bar.
 */
export function WeekIndicator({ 
  totalWeeks = 3,
  todayWeekIndex = null,
  weekRefs = []
}: WeekIndicatorProps) {
  const [activeWeekIndex, setActiveWeekIndex] = useState(todayWeekIndex ?? 0);
  const [weekProgress, setWeekProgress] = useState(0);
  const dots = useMemo(() => Array.from({ length: totalWeeks }, (_, i) => i), [totalWeeks]);
  const dayMarkers = useMemo(() => getDayMarkers(), []);
  
  // Update week progress every minute
  useEffect(() => {
    const updateProgress = () => {
      setWeekProgress(getWeekProgress());
    };
    
    updateProgress();
    const interval = setInterval(updateProgress, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);
  
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
  
  const showProgressBar = activeWeekIndex === todayWeekIndex && todayWeekIndex !== null;
  
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
      
      {/* Week progress bar - only shown for current week */}
      {showProgressBar && (
        <div className="week-progress-container" role="progressbar" aria-valuenow={Math.round(weekProgress)} aria-valuemin={0} aria-valuemax={100}>
          <div className="week-progress-track">
            {/* Day markers */}
            <div className="week-progress-markers">
              {dayMarkers.map((marker, i) => (
                <span 
                  key={i} 
                  className={`week-progress-marker ${weekProgress >= marker.position + 10 ? 'passed' : ''}`}
                  style={{ left: `${marker.position}%` }}
                >
                  {marker.day}
                </span>
              ))}
            </div>
            
            {/* Progress fill with gradient */}
            <div 
              className="week-progress-fill"
              style={{ width: `${weekProgress}%` }}
            >
              {/* Animated shimmer effect */}
              <div className="week-progress-shimmer" />
            </div>
            
            {/* Current position indicator */}
            <div 
              className="week-progress-head"
              style={{ left: `${weekProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default WeekIndicator;
