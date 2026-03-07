'use client';

import { useState, useEffect, useRef } from 'react';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
  blurAmount?: number;
  transitionDuration?: number;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * ProgressiveImage
 * 
 * Loads images with a premium blur-to-sharp transition effect.
 * Shows a subtle skeleton shimmer while loading, then fades in
 * the image with a blur reduction animation.
 * 
 * Features:
 * - Smooth blur-to-sharp transition on load
 * - Graceful fallback on error (initials or placeholder)
 * - Shimmer skeleton while loading
 * - Respects prefers-reduced-motion
 * - Intersection observer for lazy loading
 * 
 * 2026 Trend: Progressive enhancement, perceived performance
 */
export function ProgressiveImage({
  src,
  alt,
  fallback,
  className = '',
  blurAmount = 10,
  transitionDuration = 400,
  onLoad,
  onError,
}: ProgressiveImageProps) {
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [isInView, setIsInView] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Lazy load with intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Handle image load
  const handleLoad = () => {
    setLoadState('loaded');
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    setLoadState('error');
    onError?.();
  };

  // Generate initials from alt text for fallback
  const getInitials = () => {
    return alt
      .split(/\s+/)
      .map(word => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const showShimmer = loadState === 'loading' && isInView;
  const showImage = loadState === 'loaded';
  const showFallback = loadState === 'error';

  return (
    <div 
      ref={containerRef}
      className={`progressive-image-container ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Shimmer skeleton while loading */}
      <div 
        className="progressive-image-shimmer"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)',
          backgroundSize: '200% 100%',
          animation: showShimmer ? 'shimmer-sweep 1.5s infinite' : 'none',
          opacity: showShimmer ? 1 : 0,
          transition: `opacity ${transitionDuration / 2}ms ease`,
          borderRadius: 'inherit',
        }}
      />

      {/* Actual image with blur transition */}
      {isInView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className="progressive-image"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: prefersReducedMotion 
              ? 'none' 
              : showImage ? 'blur(0)' : `blur(${blurAmount}px)`,
            opacity: showImage ? 1 : 0,
            transform: prefersReducedMotion 
              ? 'none' 
              : showImage ? 'scale(1)' : 'scale(1.1)',
            transition: prefersReducedMotion 
              ? 'opacity 150ms ease' 
              : `filter ${transitionDuration}ms cubic-bezier(0.16, 1, 0.3, 1), 
                 opacity ${transitionDuration}ms ease, 
                 transform ${transitionDuration}ms cubic-bezier(0.16, 1, 0.3, 1)`,
          }}
        />
      )}

      {/* Fallback for error state */}
      {showFallback && (
        <div 
          className="progressive-image-fallback"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
            animation: 'fade-in 200ms ease',
          }}
        >
          {fallback || getInitials()}
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer-sweep {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/**
 * CompanyLogo
 * 
 * Specialized progressive image for company logos with
 * Clearbit integration and smart fallbacks.
 */
interface CompanyLogoProps {
  ticker: string;
  company: string;
  size?: number;
  className?: string;
}

export function CompanyLogo({
  ticker,
  company,
  size = 40,
  className = '',
}: CompanyLogoProps) {
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Domain extraction for Clearbit
  const getDomain = () => {
    // Clean company name for domain guess
    const cleanName = company
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/(inc|corp|ltd|llc|co|company|holdings|group)$/i, '');
    return `${cleanName}.com`;
  };

  const logoUrl = `https://logo.clearbit.com/${getDomain()}`;

  // Lazy load
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Get initials
  const getInitials = () => ticker.slice(0, 2).toUpperCase();

  // Color based on ticker (consistent per ticker)
  const getAccentColor = () => {
    const hash = ticker.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 50%, 50%)`;
  };

  const showLoading = loadState === 'loading' && isInView;
  const showImage = loadState === 'loaded';
  const showFallback = loadState === 'error';

  return (
    <div
      ref={containerRef}
      className={`company-logo ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        flexShrink: 0,
      }}
    >
      {/* Shimmer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.05) 50%, transparent 75%)',
          backgroundSize: '200% 100%',
          animation: showLoading ? 'logo-shimmer 1.5s infinite' : 'none',
          opacity: showLoading ? 1 : 0,
          transition: 'opacity 200ms ease',
        }}
      />

      {/* Image */}
      {isInView && (
        <img
          src={logoUrl}
          alt={`${ticker} logo`}
          onLoad={() => setLoadState('loaded')}
          onError={() => setLoadState('error')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            padding: size > 32 ? 8 : 6,
            filter: showImage ? 'blur(0)' : 'blur(8px)',
            opacity: showImage ? 1 : 0,
            transform: showImage ? 'scale(1)' : 'scale(1.1)',
            transition: 'filter 300ms ease, opacity 300ms ease, transform 300ms ease',
          }}
        />
      )}

      {/* Fallback initials */}
      {showFallback && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${getAccentColor()}20 0%, ${getAccentColor()}10 100%)`,
            color: getAccentColor(),
            fontSize: size > 32 ? '0.875rem' : '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.03em',
            animation: 'logo-fade-in 200ms ease',
          }}
        >
          {getInitials()}
        </div>
      )}

      <style jsx>{`
        @keyframes logo-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes logo-fade-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

/**
 * Hook for preloading images
 */
export function useImagePreloader(urls: string[]) {
  const [loaded, setLoaded] = useState<Set<string>>(new Set());
  const [failed, setFailed] = useState<Set<string>>(new Set());

  useEffect(() => {
    urls.forEach(url => {
      if (loaded.has(url) || failed.has(url)) return;
      
      const img = new Image();
      img.onload = () => setLoaded(prev => new Set(prev).add(url));
      img.onerror = () => setFailed(prev => new Set(prev).add(url));
      img.src = url;
    });
  }, [urls, loaded, failed]);

  return {
    loaded,
    failed,
    isLoaded: (url: string) => loaded.has(url),
    isFailed: (url: string) => failed.has(url),
    progress: urls.length > 0 
      ? (loaded.size + failed.size) / urls.length 
      : 1,
  };
}
