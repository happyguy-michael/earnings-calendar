'use client';

import { useRef, useEffect, useCallback, ReactNode } from 'react';

interface SwipeNavigatorProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  className?: string;
}

export function SwipeNavigator({
  children,
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  className = '',
}: SwipeNavigatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const isSwiping = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchEndX.current = null;
    isSwiping.current = false;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = Math.abs(currentX - touchStartX.current);
    const diffY = Math.abs(currentY - touchStartY.current);
    
    // Only register as swipe if horizontal movement is greater than vertical
    // This prevents hijacking vertical scroll
    if (diffX > diffY && diffX > 10) {
      isSwiping.current = true;
    }
    
    touchEndX.current = currentX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (
      touchStartX.current === null ||
      touchEndX.current === null ||
      !isSwiping.current
    ) {
      touchStartX.current = null;
      touchStartY.current = null;
      touchEndX.current = null;
      return;
    }

    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && onSwipeLeft) {
        // Swiped left -> go to next week
        onSwipeLeft();
      } else if (diff < 0 && onSwipeRight) {
        // Swiped right -> go to previous week
        onSwipeRight();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    touchEndX.current = null;
    isSwiping.current = false;
  }, [threshold, onSwipeLeft, onSwipeRight]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

// Visual indicator component for swipe hint
export function SwipeHint({ visible }: { visible: boolean }) {
  if (!visible) return null;
  
  return (
    <div className="swipe-hint">
      <div className="swipe-hint-content">
        <svg className="swipe-hint-arrow left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        <span>Swipe to navigate weeks</span>
        <svg className="swipe-hint-arrow right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </div>
  );
}
