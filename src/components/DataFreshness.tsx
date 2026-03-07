'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * DataFreshnessIndicator
 * 
 * Premium indicator showing when data was last refreshed.
 * Features:
 * - Animated pulsing dot with intensity based on freshness (faster pulse = more fresh)
 * - Relative time display that updates live ("Just now", "2m ago", etc.)
 * - Refresh button with spinning animation
 * - Gradient ring that fills based on staleness
 * - Color transitions: green (fresh) → amber (aging) → red (stale)
 * - Full light/dark mode support
 * - Respects prefers-reduced-motion
 * 
 * Common pattern in Bloomberg Terminal, TradingView, and premium finance dashboards
 * where data recency is critical information for traders.
 */

interface DataFreshnessIndicatorProps {
  /** Timestamp of last data refresh */
  lastUpdated?: Date;
  /** Optional callback for manual refresh */
  onRefresh?: () => void;
  /** Time in seconds before data is considered "stale" (red) */
  staleThreshold?: number;
  /** Time in seconds before data is considered "aging" (amber) */
  agingThreshold?: number;
  /** Whether data is currently being refreshed */
  isRefreshing?: boolean;
  /** Compact mode for smaller displays */
  compact?: boolean;
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  
  if (diffSec < 5) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return date.toLocaleDateString();
}

function getFreshnessLevel(
  date: Date, 
  agingThreshold: number, 
  staleThreshold: number
): 'fresh' | 'aging' | 'stale' {
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < agingThreshold) return 'fresh';
  if (diffSec < staleThreshold) return 'aging';
  return 'stale';
}

export function DataFreshnessIndicator({
  lastUpdated = new Date(),
  onRefresh,
  staleThreshold = 300, // 5 minutes
  agingThreshold = 60,  // 1 minute
  isRefreshing = false,
  compact = false,
}: DataFreshnessIndicatorProps) {
  const [relativeTime, setRelativeTime] = useState(() => getRelativeTime(lastUpdated));
  const [freshnessLevel, setFreshnessLevel] = useState<'fresh' | 'aging' | 'stale'>(() => 
    getFreshnessLevel(lastUpdated, agingThreshold, staleThreshold)
  );
  const [isHovered, setIsHovered] = useState(false);
  const refreshBtnRef = useRef<HTMLButtonElement>(null);

  // Update relative time every second for recent data, less often for older
  useEffect(() => {
    const updateTime = () => {
      setRelativeTime(getRelativeTime(lastUpdated));
      setFreshnessLevel(getFreshnessLevel(lastUpdated, agingThreshold, staleThreshold));
    };
    
    updateTime();
    const interval = setInterval(updateTime, freshnessLevel === 'fresh' ? 1000 : 10000);
    return () => clearInterval(interval);
  }, [lastUpdated, agingThreshold, staleThreshold, freshnessLevel]);

  const handleRefresh = useCallback(() => {
    if (onRefresh && !isRefreshing) {
      onRefresh();
    }
  }, [onRefresh, isRefreshing]);

  // Keyboard support for refresh
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRefresh();
    }
  }, [handleRefresh]);

  // Calculate pulse animation speed based on freshness
  const pulseSpeed = freshnessLevel === 'fresh' ? '1.5s' : freshnessLevel === 'aging' ? '2.5s' : '4s';

  return (
    <div 
      className={`data-freshness ${freshnessLevel} ${compact ? 'compact' : ''} ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ '--pulse-speed': pulseSpeed } as React.CSSProperties}
    >
      {/* Animated pulse indicator */}
      <div className="freshness-indicator">
        <div className="freshness-dot">
          <div className="freshness-dot-core" />
          <div className="freshness-dot-pulse" />
          <div className="freshness-dot-pulse delay" />
        </div>
        
        {/* Staleness ring (shows fill based on age) */}
        <svg className="freshness-ring" viewBox="0 0 24 24">
          <circle 
            className="freshness-ring-track" 
            cx="12" 
            cy="12" 
            r="10" 
            fill="none" 
            strokeWidth="2"
          />
          <circle 
            className="freshness-ring-fill" 
            cx="12" 
            cy="12" 
            r="10" 
            fill="none" 
            strokeWidth="2"
            strokeDasharray="62.83"
            strokeDashoffset={
              freshnessLevel === 'fresh' ? 62.83 : 
              freshnessLevel === 'aging' ? 31.42 : 
              10
            }
          />
        </svg>
      </div>

      {/* Text label */}
      <div className="freshness-text">
        <span className="freshness-label">{compact ? '' : 'Updated '}</span>
        <span className="freshness-time">{relativeTime}</span>
      </div>

      {/* Refresh button */}
      {onRefresh && (
        <button
          ref={refreshBtnRef}
          onClick={handleRefresh}
          onKeyDown={handleKeyDown}
          disabled={isRefreshing}
          className={`freshness-refresh ${isRefreshing ? 'spinning' : ''}`}
          aria-label="Refresh data"
          title="Refresh data"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M21 21v-5h-5" />
          </svg>
        </button>
      )}

      {/* Tooltip on hover showing exact time */}
      <div className="freshness-tooltip">
        Last sync: {lastUpdated.toLocaleTimeString()}
      </div>
    </div>
  );
}

/**
 * Compact inline version for headers/toolbars
 */
export function DataFreshnessInline({ 
  lastUpdated = new Date(),
  showDot = true,
}: { 
  lastUpdated?: Date;
  showDot?: boolean;
}) {
  const [relativeTime, setRelativeTime] = useState(() => getRelativeTime(lastUpdated));
  
  useEffect(() => {
    const interval = setInterval(() => {
      setRelativeTime(getRelativeTime(lastUpdated));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const diffSec = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
  const isFresh = diffSec < 60;

  return (
    <span className={`freshness-inline ${isFresh ? 'fresh' : ''}`}>
      {showDot && <span className="freshness-inline-dot" />}
      <span className="freshness-inline-text">{relativeTime}</span>
    </span>
  );
}

/**
 * Mini pulsing dot for tight spaces
 */
export function FreshnessDot({ 
  isFresh = true,
  size = 8,
}: { 
  isFresh?: boolean;
  size?: number;
}) {
  return (
    <span 
      className={`freshness-mini-dot ${isFresh ? 'fresh' : 'stale'}`}
      style={{ width: size, height: size }}
      aria-label={isFresh ? 'Data is fresh' : 'Data may be stale'}
    >
      <span className="freshness-mini-core" />
      <span className="freshness-mini-pulse" />
    </span>
  );
}
