'use client';

import { useMemo, useEffect, useState, CSSProperties } from 'react';

/**
 * DotMatrixDisplay - Retro LED/Dot-Matrix Style Text Display
 * 
 * Renders text as individual dots in a classic dot-matrix style,
 * reminiscent of stock tickers, airport departure boards, and
 * vintage electronic displays.
 * 
 * Inspiration:
 * - NYSE stock ticker displays
 * - Airport/train station flip-dot displays
 * - Vintage LED scoreboards
 * - Retro-futuristic UI patterns (Blade Runner, Alien)
 * - Financial terminal aesthetics (Bloomberg, Reuters)
 * 
 * Features:
 * - 5x7 dot grid per character (industry standard)
 * - Multiple LED color options (green, amber, red, blue, white)
 * - Animation modes: instant, cascade, typewriter, random
 * - Glow effect on active dots
 * - Dim "off" dots for realism
 * - Gap customization between characters
 * - Full prefers-reduced-motion support
 * - Print-friendly (shows plain text)
 */

// 5x7 character definitions (each row is 5 bits, 7 rows per char)
// Standard ASCII-like characters optimized for LED displays
const CHAR_PATTERNS: Record<string, number[]> = {
  // Numbers
  '0': [0b01110, 0b10001, 0b10011, 0b10101, 0b11001, 0b10001, 0b01110],
  '1': [0b00100, 0b01100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110],
  '2': [0b01110, 0b10001, 0b00001, 0b00010, 0b00100, 0b01000, 0b11111],
  '3': [0b11111, 0b00010, 0b00100, 0b00010, 0b00001, 0b10001, 0b01110],
  '4': [0b00010, 0b00110, 0b01010, 0b10010, 0b11111, 0b00010, 0b00010],
  '5': [0b11111, 0b10000, 0b11110, 0b00001, 0b00001, 0b10001, 0b01110],
  '6': [0b00110, 0b01000, 0b10000, 0b11110, 0b10001, 0b10001, 0b01110],
  '7': [0b11111, 0b10001, 0b00010, 0b00100, 0b00100, 0b00100, 0b00100],
  '8': [0b01110, 0b10001, 0b10001, 0b01110, 0b10001, 0b10001, 0b01110],
  '9': [0b01110, 0b10001, 0b10001, 0b01111, 0b00001, 0b00010, 0b01100],
  
  // Special characters
  '.': [0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b01100, 0b01100],
  ',': [0b00000, 0b00000, 0b00000, 0b00000, 0b01100, 0b00100, 0b01000],
  ':': [0b00000, 0b01100, 0b01100, 0b00000, 0b01100, 0b01100, 0b00000],
  '-': [0b00000, 0b00000, 0b00000, 0b11111, 0b00000, 0b00000, 0b00000],
  '+': [0b00000, 0b00100, 0b00100, 0b11111, 0b00100, 0b00100, 0b00000],
  '%': [0b11000, 0b11001, 0b00010, 0b00100, 0b01000, 0b10011, 0b00011],
  '$': [0b00100, 0b01111, 0b10100, 0b01110, 0b00101, 0b11110, 0b00100],
  '/': [0b00000, 0b00001, 0b00010, 0b00100, 0b01000, 0b10000, 0b00000],
  '(': [0b00010, 0b00100, 0b01000, 0b01000, 0b01000, 0b00100, 0b00010],
  ')': [0b01000, 0b00100, 0b00010, 0b00010, 0b00010, 0b00100, 0b01000],
  ' ': [0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000],
  
  // Letters (uppercase)
  'A': [0b01110, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  'B': [0b11110, 0b10001, 0b10001, 0b11110, 0b10001, 0b10001, 0b11110],
  'C': [0b01110, 0b10001, 0b10000, 0b10000, 0b10000, 0b10001, 0b01110],
  'D': [0b11110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b11110],
  'E': [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b11111],
  'F': [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b10000],
  'G': [0b01110, 0b10001, 0b10000, 0b10111, 0b10001, 0b10001, 0b01110],
  'H': [0b10001, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  'I': [0b01110, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110],
  'J': [0b00111, 0b00010, 0b00010, 0b00010, 0b00010, 0b10010, 0b01100],
  'K': [0b10001, 0b10010, 0b10100, 0b11000, 0b10100, 0b10010, 0b10001],
  'L': [0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b11111],
  'M': [0b10001, 0b11011, 0b10101, 0b10101, 0b10001, 0b10001, 0b10001],
  'N': [0b10001, 0b10001, 0b11001, 0b10101, 0b10011, 0b10001, 0b10001],
  'O': [0b01110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  'P': [0b11110, 0b10001, 0b10001, 0b11110, 0b10000, 0b10000, 0b10000],
  'Q': [0b01110, 0b10001, 0b10001, 0b10001, 0b10101, 0b10010, 0b01101],
  'R': [0b11110, 0b10001, 0b10001, 0b11110, 0b10100, 0b10010, 0b10001],
  'S': [0b01110, 0b10001, 0b10000, 0b01110, 0b00001, 0b10001, 0b01110],
  'T': [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100],
  'U': [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  'V': [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01010, 0b00100],
  'W': [0b10001, 0b10001, 0b10001, 0b10101, 0b10101, 0b10101, 0b01010],
  'X': [0b10001, 0b10001, 0b01010, 0b00100, 0b01010, 0b10001, 0b10001],
  'Y': [0b10001, 0b10001, 0b01010, 0b00100, 0b00100, 0b00100, 0b00100],
  'Z': [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b10000, 0b11111],
};

// Color presets
type DotColor = 'green' | 'amber' | 'red' | 'blue' | 'white' | 'cyan' | 'pink';

const COLOR_MAP: Record<DotColor, { on: string; off: string; glow: string }> = {
  green: {
    on: '#00ff00',
    off: 'rgba(0, 255, 0, 0.1)',
    glow: 'rgba(0, 255, 0, 0.5)',
  },
  amber: {
    on: '#ffbf00',
    off: 'rgba(255, 191, 0, 0.1)',
    glow: 'rgba(255, 191, 0, 0.5)',
  },
  red: {
    on: '#ff3030',
    off: 'rgba(255, 48, 48, 0.1)',
    glow: 'rgba(255, 48, 48, 0.5)',
  },
  blue: {
    on: '#00aaff',
    off: 'rgba(0, 170, 255, 0.1)',
    glow: 'rgba(0, 170, 255, 0.5)',
  },
  white: {
    on: '#ffffff',
    off: 'rgba(255, 255, 255, 0.1)',
    glow: 'rgba(255, 255, 255, 0.4)',
  },
  cyan: {
    on: '#00ffff',
    off: 'rgba(0, 255, 255, 0.1)',
    glow: 'rgba(0, 255, 255, 0.5)',
  },
  pink: {
    on: '#ff00ff',
    off: 'rgba(255, 0, 255, 0.1)',
    glow: 'rgba(255, 0, 255, 0.5)',
  },
};

type AnimationMode = 'instant' | 'cascade' | 'typewriter' | 'random' | 'wave';

interface DotMatrixDisplayProps {
  /** Text to display */
  text: string;
  /** LED color */
  color?: DotColor;
  /** Custom on/off/glow colors */
  customColors?: { on: string; off: string; glow: string };
  /** Size of each dot in pixels */
  dotSize?: number;
  /** Gap between dots in pixels */
  dotGap?: number;
  /** Gap between characters in dots */
  charGap?: number;
  /** Animation mode */
  animation?: AnimationMode;
  /** Animation duration per dot/character in ms */
  animationSpeed?: number;
  /** Animation delay before starting (ms) */
  delay?: number;
  /** Show glow effect on active dots */
  glow?: boolean;
  /** Glow intensity (1-3) */
  glowIntensity?: 1 | 2 | 3;
  /** Show dim "off" dots */
  showOffDots?: boolean;
  /** Background color (default: transparent) */
  background?: string;
  /** Additional className */
  className?: string;
  /** Border radius for dots */
  dotRadius?: 'none' | 'sm' | 'full';
  /** ARIA label override */
  ariaLabel?: string;
}

interface DotProps {
  isOn: boolean;
  delay: number;
  colors: { on: string; off: string; glow: string };
  size: number;
  glow: boolean;
  glowIntensity: 1 | 2 | 3;
  showOffDots: boolean;
  radius: 'none' | 'sm' | 'full';
  animation: AnimationMode;
  animationSpeed: number;
}

function Dot({
  isOn,
  delay,
  colors,
  size,
  glow,
  glowIntensity,
  showOffDots,
  radius,
  animation,
  animationSpeed,
}: DotProps) {
  const [active, setActive] = useState(animation === 'instant');
  
  useEffect(() => {
    if (animation === 'instant') {
      setActive(true);
      return;
    }
    
    const timer = setTimeout(() => {
      setActive(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay, animation]);
  
  const isLit = active && isOn;
  
  const borderRadius = radius === 'full' ? '50%' : radius === 'sm' ? '20%' : '0';
  
  const glowShadow = glow && isLit
    ? glowIntensity === 3
      ? `0 0 ${size}px ${colors.glow}, 0 0 ${size * 2}px ${colors.glow}, 0 0 ${size * 3}px ${colors.glow}`
      : glowIntensity === 2
        ? `0 0 ${size}px ${colors.glow}, 0 0 ${size * 1.5}px ${colors.glow}`
        : `0 0 ${size * 0.5}px ${colors.glow}`
    : 'none';
  
  const style: CSSProperties = {
    width: size,
    height: size,
    borderRadius,
    backgroundColor: isLit ? colors.on : showOffDots ? colors.off : 'transparent',
    boxShadow: glowShadow,
    transition: animation === 'instant' 
      ? 'none' 
      : `background-color ${animationSpeed}ms ease-out, box-shadow ${animationSpeed}ms ease-out`,
  };
  
  return <div style={style} aria-hidden="true" />;
}

interface CharacterMatrixProps {
  char: string;
  charIndex: number;
  totalDotsBefore: number;
  colors: { on: string; off: string; glow: string };
  dotSize: number;
  dotGap: number;
  glow: boolean;
  glowIntensity: 1 | 2 | 3;
  showOffDots: boolean;
  radius: 'none' | 'sm' | 'full';
  animation: AnimationMode;
  animationSpeed: number;
  baseDelay: number;
}

function CharacterMatrix({
  char,
  charIndex,
  totalDotsBefore,
  colors,
  dotSize,
  dotGap,
  glow,
  glowIntensity,
  showOffDots,
  radius,
  animation,
  animationSpeed,
  baseDelay,
}: CharacterMatrixProps) {
  const pattern = CHAR_PATTERNS[char.toUpperCase()] || CHAR_PATTERNS[' '];
  
  // Calculate delay for each dot based on animation mode
  const getDelay = (row: number, col: number): number => {
    const dotIndex = row * 5 + col;
    
    switch (animation) {
      case 'instant':
        return 0;
      case 'cascade':
        // Each dot appears one after another, left to right, top to bottom
        return baseDelay + (totalDotsBefore + dotIndex) * (animationSpeed / 2);
      case 'typewriter':
        // Each character appears together, characters cascade
        return baseDelay + charIndex * animationSpeed * 3;
      case 'random':
        // Random delay within a range
        return baseDelay + Math.random() * animationSpeed * 10;
      case 'wave':
        // Diagonal wave across all characters
        return baseDelay + (row + col + charIndex * 3) * (animationSpeed / 2);
      default:
        return 0;
    }
  };
  
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(5, ${dotSize}px)`,
        gridTemplateRows: `repeat(7, ${dotSize}px)`,
        gap: dotGap,
      }}
    >
      {pattern.map((row, rowIndex) =>
        Array.from({ length: 5 }, (_, colIndex) => {
          const isOn = (row & (1 << (4 - colIndex))) !== 0;
          return (
            <Dot
              key={`${rowIndex}-${colIndex}`}
              isOn={isOn}
              delay={getDelay(rowIndex, colIndex)}
              colors={colors}
              size={dotSize}
              glow={glow}
              glowIntensity={glowIntensity}
              showOffDots={showOffDots}
              radius={radius}
              animation={animation}
              animationSpeed={animationSpeed}
            />
          );
        })
      )}
    </div>
  );
}

export function DotMatrixDisplay({
  text,
  color = 'green',
  customColors,
  dotSize = 4,
  dotGap = 1,
  charGap = 2,
  animation = 'cascade',
  animationSpeed = 30,
  delay = 0,
  glow = true,
  glowIntensity = 2,
  showOffDots = true,
  background,
  className = '',
  dotRadius = 'full',
  ariaLabel,
}: DotMatrixDisplayProps) {
  const colors = customColors || COLOR_MAP[color];
  
  // Calculate total dots before each character for cascade animation
  const dotsPerChar = 35; // 5x7
  
  const characters = text.split('');
  
  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: charGap * (dotSize + dotGap),
    padding: dotSize,
    background: background || 'transparent',
    width: 'fit-content',
  };
  
  return (
    <>
      <div
        className={className}
        style={containerStyle}
        role="img"
        aria-label={ariaLabel || text}
      >
        {characters.map((char, index) => (
          <CharacterMatrix
            key={`${char}-${index}`}
            char={char}
            charIndex={index}
            totalDotsBefore={index * dotsPerChar}
            colors={colors}
            dotSize={dotSize}
            dotGap={dotGap}
            glow={glow}
            glowIntensity={glowIntensity}
            showOffDots={showOffDots}
            radius={dotRadius}
            animation={animation}
            animationSpeed={animationSpeed}
            baseDelay={delay}
          />
        ))}
      </div>
      
      <style jsx global>{`
        @media (prefers-reduced-motion: reduce) {
          .dot-matrix-display * {
            transition: none !important;
            animation: none !important;
          }
        }
        
        @media print {
          .dot-matrix-display {
            display: none !important;
          }
          .dot-matrix-display::after {
            content: attr(aria-label);
            display: block;
            font-family: monospace;
          }
        }
      `}</style>
    </>
  );
}

// Pre-styled variants for common use cases

/** Retro stock ticker style - green LED on dark background */
export function StockTickerDisplay({
  text,
  dotSize = 3,
  ...props
}: Omit<DotMatrixDisplayProps, 'color' | 'background'>) {
  return (
    <DotMatrixDisplay
      text={text}
      color="green"
      dotSize={dotSize}
      background="rgba(0, 0, 0, 0.9)"
      glowIntensity={2}
      {...props}
    />
  );
}

/** Airport departure board style - amber/yellow LED */
export function DepartureBoardDisplay({
  text,
  dotSize = 4,
  animation = 'typewriter',
  ...props
}: Omit<DotMatrixDisplayProps, 'color'>) {
  return (
    <DotMatrixDisplay
      text={text}
      color="amber"
      dotSize={dotSize}
      animation={animation}
      background="rgba(20, 20, 20, 0.95)"
      {...props}
    />
  );
}

/** Score/stats display - red LED */
export function ScoreDisplay({
  text,
  dotSize = 5,
  glow = true,
  glowIntensity = 3,
  ...props
}: Omit<DotMatrixDisplayProps, 'color'>) {
  return (
    <DotMatrixDisplay
      text={text}
      color="red"
      dotSize={dotSize}
      glow={glow}
      glowIntensity={glowIntensity}
      background="rgba(0, 0, 0, 0.85)"
      {...props}
    />
  );
}

/** Modern tech display - cyan/blue LED */
export function TechDisplay({
  text,
  dotSize = 3,
  color = 'cyan',
  animation = 'wave',
  ...props
}: Omit<DotMatrixDisplayProps, 'background'>) {
  return (
    <DotMatrixDisplay
      text={text}
      color={color}
      dotSize={dotSize}
      animation={animation}
      background="rgba(0, 10, 20, 0.9)"
      {...props}
    />
  );
}

/** EPS surprise display - color based on beat/miss */
export function EPSSurpriseDisplay({
  value,
  dotSize = 4,
  animation = 'cascade',
  ...props
}: {
  value: number;
  dotSize?: number;
  animation?: AnimationMode;
} & Omit<DotMatrixDisplayProps, 'text' | 'color'>) {
  const isPositive = value >= 0;
  const text = `${isPositive ? '+' : ''}${value.toFixed(2)}%`;
  
  return (
    <DotMatrixDisplay
      text={text}
      color={isPositive ? 'green' : 'red'}
      dotSize={dotSize}
      animation={animation}
      background="rgba(0, 0, 0, 0.9)"
      glowIntensity={3}
      {...props}
    />
  );
}

/** Countdown timer display */
export function CountdownDisplay({
  hours = 0,
  minutes = 0,
  seconds = 0,
  dotSize = 5,
  ...props
}: {
  hours?: number;
  minutes?: number;
  seconds?: number;
  dotSize?: number;
} & Omit<DotMatrixDisplayProps, 'text' | 'animation'>) {
  const text = [
    hours > 0 ? String(hours).padStart(2, '0') : null,
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0'),
  ].filter(Boolean).join(':');
  
  return (
    <DotMatrixDisplay
      text={text}
      color="amber"
      dotSize={dotSize}
      animation="instant"
      background="rgba(0, 0, 0, 0.9)"
      {...props}
    />
  );
}

export default DotMatrixDisplay;
