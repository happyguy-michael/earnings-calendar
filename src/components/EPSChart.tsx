interface DataPoint {
  quarter: string;
  eps: number;
  estimate: number;
  beat: boolean;
}

export function EPSChart({ data }: { data: DataPoint[] }) {
  const reversed = [...data].reverse();
  const maxValue = Math.max(...reversed.map(d => Math.max(d.eps, d.estimate))) * 1.15;
  const minValue = 0;
  
  // Generate Y-axis ticks
  const tickCount = 5;
  const ticks = Array.from({ length: tickCount }, (_, i) => 
    minValue + ((maxValue - minValue) * i) / (tickCount - 1)
  );
  
  const chartHeight = 200;
  
  const getHeight = (value: number) => ((value - minValue) / (maxValue - minValue)) * chartHeight;

  return (
    <div className="w-full bg-gradient-to-br from-zinc-900/50 to-zinc-900/30 rounded-2xl p-6 border border-zinc-800/50">
      {/* Legend at top */}
      <div className="flex items-center justify-end gap-6 mb-4 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-zinc-500"></div>
          <span>Estimate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span>Actual (Beat)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>Actual (Miss)</span>
        </div>
      </div>
      
      <div className="flex">
        {/* Y-Axis */}
        <div className="flex flex-col justify-between pr-3 text-right" style={{ height: `${chartHeight}px` }}>
          {[...ticks].reverse().map((tick, i) => (
            <div key={i} className="text-xs text-zinc-500 font-mono leading-none">
              ${tick.toFixed(2)}
            </div>
          ))}
        </div>
        
        {/* Chart Area */}
        <div className="flex-1 relative border-l border-b border-zinc-700/50">
          {/* Horizontal grid lines */}
          {ticks.map((_, i) => (
            <div 
              key={i} 
              className="absolute left-0 right-0 border-t border-zinc-800/50"
              style={{ top: `${(i / (tickCount - 1)) * 100}%` }}
            />
          ))}
          
          {/* Bars */}
          <div className="absolute inset-0 flex items-end justify-around px-4">
            {reversed.map((d, i) => {
              const epsHeight = getHeight(d.eps);
              const estHeight = getHeight(d.estimate);
              const surprise = ((d.eps - d.estimate) / Math.abs(d.estimate) * 100);
              const isPositive = surprise >= 0;
              
              return (
                <div key={i} className="flex flex-col items-center" style={{ height: '100%' }}>
                  {/* Value labels above bars */}
                  <div className="flex-1 flex items-end justify-center gap-1 pb-1">
                    <div className="flex flex-col items-center gap-1">
                      {/* Surprise badge */}
                      <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isPositive 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {isPositive ? '+' : ''}{surprise.toFixed(1)}%
                      </div>
                      
                      {/* Bars side by side */}
                      <div className="flex items-end gap-1">
                        {/* Estimate bar */}
                        <div className="flex flex-col items-center">
                          <span className="text-[9px] text-zinc-500 mb-1">${d.estimate.toFixed(2)}</span>
                          <div 
                            className="w-6 rounded-t bg-zinc-600"
                            style={{ height: `${estHeight}px` }}
                          />
                        </div>
                        
                        {/* Actual bar */}
                        <div className="flex flex-col items-center">
                          <span className={`text-[9px] font-bold mb-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                            ${d.eps.toFixed(2)}
                          </span>
                          <div 
                            className={`w-6 rounded-t ${
                              isPositive 
                                ? 'bg-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' 
                                : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                            }`}
                            style={{ height: `${epsHeight}px` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* X-Axis labels */}
      <div className="flex pl-12">
        <div className="flex-1 flex justify-around pt-2">
          {reversed.map((d, i) => (
            <div key={i} className="text-xs text-zinc-400 font-medium">
              {d.quarter}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function EPSBarChart({ data }: { data: DataPoint[] }) {
  const reversed = [...data].reverse();
  const maxValue = Math.max(...reversed.map(d => Math.max(d.eps, d.estimate))) * 1.15;
  const minValue = 0;
  
  // Generate nice Y-axis ticks
  const tickCount = 5;
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const value = minValue + ((maxValue - minValue) * i) / (tickCount - 1);
    return value;
  });
  
  const chartHeight = 180; // pixels for bar area
  
  return (
    <div className="bg-gradient-to-br from-zinc-900/50 to-zinc-900/30 rounded-2xl p-6 border border-zinc-800/50">
      <div className="flex">
        {/* Y-Axis */}
        <div className="flex flex-col justify-between pr-4 py-2" style={{ height: `${chartHeight + 60}px` }}>
          {[...ticks].reverse().map((tick, i) => (
            <div key={i} className="text-xs text-zinc-500 font-medium text-right w-12">
              ${tick.toFixed(2)}
            </div>
          ))}
        </div>
        
        {/* Chart Area */}
        <div className="flex-1 relative">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" style={{ height: `${chartHeight}px`, top: '30px' }}>
            {ticks.map((_, i) => (
              <div key={i} className="border-t border-zinc-800/50 w-full" />
            ))}
          </div>
          
          {/* Bars container */}
          <div className="flex items-end justify-around gap-4" style={{ height: `${chartHeight + 60}px`, paddingTop: '30px' }}>
            {reversed.map((d, i) => {
              const epsHeight = (d.eps / maxValue) * chartHeight;
              const estHeight = (d.estimate / maxValue) * chartHeight;
              const surprise = ((d.eps - d.estimate) / Math.abs(d.estimate) * 100);
              const isPositive = surprise >= 0;
              
              return (
                <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                  {/* Surprise badge */}
                  <div className={`px-2 py-1 rounded-full text-[10px] font-semibold border transition-all group-hover:scale-110 ${
                    isPositive 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}>
                    {isPositive ? '+' : ''}{surprise.toFixed(1)}%
                  </div>
                  
                  {/* Bars */}
                  <div className="flex items-end gap-1.5" style={{ height: `${chartHeight}px` }}>
                    {/* Estimate bar */}
                    <div className="relative">
                      <div 
                        className="w-6 rounded-t-md bg-gradient-to-t from-zinc-700 to-zinc-500 transition-all duration-300"
                        style={{ height: `${estHeight}px` }}
                      />
                      {/* Value label on bar */}
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-zinc-500 font-medium whitespace-nowrap">
                        ${d.estimate.toFixed(2)}
                      </div>
                    </div>
                    
                    {/* Actual bar */}
                    <div className="relative">
                      <div 
                        className={`w-6 rounded-t-md transition-all duration-300 ${
                          isPositive 
                            ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_15px_rgba(34,197,94,0.4)]' 
                            : 'bg-gradient-to-t from-red-600 to-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                        }`}
                        style={{ height: `${epsHeight}px` }}
                      />
                      {/* Value label on bar */}
                      <div className={`absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold whitespace-nowrap ${
                        isPositive ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        ${d.eps.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Quarter label */}
                  <div className="text-xs text-zinc-400 font-medium mt-1">{d.quarter}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-zinc-800/50">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <div className="w-3 h-3 rounded bg-gradient-to-t from-zinc-700 to-zinc-500"></div>
          Estimate
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <div className="w-3 h-3 rounded bg-gradient-to-t from-emerald-600 to-emerald-400"></div>
          Beat
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <div className="w-3 h-3 rounded bg-gradient-to-t from-red-600 to-red-400"></div>
          Miss
        </div>
      </div>
    </div>
  );
}
