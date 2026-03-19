'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * PerceivedProgressBar - Fake-but-believable loading progress
 * 
 * A progress bar that uses psychological timing to feel natural and trustworthy.
 * Instead of showing actual loading progress (which would be jumpy), this shows
 * smooth, eased progress that builds user confidence.
 * 
 * Based on 2026 UI Trend from Tubik Studio:
 * "Artificially delaying writes can give users more confidence that their 
 * changes went through. Perceived reliability beats actual speed."
 * 
 * Pattern: Progress starts slow, accelerates through middle, then holds at ~85%
 * until content is ready, then rushes to 100% with satisfying completion.
 * 
 * Psychology:
 * - Slow start = "System is carefully initializing"
 * - Fast middle = "Good progress is being made"
 * - Hold at 85% = "Almost there, finishing up details"
 * - Rush to 100% = "Done! Satisfying completion"
 * 
 * Features:
 * - Natural cubic easing curve
 * - Glow pulse effect at key thresholds
 * - Completion burst animation
 * - Respects prefers-reduced-motion
 * - GPU-accelerated transforms
 */

interface PerceivedProgressBarProps {
  /** Whether content is still loading */
  loading: boolean;
  /** Height of the progress bar in pixels */
  height?: number;
  /** Primary color of the progress bar */
  color?: string;
  /** Glow color (defaults to color with alpha) */
  glowColor?: string;
  /** Duration to reach ~85% in ms (before waiting for completion) */
  fillDuration?: number;
  /** Duration of the final 85% → 100% animation */
  completeDuration?: number;
  /** Whether to show glow effect */
  showGlow?: boolean;
  /** Whether to show shimmer effect */
  showShimmer?: boolean;
  /** Border radius */
  borderRadius?: number;
  /** Additional class name */
  className?: string;
  /** Callback when progress reaches 100% */
  onComplete?: () => void;
  /** Whether to auto-hide after completion */
  autoHide?: boolean;
  /** Delay before hiding after completion (ms) */
  hideDelay?: number;
  /** Show percentage text */
  showPercentage?: boolean;
  /** Style variant */
  variant?: 'default' | 'minimal' | 'thick' | 'branded';
}

// Easing function: slow start, fast middle, slow end (ease-in-out-cubic variant)
function easeProgress(t: number): number {
  // Custom curve that holds longer at the end
  if (t < 0.4) {
    // Slow start (0-40% time → 0-30% progress)
    return (t / 0.4) * (t / 0.4) * 0.3;
  } else if (t < 0.7) {
    // Fast middle (40-70% time → 30-75% progress)
    const midT = (t - 0.4) / 0.3;
    return 0.3 + midT * 0.45;
  } else {
    // Slow approach to 85% (70-100% time → 75-85% progress)
    const endT = (t - 0.7) / 0.3;
    return 0.75 + endT * endT * 0.1;
  }
}

export function PerceivedProgressBar({
  loading,
  height = 4,
  color = '#3b82f6',
  glowColor,
  fillDuration = 3000,
  completeDuration = 300,
  showGlow = true,
  showShimmer = true,
  borderRadius = 2,
  className = '',
  onComplete,
  autoHide = true,
  hideDelay = 500,
  showPercentage = false,
  variant = 'default',
}: PerceivedProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showBurst, setShowBurst] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const prefersReducedMotion = useRef(false);

  // Resolve glow color
  const resolvedGlowColor = glowColor || color;

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Animation loop for fake progress
  const animate = useCallback((timestamp: number) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const elapsed = timestamp - startTimeRef.current;
    const t = Math.min(elapsed / fillDuration, 1);
    
    // Use easing function for natural feel
    const easedProgress = easeProgress(t) * 100;
    setProgress(easedProgress);

    // Continue animating until we hit the target or loading completes
    if (t < 1) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [fillDuration]);

  // Handle loading state changes
  useEffect(() => {
    if (loading) {
      // Reset and start
      setProgress(0);
      setIsComplete(false);
      setIsCompleting(false);
      setShowBurst(false);
      setIsVisible(true);
      startTimeRef.current = 0;

      if (prefersReducedMotion.current) {
        // For reduced motion, just show indeterminate
        setProgress(50);
      } else {
        // Start animation loop
        animationRef.current = requestAnimationFrame(animate);
      }
    } else if (isVisible && !isComplete) {
      // Loading finished - rush to 100%
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      setIsCompleting(true);
      
      if (prefersReducedMotion.current) {
        // Instant completion for reduced motion
        setProgress(100);
        setIsComplete(true);
        onComplete?.();
        if (autoHide) {
          setTimeout(() => setIsVisible(false), hideDelay);
        }
      } else {
        // Animate to 100%
        const currentProgress = progress;
        const startTime = performance.now();
        
        const completeAnimation = (timestamp: number) => {
          const elapsed = timestamp - startTime;
          const t = Math.min(elapsed / completeDuration, 1);
          // Ease out for satisfying finish
          const eased = 1 - Math.pow(1 - t, 3);
          setProgress(currentProgress + (100 - currentProgress) * eased);
          
          if (t < 1) {
            requestAnimationFrame(completeAnimation);
          } else {
            setProgress(100);
            setShowBurst(true);
            setTimeout(() => {
              setIsComplete(true);
              setIsCompleting(false);
              onComplete?.();
              
              if (autoHide) {
                setTimeout(() => {
                  setIsVisible(false);
                  setShowBurst(false);
                }, hideDelay);
              }
            }, 150);
          }
        };
        
        requestAnimationFrame(completeAnimation);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [loading, animate, completeDuration, onComplete, autoHide, hideDelay, isVisible, isComplete, progress]);

  // Variant styles
  const variantStyles = {
    default: { h: height, br: borderRadius },
    minimal: { h: 2, br: 1 },
    thick: { h: 6, br: 3 },
    branded: { h: 4, br: 2 },
  };

  const { h, br } = variantStyles[variant];

  if (!isVisible) return null;

  return (
    <div 
      className={`perceived-progress-bar ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Loading progress"
    >
      {/* Track */}
      <div 
        className="ppb-track"
        style={{
          height: h,
          borderRadius: br,
        }}
      >
        {/* Fill */}
        <div 
          className={`ppb-fill ${isCompleting ? 'completing' : ''} ${isComplete ? 'complete' : ''}`}
          style={{
            width: `${progress}%`,
            backgroundColor: color,
            borderRadius: br,
            ['--ppb-color' as string]: color,
            ['--ppb-glow-color' as string]: resolvedGlowColor,
          }}
        >
          {/* Shimmer effect */}
          {showShimmer && !isComplete && (
            <div className="ppb-shimmer" />
          )}
          
          {/* Glow effect at leading edge */}
          {showGlow && (
            <div 
              className="ppb-glow"
              style={{
                backgroundColor: resolvedGlowColor,
              }}
            />
          )}
        </div>

        {/* Completion burst */}
        {showBurst && (
          <div 
            className="ppb-burst"
            style={{
              backgroundColor: color,
            }}
          />
        )}
      </div>

      {/* Optional percentage display */}
      {showPercentage && (
        <div className="ppb-percentage">
          {Math.round(progress)}%
        </div>
      )}

      <style jsx>{`
        .perceived-progress-bar {
          width: 100%;
          position: relative;
        }

        .ppb-track {
          width: 100%;
          background: rgba(255, 255, 255, 0.08);
          overflow: hidden;
          position: relative;
        }

        .ppb-fill {
          height: 100%;
          position: relative;
          transition: width 0.1s linear;
          will-change: width;
        }

        .ppb-fill.completing {
          transition: width ${completeDuration}ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .ppb-fill.complete {
          transition: none;
        }

        /* Shimmer effect - diagonal sweep */
        .ppb-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.3) 50%,
            transparent 100%
          );
          animation: ppb-shimmer 1.5s ease-in-out infinite;
          transform: translateX(-100%);
        }

        @keyframes ppb-shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        /* Glow at leading edge */
        .ppb-glow {
          position: absolute;
          right: -4px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 200%;
          border-radius: 50%;
          filter: blur(8px);
          opacity: 0.7;
          animation: ppb-glow-pulse 1s ease-in-out infinite;
        }

        @keyframes ppb-glow-pulse {
          0%, 100% {
            opacity: 0.5;
            transform: translateY(-50%) scale(0.9);
          }
          50% {
            opacity: 0.8;
            transform: translateY(-50%) scale(1.1);
          }
        }

        /* Completion burst */
        .ppb-burst {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 100%;
          height: 400%;
          border-radius: 50%;
          filter: blur(12px);
          opacity: 0;
          animation: ppb-burst 0.5s ease-out forwards;
        }

        @keyframes ppb-burst {
          0% {
            opacity: 0.6;
            transform: translateY(-50%) scaleX(0.5);
          }
          100% {
            opacity: 0;
            transform: translateY(-50%) scaleX(1.5);
          }
        }

        /* Percentage display */
        .ppb-percentage {
          position: absolute;
          right: 0;
          top: -20px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted, #71717a);
          font-variant-numeric: tabular-nums;
          font-family: var(--font-mono, monospace);
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .ppb-fill {
            transition: width 0.3s ease;
          }

          .ppb-shimmer,
          .ppb-glow,
          .ppb-burst {
            animation: none;
            display: none;
          }
        }

        /* Light mode adjustments */
        :global(html.light) .ppb-track {
          background: rgba(0, 0, 0, 0.08);
        }

        :global(html.light) .ppb-shimmer {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.5) 50%,
            transparent 100%
          );
        }
      `}</style>
    </div>
  );
}

/**
 * PerceivedProgressBarInline - Compact inline version
 * For use in cards, buttons, or tight spaces
 */
export function PerceivedProgressBarInline({
  loading,
  color = '#3b82f6',
  className = '',
}: Pick<PerceivedProgressBarProps, 'loading' | 'color' | 'className'>) {
  return (
    <PerceivedProgressBar
      loading={loading}
      height={2}
      color={color}
      showGlow={false}
      showShimmer={true}
      showPercentage={false}
      borderRadius={1}
      fillDuration={2000}
      completeDuration={200}
      className={className}
    />
  );
}

/**
 * usePerceivedProgress - Hook for custom implementations
 * Returns the current progress value (0-100) with natural easing
 */
export function usePerceivedProgress(
  loading: boolean,
  options: {
    fillDuration?: number;
    completeDuration?: number;
    onComplete?: () => void;
  } = {}
) {
  const { fillDuration = 3000, completeDuration = 300, onComplete } = options;
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (loading) {
      setProgress(0);
      setIsComplete(false);
      startTimeRef.current = 0;

      const animate = (timestamp: number) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp;
        const elapsed = timestamp - startTimeRef.current;
        const t = Math.min(elapsed / fillDuration, 1);
        setProgress(easeProgress(t) * 100);
        if (t < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    } else if (!isComplete && progress > 0) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);

      const startProgress = progress;
      const startTime = performance.now();

      const complete = (timestamp: number) => {
        const elapsed = timestamp - startTime;
        const t = Math.min(elapsed / completeDuration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        setProgress(startProgress + (100 - startProgress) * eased);

        if (t < 1) {
          requestAnimationFrame(complete);
        } else {
          setProgress(100);
          setIsComplete(true);
          onComplete?.();
        }
      };

      requestAnimationFrame(complete);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [loading, fillDuration, completeDuration, onComplete, isComplete, progress]);

  return { progress, isComplete };
}

export default PerceivedProgressBar;
