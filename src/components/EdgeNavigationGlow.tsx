'use client';

import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useMotionPreferences } from '@/components/MotionPreferences';

interface EdgeNavigationGlowProps {
  /** Callback when user hovers on left edge long enough */
  onLeftHover?: () => void;
  /** Callback when user hovers on right edge long enough */
  onRightHover?: () => void;
  /** Width of edge detection zone in pixels */
  edgeWidth?: number;
  /** Glow intensity (0-1) */
  intensity?: number;
  /** Color for left/past glow */
  leftColor?: string;
  /** Color for right/future glow */
  rightColor?: string;
  /** Enable pulsing animation */
  pulse?: boolean;
  /** Pulse duration in ms */
  pulseDuration?: number;
  /** Show arrow indicators */
  showArrows?: boolean;
  /** Debounce time before triggering hover callback (ms) */
  hoverDelay?: number;
  /** Whether navigation is possible in each direction */
  canGoLeft?: boolean;
  canGoRight?: boolean;
  /** Z-index for overlay */
  zIndex?: number;
}

/**
 * EdgeNavigationGlow - Premium edge proximity navigation hint
 * 
 * Displays subtle glows on viewport edges when cursor approaches,
 * hinting at available navigation directions. Inspired by Apple's
 * edge-awareness interactions.
 */
export const EdgeNavigationGlow = memo(function EdgeNavigationGlow({
  onLeftHover,
  onRightHover,
  edgeWidth = 80,
  intensity = 0.4,
  leftColor = 'rgba(168, 85, 247, 0.5)', // Purple for past
  rightColor = 'rgba(59, 130, 246, 0.5)', // Blue for future
  pulse = true,
  pulseDuration = 2000,
  showArrows = true,
  hoverDelay = 800,
  canGoLeft = true,
  canGoRight = true,
  zIndex = 100,
}: EdgeNavigationGlowProps) {
  const { shouldAnimate } = useMotionPreferences();
  const prefersReducedMotion = !shouldAnimate('decorative');
  const [leftProximity, setLeftProximity] = useState(0);
  const [rightProximity, setRightProximity] = useState(0);
  const [leftHovering, setLeftHovering] = useState(false);
  const [rightHovering, setRightHovering] = useState(false);
  const leftTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rightTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rafRef = useRef<number | null>(null);

  // Track mouse position with RAF for smooth updates
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const { clientX } = e;
      const windowWidth = window.innerWidth;
      
      // Calculate proximity to each edge (0 = far, 1 = at edge)
      let leftProx = 0;
      let rightProx = 0;
      
      if (clientX < edgeWidth && canGoLeft) {
        leftProx = 1 - (clientX / edgeWidth);
      }
      
      if (clientX > windowWidth - edgeWidth && canGoRight) {
        rightProx = 1 - ((windowWidth - clientX) / edgeWidth);
      }
      
      setLeftProximity(leftProx);
      setRightProximity(rightProx);

      // Handle hover timing for left edge
      if (leftProx > 0.5) {
        if (!leftTimeoutRef.current && onLeftHover) {
          setLeftHovering(true);
          leftTimeoutRef.current = setTimeout(() => {
            onLeftHover();
            leftTimeoutRef.current = null;
          }, hoverDelay);
        }
      } else {
        if (leftTimeoutRef.current) {
          clearTimeout(leftTimeoutRef.current);
          leftTimeoutRef.current = null;
        }
        setLeftHovering(false);
      }

      // Handle hover timing for right edge
      if (rightProx > 0.5) {
        if (!rightTimeoutRef.current && onRightHover) {
          setRightHovering(true);
          rightTimeoutRef.current = setTimeout(() => {
            onRightHover();
            rightTimeoutRef.current = null;
          }, hoverDelay);
        }
      } else {
        if (rightTimeoutRef.current) {
          clearTimeout(rightTimeoutRef.current);
          rightTimeoutRef.current = null;
        }
        setRightHovering(false);
      }
    });
  }, [edgeWidth, canGoLeft, canGoRight, onLeftHover, onRightHover, hoverDelay]);

  // Clear on mouse leave
  const handleMouseLeave = useCallback(() => {
    setLeftProximity(0);
    setRightProximity(0);
    setLeftHovering(false);
    setRightHovering(false);
    
    if (leftTimeoutRef.current) {
      clearTimeout(leftTimeoutRef.current);
      leftTimeoutRef.current = null;
    }
    if (rightTimeoutRef.current) {
      clearTimeout(rightTimeoutRef.current);
      rightTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (leftTimeoutRef.current) {
        clearTimeout(leftTimeoutRef.current);
      }
      if (rightTimeoutRef.current) {
        clearTimeout(rightTimeoutRef.current);
      }
    };
  }, [handleMouseMove, handleMouseLeave]);

  // Don't render if reduced motion
  if (prefersReducedMotion) return null;

  const leftOpacity = leftProximity * intensity;
  const rightOpacity = rightProximity * intensity;

  return (
    <>
      {/* Left edge glow */}
      <div
        className="edge-navigation-glow edge-navigation-glow--left"
        style={{
          '--edge-opacity': leftOpacity,
          '--edge-color': leftColor,
          '--pulse-duration': `${pulseDuration}ms`,
          '--z-index': zIndex,
        } as React.CSSProperties}
        data-hovering={leftHovering}
        data-visible={leftProximity > 0}
        data-pulse={pulse && !prefersReducedMotion}
        aria-hidden="true"
      >
        {showArrows && leftProximity > 0.3 && (
          <div className="edge-navigation-glow__arrow">
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span className="edge-navigation-glow__label">Previous</span>
          </div>
        )}
      </div>

      {/* Right edge glow */}
      <div
        className="edge-navigation-glow edge-navigation-glow--right"
        style={{
          '--edge-opacity': rightOpacity,
          '--edge-color': rightColor,
          '--pulse-duration': `${pulseDuration}ms`,
          '--z-index': zIndex,
        } as React.CSSProperties}
        data-hovering={rightHovering}
        data-visible={rightProximity > 0}
        data-pulse={pulse && !prefersReducedMotion}
        aria-hidden="true"
      >
        {showArrows && rightProximity > 0.3 && (
          <div className="edge-navigation-glow__arrow">
            <span className="edge-navigation-glow__label">Next</span>
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        )}
      </div>

      <style jsx>{`
        .edge-navigation-glow {
          position: fixed;
          top: 0;
          bottom: 0;
          width: 120px;
          pointer-events: none;
          z-index: var(--z-index, 100);
          opacity: var(--edge-opacity, 0);
          transition: opacity 0.2s ease-out;
          display: flex;
          align-items: center;
        }

        .edge-navigation-glow--left {
          left: 0;
          background: linear-gradient(
            90deg,
            var(--edge-color) 0%,
            transparent 100%
          );
          justify-content: flex-start;
          padding-left: 16px;
        }

        .edge-navigation-glow--right {
          right: 0;
          background: linear-gradient(
            270deg,
            var(--edge-color) 0%,
            transparent 100%
          );
          justify-content: flex-end;
          padding-right: 16px;
        }

        .edge-navigation-glow[data-pulse="true"] {
          animation: edge-glow-pulse var(--pulse-duration, 2000ms) ease-in-out infinite;
        }

        .edge-navigation-glow[data-hovering="true"] {
          animation: edge-glow-intensify 0.3s ease-out forwards;
        }

        .edge-navigation-glow__arrow {
          display: flex;
          align-items: center;
          gap: 6px;
          color: white;
          opacity: 0;
          transform: translateX(0);
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .edge-navigation-glow--left .edge-navigation-glow__arrow {
          transform: translateX(-10px);
        }

        .edge-navigation-glow--right .edge-navigation-glow__arrow {
          transform: translateX(10px);
        }

        .edge-navigation-glow[data-visible="true"] .edge-navigation-glow__arrow {
          opacity: 0.9;
          transform: translateX(0);
        }

        .edge-navigation-glow[data-hovering="true"] .edge-navigation-glow__arrow {
          opacity: 1;
        }

        .edge-navigation-glow--left[data-hovering="true"] .edge-navigation-glow__arrow svg {
          animation: arrow-bounce-left 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
        }

        .edge-navigation-glow--right[data-hovering="true"] .edge-navigation-glow__arrow svg {
          animation: arrow-bounce-right 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
        }

        .edge-navigation-glow__label {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          white-space: nowrap;
        }

        .edge-navigation-glow__arrow svg {
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }

        @keyframes edge-glow-pulse {
          0%, 100% {
            filter: brightness(1);
          }
          50% {
            filter: brightness(1.2);
          }
        }

        @keyframes edge-glow-intensify {
          to {
            filter: brightness(1.4) saturate(1.2);
          }
        }

        @keyframes arrow-bounce-left {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(-4px);
          }
        }

        @keyframes arrow-bounce-right {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(4px);
          }
        }

        /* Touch devices don't need this */
        @media (hover: none) {
          .edge-navigation-glow {
            display: none;
          }
        }

        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .edge-navigation-glow {
            animation: none !important;
          }
          .edge-navigation-glow__arrow svg {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
});

export default EdgeNavigationGlow;
