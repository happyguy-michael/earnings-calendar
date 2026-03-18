'use client';

import { useState, useEffect, useRef, memo, useCallback, useMemo, CSSProperties } from 'react';
import { useMotionPreferences } from './MotionPreferences';

/**
 * SplitFlapTicker - Airport Departure Board Style Ticker Animation
 * 
 * Creates the classic split-flap display effect for stock ticker symbols,
 * evoking vintage train stations and airport departure boards. Each character
 * flips mechanically through the alphabet before landing on the target.
 * 
 * Inspiration:
 * - Solari boards at Grand Central Terminal
 * - Airport departure/arrival displays
 * - Bloomberg Terminal classic aesthetic
 * - "Mechanical nostalgia" trend in 2025-2026 UI design
 * - The satisfying clack of physical split-flap displays
 * 
 * Features:
 * - Full alphanumeric character set (A-Z, 0-9, space, symbols)
 * - Each slot flips independently with staggered timing
 * - Configurable "spin through" cycles before landing
 * - 3D CSS transforms with realistic perspective
 * - Optional shadow/reflection for depth
 * - Theme-aware colors (dark terminal style)
 * - Full prefers-reduced-motion support
 * - GPU-accelerated transforms
 * 
 * Perfect for:
 * - Stock ticker symbols (AAPL, MSFT, NVDA)
 * - Transitioning between filtered results
 * - Search result displays
 * - Any short text that benefits from mechanical reveal
 * 
 * @example
 * // Basic ticker
 * <SplitFlapTicker text="AAPL" />
 * 
 * // With spin effect and custom size
 * <SplitFlapTicker 
 *   text="NVDA" 
 *   spinCycles={2} 
 *   size="lg"
 *   stagger={80}
 * />
 * 
 * // Minimal variant for inline use
 * <SplitFlapTicker text="META" variant="minimal" size="sm" />
 */

// Character set for the split-flap display (in order they cycle through)
const CHARACTERS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-$%+'.split('');

// Get the index of a character in our set
function getCharIndex(char: string): number {
  const upper = char.toUpperCase();
  const index = CHARACTERS.indexOf(upper);
  return index >= 0 ? index : 0; // Default to space if not found
}

// Get the character at an index (with wrapping)
function getCharAt(index: number): string {
  return CHARACTERS[((index % CHARACTERS.length) + CHARACTERS.length) % CHARACTERS.length];
}

interface SplitFlapCharProps {
  targetChar: string;
  delay: number;
  spinCycles: number;
  flipDuration: number;
  onFlipComplete?: () => void;
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant: 'default' | 'minimal' | 'terminal' | 'light';
  reducedMotion: boolean;
}

const SplitFlapChar = memo(function SplitFlapChar({
  targetChar,
  delay,
  spinCycles,
  flipDuration,
  onFlipComplete,
  size,
  variant,
  reducedMotion,
}: SplitFlapCharProps) {
  const [currentChar, setCurrentChar] = useState(' ');
  const [nextChar, setNextChar] = useState(' ');
  const [isFlipping, setIsFlipping] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'landing' | 'done'>('idle');
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const targetIndexRef = useRef(getCharIndex(targetChar));
  const currentIndexRef = useRef(0);
  const cyclesLeftRef = useRef(spinCycles);
  const mountedRef = useRef(true);
  
  // Size mappings
  const sizeStyles: Record<typeof size, CSSProperties> = {
    xs: { fontSize: '12px', width: '14px', height: '18px', lineHeight: '18px' },
    sm: { fontSize: '16px', width: '18px', height: '24px', lineHeight: '24px' },
    md: { fontSize: '20px', width: '24px', height: '32px', lineHeight: '32px' },
    lg: { fontSize: '28px', width: '32px', height: '44px', lineHeight: '44px' },
    xl: { fontSize: '36px', width: '42px', height: '56px', lineHeight: '56px' },
  };

  // Variant styles
  const variantStyles: Record<typeof variant, { bg: string; text: string; border: string; shadow: string }> = {
    default: {
      bg: 'linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 45%, #000 55%, #0d0d0d 100%)',
      text: '#f0f0f0',
      border: '1px solid rgba(255,255,255,0.1)',
      shadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
    },
    terminal: {
      bg: 'linear-gradient(180deg, #0a1628 0%, #061018 45%, #030810 55%, #061018 100%)',
      text: '#00ff88',
      border: '1px solid rgba(0,255,136,0.2)',
      shadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 10px rgba(0,255,136,0.1)',
    },
    minimal: {
      bg: 'transparent',
      text: 'inherit',
      border: 'none',
      shadow: 'none',
    },
    light: {
      bg: 'linear-gradient(180deg, #f5f5f5 0%, #e8e8e8 45%, #ddd 55%, #e8e8e8 100%)',
      text: '#1a1a1a',
      border: '1px solid rgba(0,0,0,0.1)',
      shadow: '0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
    },
  };

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    targetIndexRef.current = getCharIndex(targetChar);
    currentIndexRef.current = 0;
    cyclesLeftRef.current = spinCycles;
    
    // Reduced motion: just show the target immediately
    if (reducedMotion) {
      setCurrentChar(targetChar.toUpperCase());
      setNextChar(targetChar.toUpperCase());
      setPhase('done');
      onFlipComplete?.();
      return;
    }

    // Start the animation after delay
    animationRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      setPhase('spinning');
      runFlipCycle();
    }, delay);

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [targetChar, delay, spinCycles, reducedMotion]);

  const runFlipCycle = useCallback(() => {
    if (!mountedRef.current) return;

    const targetIndex = targetIndexRef.current;
    const currentIndex = currentIndexRef.current;
    const cyclesLeft = cyclesLeftRef.current;

    // Calculate if we should stop
    const isAtTarget = currentIndex === targetIndex;
    const shouldStop = isAtTarget && cyclesLeft <= 0;

    if (shouldStop) {
      setPhase('done');
      setCurrentChar(getCharAt(targetIndex));
      setNextChar(getCharAt(targetIndex));
      onFlipComplete?.();
      return;
    }

    // Calculate next character
    let nextIndex = currentIndex + 1;
    if (nextIndex >= CHARACTERS.length) {
      nextIndex = 0;
      cyclesLeftRef.current--;
    }
    
    // Set up the flip
    setNextChar(getCharAt(nextIndex));
    setIsFlipping(true);

    // After flip animation
    animationRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      setCurrentChar(getCharAt(nextIndex));
      setIsFlipping(false);
      currentIndexRef.current = nextIndex;

      // Continue to next flip
      animationRef.current = setTimeout(() => {
        runFlipCycle();
      }, flipDuration * 0.2); // Small gap between flips
    }, flipDuration);
  }, [flipDuration, onFlipComplete]);

  const styles = sizeStyles[size];
  const colors = variantStyles[variant];

  return (
    <span
      className="split-flap-char"
      style={{
        display: 'inline-block',
        position: 'relative',
        width: styles.width,
        height: styles.height,
        perspective: '200px',
        fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
        fontWeight: 600,
        letterSpacing: '-0.02em',
      }}
    >
      {/* Background slot */}
      <span
        style={{
          position: 'absolute',
          inset: 0,
          background: colors.bg,
          borderRadius: '3px',
          border: colors.border,
          boxShadow: colors.shadow,
        }}
      />

      {/* Top half - shows current char */}
      <span
        className="split-flap-top"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '50%',
          overflow: 'hidden',
          borderRadius: '3px 3px 0 0',
          backfaceVisibility: 'hidden',
        }}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '200%',
            fontSize: styles.fontSize,
            color: colors.text,
          }}
        >
          {currentChar}
        </span>
      </span>

      {/* Top flip panel */}
      <span
        className="split-flap-top-flip"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '50%',
          overflow: 'hidden',
          borderRadius: '3px 3px 0 0',
          transformOrigin: 'bottom center',
          transform: isFlipping ? 'rotateX(-90deg)' : 'rotateX(0deg)',
          transition: `transform ${flipDuration}ms ease-in`,
          backfaceVisibility: 'hidden',
          background: colors.bg,
          zIndex: isFlipping ? 3 : 1,
        }}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '200%',
            fontSize: styles.fontSize,
            color: colors.text,
          }}
        >
          {currentChar}
        </span>
      </span>

      {/* Bottom half - shows next char */}
      <span
        className="split-flap-bottom"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '50%',
          overflow: 'hidden',
          borderRadius: '0 0 3px 3px',
          backfaceVisibility: 'hidden',
        }}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            width: '100%',
            height: '200%',
            fontSize: styles.fontSize,
            color: colors.text,
          }}
        >
          {nextChar}
        </span>
      </span>

      {/* Bottom flip panel (comes down after top flips) */}
      <span
        className="split-flap-bottom-flip"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '50%',
          overflow: 'hidden',
          borderRadius: '0 0 3px 3px',
          transformOrigin: 'top center',
          transform: isFlipping ? 'rotateX(90deg)' : 'rotateX(0deg)',
          transition: `transform ${flipDuration}ms ease-out`,
          transitionDelay: isFlipping ? `${flipDuration * 0.5}ms` : '0ms',
          backfaceVisibility: 'hidden',
          background: colors.bg,
          zIndex: isFlipping ? 2 : 0,
        }}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            width: '100%',
            height: '200%',
            fontSize: styles.fontSize,
            color: colors.text,
          }}
        >
          {nextChar}
        </span>
      </span>

      {/* Center divider line */}
      {variant !== 'minimal' && (
        <span
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            height: '1px',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 10,
            transform: 'translateY(-0.5px)',
          }}
        />
      )}
    </span>
  );
});

export interface SplitFlapTickerProps {
  /** The text to display (typically a ticker symbol like AAPL) */
  text: string;
  /** Maximum character slots to display */
  maxLength?: number;
  /** Number of full alphabet cycles before landing on target */
  spinCycles?: number;
  /** Duration of each flip in ms */
  flipDuration?: number;
  /** Delay between each character starting to flip (stagger) */
  stagger?: number;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Visual variant */
  variant?: 'default' | 'minimal' | 'terminal' | 'light';
  /** Gap between characters */
  gap?: number;
  /** Callback when all characters have finished flipping */
  onComplete?: () => void;
  /** Additional className */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
}

export function SplitFlapTicker({
  text,
  maxLength = 6,
  spinCycles = 1,
  flipDuration = 60,
  stagger = 50,
  size = 'md',
  variant = 'default',
  gap = 2,
  onComplete,
  className = '',
  style,
}: SplitFlapTickerProps) {
  const { shouldAnimate } = useMotionPreferences();
  const reducedMotion = !shouldAnimate('decorative');
  const completedRef = useRef(0);
  const prevTextRef = useRef(text);
  
  // Normalize and pad text
  const displayText = useMemo(() => {
    const normalized = text.toUpperCase().slice(0, maxLength);
    return normalized.padEnd(maxLength, ' ');
  }, [text, maxLength]);

  // Reset completion counter when text changes
  useEffect(() => {
    if (text !== prevTextRef.current) {
      completedRef.current = 0;
      prevTextRef.current = text;
    }
  }, [text]);

  const handleCharComplete = useCallback(() => {
    completedRef.current++;
    if (completedRef.current >= displayText.length) {
      onComplete?.();
    }
  }, [displayText.length, onComplete]);

  return (
    <span
      className={`split-flap-ticker ${className}`}
      style={{
        display: 'inline-flex',
        gap: `${gap}px`,
        ...style,
      }}
      role="text"
      aria-label={text}
    >
      {displayText.split('').map((char, index) => (
        <SplitFlapChar
          key={`${index}-${char}`}
          targetChar={char}
          delay={index * stagger}
          spinCycles={spinCycles}
          flipDuration={flipDuration}
          onFlipComplete={index === displayText.length - 1 ? handleCharComplete : undefined}
          size={size}
          variant={variant}
          reducedMotion={reducedMotion}
        />
      ))}
    </span>
  );
}

/**
 * SplitFlapText - Extended version for longer text (company names, etc.)
 */
export function SplitFlapText({
  text,
  spinCycles = 0, // No spin for longer text (too slow)
  flipDuration = 40,
  stagger = 30,
  size = 'sm',
  variant = 'minimal',
  gap = 1,
  className = '',
  style,
}: Omit<SplitFlapTickerProps, 'maxLength'>) {
  const { shouldAnimate } = useMotionPreferences();
  const reducedMotion = !shouldAnimate('decorative');
  
  const displayText = text.toUpperCase();

  return (
    <span
      className={`split-flap-text ${className}`}
      style={{
        display: 'inline-flex',
        flexWrap: 'wrap',
        gap: `${gap}px`,
        ...style,
      }}
      role="text"
      aria-label={text}
    >
      {displayText.split('').map((char, index) => (
        <SplitFlapChar
          key={`${index}-${char}`}
          targetChar={char}
          delay={index * stagger}
          spinCycles={spinCycles}
          flipDuration={flipDuration}
          size={size}
          variant={variant}
          reducedMotion={reducedMotion}
        />
      ))}
    </span>
  );
}

export default SplitFlapTicker;
