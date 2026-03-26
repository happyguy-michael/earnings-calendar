'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getEarning, getAnalysis, getBeatStreak, earnings } from '@/lib/data';
import { EPSChart, EPSBarChart } from '@/components/EPSChart';
import { EPSTrendSparkline } from '@/components/AnimatedSparkline';
import { CountUp } from '@/components/CountUp';
import { SkeletonDetailPage } from '@/components/Skeleton';
import { LiveBadge } from '@/components/LiveBadge';
import { TimeSinceBadge } from '@/components/TimeSince';
import { Confetti, Sparkles } from '@/components/Confetti';
import { TypewriterParagraphs, TypingIndicator, SkipButton } from '@/components/Typewriter';
import { AnimatedTabs, Tab } from '@/components/AnimatedTabs';
import { ReadingProgress } from '@/components/ReadingProgress';
import { ScrollReveal, StaggeredReveal, RevealTableBody } from '@/components/ScrollReveal';
import { ShareMenu } from '@/components/ShareMenu';
import { BeatStreak } from '@/components/BeatStreak';
import { AnimatedBadgeIcon } from '@/components/AnimatedResultIcon';
import { CopyTicker } from '@/components/CopyTicker';
import { StampReveal } from '@/components/StampReveal';
import { BrokerCTA, BrokerCTAGroup } from '@/components/BrokerCTA';
import { AlsoReporting } from '@/components/AlsoReporting';
import { GlassReflection } from '@/components/GlassReflection';
import { CursorGlowCard } from '@/components/CursorGlowBorder';
import { BreathingCard } from '@/components/BreathingCard';
import { ParallaxFloat } from '@/components/ParallaxFloat';
import { SurpriseThermometer, SurpriseThermometerHorizontal, SurpriseTemperatureBadge } from '@/components/SurpriseThermometer';
import { SurpriseGrade } from '@/components/SurpriseGrade';
import { WatchlistButton } from '@/components/Watchlist';

// Progress Ring Component
function ProgressRing({ percent, size = 120, strokeWidth = 8, color = '#10b981' }: { 
  percent: number; size?: number; strokeWidth?: number; color?: string 
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;
  
  return (
    <svg width={size} height={size} className="progress-ring">
      <circle
        stroke="rgba(255,255,255,0.1)"
        fill="none"
        strokeWidth={strokeWidth}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        stroke={color}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        r={radius}
        cx={size / 2}
        cy={size / 2}
        style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
      />
    </svg>
  );
}

export default function ReportPage() {
  const params = useParams();
  const ticker = (params.ticker as string).toUpperCase();
  const earning = getEarning(ticker);
  const analysis = getAnalysis(ticker);
  const [activeTab, setActiveTab] = useState('overview');
  const [countdown, setCountdown] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isTypingAnalysis, setIsTypingAnalysis] = useState(true);
  const [hasViewedAnalysis, setHasViewedAnalysis] = useState(false);
  const [skippedTypewriter, setSkippedTypewriter] = useState(false);
  const analysisContentRef = useRef<HTMLDivElement>(null);

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, [ticker]);
  
  // Trigger celebration for beat results after loading
  useEffect(() => {
    if (!isLoading && earning?.result === 'beat') {
      // Small delay for dramatic effect
      const timer = setTimeout(() => setShowCelebration(true), 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading, earning?.result]);

  // Track first view of analysis tab for typewriter effect
  useEffect(() => {
    if (activeTab === 'analysis' && !hasViewedAnalysis && analysis) {
      setHasViewedAnalysis(true);
      setIsTypingAnalysis(true);
    }
  }, [activeTab, hasViewedAnalysis, analysis]);

  // Skip typewriter and show full text
  const handleSkipTypewriter = () => {
    setSkippedTypewriter(true);
    setIsTypingAnalysis(false);
  };

  const historicalData = [
    { quarter: 'Q4 2025', eps: earning?.eps || earning?.estimate || 0, estimate: earning?.estimate || 0, beat: earning?.result === 'beat' },
    { quarter: 'Q3 2025', eps: (earning?.estimate || 1) * 0.92, estimate: (earning?.estimate || 1) * 0.89, beat: true },
    { quarter: 'Q2 2025', eps: (earning?.estimate || 1) * 0.85, estimate: (earning?.estimate || 1) * 0.87, beat: false },
    { quarter: 'Q1 2025', eps: (earning?.estimate || 1) * 0.78, estimate: (earning?.estimate || 1) * 0.76, beat: true },
    { quarter: 'Q4 2024', eps: (earning?.estimate || 1) * 0.72, estimate: (earning?.estimate || 1) * 0.70, beat: true },
  ];

  useEffect(() => {
    if (!earning || earning.eps !== undefined) return;
    const updateCountdown = () => {
      const target = new Date(earning.date);
      target.setHours(earning.time === 'pre' ? 9 : 16, earning.time === 'pre' ? 30 : 0, 0);
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setCountdown('Reporting soon...'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setCountdown(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m`);
    };
    updateCountdown();
    const i = setInterval(updateCountdown, 60000);
    return () => clearInterval(i);
  }, [earning]);

  if (isLoading) {
    return <SkeletonDetailPage />;
  }

  if (!earning) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center glass-card p-12">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-zinc-400 mb-6">Ticker not found: {ticker}</p>
          <Link href="/" className="badge badge-neutral">← Back to Calendar</Link>
        </div>
      </div>
    );
  }

  const hasResult = earning.eps !== undefined && earning.eps !== null;
  const logoUrl = `https://logo.clearbit.com/${earning.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
  const surprise = hasResult ? ((earning.eps! - earning.estimate) / Math.abs(earning.estimate)) * 100 : 0;
  const mockPrice = (earning.estimate * 45 + Math.random() * 20).toFixed(2);
  const mockChange = (Math.random() * 6 - 2).toFixed(2);

  const tabs: Tab[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'analysis', label: 'AI Analysis', icon: '🤖' },
    { id: 'history', label: 'History', icon: '📈' },
  ];

  return (
    <div className="min-h-screen">
      {/* Celebration effects for beat results */}
      <Confetti trigger={showCelebration} particleCount={60} duration={2500} />
      <Sparkles trigger={showCelebration} count={8} />
      
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-black/50 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-smooth text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Calendar
          </Link>
          <div className="flex items-center gap-2">
            <WatchlistButton 
              ticker={ticker} 
              company={earning.company} 
              variant="pill" 
              size="sm"
            />
            <ShareMenu 
              ticker={ticker}
              company={earning.company}
              result={earning.result}
              surprise={surprise}
            />
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-start gap-8">
            {/* Logo & Title */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center overflow-hidden border border-white/10">
                <img src={logoUrl} alt={ticker} className="w-full h-full object-contain p-3"
                  onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                <span className="hidden text-2xl font-bold text-zinc-500">{ticker}</span>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-4xl font-bold text-white">{ticker}</h1>
                  <CopyTicker ticker={ticker} size="md" />
                  {hasResult ? (
                    <StampReveal 
                      variant={earning.result === 'beat' ? 'beat' : 'miss'} 
                      delay={400}
                      showParticles={true}
                    >
                      <span className={`badge ${earning.result === 'beat' ? 'badge-success' : 'badge-danger'}`}>
                        <AnimatedBadgeIcon result={earning.result as 'beat' | 'miss'} size="sm" />
                        {earning.result === 'beat' ? 'Beat' : 'Miss'}
                      </span>
                    </StampReveal>
                  ) : (
                    <span className="badge badge-warning">⏳ Pending</span>
                  )}
                  <BeatStreak streak={getBeatStreak(ticker)} size="md" showLabel={true} />
                  {hasResult && (
                    <SurpriseGrade 
                      surprise={surprise} 
                      size="md" 
                      showLabel={true}
                      delay={500}
                    />
                  )}
                </div>
                <p className="text-zinc-400 text-lg">{earning.company}</p>
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Price Card - with premium glass effects */}
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
                  borderRadius={16}
                >
                  <CursorGlowCard 
                    variant="default" 
                    borderRadius={16} 
                    intensity={0.5} 
                    glowRadius={180}
                  >
                    <div className="glass-card p-5 min-w-[200px]">
                      <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Stock Price</div>
                      <div className="text-3xl font-bold text-white">${mockPrice}</div>
                      <div className={`text-sm font-medium ${parseFloat(mockChange) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {parseFloat(mockChange) >= 0 ? '+' : ''}{mockChange} ({parseFloat(mockChange) >= 0 ? '+' : ''}{(parseFloat(mockChange) / parseFloat(mockPrice) * 100).toFixed(2)}%)
                      </div>
                    </div>
                  </CursorGlowCard>
                </GlassReflection>
              </ParallaxFloat>
            </BreathingCard>

            {/* Report Info Card - with premium glass effects */}
            <BreathingCard duration={5500} phase={0.25} amplitude={0.007} breatheShadow={true} breatheGlow={!hasResult} glowColor="rgba(251, 191, 36, 0.2)">
              <ParallaxFloat intensity={0.045} delay={50}>
                <GlassReflection 
                  mode="auto" 
                  interval={10000} 
                  delay={2500} 
                  duration={900}
                  beamWidth={100}
                  angle={-18}
                  color={!hasResult ? "rgba(251, 191, 36, 0.4)" : "white"}
                  intensity={0.35}
                  blur={50}
                  borderRadius={16}
                >
                  <CursorGlowCard 
                    variant={!hasResult ? "warning" : "default"} 
                    borderRadius={16} 
                    intensity={0.5} 
                    glowRadius={180}
                  >
                    <div className="glass-card p-5 min-w-[200px]">
                      <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Report Date</div>
                      <div className="text-xl font-semibold text-white">{earning.date}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-zinc-400">{earning.time === 'pre' ? '☀️ Pre-Market' : '🌙 After Hours'}</span>
                        <LiveBadge 
                          time={earning.time} 
                          isToday={earning.date === new Date().toISOString().split('T')[0]} 
                          isPending={!hasResult} 
                        />
                      </div>
                      {!hasResult && countdown && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <div className="text-2xl font-bold text-amber-400">{countdown}</div>
                        </div>
                      )}
                      {/* Show time since for reported earnings */}
                      {hasResult && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <TimeSinceBadge reportedAt={new Date(earning.date)} time={earning.time} />
                        </div>
                      )}
                    </div>
                  </CursorGlowCard>
                </GlassReflection>
              </ParallaxFloat>
            </BreathingCard>
          </div>
        </div>
      </div>

      {/* Tabs with animated sliding indicator */}
      <div className="border-b border-white/5 sticky top-[57px] z-10 backdrop-blur-xl bg-black/50">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedTabs 
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* EPS Result Card - with premium glass reflection */}
              <GlassReflection 
                mode="auto" 
                interval={12000} 
                delay={1000} 
                duration={1000}
                beamWidth={120}
                angle={-15}
                color={hasResult ? (earning.result === 'beat' ? "rgba(34, 197, 94, 0.5)" : "rgba(239, 68, 68, 0.5)") : "white"}
                intensity={0.4}
                blur={60}
                borderRadius={24}
              >
              <div className="glass-card p-8">
                <h2 className="text-lg font-semibold text-white mb-6">Earnings Per Share</h2>
                
                <div className="grid grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
                      {hasResult ? 'Actual' : 'Estimate'}
                    </div>
                    <div className="text-5xl font-bold text-white">
                      $<CountUp 
                        end={hasResult ? earning.eps! : earning.estimate} 
                        duration={1000} 
                        decimals={2} 
                      />
                    </div>
                  </div>
                  
                  {hasResult ? (
                    <>
                      <div className="text-center">
                        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Estimate</div>
                        <div className="text-5xl font-bold text-zinc-600">
                          $<CountUp end={earning.estimate} duration={1000} decimals={2} />
                        </div>
                      </div>
                      <div className="text-center flex flex-col items-center">
                        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Surprise</div>
                        <div className="flex items-center gap-4">
                          <SurpriseThermometer 
                            surprise={surprise} 
                            height={72} 
                            showLabel={false}
                            delay={400}
                            duration={1000}
                          />
                          <div className={`text-5xl font-bold ${surprise >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            <CountUp 
                              end={surprise} 
                              duration={1200} 
                              decimals={1}
                              prefix={surprise >= 0 ? '+' : ''}
                              suffix="%" 
                            />
                          </div>
                          <SurpriseTemperatureBadge surprise={surprise} size={28} />
                        </div>
                        {/* Horizontal thermometer bar below */}
                        <div className="mt-3 w-full max-w-[160px]">
                          <SurpriseThermometerHorizontal 
                            surprise={surprise} 
                            width={160} 
                            height={10}
                            delay={600}
                          />
                        </div>
                      </div>
                    </>
                  ) : earning.beatOdds && (
                    <>
                      <div className="flex flex-col items-center justify-center">
                        <ProgressRing 
                          percent={earning.beatOdds} 
                          size={100} 
                          strokeWidth={8}
                          color={earning.beatOdds >= 70 ? '#10b981' : earning.beatOdds >= 50 ? '#f59e0b' : '#ef4444'}
                        />
                      </div>
                      <div className="text-center flex flex-col justify-center">
                        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Beat Odds</div>
                        <div className={`text-5xl font-bold ${
                          earning.beatOdds >= 70 ? 'text-emerald-400' : earning.beatOdds >= 50 ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          <CountUp end={earning.beatOdds} duration={1000} suffix="%" />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Visual bar comparison - polished */}
                {hasResult && (
                  <div className="mt-10 pt-8 border-t border-white/5">
                    <div className="flex items-end justify-center gap-12 h-44">
                      {/* Estimate bar */}
                      <div className="flex flex-col items-center group">
                        <div className="relative">
                          <div 
                            className="w-20 rounded-xl bg-gradient-to-t from-zinc-700 to-zinc-500 transition-all duration-500 group-hover:from-zinc-600 group-hover:to-zinc-400"
                            style={{ 
                              height: `${Math.min(120, Math.max(40, (earning.estimate / (earning.eps || 1)) * 100))}px`,
                              boxShadow: '0 0 20px rgba(113, 113, 122, 0.2)'
                            }}
                          />
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-zinc-800 px-3 py-1.5 rounded-lg text-sm text-zinc-300 whitespace-nowrap border border-zinc-700 shadow-xl">
                            ${earning.estimate.toFixed(2)}
                          </div>
                        </div>
                        <div className="mt-4 text-center">
                          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Estimate</div>
                          <div className="text-lg font-bold text-zinc-400">${earning.estimate.toFixed(2)}</div>
                        </div>
                      </div>
                      
                      {/* Actual bar */}
                      <div className="flex flex-col items-center group">
                        <div className="relative">
                          <div 
                            className={`w-20 rounded-xl transition-all duration-500 ${
                              earning.result === 'beat' 
                                ? 'bg-gradient-to-t from-emerald-600 to-emerald-400' 
                                : 'bg-gradient-to-t from-red-600 to-red-400'
                            }`}
                            style={{ 
                              height: '100px',
                              boxShadow: earning.result === 'beat' 
                                ? '0 0 30px rgba(34, 197, 94, 0.4), 0 0 60px rgba(34, 197, 94, 0.2)' 
                                : '0 0 30px rgba(239, 68, 68, 0.4), 0 0 60px rgba(239, 68, 68, 0.2)'
                            }}
                          />
                          {/* Glow effect on hover */}
                          <div 
                            className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                              earning.result === 'beat' ? 'bg-emerald-400/20' : 'bg-red-400/20'
                            }`}
                            style={{ filter: 'blur(8px)' }}
                          />
                          <div className={`absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap border shadow-xl ${
                            earning.result === 'beat' 
                              ? 'bg-emerald-900/90 text-emerald-300 border-emerald-700' 
                              : 'bg-red-900/90 text-red-300 border-red-700'
                          }`}>
                            ${earning.eps?.toFixed(2)}
                          </div>
                        </div>
                        <div className="mt-4 text-center">
                          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Actual</div>
                          <div className={`text-lg font-bold ${earning.result === 'beat' ? 'text-emerald-400' : 'text-red-400'}`}>
                            ${earning.eps?.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Surprise indicator */}
                      <div className="flex flex-col items-center justify-end h-full pb-12">
                        <div className={`px-4 py-2 rounded-full text-sm font-bold border ${
                          surprise >= 0 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_20px_rgba(34,197,94,0.3)]' 
                            : 'bg-red-500/20 text-red-400 border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                        }`}>
                          {surprise >= 0 ? '↑' : '↓'} {surprise >= 0 ? '+' : ''}{surprise.toFixed(1)}%
                        </div>
                        <div className="text-xs text-zinc-500 mt-2">Surprise</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              </GlassReflection>

              {/* Revenue & Guidance */}
              {analysis && (analysis.revenue || analysis.guidance) && (
                <div className="grid grid-cols-2 gap-4">
                  {analysis.revenue && analysis.revenue.actual > 0 && (
                    <div className="glass-card p-6">
                      <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Revenue</div>
                      <div className="text-3xl font-bold text-white mb-1">
                        ${analysis.revenue.actual}{analysis.revenue.unit}
                      </div>
                      <div className="text-sm text-zinc-500">vs ${analysis.revenue.estimate}{analysis.revenue.unit} est</div>
                      <div className={`badge mt-3 ${analysis.revenue.actual > analysis.revenue.estimate ? 'badge-success' : 'badge-danger'}`}>
                        {analysis.revenue.actual > analysis.revenue.estimate ? '+' : ''}
                        {((analysis.revenue.actual - analysis.revenue.estimate) / analysis.revenue.estimate * 100).toFixed(1)}%
                      </div>
                    </div>
                  )}
                  {analysis.guidance && (
                    <div className="glass-card p-6">
                      <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Guidance</div>
                      <div className={`text-3xl font-bold capitalize ${
                        analysis.guidance === 'raised' ? 'text-emerald-400' : 
                        analysis.guidance === 'lowered' ? 'text-red-400' : 'text-zinc-300'
                      }`}>
                        {analysis.guidance === 'raised' && '📈 '}
                        {analysis.guidance === 'lowered' && '📉 '}
                        {analysis.guidance === 'maintained' && '➡️ '}
                        {analysis.guidance}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* EPS Trend Sparkline */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-white mb-4">EPS Trend</h3>
                <EPSTrendSparkline data={historicalData} />
              </div>

              {/* Trade CTA */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Trade ${ticker}</h3>
                <div className="space-y-3">
                  <BrokerCTA broker="robinhood" ticker={ticker} size="md" delay={0} />
                  <BrokerCTA broker="webull" ticker={ticker} size="md" delay={50} />
                  <BrokerCTA broker="ibkr" ticker={ticker} size="md" delay={100} />
                </div>
                <p className="text-[10px] text-zinc-600 mt-4 text-center">
                  Affiliate links — we may earn a commission
                </p>
              </div>

              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Beat Rate (4Q)', value: '75%', color: 'text-emerald-400' },
                    { label: 'Avg Surprise', value: '+4.2%', color: 'text-emerald-400' },
                    { label: 'Next Report', value: 'May 2026', color: 'text-white' },
                  ].map((stat, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-sm text-zinc-500">{stat.label}</span>
                      <span className={`text-sm font-semibold ${stat.color}`}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <AlsoReporting 
                earnings={earnings} 
                currentDate={earning.date}
                currentTicker={ticker}
                limit={5}
              />
            </div>
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="max-w-3xl">
            {/* Reading progress indicator for AI analysis */}
            <ReadingProgress 
              targetRef={analysisContentRef} 
              color="gradient"
              height={3}
              position="top"
            />
            {analysis ? (
              <div ref={analysisContentRef} className="space-y-6">
                <ScrollReveal animation="fade-up" duration={500} distance={20}>
                  <div className="glass-card overflow-hidden">
                    <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <h2 className="text-lg font-semibold text-white">🤖 AI Analysis</h2>
                          {isTypingAnalysis && !skippedTypewriter && (
                            <TypingIndicator />
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">Generated {new Date(analysis.generatedAt).toLocaleDateString()}</p>
                      </div>
                      <SkipButton 
                        onSkip={handleSkipTypewriter}
                        visible={isTypingAnalysis && !skippedTypewriter}
                      />
                    </div>
                    <div className="p-8">
                      {skippedTypewriter || !isTypingAnalysis ? (
                        /* Show full text immediately */
                        <div className="space-y-4">
                          {analysis.summary.split('\n\n').map((p, i) => (
                            <p key={i} className="text-zinc-300 leading-relaxed">{p}</p>
                          ))}
                        </div>
                      ) : (
                        /* Typewriter effect */
                        <TypewriterParagraphs
                          paragraphs={analysis.summary.split('\n\n')}
                          speed={12}
                          paragraphDelay={300}
                          className="space-y-4"
                          paragraphClassName="text-zinc-300 leading-relaxed"
                        />
                      )}
                    </div>
                  </div>
                </ScrollReveal>

                {analysis.keyPoints && (
                  <ScrollReveal animation="fade-up" duration={500} delay={150} distance={20}>
                    <div className="glass-card overflow-hidden">
                      <div className="px-8 py-5 border-b border-white/5">
                        <h2 className="text-lg font-semibold text-white">🎯 Key Takeaways</h2>
                      </div>
                      <StaggeredReveal 
                        animation="fade-left" 
                        stagger={100} 
                        baseDelay={200} 
                        duration={400}
                        distance={15}
                        className="divide-y divide-white/5"
                      >
                        {analysis.keyPoints.map((point, i) => (
                          <div key={i} className="flex items-start gap-4 p-6">
                            <span className={`badge ${
                              point.sentiment === 'up' ? 'badge-success' :
                              point.sentiment === 'down' ? 'badge-danger' : 'badge-neutral'
                            }`}>
                              {point.sentiment === 'up' ? '↑' : point.sentiment === 'down' ? '↓' : '→'}
                            </span>
                            <span className="text-zinc-300 leading-relaxed">{point.text}</span>
                          </div>
                        ))}
                      </StaggeredReveal>
                    </div>
                  </ScrollReveal>
                )}
              </div>
            ) : (
              <ScrollReveal animation="scale" duration={600}>
                <div className="glass-card p-16 text-center">
                  <div className="text-6xl mb-4">🤖</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Analysis Coming Soon</h3>
                  <p className="text-zinc-500">
                    {hasResult ? 'Generating detailed analysis...' : 'Available after earnings release.'}
                  </p>
                </div>
              </ScrollReveal>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="max-w-4xl space-y-6">
            <ScrollReveal animation="fade-up" duration={500} distance={25}>
              <div className="glass-card p-8">
                <h3 className="text-lg font-semibold text-white mb-6">EPS Trend</h3>
                <EPSChart data={historicalData} />
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" duration={500} delay={100} distance={25}>
              <div className="glass-card p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Quarter by Quarter</h3>
                  <div className="flex items-center gap-6 text-xs text-zinc-500">
                    <span className="flex items-center gap-2"><span className="w-3 h-3 bg-zinc-600 rounded"></span> Estimate</span>
                    <span className="flex items-center gap-2"><span className="w-3 h-3 bg-emerald-500 rounded"></span> Beat</span>
                    <span className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded"></span> Miss</span>
                  </div>
                </div>
                <EPSBarChart data={historicalData} />
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" duration={500} delay={200} distance={25}>
              <div className="glass-card overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5">
                  <h3 className="text-lg font-semibold text-white">Historical Data</h3>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left text-xs text-zinc-500 uppercase tracking-wider px-6 py-4">Quarter</th>
                      <th className="text-right text-xs text-zinc-500 uppercase tracking-wider px-6 py-4">EPS</th>
                      <th className="text-right text-xs text-zinc-500 uppercase tracking-wider px-6 py-4">Estimate</th>
                      <th className="text-right text-xs text-zinc-500 uppercase tracking-wider px-6 py-4">Surprise</th>
                      <th className="text-center text-xs text-zinc-500 uppercase tracking-wider px-6 py-4">Result</th>
                    </tr>
                  </thead>
                  <RevealTableBody stagger={80} duration={450} baseDelay={150}>
                    {historicalData.map((row, i) => {
                      const surp = ((row.eps - row.estimate) / Math.abs(row.estimate) * 100);
                      return (
                        <tr key={i} className="hover:bg-white/5 transition-smooth">
                          <td className="px-6 py-4 text-white font-medium">{row.quarter}</td>
                          <td className="px-6 py-4 text-right text-white">${row.eps.toFixed(2)}</td>
                          <td className="px-6 py-4 text-right text-zinc-500">${row.estimate.toFixed(2)}</td>
                          <td className={`px-6 py-4 text-right font-medium ${surp >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {surp >= 0 ? '+' : ''}{surp.toFixed(1)}%
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`badge ${row.beat ? 'badge-success' : 'badge-danger'}`}>
                              {row.beat ? 'Beat' : 'Miss'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </RevealTableBody>
                </table>
              </div>
            </ScrollReveal>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-white/5 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-xs text-zinc-600">
          AI-generated analysis for informational purposes. Not financial advice.
        </div>
      </div>
    </div>
  );
}
