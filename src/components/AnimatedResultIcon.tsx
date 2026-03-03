'use client';

import { useEffect, useState, useRef } from 'react';

interface AnimatedResultIconProps {
  result: 'beat' | 'miss';
  size?: 'sm' | 'md' | 'lg';
  delay?: number;
  className?: string;
}

const sizes = {
  sm: 14,
  md: 18,
  lg: 24,
};

export function AnimatedResultIcon({ 
  result, 
  size = 'md', 
  delay = 0,
  className = '' 
}: AnimatedResultIconProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const iconSize = sizes[size];

  // Start animation when element comes into view
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setTimeout(() => {
              setIsAnimating(true);
              setHasAnimated(true);
            }, delay);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, hasAnimated]);

  if (result === 'beat') {
    return (
      <span 
        ref={ref} 
        className={`animated-result-icon animated-result-icon--beat ${isAnimating ? 'is-animating' : ''} ${className}`}
        aria-label="Beat estimates"
      >
        <svg 
          width={iconSize} 
          height={iconSize} 
          viewBox="0 0 24 24" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          {/* Glow filter */}
          <defs>
            <filter id="glow-check" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          {/* Background circle that scales in */}
          <circle 
            cx="12" 
            cy="12" 
            r="10" 
            className="result-circle"
            fill="currentColor"
          />
          
          {/* Checkmark that draws itself */}
          <path 
            d="M6 12.5L10 16.5L18 8" 
            className="result-check"
            stroke="white"
            strokeWidth="2.5"
            filter="url(#glow-check)"
          />
        </svg>
      </span>
    );
  }

  return (
    <span 
      ref={ref} 
      className={`animated-result-icon animated-result-icon--miss ${isAnimating ? 'is-animating' : ''} ${className}`}
      aria-label="Missed estimates"
    >
      <svg 
        width={iconSize} 
        height={iconSize} 
        viewBox="0 0 24 24" 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        {/* Background circle */}
        <circle 
          cx="12" 
          cy="12" 
          r="10" 
          className="result-circle"
          fill="currentColor"
        />
        
        {/* X that draws with shake */}
        <g className="result-x">
          <path 
            d="M8 8L16 16" 
            stroke="white"
            strokeWidth="2.5"
          />
          <path 
            d="M16 8L8 16" 
            stroke="white"
            strokeWidth="2.5"
          />
        </g>
      </svg>
    </span>
  );
}

// Inline badge variant that replaces text icons
export function AnimatedBadgeIcon({ 
  result, 
  size = 'sm',
  className = '' 
}: { 
  result: 'beat' | 'miss'; 
  size?: 'sm' | 'md';
  className?: string;
}) {
  const iconSize = size === 'sm' ? 16 : 20;
  const [isAnimating, setIsAnimating] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (result === 'beat') {
    return (
      <span 
        ref={ref}
        className={`animated-badge-icon animated-badge-icon--beat ${isAnimating ? 'is-animating' : ''} ${className}`}
      >
        <svg 
          width={iconSize} 
          height={iconSize} 
          viewBox="0 0 24 24" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path 
            d="M5 13L9 17L19 7" 
            className="badge-check"
            stroke="currentColor"
            strokeWidth="3"
          />
        </svg>
      </span>
    );
  }

  return (
    <span 
      ref={ref}
      className={`animated-badge-icon animated-badge-icon--miss ${isAnimating ? 'is-animating' : ''} ${className}`}
    >
      <svg 
        width={iconSize} 
        height={iconSize} 
        viewBox="0 0 24 24" 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <g className="badge-x">
          <path d="M6 6L18 18" stroke="currentColor" strokeWidth="3" />
          <path d="M18 6L6 18" stroke="currentColor" strokeWidth="3" />
        </g>
      </svg>
    </span>
  );
}
