'use client';

import { useState, useEffect } from 'react';

interface CountdownProps {
  targetDate: Date;
  time: 'pre' | 'post' | 'intraday' | undefined;
  compact?: boolean;
}

function getTargetTime(date: Date, time: 'pre' | 'post' | 'intraday' | undefined): Date {
  const target = new Date(date);
  // Pre-market: ~9:30 AM ET (adjust for local display)
  // Post-market: ~4:00 PM ET
  if (time === 'pre') {
    target.setHours(9, 30, 0, 0);
  } else if (time === 'post') {
    target.setHours(16, 0, 0, 0);
  } else {
    // Default to market close
    target.setHours(16, 0, 0, 0);
  }
  return target;
}

export function Countdown({ targetDate, time, compact = false }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const target = getTargetTime(targetDate, time);
    
    const updateCountdown = () => {
      const now = Date.now();
      const diff = target.getTime() - now;
      
      if (diff <= 0) {
        setTimeLeft('Now');
        setIsUrgent(true);
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      // Urgent if less than 1 hour
      setIsUrgent(hours < 1);
      
      if (compact) {
        if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m`);
        } else if (minutes > 0) {
          setTimeLeft(`${minutes}m ${seconds}s`);
        } else {
          setTimeLeft(`${seconds}s`);
        }
      } else {
        if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m`);
        } else {
          setTimeLeft(`${minutes}m ${seconds}s`);
        }
      }
    };
    
    updateCountdown();
    // Update every second when close, every minute otherwise
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, [targetDate, time, compact]);

  if (!timeLeft) return null;

  return (
    <span className={`countdown-timer ${isUrgent ? 'countdown-urgent' : ''} ${compact ? 'countdown-compact' : ''}`}>
      <span className="countdown-icon">⏱</span>
      <span className="countdown-value">{timeLeft}</span>
    </span>
  );
}

// Inline countdown for cards (very compact)
export function CountdownBadge({ targetDate, time }: { targetDate: Date; time: 'pre' | 'post' | 'intraday' | undefined }) {
  const [timeLeft, setTimeLeft] = useState<{ value: string; urgent: boolean }>({ value: '', urgent: false });

  useEffect(() => {
    const target = getTargetTime(targetDate, time);
    
    const updateCountdown = () => {
      const now = Date.now();
      const diff = target.getTime() - now;
      
      if (diff <= 0) {
        setTimeLeft({ value: 'NOW', urgent: true });
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      const urgent = hours < 1;
      
      if (hours > 0) {
        setTimeLeft({ value: `${hours}h ${minutes}m`, urgent });
      } else if (minutes > 0) {
        setTimeLeft({ value: `${minutes}:${seconds.toString().padStart(2, '0')}`, urgent });
      } else {
        setTimeLeft({ value: `${seconds}s`, urgent: true });
      }
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, [targetDate, time]);

  if (!timeLeft.value) return null;

  return (
    <div className={`countdown-badge ${timeLeft.urgent ? 'countdown-badge-urgent' : ''}`}>
      <span className="countdown-badge-label">Reports in</span>
      <span className="countdown-badge-value">{timeLeft.value}</span>
    </div>
  );
}
