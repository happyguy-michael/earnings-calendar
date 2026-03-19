'use client';

import React, {
  createContext,
  useContext,
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { useMotionPreferences } from './MotionPreferences';

/**
 * MagneticField - 2026 UI Trend Component
 * 
 * Creates a gravitational/magnetic field where child elements subtly
 * attract toward the cursor as it moves nearby. Inspired by Dia app's
 * "drop targets gravitate toward cursor" interaction pattern.
 * 
 * References:
 * - Pixelmatters "7 UI design trends to watch in 2026"
 * - Dia app's magnetic drag targets
 * - Apple's subtle interface physics
 * - Linear's magnetic button interactions
 * 
 * Features:
 * - Configurable field radius and strength
 * - Spring-based physics for natural movement
 * - Performance optimized with RAF and throttling
 * - Respects prefers-reduced-motion
 * - Touch/mobile support
 * - Multiple field modes: attract, repel, orbit
 */

interface Vector2 {
  x: number;
  y: number;
}

interface MagneticFieldContextValue {
  cursorPos: Vector2 | null;
  fieldRadius: number;
  fieldStrength: number;
  springStiffness: number;
  springDamping: number;
  mode: 'attract' | 'repel' | 'orbit';
  enabled: boolean;
}

const MagneticFieldContext = createContext<MagneticFieldContextValue | null>(null);

export interface MagneticFieldProviderProps {
  children: ReactNode;
  /** Radius of the magnetic field effect in pixels (default: 300) */
  fieldRadius?: number;
  /** Strength of the magnetic pull (0-1, default: 0.15) */
  fieldStrength?: number;
  /** Spring stiffness for animation (default: 150) */
  springStiffness?: number;
  /** Spring damping for animation (default: 15) */
  springDamping?: number;
  /** Field behavior mode (default: 'attract') */
  mode?: 'attract' | 'repel' | 'orbit';
  /** Enable/disable the effect (default: true) */
  enabled?: boolean;
  /** Additional class name for the container */
  className?: string;
  /** Throttle cursor updates in ms (default: 16 for ~60fps) */
  throttleMs?: number;
}

/**
 * MagneticFieldProvider - Wrap around a group of cards to enable magnetic effect
 */
export function MagneticFieldProvider({
  children,
  fieldRadius = 300,
  fieldStrength = 0.15,
  springStiffness = 150,
  springDamping = 15,
  mode = 'attract',
  enabled = true,
  className = '',
  throttleMs = 16,
}: MagneticFieldProviderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cursorPos, setCursorPos] = useState<Vector2 | null>(null);
  const lastUpdateRef = useRef(0);
  const { shouldAnimate } = useMotionPreferences();
  const reducedMotion = !shouldAnimate('decorative');

  // Track cursor position within container
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!enabled || reducedMotion) return;
      
      const now = performance.now();
      if (now - lastUpdateRef.current < throttleMs) return;
      lastUpdateRef.current = now;

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      setCursorPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    },
    [enabled, reducedMotion, throttleMs]
  );

  const handleMouseLeave = useCallback(() => {
    setCursorPos(null);
  }, []);

  // Touch support
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!enabled || reducedMotion || e.touches.length === 0) return;
      
      const now = performance.now();
      if (now - lastUpdateRef.current < throttleMs) return;
      lastUpdateRef.current = now;

      const container = containerRef.current;
      if (!container) return;

      const touch = e.touches[0];
      const rect = container.getBoundingClientRect();
      setCursorPos({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      });
    },
    [enabled, reducedMotion, throttleMs]
  );

  const handleTouchEnd = useCallback(() => {
    setCursorPos(null);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled || reducedMotion) return;

    container.addEventListener('mousemove', handleMouseMove, { passive: true });
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, reducedMotion, handleMouseMove, handleMouseLeave, handleTouchMove, handleTouchEnd]);

  const contextValue = useMemo<MagneticFieldContextValue>(
    () => ({
      cursorPos: reducedMotion ? null : cursorPos,
      fieldRadius,
      fieldStrength,
      springStiffness,
      springDamping,
      mode,
      enabled: enabled && !reducedMotion,
    }),
    [cursorPos, fieldRadius, fieldStrength, springStiffness, springDamping, mode, enabled, reducedMotion]
  );

  return (
    <MagneticFieldContext.Provider value={contextValue}>
      <div ref={containerRef} className={`magnetic-field-container ${className}`}>
        {children}
      </div>
    </MagneticFieldContext.Provider>
  );
}

export interface MagneticCardProps {
  children: ReactNode;
  /** Override the field strength for this card (0-1) */
  strength?: number;
  /** Disable magnetic effect for this card */
  disabled?: boolean;
  /** Additional class name */
  className?: string;
  /** Card's z-index layer affects strength (higher = stronger pull) */
  layer?: number;
  /** Apply subtle rotation toward cursor */
  rotate?: boolean;
  /** Maximum rotation in degrees (default: 3) */
  maxRotation?: number;
  /** Apply subtle scale on proximity */
  scale?: boolean;
  /** Maximum scale factor (default: 1.02) */
  maxScale?: number;
}

/**
 * MagneticCard - Child element that responds to the magnetic field
 */
export function MagneticCard({
  children,
  strength,
  disabled = false,
  className = '',
  layer = 1,
  rotate = true,
  maxRotation = 3,
  scale = false,
  maxScale = 1.02,
}: MagneticCardProps) {
  const context = useContext(MagneticFieldContext);
  const cardRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  
  // Spring animation state
  const currentPosRef = useRef<Vector2>({ x: 0, y: 0 });
  const velocityRef = useRef<Vector2>({ x: 0, y: 0 });
  const targetPosRef = useRef<Vector2>({ x: 0, y: 0 });
  const currentRotationRef = useRef<Vector2>({ x: 0, y: 0 });
  const currentScaleRef = useRef(1);

  const calculateTarget = useCallback(() => {
    if (!context || !context.enabled || disabled || !context.cursorPos || !cardRef.current) {
      targetPosRef.current = { x: 0, y: 0 };
      return { proximity: 0, angle: 0 };
    }

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const parent = card.offsetParent as HTMLElement;
    const parentRect = parent?.getBoundingClientRect() || { left: 0, top: 0 };

    // Card center relative to magnetic field container
    const cardCenterX = rect.left - parentRect.left + rect.width / 2;
    const cardCenterY = rect.top - parentRect.top + rect.height / 2;

    // Vector from card to cursor
    const dx = context.cursorPos.x - cardCenterX;
    const dy = context.cursorPos.y - cardCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    // Calculate proximity (0-1, 1 = closest)
    const proximity = Math.max(0, 1 - distance / context.fieldRadius);

    if (proximity <= 0) {
      targetPosRef.current = { x: 0, y: 0 };
      return { proximity: 0, angle };
    }

    // Apply easing to proximity for smoother falloff
    const easedProximity = easeOutCubic(proximity);
    
    // Calculate magnetic pull
    const effectiveStrength = (strength ?? context.fieldStrength) * layer;
    const pullStrength = easedProximity * effectiveStrength * 40; // Max 40px at full strength

    let targetX = 0;
    let targetY = 0;

    switch (context.mode) {
      case 'attract':
        // Pull toward cursor
        targetX = Math.cos(angle) * pullStrength;
        targetY = Math.sin(angle) * pullStrength;
        break;
      case 'repel':
        // Push away from cursor
        targetX = -Math.cos(angle) * pullStrength;
        targetY = -Math.sin(angle) * pullStrength;
        break;
      case 'orbit':
        // Perpendicular movement (orbit around cursor)
        targetX = Math.cos(angle + Math.PI / 2) * pullStrength * 0.5;
        targetY = Math.sin(angle + Math.PI / 2) * pullStrength * 0.5;
        break;
    }

    targetPosRef.current = { x: targetX, y: targetY };
    return { proximity: easedProximity, angle };
  }, [context, disabled, strength, layer]);

  // Spring physics animation loop
  useEffect(() => {
    if (!context?.enabled || disabled) {
      // Reset transform when disabled
      if (cardRef.current) {
        cardRef.current.style.transform = '';
      }
      return;
    }

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1); // Cap at 100ms
      lastTime = currentTime;

      const { proximity, angle } = calculateTarget();
      const target = targetPosRef.current;

      // Spring physics
      const stiffness = context.springStiffness;
      const damping = context.springDamping;

      // Calculate spring force
      const springForceX = (target.x - currentPosRef.current.x) * stiffness;
      const springForceY = (target.y - currentPosRef.current.y) * stiffness;

      // Apply damping
      velocityRef.current.x += springForceX * deltaTime;
      velocityRef.current.y += springForceY * deltaTime;
      velocityRef.current.x *= Math.pow(1 - damping * 0.01, deltaTime * 60);
      velocityRef.current.y *= Math.pow(1 - damping * 0.01, deltaTime * 60);

      // Update position
      currentPosRef.current.x += velocityRef.current.x * deltaTime;
      currentPosRef.current.y += velocityRef.current.y * deltaTime;

      // Calculate rotation toward cursor
      let rotateX = 0;
      let rotateY = 0;
      if (rotate && proximity > 0) {
        const rotationStrength = proximity * maxRotation;
        rotateX = -Math.sin(angle) * rotationStrength;
        rotateY = Math.cos(angle) * rotationStrength;
        
        // Smooth rotation with spring
        currentRotationRef.current.x += (rotateX - currentRotationRef.current.x) * 0.1;
        currentRotationRef.current.y += (rotateY - currentRotationRef.current.y) * 0.1;
      } else {
        currentRotationRef.current.x *= 0.9;
        currentRotationRef.current.y *= 0.9;
      }

      // Calculate scale
      let scaleValue = 1;
      if (scale && proximity > 0) {
        scaleValue = 1 + proximity * (maxScale - 1);
        currentScaleRef.current += (scaleValue - currentScaleRef.current) * 0.15;
      } else {
        currentScaleRef.current += (1 - currentScaleRef.current) * 0.15;
      }

      // Apply transform
      if (cardRef.current) {
        const x = currentPosRef.current.x.toFixed(2);
        const y = currentPosRef.current.y.toFixed(2);
        const rx = currentRotationRef.current.x.toFixed(2);
        const ry = currentRotationRef.current.y.toFixed(2);
        const s = currentScaleRef.current.toFixed(4);

        cardRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) rotateX(${rx}deg) rotateY(${ry}deg) scale(${s})`;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [context, disabled, calculateTarget, rotate, maxRotation, scale, maxScale]);

  return (
    <div
      ref={cardRef}
      className={`magnetic-card ${className}`}
      style={{
        willChange: 'transform',
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </div>
  );
}

// Easing function for smooth falloff
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * useMagneticField - Hook for custom magnetic interactions
 */
export function useMagneticField() {
  const context = useContext(MagneticFieldContext);
  
  return {
    cursorPos: context?.cursorPos ?? null,
    fieldRadius: context?.fieldRadius ?? 300,
    fieldStrength: context?.fieldStrength ?? 0.15,
    mode: context?.mode ?? 'attract',
    enabled: context?.enabled ?? false,
  };
}

/**
 * Pre-configured variants
 */

export function MagneticFieldSubtle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <MagneticFieldProvider
      fieldRadius={200}
      fieldStrength={0.08}
      springStiffness={180}
      springDamping={18}
      className={className}
    >
      {children}
    </MagneticFieldProvider>
  );
}

export function MagneticFieldStrong({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <MagneticFieldProvider
      fieldRadius={400}
      fieldStrength={0.25}
      springStiffness={120}
      springDamping={12}
      className={className}
    >
      {children}
    </MagneticFieldProvider>
  );
}

export function MagneticFieldRepel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <MagneticFieldProvider
      fieldRadius={250}
      fieldStrength={0.12}
      mode="repel"
      springStiffness={200}
      springDamping={20}
      className={className}
    >
      {children}
    </MagneticFieldProvider>
  );
}
