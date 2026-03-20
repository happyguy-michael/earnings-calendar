'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

/**
 * PaperUnfold - 3D paper-fold reveal animation
 * 
 * Inspired by Josh W. Comeau's "Folding the DOM" technique and 2026's
 * "Tangible UI" trend. Cards unfold like paper when entering the viewport,
 * creating a physical, crafted feel.
 * 
 * Features:
 * - IntersectionObserver-based trigger for scroll reveal
 * - 3D CSS transforms with perspective for depth
 * - Paper backface with subtle texture
 * - Spring-based easing for natural motion
 * - Configurable fold direction and intensity
 * - Full prefers-reduced-motion support
 * 
 * @example
 * <PaperUnfold delay={100}>
 *   <EarningsCard ... />
 * </PaperUnfold>
 */

interface PaperUnfoldProps {
  children: React.ReactNode;
  /** Delay before animation starts (ms) */
  delay?: number;
  /** Animation duration (ms) */
  duration?: number;
  /** Fold direction: 'down' folds from top, 'up' folds from bottom */
  direction?: 'down' | 'up';
  /** Maximum fold angle (degrees) */
  maxAngle?: number;
  /** Perspective distance for 3D effect (px) */
  perspective?: number;
  /** Intersection threshold to trigger unfold */
  threshold?: number;
  /** Show paper backface during fold */
  showBackface?: boolean;
  /** Backface opacity (0-1) */
  backfaceOpacity?: number;
  /** Paper crease shadow intensity */
  creaseShadow?: number;
  /** Once unfolded, stay unfolded */
  once?: boolean;
  /** Custom className */
  className?: string;
  /** Callback when unfold completes */
  onUnfold?: () => void;
}

// Cubic bezier for paper-like spring motion
const PAPER_EASING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

export function PaperUnfold({
  children,
  delay = 0,
  duration = 600,
  direction = 'down',
  maxAngle = 90,
  perspective = 1200,
  threshold = 0.15,
  showBackface = true,
  backfaceOpacity = 0.85,
  creaseShadow = 0.3,
  once = true,
  className = '',
  onUnfold,
}: PaperUnfoldProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isUnfolded, setIsUnfolded] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Intersection observer for scroll-triggered unfold
  useEffect(() => {
    if (prefersReducedMotion) {
      setIsUnfolded(true);
      setHasAnimated(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Delay the unfold animation
          const timer = setTimeout(() => {
            setIsUnfolded(true);
            setHasAnimated(true);
            onUnfold?.();
          }, delay);

          if (once) {
            observer.disconnect();
          }

          return () => clearTimeout(timer);
        } else if (!once && hasAnimated) {
          setIsUnfolded(false);
        }
      },
      { threshold, rootMargin: '50px 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [delay, threshold, once, hasAnimated, prefersReducedMotion, onUnfold]);

  // Calculate fold angle based on state
  const foldAngle = isUnfolded ? 0 : maxAngle;
  
  // Transform origin based on direction
  const transformOrigin = direction === 'down' ? 'center top' : 'center bottom';
  
  // Rotation direction
  const rotateDirection = direction === 'down' ? 1 : -1;

  // Skip animation entirely for reduced motion
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      className={`paper-unfold-wrapper ${className}`}
      style={{
        perspective: `${perspective}px`,
        perspectiveOrigin: 'center center',
      }}
    >
      <div
        className="paper-unfold-content"
        style={{
          transform: `rotateX(${foldAngle * rotateDirection}deg)`,
          transformOrigin,
          transformStyle: 'preserve-3d',
          transition: isUnfolded 
            ? `transform ${duration}ms ${PAPER_EASING}`
            : 'none',
          willChange: 'transform',
          backfaceVisibility: 'hidden',
        }}
      >
        {children}
        
        {/* Paper backface - visible when folded */}
        {showBackface && (
          <div
            className="paper-unfold-backface"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: `rgba(255, 255, 255, ${backfaceOpacity})`,
              transform: 'rotateX(180deg) translateZ(1px)',
              backfaceVisibility: 'hidden',
              borderRadius: 'inherit',
              // Subtle paper texture
              backgroundImage: `
                radial-gradient(circle at 20% 30%, rgba(0,0,0,0.02) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(0,0,0,0.02) 0%, transparent 50%)
              `,
            }}
          />
        )}
        
        {/* Crease shadow at fold line */}
        <div
          className="paper-unfold-crease"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: '4px',
            ...(direction === 'down' ? { top: 0 } : { bottom: 0 }),
            background: `linear-gradient(
              ${direction === 'down' ? 'to bottom' : 'to top'},
              rgba(0, 0, 0, ${creaseShadow * (1 - (foldAngle / maxAngle) * 0.5)}),
              transparent
            )`,
            opacity: foldAngle > 0 ? 1 : 0,
            transition: `opacity ${duration}ms ease-out`,
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />
      </div>
    </div>
  );
}

/**
 * PaperUnfoldGroup - Staggered unfold animation for multiple items
 * 
 * Wraps children and staggers their unfold timing for a cascading effect.
 */
interface PaperUnfoldGroupProps {
  children: React.ReactNode;
  /** Stagger delay between items (ms) */
  stagger?: number;
  /** Base delay before first item (ms) */
  baseDelay?: number;
  /** Shared animation settings */
  duration?: number;
  direction?: 'down' | 'up';
  maxAngle?: number;
  perspective?: number;
  threshold?: number;
  className?: string;
}

export function PaperUnfoldGroup({
  children,
  stagger = 80,
  baseDelay = 0,
  duration = 600,
  direction = 'down',
  maxAngle = 90,
  perspective = 1200,
  threshold = 0.1,
  className = '',
}: PaperUnfoldGroupProps) {
  const childArray = React.Children.toArray(children);

  return (
    <div className={`paper-unfold-group ${className}`}>
      {childArray.map((child, index) => (
        <PaperUnfold
          key={index}
          delay={baseDelay + index * stagger}
          duration={duration}
          direction={direction}
          maxAngle={maxAngle}
          perspective={perspective}
          threshold={threshold}
        >
          {child}
        </PaperUnfold>
      ))}
    </div>
  );
}

/**
 * FoldingCard - Card with hover fold-peek effect
 * 
 * On hover, lifts a corner like peeking under a piece of paper.
 */
interface FoldingCardProps {
  children: React.ReactNode;
  /** Which corner to peek */
  corner?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
  /** Maximum peek angle (degrees) */
  peekAngle?: number;
  /** Animation duration (ms) */
  duration?: number;
  /** Show shadow under lifted corner */
  shadow?: boolean;
  className?: string;
}

export function FoldingCard({
  children,
  corner = 'bottom-right',
  peekAngle = 25,
  duration = 300,
  shadow = true,
  className = '',
}: FoldingCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Transform origin based on corner
  const transformOrigins: Record<string, string> = {
    'top-right': 'bottom left',
    'bottom-right': 'top left',
    'bottom-left': 'top right',
    'top-left': 'bottom right',
  };

  // Rotation axis based on corner
  const getRotation = () => {
    if (prefersReducedMotion || !isHovered) return 'none';
    
    switch (corner) {
      case 'top-right':
        return `rotate3d(1, -1, 0, ${peekAngle}deg)`;
      case 'bottom-right':
        return `rotate3d(-1, -1, 0, ${peekAngle}deg)`;
      case 'bottom-left':
        return `rotate3d(-1, 1, 0, ${peekAngle}deg)`;
      case 'top-left':
        return `rotate3d(1, 1, 0, ${peekAngle}deg)`;
      default:
        return 'none';
    }
  };

  // Shadow position based on corner
  const getShadow = () => {
    if (!shadow || !isHovered || prefersReducedMotion) {
      return 'none';
    }

    const intensity = 0.15;
    const blur = 20;
    const spread = 5;

    switch (corner) {
      case 'top-right':
        return `10px -10px ${blur}px ${spread}px rgba(0, 0, 0, ${intensity})`;
      case 'bottom-right':
        return `10px 10px ${blur}px ${spread}px rgba(0, 0, 0, ${intensity})`;
      case 'bottom-left':
        return `-10px 10px ${blur}px ${spread}px rgba(0, 0, 0, ${intensity})`;
      case 'top-left':
        return `-10px -10px ${blur}px ${spread}px rgba(0, 0, 0, ${intensity})`;
      default:
        return 'none';
    }
  };

  return (
    <div
      className={`folding-card-wrapper ${className}`}
      style={{
        perspective: '1000px',
        perspectiveOrigin: transformOrigins[corner],
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="folding-card-content"
        style={{
          transform: getRotation(),
          transformOrigin: transformOrigins[corner],
          boxShadow: getShadow(),
          transition: `transform ${duration}ms cubic-bezier(0.34, 1.2, 0.64, 1), box-shadow ${duration}ms ease-out`,
          willChange: 'transform',
        }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * UnfoldReveal - Content reveals by unfolding multiple segments
 * 
 * Like opening a folded letter - multiple panels unfold sequentially.
 */
interface UnfoldRevealProps {
  children: React.ReactNode;
  /** Number of fold segments */
  segments?: number;
  /** Total animation duration (ms) */
  duration?: number;
  /** Stagger between segments (ms) */
  segmentStagger?: number;
  /** Trigger reveal */
  reveal?: boolean;
  /** Perspective for 3D effect */
  perspective?: number;
  className?: string;
}

export function UnfoldReveal({
  children,
  segments = 3,
  duration = 800,
  segmentStagger = 100,
  reveal = true,
  perspective = 1000,
  className = '',
}: UnfoldRevealProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const segmentHeight = 100 / segments;
  const segmentDuration = duration / segments;

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={`unfold-reveal-wrapper ${className}`}
      style={{
        perspective: `${perspective}px`,
        overflow: 'hidden',
      }}
    >
      <div className="unfold-reveal-content" style={{ position: 'relative' }}>
        {children}
        
        {/* Overlay segments that fold away */}
        {Array.from({ length: segments }).map((_, i) => {
          const delay = i * segmentStagger;
          const isRevealed = reveal;
          
          return (
            <div
              key={i}
              className="unfold-reveal-segment"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: `${i * segmentHeight}%`,
                height: `${segmentHeight}%`,
                backgroundColor: 'var(--bg-card, #18181b)',
                transformOrigin: 'center top',
                transform: isRevealed ? 'rotateX(-90deg)' : 'rotateX(0deg)',
                transition: `transform ${segmentDuration}ms cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`,
                backfaceVisibility: 'hidden',
                // Gradient to simulate folded paper depth
                background: `linear-gradient(
                  to bottom,
                  var(--bg-card, #18181b) 0%,
                  color-mix(in srgb, var(--bg-card, #18181b) 95%, black) 100%
                )`,
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default PaperUnfold;
