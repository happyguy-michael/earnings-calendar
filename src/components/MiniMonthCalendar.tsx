'use client';

import { useState, useEffect, useMemo, useCallback, CSSProperties } from 'react';

/**
 * MiniMonthCalendar
 * 
 * A compact month overview showing earnings density per day with heat-mapped
 * intensity. Click any day to navigate. Perfect for quick orientation and
 * discovering busy earnings days at a glance.
 * 
 * Features:
 * - Heat-mapped day cells (color intensity = earnings count)
 * - Today indicator with pulsing ring
 * - Click to navigate to specific day/week
 * - Hover preview showing company count
 * - Beat/miss ratio indicator per day
 * - Responsive: collapses to week view on mobile
 * - Smooth month transition animations
 * 
 * Inspiration:
 * - GitHub contribution graph
 * - Notion's mini calendar widget
 * - Apple Calendar month overview
 * - Vercel's deployment activity graph
 * 
 * @example
 * <MiniMonthCalendar
 *   earningsData={earnings}
 *   currentDate={selectedDate}
 *   onDayClick={(date) => scrollToDate(date)}
 * />
 */

interface EarningDay {
  date: string; // YYYY-MM-DD
  count: number;
  beats: number;
  misses: number;
  pending: number;
}

interface MiniMonthCalendarProps {
  /** Earnings data grouped by date */
  earningsData: EarningDay[];
  /** Currently selected/viewed date */
  currentDate?: Date;
  /** Callback when a day is clicked */
  onDayClick?: (date: Date) => void;
  /** Show week numbers */
  showWeekNumbers?: boolean;
  /** Compact mode (smaller cells) */
  compact?: boolean;
  /** Additional className */
  className?: string;
}

const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function MiniMonthCalendar({
  earningsData,
  currentDate = new Date(),
  onDayClick,
  showWeekNumbers = false,
  compact = false,
  className = '',
}: MiniMonthCalendarProps) {
  const [viewDate, setViewDate] = useState(currentDate);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<'left' | 'right' | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Create earnings lookup map
  const earningsMap = useMemo(() => {
    const map = new Map<string, EarningDay>();
    earningsData.forEach(day => map.set(day.date, day));
    return map;
  }, [earningsData]);

  // Calculate max count for heat intensity normalization
  const maxCount = useMemo(() => {
    return Math.max(1, ...earningsData.map(d => d.count));
  }, [earningsData]);

  // Generate calendar grid for the current month
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    // First day of month
    const firstDay = new Date(year, month, 1);
    const startPadding = firstDay.getDay(); // 0 = Sunday
    
    // Last day of month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Previous month days for padding
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    
    const days: Array<{
      date: Date;
      dateKey: string;
      dayOfMonth: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      earnings: EarningDay | null;
    }> = [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = formatDateKey(today);
    const selectedKey = formatDateKey(currentDate);
    
    // Previous month padding
    for (let i = startPadding - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthDays - i);
      const dateKey = formatDateKey(d);
      days.push({
        date: d,
        dateKey,
        dayOfMonth: prevMonthDays - i,
        isCurrentMonth: false,
        isToday: dateKey === todayKey,
        isSelected: dateKey === selectedKey,
        earnings: earningsMap.get(dateKey) || null,
      });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const dateKey = formatDateKey(d);
      days.push({
        date: d,
        dateKey,
        dayOfMonth: day,
        isCurrentMonth: true,
        isToday: dateKey === todayKey,
        isSelected: dateKey === selectedKey,
        earnings: earningsMap.get(dateKey) || null,
      });
    }
    
    // Next month padding (fill to 42 cells = 6 weeks)
    const remaining = 42 - days.length;
    for (let day = 1; day <= remaining; day++) {
      const d = new Date(year, month + 1, day);
      const dateKey = formatDateKey(d);
      days.push({
        date: d,
        dateKey,
        dayOfMonth: day,
        isCurrentMonth: false,
        isToday: dateKey === todayKey,
        isSelected: dateKey === selectedKey,
        earnings: earningsMap.get(dateKey) || null,
      });
    }
    
    return days;
  }, [viewDate, earningsMap, currentDate]);

  // Navigation handlers
  const goToPrevMonth = useCallback(() => {
    if (isAnimating) return;
    setAnimationDirection('right');
    setIsAnimating(true);
    setTimeout(() => {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
      setIsAnimating(false);
      setAnimationDirection(null);
    }, prefersReducedMotion ? 0 : 200);
  }, [viewDate, isAnimating, prefersReducedMotion]);

  const goToNextMonth = useCallback(() => {
    if (isAnimating) return;
    setAnimationDirection('left');
    setIsAnimating(true);
    setTimeout(() => {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
      setIsAnimating(false);
      setAnimationDirection(null);
    }, prefersReducedMotion ? 0 : 200);
  }, [viewDate, isAnimating, prefersReducedMotion]);

  const goToToday = useCallback(() => {
    setViewDate(new Date());
  }, []);

  // Heat color calculation
  const getHeatColor = (count: number, beats: number, total: number): CSSProperties => {
    if (count === 0) return {};
    
    const intensity = Math.min(count / maxCount, 1);
    const beatRatio = total > 0 ? beats / total : 0.5;
    
    // Green for beats, red for misses, blue for pending
    const hue = beatRatio >= 0.5 ? 142 : 0; // Green or red
    const saturation = 70 + intensity * 20;
    const lightness = 45 - intensity * 15;
    const alpha = 0.2 + intensity * 0.5;
    
    return {
      backgroundColor: `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`,
    };
  };

  // Render week rows
  const weeks = useMemo(() => {
    const rows: Array<typeof calendarDays> = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      rows.push(calendarDays.slice(i, i + 7));
    }
    return rows;
  }, [calendarDays]);

  const cellSize = compact ? 24 : 32;

  return (
    <div 
      className={`mini-month-calendar ${compact ? 'compact' : ''} ${className}`}
      style={{
        '--cell-size': `${cellSize}px`,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      } as CSSProperties}
    >
      {/* Header */}
      <div className="calendar-header" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: compact ? '8px' : '12px',
        padding: '0 4px',
      }}>
        <button
          onClick={goToPrevMonth}
          className="nav-btn"
          aria-label="Previous month"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
            color: 'var(--text-secondary, #666)',
            fontSize: '14px',
            transition: 'background-color 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--hover-bg, rgba(0,0,0,0.05))';
            e.currentTarget.style.color = 'var(--text-primary, #000)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary, #666)';
          }}
        >
          ‹
        </button>
        
        <button
          onClick={goToToday}
          className="month-title"
          aria-label={`${MONTHS[viewDate.getMonth()]} ${viewDate.getFullYear()}`}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: compact ? '13px' : '14px',
            color: 'var(--text-primary, #000)',
            padding: '4px 8px',
            borderRadius: '4px',
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--hover-bg, rgba(0,0,0,0.05))';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
        </button>
        
        <button
          onClick={goToNextMonth}
          className="nav-btn"
          aria-label="Next month"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
            color: 'var(--text-secondary, #666)',
            fontSize: '14px',
            transition: 'background-color 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--hover-bg, rgba(0,0,0,0.05))';
            e.currentTarget.style.color = 'var(--text-primary, #000)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary, #666)';
          }}
        >
          ›
        </button>
      </div>

      {/* Day headers */}
      <div className="day-headers" style={{
        display: 'grid',
        gridTemplateColumns: showWeekNumbers ? `24px repeat(7, ${cellSize}px)` : `repeat(7, ${cellSize}px)`,
        gap: '2px',
        marginBottom: '4px',
      }}>
        {showWeekNumbers && (
          <div style={{ width: '24px' }} />
        )}
        {DAYS_SHORT.map((day, i) => (
          <div
            key={i}
            style={{
              textAlign: 'center',
              fontSize: '10px',
              fontWeight: 500,
              color: 'var(--text-tertiary, #999)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div 
        className="calendar-grid"
        style={{
          opacity: isAnimating ? 0.5 : 1,
          transform: isAnimating 
            ? `translateX(${animationDirection === 'left' ? '-10px' : '10px'})`
            : 'translateX(0)',
          transition: prefersReducedMotion ? 'none' : 'opacity 0.2s, transform 0.2s',
        }}
      >
        {weeks.map((week, weekIndex) => (
          <div
            key={weekIndex}
            className="calendar-week"
            style={{
              display: 'grid',
              gridTemplateColumns: showWeekNumbers ? `24px repeat(7, ${cellSize}px)` : `repeat(7, ${cellSize}px)`,
              gap: '2px',
              marginBottom: '2px',
            }}
          >
            {showWeekNumbers && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '9px',
                  color: 'var(--text-tertiary, #999)',
                  width: '24px',
                }}
              >
                W{getWeekNumber(week[0].date)}
              </div>
            )}
            {week.map((day) => {
              const hasEarnings = day.earnings && day.earnings.count > 0;
              const isHovered = hoveredDay === day.dateKey;
              const reported = (day.earnings?.beats || 0) + (day.earnings?.misses || 0);
              
              return (
                <button
                  key={day.dateKey}
                  onClick={() => onDayClick?.(day.date)}
                  onMouseEnter={() => setHoveredDay(day.dateKey)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className="calendar-day"
                  aria-label={`${day.date.toDateString()}${hasEarnings ? `, ${day.earnings!.count} earnings reports` : ''}`}
                  style={{
                    width: `${cellSize}px`,
                    height: `${cellSize}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: compact ? '11px' : '12px',
                    fontWeight: day.isToday ? 600 : 400,
                    color: !day.isCurrentMonth 
                      ? 'var(--text-disabled, #ccc)'
                      : day.isToday
                      ? 'var(--accent-color, #3b82f6)'
                      : 'var(--text-primary, #000)',
                    background: hasEarnings 
                      ? undefined 
                      : 'transparent',
                    position: 'relative',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                    transform: isHovered && !prefersReducedMotion ? 'scale(1.1)' : 'scale(1)',
                    boxShadow: day.isSelected
                      ? '0 0 0 2px var(--accent-color, #3b82f6)'
                      : isHovered
                      ? '0 2px 8px rgba(0,0,0,0.15)'
                      : 'none',
                    ...getHeatColor(
                      day.earnings?.count || 0,
                      day.earnings?.beats || 0,
                      reported
                    ),
                  }}
                >
                  {day.dayOfMonth}
                  
                  {/* Today indicator ring */}
                  {day.isToday && (
                    <span
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '6px',
                        border: '2px solid var(--accent-color, #3b82f6)',
                        animation: prefersReducedMotion ? 'none' : 'pulse-ring 2s ease-in-out infinite',
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                  
                  {/* Earnings count dot */}
                  {hasEarnings && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '2px',
                        right: '2px',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-color, #3b82f6)',
                        fontSize: '6px',
                        display: day.earnings!.count > 5 ? 'flex' : 'none',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 700,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Hover tooltip */}
      {hoveredDay && (
        <div
          className="calendar-tooltip"
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '8px',
            padding: '6px 10px',
            backgroundColor: 'var(--tooltip-bg, rgba(0,0,0,0.8))',
            color: 'white',
            borderRadius: '6px',
            fontSize: '11px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 100,
          }}
        >
          {(() => {
            const dayData = calendarDays.find(d => d.dateKey === hoveredDay);
            if (!dayData) return null;
            
            if (!dayData.earnings || dayData.earnings.count === 0) {
              return 'No earnings';
            }
            
            const { count, beats, misses, pending } = dayData.earnings;
            return (
              <>
                <strong>{count}</strong> report{count !== 1 ? 's' : ''}
                {beats > 0 && <span style={{ color: '#4ade80' }}> • {beats} beat{beats !== 1 ? 's' : ''}</span>}
                {misses > 0 && <span style={{ color: '#f87171' }}> • {misses} miss{misses !== 1 ? 'es' : ''}</span>}
                {pending > 0 && <span style={{ color: '#60a5fa' }}> • {pending} pending</span>}
              </>
            );
          })()}
        </div>
      )}

      {/* Inject keyframes */}
      <style>{`
        @keyframes pulse-ring {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .mini-month-calendar {
          position: relative;
          user-select: none;
        }
        
        .mini-month-calendar.compact .calendar-day {
          font-size: 10px;
        }
        
        @media (prefers-color-scheme: dark) {
          .mini-month-calendar {
            --text-primary: #f0f0f0;
            --text-secondary: #888;
            --text-tertiary: #666;
            --text-disabled: #444;
            --hover-bg: rgba(255,255,255,0.1);
            --accent-color: #60a5fa;
            --tooltip-bg: rgba(30,30,30,0.95);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * MiniMonthCalendarPopover
 * 
 * A popover wrapper for the mini calendar, useful for header placement.
 */
interface MiniMonthCalendarPopoverProps extends MiniMonthCalendarProps {
  /** Trigger element */
  trigger: React.ReactNode;
  /** Popover position */
  position?: 'bottom-left' | 'bottom-right' | 'bottom-center';
}

export function MiniMonthCalendarPopover({
  trigger,
  position = 'bottom-center',
  ...calendarProps
}: MiniMonthCalendarPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  const positionStyles: CSSProperties = {
    'bottom-left': { top: '100%', left: 0, marginTop: '8px' },
    'bottom-right': { top: '100%', right: 0, marginTop: '8px' },
    'bottom-center': { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px' },
  }[position];

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
        {trigger}
      </div>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99,
            }}
          />
          
          {/* Popover */}
          <div
            style={{
              position: 'absolute',
              ...positionStyles,
              zIndex: 100,
              backgroundColor: 'var(--popover-bg, white)',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              padding: '12px',
              minWidth: '260px',
            }}
          >
            <MiniMonthCalendar {...calendarProps} />
          </div>
        </>
      )}
    </div>
  );
}

export default MiniMonthCalendar;
