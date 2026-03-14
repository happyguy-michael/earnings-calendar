'use client';

import { useEffect, useState, memo, CSSProperties, ReactNode } from 'react';

/**
 * WaveformBars - Animated Audio Visualizer Effect
 * 
 * Creates pulsating vertical bars that mimic an audio waveform/equalizer.
 * A premium micro-interaction pattern used by Spotify, Apple Music, and
 * modern finance dashboards to indicate "activity" or "live" status.
 * 
 * Inspiration:
 * - Spotify's "Now Playing" indicator
 * - Apple Music's waveform visualizer
 * - Trading terminals' live data indicators
 * - 2024/2025 trend: Organic, "alive" UI indicators
 * 
 * Use cases:
 * - "Live" market session indicators
 * - Pending earnings (about to announce)
 * - Loading/syncing states
 * - Active filter indicators
 * - Real-time data stream indicators
 * 
 * Features:
 * - Variable bar count (2-6 bars)
 * - Multiple animation styles (random, sync, wave)
 * - Size presets (xs, sm, md, lg)
 * - Color customization
 * - Respects prefers-reduced-motion (shows static bars)
 * - GPU-accelerated animations
 * 
 * @example
 * <WaveformBars />
 * <WaveformBars size="lg" color="success" variant="wave" />
 * <WaveformBars bars={3} paused />
 */

type Size = 'xs' | 'sm' | 'md' | 'lg';
type Variant = 'random' | 'sync' | 'wave' | 'bounce';
type ColorScheme = 'default' | 'success' | 'warning' | 'danger' | 'muted' | 'gradient';

interface WaveformBarsProps {
  /** Number of bars (2-6). Default: 4 */
  bars?: number;
  /** Size preset. Default: 'sm' */
  size?: Size;
  /** Animation variant. Default: 'random' */
  variant?: Variant;
  /** Color scheme. Default: 'default' */
  color?: ColorScheme;
  /** Pause animation. Default: false */
  paused?: boolean;
  /** Gap between bars in pixels. Default: based on size */
  gap?: number;
  /** Custom bar width in pixels. Overrides size preset */
  barWidth?: number;
  /** Custom max bar height in pixels. Overrides size preset */
  maxHeight?: number;
  /** Custom min bar height as percentage of max (0-1). Default: 0.2 */
  minHeightRatio?: number;
  /** Animation speed multiplier. Default: 1 */
  speed?: number;
  /** Additional className */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
  /** Accessible label */
  label?: string;
}

// Size presets
const SIZE_CONFIG: Record<Size, { barWidth: number; maxHeight: number; gap: number }> = {
  xs: { barWidth: 2, maxHeight: 10, gap: 1 },
  sm: { barWidth: 3, maxHeight: 14, gap: 2 },
  md: { barWidth: 4, maxHeight: 20, gap: 2 },
  lg: { barWidth: 5, maxHeight: 28, gap: 3 },
};

// Color presets
const COLOR_CONFIG: Record<ColorScheme, { bar: string; glow?: string }> = {
  default: { bar: 'var(--foreground)', glow: undefined },
  success: { bar: '#22c55e', glow: 'rgba(34, 197, 94, 0.4)' },
  warning: { bar: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' },
  danger: { bar: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' },
  muted: { bar: 'var(--muted-foreground)', glow: undefined },
  gradient: { bar: 'url(#waveformGradient)', glow: 'rgba(139, 92, 246, 0.3)' },
};

// Generate random delays for each bar (seeded by index for consistency)
function getRandomDelays(count: number, variant: Variant): number[] {
  switch (variant) {
    case 'sync':
      return Array(count).fill(0);
    case 'wave':
      return Array.from({ length: count }, (_, i) => i * 0.1);
    case 'bounce':
      return Array.from({ length: count }, (_, i) => 
        i < count / 2 ? i * 0.08 : (count - 1 - i) * 0.08
      );
    case 'random':
    default:
      // Pseudo-random but consistent delays
      return Array.from({ length: count }, (_, i) => ((i * 37) % 10) / 10);
  }
}

// Generate random durations for each bar
function getRandomDurations(count: number, variant: Variant, speedMultiplier: number): number[] {
  const base = 0.6 / speedMultiplier;
  
  switch (variant) {
    case 'sync':
      return Array(count).fill(base);
    case 'wave':
    case 'bounce':
      return Array(count).fill(base * 0.8);
    case 'random':
    default:
      // Varied durations for organic feel
      return Array.from({ length: count }, (_, i) => 
        base * (0.8 + ((i * 31) % 5) / 10)
      );
  }
}

function WaveformBarsComponent({
  bars = 4,
  size = 'sm',
  variant = 'random',
  color = 'default',
  paused = false,
  gap,
  barWidth,
  maxHeight,
  minHeightRatio = 0.2,
  speed = 1,
  className = '',
  style,
  label = 'Activity indicator',
}: WaveformBarsProps) {
  const [mounted, setMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Hydration-safe mounting
  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Clamp bar count
  const barCount = Math.max(2, Math.min(6, bars));
  
  // Get size config
  const sizeConfig = SIZE_CONFIG[size];
  const finalBarWidth = barWidth ?? sizeConfig.barWidth;
  const finalMaxHeight = maxHeight ?? sizeConfig.maxHeight;
  const finalGap = gap ?? sizeConfig.gap;
  
  // Get color config
  const colorConfig = COLOR_CONFIG[color];
  
  // Calculate delays and durations
  const delays = getRandomDelays(barCount, variant);
  const durations = getRandomDurations(barCount, variant, speed);

  // Calculate container width
  const containerWidth = barCount * finalBarWidth + (barCount - 1) * finalGap;

  // Don't render until mounted (SSR safety)
  if (!mounted) {
    return (
      <div 
        className={`waveform-bars ${className}`}
        style={{ 
          width: containerWidth, 
          height: finalMaxHeight,
          ...style 
        }}
        aria-label={label}
      />
    );
  }

  const shouldAnimate = !prefersReducedMotion && !paused;

  return (
    <>
      {/* Gradient definition for gradient color scheme */}
      {color === 'gradient' && (
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <linearGradient id="waveformGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#c4b5fd" />
            </linearGradient>
          </defs>
        </svg>
      )}
      
      <div 
        className={`waveform-bars ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: finalGap,
          width: containerWidth,
          height: finalMaxHeight,
          ...style,
        }}
        role="img"
        aria-label={label}
      >
        {Array.from({ length: barCount }).map((_, i) => {
          const minHeight = finalMaxHeight * minHeightRatio;
          
          return (
            <div
              key={i}
              className="waveform-bar"
              style={{
                width: finalBarWidth,
                height: shouldAnimate ? undefined : `${minHeight + (finalMaxHeight - minHeight) * 0.5}px`,
                minHeight: minHeight,
                maxHeight: finalMaxHeight,
                borderRadius: finalBarWidth / 2,
                background: colorConfig.bar,
                boxShadow: colorConfig.glow ? `0 0 8px ${colorConfig.glow}` : undefined,
                animation: shouldAnimate 
                  ? `waveform-pulse ${durations[i]}s ease-in-out ${delays[i]}s infinite alternate`
                  : undefined,
                transform: 'translateZ(0)', // GPU acceleration
                willChange: shouldAnimate ? 'height' : undefined,
                transition: shouldAnimate ? undefined : 'height 0.3s ease',
              }}
            />
          );
        })}
      </div>

      {/* Keyframes injection */}
      <style jsx global>{`
        @keyframes waveform-pulse {
          0% {
            height: ${finalMaxHeight * minHeightRatio}px;
          }
          100% {
            height: ${finalMaxHeight}px;
          }
        }
        
        /* Reduced motion: static bars at varying heights */
        @media (prefers-reduced-motion: reduce) {
          .waveform-bar {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}

// Memoize to prevent unnecessary re-renders
export const WaveformBars = memo(WaveformBarsComponent);

/**
 * WaveformBarsInline - Inline variant for use within text
 * 
 * Wraps WaveformBars with inline-flex display and vertical alignment
 * for seamless integration within text content.
 * 
 * @example
 * <p>Live <WaveformBarsInline /> Market Open</p>
 */
interface WaveformBarsInlineProps extends WaveformBarsProps {
  /** Vertical alignment. Default: 'middle' */
  align?: 'baseline' | 'middle' | 'text-bottom';
}

export function WaveformBarsInline({ 
  align = 'middle',
  size = 'xs',
  style,
  ...props 
}: WaveformBarsInlineProps) {
  return (
    <span 
      style={{ 
        display: 'inline-flex', 
        verticalAlign: align,
        marginLeft: '0.25em',
        marginRight: '0.25em',
        ...style,
      }}
    >
      <WaveformBars size={size} {...props} />
    </span>
  );
}

/**
 * LiveWaveform - Pre-configured for "live" indicators
 * 
 * Combines WaveformBars with a label for a complete "Live" badge.
 * Uses success color and wave variant by default.
 * 
 * @example
 * <LiveWaveform />
 * <LiveWaveform text="Broadcasting" />
 */
interface LiveWaveformProps {
  /** Text label. Default: 'Live' */
  text?: string;
  /** Size preset. Default: 'sm' */
  size?: Size;
  /** Show the waveform. Default: true */
  showWaveform?: boolean;
  /** Additional className */
  className?: string;
}

export function LiveWaveform({
  text = 'Live',
  size = 'sm',
  showWaveform = true,
  className = '',
}: LiveWaveformProps) {
  return (
    <span 
      className={`live-waveform ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        fontSize: size === 'xs' ? '0.7rem' : size === 'sm' ? '0.75rem' : '0.875rem',
        fontWeight: 500,
        color: '#22c55e',
        textTransform: 'uppercase',
        letterSpacing: '0.025em',
      }}
    >
      {showWaveform && (
        <WaveformBars 
          size={size} 
          color="success" 
          variant="wave"
          bars={3}
        />
      )}
      {text}
    </span>
  );
}

/**
 * PendingWaveform - Pre-configured for "pending" indicators
 * 
 * Uses warning color and random variant for an "awaiting" feel.
 * 
 * @example
 * <PendingWaveform />
 * <PendingWaveform text="Awaiting results..." />
 */
interface PendingWaveformProps {
  /** Text label. Default: 'Pending' */
  text?: string;
  /** Size preset. Default: 'sm' */
  size?: Size;
  /** Show the waveform. Default: true */
  showWaveform?: boolean;
  /** Additional className */
  className?: string;
}

export function PendingWaveform({
  text = 'Pending',
  size = 'sm',
  showWaveform = true,
  className = '',
}: PendingWaveformProps) {
  return (
    <span 
      className={`pending-waveform ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        fontSize: size === 'xs' ? '0.7rem' : size === 'sm' ? '0.75rem' : '0.875rem',
        fontWeight: 500,
        color: '#f59e0b',
        textTransform: 'uppercase',
        letterSpacing: '0.025em',
      }}
    >
      {showWaveform && (
        <WaveformBars 
          size={size} 
          color="warning" 
          variant="random"
          bars={4}
        />
      )}
      {text}
    </span>
  );
}

export default WaveformBars;
