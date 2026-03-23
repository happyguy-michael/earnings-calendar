'use client';

/**
 * BioluminescenceGlow - Organic, living glow effect
 * 
 * Inspiration:
 * - Bioluminescent organisms (jellyfish, plankton, fireflies)
 * - 2026 "Organic Digital" trend — interfaces that feel alive
 * - Apple's subtle ambient lighting effects
 * - The concept of "breathing" UI elements
 * 
 * Creates a gentle, organic pulsing glow that feels natural and alive,
 * unlike mechanical/linear animations. Uses multiple overlapping waves
 * with slightly different frequencies to create an organic, non-repeating pattern.
 */

import { useEffect, useState, useRef, useMemo, CSSProperties, ReactNode } from 'react';

// Check for reduced motion preference
function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return prefersReducedMotion;
}

// Color presets inspired by bioluminescent organisms
const COLOR_PRESETS = {
  // Deep sea jellyfish - blue-cyan
  jellyfish: {
    primary: 'rgba(59, 130, 246, VAR)',
    secondary: 'rgba(6, 182, 212, VAR)',
    tertiary: 'rgba(99, 102, 241, VAR)',
  },
  // Firefly - warm yellow-green
  firefly: {
    primary: 'rgba(234, 179, 8, VAR)',
    secondary: 'rgba(163, 230, 53, VAR)',
    tertiary: 'rgba(250, 204, 21, VAR)',
  },
  // Plankton bloom - cyan-green
  plankton: {
    primary: 'rgba(34, 211, 238, VAR)',
    secondary: 'rgba(52, 211, 153, VAR)',
    tertiary: 'rgba(20, 184, 166, VAR)',
  },
  // Deep anglerfish - amber-red
  anglerfish: {
    primary: 'rgba(245, 158, 11, VAR)',
    secondary: 'rgba(239, 68, 68, VAR)',
    tertiary: 'rgba(249, 115, 22, VAR)',
  },
  // Success glow - green spectrum
  success: {
    primary: 'rgba(34, 197, 94, VAR)',
    secondary: 'rgba(74, 222, 128, VAR)',
    tertiary: 'rgba(22, 163, 74, VAR)',
  },
  // Danger glow - red spectrum
  danger: {
    primary: 'rgba(239, 68, 68, VAR)',
    secondary: 'rgba(248, 113, 113, VAR)',
    tertiary: 'rgba(220, 38, 38, VAR)',
  },
  // Warning glow - amber spectrum
  warning: {
    primary: 'rgba(245, 158, 11, VAR)',
    secondary: 'rgba(251, 191, 36, VAR)',
    tertiary: 'rgba(217, 119, 6, VAR)',
  },
  // Neutral glow - purple spectrum
  neutral: {
    primary: 'rgba(139, 92, 246, VAR)',
    secondary: 'rgba(167, 139, 250, VAR)',
    tertiary: 'rgba(124, 58, 237, VAR)',
  },
} as const;

type ColorPreset = keyof typeof COLOR_PRESETS;

interface BioluminescenceGlowProps {
  children: ReactNode;
  /** Color preset inspired by bioluminescent organisms */
  preset?: ColorPreset;
  /** Custom primary color (overrides preset) - use rgba with VAR placeholder */
  customColor?: string;
  /** Glow intensity (0-1) */
  intensity?: number;
  /** Base pulse duration in ms (organic variation applied automatically) */
  baseDuration?: number;
  /** Blur radius for the glow effect */
  blurRadius?: number;
  /** Spread radius for the glow effect */
  spreadRadius?: number;
  /** Whether to show the glow effect */
  active?: boolean;
  /** Whether to sync pulse to a "heartbeat" (earnings pending state) */
  heartbeat?: boolean;
  /** Heartbeat BPM when heartbeat mode is active */
  heartbeatBpm?: number;
  /** Border radius to match container */
  borderRadius?: number | string;
  /** Position of the glow: inset (inside border), outset (outside), or both */
  position?: 'inset' | 'outset' | 'both';
  /** Enable subtle color shift between preset colors */
  colorShift?: boolean;
  /** Additional className */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
}

export function BioluminescenceGlow({
  children,
  preset = 'jellyfish',
  customColor,
  intensity = 0.5,
  baseDuration = 4000,
  blurRadius = 20,
  spreadRadius = 0,
  active = true,
  heartbeat = false,
  heartbeatBpm = 60,
  borderRadius = 14,
  position = 'outset',
  colorShift = false,
  className = '',
  style,
}: BioluminescenceGlowProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [glowIntensity, setGlowIntensity] = useState(intensity);
  const [colorPhase, setColorPhase] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  
  // Get colors from preset or custom
  const colors = useMemo(() => {
    if (customColor) {
      return {
        primary: customColor,
        secondary: customColor,
        tertiary: customColor,
      };
    }
    return COLOR_PRESETS[preset];
  }, [preset, customColor]);
  
  // Organic animation using multiple overlapping sine waves
  // This creates a non-repeating, natural-feeling pulse
  useEffect(() => {
    if (!active || prefersReducedMotion) {
      setGlowIntensity(active ? intensity : 0);
      return;
    }
    
    startTimeRef.current = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current;
      
      let newIntensity: number;
      
      if (heartbeat) {
        // Heartbeat mode: double-pulse pattern like a real heartbeat
        const beatInterval = (60 / heartbeatBpm) * 1000; // ms per beat
        const phase = (elapsed % beatInterval) / beatInterval;
        
        // Double-pulse: first beat at 0%, second at 20%, rest until next cycle
        if (phase < 0.1) {
          // First beat rise
          newIntensity = intensity * (0.3 + 0.7 * Math.sin(phase * 10 * Math.PI));
        } else if (phase < 0.2) {
          // Brief dip
          newIntensity = intensity * 0.3;
        } else if (phase < 0.3) {
          // Second beat (smaller)
          newIntensity = intensity * (0.3 + 0.5 * Math.sin((phase - 0.2) * 10 * Math.PI));
        } else {
          // Rest period with subtle baseline glow
          newIntensity = intensity * 0.2;
        }
      } else {
        // Organic mode: multiple overlapping sine waves for natural variation
        // Using prime-ish multipliers to avoid obvious repetition
        const wave1 = Math.sin((elapsed / baseDuration) * Math.PI * 2) * 0.4;
        const wave2 = Math.sin((elapsed / (baseDuration * 1.618)) * Math.PI * 2) * 0.3; // Golden ratio
        const wave3 = Math.sin((elapsed / (baseDuration * 2.236)) * Math.PI * 2) * 0.2; // √5
        const wave4 = Math.sin((elapsed / (baseDuration * 0.786)) * Math.PI * 2) * 0.1; // 1/golden ratio
        
        // Combine waves and normalize to 0-1 range
        const combined = (wave1 + wave2 + wave3 + wave4 + 1) / 2;
        newIntensity = intensity * (0.3 + combined * 0.7);
      }
      
      setGlowIntensity(newIntensity);
      
      // Color shift phase (if enabled)
      if (colorShift) {
        const colorCycle = (elapsed / (baseDuration * 3)) % 1;
        setColorPhase(colorCycle);
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [active, prefersReducedMotion, intensity, baseDuration, heartbeat, heartbeatBpm, colorShift]);
  
  // Interpolate between colors based on phase
  const currentColor = useMemo(() => {
    if (!colorShift) {
      return colors.primary.replace('VAR', String(glowIntensity));
    }
    
    // Interpolate between primary, secondary, tertiary based on phase
    const phase3 = colorPhase * 3;
    const segment = Math.floor(phase3) % 3;
    const t = phase3 - Math.floor(phase3);
    
    const colorOrder = [colors.primary, colors.secondary, colors.tertiary];
    const fromColor = colorOrder[segment];
    const toColor = colorOrder[(segment + 1) % 3];
    
    // For simplicity, just use the "from" color with current intensity
    // A full implementation would interpolate RGB values
    return fromColor.replace('VAR', String(glowIntensity));
  }, [colors, colorShift, colorPhase, glowIntensity]);
  
  // Generate box-shadow based on position
  const boxShadow = useMemo(() => {
    if (!active || glowIntensity < 0.01) return 'none';
    
    const shadows: string[] = [];
    
    if (position === 'outset' || position === 'both') {
      shadows.push(`0 0 ${blurRadius}px ${spreadRadius}px ${currentColor}`);
      // Add a subtle outer glow layer for depth
      shadows.push(`0 0 ${blurRadius * 2}px ${spreadRadius}px ${currentColor.replace(/[\d.]+\)$/, `${glowIntensity * 0.3})`)}`);
    }
    
    if (position === 'inset' || position === 'both') {
      shadows.push(`inset 0 0 ${blurRadius * 0.7}px ${spreadRadius}px ${currentColor}`);
    }
    
    return shadows.join(', ');
  }, [active, glowIntensity, position, blurRadius, spreadRadius, currentColor]);
  
  const wrapperStyle: CSSProperties = {
    position: 'relative',
    borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
    ...style,
  };
  
  const glowStyle: CSSProperties = {
    position: 'absolute',
    inset: position === 'inset' ? 0 : `-${spreadRadius + blurRadius * 0.5}px`,
    borderRadius: 'inherit',
    boxShadow,
    pointerEvents: 'none',
    transition: prefersReducedMotion ? 'box-shadow 0.3s ease' : 'none',
    zIndex: 0,
  };
  
  const contentStyle: CSSProperties = {
    position: 'relative',
    zIndex: 1,
  };
  
  return (
    <div className={`bioluminescence-wrapper ${className}`} style={wrapperStyle}>
      <div className="bioluminescence-glow" style={glowStyle} aria-hidden="true" />
      <div className="bioluminescence-content" style={contentStyle}>
        {children}
      </div>
      
      <style jsx>{`
        .bioluminescence-wrapper {
          display: contents;
        }
        
        .bioluminescence-wrapper > * {
          display: contents;
        }
        
        @media print {
          .bioluminescence-glow {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * BioluminescenceBadge - Compact badge with organic glow
 * Perfect for status indicators, live badges, etc.
 */
interface BioluminescenceBadgeProps {
  children: ReactNode;
  preset?: ColorPreset;
  intensity?: number;
  heartbeat?: boolean;
  className?: string;
}

export function BioluminescenceBadge({
  children,
  preset = 'plankton',
  intensity = 0.6,
  heartbeat = false,
  className = '',
}: BioluminescenceBadgeProps) {
  return (
    <BioluminescenceGlow
      preset={preset}
      intensity={intensity}
      heartbeat={heartbeat}
      heartbeatBpm={72}
      blurRadius={12}
      spreadRadius={2}
      borderRadius={9999}
      position="both"
      baseDuration={3000}
      className={className}
    >
      {children}
    </BioluminescenceGlow>
  );
}

/**
 * BioluminescenceCard - Card wrapper with subtle organic glow
 */
interface BioluminescenceCardProps {
  children: ReactNode;
  preset?: ColorPreset;
  intensity?: number;
  active?: boolean;
  borderRadius?: number;
  className?: string;
}

export function BioluminescenceCard({
  children,
  preset = 'jellyfish',
  intensity = 0.35,
  active = true,
  borderRadius = 14,
  className = '',
}: BioluminescenceCardProps) {
  return (
    <BioluminescenceGlow
      preset={preset}
      intensity={intensity}
      active={active}
      blurRadius={24}
      spreadRadius={4}
      borderRadius={borderRadius}
      position="outset"
      baseDuration={5000}
      colorShift={true}
      className={className}
    >
      {children}
    </BioluminescenceGlow>
  );
}

/**
 * useBioluminescence - Hook for programmatic glow control
 * Returns intensity value that pulses organically
 */
export function useBioluminescence(
  active = true,
  baseDuration = 4000,
  maxIntensity = 1
): number {
  const [intensity, setIntensity] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();
  
  useEffect(() => {
    if (!active || prefersReducedMotion) {
      setIntensity(active ? maxIntensity * 0.5 : 0);
      return;
    }
    
    const startTime = performance.now();
    let animationFrame: number;
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      
      // Organic pulsing with multiple frequencies
      const wave1 = Math.sin((elapsed / baseDuration) * Math.PI * 2) * 0.4;
      const wave2 = Math.sin((elapsed / (baseDuration * 1.618)) * Math.PI * 2) * 0.3;
      const wave3 = Math.sin((elapsed / (baseDuration * 2.236)) * Math.PI * 2) * 0.2;
      
      const combined = (wave1 + wave2 + wave3 + 1) / 2;
      setIntensity(maxIntensity * (0.3 + combined * 0.7));
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [active, prefersReducedMotion, baseDuration, maxIntensity]);
  
  return intensity;
}

/**
 * PendingEarningsGlow - Specialized glow for pending earnings cards
 * Uses heartbeat mode to create anticipation
 */
interface PendingEarningsGlowProps {
  children: ReactNode;
  isImminent?: boolean;
  minutesUntil?: number;
  className?: string;
}

export function PendingEarningsGlow({
  children,
  isImminent = false,
  minutesUntil = 60,
  className = '',
}: PendingEarningsGlowProps) {
  // Increase intensity and BPM as earnings get closer
  const intensity = isImminent ? 0.7 : minutesUntil < 30 ? 0.5 : 0.35;
  const bpm = isImminent ? 90 : minutesUntil < 30 ? 72 : 60;
  const preset = isImminent ? 'firefly' : 'plankton';
  
  return (
    <BioluminescenceGlow
      preset={preset}
      intensity={intensity}
      heartbeat={true}
      heartbeatBpm={bpm}
      blurRadius={isImminent ? 28 : 20}
      spreadRadius={isImminent ? 4 : 2}
      borderRadius={14}
      position="outset"
      className={className}
    >
      {children}
    </BioluminescenceGlow>
  );
}

/**
 * ResultGlow - Glow effect for beat/miss/met results
 */
interface ResultGlowProps {
  children: ReactNode;
  result: 'beat' | 'miss' | 'met';
  surprise?: number;
  className?: string;
}

export function ResultGlow({
  children,
  result,
  surprise = 0,
  className = '',
}: ResultGlowProps) {
  const absSurprise = Math.abs(surprise);
  const intensity = absSurprise > 15 ? 0.6 : absSurprise > 10 ? 0.45 : 0.3;
  
  // Determine preset: beat = success, miss = danger, met = neutral
  const preset = result === 'beat' ? 'success' : result === 'miss' ? 'danger' : 'neutral';
  
  return (
    <BioluminescenceGlow
      preset={preset}
      intensity={intensity}
      blurRadius={absSurprise > 15 ? 30 : 20}
      spreadRadius={absSurprise > 15 ? 6 : 2}
      borderRadius={14}
      position="outset"
      baseDuration={absSurprise > 15 ? 3000 : 5000}
      colorShift={absSurprise > 15}
      className={className}
    >
      {children}
    </BioluminescenceGlow>
  );
}
