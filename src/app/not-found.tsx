'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FloatingParticles } from '@/components/FloatingParticles';
import { GrainOverlay } from '@/components/GrainOverlay';
import { MagneticButton } from '@/components/MagneticButton';

// Animated glitchy "404" text with scan lines
function Glitch404() {
  const [glitchActive, setGlitchActive] = useState(false);
  
  useEffect(() => {
    // Random glitch bursts
    const interval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }, 3000 + Math.random() * 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className={`glitch-container ${glitchActive ? 'glitching' : ''}`}>
      <div className="glitch-404" data-text="404">
        <span className="glitch-layer glitch-layer-1">404</span>
        <span className="glitch-layer glitch-layer-2">404</span>
        <span className="glitch-layer glitch-layer-3">404</span>
      </div>
      <div className="glitch-scanlines" aria-hidden="true" />
    </div>
  );
}

// Floating stock chart that's "broken"
function BrokenChart() {
  return (
    <svg 
      className="broken-chart-svg" 
      viewBox="0 0 200 100" 
      fill="none"
      aria-hidden="true"
    >
      {/* Grid lines */}
      <g className="chart-grid" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.5">
        {[20, 40, 60, 80].map(y => (
          <line key={y} x1="0" y1={y} x2="200" y2={y} />
        ))}
        {[40, 80, 120, 160].map(x => (
          <line key={x} x1={x} y1="0" x2={x} y2="100" />
        ))}
      </g>
      
      {/* Broken line going down */}
      <path 
        className="chart-line-broken"
        d="M 10,30 L 40,25 L 70,35 L 100,20 L 120,45 L 140,40 L 160,90 L 180,85"
        stroke="url(#brokenGradient)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* The "break" point with X */}
      <g className="chart-break-point">
        <circle cx="160" cy="90" r="8" fill="#ef4444" fillOpacity="0.2" />
        <circle cx="160" cy="90" r="4" fill="#ef4444" />
        <line x1="155" y1="85" x2="165" y2="95" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        <line x1="165" y1="85" x2="155" y2="95" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
      </g>
      
      {/* Gradient defs */}
      <defs>
        <linearGradient id="brokenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="70%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Random tickers floating by (decorative)
function FloatingTickers() {
  const tickers = ['$LOST', '$GONE', '$NULL', '$VOID', '$ERR', '$NaN', '$404'];
  
  return (
    <div className="floating-tickers" aria-hidden="true">
      {tickers.map((ticker, i) => (
        <span 
          key={ticker}
          className="floating-ticker"
          style={{
            animationDelay: `${i * 1.5}s`,
            left: `${10 + (i * 12)}%`,
          }}
        >
          {ticker}
        </span>
      ))}
    </div>
  );
}

export default function NotFound() {
  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden not-found-page">
      {/* Background effects */}
      <FloatingParticles count={25} speed={0.15} maxSize={2} minSize={1} />
      <GrainOverlay opacity={0.03} animate={true} blendMode="overlay" />
      <FloatingTickers />
      
      {/* Ambient glow */}
      <div className="not-found-ambient-glow" aria-hidden="true" />
      
      {/* Main content */}
      <div className="not-found-content">
        {/* Broken chart illustration */}
        <div className="not-found-chart-wrapper">
          <BrokenChart />
        </div>
        
        {/* Glitchy 404 */}
        <Glitch404 />
        
        {/* Message */}
        <div className="not-found-message">
          <h1 className="not-found-title">
            Page Not Found
          </h1>
          <p className="not-found-description">
            This ticker doesn't exist in our universe.
            <br />
            The market data you're looking for has gone missing.
          </p>
        </div>
        
        {/* CTA */}
        <div className="not-found-actions">
          <Link href="/">
            <MagneticButton 
              className="not-found-btn-primary"
              intensity={0.3}
              radius={1.5}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Calendar
            </MagneticButton>
          </Link>
        </div>
        
        {/* Subtle hint */}
        <p className="not-found-hint">
          Error code: <span className="font-mono text-red-400/70">TICKER_NOT_FOUND</span>
        </p>
      </div>
    </div>
  );
}
