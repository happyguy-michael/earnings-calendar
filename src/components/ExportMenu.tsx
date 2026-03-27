'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Earning } from '@/lib/types';
import { useToast } from './Toast';
import { useAudioFeedback } from './AudioFeedback';

interface ExportMenuProps {
  /** Earnings data to export */
  earnings: Earning[];
  /** Current week start date for filename */
  weekStart: Date;
  /** Additional CSS class */
  className?: string;
}

/**
 * ExportMenu - Export visible earnings to CSV
 * 
 * Provides a dropdown menu for exporting earnings data in CSV format
 * for analysis in Excel, Google Sheets, or other spreadsheet tools.
 * 
 * Features:
 * - Export to CSV with formatted headers
 * - Includes all available data fields
 * - Smart filename with date range
 * - Success/error toasts
 * - Keyboard accessible (Escape to close)
 * - Click outside to close
 * - Animated entrance/exit
 * 
 * 2026 Trend: Data portability and user ownership
 */
export function ExportMenu({ earnings, weekStart, className = '' }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { showToast } = useToast();
  const { play: playAudio } = useAudioFeedback();

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Format date for filename
  const formatDateForFilename = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get week end date (Friday)
  const getWeekEnd = (weekStart: Date): Date => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 4); // Friday
    return end;
  };

  // Generate CSV content
  const generateCSV = useCallback((data: Earning[]): string => {
    // CSV headers
    const headers = [
      'Date',
      'Ticker',
      'Company',
      'Time',
      'EPS Estimate',
      'EPS Actual',
      'Result',
      'Surprise %',
      'Revenue Estimate ($B)',
      'Revenue Actual ($B)',
      'Beat Odds %',
    ];

    // Format rows
    const rows = data.map(e => {
      const surprise = (e.eps !== undefined && e.eps !== null && e.estimate)
        ? ((e.eps - e.estimate) / Math.abs(e.estimate) * 100).toFixed(2)
        : '';

      return [
        e.date,
        e.ticker,
        `"${e.company.replace(/"/g, '""')}"`, // Escape quotes in company names
        e.time === 'pre' ? 'Pre-Market' : e.time === 'post' ? 'After-Hours' : '',
        e.estimate?.toFixed(2) ?? '',
        e.eps?.toFixed(2) ?? '',
        e.result ?? 'Pending',
        surprise,
        e.revenueEstimate?.toFixed(2) ?? '',
        e.revenue?.toFixed(2) ?? '',
        e.beatOdds?.toString() ?? '',
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }, []);

  // Download CSV file
  const downloadCSV = useCallback((content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  // Export all visible earnings
  const handleExportAll = useCallback(() => {
    if (earnings.length === 0) {
      showToast('No earnings to export', { type: 'warning', icon: '⚠️', duration: 2500 });
      return;
    }

    setIsExporting(true);
    playAudio('success');

    try {
      const csv = generateCSV(earnings);
      const weekEnd = getWeekEnd(weekStart);
      const filename = `earnings-${formatDateForFilename(weekStart)}-to-${formatDateForFilename(weekEnd)}.csv`;
      downloadCSV(csv, filename);
      
      showToast(`Exported ${earnings.length} earnings`, { 
        type: 'success', 
        icon: '✓', 
        duration: 2500 
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
      showToast('Export failed', { type: 'warning', icon: '⚠️', duration: 2500 });
    } finally {
      setIsExporting(false);
    }
  }, [earnings, weekStart, generateCSV, downloadCSV, showToast, playAudio]);

  // Export pending only
  const handleExportPending = useCallback(() => {
    const pending = earnings.filter(e => e.eps === undefined || e.eps === null);
    
    if (pending.length === 0) {
      showToast('No pending earnings to export', { type: 'warning', icon: '⚠️', duration: 2500 });
      return;
    }

    setIsExporting(true);
    playAudio('success');

    try {
      const csv = generateCSV(pending);
      const weekEnd = getWeekEnd(weekStart);
      const filename = `pending-earnings-${formatDateForFilename(weekStart)}-to-${formatDateForFilename(weekEnd)}.csv`;
      downloadCSV(csv, filename);
      
      showToast(`Exported ${pending.length} pending earnings`, { 
        type: 'success', 
        icon: '✓', 
        duration: 2500 
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
      showToast('Export failed', { type: 'warning', icon: '⚠️', duration: 2500 });
    } finally {
      setIsExporting(false);
    }
  }, [earnings, weekStart, generateCSV, downloadCSV, showToast, playAudio]);

  // Export reported only
  const handleExportReported = useCallback(() => {
    const reported = earnings.filter(e => e.eps !== undefined && e.eps !== null);
    
    if (reported.length === 0) {
      showToast('No reported earnings to export', { type: 'warning', icon: '⚠️', duration: 2500 });
      return;
    }

    setIsExporting(true);
    playAudio('success');

    try {
      const csv = generateCSV(reported);
      const weekEnd = getWeekEnd(weekStart);
      const filename = `reported-earnings-${formatDateForFilename(weekStart)}-to-${formatDateForFilename(weekEnd)}.csv`;
      downloadCSV(csv, filename);
      
      showToast(`Exported ${reported.length} reported earnings`, { 
        type: 'success', 
        icon: '✓', 
        duration: 2500 
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
      showToast('Export failed', { type: 'warning', icon: '⚠️', duration: 2500 });
    } finally {
      setIsExporting(false);
    }
  }, [earnings, weekStart, generateCSV, downloadCSV, showToast, playAudio]);

  // Copy to clipboard as TSV (for pasting into spreadsheets)
  const handleCopyToClipboard = useCallback(async () => {
    if (earnings.length === 0) {
      showToast('No earnings to copy', { type: 'warning', icon: '⚠️', duration: 2500 });
      return;
    }

    setIsExporting(true);
    playAudio('toggle');

    try {
      // Use TSV for better paste compatibility
      const tsv = generateCSV(earnings).replace(/,/g, '\t');
      await navigator.clipboard.writeText(tsv);
      
      showToast(`Copied ${earnings.length} earnings to clipboard`, { 
        type: 'success', 
        icon: '📋', 
        duration: 2500 
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Copy failed:', error);
      showToast('Copy failed', { type: 'warning', icon: '⚠️', duration: 2500 });
    } finally {
      setIsExporting(false);
    }
  }, [earnings, generateCSV, showToast, playAudio]);

  const pendingCount = earnings.filter(e => e.eps === undefined || e.eps === null).length;
  const reportedCount = earnings.filter(e => e.eps !== undefined && e.eps !== null).length;

  return (
    <div ref={menuRef} className={`export-menu-container ${className}`}>
      <button
        ref={buttonRef}
        onClick={() => {
          setIsOpen(!isOpen);
          playAudio('toggle');
        }}
        className={`export-menu-trigger ${isOpen ? 'active' : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Export earnings data"
        title="Export to CSV"
        disabled={isExporting}
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
          className="export-menu-icon"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        <span className="export-menu-label">Export</span>
      </button>

      {/* Dropdown menu */}
      <div 
        className={`export-menu-dropdown ${isOpen ? 'open' : ''}`}
        role="menu"
        aria-orientation="vertical"
      >
        <div className="export-menu-header">
          <span className="export-menu-title">Export Earnings</span>
          <span className="export-menu-count">{earnings.length} total</span>
        </div>

        <div className="export-menu-divider" />

        <button
          className="export-menu-item"
          onClick={handleExportAll}
          role="menuitem"
          disabled={isExporting || earnings.length === 0}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          <span>All Earnings</span>
          <span className="export-menu-item-count">{earnings.length}</span>
        </button>

        <button
          className="export-menu-item"
          onClick={handleExportPending}
          role="menuitem"
          disabled={isExporting || pendingCount === 0}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>Pending Only</span>
          <span className="export-menu-item-count">{pendingCount}</span>
        </button>

        <button
          className="export-menu-item"
          onClick={handleExportReported}
          role="menuitem"
          disabled={isExporting || reportedCount === 0}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>Reported Only</span>
          <span className="export-menu-item-count">{reportedCount}</span>
        </button>

        <div className="export-menu-divider" />

        <button
          className="export-menu-item"
          onClick={handleCopyToClipboard}
          role="menuitem"
          disabled={isExporting || earnings.length === 0}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          <span>Copy to Clipboard</span>
        </button>
      </div>

      <style jsx>{`
        .export-menu-container {
          position: relative;
          display: inline-flex;
        }

        .export-menu-trigger {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: var(--text-secondary, #a1a1aa);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .export-menu-trigger:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
          color: var(--text-primary, #e4e4e7);
        }

        .export-menu-trigger.active {
          background: rgba(59, 130, 246, 0.15);
          border-color: rgba(59, 130, 246, 0.3);
          color: #3b82f6;
        }

        .export-menu-trigger:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .export-menu-icon {
          flex-shrink: 0;
        }

        .export-menu-label {
          display: none;
        }

        @media (min-width: 640px) {
          .export-menu-label {
            display: inline;
          }
        }

        .export-menu-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          z-index: 50;
          min-width: 220px;
          margin-top: 8px;
          padding: 8px;
          background: linear-gradient(135deg, rgba(30, 30, 45, 0.98) 0%, rgba(20, 20, 30, 0.99) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          box-shadow: 
            0 10px 40px -10px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(255, 255, 255, 0.05) inset;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-8px) scale(0.95);
          transform-origin: top right;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .export-menu-dropdown.open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0) scale(1);
        }

        .export-menu-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 10px;
        }

        .export-menu-title {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted, #71717a);
        }

        .export-menu-count {
          font-size: 11px;
          color: var(--text-faint, #52525b);
        }

        .export-menu-divider {
          height: 1px;
          margin: 6px 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
        }

        .export-menu-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 12px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: var(--text-secondary, #a1a1aa);
          font-size: 13px;
          text-align: left;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .export-menu-item:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.06);
          color: var(--text-primary, #e4e4e7);
        }

        .export-menu-item:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .export-menu-item svg {
          flex-shrink: 0;
          color: var(--text-muted, #71717a);
        }

        .export-menu-item:hover:not(:disabled) svg {
          color: var(--text-secondary, #a1a1aa);
        }

        .export-menu-item span:first-of-type {
          flex: 1;
        }

        .export-menu-item-count {
          font-size: 11px;
          padding: 2px 6px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          color: var(--text-muted, #71717a);
        }

        /* Light mode */
        :global(html.light) .export-menu-trigger {
          background: rgba(0, 0, 0, 0.03);
          border-color: rgba(0, 0, 0, 0.08);
          color: #64748b;
        }

        :global(html.light) .export-menu-trigger:hover {
          background: rgba(0, 0, 0, 0.05);
          border-color: rgba(0, 0, 0, 0.12);
          color: #334155;
        }

        :global(html.light) .export-menu-dropdown {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.99) 100%);
          border-color: rgba(0, 0, 0, 0.08);
          box-shadow: 
            0 10px 40px -10px rgba(0, 0, 0, 0.15),
            0 0 0 1px rgba(0, 0, 0, 0.05);
        }

        :global(html.light) .export-menu-item:hover:not(:disabled) {
          background: rgba(0, 0, 0, 0.04);
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .export-menu-trigger,
          .export-menu-dropdown {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}

export default ExportMenu;
