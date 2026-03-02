'use client';

import { useEffect, useState } from 'react';

/**
 * MeshGradient - Animated Floating Blob Background
 * 
 * Premium ambient background effect with softly drifting color blobs
 * that blend together to create a living mesh gradient effect.
 * 
 * Features:
 * - Multiple animated blobs with different colors, sizes, and speeds
 * - Smooth organic movement using CSS animations
 * - Gaussian blur for soft edges and blending
 * - Theme-aware colors (darker in light mode)
 * - Respects prefers-reduced-motion
 * - Hardware-accelerated transforms
 * - Subtle enough to not distract from content
 * 
 * Inspired by: Linear.app, Vercel.com, Stripe.com
 */
export function MeshGradient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="mesh-gradient-container" aria-hidden="true">
      {/* Primary blue blob - top left */}
      <div className="mesh-blob mesh-blob-1" />
      
      {/* Purple blob - top right */}
      <div className="mesh-blob mesh-blob-2" />
      
      {/* Pink blob - bottom center */}
      <div className="mesh-blob mesh-blob-3" />
      
      {/* Teal accent blob - center left */}
      <div className="mesh-blob mesh-blob-4" />
      
      {/* Deep purple blob - center */}
      <div className="mesh-blob mesh-blob-5" />
    </div>
  );
}
