'use client';

import { useMemo, useState, useEffect } from 'react';
import { Earning } from '@/lib/types';

interface TodayNarrativeProps {
  earnings: Earning[];
  className?: string;
}

/**
 * TodayNarrative - Conversational summary of today's earnings
 * 
 * Design principle: "Post-Dashboard Era: Narrative Interfaces"
 * Instead of raw stats, provide human-readable insights that tell a story.
 * 
 * Features:
 * - Dynamic narrative based on today's situation
 * - Highlights noteworthy beats/misses
 * - Teases upcoming earnings with time
 * - Contextual emoji mood indicators
 * - Smooth typewriter-style entrance
 * - Respects prefers-reduced-motion
 */
export function TodayNarrative({ earnings, className = '' }: TodayNarrativeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showSecondary, setShowSecondary] = useState(false);

  useEffect(() => {
    // Stagger the entrance
    const t1 = setTimeout(() => setIsVisible(true), 200);
    const t2 = setTimeout(() => setShowSecondary(true), 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const narrative = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    // Get today's earnings
    const todayEarnings = earnings.filter(e => e.date === todayStr);
    
    if (todayEarnings.length === 0) {
      return {
        primary: "Quiet day — no earnings scheduled",
        secondary: "Use the arrows to browse upcoming weeks",
        mood: 'calm' as const,
        emoji: '🧘',
      };
    }

    const preMarket = todayEarnings.filter(e => e.time === 'pre');
    const postMarket = todayEarnings.filter(e => e.time === 'post');
    const reported = todayEarnings.filter(e => e.eps !== undefined && e.eps !== null);
    const pending = todayEarnings.filter(e => e.eps === undefined || e.eps === null);
    const beats = reported.filter(e => e.result === 'beat');
    const misses = reported.filter(e => e.result === 'miss');

    // Calculate surprises
    const getSurprise = (e: Earning) => {
      if (!e.eps || !e.estimate) return 0;
      return ((e.eps - e.estimate) / Math.abs(e.estimate)) * 100;
    };

    const sortedBeats = [...beats].sort((a, b) => getSurprise(b) - getSurprise(a));
    const sortedMisses = [...misses].sort((a, b) => getSurprise(a) - getSurprise(b));
    
    const topBeat = sortedBeats[0];
    const topMiss = sortedMisses[0];
    const topBeatSurprise = topBeat ? getSurprise(topBeat) : 0;
    const topMissSurprise = topMiss ? getSurprise(topMiss) : 0;

    // Build primary narrative
    let primary = '';
    let secondary = '';
    let mood: 'hot' | 'good' | 'mixed' | 'rough' | 'waiting' | 'calm' = 'waiting';
    let emoji = '📊';

    const total = todayEarnings.length;
    const reportStr = total === 1 ? 'report' : 'reports';

    // All reported
    if (pending.length === 0) {
      const beatRate = (beats.length / reported.length) * 100;
      
      if (beatRate >= 75) {
        mood = 'hot';
        emoji = '🔥';
        primary = `${total} ${reportStr} in — ${beats.length} beat${beats.length > 1 ? 's' : ''}, solid day!`;
        if (topBeat && topBeatSurprise >= 10) {
          secondary = `${topBeat.ticker} led the pack with +${topBeatSurprise.toFixed(0)}% surprise`;
        }
      } else if (beatRate >= 50) {
        mood = 'good';
        emoji = '📈';
        primary = `${total} ${reportStr} done — ${beats.length} beat${beats.length > 1 ? 's' : ''}, ${misses.length} miss${misses.length > 1 ? 'es' : ''}`;
        if (topBeat && topBeatSurprise >= 5) {
          secondary = `${topBeat.ticker} impressed with +${topBeatSurprise.toFixed(0)}%`;
        }
      } else {
        mood = 'rough';
        emoji = '❄️';
        primary = `Tough day — only ${beats.length} of ${total} beat estimates`;
        if (topMiss && topMissSurprise <= -10) {
          secondary = `${topMiss.ticker} disappointed at ${topMissSurprise.toFixed(0)}%`;
        }
      }
    }
    // Some reported, some pending
    else if (reported.length > 0) {
      mood = 'mixed';
      emoji = '⏳';
      
      if (beats.length > misses.length) {
        primary = `${reported.length} in so far — ${beats.length} beat${beats.length > 1 ? 's' : ''}, ${pending.length} still to come`;
        if (topBeat && topBeatSurprise >= 8) {
          secondary = `${topBeat.ticker} already crushed it with +${topBeatSurprise.toFixed(0)}%`;
        } else {
          secondary = `${pending.length > 1 ? `${pending[0].ticker} and ${pending.length - 1} more` : pending[0].ticker} reporting soon`;
        }
      } else {
        primary = `Mixed results — ${beats.length} beat${beats.length > 1 ? 's' : ''}, ${misses.length} miss${misses.length > 1 ? 'es' : ''} so far`;
        secondary = `${pending.length} more ${pending.length === 1 ? 'company' : 'companies'} still to report`;
      }
    }
    // All pending
    else {
      mood = 'waiting';
      
      if (preMarket.length > 0 && postMarket.length > 0) {
        emoji = '📅';
        primary = `${total} ${reportStr} today — ${preMarket.length} pre-market, ${postMarket.length} after hours`;
        // Highlight notable pending
        const notable = todayEarnings.find(e => e.beatOdds && e.beatOdds >= 75);
        if (notable) {
          secondary = `${notable.ticker} has ${notable.beatOdds}% beat probability`;
        } else {
          secondary = `${preMarket[0]?.ticker || postMarket[0]?.ticker} kicks things off`;
        }
      } else if (preMarket.length > 0) {
        emoji = '☀️';
        primary = `${total} pre-market ${reportStr} today`;
        secondary = `${preMarket[0].ticker}${preMarket.length > 1 ? ` + ${preMarket.length - 1} more` : ''} before the bell`;
      } else {
        emoji = '🌙';
        primary = `${total} after-hours ${reportStr} today`;
        secondary = `${postMarket[0].ticker}${postMarket.length > 1 ? ` + ${postMarket.length - 1} more` : ''} after the close`;
      }
    }

    return { primary, secondary, mood, emoji };
  }, [earnings]);

  // Check if today is current view's week (could be improved)
  const todayStr = new Date().toISOString().split('T')[0];
  const hasTodayEarnings = earnings.some(e => e.date === todayStr);

  // Only show if we have today's data or narrative makes sense
  if (!hasTodayEarnings && narrative.mood !== 'calm') {
    return null;
  }

  return (
    <div 
      className={`today-narrative ${narrative.mood} ${isVisible ? 'visible' : ''} ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="today-narrative-content">
        <span className="today-narrative-emoji" aria-hidden="true">
          {narrative.emoji}
        </span>
        <div className="today-narrative-text">
          <p className={`today-narrative-primary ${isVisible ? 'visible' : ''}`}>
            {narrative.primary}
          </p>
          {narrative.secondary && (
            <p className={`today-narrative-secondary ${showSecondary ? 'visible' : ''}`}>
              {narrative.secondary}
            </p>
          )}
        </div>
      </div>
      
      {/* Subtle animated gradient line */}
      <div className="today-narrative-line" aria-hidden="true" />
    </div>
  );
}

export default TodayNarrative;
