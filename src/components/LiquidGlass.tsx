'use client';

import { useEffect, useState, useRef, ReactNode, CSSProperties, useId } from 'react';

/**
 * LiquidGlass Component
 * 
 * Creates an iOS 26-style "Liquid Glass" effect using SVG filters.
 * Beyond standard glassmorphism (blur + transparency), this adds:
 * 
 * 1. REFRACTION - Light bending at curved edges via feDisplacementMap
 *    - Uses feTurbulence for procedural displacement (no external assets)
 *    - Creates subtle "lens distortion" at element boundaries
 * 
 * 2. SPECULAR HIGHLIGHTS - Glossy rim lighting via CSS gradients
 *    - Mimics light reflection on curved glass surfaces
 *    - Responds to element shape with conic gradients
 * 
 * 3. CHROMATIC DISPERSION - Subtle color separation at edges
 *    - Adds prismatic color fringing for realism
 *    - Very subtle to avoid being distracting
 * 
 * Reference: iOS 26 Liquid Glass, LogRocket SVG filter tutorial,
 *            CSS-Tricks realistic glass effects with SVG
 * 
 * @example
 * <LiquidGlass intensity="medium" shape="pill">
 *   <button>Click me</button>
 * </LiquidGlass>
 */

type Intensity = 'subtle' | 'medium' | 'strong';
type Shape = 'rounded' | 'pill' | 'circle';

interface LiquidGlassProps {
  children: ReactNode;
  /** Effect intensity (default: medium) */
  intensity?: Intensity;
  /** Element shape for optimized distortion (default: rounded) */
  shape?: Shape;
  /** Additional className */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
  /** Whether to show specular highlights (default: true) */
  specular?: boolean;
  /** Whether to show chromatic dispersion (default: true) */
  chromatic?: boolean;
  /** Disable effect entirely (for performance) */
  disabled?: boolean;
  /** Whether element is interactive (adds hover state) */
  interactive?: boolean;
}

// Intensity presets
const INTENSITY_CONFIG = {
  subtle: {
    blur: 8,
    displacement: 3,
    turbulence: 0.02,
    specularOpacity: 0.15,
    chromaticOffset: 0.5,
  },
  medium: {
    blur: 12,
    displacement: 5,
    turbulence: 0.025,
    specularOpacity: 0.25,
    chromaticOffset: 1,
  },
  strong: {
    blur: 16,
    displacement: 8,
    turbulence: 0.03,
    specularOpacity: 0.35,
    chromaticOffset: 1.5,
  },
};

// Shape-specific border radius
const SHAPE_RADIUS = {
  rounded: '12px',
  pill: '9999px',
  circle: '50%',
};

export function LiquidGlass({
  children,
  intensity = 'medium',
  shape = 'rounded',
  className = '',
  style = {},
  specular = true,
  chromatic = true,
  disabled = false,
  interactive = false,
}: LiquidGlassProps) {
  const filterId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);

  const config = INTENSITY_CONFIG[intensity];
  const borderRadius = SHAPE_RADIUS[shape];

  // Detect reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Detect light mode
  useEffect(() => {
    const checkLightMode = () => {
      setIsLightMode(document.documentElement.classList.contains('light'));
    };
    checkLightMode();
    const observer = new MutationObserver(checkLightMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  // If disabled or reduced motion, render simple glassmorphism
  if (disabled || prefersReducedMotion) {
    return (
      <div
        ref={containerRef}
        className={`liquid-glass liquid-glass-fallback ${className}`}
        style={{
          borderRadius,
          backdropFilter: `blur(${config.blur}px)`,
          WebkitBackdropFilter: `blur(${config.blur}px)`,
          ...style,
        }}
      >
        {children}
      </div>
    );
  }

  // Dynamic values based on hover state
  const currentDisplacement = interactive && isHovered 
    ? config.displacement * 1.3 
    : config.displacement;
  const currentSpecular = interactive && isHovered
    ? config.specularOpacity * 1.2
    : config.specularOpacity;

  // Clean filter ID for SVG (remove colons from useId)
  const cleanFilterId = `liquid-glass-${filterId.replace(/:/g, '')}`;
  const chromaticFilterId = `${cleanFilterId}-chromatic`;

  return (
    <>
      {/* Hidden SVG filter definitions */}
      <svg 
        style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
        aria-hidden="true"
      >
        <defs>
          {/* Main liquid glass filter */}
          <filter 
            id={cleanFilterId} 
            x="-20%" 
            y="-20%" 
            width="140%" 
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            {/* Step 1: Generate procedural noise for displacement */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency={config.turbulence}
              numOctaves={3}
              seed={42}
              result="noise"
            />
            
            {/* Step 2: Blur the source slightly for smoother distortion */}
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation={1}
              result="blurred"
            />
            
            {/* Step 3: Apply displacement map for refraction effect */}
            <feDisplacementMap
              in="blurred"
              in2="noise"
              scale={currentDisplacement}
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            
            {/* Step 4: Main backdrop blur */}
            <feGaussianBlur
              in="displaced"
              stdDeviation={config.blur}
              result="blurredDisplaced"
            />
            
            {/* Step 5: Boost saturation slightly for richer colors */}
            <feColorMatrix
              in="blurredDisplaced"
              type="saturate"
              values="1.15"
              result="saturated"
            />
            
            {/* Step 6: Adjust brightness */}
            <feColorMatrix
              in="saturated"
              type="matrix"
              values={isLightMode 
                ? "1.02 0 0 0 0.02  0 1.02 0 0 0.02  0 0 1.02 0 0.02  0 0 0 1 0"
                : "1.05 0 0 0 0.02  0 1.05 0 0 0.02  0 0 1.05 0 0.02  0 0 0 1 0"
              }
            />
          </filter>

          {/* Chromatic aberration filter for edge color dispersion */}
          {chromatic && (
            <filter 
              id={chromaticFilterId}
              x="-10%" 
              y="-10%" 
              width="120%" 
              height="120%"
              colorInterpolationFilters="sRGB"
            >
              {/* Red channel offset */}
              <feOffset
                in="SourceGraphic"
                dx={-config.chromaticOffset}
                dy={0}
                result="red"
              />
              <feColorMatrix
                in="red"
                type="matrix"
                values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
                result="redOnly"
              />
              
              {/* Green channel (no offset) */}
              <feColorMatrix
                in="SourceGraphic"
                type="matrix"
                values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
                result="greenOnly"
              />
              
              {/* Blue channel offset */}
              <feOffset
                in="SourceGraphic"
                dx={config.chromaticOffset}
                dy={0}
                result="blue"
              />
              <feColorMatrix
                in="blue"
                type="matrix"
                values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
                result="blueOnly"
              />
              
              {/* Combine channels */}
              <feBlend in="redOnly" in2="greenOnly" mode="screen" result="rg" />
              <feBlend in="rg" in2="blueOnly" mode="screen" />
            </filter>
          )}
        </defs>
      </svg>

      {/* Main container */}
      <div
        ref={containerRef}
        className={`liquid-glass ${interactive ? 'liquid-glass-interactive' : ''} ${className}`}
        style={{
          position: 'relative',
          borderRadius,
          overflow: 'hidden',
          isolation: 'isolate',
          ...style,
        }}
        onMouseEnter={() => interactive && setIsHovered(true)}
        onMouseLeave={() => interactive && setIsHovered(false)}
      >
        {/* Backdrop filter layer */}
        <div
          className="liquid-glass-backdrop"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius,
            backdropFilter: `url(#${cleanFilterId})`,
            WebkitBackdropFilter: `url(#${cleanFilterId})`,
            zIndex: -2,
            transition: 'transform 0.3s ease-out',
            transform: interactive && isHovered ? 'scale(1.01)' : 'scale(1)',
          }}
          aria-hidden="true"
        />

        {/* Specular highlight layer */}
        {specular && (
          <div
            className="liquid-glass-specular"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius,
              background: isLightMode
                ? `conic-gradient(
                    from 135deg at 30% 20%,
                    rgba(255,255,255,${currentSpecular * 0.8}) 0deg,
                    transparent 60deg,
                    transparent 180deg,
                    rgba(255,255,255,${currentSpecular * 0.4}) 240deg,
                    rgba(255,255,255,${currentSpecular * 0.8}) 360deg
                  )`
                : `conic-gradient(
                    from 135deg at 30% 20%,
                    rgba(255,255,255,${currentSpecular}) 0deg,
                    transparent 60deg,
                    transparent 180deg,
                    rgba(255,255,255,${currentSpecular * 0.5}) 240deg,
                    rgba(255,255,255,${currentSpecular}) 360deg
                  )`,
              pointerEvents: 'none',
              zIndex: 1,
              mixBlendMode: 'overlay',
              transition: 'opacity 0.3s ease-out',
              opacity: interactive && isHovered ? 1.2 : 1,
            }}
            aria-hidden="true"
          />
        )}

        {/* Inner glow / rim light */}
        <div
          className="liquid-glass-rim"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius,
            boxShadow: isLightMode
              ? `inset 0 1px 1px rgba(255,255,255,0.5),
                 inset 0 -1px 1px rgba(0,0,0,0.05)`
              : `inset 0 1px 1px rgba(255,255,255,0.15),
                 inset 0 -1px 1px rgba(0,0,0,0.2)`,
            pointerEvents: 'none',
            zIndex: 2,
          }}
          aria-hidden="true"
        />

        {/* Chromatic edge layer (very subtle) */}
        {chromatic && (
          <div
            className="liquid-glass-chromatic"
            style={{
              position: 'absolute',
              inset: -1,
              borderRadius,
              border: '1px solid transparent',
              background: `linear-gradient(
                135deg,
                rgba(255,100,100,0.1) 0%,
                transparent 30%,
                transparent 70%,
                rgba(100,100,255,0.1) 100%
              )`,
              pointerEvents: 'none',
              zIndex: 3,
              opacity: 0.6,
            }}
            aria-hidden="true"
          />
        )}

        {/* Content */}
        <div 
          className="liquid-glass-content"
          style={{ 
            position: 'relative', 
            zIndex: 4,
          }}
        >
          {children}
        </div>
      </div>

      <style jsx>{`
        .liquid-glass {
          will-change: transform;
        }
        
        .liquid-glass-interactive {
          cursor: pointer;
          transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
        }
        
        .liquid-glass-interactive:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px -8px rgba(0, 0, 0, 0.2);
        }
        
        .liquid-glass-interactive:active {
          transform: translateY(0);
        }
        
        @media (prefers-reduced-motion: reduce) {
          .liquid-glass,
          .liquid-glass-backdrop,
          .liquid-glass-specular,
          .liquid-glass-interactive {
            transition: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </>
  );
}

/**
 * LiquidGlassButton - Preset for interactive buttons
 */
export function LiquidGlassButton({
  children,
  className = '',
  ...props
}: Omit<LiquidGlassProps, 'interactive' | 'shape'>) {
  return (
    <LiquidGlass
      intensity="medium"
      shape="pill"
      interactive
      className={`liquid-glass-button ${className}`}
      {...props}
    >
      {children}
    </LiquidGlass>
  );
}

/**
 * LiquidGlassCard - Preset for card containers
 */
export function LiquidGlassCard({
  children,
  className = '',
  ...props
}: Omit<LiquidGlassProps, 'shape'>) {
  return (
    <LiquidGlass
      intensity="subtle"
      shape="rounded"
      className={`liquid-glass-card ${className}`}
      {...props}
    >
      {children}
    </LiquidGlass>
  );
}

/**
 * LiquidGlassCircle - Preset for circular elements (icons, avatars)
 */
export function LiquidGlassCircle({
  children,
  className = '',
  size = 48,
  ...props
}: Omit<LiquidGlassProps, 'shape'> & { size?: number }) {
  return (
    <LiquidGlass
      intensity="medium"
      shape="circle"
      className={`liquid-glass-circle ${className}`}
      style={{ width: size, height: size }}
      {...props}
    >
      {children}
    </LiquidGlass>
  );
}

export default LiquidGlass;
