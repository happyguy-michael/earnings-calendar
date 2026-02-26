'use client';

/**
 * Skeleton Loading Components
 * Premium shimmer placeholders for a polished loading experience
 */

export function SkeletonStatCard({ delay = 0 }: { delay?: number }) {
  const delayClass = delay > 0 ? `skeleton-delay-${Math.min(delay, 5)}` : '';
  
  return (
    <div className="skeleton-stat-card">
      <div className={`skeleton skeleton-text-lg ${delayClass}`} />
      <div className={`skeleton skeleton-text-sm ${delayClass}`} />
    </div>
  );
}

export function SkeletonStatCardWithCircle({ delay = 0 }: { delay?: number }) {
  const delayClass = delay > 0 ? `skeleton-delay-${Math.min(delay, 5)}` : '';
  
  return (
    <div className="skeleton-stat-card">
      <div className="flex items-center gap-4">
        <div className={`skeleton skeleton-circle ${delayClass}`} />
        <div>
          <div className={`skeleton skeleton-text-lg ${delayClass}`} style={{ width: 70 }} />
          <div className={`skeleton skeleton-text-sm ${delayClass}`} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonEarningsRow({ delay = 0 }: { delay?: number }) {
  const delayClass = delay > 0 ? `skeleton-delay-${Math.min(delay, 5)}` : '';
  
  return (
    <div className="skeleton-earnings-row">
      <div className={`skeleton skeleton-logo ${delayClass}`} />
      <div className="flex-1 min-w-0">
        <div className={`skeleton skeleton-ticker ${delayClass}`} />
        <div className={`skeleton skeleton-company ${delayClass}`} />
      </div>
      <div className={`skeleton skeleton-badge ${delayClass}`} />
    </div>
  );
}

export function SkeletonDayHeader({ delay = 0 }: { delay?: number }) {
  const delayClass = delay > 0 ? `skeleton-delay-${Math.min(delay, 5)}` : '';
  
  return (
    <div className="skeleton-day-header">
      <div className={`skeleton skeleton-day-name ${delayClass}`} />
      <div className={`skeleton skeleton-day-num ${delayClass}`} />
    </div>
  );
}

export function SkeletonDayContent({ rowCount = 3, delay = 0 }: { rowCount?: number; delay?: number }) {
  return (
    <div className="day-content">
      <div className="space-y-5">
        <div>
          <div className={`skeleton skeleton-section-label skeleton-delay-${delay}`} />
          <div className="space-y-2">
            {Array.from({ length: rowCount }).map((_, i) => (
              <SkeletonEarningsRow key={i} delay={(delay + i + 1) % 5} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonWeek({ weekIndex = 0 }: { weekIndex?: number }) {
  const days = [0, 1, 2, 3, 4];
  const baseDelay = weekIndex * 2;
  
  return (
    <div 
      className="card overflow-hidden animate-fade-in" 
      style={{ animationDelay: `${weekIndex * 100}ms` }}
    >
      {/* Week Header */}
      <div className="week-header">
        {days.map((i) => (
          <SkeletonDayHeader key={i} delay={(baseDelay + i) % 5} />
        ))}
      </div>

      {/* Week Content */}
      <div className="week-content">
        {days.map((i) => (
          <SkeletonDayContent 
            key={i} 
            rowCount={i % 2 === 0 ? 2 : 1} 
            delay={(baseDelay + i) % 5} 
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonCalendar() {
  return (
    <div className="min-h-screen">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="skeleton h-8 w-48 mb-2" />
              <div className="skeleton skeleton-text-sm" style={{ width: 120 }} />
            </div>
            <div className="flex items-center gap-3">
              <div className="skeleton h-10 w-16 rounded-xl" />
              <div className="skeleton h-10 w-24 rounded-xl" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Row Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <SkeletonStatCard delay={1} />
          <SkeletonStatCardWithCircle delay={2} />
          <SkeletonStatCard delay={3} />
          <SkeletonStatCard delay={4} />
        </div>

        {/* Calendar Weeks Skeleton */}
        <div className="space-y-6">
          <SkeletonWeek weekIndex={0} />
          <SkeletonWeek weekIndex={1} />
          <SkeletonWeek weekIndex={2} />
        </div>

        {/* Legend Skeleton */}
        <div className="mt-10 flex items-center justify-center gap-8">
          <div className="skeleton h-4 w-28" />
          <div className="skeleton h-4 w-28" />
          <div className="skeleton h-4 w-28" />
        </div>
      </main>
    </div>
  );
}

export function SkeletonDetailPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-black/50 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="skeleton h-5 w-20" />
          <div className="flex gap-2">
            <div className="skeleton h-8 w-24 rounded-full" />
            <div className="skeleton h-8 w-20 rounded-full" />
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-start gap-8">
            {/* Logo & Title */}
            <div className="flex items-center gap-5">
              <div className="skeleton w-20 h-20 rounded-2xl" />
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="skeleton h-10 w-24" />
                  <div className="skeleton h-7 w-20 rounded-full" />
                </div>
                <div className="skeleton h-6 w-40" />
              </div>
            </div>
            <div className="flex-1" />
            {/* Price Card */}
            <div className="skeleton-stat-card p-5 min-w-[200px]">
              <div className="skeleton h-3 w-20 mb-3" />
              <div className="skeleton h-9 w-24 mb-2" />
              <div className="skeleton h-4 w-32" />
            </div>
            {/* Report Info */}
            <div className="skeleton-stat-card p-5 min-w-[200px]">
              <div className="skeleton h-3 w-20 mb-3" />
              <div className="skeleton h-6 w-28 mb-2" />
              <div className="skeleton h-4 w-24" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/5 sticky top-[57px] z-10 backdrop-blur-xl bg-black/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex gap-4">
          <div className="skeleton h-5 w-24" />
          <div className="skeleton h-5 w-28" />
          <div className="skeleton h-5 w-20" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* EPS Card */}
            <div className="skeleton-stat-card p-8">
              <div className="skeleton h-6 w-40 mb-8" />
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="skeleton h-3 w-16 mx-auto mb-3" />
                  <div className="skeleton h-12 w-20 mx-auto" />
                </div>
                <div className="text-center">
                  <div className="skeleton h-3 w-16 mx-auto mb-3" />
                  <div className="skeleton h-12 w-20 mx-auto" />
                </div>
                <div className="text-center">
                  <div className="skeleton h-3 w-16 mx-auto mb-3" />
                  <div className="skeleton h-12 w-20 mx-auto" />
                </div>
              </div>
            </div>
          </div>
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="skeleton-stat-card p-5">
              <div className="skeleton h-5 w-24 mb-5" />
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex justify-between">
                    <div className="skeleton h-4 w-20" />
                    <div className="skeleton h-4 w-12" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
