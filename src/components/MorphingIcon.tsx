'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * MorphingIcon - Smooth SVG path morphing between two icon states
 * 
 * Inspired by:
 * - YouTube's play/pause morphing icon
 * - Material Design animated icons
 * - iOS SF Symbols animated transitions
 * - Stripe's subtle icon state changes
 * 
 * Features:
 * - Smooth SVG path interpolation between states
 * - Spring physics or linear easing
 * - Color transitions alongside path morph
 * - Customizable timing and easing
 * - Respects reduced motion preferences
 * - Built-in presets for common icon pairs
 * 
 * Usage:
 * <MorphingIcon preset="plus-close" state={isOpen} />
 * <MorphingIcon preset="play-pause" state={isPlaying} />
 * <MorphingIcon preset="check-x" state={isSuccess} />
 */

// SVG path data for icon presets (24x24 viewBox)
const ICON_PATHS = {
  // Plus (+) icon
  plus: 'M12 5v14M5 12h14',
  // Close (×) icon
  close: 'M6 6l12 12M18 6L6 18',
  // Check (✓) icon  
  check: 'M5 12l5 5L19 7',
  // X mark
  x: 'M6 6l12 12M18 6L6 18',
  // Play (▶)
  play: 'M6 4l14 8l-14 8z',
  // Pause (❚❚)
  pause: 'M6 4h4v16H6zM14 4h4v16h-4z',
  // Menu (☰)
  menu: 'M4 6h16M4 12h16M4 18h16',
  // Arrow left (←)
  arrowLeft: 'M19 12H5M12 19l-7-7l7-7',
  // Arrow right (→)
  arrowRight: 'M5 12h14M12 5l7 7l-7 7',
  // Arrow up (↑)
  arrowUp: 'M12 19V5M5 12l7-7l7 7',
  // Arrow down (↓)
  arrowDown: 'M12 5v14M5 12l7 7l7-7',
  // Expand (⊕)
  expand: 'M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7',
  // Collapse (⊖)
  collapse: 'M4 14h6v6M14 4h6v6M10 14l-6 6M20 4l-6 6',
  // Heart outline
  heartOutline: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
  // Star outline
  starOutline: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  // Eye (visible)
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  // Eye off (hidden)
  eyeOff: 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22',
  // Sound on
  soundOn: 'M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07',
  // Sound off (muted)
  soundOff: 'M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6',
  // Sun
  sun: 'M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12z',
  // Moon
  moon: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
  // Lock
  lock: 'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4',
  // Unlock
  unlock: 'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM8 11V7a4 4 0 0 1 8 0',
  // Filter
  filter: 'M22 3H2l8 9.46V19l4 2v-8.54L22 3z',
  // Filter active (filled)
  filterActive: 'M22 3H2l8 9.46V19l4 2v-8.54L22 3zM6 5h12l-6 7-6-7z',
};

// Preset icon pairs for common morphing use cases
const PRESETS = {
  'plus-close': { from: 'plus', to: 'close' },
  'close-plus': { from: 'close', to: 'plus' },
  'play-pause': { from: 'play', to: 'pause' },
  'pause-play': { from: 'pause', to: 'play' },
  'check-x': { from: 'check', to: 'x' },
  'x-check': { from: 'x', to: 'check' },
  'menu-close': { from: 'menu', to: 'close' },
  'close-menu': { from: 'close', to: 'menu' },
  'expand-collapse': { from: 'expand', to: 'collapse' },
  'collapse-expand': { from: 'collapse', to: 'expand' },
  'sun-moon': { from: 'sun', to: 'moon' },
  'moon-sun': { from: 'moon', to: 'sun' },
  'eye-eyeOff': { from: 'eye', to: 'eyeOff' },
  'eyeOff-eye': { from: 'eyeOff', to: 'eye' },
  'sound-mute': { from: 'soundOn', to: 'soundOff' },
  'mute-sound': { from: 'soundOff', to: 'soundOn' },
  'lock-unlock': { from: 'lock', to: 'unlock' },
  'unlock-lock': { from: 'unlock', to: 'lock' },
  'filter-filterActive': { from: 'filter', to: 'filterActive' },
  'arrowLeft-arrowRight': { from: 'arrowLeft', to: 'arrowRight' },
  'arrowUp-arrowDown': { from: 'arrowUp', to: 'arrowDown' },
} as const;

type PresetName = keyof typeof PRESETS;
type IconName = keyof typeof ICON_PATHS;

interface MorphingIconProps {
  /** Use a preset icon pair */
  preset?: PresetName;
  /** Custom from path (if not using preset) */
  fromPath?: string;
  /** Custom to path (if not using preset) */
  toPath?: string;
  /** Current state - false = from, true = to */
  state: boolean;
  /** Icon size in pixels */
  size?: number;
  /** Stroke width */
  strokeWidth?: number;
  /** Animation duration in ms */
  duration?: number;
  /** Easing function */
  easing?: 'spring' | 'ease-out' | 'ease-in-out' | 'linear';
  /** Icon color in 'from' state */
  fromColor?: string;
  /** Icon color in 'to' state */
  toColor?: string;
  /** Rotation amount during transition (degrees) */
  rotation?: number;
  /** Scale pulse during transition */
  scalePulse?: boolean;
  /** Additional CSS class */
  className?: string;
  /** onClick handler */
  onClick?: () => void;
  /** Aria label */
  ariaLabel?: string;
}

// Parse SVG path commands into segments
function parsePathCommands(d: string): string[] {
  // Split path into individual commands, keeping the command letter with its values
  return d.match(/[MmLlHhVvCcSsQqTtAaZz][^MmLlHhVvCcSsQqTtAaZz]*/g) || [];
}

// Simple linear interpolation between two numbers
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Parse a single coordinate value (could be negative)
function parseNumber(str: string): number {
  return parseFloat(str) || 0;
}

// Interpolate between two path strings
// This is a simplified approach - works best with paths that have similar structures
function interpolatePaths(fromPath: string, toPath: string, progress: number): string {
  const fromCommands = parsePathCommands(fromPath);
  const toCommands = parsePathCommands(toPath);
  
  // If paths have different structures, crossfade with opacity instead
  if (fromCommands.length !== toCommands.length) {
    // Return the target path with progress applied through opacity
    return progress < 0.5 ? fromPath : toPath;
  }
  
  const result: string[] = [];
  
  for (let i = 0; i < fromCommands.length; i++) {
    const fromCmd = fromCommands[i];
    const toCmd = toCommands[i];
    
    // Get command letter (first character)
    const cmdLetter = fromCmd[0];
    const toCmdLetter = toCmd[0];
    
    // If commands don't match, use crossfade
    if (cmdLetter.toUpperCase() !== toCmdLetter.toUpperCase()) {
      return progress < 0.5 ? fromPath : toPath;
    }
    
    // Extract numbers from both commands
    const fromNums = fromCmd.slice(1).match(/-?\d*\.?\d+/g) || [];
    const toNums = toCmd.slice(1).match(/-?\d*\.?\d+/g) || [];
    
    // If number counts don't match, use crossfade
    if (fromNums.length !== toNums.length) {
      return progress < 0.5 ? fromPath : toPath;
    }
    
    // Interpolate each number
    const interpolatedNums = fromNums.map((fromNum, j) => {
      const from = parseNumber(fromNum);
      const to = parseNumber(toNums[j]);
      return lerp(from, to, progress).toFixed(2);
    });
    
    result.push(cmdLetter + interpolatedNums.join(' '));
  }
  
  return result.join('');
}

// Easing functions
const easings = {
  'linear': (t: number) => t,
  'ease-out': (t: number) => 1 - Math.pow(1 - t, 3),
  'ease-in-out': (t: number) => t < 0.5 
    ? 4 * t * t * t 
    : 1 - Math.pow(-2 * t + 2, 3) / 2,
  'spring': (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
};

// Interpolate between two colors (hex or rgb)
function interpolateColor(from: string, to: string, progress: number): string {
  const parseColor = (color: string): [number, number, number] => {
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return [r, g, b];
    }
    // Assume rgb(r, g, b) format
    const match = color.match(/\d+/g);
    if (match && match.length >= 3) {
      return [parseInt(match[0]), parseInt(match[1]), parseInt(match[2])];
    }
    return [255, 255, 255];
  };
  
  const [r1, g1, b1] = parseColor(from);
  const [r2, g2, b2] = parseColor(to);
  
  const r = Math.round(lerp(r1, r2, progress));
  const g = Math.round(lerp(g1, g2, progress));
  const b = Math.round(lerp(b1, b2, progress));
  
  return `rgb(${r}, ${g}, ${b})`;
}

export function MorphingIcon({
  preset,
  fromPath: customFromPath,
  toPath: customToPath,
  state,
  size = 24,
  strokeWidth = 2,
  duration = 300,
  easing = 'ease-out',
  fromColor = 'currentColor',
  toColor = 'currentColor',
  rotation = 0,
  scalePulse = false,
  className = '',
  onClick,
  ariaLabel,
}: MorphingIconProps) {
  const [progress, setProgress] = useState(state ? 1 : 0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const prefersReducedMotion = useRef(false);
  
  // Get paths from preset or custom props
  const fromPath = useMemo(() => {
    if (preset && PRESETS[preset]) {
      return ICON_PATHS[PRESETS[preset].from as IconName];
    }
    return customFromPath || ICON_PATHS.plus;
  }, [preset, customFromPath]);
  
  const toPath = useMemo(() => {
    if (preset && PRESETS[preset]) {
      return ICON_PATHS[PRESETS[preset].to as IconName];
    }
    return customToPath || ICON_PATHS.close;
  }, [preset, customToPath]);
  
  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mq.matches;
    
    const handler = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  
  // Animate on state change
  useEffect(() => {
    if (prefersReducedMotion.current) {
      setProgress(state ? 1 : 0);
      return;
    }
    
    const targetProgress = state ? 1 : 0;
    const startProgress = progress;
    
    if (targetProgress === startProgress) return;
    
    setIsAnimating(true);
    startTimeRef.current = null;
    
    const easingFn = easings[easing];
    
    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }
      
      const elapsed = timestamp - startTimeRef.current;
      const rawProgress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFn(rawProgress);
      
      // Interpolate from start to target
      const newProgress = lerp(startProgress, targetProgress, easedProgress);
      setProgress(newProgress);
      
      if (rawProgress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        setProgress(targetProgress);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state, duration, easing]);
  
  // Calculate current path
  const currentPath = useMemo(() => {
    return interpolatePaths(fromPath, toPath, progress);
  }, [fromPath, toPath, progress]);
  
  // Calculate current color
  const currentColor = useMemo(() => {
    if (fromColor === toColor) return fromColor;
    if (fromColor === 'currentColor' || toColor === 'currentColor') {
      return progress < 0.5 ? fromColor : toColor;
    }
    return interpolateColor(fromColor, toColor, progress);
  }, [fromColor, toColor, progress]);
  
  // Calculate rotation
  const currentRotation = rotation * progress;
  
  // Calculate scale for pulse effect
  const currentScale = scalePulse && isAnimating 
    ? 1 + 0.15 * Math.sin(progress * Math.PI) 
    : 1;
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={currentColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`morphing-icon ${className}`}
      style={{
        transform: `rotate(${currentRotation}deg) scale(${currentScale})`,
        transition: prefersReducedMotion.current ? 'none' : undefined,
        cursor: onClick ? 'pointer' : undefined,
      }}
      onClick={onClick}
      role={onClick ? 'button' : 'img'}
      aria-label={ariaLabel}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {/* For paths with different structures, we crossfade two paths */}
      {parsePathCommands(fromPath).length !== parsePathCommands(toPath).length ? (
        <>
          <path
            d={fromPath}
            style={{
              opacity: 1 - progress,
              transition: prefersReducedMotion.current ? 'none' : `opacity ${duration}ms`,
            }}
          />
          <path
            d={toPath}
            style={{
              opacity: progress,
              transition: prefersReducedMotion.current ? 'none' : `opacity ${duration}ms`,
            }}
          />
        </>
      ) : (
        <path d={currentPath} />
      )}
    </svg>
  );
}

// Convenience components for common presets
export function PlusCloseIcon({ 
  isOpen, 
  ...props 
}: Omit<MorphingIconProps, 'preset' | 'state'> & { isOpen: boolean }) {
  return <MorphingIcon preset="plus-close" state={isOpen} rotation={45} {...props} />;
}

export function PlayPauseIcon({ 
  isPlaying, 
  ...props 
}: Omit<MorphingIconProps, 'preset' | 'state'> & { isPlaying: boolean }) {
  return <MorphingIcon preset="play-pause" state={isPlaying} {...props} />;
}

export function CheckXIcon({ 
  isSuccess, 
  ...props 
}: Omit<MorphingIconProps, 'preset' | 'state'> & { isSuccess: boolean }) {
  return (
    <MorphingIcon 
      preset="check-x" 
      state={isSuccess} 
      fromColor="#22c55e"
      toColor="#ef4444"
      {...props} 
    />
  );
}

export function MenuCloseIcon({ 
  isOpen, 
  ...props 
}: Omit<MorphingIconProps, 'preset' | 'state'> & { isOpen: boolean }) {
  return <MorphingIcon preset="menu-close" state={isOpen} rotation={180} {...props} />;
}

export function ThemeToggleIcon({ 
  isDark, 
  ...props 
}: Omit<MorphingIconProps, 'preset' | 'state'> & { isDark: boolean }) {
  return (
    <MorphingIcon 
      preset="moon-sun" 
      state={isDark} 
      fromColor="#fbbf24"
      toColor="#a78bfa"
      rotation={180}
      scalePulse
      {...props} 
    />
  );
}

export function ExpandCollapseIcon({ 
  isExpanded, 
  ...props 
}: Omit<MorphingIconProps, 'preset' | 'state'> & { isExpanded: boolean }) {
  return <MorphingIcon preset="expand-collapse" state={isExpanded} {...props} />;
}

export function EyeToggleIcon({ 
  isVisible, 
  ...props 
}: Omit<MorphingIconProps, 'preset' | 'state'> & { isVisible: boolean }) {
  return <MorphingIcon preset="eye-eyeOff" state={!isVisible} {...props} />;
}

export function SoundToggleIcon({ 
  isMuted, 
  ...props 
}: Omit<MorphingIconProps, 'preset' | 'state'> & { isMuted: boolean }) {
  return <MorphingIcon preset="sound-mute" state={isMuted} {...props} />;
}

export function LockToggleIcon({ 
  isLocked, 
  ...props 
}: Omit<MorphingIconProps, 'preset' | 'state'> & { isLocked: boolean }) {
  return <MorphingIcon preset="lock-unlock" state={!isLocked} {...props} />;
}

export default MorphingIcon;
