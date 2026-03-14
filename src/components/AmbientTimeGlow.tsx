'use client';

import { useEffect, useState, useCallback } from 'react';

/**
 * AmbientTimeGlow - Time-of-day ambient lighting effect
 * 
 * Creates a subtle, organic gradient overlay that shifts color based on
 * the time of day, mimicking natural light transitions:
 * 
 * - Dawn (5-7 AM): Soft pink/purple hues
 * - Morning (7-11 AM): Cool blue/cyan tones  
 * - Midday (11 AM-3 PM): Neutral/white with slight warmth
 * - Afternoon (3-6 PM): Golden amber tones
 * - Evening (6-8 PM): Deep orange/rose
 * - Night (8 PM-5 AM): Deep indigo/violet
 * 
 * Inspired by: F.lux, Apple's Night Shift, premium SaaS ambient effects
 * 
 * Features:
 * - Smooth 30-minute transitions between time periods
 * - Respects prefers-reduced-motion (static fallback)
 * - Respects prefers-color-scheme (reduced intensity in light mode)
 * - GPU-accelerated CSS animations
 * - Zero flicker on mount (SSR-safe)
 * - Subtle breathing animation for organic feel
 */

interface TimePhase {
  name: string;
  startHour: number;
  endHour: number;
  gradient: string;
  opacity: number;
  blendMode: string;
}

// Time phases with their color gradients
const TIME_PHASES: TimePhase[] = [
  {
    name: 'night-late',
    startHour: 0,
    endHour: 5,
    gradient: 'radial-gradient(ellipse 80% 60% at 20% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(139, 92, 246, 0.06) 0%, transparent 50%)',
    opacity: 0.8,
    blendMode: 'soft-light',
  },
  {
    name: 'dawn',
    startHour: 5,
    endHour: 7,
    gradient: 'radial-gradient(ellipse 90% 70% at 30% 30%, rgba(236, 72, 153, 0.07) 0%, transparent 50%), radial-gradient(ellipse 70% 60% at 70% 70%, rgba(251, 146, 60, 0.05) 0%, transparent 50%)',
    opacity: 0.7,
    blendMode: 'soft-light',
  },
  {
    name: 'morning',
    startHour: 7,
    endHour: 11,
    gradient: 'radial-gradient(ellipse 100% 80% at 50% 0%, rgba(56, 189, 248, 0.06) 0%, transparent 50%), radial-gradient(ellipse 80% 60% at 0% 50%, rgba(59, 130, 246, 0.04) 0%, transparent 50%)',
    opacity: 0.6,
    blendMode: 'soft-light',
  },
  {
    name: 'midday',
    startHour: 11,
    endHour: 15,
    gradient: 'radial-gradient(ellipse 100% 100% at 50% 0%, rgba(250, 250, 250, 0.03) 0%, transparent 40%), radial-gradient(ellipse 80% 60% at 80% 20%, rgba(253, 224, 71, 0.02) 0%, transparent 40%)',
    opacity: 0.4,
    blendMode: 'overlay',
  },
  {
    name: 'afternoon',
    startHour: 15,
    endHour: 18,
    gradient: 'radial-gradient(ellipse 90% 70% at 80% 30%, rgba(251, 191, 36, 0.06) 0%, transparent 50%), radial-gradient(ellipse 70% 50% at 20% 70%, rgba(251, 146, 60, 0.04) 0%, transparent 50%)',
    opacity: 0.65,
    blendMode: 'soft-light',
  },
  {
    name: 'evening',
    startHour: 18,
    endHour: 20,
    gradient: 'radial-gradient(ellipse 80% 60% at 70% 20%, rgba(251, 113, 133, 0.08) 0%, transparent 50%), radial-gradient(ellipse 60% 50% at 30% 80%, rgba(249, 115, 22, 0.06) 0%, transparent 50%)',
    opacity: 0.75,
    blendMode: 'soft-light',
  },
  {
    name: 'night-early',
    startHour: 20,
    endHour: 24,
    gradient: 'radial-gradient(ellipse 90% 70% at 30% 30%, rgba(99, 102, 241, 0.09) 0%, transparent 55%), radial-gradient(ellipse 70% 60% at 70% 70%, rgba(139, 92, 246, 0.07) 0%, transparent 50%)',
    opacity: 0.8,
    blendMode: 'soft-light',
  },
];

function getCurrentPhase(): { phase: TimePhase; progress: number } {
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;
  
  for (const phase of TIME_PHASES) {
    if (hour >= phase.startHour && hour < phase.endHour) {
      // Calculate progress through this phase (0-1)
      const duration = phase.endHour - phase.startHour;
      const elapsed = hour - phase.startHour;
      const progress = elapsed / duration;
      return { phase, progress };
    }
  }
  
  // Fallback to first phase (shouldn't happen)
  return { phase: TIME_PHASES[0], progress: 0 };
}

function getNextPhase(currentPhase: TimePhase): TimePhase {
  const currentIndex = TIME_PHASES.findIndex(p => p.name === currentPhase.name);
  const nextIndex = (currentIndex + 1) % TIME_PHASES.length;
  return TIME_PHASES[nextIndex];
}

// Smooth interpolation between two values
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Smooth easing for transitions
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

interface AmbientTimeGlowProps {
  /** Enable/disable the effect */
  enabled?: boolean;
  /** Intensity multiplier (0-1) */
  intensity?: number;
  /** Enable subtle breathing animation */
  breathing?: boolean;
  /** Breathing animation duration in ms */
  breathingDuration?: number;
  /** Custom className */
  className?: string;
}

export function AmbientTimeGlow({
  enabled = true,
  intensity = 1,
  breathing = true,
  breathingDuration = 8000,
  className = '',
}: AmbientTimeGlowProps) {
  const [phaseData, setPhaseData] = useState<{ phase: TimePhase; progress: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);

  // Check for reduced motion and light mode
  useEffect(() => {
    setMounted(true);
    
    const motionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
    const colorMQ = window.matchMedia('(prefers-color-scheme: light)');
    
    setReducedMotion(motionMQ.matches);
    setIsLightMode(colorMQ.matches || document.documentElement.classList.contains('light'));
    
    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    const handleColorChange = (e: MediaQueryListEvent) => setIsLightMode(e.matches);
    
    motionMQ.addEventListener('change', handleMotionChange);
    colorMQ.addEventListener('change', handleColorChange);
    
    // Also watch for manual theme toggle
    const observer = new MutationObserver(() => {
      setIsLightMode(document.documentElement.classList.contains('light'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => {
      motionMQ.removeEventListener('change', handleMotionChange);
      colorMQ.removeEventListener('change', handleColorChange);
      observer.disconnect();
    };
  }, []);

  // Update phase every minute
  const updatePhase = useCallback(() => {
    setPhaseData(getCurrentPhase());
  }, []);

  useEffect(() => {
    if (!enabled || !mounted) return;
    
    updatePhase();
    const interval = setInterval(updatePhase, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [enabled, mounted, updatePhase]);

  // Don't render on server or when disabled
  if (!mounted || !enabled || !phaseData) {
    return null;
  }

  const { phase, progress } = phaseData;
  const nextPhase = getNextPhase(phase);
  
  // Calculate blended opacity for smooth transition near phase boundaries
  // Start blending in last 20% of each phase
  const blendThreshold = 0.8;
  let currentOpacity = phase.opacity;
  let blendedGradient = phase.gradient;
  
  if (progress > blendThreshold) {
    const blendProgress = (progress - blendThreshold) / (1 - blendThreshold);
    const easedBlend = easeInOutCubic(blendProgress);
    currentOpacity = lerp(phase.opacity, nextPhase.opacity, easedBlend);
  }

  // Reduce intensity in light mode
  const modeMultiplier = isLightMode ? 0.5 : 1;
  const finalOpacity = currentOpacity * intensity * modeMultiplier;

  return (
    <>
      <div 
        className={`ambient-time-glow ${className}`}
        data-phase={phase.name}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          background: blendedGradient,
          opacity: finalOpacity,
          mixBlendMode: phase.blendMode as any,
          transition: reducedMotion ? 'none' : 'opacity 30s ease-in-out, background 60s ease-in-out',
          animation: breathing && !reducedMotion 
            ? `ambientBreathe ${breathingDuration}ms ease-in-out infinite` 
            : 'none',
        }}
      />
      
      <style jsx>{`
        @keyframes ambientBreathe {
          0%, 100% {
            opacity: ${finalOpacity};
            transform: scale(1);
          }
          50% {
            opacity: ${finalOpacity * 0.85};
            transform: scale(1.02);
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .ambient-time-glow {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </>
  );
}

/**
 * useTimeOfDay - Hook to get current time phase
 * Useful for components that want to adapt to time of day
 */
export function useTimeOfDay() {
  const [timeData, setTimeData] = useState<{
    phase: string;
    hour: number;
    isDaytime: boolean;
    isGoldenHour: boolean;
    isNight: boolean;
  } | null>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hour = now.getHours();
      const { phase } = getCurrentPhase();
      
      setTimeData({
        phase: phase.name,
        hour,
        isDaytime: hour >= 7 && hour < 19,
        isGoldenHour: (hour >= 6 && hour < 8) || (hour >= 17 && hour < 19),
        isNight: hour >= 20 || hour < 6,
      });
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  return timeData;
}

export default AmbientTimeGlow;
