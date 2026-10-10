import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { ValidationSummary } from '~/lib/master-data-validator';

interface ImportKpiBannerProps {
  validation: ValidationSummary;
}

export function ImportKpiBanner({ validation }: ImportKpiBannerProps) {
  const hasInvalid = validation.invalidRows > 0;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Total Rows Read
        </span>
        <p className="mt-1 text-2xl font-black text-slate-900">
          {validation.totalRows}
        </p>
        <p className="text-xs text-slate-400">Rows of data in the Excel file</p>
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Ready to Import
          </span>
          <CheckCircle2 size={18} className="text-emerald-600" />
        </div>
        <p className="mt-1 text-2xl font-black text-emerald-950">
          {validation.validRows}
        </p>
        <p className="text-xs text-emerald-700">Passed all format validations</p>
      </div>

      <div
        className={`rounded-2xl border p-4 ${
          hasInvalid
            ? 'border-rose-200 bg-rose-50/60'
            : 'border-slate-200 bg-slate-50/40'
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              hasInvalid ? 'text-rose-800' : 'text-slate-500'
            }`}
          >
            Data with Issues
          </span>
          <AlertTriangle
            size={18}
            className={hasInvalid ? 'text-rose-600' : 'text-slate-400'}
          />
        </div>
        <p
          className={`mt-1 text-2xl font-black ${
            hasInvalid ? 'text-rose-950' : 'text-slate-700'
          }`}
        >
          {validation.invalidRows}
        </p>
        <p className={`text-xs ${hasInvalid ? 'text-rose-700' : 'text-slate-400'}`}>
          {hasInvalid ? 'Needs fixing before import' : 'No data errors'}
        </p>
      </div>
    </div>
  );
}
