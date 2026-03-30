'use client';

import Script from 'next/script';
import { useMemo } from 'react';

/**
 * StructuredData - JSON-LD structured data for SEO
 * 
 * Adds machine-readable schema.org markup for:
 * - WebSite: Basic site info for search engines
 * - WebApplication: App metadata for rich results
 * - ItemList: Earnings events as a list of financial events
 * 
 * Benefits:
 * - Better search engine understanding
 * - Potential for rich snippets in search results
 * - Enhanced discoverability for financial data seekers
 * - Google Finance / Bloomberg Terminal integration potential
 * 
 * 2026 Trend: Structured data is increasingly important for AI-powered
 * search engines (SearchGPT, Perplexity, etc.) that rely on semantic markup.
 */

interface EarningEvent {
  ticker: string;
  company: string;
  date: string;
  time?: string;
  eps?: number | null;
  estimate?: number | null;
  result?: 'beat' | 'miss' | 'met' | null;
  beatOdds?: number;
}

interface StructuredDataProps {
  /** Page URL (defaults to current) */
  url?: string;
  /** Earnings data for ItemList schema */
  earnings?: EarningEvent[];
  /** Current date range being displayed */
  dateRange?: { start: string; end: string };
}

export function StructuredData({ 
  url = 'https://earnings-calendar-omega.vercel.app',
  earnings = [],
  dateRange,
}: StructuredDataProps) {
  
  const structuredData = useMemo(() => {
    // WebSite schema - basic site info
    const webSiteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Earnings Calendar',
      description: 'Track earnings reports with AI-powered beat predictions and real-time market data',
      url: url,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${url}?search={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    };

    // WebApplication schema - app metadata
    const webAppSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Earnings Calendar',
      description: 'Premium earnings tracking with beat probability predictions, real-time countdown timers, and beautiful visualizations',
      url: url,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'AI-powered beat probability predictions',
        'Real-time earnings countdown timers',
        'Pre-market and after-hours session tracking',
        'Beat/miss result visualization',
        'Historical EPS trend analysis',
        'Dark and light mode themes',
        'Keyboard navigation shortcuts',
        'Mobile-responsive design',
      ],
    };

    // ItemList schema - earnings as financial events
    // Only include upcoming earnings (with beatOdds) for relevance
    const upcomingEarnings = earnings
      .filter(e => e.eps === undefined || e.eps === null)
      .slice(0, 10); // Limit to 10 for performance

    const reportedEarnings = earnings
      .filter(e => e.eps !== undefined && e.eps !== null)
      .slice(0, 10);

    const earningsListSchema = upcomingEarnings.length > 0 ? {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Upcoming Earnings Reports',
      description: dateRange 
        ? `Earnings reports scheduled for ${dateRange.start} to ${dateRange.end}`
        : 'Upcoming stock earnings report announcements',
      numberOfItems: upcomingEarnings.length,
      itemListElement: upcomingEarnings.map((earning, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Event',
          name: `${earning.ticker} Earnings Report`,
          description: `${earning.company} (${earning.ticker}) quarterly earnings announcement${earning.beatOdds ? ` - ${earning.beatOdds}% beat probability` : ''}`,
          startDate: earning.date,
          eventStatus: 'https://schema.org/EventScheduled',
          eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
          location: {
            '@type': 'VirtualLocation',
            url: `${url}/report/${earning.ticker}`,
          },
          organizer: {
            '@type': 'Organization',
            name: earning.company,
            tickerSymbol: earning.ticker,
          },
          ...(earning.estimate && {
            offers: {
              '@type': 'AggregateOffer',
              description: `Analyst consensus EPS estimate: $${earning.estimate.toFixed(2)}`,
            },
          }),
        },
      })),
    } : null;

    // Recent results schema
    const resultsListSchema = reportedEarnings.length > 0 ? {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Recent Earnings Results',
      description: 'Recently reported stock earnings with beat/miss analysis',
      numberOfItems: reportedEarnings.length,
      itemListElement: reportedEarnings.map((earning, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Event',
          name: `${earning.ticker} Earnings Result`,
          description: `${earning.company} reported ${earning.result === 'beat' ? 'beat' : earning.result === 'miss' ? 'miss' : 'met estimates'} - EPS: $${earning.eps?.toFixed(2)}${earning.estimate ? ` vs $${earning.estimate.toFixed(2)} estimate` : ''}`,
          startDate: earning.date,
          eventStatus: 'https://schema.org/EventScheduled',
          location: {
            '@type': 'VirtualLocation',
            url: `${url}/report/${earning.ticker}`,
          },
        },
      })),
    } : null;

    // FAQPage schema - common questions about earnings
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is an earnings report?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'An earnings report is a quarterly filing that publicly traded companies release to disclose their financial performance, including revenue, earnings per share (EPS), and guidance for future periods.',
          },
        },
        {
          '@type': 'Question',
          name: 'What does it mean when a company beats earnings?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A company "beats" earnings when their reported EPS (earnings per share) exceeds the consensus analyst estimate. This typically results in positive stock price movement.',
          },
        },
        {
          '@type': 'Question',
          name: 'When are earnings typically released?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Earnings are typically released either before market open (pre-market, around 7-9 AM ET) or after market close (after-hours, around 4-5 PM ET). Most companies report within 45 days of quarter end.',
          },
        },
      ],
    };

    return {
      webSite: webSiteSchema,
      webApp: webAppSchema,
      earningsList: earningsListSchema,
      resultsList: resultsListSchema,
      faq: faqSchema,
    };
  }, [url, earnings, dateRange]);

  return (
    <>
      {/* WebSite schema */}
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData.webSite) }}
      />
      
      {/* WebApplication schema */}
      <Script
        id="webapp-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData.webApp) }}
      />
      
      {/* Upcoming earnings list */}
      {structuredData.earningsList && (
        <Script
          id="earnings-list-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData.earningsList) }}
        />
      )}
      
      {/* Recent results list */}
      {structuredData.resultsList && (
        <Script
          id="results-list-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData.resultsList) }}
        />
      )}
      
      {/* FAQ schema */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData.faq) }}
      />
    </>
  );
}

/**
 * EarningsReportStructuredData - Schema for individual report pages
 */
interface ReportStructuredDataProps {
  ticker: string;
  company: string;
  date: string;
  time?: string;
  eps?: number | null;
  estimate?: number | null;
  revenue?: number | null;
  revenueEstimate?: number | null;
  result?: 'beat' | 'miss' | 'met' | null;
  beatOdds?: number;
  priceMove?: number;
}

export function EarningsReportStructuredData({
  ticker,
  company,
  date,
  time,
  eps,
  estimate,
  revenue,
  revenueEstimate,
  result,
  beatOdds,
  priceMove,
}: ReportStructuredDataProps) {
  const hasResult = eps !== undefined && eps !== null;
  const url = `https://earnings-calendar-omega.vercel.app/report/${ticker}`;
  
  const reportSchema = useMemo(() => {
    const baseSchema = {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: `${company} (${ticker}) Earnings Report`,
      description: hasResult
        ? `${company} reported ${result === 'beat' ? 'beat' : result === 'miss' ? 'miss' : 'met estimates'} - EPS: $${eps?.toFixed(2)}${estimate ? ` vs $${estimate.toFixed(2)} estimate` : ''}${priceMove ? ` | Stock moved ${priceMove > 0 ? '+' : ''}${priceMove.toFixed(1)}%` : ''}`
        : `${company} (${ticker}) quarterly earnings announcement${beatOdds ? ` - ${beatOdds}% beat probability` : ''}`,
      startDate: date,
      eventStatus: hasResult 
        ? 'https://schema.org/EventScheduled'
        : 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
      location: {
        '@type': 'VirtualLocation',
        url: url,
      },
      organizer: {
        '@type': 'Organization',
        name: company,
        tickerSymbol: ticker,
      },
      url: url,
    };

    // Add financial metrics if available
    if (hasResult) {
      return {
        ...baseSchema,
        recordedIn: {
          '@type': 'CreativeWork',
          name: `${ticker} Q${getQuarter(date)} ${getYear(date)} Earnings`,
          description: `Earnings per share: $${eps?.toFixed(2)}${revenue ? ` | Revenue: $${(revenue * 1e9).toLocaleString()}` : ''}`,
        },
      };
    }

    return baseSchema;
  }, [ticker, company, date, time, eps, estimate, revenue, revenueEstimate, result, beatOdds, priceMove, hasResult, url]);

  // BreadcrumbList for navigation
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Earnings Calendar',
        item: 'https://earnings-calendar-omega.vercel.app',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: `${ticker} Report`,
        item: url,
      },
    ],
  };

  return (
    <>
      <Script
        id="report-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reportSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}

// Helper functions
function getQuarter(dateStr: string): number {
  const month = new Date(dateStr).getMonth();
  return Math.floor(month / 3) + 1;
}

function getYear(dateStr: string): number {
  return new Date(dateStr).getFullYear();
}

export default StructuredData;
