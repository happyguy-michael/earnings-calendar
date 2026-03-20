'use client';

/**
 * NativeSpringEasing - Hardware-Accelerated Spring Physics via CSS linear()
 * 
 * Uses the CSS linear() timing function to create spring animations that run
 * entirely on the GPU compositor thread — no JavaScript animation loops needed.
 * 
 * Inspired by:
 * - Josh W. Comeau's "Springs and Bounces in Native CSS" article
 * - CSS Spring Easing Generator (kvin.me/css-springs)
 * - Linear Easing Generator by Jake Archibald & Adam Argyle
 * 
 * Browser Support:
 * - Chrome 113+ (May 2023)
 * - Firefox 112+ (April 2023)
 * - Safari 17.2+ (December 2023)
 * - Falls back to cubic-bezier ease-out for older browsers
 * 
 * Why native springs matter:
 * 1. Run on compositor thread (won't jank if main thread is busy)
 * 2. Can animate any CSS property (not just transform/opacity)
 * 3. Zero JavaScript overhead during animation
 * 4. Battery efficient on mobile devices
 * 5. Works with CSS transitions AND keyframe animations
 */

import { createContext, useContext, useMemo, useCallback, ReactNode } from 'react';

// Pre-computed spring curves using CSS linear()
// Generated using spring physics simulation with various stiffness/damping configs
export const SPRING_EASINGS = {
  // Snappy - Quick response, subtle overshoot (stiffness: 400, damping: 25)
  // Good for: buttons, toggles, small UI elements
  snappy: {
    easing: `linear(
      0, 0.0027, 0.0106 1.19%, 0.0425, 0.0957 4.77%, 0.1826 7.93%, 0.3052 11.09%,
      0.5018 16.63%, 0.6126 19.79%, 0.7269, 0.8272 27.1%, 0.8963, 0.9454 34.01%,
      0.9782 37.16%, 0.9978 40.71%, 1.0094 44.25%, 1.0153 48.19%, 1.0169 52.92%,
      1.015 57.65%, 1.0107 63.17%, 1.0058 68.69%, 1.0015 77.76%, 0.9996 90.37%, 1
    )`,
    duration: 500,
    fallback: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
  },

  // Bouncy - Visible bounce, playful feel (stiffness: 250, damping: 15)
  // Good for: notifications, attention-grabbing elements, celebrations
  bouncy: {
    easing: `linear(
      0, 0.0018, 0.0069 1.15%, 0.026 2.3%, 0.0637, 0.1135 5.18%, 0.2229 7.78%,
      0.5977 15.84%, 0.7014, 0.7904, 0.8641, 0.9228, 0.9676 28.8%,
      1.0032 31.68%, 1.0225, 1.0352 36.29%, 1.0431 38.88%, 1.046 42.05%,
      1.0448 44.35%, 1.0407 47.23%, 1.0118 61.63%, 1.0025 69.41%,
      0.9981 80.35%, 0.9992 99.94%
    )`,
    duration: 833,
    fallback: 'cubic-bezier(0.34, 1.72, 0.64, 1)'
  },

  // Gentle - Slow, elegant settle (stiffness: 150, damping: 20)
  // Good for: modals, page transitions, large elements
  gentle: {
    easing: `linear(
      0, 0.0011, 0.0045 1.35%, 0.0179 2.69%, 0.0695 5.39%, 0.1538 8.98%,
      0.2693 12.58%, 0.4104 16.77%, 0.5577 21.26%, 0.6851 25.75%,
      0.7854 30.24%, 0.8574 34.43%, 0.9077 38.02%, 0.9438 41.62%,
      0.9694 45.51%, 0.9863 49.7%, 0.996 54.19%, 1.0012 59.28%,
      1.0036 65.27%, 1.004 72.75%, 1.0027 81.14%, 1.0009 91.32%, 1
    )`,
    duration: 900,
    fallback: 'cubic-bezier(0.22, 1.18, 0.36, 1)'
  },

  // Stiff - Fast, minimal overshoot (stiffness: 500, damping: 35)
  // Good for: instant feedback, error shakes, micro-interactions
  stiff: {
    easing: `linear(
      0, 0.0039, 0.0157 0.95%, 0.0618 1.9%, 0.1353 2.86%, 0.2714 4.29%,
      0.4485 5.71%, 0.6259 7.14%, 0.7639 8.57%, 0.8619 10%, 0.9264 11.43%,
      0.9673 13.33%, 0.9899 15.24%, 1.0015 17.62%, 1.0068 20.48%, 1.0083 24.29%,
      1.0068 28.57%, 1.0041 33.81%, 1.0016 40.95%, 1.0002 51.43%, 1
    )`,
    duration: 350,
    fallback: 'cubic-bezier(0.5, 1.2, 0.55, 1)'
  },

  // Heavy - Like moving something with mass (stiffness: 120, damping: 12)
  // Good for: draggable elements, cards, panels
  heavy: {
    easing: `linear(
      0, 0.0007, 0.0028 1.52%, 0.0112 3.03%, 0.0251 4.55%, 0.0889 9.09%,
      0.1846 13.64%, 0.3041 18.18%, 0.4374 22.73%, 0.5713 27.27%,
      0.6921 31.82%, 0.7913 36.36%, 0.8679 40.91%, 0.9236 45.45%,
      0.9612 50%, 0.9847 54.55%, 0.9976 59.09%, 1.003 63.64%,
      1.0041 68.18%, 1.0026 75%, 1.0005 84.85%, 0.9995 95.45%, 1
    )`,
    duration: 1100,
    fallback: 'cubic-bezier(0.22, 1.0, 0.36, 1)'
  },

  // Elastic - Strong bounce, cartoon-like (stiffness: 200, damping: 10)
  // Good for: fun UI, gamification, emphasis
  elastic: {
    easing: `linear(
      0, 0.0013, 0.0052 1.31%, 0.0208 2.63%, 0.0814 5.26%,
      0.1716 7.89%, 0.5183 15.79%, 0.7121 21.05%, 0.8484 26.32%,
      0.9408 31.58%, 0.9975 36.84%, 1.0309 42.11%, 1.0477 47.37%,
      1.0528 52.63%, 1.0491 57.89%, 1.0385 63.16%, 1.0234 68.42%,
      1.0099 75%, 1.0017 82.89%, 0.9987 92.11%, 1
    )`,
    duration: 1000,
    fallback: 'cubic-bezier(0.34, 1.8, 0.64, 1)'
  },

  // Wobble - Multiple oscillations (for attention/error states)
  // Good for: validation errors, shake effects
  wobble: {
    easing: `linear(
      0, 0.25 6.25%, 0.5 12.5%, 0.75 18.75%, 1 25%, 0.875 31.25%,
      0.75 37.5%, 0.875 43.75%, 1 50%, 0.9375 56.25%, 0.875 62.5%,
      0.9375 68.75%, 1 75%, 0.96875 81.25%, 0.9375 87.5%, 0.96875 93.75%, 1
    )`,
    duration: 600,
    fallback: 'cubic-bezier(0.36, 0.07, 0.19, 0.97)'
  },

  // Overshoot - Goes past, then settles (for "pop" effects)
  // Good for: appearing elements, scale animations
  overshoot: {
    easing: `linear(
      0, 0.0036, 0.0145 1.38%, 0.0568 2.76%, 0.1221 4.14%,
      0.2401 5.86%, 0.3863 7.59%, 0.5389 9.31%, 0.6797 11.03%,
      0.7987 12.76%, 0.8914 14.48%, 0.9596 16.21%, 1.0079 17.93%,
      1.0398 19.66%, 1.0586 21.72%, 1.0666 24.14%, 1.066 27.24%,
      1.0582 30.69%, 1.0455 34.48%, 1.0302 38.97%, 1.0153 44.14%,
      1.0049 50.69%, 0.9991 59.31%, 0.9984 71.03%, 1
    )`,
    duration: 600,
    fallback: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
  }
} as const;

export type SpringPreset = keyof typeof SPRING_EASINGS;

// CSS custom properties for spring animations
export const springVars = (preset: SpringPreset = 'snappy') => {
  const spring = SPRING_EASINGS[preset];
  return {
    '--spring-easing': spring.easing,
    '--spring-duration': `${spring.duration}ms`,
    '--spring-fallback': spring.fallback,
  } as React.CSSProperties;
};

// Hook to get spring transition string
export function useSpringTransition(
  properties: string | string[],
  preset: SpringPreset = 'snappy'
) {
  const spring = SPRING_EASINGS[preset];
  const props = Array.isArray(properties) ? properties : [properties];
  
  return useMemo(() => ({
    transition: props.map(p => `${p} ${spring.duration}ms ${spring.easing}`).join(', '),
    // Fallback for older browsers (detected via @supports)
    fallbackTransition: props.map(p => `${p} ${spring.duration}ms ${spring.fallback}`).join(', '),
    duration: spring.duration,
    easing: spring.easing,
  }), [props, preset, spring]);
}

// Provider for global spring configuration
interface SpringContextValue {
  preset: SpringPreset;
  getTransition: (properties: string | string[]) => string;
  getAnimation: (keyframeName: string) => string;
  easing: string;
  duration: number;
}

const SpringContext = createContext<SpringContextValue | null>(null);

export function SpringEasingProvider({
  children,
  preset = 'snappy',
  disabled = false,
}: {
  children: ReactNode;
  preset?: SpringPreset;
  disabled?: boolean;
}) {
  const spring = SPRING_EASINGS[disabled ? 'stiff' : preset];
  
  const getTransition = useCallback((properties: string | string[]) => {
    const props = Array.isArray(properties) ? properties : [properties];
    return props.map(p => `${p} ${spring.duration}ms ${spring.easing}`).join(', ');
  }, [spring]);

  const getAnimation = useCallback((keyframeName: string) => {
    return `${keyframeName} ${spring.duration}ms ${spring.easing}`;
  }, [spring]);

  const value = useMemo(() => ({
    preset: disabled ? 'stiff' : preset,
    getTransition,
    getAnimation,
    easing: spring.easing,
    duration: spring.duration,
  }), [preset, disabled, getTransition, getAnimation, spring]);

  return (
    <SpringContext.Provider value={value}>
      {children}
    </SpringContext.Provider>
  );
}

export function useSpringEasing() {
  const context = useContext(SpringContext);
  if (!context) {
    // Return default values if used outside provider
    const spring = SPRING_EASINGS.snappy;
    return {
      preset: 'snappy' as SpringPreset,
      getTransition: (props: string | string[]) => {
        const p = Array.isArray(props) ? props : [props];
        return p.map(pr => `${pr} ${spring.duration}ms ${spring.easing}`).join(', ');
      },
      getAnimation: (name: string) => `${name} ${spring.duration}ms ${spring.easing}`,
      easing: spring.easing,
      duration: spring.duration,
    };
  }
  return context;
}

// Utility component for spring-animated transitions
interface SpringTransitionProps {
  children: ReactNode;
  preset?: SpringPreset;
  properties?: string[];
  className?: string;
  style?: React.CSSProperties;
  as?: React.ElementType;
}

export function SpringTransition({
  children,
  preset = 'snappy',
  properties = ['transform', 'opacity'],
  className,
  style,
  as: Component = 'div',
}: SpringTransitionProps) {
  const spring = SPRING_EASINGS[preset];
  const transition = properties
    .map(p => `${p} ${spring.duration}ms ${spring.easing}`)
    .join(', ');

  return (
    <Component
      className={className}
      style={{
        transition,
        ...style,
      }}
    >
      {children}
    </Component>
  );
}

// CSS-only spring scale animation (for buttons, cards)
interface SpringScaleProps {
  children: ReactNode;
  preset?: SpringPreset;
  hoverScale?: number;
  activeScale?: number;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export function SpringScale({
  children,
  preset = 'bouncy',
  hoverScale = 1.02,
  activeScale = 0.98,
  className,
  style,
  disabled = false,
}: SpringScaleProps) {
  const spring = SPRING_EASINGS[preset];

  return (
    <div
      className={className}
      style={{
        ...style,
        transition: `transform ${spring.duration}ms ${spring.easing}`,
        cursor: disabled ? 'default' : 'pointer',
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.transform = `scale(${hoverScale})`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
      onMouseDown={(e) => {
        if (!disabled) e.currentTarget.style.transform = `scale(${activeScale})`;
      }}
      onMouseUp={(e) => {
        if (!disabled) e.currentTarget.style.transform = `scale(${hoverScale})`;
      }}
    >
      {children}
    </div>
  );
}

// Global styles injection for CSS variables
export function SpringEasingStyles() {
  return (
    <style jsx global>{`
      :root {
        /* Snappy - buttons, toggles */
        --spring-snappy-easing: ${SPRING_EASINGS.snappy.easing};
        --spring-snappy-duration: ${SPRING_EASINGS.snappy.duration}ms;
        
        /* Bouncy - notifications, celebrations */
        --spring-bouncy-easing: ${SPRING_EASINGS.bouncy.easing};
        --spring-bouncy-duration: ${SPRING_EASINGS.bouncy.duration}ms;
        
        /* Gentle - modals, page transitions */
        --spring-gentle-easing: ${SPRING_EASINGS.gentle.easing};
        --spring-gentle-duration: ${SPRING_EASINGS.gentle.duration}ms;
        
        /* Stiff - instant feedback */
        --spring-stiff-easing: ${SPRING_EASINGS.stiff.easing};
        --spring-stiff-duration: ${SPRING_EASINGS.stiff.duration}ms;
        
        /* Heavy - draggable elements */
        --spring-heavy-easing: ${SPRING_EASINGS.heavy.easing};
        --spring-heavy-duration: ${SPRING_EASINGS.heavy.duration}ms;
        
        /* Elastic - fun UI, gamification */
        --spring-elastic-easing: ${SPRING_EASINGS.elastic.easing};
        --spring-elastic-duration: ${SPRING_EASINGS.elastic.duration}ms;
        
        /* Overshoot - pop effects */
        --spring-overshoot-easing: ${SPRING_EASINGS.overshoot.easing};
        --spring-overshoot-duration: ${SPRING_EASINGS.overshoot.duration}ms;
        
        /* Wobble - error/shake */
        --spring-wobble-easing: ${SPRING_EASINGS.wobble.easing};
        --spring-wobble-duration: ${SPRING_EASINGS.wobble.duration}ms;
      }
      
      /* Utility classes for common spring transitions */
      .spring-snappy {
        transition: all var(--spring-snappy-duration) var(--spring-snappy-easing);
      }
      .spring-bouncy {
        transition: all var(--spring-bouncy-duration) var(--spring-bouncy-easing);
      }
      .spring-gentle {
        transition: all var(--spring-gentle-duration) var(--spring-gentle-easing);
      }
      .spring-stiff {
        transition: all var(--spring-stiff-duration) var(--spring-stiff-easing);
      }
      .spring-heavy {
        transition: all var(--spring-heavy-duration) var(--spring-heavy-easing);
      }
      .spring-elastic {
        transition: all var(--spring-elastic-duration) var(--spring-elastic-easing);
      }
      .spring-overshoot {
        transition: all var(--spring-overshoot-duration) var(--spring-overshoot-easing);
      }
      .spring-wobble {
        transition: all var(--spring-wobble-duration) var(--spring-wobble-easing);
      }
      
      /* Reduced motion support */
      @media (prefers-reduced-motion: reduce) {
        .spring-snappy,
        .spring-bouncy,
        .spring-gentle,
        .spring-stiff,
        .spring-heavy,
        .spring-elastic,
        .spring-overshoot,
        .spring-wobble {
          transition: none !important;
        }
      }
      
      /* Feature detection fallback for older browsers */
      @supports not (transition-timing-function: linear(0, 1)) {
        :root {
          --spring-snappy-easing: ${SPRING_EASINGS.snappy.fallback};
          --spring-bouncy-easing: ${SPRING_EASINGS.bouncy.fallback};
          --spring-gentle-easing: ${SPRING_EASINGS.gentle.fallback};
          --spring-stiff-easing: ${SPRING_EASINGS.stiff.fallback};
          --spring-heavy-easing: ${SPRING_EASINGS.heavy.fallback};
          --spring-elastic-easing: ${SPRING_EASINGS.elastic.fallback};
          --spring-overshoot-easing: ${SPRING_EASINGS.overshoot.fallback};
          --spring-wobble-easing: ${SPRING_EASINGS.wobble.fallback};
        }
      }
    `}</style>
  );
}

export default SpringTransition;
