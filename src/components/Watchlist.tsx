'use client';

import { useState, useEffect, useCallback, createContext, useContext, useMemo } from 'react';

interface WatchlistItem {
  ticker: string;
  company: string;
  addedAt: number;
}

interface WatchlistContextValue {
  watchlist: WatchlistItem[];
  isInWatchlist: (ticker: string) => boolean;
  addToWatchlist: (ticker: string, company: string) => void;
  removeFromWatchlist: (ticker: string) => void;
  toggleWatchlist: (ticker: string, company: string) => { added: boolean };
  clearWatchlist: () => void;
  count: number;
}

const WatchlistContext = createContext<WatchlistContextValue | null>(null);

const STORAGE_KEY = 'earnings-watchlist';

/**
 * WatchlistProvider - Global watchlist state with localStorage persistence
 * 
 * Features:
 * - Persistent storage across sessions
 * - Optimistic UI updates
 * - Handles SSR gracefully
 * - Provides toggle for easy add/remove
 */
export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setWatchlist(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to load watchlist from localStorage:', e);
    }
    setIsLoaded(true);
  }, []);

  // Persist to localStorage whenever watchlist changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
    } catch (e) {
      console.warn('Failed to save watchlist to localStorage:', e);
    }
  }, [watchlist, isLoaded]);

  const isInWatchlist = useCallback((ticker: string): boolean => {
    return watchlist.some(item => item.ticker.toUpperCase() === ticker.toUpperCase());
  }, [watchlist]);

  const addToWatchlist = useCallback((ticker: string, company: string) => {
    setWatchlist(prev => {
      const exists = prev.some(item => item.ticker.toUpperCase() === ticker.toUpperCase());
      if (exists) return prev;
      return [...prev, { 
        ticker: ticker.toUpperCase(), 
        company, 
        addedAt: Date.now() 
      }];
    });
  }, []);

  const removeFromWatchlist = useCallback((ticker: string) => {
    setWatchlist(prev => 
      prev.filter(item => item.ticker.toUpperCase() !== ticker.toUpperCase())
    );
  }, []);

  const toggleWatchlist = useCallback((ticker: string, company: string): { added: boolean } => {
    const normalizedTicker = ticker.toUpperCase();
    const exists = watchlist.some(item => item.ticker === normalizedTicker);
    
    if (exists) {
      removeFromWatchlist(ticker);
      return { added: false };
    } else {
      addToWatchlist(ticker, company);
      return { added: true };
    }
  }, [watchlist, addToWatchlist, removeFromWatchlist]);

  const clearWatchlist = useCallback(() => {
    setWatchlist([]);
  }, []);

  const value = useMemo(() => ({
    watchlist,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    clearWatchlist,
    count: watchlist.length,
  }), [watchlist, isInWatchlist, addToWatchlist, removeFromWatchlist, toggleWatchlist, clearWatchlist]);

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}

/**
 * useWatchlist - Hook to access watchlist state and actions
 */
export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}

/**
 * WatchlistButton - Animated watchlist toggle button
 * 
 * Features:
 * - Star fill animation on add
 * - Sparkle burst effect
 * - Haptic feedback integration
 * - Accessible toggle state
 */
interface WatchlistButtonProps {
  ticker: string;
  company: string;
  variant?: 'icon' | 'pill' | 'text';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onToggle?: (added: boolean) => void;
}

export function WatchlistButton({
  ticker,
  company,
  variant = 'pill',
  size = 'md',
  className = '',
  onToggle,
}: WatchlistButtonProps) {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const [isAnimating, setIsAnimating] = useState(false);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([]);
  const isWatched = isInWatchlist(ticker);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const { added } = toggleWatchlist(ticker, company);
    setIsAnimating(true);
    
    // Create sparkle effect on add
    if (added) {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const newSparkles = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 30 - 15,
        y: Math.random() * 30 - 15,
      }));
      setSparkles(newSparkles);
      setTimeout(() => setSparkles([]), 600);
    }
    
    setTimeout(() => setIsAnimating(false), 400);
    onToggle?.(added);
  }, [ticker, company, toggleWatchlist, onToggle]);

  const sizeClasses = {
    sm: 'watchlist-btn-sm',
    md: 'watchlist-btn-md',
    lg: 'watchlist-btn-lg',
  };

  const variantClasses = {
    icon: 'watchlist-btn-icon',
    pill: 'watchlist-btn-pill',
    text: 'watchlist-btn-text',
  };

  return (
    <button
      type="button"
      className={`watchlist-btn ${variantClasses[variant]} ${sizeClasses[size]} ${isWatched ? 'watched' : ''} ${isAnimating ? 'animating' : ''} ${className}`}
      onClick={handleClick}
      aria-label={isWatched ? `Remove ${ticker} from watchlist` : `Add ${ticker} to watchlist`}
      aria-pressed={isWatched}
    >
      {/* Star icon with fill animation */}
      <span className="watchlist-star">
        <svg 
          viewBox="0 0 24 24" 
          className="watchlist-star-svg"
          fill={isWatched ? 'currentColor' : 'none'}
          stroke="currentColor" 
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        
        {/* Animated fill overlay */}
        <svg 
          viewBox="0 0 24 24" 
          className={`watchlist-star-fill ${isWatched ? 'filled' : ''}`}
          fill="currentColor"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </span>
      
      {/* Label for pill/text variants */}
      {variant !== 'icon' && (
        <span className="watchlist-label">
          {isWatched ? 'Watching' : 'Watch'}
        </span>
      )}
      
      {/* Sparkle particles */}
      {sparkles.map(sparkle => (
        <span
          key={sparkle.id}
          className="watchlist-sparkle"
          style={{
            '--sparkle-x': `${sparkle.x}px`,
            '--sparkle-y': `${sparkle.y}px`,
          } as React.CSSProperties}
        />
      ))}
    </button>
  );
}

/**
 * WatchlistIndicator - Small badge showing item is in watchlist
 * For use on cards/list items
 */
interface WatchlistIndicatorProps {
  ticker: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export function WatchlistIndicator({
  ticker,
  size = 'sm',
  className = '',
}: WatchlistIndicatorProps) {
  const { isInWatchlist } = useWatchlist();
  
  if (!isInWatchlist(ticker)) return null;
  
  const sizeClasses = {
    xs: 'watchlist-indicator-xs',
    sm: 'watchlist-indicator-sm',
    md: 'watchlist-indicator-md',
  };
  
  return (
    <span 
      className={`watchlist-indicator ${sizeClasses[size]} ${className}`}
      aria-label="In watchlist"
      title="In your watchlist"
    >
      <svg viewBox="0 0 24 24" fill="currentColor">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </span>
  );
}

/**
 * WatchlistCount - Badge showing number of items in watchlist
 */
interface WatchlistCountProps {
  className?: string;
  showZero?: boolean;
}

export function WatchlistCount({ className = '', showZero = false }: WatchlistCountProps) {
  const { count } = useWatchlist();
  
  if (count === 0 && !showZero) return null;
  
  return (
    <span className={`watchlist-count ${className}`}>
      {count}
    </span>
  );
}

export default WatchlistProvider;
