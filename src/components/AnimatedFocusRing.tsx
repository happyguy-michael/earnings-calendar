'use client';

import { useEffect, useState } from 'react';

/**
 * AnimatedFocusRing
 * 
 * Premium animated focus indicator for keyboard navigation.
 * Shows a pulsing gradient glow around focused interactive elements.
 * 
 * Features:
 * - Only visible on keyboard focus (not mouse clicks)
 * - Animated gradient border with subtle pulse
 * - Brand-matched colors (blue/purple/pink)
 * - Respects prefers-reduced-motion
 * - Global CSS injection for consistent styling
 * 
 * 2026 Trend: Accessibility + Alive Interfaces
 */
export function AnimatedFocusRing() {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);

  useEffect(() => {
    // Detect keyboard vs mouse usage
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsKeyboardUser(true);
        document.body.classList.add('keyboard-user');
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
      document.body.classList.remove('keyboard-user');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Inject focus ring styles
  useEffect(() => {
    const styleId = 'animated-focus-ring-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* ============================================
         Animated Focus Ring System
         Premium keyboard focus indicators
         ============================================ */
      
      /* Base focus outline reset */
      *:focus {
        outline: none;
      }
      
      /* Focus-visible for keyboard users only */
      .keyboard-user *:focus-visible,
      .keyboard-user a:focus,
      .keyboard-user button:focus,
      .keyboard-user [tabindex]:focus {
        outline: none;
        position: relative;
      }
      
      /* Animated focus ring pseudo-element */
      .keyboard-user a:focus::after,
      .keyboard-user button:focus::after,
      .keyboard-user [tabindex="0"]:focus::after,
      .keyboard-user .filter-chip:focus::after,
      .keyboard-user .earnings-row:focus::after,
      .keyboard-user .tilt-stat-card:focus::after {
        content: '';
        position: absolute;
        inset: -3px;
        border-radius: inherit;
        background: linear-gradient(
          135deg,
          rgba(59, 130, 246, 0.6) 0%,
          rgba(139, 92, 246, 0.5) 50%,
          rgba(236, 72, 153, 0.4) 100%
        );
        z-index: -1;
        opacity: 0;
        animation: focus-ring-appear 0.2s ease-out forwards,
                   focus-ring-pulse 2s ease-in-out 0.2s infinite;
        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        mask-composite: exclude;
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        padding: 2px;
      }
      
      /* Focus glow shadow */
      .keyboard-user a:focus,
      .keyboard-user button:focus,
      .keyboard-user [tabindex="0"]:focus,
      .keyboard-user .filter-chip:focus,
      .keyboard-user .earnings-row:focus {
        box-shadow: 
          0 0 0 2px rgba(99, 102, 241, 0.3),
          0 0 20px rgba(99, 102, 241, 0.15),
          0 0 40px rgba(139, 92, 246, 0.1);
      }
      
      /* Appear animation */
      @keyframes focus-ring-appear {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      
      /* Pulse animation */
      @keyframes focus-ring-pulse {
        0%, 100% {
          opacity: 0.7;
          filter: brightness(1);
        }
        50% {
          opacity: 1;
          filter: brightness(1.2);
        }
      }
      
      /* Special styling for cards - outer glow instead */
      .keyboard-user .card:focus-within {
        box-shadow: 
          0 0 0 2px rgba(99, 102, 241, 0.4),
          0 0 30px rgba(99, 102, 241, 0.2),
          0 0 60px rgba(139, 92, 246, 0.15),
          0 4px 6px -1px rgba(0, 0, 0, 0.3),
          0 10px 15px -3px rgba(0, 0, 0, 0.3);
      }
      
      /* Navigation buttons special styling */
      .keyboard-user .magnetic-nav-btn:focus {
        background: rgba(99, 102, 241, 0.15) !important;
        color: #a5b4fc !important;
      }
      
      /* Filter chips special styling */
      .keyboard-user .filter-chip:focus {
        transform: translateY(-1px);
      }
      
      /* Light mode adjustments */
      html.light .keyboard-user a:focus,
      html.light .keyboard-user button:focus,
      html.light .keyboard-user [tabindex="0"]:focus,
      html.light .keyboard-user .filter-chip:focus {
        box-shadow: 
          0 0 0 2px rgba(99, 102, 241, 0.4),
          0 0 15px rgba(99, 102, 241, 0.15),
          0 0 30px rgba(139, 92, 246, 0.1);
      }
      
      html.light .keyboard-user .card:focus-within {
        box-shadow: 
          0 0 0 2px rgba(99, 102, 241, 0.5),
          0 0 25px rgba(99, 102, 241, 0.15),
          0 4px 6px -1px rgba(0, 0, 0, 0.08),
          0 10px 15px -3px rgba(0, 0, 0, 0.08);
      }
      
      /* Reduced motion - simpler focus states */
      @media (prefers-reduced-motion: reduce) {
        .keyboard-user a:focus::after,
        .keyboard-user button:focus::after,
        .keyboard-user [tabindex="0"]:focus::after,
        .keyboard-user .filter-chip:focus::after,
        .keyboard-user .earnings-row:focus::after {
          animation: none;
          opacity: 0.8;
        }
        
        @keyframes focus-ring-pulse {
          0%, 100% { opacity: 0.8; }
        }
      }
      
      /* Skip link styling (accessibility) */
      .skip-link {
        position: absolute;
        top: -100px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 24px;
        background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
        color: white;
        border-radius: 12px;
        font-weight: 600;
        font-size: 14px;
        z-index: 9999;
        transition: top 0.2s ease;
        text-decoration: none;
        box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
      }
      
      .skip-link:focus {
        top: 16px;
      }
      
      /* Focus indicator for interactive elements inside cards */
      .keyboard-user .earnings-row:focus {
        outline: none;
        border-color: rgba(99, 102, 241, 0.5);
        background: rgba(99, 102, 241, 0.08);
      }
      
      /* Today button focus */
      .keyboard-user .today-button:focus {
        transform: scale(1.05);
        box-shadow: 
          0 0 0 2px rgba(99, 102, 241, 0.5),
          0 0 25px rgba(99, 102, 241, 0.3);
      }
    `;
    
    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  return null; // This component only injects styles
}

/**
 * SkipLink - Accessibility skip navigation link
 * Allows keyboard users to skip to main content
 */
export function SkipLink({ targetId = 'main-content' }: { targetId?: string }) {
  return (
    <a href={`#${targetId}`} className="skip-link">
      Skip to main content
    </a>
  );
}
