import { Trash2 } from 'lucide-react';
import type { BulkStatusConfig } from '~/types';

interface CrudBulkActionsBarProps {
  bulkStatus?: BulkStatusConfig;
  selectedIds: string[];
  bulkValue: string;
  onBulkValueChange: (value: string) => void;
  onApplyBulkStatus: () => void;
  canDelete?: boolean;
  onBulkDeleteOpen: () => void;
  saving?: boolean;
}

export function CrudBulkActionsBar({
  bulkStatus,
  selectedIds,
  bulkValue,
  onBulkValueChange,
  onApplyBulkStatus,
  canDelete,
  onBulkDeleteOpen,
  saving,
}: CrudBulkActionsBarProps) {
  if (!selectedIds.length) return null;

  return (
    <div className="space-y-3">
      {bulkStatus && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-honey-200 bg-honey-50/80 p-4 shadow-sm">
          <p className="text-sm font-extrabold text-honey-900">
            Update {bulkStatus.label} for {selectedIds.length} selected records:
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="input !w-auto !py-1.5 text-xs font-bold"
              value={bulkValue}
              onChange={(e) => onBulkValueChange(e.target.value)}
            >
              <option value="">Select status...</option>
              {bulkStatus.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              disabled={!bulkValue || saving}
              className="btn-primary !py-1.5 text-xs"
              onClick={onApplyBulkStatus}
            >
              {saving ? 'Applying...' : 'Apply'}
            </button>
          </div>
        </div>
      )}

      {canDelete && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cherry-200 bg-cherry-50/80 p-4 shadow-sm">
          <p className="text-sm font-extrabold text-cherry-800">
            {selectedIds.length} items selected.
          </p>
          <button
            className="btn bg-rose-600 text-white hover:bg-rose-700 !py-1.5 text-xs shadow-sm"
            onClick={onBulkDeleteOpen}
          >
            <Trash2 size={14} /> Move to Trash
          </button>
        </div>
      )}
    </div>
  );
}
