'use client';

import { useRef, useState, useCallback, ReactNode } from 'react';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  tiltIntensity?: number; // degrees of max tilt
  glareIntensity?: number; // 0-1 for glare opacity
  scale?: number; // scale on hover
}

export function TiltCard({
  children,
  className = '',
  tiltIntensity = 8,
  glareIntensity = 0.15,
  scale = 1.02,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('');
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate rotation (inverted for natural feel)
      const rotateX = ((y - centerY) / centerY) * -tiltIntensity;
      const rotateY = ((x - centerX) / centerX) * tiltIntensity;

      // Set transform with perspective
      setTransform(
        `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`
      );

      // Update glare position (percentage based)
      setGlarePosition({
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100,
      });
    },
    [tiltIntensity, scale]
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTransform('');
    setGlarePosition({ x: 50, y: 50 });
  }, []);

  return (
    <div
      ref={cardRef}
      className={`tilt-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transform,
        transition: isHovered
          ? 'transform 0.1s ease-out'
          : 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
      }}
    >
      {/* Glare overlay */}
      <div
        className="tilt-card-glare"
        style={{
          opacity: isHovered ? glareIntensity : 0,
          background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.4) 0%, transparent 60%)`,
        }}
      />
      
      {/* Spotlight effect */}
      <div
        className="tilt-card-spotlight"
        style={{
          opacity: isHovered ? 0.5 : 0,
          background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, var(--spotlight-color, rgba(59, 130, 246, 0.15)) 0%, transparent 50%)`,
        }}
      />

      {children}
    </div>
  );
}
