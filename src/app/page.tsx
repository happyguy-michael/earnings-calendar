'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { earnings, getBeatStreak } from '@/lib/data';
import { Earning } from '@/lib/types';
import { BeatStreakBadge } from '@/components/BeatStreak';
import { CountUp } from '@/components/CountUp';
import { RollingNumber } from '@/components/NumberTicker';
import { SkeletonCalendar } from '@/components/Skeleton';
import { SearchBar } from '@/components/SearchBar';
import { FilterChips, FilterType } from '@/components/FilterChips';
import { EarningsTooltipContent } from '@/components/Tooltip';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SwipeNavigator, SwipeHint } from '@/components/SwipeNavigator';
import { LiveBadge, LiveDot } from '@/components/LiveBadge';
import { CountdownBadge } from '@/components/Countdown';
import { ProgressRing } from '@/components/ProgressRing';
import { BackToTop } from '@/components/BackToTop';
import { TiltCard } from '@/components/TiltCard';
import { Ripple } from '@/components/Ripple';
import { FloatingParticles } from '@/components/FloatingParticles';
import { MagneticButton } from '@/components/MagneticButton';
import { MarketSessionIcon } from '@/components/MarketSessionIcon';
import { KeyboardShortcutsOverlay, KeyboardShortcutsHint } from '@/components/KeyboardShortcuts';
import { AnimatedEmptyState } from '@/components/AnimatedEmptyState';
import { BadgeSparkle } from '@/components/BadgeSparkle';
import { GrainOverlay } from '@/components/GrainOverlay';
import { useToast } from '@/components/Toast';
import { ValueChangeHighlight } from '@/components/ValueChangeHighlight';

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Circular Progress
function CircularProgress({ value, size = 40, color = '#22c55e' }: { value: number; size?: number; color?: string }) {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  
  return (
    <svg width={size} height={size} className="progress-ring">
      <circle className="bg" cx={size/2} cy={size/2} r={radius} fill="none" strokeWidth={strokeWidth} />
      <circle 
        className="fg" 
        cx={size/2} 
        cy={size/2} 
        r={radius} 
        fill="none" 
        strokeWidth={strokeWidth}
        stroke={color}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

function EarningsCard({ earning, isToday, animationIndex = 0 }: { earning: Earning; isToday?: boolean; animationIndex?: number }) {
  const hasResult = earning.eps !== undefined && earning.eps !== null;
  const logoUrl = `https://logo.clearbit.com/${earning.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
  const isPending = !hasResult;
  const isTodayPending = isToday && isPending;
  const beatStreak = getBeatStreak(earning.ticker);
  
  let surprise = 0;
  if (hasResult && earning.estimate) {
    surprise = ((earning.eps! - earning.estimate) / Math.abs(earning.estimate)) * 100;
  }

  const oddsColor = earning.beatOdds 
    ? earning.beatOdds >= 70 ? '#22c55e' 
    : earning.beatOdds >= 50 ? '#f59e0b' 
    : '#ef4444'
    : '#71717a';

  // Convert revenue to full number (data is in billions)
  const revenueActual = earning.revenue ? earning.revenue * 1e9 : null;
  const revenueEst = earning.revenueEstimate ? earning.revenueEstimate * 1e9 : null;

  return (
    <div className="earnings-card-wrapper">
      <Link 
        href={`/report/${earning.ticker}`} 
        className={`earnings-row earnings-card-animate ${isTodayPending ? 'today-pending' : ''}`}
        style={{ animationDelay: `${animationIndex * 50}ms` }}
      >
        <Ripple color="rgba(59, 130, 246, 0.25)" duration={500} />
        <span className="shimmer-sweep" aria-hidden="true" />
        <div className="logo-container">
          <img
            src={logoUrl}
            alt={earning.ticker}
            className="w-full h-full object-contain p-2"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <span className="hidden text-xs font-bold text-zinc-500">{earning.ticker.slice(0, 2)}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{earning.ticker}</span>
            <BeatStreakBadge streak={beatStreak} />
            <LiveDot isToday={!!isToday} isPending={isPending} />
          </div>
          <div className="text-xs text-zinc-500 truncate">{earning.company}</div>
        </div>

        {/* Countdown timer for today's pending earnings */}
        {isTodayPending && (
          <CountdownBadge targetDate={new Date(earning.date)} time={earning.time} />
        )}

        {hasResult ? (
          earning.result === 'beat' ? (
            <BadgeSparkle active={true} particleCount={6}>
              <span className="badge badge-beat">
                {surprise >= 0 ? '+' : ''}{surprise.toFixed(1)}%
              </span>
            </BadgeSparkle>
          ) : (
            <span className="badge badge-miss">
              {surprise >= 0 ? '+' : ''}{surprise.toFixed(1)}%
            </span>
          )
        ) : earning.beatOdds ? (
          <div className="odds-indicator">
            <ProgressRing value={earning.beatOdds} size={32} color={oddsColor} delay={animationIndex * 80} duration={800} />
            <span className="text-xs font-semibold" style={{ color: oddsColor }}>
              {earning.beatOdds}%
            </span>
          </div>
        ) : null}
      </Link>
      <div className="earnings-tooltip">
        <EarningsTooltipContent
          ticker={earning.ticker}
          company={earning.company}
          eps={earning.eps}
          estimate={earning.estimate}
          revenue={revenueActual}
          revenueEstimate={revenueEst}
          beatOdds={earning.beatOdds}
          time={earning.time}
          result={earning.result}
        />
        <div className="tooltip-arrow" />
      </div>
    </div>
  );
}

export default function Home() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart(new Date()));
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const slideKey = useRef(0);
  const { showToast } = useToast();

  // Calculate counts for filter chips (before any filtering)
  const filterCounts = useMemo(() => ({
    all: earnings.length,
    beat: earnings.filter(e => e.result === 'beat').length,
    miss: earnings.filter(e => e.result === 'miss').length,
    pending: earnings.filter(e => e.eps === undefined || e.eps === null).length,
  }), []);

  // Filter earnings based on search and status filter
  const filteredEarnings = useMemo(() => {
    let result = earnings;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.ticker.toLowerCase().includes(query) ||
          e.company.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter((e) => {
        if (statusFilter === 'beat') return e.result === 'beat';
        if (statusFilter === 'miss') return e.result === 'miss';
        if (statusFilter === 'pending') return e.eps === undefined || e.eps === null;
        return true;
      });
    }
    
    return result;
  }, [searchQuery, statusFilter]);

  const navigateWeek = useCallback((delta: number, fromSwipe = false) => {
    // Set slide direction for animation
    setSlideDirection(delta > 0 ? 'left' : 'right');
    slideKey.current += 1;
    
    // Hide swipe hint after first swipe
    if (fromSwipe && showSwipeHint) {
      setShowSwipeHint(false);
      // Store in localStorage so we don't show again
      try {
        localStorage.setItem('earnings-swipe-hint-dismissed', 'true');
      } catch {}
    }
    
    setCurrentWeekStart((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + delta * 7);
      return next;
    });
    
    // Clear slide direction after animation
    setTimeout(() => setSlideDirection(null), 350);
  }, [showSwipeHint]);

  const goToToday = useCallback(() => {
    setCurrentWeekStart(getWeekStart(new Date()));
    showToast('Jumped to current week', { type: 'success', icon: '📅', duration: 2000 });
  }, [showToast]);

  // Simulate data loading - will be replaced with real API call
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Check if swipe hint was previously dismissed
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem('earnings-swipe-hint-dismissed');
      if (dismissed === 'true') {
        setShowSwipeHint(false);
      }
    } catch {}
  }, []);

  // Shrinking header on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    
    // Check initial scroll position
    handleScroll();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard navigation for weeks
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        navigateWeek(-1);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        navigateWeek(1);
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        goToToday();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateWeek, goToToday]);

  if (isLoading) {
    return <SkeletonCalendar />;
  }

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weeks = Array.from({ length: 3 }, (_, w) => {
    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(weekStart.getDate() + w * 7);
    return weekStart;
  });

  // Stats (based on filtered results)
  const totalEarnings = filteredEarnings.length;
  const beatsCount = filteredEarnings.filter(e => e.result === 'beat').length;
  const reportedCount = filteredEarnings.filter(e => e.eps !== undefined).length;
  const beatRate = reportedCount > 0 ? Math.round((beatsCount / reportedCount) * 100) : 0;
  const pendingCount = totalEarnings - reportedCount;
  const isFiltering = searchQuery.trim().length > 0 || statusFilter !== 'all';

  return (
    <div className="min-h-screen relative">
      {/* Floating background particles */}
      <FloatingParticles count={35} speed={0.25} maxSize={3} minSize={1} />
      
      {/* Premium grain texture overlay */}
      <GrainOverlay opacity={0.025} animate={true} blendMode="overlay" />
      
      {/* Keyboard shortcuts overlay */}
      <KeyboardShortcutsOverlay />
      
      {/* Header - shrinks on scroll */}
      <header className={`sticky-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="sticky-header-inner">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-shrink-0">
              <h1 className="sticky-header-title">
                Earnings <span className="text-gradient">Calendar</span>
              </h1>
              <p className="sticky-header-subtitle">
                {months[currentWeekStart.getMonth()]} {currentWeekStart.getFullYear()}
              </p>
            </div>
            
            {/* Search Bar - centered */}
            <div className="hidden md:flex flex-1 justify-center max-w-md mx-4">
              <SearchBar 
                value={searchQuery} 
                onChange={setSearchQuery}
                resultCount={filteredEarnings.length}
                totalCount={earnings.length}
              />
            </div>
            
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="sticky-header-hints">
                <span className="kbd">←</span>
                <span className="kbd">→</span>
                <span>navigate</span>
                <span className="mx-1">·</span>
                <span className="kbd">T</span>
                <span>today</span>
                <span className="mx-1">·</span>
                <span className="kbd">?</span>
                <span>help</span>
              </div>
              <KeyboardShortcutsHint />
              <ThemeToggle />
              <MagneticButton 
                onClick={goToToday} 
                className="btn btn-ghost magnetic-today-btn"
                intensity={0.35}
                radius={1.4}
              >
                Today
              </MagneticButton>
              <div className="flex bg-white/5 rounded-xl border border-white/10 overflow-visible">
                <MagneticButton
                  onClick={() => navigateWeek(-1)}
                  aria-label="Previous week"
                  className="magnetic-nav-btn w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 transition-colors rounded-l-xl"
                  intensity={0.5}
                  radius={1.6}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </MagneticButton>
                <div className="w-px bg-white/10" />
                <MagneticButton
                  onClick={() => navigateWeek(1)}
                  aria-label="Next week"
                  className="magnetic-nav-btn w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 transition-colors rounded-r-xl"
                  intensity={0.5}
                  radius={1.6}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </MagneticButton>
              </div>
            </div>
          </div>
          
          {/* Mobile search bar */}
          <div className="md:hidden mt-4">
            <SearchBar 
              value={searchQuery} 
              onChange={setSearchQuery}
              resultCount={filteredEarnings.length}
              totalCount={earnings.length}
            />
          </div>
          
          {/* Filter chips - collapse on scroll */}
          <div className="sticky-header-filters">
            <FilterChips 
              value={statusFilter}
              onChange={setStatusFilter}
              counts={filterCounts}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Row with 3D Tilt Effect, Rolling Numbers, and Change Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <TiltCard tiltIntensity={10} glareIntensity={0.12} scale={1.02}>
            <div className="tilt-stat-card">
              <div className="text-4xl font-bold text-white mb-1">
                <ValueChangeHighlight value={totalEarnings} variant="default">
                  <RollingNumber value={totalEarnings} staggerDelay={40} />
                </ValueChangeHighlight>
              </div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Total Reports</div>
            </div>
          </TiltCard>
          <TiltCard tiltIntensity={10} glareIntensity={0.12} scale={1.02}>
            <div className="tilt-stat-card tilt-stat-card-success">
              <div className="flex items-center gap-4">
                <ProgressRing value={beatRate} size={56} color="#22c55e" delay={200} duration={1400} />
                <div>
                  <div className="text-3xl font-bold text-gradient-green">
                    <ValueChangeHighlight value={beatRate} variant="success">
                      <RollingNumber value={beatRate} suffix="%" staggerDelay={50} />
                    </ValueChangeHighlight>
                  </div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Beat Rate</div>
                </div>
              </div>
            </div>
          </TiltCard>
          <TiltCard tiltIntensity={10} glareIntensity={0.12} scale={1.02}>
            <div className="tilt-stat-card">
              <div className="text-4xl font-bold text-white mb-1">
                <ValueChangeHighlight value={reportedCount} variant="default">
                  <RollingNumber value={reportedCount} staggerDelay={45} />
                </ValueChangeHighlight>
              </div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Reported</div>
            </div>
          </TiltCard>
          <TiltCard tiltIntensity={10} glareIntensity={0.12} scale={1.02}>
            <div className="tilt-stat-card tilt-stat-card-warning">
              <div className="text-4xl font-bold text-amber-400 mb-1">
                <ValueChangeHighlight value={pendingCount} variant="warning">
                  <RollingNumber value={pendingCount} staggerDelay={35} />
                </ValueChangeHighlight>
              </div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Pending</div>
            </div>
          </TiltCard>
        </div>

        {/* No Results State */}
        {isFiltering && filteredEarnings.length === 0 && (
          <div className="card">
            <div className="search-no-results">
              <svg className="search-no-results-icon" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <div className="search-no-results-text">No earnings found for "{searchQuery}"</div>
              <div className="search-no-results-hint">Try searching by ticker symbol (AAPL) or company name</div>
            </div>
          </div>
        )}

        {/* Swipe hint for mobile */}
        <SwipeHint visible={showSwipeHint && !isFiltering} />

        {/* Calendar Weeks with Swipe Navigation */}
        {(!isFiltering || filteredEarnings.length > 0) && (
        <SwipeNavigator
          onSwipeLeft={() => navigateWeek(1, true)}
          onSwipeRight={() => navigateWeek(-1, true)}
          className="swipe-container"
        >
        <div 
          key={slideKey.current}
          className={`space-y-6 ${slideDirection === 'left' ? 'week-slide-enter-right' : ''} ${slideDirection === 'right' ? 'week-slide-enter-left' : ''}`}
        >
          {weeks.map((weekStart, weekIndex) => (
            <div key={weekIndex} className="card animate-fade-in" style={{ animationDelay: `${weekIndex * 100}ms` }}>
              {/* Week Header */}
              <div className="week-header">
                {days.map((day, dayIndex) => {
                  const date = new Date(weekStart);
                  date.setDate(date.getDate() + dayIndex);
                  const isToday = date.getTime() === today.getTime();
                  const isPast = date < today;
                  const dateStr = formatDate(date);
                  const dayEarnings = filteredEarnings.filter(e => e.date === dateStr);
                  
                  return (
                    <div key={dayIndex} className={`day-header ${isToday ? 'today' : ''} ${isPast ? 'past' : ''}`}>
                      <div className="day-name">{day}</div>
                      <div className="day-num">{date.getDate()}</div>
                      {dayEarnings.length > 0 && (
                        <div className="badge badge-neutral mt-2 text-[10px] py-1 px-2">
                          {dayEarnings.length} {dayEarnings.length === 1 ? 'report' : 'reports'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Week Content */}
              <div className="week-content">
                {days.map((_, dayIndex) => {
                  const date = new Date(weekStart);
                  date.setDate(date.getDate() + dayIndex);
                  const dateStr = formatDate(date);
                  const preMarket = filteredEarnings.filter((e) => e.date === dateStr && e.time === 'pre');
                  const postMarket = filteredEarnings.filter((e) => e.date === dateStr && e.time === 'post');
                  const hasEarnings = preMarket.length > 0 || postMarket.length > 0;
                  const isToday = date.getTime() === today.getTime();

                  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
                  const mobileDate = `${dayNames[dayIndex]}, ${date.getDate()} ${months[date.getMonth()].slice(0, 3)}`;
                  
                  return (
                    <div key={dayIndex} className={`day-content ${isToday ? 'today' : ''}`} data-mobile-date={mobileDate}>
                      {!hasEarnings ? (
                        <AnimatedEmptyState 
                          variant={isToday ? 'today' : date < today ? 'past' : 'future'} 
                        />
                      ) : (
                        <div className="space-y-5">
                          {preMarket.length > 0 && (
                            <div>
                              <div className="session-header pre-market">
                                <MarketSessionIcon session="pre" size={18} />
                                <span className="session-header-label">Pre-Market</span>
                              </div>
                              <div className="space-y-2">
                                {preMarket.map((e, i) => <EarningsCard key={e.ticker} earning={e} isToday={isToday} animationIndex={i} />)}
                              </div>
                            </div>
                          )}
                          {postMarket.length > 0 && (
                            <div>
                              <div className="session-header after-hours">
                                <MarketSessionIcon session="post" size={18} />
                                <span className="session-header-label">After Hours</span>
                              </div>
                              <div className="space-y-2">
                                {postMarket.map((e, i) => <EarningsCard key={e.ticker} earning={e} isToday={isToday} animationIndex={preMarket.length + i} />)}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        </SwipeNavigator>
        )}

        {/* Legend */}
        <div className="mt-10 flex items-center justify-center gap-8 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            Beat Estimates
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
            Missed Estimates
          </div>
          <div className="flex items-center gap-2">
            <ProgressRing value={75} size={14} strokeWidth={2} color="#f59e0b" duration={600} />
            <span className="ml-1">Beat Probability</span>
          </div>
        </div>
      </main>

      {/* Floating back to top button */}
      <BackToTop />
    </div>
  );
}
