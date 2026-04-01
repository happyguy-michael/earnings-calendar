'use client';

import { ReactNode, CSSProperties } from 'react';

/**
 * StartingStyleReveal - Pure CSS entry animations using @starting-style
 * 
 * Uses the modern CSS @starting-style rule (Baseline 2024) to create
 * smooth entrance animations without JavaScript timing hacks.
 * 
 * The @starting-style rule defines the initial state of an element
 * when it's first rendered, allowing the browser to automatically
 * transition from that state to the element's final state.
 * 
 * Benefits over JavaScript-based animations:
 * - No "flash of unstyled content" timing issues
 * - Compositor-thread optimized (better performance)
 * - Works with display:none → display:block transitions
 * - Cleaner code, no useEffect/setTimeout hacks
 * - Respects prefers-reduced-motion natively
 * 
 * @see https://developer.chrome.com/blog/new-in-web-ui-io-2024
 * 
 * @example
 * <StartingStyleReveal preset="fade-up">
 *   <Card>Content appears smoothly</Card>
 * </StartingStyleReveal>
 * 
 * @example
 * <StartingStyleReveal preset="scale" delay={100}>
 *   <Badge>Pop in effect</Badge>
 * </StartingStyleReveal>
 */

type RevealPreset = 
  | 'fade'
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'scale'
  | 'scale-fade'
  | 'blur'
  | 'blur-scale'
  | 'slide-up'
  | 'slide-down'
  | 'rotate'
  | 'flip';

interface StartingStyleRevealProps {
  children: ReactNode;
  /** Animation preset */
  preset?: RevealPreset;
  /** Animation duration in ms (default: 400) */
  duration?: number;
  /** Animation delay in ms (default: 0) */
  delay?: number;
  /** Custom easing function (default: cubic-bezier(0.22, 1, 0.36, 1)) */
  easing?: string;
  /** Additional className */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Enable/disable the animation (default: true) */
  enabled?: boolean;
  /** HTML tag to render (default: 'div') */
  as?: 'div' | 'span' | 'section' | 'article' | 'aside' | 'main' | 'header' | 'footer' | 'li' | 'p';
}

/**
 * Map presets to CSS class names
 * Actual styles are defined in globals.css using @starting-style
 */
const presetClasses: Record<RevealPreset, string> = {
  'fade': 'ss-reveal-fade',
  'fade-up': 'ss-reveal-fade-up',
  'fade-down': 'ss-reveal-fade-down',
  'fade-left': 'ss-reveal-fade-left',
  'fade-right': 'ss-reveal-fade-right',
  'scale': 'ss-reveal-scale',
  'scale-fade': 'ss-reveal-scale-fade',
  'blur': 'ss-reveal-blur',
  'blur-scale': 'ss-reveal-blur-scale',
  'slide-up': 'ss-reveal-slide-up',
  'slide-down': 'ss-reveal-slide-down',
  'rotate': 'ss-reveal-rotate',
  'flip': 'ss-reveal-flip',
};

export function StartingStyleReveal({
  children,
  preset = 'fade-up',
  duration = 400,
  delay = 0,
  easing = 'cubic-bezier(0.22, 1, 0.36, 1)',
  className = '',
  style,
  enabled = true,
  as = 'div',
}: StartingStyleRevealProps) {
  const presetClass = enabled ? presetClasses[preset] : '';
  
  const combinedStyle: CSSProperties = {
    ...style,
    '--ss-duration': `${duration}ms`,
    '--ss-delay': `${delay}ms`,
    '--ss-easing': easing,
  } as CSSProperties;

  const Tag = as;

  return (
    <Tag
      className={`ss-reveal-base ${presetClass} ${className}`.trim()}
      style={combinedStyle}
    >
      {children}
    </Tag>
  );
}

/**
 * StartingStyleGroup - Apply staggered delays to child reveals
 * 
 * @example
 * <StartingStyleGroup staggerDelay={50}>
 *   <StartingStyleReveal preset="fade-up">Item 1</StartingStyleReveal>
 *   <StartingStyleReveal preset="fade-up">Item 2</StartingStyleReveal>
 *   <StartingStyleReveal preset="fade-up">Item 3</StartingStyleReveal>
 * </StartingStyleGroup>
 */
interface StartingStyleGroupProps {
  children: ReactNode;
  /** Delay between each child in ms (default: 50) */
  staggerDelay?: number;
  /** Base delay before first child in ms (default: 0) */
  baseDelay?: number;
  /** Additional className */
  className?: string;
}

export function StartingStyleGroup({
  children,
  staggerDelay = 50,
  baseDelay = 0,
  className = '',
}: StartingStyleGroupProps) {
  return (
    <div 
      className={`ss-reveal-group ${className}`.trim()}
      style={{
        '--ss-stagger': `${staggerDelay}ms`,
        '--ss-base-delay': `${baseDelay}ms`,
      } as CSSProperties}
    >
      {children}
    </div>
  );
}

/**
 * useStartingStyleDelay - Hook for dynamic stagger calculation
 * 
 * @example
 * const items = ['a', 'b', 'c'];
 * {items.map((item, i) => (
 *   <StartingStyleReveal 
 *     key={item} 
 *     delay={useStartingStyleDelay(i, 50)}
 *   >
 *     {item}
 *   </StartingStyleReveal>
 * ))}
 */
export function useStartingStyleDelay(index: number, stagger: number = 50, baseDelay: number = 0): number {
  return baseDelay + (index * stagger);
}

export default StartingStyleReveal;
