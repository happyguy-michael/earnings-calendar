'use client';

import { useState, useEffect, useRef, useMemo } from 'react';

/**
 * LiquidWaveProgress - Organic liquid-fill progress indicator with animated wave surface
 * 
 * 2026 UI Trend: "Liquid Design" - interfaces that feel fluid and organic
 * Source: Medium "UI Design Trend 2026 #2: Glassmorphism and Liquid Design Make a Comeback"
 * - "Designers are merging glassmorphism with liquid-like interactions — crafting 
 *    interfaces that are fluid, haptic, and almost alive."
 * 
 * Features:
 * - SVG-based wave animation using sine curves
 * - Liquid "sloshing" effect with dual waves at different phases
 * - Rising water level animation as progress increases
 * - Optional bubbles that rise from the bottom
 * - Gradient fill for depth and dimension
 * - GPU-accelerated SVG transforms
 * - Full prefers-reduced-motion support
 * - Light/dark mode aware
 * 
 * Usage:
 * <LiquidWaveProgress progress={65} />
 * <LiquidWaveProgress progress={loading ? undefined : 100} /> // Indeterminate when undefined
 */

interface LiquidWaveProgressProps {
  /** Progress value 0-100, or undefined for indeterminate */
  progress?: number;
  /** Height of the container in pixels */
  height?: number;
  /** Width of the container (default: 100%) */
  width?: number | string;
  /** Color preset or custom color */
  color?: 'blue' | 'green' | 'purple' | 'amber' | 'custom';
  /** Custom primary color (when color='custom') */
  primaryColor?: string;
  /** Custom secondary color for gradient (when color='custom') */
  secondaryColor?: string;
  /** Wave amplitude in pixels */
  waveAmplitude?: number;
  /** Wave frequency (number of waves visible) */
  waveFrequency?: number;
  /** Animation speed multiplier (1 = normal) */
  speed?: number;
  /** Show rising bubbles */
  showBubbles?: boolean;
  /** Number of bubbles */
  bubbleCount?: number;
  /** Border radius */
  borderRadius?: number;
  /** Show glow effect under the wave */
  showGlow?: boolean;
  /** Show percentage label */
  showLabel?: boolean;
  /** Label position */
  labelPosition?: 'inside' | 'outside' | 'above';
  /** Additional className */
  className?: string;
  /** Compact mode (smaller default height) */
  compact?: boolean;
}

// Color presets with primary and secondary gradients
const COLOR_PRESETS = {
  blue: {
    primary: '#3b82f6',
    secondary: '#1d4ed8',
    glow: 'rgba(59, 130, 246, 0.3)',
  },
  green: {
    primary: '#22c55e',
    secondary: '#16a34a',
    glow: 'rgba(34, 197, 94, 0.3)',
  },
  purple: {
    primary: '#8b5cf6',
    secondary: '#7c3aed',
    glow: 'rgba(139, 92, 246, 0.3)',
  },
  amber: {
    primary: '#f59e0b',
    secondary: '#d97706',
    glow: 'rgba(245, 158, 11, 0.3)',
  },
  custom: {
    primary: '#3b82f6',
    secondary: '#1d4ed8',
    glow: 'rgba(59, 130, 246, 0.3)',
  },
};

// Bubble component
function Bubble({ 
  delay, 
  duration, 
  size, 
  left, 
  color 
}: { 
  delay: number; 
  duration: number; 
  size: number; 
  left: number;
  color: string;
}) {
  return (
    <div
      className="liquid-wave-bubble"
      style={{
        '--bubble-delay': `${delay}s`,
        '--bubble-duration': `${duration}s`,
        '--bubble-size': `${size}px`,
        '--bubble-left': `${left}%`,
        '--bubble-color': color,
      } as React.CSSProperties}
    />
  );
}

export function LiquidWaveProgress({
  progress,
  height = 48,
  width = '100%',
  color = 'blue',
  primaryColor,
  secondaryColor,
  waveAmplitude = 6,
  waveFrequency = 2,
  speed = 1,
  showBubbles = true,
  bubbleCount = 5,
  borderRadius = 12,
  showGlow = true,
  showLabel = false,
  labelPosition = 'inside',
  className = '',
  compact = false,
}: LiquidWaveProgressProps) {
  const [mounted, setMounted] = useState(false);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const animationRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const effectiveHeight = compact ? 24 : height;
  
  // Get colors from preset or custom
  const colors = useMemo(() => {
    if (color === 'custom' && primaryColor) {
      return {
        primary: primaryColor,
        secondary: secondaryColor || primaryColor,
        glow: `${primaryColor}4d`, // 30% opacity
      };
    }
    return COLOR_PRESETS[color] || COLOR_PRESETS.blue;
  }, [color, primaryColor, secondaryColor]);

  // Check for reduced motion preference
  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Animate progress changes smoothly
  useEffect(() => {
    if (!mounted || progress === undefined) return;
    
    const targetProgress = Math.max(0, Math.min(100, progress));
    const startProgress = animatedProgress;
    const diff = targetProgress - startProgress;
    
    if (Math.abs(diff) < 0.5) {
      setAnimatedProgress(targetProgress);
      return;
    }
    
    if (prefersReducedMotion) {
      setAnimatedProgress(targetProgress);
      return;
    }
    
    const duration = Math.min(800, Math.abs(diff) * 15);
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const t = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      const current = startProgress + diff * eased;
      
      setAnimatedProgress(current);
      
      if (t < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [progress, mounted, prefersReducedMotion]);

  // Generate bubble data (memoized to prevent re-renders)
  const bubbles = useMemo(() => {
    if (!showBubbles) return [];
    return Array.from({ length: bubbleCount }, (_, i) => ({
      id: i,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 2,
      size: 3 + Math.random() * 5,
      left: 10 + Math.random() * 80,
    }));
  }, [showBubbles, bubbleCount]);

  // Calculate water level (inverted because SVG y-axis is top-down)
  const waterLevel = 100 - animatedProgress;
  
  // Indeterminate mode (progress undefined)
  const isIndeterminate = progress === undefined;

  // SVG wave path generator
  const generateWavePath = (phase: number, amplitude: number) => {
    const points: string[] = [];
    const steps = 100;
    
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * 100;
      const y = waterLevel + Math.sin((x / 100) * Math.PI * 2 * waveFrequency + phase) * amplitude;
      points.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
    }
    
    // Close the path at the bottom
    points.push(`L 100 100`);
    points.push(`L 0 100`);
    points.push(`Z`);
    
    return points.join(' ');
  };

  if (!mounted) {
    return (
      <div 
        className={`liquid-wave-container ${className}`}
        style={{ 
          height: effectiveHeight, 
          width,
          borderRadius,
        }}
      />
    );
  }

  return (
    <>
      <div 
        ref={containerRef}
        className={`liquid-wave-container ${isIndeterminate ? 'indeterminate' : ''} ${className}`}
        style={{ 
          '--wave-speed': `${3 / speed}s`,
          '--wave-amplitude': `${waveAmplitude}px`,
          '--primary-color': colors.primary,
          '--secondary-color': colors.secondary,
          '--glow-color': colors.glow,
          height: effectiveHeight, 
          width,
          borderRadius,
        } as React.CSSProperties}
        role="progressbar"
        aria-valuenow={isIndeterminate ? undefined : Math.round(animatedProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={isIndeterminate ? 'Loading...' : `Progress: ${Math.round(animatedProgress)}%`}
      >
        {/* Background */}
        <div className="liquid-wave-bg" />
        
        {/* Glow effect */}
        {showGlow && !prefersReducedMotion && (
          <div 
            className="liquid-wave-glow"
            style={{
              top: `${waterLevel}%`,
            }}
          />
        )}
        
        {/* SVG Wave */}
        <svg 
          className="liquid-wave-svg"
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colors.primary} stopOpacity="0.9" />
              <stop offset="100%" stopColor={colors.secondary} stopOpacity="1" />
            </linearGradient>
            <linearGradient id="liquidGradientLight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colors.primary} stopOpacity="0.4" />
              <stop offset="100%" stopColor={colors.secondary} stopOpacity="0.6" />
            </linearGradient>
          </defs>
          
          {/* Back wave (lighter, different phase) */}
          <path
            className={`liquid-wave-path wave-back ${prefersReducedMotion ? 'reduced' : ''}`}
            d={generateWavePath(Math.PI, waveAmplitude * 0.8)}
            fill="url(#liquidGradientLight)"
          />
          
          {/* Front wave (main) */}
          <path
            className={`liquid-wave-path wave-front ${prefersReducedMotion ? 'reduced' : ''}`}
            d={generateWavePath(0, waveAmplitude)}
            fill="url(#liquidGradient)"
          />
        </svg>
        
        {/* Bubbles */}
        {showBubbles && !prefersReducedMotion && animatedProgress > 5 && (
          <div className="liquid-wave-bubbles">
            {bubbles.map(bubble => (
              <Bubble
                key={bubble.id}
                delay={bubble.delay}
                duration={bubble.duration}
                size={bubble.size}
                left={bubble.left}
                color={colors.primary}
              />
            ))}
          </div>
        )}
        
        {/* Label */}
        {showLabel && !isIndeterminate && labelPosition === 'inside' && (
          <div className="liquid-wave-label">
            {Math.round(animatedProgress)}%
          </div>
        )}
      </div>
      
      {/* External label */}
      {showLabel && !isIndeterminate && labelPosition === 'above' && (
        <div className="liquid-wave-label-above">
          {Math.round(animatedProgress)}%
        </div>
      )}
      
      <style jsx>{`
        .liquid-wave-container {
          position: relative;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        :global(html.light) .liquid-wave-container {
          background: rgba(0, 0, 0, 0.03);
          border-color: rgba(0, 0, 0, 0.08);
        }
        
        .liquid-wave-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            transparent 0%,
            rgba(255, 255, 255, 0.02) 100%
          );
        }
        
        .liquid-wave-glow {
          position: absolute;
          left: 10%;
          right: 10%;
          height: 20px;
          background: var(--glow-color);
          filter: blur(12px);
          opacity: 0.8;
          transform: translateY(-50%);
          transition: top 0.3s ease-out;
        }
        
        .liquid-wave-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }
        
        .liquid-wave-path {
          transition: d 0.3s ease-out;
        }
        
        .liquid-wave-path.wave-front {
          animation: liquidWave var(--wave-speed) linear infinite;
        }
        
        .liquid-wave-path.wave-back {
          animation: liquidWave var(--wave-speed) linear infinite reverse;
          animation-delay: calc(var(--wave-speed) / -2);
        }
        
        .liquid-wave-path.reduced {
          animation: none;
        }
        
        @keyframes liquidWave {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .liquid-wave-bubbles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }
        
        .liquid-wave-bubble {
          position: absolute;
          bottom: 0;
          left: var(--bubble-left);
          width: var(--bubble-size);
          height: var(--bubble-size);
          background: radial-gradient(
            circle at 30% 30%,
            rgba(255, 255, 255, 0.8),
            var(--bubble-color) 60%,
            transparent 70%
          );
          border-radius: 50%;
          opacity: 0.6;
          animation: bubbleRise var(--bubble-duration) ease-in-out infinite;
          animation-delay: var(--bubble-delay);
        }
        
        @keyframes bubbleRise {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-${effectiveHeight * 1.2}px) scale(0.5);
            opacity: 0;
          }
        }
        
        .liquid-wave-label {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          color: white;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
          z-index: 10;
        }
        
        .liquid-wave-label-above {
          text-align: center;
          font-size: 12px;
          font-weight: 500;
          color: var(--primary-color);
          margin-top: 4px;
        }
        
        /* Indeterminate mode */
        .liquid-wave-container.indeterminate .wave-front,
        .liquid-wave-container.indeterminate .wave-back {
          animation-duration: 1.5s;
        }
        
        .liquid-wave-container.indeterminate .liquid-wave-glow {
          animation: glowPulse 2s ease-in-out infinite;
        }
        
        @keyframes glowPulse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.9;
          }
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .liquid-wave-path {
            animation: none !important;
          }
          .liquid-wave-bubble {
            animation: none !important;
            opacity: 0.4;
          }
          .liquid-wave-glow {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}

/**
 * Compact variant for inline use (e.g., in cards or buttons)
 */
export function LiquidWaveProgressCompact({
  progress,
  color = 'blue',
  className = '',
}: {
  progress?: number;
  color?: 'blue' | 'green' | 'purple' | 'amber';
  className?: string;
}) {
  return (
    <LiquidWaveProgress
      progress={progress}
      height={8}
      borderRadius={4}
      color={color}
      waveAmplitude={2}
      showBubbles={false}
      showGlow={false}
      compact
      className={className}
    />
  );
}

/**
 * Circular variant with liquid fill
 */
export function LiquidWaveCircle({
  progress = 0,
  size = 80,
  color = 'blue',
  showLabel = true,
  className = '',
}: {
  progress?: number;
  size?: number;
  color?: 'blue' | 'green' | 'purple' | 'amber';
  showLabel?: boolean;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  const colors = COLOR_PRESETS[color] || COLOR_PRESETS.blue;
  const waterLevel = 100 - animatedProgress;
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    if (!mounted) return;
    const target = Math.max(0, Math.min(100, progress));
    setAnimatedProgress(target);
  }, [progress, mounted]);
  
  return (
    <div 
      className={`liquid-wave-circle ${className}`}
      style={{
        width: size,
        height: size,
        '--primary-color': colors.primary,
        '--secondary-color': colors.secondary,
      } as React.CSSProperties}
    >
      <svg viewBox="0 0 100 100">
        <defs>
          <clipPath id="circleClip">
            <circle cx="50" cy="50" r="48" />
          </clipPath>
          <linearGradient id="circleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.primary} stopOpacity="0.9" />
            <stop offset="100%" stopColor={colors.secondary} stopOpacity="1" />
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle 
          cx="50" 
          cy="50" 
          r="48" 
          fill="rgba(255, 255, 255, 0.05)"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1"
        />
        
        {/* Liquid fill with wave */}
        <g clipPath="url(#circleClip)">
          <rect 
            x="0" 
            y={waterLevel} 
            width="100" 
            height={100 - waterLevel + 5}
            fill="url(#circleGradient)"
          >
            <animate
              attributeName="y"
              values={`${waterLevel};${waterLevel - 2};${waterLevel}`}
              dur="2s"
              repeatCount="indefinite"
            />
          </rect>
        </g>
        
        {/* Border ring */}
        <circle 
          cx="50" 
          cy="50" 
          r="48" 
          fill="none"
          stroke={colors.primary}
          strokeWidth="2"
          strokeOpacity="0.3"
        />
      </svg>
      
      {showLabel && (
        <div className="liquid-wave-circle-label">
          {Math.round(animatedProgress)}%
        </div>
      )}
      
      <style jsx>{`
        .liquid-wave-circle {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        
        .liquid-wave-circle svg {
          width: 100%;
          height: 100%;
        }
        
        .liquid-wave-circle-label {
          position: absolute;
          font-size: ${size * 0.2}px;
          font-weight: 600;
          color: var(--primary-color);
        }
        
        :global(html.light) .liquid-wave-circle circle[fill="rgba(255, 255, 255, 0.05)"] {
          fill: rgba(0, 0, 0, 0.03);
        }
        
        :global(html.light) .liquid-wave-circle circle[stroke="rgba(255, 255, 255, 0.1)"] {
          stroke: rgba(0, 0, 0, 0.08);
        }
      `}</style>
    </div>
  );
}

export default LiquidWaveProgress;
