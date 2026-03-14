'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface TrailPoint {
  x: number;
  y: number;
  age: number;
  id: number;
}

interface CursorTrailProps {
  /** Number of trail points */
  count?: number;
  /** Size of trail dots in pixels */
  dotSize?: number;
  /** Trail decay speed (ms per point removal) */
  decaySpeed?: number;
  /** Trail color (CSS color value) */
  color?: string;
  /** Secondary glow color */
  glowColor?: string;
  /** Whether the trail is enabled */
  enabled?: boolean;
  /** Minimum distance before adding new point (prevents clustering) */
  minDistance?: number;
  /** Opacity falloff factor (higher = faster fade) */
  opacityFalloff?: number;
  /** Whether to show glow effect */
  showGlow?: boolean;
  /** Only show trail when moving fast */
  velocityThreshold?: number;
}

/**
 * CursorTrail - Premium cursor trail effect
 * 
 * Creates a subtle, elegant trail of particles that follow
 * the cursor, adding a sense of fluidity and polish.
 * 
 * Features:
 * - Smooth trail with natural decay
 * - Hardware-accelerated with canvas
 * - Velocity-aware (stronger trail when moving fast)
 * - Subtle glow effect for premium feel
 * - Respects prefers-reduced-motion
 * - Only activates on pointer devices (not touch)
 * - Performance optimized with requestAnimationFrame
 * 
 * Inspiration:
 * - Stripe.com subtle cursor interactions
 * - Linear.app premium feel
 * - Modern portfolio sites
 * - Gaming UI particle effects
 */
export function CursorTrail({
  count = 20,
  dotSize = 4,
  decaySpeed = 40,
  color = 'rgba(99, 102, 241, 0.8)',
  glowColor = 'rgba(139, 92, 246, 0.4)',
  enabled = true,
  minDistance = 8,
  opacityFalloff = 2.5,
  showGlow = true,
  velocityThreshold = 0,
}: CursorTrailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<TrailPoint[]>([]);
  const lastPointRef = useRef({ x: 0, y: 0 });
  const idCounterRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lastMoveTimeRef = useRef(0);
  const velocityRef = useRef(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isPointerDevice, setIsPointerDevice] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  // Check for reduced motion preference and pointer device
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointerQuery = window.matchMedia('(pointer: fine)');
    
    setPrefersReducedMotion(motionQuery.matches);
    setIsPointerDevice(pointerQuery.matches);
    
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    const handlePointerChange = (e: MediaQueryListEvent) => {
      setIsPointerDevice(e.matches);
    };
    
    motionQuery.addEventListener('change', handleMotionChange);
    pointerQuery.addEventListener('change', handlePointerChange);
    
    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      pointerQuery.removeEventListener('change', handlePointerChange);
    };
  }, []);

  // Resize canvas to match window
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Age and filter trail points
    const now = performance.now();
    trailRef.current = trailRef.current
      .map(point => ({ ...point, age: point.age + 1 }))
      .filter(point => point.age < count);

    // Draw trail points
    trailRef.current.forEach((point, index) => {
      const progress = point.age / count;
      const opacity = Math.pow(1 - progress, opacityFalloff);
      const size = dotSize * (1 - progress * 0.5);
      
      // Skip if too transparent
      if (opacity < 0.01) return;

      // Extract RGB from color string
      const colorMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      const r = colorMatch ? parseInt(colorMatch[1]) : 99;
      const g = colorMatch ? parseInt(colorMatch[2]) : 102;
      const b = colorMatch ? parseInt(colorMatch[3]) : 241;
      
      // Draw glow
      if (showGlow && opacity > 0.3) {
        const glowMatch = glowColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        const gr = glowMatch ? parseInt(glowMatch[1]) : 139;
        const gg = glowMatch ? parseInt(glowMatch[2]) : 92;
        const gb = glowMatch ? parseInt(glowMatch[3]) : 246;
        
        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, size * 3
        );
        gradient.addColorStop(0, `rgba(${gr}, ${gg}, ${gb}, ${opacity * 0.3})`);
        gradient.addColorStop(1, `rgba(${gr}, ${gg}, ${gb}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, size * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw main dot
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
      ctx.beginPath();
      ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
      ctx.fill();
    });

    rafRef.current = requestAnimationFrame(animate);
  }, [count, dotSize, color, glowColor, opacityFalloff, showGlow]);

  // Start/stop animation loop
  useEffect(() => {
    if (!enabled || prefersReducedMotion || !isPointerDevice) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    rafRef.current = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(rafRef.current);
  }, [enabled, prefersReducedMotion, isPointerDevice, animate]);

  // Track mouse movement
  useEffect(() => {
    if (!enabled || prefersReducedMotion || !isPointerDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      const x = e.clientX;
      const y = e.clientY;
      
      // Calculate velocity
      const dx = x - lastPointRef.current.x;
      const dy = y - lastPointRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const timeDelta = now - lastMoveTimeRef.current;
      
      if (timeDelta > 0) {
        velocityRef.current = distance / timeDelta;
      }
      
      // Show trail when moving
      if (distance > 0) {
        setIsVisible(true);
      }
      
      // Only add point if moved enough distance and velocity above threshold
      if (distance >= minDistance && velocityRef.current >= velocityThreshold) {
        trailRef.current.push({
          x,
          y,
          age: 0,
          id: idCounterRef.current++,
        });
        
        // Limit trail length
        if (trailRef.current.length > count) {
          trailRef.current = trailRef.current.slice(-count);
        }
      }
      
      lastPointRef.current = { x, y };
      lastMoveTimeRef.current = now;
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
      // Clear trail when cursor leaves
      trailRef.current = [];
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [enabled, prefersReducedMotion, isPointerDevice, minDistance, count, velocityThreshold]);

  // Don't render if disabled or reduced motion preferred
  if (!enabled || prefersReducedMotion || !isPointerDevice) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9998,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
    />
  );
}

/**
 * CursorTrailToggle - Toggle button for cursor trail effect
 */
interface CursorTrailToggleProps {
  enabled: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function CursorTrailToggle({ 
  enabled, 
  onToggle,
  size = 'sm' 
}: CursorTrailToggleProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <button
      onClick={onToggle}
      className={`cursor-trail-toggle ${sizeClasses[size]} rounded-xl flex items-center justify-center transition-all duration-200`}
      style={{
        background: enabled 
          ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.15))'
          : 'rgba(255, 255, 255, 0.05)',
        border: `1px solid ${enabled ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
        color: enabled ? '#a5b4fc' : '#71717a',
        boxShadow: enabled ? '0 0 15px rgba(99, 102, 241, 0.2)' : 'none',
      }}
      title={enabled ? 'Disable cursor trail' : 'Enable cursor trail'}
      aria-label={enabled ? 'Disable cursor trail' : 'Enable cursor trail'}
      aria-pressed={enabled}
    >
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5"
        className="w-4 h-4"
      >
        {/* Cursor trail icon */}
        <path 
          d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        {enabled && (
          <>
            {/* Trail dots */}
            <circle cx="17" cy="17" r="1.5" fill="currentColor" opacity="0.8" />
            <circle cx="19" cy="19" r="1" fill="currentColor" opacity="0.5" />
            <circle cx="20.5" cy="20.5" r="0.7" fill="currentColor" opacity="0.3" />
          </>
        )}
      </svg>
    </button>
  );
}

/**
 * useCursorTrail - Hook to manage cursor trail state
 */
export function useCursorTrail(defaultEnabled = true) {
  const [enabled, setEnabled] = useState(defaultEnabled);
  
  // Persist preference
  useEffect(() => {
    const stored = localStorage.getItem('cursor-trail-enabled');
    if (stored !== null) {
      setEnabled(stored === 'true');
    }
  }, []);
  
  const toggle = useCallback(() => {
    setEnabled(prev => {
      const next = !prev;
      localStorage.setItem('cursor-trail-enabled', String(next));
      return next;
    });
  }, []);
  
  return { enabled, toggle, setEnabled };
}

export default CursorTrail;
