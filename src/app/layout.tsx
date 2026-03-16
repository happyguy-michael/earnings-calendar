import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import Script from "next/script";
import { NavigationProgress } from "@/components/NavigationProgress";
import { CursorSpotlight } from "@/components/CursorSpotlight";
import { MeshGradient } from "@/components/MeshGradient";
import { AmbientBackground } from "@/components/AmbientBackground";
import { ClientProviders } from "@/components/ClientProviders";
import { AnimatedFocusRing, SkipLink } from "@/components/AnimatedFocusRing";
import { ScrollDrivenAnimations } from "@/components/ScrollDrivenAnimations";
import { StickyStateStyle } from "@/components/StickyStateStyle";
import { BalloonTooltipStyles } from "@/components/BalloonTooltip";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Earnings Calendar | Track Stock Reports",
  description: "Track earnings reports with AI-powered analysis and beat predictions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        {/* Declarative Shadow DOM feature detection for NumberFlow styling */}
        <Script id="dsd-detection" strategy="beforeInteractive">{`
          if (
            HTMLTemplateElement.prototype.hasOwnProperty('shadowRootMode') ||
            HTMLTemplateElement.prototype.hasOwnProperty('shadowRoot')
          ) document.documentElement.setAttribute('data-supports-dsd', '')
        `}</Script>
      </head>
      <body className="antialiased min-h-screen">
        {/* Animated focus ring system for keyboard accessibility */}
        <AnimatedFocusRing />
        {/* Scroll-driven animations for modern scroll effects */}
        <ScrollDrivenAnimations />
        {/* CSS scroll-state queries for sticky element detection */}
        <StickyStateStyle />
        {/* Balloon tooltip morph animation styles */}
        <BalloonTooltipStyles />
        {/* Skip to main content - accessibility */}
        <SkipLink targetId="main-content" />
        {/* Time-aware ambient background gradients */}
        <AmbientBackground />
        <MeshGradient />
        <CursorSpotlight />
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <ClientProviders>
          <main id="main-content">
            {children}
          </main>
        </ClientProviders>
      </body>
    </html>
  );
}
