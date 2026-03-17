'use client';

import { useState, useEffect, useRef, useMemo, memo, useCallback } from 'react';

/**
 * TextMorph - Smooth character-level morphing text animation
 * 
 * A premium micro-interaction where text smoothly morphs from one value to another.
 * Characters animate individually - shared characters slide to new positions while
 * unique characters fade in/out. Creates a "liquid" flowing text effect.
 * 
 * Inspiration:
 * - Magic UI text morph component
 * - Apple's smooth text transitions  
 * - Stripe dashboard status changes
 * - Linear.app interface animations
 * - 2026 "Fluid Typography" trend
 * 
 * Features:
 * - FLIP-style character position animations
 * - Shared characters slide smoothly to new positions
 * - New characters fade/scale in, old ones fade/scale out
 * - Configurable easing, duration, and stagger
 * - Optional blur effect during transition
 * - Works with any text content
 * - Respects prefers-reduced-motion
 * - Light/dark mode compatible
 * 
 * @example
 * // Basic usage - morphs when text changes
 * <TextMorph text={status} />
 * 
 * // Status change
 * <TextMorph 
 *   text={isReported ? "Reported" : "Pending"} 
 *   duration={600}
 * />
 * 
 * // With custom styling
 * <TextMorph 
 *   text={tickerSymbol}
 *   className="text-2xl font-bold"
 *   staggerDelay={30}
 * />
 */

interface TextMorphProps {
  /** Current text to display */
  text: string;
  /** Animation duration in ms */
  duration?: number;
  /** Delay between each character starting its animation */
  staggerDelay?: number;
  /** Easing function for the animation */
  easing?: string;
  /** Whether to add blur effect during morph */
  blur?: boolean;
  /** Blur amount in pixels */
  blurAmount?: number;
  /** Additional class name for the container */
  className?: string;
  /** Callback when morph animation completes */
  onMorphComplete?: () => void;
  /** Whether component is in view (for Intersection Observer integration) */
  inView?: boolean;
}

interface CharacterState {
  char: string;
  key: string;
  fromX: number;
  toX: number;
  isEntering: boolean;
  isLeaving: boolean;
  isShared: boolean;
  index: number;
}

// Generate a unique key for each character position
const generateCharKey = (char: string, index: number, instanceId: number): string => {
  return `${instanceId}-${char}-${index}`;
};

// Find character matches between old and new text using LCS-like approach
const findCharacterMappings = (
  oldText: string,
  newText: string
): Map<number, number> => {
  const mappings = new Map<number, number>();
  const usedNewIndices = new Set<number>();
  
  // First pass: exact position matches
  for (let i = 0; i < Math.min(oldText.length, newText.length); i++) {
    if (oldText[i] === newText[i] && !usedNewIndices.has(i)) {
      mappings.set(i, i);
      usedNewIndices.add(i);
    }
  }
  
  // Second pass: find closest unused matches
  for (let oldIdx = 0; oldIdx < oldText.length; oldIdx++) {
    if (mappings.has(oldIdx)) continue;
    
    const char = oldText[oldIdx];
    let closestNewIdx = -1;
    let closestDistance = Infinity;
    
    for (let newIdx = 0; newIdx < newText.length; newIdx++) {
      if (usedNewIndices.has(newIdx)) continue;
      if (newText[newIdx] !== char) continue;
      
      const distance = Math.abs(newIdx - oldIdx);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestNewIdx = newIdx;
      }
    }
    
    if (closestNewIdx !== -1) {
      mappings.set(oldIdx, closestNewIdx);
      usedNewIndices.add(closestNewIdx);
    }
  }
  
  return mappings;
};

const TextMorph = memo(function TextMorph({
  text,
  duration = 500,
  staggerDelay = 25,
  easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
  blur = true,
  blurAmount = 4,
  className = '',
  onMorphComplete,
  inView = true,
}: TextMorphProps) {
  const [displayedText, setDisplayedText] = useState(text);
  const [isMorphing, setIsMorphing] = useState(false);
  const [characters, setCharacters] = useState<CharacterState[]>([]);
  const containerRef = useRef<HTMLSpanElement>(null);
  const prevTextRef = useRef(text);
  const instanceIdRef = useRef(0);
  const charWidthCacheRef = useRef<Map<string, number>>(new Map());
  const measureRef = useRef<HTMLSpanElement>(null);

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Measure character width
  const measureCharWidth = useCallback((char: string): number => {
    if (charWidthCacheRef.current.has(char)) {
      return charWidthCacheRef.current.get(char)!;
    }
    
    if (measureRef.current) {
      measureRef.current.textContent = char === ' ' ? '\u00A0' : char;
      const width = measureRef.current.getBoundingClientRect().width;
      charWidthCacheRef.current.set(char, width);
      return width;
    }
    
    // Fallback: estimate based on character type
    return char === ' ' ? 6 : 10;
  }, []);

  // Calculate cumulative positions for text
  const calculatePositions = useCallback((str: string): number[] => {
    const positions: number[] = [];
    let cumulative = 0;
    
    for (let i = 0; i < str.length; i++) {
      positions.push(cumulative);
      cumulative += measureCharWidth(str[i]);
    }
    
    return positions;
  }, [measureCharWidth]);

  // Handle text changes
  useEffect(() => {
    if (text === prevTextRef.current || !inView) {
      prevTextRef.current = text;
      return;
    }

    if (prefersReducedMotion) {
      setDisplayedText(text);
      prevTextRef.current = text;
      return;
    }

    const oldText = prevTextRef.current;
    const newText = text;
    instanceIdRef.current++;
    const currentInstance = instanceIdRef.current;

    // Get character mappings
    const mappings = findCharacterMappings(oldText, newText);
    const reverseMappings = new Map<number, number>();
    mappings.forEach((newIdx, oldIdx) => {
      reverseMappings.set(newIdx, oldIdx);
    });

    // Calculate positions
    const oldPositions = calculatePositions(oldText);
    const newPositions = calculatePositions(newText);

    // Build character states
    const charStates: CharacterState[] = [];
    
    // Characters from old text (leaving or shared)
    for (let i = 0; i < oldText.length; i++) {
      const newIdx = mappings.get(i);
      const isShared = newIdx !== undefined;
      
      charStates.push({
        char: oldText[i],
        key: generateCharKey(oldText[i], i, currentInstance) + '-old',
        fromX: oldPositions[i],
        toX: isShared ? newPositions[newIdx] : oldPositions[i],
        isEntering: false,
        isLeaving: !isShared,
        isShared,
        index: i,
      });
    }
    
    // New characters (entering)
    for (let i = 0; i < newText.length; i++) {
      if (reverseMappings.has(i)) continue; // Already handled as shared
      
      charStates.push({
        char: newText[i],
        key: generateCharKey(newText[i], i, currentInstance) + '-new',
        fromX: newPositions[i],
        toX: newPositions[i],
        isEntering: true,
        isLeaving: false,
        isShared: false,
        index: i + oldText.length, // For stagger ordering
      });
    }

    setCharacters(charStates);
    setIsMorphing(true);

    // Calculate total animation time
    const maxStagger = charStates.length * staggerDelay;
    const totalDuration = duration + maxStagger;

    // Complete the morph
    const timer = setTimeout(() => {
      if (instanceIdRef.current === currentInstance) {
        setDisplayedText(newText);
        setIsMorphing(false);
        setCharacters([]);
        prevTextRef.current = newText;
        onMorphComplete?.();
      }
    }, totalDuration);

    return () => clearTimeout(timer);
  }, [text, inView, prefersReducedMotion, duration, staggerDelay, calculatePositions, onMorphComplete]);

  // Initial render
  useEffect(() => {
    setDisplayedText(text);
    prevTextRef.current = text;
  }, []);

  return (
    <>
      {/* Hidden measurement element */}
      <span
        ref={measureRef}
        aria-hidden="true"
        className={className}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          whiteSpace: 'pre',
          pointerEvents: 'none',
        }}
      />
      
      {/* Main container */}
      <span
        ref={containerRef}
        className={`text-morph-container ${className}`}
        style={{
          display: 'inline-block',
          position: 'relative',
          whiteSpace: 'pre',
        }}
      >
        {/* During morph: show animated characters */}
        {isMorphing && characters.length > 0 ? (
          <span
            style={{
              display: 'inline-block',
              position: 'relative',
            }}
          >
            {characters.map((char, idx) => {
              const stagger = idx * staggerDelay;
              
              return (
                <span
                  key={char.key}
                  className={`text-morph-char ${
                    char.isEntering ? 'entering' : ''
                  } ${char.isLeaving ? 'leaving' : ''} ${
                    char.isShared ? 'shared' : ''
                  }`}
                  style={{
                    position: 'absolute',
                    left: 0,
                    display: 'inline-block',
                    whiteSpace: 'pre',
                    transform: `translateX(${char.fromX}px)`,
                    animation: char.isShared 
                      ? `textMorphSlide ${duration}ms ${easing} ${stagger}ms forwards`
                      : char.isEntering
                        ? `textMorphEnter ${duration}ms ${easing} ${stagger}ms forwards`
                        : `textMorphLeave ${duration}ms ${easing} ${stagger}ms forwards`,
                    // @ts-expect-error CSS custom properties
                    '--morph-to-x': `${char.toX}px`,
                    '--morph-blur': blur ? `${blurAmount}px` : '0px',
                    willChange: 'transform, opacity, filter',
                  }}
                >
                  {char.char === ' ' ? '\u00A0' : char.char}
                </span>
              );
            })}
            {/* Invisible spacer to maintain container width */}
            <span style={{ visibility: 'hidden' }}>
              {text.replace(/ /g, '\u00A0')}
            </span>
          </span>
        ) : (
          // Static text when not morphing
          <span>{displayedText.replace(/ /g, '\u00A0')}</span>
        )}
      </span>

      {/* Scoped styles */}
      <style jsx>{`
        @keyframes textMorphSlide {
          0% {
            transform: translateX(var(--morph-from-x, 0));
            filter: blur(0px);
          }
          40% {
            filter: blur(var(--morph-blur));
          }
          60% {
            filter: blur(var(--morph-blur));
          }
          100% {
            transform: translateX(var(--morph-to-x));
            filter: blur(0px);
          }
        }
        
        @keyframes textMorphEnter {
          0% {
            opacity: 0;
            transform: translateX(var(--morph-to-x)) scale(0.8);
            filter: blur(var(--morph-blur));
          }
          100% {
            opacity: 1;
            transform: translateX(var(--morph-to-x)) scale(1);
            filter: blur(0px);
          }
        }
        
        @keyframes textMorphLeave {
          0% {
            opacity: 1;
            transform: translateX(var(--morph-from-x, 0)) scale(1);
            filter: blur(0px);
          }
          100% {
            opacity: 0;
            transform: translateX(var(--morph-from-x, 0)) scale(0.8);
            filter: blur(var(--morph-blur));
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .text-morph-char {
            animation: none !important;
            transition: opacity 150ms ease !important;
          }
          .text-morph-char.entering {
            opacity: 1;
          }
          .text-morph-char.leaving {
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
});

/**
 * TextMorphCycle - Auto-cycling text morph through multiple values
 * 
 * @example
 * <TextMorphCycle 
 *   texts={["Beat", "Miss", "Meet"]} 
 *   interval={2000}
 * />
 */
interface TextMorphCycleProps extends Omit<TextMorphProps, 'text'> {
  /** Array of texts to cycle through */
  texts: string[];
  /** Interval between morphs in ms */
  interval?: number;
  /** Whether to pause cycling on hover */
  pauseOnHover?: boolean;
}

export const TextMorphCycle = memo(function TextMorphCycle({
  texts,
  interval = 3000,
  pauseOnHover = true,
  ...morphProps
}: TextMorphCycleProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || texts.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length);
    }, interval);

    return () => clearInterval(timer);
  }, [texts.length, interval, isPaused]);

  return (
    <span
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <TextMorph text={texts[currentIndex]} {...morphProps} />
    </span>
  );
});

/**
 * TextMorphStatus - Specialized morph for status changes
 * 
 * Adds semantic colors and icons for status transitions.
 * 
 * @example
 * <TextMorphStatus 
 *   status="beat"
 *   previousStatus="pending"
 * />
 */
interface TextMorphStatusProps extends Omit<TextMorphProps, 'text'> {
  /** Current status */
  status: 'pending' | 'beat' | 'miss' | 'meet' | 'reported';
  /** Optional: show status icon */
  showIcon?: boolean;
}

const STATUS_CONFIG = {
  pending: { text: 'Pending', color: 'text-yellow-500 dark:text-yellow-400', icon: '⏳' },
  beat: { text: 'Beat', color: 'text-green-500 dark:text-green-400', icon: '📈' },
  miss: { text: 'Miss', color: 'text-red-500 dark:text-red-400', icon: '📉' },
  meet: { text: 'Meet', color: 'text-blue-500 dark:text-blue-400', icon: '➡️' },
  reported: { text: 'Reported', color: 'text-slate-500 dark:text-slate-400', icon: '✓' },
};

export const TextMorphStatus = memo(function TextMorphStatus({
  status,
  showIcon = false,
  className = '',
  ...morphProps
}: TextMorphStatusProps) {
  const config = STATUS_CONFIG[status];
  
  return (
    <span className={`inline-flex items-center gap-1 ${config.color} ${className}`}>
      {showIcon && <span>{config.icon}</span>}
      <TextMorph text={config.text} {...morphProps} />
    </span>
  );
});

export default TextMorph;
