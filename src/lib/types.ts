export interface Earning {
  ticker: string;
  company: string;
  date: string;
  time: 'pre' | 'post';
  eps?: number | null;
  estimate: number;
  result?: 'beat' | 'miss' | 'met';
  beatOdds?: number;
  revenue?: number | null;        // Actual revenue in billions
  revenueEstimate?: number | null; // Revenue estimate in billions
  priceMove?: number;              // Post-earnings price change % (next day open vs prev close)
}

export interface Analysis {
  ticker: string;
  generatedAt: string;
  summary: string;
  keyPoints: {
    sentiment: 'up' | 'down' | 'neutral';
    text: string;
  }[];
  revenue?: {
    actual: number;
    estimate: number;
    unit: string;
  };
  guidance?: string;
}
