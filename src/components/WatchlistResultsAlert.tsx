'use client';

import { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * WatchlistResultsAlert - Floating notification for new watchlist earnings results
 * 
 * Inspiration:
 * - iOS notification badges (red dot with count)
 * - Slack's unread message indicators
 * - GitHub's notification bell with badge
 * - Trading app "new results" alerts
 * - 2026 "Attention-Aware UI" trend — proactive notifications for what matters
 * 
 * When stocks in the user's watchlist report earnings, this floating badge
 * appears to alert them. It persists until the user acknowledges (clicks)
 * or views the individual stock. Creates urgency for time-sensitive info.
 * 
 * Features:
 * - Monitors watchlist stocks for new results
 * - Animated entrance with scale + bounce
 * - Pulsing glow when new results arrive
 * - Click to expand and see which stocks reported
 * - Dismiss individual or all alerts
 * - Persists "seen" state in localStorage
 * - Respects prefers-reduced-motion
 * - Light/dark mode adaptive
 * - Positioned to not overlap with other UI elements
 */

interface Earning {
  ticker: string;
  company: string;
  date: string;
  eps?: number | null;
  estimate?: number | null;
  result?: 'beat' | 'miss' | 'met' | null;
}

interface WatchlistResultsAlertProps {
  /** All earnings data */
  earnings: Earning[];
  /** User's watchlist tickers */
  watchlist: string[];
  /** Callback when alert is clicked */
  onAlertClick?: (ticker: string) => void;
  /** Callback when all alerts are dismissed */
  onDismissAll?: () => void;
  /** Position on screen */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  /** Z-index for positioning */
  zIndex?: number;
}

const SEEN_STORAGE_KEY = 'earnings-watchlist-seen';

/**
 * Get list of seen watchlist results from localStorage
 */
function getSeenResults(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const stored = localStorage.getItem(SEEN_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return new Set(parsed);
      }
    }
  } catch (e) {
    console.warn('Failed to load seen results:', e);
  }
  return new Set();
}

/**
 * Save seen results to localStorage
 */
function saveSeenResults(seen: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify([...seen]));
  } catch (e) {
    console.warn('Failed to save seen results:', e);
  }
}

/**
 * Generate a unique key for an earnings result
 */
function getResultKey(earning: Earning): string {
  return `${earning.ticker}-${earning.date}-${earning.eps}`;
}

interface UnseenResult {
  key: string;
  ticker: string;
  company: string;
  date: string;
  result: 'beat' | 'miss' | 'met';
  surprise: number;
}

export const WatchlistResultsAlert = memo(function WatchlistResultsAlert({
  earnings,
  watchlist,
  onAlertClick,
  onDismissAll,
  position = 'bottom-right',
  zIndex = 9999,
}: WatchlistResultsAlertProps) {
  const [mounted, setMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [seenResults, setSeenResults] = useState<Set<string>>(new Set());
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Initialize
  useEffect(() => {
    setMounted(true);
    setSeenResults(getSeenResults());
    
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Calculate unseen watchlist results
  const unseenResults = useMemo((): UnseenResult[] => {
    if (!watchlist.length) return [];
    
    const watchlistSet = new Set(watchlist.map(t => t.toUpperCase()));
    
    return earnings
      .filter(e => {
        // Must be in watchlist
        if (!watchlistSet.has(e.ticker.toUpperCase())) return false;
        // Must have a result
        if (!e.result || e.eps === null || e.eps === undefined) return false;
        // Must not be seen yet
        const key = getResultKey(e);
        return !seenResults.has(key);
      })
      .map(e => {
        const surprise = e.estimate 
          ? ((e.eps! - e.estimate) / Math.abs(e.estimate)) * 100 
          : 0;
        return {
          key: getResultKey(e),
          ticker: e.ticker,
          company: e.company,
          date: e.date,
          result: e.result as 'beat' | 'miss' | 'met',
          surprise,
        };
      })
      .sort((a, b) => Math.abs(b.surprise) - Math.abs(a.surprise));
  }, [earnings, watchlist, seenResults]);

  // Animate in when new results appear
  useEffect(() => {
    if (unseenResults.length > 0 && !isAnimatingIn) {
      setIsAnimatingIn(true);
      setTimeout(() => setIsAnimatingIn(false), 600);
    }
  }, [unseenResults.length]);

  // Mark a single result as seen
  const markAsSeen = useCallback((key: string) => {
    setSeenResults(prev => {
      const next = new Set(prev);
      next.add(key);
      saveSeenResults(next);
      return next;
    });
  }, []);

  // Mark all as seen
  const markAllAsSeen = useCallback(() => {
    setSeenResults(prev => {
      const next = new Set(prev);
      unseenResults.forEach(r => next.add(r.key));
      saveSeenResults(next);
      return next;
    });
    setIsExpanded(false);
    onDismissAll?.();
  }, [unseenResults, onDismissAll]);

  // Handle click on individual result
  const handleResultClick = useCallback((result: UnseenResult) => {
    markAsSeen(result.key);
    onAlertClick?.(result.ticker);
    if (unseenResults.length <= 1) {
      setIsExpanded(false);
    }
  }, [markAsSeen, onAlertClick, unseenResults.length]);

  // Position styles
  const positionStyles: Record<string, React.CSSProperties> = {
    'bottom-right': { bottom: 20, right: 20 },
    'bottom-left': { bottom: 20, left: 20 },
    'top-right': { top: 80, right: 20 },
    'top-left': { top: 80, left: 20 },
  };

  if (!mounted || unseenResults.length === 0) return null;

  const badge = (
    <div
      className="watchlist-alert-container"
      style={{
        position: 'fixed',
        ...positionStyles[position],
        zIndex,
      }}
    >
      {/* Collapsed badge */}
      {!isExpanded && (
        <button
          className={`watchlist-alert-badge ${isAnimatingIn ? 'animate-in' : ''}`}
          onClick={() => setIsExpanded(true)}
          aria-label={`${unseenResults.length} new watchlist results`}
        >
          <span className="badge-icon">⭐</span>
          <span className="badge-count">{unseenResults.length}</span>
          <span className="badge-pulse" />
        </button>
      )}

      {/* Expanded panel */}
      {isExpanded && (
        <div className="watchlist-alert-panel">
          <div className="panel-header">
            <span className="panel-title">
              <span className="title-icon">⭐</span>
              Watchlist Results
            </span>
            <button
              className="dismiss-all-btn"
              onClick={markAllAsSeen}
              aria-label="Dismiss all"
            >
              Clear all
            </button>
          </div>
          
          <div className="panel-results">
            {unseenResults.slice(0, 5).map(result => (
              <button
                key={result.key}
                className={`result-item result-${result.result}`}
                onClick={() => handleResultClick(result)}
              >
                <span className="result-ticker">{result.ticker}</span>
                <span className={`result-badge ${result.result}`}>
                  {result.result === 'beat' ? '✓' : result.result === 'miss' ? '✗' : '—'}
                  {Math.abs(result.surprise) > 0.1 && (
                    <span className="surprise-pct">
                      {result.surprise >= 0 ? '+' : ''}{result.surprise.toFixed(1)}%
                    </span>
                  )}
                </span>
              </button>
            ))}
            {unseenResults.length > 5 && (
              <div className="more-results">
                +{unseenResults.length - 5} more
              </div>
            )}
          </div>

          <button
            className="panel-close"
            onClick={() => setIsExpanded(false)}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      )}

      <style jsx>{`
        .watchlist-alert-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .watchlist-alert-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 14px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          border: none;
          border-radius: 24px;
          cursor: pointer;
          box-shadow: 
            0 4px 12px rgba(245, 158, 11, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.1) inset;
          position: relative;
          overflow: visible;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .watchlist-alert-badge:hover {
          transform: scale(1.05);
          box-shadow: 
            0 6px 16px rgba(245, 158, 11, 0.5),
            0 0 0 1px rgba(255, 255, 255, 0.2) inset;
        }

        .watchlist-alert-badge.animate-in {
          animation: ${reducedMotion ? 'none' : 'badge-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'};
        }

        @keyframes badge-bounce {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }

        .badge-icon {
          font-size: 16px;
        }

        .badge-count {
          font-size: 14px;
          font-weight: 700;
          color: white;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .badge-pulse {
          position: absolute;
          inset: -4px;
          border-radius: 28px;
          background: rgba(245, 158, 11, 0.4);
          animation: ${reducedMotion ? 'none' : 'pulse-ring 2s ease-out infinite'};
          pointer-events: none;
        }

        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.4); opacity: 0; }
        }

        .watchlist-alert-panel {
          background: rgba(24, 24, 27, 0.95);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          min-width: 260px;
          max-width: 320px;
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.05) inset;
          animation: ${reducedMotion ? 'none' : 'panel-slide-in 0.3s ease-out'};
          overflow: hidden;
        }

        @media (prefers-color-scheme: light) {
          .watchlist-alert-panel {
            background: rgba(255, 255, 255, 0.95);
            border-color: rgba(0, 0, 0, 0.1);
            box-shadow: 
              0 8px 32px rgba(0, 0, 0, 0.15),
              0 0 0 1px rgba(0, 0, 0, 0.05) inset;
          }
        }

        @keyframes panel-slide-in {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        @media (prefers-color-scheme: light) {
          .panel-header {
            border-bottom-color: rgba(0, 0, 0, 0.08);
          }
        }

        .panel-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #fff;
        }

        @media (prefers-color-scheme: light) {
          .panel-title {
            color: #18181b;
          }
        }

        .title-icon {
          font-size: 14px;
        }

        .dismiss-all-btn {
          background: none;
          border: none;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          transition: all 0.15s ease;
        }

        .dismiss-all-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.8);
        }

        @media (prefers-color-scheme: light) {
          .dismiss-all-btn {
            color: rgba(0, 0, 0, 0.4);
          }
          .dismiss-all-btn:hover {
            background: rgba(0, 0, 0, 0.05);
            color: rgba(0, 0, 0, 0.7);
          }
        }

        .panel-results {
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-height: 240px;
          overflow-y: auto;
        }

        .result-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .result-item:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.1);
        }

        @media (prefers-color-scheme: light) {
          .result-item {
            background: rgba(0, 0, 0, 0.02);
            border-color: rgba(0, 0, 0, 0.05);
          }
          .result-item:hover {
            background: rgba(0, 0, 0, 0.05);
            border-color: rgba(0, 0, 0, 0.1);
          }
        }

        .result-item.result-beat {
          border-left: 3px solid #10b981;
        }

        .result-item.result-miss {
          border-left: 3px solid #ef4444;
        }

        .result-item.result-met {
          border-left: 3px solid #6b7280;
        }

        .result-ticker {
          font-size: 13px;
          font-weight: 600;
          color: #fff;
        }

        @media (prefers-color-scheme: light) {
          .result-ticker {
            color: #18181b;
          }
        }

        .result-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 6px;
        }

        .result-badge.beat {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }

        .result-badge.miss {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .result-badge.met {
          background: rgba(107, 114, 128, 0.15);
          color: #9ca3af;
        }

        .surprise-pct {
          font-size: 10px;
          opacity: 0.8;
        }

        .more-results {
          text-align: center;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.4);
          padding: 8px;
        }

        @media (prefers-color-scheme: light) {
          .more-results {
            color: rgba(0, 0, 0, 0.4);
          }
        }

        .panel-close {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 50%;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .panel-close:hover {
          background: rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.9);
        }

        @media (prefers-color-scheme: light) {
          .panel-close {
            background: rgba(0, 0, 0, 0.05);
            color: rgba(0, 0, 0, 0.4);
          }
          .panel-close:hover {
            background: rgba(0, 0, 0, 0.1);
            color: rgba(0, 0, 0, 0.8);
          }
        }

        /* Mobile adjustments */
        @media (max-width: 640px) {
          .watchlist-alert-panel {
            position: fixed;
            left: 16px;
            right: 16px;
            bottom: 80px;
            min-width: auto;
            max-width: none;
          }
        }
      `}</style>
    </div>
  );

  return createPortal(badge, document.body);
});

/**
 * Hook for integrating WatchlistResultsAlert with WatchlistContext
 */
export function useWatchlistAlerts() {
  const [seenResults, setSeenResults] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSeenResults(getSeenResults());
  }, []);

  const markResultAsSeen = useCallback((ticker: string, date: string, eps: number) => {
    const key = `${ticker}-${date}-${eps}`;
    setSeenResults(prev => {
      const next = new Set(prev);
      next.add(key);
      saveSeenResults(next);
      return next;
    });
  }, []);

  const clearSeenResults = useCallback(() => {
    setSeenResults(new Set());
    saveSeenResults(new Set());
  }, []);

  return {
    seenResults,
    markResultAsSeen,
    clearSeenResults,
  };
}

export default WatchlistResultsAlert;
