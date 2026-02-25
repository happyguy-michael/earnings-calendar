'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getEarning, getAnalysis } from '@/lib/data';

export default function ReportPage() {
  const params = useParams();
  const ticker = (params.ticker as string).toUpperCase();
  const earning = getEarning(ticker);
  const analysis = getAnalysis(ticker);

  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (!earning || earning.eps !== undefined) return;

    const updateCountdown = () => {
      const target = new Date(earning.date);
      if (earning.time === 'pre') {
        target.setHours(9, 30, 0);
      } else {
        target.setHours(16, 0, 0);
      }

      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown('Reporting soon...');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setCountdown(`${days}d ${hours}h ${mins}m`);
      } else {
        setCountdown(`${hours}h ${mins}m`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [earning]);

  if (!earning) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500 mb-4">Ticker not found: {ticker}</p>
          <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm">
            ← Back to Calendar
          </Link>
        </div>
      </div>
    );
  }

  const hasResult = earning.eps !== undefined && earning.eps !== null;
  const logoUrl = `https://logo.clearbit.com/${earning.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;

  let surprise = 0;
  let surprisePercent = 0;
  if (hasResult && earning.estimate) {
    surprise = earning.eps! - earning.estimate;
    surprisePercent = (surprise / Math.abs(earning.estimate)) * 100;
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <Link href="/" className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-white text-sm transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Company Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center overflow-hidden border border-zinc-800">
            <img
              src={logoUrl}
              alt={ticker}
              className="w-full h-full object-contain p-2"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <span className="hidden text-xl font-bold text-zinc-600">{ticker}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{ticker}</h1>
              {hasResult && (
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  earning.result === 'beat' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {earning.result === 'beat' ? '✓ BEAT' : '✗ MISS'}
                </span>
              )}
              {!hasResult && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  PENDING
                </span>
              )}
            </div>
            <p className="text-zinc-500 text-sm mt-1">{earning.company}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-zinc-600">
              <span>📅 {earning.date}</span>
              <span>{earning.time === 'pre' ? '☀️ Pre-Market' : '🌙 After Hours'}</span>
            </div>
          </div>
        </div>

        {/* Pending Notice */}
        {!hasResult && (
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-amber-400 font-semibold text-sm">⏳ Earnings Pending</h3>
                <p className="text-zinc-500 text-xs mt-1">
                  Report expected {earning.time === 'pre' ? 'before market open' : 'after market close'}
                </p>
              </div>
              {countdown && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-amber-400">{countdown}</div>
                  <div className="text-[10px] text-zinc-600 uppercase">until report</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/50">
            <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">
              {hasResult ? 'Actual EPS' : 'Est. EPS'}
            </div>
            <div className="text-xl font-bold text-white">
              ${hasResult ? earning.eps?.toFixed(2) : earning.estimate.toFixed(2)}
            </div>
          </div>
          
          {hasResult && (
            <>
              <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/50">
                <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Estimate</div>
                <div className="text-xl font-bold text-zinc-400">${earning.estimate.toFixed(2)}</div>
              </div>
              <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/50">
                <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Surprise</div>
                <div className={`text-xl font-bold ${surprisePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {surprisePercent >= 0 ? '+' : ''}{surprisePercent.toFixed(1)}%
                </div>
              </div>
              <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/50">
                <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Difference</div>
                <div className={`text-xl font-bold ${surprise >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {surprise >= 0 ? '+' : ''}${surprise.toFixed(2)}
                </div>
              </div>
            </>
          )}
          
          {!hasResult && earning.beatOdds && (
            <>
              <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/50">
                <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Beat Odds</div>
                <div className={`text-xl font-bold ${
                  earning.beatOdds >= 70 ? 'text-emerald-400' : earning.beatOdds >= 50 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {earning.beatOdds}%
                </div>
              </div>
              <div className="col-span-2 bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/50">
                <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Market Sentiment</div>
                <div className="text-lg font-semibold text-white">
                  {earning.beatOdds >= 70 ? '🟢 Bullish' : earning.beatOdds >= 50 ? '🟡 Neutral' : '🔴 Bearish'}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Revenue & Guidance (from analysis) */}
        {analysis && (analysis.revenue || analysis.guidance) && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {analysis.revenue && analysis.revenue.actual > 0 && (
              <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/50">
                <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-2">Revenue</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-white">${analysis.revenue.actual}{analysis.revenue.unit}</span>
                  <span className="text-sm text-zinc-500">vs ${analysis.revenue.estimate}{analysis.revenue.unit} est</span>
                </div>
                {analysis.revenue.actual > analysis.revenue.estimate && (
                  <div className="text-xs text-emerald-400 mt-1">
                    +{((analysis.revenue.actual - analysis.revenue.estimate) / analysis.revenue.estimate * 100).toFixed(1)}% beat
                  </div>
                )}
              </div>
            )}
            {analysis.guidance && (
              <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/50">
                <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-2">Guidance</div>
                <div className={`text-xl font-bold capitalize ${
                  analysis.guidance === 'raised' ? 'text-emerald-400' : 
                  analysis.guidance === 'lowered' ? 'text-red-400' : 'text-zinc-400'
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

        {/* AI Analysis */}
        {analysis && (
          <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800/50 overflow-hidden mb-6">
            <div className="px-5 py-4 border-b border-zinc-800/50 bg-zinc-900/50">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <span className="text-lg">🤖</span> AI Analysis
              </h2>
            </div>
            <div className="p-5">
              <div className="text-sm text-zinc-300 leading-relaxed space-y-4">
                {analysis.summary.split('\n\n').map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Key Takeaways */}
        {analysis && analysis.keyPoints && (
          <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800/50 overflow-hidden mb-6">
            <div className="px-5 py-4 border-b border-zinc-800/50 bg-zinc-900/50">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <span className="text-lg">🎯</span> Key Takeaways
              </h2>
            </div>
            <div className="divide-y divide-zinc-800/30">
              {analysis.keyPoints.map((point, i) => (
                <div key={i} className="flex items-start gap-3 p-4">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs flex-shrink-0 ${
                    point.sentiment === 'up' ? 'bg-emerald-500/20 text-emerald-400' :
                    point.sentiment === 'down' ? 'bg-red-500/20 text-red-400' :
                    'bg-zinc-700/50 text-zinc-400'
                  }`}>
                    {point.sentiment === 'up' ? '↑' : point.sentiment === 'down' ? '↓' : '→'}
                  </span>
                  <span className="text-sm text-zinc-300 leading-relaxed">{point.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Analysis Yet */}
        {!analysis && (
          <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800/50 p-8 text-center mb-6">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-white font-semibold mb-2">Analysis Coming Soon</h3>
            <p className="text-zinc-500 text-sm">
              {hasResult 
                ? 'Our AI is generating a detailed analysis of this earnings report.' 
                : 'Analysis will be available after the earnings report is released.'}
            </p>
          </div>
        )}

        {/* Disclaimer */}
        <div className="text-center text-[10px] text-zinc-600 mt-8">
          Analysis is AI-generated for informational purposes only. Not financial advice.
        </div>
      </main>
    </div>
  );
}
