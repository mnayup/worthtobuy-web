import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import type { ImportPreviewRow } from './crud-filters.helper';

interface CrudImportPreviewModalProps {
  importPreview: ImportPreviewRow[];
  importFileName: string;
  saving?: boolean;
  onClose: () => void;
  onConfirmImport: () => void;
}

export function CrudImportPreviewModal({
  importPreview,
  importFileName,
  saving,
  onClose,
  onConfirmImport,
}: CrudImportPreviewModalProps) {
  const validCount = importPreview.filter((r) => r.issues.length === 0).length;
  const invalidCount = importPreview.filter((r) => r.issues.length > 0).length;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-900/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-brand-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-black text-brand-900">
              Import Preview: {importFileName}
            </h2>
            <p className="text-xs text-brand-500">
              {importPreview.length} rows read ({validCount} valid, {invalidCount} with issues)
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-brand-400 hover:bg-brand-50 hover:text-brand-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="scrollbar-thin max-h-[calc(90vh-140px)] overflow-y-auto p-6">
          <table className="min-w-full text-xs">
            <thead className="table-head">
              <tr>
                <th className="px-3 py-2">Row</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Data Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100">
              {importPreview.map((row) => (
                <tr key={row.line} className={row.issues.length ? 'bg-rose-50/50' : ''}>
                  <td className="px-3 py-2 font-bold">{row.line}</td>
                  <td className="px-3 py-2">
                    {row.issues.length ? (
                      <span className="font-bold text-rose-600">
                        {row.issues.join(' ')}
                      </span>
                    ) : (
                      <span className="font-bold text-emerald-600">Ready to import</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-brand-700">
                    {Object.entries(row.payload)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(' | ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-2 border-t border-brand-100 bg-brand-50/50 px-6 py-4">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            disabled={saving || validCount === 0}
            className="btn-primary"
            onClick={onConfirmImport}
          >
            {saving ? 'Importing...' : 'Import Valid Rows'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
