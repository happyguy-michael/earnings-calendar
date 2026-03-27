'use client';

import { useState, useEffect, useRef, memo } from 'react';

/**
 * FlipDigit - Single digit with flip animation
 * 
 * Features:
 * - Airport departure board style flip animation
 * - 3D CSS transform with perspective
 * - Smooth transition between digits
 * - Respects prefers-reduced-motion
 */
const FlipDigit = memo(function FlipDigit({ 
  digit, 
  delay = 0 
}: { 
  digit: string; 
  delay?: number;
}) {
  const [currentDigit, setCurrentDigit] = useState(digit);
  const [nextDigit, setNextDigit] = useState(digit);
  const [isFlipping, setIsFlipping] = useState(false);
  const prevDigitRef = useRef(digit);

  useEffect(() => {
    if (digit !== prevDigitRef.current) {
      setNextDigit(digit);
      
      // Delay the flip animation
      const flipTimer = setTimeout(() => {
        setIsFlipping(true);
        
        // After flip animation completes, update current digit
        const completeTimer = setTimeout(() => {
          setCurrentDigit(digit);
          setIsFlipping(false);
        }, 300); // Match CSS animation duration
        
        return () => clearTimeout(completeTimer);
      }, delay);
      
      prevDigitRef.current = digit;
      return () => clearTimeout(flipTimer);
    }
  }, [digit, delay]);

  return (
    <span className={`flip-digit ${isFlipping ? 'flipping' : ''}`}>
      <span className="flip-digit-inner">
        {/* Top half - shows current digit, flips to reveal next */}
        <span className="flip-digit-top">
          <span className="flip-digit-text">{currentDigit}</span>
        </span>
        
        {/* Top flip - the flipping panel */}
        <span className="flip-digit-top-flip">
          <span className="flip-digit-text">{isFlipping ? currentDigit : nextDigit}</span>
        </span>
        
        {/* Bottom half - shows next digit */}
        <span className="flip-digit-bottom">
          <span className="flip-digit-text">{nextDigit}</span>
        </span>
        
        {/* Bottom flip - the flipping panel */}
        <span className="flip-digit-bottom-flip">
          <span className="flip-digit-text">{isFlipping ? nextDigit : currentDigit}</span>
        </span>
      </span>
    </span>
  );
});

/**
 * FlipClock - Multiple flip digits for time display
 * 
 * Features:
 * - Cascading flip animation delays
 * - Colon separator with pulse effect
 * - Compact and full modes
 * - Urgent state styling
 */
interface FlipClockProps {
  hours?: number;
  minutes: number;
  seconds: number;
  showHours?: boolean;
  showSeconds?: boolean;
  compact?: boolean;
  urgent?: boolean;
}

export function FlipClock({
  hours = 0,
  minutes,
  seconds,
  showHours = true,
  showSeconds = true,
  compact = false,
  urgent = false,
}: FlipClockProps) {
  const hourStr = hours.toString().padStart(2, '0');
  const minStr = minutes.toString().padStart(2, '0');
  const secStr = seconds.toString().padStart(2, '0');
  
  return (
    <span className={`flip-clock ${compact ? 'flip-clock-compact' : ''} ${urgent ? 'flip-clock-urgent' : ''}`}>
      {showHours && hours > 0 && (
        <>
          <span className="flip-clock-unit">
            <FlipDigit digit={hourStr[0]} delay={0} />
            <FlipDigit digit={hourStr[1]} delay={30} />
            <span className="flip-clock-label">h</span>
          </span>
          <span className="flip-clock-separator">:</span>
        </>
      )}
      
      <span className="flip-clock-unit">
        <FlipDigit digit={minStr[0]} delay={60} />
        <FlipDigit digit={minStr[1]} delay={90} />
        {!showSeconds && <span className="flip-clock-label">m</span>}
      </span>
      
      {showSeconds && (
        <>
          <span className={`flip-clock-separator ${urgent ? 'flip-clock-separator-urgent' : ''}`}>:</span>
          <span className="flip-clock-unit">
            <FlipDigit digit={secStr[0]} delay={120} />
            <FlipDigit digit={secStr[1]} delay={150} />
          </span>
        </>
      )}
    </span>
  );
}

/**
 * FlipCountdownBadge - Countdown badge with flip digit animation
 * 
 * Features:
 * - Airport/casino style digit flip animation
 * - Progress ring around timer icon
 * - Urgency states with color transitions
 * - Pulsing glow when under 5 minutes
 * - Respects prefers-reduced-motion (falls back to regular numbers)
 */
interface FlipCountdownBadgeProps {
  targetDate: Date;
  time: 'pre' | 'post' | 'intraday' | undefined;
}

function getTargetTime(date: Date, time: 'pre' | 'post' | 'intraday' | undefined): Date {
  const target = new Date(date);
  if (time === 'pre') {
    target.setHours(9, 30, 0, 0);
  } else if (time === 'post') {
    target.setHours(16, 0, 0, 0);
  } else {
    target.setHours(16, 0, 0, 0);
  }
  return target;
}

export function FlipCountdownBadge({ targetDate, time }: FlipCountdownBadgeProps) {
  const [timeLeft, setTimeLeft] = useState<{ 
    hours: number; 
    minutes: number; 
    seconds: number; 
    urgent: boolean;
    imminent: boolean;
    isNow: boolean;
  }>({ hours: 0, minutes: 0, seconds: 0, urgent: false, imminent: false, isNow: false });

  useEffect(() => {
    const target = getTargetTime(targetDate, time);
    
    const updateCountdown = () => {
      const now = Date.now();
      const diff = target.getTime() - now;
      
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, urgent: true, imminent: true, isNow: true });
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      // Urgent if under 5 minutes
      const urgent = diff < 5 * 60 * 1000;
      // Imminent if under 2 minutes - triggers nervous tremor animation
      const imminent = diff < 2 * 60 * 1000;
      
      setTimeLeft({ hours, minutes, seconds, urgent, imminent, isNow: false });
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, [targetDate, time]);

  if (timeLeft.isNow) {
    return (
      <div className="flip-countdown-badge flip-countdown-now">
        <span className="flip-countdown-now-text">REPORTING NOW</span>
        <span className="flip-countdown-now-pulse" />
      </div>
    );
  }

  return (
    <div className={`flip-countdown-badge ${timeLeft.urgent ? 'flip-countdown-urgent' : ''} ${timeLeft.imminent ? 'flip-countdown-imminent' : ''}`}>
      <div className="flip-countdown-header">
        <span className="flip-countdown-icon">⏱</span>
        <span className="flip-countdown-label">Reports in</span>
      </div>
      <FlipClock 
        hours={timeLeft.hours}
        minutes={timeLeft.minutes}
        seconds={timeLeft.seconds}
        showHours={timeLeft.hours > 0}
        showSeconds={timeLeft.hours === 0}
        compact={true}
        urgent={timeLeft.urgent}
      />
    </div>
  );
}

export default FlipDigit;
