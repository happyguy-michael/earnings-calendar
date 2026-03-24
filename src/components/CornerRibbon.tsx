'use client';

import { ReactNode, CSSProperties, useEffect, useState, useMemo } from 'react';

// Suppress styled-jsx type errors
declare global {
  namespace JSX {
    interface IntrinsicElements {
      style: React.DetailedHTMLProps<React.StyleHTMLAttributes<HTMLStyleElement> & { jsx?: boolean }, HTMLStyleElement>;
    }
  }
}

/**
 * CornerRibbon - Diagonal Corner Ribbon Badges
 * 
 * Inspired by:
 * - E-commerce "NEW" / "SALE" ribbons
 * - GitHub's "Beta" corner badges
 * - Product Hunt's "Featured" ribbons
 * - Award/achievement badges in gaming UIs
 * - 2026 trend: Skeuomorphic revival with tactile elements
 * 
 * Adds a diagonal ribbon to the corner of cards or containers,
 * perfect for highlighting:
 * - "BEAT" / "MISS" results
 * - "LIVE" for currently reporting
 * - "NEW" for just-announced results
 * - "HOT" for high-interest stocks
 * - Custom labels
 * 
 * Features:
 * - Configurable corner position (top-left, top-right, bottom-left, bottom-right)
 * - Multiple color variants
 * - Entrance animation with fold-down effect
 * - Subtle shadow for depth
 * - Optional shine/shimmer effect
 * - Full dark/light mode support
 * - prefers-reduced-motion compliance
 */

type RibbonPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
type RibbonVariant = 'beat' | 'miss' | 'pending' | 'live' | 'new' | 'hot' | 'info' | 'custom';
type RibbonSize = 'sm' | 'md' | 'lg';

interface CornerRibbonProps {
  /** Label text */
  label: string;
  /** Corner position */
  position?: RibbonPosition;
  /** Color variant */
  variant?: RibbonVariant;
  /** Size preset */
  size?: RibbonSize;
  /** Custom background color (when variant='custom') */
  color?: string;
  /** Custom text color */
  textColor?: string;
  /** Show shimmer/shine effect */
  shimmer?: boolean;
  /** Show entrance animation */
  animate?: boolean;
  /** Animation delay (ms) */
  delay?: number;
  /** Additional className */
  className?: string;
  /** Icon before label */
  icon?: ReactNode;
  /** Fold effect (3D appearance) */
  fold?: boolean;
  /** Shadow depth (0-3) */
  shadow?: 0 | 1 | 2 | 3;
  /** Pulse animation for attention */
  pulse?: boolean;
}

// Variant colors
const variantStyles: Record<RibbonVariant, { bg: string; text: string; glow?: string }> = {
  beat: {
    bg: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    text: '#ffffff',
    glow: 'rgba(34, 197, 94, 0.4)',
  },
  miss: {
    bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    text: '#ffffff',
    glow: 'rgba(239, 68, 68, 0.4)',
  },
  pending: {
    bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    text: '#ffffff',
    glow: 'rgba(245, 158, 11, 0.4)',
  },
  live: {
    bg: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
    text: '#ffffff',
    glow: 'rgba(239, 68, 68, 0.5)',
  },
  new: {
    bg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    text: '#ffffff',
    glow: 'rgba(59, 130, 246, 0.4)',
  },
  hot: {
    bg: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    text: '#ffffff',
    glow: 'rgba(249, 115, 22, 0.5)',
  },
  info: {
    bg: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    text: '#ffffff',
    glow: 'rgba(99, 102, 241, 0.4)',
  },
  custom: {
    bg: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
    text: '#ffffff',
  },
};

// Size presets
const sizeStyles: Record<RibbonSize, { width: number; fontSize: string; padding: string }> = {
  sm: { width: 80, fontSize: '0.625rem', padding: '2px 20px' },
  md: { width: 100, fontSize: '0.7rem', padding: '4px 24px' },
  lg: { width: 120, fontSize: '0.8rem', padding: '5px 28px' },
};

// Position calculations
const getPositionStyles = (position: RibbonPosition, size: RibbonSize): CSSProperties => {
  const { width } = sizeStyles[size];
  const offset = width * 0.3; // Offset from corner
  
  const baseRotation = {
    'top-left': -45,
    'top-right': 45,
    'bottom-left': 45,
    'bottom-right': -45,
  };
  
  const positions: Record<RibbonPosition, CSSProperties> = {
    'top-left': {
      top: offset,
      left: -offset + 4,
      transform: `rotate(${baseRotation['top-left']}deg)`,
      transformOrigin: 'center center',
    },
    'top-right': {
      top: offset,
      right: -offset + 4,
      transform: `rotate(${baseRotation['top-right']}deg)`,
      transformOrigin: 'center center',
    },
    'bottom-left': {
      bottom: offset,
      left: -offset + 4,
      transform: `rotate(${baseRotation['bottom-left']}deg)`,
      transformOrigin: 'center center',
    },
    'bottom-right': {
      bottom: offset,
      right: -offset + 4,
      transform: `rotate(${baseRotation['bottom-right']}deg)`,
      transformOrigin: 'center center',
    },
  };
  
  return positions[position];
};

export function CornerRibbon({
  label,
  position = 'top-right',
  variant = 'beat',
  size = 'md',
  color,
  textColor,
  shimmer = false,
  animate = true,
  delay = 0,
  className = '',
  icon,
  fold = true,
  shadow = 2,
  pulse = false,
}: CornerRibbonProps) {
  const [isVisible, setIsVisible] = useState(!animate);
  const [isShimmering, setIsShimmering] = useState(false);
  
  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Entrance animation
  useEffect(() => {
    if (!animate || prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [animate, delay, prefersReducedMotion]);

  // Shimmer effect
  useEffect(() => {
    if (!shimmer || prefersReducedMotion) return;

    const shimmerInterval = setInterval(() => {
      setIsShimmering(true);
      setTimeout(() => setIsShimmering(false), 600);
    }, 4000);

    return () => clearInterval(shimmerInterval);
  }, [shimmer, prefersReducedMotion]);

  const styles = variantStyles[variant];
  const sizeStyle = sizeStyles[size];
  const positionStyle = getPositionStyles(position, size);

  // Shadow styles based on depth
  const shadowStyles = {
    0: 'none',
    1: '0 1px 3px rgba(0,0,0,0.2)',
    2: '0 2px 6px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.15)',
    3: '0 4px 12px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)',
  };

  const ribbonStyle: CSSProperties = {
    position: 'absolute',
    ...positionStyle,
    width: sizeStyle.width,
    background: color || styles.bg,
    color: textColor || styles.text,
    fontSize: sizeStyle.fontSize,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: sizeStyle.padding,
    textAlign: 'center',
    boxShadow: shadowStyles[shadow],
    zIndex: 10,
    overflow: 'hidden',
    // Animation states
    opacity: isVisible ? 1 : 0,
    transition: prefersReducedMotion ? 'none' : 'opacity 0.3s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
    ...(animate && !isVisible && !prefersReducedMotion ? {
      transform: `${positionStyle.transform} scale(0.8)`,
    } : {}),
  };

  // Fold triangle styles
  const foldSize = 6;
  const foldColor = 'rgba(0,0,0,0.2)';
  
  const getFoldStyle = (pos: RibbonPosition, side: 'left' | 'right'): CSSProperties => {
    const isTop = pos.includes('top');
    const isLeft = pos.includes('left');
    
    const base: CSSProperties = {
      position: 'absolute',
      width: 0,
      height: 0,
      borderStyle: 'solid',
    };

    // Fold appears at the ends of the ribbon
    if (side === 'left') {
      return {
        ...base,
        left: 0,
        [isTop ? 'bottom' : 'top']: -foldSize,
        borderWidth: isTop 
          ? `0 ${foldSize}px ${foldSize}px 0`
          : `${foldSize}px ${foldSize}px 0 0`,
        borderColor: isTop
          ? `transparent ${foldColor} transparent transparent`
          : `${foldColor} ${foldColor} transparent transparent`,
        transform: isLeft ? 'rotate(0deg)' : 'rotate(90deg)',
      };
    } else {
      return {
        ...base,
        right: 0,
        [isTop ? 'bottom' : 'top']: -foldSize,
        borderWidth: isTop 
          ? `0 0 ${foldSize}px ${foldSize}px`
          : `${foldSize}px 0 0 ${foldSize}px`,
        borderColor: isTop
          ? `transparent transparent ${foldColor} transparent`
          : `${foldColor} transparent transparent ${foldColor}`,
        transform: isLeft ? 'rotate(-90deg)' : 'rotate(0deg)',
      };
    }
  };

  return (
    <div className={`corner-ribbon-wrapper ${className}`} style={ribbonStyle}>
      {/* Main ribbon content */}
      <span className="corner-ribbon-content" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '4px',
        position: 'relative',
        zIndex: 2,
      }}>
        {icon && <span className="corner-ribbon-icon">{icon}</span>}
        {label}
      </span>

      {/* Shimmer effect */}
      {shimmer && !prefersReducedMotion && (
        <span
          className="corner-ribbon-shimmer"
          style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            transform: isShimmering ? 'translateX(200%)' : 'translateX(0)',
            transition: isShimmering ? 'transform 0.6s ease' : 'none',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Pulse effect */}
      {pulse && !prefersReducedMotion && (
        <span
          className="corner-ribbon-pulse"
          style={{
            position: 'absolute',
            inset: 0,
            background: styles.glow || 'rgba(255,255,255,0.2)',
            animation: 'corner-ribbon-pulse 2s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Fold triangles */}
      {fold && (
        <>
          <span style={getFoldStyle(position, 'left')} />
          <span style={getFoldStyle(position, 'right')} />
        </>
      )}

      <style jsx>{`
        @keyframes corner-ribbon-pulse {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

/**
 * Wrapper component that provides positioning context
 */
export function RibbonContainer({
  children,
  ribbon,
  className = '',
  style,
}: {
  children: ReactNode;
  ribbon: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div 
      className={`ribbon-container ${className}`}
      style={{ 
        position: 'relative', 
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
      {ribbon}
    </div>
  );
}

/**
 * Pre-configured ribbon for earnings results
 */
export function EarningsRibbon({
  result,
  position = 'top-right',
  size = 'sm',
  animate = true,
  delay = 200,
}: {
  result: 'beat' | 'miss' | 'pending' | 'live';
  position?: RibbonPosition;
  size?: RibbonSize;
  animate?: boolean;
  delay?: number;
}) {
  const config: Record<string, { label: string; variant: RibbonVariant; shimmer?: boolean; pulse?: boolean }> = {
    beat: { label: 'BEAT', variant: 'beat', shimmer: true },
    miss: { label: 'MISS', variant: 'miss', shimmer: false },
    pending: { label: 'SOON', variant: 'pending', shimmer: false },
    live: { label: 'LIVE', variant: 'live', pulse: true },
  };

  const { label, variant, shimmer, pulse } = config[result];

  return (
    <CornerRibbon
      label={label}
      variant={variant}
      position={position}
      size={size}
      shimmer={shimmer}
      pulse={pulse}
      animate={animate}
      delay={delay}
    />
  );
}

/**
 * "NEW" ribbon for recently announced results
 */
export function NewRibbon({
  position = 'top-left',
  size = 'sm',
}: {
  position?: RibbonPosition;
  size?: RibbonSize;
}) {
  return (
    <CornerRibbon
      label="NEW"
      variant="new"
      position={position}
      size={size}
      shimmer
      animate
      delay={300}
    />
  );
}

/**
 * "HOT" ribbon for high-interest stocks
 */
export function HotRibbon({
  position = 'top-left',
  size = 'sm',
}: {
  position?: RibbonPosition;
  size?: RibbonSize;
}) {
  return (
    <CornerRibbon
      label="🔥 HOT"
      variant="hot"
      position={position}
      size={size}
      pulse
      animate
    />
  );
}
