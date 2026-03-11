'use client';

import { useState, useEffect } from 'react';
import { useToast } from './Toast';
import { useAudioFeedback } from './AudioFeedback';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { showToast } = useToast();
  const { play: playAudio } = useAudioFeedback();

  // Only run on client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
      setIsDark(false);
      document.documentElement.classList.add('light');
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    playAudio('toggle');
    
    if (newIsDark) {
      document.documentElement.classList.remove('light');
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
      showToast('Dark mode enabled', { type: 'info', icon: '🌙', duration: 2000 });
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      showToast('Light mode enabled', { type: 'info', icon: '☀️', duration: 2000 });
    }
  };

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <button
        className="theme-toggle"
        aria-label="Toggle theme"
        disabled
      >
        <div className="theme-toggle-track">
          <div className="theme-toggle-thumb" />
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle ${isDark ? 'dark' : 'light'}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="theme-toggle-track">
        {/* Sun icon */}
        <svg 
          className="theme-icon theme-icon-sun" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
        
        {/* Moon icon */}
        <svg 
          className="theme-icon theme-icon-moon" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
        
        {/* Animated thumb with stars */}
        <div className="theme-toggle-thumb">
          <div className="theme-stars">
            <span className="star star-1" />
            <span className="star star-2" />
            <span className="star star-3" />
          </div>
          <div className="theme-crater crater-1" />
          <div className="theme-crater crater-2" />
        </div>
      </div>
    </button>
  );
}
