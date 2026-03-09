'use client';

import { useEffect, useState, memo } from 'react';

/**
 * PulseIndicator - Animated dot showing "live" or active status
 * 
 * Inspired by:
 * - Vercel's deployment status indicators
 * - GitHub Actions workflow status
 * - Slack's presence indicators
 * 
 * Features:
 * - Three ring pulse animation emanating outward
 * - Theme-aware colors (green/amber/red/blue variants)
 * - Configurable size and pulse speed
 * - Respects prefers-reduced-motion
 * - Optional "breathing" variant for subtle activity
 * - Staggered ring timing for smooth visual flow
 * 
 * Usage:
 * <PulseIndicator status="live" />
 * <PulseIndicator status="pending" size="sm" />
 * <PulseIndicator status="syncing" variant="breathing" />
 */

type Status = 'live' | 'pending' | 'syncing' | 'error' | 'offline';
type Size = 'xs' | 'sm' | 'md' | 'lg';
type Variant = 'pulse' | 'breathing' | 'ripple';

interface PulseIndicatorProps {
  /** Status determines the color */
  status?: Status;
  /** Size of the indicator */
  size?: Size;
  /** Animation variant */
  variant?: Variant;
  /** Custom color (overrides status) */
  color?: string;
  /** Additional CSS classes */
  className?: string;
  /** Accessible label */
  label?: string;
  /** Whether to show the indicator (for conditional rendering) */
  show?: boolean;
  /** Pulse animation speed in ms (default 2000) */
  speed?: number;
}

const STATUS_COLORS = {
  live: {
    core: 'rgb(34, 197, 94)',      // Emerald/green
    glow: 'rgba(34, 197, 94, 0.4)',
    ring: 'rgba(34, 197, 94, 0.6)',
  },
  pending: {
    core: 'rgb(245, 158, 11)',     // Amber
    glow: 'rgba(245, 158, 11, 0.4)',
    ring: 'rgba(245, 158, 11, 0.6)',
  },
  syncing: {
    core: 'rgb(59, 130, 246)',     // Blue
    glow: 'rgba(59, 130, 246, 0.4)',
    ring: 'rgba(59, 130, 246, 0.6)',
  },
  error: {
    core: 'rgb(239, 68, 68)',      // Red
    glow: 'rgba(239, 68, 68, 0.4)',
    ring: 'rgba(239, 68, 68, 0.6)',
  },
  offline: {
    core: 'rgb(113, 113, 122)',    // Gray
    glow: 'rgba(113, 113, 122, 0.3)',
    ring: 'rgba(113, 113, 122, 0.4)',
  },
};

const SIZES = {
  xs: { dot: 6, container: 16 },
  sm: { dot: 8, container: 20 },
  md: { dot: 10, container: 24 },
  lg: { dot: 12, container: 32 },
};

function PulseIndicatorComponent({
  status = 'live',
  size = 'sm',
  variant = 'pulse',
  color,
  className = '',
  label,
  show = true,
  speed = 2000,
}: PulseIndicatorProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  if (!show) return null;

  const colors = color 
    ? { core: color, glow: `${color}66`, ring: `${color}99` }
    : STATUS_COLORS[status];
  
  const dimensions = SIZES[size];
  const isOffline = status === 'offline';
  const shouldAnimate = !prefersReducedMotion && !isOffline;

  // Determine aria label
  const ariaLabel = label || `Status: ${status}`;

  return (
    <span
      className={`pulse-indicator ${className}`}
      role="status"
      aria-label={ariaLabel}
      style={{
        '--pulse-core': colors.core,
        '--pulse-glow': colors.glow,
        '--pulse-ring': colors.ring,
        '--pulse-speed': `${speed}ms`,
        '--dot-size': `${dimensions.dot}px`,
        '--container-size': `${dimensions.container}px`,
      } as React.CSSProperties}
    >
      {/* Animated rings (for pulse variant) */}
      {shouldAnimate && variant === 'pulse' && (
        <>
          <span className="pulse-ring pulse-ring-1" aria-hidden="true" />
          <span className="pulse-ring pulse-ring-2" aria-hidden="true" />
          <span className="pulse-ring pulse-ring-3" aria-hidden="true" />
        </>
      )}

      {/* Ripple effect (for ripple variant) */}
      {shouldAnimate && variant === 'ripple' && (
        <span className="pulse-ripple" aria-hidden="true" />
      )}

      {/* Core dot */}
      <span 
        className={`pulse-core ${shouldAnimate && variant === 'breathing' ? 'breathing' : ''} ${mounted ? 'mounted' : ''}`}
        aria-hidden="true"
      />

      {/* Inner glow */}
      {!isOffline && (
        <span className="pulse-glow" aria-hidden="true" />
      )}
    </span>
  );
}

// Memoize to prevent unnecessary re-renders
export const PulseIndicator = memo(PulseIndicatorComponent);

/**
 * Convenience wrapper for common use cases
 */
export function LiveIndicator({ className = '' }: { className?: string }) {
  return (
    <PulseIndicator 
      status="live" 
      size="xs" 
      label="Live data" 
      className={className}
    />
  );
}

export function PendingIndicator({ count }: { count?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <PulseIndicator status="pending" size="xs" variant="breathing" />
      {count !== undefined && (
        <span className="text-xs text-amber-400 font-medium">{count}</span>
      )}
    </span>
  );
}

export function SyncingIndicator({ className = '' }: { className?: string }) {
  return (
    <PulseIndicator 
      status="syncing" 
      size="xs" 
      variant="ripple"
      label="Syncing data" 
      className={className}
    />
  );
}

export default PulseIndicator;
