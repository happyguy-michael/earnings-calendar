'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Earning } from '@/lib/types';

/**
 * JumpToEarnings - Floating navigation hint for quiet periods
 * 
 * 2026 Trend: "Intelligent Navigation" + "Proactive UX"
 * 
 * When users are browsing weeks with no earnings (common in mock data
 * or during earnings off-season), this component:
 * - Detects the quiet period automatically
 * - Shows a subtle floating pill at the bottom
 * - Offers quick navigation to the nearest busy week
 * - Provides context about where the action is
 * 
 * Inspiration:
 * - Google Maps "No results in this area" with suggestions
 * - Spotify "Nothing playing" with smart recommendations
 * - Linear's contextual navigation hints
 * - Financial calendars with "Jump to earnings season" CTAs
 * 
 * Features:
 * - Animated entrance with spring physics
 * - Bi-directional: finds nearest busy week (past or future)
 * - Shows preview of what's there (e.g., "5 reports including NVDA")
 * - Magnetic hover effect
 * - Respects prefers-reduced-motion
 * - Light/dark mode aware
 * - Auto-hides after navigation
 */

interface JumpToEarningsProps {
  /** Currently visible weeks (array of week start dates) */
  visibleWeeks: Date[];
  /** All earnings data */
  allEarnings: Earning[];
  /** Callback when user clicks to navigate */
  onJumpToWeek: (weekStart: Date) => void;
  /** Custom className */
  className?: string;
}

interface NearestWeek {
  weekStart: Date;
  earnings: Earning[];
  direction: 'past' | 'future';
  weeksAway: number;
  highlights: string[]; // Top tickers
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 4);
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const startMonth = months[weekStart.getMonth()];
  const endMonth = months[weekEnd.getMonth()];
  
  if (startMonth === endMonth) {
    return `${startMonth} ${weekStart.getDate()}–${weekEnd.getDate()}`;
  }
  return `${startMonth} ${weekStart.getDate()} – ${endMonth} ${weekEnd.getDate()}`;
}

function getEarningsForWeek(weekStart: Date, earnings: Earning[]): Earning[] {
  const start = new Date(weekStart);
  start.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(start);
  weekEnd.setDate(weekEnd.getDate() + 4);
  weekEnd.setHours(23, 59, 59, 999);
  
  return earnings.filter(e => {
    const earningDate = new Date(e.date);
    earningDate.setHours(0, 0, 0, 0);
    return earningDate >= start && earningDate <= weekEnd;
  });
}

function findNearestBusyWeek(
  visibleWeeks: Date[],
  earnings: Earning[]
): NearestWeek | null {
  if (visibleWeeks.length === 0 || earnings.length === 0) return null;
  
  // Get the center of visible weeks
  const centerWeek = visibleWeeks[Math.floor(visibleWeeks.length / 2)];
  const centerTime = centerWeek.getTime();
  
  // Collect all weeks with earnings
  const weeksWithEarnings = new Map<number, Earning[]>();
  
  earnings.forEach(e => {
    const weekStart = getWeekStart(new Date(e.date));
    const weekKey = weekStart.getTime();
    if (!weeksWithEarnings.has(weekKey)) {
      weeksWithEarnings.set(weekKey, []);
    }
    weeksWithEarnings.get(weekKey)!.push(e);
  });
  
  // Filter out visible weeks
  const visibleWeekTimes = new Set(visibleWeeks.map(w => getWeekStart(w).getTime()));
  
  // Find nearest week with earnings that's not visible
  let nearest: NearestWeek | null = null;
  let minDistance = Infinity;
  
  weeksWithEarnings.forEach((weekEarnings, weekTime) => {
    if (visibleWeekTimes.has(weekTime)) return;
    
    const distance = Math.abs(weekTime - centerTime);
    if (distance < minDistance) {
      minDistance = distance;
      const weekStart = new Date(weekTime);
      const weeksAway = Math.round((weekTime - centerTime) / (7 * 24 * 60 * 60 * 1000));
      
      // Get top tickers (by name recognition / market cap proxy)
      const topTickers = weekEarnings
        .slice(0, 3)
        .map(e => e.ticker);
      
      nearest = {
        weekStart,
        earnings: weekEarnings,
        direction: weeksAway < 0 ? 'past' : 'future',
        weeksAway: Math.abs(weeksAway),
        highlights: topTickers,
      };
    }
  });
  
  return nearest;
}

export function JumpToEarnings({
  visibleWeeks,
  allEarnings,
  onJumpToWeek,
  className = '',
}: JumpToEarningsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  // Check if visible weeks have any earnings
  const visibleWeeksHaveEarnings = useMemo(() => {
    return visibleWeeks.some(weekStart => {
      const weekEarnings = getEarningsForWeek(getWeekStart(weekStart), allEarnings);
      return weekEarnings.length > 0;
    });
  }, [visibleWeeks, allEarnings]);
  
  // Find nearest week with earnings
  const nearestWeek = useMemo(() => {
    if (visibleWeeksHaveEarnings) return null;
    return findNearestBusyWeek(visibleWeeks, allEarnings);
  }, [visibleWeeks, allEarnings, visibleWeeksHaveEarnings]);
  
  // Show/hide animation
  useEffect(() => {
    if (nearestWeek && !isDismissed) {
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [nearestWeek, isDismissed]);
  
  // Reset dismissed state when visible weeks change
  useEffect(() => {
    setIsDismissed(false);
  }, [visibleWeeks.map(w => w.getTime()).join(',')]);
  
  // Handle click
  const handleClick = () => {
    if (nearestWeek) {
      onJumpToWeek(nearestWeek.weekStart);
      setIsVisible(false);
      setIsDismissed(true);
    }
  };
  
  // Handle dismiss
  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    setIsVisible(false);
  };
  
  if (!nearestWeek || isDismissed) return null;
  
  const directionIcon = nearestWeek.direction === 'past' ? '←' : '→';
  const directionLabel = nearestWeek.direction === 'past' ? 'Earlier' : 'Later';
  
  return (
    <div 
      className={`jump-to-earnings-container ${isVisible ? 'visible' : ''} ${className}`}
      data-reduced-motion={prefersReducedMotion}
    >
      <button
        ref={buttonRef}
        className={`jump-to-earnings-button ${isHovered ? 'hovered' : ''}`}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={`Jump to ${formatWeekRange(nearestWeek.weekStart)} with ${nearestWeek.earnings.length} earnings reports`}
      >
        {/* Glow effect */}
        <span className="jump-glow" aria-hidden="true" />
        
        {/* Direction indicator */}
        <span className="jump-direction" data-direction={nearestWeek.direction}>
          <span className="jump-arrow">{directionIcon}</span>
        </span>
        
        {/* Content */}
        <span className="jump-content">
          <span className="jump-label">
            Jump to earnings
          </span>
          <span className="jump-details">
            <span className="jump-week">{formatWeekRange(nearestWeek.weekStart)}</span>
            <span className="jump-separator">·</span>
            <span className="jump-count">{nearestWeek.earnings.length} reports</span>
            {nearestWeek.highlights.length > 0 && (
              <>
                <span className="jump-separator">·</span>
                <span className="jump-tickers">{nearestWeek.highlights.join(', ')}</span>
              </>
            )}
          </span>
        </span>
        
        {/* Dismiss button */}
        <button
          className="jump-dismiss"
          onClick={handleDismiss}
          aria-label="Dismiss"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </button>
      
      {/* Magnetic field effect on hover */}
      {isHovered && !prefersReducedMotion && (
        <div className="jump-magnetic-field" aria-hidden="true" />
      )}
      
      <style jsx>{`
        .jump-to-earnings-container {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%) translateY(100px);
          z-index: 100;
          opacity: 0;
          transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), 
                      opacity 0.4s ease-out;
          pointer-events: none;
        }
        
        .jump-to-earnings-container.visible {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
          pointer-events: auto;
        }
        
        .jump-to-earnings-container[data-reduced-motion="true"] {
          transition: opacity 0.3s ease;
        }
        
        .jump-to-earnings-container[data-reduced-motion="true"].visible {
          transform: translateX(-50%) translateY(0);
        }
        
        .jump-to-earnings-button {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px 12px 14px;
          background: linear-gradient(135deg, 
            rgba(59, 130, 246, 0.15) 0%, 
            rgba(139, 92, 246, 0.1) 100%);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 16px;
          color: white;
          cursor: pointer;
          font-size: 14px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 
            0 4px 24px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.05) inset,
            0 1px 0 rgba(255, 255, 255, 0.1) inset;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          white-space: nowrap;
        }
        
        .jump-to-earnings-button:hover {
          transform: translateY(-2px) scale(1.02);
          border-color: rgba(59, 130, 246, 0.5);
          box-shadow: 
            0 8px 32px rgba(59, 130, 246, 0.25),
            0 0 0 1px rgba(255, 255, 255, 0.1) inset,
            0 1px 0 rgba(255, 255, 255, 0.15) inset;
        }
        
        .jump-to-earnings-button:active {
          transform: translateY(0) scale(0.98);
        }
        
        .jump-glow {
          position: absolute;
          inset: -1px;
          border-radius: 16px;
          background: linear-gradient(135deg, 
            rgba(59, 130, 246, 0.4) 0%, 
            rgba(139, 92, 246, 0.3) 100%);
          filter: blur(12px);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        
        .jump-to-earnings-button:hover .jump-glow {
          opacity: 1;
        }
        
        .jump-direction {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: rgba(59, 130, 246, 0.2);
          color: rgb(147, 197, 253);
          font-size: 16px;
          transition: all 0.3s ease;
        }
        
        .jump-direction[data-direction="past"] {
          background: rgba(168, 85, 247, 0.2);
          color: rgb(196, 181, 253);
        }
        
        .jump-arrow {
          display: block;
          transition: transform 0.3s ease;
        }
        
        .jump-to-earnings-button:hover .jump-arrow {
          animation: jump-arrow-bounce 0.6s ease infinite;
        }
        
        @keyframes jump-arrow-bounce {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(3px); }
        }
        
        .jump-direction[data-direction="past"] .jump-to-earnings-button:hover .jump-arrow {
          animation: jump-arrow-bounce-left 0.6s ease infinite;
        }
        
        @keyframes jump-arrow-bounce-left {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-3px); }
        }
        
        .jump-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .jump-label {
          font-weight: 600;
          color: white;
          font-size: 13px;
        }
        
        .jump-details {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }
        
        .jump-week {
          color: rgba(147, 197, 253, 0.9);
        }
        
        .jump-separator {
          opacity: 0.4;
        }
        
        .jump-count {
          color: rgba(74, 222, 128, 0.9);
        }
        
        .jump-tickers {
          color: rgba(255, 255, 255, 0.7);
          font-family: ui-monospace, monospace;
          letter-spacing: 0.02em;
        }
        
        .jump-dismiss {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          margin-left: 4px;
          padding: 0;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 6px;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          opacity: 0;
          transition: all 0.2s ease;
        }
        
        .jump-to-earnings-button:hover .jump-dismiss {
          opacity: 1;
        }
        
        .jump-dismiss:hover {
          background: rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.8);
        }
        
        .jump-magnetic-field {
          position: absolute;
          inset: -20px;
          border-radius: 24px;
          background: radial-gradient(
            circle at center,
            rgba(59, 130, 246, 0.1) 0%,
            transparent 70%
          );
          pointer-events: none;
          animation: magnetic-pulse 2s ease-in-out infinite;
        }
        
        @keyframes magnetic-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        
        /* Light mode */
        :global(.light) .jump-to-earnings-button {
          background: linear-gradient(135deg, 
            rgba(59, 130, 246, 0.1) 0%, 
            rgba(139, 92, 246, 0.08) 100%);
          border-color: rgba(59, 130, 246, 0.2);
          color: rgb(30, 41, 59);
          box-shadow: 
            0 4px 16px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.5) inset;
        }
        
        :global(.light) .jump-label {
          color: rgb(30, 41, 59);
        }
        
        :global(.light) .jump-details {
          color: rgba(30, 41, 59, 0.6);
        }
        
        :global(.light) .jump-week {
          color: rgb(37, 99, 235);
        }
        
        :global(.light) .jump-count {
          color: rgb(22, 163, 74);
        }
        
        :global(.light) .jump-tickers {
          color: rgba(30, 41, 59, 0.7);
        }
        
        :global(.light) .jump-direction {
          background: rgba(59, 130, 246, 0.15);
          color: rgb(37, 99, 235);
        }
        
        :global(.light) .jump-direction[data-direction="past"] {
          background: rgba(168, 85, 247, 0.15);
          color: rgb(126, 34, 206);
        }
        
        :global(.light) .jump-dismiss {
          background: rgba(0, 0, 0, 0.05);
          color: rgba(0, 0, 0, 0.4);
        }
        
        :global(.light) .jump-dismiss:hover {
          background: rgba(0, 0, 0, 0.1);
          color: rgba(0, 0, 0, 0.6);
        }
        
        /* Mobile responsive */
        @media (max-width: 640px) {
          .jump-to-earnings-container {
            bottom: 80px; /* Account for mobile nav */
            left: 16px;
            right: 16px;
            transform: translateX(0) translateY(100px);
          }
          
          .jump-to-earnings-container.visible {
            transform: translateX(0) translateY(0);
          }
          
          .jump-to-earnings-button {
            width: 100%;
            padding: 14px 16px;
          }
          
          .jump-tickers {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
