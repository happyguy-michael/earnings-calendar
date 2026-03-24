'use client';

/**
 * MagneticCursor - Cursor Proximity Attraction Effect
 * 
 * Inspiration:
 * - Apple's iOS button hover states (subtle magnetic pull)
 * - Stripe's magnetic card interactions
 * - 2026 "Gravitational UI" trend — elements that respond to cursor proximity
 * - Physics-based interfaces that feel tactile and alive
 * 
 * Elements wrapped in MagneticCursor subtly "lean" toward the cursor as it
 * approaches, creating a sense of physical attraction. The effect is most
 * pronounced when the cursor is close but not directly over the element,
 * creating anticipation before hover.
 * 
 * Use cases:
 * - Stats/numbers that feel "alive"
 * - Badges that draw attention
 * - Interactive elements with premium feel
 * - Any element that should feel responsive to cursor presence
 */

import { useEffect, useRef, useState, useCallback, ReactNode, CSSProperties } from 'react';

// Check for reduced motion preference
function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}

interface MagneticCursorProps {
  children: ReactNode;
  /** Maximum attraction strength (pixels of movement). Default: 8 */
  strength?: number;
  /** Radius of influence in pixels. Default: 150 */
  radius?: number;
  /** Falloff curve: 'linear' | 'easeOut' | 'easeInOut'. Default: 'easeOut' */
  falloff?: 'linear' | 'easeOut' | 'easeInOut';
  /** Whether to also scale slightly when attracted. Default: false */
  scale?: boolean;
  /** Scale amount when fully attracted. Default: 1.05 */
  scaleAmount?: number;
  /** Whether to add subtle rotation toward cursor. Default: false */
  rotate?: boolean;
  /** Maximum rotation in degrees. Default: 3 */
  rotateAmount?: number;
  /** Spring damping factor (0-1, lower = more springy). Default: 0.15 */
  damping?: number;
  /** Whether effect is active. Default: true */
  enabled?: boolean;
  /** Additional className */
  className?: string;
  /** Additional inline styles */
  style?: CSSProperties;
  /** Element tag to render. Default: 'span' */
  as?: 'span' | 'div' | 'p' | 'li' | 'a' | 'button';
}

interface Vector2 {
  x: number;
  y: number;
}

// Falloff functions for different attraction curves
const falloffFunctions = {
  linear: (t: number) => 1 - t,
  easeOut: (t: number) => 1 - Math.pow(t, 2),
  easeInOut: (t: number) => t < 0.5 
    ? 2 * t * t 
    : 1 - Math.pow(-2 * t + 2, 2) / 2,
};

export function MagneticCursor({
  children,
  strength = 8,
  radius = 150,
  falloff = 'easeOut',
  scale = false,
  scaleAmount = 1.05,
  rotate = false,
  rotateAmount = 3,
  damping = 0.15,
  enabled = true,
  className = '',
  style,
  as: Component = 'span',
}: MagneticCursorProps) {
  const elementRef = useRef<HTMLElement>(null);
  const targetOffset = useRef<Vector2>({ x: 0, y: 0 });
  const currentOffset = useRef<Vector2>({ x: 0, y: 0 });
  const targetScale = useRef(1);
  const currentScale = useRef(1);
  const targetRotation = useRef(0);
  const currentRotation = useRef(0);
  const frameRef = useRef<number | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const isDisabled = !enabled || prefersReducedMotion;

  // Calculate attraction based on cursor position
  const updateAttraction = useCallback((cursorX: number, cursorY: number) => {
    if (!elementRef.current || isDisabled) return;

    const rect = elementRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = cursorX - centerX;
    const deltaY = cursorY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > radius) {
      // Outside radius — no attraction
      targetOffset.current = { x: 0, y: 0 };
      targetScale.current = 1;
      targetRotation.current = 0;
    } else {
      // Within radius — calculate attraction
      const normalizedDistance = distance / radius; // 0 at center, 1 at edge
      const falloffValue = falloffFunctions[falloff](normalizedDistance);
      const attractionStrength = falloffValue * strength;

      // Direction toward cursor (normalized)
      const dirX = distance > 0 ? deltaX / distance : 0;
      const dirY = distance > 0 ? deltaY / distance : 0;

      targetOffset.current = {
        x: dirX * attractionStrength,
        y: dirY * attractionStrength,
      };

      // Scale based on proximity (optional)
      if (scale) {
        const scaleProgress = falloffValue;
        targetScale.current = 1 + (scaleAmount - 1) * scaleProgress;
      }

      // Rotation toward cursor (optional)
      if (rotate) {
        // Rotate based on horizontal offset
        const rotateProgress = (deltaX / radius) * falloffValue;
        targetRotation.current = rotateProgress * rotateAmount;
      }
    }
  }, [radius, strength, falloff, scale, scaleAmount, rotate, rotateAmount, isDisabled]);

  // Animation loop with spring damping
  const animate = useCallback(() => {
    // Lerp current values toward targets
    currentOffset.current.x += (targetOffset.current.x - currentOffset.current.x) * damping;
    currentOffset.current.y += (targetOffset.current.y - currentOffset.current.y) * damping;
    currentScale.current += (targetScale.current - currentScale.current) * damping;
    currentRotation.current += (targetRotation.current - currentRotation.current) * damping;

    // Apply transforms
    if (elementRef.current) {
      const transforms: string[] = [];
      
      if (Math.abs(currentOffset.current.x) > 0.01 || Math.abs(currentOffset.current.y) > 0.01) {
        transforms.push(`translate(${currentOffset.current.x.toFixed(2)}px, ${currentOffset.current.y.toFixed(2)}px)`);
      }
      
      if (scale && Math.abs(currentScale.current - 1) > 0.001) {
        transforms.push(`scale(${currentScale.current.toFixed(4)})`);
      }
      
      if (rotate && Math.abs(currentRotation.current) > 0.01) {
        transforms.push(`rotate(${currentRotation.current.toFixed(2)}deg)`);
      }

      elementRef.current.style.transform = transforms.length > 0 ? transforms.join(' ') : '';
    }

    // Continue animation if not settled
    const isSettled = 
      Math.abs(targetOffset.current.x - currentOffset.current.x) < 0.01 &&
      Math.abs(targetOffset.current.y - currentOffset.current.y) < 0.01 &&
      Math.abs(targetScale.current - currentScale.current) < 0.001 &&
      Math.abs(targetRotation.current - currentRotation.current) < 0.01;

    if (!isSettled) {
      frameRef.current = requestAnimationFrame(animate);
    } else {
      frameRef.current = null;
    }
  }, [damping, scale, rotate]);

  // Mouse move handler
  useEffect(() => {
    if (isDisabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      updateAttraction(e.clientX, e.clientY);
      
      // Start animation if not already running
      if (!frameRef.current) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    const handleMouseLeave = () => {
      // Reset targets when mouse leaves window
      targetOffset.current = { x: 0, y: 0 };
      targetScale.current = 1;
      targetRotation.current = 0;
      
      if (!frameRef.current) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [updateAttraction, animate, isDisabled]);

  // Reset when disabled
  useEffect(() => {
    if (isDisabled && elementRef.current) {
      elementRef.current.style.transform = '';
    }
  }, [isDisabled]);

  const inlineStyles: CSSProperties = {
    display: 'inline-block',
    willChange: isDisabled ? 'auto' : 'transform',
    transition: 'transform 0.1s ease-out',
    ...style,
  };

  if (Component === 'div') {
    return <div ref={elementRef as React.RefObject<HTMLDivElement>} className={`magnetic-cursor ${className}`} style={inlineStyles}>{children}</div>;
  }
  if (Component === 'p') {
    return <p ref={elementRef as React.RefObject<HTMLParagraphElement>} className={`magnetic-cursor ${className}`} style={inlineStyles}>{children}</p>;
  }
  if (Component === 'li') {
    return <li ref={elementRef as React.RefObject<HTMLLIElement>} className={`magnetic-cursor ${className}`} style={inlineStyles}>{children}</li>;
  }
  if (Component === 'a') {
    return <a ref={elementRef as React.RefObject<HTMLAnchorElement>} className={`magnetic-cursor ${className}`} style={inlineStyles}>{children}</a>;
  }
  if (Component === 'button') {
    return <button ref={elementRef as React.RefObject<HTMLButtonElement>} className={`magnetic-cursor ${className}`} style={inlineStyles}>{children}</button>;
  }
  // Default: span
  return <span ref={elementRef as React.RefObject<HTMLSpanElement>} className={`magnetic-cursor ${className}`} style={inlineStyles}>{children}</span>;
}

/**
 * MagneticNumber - Pre-configured for stat numbers
 */
interface MagneticNumberProps extends Omit<MagneticCursorProps, 'children'> {
  value: number | string;
  prefix?: string;
  suffix?: string;
}

export function MagneticNumber({
  value,
  prefix = '',
  suffix = '',
  strength = 6,
  radius = 120,
  scale = true,
  scaleAmount = 1.03,
  ...props
}: MagneticNumberProps) {
  return (
    <MagneticCursor
      strength={strength}
      radius={radius}
      scale={scale}
      scaleAmount={scaleAmount}
      style={{ fontVariantNumeric: 'tabular-nums' }}
      {...props}
    >
      {prefix}{value}{suffix}
    </MagneticCursor>
  );
}

/**
 * MagneticBadge - Pre-configured for badges with subtle rotation
 */
export function MagneticBadge({
  children,
  strength = 5,
  radius = 100,
  rotate = true,
  rotateAmount = 2,
  scale = true,
  scaleAmount = 1.02,
  ...props
}: MagneticCursorProps) {
  return (
    <MagneticCursor
      strength={strength}
      radius={radius}
      rotate={rotate}
      rotateAmount={rotateAmount}
      scale={scale}
      scaleAmount={scaleAmount}
      {...props}
    >
      {children}
    </MagneticCursor>
  );
}

/**
 * MagneticIcon - Pre-configured for icons with stronger effect
 */
export function MagneticIcon({
  children,
  strength = 10,
  radius = 80,
  scale = true,
  scaleAmount = 1.1,
  ...props
}: MagneticCursorProps) {
  return (
    <MagneticCursor
      strength={strength}
      radius={radius}
      scale={scale}
      scaleAmount={scaleAmount}
      {...props}
    >
      {children}
    </MagneticCursor>
  );
}

/**
 * useMagneticGroup - Hook for coordinating multiple magnetic elements
 * 
 * When cursor approaches one element, others in the group can respond
 * (e.g., moving away slightly to "make room")
 */
export function useMagneticGroup(elementCount: number) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [cursorPos, setCursorPos] = useState<Vector2 | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const getGroupProps = useCallback((index: number) => ({
    onMouseEnter: () => setActiveIndex(index),
    onMouseLeave: () => setActiveIndex(null),
    'data-magnetic-active': activeIndex === index,
    'data-magnetic-index': index,
  }), [activeIndex]);

  return {
    activeIndex,
    cursorPos,
    getGroupProps,
  };
}

export default MagneticCursor;
