'use client';

import { useState, useEffect, useRef } from 'react';

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

/**
 * CountdownProgressRing - Animated depleting circular progress
 * 
 * Features:
 * - SVG ring that visually depletes as time passes
 * - Smooth stroke-dashoffset animation
 * - Color transitions: blue → amber → red as time runs out
 * - Pulsing glow effect when urgent (<5 min)
 * - Gradient stroke for premium look
 * - Respects prefers-reduced-motion
 */
function CountdownProgressRing({ 
  progress, 
  size = 36, 
  strokeWidth = 3,
  urgent = false 
}: { 
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  urgent?: boolean;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  
  // Color based on progress
  const getColor = () => {
    if (progress <= 10) return '#ef4444'; // red - very urgent
    if (progress <= 25) return '#f59e0b'; // amber - getting close
    return '#3b82f6'; // blue - plenty of time
  };
  
  const color = getColor();
  const gradientId = `countdown-gradient-${size}`;
  
  return (
    <svg 
      width={size} 
      height={size} 
      className={`countdown-progress-ring ${urgent ? 'countdown-ring-urgent' : ''}`}
      style={{ transform: 'rotate(-90deg)' }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.6" />
        </linearGradient>
        {urgent && (
          <filter id="countdown-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>
      
      {/* Background track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="countdown-ring-track"
        opacity={0.15}
      />
      
      {/* Progress arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="countdown-ring-progress"
        filter={urgent ? 'url(#countdown-glow)' : undefined}
        style={{
          transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease',
        }}
      />
    </svg>
  );
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

/**
 * CountdownBadge - Inline countdown for earnings cards with visual progress ring
 * 
 * Features:
 * - Real-time ticking countdown
 * - Animated progress ring showing time remaining
 * - Color transitions as time runs out (blue → amber → red)
 * - Pulsing urgency animation under 5 minutes
 * - "NOW" state with full urgency styling
 * - Respects prefers-reduced-motion
 */
export function CountdownBadge({ targetDate, time }: { targetDate: Date; time: 'pre' | 'post' | 'intraday' | undefined }) {
  const [timeLeft, setTimeLeft] = useState<{ value: string; urgent: boolean; progress: number }>({ 
    value: '', 
    urgent: false,
    progress: 100 
  });
  const startTimeRef = useRef<number | null>(null);
  const totalDurationRef = useRef<number>(0);

  useEffect(() => {
    const target = getTargetTime(targetDate, time);
    
    // Initialize start time on first render
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now();
      totalDurationRef.current = target.getTime() - startTimeRef.current;
    }
    
    const updateCountdown = () => {
      const now = Date.now();
      const diff = target.getTime() - now;
      
      if (diff <= 0) {
        setTimeLeft({ value: 'NOW', urgent: true, progress: 0 });
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      // Calculate progress percentage (time remaining / total time)
      // Cap at 100% and use 1 hour window for visual effect
      const maxWindow = 60 * 60 * 1000; // 1 hour in ms
      const progressWindow = Math.min(diff, maxWindow);
      const progress = Math.min(100, (progressWindow / maxWindow) * 100);
      
      // Urgent if under 5 minutes
      const urgent = diff < 5 * 60 * 1000;
      
      let value: string;
      if (hours > 0) {
        value = `${hours}h ${minutes}m`;
      } else if (minutes > 0) {
        value = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      } else {
        value = `${seconds}s`;
      }
      
      setTimeLeft({ value, urgent, progress });
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, [targetDate, time]);

  if (!timeLeft.value) return null;

  return (
    <div className={`countdown-badge ${timeLeft.urgent ? 'countdown-badge-urgent' : ''}`}>
      <div className="countdown-badge-ring">
        <CountdownProgressRing 
          progress={timeLeft.progress} 
          size={32} 
          strokeWidth={2.5}
          urgent={timeLeft.urgent}
        />
        <span className="countdown-badge-inner">
          <span className="countdown-badge-icon">⏱</span>
        </span>
      </div>
      <div className="countdown-badge-text">
        <span className="countdown-badge-label">Reports in</span>
        <span className="countdown-badge-value">{timeLeft.value}</span>
      </div>
    </div>
  );
}
