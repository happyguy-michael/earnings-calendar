'use client';

import { useMemo, useState, useEffect, memo } from 'react';

/**
 * ReactionAnalysis - Market reaction vs earnings surprise insight
 * 
 * Compares the earnings surprise to the stock's price move, revealing
 * whether the market's reaction was expected, exaggerated, or contrary.
 * This is genuine alpha for traders - understanding market sentiment.
 * 
 * Reaction Types:
 * - "In Line" - price move roughly matches surprise magnitude
 * - "Overreaction" - price moved more than surprise justified
 * - "Underreaction" - price moved less (possibly priced in)
 * - "Contrary" - stock moved opposite to surprise direction
 * - "Sell the News" - beat estimates but stock dropped
 * - "Buy the Dip" - missed estimates but stock rose
 * 
 * Features:
 * - Color-coded insight badges
 * - Tooltip with full explanation
 * - Animated entrance
 * - Respects prefers-reduced-motion
 * - Light/dark mode support
 * 
 * 2026 Design Trend: Insight-first micro-copy that educates while informing
 */

type ReactionType = 
  | 'in-line'
  | 'overreaction'
  | 'underreaction'
  | 'sell-the-news'
  | 'buy-the-dip'
  | 'contrary-bull'
  | 'contrary-bear';

interface ReactionConfig {
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  lightBgColor: string;
  lightTextColor: string;
  lightBorderColor: string;
}

const REACTION_CONFIG: Record<ReactionType, ReactionConfig> = {
  'in-line': {
    label: 'In Line',
    shortLabel: '≈',
    description: 'Market reaction matched expectations based on earnings',
    icon: '⚖️',
    bgColor: 'rgba(113, 113, 122, 0.15)',
    textColor: '#a1a1aa',
    borderColor: 'rgba(113, 113, 122, 0.25)',
    lightBgColor: 'rgba(113, 113, 122, 0.1)',
    lightTextColor: '#71717a',
    lightBorderColor: 'rgba(113, 113, 122, 0.2)',
  },
  'overreaction': {
    label: 'Overreaction',
    shortLabel: '⬆️⬆️',
    description: 'Stock moved more than surprise would justify - possible momentum play',
    icon: '🚀',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    textColor: '#60a5fa',
    borderColor: 'rgba(59, 130, 246, 0.25)',
    lightBgColor: 'rgba(59, 130, 246, 0.1)',
    lightTextColor: '#3b82f6',
    lightBorderColor: 'rgba(59, 130, 246, 0.2)',
  },
  'underreaction': {
    label: 'Priced In',
    shortLabel: '📊',
    description: 'Stock moved less than expected - surprise was already anticipated',
    icon: '📊',
    bgColor: 'rgba(234, 179, 8, 0.15)',
    textColor: '#facc15',
    borderColor: 'rgba(234, 179, 8, 0.25)',
    lightBgColor: 'rgba(234, 179, 8, 0.1)',
    lightTextColor: '#ca8a04',
    lightBorderColor: 'rgba(234, 179, 8, 0.2)',
  },
  'sell-the-news': {
    label: 'Sell the News',
    shortLabel: '📰↓',
    description: 'Beat estimates but stock dropped - classic "buy rumor, sell news"',
    icon: '📰',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    textColor: '#f87171',
    borderColor: 'rgba(239, 68, 68, 0.25)',
    lightBgColor: 'rgba(239, 68, 68, 0.1)',
    lightTextColor: '#dc2626',
    lightBorderColor: 'rgba(239, 68, 68, 0.2)',
  },
  'buy-the-dip': {
    label: 'Buy the Dip',
    shortLabel: '🛒↑',
    description: 'Missed estimates but stock rose - market sees opportunity',
    icon: '🛒',
    bgColor: 'rgba(34, 197, 94, 0.15)',
    textColor: '#4ade80',
    borderColor: 'rgba(34, 197, 94, 0.25)',
    lightBgColor: 'rgba(34, 197, 94, 0.1)',
    lightTextColor: '#16a34a',
    lightBorderColor: 'rgba(34, 197, 94, 0.2)',
  },
  'contrary-bull': {
    label: 'Contrarian',
    shortLabel: '🔄↑',
    description: 'Stock rose despite miss - contrarian bullish sentiment',
    icon: '🐂',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    textColor: '#34d399',
    borderColor: 'rgba(16, 185, 129, 0.25)',
    lightBgColor: 'rgba(16, 185, 129, 0.1)',
    lightTextColor: '#059669',
    lightBorderColor: 'rgba(16, 185, 129, 0.2)',
  },
  'contrary-bear': {
    label: 'Contrarian',
    shortLabel: '🔄↓',
    description: 'Stock dropped despite beat - contrarian bearish sentiment',
    icon: '🐻',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    textColor: '#f87171',
    borderColor: 'rgba(239, 68, 68, 0.25)',
    lightBgColor: 'rgba(239, 68, 68, 0.1)',
    lightTextColor: '#dc2626',
    lightBorderColor: 'rgba(239, 68, 68, 0.2)',
  },
};

/**
 * Analyze the relationship between earnings surprise and price move
 */
function analyzeReaction(
  surprise: number,
  priceMove: number,
  result: 'beat' | 'miss' | 'met'
): ReactionType | null {
  // Need meaningful data
  if (Math.abs(surprise) < 0.5) return null;
  
  const surpriseIsPositive = surprise > 0;
  const moveIsPositive = priceMove > 0;
  const moveToSurpriseRatio = Math.abs(priceMove) / Math.abs(surprise);
  
  // Contrary reactions (opposite directions)
  if (surpriseIsPositive !== moveIsPositive) {
    if (result === 'beat' && priceMove < -1) {
      return 'sell-the-news';
    }
    if (result === 'miss' && priceMove > 1) {
      return 'buy-the-dip';
    }
    return moveIsPositive ? 'contrary-bull' : 'contrary-bear';
  }
  
  // Same direction - check magnitude
  if (moveToSurpriseRatio > 2) {
    return 'overreaction';
  }
  if (moveToSurpriseRatio < 0.3 && Math.abs(surprise) > 3) {
    return 'underreaction';
  }
  
  // In line reaction
  return 'in-line';
}

interface ReactionAnalysisBadgeProps {
  /** Earnings surprise percentage (e.g., 5 = +5% beat) */
  surprise: number;
  /** Stock price move after earnings */
  priceMove: number;
  /** Earnings result */
  result: 'beat' | 'miss' | 'met';
  /** Size variant */
  size?: 'xs' | 'sm' | 'md';
  /** Animation delay in ms */
  delay?: number;
  /** Show icon */
  showIcon?: boolean;
  /** Compact mode - just icon + label */
  compact?: boolean;
  /** Additional class name */
  className?: string;
}

const sizeConfig = {
  xs: { padding: 'px-1 py-0.5', text: 'text-[9px]', iconSize: 10, gap: 'gap-0.5' },
  sm: { padding: 'px-1.5 py-0.5', text: 'text-[10px]', iconSize: 12, gap: 'gap-1' },
  md: { padding: 'px-2 py-1', text: 'text-xs', iconSize: 14, gap: 'gap-1.5' },
};

function ReactionAnalysisBadgeInner({
  surprise,
  priceMove,
  result,
  size = 'sm',
  delay = 0,
  showIcon = true,
  compact = false,
  className = '',
}: ReactionAnalysisBadgeProps) {
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

  const reactionType = useMemo(
    () => analyzeReaction(surprise, priceMove, result),
    [surprise, priceMove, result]
  );

  // Don't render if no meaningful reaction detected
  if (!reactionType || reactionType === 'in-line') return null;

  const config = REACTION_CONFIG[reactionType];
  const { padding, text, gap } = sizeConfig[size];

  return (
    <span
      className={`
        reaction-analysis-badge
        inline-flex items-center ${gap}
        ${padding} ${text}
        font-medium tracking-tight
        rounded-full
        border
        ${!isVisible ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}
        transition-all duration-300
        ${className}
      `}
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
        borderColor: config.borderColor,
        transitionDelay: prefersReducedMotion ? '0ms' : `${delay}ms`,
      }}
      title={config.description}
    >
      {showIcon && (
        <span className="reaction-icon" aria-hidden="true">
          {config.icon}
        </span>
      )}
      <span className="reaction-label uppercase font-semibold tracking-wider">
        {compact ? config.shortLabel : config.label}
      </span>
    </span>
  );
}

export const ReactionAnalysisBadge = memo(ReactionAnalysisBadgeInner);

/**
 * ReactionAnalysisCompact - Minimal inline version (icon only with tooltip)
 */
export function ReactionAnalysisCompact({
  surprise,
  priceMove,
  result,
  className = '',
}: {
  surprise: number;
  priceMove: number;
  result: 'beat' | 'miss' | 'met';
  className?: string;
}) {
  const reactionType = analyzeReaction(surprise, priceMove, result);

  if (!reactionType || reactionType === 'in-line') return null;

  const config = REACTION_CONFIG[reactionType];

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
 * ReactionAnalysisTooltip - Full tooltip with explanation
 */
export function ReactionAnalysisTooltip({
  surprise,
  priceMove,
  result,
  className = '',
}: {
  surprise: number;
  priceMove: number;
  result: 'beat' | 'miss' | 'met';
  className?: string;
}) {
  const reactionType = analyzeReaction(surprise, priceMove, result);

  if (!reactionType) return null;

  const config = REACTION_CONFIG[reactionType];
  const surpriseStr = surprise >= 0 ? `+${surprise.toFixed(1)}%` : `${surprise.toFixed(1)}%`;
  const moveStr = priceMove >= 0 ? `+${priceMove.toFixed(1)}%` : `${priceMove.toFixed(1)}%`;

  return (
    <div
      className={`
        reaction-tooltip
        p-2 rounded-lg
        bg-zinc-800/95 backdrop-blur-sm
        border border-zinc-700
        text-xs
        light:bg-white/95 light:border-zinc-200
        ${className}
      `}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{config.icon}</span>
        <span 
          className="font-semibold uppercase tracking-wide"
          style={{ color: config.textColor }}
        >
          {config.label}
        </span>
      </div>
      <p className="text-zinc-400 light:text-zinc-600 text-[11px] leading-snug mb-2">
        {config.description}
      </p>
      <div className="flex items-center gap-3 text-[10px] text-zinc-500 light:text-zinc-500">
        <span>
          Surprise: <span className={surprise >= 0 ? 'text-emerald-400' : 'text-red-400'}>{surpriseStr}</span>
        </span>
        <span>
          Move: <span className={priceMove >= 0 ? 'text-emerald-400' : 'text-red-400'}>{moveStr}</span>
        </span>
      </div>
    </div>
  );
}

/**
 * Hook to analyze market reaction
 */
export function useReactionAnalysis(
  surprise: number,
  priceMove: number,
  result: 'beat' | 'miss' | 'met'
) {
  return useMemo(() => {
    const type = analyzeReaction(surprise, priceMove, result);
    return type ? REACTION_CONFIG[type] : null;
  }, [surprise, priceMove, result]);
}

export default ReactionAnalysisBadge;
