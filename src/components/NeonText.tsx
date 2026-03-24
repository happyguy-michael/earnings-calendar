'use client';

import React, { memo, useMemo, useRef, useEffect, useState } from 'react';

/**
 * NeonText - Neon sign glow effect for text
 * 
 * Creates the characteristic multi-layer glow of real neon signs:
 * - Inner bright core (the gas tube)
 * - Mid glow (ionized gas diffusion)
 * - Outer ambient glow (light reflection)
 * 
 * Optional subtle flicker animation mimics real neon behavior.
 * 
 * @example
 * // Basic usage
 * <NeonText color="blue">LIVE</NeonText>
 * 
 * // With flicker effect
 * <NeonText color="pink" flicker intensity={0.9}>HOT</NeonText>
 * 
 * // Custom styling
 * <NeonText 
 *   color="green" 
 *   intensity={1.2}
 *   fontSize="2rem"
 *   fontWeight={700}
 * >
 *   BEAT +15.2%
 * </NeonText>
 */

export type NeonColor = 
  | 'blue' 
  | 'purple' 
  | 'pink' 
  | 'green' 
  | 'amber' 
  | 'red' 
  | 'cyan' 
  | 'white'
  | 'rainbow';

export interface NeonTextProps {
  children: React.ReactNode;
  /** Neon color preset */
  color?: NeonColor;
  /** Custom color (overrides preset) - use hex or rgb */
  customColor?: string;
  /** Glow intensity multiplier (0.5 = subtle, 1 = normal, 1.5 = intense) */
  intensity?: number;
  /** Enable subtle flicker animation */
  flicker?: boolean;
  /** Flicker speed in ms (lower = faster flicker) */
  flickerSpeed?: number;
  /** Enable "breathing" glow animation */
  breathe?: boolean;
  /** Breathing animation duration in ms */
  breatheDuration?: number;
  /** Show visible "tube" effect (text stroke) */
  tube?: boolean;
  /** Tube thickness in pixels */
  tubeWidth?: number;
  /** Font size (CSS value) */
  fontSize?: string | number;
  /** Font weight */
  fontWeight?: number;
  /** Font family */
  fontFamily?: string;
  /** Letter spacing */
  letterSpacing?: string;
  /** Text transform */
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Delay before animation starts (ms) */
  delay?: number;
  /** Only show glow on hover */
  hoverOnly?: boolean;
  /** Animate in on mount */
  animateIn?: boolean;
  /** Animation duration for entrance (ms) */
  animateInDuration?: number;
}

// Color presets with RGB values for glow layers
const COLOR_PRESETS: Record<NeonColor, { core: string; mid: string; outer: string; text: string }> = {
  blue: {
    core: '59, 130, 246',    // Bright blue
    mid: '37, 99, 235',      // Medium blue  
    outer: '29, 78, 216',    // Deep blue
    text: '#60a5fa',         // Text color
  },
  purple: {
    core: '168, 85, 247',    // Bright purple
    mid: '139, 92, 246',     // Medium purple
    outer: '124, 58, 237',   // Deep purple
    text: '#a78bfa',
  },
  pink: {
    core: '244, 114, 182',   // Bright pink
    mid: '236, 72, 153',     // Medium pink
    outer: '219, 39, 119',   // Deep pink
    text: '#f472b6',
  },
  green: {
    core: '74, 222, 128',    // Bright green
    mid: '34, 197, 94',      // Medium green
    outer: '22, 163, 74',    // Deep green
    text: '#4ade80',
  },
  amber: {
    core: '251, 191, 36',    // Bright amber
    mid: '245, 158, 11',     // Medium amber
    outer: '217, 119, 6',    // Deep amber
    text: '#fbbf24',
  },
  red: {
    core: '248, 113, 113',   // Bright red
    mid: '239, 68, 68',      // Medium red
    outer: '220, 38, 38',    // Deep red
    text: '#f87171',
  },
  cyan: {
    core: '34, 211, 238',    // Bright cyan
    mid: '6, 182, 212',      // Medium cyan
    outer: '8, 145, 178',    // Deep cyan
    text: '#22d3ee',
  },
  white: {
    core: '255, 255, 255',   // Pure white
    mid: '228, 228, 231',    // Off white
    outer: '212, 212, 216',  // Light gray
    text: '#ffffff',
  },
  rainbow: {
    core: '255, 100, 150',   // Will be animated
    mid: '200, 100, 255',
    outer: '100, 150, 255',
    text: '#fff',
  },
};

// Parse custom color to RGB
function parseColor(color: string): string {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  }
  // Handle rgb/rgba
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return `${match[1]}, ${match[2]}, ${match[3]}`;
  }
  return '255, 255, 255';
}

export const NeonText = memo(function NeonText({
  children,
  color = 'blue',
  customColor,
  intensity = 1,
  flicker = false,
  flickerSpeed = 100,
  breathe = false,
  breatheDuration = 2000,
  tube = false,
  tubeWidth = 1,
  fontSize,
  fontWeight = 700,
  fontFamily = "'Inter', sans-serif",
  letterSpacing = '0.05em',
  textTransform = 'uppercase',
  className = '',
  style,
  delay = 0,
  hoverOnly = false,
  animateIn = false,
  animateInDuration = 600,
}: NeonTextProps) {
  const [isVisible, setIsVisible] = useState(!animateIn);
  const [isHovered, setIsHovered] = useState(false);
  const [flickerOpacity, setFlickerOpacity] = useState(1);
  const elementRef = useRef<HTMLSpanElement>(null);

  // Get color values
  const colors = useMemo(() => {
    if (customColor) {
      const rgb = parseColor(customColor);
      return {
        core: rgb,
        mid: rgb,
        outer: rgb,
        text: customColor,
      };
    }
    return COLOR_PRESETS[color];
  }, [color, customColor]);

  // Handle animate in
  useEffect(() => {
    if (!animateIn) return;
    
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [animateIn, delay]);

  // Flicker effect
  useEffect(() => {
    if (!flicker) return;
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let mounted = true;
    
    const runFlicker = () => {
      if (!mounted) return;
      
      // Random flicker pattern mimicking real neon
      const patterns = [
        [1, 0.95, 1],
        [1, 0.9, 0.95, 1],
        [1, 0.85, 1, 0.9, 1],
        [1, 0.92, 1],
        [1], // No flicker this cycle
        [1],
        [1],
      ];
      
      const pattern = patterns[Math.floor(Math.random() * patterns.length)];
      let step = 0;
      
      const animateStep = () => {
        if (!mounted || step >= pattern.length) {
          // Schedule next flicker cycle
          const nextDelay = flickerSpeed * (3 + Math.random() * 10);
          setTimeout(runFlicker, nextDelay);
          return;
        }
        
        setFlickerOpacity(pattern[step]);
        step++;
        setTimeout(animateStep, flickerSpeed);
      };
      
      animateStep();
    };

    const initialDelay = setTimeout(runFlicker, delay + 500 + Math.random() * 1000);
    
    return () => {
      mounted = false;
      clearTimeout(initialDelay);
    };
  }, [flicker, flickerSpeed, delay]);

  // Calculate glow layers with intensity
  const glowLayers = useMemo(() => {
    const i = intensity;
    return [
      // Inner bright core glow
      `0 0 ${5 * i}px rgba(${colors.core}, 0.9)`,
      `0 0 ${10 * i}px rgba(${colors.core}, 0.7)`,
      // Mid glow
      `0 0 ${20 * i}px rgba(${colors.mid}, 0.5)`,
      `0 0 ${30 * i}px rgba(${colors.mid}, 0.3)`,
      // Outer ambient glow
      `0 0 ${50 * i}px rgba(${colors.outer}, 0.2)`,
      `0 0 ${80 * i}px rgba(${colors.outer}, 0.1)`,
    ].join(', ');
  }, [colors, intensity]);

  // Minimal glow for hover-only mode (off state)
  const minimalGlow = useMemo(() => {
    return `0 0 2px rgba(${colors.core}, 0.3)`;
  }, [colors]);

  const shouldGlow = hoverOnly ? isHovered : true;
  const currentGlow = shouldGlow ? glowLayers : minimalGlow;

  // Unique ID for rainbow gradient animation
  const rainbowId = useMemo(() => `neon-rainbow-${Math.random().toString(36).slice(2)}`, []);

  return (
    <>
      <span
        ref={elementRef}
        className={`neon-text ${className} ${color === 'rainbow' ? 'neon-rainbow' : ''}`}
        style={{
          display: 'inline-block',
          color: color === 'rainbow' ? 'transparent' : colors.text,
          fontSize: fontSize ?? 'inherit',
          fontWeight,
          fontFamily,
          letterSpacing,
          textTransform,
          textShadow: currentGlow,
          opacity: animateIn ? (isVisible ? flickerOpacity : 0) : flickerOpacity,
          transform: animateIn ? (isVisible ? 'scale(1)' : 'scale(0.9)') : undefined,
          transition: animateIn 
            ? `opacity ${animateInDuration}ms ease-out, transform ${animateInDuration}ms var(--spring-bouncy, ease-out), text-shadow 0.3s ease`
            : 'text-shadow 0.3s ease, opacity 0.05s ease',
          WebkitTextStroke: tube ? `${tubeWidth}px rgba(${colors.core}, 0.3)` : undefined,
          backgroundImage: color === 'rainbow' 
            ? `linear-gradient(90deg, #ff6b6b, #ffd93d, #6bcb77, #4d96ff, #9b59b6, #ff6b6b)`
            : undefined,
          backgroundSize: color === 'rainbow' ? '200% 100%' : undefined,
          backgroundClip: color === 'rainbow' ? 'text' : undefined,
          WebkitBackgroundClip: color === 'rainbow' ? 'text' : undefined,
          animation: color === 'rainbow' 
            ? 'neon-rainbow-shift 3s linear infinite' 
            : breathe 
              ? `neon-breathe ${breatheDuration}ms ease-in-out infinite`
              : undefined,
          animationDelay: `${delay}ms`,
          willChange: flicker || breathe ? 'text-shadow, opacity' : undefined,
          ...style,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
      </span>

      <style jsx>{`
        @keyframes neon-breathe {
          0%, 100% {
            text-shadow: ${glowLayers};
            opacity: ${flickerOpacity};
          }
          50% {
            text-shadow: ${glowLayers.replace(/0\.\d+\)/g, (match) => {
              const val = parseFloat(match);
              return `${Math.min(1, val * 1.3).toFixed(2)})`;
            })};
            opacity: ${Math.min(1, flickerOpacity * 1.1)};
          }
        }

        @keyframes neon-rainbow-shift {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }

        /* Reduced motion: disable animations */
        @media (prefers-reduced-motion: reduce) {
          .neon-text {
            animation: none !important;
            transition: text-shadow 0.3s ease !important;
          }
        }
      `}</style>
    </>
  );
});

/**
 * NeonBadge - Neon-styled badge/pill component
 */
export interface NeonBadgeProps extends Omit<NeonTextProps, 'children'> {
  children: React.ReactNode;
  /** Padding size */
  size?: 'sm' | 'md' | 'lg';
  /** Show border */
  border?: boolean;
  /** Border glow intensity */
  borderGlow?: number;
  /** Background opacity */
  bgOpacity?: number;
}

export const NeonBadge = memo(function NeonBadge({
  children,
  color = 'blue',
  customColor,
  intensity = 0.8,
  size = 'md',
  border = true,
  borderGlow = 0.5,
  bgOpacity = 0.1,
  flicker,
  breathe,
  className = '',
  style,
  ...props
}: NeonBadgeProps) {
  const colors = useMemo(() => {
    if (customColor) {
      const rgb = parseColor(customColor);
      return { core: rgb, mid: rgb, outer: rgb, text: customColor };
    }
    return COLOR_PRESETS[color];
  }, [color, customColor]);

  const sizeStyles = {
    sm: { padding: '2px 8px', fontSize: '0.7rem' },
    md: { padding: '4px 12px', fontSize: '0.8rem' },
    lg: { padding: '6px 16px', fontSize: '0.9rem' },
  };

  return (
    <span
      className={`neon-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        borderRadius: '9999px',
        background: `rgba(${colors.core}, ${bgOpacity})`,
        border: border ? `1px solid rgba(${colors.core}, 0.4)` : undefined,
        boxShadow: border 
          ? `0 0 ${10 * borderGlow}px rgba(${colors.core}, 0.3), inset 0 0 ${15 * borderGlow}px rgba(${colors.core}, 0.1)`
          : undefined,
        ...sizeStyles[size],
        ...style,
      }}
    >
      <NeonText
        color={color}
        customColor={customColor}
        intensity={intensity}
        flicker={flicker}
        breathe={breathe}
        textTransform="uppercase"
        letterSpacing="0.08em"
        fontWeight={600}
        fontSize={sizeStyles[size].fontSize}
        {...props}
      >
        {children}
      </NeonText>
    </span>
  );
});

/**
 * NeonSign - Full neon sign with optional mounting bracket aesthetic
 */
export interface NeonSignProps extends NeonTextProps {
  /** Show decorative mounting brackets */
  showBrackets?: boolean;
  /** Bracket color */
  bracketColor?: string;
}

export const NeonSign = memo(function NeonSign({
  children,
  showBrackets = false,
  bracketColor = 'rgba(255, 255, 255, 0.2)',
  className = '',
  style,
  ...props
}: NeonSignProps) {
  return (
    <span
      className={`neon-sign ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        ...style,
      }}
    >
      {showBrackets && (
        <span
          className="neon-bracket"
          style={{
            display: 'inline-block',
            width: '3px',
            height: '1.2em',
            background: bracketColor,
            borderRadius: '2px',
            marginRight: '4px',
          }}
        />
      )}
      <NeonText {...props}>{children}</NeonText>
      {showBrackets && (
        <span
          className="neon-bracket"
          style={{
            display: 'inline-block',
            width: '3px',
            height: '1.2em',
            background: bracketColor,
            borderRadius: '2px',
            marginLeft: '4px',
          }}
        />
      )}
    </span>
  );
});

/**
 * NeonNumber - Optimized for displaying numbers with neon effect
 */
export interface NeonNumberProps extends Omit<NeonTextProps, 'children'> {
  value: number;
  /** Number of decimal places */
  decimals?: number;
  /** Show + sign for positive numbers */
  showSign?: boolean;
  /** Suffix (e.g., '%', 'x') */
  suffix?: string;
  /** Prefix (e.g., '$') */
  prefix?: string;
}

export const NeonNumber = memo(function NeonNumber({
  value,
  decimals = 1,
  showSign = false,
  suffix = '',
  prefix = '',
  ...props
}: NeonNumberProps) {
  const formattedValue = useMemo(() => {
    const sign = showSign && value > 0 ? '+' : '';
    return `${prefix}${sign}${value.toFixed(decimals)}${suffix}`;
  }, [value, decimals, showSign, prefix, suffix]);

  return (
    <NeonText 
      fontFamily="'JetBrains Mono', 'SF Mono', monospace"
      {...props}
    >
      {formattedValue}
    </NeonText>
  );
});

/**
 * Convenience presets
 */
export const NeonLive = memo(function NeonLive(props: Omit<NeonTextProps, 'color' | 'flicker'>) {
  return <NeonText color="red" flicker intensity={1.1} {...props}>LIVE</NeonText>;
});

export const NeonBeat = memo(function NeonBeat({ value, ...props }: { value: number } & Omit<NeonNumberProps, 'value' | 'color'>) {
  return <NeonNumber color="green" value={value} showSign suffix="%" breathe intensity={1.1} {...props} />;
});

export const NeonMiss = memo(function NeonMiss({ value, ...props }: { value: number } & Omit<NeonNumberProps, 'value' | 'color'>) {
  return <NeonNumber color="red" value={value} showSign suffix="%" intensity={0.9} {...props} />;
});

export const NeonPending = memo(function NeonPending(props: Omit<NeonTextProps, 'color'>) {
  return <NeonText color="amber" breathe breatheDuration={3000} intensity={0.8} {...props}>PENDING</NeonText>;
});

export default NeonText;
