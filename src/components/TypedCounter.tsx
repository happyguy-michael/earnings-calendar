'use client';

import { useState, useEffect, useRef, memo, ReactNode, CSSProperties } from 'react';

/**
 * TypedCounter - Terminal-style number display with typing effect
 * 
 * Numbers appear character by character like being typed on a terminal,
 * with a blinking cursor that follows. Creates a techy "hacker" aesthetic
 * that's distinct from slot-machine (NumberRoller) or smooth (CountUp) animations.
 * 
 * Inspiration:
 * - Terminal/CLI interfaces
 * - Hacker movie aesthetics (digits appearing one by one)
 * - 2026 trend: "Neo-Brutalist" and "Techy" design
 * - Mr. Robot / Matrix-style number reveals
 * 
 * Features:
 * - Character-by-character reveal with configurable speed
 * - Blinking cursor that follows the text
 * - Optional "scramble before settle" effect
 * - Prefix/suffix support
 * - Sound effect integration (optional click per digit)
 * - Respects prefers-reduced-motion
 * - Full light/dark mode support
 * 
 * @example
 * <TypedCounter value={1234} typingSpeed={80} showCursor />
 * 
 * @example
 * <TypedCounter 
 *   value={stats.total} 
 *   prefix="Total: " 
 *   scrambleEffect 
 *   onComplete={() => console.log('done')}
 * />
 */

interface TypedCounterProps {
  /** The number to display */
  value: number | string;
  /** Milliseconds per character */
  typingSpeed?: number;
  /** Show blinking cursor */
  showCursor?: boolean;
  /** Cursor character */
  cursorChar?: string;
  /** Prefix text (typed before number) */
  prefix?: string;
  /** Suffix text (typed after number) */
  suffix?: string;
  /** Scramble random digits before settling on final value */
  scrambleEffect?: boolean;
  /** Number of scramble iterations per character */
  scrambleIterations?: number;
  /** Callback when typing completes */
  onComplete?: () => void;
  /** Delay before starting */
  delay?: number;
  /** Re-type animation when value changes */
  animateOnChange?: boolean;
  /** Format number with commas */
  formatNumber?: boolean;
  /** Custom className */
  className?: string;
  /** Custom style */
  style?: CSSProperties;
  /** Font style: 'mono' for monospace, 'inherit' for parent font */
  fontStyle?: 'mono' | 'inherit';
  /** Trigger haptic on each character (if available) */
  hapticFeedback?: boolean;
}

// Random digit generator for scramble effect
const randomDigit = () => Math.floor(Math.random() * 10).toString();
const randomChar = (original: string) => {
  if (/\d/.test(original)) return randomDigit();
  if (/[a-zA-Z]/.test(original)) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return chars[Math.floor(Math.random() * chars.length)];
  }
  return original; // Keep punctuation as-is
};

function TypedCounterComponent({
  value,
  typingSpeed = 60,
  showCursor = true,
  cursorChar = '█',
  prefix = '',
  suffix = '',
  scrambleEffect = false,
  scrambleIterations = 3,
  onComplete,
  delay = 0,
  animateOnChange = true,
  formatNumber = true,
  className = '',
  style,
  fontStyle = 'mono',
  hapticFeedback = false,
}: TypedCounterProps) {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCursorBlink, setShowCursorBlink] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const prevValueRef = useRef<string | number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);

  // Format the value
  const formatValue = (v: number | string): string => {
    if (typeof v === 'number' && formatNumber) {
      return v.toLocaleString('en-US');
    }
    return String(v);
  };

  // Full text to type
  const fullText = `${prefix}${formatValue(value)}${suffix}`;

  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Typing animation
  useEffect(() => {
    // Skip animation if reduced motion or if value hasn't changed (and not initial)
    if (prefersReducedMotion) {
      setDisplayText(fullText);
      setIsTyping(false);
      return;
    }

    // Check if we should animate
    const shouldAnimate = prevValueRef.current === null || 
      (animateOnChange && prevValueRef.current !== value);
    
    if (!shouldAnimate) {
      setDisplayText(fullText);
      return;
    }

    prevValueRef.current = value;

    // Clear any existing animation
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    // Start typing after delay
    timeoutRef.current = setTimeout(() => {
      setIsTyping(true);
      setDisplayText('');
      
      let charIndex = 0;
      let scrambleCount = 0;
      
      const typeNextChar = () => {
        if (charIndex >= fullText.length) {
          setIsTyping(false);
          onComplete?.();
          return;
        }

        const currentChar = fullText[charIndex];
        
        if (scrambleEffect && scrambleCount < scrambleIterations) {
          // Show scrambled character
          const scrambled = fullText
            .slice(0, charIndex)
            .concat(randomChar(currentChar));
          setDisplayText(scrambled);
          scrambleCount++;
          
          // Haptic feedback for scramble
          if (hapticFeedback && navigator.vibrate) {
            navigator.vibrate(5);
          }
          
          timeoutRef.current = setTimeout(typeNextChar, typingSpeed / scrambleIterations);
        } else {
          // Show actual character
          setDisplayText(fullText.slice(0, charIndex + 1));
          charIndex++;
          scrambleCount = 0;
          
          // Haptic feedback for final character
          if (hapticFeedback && navigator.vibrate) {
            navigator.vibrate(10);
          }
          
          if (charIndex < fullText.length) {
            timeoutRef.current = setTimeout(typeNextChar, typingSpeed);
          } else {
            setIsTyping(false);
            onComplete?.();
          }
        }
      };

      typeNextChar();
    }, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [value, fullText, typingSpeed, delay, scrambleEffect, scrambleIterations, 
      onComplete, prefersReducedMotion, animateOnChange, hapticFeedback]);

  // Cursor blink effect
  useEffect(() => {
    if (!showCursor || !isTyping) return;
    
    const interval = setInterval(() => {
      setShowCursorBlink(prev => !prev);
    }, 530);
    
    return () => clearInterval(interval);
  }, [showCursor, isTyping]);

  return (
    <span 
      className={`typed-counter ${fontStyle === 'mono' ? 'font-mono' : ''} ${className}`}
      style={style}
    >
      {displayText}
      {showCursor && (
        <span 
          className={`typed-counter-cursor ${isTyping ? 'typing' : ''} ${showCursorBlink ? 'visible' : 'hidden'}`}
          aria-hidden="true"
        >
          {cursorChar}
        </span>
      )}
      
      <style jsx>{`
        .typed-counter {
          display: inline-flex;
          align-items: center;
          position: relative;
        }
        
        .typed-counter-cursor {
          display: inline-block;
          margin-left: 1px;
          transition: opacity 0.1s ease;
          color: var(--accent-blue, #3b82f6);
          font-weight: normal;
        }
        
        .typed-counter-cursor.typing {
          animation: cursor-blink 1.06s step-end infinite;
        }
        
        .typed-counter-cursor.hidden:not(.typing) {
          opacity: 0;
        }
        
        .typed-counter-cursor.visible:not(.typing) {
          opacity: 1;
        }
        
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        /* After typing completes, cursor fades out */
        .typed-counter-cursor:not(.typing) {
          animation: cursor-fade-out 2s ease forwards;
          animation-delay: 1s;
        }
        
        @keyframes cursor-fade-out {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        
        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .typed-counter-cursor {
            animation: none !important;
            opacity: 0;
          }
        }
      `}</style>
    </span>
  );
}

export const TypedCounter = memo(TypedCounterComponent);

/**
 * TypedText - General purpose typing effect for any text
 * 
 * Same typing effect but for arbitrary text content.
 * Good for headings, labels, or dynamic text that should "type in".
 */
interface TypedTextProps {
  text: string;
  typingSpeed?: number;
  showCursor?: boolean;
  cursorChar?: string;
  delay?: number;
  onComplete?: () => void;
  className?: string;
  style?: CSSProperties;
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3';
}

export const TypedText = memo(function TypedText({
  text,
  typingSpeed = 50,
  showCursor = true,
  cursorChar = '█',
  delay = 0,
  onComplete,
  className = '',
  style,
  as: Component = 'span',
}: TypedTextProps) {
  return (
    <TypedCounter
      value={text}
      typingSpeed={typingSpeed}
      showCursor={showCursor}
      cursorChar={cursorChar}
      delay={delay}
      onComplete={onComplete}
      className={className}
      style={style}
      formatNumber={false}
      fontStyle="inherit"
      prefix=""
      suffix=""
    />
  );
});

/**
 * TypedStatCard - Pre-styled stat card with typed number
 * 
 * Wraps TypedCounter in a nice card format for dashboard stats.
 */
interface TypedStatCardProps {
  label: string;
  value: number;
  icon?: ReactNode;
  prefix?: string;
  suffix?: string;
  delay?: number;
  color?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const TypedStatCard = memo(function TypedStatCard({
  label,
  value,
  icon,
  prefix = '',
  suffix = '',
  delay = 0,
  color = 'default',
  className = '',
}: TypedStatCardProps) {
  const colorClass = {
    default: '',
    success: 'text-green-400',
    warning: 'text-amber-400',
    danger: 'text-red-400',
  }[color];

  return (
    <div className={`typed-stat-card ${className}`}>
      <div className="typed-stat-card-header">
        {icon && <span className="typed-stat-card-icon">{icon}</span>}
        <span className="typed-stat-card-label">{label}</span>
      </div>
      <div className={`typed-stat-card-value ${colorClass}`}>
        <TypedCounter
          value={value}
          prefix={prefix}
          suffix={suffix}
          delay={delay}
          typingSpeed={70}
          scrambleEffect
          scrambleIterations={2}
        />
      </div>
      
      <style jsx>{`
        .typed-stat-card {
          padding: 1rem 1.25rem;
          background: var(--bg-secondary, rgba(20, 20, 30, 0.8));
          border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
          border-radius: 12px;
        }
        
        .typed-stat-card-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        
        .typed-stat-card-icon {
          font-size: 1rem;
          opacity: 0.7;
        }
        
        .typed-stat-card-label {
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted, #71717a);
        }
        
        .typed-stat-card-value {
          font-size: 1.75rem;
          font-weight: 700;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          color: var(--text-primary, #e4e4e7);
          line-height: 1.2;
        }
      `}</style>
    </div>
  );
});

export default TypedCounter;
