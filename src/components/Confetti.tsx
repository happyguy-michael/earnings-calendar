'use client';

import { useEffect, useState, useRef } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  speedX: number;
  speedY: number;
  rotationSpeed: number;
  opacity: number;
  shape: 'square' | 'circle' | 'triangle';
}

const COLORS = [
  '#22c55e', // green
  '#4ade80', // light green
  '#10b981', // emerald
  '#34d399', // mint
  '#fbbf24', // gold
  '#f59e0b', // amber
  '#818cf8', // indigo
  '#a78bfa', // purple
];

const SHAPES: Particle['shape'][] = ['square', 'circle', 'triangle'];

export function Confetti({ 
  trigger = false, 
  duration = 3000,
  particleCount = 80,
  spread = 180,
  origin = { x: 0.5, y: 0.3 }
}: { 
  trigger?: boolean;
  duration?: number;
  particleCount?: number;
  spread?: number;
  origin?: { x: number; y: number };
}) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isActive, setIsActive] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (trigger && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      
      // Create initial particles
      const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => {
        const angle = (Math.random() - 0.5) * spread * (Math.PI / 180);
        const velocity = 8 + Math.random() * 12;
        
        return {
          id: i,
          x: origin.x * 100, // percentage
          y: origin.y * 100,
          rotation: Math.random() * 360,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size: 6 + Math.random() * 8,
          speedX: Math.sin(angle) * velocity,
          speedY: -Math.cos(angle) * velocity - Math.random() * 4,
          rotationSpeed: (Math.random() - 0.5) * 15,
          opacity: 1,
          shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        };
      });

      setParticles(newParticles);
      setIsActive(true);
      startTimeRef.current = Date.now();

      // Animation loop
      const animate = () => {
        const elapsed = Date.now() - startTimeRef.current;
        
        if (elapsed > duration) {
          setIsActive(false);
          setParticles([]);
          return;
        }

        setParticles(prev => prev.map(p => ({
          ...p,
          x: p.x + p.speedX * 0.1,
          y: p.y + p.speedY * 0.1,
          speedY: p.speedY + 0.3, // gravity
          speedX: p.speedX * 0.99, // air resistance
          rotation: p.rotation + p.rotationSpeed,
          opacity: Math.max(0, 1 - (elapsed / duration) * 0.8),
        })));

        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [trigger, duration, particleCount, spread, origin]);

  if (!isActive || particles.length === 0) return null;

  return (
    <div 
      className="confetti-container"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      {particles.map(p => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.shape === 'circle' ? p.size : p.size * 0.8,
            height: p.shape === 'triangle' ? p.size * 0.6 : p.size,
            backgroundColor: p.shape !== 'triangle' ? p.color : 'transparent',
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            transform: `rotate(${p.rotation}deg)`,
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size}px ${p.color}40`,
            ...(p.shape === 'triangle' && {
              width: 0,
              height: 0,
              borderLeft: `${p.size * 0.5}px solid transparent`,
              borderRight: `${p.size * 0.5}px solid transparent`,
              borderBottom: `${p.size}px solid ${p.color}`,
              backgroundColor: 'transparent',
            }),
          }}
        />
      ))}
    </div>
  );
}

// Sparkle effect for smaller celebrations
export function Sparkles({
  trigger = false,
  count = 12,
  duration = 1200,
}: {
  trigger?: boolean;
  count?: number;
  duration?: number;
}) {
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; delay: number; size: number }[]>([]);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (trigger && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      
      const newSparkles = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: 30 + Math.random() * 40,
        y: 20 + Math.random() * 30,
        delay: Math.random() * 400,
        size: 4 + Math.random() * 8,
      }));
      
      setSparkles(newSparkles);
      
      setTimeout(() => {
        setSparkles([]);
      }, duration);
    }
  }, [trigger, count, duration]);

  if (sparkles.length === 0) return null;

  return (
    <div className="sparkles-container" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 9998,
    }}>
      {sparkles.map(s => (
        <div
          key={s.id}
          className="sparkle"
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}ms`,
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
            <path
              d="M12 2L13.5 9.5L21 11L13.5 12.5L12 20L10.5 12.5L3 11L10.5 9.5L12 2Z"
              fill="#fbbf24"
              style={{
                filter: 'drop-shadow(0 0 4px #fbbf24)',
              }}
            />
          </svg>
        </div>
      ))}
      <style jsx>{`
        .sparkle {
          animation: sparkle-pop 0.8s ease-out forwards;
          opacity: 0;
        }
        
        @keyframes sparkle-pop {
          0% {
            opacity: 0;
            transform: scale(0) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.2) rotate(180deg);
          }
          100% {
            opacity: 0;
            transform: scale(0) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
