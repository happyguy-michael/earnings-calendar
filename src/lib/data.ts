import { Earning, Analysis } from './types';

export const earnings: Earning[] = [
  // Week of Feb 24
  { ticker: 'DPZ', company: "Domino's Pizza", date: '2026-02-23', time: 'pre', eps: 5.39, estimate: 5.45, result: 'miss' },
  { ticker: 'HD', company: 'Home Depot', date: '2026-02-24', time: 'pre', eps: 2.52, estimate: 2.48, result: 'beat' },
  { ticker: 'HIMS', company: 'Hims & Hers Health', date: '2026-02-24', time: 'post', eps: 0.05, estimate: 0.04, result: 'beat' },
  { ticker: 'LOW', company: "Lowe's", date: '2026-02-25', time: 'pre', eps: 1.90, estimate: 1.95, result: 'miss' },
  { ticker: 'AMC', company: 'AMC Entertainment', date: '2026-02-25', time: 'post', eps: -0.25, estimate: -0.30, result: 'beat' },
  { ticker: 'WDAY', company: 'Workday', date: '2026-02-25', time: 'post', eps: 2.32, estimate: 2.25, result: 'beat' },
  { ticker: 'HPQ', company: 'HP Inc.', date: '2026-02-25', time: 'post', eps: 0.77, estimate: 0.75, result: 'beat' },
  { ticker: 'NVDA', company: 'NVIDIA', date: '2026-02-26', time: 'post', estimate: 1.52, beatOdds: 94 },
  { ticker: 'ZM', company: 'Zoom Video', date: '2026-02-26', time: 'post', estimate: 1.49, beatOdds: 32 },
  { ticker: 'SNOW', company: 'Snowflake', date: '2026-02-26', time: 'post', estimate: 0.27, beatOdds: 92 },
  { ticker: 'CRM', company: 'Salesforce', date: '2026-02-26', time: 'post', estimate: 3.05, beatOdds: 85 },
  { ticker: 'TTD', company: 'The Trade Desk', date: '2026-02-26', time: 'post', estimate: 0.58, beatOdds: 77 },
  { ticker: 'CELH', company: 'Celsius Holdings', date: '2026-02-26', time: 'pre', estimate: 0.19, beatOdds: 52 },
  { ticker: 'WBD', company: 'Warner Bros Discovery', date: '2026-02-26', time: 'pre', estimate: 0.00, beatOdds: 27 },
  { ticker: 'SHAK', company: 'Shake Shack', date: '2026-02-26', time: 'pre', estimate: 0.35, beatOdds: 62 },
  { ticker: 'MNST', company: 'Monster Beverage', date: '2026-02-27', time: 'post', estimate: 0.48, beatOdds: 74 },
  { ticker: 'INTU', company: 'Intuit', date: '2026-02-27', time: 'post', estimate: 3.68, beatOdds: 89 },
  { ticker: 'DELL', company: 'Dell Technologies', date: '2026-02-27', time: 'post', estimate: 3.52, beatOdds: 84 },
  { ticker: 'ADSK', company: 'Autodesk', date: '2026-02-27', time: 'post', estimate: 2.64, beatOdds: 85 },
  { ticker: 'RKLB', company: 'Rocket Lab', date: '2026-02-27', time: 'post', estimate: -0.10, beatOdds: 61 },
  // Week of Mar 3
  { ticker: 'TGT', company: 'Target', date: '2026-03-03', time: 'pre', estimate: 1.85, beatOdds: 65 },
  { ticker: 'CRWD', company: 'CrowdStrike', date: '2026-03-04', time: 'post', estimate: 0.95, beatOdds: 88 },
  { ticker: 'AVGO', company: 'Broadcom', date: '2026-03-05', time: 'post', estimate: 14.50, beatOdds: 82 },
  { ticker: 'COST', company: 'Costco', date: '2026-03-06', time: 'post', estimate: 4.10, beatOdds: 78 },
  { ticker: 'MDB', company: 'MongoDB', date: '2026-03-05', time: 'post', estimate: 0.72, beatOdds: 71 },
  { ticker: 'OKTA', company: 'Okta', date: '2026-03-05', time: 'post', estimate: 0.85, beatOdds: 68 },
];

export const analyses: Record<string, Analysis> = {
  HD: {
    ticker: 'HD',
    generatedAt: '2026-02-24T18:00:00Z',
    summary: `Home Depot delivered a solid Q4 beat with EPS of $2.52 vs $2.48 expected, driven by strong Pro customer demand and improving housing turnover trends.

Same-store sales increased 1.2% year-over-year, marking the third consecutive quarter of positive comps after a challenging 2024. The Pro segment continued to outperform DIY, with large project activity showing particular strength.

Management raised FY2026 guidance citing expectations of continued housing market normalization and easing interest rate pressures benefiting big-ticket purchases.`,
    keyPoints: [
      { sentiment: 'up', text: 'EPS beat estimates by 1.6% ($2.52 vs $2.48)' },
      { sentiment: 'up', text: 'Same-store sales returned to growth at +1.2% YoY' },
      { sentiment: 'up', text: 'Pro customer segment showed double-digit growth' },
      { sentiment: 'neutral', text: 'DIY segment remains soft but stabilizing' },
      { sentiment: 'up', text: 'FY2026 guidance raised above consensus' },
    ],
    revenue: { actual: 39.7, estimate: 39.2, unit: 'B' },
    guidance: 'raised',
  },
  WDAY: {
    ticker: 'WDAY',
    generatedAt: '2026-02-25T22:00:00Z',
    summary: `Workday exceeded expectations with EPS of $2.32 vs $2.25 consensus, driven by accelerating subscription revenue growth and expanding margins.

Subscription revenue grew 18% year-over-year to $1.94B, with strong large enterprise wins in both HCM and Financial Management. Net revenue retention remained above 100%, indicating healthy upsell activity.

The company highlighted growing AI adoption within its platform, with over 50% of customers now using AI-powered features. Management noted AI is becoming a key differentiator in competitive deals.`,
    keyPoints: [
      { sentiment: 'up', text: 'EPS beat by 3.1% ($2.32 vs $2.25 estimate)' },
      { sentiment: 'up', text: 'Subscription revenue grew 18% YoY to $1.94B' },
      { sentiment: 'up', text: 'AI adoption accelerating with 50%+ customer penetration' },
      { sentiment: 'up', text: 'Large enterprise deal momentum continues' },
      { sentiment: 'neutral', text: 'Operating margins expanded 150bps YoY' },
    ],
    revenue: { actual: 2.15, estimate: 2.10, unit: 'B' },
    guidance: 'maintained',
  },
};

export function getEarning(ticker: string): Earning | undefined {
  return earnings.find(e => e.ticker.toUpperCase() === ticker.toUpperCase());
}

export function getAnalysis(ticker: string): Analysis | undefined {
  return analyses[ticker.toUpperCase()];
}

export function getEarningsByDate(date: string): Earning[] {
  return earnings.filter(e => e.date === date);
}
