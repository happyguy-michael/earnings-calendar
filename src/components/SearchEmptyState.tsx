'use client';

import { useMemo, useEffect, useState } from 'react';

interface SearchEmptyStateProps {
  searchQuery: string;
  statusFilter: string;
  allTickers: string[];
  onClearSearch: () => void;
  onClearFilters: () => void;
  onSelectTicker?: (ticker: string) => void;
}

/**
 * SearchEmptyState - Premium empty state for search/filter with no results
 * 
 * Features:
 * - Animated magnifying glass with scanning effect
 * - Fuzzy ticker suggestions based on search query
 * - Clear action buttons
 * - Theme-aware styling with glassmorphism
 * - Staggered entrance animations
 */
export function SearchEmptyState({ 
  searchQuery, 
  statusFilter, 
  allTickers,
  onClearSearch,
  onClearFilters,
  onSelectTicker,
}: SearchEmptyStateProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Find similar tickers using simple fuzzy matching
  const suggestions = useMemo(() => {
    if (!searchQuery || searchQuery.length < 1) return [];
    
    const query = searchQuery.toLowerCase();
    
    // Score tickers by similarity
    const scored = allTickers.map(ticker => {
      const t = ticker.toLowerCase();
      let score = 0;
      
      // Exact prefix match gets highest score
      if (t.startsWith(query)) {
        score += 100;
      }
      
      // Contains the query
      if (t.includes(query)) {
        score += 50;
      }
      
      // Character overlap
      for (const char of query) {
        if (t.includes(char)) {
          score += 5;
        }
      }
      
      // Levenshtein-like: penalize length difference
      score -= Math.abs(t.length - query.length) * 2;
      
      return { ticker, score };
    });
    
    // Return top 3 suggestions with positive scores
    return scored
      .filter(s => s.score > 10)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(s => s.ticker);
  }, [searchQuery, allTickers]);

  const hasFilters = statusFilter !== 'all';
  const hasSearch = searchQuery.trim().length > 0;

  return (
    <div className={`search-empty-state ${mounted ? 'mounted' : ''}`}>
      {/* Animated background orbs */}
      <div className="search-empty-orbs" aria-hidden="true">
        <span className="search-empty-orb orb-1" />
        <span className="search-empty-orb orb-2" />
        <span className="search-empty-orb orb-3" />
      </div>
      
      {/* Animated magnifying glass */}
      <div className="search-empty-icon-wrapper">
        <svg 
          className="search-empty-icon" 
          width="64" 
          height="64" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5"
        >
          {/* Main circle */}
          <circle 
            className="search-empty-circle"
            cx="11" 
            cy="11" 
            r="7"
          />
          {/* Handle */}
          <path 
            className="search-empty-handle"
            d="M21 21l-4.35-4.35" 
            strokeLinecap="round"
          />
          {/* Scanning line inside circle */}
          <line 
            className="search-empty-scan"
            x1="7" y1="11" x2="15" y2="11"
            strokeLinecap="round"
          />
        </svg>
        
        {/* Pulse rings */}
        <span className="search-empty-pulse pulse-1" />
        <span className="search-empty-pulse pulse-2" />
      </div>
      
      {/* Text content */}
      <div className="search-empty-content">
        <h3 className="search-empty-title">
          {hasSearch 
            ? `No results for "${searchQuery}"` 
            : 'No earnings match your filters'}
        </h3>
        <p className="search-empty-subtitle">
          {hasSearch 
            ? 'Try a different ticker or company name'
            : 'Adjust your filter selection to see more results'}
        </p>
      </div>
      
      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="search-empty-suggestions">
          <span className="search-empty-suggestions-label">Did you mean:</span>
          <div className="search-empty-suggestions-list">
            {suggestions.map((ticker, i) => (
              <button
                key={ticker}
                className="search-empty-suggestion"
                onClick={() => onSelectTicker?.(ticker)}
                style={{ animationDelay: `${300 + i * 100}ms` }}
              >
                {ticker}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="search-empty-actions">
        {hasSearch && (
          <button 
            className="search-empty-action search-empty-action-primary"
            onClick={onClearSearch}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear search
          </button>
        )}
        {hasFilters && (
          <button 
            className="search-empty-action"
            onClick={onClearFilters}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Clear filters
          </button>
        )}
        {!hasSearch && !hasFilters && (
          <button 
            className="search-empty-action"
            onClick={onClearFilters}
          >
            Show all earnings
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchEmptyState;
