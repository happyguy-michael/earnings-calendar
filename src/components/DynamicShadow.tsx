'use client';

import { useEffect, useRef, useState, useCallback, ReactNode, CSSProperties, createContext, useContext } from 'react';
import { useMotionPreferences } from './MotionPreferences';

/**
 * DynamicShadow — Cursor-Aware Light Source Shadow System
 * 
 * Creates the illusion that shadows are cast from a light source at the cursor position.
 * As the cursor moves across the page, all shadows shift direction accordingly,
 * creating a cohesive, premium lighting effect across the interface.
 * 
 * Inspiration:
 * - iOS Dynamic Island shadow behavior
 * - Apple's window shadows in macOS
 * - Material Design elevation system with dynamic light
 * - 3D software viewport lighting
 * - Physical shadow behavior in real environments
 * 
 * Features:
 * - Page-level cursor tracking for unified light direction
 * - Multi-layer shadows for realistic depth
 * - Configurable elevation levels
 * - State-aware shadow colors (success/warning/danger tints)
 * - GPU-accelerated via CSS custom properties
 * - Smooth easing for natural shadow movement
 * - Respects prefers-reduced-motion
 * - Falls back to static centered shadow when disabled
 */

// ==== CONTEXT FOR GLOBAL CURSOR POSITION ====

interface LightSourceContextValue {
  lightX: number; // 0-1, normalized cursor X
  lightY: number; // 0-1, normalized cursor Y
  enabled: boolean;
}

const LightSourceContext = createContext<LightSourceContextValue>({
  lightX: 0.5,
  lightY: 0.2,
  enabled: true,
});

interface DynamicShadowProviderProps {
  children: ReactNode;
  /** Smoothing factor for cursor tracking (0-1, higher = smoother) */
  smoothing?: number;
  /** Default light position when cursor is not tracked */
  defaultLightX?: number;
  defaultLightY?: number;
  /** Enable the dynamic shadow system */
  enabled?: boolean;
}

/**
 * Provider that tracks global cursor position as a "light source".
 * Wrap your app or page with this to enable DynamicShadow effects.
 */
export function DynamicShadowProvider({
  children,
  smoothing = 0.08,
  defaultLightX = 0.5,
  defaultLightY = 0.2,
  enabled = true,
}: DynamicShadowProviderProps) {
  const [lightPos, setLightPos] = useState({ x: defaultLightX, y: defaultLightY });
  const targetRef = useRef({ x: defaultLightX, y: defaultLightY });
  const currentRef = useRef({ x: defaultLightX, y: defaultLightY });
  const animationRef = useRef<number | null>(null);
  const { shouldAnimate } = useMotionPreferences();
  const prefersReducedMotion = !shouldAnimate('decorative');

  useEffect(() => {
    if (!enabled || prefersReducedMotion) {
      setLightPos({ x: defaultLightX, y: defaultLightY });
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };

    const animate = () => {
      // Smooth lerp towards target
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * smoothing;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * smoothing;
      
      setLightPos({ x: currentRef.current.x, y: currentRef.current.y });
      animationRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled, prefersReducedMotion, smoothing, defaultLightX, defaultLightY]);

  return (
    <LightSourceContext.Provider 
      value={{ 
        lightX: lightPos.x, 
        lightY: lightPos.y, 
        enabled: enabled && !prefersReducedMotion,
      }}
    >
      {children}
    </LightSourceContext.Provider>
  );
}

// ==== HOOK FOR ACCESSING LIGHT SOURCE ====

export function useLightSource() {
  return useContext(LightSourceContext);
}

// ==== SHADOW CONFIGURATION ====

type Elevation = 'flat' | 'low' | 'medium' | 'high' | 'floating';
type ShadowVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'accent';

interface ShadowConfig {
  layers: number;
  baseBlur: number;
  maxOffset: number;
  opacity: number;
  spreadFactor: number;
}

const ELEVATION_CONFIG: Record<Elevation, ShadowConfig> = {
  flat: { layers: 1, baseBlur: 2, maxOffset: 2, opacity: 0.05, spreadFactor: 0 },
  low: { layers: 2, baseBlur: 4, maxOffset: 6, opacity: 0.08, spreadFactor: 0.5 },
  medium: { layers: 3, baseBlur: 8, maxOffset: 12, opacity: 0.12, spreadFactor: 1 },
  high: { layers: 3, baseBlur: 16, maxOffset: 20, opacity: 0.15, spreadFactor: 2 },
  floating: { layers: 4, baseBlur: 24, maxOffset: 32, opacity: 0.2, spreadFactor: 3 },
};

const VARIANT_COLORS: Record<ShadowVariant, { r: number; g: number; b: number }> = {
  neutral: { r: 0, g: 0, b: 0 },
  success: { r: 34, g: 197, b: 94 },  // Emerald
  warning: { r: 234, g: 179, b: 8 },   // Amber
  danger: { r: 239, g: 68, b: 68 },    // Red
  accent: { r: 99, g: 102, b: 241 },   // Indigo
};

// ==== MAIN COMPONENT ====

interface DynamicShadowProps {
  children: ReactNode;
  /** Elevation level determining shadow size/intensity */
  elevation?: Elevation;
  /** Color variant for tinted shadows */
  variant?: ShadowVariant;
  /** Tint intensity for colored variants (0-1) */
  tintIntensity?: number;
  /** Whether to animate elevation changes on hover */
  hoverElevation?: Elevation | null;
  /** Border radius matching the content */
  borderRadius?: number | string;
  /** Additional className */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
  /** Transition duration for hover in ms */
  hoverDuration?: number;
}

/**
 * DynamicShadow - Wraps content with a cursor-responsive shadow
 * 
 * The shadow direction shifts based on the global cursor position,
 * creating the illusion of a light source following the mouse.
 */
export function DynamicShadow({
  children,
  elevation = 'medium',
  variant = 'neutral',
  tintIntensity = 0.3,
  hoverElevation = null,
  borderRadius = 12,
  className = '',
  style,
  hoverDuration = 200,
}: DynamicShadowProps) {
  const { lightX, lightY, enabled } = useLightSource();
  const [isHovered, setIsHovered] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const [elementCenter, setElementCenter] = useState({ x: 0.5, y: 0.5 });

  // Track element position for local light direction
  const updateElementPosition = useCallback(() => {
    if (!elementRef.current) return;
    const rect = elementRef.current.getBoundingClientRect();
    setElementCenter({
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 2) / window.innerHeight,
    });
  }, []);

  useEffect(() => {
    if (!enabled) return;
    
    updateElementPosition();
    window.addEventListener('scroll', updateElementPosition, { passive: true });
    window.addEventListener('resize', updateElementPosition, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', updateElementPosition);
      window.removeEventListener('resize', updateElementPosition);
    };
  }, [enabled, updateElementPosition]);

  // Calculate shadow based on light position relative to element
  const calculateShadow = useCallback((currentElevation: Elevation): string => {
    const config = ELEVATION_CONFIG[currentElevation];
    const variantColor = VARIANT_COLORS[variant];
    
    if (!enabled) {
      // Static centered shadow when disabled
      const staticShadows = [];
      for (let i = 0; i < config.layers; i++) {
        const blur = config.baseBlur * (i + 1);
        const opacity = config.opacity / (i + 1);
        staticShadows.push(
          `0 ${blur / 2}px ${blur}px rgba(0, 0, 0, ${opacity})`
        );
      }
      return staticShadows.join(', ');
    }

    // Calculate direction from light source to element
    const dx = elementCenter.x - lightX;
    const dy = elementCenter.y - lightY;
    
    // Normalize and scale the offset
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = 1; // Diagonal of viewport
    const normalizedDistance = Math.min(distance / maxDistance, 1);
    
    const shadows: string[] = [];
    
    for (let i = 0; i < config.layers; i++) {
      const layerMultiplier = (i + 1) / config.layers;
      const blur = config.baseBlur * (i + 1);
      const spread = config.spreadFactor * i;
      
      // Shadow offset increases with layer and distance
      const offsetScale = config.maxOffset * layerMultiplier * (0.5 + normalizedDistance * 0.5);
      const offsetX = dx * offsetScale;
      const offsetY = dy * offsetScale + blur * 0.3; // Slight downward bias for realism
      
      // Opacity decreases with distance from light
      const opacity = config.opacity / (i + 1);
      
      // Blend shadow color for variants
      let r = 0, g = 0, b = 0;
      if (variant !== 'neutral' && tintIntensity > 0) {
        const tint = tintIntensity / (i + 1); // Tint fades in outer layers
        r = Math.round(variantColor.r * tint);
        g = Math.round(variantColor.g * tint);
        b = Math.round(variantColor.b * tint);
      }
      
      shadows.push(
        `${offsetX.toFixed(1)}px ${offsetY.toFixed(1)}px ${blur}px ${spread}px rgba(${r}, ${g}, ${b}, ${opacity})`
      );
    }
    
    return shadows.join(', ');
  }, [lightX, lightY, elementCenter, enabled, variant, tintIntensity]);

  const currentElevation = isHovered && hoverElevation ? hoverElevation : elevation;
  const shadow = calculateShadow(currentElevation);

  return (
    <div
      ref={elementRef}
      className={`dynamic-shadow ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...style,
        boxShadow: shadow,
        borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
        transition: `box-shadow ${hoverDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        willChange: 'box-shadow',
      }}
    >
      {children}
    </div>
  );
}

// ==== CARD VARIANT WITH BUILT-IN STYLING ====

interface DynamicShadowCardProps extends DynamicShadowProps {
  /** Background color */
  background?: string;
  /** Border color */
  borderColor?: string;
  /** Padding */
  padding?: number | string;
}

/**
 * Pre-styled card with DynamicShadow built in.
 * Matches the earnings calendar aesthetic.
 */
export function DynamicShadowCard({
  children,
  elevation = 'medium',
  variant = 'neutral',
  tintIntensity = 0.3,
  hoverElevation = 'high',
  borderRadius = 16,
  background = 'rgba(255, 255, 255, 0.03)',
  borderColor = 'rgba(255, 255, 255, 0.06)',
  padding = '1.5rem',
  className = '',
  style,
  ...props
}: DynamicShadowCardProps) {
  return (
    <DynamicShadow
      elevation={elevation}
      variant={variant}
      tintIntensity={tintIntensity}
      hoverElevation={hoverElevation}
      borderRadius={borderRadius}
      className={className}
      style={{
        background,
        border: `1px solid ${borderColor}`,
        padding: typeof padding === 'number' ? `${padding}px` : padding,
        ...style,
      }}
      {...props}
    >
      {children}
    </DynamicShadow>
  );
}

// ==== HOOK FOR CUSTOM IMPLEMENTATIONS ====

interface UseDynamicShadowOptions {
  elevation?: Elevation;
  variant?: ShadowVariant;
  tintIntensity?: number;
}

/**
 * Hook for applying dynamic shadow styles to any element.
 * Returns CSS properties to spread onto your element.
 */
export function useDynamicShadow({
  elevation = 'medium',
  variant = 'neutral',
  tintIntensity = 0.3,
}: UseDynamicShadowOptions = {}) {
  const { lightX, lightY, enabled } = useLightSource();
  const [elementRef, setElementRef] = useState<HTMLElement | null>(null);
  const [shadow, setShadow] = useState('');

  useEffect(() => {
    if (!elementRef || !enabled) {
      // Static shadow
      const config = ELEVATION_CONFIG[elevation];
      const staticShadows = [];
      for (let i = 0; i < config.layers; i++) {
        const blur = config.baseBlur * (i + 1);
        const opacity = config.opacity / (i + 1);
        staticShadows.push(`0 ${blur / 2}px ${blur}px rgba(0, 0, 0, ${opacity})`);
      }
      setShadow(staticShadows.join(', '));
      return;
    }

    const rect = elementRef.getBoundingClientRect();
    const elementCenterX = (rect.left + rect.width / 2) / window.innerWidth;
    const elementCenterY = (rect.top + rect.height / 2) / window.innerHeight;

    const config = ELEVATION_CONFIG[elevation];
    const variantColor = VARIANT_COLORS[variant];

    const dx = elementCenterX - lightX;
    const dy = elementCenterY - lightY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const normalizedDistance = Math.min(distance, 1);

    const shadows: string[] = [];
    for (let i = 0; i < config.layers; i++) {
      const layerMultiplier = (i + 1) / config.layers;
      const blur = config.baseBlur * (i + 1);
      const spread = config.spreadFactor * i;
      const offsetScale = config.maxOffset * layerMultiplier * (0.5 + normalizedDistance * 0.5);
      const offsetX = dx * offsetScale;
      const offsetY = dy * offsetScale + blur * 0.3;
      const opacity = config.opacity / (i + 1);

      let r = 0, g = 0, b = 0;
      if (variant !== 'neutral' && tintIntensity > 0) {
        const tint = tintIntensity / (i + 1);
        r = Math.round(variantColor.r * tint);
        g = Math.round(variantColor.g * tint);
        b = Math.round(variantColor.b * tint);
      }

      shadows.push(
        `${offsetX.toFixed(1)}px ${offsetY.toFixed(1)}px ${blur}px ${spread}px rgba(${r}, ${g}, ${b}, ${opacity})`
      );
    }

    setShadow(shadows.join(', '));
  }, [elementRef, lightX, lightY, enabled, elevation, variant, tintIntensity]);

  return {
    ref: setElementRef,
    style: {
      boxShadow: shadow,
      transition: 'box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      willChange: 'box-shadow',
    },
  };
}

// ==== INJECT GLOBAL STYLES ====

export function DynamicShadowStyles() {
  useEffect(() => {
    const styleId = 'dynamic-shadow-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .dynamic-shadow {
        position: relative;
        transform: translateZ(0); /* Force GPU layer */
      }
      
      /* Ensure smooth transitions */
      @media (prefers-reduced-motion: no-preference) {
        .dynamic-shadow {
          transition: box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1);
        }
      }
      
      /* Static shadow fallback */
      @media (prefers-reduced-motion: reduce) {
        .dynamic-shadow {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      const existing = document.getElementById(styleId);
      if (existing) existing.remove();
    };
  }, []);

  return null;
}
