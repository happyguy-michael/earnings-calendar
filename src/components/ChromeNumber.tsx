'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

/**
 * ChromeNumber — Liquid metal/chrome effect for financial numbers
 * 
 * Inspired by 2026 Y3K aesthetic trends, holographic trading cards,
 * and premium financial terminal displays. Creates a metallic gradient
 * with animated shine sweep for emphasis on important values.
 * 
 * Features:
 * - Multi-stop metallic gradient (chrome/silver)
 * - Animated shine sweep on hover or auto-trigger
 * - Gold variant for exceptional beats
 * - Dark/light mode adaptive
 * - prefers-reduced-motion support
 */

interface ChromeNumberProps {
  children: React.ReactNode;
  /** Metal type: 'chrome' (silver), 'gold', 'rose-gold', 'copper' */
  variant?: 'chrome' | 'gold' | 'rose-gold' | 'copper';
  /** Animation trigger: 'hover', 'auto', 'both', 'none' */
  trigger?: 'hover' | 'auto' | 'both' | 'none';
  /** Interval for auto shine (ms) */
  interval?: number;
  /** Shine animation duration (ms) */
  duration?: number;
  /** Additional className */
  className?: string;
  /** Intensity of metallic effect 0-1 */
  intensity?: number;
  /** Enable 3D emboss effect */
  emboss?: boolean;
}

// Metallic gradient stops for different variants
const METAL_GRADIENTS = {
  chrome: {
    light: [
      { pos: 0, color: '#9ca3af' },    // gray-400
      { pos: 10, color: '#e5e7eb' },   // gray-200
      { pos: 25, color: '#f9fafb' },   // gray-50
      { pos: 40, color: '#d1d5db' },   // gray-300
      { pos: 50, color: '#f3f4f6' },   // gray-100
      { pos: 60, color: '#d1d5db' },   // gray-300
      { pos: 75, color: '#f9fafb' },   // gray-50
      { pos: 90, color: '#e5e7eb' },   // gray-200
      { pos: 100, color: '#9ca3af' },  // gray-400
    ],
    dark: [
      { pos: 0, color: '#4b5563' },    // gray-600
      { pos: 10, color: '#9ca3af' },   // gray-400
      { pos: 25, color: '#d1d5db' },   // gray-300
      { pos: 40, color: '#6b7280' },   // gray-500
      { pos: 50, color: '#e5e7eb' },   // gray-200
      { pos: 60, color: '#6b7280' },   // gray-500
      { pos: 75, color: '#d1d5db' },   // gray-300
      { pos: 90, color: '#9ca3af' },   // gray-400
      { pos: 100, color: '#4b5563' },  // gray-600
    ],
  },
  gold: {
    light: [
      { pos: 0, color: '#92400e' },    // amber-800
      { pos: 10, color: '#d97706' },   // amber-600
      { pos: 25, color: '#fbbf24' },   // amber-400
      { pos: 40, color: '#f59e0b' },   // amber-500
      { pos: 50, color: '#fef3c7' },   // amber-100
      { pos: 60, color: '#f59e0b' },   // amber-500
      { pos: 75, color: '#fbbf24' },   // amber-400
      { pos: 90, color: '#d97706' },   // amber-600
      { pos: 100, color: '#92400e' },  // amber-800
    ],
    dark: [
      { pos: 0, color: '#78350f' },    // amber-900
      { pos: 10, color: '#b45309' },   // amber-700
      { pos: 25, color: '#f59e0b' },   // amber-500
      { pos: 40, color: '#d97706' },   // amber-600
      { pos: 50, color: '#fcd34d' },   // amber-300
      { pos: 60, color: '#d97706' },   // amber-600
      { pos: 75, color: '#f59e0b' },   // amber-500
      { pos: 90, color: '#b45309' },   // amber-700
      { pos: 100, color: '#78350f' },  // amber-900
    ],
  },
  'rose-gold': {
    light: [
      { pos: 0, color: '#9f1239' },    // rose-800
      { pos: 10, color: '#e11d48' },   // rose-600
      { pos: 25, color: '#fb7185' },   // rose-400
      { pos: 40, color: '#f43f5e' },   // rose-500
      { pos: 50, color: '#ffe4e6' },   // rose-100
      { pos: 60, color: '#f43f5e' },   // rose-500
      { pos: 75, color: '#fb7185' },   // rose-400
      { pos: 90, color: '#e11d48' },   // rose-600
      { pos: 100, color: '#9f1239' },  // rose-800
    ],
    dark: [
      { pos: 0, color: '#881337' },    // rose-900
      { pos: 10, color: '#be123c' },   // rose-700
      { pos: 25, color: '#f43f5e' },   // rose-500
      { pos: 40, color: '#e11d48' },   // rose-600
      { pos: 50, color: '#fda4af' },   // rose-300
      { pos: 60, color: '#e11d48' },   // rose-600
      { pos: 75, color: '#f43f5e' },   // rose-500
      { pos: 90, color: '#be123c' },   // rose-700
      { pos: 100, color: '#881337' },  // rose-900
    ],
  },
  copper: {
    light: [
      { pos: 0, color: '#7c2d12' },    // orange-900
      { pos: 10, color: '#c2410c' },   // orange-700
      { pos: 25, color: '#ea580c' },   // orange-600
      { pos: 40, color: '#f97316' },   // orange-500
      { pos: 50, color: '#fed7aa' },   // orange-200
      { pos: 60, color: '#f97316' },   // orange-500
      { pos: 75, color: '#ea580c' },   // orange-600
      { pos: 90, color: '#c2410c' },   // orange-700
      { pos: 100, color: '#7c2d12' },  // orange-900
    ],
    dark: [
      { pos: 0, color: '#431407' },    // orange-950
      { pos: 10, color: '#9a3412' },   // orange-800
      { pos: 25, color: '#ea580c' },   // orange-600
      { pos: 40, color: '#c2410c' },   // orange-700
      { pos: 50, color: '#fdba74' },   // orange-300
      { pos: 60, color: '#c2410c' },   // orange-700
      { pos: 75, color: '#ea580c' },   // orange-600
      { pos: 90, color: '#9a3412' },   // orange-800
      { pos: 100, color: '#431407' },  // orange-950
    ],
  },
};

function buildGradient(stops: { pos: number; color: string }[], angle: number = 135): string {
  const colorStops = stops.map(s => `${s.color} ${s.pos}%`).join(', ');
  return `linear-gradient(${angle}deg, ${colorStops})`;
}

export function ChromeNumber({
  children,
  variant = 'chrome',
  trigger = 'hover',
  interval = 4000,
  duration = 800,
  className = '',
  intensity = 1,
  emboss = true,
}: ChromeNumberProps) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const [isShining, setIsShining] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Detect reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Trigger shine animation
  const triggerShine = useCallback(() => {
    if (prefersReducedMotion) return;
    setIsShining(true);
    setTimeout(() => setIsShining(false), duration);
  }, [duration, prefersReducedMotion]);

  // Auto-shine interval
  useEffect(() => {
    if ((trigger === 'auto' || trigger === 'both') && !prefersReducedMotion) {
      // Initial delay before first auto-shine
      const initialDelay = setTimeout(() => {
        triggerShine();
        intervalRef.current = setInterval(triggerShine, interval);
      }, interval / 2);

      return () => {
        clearTimeout(initialDelay);
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [trigger, interval, triggerShine, prefersReducedMotion]);

  const handleMouseEnter = () => {
    if ((trigger === 'hover' || trigger === 'both') && !isShining) {
      triggerShine();
    }
  };

  const gradientStops = METAL_GRADIENTS[variant][isDark ? 'dark' : 'light'];
  const gradient = buildGradient(gradientStops);

  // Text shadow for emboss effect
  const embossShadow = emboss
    ? isDark
      ? '0 1px 0 rgba(255,255,255,0.15), 0 -1px 0 rgba(0,0,0,0.5)'
      : '0 1px 0 rgba(255,255,255,0.8), 0 -1px 0 rgba(0,0,0,0.1)'
    : 'none';

  return (
    <>
      <style jsx>{`
        .chrome-number {
          position: relative;
          display: inline-block;
          background: ${gradient};
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: ${embossShadow};
          font-weight: 600;
          overflow: hidden;
        }

        .chrome-number::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            transparent 30%,
            rgba(255, 255, 255, ${0.4 * intensity}) 45%,
            rgba(255, 255, 255, ${0.8 * intensity}) 50%,
            rgba(255, 255, 255, ${0.4 * intensity}) 55%,
            transparent 70%,
            transparent 100%
          );
          transform: skewX(-20deg);
          pointer-events: none;
        }

        .chrome-number.shining::before {
          animation: chrome-shine ${duration}ms ease-in-out;
        }

        @keyframes chrome-shine {
          0% {
            left: -100%;
          }
          100% {
            left: 200%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .chrome-number::before {
            display: none;
          }
        }
      `}</style>
      <span
        ref={elementRef}
        className={`chrome-number ${isShining ? 'shining' : ''} ${className}`}
        onMouseEnter={handleMouseEnter}
      >
        {children}
      </span>
    </>
  );
}

/**
 * ChromePercentage — Chrome number specifically formatted for percentages
 */
interface ChromePercentageProps extends Omit<ChromeNumberProps, 'children'> {
  value: number;
  /** Show + sign for positive values */
  showSign?: boolean;
  /** Decimal places */
  decimals?: number;
}

export function ChromePercentage({
  value,
  showSign = true,
  decimals = 2,
  variant,
  ...props
}: ChromePercentageProps) {
  const formatted = value.toFixed(decimals);
  const sign = value > 0 && showSign ? '+' : '';
  
  // Auto-select variant based on value if not specified
  const autoVariant = variant ?? (value > 10 ? 'gold' : value > 0 ? 'chrome' : 'rose-gold');

  return (
    <ChromeNumber variant={autoVariant} {...props}>
      {sign}{formatted}%
    </ChromeNumber>
  );
}

/**
 * ChromeEPS — Chrome effect for EPS values
 */
interface ChromeEPSProps extends Omit<ChromeNumberProps, 'children'> {
  value: number;
  /** Show currency symbol */
  currency?: string;
}

export function ChromeEPS({
  value,
  currency = '$',
  variant = 'chrome',
  ...props
}: ChromeEPSProps) {
  const formatted = value.toFixed(2);
  const sign = value >= 0 ? '' : '-';
  const absValue = Math.abs(value).toFixed(2);

  return (
    <ChromeNumber variant={variant} {...props}>
      {sign}{currency}{absValue}
    </ChromeNumber>
  );
}

/**
 * ChromeSurprise — Chrome effect with auto-variant based on surprise magnitude
 */
interface ChromeSurpriseProps extends Omit<ChromeNumberProps, 'children' | 'variant'> {
  /** Surprise percentage (e.g., 15 for +15%) */
  surprise: number;
  /** Threshold for gold variant */
  goldThreshold?: number;
}

export function ChromeSurprise({
  surprise,
  goldThreshold = 10,
  ...props
}: ChromeSurpriseProps) {
  // Gold for exceptional beats, chrome for normal beats, rose-gold for misses
  const variant = surprise >= goldThreshold 
    ? 'gold' 
    : surprise > 0 
      ? 'chrome' 
      : 'rose-gold';

  const sign = surprise > 0 ? '+' : '';
  const formatted = surprise.toFixed(1);

  return (
    <ChromeNumber variant={variant} trigger="both" {...props}>
      {sign}{formatted}%
    </ChromeNumber>
  );
}

export default ChromeNumber;
