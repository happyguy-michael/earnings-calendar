'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * HapticFeedback - Tactile feedback for mobile interactions
 * 
 * Provides subtle vibration patterns for key interactions:
 * - light: Quick tap (10ms) - button presses, selections
 * - medium: Standard feedback (25ms) - confirmations, swipes
 * - heavy: Strong pulse (50ms) - important actions, alerts
 * - success: Double tap pattern - completed actions
 * - error: Triple burst - errors, warnings
 * - countdown: Escalating pattern - urgency indicator
 * 
 * Gracefully degrades on unsupported devices.
 * Respects user preference for reduced motion.
 */

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'countdown' | 'select' | 'swipe';

interface HapticOptions {
  /** Enable/disable haptic feedback globally */
  enabled?: boolean;
  /** Intensity multiplier (0.5 = half, 2 = double) */
  intensity?: number;
}

// Vibration patterns in milliseconds
// Format: [vibrate, pause, vibrate, pause, ...]
const PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 8,
  medium: 20,
  heavy: 40,
  success: [15, 50, 15],        // Double tap
  error: [10, 30, 10, 30, 10],  // Triple burst
  countdown: [5, 20, 10, 20, 20], // Escalating
  select: 12,
  swipe: [10, 30, 8],           // Directional feel
};

// Check if vibration is supported
function isVibrationSupported(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

// Apply intensity to a pattern
function applyIntensity(pattern: number | number[], intensity: number): number | number[] {
  if (typeof pattern === 'number') {
    return Math.round(pattern * intensity);
  }
  return pattern.map((v, i) => 
    // Only scale vibration durations (even indices), not pauses
    i % 2 === 0 ? Math.round(v * intensity) : v
  );
}

/**
 * Trigger haptic feedback
 */
export function triggerHaptic(
  pattern: HapticPattern = 'light',
  options: HapticOptions = {}
): boolean {
  const { enabled = true, intensity = 1 } = options;
  
  if (!enabled || !isVibrationSupported()) {
    return false;
  }

  try {
    const basePattern = PATTERNS[pattern];
    const adjustedPattern = applyIntensity(basePattern, intensity);
    return navigator.vibrate(adjustedPattern);
  } catch {
    return false;
  }
}

/**
 * Stop any ongoing vibration
 */
export function stopHaptic(): boolean {
  if (!isVibrationSupported()) return false;
  try {
    return navigator.vibrate(0);
  } catch {
    return false;
  }
}

/**
 * Hook for haptic feedback with automatic preference handling
 */
export function useHaptic(defaultEnabled: boolean = true) {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(defaultEnabled);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setIsSupported(isVibrationSupported());
    
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Load preference from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('haptic-enabled');
      if (stored !== null) {
        setIsEnabled(stored === 'true');
      }
    } catch {}
  }, []);

  const trigger = useCallback((
    pattern: HapticPattern = 'light',
    options: Omit<HapticOptions, 'enabled'> = {}
  ) => {
    // Disable haptics if user prefers reduced motion
    if (prefersReducedMotion) return false;
    
    return triggerHaptic(pattern, { 
      ...options, 
      enabled: isEnabled && isSupported 
    });
  }, [isEnabled, isSupported, prefersReducedMotion]);

  const toggle = useCallback(() => {
    setIsEnabled(prev => {
      const next = !prev;
      try {
        localStorage.setItem('haptic-enabled', String(next));
      } catch {}
      
      // Give feedback when enabling
      if (next && isSupported) {
        triggerHaptic('success');
      }
      
      return next;
    });
  }, [isSupported]);

  return {
    /** Whether device supports vibration */
    isSupported,
    /** Whether haptics are currently enabled */
    isEnabled,
    /** Trigger a haptic pattern */
    trigger,
    /** Stop ongoing vibration */
    stop: stopHaptic,
    /** Toggle haptics on/off */
    toggle,
    /** Set enabled state directly */
    setEnabled: setIsEnabled,
  };
}

/**
 * HapticButton - Button wrapper that triggers haptic feedback on press
 */
interface HapticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  hapticPattern?: HapticPattern;
  hapticIntensity?: number;
  children: React.ReactNode;
}

export function HapticButton({ 
  hapticPattern = 'light',
  hapticIntensity = 1,
  onClick,
  children,
  ...props 
}: HapticButtonProps) {
  const { trigger } = useHaptic();
  
  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    trigger(hapticPattern, { intensity: hapticIntensity });
    onClick?.(e);
  }, [trigger, hapticPattern, hapticIntensity, onClick]);

  return (
    <button onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

/**
 * HapticToggle - Visual toggle for haptic feedback setting
 */
interface HapticToggleProps {
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

export function HapticToggle({ 
  size = 'md', 
  showLabel = false,
  className = ''
}: HapticToggleProps) {
  const { isSupported, isEnabled, toggle } = useHaptic();
  
  // Don't render on unsupported devices
  if (!isSupported) return null;
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
  };

  return (
    <button
      onClick={toggle}
      className={`haptic-toggle ${sizeClasses[size]} ${isEnabled ? 'active' : ''} ${className}`}
      title={isEnabled ? 'Disable haptic feedback' : 'Enable haptic feedback'}
      aria-label={isEnabled ? 'Disable haptic feedback' : 'Enable haptic feedback'}
      aria-pressed={isEnabled}
    >
      <span className="haptic-toggle-icon" aria-hidden="true">
        {isEnabled ? '📳' : '📴'}
      </span>
      {showLabel && (
        <span className="haptic-toggle-label">
          {isEnabled ? 'On' : 'Off'}
        </span>
      )}
    </button>
  );
}

/**
 * Context provider for app-wide haptic settings (optional)
 */
import { createContext, useContext, ReactNode } from 'react';

interface HapticContextValue {
  isSupported: boolean;
  isEnabled: boolean;
  trigger: (pattern?: HapticPattern, options?: Omit<HapticOptions, 'enabled'>) => boolean;
  stop: () => boolean;
  toggle: () => void;
}

const HapticContext = createContext<HapticContextValue | null>(null);

export function HapticProvider({ children }: { children: ReactNode }) {
  const haptic = useHaptic();
  return (
    <HapticContext.Provider value={haptic}>
      {children}
    </HapticContext.Provider>
  );
}

export function useHapticContext() {
  const context = useContext(HapticContext);
  if (!context) {
    throw new Error('useHapticContext must be used within a HapticProvider');
  }
  return context;
}

export default useHaptic;
