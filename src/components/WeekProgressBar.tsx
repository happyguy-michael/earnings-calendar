'use client';

import { useEffect, useState, useRef, useMemo } from 'react';

interface WeekProgressBarProps {
  /** Current day index in the week (0=Monday, 4=Friday) */
  currentDayIndex: number;
  /** Whether this is the current week */
  isCurrentWeek: boolean;
  /** Animation delay in ms */
  delay?: number;
  /** Show percentage label on hover */
  showLabel?: boolean;
  /** Variant style */
  variant?: 'default' | 'gradient' | 'pulse';
  /** Custom class name */
  className?: string;
}

/**
 * WeekProgressBar - Visual indicator showing progress through the trading week
 * 
 * Features:
 * - Smooth animated fill on mount
 * - Gradient background with subtle animation
 * - Pulse effect on the progress edge
 * - Hover state showing percentage
 * - Only renders on current week for performance
 * 
 * Design inspiration: Modern financial dashboards showing time-based progress
 */
export function WeekProgressBar({
  currentDayIndex,
  isCurrentWeek,
  delay = 0,
  showLabel = true,
  variant = 'gradient',
  className = '',
}: WeekProgressBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Calculate progress (0-100)
  // Monday = 20%, Tuesday = 40%, etc.
  // If it's before market hours, use previous day's progress
  const progress = useMemo(() => {
    if (!isCurrentWeek) return 0;
    // Each day represents 20% of the week
    const baseProgress = ((currentDayIndex + 1) / 5) * 100;
    return Math.min(Math.max(baseProgress, 0), 100);
  }, [currentDayIndex, isCurrentWeek]);

  // Entrance animation
  useEffect(() => {
    if (!isCurrentWeek) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [isCurrentWeek, delay]);

  // Don't render if not current week
  if (!isCurrentWeek) return null;

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  return (
    <div
      ref={ref}
      className={`week-progress-bar ${variant} ${isVisible ? 'visible' : ''} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Week progress: ${dayLabels[currentDayIndex]}, ${Math.round(progress)}% complete`}
    >
      {/* Track */}
      <div className="week-progress-track">
        {/* Day markers */}
        <div className="week-progress-markers">
          {[0, 1, 2, 3, 4].map((day) => (
            <div
              key={day}
              className={`week-progress-marker ${day <= currentDayIndex ? 'passed' : ''} ${day === currentDayIndex ? 'current' : ''}`}
              style={{ left: `${((day + 1) / 5) * 100}%` }}
            />
          ))}
        </div>

        {/* Fill */}
        <div
          className="week-progress-fill"
          style={{
            '--progress': `${isVisible ? progress : 0}%`,
            '--delay': `${delay}ms`,
          } as React.CSSProperties}
        >
          {/* Gradient shimmer overlay */}
          <div className="week-progress-shimmer" />
          
          {/* Pulse dot at the edge */}
          <div className="week-progress-pulse" />
        </div>

        {/* Glow effect under the progress */}
        <div
          className="week-progress-glow"
          style={{
            '--progress': `${isVisible ? progress : 0}%`,
          } as React.CSSProperties}
        />
      </div>

      {/* Label tooltip on hover */}
      {showLabel && (
        <div className={`week-progress-label ${isHovered ? 'visible' : ''}`}>
          <span className="week-progress-label-day">{dayLabels[currentDayIndex]}</span>
          <span className="week-progress-label-percent">{Math.round(progress)}%</span>
        </div>
      )}

      <style jsx>{`
        .week-progress-bar {
          position: relative;
          width: 100%;
          height: 4px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: height 0.2s ease;
        }

        .week-progress-bar:hover {
          height: 6px;
        }

        .week-progress-track {
          position: relative;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 4px;
          overflow: hidden;
        }

        .week-progress-markers {
          position: absolute;
          inset: 0;
          z-index: 2;
        }

        .week-progress-marker {
          position: absolute;
          top: 50%;
          width: 2px;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 1px;
          transform: translate(-50%, -50%);
          transition: background 0.3s ease, transform 0.3s ease;
        }

        .week-progress-marker.passed {
          background: rgba(34, 197, 94, 0.3);
        }

        .week-progress-marker.current {
          background: rgba(34, 197, 94, 0.6);
          transform: translate(-50%, -50%) scaleY(1.2);
        }

        .week-progress-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: var(--progress);
          background: linear-gradient(90deg, 
            rgba(34, 197, 94, 0.7) 0%,
            rgba(34, 197, 94, 0.9) 50%,
            rgba(74, 222, 128, 1) 100%
          );
          border-radius: 4px;
          transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
          transition-delay: var(--delay);
          overflow: hidden;
        }

        .week-progress-bar:not(.visible) .week-progress-fill {
          width: 0;
        }

        .week-progress-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.2) 50%,
            transparent 100%
          );
          animation: shimmer 2.5s ease-in-out infinite;
          animation-delay: calc(var(--delay) + 1200ms);
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .week-progress-pulse {
          position: absolute;
          right: -3px;
          top: 50%;
          width: 6px;
          height: 6px;
          background: #4ade80;
          border-radius: 50%;
          transform: translateY(-50%);
          box-shadow: 0 0 8px rgba(74, 222, 128, 0.6);
          animation: pulse-glow 2s ease-in-out infinite;
          animation-delay: calc(var(--delay) + 1200ms);
        }

        @keyframes pulse-glow {
          0%, 100% {
            transform: translateY(-50%) scale(1);
            box-shadow: 0 0 8px rgba(74, 222, 128, 0.6);
          }
          50% {
            transform: translateY(-50%) scale(1.3);
            box-shadow: 0 0 16px rgba(74, 222, 128, 0.8);
          }
        }

        .week-progress-glow {
          position: absolute;
          top: 100%;
          left: 0;
          width: var(--progress);
          height: 8px;
          background: linear-gradient(180deg, 
            rgba(34, 197, 94, 0.2) 0%,
            transparent 100%
          );
          filter: blur(4px);
          pointer-events: none;
          transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
          transition-delay: var(--delay);
        }

        .week-progress-bar:not(.visible) .week-progress-glow {
          width: 0;
        }

        .week-progress-label {
          position: absolute;
          top: -32px;
          right: 0;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: rgba(0, 0, 0, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          font-size: 11px;
          opacity: 0;
          transform: translateY(4px);
          transition: opacity 0.2s ease, transform 0.2s ease;
          pointer-events: none;
          backdrop-filter: blur(8px);
          z-index: 10;
        }

        .week-progress-label.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .week-progress-label-day {
          color: rgba(255, 255, 255, 0.7);
          font-weight: 500;
        }

        .week-progress-label-percent {
          color: #4ade80;
          font-weight: 600;
        }

        /* Gradient variant */
        .week-progress-bar.gradient .week-progress-fill {
          background: linear-gradient(90deg, 
            rgba(59, 130, 246, 0.8) 0%,
            rgba(34, 197, 94, 0.9) 50%,
            rgba(74, 222, 128, 1) 100%
          );
        }

        .week-progress-bar.gradient .week-progress-pulse {
          background: linear-gradient(135deg, #3b82f6, #4ade80);
        }

        /* Pulse variant - more prominent animation */
        .week-progress-bar.pulse .week-progress-fill {
          animation: progress-pulse 3s ease-in-out infinite;
          animation-delay: calc(var(--delay) + 1200ms);
        }

        @keyframes progress-pulse {
          0%, 100% {
            filter: brightness(1);
          }
          50% {
            filter: brightness(1.2);
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .week-progress-fill {
            transition-duration: 0.1s;
          }
          .week-progress-shimmer,
          .week-progress-pulse {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Hook to calculate current day index for the week progress bar
 */
export function useWeekProgress() {
  const [currentDayIndex, setCurrentDayIndex] = useState<number>(() => {
    const now = new Date();
    const day = now.getDay();
    // Convert Sunday=0..Saturday=6 to Monday=0..Friday=4
    // Weekend maps to Friday (day 4)
    if (day === 0) return 4; // Sunday -> show Friday
    if (day === 6) return 4; // Saturday -> show Friday
    return day - 1; // Monday=0, ..., Friday=4
  });

  useEffect(() => {
    // Update at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    const timer = setTimeout(() => {
      const newDay = new Date().getDay();
      if (newDay >= 1 && newDay <= 5) {
        setCurrentDayIndex(newDay - 1);
      }
    }, msUntilMidnight);

    return () => clearTimeout(timer);
  }, [currentDayIndex]);

  return currentDayIndex;
}
