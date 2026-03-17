'use client';

import { useRef, useState, useCallback, useEffect, ReactNode, MouseEvent } from 'react';

/**
 * LiquidButton - Cursor-Following Liquid Blob Button
 * 
 * A premium button component featuring an organic liquid blob that follows
 * the cursor position within the button. The blob morphs continuously with
 * organic border-radius animation, creating a fluid, alive feel.
 * 
 * Inspiration:
 * - DesignDrastic.com's Liquid Button Effect (Feb 2026)
 * - Apple's visionOS fluid interfaces
 * - Stripe's premium button hover states
 * - Liquid/water droplet physics simulations
 * - Morphing blob animations from FreeFrontend
 * 
 * Features:
 * - Cursor-following liquid blob that bulges toward mouse position
 * - Organic morphing animation with varying border-radius
 * - Shine sweep effect on hover
 * - Click ripple effect for tactile feedback
 * - Multiple color variants (primary, success, danger, gradient)
 * - Size variants (sm, md, lg)
 * - Full prefers-reduced-motion support
 * - GPU-accelerated transforms
 * - Works with keyboard focus (blob centers)
 * 
 * @example
 * // Basic usage
 * <LiquidButton onClick={() => console.log('clicked')}>
 *   Click Me
 * </LiquidButton>
 * 
 * // Success variant
 * <LiquidButton variant="success" size="lg">
 *   Confirm
 * </LiquidButton>
 * 
 * // Gradient blob
 * <LiquidButton variant="gradient">
 *   Premium Action
 * </LiquidButton>
 */

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'gradient' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface LiquidButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  disabled?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
  /** Disable the liquid blob effect */
  noBlob?: boolean;
  /** Disable the shine sweep */
  noShine?: boolean;
  /** Custom blob colors (overrides variant) */
  blobColors?: string[];
}

interface RippleState {
  id: number;
  x: number;
  y: number;
  size: number;
}

// Variant-specific blob gradient colors
const VARIANT_GRADIENTS: Record<ButtonVariant, string[]> = {
  primary: ['#6366f1', '#a855f7', '#ec4899'],
  secondary: ['#3b82f6', '#06b6d4', '#0ea5e9'],
  success: ['#10b981', '#34d399', '#6ee7b7'],
  danger: ['#ef4444', '#f87171', '#fca5a5'],
  gradient: ['#6366f1', '#a855f7', '#ec4899', '#f43f5e'],
  ghost: ['rgba(99, 102, 241, 0.4)', 'rgba(168, 85, 247, 0.4)', 'rgba(236, 72, 153, 0.3)'],
};

// Size configurations
const SIZE_CONFIG: Record<ButtonSize, { padding: string; fontSize: string; minHeight: string }> = {
  sm: { padding: '0.5rem 1.25rem', fontSize: '0.875rem', minHeight: '2.25rem' },
  md: { padding: '0.75rem 1.75rem', fontSize: '1rem', minHeight: '2.75rem' },
  lg: { padding: '1rem 2.5rem', fontSize: '1.125rem', minHeight: '3.25rem' },
};

export function LiquidButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  'aria-label': ariaLabel,
  noBlob = false,
  noShine = false,
  blobColors,
}: LiquidButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [ripples, setRipples] = useState<RippleState[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const rafRef = useRef<number | undefined>(undefined);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Track cursor position within button
  const handleMouseMove = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    if (reducedMotion || noBlob || !buttonRef.current) return;
    
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    
    rafRef.current = requestAnimationFrame(() => {
      const rect = buttonRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setCursorPos({ x, y });
    });
  }, [reducedMotion, noBlob]);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    // Reset to center
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCursorPos({ x: rect.width / 2, y: rect.height / 2 });
    }
  }, []);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    // Center the blob on keyboard focus
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCursorPos({ x: rect.width / 2, y: rect.height / 2 });
    }
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  // Ripple effect on click
  const handleClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    
    // Create ripple
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const size = Math.max(rect.width, rect.height) * 2;
      
      const ripple: RippleState = {
        id: Date.now(),
        x: x - size / 2,
        y: y - size / 2,
        size,
      };
      
      setRipples(prev => [...prev, ripple]);
      
      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== ripple.id));
      }, 600);
    }
    
    onClick?.(e);
  }, [disabled, onClick]);

  // Clean up RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const gradientColors = blobColors || VARIANT_GRADIENTS[variant];
  const gradientString = gradientColors.length > 2
    ? `linear-gradient(135deg, ${gradientColors.join(', ')})`
    : `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`;

  const sizeStyles = SIZE_CONFIG[size];
  const showBlob = (isHovering || isFocused) && !noBlob && !reducedMotion;

  return (
    <button
      ref={buttonRef}
      type={type}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`liquid-button liquid-button--${variant} liquid-button--${size} ${
        isHovering ? 'liquid-button--hovering' : ''
      } ${isFocused ? 'liquid-button--focused' : ''} ${
        disabled ? 'liquid-button--disabled' : ''
      } ${className}`}
      style={{
        '--liquid-btn-padding': sizeStyles.padding,
        '--liquid-btn-font-size': sizeStyles.fontSize,
        '--liquid-btn-min-height': sizeStyles.minHeight,
        '--liquid-blob-x': `${cursorPos.x}px`,
        '--liquid-blob-y': `${cursorPos.y}px`,
        '--liquid-blob-gradient': gradientString,
      } as React.CSSProperties}
    >
      {/* Liquid blob container */}
      {!noBlob && (
        <span 
          className={`liquid-button__blob-container ${showBlob ? 'liquid-button__blob-container--visible' : ''}`}
          aria-hidden="true"
        >
          <span className="liquid-button__blob" />
        </span>
      )}
      
      {/* Shine sweep effect */}
      {!noShine && !reducedMotion && (
        <span className="liquid-button__shine" aria-hidden="true" />
      )}
      
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="liquid-button__ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
          aria-hidden="true"
        />
      ))}
      
      {/* Button text */}
      <span className="liquid-button__text">{children}</span>
    </button>
  );
}

/**
 * LiquidButtonStyles - Global CSS for LiquidButton
 * Include once in your app (e.g., in ClientProviders or layout)
 */
export function LiquidButtonStyles() {
  return (
    <style jsx global>{`
      .liquid-button {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: var(--liquid-btn-padding);
        font-size: var(--liquid-btn-font-size);
        font-weight: 600;
        min-height: var(--liquid-btn-min-height);
        color: white;
        background: #1e1e24;
        border: none;
        border-radius: 9999px;
        outline: none;
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        box-shadow: 
          0 4px 6px -1px rgba(0, 0, 0, 0.1),
          0 2px 4px -1px rgba(0, 0, 0, 0.06);
        -webkit-tap-highlight-color: transparent;
      }

      .dark .liquid-button {
        background: #1e1e24;
      }

      :root:not(.dark) .liquid-button {
        background: #1f2937;
      }

      .liquid-button--ghost {
        background: transparent;
        color: #1e1e24;
        box-shadow: inset 0 0 0 2px #e2e8f0;
      }

      .dark .liquid-button--ghost {
        color: white;
        box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.2);
      }

      .liquid-button--hovering {
        transform: translateY(-2px);
        box-shadow: 
          0 10px 15px -3px rgba(0, 0, 0, 0.1),
          0 4px 6px -2px rgba(0, 0, 0, 0.05);
      }

      .liquid-button--ghost.liquid-button--hovering {
        color: white;
        box-shadow: inset 0 0 0 2px transparent;
      }

      .liquid-button:active {
        transform: translateY(0);
      }

      .liquid-button--disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none !important;
      }

      /* Blob container - positions the blob */
      .liquid-button__blob-container {
        position: absolute;
        top: var(--liquid-blob-y, 50%);
        left: var(--liquid-blob-x, 50%);
        width: 280px;
        height: 280px;
        transform: translate(-50%, -50%) scale(0);
        transition: transform 0.4s cubic-bezier(0.33, 1, 0.68, 1);
        z-index: 0;
        pointer-events: none;
      }

      .liquid-button__blob-container--visible {
        transform: translate(-50%, -50%) scale(1.4);
      }

      /* The actual morphing blob */
      .liquid-button__blob {
        display: block;
        width: 100%;
        height: 100%;
        border-radius: 40% 50% 40% 50%;
        background: var(--liquid-blob-gradient);
        animation: liquid-blob-morph 8s ease-in-out infinite;
        filter: blur(1px);
      }

      @keyframes liquid-blob-morph {
        0% {
          transform: rotate(0deg);
          border-radius: 40% 50% 40% 50%;
        }
        25% {
          transform: rotate(90deg);
          border-radius: 50% 40% 50% 40%;
        }
        50% {
          transform: rotate(180deg);
          border-radius: 40% 50% 50% 40%;
        }
        75% {
          transform: rotate(270deg);
          border-radius: 50% 40% 40% 50%;
        }
        100% {
          transform: rotate(360deg);
          border-radius: 40% 50% 40% 50%;
        }
      }

      /* Shine sweep effect */
      .liquid-button__shine {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          to right,
          transparent,
          rgba(255, 255, 255, 0.25),
          transparent
        );
        transform: skewX(-20deg) translateX(-150%);
        pointer-events: none;
        z-index: 2;
      }

      .liquid-button--hovering .liquid-button__shine {
        animation: liquid-shine 0.75s cubic-bezier(0.19, 1, 0.22, 1);
      }

      @keyframes liquid-shine {
        0% {
          transform: skewX(-20deg) translateX(-150%);
        }
        100% {
          transform: skewX(-20deg) translateX(250%);
        }
      }

      /* Ripple effect */
      .liquid-button__ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.4);
        transform: scale(0);
        animation: liquid-ripple 0.6s linear forwards;
        pointer-events: none;
        z-index: 1;
      }

      @keyframes liquid-ripple {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }

      /* Button text - always on top */
      .liquid-button__text {
        position: relative;
        z-index: 3;
        pointer-events: none;
        white-space: nowrap;
      }

      /* Focus visible ring for accessibility */
      .liquid-button:focus-visible {
        outline: 2px solid #6366f1;
        outline-offset: 2px;
      }

      .dark .liquid-button:focus-visible {
        outline-color: #818cf8;
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .liquid-button__blob {
          animation: none;
        }
        .liquid-button__blob-container {
          transition: none;
        }
        .liquid-button--hovering .liquid-button__shine {
          animation: none;
        }
        .liquid-button__ripple {
          animation: none;
          display: none;
        }
        .liquid-button {
          transition: none;
        }
      }
    `}</style>
  );
}

/**
 * LiquidButtonGroup - Container for grouping liquid buttons
 */
interface LiquidButtonGroupProps {
  children: ReactNode;
  className?: string;
  direction?: 'horizontal' | 'vertical';
  gap?: 'sm' | 'md' | 'lg';
}

export function LiquidButtonGroup({
  children,
  className = '',
  direction = 'horizontal',
  gap = 'md',
}: LiquidButtonGroupProps) {
  const gapSizes = { sm: '0.5rem', md: '1rem', lg: '1.5rem' };
  
  return (
    <div
      className={`liquid-button-group ${className}`}
      style={{
        display: 'flex',
        flexDirection: direction === 'vertical' ? 'column' : 'row',
        gap: gapSizes[gap],
        flexWrap: 'wrap',
      }}
    >
      {children}
    </div>
  );
}
