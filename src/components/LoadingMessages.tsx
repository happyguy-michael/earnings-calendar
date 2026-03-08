'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * LoadingMessages - Contextual progress messaging during skeleton loading
 * 
 * Rotating status messages that communicate what's happening during loading,
 * making the wait feel purposeful and faster (perceived performance boost).
 * 
 * Inspired by: "6 Loading State Patterns That Feel Premium" - Medium UXWorld
 * Pattern: Contextual Progress Messaging
 */

interface LoadingMessagesProps {
  messages?: string[];
  interval?: number; // ms between message changes
  className?: string;
}

const defaultMessages = [
  'Loading earnings data...',
  'Fetching market schedules...',
  'Preparing charts...',
  'Analyzing beat rates...',
  'Almost ready...',
];

export function LoadingMessages({ 
  messages = defaultMessages, 
  interval = 1800,
  className = ''
}: LoadingMessagesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prefersReducedMotion = useRef(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }, []);

  useEffect(() => {
    if (messages.length <= 1) return;

    const cycleMessage = () => {
      if (prefersReducedMotion.current) {
        // No animation, just cycle
        setCurrentIndex(prev => (prev + 1) % messages.length);
        timeoutRef.current = setTimeout(cycleMessage, interval);
        return;
      }

      // Start exit animation
      setIsExiting(true);
      
      // After exit animation, change message and enter
      timeoutRef.current = setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % messages.length);
        setIsExiting(false);
        
        // Schedule next cycle
        timeoutRef.current = setTimeout(cycleMessage, interval);
      }, 300);
    };

    timeoutRef.current = setTimeout(cycleMessage, interval);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [messages, interval]);

  return (
    <div className={`loading-messages ${className}`}>
      <div className="loading-messages-container">
        {/* Animated loading spinner */}
        <div className="loading-spinner">
          <svg viewBox="0 0 24 24" className="loading-spinner-svg">
            <circle 
              cx="12" 
              cy="12" 
              r="10" 
              fill="none" 
              strokeWidth="2" 
              className="loading-spinner-track"
            />
            <circle 
              cx="12" 
              cy="12" 
              r="10" 
              fill="none" 
              strokeWidth="2" 
              strokeLinecap="round"
              className="loading-spinner-arc"
            />
          </svg>
        </div>
        
        {/* Message text with fade animation */}
        <span 
          className={`loading-message-text ${isExiting ? 'exiting' : ''}`}
          key={currentIndex}
        >
          {messages[currentIndex]}
        </span>
      </div>
      
      {/* Progress dots */}
      <div className="loading-progress-dots">
        {messages.map((_, i) => (
          <div 
            key={i} 
            className={`loading-dot ${i === currentIndex ? 'active' : ''} ${i < currentIndex ? 'completed' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * LoadingMessagesMinimal - Compact version for inline use
 */
export function LoadingMessagesMinimal({ 
  messages = defaultMessages.slice(0, 3),
  interval = 2000 
}: Omit<LoadingMessagesProps, 'className'>) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (messages.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % messages.length);
    }, interval);

    return () => clearInterval(timer);
  }, [messages, interval]);

  return (
    <span className="loading-message-minimal">
      {messages[currentIndex]}
    </span>
  );
}

export default LoadingMessages;
