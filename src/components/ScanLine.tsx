'use client';

import { useEffect, useState, useRef, useCallback, ReactNode, CSSProperties } from 'react';
import { useMotionPreferences } from './MotionPreferences';

/**
 * ScanLine — Retro CRT Monitor Scan Line Effect
 * 
 * A subtle horizontal scan line that periodically sweeps down the screen,
 * evoking the aesthetics of classic CRT monitors, Bloomberg terminals, and
 * retro sci-fi interfaces. Perfect for financial dashboards where a "data
 * terminal" vibe enhances the professional, technical atmosphere.
 * 
 * Inspiration:
 * - Classic Bloomberg/Reuters terminal displays
 * - Retro sci-fi interfaces (Alien, Blade Runner, TRON)
 * - CRT monitor phosphor scan lines
 * - 2026 "Neo-Retro" design trend (modern + nostalgic)
 * - VHS/analog video artifacts making a comeback
 * 
 * Features:
 * - Configurable scan interval and duration
 * - Multiple visual styles (glow, sharp, subtle, intense)
 * - Optional static scan lines (CRT interlacing effect)
 * - Customizable color themes (green terminal, amber, blue, white)
 * - Bloom/glow effect for enhanced visibility
 * - Random timing variance for organic feel
 * - GPU-accelerated via transform: translateY
 * - Full prefers-reduced-motion support
 * - Can wrap content or be used as overlay
 * 
 * @example
 * // Basic usage - overlay mode
 * <ScanLine />
 * 
 * // Wrapper mode with custom settings
 * <ScanLine wrapper interval={8000} color="amber">
 *   <Dashboard />
 * </ScanLine>
 * 
 * // Intense retro terminal style
 * <ScanLine 
 *   variant="intense" 
 *   color="green" 
 *   staticLines 
 *   staticLineOpacity={0.03}
 * />
 */

type ScanLineVariant = 'subtle' | 'glow' | 'sharp' | 'intense';
type ScanLineColor = 'white' | 'green' | 'amber' | 'blue' | 'cyan' | 'pink';

interface ScanLineProps {
  /** Visual variant */
  variant?: ScanLineVariant;
  /** Color theme */
  color?: ScanLineColor;
  /** Time between scans in ms (default: 10000) */
  interval?: number;
  /** Duration of scan sweep in ms (default: 2500) */
  duration?: number;
  /** Random variance in interval timing (0-1, default: 0.3) */
  variance?: number;
  /** Height of the scan line in px (default: 2 for subtle, varies by variant) */
  lineHeight?: number;
  /** Glow/bloom spread in px (default: varies by variant) */
  glowSpread?: number;
  /** Show static horizontal lines (CRT interlacing) */
  staticLines?: boolean;
  /** Opacity of static lines (default: 0.015) */
  staticLineOpacity?: number;
  /** Static line spacing in px (default: 3) */
  staticLineSpacing?: number;
  /** Render as wrapper around children */
  wrapper?: boolean;
  /** Children (only used when wrapper=true) */
  children?: ReactNode;
  /** Z-index for overlay positioning */
  zIndex?: number;
  /** Additional className */
  className?: string;
  /** Trigger scan manually (overrides interval) */
  trigger?: unknown;
  /** Pause automatic scanning */
  paused?: boolean;
  /** Callback when scan completes */
  onScanComplete?: () => void;
}

// Color presets
const COLORS: Record<ScanLineColor, { line: string; glow: string }> = {
  white: {
    line: 'rgba(255, 255, 255, 0.15)',
    glow: 'rgba(255, 255, 255, 0.08)',
  },
  green: {
    line: 'rgba(34, 197, 94, 0.25)',
    glow: 'rgba(34, 197, 94, 0.12)',
  },
  amber: {
    line: 'rgba(245, 158, 11, 0.2)',
    glow: 'rgba(245, 158, 11, 0.1)',
  },
  blue: {
    line: 'rgba(59, 130, 246, 0.2)',
    glow: 'rgba(59, 130, 246, 0.1)',
  },
  cyan: {
    line: 'rgba(6, 182, 212, 0.22)',
    glow: 'rgba(6, 182, 212, 0.11)',
  },
  pink: {
    line: 'rgba(236, 72, 153, 0.18)',
    glow: 'rgba(236, 72, 153, 0.09)',
  },
};

// Variant configurations
const VARIANTS: Record<ScanLineVariant, {
  lineHeight: number;
  glowSpread: number;
  opacity: number;
  blur: number;
}> = {
  subtle: {
    lineHeight: 1,
    glowSpread: 20,
    opacity: 0.5,
    blur: 0,
  },
  glow: {
    lineHeight: 2,
    glowSpread: 40,
    opacity: 0.7,
    blur: 2,
  },
  sharp: {
    lineHeight: 1,
    glowSpread: 8,
    opacity: 0.9,
    blur: 0,
  },
  intense: {
    lineHeight: 3,
    glowSpread: 60,
    opacity: 1,
    blur: 4,
  },
};

export function ScanLine({
  variant = 'subtle',
  color = 'white',
  interval = 10000,
  duration = 2500,
  variance = 0.3,
  lineHeight: customLineHeight,
  glowSpread: customGlowSpread,
  staticLines = false,
  staticLineOpacity = 0.015,
  staticLineSpacing = 3,
  wrapper = false,
  children,
  zIndex = 9999,
  className = '',
  trigger,
  paused = false,
  onScanComplete,
}: ScanLineProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanPosition, setScanPosition] = useState(-100); // Start above viewport
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevTriggerRef = useRef(trigger);
  const { shouldAnimate } = useMotionPreferences();

  const variantConfig = VARIANTS[variant];
  const colorConfig = COLORS[color];
  const finalLineHeight = customLineHeight ?? variantConfig.lineHeight;
  const finalGlowSpread = customGlowSpread ?? variantConfig.glowSpread;

  // Animate the scan line down the screen
  const runScan = useCallback(() => {
    if (!shouldAnimate('decorative')) {
      onScanComplete?.();
      return;
    }

    setIsScanning(true);
    startTimeRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Use easeInOutQuad for smooth start and stop
      const eased = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      // Map to viewport position (-10% to 110%)
      const position = -10 + (eased * 120);
      setScanPosition(position);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsScanning(false);
        setScanPosition(-100); // Reset to above viewport
        onScanComplete?.();
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [duration, shouldAnimate, onScanComplete]);

  // Set up interval-based scanning
  useEffect(() => {
    if (paused || !shouldAnimate('decorative')) {
      return;
    }

    const scheduleNextScan = () => {
      // Add variance to interval
      const varianceMs = interval * variance;
      const randomDelay = interval + (Math.random() * 2 - 1) * varianceMs;
      
      intervalRef.current = setTimeout(() => {
        runScan();
        scheduleNextScan();
      }, randomDelay);
    };

    // Initial delay before first scan
    const initialDelay = interval * 0.5 + Math.random() * interval * 0.5;
    intervalRef.current = setTimeout(() => {
      runScan();
      scheduleNextScan();
    }, initialDelay);

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [interval, variance, paused, runScan, shouldAnimate]);

  // Handle manual trigger
  useEffect(() => {
    if (trigger !== prevTriggerRef.current) {
      prevTriggerRef.current = trigger;
      if (!isScanning) {
        runScan();
      }
    }
  }, [trigger, isScanning, runScan]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, []);

  // Don't render anything if reduced motion
  if (!shouldAnimate('decorative')) {
    return wrapper ? <>{children}</> : null;
  }

  const scanLineStyles: CSSProperties = {
    position: 'fixed',
    left: 0,
    right: 0,
    height: finalLineHeight + finalGlowSpread * 2,
    top: `${scanPosition}%`,
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    zIndex,
    opacity: isScanning ? variantConfig.opacity : 0,
    transition: isScanning ? 'none' : 'opacity 0.3s ease-out',
    willChange: 'top',
  };

  const innerLineStyles: CSSProperties = {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    height: finalLineHeight,
    background: `linear-gradient(
      90deg,
      transparent 0%,
      ${colorConfig.line} 10%,
      ${colorConfig.line} 90%,
      transparent 100%
    )`,
    filter: variantConfig.blur > 0 ? `blur(${variantConfig.blur}px)` : undefined,
  };

  const glowStyles: CSSProperties = {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    height: finalGlowSpread,
    background: `linear-gradient(
      to bottom,
      transparent,
      ${colorConfig.glow} 40%,
      ${colorConfig.glow} 60%,
      transparent
    )`,
    filter: `blur(${finalGlowSpread / 4}px)`,
  };

  const staticLinesStyles: CSSProperties = {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: zIndex - 1,
    background: `repeating-linear-gradient(
      0deg,
      transparent,
      transparent ${staticLineSpacing - 1}px,
      rgba(255, 255, 255, ${staticLineOpacity}) ${staticLineSpacing - 1}px,
      rgba(255, 255, 255, ${staticLineOpacity}) ${staticLineSpacing}px
    )`,
    mixBlendMode: 'overlay',
  };

  const content = (
    <>
      {/* Static CRT lines (optional) */}
      {staticLines && <div style={staticLinesStyles} aria-hidden="true" />}
      
      {/* Moving scan line */}
      <div 
        style={scanLineStyles} 
        className={`scan-line ${className}`}
        aria-hidden="true"
      >
        {/* Glow layer */}
        <div style={glowStyles} />
        {/* Main line */}
        <div style={innerLineStyles} />
      </div>
    </>
  );

  if (wrapper) {
    return (
      <div style={{ position: 'relative' }}>
        {children}
        {content}
      </div>
    );
  }

  return content;
}

/**
 * ScanLineOverlay - Convenience component for full-page scan effect
 */
export function ScanLineOverlay(props: Omit<ScanLineProps, 'wrapper'>) {
  return <ScanLine {...props} />;
}

/**
 * TerminalScanLine - Preset for classic green terminal aesthetic
 */
export function TerminalScanLine(props: Omit<ScanLineProps, 'color' | 'variant'>) {
  return (
    <ScanLine 
      color="green" 
      variant="glow" 
      staticLines 
      staticLineOpacity={0.02}
      {...props} 
    />
  );
}

/**
 * AmberTerminalScan - Preset for amber/orange terminal aesthetic
 */
export function AmberTerminalScan(props: Omit<ScanLineProps, 'color' | 'variant'>) {
  return (
    <ScanLine 
      color="amber" 
      variant="glow" 
      staticLines 
      staticLineOpacity={0.018}
      {...props} 
    />
  );
}

/**
 * SubtleScan - Minimal, barely-visible scan for modern UIs
 */
export function SubtleScan(props: Omit<ScanLineProps, 'variant'>) {
  return (
    <ScanLine 
      variant="subtle" 
      interval={15000}
      {...props} 
    />
  );
}

export default ScanLine;
