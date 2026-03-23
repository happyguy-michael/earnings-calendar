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
import { FilterPulse } from '@/components/FilterPulse';
import { EarningsTooltipContent } from '@/components/Tooltip';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SwipeNavigator, SwipeHint } from '@/components/SwipeNavigator';
import { LiveBadge, LiveDot } from '@/components/LiveBadge';
import { CountdownBadge } from '@/components/Countdown';
import { FlipCountdownBadge } from '@/components/FlipDigit';
import { TimeSinceInline } from '@/components/TimeSince';
import { ProgressRing } from '@/components/ProgressRing';
import { OddsGauge } from '@/components/OddsGauge';
import { HeartbeatBadge, HeartbeatInline } from '@/components/ConfidenceHeartbeat';
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
import { BadgeShimmer } from '@/components/BadgeShimmer';
import { ResultPulseWrapper } from '@/components/ResultPulse';
import { GrainOverlay } from '@/components/GrainOverlay';
import { useToast } from '@/components/Toast';
import { ValueChangeHighlight } from '@/components/ValueChangeHighlight';
import { LegendIndicator, LegendProgressRing } from '@/components/LegendIndicator';
import { WeekIndicator } from '@/components/WeekIndicator';
import { ParallaxFloat } from '@/components/ParallaxFloat';
import { SessionDivider } from '@/components/SessionDivider';
import { MarketStatus } from '@/components/MarketStatus';
import { LiveMarketClock } from '@/components/LiveMarketClock';
import { TickerRibbon } from '@/components/TickerRibbon';
import { GradientDivider } from '@/components/GradientDivider';
import { AnimatedStatIcon } from '@/components/AnimatedStatIcon';
import { FreshBadge } from '@/components/FreshBadge';
import { DynamicTitle } from '@/components/DynamicTitle';
import { DynamicFavicon } from '@/components/DynamicFavicon';
import { BorderGlowSpot } from '@/components/BorderGlowSpot';
import { SurpriseMagnitudeCompact } from '@/components/SurpriseMagnitude';
import { ScrollProgress } from '@/components/ScrollProgress';
import { ImminentGlow } from '@/components/ImminentGlow';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';
import { BlueprintOverlay } from '@/components/BlueprintOverlay';
import { SurpriseCountUp, SurpriseScramble } from '@/components/AnimatedSurpriseBadge';
import { ScrambleTicker } from '@/components/TextScramble';
import { ExceptionalGlow, MonsterBeatIcon } from '@/components/ExceptionalGlow';
import { DisasterMiss, DisasterMissIcon } from '@/components/DisasterMiss';
import { SearchEmptyState } from '@/components/SearchEmptyState';
import { LiquidWaveProgressCompact } from '@/components/LiquidWaveProgress';
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
import { QuietWeekBanner } from '@/components/QuietWeekBanner';
import { MiniMonthCalendarPopover } from '@/components/MiniMonthCalendar';
import { TodayNarrative } from '@/components/TodayNarrative';
import { SessionProgressBar } from '@/components/SessionProgressBar';
import { DayStatsPopover } from '@/components/DayStatsPopover';
import { PriceMoveBadge } from '@/components/PriceMoveBadge';
import { SentimentPulse } from '@/components/SentimentPulse';
import { DayHeatIndicator } from '@/components/DayHeatIndicator';
import { QuickPeek } from '@/components/QuickPeek';
import { NextUpQueue } from '@/components/NextUpQueue';
import { GlassReflection } from '@/components/GlassReflection';
import { NumberJolt } from '@/components/NumberJolt';
import { AnimatedStatDelta } from '@/components/AnimatedStatDelta';
import { GlitchPending } from '@/components/GlitchText';
import { MarketMoodRing } from '@/components/MarketMoodRing';
import { DepthHover, DepthHoverContainer } from '@/components/DepthHover';
import { OrbitDot } from '@/components/OrbitDot';
import { FrostedHeader } from '@/components/EnhancedFrostedGlass';
import { VelocityBlurProvider, VelocityBlurCard } from '@/components/VelocityBlur';
import { ContextualCardActions } from '@/components/ContextualCardActions';
import { useUndoToast } from '@/components/UndoToast';
import { TodayDateIndicator } from '@/components/PulsingDateRing';
import { useKeyPressEcho, formatKeyName } from '@/components/KeyPressEcho';
import { WeekNavPreview, useWeekNavPreview } from '@/components/WeekNavPreview';
import { DayColumnProvider, DayHeaderHighlight, DayColumnCard } from '@/components/DayColumnHighlight';
import { TodayMarkerLine } from '@/components/TodayMarkerLine';
import { WavyUnderline } from '@/components/WavyUnderline';
import { DistributionBar } from '@/components/DistributionBar';
import { EarningsSeasonMeter } from '@/components/EarningsSeasonMeter';
import { ScrollAnchoredWeekBadge } from '@/components/ScrollAnchoredWeekBadge';
import { ScrollVelocityParticlesLight } from '@/components/ScrollVelocityParticles';
import { ScrollMinimap, useActiveWeekIndex } from '@/components/ScrollMinimap';
import { EarningsTimelineBar } from '@/components/EarningsTimelineBar';
import { SkeletonTransition } from '@/components/SkeletonTransition';
import { PrismBorder } from '@/components/PrismBorder';
import { AutoScrollToLive } from '@/components/AutoScrollToLive';
import { ProgressiveBlur } from '@/components/ProgressiveBlur';
import { CommandPaletteProvider, CommandTrigger } from '@/components/CommandPalette';
import { BlurReveal, BlurRevealGroup } from '@/components/BlurReveal';
import { CascadeReveal, CascadeItem } from '@/components/CascadeReveal';
import { CrystalCard, CrystalBadge } from '@/components/CrystalCard';
import { KonamiEasterEgg } from '@/components/KonamiEasterEgg';
import { SpinDigit, SpinInteger } from '@/components/SpinDigit';
import { SpotlightContainer, SpotlightCard } from '@/components/SpotlightHover';
import { CursorTrail, CursorTrailToggle, useCursorTrail } from '@/components/CursorTrail';
import { PrintStyles } from '@/components/PrintStyles';
import { RelativeDayBadge } from '@/components/RelativeDayBadge';
import { AmbientTimeGlow } from '@/components/AmbientTimeGlow';
import { StatBreakdownFromEarnings } from '@/components/StatBreakdownRing';
import { ElasticNumber, ElasticPercentage } from '@/components/ElasticNumber';
import { BreathingCard } from '@/components/BreathingCard';
import { ScrollPerspective } from '@/components/ScrollPerspective';
import { ChromeNumber } from '@/components/ChromeNumber';
import { FluidGradientText } from '@/components/FluidGradientText';
import { GradientWipe } from '@/components/GradientWipe';
import { OrganicWaveDivider } from '@/components/OrganicWaveDivider';
import { HolographicBorder } from '@/components/HolographicBorder';
import { EchoShadowHover } from '@/components/EchoShadowHover';
import { MomentumTiltProvider, MomentumTiltCard } from '@/components/MomentumTilt';
import { FocusSpotlight, FocusSpotlightGlobal } from '@/components/FocusSpotlight';
import { EdgeNavigationGlow } from '@/components/EdgeNavigationGlow';
import { DynamicShadow, useLightSource } from '@/components/DynamicShadow';
import { ClipWipeReveal, ClipWipeNumber } from '@/components/ClipWipeReveal';
import { WeightShiftText } from '@/components/WeightShiftText';
import { SeasonProgress, SeasonProgressBadge } from '@/components/SeasonProgress';
import { CheckmarkDraw, AnimatedX } from '@/components/CheckmarkDraw';
import { MagneticFieldProvider, MagneticCard } from '@/components/MagneticField';
import { GlowPing, NewResultPing, FreshDataPing, ImminentPing } from '@/components/GlowPing';
import { FoldingCard, PaperUnfold } from '@/components/PaperUnfold';
import { DataPulseRing } from '@/components/DataPulseRing';
import { IntensityGlow, IntensityText } from '@/components/IntensityGlow';
import { MonsterBeatConfetti } from '@/components/CelebrationConfetti';
import { MonsterBeatBorder, DisasterMissBorder } from '@/components/BorderDraw';
import { CountdownTension, useCountdownTension } from '@/components/CountdownTension';
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

// Helper to check if an earning is imminent (within threshold minutes)
function isEarningImminent(earning: Earning, thresholdMinutes = 15): boolean {
  if (earning.eps !== undefined && earning.eps !== null) return false; // Already reported
  
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Parse earning date
  const earningDate = new Date(earning.date);
  earningDate.setHours(0, 0, 0, 0);
  
  // Not today? Not imminent
  if (earningDate.getTime() !== today.getTime()) return false;
  
  // Parse time and calculate report datetime
  if (!earning.time) return false;
  
  const reportTime = new Date(earning.date);
  if (earning.time === 'pre') {
    // Pre-market / Before market open: ~9:30 AM ET = 9:30 AM
    reportTime.setHours(9, 30, 0, 0);
  } else if (earning.time === 'post') {
    // Post-market / After market close: ~4:00 PM ET
    reportTime.setHours(16, 0, 0, 0);
  } else {
    // Unknown time, assume not imminent
    return false;
  }
  
  const diffMs = reportTime.getTime() - now.getTime();
  const diffMinutes = diffMs / (1000 * 60);
  
  // Imminent if within threshold and not in the past (more than 30 min ago)
  return diffMinutes <= thresholdMinutes && diffMinutes >= -30;
}

// Helper to calculate minutes remaining until earnings report
function getMinutesUntilReport(earning: Earning): number {
  if (!earning.time) return 999; // Unknown time = far future
  
  const now = new Date();
  const reportTime = new Date(earning.date);
  
  if (earning.time === 'pre') {
    reportTime.setHours(9, 30, 0, 0);
  } else if (earning.time === 'post') {
    reportTime.setHours(16, 0, 0, 0);
  } else {
    return 999;
  }
  
  const diffMs = reportTime.getTime() - now.getTime();
  return diffMs / (1000 * 60);
}

function EarningsCard({ earning, isToday, animationIndex = 0 }: { earning: Earning; isToday?: boolean; animationIndex?: number }) {
  const hasResult = earning.eps !== undefined && earning.eps !== null;
  const isPending = !hasResult;
  const isTodayPending = isToday && isPending;
  const isImminent = isEarningImminent(earning);
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

  // Wrapper component - AnimatedGradientBorder for exceptional results, EchoShadowHover for pending
  // DynamicShadow for reported results (cursor-aware shadows from light source)
  // BorderDraw adds sequential "drawing" animation when exceptional cards come into view
  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (isMonsterBeat) {
      return (
        <MonsterBeatBorder surprise={surprise}>
          <DynamicShadow 
            elevation="high" 
            variant="success" 
            tintIntensity={0.25}
            hoverElevation="floating"
            borderRadius={14}
          >
            <HolographicBorder
              preset="beat"
              borderWidth={2}
              borderRadius={14}
              shimmer={true}
              shimmerIntensity={0.7}
              glowIntensity={0.4}
              glowSpread={24}
              sensitivity={1.2}
              smoothing={0.15}
            >
              {children}
            </HolographicBorder>
          </DynamicShadow>
        </MonsterBeatBorder>
      );
    }
    if (isDisasterMiss) {
      return (
        <DisasterMissBorder surprise={surprise}>
          <DynamicShadow 
            elevation="high" 
            variant="danger" 
            tintIntensity={0.2}
            hoverElevation="floating"
            borderRadius={14}
          >
            <HolographicBorder
              preset="miss"
              borderWidth={2}
              borderRadius={14}
              shimmer={true}
              shimmerIntensity={0.5}
              glowIntensity={0.35}
              glowSpread={20}
              sensitivity={1.0}
              smoothing={0.12}
            >
              {children}
            </HolographicBorder>
          </DynamicShadow>
        </DisasterMissBorder>
      );
    }
    // Pending cards get subtle echo shadow effect on hover
    if (isPending) {
      return (
        <EchoShadowHover
          layers={3}
          maxOffset={5}
          direction="diagonal"
          stagger={35}
          duration={300}
          glow={isTodayPending}
          glowColor="rgba(59, 130, 246, 0.15)"
          className="pending-echo-wrapper"
        >
          {children}
        </EchoShadowHover>
      );
    }
    // Regular reported cards get subtle dynamic shadow
    if (hasResult) {
      return (
        <DynamicShadow 
          elevation="medium" 
          variant={earning.result === 'beat' ? 'success' : 'danger'}
          tintIntensity={0.15}
          hoverElevation="high"
          borderRadius={14}
        >
          {children}
        </DynamicShadow>
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
      <div 
        className="earnings-card-wrapper"
        data-imminent={isImminent ? 'true' : undefined}
      >
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
          <FocusSpotlight 
            borderRadius={14} 
            variant={hasResult ? (earning.result === 'beat' ? 'success' : 'danger') : 'default'}
            glowRadius={16}
            pulseOnFocus={true}
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

        {/* Countdown timer for today's pending earnings - flip digit style with escalating tension */}
        {isTodayPending && (
          <CountdownTension
            minutesRemaining={getMinutesUntilReport(earning)}
            enableShake={true}
            enableGlow={true}
            enablePulseBorder={true}
            borderRadius={8}
          >
            <ImminentPing
              isImminent={isImminent}
              urgency={isImminent ? 'high' : 'low'}
              borderRadius={8}
            >
              <FlipCountdownBadge targetDate={new Date(earning.date)} time={earning.time} />
            </ImminentPing>
          </CountdownTension>
        )}

        {hasResult ? (
          <NewResultPing
            isNew={isToday}
            result={earning.result}
            count={3}
            delay={animationIndex * 100 + 500}
            dotSize={8}
          >
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
              <MonsterBeatConfetti
                ticker={earning.ticker}
                surprise={surprise}
                duration={2500}
              >
              <DataPulseRing 
                trigger={earning.eps} 
                variant="success" 
                ringCount={2} 
                duration={700}
                pulseOnMount
                scale={1.8}
              >
              <ResultPulseWrapper result="beat" surprise={surprise}>
                <ExceptionalGlow surprise={surprise} delay={animationIndex * 50 + 300}>
                  <BadgeShimmer 
                    variant="success" 
                    trigger="both" 
                    interval={5000} 
                    delay={animationIndex * 100 + 800}
                    duration={700}
                    intensity={0.8}
                  >
                    <BadgeSparkle active={true} particleCount={6}>
                      <span className="badge badge-beat">
                        <CheckmarkDraw 
                          size={14} 
                          variant="success" 
                          delay={animationIndex * 50 + 150}
                          duration={350}
                          animateInView
                          glow={surprise >= 10}
                        />
                        <MonsterBeatIcon surprise={surprise} />
                        {/* Use scramble effect for monster beats (≥15%), count-up for others */}
                        {/* Gold chrome effect for exceptional beats (Y3K liquid metal aesthetic) */}
                        {surprise >= 15 ? (
                          <ChromeNumber variant="gold" trigger="both" interval={4000} emboss>
                            <SurpriseScramble 
                              value={surprise} 
                              delay={animationIndex * 50 + 200} 
                              duration={600}
                              glowColor="#22c55e"
                            />
                          </ChromeNumber>
                        ) : (
                          <SurpriseCountUp value={surprise} delay={animationIndex * 50 + 200} duration={500} />
                        )}
                      </span>
                    </BadgeSparkle>
                  </BadgeShimmer>
                </ExceptionalGlow>
              </ResultPulseWrapper>
              </DataPulseRing>
              </MonsterBeatConfetti>
            ) : (
              <DataPulseRing 
                trigger={earning.eps} 
                variant="error" 
                ringCount={2} 
                duration={700}
                pulseOnMount
                scale={1.8}
              >
              <ResultPulseWrapper result="miss" surprise={surprise}>
                <DisasterMiss surprise={surprise} delay={animationIndex * 50 + 300}>
                  <BadgeShimmer 
                    variant="danger" 
                    trigger="hover" 
                    duration={600}
                    intensity={0.7}
                  >
                    <span className="badge badge-miss">
                      <AnimatedX 
                        size={14} 
                        delay={animationIndex * 50 + 150}
                        duration={280}
                        animateInView
                        glow={surprise <= -10}
                      />
                      <DisasterMissIcon surprise={surprise} />
                      {/* Use scramble effect for disaster misses (≤-15%), count-up for others */}
                      {/* Rose-gold chrome effect for disaster misses (Y3K liquid metal aesthetic) */}
                      {surprise <= -15 ? (
                        <ChromeNumber variant="rose-gold" trigger="both" interval={4000} emboss>
                          <SurpriseScramble 
                            value={surprise} 
                            delay={animationIndex * 50 + 200} 
                            duration={600}
                            glowColor="#ef4444"
                          />
                        </ChromeNumber>
                      ) : (
                        <SurpriseCountUp value={surprise} delay={animationIndex * 50 + 200} duration={500} />
                      )}
                    </span>
                  </BadgeShimmer>
                </DisasterMiss>
              </ResultPulseWrapper>
              </DataPulseRing>
            )}
            {/* Post-earnings price movement - shows how stock moved after report */}
            {earning.priceMove !== undefined && (
              <PriceMoveBadge 
                priceMove={earning.priceMove} 
                size="sm"
                delay={animationIndex * 50 + 250}
              />
            )}
          </div>
          </NewResultPing>
        ) : earning.beatOdds ? (
          <IntensityGlow
            value={earning.beatOdds}
            maxValue={100}
            variant={earning.beatOdds >= 60 ? 'success' : earning.beatOdds >= 40 ? 'warning' : 'danger'}
            pulse={earning.beatOdds >= 70}
            sparkles={earning.beatOdds >= 85}
            sparkleCount={3}
            blurRadius={10}
            spreadRadius={2}
            borderRadius={9999}
            minIntensity={0.1}
            maxIntensity={0.7}
          >
            <HeartbeatBadge 
              probability={earning.beatOdds} 
              size="md"
            />
          </IntensityGlow>
        ) : null}
        </Link>
        </FocusSpotlight>
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

  // Calculate earnings grouped by date for mini calendar heat-map
  const earningsByDay = useMemo(() => {
    const map = new Map<string, { count: number; beats: number; misses: number; pending: number }>();
    
    earnings.forEach(e => {
      const existing = map.get(e.date) || { count: 0, beats: 0, misses: 0, pending: 0 };
      existing.count++;
      if (e.result === 'beat') existing.beats++;
      else if (e.result === 'miss') existing.misses++;
      else existing.pending++;
      map.set(e.date, existing);
    });
    
    return Array.from(map.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));
  }, []);

  // Handle mini calendar day click - navigate to that week
  const handleCalendarDayClick = useCallback((date: Date) => {
    setCurrentWeekStart(getWeekStart(date));
    haptic('select');
    showToast(`Jumped to week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`, { type: 'info', icon: '📅', duration: 2000 });
  }, [haptic, showToast]);

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
    <MomentumTiltProvider maxTilt={3} minScale={0.985} threshold={0.4} sensitivity={1.2}>
    <PullToRefresh onRefresh={handlePullRefresh} threshold={80} color="#3b82f6">
    <div className="min-h-screen relative">
      {/* Snapshot mode indicator (when paused) */}
      <SnapshotIndicator />
      
      {/* Scroll progress indicator */}
      <ScrollProgress height={3} hideAtTop={true} showGlow={true} />
      
      {/* Liquid wave loading indicator - shows during data refresh */}
      {isRefreshing && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <LiquidWaveProgressCompact color="blue" />
        </div>
      )}
      
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
      
      {/* Auto-scroll to imminent/live earnings */}
      <AutoScrollToLive
        selector='[data-imminent="true"]'
        threshold={15}
        showButton={true}
        cooldown={60000}
        topOffset={140}
        buttonPosition="bottom-right"
        buttonLabel="Jump to Live"
        oncePerSession={false}
      />
      
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
      
      {/* Blueprint overlay - 2026 raw aesthetics trend */}
      <BlueprintOverlay
        majorGrid={160}
        minorGrid={40}
        showTicks={true}
        showCrosshairs={true}
        showDimensions={false}
        majorOpacity={0.04}
        minorOpacity={0.015}
        animateIn={true}
        zIndex={1}
      />
      
      {/* Ambient time-of-day lighting - subtle organic color shift */}
      <AmbientTimeGlow 
        intensity={0.8}
        breathing={true}
        breathingDuration={10000}
      />
      
      {/* Floating background particles */}
      <FloatingParticles count={35} speed={0.25} maxSize={3} minSize={1} />
      
      {/* Scroll velocity particles - kinetic ambiance responds to scroll momentum */}
      <ScrollVelocityParticlesLight />
      
      {/* Premium grain texture overlay */}
      <GrainOverlay opacity={0.025} animate={true} blendMode="overlay" />
      
      {/* Premium keyboard focus styles for accessibility */}
      <FocusSpotlightGlobal />
      
      {/* Keyboard shortcuts overlay */}
      <KeyboardShortcutsOverlay />
      
      {/* Edge navigation glow - visual hint for week navigation on viewport edges */}
      <EdgeNavigationGlow
        onLeftHover={() => navigateWeek(-1)}
        onRightHover={() => navigateWeek(1)}
        edgeWidth={80}
        intensity={0.35}
        leftColor="rgba(168, 85, 247, 0.4)"
        rightColor="rgba(59, 130, 246, 0.4)"
        pulse={true}
        pulseDuration={2500}
        showArrows={true}
        hoverDelay={1000}
        canGoLeft={true}
        canGoRight={true}
      />
      
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
                  <GradientWipe 
                    direction="right" 
                    duration={900} 
                    delay={200}
                    shimmer={true}
                    shimmerColor="rgba(139, 92, 246, 0.4)"
                  >
                    Earnings{' '}
                    <FluidGradientText 
                      preset="aurora" 
                      speed={0.5}
                      shimmer={true}
                      shimmerIntensity={0.25}
                      pauseOnHover={false}
                      hoverSpeed={2}
                    >
                      Calendar
                    </FluidGradientText>
                  </GradientWipe>
                </h1>
                <MarketStatus />
                <LiveMarketClock compact showTimezone />
                <div className="hidden lg:flex items-center gap-2">
                  <SeasonProgress earnings={earnings} delay={200} />
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
                <MiniMonthCalendarPopover
                  earningsData={earningsByDay}
                  currentDate={currentWeekStart}
                  onDayClick={handleCalendarDayClick}
                  compact={true}
                  position="bottom-left"
                  trigger={
                    <span className="mini-calendar-trigger">
                      <FlipMonth 
                        month={months[currentWeekStart.getMonth()]} 
                        year={currentWeekStart.getFullYear()} 
                      />
                      <svg 
                        className="mini-calendar-icon" 
                        width="12" 
                        height="12" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </span>
                  }
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
                    inkEffect
                    inkVariant="accent"
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
                    inkEffect
                    inkVariant="accent"
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
            <FilterPulse activeFilter={statusFilter} duration={650} maxScale={3.5}>
              <FilterChips 
                value={statusFilter}
                onChange={handleFilterChange}
                counts={filterCounts}
              />
            </FilterPulse>
          </div>
        </div>
        
        {/* Progressive blur creates Apple-style depth effect for scrolling content */}
        <ProgressiveBlur 
          direction="down"
          height={isScrolled ? 80 : 50}
          layers={6}
          maxBlur={isScrolled ? 28 : 16}
          showFadeGradient={true}
        />
      </FrostedHeader>

      {/* Gradient divider - animated accent line below header */}
      <GradientDivider 
        preset="aurora" 
        speed="slow" 
        glow 
        glowIntensity={0.35}
        height={2}
        fadeEdges={true}
      />

      {/* Ticker Ribbon - scrolling earnings tape */}
      <TickerRibbon earnings={earnings} speed={35} />

      {/* Session Progress Bar - visual timeline of trading day */}
      <div className="max-w-4xl mx-auto px-6 mt-4">
        <SessionProgressBar showLabels={true} compact={false} />
      </div>

      <ScrollPerspective 
        maxAngle={1.8} 
        scrollDistance={600} 
        perspective={1400} 
        smoothing={0.08}
      >
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
                    {/* Status breakdown ring - shows beat/miss/pending distribution */}
                    <div className="relative">
                      <AnimatedStatIcon type="total" size={28} />
                      <div className="absolute -bottom-1 -right-1">
                        <StatBreakdownFromEarnings
                          earnings={filteredEarnings}
                          type="status"
                          size={24}
                          strokeWidth={3}
                          delay={300}
                          onFilter={handleFilterChange}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">
                        <AnimatedStatDelta value={totalEarnings} position="top-right" glow flyDistance={24} duration={700}>
                          <NumberJolt value={totalEarnings} intensity={3} duration={350}>
                            <ValueChangeHighlight value={totalEarnings} variant="default">
                              <ElasticNumber value={totalEarnings} spring="snappy" animateOnMount />
                            </ValueChangeHighlight>
                          </NumberJolt>
                        </AnimatedStatDelta>
                      </div>
                      <WeightShiftText variant="subtle" trigger="hover" className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Total Reports</WeightShiftText>
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
                        <IntensityGlow
                          value={beatRate}
                          maxValue={100}
                          variant="success"
                          pulse={beatRate >= 60}
                          sparkles={beatRate >= 80}
                          sparkleCount={4}
                          ring={beatRate >= 90}
                          blurRadius={16}
                          spreadRadius={3}
                          borderRadius={12}
                          minIntensity={0.15}
                          maxIntensity={0.85}
                        >
                          <AnimatedStatDelta value={beatRate} position="top-right" glow flyDistance={28} duration={750} suffix="%">
                            <NumberJolt value={beatRate} intensity={4} duration={400} directional>
                              <ValueChangeHighlight value={beatRate} variant="success">
                                <IntensityText value={beatRate} maxValue={100} variant="success" glow>
                                  <ElasticPercentage value={beatRate} animateOnMount className="elastic-success" />
                                </IntensityText>
                              </ValueChangeHighlight>
                            </NumberJolt>
                          </AnimatedStatDelta>
                        </IntensityGlow>
                      </div>
                      <WeightShiftText variant="subtle" trigger="hover" className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Beat Rate</WeightShiftText>
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
                    {/* Session breakdown ring - shows pre-market vs after-hours split */}
                    <div className="relative">
                      <AnimatedStatIcon type="reported" size={28} />
                      <div className="absolute -bottom-1 -right-1">
                        <StatBreakdownFromEarnings
                          earnings={filteredEarnings.filter(e => e.eps !== undefined && e.eps !== null)}
                          type="session"
                          size={24}
                          strokeWidth={3}
                          delay={500}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">
                        <AnimatedStatDelta value={reportedCount} position="top-right" glow flyDistance={24} duration={700}>
                          <NumberJolt value={reportedCount} intensity={3} duration={350}>
                            <ValueChangeHighlight value={reportedCount} variant="default">
                              <SpinInteger value={reportedCount} duration={700} stagger={60} animateOnMount />
                            </ValueChangeHighlight>
                          </NumberJolt>
                        </AnimatedStatDelta>
                      </div>
                      <WeightShiftText variant="subtle" trigger="hover" className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Reported</WeightShiftText>
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
                        <AnimatedStatDelta value={pendingCount} position="top-right" glow flyDistance={24} duration={700} reverseColors>
                          <NumberJolt value={pendingCount} intensity={3} duration={350}>
                            <ValueChangeHighlight value={pendingCount} variant="warning">
                              <GlitchPending value={pendingCount} />
                            </ValueChangeHighlight>
                          </NumberJolt>
                        </AnimatedStatDelta>
                      </div>
                      <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium flex items-center gap-1.5">
                        <WeightShiftText variant="subtle" trigger="hover">Pending</WeightShiftText>
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

        {/* Earnings Season Meter - Progress through earnings season */}
        <div className="mb-6 px-1">
          <BlurReveal triggerOnMount delay={300} duration={600} blurAmount={8}>
            <EarningsSeasonMeter
              earnings={filteredEarnings}
              variant="horizontal"
              size="md"
              showBreakdown={true}
              showPercentage={true}
              showCount={true}
              liquidEffect={true}
              glowOnSuccess={true}
              delay={400}
            />
          </BlurReveal>
        </div>

        {/* Distribution Bar - Visual breakdown of beats/misses/pending */}
        <div className="mb-6 px-1">
          <DistributionBar
            beats={filterCounts.beat}
            misses={filterCounts.miss}
            pending={filterCounts.pending}
            height={8}
            borderRadius={4}
            showTooltips={true}
            animated={true}
            delay={400}
            duration={900}
            onSegmentClick={(segment) => handleFilterChange(segment)}
          />
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

        {/* Organic Wave Divider - liquid transition to calendar section */}
        <OrganicWaveDivider 
          preset="aurora" 
          height={50} 
          layers={2} 
          speed={0.8}
          glow={true}
          glowIntensity={0.3}
          complexity={1.2}
        />

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
                          <TodayDateIndicator 
                            isToday={isToday} 
                            variant="ripple" 
                            delay={weekIndex * 100 + dayIndex * 50}
                          >
                            <div className="day-num">{date.getDate()}</div>
                          </TodayDateIndicator>
                          {/* Relative day badge - human-readable context */}
                          <RelativeDayBadge 
                            date={date} 
                            size="xs" 
                            compact={true}
                            delay={weekIndex * 80 + dayIndex * 30}
                            className="mt-1"
                          />
                          {dayEarnings.length > 0 && (
                            <div className="badge badge-neutral mt-1.5 text-[10px] py-1 px-2">
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
              <MagneticFieldProvider
                fieldRadius={250}
                fieldStrength={0.08}
                springStiffness={180}
                springDamping={20}
                mode="attract"
              >
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
                  const totalWeekEarnings = weekDayData.reduce((sum, d) => sum + d.count, 0);
                  
                  // Show QuietWeekBanner if entire week is empty
                  if (totalWeekEarnings === 0) {
                    return (
                      <div className="col-span-5">
                        <QuietWeekBanner
                          weekStart={weekStart}
                          allEarnings={earnings}
                          onJumpToWeek={(targetWeek) => {
                            setCurrentWeekStart(targetWeek);
                            haptic('select');
                            showToast('Jumped to busy week', { type: 'success', icon: '📅', duration: 2000 });
                          }}
                        />
                      </div>
                    );
                  }
                  
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
                            {/* Timeline bar showing when earnings release throughout the day */}
                            <EarningsTimelineBar 
                              earnings={[...preMarket, ...postMarket]}
                              isToday={isToday}
                              compact
                            />
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
                                      <MomentumTiltCard intensity={0.7} dynamicShadow>
                                      <VelocityBlurCard staggerIndex={i}>
                                        <MagneticCard strength={0.1} rotate maxRotation={2} layer={1}>
                                          <EarningsCard earning={e} isToday={isToday} animationIndex={i} />
                                        </MagneticCard>
                                      </VelocityBlurCard>
                                      </MomentumTiltCard>
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
                                      <MomentumTiltCard intensity={0.7} dynamicShadow>
                                      <VelocityBlurCard staggerIndex={preMarket.length + i}>
                                        <MagneticCard strength={0.1} rotate maxRotation={2} layer={1}>
                                          <EarningsCard earning={e} isToday={isToday} animationIndex={preMarket.length + i} />
                                        </MagneticCard>
                                      </VelocityBlurCard>
                                      </MomentumTiltCard>
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
              </MagneticFieldProvider>
              
              {/* Week Summary Card - celebratory end-of-week recap with paper fold effect */}
              <PaperUnfold
                delay={weekIndex * 150 + 200}
                duration={700}
                direction="down"
                maxAngle={75}
                perspective={1400}
                threshold={0.2}
                showBackface={true}
                backfaceOpacity={0.9}
                creaseShadow={0.25}
              >
                <FoldingCard
                  corner="bottom-right"
                  peekAngle={18}
                  duration={350}
                  shadow={true}
                >
                  <PrismBorder 
                    borderRadius={20} 
                    intensity="subtle" 
                    mode="cursor" 
                    hoverOnly={true}
                    blur={10}
                  >
                    <WeekSummaryCard 
                      weekStart={weekStart} 
                      earnings={filteredEarnings}
                      isCurrentWeek={weekIndex === todayWeekIndex}
                    />
                  </PrismBorder>
                </FoldingCard>
              </PaperUnfold>
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
              <WavyUnderline 
                color="success" 
                animated="hover" 
                amplitude={2} 
                frequency={4}
                strokeWidth={1.5}
              >
                Beat Estimates
              </WavyUnderline>
            </div>,
            <div key="miss" className="flex items-center gap-2">
              <LegendIndicator type="miss" size={12} />
              <WavyUnderline 
                color="danger" 
                animated="hover" 
                amplitude={2} 
                frequency={4}
                strokeWidth={1.5}
              >
                Missed Estimates
              </WavyUnderline>
            </div>,
            <div key="odds" className="flex items-center gap-2">
              <LegendProgressRing value={75} size={14} color="#f59e0b" />
              <WavyUnderline 
                color="warning" 
                animated="hover" 
                amplitude={2} 
                frequency={4}
                strokeWidth={1.5}
              >
                <span className="ml-1">Beat Probability</span>
              </WavyUnderline>
            </div>
          ]}
        </BlurRevealGroup>
      </main>
      </ScrollPerspective>

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
    </MomentumTiltProvider>
    </VelocityBlurProvider>
    </SnapshotProvider>
    </CommandPaletteProvider>
    </SkeletonTransition>
  );
}
