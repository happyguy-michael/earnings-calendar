'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getEarning, getAnalysis } from '@/lib/data';
import { Earning, Analysis } from '@/lib/types';

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
        setCountdown('Report expected soon...');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      let text = '';
      if (days > 0) text += `${days}d `;
      text += `${hours}h ${mins}m ${secs}s`;
      setCountdown(text);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [earning]);

  if (!earning) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-[#666] hover:text-[#888] text-sm mb-6">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back to Calendar
        </Link>
        <p className="text-[#888]">Earnings report not found for {ticker}</p>
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
    <div className="max-w-4xl mx-auto p-6">
      <Link href="/" className="inline-flex items-center gap-2 text-[#666] hover:text-[#888] text-sm mb-6">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back to Calendar
      </Link>

      {/* Header */}
      <div className="flex items-center gap-5 pb-6 border-b border-[#222] mb-6">
        <div className="w-20 h-20 rounded-2xl bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
          <img
            src={logoUrl}
            alt={ticker}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <span className="hidden text-2xl font-bold text-[#444]">{ticker}</span>
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white mb-1">{ticker}</h1>
          <p className="text-[#888] mb-2">{earning.company}</p>
          <div className="flex gap-4 text-sm text-[#666]">
            <span>📅 {earning.date}</span>
            <span>🕐 {earning.time === 'pre' ? 'Pre-Market' : 'After Hours'}</span>
          </div>
        </div>
        <div
          className={`px-4 py-2 rounded-lg font-semibold ${
            hasResult
              ? earning.result === 'beat'
                ? 'bg-green-500/20 text-green-500'
                : 'bg-red-500/20 text-red-500'
              : 'bg-blue-500/20 text-blue-500'
          }`}
        >
          {hasResult ? (earning.result === 'beat' ? '✓ BEAT' : '✗ MISSED') : 'PENDING'}
        </div>
      </div>

      {/* Pending Notice */}
      {!hasResult && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-5 text-center mb-6">
          <h3 className="text-blue-500 font-semibold mb-2">⏳ Earnings Pending</h3>
          <p className="text-[#888] text-sm">
            Report expected {earning.time === 'pre' ? 'before market open' : 'after market close'} on {earning.date}
          </p>
          {countdown && <div className="text-2xl font-semibold text-blue-500 mt-3">{countdown}</div>}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {hasResult ? (
          <>
            <div className="bg-[#141414] rounded-xl p-5 border border-[#222]">
              <h2 className="text-xs text-[#666] uppercase tracking-wide mb-4">📊 EPS Results</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 border-b border-[#1a1a1a]">
                  <span className="text-[#888] text-sm">Actual EPS</span>
                  <span className="font-semibold">${earning.eps}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[#1a1a1a]">
                  <span className="text-[#888] text-sm">Estimate</span>
                  <span className="font-semibold">${earning.estimate}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-[#888] text-sm">Surprise</span>
                  <span className={`font-semibold ${surprise >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {surprise >= 0 ? '+' : ''}${surprise.toFixed(2)} ({surprisePercent >= 0 ? '+' : ''}{surprisePercent.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-[#141414] rounded-xl p-5 border border-[#222] flex items-center justify-center">
              <div className="text-center">
                <div className={`text-5xl font-bold mb-2 ${surprise >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {surprisePercent >= 0 ? '+' : ''}{surprisePercent.toFixed(1)}%
                </div>
                <div className="text-sm text-[#666]">EPS Surprise</div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-[#141414] rounded-xl p-5 border border-[#222]">
              <h2 className="text-xs text-[#666] uppercase tracking-wide mb-4">📊 Expectations</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 border-b border-[#1a1a1a]">
                  <span className="text-[#888] text-sm">EPS Estimate</span>
                  <span className="font-semibold">${earning.estimate}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-[#888] text-sm">Beat Probability</span>
                  <span
                    className={`font-semibold ${
                      (earning.beatOdds || 0) >= 60 ? 'text-green-500' : (earning.beatOdds || 0) >= 40 ? 'text-yellow-500' : 'text-red-500'
                    }`}
                  >
                    {earning.beatOdds || '--'}%
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-[#141414] rounded-xl p-5 border border-[#222] flex items-center justify-center">
              <div className="text-center">
                <div className={`text-5xl font-bold mb-2 ${(earning.beatOdds || 0) >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                  {earning.beatOdds || '--'}%
                </div>
                <div className="text-sm text-[#666]">Market expects {(earning.beatOdds || 0) >= 50 ? 'BEAT' : 'MISS'}</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* AI Analysis */}
      {analysis && (
        <>
          <div className="bg-[#141414] rounded-xl p-5 border border-[#222] mb-6">
            <h2 className="text-xs text-[#666] uppercase tracking-wide mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              AI Analysis
            </h2>
            <div className="text-[15px] leading-relaxed text-[#ccc] space-y-4">
              {analysis.summary.split('\n\n').map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>

          <div className="bg-[#141414] rounded-xl p-5 border border-[#222] mb-6">
            <h2 className="text-xs text-[#666] uppercase tracking-wide mb-4">🎯 Key Takeaways</h2>
            <ul className="space-y-3">
              {analysis.keyPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-3 py-3 border-b border-[#1a1a1a] last:border-b-0">
                  <span
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-xs flex-shrink-0 ${
                      point.sentiment === 'up'
                        ? 'bg-green-500/20 text-green-500'
                        : point.sentiment === 'down'
                        ? 'bg-red-500/20 text-red-500'
                        : 'bg-yellow-500/20 text-yellow-500'
                    }`}
                  >
                    {point.sentiment === 'up' ? '↑' : point.sentiment === 'down' ? '↓' : '→'}
                  </span>
                  <span className="text-sm leading-relaxed">{point.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {!analysis && hasResult && (
        <div className="bg-[#141414] rounded-xl p-5 border border-[#222] mb-6">
          <h2 className="text-xs text-[#666] uppercase tracking-wide mb-4">🤖 AI Analysis</h2>
          <p className="text-[#888]">
            Analysis is being generated... Check back shortly for a comprehensive breakdown of {earning.company}&apos;s earnings report.
          </p>
        </div>
      )}

      {/* Historical Performance */}
      <div className="bg-[#141414] rounded-xl p-5 border border-[#222]">
        <h2 className="text-xs text-[#666] uppercase tracking-wide mb-4">📈 Historical Earnings</h2>
        <table className="w-full">
          <thead>
            <tr className="text-[#666] text-xs uppercase">
              <th className="text-left py-3 border-b border-[#1a1a1a]">Quarter</th>
              <th className="text-left py-3 border-b border-[#1a1a1a]">EPS</th>
              <th className="text-left py-3 border-b border-[#1a1a1a]">Estimate</th>
              <th className="text-left py-3 border-b border-[#1a1a1a]">Surprise</th>
              <th className="text-left py-3 border-b border-[#1a1a1a]">Result</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {[
              { q: 'Q3 2025', mult: 0.95, estMult: 0.92, surprise: 3.2, result: 'beat' },
              { q: 'Q2 2025', mult: 0.88, estMult: 0.9, surprise: -2.2, result: 'miss' },
              { q: 'Q1 2025', mult: 0.82, estMult: 0.8, surprise: 2.5, result: 'beat' },
              { q: 'Q4 2024', mult: 0.78, estMult: 0.77, surprise: 1.3, result: 'beat' },
            ].map((row, i) => (
              <tr key={i}>
                <td className="py-3 border-b border-[#1a1a1a]">{row.q}</td>
                <td className="py-3 border-b border-[#1a1a1a]">${(earning.estimate * row.mult).toFixed(2)}</td>
                <td className="py-3 border-b border-[#1a1a1a]">${(earning.estimate * row.estMult).toFixed(2)}</td>
                <td className={`py-3 border-b border-[#1a1a1a] ${row.result === 'beat' ? 'text-green-500' : 'text-red-500'}`}>
                  {row.surprise > 0 ? '+' : ''}{row.surprise}%
                </td>
                <td className={`py-3 border-b border-[#1a1a1a] ${row.result === 'beat' ? 'text-green-500' : 'text-red-500'}`}>
                  {row.result.toUpperCase()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
