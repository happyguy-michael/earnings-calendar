import { Earning, Analysis } from './types';

export const earnings: Earning[] = [
  // ===== JANUARY 2026 =====
  // Week of Jan 13
  { ticker: 'JPM', company: 'JPMorgan Chase', date: '2026-01-14', time: 'pre', eps: 4.81, estimate: 4.53, result: 'beat', revenue: 44.2, revenueEstimate: 42.8 },
  { ticker: 'WFC', company: 'Wells Fargo', date: '2026-01-14', time: 'pre', eps: 1.58, estimate: 1.43, result: 'beat', revenue: 20.8, revenueEstimate: 20.5 },
  { ticker: 'GS', company: 'Goldman Sachs', date: '2026-01-15', time: 'pre', eps: 11.95, estimate: 8.65, result: 'beat', revenue: 13.9, revenueEstimate: 12.4 },
  { ticker: 'BAC', company: 'Bank of America', date: '2026-01-16', time: 'pre', eps: 0.82, estimate: 0.77, result: 'beat', revenue: 25.3, revenueEstimate: 25.0 },
  { ticker: 'MS', company: 'Morgan Stanley', date: '2026-01-16', time: 'pre', eps: 2.22, estimate: 1.87, result: 'beat', revenue: 16.2, revenueEstimate: 15.1 },
  { ticker: 'TSM', company: 'TSMC', date: '2026-01-16', time: 'pre', eps: 2.24, estimate: 2.18, result: 'beat', revenue: 26.4, revenueEstimate: 25.8 },
  { ticker: 'UNH', company: 'UnitedHealth', date: '2026-01-16', time: 'pre', eps: 6.81, estimate: 6.72, result: 'beat', revenue: 100.8, revenueEstimate: 99.5 },
  
  // Week of Jan 20
  { ticker: 'NFLX', company: 'Netflix', date: '2026-01-21', time: 'post', eps: 4.27, estimate: 4.20, result: 'beat', revenue: 10.2, revenueEstimate: 10.1 },
  { ticker: 'JNJ', company: 'Johnson & Johnson', date: '2026-01-22', time: 'pre', eps: 2.04, estimate: 2.02, result: 'beat', revenue: 22.5, revenueEstimate: 22.3 },
  { ticker: 'ASML', company: 'ASML', date: '2026-01-22', time: 'pre', eps: 6.89, estimate: 6.78, result: 'beat', revenue: 9.3, revenueEstimate: 9.1 },
  { ticker: 'GE', company: 'GE Aerospace', date: '2026-01-23', time: 'pre', eps: 1.32, estimate: 1.18, result: 'beat', revenue: 9.9, revenueEstimate: 9.5 },
  { ticker: 'TSLA', company: 'Tesla', date: '2026-01-23', time: 'post', eps: 0.66, estimate: 0.76, result: 'miss', revenue: 25.7, revenueEstimate: 25.5 },
  { ticker: 'IBM', company: 'IBM', date: '2026-01-23', time: 'post', eps: 3.92, estimate: 3.78, result: 'beat', revenue: 17.5, revenueEstimate: 17.2 },
  
  // Week of Jan 27
  { ticker: 'AAPL', company: 'Apple', date: '2026-01-28', time: 'post', eps: 2.35, estimate: 2.36, result: 'miss', revenue: 124.3, revenueEstimate: 124.1 },
  { ticker: 'MSFT', company: 'Microsoft', date: '2026-01-28', time: 'post', eps: 3.23, estimate: 3.11, result: 'beat', revenue: 69.6, revenueEstimate: 68.8 },
  { ticker: 'META', company: 'Meta Platforms', date: '2026-01-29', time: 'post', eps: 8.02, estimate: 6.77, result: 'beat', revenue: 48.4, revenueEstimate: 46.9 },
  { ticker: 'AMZN', company: 'Amazon', date: '2026-01-30', time: 'post', eps: 1.86, estimate: 1.82, result: 'beat', revenue: 187.8, revenueEstimate: 185.5 },
  { ticker: 'GOOGL', company: 'Alphabet', date: '2026-01-30', time: 'post', eps: 2.15, estimate: 2.08, result: 'beat', revenue: 96.5, revenueEstimate: 95.2 },
  
  // ===== FEBRUARY 2026 =====
  // Week of Feb 3
  { ticker: 'AMD', company: 'AMD', date: '2026-02-04', time: 'post', eps: 1.09, estimate: 1.07, result: 'beat', revenue: 7.5, revenueEstimate: 7.3 },
  { ticker: 'QCOM', company: 'Qualcomm', date: '2026-02-05', time: 'post', eps: 3.41, estimate: 3.12, result: 'beat', revenue: 11.4, revenueEstimate: 10.9 },
  { ticker: 'ARM', company: 'Arm Holdings', date: '2026-02-05', time: 'post', eps: 0.39, estimate: 0.35, result: 'beat', revenue: 0.98, revenueEstimate: 0.94 },
  { ticker: 'UBER', company: 'Uber', date: '2026-02-05', time: 'pre', eps: 0.42, estimate: 0.39, result: 'beat', revenue: 11.2, revenueEstimate: 10.8 },
  { ticker: 'DIS', company: 'Disney', date: '2026-02-06', time: 'pre', eps: 1.76, estimate: 1.45, result: 'beat', revenue: 24.7, revenueEstimate: 24.1 },
  { ticker: 'LLY', company: 'Eli Lilly', date: '2026-02-06', time: 'pre', eps: 5.32, estimate: 5.14, result: 'beat', revenue: 13.5, revenueEstimate: 12.9 },
  
  // Week of Feb 10
  { ticker: 'KO', company: 'Coca-Cola', date: '2026-02-11', time: 'pre', eps: 0.55, estimate: 0.52, result: 'beat', revenue: 11.5, revenueEstimate: 11.3 },
  { ticker: 'SHOP', company: 'Shopify', date: '2026-02-11', time: 'pre', eps: 0.44, estimate: 0.39, result: 'beat', revenue: 2.8, revenueEstimate: 2.65 },
  { ticker: 'CSCO', company: 'Cisco', date: '2026-02-12', time: 'post', eps: 0.94, estimate: 0.91, result: 'beat', revenue: 14.2, revenueEstimate: 14.0 },
  { ticker: 'COIN', company: 'Coinbase', date: '2026-02-13', time: 'post', eps: 4.68, estimate: 1.89, result: 'beat', revenue: 2.27, revenueEstimate: 1.78 },
  { ticker: 'AMAT', company: 'Applied Materials', date: '2026-02-13', time: 'post', eps: 2.38, estimate: 2.29, result: 'beat', revenue: 7.2, revenueEstimate: 7.0 },
  { ticker: 'ROKU', company: 'Roku', date: '2026-02-13', time: 'post', eps: 1.17, estimate: 0.98, result: 'beat', revenue: 1.06, revenueEstimate: 0.98 },
  
  // Week of Feb 17
  { ticker: 'WMT', company: 'Walmart', date: '2026-02-18', time: 'pre', eps: 0.66, estimate: 0.64, result: 'beat', revenue: 180.5, revenueEstimate: 178.2 },
  { ticker: 'PANW', company: 'Palo Alto Networks', date: '2026-02-18', time: 'post', eps: 0.81, estimate: 0.77, result: 'beat', revenue: 2.35, revenueEstimate: 2.28 },
  { ticker: 'BKNG', company: 'Booking Holdings', date: '2026-02-19', time: 'post', eps: 41.55, estimate: 38.28, result: 'beat', revenue: 5.9, revenueEstimate: 5.7 },
  { ticker: 'MCD', company: "McDonald's", date: '2026-02-19', time: 'pre', eps: 2.83, estimate: 2.86, result: 'miss', revenue: 6.4, revenueEstimate: 6.5 },
  
  // Week of Feb 24
  { ticker: 'DPZ', company: "Domino's Pizza", date: '2026-02-24', time: 'pre', eps: 5.39, estimate: 5.45, result: 'miss', revenue: 1.48, revenueEstimate: 1.52 },
  { ticker: 'HD', company: 'Home Depot', date: '2026-02-24', time: 'pre', eps: 2.52, estimate: 2.48, result: 'beat', revenue: 39.7, revenueEstimate: 39.2 },
  { ticker: 'HIMS', company: 'Hims & Hers Health', date: '2026-02-24', time: 'post', eps: 0.11, estimate: 0.05, result: 'beat', revenue: 0.48, revenueEstimate: 0.44 },
  { ticker: 'LOW', company: "Lowe's", date: '2026-02-25', time: 'pre', eps: 1.93, estimate: 1.88, result: 'beat', revenue: 18.6, revenueEstimate: 18.3 },
  { ticker: 'TJX', company: 'TJX Companies', date: '2026-02-25', time: 'pre', eps: 1.24, estimate: 1.18, result: 'beat', revenue: 16.4, revenueEstimate: 16.1 },
  { ticker: 'WDAY', company: 'Workday', date: '2026-02-25', time: 'post', eps: 2.32, estimate: 2.25, result: 'beat', revenue: 2.15, revenueEstimate: 2.10 },
  { ticker: 'NVDA', company: 'NVIDIA', date: '2026-02-26', time: 'post', estimate: 0.89, beatOdds: 94, revenueEstimate: 38.5 },
  { ticker: 'CRM', company: 'Salesforce', date: '2026-02-26', time: 'post', estimate: 2.61, beatOdds: 85, revenueEstimate: 10.1 },
  { ticker: 'SNOW', company: 'Snowflake', date: '2026-02-26', time: 'post', estimate: 0.18, beatOdds: 78, revenueEstimate: 0.92 },
  { ticker: 'OKTA', company: 'Okta', date: '2026-02-26', time: 'post', estimate: 0.74, beatOdds: 71, revenueEstimate: 0.68 },
  { ticker: 'ZM', company: 'Zoom Video', date: '2026-02-26', time: 'post', estimate: 1.31, beatOdds: 65, revenueEstimate: 1.18 },
  { ticker: 'MNST', company: 'Monster Beverage', date: '2026-02-27', time: 'post', estimate: 0.46, beatOdds: 74, revenueEstimate: 1.85 },
  { ticker: 'DELL', company: 'Dell Technologies', date: '2026-02-27', time: 'post', estimate: 2.53, beatOdds: 82, revenueEstimate: 24.8 },
  
  // ===== MARCH 2026 =====
  { ticker: 'TGT', company: 'Target', date: '2026-03-04', time: 'pre', estimate: 2.41, beatOdds: 58, revenueEstimate: 30.5 },
  { ticker: 'CRWD', company: 'CrowdStrike', date: '2026-03-05', time: 'post', estimate: 0.85, beatOdds: 88, revenueEstimate: 1.05 },
  { ticker: 'AVGO', company: 'Broadcom', date: '2026-03-06', time: 'post', estimate: 1.51, beatOdds: 82, revenueEstimate: 14.6 },
  { ticker: 'COST', company: 'Costco', date: '2026-03-06', time: 'post', estimate: 4.08, beatOdds: 78, revenueEstimate: 62.5 },
  { ticker: 'MDB', company: 'MongoDB', date: '2026-03-06', time: 'post', estimate: 0.68, beatOdds: 71, revenueEstimate: 0.52 },
  
  // Week of Mar 10 (current week)
  { ticker: 'ORCL', company: 'Oracle', date: '2026-03-11', time: 'post', estimate: 1.48, beatOdds: 76, revenueEstimate: 14.4 },
  { ticker: 'ADBE', company: 'Adobe', date: '2026-03-12', time: 'post', estimate: 4.97, beatOdds: 81, revenueEstimate: 5.65 },
  { ticker: 'S', company: 'SentinelOne', date: '2026-03-12', time: 'post', estimate: 0.02, beatOdds: 68, revenueEstimate: 0.22 },
  { ticker: 'DG', company: 'Dollar General', date: '2026-03-13', time: 'pre', estimate: 1.48, beatOdds: 55, revenueEstimate: 10.2 },
  { ticker: 'ULTA', company: 'Ulta Beauty', date: '2026-03-13', time: 'post', estimate: 8.12, beatOdds: 72, revenueEstimate: 3.55 },
  
  // Week of Mar 17
  { ticker: 'FDX', company: 'FedEx', date: '2026-03-17', time: 'post', estimate: 4.62, beatOdds: 64, revenueEstimate: 22.1 },
  { ticker: 'MU', company: 'Micron Technology', date: '2026-03-18', time: 'post', estimate: 1.42, beatOdds: 85, revenueEstimate: 8.6 },
  { ticker: 'NKE', company: 'Nike', date: '2026-03-19', time: 'post', estimate: 0.55, beatOdds: 58, revenueEstimate: 11.2 },
  { ticker: 'LULU', company: 'Lululemon', date: '2026-03-20', time: 'post', estimate: 5.85, beatOdds: 74, revenueEstimate: 3.15 },
];

export const analyses: Record<string, Analysis> = {
  NVDA: {
    ticker: 'NVDA',
    generatedAt: '2026-02-26T12:00:00Z',
    summary: `NVIDIA reports Q4 FY2026 earnings today after market close. The company is expected to deliver another blockbuster quarter driven by insatiable AI/ML demand for its data center GPUs.

Consensus expects revenue of $38.5B (+65% YoY) with data center segment contributing ~$34B. The key focus will be on Blackwell architecture ramp and supply chain commentary.

Watch for: Blackwell production timeline, China revenue trends post-restrictions, and gaming segment recovery signals.`,
    keyPoints: [
      { sentiment: 'up', text: 'Data center revenue expected to exceed $34B on AI demand' },
      { sentiment: 'up', text: 'Blackwell architecture ramp is key catalyst for FY2027' },
      { sentiment: 'neutral', text: 'China revenue headwinds from export restrictions (~12% of DC revenue)' },
      { sentiment: 'up', text: 'Gross margins expected stable at ~75% despite mix shift' },
      { sentiment: 'neutral', text: 'Gaming segment showing signs of recovery but remains secondary focus' },
    ],
    revenue: { actual: 0, estimate: 38.5, unit: 'B' },
    guidance: 'pending',
  },
  HD: {
    ticker: 'HD',
    generatedAt: '2026-02-24T18:00:00Z',
    summary: `Home Depot delivered a solid Q4 beat with EPS of $2.52 vs $2.48 expected (+1.6% surprise), driven by strong Pro customer demand and improving housing turnover trends.

Revenue came in at $39.7B vs $39.2B expected. Same-store sales increased 1.2% year-over-year, marking the third consecutive quarter of positive comps after a challenging 2024. The Pro segment continued to outperform DIY, with large project activity showing particular strength.

Management raised FY2026 guidance to EPS of $15.65-$15.95 (vs prior $15.40-$15.70), citing expectations of continued housing market normalization and easing interest rate pressures benefiting big-ticket purchases.`,
    keyPoints: [
      { sentiment: 'up', text: 'EPS beat estimates by 1.6% ($2.52 vs $2.48)' },
      { sentiment: 'up', text: 'Revenue $39.7B vs $39.2B estimate (+1.3% beat)' },
      { sentiment: 'up', text: 'Same-store sales returned to growth at +1.2% YoY' },
      { sentiment: 'up', text: 'Pro customer segment grew 8% YoY, outpacing DIY' },
      { sentiment: 'up', text: 'FY2026 EPS guidance raised to $15.65-$15.95' },
      { sentiment: 'neutral', text: 'DIY segment flat but management sees stabilization' },
    ],
    revenue: { actual: 39.7, estimate: 39.2, unit: 'B' },
    guidance: 'raised',
  },
  WDAY: {
    ticker: 'WDAY',
    generatedAt: '2026-02-25T22:00:00Z',
    summary: `Workday exceeded expectations with EPS of $2.32 vs $2.25 consensus (+3.1% beat), driven by accelerating subscription revenue growth and expanding margins.

Revenue of $2.15B beat the $2.10B estimate. Subscription revenue grew 18% year-over-year to $1.94B, with strong large enterprise wins in both HCM and Financial Management modules. Net revenue retention remained above 100%, indicating healthy upsell activity.

The company highlighted growing AI adoption within its platform, with over 50% of customers now using AI-powered features. Management maintained FY2027 guidance but noted AI is becoming a key differentiator in competitive deals.`,
    keyPoints: [
      { sentiment: 'up', text: 'EPS beat by 3.1% ($2.32 vs $2.25 estimate)' },
      { sentiment: 'up', text: 'Revenue $2.15B vs $2.10B estimate (+2.4% beat)' },
      { sentiment: 'up', text: 'Subscription revenue grew 18% YoY to $1.94B' },
      { sentiment: 'up', text: 'AI adoption accelerating with 50%+ customer penetration' },
      { sentiment: 'up', text: 'Large enterprise deal momentum continues' },
      { sentiment: 'neutral', text: 'FY2027 guidance maintained (not raised)' },
    ],
    revenue: { actual: 2.15, estimate: 2.10, unit: 'B' },
    guidance: 'maintained',
  },
  META: {
    ticker: 'META',
    generatedAt: '2026-01-29T22:00:00Z',
    summary: `Meta delivered a massive Q4 beat with EPS of $8.02 vs $6.77 consensus (+18.5% surprise), driven by surging ad revenue and continued cost discipline from the "Year of Efficiency."

Revenue hit $48.4B vs $46.9B expected (+3.2% beat). Family of Apps daily active users reached 3.35B. Reels monetization continued to improve, now contributing 15% of total ad revenue. AI-driven ad targeting improvements drove 22% YoY growth in average revenue per user.

Reality Labs losses narrowed to $4.5B (vs $5.2B prior quarter) as Quest 3 sales exceeded expectations. Management guided Q1 revenue of $43-46B and announced $50B accelerated buyback.`,
    keyPoints: [
      { sentiment: 'up', text: 'EPS crushed estimates by 18.5% ($8.02 vs $6.77)' },
      { sentiment: 'up', text: 'Revenue $48.4B vs $46.9B estimate (+3.2% beat)' },
      { sentiment: 'up', text: 'Reels now 15% of ad revenue, up from 10% last year' },
      { sentiment: 'up', text: 'Reality Labs losses narrowing ($4.5B vs $5.2B QoQ)' },
      { sentiment: 'up', text: '$50B accelerated buyback announced' },
      { sentiment: 'neutral', text: 'Q1 guidance $43-46B implies slight deceleration' },
    ],
    revenue: { actual: 48.4, estimate: 46.9, unit: 'B' },
    guidance: 'raised',
  },
  TSLA: {
    ticker: 'TSLA',
    generatedAt: '2026-01-23T22:00:00Z',
    summary: `Tesla missed Q4 estimates with EPS of $0.66 vs $0.76 expected (-13.2% miss), as price cuts continued to pressure margins despite record deliveries.

Revenue of $25.7B slightly beat the $25.5B estimate. Automotive gross margin fell to 16.3% (ex-credits), down from 17.2% last quarter. Energy storage deployments hit a record 11.2 GWh, growing 125% YoY.

Elon Musk reiterated guidance for "slightly higher" deliveries in 2026 and confirmed the affordable model launch in H1 2026. FSD revenue recognition began contributing meaningfully for the first time.`,
    keyPoints: [
      { sentiment: 'down', text: 'EPS missed by 13.2% ($0.66 vs $0.76 estimate)' },
      { sentiment: 'neutral', text: 'Revenue $25.7B vs $25.5B estimate (slight beat)' },
      { sentiment: 'down', text: 'Auto gross margin compressed to 16.3% (ex-credits)' },
      { sentiment: 'up', text: 'Energy storage record 11.2 GWh (+125% YoY)' },
      { sentiment: 'up', text: 'Affordable model confirmed for H1 2026 launch' },
      { sentiment: 'neutral', text: 'FSD revenue recognition now contributing' },
    ],
    revenue: { actual: 25.7, estimate: 25.5, unit: 'B' },
    guidance: 'maintained',
  },
  COIN: {
    ticker: 'COIN',
    generatedAt: '2026-02-13T22:00:00Z',
    summary: `Coinbase absolutely crushed Q4 with EPS of $4.68 vs $1.89 expected (+148% surprise), as the crypto rally drove massive trading volume increases.

Revenue exploded to $2.27B vs $1.78B expected (+27.5% beat). Transaction revenue surged 172% QoQ on Bitcoin's run to new all-time highs. Subscription & services revenue grew 15% QoQ, providing more stable recurring income.

Management noted institutional adoption accelerating post-ETF approvals. USDC market cap grew to $45B. Regulatory clarity improving with favorable court rulings. No specific guidance but noted Q1 volumes tracking strong.`,
    keyPoints: [
      { sentiment: 'up', text: 'EPS crushed by 148% ($4.68 vs $1.89 estimate)' },
      { sentiment: 'up', text: 'Revenue $2.27B vs $1.78B estimate (+27.5% beat)' },
      { sentiment: 'up', text: 'Transaction revenue +172% QoQ on crypto rally' },
      { sentiment: 'up', text: 'USDC market cap reached $45B' },
      { sentiment: 'up', text: 'Institutional adoption accelerating post-ETF' },
      { sentiment: 'neutral', text: 'Results highly dependent on crypto prices' },
    ],
    revenue: { actual: 2.27, estimate: 1.78, unit: 'B' },
    guidance: 'not provided',
  },
  AAPL: {
    ticker: 'AAPL',
    generatedAt: '2026-01-28T22:00:00Z',
    summary: `Apple narrowly missed Q1 FY2026 estimates with EPS of $2.35 vs $2.36 expected, as iPhone revenue declined 3% YoY amid China weakness.

Revenue of $124.3B met the $124.1B estimate. Services revenue hit a record $25.2B (+14% YoY), partially offsetting hardware weakness. Greater China revenue fell 8% amid increased local competition from Huawei.

Management guided Q2 revenue flat to slightly up YoY. Apple Intelligence features drove upgrade cycle in US/Europe but China adoption remains limited. Gross margin guided to 46-47%.`,
    keyPoints: [
      { sentiment: 'down', text: 'EPS slight miss ($2.35 vs $2.36 estimate)' },
      { sentiment: 'neutral', text: 'Revenue $124.3B in-line with $124.1B estimate' },
      { sentiment: 'down', text: 'iPhone revenue -3% YoY, China -8%' },
      { sentiment: 'up', text: 'Services record $25.2B (+14% YoY)' },
      { sentiment: 'neutral', text: 'Apple Intelligence driving US/EU upgrades' },
      { sentiment: 'neutral', text: 'Q2 guidance flat to slightly up YoY' },
    ],
    revenue: { actual: 124.3, estimate: 124.1, unit: 'B' },
    guidance: 'maintained',
  },
};

/**
 * Beat Streaks - Consecutive quarters of beating earnings estimates
 * Data based on historical performance through Q4 2025
 */
export const beatStreaks: Record<string, number> = {
  // Tech giants with consistent beats
  MSFT: 8,   // Microsoft - 8 consecutive beats
  META: 7,   // Meta - 7 consecutive beats 
  GOOGL: 6,  // Alphabet - 6 consecutive beats
  AMZN: 5,   // Amazon - 5 consecutive beats
  NVDA: 12,  // NVIDIA - 12 consecutive beats (legendary!)
  
  // Strong performers
  COIN: 4,   // Coinbase - 4 consecutive beats
  UBER: 5,   // Uber - 5 consecutive beats
  LLY: 8,    // Eli Lilly - 8 consecutive beats
  CRWD: 9,   // CrowdStrike - 9 consecutive beats
  PANW: 6,   // Palo Alto Networks - 6 consecutive beats
  
  // Financial sector
  JPM: 5,    // JPMorgan - 5 consecutive beats
  GS: 4,     // Goldman Sachs - 4 consecutive beats
  MS: 4,     // Morgan Stanley - 4 consecutive beats
  
  // Retail & consumer
  WMT: 6,    // Walmart - 6 consecutive beats
  COST: 7,   // Costco - 7 consecutive beats
  HD: 3,     // Home Depot - 3 consecutive beats
  
  // Healthcare & biotech
  UNH: 5,    // UnitedHealth - 5 consecutive beats
  
  // Semiconductors
  AMD: 4,    // AMD - 4 consecutive beats
  AVGO: 10,  // Broadcom - 10 consecutive beats
  TSM: 6,    // TSMC - 6 consecutive beats
  QCOM: 5,   // Qualcomm - 5 consecutive beats
  
  // SaaS & Enterprise
  CRM: 8,    // Salesforce - 8 consecutive beats
  WDAY: 4,   // Workday - 4 consecutive beats
  SHOP: 3,   // Shopify - 3 consecutive beats
  
  // Other notable streaks
  DIS: 3,    // Disney - 3 consecutive beats
  NFLX: 4,   // Netflix - 4 consecutive beats
  BKNG: 6,   // Booking - 6 consecutive beats
};

export function getEarning(ticker: string): Earning | undefined {
  return earnings.find(e => e.ticker.toUpperCase() === ticker.toUpperCase());
}

export function getAnalysis(ticker: string): Analysis | undefined {
  return analyses[ticker.toUpperCase()];
}

export function getBeatStreak(ticker: string): number {
  return beatStreaks[ticker.toUpperCase()] || 0;
}

export function getEarningsByDate(date: string): Earning[] {
  return earnings.filter(e => e.date === date);
}
// trigger deploy 1773177994
