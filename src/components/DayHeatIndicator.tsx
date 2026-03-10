'use client';

import { memo, useMemo } from 'react';

/**
 * DayHeatIndicator
 * 
 * A subtle gradient bar at the bottom of each day column showing
 * the "heat" level based on number of earnings reports.
 * 
 * Inspiration:
 * - GitHub contribution heatmap (color intensity = activity)
 * - Waton Calendar Dashboard (soft color coding)
 * - Dribbble dashboard heat maps
 * 
 * Features:
 * - Gradient color from cool (blue) to hot (orange/red)
 * - Animated pulse on high-volume days
 * - Glow effect that increases with volume
 * - Tooltip showing exact count
 * - Respects prefers-reduced-motion
 * - Light/dark mode adaptive
 */

interface DayHeatIndicatorProps {
  /** Number of earnings reports for this day */
  count: number;
  /** Maximum count across all visible days (for relative scaling) */
  maxCount: number;
  /** Number of beats (for green tint) */
  beats?: number;
  /** Number of misses (for red tint) */
  misses?: number;
  /** Number of pending (for blue tint) */
  pending?: number;
  /** Custom class name */
  className?: string;
  /** Show label with count */
  showLabel?: boolean;
}

// Heat levels and their colors
const HEAT_LEVELS = [
  { threshold: 0, color: 'transparent', glow: 0 },
  { threshold: 1, color: '#3b82f6', glow: 0.15 },     // Light blue
  { threshold: 3, color: '#8b5cf6', glow: 0.25 },     // Purple
  { threshold: 6, color: '#f59e0b', glow: 0.35 },     // Amber
  { threshold: 10, color: '#f97316', glow: 0.45 },    // Orange
  { threshold: 15, color: '#ef4444', glow: 0.55 },    // Red (hot!)
] as const;

function getHeatLevel(count: number) {
  for (let i = HEAT_LEVELS.length - 1; i >= 0; i--) {
    if (count >= HEAT_LEVELS[i].threshold) {
      return HEAT_LEVELS[i];
    }
  }
  return HEAT_LEVELS[0];
}

function getIntensity(count: number, maxCount: number): number {
  if (maxCount === 0) return 0;
  return Math.min(1, count / Math.max(maxCount, 10));
}

const DayHeatIndicator = memo(function DayHeatIndicator({
  count,
  maxCount,
  beats = 0,
  misses = 0,
  pending = 0,
  className = '',
  showLabel = false,
}: DayHeatIndicatorProps) {
  const heat = useMemo(() => getHeatLevel(count), [count]);
  const intensity = useMemo(() => getIntensity(count, maxCount), [count, maxCount]);
  
  // Calculate sentiment color blend
  const sentimentColor = useMemo(() => {
    if (count === 0) return 'transparent';
    
    const total = beats + misses + pending;
    if (total === 0) return heat.color;
    
    const beatRatio = beats / total;
    const missRatio = misses / total;
    const pendingRatio = pending / total;
    
    // Blend colors based on ratios
    // High beat ratio = green tint, high miss ratio = red tint, pending = blue
    if (beatRatio > 0.6) return '#22c55e'; // Strong beat day
    if (missRatio > 0.6) return '#ef4444'; // Strong miss day
    if (pendingRatio > 0.8) return '#3b82f6'; // All pending
    
    return heat.color; // Default to heat color
  }, [count, beats, misses, pending, heat.color]);
  
  if (count === 0) {
    return null;
  }
  
  const isHot = count >= 10;
  
  return (
    <div 
      className={`day-heat-indicator ${isHot ? 'hot' : ''} ${className}`}
      style={{
        '--heat-color': sentimentColor,
        '--heat-intensity': intensity,
        '--heat-glow': heat.glow,
      } as React.CSSProperties}
      title={`${count} earnings report${count !== 1 ? 's' : ''}`}
    >
      {/* Gradient bar */}
      <div className="day-heat-bar" />
      
      {/* Glow effect */}
      <div className="day-heat-glow" />
      
      {/* Animated particles for hot days */}
      {isHot && (
        <div className="day-heat-particles">
          {[...Array(3)].map((_, i) => (
            <span 
              key={i} 
              className="day-heat-particle"
              style={{ 
                '--particle-delay': `${i * 0.3}s`,
                '--particle-x': `${20 + i * 30}%`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}
      
      {/* Optional label */}
      {showLabel && (
        <span className="day-heat-label">{count}</span>
      )}
    </div>
  );
});

/**
 * DayHeatStrip
 * 
 * A horizontal strip showing heat indicators for all days in a week.
 * Useful for a week-at-a-glance heat map view.
 */
interface DayHeatStripProps {
  /** Array of counts for each day */
  dayCounts: Array<{
    count: number;
    beats?: number;
    misses?: number;
    pending?: number;
  }>;
  /** Custom class name */
  className?: string;
}

export const DayHeatStrip = memo(function DayHeatStrip({
  dayCounts,
  className = '',
}: DayHeatStripProps) {
  const maxCount = useMemo(() => 
    Math.max(...dayCounts.map(d => d.count), 1),
    [dayCounts]
  );
  
  return (
    <div className={`day-heat-strip ${className}`}>
      {dayCounts.map((day, index) => (
        <DayHeatIndicator
          key={index}
          count={day.count}
          maxCount={maxCount}
          beats={day.beats}
          misses={day.misses}
          pending={day.pending}
        />
      ))}
    </div>
  );
});

/**
 * MiniHeatDot
 * 
 * A tiny dot indicator for compact views (like week navigation).
 */
interface MiniHeatDotProps {
  count: number;
  maxCount: number;
  className?: string;
}

export const MiniHeatDot = memo(function MiniHeatDot({
  count,
  maxCount,
  className = '',
}: MiniHeatDotProps) {
  const heat = useMemo(() => getHeatLevel(count), [count]);
  const intensity = useMemo(() => getIntensity(count, maxCount), [count, maxCount]);
  
  if (count === 0) return null;
  
  return (
    <span 
      className={`mini-heat-dot ${className}`}
      style={{
        '--dot-color': heat.color,
        '--dot-intensity': intensity,
      } as React.CSSProperties}
      title={`${count} earnings`}
    />
  );
});

export { DayHeatIndicator };
export default DayHeatIndicator;
