'use client';

import { useEffect, useState, useRef } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  angle: number;
}

const BEAT_COLORS = [
  '#22c55e', // green-500
  '#4ade80', // green-400
  '#86efac', // green-300
  '#fbbf24', // amber-400 (gold accent)
  '#a3e635', // lime-400
];

// Generates particles that burst outward from center
function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 360 + Math.random() * 30;
    return {
      id: i,
      x: 0,
      y: 0,
      size: 2 + Math.random() * 2,
      color: BEAT_COLORS[Math.floor(Math.random() * BEAT_COLORS.length)],
      duration: 1200 + Math.random() * 800,
      delay: Math.random() * 2000,
      angle,
    };
  });
}

export function BadgeSparkle({ 
  children, 
  active = true,
  particleCount = 6,
  className = ''
}: { 
  children: React.ReactNode;
  active?: boolean;
  particleCount?: number;
  className?: string;
}) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (active) {
      setParticles(generateParticles(particleCount));
    }
  }, [active, particleCount]);

  // Regenerate particles on animation cycle
  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      setParticles(generateParticles(particleCount));
    }, 3000);

    return () => clearInterval(interval);
  }, [active, particleCount]);

  return (
    <span ref={containerRef} className={`badge-sparkle-container ${className}`}>
      {children}
      
      {active && (
        <span className="badge-sparkle-particles" aria-hidden="true">
          {particles.map((p) => (
            <span
              key={`${p.id}-${p.delay}`}
              className="badge-sparkle-particle"
              style={{
                '--particle-size': `${p.size}px`,
                '--particle-color': p.color,
                '--particle-duration': `${p.duration}ms`,
                '--particle-delay': `${p.delay}ms`,
                '--particle-angle': `${p.angle}deg`,
                '--particle-distance': `${16 + Math.random() * 12}px`,
              } as React.CSSProperties}
            />
          ))}
        </span>
      )}
    </span>
  );
}

// Variant: Star burst effect (4-pointed stars instead of circles)
export function BadgeStarBurst({ 
  children, 
  active = true,
  className = ''
}: { 
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}) {
  const starCount = 4;
  
  return (
    <span className={`badge-starburst-container ${className}`}>
      {children}
      
      {active && (
        <span className="badge-starburst-particles" aria-hidden="true">
          {Array.from({ length: starCount }, (_, i) => (
            <span
              key={i}
              className="badge-star"
              style={{
                '--star-index': i,
                '--star-angle': `${(i / starCount) * 360 + 45}deg`,
                '--star-delay': `${i * 500}ms`,
              } as React.CSSProperties}
            >
              <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
                <path
                  d="M12 2L13.5 9.5L21 11L13.5 12.5L12 20L10.5 12.5L3 11L10.5 9.5L12 2Z"
                  fill="currentColor"
                />
              </svg>
            </span>
          ))}
        </span>
      )}
    </span>
  );
}
