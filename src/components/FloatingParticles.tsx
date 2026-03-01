'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  hue: number;
}

interface FloatingParticlesProps {
  count?: number;
  colors?: string[];
  maxSize?: number;
  minSize?: number;
  speed?: number;
  className?: string;
}

export function FloatingParticles({
  count = 50,
  colors = ['rgba(59, 130, 246, 0.3)', 'rgba(139, 92, 246, 0.25)', 'rgba(236, 72, 153, 0.2)'],
  maxSize = 4,
  minSize = 1,
  speed = 0.3,
  className = '',
}: FloatingParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const particlesRef = useRef<Particle[]>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * (maxSize - minSize) + minSize,
        speedY: (Math.random() * speed + speed * 0.5) * -1, // Float upward
        speedX: (Math.random() - 0.5) * speed * 0.5, // Slight horizontal drift
        opacity: Math.random() * 0.5 + 0.1,
        hue: Math.floor(Math.random() * 360),
      });
    }
    return particles;
  }, [count, maxSize, minSize, speed]);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);
    
    particlesRef.current.forEach((particle, index) => {
      // Update position
      particle.y += particle.speedY;
      particle.x += particle.speedX;
      
      // Wrap around when going off screen
      if (particle.y < -particle.size) {
        particle.y = height + particle.size;
        particle.x = Math.random() * width;
      }
      if (particle.x < -particle.size) {
        particle.x = width + particle.size;
      } else if (particle.x > width + particle.size) {
        particle.x = -particle.size;
      }
      
      // Draw particle
      const colorIndex = index % colors.length;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = colors[colorIndex].replace(/[\d.]+\)$/, `${particle.opacity})`);
      ctx.fill();
      
      // Add subtle glow for larger particles
      if (particle.size > 2) {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 2
        );
        gradient.addColorStop(0, colors[colorIndex].replace(/[\d.]+\)$/, `${particle.opacity * 0.3})`));
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    });
  }, [colors]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      // Reinitialize particles on resize
      particlesRef.current = initParticles(rect.width, rect.height);
    };
    
    resize();
    window.addEventListener('resize', resize);
    
    // Initial particles
    const rect = canvas.getBoundingClientRect();
    particlesRef.current = initParticles(rect.width, rect.height);
    
    // Animation loop
    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      draw(ctx, rect.width, rect.height);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [draw, initParticles, prefersReducedMotion]);

  // Don't render anything if user prefers reduced motion
  if (prefersReducedMotion) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ opacity: 0.6 }}
      aria-hidden="true"
    />
  );
}

// Simpler CSS-only version for lower-end devices
export function FloatingParticlesCSS({ count = 20 }: { count?: number }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  if (prefersReducedMotion) return null;

  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 20,
    duration: 15 + Math.random() * 20,
    size: 2 + Math.random() * 4,
    opacity: 0.1 + Math.random() * 0.3,
  }));

  return (
    <div className="floating-particles-container" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="floating-particle"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}
