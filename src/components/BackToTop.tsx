'use client';

import { useState, useEffect, useCallback } from 'react';

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Show button when user scrolls down 400px
  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  return (
    <button
      onClick={scrollToTop}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`back-to-top ${isVisible ? 'visible' : ''} ${isHovering ? 'hovering' : ''}`}
      aria-label="Scroll to top"
    >
      <div className="back-to-top-glow" />
      <div className="back-to-top-icon">
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="arrow-icon"
        >
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </div>
      <div className="back-to-top-ripple" />
    </button>
  );
}
