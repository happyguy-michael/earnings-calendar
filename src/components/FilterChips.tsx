'use client';

import { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { AnimatedFilterCount } from './AnimatedFilterCount';
import { useAudioFeedback } from './AudioFeedback';
import { LiquidPill } from './LiquidBlob';
import { KeyboardHintWrapper } from './KeyboardHint';

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
  /** Show keyboard shortcut hints on hover */
  showShortcuts?: boolean;
}

const filters: { key: FilterType; label: string; icon: string; description: string; shortcut: string }[] = [
  { key: 'all', label: 'All', icon: '', description: 'Show all earnings reports', shortcut: 'A' },
  { key: 'beat', label: 'Beat', icon: '📈', description: 'Show earnings that beat estimates', shortcut: 'B' },
  { key: 'miss', label: 'Miss', icon: '📉', description: 'Show earnings that missed estimates', shortcut: 'M' },
  { key: 'pending', label: 'Pending', icon: '⏳', description: 'Show pending earnings reports', shortcut: 'P' },
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
export function FilterChips({ value, onChange, counts, showShortcuts = true }: FilterChipsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<FilterType, HTMLButtonElement>>(new Map());
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(() => 
    filters.findIndex(f => f.key === value)
  );
  const { play: playAudio } = useAudioFeedback();
  
  // Elastic stretch effect state
  const [isStretching, setIsStretching] = useState(false);
  const [stretchDirection, setStretchDirection] = useState<'left' | 'right' | null>(null);
  const prevLeftRef = useRef<number>(0);
  const stretchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Measure and update pill position
  const updatePillPosition = useCallback(() => {
    const container = containerRef.current;
    const activeButton = buttonRefs.current.get(value);
    
    if (!container || !activeButton) return;
    
    const containerRect = container.getBoundingClientRect();
    const buttonRect = activeButton.getBoundingClientRect();
    const newLeft = buttonRect.left - containerRect.left;
    
    // Determine stretch direction based on movement
    if (mounted && newLeft !== prevLeftRef.current) {
      const direction = newLeft > prevLeftRef.current ? 'right' : 'left';
      setStretchDirection(direction);
      setIsStretching(true);
      
      // Clear any existing timeout
      if (stretchTimeoutRef.current) {
        clearTimeout(stretchTimeoutRef.current);
      }
      
      // Remove stretch after animation completes
      stretchTimeoutRef.current = setTimeout(() => {
        setIsStretching(false);
        setStretchDirection(null);
      }, 350); // Match transition duration
    }
    
    prevLeftRef.current = newLeft;
    
    setPillStyle({
      left: newLeft,
      width: buttonRect.width,
    });
  }, [value, mounted]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (stretchTimeoutRef.current) {
        clearTimeout(stretchTimeoutRef.current);
      }
    };
  }, []);

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
      playAudio('toggle');
      // Move focus to the new tab
      const newFilter = filters[newIndex];
      const newButton = buttonRefs.current.get(newFilter.key);
      newButton?.focus();
      // Auto-select on arrow navigation (common pattern for tabs)
      onChange(newFilter.key);
    }
  }, [focusedIndex, onChange, playAudio]);

  // Get pill color class based on active filter
  const getPillColorClass = () => {
    switch (value) {
      case 'beat': return 'sliding-pill-beat';
      case 'miss': return 'sliding-pill-miss';
      case 'pending': return 'sliding-pill-pending';
      default: return 'sliding-pill-all';
    }
  };

  // Map filter type to LiquidPill variant
  const getLiquidPillVariant = (): 'default' | 'beat' | 'miss' | 'pending' => {
    if (value === 'all') return 'default';
    return value;
  };

  return (
    <div className="filter-chips-liquid">
    <div className="filter-chips-container" ref={containerRef}>
      {/* Liquid pill background with organic morphing effect - 2026 UI trend */}
      <LiquidPill
        transform={`translateX(${pillStyle.left}px)`}
        width={pillStyle.width}
        variant={getLiquidPillVariant()}
        mounted={mounted}
        transitioning={isStretching}
        direction={stretchDirection}
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
          
          const buttonContent = (
            <button
              key={filter.key}
              ref={(el) => {
                if (el) buttonRefs.current.set(filter.key, el);
              }}
              onClick={() => {
                playAudio('toggle');
                onChange(filter.key);
              }}
              onFocus={() => setFocusedIndex(index)}
              className={`filter-chip ${isActive ? 'active' : ''} ${filter.key !== 'all' ? `filter-chip-${filter.key}` : ''}`}
              role="tab"
              aria-selected={isActive}
              aria-controls="earnings-content"
              aria-label={`${filter.label}: ${count} ${count === 1 ? 'report' : 'reports'}. ${filter.description}. Press ${filter.shortcut} to activate.`}
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
          
          return showShortcuts ? (
            <KeyboardHintWrapper
              key={filter.key}
              shortcut={filter.shortcut}
              position="bottom"
              variant="glass"
              size="xs"
              showDelay={400}
              wrapperClassName="filter-chip-wrapper"
            >
              {buttonContent}
            </KeyboardHintWrapper>
          ) : buttonContent;
        })}
      </div>
      
      {/* Screen reader instructions (visually hidden) */}
      <div className="sr-only" aria-live="polite">
        Use arrow keys to navigate between filters. Currently showing {
          filters.find(f => f.key === value)?.label
        } filter with {counts[value]} {counts[value] === 1 ? 'result' : 'results'}.
      </div>
    </div>
    </div>
  );
}

export type { FilterType };
