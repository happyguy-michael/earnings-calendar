import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Earnings Calendar",
  description: "Track earnings reports with AI-powered analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
