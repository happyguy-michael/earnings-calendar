'use client';

import { memo, useMemo, useEffect, useState, useRef, CSSProperties } from 'react';
import { useMotionPreferences } from './MotionPreferences';

/**
 * BeatRateGrade — Letter grade system for beat rate performance
 * 
 * Inspiration:
 * - Academic grading systems (intuitive performance context)
 * - Gaming leaderboards / performance ratings (S-tier, A+, etc.)
 * - Morningstar fund ratings (stars)
 * - 2026 "Interpretive Data" trend — raw numbers need context
 * 
 * Core Concept:
 * Users see "90% beat rate" but don't know if that's good or not.
 * A letter grade (A+, B, C, etc.) instantly communicates performance.
 * This is interpretive context for raw numbers.
 * 
 * The grade creates an emotional response that percentages can't achieve.
 * Getting an "A+" feels like an achievement; a "C" signals concern.
 */

// Grade definitions with thresholds and visual styling
const GRADES = [
  { 
    min: 95, 
    grade: 'S', 
    label: 'Legendary', 
    color: '#fbbf24', // Gold
    glowColor: 'rgba(251, 191, 36, 0.6)',
    bgGradient: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)',
    sparkle: true,
    pulse: true,
    tier: 'legendary'
  },
  { 
    min: 90, 
    grade: 'A+', 
    label: 'Exceptional', 
    color: '#22c55e', // Emerald
    glowColor: 'rgba(34, 197, 94, 0.5)',
    bgGradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%)',
    sparkle: true,
    pulse: false,
    tier: 'exceptional'
  },
  { 
    min: 85, 
    grade: 'A', 
    label: 'Excellent', 
    color: '#4ade80', // Light green
    glowColor: 'rgba(74, 222, 128, 0.4)',
    bgGradient: 'linear-gradient(135deg, rgba(74, 222, 128, 0.1) 0%, rgba(34, 197, 94, 0.06) 100%)',
    sparkle: false,
    pulse: false,
    tier: 'excellent'
  },
  { 
    min: 80, 
    grade: 'A-', 
    label: 'Very Good', 
    color: '#86efac', // Pale green
    glowColor: 'rgba(134, 239, 172, 0.35)',
    bgGradient: 'linear-gradient(135deg, rgba(134, 239, 172, 0.08) 0%, rgba(74, 222, 128, 0.04) 100%)',
    sparkle: false,
    pulse: false,
    tier: 'good'
  },
  { 
    min: 75, 
    grade: 'B+', 
    label: 'Good', 
    color: '#a3e635', // Lime
    glowColor: 'rgba(163, 230, 53, 0.3)',
    bgGradient: 'linear-gradient(135deg, rgba(163, 230, 53, 0.08) 0%, rgba(132, 204, 22, 0.04) 100%)',
    sparkle: false,
    pulse: false,
    tier: 'good'
  },
  { 
    min: 70, 
    grade: 'B', 
    label: 'Solid', 
    color: '#facc15', // Yellow
    glowColor: 'rgba(250, 204, 21, 0.3)',
    bgGradient: 'linear-gradient(135deg, rgba(250, 204, 21, 0.08) 0%, rgba(234, 179, 8, 0.04) 100%)',
    sparkle: false,
    pulse: false,
    tier: 'average'
  },
  { 
    min: 65, 
    grade: 'B-', 
    label: 'Fair', 
    color: '#fbbf24', // Amber
    glowColor: 'rgba(251, 191, 36, 0.25)',
    bgGradient: 'linear-gradient(135deg, rgba(251, 191, 36, 0.06) 0%, rgba(245, 158, 11, 0.03) 100%)',
    sparkle: false,
    pulse: false,
    tier: 'average'
  },
  { 
    min: 60, 
    grade: 'C+', 
    label: 'Below Average', 
    color: '#fb923c', // Orange
    glowColor: 'rgba(251, 146, 60, 0.25)',
    bgGradient: 'linear-gradient(135deg, rgba(251, 146, 60, 0.06) 0%, rgba(249, 115, 22, 0.03) 100%)',
    sparkle: false,
    pulse: false,
    tier: 'below'
  },
  { 
    min: 55, 
    grade: 'C', 
    label: 'Weak', 
    color: '#f97316', // Dark orange
    glowColor: 'rgba(249, 115, 22, 0.25)',
    bgGradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.06) 0%, rgba(234, 88, 12, 0.03) 100%)',
    sparkle: false,
    pulse: false,
    tier: 'below'
  },
  { 
    min: 50, 
    grade: 'C-', 
    label: 'Poor', 
    color: '#ea580c', // Darker orange
    glowColor: 'rgba(234, 88, 12, 0.2)',
    bgGradient: 'linear-gradient(135deg, rgba(234, 88, 12, 0.05) 0%, rgba(194, 65, 12, 0.02) 100%)',
    sparkle: false,
    pulse: false,
    tier: 'poor'
  },
  { 
    min: 0, 
    grade: 'D', 
    label: 'Struggling', 
    color: '#ef4444', // Red
    glowColor: 'rgba(239, 68, 68, 0.25)',
    bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.06) 0%, rgba(220, 38, 38, 0.03) 100%)',
    sparkle: false,
    pulse: true, // Warning pulse
    tier: 'poor'
  },
] as const;

type GradeInfo = typeof GRADES[number];

function getGradeInfo(beatRate: number): GradeInfo {
  for (const grade of GRADES) {
    if (beatRate >= grade.min) {
      return grade;
    }
  }
  return GRADES[GRADES.length - 1];
}

// Sparkle component for legendary/exceptional grades
const Sparkles = memo(function Sparkles({ color }: { color: string }) {
  return (
    <div className="sparkles-container" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="sparkle"
          style={{
            '--sparkle-index': i,
            '--sparkle-color': color,
          } as CSSProperties}
        />
      ))}
      <style jsx>{`
        .sparkles-container {
          position: absolute;
          inset: -8px;
          pointer-events: none;
          overflow: visible;
        }
        .sparkle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: var(--sparkle-color);
          border-radius: 50%;
          animation: sparkle-float 2s ease-in-out infinite;
          animation-delay: calc(var(--sparkle-index) * 0.33s);
          opacity: 0;
          box-shadow: 0 0 4px var(--sparkle-color);
        }
        .sparkle:nth-child(1) { top: 0; left: 50%; }
        .sparkle:nth-child(2) { top: 20%; right: -4px; }
        .sparkle:nth-child(3) { bottom: 20%; right: -4px; }
        .sparkle:nth-child(4) { bottom: 0; left: 50%; }
        .sparkle:nth-child(5) { bottom: 20%; left: -4px; }
        .sparkle:nth-child(6) { top: 20%; left: -4px; }
        
        @keyframes sparkle-float {
          0%, 100% {
            opacity: 0;
            transform: scale(0) translate(0, 0);
          }
          20% {
            opacity: 1;
            transform: scale(1) translate(0, 0);
          }
          80% {
            opacity: 0.8;
            transform: scale(0.8) translate(
              calc((var(--sparkle-index) - 2.5) * 4px),
              calc(sin(var(--sparkle-index)) * 6px)
            );
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .sparkle {
            animation: none;
            opacity: 0.6;
            transform: scale(0.8);
          }
        }
      `}</style>
    </div>
  );
});

// Main grade badge component
interface BeatRateGradeProps {
  /** Beat rate percentage (0-100) */
  beatRate: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Show the text label (e.g., "Exceptional") */
  showLabel?: boolean;
  /** Compact mode - grade only, no wrapper styling */
  compact?: boolean;
  /** Show glow effect */
  glow?: boolean;
  /** Animation delay in ms */
  delay?: number;
  /** Additional class names */
  className?: string;
}

export const BeatRateGrade = memo(function BeatRateGrade({
  beatRate,
  size = 'md',
  showLabel = true,
  compact = false,
  glow = true,
  delay = 0,
  className = '',
}: BeatRateGradeProps) {
  const { shouldAnimate } = useMotionPreferences();
  const [isVisible, setIsVisible] = useState(false);
  const [animatedIn, setAnimatedIn] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const gradeInfo = useMemo(() => getGradeInfo(beatRate), [beatRate]);

  // Intersection observer for entrance animation
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Trigger animation after delay
  useEffect(() => {
    if (!isVisible) return;
    
    const timer = setTimeout(() => {
      setAnimatedIn(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [isVisible, delay]);

  const sizeStyles = {
    sm: {
      wrapper: 'px-2 py-1',
      grade: 'text-lg font-bold',
      label: 'text-[10px]',
      gap: 'gap-1',
    },
    md: {
      wrapper: 'px-3 py-1.5',
      grade: 'text-2xl font-bold',
      label: 'text-xs',
      gap: 'gap-1.5',
    },
    lg: {
      wrapper: 'px-4 py-2',
      grade: 'text-3xl font-black',
      label: 'text-sm',
      gap: 'gap-2',
    },
    xl: {
      wrapper: 'px-5 py-3',
      grade: 'text-4xl font-black',
      label: 'text-base',
      gap: 'gap-2',
    },
  };

  const styles = sizeStyles[size];

  if (compact) {
    return (
      <span
        ref={ref}
        className={`beat-rate-grade-compact ${className}`}
        style={{
          color: gradeInfo.color,
          fontWeight: 700,
          textShadow: glow ? `0 0 8px ${gradeInfo.glowColor}` : undefined,
        }}
        title={`${gradeInfo.grade}: ${gradeInfo.label} (${beatRate}%)`}
      >
        {gradeInfo.grade}
      </span>
    );
  }

  return (
    <div
      ref={ref}
      className={`beat-rate-grade ${styles.wrapper} ${styles.gap} ${className}`}
      data-tier={gradeInfo.tier}
      data-animated={animatedIn}
      style={{
        '--grade-color': gradeInfo.color,
        '--grade-glow': gradeInfo.glowColor,
        '--grade-bg': gradeInfo.bgGradient,
      } as CSSProperties}
    >
      <div className="grade-badge-wrapper">
        {gradeInfo.sparkle && shouldAnimate('decorative') && (
          <Sparkles color={gradeInfo.color} />
        )}
        <span className={`grade-letter ${styles.grade}`}>
          {gradeInfo.grade}
        </span>
      </div>
      {showLabel && (
        <span className={`grade-label ${styles.label}`}>
          {gradeInfo.label}
        </span>
      )}

      <style jsx>{`
        .beat-rate-grade {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          background: var(--grade-bg);
          border-radius: 12px;
          border: 1px solid color-mix(in srgb, var(--grade-color) 20%, transparent);
          position: relative;
          overflow: visible;
          opacity: 0;
          transform: scale(0.8) translateY(8px);
          transition: opacity 0.4s ease-out, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .beat-rate-grade[data-animated="true"] {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
        
        .grade-badge-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .grade-letter {
          color: var(--grade-color);
          text-shadow: 0 0 12px var(--grade-glow),
                       0 0 24px var(--grade-glow);
          letter-spacing: -0.02em;
          line-height: 1;
        }
        
        .grade-label {
          color: var(--grade-color);
          opacity: 0.85;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 500;
          margin-top: 2px;
        }
        
        /* Pulse animation for legendary (S) and poor (D) tiers */
        .beat-rate-grade[data-tier="legendary"]::before,
        .beat-rate-grade[data-tier="poor"]::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 14px;
          background: var(--grade-glow);
          opacity: 0;
          z-index: -1;
          animation: grade-pulse 2s ease-in-out infinite;
        }
        
        .beat-rate-grade[data-tier="poor"]::before {
          animation-duration: 1.5s;
        }
        
        @keyframes grade-pulse {
          0%, 100% {
            opacity: 0;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(1.05);
          }
        }
        
        /* Hover effects */
        .beat-rate-grade:hover .grade-letter {
          text-shadow: 0 0 16px var(--grade-glow),
                       0 0 32px var(--grade-glow),
                       0 0 48px var(--grade-glow);
        }
        
        @media (prefers-reduced-motion: reduce) {
          .beat-rate-grade {
            opacity: 1;
            transform: none;
            transition: none;
          }
          .beat-rate-grade::before {
            animation: none !important;
          }
        }
        
        /* Print styles */
        @media print {
          .beat-rate-grade {
            background: none;
            border: 1px solid currentColor;
            box-shadow: none;
          }
          .grade-letter {
            text-shadow: none;
          }
        }
      `}</style>
    </div>
  );
});

// Inline version for use within text
interface BeatRateGradeInlineProps {
  beatRate: number;
  className?: string;
}

export const BeatRateGradeInline = memo(function BeatRateGradeInline({
  beatRate,
  className = '',
}: BeatRateGradeInlineProps) {
  const gradeInfo = useMemo(() => getGradeInfo(beatRate), [beatRate]);

  return (
    <span
      className={`beat-rate-grade-inline ${className}`}
      style={{
        color: gradeInfo.color,
        fontWeight: 700,
        padding: '2px 6px',
        borderRadius: '4px',
        background: `color-mix(in srgb, ${gradeInfo.color} 12%, transparent)`,
        fontSize: '0.85em',
        letterSpacing: '-0.01em',
      }}
      title={`${gradeInfo.label} (${beatRate}%)`}
    >
      {gradeInfo.grade}
    </span>
  );
});

// Tooltip-style badge with more detail
interface BeatRateGradeBadgeProps {
  beatRate: number;
  historicalAverage?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const BeatRateGradeBadge = memo(function BeatRateGradeBadge({
  beatRate,
  historicalAverage,
  size = 'md',
  className = '',
}: BeatRateGradeBadgeProps) {
  const { shouldAnimate } = useMotionPreferences();
  const gradeInfo = useMemo(() => getGradeInfo(beatRate), [beatRate]);
  const [isHovered, setIsHovered] = useState(false);

  const comparison = historicalAverage !== undefined
    ? beatRate >= historicalAverage
      ? { text: 'Above avg', color: '#22c55e', icon: '↑' }
      : { text: 'Below avg', color: '#f97316', icon: '↓' }
    : null;

  const sizeConfig = {
    sm: { badge: 'h-6 px-2 text-xs', grade: 'text-sm', gap: 'gap-1' },
    md: { badge: 'h-8 px-3 text-sm', grade: 'text-lg', gap: 'gap-1.5' },
    lg: { badge: 'h-10 px-4 text-base', grade: 'text-xl', gap: 'gap-2' },
  };

  const config = sizeConfig[size];

  return (
    <div
      className={`beat-rate-grade-badge ${config.badge} ${config.gap} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        '--grade-color': gradeInfo.color,
        '--grade-glow': gradeInfo.glowColor,
      } as CSSProperties}
    >
      <span className={`grade ${config.grade}`}>{gradeInfo.grade}</span>
      <span className="label">{gradeInfo.label}</span>
      {comparison && (
        <span className="comparison" style={{ color: comparison.color }}>
          {comparison.icon}
        </span>
      )}

      {/* Sparkle effect on hover for high grades */}
      {isHovered && gradeInfo.sparkle && shouldAnimate('decorative') && (
        <span className="hover-sparkle" aria-hidden="true">✨</span>
      )}

      <style jsx>{`
        .beat-rate-grade-badge {
          display: inline-flex;
          align-items: center;
          background: linear-gradient(
            135deg,
            color-mix(in srgb, var(--grade-color) 10%, transparent),
            color-mix(in srgb, var(--grade-color) 5%, transparent)
          );
          border: 1px solid color-mix(in srgb, var(--grade-color) 25%, transparent);
          border-radius: 8px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        
        .beat-rate-grade-badge:hover {
          border-color: color-mix(in srgb, var(--grade-color) 40%, transparent);
          box-shadow: 0 0 16px var(--grade-glow);
        }
        
        .grade {
          font-weight: 700;
          color: var(--grade-color);
          line-height: 1;
        }
        
        .label {
          color: var(--grade-color);
          opacity: 0.75;
          font-weight: 500;
        }
        
        .comparison {
          font-weight: 600;
          font-size: 0.9em;
        }
        
        .hover-sparkle {
          position: absolute;
          right: 4px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.7em;
          animation: sparkle-pop 0.3s ease-out forwards;
        }
        
        @keyframes sparkle-pop {
          0% {
            opacity: 0;
            transform: translateY(-50%) scale(0);
          }
          100% {
            opacity: 1;
            transform: translateY(-50%) scale(1);
          }
        }
        
        @media print {
          .beat-rate-grade-badge {
            background: none;
            border: 1px solid currentColor;
          }
        }
      `}</style>
    </div>
  );
});

export default BeatRateGrade;
