'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * PrintButton Component
 * 
 * A minimal print trigger with keyboard shortcut support.
 * Adds data attribute with current URL for print footer.
 * 
 * Features:
 * - Cmd/Ctrl+P keyboard shortcut hint
 * - Sets body data-print-url for footer
 * - Optional compact mode class toggle
 * - Respects prefers-reduced-motion
 * 
 * @example
 * <PrintButton />
 * <PrintButton compact className="my-4" />
 */

interface PrintButtonProps {
  /** Enable compact print mode (denser layout) */
  compact?: boolean;
  /** Additional className */
  className?: string;
  /** Button variant */
  variant?: 'icon' | 'text' | 'full';
  /** Show in floating action menu style */
  floating?: boolean;
}

export function PrintButton({ 
  compact = false, 
  className = '',
  variant = 'icon',
  floating = false
}: PrintButtonProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  
  const handlePrint = useCallback(() => {
    // Set URL for print footer
    document.body.setAttribute('data-print-url', window.location.href);
    
    // Toggle compact mode if requested
    if (compact) {
      document.body.classList.add('print-compact');
    }
    
    setIsPrinting(true);
    
    // Small delay to let styles apply
    requestAnimationFrame(() => {
      window.print();
      
      // Cleanup after print dialog closes
      setTimeout(() => {
        if (compact) {
          document.body.classList.remove('print-compact');
        }
        setIsPrinting(false);
      }, 100);
    });
  }, [compact]);
  
  // Listen for beforeprint/afterprint events
  useEffect(() => {
    const handleBeforePrint = () => {
      document.body.setAttribute('data-print-url', window.location.href);
      setIsPrinting(true);
    };
    
    const handleAfterPrint = () => {
      setIsPrinting(false);
    };
    
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);
  
  const baseStyles = floating
    ? 'fixed bottom-20 right-4 z-40 p-3 rounded-full bg-black/80 dark:bg-white/10 backdrop-blur-xl border border-white/10 shadow-lg hover:scale-105 active:scale-95 transition-transform'
    : 'inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm text-white/70 hover:text-white';
  
  const iconOnlyStyles = 'p-2';
  
  return (
    <button
      onClick={handlePrint}
      className={`${baseStyles} ${variant === 'icon' ? iconOnlyStyles : ''} ${className}`}
      title="Print calendar (Cmd/Ctrl+P)"
      aria-label="Print earnings calendar"
      data-print-show="true"
      disabled={isPrinting}
    >
      {/* Printer Icon */}
      <svg 
        width={variant === 'icon' ? 18 : 16} 
        height={variant === 'icon' ? 18 : 16} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={isPrinting ? 'animate-pulse' : ''}
      >
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
      
      {variant === 'text' && (
        <span>Print</span>
      )}
      
      {variant === 'full' && (
        <>
          <span>Print Calendar</span>
          <kbd className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-white/10 rounded border border-white/20">
            ⌘P
          </kbd>
        </>
      )}
    </button>
  );
}

/**
 * PrintStyles Component
 * 
 * Injects print-specific metadata. Add to layout for full support.
 * Already included in globals.css, but this adds dynamic URL support.
 */
export function PrintStylesProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Set initial print URL
    document.body.setAttribute('data-print-url', window.location.href);
    
    // Update on route changes
    const updateUrl = () => {
      document.body.setAttribute('data-print-url', window.location.href);
    };
    
    window.addEventListener('popstate', updateUrl);
    
    return () => {
      window.removeEventListener('popstate', updateUrl);
    };
  }, []);
  
  return <>{children}</>;
}

export default PrintButton;
