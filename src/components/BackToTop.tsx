'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useHaptic } from './HapticFeedback';
import { useMotionPreferences } from './MotionPreferences';

// Mini confetti burst when reaching top
function ConfettiBurst({ active }: { active: boolean }) {
  if (!active) return null;
  
  return (
    <div className="confetti-burst" aria-hidden="true">
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="confetti-particle"
          style={{
            '--angle': `${(i * 30)}deg`,
            '--delay': `${i * 20}ms`,
            '--color': ['#3b82f6', '#22c55e', '#f59e0b', '#ec4899'][i % 4],
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const scrollTimeoutRef = useRef<number | null>(null);
  const wasScrollingToTopRef = useRef(false);
  const { trigger: haptic } = useHaptic();
  const { shouldAnimate } = useMotionPreferences();

  // Calculate scroll progress and visibility
  useEffect(() => {
    const updateScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      const progress = scrollHeight > 0 ? Math.min((currentScroll / scrollHeight) * 100, 100) : 0;
      
      setScrollProgress(progress);
      setIsVisible(currentScroll > 300);
      setIsScrolling(true);
      
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        cancelAnimationFrame(scrollTimeoutRef.current);
      }
      
      // Set scrolling to false after pause
      scrollTimeoutRef.current = requestAnimationFrame(() => {
        setTimeout(() => setIsScrolling(false), 150);
      });
      
      // Check if we reached the top after scrolling to top
      if (wasScrollingToTopRef.current && currentScroll < 50) {
        wasScrollingToTopRef.current = false;
        setShowCelebration(true);
        haptic('success');
        setTimeout(() => setShowCelebration(false), 800);
      }
    };

    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll(); // Initial calculation
    
    return () => {
      window.removeEventListener('scroll', updateScroll);
      if (scrollTimeoutRef.current) {
        cancelAnimationFrame(scrollTimeoutRef.current);
      }
    };
  }, [haptic]);

  const scrollToTop = useCallback(() => {
    // Haptic feedback on press
    haptic('medium');
    wasScrollingToTopRef.current = true;
    
    window.scrollTo({
      top: 0,
      behavior: shouldAnimate('decorative') ? 'smooth' : 'auto',
    });
  }, [haptic, shouldAnimate]);

  // Progress ring calculations
  const size = 52;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (scrollProgress / 100) * circumference;

  return (
    <button
      onClick={scrollToTop}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`back-to-top-v2 ${isVisible ? 'visible' : ''} ${isHovering ? 'hovering' : ''} ${isScrolling ? 'scrolling' : ''}`}
      aria-label={`Scroll to top (${Math.round(scrollProgress)}% scrolled)`}
      title={`${Math.round(scrollProgress)}% scrolled`}
    >
      {/* Ambient glow */}
      <div className="btt-glow" />
      
      {/* Progress ring */}
      <svg 
        className="btt-progress-ring" 
        width={size} 
        height={size}
        aria-hidden="true"
      >
        {/* Background track */}
        <circle
          className="btt-ring-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          className="btt-ring-progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
          }}
        />
      </svg>
      
      {/* Icon container with morphing animation */}
      <div className="btt-icon">
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="btt-arrow"
        >
          <path d="M18 15l-6-6-6 6" />
        </svg>
        
        {/* Percentage indicator (shows on hover) */}
        <span className="btt-percentage">
          {Math.round(scrollProgress)}%
        </span>
      </div>
      
      {/* Celebration confetti burst */}
      <ConfettiBurst active={showCelebration} />
      
      {/* Ripple effect on click */}
      <div className="btt-ripple" />
    </button>
  );
}
