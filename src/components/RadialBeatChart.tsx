'use client';

import { useEffect, useState, useRef, useMemo, CSSProperties } from 'react';

/**
 * RadialBeatChart
 * 
 * An animated donut/radial chart for visualizing beat/miss/pending distribution.
 * Features smooth arc animations, hover interactions, and configurable styling.
 * 
 * Inspiration:
 * - Apple Fitness rings
 * - Financial dashboard pie charts
 * - Vercel's analytics donut charts
 * - 2026 "Data Visualization as Art" trend
 */

interface ChartSegment {
  id: string;
  label: string;
  value: number;
  color: string;
  glowColor?: string;
}

interface RadialBeatChartProps {
  /** Number of beats */
  beats: number;
  /** Number of misses */
  misses: number;
  /** Number of pending */
  pending: number;
  /** Chart size in pixels */
  size?: number;
  /** Stroke width / thickness */
  strokeWidth?: number;
  /** Inner radius ratio (0-1, affects donut hole size) */
  innerRadiusRatio?: number;
  /** Animation duration in ms */
  duration?: number;
  /** Show legend below */
  showLegend?: boolean;
  /** Show center label */
  showCenter?: boolean;
  /** Center label mode */
  centerMode?: 'total' | 'beatRate' | 'custom';
  /** Custom center content */
  centerContent?: React.ReactNode;
  /** Enable hover interactions */
  interactive?: boolean;
  /** Enable glow effect on segments */
  glow?: boolean;
  /** Start angle in degrees (0 = top) */
  startAngle?: number;
  /** Gap between segments in degrees */
  segmentGap?: number;
  /** Animation delay in ms */
  delay?: number;
  /** Trigger animation (controlled) */
  trigger?: boolean;
  /** Animation on viewport entry */
  animateOnView?: boolean;
  /** Callback on segment hover */
  onSegmentHover?: (segment: ChartSegment | null) => void;
  /** Custom class name */
  className?: string;
}

// Calculate SVG arc path
function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
  ].join(' ');
}

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleInDegrees: number
): { x: number; y: number } {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

// Easing function for smooth animation
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function RadialBeatChart({
  beats,
  misses,
  pending,
  size = 200,
  strokeWidth = 24,
  innerRadiusRatio = 0.6,
  duration = 1200,
  showLegend = true,
  showCenter = true,
  centerMode = 'beatRate',
  centerContent,
  interactive = true,
  glow = true,
  startAngle = 0,
  segmentGap = 2,
  delay = 0,
  trigger,
  animateOnView = true,
  onSegmentHover,
  className = '',
}: RadialBeatChartProps) {
  const [animationProgress, setAnimationProgress] = useState(0);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [isInView, setIsInView] = useState(!animateOnView);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);

  const total = beats + misses + pending;
  const beatRate = total > 0 ? Math.round((beats / total) * 100) : 0;

  // Segment data
  const segments: ChartSegment[] = useMemo(() => {
    const items: ChartSegment[] = [];
    
    if (beats > 0) {
      items.push({
        id: 'beats',
        label: 'Beats',
        value: beats,
        color: '#10b981',
        glowColor: 'rgba(16, 185, 129, 0.6)',
      });
    }
    
    if (misses > 0) {
      items.push({
        id: 'misses',
        label: 'Misses',
        value: misses,
        color: '#ef4444',
        glowColor: 'rgba(239, 68, 68, 0.6)',
      });
    }
    
    if (pending > 0) {
      items.push({
        id: 'pending',
        label: 'Pending',
        value: pending,
        color: '#71717a',
        glowColor: 'rgba(113, 113, 122, 0.5)',
      });
    }
    
    return items;
  }, [beats, misses, pending]);

  // Calculate arc angles for each segment
  const arcs = useMemo(() => {
    if (total === 0) return [];
    
    const totalGap = segmentGap * segments.length;
    const availableDegrees = 360 - totalGap;
    
    let currentAngle = startAngle;
    
    return segments.map((segment) => {
      const segmentDegrees = (segment.value / total) * availableDegrees;
      const arc = {
        ...segment,
        startAngle: currentAngle,
        endAngle: currentAngle + segmentDegrees,
        midAngle: currentAngle + segmentDegrees / 2,
      };
      currentAngle += segmentDegrees + segmentGap;
      return arc;
    });
  }, [segments, total, startAngle, segmentGap]);

  // Viewport intersection observer
  useEffect(() => {
    if (!animateOnView || !containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [animateOnView]);

  // Animation loop
  useEffect(() => {
    const shouldAnimate = trigger !== undefined ? trigger : isInView;
    if (!shouldAnimate) return;

    let startTime: number | null = null;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime - delay;
      
      if (elapsed < 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      
      const progress = Math.min(elapsed / duration, 1);
      setAnimationProgress(easeOutExpo(progress));
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isInView, trigger, duration, delay]);

  // Handle segment hover
  const handleSegmentHover = (segmentId: string | null) => {
    setHoveredSegment(segmentId);
    if (onSegmentHover) {
      const segment = segments.find((s) => s.id === segmentId) || null;
      onSegmentHover(segment);
    }
  };

  const cx = size / 2;
  const cy = size / 2;
  const radius = (size - strokeWidth) / 2;

  // Center content
  const renderCenter = () => {
    if (!showCenter) return null;
    
    if (centerContent) {
      return centerContent;
    }

    switch (centerMode) {
      case 'beatRate':
        return (
          <div className="text-center">
            <div 
              className="text-3xl font-bold transition-all duration-300"
              style={{ 
                color: beatRate >= 50 ? '#10b981' : '#ef4444',
                textShadow: glow 
                  ? `0 0 20px ${beatRate >= 50 ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'}` 
                  : undefined,
              }}
            >
              {Math.round(beatRate * animationProgress)}%
            </div>
            <div className="text-xs text-zinc-500 mt-0.5">Beat Rate</div>
          </div>
        );
      case 'total':
        return (
          <div className="text-center">
            <div className="text-3xl font-bold text-white">
              {Math.round(total * animationProgress)}
            </div>
            <div className="text-xs text-zinc-500 mt-0.5">Total</div>
          </div>
        );
      default:
        return null;
    }
  };

  // Check reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  if (total === 0) {
    return (
      <div 
        ref={containerRef}
        className={`flex flex-col items-center ${className}`}
        style={{ width: size }}
      >
        <svg width={size} height={size}>
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
          />
        </svg>
        <div className="text-sm text-zinc-500 mt-2">No data</div>
      </div>
    );
  }

  const progress = prefersReducedMotion ? 1 : animationProgress;

  return (
    <div 
      ref={containerRef}
      className={`flex flex-col items-center ${className}`}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg 
          width={size} 
          height={size}
          className="transform -rotate-90"
          style={{ overflow: 'visible' }}
        >
          {/* Background track */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
          />
          
          {/* Animated segments */}
          {arcs.map((arc, index) => {
            const isHovered = hoveredSegment === arc.id;
            const animatedEndAngle = arc.startAngle + 
              (arc.endAngle - arc.startAngle) * progress;
            
            // Skip if not yet visible in animation
            if (animatedEndAngle <= arc.startAngle) return null;

            const path = describeArc(
              cx,
              cy,
              radius,
              arc.startAngle,
              animatedEndAngle
            );

            return (
              <g key={arc.id}>
                {/* Glow filter */}
                {glow && (
                  <defs>
                    <filter id={`glow-${arc.id}`} x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                )}
                
                {/* Arc path */}
                <path
                  d={path}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeLinecap="round"
                  style={{
                    filter: glow ? `url(#glow-${arc.id})` : undefined,
                    transition: interactive ? 'stroke-width 0.2s ease' : undefined,
                    cursor: interactive ? 'pointer' : undefined,
                    opacity: hoveredSegment && !isHovered ? 0.5 : 1,
                  }}
                  onMouseEnter={() => interactive && handleSegmentHover(arc.id)}
                  onMouseLeave={() => interactive && handleSegmentHover(null)}
                />
              </g>
            );
          })}
        </svg>
        
        {/* Center content */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ 
            opacity: progress,
            transform: `scale(${0.8 + progress * 0.2})`,
            transition: 'transform 0.3s ease, opacity 0.3s ease',
          }}
        >
          {renderCenter()}
        </div>
      </div>
      
      {/* Legend */}
      {showLegend && (
        <div 
          className="flex flex-wrap justify-center gap-4 mt-4"
          style={{ 
            opacity: progress,
            transform: `translateY(${(1 - progress) * 10}px)`,
          }}
        >
          {segments.map((segment) => {
            const isHovered = hoveredSegment === segment.id;
            return (
              <div
                key={segment.id}
                className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-all duration-200 ${
                  interactive ? 'cursor-pointer hover:bg-white/5' : ''
                } ${isHovered ? 'bg-white/10' : ''}`}
                onMouseEnter={() => interactive && handleSegmentHover(segment.id)}
                onMouseLeave={() => interactive && handleSegmentHover(null)}
              >
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ 
                    backgroundColor: segment.color,
                    boxShadow: glow ? `0 0 8px ${segment.glowColor}` : undefined,
                  }}
                />
                <span className="text-sm text-zinc-400">{segment.label}</span>
                <span className="text-sm font-semibold text-white">{segment.value}</span>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          svg path,
          div {
            transition: none !important;
          }
        }
        
        @media print {
          svg {
            filter: none !important;
          }
        }
      `}</style>
    </div>
  );
}

// Compact inline version
interface RadialBeatChartCompactProps {
  beats: number;
  misses: number;
  pending?: number;
  size?: number;
}

export function RadialBeatChartCompact({
  beats,
  misses,
  pending = 0,
  size = 48,
}: RadialBeatChartCompactProps) {
  return (
    <RadialBeatChart
      beats={beats}
      misses={misses}
      pending={pending}
      size={size}
      strokeWidth={6}
      showLegend={false}
      showCenter={false}
      interactive={false}
      glow={false}
      segmentGap={1}
    />
  );
}

// Stacked rings variant (like Apple Fitness)
interface StackedRingsChartProps {
  beats: number;
  misses: number;
  pending: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  glow?: boolean;
  className?: string;
}

export function StackedRingsChart({
  beats,
  misses,
  pending,
  total,
  size = 180,
  strokeWidth = 12,
  glow = true,
  className = '',
}: StackedRingsChartProps) {
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const cx = size / 2;
  const cy = size / 2;
  const ringGap = strokeWidth + 6;

  // Three rings at different radii
  const rings = [
    {
      id: 'beats',
      label: 'Beats',
      value: beats,
      max: total,
      radius: (size - strokeWidth) / 2,
      color: '#10b981',
      glowColor: 'rgba(16, 185, 129, 0.5)',
    },
    {
      id: 'misses',
      label: 'Misses',
      value: misses,
      max: total,
      radius: (size - strokeWidth) / 2 - ringGap,
      color: '#ef4444',
      glowColor: 'rgba(239, 68, 68, 0.5)',
    },
    {
      id: 'pending',
      label: 'Pending',
      value: pending,
      max: total,
      radius: (size - strokeWidth) / 2 - ringGap * 2,
      color: '#71717a',
      glowColor: 'rgba(113, 113, 122, 0.5)',
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const p = Math.min(elapsed / 1200, 1);
            setProgress(easeOutExpo(p));
            if (p < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={`flex flex-col items-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {rings.map((ring) => {
          const circumference = ring.radius * 2 * Math.PI;
          const fillPercent = ring.max > 0 ? ring.value / ring.max : 0;
          const dashOffset = circumference - circumference * fillPercent * progress;

          return (
            <g key={ring.id}>
              {/* Background ring */}
              <circle
                cx={cx}
                cy={cy}
                r={ring.radius}
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={strokeWidth}
              />
              {/* Filled ring */}
              <circle
                cx={cx}
                cy={cy}
                r={ring.radius}
                fill="none"
                stroke={ring.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{
                  filter: glow ? `drop-shadow(0 0 6px ${ring.glowColor})` : undefined,
                  transition: 'stroke-dashoffset 0.1s ease',
                }}
              />
            </g>
          );
        })}
      </svg>

      {/* Labels */}
      <div className="flex gap-4 mt-4">
        {rings.map((ring) => (
          <div key={ring.id} className="flex items-center gap-1.5 text-xs">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: ring.color }}
            />
            <span className="text-zinc-400">{ring.label}</span>
            <span className="font-semibold text-white">{ring.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Semi-circle gauge variant
interface SemicircleGaugeProps {
  beats: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}

export function SemicircleGauge({
  beats,
  total,
  size = 160,
  strokeWidth = 16,
  label = 'Beat Rate',
  className = '',
}: SemicircleGaugeProps) {
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const percent = total > 0 ? (beats / total) * 100 : 0;
  const cx = size / 2;
  const cy = size / 2 + strokeWidth;
  const radius = (size - strokeWidth * 2) / 2;

  // Semi-circle (180 degrees)
  const circumference = Math.PI * radius;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const p = Math.min(elapsed / 1000, 1);
            setProgress(easeOutExpo(p));
            if (p < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const fillOffset = circumference - (circumference * (percent / 100) * progress);
  const color = percent >= 50 ? '#10b981' : '#ef4444';

  return (
    <div ref={containerRef} className={`flex flex-col items-center ${className}`}>
      <div className="relative" style={{ width: size, height: size / 2 + strokeWidth + 20 }}>
        <svg 
          width={size} 
          height={size / 2 + strokeWidth + 10}
          style={{ overflow: 'visible' }}
        >
          {/* Background arc */}
          <path
            d={`M ${strokeWidth} ${cy} A ${radius} ${radius} 0 0 1 ${size - strokeWidth} ${cy}`}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* Filled arc */}
          <path
            d={`M ${strokeWidth} ${cy} A ${radius} ${radius} 0 0 1 ${size - strokeWidth} ${cy}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={fillOffset}
            style={{
              filter: `drop-shadow(0 0 8px ${color}80)`,
              transition: 'stroke-dashoffset 0.1s ease',
            }}
          />
        </svg>

        {/* Center content */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 text-center"
          style={{ bottom: 0 }}
        >
          <div 
            className="text-3xl font-bold"
            style={{ 
              color,
              textShadow: `0 0 20px ${color}60`,
            }}
          >
            {Math.round(percent * progress)}%
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">{label}</div>
        </div>
      </div>
    </div>
  );
}
