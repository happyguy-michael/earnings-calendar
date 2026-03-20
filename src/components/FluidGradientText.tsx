'use client';

import { useEffect, useRef, useState, memo, ReactNode, CSSProperties } from 'react';

/**
 * FluidGradientText - Premium Animated Liquid Gradient Text Effect
 * 
 * Creates a continuously flowing, animated gradient that moves through text
 * like liquid metal, evoking the Y3K/liquid metal aesthetic trending in 2026.
 * 
 * Inspiration:
 * - Linear.app's flowing gradient headlines
 * - Apple's liquid metal product renders
 * - 2026 Y3K "chrome" and "liquid metal" design trend
 * - Figma's 2026 Web Design Trends: "kinetic lettering"
 * - The fluidity of mercury/liquid metal
 * 
 * Features:
 * - Smooth, continuous gradient animation (not choppy)
 * - Multiple preset color schemes (aurora, sunset, ocean, chrome, custom)
 * - Configurable animation speed and direction
 * - Hover pause/acceleration options
 * - Scroll-linked animation option
 * - GPU-accelerated via CSS background-position
 * - Full prefers-reduced-motion support
 * - Works with any text content
 * 
 * Technical approach:
 * - Uses a wide gradient (400% width) that animates position
 * - CSS background-clip: text for the gradient-text effect
 * - RAF-based animation for smooth, jank-free motion
 * - Optional noise/grain overlay for texture
 * 
 * @example
 * // Basic usage with aurora preset
 * <FluidGradientText preset="aurora">Earnings Calendar</FluidGradientText>
 * 
 * // Custom colors with slower animation
 * <FluidGradientText 
 *   colors={['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24']}
 *   speed={0.3}
 * >
 *   Premium Title
 * </FluidGradientText>
 * 
 * // Chrome/liquid metal effect
 * <FluidGradientText preset="chrome" shimmer>
 *   Liquid Metal
 * </FluidGradientText>
 */

type GradientPreset = 'aurora' | 'sunset' | 'ocean' | 'chrome' | 'neon' | 'lavender' | 'fire' | 'mint';

interface FluidGradientTextProps {
  children: ReactNode;
  /** Preset gradient theme */
  preset?: GradientPreset;
  /** Custom gradient colors (overrides preset) */
  colors?: string[];
  /** Animation speed multiplier (default: 1) */
  speed?: number;
  /** Animation direction */
  direction?: 'horizontal' | 'vertical' | 'diagonal';
  /** Pause animation on hover */
  pauseOnHover?: boolean;
  /** Accelerate animation on hover (speed multiplier) */
  hoverSpeed?: number;
  /** Add subtle shimmer/sparkle overlay */
  shimmer?: boolean;
  /** Shimmer intensity (0-1) */
  shimmerIntensity?: number;
  /** Add subtle grain texture */
  grain?: boolean;
  /** Link animation to scroll position */
  scrollLinked?: boolean;
  /** Reverse animation direction */
  reverse?: boolean;
  /** Additional className */
  className?: string;
  /** Additional inline styles */
  style?: CSSProperties;
  /** Render as different element */
  as?: 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
}

// Preset color schemes
const PRESETS: Record<GradientPreset, string[]> = {
  aurora: ['#a855f7', '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#a855f7'],
  sunset: ['#f97316', '#fb923c', '#f59e0b', '#eab308', '#ef4444', '#f97316'],
  ocean: ['#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#3b82f6', '#0ea5e9'],
  chrome: ['#e2e8f0', '#94a3b8', '#cbd5e1', '#f1f5f9', '#94a3b8', '#e2e8f0'],
  neon: ['#f0abfc', '#c084fc', '#a78bfa', '#818cf8', '#c084fc', '#f0abfc'],
  lavender: ['#c4b5fd', '#a78bfa', '#8b5cf6', '#7c3aed', '#a78bfa', '#c4b5fd'],
  fire: ['#fbbf24', '#f59e0b', '#f97316', '#ef4444', '#f97316', '#fbbf24'],
  mint: ['#34d399', '#10b981', '#059669', '#047857', '#10b981', '#34d399'],
};

// Generate gradient CSS from colors
function generateGradient(colors: string[], direction: 'horizontal' | 'vertical' | 'diagonal'): string {
  const angle = direction === 'horizontal' ? '90deg' : direction === 'vertical' ? '180deg' : '135deg';
  // Create a seamless looping gradient by repeating colors
  const gradientColors = colors.map((color, i) => {
    const percent = (i / (colors.length - 1)) * 100;
    return `${color} ${percent}%`;
  }).join(', ');
  
  return `linear-gradient(${angle}, ${gradientColors})`;
}

export const FluidGradientText = memo(function FluidGradientText({
  children,
  preset = 'aurora',
  colors,
  speed = 1,
  direction = 'horizontal',
  pauseOnHover = false,
  hoverSpeed,
  shimmer = false,
  shimmerIntensity = 0.3,
  grain = false,
  scrollLinked = false,
  reverse = false,
  className = '',
  style = {},
  as: Component = 'span',
}: FluidGradientTextProps) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const [position, setPosition] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  
  // Get colors from preset or custom
  const gradientColors = colors || PRESETS[preset];
  const gradient = generateGradient(gradientColors, direction);
  
  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  
  // Animation loop
  useEffect(() => {
    if (prefersReducedMotion || scrollLinked) return;
    
    const baseSpeed = 0.015; // Base pixels per ms
    const actualSpeed = baseSpeed * speed * (isHovered && hoverSpeed ? hoverSpeed : 1);
    const isPaused = pauseOnHover && isHovered;
    
    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      
      if (!isPaused) {
        setPosition(prev => {
          const increment = delta * actualSpeed * (reverse ? -1 : 1);
          const newPos = prev + increment;
          // Loop at 100% (one full gradient cycle)
          return newPos % 100;
        });
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [speed, isHovered, hoverSpeed, pauseOnHover, prefersReducedMotion, scrollLinked, reverse]);
  
  // Scroll-linked animation
  useEffect(() => {
    if (!scrollLinked || prefersReducedMotion) return;
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = (scrollY / maxScroll) * 100 * speed;
      setPosition(reverse ? 100 - (scrollProgress % 100) : scrollProgress % 100);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial position
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollLinked, speed, reverse, prefersReducedMotion]);
  
  // Static gradient for reduced motion
  if (prefersReducedMotion) {
    return (
      <Component
        className={`fluid-gradient-text fluid-gradient-text-static ${className}`}
        style={{
          background: gradient,
          backgroundSize: '100% 100%',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          ...style,
        }}
      >
        {children}
      </Component>
    );
  }
  
  // Calculate background position based on direction
  const getBackgroundPosition = (): string => {
    switch (direction) {
      case 'horizontal': return `${position}% 50%`;
      case 'vertical': return `50% ${position}%`;
      case 'diagonal': return `${position}% ${position}%`;
      default: return `${position}% 50%`;
    }
  };
  
  return (
    <Component
      ref={elementRef as any}
      className={`fluid-gradient-text ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        display: 'inline-block',
        background: gradient,
        backgroundSize: '400% 400%',
        backgroundPosition: getBackgroundPosition(),
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        willChange: 'background-position',
        ...style,
      }}
    >
      {children}
      
      {/* Shimmer overlay */}
      {shimmer && (
        <span
          className="fluid-gradient-shimmer"
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(
              110deg,
              transparent 25%,
              rgba(255, 255, 255, ${shimmerIntensity}) 50%,
              transparent 75%
            )`,
            backgroundSize: '200% 100%',
            animation: 'fluid-shimmer 3s ease-in-out infinite',
            mixBlendMode: 'overlay',
            pointerEvents: 'none',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
          }}
          aria-hidden="true"
        />
      )}
      
      {/* Grain texture overlay */}
      {grain && (
        <span
          className="fluid-gradient-grain"
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.15,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            pointerEvents: 'none',
            mixBlendMode: 'overlay',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
          }}
          aria-hidden="true"
        />
      )}
      
      <style jsx>{`
        @keyframes fluid-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        
        .fluid-gradient-text {
          /* Prevent layout shift */
          line-height: inherit;
        }
        
        /* Ensure proper clipping in Safari */
        .fluid-gradient-text::selection {
          background: rgba(99, 102, 241, 0.3);
          -webkit-text-fill-color: white;
        }
      `}</style>
    </Component>
  );
});

/**
 * FluidGradientHeadline - Convenience wrapper for headlines
 */
interface FluidGradientHeadlineProps extends Omit<FluidGradientTextProps, 'as'> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const FluidGradientHeadline = memo(function FluidGradientHeadline({
  level = 1,
  ...props
}: FluidGradientHeadlineProps) {
  const Component = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  return <FluidGradientText {...props} as={Component} />;
});

/**
 * FluidChrome - Liquid metal chrome text effect
 * A specialized preset that mimics the Y3K chrome/liquid metal trend
 */
export const FluidChrome = memo(function FluidChrome({
  children,
  intensity = 'medium',
  ...props
}: Omit<FluidGradientTextProps, 'preset' | 'colors'> & {
  intensity?: 'subtle' | 'medium' | 'intense';
}) {
  const intensityColors: Record<typeof intensity, string[]> = {
    subtle: ['#f8fafc', '#e2e8f0', '#f1f5f9', '#f8fafc'],
    medium: ['#e2e8f0', '#94a3b8', '#cbd5e1', '#f1f5f9', '#94a3b8', '#e2e8f0'],
    intense: ['#cbd5e1', '#64748b', '#94a3b8', '#e2e8f0', '#64748b', '#cbd5e1'],
  };
  
  return (
    <FluidGradientText
      {...props}
      colors={intensityColors[intensity]}
      shimmer={true}
      shimmerIntensity={intensity === 'intense' ? 0.5 : 0.3}
    >
      {children}
    </FluidGradientText>
  );
});

/**
 * FluidRainbow - Smooth rainbow gradient text
 */
export const FluidRainbow = memo(function FluidRainbow({
  children,
  ...props
}: Omit<FluidGradientTextProps, 'colors'>) {
  const rainbowColors = [
    '#ef4444', // red
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#06b6d4', // cyan
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#ef4444', // back to red (seamless loop)
  ];
  
  return (
    <FluidGradientText {...props} colors={rainbowColors}>
      {children}
    </FluidGradientText>
  );
});

export default FluidGradientText;
