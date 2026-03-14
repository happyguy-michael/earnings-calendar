'use client';

import { useState, useCallback, useRef, useEffect, ReactNode, CSSProperties } from 'react';

/**
 * InsetPress - Satisfying Press Micro-Interaction
 * 
 * 2026 Trend: "Buttons expand softly before releasing" + tactile feedback
 * Source: Ripplix UI Animation Guide, Zeka Design Microinteraction Trends
 * 
 * Creates a premium "pressed into surface" feeling that differs from
 * 3D pushable buttons. This is a flatter, more modern approach that
 * pairs well with glassmorphism and neumorphism aesthetics.
 * 
 * Physics-based timing:
 * - Press: < 50ms (instant feedback, critical for perceived responsiveness)
 * - Release: ~200ms with spring overshoot (bouncy return)
 * - Visual: inset shadow, subtle darkening, micro scale-down
 * 
 * Features:
 * - Inset shadow on press (feels like pushing into surface)
 * - Subtle brightness reduction (as if under your finger)
 * - Spring-physics release with overshoot
 * - Works with any child content
 * - Respects prefers-reduced-motion
 * - Touch-friendly with proper touch events
 */

interface SpringConfig {
  stiffness: number;
  damping: number;
}

const SPRING_PRESETS = {
  /** Quick snap with subtle bounce */
  snappy: { stiffness: 500, damping: 30 },
  /** Bouncy, playful feel */
  bouncy: { stiffness: 300, damping: 18 },
  /** Smooth, no overshoot */
  smooth: { stiffness: 400, damping: 40 },
  /** Very stiff, minimal animation */
  stiff: { stiffness: 700, damping: 50 },
} as const;

interface InsetPressProps {
  children: ReactNode;
  /** Spring preset or custom config */
  spring?: keyof typeof SPRING_PRESETS | SpringConfig;
  /** Scale when pressed (default: 0.97) */
  pressScale?: number;
  /** Inset shadow depth when pressed (default: 4) */
  insetDepth?: number;
  /** Brightness reduction when pressed 0-1 (default: 0.95) */
  pressBrightness?: number;
  /** Whether to slightly desaturate on press (default: true) */
  desaturateOnPress?: boolean;
  /** Border radius to maintain */
  borderRadius?: number | string;
  /** Additional className */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
  /** Disable the effect */
  disabled?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Accessibility role */
  role?: string;
  /** Tab index */
  tabIndex?: number;
  /** Aria label */
  'aria-label'?: string;
}

export function InsetPress({
  children,
  spring = 'snappy',
  pressScale = 0.97,
  insetDepth = 4,
  pressBrightness = 0.95,
  desaturateOnPress = true,
  borderRadius,
  className = '',
  style,
  disabled = false,
  onClick,
  role,
  tabIndex,
  'aria-label': ariaLabel,
}: InsetPressProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'pressing' | 'releasing'>('idle');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const releaseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  // Get spring config
  const springConfig = typeof spring === 'string' ? SPRING_PRESETS[spring] : spring;

  // Calculate spring timing
  const releaseTime = Math.min(400, Math.max(150, 2000 / Math.sqrt(springConfig.stiffness)));
  
  // Calculate overshoot for CSS
  const dampingRatio = springConfig.damping / (2 * Math.sqrt(springConfig.stiffness));
  const hasOvershoot = dampingRatio < 1;
  const overshootAmount = hasOvershoot ? 1 + (1 - dampingRatio) * 0.3 : 1;

  // Check reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (releaseTimeoutRef.current) {
        clearTimeout(releaseTimeoutRef.current);
      }
    };
  }, []);

  const handlePressStart = useCallback(() => {
    if (disabled) return;
    
    // Clear any pending release animation
    if (releaseTimeoutRef.current) {
      clearTimeout(releaseTimeoutRef.current);
    }
    
    setIsPressed(true);
    setAnimationPhase('pressing');
  }, [disabled]);

  const handlePressEnd = useCallback(() => {
    if (disabled) return;
    
    setIsPressed(false);
    setAnimationPhase('releasing');
    
    // Return to idle after release animation completes
    releaseTimeoutRef.current = setTimeout(() => {
      setAnimationPhase('idle');
    }, releaseTime + 100);
  }, [disabled, releaseTime]);

  const handleClick = useCallback(() => {
    if (disabled) return;
    onClick?.();
  }, [disabled, onClick]);

  // Handle keyboard activation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePressStart();
    }
  }, [disabled, handlePressStart]);

  const handleKeyUp = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePressEnd();
      onClick?.();
    }
  }, [disabled, handlePressEnd, onClick]);

  // Build inset shadow
  const insetShadow = isPressed
    ? `inset 0 ${insetDepth}px ${insetDepth * 2}px rgba(0, 0, 0, 0.2), inset 0 ${insetDepth / 2}px ${insetDepth}px rgba(0, 0, 0, 0.1)`
    : 'inset 0 0 0 rgba(0, 0, 0, 0)';

  // Build filter
  const filterValue = isPressed
    ? `brightness(${pressBrightness})${desaturateOnPress ? ' saturate(0.95)' : ''}`
    : 'brightness(1) saturate(1)';

  // Build transform with spring overshoot on release
  const scale = isPressed ? pressScale : 1;
  
  // Spring-like bezier curve for release
  const releaseBezier = hasOvershoot
    ? `cubic-bezier(0.34, ${overshootAmount}, 0.64, 1)` // Overshoot curve
    : 'cubic-bezier(0.25, 0.1, 0.25, 1)'; // Standard ease-out

  // Reduced motion: no animation
  if (prefersReducedMotion) {
    return (
      <div
        ref={elementRef}
        className={`inset-press ${className}`}
        style={{
          ...style,
          borderRadius,
          cursor: disabled ? 'default' : onClick ? 'pointer' : 'default',
          opacity: disabled ? 0.6 : 1,
        }}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        role={role || (onClick ? 'button' : undefined)}
        tabIndex={onClick && !disabled ? (tabIndex ?? 0) : tabIndex}
        aria-label={ariaLabel}
        aria-disabled={disabled}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      ref={elementRef}
      className={`inset-press ${isPressed ? 'inset-press-active' : ''} ${className}`}
      style={{
        ...style,
        transform: `scale(${scale})`,
        boxShadow: insetShadow,
        filter: filterValue,
        borderRadius,
        // Different timing for press vs release
        transition: isPressed
          ? 'transform 34ms ease-out, box-shadow 34ms ease-out, filter 34ms ease-out' // Instant press
          : `transform ${releaseTime}ms ${releaseBezier}, box-shadow ${releaseTime}ms ease-out, filter ${releaseTime}ms ease-out`, // Spring release
        transformOrigin: 'center center',
        willChange: animationPhase !== 'idle' ? 'transform, box-shadow, filter' : 'auto',
        cursor: disabled ? 'default' : onClick ? 'pointer' : 'default',
        opacity: disabled ? 0.6 : 1,
        // Prevent text selection during press
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={() => {
        if (isPressed) handlePressEnd();
      }}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onTouchCancel={handlePressEnd}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      role={role || (onClick ? 'button' : undefined)}
      tabIndex={onClick && !disabled ? (tabIndex ?? 0) : tabIndex}
      aria-label={ariaLabel}
      aria-disabled={disabled}
    >
      {children}
    </div>
  );
}

/**
 * InsetPressCard - Pre-styled card with inset press effect
 * Adds appropriate padding, background, and border-radius
 */
export function InsetPressCard({
  children,
  className = '',
  onClick,
  ...props
}: Omit<InsetPressProps, 'borderRadius'>) {
  return (
    <InsetPress
      {...props}
      borderRadius={12}
      className={`inset-press-card ${className}`}
      onClick={onClick}
    >
      {children}
      <style jsx>{`
        :global(.inset-press-card) {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 16px;
        }
        
        :global(html.light .inset-press-card) {
          background: rgba(0, 0, 0, 0.02);
          border: 1px solid rgba(0, 0, 0, 0.06);
        }
      `}</style>
    </InsetPress>
  );
}

/**
 * InsetPressChip - Pill-shaped pressable element (for tags, filters, etc.)
 */
export function InsetPressChip({
  children,
  active = false,
  className = '',
  onClick,
  ...props
}: Omit<InsetPressProps, 'borderRadius'> & { active?: boolean }) {
  return (
    <InsetPress
      {...props}
      borderRadius={999}
      spring="snappy"
      pressScale={0.95}
      insetDepth={3}
      className={`inset-press-chip ${active ? 'inset-press-chip-active' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
      <style jsx>{`
        :global(.inset-press-chip) {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 14px;
          font-size: 13px;
          font-weight: 500;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.7);
        }
        
        :global(.inset-press-chip-active) {
          background: rgba(99, 102, 241, 0.15);
          border-color: rgba(99, 102, 241, 0.3);
          color: #a5b4fc;
        }
        
        :global(html.light .inset-press-chip) {
          background: rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(0, 0, 0, 0.08);
          color: rgba(0, 0, 0, 0.7);
        }
        
        :global(html.light .inset-press-chip-active) {
          background: rgba(99, 102, 241, 0.1);
          border-color: rgba(99, 102, 241, 0.25);
          color: #6366f1;
        }
      `}</style>
    </InsetPress>
  );
}

/**
 * useInsetPress - Hook for adding inset press effect to any element
 * Returns props to spread onto the target element
 */
export function useInsetPress({
  spring = 'snappy',
  pressScale = 0.97,
  insetDepth = 4,
  pressBrightness = 0.95,
  disabled = false,
}: Partial<Pick<InsetPressProps, 'spring' | 'pressScale' | 'insetDepth' | 'pressBrightness' | 'disabled'>> = {}) {
  const [isPressed, setIsPressed] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const springConfig = typeof spring === 'string' ? SPRING_PRESETS[spring] : spring;
  const releaseTime = Math.min(400, Math.max(150, 2000 / Math.sqrt(springConfig.stiffness)));
  const dampingRatio = springConfig.damping / (2 * Math.sqrt(springConfig.stiffness));
  const hasOvershoot = dampingRatio < 1;
  const overshootAmount = hasOvershoot ? 1 + (1 - dampingRatio) * 0.3 : 1;
  const releaseBezier = hasOvershoot
    ? `cubic-bezier(0.34, ${overshootAmount}, 0.64, 1)`
    : 'cubic-bezier(0.25, 0.1, 0.25, 1)';

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const handlePressStart = useCallback(() => {
    if (!disabled) setIsPressed(true);
  }, [disabled]);

  const handlePressEnd = useCallback(() => {
    if (!disabled) setIsPressed(false);
  }, [disabled]);

  if (prefersReducedMotion) {
    return {
      style: {} as CSSProperties,
      onMouseDown: undefined,
      onMouseUp: undefined,
      onMouseLeave: undefined,
      onTouchStart: undefined,
      onTouchEnd: undefined,
      onTouchCancel: undefined,
      isPressed: false,
    };
  }

  const style: CSSProperties = {
    transform: `scale(${isPressed ? pressScale : 1})`,
    boxShadow: isPressed
      ? `inset 0 ${insetDepth}px ${insetDepth * 2}px rgba(0, 0, 0, 0.2), inset 0 ${insetDepth / 2}px ${insetDepth}px rgba(0, 0, 0, 0.1)`
      : undefined,
    filter: isPressed ? `brightness(${pressBrightness})` : undefined,
    transition: isPressed
      ? 'transform 34ms ease-out, box-shadow 34ms ease-out, filter 34ms ease-out'
      : `transform ${releaseTime}ms ${releaseBezier}, box-shadow ${releaseTime}ms ease-out, filter ${releaseTime}ms ease-out`,
    transformOrigin: 'center center',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  };

  return {
    style,
    onMouseDown: handlePressStart,
    onMouseUp: handlePressEnd,
    onMouseLeave: () => { if (isPressed) handlePressEnd(); },
    onTouchStart: handlePressStart,
    onTouchEnd: handlePressEnd,
    onTouchCancel: handlePressEnd,
    isPressed,
  };
}

export default InsetPress;
