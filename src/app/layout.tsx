import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { NavigationProgress } from "@/components/NavigationProgress";
import { CursorSpotlight } from "@/components/CursorSpotlight";
import { MeshGradient } from "@/components/MeshGradient";
import { ClientProviders } from "@/components/ClientProviders";
import { AnimatedFocusRing, SkipLink } from "@/components/AnimatedFocusRing";
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
      <body className="antialiased min-h-screen">
        {/* Animated focus ring system for keyboard accessibility */}
        <AnimatedFocusRing />
        {/* Skip to main content - accessibility */}
        <SkipLink targetId="main-content" />
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
