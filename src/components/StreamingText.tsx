'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface StreamingTextProps {
  text: string;
  /** Characters per second (default: 40) */
  speed?: number;
  /** Initial delay before starting (ms) */
  delay?: number;
  /** Randomize speed slightly for natural feel */
  humanize?: boolean;
  /** Show blinking cursor during/after typing */
  cursor?: boolean;
  /** Remove cursor after typing completes */
  cursorHideDelay?: number;
  /** Callback when typing completes */
  onComplete?: () => void;
  /** Skip animation if prefers-reduced-motion */
  respectMotionPreference?: boolean;
  /** Additional class names */
  className?: string;
  /** Render as different element */
  as?: 'span' | 'p' | 'div' | 'h1' | 'h2' | 'h3';
}

/**
 * StreamingText - AI-style typewriter effect
 * 
 * Inspired by modern AI chat interfaces (ChatGPT, Claude).
 * Makes text feel "generated" in real-time for narrative interfaces.
 * 
 * Features:
 * - Smooth character-by-character reveal
 * - Optional humanized timing (slight randomness)
 * - Blinking cursor that fades out after completion
 * - Respects prefers-reduced-motion
 * - Full light mode support
 * 
 * 2026 Trend: "Narrative Interfaces" - dashboards become stories
 */
export function StreamingText({
  text,
  speed = 40,
  delay = 0,
  humanize = true,
  cursor = true,
  cursorHideDelay = 1500,
  onComplete,
  respectMotionPreference = true,
  className = '',
  as: Component = 'span',
}: StreamingTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(cursor);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const indexRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startedRef = useRef(false);

  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Calculate interval between characters
  const getInterval = useCallback(() => {
    const baseInterval = 1000 / speed;
    if (!humanize) return baseInterval;
    
    // Add slight randomness for natural feel (±30%)
    const variance = baseInterval * 0.3;
    return baseInterval + (Math.random() * variance * 2 - variance);
  }, [speed, humanize]);

  // Type next character
  const typeNextChar = useCallback(() => {
    if (indexRef.current >= text.length) {
      setIsTyping(false);
      onComplete?.();
      
      // Hide cursor after delay
      if (cursorHideDelay > 0) {
        timeoutRef.current = setTimeout(() => {
          setShowCursor(false);
        }, cursorHideDelay);
      }
      return;
    }

    setDisplayedText(text.slice(0, indexRef.current + 1));
    indexRef.current += 1;

    // Schedule next character with humanized timing
    const interval = getInterval();
    timeoutRef.current = setTimeout(typeNextChar, interval);
  }, [text, getInterval, onComplete, cursorHideDelay]);

  // Start typing effect
  useEffect(() => {
    // Skip animation if reduced motion preferred
    if (respectMotionPreference && prefersReducedMotion) {
      setDisplayedText(text);
      setShowCursor(false);
      onComplete?.();
      return;
    }

    // Prevent double-start
    if (startedRef.current) return;
    startedRef.current = true;

    // Reset state
    indexRef.current = 0;
    setDisplayedText('');
    setIsTyping(true);
    setShowCursor(cursor);

    // Start after delay
    timeoutRef.current = setTimeout(() => {
      typeNextChar();
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, delay, typeNextChar, prefersReducedMotion, respectMotionPreference, cursor, onComplete]);

  // Reset when text changes
  useEffect(() => {
    startedRef.current = false;
  }, [text]);

  return (
    <Component className={`streaming-text ${isTyping ? 'typing' : ''} ${className}`}>
      {displayedText}
      {showCursor && (
        <span 
          className={`streaming-cursor ${isTyping ? 'blinking' : 'fade-out'}`}
          aria-hidden="true"
        >
          ▎
        </span>
      )}
    </Component>
  );
}

/**
 * StreamingWords - Word-by-word streaming (faster for longer text)
 */
export function StreamingWords({
  text,
  /** Words per second (default: 8) */
  speed = 8,
  delay = 0,
  humanize = true,
  cursor = true,
  cursorHideDelay = 1200,
  onComplete,
  respectMotionPreference = true,
  className = '',
  as: Component = 'span',
}: StreamingTextProps) {
  const words = text.split(' ');
  const [displayedWords, setDisplayedWords] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(cursor);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const indexRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
  }, []);

  const getInterval = useCallback(() => {
    const baseInterval = 1000 / speed;
    if (!humanize) return baseInterval;
    const variance = baseInterval * 0.25;
    return baseInterval + (Math.random() * variance * 2 - variance);
  }, [speed, humanize]);

  const typeNextWord = useCallback(() => {
    if (indexRef.current >= words.length) {
      setIsTyping(false);
      onComplete?.();
      if (cursorHideDelay > 0) {
        timeoutRef.current = setTimeout(() => setShowCursor(false), cursorHideDelay);
      }
      return;
    }

    setDisplayedWords(words.slice(0, indexRef.current + 1));
    indexRef.current += 1;
    timeoutRef.current = setTimeout(typeNextWord, getInterval());
  }, [words, getInterval, onComplete, cursorHideDelay]);

  useEffect(() => {
    if (respectMotionPreference && prefersReducedMotion) {
      setDisplayedWords(words);
      setShowCursor(false);
      onComplete?.();
      return;
    }

    if (startedRef.current) return;
    startedRef.current = true;

    indexRef.current = 0;
    setDisplayedWords([]);
    setIsTyping(true);
    setShowCursor(cursor);

    timeoutRef.current = setTimeout(typeNextWord, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [text, delay, typeNextWord, prefersReducedMotion, respectMotionPreference, cursor, words, onComplete]);

  useEffect(() => {
    startedRef.current = false;
  }, [text]);

  return (
    <Component className={`streaming-text streaming-words ${isTyping ? 'typing' : ''} ${className}`}>
      {displayedWords.map((word, i) => (
        <span key={i} className="streaming-word" style={{ animationDelay: `${i * 20}ms` }}>
          {word}{i < displayedWords.length - 1 ? ' ' : ''}
        </span>
      ))}
      {showCursor && (
        <span className={`streaming-cursor ${isTyping ? 'blinking' : 'fade-out'}`} aria-hidden="true">
          ▎
        </span>
      )}
    </Component>
  );
}

/**
 * StreamingParagraph - Combines StreamingWords with line-by-line reveal
 */
export function StreamingParagraph({
  text,
  speed = 10,
  delay = 0,
  className = '',
  onComplete,
}: Pick<StreamingTextProps, 'text' | 'speed' | 'delay' | 'className' | 'onComplete'>) {
  const lines = text.split('\n').filter(line => line.trim());
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [completedLines, setCompletedLines] = useState<Set<number>>(new Set());

  useEffect(() => {
    let currentDelay = delay;
    const timers: NodeJS.Timeout[] = [];

    lines.forEach((_, index) => {
      timers.push(setTimeout(() => {
        setVisibleLines(prev => [...prev, index]);
      }, currentDelay));
      currentDelay += 300; // Stagger line appearance
    });

    return () => timers.forEach(t => clearTimeout(t));
  }, [lines, delay]);

  const handleLineComplete = (index: number) => {
    setCompletedLines(prev => new Set([...prev, index]));
    if (index === lines.length - 1) {
      onComplete?.();
    }
  };

  return (
    <div className={`streaming-paragraph ${className}`}>
      {lines.map((line, i) => (
        <p key={i} className={`streaming-line ${visibleLines.includes(i) ? 'visible' : ''}`}>
          {visibleLines.includes(i) && (
            <StreamingWords
              text={line}
              speed={speed}
              cursor={!completedLines.has(i) && i === Math.max(...visibleLines)}
              cursorHideDelay={i === lines.length - 1 ? 1500 : 0}
              onComplete={() => handleLineComplete(i)}
            />
          )}
        </p>
      ))}
    </div>
  );
}

export default StreamingText;
