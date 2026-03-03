'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { earnings } from '@/lib/data';

interface SearchSuggestionsProps {
  query: string;
  isOpen: boolean;
  onSelect: (ticker: string) => void;
  onClose: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

interface Suggestion {
  ticker: string;
  company: string;
  matchType: 'ticker' | 'company';
  time?: 'pre' | 'post';
  hasResult: boolean;
}

/**
 * SearchSuggestions - Dropdown with matching ticker suggestions
 * 
 * Features:
 * - Fuzzy matching on ticker and company name
 * - Keyboard navigation (↑↓ + Enter)
 * - Highlights matching text
 * - Shows market session icon
 * - Animated entrance/exit
 * - Click outside to close
 */
export function SearchSuggestions({ 
  query, 
  isOpen, 
  onSelect, 
  onClose,
  inputRef 
}: SearchSuggestionsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  // Get unique tickers with their info
  const suggestions = useCallback((): Suggestion[] => {
    if (!query || query.length < 1) return [];
    
    const q = query.toLowerCase();
    const seen = new Set<string>();
    const results: Suggestion[] = [];
    
    for (const e of earnings) {
      if (seen.has(e.ticker)) continue;
      
      const tickerMatch = e.ticker.toLowerCase().includes(q);
      const companyMatch = e.company.toLowerCase().includes(q);
      
      if (tickerMatch || companyMatch) {
        seen.add(e.ticker);
        results.push({
          ticker: e.ticker,
          company: e.company,
          matchType: tickerMatch ? 'ticker' : 'company',
          time: e.time,
          hasResult: e.eps !== undefined && e.eps !== null,
        });
      }
      
      if (results.length >= 8) break;
    }
    
    // Sort: ticker matches first, then by ticker alphabetically
    return results.sort((a, b) => {
      if (a.matchType === 'ticker' && b.matchType !== 'ticker') return -1;
      if (a.matchType !== 'ticker' && b.matchType === 'ticker') return 1;
      return a.ticker.localeCompare(b.ticker);
    });
  }, [query]);

  const items = suggestions();

  // Reset active index when suggestions change
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || items.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex(prev => (prev + 1) % items.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex(prev => (prev - 1 + items.length) % items.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (items[activeIndex]) {
            onSelect(items[activeIndex].ticker);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, items, activeIndex, onSelect, onClose]);

  // Scroll active item into view
  useEffect(() => {
    const activeItem = itemRefs.current.get(activeIndex);
    if (activeItem && listRef.current) {
      activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeIndex]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        listRef.current && 
        !listRef.current.contains(target) &&
        inputRef.current &&
        !inputRef.current.contains(target)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, inputRef]);

  // Highlight matching text
  const highlightMatch = (text: string, isTickerField: boolean) => {
    const q = query.toLowerCase();
    const lowerText = text.toLowerCase();
    const index = lowerText.indexOf(q);
    
    if (index === -1) return text;
    
    const before = text.slice(0, index);
    const match = text.slice(index, index + query.length);
    const after = text.slice(index + query.length);
    
    return (
      <>
        {before}
        <span className="search-suggestion-highlight">{match}</span>
        {after}
      </>
    );
  };

  if (!isOpen || items.length === 0) return null;

  return (
    <div 
      ref={listRef}
      className="search-suggestions"
      role="listbox"
      aria-label="Search suggestions"
    >
      {items.map((item, index) => (
        <button
          key={item.ticker}
          ref={(el) => {
            if (el) itemRefs.current.set(index, el);
          }}
          className={`search-suggestion-item ${index === activeIndex ? 'active' : ''}`}
          onClick={() => onSelect(item.ticker)}
          onMouseEnter={() => setActiveIndex(index)}
          role="option"
          aria-selected={index === activeIndex}
        >
          <div className="search-suggestion-ticker">
            {item.time === 'pre' && <span className="search-suggestion-time">☀️</span>}
            {item.time === 'post' && <span className="search-suggestion-time">🌙</span>}
            <span className="ticker-text">
              {item.matchType === 'ticker' ? highlightMatch(item.ticker, true) : item.ticker}
            </span>
          </div>
          <div className="search-suggestion-company">
            {item.matchType === 'company' ? highlightMatch(item.company, false) : item.company}
          </div>
          <div className="search-suggestion-status">
            {item.hasResult ? (
              <span className="status-dot reported" />
            ) : (
              <span className="status-dot pending" />
            )}
          </div>
        </button>
      ))}
      <div className="search-suggestions-hint">
        <span className="kbd">↑↓</span> navigate
        <span className="mx-2">·</span>
        <span className="kbd">↵</span> select
        <span className="mx-2">·</span>
        <span className="kbd">esc</span> close
      </div>
    </div>
  );
}
