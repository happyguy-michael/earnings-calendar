'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

/**
 * EmptyStateInsight - Rotating market insights for empty calendar days
 * 
 * Transforms empty "No reports" states into engaging micro-learning moments.
 * Shows rotating tips, quotes, and facts about earnings and investing.
 * 
 * Features:
 * - Categorized insights (tips, quotes, facts, fun)
 * - Smooth fade transition between insights
 * - Category icon indicator
 * - Click to cycle through insights
 * - Auto-rotate with configurable interval
 * - Accessibility: respects reduced motion
 */

type InsightCategory = 'tip' | 'quote' | 'fact' | 'fun';

interface Insight {
  category: InsightCategory;
  text: string;
  source?: string;
}

const INSIGHTS: Insight[] = [
  // Tips
  { category: 'tip', text: 'Earnings typically move stocks 3-8% on average' },
  { category: 'tip', text: 'Pre-market reports often see larger moves' },
  { category: 'tip', text: 'Guidance matters more than the beat/miss' },
  { category: 'tip', text: 'Watch for whisper numbers, not just estimates' },
  { category: 'tip', text: 'IV crush happens right after earnings' },
  { category: 'tip', text: 'Revenue trends often matter more than EPS' },
  { category: 'tip', text: 'Compare to same quarter last year' },
  { category: 'tip', text: 'Management tone in calls moves markets' },
  
  // Quotes
  { category: 'quote', text: 'Be fearful when others are greedy', source: 'Warren Buffett' },
  { category: 'quote', text: 'Price is what you pay. Value is what you get', source: 'Warren Buffett' },
  { category: 'quote', text: 'The market can stay irrational longer than you can stay solvent', source: 'John Maynard Keynes' },
  { category: 'quote', text: 'In investing, what is comfortable is rarely profitable', source: 'Robert Arnott' },
  { category: 'quote', text: 'Time in the market beats timing the market' },
  { category: 'quote', text: 'Know what you own and why you own it', source: 'Peter Lynch' },
  { category: 'quote', text: 'The stock market is a device for transferring money from the impatient to the patient', source: 'Warren Buffett' },
  { category: 'quote', text: "Risk comes from not knowing what you're doing", source: 'Warren Buffett' },
  
  // Facts
  { category: 'fact', text: '~13% of stocks beat estimates each quarter' },
  { category: 'fact', text: 'Earnings season spans ~6 weeks each quarter' },
  { category: 'fact', text: 'The S&P 500 has ~500 earnings reports per quarter' },
  { category: 'fact', text: 'Big banks kick off earnings season' },
  { category: 'fact', text: 'Apple is often the last mega-cap to report' },
  { category: 'fact', text: 'Most companies report within 45 days of quarter end' },
  { category: 'fact', text: 'Tuesday-Thursday are the busiest earnings days' },
  { category: 'fact', text: 'January, April, July, October = peak earnings months' },
  
  // Fun
  { category: 'fun', text: '☕ Good time for a coffee break' },
  { category: 'fun', text: '📚 Catch up on some reading' },
  { category: 'fun', text: '🧘 Markets quiet. Take a breath' },
  { category: 'fun', text: '🎯 Research your next investment' },
  { category: 'fun', text: '📊 Review your portfolio' },
  { category: 'fun', text: '🌴 Even wall street takes breaks' },
  { category: 'fun', text: '💤 Rest up for the busy days' },
];

const CATEGORY_CONFIG: Record<InsightCategory, { icon: string; label: string; color: string }> = {
  tip: { icon: '💡', label: 'Tip', color: 'var(--accent-yellow)' },
  quote: { icon: '💬', label: 'Quote', color: 'var(--accent-purple)' },
  fact: { icon: '📈', label: 'Fact', color: 'var(--accent-blue)' },
  fun: { icon: '✨', label: '', color: 'var(--text-muted)' },
};

interface EmptyStateInsightProps {
  /** Auto-rotate interval in ms (0 = disabled) */
  rotateInterval?: number;
  /** Start with a random insight */
  randomStart?: boolean;
  /** Filter to specific categories */
  categories?: InsightCategory[];
  /** Custom class name */
  className?: string;
  /** Compact mode (less padding, smaller text) */
  compact?: boolean;
}

export function EmptyStateInsight({
  rotateInterval = 8000,
  randomStart = true,
  categories,
  className = '',
  compact = false,
}: EmptyStateInsightProps) {
  const filteredInsights = useMemo(() => {
    if (!categories || categories.length === 0) return INSIGHTS;
    return INSIGHTS.filter(i => categories.includes(i.category));
  }, [categories]);

  const getRandomIndex = useCallback(() => {
    return Math.floor(Math.random() * filteredInsights.length);
  }, [filteredInsights.length]);

  const [index, setIndex] = useState(() => randomStart ? getRandomIndex() : 0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-rotate
  useEffect(() => {
    if (rotateInterval <= 0 || isPaused) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setIndex(prev => (prev + 1) % filteredInsights.length);
        setIsTransitioning(false);
      }, 300);
    }, rotateInterval);

    return () => clearInterval(interval);
  }, [rotateInterval, filteredInsights.length, isPaused]);

  // Click to advance
  const handleClick = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIndex(prev => (prev + 1) % filteredInsights.length);
      setIsTransitioning(false);
    }, 200);
  }, [filteredInsights.length]);

  const currentInsight = filteredInsights[index];
  const config = CATEGORY_CONFIG[currentInsight.category];

  // Check for reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`empty-insight ${compact ? 'empty-insight-compact' : ''} ${className}`}
      onClick={handleClick}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`Market insight: ${currentInsight.text}${currentInsight.source ? ` - ${currentInsight.source}` : ''}. Click for next insight.`}
    >
      {/* Category indicator */}
      <div className="empty-insight-category" style={{ color: config.color }}>
        <span className="empty-insight-icon">{config.icon}</span>
        {config.label && <span className="empty-insight-label">{config.label}</span>}
      </div>

      {/* Insight text with transition */}
      <div 
        className={`empty-insight-content ${isTransitioning && !prefersReducedMotion ? 'transitioning' : ''}`}
      >
        <p className="empty-insight-text">
          {currentInsight.category === 'quote' ? '"' : ''}
          {currentInsight.text}
          {currentInsight.category === 'quote' ? '"' : ''}
        </p>
        {currentInsight.source && (
          <span className="empty-insight-source">— {currentInsight.source}</span>
        )}
      </div>

      {/* Progress dots */}
      {!compact && filteredInsights.length > 1 && (
        <div className="empty-insight-dots" aria-hidden="true">
          {filteredInsights.slice(0, Math.min(5, filteredInsights.length)).map((_, i) => (
            <span 
              key={i} 
              className={`empty-insight-dot ${i === index % 5 ? 'active' : ''}`}
            />
          ))}
          {filteredInsights.length > 5 && (
            <span className="empty-insight-dot-more">+{filteredInsights.length - 5}</span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * EmptyStateInsightInline - Minimal inline version for tight spaces
 */
export function EmptyStateInsightInline({ 
  categories,
  className = '' 
}: { 
  categories?: InsightCategory[];
  className?: string;
}) {
  const filteredInsights = useMemo(() => {
    if (!categories || categories.length === 0) return INSIGHTS;
    return INSIGHTS.filter(i => categories.includes(i.category));
  }, [categories]);

  const [index] = useState(() => Math.floor(Math.random() * filteredInsights.length));
  const insight = filteredInsights[index];
  const config = CATEGORY_CONFIG[insight.category];

  return (
    <span className={`empty-insight-inline ${className}`} title="Click for more">
      <span className="empty-insight-inline-icon">{config.icon}</span>
      <span className="empty-insight-inline-text">{insight.text}</span>
    </span>
  );
}

export default EmptyStateInsight;
