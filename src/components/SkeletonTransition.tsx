'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';

/**
 * SkeletonTransition - Premium crossfade from skeleton to content
 * 
 * Provides a smooth, layered transition when content finishes loading,
 * avoiding the jarring instant-swap that can feel cheap.
 * 
 * Inspiration:
 * - Linear.app's butter-smooth loading states
 * - Notion's fade-in page transitions
 * - iOS skeleton → content animations
 * - "Progressive Reveal" pattern from Material Design 3
 * 
 * Features:
 * - Layered crossfade (skeleton fades out as content fades in)
 * - Optional scale animation (content scales up slightly)
 * - Optional blur-to-sharp effect (content unblurs as it enters)
 * - Configurable timing and easing
 * - Respects prefers-reduced-motion
 * - GPU-accelerated with will-change hints
 * 
 * Usage:
 * <SkeletonTransition
 *   loading={isLoading}
 *   skeleton={<SkeletonCalendar />}
 *   duration={500}
 *   blur={true}
 *   scale={true}
 * >
 *   <ActualContent />
 * </SkeletonTransition>
 */

interface SkeletonTransitionProps {
  /** Whether content is still loading */
  loading: boolean;
  /** Skeleton placeholder component */
  skeleton: ReactNode;
  /** Actual content to show when loaded */
  children: ReactNode;
  /** Animation duration in ms */
  duration?: number;
  /** Enable blur-to-sharp effect on content */
  blur?: boolean;
  /** Enable scale-up effect on content */
  scale?: boolean;
  /** Custom easing function */
  easing?: string;
  /** Delay before starting exit animation (ms) */
  exitDelay?: number;
  /** Additional class name */
  className?: string;
}

export function SkeletonTransition({
  loading,
  skeleton,
  children,
  duration = 450,
  blur = true,
  scale = true,
  easing = 'cubic-bezier(0.22, 1, 0.36, 1)', // easeOutQuint
  exitDelay = 50,
  className = '',
}: SkeletonTransitionProps) {
  const [phase, setPhase] = useState<'loading' | 'transitioning' | 'complete'>(
    loading ? 'loading' : 'complete'
  );
  const [showSkeleton, setShowSkeleton] = useState(loading);
  const [showContent, setShowContent] = useState(!loading);
  const prefersReducedMotion = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mediaQuery.matches;
    
    const handler = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Handle loading state changes
  useEffect(() => {
    // Clear any pending timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (loading) {
      // Reset to loading state
      setPhase('loading');
      setShowSkeleton(true);
      setShowContent(false);
    } else {
      // Start transition from skeleton to content
      if (prefersReducedMotion.current) {
        // Instant swap for reduced motion
        setPhase('complete');
        setShowSkeleton(false);
        setShowContent(true);
      } else {
        // Begin transition phase
        setPhase('transitioning');
        setShowContent(true);

        // After exit delay, start fading out skeleton
        timeoutRef.current = setTimeout(() => {
          // Content is now animating in, start skeleton exit
          timeoutRef.current = setTimeout(() => {
            setShowSkeleton(false);
            setPhase('complete');
          }, duration);
        }, exitDelay);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [loading, duration, exitDelay]);

  // Calculate animation styles
  const skeletonStyle = {
    '--transition-duration': `${duration}ms`,
    '--transition-easing': easing,
  } as React.CSSProperties;

  const contentStyle = {
    '--transition-duration': `${duration}ms`,
    '--transition-easing': easing,
    '--blur-amount': blur ? '8px' : '0px',
    '--scale-amount': scale ? '0.98' : '1',
  } as React.CSSProperties;

  return (
    <div className={`skeleton-transition-container ${className}`}>
      {/* Skeleton layer */}
      {showSkeleton && (
        <div
          className={`skeleton-transition-layer skeleton-layer ${
            phase === 'transitioning' ? 'exiting' : ''
          }`}
          style={skeletonStyle}
          aria-hidden={phase !== 'loading'}
        >
          {skeleton}
        </div>
      )}

      {/* Content layer */}
      {showContent && (
        <div
          className={`skeleton-transition-layer content-layer ${
            phase === 'transitioning' ? 'entering' : ''
          } ${phase === 'complete' ? 'complete' : ''} ${blur ? 'with-blur' : ''} ${
            scale ? 'with-scale' : ''
          }`}
          style={contentStyle}
        >
          {children}
        </div>
      )}

      <style jsx>{`
        .skeleton-transition-container {
          position: relative;
          min-height: 100vh;
        }

        .skeleton-transition-layer {
          will-change: opacity, transform, filter;
        }

        .skeleton-layer {
          position: relative;
          z-index: 1;
        }

        .skeleton-layer.exiting {
          position: absolute;
          inset: 0;
          animation: skeleton-exit var(--transition-duration) var(--transition-easing)
            forwards;
          pointer-events: none;
        }

        .content-layer {
          position: relative;
          z-index: 2;
        }

        .content-layer.entering {
          animation: content-enter var(--transition-duration) var(--transition-easing)
            forwards;
        }

        .content-layer.entering.with-blur {
          animation: content-enter-blur var(--transition-duration)
            var(--transition-easing) forwards;
        }

        .content-layer.entering.with-scale {
          animation: content-enter-scale var(--transition-duration)
            var(--transition-easing) forwards;
        }

        .content-layer.entering.with-blur.with-scale {
          animation: content-enter-full var(--transition-duration)
            var(--transition-easing) forwards;
        }

        .content-layer.complete {
          opacity: 1;
          transform: none;
          filter: none;
        }

        @keyframes skeleton-exit {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(1.01);
          }
        }

        @keyframes content-enter {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes content-enter-blur {
          0% {
            opacity: 0;
            filter: blur(var(--blur-amount));
          }
          100% {
            opacity: 1;
            filter: blur(0px);
          }
        }

        @keyframes content-enter-scale {
          0% {
            opacity: 0;
            transform: scale(var(--scale-amount));
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes content-enter-full {
          0% {
            opacity: 0;
            filter: blur(var(--blur-amount));
            transform: scale(var(--scale-amount));
          }
          50% {
            opacity: 0.8;
            filter: blur(calc(var(--blur-amount) * 0.3));
          }
          100% {
            opacity: 1;
            filter: blur(0px);
            transform: scale(1);
          }
        }

        /* Reduced motion - instant swap, no animations */
        @media (prefers-reduced-motion: reduce) {
          .skeleton-layer.exiting,
          .content-layer.entering,
          .content-layer.entering.with-blur,
          .content-layer.entering.with-scale,
          .content-layer.entering.with-blur.with-scale {
            animation: none;
          }

          .skeleton-layer.exiting {
            opacity: 0;
          }

          .content-layer.entering,
          .content-layer.complete {
            opacity: 1;
            transform: none;
            filter: none;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * useSkeletonTransition - Hook version for more control
 * 
 * Returns className and style props to apply to your own elements.
 */
export function useSkeletonTransition(
  loading: boolean,
  options: {
    duration?: number;
    blur?: boolean;
    scale?: boolean;
    easing?: string;
  } = {}
) {
  const { duration = 450, blur = true, scale = true, easing = 'cubic-bezier(0.22, 1, 0.36, 1)' } =
    options;

  const [phase, setPhase] = useState<'loading' | 'transitioning' | 'complete'>(
    loading ? 'loading' : 'complete'
  );
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (loading) {
      setPhase('loading');
    } else if (phase === 'loading') {
      if (prefersReducedMotion.current) {
        setPhase('complete');
      } else {
        setPhase('transitioning');
        const timer = setTimeout(() => setPhase('complete'), duration);
        return () => clearTimeout(timer);
      }
    }
  }, [loading, duration, phase]);

  const getSkeletonProps = () => ({
    className: `skeleton-transition-target ${phase === 'transitioning' ? 'skeleton-exiting' : ''}`,
    style: {
      '--st-duration': `${duration}ms`,
      '--st-easing': easing,
    } as React.CSSProperties,
    'aria-hidden': phase !== 'loading',
  });

  const getContentProps = () => ({
    className: `skeleton-transition-target ${
      phase === 'transitioning' ? 'content-entering' : ''
    } ${blur ? 'st-blur' : ''} ${scale ? 'st-scale' : ''}`,
    style: {
      '--st-duration': `${duration}ms`,
      '--st-easing': easing,
      '--st-blur': blur ? '8px' : '0px',
      '--st-scale': scale ? '0.98' : '1',
    } as React.CSSProperties,
  });

  return {
    phase,
    isLoading: phase === 'loading',
    isTransitioning: phase === 'transitioning',
    isComplete: phase === 'complete',
    getSkeletonProps,
    getContentProps,
  };
}

export default SkeletonTransition;
