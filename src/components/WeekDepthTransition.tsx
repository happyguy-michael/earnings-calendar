'use client';

import { useState, useEffect, useRef, useCallback, memo, ReactNode } from 'react';

/**
 * WeekDepthTransition - Cinematic depth-based transition between weeks
 * 
 * Creates a premium "camera focus pull" effect when navigating between weeks.
 * The outgoing week blurs and recedes while the incoming week sharpens and advances,
 * similar to a camera rack focus in film.
 * 
 * 2026 UI Trend: "Spatial Transitions" - depth-based animations that create
 * a sense of moving through 3D space rather than flat sliding.
 * 
 * Inspiration:
 * - Linear.app's depth-based view transitions
 * - Vercel's deployment state transitions
 * - iOS 18+ spatial navigation animations
 * - Film camera rack focus techniques
 * - Apple Vision Pro spatial UI patterns
 * 
 * Features:
 * - Blur + scale for depth perception (receding/approaching)
 * - Direction-aware: previous week recedes left, next week emerges right
 * - Subtle opacity fade for clean overlap
 * - Configurable transition duration and easing
 * - GPU-accelerated using transforms and filters
 * - Respects prefers-reduced-motion (falls back to simple fade)
 * - No layout shift during transition
 * 
 * @example
 * <WeekDepthTransition
 *   weekKey={`week-${weekStart.toISOString()}`}
 *   direction={direction} // 'next' | 'prev'
 * >
 *   <WeekContent />
 * </WeekDepthTransition>
 */

interface WeekDepthTransitionProps {
  children: ReactNode;
  /** Unique key for the current week (triggers transition when changed) */
  weekKey: string;
  /** Direction of navigation */
  direction: 'next' | 'prev' | null;
  /** Transition duration in ms */
  duration?: number;
  /** Maximum blur amount in px */
  maxBlur?: number;
  /** Scale factor for depth (1.0 = no scale, 0.95 = slight shrink) */
  depthScale?: number;
  /** Horizontal offset for directional movement in px */
  offsetX?: number;
  /** Custom class name */
  className?: string;
  /** Callback when transition completes */
  onTransitionEnd?: () => void;
}

const WeekDepthTransition = memo(function WeekDepthTransition({
  children,
  weekKey,
  direction,
  duration = 400,
  maxBlur = 8,
  depthScale = 0.96,
  offsetX = 40,
  className = '',
  onTransitionEnd,
}: WeekDepthTransitionProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentContent, setCurrentContent] = useState<ReactNode>(children);
  const [previousContent, setPreviousContent] = useState<ReactNode>(null);
  const [activeDirection, setActiveDirection] = useState<'next' | 'prev' | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const prevKeyRef = useRef(weekKey);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Handle week key changes - trigger transition
  useEffect(() => {
    if (weekKey === prevKeyRef.current) return;
    
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Store previous content and direction
    setPreviousContent(currentContent);
    setActiveDirection(direction);
    setIsTransitioning(true);
    
    // Update current content after a micro-delay to ensure smooth animation start
    requestAnimationFrame(() => {
      setCurrentContent(children);
    });
    
    // End transition after duration
    timeoutRef.current = setTimeout(() => {
      setIsTransitioning(false);
      setPreviousContent(null);
      setActiveDirection(null);
      onTransitionEnd?.();
    }, duration + 50); // Small buffer for animation completion
    
    prevKeyRef.current = weekKey;
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [weekKey, direction, children, currentContent, duration, onTransitionEnd]);

  // Update current content when children change without transition
  useEffect(() => {
    if (!isTransitioning) {
      setCurrentContent(children);
    }
  }, [children, isTransitioning]);

  // Calculate transform values based on direction
  const getExitTransform = () => {
    if (!activeDirection) return 'translate3d(0, 0, 0) scale(1)';
    const x = activeDirection === 'next' ? -offsetX : offsetX;
    return `translate3d(${x}px, 0, 0) scale(${depthScale})`;
  };

  const getEnterTransform = () => {
    if (!activeDirection) return 'translate3d(0, 0, 0) scale(1)';
    const x = activeDirection === 'next' ? offsetX : -offsetX;
    return `translate3d(${x}px, 0, 0) scale(${depthScale})`;
  };

  // Reduced motion: simple crossfade
  if (prefersReducedMotion) {
    return (
      <div 
        ref={containerRef}
        className={`week-depth-transition reduced-motion ${className}`}
        style={{
          position: 'relative',
          width: '100%',
        }}
      >
        <div
          style={{
            opacity: isTransitioning ? 0.5 : 1,
            transition: `opacity ${duration / 2}ms ease`,
          }}
        >
          {currentContent}
        </div>
      </div>
    );
  }

  return (
    <>
      <div 
        ref={containerRef}
        className={`week-depth-transition ${isTransitioning ? 'transitioning' : ''} ${className}`}
      >
        {/* Previous content - exits with blur and recede */}
        {isTransitioning && previousContent && (
          <div 
            className="week-depth-layer week-depth-exit"
            style={{
              '--exit-blur': `${maxBlur}px`,
              '--exit-transform': getExitTransform(),
              '--duration': `${duration}ms`,
            } as React.CSSProperties}
          >
            {previousContent}
          </div>
        )}

        {/* Current content - enters sharp and approaches */}
        <div 
          className={`week-depth-layer week-depth-current ${isTransitioning ? 'entering' : ''}`}
          style={{
            '--enter-blur': `${maxBlur}px`,
            '--enter-transform': getEnterTransform(),
            '--duration': `${duration}ms`,
          } as React.CSSProperties}
        >
          {currentContent}
        </div>

        {/* Depth fog overlay - subtle gradient during transition */}
        {isTransitioning && (
          <div 
            className="week-depth-fog"
            style={{
              '--fog-direction': activeDirection === 'next' ? '90deg' : '270deg',
              '--duration': `${duration}ms`,
            } as React.CSSProperties}
          />
        )}
      </div>

      <style jsx>{`
        .week-depth-transition {
          position: relative;
          width: 100%;
          perspective: 1200px;
          perspective-origin: center center;
        }

        .week-depth-layer {
          width: 100%;
          transform-style: preserve-3d;
          backface-visibility: hidden;
          will-change: transform, filter, opacity;
        }

        /* Exit animation - blur out and recede */
        .week-depth-exit {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1;
          animation: weekDepthExit var(--duration) cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes weekDepthExit {
          0% {
            opacity: 1;
            filter: blur(0);
            transform: translate3d(0, 0, 0) scale(1);
          }
          100% {
            opacity: 0;
            filter: blur(var(--exit-blur));
            transform: var(--exit-transform);
          }
        }

        /* Enter animation - sharpen and approach */
        .week-depth-current {
          position: relative;
          z-index: 2;
        }

        .week-depth-current.entering {
          animation: weekDepthEnter var(--duration) cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes weekDepthEnter {
          0% {
            opacity: 0;
            filter: blur(var(--enter-blur));
            transform: var(--enter-transform);
          }
          100% {
            opacity: 1;
            filter: blur(0);
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        /* Depth fog - subtle atmosphere during transition */
        .week-depth-fog {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 3;
          pointer-events: none;
          background: linear-gradient(
            var(--fog-direction),
            transparent 0%,
            rgba(10, 10, 15, 0.15) 30%,
            rgba(10, 10, 15, 0.15) 70%,
            transparent 100%
          );
          animation: weekDepthFog var(--duration) ease-out forwards;
        }

        @keyframes weekDepthFog {
          0% {
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

        /* Light mode adjustments */
        :global(html.light) .week-depth-fog {
          background: linear-gradient(
            var(--fog-direction),
            transparent 0%,
            rgba(248, 250, 252, 0.4) 30%,
            rgba(248, 250, 252, 0.4) 70%,
            transparent 100%
          );
        }

        /* Performance hint for non-transitioning state */
        .week-depth-transition:not(.transitioning) .week-depth-layer {
          will-change: auto;
        }

        /* Ensure content doesn't overflow during animation */
        .week-depth-transition.transitioning {
          overflow: hidden;
        }
      `}</style>
    </>
  );
});

/**
 * Hook to track navigation direction
 * Returns the direction based on comparing old and new date/index
 */
export function useNavigationDirection(
  currentValue: number | Date,
  onDirectionChange?: (direction: 'next' | 'prev') => void
): 'next' | 'prev' | null {
  const prevValueRef = useRef<number | Date | null>(null);
  const [direction, setDirection] = useState<'next' | 'prev' | null>(null);

  useEffect(() => {
    if (prevValueRef.current === null) {
      prevValueRef.current = currentValue;
      return;
    }

    const prev = prevValueRef.current instanceof Date 
      ? prevValueRef.current.getTime() 
      : prevValueRef.current;
    const curr = currentValue instanceof Date 
      ? currentValue.getTime() 
      : currentValue;

    if (curr !== prev) {
      const newDirection = curr > prev ? 'next' : 'prev';
      setDirection(newDirection);
      onDirectionChange?.(newDirection);
      
      // Reset direction after animation would complete
      const timeout = setTimeout(() => {
        setDirection(null);
      }, 500);
      
      prevValueRef.current = currentValue;
      return () => clearTimeout(timeout);
    }
  }, [currentValue, onDirectionChange]);

  return direction;
}

/**
 * WeekTransitionIndicator - Visual direction indicator during transition
 * Shows a subtle chevron indicating navigation direction
 */
interface WeekTransitionIndicatorProps {
  direction: 'next' | 'prev' | null;
  position?: 'left' | 'right' | 'center';
  size?: 'sm' | 'md' | 'lg';
}

export const WeekTransitionIndicator = memo(function WeekTransitionIndicator({
  direction,
  position = 'center',
  size = 'md',
}: WeekTransitionIndicatorProps) {
  if (!direction) return null;

  const sizes = {
    sm: { icon: 16, container: 32 },
    md: { icon: 24, container: 48 },
    lg: { icon: 32, container: 64 },
  };

  const { icon, container } = sizes[size];

  return (
    <div 
      className={`week-transition-indicator ${direction} ${position}`}
      style={{
        '--container-size': `${container}px`,
        '--icon-size': `${icon}px`,
      } as React.CSSProperties}
    >
      <svg 
        width={icon} 
        height={icon} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="week-transition-chevron"
      >
        {direction === 'next' ? (
          <path d="M9 18l6-6-6-6" />
        ) : (
          <path d="M15 18l-6-6 6-6" />
        )}
      </svg>

      <style jsx>{`
        .week-transition-indicator {
          position: fixed;
          top: 50%;
          transform: translateY(-50%);
          z-index: 100;
          width: var(--container-size);
          height: var(--container-size);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          color: rgba(59, 130, 246, 0.8);
          pointer-events: none;
          animation: indicatorPop 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .week-transition-indicator.left {
          left: 24px;
        }

        .week-transition-indicator.right {
          right: 24px;
        }

        .week-transition-indicator.center {
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .week-transition-indicator.next {
          right: 24px;
          left: auto;
        }

        .week-transition-indicator.prev {
          left: 24px;
          right: auto;
        }

        .week-transition-chevron {
          animation: chevronSlide 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .week-transition-indicator.next .week-transition-chevron {
          animation-name: chevronSlideRight;
        }

        .week-transition-indicator.prev .week-transition-chevron {
          animation-name: chevronSlideLeft;
        }

        @keyframes indicatorPop {
          0% {
            opacity: 0;
            transform: translateY(-50%) scale(0.8);
          }
          50% {
            opacity: 1;
            transform: translateY(-50%) scale(1.1);
          }
          100% {
            opacity: 0;
            transform: translateY(-50%) scale(1);
          }
        }

        @keyframes chevronSlideRight {
          0% {
            transform: translateX(-8px);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(4px);
            opacity: 0;
          }
        }

        @keyframes chevronSlideLeft {
          0% {
            transform: translateX(8px);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(-4px);
            opacity: 0;
          }
        }

        :global(html.light) .week-transition-indicator {
          background: rgba(59, 130, 246, 0.08);
          border-color: rgba(59, 130, 246, 0.15);
          color: rgba(59, 130, 246, 0.7);
        }

        @media (prefers-reduced-motion: reduce) {
          .week-transition-indicator,
          .week-transition-chevron {
            animation: none;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
});

export { WeekDepthTransition };
export default WeekDepthTransition;
