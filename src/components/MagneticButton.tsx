'use client';

import { useRef, useState, useCallback, useEffect, ReactNode } from 'react';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  intensity?: number; // How far the button moves (default: 0.4)
  radius?: number; // Detection radius multiplier (default: 1.5)
  onClick?: () => void;
  disabled?: boolean;
  'aria-label'?: string;
}

export function MagneticButton({
  children,
  className = '',
  intensity = 0.4,
  radius = 1.5,
  onClick,
  disabled,
  'aria-label': ariaLabel,
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isHovering, setIsHovering] = useState(false);
  const rafRef = useRef<number | undefined>(undefined);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!buttonRef.current) return;

      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      const maxDistance = Math.max(rect.width, rect.height) * radius;

      if (distance < maxDistance) {
        // Inside magnetic field
        const pull = 1 - distance / maxDistance;
        const moveX = distanceX * intensity * pull;
        const moveY = distanceY * intensity * pull;
        const scale = 1 + pull * 0.05; // Subtle scale up when close

        setTransform({ x: moveX, y: moveY, scale });
        setIsHovering(true);
      } else {
        // Outside magnetic field
        setTransform({ x: 0, y: 0, scale: 1 });
        setIsHovering(false);
      }
    },
    [intensity, radius]
  );

  const handleMouseLeave = useCallback(() => {
    setTransform({ x: 0, y: 0, scale: 1 });
    setIsHovering(false);
  }, []);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => handleMouseMove(e));
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleMouseMove]);

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      onMouseLeave={handleMouseLeave}
      className={`magnetic-button ${isHovering ? 'magnetic-hovering' : ''} ${className}`}
      style={{
        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
      }}
    >
      {children}
    </button>
  );
}

// Wrapper for non-button elements that need magnetic effect
interface MagneticWrapperProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
  radius?: number;
  as?: 'div' | 'span';
}

export function MagneticWrapper({
  children,
  className = '',
  intensity = 0.3,
  radius = 1.3,
  as: Component = 'div',
}: MagneticWrapperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isHovering, setIsHovering] = useState(false);
  const rafRef = useRef<number | undefined>(undefined);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!wrapperRef.current) return;

      const rect = wrapperRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      const maxDistance = Math.max(rect.width, rect.height) * radius;

      if (distance < maxDistance) {
        const pull = 1 - distance / maxDistance;
        const moveX = distanceX * intensity * pull;
        const moveY = distanceY * intensity * pull;
        const scale = 1 + pull * 0.03;

        setTransform({ x: moveX, y: moveY, scale });
        setIsHovering(true);
      } else {
        setTransform({ x: 0, y: 0, scale: 1 });
        setIsHovering(false);
      }
    },
    [intensity, radius]
  );

  const handleMouseLeave = useCallback(() => {
    setTransform({ x: 0, y: 0, scale: 1 });
    setIsHovering(false);
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => handleMouseMove(e));
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleMouseMove]);

  return (
    <Component
      ref={wrapperRef as any}
      onMouseLeave={handleMouseLeave}
      className={`magnetic-wrapper ${isHovering ? 'magnetic-hovering' : ''} ${className}`}
      style={{
        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
      }}
    >
      {children}
    </Component>
  );
}
