'use client';

import { useState, useCallback } from 'react';
import { useAudioFeedback } from './AudioFeedback';

interface CopyTickerProps {
  ticker: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

/**
 * Animated copy-to-clipboard button for ticker symbols.
 * Features:
 * - Click to copy ticker to clipboard
 * - Animated icon transition (copy → checkmark → copy)
 * - Subtle scale bounce on success
 * - Glow effect matching brand colors
 * - Full light/dark mode support
 * - Keyboard accessible
 */
export function CopyTicker({ ticker, className = '', size = 'sm', showLabel = false }: CopyTickerProps) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { play: playAudio } = useAudioFeedback();

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(ticker);
      setCopied(true);
      playAudio('success');
      
      // Reset after animation
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      playAudio('error');
    }
  }, [ticker, playAudio]);

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const iconSize = {
    sm: 12,
    md: 16,
    lg: 20,
  };

  return (
    <button
      onClick={handleCopy}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        copy-ticker-btn
        ${sizeClasses[size]}
        ${copied ? 'copied' : ''}
        ${className}
      `}
      title={copied ? 'Copied!' : `Copy ${ticker}`}
      aria-label={copied ? `${ticker} copied to clipboard` : `Copy ${ticker} to clipboard`}
    >
      <span className="copy-ticker-icon-wrapper">
        {/* Copy icon */}
        <svg 
          className={`copy-ticker-icon copy-icon ${copied ? 'hidden' : ''}`}
          width={iconSize[size]} 
          height={iconSize[size]} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        
        {/* Checkmark icon - animated on success */}
        <svg 
          className={`copy-ticker-icon check-icon ${copied ? 'visible' : ''}`}
          width={iconSize[size]} 
          height={iconSize[size]} 
          viewBox="0 0 24 24" 
          fill="none"
        >
          <circle 
            className="check-circle"
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="2"
          />
          <path 
            className="check-path"
            d="M8 12l3 3 5-5" 
            stroke="currentColor" 
            strokeWidth="2.5"
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </span>
      
      {showLabel && (
        <span className="copy-ticker-label">
          {copied ? 'Copied!' : 'Copy'}
        </span>
      )}

      <style jsx>{`
        .copy-ticker-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 4px;
          border: none;
          border-radius: 6px;
          background: transparent;
          color: rgba(161, 161, 170, 0.7);
          cursor: pointer;
          transition: all 0.2s var(--spring-snappy, cubic-bezier(0.34, 1.56, 0.64, 1));
          position: relative;
          overflow: visible;
        }

        .copy-ticker-btn:hover {
          color: rgba(161, 161, 170, 1);
          background: rgba(255, 255, 255, 0.05);
          transform: scale(1.05);
        }

        .copy-ticker-btn:active {
          transform: scale(0.95);
        }

        .copy-ticker-btn.copied {
          color: #22c55e;
          animation: copy-success-bounce 0.4s var(--spring-bouncy, cubic-bezier(0.34, 1.56, 0.64, 1));
        }

        .copy-ticker-btn.copied::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 10px;
          background: radial-gradient(circle, rgba(34, 197, 94, 0.3), transparent 70%);
          animation: copy-glow 0.6s ease-out forwards;
          pointer-events: none;
        }

        @keyframes copy-success-bounce {
          0% { transform: scale(1); }
          30% { transform: scale(1.2); }
          50% { transform: scale(0.9); }
          70% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        @keyframes copy-glow {
          0% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 1; }
          100% { opacity: 0; transform: scale(1.5); }
        }

        .copy-ticker-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .copy-ticker-icon {
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .copy-icon {
          opacity: 1;
          transform: scale(1);
        }

        .copy-icon.hidden {
          opacity: 0;
          transform: scale(0.5) rotate(-10deg);
          position: absolute;
        }

        .check-icon {
          opacity: 0;
          transform: scale(0.5);
          position: absolute;
        }

        .check-icon.visible {
          opacity: 1;
          transform: scale(1);
          position: relative;
        }

        .check-circle {
          stroke-dasharray: 63;
          stroke-dashoffset: 63;
          transition: stroke-dashoffset 0.35s ease-out;
        }

        .check-icon.visible .check-circle {
          stroke-dashoffset: 0;
        }

        .check-path {
          stroke-dasharray: 20;
          stroke-dashoffset: 20;
          transition: stroke-dashoffset 0.25s ease-out 0.15s;
        }

        .check-icon.visible .check-path {
          stroke-dashoffset: 0;
        }

        .copy-ticker-label {
          font-weight: 500;
          white-space: nowrap;
        }

        /* Light mode */
        :global(.light) .copy-ticker-btn {
          color: rgba(113, 113, 122, 0.7);
        }

        :global(.light) .copy-ticker-btn:hover {
          color: rgba(113, 113, 122, 1);
          background: rgba(0, 0, 0, 0.05);
        }

        :global(.light) .copy-ticker-btn.copied {
          color: #16a34a;
        }

        :global(.light) .copy-ticker-btn.copied::after {
          background: radial-gradient(circle, rgba(22, 163, 74, 0.2), transparent 70%);
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .copy-ticker-btn,
          .copy-ticker-icon,
          .check-circle,
          .check-path {
            transition: none;
          }

          .copy-ticker-btn.copied {
            animation: none;
          }

          .copy-ticker-btn.copied::after {
            animation: none;
            opacity: 0.5;
          }
        }
      `}</style>
    </button>
  );
}

/**
 * Inline copy button that appears on hover for ticker text.
 * Wraps ticker symbol with copy-on-click functionality.
 */
export function CopyTickerInline({ ticker, className = '' }: { ticker: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(ticker);
      setCopied(true);
      setShowTooltip(true);
      
      setTimeout(() => {
        setCopied(false);
        setShowTooltip(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [ticker]);

  return (
    <span 
      className={`copy-ticker-inline ${copied ? 'copied' : ''} ${className}`}
      onClick={handleCopy}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleCopy()}
      title={copied ? 'Copied!' : 'Click to copy'}
    >
      {ticker}
      {showTooltip && (
        <span className="copy-tooltip">Copied!</span>
      )}

      <style jsx>{`
        .copy-ticker-inline {
          cursor: pointer;
          position: relative;
          display: inline-block;
          padding: 2px 6px;
          margin: -2px -6px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .copy-ticker-inline:hover {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .copy-ticker-inline:active {
          transform: scale(0.98);
        }

        .copy-ticker-inline.copied {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }

        .copy-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(-4px);
          padding: 4px 8px;
          font-size: 11px;
          font-weight: 500;
          color: white;
          background: rgba(34, 197, 94, 0.9);
          border-radius: 4px;
          white-space: nowrap;
          animation: tooltip-pop 0.3s var(--spring-bouncy, cubic-bezier(0.34, 1.56, 0.64, 1));
          pointer-events: none;
          z-index: 50;
        }

        .copy-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 4px solid transparent;
          border-top-color: rgba(34, 197, 94, 0.9);
        }

        @keyframes tooltip-pop {
          0% { 
            opacity: 0; 
            transform: translateX(-50%) translateY(0) scale(0.8); 
          }
          100% { 
            opacity: 1; 
            transform: translateX(-50%) translateY(-4px) scale(1); 
          }
        }

        /* Light mode */
        :global(.light) .copy-ticker-inline:hover {
          background: rgba(59, 130, 246, 0.08);
        }

        :global(.light) .copy-ticker-inline.copied {
          background: rgba(22, 163, 74, 0.1);
          color: #16a34a;
        }

        :global(.light) .copy-tooltip {
          background: rgba(22, 163, 74, 0.95);
        }

        :global(.light) .copy-tooltip::after {
          border-top-color: rgba(22, 163, 74, 0.95);
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .copy-ticker-inline {
            transition: none;
          }

          .copy-tooltip {
            animation: none;
          }
        }
      `}</style>
    </span>
  );
}
