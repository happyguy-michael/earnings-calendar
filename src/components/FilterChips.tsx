'use client';

import { useRef, useState, useEffect, useLayoutEffect } from 'react';

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

const filters: { key: FilterType; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: '' },
  { key: 'beat', label: 'Beat', icon: '📈' },
  { key: 'miss', label: 'Miss', icon: '📉' },
  { key: 'pending', label: 'Pending', icon: '⏳' },
];

/**
 * FilterChips with Sliding Pill Indicator
 * 
 * Features:
 * - Smooth sliding pill that glides between active buttons
 * - Color-matched pill for each filter type
 * - Subtle glow effect on active pill
 * - Spring-based easing for premium feel
 * - Theme-aware styling
 * - Respects prefers-reduced-motion
 */
export function FilterChips({ value, onChange, counts }: FilterChipsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<FilterType, HTMLButtonElement>>(new Map());
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);

  // Measure and update pill position
  const updatePillPosition = () => {
    const container = containerRef.current;
    const activeButton = buttonRefs.current.get(value);
    
    if (!container || !activeButton) return;
    
    const containerRect = container.getBoundingClientRect();
    const buttonRect = activeButton.getBoundingClientRect();
    
    setPillStyle({
      left: buttonRect.left - containerRect.left,
      width: buttonRect.width,
    });
  };

  // Use layout effect for initial measurement (prevents flash)
  useLayoutEffect(() => {
    updatePillPosition();
    setMounted(true);
  }, []);

  // Update on value change
  useEffect(() => {
    updatePillPosition();
  }, [value]);

  // Update on window resize
  useEffect(() => {
    const handleResize = () => updatePillPosition();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [value]);

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
      
      {/* Filter buttons */}
      <div className="filter-chips">
        {filters.map((filter) => {
          const isActive = value === filter.key;
          const count = counts[filter.key];
          
          return (
            <button
              key={filter.key}
              ref={(el) => {
                if (el) buttonRefs.current.set(filter.key, el);
              }}
              onClick={() => onChange(filter.key)}
              className={`filter-chip ${isActive ? 'active' : ''} ${filter.key !== 'all' ? `filter-chip-${filter.key}` : ''}`}
              aria-pressed={isActive}
            >
              {filter.icon && <span className="filter-chip-icon">{filter.icon}</span>}
              <span className="filter-chip-label">{filter.label}</span>
              <span className={`filter-chip-count ${isActive ? 'visible' : ''}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export type { FilterType };
