'use client';

import { useState, useEffect, useRef, memo, useCallback, CSSProperties } from 'react';
import { useMotionPreferences } from './MotionPreferences';

/**
 * BorderDraw - Animated Border Drawing Effect
 * 
 * Creates a stunning effect where border lines sequentially draw themselves
 * around an element, perfect for highlighting important content or reveals.
 * 
 * Inspiration:
 * - freefrontend.com "Animated Border Drawing Button" collection
 * - Apple product reveal animations
 * - Vercel deployment success indicators
 * - Premium fintech dashboard highlights
 * - "Sequential reveal" trend in 2025-2026 UI design
 * 
 * Features:
 * - Four border lines draw sequentially (top → right → bottom → left)
 * - Multiple trigger modes: mount, hover, inView, manual
 * - Configurable draw duration, color, and thickness
 * - Optional corner dots that appear before/after draw
 * - Glow effect for emphasis
 * - Reverse animation on un-trigger (hover out)
 * - Full prefers-reduced-motion support
 * - GPU-accelerated via scaleX/scaleY transforms
 * 
 * Use cases:
 * - Monster beat earnings reveal
 * - "This Week" card emphasis
 * - New result notifications
 * - Featured/highlighted content
 * - Call-to-action buttons
 * 
 * @example
 * // Auto-draw on mount
 * <BorderDraw trigger="mount">
 *   <Card>Content</Card>
 * </BorderDraw>
 * 
 * // Draw on hover
 * <BorderDraw trigger="hover" color="#22c55e">
 *   <Button>Monster Beat!</Button>
 * </BorderDraw>
 * 
 * // Manual control
 * <BorderDraw trigger="manual" active={isHighlighted}>
 *   <ResultCard />
 * </BorderDraw>
 */

// Color presets for common use cases
const COLOR_PRESETS = {
  default: '#a855f7',    // Purple (brand)
  beat: '#22c55e',       // Green (beat)
  miss: '#ef4444',       // Red (miss)
  gold: '#fbbf24',       // Gold (monster beat)
  blue: '#3b82f6',       // Blue (info)
  white: '#ffffff',      // White (neutral)
} as const;

type ColorPreset = keyof typeof COLOR_PRESETS;

interface BorderDrawProps {
  children: React.ReactNode;
  /** Trigger mode */
  trigger?: 'mount' | 'hover' | 'inView' | 'manual';
  /** For manual trigger mode */
  active?: boolean;
  /** Border color (preset name or hex) */
  color?: ColorPreset | string;
  /** Border thickness in pixels */
  thickness?: number;
  /** Total draw duration in ms */
  duration?: number;
  /** Delay before starting draw */
  delay?: number;
  /** Show corner dots */
  showCorners?: boolean;
  /** Corner dot size multiplier */
  cornerScale?: number;
  /** Add glow effect */
  glow?: boolean;
  /** Glow intensity (0-1) */
  glowIntensity?: number;
  /** Draw direction (clockwise or counterclockwise) */
  direction?: 'cw' | 'ccw';
  /** Reverse animation when untriggered */
  reverseOnLeave?: boolean;
  /** Keep border visible after animation */
  persist?: boolean;
  /** Border radius to match container */
  borderRadius?: number | string;
  /** Callback when draw completes */
  onComplete?: () => void;
  /** Additional className */
  className?: string;
  /** Additional style */
  style?: CSSProperties;
}

function resolveColor(color: ColorPreset | string): string {
  return COLOR_PRESETS[color as ColorPreset] || color;
}

export const BorderDraw = memo(function BorderDraw({
  children,
  trigger = 'mount',
  active = false,
  color = 'default',
  thickness = 2,
  duration = 600,
  delay = 0,
  showCorners = true,
  cornerScale = 1,
  glow = true,
  glowIntensity = 0.5,
  direction = 'cw',
  reverseOnLeave = true,
  persist = true,
  borderRadius = 8,
  onComplete,
  className = '',
  style = {},
}: BorderDrawProps) {
  const { shouldAnimate } = useMotionPreferences();
  const prefersReducedMotion = !shouldAnimate('decorative');
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isReversing, setIsReversing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);
  
  const resolvedColor = resolveColor(color);
  
  // Determine if we should draw based on trigger mode
  const shouldDraw = trigger === 'mount' 
    ? true 
    : trigger === 'hover' 
      ? isHovered 
      : trigger === 'inView'
        ? isInView
        : active;

  // Intersection Observer for inView trigger
  useEffect(() => {
    if (trigger !== 'inView' || !containerRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [trigger]);

  // Handle draw state changes
  useEffect(() => {
    if (prefersReducedMotion) {
      setIsDrawing(false);
      setIsComplete(shouldDraw);
      return;
    }

    if (shouldDraw && !isDrawing && !isComplete) {
      // Start drawing after delay
      const timer = setTimeout(() => {
        setIsDrawing(true);
        setIsReversing(false);
      }, delay);
      return () => clearTimeout(timer);
    }
    
    if (!shouldDraw && isComplete && reverseOnLeave) {
      // Start reverse animation
      setIsReversing(true);
      setIsDrawing(true);
    }
  }, [shouldDraw, isDrawing, isComplete, delay, reverseOnLeave, prefersReducedMotion]);

  // Handle animation completion
  useEffect(() => {
    if (!isDrawing) return;
    
    const timer = setTimeout(() => {
      setIsDrawing(false);
      if (isReversing) {
        setIsComplete(false);
        setIsReversing(false);
      } else {
        setIsComplete(true);
        onComplete?.();
      }
    }, duration);
    
    return () => clearTimeout(timer);
  }, [isDrawing, isReversing, duration, onComplete]);

  // Calculate timing for each segment
  const segmentDuration = duration / 4;
  const segmentDelay = (index: number) => {
    const order = direction === 'cw' ? index : (3 - index);
    return isReversing ? (3 - order) * segmentDuration : order * segmentDuration;
  };

  const cornerSize = 4 * cornerScale;
  const showBorder = isDrawing || (persist && isComplete);
  
  // Reduced motion: just show/hide border instantly
  if (prefersReducedMotion) {
    return (
      <div 
        ref={containerRef}
        className={`border-draw-container ${className}`}
        style={{
          position: 'relative',
          ...style,
        }}
        onMouseEnter={() => trigger === 'hover' && setIsHovered(true)}
        onMouseLeave={() => trigger === 'hover' && setIsHovered(false)}
      >
        {children}
        {shouldDraw && (
          <div
            className="border-draw-static"
            style={{
              position: 'absolute',
              inset: 0,
              border: `${thickness}px solid ${resolvedColor}`,
              borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`border-draw-container ${className}`}
      style={{
        position: 'relative',
        ...style,
      }}
      onMouseEnter={() => trigger === 'hover' && setIsHovered(true)}
      onMouseLeave={() => trigger === 'hover' && setIsHovered(false)}
    >
      {children}
      
      {/* Border segments */}
      {showBorder && (
        <div 
          className="border-draw-wrapper"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
            overflow: 'hidden',
          }}
        >
          {/* Top border */}
          <div
            className="border-draw-segment border-draw-top"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: thickness,
              background: resolvedColor,
              transformOrigin: direction === 'cw' ? 'left center' : 'right center',
              transform: `scaleX(${isComplete && !isDrawing ? 1 : 0})`,
              transition: `transform ${segmentDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
              transitionDelay: `${segmentDelay(0)}ms`,
              boxShadow: glow ? `0 0 ${8 * glowIntensity}px ${4 * glowIntensity}px ${resolvedColor}40` : 'none',
            }}
          />
          
          {/* Right border */}
          <div
            className="border-draw-segment border-draw-right"
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: thickness,
              background: resolvedColor,
              transformOrigin: direction === 'cw' ? 'center top' : 'center bottom',
              transform: `scaleY(${isComplete && !isDrawing ? 1 : 0})`,
              transition: `transform ${segmentDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
              transitionDelay: `${segmentDelay(1)}ms`,
              boxShadow: glow ? `0 0 ${8 * glowIntensity}px ${4 * glowIntensity}px ${resolvedColor}40` : 'none',
            }}
          />
          
          {/* Bottom border */}
          <div
            className="border-draw-segment border-draw-bottom"
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: thickness,
              background: resolvedColor,
              transformOrigin: direction === 'cw' ? 'right center' : 'left center',
              transform: `scaleX(${isComplete && !isDrawing ? 1 : 0})`,
              transition: `transform ${segmentDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
              transitionDelay: `${segmentDelay(2)}ms`,
              boxShadow: glow ? `0 0 ${8 * glowIntensity}px ${4 * glowIntensity}px ${resolvedColor}40` : 'none',
            }}
          />
          
          {/* Left border */}
          <div
            className="border-draw-segment border-draw-left"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: thickness,
              background: resolvedColor,
              transformOrigin: direction === 'cw' ? 'center bottom' : 'center top',
              transform: `scaleY(${isComplete && !isDrawing ? 1 : 0})`,
              transition: `transform ${segmentDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
              transitionDelay: `${segmentDelay(3)}ms`,
              boxShadow: glow ? `0 0 ${8 * glowIntensity}px ${4 * glowIntensity}px ${resolvedColor}40` : 'none',
            }}
          />
          
          {/* Corner dots */}
          {showCorners && (
            <>
              {/* Top-left corner */}
              <div
                className="border-draw-corner border-draw-corner-tl"
                style={{
                  position: 'absolute',
                  top: -cornerSize / 2,
                  left: -cornerSize / 2,
                  width: cornerSize,
                  height: cornerSize,
                  borderRadius: '50%',
                  background: resolvedColor,
                  transform: `scale(${isComplete && !isDrawing ? 1 : 0})`,
                  transition: `transform ${segmentDuration / 2}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
                  transitionDelay: `${segmentDelay(0) - segmentDuration / 4}ms`,
                  boxShadow: glow ? `0 0 ${6 * glowIntensity}px ${3 * glowIntensity}px ${resolvedColor}60` : 'none',
                }}
              />
              
              {/* Top-right corner */}
              <div
                className="border-draw-corner border-draw-corner-tr"
                style={{
                  position: 'absolute',
                  top: -cornerSize / 2,
                  right: -cornerSize / 2,
                  width: cornerSize,
                  height: cornerSize,
                  borderRadius: '50%',
                  background: resolvedColor,
                  transform: `scale(${isComplete && !isDrawing ? 1 : 0})`,
                  transition: `transform ${segmentDuration / 2}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
                  transitionDelay: `${segmentDelay(1) - segmentDuration / 4}ms`,
                  boxShadow: glow ? `0 0 ${6 * glowIntensity}px ${3 * glowIntensity}px ${resolvedColor}60` : 'none',
                }}
              />
              
              {/* Bottom-right corner */}
              <div
                className="border-draw-corner border-draw-corner-br"
                style={{
                  position: 'absolute',
                  bottom: -cornerSize / 2,
                  right: -cornerSize / 2,
                  width: cornerSize,
                  height: cornerSize,
                  borderRadius: '50%',
                  background: resolvedColor,
                  transform: `scale(${isComplete && !isDrawing ? 1 : 0})`,
                  transition: `transform ${segmentDuration / 2}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
                  transitionDelay: `${segmentDelay(2) - segmentDuration / 4}ms`,
                  boxShadow: glow ? `0 0 ${6 * glowIntensity}px ${3 * glowIntensity}px ${resolvedColor}60` : 'none',
                }}
              />
              
              {/* Bottom-left corner */}
              <div
                className="border-draw-corner border-draw-corner-bl"
                style={{
                  position: 'absolute',
                  bottom: -cornerSize / 2,
                  left: -cornerSize / 2,
                  width: cornerSize,
                  height: cornerSize,
                  borderRadius: '50%',
                  background: resolvedColor,
                  transform: `scale(${isComplete && !isDrawing ? 1 : 0})`,
                  transition: `transform ${segmentDuration / 2}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
                  transitionDelay: `${segmentDelay(3) - segmentDuration / 4}ms`,
                  boxShadow: glow ? `0 0 ${6 * glowIntensity}px ${3 * glowIntensity}px ${resolvedColor}60` : 'none',
                }}
              />
            </>
          )}
        </div>
      )}

      <style jsx>{`
        .border-draw-container {
          isolation: isolate;
        }
        
        .border-draw-segment {
          will-change: transform;
        }
        
        .border-draw-corner {
          will-change: transform;
          z-index: 1;
        }
      `}</style>
    </div>
  );
});

/**
 * BorderDrawCard - Convenience wrapper for cards with border draw effect
 */
export const BorderDrawCard = memo(function BorderDrawCard({
  children,
  className = '',
  trigger = 'hover',
  color = 'default',
  ...props
}: BorderDrawProps & { children: React.ReactNode }) {
  return (
    <BorderDraw
      trigger={trigger}
      color={color}
      borderRadius={12}
      thickness={2}
      duration={500}
      {...props}
    >
      <div className={`border-draw-card ${className}`}>
        {children}
      </div>
      <style jsx>{`
        .border-draw-card {
          position: relative;
          z-index: 0;
        }
      `}</style>
    </BorderDraw>
  );
});

/**
 * BorderDrawBadge - Badge variant with faster animation
 */
export const BorderDrawBadge = memo(function BorderDrawBadge({
  children,
  className = '',
  color = 'gold',
  ...props
}: Omit<BorderDrawProps, 'children'> & { children: React.ReactNode; className?: string }) {
  return (
    <BorderDraw
      trigger="mount"
      color={color}
      borderRadius={999}
      thickness={1.5}
      duration={400}
      cornerScale={0.6}
      delay={200}
      {...props}
    >
      <span className={`border-draw-badge ${className}`}>
        {children}
      </span>
      <style jsx>{`
        .border-draw-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.75rem;
          position: relative;
          z-index: 0;
        }
      `}</style>
    </BorderDraw>
  );
});

/**
 * MonsterBeatBorder - Pre-configured for monster beat results (≥15% surprise)
 */
export const MonsterBeatBorder = memo(function MonsterBeatBorder({
  children,
  surprise = 15,
  className = '',
}: {
  children: React.ReactNode;
  surprise?: number;
  className?: string;
}) {
  // Scale glow intensity based on surprise magnitude
  const glowIntensity = Math.min(1, 0.4 + (surprise - 15) * 0.03);
  
  return (
    <BorderDraw
      trigger="inView"
      color={surprise >= 25 ? 'gold' : 'beat'}
      thickness={surprise >= 25 ? 3 : 2}
      duration={800}
      delay={300}
      glow={true}
      glowIntensity={glowIntensity}
      borderRadius={12}
      showCorners={surprise >= 25}
      className={className}
    >
      {children}
    </BorderDraw>
  );
});

/**
 * DisasterMissBorder - Pre-configured for disaster miss results (≤-15% surprise)
 */
export const DisasterMissBorder = memo(function DisasterMissBorder({
  children,
  surprise = -15,
  className = '',
}: {
  children: React.ReactNode;
  surprise?: number;
  className?: string;
}) {
  const absSuprise = Math.abs(surprise);
  const glowIntensity = Math.min(1, 0.4 + (absSuprise - 15) * 0.03);
  
  return (
    <BorderDraw
      trigger="inView"
      color="miss"
      thickness={absSuprise >= 25 ? 3 : 2}
      duration={800}
      delay={300}
      glow={true}
      glowIntensity={glowIntensity}
      borderRadius={12}
      showCorners={absSuprise >= 25}
      direction="ccw"
      className={className}
    >
      {children}
    </BorderDraw>
  );
});

/**
 * ThisWeekBorder - Highlight for current week section
 */
export const ThisWeekBorder = memo(function ThisWeekBorder({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <BorderDraw
      trigger="inView"
      color="default"
      thickness={2}
      duration={1000}
      delay={500}
      glow={true}
      glowIntensity={0.3}
      borderRadius={16}
      showCorners={true}
      cornerScale={1.2}
      persist={true}
      reverseOnLeave={false}
      className={className}
    >
      {children}
    </BorderDraw>
  );
});

/**
 * useBorderDraw - Hook for programmatic control
 */
export function useBorderDraw() {
  const [isActive, setIsActive] = useState(false);
  
  const trigger = useCallback(() => {
    setIsActive(true);
  }, []);
  
  const reset = useCallback(() => {
    setIsActive(false);
  }, []);
  
  const toggle = useCallback(() => {
    setIsActive(prev => !prev);
  }, []);
  
  return { isActive, trigger, reset, toggle };
}

export default BorderDraw;
