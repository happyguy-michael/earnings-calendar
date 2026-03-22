'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { Earning } from '@/lib/types';

interface EarningsSeasonMeterProps {
  earnings: Earning[];
  /** Display variant */
  variant?: 'horizontal' | 'vertical' | 'radial';
  /** Size of the meter */
  size?: 'sm' | 'md' | 'lg';
  /** Show detailed breakdown tooltip */
  showTooltip?: boolean;
  /** Animation delay in ms */
  delay?: number;
  /** Show beat/miss breakdown in the fill */
  showBreakdown?: boolean;
  /** Show percentage label */
  showPercentage?: boolean;
  /** Show "X of Y reported" label */
  showCount?: boolean;
  /** Additional className */
  className?: string;
  /** Liquid wave animation */
  liquidEffect?: boolean;
  /** Glow effect based on beat rate */
  glowOnSuccess?: boolean;
}

/**
 * EarningsSeasonMeter - Visual thermometer showing earnings season progress
 * 
 * Features:
 * - Liquid fill animation with wave effect
 * - Beat/miss color breakdown
 * - Radial and linear variants
 * - Glow effect for high beat rates
 * - Real-time progress tracking
 */
export function EarningsSeasonMeter({
  earnings,
  variant = 'horizontal',
  size = 'md',
  showTooltip = true,
  delay = 0,
  showBreakdown = true,
  showPercentage = true,
  showCount = true,
  className = '',
  liquidEffect = true,
  glowOnSuccess = true,
}: EarningsSeasonMeterProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate season stats
  const stats = useMemo(() => {
    const total = earnings.length;
    const reported = earnings.filter(e => e.eps !== undefined && e.eps !== null).length;
    const beats = earnings.filter(e => e.result === 'beat').length;
    const misses = earnings.filter(e => e.result === 'miss').length;
    const pending = total - reported;
    
    const progressPercent = total > 0 ? (reported / total) * 100 : 0;
    const beatPercent = reported > 0 ? (beats / reported) * 100 : 0;
    const beatOfTotal = total > 0 ? (beats / total) * 100 : 0;
    const missOfTotal = total > 0 ? (misses / total) * 100 : 0;

    return {
      total,
      reported,
      beats,
      misses,
      pending,
      progressPercent,
      beatPercent,
      beatOfTotal,
      missOfTotal,
    };
  }, [earnings]);

  // Trigger animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Size configs
  const sizeConfig = {
    sm: { height: 6, fontSize: 10, padding: 2 },
    md: { height: 10, fontSize: 12, padding: 4 },
    lg: { height: 16, fontSize: 14, padding: 6 },
  };

  const config = sizeConfig[size];
  
  // Determine glow color based on beat rate
  const glowColor = stats.beatPercent >= 70 
    ? 'rgba(34, 197, 94, 0.4)' 
    : stats.beatPercent >= 50 
    ? 'rgba(251, 191, 36, 0.3)' 
    : 'rgba(239, 68, 68, 0.3)';

  const glowActive = glowOnSuccess && stats.beatPercent >= 60 && stats.reported > 0;

  if (variant === 'radial') {
    return (
      <RadialMeter
        stats={stats}
        size={size}
        isAnimating={isAnimating}
        showPercentage={showPercentage}
        showBreakdown={showBreakdown}
        liquidEffect={liquidEffect}
        glowColor={glowColor}
        glowActive={glowActive}
        className={className}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className={`earnings-season-meter ${variant} ${size} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-animating={isAnimating}
      style={{
        '--glow-color': glowColor,
        '--glow-active': glowActive ? 1 : 0,
        '--progress': `${isAnimating ? stats.progressPercent : 0}%`,
        '--beat-width': `${stats.beatOfTotal}%`,
        '--miss-width': `${stats.missOfTotal}%`,
        '--pending-width': `${100 - stats.progressPercent}%`,
      } as React.CSSProperties}
    >
      {/* Label row */}
      {(showPercentage || showCount) && (
        <div className="meter-labels">
          {showPercentage && (
            <span className="meter-percentage">
              <span className="meter-percentage-value">
                {Math.round(stats.progressPercent)}
              </span>
              <span className="meter-percentage-symbol">%</span>
              <span className="meter-percentage-label">complete</span>
            </span>
          )}
          {showCount && (
            <span className="meter-count">
              <span className="meter-count-reported">{stats.reported}</span>
              <span className="meter-count-divider">/</span>
              <span className="meter-count-total">{stats.total}</span>
              <span className="meter-count-label">reported</span>
            </span>
          )}
        </div>
      )}

      {/* Main meter track */}
      <div 
        className="meter-track"
        style={{ height: config.height }}
      >
        {/* Background pulse for pending */}
        <div className="meter-pending-pulse" />
        
        {/* Beat segment - green */}
        {showBreakdown && stats.beats > 0 && (
          <div 
            className="meter-segment beat"
            style={{ 
              width: isAnimating ? `${stats.beatOfTotal}%` : '0%',
              transitionDelay: `${delay}ms`,
            }}
          >
            {liquidEffect && <div className="meter-liquid-wave" />}
          </div>
        )}
        
        {/* Miss segment - red */}
        {showBreakdown && stats.misses > 0 && (
          <div 
            className="meter-segment miss"
            style={{ 
              width: isAnimating ? `${stats.missOfTotal}%` : '0%',
              left: `${stats.beatOfTotal}%`,
              transitionDelay: `${delay + 100}ms`,
            }}
          />
        )}
        
        {/* Simple progress fill (when not showing breakdown) */}
        {!showBreakdown && (
          <div 
            className="meter-fill"
            style={{ 
              width: isAnimating ? `${stats.progressPercent}%` : '0%',
              transitionDelay: `${delay}ms`,
            }}
          >
            {liquidEffect && <div className="meter-liquid-wave" />}
          </div>
        )}

        {/* Progress marker line */}
        <div 
          className="meter-marker"
          style={{ 
            left: isAnimating ? `${stats.progressPercent}%` : '0%',
            transitionDelay: `${delay + 200}ms`,
          }}
        />
        
        {/* Glow effect */}
        {glowActive && (
          <div className="meter-glow" />
        )}
      </div>

      {/* Beat rate mini indicator */}
      {showBreakdown && stats.reported > 0 && (
        <div className="meter-beat-rate">
          <span 
            className="meter-beat-rate-value"
            data-good={stats.beatPercent >= 60}
          >
            {Math.round(stats.beatPercent)}% beat rate
          </span>
        </div>
      )}

      {/* Hover tooltip */}
      {showTooltip && isHovered && (
        <div className="meter-tooltip">
          <div className="meter-tooltip-row">
            <span className="meter-tooltip-dot beat" />
            <span>Beats: {stats.beats}</span>
          </div>
          <div className="meter-tooltip-row">
            <span className="meter-tooltip-dot miss" />
            <span>Misses: {stats.misses}</span>
          </div>
          <div className="meter-tooltip-row">
            <span className="meter-tooltip-dot pending" />
            <span>Pending: {stats.pending}</span>
          </div>
          <div className="meter-tooltip-divider" />
          <div className="meter-tooltip-row highlight">
            <span>Season Progress</span>
            <span>{Math.round(stats.progressPercent)}%</span>
          </div>
        </div>
      )}

      <style jsx>{`
        .earnings-season-meter {
          position: relative;
          width: 100%;
        }

        .meter-labels {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 6px;
          gap: 12px;
        }

        .meter-percentage {
          display: flex;
          align-items: baseline;
          gap: 2px;
        }

        .meter-percentage-value {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary, #fff);
          font-variant-numeric: tabular-nums;
          letter-spacing: -0.02em;
        }

        .meter-percentage-symbol {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary, #a1a1aa);
          margin-right: 4px;
        }

        .meter-percentage-label {
          font-size: 11px;
          color: var(--text-faint, #71717a);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .meter-count {
          display: flex;
          align-items: baseline;
          gap: 2px;
          font-size: 12px;
        }

        .meter-count-reported {
          font-weight: 600;
          color: var(--text-primary, #fff);
        }

        .meter-count-divider {
          color: var(--text-faint, #71717a);
          margin: 0 1px;
        }

        .meter-count-total {
          color: var(--text-secondary, #a1a1aa);
        }

        .meter-count-label {
          color: var(--text-faint, #71717a);
          margin-left: 4px;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .meter-track {
          position: relative;
          width: 100%;
          background: var(--surface-elevated, rgba(255, 255, 255, 0.05));
          border-radius: 999px;
          overflow: hidden;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .meter-pending-pulse {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(251, 191, 36, 0.1) 50%,
            transparent 100%
          );
          animation: meterPendingPulse 3s ease-in-out infinite;
        }

        @keyframes meterPendingPulse {
          0%, 100% { opacity: 0; transform: translateX(-100%); }
          50% { opacity: 1; }
          100% { transform: translateX(100%); }
        }

        .meter-segment,
        .meter-fill {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          transition: width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          overflow: hidden;
        }

        .meter-segment.beat {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          z-index: 2;
        }

        .meter-segment.miss {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          z-index: 1;
        }

        .meter-fill {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          z-index: 1;
        }

        .meter-liquid-wave {
          position: absolute;
          top: 0;
          right: -20px;
          width: 40px;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: meterWave 2s ease-in-out infinite;
        }

        @keyframes meterWave {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .meter-marker {
          position: absolute;
          top: -2px;
          bottom: -2px;
          width: 3px;
          background: var(--text-primary, #fff);
          border-radius: 2px;
          transform: translateX(-50%);
          transition: left 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          z-index: 10;
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
        }

        .meter-glow {
          position: absolute;
          inset: -4px;
          border-radius: 999px;
          background: var(--glow-color);
          filter: blur(8px);
          opacity: 0.6;
          animation: meterGlow 2s ease-in-out infinite;
          z-index: 0;
        }

        @keyframes meterGlow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }

        .meter-beat-rate {
          margin-top: 6px;
          text-align: right;
        }

        .meter-beat-rate-value {
          font-size: 10px;
          color: var(--text-faint, #71717a);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .meter-beat-rate-value[data-good="true"] {
          color: #22c55e;
        }

        /* Tooltip */
        .meter-tooltip {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 12px;
          background: var(--surface-elevated, rgba(24, 24, 27, 0.98));
          border: 1px solid var(--border, rgba(255, 255, 255, 0.1));
          border-radius: 12px;
          padding: 10px 14px;
          min-width: 160px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          z-index: 100;
          animation: tooltipIn 0.2s ease-out;
        }

        @keyframes tooltipIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .meter-tooltip-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          font-size: 12px;
          color: var(--text-secondary, #a1a1aa);
          padding: 3px 0;
        }

        .meter-tooltip-row.highlight {
          color: var(--text-primary, #fff);
          font-weight: 500;
        }

        .meter-tooltip-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .meter-tooltip-dot.beat {
          background: #22c55e;
        }

        .meter-tooltip-dot.miss {
          background: #ef4444;
        }

        .meter-tooltip-dot.pending {
          background: #f59e0b;
        }

        .meter-tooltip-divider {
          height: 1px;
          background: var(--border, rgba(255, 255, 255, 0.1));
          margin: 8px 0;
        }

        /* Size variants */
        .earnings-season-meter.sm .meter-percentage-value {
          font-size: 14px;
        }

        .earnings-season-meter.lg .meter-percentage-value {
          font-size: 24px;
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .meter-segment,
          .meter-fill,
          .meter-marker {
            transition: none;
          }
          
          .meter-liquid-wave,
          .meter-pending-pulse,
          .meter-glow {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * RadialMeter - Circular variant of the season meter
 */
function RadialMeter({
  stats,
  size,
  isAnimating,
  showPercentage,
  showBreakdown,
  liquidEffect,
  glowColor,
  glowActive,
  className,
}: {
  stats: {
    total: number;
    reported: number;
    beats: number;
    misses: number;
    pending: number;
    progressPercent: number;
    beatPercent: number;
    beatOfTotal: number;
    missOfTotal: number;
  };
  size: 'sm' | 'md' | 'lg';
  isAnimating: boolean;
  showPercentage: boolean;
  showBreakdown: boolean;
  liquidEffect: boolean;
  glowColor: string;
  glowActive: boolean;
  className: string;
}) {
  const sizeConfig = {
    sm: { diameter: 48, strokeWidth: 4 },
    md: { diameter: 72, strokeWidth: 6 },
    lg: { diameter: 96, strokeWidth: 8 },
  };

  const config = sizeConfig[size];
  const radius = (config.diameter - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const beatOffset = circumference - (stats.beatOfTotal / 100) * circumference;
  const missOffset = circumference - (stats.missOfTotal / 100) * circumference;
  const progressOffset = circumference - (stats.progressPercent / 100) * circumference;

  return (
    <div 
      className={`radial-meter ${size} ${className}`}
      style={{
        '--glow-color': glowColor,
        '--diameter': `${config.diameter}px`,
      } as React.CSSProperties}
    >
      <svg
        width={config.diameter}
        height={config.diameter}
        viewBox={`0 0 ${config.diameter} ${config.diameter}`}
        className="radial-meter-svg"
      >
        {/* Background track */}
        <circle
          cx={config.diameter / 2}
          cy={config.diameter / 2}
          r={radius}
          fill="none"
          stroke="var(--surface-elevated, rgba(255, 255, 255, 0.05))"
          strokeWidth={config.strokeWidth}
        />
        
        {/* Progress ring */}
        {showBreakdown ? (
          <>
            {/* Beat arc */}
            <circle
              cx={config.diameter / 2}
              cy={config.diameter / 2}
              r={radius}
              fill="none"
              stroke="#22c55e"
              strokeWidth={config.strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={isAnimating ? beatOffset : circumference}
              strokeLinecap="round"
              transform={`rotate(-90 ${config.diameter / 2} ${config.diameter / 2})`}
              className="radial-meter-arc beat"
            />
            {/* Miss arc */}
            <circle
              cx={config.diameter / 2}
              cy={config.diameter / 2}
              r={radius}
              fill="none"
              stroke="#ef4444"
              strokeWidth={config.strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={isAnimating ? missOffset : circumference}
              strokeLinecap="round"
              transform={`rotate(${-90 + (stats.beatOfTotal / 100) * 360} ${config.diameter / 2} ${config.diameter / 2})`}
              className="radial-meter-arc miss"
            />
          </>
        ) : (
          <circle
            cx={config.diameter / 2}
            cy={config.diameter / 2}
            r={radius}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={config.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={isAnimating ? progressOffset : circumference}
            strokeLinecap="round"
            transform={`rotate(-90 ${config.diameter / 2} ${config.diameter / 2})`}
            className="radial-meter-arc"
          />
        )}
        
        {/* Glow filter */}
        {glowActive && (
          <defs>
            <filter id="radialGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        )}
      </svg>

      {/* Center content */}
      {showPercentage && (
        <div className="radial-meter-center">
          <span className="radial-meter-value">{Math.round(stats.progressPercent)}</span>
          <span className="radial-meter-symbol">%</span>
        </div>
      )}

      <style jsx>{`
        .radial-meter {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: var(--diameter);
          height: var(--diameter);
        }

        .radial-meter-svg {
          position: absolute;
          inset: 0;
        }

        .radial-meter-arc {
          transition: stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .radial-meter-arc.beat {
          filter: ${glowActive ? 'url(#radialGlow)' : 'none'};
        }

        .radial-meter-center {
          display: flex;
          align-items: baseline;
          justify-content: center;
          z-index: 1;
        }

        .radial-meter-value {
          font-size: ${size === 'sm' ? '12px' : size === 'md' ? '18px' : '24px'};
          font-weight: 700;
          color: var(--text-primary, #fff);
          font-variant-numeric: tabular-nums;
        }

        .radial-meter-symbol {
          font-size: ${size === 'sm' ? '8px' : size === 'md' ? '10px' : '12px'};
          color: var(--text-secondary, #a1a1aa);
          margin-left: 1px;
        }

        @media (prefers-reduced-motion: reduce) {
          .radial-meter-arc {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * MiniSeasonMeter - Ultra-compact variant for header/toolbar
 */
export function MiniSeasonMeter({
  earnings,
  showLabel = true,
  className = '',
}: {
  earnings: Earning[];
  showLabel?: boolean;
  className?: string;
}) {
  const stats = useMemo(() => {
    const total = earnings.length;
    const reported = earnings.filter(e => e.eps !== undefined && e.eps !== null).length;
    const beats = earnings.filter(e => e.result === 'beat').length;
    const progressPercent = total > 0 ? (reported / total) * 100 : 0;
    const beatPercent = reported > 0 ? (beats / reported) * 100 : 0;
    
    return { total, reported, progressPercent, beatPercent };
  }, [earnings]);

  const [animated, setAnimated] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`mini-season-meter ${className}`}>
      <div className="mini-meter-track">
        <div 
          className="mini-meter-fill"
          style={{ width: animated ? `${stats.progressPercent}%` : '0%' }}
        />
      </div>
      {showLabel && (
        <span className="mini-meter-label">
          {Math.round(stats.progressPercent)}%
        </span>
      )}

      <style jsx>{`
        .mini-season-meter {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .mini-meter-track {
          width: 40px;
          height: 4px;
          background: var(--surface-elevated, rgba(255, 255, 255, 0.1));
          border-radius: 2px;
          overflow: hidden;
        }

        .mini-meter-fill {
          height: 100%;
          background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%);
          border-radius: 2px;
          transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .mini-meter-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-secondary, #a1a1aa);
          font-variant-numeric: tabular-nums;
        }

        @media (prefers-reduced-motion: reduce) {
          .mini-meter-fill {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}

export default EarningsSeasonMeter;
