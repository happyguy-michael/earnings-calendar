'use client';

import { useEffect, useState, useRef, useCallback, ReactNode } from 'react';

/**
 * FilterPulse - Radial Pulse Wave on Filter Change
 * 
 * Creates a satisfying pulse wave animation that radiates outward from
 * the filter bar when filters change, providing visual confirmation
 * that the action took effect.
 * 
 * Inspiration:
 * - Apple's "pop" feedback when liking content
 * - iOS Control Center toggle feedback
 * - Material Design's ripple extended as a page-wide confirmation
 * - 2026 Trend: "Kinetic Confirmations" — animations that confirm user actions
 * 
 * Features:
 * - Radial gradient pulse that expands from source element
 * - Color-coded by filter type (green=beat, red=miss, amber=pending)
 * - Multiple concurrent pulses supported (rapid clicking)
 * - Respects prefers-reduced-motion (instant feedback, no animation)
 * - GPU-accelerated via CSS transforms and opacity
 * - Clean unmount handling
 * 
 * Physics:
 * - Expansion uses ease-out for natural deceleration
 * - Opacity fades faster than expansion for clean edges
 * - Scale from 0 to 3 viewport widths for full coverage
 * - 600ms duration for noticeable but not slow feedback
 */

type FilterType = 'all' | 'beat' | 'miss' | 'pending';

interface Pulse {
  id: number;
  x: number;
  y: number;
  color: string;
  timestamp: number;
}

// Color mapping for filter types
const FILTER_COLORS: Record<FilterType, string> = {
  all: 'rgba(99, 102, 241, 0.15)',    // Indigo for neutral
  beat: 'rgba(34, 197, 94, 0.2)',     // Green for beats
  miss: 'rgba(239, 68, 68, 0.15)',    // Red for misses
  pending: 'rgba(245, 158, 11, 0.18)', // Amber for pending
};

// Light mode adjusted colors
const FILTER_COLORS_LIGHT: Record<FilterType, string> = {
  all: 'rgba(99, 102, 241, 0.12)',
  beat: 'rgba(34, 197, 94, 0.15)',
  miss: 'rgba(239, 68, 68, 0.12)',
  pending: 'rgba(245, 158, 11, 0.14)',
};

interface FilterPulseProps {
  /** The currently active filter */
  activeFilter: FilterType;
  /** Children to render (the filter bar) */
  children: ReactNode;
  /** Additional class name */
  className?: string;
  /** Pulse duration in ms (default: 600) */
  duration?: number;
  /** Maximum scale factor (default: 3) */
  maxScale?: number;
  /** Whether to play sound feedback (requires AudioFeedback) */
  playSound?: boolean;
  /** Callback when pulse completes */
  onPulseComplete?: () => void;
}

export function FilterPulse({
  activeFilter,
  children,
  className = '',
  duration = 600,
  maxScale = 3,
  onPulseComplete,
}: FilterPulseProps) {
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevFilterRef = useRef<FilterType>(activeFilter);
  const pulseIdRef = useRef(0);
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Check for theme
  useEffect(() => {
    const checkTheme = () => {
      setIsLightMode(document.documentElement.classList.contains('light'));
    };
    checkTheme();
    
    // Observer for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => observer.disconnect();
  }, []);

  // Trigger pulse when filter changes
  useEffect(() => {
    if (prevFilterRef.current === activeFilter) return;
    
    // Skip pulse on initial render
    if (prevFilterRef.current === 'all' && activeFilter === 'all') {
      prevFilterRef.current = activeFilter;
      return;
    }

    // Don't pulse in reduced motion mode
    if (prefersReducedMotion) {
      prevFilterRef.current = activeFilter;
      return;
    }

    // Get the center of the filter container
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      
      const colors = isLightMode ? FILTER_COLORS_LIGHT : FILTER_COLORS;
      const color = colors[activeFilter];
      
      const newPulse: Pulse = {
        id: pulseIdRef.current++,
        x,
        y,
        color,
        timestamp: Date.now(),
      };
      
      setPulses(prev => [...prev, newPulse]);
      
      // Clean up pulse after animation completes
      cleanupTimeoutRef.current = setTimeout(() => {
        setPulses(prev => prev.filter(p => p.id !== newPulse.id));
        onPulseComplete?.();
      }, duration + 100);
    }
    
    prevFilterRef.current = activeFilter;
  }, [activeFilter, duration, isLightMode, prefersReducedMotion, onPulseComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={`filter-pulse-container ${className}`}>
      {children}
      
      {/* Render active pulses */}
      {pulses.map(pulse => (
        <FilterPulseWave
          key={pulse.id}
          x={pulse.x}
          y={pulse.y}
          color={pulse.color}
          duration={duration}
          maxScale={maxScale}
        />
      ))}
      
      <style jsx>{`
        .filter-pulse-container {
          position: relative;
        }
      `}</style>
    </div>
  );
}

/**
 * Individual pulse wave element
 */
interface FilterPulseWaveProps {
  x: number;
  y: number;
  color: string;
  duration: number;
  maxScale: number;
}

function FilterPulseWave({ x, y, color, duration, maxScale }: FilterPulseWaveProps) {
  return (
    <div
      className="filter-pulse-wave"
      style={{
        '--pulse-x': `${x}px`,
        '--pulse-y': `${y}px`,
        '--pulse-color': color,
        '--pulse-duration': `${duration}ms`,
        '--pulse-max-scale': maxScale,
      } as React.CSSProperties}
    >
      <style jsx>{`
        .filter-pulse-wave {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 9998;
          overflow: hidden;
        }
        
        .filter-pulse-wave::before {
          content: '';
          position: absolute;
          left: var(--pulse-x);
          top: var(--pulse-y);
          width: 100px;
          height: 100px;
          margin-left: -50px;
          margin-top: -50px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            var(--pulse-color) 0%,
            transparent 70%
          );
          transform: scale(0);
          opacity: 1;
          animation: filterPulseExpand var(--pulse-duration) cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
        }
        
        @keyframes filterPulseExpand {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          30% {
            opacity: 0.8;
          }
          100% {
            transform: scale(calc(var(--pulse-max-scale) * 20));
            opacity: 0;
          }
        }
        
        /* Add a subtle ring at the leading edge */
        .filter-pulse-wave::after {
          content: '';
          position: absolute;
          left: var(--pulse-x);
          top: var(--pulse-y);
          width: 100px;
          height: 100px;
          margin-left: -50px;
          margin-top: -50px;
          border-radius: 50%;
          border: 2px solid var(--pulse-color);
          transform: scale(0);
          opacity: 0.5;
          animation: filterPulseRing var(--pulse-duration) cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
        }
        
        @keyframes filterPulseRing {
          0% {
            transform: scale(0);
            opacity: 0.6;
            border-width: 3px;
          }
          100% {
            transform: scale(calc(var(--pulse-max-scale) * 20));
            opacity: 0;
            border-width: 1px;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Hook for triggering filter pulses imperatively
 */
export function useFilterPulse() {
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const pulseIdRef = useRef(0);
  
  const triggerPulse = useCallback((
    x: number,
    y: number,
    filter: FilterType,
    isLightMode = false,
    duration = 600
  ) => {
    const colors = isLightMode ? FILTER_COLORS_LIGHT : FILTER_COLORS;
    const color = colors[filter];
    
    const newPulse: Pulse = {
      id: pulseIdRef.current++,
      x,
      y,
      color,
      timestamp: Date.now(),
    };
    
    setPulses(prev => [...prev, newPulse]);
    
    setTimeout(() => {
      setPulses(prev => prev.filter(p => p.id !== newPulse.id));
    }, duration + 100);
  }, []);
  
  const PulseContainer = useCallback(({ duration = 600, maxScale = 3 }: { duration?: number; maxScale?: number }) => (
    <>
      {pulses.map(pulse => (
        <FilterPulseWave
          key={pulse.id}
          x={pulse.x}
          y={pulse.y}
          color={pulse.color}
          duration={duration}
          maxScale={maxScale}
        />
      ))}
    </>
  ), [pulses]);
  
  return { triggerPulse, PulseContainer, hasPulses: pulses.length > 0 };
}

/**
 * FilterPulseIndicator - Compact visual indicator for filter state
 * Shows a small pulsing dot in the filter color when active
 */
export function FilterPulseIndicator({ 
  filter, 
  isActive = true,
  className = '' 
}: { 
  filter: FilterType; 
  isActive?: boolean;
  className?: string;
}) {
  if (!isActive || filter === 'all') return null;
  
  const colors: Record<Exclude<FilterType, 'all'>, string> = {
    beat: '#22c55e',
    miss: '#ef4444',
    pending: '#f59e0b',
  };
  
  const color = colors[filter as Exclude<FilterType, 'all'>];
  
  return (
    <span 
      className={`filter-pulse-indicator ${className}`}
      style={{ '--indicator-color': color } as React.CSSProperties}
    >
      <style jsx>{`
        .filter-pulse-indicator {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--indicator-color);
          animation: filterIndicatorPulse 2s ease-in-out infinite;
          box-shadow: 0 0 8px var(--indicator-color);
        }
        
        @keyframes filterIndicatorPulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.2);
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .filter-pulse-indicator {
            animation: none;
          }
        }
      `}</style>
    </span>
  );
}

export default FilterPulse;
