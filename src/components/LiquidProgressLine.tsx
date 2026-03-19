'use client';

import { useEffect, useRef, useState, memo, CSSProperties } from 'react';

/**
 * LiquidProgressLine - Organic flowing progress indicator
 * 
 * A premium alternative to boring linear progress bars. The progress
 * fills with a liquid-like wave motion, creating a sense of organic
 * movement and life in the interface.
 * 
 * Inspiration:
 * - iOS liquid loading animations
 * - Premium fintech apps (Revolut, Monzo loading states)
 * - 2026 "organic motion" trend from Orizon Design
 * - Water/fluid physics simulations
 * 
 * Features:
 * - SVG-based wave animation (GPU accelerated)
 * - Progress fills with flowing wave motion
 * - Configurable wave amplitude and frequency
 * - Glow effect at wave crest
 * - Gradient fill for depth
 * - Respects prefers-reduced-motion
 * - Light/dark mode compatible
 * 
 * Use cases:
 * - Data loading states
 * - Upload progress
 * - Weekly earnings progress (X of Y reported)
 * - Any determinate progress with personality
 */

interface LiquidProgressLineProps {
  /** Progress value 0-100 */
  progress: number;
  /** Height of the progress bar in pixels */
  height?: number;
  /** Wave amplitude (0-1, relative to height) */
  waveAmplitude?: number;
  /** Wave frequency (number of waves visible) */
  waveFrequency?: number;
  /** Animation speed in seconds */
  waveSpeed?: number;
  /** Primary color (CSS color value) */
  primaryColor?: string;
  /** Secondary color for gradient (CSS color value) */
  secondaryColor?: string;
  /** Background color */
  backgroundColor?: string;
  /** Show glow effect at wave crest */
  showGlow?: boolean;
  /** Border radius in pixels */
  borderRadius?: number;
  /** Additional class name */
  className?: string;
  /** Animate progress changes smoothly */
  animateProgress?: boolean;
  /** Show percentage text */
  showPercentage?: boolean;
  /** Label text (replaces percentage) */
  label?: string;
  /** Variant: horizontal (default) or vertical */
  variant?: 'horizontal' | 'vertical';
}

// Memoized wave path generator
function generateWavePath(
  width: number,
  height: number,
  amplitude: number,
  frequency: number,
  phase: number,
  progress: number
): string {
  const progressWidth = (progress / 100) * width;
  const points: string[] = [];
  const segments = 100;
  
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * progressWidth;
    const normalizedX = (x / width) * frequency * Math.PI * 2;
    const y = height / 2 + Math.sin(normalizedX + phase) * amplitude * (height / 2);
    
    if (i === 0) {
      points.push(`M ${x} ${y}`);
    } else {
      points.push(`L ${x} ${y}`);
    }
  }
  
  // Close the path for fill
  points.push(`L ${progressWidth} ${height}`);
  points.push(`L 0 ${height}`);
  points.push('Z');
  
  return points.join(' ');
}

function LiquidProgressLineComponent({
  progress,
  height = 8,
  waveAmplitude = 0.3,
  waveFrequency = 3,
  waveSpeed = 2,
  primaryColor = 'var(--accent-blue, #3b82f6)',
  secondaryColor = 'var(--accent-purple, #8b5cf6)',
  backgroundColor = 'var(--border-secondary, rgba(255, 255, 255, 0.06))',
  showGlow = true,
  borderRadius = 4,
  className = '',
  animateProgress = true,
  showPercentage = false,
  label,
  variant = 'horizontal',
}: LiquidProgressLineProps) {
  const [phase, setPhase] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(progress);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(200);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Measure container width
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Animate wave phase
  useEffect(() => {
    if (prefersReducedMotion || progress === 0) return;

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      
      // Update phase based on time
      setPhase((prev) => (prev + (delta / 1000) * (Math.PI * 2 / waveSpeed)) % (Math.PI * 2));
      
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [waveSpeed, prefersReducedMotion, progress]);

  // Smoothly animate progress changes
  useEffect(() => {
    if (!animateProgress || prefersReducedMotion) {
      setDisplayProgress(progress);
      return;
    }

    const startProgress = displayProgress;
    const diff = progress - startProgress;
    const duration = 600; // ms
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const t = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayProgress(startProgress + diff * eased);
      
      if (t < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [progress, animateProgress, prefersReducedMotion]);

  const wavePath = generateWavePath(
    containerWidth,
    height,
    waveAmplitude,
    waveFrequency,
    phase,
    displayProgress
  );

  // Generate unique gradient ID
  const gradientId = `liquid-gradient-${Math.random().toString(36).slice(2, 9)}`;
  const glowFilterId = `liquid-glow-${Math.random().toString(36).slice(2, 9)}`;

  const containerStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    height,
    backgroundColor,
    borderRadius,
    overflow: 'hidden',
    // Subtle inner shadow for depth
    boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
  };

  if (variant === 'vertical') {
    containerStyle.width = height;
    containerStyle.height = '100%';
    containerStyle.transform = 'rotate(-90deg)';
    containerStyle.transformOrigin = 'center center';
  }

  return (
    <div
      ref={containerRef}
      className={`liquid-progress-line ${className}`}
      style={containerStyle}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || `${Math.round(progress)}% complete`}
    >
      <svg
        width={containerWidth}
        height={height}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        <defs>
          {/* Gradient fill for depth */}
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} stopOpacity={1} />
            <stop offset="50%" stopColor={secondaryColor} stopOpacity={0.9} />
            <stop offset="100%" stopColor={primaryColor} stopOpacity={0.8} />
          </linearGradient>
          
          {/* Glow filter */}
          {showGlow && (
            <filter id={glowFilterId} x="-20%" y="-50%" width="140%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          )}
        </defs>
        
        {/* Main wave fill */}
        <path
          d={wavePath}
          fill={`url(#${gradientId})`}
          style={{
            filter: showGlow ? `url(#${glowFilterId})` : undefined,
            transition: prefersReducedMotion ? 'none' : undefined,
          }}
        />
        
        {/* Highlight line at top of wave */}
        {displayProgress > 0 && (
          <path
            d={wavePath}
            fill="none"
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth={1}
            style={{
              clipPath: `inset(0 ${100 - displayProgress}% 50% 0)`,
            }}
          />
        )}
      </svg>

      {/* Percentage label */}
      {(showPercentage || label) && (
        <span
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: Math.max(height * 0.6, 10),
            fontWeight: 600,
            color: displayProgress > 50 ? 'white' : 'var(--text-secondary)',
            textShadow: displayProgress > 50 
              ? '0 1px 2px rgba(0, 0, 0, 0.3)'
              : 'none',
            transition: 'color 0.3s ease',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          {label || `${Math.round(displayProgress)}%`}
        </span>
      )}

      {/* CSS for additional polish */}
      <style jsx>{`
        .liquid-progress-line {
          /* Subtle pulsing glow when near completion */
          animation: ${displayProgress >= 90 && !prefersReducedMotion 
            ? 'liquid-pulse 2s ease-in-out infinite' 
            : 'none'};
        }
        
        @keyframes liquid-pulse {
          0%, 100% { box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1); }
          50% { 
            box-shadow: 
              inset 0 1px 2px rgba(0, 0, 0, 0.1),
              0 0 12px ${primaryColor}40;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .liquid-progress-line {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

export const LiquidProgressLine = memo(LiquidProgressLineComponent);

/**
 * LiquidProgressRing - Circular variant with wave effect
 */
interface LiquidProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  showGlow?: boolean;
  showPercentage?: boolean;
  className?: string;
}

function LiquidProgressRingComponent({
  progress,
  size = 60,
  strokeWidth = 6,
  primaryColor = 'var(--accent-blue, #3b82f6)',
  secondaryColor = 'var(--accent-purple, #8b5cf6)',
  backgroundColor = 'var(--border-secondary, rgba(255, 255, 255, 0.1))',
  showGlow = true,
  showPercentage = true,
  className = '',
}: LiquidProgressRingProps) {
  const [phase, setPhase] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(progress);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const rafRef = useRef<number>(0);

  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Animate wave
  useEffect(() => {
    if (prefersReducedMotion || progress === 0) return;

    const animate = () => {
      setPhase((prev) => (prev + 0.05) % (Math.PI * 2));
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [prefersReducedMotion, progress]);

  // Smooth progress animation
  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayProgress(progress);
      return;
    }

    const startProgress = displayProgress;
    const diff = progress - startProgress;
    const duration = 600;
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayProgress(startProgress + diff * eased);
      
      if (t < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [progress, prefersReducedMotion]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayProgress / 100) * circumference;

  // Wave effect on the stroke
  const waveOffset = Math.sin(phase) * 2;

  const gradientId = `ring-gradient-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <div 
      className={`liquid-progress-ring ${className}`}
      style={{ 
        position: 'relative', 
        width: size, 
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        width={size}
        height={size}
        style={{ 
          transform: `rotate(-90deg)`,
          filter: showGlow ? `drop-shadow(0 0 4px ${primaryColor}40)` : undefined,
        }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>
        </defs>

        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />

        {/* Progress circle with wave offset */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth + waveOffset}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: prefersReducedMotion 
              ? 'stroke-dashoffset 0.3s ease'
              : 'stroke-dashoffset 0.1s linear',
          }}
        />
      </svg>

      {/* Center percentage */}
      {showPercentage && (
        <span
          style={{
            position: 'absolute',
            fontSize: size * 0.22,
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}
        >
          {Math.round(displayProgress)}%
        </span>
      )}
    </div>
  );
}

export const LiquidProgressRing = memo(LiquidProgressRingComponent);

/**
 * Preset configurations for common use cases
 */
export const LiquidProgressPresets = {
  // Minimal, subtle loading
  subtle: {
    height: 4,
    waveAmplitude: 0.2,
    waveFrequency: 2,
    showGlow: false,
  },
  // Standard progress bar
  standard: {
    height: 8,
    waveAmplitude: 0.3,
    waveFrequency: 3,
    showGlow: true,
  },
  // Bold, attention-grabbing
  bold: {
    height: 12,
    waveAmplitude: 0.4,
    waveFrequency: 4,
    showGlow: true,
  },
  // Tall for prominent displays
  prominent: {
    height: 20,
    waveAmplitude: 0.35,
    waveFrequency: 5,
    showGlow: true,
    showPercentage: true,
  },
} as const;
