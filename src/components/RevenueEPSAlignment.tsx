'use client';

import { useMemo, useState, useEffect, memo } from 'react';

/**
 * RevenueEPSAlignment - Shows whether revenue and EPS results align
 * 
 * When both revenue and EPS beat or both miss, the earnings quality is clear.
 * But when they diverge, there's a story to tell:
 * - EPS beat + Revenue miss = cost cutting/margin improvement
 * - EPS miss + Revenue beat = margin pressure/investment
 * 
 * This is alpha for traders - understanding earnings quality beyond headlines.
 * 
 * Features:
 * - Compact badge showing alignment status
 * - Tooltip with explanation
 * - Color-coded by alignment type
 * - Animated entrance
 * - Respects prefers-reduced-motion
 * - Light/dark mode support
 * 
 * 2026 Design Trend: Insight-dense micro-badges that surface patterns
 */

type AlignmentType = 
  | 'full-beat'      // Both EPS and revenue beat
  | 'full-miss'      // Both EPS and revenue miss
  | 'margin-focus'   // EPS beat but revenue miss (cost cutting)
  | 'growth-focus'   // Revenue beat but EPS miss (investing in growth)
  | 'unknown';       // Missing data

interface AlignmentConfig {
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  lightBgColor: string;
  lightTextColor: string;
  lightBorderColor: string;
}

const ALIGNMENT_CONFIG: Record<AlignmentType, AlignmentConfig> = {
  'full-beat': {
    label: 'Clean Beat',
    shortLabel: '✓✓',
    icon: '💪',
    description: 'Both EPS and revenue beat estimates - strong quarter',
    bgColor: 'rgba(34, 197, 94, 0.18)',
    textColor: '#4ade80',
    borderColor: 'rgba(34, 197, 94, 0.3)',
    lightBgColor: 'rgba(34, 197, 94, 0.12)',
    lightTextColor: '#16a34a',
    lightBorderColor: 'rgba(34, 197, 94, 0.25)',
  },
  'full-miss': {
    label: 'Clean Miss',
    shortLabel: '✗✗',
    icon: '📉',
    description: 'Both EPS and revenue missed estimates - weak quarter',
    bgColor: 'rgba(239, 68, 68, 0.18)',
    textColor: '#f87171',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    lightBgColor: 'rgba(239, 68, 68, 0.12)',
    lightTextColor: '#dc2626',
    lightBorderColor: 'rgba(239, 68, 68, 0.25)',
  },
  'margin-focus': {
    label: 'Margin Focus',
    shortLabel: '📊',
    icon: '✂️',
    description: 'EPS beat but revenue missed - focus on cost efficiency over growth',
    bgColor: 'rgba(234, 179, 8, 0.18)',
    textColor: '#fbbf24',
    borderColor: 'rgba(234, 179, 8, 0.3)',
    lightBgColor: 'rgba(234, 179, 8, 0.12)',
    lightTextColor: '#ca8a04',
    lightBorderColor: 'rgba(234, 179, 8, 0.25)',
  },
  'growth-focus': {
    label: 'Growth Mode',
    shortLabel: '🚀',
    icon: '📈',
    description: 'Revenue beat but EPS missed - investing in growth over profits',
    bgColor: 'rgba(59, 130, 246, 0.18)',
    textColor: '#60a5fa',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    lightBgColor: 'rgba(59, 130, 246, 0.12)',
    lightTextColor: '#3b82f6',
    lightBorderColor: 'rgba(59, 130, 246, 0.25)',
  },
  'unknown': {
    label: 'Unknown',
    shortLabel: '?',
    icon: '❓',
    description: 'Missing revenue or EPS data',
    bgColor: 'rgba(113, 113, 122, 0.15)',
    textColor: '#a1a1aa',
    borderColor: 'rgba(113, 113, 122, 0.25)',
    lightBgColor: 'rgba(113, 113, 122, 0.1)',
    lightTextColor: '#71717a',
    lightBorderColor: 'rgba(113, 113, 122, 0.2)',
  },
};

/**
 * Analyze alignment between revenue and EPS results
 */
function analyzeAlignment(
  eps?: number | null,
  epsEstimate?: number,
  revenue?: number | null,
  revenueEstimate?: number | null
): AlignmentType {
  // Check for missing data
  if (eps == null || epsEstimate == null || revenue == null || revenueEstimate == null) {
    return 'unknown';
  }
  
  const epsBeat = eps > epsEstimate;
  const epsMiss = eps < epsEstimate;
  const revenueBeat = revenue > revenueEstimate;
  const revenueMiss = revenue < revenueEstimate;
  
  // Both beat
  if (epsBeat && revenueBeat) {
    return 'full-beat';
  }
  
  // Both miss
  if (epsMiss && revenueMiss) {
    return 'full-miss';
  }
  
  // EPS beat, revenue miss (margin/cost focus)
  if (epsBeat && revenueMiss) {
    return 'margin-focus';
  }
  
  // Revenue beat, EPS miss (growth focus)
  if (revenueBeat && epsMiss) {
    return 'growth-focus';
  }
  
  // Met exactly (very rare) - treat as unknown
  return 'unknown';
}

interface RevenueEPSAlignmentProps {
  /** Actual EPS */
  eps?: number | null;
  /** EPS estimate */
  epsEstimate?: number;
  /** Actual revenue (in same units as estimate) */
  revenue?: number | null;
  /** Revenue estimate */
  revenueEstimate?: number | null;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md';
  /** Animation delay in ms */
  delay?: number;
  /** Show icon */
  showIcon?: boolean;
  /** Compact mode - just icon */
  compact?: boolean;
  /** Only show divergence (hide full-beat/full-miss) */
  divergenceOnly?: boolean;
  /** Additional class name */
  className?: string;
}

const sizeConfig = {
  xs: { padding: '2px 4px', text: '9px', iconSize: 10, gap: '2px' },
  sm: { padding: '2px 6px', text: '10px', iconSize: 11, gap: '3px' },
  md: { padding: '3px 8px', text: '11px', iconSize: 12, gap: '4px' },
};

function RevenueEPSAlignmentInner({
  eps,
  epsEstimate,
  revenue,
  revenueEstimate,
  size = 'sm',
  delay = 0,
  showIcon = true,
  compact = false,
  divergenceOnly = false,
  className = '',
}: RevenueEPSAlignmentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);

    const timer = setTimeout(() => setIsVisible(true), delay);

    return () => {
      clearTimeout(timer);
      mq.removeEventListener('change', handler);
    };
  }, [delay]);

  const alignmentType = useMemo(
    () => analyzeAlignment(eps, epsEstimate, revenue, revenueEstimate),
    [eps, epsEstimate, revenue, revenueEstimate]
  );

  // Don't render for unknown or if divergenceOnly and it's a clean beat/miss
  if (alignmentType === 'unknown') return null;
  if (divergenceOnly && (alignmentType === 'full-beat' || alignmentType === 'full-miss')) {
    return null;
  }

  const config = ALIGNMENT_CONFIG[alignmentType];
  const { padding, text, gap } = sizeConfig[size];

  return (
    <span
      className={`
        revenue-eps-alignment
        inline-flex items-center
        font-semibold tracking-wide
        rounded-full
        border
        uppercase
        ${className}
      `}
      style={{
        padding,
        fontSize: text,
        gap,
        backgroundColor: config.bgColor,
        color: config.textColor,
        borderColor: config.borderColor,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scale(1)' : 'scale(0.9)',
        transition: prefersReducedMotion 
          ? 'none' 
          : `opacity 0.3s ease-out ${delay}ms, transform 0.3s var(--spring-snappy) ${delay}ms`,
      }}
      title={config.description}
      role="status"
      aria-label={config.label}
    >
      {showIcon && (
        <span 
          className="alignment-icon" 
          aria-hidden="true"
          style={{ fontSize: sizeConfig[size].iconSize }}
        >
          {config.icon}
        </span>
      )}
      {!compact && (
        <span className="alignment-label">
          {config.label}
        </span>
      )}
    </span>
  );
}

export const RevenueEPSAlignment = memo(RevenueEPSAlignmentInner);

/**
 * RevenueEPSAlignmentCompact - Icon-only version with tooltip
 */
export function RevenueEPSAlignmentCompact({
  eps,
  epsEstimate,
  revenue,
  revenueEstimate,
  className = '',
}: {
  eps?: number | null;
  epsEstimate?: number;
  revenue?: number | null;
  revenueEstimate?: number | null;
  className?: string;
}) {
  const alignmentType = analyzeAlignment(eps, epsEstimate, revenue, revenueEstimate);

  if (alignmentType === 'unknown') return null;

  const config = ALIGNMENT_CONFIG[alignmentType];

  return (
    <span
      className={`
        inline-flex items-center justify-center
        w-4 h-4 rounded-full text-[10px]
        ${className}
      `}
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
      }}
      title={`${config.label}: ${config.description}`}
      aria-label={config.label}
    >
      {config.icon}
    </span>
  );
}

/**
 * RevenueEPSAlignmentExplainer - Full explanation block
 */
export function RevenueEPSAlignmentExplainer({
  eps,
  epsEstimate,
  revenue,
  revenueEstimate,
  className = '',
}: {
  eps?: number | null;
  epsEstimate?: number;
  revenue?: number | null;
  revenueEstimate?: number | null;
  className?: string;
}) {
  const alignmentType = analyzeAlignment(eps, epsEstimate, revenue, revenueEstimate);

  if (alignmentType === 'unknown') return null;

  const config = ALIGNMENT_CONFIG[alignmentType];
  
  // Calculate surprises
  const epsSurprise = eps != null && epsEstimate != null
    ? ((eps - epsEstimate) / Math.abs(epsEstimate)) * 100
    : null;
  const revSurprise = revenue != null && revenueEstimate != null
    ? ((revenue - revenueEstimate) / Math.abs(revenueEstimate)) * 100
    : null;

  return (
    <div
      className={`
        revenue-eps-explainer
        p-3 rounded-lg
        bg-zinc-800/90 backdrop-blur-sm
        border border-zinc-700/50
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{config.icon}</span>
        <span 
          className="font-bold text-sm uppercase tracking-wide"
          style={{ color: config.textColor }}
        >
          {config.label}
        </span>
      </div>
      
      {/* Description */}
      <p className="text-zinc-400 text-xs leading-relaxed mb-3">
        {config.description}
      </p>
      
      {/* Data summary */}
      <div className="flex gap-4 text-[11px]">
        <div>
          <span className="text-zinc-500 block mb-0.5">EPS</span>
          <span className={epsSurprise != null && epsSurprise > 0 ? 'text-emerald-400' : 'text-red-400'}>
            {epsSurprise != null ? (epsSurprise > 0 ? '+' : '') + epsSurprise.toFixed(1) + '%' : '–'}
          </span>
        </div>
        <div>
          <span className="text-zinc-500 block mb-0.5">Revenue</span>
          <span className={revSurprise != null && revSurprise > 0 ? 'text-emerald-400' : 'text-red-400'}>
            {revSurprise != null ? (revSurprise > 0 ? '+' : '') + revSurprise.toFixed(1) + '%' : '–'}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to analyze revenue/EPS alignment
 */
export function useRevenueEPSAlignment(
  eps?: number | null,
  epsEstimate?: number,
  revenue?: number | null,
  revenueEstimate?: number | null
) {
  return useMemo(() => {
    const type = analyzeAlignment(eps, epsEstimate, revenue, revenueEstimate);
    return type !== 'unknown' ? { type, config: ALIGNMENT_CONFIG[type] } : null;
  }, [eps, epsEstimate, revenue, revenueEstimate]);
}

export default RevenueEPSAlignment;
