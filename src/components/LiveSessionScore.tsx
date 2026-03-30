'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import { Earning } from '@/lib/types';

/**
 * LiveSessionScore — Real-time beat/miss tally for current session
 * 
 * Inspiration:
 * - Sports apps showing live score updates (ESPN, Apple Sports)
 * - Trading platform win/loss counters
 * - Fantasy sports "points so far today" widgets
 * - 2026 "Live Scoreboard" trend — gamified real-time metrics
 * 
 * Features:
 * - Shows current session (pre-market or after-hours) beat vs miss count
 * - Visual momentum indicator (winning/losing streak)
 * - Subtle pulse animation on score change
 * - Compact badge format for header integration
 * - Session-aware: only shows during active earnings sessions
 * - Full light/dark mode + reduced motion support
 * 
 * Design Philosophy:
 * "Is it a good session or bad session?" answered at a glance.
 * Traders track this mentally — we make it visible.
 */

interface LiveSessionScoreProps {
  /** All earnings data */
  earnings: Earning[];
  /** Animation delay in ms */
  delay?: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show streak indicator */
  showStreak?: boolean;
  /** Compact single-line mode */
  compact?: boolean;
  /** Custom className */
  className?: string;
}

interface SessionScore {
  session: 'pre' | 'post' | null;
  beats: number;
  misses: number;
  pending: number;
  total: number;
  beatRate: number;
  momentum: 'hot' | 'warming' | 'neutral' | 'cooling' | 'cold';
  lastResult: 'beat' | 'miss' | null;
  streak: number;
  streakType: 'beat' | 'miss' | null;
}

// Get current ET time info
function getETTime(): { hours: number; minutes: number; dayOfWeek: number } {
  const now = new Date();
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  
  // ET offset: UTC-5 (EST) or UTC-4 (EDT)
  // Simple DST check: March 2nd Sunday to November 1st Sunday
  const month = now.getUTCMonth();
  const isDST = month >= 2 && month <= 10; // Rough approximation
  const offset = isDST ? 4 : 5;
  
  let etHours = utcHours - offset;
  let dayOffset = 0;
  
  if (etHours < 0) {
    etHours += 24;
    dayOffset = -1;
  }
  
  const day = now.getUTCDay();
  const etDay = (day + dayOffset + 7) % 7;
  
  return { hours: etHours, minutes: utcMinutes, dayOfWeek: etDay };
}

// Determine current trading session
function getCurrentSession(): 'pre' | 'post' | 'regular' | 'closed' {
  const { hours, minutes, dayOfWeek } = getETTime();
  const totalMinutes = hours * 60 + minutes;
  
  // Weekend
  if (dayOfWeek === 0 || dayOfWeek === 6) return 'closed';
  
  // Pre-market: 4:00 AM - 9:30 AM
  if (totalMinutes >= 240 && totalMinutes < 570) return 'pre';
  
  // Regular hours: 9:30 AM - 4:00 PM
  if (totalMinutes >= 570 && totalMinutes < 960) return 'regular';
  
  // After-hours: 4:00 PM - 8:00 PM
  if (totalMinutes >= 960 && totalMinutes < 1200) return 'post';
  
  return 'closed';
}

// Calculate streak from recent results
function calculateStreak(results: ('beat' | 'miss')[]): { streak: number; type: 'beat' | 'miss' | null } {
  if (results.length === 0) return { streak: 0, type: null };
  
  const lastType = results[0];
  let streak = 0;
  
  for (const result of results) {
    if (result === lastType) {
      streak++;
    } else {
      break;
    }
  }
  
  return { streak, type: lastType };
}

// Get today's date string in YYYY-MM-DD format
function getTodayDateString(): string {
  const now = new Date();
  // Use ET time for date consistency
  const etFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return etFormatter.format(now);
}

const LiveSessionScoreComponent = ({
  earnings,
  delay = 0,
  size = 'md',
  showStreak = true,
  compact = false,
  className = '',
}: LiveSessionScoreProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSession, setCurrentSession] = useState<'pre' | 'post' | 'regular' | 'closed'>('closed');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  
  // Entrance animation delay
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  // Update current session every 30 seconds
  useEffect(() => {
    const updateSession = () => setCurrentSession(getCurrentSession());
    updateSession();
    
    const interval = setInterval(updateSession, 30000);
    return () => clearInterval(interval);
  }, []);
  
  // Calculate session score
  const score: SessionScore = useMemo(() => {
    const today = getTodayDateString();
    
    // Get today's earnings for the active session
    const sessionType = currentSession === 'pre' ? 'pre' : currentSession === 'post' ? 'post' : null;
    
    if (!sessionType) {
      return {
        session: null,
        beats: 0,
        misses: 0,
        pending: 0,
        total: 0,
        beatRate: 0,
        momentum: 'neutral',
        lastResult: null,
        streak: 0,
        streakType: null,
      };
    }
    
    const sessionEarnings = earnings.filter(
      e => e.date === today && e.time === sessionType
    );
    
    const reported = sessionEarnings.filter(e => e.eps !== undefined && e.eps !== null);
    const beats = reported.filter(e => e.result === 'beat').length;
    const misses = reported.filter(e => e.result === 'miss').length;
    const pending = sessionEarnings.length - reported.length;
    
    const beatRate = reported.length > 0 
      ? Math.round((beats / reported.length) * 100) 
      : 0;
    
    // Calculate momentum based on beat rate
    let momentum: SessionScore['momentum'] = 'neutral';
    if (reported.length >= 2) {
      if (beatRate >= 80) momentum = 'hot';
      else if (beatRate >= 60) momentum = 'warming';
      else if (beatRate >= 40) momentum = 'neutral';
      else if (beatRate >= 20) momentum = 'cooling';
      else momentum = 'cold';
    }
    
    // Get streak from most recent results
    const results = reported
      .filter(e => e.result === 'beat' || e.result === 'miss')
      .map(e => e.result as 'beat' | 'miss');
    
    const { streak, type: streakType } = calculateStreak(results.reverse());
    
    return {
      session: sessionType,
      beats,
      misses,
      pending,
      total: sessionEarnings.length,
      beatRate,
      momentum,
      lastResult: results.length > 0 ? results[results.length - 1] : null,
      streak,
      streakType,
    };
  }, [earnings, currentSession]);
  
  // Don't render if not in an active earnings session or no earnings today
  if (!score.session || score.total === 0) {
    return null;
  }
  
  // Size configurations
  const sizeConfig = {
    sm: {
      height: 'h-6',
      text: 'text-[10px]',
      gap: 'gap-1',
      padding: 'px-2 py-0.5',
      iconSize: 10,
    },
    md: {
      height: 'h-7',
      text: 'text-xs',
      gap: 'gap-1.5',
      padding: 'px-2.5 py-1',
      iconSize: 12,
    },
    lg: {
      height: 'h-8',
      text: 'text-sm',
      gap: 'gap-2',
      padding: 'px-3 py-1.5',
      iconSize: 14,
    },
  };
  
  const config = sizeConfig[size];
  
  // Momentum colors and icons
  const momentumConfig = {
    hot: { bg: 'bg-green-500/15', border: 'border-green-500/30', icon: '🔥', label: 'Hot' },
    warming: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: '📈', label: 'Warming' },
    neutral: { bg: 'bg-zinc-500/10', border: 'border-zinc-500/20', icon: '➡️', label: 'Neutral' },
    cooling: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: '📉', label: 'Cooling' },
    cold: { bg: 'bg-red-500/15', border: 'border-red-500/30', icon: '❄️', label: 'Cold' },
  };
  
  const momentum = momentumConfig[score.momentum];
  
  const sessionLabel = score.session === 'pre' ? 'Pre' : 'AH';
  
  return (
    <div
      className={`
        live-session-score
        inline-flex items-center ${config.gap}
        ${config.padding} ${config.height}
        ${momentum.bg} ${momentum.border}
        border rounded-full
        font-medium ${config.text}
        transition-all duration-300
        ${prefersReducedMotion ? '' : 'animate-in fade-in slide-in-from-bottom-1'}
        ${isVisible ? 'opacity-100' : 'opacity-0'}
        ${className}
      `}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: 'backwards',
      }}
      title={`${sessionLabel}: ${score.beats} beats, ${score.misses} misses (${score.beatRate}% beat rate)${score.pending > 0 ? `, ${score.pending} pending` : ''}`}
    >
      {/* Session indicator */}
      <span className="text-zinc-400 font-semibold">{sessionLabel}</span>
      
      {/* Divider */}
      <span className="w-px h-3 bg-zinc-700/50" />
      
      {/* Score */}
      <span className="flex items-center gap-1">
        <span className="text-green-400 font-bold">{score.beats}</span>
        <span className="text-zinc-500">–</span>
        <span className="text-red-400 font-bold">{score.misses}</span>
      </span>
      
      {/* Streak indicator */}
      {showStreak && score.streak >= 2 && score.streakType && (
        <>
          <span className="w-px h-3 bg-zinc-700/50" />
          <span 
            className={`
              flex items-center gap-0.5 font-bold
              ${score.streakType === 'beat' ? 'text-green-400' : 'text-red-400'}
              ${!prefersReducedMotion && score.streak >= 3 ? 'animate-pulse' : ''}
            `}
          >
            {score.streak}
            <span className="text-[0.7em]">
              {score.streakType === 'beat' ? '🔥' : '❄️'}
            </span>
          </span>
        </>
      )}
      
      {/* Pending indicator */}
      {score.pending > 0 && !compact && (
        <>
          <span className="w-px h-3 bg-zinc-700/50" />
          <span className="text-amber-400/70 flex items-center gap-0.5">
            <span>{score.pending}</span>
            <span className={`inline-block w-1.5 h-1.5 rounded-full bg-amber-400 ${!prefersReducedMotion ? 'animate-pulse' : ''}`} />
          </span>
        </>
      )}
      
      {/* Momentum icon */}
      {!compact && (
        <span className="ml-0.5 text-[0.9em]">{momentum.icon}</span>
      )}
      
      <style jsx>{`
        .live-session-score {
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        
        /* Light mode */
        :global(html.light) .live-session-score {
          background: rgba(255, 255, 255, 0.8);
          border-color: rgba(0, 0, 0, 0.1);
        }
        
        :global(html.light) .live-session-score .text-zinc-400 {
          color: #71717a;
        }
        
        :global(html.light) .live-session-score .text-zinc-500 {
          color: #a1a1aa;
        }
        
        :global(html.light) .live-session-score .bg-zinc-700\/50 {
          background-color: rgba(63, 63, 70, 0.3);
        }
        
        /* Pulse animation for streaks */
        @keyframes streak-pulse {
          0%, 100% { 
            transform: scale(1);
            filter: brightness(1);
          }
          50% { 
            transform: scale(1.05);
            filter: brightness(1.2);
          }
        }
        
        .streak-pulse {
          animation: streak-pulse 2s ease-in-out infinite;
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .live-session-score {
            animation: none !important;
            transition: none !important;
          }
          .streak-pulse {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export const LiveSessionScore = memo(LiveSessionScoreComponent);

/**
 * Compact badge version for tight spaces
 */
export const LiveSessionScoreBadge = memo(function LiveSessionScoreBadge({
  earnings,
  delay = 0,
  className = '',
}: {
  earnings: Earning[];
  delay?: number;
  className?: string;
}) {
  return (
    <LiveSessionScore
      earnings={earnings}
      delay={delay}
      size="sm"
      showStreak={true}
      compact={true}
      className={className}
    />
  );
});
