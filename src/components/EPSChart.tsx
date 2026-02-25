'use client';

interface DataPoint {
  quarter: string;
  eps: number;
  estimate: number;
  beat: boolean;
}

export function EPSChart({ data }: { data: DataPoint[] }) {
  const reversed = [...data].reverse();
  const maxValue = Math.max(...reversed.map(d => Math.max(d.eps, d.estimate))) * 1.2;
  const minValue = Math.min(...reversed.map(d => Math.min(d.eps, d.estimate)), 0) * 0.9;
  const range = maxValue - minValue;
  
  const width = 640;
  const height = 320;
  const padding = { top: 50, right: 50, bottom: 70, left: 70 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  const xStep = chartWidth / (reversed.length - 1 || 1);
  
  const getY = (value: number) => padding.top + chartHeight - ((value - minValue) / range) * chartHeight;
  const getX = (index: number) => padding.left + index * xStep;
  
  const epsPath = reversed.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.eps)}`).join(' ');
  const estPath = reversed.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.estimate)}`).join(' ');
  const areaPath = `${epsPath} L ${getX(reversed.length - 1)} ${height - padding.bottom} L ${getX(0)} ${height - padding.bottom} Z`;

  return (
    <div className="w-full bg-gradient-to-br from-zinc-900/50 to-zinc-900/30 rounded-2xl p-6 border border-zinc-800/50">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <linearGradient id="epsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#22c55e" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#4ade80" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.3"/>
          </filter>
        </defs>
        
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding.top + chartHeight * (1 - ratio);
          const value = minValue + range * ratio;
          return (
            <g key={i}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#27272a" strokeWidth="1" strokeDasharray="4,6"/>
              <text x={padding.left - 12} y={y + 4} textAnchor="end" fill="#71717a" fontSize="12" fontWeight="500">
                ${value.toFixed(2)}
              </text>
            </g>
          );
        })}
        
        {/* Area fill */}
        <path d={areaPath} fill="url(#epsGradient)" />
        
        {/* Estimate line */}
        <path d={estPath} fill="none" stroke="#525252" strokeWidth="2" strokeDasharray="8,6" opacity="0.7"/>
        
        {/* EPS line with glow */}
        <path d={epsPath} fill="none" stroke="url(#lineGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)"/>
        
        {/* Data points */}
        {reversed.map((d, i) => {
          const surprise = ((d.eps - d.estimate) / Math.abs(d.estimate) * 100);
          const isPositive = surprise >= 0;
          
          return (
            <g key={i}>
              {/* X labels */}
              <text x={getX(i)} y={height - padding.bottom + 28} textAnchor="middle" fill="#a1a1aa" fontSize="13" fontWeight="500">
                {d.quarter}
              </text>
              
              {/* Vertical guide on hover area */}
              <line x1={getX(i)} y1={padding.top} x2={getX(i)} y2={height - padding.bottom} stroke="#3f3f46" strokeWidth="1" strokeDasharray="2,4" opacity="0.3"/>
              
              {/* Estimate point */}
              <circle cx={getX(i)} cy={getY(d.estimate)} r="5" fill="#18181b" stroke="#525252" strokeWidth="2"/>
              
              {/* EPS point with glow */}
              <circle cx={getX(i)} cy={getY(d.eps)} r="8" fill={isPositive ? '#22c55e' : '#ef4444'} filter="url(#shadow)"/>
              <circle cx={getX(i)} cy={getY(d.eps)} r="4" fill="#fff"/>
              
              {/* Surprise label */}
              <g transform={`translate(${getX(i)}, ${getY(d.eps) - 24})`}>
                <rect x="-28" y="-14" width="56" height="24" rx="12" fill={isPositive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'} stroke={isPositive ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'} strokeWidth="1"/>
                <text textAnchor="middle" y="4" fill={isPositive ? '#4ade80' : '#f87171'} fontSize="11" fontWeight="600">
                  {isPositive ? '+' : ''}{surprise.toFixed(1)}%
                </text>
              </g>
            </g>
          );
        })}
        
        {/* Legend */}
        <g transform={`translate(${width - padding.right - 140}, ${padding.top - 30})`}>
          <line x1="0" y1="8" x2="24" y2="8" stroke="url(#lineGradient)" strokeWidth="3" strokeLinecap="round"/>
          <text x="32" y="12" fill="#a1a1aa" fontSize="12" fontWeight="500">Actual EPS</text>
          <line x1="100" y1="8" x2="124" y2="8" stroke="#525252" strokeWidth="2" strokeDasharray="8,6"/>
          <text x="132" y="12" fill="#71717a" fontSize="12" fontWeight="500">Estimate</text>
        </g>
      </svg>
    </div>
  );
}

export function EPSBarChart({ data }: { data: DataPoint[] }) {
  const reversed = [...data].reverse();
  const maxValue = Math.max(...reversed.map(d => Math.max(d.eps, d.estimate))) * 1.15;
  
  return (
    <div className="bg-gradient-to-br from-zinc-900/50 to-zinc-900/30 rounded-2xl p-6 border border-zinc-800/50">
      <div className="flex items-end justify-around gap-6 h-56">
        {reversed.map((d, i) => {
          const epsHeight = (d.eps / maxValue) * 100;
          const estHeight = (d.estimate / maxValue) * 100;
          const surprise = ((d.eps - d.estimate) / Math.abs(d.estimate) * 100);
          const isPositive = surprise >= 0;
          
          return (
            <div key={i} className="flex flex-col items-center gap-3 flex-1 group">
              {/* Surprise badge */}
              <div className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all group-hover:scale-110 ${
                isPositive 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(34,197,94,0.3)]' 
                  : 'bg-red-500/20 text-red-400 border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
              }`}>
                {isPositive ? '+' : ''}{surprise.toFixed(1)}%
              </div>
              
              {/* Bars */}
              <div className="flex items-end gap-2 h-36">
                {/* Estimate */}
                <div className="relative group/bar">
                  <div 
                    className="w-8 rounded-t-lg bg-gradient-to-t from-zinc-700 to-zinc-600 transition-all duration-300 hover:from-zinc-600 hover:to-zinc-500"
                    style={{ height: `${estHeight}%` }}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-zinc-800 px-2 py-1 rounded text-[10px] text-zinc-300 whitespace-nowrap border border-zinc-700">
                    Est: ${d.estimate.toFixed(2)}
                  </div>
                </div>
                
                {/* Actual */}
                <div className="relative group/bar">
                  <div 
                    className={`w-8 rounded-t-lg transition-all duration-300 ${
                      isPositive 
                        ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)]' 
                        : 'bg-gradient-to-t from-red-600 to-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]'
                    }`}
                    style={{ height: `${epsHeight}%` }}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-zinc-800 px-2 py-1 rounded text-[10px] text-white whitespace-nowrap font-semibold border border-zinc-700">
                    ${d.eps.toFixed(2)}
                  </div>
                </div>
              </div>
              
              {/* Quarter label */}
              <div className="text-sm text-zinc-400 font-medium">{d.quarter}</div>
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-8 mt-6 pt-4 border-t border-zinc-800/50">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <div className="w-4 h-4 rounded bg-gradient-to-t from-zinc-700 to-zinc-600"></div>
          Estimate
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <div className="w-4 h-4 rounded bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
          Beat
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <div className="w-4 h-4 rounded bg-gradient-to-t from-red-600 to-red-400 shadow-[0_0_8px_rgba(239,68,68,0.4)]"></div>
          Miss
        </div>
      </div>
    </div>
  );
}
