'use client';

import { CSSProperties, useMemo } from 'react';

/**
 * ProgressiveBlur
 * 
 * Creates an Apple-style progressive blur effect that increases in strength
 * across multiple layers. Perfect for sticky headers where content scrolls
 * beneath and gradually blurs out.
 * 
 * The technique uses multiple overlapping backdrop-filter layers with CSS
 * mask-image gradients. Each layer handles a different blur strength,
 * creating a smooth transition from no blur to maximum blur.
 * 
 * Reference: kennethnym.com/blog/progressive-blur-in-css
 * 
 * @example
 * // At the bottom of a sticky header
 * <header className="sticky top-0">
 *   <nav>...</nav>
 *   <ProgressiveBlur direction="down" height={80} />
 * </header>
 * 
 * @example
 * // Custom configuration
 * <ProgressiveBlur 
 *   direction="up"
 *   height={120}
 *   layers={9}
 *   maxBlur={48}
 *   fadeColor="rgb(15, 15, 20)"
 * />
 */

interface ProgressiveBlurProps {
  /** Direction blur increases toward (default: 'down') */
  direction?: 'up' | 'down';
  /** Height of the blur area in pixels (default: 60) */
  height?: number;
  /** Number of blur layers - more = smoother, but more DOM elements (default: 7) */
  layers?: number;
  /** Maximum blur radius in pixels (default: 32) */
  maxBlur?: number;
  /** Whether to show the gradient overlay to hide edge artifacts (default: true) */
  showFadeGradient?: boolean;
  /** Color for fade gradient (should match background, default: transparent for dark mode) */
  fadeColor?: string;
  /** Light mode fade color (default: rgb(248, 250, 252)) */
  fadeColorLight?: string;
  /** Additional className */
  className?: string;
  /** Z-index for the blur container (default: 5) */
  zIndex?: number;
}

interface BlurLayer {
  blur: number;
  maskStart: number;
  maskSolidStart: number;
  maskSolidEnd: number;
  maskEnd: number;
}

export function ProgressiveBlur({
  direction = 'down',
  height = 60,
  layers = 7,
  maxBlur = 32,
  showFadeGradient = true,
  fadeColor,
  fadeColorLight,
  className = '',
  zIndex = 5,
}: ProgressiveBlurProps) {
  // Generate blur layers with exponentially increasing blur values
  const blurLayers = useMemo<BlurLayer[]>(() => {
    const result: BlurLayer[] = [];
    
    for (let i = 0; i < layers; i++) {
      // Exponential blur progression: 1, 2, 4, 8, 16, 32, 64...
      const blur = Math.min(Math.pow(2, i), maxBlur);
      
      // Calculate mask positions - each layer overlaps the previous
      // to create a smooth transition
      const progress = i / (layers - 1);
      const nextProgress = (i + 1) / (layers - 1);
      
      // Mask positions create overlapping bands
      const maskStart = Math.max(0, (progress - 0.2) * 100);
      const maskSolidStart = progress * 100;
      const maskSolidEnd = Math.min(100, nextProgress * 100);
      const maskEnd = Math.min(100, (nextProgress + 0.1) * 100);
      
      result.push({
        blur,
        maskStart,
        maskSolidStart,
        maskSolidEnd,
        maskEnd,
      });
    }
    
    return result;
  }, [layers, maxBlur]);

  // Container styles
  const containerStyle: CSSProperties = {
    position: 'absolute',
    left: 0,
    right: 0,
    [direction === 'down' ? 'top' : 'bottom']: '100%',
    width: '100%',
    height: `${height}px`,
    pointerEvents: 'none',
    zIndex,
  };

  // Base layer styles
  const layerBaseStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  };

  // Generate gradient direction
  const gradientDirection = direction === 'down' ? 'to bottom' : 'to top';

  return (
    <div 
      className={`progressive-blur ${className}`}
      style={containerStyle}
      aria-hidden="true"
    >
      {blurLayers.map((layer, index) => {
        const maskGradient = `linear-gradient(${gradientDirection}, 
          rgba(0, 0, 0, 0) ${layer.maskStart}%, 
          rgba(0, 0, 0, 1) ${layer.maskSolidStart}%, 
          rgba(0, 0, 0, 1) ${layer.maskSolidEnd}%, 
          rgba(0, 0, 0, 0) ${layer.maskEnd}%
        )`;

        const layerStyle: CSSProperties = {
          ...layerBaseStyle,
          backdropFilter: `blur(${layer.blur}px)`,
          WebkitBackdropFilter: `blur(${layer.blur}px)`,
          mask: maskGradient,
          WebkitMask: maskGradient,
          zIndex: index,
        };

        return (
          <div 
            key={index}
            className="progressive-blur-layer"
            style={layerStyle}
          />
        );
      })}
      
      {/* Gradient overlay to hide edge artifacts */}
      {showFadeGradient && (
        <div 
          className="progressive-blur-fade"
          style={{
            ...layerBaseStyle,
            zIndex: layers,
            background: `linear-gradient(${gradientDirection}, 
              transparent 0%, 
              var(--progressive-blur-fade, rgba(10, 10, 15, 0.8)) 100%
            )`,
          }}
        />
      )}

      {/* CSS custom property injection for theme-aware fade color */}
      <style jsx>{`
        .progressive-blur {
          --progressive-blur-fade: ${fadeColor || 'rgba(10, 10, 15, 0.85)'};
        }
        :global(.light) .progressive-blur {
          --progressive-blur-fade: ${fadeColorLight || 'rgba(248, 250, 252, 0.9)'};
        }
        
        /* Respect reduced motion preference */
        @media (prefers-reduced-motion: reduce) {
          .progressive-blur {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * ProgressiveBlurEdge
 * 
 * A simpler variant for content edges (like the bottom of a scrollable area)
 * where content should fade out with progressive blur.
 */
interface ProgressiveBlurEdgeProps {
  /** Position relative to parent (default: 'bottom') */
  position?: 'top' | 'bottom';
  /** Height of effect (default: 80) */
  height?: number;
  /** Additional className */
  className?: string;
}

export function ProgressiveBlurEdge({
  position = 'bottom',
  height = 80,
  className = '',
}: ProgressiveBlurEdgeProps) {
  return (
    <ProgressiveBlur
      direction={position === 'bottom' ? 'down' : 'up'}
      height={height}
      layers={5}
      maxBlur={24}
      showFadeGradient={true}
      className={className}
    />
  );
}

/**
 * ScrollFadeBlur
 * 
 * A variant designed for scroll containers. Attaches to the container
 * and shows progressive blur at the top and/or bottom.
 */
interface ScrollFadeBlurProps {
  /** Show blur at top (default: false) */
  top?: boolean;
  /** Show blur at bottom (default: true) */
  bottom?: boolean;
  /** Height of each blur zone (default: 60) */
  height?: number;
  /** Additional className for the container */
  className?: string;
  /** Content to wrap */
  children: React.ReactNode;
}

export function ScrollFadeBlur({
  top = false,
  bottom = true,
  height = 60,
  className = '',
  children,
}: ScrollFadeBlurProps) {
  return (
    <div className={`scroll-fade-blur-container ${className}`} style={{ position: 'relative' }}>
      {top && (
        <div style={{ position: 'sticky', top: 0, zIndex: 10 }}>
          <ProgressiveBlur direction="down" height={height} />
        </div>
      )}
      {children}
      {bottom && (
        <div style={{ position: 'sticky', bottom: 0, zIndex: 10 }}>
          <ProgressiveBlur direction="up" height={height} />
        </div>
      )}
    </div>
  );
}

export default ProgressiveBlur;
