'use client';

import { ReactNode, useState, useRef, useEffect, CSSProperties, memo } from 'react';

/**
 * HoverMagnify - Progressive Detail Reveal on Hover
 * 
 * Subtly magnifies small UI elements (badges, indicators, compact info) when
 * hovered, making dense information easier to read without cluttering the
 * default view. Inspired by macOS Dock magnification and accessibility-first
 * design principles.
 * 
 * 2026 UI Trend: "Progressive Disclosure" meets "Accessibility-First Design"
 * - Dense UIs benefit from contextual expansion
 * - Information hierarchy through interaction, not just visual weight
 * - Reduces cognitive load by showing detail only when needed
 * 
 * Inspiration:
 * - macOS Dock magnification effect
 * - Bloomberg Terminal hover expansions
 * - Figma's zoom-to-selection
 * - Linear.app's contextual detail panels
 * - iOS Dynamic Island expansion patterns
 * 
 * Features:
 * - Smooth scale + slight lift on hover
 * - Optional background reveal for contrast
 * - Configurable magnification amount
 * - Spring physics for premium feel
 * - Maintains layout (no content shift for siblings)
 * - Touch-friendly (expands on long-press)
 * - Respects prefers-reduced-motion
 * - Focus-visible support for keyboard users
 * - Z-index management to stay above siblings
 * 
 * Use cases:
 * - Small stat badges
 * - Compact date/time indicators
 * - Abbreviated labels
 * - Icon buttons with tooltips
 * - Dense data table cells
 * 
 * @example
 * // Basic magnification
 * <HoverMagnify scale={1.15}>
 *   <Badge>+12.5%</Badge>
 * </HoverMagnify>
 * 
 * // With background reveal
 * <HoverMagnify scale={1.2} revealBackground>
 *   <SmallIndicator />
 * </HoverMagnify>
 * 
 * // Custom spring physics
 * <HoverMagnify scale={1.25} spring="bouncy" lift={4}>
 *   <CompactStat />
 * </HoverMagnify>
 */

type SpringPreset = 'snappy' | 'smooth' | 'bouncy' | 'gentle';

interface HoverMagnifyProps {
  children: ReactNode;
  /** Scale factor when hovered (1.0 = no change, 1.2 = 20% larger) */
  scale?: number;
  /** Lift amount in pixels (subtle Y translation) */
  lift?: number;
  /** Spring animation preset */
  spring?: SpringPreset;
  /** Show a background/backdrop when magnified */
  revealBackground?: boolean;
  /** Background color when revealed */
  backgroundColor?: string;
  /** Border radius of revealed background */
  borderRadius?: number;
  /** Padding around content when background is revealed */
  backgroundPadding?: number;
  /** Delay before magnification starts (ms) */
  delay?: number;
  /** Enable long-press activation on touch (ms threshold) */
  longPressMs?: number;
  /** Enable focus magnification for keyboard users */
  focusMagnify?: boolean;
  /** Callback when magnification activates */
  onMagnify?: () => void;
  /** Callback when magnification deactivates */
  onDemagnify?: () => void;
  /** Additional className */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Disable magnification */
  disabled?: boolean;
  /** Use as inline element */
  inline?: boolean;
}

// Spring presets (CSS easing functions)
const SPRING_PRESETS: Record<SpringPreset, { easing: string; duration: number }> = {
  snappy: {
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    duration: 200,
  },
  smooth: {
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    duration: 250,
  },
  bouncy: {
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    duration: 350,
  },
  gentle: {
    easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    duration: 400,
  },
};

export const HoverMagnify = memo(function HoverMagnify({
  children,
  scale = 1.15,
  lift = 2,
  spring = 'snappy',
  revealBackground = false,
  backgroundColor,
  borderRadius = 8,
  backgroundPadding = 6,
  delay = 0,
  longPressMs = 300,
  focusMagnify = true,
  onMagnify,
  onDemagnify,
  className = '',
  style,
  disabled = false,
  inline = true,
}: HoverMagnifyProps) {
  const [isMagnified, setIsMagnified] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const delayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (delayTimeoutRef.current) clearTimeout(delayTimeoutRef.current);
      if (longPressTimeoutRef.current) clearTimeout(longPressTimeoutRef.current);
    };
  }, []);

  // Update magnification state based on hover/focus/longpress
  useEffect(() => {
    if (disabled) {
      setIsMagnified(false);
      return;
    }

    const shouldMagnify = isHovering || (focusMagnify && isFocused) || isLongPressing;
    
    if (shouldMagnify && !isMagnified) {
      if (delay > 0) {
        delayTimeoutRef.current = setTimeout(() => {
          setIsMagnified(true);
          onMagnify?.();
        }, delay);
      } else {
        setIsMagnified(true);
        onMagnify?.();
      }
    } else if (!shouldMagnify && isMagnified) {
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
      }
      setIsMagnified(false);
      onDemagnify?.();
    }
  }, [isHovering, isFocused, isLongPressing, disabled, delay, focusMagnify, isMagnified, onMagnify, onDemagnify]);

  // Event handlers
  const handleMouseEnter = () => {
    if (!disabled) setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setIsLongPressing(false);
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }
  };

  const handleFocus = () => {
    if (!disabled && focusMagnify) setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  // Touch long-press handling
  const handleTouchStart = () => {
    if (disabled) return;
    
    longPressTimeoutRef.current = setTimeout(() => {
      setIsLongPressing(true);
    }, longPressMs);
  };

  const handleTouchEnd = () => {
    setIsLongPressing(false);
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }
  };

  // Get spring config
  const springConfig = SPRING_PRESETS[spring];
  
  // Calculate effective values (no animation if reduced motion)
  const effectiveScale = prefersReducedMotion ? 1 : (isMagnified ? scale : 1);
  const effectiveLift = prefersReducedMotion ? 0 : (isMagnified ? -lift : 0);
  const effectiveDuration = prefersReducedMotion ? 0 : springConfig.duration;

  // Determine background color
  const bgColor = backgroundColor ?? (
    revealBackground 
      ? 'var(--hover-magnify-bg, rgba(0, 0, 0, 0.8))'
      : 'transparent'
  );

  const containerStyles: CSSProperties = {
    display: inline ? 'inline-flex' : 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    transformOrigin: 'center center',
    transform: `scale(${effectiveScale}) translateY(${effectiveLift}px)`,
    transition: effectiveDuration > 0 
      ? `transform ${effectiveDuration}ms ${springConfig.easing}` 
      : 'none',
    zIndex: isMagnified ? 10 : 'auto',
    willChange: isMagnified ? 'transform' : 'auto',
    cursor: disabled ? 'default' : 'pointer',
    ...style,
  };

  const backgroundStyles: CSSProperties = {
    position: 'absolute',
    inset: -backgroundPadding,
    borderRadius,
    backgroundColor: isMagnified ? bgColor : 'transparent',
    backdropFilter: isMagnified && revealBackground ? 'blur(8px)' : 'none',
    WebkitBackdropFilter: isMagnified && revealBackground ? 'blur(8px)' : 'none',
    boxShadow: isMagnified && revealBackground 
      ? '0 4px 16px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)'
      : 'none',
    opacity: isMagnified ? 1 : 0,
    transition: effectiveDuration > 0
      ? `background-color ${effectiveDuration}ms ease, opacity ${effectiveDuration}ms ease, box-shadow ${effectiveDuration}ms ease`
      : 'none',
    pointerEvents: 'none',
    zIndex: -1,
  };

  return (
    <div
      ref={containerRef}
      className={`hover-magnify ${isMagnified ? 'magnified' : ''} ${className}`}
      style={containerStyles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      tabIndex={focusMagnify && !disabled ? 0 : undefined}
      role={focusMagnify ? 'button' : undefined}
      aria-expanded={isMagnified}
    >
      {/* Background reveal layer */}
      {revealBackground && <div style={backgroundStyles} aria-hidden="true" />}
      
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
});

/**
 * MagnifyGroup - Applies magnification to a group with staggered scaling
 * 
 * When any item in the group is hovered, neighboring items scale slightly
 * less, creating a "lens" effect similar to macOS Dock.
 */
interface MagnifyGroupProps {
  children: ReactNode;
  /** Maximum scale for the hovered item */
  maxScale?: number;
  /** Scale falloff for neighboring items (multiplier) */
  neighborScale?: number;
  /** Gap between items */
  gap?: number;
  /** Direction of the group */
  direction?: 'horizontal' | 'vertical';
  /** Additional className */
  className?: string;
}

export const MagnifyGroup = memo(function MagnifyGroup({
  children,
  maxScale = 1.3,
  neighborScale = 1.1,
  gap = 4,
  direction = 'horizontal',
  className = '',
}: MagnifyGroupProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const items = Array.isArray(children) ? children : [children];

  const getScale = (index: number): number => {
    if (hoveredIndex === null || prefersReducedMotion) return 1;
    
    const distance = Math.abs(index - hoveredIndex);
    
    if (distance === 0) return maxScale;
    if (distance === 1) return neighborScale;
    if (distance === 2) return 1 + (neighborScale - 1) * 0.3;
    return 1;
  };

  return (
    <div
      className={`magnify-group ${className}`}
      style={{
        display: 'flex',
        flexDirection: direction === 'horizontal' ? 'row' : 'column',
        alignItems: 'center',
        gap,
      }}
    >
      {items.map((child, index) => (
        <div
          key={index}
          style={{
            transform: `scale(${getScale(index)})`,
            transition: prefersReducedMotion ? 'none' : 'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            transformOrigin: 'center center',
            zIndex: hoveredIndex === index ? 10 : 1,
          }}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {child}
        </div>
      ))}
    </div>
  );
});

/**
 * MagnifyOnScroll - Magnifies elements when they're near the center of viewport
 * 
 * Elements scale up as they approach the center of the viewport during scroll,
 * creating a "focus lens" effect for long lists or carousels.
 */
interface MagnifyOnScrollProps {
  children: ReactNode;
  /** Maximum scale at viewport center */
  maxScale?: number;
  /** Distance from center where scaling starts (0-1, as fraction of viewport) */
  threshold?: number;
  /** Additional className */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

export const MagnifyOnScroll = memo(function MagnifyOnScroll({
  children,
  maxScale = 1.1,
  threshold = 0.4,
  className = '',
  style,
}: MagnifyOnScrollProps) {
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    
    if (mq.matches) return;

    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportCenter = viewportHeight / 2;
      const elementCenter = rect.top + rect.height / 2;
      
      // Calculate distance from viewport center (0-1)
      const distanceFromCenter = Math.abs(elementCenter - viewportCenter) / viewportHeight;
      
      // Calculate scale based on distance
      if (distanceFromCenter <= threshold) {
        const progress = 1 - (distanceFromCenter / threshold);
        const newScale = 1 + (maxScale - 1) * progress;
        setScale(newScale);
      } else {
        setScale(1);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, [maxScale, threshold]);

  return (
    <div
      ref={containerRef}
      className={`magnify-on-scroll ${className}`}
      style={{
        transform: prefersReducedMotion ? 'none' : `scale(${scale})`,
        transition: prefersReducedMotion ? 'none' : 'transform 100ms ease-out',
        transformOrigin: 'center center',
        ...style,
      }}
    >
      {children}
    </div>
  );
});

export default HoverMagnify;
