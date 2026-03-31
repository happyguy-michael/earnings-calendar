'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { CompanyLogo } from './ProgressiveImage';

interface BigMover {
  ticker: string;
  company: string;
  surprise: number;
  result: 'beat' | 'miss';
  eps?: number;
  estimate?: number;
}

interface BigMoversBannerProps {
  movers: BigMover[];
  /** Minimum surprise % to qualify as "big" (default: 10) */
  threshold?: number;
  /** Maximum movers to show (default: 6) */
  maxItems?: number;
  /** Auto-scroll interval in ms (0 to disable, default: 4000) */
  autoScrollInterval?: number;
  /** Show banner even with 1 mover (default: true) */
  showSingle?: boolean;
}

export function BigMoversBanner({
  movers,
  threshold = 10,
  maxItems = 6,
  autoScrollInterval = 4000,
  showSingle = true,
}: BigMoversBannerProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Filter and sort movers by absolute surprise
  const bigMovers = useMemo(() => {
    return movers
      .filter(m => Math.abs(m.surprise) >= threshold)
      .sort((a, b) => Math.abs(b.surprise) - Math.abs(a.surprise))
      .slice(0, maxItems);
  }, [movers, threshold, maxItems]);

  // Don't render if no big movers (or just 1 and showSingle is false)
  if (bigMovers.length === 0 || (!showSingle && bigMovers.length === 1)) {
    return null;
  }

  // Auto-scroll effect
  useEffect(() => {
    if (isPaused || bigMovers.length <= 1 || autoScrollInterval === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % bigMovers.length);
    }, autoScrollInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, bigMovers.length, autoScrollInterval]);

  // Scroll to active item
  useEffect(() => {
    if (scrollRef.current && bigMovers.length > 1) {
      const container = scrollRef.current;
      const items = container.querySelectorAll('.big-mover-item');
      const activeItem = items[activeIndex] as HTMLElement;
      
      if (activeItem) {
        const containerRect = container.getBoundingClientRect();
        const itemRect = activeItem.getBoundingClientRect();
        const scrollLeft = activeItem.offsetLeft - (containerRect.width / 2) + (itemRect.width / 2);
        
        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth',
        });
      }
    }
  }, [activeIndex, bigMovers.length]);

  const handleMoverClick = (index: number) => {
    setActiveIndex(index);
    setIsPaused(true);
    // Resume auto-scroll after 8 seconds of inactivity
    setTimeout(() => setIsPaused(false), 8000);
  };

  return (
    <div 
      className="big-movers-banner"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header */}
      <div className="big-movers-header">
        <div className="big-movers-title">
          <span className="big-movers-icon">🔥</span>
          <span className="big-movers-label">Big Movers</span>
          <span className="big-movers-count">{bigMovers.length}</span>
        </div>
        
        {/* Dot indicators for navigation */}
        {bigMovers.length > 1 && (
          <div className="big-movers-dots">
            {bigMovers.map((_, idx) => (
              <button
                key={idx}
                className={`big-movers-dot ${idx === activeIndex ? 'active' : ''}`}
                onClick={() => handleMoverClick(idx)}
                aria-label={`Go to mover ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Scrollable movers strip */}
      <div className="big-movers-scroll" ref={scrollRef}>
        <div className="big-movers-track">
          {bigMovers.map((mover, idx) => (
            <Link
              key={mover.ticker}
              href={`/report/${mover.ticker}`}
              className={`big-mover-item ${mover.result} ${idx === activeIndex ? 'active' : ''}`}
              onClick={() => handleMoverClick(idx)}
            >
              {/* Glow effect for active item */}
              <div className="big-mover-glow" aria-hidden="true" />
              
              {/* Company logo */}
              <CompanyLogo
                ticker={mover.ticker}
                company={mover.company}
                size={36}
                className="big-mover-logo"
              />
              
              {/* Ticker and surprise */}
              <div className="big-mover-info">
                <span className="big-mover-ticker">{mover.ticker}</span>
                <span className={`big-mover-surprise ${mover.result}`}>
                  {mover.result === 'beat' ? '▲' : '▼'}
                  {mover.surprise > 0 ? '+' : ''}{mover.surprise.toFixed(1)}%
                </span>
              </div>

              {/* Result badge */}
              <span className={`big-mover-badge ${mover.result}`}>
                {mover.result === 'beat' ? 'BEAT' : 'MISS'}
              </span>

              {/* Particle effect for exceptional moves */}
              {Math.abs(mover.surprise) >= 20 && (
                <div className="big-mover-particles" aria-hidden="true">
                  {[...Array(4)].map((_, i) => (
                    <span 
                      key={i} 
                      className={`particle ${mover.result}`}
                      style={{ '--particle-delay': `${i * 0.15}s` } as React.CSSProperties}
                    />
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Gradient fade edges */}
      <div className="big-movers-fade-left" aria-hidden="true" />
      <div className="big-movers-fade-right" aria-hidden="true" />
    </div>
  );
}

// Helper hook to extract big movers from earnings data
export function useBigMovers(
  earnings: Array<{
    ticker: string;
    company: string;
    eps?: number | null;
    estimate?: number | null;
    result?: 'beat' | 'miss' | 'met';
  }>,
  threshold = 10
): BigMover[] {
  return useMemo(() => {
    return earnings
      // Only include beats and misses (not "met" results)
      .filter(e => e.eps != null && (e.result === 'beat' || e.result === 'miss') && e.estimate != null)
      .map(e => {
        const surprise = ((e.eps! - e.estimate!) / Math.abs(e.estimate!)) * 100;
        return {
          ticker: e.ticker,
          company: e.company,
          surprise,
          result: e.result as 'beat' | 'miss',
          eps: e.eps ?? undefined,
          estimate: e.estimate ?? undefined,
        };
      })
      .filter(m => Math.abs(m.surprise) >= threshold);
  }, [earnings, threshold]);
}
