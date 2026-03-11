'use client';

import { useMemo, useEffect, useState, useRef } from 'react';
import { Earning } from '@/lib/types';
import { CountUp } from './CountUp';

interface WeekSummaryCardProps {
  weekStart: Date;
  earnings: Earning[];
  isCurrentWeek?: boolean;
  className?: string;
}

/**
 * WeekSummaryCard - Celebratory end-of-week summary
 * 
 * Features:
 * - Glassmorphism card design
 * - Animated stat counters
 * - Mood emoji based on beat rate
 * - Biggest surprise highlight
 * - Smooth entrance animation
 * - Respects prefers-reduced-motion
 */
export function WeekSummaryCard({ 
  weekStart, 
  earnings, 
  isCurrentWeek = false,
  className = '' 
}: WeekSummaryCardProps) {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    
    // Intersection observer for entrance animation
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );
    
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  const stats = useMemo(() => {
    // Filter earnings for this week
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    const weekEarnings = earnings.filter(e => {
      const date = new Date(e.date);
      return date >= weekStart && date <= weekEnd;
    });
    
    const total = weekEarnings.length;
    const reported = weekEarnings.filter(e => e.eps !== undefined && e.eps !== null);
    const beats = reported.filter(e => e.result === 'beat');
    const misses = reported.filter(e => e.result === 'miss');
    const pending = total - reported.length;
    
    const beatRate = reported.length > 0 
      ? Math.round((beats.length / reported.length) * 100) 
      : 0;
    
    // Find biggest surprise (positive)
    const biggestBeat = reported
      .filter(e => e.result === 'beat' && e.eps && e.estimate)
      .sort((a, b) => {
        const aSurprise = ((a.eps! - a.estimate) / a.estimate) * 100;
        const bSurprise = ((b.eps! - b.estimate) / b.estimate) * 100;
        return bSurprise - aSurprise;
      })[0];
    
    // Find biggest disappointment (negative)
    const biggestMiss = reported
      .filter(e => e.result === 'miss' && e.eps && e.estimate)
      .sort((a, b) => {
        const aSurprise = ((a.eps! - a.estimate) / a.estimate) * 100;
        const bSurprise = ((b.eps! - b.estimate) / b.estimate) * 100;
        return aSurprise - bSurprise;
      })[0];
    
    // Mood based on beat rate
    let mood: { emoji: string; label: string; color: string };
    if (reported.length === 0) {
      mood = { emoji: '⏳', label: 'Pending', color: 'var(--text-muted)' };
    } else if (beatRate >= 80) {
      mood = { emoji: '🔥', label: 'Hot Week', color: 'var(--success)' };
    } else if (beatRate >= 65) {
      mood = { emoji: '📈', label: 'Strong', color: 'var(--success)' };
    } else if (beatRate >= 50) {
      mood = { emoji: '➡️', label: 'Mixed', color: 'var(--warning)' };
    } else if (beatRate >= 35) {
      mood = { emoji: '📉', label: 'Soft', color: 'var(--warning)' };
    } else {
      mood = { emoji: '❄️', label: 'Cold Week', color: 'var(--danger)' };
    }
    
    return {
      total,
      reported: reported.length,
      beats: beats.length,
      misses: misses.length,
      pending,
      beatRate,
      biggestBeat,
      biggestMiss,
      mood,
    };
  }, [weekStart, earnings]);

  // Don't render if no earnings this week
  if (stats.total === 0) {
    return null;
  }

  // Format week range
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 4); // Fri
  const formatShort = (d: Date) => 
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const weekRange = `${formatShort(weekStart)} – ${formatShort(weekEnd)}`;

  const getSurprisePercent = (e: Earning) => {
    if (!e.eps || !e.estimate) return 0;
    return ((e.eps - e.estimate) / e.estimate) * 100;
  };

  return (
    <div 
      ref={cardRef}
      className={`week-summary-card ${mounted ? 'mounted' : ''} ${isVisible ? 'visible' : ''} ${isCurrentWeek ? 'current' : ''} ${className}`}
    >
      {/* Background gradient orbs */}
      <div className="week-summary-orbs" aria-hidden="true">
        <span className="week-summary-orb orb-1" />
        <span className="week-summary-orb orb-2" />
      </div>
      
      {/* Header */}
      <div className="week-summary-header">
        <div className="week-summary-mood">
          <span className="week-summary-emoji" role="img" aria-label={stats.mood.label}>
            {stats.mood.emoji}
          </span>
          <span className="week-summary-mood-label" style={{ color: stats.mood.color }}>
            {stats.mood.label}
          </span>
        </div>
        <div className="week-summary-range">{weekRange}</div>
      </div>
      
      {/* Stats grid - numbers animate when card scrolls into view */}
      <div className="week-summary-stats">
        <div className="week-summary-stat">
          <span className="week-summary-stat-value">
            {isVisible ? <CountUp end={stats.reported} duration={600} /> : '0'}
          </span>
          <span className="week-summary-stat-label">Reported</span>
        </div>
        <div className="week-summary-stat beat">
          <span className="week-summary-stat-value">
            {isVisible ? <CountUp end={stats.beats} duration={700} /> : '0'}
          </span>
          <span className="week-summary-stat-label">Beats</span>
        </div>
        <div className="week-summary-stat miss">
          <span className="week-summary-stat-value">
            {isVisible ? <CountUp end={stats.misses} duration={700} /> : '0'}
          </span>
          <span className="week-summary-stat-label">Misses</span>
        </div>
        {stats.pending > 0 && (
          <div className="week-summary-stat pending">
            <span className="week-summary-stat-value">
              {isVisible ? <CountUp end={stats.pending} duration={600} /> : '0'}
            </span>
            <span className="week-summary-stat-label">Pending</span>
          </div>
        )}
      </div>
      
      {/* Beat rate bar - animated fill and percentage */}
      {stats.reported > 0 && (
        <div className="week-summary-bar-container">
          <div className="week-summary-bar">
            <div 
              className="week-summary-bar-fill"
              style={{ 
                width: isVisible ? `${stats.beatRate}%` : '0%',
                backgroundColor: stats.mood.color,
                transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </div>
          <span className="week-summary-bar-label">
            {isVisible ? <CountUp end={stats.beatRate} duration={800} suffix="%" /> : '0%'} beat rate
          </span>
        </div>
      )}
      
      {/* Highlights - animated surprise percentages */}
      {(stats.biggestBeat || stats.biggestMiss) && (
        <div className="week-summary-highlights">
          {stats.biggestBeat && (
            <div className="week-summary-highlight beat">
              <span className="week-summary-highlight-icon">🏆</span>
              <span className="week-summary-highlight-ticker">{stats.biggestBeat.ticker}</span>
              <span className="week-summary-highlight-value">
                {isVisible ? (
                  <CountUp 
                    end={getSurprisePercent(stats.biggestBeat)} 
                    duration={900} 
                    decimals={1}
                    prefix="+"
                    suffix="%"
                  />
                ) : '+0.0%'}
              </span>
            </div>
          )}
          {stats.biggestMiss && (
            <div className="week-summary-highlight miss">
              <span className="week-summary-highlight-icon">📉</span>
              <span className="week-summary-highlight-ticker">{stats.biggestMiss.ticker}</span>
              <span className="week-summary-highlight-value">
                {isVisible ? (
                  <CountUp 
                    end={getSurprisePercent(stats.biggestMiss)} 
                    duration={900} 
                    decimals={1}
                    suffix="%"
                  />
                ) : '0.0%'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WeekSummaryCard;
