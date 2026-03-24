'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface DepthLayer {
  /** Gradient or color for this layer */
  gradient: string;
  /** How fast this layer moves relative to scroll (0-1, lower = slower = appears further) */
  speed: number;
  /** Opacity of this layer (0-1) */
  opacity: number;
  /** Blur amount in pixels (higher = more atmospheric) */
  blur?: number;
  /** Scale factor (layers can be slightly larger to avoid edge gaps) */
  scale?: number;
}

interface ScrollDepthLayersProps {
  /** Custom layer configuration (overrides preset) */
  layers?: DepthLayer[];
  /** Preset layer configuration */
  preset?: 'aurora' | 'ocean' | 'sunset' | 'night' | 'minimal';
  /** Maximum parallax offset in pixels */
  maxOffset?: number;
  /** Enable smooth damping (spring-like follow) */
  damping?: boolean;
  /** Damping factor (0-1, lower = more smooth) */
  dampingFactor?: number;
  /** Disable on reduced motion preference */
  respectReducedMotion?: boolean;
  /** Additional class name */
  className?: string;
  /** Show debug overlay with scroll info */
  debug?: boolean;
}

const LAYER_PRESETS: Record<string, DepthLayer[]> = {
  aurora: [
    // Deepest layer - distant aurora glow
    {
      gradient: 'radial-gradient(ellipse 120% 80% at 30% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 60%)',
      speed: 0.1,
      opacity: 0.8,
      blur: 60,
      scale: 1.1,
    },
    // Mid layer - purple/cyan blend
    {
      gradient: 'radial-gradient(ellipse 100% 100% at 70% 60%, rgba(34, 211, 238, 0.12) 0%, transparent 50%)',
      speed: 0.25,
      opacity: 0.7,
      blur: 40,
      scale: 1.08,
    },
    // Closer layer - accent highlights
    {
      gradient: 'radial-gradient(ellipse 80% 60% at 50% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 45%)',
      speed: 0.4,
      opacity: 0.6,
      blur: 25,
      scale: 1.05,
    },
    // Nearest layer - subtle surface glow
    {
      gradient: 'radial-gradient(ellipse 60% 40% at 80% 30%, rgba(236, 72, 153, 0.08) 0%, transparent 40%)',
      speed: 0.6,
      opacity: 0.5,
      blur: 15,
      scale: 1.02,
    },
  ],
  ocean: [
    {
      gradient: 'radial-gradient(ellipse 150% 100% at 20% 100%, rgba(6, 182, 212, 0.2) 0%, transparent 50%)',
      speed: 0.08,
      opacity: 0.9,
      blur: 80,
      scale: 1.15,
    },
    {
      gradient: 'radial-gradient(ellipse 120% 80% at 80% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 45%)',
      speed: 0.2,
      opacity: 0.7,
      blur: 50,
      scale: 1.1,
    },
    {
      gradient: 'radial-gradient(ellipse 80% 60% at 40% 50%, rgba(20, 184, 166, 0.12) 0%, transparent 40%)',
      speed: 0.35,
      opacity: 0.6,
      blur: 30,
      scale: 1.05,
    },
  ],
  sunset: [
    {
      gradient: 'radial-gradient(ellipse 140% 100% at 50% 120%, rgba(251, 146, 60, 0.18) 0%, transparent 50%)',
      speed: 0.1,
      opacity: 0.85,
      blur: 70,
      scale: 1.12,
    },
    {
      gradient: 'radial-gradient(ellipse 100% 80% at 80% 0%, rgba(244, 63, 94, 0.15) 0%, transparent 45%)',
      speed: 0.22,
      opacity: 0.7,
      blur: 45,
      scale: 1.08,
    },
    {
      gradient: 'radial-gradient(ellipse 70% 50% at 20% 60%, rgba(249, 115, 22, 0.1) 0%, transparent 40%)',
      speed: 0.4,
      opacity: 0.55,
      blur: 25,
      scale: 1.04,
    },
  ],
  night: [
    {
      gradient: 'radial-gradient(ellipse 130% 90% at 70% 10%, rgba(99, 102, 241, 0.12) 0%, transparent 50%)',
      speed: 0.08,
      opacity: 0.7,
      blur: 70,
      scale: 1.12,
    },
    {
      gradient: 'radial-gradient(ellipse 100% 70% at 30% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 45%)',
      speed: 0.18,
      opacity: 0.6,
      blur: 50,
      scale: 1.08,
    },
    {
      gradient: 'radial-gradient(ellipse 60% 40% at 60% 40%, rgba(167, 139, 250, 0.08) 0%, transparent 35%)',
      speed: 0.32,
      opacity: 0.5,
      blur: 30,
      scale: 1.04,
    },
  ],
  minimal: [
    {
      gradient: 'radial-gradient(ellipse 120% 80% at 50% 30%, rgba(113, 113, 122, 0.08) 0%, transparent 50%)',
      speed: 0.12,
      opacity: 0.6,
      blur: 50,
      scale: 1.1,
    },
    {
      gradient: 'radial-gradient(ellipse 80% 60% at 30% 70%, rgba(161, 161, 170, 0.06) 0%, transparent 40%)',
      speed: 0.28,
      opacity: 0.5,
      blur: 30,
      scale: 1.05,
    },
  ],
};

/**
 * ScrollDepthLayers - Multi-layer parallax background for depth perception
 * 
 * Creates a sense of depth by moving gradient layers at different speeds
 * as the user scrolls. Inspired by Apple's parallax wallpapers and
 * 2026's "Spatial UI" design trend.
 * 
 * Features:
 * - Multiple gradient layers moving at different scroll speeds
 * - Smooth damping for natural, spring-like movement
 * - Blur increases with "distance" for atmospheric depth
 * - GPU-accelerated with transform + will-change
 * - Respects prefers-reduced-motion
 * - Multiple preset themes (aurora, ocean, sunset, night, minimal)
 * 
 * Usage:
 * ```tsx
 * // Place as first child of your page container
 * <ScrollDepthLayers preset="aurora" maxOffset={200} damping />
 * ```
 */
export function ScrollDepthLayers({
  layers: customLayers,
  preset = 'aurora',
  maxOffset = 150,
  damping = true,
  dampingFactor = 0.08,
  respectReducedMotion = true,
  className = '',
  debug = false,
}: ScrollDepthLayersProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollRef = useRef(0);
  const targetScrollRef = useRef(0);
  const rafRef = useRef<number | undefined>(undefined);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [debugInfo, setDebugInfo] = useState({ scroll: 0, offset: 0 });

  // Get layers from preset or custom
  const layers = customLayers || LAYER_PRESETS[preset] || LAYER_PRESETS.aurora;

  // Check for reduced motion preference
  useEffect(() => {
    if (!respectReducedMotion) return;
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [respectReducedMotion]);

  // Animation loop with damping
  const animate = useCallback(() => {
    if (reducedMotion) return;

    // Apply damping for smooth following
    if (damping) {
      scrollRef.current += (targetScrollRef.current - scrollRef.current) * dampingFactor;
    } else {
      scrollRef.current = targetScrollRef.current;
    }

    // Update each layer's position
    layerRefs.current.forEach((layer, index) => {
      if (!layer) return;
      
      const layerConfig = layers[index];
      const offset = scrollRef.current * layerConfig.speed;
      const clampedOffset = Math.max(-maxOffset, Math.min(maxOffset, offset));
      
      // Apply transform (GPU-accelerated)
      layer.style.transform = `translate3d(0, ${clampedOffset}px, 0) scale(${layerConfig.scale || 1})`;
    });

    if (debug) {
      setDebugInfo({ 
        scroll: Math.round(targetScrollRef.current), 
        offset: Math.round(scrollRef.current) 
      });
    }

    // Continue animation if damping and not settled
    if (damping && Math.abs(targetScrollRef.current - scrollRef.current) > 0.5) {
      rafRef.current = requestAnimationFrame(animate);
    }
  }, [layers, maxOffset, damping, dampingFactor, reducedMotion, debug]);

  // Scroll handler
  useEffect(() => {
    if (reducedMotion) return;

    const handleScroll = () => {
      targetScrollRef.current = window.scrollY;
      
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    // Initial position
    targetScrollRef.current = window.scrollY;
    scrollRef.current = window.scrollY;
    animate();

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [animate, reducedMotion]);

  // Reset RAF ref when animation completes
  useEffect(() => {
    const checkSettled = () => {
      if (Math.abs(targetScrollRef.current - scrollRef.current) <= 0.5) {
        rafRef.current = undefined;
      }
    };
    
    const interval = setInterval(checkSettled, 100);
    return () => clearInterval(interval);
  }, []);

  if (reducedMotion) {
    // Render static layers without animation
    return (
      <div 
        ref={containerRef}
        className={`scroll-depth-layers ${className}`}
        aria-hidden="true"
      >
        {layers.map((layer, index) => (
          <div
            key={index}
            className="scroll-depth-layer"
            style={{
              background: layer.gradient,
              opacity: layer.opacity,
              filter: layer.blur ? `blur(${layer.blur}px)` : undefined,
              transform: `scale(${layer.scale || 1})`,
            }}
          />
        ))}
        <style jsx>{`
          .scroll-depth-layers {
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 0;
            overflow: hidden;
          }
          
          .scroll-depth-layer {
            position: absolute;
            inset: -10%;
            transform-origin: center center;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`scroll-depth-layers ${className}`}
      aria-hidden="true"
    >
      {layers.map((layer, index) => (
        <div
          key={index}
          ref={(el) => { layerRefs.current[index] = el; }}
          className="scroll-depth-layer"
          style={{
            background: layer.gradient,
            opacity: layer.opacity,
            filter: layer.blur ? `blur(${layer.blur}px)` : undefined,
            willChange: 'transform',
            transform: `translate3d(0, 0, 0) scale(${layer.scale || 1})`,
          }}
        />
      ))}
      
      {debug && (
        <div className="scroll-depth-debug">
          <div>Scroll: {debugInfo.scroll}px</div>
          <div>Offset: {debugInfo.offset}px</div>
          <div>Layers: {layers.length}</div>
        </div>
      )}

      <style jsx>{`
        .scroll-depth-layers {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }
        
        .scroll-depth-layer {
          position: absolute;
          inset: -10%;
          transform-origin: center center;
          backface-visibility: hidden;
        }
        
        .scroll-depth-debug {
          position: fixed;
          bottom: 80px;
          left: 16px;
          padding: 8px 12px;
          background: rgba(0, 0, 0, 0.8);
          border-radius: 8px;
          font-family: monospace;
          font-size: 11px;
          color: #a1a1aa;
          z-index: 9999;
          pointer-events: auto;
        }
        
        .scroll-depth-debug div {
          line-height: 1.4;
        }
        
        /* Theme compatibility */
        :global([data-theme="light"]) .scroll-depth-layers {
          opacity: 0.6;
        }
        
        /* Print: hide */
        @media print {
          .scroll-depth-layers {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * ScrollDepthLayersCompact - Lighter version with fewer layers
 * 
 * For use in areas where full depth effect would be too heavy.
 */
export function ScrollDepthLayersCompact({
  preset = 'aurora',
  maxOffset = 80,
  className = '',
}: Pick<ScrollDepthLayersProps, 'preset' | 'maxOffset' | 'className'>) {
  // Use only first 2 layers from preset
  const fullLayers = LAYER_PRESETS[preset] || LAYER_PRESETS.aurora;
  const compactLayers = fullLayers.slice(0, 2).map(layer => ({
    ...layer,
    opacity: layer.opacity * 0.7,
  }));

  return (
    <ScrollDepthLayers
      layers={compactLayers}
      maxOffset={maxOffset}
      damping
      dampingFactor={0.1}
      className={className}
    />
  );
}

/**
 * Hook for creating custom depth layers with scroll tracking
 */
export function useScrollDepth(
  speed: number = 0.3,
  maxOffset: number = 100,
  damping: boolean = true,
  dampingFactor: number = 0.08
) {
  const [offset, setOffset] = useState(0);
  const scrollRef = useRef(0);
  const targetRef = useRef(0);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    const animate = () => {
      if (damping) {
        scrollRef.current += (targetRef.current - scrollRef.current) * dampingFactor;
      } else {
        scrollRef.current = targetRef.current;
      }

      const calculatedOffset = scrollRef.current * speed;
      const clampedOffset = Math.max(-maxOffset, Math.min(maxOffset, calculatedOffset));
      setOffset(clampedOffset);

      if (damping && Math.abs(targetRef.current - scrollRef.current) > 0.5) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    const handleScroll = () => {
      targetRef.current = window.scrollY;
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    targetRef.current = window.scrollY;
    scrollRef.current = window.scrollY;
    animate();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [speed, maxOffset, damping, dampingFactor]);

  return offset;
}

export default ScrollDepthLayers;
