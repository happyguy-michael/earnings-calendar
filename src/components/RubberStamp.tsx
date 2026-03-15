'use client';

import { useState, useEffect, useCallback, ReactNode, CSSProperties } from 'react';
import { useAudioFeedback } from './AudioFeedback';

/**
 * RubberStamp - Premium Rubber Stamp Effect
 * 
 * Inspired by:
 * - Traditional rubber stamps and seals
 * - Notary embossing effects
 * - Japanese hanko stamp culture
 * - Document certification aesthetics
 * 
 * Creates a satisfying rubber stamp animation where a seal/stamp
 * appears to physically press onto the surface with:
 * - Initial impact squash and stretch
 * - Ink bleed/spread effect
 * - Paper indentation illusion
 * - Slight rotation for authenticity
 * - Optional sound effect
 * 
 * Usage:
 * <RubberStamp text="BEAT" variant="success" trigger={hasReported} />
 * <RubberStamp text="MISS" variant="danger" trigger={hasReported} />
 * <RubberStamp text="VERIFIED" variant="info" shape="circle" />
 */

type StampVariant = 'success' | 'danger' | 'warning' | 'info' | 'neutral';
type StampShape = 'rectangle' | 'circle' | 'oval' | 'badge';
type StampSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface RubberStampProps {
  /** Text to display in the stamp */
  text: string;
  /** Secondary text (smaller, below main text) */
  subtext?: string;
  /** Stamp variant/color */
  variant?: StampVariant;
  /** Stamp shape */
  shape?: StampShape;
  /** Stamp size */
  size?: StampSize;
  /** Trigger the stamp animation */
  trigger?: boolean;
  /** Initial delay before stamping (ms) */
  delay?: number;
  /** Rotation angle (degrees) - random if not specified */
  rotation?: number;
  /** Enable ink bleed effect */
  inkBleed?: boolean;
  /** Enable paper indent effect */
  indent?: boolean;
  /** Enable sound effect */
  sound?: boolean;
  /** Additional class */
  className?: string;
  /** Disable the effect */
  disabled?: boolean;
  /** Custom style */
  style?: CSSProperties;
  /** Called when animation completes */
  onStamped?: () => void;
}

// Variant colors
const variantColors: Record<StampVariant, { border: string; text: string; glow: string }> = {
  success: {
    border: 'rgba(34, 197, 94, 0.9)',
    text: 'rgba(34, 197, 94, 0.85)',
    glow: 'rgba(34, 197, 94, 0.3)',
  },
  danger: {
    border: 'rgba(239, 68, 68, 0.9)',
    text: 'rgba(239, 68, 68, 0.85)',
    glow: 'rgba(239, 68, 68, 0.3)',
  },
  warning: {
    border: 'rgba(234, 179, 8, 0.9)',
    text: 'rgba(234, 179, 8, 0.85)',
    glow: 'rgba(234, 179, 8, 0.3)',
  },
  info: {
    border: 'rgba(59, 130, 246, 0.9)',
    text: 'rgba(59, 130, 246, 0.85)',
    glow: 'rgba(59, 130, 246, 0.3)',
  },
  neutral: {
    border: 'rgba(156, 163, 175, 0.9)',
    text: 'rgba(156, 163, 175, 0.85)',
    glow: 'rgba(156, 163, 175, 0.3)',
  },
};

// Size configurations
const sizeConfig: Record<StampSize, { padding: string; fontSize: string; borderWidth: number; subtextSize: string }> = {
  xs: { padding: '2px 6px', fontSize: '8px', borderWidth: 1, subtextSize: '6px' },
  sm: { padding: '4px 10px', fontSize: '10px', borderWidth: 2, subtextSize: '7px' },
  md: { padding: '6px 14px', fontSize: '13px', borderWidth: 2, subtextSize: '9px' },
  lg: { padding: '8px 20px', fontSize: '16px', borderWidth: 3, subtextSize: '10px' },
  xl: { padding: '12px 28px', fontSize: '20px', borderWidth: 3, subtextSize: '12px' },
};

export function RubberStamp({
  text,
  subtext,
  variant = 'success',
  shape = 'rectangle',
  size = 'md',
  trigger = false,
  delay = 0,
  rotation,
  inkBleed = true,
  indent = true,
  sound = false,
  className = '',
  disabled = false,
  style,
  onStamped,
}: RubberStampProps) {
  const [isStamped, setIsStamped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [actualRotation, setActualRotation] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { play: playAudio } = useAudioFeedback();

  // Check reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Set rotation (random if not specified)
  useEffect(() => {
    if (rotation !== undefined) {
      setActualRotation(rotation);
    } else {
      // Random slight rotation between -8 and 8 degrees for authenticity
      setActualRotation((Math.random() - 0.5) * 16);
    }
  }, [rotation]);

  // Trigger stamp animation
  useEffect(() => {
    if (trigger && !isStamped && !disabled) {
      const timer = setTimeout(() => {
        setIsAnimating(true);
        
        // Play stamp sound
        if (sound) {
          playAudio('click');
        }
        
        // Complete animation after impact
        const completeTimer = setTimeout(() => {
          setIsStamped(true);
          setIsAnimating(false);
          onStamped?.();
        }, prefersReducedMotion ? 100 : 300);
        
        return () => clearTimeout(completeTimer);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [trigger, isStamped, disabled, delay, sound, playAudio, prefersReducedMotion, onStamped]);

  if (!trigger && !isStamped) return null;

  const colors = variantColors[variant];
  const sizeStyles = sizeConfig[size];

  // Shape-specific border radius
  const borderRadius = {
    rectangle: '4px',
    circle: '50%',
    oval: '50%',
    badge: '999px',
  }[shape];

  // Shape-specific aspect ratio adjustments
  const aspectRatio = {
    rectangle: undefined,
    circle: '1',
    oval: '1.5',
    badge: undefined,
  }[shape];

  return (
    <div
      className={`rubber-stamp rubber-stamp-${variant} rubber-stamp-${shape} ${isAnimating ? 'rubber-stamp-animating' : ''} ${isStamped ? 'rubber-stamp-stamped' : ''} ${className}`}
      style={{
        '--stamp-rotation': `${actualRotation}deg`,
        '--stamp-border-color': colors.border,
        '--stamp-text-color': colors.text,
        '--stamp-glow-color': colors.glow,
        '--stamp-border-width': `${sizeStyles.borderWidth}px`,
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: sizeStyles.padding,
        fontSize: sizeStyles.fontSize,
        fontWeight: 700,
        fontFamily: "'Courier New', Courier, monospace",
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
        color: 'var(--stamp-text-color)',
        border: `var(--stamp-border-width) solid var(--stamp-border-color)`,
        borderRadius,
        aspectRatio,
        transform: `rotate(var(--stamp-rotation))`,
        position: 'relative',
        isolation: 'isolate',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        pointerEvents: 'none',
        ...style,
      } as CSSProperties}
    >
      {/* Main text */}
      <span className="rubber-stamp-text">{text}</span>
      
      {/* Subtext */}
      {subtext && (
        <span 
          className="rubber-stamp-subtext"
          style={{
            fontSize: sizeStyles.subtextSize,
            fontWeight: 500,
            marginTop: '2px',
            opacity: 0.8,
          }}
        >
          {subtext}
        </span>
      )}

      {/* Ink bleed effect - slight blur/spread */}
      {inkBleed && (
        <div 
          className="rubber-stamp-ink-bleed"
          style={{
            position: 'absolute',
            inset: `-${sizeStyles.borderWidth}px`,
            border: `${sizeStyles.borderWidth}px solid var(--stamp-border-color)`,
            borderRadius,
            opacity: 0.3,
            filter: 'blur(1px)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Paper indent effect */}
      {indent && (
        <div 
          className="rubber-stamp-indent"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius,
            boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Glow effect for emphasis */}
      <div 
        className="rubber-stamp-glow"
        style={{
          position: 'absolute',
          inset: '-4px',
          borderRadius,
          background: 'var(--stamp-glow-color)',
          filter: 'blur(8px)',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />

      <style jsx>{`
        /* Stamp animation - squash and stretch on impact */
        .rubber-stamp-animating {
          animation: stamp-impact ${prefersReducedMotion ? '0.1s' : '0.3s'} cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        @keyframes stamp-impact {
          0% {
            opacity: 0;
            transform: rotate(var(--stamp-rotation)) scale(1.5) translateY(-20px);
          }
          50% {
            opacity: 1;
            transform: rotate(var(--stamp-rotation)) scale(0.9) translateY(2px);
          }
          70% {
            transform: rotate(var(--stamp-rotation)) scale(1.05) translateY(-1px);
          }
          100% {
            opacity: 1;
            transform: rotate(var(--stamp-rotation)) scale(1) translateY(0);
          }
        }
        
        /* Stamped state */
        .rubber-stamp-stamped {
          opacity: 1;
        }
        
        .rubber-stamp-stamped .rubber-stamp-glow {
          animation: stamp-glow-pulse 2s ease-in-out infinite;
        }
        
        @keyframes stamp-glow-pulse {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.5; }
        }
        
        /* Ink texture overlay for authenticity */
        .rubber-stamp::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 1px,
            rgba(0, 0, 0, 0.03) 1px,
            rgba(0, 0, 0, 0.03) 2px
          );
          pointer-events: none;
        }
        
        /* Slight variations in ink density */
        .rubber-stamp::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: radial-gradient(
            ellipse at 30% 70%,
            transparent 0%,
            rgba(0, 0, 0, 0.05) 50%,
            transparent 100%
          );
          pointer-events: none;
        }
        
        /* Light mode adjustments */
        :global(html.light) .rubber-stamp {
          --stamp-border-color: ${colors.border.replace('0.9', '0.95')};
          --stamp-text-color: ${colors.text.replace('0.85', '0.9')};
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .rubber-stamp-animating {
            animation: none;
            opacity: 1;
          }
          
          .rubber-stamp-stamped .rubber-stamp-glow {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Preset stamp for earnings beats
 */
export function BeatStamp({ 
  trigger,
  size = 'sm',
  className = '',
  ...props 
}: Omit<RubberStampProps, 'text' | 'variant'>) {
  return (
    <RubberStamp
      text="BEAT"
      variant="success"
      size={size}
      shape="badge"
      trigger={trigger}
      className={`beat-stamp ${className}`}
      {...props}
    />
  );
}

/**
 * Preset stamp for earnings misses
 */
export function MissStamp({ 
  trigger,
  size = 'sm',
  className = '',
  ...props 
}: Omit<RubberStampProps, 'text' | 'variant'>) {
  return (
    <RubberStamp
      text="MISS"
      variant="danger"
      size={size}
      shape="badge"
      trigger={trigger}
      className={`miss-stamp ${className}`}
      {...props}
    />
  );
}

/**
 * Preset stamp for verified/confirmed
 */
export function VerifiedStamp({ 
  trigger,
  size = 'sm',
  className = '',
  ...props 
}: Omit<RubberStampProps, 'text' | 'variant'>) {
  return (
    <RubberStamp
      text="✓ VERIFIED"
      variant="info"
      size={size}
      shape="rectangle"
      trigger={trigger}
      className={`verified-stamp ${className}`}
      {...props}
    />
  );
}

/**
 * Circular seal stamp (for official/important items)
 */
export function SealStamp({
  text,
  trigger,
  size = 'md',
  className = '',
  ...props
}: Omit<RubberStampProps, 'shape'>) {
  return (
    <RubberStamp
      text={text}
      shape="circle"
      size={size}
      trigger={trigger}
      className={`seal-stamp ${className}`}
      {...props}
    />
  );
}
