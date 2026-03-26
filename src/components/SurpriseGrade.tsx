'use client';

import { memo, useMemo, useEffect, useState, useRef, CSSProperties } from 'react';

/**
 * SurpriseGrade — Letter grade for individual earnings surprises
 * 
 * Complements BeatRateGrade (which grades aggregate beat rates) by providing
 * instant context for individual earnings results.
 * 
 * Inspiration:
 * - Academic grading systems (intuitive performance context)
 * - Gaming S-tier / A+ ratings
 * - Sports analytics grade cards
 * - 2026 "Interpretive Data" trend
 * 
 * Core Concept:
 * Users see "+12.5% surprise" but don't immediately know if that's exceptional.
 * A letter grade (A+, B, C, F) instantly communicates performance.
 * 
 * The grade creates an emotional response:
 * - "S" feels legendary, exceptional
 * - "A+" feels great
 * - "F" feels concerning
 */

// Grade definitions with thresholds for surprise percentages
const BEAT_GRADES = [
  { 
    min: 30, 
    grade: 'S', 
    label: 'Legendary', 
    color: '#fbbf24', // Gold
    glowColor: 'rgba(251, 191, 36, 0.6)',
    bgGradient: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)',
    sparkle: true,
    shake: true,
    tier: 'legendary'
  },
  { 
    min: 20, 
    grade: 'A+', 
    label: 'Exceptional', 
    color: '#22c55e',
    glowColor: 'rgba(34, 197, 94, 0.5)',
    bgGradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.08) 100%)',
    sparkle: true,
    shake: false,
    tier: 'exceptional'
  },
  { 
    min: 15, 
    grade: 'A', 
    label: 'Excellent', 
    color: '#4ade80',
    glowColor: 'rgba(74, 222, 128, 0.4)',
    bgGradient: 'linear-gradient(135deg, rgba(74, 222, 128, 0.12) 0%, rgba(34, 197, 94, 0.06) 100%)',
    sparkle: false,
    shake: false,
    tier: 'excellent'
  },
  { 
    min: 10, 
    grade: 'A-', 
    label: 'Very Good', 
    color: '#86efac',
    glowColor: 'rgba(134, 239, 172, 0.35)',
    bgGradient: 'linear-gradient(135deg, rgba(134, 239, 172, 0.1) 0%, rgba(74, 222, 128, 0.05) 100%)',
    sparkle: false,
    shake: false,
    tier: 'good'
  },
  { 
    min: 5, 
    grade: 'B+', 
    label: 'Good', 
    color: '#a3e635',
    glowColor: 'rgba(163, 230, 53, 0.3)',
    bgGradient: 'linear-gradient(135deg, rgba(163, 230, 53, 0.08) 0%, rgba(132, 204, 22, 0.04) 100%)',
    sparkle: false,
    shake: false,
    tier: 'good'
  },
  { 
    min: 2, 
    grade: 'B', 
    label: 'Solid', 
    color: '#84cc16',
    glowColor: 'rgba(132, 204, 22, 0.25)',
    bgGradient: 'linear-gradient(135deg, rgba(132, 204, 22, 0.06) 0%, rgba(163, 230, 53, 0.03) 100%)',
    sparkle: false,
    shake: false,
    tier: 'average'
  },
  { 
    min: 0, 
    grade: 'C', 
    label: 'Met', 
    color: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.2)',
    bgGradient: 'linear-gradient(135deg, rgba(251, 191, 36, 0.06) 0%, rgba(245, 158, 11, 0.03) 100%)',
    sparkle: false,
    shake: false,
    tier: 'average'
  },
] as const;

const MISS_GRADES = [
  { 
    max: 0, 
    grade: 'D', 
    label: 'Slight Miss', 
    color: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.3)',
    bgGradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(239, 68, 68, 0.04) 100%)',
    sparkle: false,
    shake: false,
    tier: 'miss'
  },
  { 
    max: -5, 
    grade: 'D-', 
    label: 'Miss', 
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.35)',
    bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
    sparkle: false,
    shake: false,
    tier: 'miss'
  },
  { 
    max: -10, 
    grade: 'F', 
    label: 'Bad Miss', 
    color: '#dc2626',
    glowColor: 'rgba(220, 38, 38, 0.4)',
    bgGradient: 'linear-gradient(135deg, rgba(220, 38, 38, 0.12) 0%, rgba(185, 28, 28, 0.06) 100%)',
    sparkle: false,
    shake: true,
    tier: 'fail'
  },
  { 
    max: -20, 
    grade: 'F-', 
    label: 'Disaster', 
    color: '#b91c1c',
    glowColor: 'rgba(185, 28, 28, 0.5)',
    bgGradient: 'linear-gradient(135deg, rgba(185, 28, 28, 0.15) 0%, rgba(127, 29, 29, 0.08) 100%)',
    sparkle: false,
    shake: true,
    tier: 'disaster'
  },
] as const;

interface GradeInfo {
  grade: string;
  label: string;
  color: string;
  glowColor: string;
  bgGradient: string;
  sparkle: boolean;
  shake: boolean;
  tier: string;
}

function getGradeInfo(surprise: number): GradeInfo {
  if (surprise >= 0) {
    // Beat or met - use beat grades
    for (const g of BEAT_GRADES) {
      if (surprise >= g.min) {
        return g;
      }
    }
    return BEAT_GRADES[BEAT_GRADES.length - 1];
  } else {
    // Miss - use miss grades (sorted by max descending)
    for (const g of MISS_GRADES) {
      if (surprise > g.max) {
        return g;
      }
    }
    return MISS_GRADES[MISS_GRADES.length - 1];
  }
}

interface SurpriseGradeProps {
  /** The surprise percentage (e.g., 12.5 for +12.5%, -8.3 for -8.3%) */
  surprise: number;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Show descriptive label */
  showLabel?: boolean;
  /** Animation delay in ms */
  delay?: number;
  /** Whether to animate entrance */
  animate?: boolean;
  /** Additional CSS class */
  className?: string;
}

/**
 * SurpriseGrade - Animated letter grade for earnings surprises
 */
export const SurpriseGrade = memo(function SurpriseGrade({
  surprise,
  size = 'sm',
  showLabel = false,
  delay = 0,
  animate = true,
  className = '',
}: SurpriseGradeProps) {
  const [isVisible, setIsVisible] = useState(!animate);
  const [showSparkles, setShowSparkles] = useState(false);
  const gradeRef = useRef<HTMLDivElement>(null);
  
  const gradeInfo = useMemo(() => getGradeInfo(surprise), [surprise]);

  // Entrance animation with intersection observer
  useEffect(() => {
    if (!animate) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const timer = setTimeout(() => {
            setIsVisible(true);
            // Trigger sparkles for exceptional grades
            if (gradeInfo.sparkle) {
              setTimeout(() => setShowSparkles(true), 200);
              setTimeout(() => setShowSparkles(false), 1200);
            }
          }, delay);
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.3 }
    );

    if (gradeRef.current) {
      observer.observe(gradeRef.current);
    }

    return () => observer.disconnect();
  }, [animate, delay, gradeInfo.sparkle]);

  // Check for reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const shouldAnimate = animate && !prefersReducedMotion;

  // Size configurations
  const sizes = {
    xs: { 
      padding: '2px 4px', 
      fontSize: '9px', 
      borderRadius: '4px',
      gap: '2px',
      labelSize: '7px',
    },
    sm: { 
      padding: '3px 6px', 
      fontSize: '11px', 
      borderRadius: '5px',
      gap: '3px',
      labelSize: '8px',
    },
    md: { 
      padding: '4px 8px', 
      fontSize: '13px', 
      borderRadius: '6px',
      gap: '4px',
      labelSize: '9px',
    },
    lg: { 
      padding: '6px 10px', 
      fontSize: '16px', 
      borderRadius: '8px',
      gap: '5px',
      labelSize: '10px',
    },
  };

  const s = sizes[size];

  const style: CSSProperties = {
    '--grade-color': gradeInfo.color,
    '--grade-glow': gradeInfo.glowColor,
    '--grade-bg': gradeInfo.bgGradient,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s.gap,
    padding: s.padding,
    fontSize: s.fontSize,
    fontWeight: 700,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    letterSpacing: '-0.02em',
    borderRadius: s.borderRadius,
    background: gradeInfo.bgGradient,
    color: gradeInfo.color,
    border: `1px solid ${gradeInfo.color}30`,
    boxShadow: isVisible 
      ? `0 0 12px ${gradeInfo.glowColor}, inset 0 1px 0 rgba(255,255,255,0.1)`
      : 'none',
    opacity: isVisible ? 1 : 0,
    transform: isVisible 
      ? 'scale(1) translateY(0)' 
      : 'scale(0.8) translateY(4px)',
    transition: shouldAnimate 
      ? 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' 
      : 'none',
    position: 'relative',
    overflow: 'visible',
  } as CSSProperties;

  // Shake animation for extreme grades
  const shakeClass = gradeInfo.shake && shouldAnimate && isVisible 
    ? 'surprise-grade-shake' 
    : '';

  return (
    <>
      <div 
        ref={gradeRef}
        className={`surprise-grade ${shakeClass} ${className}`}
        style={style}
        title={`${gradeInfo.label}: ${surprise >= 0 ? '+' : ''}${surprise.toFixed(1)}% vs estimate`}
        role="img"
        aria-label={`Grade ${gradeInfo.grade}, ${gradeInfo.label}`}
      >
        {/* Sparkle particles for exceptional grades */}
        {showSparkles && gradeInfo.sparkle && (
          <span className="surprise-grade-sparkles" aria-hidden="true">
            {[...Array(6)].map((_, i) => (
              <span 
                key={i} 
                className="surprise-grade-sparkle"
                style={{
                  '--sparkle-angle': `${i * 60}deg`,
                  '--sparkle-delay': `${i * 0.05}s`,
                } as CSSProperties}
              />
            ))}
          </span>
        )}
        
        {/* Grade letter */}
        <span className="surprise-grade-letter">{gradeInfo.grade}</span>
        
        {/* Optional label */}
        {showLabel && (
          <span 
            className="surprise-grade-label"
            style={{ 
              fontSize: s.labelSize, 
              opacity: 0.8,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
            }}
          >
            {gradeInfo.label}
          </span>
        )}
      </div>

      {/* Scoped styles */}
      <style jsx>{`
        @keyframes surprise-grade-shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-1px); }
          20%, 40%, 60%, 80% { transform: translateX(1px); }
        }
        
        .surprise-grade-shake {
          animation: surprise-grade-shake 0.5s ease-in-out;
          animation-delay: 0.3s;
        }
        
        .surprise-grade-sparkles {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        
        @keyframes surprise-sparkle-burst {
          0% {
            opacity: 1;
            transform: rotate(var(--sparkle-angle)) translateX(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: rotate(var(--sparkle-angle)) translateX(16px) scale(0);
          }
        }
        
        .surprise-grade-sparkle {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 3px;
          height: 3px;
          background: var(--grade-color);
          border-radius: 50%;
          box-shadow: 0 0 4px var(--grade-glow);
          animation: surprise-sparkle-burst 0.6s ease-out forwards;
          animation-delay: var(--sparkle-delay);
        }
        
        /* Light mode adjustments */
        @media (prefers-color-scheme: light) {
          .surprise-grade {
            border-color: var(--grade-color) !important;
            border-opacity: 0.3;
          }
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .surprise-grade {
            transition: none !important;
            animation: none !important;
          }
          .surprise-grade-sparkle {
            display: none;
          }
        }
      `}</style>
    </>
  );
});

/**
 * SurpriseGradeCompact - Even more compact variant for inline use
 */
export const SurpriseGradeCompact = memo(function SurpriseGradeCompact({
  surprise,
  delay = 0,
  className = '',
}: {
  surprise: number;
  delay?: number;
  className?: string;
}) {
  const gradeInfo = useMemo(() => getGradeInfo(surprise), [surprise]);
  
  return (
    <span 
      className={`surprise-grade-compact ${className}`}
      style={{
        color: gradeInfo.color,
        fontWeight: 700,
        fontSize: '10px',
        textShadow: `0 0 8px ${gradeInfo.glowColor}`,
      }}
      title={`Grade: ${gradeInfo.grade}`}
    >
      {gradeInfo.grade}
    </span>
  );
});

export default SurpriseGrade;
