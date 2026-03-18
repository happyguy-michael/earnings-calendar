'use client';

import { ReactNode, CSSProperties, memo, useRef, useEffect, useState, useMemo } from 'react';

/**
 * AuraGlow - Atmospheric Ambient Glow Effect
 * 
 * Creates a soft, breathing aura around elements that subtly communicates
 * status through atmospheric lighting. Instead of explicit badges or icons,
 * the aura provides ambient feedback through color and intensity.
 * 
 * Inspiration:
 * - 2026 "Ambient UI" trend — interfaces that feel alive through subtle atmosphere
 * - Apple visionOS spatial computing glow effects
 * - Gaming health/mana bars with ambient glow
 * - Aurora borealis natural light phenomena
 * - Spotify's color extraction for album art backgrounds
 * 
 * Features:
 * - Smooth breathing animation with configurable rhythm
 * - Multiple glow layers for depth (core, mid, outer)
 * - Color variants for beat/miss/pending/live states
 * - Intensity levels from subtle to dramatic
 * - Cursor-reactive glow intensification on hover
 * - GPU-accelerated via CSS transforms and opacity
 * - Full prefers-reduced-motion support
 * - Light/dark mode aware colors
 * 
 * @example
 * // Basic success aura
 * <AuraGlow variant="beat">
 *   <EarningsCard />
 * </AuraGlow>
 * 
 * // Intense live indicator
 * <AuraGlow variant="live" intensity="intense" pulse>
 *   <LiveBadge />
 * </AuraGlow>
 * 
 * // Subtle pending state
 * <AuraGlow variant="pending" intensity="subtle">
 *   <PendingCard />
 * </AuraGlow>
 */

export type AuraVariant = 'beat' | 'miss' | 'pending' | 'live' | 'neutral' | 'exceptional' | 'disaster';
export type AuraIntensity = 'subtle' | 'normal' | 'vivid' | 'intense';

interface AuraGlowProps {
  children: ReactNode;
  /** Color variant based on status */
  variant?: AuraVariant;
  /** Glow intensity level */
  intensity?: AuraIntensity;
  /** Enable breathing/pulsing animation */
  pulse?: boolean;
  /** Breathing cycle duration in ms */
  pulseDuration?: number;
  /** Enable glow intensification on hover */
  hoverReactive?: boolean;
  /** Hover intensity multiplier (1-2) */
  hoverMultiplier?: number;
  /** Outer glow blur radius in px */
  blurRadius?: number;
  /** Spread radius in px */
  spreadRadius?: number;
  /** Animation delay in ms */
  delay?: number;
  /** Enable entrance animation */
  animateIn?: boolean;
  /** Custom color (overrides variant) */
  color?: string;
  /** Additional class names */
  className?: string;
  /** Inline styles for container */
  style?: CSSProperties;
  /** Enable only on viewport intersection */
  lazyLoad?: boolean;
}

// Color palettes by variant - tuned for dark mode visibility and light mode subtlety
const variantPalettes: Record<AuraVariant, { 
  dark: { core: string; mid: string; outer: string };
  light: { core: string; mid: string; outer: string };
}> = {
  beat: {
    dark: {
      core: 'rgba(74, 222, 128, 0.6)',    // emerald-400
      mid: 'rgba(34, 197, 94, 0.3)',      // green-500
      outer: 'rgba(22, 163, 74, 0.15)',   // green-600
    },
    light: {
      core: 'rgba(34, 197, 94, 0.4)',
      mid: 'rgba(22, 163, 74, 0.2)',
      outer: 'rgba(21, 128, 61, 0.1)',
    },
  },
  miss: {
    dark: {
      core: 'rgba(248, 113, 113, 0.6)',   // red-400
      mid: 'rgba(239, 68, 68, 0.3)',      // red-500
      outer: 'rgba(220, 38, 38, 0.15)',   // red-600
    },
    light: {
      core: 'rgba(239, 68, 68, 0.4)',
      mid: 'rgba(220, 38, 38, 0.2)',
      outer: 'rgba(185, 28, 28, 0.1)',
    },
  },
  pending: {
    dark: {
      core: 'rgba(251, 191, 36, 0.5)',    // amber-400
      mid: 'rgba(245, 158, 11, 0.25)',    // amber-500
      outer: 'rgba(217, 119, 6, 0.12)',   // amber-600
    },
    light: {
      core: 'rgba(245, 158, 11, 0.35)',
      mid: 'rgba(217, 119, 6, 0.18)',
      outer: 'rgba(180, 83, 9, 0.08)',
    },
  },
  live: {
    dark: {
      core: 'rgba(239, 68, 68, 0.7)',     // red-500 (live indicator red)
      mid: 'rgba(220, 38, 38, 0.4)',      // red-600
      outer: 'rgba(185, 28, 28, 0.2)',    // red-700
    },
    light: {
      core: 'rgba(220, 38, 38, 0.5)',
      mid: 'rgba(185, 28, 28, 0.25)',
      outer: 'rgba(153, 27, 27, 0.12)',
    },
  },
  neutral: {
    dark: {
      core: 'rgba(161, 161, 170, 0.4)',   // zinc-400
      mid: 'rgba(113, 113, 122, 0.2)',    // zinc-500
      outer: 'rgba(82, 82, 91, 0.1)',     // zinc-600
    },
    light: {
      core: 'rgba(113, 113, 122, 0.3)',
      mid: 'rgba(82, 82, 91, 0.15)',
      outer: 'rgba(63, 63, 70, 0.07)',
    },
  },
  exceptional: {
    dark: {
      core: 'rgba(250, 204, 21, 0.7)',    // yellow-400 (gold)
      mid: 'rgba(234, 179, 8, 0.4)',      // yellow-500
      outer: 'rgba(202, 138, 4, 0.2)',    // yellow-600
    },
    light: {
      core: 'rgba(234, 179, 8, 0.5)',
      mid: 'rgba(202, 138, 4, 0.25)',
      outer: 'rgba(161, 98, 7, 0.12)',
    },
  },
  disaster: {
    dark: {
      core: 'rgba(239, 68, 68, 0.8)',     // intense red
      mid: 'rgba(185, 28, 28, 0.5)',      
      outer: 'rgba(127, 29, 29, 0.25)',   
    },
    light: {
      core: 'rgba(185, 28, 28, 0.6)',
      mid: 'rgba(153, 27, 27, 0.35)',
      outer: 'rgba(127, 29, 29, 0.18)',
    },
  },
};

// Intensity multipliers for blur and spread
const intensityConfig: Record<AuraIntensity, { blur: number; spread: number; opacity: number }> = {
  subtle: { blur: 0.6, spread: 0.5, opacity: 0.6 },
  normal: { blur: 1, spread: 1, opacity: 1 },
  vivid: { blur: 1.3, spread: 1.2, opacity: 1.2 },
  intense: { blur: 1.6, spread: 1.5, opacity: 1.4 },
};

export const AuraGlow = memo(function AuraGlow({
  children,
  variant = 'neutral',
  intensity = 'normal',
  pulse = true,
  pulseDuration = 3000,
  hoverReactive = true,
  hoverMultiplier = 1.4,
  blurRadius = 24,
  spreadRadius = 8,
  delay = 0,
  animateIn = true,
  color,
  className = '',
  style,
  lazyLoad = true,
}: AuraGlowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(!lazyLoad);
  const [isHovered, setIsHovered] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Detect dark mode
  useEffect(() => {
    setMounted(true);
    const html = document.documentElement;
    setIsDarkMode(!html.classList.contains('light'));

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(!html.classList.contains('light'));
        }
      });
    });

    observer.observe(html, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Intersection observer for lazy loading
  useEffect(() => {
    if (!lazyLoad || !containerRef.current) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [lazyLoad]);

  // Get colors based on variant and theme
  const colors = useMemo(() => {
    if (color) {
      // Custom color - derive layers from it
      return {
        core: color,
        mid: color.replace(/[\d.]+\)$/, '0.3)'),
        outer: color.replace(/[\d.]+\)$/, '0.15)'),
      };
    }
    
    const palette = variantPalettes[variant];
    return isDarkMode ? palette.dark : palette.light;
  }, [variant, isDarkMode, color]);

  // Calculate intensity-adjusted values
  const config = intensityConfig[intensity];
  const effectiveBlur = blurRadius * config.blur;
  const effectiveSpread = spreadRadius * config.spread;
  const effectiveOpacity = config.opacity * (isHovered && hoverReactive ? hoverMultiplier : 1);

  // Don't render effects until mounted (avoid hydration mismatch)
  if (!mounted) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  // Reduced motion - static subtle glow only
  if (prefersReducedMotion) {
    return (
      <div
        ref={containerRef}
        className={`aura-glow aura-glow--reduced ${className}`}
        style={{
          position: 'relative',
          ...style,
        }}
      >
        <div
          className="aura-glow__static"
          style={{
            position: 'absolute',
            inset: -effectiveSpread,
            borderRadius: 'inherit',
            background: `radial-gradient(ellipse at center, ${colors.mid} 0%, transparent 70%)`,
            opacity: 0.5,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
      </div>
    );
  }

  const glowId = useMemo(() => `aura-${Math.random().toString(36).slice(2, 9)}`, []);

  return (
    <div
      ref={containerRef}
      className={`aura-glow aura-glow--${variant} ${className}`}
      style={{
        position: 'relative',
        ...style,
      }}
      onMouseEnter={() => hoverReactive && setIsHovered(true)}
      onMouseLeave={() => hoverReactive && setIsHovered(false)}
    >
      {/* Outer glow layer - largest, most diffuse */}
      <div
        className="aura-glow__outer"
        style={{
          position: 'absolute',
          inset: -effectiveSpread * 2,
          borderRadius: 'inherit',
          background: `radial-gradient(ellipse at center, ${colors.outer} 0%, transparent 70%)`,
          filter: `blur(${effectiveBlur * 1.5}px)`,
          opacity: isVisible ? effectiveOpacity * 0.8 : 0,
          transition: `opacity 600ms ease-out ${delay}ms`,
          animation: pulse && isVisible ? `aura-breathe-outer ${pulseDuration}ms ease-in-out infinite` : 'none',
          animationDelay: `${delay}ms`,
          pointerEvents: 'none',
          zIndex: 0,
          willChange: 'opacity, transform',
        }}
      />

      {/* Mid glow layer - medium intensity */}
      <div
        className="aura-glow__mid"
        style={{
          position: 'absolute',
          inset: -effectiveSpread * 1.2,
          borderRadius: 'inherit',
          background: `radial-gradient(ellipse at center, ${colors.mid} 0%, transparent 65%)`,
          filter: `blur(${effectiveBlur}px)`,
          opacity: isVisible ? effectiveOpacity * 0.9 : 0,
          transition: `opacity 500ms ease-out ${delay + 100}ms`,
          animation: pulse && isVisible ? `aura-breathe-mid ${pulseDuration}ms ease-in-out infinite` : 'none',
          animationDelay: `${delay + pulseDuration * 0.1}ms`,
          pointerEvents: 'none',
          zIndex: 0,
          willChange: 'opacity, transform',
        }}
      />

      {/* Core glow layer - tightest, most saturated */}
      <div
        className="aura-glow__core"
        style={{
          position: 'absolute',
          inset: -effectiveSpread * 0.5,
          borderRadius: 'inherit',
          background: `radial-gradient(ellipse at center, ${colors.core} 0%, transparent 55%)`,
          filter: `blur(${effectiveBlur * 0.6}px)`,
          opacity: isVisible ? effectiveOpacity : 0,
          transition: `opacity 400ms ease-out ${delay + 200}ms`,
          animation: pulse && isVisible ? `aura-breathe-core ${pulseDuration}ms ease-in-out infinite` : 'none',
          animationDelay: `${delay + pulseDuration * 0.2}ms`,
          pointerEvents: 'none',
          zIndex: 0,
          willChange: 'opacity, transform',
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>

      <style jsx>{`
        @keyframes aura-breathe-outer {
          0%, 100% {
            opacity: ${effectiveOpacity * 0.6};
            transform: scale(1);
          }
          50% {
            opacity: ${effectiveOpacity * 0.9};
            transform: scale(1.05);
          }
        }

        @keyframes aura-breathe-mid {
          0%, 100% {
            opacity: ${effectiveOpacity * 0.7};
            transform: scale(1);
          }
          50% {
            opacity: ${effectiveOpacity};
            transform: scale(1.03);
          }
        }

        @keyframes aura-breathe-core {
          0%, 100% {
            opacity: ${effectiveOpacity * 0.8};
            transform: scale(1);
          }
          50% {
            opacity: ${effectiveOpacity * 1.1};
            transform: scale(1.02);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .aura-glow__outer,
          .aura-glow__mid,
          .aura-glow__core {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
});

/**
 * AuraGlowCard - Pre-styled card wrapper with aura effect
 */
export function AuraGlowCard({
  children,
  variant = 'neutral',
  intensity = 'subtle',
  className = '',
  ...props
}: AuraGlowProps & { children: ReactNode }) {
  return (
    <AuraGlow
      variant={variant}
      intensity={intensity}
      className={`aura-card ${className}`}
      {...props}
    >
      <div
        className="aura-card__content"
        style={{
          background: 'var(--card-bg, rgba(255, 255, 255, 0.03))',
          borderRadius: '12px',
          border: '1px solid var(--card-border, rgba(255, 255, 255, 0.06))',
          padding: '16px',
        }}
      >
        {children}
      </div>
    </AuraGlow>
  );
}

/**
 * useAuraVariant - Hook to determine aura variant from earnings data
 */
export function useAuraVariant(
  result?: 'beat' | 'miss' | null,
  surprisePercent?: number,
  isLive?: boolean,
  isPending?: boolean
): AuraVariant {
  if (isLive) return 'live';
  if (isPending || result === null || result === undefined) return 'pending';
  
  if (result === 'beat') {
    // Exceptional beat: > 20% surprise
    if (surprisePercent && surprisePercent > 20) return 'exceptional';
    return 'beat';
  }
  
  if (result === 'miss') {
    // Disaster miss: > 20% negative surprise
    if (surprisePercent && surprisePercent < -20) return 'disaster';
    return 'miss';
  }
  
  return 'neutral';
}
