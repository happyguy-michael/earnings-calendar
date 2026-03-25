'use client';

import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
  ReactNode,
  CSSProperties,
} from 'react';
import { useMotionPreferences } from './MotionPreferences';

/**
 * MagneticText - 2026 Kinetic Typography Component
 * 
 * Text where individual characters are magnetically attracted to the cursor.
 * Creates a fluid, organic "pulled" effect as the cursor moves near text.
 * 
 * Inspiration:
 * - 2026 "Living Interfaces" trend
 * - Kinetic typography in motion graphics
 * - Dia app's magnetic UI interactions
 * - Linear's playful cursor effects
 * - Stripe's attention to micro-interactions
 * 
 * Features:
 * - Per-character magnetic attraction with spring physics
 * - Configurable field radius and strength
 * - Optional rotation and scale effects
 * - Performance optimized with RAF and transform batching
 * - Full prefers-reduced-motion support
 * - Touch/mobile support
 */

interface Vector2 {
  x: number;
  y: number;
}

interface CharState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  scale: number;
}

export interface MagneticTextProps {
  /** The text content to display */
  children: string;
  /** Radius of the magnetic field in pixels (default: 150) */
  fieldRadius?: number;
  /** Strength of the magnetic pull (0-1, default: 0.4) */
  strength?: number;
  /** Whether characters rotate toward cursor (default: true) */
  rotate?: boolean;
  /** Maximum rotation in degrees (default: 8) */
  maxRotation?: number;
  /** Whether characters scale on proximity (default: true) */
  scale?: boolean;
  /** Maximum scale factor (default: 1.15) */
  maxScale?: number;
  /** Spring stiffness (default: 180) */
  stiffness?: number;
  /** Spring damping (default: 15) */
  damping?: number;
  /** Enable/disable the effect (default: true) */
  enabled?: boolean;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** HTML element to render as (default: 'span') */
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
  /** Callback when cursor enters the text area */
  onHoverStart?: () => void;
  /** Callback when cursor leaves the text area */
  onHoverEnd?: () => void;
  /** Color to apply when character is attracted (optional) */
  attractColor?: string;
  /** Whether to apply glow effect to attracted characters */
  glow?: boolean;
  /** Glow color (default: current text color) */
  glowColor?: string;
  /** Max displacement in pixels (default: 20) */
  maxDisplacement?: number;
}

export function MagneticText({
  children,
  fieldRadius = 150,
  strength = 0.4,
  rotate = true,
  maxRotation = 8,
  scale = true,
  maxScale = 1.15,
  stiffness = 180,
  damping = 15,
  enabled = true,
  className = '',
  style,
  as: Component = 'span',
  onHoverStart,
  onHoverEnd,
  attractColor,
  glow = false,
  glowColor,
  maxDisplacement = 20,
}: MagneticTextProps) {
  const containerRef = useRef<HTMLElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const charStates = useRef<CharState[]>([]);
  const cursorPos = useRef<Vector2 | null>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const isHovering = useRef(false);
  const [isActive, setIsActive] = useState(false);
  
  const { shouldAnimate } = useMotionPreferences();
  const reducedMotion = !shouldAnimate('decorative');

  // Split text into characters, preserving spaces
  const characters = useMemo(() => {
    return children.split('').map((char, i) => ({
      char,
      isSpace: char === ' ',
      key: `${char}-${i}`,
    }));
  }, [children]);

  // Initialize character states
  useEffect(() => {
    charStates.current = characters.map(() => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      rotation: 0,
      scale: 1,
    }));
    charRefs.current = charRefs.current.slice(0, characters.length);
  }, [characters]);

  // Handle cursor tracking
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!enabled || reducedMotion || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    cursorPos.current = {
      x: e.clientX,
      y: e.clientY,
    };
  }, [enabled, reducedMotion]);

  const handleMouseEnter = useCallback(() => {
    if (!enabled || reducedMotion) return;
    isHovering.current = true;
    setIsActive(true);
    onHoverStart?.();
  }, [enabled, reducedMotion, onHoverStart]);

  const handleMouseLeave = useCallback(() => {
    isHovering.current = false;
    cursorPos.current = null;
    setIsActive(false);
    onHoverEnd?.();
  }, [onHoverEnd]);

  // Touch support
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || reducedMotion || e.touches.length === 0) return;
    
    const touch = e.touches[0];
    cursorPos.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
    
    if (!isHovering.current) {
      isHovering.current = true;
      setIsActive(true);
      onHoverStart?.();
    }
  }, [enabled, reducedMotion, onHoverStart]);

  const handleTouchEnd = useCallback(() => {
    isHovering.current = false;
    cursorPos.current = null;
    setIsActive(false);
    onHoverEnd?.();
  }, [onHoverEnd]);

  // Animation loop with spring physics
  useEffect(() => {
    if (!enabled || reducedMotion) {
      // Reset all transforms when disabled
      charRefs.current.forEach(ref => {
        if (ref) ref.style.transform = '';
      });
      return;
    }

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      charRefs.current.forEach((ref, i) => {
        if (!ref) return;
        
        const state = charStates.current[i];
        if (!state) return;

        let targetX = 0;
        let targetY = 0;
        let targetRotation = 0;
        let targetScale = 1;
        let proximity = 0;

        // Calculate attraction if cursor is present
        if (cursorPos.current && isHovering.current) {
          const rect = ref.getBoundingClientRect();
          const charCenterX = rect.left + rect.width / 2;
          const charCenterY = rect.top + rect.height / 2;

          const dx = cursorPos.current.x - charCenterX;
          const dy = cursorPos.current.y - charCenterY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < fieldRadius) {
            // Calculate proximity (0-1, 1 = closest)
            proximity = 1 - distance / fieldRadius;
            const easedProximity = easeOutQuart(proximity);

            // Pull toward cursor
            const angle = Math.atan2(dy, dx);
            const pullStrength = easedProximity * strength * maxDisplacement;
            
            targetX = Math.cos(angle) * pullStrength;
            targetY = Math.sin(angle) * pullStrength;

            // Rotation toward cursor
            if (rotate) {
              const rotationStrength = easedProximity * maxRotation;
              targetRotation = Math.atan2(dy, dx) * (180 / Math.PI) * (rotationStrength / 90);
            }

            // Scale on proximity
            if (scale) {
              targetScale = 1 + easedProximity * (maxScale - 1);
            }
          }
        }

        // Spring physics for position
        const springForceX = (targetX - state.x) * stiffness;
        const springForceY = (targetY - state.y) * stiffness;

        state.vx += springForceX * deltaTime;
        state.vy += springForceY * deltaTime;
        state.vx *= Math.pow(1 - damping * 0.02, deltaTime * 60);
        state.vy *= Math.pow(1 - damping * 0.02, deltaTime * 60);

        state.x += state.vx * deltaTime;
        state.y += state.vy * deltaTime;

        // Smooth rotation and scale
        state.rotation += (targetRotation - state.rotation) * 0.15;
        state.scale += (targetScale - state.scale) * 0.2;

        // Apply transform
        const x = state.x.toFixed(2);
        const y = state.y.toFixed(2);
        const rot = state.rotation.toFixed(2);
        const s = state.scale.toFixed(4);

        ref.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${s})`;

        // Apply glow and color effects based on proximity
        if (glow || attractColor) {
          const intensity = Math.abs(state.x) / maxDisplacement + Math.abs(state.y) / maxDisplacement;
          const normalizedIntensity = Math.min(1, intensity);
          
          if (glow) {
            const gColor = glowColor || 'currentColor';
            ref.style.textShadow = normalizedIntensity > 0.1 
              ? `0 0 ${Math.round(normalizedIntensity * 12)}px ${gColor}` 
              : '';
          }
          
          if (attractColor && normalizedIntensity > 0.1) {
            ref.style.color = attractColor;
          } else if (attractColor) {
            ref.style.color = '';
          }
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled, reducedMotion, fieldRadius, strength, rotate, maxRotation, scale, maxScale, stiffness, damping, glow, glowColor, attractColor, maxDisplacement]);

  // Event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled || reducedMotion) return;

    // Use document-level mousemove for tracking cursor even outside container
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, reducedMotion, handleMouseMove, handleMouseEnter, handleMouseLeave, handleTouchMove, handleTouchEnd]);

  // Reduced motion: render plain text
  if (reducedMotion) {
    return (
      <Component className={className} style={style}>
        {children}
      </Component>
    );
  }

  return (
    <>
      <Component
        ref={containerRef as any}
        className={`magnetic-text ${className} ${isActive ? 'magnetic-text--active' : ''}`}
        style={{
          ...style,
          display: 'inline-flex',
          flexWrap: 'wrap',
        }}
        aria-label={children}
      >
        {characters.map(({ char, isSpace, key }, i) => (
          <span
            key={key}
            ref={el => { charRefs.current[i] = el; }}
            className="magnetic-text__char"
            style={{
              display: 'inline-block',
              whiteSpace: isSpace ? 'pre' : 'normal',
              willChange: 'transform',
              transformOrigin: 'center center',
              transition: 'color 0.15s ease',
            }}
            aria-hidden="true"
          >
            {char}
          </span>
        ))}
      </Component>
      
      <style jsx>{`
        .magnetic-text {
          cursor: default;
          user-select: none;
        }
        .magnetic-text__char {
          pointer-events: none;
        }
        
        @media print {
          .magnetic-text__char {
            transform: none !important;
            text-shadow: none !important;
          }
        }
      `}</style>
    </>
  );
}

// Easing functions
function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

/**
 * Pre-configured variants
 */

/** Subtle magnetic effect for body text */
export function MagneticTextSubtle({ children, ...props }: Omit<MagneticTextProps, 'strength' | 'maxDisplacement' | 'maxRotation' | 'maxScale'> & { children: string }) {
  return (
    <MagneticText
      {...props}
      strength={0.2}
      maxDisplacement={10}
      maxRotation={4}
      maxScale={1.05}
    >
      {children}
    </MagneticText>
  );
}

/** Strong magnetic effect for headlines */
export function MagneticTextStrong({ children, ...props }: Omit<MagneticTextProps, 'strength' | 'maxDisplacement' | 'maxRotation' | 'maxScale'> & { children: string }) {
  return (
    <MagneticText
      {...props}
      strength={0.6}
      maxDisplacement={30}
      maxRotation={12}
      maxScale={1.25}
    >
      {children}
    </MagneticText>
  );
}

/** Glowing magnetic headline */
export function MagneticHeadline({ 
  children, 
  glowColor = '#818cf8',
  ...props 
}: Omit<MagneticTextProps, 'glow' | 'scale' | 'as'> & { children: string; glowColor?: string }) {
  return (
    <MagneticText
      {...props}
      as="h1"
      glow
      glowColor={glowColor}
      scale
      maxScale={1.2}
      strength={0.5}
      maxDisplacement={25}
    >
      {children}
    </MagneticText>
  );
}

/** Magnetic text that changes color on attraction */
export function MagneticColorText({ 
  children,
  attractColor = '#22c55e',
  ...props 
}: Omit<MagneticTextProps, 'attractColor'> & { children: string; attractColor?: string }) {
  return (
    <MagneticText
      {...props}
      attractColor={attractColor}
      strength={0.35}
      maxDisplacement={15}
    >
      {children}
    </MagneticText>
  );
}

/** Repelling text - characters push away from cursor */
export function RepellingText({ 
  children,
  ...props 
}: Omit<MagneticTextProps, 'strength'> & { children: string }) {
  return (
    <MagneticText
      {...props}
      strength={-0.4}
      maxDisplacement={25}
      maxRotation={10}
    >
      {children}
    </MagneticText>
  );
}

/**
 * MagneticWord - Apply magnetic effect at word level instead of character level
 * More performant for longer text
 */
export interface MagneticWordProps extends Omit<MagneticTextProps, 'children'> {
  children: string;
}

export function MagneticWord({
  children,
  fieldRadius = 200,
  strength = 0.3,
  rotate = true,
  maxRotation = 6,
  scale = true,
  maxScale = 1.1,
  stiffness = 150,
  damping = 12,
  enabled = true,
  className = '',
  style,
  as: Component = 'span',
  glow = false,
  glowColor,
  maxDisplacement = 15,
}: MagneticWordProps) {
  const containerRef = useRef<HTMLElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const wordStates = useRef<CharState[]>([]);
  const cursorPos = useRef<Vector2 | null>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const isHovering = useRef(false);
  
  const { shouldAnimate } = useMotionPreferences();
  const reducedMotion = !shouldAnimate('decorative');

  // Split text into words
  const words = useMemo(() => {
    return children.split(' ').map((word, i) => ({
      word,
      key: `${word}-${i}`,
    }));
  }, [children]);

  // Initialize word states
  useEffect(() => {
    wordStates.current = words.map(() => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      rotation: 0,
      scale: 1,
    }));
    wordRefs.current = wordRefs.current.slice(0, words.length);
  }, [words]);

  // Event handlers (same as character-level but for words)
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!enabled || reducedMotion) return;
    cursorPos.current = { x: e.clientX, y: e.clientY };
  }, [enabled, reducedMotion]);

  const handleMouseEnter = useCallback(() => {
    if (!enabled || reducedMotion) return;
    isHovering.current = true;
  }, [enabled, reducedMotion]);

  const handleMouseLeave = useCallback(() => {
    isHovering.current = false;
    cursorPos.current = null;
  }, []);

  // Animation loop
  useEffect(() => {
    if (!enabled || reducedMotion) {
      wordRefs.current.forEach(ref => {
        if (ref) ref.style.transform = '';
      });
      return;
    }

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      wordRefs.current.forEach((ref, i) => {
        if (!ref) return;
        
        const state = wordStates.current[i];
        if (!state) return;

        let targetX = 0;
        let targetY = 0;
        let targetRotation = 0;
        let targetScale = 1;

        if (cursorPos.current && isHovering.current) {
          const rect = ref.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          const dx = cursorPos.current.x - centerX;
          const dy = cursorPos.current.y - centerY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < fieldRadius) {
            const proximity = 1 - distance / fieldRadius;
            const easedProximity = easeOutQuart(proximity);

            const angle = Math.atan2(dy, dx);
            const pullStrength = easedProximity * strength * maxDisplacement;
            
            targetX = Math.cos(angle) * pullStrength;
            targetY = Math.sin(angle) * pullStrength;

            if (rotate) {
              targetRotation = Math.atan2(dy, dx) * (180 / Math.PI) * (easedProximity * maxRotation / 90);
            }

            if (scale) {
              targetScale = 1 + easedProximity * (maxScale - 1);
            }
          }
        }

        // Spring physics
        const springForceX = (targetX - state.x) * stiffness;
        const springForceY = (targetY - state.y) * stiffness;

        state.vx += springForceX * deltaTime;
        state.vy += springForceY * deltaTime;
        state.vx *= Math.pow(1 - damping * 0.02, deltaTime * 60);
        state.vy *= Math.pow(1 - damping * 0.02, deltaTime * 60);

        state.x += state.vx * deltaTime;
        state.y += state.vy * deltaTime;
        state.rotation += (targetRotation - state.rotation) * 0.15;
        state.scale += (targetScale - state.scale) * 0.2;

        ref.style.transform = `translate(${state.x.toFixed(2)}px, ${state.y.toFixed(2)}px) rotate(${state.rotation.toFixed(2)}deg) scale(${state.scale.toFixed(4)})`;

        if (glow) {
          const intensity = Math.min(1, (Math.abs(state.x) + Math.abs(state.y)) / maxDisplacement);
          const gColor = glowColor || 'currentColor';
          ref.style.textShadow = intensity > 0.1 
            ? `0 0 ${Math.round(intensity * 10)}px ${gColor}` 
            : '';
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled, reducedMotion, fieldRadius, strength, rotate, maxRotation, scale, maxScale, stiffness, damping, glow, glowColor, maxDisplacement]);

  // Event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled || reducedMotion) return;

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [enabled, reducedMotion, handleMouseMove, handleMouseEnter, handleMouseLeave]);

  if (reducedMotion) {
    return (
      <Component className={className} style={style}>
        {children}
      </Component>
    );
  }

  return (
    <Component
      ref={containerRef as any}
      className={`magnetic-word ${className}`}
      style={{
        ...style,
        display: 'inline-flex',
        flexWrap: 'wrap',
        gap: '0.25em',
      }}
      aria-label={children}
    >
      {words.map(({ word, key }, i) => (
        <span
          key={key}
          ref={el => { wordRefs.current[i] = el; }}
          style={{
            display: 'inline-block',
            willChange: 'transform',
            transformOrigin: 'center center',
          }}
          aria-hidden="true"
        >
          {word}
        </span>
      ))}
    </Component>
  );
}
