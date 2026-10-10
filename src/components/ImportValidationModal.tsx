import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  RefreshCw,
  Search,
  Upload,
  X,
} from 'lucide-react';
import { api, errorMessage } from '~/lib/api';
import { runBulkAction } from '~/lib/bulk';
import type { ValidatedImportRow, ValidationSummary } from '~/lib/master-data-validator';
import { ImportIssuesList } from './import-modal/ImportIssuesList';
import { ImportKpiBanner } from './import-modal/ImportKpiBanner';
import { ImportPreviewTable } from './import-modal/ImportPreviewTable';

interface Props {
  validation: ValidationSummary;
  endpoint: string;
  entityTitle: string;
  onClose: () => void;
  onSuccess: (count: number) => void;
  onReupload: () => void;
}

export function ImportValidationModal({
  validation,
  endpoint,
  entityTitle,
  onClose,
  onSuccess,
  onReupload,
}: Props) {
  const [filter, setFilter] = useState<'all' | 'valid' | 'invalid'>('all');
  const [search, setSearch] = useState('');
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const filteredRows = useMemo(() => {
    let list = validation.rows;
    if (filter === 'valid') list = list.filter((r) => r.status === 'VALID');
    if (filter === 'invalid') list = list.filter((r) => r.status === 'INVALID');

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.identifier.toLowerCase().includes(q) ||
          String(r.rowNumber).includes(q) ||
          Object.values(r.rawValues).some((val) =>
            String(val).toLowerCase().includes(q)
          )
      );
    }
    return list;
  }, [validation.rows, filter, search]);

  const validRows = useMemo(
    () => validation.rows.filter((r) => r.status === 'VALID'),
    [validation.rows]
  );

  async function handleImport() {
    if (!validRows.length) return;
    setImporting(true);
    setErrorMsg('');
    setImportProgress(0);

    try {
      let completed = 0;
      const results = await runBulkAction(
        validRows,
        async (row: ValidatedImportRow) => {
          await api.post(endpoint, row.payload);
          completed++;
          setImportProgress(Math.round((completed / validRows.length) * 100));
        },
        3
      );

      const succeeded = results.succeeded.length;
      const failed = results.failed.length;

      if (failed > 0) {
        setErrorMsg(
          `${succeeded} data imported successfully, but ${failed} data failed during saving on the server.`
        );
      } else {
        onSuccess(succeeded);
      }
    } catch (caught) {
      setErrorMsg(errorMessage(caught));
    } finally {
      setImporting(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-rise">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-rose-50 p-2.5 text-rose-600 ring-1 ring-rose-200 shadow-2xs">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Data Import Verification & Validation {entityTitle}
              </h2>
              <p className="text-xs text-slate-500">
                File:{' '}
                <span className="font-semibold text-slate-700">
                  {validation.fileName}
                </span>{' '}
                • {validation.totalRows} rows read
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={importing}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="scrollbar-thin flex-1 overflow-y-auto p-6 space-y-6">
          <ImportKpiBanner validation={validation} />

          {validation.invalidRows > 0 ? (
            <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-4 text-xs text-amber-900 flex items-start gap-3 shadow-2xs">
              <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-amber-950">
                  Found {validation.invalidRows} rows of data that do not meet the validation format.
                </p>
                <p className="mt-1 text-amber-800 leading-relaxed">
                  Please check the details of problematic columns below. Fix the Excel file and click <strong>"Re-upload"</strong>, or continue importing only the <strong>{validation.validRows} valid data</strong>.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50/60 p-4 text-xs text-emerald-900 flex items-center gap-3 shadow-2xs">
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-sm text-emerald-950">
                  All data is valid & ready to be imported into the system!
                </p>
                <p className="text-emerald-700">
                  All {validation.validRows} rows of data have been fully verified.
                </p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-xs font-bold text-rose-800">
              {errorMsg}
            </div>
          )}

          <ImportIssuesList validation={validation} />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-200 pt-4">
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setFilter('all')}
                className={`rounded-lg px-3 py-1.5 transition ${
                  filter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({validation.totalRows})
              </button>
              <button
                onClick={() => setFilter('valid')}
                className={`rounded-lg px-3 py-1.5 transition ${
                  filter === 'valid'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Valid Data ({validation.validRows})
              </button>
              <button
                onClick={() => setFilter('invalid')}
                className={`rounded-lg px-3 py-1.5 transition ${
                  filter === 'invalid'
                    ? 'bg-white text-rose-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                With Issues ({validation.invalidRows})
              </button>
            </div>

            <div className="relative">
              <Search
                className="absolute left-3 top-2.5 text-slate-400"
                size={15}
              />
              <input
                type="text"
                placeholder="Search in imported data..."
                className="input pl-8 pr-3 py-1.5 text-xs sm:w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <ImportPreviewTable rows={filteredRows} />

          {importing && (
            <div className="space-y-2 rounded-2xl bg-rose-50 p-4 border border-rose-200 animate-pulse">
              <div className="flex items-center justify-between text-xs font-bold text-rose-900">
                <span className="flex items-center gap-2">
                  <RefreshCw className="animate-spin text-rose-600" size={15} />
                  Processing import to database...
                </span>
                <span>{importProgress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-rose-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-rose-600 transition-all duration-300"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            onClick={onReupload}
            disabled={importing}
            className="btn-secondary text-xs"
          >
            <Upload size={14} /> Re-upload File
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={importing}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>

            <button
              disabled={importing || validRows.length === 0}
              onClick={handleImport}
              className="btn-primary text-xs"
            >
              {importing ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Importing...
                </>
              ) : validation.invalidRows > 0 ? (
                <>
                  Import {validRows.length} Valid Data (Skip{' '}
                  {validation.invalidRows} Errors)
                  <ArrowRight size={14} />
                </>
              ) : (
                <>
                  Import All ({validRows.length} Valid Data)
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
