'use client';

import { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { AnimatedFilterCount } from './AnimatedFilterCount';

type FilterType = 'all' | 'beat' | 'miss' | 'pending';

interface FilterChipsProps {
  value: FilterType;
  onChange: (filter: FilterType) => void;
  counts: {
    all: number;
    beat: number;
    miss: number;
    pending: number;
  };
}

const filters: { key: FilterType; label: string; icon: string; description: string }[] = [
  { key: 'all', label: 'All', icon: '', description: 'Show all earnings reports' },
  { key: 'beat', label: 'Beat', icon: '📈', description: 'Show earnings that beat estimates' },
  { key: 'miss', label: 'Miss', icon: '📉', description: 'Show earnings that missed estimates' },
  { key: 'pending', label: 'Pending', icon: '⏳', description: 'Show pending earnings reports' },
];

/**
 * FilterChips with Sliding Pill Indicator
 * 
 * Features:
 * - WAI-ARIA tablist pattern for proper screen reader support
 * - Roving tabindex for keyboard navigation (Arrow keys)
 * - Smooth sliding pill that glides between active buttons
 * - Color-matched pill for each filter type
 * - Subtle glow effect on active pill
 * - Spring-based easing for premium feel
 * - Theme-aware styling
 * - Respects prefers-reduced-motion
 * - Focus visible indicators for keyboard users
 */
export function FilterChips({ value, onChange, counts }: FilterChipsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<FilterType, HTMLButtonElement>>(new Map());
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(() => 
    filters.findIndex(f => f.key === value)
  );

  // Measure and update pill position
  const updatePillPosition = useCallback(() => {
    const container = containerRef.current;
    const activeButton = buttonRefs.current.get(value);
    
    if (!container || !activeButton) return;
    
    const containerRect = container.getBoundingClientRect();
    const buttonRect = activeButton.getBoundingClientRect();
    
    setPillStyle({
      left: buttonRect.left - containerRect.left,
      width: buttonRect.width,
    });
  }, [value]);

  // Use layout effect for initial measurement (prevents flash)
  useLayoutEffect(() => {
    updatePillPosition();
    setMounted(true);
  }, [updatePillPosition]);

  // Update on value change
  useEffect(() => {
    updatePillPosition();
    // Sync focused index with value when value changes externally
    const newIndex = filters.findIndex(f => f.key === value);
    if (newIndex !== -1) {
      setFocusedIndex(newIndex);
    }
  }, [value, updatePillPosition]);

  // Update on window resize
  useEffect(() => {
    const handleResize = () => updatePillPosition();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updatePillPosition]);

  // Handle keyboard navigation (roving tabindex pattern)
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const currentIndex = focusedIndex;
    let newIndex = currentIndex;
    let shouldPreventDefault = true;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        // Move to next tab (wrap around)
        newIndex = (currentIndex + 1) % filters.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        // Move to previous tab (wrap around)
        newIndex = (currentIndex - 1 + filters.length) % filters.length;
        break;
      case 'Home':
        // Move to first tab
        newIndex = 0;
        break;
      case 'End':
        // Move to last tab
        newIndex = filters.length - 1;
        break;
      case 'Enter':
      case ' ':
        // Select current tab
        onChange(filters[currentIndex].key);
        break;
      default:
        shouldPreventDefault = false;
    }

    if (shouldPreventDefault) {
      e.preventDefault();
    }

    if (newIndex !== currentIndex) {
      setFocusedIndex(newIndex);
      // Move focus to the new tab
      const newFilter = filters[newIndex];
      const newButton = buttonRefs.current.get(newFilter.key);
      newButton?.focus();
      // Auto-select on arrow navigation (common pattern for tabs)
      onChange(newFilter.key);
    }
  }, [focusedIndex, onChange]);

  // Get pill color class based on active filter
  const getPillColorClass = () => {
    switch (value) {
      case 'beat': return 'sliding-pill-beat';
      case 'miss': return 'sliding-pill-miss';
      case 'pending': return 'sliding-pill-pending';
      default: return 'sliding-pill-all';
    }
  };

  return (
    <div className="filter-chips-container" ref={containerRef}>
      {/* Sliding pill background */}
      <div 
        className={`sliding-pill ${getPillColorClass()} ${mounted ? 'mounted' : ''}`}
        style={{
          transform: `translateX(${pillStyle.left}px)`,
          width: `${pillStyle.width}px`,
        }}
        aria-hidden="true"
      />
      
      {/* Filter tabs - using tablist/tab ARIA pattern */}
      <div 
        className="filter-chips"
        role="tablist"
        aria-label="Filter earnings by status"
        onKeyDown={handleKeyDown}
      >
        {filters.map((filter, index) => {
          const isActive = value === filter.key;
          const count = counts[filter.key];
          
          return (
            <button
              key={filter.key}
              ref={(el) => {
                if (el) buttonRefs.current.set(filter.key, el);
              }}
              onClick={() => onChange(filter.key)}
              onFocus={() => setFocusedIndex(index)}
              className={`filter-chip ${isActive ? 'active' : ''} ${filter.key !== 'all' ? `filter-chip-${filter.key}` : ''}`}
              role="tab"
              aria-selected={isActive}
              aria-controls="earnings-content"
              aria-label={`${filter.label}: ${count} ${count === 1 ? 'report' : 'reports'}. ${filter.description}`}
              tabIndex={isActive ? 0 : -1}
              id={`filter-tab-${filter.key}`}
            >
              {filter.icon && <span className="filter-chip-icon" aria-hidden="true">{filter.icon}</span>}
              <span className="filter-chip-label">{filter.label}</span>
              <AnimatedFilterCount 
                value={count} 
                isActive={isActive}
                variant={filter.key === 'all' ? 'default' : filter.key}
              />
            </button>
          );
        })}
      </div>
      
      {/* Screen reader instructions (visually hidden) */}
      <div className="sr-only" aria-live="polite">
        Use arrow keys to navigate between filters. Currently showing {
          filters.find(f => f.key === value)?.label
        } filter with {counts[value]} {counts[value] === 1 ? 'result' : 'results'}.
      </div>
    </div>
  );
}

export type { FilterType };
