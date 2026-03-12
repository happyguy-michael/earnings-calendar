'use client';

import { useEffect, useState, useRef } from 'react';
import { useMotionPreferences } from './MotionPreferences';

interface TodayMarkerLineProps {
  /** Whether this day is today */
  isToday: boolean;
  /** Delay before entrance animation (ms) */
  delay?: number;
  /** Color variant */
  variant?: 'default' | 'minimal';
}

/**
 * TodayMarkerLine - animated "you are here" indicator
 * 
 * A subtle pulsing line that appears at the bottom of today's column,
 * drawing attention without being distracting. Features:
 * - Smooth entrance animation with spring physics
 * - Gentle breathing glow effect
 * - Respects reduced motion preferences
 * 
 * Inspired by Google Calendar's "current time" red line, adapted
 * for a card-based weekly calendar view.
 */
export function TodayMarkerLine({ 
  isToday, 
  delay = 0,
  variant = 'default'
}: TodayMarkerLineProps) {
  const { shouldAnimate } = useMotionPreferences();
  const [isVisible, setIsVisible] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (isToday) {
      // Stagger entrance for visual interest
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
        // Mark as entered after animation completes
        setTimeout(() => setHasEntered(true), 600);
      }, delay);
    } else {
      setIsVisible(false);
      setHasEntered(false);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isToday, delay]);
  
  if (!isToday) return null;
  
  const isMinimal = variant === 'minimal';
  
  return (
    <div 
      className={`today-marker-line ${isVisible ? 'visible' : ''} ${hasEntered ? 'entered' : ''} ${isMinimal ? 'minimal' : ''}`}
      aria-hidden="true"
    >
      {/* Main line */}
      <div className="today-marker-track">
        <div className="today-marker-fill" />
      </div>
      
      {/* Glow layer */}
      {shouldAnimate('decorative') && !isMinimal && (
        <div className="today-marker-glow" />
      )}
      
      {/* Endpoint dot */}
      <div className="today-marker-dot">
        <div className="today-marker-dot-inner" />
        {shouldAnimate('decorative') && (
          <div className="today-marker-dot-ring" />
        )}
      </div>
    </div>
  );
}

/**
 * TodayBeacon - floating indicator that shows "NOW"
 * 
 * An alternative to the line, shows a small pulsing beacon
 * that can be positioned anywhere in today's cell.
 */
export function TodayBeacon({ 
  isToday,
  delay = 0,
  size = 'sm'
}: { 
  isToday: boolean;
  delay?: number;
  size?: 'xs' | 'sm' | 'md';
}) {
  const { shouldAnimate } = useMotionPreferences();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (isToday) {
      const timeout = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timeout);
    } else {
      setIsVisible(false);
    }
  }, [isToday, delay]);
  
  if (!isToday) return null;
  
  const sizeClasses = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5'
  };
  
  return (
    <span 
      className={`today-beacon ${isVisible ? 'visible' : ''} ${sizeClasses[size]}`}
      aria-label="Today"
    >
      <span className="today-beacon-core" />
      {shouldAnimate('decorative') && (
        <>
          <span className="today-beacon-ring" />
          <span className="today-beacon-ring today-beacon-ring-2" />
        </>
      )}
    </span>
  );
}
