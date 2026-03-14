'use client';

import { useEffect, useRef, useState, ReactNode, CSSProperties } from 'react';
import { useMotionPreferences } from './MotionPreferences';

interface BreathingCardProps {
  children: ReactNode;
  /** Breathing cycle duration in ms (default: 4000) */
  duration?: number;
  /** Phase offset 0-1 for staggering multiple cards (default: 0) */
  phase?: number;
  /** Maximum scale amplitude (default: 0.008 = 0.8%) */
  amplitude?: number;
  /** Enable subtle shadow breathing too (default: true) */
  breatheShadow?: boolean;
  /** Enable glow pulse (default: false) */
  breatheGlow?: boolean;
  /** Glow color (default: currentColor) */
  glowColor?: string;
  /** Pause breathing on hover (default: true) */
  pauseOnHover?: boolean;
  /** Additional className */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
}

/**
 * BreathingCard - Adds subtle, continuous "breathing" animation to content
 * 
 * Creates an organic, alive feeling with gentle scale/shadow pulsing.
 * Multiple cards with different phases create beautiful wave-like movement.
 */
export function BreathingCard({
  children,
  duration = 4000,
  phase = 0,
  amplitude = 0.008,
  breatheShadow = true,
  breatheGlow = false,
  glowColor = 'rgba(99, 102, 241, 0.3)',
  pauseOnHover = true,
  className = '',
  style,
}: BreathingCardProps) {
  const { shouldAnimate } = useMotionPreferences();
  const prefersReducedMotion = !shouldAnimate('decorative');
  const elementRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;
    
    const element = elementRef.current;
    if (!element) return;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        // Initialize with phase offset
        startTimeRef.current = timestamp - (phase * duration);
      }

      if (pauseOnHover && isHovered) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const elapsed = timestamp - startTimeRef.current;
      // Sine wave for smooth breathing (0 to 1 to 0)
      const progress = (Math.sin((elapsed / duration) * Math.PI * 2) + 1) / 2;
      
      // Scale from 1.0 to 1.0 + amplitude
      const scale = 1 + (progress * amplitude);
      
      // Shadow depth breathing (subtle)
      const shadowProgress = breatheShadow ? progress : 0;
      const shadowBlur = 20 + shadowProgress * 8;
      const shadowOpacity = 0.1 + shadowProgress * 0.05;
      const shadowY = 4 + shadowProgress * 2;
      
      // Glow breathing
      const glowOpacity = breatheGlow ? progress * 0.4 : 0;
      
      // Apply transforms
      element.style.transform = `scale(${scale})`;
      
      if (breatheShadow) {
        element.style.boxShadow = `
          0 ${shadowY}px ${shadowBlur}px rgba(0, 0, 0, ${shadowOpacity})
          ${breatheGlow ? `, 0 0 ${20 + progress * 15}px ${glowColor.replace(/[\d.]+\)$/, `${glowOpacity})`)}` : ''}
        `;
      } else if (breatheGlow) {
        element.style.boxShadow = `0 0 ${20 + progress * 15}px ${glowColor.replace(/[\d.]+\)$/, `${glowOpacity})`)}`;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [prefersReducedMotion, duration, phase, amplitude, breatheShadow, breatheGlow, glowColor, pauseOnHover, isHovered]);

  // Reduced motion: no animation, just render children
  if (prefersReducedMotion) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={elementRef}
      className={`breathing-card ${className}`}
      style={{
        willChange: 'transform, box-shadow',
        transition: pauseOnHover ? 'transform 300ms ease-out' : undefined,
        ...style,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
}

/**
 * BreathingGroup - Automatically staggers phases for child BreathingCards
 */
interface BreathingGroupProps {
  children: ReactNode;
  /** Total cycle for the group (default: 6000ms) */
  groupDuration?: number;
  className?: string;
}

export function BreathingGroup({ 
  children, 
  groupDuration = 6000,
  className = '' 
}: BreathingGroupProps) {
  return (
    <div className={`breathing-group ${className}`}>
      {children}
    </div>
  );
}

/**
 * useBreathingPhase - Hook to get phase value for index in a group
 */
export function useBreathingPhase(index: number, totalItems: number): number {
  return index / totalItems;
}

export default BreathingCard;
