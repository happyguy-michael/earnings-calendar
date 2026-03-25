'use client';

import { memo, ReactNode, CSSProperties, useRef, useEffect, useState, ElementType } from 'react';

/**
 * AuroraText - Animated Aurora Borealis Text Effect
 * 
 * Creates mesmerizing northern-lights style color shifts within text,
 * with multiple overlapping gradient waves that move organically.
 * 
 * Inspiration:
 * - Northern lights (aurora borealis) with their ethereal color bands
 * - Apple's visionOS ambient lighting effects
 * - 2026 "Living Interfaces" trend — UI that feels alive
 * - Vercel's gradient text but with organic motion
 * - Stripe's premium headline treatments
 * 
 * Key differentiators from other text effects:
 * - Unlike FluidGradientText: Multiple independent waves, not a single gradient
 * - Unlike NeonText: Color flows through text, not glowing outward
 * - Unlike ShimmerText: Organic, non-linear movement patterns
 * - Unlike WaveText: Colors shift, not character positions
 * 
 * Technical approach:
 * - Uses background-clip: text with multiple gradient layers
 * - Each gradient layer animates at different speeds using irrational ratios
 * - Creates non-repeating organic patterns (like bioluminescence)
 * - GPU-accelerated via transform and opacity
 * 
 * @example
 * // Basic aurora text
 * <AuroraText>Premium Experience</AuroraText>
 * 
 * // Polar preset with slow animation
 * <AuroraText preset="polar" speed={0.5}>Arctic Glow</AuroraText>
 * 
 * // Custom colors
 * <AuroraText colors={['#ff0080', '#7928ca', '#0070f3']}>Brand</AuroraText>
 */

export type AuroraPreset = 'polar' | 'tropical' | 'cosmic' | 'sunset' | 'ocean' | 'emerald';

interface AuroraTextProps {
  children: ReactNode;
  /** Color preset (default: 'polar') */
  preset?: AuroraPreset;
  /** Custom colors array (overrides preset) */
  colors?: string[];
  /** Animation speed multiplier (default: 1) */
  speed?: number;
  /** Intensity of color shifts 0-1 (default: 0.8) */
  intensity?: number;
  /** Enable subtle glow behind text (default: false) */
  glow?: boolean;
  /** Glow blur radius in pixels (default: 20) */
  glowRadius?: number;
  /** Tag to render as (default: 'span') */
  as?: ElementType;
  /** Additional className */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Pause animation on hover (default: false) */
  pauseOnHover?: boolean;
  /** Start animation on mount vs viewport intersection (default: 'mount') */
  trigger?: 'mount' | 'viewport';
}

// Aurora color presets inspired by real aurora phenomena
const PRESETS: Record<AuroraPreset, string[]> = {
  // Classic northern lights - green/cyan dominant with purple hints
  polar: ['#22c55e', '#06b6d4', '#8b5cf6', '#22c55e', '#14b8a6', '#a855f7'],
  // Tropical aurora (rare) - pink/orange/cyan
  tropical: ['#ec4899', '#f97316', '#06b6d4', '#ec4899', '#fbbf24', '#8b5cf6'],
  // Deep space/cosmic - purple/blue/magenta
  cosmic: ['#8b5cf6', '#3b82f6', '#ec4899', '#6366f1', '#a855f7', '#0ea5e9'],
  // Golden hour aurora - warm tones
  sunset: ['#f97316', '#ec4899', '#fbbf24', '#ef4444', '#f97316', '#a855f7'],
  // Deep sea aurora (bioluminescence-inspired)
  ocean: ['#0ea5e9', '#14b8a6', '#6366f1', '#06b6d4', '#0ea5e9', '#8b5cf6'],
  // Forest aurora - emerald dominant
  emerald: ['#22c55e', '#10b981', '#14b8a6', '#22c55e', '#059669', '#06b6d4'],
};

// Irrational multipliers for organic, non-repeating animation
const PHI = 1.618033988749895; // Golden ratio
const SQRT5 = 2.2360679774997896;
const SQRT2 = 1.4142135623730951;

export const AuroraText = memo(function AuroraText({
  children,
  preset = 'polar',
  colors: customColors,
  speed = 1,
  intensity = 0.8,
  glow = false,
  glowRadius = 20,
  as: Component = 'span',
  className = '',
  style,
  pauseOnHover = false,
  trigger = 'mount',
}: AuroraTextProps) {
  const elementRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(trigger === 'mount');
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Intersection observer for viewport trigger
  useEffect(() => {
    if (trigger !== 'viewport' || !elementRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );
    
    observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [trigger]);

  const colors = customColors || PRESETS[preset];
  
  // Calculate base duration (slower = more organic feel)
  const baseDuration = 8 / speed;
  
  // Build multiple gradient layers with different animations
  // Each layer moves at a slightly different speed for organic feel
  const gradientLayers = colors.map((color, i) => {
    const offset = (i / colors.length) * 100;
    return color;
  }).join(', ');

  // CSS custom properties for animation
  const cssVars: Record<string, string | number> = {
    '--aurora-duration-1': `${baseDuration}s`,
    '--aurora-duration-2': `${baseDuration * PHI}s`,
    '--aurora-duration-3': `${baseDuration * SQRT2}s`,
    '--aurora-intensity': intensity,
    '--aurora-glow-radius': `${glowRadius}px`,
    '--aurora-color-1': colors[0],
    '--aurora-color-2': colors[1] || colors[0],
    '--aurora-color-3': colors[2] || colors[1] || colors[0],
    '--aurora-color-4': colors[3] || colors[0],
    '--aurora-color-5': colors[4] || colors[1] || colors[0],
    '--aurora-color-6': colors[5] || colors[2] || colors[0],
  };

  // If reduced motion, just show static gradient
  if (prefersReducedMotion) {
    return (
      <Component
        ref={elementRef}
        className={`aurora-text aurora-text--static ${className}`}
        style={{
          ...style,
          backgroundImage: `linear-gradient(90deg, ${colors.join(', ')})`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}
      >
        {children}
      </Component>
    );
  }

  return (
    <>
      <Component
        ref={elementRef}
        className={`aurora-text ${isVisible ? 'aurora-text--active' : ''} ${isPaused ? 'aurora-text--paused' : ''} ${className}`}
        style={{
          ...style,
          ...cssVars,
        } as CSSProperties}
        onMouseEnter={pauseOnHover ? () => setIsPaused(true) : undefined}
        onMouseLeave={pauseOnHover ? () => setIsPaused(false) : undefined}
      >
        {/* Glow layer (optional) */}
        {glow && (
          <span className="aurora-text__glow" aria-hidden="true">
            {children}
          </span>
        )}
        {/* Main text with aurora effect */}
        <span className="aurora-text__content">
          {children}
        </span>
      </Component>
      
      <style jsx>{`
        .aurora-text {
          position: relative;
          display: inline-block;
        }
        
        .aurora-text__content {
          position: relative;
          z-index: 1;
          
          /* Multiple gradient layers for aurora effect */
          background: 
            /* Layer 1: Primary wave - horizontal flow */
            linear-gradient(
              90deg,
              var(--aurora-color-1) 0%,
              var(--aurora-color-2) 25%,
              var(--aurora-color-3) 50%,
              var(--aurora-color-2) 75%,
              var(--aurora-color-1) 100%
            ),
            /* Layer 2: Secondary wave - diagonal flow */
            linear-gradient(
              135deg,
              var(--aurora-color-4) 0%,
              transparent 40%,
              var(--aurora-color-5) 60%,
              transparent 100%
            ),
            /* Layer 3: Accent wave - reverse diagonal */
            linear-gradient(
              -45deg,
              transparent 0%,
              var(--aurora-color-6) 30%,
              transparent 60%,
              var(--aurora-color-4) 100%
            );
          
          background-size: 
            200% 100%,
            300% 300%,
            250% 250%;
          
          background-position:
            0% 50%,
            0% 0%,
            100% 100%;
          
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          
          /* Blend layers for aurora effect */
          background-blend-mode: overlay, color-dodge, soft-light;
        }
        
        .aurora-text--active .aurora-text__content {
          animation: 
            aurora-wave-1 var(--aurora-duration-1) ease-in-out infinite,
            aurora-wave-2 var(--aurora-duration-2) ease-in-out infinite,
            aurora-wave-3 var(--aurora-duration-3) ease-in-out infinite;
        }
        
        .aurora-text--paused .aurora-text__content {
          animation-play-state: paused;
        }
        
        /* Glow effect layer */
        .aurora-text__glow {
          position: absolute;
          inset: 0;
          z-index: 0;
          
          background: 
            linear-gradient(
              90deg,
              var(--aurora-color-1) 0%,
              var(--aurora-color-2) 50%,
              var(--aurora-color-1) 100%
            );
          
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          
          filter: blur(var(--aurora-glow-radius));
          opacity: calc(var(--aurora-intensity) * 0.5);
          
          animation: aurora-glow var(--aurora-duration-2) ease-in-out infinite;
        }
        
        .aurora-text--paused .aurora-text__glow {
          animation-play-state: paused;
        }
        
        /* Keyframe animations - each at different phase for organic feel */
        @keyframes aurora-wave-1 {
          0%, 100% {
            background-position: 0% 50%, 0% 0%, 100% 100%;
          }
          25% {
            background-position: 50% 50%, 50% 50%, 50% 50%;
          }
          50% {
            background-position: 100% 50%, 100% 100%, 0% 0%;
          }
          75% {
            background-position: 50% 50%, 50% 50%, 50% 50%;
          }
        }
        
        @keyframes aurora-wave-2 {
          0%, 100% {
            filter: hue-rotate(0deg) saturate(1);
          }
          33% {
            filter: hue-rotate(15deg) saturate(1.1);
          }
          66% {
            filter: hue-rotate(-15deg) saturate(1.2);
          }
        }
        
        @keyframes aurora-wave-3 {
          0%, 100% {
            opacity: var(--aurora-intensity);
          }
          50% {
            opacity: calc(var(--aurora-intensity) * 0.85);
          }
        }
        
        @keyframes aurora-glow {
          0%, 100% {
            background-position: 0% 50%;
            opacity: calc(var(--aurora-intensity) * 0.4);
          }
          50% {
            background-position: 100% 50%;
            opacity: calc(var(--aurora-intensity) * 0.6);
          }
        }
        
        /* Print styles */
        @media print {
          .aurora-text__content {
            animation: none !important;
            background: linear-gradient(90deg, var(--aurora-color-1), var(--aurora-color-2));
            -webkit-background-clip: text;
            background-clip: text;
          }
          .aurora-text__glow {
            display: none;
          }
        }
      `}</style>
    </>
  );
});

/**
 * AuroraHeading - Pre-configured aurora text for headings
 */
export const AuroraHeading = memo(function AuroraHeading({
  level = 2,
  children,
  ...props
}: Omit<AuroraTextProps, 'as'> & { level?: 1 | 2 | 3 | 4 | 5 | 6 }) {
  const Tag = `h${level}` as ElementType;
  return (
    <AuroraText as={Tag} {...props}>
      {children}
    </AuroraText>
  );
});

/**
 * AuroraBadge - Aurora text effect for badge/label elements
 */
export const AuroraBadge = memo(function AuroraBadge({
  children,
  preset = 'cosmic',
  className = '',
  ...props
}: Omit<AuroraTextProps, 'glow'>) {
  return (
    <AuroraText
      preset={preset}
      glow={true}
      glowRadius={12}
      speed={0.8}
      className={`aurora-badge ${className}`}
      {...props}
    >
      {children}
      <style jsx>{`
        :global(.aurora-badge) {
          font-weight: 600;
          letter-spacing: 0.02em;
        }
      `}</style>
    </AuroraText>
  );
});

/**
 * AuroraLink - Aurora text effect for links with hover intensification
 */
export const AuroraLink = memo(function AuroraLink({
  href,
  children,
  preset = 'polar',
  className = '',
  ...props
}: Omit<AuroraTextProps, 'as'> & { href: string }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <a
      href={href}
      className={`aurora-link ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AuroraText
        preset={preset}
        speed={isHovered ? 2 : 1}
        intensity={isHovered ? 1 : 0.7}
        glow={isHovered}
        glowRadius={16}
        {...props}
      >
        {children}
      </AuroraText>
      <style jsx>{`
        .aurora-link {
          text-decoration: none;
          transition: transform 0.2s ease;
        }
        .aurora-link:hover {
          transform: translateY(-1px);
        }
        .aurora-link:focus-visible {
          outline: 2px solid currentColor;
          outline-offset: 4px;
          border-radius: 2px;
        }
      `}</style>
    </a>
  );
});

export default AuroraText;
