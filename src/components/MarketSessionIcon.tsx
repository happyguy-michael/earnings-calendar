'use client';

import { useEffect, useState, useRef } from 'react';

interface MarketSessionIconProps {
  session: 'pre' | 'post';
  size?: number;
  animated?: boolean;
  className?: string;
}

// Animated sun icon for pre-market
function SunIcon({ size = 16, animated = true }: { size?: number; animated?: boolean }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const shouldAnimate = animated && !prefersReducedMotion;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="market-session-icon sun-icon"
      aria-hidden="true"
    >
      {/* Outer glow */}
      <defs>
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
        <filter id="sunBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
        </filter>
      </defs>
      
      {/* Glow background */}
      <circle cx="12" cy="12" r="10" fill="url(#sunGlow)" filter="url(#sunBlur)" />
      
      {/* Sun rays - rotating group */}
      <g 
        className={shouldAnimate ? 'sun-rays-rotating' : ''}
        style={{ transformOrigin: '12px 12px' }}
      >
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <line
            key={angle}
            x1="12"
            y1="3"
            x2="12"
            y2="5.5"
            stroke="#fbbf24"
            strokeWidth="1.5"
            strokeLinecap="round"
            transform={`rotate(${angle} 12 12)`}
            className={shouldAnimate ? 'sun-ray' : ''}
            style={{ 
              animationDelay: shouldAnimate ? `${i * 0.1}s` : undefined,
              opacity: shouldAnimate ? undefined : 0.9
            }}
          />
        ))}
      </g>
      
      {/* Sun core */}
      <circle 
        cx="12" 
        cy="12" 
        r="4.5" 
        fill="#fbbf24"
        className={shouldAnimate ? 'sun-core' : ''}
      />
      
      {/* Inner highlight */}
      <circle 
        cx="10.5" 
        cy="10.5" 
        r="1.5" 
        fill="#fef3c7"
        opacity="0.6"
      />
    </svg>
  );
}

// Animated moon icon for after-hours
function MoonIcon({ size = 16, animated = true }: { size?: number; animated?: boolean }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const shouldAnimate = animated && !prefersReducedMotion;

  // Star positions around the moon
  const stars = [
    { x: 5, y: 5, size: 2, delay: 0 },
    { x: 19, y: 7, size: 1.5, delay: 0.3 },
    { x: 17, y: 17, size: 1.8, delay: 0.6 },
    { x: 4, y: 15, size: 1.2, delay: 0.9 },
    { x: 8, y: 19, size: 1.4, delay: 1.2 },
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="market-session-icon moon-icon"
      aria-hidden="true"
    >
      {/* Moon glow */}
      <defs>
        <radialGradient id="moonGlow" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </radialGradient>
        <filter id="moonBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
        </filter>
      </defs>
      
      {/* Twinkling stars */}
      {stars.map((star, i) => (
        <g key={i}>
          <circle
            cx={star.x}
            cy={star.y}
            r={star.size}
            fill="#e9d5ff"
            className={shouldAnimate ? 'moon-star' : ''}
            style={{ 
              animationDelay: shouldAnimate ? `${star.delay}s` : undefined,
              opacity: shouldAnimate ? undefined : 0.7
            }}
          />
          {/* Star sparkle */}
          <path
            d={`M${star.x} ${star.y - star.size * 0.8} L${star.x} ${star.y + star.size * 0.8} M${star.x - star.size * 0.8} ${star.y} L${star.x + star.size * 0.8} ${star.y}`}
            stroke="#e9d5ff"
            strokeWidth="0.5"
            strokeLinecap="round"
            className={shouldAnimate ? 'moon-star-sparkle' : ''}
            style={{ 
              animationDelay: shouldAnimate ? `${star.delay + 0.15}s` : undefined,
              opacity: shouldAnimate ? undefined : 0.5
            }}
          />
        </g>
      ))}
      
      {/* Moon glow background */}
      <circle cx="12" cy="12" r="9" fill="url(#moonGlow)" filter="url(#moonBlur)" />
      
      {/* Moon crescent shape */}
      <path
        d="M12 4C7.58 4 4 7.58 4 12s3.58 8 8 8c1.22 0 2.38-.27 3.42-.76-1.72-1.38-2.82-3.5-2.82-5.86 0-2.93 1.69-5.47 4.14-6.7C15.52 4.99 13.83 4 12 4z"
        fill="#c4b5fd"
        className={shouldAnimate ? 'moon-body' : ''}
      />
      
      {/* Moon highlight */}
      <path
        d="M9 8c-0.5 0-1 0.5-0.8 1 0.2 0.5 0.8 0.8 1.3 0.5 0.5-0.3 0.5-1 0-1.3-0.2-0.1-0.3-0.2-0.5-0.2z"
        fill="#ede9fe"
        opacity="0.5"
      />
      
      {/* Small crater details */}
      <circle cx="8" cy="11" r="1" fill="#a78bfa" opacity="0.3" />
      <circle cx="11" cy="14" r="0.7" fill="#a78bfa" opacity="0.25" />
    </svg>
  );
}

export function MarketSessionIcon({ session, size = 16, animated = true, className = '' }: MarketSessionIconProps) {
  return (
    <span className={`market-session-icon-wrapper ${className}`}>
      {session === 'pre' ? (
        <SunIcon size={size} animated={animated} />
      ) : (
        <MoonIcon size={size} animated={animated} />
      )}
    </span>
  );
}

// Alternative: Simple animated version using CSS only
export function MarketSessionBadge({ session, size = 14 }: { session: 'pre' | 'post'; size?: number }) {
  return (
    <span className={`market-session-badge ${session === 'pre' ? 'pre-market' : 'after-hours'}`}>
      <span className="session-icon" style={{ fontSize: size }}>
        {session === 'pre' ? '☀️' : '🌙'}
      </span>
      <span className="session-label">
        {session === 'pre' ? 'Pre-Market' : 'After Hours'}
      </span>
    </span>
  );
}
