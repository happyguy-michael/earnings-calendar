'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getEarning, getAnalysis, earnings } from '@/lib/data';
import { EPSChart, EPSBarChart } from '@/components/EPSChart';

export default function ReportPage() {
  const params = useParams();
  const ticker = (params.ticker as string).toUpperCase();
  const earning = getEarning(ticker);
  const analysis = getAnalysis(ticker);
  const [activeTab, setActiveTab] = useState('overview');
  const [countdown, setCountdown] = useState('');

  // Get historical earnings for this ticker (mock - last 4 quarters)
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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-zinc-400 mb-4">Ticker not found: {ticker}</p>
          <Link href="/" className="text-blue-400 hover:text-blue-300">← Back to Calendar</Link>
        </div>
      </div>
    );
  }

  const hasResult = earning.eps !== undefined && earning.eps !== null;
  const logoUrl = `https://logo.clearbit.com/${earning.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
  const surprise = hasResult ? ((earning.eps! - earning.estimate) / Math.abs(earning.estimate)) * 100 : 0;
  const mockPrice = (earning.estimate * 45 + Math.random() * 20).toFixed(2);
  const mockChange = (Math.random() * 6 - 2).toFixed(2);
  const mockChangePercent = (parseFloat(mockChange) / parseFloat(mockPrice) * 100).toFixed(2);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Top Bar */}
      <div className="border-b border-zinc-800/50 bg-[#0f0f0f]">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back to Calendar
          </Link>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg text-xs text-zinc-300 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Watchlist
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg text-xs text-zinc-300 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a] border-b border-zinc-800/30">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-start gap-6">
            {/* Logo */}
            <div className="w-20 h-20 rounded-2xl bg-zinc-800/50 flex items-center justify-center overflow-hidden border border-zinc-700/50 shadow-lg">
              <img src={logoUrl} alt={ticker} className="w-full h-full object-contain p-3"
                onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
              <span className="hidden text-2xl font-bold text-zinc-500">{ticker}</span>
            </div>

            {/* Title & Price */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-white">{ticker}</h1>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  hasResult 
                    ? earning.result === 'beat' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {hasResult ? (earning.result === 'beat' ? '✓ BEAT' : '✗ MISS') : '⏳ PENDING'}
                </span>
              </div>
              <p className="text-zinc-400 text-lg mb-3">{earning.company}</p>
              
              {/* Mock Stock Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-white">${mockPrice}</span>
                <span className={`text-lg font-semibold ${parseFloat(mockChange) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {parseFloat(mockChange) >= 0 ? '+' : ''}{mockChange} ({parseFloat(mockChangePercent) >= 0 ? '+' : ''}{mockChangePercent}%)
                </span>
              </div>
            </div>

            {/* Report Info Card */}
            <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800/50 p-5 min-w-[240px]">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Earnings Report</div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Date</span>
                  <span className="text-white font-medium">{earning.date}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Time</span>
                  <span className="text-white font-medium">{earning.time === 'pre' ? '☀️ Pre-Market' : '🌙 After Hours'}</span>
                </div>
                {!hasResult && countdown && (
                  <div className="pt-3 border-t border-zinc-800/50">
                    <div className="text-xs text-zinc-500 mb-1">Reporting in</div>
                    <div className="text-2xl font-bold text-amber-400">{countdown}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-zinc-800/50 bg-[#0a0a0a] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex gap-1">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'analysis', label: 'AI Analysis', icon: '🤖' },
              { id: 'history', label: 'History', icon: '📈' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id 
                    ? 'border-blue-500 text-white' 
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* EPS Card */}
              <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800/50 overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-800/50 bg-zinc-900/30">
                  <h2 className="text-lg font-semibold text-white">Earnings Per Share (EPS)</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
                        {hasResult ? 'Actual' : 'Estimate'}
                      </div>
                      <div className="text-4xl font-bold text-white">
                        ${hasResult ? earning.eps?.toFixed(2) : earning.estimate.toFixed(2)}
                      </div>
                    </div>
                    {hasResult && (
                      <>
                        <div className="text-center">
                          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Estimate</div>
                          <div className="text-4xl font-bold text-zinc-500">${earning.estimate.toFixed(2)}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Surprise</div>
                          <div className={`text-4xl font-bold ${surprise >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {surprise >= 0 ? '+' : ''}{surprise.toFixed(1)}%
                          </div>
                        </div>
                      </>
                    )}
                    {!hasResult && earning.beatOdds && (
                      <>
                        <div className="text-center">
                          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Beat Odds</div>
                          <div className={`text-4xl font-bold ${earning.beatOdds >= 70 ? 'text-emerald-400' : earning.beatOdds >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                            {earning.beatOdds}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Sentiment</div>
                          <div className="text-2xl font-bold text-white">
                            {earning.beatOdds >= 70 ? '🟢 Bullish' : earning.beatOdds >= 50 ? '🟡 Neutral' : '🔴 Bearish'}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* EPS Chart Visual */}
                  {hasResult && (
                    <div className="mt-8 pt-6 border-t border-zinc-800/50">
                      <div className="flex items-end justify-center gap-4 h-32">
                        <div className="flex flex-col items-center">
                          <div 
                            className="w-20 bg-zinc-600 rounded-t-lg transition-all"
                            style={{ height: `${Math.min(100, (earning.estimate / (earning.eps || 1)) * 80)}px` }}
                          />
                          <span className="text-xs text-zinc-500 mt-2">Est</span>
                          <span className="text-sm font-medium text-zinc-400">${earning.estimate.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div 
                            className={`w-20 rounded-t-lg transition-all ${earning.result === 'beat' ? 'bg-emerald-500' : 'bg-red-500'}`}
                            style={{ height: '80px' }}
                          />
                          <span className="text-xs text-zinc-500 mt-2">Actual</span>
                          <span className="text-sm font-medium text-white">${earning.eps?.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Revenue & Guidance */}
              {analysis && (analysis.revenue || analysis.guidance) && (
                <div className="grid grid-cols-2 gap-4">
                  {analysis.revenue && analysis.revenue.actual > 0 && (
                    <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800/50 p-6">
                      <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Revenue</div>
                      <div className="text-3xl font-bold text-white mb-1">
                        ${analysis.revenue.actual}{analysis.revenue.unit}
                      </div>
                      <div className="text-sm text-zinc-400">
                        vs ${analysis.revenue.estimate}{analysis.revenue.unit} estimate
                      </div>
                      <div className={`text-sm font-medium mt-2 ${
                        analysis.revenue.actual > analysis.revenue.estimate ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {analysis.revenue.actual > analysis.revenue.estimate ? '+' : ''}
                        {((analysis.revenue.actual - analysis.revenue.estimate) / analysis.revenue.estimate * 100).toFixed(1)}% 
                        {analysis.revenue.actual > analysis.revenue.estimate ? ' beat' : ' miss'}
                      </div>
                    </div>
                  )}
                  {analysis.guidance && (
                    <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800/50 p-6">
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
                      <div className="text-sm text-zinc-400 mt-1">
                        {analysis.guidance === 'raised' ? 'Management outlook improved' :
                         analysis.guidance === 'lowered' ? 'Management outlook reduced' :
                         'Management outlook unchanged'}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800/50 p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-400 text-sm">Beat Rate (4Q)</span>
                    <span className="text-white font-medium">75%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400 text-sm">Avg Surprise</span>
                    <span className="text-emerald-400 font-medium">+4.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400 text-sm">Next Report</span>
                    <span className="text-white font-medium">May 2026</span>
                  </div>
                </div>
              </div>

              {/* Related Tickers */}
              <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800/50 p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Also Reporting Today</h3>
                <div className="space-y-2">
                  {earnings.filter(e => e.date === earning.date && e.ticker !== ticker).slice(0, 4).map(e => (
                    <Link 
                      key={e.ticker} 
                      href={`/report/${e.ticker}`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800/50 transition-colors"
                    >
                      <span className="text-white font-medium text-sm">{e.ticker}</span>
                      <span className="text-zinc-500 text-xs">{e.time === 'pre' ? 'Pre' : 'Post'}</span>
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
                <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800/50 overflow-hidden">
                  <div className="px-6 py-4 border-b border-zinc-800/50 bg-zinc-900/30">
                    <h2 className="text-lg font-semibold text-white">🤖 AI Analysis</h2>
                    <p className="text-xs text-zinc-500 mt-1">Generated {new Date(analysis.generatedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="p-6">
                    <div className="prose prose-invert prose-sm max-w-none">
                      {analysis.summary.split('\n\n').map((p, i) => (
                        <p key={i} className="text-zinc-300 leading-relaxed mb-4 last:mb-0">{p}</p>
                      ))}
                    </div>
                  </div>
                </div>

                {analysis.keyPoints && (
                  <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800/50 overflow-hidden">
                    <div className="px-6 py-4 border-b border-zinc-800/50 bg-zinc-900/30">
                      <h2 className="text-lg font-semibold text-white">🎯 Key Takeaways</h2>
                    </div>
                    <div className="divide-y divide-zinc-800/30">
                      {analysis.keyPoints.map((point, i) => (
                        <div key={i} className="flex items-start gap-4 p-5">
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                            point.sentiment === 'up' ? 'bg-emerald-500/20 text-emerald-400' :
                            point.sentiment === 'down' ? 'bg-red-500/20 text-red-400' :
                            'bg-zinc-700/50 text-zinc-400'
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
              <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800/50 p-12 text-center">
                <div className="text-5xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold text-white mb-2">Analysis Coming Soon</h3>
                <p className="text-zinc-400">
                  {hasResult 
                    ? 'Our AI is generating a detailed analysis of this earnings report.' 
                    : 'Analysis will be available after the earnings report is released.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="max-w-4xl">
            <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800/50 overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-800/50 bg-zinc-900/30">
                <h2 className="text-lg font-semibold text-white">📈 Earnings History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800/50">
                      <th className="text-left text-xs text-zinc-500 uppercase tracking-wider px-6 py-4">Quarter</th>
                      <th className="text-right text-xs text-zinc-500 uppercase tracking-wider px-6 py-4">EPS</th>
                      <th className="text-right text-xs text-zinc-500 uppercase tracking-wider px-6 py-4">Estimate</th>
                      <th className="text-right text-xs text-zinc-500 uppercase tracking-wider px-6 py-4">Surprise</th>
                      <th className="text-center text-xs text-zinc-500 uppercase tracking-wider px-6 py-4">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/30">
                    {historicalData.map((row, i) => {
                      const surp = ((row.eps - row.estimate) / Math.abs(row.estimate) * 100);
                      return (
                        <tr key={i} className="hover:bg-zinc-800/20 transition-colors">
                          <td className="px-6 py-4 text-white font-medium">{row.quarter}</td>
                          <td className="px-6 py-4 text-right text-white">${row.eps.toFixed(2)}</td>
                          <td className="px-6 py-4 text-right text-zinc-400">${row.estimate.toFixed(2)}</td>
                          <td className={`px-6 py-4 text-right font-medium ${surp >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {surp >= 0 ? '+' : ''}{surp.toFixed(1)}%
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              row.beat ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {row.beat ? 'BEAT' : 'MISS'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Line Chart */}
            <div className="mt-6 bg-zinc-900/30 rounded-2xl border border-zinc-800/50 p-6">
              <h3 className="text-sm font-semibold text-white mb-4">EPS Trend</h3>
              <EPSChart data={historicalData} />
            </div>

            {/* Bar Chart Comparison */}
            <div className="mt-6 bg-zinc-900/30 rounded-2xl border border-zinc-800/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Quarter by Quarter</h3>
                <div className="flex items-center gap-4 text-[10px] text-zinc-500">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-zinc-600 rounded-sm"></span> Estimate</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></span> Beat</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-red-500 rounded-sm"></span> Miss</span>
                </div>
              </div>
              <EPSBarChart data={historicalData} />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-800/30 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-xs text-zinc-600">
          Analysis is AI-generated for informational purposes only. Not financial advice.
        </div>
      </div>
    </div>
  );
}
