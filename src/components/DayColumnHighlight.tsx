'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

/**
 * DayColumnHighlight - Visual affordance for scanning earnings by day
 * 
 * When hovering a day header (Mon-Fri), highlights all earnings cards
 * in that column with a subtle glow/indicator, making it easy to 
 * visually parse which earnings belong to which day.
 * 
 * Inspired by:
 * - Google Calendar's column hover highlighting
 * - Notion's database column focus
 * - Premium dashboard UI patterns (Linear, Vercel)
 * 
 * 2026 Trend: Contextual highlighting, attention-aware interfaces
 * 
 * Features:
 * - Subtle left border glow on column cards
 * - Animated edge indicator
 * - Respects prefers-reduced-motion
 * - Light/dark mode aware
 */

type DayIndex = number | null; // 0-4 for Mon-Fri, null for none

interface DayColumnContextValue {
  hoveredDay: DayIndex;
  setHoveredDay: (day: DayIndex) => void;
}

const DayColumnContext = createContext<DayColumnContextValue | null>(null);

export function useDayColumnHighlight() {
  const context = useContext(DayColumnContext);
  if (!context) {
    return { hoveredDay: null, setHoveredDay: () => {} };
  }
  return context;
}

export function DayColumnProvider({ children }: { children: ReactNode }) {
  const [hoveredDay, setHoveredDay] = useState<DayIndex>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Apply CSS custom property for global coordination
  useEffect(() => {
    const root = document.documentElement;
    if (hoveredDay !== null) {
      root.style.setProperty('--day-column-active', String(hoveredDay));
      root.classList.add('day-column-hover-active');
    } else {
      root.style.removeProperty('--day-column-active');
      root.classList.remove('day-column-hover-active');
    }
  }, [hoveredDay]);

  return (
    <DayColumnContext.Provider value={{ hoveredDay, setHoveredDay }}>
      {children}
      
      {/* Inject global styles for column highlighting */}
      <style jsx global>{`
        /* Base transition for all cards in day columns */
        .day-column-card {
          position: relative;
          transition: ${prefersReducedMotion ? 'none' : 'opacity 0.2s ease, transform 0.2s ease'};
        }
        
        /* When any day column is hovered, slightly dim other columns */
        .day-column-hover-active .day-column-card {
          opacity: 0.55;
        }
        
        /* Highlighted column cards get full opacity and glow */
        .day-column-hover-active .day-column-card.day-column-highlighted {
          opacity: 1;
          z-index: 2;
        }
        
        /* Left edge glow indicator */
        .day-column-card.day-column-highlighted::before {
          content: '';
          position: absolute;
          left: -2px;
          top: 4px;
          bottom: 4px;
          width: 3px;
          border-radius: 2px;
          background: linear-gradient(
            180deg,
            rgba(59, 130, 246, 0.7) 0%,
            rgba(139, 92, 246, 0.7) 50%,
            rgba(59, 130, 246, 0.7) 100%
          );
          opacity: 0;
          animation: ${prefersReducedMotion ? 'none' : 'dayColumnGlowIn 0.25s ease forwards'};
          box-shadow: 
            0 0 8px rgba(59, 130, 246, 0.5),
            0 0 16px rgba(139, 92, 246, 0.3);
        }
        
        /* Light mode adjustments */
        html.light .day-column-hover-active .day-column-card {
          opacity: 0.45;
        }
        
        html.light .day-column-card.day-column-highlighted::before {
          background: linear-gradient(
            180deg,
            rgba(59, 130, 246, 0.85) 0%,
            rgba(139, 92, 246, 0.85) 50%,
            rgba(59, 130, 246, 0.85) 100%
          );
          box-shadow: 
            0 0 6px rgba(59, 130, 246, 0.4),
            0 0 12px rgba(139, 92, 246, 0.2);
        }
        
        /* Animation keyframes */
        @keyframes dayColumnGlowIn {
          0% {
            opacity: 0;
            transform: scaleY(0.5);
          }
          50% {
            transform: scaleY(1.05);
          }
          100% {
            opacity: 1;
            transform: scaleY(1);
          }
        }
        
        /* Day header highlight state */
        .day-header-highlightable {
          cursor: pointer;
          transition: ${prefersReducedMotion ? 'none' : 'background-color 0.2s ease, transform 0.2s ease'};
        }
        
        .day-header-highlightable:hover {
          background-color: rgba(59, 130, 246, 0.08);
        }
        
        .day-header-highlightable.day-header-active {
          background-color: rgba(59, 130, 246, 0.12);
          transform: ${prefersReducedMotion ? 'none' : 'scale(1.02)'};
        }
        
        html.light .day-header-highlightable:hover {
          background-color: rgba(59, 130, 246, 0.06);
        }
        
        html.light .day-header-highlightable.day-header-active {
          background-color: rgba(59, 130, 246, 0.1);
        }
        
        /* Shimmer effect on active column header */
        .day-header-highlightable.day-header-active::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.1) 50%,
            transparent 100%
          );
          animation: ${prefersReducedMotion ? 'none' : 'dayHeaderShimmer 1.5s ease-in-out infinite'};
          pointer-events: none;
        }
        
        @keyframes dayHeaderShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        /* Reduced motion - simple highlight without animation */
        @media (prefers-reduced-motion: reduce) {
          .day-column-card,
          .day-header-highlightable {
            transition: none !important;
          }
          
          .day-column-card.day-column-highlighted::before {
            animation: none !important;
            opacity: 1;
            transform: scaleY(1);
          }
          
          .day-header-highlightable.day-header-active::after {
            animation: none !important;
            display: none;
          }
        }
      `}</style>
    </DayColumnContext.Provider>
  );
}

/**
 * DayHeader wrapper - makes day headers interactive for column highlighting
 */
interface DayHeaderHighlightProps {
  dayIndex: number; // 0-4 for Mon-Fri
  children: ReactNode;
  className?: string;
}

export function DayHeaderHighlight({ dayIndex, children, className = '' }: DayHeaderHighlightProps) {
  const { hoveredDay, setHoveredDay } = useDayColumnHighlight();
  
  const handleMouseEnter = useCallback(() => {
    setHoveredDay(dayIndex);
  }, [dayIndex, setHoveredDay]);
  
  const handleMouseLeave = useCallback(() => {
    setHoveredDay(null);
  }, [setHoveredDay]);
  
  const isActive = hoveredDay === dayIndex;
  
  return (
    <div
      className={`day-header-highlightable ${isActive ? 'day-header-active' : ''} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
      aria-pressed={isActive}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {children}
    </div>
  );
}

/**
 * DayColumnCard wrapper - applies highlight styling when its day is hovered
 */
interface DayColumnCardProps {
  dayIndex: number; // 0-4 for Mon-Fri
  children: ReactNode;
  className?: string;
}

export function DayColumnCard({ dayIndex, children, className = '' }: DayColumnCardProps) {
  const { hoveredDay } = useDayColumnHighlight();
  const isHighlighted = hoveredDay === dayIndex;
  
  return (
    <div className={`day-column-card ${isHighlighted ? 'day-column-highlighted' : ''} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Visual indicator showing which day column is active (optional)
 */
export function DayColumnIndicator() {
  const { hoveredDay } = useDayColumnHighlight();
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  
  if (hoveredDay === null) return null;
  
  return (
    <div 
      className="day-column-indicator"
      role="status"
      aria-live="polite"
    >
      <span className="day-column-indicator-dot" />
      <span className="day-column-indicator-text">
        Viewing {days[hoveredDay]} earnings
      </span>
      
      <style jsx>{`
        .day-column-indicator {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(20, 20, 30, 0.95);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 20px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
          z-index: 100;
          animation: indicatorFadeIn 0.2s ease;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        
        html.light .day-column-indicator {
          background: rgba(255, 255, 255, 0.95);
          border-color: rgba(59, 130, 246, 0.2);
          color: rgba(0, 0, 0, 0.8);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        
        .day-column-indicator-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          animation: indicatorPulse 1.5s ease-in-out infinite;
        }
        
        @keyframes indicatorFadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        
        @keyframes indicatorPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.2); }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .day-column-indicator {
            animation: none;
          }
          .day-column-indicator-dot {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
