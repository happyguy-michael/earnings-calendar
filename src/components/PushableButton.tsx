'use client';

import { ReactNode, ButtonHTMLAttributes, forwardRef } from 'react';

type PushableVariant = 'primary' | 'success' | 'danger' | 'warning' | 'neutral' | 'ghost';
type PushableSize = 'sm' | 'md' | 'lg';

interface PushableButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode;
  variant?: PushableVariant;
  size?: PushableSize;
  /** Depth of the 3D edge in pixels */
  depth?: number;
  /** Show a drop shadow below the button */
  shadow?: boolean;
  /** Full width button */
  fullWidth?: boolean;
}

/**
 * PushableButton - 3D Tactile Button with Press Physics
 * 
 * Inspired by Josh Comeau's "Building a Magical 3D Button" tutorial.
 * Creates a satisfying physical press effect using layered transforms.
 * 
 * Features:
 * - 3D depth effect with edge layer
 * - Smooth press animation (quick snap down)
 * - Bouncy release with spring easing
 * - Hover rise effect
 * - Brightness increase on hover
 * - Optional drop shadow
 * - Multiple color variants
 * - Size options (sm, md, lg)
 * - Respects prefers-reduced-motion
 * - Full accessibility support
 * 
 * Physics:
 * - Press: 34ms (instant, ~2 frames at 60fps)
 * - Release: 250ms with spring overshoot
 * - Equilibrium: 600ms gradual return
 */
export const PushableButton = forwardRef<HTMLButtonElement, PushableButtonProps>(
  function PushableButton(
    {
      children,
      variant = 'primary',
      size = 'md',
      depth = 4,
      shadow = true,
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) {
    return (
      <>
        <button
          ref={ref}
          disabled={disabled}
          className={`pushable pushable-${variant} pushable-${size} ${fullWidth ? 'pushable-full' : ''} ${disabled ? 'pushable-disabled' : ''} ${className}`}
          {...props}
        >
          {shadow && <span className="pushable-shadow" aria-hidden="true" />}
          <span className="pushable-edge" aria-hidden="true" />
          <span className="pushable-front">{children}</span>
        </button>

        <style jsx>{`
          /* Base pushable button structure */
          .pushable {
            position: relative;
            border: none;
            background: transparent;
            padding: 0;
            cursor: pointer;
            outline-offset: 4px;
            transition: filter 600ms;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }

          .pushable-full {
            width: 100%;
          }

          .pushable:focus:not(:focus-visible) {
            outline: none;
          }

          .pushable:hover {
            filter: brightness(110%);
            transition: filter 250ms;
          }

          .pushable:active {
            filter: brightness(105%);
          }

          .pushable-disabled {
            pointer-events: none;
            opacity: 0.5;
          }

          /* Shadow layer - moves opposite to front */
          .pushable-shadow {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 12px;
            background: hsl(0deg 0% 0% / 0.25);
            will-change: transform;
            transform: translateY(2px);
            transition: transform 600ms cubic-bezier(0.3, 0.7, 0.4, 1);
            filter: blur(4px);
          }

          .pushable:hover .pushable-shadow {
            transform: translateY(${depth}px);
            transition: transform 250ms cubic-bezier(0.3, 0.7, 0.4, 1.5);
          }

          .pushable:active .pushable-shadow {
            transform: translateY(1px);
            transition: transform 34ms;
          }

          /* Edge layer - creates 3D depth illusion */
          .pushable-edge {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 12px;
            background: linear-gradient(
              to left,
              var(--edge-dark) 0%,
              var(--edge-light) 8%,
              var(--edge-light) 92%,
              var(--edge-dark) 100%
            );
          }

          /* Front layer - the visible button surface */
          .pushable-front {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            position: relative;
            border-radius: 12px;
            font-weight: 600;
            color: var(--text-color);
            background: var(--bg-color);
            will-change: transform;
            transform: translateY(-${depth}px);
            transition: transform 600ms cubic-bezier(0.3, 0.7, 0.4, 1);
          }

          .pushable:hover .pushable-front {
            transform: translateY(-${depth + 2}px);
            transition: transform 250ms cubic-bezier(0.3, 0.7, 0.4, 1.5);
          }

          .pushable:active .pushable-front {
            transform: translateY(-2px);
            transition: transform 34ms;
          }

          /* Size variants */
          .pushable-sm .pushable-front {
            padding: 8px 16px;
            font-size: 13px;
            border-radius: 8px;
          }
          .pushable-sm .pushable-edge,
          .pushable-sm .pushable-shadow {
            border-radius: 8px;
          }

          .pushable-md .pushable-front {
            padding: 12px 24px;
            font-size: 15px;
          }

          .pushable-lg .pushable-front {
            padding: 16px 32px;
            font-size: 17px;
          }

          /* Primary variant (blue) */
          .pushable-primary {
            --bg-color: hsl(220deg 100% 55%);
            --text-color: hsl(0deg 0% 100%);
            --edge-light: hsl(220deg 100% 40%);
            --edge-dark: hsl(220deg 100% 25%);
          }

          /* Success variant (green) */
          .pushable-success {
            --bg-color: hsl(145deg 65% 45%);
            --text-color: hsl(0deg 0% 100%);
            --edge-light: hsl(145deg 65% 32%);
            --edge-dark: hsl(145deg 65% 20%);
          }

          /* Danger variant (red) */
          .pushable-danger {
            --bg-color: hsl(355deg 85% 55%);
            --text-color: hsl(0deg 0% 100%);
            --edge-light: hsl(355deg 85% 40%);
            --edge-dark: hsl(355deg 85% 25%);
          }

          /* Warning variant (yellow/amber) */
          .pushable-warning {
            --bg-color: hsl(40deg 95% 50%);
            --text-color: hsl(40deg 95% 15%);
            --edge-light: hsl(40deg 95% 38%);
            --edge-dark: hsl(40deg 95% 25%);
          }

          /* Neutral variant (gray) - adapts to theme */
          .pushable-neutral {
            --bg-color: hsl(220deg 10% 50%);
            --text-color: hsl(0deg 0% 100%);
            --edge-light: hsl(220deg 10% 38%);
            --edge-dark: hsl(220deg 10% 25%);
          }

          /* Ghost variant - transparent with border feel */
          .pushable-ghost {
            --bg-color: hsl(220deg 15% 95%);
            --text-color: hsl(220deg 20% 30%);
            --edge-light: hsl(220deg 15% 82%);
            --edge-dark: hsl(220deg 15% 70%);
          }

          /* Dark mode adjustments */
          @media (prefers-color-scheme: dark) {
            .pushable-ghost {
              --bg-color: hsl(220deg 15% 20%);
              --text-color: hsl(220deg 10% 90%);
              --edge-light: hsl(220deg 15% 12%);
              --edge-dark: hsl(220deg 15% 6%);
            }
            
            .pushable-neutral {
              --bg-color: hsl(220deg 10% 35%);
              --edge-light: hsl(220deg 10% 25%);
              --edge-dark: hsl(220deg 10% 15%);
            }
          }

          /* Theme class overrides (for explicit theme control) */
          :global(.dark) .pushable-ghost {
            --bg-color: hsl(220deg 15% 20%);
            --text-color: hsl(220deg 10% 90%);
            --edge-light: hsl(220deg 15% 12%);
            --edge-dark: hsl(220deg 15% 6%);
          }

          :global(.dark) .pushable-neutral {
            --bg-color: hsl(220deg 10% 35%);
            --edge-light: hsl(220deg 10% 25%);
            --edge-dark: hsl(220deg 10% 15%);
          }

          /* Reduced motion preference */
          @media (prefers-reduced-motion: reduce) {
            .pushable-front,
            .pushable-shadow {
              transition: none;
            }
            
            .pushable:hover .pushable-front {
              transform: translateY(-${depth}px);
            }
            
            .pushable:active .pushable-front {
              transform: translateY(-${depth}px);
            }
            
            .pushable:hover .pushable-shadow {
              transform: translateY(2px);
            }
            
            .pushable:active .pushable-shadow {
              transform: translateY(2px);
            }
          }
        `}</style>
      </>
    );
  }
);

/**
 * PushableIconButton - Square icon button with 3D push effect
 */
interface PushableIconButtonProps extends Omit<PushableButtonProps, 'children'> {
  icon: ReactNode;
  'aria-label': string;
}

export const PushableIconButton = forwardRef<HTMLButtonElement, PushableIconButtonProps>(
  function PushableIconButton({ icon, size = 'md', className = '', ...props }, ref) {
    const sizeClass = {
      sm: 'pushable-icon-sm',
      md: 'pushable-icon-md',
      lg: 'pushable-icon-lg',
    }[size];

    return (
      <>
        <PushableButton
          ref={ref}
          size={size}
          className={`pushable-icon ${sizeClass} ${className}`}
          {...props}
        >
          {icon}
        </PushableButton>

        <style jsx global>{`
          .pushable-icon .pushable-front {
            padding: 0 !important;
            aspect-ratio: 1;
          }

          .pushable-icon-sm .pushable-front {
            width: 32px;
            height: 32px;
          }

          .pushable-icon-md .pushable-front {
            width: 40px;
            height: 40px;
          }

          .pushable-icon-lg .pushable-front {
            width: 48px;
            height: 48px;
          }
        `}</style>
      </>
    );
  }
);

export type { PushableVariant, PushableSize };
