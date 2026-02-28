'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * NumberTicker - Animated digit-by-digit flip counter
 * Creates a slot-machine style number animation
 */

interface DigitProps {
  digit: string;
  delay: number;
}

function Digit({ digit, delay }: DigitProps) {
  const [currentDigit, setCurrentDigit] = useState(digit);
  const [isFlipping, setIsFlipping] = useState(false);
  const prevDigit = useRef(digit);

  useEffect(() => {
    if (digit !== prevDigit.current) {
      // Start flip animation
      setTimeout(() => {
        setIsFlipping(true);
        
        // Halfway through animation, change the digit
        setTimeout(() => {
          setCurrentDigit(digit);
          
          // End flip animation
          setTimeout(() => {
            setIsFlipping(false);
            prevDigit.current = digit;
          }, 150);
        }, 150);
      }, delay);
    }
  }, [digit, delay]);

  return (
    <span 
      className={`number-ticker-digit ${isFlipping ? 'flipping' : ''}`}
      data-digit={currentDigit}
    >
      {currentDigit}
    </span>
  );
}

interface NumberTickerProps {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
  staggerDelay?: number;
}

export function NumberTicker({ 
  value, 
  suffix = '', 
  prefix = '',
  decimals = 0,
  className = '',
  staggerDelay = 30
}: NumberTickerProps) {
  const formattedValue = decimals > 0 
    ? value.toFixed(decimals) 
    : Math.round(value).toString();
  
  const chars = formattedValue.split('');

  return (
    <span className={`number-ticker ${className}`}>
      {prefix && <span className="number-ticker-prefix">{prefix}</span>}
      {chars.map((char, index) => {
        // Check if it's a digit or punctuation
        if (/\d/.test(char)) {
          return (
            <Digit 
              key={`${index}-${char}`} 
              digit={char} 
              delay={index * staggerDelay}
            />
          );
        }
        // Punctuation (decimal point, comma)
        return (
          <span key={index} className="number-ticker-punctuation">
            {char}
          </span>
        );
      })}
      {suffix && <span className="number-ticker-suffix">{suffix}</span>}
    </span>
  );
}

/**
 * RollingNumber - Vertical scroll counter animation
 * Numbers roll up/down to new value
 */

interface RollingDigitProps {
  digit: number;
  delay: number;
}

function RollingDigit({ digit, delay }: RollingDigitProps) {
  const [offset, setOffset] = useState(0);
  const prevDigit = useRef(digit);

  useEffect(() => {
    if (digit !== prevDigit.current) {
      setTimeout(() => {
        setOffset(-digit * 100);
        prevDigit.current = digit;
      }, delay);
    } else {
      setOffset(-digit * 100);
    }
  }, [digit, delay]);

  return (
    <span className="rolling-digit-container">
      <span 
        className="rolling-digit-track"
        style={{ transform: `translateY(${offset}%)` }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <span key={n} className="rolling-digit-value">{n}</span>
        ))}
      </span>
    </span>
  );
}

interface RollingNumberProps {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  staggerDelay?: number;
}

export function RollingNumber({ 
  value, 
  suffix = '', 
  prefix = '',
  className = '',
  staggerDelay = 50
}: RollingNumberProps) {
  const digits = Math.round(value).toString().split('').map(Number);

  return (
    <span className={`rolling-number ${className}`}>
      {prefix && <span className="rolling-number-prefix">{prefix}</span>}
      <span className="rolling-number-digits">
        {digits.map((digit, index) => (
          <RollingDigit 
            key={`pos-${digits.length - index}`}
            digit={digit} 
            delay={index * staggerDelay}
          />
        ))}
      </span>
      {suffix && <span className="rolling-number-suffix">{suffix}</span>}
    </span>
  );
}

/**
 * AnimatedStat - Complete stat display with label and animated value
 */

interface AnimatedStatProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  variant?: 'default' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
}

export function AnimatedStat({ 
  label, 
  value, 
  suffix = '', 
  prefix = '',
  variant = 'default',
  size = 'md'
}: AnimatedStatProps) {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-5xl',
  };

  const variantClasses = {
    default: 'text-white',
    success: 'text-gradient-green',
    warning: 'text-amber-400',
  };

  return (
    <div className="animated-stat">
      <div className={`${sizeClasses[size]} font-bold ${variantClasses[variant]} mb-1`}>
        <RollingNumber value={value} prefix={prefix} suffix={suffix} />
      </div>
      <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
        {label}
      </div>
    </div>
  );
}
