'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Earning } from '@/lib/types';

interface TickerRibbonProps {
  earnings: Earning[];
  speed?: number; // pixels per second
}

/**
 * Animated stock ticker ribbon showing recent earnings results.
 * Premium finance dashboard pattern (Bloomberg, CNBC style).
 * Features: smooth infinite scroll, pause on hover, result indicators,
 * gradient fade edges, responsive speed.
 */
export function TickerRibbon({ earnings, speed = 40 }: TickerRibbonProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [animationDuration, setAnimationDuration] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  
  // Filter to only show reported earnings with results
  const displayItems = useMemo(() => {
    return earnings
      .filter(e => e.eps !== undefined && e.eps !== null && e.result)
      .slice(0, 20) // Limit to most recent 20
      .map(e => {
        const surprise = e.estimate 
          ? ((e.eps! - e.estimate) / Math.abs(e.estimate)) * 100 
          : 0;
        return {
          ...e,
          surprise,
          isBeat: e.result === 'beat',
        };
      });
  }, [earnings]);

  // Also include pending earnings for today
  const pendingToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return earnings
      .filter(e => e.date === today && (e.eps === undefined || e.eps === null))
      .slice(0, 5)
      .map(e => ({
        ...e,
        surprise: 0,
        isPending: true,
        isBeat: false,
      }));
  }, [earnings]);

  const allItems = useMemo(() => [...pendingToday, ...displayItems], [pendingToday, displayItems]);

  // Calculate animation duration based on content width
  useEffect(() => {
    if (trackRef.current) {
      const width = trackRef.current.scrollWidth / 2; // Divided by 2 because we duplicate
      setAnimationDuration(width / speed);
    }
  }, [allItems, speed]);

  if (allItems.length === 0) return null;

  return (
    <div 
      className="ticker-ribbon"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="marquee"
      aria-label="Recent earnings results"
    >
      {/* Left fade gradient */}
      <div className="ticker-ribbon-fade ticker-ribbon-fade-left" aria-hidden="true" />
      
      <div 
        ref={trackRef}
        className={`ticker-ribbon-track ${isPaused ? 'paused' : ''}`}
        style={{ 
          animationDuration: animationDuration > 0 ? `${animationDuration}s` : '30s',
        }}
      >
        {/* Duplicate content for seamless loop */}
        {[0, 1].map((setIndex) => (
          <div key={setIndex} className="ticker-ribbon-set">
            {allItems.map((item, index) => (
              <TickerItem key={`${setIndex}-${item.ticker}-${index}`} item={item} />
            ))}
          </div>
        ))}
      </div>
      
      {/* Right fade gradient */}
      <div className="ticker-ribbon-fade ticker-ribbon-fade-right" aria-hidden="true" />
      
      {/* Pause indicator */}
      {isPaused && (
        <div className="ticker-ribbon-paused-indicator">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <rect x="2" y="2" width="3" height="8" rx="0.5" />
            <rect x="7" y="2" width="3" height="8" rx="0.5" />
          </svg>
        </div>
      )}
    </div>
  );
}

interface TickerItemData extends Earning {
  surprise: number;
  isBeat: boolean;
  isPending?: boolean;
}

function TickerItem({ item }: { item: TickerItemData }) {
  const logoUrl = `https://logo.clearbit.com/${item.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
  
  return (
    <Link 
      href={`/report/${item.ticker}`}
      className="ticker-ribbon-item"
      tabIndex={-1} // Prevent tab focus on duplicate items
    >
      <div className="ticker-ribbon-logo">
        <img
          src={logoUrl}
          alt=""
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <span className="hidden">{item.ticker.slice(0, 2)}</span>
      </div>
      
      <span className="ticker-ribbon-ticker">{item.ticker}</span>
      
      {item.isPending ? (
        <span className="ticker-ribbon-pending">
          <span className="ticker-ribbon-pending-dot" />
          {item.beatOdds}% odds
        </span>
      ) : (
        <span className={`ticker-ribbon-result ${item.isBeat ? 'beat' : 'miss'}`}>
          <span className="ticker-ribbon-arrow">
            {item.isBeat ? '▲' : '▼'}
          </span>
          {item.surprise >= 0 ? '+' : ''}{item.surprise.toFixed(1)}%
        </span>
      )}
      
      <span className="ticker-ribbon-separator" aria-hidden="true">•</span>
    </Link>
  );
}

export default TickerRibbon;
