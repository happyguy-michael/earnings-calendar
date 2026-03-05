'use client';

import { useEffect, useState, useRef } from 'react';

/**
 * ScrollProgress - Premium scroll position indicator
 * 
 * A thin animated bar at the top of the viewport that fills as you scroll,
 * inspired by reading apps like Medium and premium dashboards like Linear.
 * 
 * Features:
 * - Smooth gradient fill with animated glow
 * - Respects reduced motion preferences
 * - Auto-hides when at top (optional)
 * - Light/dark mode compatible
 */

interface ScrollProgressProps {
  /** Height of the progress bar in pixels */
  height?: number;
  /** Whether to hide the bar when at the top of the page */
  hideAtTop?: boolean;
  /** Gradient colors for the progress bar */
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
  /** Whether to show glow effect */
  showGlow?: boolean;
  /** Z-index for stacking context */
  zIndex?: number;
}

export function ScrollProgress({
  height = 3,
  hideAtTop = true,
  gradientFrom = '#3b82f6',
  gradientVia = '#8b5cf6', 
  gradientTo = '#ec4899',
  showGlow = true,
  zIndex = 9999,
}: ScrollProgressProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(!hideAtTop);
  const rafRef = useRef<number | null>(null);
  const lastScrollRef = useRef(0);

  useEffect(() => {
    const calculateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      
      setProgress(Math.min(100, Math.max(0, scrollProgress)));
      
      // Show/hide based on scroll position
      if (hideAtTop) {
        setIsVisible(scrollTop > 10);
      }
      
      lastScrollRef.current = scrollTop;
    };

    const handleScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(calculateProgress);
    };

    // Calculate initial progress
    calculateProgress();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [hideAtTop]);

  // Generate unique ID for gradient
  const gradientId = 'scroll-progress-gradient';

  return (
    <div
      className="scroll-progress-container"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: `${height}px`,
        zIndex,
        pointerEvents: 'none',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Page scroll progress"
    >
      {/* Background track (subtle) */}
      <div
        className="scroll-progress-track"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(255, 255, 255, 0.03)',
        }}
      />
      
      {/* Progress fill */}
      <div
        className="scroll-progress-fill"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: `${progress}%`,
          background: `linear-gradient(90deg, ${gradientFrom}, ${gradientVia}, ${gradientTo})`,
          borderRadius: '0 2px 2px 0',
          transition: 'width 0.1s ease-out',
        }}
      >
        {/* Glow effect on the leading edge */}
        {showGlow && progress > 0 && (
          <div
            className="scroll-progress-glow"
            style={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              width: '20px',
              height: `${height * 4}px`,
              background: `radial-gradient(ellipse at right center, ${gradientTo}, transparent 70%)`,
              filter: 'blur(3px)',
              opacity: 0.8,
            }}
          />
        )}
        
        {/* Shimmer effect */}
        <div
          className="scroll-progress-shimmer"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'scroll-progress-shimmer 2s ease-in-out infinite',
          }}
        />
      </div>

      {/* Inline styles for animation */}
      <style jsx>{`
        @keyframes scroll-progress-shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .scroll-progress-fill {
            transition: none !important;
          }
          .scroll-progress-shimmer {
            animation: none !important;
          }
          .scroll-progress-container {
            transition: none !important;
          }
        }
        
        /* Light mode adjustments */
        :global(html.light) .scroll-progress-track {
          background: rgba(0, 0, 0, 0.03) !important;
        }
      `}</style>
    </div>
  );
}

/**
 * ScrollProgressCircle - Circular scroll progress indicator
 * 
 * Alternative variant that shows progress in a floating circle,
 * useful for mobile or when a top bar isn't appropriate.
 */
interface ScrollProgressCircleProps {
  size?: number;
  strokeWidth?: number;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  showPercentage?: boolean;
}

export function ScrollProgressCircle({
  size = 48,
  strokeWidth = 3,
  position = 'bottom-right',
  showPercentage = false,
}: ScrollProgressCircleProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let rafId: number | null = null;

    const calculateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      
      setProgress(Math.min(100, Math.max(0, scrollProgress)));
      setIsVisible(scrollTop > 100);
    };

    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(calculateProgress);
    };

    calculateProgress();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const positionStyles: Record<string, React.CSSProperties> = {
    'bottom-right': { bottom: 24, right: 24 },
    'bottom-left': { bottom: 24, left: 24 },
    'top-right': { top: 80, right: 24 },
    'top-left': { top: 80, left: 24 },
  };

  return (
    <div
      className="scroll-progress-circle"
      style={{
        position: 'fixed',
        ...positionStyles[position],
        width: size,
        height: size,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scale(1)' : 'scale(0.8)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="rgba(0,0,0,0.3)"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#scrollCircleGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.1s ease-out' }}
        />
        <defs>
          <linearGradient id="scrollCircleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
      
      {showPercentage && (
        <span
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            fontWeight: 600,
            color: 'white',
          }}
        >
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
}

export default ScrollProgress;
