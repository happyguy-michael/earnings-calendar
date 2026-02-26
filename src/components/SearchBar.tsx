'use client';

import { useRef, useEffect } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  resultCount?: number;
  totalCount?: number;
}

export function SearchBar({ value, onChange, resultCount, totalCount }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: / to focus, Escape to clear
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === 'Escape') {
          onChange('');
          inputRef.current?.blur();
        }
        return;
      }
      
      if (e.key === '/' || e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onChange]);

  const hasValue = value.length > 0;
  const isFiltered = hasValue && resultCount !== undefined && resultCount !== totalCount;

  return (
    <div className="search-container">
      <div className={`search-bar ${hasValue ? 'has-value' : ''}`}>
        {/* Search Icon */}
        <svg 
          className="search-icon" 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search ticker or company..."
          className="search-input"
          aria-label="Search earnings by ticker or company name"
        />

        {/* Clear button */}
        <button
          onClick={() => {
            onChange('');
            inputRef.current?.focus();
          }}
          className={`search-clear ${hasValue ? 'visible' : ''}`}
          aria-label="Clear search"
          tabIndex={hasValue ? 0 : -1}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Keyboard hint */}
        <div className={`search-kbd ${hasValue ? 'hidden' : ''}`}>
          <span className="kbd">/</span>
        </div>
      </div>

      {/* Result count indicator */}
      {isFiltered && (
        <div className="search-results-count">
          <span className="count">{resultCount}</span>
          <span className="label">of {totalCount} reports</span>
        </div>
      )}
    </div>
  );
}
