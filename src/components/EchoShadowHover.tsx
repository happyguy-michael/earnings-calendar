'use client';

import { ReactNode, useRef, useState, useCallback, useEffect } from 'react';

interface EchoShadowHoverProps {
  children: ReactNode;
  /** Number of echo layers (default: 3) */
  layers?: number;
  /** Maximum offset in pixels (default: 8) */
  maxOffset?: number;
  /** Echo color (default: currentColor with opacity) */
  echoColor?: string;
  /** Animation duration in ms (default: 400) */
  duration?: number;
  /** Stagger delay between layers in ms (default: 50) */
  stagger?: number;
  /** Direction of echo: 'down' | 'up' | 'out' | 'diagonal' */
  direction?: 'down' | 'up' | 'out' | 'diagonal';
  /** Additional className */
  className?: string;
  /** Enable glow effect on hover */
  glow?: boolean;
  /** Glow color */
  glowColor?: string;
}

/**
 * EchoShadowHover - Creates layered afterimage shadows on hover
 * 
 * Inspired by:
 * - Tectonic stacked tooltip from FreeFrontend
 * - Ghost text vertical shadow effects
 * - 2026 "depth without 3D" UI trend
 * 
 * Features:
 * - Multiple staggered shadow layers that expand on hover
 * - Configurable direction (down, up, outward, diagonal)
 * - Each layer has decreasing opacity for depth effect
 * - Spring-based timing for organic feel
 * - Glow option for emphasis
 * - Fully respects prefers-reduced-motion
 * - GPU-accelerated transforms
 */
export function EchoShadowHover({
  children,
  layers = 3,
  maxOffset = 8,
  echoColor,
  duration = 400,
  stagger = 50,
  direction = 'down',
  className = '',
  glow = false,
  glowColor = 'rgba(59, 130, 246, 0.3)',
}: EchoShadowHoverProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  // Calculate offset for each layer based on direction
  const getLayerOffset = (layerIndex: number, total: number) => {
    const progress = (layerIndex + 1) / total;
    const offset = maxOffset * progress;

    switch (direction) {
      case 'down':
        return { x: 0, y: offset };
      case 'up':
        return { x: 0, y: -offset };
      case 'out':
        // Expands in all directions
        return { x: 0, y: 0, scale: 1 + progress * 0.03 };
      case 'diagonal':
        return { x: offset * 0.7, y: offset };
      default:
        return { x: 0, y: offset };
    }
  };

  // Calculate opacity for each layer (decreasing)
  const getLayerOpacity = (layerIndex: number, total: number) => {
    const base = 0.15;
    const decay = 0.6; // Each layer is 60% of the previous
    return base * Math.pow(decay, layerIndex);
  };

  // Generate CSS custom properties for the layers
  const layerStyles = Array.from({ length: layers }, (_, i) => {
    const offset = getLayerOffset(i, layers);
    const opacity = getLayerOpacity(i, layers);
    const delay = i * stagger;
    
    return {
      '--echo-x': `${offset.x}px`,
      '--echo-y': `${offset.y}px`,
      '--echo-scale': offset.scale ?? 1,
      '--echo-opacity': isHovered && !prefersReducedMotion ? opacity : 0,
      '--echo-delay': `${delay}ms`,
      '--echo-duration': `${duration}ms`,
    };
  });

  return (
    <div
      ref={containerRef}
      className={`echo-shadow-hover ${isHovered ? 'is-hovered' : ''} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        '--echo-glow-color': glowColor,
        '--echo-layers': layers,
        '--echo-color': echoColor ?? 'var(--border-primary, rgba(255,255,255,0.1))',
      } as React.CSSProperties}
    >
      {/* Echo shadow layers (rendered behind content) */}
      <div className="echo-shadow-layers" aria-hidden="true">
        {layerStyles.map((style, i) => (
          <div
            key={i}
            className={`echo-shadow-layer echo-shadow-layer-${i + 1}`}
            style={style as React.CSSProperties}
          />
        ))}
      </div>
      
      {/* Glow layer */}
      {glow && (
        <div 
          className={`echo-shadow-glow ${isHovered ? 'active' : ''}`}
          aria-hidden="true"
        />
      )}
      
      {/* Content */}
      <div className="echo-shadow-content">
        {children}
      </div>
    </div>
  );
}

/**
 * EchoShadowCard - Preset for card-style echo effect
 */
export function EchoShadowCard({
  children,
  className = '',
  variant = 'default',
}: {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'beat' | 'miss' | 'pending';
}) {
  const colors = {
    default: undefined,
    beat: 'rgba(34, 197, 94, 0.15)',
    miss: 'rgba(239, 68, 68, 0.15)',
    pending: 'rgba(59, 130, 246, 0.15)',
  };

  const glowColors = {
    default: 'rgba(59, 130, 246, 0.2)',
    beat: 'rgba(34, 197, 94, 0.25)',
    miss: 'rgba(239, 68, 68, 0.2)',
    pending: 'rgba(59, 130, 246, 0.2)',
  };

  return (
    <EchoShadowHover
      layers={4}
      maxOffset={6}
      direction="diagonal"
      stagger={40}
      duration={350}
      echoColor={colors[variant]}
      glow={variant !== 'default'}
      glowColor={glowColors[variant]}
      className={`echo-shadow-card ${className}`}
    >
      {children}
    </EchoShadowHover>
  );
}

/**
 * PulsingEcho - Continuous pulsing echo effect (for attention)
 */
export function PulsingEcho({
  children,
  className = '',
  color = 'rgba(59, 130, 246, 0.15)',
  interval = 2000,
}: {
  children: ReactNode;
  className?: string;
  color?: string;
  interval?: number;
}) {
  const [pulse, setPulse] = useState(false);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    }, interval);
    
    return () => clearInterval(timer);
  }, [interval]);

  return (
    <div 
      className={`pulsing-echo ${pulse ? 'pulsing' : ''} ${className}`}
      style={{ '--pulse-color': color } as React.CSSProperties}
    >
      <div className="pulsing-echo-ring" aria-hidden="true" />
      <div className="pulsing-echo-ring pulsing-echo-ring-2" aria-hidden="true" />
      {children}
    </div>
  );
}

export default EchoShadowHover;
