'use client';

import { useEffect, useState, useRef } from 'react';

interface AnimatedStatIconProps {
  type: 'total' | 'beatRate' | 'reported' | 'pending';
  size?: number;
  className?: string;
}

/**
 * Animated SVG icons for stat cards. Each icon type has a unique
 * entrance animation and subtle ambient motion.
 * 
 * - total: Stacked bars chart with sequential reveal
 * - beatRate: Trophy with shimmer effect
 * - reported: Clipboard with checkmark that draws itself
 * - pending: Hourglass with sand animation
 */
export function AnimatedStatIcon({ type, size = 24, className = '' }: AnimatedStatIconProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<SVGSVGElement>(null);
  
  // Trigger animation when scrolled into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  const baseClass = `stat-icon stat-icon-${type} ${isVisible ? 'visible' : ''} ${className}`;
  
  switch (type) {
    case 'total':
      return (
        <svg 
          ref={ref}
          width={size} 
          height={size} 
          viewBox="0 0 24 24" 
          fill="none"
          className={baseClass}
          aria-hidden="true"
        >
          {/* Stacked bar chart icon */}
          <rect 
            className="stat-icon-bar stat-icon-bar-1"
            x="4" y="14" width="4" height="6" rx="1"
            fill="currentColor"
            opacity="0.6"
          />
          <rect 
            className="stat-icon-bar stat-icon-bar-2"
            x="10" y="10" width="4" height="10" rx="1"
            fill="currentColor"
            opacity="0.8"
          />
          <rect 
            className="stat-icon-bar stat-icon-bar-3"
            x="16" y="4" width="4" height="16" rx="1"
            fill="currentColor"
          />
          {/* Subtle glow overlay */}
          <rect 
            className="stat-icon-glow"
            x="16" y="4" width="4" height="16" rx="1"
            fill="url(#totalGlow)"
          />
          <defs>
            <linearGradient id="totalGlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      );
      
    case 'beatRate':
      return (
        <svg 
          ref={ref}
          width={size} 
          height={size} 
          viewBox="0 0 24 24" 
          fill="none"
          className={baseClass}
          aria-hidden="true"
        >
          {/* Trophy body */}
          <path 
            className="stat-icon-trophy-body"
            d="M8 2h8v2H8V2zM7 4h10v8c0 2.761-2.239 5-5 5s-5-2.239-5-5V4z"
            fill="currentColor"
            opacity="0.9"
          />
          {/* Trophy handles */}
          <path 
            className="stat-icon-trophy-handle"
            d="M4 6h3v1c0 1.657-1.343 3-3 3V6zM17 6h3v4c-1.657 0-3-1.343-3-3V6z"
            fill="currentColor"
            opacity="0.5"
          />
          {/* Trophy base */}
          <path 
            className="stat-icon-trophy-base"
            d="M9 17h6v2H9v-2zM7 19h10v2H7v-2z"
            fill="currentColor"
            opacity="0.7"
          />
          {/* Star highlight */}
          <path 
            className="stat-icon-trophy-star"
            d="M12 7l1 2h2l-1.5 1.5.5 2-2-1-2 1 .5-2L9 9h2l1-2z"
            fill="url(#trophyStar)"
          />
          {/* Shimmer sweep */}
          <rect 
            className="stat-icon-shimmer"
            x="7" y="4" width="10" height="13" rx="2"
            fill="url(#trophyShimmer)"
          />
          <defs>
            <linearGradient id="trophyStar" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="trophyShimmer" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="50%" stopColor="white" stopOpacity="0.3" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      );
      
    case 'reported':
      return (
        <svg 
          ref={ref}
          width={size} 
          height={size} 
          viewBox="0 0 24 24" 
          fill="none"
          className={baseClass}
          aria-hidden="true"
        >
          {/* Clipboard body */}
          <rect 
            className="stat-icon-clipboard"
            x="4" y="4" width="16" height="17" rx="2"
            fill="currentColor"
            opacity="0.3"
          />
          {/* Clipboard header */}
          <rect 
            className="stat-icon-clipboard-header"
            x="8" y="2" width="8" height="4" rx="1"
            fill="currentColor"
            opacity="0.6"
          />
          {/* Checkmark that draws itself */}
          <path 
            className="stat-icon-checkmark"
            d="M8 12l3 3 5-6"
            stroke="#22c55e"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Success glow */}
          <circle 
            className="stat-icon-check-glow"
            cx="12" cy="13" r="5"
            fill="url(#checkGlow)"
          />
          <defs>
            <radialGradient id="checkGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      );
      
    case 'pending':
      return (
        <svg 
          ref={ref}
          width={size} 
          height={size} 
          viewBox="0 0 24 24" 
          fill="none"
          className={baseClass}
          aria-hidden="true"
        >
          {/* Hourglass frame */}
          <path 
            className="stat-icon-hourglass-frame"
            d="M6 2h12v4l-4 4 4 4v4H6v-4l4-4-4-4V2z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            opacity="0.6"
          />
          {/* Top sand */}
          <path 
            className="stat-icon-sand-top"
            d="M8 4h8v2l-3 3h-2L8 6V4z"
            fill="#f59e0b"
            opacity="0.8"
          />
          {/* Falling sand stream */}
          <rect 
            className="stat-icon-sand-stream"
            x="11.5" y="9" width="1" height="4" rx="0.5"
            fill="#f59e0b"
          />
          {/* Bottom sand pile */}
          <path 
            className="stat-icon-sand-bottom"
            d="M8 18v2h8v-2l-3-3h-2l-3 3z"
            fill="#f59e0b"
            opacity="0.6"
          />
          {/* Ambient glow */}
          <circle 
            className="stat-icon-pending-glow"
            cx="12" cy="12" r="6"
            fill="url(#pendingGlow)"
          />
          <defs>
            <radialGradient id="pendingGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      );
      
    default:
      return null;
  }
}

export default AnimatedStatIcon;
