'use client';

import { useEffect, useState, useRef, ReactNode, CSSProperties } from 'react';

/**
 * BorderBeam - Animated traveling light beam around element borders
 * 
 * Creates a glowing light beam (or dot) that continuously travels around
 * the border of its container, creating a premium "scanning" or "active" effect.
 * 
 * Inspired by:
 * - Magic UI's Border Beam component (magicui.design)
 * - Linear.app's card highlights
 * - Premium SaaS dashboards with "alive" UI patterns
 * - 2025/2026 trend: "Living Interfaces" with subtle constant motion
 * 
 * How it works:
 * - Uses CSS conic-gradient with @property for smooth angle animation
 * - The beam is a gradient "slice" that rotates around the element
 * - Mask-composite creates the hollow border effect
 * - Hardware-accelerated via transform/opacity
 * 
 * Use cases:
 * - Highlighting today's date in a calendar
 * - Drawing attention to exceptional earnings (monster beats)
 * - Indicating "live" or "active" elements
 * - Premium hover/focus states
 * 
 * @example
 * <BorderBeam>
 *   <div className="card">Content</div>
 * </BorderBeam>
 * 
 * <BorderBeam variant="fast" color="success" size="lg">
 *   <MonsterBeatCard />
 * </BorderBeam>
 */

type Variant = 'default' | 'slow' | 'fast' | 'pulse';
type ColorScheme = 'gradient' | 'blue' | 'purple' | 'success' | 'warning' | 'mono';
type Size = 'sm' | 'md' | 'lg';

interface BorderBeamProps {
  children: ReactNode;
  /** Animation speed variant */
  variant?: Variant;
  /** Color scheme for the beam */
  color?: ColorScheme;
  /** Border/beam thickness */
  size?: Size;
  /** Border radius in pixels or CSS value */
  borderRadius?: number | string;
  /** Whether to show the beam (can be used for conditional rendering) */
  active?: boolean;
  /** Additional className for the container */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
  /** Whether to pause animation on hover (for focus) */
  pauseOnHover?: boolean;
  /** Delay before animation starts (ms) */
  delay?: number;
  /** Beam spread angle in degrees (how wide the glow is) */
  spread?: number;
  /** Optional custom gradient for the beam */
  customGradient?: string;
}

// Duration presets in ms
const VARIANT_DURATIONS = {
  default: 6000,
  slow: 10000,
  fast: 3000,
  pulse: 4000,
};

// Color presets - the "hot" color that travels
const COLOR_PRESETS = {
  gradient: {
    beam: 'hsl(var(--beam-hue, 220), 100%, 70%)',
    glow: 'hsl(var(--beam-hue, 220), 100%, 60%)',
    animation: true, // Hue shifts
  },
  blue: {
    beam: '#60a5fa',
    glow: '#3b82f6',
    animation: false,
  },
  purple: {
    beam: '#a78bfa',
    glow: '#8b5cf6',
    animation: false,
  },
  success: {
    beam: '#4ade80',
    glow: '#22c55e',
    animation: false,
  },
  warning: {
    beam: '#fbbf24',
    glow: '#f59e0b',
    animation: false,
  },
  mono: {
    beam: 'rgba(255, 255, 255, 0.9)',
    glow: 'rgba(255, 255, 255, 0.6)',
    animation: false,
  },
};

// Size presets
const SIZE_PRESETS = {
  sm: { border: 1, glow: 4 },
  md: { border: 2, glow: 8 },
  lg: { border: 3, glow: 12 },
};

export function BorderBeam({
  children,
  variant = 'default',
  color = 'gradient',
  size = 'md',
  borderRadius = 12,
  active = true,
  className = '',
  style = {},
  pauseOnHover = false,
  delay = 0,
  spread = 45,
  customGradient,
}: BorderBeamProps) {
  const [mounted, setMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const uniqueId = useRef(`border-beam-${Math.random().toString(36).slice(2, 9)}`);

  // Detect reduced motion
  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Detect light mode
  useEffect(() => {
    const checkTheme = () => {
      setIsLightMode(document.documentElement.classList.contains('light'));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  // Don't render beam if disabled or reduced motion
  if (!active || !mounted || prefersReducedMotion) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  const duration = VARIANT_DURATIONS[variant];
  const colorScheme = COLOR_PRESETS[color];
  const sizeConfig = SIZE_PRESETS[size];
  const radiusValue = typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius;

  // Build the beam gradient
  const spreadHalf = spread / 2;
  const beamGradient = customGradient || `
    conic-gradient(
      from var(--beam-angle, 0deg) at 50% 50%,
      transparent 0deg,
      transparent ${90 - spreadHalf}deg,
      ${colorScheme.glow} ${90 - spreadHalf / 2}deg,
      ${colorScheme.beam} 90deg,
      ${colorScheme.glow} ${90 + spreadHalf / 2}deg,
      transparent ${90 + spreadHalf}deg,
      transparent 360deg
    )
  `;

  const pulseOpacity = variant === 'pulse' ? 'var(--beam-opacity, 1)' : '1';

  return (
    <div
      ref={containerRef}
      className={`border-beam-container ${className}`}
      style={{
        position: 'relative',
        borderRadius: radiusValue,
        ...style,
      }}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      {/* The beam layer */}
      <div
        className={`border-beam ${isPaused ? 'paused' : ''}`}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: `-${sizeConfig.border}px`,
          borderRadius: `calc(${radiusValue} + ${sizeConfig.border}px)`,
          background: beamGradient,
          opacity: pulseOpacity,
          zIndex: 0,
          pointerEvents: 'none',
          // Mask to create hollow border effect
          mask: `
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0)
          `,
          maskComposite: 'exclude',
          WebkitMask: `
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0)
          `,
          WebkitMaskComposite: 'xor',
          padding: `${sizeConfig.border}px`,
          animation: `beam-rotate ${duration}ms linear ${delay}ms infinite${colorScheme.animation ? ', beam-hue-shift 8000ms linear infinite' : ''}${variant === 'pulse' ? ', beam-pulse 2000ms ease-in-out infinite' : ''}`,
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      />

      {/* Outer glow layer */}
      <div
        className="border-beam-glow"
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: `-${sizeConfig.glow}px`,
          borderRadius: `calc(${radiusValue} + ${sizeConfig.glow}px)`,
          background: beamGradient,
          filter: `blur(${sizeConfig.glow}px)`,
          opacity: isLightMode ? 0.3 : 0.5,
          zIndex: -1,
          pointerEvents: 'none',
          animation: `beam-rotate ${duration}ms linear ${delay}ms infinite${colorScheme.animation ? ', beam-hue-shift 8000ms linear infinite' : ''}`,
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      />

      {/* Content */}
      <div 
        className="border-beam-content"
        style={{ 
          position: 'relative', 
          zIndex: 1,
          borderRadius: radiusValue,
        }}
      >
        {children}
      </div>

      {/* Keyframes injection */}
      <style jsx global>{`
        @property --beam-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        
        @property --beam-hue {
          syntax: '<number>';
          initial-value: 220;
          inherits: false;
        }
        
        @property --beam-opacity {
          syntax: '<number>';
          initial-value: 1;
          inherits: false;
        }
        
        @keyframes beam-rotate {
          from {
            --beam-angle: 0deg;
          }
          to {
            --beam-angle: 360deg;
          }
        }
        
        @keyframes beam-hue-shift {
          0% {
            --beam-hue: 220;
          }
          33% {
            --beam-hue: 280;
          }
          66% {
            --beam-hue: 180;
          }
          100% {
            --beam-hue: 220;
          }
        }
        
        @keyframes beam-pulse {
          0%, 100% {
            --beam-opacity: 0.6;
          }
          50% {
            --beam-opacity: 1;
          }
        }
        
        .border-beam.paused,
        .border-beam-glow.paused {
          animation-play-state: paused !important;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .border-beam,
          .border-beam-glow {
            animation: none !important;
          }
        }
        
        /* Light mode adjustments */
        :global(html.light) .border-beam-glow {
          opacity: 0.25 !important;
        }
      `}</style>
    </div>
  );
}

/**
 * BorderBeamCard - Pre-configured card wrapper with border beam
 */
export function BorderBeamCard({
  children,
  className = '',
  active = true,
  ...props
}: Omit<BorderBeamProps, 'borderRadius'>) {
  return (
    <BorderBeam
      active={active}
      borderRadius={16}
      className={`border-beam-card ${className}`}
      {...props}
    >
      <div
        style={{
          background: 'var(--bg-card, rgba(20, 20, 30, 0.8))',
          borderRadius: '16px',
          padding: '16px',
        }}
      >
        {children}
      </div>
    </BorderBeam>
  );
}

/**
 * TodayBeam - Pre-configured for highlighting "today" elements
 * Uses a warm amber/gold color scheme
 */
export function TodayBeam({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <BorderBeam
      variant="slow"
      color="warning"
      size="sm"
      borderRadius={8}
      className={className}
    >
      {children}
    </BorderBeam>
  );
}

/**
 * MonsterBeam - Pre-configured for exceptional results (monster beats)
 * Fast-moving green beam with extra glow
 */
export function MonsterBeam({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <BorderBeam
      variant="fast"
      color="success"
      size="lg"
      borderRadius={12}
      spread={60}
      className={className}
    >
      {children}
    </BorderBeam>
  );
}

/**
 * LiveBeam - Pre-configured for "live" or "active" elements
 * Pulsing blue beam
 */
export function LiveBeam({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <BorderBeam
      variant="pulse"
      color="blue"
      size="md"
      borderRadius={12}
      className={className}
    >
      {children}
    </BorderBeam>
  );
}

export default BorderBeam;
