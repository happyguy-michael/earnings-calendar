'use client';

import { useMemo, useState, useEffect } from 'react';
import { Earning } from '@/lib/types';

interface QuietWeekBannerProps {
  weekStart: Date;
  allEarnings: Earning[];
  onJumpToWeek?: (weekStart: Date) => void;
  className?: string;
}

/**
 * QuietWeekBanner - Helpful context when a week has no earnings
 * 
 * Instead of showing empty "No reports" for every day, this banner:
 * - Acknowledges the quiet week with friendly copy
 * - Shows when the next busy week is
 * - Provides a quick jump action to navigate
 * 
 * Inspiration:
 * - Notion's empty states with helpful actions
 * - Linear's contextual suggestions
 * - Dribbble 2026 dashboard UX patterns
 * 
 * Features:
 * - Animated entrance with blur reveal
 * - Subtle floating animation
 * - Next earnings preview
 * - One-click navigation
 * - Light/dark mode aware
 * - Respects reduced motion
 */

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
  
  const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
  
  if (startMonth === endMonth) {
    return `${startMonth} ${weekStart.getDate()}–${weekEnd.getDate()}`;
  }
  return `${startMonth} ${weekStart.getDate()} – ${endMonth} ${weekEnd.getDate()}`;
}

export function QuietWeekBanner({
  weekStart,
  allEarnings,
  onJumpToWeek,
  className = '',
}: QuietWeekBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    return () => {
      mediaQuery.removeEventListener('change', handler);
      clearTimeout(timer);
    };
  }, []);

  // Find the next week with earnings
  const nextBusyWeek = useMemo(() => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    // Find earnings after this week
    const futureEarnings = allEarnings
      .filter(e => new Date(e.date) >= weekEnd)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (futureEarnings.length === 0) return null;
    
    const nextEarningDate = new Date(futureEarnings[0].date);
    const nextWeekStart = getWeekStart(nextEarningDate);
    
    // Count earnings in that week
    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);
    
    const earningsInWeek = allEarnings.filter(e => {
      const date = new Date(e.date);
      return date >= nextWeekStart && date < nextWeekEnd;
    });
    
    return {
      weekStart: nextWeekStart,
      count: earningsInWeek.length,
      dateRange: formatWeekRange(nextWeekStart),
      daysUntil: Math.ceil((nextWeekStart.getTime() - weekEnd.getTime()) / (1000 * 60 * 60 * 24)) + 7,
    };
  }, [weekStart, allEarnings]);

  // Find previous week with earnings (for bi-directional navigation)
  const prevBusyWeek = useMemo(() => {
    // Find earnings before this week
    const pastEarnings = allEarnings
      .filter(e => new Date(e.date) < weekStart)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (pastEarnings.length === 0) return null;
    
    const prevEarningDate = new Date(pastEarnings[0].date);
    const prevWeekStart = getWeekStart(prevEarningDate);
    
    // Count earnings in that week
    const prevWeekEnd = new Date(prevWeekStart);
    prevWeekEnd.setDate(prevWeekEnd.getDate() + 7);
    
    const earningsInWeek = allEarnings.filter(e => {
      const date = new Date(e.date);
      return date >= prevWeekStart && date < prevWeekEnd;
    });
    
    return {
      weekStart: prevWeekStart,
      count: earningsInWeek.length,
      dateRange: formatWeekRange(prevWeekStart),
    };
  }, [weekStart, allEarnings]);

  const handleJumpToNext = () => {
    if (nextBusyWeek && onJumpToWeek) {
      onJumpToWeek(nextBusyWeek.weekStart);
    }
  };

  const handleJumpToPrev = () => {
    if (prevBusyWeek && onJumpToWeek) {
      onJumpToWeek(prevBusyWeek.weekStart);
    }
  };

  return (
    <div 
      className={`quiet-week-banner ${isVisible ? 'visible' : ''} ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="quiet-week-content">
        {/* Icon */}
        <div className="quiet-week-icon" aria-hidden="true">
          <svg 
            width="48" 
            height="48" 
            viewBox="0 0 48 48" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Calendar base */}
            <rect 
              x="6" y="10" 
              width="36" height="32" 
              rx="4" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeOpacity="0.4"
            />
            {/* Calendar header */}
            <path 
              d="M6 18H42" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeOpacity="0.4"
            />
            {/* Calendar hooks */}
            <path d="M16 6V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />
            <path d="M32 6V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />
            {/* Peaceful zzz */}
            <text 
              x="24" y="32" 
              textAnchor="middle" 
              fontSize="14" 
              fill="currentColor" 
              opacity="0.5"
              fontWeight="600"
              className="quiet-week-zzz"
            >
              zzz
            </text>
          </svg>
        </div>
        
        {/* Message */}
        <div className="quiet-week-message">
          <h3 className="quiet-week-title">Quiet Week</h3>
          <p className="quiet-week-subtitle">
            No earnings reports scheduled for this period.
            {nextBusyWeek && (
              <> Next earnings season activity is <strong>{nextBusyWeek.dateRange}</strong>.</>
            )}
          </p>
        </div>
        
        {/* Navigation buttons */}
        <div className="quiet-week-actions">
          {prevBusyWeek && (
            <button 
              className="quiet-week-btn quiet-week-btn-secondary"
              onClick={handleJumpToPrev}
              aria-label={`Jump to previous busy week: ${prevBusyWeek.dateRange}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              <span>{prevBusyWeek.dateRange}</span>
              <span className="quiet-week-badge">{prevBusyWeek.count}</span>
            </button>
          )}
          
          {nextBusyWeek && (
            <button 
              className="quiet-week-btn quiet-week-btn-primary"
              onClick={handleJumpToNext}
              aria-label={`Jump to next busy week: ${nextBusyWeek.dateRange} with ${nextBusyWeek.count} earnings`}
            >
              <span>{nextBusyWeek.dateRange}</span>
              <span className="quiet-week-badge">{nextBusyWeek.count}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Decorative background elements */}
      <div className="quiet-week-bg" aria-hidden="true">
        <div className="quiet-week-glow" />
        <div className="quiet-week-dots">
          {[...Array(6)].map((_, i) => (
            <span 
              key={i} 
              className="quiet-week-dot"
              style={{ 
                '--dot-delay': `${i * 0.3}s`,
                '--dot-x': `${20 + (i % 3) * 30}%`,
                '--dot-y': `${30 + Math.floor(i / 3) * 40}%`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      </div>
      
      <style jsx>{`
        .quiet-week-banner {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          border-radius: 20px;
          background: var(--glass-bg);
          border: 1px solid var(--border-secondary);
          overflow: hidden;
          opacity: 0;
          transform: translateY(10px) scale(0.98);
          transition: ${prefersReducedMotion ? 'opacity 0.2s ease' : 'opacity 0.5s ease, transform 0.5s var(--spring-smooth)'};
        }
        
        .quiet-week-banner.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        
        .quiet-week-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          text-align: center;
          max-width: 400px;
        }
        
        .quiet-week-icon {
          color: var(--text-muted);
          animation: ${prefersReducedMotion ? 'none' : 'quietWeekFloat 4s ease-in-out infinite'};
        }
        
        .quiet-week-zzz {
          animation: ${prefersReducedMotion ? 'none' : 'quietWeekZzz 2s ease-in-out infinite'};
        }
        
        @keyframes quietWeekFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        
        @keyframes quietWeekZzz {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        
        .quiet-week-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .quiet-week-subtitle {
          margin: 0;
          font-size: 14px;
          color: var(--text-muted);
          line-height: 1.5;
        }
        
        .quiet-week-subtitle strong {
          color: var(--text-secondary);
          font-weight: 500;
        }
        
        .quiet-week-actions {
          display: flex;
          gap: 12px;
          margin-top: 8px;
          flex-wrap: wrap;
          justify-content: center;
        }
        
        .quiet-week-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }
        
        .quiet-week-btn-primary {
          background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
          color: white;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.25);
        }
        
        .quiet-week-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
        }
        
        .quiet-week-btn-secondary {
          background: var(--bg-hover);
          color: var(--text-secondary);
          border: 1px solid var(--border-primary);
        }
        
        .quiet-week-btn-secondary:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }
        
        .quiet-week-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 600;
        }
        
        .quiet-week-btn-primary .quiet-week-badge {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .quiet-week-btn-secondary .quiet-week-badge {
          background: var(--accent-blue);
          color: white;
        }
        
        /* Background decorations */
        .quiet-week-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        
        .quiet-week-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 300px;
          height: 300px;
          transform: translate(-50%, -50%);
          background: radial-gradient(
            circle,
            rgba(59, 130, 246, 0.08) 0%,
            transparent 70%
          );
          animation: ${prefersReducedMotion ? 'none' : 'quietWeekGlowPulse 6s ease-in-out infinite'};
        }
        
        @keyframes quietWeekGlowPulse {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
        }
        
        .quiet-week-dots {
          position: absolute;
          inset: 0;
        }
        
        .quiet-week-dot {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--accent-blue);
          opacity: 0.2;
          left: var(--dot-x);
          top: var(--dot-y);
          animation: ${prefersReducedMotion ? 'none' : 'quietWeekDotFade 3s ease-in-out infinite'};
          animation-delay: var(--dot-delay);
        }
        
        @keyframes quietWeekDotFade {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.5); }
        }
        
        /* Light mode */
        :global(html.light) .quiet-week-banner {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.95) 100%);
        }
        
        :global(html.light) .quiet-week-glow {
          background: radial-gradient(
            circle,
            rgba(59, 130, 246, 0.06) 0%,
            transparent 70%
          );
        }
        
        /* Mobile */
        @media (max-width: 640px) {
          .quiet-week-banner {
            padding: 32px 20px;
          }
          
          .quiet-week-icon svg {
            width: 40px;
            height: 40px;
          }
          
          .quiet-week-title {
            font-size: 16px;
          }
          
          .quiet-week-subtitle {
            font-size: 13px;
          }
          
          .quiet-week-btn {
            padding: 8px 14px;
            font-size: 12px;
          }
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .quiet-week-icon,
          .quiet-week-zzz,
          .quiet-week-glow,
          .quiet-week-dot {
            animation: none !important;
          }
          
          .quiet-week-banner {
            transition: opacity 0.2s ease !important;
            transform: none !important;
          }
          
          .quiet-week-banner.visible {
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default QuietWeekBanner;
