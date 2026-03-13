'use client';

import { useEffect, useState, useRef, useMemo } from 'react';

interface GlitchTextProps {
  text: string;
  /** Enable the glitch effect */
  active?: boolean;
  /** Glitch intensity: 'subtle' | 'medium' | 'intense' */
  intensity?: 'subtle' | 'medium' | 'intense';
  /** Primary color for the text */
  color?: string;
  /** Secondary glitch color (RGB shift) */
  glitchColor1?: string;
  /** Tertiary glitch color (RGB shift) */
  glitchColor2?: string;
  /** Custom className */
  className?: string;
  /** Delay between glitch bursts (ms) */
  interval?: number;
  /** Duration of each glitch burst (ms) */
  duration?: number;
  /** Whether to show on hover only */
  hoverOnly?: boolean;
  /** aria-label override */
  ariaLabel?: string;
}

/**
 * GlitchText - A cyberpunk-inspired text effect
 * 
 * Creates a retro digital glitch effect with:
 * - RGB color channel splitting
 * - Random position jitter
 * - Clip-path slicing for scan line effect
 * - Configurable intensity and timing
 * 
 * Respects prefers-reduced-motion for accessibility.
 * 
 * Inspired by 2025 UI trends: futuristic state indicators,
 * cyberpunk aesthetics, and "digital artifact" animations.
 */
export function GlitchText({
  text,
  active = true,
  intensity = 'subtle',
  color = 'currentColor',
  glitchColor1 = '#00ffff', // Cyan
  glitchColor2 = '#ff00ff', // Magenta
  className = '',
  interval = 3000,
  duration = 200,
  hoverOnly = false,
  ariaLabel,
}: GlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const glitchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check for reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Intensity configuration
  const config = useMemo(() => {
    switch (intensity) {
      case 'intense':
        return {
          offsetX: 4,
          offsetY: 2,
          slices: 8,
          probability: 1,
        };
      case 'medium':
        return {
          offsetX: 2,
          offsetY: 1,
          slices: 5,
          probability: 0.8,
        };
      case 'subtle':
      default:
        return {
          offsetX: 1,
          offsetY: 0.5,
          slices: 3,
          probability: 0.6,
        };
    }
  }, [intensity]);

  // Trigger glitch effect periodically
  useEffect(() => {
    if (reducedMotion || !active) return;
    if (hoverOnly && !isHovered) return;

    const triggerGlitch = () => {
      // Random chance to skip this glitch (for subtle effect)
      if (Math.random() > config.probability) return;
      
      setIsGlitching(true);
      
      glitchTimeoutRef.current = setTimeout(() => {
        setIsGlitching(false);
      }, duration);
    };

    // Initial glitch after short delay
    const initialTimeout = setTimeout(triggerGlitch, 500);
    
    // Periodic glitches
    intervalRef.current = setInterval(triggerGlitch, interval);

    return () => {
      clearTimeout(initialTimeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (glitchTimeoutRef.current) clearTimeout(glitchTimeoutRef.current);
    };
  }, [active, reducedMotion, interval, duration, config.probability, hoverOnly, isHovered]);

  // Generate random clip-path slices for the glitch effect
  const generateSlices = () => {
    const slices: string[] = [];
    const sliceCount = config.slices;
    const sliceHeight = 100 / sliceCount;
    
    for (let i = 0; i < sliceCount; i++) {
      const top = i * sliceHeight;
      const bottom = (i + 1) * sliceHeight;
      const randomOffset = (Math.random() - 0.5) * config.offsetX * 2;
      slices.push(`
        .glitch-text-layer-1.glitch-active .glitch-slice-${i} {
          clip-path: polygon(0 ${top}%, 100% ${top}%, 100% ${bottom}%, 0 ${bottom}%);
          transform: translateX(${randomOffset}px);
        }
        .glitch-text-layer-2.glitch-active .glitch-slice-${i} {
          clip-path: polygon(0 ${top}%, 100% ${top}%, 100% ${bottom}%, 0 ${bottom}%);
          transform: translateX(${-randomOffset}px);
        }
      `);
    }
    return slices.join('');
  };

  // Don't animate if reduced motion or inactive
  if (reducedMotion || !active) {
    return (
      <span className={`glitch-text-static ${className}`} aria-label={ariaLabel}>
        {text}
      </span>
    );
  }

  const shouldGlitch = isGlitching && (!hoverOnly || isHovered);

  return (
    <>
      <style jsx>{`
        .glitch-text-container {
          position: relative;
          display: inline-block;
          color: ${color};
        }
        
        .glitch-text-base {
          position: relative;
          z-index: 1;
        }
        
        .glitch-text-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          opacity: 0;
          z-index: 0;
        }
        
        .glitch-text-layer-1 {
          color: ${glitchColor1};
          z-index: 2;
        }
        
        .glitch-text-layer-2 {
          color: ${glitchColor2};
          z-index: 3;
        }
        
        .glitch-text-layer.glitch-active {
          opacity: 0.8;
          animation: glitchFlicker ${duration}ms steps(2) infinite;
        }
        
        .glitch-text-layer-1.glitch-active {
          transform: translate(${config.offsetX}px, ${config.offsetY}px);
          mix-blend-mode: screen;
        }
        
        .glitch-text-layer-2.glitch-active {
          transform: translate(${-config.offsetX}px, ${-config.offsetY}px);
          mix-blend-mode: screen;
        }
        
        .glitch-text-base.glitch-active {
          animation: glitchJitter ${duration}ms steps(3) infinite;
        }
        
        @keyframes glitchFlicker {
          0% { opacity: 0.8; }
          25% { opacity: 0.4; }
          50% { opacity: 0.9; }
          75% { opacity: 0.3; }
          100% { opacity: 0.7; }
        }
        
        @keyframes glitchJitter {
          0% { transform: translate(0, 0); }
          33% { transform: translate(${config.offsetX * 0.5}px, ${-config.offsetY}px); }
          66% { transform: translate(${-config.offsetX * 0.3}px, ${config.offsetY * 0.5}px); }
          100% { transform: translate(0, 0); }
        }
        
        /* Scanline effect on base text during glitch */
        .glitch-text-base.glitch-active::after {
          content: '';
          position: absolute;
          top: 0;
          left: -2px;
          right: -2px;
          bottom: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent 0px,
            transparent 2px,
            rgba(0, 0, 0, 0.15) 2px,
            rgba(0, 0, 0, 0.15) 4px
          );
          pointer-events: none;
          animation: scanlineMove ${duration * 2}ms linear infinite;
        }
        
        @keyframes scanlineMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(4px); }
        }
        
        /* Random slice transforms */
        ${generateSlices()}
      `}</style>
      
      <span 
        className={`glitch-text-container ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={ariaLabel || text}
        role="text"
      >
        {/* Base text */}
        <span className={`glitch-text-base ${shouldGlitch ? 'glitch-active' : ''}`}>
          {text}
        </span>
        
        {/* Glitch layer 1 (cyan) */}
        <span 
          className={`glitch-text-layer glitch-text-layer-1 ${shouldGlitch ? 'glitch-active' : ''}`}
          aria-hidden="true"
        >
          {text}
        </span>
        
        {/* Glitch layer 2 (magenta) */}
        <span 
          className={`glitch-text-layer glitch-text-layer-2 ${shouldGlitch ? 'glitch-active' : ''}`}
          aria-hidden="true"
        >
          {text}
        </span>
      </span>
    </>
  );
}

/**
 * GlitchNumber - Specialized glitch effect for numbers
 * 
 * Same as GlitchText but with number-specific styling
 * and optional prefix/suffix support.
 */
interface GlitchNumberProps extends Omit<GlitchTextProps, 'text'> {
  value: number;
  prefix?: string;
  suffix?: string;
  /** Format number with locale */
  locale?: string;
}

export function GlitchNumber({
  value,
  prefix = '',
  suffix = '',
  locale = 'en-US',
  ...props
}: GlitchNumberProps) {
  const formattedValue = value.toLocaleString(locale);
  const text = `${prefix}${formattedValue}${suffix}`;
  
  return (
    <GlitchText
      text={text}
      {...props}
    />
  );
}

/**
 * GlitchPending - Pre-configured glitch for "pending" states
 * 
 * Uses amber/yellow color scheme that matches the pending
 * badge styling in the earnings calendar.
 */
interface GlitchPendingProps {
  value: number;
  className?: string;
  showWhenZero?: boolean;
}

export function GlitchPending({
  value,
  className = '',
  showWhenZero = false,
}: GlitchPendingProps) {
  // Don't show glitch when value is 0 (unless explicitly requested)
  if (value === 0 && !showWhenZero) {
    return <span className={className}>0</span>;
  }

  return (
    <GlitchNumber
      value={value}
      active={value > 0}
      intensity="subtle"
      color="#fbbf24" // Amber-400
      glitchColor1="#fef3c7" // Amber-100
      glitchColor2="#f59e0b" // Amber-500
      interval={4000}
      duration={150}
      className={className}
      ariaLabel={`${value} pending earnings`}
    />
  );
}

export default GlitchText;
