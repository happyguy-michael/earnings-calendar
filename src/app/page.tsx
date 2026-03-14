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
import { FlipCountdownBadge } from '@/components/FlipDigit';
import { TimeSinceInline } from '@/components/TimeSince';
import { ProgressRing } from '@/components/ProgressRing';
import { OddsGauge } from '@/components/OddsGauge';
import { BackToTop } from '@/components/BackToTop';
import { MotionToggle } from '@/components/MotionPreferences';
import { TiltCard } from '@/components/TiltCard';
import { Ripple } from '@/components/Ripple';
import { FloatingParticles } from '@/components/FloatingParticles';
import { MagneticButton } from '@/components/MagneticButton';
import { TodayButton } from '@/components/TodayButton';
import { MarketSessionIcon } from '@/components/MarketSessionIcon';
import { KeyboardShortcutsOverlay, KeyboardShortcutsHint } from '@/components/KeyboardShortcuts';
import { AnimatedEmptyState } from '@/components/AnimatedEmptyState';
import { BadgeSparkle } from '@/components/BadgeSparkle';
import { GrainOverlay } from '@/components/GrainOverlay';
import { useToast } from '@/components/Toast';
import { ValueChangeHighlight } from '@/components/ValueChangeHighlight';
import { LegendIndicator, LegendProgressRing } from '@/components/LegendIndicator';
import { WeekIndicator } from '@/components/WeekIndicator';
import { ParallaxFloat } from '@/components/ParallaxFloat';
import { SessionDivider } from '@/components/SessionDivider';
import { MarketStatus } from '@/components/MarketStatus';
import { TickerRibbon } from '@/components/TickerRibbon';
import { AnimatedStatIcon } from '@/components/AnimatedStatIcon';
import { FreshBadge } from '@/components/FreshBadge';
import { DynamicTitle } from '@/components/DynamicTitle';
import { DynamicFavicon } from '@/components/DynamicFavicon';
import { BorderGlowSpot } from '@/components/BorderGlowSpot';
import { SurpriseMagnitudeCompact } from '@/components/SurpriseMagnitude';
import { ScrollProgress } from '@/components/ScrollProgress';
import { ImminentGlow } from '@/components/ImminentGlow';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';
import { SurpriseCountUp, SurpriseScramble } from '@/components/AnimatedSurpriseBadge';
import { ScrambleTicker } from '@/components/TextScramble';
import { ExceptionalGlow, MonsterBeatIcon } from '@/components/ExceptionalGlow';
import { DisasterMiss, DisasterMissIcon } from '@/components/DisasterMiss';
import { SearchEmptyState } from '@/components/SearchEmptyState';
import { EPSComparisonBadge } from '@/components/EPSComparisonBadge';
import { FilterGlow } from '@/components/FilterGlow';
import { CardLightSweep } from '@/components/CardLightSweep';
import { CursorGlowCard } from '@/components/CursorGlowBorder';
import { DataFreshnessIndicator } from '@/components/DataFreshness';
import { CompanyLogo } from '@/components/ProgressiveImage';
import { SnapshotProvider, SnapshotToggle, SnapshotIndicator, SnapshotBadge, useSnapshot } from '@/components/SnapshotMode';
import { AnimatedGradientBorder } from '@/components/AnimatedGradientBorder';
import { useHaptic, HapticToggle } from '@/components/HapticFeedback';
import { useAudioFeedback, AudioToggle } from '@/components/AudioFeedback';
import { PullToRefresh } from '@/components/PullToRefresh';
import { WeekSummaryCard } from '@/components/WeekSummaryCard';
import { FloatingActionMenu, FABAction, FABIcons } from '@/components/FloatingActionMenu';
import { PulseIndicator } from '@/components/PulseIndicator';
import { EPSTrendDots } from '@/components/EPSTrendDots';
import { RevenueIndicator } from '@/components/RevenueIndicator';
import { FlipMonth } from '@/components/FlipMonth';
import { TodayNarrative } from '@/components/TodayNarrative';
import { SessionProgressBar } from '@/components/SessionProgressBar';
import { DayStatsPopover } from '@/components/DayStatsPopover';
import { SentimentPulse } from '@/components/SentimentPulse';
import { DayHeatIndicator } from '@/components/DayHeatIndicator';
import { QuickPeek } from '@/components/QuickPeek';
import { NextUpQueue } from '@/components/NextUpQueue';
import { GlassReflection } from '@/components/GlassReflection';
import { NumberJolt } from '@/components/NumberJolt';
import { GlitchPending } from '@/components/GlitchText';
import { MarketMoodRing } from '@/components/MarketMoodRing';
import { DepthHover, DepthHoverContainer } from '@/components/DepthHover';
import { OrbitDot } from '@/components/OrbitDot';
import { FrostedHeader } from '@/components/EnhancedFrostedGlass';
import { VelocityBlurProvider, VelocityBlurCard } from '@/components/VelocityBlur';
import { ContextualCardActions } from '@/components/ContextualCardActions';
import { useUndoToast } from '@/components/UndoToast';
import { useKeyPressEcho, formatKeyName } from '@/components/KeyPressEcho';
import { WeekNavPreview, useWeekNavPreview } from '@/components/WeekNavPreview';
import { DayColumnProvider, DayHeaderHighlight, DayColumnCard } from '@/components/DayColumnHighlight';
import { TodayMarkerLine } from '@/components/TodayMarkerLine';
import { ScrollAnchoredWeekBadge } from '@/components/ScrollAnchoredWeekBadge';
import { ScrollMinimap, useActiveWeekIndex } from '@/components/ScrollMinimap';
import { SkeletonTransition } from '@/components/SkeletonTransition';
import { CommandPaletteProvider, CommandTrigger } from '@/components/CommandPalette';
import { BlurReveal, BlurRevealGroup } from '@/components/BlurReveal';
import { CascadeReveal, CascadeItem } from '@/components/CascadeReveal';
import { KonamiEasterEgg } from '@/components/KonamiEasterEgg';
import { SpotlightContainer, SpotlightCard } from '@/components/SpotlightHover';
import { CursorTrail, CursorTrailToggle, useCursorTrail } from '@/components/CursorTrail';
import { PrintStyles } from '@/components/PrintStyles';
import { AmbientTimeGlow } from '@/components/AmbientTimeGlow';
import { ElasticNumber, ElasticPercentage } from '@/components/ElasticNumber';
import { BreathingCard } from '@/components/BreathingCard';
import '@/components/TodayMarkerLine.css';

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

  // Determine if this is an exceptional beat worthy of animated border
  const isMonsterBeat = hasResult && earning.result === 'beat' && surprise >= 15;
  const isDisasterMiss = hasResult && earning.result === 'miss' && surprise <= -15;

  // Wrapper component - either AnimatedGradientBorder or fragment
  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (isMonsterBeat) {
      return (
        <AnimatedGradientBorder
          colorPreset="beat"
          borderWidth={2}
          borderRadius={14}
          duration={4}
          glowIntensity={0.35}
          backgroundColor="transparent"
          hoverOnly={false}
          className="monster-beat-border"
        >
          {children}
        </AnimatedGradientBorder>
      );
    }
    if (isDisasterMiss) {
      return (
        <AnimatedGradientBorder
          colorPreset="miss"
          borderWidth={2}
          borderRadius={14}
          duration={5}
          glowIntensity={0.25}
          backgroundColor="transparent"
          hoverOnly={false}
          className="disaster-miss-border"
        >
          {children}
        </AnimatedGradientBorder>
      );
    }
    return <>{children}</>;
  };

  // QuickPeek data for hover/long-press preview
  const quickPeekData = {
    ticker: earning.ticker,
    company: earning.company,
    eps: earning.eps,
    estimate: earning.estimate,
    revenue: earning.revenue,
    revenueEstimate: earning.revenueEstimate,
    beatOdds: earning.beatOdds,
    result: earning.result,
    time: earning.time,
  };

  return (
    <DepthHover 
      liftHeight={6} 
      hoverScale={1.015} 
      shadowBlur={24}
      shadowSpread={6}
      borderRadius={14}
      stiffness={350}
      damping={28}
      standalone
    >
    <QuickPeek data={quickPeekData}>
      <ContextualCardActions ticker={earning.ticker} company={earning.company}>
      <div className="earnings-card-wrapper">
        {/* Imminent glow for earnings reporting within 15 minutes */}
        {isTodayPending && (
          <ImminentGlow 
            targetDate={new Date(earning.date)} 
            time={earning.time}
            active={true}
          />
        )}
        <CardWrapper>
        <CardLightSweep 
          variant="diagonal" 
          color={hasResult ? (earning.result === 'beat' ? 'blue' : 'purple') : 'white'}
          duration={500}
          delay={50}
        >
          <Link 
            href={`/report/${earning.ticker}`} 
            className={`earnings-row earnings-card-stagger ${isTodayPending ? 'today-pending' : ''}`}
            style={{ 
              '--card-index': animationIndex,
              animationDelay: `${animationIndex * 40}ms` 
            } as React.CSSProperties}
          >
            <Ripple color="rgba(59, 130, 246, 0.25)" duration={500} />
            <span className="shimmer-sweep" aria-hidden="true" />
        <CompanyLogo 
          ticker={earning.ticker} 
          company={earning.company} 
          size={40}
          className="logo-container"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">
              <ScrambleTicker 
                text={earning.ticker} 
                delay={animationIndex * 60}
                duration={350}
              />
            </span>
            <BeatStreakBadge streak={beatStreak} />
            <EPSTrendDots 
              estimate={earning.estimate}
              currentBeat={earning.result === 'beat'}
              actualEps={earning.eps ?? undefined}
              delay={animationIndex * 50 + 100}
              size="sm"
            />
            <LiveDot isToday={!!isToday} isPending={isPending} time={earning.time} />
          </div>
          <div className="text-xs text-zinc-500 truncate flex items-center gap-2">
            {earning.company}
            {/* Show time since for recently reported earnings */}
            {hasResult && isToday && (
              <TimeSinceInline reportedAt={new Date(earning.date)} time={earning.time} />
            )}
          </div>
        </div>

        {/* Countdown timer for today's pending earnings - flip digit style */}
        {isTodayPending && (
          <FlipCountdownBadge targetDate={new Date(earning.date)} time={earning.time} />
        )}

        {hasResult ? (
          <div className="flex items-center gap-2">
            {/* Fresh badge for recently reported earnings */}
            {isToday && (
              <FreshBadge reportedAt={new Date(earning.date)} time={earning.time} freshnessHours={4} />
            )}
            {/* Revenue indicator - shows if revenue confirmed or diverged from EPS */}
            <RevenueIndicator
              revenue={earning.revenue ?? null}
              revenueEstimate={earning.revenueEstimate ?? null}
              epsResult={earning.result}
              delay={animationIndex * 50 + 100}
              size="sm"
            />
            {/* EPS comparison badge - shows actual EPS vs estimate with mini bar */}
            {earning.estimate && (
              <EPSComparisonBadge
                actual={earning.eps!}
                estimate={earning.estimate}
                delay={animationIndex * 50 + 50}
                size="sm"
                showBar={true}
              />
            )}
            {/* Surprise magnitude bar - visual indicator of beat/miss size */}
            <SurpriseMagnitudeCompact surprise={surprise} delay={animationIndex * 50} />
            {earning.result === 'beat' ? (
              <ExceptionalGlow surprise={surprise} delay={animationIndex * 50 + 300}>
                <BadgeSparkle active={true} particleCount={6}>
                  <span className="badge badge-beat">
                    <MonsterBeatIcon surprise={surprise} />
                    {/* Use scramble effect for monster beats (≥15%), count-up for others */}
                    {surprise >= 15 ? (
                      <SurpriseScramble 
                        value={surprise} 
                        delay={animationIndex * 50 + 200} 
                        duration={600}
                        glowColor="#22c55e"
                      />
                    ) : (
                      <SurpriseCountUp value={surprise} delay={animationIndex * 50 + 200} duration={500} />
                    )}
                  </span>
                </BadgeSparkle>
              </ExceptionalGlow>
            ) : (
              <DisasterMiss surprise={surprise} delay={animationIndex * 50 + 300}>
                <span className="badge badge-miss">
                  <DisasterMissIcon surprise={surprise} />
                  {/* Use scramble effect for disaster misses (≤-15%), count-up for others */}
                  {surprise <= -15 ? (
                    <SurpriseScramble 
                      value={surprise} 
                      delay={animationIndex * 50 + 200} 
                      duration={600}
                      glowColor="#ef4444"
                    />
                  ) : (
                    <SurpriseCountUp value={surprise} delay={animationIndex * 50 + 200} duration={500} />
                  )}
                </span>
              </DisasterMiss>
            )}
          </div>
        ) : earning.beatOdds ? (
          <OddsGauge 
            value={earning.beatOdds} 
            size={44} 
            delay={animationIndex * 80} 
            duration={800}
          />
        ) : null}
        </Link>
      </CardLightSweep>
      </CardWrapper>
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
      </ContextualCardActions>
    </QuickPeek>
    </DepthHover>
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
  const [filterKey, setFilterKey] = useState(0);
  const [isFilterTransitioning, setIsFilterTransitioning] = useState(false);
  const [lastDataUpdate, setLastDataUpdate] = useState(() => new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const slideKey = useRef(0);
  const { showToast } = useToast();
  const { showUndoToast } = useUndoToast();
  const { trigger: haptic } = useHaptic();
  const { showKeyEcho } = useKeyPressEcho();
  const { enabled: cursorTrailEnabled, toggle: toggleCursorTrail } = useCursorTrail(false);
  const weekNavPreview = useWeekNavPreview(currentWeekStart);
  
  // Simulate data refresh (would be replaced with real API call)
  const handleDataRefresh = useCallback(() => {
    haptic('light');
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setLastDataUpdate(new Date());
      setIsRefreshing(false);
      haptic('success');
      showToast('Data refreshed', { type: 'success', icon: '✓', duration: 2000 });
    }, 1500);
  }, [showToast, haptic]);

  // Handle filter changes with smooth transition animation
  const handleFilterChange = useCallback((newFilter: FilterType) => {
    if (newFilter === statusFilter) return;
    
    // Haptic feedback for selection
    haptic('select');
    
    // Start exit animation
    setIsFilterTransitioning(true);
    
    // After brief exit animation, update filter and trigger entrance
    setTimeout(() => {
      setStatusFilter(newFilter);
      setFilterKey(prev => prev + 1);
      setIsFilterTransitioning(false);
    }, 150);
  }, [statusFilter, haptic]);

  // Calculate counts for filter chips (before any filtering)
  const filterCounts = useMemo(() => ({
    all: earnings.length,
    beat: earnings.filter(e => e.result === 'beat').length,
    miss: earnings.filter(e => e.result === 'miss').length,
    pending: earnings.filter(e => e.eps === undefined || e.eps === null).length,
  }), []);

  // Calculate pending earnings for TODAY (for notification indicator)
  const pendingToday = useMemo(() => {
    const todayStr = formatDate(new Date());
    return earnings.filter(
      e => e.date === todayStr && (e.eps === undefined || e.eps === null)
    ).length;
  }, []);

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
    // Haptic feedback for swipe/navigation
    haptic(fromSwipe ? 'swipe' : 'light');
    
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
  }, [showSwipeHint, haptic]);

  const goToToday = useCallback(() => {
    // Haptic feedback for success action
    haptic('success');
    setCurrentWeekStart(getWeekStart(new Date()));
    showToast('Jumped to current week', { type: 'success', icon: '📅', duration: 2000 });
  }, [showToast, haptic]);

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

  // Keyboard navigation for weeks and filters
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        showKeyEcho(formatKeyName(e.key), 'Previous week');
        navigateWeek(-1);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        showKeyEcho(formatKeyName(e.key), 'Next week');
        navigateWeek(1);
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        showKeyEcho('T', 'Jump to today');
        goToToday();
      }
      // Filter shortcuts (A/B/M/P)
      else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        showKeyEcho('A', 'All');
        handleFilterChange('all');
        showToast('Showing all earnings', { type: 'info', icon: '📋', duration: 1500 });
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        showKeyEcho('B', 'Beats');
        handleFilterChange('beat');
        showToast('Filtering to beats', { type: 'success', icon: '📈', duration: 1500 });
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        showKeyEcho('M', 'Misses');
        handleFilterChange('miss');
        showToast('Filtering to misses', { type: 'warning', icon: '📉', duration: 1500 });
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        showKeyEcho('P', 'Pending');
        handleFilterChange('pending');
        showToast('Filtering to pending', { type: 'info', icon: '⏳', duration: 1500 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateWeek, goToToday, handleFilterChange, showToast, showKeyEcho]);

  // Refs for each week card (for smooth scroll-to on indicator click)
  // NOTE: Must be declared before any conditional returns (Rules of Hooks)
  const week0Ref = useRef<HTMLDivElement>(null);
  const week1Ref = useRef<HTMLDivElement>(null);
  const week2Ref = useRef<HTMLDivElement>(null);
  const weekRefs = useMemo(() => [week0Ref, week1Ref, week2Ref], []);

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

  // Calculate which week (0-2) contains today for the week indicator
  const todayWeekStart = getWeekStart(new Date());
  const todayWeekIndex = weeks.findIndex(weekStart => 
    weekStart.getTime() === todayWeekStart.getTime()
  );

  // Calculate week date ranges for minimap labels
  const weekDates = weeks.map(weekStart => {
    const start = new Date(weekStart);
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 4); // Friday
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  });

  // Track which week is currently most visible in viewport
  const activeWeekIndex = useActiveWeekIndex(weekRefs);

  // Scroll to a specific week when minimap is clicked
  const scrollToWeek = useCallback((weekIndex: number) => {
    const ref = weekRefs[weekIndex];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      haptic('light');
    }
  }, [weekRefs, haptic]);

  // Pull-to-refresh handler (wraps existing refresh logic)
  const handlePullRefresh = useCallback(async () => {
    // Simulate data refresh - would be replaced with real API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLastDataUpdate(new Date());
    showToast('Data refreshed', { type: 'success', icon: '✓', duration: 2000 });
  }, [showToast]);

  // Theme toggle callback for command palette
  const toggleTheme = useCallback(() => {
    const isDark = !document.documentElement.classList.contains('light');
    if (isDark) {
      document.documentElement.classList.add('light');
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      showToast('Light mode enabled', { type: 'info', icon: '☀️', duration: 2000 });
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
      showToast('Dark mode enabled', { type: 'info', icon: '🌙', duration: 2000 });
    }
  }, [showToast]);

  return (
    <SkeletonTransition
      loading={isLoading}
      skeleton={<SkeletonCalendar />}
      duration={500}
      blur={true}
      scale={true}
    >
    <CommandPaletteProvider
      onFilterChange={handleFilterChange}
      onSearch={setSearchQuery}
      onJumpToToday={goToToday}
      onToggleTheme={toggleTheme}
      onRefresh={handleDataRefresh}
    >
    <SnapshotProvider autoResumeSeconds={300}>
    <VelocityBlurProvider threshold={0.6} maxBlur={2.5} sensitivity={2}>
    <PullToRefresh onRefresh={handlePullRefresh} threshold={80} color="#3b82f6">
    <div className="min-h-screen relative">
      {/* Snapshot mode indicator (when paused) */}
      <SnapshotIndicator />
      
      {/* Scroll progress indicator */}
      <ScrollProgress height={3} hideAtTop={true} showGlow={true} />
      
      {/* Floating week indicator - shows which week section is in view */}
      <ScrollAnchoredWeekBadge
        weekRefs={weekRefs}
        weekStarts={weeks}
        todayWeekIndex={todayWeekIndex}
        topOffset={isScrolled ? 80 : 100}
        hideAtTop={true}
      />
      
      {/* Scroll minimap - visual week navigation on right edge */}
      <ScrollMinimap
        weekCount={weeks.length}
        activeWeekIndex={activeWeekIndex}
        weekDates={weekDates}
        onWeekClick={scrollToWeek}
        position="right"
        offset={16}
        showLabels={true}
        hideAtTop={true}
        showAfterScroll={150}
      />
      
      {/* Dynamic tab title with pending count */}
      <DynamicTitle pendingToday={pendingToday} baseTitle="Earnings Calendar" />
      
      {/* Dynamic favicon badge with pending count */}
      <DynamicFavicon count={pendingToday} animate={true} />
      
      {/* Print styles - clean layout for printing (⌘⇧P) */}
      <PrintStyles />
      
      {/* Animated dot grid background with cursor glow */}
      <AnimatedGridBackground 
        dotGap={40}
        dotSize={1.2}
        dotOpacity={0.15}
        cursorGlow={true}
        glowRadius={180}
        glowIntensity={0.4}
        pulse={true}
        pulseSpeed={5000}
      />
      
      {/* Ambient time-of-day lighting - subtle organic color shift */}
      <AmbientTimeGlow 
        intensity={0.8}
        breathing={true}
        breathingDuration={10000}
      />
      
      {/* Floating background particles */}
      <FloatingParticles count={35} speed={0.25} maxSize={3} minSize={1} />
      
      {/* Premium grain texture overlay */}
      <GrainOverlay opacity={0.025} animate={true} blendMode="overlay" />
      
      {/* Keyboard shortcuts overlay */}
      <KeyboardShortcutsOverlay />
      
      {/* Hidden Easter egg - Konami Code (↑↑↓↓←→←→BA) */}
      <KonamiEasterEgg />
      
      {/* Cursor trail effect - premium cursor interaction */}
      <CursorTrail 
        enabled={cursorTrailEnabled}
        count={15}
        dotSize={3}
        color="rgba(99, 102, 241, 0.7)"
        glowColor="rgba(139, 92, 246, 0.35)"
        minDistance={10}
        opacityFalloff={2.8}
      />
      
      {/* Header - shrinks on scroll with enhanced frosted glass */}
      <FrostedHeader
        scrolled={isScrolled}
        className={`sticky-header ${isScrolled ? 'scrolled' : ''}`}
        blurRadius={isScrolled ? 24 : 20}
        extension={isScrolled ? 100 : 80}
        showTopGradient={true}
      >
        <div className="sticky-header-inner">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="sticky-header-title">
                  Earnings <span className="text-gradient text-shine-sweep">Calendar</span>
                </h1>
                <MarketStatus />
                <div className="hidden lg:flex items-center gap-2">
                  <DataFreshnessIndicator
                    lastUpdated={lastDataUpdate}
                    onRefresh={handleDataRefresh}
                    isRefreshing={isRefreshing}
                    compact
                    agingThreshold={120}
                    staleThreshold={600}
                  />
                  <SnapshotToggle size="sm" variant="pill" />
                </div>
              </div>
              <p className="sticky-header-subtitle">
                <FlipMonth 
                  month={months[currentWeekStart.getMonth()]} 
                  year={currentWeekStart.getFullYear()} 
                />
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
                <span className="kbd">⌘K</span>
                <span>search</span>
                <span className="mx-1">·</span>
                <span className="kbd">←</span>
                <span className="kbd">→</span>
                <span>navigate</span>
                <span className="mx-1">·</span>
                <span className="kbd">B</span>
                <span className="kbd">M</span>
                <span className="kbd">P</span>
                <span>filter</span>
                <span className="mx-1">·</span>
                <span className="kbd">?</span>
                <span>help</span>
              </div>
              <KeyboardShortcutsHint />
              <CommandTrigger className="hidden lg:flex" />
              <MotionToggle size="sm" />
              <HapticToggle size="sm" />
              <AudioToggle size="sm" />
              <CursorTrailToggle enabled={cursorTrailEnabled} onToggle={toggleCursorTrail} size="sm" />
              <ThemeToggle />
              <TodayButton 
                onClick={goToToday}
                pendingToday={pendingToday}
              />
              <div className="flex bg-white/5 rounded-xl border border-white/10 overflow-visible relative">
                {/* Previous Week Button */}
                <div 
                  className="relative"
                  onMouseEnter={() => weekNavPreview.showPreview('prev')}
                  onMouseLeave={weekNavPreview.hidePreview}
                >
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
                  {weekNavPreview.previewWeek && weekNavPreview.previewDirection === 'prev' && (
                    <WeekNavPreview
                      targetWeek={weekNavPreview.previewWeek}
                      direction="prev"
                      visible={weekNavPreview.isVisible}
                    />
                  )}
                </div>
                <div className="w-px bg-white/10" />
                {/* Next Week Button */}
                <div 
                  className="relative"
                  onMouseEnter={() => weekNavPreview.showPreview('next')}
                  onMouseLeave={weekNavPreview.hidePreview}
                >
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
                  {weekNavPreview.previewWeek && weekNavPreview.previewDirection === 'next' && (
                    <WeekNavPreview
                      targetWeek={weekNavPreview.previewWeek}
                      direction="next"
                      visible={weekNavPreview.isVisible}
                    />
                  )}
                </div>
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
              onChange={handleFilterChange}
              counts={filterCounts}
            />
          </div>
        </div>
      </FrostedHeader>

      {/* Ticker Ribbon - scrolling earnings tape */}
      <TickerRibbon earnings={earnings} speed={35} />

      {/* Session Progress Bar - visual timeline of trading day */}
      <div className="max-w-4xl mx-auto px-6 mt-4">
        <SessionProgressBar showLabels={true} compact={false} />
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Row with Breathing Cards, Glass Reflection, Cursor Glow, Parallax Float, Rolling Numbers, Animated Icons, and Change Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 stats-grid">
          <BreathingCard duration={5000} phase={0} amplitude={0.006} breatheShadow={true}>
            <ParallaxFloat intensity={0.04} delay={0}>
              <GlassReflection 
                mode="auto" 
                interval={10000} 
                delay={500} 
                duration={900}
                beamWidth={100}
                angle={-18}
                intensity={0.3}
                blur={50}
                borderRadius={20}
              >
                <CursorGlowCard 
                  variant="default" 
                  borderRadius={20} 
                  intensity={0.5} 
                  glowRadius={180}
                  className="stat-entrance"
                >
                  <div className="flex items-center gap-3">
                    <AnimatedStatIcon type="total" size={28} />
                    <div>
                      <div className="text-3xl font-bold text-white">
                        <NumberJolt value={totalEarnings} intensity={3} duration={350}>
                          <ValueChangeHighlight value={totalEarnings} variant="default">
                            <ElasticNumber value={totalEarnings} spring="snappy" animateOnMount />
                          </ValueChangeHighlight>
                        </NumberJolt>
                      </div>
                      <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Total Reports</div>
                    </div>
                  </div>
                </CursorGlowCard>
              </GlassReflection>
            </ParallaxFloat>
          </BreathingCard>
          <BreathingCard duration={5500} phase={0.25} amplitude={0.007} breatheShadow={true} breatheGlow={true} glowColor="rgba(34, 197, 94, 0.25)">
            <ParallaxFloat intensity={0.05} delay={50}>
              <GlassReflection 
                mode="auto" 
                interval={10000} 
                delay={2500} 
                duration={900}
                beamWidth={100}
                angle={-18}
                color="rgba(34, 197, 94, 0.5)"
                intensity={0.35}
                blur={50}
                borderRadius={20}
              >
                <CursorGlowCard 
                  variant="success" 
                  borderRadius={20} 
                  intensity={0.5} 
                  glowRadius={180}
                  className="stat-entrance"
                >
                  <div className="flex items-center gap-3">
                    <ProgressRing value={beatRate} size={48} color="#22c55e" delay={200} duration={1400} />
                    <div>
                      <div className="text-2xl font-bold text-gradient-green">
                        <NumberJolt value={beatRate} intensity={4} duration={400} directional>
                          <ValueChangeHighlight value={beatRate} variant="success">
                            <ElasticPercentage value={beatRate} animateOnMount className="elastic-success" />
                          </ValueChangeHighlight>
                        </NumberJolt>
                      </div>
                      <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Beat Rate</div>
                    </div>
                  </div>
                </CursorGlowCard>
              </GlassReflection>
            </ParallaxFloat>
          </BreathingCard>
          <BreathingCard duration={4800} phase={0.5} amplitude={0.006} breatheShadow={true}>
            <ParallaxFloat intensity={0.035} delay={100}>
              <GlassReflection 
                mode="auto" 
                interval={10000} 
                delay={4500} 
                duration={900}
                beamWidth={100}
                angle={-18}
                intensity={0.3}
                blur={50}
                borderRadius={20}
              >
                <CursorGlowCard 
                  variant="default" 
                  borderRadius={20} 
                  intensity={0.5} 
                  glowRadius={180}
                  className="stat-entrance"
                >
                  <div className="flex items-center gap-3">
                    <AnimatedStatIcon type="reported" size={28} />
                    <div>
                      <div className="text-3xl font-bold text-white">
                        <NumberJolt value={reportedCount} intensity={3} duration={350}>
                          <ValueChangeHighlight value={reportedCount} variant="default">
                            <ElasticNumber value={reportedCount} spring="snappy" animateOnMount />
                          </ValueChangeHighlight>
                        </NumberJolt>
                      </div>
                      <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Reported</div>
                    </div>
                  </div>
                </CursorGlowCard>
              </GlassReflection>
            </ParallaxFloat>
          </BreathingCard>
          <BreathingCard duration={5200} phase={0.75} amplitude={0.007} breatheShadow={true} breatheGlow={true} glowColor="rgba(251, 191, 36, 0.2)">
            <ParallaxFloat intensity={0.045} delay={150}>
              <GlassReflection 
                mode="auto" 
                interval={10000} 
                delay={6500} 
                duration={900}
                beamWidth={100}
                angle={-18}
                color="rgba(251, 191, 36, 0.4)"
                intensity={0.35}
                blur={50}
                borderRadius={20}
              >
                <CursorGlowCard 
                  variant="warning" 
                  borderRadius={20} 
                  intensity={0.5} 
                  glowRadius={180}
                  className="stat-entrance"
                >
                  <div className="flex items-center gap-3">
                    <AnimatedStatIcon type="pending" size={28} />
                    <div>
                      <div className="text-3xl font-bold text-amber-400">
                        <NumberJolt value={pendingCount} intensity={3} duration={350}>
                          <ValueChangeHighlight value={pendingCount} variant="warning">
                            <GlitchPending value={pendingCount} />
                          </ValueChangeHighlight>
                        </NumberJolt>
                      </div>
                      <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium flex items-center gap-1.5">
                        Pending
                        {pendingCount > 0 && (
                          <PulseIndicator 
                            status="pending" 
                            size="xs" 
                            variant="breathing"
                            label={`${pendingCount} earnings pending`}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </CursorGlowCard>
              </GlassReflection>
            </ParallaxFloat>
          </BreathingCard>
        </div>

        {/* Today's Narrative Summary + Sentiment Pulse - blur reveal entrance */}
        <BlurReveal 
          triggerOnMount 
          delay={200}
          blurAmount={10}
          yOffset={15}
          duration={700}
          className="today-summary-row"
        >
          <TodayNarrative earnings={earnings} />
          <SentimentPulse earnings={earnings} size="md" showLabel={true} />
        </BlurReveal>

        {/* Next Up Queue - upcoming earnings with countdowns */}
        <NextUpQueue earnings={earnings} maxItems={6} />

        {/* Week Navigation Indicator */}
        {(!isFiltering || filteredEarnings.length > 0) && (
          <WeekIndicator
            totalWeeks={3}
            todayWeekIndex={todayWeekIndex >= 0 ? todayWeekIndex : null}
            weekRefs={weekRefs}
          />
        )}

        {/* No Results State - Enhanced with animations and suggestions */}
        {isFiltering && filteredEarnings.length === 0 && (
          <div className="card">
            <SearchEmptyState
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              allTickers={earnings.map(e => e.ticker)}
              onClearSearch={() => {
                const prevQuery = searchQuery;
                setSearchQuery('');
                showUndoToast('Search cleared', () => {
                  setSearchQuery(prevQuery);
                });
              }}
              onClearFilters={() => {
                const prevQuery = searchQuery;
                const prevFilter = statusFilter;
                setSearchQuery('');
                setStatusFilter('all');
                showUndoToast('Filters cleared', () => {
                  setSearchQuery(prevQuery);
                  setStatusFilter(prevFilter);
                });
              }}
              onSelectTicker={(ticker) => setSearchQuery(ticker)}
            />
          </div>
        )}

        {/* Swipe hint for mobile */}
        <SwipeHint visible={showSwipeHint && !isFiltering} />

        {/* Calendar Weeks with Swipe Navigation */}
        {(!isFiltering || filteredEarnings.length > 0) && (
        <DayColumnProvider>
        <FilterGlow activeFilter={statusFilter}>
        <SwipeNavigator
          onSwipeLeft={() => navigateWeek(1, true)}
          onSwipeRight={() => navigateWeek(-1, true)}
          className="swipe-container"
        >
        <div 
          key={slideKey.current}
          id="earnings-content"
          role="tabpanel"
          aria-label={`Showing ${statusFilter === 'all' ? 'all' : statusFilter} earnings`}
          className={`space-y-6 ${slideDirection === 'left' ? 'week-slide-enter-right' : ''} ${slideDirection === 'right' ? 'week-slide-enter-left' : ''}`}
        >
          {weeks.map((weekStart, weekIndex) => (
            <OrbitDot
              key={weekIndex}
              duration={12000 + weekIndex * 2000}
              delay={weekIndex * 4000}
              dotSize={3}
              glowSize={10}
              glowIntensity={0.5}
              color={weekIndex === 0 ? 'brand' : weekIndex === 1 ? 'success' : 'warning'}
              trail={true}
              trailLength={2}
              borderRadius={20}
              hoverOnly={false}
            >
            <BorderGlowSpot 
              variant="default"
              intensity={0.5}
              glowSize={200}
              className="card week-card-stagger"
            >
            <div 
              ref={weekRefs[weekIndex]}
              style={{ 
                '--week-index': weekIndex,
                animationDelay: `${weekIndex * 100}ms` 
              } as React.CSSProperties}
            >
              {/* Week Mood Ring Header */}
              {(() => {
                // Calculate week stats for mood ring
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                weekEnd.setHours(23, 59, 59, 999);
                
                const weekEarnings = filteredEarnings.filter(e => {
                  const date = new Date(e.date);
                  return date >= weekStart && date <= weekEnd;
                });
                
                const weekBeats = weekEarnings.filter(e => e.result === 'beat').length;
                const weekMisses = weekEarnings.filter(e => e.result === 'miss').length;
                const weekPending = weekEarnings.filter(e => !e.result).length;
                const weekStartStr = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const weekEndDate = new Date(weekStart);
                weekEndDate.setDate(weekEndDate.getDate() + 4);
                const weekEndStr = weekEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                
                return (weekBeats + weekMisses + weekPending > 0) ? (
                  <div className="week-mood-header">
                    <div className="week-mood-header-left">
                      <span className="week-mood-header-dates">{weekStartStr} – {weekEndStr}</span>
                      {weekIndex === todayWeekIndex && (
                        <span className="week-mood-header-current">This Week</span>
                      )}
                    </div>
                    <MarketMoodRing
                      beats={weekBeats}
                      misses={weekMisses}
                      pending={weekPending}
                      size={44}
                      delay={weekIndex * 150}
                      compact={false}
                      showLabel={true}
                    />
                  </div>
                ) : null;
              })()}

              {/* Week Header */}
              <div className="week-header">
                {days.map((day, dayIndex) => {
                  const date = new Date(weekStart);
                  date.setDate(date.getDate() + dayIndex);
                  const isToday = date.getTime() === today.getTime();
                  const isPast = date < today;
                  const dateStr = formatDate(date);
                  const dayEarnings = filteredEarnings.filter(e => e.date === dateStr);
                  
                  // Wave animation delay: cascade from left (50ms between each day)
                  const waveDelay = slideDirection ? dayIndex * 50 : 0;
                  
                  return (
                    <DayStatsPopover
                      key={dayIndex}
                      earnings={dayEarnings}
                      date={date}
                      isToday={isToday}
                    >
                      <DayHeaderHighlight dayIndex={dayIndex}>
                        <div 
                          className={`day-header ${isToday ? 'today' : ''} ${isPast ? 'past' : ''} ${slideDirection ? 'day-header-wave' : ''}`}
                          style={{ '--wave-delay': `${waveDelay}ms` } as React.CSSProperties}
                        >
                          <div className="day-name">{day}</div>
                          <div className="day-num">{date.getDate()}</div>
                          {dayEarnings.length > 0 && (
                            <div className="badge badge-neutral mt-2 text-[10px] py-1 px-2">
                              {dayEarnings.length} {dayEarnings.length === 1 ? 'report' : 'reports'}
                            </div>
                          )}
                          {/* Today marker line - animated "you are here" indicator */}
                          <TodayMarkerLine 
                            isToday={isToday} 
                            delay={weekIndex * 100 + 300}
                          />
                        </div>
                      </DayHeaderHighlight>
                    </DayStatsPopover>
                  );
                })}
              </div>

              {/* Week Content */}
              <div className="week-content">
                {(() => {
                  // Pre-calculate day data for heat indicator
                  const weekDayData = days.map((_, dayIndex) => {
                    const date = new Date(weekStart);
                    date.setDate(date.getDate() + dayIndex);
                    const dateStr = formatDate(date);
                    const dayEarnings = filteredEarnings.filter((e) => e.date === dateStr);
                    const beats = dayEarnings.filter(e => e.result === 'beat').length;
                    const misses = dayEarnings.filter(e => e.result === 'miss').length;
                    const pending = dayEarnings.filter(e => !e.result).length;
                    return { count: dayEarnings.length, beats, misses, pending };
                  });
                  const maxDayCount = Math.max(...weekDayData.map(d => d.count), 1);
                  
                  return days.map((_, dayIndex) => {
                    const date = new Date(weekStart);
                    date.setDate(date.getDate() + dayIndex);
                    const dateStr = formatDate(date);
                    const preMarket = filteredEarnings.filter((e) => e.date === dateStr && e.time === 'pre');
                    const postMarket = filteredEarnings.filter((e) => e.date === dateStr && e.time === 'post');
                    const hasEarnings = preMarket.length > 0 || postMarket.length > 0;
                    const isToday = date.getTime() === today.getTime();
                    const dayData = weekDayData[dayIndex];

                    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
                    const mobileDate = `${dayNames[dayIndex]}, ${date.getDate()} ${months[date.getMonth()].slice(0, 3)}`;
                    
                    // Wave animation delay: cascade from left (65ms between each day, slightly offset from headers)
                    const waveDelay = slideDirection ? (dayIndex * 65) + 30 : 0;
                    
                    return (
                      <DayColumnCard key={dayIndex} dayIndex={dayIndex}>
                        <div 
                          className={`day-content ${isToday ? 'today' : ''} ${slideDirection ? 'day-wave-reveal' : ''}`} 
                          data-mobile-date={mobileDate}
                          style={{ '--wave-delay': `${waveDelay}ms` } as React.CSSProperties}
                        >
                          {!hasEarnings ? (
                            <AnimatedEmptyState 
                            variant={isToday ? 'today' : date < today ? 'past' : 'future'} 
                          />
                        ) : (
                          <div className="space-y-5">
                            {preMarket.length > 0 && (
                              <div>
                                <SessionDivider variant="pre" />
                                <div className="session-header pre-market">
                                  <MarketSessionIcon session="pre" size={18} />
                                  <span className="session-header-label">Pre-Market</span>
                                </div>
                                <SpotlightContainer>
                                <CascadeReveal
                                  staggerDelay={50}
                                  duration={400}
                                  preset="spring"
                                  direction="up"
                                  distance={16}
                                  threshold={0.1}
                                  delay={weekIndex * 80}
                                  className={`space-y-2 filter-cards-container ${isFilterTransitioning ? 'exiting' : ''}`}
                                >
                                  {preMarket.map((e, i) => (
                                    <CascadeItem key={`${e.ticker}-${filterKey}`} index={i}>
                                      <SpotlightCard id={`pre-${dateStr}-${e.ticker}`} dimOpacity={0.5} dimScale={0.985}>
                                      <VelocityBlurCard staggerIndex={i}>
                                        <EarningsCard earning={e} isToday={isToday} animationIndex={i} />
                                      </VelocityBlurCard>
                                      </SpotlightCard>
                                    </CascadeItem>
                                  ))}
                                </CascadeReveal>
                                </SpotlightContainer>
                              </div>
                            )}
                            {postMarket.length > 0 && (
                              <div>
                                <SessionDivider variant="post" />
                                <div className="session-header after-hours">
                                  <MarketSessionIcon session="post" size={18} />
                                  <span className="session-header-label">After Hours</span>
                                </div>
                                <SpotlightContainer>
                                <CascadeReveal
                                  staggerDelay={50}
                                  duration={400}
                                  preset="spring"
                                  direction="up"
                                  distance={16}
                                  threshold={0.1}
                                  delay={weekIndex * 80 + (preMarket.length > 0 ? 150 : 0)}
                                  className={`space-y-2 filter-cards-container ${isFilterTransitioning ? 'exiting' : ''}`}
                                >
                                  {postMarket.map((e, i) => (
                                    <CascadeItem key={`${e.ticker}-${filterKey}`} index={i}>
                                      <SpotlightCard id={`post-${dateStr}-${e.ticker}`} dimOpacity={0.5} dimScale={0.985}>
                                      <VelocityBlurCard staggerIndex={preMarket.length + i}>
                                        <EarningsCard earning={e} isToday={isToday} animationIndex={preMarket.length + i} />
                                      </VelocityBlurCard>
                                      </SpotlightCard>
                                    </CascadeItem>
                                  ))}
                                </CascadeReveal>
                                </SpotlightContainer>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Heat indicator showing day volume */}
                        <DayHeatIndicator
                            count={dayData.count}
                            maxCount={maxDayCount}
                            beats={dayData.beats}
                            misses={dayData.misses}
                            pending={dayData.pending}
                          />
                        </div>
                      </DayColumnCard>
                    );
                  });
                })()}
              </div>
              
              {/* Week Summary Card - celebratory end-of-week recap */}
              <WeekSummaryCard 
                weekStart={weekStart} 
                earnings={filteredEarnings}
                isCurrentWeek={weekIndex === todayWeekIndex}
              />
            </div>
            </BorderGlowSpot>
            </OrbitDot>
          ))}
        </div>
        </SwipeNavigator>
        </FilterGlow>
        </DayColumnProvider>
        )}

        {/* Legend with animated indicators - blur reveal on scroll */}
        <BlurRevealGroup
          staggerDelay={80}
          blurAmount={10}
          yOffset={20}
          duration={600}
          threshold={0.3}
          className="mt-10 flex items-center justify-center gap-8 text-xs text-zinc-500"
        >
          {[
            <div key="beat" className="flex items-center gap-2">
              <LegendIndicator type="beat" size={12} />
              Beat Estimates
            </div>,
            <div key="miss" className="flex items-center gap-2">
              <LegendIndicator type="miss" size={12} />
              Missed Estimates
            </div>,
            <div key="odds" className="flex items-center gap-2">
              <LegendProgressRing value={75} size={14} color="#f59e0b" />
              <span className="ml-1">Beat Probability</span>
            </div>
          ]}
        </BlurRevealGroup>
      </main>

      {/* Floating back to top button */}
      <BackToTop />
      
      {/* Mobile Floating Action Menu - quick access to filters and actions */}
      <FloatingActionMenu
        actions={[
          {
            id: 'today',
            icon: <FABIcons.Today />,
            label: 'Jump to Today',
            onClick: goToToday,
            color: 'blue',
          },
          {
            id: 'beat',
            icon: <FABIcons.Beat />,
            label: 'Show Beats',
            onClick: () => handleFilterChange('beat'),
            color: 'green',
            badge: filterCounts.beat,
          },
          {
            id: 'miss',
            icon: <FABIcons.Miss />,
            label: 'Show Misses',
            onClick: () => handleFilterChange('miss'),
            color: 'red',
            badge: filterCounts.miss,
          },
          {
            id: 'pending',
            icon: <FABIcons.Pending />,
            label: 'Show Pending',
            onClick: () => handleFilterChange('pending'),
            color: 'amber',
            badge: pendingToday > 0 ? pendingToday : undefined,
          },
          {
            id: 'refresh',
            icon: <FABIcons.Refresh />,
            label: 'Refresh Data',
            onClick: handleDataRefresh,
            color: 'purple',
          },
        ]}
        position="bottom-right"
        hideOnScroll={true}
        hideOnDesktop={true}
      />
    </div>
    </PullToRefresh>
    </VelocityBlurProvider>
    </SnapshotProvider>
    </CommandPaletteProvider>
    </SkeletonTransition>
  );
}
