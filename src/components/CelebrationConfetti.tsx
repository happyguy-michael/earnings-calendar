'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * CelebrationConfetti - Burst of confetti particles for exceptional results
 * 
 * 2026 Design Trend: "Purposeful motion" - animation that rewards and delights,
 * not just decoration. Confetti bursts are making a comeback in fintech/trading
 * apps to celebrate exceptional wins.
 * 
 * Features:
 * - Viewport-triggered one-shot animation
 * - Physics-based particle motion (gravity, drag, rotation)
 * - Multiple particle shapes (squares, circles, stars)
 * - Color themes for different result types
 * - GPU-accelerated transforms
 * - Respects prefers-reduced-motion
 * - Session-based deduplication (won't repeat for same card)
 * 
 * Use cases:
 * - Monster beats (>15% surprise)
 * - Achievement unlocks
 * - Milestone celebrations
 * 
 * Inspired by: Robinhood confetti, Trading212 celebrations, Linear achievements
 */

export type ConfettiColor = 'gold' | 'green' | 'rainbow' | 'brand';
export type ConfettiShape = 'square' | 'circle' | 'star' | 'mixed';
export type ConfettiBurst = 'explosion' | 'fountain' | 'spray';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  color: string;
  shape: 'square' | 'circle' | 'star';
  opacity: number;
  drag: number;
}

interface CelebrationConfettiProps {
  /** Unique identifier for deduplication (e.g., ticker symbol) */
  id: string;
  /** Whether confetti should trigger */
  active?: boolean;
  /** Surprise percentage for intensity scaling */
  surprise?: number;
  /** Minimum surprise to trigger (default: 15) */
  threshold?: number;
  /** Color theme */
  colorTheme?: ConfettiColor;
  /** Number of particles */
  particleCount?: number;
  /** Burst pattern */
  burst?: ConfettiBurst;
  /** Duration before particles fade out in ms */
  duration?: number;
  /** Spread angle in degrees */
  spread?: number;
  /** Initial velocity */
  velocity?: number;
  /** Gravity strength */
  gravity?: number;
  /** Enable sound effect */
  sound?: boolean;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Children to wrap */
  children: React.ReactNode;
  /** Additional class name */
  className?: string;
}

// Color palettes for different themes
const COLOR_PALETTES: Record<ConfettiColor, string[]> = {
  gold: ['#FFD700', '#FFA500', '#FF8C00', '#FFDF00', '#FFB347', '#FFC125'],
  green: ['#22C55E', '#16A34A', '#4ADE80', '#86EFAC', '#10B981', '#34D399'],
  rainbow: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'],
  brand: ['#6366F1', '#8B5CF6', '#A855F7', '#EC4899', '#3B82F6', '#06B6D4'],
};

// Track which confetti IDs have already been shown this session
const shownConfettiIds = new Set<string>();

export function CelebrationConfetti({
  id,
  active = true,
  surprise = 0,
  threshold = 15,
  colorTheme = 'gold',
  particleCount = 40,
  burst = 'explosion',
  duration = 2500,
  spread = 120,
  velocity = 18,
  gravity = 0.4,
  sound = false,
  onComplete,
  children,
  className = '',
}: CelebrationConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isTriggered, setIsTriggered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Check for reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Determine if we should show confetti
  const shouldTrigger = active && surprise >= threshold && !shownConfettiIds.has(id);

  // Generate random particle
  const createParticle = useCallback((index: number, centerX: number, centerY: number): Particle => {
    const colors = COLOR_PALETTES[colorTheme];
    const shapes: Array<'square' | 'circle' | 'star'> = ['square', 'circle', 'star'];
    
    // Calculate initial velocity based on burst pattern
    let vx: number, vy: number;
    const spreadRad = (spread / 2) * (Math.PI / 180);
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 2 * spreadRad; // Upward bias
    
    const speed = velocity * (0.5 + Math.random() * 0.8);
    
    switch (burst) {
      case 'fountain':
        vx = Math.cos(angle) * speed * 0.7;
        vy = Math.sin(angle) * speed;
        break;
      case 'spray':
        vx = (Math.random() - 0.5) * speed * 1.5;
        vy = -Math.random() * speed;
        break;
      case 'explosion':
      default:
        const explosionAngle = (Math.PI * 2 * index) / particleCount + (Math.random() - 0.5) * 0.5;
        vx = Math.cos(explosionAngle) * speed;
        vy = Math.sin(explosionAngle) * speed * 0.7 - speed * 0.5; // Slight upward bias
        break;
    }

    return {
      id: index,
      x: centerX + (Math.random() - 0.5) * 10,
      y: centerY + (Math.random() - 0.5) * 10,
      vx,
      vy,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 15,
      size: 4 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      opacity: 1,
      drag: 0.98 + Math.random() * 0.02,
    };
  }, [colorTheme, burst, spread, velocity, particleCount]);

  // Trigger confetti explosion
  const triggerConfetti = useCallback(() => {
    if (!containerRef.current || isTriggered || prefersReducedMotion) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Scale particle count based on surprise magnitude
    const scaledCount = Math.min(
      particleCount * (1 + (surprise - threshold) / 50),
      100
    );

    const newParticles = Array.from({ length: Math.round(scaledCount) }, (_, i) =>
      createParticle(i, centerX, centerY)
    );

    setParticles(newParticles);
    setIsTriggered(true);
    shownConfettiIds.add(id);

    // Play sound if enabled
    if (sound && typeof Audio !== 'undefined') {
      try {
        // Use a short pop/sparkle sound (data URI for a tiny sound)
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleWJQTnK0zsDJm2g2E1eBo9XouJVjNihqodr5w45kHhVvmOH/2a5xJRhgjuP/9seAdSYXXJLi//zXl39qJRxmn+X//+Wqh29BRmOp5P//8r2UhU0nOGCm3/7/8sqahUskK1qh1//+6M2ejEwkKVmd0P7/5dOjj0spK1ud0v7/6NWjkEorK1ye0/7/6tahkEorK1ye0/7/6tahj0sqK1ye0/7/6tahj0sqK1ye0/7/6tahj0sqKlue0v7/6NWgj0sqKlqd0P/+5tOekEoqKVmd0P7/5tKekUoqKVib0P7/5dCdkUopKFeZzf7/4s2bkEooJ1SWyv7/38mYj0omJVGSxv7/28SViUgjIk2Pwv7+1r6QhUQfH0iKu/v/0LeKfjsXG0SCsfb+yK5+dC8RFTR5pfD8v6RzZyELD');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch {}
    }

    // Schedule completion callback
    setTimeout(() => {
      onComplete?.();
    }, duration);
  }, [id, isTriggered, prefersReducedMotion, particleCount, surprise, threshold, createParticle, sound, duration, onComplete]);

  // Intersection observer to trigger on viewport entry
  useEffect(() => {
    if (!shouldTrigger || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isTriggered) {
            triggerConfetti();
          }
        });
      },
      { threshold: 0.6, rootMargin: '0px' }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [shouldTrigger, isTriggered, triggerConfetti]);

  // Canvas animation loop
  useEffect(() => {
    if (particles.length === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height + 100; // Extra space for falling particles
      }
    };
    updateSize();

    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let hasVisibleParticles = false;

      setParticles((prevParticles) =>
        prevParticles.map((p) => {
          // Apply physics
          const newVy = p.vy + gravity;
          const newVx = p.vx * p.drag;
          const newX = p.x + newVx;
          const newY = p.y + newVy;
          const newRotation = p.rotation + p.rotationSpeed;
          const newOpacity = Math.max(0, 1 - progress * 1.2);

          // Draw particle
          if (newOpacity > 0) {
            hasVisibleParticles = true;
            ctx.save();
            ctx.translate(newX, newY);
            ctx.rotate((newRotation * Math.PI) / 180);
            ctx.globalAlpha = newOpacity;
            ctx.fillStyle = p.color;

            switch (p.shape) {
              case 'circle':
                ctx.beginPath();
                ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                ctx.fill();
                break;
              case 'star':
                drawStar(ctx, 0, 0, p.size / 2, p.size / 4, 5);
                break;
              case 'square':
              default:
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                break;
            }

            ctx.restore();
          }

          return {
            ...p,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
            rotation: newRotation,
            opacity: newOpacity,
          };
        })
      );

      if (hasVisibleParticles && progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setParticles([]);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particles.length > 0]); // Only re-run when particles exist

  // Draw a 5-pointed star
  function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, outerRadius: number, innerRadius: number, points: number) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();
  }

  // For reduced motion, show a simple glow effect instead
  if (prefersReducedMotion && shouldTrigger && !isTriggered) {
    return (
      <div 
        ref={containerRef}
        className={`celebration-confetti-reduced ${className}`}
        style={{ position: 'relative' }}
      >
        {children}
        <div 
          className="celebration-glow"
          style={{
            position: 'absolute',
            inset: -4,
            borderRadius: 'inherit',
            background: `radial-gradient(circle, ${COLOR_PALETTES[colorTheme][0]}33 0%, transparent 70%)`,
            pointerEvents: 'none',
            animation: 'celebrationGlow 1.5s ease-out forwards',
          }}
        />
        <style jsx>{`
          @keyframes celebrationGlow {
            0% {
              opacity: 0;
              transform: scale(0.8);
            }
            30% {
              opacity: 1;
              transform: scale(1.1);
            }
            100% {
              opacity: 0;
              transform: scale(1.2);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`celebration-confetti ${className}`}
      style={{ position: 'relative' }}
    >
      {children}
      {particles.length > 0 && (
        <canvas
          ref={canvasRef}
          className="celebration-canvas"
          style={{
            position: 'absolute',
            top: -20,
            left: 0,
            width: '100%',
            height: 'calc(100% + 120px)',
            pointerEvents: 'none',
            zIndex: 100,
          }}
        />
      )}
    </div>
  );
}

/**
 * Hook to manually trigger confetti at a specific element
 */
export function useConfettiTrigger() {
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null);
  
  const trigger = useCallback((element: HTMLElement, options?: Partial<CelebrationConfettiProps>) => {
    setTriggerElement(element);
    // Implementation would inject confetti at element position
    // For now, this is a placeholder for future enhancement
  }, []);
  
  return { trigger, triggerElement };
}

/**
 * Convenience wrapper for monster beat celebrations
 */
export function MonsterBeatConfetti({
  ticker,
  surprise,
  children,
  ...props
}: Omit<CelebrationConfettiProps, 'id' | 'colorTheme' | 'threshold'> & {
  ticker: string;
  surprise: number;
}) {
  const isMonster = surprise >= 25;
  
  return (
    <CelebrationConfetti
      id={`beat-${ticker}`}
      surprise={surprise}
      threshold={15}
      colorTheme={isMonster ? 'gold' : 'green'}
      particleCount={isMonster ? 60 : 40}
      burst={isMonster ? 'explosion' : 'fountain'}
      velocity={isMonster ? 22 : 16}
      {...props}
    >
      {children}
    </CelebrationConfetti>
  );
}

/**
 * Reset shown confetti (useful for testing or page refresh)
 */
export function resetConfettiHistory() {
  shownConfettiIds.clear();
}

export default CelebrationConfetti;
