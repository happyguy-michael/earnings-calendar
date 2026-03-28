'use client';

import { useEffect, useState, useMemo, memo } from 'react';
import { useMotionPreferences } from './MotionPreferences';

/**
 * BeatRatioTint - Sentiment-Aware Ambient Background Tint
 * 
 * 2026 Trend: "Emotional Context Through Color"
 * Subtly shifts the page's ambient background based on beat/miss ratio:
 * - High beat ratio (>70%): Subtle green/bullish tint
 * - Neutral (40-70%): No tint, neutral
 * - Low beat ratio (<40%): Subtle red/bearish tint
 * 
 * This creates subliminal emotional context — you "feel" when it's
 * a good or bad earnings week without consciously processing the data.
 * 
 * Inspiration:
 * - Bloomberg Terminal's mood-aware color schemes
 * - Trading floor ambient lighting systems
 * - Apple's adaptive UI that responds to content
 * - 2026 "Living Interfaces" trend — UIs that breathe with data
 * 
 * Features:
 * - Extremely subtle effect (barely noticeable, felt subconsciously)
 * - Smooth 2s transitions between states
 * - Respects prefers-reduced-motion
 * - Light mode support with adapted colors
 * - Only activates when enough data (3+ reported earnings)
 * - Transitions gracefully when week changes
 * 
 * @example
 * <BeatRatioTint beats={8} total={10} /> // Bullish tint
 * <BeatRatioTint beats={2} total={10} /> // Bearish tint
 * <BeatRatioTint beats={5} total={10} /> // Neutral
 */

type Sentiment = 'bullish' | 'neutral' | 'bearish' | 'insufficient';

interface BeatRatioTintProps {
  /** Number of beats in current view */
  beats: number;
  /** Total reported earnings (beats + misses) */
  total: number;
  /** Minimum reported earnings to activate tint */
  minSampleSize?: number;
  /** Base opacity of the tint (0-1) */
  intensity?: number;
  /** Enable animated gradient movement */
  animated?: boolean;
  /** Z-index for stacking */
  zIndex?: number;
  /** Additional className */
  className?: string;
}

interface SentimentConfig {
  sentiment: Sentiment;
  color: string;
  opacity: number;
  label: string;
}

// Sentiment thresholds
const BULLISH_THRESHOLD = 0.7;  // 70%+ beats = bullish
const BEARISH_THRESHOLD = 0.4;  // <40% beats = bearish

// Get sentiment configuration based on beat ratio
function getSentimentConfig(
  beats: number,
  total: number,
  minSample: number,
  baseIntensity: number
): SentimentConfig {
  // Not enough data
  if (total < minSample) {
    return {
      sentiment: 'insufficient',
      color: 'transparent',
      opacity: 0,
      label: 'Awaiting data',
    };
  }

  const ratio = beats / total;

  if (ratio >= BULLISH_THRESHOLD) {
    // Bullish: Scale intensity with how bullish (70% = mild, 90%+ = strong)
    const bullishStrength = (ratio - BULLISH_THRESHOLD) / (1 - BULLISH_THRESHOLD);
    return {
      sentiment: 'bullish',
      color: 'rgba(34, 197, 94, VAR_OPACITY)', // green-500
      opacity: baseIntensity * (0.5 + bullishStrength * 0.5),
      label: `Bullish (${Math.round(ratio * 100)}% beat rate)`,
    };
  }

  if (ratio < BEARISH_THRESHOLD) {
    // Bearish: Scale intensity with how bearish (40% = mild, <20% = strong)
    const bearishStrength = (BEARISH_THRESHOLD - ratio) / BEARISH_THRESHOLD;
    return {
      sentiment: 'bearish',
      color: 'rgba(239, 68, 68, VAR_OPACITY)', // red-500
      opacity: baseIntensity * (0.5 + bearishStrength * 0.5),
      label: `Bearish (${Math.round(ratio * 100)}% beat rate)`,
    };
  }

  // Neutral
  return {
    sentiment: 'neutral',
    color: 'transparent',
    opacity: 0,
    label: `Neutral (${Math.round(ratio * 100)}% beat rate)`,
  };
}

function BeatRatioTintComponent({
  beats,
  total,
  minSampleSize = 3,
  intensity = 0.04, // Very subtle by default
  animated = true,
  zIndex = -1,
  className = '',
}: BeatRatioTintProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { shouldAnimate } = useMotionPreferences();

  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Delayed entrance for smooth page load
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const config = useMemo(
    () => getSentimentConfig(beats, total, minSampleSize, intensity),
    [beats, total, minSampleSize, intensity]
  );

  const shouldAnimateGradient = animated && shouldAnimate('decorative') && !prefersReducedMotion;

  // Replace opacity placeholder in color string
  const colorWithOpacity = config.color.replace('VAR_OPACITY', String(config.opacity));

  // Don't render if insufficient data or neutral
  if (config.sentiment === 'insufficient' || config.sentiment === 'neutral') {
    return null;
  }

  return (
    <>
      <div
        className={`beat-ratio-tint beat-ratio-tint--${config.sentiment} ${className}`}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex,
          pointerEvents: 'none',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 2s ease-out',
        }}
        role="presentation"
        aria-hidden="true"
        title={config.label}
      >
        {/* Gradient orbs for organic feel */}
        <div className="beat-ratio-tint__orb beat-ratio-tint__orb--1" />
        <div className="beat-ratio-tint__orb beat-ratio-tint__orb--2" />
      </div>

      <style jsx>{`
        .beat-ratio-tint {
          overflow: hidden;
        }

        .beat-ratio-tint__orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          transition: background-color 2s ease-out, opacity 2s ease-out;
        }

        /* Bullish orbs - green tones */
        .beat-ratio-tint--bullish .beat-ratio-tint__orb--1 {
          top: -20%;
          left: -10%;
          width: 60%;
          height: 50%;
          background: ${colorWithOpacity};
          opacity: 0.8;
        }

        .beat-ratio-tint--bullish .beat-ratio-tint__orb--2 {
          bottom: -30%;
          right: -15%;
          width: 50%;
          height: 60%;
          background: ${colorWithOpacity.replace('34, 197, 94', '16, 185, 129')}; /* emerald */
          opacity: 0.5;
        }

        /* Bearish orbs - red tones */
        .beat-ratio-tint--bearish .beat-ratio-tint__orb--1 {
          top: -20%;
          right: -10%;
          width: 60%;
          height: 50%;
          background: ${colorWithOpacity};
          opacity: 0.8;
        }

        .beat-ratio-tint--bearish .beat-ratio-tint__orb--2 {
          bottom: -30%;
          left: -15%;
          width: 50%;
          height: 60%;
          background: ${colorWithOpacity.replace('239, 68, 68', '220, 38, 38')}; /* red-600 */
          opacity: 0.5;
        }

        /* Animated drift for organic feel */
        ${shouldAnimateGradient ? `
          .beat-ratio-tint__orb--1 {
            animation: beat-tint-drift-1 20s ease-in-out infinite;
          }

          .beat-ratio-tint__orb--2 {
            animation: beat-tint-drift-2 25s ease-in-out infinite;
          }

          @keyframes beat-tint-drift-1 {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            50% {
              transform: translate(5%, 3%) scale(1.05);
            }
          }

          @keyframes beat-tint-drift-2 {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            50% {
              transform: translate(-3%, -5%) scale(0.95);
            }
          }
        ` : ''}

        /* Light mode: even more subtle */
        :global(.light) .beat-ratio-tint__orb {
          opacity: 0.4;
          filter: blur(150px);
        }

        /* Reduced motion: no animation */
        @media (prefers-reduced-motion: reduce) {
          .beat-ratio-tint__orb {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}

export const BeatRatioTint = memo(BeatRatioTintComponent);

/**
 * useBeatRatioSentiment - Hook to calculate sentiment from earnings data
 * 
 * @example
 * const sentiment = useBeatRatioSentiment(weekEarnings);
 * // { sentiment: 'bullish', ratio: 0.85, beats: 17, misses: 3 }
 */
export function useBeatRatioSentiment(
  earnings: Array<{ result?: 'beat' | 'miss' | 'pending' }>
): {
  sentiment: Sentiment;
  ratio: number;
  beats: number;
  misses: number;
  total: number;
} {
  return useMemo(() => {
    const reported = earnings.filter(e => e.result === 'beat' || e.result === 'miss');
    const beats = reported.filter(e => e.result === 'beat').length;
    const misses = reported.filter(e => e.result === 'miss').length;
    const total = beats + misses;
    const ratio = total > 0 ? beats / total : 0.5;

    let sentiment: Sentiment = 'neutral';
    if (total < 3) {
      sentiment = 'insufficient';
    } else if (ratio >= BULLISH_THRESHOLD) {
      sentiment = 'bullish';
    } else if (ratio < BEARISH_THRESHOLD) {
      sentiment = 'bearish';
    }

    return { sentiment, ratio, beats, misses, total };
  }, [earnings]);
}

export default BeatRatioTint;
