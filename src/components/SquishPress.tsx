'use client';

import { useState, useCallback, useRef, ReactNode, CSSProperties, useMemo, useEffect } from 'react';

interface SquishPressProps {
  /** Content to wrap with squish effect */
  children: ReactNode;
  /** Squish intensity when pressed (0-1, where 1 = full squish) */
  intensity?: number;
  /** Direction of squish: 'vertical' squishes Y, 'horizontal' squishes X, 'both' squishes uniformly */
  direction?: 'vertical' | 'horizontal' | 'both';
  /** Spring preset for the release bounce */
  spring?: 'snappy' | 'bouncy' | 'elastic' | 'smooth';
  /** Additional scale up on hover */
  hoverScale?: number;
  /** Disable the effect */
  disabled?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional className */
  className?: string;
  /** Additional style */
  style?: CSSProperties;
  /** Wrapper element type */
  as?: 'div' | 'span' | 'button';
  /** Accessible label for button mode */
  'aria-label'?: string;
  /** Whether to apply subtle rotation on press (adds organic feel) */
  rotate?: boolean;
  /** Maximum rotation degrees when rotate=true */
  maxRotation?: number;
}

/**
 * SquishPress - Tactile "gummy" press effect using native CSS spring physics
 * 
 * Inspired by:
 * - Elastic SVG Morphing Form Controls (Dribbble 2025)
 * - iOS button press feedback
 * - Material Design 3 touch states
 * - Josh Comeau's CSS spring article
 * 
 * When pressed, elements squish down with a satisfying elastic deformation,
 * then bounce back with physics-based spring animation using CSS linear().
 * 
 * Features:
 * - Native CSS springs via linear() timing function (no JS animation)
 * - Directional squish (vertical, horizontal, or uniform)
 * - Optional subtle rotation for organic feel
 * - Touch-friendly with proper touch events
 * - Respects prefers-reduced-motion
 * - Hardware-accelerated transforms
 * 
 * @example
 * // Basic squish button
 * <SquishPress onClick={handleClick}>
 *   <button>Click Me</button>
 * </SquishPress>
 * 
 * // Bouncy card press
 * <SquishPress intensity={0.12} spring="bouncy" direction="both">
 *   <Card>Interactive content</Card>
 * </SquishPress>
 * 
 * // Subtle horizontal squish
 * <SquishPress direction="horizontal" intensity={0.05} spring="snappy">
 *   <Badge>Tag</Badge>
 * </SquishPress>
 */
export function SquishPress({
  children,
  intensity = 0.08,
  direction = 'vertical',
  spring = 'bouncy',
  hoverScale = 1.02,
  disabled = false,
  onClick,
  className = '',
  style,
  as: Component = 'div',
  'aria-label': ariaLabel,
  rotate = false,
  maxRotation = 2,
}: SquishPressProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [rotation, setRotation] = useState(0);
  const elementRef = useRef<HTMLElement>(null);
  const pressPointRef = useRef({ x: 0, y: 0 });

  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      
      const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  // Calculate rotation based on press position
  const calculateRotation = useCallback((clientX: number, clientY: number) => {
    if (!rotate || !elementRef.current) return 0;
    
    const rect = elementRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate offset from center (-1 to 1)
    const offsetX = (clientX - centerX) / (rect.width / 2);
    const offsetY = (clientY - centerY) / (rect.height / 2);
    
    // Combine offsets for slight tilt toward press point
    // Positive X offset = tilt clockwise, negative Y offset = tilt clockwise
    return (offsetX - offsetY * 0.5) * maxRotation;
  }, [rotate, maxRotation]);

  // Press handlers
  const handlePressStart = useCallback((clientX: number, clientY: number) => {
    if (disabled || prefersReducedMotion) return;
    
    pressPointRef.current = { x: clientX, y: clientY };
    setIsPressed(true);
    
    if (rotate) {
      setRotation(calculateRotation(clientX, clientY));
    }
  }, [disabled, prefersReducedMotion, rotate, calculateRotation]);

  const handlePressEnd = useCallback(() => {
    setIsPressed(false);
    setRotation(0);
  }, []);

  // Mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    handlePressStart(e.clientX, e.clientY);
  }, [handlePressStart]);

  const handleMouseUp = useCallback(() => {
    handlePressEnd();
  }, [handlePressEnd]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    handlePressEnd();
  }, [handlePressEnd]);

  const handleMouseEnter = useCallback(() => {
    if (!disabled) setIsHovered(true);
  }, [disabled]);

  // Touch events
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      handlePressStart(touch.clientX, touch.clientY);
    }
  }, [handlePressStart]);

  const handleTouchEnd = useCallback(() => {
    handlePressEnd();
  }, [handlePressEnd]);

  const handleClick = useCallback(() => {
    if (!disabled && onClick) {
      onClick();
    }
  }, [disabled, onClick]);

  // Calculate transform based on state
  const transform = useMemo(() => {
    if (disabled || prefersReducedMotion) return 'none';
    
    if (isPressed) {
      // Calculate squish transform
      let scaleX = 1;
      let scaleY = 1;
      
      switch (direction) {
        case 'vertical':
          scaleY = 1 - intensity;
          scaleX = 1 + intensity * 0.3; // Slight horizontal expansion for volume preservation
          break;
        case 'horizontal':
          scaleX = 1 - intensity;
          scaleY = 1 + intensity * 0.3;
          break;
        case 'both':
          scaleX = 1 - intensity;
          scaleY = 1 - intensity;
          break;
      }
      
      const rotateStr = rotate ? ` rotate(${rotation}deg)` : '';
      return `scale(${scaleX}, ${scaleY})${rotateStr}`;
    }
    
    if (isHovered && hoverScale !== 1) {
      return `scale(${hoverScale})`;
    }
    
    return 'scale(1)';
  }, [disabled, prefersReducedMotion, isPressed, isHovered, direction, intensity, hoverScale, rotate, rotation]);

  // Map spring preset to CSS variable
  const springVar = useMemo(() => {
    switch (spring) {
      case 'snappy': return 'var(--spring-snappy, cubic-bezier(0.34, 1.56, 0.64, 1))';
      case 'bouncy': return 'var(--spring-bouncy, cubic-bezier(0.34, 1.56, 0.64, 1))';
      case 'elastic': return 'var(--spring-elastic, cubic-bezier(0.34, 1.56, 0.64, 1))';
      case 'smooth': return 'var(--spring-smooth, cubic-bezier(0.25, 0.1, 0.25, 1))';
      default: return 'var(--spring-bouncy, cubic-bezier(0.34, 1.56, 0.64, 1))';
    }
  }, [spring]);

  // Duration varies by spring type
  const duration = useMemo(() => {
    if (isPressed) return '0.12s'; // Quick press
    switch (spring) {
      case 'snappy': return '0.35s';
      case 'bouncy': return '0.5s';
      case 'elastic': return '0.65s';
      case 'smooth': return '0.4s';
      default: return '0.5s';
    }
  }, [spring, isPressed]);

  const combinedStyle: CSSProperties = useMemo(() => ({
    ...style,
    transform,
    transformOrigin: 'center center',
    transition: prefersReducedMotion 
      ? 'none' 
      : `transform ${isPressed ? '0.1s ease-out' : `${duration} ${springVar}`}`,
    willChange: isPressed || isHovered ? 'transform' : 'auto',
    cursor: disabled ? 'default' : onClick ? 'pointer' : 'default',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
  }), [style, transform, prefersReducedMotion, isPressed, duration, springVar, isHovered, disabled, onClick]);

  const props = {
    ref: elementRef as any,
    className: `squish-press ${isPressed ? 'squish-pressed' : ''} ${isHovered ? 'squish-hovered' : ''} ${className}`,
    style: combinedStyle,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseLeave,
    onMouseEnter: handleMouseEnter,
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchEnd,
    onClick: handleClick,
    ...(Component === 'button' ? { type: 'button' as const } : {}),
    ...(ariaLabel ? { 'aria-label': ariaLabel } : {}),
    ...(onClick && Component !== 'button' ? { role: 'button', tabIndex: 0 } : {}),
  };

  return <Component {...props}>{children}</Component>;
}

/**
 * SquishButton - Pre-styled button with squish press effect
 */
export function SquishButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: Omit<SquishPressProps, 'as'> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <>
      <SquishPress
        as="button"
        intensity={0.06}
        spring="snappy"
        direction="both"
        className={`squish-button squish-button-${variant} squish-button-${size} ${className}`}
        {...props}
      >
        {children}
      </SquishPress>
      <style jsx global>{`
        .squish-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5em;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          font-family: inherit;
          white-space: nowrap;
          position: relative;
          overflow: hidden;
        }
        
        .squish-button-sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.8125rem;
          border-radius: 6px;
        }
        
        .squish-button-md {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }
        
        .squish-button-lg {
          padding: 0.625rem 1.25rem;
          font-size: 0.9375rem;
          border-radius: 10px;
        }
        
        .squish-button-primary {
          background: linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-blue) 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
        }
        
        .squish-button-primary:hover:not(:disabled) {
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
        }
        
        .squish-button-secondary {
          background: var(--bg-hover);
          color: var(--text-primary);
          border: 1px solid var(--border-primary);
        }
        
        .squish-button-ghost {
          background: transparent;
          color: var(--text-secondary);
        }
        
        .squish-button-ghost:hover:not(:disabled) {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        
        .squish-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .squish-button:focus-visible {
          outline: 2px solid var(--accent-purple);
          outline-offset: 2px;
        }
      `}</style>
    </>
  );
}

/**
 * SquishCard - Card wrapper with subtle squish on press
 */
export function SquishCard({
  children,
  className = '',
  intensity = 0.025,
  ...props
}: Omit<SquishPressProps, 'intensity' | 'direction' | 'spring'> & {
  intensity?: number;
}) {
  return (
    <SquishPress
      intensity={intensity}
      direction="both"
      spring="smooth"
      hoverScale={1.01}
      rotate={true}
      maxRotation={0.5}
      className={`squish-card ${className}`}
      {...props}
    >
      {children}
    </SquishPress>
  );
}

/**
 * SquishBadge - Badge/chip with bouncy press feedback
 */
export function SquishBadge({
  children,
  className = '',
  color = 'default',
  ...props
}: Omit<SquishPressProps, 'intensity' | 'direction' | 'spring' | 'hoverScale'> & {
  color?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}) {
  return (
    <>
      <SquishPress
        as="span"
        intensity={0.1}
        direction="horizontal"
        spring="bouncy"
        hoverScale={1.05}
        className={`squish-badge squish-badge-${color} ${className}`}
        {...props}
      >
        {children}
      </SquishPress>
      <style jsx global>{`
        .squish-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25em;
          padding: 0.25em 0.625em;
          font-size: 0.75rem;
          font-weight: 500;
          border-radius: 9999px;
          cursor: pointer;
        }
        
        .squish-badge-default {
          background: var(--bg-hover);
          color: var(--text-secondary);
        }
        
        .squish-badge-success {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }
        
        .squish-badge-warning {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }
        
        .squish-badge-danger {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }
        
        .squish-badge-info {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
        }
      `}</style>
    </>
  );
}

/**
 * SquishIcon - Icon button with centered squish
 */
export function SquishIcon({
  children,
  size = 40,
  className = '',
  ...props
}: Omit<SquishPressProps, 'direction' | 'spring'> & {
  size?: number;
}) {
  return (
    <>
      <SquishPress
        intensity={0.12}
        direction="both"
        spring="elastic"
        hoverScale={1.1}
        className={`squish-icon ${className}`}
        style={{ width: size, height: size }}
        {...props}
      >
        {children}
      </SquishPress>
      <style jsx global>{`
        .squish-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: var(--bg-hover);
          color: var(--text-primary);
          cursor: pointer;
        }
        
        .squish-icon:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .squish-icon:focus-visible {
          outline: 2px solid var(--accent-purple);
          outline-offset: 2px;
        }
      `}</style>
    </>
  );
}

export default SquishPress;
