'use client';

import { useEffect, useRef, useState, useMemo, memo, CSSProperties, useCallback } from 'react';

/**
 * SlotMachine - Casino-Style Slot Machine Number Reveal
 * 
 * Inspired by:
 * - Las Vegas slot machine reels with satisfying "lock" moments
 * - Japanese pachinko machine number displays
 * - Lottery number draw animations
 * - Game show prize reveals (Wheel of Fortune, The Price is Right)
 * - Retro-futuristic sci-fi interfaces (Blade Runner credit terminals)
 * 
 * Creates a vertical spinning reel effect where digits scroll through
 * rapidly before landing on the final value. Each digit locks in sequence
 * from left to right, building anticipation for the full reveal.
 * 
 * Different from existing components:
 * - FlipDigit: Horizontal flip like airport departures
 * - SpinDigit: Simple vertical scroll
 * - MorphDigit: SVG path morphing between shapes
 * - SlotMachine: FULL REEL SPIN with blur, acceleration/deceleration, and "lock" effect
 * 
 * Usage:
 * <SlotMachineNumber value={15.7} prefix="+" suffix="%" />
 * <SlotMachineInteger value={42} />
 * <SlotMachinePrice value={125.50} currency="$" />
 */

type SlotVariant = 'default' | 'success' | 'danger' | 'gold' | 'neon';
type SlotSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface SlotReelProps {
  /** Target digit to land on (0-9, '.', '-', '+', '%', '$', ' ') */
  targetDigit: string;
  /** Reel index (left to right) for staggered timing */
  reelIndex: number;
  /** Total number of reels */
  totalReels: number;
  /** Base spin duration per reel (ms) */
  baseDuration?: number;
  /** Additional delay per reel (ms) */
  staggerDelay?: number;
  /** Number of full rotations before landing */
  spins?: number;
  /** Digit height in pixels */
  digitHeight: number;
  /** Digit width in pixels */
  digitWidth: number;
  /** Font size in pixels */
  fontSize: number;
  /** Color variant */
  variant: SlotVariant;
  /** Enable motion blur during spin */
  motionBlur?: boolean;
  /** Enable "lock" flash effect when landing */
  lockFlash?: boolean;
  /** Called when this reel finishes spinning */
  onLocked?: () => void;
}

// All possible reel symbols
const REEL_SYMBOLS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const EXTENDED_SYMBOLS = [...REEL_SYMBOLS, '.', '-', '+', '%', '$', ' ', ','];

// Variant color schemes
const VARIANT_COLORS: Record<SlotVariant, { 
  text: string; 
  glow: string; 
  flash: string;
  bg: string;
}> = {
  default: {
    text: '#ffffff',
    glow: 'rgba(255, 255, 255, 0.3)',
    flash: 'rgba(255, 255, 255, 0.8)',
    bg: 'rgba(0, 0, 0, 0.3)',
  },
  success: {
    text: '#22c55e',
    glow: 'rgba(34, 197, 94, 0.4)',
    flash: 'rgba(34, 197, 94, 0.9)',
    bg: 'rgba(34, 197, 94, 0.1)',
  },
  danger: {
    text: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.4)',
    flash: 'rgba(239, 68, 68, 0.9)',
    bg: 'rgba(239, 68, 68, 0.1)',
  },
  gold: {
    text: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.5)',
    flash: 'rgba(251, 191, 36, 1)',
    bg: 'rgba(251, 191, 36, 0.1)',
  },
  neon: {
    text: '#c084fc',
    glow: 'rgba(192, 132, 252, 0.5)',
    flash: 'rgba(192, 132, 252, 1)',
    bg: 'rgba(192, 132, 252, 0.1)',
  },
};

// Size presets
const SIZE_PRESETS: Record<SlotSize, { height: number; width: number; fontSize: number }> = {
  xs: { height: 20, width: 12, fontSize: 14 },
  sm: { height: 28, width: 18, fontSize: 20 },
  md: { height: 40, width: 26, fontSize: 28 },
  lg: { height: 56, width: 36, fontSize: 40 },
  xl: { height: 72, width: 48, fontSize: 52 },
};

/**
 * Individual slot reel that spins and lands on a target digit
 */
const SlotReel = memo(function SlotReel({
  targetDigit,
  reelIndex,
  totalReels,
  baseDuration = 1500,
  staggerDelay = 150,
  spins = 3,
  digitHeight,
  digitWidth,
  fontSize,
  variant,
  motionBlur = true,
  lockFlash = true,
  onLocked,
}: SlotReelProps) {
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'landing' | 'locked'>('idle');
  const [currentOffset, setCurrentOffset] = useState(0);
  const reelRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  
  const colors = VARIANT_COLORS[variant];
  
  // Build the reel strip: [random padding] + [0-9 repeated for spins] + [target]
  const reelStrip = useMemo(() => {
    const strip: string[] = [];
    // Add spinning digits
    for (let s = 0; s < spins; s++) {
      for (const d of REEL_SYMBOLS) {
        strip.push(d);
      }
    }
    // Find target index and add path to it
    const targetIdx = REEL_SYMBOLS.indexOf(targetDigit);
    if (targetIdx >= 0) {
      // Add digits up to and including target
      for (let i = 0; i <= targetIdx; i++) {
        strip.push(REEL_SYMBOLS[i]);
      }
    } else {
      // Non-numeric character - just add it at the end
      strip.push(targetDigit);
    }
    return strip;
  }, [targetDigit, spins]);
  
  // Total travel distance
  const totalTravel = (reelStrip.length - 1) * digitHeight;
  
  // Calculate delay for this reel
  const reelDelay = reelIndex * staggerDelay;
  
  // Calculate duration with slight variation for organic feel
  const reelDuration = baseDuration + (reelIndex * staggerDelay * 0.5);
  
  // Easing function: fast start, slow landing (cubic bezier approximation)
  const easeOutQuart = (t: number): number => {
    return 1 - Math.pow(1 - t, 4);
  };
  
  // Start spinning after delay
  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // Skip animation, show final state immediately
      setPhase('locked');
      setCurrentOffset(totalTravel);
      onLocked?.();
      return;
    }
    
    const delayTimer = setTimeout(() => {
      setPhase('spinning');
      startTimeRef.current = performance.now();
      
      const animate = (now: number) => {
        const elapsed = now - startTimeRef.current;
        const progress = Math.min(elapsed / reelDuration, 1);
        const easedProgress = easeOutQuart(progress);
        
        // Calculate current offset
        const offset = easedProgress * totalTravel;
        setCurrentOffset(offset);
        
        // Update phase based on progress
        if (progress < 0.7) {
          setPhase('spinning');
        } else if (progress < 1) {
          setPhase('landing');
        }
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setPhase('locked');
          setCurrentOffset(totalTravel);
          onLocked?.();
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
    }, reelDelay);
    
    return () => {
      clearTimeout(delayTimer);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [reelDelay, reelDuration, totalTravel, onLocked]);
  
  // Motion blur based on speed
  const blurAmount = useMemo(() => {
    if (!motionBlur || phase === 'locked' || phase === 'idle') return 0;
    if (phase === 'landing') return 1;
    return 3; // Full spin blur
  }, [phase, motionBlur]);
  
  const containerStyle: CSSProperties = {
    position: 'relative',
    width: digitWidth,
    height: digitHeight,
    overflow: 'hidden',
    backgroundColor: colors.bg,
    borderRadius: 4,
  };
  
  const reelStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    transform: `translateY(-${currentOffset}px)`,
    filter: blurAmount > 0 ? `blur(${blurAmount}px)` : 'none',
  };
  
  const digitStyle: CSSProperties = {
    height: digitHeight,
    width: digitWidth,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: fontSize,
    fontWeight: 700,
    fontFamily: 'var(--font-mono, ui-monospace, monospace)',
    fontVariantNumeric: 'tabular-nums',
    color: colors.text,
    textShadow: phase === 'locked' ? `0 0 10px ${colors.glow}` : 'none',
    transition: phase === 'locked' ? 'text-shadow 0.3s ease' : 'none',
  };
  
  return (
    <div style={containerStyle} className="slot-reel">
      <div ref={reelRef} style={reelStyle}>
        {reelStrip.map((digit, idx) => (
          <div key={idx} style={digitStyle}>
            {digit}
          </div>
        ))}
      </div>
      
      {/* Lock flash overlay */}
      {lockFlash && phase === 'locked' && (
        <div 
          className="slot-lock-flash"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: colors.flash,
            animation: 'slotLockFlash 0.3s ease-out forwards',
            pointerEvents: 'none',
            borderRadius: 4,
          }}
        />
      )}
      
      {/* Top/bottom gradient masks for depth */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '30%',
          background: `linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)`,
          pointerEvents: 'none',
        }}
      />
      <div 
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '30%',
          background: `linear-gradient(to top, rgba(0,0,0,0.5), transparent)`,
          pointerEvents: 'none',
        }}
      />
      
      <style jsx>{`
        @keyframes slotLockFlash {
          0% { opacity: 0.8; }
          100% { opacity: 0; }
        }
        
        .slot-reel {
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3),
                      inset 0 -2px 4px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
});

// ============================================================================
// Main SlotMachine Component
// ============================================================================

interface SlotMachineProps {
  /** The value to display (will be converted to string) */
  value: number | string;
  /** Prefix character(s) to show before number */
  prefix?: string;
  /** Suffix character(s) to show after number */
  suffix?: string;
  /** Size preset */
  size?: SlotSize;
  /** Color variant */
  variant?: SlotVariant;
  /** Base spin duration in ms */
  duration?: number;
  /** Stagger delay between reels in ms */
  stagger?: number;
  /** Number of full spins before landing */
  spins?: number;
  /** Enable motion blur */
  motionBlur?: boolean;
  /** Enable lock flash effect */
  lockFlash?: boolean;
  /** Gap between digits in px */
  gap?: number;
  /** Animate when value changes */
  animateOnChange?: boolean;
  /** Trigger animation (controlled mode) */
  trigger?: boolean;
  /** Initial delay before starting */
  delay?: number;
  /** Callback when all reels locked */
  onComplete?: () => void;
  /** Additional className */
  className?: string;
  /** Additional style */
  style?: CSSProperties;
}

export const SlotMachine = memo(function SlotMachine({
  value,
  prefix = '',
  suffix = '',
  size = 'md',
  variant = 'default',
  duration = 1500,
  stagger = 150,
  spins = 3,
  motionBlur = true,
  lockFlash = true,
  gap = 2,
  animateOnChange = true,
  trigger,
  delay = 0,
  onComplete,
  className = '',
  style,
}: SlotMachineProps) {
  const [animationKey, setAnimationKey] = useState(0);
  const [lockedCount, setLockedCount] = useState(0);
  const prevValueRef = useRef(value);
  
  const sizePreset = SIZE_PRESETS[size];
  const { height, width, fontSize } = sizePreset;
  
  // Convert value to display string
  const displayString = useMemo(() => {
    return `${prefix}${value}${suffix}`;
  }, [value, prefix, suffix]);
  
  const digits = displayString.split('');
  
  // Handle value changes
  useEffect(() => {
    if (animateOnChange && prevValueRef.current !== value) {
      setAnimationKey(k => k + 1);
      setLockedCount(0);
    }
    prevValueRef.current = value;
  }, [value, animateOnChange]);
  
  // Handle controlled trigger
  useEffect(() => {
    if (trigger !== undefined) {
      setAnimationKey(k => k + 1);
      setLockedCount(0);
    }
  }, [trigger]);
  
  // Track reel completion
  const handleReelLocked = useCallback(() => {
    setLockedCount(c => {
      const newCount = c + 1;
      if (newCount === digits.length) {
        onComplete?.();
      }
      return newCount;
    });
  }, [digits.length, onComplete]);
  
  // Container style with frame effect
  const containerStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: gap,
    padding: '4px 8px',
    background: 'linear-gradient(145deg, rgba(30,30,30,0.9), rgba(10,10,10,0.95))',
    borderRadius: 8,
    boxShadow: `
      0 4px 6px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      inset 0 -1px 0 rgba(0, 0, 0, 0.3)
    `,
    border: '1px solid rgba(255, 255, 255, 0.1)',
    ...style,
  };
  
  return (
    <div className={`slot-machine ${className}`} style={containerStyle}>
      {digits.map((digit, idx) => {
        // Check if this is a numeric digit or special char
        const isNumeric = REEL_SYMBOLS.includes(digit);
        
        if (isNumeric) {
          return (
            <SlotReel
              key={`${animationKey}-${idx}`}
              targetDigit={digit}
              reelIndex={idx}
              totalReels={digits.length}
              baseDuration={duration}
              staggerDelay={stagger}
              spins={spins}
              digitHeight={height}
              digitWidth={width}
              fontSize={fontSize}
              variant={variant}
              motionBlur={motionBlur}
              lockFlash={lockFlash}
              onLocked={handleReelLocked}
            />
          );
        } else {
          // Static character (prefix, suffix, decimal point, etc.)
          return (
            <div
              key={`static-${idx}`}
              style={{
                height: height,
                width: digit === '.' || digit === ',' ? width * 0.5 : width,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: fontSize,
                fontWeight: 700,
                fontFamily: 'var(--font-mono, ui-monospace, monospace)',
                color: VARIANT_COLORS[variant].text,
              }}
            >
              {digit}
            </div>
          );
        }
      })}
      
      <style jsx>{`
        .slot-machine {
          /* Slight 3D tilt for depth */
          transform: perspective(500px) rotateX(2deg);
        }
        
        @media (prefers-reduced-motion: reduce) {
          .slot-machine {
            transform: none;
          }
        }
        
        @media print {
          .slot-machine {
            background: transparent !important;
            box-shadow: none !important;
            border: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
});

// ============================================================================
// Pre-configured Variants
// ============================================================================

interface SlotMachineNumberProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  size?: SlotSize;
  variant?: SlotVariant;
  duration?: number;
  className?: string;
}

/**
 * SlotMachineNumber - Formatted number with configurable decimals
 */
export const SlotMachineNumber = memo(function SlotMachineNumber({
  value,
  decimals = 1,
  prefix = '',
  suffix = '',
  size = 'md',
  variant = 'default',
  duration = 1500,
  className = '',
}: SlotMachineNumberProps) {
  const formattedValue = value.toFixed(decimals);
  
  return (
    <SlotMachine
      value={formattedValue}
      prefix={prefix}
      suffix={suffix}
      size={size}
      variant={variant}
      duration={duration}
      className={className}
    />
  );
});

/**
 * SlotMachineInteger - Whole numbers only
 */
export const SlotMachineInteger = memo(function SlotMachineInteger({
  value,
  prefix = '',
  suffix = '',
  size = 'md',
  variant = 'default',
  duration = 1500,
  className = '',
}: Omit<SlotMachineNumberProps, 'decimals'>) {
  return (
    <SlotMachine
      value={Math.round(value)}
      prefix={prefix}
      suffix={suffix}
      size={size}
      variant={variant}
      duration={duration}
      className={className}
    />
  );
});

/**
 * SlotMachinePercentage - For earnings surprise percentages
 */
export const SlotMachinePercentage = memo(function SlotMachinePercentage({
  value,
  size = 'md',
  autoVariant = true,
  duration = 1500,
  className = '',
}: {
  value: number;
  size?: SlotSize;
  autoVariant?: boolean;
  duration?: number;
  className?: string;
}) {
  // Auto-select variant based on value
  const variant: SlotVariant = autoVariant
    ? value >= 15 ? 'gold' : value > 0 ? 'success' : value < -15 ? 'danger' : value < 0 ? 'danger' : 'default'
    : 'default';
  
  const prefix = value >= 0 ? '+' : '';
  
  return (
    <SlotMachine
      value={value.toFixed(1)}
      prefix={prefix}
      suffix="%"
      size={size}
      variant={variant}
      duration={duration}
      className={className}
    />
  );
});

/**
 * SlotMachinePrice - For currency values
 */
export const SlotMachinePrice = memo(function SlotMachinePrice({
  value,
  currency = '$',
  decimals = 2,
  size = 'md',
  variant = 'default',
  duration = 1500,
  className = '',
}: {
  value: number;
  currency?: string;
  decimals?: number;
  size?: SlotSize;
  variant?: SlotVariant;
  duration?: number;
  className?: string;
}) {
  return (
    <SlotMachine
      value={value.toFixed(decimals)}
      prefix={currency}
      size={size}
      variant={variant}
      duration={duration}
      className={className}
    />
  );
});

/**
 * SlotMachineCountdown - For countdown displays
 */
export const SlotMachineCountdown = memo(function SlotMachineCountdown({
  hours = 0,
  minutes = 0,
  seconds = 0,
  size = 'md',
  variant = 'neon',
  duration = 800,
  className = '',
}: {
  hours?: number;
  minutes?: number;
  seconds?: number;
  size?: SlotSize;
  variant?: SlotVariant;
  duration?: number;
  className?: string;
}) {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const timeString = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  
  return (
    <SlotMachine
      value={timeString}
      size={size}
      variant={variant}
      duration={duration}
      stagger={80}
      spins={2}
      className={className}
    />
  );
});

/**
 * SlotMachineEPS - For EPS values with proper formatting
 */
export const SlotMachineEPS = memo(function SlotMachineEPS({
  actual,
  estimate,
  showSurprise = true,
  size = 'md',
  duration = 1500,
  className = '',
}: {
  actual: number;
  estimate?: number;
  showSurprise?: boolean;
  size?: SlotSize;
  duration?: number;
  className?: string;
}) {
  const surprise = estimate ? ((actual - estimate) / Math.abs(estimate)) * 100 : 0;
  const variant: SlotVariant = actual >= (estimate || 0) ? 'success' : 'danger';
  
  return (
    <div className={`slot-machine-eps ${className}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <SlotMachine
        value={actual.toFixed(2)}
        prefix="$"
        size={size}
        variant={variant}
        duration={duration}
      />
      {showSurprise && estimate && (
        <SlotMachinePercentage
          value={surprise}
          size={size === 'xl' ? 'lg' : size === 'lg' ? 'md' : size === 'md' ? 'sm' : 'xs'}
          duration={duration + 500}
        />
      )}
    </div>
  );
});

export default SlotMachine;
