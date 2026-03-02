'use client';

import { useEffect, useRef, useState, useMemo } from 'react';

interface DataPoint {
  value: number;
  label?: string;
  beat?: boolean;
}

interface AnimatedSparklineProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  showDots?: boolean;
  showArea?: boolean;
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
  animationDuration?: number;
  delayMs?: number;
  className?: string;
}

export function AnimatedSparkline({
  data,
  width = 200,
  height = 60,
  strokeWidth = 2.5,
  showDots = true,
  showArea = true,
  color,
  gradientFrom = '#3b82f6',
  gradientTo = '#8b5cf6',
  animationDuration = 1500,
  delayMs = 0,
  className = '',
}: AnimatedSparklineProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [pathLength, setPathLength] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Calculate the actual trend color based on data
  const trendColor = useMemo(() => {
    if (color) return color;
    if (data.length < 2) return gradientFrom;
    const trend = data[data.length - 1].value > data[0].value;
    return trend ? '#10b981' : '#ef4444';
  }, [data, color, gradientFrom]);

  // Generate unique ID for gradients
  const gradientId = useMemo(() => `sparkline-gradient-${Math.random().toString(36).substr(2, 9)}`, []);
  const areaGradientId = useMemo(() => `sparkline-area-${Math.random().toString(36).substr(2, 9)}`, []);

  // Calculate SVG path
  const { linePath, areaPath, points } = useMemo(() => {
    if (data.length < 2) return { linePath: '', areaPath: '', points: [] };

    const padding = { top: 8, bottom: 8, left: 4, right: 4 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const values = data.map(d => d.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;

    const pts = data.map((d, i) => ({
      x: padding.left + (i / (data.length - 1)) * chartWidth,
      y: padding.top + chartHeight - ((d.value - minVal) / range) * chartHeight,
      value: d.value,
      label: d.label,
      beat: d.beat,
    }));

    // Generate smooth curve path using cardinal spline
    const tension = 0.3;
    let line = `M ${pts[0].x},${pts[0].y}`;
    
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;

      line += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }

    // Area path (line + bottom fill)
    const area = `${line} L ${pts[pts.length - 1].x},${height} L ${pts[0].x},${height} Z`;

    return { linePath: line, areaPath: area, points: pts };
  }, [data, width, height]);

  // Intersection Observer for triggering animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setTimeout(() => setIsVisible(true), delayMs);
          setHasAnimated(true);
        }
      },
      { threshold: 0.2 }
    );

    if (svgRef.current) {
      observer.observe(svgRef.current);
    }

    return () => observer.disconnect();
  }, [delayMs, hasAnimated]);

  // Get path length for stroke animation
  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, [linePath]);

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  const shouldAnimate = !prefersReducedMotion && isVisible;

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className={`animated-sparkline ${className}`}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Line gradient */}
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={gradientFrom} />
          <stop offset="100%" stopColor={gradientTo} />
        </linearGradient>

        {/* Area fill gradient (vertical) */}
        <linearGradient id={areaGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={trendColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={trendColor} stopOpacity="0" />
        </linearGradient>

        {/* Glow filter */}
        <filter id={`${gradientId}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Area fill (animates with clip-path) */}
      {showArea && areaPath && (
        <g
          style={{
            opacity: shouldAnimate || prefersReducedMotion ? 1 : 0,
            transition: `opacity ${animationDuration * 0.8}ms ease-out`,
            transitionDelay: `${animationDuration * 0.3}ms`,
          }}
        >
          <path
            d={areaPath}
            fill={`url(#${areaGradientId})`}
            className="sparkline-area"
          />
        </g>
      )}

      {/* Animated line path */}
      {linePath && (
        <path
          ref={pathRef}
          d={linePath}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${gradientId}-glow)`}
          style={{
            strokeDasharray: pathLength,
            strokeDashoffset: shouldAnimate ? 0 : pathLength,
            transition: prefersReducedMotion 
              ? 'none' 
              : `stroke-dashoffset ${animationDuration}ms cubic-bezier(0.65, 0, 0.35, 1)`,
          }}
        />
      )}

      {/* Data point dots */}
      {showDots && points.map((point, index) => (
        <g key={index}>
          {/* Outer glow ring */}
          <circle
            cx={point.x}
            cy={point.y}
            r={shouldAnimate ? 6 : 0}
            fill={point.beat === false ? '#ef4444' : trendColor}
            opacity={0.2}
            style={{
              transition: prefersReducedMotion 
                ? 'none' 
                : `r ${300}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
              transitionDelay: `${animationDuration + index * 100}ms`,
            }}
          />
          {/* Inner dot */}
          <circle
            cx={point.x}
            cy={point.y}
            r={shouldAnimate ? 3 : 0}
            fill={point.beat === false ? '#ef4444' : trendColor}
            stroke="rgba(0,0,0,0.5)"
            strokeWidth={1}
            style={{
              transition: prefersReducedMotion 
                ? 'none' 
                : `r ${300}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
              transitionDelay: `${animationDuration + index * 100}ms`,
            }}
          />
        </g>
      ))}

      {/* End point highlight (latest value) */}
      {points.length > 0 && (
        <g>
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r={shouldAnimate ? 10 : 0}
            fill={trendColor}
            opacity={0.15}
            className="pulse-ring"
            style={{
              transition: prefersReducedMotion 
                ? 'none' 
                : `r ${400}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
              transitionDelay: `${animationDuration + points.length * 100}ms`,
            }}
          />
        </g>
      )}

      <style>{`
        .animated-sparkline .pulse-ring {
          animation: sparkline-pulse 2s ease-in-out infinite;
          transform-origin: center;
        }

        @keyframes sparkline-pulse {
          0%, 100% {
            opacity: 0.15;
            transform: scale(1);
          }
          50% {
            opacity: 0.25;
            transform: scale(1.2);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animated-sparkline .pulse-ring {
            animation: none;
          }
        }
      `}</style>
    </svg>
  );
}

// Compact version for inline use
export function MiniSparkline({
  data,
  width = 80,
  height = 24,
  className = '',
}: {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
}) {
  const points = useMemo(() => {
    return data.map((value, i) => ({ value, label: `${i}` }));
  }, [data]);

  return (
    <AnimatedSparkline
      data={points}
      width={width}
      height={height}
      strokeWidth={1.5}
      showDots={false}
      showArea={false}
      animationDuration={800}
      className={className}
    />
  );
}

// EPS Trend sparkline with value display
export function EPSTrendSparkline({
  data,
  className = '',
}: {
  data: { quarter: string; eps: number; beat: boolean }[];
  className?: string;
}) {
  const chartData = useMemo(() => {
    return [...data].reverse().map(d => ({
      value: d.eps,
      label: d.quarter,
      beat: d.beat,
    }));
  }, [data]);

  const latestEps = data[0]?.eps || 0;
  const oldestEps = data[data.length - 1]?.eps || 0;
  const growth = oldestEps > 0 ? ((latestEps - oldestEps) / oldestEps * 100) : 0;
  const trend = latestEps > oldestEps;

  return (
    <div className={`eps-trend-sparkline flex items-center gap-4 ${className}`}>
      <AnimatedSparkline
        data={chartData}
        width={140}
        height={48}
        strokeWidth={2}
        showDots={true}
        showArea={true}
        animationDuration={1200}
        gradientFrom={trend ? '#10b981' : '#ef4444'}
        gradientTo={trend ? '#34d399' : '#f87171'}
      />
      <div className="text-right">
        <div className="text-lg font-bold text-white tabular-nums">${latestEps.toFixed(2)}</div>
        <div className={`text-xs font-medium ${trend ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend ? '↑' : '↓'} {growth >= 0 ? '+' : ''}{growth.toFixed(0)}% YoY
        </div>
      </div>
    </div>
  );
}
