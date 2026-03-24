'use client';

import { useMemo, useEffect, useState, useRef } from 'react';

/**
 * PredictionConfidenceBand
 * 
 * A sophisticated visualization showing the projected range of beat rates
 * based on pending earnings and their individual beat odds.
 * 
 * Inspiration:
 * - Nate Silver's FiveThirtyEight election forecast needle
 * - Weather forecast confidence bands
 * - Monte Carlo simulation visualizations
 * - 2026 "Probabilistic UI" trend - showing uncertainty, not just point estimates
 * 
 * Features:
 * - Shows current beat rate as solid marker
 * - Shows expected final rate based on odds
 * - Displays 90% confidence interval
 * - Band narrows as more results come in (uncertainty decreases)
 * - Smooth CSS transitions as data changes
 * - Gradient intensity shows probability distribution
 */

interface PendingEarning {
  ticker: string;
  beatOdds?: number; // 0-100
}

interface PredictionConfidenceBandProps {
  currentBeats: number;
  currentTotal: number;
  pendingEarnings: PendingEarning[];
  className?: string;
  showLabels?: boolean;
  compact?: boolean;
}

// Calculate binomial confidence interval using normal approximation
function calculateConfidenceInterval(
  currentBeats: number,
  currentTotal: number,
  pendingEarnings: PendingEarning[],
  confidenceLevel: number = 0.9
): {
  current: number;
  expected: number;
  low: number;
  high: number;
  certainty: number; // 0-1, how narrow the band is
} {
  const pending = pendingEarnings.length;
  const totalFinal = currentTotal + pending;
  
  if (totalFinal === 0) {
    return { current: 0, expected: 0, low: 0, high: 0, certainty: 1 };
  }
  
  // Current beat rate
  const current = currentTotal > 0 ? (currentBeats / currentTotal) * 100 : 0;
  
  // Expected additional beats based on odds
  let expectedAdditionalBeats = 0;
  let variance = 0;
  
  for (const earning of pendingEarnings) {
    const p = (earning.beatOdds ?? 50) / 100; // Default to 50% if no odds
    expectedAdditionalBeats += p;
    variance += p * (1 - p); // Binomial variance for each trial
  }
  
  const expectedTotalBeats = currentBeats + expectedAdditionalBeats;
  const expected = (expectedTotalBeats / totalFinal) * 100;
  
  // Standard deviation of beat rate
  const stdDev = Math.sqrt(variance) / totalFinal * 100;
  
  // Z-score for confidence level (1.645 for 90%)
  const z = 1.645;
  
  // Confidence interval
  const low = Math.max(0, expected - z * stdDev);
  const high = Math.min(100, expected + z * stdDev);
  
  // Certainty: 1 when no pending, decreases with more pending/variance
  const maxPossibleRange = pending > 0 ? (pending / totalFinal) * 100 : 0;
  const actualRange = high - low;
  const certainty = maxPossibleRange > 0 ? Math.max(0, 1 - actualRange / maxPossibleRange) : 1;
  
  return { current, expected, low, high, certainty };
}

// Animated number display using CSS counter
function AnimatedValue({ value, suffix = '%' }: { value: number; suffix?: string }) {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  
  useEffect(() => {
    const duration = 600;
    const start = displayed;
    const diff = value - start;
    const startTime = performance.now();
    
    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(start + diff * eased);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value]);
  
  return <span ref={ref}>{displayed.toFixed(1)}{suffix}</span>;
}

export function PredictionConfidenceBand({
  currentBeats,
  currentTotal,
  pendingEarnings,
  className = '',
  showLabels = true,
  compact = false,
}: PredictionConfidenceBandProps) {
  const { current, expected, low, high, certainty } = useMemo(
    () => calculateConfidenceInterval(currentBeats, currentTotal, pendingEarnings),
    [currentBeats, currentTotal, pendingEarnings]
  );
  
  const [mounted, setMounted] = useState(false);
  const hasPending = pendingEarnings.length > 0;
  const rangeWidth = high - low;
  
  // Mount animation trigger
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);
  
  // Determine status message
  const statusMessage = useMemo(() => {
    if (!hasPending) return 'Final result';
    if (rangeWidth < 3) return 'High confidence';
    if (rangeWidth < 8) return 'Moderate uncertainty';
    return 'Wide range possible';
  }, [hasPending, rangeWidth]);
  
  const statusColor = !hasPending 
    ? 'bg-emerald-500/10 text-emerald-400' 
    : rangeWidth < 5 
      ? 'bg-blue-500/10 text-blue-400'
      : 'bg-amber-500/10 text-amber-400';
  
  // Band opacity based on uncertainty
  const bandOpacity = Math.max(0.15, (1 - certainty) * 0.5);
  
  // Reduced motion check
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  
  if (reducedMotion) {
    // Simplified static version
    return (
      <div className={`${className}`}>
        <div className="relative h-3 bg-zinc-800/50 rounded-full overflow-hidden">
          <div 
            className="absolute h-full bg-emerald-500/30 rounded-full"
            style={{ width: `${current}%` }}
          />
        </div>
        {showLabels && (
          <div className="flex justify-between text-xs text-zinc-500 mt-1">
            <span>Current: {current.toFixed(1)}%</span>
            {hasPending && <span>Expected: {expected.toFixed(1)}%</span>}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className={`prediction-band ${className}`}>
      {/* Header with labels */}
      {showLabels && (
        <div className={`flex items-center justify-between ${compact ? 'mb-1.5' : 'mb-2'}`}>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-zinc-400">Current</span>
            </div>
            {hasPending && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-zinc-400">Projected</span>
              </div>
            )}
          </div>
          
          <div 
            className={`text-xs px-2 py-0.5 rounded-full transition-all duration-300 ${statusColor}`}
            style={{
              transform: mounted ? 'scale(1)' : 'scale(0.9)',
              opacity: mounted ? 1 : 0,
            }}
          >
            {statusMessage}
          </div>
        </div>
      )}
      
      {/* Main visualization */}
      <div className={`relative ${compact ? 'py-3' : 'py-4'}`}>
        {/* Progress track */}
        <div className={`relative w-full ${compact ? 'h-2' : 'h-3'} rounded-full overflow-hidden`}>
          {/* Base track */}
          <div className="absolute inset-0 bg-zinc-800/50 rounded-full" />
          
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-700/20 via-zinc-600/10 to-zinc-700/20 rounded-full" />
          
          {/* Tick marks */}
          <div className="absolute inset-0 flex justify-between px-0.5">
            {[0, 25, 50, 75, 100].map((tick) => (
              <div 
                key={tick}
                className={`w-px ${compact ? 'h-1' : 'h-1.5'} bg-zinc-600/40 self-end mb-0.5`}
              />
            ))}
          </div>
        </div>
        
        {/* Confidence band (only when pending) */}
        {hasPending && (
          <div
            className={`
              absolute top-0 ${compact ? 'h-2' : 'h-3'} rounded-full
              bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20
              transition-all duration-700 ease-out
            `}
            style={{ 
              left: `${mounted ? low : 50}%`, 
              width: `${mounted ? (high - low) : 0}%`,
              opacity: mounted ? bandOpacity : 0,
              transform: `scaleY(${mounted ? 1 : 0})`,
            }}
          >
            {/* Inner glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-amber-300/20 to-transparent" />
          </div>
        )}
        
        {/* Current rate marker */}
        <div
          className="absolute top-0 bottom-0 flex flex-col items-center transition-all duration-500 ease-out"
          style={{ 
            left: `${mounted ? current : 0}%`,
            opacity: mounted ? 1 : 0,
            transform: `scale(${mounted ? 1 : 0.5})`,
          }}
        >
          {/* Marker line */}
          <div className={`
            w-0.5 h-full rounded-full
            bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600
          `} />
          
          {/* Triangle marker */}
          <div
            className={`
              absolute ${compact ? '-bottom-1' : '-bottom-1.5'} 
              ${compact ? 'w-2 h-2' : 'w-2.5 h-2.5'}
              rotate-45 rounded-sm
              bg-emerald-500 shadow-lg shadow-emerald-500/30
              animate-pulse
            `}
            style={{ animationDuration: '2s' }}
          />
          
          {/* Value label */}
          {showLabels && (
            <div
              className={`
                absolute ${compact ? '-top-5' : '-top-6'} 
                ${compact ? 'text-[10px]' : 'text-xs'} 
                font-semibold whitespace-nowrap text-emerald-400
                transition-all duration-300 delay-300
              `}
              style={{
                opacity: mounted ? 1 : 0,
                transform: `translateY(${mounted ? 0 : 5}px)`,
              }}
            >
              <AnimatedValue value={current} />
            </div>
          )}
        </div>
        
        {/* Expected rate marker (only when pending and different from current) */}
        {hasPending && Math.abs(expected - current) > 0.5 && (
          <div
            className="absolute top-0 bottom-0 flex flex-col items-center transition-all duration-500 ease-out delay-100"
            style={{ 
              left: `${mounted ? expected : current}%`,
              opacity: mounted ? 1 : 0,
              transform: `scale(${mounted ? 1 : 0.5})`,
            }}
          >
            {/* Marker line */}
            <div className={`
              w-0.5 h-full rounded-full
              bg-gradient-to-b from-amber-400/80 via-amber-500/80 to-amber-600/80
            `} />
            
            {/* Triangle marker */}
            <div
              className={`
                absolute ${compact ? '-bottom-1' : '-bottom-1.5'} 
                ${compact ? 'w-2 h-2' : 'w-2.5 h-2.5'}
                rotate-45 rounded-sm
                bg-amber-500 shadow-lg shadow-amber-500/30
                animate-pulse
              `}
              style={{ animationDuration: '2s', animationDelay: '0.5s' }}
            />
            
            {/* Value label */}
            {showLabels && (
              <div
                className={`
                  absolute ${compact ? '-top-5' : '-top-6'} 
                  ${compact ? 'text-[10px]' : 'text-xs'} 
                  font-semibold whitespace-nowrap text-amber-400
                  transition-all duration-300 delay-400
                `}
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: `translateY(${mounted ? 0 : 5}px)`,
                }}
              >
                <AnimatedValue value={expected} />
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Range labels */}
      {showLabels && hasPending && (
        <div 
          className="flex justify-between text-[10px] text-zinc-500 -mt-1 transition-opacity duration-500"
          style={{ opacity: mounted ? 1 : 0 }}
        >
          <span>{low.toFixed(1)}%</span>
          <span className="text-zinc-600">90% confidence interval</span>
          <span>{high.toFixed(1)}%</span>
        </div>
      )}
      
      {/* Pending count */}
      {showLabels && (
        <div 
          className={`text-center ${compact ? 'mt-1' : 'mt-2'} transition-opacity duration-500 delay-200`}
          style={{ opacity: mounted ? 1 : 0 }}
        >
          <span className="text-[10px] text-zinc-600">
            {hasPending 
              ? `Based on ${pendingEarnings.length} pending report${pendingEarnings.length > 1 ? 's' : ''}`
              : `All ${currentTotal} reports in`
            }
          </span>
        </div>
      )}
      
      <style jsx>{`
        .prediction-band {
          --band-transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes markerPulse {
          0%, 100% { transform: rotate(45deg) scale(1); }
          50% { transform: rotate(45deg) scale(1.1); }
        }
      `}</style>
    </div>
  );
}

// Compact inline version for stats row
export function PredictionConfidenceBandCompact({
  currentBeats,
  currentTotal,
  pendingEarnings,
  className = '',
}: {
  currentBeats: number;
  currentTotal: number;
  pendingEarnings: PendingEarning[];
  className?: string;
}) {
  return (
    <PredictionConfidenceBand
      currentBeats={currentBeats}
      currentTotal={currentTotal}
      pendingEarnings={pendingEarnings}
      className={className}
      showLabels={false}
      compact={true}
    />
  );
}

// Tooltip-friendly summary
export function usePredictionSummary(
  currentBeats: number,
  currentTotal: number,
  pendingEarnings: PendingEarning[]
): string {
  return useMemo(() => {
    const { current, expected, low, high } = calculateConfidenceInterval(
      currentBeats, currentTotal, pendingEarnings
    );
    
    if (pendingEarnings.length === 0) {
      return `Final beat rate: ${current.toFixed(1)}%`;
    }
    
    return `Current: ${current.toFixed(1)}% → Expected: ${expected.toFixed(1)}% (range: ${low.toFixed(1)}-${high.toFixed(1)}%)`;
  }, [currentBeats, currentTotal, pendingEarnings]);
}

export default PredictionConfidenceBand;
