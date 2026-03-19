'use client';

import { useEffect, useRef, useState, useCallback, memo } from 'react';

/**
 * ScrollVelocityParticles - Ambient particles that respond to scroll momentum
 * 
 * Creates a subtle particle effect where small dots trail in the direction of
 * scroll, creating a sense of physical momentum and weight. Particles spawn
 * when scrolling fast and gently fade/settle when scroll stops.
 * 
 * 2026 UI Trend: "Kinetic Ambiance" - subtle motion that responds to user
 * behavior, making interfaces feel alive and physical without being distracting.
 * 
 * Inspiration:
 * - iOS scrolling momentum feel
 * - Snow/dust particles in motion
 * - Linear.app's subtle scroll effects
 * - Stripe's premium micro-interactions
 * 
 * Features:
 * - Spawns particles based on scroll velocity
 * - Particles drift in scroll direction with physics
 * - Fade and settle with spring physics
 * - GPU-accelerated canvas rendering
 * - Respects prefers-reduced-motion
 * - Adapts to light/dark mode
 * - Performance-optimized (pauses when idle)
 */

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
  hue: number;
}

interface ScrollVelocityParticlesProps {
  /** Maximum number of particles at once */
  maxParticles?: number;
  /** Scroll velocity threshold to start spawning (px/ms) */
  velocityThreshold?: number;
  /** How many particles to spawn per scroll event */
  spawnRate?: number;
  /** Particle fade speed (0-1, higher = faster fade) */
  fadeSpeed?: number;
  /** Base particle size in px */
  particleSize?: number;
  /** Enable glow effect on particles */
  glow?: boolean;
  /** Color mode: 'brand' uses accent colors, 'subtle' uses grays */
  colorMode?: 'brand' | 'subtle';
  /** z-index for the canvas layer */
  zIndex?: number;
}

function ScrollVelocityParticlesInner({
  maxParticles = 60,
  velocityThreshold = 0.5,
  spawnRate = 3,
  fadeSpeed = 0.015,
  particleSize = 3,
  glow = true,
  colorMode = 'subtle',
  zIndex = 0,
}: ScrollVelocityParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(performance.now());
  const velocityRef = useRef(0);
  const animationRef = useRef<number>(0);
  const particleIdRef = useRef(0);
  const isActiveRef = useRef(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Check preferences
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);
    
    const motionHandler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener('change', motionHandler);
    
    // Check color scheme
    const colorQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(colorQuery.matches || document.documentElement.classList.contains('dark'));
    
    const colorHandler = () => {
      setIsDark(document.documentElement.classList.contains('dark') || 
                window.matchMedia('(prefers-color-scheme: dark)').matches);
    };
    
    // Observe class changes on html element
    const observer = new MutationObserver(colorHandler);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => {
      motionQuery.removeEventListener('change', motionHandler);
      observer.disconnect();
    };
  }, []);

  // Spawn particles based on velocity
  const spawnParticles = useCallback((velocity: number, direction: 'up' | 'down') => {
    const canvas = canvasRef.current;
    if (!canvas || prefersReducedMotion) return;
    
    const rect = canvas.getBoundingClientRect();
    const spawnCount = Math.min(
      Math.floor(Math.abs(velocity) * spawnRate),
      maxParticles - particlesRef.current.length
    );
    
    for (let i = 0; i < spawnCount; i++) {
      // Spawn particles across viewport width, biased toward center
      const centerBias = 0.3 + Math.random() * 0.4; // 30-70% from left
      const x = rect.width * centerBias;
      
      // Spawn position depends on scroll direction
      const y = direction === 'up' 
        ? rect.height * (0.7 + Math.random() * 0.3) // bottom third when scrolling up
        : rect.height * (Math.random() * 0.3); // top third when scrolling down
      
      // Velocity in scroll direction with some spread
      const baseVelocity = Math.abs(velocity) * 0.3;
      const vx = (Math.random() - 0.5) * baseVelocity * 0.5;
      const vy = direction === 'up' 
        ? -baseVelocity - Math.random() * 2
        : baseVelocity + Math.random() * 2;
      
      // Color based on mode
      let hue: number;
      if (colorMode === 'brand') {
        // Brand colors: blue (220), purple (270), pink (330)
        hue = [220, 250, 270, 300][Math.floor(Math.random() * 4)];
      } else {
        // Subtle: slight blue tint
        hue = 210 + Math.random() * 30;
      }
      
      particlesRef.current.push({
        id: particleIdRef.current++,
        x,
        y,
        vx,
        vy,
        size: particleSize * (0.5 + Math.random() * 0.5),
        opacity: 0.3 + Math.random() * 0.4,
        life: 1,
        maxLife: 0.8 + Math.random() * 0.4,
        hue,
      });
    }
    
    // Start animation if not running
    if (!isActiveRef.current) {
      isActiveRef.current = true;
      animate();
    }
  }, [maxParticles, spawnRate, particleSize, colorMode, prefersReducedMotion]);

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles
    const remainingParticles: Particle[] = [];
    
    for (const p of particlesRef.current) {
      // Physics update
      p.vy *= 0.98; // Air resistance
      p.vx *= 0.96;
      p.vy += 0.05; // Gentle gravity
      p.x += p.vx;
      p.y += p.vy;
      p.life -= fadeSpeed;
      
      // Remove dead particles
      if (p.life <= 0 || p.y < -10 || p.y > canvas.height + 10) {
        continue;
      }
      
      remainingParticles.push(p);
      
      // Draw particle
      const alpha = p.opacity * (p.life / p.maxLife);
      
      if (glow && alpha > 0.1) {
        // Glow effect
        const glowSize = p.size * 3;
        const gradient = ctx.createRadialGradient(
          p.x, p.y, 0,
          p.x, p.y, glowSize
        );
        
        const saturation = colorMode === 'brand' ? '70%' : '30%';
        const lightness = isDark ? '60%' : '50%';
        
        gradient.addColorStop(0, `hsla(${p.hue}, ${saturation}, ${lightness}, ${alpha * 0.5})`);
        gradient.addColorStop(0.5, `hsla(${p.hue}, ${saturation}, ${lightness}, ${alpha * 0.15})`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Core particle
      ctx.beginPath();
      const coreSaturation = colorMode === 'brand' ? '60%' : '20%';
      const coreLightness = isDark ? '70%' : '40%';
      ctx.fillStyle = `hsla(${p.hue}, ${coreSaturation}, ${coreLightness}, ${alpha})`;
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    particlesRef.current = remainingParticles;
    
    // Continue animation if particles exist
    if (remainingParticles.length > 0) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      isActiveRef.current = false;
    }
  }, [fadeSpeed, glow, colorMode, isDark]);

  // Handle scroll events
  useEffect(() => {
    if (prefersReducedMotion) return;
    
    const handleScroll = () => {
      const now = performance.now();
      const currentScrollY = window.scrollY;
      const deltaY = currentScrollY - lastScrollY.current;
      const deltaTime = now - lastScrollTime.current;
      
      if (deltaTime > 0) {
        const velocity = deltaY / deltaTime;
        velocityRef.current = velocity;
        
        // Only spawn if scrolling fast enough
        if (Math.abs(velocity) > velocityThreshold) {
          spawnParticles(velocity, velocity > 0 ? 'down' : 'up');
        }
      }
      
      lastScrollY.current = currentScrollY;
      lastScrollTime.current = now;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [velocityThreshold, spawnParticles, prefersReducedMotion]);

  // Handle resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const updateSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  if (prefersReducedMotion) return null;

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
        zIndex,
      }}
    />
  );
}

export const ScrollVelocityParticles = memo(ScrollVelocityParticlesInner);

/**
 * Lightweight variant - fewer particles, more subtle
 */
export function ScrollVelocityParticlesLight() {
  return (
    <ScrollVelocityParticles
      maxParticles={30}
      spawnRate={2}
      fadeSpeed={0.025}
      particleSize={2}
      glow={false}
      colorMode="subtle"
    />
  );
}

/**
 * Premium variant - more particles, glowing, brand colors
 */
export function ScrollVelocityParticlesPremium() {
  return (
    <ScrollVelocityParticles
      maxParticles={80}
      spawnRate={4}
      fadeSpeed={0.012}
      particleSize={3.5}
      glow={true}
      colorMode="brand"
    />
  );
}

export default ScrollVelocityParticles;
