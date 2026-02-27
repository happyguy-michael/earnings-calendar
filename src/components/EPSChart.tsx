'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line,
  Cell,
  ReferenceLine,
} from 'recharts';

interface DataPoint {
  quarter: string;
  eps: number;
  estimate: number;
  beat: boolean;
}

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const eps = payload.find((p: any) => p.dataKey === 'eps')?.value || 0;
    const estimate = payload.find((p: any) => p.dataKey === 'estimate')?.value || 0;
    const surprise = ((eps - estimate) / Math.abs(estimate) * 100);
    const beat = eps >= estimate;
    
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 shadow-xl">
        <p className="text-white font-semibold mb-2">{label}</p>
        <div className="space-y-1 text-sm">
          <p className={beat ? 'text-emerald-400' : 'text-red-400'}>
            Actual: <span className="font-bold">${eps.toFixed(2)}</span>
          </p>
          <p className="text-zinc-400">
            Estimate: <span className="font-medium">${estimate.toFixed(2)}</span>
          </p>
          <p className={`font-bold ${beat ? 'text-emerald-400' : 'text-red-400'}`}>
            {beat ? '▲' : '▼'} {surprise >= 0 ? '+' : ''}{surprise.toFixed(1)}%
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// Main EPS comparison chart - Bar chart with actual vs estimate
export function EPSChart({ data }: { data: DataPoint[] }) {
  const chartData = [...data].reverse().map(d => ({
    ...d,
    surprise: ((d.eps - d.estimate) / Math.abs(d.estimate) * 100),
  }));

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis 
            dataKey="quarter" 
            tick={{ fill: '#a1a1aa', fontSize: 12 }}
            axisLine={{ stroke: '#444' }}
          />
          <YAxis 
            tick={{ fill: '#a1a1aa', fontSize: 12 }}
            axisLine={{ stroke: '#444' }}
            tickFormatter={(v) => `$${v.toFixed(2)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => <span className="text-zinc-400 text-sm">{value}</span>}
          />
          <Bar 
            dataKey="estimate" 
            name="Estimate" 
            fill="#52525b" 
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="eps" 
            name="Actual EPS" 
            radius={[4, 4, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.beat ? '#10b981' : '#ef4444'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Line + Bar combo chart showing trend
export function EPSBarChart({ data }: { data: DataPoint[] }) {
  const chartData = [...data].reverse().map(d => ({
    ...d,
    surprise: ((d.eps - d.estimate) / Math.abs(d.estimate) * 100),
  }));

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis 
            dataKey="quarter" 
            tick={{ fill: '#a1a1aa', fontSize: 12 }}
            axisLine={{ stroke: '#444' }}
          />
          <YAxis 
            yAxisId="left"
            tick={{ fill: '#a1a1aa', fontSize: 12 }}
            axisLine={{ stroke: '#444' }}
            tickFormatter={(v) => `$${v.toFixed(2)}`}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tick={{ fill: '#a1a1aa', fontSize: 12 }}
            axisLine={{ stroke: '#444' }}
            tickFormatter={(v) => `${v.toFixed(0)}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => <span className="text-zinc-400 text-sm">{value}</span>}
          />
          <ReferenceLine yAxisId="right" y={0} stroke="#666" strokeDasharray="3 3" />
          <Bar 
            yAxisId="left"
            dataKey="eps" 
            name="Actual EPS" 
            radius={[4, 4, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.beat ? '#10b981' : '#ef4444'} 
              />
            ))}
          </Bar>
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="estimate" 
            name="Estimate" 
            stroke="#71717a" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#71717a', r: 4 }}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="surprise" 
            name="Surprise %" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            dot={{ fill: '#8b5cf6', r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// Simple trend sparkline
export function EPSTrend({ data }: { data: DataPoint[] }) {
  const chartData = [...data].reverse();
  const trend = chartData[chartData.length - 1]?.eps > chartData[0]?.eps;
  const latestEps = chartData[chartData.length - 1]?.eps || 0;
  const growth = chartData.length > 1 
    ? ((chartData[chartData.length - 1].eps - chartData[0].eps) / chartData[0].eps * 100)
    : 0;

  return (
    <div className="flex items-center gap-4">
      <div className="w-32 h-12">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <Line 
              type="monotone" 
              dataKey="eps" 
              stroke={trend ? '#10b981' : '#ef4444'} 
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="text-right">
        <div className="text-lg font-bold text-white">${latestEps.toFixed(2)}</div>
        <div className={`text-xs font-medium ${trend ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend ? '↑' : '↓'} {growth >= 0 ? '+' : ''}{growth.toFixed(0)}% YoY
        </div>
      </div>
    </div>
  );
}

// Summary stats card
export function EPSSummaryCard({ data }: { data: DataPoint[] }) {
  const beats = data.filter(d => d.beat).length;
  const total = data.length;
  const avgSurprise = data.reduce((sum, d) => {
    return sum + ((d.eps - d.estimate) / Math.abs(d.estimate) * 100);
  }, 0) / total;
  
  const latestEps = data[0]?.eps || 0;
  const oldestEps = data[data.length - 1]?.eps || 0;
  const growth = oldestEps > 0 ? ((latestEps - oldestEps) / oldestEps * 100) : 0;
  
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
        <div className="text-2xl font-bold text-white">{beats}/{total}</div>
        <div className="text-xs text-zinc-500 mt-1">Beat Rate</div>
      </div>
      <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
        <div className={`text-2xl font-bold ${avgSurprise >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {avgSurprise >= 0 ? '+' : ''}{avgSurprise.toFixed(1)}%
        </div>
        <div className="text-xs text-zinc-500 mt-1">Avg Surprise</div>
      </div>
      <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
        <div className={`text-2xl font-bold ${growth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {growth >= 0 ? '+' : ''}{growth.toFixed(0)}%
        </div>
        <div className="text-xs text-zinc-500 mt-1">EPS Growth</div>
      </div>
    </div>
  );
}
