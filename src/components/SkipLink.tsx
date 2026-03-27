'use client';

import { useCallback, useRef, useState } from 'react';

/**
 * SkipLink - Accessibility skip navigation link
 * 
 * Allows keyboard users to bypass repetitive content (header, navigation)
 * and jump directly to main content. Visually hidden until focused via Tab.
 * 
 * Features:
 * - Invisible by default, slides in when focused
 * - Smooth scroll to target element
 * - Visual feedback with gradient styling
 * - Proper focus management
 * - Respects reduced motion preferences
 * 
 * Usage:
 * <SkipLink targetId="main-content" />
 * ...
 * <main id="main-content">
 */

interface SkipLinkProps {
  /** ID of the element to skip to (without #) */
  targetId?: string;
  /** Custom label text */
  label?: string;
  /** Offset from top when scrolling (for sticky headers) */
  offsetTop?: number;
  /** Additional class name */
  className?: string;
}

export function SkipLink({
  targetId = 'main-content',
  label = 'Skip to main content',
  offsetTop = 120,
  className = '',
}: SkipLinkProps) {
  const [isVisible, setIsVisible] = useState(false);
  const linkRef = useRef<HTMLAnchorElement>(null);
  
  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    const target = document.getElementById(targetId);
    if (!target) return;
    
    // Scroll to target with offset for sticky header
    const targetPosition = target.getBoundingClientRect().top + window.scrollY - offsetTop;
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    window.scrollTo({
      top: targetPosition,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
    
    // Set focus to the target element for screen readers
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    
    // Remove tabindex after blur to not disrupt tab order
    target.addEventListener('blur', () => {
      target.removeAttribute('tabindex');
    }, { once: true });
  }, [targetId, offsetTop]);
  
  const handleFocus = useCallback(() => {
    setIsVisible(true);
  }, []);
  
  const handleBlur = useCallback(() => {
    setIsVisible(false);
  }, []);
  
  return (
    <a
      ref={linkRef}
      href={`#${targetId}`}
      onClick={handleClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={`skip-link ${isVisible ? 'skip-link-visible' : ''} ${className}`}
      aria-label={label}
    >
      <span className="skip-link-icon" aria-hidden="true">
        ↓
      </span>
      <span className="skip-link-text">{label}</span>
      <span className="skip-link-hint" aria-hidden="true">
        Enter
      </span>
    </a>
  );
}

/**
 * SkipLinks - Multiple skip links for complex page navigation
 * 
 * For pages with multiple landmark regions (main content, sidebar, footer)
 */

interface SkipTarget {
  id: string;
  label: string;
}

interface SkipLinksProps {
  targets: SkipTarget[];
  offsetTop?: number;
}

export function SkipLinks({ targets, offsetTop = 120 }: SkipLinksProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    
    const target = document.getElementById(targetId);
    if (!target) return;
    
    const targetPosition = target.getBoundingClientRect().top + window.scrollY - offsetTop;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    window.scrollTo({
      top: targetPosition,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
    
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    
    target.addEventListener('blur', () => {
      target.removeAttribute('tabindex');
    }, { once: true });
  }, [offsetTop]);
  
  const handleFocus = useCallback((index: number) => {
    setIsVisible(true);
    setFocusedIndex(index);
  }, []);
  
  const handleBlur = useCallback(() => {
    // Delay hiding to allow focus to move between links
    setTimeout(() => {
      const activeEl = document.activeElement;
      if (!activeEl?.closest('.skip-links-container')) {
        setIsVisible(false);
        setFocusedIndex(-1);
      }
    }, 10);
  }, []);
  
  return (
    <div 
      className={`skip-links-container ${isVisible ? 'skip-links-visible' : ''}`}
      role="navigation"
      aria-label="Skip links"
    >
      {targets.map((target, index) => (
        <a
          key={target.id}
          href={`#${target.id}`}
          onClick={(e) => handleClick(e, target.id)}
          onFocus={() => handleFocus(index)}
          onBlur={handleBlur}
          className={`skip-link-item ${focusedIndex === index ? 'skip-link-item-focused' : ''}`}
        >
          <span className="skip-link-number">{index + 1}</span>
          <span className="skip-link-text">{target.label}</span>
        </a>
      ))}
    </div>
  );
}

export default SkipLink;
