'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';

/**
 * TextScramble - Premium text reveal with character scrambling
 * 
 * A signature micro-interaction where text scrambles through random characters
 * before settling on the final value. Creates a sense of "data materializing"
 * and adds a high-end fintech feel to important data points.
 * 
 * Inspiration: Revolut, Robinhood, Linear, crypto dashboards, The New York Times
 * data visualizations, terminal-style reveals
 * 
 * Features:
 * - Character-by-character scramble animation
 * - Configurable scramble character sets (numeric, alpha, symbols, custom)
 * - Settles characters progressively from left to right
 * - Optional glow effect during scramble
 * - Triggers on mount, value change, or hover
 * - Respects prefers-reduced-motion
 * - Light/dark mode compatible
 * - Slot machine variant for countdowns
 * 
 * @example
 * // Basic usage
 * <TextScramble text="+15.2%" />
 * 
 * // Numeric scramble (for percentages/numbers)
 * <TextScramble text="$1,234.56" charset="numeric" />
 * 
 * // Trigger on hover
 * <TextScramble text="AAPL" trigger="hover" />
 * 
 * // Custom configuration
 * <TextScramble 
 *   text="+8.45%" 
 *   duration={800} 
 *   staggerDelay={30}
 *   glowColor="#22c55e"
 * />
 */

// Character set presets
const CHARSETS = {
  numeric: '0123456789',
  alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  symbols: '!@#$%^&*()[]{}|;:,.<>?',
  matrix: 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ',
  binary: '01',
  hex: '0123456789ABCDEF',
  finance: '0123456789$%+-.,',
};

type CharsetType = keyof typeof CHARSETS;

interface TextScrambleProps {
  /** Text to display after scramble animation */
  text: string;
  /** When to trigger the scramble animation */
  trigger?: 'mount' | 'change' | 'hover' | 'manual';
  /** Character set to use for scrambling */
  charset?: CharsetType | string;
  /** Total animation duration in ms */
  duration?: number;
  /** Delay between each character settling (ms) */
  staggerDelay?: number;
  /** Number of scramble cycles before settling */
  scrambleCycles?: number;
  /** Delay before starting animation (ms) */
  delay?: number;
  /** Glow color during scramble (CSS color) */
  glowColor?: string;
  /** Whether to show glow effect during scramble */
  showGlow?: boolean;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** External trigger for manual mode */
  active?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

export function TextScramble({
  text,
  trigger = 'mount',
  charset = 'alphanumeric',
  duration = 600,
  staggerDelay = 40,
  scrambleCycles = 8,
  delay = 0,
  glowColor = '#3b82f6',
  showGlow = true,
  onComplete,
  active,
  className = '',
  style,
}: TextScrambleProps) {
  const [displayText, setDisplayText] = useState(trigger === 'mount' ? '' : text);
  const [isScrambling, setIsScrambling] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const animationRef = useRef<number | null>(null);
  const prefersReducedMotion = useRef(false);
  const previousText = useRef(text);
  const hasAnimated = useRef(false);

  // Resolve charset
  const charsetString = useMemo(() => {
    if (charset in CHARSETS) {
      return CHARSETS[charset as CharsetType];
    }
    return charset;
  }, [charset]);

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      prefersReducedMotion.current = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
    }
  }, []);

  // Get random character from charset
  const getRandomChar = useCallback(
    (originalChar: string) => {
      // Preserve spaces and special characters that shouldn't scramble
      if (originalChar === ' ' || originalChar === ',' || originalChar === '.') {
        return originalChar;
      }
      return charsetString[Math.floor(Math.random() * charsetString.length)];
    },
    [charsetString]
  );

  // Core scramble animation
  const scramble = useCallback(() => {
    if (prefersReducedMotion.current) {
      setDisplayText(text);
      onComplete?.();
      return;
    }

    setIsScrambling(true);
    const chars = text.split('');
    const settledIndices = new Set<number>();
    const startTime = performance.now();
    const charDuration = duration / chars.length;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Calculate which characters should be settled
      const settleUpTo = Math.floor(progress * chars.length);

      // Build display string
      const newText = chars
        .map((char, index) => {
          // Already settled or should settle now
          if (index < settleUpTo || settledIndices.has(index)) {
            settledIndices.add(index);
            return char;
          }

          // Still scrambling
          // Add some randomness to when we show scramble vs original
          if (Math.random() > 0.3) {
            return getRandomChar(char);
          }
          return char;
        })
        .join('');

      setDisplayText(newText);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayText(text);
        setIsScrambling(false);
        onComplete?.();
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [text, duration, getRandomChar, onComplete]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Mount trigger
  useEffect(() => {
    if (trigger === 'mount' && !hasAnimated.current) {
      hasAnimated.current = true;
      const timer = setTimeout(scramble, delay);
      return () => clearTimeout(timer);
    }
  }, [trigger, delay, scramble]);

  // Change trigger
  useEffect(() => {
    if (trigger === 'change' && previousText.current !== text) {
      previousText.current = text;
      const timer = setTimeout(scramble, delay);
      return () => clearTimeout(timer);
    }
  }, [text, trigger, delay, scramble]);

  // Manual trigger
  useEffect(() => {
    if (trigger === 'manual' && active) {
      const timer = setTimeout(scramble, delay);
      return () => clearTimeout(timer);
    }
  }, [trigger, active, delay, scramble]);

  // Hover trigger
  useEffect(() => {
    if (trigger === 'hover' && isHovered && !isScrambling) {
      scramble();
    }
  }, [trigger, isHovered, isScrambling, scramble]);

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setIsHovered(false);
    }
  };

  return (
    <span
      className={`text-scramble ${isScrambling ? 'scrambling' : ''} ${className}`}
      style={{
        ...style,
        '--scramble-glow-color': showGlow ? glowColor : 'transparent',
      } as React.CSSProperties}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-text={text}
    >
      {displayText || text}

      <style jsx>{`
        .text-scramble {
          position: relative;
          display: inline-block;
          font-variant-numeric: tabular-nums;
          transition: color 0.15s ease;
        }

        .text-scramble.scrambling {
          color: var(--scramble-glow-color);
          text-shadow: 
            0 0 8px var(--scramble-glow-color),
            0 0 16px color-mix(in srgb, var(--scramble-glow-color) 50%, transparent);
          animation: scramble-flicker 0.1s ease-in-out infinite;
        }

        @keyframes scramble-flicker {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.95;
          }
        }

        /* Light mode adjustments */
        :global(html.light) .text-scramble.scrambling {
          text-shadow: 
            0 0 6px var(--scramble-glow-color),
            0 0 12px color-mix(in srgb, var(--scramble-glow-color) 40%, transparent);
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .text-scramble.scrambling {
            animation: none;
            text-shadow: none;
          }
        }
      `}</style>
    </span>
  );
}

/**
 * ScrambleNumber - Specialized text scramble for numeric values
 * 
 * Pre-configured with numeric charset and finance-optimized settings.
 * Perfect for percentages, prices, and statistics.
 */
interface ScrambleNumberProps extends Omit<TextScrambleProps, 'charset'> {
  /** Whether to include currency/percentage symbols in scramble */
  includeSymbols?: boolean;
}

export function ScrambleNumber({
  includeSymbols = true,
  ...props
}: ScrambleNumberProps) {
  return (
    <TextScramble
      {...props}
      charset={includeSymbols ? 'finance' : 'numeric'}
      duration={props.duration ?? 500}
    />
  );
}

/**
 * ScrambleTicker - Specialized text scramble for stock tickers
 * 
 * Uses alpha charset and shorter duration for snappy reveals.
 */
export function ScrambleTicker(props: Omit<TextScrambleProps, 'charset'>) {
  return (
    <TextScramble
      {...props}
      charset="alpha"
      duration={props.duration ?? 400}
      showGlow={props.showGlow ?? false}
    />
  );
}

/**
 * ScrambleSlot - Slot machine style scramble for single characters
 * 
 * Perfect for countdown timers and single-digit displays.
 * Creates a "spinning" effect like a mechanical counter.
 */
interface ScrambleSlotProps {
  /** Single character to display */
  char: string;
  /** Animation duration */
  duration?: number;
  /** Delay before animation */
  delay?: number;
  /** Glow color */
  glowColor?: string;
  /** Additional className */
  className?: string;
}

export function ScrambleSlot({
  char,
  duration = 300,
  delay = 0,
  glowColor = '#f59e0b',
  className = '',
}: ScrambleSlotProps) {
  const [displayChar, setDisplayChar] = useState(char);
  const [isSpinning, setIsSpinning] = useState(false);
  const previousChar = useRef(char);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (previousChar.current === char) return;
    previousChar.current = char;

    // Check reduced motion
    if (typeof window !== 'undefined') {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setDisplayChar(char);
        return;
      }
    }

    const timeoutId = setTimeout(() => {
      setIsSpinning(true);
      const startTime = performance.now();
      const digits = '0123456789';

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (progress < 1) {
          // Spin through random digits
          setDisplayChar(digits[Math.floor(Math.random() * 10)]);
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setDisplayChar(char);
          setIsSpinning(false);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [char, duration, delay]);

  return (
    <span
      className={`scramble-slot ${isSpinning ? 'spinning' : ''} ${className}`}
      style={{ '--slot-glow': glowColor } as React.CSSProperties}
    >
      {displayChar}

      <style jsx>{`
        .scramble-slot {
          display: inline-block;
          min-width: 0.6em;
          text-align: center;
          font-variant-numeric: tabular-nums;
          transition: transform 0.1s ease;
        }

        .scramble-slot.spinning {
          color: var(--slot-glow);
          text-shadow: 0 0 8px var(--slot-glow);
          animation: slot-blur 0.08s ease-in-out infinite;
        }

        @keyframes slot-blur {
          0%, 100% {
            filter: blur(0);
            transform: translateY(0);
          }
          50% {
            filter: blur(0.5px);
            transform: translateY(-1px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .scramble-slot.spinning {
            animation: none;
            filter: none;
          }
        }
      `}</style>
    </span>
  );
}

/**
 * ScrambleGroup - Animate a group of slots for countdown displays
 */
interface ScrambleGroupProps {
  /** The text to display */
  text: string;
  /** Stagger delay between each character */
  staggerDelay?: number;
  /** Per-character duration */
  duration?: number;
  /** Glow color */
  glowColor?: string;
  /** Additional className */
  className?: string;
}

export function ScrambleGroup({
  text,
  staggerDelay = 50,
  duration = 300,
  glowColor = '#f59e0b',
  className = '',
}: ScrambleGroupProps) {
  return (
    <span className={`scramble-group ${className}`}>
      {text.split('').map((char, index) => (
        <ScrambleSlot
          key={`${index}-${char}`}
          char={char}
          duration={duration}
          delay={index * staggerDelay}
          glowColor={glowColor}
        />
      ))}

      <style jsx>{`
        .scramble-group {
          display: inline-flex;
          font-variant-numeric: tabular-nums;
        }
      `}</style>
    </span>
  );
}

export default TextScramble;
