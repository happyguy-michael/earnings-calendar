'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface ReadingProgressProps {
  /** Target element selector to track scroll progress */
  targetRef?: React.RefObject<HTMLElement | null>;
  /** Color scheme */
  color?: 'gradient' | 'blue' | 'purple' | 'green';
  /** Height of the progress bar */
  height?: number;
  /** Show percentage label */
  showLabel?: boolean;
  /** Position */
  position?: 'top' | 'bottom';
  /** Z-index */
  zIndex?: number;
}

export function ReadingProgress({
  targetRef,
  color = 'gradient',
  height = 3,
  showLabel = false,
  position = 'top',
  zIndex = 100,
}: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const rafRef = useRef<number | null>(null);

  const calculateProgress = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      let scrollProgress = 0;

      if (targetRef?.current) {
        // Calculate progress relative to a specific element
        const element = targetRef.current;
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + window.scrollY;
        const elementHeight = rect.height;
        const viewportHeight = window.innerHeight;
        
        // Start tracking when element enters viewport
        const scrolled = window.scrollY - elementTop + viewportHeight * 0.3;
        const total = elementHeight - viewportHeight * 0.4;
        
        if (scrolled < 0) {
          scrollProgress = 0;
        } else if (scrolled >= total) {
          scrollProgress = 100;
        } else {
          scrollProgress = (scrolled / total) * 100;
        }
        
        // Only show when element is in view
        setIsVisible(rect.top < viewportHeight && rect.bottom > 0);
      } else {
        // Calculate progress for entire page
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        setIsVisible(scrollTop > 100);
      }

      setProgress(Math.min(100, Math.max(0, scrollProgress)));
    });
  }, [targetRef]);

  useEffect(() => {
    calculateProgress();
    window.addEventListener('scroll', calculateProgress, { passive: true });
    window.addEventListener('resize', calculateProgress, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', calculateProgress);
      window.removeEventListener('resize', calculateProgress);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [calculateProgress]);

  const getColorStyle = () => {
    switch (color) {
      case 'gradient':
        return {
          background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
        };
      case 'blue':
        return { background: '#3b82f6' };
      case 'purple':
        return { background: '#8b5cf6' };
      case 'green':
        return { background: '#22c55e' };
      default:
        return {
          background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
        };
    }
  };

  return (
    <div
      className="reading-progress-container"
      style={{
        position: 'fixed',
        [position]: 0,
        left: 0,
        right: 0,
        height: `${height}px`,
        zIndex,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: 'none',
      }}
    >
      {/* Track */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(255, 255, 255, 0.05)',
        }}
      />
      
      {/* Progress bar */}
      <div
        className="reading-progress-bar"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: `${progress}%`,
          ...getColorStyle(),
          boxShadow: `0 0 10px ${color === 'green' ? 'rgba(34, 197, 94, 0.5)' : 'rgba(139, 92, 246, 0.5)'}`,
          transition: 'width 0.1s ease-out',
        }}
      />

      {/* Leading glow */}
      {progress > 0 && progress < 100 && (
        <div
          style={{
            position: 'absolute',
            top: '-2px',
            left: `${progress}%`,
            transform: 'translateX(-50%)',
            width: '20px',
            height: `${height + 4}px`,
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.8) 0%, transparent 70%)',
            filter: 'blur(2px)',
          }}
        />
      )}

      {/* Percentage label */}
      {showLabel && isVisible && (
        <div
          style={{
            position: 'fixed',
            [position]: `${height + 8}px`,
            right: '20px',
            background: 'rgba(20, 20, 30, 0.9)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '4px 10px',
            fontSize: '11px',
            fontWeight: 600,
            color: '#a1a1aa',
            fontVariantNumeric: 'tabular-nums',
            transition: 'opacity 0.3s ease',
            zIndex: zIndex + 1,
          }}
        >
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
}

// Lightweight inline variant for use within content areas
interface InlineProgressProps {
  progress: number;
  height?: number;
  showLabel?: boolean;
}

export function InlineReadingProgress({ progress, height = 2, showLabel = false }: InlineProgressProps) {
  return (
    <div className="inline-reading-progress" style={{ width: '100%' }}>
      <div
        style={{
          width: '100%',
          height: `${height}px`,
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: `${height}px`,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
            borderRadius: `${height}px`,
            transition: 'width 0.2s ease-out',
          }}
        />
      </div>
      {showLabel && (
        <div
          style={{
            marginTop: '4px',
            fontSize: '10px',
            color: '#71717a',
            textAlign: 'right',
          }}
        >
          {Math.round(progress)}% read
        </div>
      )}
    </div>
  );
}
