'use client';

import { useState, useEffect, useRef, useCallback, memo, createContext, useContext, ReactNode } from 'react';

/**
 * SwipeFeedback - Real-time Visual Feedback During Swipe Gestures
 * 
 * 2026 Trend: "Kinetic Micro-interactions" - users expect immediate, continuous
 * feedback as they interact, not just end-state confirmations.
 * 
 * This component provides visual feedback during horizontal swipe gestures:
 * - Edge glow that intensifies based on swipe progress
 * - Directional arrow that emerges and animates
 * - Progress indicator showing distance to trigger threshold
 * - Haptic-style visual pulse when threshold is crossed
 * - Rubber-band effect when releasing before threshold
 * 
 * Features:
 * - Works seamlessly with SwipeNavigator
 * - GPU-accelerated animations (transform, opacity)
 * - Respects prefers-reduced-motion
 * - Light/dark mode support
 * - Mobile-first, touch-optimized
 * - No layout shift or jank
 * 
 * Inspiration:
 * - iOS Mail swipe actions (progress reveals content)
 * - Tinder card swipe feedback (color intensity)
 * - Linear.app drag interactions (smooth, responsive)
 * - Apple Maps bottom sheet (rubber-band physics)
 */

interface SwipeFeedbackContextValue {
  isActive: boolean;
  direction: 'left' | 'right' | null;
  progress: number; // 0 to 1
  isTriggered: boolean;
  startSwipe: (x: number) => void;
  updateSwipe: (x: number) => void;
  endSwipe: () => void;
}

const SwipeFeedbackContext = createContext<SwipeFeedbackContextValue | null>(null);

export function useSwipeFeedback() {
  const context = useContext(SwipeFeedbackContext);
  if (!context) {
    return {
      isActive: false,
      direction: null,
      progress: 0,
      isTriggered: false,
      startSwipe: () => {},
      updateSwipe: () => {},
      endSwipe: () => {},
    };
  }
  return context;
}

interface SwipeFeedbackProviderProps {
  children: ReactNode;
  /** Distance in px required to trigger action */
  threshold?: number;
  /** Whether swipe feedback is enabled */
  enabled?: boolean;
}

export function SwipeFeedbackProvider({
  children,
  threshold = 80,
  enabled = true,
}: SwipeFeedbackProviderProps) {
  const [isActive, setIsActive] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [progress, setProgress] = useState(0);
  const [isTriggered, setIsTriggered] = useState(false);
  const startXRef = useRef<number | null>(null);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }, []);

  const startSwipe = useCallback((x: number) => {
    if (!enabled) return;
    startXRef.current = x;
    setIsActive(true);
    setIsTriggered(false);
  }, [enabled]);

  const updateSwipe = useCallback((x: number) => {
    if (!enabled || startXRef.current === null) return;
    
    const diff = x - startXRef.current;
    const absDiff = Math.abs(diff);
    
    if (absDiff > 10) {
      setDirection(diff > 0 ? 'right' : 'left');
      const newProgress = Math.min(1, absDiff / threshold);
      setProgress(newProgress);
      
      // Mark as triggered when crossing threshold
      if (newProgress >= 1 && !isTriggered) {
        setIsTriggered(true);
      }
    }
  }, [enabled, threshold, isTriggered]);

  const endSwipe = useCallback(() => {
    // Animate out
    setIsActive(false);
    
    // Reset after animation
    const timer = setTimeout(() => {
      setDirection(null);
      setProgress(0);
      setIsTriggered(false);
      startXRef.current = null;
    }, prefersReducedMotion.current ? 0 : 200);
    
    return () => clearTimeout(timer);
  }, []);

  const value: SwipeFeedbackContextValue = {
    isActive,
    direction,
    progress,
    isTriggered,
    startSwipe,
    updateSwipe,
    endSwipe,
  };

  return (
    <SwipeFeedbackContext.Provider value={value}>
      {children}
    </SwipeFeedbackContext.Provider>
  );
}

/**
 * SwipeFeedbackOverlay - Visual overlay showing swipe progress
 */
interface SwipeFeedbackOverlayProps {
  /** Left edge color */
  leftColor?: string;
  /** Right edge color */
  rightColor?: string;
  /** Width of the edge glow zone */
  edgeWidth?: number;
  /** Show directional arrow */
  showArrow?: boolean;
  /** Show progress indicator */
  showProgress?: boolean;
}

export const SwipeFeedbackOverlay = memo(function SwipeFeedbackOverlay({
  leftColor = 'rgba(168, 85, 247, 0.6)',
  rightColor = 'rgba(59, 130, 246, 0.6)',
  edgeWidth = 100,
  showArrow = true,
  showProgress = true,
}: SwipeFeedbackOverlayProps) {
  const { isActive, direction, progress, isTriggered } = useSwipeFeedback();
  const [isExiting, setIsExiting] = useState(false);

  // Track exit animation
  useEffect(() => {
    if (!isActive && (direction !== null || progress > 0)) {
      setIsExiting(true);
      const timer = setTimeout(() => setIsExiting(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isActive, direction, progress]);

  // Don't render if nothing to show
  if (!isActive && !isExiting) return null;
  if (!direction) return null;

  const isLeft = direction === 'left';
  const edgeColor = isLeft ? leftColor : rightColor;
  const displayProgress = isExiting ? 0 : progress;
  
  // Eased progress for smoother visual
  const easedProgress = displayProgress < 0.5
    ? 2 * displayProgress * displayProgress
    : 1 - Math.pow(-2 * displayProgress + 2, 2) / 2;

  return (
    <>
      <div 
        className={`swipe-feedback-overlay ${isActive ? 'active' : ''} ${isExiting ? 'exiting' : ''} ${isTriggered ? 'triggered' : ''}`}
        aria-hidden="true"
      >
        {/* Edge glow */}
        <div 
          className={`swipe-edge-glow ${isLeft ? 'left' : 'right'}`}
          style={{
            '--edge-color': edgeColor,
            '--edge-width': `${edgeWidth}px`,
            '--progress': easedProgress,
            '--intensity': isTriggered ? 1 : easedProgress * 0.8,
          } as React.CSSProperties}
        />

        {/* Directional arrow */}
        {showArrow && progress > 0.2 && (
          <div 
            className={`swipe-arrow ${isLeft ? 'left' : 'right'}`}
            style={{
              '--progress': easedProgress,
              '--triggered': isTriggered ? 1 : 0,
            } as React.CSSProperties}
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5"
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              {isLeft ? (
                <path d="M5 12h14M12 5l7 7-7 7" />
              ) : (
                <path d="M19 12H5M12 19l-7-7 7-7" />
              )}
            </svg>
            {isTriggered && (
              <span className="swipe-arrow-label">
                {isLeft ? 'Next' : 'Previous'}
              </span>
            )}
          </div>
        )}

        {/* Progress indicator */}
        {showProgress && progress > 0.1 && (
          <div 
            className={`swipe-progress ${isLeft ? 'left' : 'right'}`}
            style={{
              '--progress': easedProgress,
            } as React.CSSProperties}
          >
            <div className="swipe-progress-track">
              <div 
                className={`swipe-progress-fill ${isTriggered ? 'complete' : ''}`}
                style={{ 
                  transform: `scaleX(${easedProgress})`,
                }}
              />
            </div>
          </div>
        )}

        {/* Trigger pulse */}
        {isTriggered && (
          <div className={`swipe-trigger-pulse ${isLeft ? 'left' : 'right'}`} />
        )}
      </div>

      <style jsx>{`
        .swipe-feedback-overlay {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 9998;
          overflow: hidden;
        }

        /* Edge glow effect */
        .swipe-edge-glow {
          position: absolute;
          top: 0;
          bottom: 0;
          width: var(--edge-width);
          opacity: calc(var(--intensity) * 0.9);
          transition: opacity 0.15s ease-out;
        }

        .swipe-edge-glow.left {
          right: 0;
          background: linear-gradient(
            to left,
            var(--edge-color),
            transparent
          );
        }

        .swipe-edge-glow.right {
          left: 0;
          background: linear-gradient(
            to right,
            var(--edge-color),
            transparent
          );
        }

        .swipe-feedback-overlay.exiting .swipe-edge-glow {
          opacity: 0;
          transition: opacity 0.2s ease-out;
        }

        /* Directional arrow */
        .swipe-arrow {
          position: absolute;
          top: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: white;
          transform: translateY(-50%);
          opacity: calc(var(--progress) * 1.2);
          filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
          transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .swipe-arrow.left {
          right: 24px;
          transform: translateY(-50%) translateX(calc((1 - var(--progress)) * 20px));
        }

        .swipe-arrow.right {
          left: 24px;
          transform: translateY(-50%) translateX(calc((var(--progress) - 1) * 20px));
        }

        .swipe-arrow svg {
          transform: scale(calc(0.8 + var(--progress) * 0.4));
          transition: transform 0.15s ease-out;
        }

        /* Arrow bounce when triggered */
        .swipe-feedback-overlay.triggered .swipe-arrow svg {
          animation: arrowBounce 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes arrowBounce {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1.1); }
        }

        .swipe-arrow-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          opacity: 0;
          transform: translateY(-4px);
          animation: labelReveal 0.25s ease-out forwards;
        }

        @keyframes labelReveal {
          to {
            opacity: 0.9;
            transform: translateY(0);
          }
        }

        /* Progress indicator */
        .swipe-progress {
          position: absolute;
          top: 50%;
          width: 60px;
          transform: translateY(-50%);
          opacity: calc(var(--progress) * 0.9);
        }

        .swipe-progress.left {
          right: 60px;
        }

        .swipe-progress.right {
          left: 60px;
        }

        .swipe-progress-track {
          height: 3px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
          overflow: hidden;
        }

        .swipe-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, rgba(255,255,255,0.6), white);
          border-radius: 2px;
          transform-origin: left center;
          transition: transform 0.1s ease-out;
        }

        .swipe-progress.right .swipe-progress-fill {
          transform-origin: right center;
        }

        .swipe-progress-fill.complete {
          background: white;
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
        }

        /* Trigger pulse effect */
        .swipe-trigger-pulse {
          position: absolute;
          top: 50%;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.3) 0%,
            transparent 70%
          );
          transform: translate(-50%, -50%) scale(0);
          animation: triggerPulse 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .swipe-trigger-pulse.left {
          right: 0;
          transform-origin: right center;
        }

        .swipe-trigger-pulse.right {
          left: 0;
          transform-origin: left center;
        }

        @keyframes triggerPulse {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }

        /* Exit animation */
        .swipe-feedback-overlay.exiting .swipe-arrow,
        .swipe-feedback-overlay.exiting .swipe-progress {
          opacity: 0;
          transition: opacity 0.15s ease-out;
        }

        /* Light mode */
        :global(html.light) .swipe-arrow {
          color: #374151;
          filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.1));
        }

        :global(html.light) .swipe-progress-track {
          background: rgba(0, 0, 0, 0.1);
        }

        :global(html.light) .swipe-progress-fill {
          background: linear-gradient(90deg, rgba(0,0,0,0.4), #374151);
        }

        :global(html.light) .swipe-progress-fill.complete {
          background: #374151;
          box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
        }

        :global(html.light) .swipe-trigger-pulse {
          background: radial-gradient(
            circle,
            rgba(0, 0, 0, 0.1) 0%,
            transparent 70%
          );
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .swipe-feedback-overlay,
          .swipe-edge-glow,
          .swipe-arrow,
          .swipe-progress,
          .swipe-progress-fill,
          .swipe-trigger-pulse {
            animation: none !important;
            transition: opacity 0.1s ease !important;
          }

          .swipe-arrow {
            transform: translateY(-50%) !important;
          }

          .swipe-arrow svg {
            transform: none !important;
          }
        }

        /* Hide on desktop (keyboard nav preferred) */
        @media (min-width: 1024px) and (pointer: fine) {
          .swipe-feedback-overlay {
            display: none;
          }
        }
      `}</style>
    </>
  );
});

/**
 * Enhanced SwipeNavigator with built-in feedback
 * Drop-in replacement that includes visual feedback
 */
interface SwipeNavigatorWithFeedbackProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  className?: string;
  /** Disable swipe feedback visuals */
  disableFeedback?: boolean;
}

export function SwipeNavigatorWithFeedback({
  children,
  onSwipeLeft,
  onSwipeRight,
  threshold = 80,
  className = '',
  disableFeedback = false,
}: SwipeNavigatorWithFeedbackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { startSwipe, updateSwipe, endSwipe } = useSwipeFeedback();
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isSwiping = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
    touchStartX.current = x;
    touchStartY.current = y;
    isSwiping.current = false;
    
    if (!disableFeedback) {
      startSwipe(x);
    }
  }, [startSwipe, disableFeedback]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = Math.abs(currentX - touchStartX.current);
    const diffY = Math.abs(currentY - touchStartY.current);
    
    // Only register as swipe if horizontal movement is greater than vertical
    if (diffX > diffY && diffX > 10) {
      isSwiping.current = true;
      if (!disableFeedback) {
        updateSwipe(currentX);
      }
    }
  }, [updateSwipe, disableFeedback]);

  const handleTouchEnd = useCallback(() => {
    if (!disableFeedback) {
      endSwipe();
    }
    
    if (
      touchStartX.current === null ||
      !isSwiping.current
    ) {
      touchStartX.current = null;
      touchStartY.current = null;
      return;
    }

    // Get final position from last known position
    // (We don't have touchEnd coordinates, so use the diff we tracked)
    touchStartX.current = null;
    touchStartY.current = null;
    isSwiping.current = false;
  }, [endSwipe, disableFeedback]);

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

export default SwipeFeedbackOverlay;
