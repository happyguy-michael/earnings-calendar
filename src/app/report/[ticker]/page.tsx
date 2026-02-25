'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getEarning, getAnalysis, earnings } from '@/lib/data';
import { EPSChart, EPSBarChart } from '@/components/EPSChart';
import { CountUp } from '@/components/CountUp';

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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'analysis', label: 'AI Analysis', icon: '🤖' },
    { id: 'history', label: 'History', icon: '📈' },
  ];

  return (
    <div className="min-h-screen">
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
            <button className="badge badge-neutral hover:bg-white/10 transition-smooth cursor-pointer">
              ♡ Watchlist
            </button>
            <button className="badge badge-neutral hover:bg-white/10 transition-smooth cursor-pointer">
              ↗ Share
            </button>
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
                  <span className={`badge ${hasResult ? (earning.result === 'beat' ? 'badge-success' : 'badge-danger') : 'badge-warning'}`}>
                    {hasResult ? (earning.result === 'beat' ? '✓ Beat' : '✗ Miss') : '⏳ Pending'}
                  </span>
                </div>
                <p className="text-zinc-400 text-lg">{earning.company}</p>
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Price Card */}
            <div className="glass-card p-5 min-w-[200px]">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Stock Price</div>
              <div className="text-3xl font-bold text-white">${mockPrice}</div>
              <div className={`text-sm font-medium ${parseFloat(mockChange) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {parseFloat(mockChange) >= 0 ? '+' : ''}{mockChange} ({parseFloat(mockChange) >= 0 ? '+' : ''}{(parseFloat(mockChange) / parseFloat(mockPrice) * 100).toFixed(2)}%)
              </div>
            </div>

            {/* Report Info Card */}
            <div className="glass-card p-5 min-w-[200px]">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Report Date</div>
              <div className="text-xl font-semibold text-white">{earning.date}</div>
              <div className="text-sm text-zinc-400">{earning.time === 'pre' ? '☀️ Pre-Market' : '🌙 After Hours'}</div>
              {!hasResult && countdown && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="text-2xl font-bold text-amber-400">{countdown}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/5 sticky top-[57px] z-10 backdrop-blur-xl bg-black/50">
        <div className="max-w-6xl mx-auto px-6">
          <nav className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-4 text-sm font-medium border-b-2 transition-smooth ${
                  activeTab === tab.id 
                    ? 'border-indigo-500 text-white' 
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>{tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* EPS Result Card */}
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
                      <div className="text-center">
                        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Surprise</div>
                        <div className={`text-5xl font-bold ${surprise >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          <CountUp 
                            end={surprise} 
                            duration={1200} 
                            decimals={1}
                            prefix={surprise >= 0 ? '+' : ''}
                            suffix="%" 
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

                {/* Visual bar comparison */}
                {hasResult && (
                  <div className="mt-10 pt-8 border-t border-white/5">
                    <div className="flex items-end justify-center gap-16 h-32">
                      <div className="flex flex-col items-center">
                        <div 
                          className="w-24 bg-zinc-700 rounded-t-xl transition-all"
                          style={{ height: `${Math.min(100, (earning.estimate / (earning.eps || 1)) * 80)}px` }}
                        />
                        <div className="mt-3 text-center">
                          <div className="text-xs text-zinc-500">Estimate</div>
                          <div className="text-sm font-semibold text-zinc-400">${earning.estimate.toFixed(2)}</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div 
                          className={`w-24 rounded-t-xl transition-all ${earning.result === 'beat' ? 'success-gradient glow-success' : 'danger-gradient glow-danger'}`}
                          style={{ height: '80px' }}
                        />
                        <div className="mt-3 text-center">
                          <div className="text-xs text-zinc-500">Actual</div>
                          <div className="text-sm font-semibold text-white">${earning.eps?.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

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

              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Also Reporting</h3>
                <div className="space-y-2">
                  {earnings.filter(e => e.date === earning.date && e.ticker !== ticker).slice(0, 4).map(e => (
                    <Link 
                      key={e.ticker} 
                      href={`/report/${e.ticker}`}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-smooth"
                    >
                      <span className="text-white font-medium">{e.ticker}</span>
                      <span className="text-xs text-zinc-500">{e.time === 'pre' ? '☀️' : '🌙'}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="max-w-3xl">
            {analysis ? (
              <div className="space-y-6">
                <div className="glass-card overflow-hidden">
                  <div className="px-8 py-5 border-b border-white/5">
                    <h2 className="text-lg font-semibold text-white">🤖 AI Analysis</h2>
                    <p className="text-xs text-zinc-500 mt-1">Generated {new Date(analysis.generatedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="p-8">
                    <div className="space-y-4">
                      {analysis.summary.split('\n\n').map((p, i) => (
                        <p key={i} className="text-zinc-300 leading-relaxed">{p}</p>
                      ))}
                    </div>
                  </div>
                </div>

                {analysis.keyPoints && (
                  <div className="glass-card overflow-hidden">
                    <div className="px-8 py-5 border-b border-white/5">
                      <h2 className="text-lg font-semibold text-white">🎯 Key Takeaways</h2>
                    </div>
                    <div className="divide-y divide-white/5">
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
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-card p-16 text-center">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold text-white mb-2">Analysis Coming Soon</h3>
                <p className="text-zinc-500">
                  {hasResult ? 'Generating detailed analysis...' : 'Available after earnings release.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="max-w-4xl space-y-6">
            <div className="glass-card p-8">
              <h3 className="text-lg font-semibold text-white mb-6">EPS Trend</h3>
              <EPSChart data={historicalData} />
            </div>

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
                <tbody className="divide-y divide-white/5">
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
                </tbody>
              </table>
            </div>
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
