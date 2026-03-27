'use client';

import { memo, useMemo } from 'react';

/**
 * FiscalQuarterBadge
 * 
 * A stylish badge showing fiscal quarter (Q1-Q4) based on earnings date.
 * Each quarter has its own color theme inspired by seasons:
 * - Q1 (Jan-Mar): Spring green/teal
 * - Q2 (Apr-Jun): Summer gold/orange  
 * - Q3 (Jul-Sep): Autumn amber/red
 * - Q4 (Oct-Dec): Winter blue/purple
 * 
 * Features:
 * - Gradient backgrounds per quarter
 * - Subtle pulse animation
 * - Hover glow effect
 * - Dark/light mode aware
 * - Compact & expanded variants
 */

interface FiscalQuarterBadgeProps {
  /** Earnings date string (YYYY-MM-DD) */
  date: string;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md';
  /** Show full label "Q1 2026" vs just "Q1" */
  showYear?: boolean;
  /** Enable hover glow effect */
  glow?: boolean;
  /** Enable subtle pulse animation */
  pulse?: boolean;
  /** Additional className */
  className?: string;
}

// Quarter color themes - seasonal inspiration
const quarterThemes = {
  Q1: {
    // Spring: Fresh greens and teals
    gradient: 'linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%)',
    gradientDark: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #0891b2 100%)',
    glow: 'rgba(16, 185, 129, 0.4)',
    glowDark: 'rgba(16, 185, 129, 0.5)',
    text: '#064e3b',
    textDark: '#ecfdf5',
    bg: 'rgba(16, 185, 129, 0.15)',
    bgDark: 'rgba(16, 185, 129, 0.2)',
  },
  Q2: {
    // Summer: Warm golds and oranges
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ef4444 100%)',
    gradientDark: 'linear-gradient(135deg, #d97706 0%, #ea580c 50%, #dc2626 100%)',
    glow: 'rgba(245, 158, 11, 0.4)',
    glowDark: 'rgba(245, 158, 11, 0.5)',
    text: '#78350f',
    textDark: '#fffbeb',
    bg: 'rgba(245, 158, 11, 0.15)',
    bgDark: 'rgba(245, 158, 11, 0.2)',
  },
  Q3: {
    // Autumn: Rich ambers and reds
    gradient: 'linear-gradient(135deg, #dc2626 0%, #be123c 50%, #9333ea 100%)',
    gradientDark: 'linear-gradient(135deg, #b91c1c 0%, #9f1239 50%, #7c3aed 100%)',
    glow: 'rgba(220, 38, 38, 0.4)',
    glowDark: 'rgba(220, 38, 38, 0.5)',
    text: '#7f1d1d',
    textDark: '#fef2f2',
    bg: 'rgba(220, 38, 38, 0.15)',
    bgDark: 'rgba(220, 38, 38, 0.2)',
  },
  Q4: {
    // Winter: Cool blues and purples
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
    gradientDark: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)',
    glow: 'rgba(99, 102, 241, 0.4)',
    glowDark: 'rgba(99, 102, 241, 0.5)',
    text: '#312e81',
    textDark: '#eef2ff',
    bg: 'rgba(99, 102, 241, 0.15)',
    bgDark: 'rgba(99, 102, 241, 0.2)',
  },
} as const;

type Quarter = keyof typeof quarterThemes;

/**
 * Get fiscal quarter from date
 * Most companies follow calendar year quarters:
 * Q1: Jan-Mar, Q2: Apr-Jun, Q3: Jul-Sep, Q4: Oct-Dec
 */
function getQuarterFromDate(dateStr: string): { quarter: Quarter; year: number } {
  const date = new Date(dateStr);
  const month = date.getMonth(); // 0-indexed
  const year = date.getFullYear();
  
  // Map month to quarter
  let quarter: Quarter;
  if (month <= 2) quarter = 'Q1';
  else if (month <= 5) quarter = 'Q2';
  else if (month <= 8) quarter = 'Q3';
  else quarter = 'Q4';
  
  return { quarter, year };
}

const sizeStyles = {
  xs: {
    fontSize: '9px',
    padding: '1px 4px',
    borderRadius: '4px',
    letterSpacing: '0.5px',
  },
  sm: {
    fontSize: '10px',
    padding: '2px 6px',
    borderRadius: '5px',
    letterSpacing: '0.5px',
  },
  md: {
    fontSize: '11px',
    padding: '3px 8px',
    borderRadius: '6px',
    letterSpacing: '0.5px',
  },
};

export const FiscalQuarterBadge = memo(function FiscalQuarterBadge({
  date,
  size = 'sm',
  showYear = false,
  glow = true,
  pulse = false,
  className = '',
}: FiscalQuarterBadgeProps) {
  const { quarter, year } = useMemo(() => getQuarterFromDate(date), [date]);
  const theme = quarterThemes[quarter];
  const sizeStyle = sizeStyles[size];
  
  const label = showYear ? `${quarter} '${String(year).slice(-2)}` : quarter;
  
  return (
    <span
      className={`fiscal-quarter-badge fiscal-quarter-${quarter.toLowerCase()} ${className}`}
      title={`Fiscal ${quarter} ${year}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-mono, ui-monospace, monospace)',
        fontWeight: 600,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        cursor: 'default',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        ...sizeStyle,
      }}
    >
      {/* Background layer */}
      <span
        className="quarter-bg"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: `var(--quarter-bg, ${theme.bg})`,
          border: '1px solid transparent',
          backgroundImage: `var(--quarter-gradient, ${theme.gradient})`,
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
          opacity: 0.2,
          transition: 'opacity 0.2s ease',
        }}
      />
      
      {/* Shimmer effect on hover */}
      <span
        className="quarter-shimmer"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
          transform: 'translateX(-100%)',
          transition: 'transform 0.5s ease',
          pointerEvents: 'none',
        }}
      />
      
      {/* Text with gradient */}
      <span
        className="quarter-text"
        style={{
          position: 'relative',
          zIndex: 1,
          background: `var(--quarter-gradient, ${theme.gradient})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {label}
      </span>
      
      <style jsx>{`
        .fiscal-quarter-badge:hover .quarter-shimmer {
          transform: translateX(100%);
        }
        
        .fiscal-quarter-badge:hover .quarter-bg {
          opacity: 0.35;
        }
        
        .fiscal-quarter-badge:hover {
          transform: scale(1.05);
          ${glow ? `box-shadow: 0 0 12px var(--quarter-glow, ${theme.glow}), 0 0 4px var(--quarter-glow, ${theme.glow});` : ''}
        }
        
        ${pulse ? `
        .fiscal-quarter-badge::after {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: inherit;
          background: var(--quarter-gradient, ${theme.gradient});
          opacity: 0;
          z-index: -1;
          animation: quarterPulse 2s ease-in-out infinite;
        }
        
        @keyframes quarterPulse {
          0%, 100% { opacity: 0; transform: scale(1); }
          50% { opacity: 0.15; transform: scale(1.1); }
        }
        ` : ''}
        
        /* Dark mode overrides */
        @media (prefers-color-scheme: dark) {
          .fiscal-quarter-badge {
            --quarter-gradient: ${theme.gradientDark};
            --quarter-glow: ${theme.glowDark};
            --quarter-bg: ${theme.bgDark};
          }
        }
        
        :global(.dark) .fiscal-quarter-badge {
          --quarter-gradient: ${theme.gradientDark};
          --quarter-glow: ${theme.glowDark};
          --quarter-bg: ${theme.bgDark};
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .fiscal-quarter-badge,
          .fiscal-quarter-badge .quarter-shimmer,
          .fiscal-quarter-badge::after {
            animation: none;
            transition: none;
          }
          
          .fiscal-quarter-badge:hover .quarter-shimmer {
            transform: none;
          }
        }
      `}</style>
    </span>
  );
});

/**
 * Compact variant - just shows the quarter number with a colored dot
 */
export const FiscalQuarterDot = memo(function FiscalQuarterDot({
  date,
  size = 'sm',
  className = '',
}: Pick<FiscalQuarterBadgeProps, 'date' | 'size' | 'className'>) {
  const { quarter, year } = useMemo(() => getQuarterFromDate(date), [date]);
  const theme = quarterThemes[quarter];
  
  const dotSize = size === 'xs' ? 6 : size === 'sm' ? 8 : 10;
  
  return (
    <span
      className={`fiscal-quarter-dot ${className}`}
      title={`${quarter} ${year}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      <span
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          background: theme.gradient,
          boxShadow: `0 0 6px ${theme.glow}`,
        }}
      />
      <span
        style={{
          fontSize: size === 'xs' ? '9px' : size === 'sm' ? '10px' : '11px',
          fontWeight: 600,
          fontFamily: 'var(--font-mono, ui-monospace, monospace)',
          color: 'var(--text-secondary, #6b7280)',
        }}
      >
        {quarter.slice(1)}
      </span>
      
      <style jsx>{`
        @media (prefers-color-scheme: dark) {
          .fiscal-quarter-dot span:last-child {
            color: var(--text-secondary-dark, #9ca3af);
          }
        }
        :global(.dark) .fiscal-quarter-dot span:last-child {
          color: var(--text-secondary-dark, #9ca3af);
        }
      `}</style>
    </span>
  );
});

/**
 * Get quarter color for external use
 */
export function getQuarterColor(date: string): string {
  const { quarter } = getQuarterFromDate(date);
  return quarterThemes[quarter].gradient;
}

export default FiscalQuarterBadge;
