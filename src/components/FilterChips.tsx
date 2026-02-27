'use client';

type FilterType = 'all' | 'beat' | 'miss' | 'pending';

interface FilterChipsProps {
  value: FilterType;
  onChange: (filter: FilterType) => void;
  counts: {
    all: number;
    beat: number;
    miss: number;
    pending: number;
  };
}

const filters: { key: FilterType; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: '' },
  { key: 'beat', label: 'Beat', icon: '📈' },
  { key: 'miss', label: 'Miss', icon: '📉' },
  { key: 'pending', label: 'Pending', icon: '⏳' },
];

export function FilterChips({ value, onChange, counts }: FilterChipsProps) {
  return (
    <div className="filter-chips">
      {filters.map((filter) => {
        const isActive = value === filter.key;
        const count = counts[filter.key];
        
        return (
          <button
            key={filter.key}
            onClick={() => onChange(filter.key)}
            className={`filter-chip ${isActive ? 'active' : ''} ${filter.key !== 'all' ? `filter-chip-${filter.key}` : ''}`}
            aria-pressed={isActive}
          >
            {filter.icon && <span className="filter-chip-icon">{filter.icon}</span>}
            <span className="filter-chip-label">{filter.label}</span>
            <span className={`filter-chip-count ${isActive ? 'visible' : ''}`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export type { FilterType };
