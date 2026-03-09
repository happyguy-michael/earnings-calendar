'use client';

import { useEffect, useState, useRef } from 'react';

interface AnimatedEmptyStateProps {
  variant?: 'past' | 'future' | 'today';
  className?: string;
}

/**
 * AnimatedEmptyState - Premium empty state for days with no earnings
 * 
 * Features:
 * - Floating animation for the icon
 * - Different visuals for past/future/today
 * - Subtle particle effects
 * - Theme-aware styling
 */
export function AnimatedEmptyState({ variant = 'past', className = '' }: AnimatedEmptyStateProps) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const config = {
    past: {
      icon: 'clipboard-check',
      label: 'No reports',
      sublabel: 'Nothing scheduled',
      iconColor: 'var(--text-faint)',
      particleColor: 'rgba(113, 113, 122, 0.3)',
    },
    future: {
      icon: 'calendar-dots',
      label: 'Coming soon',
      sublabel: 'Check back later',
      iconColor: 'var(--accent-blue)',
      particleColor: 'rgba(59, 130, 246, 0.3)',
    },
    today: {
      icon: 'calendar-clock',
      label: 'No reports today',
      sublabel: 'Markets quiet',
      iconColor: 'var(--warning)',
      particleColor: 'rgba(245, 158, 11, 0.3)',
    },
  };

  const { icon, label, sublabel, iconColor, particleColor } = config[variant];

  return (
    <div 
      ref={containerRef}
      className={`empty-state-container ${mounted ? 'mounted' : ''} ${className}`}
      data-variant={variant}
    >
      {/* Floating particles */}
      <div className="empty-state-particles" aria-hidden="true">
        {[...Array(3)].map((_, i) => (
          <span 
            key={i} 
            className="empty-state-particle"
            style={{ 
              '--delay': `${i * 0.8}s`,
              '--x-offset': `${(i - 1) * 15}px`,
              backgroundColor: particleColor,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Animated icon */}
      <div className="empty-state-icon-wrapper" style={{ color: iconColor }}>
        {icon === 'clipboard-check' && (
          <svg className="empty-state-icon" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l2 2 4-4" className="empty-state-checkmark" />
          </svg>
        )}
        {icon === 'calendar-dots' && (
          <svg className="empty-state-icon" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            <circle cx="8" cy="14" r="1" fill="currentColor" className="empty-state-dot dot-1" />
            <circle cx="12" cy="14" r="1" fill="currentColor" className="empty-state-dot dot-2" />
            <circle cx="16" cy="14" r="1" fill="currentColor" className="empty-state-dot dot-3" />
          </svg>
        )}
        {icon === 'calendar-clock' && (
          <svg className="empty-state-icon" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            <circle cx="12" cy="14.5" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path strokeLinecap="round" d="M12 13v1.5l1 0.75" className="empty-state-clock-hand" />
          </svg>
        )}
        
        {/* Pulsing ring effect */}
        <div className="empty-state-pulse-ring" style={{ borderColor: particleColor }} />
      </div>

      {/* Text content */}
      <div className="empty-state-text">
        <span className="empty-state-label">{label}</span>
        <span className="empty-state-sublabel">{sublabel}</span>
      </div>
    </div>
  );
}

export default AnimatedEmptyState;
