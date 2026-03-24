'use client';

import { useState, useRef, useEffect, useCallback, ReactNode } from 'react';

interface ShareMenuProps {
  ticker: string;
  company: string;
  result?: 'beat' | 'miss' | 'met' | null;
  surprise?: number;
}

interface ShareOption {
  id: string;
  label: string;
  icon: ReactNode;
  color: string;
  action: (url: string, text: string) => void;
}

/**
 * ShareMenu - Premium share dialog with native Web Share API support
 * 
 * Features:
 * - Native share sheet on mobile (iOS/Android) via Web Share API
 * - Graceful fallback to custom dropdown on desktop
 * - Animated dropdown with staggered option reveals
 * - Social sharing: X (Twitter), LinkedIn, Reddit
 * - Copy link with animated checkmark feedback
 * - Keyboard accessible (Escape to close)
 * - Reduced motion support
 * 
 * 2026 Update: Added native share support for mobile devices,
 * providing a more seamless experience that integrates with the
 * user's installed apps (WhatsApp, Messages, etc.)
 */
export function ShareMenu({ ticker, company, result, surprise }: ShareMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [justOpened, setJustOpened] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Check for native Web Share API support
  useEffect(() => {
    // Web Share API is available in secure contexts on mobile browsers
    setCanNativeShare(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  // Generate share text
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/report/${ticker}` 
    : `/report/${ticker}`;
  
  const shareText = result 
    ? result === 'beat' 
      ? `${company} (${ticker}) earnings ✅ BEAT by ${Math.abs(surprise || 0).toFixed(1)}%! Check the analysis:`
      : result === 'met'
      ? `${company} (${ticker}) earnings 🎯 MET expectations! Check the analysis:`
      : `${company} (${ticker}) earnings ❌ MISSED by ${Math.abs(surprise || 0).toFixed(1)}%! Check the analysis:`
    : `${company} (${ticker}) earnings report - check the analysis:`;

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Native share using Web Share API (mobile)
  const handleNativeShare = useCallback(async () => {
    if (!canNativeShare) return false;
    
    try {
      await navigator.share({
        title: `${ticker} Earnings Report`,
        text: shareText,
        url: shareUrl,
      });
      return true;
    } catch (err) {
      // User cancelled or share failed - fall through to custom menu
      if (err instanceof Error && err.name !== 'AbortError') {
        console.warn('Native share failed:', err);
      }
      return false;
    }
  }, [canNativeShare, ticker, shareText, shareUrl]);

  const handleToggle = async () => {
    // On mobile with native share support, use the native share sheet
    if (canNativeShare) {
      const shared = await handleNativeShare();
      if (shared) return; // Successfully shared via native UI
      // If native share was cancelled/failed, fall through to custom menu
    }
    
    // Desktop or native share fallback: show custom dropdown
    if (!isOpen) {
      setJustOpened(true);
      setTimeout(() => setJustOpened(false), 300);
    }
    setIsOpen(!isOpen);
  };

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 1500);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = `${shareText}\n${shareUrl}`;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 1500);
    }
  }, [shareText, shareUrl]);

  const shareOptions: ShareOption[] = [
    {
      id: 'x',
      label: 'Post on X',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      color: 'hover:bg-zinc-800',
      action: (url, text) => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'width=550,height=420');
      }
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      color: 'hover:bg-[#0077b5]/20',
      action: (url, text) => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'width=550,height=420');
      }
    },
    {
      id: 'reddit',
      label: 'Reddit',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
        </svg>
      ),
      color: 'hover:bg-[#ff4500]/20',
      action: (url, text) => {
        window.open(`https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`, '_blank', 'width=550,height=420');
      }
    },
  ];

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className={`
          badge badge-neutral transition-smooth cursor-pointer
          ${isOpen ? 'bg-white/15 ring-1 ring-white/20' : 'hover:bg-white/10'}
        `}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className={`
            share-menu absolute right-0 top-full mt-2 z-50
            w-48 rounded-xl overflow-hidden
            bg-zinc-900/95 backdrop-blur-xl
            border border-white/10 shadow-2xl shadow-black/50
            ${justOpened ? 'share-menu-enter' : ''}
          `}
          role="menu"
          aria-label="Share options"
        >
          {/* Social Share Options */}
          {shareOptions.map((option, index) => (
            <button
              key={option.id}
              onClick={() => {
                option.action(shareUrl, shareText);
                setIsOpen(false);
              }}
              className={`
                share-option w-full flex items-center gap-3 px-4 py-3
                text-sm text-zinc-300 hover:text-white
                transition-all duration-200 ${option.color}
                border-b border-white/5 last:border-0
              `}
              style={{ animationDelay: `${index * 50}ms` }}
              role="menuitem"
            >
              <span className="share-icon flex items-center justify-center w-8 h-8 rounded-lg bg-white/5">
                {option.icon}
              </span>
              {option.label}
            </button>
          ))}

          {/* Copy Link */}
          <button
            onClick={handleCopy}
            className={`
              share-option w-full flex items-center gap-3 px-4 py-3
              text-sm transition-all duration-200
              ${copied 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'text-zinc-300 hover:text-white hover:bg-white/5'}
            `}
            style={{ animationDelay: `${shareOptions.length * 50}ms` }}
            role="menuitem"
          >
            <span className={`
              share-icon flex items-center justify-center w-8 h-8 rounded-lg
              transition-all duration-300
              ${copied ? 'bg-emerald-500/20' : 'bg-white/5'}
            `}>
              {copied ? (
                <svg className="w-4 h-4 text-emerald-400 copy-check" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
      )}

      <style jsx>{`
        .share-menu-enter {
          animation: shareMenuEnter 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes shareMenuEnter {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(-8px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .share-option {
          opacity: 0;
          animation: shareOptionEnter 0.3s ease-out forwards;
        }

        @keyframes shareOptionEnter {
          0% {
            opacity: 0;
            transform: translateX(-8px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .share-icon {
          transition: transform 0.2s ease;
        }

        .share-option:hover .share-icon {
          transform: scale(1.1);
        }

        .copy-check {
          animation: checkDraw 0.4s cubic-bezier(0.65, 0, 0.35, 1) forwards;
        }

        @keyframes checkDraw {
          0% {
            stroke-dasharray: 24;
            stroke-dashoffset: 24;
          }
          100% {
            stroke-dasharray: 24;
            stroke-dashoffset: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .share-menu-enter,
          .share-option,
          .copy-check {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
