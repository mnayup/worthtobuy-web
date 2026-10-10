interface DashboardFiltersProps {
  start: string;
  end: string;
  periodId: string;
  periods: Array<{ id: number | string; code: string; name: string }>;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  onPeriodChange: (value: string) => void;
  onApply: () => void;
}

export function DashboardFilters({
  start,
  end,
  periodId,
  periods,
  onStartChange,
  onEndChange,
  onPeriodChange,
  onApply,
}: DashboardFiltersProps) {
  return (
    <div className="card p-5 border border-slate-200/80 bg-white shadow-sm">
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="label">Start Date</label>
          <input
            type="date"
            className="input"
            value={start}
            onChange={(e) => onStartChange(e.target.value)}
          />
        </div>
        <div>
          <label className="label">End Date</label>
          <input
            type="date"
            className="input"
            value={end}
            onChange={(e) => onEndChange(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Event</label>
          <select
            className="input"
            value={periodId}
            onChange={(e) => onPeriodChange(e.target.value)}
          >
            <option value="">All Events</option>
            {periods.map((period) => (
              <option key={period.id} value={period.id}>
                {period.code} • {period.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={onApply}
            className="btn-primary w-full bg-rose-600 hover:bg-rose-700 text-white font-bold"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
