interface DataPoint {
  quarter: string;
  eps: number;
  estimate: number;
  beat: boolean;
}

// Clean, readable EPS comparison chart
export function EPSChart({ data }: { data: DataPoint[] }) {
  const reversed = [...data].reverse();
  
  return (
    <div className="w-full">
      {/* Simple horizontal bar comparison for each quarter */}
      <div className="space-y-6">
        {reversed.map((d, i) => {
          const surprise = ((d.eps - d.estimate) / Math.abs(d.estimate) * 100);
          const isPositive = surprise >= 0;
          const maxVal = Math.max(d.eps, d.estimate);
          const epsWidth = (d.eps / maxVal) * 100;
          const estWidth = (d.estimate / maxVal) * 100;
          
          return (
            <div key={i} className="group">
              {/* Quarter header with values */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-zinc-300">{d.quarter}</span>
                <div className={`px-2.5 py-1 rounded-md text-sm font-bold ${
                  isPositive 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {isPositive ? '+' : ''}{surprise.toFixed(1)}%
                </div>
              </div>
              
              {/* Bars with inline values */}
              <div className="space-y-2">
                {/* Actual EPS */}
                <div className="flex items-center gap-3">
                  <div className="w-16 text-xs text-zinc-500 text-right">Actual</div>
                  <div className="flex-1 h-8 bg-zinc-800/50 rounded-lg overflow-hidden relative">
                    <div 
                      className={`h-full rounded-lg transition-all duration-500 ${
                        isPositive 
                          ? 'bg-emerald-500' 
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${epsWidth}%` }}
                    />
                    <div className="absolute inset-y-0 left-3 flex items-center">
                      <span className="text-sm font-bold text-white drop-shadow-lg">
                        ${d.eps.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Estimate */}
                <div className="flex items-center gap-3">
                  <div className="w-16 text-xs text-zinc-500 text-right">Est.</div>
                  <div className="flex-1 h-8 bg-zinc-800/50 rounded-lg overflow-hidden relative">
                    <div 
                      className="h-full bg-zinc-600 rounded-lg transition-all duration-500"
                      style={{ width: `${estWidth}%` }}
                    />
                    <div className="absolute inset-y-0 left-3 flex items-center">
                      <span className="text-sm font-medium text-zinc-300 drop-shadow-lg">
                        ${d.estimate.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Clean table-style bar chart
export function EPSBarChart({ data }: { data: DataPoint[] }) {
  const reversed = [...data].reverse();
  const maxValue = Math.max(...reversed.map(d => Math.max(d.eps, d.estimate)));
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left text-xs text-zinc-500 uppercase tracking-wider pb-4 w-24">Quarter</th>
            <th className="text-left text-xs text-zinc-500 uppercase tracking-wider pb-4">EPS vs Estimate</th>
            <th className="text-right text-xs text-zinc-500 uppercase tracking-wider pb-4 w-24">Actual</th>
            <th className="text-right text-xs text-zinc-500 uppercase tracking-wider pb-4 w-24">Est.</th>
            <th className="text-right text-xs text-zinc-500 uppercase tracking-wider pb-4 w-20">Diff</th>
          </tr>
        </thead>
        <tbody>
          {reversed.map((d, i) => {
            const surprise = ((d.eps - d.estimate) / Math.abs(d.estimate) * 100);
            const isPositive = surprise >= 0;
            const epsWidth = (d.eps / maxValue) * 100;
            const estWidth = (d.estimate / maxValue) * 100;
            
            return (
              <tr key={i} className="border-t border-zinc-800/50">
                <td className="py-4 text-sm font-medium text-zinc-300">{d.quarter}</td>
                <td className="py-4 pr-4">
                  <div className="relative h-10">
                    {/* Estimate bar (background) */}
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 h-4 bg-zinc-700 rounded"
                      style={{ width: `${estWidth}%` }}
                    />
                    {/* Actual bar (foreground) */}
                    <div 
                      className={`absolute top-1/2 -translate-y-1/2 h-6 rounded ${
                        isPositive ? 'bg-emerald-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${epsWidth}%` }}
                    />
                  </div>
                </td>
                <td className={`py-4 text-right text-base font-bold ${
                  isPositive ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  ${d.eps.toFixed(2)}
                </td>
                <td className="py-4 text-right text-base text-zinc-500">
                  ${d.estimate.toFixed(2)}
                </td>
                <td className={`py-4 text-right text-sm font-semibold ${
                  isPositive ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {isPositive ? '+' : ''}{surprise.toFixed(1)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Sparkline trend component - minimal inline chart
export function EPSTrend({ data }: { data: DataPoint[] }) {
  const reversed = [...data].reverse();
  const values = reversed.map(d => d.eps);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  
  const width = 120;
  const height = 40;
  const padding = 4;
  
  const points = values.map((v, i) => {
    const x = padding + (i / (values.length - 1)) * (width - padding * 2);
    const y = height - padding - ((v - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');
  
  const trend = values[values.length - 1] > values[0];
  
  return (
    <div className="flex items-center gap-3">
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke={trend ? '#10b981' : '#ef4444'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* End dot */}
        {values.length > 0 && (
          <circle
            cx={width - padding}
            cy={height - padding - ((values[values.length - 1] - min) / range) * (height - padding * 2)}
            r="4"
            fill={trend ? '#10b981' : '#ef4444'}
          />
        )}
      </svg>
      <div className="text-right">
        <div className="text-lg font-bold text-white">${values[values.length - 1]?.toFixed(2)}</div>
        <div className={`text-xs ${trend ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend ? '↑' : '↓'} {((values[values.length - 1] - values[0]) / values[0] * 100).toFixed(0)}% YoY
        </div>
      </div>
    </div>
  );
}

// Compact summary card
export function EPSSummaryCard({ data }: { data: DataPoint[] }) {
  const beats = data.filter(d => d.beat).length;
  const total = data.length;
  const avgSurprise = data.reduce((sum, d) => {
    return sum + ((d.eps - d.estimate) / Math.abs(d.estimate) * 100);
  }, 0) / total;
  
  const latestEps = data[0]?.eps || 0;
  const oldestEps = data[data.length - 1]?.eps || 0;
  const growth = ((latestEps - oldestEps) / oldestEps * 100);
  
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
