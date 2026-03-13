'use client';

import React, { useRef, useEffect, useState, ReactNode, CSSProperties } from 'react';

/**
 * BlurReveal - Premium text entrance animation with blur-to-clear transition
 * 
 * Inspired by Linear.app's hero animations. Text starts blurred, translated,
 * and faded, then reveals with a smooth spring-like transition on scroll-into-view.
 * 
 * Features:
 * - Word-by-word staggered reveal for headlines
 * - Single-element mode for paragraphs/badges
 * - Scroll-triggered via IntersectionObserver
 * - Configurable blur, distance, and timing
 * - Respects prefers-reduced-motion
 * - Light/dark mode compatible
 */

interface BlurRevealProps {
  /** Text to reveal (used when children is a string) */
  children: ReactNode;
  /** Split text into words for staggered reveal */
  splitWords?: boolean;
  /** Delay between each word (ms) */
  staggerDelay?: number;
  /** Initial blur amount (px) */
  blurAmount?: number;
  /** Initial Y offset (%) */
  yOffset?: number;
  /** Animation duration (ms) */
  duration?: number;
  /** Additional delay before animation starts (ms) */
  delay?: number;
  /** Trigger animation on mount vs scroll-into-view */
  triggerOnMount?: boolean;
  /** IntersectionObserver threshold (0-1) */
  threshold?: number;
  /** HTML tag to render */
  as?: React.ElementType;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Direction of reveal: 'up', 'down', 'left', 'right' */
  direction?: 'up' | 'down' | 'left' | 'right';
}

export function BlurReveal({
  children,
  splitWords = false,
  staggerDelay = 40,
  blurAmount = 12,
  yOffset = 25,
  duration = 700,
  delay = 0,
  triggerOnMount = false,
  threshold = 0.2,
  as: Tag = 'div',
  className = '',
  style,
  direction = 'up',
}: BlurRevealProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(triggerOnMount);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Trigger on mount if specified
  useEffect(() => {
    if (triggerOnMount) {
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [triggerOnMount, delay]);

  // IntersectionObserver for scroll-triggered reveal
  useEffect(() => {
    if (triggerOnMount || prefersReducedMotion) return;

    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add delay before triggering
            setTimeout(() => setIsVisible(true), delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [triggerOnMount, prefersReducedMotion, threshold, delay]);

  // Calculate transform based on direction
  const getTransform = () => {
    switch (direction) {
      case 'up': return `translateY(${yOffset}%)`;
      case 'down': return `translateY(-${yOffset}%)`;
      case 'left': return `translateX(${yOffset}%)`;
      case 'right': return `translateX(-${yOffset}%)`;
      default: return `translateY(${yOffset}%)`;
    }
  };

  // If reduced motion, render without animation
  if (prefersReducedMotion) {
    return (
      <Tag 
        ref={containerRef as React.RefObject<HTMLDivElement>}
        className={className} 
        style={style}
      >
        {children}
      </Tag>
    );
  }

  // If children is a string and splitWords is true, split into words
  if (splitWords && typeof children === 'string') {
    const words = children.split(' ');
    
    return (
      <Tag 
        ref={containerRef as React.RefObject<HTMLDivElement>}
        className={`blur-reveal-container ${className}`}
        style={style}
      >
        {words.map((word, index) => (
          <span key={index} className="blur-reveal-word-wrapper">
            <span
              className={`blur-reveal-word ${isVisible ? 'blur-reveal-visible' : ''}`}
              style={{
                '--blur-amount': `${blurAmount}px`,
                '--transform-hidden': getTransform(),
                '--duration': `${duration}ms`,
                '--delay': `${index * staggerDelay}ms`,
                '--easing': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
              } as CSSProperties}
            >
              {word}
            </span>
            {index < words.length - 1 && ' '}
          </span>
        ))}
      </Tag>
    );
  }

  // Single element mode
  return (
    <Tag 
      ref={containerRef as React.RefObject<HTMLDivElement>}
      className={`blur-reveal-single ${isVisible ? 'blur-reveal-visible' : ''} ${className}`}
      style={{
        '--blur-amount': `${blurAmount}px`,
        '--transform-hidden': getTransform(),
        '--duration': `${duration}ms`,
        '--delay': `${delay}ms`,
        '--easing': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        ...style,
      } as CSSProperties}
    >
      {children}
    </Tag>
  );
}

/**
 * BlurRevealHeading - Convenience component for headlines
 */
export function BlurRevealHeading({
  children,
  level = 1,
  ...props
}: Omit<BlurRevealProps, 'as'> & { level?: 1 | 2 | 3 | 4 | 5 | 6 }) {
  const Tag = `h${level}` as React.ElementType;
  return (
    <BlurReveal as={Tag} splitWords {...props}>
      {children}
    </BlurReveal>
  );
}

/**
 * BlurRevealParagraph - Convenience component for paragraphs
 */
export function BlurRevealParagraph({
  children,
  ...props
}: Omit<BlurRevealProps, 'as' | 'splitWords'>) {
  return (
    <BlurReveal as="p" splitWords={false} {...props}>
      {children}
    </BlurReveal>
  );
}

/**
 * BlurRevealGroup - Stagger multiple children with blur reveal
 */
export function BlurRevealGroup({
  children,
  staggerDelay = 100,
  ...props
}: Omit<BlurRevealProps, 'children'> & { children: ReactNode[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(props.triggerOnMount);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // IntersectionObserver for scroll-triggered reveal
  useEffect(() => {
    if (props.triggerOnMount || prefersReducedMotion) return;

    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => setIsVisible(true), props.delay || 0);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: props.threshold || 0.2 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [props.triggerOnMount, prefersReducedMotion, props.threshold, props.delay]);

  return (
    <div ref={containerRef} className={`blur-reveal-group ${props.className || ''}`}>
      {children.map((child, index) => (
        <div
          key={index}
          className={`blur-reveal-group-item ${isVisible ? 'blur-reveal-visible' : ''}`}
          style={{
            '--blur-amount': `${props.blurAmount || 12}px`,
            '--transform-hidden': `translateY(${props.yOffset || 25}%)`,
            '--duration': `${props.duration || 700}ms`,
            '--delay': `${index * staggerDelay}ms`,
            '--easing': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
          } as CSSProperties}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

export default BlurReveal;
