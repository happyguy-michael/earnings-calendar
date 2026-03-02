'use client';

import { useState, useEffect } from 'react';

interface BeatStreakProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

/**
 * Animated Beat Streak Indicator
 * Shows a flame/fire icon with streak count for consecutive earnings beats.
 * 3+ beats = visible, 5+ = enhanced animation, 8+ = legendary animation
 */
export function BeatStreak({ streak, size = 'md', showLabel = true }: BeatStreakProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; angle: number; delay: number }>>([]);

  useEffect(() => {
    // Animate entrance
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Generate particles for high streaks
    if (streak >= 5) {
      const newParticles = Array.from({ length: streak >= 8 ? 8 : 5 }, (_, i) => ({
        id: i,
        angle: (360 / (streak >= 8 ? 8 : 5)) * i,
        delay: i * 0.1,
      }));
      setParticles(newParticles);
    }
    
    return () => clearTimeout(timer);
  }, [streak]);

  // Only show for 3+ consecutive beats
  if (streak < 3) return null;

  const sizeClasses = {
    sm: 'beat-streak-sm',
    md: 'beat-streak-md',
    lg: 'beat-streak-lg',
  };

  const streakLevel = streak >= 8 ? 'legendary' : streak >= 5 ? 'hot' : 'warm';

  return (
    <div 
      className={`beat-streak ${sizeClasses[size]} beat-streak-${streakLevel} ${isVisible ? 'visible' : ''}`}
      title={`${streak} consecutive earnings beats!`}
    >
      {/* Glow background */}
      <div className="beat-streak-glow" />
      
      {/* Animated flame icon */}
      <div className="beat-streak-flame">
        <svg viewBox="0 0 24 24" fill="none" className="flame-svg">
          {/* Main flame */}
          <path 
            className="flame-main"
            d="M12 2C8.5 6 6 9.5 6 13c0 3.5 2.5 6 6 6s6-2.5 6-6c0-3.5-2.5-7-6-11z"
          />
          {/* Inner flame */}
          <path 
            className="flame-inner"
            d="M12 6c-2 3-3.5 5-3.5 7.5c0 2 1.5 3.5 3.5 3.5s3.5-1.5 3.5-3.5c0-2.5-1.5-4.5-3.5-7.5z"
          />
          {/* Core glow */}
          <ellipse 
            className="flame-core"
            cx="12" cy="15" rx="2" ry="2.5"
          />
        </svg>
        
        {/* Ember particles for high streaks */}
        {particles.map((p) => (
          <div 
            key={p.id}
            className="ember-particle"
            style={{
              '--angle': `${p.angle}deg`,
              '--delay': `${p.delay}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>
      
      {/* Streak number */}
      <span className="beat-streak-count">{streak}</span>
      
      {/* Label */}
      {showLabel && (
        <span className="beat-streak-label">
          {streakLevel === 'legendary' ? 'LEGENDARY' : 'STREAK'}
        </span>
      )}
    </div>
  );
}

/**
 * Inline streak badge for use in cards
 */
export function BeatStreakBadge({ streak }: { streak: number }) {
  if (streak < 3) return null;

  const streakLevel = streak >= 8 ? 'legendary' : streak >= 5 ? 'hot' : 'warm';

  return (
    <span className={`beat-streak-badge beat-streak-badge-${streakLevel}`}>
      <span className="badge-flame">🔥</span>
      <span className="badge-count">{streak}</span>
    </span>
  );
}
