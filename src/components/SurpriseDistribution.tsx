'use client';

import { useState, useEffect, useMemo, useRef } from 'react';

interface SurpriseDistributionProps {
  /** Array of surprise percentages (positive = beat, negative = miss) */
  surprises: number[];
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show animated transitions */
  animated?: boolean;
  /** Delay before animation starts */
  delay?: number;
  /** Show axis labels */
  showLabels?: boolean;
  /** Show mean indicator */
  showMean?: boolean;
  /** Custom class name */
  className?: string;
}

// Bucket ranges for the histogram
const BUCKETS = [
  { min: -Infinity, max: -15, label: '≤-15%' },
  { min: -15, max: -10, label: '-15%' },
  { min: -10, max: -5, label: '-10%' },
  { min: -5, max: 0, label: '-5%' },
  { min: 0, max: 5, label: '+5%' },
  { min: 5, max: 10, label: '+10%' },
  { min: 10, max: 15, label: '+15%' },
  { min: 15, max: Infinity, label: '≥+15%' },
];

export function SurpriseDistribution({
  surprises,
  size = 'md',
  animated = true,
  delay = 0,
  showLabels = true,
  showMean = true,
  className = '',
}: SurpriseDistributionProps) {
  const [isVisible, setIsVisible] = useState(!animated);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection observer for viewport-triggered animation
  useEffect(() => {
    if (!animated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
            setIsAnimating(true);
            // End animation state after bars finish
            setTimeout(() => setIsAnimating(false), 800);
          }, delay);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [animated, delay]);

  // Calculate bucket counts
  const { bucketCounts, maxCount, mean, beatCount, missCount } = useMemo(() => {
    const counts = new Array(BUCKETS.length).fill(0);
    let sum = 0;
    let beats = 0;
    let misses = 0;

    surprises.forEach(surprise => {
      sum += surprise;
      if (surprise > 0) beats++;
      else if (surprise < 0) misses++;

      for (let i = 0; i < BUCKETS.length; i++) {
        const bucket = BUCKETS[i];
        if (surprise > bucket.min && surprise <= bucket.max) {
          counts[i]++;
          break;
        }
      }
    });

    return {
      bucketCounts: counts,
      maxCount: Math.max(...counts, 1),
      mean: surprises.length > 0 ? sum / surprises.length : 0,
      beatCount: beats,
      missCount: misses,
    };
  }, [surprises]);

  // Size configurations
  const sizeConfig = {
    sm: { barWidth: 8, barMaxHeight: 24, gap: 2, fontSize: 'text-[9px]' },
    md: { barWidth: 12, barMaxHeight: 40, gap: 3, fontSize: 'text-[10px]' },
    lg: { barWidth: 18, barMaxHeight: 56, gap: 4, fontSize: 'text-xs' },
  }[size];

  // Calculate mean position (0 is center, range is -30% to +30%)
  const meanPosition = useMemo(() => {
    const clampedMean = Math.max(-30, Math.min(30, mean));
    // Convert from [-30, 30] to [0, 1]
    return (clampedMean + 30) / 60;
  }, [mean]);

  if (surprises.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`surprise-distribution ${className}`}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: size === 'sm' ? 4 : 6,
      }}
    >
      {/* Summary stats */}
      <div
        className={`flex items-center gap-2 ${sizeConfig.fontSize}`}
        style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        <span className="text-emerald-400 font-medium">
          {beatCount} <span className="text-zinc-500">beats</span>
        </span>
        <span className="text-zinc-600">•</span>
        <span className="text-red-400 font-medium">
          {missCount} <span className="text-zinc-500">misses</span>
        </span>
        {showMean && (
          <>
            <span className="text-zinc-600">•</span>
            <span className={`font-medium ${mean >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              avg {mean >= 0 ? '+' : ''}{mean.toFixed(1)}%
            </span>
          </>
        )}
      </div>

      {/* Histogram */}
      <div
        className="relative flex items-end"
        style={{
          gap: sizeConfig.gap,
          height: sizeConfig.barMaxHeight,
        }}
      >
        {/* Center line (0% mark) */}
        <div
          className="absolute top-0 bottom-0 w-px bg-zinc-600/50"
          style={{
            left: `calc(50% - 0.5px)`,
            opacity: isVisible ? 0.5 : 0,
            transition: 'opacity 0.3s ease',
          }}
        />

        {/* Bars */}
        {bucketCounts.map((count, index) => {
          const isNegative = index < 4;
          const heightPercent = count / maxCount;
          const barHeight = heightPercent * sizeConfig.barMaxHeight;
          
          return (
            <div
              key={index}
              className="relative group"
              style={{
                width: sizeConfig.barWidth,
                height: sizeConfig.barMaxHeight,
                display: 'flex',
                alignItems: 'flex-end',
              }}
            >
              {/* Bar */}
              <div
                className={`
                  w-full rounded-t-sm transition-all duration-500
                  ${isNegative 
                    ? 'bg-gradient-to-t from-red-500/80 to-red-400/60' 
                    : 'bg-gradient-to-t from-emerald-500/80 to-emerald-400/60'
                  }
                  ${isAnimating ? 'bar-animate' : ''}
                `}
                style={{
                  height: isVisible ? Math.max(count > 0 ? 2 : 0, barHeight) : 0,
                  transitionDelay: `${index * 50}ms`,
                  boxShadow: count > 0 
                    ? `0 0 ${count * 2}px ${isNegative ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`
                    : 'none',
                }}
              >
                {/* Shimmer effect on hover */}
                <div
                  className="absolute inset-0 rounded-t-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: `linear-gradient(
                      to top,
                      transparent,
                      ${isNegative ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'}
                    )`,
                  }}
                />
              </div>

              {/* Tooltip on hover */}
              <div
                className={`
                  absolute bottom-full mb-1 px-1.5 py-0.5 rounded
                  bg-zinc-800 border border-zinc-700 text-white
                  opacity-0 group-hover:opacity-100 pointer-events-none
                  transition-opacity whitespace-nowrap z-10
                  ${sizeConfig.fontSize}
                `}
                style={{
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              >
                {BUCKETS[index].label}: {count}
              </div>
            </div>
          );
        })}

        {/* Mean indicator line */}
        {showMean && surprises.length > 0 && (
          <div
            className="absolute top-0 h-full pointer-events-none"
            style={{
              left: `${meanPosition * 100}%`,
              opacity: isVisible ? 1 : 0,
              transition: 'opacity 0.5s ease 0.4s, left 0.5s ease',
            }}
          >
            <div
              className={`
                w-0.5 h-full rounded-full
                ${mean >= 0 ? 'bg-emerald-300' : 'bg-red-300'}
              `}
              style={{
                boxShadow: `0 0 4px ${mean >= 0 ? 'rgba(52, 211, 153, 0.5)' : 'rgba(248, 113, 113, 0.5)'}`,
              }}
            />
            {/* Mean marker triangle */}
            <div
              className={`
                absolute -top-1 left-1/2 -translate-x-1/2
                w-0 h-0 border-l-[3px] border-r-[3px] border-b-[4px]
                border-l-transparent border-r-transparent
                ${mean >= 0 ? 'border-b-emerald-300' : 'border-b-red-300'}
              `}
            />
          </div>
        )}
      </div>

      {/* Axis labels */}
      {showLabels && (
        <div
          className={`flex justify-between w-full ${sizeConfig.fontSize} text-zinc-500`}
          style={{
            opacity: isVisible ? 0.7 : 0,
            transition: 'opacity 0.3s ease 0.3s',
          }}
        >
          <span>Miss</span>
          <span>0</span>
          <span>Beat</span>
        </div>
      )}

      <style jsx>{`
        @keyframes barGrow {
          0% {
            transform: scaleY(0);
            transform-origin: bottom;
          }
          60% {
            transform: scaleY(1.1);
          }
          100% {
            transform: scaleY(1);
            transform-origin: bottom;
          }
        }

        .bar-animate {
          animation: barGrow 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .bar-animate {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Compact inline version for use in headers/summaries
 */
export function SurpriseDistributionCompact({
  surprises,
  className = '',
}: {
  surprises: number[];
  className?: string;
}) {
  const { beatCount, missCount, mean } = useMemo(() => {
    let beats = 0;
    let misses = 0;
    let sum = 0;

    surprises.forEach(s => {
      sum += s;
      if (s > 0) beats++;
      else if (s < 0) misses++;
    });

    return {
      beatCount: beats,
      missCount: misses,
      mean: surprises.length > 0 ? sum / surprises.length : 0,
    };
  }, [surprises]);

  if (surprises.length === 0) return null;

  const beatRatio = beatCount / surprises.length;
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Mini bar showing beat/miss ratio */}
      <div className="flex h-1.5 w-16 rounded-full overflow-hidden bg-zinc-700/50">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
          style={{ width: `${beatRatio * 100}%` }}
        />
        <div
          className="h-full bg-gradient-to-r from-red-400 to-red-500 transition-all duration-500"
          style={{ width: `${(1 - beatRatio) * 100}%` }}
        />
      </div>
      
      {/* Counts */}
      <span className="text-[10px] text-zinc-400">
        <span className="text-emerald-400 font-medium">{beatCount}</span>
        <span className="mx-0.5">/</span>
        <span className="text-red-400 font-medium">{missCount}</span>
      </span>
      
      {/* Mean surprise */}
      <span className={`text-[10px] font-medium ${mean >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
        {mean >= 0 ? '+' : ''}{mean.toFixed(1)}%
      </span>
    </div>
  );
}

/**
 * Sparkline-style mini distribution
 */
export function SurpriseSparkline({
  surprises,
  width = 60,
  height = 16,
  className = '',
}: {
  surprises: number[];
  width?: number;
  height?: number;
  className?: string;
}) {
  const bars = useMemo(() => {
    if (surprises.length === 0) return [];
    
    // Sort surprises and show as individual bars
    const sorted = [...surprises].sort((a, b) => a - b);
    const maxAbs = Math.max(...sorted.map(Math.abs), 1);
    
    return sorted.map(s => ({
      value: s,
      height: (Math.abs(s) / maxAbs) * height,
      isPositive: s >= 0,
    }));
  }, [surprises, height]);

  if (bars.length === 0) return null;

  const barWidth = Math.max(1, (width - bars.length) / bars.length);

  return (
    <div
      className={`inline-flex items-center gap-px ${className}`}
      style={{ width, height }}
    >
      {bars.map((bar, i) => (
        <div
          key={i}
          className={`rounded-sm ${bar.isPositive ? 'bg-emerald-400/70' : 'bg-red-400/70'}`}
          style={{
            width: barWidth,
            height: Math.max(2, bar.height),
            transition: 'height 0.3s ease',
          }}
        />
      ))}
    </div>
  );
}

export default SurpriseDistribution;
