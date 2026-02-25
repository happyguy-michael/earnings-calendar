export interface Earning {
  ticker: string;
  company: string;
  date: string;
  time: 'pre' | 'post';
  eps?: number | null;
  estimate: number;
  result?: 'beat' | 'miss' | 'met';
  beatOdds?: number;
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
