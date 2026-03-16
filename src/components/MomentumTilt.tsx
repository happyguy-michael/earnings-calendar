'use client';

import React, {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
  ReactNode,
  useMemo,
  CSSProperties,
} from 'react';

/**
 * MomentumTilt — Scroll-Velocity-Based 3D Card Tilt
 * 
 * Cards subtly tilt in the direction of scroll momentum, creating
 * a physical feel like they're being pushed by wind or inertia.
 * When scrolling stops, cards spring back to neutral with a satisfying settle.
 * 
 * Inspiration:
 * - iOS app switcher card physics
 * - Apple's tvOS parallax icons
 * - Premium SaaS dashboards (Linear, Raycast)
 * - 2024/2025 "physical UI" trend
 * - Figma's spring animation system
 * 
 * Features:
 * - Scroll velocity → rotateX mapping
 * - Spring-physics settle animation
 * - Subtle scale reduction during fast scroll (depth cue)
 * - Perspective-aware transforms
 * - Context provider for global momentum state
 * - Individual card opt-in with MomentumTiltCard
 * - Configurable intensity, spring tension, damping
 * - Full prefers-reduced-motion support
 * 
 * Technical Details:
 * - Uses CSS transforms for GPU acceleration
 * - Spring physics calculated in JS, applied via CSS custom props
 * - No Framer Motion dependency (native implementation)
 * - Intersection Observer for viewport-aware optimization
 */

// ============================================================================
// TYPES
// ============================================================================

interface MomentumState {
  velocity: number;
  direction: 'up' | 'down' | 'idle';
  tilt: number;        // Current tilt angle (degrees)
  scale: number;       // Current scale (0.95 - 1.0)
  settling: boolean;   // Whether currently settling after scroll stop
}

interface SpringConfig {
  tension: number;     // Spring stiffness (100-500 typical)
  friction: number;    // Damping (10-40 typical)
  mass: number;        // Mass affects inertia (0.5-2 typical)
}

// ============================================================================
// CONTEXT
// ============================================================================

const MomentumContext = createContext<MomentumState>({
  velocity: 0,
  direction: 'idle',
  tilt: 0,
  scale: 1,
  settling: false,
});

export function useMomentum() {
  return useContext(MomentumContext);
}

// ============================================================================
// SPRING PHYSICS
// ============================================================================

class SpringPhysics {
  private position: number = 0;
  private velocity: number = 0;
  private target: number = 0;
  private tension: number;
  private friction: number;
  private mass: number;
  private precision: number = 0.001;
  
  constructor(config: SpringConfig) {
    this.tension = config.tension;
    this.friction = config.friction;
    this.mass = config.mass;
  }
  
  setTarget(target: number) {
    this.target = target;
  }
  
  setPosition(position: number) {
    this.position = position;
    this.velocity = 0;
  }
  
  step(dt: number): number {
    // Spring force: F = -k * displacement
    const displacement = this.position - this.target;
    const springForce = -this.tension * displacement;
    
    // Damping force: F = -b * velocity
    const dampingForce = -this.friction * this.velocity;
    
    // Total acceleration: a = F / m
    const acceleration = (springForce + dampingForce) / this.mass;
    
    // Update velocity and position
    this.velocity += acceleration * dt;
    this.position += this.velocity * dt;
    
    return this.position;
  }
  
  isSettled(): boolean {
    const displacement = Math.abs(this.position - this.target);
    const speed = Math.abs(this.velocity);
    return displacement < this.precision && speed < this.precision;
  }
  
  getPosition(): number {
    return this.position;
  }
}

// ============================================================================
// PROVIDER
// ============================================================================

interface MomentumTiltProviderProps {
  children: ReactNode;
  /** Maximum tilt angle in degrees */
  maxTilt?: number;
  /** Minimum scale during fast scroll */
  minScale?: number;
  /** Velocity threshold to start tilt (px/ms) */
  threshold?: number;
  /** Sensitivity multiplier */
  sensitivity?: number;
  /** Spring configuration */
  spring?: Partial<SpringConfig>;
  /** Disable effect entirely */
  disabled?: boolean;
}

export function MomentumTiltProvider({
  children,
  maxTilt = 4,
  minScale = 0.98,
  threshold = 0.3,
  sensitivity = 1.5,
  spring = {},
  disabled = false,
}: MomentumTiltProviderProps) {
  const [state, setState] = useState<MomentumState>({
    velocity: 0,
    direction: 'idle',
    tilt: 0,
    scale: 1,
    settling: false,
  });
  
  // Refs for scroll tracking
  const lastScrollY = useRef(0);
  const lastTime = useRef(performance.now());
  const rafId = useRef<number>(0);
  const idleTimeout = useRef<NodeJS.Timeout | null>(null);
  const prefersReducedMotion = useRef(false);
  
  // Spring physics instances
  const tiltSpring = useRef<SpringPhysics | null>(null);
  const scaleSpring = useRef<SpringPhysics | null>(null);
  
  const springConfig = useMemo<SpringConfig>(() => ({
    tension: spring.tension ?? 180,
    friction: spring.friction ?? 20,
    mass: spring.mass ?? 1,
  }), [spring.tension, spring.friction, spring.mass]);
  
  // Initialize springs
  useEffect(() => {
    tiltSpring.current = new SpringPhysics(springConfig);
    scaleSpring.current = new SpringPhysics({
      ...springConfig,
      tension: springConfig.tension * 1.2, // Scale settles faster
    });
    scaleSpring.current.setPosition(1);
    scaleSpring.current.setTarget(1);
  }, [springConfig]);
  
  // Check reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mq.matches;
    
    const handler = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };
    
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  
  // Main scroll tracking and animation loop
  useEffect(() => {
    if (typeof window === 'undefined' || disabled || prefersReducedMotion.current) return;
    
    let isAnimating = false;
    let currentVelocity = 0;
    
    const animate = () => {
      if (!tiltSpring.current || !scaleSpring.current) return;
      
      const dt = 1/60; // ~16ms frame time
      
      const tilt = tiltSpring.current.step(dt);
      const scale = scaleSpring.current.step(dt);
      
      const tiltSettled = tiltSpring.current.isSettled();
      const scaleSettled = scaleSpring.current.isSettled();
      
      setState(prev => ({
        ...prev,
        tilt: Math.round(tilt * 1000) / 1000,
        scale: Math.round(scale * 1000) / 1000,
        settling: !tiltSettled || !scaleSettled,
      }));
      
      if (!tiltSettled || !scaleSettled) {
        rafId.current = requestAnimationFrame(animate);
      } else {
        isAnimating = false;
      }
    };
    
    const startAnimation = () => {
      if (!isAnimating) {
        isAnimating = true;
        rafId.current = requestAnimationFrame(animate);
      }
    };
    
    const handleScroll = () => {
      const now = performance.now();
      const currentScrollY = window.scrollY;
      const deltaY = currentScrollY - lastScrollY.current;
      const deltaTime = Math.max(now - lastTime.current, 1);
      
      // Calculate velocity (px/ms)
      currentVelocity = deltaY / deltaTime;
      
      lastScrollY.current = currentScrollY;
      lastTime.current = now;
      
      // Determine direction
      const direction: 'up' | 'down' | 'idle' = 
        Math.abs(currentVelocity) < threshold ? 'idle' :
        currentVelocity > 0 ? 'down' : 'up';
      
      // Calculate target tilt based on velocity
      const velocityFactor = Math.min(Math.abs(currentVelocity) * sensitivity, 1);
      const targetTilt = direction === 'idle' ? 0 :
        (direction === 'down' ? -maxTilt : maxTilt) * velocityFactor;
      
      // Calculate target scale
      const targetScale = 1 - (1 - minScale) * velocityFactor;
      
      // Update spring targets
      if (tiltSpring.current && scaleSpring.current) {
        tiltSpring.current.setTarget(targetTilt);
        scaleSpring.current.setTarget(targetScale);
      }
      
      setState(prev => ({
        ...prev,
        velocity: currentVelocity,
        direction,
      }));
      
      // Clear existing idle timeout
      if (idleTimeout.current) {
        clearTimeout(idleTimeout.current);
      }
      
      startAnimation();
      
      // Set timeout for scroll stop detection
      idleTimeout.current = setTimeout(() => {
        if (tiltSpring.current && scaleSpring.current) {
          tiltSpring.current.setTarget(0);
          scaleSpring.current.setTarget(1);
        }
        
        setState(prev => ({
          ...prev,
          velocity: 0,
          direction: 'idle',
        }));
        
        startAnimation();
      }, 100);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (idleTimeout.current) clearTimeout(idleTimeout.current);
    };
  }, [disabled, maxTilt, minScale, threshold, sensitivity]);
  
  return (
    <MomentumContext.Provider value={state}>
      {children}
    </MomentumContext.Provider>
  );
}

// ============================================================================
// CARD COMPONENT
// ============================================================================

interface MomentumTiltCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Override intensity (0-1, default 1) */
  intensity?: number;
  /** Perspective distance (px) */
  perspective?: number;
  /** Additional transform origin */
  transformOrigin?: string;
  /** Disable tilt on this specific card */
  disabled?: boolean;
  /** Add subtle shadow shift during tilt */
  dynamicShadow?: boolean;
}

export function MomentumTiltCard({
  children,
  className = '',
  style = {},
  intensity = 1,
  perspective = 1000,
  transformOrigin = 'center center',
  disabled = false,
  dynamicShadow = false,
}: MomentumTiltCardProps) {
  const momentum = useMomentum();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  
  // Intersection observer for viewport optimization
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '100px' }
    );
    
    observer.observe(card);
    return () => observer.disconnect();
  }, []);
  
  // Calculate transforms
  const shouldAnimate = isInView && !disabled && intensity > 0;
  const effectiveTilt = shouldAnimate ? momentum.tilt * intensity : 0;
  const effectiveScale = shouldAnimate ? 
    1 - (1 - momentum.scale) * intensity : 1;
  
  // Dynamic shadow based on tilt direction
  const shadowOffset = dynamicShadow ? effectiveTilt * 0.5 : 0;
  const shadowStyle = dynamicShadow ? {
    boxShadow: `
      ${shadowOffset}px ${Math.abs(shadowOffset)}px ${8 + Math.abs(effectiveTilt)}px rgba(0, 0, 0, 0.08),
      ${shadowOffset * 0.5}px ${Math.abs(shadowOffset * 0.5)}px ${4 + Math.abs(effectiveTilt) * 0.5}px rgba(0, 0, 0, 0.04)
    `,
  } : {};
  
  const combinedStyle: CSSProperties = {
    ...style,
    ...shadowStyle,
    perspective: `${perspective}px`,
    transformStyle: 'preserve-3d' as const,
    willChange: shouldAnimate ? 'transform' : 'auto',
    transform: `
      perspective(${perspective}px)
      rotateX(${effectiveTilt}deg)
      scale(${effectiveScale})
    `.trim(),
    transformOrigin,
    transition: momentum.settling ? 'none' : 'transform 0.05s linear',
  };
  
  return (
    <div
      ref={cardRef}
      className={`momentum-tilt-card ${className}`.trim()}
      style={combinedStyle}
    >
      {children}
    </div>
  );
}

// ============================================================================
// CONTENT WRAPPER (shifts content opposite to tilt for parallax depth)
// ============================================================================

interface MomentumTiltContentProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Content shift intensity (0-1) */
  intensity?: number;
  /** Maximum Y shift in pixels */
  maxShift?: number;
}

export function MomentumTiltContent({
  children,
  className = '',
  style = {},
  intensity = 0.5,
  maxShift = 4,
}: MomentumTiltContentProps) {
  const momentum = useMomentum();
  
  // Shift content opposite to tilt direction for parallax effect
  const shift = -momentum.tilt * (maxShift / 4) * intensity;
  
  const combinedStyle: CSSProperties = {
    ...style,
    transform: `translateY(${shift}px)`,
    transition: momentum.settling ? 'none' : 'transform 0.05s linear',
  };
  
  return (
    <div className={className} style={combinedStyle}>
      {children}
    </div>
  );
}

// ============================================================================
// DEBUG INDICATOR
// ============================================================================

interface MomentumDebugProps {
  show?: boolean;
}

export function MomentumDebug({ show = false }: MomentumDebugProps) {
  const momentum = useMomentum();
  
  if (!show) return null;
  
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1rem',
        left: '1rem',
        padding: '0.75rem 1rem',
        background: 'rgba(0, 0, 0, 0.85)',
        color: '#fff',
        fontSize: '11px',
        fontFamily: 'ui-monospace, monospace',
        borderRadius: '8px',
        zIndex: 9999,
        backdropFilter: 'blur(8px)',
        minWidth: '160px',
      }}
    >
      <div style={{ marginBottom: '4px', opacity: 0.6 }}>MomentumTilt</div>
      <div>velocity: {momentum.velocity.toFixed(3)}</div>
      <div>direction: {momentum.direction}</div>
      <div>tilt: {momentum.tilt.toFixed(2)}°</div>
      <div>scale: {momentum.scale.toFixed(3)}</div>
      <div>settling: {momentum.settling ? '✓' : '—'}</div>
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export { MomentumContext };
export type { MomentumState, SpringConfig, MomentumTiltProviderProps, MomentumTiltCardProps };
