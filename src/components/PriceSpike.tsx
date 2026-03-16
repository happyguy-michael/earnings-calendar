'use client';

import { useState, useEffect, useRef, useMemo } from 'react';

interface PriceSpikeProps {
  /** The percentage change (e.g., 15.5 for +15.5%, -8.3 for -8.3%) */
  change: number;
  /** Size of the component */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show the percentage label */
  showLabel?: boolean;
  /** Animation delay in ms */
  delay?: number;
  /** Custom class name */
  className?: string;
  /** Whether the animation should play */
  animate?: boolean;
}

/**
 * PriceSpike — Dramatic stock price movement visualization
 * 
 * Creates a theatrical representation of post-earnings price movement
 * with an animated spike line, shockwave effect, and flying particles.
 * Perfect for showing the impact of earnings surprises.
 */
export function PriceSpike({
  change,
  size = 'md',
  showLabel = true,
  delay = 0,
  className = '',
  animate = true,
}: PriceSpikeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; angle: number; distance: number; size: number; delay: number }>>([]);

  const isPositive = change >= 0;
  const magnitude = Math.min(Math.abs(change), 50); // Cap at 50% for visual purposes
  const normalizedMagnitude = magnitude / 50; // 0-1 scale

  // Size configurations
  const sizeConfig = {
    sm: { width: 80, height: 48, stroke: 2, labelSize: 'text-xs', particleCount: 5 },
    md: { width: 120, height: 64, stroke: 2.5, labelSize: 'text-sm', particleCount: 8 },
    lg: { width: 160, height: 80, stroke: 3, labelSize: 'text-base', particleCount: 12 },
  };

  const config = sizeConfig[size];

  // Generate unique IDs for SVG elements
  const uniqueId = useMemo(() => Math.random().toString(36).substr(2, 9), []);

  // Generate spike path
  const spikePath = useMemo(() => {
    const { width, height } = config;
    const midX = width * 0.4;
    const peakX = width * 0.6;
    const endX = width - 4;
    
    // Start with a calm baseline, then spike dramatically
    const baseY = height / 2;
    const spikeAmplitude = (height / 2 - 8) * normalizedMagnitude;
    const peakY = isPositive ? baseY - spikeAmplitude : baseY + spikeAmplitude;
    const endY = isPositive ? baseY - spikeAmplitude * 0.7 : baseY + spikeAmplitude * 0.7;

    // Create a dramatic spike with slight wobble
    return `
      M 4,${baseY}
      L ${midX * 0.3},${baseY + (isPositive ? 2 : -2)}
      L ${midX * 0.6},${baseY}
      L ${midX * 0.8},${baseY + (isPositive ? -4 : 4)}
      L ${midX},${baseY}
      C ${midX + 10},${baseY} ${peakX - 15},${peakY} ${peakX},${peakY}
      Q ${peakX + 8},${peakY + (isPositive ? 3 : -3)} ${peakX + 16},${peakY + (isPositive ? 2 : -2)}
      L ${endX},${endY}
    `.trim();
  }, [config, isPositive, normalizedMagnitude]);

  // Shockwave position
  const shockwavePosition = useMemo(() => {
    const { width, height } = config;
    const spikeAmplitude = (height / 2 - 8) * normalizedMagnitude;
    return {
      x: width * 0.6,
      y: isPositive ? height / 2 - spikeAmplitude : height / 2 + spikeAmplitude,
    };
  }, [config, isPositive, normalizedMagnitude]);

  // Generate particles on mount
  useEffect(() => {
    const newParticles = Array.from({ length: config.particleCount }, (_, i) => ({
      id: i,
      angle: (isPositive ? -90 : 90) + (Math.random() - 0.5) * 60, // Spread around the spike direction
      distance: 20 + Math.random() * 30,
      size: 2 + Math.random() * 3,
      delay: Math.random() * 200,
    }));
    setParticles(newParticles);
  }, [config.particleCount, isPositive]);

  // Intersection Observer for triggering animation
  useEffect(() => {
    if (!animate) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setTimeout(() => setIsVisible(true), delay);
          setHasAnimated(true);
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [animate, delay, hasAnimated]);

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  const shouldAnimate = animate && !prefersReducedMotion && isVisible;

  // Color based on direction
  const primaryColor = isPositive ? '#10b981' : '#ef4444';
  const glowColor = isPositive ? 'rgba(16, 185, 129, 0.6)' : 'rgba(239, 68, 68, 0.6)';

  return (
    <div
      ref={containerRef}
      className={`price-spike price-spike-${size} inline-flex items-center gap-2 ${className}`}
    >
      <svg
        width={config.width}
        height={config.height}
        viewBox={`0 0 ${config.width} ${config.height}`}
        className="price-spike-svg"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Line gradient */}
          <linearGradient id={`spike-gradient-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(148, 163, 184, 0.3)" />
            <stop offset="35%" stopColor="rgba(148, 163, 184, 0.5)" />
            <stop offset="50%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={primaryColor} />
          </linearGradient>

          {/* Glow filter */}
          <filter id={`spike-glow-${uniqueId}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Shockwave gradient */}
          <radialGradient id={`shockwave-${uniqueId}`}>
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.5" />
            <stop offset="70%" stopColor={primaryColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background baseline */}
        <line
          x1="4"
          y1={config.height / 2}
          x2={config.width - 4}
          y2={config.height / 2}
          stroke="rgba(148, 163, 184, 0.2)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />

        {/* Shockwave ring (expands from impact point) */}
        <circle
          cx={shockwavePosition.x}
          cy={shockwavePosition.y}
          r={shouldAnimate ? 25 * normalizedMagnitude : 0}
          fill="none"
          stroke={primaryColor}
          strokeWidth="2"
          opacity={shouldAnimate ? 0 : 0.5}
          className="shockwave-ring"
          style={{
            transition: prefersReducedMotion
              ? 'none'
              : 'r 600ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 600ms ease-out',
            transitionDelay: '300ms',
          }}
        />

        {/* Second shockwave ring (delayed) */}
        <circle
          cx={shockwavePosition.x}
          cy={shockwavePosition.y}
          r={shouldAnimate ? 35 * normalizedMagnitude : 0}
          fill="none"
          stroke={primaryColor}
          strokeWidth="1.5"
          opacity={shouldAnimate ? 0 : 0.3}
          className="shockwave-ring-2"
          style={{
            transition: prefersReducedMotion
              ? 'none'
              : 'r 700ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 700ms ease-out',
            transitionDelay: '400ms',
          }}
        />

        {/* Animated spike path */}
        <path
          d={spikePath}
          fill="none"
          stroke={`url(#spike-gradient-${uniqueId})`}
          strokeWidth={config.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#spike-glow-${uniqueId})`}
          className="spike-path"
          style={{
            strokeDasharray: 500,
            strokeDashoffset: shouldAnimate ? 0 : 500,
            transition: prefersReducedMotion
              ? 'none'
              : 'stroke-dashoffset 800ms cubic-bezier(0.65, 0, 0.35, 1)',
          }}
        />

        {/* Impact point glow */}
        <circle
          cx={shockwavePosition.x}
          cy={shockwavePosition.y}
          r={shouldAnimate ? 6 : 0}
          fill={primaryColor}
          filter={`url(#spike-glow-${uniqueId})`}
          className="impact-point"
          style={{
            transition: prefersReducedMotion
              ? 'none'
              : 'r 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            transitionDelay: '200ms',
          }}
        />

        {/* Flying particles */}
        {particles.map((particle) => {
          const radians = (particle.angle * Math.PI) / 180;
          const targetX = shockwavePosition.x + Math.cos(radians) * particle.distance;
          const targetY = shockwavePosition.y + Math.sin(radians) * particle.distance;

          return (
            <circle
              key={particle.id}
              cx={shouldAnimate ? targetX : shockwavePosition.x}
              cy={shouldAnimate ? targetY : shockwavePosition.y}
              r={shouldAnimate ? particle.size : 0}
              fill={primaryColor}
              opacity={shouldAnimate ? 0 : 0.8}
              className="spike-particle"
              style={{
                transition: prefersReducedMotion
                  ? 'none'
                  : `all 500ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
                transitionDelay: `${300 + particle.delay}ms`,
              }}
            />
          );
        })}
      </svg>

      {/* Percentage label */}
      {showLabel && (
        <span
          className={`spike-label font-bold tabular-nums ${config.labelSize}`}
          style={{
            color: primaryColor,
            textShadow: `0 0 20px ${glowColor}`,
            opacity: shouldAnimate || prefersReducedMotion ? 1 : 0,
            transform: shouldAnimate || prefersReducedMotion ? 'translateX(0)' : 'translateX(-10px)',
            transition: prefersReducedMotion
              ? 'none'
              : 'opacity 400ms ease-out, transform 400ms ease-out',
            transitionDelay: '500ms',
          }}
        >
          {isPositive ? '+' : ''}{change.toFixed(1)}%
        </span>
      )}

      <style>{`
        .price-spike {
          --spike-color: ${primaryColor};
        }

        .spike-path {
          filter: drop-shadow(0 0 8px ${glowColor});
        }

        .impact-point {
          animation: ${shouldAnimate ? 'impact-pulse 1.5s ease-in-out infinite' : 'none'};
          animation-delay: 800ms;
        }

        @keyframes impact-pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.3);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .impact-point {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * PriceSpikeCompact — Inline version for tight spaces
 */
export function PriceSpikeCompact({
  change,
  className = '',
}: {
  change: number;
  className?: string;
}) {
  return (
    <PriceSpike
      change={change}
      size="sm"
      showLabel={true}
      className={className}
    />
  );
}

/**
 * PriceSpikeBadge — Badge-style variant showing just the spike direction
 */
export function PriceSpikeBadge({
  change,
  className = '',
}: {
  change: number;
  className?: string;
}) {
  const isPositive = change >= 0;
  const magnitude = Math.min(Math.abs(change), 50);

  return (
    <span
      className={`
        price-spike-badge inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold
        ${isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}
        ${className}
      `}
    >
      <svg
        width="16"
        height="12"
        viewBox="0 0 16 12"
        fill="none"
        className="spike-icon"
      >
        <path
          d={isPositive
            ? 'M1 8 L4 7.5 L7 8 L10 2 L13 3 L15 2.5'
            : 'M1 4 L4 4.5 L7 4 L10 10 L13 9 L15 9.5'
          }
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {isPositive ? '+' : ''}{change.toFixed(1)}%
    </span>
  );
}

/**
 * PriceSpikeComparison — Side-by-side comparison of expected vs actual move
 */
export function PriceSpikeComparison({
  expected: expectedMove,
  actual: actualMove,
  className = '',
}: {
  expected: number;
  actual: number;
  className?: string;
}) {
  const wasMoreDramatic = Math.abs(actualMove) > Math.abs(expectedMove);

  return (
    <div className={`price-spike-comparison flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span className="w-16">Expected</span>
        <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-slate-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(Math.abs(expectedMove) * 2, 100)}%` }}
          />
        </div>
        <span className="w-12 text-right tabular-nums">±{expectedMove.toFixed(1)}%</span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="w-16 text-slate-400">Actual</span>
        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              actualMove >= 0 ? 'bg-emerald-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(Math.abs(actualMove) * 2, 100)}%` }}
          />
        </div>
        <span className={`w-12 text-right font-semibold tabular-nums ${
          actualMove >= 0 ? 'text-emerald-400' : 'text-red-400'
        }`}>
          {actualMove >= 0 ? '+' : ''}{actualMove.toFixed(1)}%
        </span>
      </div>
      {wasMoreDramatic && (
        <div className="text-xs text-amber-400 flex items-center gap-1">
          <span className="text-amber-500">⚡</span>
          Bigger move than expected!
        </div>
      )}
    </div>
  );
}
