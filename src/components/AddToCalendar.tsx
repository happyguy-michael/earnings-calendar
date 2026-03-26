'use client';

import { useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import { useHaptic } from './HapticFeedback';

/**
 * AddToCalendar
 * 
 * Premium dropdown to add pending earnings events to external calendars.
 * Supports Google Calendar, Apple Calendar (.ics), and generic .ics download.
 * 
 * Features:
 * - Animated dropdown with staggered item reveals
 * - Google Calendar opens in new tab with pre-filled event
 * - Apple Calendar / .ics downloads an ICS file
 * - Outlook Web opens in new tab
 * - Haptic feedback on interactions
 * - Keyboard accessible (Escape to close)
 * - Click outside to dismiss
 * - Reduced motion support
 * - Success toast integration
 * 
 * Inspiration:
 * - AddEvent.com patterns
 * - Calendly's "Add to Calendar" dropdown
 * - Eventbrite calendar export
 * - 2026 "One-click utility" trend
 * 
 * @example
 * <AddToCalendar
 *   ticker="NVDA"
 *   company="NVIDIA"
 *   date="2026-02-27"
 *   time="post"
 * />
 */

interface AddToCalendarProps {
  /** Stock ticker symbol */
  ticker: string;
  /** Company name */
  company: string;
  /** Earnings date (YYYY-MM-DD) */
  date: string;
  /** Time of report */
  time?: 'pre' | 'post' | 'intraday';
  /** Size variant */
  size?: 'sm' | 'md';
  /** Additional class names */
  className?: string;
  /** Callback on successful add */
  onAdd?: (provider: string) => void;
}

interface CalendarOption {
  id: string;
  label: string;
  icon: ReactNode;
  color: string;
  action: () => void;
}

// Format date for Google Calendar (YYYYMMDDTHHmmssZ)
function formatGoogleDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

// Format date for ICS file (YYYYMMDDTHHMMSS)
function formatICSDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

// Generate ICS file content
function generateICS(
  title: string,
  description: string,
  location: string,
  startDate: Date,
  endDate: Date,
  url?: string
): string {
  const now = new Date();
  const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@earnings-calendar`;
  
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Earnings Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(now)}`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    `LOCATION:${location}`,
  ];
  
  if (url) {
    lines.push(`URL:${url}`);
  }
  
  lines.push('BEGIN:VALARM');
  lines.push('ACTION:DISPLAY');
  lines.push('DESCRIPTION:Earnings report starting soon');
  lines.push('TRIGGER:-PT30M'); // 30 min before
  lines.push('END:VALARM');
  
  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');
  
  return lines.join('\r\n');
}

// Download ICS file
function downloadICS(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function AddToCalendar({
  ticker,
  company,
  date,
  time,
  size = 'sm',
  className = '',
  onAdd,
}: AddToCalendarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [justOpened, setJustOpened] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { trigger: haptic } = useHaptic();

  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Calculate event times
  const getEventTimes = useCallback(() => {
    const eventDate = new Date(date + 'T00:00:00');
    let startHour = 16; // Default to after hours
    let startMinute = 0;
    let sessionLabel = 'After Hours';
    
    if (time === 'pre') {
      startHour = 9;
      startMinute = 30;
      sessionLabel = 'Pre-Market';
    } else if (time === 'post') {
      startHour = 16;
      startMinute = 0;
      sessionLabel = 'After Hours';
    } else if (time === 'intraday') {
      startHour = 12;
      startMinute = 0;
      sessionLabel = 'During Market';
    }
    
    const startDate = new Date(eventDate);
    startDate.setHours(startHour, startMinute, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1); // 1 hour event
    
    return { startDate, endDate, sessionLabel };
  }, [date, time]);

  // Generate event details
  const getEventDetails = useCallback(() => {
    const { startDate, endDate, sessionLabel } = getEventTimes();
    const title = `📊 ${ticker} Earnings Report`;
    const description = `${company} (${ticker}) is reporting earnings ${sessionLabel.toLowerCase()}.\n\nWatch for EPS and revenue surprises!\n\nView analysis: https://earnings-calendar.app/report/${ticker}`;
    const location = `${sessionLabel} - NYSE/NASDAQ`;
    
    return { title, description, location, startDate, endDate };
  }, [ticker, company, getEventTimes]);

  // Calendar actions
  const openGoogleCalendar = useCallback(() => {
    const { title, description, location, startDate, endDate } = getEventDetails();
    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.set('action', 'TEMPLATE');
    url.searchParams.set('text', title);
    url.searchParams.set('details', description);
    url.searchParams.set('location', location);
    url.searchParams.set('dates', `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`);
    
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
    haptic('success');
    onAdd?.('google');
    setIsOpen(false);
  }, [getEventDetails, haptic, onAdd]);

  const downloadAppleCalendar = useCallback(() => {
    const { title, description, location, startDate, endDate } = getEventDetails();
    const icsContent = generateICS(
      title, 
      description, 
      location, 
      startDate, 
      endDate,
      `https://earnings-calendar.app/report/${ticker}`
    );
    downloadICS(icsContent, `${ticker}-earnings.ics`);
    haptic('success');
    onAdd?.('apple');
    setIsOpen(false);
  }, [ticker, getEventDetails, haptic, onAdd]);

  const openOutlookWeb = useCallback(() => {
    const { title, description, startDate, endDate } = getEventDetails();
    const url = new URL('https://outlook.live.com/calendar/0/deeplink/compose');
    url.searchParams.set('subject', title);
    url.searchParams.set('body', description);
    url.searchParams.set('startdt', startDate.toISOString());
    url.searchParams.set('enddt', endDate.toISOString());
    url.searchParams.set('path', '/calendar/action/compose');
    
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
    haptic('success');
    onAdd?.('outlook');
    setIsOpen(false);
  }, [getEventDetails, haptic, onAdd]);

  // Toggle menu
  const toggleMenu = useCallback(() => {
    if (!isOpen) {
      setJustOpened(true);
      setTimeout(() => setJustOpened(false), 300);
    }
    haptic(isOpen ? 'light' : 'select');
    setIsOpen(!isOpen);
  }, [isOpen, haptic]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current && 
        !buttonRef.current.contains(e.target as Node)
      ) {
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

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const options: CalendarOption[] = [
    {
      id: 'google',
      label: 'Google Calendar',
      color: '#4285f4',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zM12 18a6 6 0 110-12 6 6 0 010 12z"/>
          <path d="M12 8v4l3 1.5"/>
        </svg>
      ),
      action: openGoogleCalendar,
    },
    {
      id: 'apple',
      label: 'Apple Calendar',
      color: '#FF3B30',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
        </svg>
      ),
      action: downloadAppleCalendar,
    },
    {
      id: 'outlook',
      label: 'Outlook',
      color: '#0078D4',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
      action: openOutlookWeb,
    },
    {
      id: 'ics',
      label: 'Download .ics',
      color: '#71717a',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
        </svg>
      ),
      action: downloadAppleCalendar, // Same as Apple - downloads ICS
    },
  ];

  const sizeStyles = {
    sm: {
      button: 'w-6 h-6',
      icon: 'w-3.5 h-3.5',
      menu: 'min-w-[160px]',
      item: 'text-xs py-1.5 px-2.5',
    },
    md: {
      button: 'w-8 h-8',
      icon: 'w-4 h-4',
      menu: 'min-w-[180px]',
      item: 'text-sm py-2 px-3',
    },
  };

  const s = sizeStyles[size];

  return (
    <div className={`add-to-calendar relative ${className}`}>
      {/* Trigger button */}
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className={`add-to-calendar-trigger ${s.button} rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95`}
        title="Add to Calendar"
        aria-label="Add to calendar"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className={`${s.icon} text-zinc-400 transition-colors group-hover:text-zinc-300`}
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
          <line x1="12" y1="14" x2="12" y2="18"/>
          <line x1="10" y1="16" x2="14" y2="16"/>
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className={`add-to-calendar-menu ${s.menu} absolute right-0 top-full mt-2 z-50`}
          role="menu"
          aria-label="Calendar options"
        >
          <div className="add-to-calendar-menu-inner">
            <div className="add-to-calendar-header">
              <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                Add to Calendar
              </span>
            </div>
            
            {options.map((option, index) => (
              <button
                key={option.id}
                onClick={option.action}
                className={`add-to-calendar-option ${s.item}`}
                style={{
                  '--option-color': option.color,
                  '--stagger-index': index,
                  animationDelay: prefersReducedMotion ? '0ms' : `${index * 40}ms`,
                } as React.CSSProperties}
                role="menuitem"
              >
                <span 
                  className="add-to-calendar-icon"
                  style={{ color: option.color }}
                >
                  {option.icon}
                </span>
                <span className="add-to-calendar-label">{option.label}</span>
                <span className="add-to-calendar-arrow">→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .add-to-calendar-trigger {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        
        .add-to-calendar-trigger:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.12);
        }
        
        .add-to-calendar-trigger:hover svg {
          color: #3b82f6;
        }
        
        .add-to-calendar-menu {
          animation: ${prefersReducedMotion ? 'none' : 'calendar-menu-enter 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards'};
        }
        
        .add-to-calendar-menu-inner {
          background: rgba(24, 24, 27, 0.95);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 6px;
          box-shadow: 
            0 4px 24px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.05) inset;
        }
        
        .add-to-calendar-header {
          padding: 6px 8px 4px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          margin-bottom: 4px;
        }
        
        .add-to-calendar-option {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.8);
          transition: all 0.15s ease;
          animation: ${prefersReducedMotion ? 'none' : 'calendar-option-enter 0.25s cubic-bezier(0.16, 1, 0.3, 1) backwards'};
        }
        
        .add-to-calendar-option:hover {
          background: rgba(255, 255, 255, 0.08);
          color: white;
        }
        
        .add-to-calendar-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .add-to-calendar-label {
          flex: 1;
          text-align: left;
        }
        
        .add-to-calendar-arrow {
          opacity: 0;
          transform: translateX(-4px);
          transition: all 0.15s ease;
          color: var(--option-color);
          font-size: 10px;
        }
        
        .add-to-calendar-option:hover .add-to-calendar-arrow {
          opacity: 1;
          transform: translateX(0);
        }
        
        @keyframes calendar-menu-enter {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes calendar-option-enter {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        /* Light mode */
        :global(html.light) .add-to-calendar-trigger {
          background: rgba(0, 0, 0, 0.03);
          border-color: rgba(0, 0, 0, 0.08);
        }
        
        :global(html.light) .add-to-calendar-trigger:hover {
          background: rgba(0, 0, 0, 0.06);
          border-color: rgba(0, 0, 0, 0.12);
        }
        
        :global(html.light) .add-to-calendar-trigger svg {
          color: #71717a;
        }
        
        :global(html.light) .add-to-calendar-trigger:hover svg {
          color: #3b82f6;
        }
        
        :global(html.light) .add-to-calendar-menu-inner {
          background: rgba(255, 255, 255, 0.95);
          border-color: rgba(0, 0, 0, 0.1);
          box-shadow: 
            0 4px 24px rgba(0, 0, 0, 0.15),
            0 0 0 1px rgba(0, 0, 0, 0.05) inset;
        }
        
        :global(html.light) .add-to-calendar-header {
          border-bottom-color: rgba(0, 0, 0, 0.08);
        }
        
        :global(html.light) .add-to-calendar-header span {
          color: #71717a;
        }
        
        :global(html.light) .add-to-calendar-option {
          color: #3f3f46;
        }
        
        :global(html.light) .add-to-calendar-option:hover {
          background: rgba(0, 0, 0, 0.05);
          color: #18181b;
        }
        
        /* Print */
        @media print {
          .add-to-calendar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Compact inline version for tight spaces
 */
export function AddToCalendarInline(props: Omit<AddToCalendarProps, 'size'>) {
  return <AddToCalendar {...props} size="sm" />;
}
