'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * NavigationProgress - Premium loading indicator
 * 
 * A smooth, animated progress bar that appears during page navigation.
 * Inspired by YouTube/GitHub-style loading indicators with gradient
 * glow effects for a premium feel.
 */

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const incrementRef = useRef<NodeJS.Timeout | null>(null);
  const prevPathRef = useRef(pathname);

  // Cleanup timeouts
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (incrementRef.current) {
      clearInterval(incrementRef.current);
      incrementRef.current = null;
    }
  }, []);

  // Start loading animation
  const startLoading = useCallback(() => {
    cleanup();
    setIsComplete(false);
    setIsLoading(true);
    setProgress(0);

    // Quick initial progress
    setTimeout(() => setProgress(15), 50);
    setTimeout(() => setProgress(30), 150);

    // Gradually increment progress (slowing down as it approaches 90%)
    let currentProgress = 30;
    incrementRef.current = setInterval(() => {
      currentProgress += Math.random() * 10 * (1 - currentProgress / 100);
      if (currentProgress >= 90) {
        currentProgress = 90;
        if (incrementRef.current) {
          clearInterval(incrementRef.current);
          incrementRef.current = null;
        }
      }
      setProgress(currentProgress);
    }, 300);
  }, [cleanup]);

  // Complete loading animation
  const completeLoading = useCallback(() => {
    cleanup();
    setProgress(100);
    setIsComplete(true);

    // Fade out after completion
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
      setIsComplete(false);
    }, 400);
  }, [cleanup]);

  // Watch for route changes
  useEffect(() => {
    // Only trigger on actual path changes, not initial mount
    if (prevPathRef.current !== pathname) {
      // Complete any existing loading
      completeLoading();
    }
    prevPathRef.current = pathname;
  }, [pathname, searchParams, completeLoading]);

  // Intercept click events on internal links to start loading
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (
        link &&
        link.href &&
        link.href.startsWith(window.location.origin) &&
        !link.target &&
        !link.download &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey
      ) {
        const url = new URL(link.href);
        if (url.pathname !== pathname) {
          startLoading();
        }
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [pathname, startLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  if (!isLoading) return null;

  return (
    <div 
      className="navigation-progress-container"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Page loading"
    >
      {/* Main progress bar */}
      <div 
        className={`navigation-progress-bar ${isComplete ? 'complete' : ''}`}
        style={{ 
          transform: `translateX(${progress - 100}%)`,
        }}
      />
      
      {/* Animated glow pulse at the leading edge */}
      {!isComplete && (
        <div 
          className="navigation-progress-glow"
          style={{ 
            left: `${progress}%`,
          }}
        />
      )}
      
      {/* Shimmer effect */}
      <div 
        className="navigation-progress-shimmer"
        style={{ 
          transform: `translateX(${progress - 100}%)`,
        }}
      />
    </div>
  );
}

/**
 * Alternative hook for manual control
 */
export function useNavigationProgress() {
  const [isLoading, setIsLoading] = useState(false);

  const start = useCallback(() => setIsLoading(true), []);
  const done = useCallback(() => setIsLoading(false), []);

  return { isLoading, start, done };
}
