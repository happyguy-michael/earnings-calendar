'use client';

import { useState, useEffect, useRef } from 'react';

interface FlipMonthProps {
  month: string;
  year: number;
  className?: string;
}

/**
 * FlipMonth - Airport departure board style flip animation for month/year
 * 
 * When the month or year changes, characters flip down like a split-flap display.
 * Creates a premium, tactile feel for date navigation.
 * 
 * Features:
 * - Individual character flip animations
 * - Staggered timing for realistic effect
 * - Respects prefers-reduced-motion
 * - Theme-aware styling
 */
export function FlipMonth({ month, year, className = '' }: FlipMonthProps) {
  const [displayedText, setDisplayedText] = useState(`${month} ${year}`);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipIndices, setFlipIndices] = useState<number[]>([]);
  const prevTextRef = useRef(`${month} ${year}`);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }, []);

  useEffect(() => {
    const newText = `${month} ${year}`;
    const prevText = prevTextRef.current;

    if (newText === prevText) return;

    if (prefersReducedMotion.current) {
      setDisplayedText(newText);
      prevTextRef.current = newText;
      return;
    }

    // Find which characters need to flip
    const maxLen = Math.max(newText.length, prevText.length);
    const indices: number[] = [];
    
    for (let i = 0; i < maxLen; i++) {
      if (newText[i] !== prevText[i]) {
        indices.push(i);
      }
    }

    // Start flip animation
    setFlipIndices(indices);
    setIsFlipping(true);

    // Halfway through, update the text
    const halfwayTimeout = setTimeout(() => {
      setDisplayedText(newText);
    }, 150);

    // Complete animation
    const endTimeout = setTimeout(() => {
      setIsFlipping(false);
      setFlipIndices([]);
      prevTextRef.current = newText;
    }, 350);

    return () => {
      clearTimeout(halfwayTimeout);
      clearTimeout(endTimeout);
    };
  }, [month, year]);

  const characters = displayedText.split('');

  return (
    <span className={`flip-month ${className}`}>
      {characters.map((char, index) => {
        const shouldFlip = flipIndices.includes(index);
        const delay = flipIndices.indexOf(index) * 30; // Stagger effect

        return (
          <span
            key={`${index}-${displayedText}`}
            className={`flip-char ${shouldFlip && isFlipping ? 'flipping' : ''}`}
            style={{
              '--flip-delay': `${delay}ms`,
              display: 'inline-block',
            } as React.CSSProperties}
          >
            <span className="flip-char-inner">
              {char === ' ' ? '\u00A0' : char}
            </span>
          </span>
        );
      })}
    </span>
  );
}

export default FlipMonth;
