'use client';

import React, { useEffect, useRef, useState, useMemo, memo } from 'react';

interface RetroCRTNumberProps {
  /** The number to display */
  value: number;
  /** Optional prefix (e.g., "$", "+") */
  prefix?: string;
  /** Optional suffix (e.g., "%", "K") */
  suffix?: string;
  /** Color theme */
  variant?: 'green' | 'amber' | 'blue' | 'white' | 'red';
  /** Font size in pixels */
  fontSize?: number;
  /** Enable scanline effect */
  scanlines?: boolean;
  /** Scanline intensity (0-1) */
  scanlineIntensity?: number;
  /** Enable phosphor glow */
  glow?: boolean;
  /** Glow intensity (0-1) */
  glowIntensity?: number;
  /** Enable screen curvature effect */
  curvature?: boolean;
  /** Enable subtle flicker */
  flicker?: boolean;
  /** Flicker intensity (0-1) */
  flickerIntensity?: number;
  /** Enable "power on" animation */
  powerOn?: boolean;
  /** Power on delay in ms */
  powerOnDelay?: number;
  /** Number of decimal places */
  decimals?: number;
  /** Animate value changes */
  animate?: boolean;
  /** Animation duration in ms */
  animationDuration?: number;
  /** Font family (monospace recommended) */
  fontFamily?: string;
  /** Additional class name */
  className?: string;
  /** Enable interlace effect */
  interlace?: boolean;
  /** Enable chromatic aberration on edges */
  chromaticAberration?: boolean;
  /** Enable CRT "warm up" glow on mount */
  warmUp?: boolean;
  /** Warm up duration in ms */
  warmUpDuration?: number;
}

const VARIANTS = {
  green: {
    color: '#00ff41',
    glowColor: 'rgba(0, 255, 65, 0.6)',
    shadowColor: 'rgba(0, 255, 65, 0.3)',
  },
  amber: {
    color: '#ffb000',
    glowColor: 'rgba(255, 176, 0, 0.6)',
    shadowColor: 'rgba(255, 176, 0, 0.3)',
  },
  blue: {
    color: '#00d4ff',
    glowColor: 'rgba(0, 212, 255, 0.6)',
    shadowColor: 'rgba(0, 212, 255, 0.3)',
  },
  white: {
    color: '#f0f0f0',
    glowColor: 'rgba(240, 240, 240, 0.5)',
    shadowColor: 'rgba(240, 240, 240, 0.25)',
  },
  red: {
    color: '#ff3b3b',
    glowColor: 'rgba(255, 59, 59, 0.6)',
    shadowColor: 'rgba(255, 59, 59, 0.3)',
  },
};

/**
 * RetroCRTNumber - Vintage CRT/terminal display effect for numbers
 * 
 * Creates an authentic retro computer terminal aesthetic with:
 * - Phosphor glow effect
 * - Scanline overlay
 * - Screen curvature (CSS perspective)
 * - Subtle flicker animation
 * - Power-on animation
 * - Chromatic aberration
 * 
 * Pairs well with DotMatrixDisplay for a full retro dashboard aesthetic.
 */
export const RetroCRTNumber = memo(function RetroCRTNumber({
  value,
  prefix = '',
  suffix = '',
  variant = 'green',
  fontSize = 32,
  scanlines = true,
  scanlineIntensity = 0.08,
  glow = true,
  glowIntensity = 0.7,
  curvature = true,
  flicker = true,
  flickerIntensity = 0.03,
  powerOn = true,
  powerOnDelay = 0,
  decimals = 0,
  animate = true,
  animationDuration = 400,
  fontFamily = '"IBM Plex Mono", "Fira Code", "SF Mono", monospace',
  className = '',
  interlace = false,
  chromaticAberration = false,
  warmUp = false,
  warmUpDuration = 800,
}: RetroCRTNumberProps) {
  const [displayValue, setDisplayValue] = useState(powerOn ? 0 : value);
  const [isPoweredOn, setIsPoweredOn] = useState(!powerOn);
  const [isWarmingUp, setIsWarmingUp] = useState(warmUp);
  const animationRef = useRef<number | null>(null);
  const previousValueRef = useRef(value);
  const containerRef = useRef<HTMLDivElement>(null);

  const colors = VARIANTS[variant];

  // Handle power-on animation
  useEffect(() => {
    if (!powerOn) {
      setIsPoweredOn(true);
      return;
    }

    const timer = setTimeout(() => {
      setIsPoweredOn(true);
      if (warmUp) {
        setTimeout(() => setIsWarmingUp(false), warmUpDuration);
      }
    }, powerOnDelay);

    return () => clearTimeout(timer);
  }, [powerOn, powerOnDelay, warmUp, warmUpDuration]);

  // Animate value changes
  useEffect(() => {
    if (!isPoweredOn) return;

    const startValue = previousValueRef.current;
    const endValue = value;
    previousValueRef.current = value;

    if (!animate || startValue === endValue) {
      setDisplayValue(endValue);
      return;
    }

    const startTime = performance.now();

    const animateValue = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);

      // Easing: ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * eased;

      setDisplayValue(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateValue);
      }
    };

    animationRef.current = requestAnimationFrame(animateValue);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, animate, animationDuration, isPoweredOn]);

  // Format the number
  const formattedValue = useMemo(() => {
    const num = displayValue.toFixed(decimals);
    return `${prefix}${num}${suffix}`;
  }, [displayValue, decimals, prefix, suffix]);

  // Generate unique ID for SVG filter
  const filterId = useMemo(() => `crt-filter-${Math.random().toString(36).substr(2, 9)}`, []);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily,
    fontSize: `${fontSize}px`,
    fontWeight: 600,
    color: colors.color,
    textShadow: glow
      ? `0 0 ${4 * glowIntensity}px ${colors.glowColor}, 
         0 0 ${8 * glowIntensity}px ${colors.glowColor}, 
         0 0 ${16 * glowIntensity}px ${colors.shadowColor}`
      : undefined,
    transform: curvature ? 'perspective(400px) rotateX(2deg)' : undefined,
    opacity: isPoweredOn ? 1 : 0,
    transition: isPoweredOn
      ? 'opacity 0.15s ease-out'
      : undefined,
    filter: chromaticAberration ? `url(#${filterId})` : undefined,
  };

  const textStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 2,
    letterSpacing: '0.02em',
    // Add slight text shadow for depth
    textShadow: glow
      ? `0 0 ${4 * glowIntensity}px ${colors.glowColor}, 
         0 0 ${8 * glowIntensity}px ${colors.glowColor}, 
         0 0 ${16 * glowIntensity}px ${colors.shadowColor},
         0 2px 4px rgba(0,0,0,0.5)`
      : '0 2px 4px rgba(0,0,0,0.5)',
  };

  return (
    <>
      {/* SVG filter for chromatic aberration */}
      {chromaticAberration && (
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
          <defs>
            <filter id={filterId}>
              <feOffset in="SourceGraphic" dx="-1" dy="0" result="red">
                <feColorMatrix
                  type="matrix"
                  values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
                />
              </feOffset>
              <feOffset in="SourceGraphic" dx="1" dy="0" result="blue">
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
                />
              </feOffset>
              <feBlend in="red" in2="blue" mode="screen" />
            </filter>
          </defs>
        </svg>
      )}

      <div
        ref={containerRef}
        className={`retro-crt-number ${className}`}
        style={containerStyle}
        data-variant={variant}
        aria-label={formattedValue}
      >
        {/* Warm-up overlay */}
        {warmUp && (
          <div
            className="crt-warmup-overlay"
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(ellipse at center, ${colors.glowColor} 0%, transparent 70%)`,
              opacity: isWarmingUp ? 0.4 : 0,
              transition: `opacity ${warmUpDuration}ms ease-out`,
              pointerEvents: 'none',
              zIndex: 3,
            }}
          />
        )}

        {/* Main number display */}
        <span style={textStyle}>{formattedValue}</span>

        {/* Scanlines overlay */}
        {scanlines && (
          <div
            className="crt-scanlines"
            style={{
              position: 'absolute',
              inset: 0,
              background: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 1px,
                rgba(0, 0, 0, ${scanlineIntensity}) 1px,
                rgba(0, 0, 0, ${scanlineIntensity}) 2px
              )`,
              pointerEvents: 'none',
              zIndex: 4,
              mixBlendMode: 'multiply',
            }}
          />
        )}

        {/* Interlace effect (alternating scanlines that shimmer) */}
        {interlace && (
          <div
            className="crt-interlace"
            style={{
              position: 'absolute',
              inset: 0,
              background: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(255, 255, 255, 0.02) 2px,
                rgba(255, 255, 255, 0.02) 4px
              )`,
              pointerEvents: 'none',
              zIndex: 5,
              animation: 'crt-interlace-flicker 0.1s infinite',
            }}
          />
        )}

        {/* Flicker animation */}
        {flicker && isPoweredOn && (
          <div
            className="crt-flicker"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'transparent',
              pointerEvents: 'none',
              zIndex: 6,
              animation: `crt-flicker ${0.15 + Math.random() * 0.1}s infinite`,
              opacity: flickerIntensity,
            }}
          />
        )}

        {/* Curvature vignette (darkened edges) */}
        {curvature && (
          <div
            className="crt-vignette"
            style={{
              position: 'absolute',
              inset: -4,
              background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.3) 100%)',
              pointerEvents: 'none',
              zIndex: 3,
              borderRadius: '4px',
            }}
          />
        )}

        {/* CSS Keyframes */}
        <style jsx>{`
          @keyframes crt-flicker {
            0%, 100% { opacity: ${flickerIntensity}; }
            50% { opacity: ${flickerIntensity * 0.5}; }
            75% { opacity: ${flickerIntensity * 1.2}; }
          }

          @keyframes crt-interlace-flicker {
            0% { transform: translateY(0); }
            50% { transform: translateY(1px); }
            100% { transform: translateY(0); }
          }

          .retro-crt-number {
            /* Respect reduced motion preferences */
            @media (prefers-reduced-motion: reduce) {
              animation: none !important;
            }
          }

          .retro-crt-number .crt-flicker,
          .retro-crt-number .crt-interlace {
            @media (prefers-reduced-motion: reduce) {
              animation: none !important;
              display: none;
            }
          }
        `}</style>
      </div>
    </>
  );
});

/**
 * CRTStatCard - A stat card with CRT display aesthetic
 */
interface CRTStatCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  variant?: 'green' | 'amber' | 'blue' | 'white' | 'red';
  sublabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  compact?: boolean;
  className?: string;
}

export const CRTStatCard = memo(function CRTStatCard({
  label,
  value,
  prefix,
  suffix,
  variant = 'green',
  sublabel,
  trend,
  trendValue,
  compact = false,
  className = '',
}: CRTStatCardProps) {
  const colors = VARIANTS[variant];
  const trendVariant = trend === 'up' ? 'green' : trend === 'down' ? 'red' : 'white';

  return (
    <div
      className={`crt-stat-card ${compact ? 'crt-stat-card-compact' : ''} ${className}`}
      style={{
        position: 'relative',
        padding: compact ? '12px 16px' : '16px 20px',
        background: 'linear-gradient(180deg, rgba(0,20,0,0.95) 0%, rgba(0,10,0,0.98) 100%)',
        borderRadius: '8px',
        border: `1px solid ${colors.color}20`,
        boxShadow: `
          inset 0 1px 0 ${colors.color}10,
          0 4px 20px rgba(0,0,0,0.4),
          0 0 40px ${colors.shadowColor}
        `,
        overflow: 'hidden',
      }}
    >
      {/* Bezel effect */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '8px',
          border: '2px solid rgba(40,40,40,0.5)',
          pointerEvents: 'none',
        }}
      />

      {/* Label */}
      <div
        style={{
          fontSize: compact ? '10px' : '11px',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: colors.color,
          opacity: 0.6,
          marginBottom: compact ? '4px' : '8px',
          fontFamily: '"IBM Plex Mono", monospace',
        }}
      >
        {label}
      </div>

      {/* Value */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <RetroCRTNumber
          value={value}
          prefix={prefix}
          suffix={suffix}
          variant={variant}
          fontSize={compact ? 24 : 32}
          scanlines={true}
          scanlineIntensity={0.05}
          glow={true}
          glowIntensity={0.6}
          curvature={false}
          flicker={true}
          flickerIntensity={0.02}
          powerOn={true}
          powerOnDelay={100}
          animate={true}
          animationDuration={500}
        />

        {/* Trend indicator */}
        {trend && trendValue !== undefined && (
          <RetroCRTNumber
            value={Math.abs(trendValue)}
            prefix={trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''}
            suffix="%"
            variant={trendVariant}
            fontSize={compact ? 12 : 14}
            scanlines={false}
            glow={true}
            glowIntensity={0.4}
            curvature={false}
            flicker={false}
            animate={true}
            decimals={1}
          />
        )}
      </div>

      {/* Sublabel */}
      {sublabel && (
        <div
          style={{
            fontSize: '10px',
            color: colors.color,
            opacity: 0.4,
            marginTop: '4px',
            fontFamily: '"IBM Plex Mono", monospace',
          }}
        >
          {sublabel}
        </div>
      )}

      {/* Screen reflection */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '40%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)',
          pointerEvents: 'none',
          borderRadius: '8px 8px 0 0',
        }}
      />
    </div>
  );
});

/**
 * CRTBadge - Small CRT-styled badge for inline display
 */
interface CRTBadgeProps {
  value: number | string;
  variant?: 'green' | 'amber' | 'blue' | 'white' | 'red';
  prefix?: string;
  suffix?: string;
  glow?: boolean;
  className?: string;
}

export const CRTBadge = memo(function CRTBadge({
  value,
  variant = 'green',
  prefix = '',
  suffix = '',
  glow = true,
  className = '',
}: CRTBadgeProps) {
  const colors = VARIANTS[variant];
  const displayValue = typeof value === 'number' ? value.toString() : value;

  return (
    <span
      className={`crt-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        background: 'rgba(0,15,0,0.9)',
        borderRadius: '4px',
        border: `1px solid ${colors.color}30`,
        fontFamily: '"IBM Plex Mono", "Fira Code", monospace',
        fontSize: '12px',
        fontWeight: 600,
        color: colors.color,
        textShadow: glow
          ? `0 0 4px ${colors.glowColor}, 0 0 8px ${colors.shadowColor}`
          : undefined,
        boxShadow: glow ? `0 0 12px ${colors.shadowColor}` : undefined,
        letterSpacing: '0.02em',
      }}
    >
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
});

/**
 * CRTProgress - CRT-styled horizontal progress bar
 */
interface CRTProgressProps {
  value: number;
  max?: number;
  variant?: 'green' | 'amber' | 'blue' | 'white' | 'red';
  height?: number;
  showValue?: boolean;
  animate?: boolean;
  label?: string;
  className?: string;
}

export const CRTProgress = memo(function CRTProgress({
  value,
  max = 100,
  variant = 'green',
  height = 8,
  showValue = true,
  animate = true,
  label,
  className = '',
}: CRTProgressProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const colors = VARIANTS[variant];
  const percentage = Math.min((value / max) * 100, 100);

  useEffect(() => {
    if (!animate) {
      setDisplayValue(percentage);
      return;
    }

    const startTime = performance.now();
    const duration = 600;

    const animateProgress = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(percentage * eased);

      if (progress < 1) {
        requestAnimationFrame(animateProgress);
      }
    };

    requestAnimationFrame(animateProgress);
  }, [percentage, animate]);

  return (
    <div className={`crt-progress ${className}`}>
      {(label || showValue) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '4px',
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: '10px',
            color: colors.color,
            opacity: 0.7,
          }}
        >
          {label && <span>{label}</span>}
          {showValue && (
            <span style={{ textShadow: `0 0 4px ${colors.glowColor}` }}>
              {Math.round(displayValue)}%
            </span>
          )}
        </div>
      )}
      <div
        style={{
          position: 'relative',
          height: `${height}px`,
          background: 'rgba(0,15,0,0.9)',
          borderRadius: '2px',
          overflow: 'hidden',
          border: `1px solid ${colors.color}20`,
        }}
      >
        {/* Progress fill */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${displayValue}%`,
            background: `linear-gradient(90deg, ${colors.color}80, ${colors.color})`,
            boxShadow: `0 0 10px ${colors.glowColor}, inset 0 0 4px ${colors.glowColor}`,
            transition: animate ? undefined : 'width 0.3s ease-out',
            borderRadius: '1px',
          }}
        />

        {/* Scanlines */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 1px,
              rgba(0, 0, 0, 0.15) 1px,
              rgba(0, 0, 0, 0.15) 2px
            )`,
            pointerEvents: 'none',
          }}
        />

        {/* Glow line at edge */}
        <div
          style={{
            position: 'absolute',
            left: `${displayValue}%`,
            top: 0,
            bottom: 0,
            width: '2px',
            background: colors.color,
            boxShadow: `0 0 8px ${colors.glowColor}, 0 0 16px ${colors.glowColor}`,
            opacity: displayValue > 0 && displayValue < 100 ? 1 : 0,
            transform: 'translateX(-50%)',
          }}
        />
      </div>
    </div>
  );
});

export default RetroCRTNumber;
