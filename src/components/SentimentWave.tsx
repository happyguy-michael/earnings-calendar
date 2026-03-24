'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { Earning } from '@/lib/types';

/**
 * SentimentWave - Animated wave visualization showing earnings sentiment across a week
 * 
 * Design Inspiration:
 * - Dribbble "SunSeek" liquid glass design - flowing organic data visualizations
 * - EKG/heartbeat monitors - data as living rhythm
 * - 2026 "Living Data" trend - data that breathes and flows
 * 
 * Creates a visual "pulse" of earnings performance:
 * - Peaks (positive) for beats
 * - Troughs (negative) for misses
 * - Neutral line for empty days
 * - Flowing animation that makes the data feel alive
 */

interface DayData {
  date: string;
  dayIndex: number; // 0-4 for Mon-Fri
  earnings: Earning[];
  sentiment: number; // -1 (all miss) to +1 (all beat), 0 = neutral/empty
  intensity: number; // 0-1 based on count of earnings
}

interface SentimentWaveProps {
  /** Earnings data for the week */
  earnings: Earning[];
  /** Width of the SVG container */
  width?: number;
  /** Height of the SVG container */
  height?: number;
  /** Whether to animate the wave */
  animate?: boolean;
  /** Animation duration in ms */
  animationDuration?: number;
  /** Color for positive sentiment (beats) */
  beatColor?: string;
  /** Color for negative sentiment (misses) */
  missColor?: string;
  /** Color for neutral/pending */
  neutralColor?: string;
  /** Opacity of the wave fill */
  fillOpacity?: number;
  /** Whether to show the glow effect */
  showGlow?: boolean;
  /** Whether to show dot markers on peaks/troughs */
  showMarkers?: boolean;
  /** Delay before animation starts */
  delay?: number;
  /** Additional class names */
  className?: string;
}

function calculateDayData(earnings: Earning[]): DayData[] {
  const days: DayData[] = [];
  
  // Group by day of week (Mon=0 to Fri=4)
  const byDay = new Map<number, Earning[]>();
  
  earnings.forEach(e => {
    const date = new Date(e.date);
    const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, etc.
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Mon=0
    
    if (dayIndex >= 0 && dayIndex <= 4) {
      const existing = byDay.get(dayIndex) || [];
      existing.push(e);
      byDay.set(dayIndex, existing);
    }
  });
  
  // Calculate sentiment for each day
  for (let i = 0; i < 5; i++) {
    const dayEarnings = byDay.get(i) || [];
    
    if (dayEarnings.length === 0) {
      days.push({
        date: '',
        dayIndex: i,
        earnings: [],
        sentiment: 0,
        intensity: 0,
      });
      continue;
    }
    
    // Calculate sentiment: (beats - misses) / total reported
    const beats = dayEarnings.filter(e => e.result === 'beat').length;
    const misses = dayEarnings.filter(e => e.result === 'miss').length;
    const reported = beats + misses;
    const pending = dayEarnings.length - reported;
    
    // If all pending, sentiment is slightly positive (anticipation)
    let sentiment = 0;
    if (reported > 0) {
      sentiment = (beats - misses) / reported;
    } else if (pending > 0) {
      sentiment = 0.1; // Slight positive for pending = anticipation
    }
    
    // Intensity based on total count (normalized to max of 10)
    const intensity = Math.min(dayEarnings.length / 10, 1);
    
    days.push({
      date: dayEarnings[0]?.date || '',
      dayIndex: i,
      earnings: dayEarnings,
      sentiment,
      intensity,
    });
  }
  
  return days;
}

function generateWavePath(
  dayData: DayData[],
  width: number,
  height: number,
  centerY: number,
  amplitude: number
): { path: string; points: { x: number; y: number; sentiment: number; intensity: number }[] } {
  const points: { x: number; y: number; sentiment: number; intensity: number }[] = [];
  const padding = width * 0.05; // 5% padding on each side
  const usableWidth = width - padding * 2;
  const segmentWidth = usableWidth / 4; // 5 days = 4 segments
  
  // Generate control points for each day
  dayData.forEach((day, i) => {
    const x = padding + i * segmentWidth;
    // Y position: center - sentiment * amplitude * intensity
    // Negative sentiment goes down (larger Y), positive goes up (smaller Y)
    const effectiveAmplitude = amplitude * (0.3 + day.intensity * 0.7); // Min 30% amplitude
    const y = centerY - day.sentiment * effectiveAmplitude;
    
    points.push({ x, y, sentiment: day.sentiment, intensity: day.intensity });
  });
  
  // Generate smooth curve using Catmull-Rom to Bezier conversion
  if (points.length < 2) return { path: '', points };
  
  // Start path
  let path = `M ${points[0].x},${points[0].y}`;
  
  // Convert Catmull-Rom spline to Bezier curves for smooth interpolation
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    
    // Catmull-Rom to Bezier control points
    const tension = 0.5;
    const cp1x = p1.x + (p2.x - p0.x) / 6 * tension;
    const cp1y = p1.y + (p2.y - p0.y) / 6 * tension;
    const cp2x = p2.x - (p3.x - p1.x) / 6 * tension;
    const cp2y = p2.y - (p3.y - p1.y) / 6 * tension;
    
    path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  
  return { path, points };
}

export function SentimentWave({
  earnings,
  width = 300,
  height = 60,
  animate = true,
  animationDuration = 1500,
  beatColor = 'rgba(34, 197, 94, 0.8)',
  missColor = 'rgba(239, 68, 68, 0.8)',
  neutralColor = 'rgba(113, 113, 122, 0.5)',
  fillOpacity = 0.15,
  showGlow = true,
  showMarkers = true,
  delay = 0,
  className = '',
}: SentimentWaveProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Calculate day data
  const dayData = useMemo(() => calculateDayData(earnings), [earnings]);
  
  // Generate wave path
  const centerY = height / 2;
  const amplitude = height * 0.35; // Max amplitude is 35% of height
  
  const { path, points } = useMemo(
    () => generateWavePath(dayData, width, height, centerY, amplitude),
    [dayData, width, height, centerY, amplitude]
  );
  
  // Generate fill path (closed shape for gradient fill)
  const fillPath = useMemo(() => {
    if (!path) return '';
    const padding = width * 0.05;
    // Close the path: go down to bottom, across, and back up
    return `${path} L ${width - padding},${height} L ${padding},${height} Z`;
  }, [path, width, height]);
  
  // Determine dominant sentiment for gradient
  const dominantSentiment = useMemo(() => {
    const totalSentiment = dayData.reduce((sum, d) => sum + d.sentiment * d.intensity, 0);
    return totalSentiment > 0.1 ? 'beat' : totalSentiment < -0.1 ? 'miss' : 'neutral';
  }, [dayData]);
  
  // Line color based on dominant sentiment
  const lineColor = dominantSentiment === 'beat' ? beatColor : dominantSentiment === 'miss' ? missColor : neutralColor;
  
  // Intersection observer for animation trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, [isVisible]);
  
  // Path drawing animation
  useEffect(() => {
    if (!pathRef.current || !isVisible || !animate) return;
    
    const pathLength = pathRef.current.getTotalLength();
    pathRef.current.style.strokeDasharray = `${pathLength}`;
    pathRef.current.style.strokeDashoffset = `${pathLength}`;
    
    // Trigger animation after delay
    const timer = setTimeout(() => {
      setIsAnimating(true);
      if (pathRef.current) {
        pathRef.current.style.transition = `stroke-dashoffset ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        pathRef.current.style.strokeDashoffset = '0';
      }
    }, delay);
    
    return () => clearTimeout(timer);
  }, [isVisible, animate, animationDuration, delay]);
  
  // If no earnings at all, render subtle placeholder
  const hasData = dayData.some(d => d.intensity > 0);
  
  return (
    <div 
      ref={containerRef}
      className={`sentiment-wave-container ${className}`}
      style={{
        width: '100%',
        height: height,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="sentiment-wave-svg"
        style={{
          position: 'absolute',
          inset: 0,
        }}
      >
        {/* Gradient definitions */}
        <defs>
          {/* Beat gradient (green) */}
          <linearGradient id="sentimentBeatGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(34, 197, 94, 0.4)" />
            <stop offset="50%" stopColor="rgba(34, 197, 94, 0.1)" />
            <stop offset="100%" stopColor="rgba(34, 197, 94, 0)" />
          </linearGradient>
          
          {/* Miss gradient (red) */}
          <linearGradient id="sentimentMissGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(239, 68, 68, 0)" />
            <stop offset="50%" stopColor="rgba(239, 68, 68, 0.1)" />
            <stop offset="100%" stopColor="rgba(239, 68, 68, 0.4)" />
          </linearGradient>
          
          {/* Mixed/neutral gradient */}
          <linearGradient id="sentimentNeutralGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(139, 92, 246, 0.2)" />
            <stop offset="50%" stopColor="rgba(139, 92, 246, 0.05)" />
            <stop offset="100%" stopColor="rgba(139, 92, 246, 0.2)" />
          </linearGradient>
          
          {/* Glow filter */}
          {showGlow && (
            <filter id="sentimentGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>
        
        {/* Center line (baseline) */}
        <line
          x1={width * 0.05}
          y1={centerY}
          x2={width * 0.95}
          y2={centerY}
          stroke="rgba(113, 113, 122, 0.15)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        
        {hasData && (
          <>
            {/* Fill area under/over the wave */}
            <path
              d={fillPath}
              fill={
                dominantSentiment === 'beat'
                  ? 'url(#sentimentBeatGradient)'
                  : dominantSentiment === 'miss'
                  ? 'url(#sentimentMissGradient)'
                  : 'url(#sentimentNeutralGradient)'
              }
              opacity={isAnimating || !animate ? fillOpacity : 0}
              style={{
                transition: `opacity ${animationDuration * 0.5}ms ease-out ${delay + animationDuration * 0.3}ms`,
              }}
            />
            
            {/* Main wave line */}
            <path
              ref={pathRef}
              d={path}
              fill="none"
              stroke={lineColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={showGlow ? 'url(#sentimentGlow)' : undefined}
            />
            
            {/* Marker dots on peaks/troughs */}
            {showMarkers && points.map((point, i) => {
              if (point.intensity === 0) return null;
              
              const dotColor = point.sentiment > 0.1 
                ? beatColor 
                : point.sentiment < -0.1 
                ? missColor 
                : neutralColor;
              
              const dotSize = 3 + point.intensity * 3;
              
              return (
                <circle
                  key={i}
                  cx={point.x}
                  cy={point.y}
                  r={dotSize}
                  fill={dotColor}
                  opacity={isAnimating || !animate ? 1 : 0}
                  style={{
                    transition: `opacity 300ms ease-out ${delay + animationDuration + i * 100}ms`,
                  }}
                >
                  {/* Pulse animation for high intensity points */}
                  {animate && point.intensity > 0.5 && (
                    <animate
                      attributeName="r"
                      values={`${dotSize};${dotSize * 1.5};${dotSize}`}
                      dur="2s"
                      repeatCount="indefinite"
                      begin={`${delay + animationDuration + i * 100}ms`}
                    />
                  )}
                </circle>
              );
            })}
          </>
        )}
        
        {/* Empty state - subtle wave placeholder */}
        {!hasData && (
          <path
            d={`M ${width * 0.05},${centerY} 
                Q ${width * 0.25},${centerY - 5} ${width * 0.5},${centerY}
                Q ${width * 0.75},${centerY + 5} ${width * 0.95},${centerY}`}
            fill="none"
            stroke="rgba(113, 113, 122, 0.2)"
            strokeWidth="1"
            strokeDasharray="8 4"
            strokeLinecap="round"
          />
        )}
      </svg>
      
      <style jsx>{`
        .sentiment-wave-container {
          pointer-events: none;
        }
        
        .sentiment-wave-svg {
          mix-blend-mode: screen;
        }
        
        /* Respect reduced motion preference */
        @media (prefers-reduced-motion: reduce) {
          .sentiment-wave-svg path,
          .sentiment-wave-svg circle {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * WeekSentimentWave - Wrapper that calculates sentiment for a specific week
 */
interface WeekSentimentWaveProps extends Omit<SentimentWaveProps, 'earnings'> {
  /** All earnings data */
  allEarnings: Earning[];
  /** Start date of the week (Monday) */
  weekStart: Date;
}

export function WeekSentimentWave({
  allEarnings,
  weekStart,
  ...props
}: WeekSentimentWaveProps) {
  // Filter earnings for this specific week (Mon-Fri)
  const weekEarnings = useMemo(() => {
    const monday = new Date(weekStart);
    monday.setHours(0, 0, 0, 0);
    
    const friday = new Date(monday);
    friday.setDate(friday.getDate() + 4);
    friday.setHours(23, 59, 59, 999);
    
    return allEarnings.filter(e => {
      const date = new Date(e.date);
      return date >= monday && date <= friday;
    });
  }, [allEarnings, weekStart]);
  
  return <SentimentWave earnings={weekEarnings} {...props} />;
}

export default SentimentWave;
