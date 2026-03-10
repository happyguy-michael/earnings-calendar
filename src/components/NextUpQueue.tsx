'use client';

import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Earning } from '@/lib/types';
import { CompanyLogo } from './ProgressiveImage';
import { OddsGauge } from './OddsGauge';
import { MarketSessionIcon } from './MarketSessionIcon';
import { FlipCountdownBadge } from './FlipDigit';
import { AnimatedGradientBorder } from './AnimatedGradientBorder';
import { useHaptic } from './HapticFeedback';

interface NextUpQueueProps {
  earnings: Earning[];
  maxItems?: number;
  className?: string;
}

/**
 * NextUpQueue - Horizontal scrollable queue of next upcoming earnings
 * 
 * Design principle: "Focus on the User's Primary Goal"
 * What's happening next is the most important information for active traders.
 * 
 * Features:
 * - Horizontal scroll with drag support
 * - Countdown timers for each upcoming report
 * - Beat odds gauges (when available)
 * - Session indicators (pre-market/after-hours)
 * - Smooth staggered entrance animations
 * - Card glow effect for imminent reports (<1 hour)
 * - Respects prefers-reduced-motion
 */
export function NextUpQueue({ earnings, maxItems = 5, className = '' }: NextUpQueueProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { trigger: haptic } = useHaptic();

  // Get upcoming pending earnings sorted by date/time
  const upcomingEarnings = useMemo(() => {
    const now = new Date();
    
    // Filter to pending earnings only (no eps yet)
    const pending = earnings.filter(e => e.eps === undefined || e.eps === null);
    
    // Sort by date, then by time (pre before post)
    return pending
      .map(e => {
        // Calculate target datetime
        const date = new Date(e.date);
        if (e.time === 'pre') {
          date.setHours(9, 30, 0, 0); // Pre-market ~9:30 AM ET
        } else {
          date.setHours(16, 0, 0, 0); // After hours ~4:00 PM ET
        }
        return { ...e, targetDate: date };
      })
      .filter(e => e.targetDate > now) // Only future
      .sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime())
      .slice(0, maxItems);
  }, [earnings, maxItems]);

  // Staggered entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Update scroll fade indicators
  const updateScrollFades = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftFade(scrollLeft > 10);
    setShowRightFade(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    
    updateScrollFades();
    el.addEventListener('scroll', updateScrollFades, { passive: true });
    window.addEventListener('resize', updateScrollFades);
    
    return () => {
      el.removeEventListener('scroll', updateScrollFades);
      window.removeEventListener('resize', updateScrollFades);
    };
  }, [updateScrollFades, upcomingEarnings]);

  // Drag to scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current.offsetLeft || 0);
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Check if an earning is imminent (< 1 hour)
  const isImminent = (targetDate: Date) => {
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();
    return diff > 0 && diff < 60 * 60 * 1000; // < 1 hour
  };

  // Don't render if no upcoming earnings
  if (upcomingEarnings.length === 0) {
    return null;
  }

  return (
    <div className={`next-up-queue ${isVisible ? 'visible' : ''} ${className}`}>
      <div className="next-up-header">
        <div className="next-up-title">
          <span className="next-up-icon" aria-hidden="true">⏳</span>
          <span>Next Up</span>
          <span className="next-up-count">{upcomingEarnings.length}</span>
        </div>
        <span className="next-up-hint">Scroll for more →</span>
      </div>
      
      <div className="next-up-scroll-container">
        {/* Left fade overlay */}
        <div className={`next-up-fade left ${showLeftFade ? 'visible' : ''}`} />
        
        {/* Scrollable container */}
        <div
          ref={scrollRef}
          className={`next-up-scroll ${isDragging ? 'dragging' : ''}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {upcomingEarnings.map((earning, index) => {
            const imminent = isImminent(earning.targetDate);
            
            const cardContent = (
              <Link
                href={`/report/${earning.ticker}`}
                className={`next-up-card ${imminent ? 'imminent' : ''}`}
                style={{ '--card-index': index } as React.CSSProperties}
                onClick={() => haptic('light')}
              >
                <div className="next-up-card-top">
                  <CompanyLogo
                    ticker={earning.ticker}
                    company={earning.company}
                    size={36}
                    className="next-up-logo"
                  />
                  <div className="next-up-info">
                    <div className="next-up-ticker">{earning.ticker}</div>
                    <div className="next-up-company">{earning.company}</div>
                  </div>
                </div>
                
                <div className="next-up-card-bottom">
                  <div className="next-up-session">
                    <MarketSessionIcon session={earning.time} size={14} />
                    <span>{earning.time === 'pre' ? 'Pre-market' : 'After hours'}</span>
                  </div>
                  
                  <div className="next-up-countdown">
                    <FlipCountdownBadge 
                      targetDate={earning.targetDate} 
                      time={earning.time}
                    />
                  </div>
                </div>
                
                {earning.beatOdds && (
                  <div className="next-up-odds">
                    <OddsGauge 
                      value={earning.beatOdds} 
                      size={38} 
                      delay={index * 100 + 200}
                      duration={600}
                    />
                  </div>
                )}
                
                {/* Shimmer sweep effect */}
                <span className="next-up-shimmer" aria-hidden="true" />
              </Link>
            );

            // Wrap imminent cards with animated border
            if (imminent) {
              return (
                <AnimatedGradientBorder
                  key={earning.ticker}
                  colorPreset="fire"
                  borderWidth={2}
                  borderRadius={16}
                  duration={3}
                  glowIntensity={0.3}
                  backgroundColor="transparent"
                  hoverOnly={false}
                  className="next-up-border-wrapper"
                >
                  {cardContent}
                </AnimatedGradientBorder>
              );
            }

            return (
              <div key={earning.ticker} className="next-up-card-wrapper">
                {cardContent}
              </div>
            );
          })}
        </div>
        
        {/* Right fade overlay */}
        <div className={`next-up-fade right ${showRightFade ? 'visible' : ''}`} />
      </div>
      
      <style jsx>{`
        .next-up-queue {
          margin-bottom: 1.5rem;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.4s ease, transform 0.4s ease;
        }
        
        .next-up-queue.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .next-up-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
          padding: 0 0.25rem;
        }
        
        .next-up-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary, #fff);
          letter-spacing: 0.02em;
        }
        
        .next-up-icon {
          font-size: 1rem;
        }
        
        .next-up-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 1.25rem;
          height: 1.25rem;
          padding: 0 0.375rem;
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-secondary, #a1a1aa);
          background: var(--surface-elevated, rgba(255, 255, 255, 0.05));
          border-radius: 999px;
        }
        
        .next-up-hint {
          font-size: 0.7rem;
          color: var(--text-tertiary, #71717a);
          opacity: 0.7;
        }
        
        .next-up-scroll-container {
          position: relative;
        }
        
        .next-up-fade {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 3rem;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 10;
        }
        
        .next-up-fade.visible {
          opacity: 1;
        }
        
        .next-up-fade.left {
          left: 0;
          background: linear-gradient(to right, var(--bg-primary, #0a0a0a), transparent);
        }
        
        .next-up-fade.right {
          right: 0;
          background: linear-gradient(to left, var(--bg-primary, #0a0a0a), transparent);
        }
        
        .next-up-scroll {
          display: flex;
          gap: 0.75rem;
          overflow-x: auto;
          overflow-y: hidden;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          padding: 0.5rem 0.25rem 0.75rem;
          margin: -0.5rem -0.25rem;
          cursor: grab;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .next-up-scroll::-webkit-scrollbar {
          display: none;
        }
        
        .next-up-scroll.dragging {
          cursor: grabbing;
          scroll-behavior: auto;
        }
        
        .next-up-card-wrapper,
        .next-up-border-wrapper {
          flex-shrink: 0;
          scroll-snap-align: start;
        }
        
        .next-up-card {
          position: relative;
          display: flex;
          flex-direction: column;
          width: 180px;
          padding: 0.875rem;
          background: var(--surface-card, rgba(255, 255, 255, 0.03));
          border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
          border-radius: 16px;
          text-decoration: none;
          overflow: hidden;
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
          animation: next-up-card-enter 0.5s ease both;
          animation-delay: calc(var(--card-index, 0) * 80ms + 150ms);
        }
        
        @keyframes next-up-card-enter {
          from {
            opacity: 0;
            transform: translateX(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        
        .next-up-card:hover {
          transform: translateY(-2px);
          border-color: var(--border-hover, rgba(255, 255, 255, 0.15));
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }
        
        .next-up-card.imminent {
          background: linear-gradient(
            135deg,
            rgba(251, 191, 36, 0.08),
            rgba(251, 191, 36, 0.02)
          );
        }
        
        .next-up-card-top {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          margin-bottom: 0.75rem;
        }
        
        .next-up-logo {
          flex-shrink: 0;
        }
        
        .next-up-info {
          min-width: 0;
          flex: 1;
        }
        
        .next-up-ticker {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-primary, #fff);
          letter-spacing: 0.02em;
        }
        
        .next-up-company {
          font-size: 0.7rem;
          color: var(--text-tertiary, #71717a);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .next-up-card-bottom {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .next-up-session {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.65rem;
          color: var(--text-secondary, #a1a1aa);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        
        .next-up-countdown {
          transform: scale(0.9);
          transform-origin: left center;
        }
        
        .next-up-odds {
          position: absolute;
          top: 0.625rem;
          right: 0.625rem;
        }
        
        .next-up-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            110deg,
            transparent 25%,
            rgba(255, 255, 255, 0.03) 50%,
            transparent 75%
          );
          transform: translateX(-100%);
          pointer-events: none;
        }
        
        .next-up-card:hover .next-up-shimmer {
          animation: next-up-shimmer 0.6s ease;
        }
        
        @keyframes next-up-shimmer {
          to {
            transform: translateX(100%);
          }
        }
        
        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .next-up-queue {
            transition: opacity 0.2s ease;
            transform: none;
          }
          
          .next-up-card {
            animation: none;
            opacity: 1;
          }
          
          .next-up-scroll {
            scroll-behavior: auto;
          }
          
          .next-up-card:hover .next-up-shimmer {
            animation: none;
          }
        }
        
        /* Mobile adjustments */
        @media (max-width: 640px) {
          .next-up-hint {
            display: none;
          }
          
          .next-up-card {
            width: 160px;
            padding: 0.75rem;
          }
          
          .next-up-ticker {
            font-size: 0.8rem;
          }
          
          .next-up-odds {
            transform: scale(0.85);
            top: 0.5rem;
            right: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}

export default NextUpQueue;
