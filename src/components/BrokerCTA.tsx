'use client';

import { useState, useRef, useEffect } from 'react';

/**
 * BrokerCTA - Premium call-to-action button for broker affiliate links
 * 
 * Features:
 * - Gradient shimmer sweep on hover (holographic effect)
 * - Magnetic pull effect toward cursor
 * - Spring-bounce press animation
 * - Broker logos with fallback initials
 * - Glow pulse on hover for emphasis
 * - Light/dark mode support
 * - Respects prefers-reduced-motion
 */

type Broker = 'robinhood' | 'webull' | 'ibkr' | 'schwab' | 'fidelity' | 'etrade';

interface BrokerCTAProps {
  /** The broker to link to */
  broker: Broker;
  /** Stock ticker symbol */
  ticker: string;
  /** Optional custom label (defaults to "Trade on {Broker}") */
  label?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Compact mode - just icon */
  compact?: boolean;
  /** Animation delay for staggered reveals */
  delay?: number;
}

const BROKER_CONFIG: Record<Broker, { name: string; color: string; darkColor: string; url: (ticker: string) => string }> = {
  robinhood: {
    name: 'Robinhood',
    color: '#00C805',
    darkColor: '#00E106',
    url: (ticker) => `https://robinhood.com/stocks/${ticker}`,
  },
  webull: {
    name: 'Webull',
    color: '#F5A623',
    darkColor: '#FFB836',
    url: (ticker) => `https://app.webull.com/stocks/${ticker}`,
  },
  ibkr: {
    name: 'Interactive Brokers',
    color: '#D92127',
    darkColor: '#FF3B42',
    url: (ticker) => `https://www.interactivebrokers.com/en/trading/symbols.php?f=${ticker}`,
  },
  schwab: {
    name: 'Schwab',
    color: '#00A3E0',
    darkColor: '#00B8FF',
    url: (ticker) => `https://www.schwab.com/research/stocks/quotes/${ticker}`,
  },
  fidelity: {
    name: 'Fidelity',
    color: '#5B8F22',
    darkColor: '#6FA729',
    url: (ticker) => `https://digital.fidelity.com/prgw/digital/research/quote/dashboard/summary?symbol=${ticker}`,
  },
  etrade: {
    name: 'E*TRADE',
    color: '#6633CC',
    darkColor: '#8855EE',
    url: (ticker) => `https://us.etrade.com/research/stocks/${ticker}`,
  },
};

export function BrokerCTA({
  broker,
  ticker,
  label,
  size = 'md',
  compact = false,
  delay = 0,
}: BrokerCTAProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const config = BROKER_CONFIG[broker];

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Track mouse position for magnetic effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (prefersReducedMotion || !buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate offset from center (capped at 8px)
    const maxOffset = 8;
    const offsetX = Math.max(-maxOffset, Math.min(maxOffset, (e.clientX - centerX) * 0.15));
    const offsetY = Math.max(-maxOffset, Math.min(maxOffset, (e.clientY - centerY) * 0.15));
    
    setMousePos({ x: offsetX, y: offsetY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: 0, y: 0 });
  };

  const sizeClasses = {
    sm: 'broker-cta-sm',
    md: 'broker-cta-md',
    lg: 'broker-cta-lg',
  };

  const displayLabel = label || `Trade $${ticker} on ${config.name}`;

  return (
    <>
      <a
        ref={buttonRef}
        href={config.url(ticker)}
        target="_blank"
        rel="noopener noreferrer"
        className={`broker-cta ${sizeClasses[size]} ${compact ? 'broker-cta-compact' : ''} ${isHovered ? 'hovered' : ''} ${isPressed ? 'pressed' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        style={{
          '--broker-color': config.color,
          '--broker-color-dark': config.darkColor,
          '--magnetic-x': `${mousePos.x}px`,
          '--magnetic-y': `${mousePos.y}px`,
          '--entrance-delay': `${delay}ms`,
        } as React.CSSProperties}
      >
        {/* Background glow layer */}
        <span className="broker-cta-glow" aria-hidden="true" />
        
        {/* Shimmer sweep effect */}
        <span className="broker-cta-shimmer" aria-hidden="true" />
        
        {/* Border glow */}
        <span className="broker-cta-border-glow" aria-hidden="true" />
        
        {/* Content */}
        <span className="broker-cta-content">
          {/* Broker icon/initial */}
          <span className="broker-cta-icon">
            {broker === 'robinhood' && (
              <svg viewBox="0 0 24 24" fill="currentColor" className="broker-cta-svg">
                <path d="M11.812 3.674c-.597.135-1.145.42-1.59.828l-.22.2-.61-.137c-1.084-.244-2.164-.244-3.24.004-.306.07-.388.117-.541.31-.152.192-.206.367-.206.666 0 .3.054.475.206.667.153.193.235.24.541.31 1.076.248 2.156.248 3.24.004l.61-.137.22.2c.445.408.993.693 1.59.828.207.047.402.063.927.063.525 0 .72-.016.927-.063.597-.135 1.145-.42 1.59-.828l.22-.2.61.137c1.084.244 2.164.244 3.24-.004.306-.07.388-.117.541-.31.152-.192.206-.367.206-.666 0-.3-.054-.475-.206-.667-.153-.193-.235-.24-.541-.31-1.076-.248-2.156-.248-3.24-.004l-.61.137-.22-.2c-.445-.408-.993-.693-1.59-.828-.207-.047-.402-.063-.927-.063-.525 0-.72.016-.927.063z"/>
                <path d="M6.4 8.8c-1.32 0-2.4 1.08-2.4 2.4v6c0 1.32 1.08 2.4 2.4 2.4h11.2c1.32 0 2.4-1.08 2.4-2.4v-6c0-1.32-1.08-2.4-2.4-2.4H6.4zm5.6 2.4c1.656 0 3 1.344 3 3s-1.344 3-3 3-3-1.344-3-3 1.344-3 3-3z"/>
              </svg>
            )}
            {broker !== 'robinhood' && (
              <span className="broker-cta-initial">{config.name.charAt(0)}</span>
            )}
          </span>
          
          {/* Label */}
          {!compact && (
            <span className="broker-cta-label">
              Trade <span className="broker-cta-ticker">${ticker}</span>
            </span>
          )}
          
          {/* Arrow icon */}
          <svg className="broker-cta-arrow" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
          </svg>
        </span>
      </a>

      <style jsx>{`
        .broker-cta {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 16px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          font-weight: 600;
          font-size: 13px;
          text-decoration: none;
          cursor: pointer;
          overflow: hidden;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
                      border-color 0.2s ease,
                      box-shadow 0.3s ease;
          transform: translate(var(--magnetic-x, 0), var(--magnetic-y, 0));
          animation: broker-cta-entrance 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) var(--entrance-delay, 0ms) both;
        }

        @keyframes broker-cta-entrance {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .broker-cta-sm {
          padding: 6px 12px;
          font-size: 11px;
          border-radius: 8px;
        }

        .broker-cta-lg {
          padding: 14px 24px;
          font-size: 15px;
          border-radius: 14px;
        }

        .broker-cta-compact {
          padding: 8px;
          width: 36px;
          height: 36px;
        }

        .broker-cta.hovered {
          border-color: var(--broker-color-dark);
          box-shadow: 
            0 0 20px color-mix(in srgb, var(--broker-color) 30%, transparent),
            0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .broker-cta.pressed {
          transform: translate(var(--magnetic-x, 0), var(--magnetic-y, 0)) scale(0.96);
        }

        /* Background glow */
        .broker-cta-glow {
          position: absolute;
          inset: -2px;
          background: radial-gradient(
            circle at center,
            color-mix(in srgb, var(--broker-color) 20%, transparent) 0%,
            transparent 70%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .broker-cta.hovered .broker-cta-glow {
          opacity: 1;
        }

        /* Shimmer sweep effect */
        .broker-cta-shimmer {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            120deg,
            transparent 0%,
            rgba(255, 255, 255, 0.15) 50%,
            transparent 100%
          );
          pointer-events: none;
          transform: skewX(-20deg);
        }

        .broker-cta.hovered .broker-cta-shimmer {
          animation: broker-shimmer-sweep 0.8s ease;
        }

        @keyframes broker-shimmer-sweep {
          0% {
            left: -100%;
          }
          100% {
            left: 200%;
          }
        }

        /* Border glow effect */
        .broker-cta-border-glow {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(
            135deg,
            var(--broker-color) 0%,
            transparent 50%,
            var(--broker-color) 100%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .broker-cta.hovered .broker-cta-border-glow {
          opacity: 0.6;
        }

        /* Content */
        .broker-cta-content {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 1;
        }

        .broker-cta-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 6px;
          background: color-mix(in srgb, var(--broker-color) 20%, transparent);
          color: var(--broker-color-dark);
          transition: transform 0.2s ease, background 0.2s ease;
        }

        .broker-cta.hovered .broker-cta-icon {
          transform: scale(1.1);
          background: color-mix(in srgb, var(--broker-color) 30%, transparent);
        }

        .broker-cta-svg {
          width: 14px;
          height: 14px;
        }

        .broker-cta-initial {
          font-size: 12px;
          font-weight: 700;
        }

        .broker-cta-label {
          white-space: nowrap;
          color: rgba(255, 255, 255, 0.9);
        }

        .broker-cta-ticker {
          color: var(--broker-color-dark);
          font-weight: 700;
        }

        .broker-cta-arrow {
          width: 14px;
          height: 14px;
          color: rgba(255, 255, 255, 0.5);
          transition: transform 0.2s ease, color 0.2s ease;
        }

        .broker-cta.hovered .broker-cta-arrow {
          color: var(--broker-color-dark);
          transform: translate(2px, -2px);
        }

        /* Light mode */
        :global(html.light) .broker-cta {
          background: linear-gradient(135deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.02) 100%);
          border-color: rgba(0,0,0,0.08);
          color: #1f2937;
        }

        :global(html.light) .broker-cta.hovered {
          box-shadow: 
            0 0 25px color-mix(in srgb, var(--broker-color) 25%, transparent),
            0 4px 12px rgba(0, 0, 0, 0.1);
        }

        :global(html.light) .broker-cta-label {
          color: rgba(0, 0, 0, 0.8);
        }

        :global(html.light) .broker-cta-arrow {
          color: rgba(0, 0, 0, 0.4);
        }

        :global(html.light) .broker-cta-shimmer {
          background: linear-gradient(
            120deg,
            transparent 0%,
            rgba(255, 255, 255, 0.6) 50%,
            transparent 100%
          );
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .broker-cta {
            animation: none;
            transform: none !important;
          }

          .broker-cta-shimmer {
            animation: none !important;
          }

          .broker-cta.pressed {
            transform: none !important;
            opacity: 0.9;
          }
        }
      `}</style>
    </>
  );
}

/**
 * BrokerCTAGroup - Display multiple broker options
 */
export function BrokerCTAGroup({ 
  ticker,
  brokers = ['robinhood', 'webull', 'ibkr'],
  size = 'sm',
}: {
  ticker: string;
  brokers?: Broker[];
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <div className="broker-cta-group">
      {brokers.map((broker, index) => (
        <BrokerCTA
          key={broker}
          broker={broker}
          ticker={ticker}
          size={size}
          compact
          delay={index * 50}
        />
      ))}
      
      <style jsx>{`
        .broker-cta-group {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
      `}</style>
    </div>
  );
}

export default BrokerCTA;
