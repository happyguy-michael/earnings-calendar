'use client';

import { useRef, useState, useEffect, useCallback, ReactNode, createContext, useContext } from 'react';

/**
 * DepthHover - Physics-Based Card Depth Effect
 * 
 * Inspired by:
 * - Linear.app's card interactions
 * - Stripe Dashboard card hover states
 * - iOS 26 Liquid Glass depth perception
 * - Premium fintech dashboard patterns
 * 
 * Creates a tactile 3D depth illusion where:
 * - Hovered card lifts up with enhanced shadow
 * - Neighboring cards subtly sink
 * - Spring physics for smooth, natural transitions
 * - Shadows dynamically adjust based on lift height
 * 
 * Usage:
 * <DepthHoverContainer>
 *   <DepthHover><Card>...</Card></DepthHover>
 *   <DepthHover><Card>...</Card></DepthHover>
 * </DepthHoverContainer>
 * 
 * Or standalone:
 * <DepthHover standalone><Card>...</Card></DepthHover>
 */

// Context for coordinating neighboring card effects
interface DepthHoverContextValue {
  registerCard: (id: string, element: HTMLElement) => void;
  unregisterCard: (id: string) => void;
  setHoveredCard: (id: string | null) => void;
  hoveredCardId: string | null;
  getDepthOffset: (id: string) => number;
}

const DepthHoverContext = createContext<DepthHoverContextValue | null>(null);

interface DepthHoverContainerProps {
  children: ReactNode;
  /** Maximum sink depth for neighbors (px) */
  neighborSinkDepth?: number;
  /** How far the effect spreads (number of neighbors affected) */
  effectRadius?: number;
  /** Enable debug visualization */
  debug?: boolean;
  className?: string;
}

/**
 * Container that coordinates depth effects between sibling cards
 */
export function DepthHoverContainer({
  children,
  neighborSinkDepth = 2,
  effectRadius = 2,
  debug = false,
  className = '',
}: DepthHoverContainerProps) {
  const cardsRef = useRef<Map<string, HTMLElement>>(new Map());
  const [hoveredCardId, setHoveredCard] = useState<string | null>(null);
  const [cardOrder, setCardOrder] = useState<string[]>([]);

  // Register a card with its DOM element
  const registerCard = useCallback((id: string, element: HTMLElement) => {
    cardsRef.current.set(id, element);
    // Update order based on DOM position
    setCardOrder(Array.from(cardsRef.current.entries())
      .sort(([, a], [, b]) => {
        const rectA = a.getBoundingClientRect();
        const rectB = b.getBoundingClientRect();
        return rectA.top - rectB.top || rectA.left - rectB.left;
      })
      .map(([id]) => id)
    );
  }, []);

  const unregisterCard = useCallback((id: string) => {
    cardsRef.current.delete(id);
    setCardOrder(prev => prev.filter(cardId => cardId !== id));
  }, []);

  // Calculate depth offset for a card based on distance from hovered card
  const getDepthOffset = useCallback((id: string): number => {
    if (!hoveredCardId || hoveredCardId === id) return 0;
    
    const hoveredIndex = cardOrder.indexOf(hoveredCardId);
    const cardIndex = cardOrder.indexOf(id);
    
    if (hoveredIndex === -1 || cardIndex === -1) return 0;
    
    const distance = Math.abs(cardIndex - hoveredIndex);
    
    if (distance > effectRadius) return 0;
    
    // Inverse square falloff for natural feel
    const normalizedDistance = distance / effectRadius;
    const falloff = 1 - (normalizedDistance * normalizedDistance);
    
    return neighborSinkDepth * falloff;
  }, [hoveredCardId, cardOrder, neighborSinkDepth, effectRadius]);

  const contextValue: DepthHoverContextValue = {
    registerCard,
    unregisterCard,
    setHoveredCard,
    hoveredCardId,
    getDepthOffset,
  };

  return (
    <DepthHoverContext.Provider value={contextValue}>
      <div 
        className={`depth-hover-container ${className}`}
        data-debug={debug}
      >
        {children}
      </div>
    </DepthHoverContext.Provider>
  );
}

interface DepthHoverProps {
  children: ReactNode;
  /** Lift height when hovered (px) */
  liftHeight?: number;
  /** Scale increase when hovered (1.0 = no scale) */
  hoverScale?: number;
  /** Base shadow blur (px) */
  shadowBlur?: number;
  /** Shadow spread when lifted (px) */
  shadowSpread?: number;
  /** Shadow color */
  shadowColor?: string;
  /** Spring stiffness (higher = snappier) */
  stiffness?: number;
  /** Spring damping (higher = less bounce) */
  damping?: number;
  /** Enable standalone mode (no container needed) */
  standalone?: boolean;
  /** Border radius to preserve */
  borderRadius?: number | string;
  /** Additional class */
  className?: string;
  /** Disable the effect */
  disabled?: boolean;
  /** Z-index when lifted */
  liftedZIndex?: number;
}

let cardIdCounter = 0;
const generateCardId = () => `depth-card-${++cardIdCounter}`;

export function DepthHover({
  children,
  liftHeight = 8,
  hoverScale = 1.02,
  shadowBlur = 20,
  shadowSpread = 8,
  shadowColor = 'rgba(0, 0, 0, 0.25)',
  stiffness = 300,
  damping = 25,
  standalone = false,
  borderRadius,
  className = '',
  disabled = false,
  liftedZIndex = 10,
}: DepthHoverProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const cardIdRef = useRef<string>(generateCardId());
  const context = useContext(DepthHoverContext);
  
  const [isHovering, setIsHovering] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  // Spring animation state
  const animationRef = useRef<number | null>(null);
  const currentStateRef = useRef({ y: 0, scale: 1, shadowBlur: 0, shadowSpread: 0, opacity: 0 });
  const targetStateRef = useRef({ y: 0, scale: 1, shadowBlur: 0, shadowSpread: 0, opacity: 0 });
  const velocityRef = useRef({ y: 0, scale: 0, shadowBlur: 0, shadowSpread: 0, opacity: 0 });

  // Check reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Register with container context
  useEffect(() => {
    if (!context || !elementRef.current) return;
    
    const id = cardIdRef.current;
    context.registerCard(id, elementRef.current);
    
    return () => context.unregisterCard(id);
  }, [context]);

  // Get neighbor sink offset from context
  const neighborOffset = context ? context.getDepthOffset(cardIdRef.current) : 0;
  const isLifted = context ? context.hoveredCardId === cardIdRef.current : isHovering;

  // Update target state based on hover and neighbor effects
  useEffect(() => {
    if (disabled || prefersReducedMotion) {
      targetStateRef.current = { y: 0, scale: 1, shadowBlur: 0, shadowSpread: 0, opacity: 0 };
      return;
    }

    if (isLifted) {
      // Lifted state - card rises up
      targetStateRef.current = {
        y: -liftHeight,
        scale: hoverScale,
        shadowBlur: shadowBlur,
        shadowSpread: shadowSpread,
        opacity: 1,
      };
    } else if (neighborOffset > 0) {
      // Neighbor sink state - card sinks slightly
      targetStateRef.current = {
        y: neighborOffset,
        scale: 1 - (neighborOffset * 0.002), // Subtle scale reduction
        shadowBlur: 0,
        shadowSpread: 0,
        opacity: 0,
      };
    } else {
      // Rest state
      targetStateRef.current = { y: 0, scale: 1, shadowBlur: 0, shadowSpread: 0, opacity: 0 };
    }
  }, [isLifted, neighborOffset, disabled, prefersReducedMotion, liftHeight, hoverScale, shadowBlur, shadowSpread]);

  // Spring physics animation loop
  useEffect(() => {
    if (prefersReducedMotion) return;

    const animate = () => {
      const current = currentStateRef.current;
      const target = targetStateRef.current;
      const velocity = velocityRef.current;
      
      // Spring physics for each property
      const dt = 1 / 60; // Assume 60fps
      const springForce = stiffness;
      const dampingForce = damping;
      
      // Calculate spring forces
      const keys = ['y', 'scale', 'shadowBlur', 'shadowSpread', 'opacity'] as const;
      let needsUpdate = false;
      
      for (const key of keys) {
        const displacement = target[key] - current[key];
        const springAcc = displacement * springForce;
        const dampingAcc = -velocity[key] * dampingForce;
        const acceleration = springAcc + dampingAcc;
        
        velocity[key] += acceleration * dt;
        current[key] += velocity[key] * dt;
        
        // Check if still animating (threshold for stopping)
        if (Math.abs(displacement) > 0.01 || Math.abs(velocity[key]) > 0.01) {
          needsUpdate = true;
        }
      }
      
      // Apply transforms
      if (elementRef.current) {
        const el = elementRef.current;
        el.style.transform = `translateY(${current.y}px) scale(${current.scale})`;
        el.style.setProperty('--depth-shadow-blur', `${current.shadowBlur}px`);
        el.style.setProperty('--depth-shadow-spread', `${current.shadowSpread}px`);
        el.style.setProperty('--depth-shadow-opacity', `${current.opacity}`);
        el.style.zIndex = current.y < -1 ? String(liftedZIndex) : '';
      }
      
      if (needsUpdate) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [stiffness, damping, prefersReducedMotion, liftedZIndex]);

  // Mouse handlers
  const handleMouseEnter = useCallback(() => {
    if (disabled) return;
    setIsHovering(true);
    if (context) {
      context.setHoveredCard(cardIdRef.current);
    }
  }, [context, disabled]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    if (context) {
      context.setHoveredCard(null);
    }
  }, [context]);

  // Reduced motion: simple CSS transition
  if (prefersReducedMotion) {
    return (
      <div
        ref={elementRef}
        className={`depth-hover depth-hover-reduced ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          borderRadius,
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      ref={elementRef}
      className={`depth-hover ${isLifted ? 'depth-hover-lifted' : ''} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        '--depth-shadow-color': shadowColor,
        '--depth-shadow-blur': '0px',
        '--depth-shadow-spread': '0px',
        '--depth-shadow-opacity': '0',
        willChange: 'transform',
        transform: 'translateY(0) scale(1)',
        transition: 'none',
        borderRadius,
      } as React.CSSProperties}
    >
      {children}
      
      {/* Shadow layer - separate for performance */}
      <div 
        className="depth-hover-shadow"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: borderRadius || 'inherit',
          pointerEvents: 'none',
          boxShadow: `0 var(--depth-shadow-spread) var(--depth-shadow-blur) var(--depth-shadow-color)`,
          opacity: 'var(--depth-shadow-opacity)',
          zIndex: -1,
        }}
      />
    </div>
  );
}

// CSS styles (add to globals.css)
export const depthHoverStyles = `
.depth-hover {
  position: relative;
  cursor: pointer;
}

.depth-hover-container {
  /* Ensure proper stacking context */
  position: relative;
}

.depth-hover-lifted {
  /* Lifted cards get higher z-index for proper layering */
}

.depth-hover-shadow {
  /* Hardware acceleration for shadow layer */
  will-change: opacity, box-shadow;
}

/* Reduced motion - simple opacity change */
.depth-hover-reduced {
  transition: opacity 0.15s ease;
}

.depth-hover-reduced:hover {
  opacity: 0.95;
}

/* Dark mode shadow adjustments */
@media (prefers-color-scheme: dark) {
  .depth-hover {
    --depth-shadow-color: rgba(0, 0, 0, 0.4);
  }
}

/* Light mode shadow adjustments */
html.light .depth-hover {
  --depth-shadow-color: rgba(0, 0, 0, 0.12);
}
`;
