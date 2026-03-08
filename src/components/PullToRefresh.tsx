'use client';

import { useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import { useHaptic } from './HapticFeedback';

/**
 * PullToRefresh - Mobile-first pull-to-refresh gesture
 * 
 * Features:
 * - Smooth rubber-band physics
 * - Animated spinner that morphs during pull
 * - Haptic feedback on pull threshold and refresh complete
 * - Respects reduced motion preferences
 * - Graceful fallback on non-touch devices
 */

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  /** Minimum pull distance to trigger refresh (px) */
  threshold?: number;
  /** Maximum pull distance with rubber band (px) */
  maxPull?: number;
  /** Enable/disable the feature */
  disabled?: boolean;
  /** Custom spinner color */
  color?: string;
  /** Class name for the container */
  className?: string;
}

// Rubber band physics - decays as you pull further
function rubberBand(distance: number, max: number, resistance: number = 0.5): number {
  if (distance <= 0) return 0;
  const ratio = distance / max;
  return max * (1 - Math.exp(-ratio * resistance));
}

export function PullToRefresh({
  children,
  onRefresh,
  threshold = 80,
  maxPull = 150,
  disabled = false,
  color = '#3b82f6',
  className = '',
}: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [hasTriggeredHaptic, setHasTriggeredHaptic] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);
  const { trigger: haptic } = useHaptic();

  // Check if we can start pulling (at top of scroll container)
  const canPull = useCallback(() => {
    if (disabled || isRefreshing) return false;
    // Check if scrolled to top
    return window.scrollY <= 0;
  }, [disabled, isRefreshing]);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!canPull()) return;
    startY.current = e.touches[0].pageY;
    currentY.current = startY.current;
    setHasTriggeredHaptic(false);
  }, [canPull]);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!canPull() && !isPulling) return;
    
    currentY.current = e.touches[0].pageY;
    const rawDistance = currentY.current - startY.current;
    
    // Only allow pulling down
    if (rawDistance <= 0) {
      setPullDistance(0);
      setIsPulling(false);
      return;
    }

    // Prevent default scrolling while pulling
    if (rawDistance > 10 && window.scrollY <= 0) {
      e.preventDefault();
      setIsPulling(true);
      
      // Apply rubber band physics
      const visualDistance = rubberBand(rawDistance, maxPull, 2);
      setPullDistance(visualDistance);
      
      // Haptic feedback when crossing threshold
      if (visualDistance >= threshold && !hasTriggeredHaptic) {
        haptic('medium');
        setHasTriggeredHaptic(true);
      } else if (visualDistance < threshold * 0.8 && hasTriggeredHaptic) {
        // Reset haptic trigger if they pull back
        setHasTriggeredHaptic(false);
      }
    }
  }, [canPull, isPulling, maxPull, threshold, hasTriggeredHaptic, haptic]);

  // Handle touch end
  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;
    
    if (pullDistance >= threshold) {
      // Trigger refresh
      setIsRefreshing(true);
      setPullDistance(threshold * 0.7); // Snap to loading position
      
      try {
        await onRefresh();
        haptic('success');
      } catch (error) {
        haptic('error');
        console.error('Pull to refresh failed:', error);
      }
      
      setIsRefreshing(false);
    }
    
    // Animate back to 0
    setPullDistance(0);
    setIsPulling(false);
    setHasTriggeredHaptic(false);
  }, [isPulling, pullDistance, threshold, onRefresh, haptic]);

  // Register touch event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Use passive: false for touchmove to allow preventDefault
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Calculate progress (0-1) for animations
  const progress = Math.min(pullDistance / threshold, 1);
  const pastThreshold = pullDistance >= threshold;

  return (
    <div ref={containerRef} className={`ptr-container ${className}`}>
      {/* Pull indicator */}
      <div 
        className="ptr-indicator"
        style={{
          transform: `translateY(${pullDistance - 60}px)`,
          opacity: isPulling || isRefreshing ? 1 : 0,
        }}
      >
        <div 
          className={`ptr-spinner ${isRefreshing ? 'refreshing' : ''} ${pastThreshold ? 'ready' : ''}`}
          style={{
            '--ptr-color': color,
            '--ptr-progress': progress,
            '--ptr-rotation': `${progress * 360}deg`,
          } as React.CSSProperties}
        >
          {/* Animated spinner SVG */}
          <svg 
            viewBox="0 0 50 50" 
            className="ptr-spinner-svg"
            style={{
              transform: `rotate(${progress * 360}deg) scale(${0.5 + progress * 0.5})`,
            }}
          >
            {/* Background circle */}
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeOpacity="0.2"
            />
            {/* Progress arc */}
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${progress * 125.6}, 125.6`}
              className={isRefreshing ? 'ptr-arc-spin' : ''}
              style={{
                transform: 'rotate(-90deg)',
                transformOrigin: 'center',
              }}
            />
            {/* Arrow indicator (when not refreshing) */}
            {!isRefreshing && (
              <g 
                className="ptr-arrow"
                style={{
                  transform: `translateY(${pastThreshold ? -2 : 2}px)`,
                  opacity: pastThreshold ? 1 : 0.6,
                }}
              >
                <path
                  d="M25 15 L25 35 M18 28 L25 35 L32 28"
                  fill="none"
                  stroke={color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    transform: pastThreshold ? 'rotate(180deg)' : 'none',
                    transformOrigin: 'center',
                    transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                />
              </g>
            )}
          </svg>
          
          {/* Status text */}
          <span className="ptr-text">
            {isRefreshing 
              ? 'Refreshing...' 
              : pastThreshold 
                ? 'Release to refresh' 
                : 'Pull to refresh'
            }
          </span>
        </div>
      </div>

      {/* Content with pull transform */}
      <div 
        className="ptr-content"
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Simplified hook for pull-to-refresh in custom implementations
 */
export function usePullToRefresh(
  onRefresh: () => Promise<void>,
  options: { threshold?: number; disabled?: boolean } = {}
) {
  const { threshold = 80, disabled = false } = options;
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const { trigger: haptic } = useHaptic();

  const handlePullStart = useCallback((y: number) => {
    if (disabled || isRefreshing) return;
    if (window.scrollY > 0) return;
    startY.current = y;
  }, [disabled, isRefreshing]);

  const handlePullMove = useCallback((y: number) => {
    if (disabled || isRefreshing) return;
    const distance = Math.max(0, y - startY.current);
    const visual = rubberBand(distance, 150, 2);
    setPullDistance(visual);
    return visual;
  }, [disabled, isRefreshing]);

  const handlePullEnd = useCallback(async () => {
    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      setPullDistance(threshold * 0.7);
      
      try {
        await onRefresh();
        haptic('success');
      } catch {
        haptic('error');
      }
      
      setIsRefreshing(false);
    }
    setPullDistance(0);
  }, [pullDistance, threshold, onRefresh, haptic]);

  return {
    pullDistance,
    isRefreshing,
    isPulling: pullDistance > 0,
    progress: Math.min(pullDistance / threshold, 1),
    handlers: {
      onPullStart: handlePullStart,
      onPullMove: handlePullMove,
      onPullEnd: handlePullEnd,
    },
  };
}
