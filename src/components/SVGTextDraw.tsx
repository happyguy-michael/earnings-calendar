'use client';

import { useEffect, useState, useRef, useMemo, CSSProperties } from 'react';

/**
 * SVGTextDraw - Hand-drawn text reveal effect using SVG stroke animation
 * 
 * Creates the illusion of text being written/drawn in real-time using
 * stroke-dasharray/dashoffset animation on SVG text paths.
 * 
 * Features:
 * - Authentic hand-drawn appearance with stroke animation
 * - Per-character staggered drawing for natural flow
 * - Multiple drawing styles: pen, brush, marker, sketch
 * - Configurable stroke width, color, and timing
 * - Fill reveal after stroke completes (optional)
 * - Intersection observer for viewport-triggered animation
 * - Full prefers-reduced-motion support
 * - Screen reader accessible with proper ARIA
 * 
 * Perfect for hero headlines, section titles, or dramatic reveals.
 * Inspired by luxury brand animations and editorial design.
 */

type DrawStyle = 'pen' | 'brush' | 'marker' | 'sketch' | 'neon';

interface SVGTextDrawProps {
  /** Text to draw */
  text: string;
  /** Font size in pixels */
  fontSize?: number;
  /** Font family (should be available) */
  fontFamily?: string;
  /** Font weight */
  fontWeight?: number | string;
  /** Drawing style */
  style?: DrawStyle;
  /** Stroke color during draw */
  strokeColor?: string;
  /** Final fill color (after draw completes) */
  fillColor?: string;
  /** Total animation duration in ms */
  duration?: number;
  /** Delay before starting in ms */
  delay?: number;
  /** Stagger between characters in ms */
  stagger?: number;
  /** Whether to fill text after drawing completes */
  fillAfterDraw?: boolean;
  /** Fill transition duration in ms */
  fillDuration?: number;
  /** Trigger animation on viewport entry */
  animateOnView?: boolean;
  /** Replay animation on value change */
  animateOnChange?: boolean;
  /** Additional class name */
  className?: string;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Line height multiplier */
  lineHeight?: number;
  /** Letter spacing in em */
  letterSpacing?: number;
}

// Style presets for different drawing aesthetics
const STYLE_PRESETS: Record<DrawStyle, {
  strokeWidth: number;
  strokeLinecap: 'butt' | 'round' | 'square';
  strokeLinejoin: 'miter' | 'round' | 'bevel';
  opacity: number;
}> = {
  pen: {
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    opacity: 1,
  },
  brush: {
    strokeWidth: 3,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    opacity: 0.9,
  },
  marker: {
    strokeWidth: 4,
    strokeLinecap: 'square',
    strokeLinejoin: 'miter',
    opacity: 0.85,
  },
  sketch: {
    strokeWidth: 1,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    opacity: 0.7,
  },
  neon: {
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    opacity: 1,
  },
};

export function SVGTextDraw({
  text,
  fontSize = 48,
  fontFamily = 'system-ui, -apple-system, sans-serif',
  fontWeight = 600,
  style = 'pen',
  strokeColor = 'currentColor',
  fillColor = 'currentColor',
  duration = 2000,
  delay = 0,
  stagger = 50,
  fillAfterDraw = true,
  fillDuration = 300,
  animateOnView = true,
  animateOnChange = false,
  className = '',
  onComplete,
  lineHeight = 1.2,
  letterSpacing = 0,
}: SVGTextDrawProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [pathLengths, setPathLengths] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<(SVGTextElement | null)[]>([]);
  const animationRef = useRef<number | null>(null);
  const prevTextRef = useRef(text);
  
  const stylePreset = STYLE_PRESETS[style];
  
  // Split text into characters for staggered animation
  const characters = useMemo(() => text.split(''), [text]);
  
  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  // Measure path lengths after render
  useEffect(() => {
    const lengths: number[] = [];
    textRefs.current.forEach((textEl) => {
      if (textEl) {
        // Get approximate path length based on text length and font size
        // SVG text doesn't have getComputedTextLength in all cases, so we estimate
        try {
          const length = textEl.getComputedTextLength?.() || fontSize * 1.5;
          lengths.push(length * 2.5); // Multiply for stroke coverage
        } catch {
          lengths.push(fontSize * 2.5);
        }
      }
    });
    setPathLengths(lengths);
  }, [text, fontSize]);
  
  // Handle animation on text change
  useEffect(() => {
    if (animateOnChange && prevTextRef.current !== text) {
      setIsDrawing(false);
      setIsComplete(false);
      prevTextRef.current = text;
      
      // Restart animation after brief reset
      const timer = setTimeout(() => {
        startAnimation();
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [text, animateOnChange]);
  
  const startAnimation = () => {
    if (prefersReducedMotion) {
      setIsComplete(true);
      onComplete?.();
      return;
    }
    
    setIsDrawing(true);
    setIsComplete(false);
    
    // Calculate total animation time
    const totalDuration = duration + (characters.length * stagger) + fillDuration;
    
    animationRef.current = window.setTimeout(() => {
      setIsDrawing(false);
      setIsComplete(true);
      onComplete?.();
    }, totalDuration);
  };
  
  // Intersection observer for viewport-triggered animation
  useEffect(() => {
    if (!animateOnView || !containerRef.current) {
      // If not animating on view, start immediately after delay
      const timer = setTimeout(startAnimation, delay);
      return () => clearTimeout(timer);
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isDrawing && !isComplete) {
            setTimeout(startAnimation, delay);
          }
        });
      },
      { threshold: 0.2 }
    );
    
    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [animateOnView, delay, isDrawing, isComplete]);
  
  // Calculate SVG dimensions based on text
  const svgWidth = useMemo(() => {
    // Rough estimate: average character width is ~0.6 of font size
    const avgCharWidth = fontSize * 0.6;
    const totalLetterSpacing = letterSpacing * fontSize * (characters.length - 1);
    return characters.length * avgCharWidth + totalLetterSpacing + fontSize; // Extra padding
  }, [characters.length, fontSize, letterSpacing]);
  
  const svgHeight = fontSize * lineHeight + fontSize * 0.5;
  
  // Get character x position
  const getCharX = (index: number) => {
    const avgCharWidth = fontSize * 0.6;
    const letterSpacingPx = letterSpacing * fontSize;
    return index * (avgCharWidth + letterSpacingPx) + fontSize * 0.25;
  };
  
  // Reduced motion: show final state immediately
  if (prefersReducedMotion) {
    return (
      <div
        ref={containerRef}
        className={`svg-text-draw svg-text-draw--reduced-motion ${className}`}
        aria-label={text}
        role="img"
      >
        <span
          style={{
            fontSize,
            fontFamily,
            fontWeight,
            color: fillColor,
            lineHeight,
            letterSpacing: `${letterSpacing}em`,
          }}
        >
          {text}
        </span>
      </div>
    );
  }
  
  return (
    <div
      ref={containerRef}
      className={`svg-text-draw ${className}`}
      aria-label={text}
      role="img"
    >
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        width={svgWidth}
        height={svgHeight}
        style={{
          overflow: 'visible',
          display: 'block',
        }}
      >
        {/* Glow filter for neon style */}
        {style === 'neon' && (
          <defs>
            <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        )}
        
        {characters.map((char, index) => {
          const pathLength = pathLengths[index] || fontSize * 2.5;
          const charDelay = index * stagger;
          const charDuration = duration / characters.length;
          
          return (
            <text
              key={`${char}-${index}`}
              ref={(el) => { textRefs.current[index] = el; }}
              x={getCharX(index)}
              y={fontSize}
              fontSize={fontSize}
              fontFamily={fontFamily}
              fontWeight={fontWeight}
              fill={isComplete && fillAfterDraw ? fillColor : 'transparent'}
              stroke={strokeColor}
              strokeWidth={stylePreset.strokeWidth}
              strokeLinecap={stylePreset.strokeLinecap}
              strokeLinejoin={stylePreset.strokeLinejoin}
              opacity={stylePreset.opacity}
              filter={style === 'neon' ? 'url(#neon-glow)' : undefined}
              style={{
                strokeDasharray: pathLength,
                strokeDashoffset: isDrawing || isComplete ? 0 : pathLength,
                transition: isDrawing
                  ? `stroke-dashoffset ${charDuration}ms ease-out ${charDelay}ms, fill ${fillDuration}ms ease ${duration + charDelay}ms`
                  : 'none',
              } as CSSProperties}
            >
              {char}
            </text>
          );
        })}
      </svg>
      
      <style jsx>{`
        .svg-text-draw {
          display: inline-block;
          line-height: 0;
        }
        
        .svg-text-draw text {
          paint-order: stroke fill;
        }
        
        @media print {
          .svg-text-draw svg {
            display: none;
          }
          .svg-text-draw::after {
            content: attr(aria-label);
            font-size: inherit;
            color: currentColor;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * DrawHeadline - Pre-styled headline with draw effect
 * Perfect for hero sections and dramatic reveals
 */
export function DrawHeadline({
  children,
  size = 'lg',
  color = 'white',
  className = '',
  ...props
}: {
  children: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
} & Omit<SVGTextDrawProps, 'text' | 'fontSize' | 'fillColor' | 'strokeColor'>) {
  const sizes = {
    sm: 24,
    md: 36,
    lg: 48,
    xl: 64,
  };
  
  return (
    <SVGTextDraw
      text={children}
      fontSize={sizes[size]}
      strokeColor={color}
      fillColor={color}
      fontWeight={700}
      className={className}
      {...props}
    />
  );
}

/**
 * DrawNumber - Optimized for numeric values with draw effect
 * Great for stats, prices, or key metrics
 */
export function DrawNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  color = '#22c55e',
  size = 48,
  style = 'brush',
  className = '',
  ...props
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  color?: string;
  size?: number;
  style?: DrawStyle;
  className?: string;
} & Omit<SVGTextDrawProps, 'text' | 'fontSize' | 'fillColor' | 'strokeColor' | 'style'>) {
  const formattedValue = `${prefix}${value.toFixed(decimals)}${suffix}`;
  
  return (
    <SVGTextDraw
      text={formattedValue}
      fontSize={size}
      strokeColor={color}
      fillColor={color}
      style={style}
      fontWeight={700}
      fontFamily="ui-monospace, monospace"
      duration={1500}
      stagger={80}
      className={className}
      {...props}
    />
  );
}

/**
 * NeonSign - Neon light effect with draw-in animation
 * Perfect for attention-grabbing headers or special events
 */
export function NeonSign({
  text,
  color = '#00ffff',
  size = 48,
  className = '',
  ...props
}: {
  text: string;
  color?: string;
  size?: number;
  className?: string;
} & Omit<SVGTextDrawProps, 'text' | 'fontSize' | 'fillColor' | 'strokeColor' | 'style'>) {
  return (
    <SVGTextDraw
      text={text}
      fontSize={size}
      strokeColor={color}
      fillColor={color}
      style="neon"
      fontWeight={800}
      duration={2500}
      stagger={100}
      className={`neon-sign ${className}`}
      {...props}
    />
  );
}

export default SVGTextDraw;
