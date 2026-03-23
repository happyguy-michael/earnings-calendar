'use client';

import { useEffect, useState, useRef, useMemo, CSSProperties } from 'react';

interface ActivityRingsProps {
  /** Progress ring value (0-100) - e.g., % of earnings reported */
  progress: number;
  /** Beat rate value (0-100) */
  beatRate: number;
  /** Optional goal for progress ring (default 100) */
  progressGoal?: number;
  /** Size of the component */
  size?: 'sm' | 'md' | 'lg';
  /** Show labels on hover */
  showLabels?: boolean;
  /** Animation delay in ms */
  animationDelay?: number;
  /** Animate on mount */
  animateOnMount?: boolean;
  /** Custom class name */
  className?: string;
}

const SIZES = {
  sm: { outer: 48, strokeWidth: 5, gap: 6 },
  md: { outer: 72, strokeWidth: 7, gap: 8 },
  lg: { outer: 96, strokeWidth: 9, gap: 10 },
} as const;

/**
 * ActivityRings - Apple Watch inspired activity ring visualization
 * 
 * Shows two concentric animated rings:
 * - Outer ring: Progress (e.g., % of earnings reported)
 * - Inner ring: Beat rate
 * 
 * Features:
 * - CSS spring-like easing for smooth fill animations
 * - Gradient strokes with glow effects
 * - Hover state with labels
 * - Reduced motion support
 * - Pulsing animation when reaching goals
 * 
 * Inspiration:
 * - Apple Watch Activity Rings
 * - Fitness app progress indicators
 * - Ring/circular progress patterns in modern dashboards
 */
export function ActivityRings({
  progress,
  beatRate,
  progressGoal = 100,
  size = 'md',
  showLabels = true,
  animationDelay = 0,
  animateOnMount = true,
  className = '',
}: ActivityRingsProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [animatedProgress, setAnimatedProgress] = useState(animateOnMount ? 0 : progress);
  const [animatedBeatRate, setAnimatedBeatRate] = useState(animateOnMount ? 0 : beatRate);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const hasAnimatedRef = useRef(!animateOnMount);

  const { outer, strokeWidth, gap } = SIZES[size];
  const innerRadius = (outer / 2) - strokeWidth - gap;
  const outerRadius = (outer / 2) - strokeWidth / 2;

  // Circumferences for stroke-dasharray
  const outerCircumference = 2 * Math.PI * outerRadius;
  const innerCircumference = 2 * Math.PI * innerRadius;

  // Normalized values (capped at 100, but allow overflow glow)
  const normalizedProgress = Math.min(progress, 100);
  const normalizedBeatRate = Math.min(beatRate, 100);
  const progressOverflow = progress > progressGoal;
  const beatRateExcellent = beatRate >= 80;

  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Animate values on mount
  useEffect(() => {
    if (hasAnimatedRef.current) {
      // Already animated, just update directly
      setAnimatedProgress(normalizedProgress);
      setAnimatedBeatRate(normalizedBeatRate);
      return;
    }

    const delay = animationDelay;
    const timer = setTimeout(() => {
      setAnimatedProgress(normalizedProgress);
      setAnimatedBeatRate(normalizedBeatRate);
      hasAnimatedRef.current = true;
    }, delay);

    return () => clearTimeout(timer);
  }, [normalizedProgress, normalizedBeatRate, animationDelay]);

  // Unique IDs for gradients
  const gradientId = useMemo(() => `activity-rings-${Math.random().toString(36).slice(2, 9)}`, []);

  // Calculate stroke-dashoffset based on animated values
  const progressOffset = outerCircumference - (outerCircumference * animatedProgress / 100);
  const beatOffset = innerCircumference - (innerCircumference * animatedBeatRate / 100);

  // Transition duration based on reduced motion preference
  const transitionDuration = prefersReducedMotion ? '0s' : '1s';
  const transitionEasing = 'cubic-bezier(0.34, 1.56, 0.64, 1)'; // Spring-like bounce

  const ringStyle: CSSProperties = {
    transition: `stroke-dashoffset ${transitionDuration} ${transitionEasing}`,
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="img"
      aria-label={`Progress: ${Math.round(progress)}%, Beat Rate: ${Math.round(beatRate)}%`}
    >
      <svg
        width={outer}
        height={outer}
        viewBox={`0 0 ${outer} ${outer}`}
        className="transform -rotate-90"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Progress ring gradient (green-cyan) */}
          <linearGradient id={`${gradientId}-progress`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          
          {/* Beat rate ring gradient (pink-orange) */}
          <linearGradient id={`${gradientId}-beat`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>

          {/* Glow filter */}
          <filter id={`${gradientId}-glow`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background tracks */}
        <circle
          cx={outer / 2}
          cy={outer / 2}
          r={outerRadius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-white/10 dark:text-white/5"
        />
        <circle
          cx={outer / 2}
          cy={outer / 2}
          r={innerRadius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-white/10 dark:text-white/5"
        />

        {/* Progress ring (outer) */}
        <circle
          cx={outer / 2}
          cy={outer / 2}
          r={outerRadius}
          fill="none"
          stroke={`url(#${gradientId}-progress)`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={outerCircumference}
          strokeDashoffset={progressOffset}
          style={ringStyle}
          filter={progressOverflow ? `url(#${gradientId}-glow)` : undefined}
        />

        {/* Beat rate ring (inner) */}
        <circle
          cx={outer / 2}
          cy={outer / 2}
          r={innerRadius}
          fill="none"
          stroke={`url(#${gradientId}-beat)`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={innerCircumference}
          strokeDashoffset={beatOffset}
          style={ringStyle}
          filter={beatRateExcellent ? `url(#${gradientId}-glow)` : undefined}
        />

        {/* Pulsing end cap when progress complete */}
        {normalizedProgress >= 100 && !prefersReducedMotion && (
          <circle
            cx={outer / 2}
            cy={strokeWidth / 2 + (outer / 2 - outerRadius)}
            r={strokeWidth / 2}
            fill="#22c55e"
            className="animate-pulse"
          />
        )}
      </svg>

      {/* Center content - shows on hover or always if small */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-150 ${
          isHovered || size === 'sm' ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        }`}
      >
        {size !== 'sm' && showLabels && (
          <div className="text-center">
            <div className="text-[10px] font-semibold text-emerald-400">
              {Math.round(progress)}%
            </div>
            <div className="text-[10px] font-semibold text-rose-400">
              {Math.round(beatRate)}%
            </div>
          </div>
        )}
      </div>

      {/* Tooltip on hover for accessibility */}
      {isHovered && showLabels && size !== 'sm' && (
        <div
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap opacity-0 animate-fade-in"
          style={{
            animation: 'fadeIn 0.15s ease-out forwards',
          }}
        >
          <div className="text-[10px] text-neutral-400 dark:text-neutral-500">
            <span className="text-emerald-400">Reported</span>
            {' · '}
            <span className="text-rose-400">Beat Rate</span>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -4px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}

/**
 * Hook to use ActivityRings with earnings data
 */
export function useActivityRingsData(
  totalReports: number,
  reportedCount: number,
  beatCount: number
) {
  const progress = totalReports > 0 ? (reportedCount / totalReports) * 100 : 0;
  const beatRate = reportedCount > 0 ? (beatCount / reportedCount) * 100 : 0;

  return {
    progress,
    beatRate,
    isComplete: reportedCount >= totalReports,
    hasExcellentBeatRate: beatRate >= 80,
  };
}

export default ActivityRings;
