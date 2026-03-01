'use client';

import { useState, useEffect, useCallback } from 'react';

interface AnimatedPlaceholderProps {
  examples: string[];
  prefix?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}

/**
 * Animated typewriter placeholder that cycles through example search terms.
 * Shows users what they can search for while adding visual polish.
 */
export function useAnimatedPlaceholder({
  examples,
  prefix = 'Search ',
  typingSpeed = 80,
  deletingSpeed = 40,
  pauseDuration = 2000,
}: AnimatedPlaceholderProps) {
  const [placeholder, setPlaceholder] = useState(prefix + examples[0] + '...');
  const [exampleIndex, setExampleIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(examples[0].length);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(true);

  const updatePlaceholder = useCallback(() => {
    const currentExample = examples[exampleIndex];
    
    if (isPaused) {
      // After pause, start deleting
      setIsPaused(false);
      setIsDeleting(true);
      return;
    }

    if (isDeleting) {
      if (charIndex > 0) {
        // Delete one character
        setCharIndex(charIndex - 1);
        setPlaceholder(prefix + currentExample.slice(0, charIndex - 1) + '|');
      } else {
        // Done deleting, move to next example
        setIsDeleting(false);
        setExampleIndex((exampleIndex + 1) % examples.length);
      }
    } else {
      const nextExample = examples[(exampleIndex) % examples.length];
      if (charIndex < nextExample.length) {
        // Type one character
        setCharIndex(charIndex + 1);
        setPlaceholder(prefix + nextExample.slice(0, charIndex + 1) + '|');
      } else {
        // Done typing, pause then delete
        setPlaceholder(prefix + nextExample + '...');
        setIsPaused(true);
      }
    }
  }, [examples, exampleIndex, charIndex, isDeleting, isPaused, prefix]);

  useEffect(() => {
    // Respect reduced motion preference
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPlaceholder(prefix + examples[0] + '...');
      return;
    }

    const speed = isPaused 
      ? pauseDuration 
      : isDeleting 
        ? deletingSpeed 
        : typingSpeed;

    const timer = setTimeout(updatePlaceholder, speed);
    return () => clearTimeout(timer);
  }, [updatePlaceholder, isPaused, isDeleting, typingSpeed, deletingSpeed, pauseDuration]);

  // Return placeholder without cursor when paused (showing full text)
  return placeholder;
}

/**
 * Pre-configured hook for earnings search
 */
export function useEarningsSearchPlaceholder() {
  const examples = [
    'NVDA',
    'Apple',
    'Tesla',
    'Microsoft',
    'AMZN',
    'Meta',
    'AMD',
    'GOOGL',
  ];

  return useAnimatedPlaceholder({
    examples,
    prefix: 'Search ',
    typingSpeed: 70,
    deletingSpeed: 35,
    pauseDuration: 2500,
  });
}
