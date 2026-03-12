'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useMotionPreferences } from './MotionPreferences';

interface MarketMoodRingProps {
  /** Number of beats this week */
  beats: number;
  /** Number of misses this week */
  misses: number;
  /** Number of pending reports */
  pending?: number;
  /** Ring size in pixels */
  size?: number;
  /** Animation delay in ms */
  delay?: number;
  /** Whether to show the percentage label */
  showLabel?: boolean;
  /** Whether to show the legend tooltip */
  showTooltip?: boolean;
  /** Compact mode - smaller size, no label */
  compact?: boolean;
  className?: string;
}

/**
 * MarketMoodRing - Visual sentiment indicator for earnings week
 * 
 * A circular ring that displays the beat/miss ratio with an animated
 * gradient that shifts from red (misses) through amber (neutral) to 
 * green (beats). Inspired by mood rings and health app activity rings.
 * 
 * Features:
 * - Smooth color interpolation based on beat ratio
 * - Animated fill on mount with spring physics
 * - Pulsing glow for exceptional weeks (>80% or <20%)
 * - Pending indicator shows incomplete data
 * - Respects reduced motion preferences
 * - Light/dark mode support
 * 
 * @example
 * <MarketMoodRing beats={8} misses={2} pending={3} />
 */
export function MarketMoodRing({
  beats,
  misses,
  pending = 0,
  size = 48,
  delay = 0,
  showLabel = true,
  showTooltip = true,
  compact = false,
  className = '',
}: MarketMoodRingProps) {
  const { shouldAnimate } = useMotionPreferences();
  const [isVisible, setIsVisible] = useState(false);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const ringRef = useRef<HTMLDivElement>(null);
  
  // Calculate stats
  const total = beats + misses;
  const beatRatio = total > 0 ? beats / total : 0.5;
  const percentage = Math.round(beatRatio * 100);
  const hasData = total > 0;
  const isExceptional = percentage >= 80 || percentage <= 20;
  const isPending = pending > 0;
  
  // Determine mood label
  const getMoodLabel = () => {
    if (!hasData) return 'Awaiting';
    if (percentage >= 80) return 'Bullish';
    if (percentage >= 60) return 'Positive';
    if (percentage >= 40) return 'Neutral';
    if (percentage >= 20) return 'Bearish';
    return 'Rough';
  };
  
  // Color interpolation based on beat ratio
  const getColor = useMemo(() => {
    if (!hasData) return { main: '#71717a', glow: 'rgba(113, 113, 122, 0.4)' };
    
    // Gradient stops: red (0%) -> amber (50%) -> green (100%)
    if (beatRatio >= 0.7) {
      // Green zone: interpolate from yellow-green to pure green
      const t = (beatRatio - 0.7) / 0.3;
      return {
        main: `hsl(${100 + t * 40}, 70%, 50%)`,
        glow: `hsla(${100 + t * 40}, 70%, 50%, 0.5)`,
      };
    } else if (beatRatio >= 0.3) {
      // Amber zone: interpolate from orange to yellow-green
      const t = (beatRatio - 0.3) / 0.4;
      return {
        main: `hsl(${30 + t * 70}, 85%, 50%)`,
        glow: `hsla(${30 + t * 70}, 85%, 50%, 0.4)`,
      };
    } else {
      // Red zone: interpolate from red to orange
      const t = beatRatio / 0.3;
      return {
        main: `hsl(${t * 30}, 80%, 50%)`,
        glow: `hsla(${t * 30}, 80%, 50%, 0.5)`,
      };
    }
  }, [beatRatio, hasData]);
  
  // Intersection observer for scroll-triggered animation
  useEffect(() => {
    const element = ringRef.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    
    observer.observe(element);
    return () => observer.disconnect();
  }, [delay]);
  
  // Animate progress fill
  useEffect(() => {
    if (!isVisible || !shouldAnimate('essential')) {
      setAnimatedProgress(hasData ? 1 : 0);
      return;
    }
    
    const duration = 900;
    const startTime = performance.now();
    let animationFrame: number;
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Spring-like easing with slight overshoot
      const eased = 1 - Math.pow(1 - progress, 4);
      setAnimatedProgress(hasData ? eased : 0);
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isVisible, hasData, shouldAnimate]);
  
  // SVG dimensions
  const actualSize = compact ? 32 : size;
  const strokeWidth = compact ? 3 : 4;
  const radius = (actualSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference * (1 - animatedProgress);
  
  // Tooltip content
  const tooltipText = hasData
    ? `${beats} beat${beats !== 1 ? 's' : ''}, ${misses} miss${misses !== 1 ? 'es' : ''}${pending > 0 ? `, ${pending} pending` : ''}`
    : `${pending} pending report${pending !== 1 ? 's' : ''}`;
  
  return (
    <div 
      ref={ringRef}
      className={`market-mood-ring ${isVisible ? 'visible' : ''} ${isExceptional && hasData ? 'exceptional' : ''} ${isPending ? 'has-pending' : ''} ${compact ? 'compact' : ''} ${className}`}
      title={showTooltip ? tooltipText : undefined}
      role="img"
      aria-label={`Market mood: ${getMoodLabel()}. ${tooltipText}`}
    >
      {/* SVG Ring */}
      <svg 
        width={actualSize} 
        height={actualSize}
        className="market-mood-ring-svg"
        style={{ transform: 'rotate(-90deg)' }}
      >
        <defs>
          {/* Gradient for the ring */}
          <linearGradient id="moodGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={getColor.main} />
            <stop offset="100%" stopColor={getColor.main} stopOpacity="0.7" />
          </linearGradient>
          
          {/* Glow filter */}
          <filter id="moodGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Background track */}
        <circle
          cx={actualSize / 2}
          cy={actualSize / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="market-mood-ring-track"
        />
        
        {/* Progress ring */}
        <circle
          cx={actualSize / 2}
          cy={actualSize / 2}
          r={radius}
          fill="none"
          stroke={getColor.main}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progressOffset}
          className="market-mood-ring-fill"
          style={{
            filter: isExceptional && hasData ? 'url(#moodGlow)' : undefined,
            transition: shouldAnimate('essential') ? 'stroke-dashoffset 0.9s var(--spring-smooth)' : 'none',
          }}
        />
        
        {/* Pending indicator dots */}
        {isPending && hasData && (
          <g className="market-mood-ring-pending" style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}>
            {[...Array(Math.min(pending, 5))].map((_, i) => {
              const angle = (animatedProgress * 360 + 10 + i * 15) * (Math.PI / 180);
              const dotX = actualSize / 2 + radius * Math.cos(angle);
              const dotY = actualSize / 2 + radius * Math.sin(angle);
              return (
                <circle
                  key={i}
                  cx={dotX}
                  cy={dotY}
                  r={2}
                  fill="var(--warning)"
                  className="market-mood-pending-dot"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              );
            })}
          </g>
        )}
      </svg>
      
      {/* Center content */}
      <div className="market-mood-ring-center">
        {hasData ? (
          <>
            <span 
              className="market-mood-ring-percentage"
              style={{ color: getColor.main }}
            >
              {percentage}
            </span>
            {!compact && showLabel && (
              <span className="market-mood-ring-unit">%</span>
            )}
          </>
        ) : (
          <span className="market-mood-ring-empty">—</span>
        )}
      </div>
      
      {/* Mood label */}
      {!compact && showLabel && (
        <div 
          className="market-mood-ring-label"
          style={{ color: hasData ? getColor.main : undefined }}
        >
          {getMoodLabel()}
        </div>
      )}
      
      {/* Exceptional glow ring */}
      {isExceptional && hasData && shouldAnimate('decorative') && (
        <div 
          className="market-mood-ring-glow"
          style={{ 
            boxShadow: `0 0 20px ${getColor.glow}, 0 0 40px ${getColor.glow}`,
          }}
        />
      )}
    </div>
  );
}

/**
 * WeekMoodBadge - Compact inline mood indicator
 * 
 * A smaller version for use in week headers or compact layouts.
 */
export function WeekMoodBadge({
  beats,
  misses,
  pending = 0,
}: {
  beats: number;
  misses: number;
  pending?: number;
}) {
  return (
    <MarketMoodRing
      beats={beats}
      misses={misses}
      pending={pending}
      size={32}
      compact={true}
      showLabel={false}
      showTooltip={true}
    />
  );
}

export default MarketMoodRing;
