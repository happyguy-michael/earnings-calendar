import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { NavigationProgress } from "@/components/NavigationProgress";
import { CursorSpotlight } from "@/components/CursorSpotlight";
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
        {/* Skip to main content - accessibility */}
        <a href="#main-content" className="skip-to-main">
          Skip to main content
        </a>
        <CursorSpotlight />
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <main id="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}
