'use client';

import { useEffect, useState, useRef, CSSProperties } from 'react';

/**
 * ChromaticAberration - Cinematic RGB split effect for exceptional elements
 * 
 * Inspiration:
 * - Camera lens aberration in film/photography
 * - Cyberpunk 2077 UI critical state indicators
 * - GMTK Game Jam 2024 winner UIs
 * - 2026 trend: "Analog Imperfection" - digital elements with analog flaws
 * 
 * Features:
 * - Subtle RGB channel separation that signals importance
 * - Configurable intensity based on surprise magnitude
 * - Animated pulse on hover/focus
 * - Glitch mode for disaster scenarios
 * - Full prefers-reduced-motion support
 */

interface ChromaticAberrationProps {
  /** Content to apply effect to */
  children: React.ReactNode;
  /** Base intensity (0-1, default 0.3) */
  intensity?: number;
  /** Whether effect is active */
  active?: boolean;
  /** Variant: 'beat' (cyan/magenta) | 'miss' (red/cyan) | 'neutral' */
  variant?: 'beat' | 'miss' | 'neutral';
  /** Enable glitch animation (for disasters) */
  glitch?: boolean;
  /** Hover amplifies the effect */
  hoverAmplify?: boolean;
  /** Animation delay in ms */
  delay?: number;
  /** Additional className */
  className?: string;
}

export function ChromaticAberration({
  children,
  intensity = 0.3,
  active = true,
  variant = 'beat',
  glitch = false,
  hoverAmplify = true,
  delay = 0,
  className = '',
}: ChromaticAberrationProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [glitchOffset, setGlitchOffset] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const glitchInterval = useRef<NodeJS.Timeout | null>(null);

  // Check reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Intersection observer for viewport detection
  useEffect(() => {
    if (!ref.current || prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay, prefersReducedMotion]);

  // Glitch animation
  useEffect(() => {
    if (!glitch || prefersReducedMotion || !isVisible) return;

    const randomGlitch = () => {
      if (Math.random() > 0.7) {
        setGlitchOffset({
          x: (Math.random() - 0.5) * 8,
          y: (Math.random() - 0.5) * 4,
        });
        setTimeout(() => setGlitchOffset({ x: 0, y: 0 }), 50);
      }
    };

    glitchInterval.current = setInterval(randomGlitch, 200);
    return () => {
      if (glitchInterval.current) clearInterval(glitchInterval.current);
    };
  }, [glitch, prefersReducedMotion, isVisible]);

  if (!active || prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  // Calculate offset based on intensity and hover state
  const baseOffset = intensity * 4; // 0-4px base range
  const currentIntensity = hoverAmplify && isHovered ? intensity * 1.8 : intensity;
  const offset = currentIntensity * 4 + (glitch ? Math.abs(glitchOffset.x) : 0);

  // Color channels based on variant
  const colors = {
    beat: { r: 'rgba(0, 255, 255, 0.6)', b: 'rgba(255, 0, 255, 0.6)' }, // Cyan/Magenta
    miss: { r: 'rgba(255, 50, 50, 0.7)', b: 'rgba(0, 200, 255, 0.5)' }, // Red/Cyan
    neutral: { r: 'rgba(100, 100, 255, 0.5)', b: 'rgba(255, 100, 100, 0.5)' }, // Blue/Red
  };

  const { r, b } = colors[variant];

  const containerStyle: CSSProperties = {
    position: 'relative',
    isolation: 'isolate',
  };

  const baseStyle: CSSProperties = {
    position: 'relative',
    zIndex: 2,
    transition: hoverAmplify ? 'transform 0.2s ease' : 'none',
    transform: glitch 
      ? `translate(${glitchOffset.x}px, ${glitchOffset.y}px)` 
      : undefined,
  };

  const layerBaseStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 1,
    opacity: isVisible ? currentIntensity : 0,
    transition: 'opacity 0.3s ease, transform 0.2s ease',
    mixBlendMode: 'screen',
  };

  const redLayerStyle: CSSProperties = {
    ...layerBaseStyle,
    transform: `translate(${-offset + glitchOffset.x}px, ${glitchOffset.y * 0.5}px)`,
    filter: `blur(${offset * 0.3}px)`,
  };

  const blueLayerStyle: CSSProperties = {
    ...layerBaseStyle,
    transform: `translate(${offset + glitchOffset.x}px, ${-glitchOffset.y * 0.5}px)`,
    filter: `blur(${offset * 0.3}px)`,
  };

  return (
    <div
      ref={ref}
      className={`chromatic-aberration ${className}`}
      style={containerStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Red/Cyan channel - offset left */}
      <div 
        className="chromatic-layer chromatic-r" 
        style={redLayerStyle}
        aria-hidden="true"
      >
        <div style={{ filter: `drop-shadow(0 0 2px ${r})`, opacity: 0.8 }}>
          {children}
        </div>
      </div>

      {/* Blue/Magenta channel - offset right */}
      <div 
        className="chromatic-layer chromatic-b" 
        style={blueLayerStyle}
        aria-hidden="true"
      >
        <div style={{ filter: `drop-shadow(0 0 2px ${b})`, opacity: 0.8 }}>
          {children}
        </div>
      </div>

      {/* Main content */}
      <div style={baseStyle}>
        {children}
      </div>

      <style jsx>{`
        .chromatic-aberration {
          cursor: ${hoverAmplify ? 'pointer' : 'default'};
        }

        @keyframes chromatic-pulse {
          0%, 100% {
            opacity: ${currentIntensity};
          }
          50% {
            opacity: ${currentIntensity * 1.3};
          }
        }

        .chromatic-layer {
          animation: ${isVisible && !glitch ? 'chromatic-pulse 3s ease-in-out infinite' : 'none'};
        }

        .chromatic-r {
          animation-delay: 0s;
        }

        .chromatic-b {
          animation-delay: 1.5s;
        }
      `}</style>
    </div>
  );
}

/**
 * ChromaticText - Apply chromatic aberration to text specifically
 */
interface ChromaticTextProps {
  children: string;
  intensity?: number;
  variant?: 'beat' | 'miss' | 'neutral';
  className?: string;
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3';
}

export function ChromaticText({
  children,
  intensity = 0.5,
  variant = 'beat',
  className = '',
  as: Component = 'span',
}: ChromaticTextProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  if (prefersReducedMotion) {
    return <Component className={className}>{children}</Component>;
  }

  const offset = intensity * 2;
  
  const colors = {
    beat: { r: 'rgba(0, 255, 255, 0.8)', b: 'rgba(255, 0, 255, 0.8)' },
    miss: { r: 'rgba(255, 50, 50, 0.8)', b: 'rgba(0, 200, 255, 0.7)' },
    neutral: { r: 'rgba(100, 100, 255, 0.7)', b: 'rgba(255, 100, 100, 0.7)' },
  };

  const { r, b } = colors[variant];

  return (
    <Component
      className={`chromatic-text ${className}`}
      style={{
        position: 'relative',
        display: 'inline-block',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: -offset,
          color: r,
          opacity: intensity,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      >
        {children}
      </span>
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: offset,
          color: b,
          opacity: intensity,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      >
        {children}
      </span>
      <span style={{ position: 'relative' }}>{children}</span>
    </Component>
  );
}

/**
 * ChromaticBadge - Compact badge with chromatic effect for exceptional values
 */
interface ChromaticBadgeProps {
  value: string | number;
  variant?: 'beat' | 'miss';
  /** Threshold for activating effect (percentage) */
  threshold?: number;
  /** The actual percentage for comparison */
  percentage?: number;
  className?: string;
}

export function ChromaticBadge({
  value,
  variant = 'beat',
  threshold = 15,
  percentage,
  className = '',
}: ChromaticBadgeProps) {
  // Only show chromatic effect for exceptional values
  const isExceptional = percentage !== undefined && Math.abs(percentage) >= threshold;
  
  if (!isExceptional) {
    return (
      <span className={`chromatic-badge ${className}`}>
        {value}
      </span>
    );
  }

  // Intensity scales with how exceptional the value is
  const intensity = Math.min(0.8, (Math.abs(percentage!) - threshold) / 30 + 0.3);
  
  return (
    <ChromaticText intensity={intensity} variant={variant} className={className}>
      {String(value)}
    </ChromaticText>
  );
}

/**
 * useChromatic - Hook for programmatic chromatic control
 */
export function useChromatic(surprise: number, threshold = 15) {
  const isExceptional = Math.abs(surprise) >= threshold;
  const variant = surprise >= 0 ? 'beat' : 'miss';
  const intensity = isExceptional 
    ? Math.min(0.8, (Math.abs(surprise) - threshold) / 30 + 0.3)
    : 0;
  const isMonster = Math.abs(surprise) >= 25;
  const isDisaster = surprise <= -20;

  return {
    active: isExceptional,
    variant,
    intensity,
    isMonster,
    isDisaster,
    glitch: isDisaster,
    props: {
      active: isExceptional,
      variant,
      intensity,
      glitch: isDisaster,
    } as ChromaticAberrationProps,
  };
}
