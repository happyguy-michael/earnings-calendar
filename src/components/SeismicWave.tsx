'use client';

import { useEffect, useRef, useState, useCallback, createContext, useContext, memo } from 'react';

/**
 * SeismicWave - Page-wide ripple effect for exceptional data events
 * 
 * 2026 Design Trend: "Environmental Feedback" - the entire UI responds
 * to significant events, not just the element containing them.
 * 
 * Seen in: Apple keynote reveals, Stripe payment success animations,
 * Linear milestone celebrations, Notion page creation
 * 
 * Features:
 * - Page-wide concentric wave animation from a focal point
 * - Triggered by data conditions (exceptional beats/misses)
 * - Multiple intensity levels (mild, strong, massive)
 * - Theme-aware colors (success green, danger red, neutral)
 * - Respects prefers-reduced-motion
 * - Non-blocking, purely decorative
 * - Configurable wave count, speed, and opacity
 * - Sound integration ready (optional haptic cue)
 */

interface SeismicWaveContextValue {
  triggerWave: (options: WaveOptions) => void;
}

interface WaveOptions {
  x: number;
  y: number;
  variant?: 'success' | 'danger' | 'neutral' | 'gold';
  intensity?: 'mild' | 'strong' | 'massive';
  delay?: number;
}

interface ActiveWave extends WaveOptions {
  id: number;
  startTime: number;
}

const SeismicWaveContext = createContext<SeismicWaveContextValue | null>(null);

export function useSeismicWave() {
  const context = useContext(SeismicWaveContext);
  if (!context) {
    // Return a no-op if used outside provider (graceful degradation)
    return { triggerWave: () => {} };
  }
  return context;
}

// Wave configuration by intensity
const INTENSITY_CONFIG = {
  mild: {
    waveCount: 2,
    maxRadius: 400,
    duration: 1200,
    baseOpacity: 0.08,
    strokeWidth: 1,
  },
  strong: {
    waveCount: 3,
    maxRadius: 600,
    duration: 1500,
    baseOpacity: 0.12,
    strokeWidth: 1.5,
  },
  massive: {
    waveCount: 4,
    maxRadius: 900,
    duration: 2000,
    baseOpacity: 0.15,
    strokeWidth: 2,
  },
};

// Color schemes by variant
const VARIANT_COLORS = {
  success: {
    stroke: 'rgb(34, 197, 94)',      // green-500
    fill: 'rgba(34, 197, 94, 0.03)',
    glow: 'rgba(34, 197, 94, 0.2)',
  },
  danger: {
    stroke: 'rgb(239, 68, 68)',       // red-500
    fill: 'rgba(239, 68, 68, 0.03)',
    glow: 'rgba(239, 68, 68, 0.2)',
  },
  neutral: {
    stroke: 'rgb(148, 163, 184)',     // slate-400
    fill: 'rgba(148, 163, 184, 0.02)',
    glow: 'rgba(148, 163, 184, 0.15)',
  },
  gold: {
    stroke: 'rgb(234, 179, 8)',       // yellow-500
    fill: 'rgba(234, 179, 8, 0.03)',
    glow: 'rgba(234, 179, 8, 0.2)',
  },
};

interface SeismicWaveProviderProps {
  children: React.ReactNode;
  maxConcurrentWaves?: number;
  enabled?: boolean;
}

export function SeismicWaveProvider({ 
  children, 
  maxConcurrentWaves = 3,
  enabled = true
}: SeismicWaveProviderProps) {
  const [waves, setWaves] = useState<ActiveWave[]>([]);
  const waveIdRef = useRef(0);
  const prefersReducedMotion = useRef(false);

  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mq.matches;
    
    const handler = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const triggerWave = useCallback((options: WaveOptions) => {
    if (!enabled || prefersReducedMotion.current) return;

    const delay = options.delay ?? 0;
    
    setTimeout(() => {
      setWaves(prev => {
        // Remove oldest wave if at max
        const trimmed = prev.length >= maxConcurrentWaves 
          ? prev.slice(1) 
          : prev;
        
        return [
          ...trimmed,
          {
            ...options,
            id: waveIdRef.current++,
            startTime: Date.now(),
          }
        ];
      });
    }, delay);
  }, [enabled, maxConcurrentWaves]);

  const removeWave = useCallback((id: number) => {
    setWaves(prev => prev.filter(w => w.id !== id));
  }, []);

  return (
    <SeismicWaveContext.Provider value={{ triggerWave }}>
      {children}
      {enabled && waves.length > 0 && (
        <SeismicWaveCanvas waves={waves} onWaveComplete={removeWave} />
      )}
    </SeismicWaveContext.Provider>
  );
}

// Canvas-based wave renderer for performance
interface SeismicWaveCanvasProps {
  waves: ActiveWave[];
  onWaveComplete: (id: number) => void;
}

const SeismicWaveCanvas = memo(function SeismicWaveCanvas({ 
  waves, 
  onWaveComplete 
}: SeismicWaveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const wavesRef = useRef(waves);
  
  // Keep waves ref updated
  useEffect(() => {
    wavesRef.current = waves;
  }, [waves]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = Date.now();

      wavesRef.current.forEach(wave => {
        const config = INTENSITY_CONFIG[wave.intensity || 'mild'];
        const colors = VARIANT_COLORS[wave.variant || 'neutral'];
        const elapsed = now - wave.startTime;
        const progress = Math.min(elapsed / config.duration, 1);

        if (progress >= 1) {
          onWaveComplete(wave.id);
          return;
        }

        // Draw concentric waves
        for (let i = 0; i < config.waveCount; i++) {
          const waveDelay = i * 0.15; // Stagger each ring
          const waveProgress = Math.max(0, Math.min(1, (progress - waveDelay) / (1 - waveDelay)));
          
          if (waveProgress <= 0) continue;

          // Ease out cubic for smooth deceleration
          const easedProgress = 1 - Math.pow(1 - waveProgress, 3);
          const radius = easedProgress * config.maxRadius;
          
          // Fade out as wave expands
          const fadeOut = 1 - Math.pow(waveProgress, 2);
          const opacity = config.baseOpacity * fadeOut * (1 - i * 0.2);

          // Draw wave ring
          ctx.beginPath();
          ctx.arc(wave.x, wave.y, radius, 0, Math.PI * 2);
          
          // Glow effect (larger, more transparent)
          ctx.strokeStyle = colors.glow;
          ctx.lineWidth = config.strokeWidth * 4;
          ctx.globalAlpha = opacity * 0.3;
          ctx.stroke();
          
          // Main stroke
          ctx.strokeStyle = colors.stroke;
          ctx.lineWidth = config.strokeWidth;
          ctx.globalAlpha = opacity;
          ctx.stroke();
          
          // Subtle fill
          ctx.fillStyle = colors.fill;
          ctx.globalAlpha = opacity * 0.5;
          ctx.fill();
        }
      });

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', updateSize);
    };
  }, [onWaveComplete]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9998, // Below modals, above content
      }}
      aria-hidden="true"
    />
  );
});

/**
 * SeismicTrigger - Wrapper that triggers a wave when element enters viewport
 * 
 * Usage:
 * <SeismicTrigger variant="success" intensity="strong" surprise={surprise}>
 *   <EarningsCard />
 * </SeismicTrigger>
 */
interface SeismicTriggerProps {
  children: React.ReactNode;
  variant?: 'success' | 'danger' | 'neutral' | 'gold';
  intensity?: 'mild' | 'strong' | 'massive';
  threshold?: number; // 0-1, when to trigger (default 0.5)
  triggerOnce?: boolean;
  enabled?: boolean;
  delay?: number;
  className?: string;
}

export function SeismicTrigger({
  children,
  variant = 'neutral',
  intensity = 'mild',
  threshold = 0.5,
  triggerOnce = true,
  enabled = true,
  delay = 0,
  className,
}: SeismicTriggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const hasTriggered = useRef(false);
  const { triggerWave } = useSeismicWave();

  useEffect(() => {
    if (!enabled) return;
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && (!triggerOnce || !hasTriggered.current)) {
            hasTriggered.current = true;
            
            // Calculate center of element
            const rect = entry.boundingClientRect;
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            
            triggerWave({ x, y, variant, intensity, delay });
          }
        });
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [enabled, variant, intensity, threshold, triggerOnce, delay, triggerWave]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/**
 * SeismicEarningsWrapper - Auto-triggers based on earnings surprise percentage
 * 
 * Usage:
 * <SeismicEarningsWrapper surprise={15.5} result="beat">
 *   <EarningsCard />
 * </SeismicEarningsWrapper>
 */
interface SeismicEarningsWrapperProps {
  children: React.ReactNode;
  surprise: number; // Percentage surprise (positive for beat, negative for miss)
  result?: 'beat' | 'miss' | 'met' | 'pending';
  beatThreshold?: number; // Min surprise % to trigger for beats (default 15)
  missThreshold?: number; // Min surprise % to trigger for misses (default -15)
  className?: string;
}

export function SeismicEarningsWrapper({
  children,
  surprise,
  result,
  beatThreshold = 15,
  missThreshold = -15,
  className,
}: SeismicEarningsWrapperProps) {
  // Determine if this is exceptional
  const isExceptionalBeat = result === 'beat' && surprise >= beatThreshold;
  const isExceptionalMiss = result === 'miss' && surprise <= missThreshold;
  
  if (!isExceptionalBeat && !isExceptionalMiss) {
    return <div className={className}>{children}</div>;
  }

  // Calculate intensity based on surprise magnitude
  const absSurprise = Math.abs(surprise);
  let intensity: 'mild' | 'strong' | 'massive' = 'mild';
  if (absSurprise >= 30) {
    intensity = 'massive';
  } else if (absSurprise >= 20) {
    intensity = 'strong';
  }

  // Use gold for massive beats
  let variant: 'success' | 'danger' | 'gold' = isExceptionalBeat ? 'success' : 'danger';
  if (isExceptionalBeat && intensity === 'massive') {
    variant = 'gold';
  }

  return (
    <SeismicTrigger
      variant={variant}
      intensity={intensity}
      enabled={true}
      className={className}
    >
      {children}
    </SeismicTrigger>
  );
}

/**
 * useSeismicTrigger - Hook for programmatic wave triggering
 * 
 * Usage:
 * const { triggerAtElement, triggerAtPoint } = useSeismicTrigger();
 * 
 * <button ref={buttonRef} onClick={() => triggerAtElement(buttonRef.current)}>
 *   Trigger Wave
 * </button>
 */
export function useSeismicTrigger() {
  const { triggerWave } = useSeismicWave();

  const triggerAtElement = useCallback((
    element: HTMLElement | null,
    options?: Omit<WaveOptions, 'x' | 'y'>
  ) => {
    if (!element) return;
    const rect = element.getBoundingClientRect();
    triggerWave({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      ...options,
    });
  }, [triggerWave]);

  const triggerAtPoint = useCallback((
    x: number,
    y: number,
    options?: Omit<WaveOptions, 'x' | 'y'>
  ) => {
    triggerWave({ x, y, ...options });
  }, [triggerWave]);

  return { triggerAtElement, triggerAtPoint, triggerWave };
}

export default SeismicWaveProvider;
