'use client';

import { useEffect, useRef, useCallback, useState, memo } from 'react';
import { usePathname } from 'next/navigation';

/**
 * ScrollPositionMemory - Remembers and restores scroll position across page navigations
 * 
 * A UX pattern seen in premium finance apps where users frequently navigate between
 * a list view (calendar) and detail pages (individual earnings reports). When returning
 * to the list, users expect to be at the same position they left from.
 * 
 * Inspired by:
 * - Twitter/X: returns to exact scroll position in timeline
 * - Reddit: preserves scroll position in feeds
 * - Bloomberg Terminal: maintains view state across navigation
 * - Linear.app: seamless back navigation with position memory
 * 
 * Features:
 * - Saves scroll position to sessionStorage before navigation
 * - Restores position when returning to the same path
 * - Shows subtle "Restored position" toast on restore
 * - Debounced save to avoid performance issues
 * - Clears stale positions after configurable timeout
 * - Respects prefers-reduced-motion for smooth scrolling
 * - SSR-safe with client-only execution
 * 
 * @example
 * // In layout.tsx
 * <ScrollPositionMemory 
 *   showRestoreIndicator={true}
 *   staleAfter={300000} // 5 minutes
 * />
 */

interface ScrollPositionMemoryProps {
  /** Show a subtle indicator when scroll position is restored */
  showRestoreIndicator?: boolean;
  /** Time in ms before saved positions are considered stale */
  staleAfter?: number;
  /** Storage key prefix */
  storageKey?: string;
  /** Debounce time for saving position */
  saveDebounce?: number;
  /** Smooth scroll to restored position */
  smoothRestore?: boolean;
  /** Delay before attempting restore (allows content to render) */
  restoreDelay?: number;
}

interface SavedPosition {
  y: number;
  timestamp: number;
  maxScroll: number;
}

const STORAGE_PREFIX = 'scroll-pos:';

function ScrollPositionMemoryComponent({
  showRestoreIndicator = true,
  staleAfter = 300000, // 5 minutes
  storageKey = '',
  saveDebounce = 100,
  smoothRestore = true,
  restoreDelay = 100,
}: ScrollPositionMemoryProps) {
  const pathname = usePathname();
  const [showIndicator, setShowIndicator] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasRestoredRef = useRef(false);
  const prefersReducedMotion = useRef(false);

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }, []);

  // Get storage key for current path
  const getKey = useCallback(() => {
    return STORAGE_PREFIX + (storageKey || pathname);
  }, [pathname, storageKey]);

  // Save current scroll position
  const savePosition = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const position: SavedPosition = {
        y: window.scrollY,
        timestamp: Date.now(),
        maxScroll: document.documentElement.scrollHeight - window.innerHeight,
      };
      
      // Only save if scrolled past a threshold (avoid saving at top)
      if (position.y > 100) {
        sessionStorage.setItem(getKey(), JSON.stringify(position));
      } else {
        // Clear saved position if at top
        sessionStorage.removeItem(getKey());
      }
    } catch {
      // Storage might be full or unavailable
    }
  }, [getKey]);

  // Debounced save on scroll
  const handleScroll = useCallback(() => {
    if (isRestoring) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(savePosition, saveDebounce);
  }, [savePosition, saveDebounce, isRestoring]);

  // Restore saved position
  const restorePosition = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (hasRestoredRef.current) return;
    
    try {
      const saved = sessionStorage.getItem(getKey());
      if (!saved) return;
      
      const position: SavedPosition = JSON.parse(saved);
      
      // Check if position is stale
      if (Date.now() - position.timestamp > staleAfter) {
        sessionStorage.removeItem(getKey());
        return;
      }
      
      // Check if page has enough content to scroll to
      const currentMaxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (currentMaxScroll < position.y * 0.5) {
        // Content might not have loaded yet, retry
        return false;
      }
      
      hasRestoredRef.current = true;
      setIsRestoring(true);
      
      // Scroll to position
      const behavior = smoothRestore && !prefersReducedMotion.current ? 'smooth' : 'instant';
      window.scrollTo({
        top: Math.min(position.y, currentMaxScroll),
        behavior,
      });
      
      // Show indicator
      if (showRestoreIndicator && position.y > 200) {
        setShowIndicator(true);
        setTimeout(() => setShowIndicator(false), 2000);
      }
      
      // Clear restoring flag after scroll completes
      setTimeout(() => setIsRestoring(false), 500);
      
      return true;
    } catch {
      // Storage read failed
      return false;
    }
  }, [getKey, staleAfter, smoothRestore, showRestoreIndicator]);

  // Set up scroll listener
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  // Restore position on mount with retry logic
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    hasRestoredRef.current = false;
    
    // Initial attempt after short delay
    const timer1 = setTimeout(() => {
      if (!restorePosition()) {
        // Retry after more content might have loaded
        setTimeout(() => {
          restorePosition();
        }, 200);
      }
    }, restoreDelay);
    
    return () => {
      clearTimeout(timer1);
    };
  }, [pathname, restoreDelay, restorePosition]);

  // Save position before navigation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleBeforeUnload = () => {
      savePosition();
    };
    
    // Intercept link clicks to save position
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (
        link &&
        link.href &&
        link.href.startsWith(window.location.origin) &&
        !link.target &&
        !e.ctrlKey &&
        !e.metaKey
      ) {
        savePosition();
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleClick, true);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleClick, true);
    };
  }, [savePosition]);

  // Render indicator
  if (!showIndicator) return null;

  return (
    <div
      className="scroll-position-indicator"
      role="status"
      aria-live="polite"
    >
      <svg 
        className="scroll-position-icon" 
        width="14" 
        height="14" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
      >
        <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="scroll-position-text">Restored position</span>
    </div>
  );
}

export const ScrollPositionMemory = memo(ScrollPositionMemoryComponent);

/**
 * Hook for programmatic scroll position management
 */
export function useScrollPositionMemory(key?: string) {
  const pathname = usePathname();
  const storageKey = STORAGE_PREFIX + (key || pathname);

  const save = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const position: SavedPosition = {
        y: window.scrollY,
        timestamp: Date.now(),
        maxScroll: document.documentElement.scrollHeight - window.innerHeight,
      };
      sessionStorage.setItem(storageKey, JSON.stringify(position));
    } catch {}
  }, [storageKey]);

  const restore = useCallback((smooth = true) => {
    if (typeof window === 'undefined') return false;
    
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (!saved) return false;
      
      const position: SavedPosition = JSON.parse(saved);
      const currentMaxScroll = document.documentElement.scrollHeight - window.innerHeight;
      
      window.scrollTo({
        top: Math.min(position.y, currentMaxScroll),
        behavior: smooth ? 'smooth' : 'instant',
      });
      
      return true;
    } catch {
      return false;
    }
  }, [storageKey]);

  const clear = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      sessionStorage.removeItem(storageKey);
    } catch {}
  }, [storageKey]);

  return { save, restore, clear };
}

export default ScrollPositionMemory;
