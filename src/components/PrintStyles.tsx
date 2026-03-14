'use client';

import { useEffect, useCallback } from 'react';

/**
 * PrintStyles - Premium print stylesheet for Earnings Calendar
 * 
 * Provides a clean, professional print layout that:
 * - Hides non-essential UI elements (nav, particles, animations)
 * - Uses printer-friendly colors (dark text on white)
 * - Formats earnings data in a clear, readable way
 * - Adds page breaks between weeks
 * - Shows a header with the date range
 * - Expands all tooltips/hidden data for print
 * 
 * Inspiration:
 * - Financial Times print layouts
 * - Bloomberg terminal print exports
 * - Google Calendar print view
 * 
 * Usage: Simply include <PrintStyles /> anywhere in your app.
 * The styles will automatically apply when printing (Cmd+P / Ctrl+P).
 * 
 * 2026 Trend: Professional print support for web apps
 */

export function PrintStyles() {
  // Optional: Add keyboard shortcut for print preview (Ctrl/Cmd+Shift+P)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'p') {
      e.preventDefault();
      window.print();
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <style jsx global>{`
      @media print {
        /* ============================================
           Base Print Reset
           ============================================ */
        
        /* Override dark mode - use light colors for print */
        :root {
          --bg-primary: #ffffff !important;
          --bg-secondary: #ffffff !important;
          --bg-tertiary: #f8f9fa !important;
          --text-primary: #1a1a1a !important;
          --text-secondary: #4a4a4a !important;
          --text-muted: #6a6a6a !important;
          --border-primary: #e0e0e0 !important;
          --border-secondary: #f0f0f0 !important;
        }
        
        html, body {
          background: white !important;
          color: #1a1a1a !important;
          font-size: 11pt !important;
          line-height: 1.4 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        /* Remove background images and gradients */
        body {
          background-image: none !important;
        }
        
        /* ============================================
           Hide Non-Essential Elements
           ============================================ */
        
        /* Hide interactive/decorative elements */
        .floating-particles,
        .grain-overlay,
        .cursor-trail,
        .animated-grid-background,
        .scroll-progress,
        .scroll-minimap,
        .scroll-anchored-week-badge,
        .back-to-top,
        .floating-action-menu,
        .theme-toggle,
        .motion-toggle,
        .haptic-toggle,
        .audio-toggle,
        .cursor-trail-toggle,
        .keyboard-shortcuts-overlay,
        .keyboard-shortcuts-hint,
        .command-trigger,
        .command-palette,
        .toast-container,
        .swipe-hint,
        .today-button,
        .pull-to-refresh,
        .ticker-ribbon,
        .data-freshness-indicator,
        .snapshot-toggle,
        .snapshot-indicator,
        .quick-peek-popup,
        .contextual-card-actions,
        .undo-toast,
        .key-press-echo,
        .week-nav-preview,
        .konami-easter-egg,
        .cursor-glow,
        .border-glow-spot,
        .orbit-dot,
        .imminentGlow,
        .search-kbd,
        .search-clear,
        .search-suggestions,
        .filter-glow,
        nav,
        .navigation-controls,
        .magnetic-nav-btn,
        footer {
          display: none !important;
        }
        
        /* Hide animations and transitions */
        * {
          animation: none !important;
          transition: none !important;
          transform: none !important;
        }
        
        /* Hide hover/focus states */
        *:hover,
        *:focus {
          box-shadow: none !important;
        }
        
        /* ============================================
           Header Styling for Print
           ============================================ */
        
        .sticky-header {
          position: static !important;
          background: transparent !important;
          backdrop-filter: none !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          margin-bottom: 20pt !important;
        }
        
        .sticky-header-inner {
          padding: 0 !important;
        }
        
        .sticky-header-title {
          font-size: 18pt !important;
          font-weight: 700 !important;
          color: #1a1a1a !important;
        }
        
        .sticky-header-title .text-gradient {
          background: none !important;
          -webkit-background-clip: unset !important;
          -webkit-text-fill-color: #1a1a1a !important;
        }
        
        .sticky-header-subtitle {
          font-size: 12pt !important;
          color: #4a4a4a !important;
          margin-top: 4pt !important;
        }
        
        /* Hide filter chips and search in print */
        .sticky-header-filters,
        .sticky-header-hints,
        .search-container {
          display: none !important;
        }
        
        /* ============================================
           Stats Grid for Print
           ============================================ */
        
        .stats-grid {
          display: grid !important;
          grid-template-columns: repeat(4, 1fr) !important;
          gap: 12pt !important;
          margin-bottom: 20pt !important;
          page-break-inside: avoid !important;
        }
        
        .stats-grid > * {
          background: #f8f9fa !important;
          border: 1pt solid #e0e0e0 !important;
          border-radius: 4pt !important;
          padding: 10pt !important;
        }
        
        .stats-grid .text-3xl,
        .stats-grid .text-2xl {
          font-size: 16pt !important;
          font-weight: 700 !important;
          color: #1a1a1a !important;
        }
        
        .stats-grid .text-xs {
          font-size: 8pt !important;
          color: #6a6a6a !important;
          text-transform: uppercase !important;
        }
        
        /* Hide stat icons/rings in print - just show numbers */
        .progress-ring,
        .animated-stat-icon,
        .glass-reflection,
        .cursor-glow-card::before {
          display: none !important;
        }
        
        /* ============================================
           Week Cards for Print
           ============================================ */
        
        .card.week-card-stagger,
        .card {
          background: white !important;
          border: 1pt solid #e0e0e0 !important;
          border-radius: 4pt !important;
          box-shadow: none !important;
          margin-bottom: 16pt !important;
          page-break-inside: avoid !important;
          backdrop-filter: none !important;
        }
        
        /* Week header (Mon-Fri) */
        .week-header {
          display: grid !important;
          grid-template-columns: repeat(5, 1fr) !important;
          gap: 8pt !important;
          padding: 10pt !important;
          border-bottom: 1pt solid #e0e0e0 !important;
          background: #f8f9fa !important;
        }
        
        .day-header {
          text-align: center !important;
          padding: 6pt !important;
        }
        
        .day-header .day-name {
          font-weight: 600 !important;
          font-size: 10pt !important;
          color: #4a4a4a !important;
        }
        
        .day-header .day-num {
          font-size: 12pt !important;
          font-weight: 700 !important;
          color: #1a1a1a !important;
        }
        
        .day-header.today {
          background: #e8f4fd !important;
          border-radius: 4pt !important;
        }
        
        /* Week content grid */
        .week-content {
          display: grid !important;
          grid-template-columns: repeat(5, 1fr) !important;
          gap: 8pt !important;
          padding: 10pt !important;
        }
        
        .day-column {
          min-height: 40pt !important;
        }
        
        /* ============================================
           Earnings Cards for Print
           ============================================ */
        
        .earnings-row,
        .earnings-card-wrapper {
          display: block !important;
          background: white !important;
          border: 0.5pt solid #e0e0e0 !important;
          border-radius: 3pt !important;
          padding: 6pt !important;
          margin-bottom: 4pt !important;
          page-break-inside: avoid !important;
          text-decoration: none !important;
          color: inherit !important;
        }
        
        .earnings-row::after,
        .earnings-row::before,
        .shimmer-sweep,
        .card-light-sweep,
        .ripple,
        .depth-hover,
        .animated-gradient-border {
          display: none !important;
        }
        
        /* Company logo - use text fallback */
        .logo-container {
          width: 24pt !important;
          height: 24pt !important;
          border-radius: 3pt !important;
          margin-right: 6pt !important;
          float: left !important;
        }
        
        .logo-container img {
          display: block !important;
        }
        
        .logo-container .logo-fallback {
          font-size: 10pt !important;
          font-weight: 600 !important;
        }
        
        /* Ticker and company name */
        .earnings-row .text-sm.font-semibold {
          font-size: 10pt !important;
          font-weight: 700 !important;
          color: #1a1a1a !important;
        }
        
        .earnings-row .text-xs.text-zinc-500 {
          font-size: 8pt !important;
          color: #6a6a6a !important;
        }
        
        /* ============================================
           Badges for Print
           ============================================ */
        
        .badge {
          display: inline-block !important;
          padding: 2pt 6pt !important;
          border-radius: 2pt !important;
          font-size: 8pt !important;
          font-weight: 600 !important;
          border: 0.5pt solid !important;
        }
        
        .badge-beat {
          background: #d4edda !important;
          color: #155724 !important;
          border-color: #c3e6cb !important;
        }
        
        .badge-miss {
          background: #f8d7da !important;
          color: #721c24 !important;
          border-color: #f5c6cb !important;
        }
        
        .badge-pending {
          background: #fff3cd !important;
          color: #856404 !important;
          border-color: #ffeeba !important;
        }
        
        .badge-neutral {
          background: #e9ecef !important;
          color: #495057 !important;
          border-color: #dee2e6 !important;
        }
        
        /* Hide sparkles and other decorative badge elements */
        .badge-sparkle,
        .exceptional-glow,
        .disaster-miss,
        .monster-beat-icon,
        .disaster-miss-icon {
          display: none !important;
        }
        
        /* ============================================
           Additional Print Elements
           ============================================ */
        
        /* Hide various micro-interaction components */
        .beat-streak-badge,
        .eps-trend-dots,
        .live-dot,
        .live-badge,
        .fresh-badge,
        .countdown-badge,
        .flip-countdown-badge,
        .time-since-inline,
        .revenue-indicator,
        .eps-comparison-badge,
        .surprise-magnitude-compact,
        .odds-gauge {
          display: none !important;
        }
        
        /* Show EPS data inline instead */
        .earnings-row .eps-data-print {
          display: block !important;
          font-size: 8pt !important;
          color: #4a4a4a !important;
        }
        
        /* Hide narrative and sentiment components */
        .today-narrative,
        .sentiment-pulse,
        .next-up-queue,
        .week-indicator,
        .session-progress-bar,
        .market-status,
        .market-mood-ring,
        .week-mood-header {
          display: none !important;
        }
        
        /* ============================================
           Page Layout
           ============================================ */
        
        @page {
          size: A4;
          margin: 15mm;
        }
        
        /* Add page break before each week card (except first) */
        .card.week-card-stagger:not(:first-of-type) {
          page-break-before: auto !important;
        }
        
        /* Force page break after week summary */
        .week-summary-card {
          page-break-after: always !important;
        }
        
        /* Print header with URL and date */
        @page {
          @top-right {
            content: "Printed from Earnings Calendar";
            font-size: 8pt;
            color: #999;
          }
          @bottom-center {
            content: counter(page) " of " counter(pages);
            font-size: 8pt;
            color: #999;
          }
        }
        
        /* ============================================
           Links for Print
           ============================================ */
        
        /* Remove link styling */
        a {
          color: inherit !important;
          text-decoration: none !important;
        }
        
        /* Optionally show URLs after links (commented out by default)
        a[href^="http"]::after {
          content: " (" attr(href) ")";
          font-size: 7pt;
          color: #999;
        }
        */
        
        /* ============================================
           Tooltip Content for Print
           ============================================ */
        
        /* Hide tooltips - data is already visible */
        .earnings-tooltip {
          display: none !important;
        }
        
        /* ============================================
           Empty State for Print
           ============================================ */
        
        .animated-empty-state,
        .search-empty-state {
          display: none !important;
        }
        
        .no-reports-message {
          font-style: italic !important;
          color: #999 !important;
          font-size: 9pt !important;
          text-align: center !important;
          padding: 10pt !important;
        }
        
        /* ============================================
           Print-specific additions
           ============================================ */
        
        /* Add a print header with current date range */
        .print-header {
          display: block !important;
          text-align: center !important;
          font-size: 10pt !important;
          color: #666 !important;
          margin-bottom: 10pt !important;
          padding-bottom: 10pt !important;
          border-bottom: 0.5pt solid #e0e0e0 !important;
        }
        
        /* Show date range in print */
        .print-date-range {
          display: block !important;
        }
      }
      
      /* Hide print-only elements in screen view */
      @media screen {
        .print-header,
        .print-date-range,
        .eps-data-print {
          display: none !important;
        }
      }
    `}</style>
  );
}

/**
 * PrintButton - Optional button to trigger print dialog
 * 
 * Can be placed anywhere in the UI to give users an obvious way to print.
 */
interface PrintButtonProps {
  className?: string;
  variant?: 'icon' | 'text' | 'full';
}

export function PrintButton({ className = '', variant = 'full' }: PrintButtonProps) {
  const handlePrint = () => {
    window.print();
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handlePrint}
        className={`print-button-icon ${className}`}
        aria-label="Print calendar"
        title="Print (⌘⇧P)"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 6 2 18 2 18 9" />
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <rect x="6" y="14" width="12" height="8" />
        </svg>
      </button>
    );
  }

  if (variant === 'text') {
    return (
      <button
        onClick={handlePrint}
        className={`print-button-text ${className}`}
        aria-label="Print calendar"
      >
        Print
      </button>
    );
  }

  return (
    <button
      onClick={handlePrint}
      className={`print-button-full ${className}`}
      aria-label="Print calendar"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
      <span>Print Calendar</span>
    </button>
  );
}

export default PrintStyles;
