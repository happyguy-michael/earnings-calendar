'use client';

import { useEffect, useRef, useState, ReactNode, CSSProperties, useCallback } from 'react';

/**
 * FocusSpotlight - Premium keyboard focus indicator with animated spotlight effect
 * 
 * Replaces ugly browser default focus rings with an elegant, animated spotlight
 * that makes keyboard navigation feel as premium as mouse interactions.
 * 
 * Inspiration:
 * - Linear.app's focus states with subtle glow
 * - Stripe Dashboard keyboard navigation
 * - Apple's focus-visible ring with spring animation
 * - Vercel's accessible-but-beautiful focus indicators
 * 
 * Features:
 * - Animated spotlight that scales in when focused
 * - Ring expands from center with spring physics
 * - Optional pulse effect on focus arrival
 * - Theme-aware colors (indigo in dark, slate in light)
 * - Full prefers-reduced-motion support
 * - Works with :focus-visible (keyboard only, not mouse)
 */

interface FocusSpotlightProps {
  children: ReactNode;
  /** Border radius to match the element */
  borderRadius?: number | string;
  /** Focus ring color */
  ringColor?: string;
  /** Glow/spotlight color (defaults to ringColor with lower opacity) */
  glowColor?: string;
  /** Ring width in pixels */
  ringWidth?: number;
  /** Glow radius in pixels */
  glowRadius?: number;
  /** Show pulse animation on focus */
  pulseOnFocus?: boolean;
  /** Ring offset from element edge */
  offset?: number;
  /** Additional className */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
  /** Make the wrapper inline */
  inline?: boolean;
  /** Variant for different color schemes */
  variant?: 'default' | 'success' | 'warning' | 'danger';
  /** Tabindex for the focusable wrapper */
  tabIndex?: number;
  /** onClick handler */
  onClick?: () => void;
  /** onKeyDown handler */
  onKeyDown?: (e: React.KeyboardEvent) => void;
  /** ARIA role */
  role?: string;
  /** ARIA label */
  'aria-label'?: string;
}

const variantColors = {
  default: {
    dark: { ring: 'rgba(99, 102, 241, 0.8)', glow: 'rgba(99, 102, 241, 0.25)' },
    light: { ring: 'rgba(99, 102, 241, 0.9)', glow: 'rgba(99, 102, 241, 0.15)' },
  },
  success: {
    dark: { ring: 'rgba(34, 197, 94, 0.8)', glow: 'rgba(34, 197, 94, 0.25)' },
    light: { ring: 'rgba(34, 197, 94, 0.9)', glow: 'rgba(34, 197, 94, 0.15)' },
  },
  warning: {
    dark: { ring: 'rgba(245, 158, 11, 0.8)', glow: 'rgba(245, 158, 11, 0.25)' },
    light: { ring: 'rgba(245, 158, 11, 0.9)', glow: 'rgba(245, 158, 11, 0.15)' },
  },
  danger: {
    dark: { ring: 'rgba(239, 68, 68, 0.8)', glow: 'rgba(239, 68, 68, 0.25)' },
    light: { ring: 'rgba(239, 68, 68, 0.9)', glow: 'rgba(239, 68, 68, 0.15)' },
  },
};

export function FocusSpotlight({
  children,
  borderRadius = 12,
  ringColor,
  glowColor,
  ringWidth = 2,
  glowRadius = 12,
  pulseOnFocus = true,
  offset = 3,
  className = '',
  style,
  inline = false,
  variant = 'default',
  tabIndex,
  onClick,
  onKeyDown,
  role,
  'aria-label': ariaLabel,
}: FocusSpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isKeyboardFocus, setIsKeyboardFocus] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [pulseActive, setPulseActive] = useState(false);

  // Detect theme
  useEffect(() => {
    const checkTheme = () => {
      setIsLightMode(document.documentElement.classList.contains('light'));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    return () => observer.disconnect();
  }, []);

  // Check reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Track keyboard vs mouse focus
  const handleFocus = useCallback((e: React.FocusEvent) => {
    setIsFocused(true);
    
    // Check if this is keyboard focus (focus-visible polyfill logic)
    // Most modern browsers support :focus-visible, but we track it manually too
    const target = e.target as HTMLElement;
    const isKeyboard = target.matches?.(':focus-visible') ?? true;
    setIsKeyboardFocus(isKeyboard);

    // Trigger pulse
    if (pulseOnFocus && isKeyboard && !prefersReducedMotion) {
      setPulseActive(true);
      setTimeout(() => setPulseActive(false), 600);
    }
  }, [pulseOnFocus, prefersReducedMotion]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setIsKeyboardFocus(false);
  }, []);

  // Get colors based on variant and theme
  const mode = isLightMode ? 'light' : 'dark';
  const colors = variantColors[variant][mode];
  const computedRingColor = ringColor || colors.ring;
  const computedGlowColor = glowColor || colors.glow;

  // Calculate border radius string
  const radiusValue = typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius;
  const outerRadiusValue = typeof borderRadius === 'number' 
    ? `${borderRadius + offset}px` 
    : `calc(${borderRadius} + ${offset}px)`;

  // Animation values for non-reduced-motion
  const showSpotlight = isFocused && isKeyboardFocus;
  
  return (
    <div
      ref={containerRef}
      className={`focus-spotlight-container ${className}`}
      style={{
        position: 'relative',
        display: inline ? 'inline-block' : 'block',
        borderRadius: radiusValue,
        outline: 'none',
        ...style,
      }}
      tabIndex={tabIndex}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role={role}
      aria-label={ariaLabel}
    >
      {/* Outer glow/spotlight layer */}
      <div
        className="focus-spotlight-glow"
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: -offset - glowRadius / 2,
          borderRadius: `calc(${outerRadiusValue} + ${glowRadius / 2}px)`,
          background: `radial-gradient(ellipse at center, ${computedGlowColor}, transparent 70%)`,
          opacity: showSpotlight ? 1 : 0,
          transform: showSpotlight ? 'scale(1)' : 'scale(0.95)',
          transition: prefersReducedMotion 
            ? 'opacity 0.1s ease' 
            : 'opacity 0.25s ease-out, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          pointerEvents: 'none',
        }}
      />

      {/* Ring layer */}
      <div
        className="focus-spotlight-ring"
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: -offset,
          borderRadius: outerRadiusValue,
          border: `${ringWidth}px solid ${computedRingColor}`,
          opacity: showSpotlight ? 1 : 0,
          transform: showSpotlight ? 'scale(1)' : 'scale(0.98)',
          transition: prefersReducedMotion
            ? 'opacity 0.1s ease'
            : 'opacity 0.2s ease-out, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
          pointerEvents: 'none',
        }}
      />

      {/* Pulse ring (expands and fades) */}
      {pulseOnFocus && !prefersReducedMotion && (
        <div
          className="focus-spotlight-pulse"
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: -offset,
            borderRadius: outerRadiusValue,
            border: `${ringWidth}px solid ${computedRingColor}`,
            opacity: pulseActive ? 0.6 : 0,
            transform: pulseActive ? 'scale(1.15)' : 'scale(1)',
            transition: pulseActive 
              ? 'opacity 0.5s ease-out, transform 0.5s ease-out'
              : 'none',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, borderRadius: radiusValue }}>
        {children}
      </div>
    </div>
  );
}

/**
 * FocusSpotlightCard - Combines FocusSpotlight with common card patterns
 */
interface FocusSpotlightCardProps extends Omit<FocusSpotlightProps, 'children'> {
  children: ReactNode;
  /** Enable hover scale effect */
  hoverScale?: boolean;
  /** Hover scale amount */
  hoverScaleAmount?: number;
}

export function FocusSpotlightCard({
  children,
  hoverScale = true,
  hoverScaleAmount = 1.02,
  className = '',
  ...props
}: FocusSpotlightCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <FocusSpotlight
      className={`focus-spotlight-card ${className}`}
      {...props}
    >
      <div
        className="focus-spotlight-card-inner"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          transform: hoverScale && isHovered && !prefersReducedMotion
            ? `scale(${hoverScaleAmount})`
            : 'scale(1)',
          transition: prefersReducedMotion
            ? 'none'
            : 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {children}
      </div>
    </FocusSpotlight>
  );
}

/**
 * useFocusSpotlightStyle - Hook for applying focus spotlight styles to existing elements
 * 
 * For cases where you can't wrap with FocusSpotlight component
 */
export function useFocusSpotlightStyle(options: {
  variant?: 'default' | 'success' | 'warning' | 'danger';
  ringWidth?: number;
  offset?: number;
} = {}) {
  const { variant = 'default', ringWidth = 2, offset = 3 } = options;
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsLightMode(document.documentElement.classList.contains('light'));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    return () => observer.disconnect();
  }, []);

  const mode = isLightMode ? 'light' : 'dark';
  const colors = variantColors[variant][mode];

  // Return CSS-in-JS styles for focus-visible
  return {
    outline: 'none',
    '&:focus-visible': {
      boxShadow: `0 0 0 ${offset}px transparent, 0 0 0 ${offset + ringWidth}px ${colors.ring}, 0 0 20px ${colors.glow}`,
    },
  };
}

/**
 * FocusSpotlightGlobal - Adds global focus-visible styles
 * 
 * Include once in your app to enhance all focusable elements
 */
export function FocusSpotlightGlobal() {
  useEffect(() => {
    const styleId = 'focus-spotlight-global-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Enhanced focus-visible for all interactive elements */
      :focus:not(:focus-visible) {
        outline: none;
      }

      :focus-visible {
        outline: none;
        --focus-ring-color: rgba(99, 102, 241, 0.8);
        --focus-glow-color: rgba(99, 102, 241, 0.25);
        box-shadow: 
          0 0 0 3px transparent,
          0 0 0 5px var(--focus-ring-color),
          0 0 16px var(--focus-glow-color);
        transition: box-shadow 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .light :focus-visible {
        --focus-ring-color: rgba(99, 102, 241, 0.9);
        --focus-glow-color: rgba(99, 102, 241, 0.15);
      }

      /* Respect reduced motion */
      @media (prefers-reduced-motion: reduce) {
        :focus-visible {
          transition: none;
        }
      }
    `;
    document.head.appendChild(style);
  }, []);

  return null;
}

export default FocusSpotlight;
