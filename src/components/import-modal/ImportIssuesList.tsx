import { AlertTriangle, Lightbulb } from 'lucide-react';
import type { ValidationSummary } from '~/lib/master-data-validator';

interface ImportIssuesListProps {
  validation: ValidationSummary;
}

export function ImportIssuesList({ validation }: ImportIssuesListProps) {
  if (validation.invalidRows <= 0) return null;

  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50/30 p-5 space-y-3">
      <div className="flex items-center gap-2 text-rose-900">
        <AlertTriangle size={18} className="text-rose-600" />
        <h3 className="text-sm font-extrabold uppercase tracking-wider">
          Details of Data that Needs to be Fixed ({validation.allIssues.length} Issues Detected)
        </h3>
      </div>

      <div className="scrollbar-thin max-h-48 overflow-y-auto space-y-2 pr-1">
        {validation.allIssues.map((issue, idx) => (
          <div
            key={idx}
            className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl bg-white p-3 border border-rose-100 shadow-2xs text-xs gap-2"
          >
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-rose-100 px-2 py-0.5 font-bold text-rose-800 text-[11px] whitespace-nowrap">
                Row {issue.rowNumber}
              </span>
              <strong className="text-slate-800">{issue.identifier}</strong>
              <span className="text-slate-400">→</span>
              <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                {issue.fieldLabel}
              </span>
              <span className="text-rose-900 font-medium">{issue.error}</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 shrink-0">
              <Lightbulb size={13} className="text-amber-500 shrink-0" />
              <span className="text-[11px]">
                <strong>Solution:</strong> {issue.fixHint}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
