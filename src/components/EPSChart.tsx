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
  const minValue = Math.min(...reversed.map(d => Math.min(d.eps, d.estimate)), 0);
  const range = maxValue - minValue;
  
  const width = 600;
  const height = 280;
  const padding = { top: 40, right: 40, bottom: 60, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  const xStep = chartWidth / (reversed.length - 1 || 1);
  
  const getY = (value: number) => {
    return padding.top + chartHeight - ((value - minValue) / range) * chartHeight;
  };
  
  const getX = (index: number) => {
    return padding.left + index * xStep;
  };
  
  // Generate path for line
  const epsPath = reversed.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.eps)}`).join(' ');
  const estPath = reversed.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.estimate)}`).join(' ');
  
  // Area fill under EPS line
  const areaPath = `${epsPath} L ${getX(reversed.length - 1)} ${getY(minValue)} L ${getX(0)} ${getY(minValue)} Z`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <linearGradient id="epsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding.top + chartHeight * (1 - ratio);
          const value = minValue + range * ratio;
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#27272a"
                strokeDasharray="4,4"
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                className="fill-zinc-500 text-xs"
                fontSize="11"
              >
                ${value.toFixed(2)}
              </text>
            </g>
          );
        })}
        
        {/* Area fill */}
        <path d={areaPath} fill="url(#epsGradient)" />
        
        {/* Estimate line (dashed) */}
        <path
          d={estPath}
          fill="none"
          stroke="#71717a"
          strokeWidth="2"
          strokeDasharray="6,4"
        />
        
        {/* EPS line */}
        <path
          d={epsPath}
          fill="none"
          stroke="#10b981"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
        />
        
        {/* Data points and labels */}
        {reversed.map((d, i) => (
          <g key={i}>
            {/* X-axis labels */}
            <text
              x={getX(i)}
              y={height - padding.bottom + 25}
              textAnchor="middle"
              className="fill-zinc-400"
              fontSize="11"
            >
              {d.quarter}
            </text>
            
            {/* Estimate point */}
            <circle
              cx={getX(i)}
              cy={getY(d.estimate)}
              r="4"
              fill="#27272a"
              stroke="#71717a"
              strokeWidth="2"
            />
            
            {/* EPS point */}
            <circle
              cx={getX(i)}
              cy={getY(d.eps)}
              r="6"
              fill={d.beat ? '#10b981' : '#ef4444'}
              stroke="#0a0a0a"
              strokeWidth="2"
            />
            
            {/* Beat/Miss indicator */}
            <g transform={`translate(${getX(i)}, ${getY(d.eps) - 20})`}>
              <rect
                x="-20"
                y="-10"
                width="40"
                height="18"
                rx="4"
                fill={d.beat ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}
              />
              <text
                textAnchor="middle"
                y="3"
                className={d.beat ? 'fill-emerald-400' : 'fill-red-400'}
                fontSize="10"
                fontWeight="600"
              >
                {d.beat ? '+' : ''}{(((d.eps - d.estimate) / Math.abs(d.estimate)) * 100).toFixed(1)}%
              </text>
            </g>
          </g>
        ))}
        
        {/* Legend */}
        <g transform={`translate(${width - padding.right - 120}, ${padding.top - 15})`}>
          <line x1="0" y1="0" x2="20" y2="0" stroke="#10b981" strokeWidth="3" />
          <text x="28" y="4" className="fill-zinc-400" fontSize="11">Actual EPS</text>
          
          <line x1="0" y1="18" x2="20" y2="18" stroke="#71717a" strokeWidth="2" strokeDasharray="6,4" />
          <text x="28" y="22" className="fill-zinc-400" fontSize="11">Estimate</text>
        </g>
      </svg>
    </div>
  );
}

export function EPSBarChart({ data }: { data: DataPoint[] }) {
  const reversed = [...data].reverse();
  const maxValue = Math.max(...reversed.map(d => Math.max(d.eps, d.estimate))) * 1.15;
  
  return (
    <div className="flex items-end justify-around gap-2 h-48 px-4">
      {reversed.map((d, i) => {
        const epsHeight = (d.eps / maxValue) * 100;
        const estHeight = (d.estimate / maxValue) * 100;
        const surprise = ((d.eps - d.estimate) / Math.abs(d.estimate) * 100);
        
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            {/* Surprise badge */}
            <div className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
              d.beat ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {surprise >= 0 ? '+' : ''}{surprise.toFixed(1)}%
            </div>
            
            {/* Bars container */}
            <div className="flex items-end gap-1 h-28">
              {/* Estimate bar */}
              <div className="relative group">
                <div 
                  className="w-6 bg-zinc-700 rounded-t transition-all hover:bg-zinc-600"
                  style={{ height: `${estHeight}%` }}
                />
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 px-1.5 py-0.5 rounded text-[9px] text-zinc-300 whitespace-nowrap">
                  Est: ${d.estimate.toFixed(2)}
                </div>
              </div>
              
              {/* Actual bar */}
              <div className="relative group">
                <div 
                  className={`w-6 rounded-t transition-all ${d.beat ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-red-500 hover:bg-red-400'}`}
                  style={{ height: `${epsHeight}%` }}
                />
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 px-1.5 py-0.5 rounded text-[9px] text-white whitespace-nowrap font-medium">
                  ${d.eps.toFixed(2)}
                </div>
              </div>
            </div>
            
            {/* Quarter label */}
            <div className="text-[10px] text-zinc-500 mt-1">{d.quarter}</div>
          </div>
        );
      })}
    </div>
  );
}
