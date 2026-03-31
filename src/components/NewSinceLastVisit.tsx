'use client';

import { useEffect, useState, useMemo, createContext, useContext, ReactNode, useCallback } from 'react';
import { Earning } from '@/lib/types';

/**
 * NewSinceLastVisit — Highlight Fresh Results for Returning Users
 * 
 * A practical UX feature that helps traders quickly identify what's changed
 * since their last visit. When users return to the calendar, earnings that
 * have reported since their last visit get a subtle animated highlight.
 * 
 * Features:
 * - Tracks last visit timestamp in localStorage
 * - Identifies earnings with results that came in since last visit
 * - Animated "NEW" pulse badge with auto-fade
 * - Subtle glow effect on new result cards
 * - "Mark all as seen" quick action
 * - Count badge showing number of new results
 * - Respects prefers-reduced-motion
 * - Full light/dark mode support
 * 
 * 2026 Trend: Proactive UX that anticipates user needs and surfaces
 * relevant changes without requiring manual discovery.
 */

// Storage key for last visit timestamp
const LAST_VISIT_KEY = 'earnings-calendar-last-visit';
const SEEN_RESULTS_KEY = 'earnings-calendar-seen-results';

interface NewSinceLastVisitContextValue {
  newTickers: Set<string>;
  newCount: number;
  lastVisit: Date | null;
  isNew: (ticker: string) => boolean;
  markSeen: (ticker: string) => void;
  markAllSeen: () => void;
  clearHistory: () => void;
}

const NewSinceLastVisitContext = createContext<NewSinceLastVisitContextValue | null>(null);

export function useNewSinceLastVisit() {
  const context = useContext(NewSinceLastVisitContext);
  if (!context) {
    // Return safe defaults if not wrapped in provider
    return {
      newTickers: new Set<string>(),
      newCount: 0,
      lastVisit: null,
      isNew: () => false,
      markSeen: () => {},
      markAllSeen: () => {},
      clearHistory: () => {},
    };
  }
  return context;
}

interface NewSinceLastVisitProviderProps {
  children: ReactNode;
  earnings: Earning[];
  /** Hours to consider as "new" (default: 72 hours) */
  newThresholdHours?: number;
}

export function NewSinceLastVisitProvider({
  children,
  earnings,
  newThresholdHours = 72,
}: NewSinceLastVisitProviderProps) {
  const [lastVisit, setLastVisit] = useState<Date | null>(null);
  const [seenResults, setSeenResults] = useState<Set<string>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    const storedLastVisit = localStorage.getItem(LAST_VISIT_KEY);
    const storedSeen = localStorage.getItem(SEEN_RESULTS_KEY);
    
    if (storedLastVisit) {
      setLastVisit(new Date(parseInt(storedLastVisit, 10)));
    }
    
    if (storedSeen) {
      try {
        const parsed = JSON.parse(storedSeen);
        setSeenResults(new Set(parsed));
      } catch {
        // Invalid data, start fresh
      }
    }
    
    setIsInitialized(true);
  }, []);

  // Update last visit timestamp on mount (after initial read)
  useEffect(() => {
    if (isInitialized) {
      const now = Date.now();
      localStorage.setItem(LAST_VISIT_KEY, now.toString());
    }
  }, [isInitialized]);

  // Calculate which earnings are "new" since last visit
  const newTickers = useMemo(() => {
    if (!lastVisit || !isInitialized) return new Set<string>();

    const threshold = Date.now() - (newThresholdHours * 60 * 60 * 1000);
    const newSet = new Set<string>();

    earnings.forEach((earning) => {
      // Only consider reported earnings (have actual EPS)
      if (earning.eps === undefined || earning.eps === null) return;
      
      // Check if result came after last visit and within threshold
      const reportDate = new Date(earning.date);
      const reportTime = reportDate.getTime();
      
      // Consider it "new" if:
      // 1. The report date is after last visit
      // 2. It's within the freshness threshold
      // 3. User hasn't explicitly marked it as seen
      if (
        reportTime > lastVisit.getTime() &&
        reportTime > threshold &&
        !seenResults.has(earning.ticker)
      ) {
        newSet.add(earning.ticker);
      }
    });

    return newSet;
  }, [earnings, lastVisit, seenResults, newThresholdHours, isInitialized]);

  const isNew = useCallback((ticker: string) => {
    return newTickers.has(ticker);
  }, [newTickers]);

  const markSeen = useCallback((ticker: string) => {
    setSeenResults((prev) => {
      const next = new Set(prev);
      next.add(ticker);
      localStorage.setItem(SEEN_RESULTS_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const markAllSeen = useCallback(() => {
    setSeenResults((prev) => {
      const next = new Set([...prev, ...newTickers]);
      localStorage.setItem(SEEN_RESULTS_KEY, JSON.stringify([...next]));
      return next;
    });
  }, [newTickers]);

  const clearHistory = useCallback(() => {
    setSeenResults(new Set());
    localStorage.removeItem(SEEN_RESULTS_KEY);
  }, []);

  const value = useMemo(() => ({
    newTickers,
    newCount: newTickers.size,
    lastVisit,
    isNew,
    markSeen,
    markAllSeen,
    clearHistory,
  }), [newTickers, lastVisit, isNew, markSeen, markAllSeen, clearHistory]);

  return (
    <NewSinceLastVisitContext.Provider value={value}>
      {children}
    </NewSinceLastVisitContext.Provider>
  );
}

/**
 * NewResultBadge — Animated badge for cards with new results
 * 
 * Shows a pulsing "NEW" indicator that auto-fades after a delay
 * or when the user hovers the parent card.
 */
interface NewResultBadgeProps {
  ticker: string;
  /** Auto-fade after this many seconds (0 = no auto-fade) */
  autoFadeSeconds?: number;
  className?: string;
}

export function NewResultBadge({
  ticker,
  autoFadeSeconds = 10,
  className = '',
}: NewResultBadgeProps) {
  const { isNew, markSeen } = useNewSinceLastVisit();
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Auto-fade timer
  useEffect(() => {
    if (!isNew(ticker) || autoFadeSeconds === 0) return;

    const fadeTimer = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => {
        setIsVisible(false);
        markSeen(ticker);
      }, 500); // Match fade duration
    }, autoFadeSeconds * 1000);

    return () => clearTimeout(fadeTimer);
  }, [ticker, isNew, markSeen, autoFadeSeconds]);

  if (!isNew(ticker) || !isVisible) return null;

  return (
    <span
      className={`new-result-badge ${isFading ? 'fading' : ''} ${prefersReducedMotion ? 'reduced-motion' : ''} ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        markSeen(ticker);
        setIsVisible(false);
      }}
      title="New since your last visit — click to dismiss"
    >
      <span className="new-result-badge-text">NEW</span>
      <span className="new-result-badge-ring" />
      <span className="new-result-badge-glow" />
    </span>
  );
}

/**
 * NewResultGlow — Subtle glow wrapper for cards with new results
 * 
 * Wraps a card and adds an animated glow effect for new results.
 */
interface NewResultGlowProps {
  ticker: string;
  children: ReactNode;
  className?: string;
}

export function NewResultGlow({
  ticker,
  children,
  className = '',
}: NewResultGlowProps) {
  const { isNew } = useNewSinceLastVisit();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const showGlow = isNew(ticker);

  return (
    <div className={`new-result-glow-wrapper ${showGlow ? 'is-new' : ''} ${prefersReducedMotion ? 'reduced-motion' : ''} ${className}`}>
      {showGlow && (
        <>
          <div className="new-result-glow-effect" />
          <div className="new-result-glow-border" />
        </>
      )}
      {children}
    </div>
  );
}

/**
 * NewResultsCounter — Shows count of new results since last visit
 * 
 * Can be placed in header to show users how many new results are available.
 */
interface NewResultsCounterProps {
  className?: string;
  showWhenZero?: boolean;
}

export function NewResultsCounter({
  className = '',
  showWhenZero = false,
}: NewResultsCounterProps) {
  const { newCount, markAllSeen, lastVisit } = useNewSinceLastVisit();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  if (!showWhenZero && newCount === 0) return null;

  const formatLastVisit = () => {
    if (!lastVisit) return 'first visit';
    const diff = Date.now() - lastVisit.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'recently';
  };

  return (
    <div className={`new-results-counter ${prefersReducedMotion ? 'reduced-motion' : ''} ${className}`}>
      <button
        className="new-results-counter-button"
        onClick={() => setIsExpanded(!isExpanded)}
        title={`${newCount} new results since your last visit`}
      >
        <span className="new-results-counter-icon">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </span>
        <span className="new-results-counter-count">{newCount}</span>
        <span className="new-results-counter-label">new</span>
        {newCount > 0 && <span className="new-results-counter-pulse" />}
      </button>
      
      {isExpanded && newCount > 0 && (
        <div className="new-results-counter-dropdown">
          <div className="new-results-counter-info">
            <span className="new-results-counter-info-text">
              {newCount} result{newCount !== 1 ? 's' : ''} since {formatLastVisit()}
            </span>
          </div>
          <button
            className="new-results-counter-action"
            onClick={(e) => {
              e.stopPropagation();
              markAllSeen();
              setIsExpanded(false);
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Mark all as seen
          </button>
        </div>
      )}
    </div>
  );
}
