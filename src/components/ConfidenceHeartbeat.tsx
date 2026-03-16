'use client';

import { useEffect, useRef, useState, memo, useMemo, CSSProperties } from 'react';
import { useMotionPreferences } from './MotionPreferences';

/**
 * ConfidenceHeartbeat — ECG-style heartbeat visualization for beat probability
 * 
 * Inspiration:
 * - Medical monitors / ECG displays
 * - "Confidence Indicators" trend from GroovyWeb's 2026 UI/UX trends
 * - Biological metaphors for data (heartbeat = system confidence)
 * - Trading terminal "vital signs" indicators
 * 
 * The heartbeat communicates probability through rhythm and intensity:
 * - High probability (>70%): Strong, fast, confident beats with green glow
 * - Medium probability (40-70%): Normal rhythm with amber tones
 * - Low probability (<40%): Weak, slow, uncertain pulses with red warning
 * 
 * This is a novel way to show uncertainty — through rhythm, not just numbers.
 */

interface ConfidenceHeartbeatProps {
  /** Beat probability 0-100 */
  probability: number;
  /** Width of the visualization */
  width?: number;
  /** Height of the visualization */
  height?: number;
  /** Show probability label */
  showLabel?: boolean;
  /** Compact mode (smaller, less detail) */
  compact?: boolean;
  /** Custom className */
  className?: string;
}

// ECG path segments for different confidence levels
const ECG_PATHS = {
  // Strong confident beat (high amplitude, sharp peak)
  strong: 'M 0 50 L 15 50 L 20 50 L 25 35 L 30 50 L 35 50 L 40 50 L 45 15 L 50 85 L 55 40 L 60 50 L 75 50 L 80 48 L 85 50 L 100 50',
  // Normal beat (moderate amplitude)
  normal: 'M 0 50 L 18 50 L 25 50 L 30 40 L 35 50 L 40 50 L 45 25 L 50 75 L 55 45 L 60 50 L 80 50 L 85 48 L 90 50 L 100 50',
  // Weak beat (low amplitude, rounded)
  weak: 'M 0 50 L 20 50 L 30 50 L 35 45 L 40 50 L 45 35 L 50 65 L 55 47 L 60 50 L 100 50',
  // Flatline (critical low)
  flatline: 'M 0 50 L 40 50 L 45 48 L 50 52 L 55 50 L 100 50',
};

// Get ECG characteristics based on probability
function getECGConfig(probability: number) {
  if (probability >= 80) {
    return {
      path: ECG_PATHS.strong,
      color: '#22c55e', // Green
      glowColor: 'rgba(34, 197, 94, 0.5)',
      pulseInterval: 800, // Fast, confident
      amplitude: 1.2,
      label: 'Strong',
    };
  }
  if (probability >= 60) {
    return {
      path: ECG_PATHS.strong,
      color: '#4ade80', // Light green
      glowColor: 'rgba(74, 222, 128, 0.4)',
      pulseInterval: 1000,
      amplitude: 1.0,
      label: 'Good',
    };
  }
  if (probability >= 45) {
    return {
      path: ECG_PATHS.normal,
      color: '#fbbf24', // Amber
      glowColor: 'rgba(251, 191, 36, 0.4)',
      pulseInterval: 1200,
      amplitude: 0.9,
      label: 'Uncertain',
    };
  }
  if (probability >= 30) {
    return {
      path: ECG_PATHS.weak,
      color: '#f97316', // Orange
      glowColor: 'rgba(249, 115, 22, 0.4)',
      pulseInterval: 1500, // Slower, weaker
      amplitude: 0.7,
      label: 'Weak',
    };
  }
  return {
    path: ECG_PATHS.flatline,
    color: '#ef4444', // Red
    glowColor: 'rgba(239, 68, 68, 0.4)',
    pulseInterval: 2000, // Very slow
    amplitude: 0.5,
    label: 'Critical',
  };
}

export const ConfidenceHeartbeat = memo(function ConfidenceHeartbeat({
  probability,
  width = 80,
  height = 32,
  showLabel = true,
  compact = false,
  className = '',
}: ConfidenceHeartbeatProps) {
  const { shouldAnimate } = useMotionPreferences();
  const prefersReducedMotion = !shouldAnimate('decorative');
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [pulsePhase, setPulsePhase] = useState(0);

  const config = useMemo(() => getECGConfig(probability), [probability]);

  // Intersection Observer for visibility
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Pulse animation loop
  useEffect(() => {
    if (prefersReducedMotion || !isVisible) return;

    const interval = setInterval(() => {
      setPulsePhase((p) => (p + 1) % 3);
    }, config.pulseInterval);

    return () => clearInterval(interval);
  }, [config.pulseInterval, isVisible, prefersReducedMotion]);

  const effectiveWidth = compact ? width * 0.7 : width;
  const effectiveHeight = compact ? height * 0.7 : height;

  // Calculate viewBox to accommodate amplitude scaling
  const viewBoxPadding = 10;
  const viewBox = `${-viewBoxPadding} ${50 - 50 * config.amplitude - viewBoxPadding} ${100 + viewBoxPadding * 2} ${100 * config.amplitude + viewBoxPadding * 2}`;

  return (
    <div
      ref={containerRef}
      className={`confidence-heartbeat ${compact ? 'compact' : ''} ${className}`}
      style={{
        '--heartbeat-color': config.color,
        '--heartbeat-glow': config.glowColor,
        '--pulse-interval': `${config.pulseInterval}ms`,
        '--amplitude': config.amplitude,
      } as CSSProperties}
    >
      <svg
        width={effectiveWidth}
        height={effectiveHeight}
        viewBox={viewBox}
        className="confidence-heartbeat-svg"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Glow filter */}
        <defs>
          <filter id="heartbeat-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          {/* Gradient for the line */}
          <linearGradient id="heartbeat-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={config.color} stopOpacity="0.3" />
            <stop offset="30%" stopColor={config.color} stopOpacity="1" />
            <stop offset="70%" stopColor={config.color} stopOpacity="1" />
            <stop offset="100%" stopColor={config.color} stopOpacity="0.3" />
          </linearGradient>
          
          {/* Scanline mask */}
          <mask id="heartbeat-scanline">
            <rect x="-10" y="0" width="120" height="100" fill="white" />
            <rect 
              className="scanline-mask" 
              x="0" 
              y="0" 
              width="30" 
              height="100" 
              fill="black"
            />
          </mask>
        </defs>

        {/* Background grid (faint) */}
        <g className="heartbeat-grid" opacity="0.15">
          {[...Array(5)].map((_, i) => (
            <line 
              key={`h-${i}`} 
              x1="-10" 
              y1={i * 25} 
              x2="110" 
              y2={i * 25} 
              stroke="currentColor" 
              strokeWidth="0.5"
            />
          ))}
          {[...Array(6)].map((_, i) => (
            <line 
              key={`v-${i}`} 
              x1={i * 20} 
              y1="0" 
              x2={i * 20} 
              y2="100" 
              stroke="currentColor" 
              strokeWidth="0.5"
            />
          ))}
        </g>

        {/* The ECG line */}
        <g 
          className="heartbeat-line-group"
          style={{
            transform: `scaleY(${config.amplitude})`,
            transformOrigin: 'center',
          }}
        >
          {/* Shadow/glow layer */}
          <path
            d={config.path}
            fill="none"
            stroke={config.glowColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#heartbeat-glow)"
            className="heartbeat-glow-path"
          />
          
          {/* Main line */}
          <path
            d={config.path}
            fill="none"
            stroke="url(#heartbeat-gradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="heartbeat-main-path"
          />
        </g>

        {/* Pulse dot */}
        <circle
          className="heartbeat-pulse-dot"
          cx="50"
          cy={50 - (probability >= 60 ? 35 : probability >= 40 ? 25 : 15) * config.amplitude}
          r={3 * config.amplitude}
          fill={config.color}
          filter="url(#heartbeat-glow)"
        />
      </svg>

      {showLabel && !compact && (
        <div className="confidence-heartbeat-label">
          <span className="probability-value">{Math.round(probability)}%</span>
          <span className="confidence-level">{config.label}</span>
        </div>
      )}

      {/* Pulse flash overlay */}
      <div 
        className={`heartbeat-flash ${pulsePhase === 1 ? 'active' : ''}`}
        aria-hidden="true"
      />

      <style jsx>{`
        .confidence-heartbeat {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 4px 8px;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .confidence-heartbeat.compact {
          padding: 2px 4px;
          gap: 4px;
        }

        :global(.light) .confidence-heartbeat {
          background: rgba(0, 0, 0, 0.04);
          border-color: rgba(0, 0, 0, 0.08);
        }

        .confidence-heartbeat-svg {
          display: block;
          overflow: visible;
        }

        .heartbeat-line-group {
          transition: transform 0.3s ease;
        }

        .heartbeat-main-path {
          stroke-dasharray: 300;
          stroke-dashoffset: 0;
          animation: heartbeat-draw var(--pulse-interval) ease-in-out infinite;
        }

        .heartbeat-glow-path {
          opacity: 0.6;
          animation: heartbeat-glow-pulse var(--pulse-interval) ease-in-out infinite;
        }

        .heartbeat-pulse-dot {
          animation: heartbeat-dot-pulse var(--pulse-interval) ease-in-out infinite;
        }

        .heartbeat-flash {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: var(--heartbeat-glow);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.1s ease;
        }

        .heartbeat-flash.active {
          opacity: 0.3;
          animation: heartbeat-flash 0.15s ease-out;
        }

        .confidence-heartbeat-label {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 1px;
          min-width: 48px;
        }

        .probability-value {
          font-size: 14px;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
          color: var(--heartbeat-color);
          line-height: 1.1;
        }

        .confidence-level {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1;
        }

        :global(.light) .confidence-level {
          color: rgba(0, 0, 0, 0.5);
        }

        @keyframes heartbeat-draw {
          0%, 100% {
            stroke-dashoffset: 0;
            opacity: 0.7;
          }
          25% {
            opacity: 1;
          }
          50% {
            stroke-dashoffset: -50;
            opacity: 1;
          }
          75% {
            opacity: 0.8;
          }
        }

        @keyframes heartbeat-glow-pulse {
          0%, 100% {
            opacity: 0.3;
            filter: blur(2px);
          }
          50% {
            opacity: 0.7;
            filter: blur(3px);
          }
        }

        @keyframes heartbeat-dot-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.5);
            opacity: 1;
          }
        }

        @keyframes heartbeat-flash {
          0% {
            opacity: 0.4;
          }
          100% {
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .heartbeat-main-path,
          .heartbeat-glow-path,
          .heartbeat-pulse-dot {
            animation: none;
          }
          .heartbeat-flash {
            display: none;
          }
        }
      `}</style>
    </div>
  );
});

/**
 * HeartbeatInline - Compact inline heartbeat indicator
 * Perfect for displaying next to ticker symbols or in tables
 */
interface HeartbeatInlineProps {
  probability: number;
  className?: string;
}

export const HeartbeatInline = memo(function HeartbeatInline({
  probability,
  className = '',
}: HeartbeatInlineProps) {
  const { shouldAnimate } = useMotionPreferences();
  const prefersReducedMotion = !shouldAnimate('decorative');
  const config = useMemo(() => getECGConfig(probability), [probability]);

  return (
    <span
      className={`heartbeat-inline ${className}`}
      title={`${Math.round(probability)}% beat probability`}
      style={{
        '--heartbeat-color': config.color,
        '--pulse-interval': `${config.pulseInterval}ms`,
      } as CSSProperties}
    >
      <svg
        width="24"
        height="12"
        viewBox="0 0 100 50"
        className="heartbeat-inline-svg"
        aria-hidden="true"
      >
        <path
          d={config.path.split(' ').slice(0, 15).join(' ')}
          fill="none"
          stroke={config.color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={prefersReducedMotion ? '' : 'heartbeat-inline-path'}
        />
      </svg>
      
      <style jsx>{`
        .heartbeat-inline {
          display: inline-flex;
          align-items: center;
          vertical-align: middle;
        }

        .heartbeat-inline-svg {
          display: block;
        }

        .heartbeat-inline-path {
          animation: inline-pulse var(--pulse-interval) ease-in-out infinite;
        }

        @keyframes inline-pulse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .heartbeat-inline-path {
            animation: none;
            opacity: 1;
          }
        }
      `}</style>
    </span>
  );
});

/**
 * HeartbeatBadge - Badge variant with heartbeat + percentage
 */
interface HeartbeatBadgeProps {
  probability: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const HeartbeatBadge = memo(function HeartbeatBadge({
  probability,
  size = 'md',
  className = '',
}: HeartbeatBadgeProps) {
  const config = useMemo(() => getECGConfig(probability), [probability]);
  
  const sizeStyles = {
    sm: { width: 60, height: 24, fontSize: '11px' },
    md: { width: 80, height: 32, fontSize: '13px' },
    lg: { width: 100, height: 40, fontSize: '15px' },
  };

  const { width, height, fontSize } = sizeStyles[size];

  return (
    <div
      className={`heartbeat-badge heartbeat-badge-${size} ${className}`}
      style={{
        '--heartbeat-color': config.color,
        '--heartbeat-glow': config.glowColor,
      } as CSSProperties}
    >
      <ConfidenceHeartbeat
        probability={probability}
        width={width}
        height={height}
        showLabel={false}
        compact={size === 'sm'}
      />
      <span className="heartbeat-badge-value" style={{ fontSize }}>
        {Math.round(probability)}%
      </span>

      <style jsx>{`
        .heartbeat-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px 4px 6px;
          border-radius: 20px;
          background: linear-gradient(
            135deg,
            rgba(0, 0, 0, 0.3) 0%,
            rgba(0, 0, 0, 0.2) 100%
          );
          border: 1px solid var(--heartbeat-color);
          box-shadow: 
            0 0 12px var(--heartbeat-glow),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        :global(.light) .heartbeat-badge {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.8) 0%,
            rgba(255, 255, 255, 0.6) 100%
          );
          border-color: var(--heartbeat-color);
          box-shadow: 
            0 0 8px var(--heartbeat-glow),
            0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .heartbeat-badge-sm {
          padding: 2px 8px 2px 4px;
          gap: 4px;
        }

        .heartbeat-badge-lg {
          padding: 6px 14px 6px 8px;
          gap: 8px;
        }

        .heartbeat-badge-value {
          font-weight: 600;
          font-variant-numeric: tabular-nums;
          color: var(--heartbeat-color);
        }
      `}</style>
    </div>
  );
});

export default ConfidenceHeartbeat;
