'use client';

/**
 * HoldToConfirm — Press-and-hold button for intentional actions
 * 
 * A modern micro-interaction pattern where users must hold a button for a
 * specified duration to confirm an action. This eliminates accidental taps
 * and creates a deliberate, tactile confirmation experience.
 * 
 * Inspiration:
 * - iOS Slide-to-Unlock (intentionality through sustained interaction)
 * - Apple Watch SOS / Emergency actions
 * - Console game "Hold to Confirm" patterns
 * - Vercel's delete confirmation with progress
 * - 2024/2025 trend: "Friction-by-design" for important actions
 * 
 * How it works:
 * - User presses/touches and holds the button
 * - A circular progress ring fills around the button
 * - After duration completes, action fires
 * - Releasing early resets the progress
 * - Haptic feedback at start, progress, and completion
 * 
 * Use cases:
 * - Delete/remove actions
 * - Unsubscribe confirmations
 * - Critical settings changes
 * - Clear all / reset actions
 * - Portfolio sell confirmations (fintech)
 * 
 * Accessibility:
 * - Keyboard support: Space/Enter to start, release to cancel
 * - Screen reader announcements for progress
 * - Reduced motion: instant confirm with single press
 * - Focus visible ring
 * 
 * @example
 * <HoldToConfirm
 *   onConfirm={() => deleteItem(id)}
 *   duration={1500}
 *   label="Delete"
 *   confirmLabel="Deleting..."
 * />
 */

import { 
  useRef, 
  useState, 
  useCallback, 
  useEffect, 
  ReactNode,
  CSSProperties,
  memo
} from 'react';
import { useMotionPreferences } from './MotionPreferences';
import { useHaptic } from './HapticFeedback';

type Variant = 'danger' | 'warning' | 'primary' | 'muted';
type Size = 'sm' | 'md' | 'lg';

interface HoldToConfirmProps {
  /** Callback when hold duration completes */
  onConfirm: () => void;
  /** Duration to hold in ms (default: 1500) */
  duration?: number;
  /** Button label */
  label: ReactNode;
  /** Label shown while holding (default: "Hold...") */
  holdingLabel?: ReactNode;
  /** Label shown after confirmation (default: "Done!") */
  confirmLabel?: ReactNode;
  /** Visual variant */
  variant?: Variant;
  /** Button size */
  size?: Size;
  /** Disabled state */
  disabled?: boolean;
  /** Optional icon before label */
  icon?: ReactNode;
  /** Additional className */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
  /** Show percentage during hold */
  showProgress?: boolean;
  /** Callback during hold progress (0-100) */
  onProgress?: (percent: number) => void;
  /** Called when hold starts */
  onHoldStart?: () => void;
  /** Called when hold is cancelled (released early) */
  onCancel?: () => void;
}

// Size presets
const SIZE_CONFIG = {
  sm: {
    height: 32,
    padding: '0 12px',
    fontSize: 13,
    ringSize: 28,
    ringStroke: 2,
  },
  md: {
    height: 40,
    padding: '0 16px',
    fontSize: 14,
    ringSize: 36,
    ringStroke: 2.5,
  },
  lg: {
    height: 48,
    padding: '0 20px',
    fontSize: 15,
    ringSize: 44,
    ringStroke: 3,
  },
};

// Color presets
const VARIANT_COLORS = {
  danger: {
    bg: 'hsl(0 84% 60%)',
    bgHover: 'hsl(0 84% 55%)',
    bgActive: 'hsl(0 84% 50%)',
    text: 'white',
    ring: 'hsl(0 84% 75%)',
    ringBg: 'hsla(0 84% 60% / 0.25)',
  },
  warning: {
    bg: 'hsl(38 92% 50%)',
    bgHover: 'hsl(38 92% 45%)',
    bgActive: 'hsl(38 92% 40%)',
    text: 'hsl(38 92% 10%)',
    ring: 'hsl(38 92% 70%)',
    ringBg: 'hsla(38 92% 50% / 0.25)',
  },
  primary: {
    bg: 'hsl(220 90% 56%)',
    bgHover: 'hsl(220 90% 50%)',
    bgActive: 'hsl(220 90% 45%)',
    text: 'white',
    ring: 'hsl(220 90% 75%)',
    ringBg: 'hsla(220 90% 56% / 0.25)',
  },
  muted: {
    bg: 'hsl(var(--muted))',
    bgHover: 'hsl(var(--muted-foreground) / 0.15)',
    bgActive: 'hsl(var(--muted-foreground) / 0.2)',
    text: 'hsl(var(--muted-foreground))',
    ring: 'hsl(var(--muted-foreground) / 0.5)',
    ringBg: 'hsl(var(--muted-foreground) / 0.1)',
  },
};

type HoldState = 'idle' | 'holding' | 'confirming' | 'complete';

export const HoldToConfirm = memo(function HoldToConfirm({
  onConfirm,
  duration = 1500,
  label,
  holdingLabel = 'Hold...',
  confirmLabel = 'Done!',
  variant = 'danger',
  size = 'md',
  disabled = false,
  icon,
  className = '',
  style,
  showProgress = true,
  onProgress,
  onHoldStart,
  onCancel,
}: HoldToConfirmProps) {
  const [state, setState] = useState<HoldState>('idle');
  const [progress, setProgress] = useState(0);
  const { shouldAnimate } = useMotionPreferences();
  const { trigger: haptic } = useHaptic();
  const prefersReducedMotion = !shouldAnimate();
  
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const config = SIZE_CONFIG[size];
  const colors = VARIANT_COLORS[variant];
  
  // Calculate ring circumference
  const ringRadius = (config.ringSize - config.ringStroke) / 2;
  const ringCircumference = 2 * Math.PI * ringRadius;
  
  // Animation loop
  const animate = useCallback(() => {
    const elapsed = Date.now() - startTimeRef.current;
    const pct = Math.min((elapsed / duration) * 100, 100);
    
    setProgress(pct);
    onProgress?.(pct);
    
    // Haptic feedback at thresholds
    if (pct >= 25 && pct < 26) haptic('light');
    if (pct >= 50 && pct < 51) haptic('medium');
    if (pct >= 75 && pct < 76) haptic('medium');
    
    if (pct >= 100) {
      // Complete!
      setState('confirming');
      haptic('success');
      onConfirm();
      
      // Show complete state briefly
      setTimeout(() => {
        setState('complete');
        setTimeout(() => {
          setState('idle');
          setProgress(0);
        }, 600);
      }, 100);
    } else if (state === 'holding') {
      rafRef.current = requestAnimationFrame(animate);
    }
  }, [duration, onProgress, onConfirm, haptic, state]);
  
  // Start holding
  const handleStart = useCallback(() => {
    if (disabled) return;
    
    // Reduced motion: instant confirm
    if (prefersReducedMotion) {
      onConfirm();
      haptic('success');
      return;
    }
    
    startTimeRef.current = Date.now();
    setState('holding');
    haptic('light');
    onHoldStart?.();
    rafRef.current = requestAnimationFrame(animate);
  }, [disabled, prefersReducedMotion, onConfirm, haptic, onHoldStart, animate]);
  
  // End holding (released)
  const handleEnd = useCallback(() => {
    if (state !== 'holding') return;
    
    cancelAnimationFrame(rafRef.current);
    
    // Only cancel if not complete
    if (progress < 100) {
      setState('idle');
      setProgress(0);
      haptic('light');
      onCancel?.();
    }
  }, [state, progress, haptic, onCancel]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, []);
  
  // Keyboard support
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleStart();
    }
  }, [handleStart]);
  
  const handleKeyUp = useCallback((e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleEnd();
    }
  }, [handleEnd]);
  
  // Progress ring offset
  const strokeOffset = ringCircumference - (progress / 100) * ringCircumference;
  
  // Current label
  const currentLabel = 
    state === 'complete' ? confirmLabel :
    state === 'holding' || state === 'confirming' ? 
      (showProgress ? `${Math.round(progress)}%` : holdingLabel) :
    label;
  
  return (
    <button
      ref={buttonRef}
      type="button"
      disabled={disabled || state === 'confirming' || state === 'complete'}
      className={`hold-to-confirm ${className}`}
      style={{
        // Layout
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: config.height,
        padding: config.padding,
        minWidth: config.height * 3,
        
        // Appearance
        background: state === 'idle' ? colors.bg : 
          state === 'complete' ? 'hsl(142 76% 36%)' : colors.bgActive,
        color: state === 'complete' ? 'white' : colors.text,
        fontSize: config.fontSize,
        fontWeight: 600,
        fontFamily: 'inherit',
        border: 'none',
        borderRadius: config.height / 2,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        
        // Interaction
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
        WebkitTapHighlightColor: 'transparent',
        outline: 'none',
        
        // Animation
        transition: 'background 150ms ease, transform 100ms ease',
        transform: state === 'holding' ? 'scale(0.98)' : 'scale(1)',
        
        ...style,
      }}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      onTouchCancel={handleEnd}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      aria-label={typeof label === 'string' ? `Hold to ${label.toLowerCase()}` : undefined}
      aria-live="polite"
    >
      {/* Progress ring (shown during hold) */}
      {state === 'holding' && (
        <svg
          width={config.ringSize}
          height={config.ringSize}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%) rotate(-90deg)',
            pointerEvents: 'none',
          }}
        >
          {/* Background ring */}
          <circle
            cx={config.ringSize / 2}
            cy={config.ringSize / 2}
            r={ringRadius}
            fill="none"
            stroke={colors.ringBg}
            strokeWidth={config.ringStroke}
          />
          {/* Progress ring */}
          <circle
            cx={config.ringSize / 2}
            cy={config.ringSize / 2}
            r={ringRadius}
            fill="none"
            stroke={colors.ring}
            strokeWidth={config.ringStroke}
            strokeLinecap="round"
            strokeDasharray={ringCircumference}
            strokeDashoffset={strokeOffset}
            style={{
              transition: 'stroke-dashoffset 50ms linear',
            }}
          />
        </svg>
      )}
      
      {/* Icon */}
      {icon && (
        <span style={{ 
          display: 'flex', 
          alignItems: 'center',
          opacity: state === 'holding' ? 0.7 : 1,
          transition: 'opacity 150ms ease',
        }}>
          {icon}
        </span>
      )}
      
      {/* Label */}
      <span
        style={{
          transition: 'opacity 100ms ease',
        }}
      >
        {currentLabel}
      </span>
      
      {/* Focus ring */}
      <style jsx>{`
        .hold-to-confirm:focus-visible {
          box-shadow: 
            0 0 0 2px hsl(var(--background)),
            0 0 0 4px ${colors.ring};
        }
        
        .hold-to-confirm:not(:disabled):hover {
          background: ${state === 'idle' ? colors.bgHover : undefined};
        }
        
        @media (prefers-reduced-motion: reduce) {
          .hold-to-confirm {
            transition: none !important;
          }
        }
      `}</style>
    </button>
  );
});

/**
 * HoldToConfirmInline — Inline text version for lists
 * 
 * A more subtle variant that appears as text with underline progress,
 * perfect for inline delete links in lists.
 */
export const HoldToConfirmInline = memo(function HoldToConfirmInline({
  onConfirm,
  duration = 1000,
  label,
  confirmLabel = '✓',
  disabled = false,
  className = '',
}: {
  onConfirm: () => void;
  duration?: number;
  label: ReactNode;
  confirmLabel?: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const [state, setState] = useState<'idle' | 'holding' | 'complete'>('idle');
  const [progress, setProgress] = useState(0);
  const { shouldAnimate } = useMotionPreferences();
  const { trigger: haptic } = useHaptic();
  const prefersReducedMotion = !shouldAnimate();
  
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  
  const animate = useCallback(() => {
    const elapsed = Date.now() - startTimeRef.current;
    const pct = Math.min((elapsed / duration) * 100, 100);
    setProgress(pct);
    
    if (pct >= 100) {
      setState('complete');
      haptic('success');
      onConfirm();
      setTimeout(() => {
        setState('idle');
        setProgress(0);
      }, 800);
    } else if (state === 'holding') {
      rafRef.current = requestAnimationFrame(animate);
    }
  }, [duration, onConfirm, haptic, state]);
  
  const handleStart = useCallback(() => {
    if (disabled) return;
    if (prefersReducedMotion) {
      onConfirm();
      return;
    }
    startTimeRef.current = Date.now();
    setState('holding');
    haptic('light');
    rafRef.current = requestAnimationFrame(animate);
  }, [disabled, prefersReducedMotion, onConfirm, haptic, animate]);
  
  const handleEnd = useCallback(() => {
    if (state !== 'holding') return;
    cancelAnimationFrame(rafRef.current);
    if (progress < 100) {
      setState('idle');
      setProgress(0);
    }
  }, [state, progress]);
  
  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  
  return (
    <span
      className={`hold-inline ${className}`}
      style={{
        position: 'relative',
        display: 'inline-block',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        userSelect: 'none',
        color: state === 'complete' ? 'hsl(142 76% 36%)' : 
          state === 'holding' ? 'hsl(0 84% 60%)' : 'inherit',
        transition: 'color 150ms ease',
      }}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
    >
      {state === 'complete' ? confirmLabel : label}
      
      {/* Underline progress */}
      <span
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: 2,
          width: `${progress}%`,
          background: 'hsl(0 84% 60%)',
          borderRadius: 1,
          transition: state === 'idle' ? 'width 200ms ease' : 'none',
        }}
      />
    </span>
  );
});

export default HoldToConfirm;
