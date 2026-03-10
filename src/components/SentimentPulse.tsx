'use client';

import { useMemo, useEffect, useState, useRef } from 'react';
import { Earning } from '@/lib/types';

interface SentimentPulseProps {
  earnings: Earning[];
  date?: Date;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

type SentimentState = 'hot' | 'bullish' | 'neutral' | 'bearish' | 'cold' | 'waiting';

interface SentimentConfig {
  label: string;
  color: string;
  glowColor: string;
  pulseSpeed: number; // ms per beat
  emoji: string;
}

const SENTIMENT_CONFIG: Record<SentimentState, SentimentConfig> = {
  hot: {
    label: 'On Fire',
    color: '#22c55e',
    glowColor: 'rgba(34, 197, 94, 0.5)',
    pulseSpeed: 600,
    emoji: '🔥',
  },
  bullish: {
    label: 'Bullish',
    color: '#4ade80',
    glowColor: 'rgba(74, 222, 128, 0.4)',
    pulseSpeed: 900,
    emoji: '📈',
  },
  neutral: {
    label: 'Mixed',
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    pulseSpeed: 1200,
    emoji: '➡️',
  },
  bearish: {
    label: 'Bearish',
    color: '#f87171',
    glowColor: 'rgba(248, 113, 113, 0.4)',
    pulseSpeed: 1500,
    emoji: '📉',
  },
  cold: {
    label: 'Cold',
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    pulseSpeed: 2000,
    emoji: '❄️',
  },
  waiting: {
    label: 'Waiting',
    color: '#71717a',
    glowColor: 'rgba(113, 113, 122, 0.3)',
    pulseSpeed: 2500,
    emoji: '⏳',
  },
};

/**
 * SentimentPulse - Dynamic heartbeat indicator showing current earnings momentum
 * 
 * Features:
 * - Real-time pulse animation that speeds up with more beats
 * - Color shifts based on beat/miss ratio
 * - Glow intensity increases with confidence
 * - Smooth transitions between sentiment states
 * - ECG-style waveform visualization
 * - Respects prefers-reduced-motion
 * 
 * Inspiration: Heart rate monitors, market sentiment indicators, live trading dashboards
 */
export function SentimentPulse({
  earnings,
  date = new Date(),
  size = 'md',
  showLabel = true,
  className = '',
}: SentimentPulseProps) {
  const [mounted, setMounted] = useState(false);
  const [beatPhase, setBeatPhase] = useState(0);
  const prefersReducedMotion = useRef(false);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }, []);

  // Calculate sentiment from today's earnings
  const sentiment = useMemo(() => {
    const dateStr = date.toISOString().split('T')[0];
    const todayEarnings = earnings.filter(e => e.date === dateStr);
    
    if (todayEarnings.length === 0) {
      return { state: 'waiting' as SentimentState, beats: 0, misses: 0, pending: 0, ratio: 0 };
    }

    const reported = todayEarnings.filter(e => e.result);
    const beats = reported.filter(e => e.result === 'beat').length;
    const misses = reported.filter(e => e.result === 'miss').length;
    const pending = todayEarnings.length - reported.length;

    if (reported.length === 0) {
      return { state: 'waiting' as SentimentState, beats, misses, pending, ratio: 0 };
    }

    const ratio = beats / reported.length;
    
    let state: SentimentState;
    if (ratio >= 0.85) state = 'hot';
    else if (ratio >= 0.65) state = 'bullish';
    else if (ratio >= 0.45) state = 'neutral';
    else if (ratio >= 0.25) state = 'bearish';
    else state = 'cold';

    return { state, beats, misses, pending, ratio };
  }, [earnings, date]);

  const config = SENTIMENT_CONFIG[sentiment.state];

  // Animate pulse
  useEffect(() => {
    if (!mounted || prefersReducedMotion.current || sentiment.state === 'waiting') {
      return;
    }

    let lastTime = 0;
    const animate = (time: number) => {
      if (time - lastTime >= config.pulseSpeed / 4) {
        setBeatPhase(p => (p + 1) % 4);
        lastTime = time;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mounted, sentiment.state, config.pulseSpeed]);

  const sizeClasses = {
    sm: { container: 'h-6', wave: 'h-4 w-12', text: 'text-[10px]' },
    md: { container: 'h-8', wave: 'h-5 w-16', text: 'text-xs' },
    lg: { container: 'h-10', wave: 'h-6 w-20', text: 'text-sm' },
  };

  const s = sizeClasses[size];

  // Generate ECG-style wave path based on beat phase
  const getWavePath = () => {
    const baseY = 12;
    const peakY = beatPhase === 1 ? 2 : beatPhase === 3 ? 6 : 10;
    const dipY = beatPhase === 2 ? 20 : 14;
    
    // ECG-style waveform: flat → spike up → sharp down → flat
    if (sentiment.state === 'waiting') {
      return `M0,${baseY} L48,${baseY}`;
    }
    
    return `M0,${baseY} L12,${baseY} L16,${peakY} L20,${dipY} L24,${baseY} L48,${baseY}`;
  };

  return (
    <div 
      className={`sentiment-pulse inline-flex items-center gap-2 ${s.container} ${className}`}
      role="status"
      aria-label={`Market sentiment: ${config.label}`}
    >
      {/* ECG Wave visualization */}
      <div className={`sentiment-pulse-wave ${s.wave} relative`}>
        {/* Glow background */}
        <div 
          className="sentiment-pulse-glow"
          style={{
            backgroundColor: config.glowColor,
            opacity: beatPhase === 1 ? 0.8 : 0.3,
            transition: `opacity ${config.pulseSpeed / 4}ms ease-out`,
          }}
        />
        
        {/* SVG Wave */}
        <svg 
          viewBox="0 0 48 24" 
          className="w-full h-full relative z-10"
          style={{ filter: `drop-shadow(0 0 4px ${config.glowColor})` }}
        >
          <path
            d={getWavePath()}
            fill="none"
            stroke={config.color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transition: prefersReducedMotion.current 
                ? 'none' 
                : `d ${config.pulseSpeed / 4}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            }}
          />
        </svg>

        {/* Pulse dot */}
        <div 
          className="sentiment-pulse-dot"
          style={{
            backgroundColor: config.color,
            boxShadow: `0 0 ${beatPhase === 1 ? 8 : 4}px ${config.glowColor}`,
            transform: `scale(${beatPhase === 1 ? 1.3 : 1})`,
            transition: `all ${config.pulseSpeed / 4}ms ease-out`,
          }}
        />
      </div>

      {/* Label and stats */}
      {showLabel && (
        <div className="sentiment-pulse-info flex flex-col">
          <span 
            className={`sentiment-pulse-label ${s.text} font-semibold`}
            style={{ color: config.color }}
          >
            <span className="mr-1">{config.emoji}</span>
            {config.label}
          </span>
          {sentiment.beats + sentiment.misses > 0 && (
            <span className={`sentiment-pulse-stats ${s.text} text-zinc-500`}>
              {sentiment.beats}B / {sentiment.misses}M
              {sentiment.pending > 0 && ` · ${sentiment.pending} left`}
            </span>
          )}
        </div>
      )}

      <style jsx>{`
        .sentiment-pulse {
          position: relative;
        }

        .sentiment-pulse-wave {
          border-radius: 6px;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.2);
        }

        :global(html.light) .sentiment-pulse-wave {
          background: rgba(0, 0, 0, 0.05);
        }

        .sentiment-pulse-glow {
          position: absolute;
          inset: 0;
          border-radius: 6px;
          filter: blur(8px);
        }

        .sentiment-pulse-dot {
          position: absolute;
          right: 4px;
          top: 50%;
          transform: translateY(-50%);
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .sentiment-pulse-info {
          line-height: 1.2;
        }

        .sentiment-pulse-label {
          display: flex;
          align-items: center;
          white-space: nowrap;
        }

        .sentiment-pulse-stats {
          font-weight: 400;
        }

        /* Reduced motion: static display */
        @media (prefers-reduced-motion: reduce) {
          .sentiment-pulse-glow {
            opacity: 0.4 !important;
          }
          .sentiment-pulse-dot {
            transform: translateY(-50%) scale(1) !important;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Compact version for tight spaces (e.g., in cards or toolbars)
 */
export function SentimentPulseCompact({
  earnings,
  date,
  className = '',
}: Omit<SentimentPulseProps, 'size' | 'showLabel'>) {
  return (
    <SentimentPulse
      earnings={earnings}
      date={date}
      size="sm"
      showLabel={false}
      className={className}
    />
  );
}

export default SentimentPulse;
