import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { ValidatedImportRow } from '~/lib/master-data-validator';

interface ImportPreviewTableProps {
  rows: ValidatedImportRow[];
}

export function ImportPreviewTable({ rows }: ImportPreviewTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="scrollbar-thin max-h-64 overflow-y-auto">
        <table className="w-full border-collapse text-xs">
          <thead className="table-head sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-center w-16">Baris</th>
              <th className="px-3 py-2 text-center w-24">Status</th>
              <th className="px-3 py-2 text-left">Primary Data / Identifier</th>
              <th className="px-3 py-2 text-left">Value Details & Column Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400">
                  No data matches the selected filter.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.rowNumber}
                  className={
                    row.status === 'INVALID'
                      ? 'bg-rose-50/40'
                      : 'hover:bg-slate-50/70'
                  }
                >
                  <td className="px-3 py-2.5 text-center font-bold text-slate-600">
                    {row.rowNumber}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {row.status === 'VALID' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700 ring-1 ring-emerald-200">
                        <CheckCircle2 size={11} /> VALID
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-black text-rose-700 ring-1 ring-rose-200">
                        <AlertTriangle size={11} /> ERROR ({row.issues.length})
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 font-bold text-slate-900">
                    {row.identifier}
                  </td>
                  <td className="px-3 py-2.5">
                    {row.status === 'INVALID' ? (
                      <div className="space-y-1">
                        {row.issues.map((iss, i) => (
                          <div
                            key={i}
                            className="text-rose-700 flex items-center gap-1.5 font-medium"
                          >
                            <span className="font-bold text-rose-800 bg-rose-100/80 px-1.5 py-0.5 rounded text-[10px]">
                              {iss.fieldLabel}:
                            </span>
                            <span>{iss.error}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-slate-600 truncate max-w-xl text-[11px]">
                        {Object.entries(row.payload)
                          .filter(([k]) => !k.startsWith('_'))
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(' • ')}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
