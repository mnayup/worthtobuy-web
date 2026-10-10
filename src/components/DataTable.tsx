import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { ColumnConfig } from '~/types';
import { DataTableBody } from './data-table/DataTableBody';
import { DataTableHeader } from './data-table/DataTableHeader';
import { DataTablePagination } from './data-table/DataTablePagination';
import { sortRows, type SortDirection } from './data-table/data-table-sorter';

export type { SortDirection };

type Props = {
  columns: ColumnConfig[];
  rows: any[];
  loading?: boolean;
  page: number;
  total: number;
  limit: number;
  onPage: (page: number) => void;
  onLimit?: (limit: number) => void;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  canEditRow?: (row: any) => boolean;
  canDeleteRow?: (row: any) => boolean;
  renderActions?: (row: any) => ReactNode;
  emptyText?: string;
  selectedRowIds?: Array<string | number>;
  onSelectedRowIdsChange?: (ids: string[]) => void;
  sortColumn?: string | null;
  sortDirection?: SortDirection;
  onSort?: (column: string, direction: SortDirection) => void;
};

export function DataTable({
  columns,
  rows,
  loading,
  page,
  total,
  limit,
  onPage,
  onLimit,
  onEdit,
  onDelete,
  canEditRow,
  canDeleteRow,
  renderActions,
  emptyText = 'No records found.',
  selectedRowIds = [],
  onSelectedRowIdsChange,
  sortColumn: externalSortCol,
  sortDirection: externalSortDir,
  onSort,
}: Props) {
  const [internalSortKey, setInternalSortKey] = useState<string | null>(null);
  const [internalSortDir, setInternalSortDir] = useState<SortDirection>(null);

  const activeSortKey =
    externalSortCol !== undefined ? externalSortCol : internalSortKey;
  const activeSortDir =
    externalSortDir !== undefined ? externalSortDir : internalSortDir;

  const handleSortToggle = (colKey: string) => {
    let nextDir: SortDirection = 'asc';
    if (activeSortKey === colKey) {
      if (activeSortDir === 'asc') nextDir = 'desc';
      else if (activeSortDir === 'desc') nextDir = null;
      else nextDir = 'asc';
    }

    if (onSort) onSort(colKey, nextDir);
    if (externalSortCol === undefined) {
      setInternalSortKey(nextDir ? colKey : null);
      setInternalSortDir(nextDir);
    }
  };

  const sortedRows = useMemo(
    () => sortRows(rows, activeSortKey, activeSortDir, columns),
    [rows, activeSortKey, activeSortDir, columns]
  );

  const hasActions = Boolean(onEdit || onDelete || renderActions);
  const selectable = Boolean(onSelectedRowIdsChange);
  const selected = new Set(selectedRowIds.map(String));
  const visibleIds = sortedRows.map((row, index) => String(row.id ?? index));
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
  const someVisibleSelected = visibleIds.some((id) => selected.has(id));

  function toggleAllVisible(checked: boolean) {
    if (!onSelectedRowIdsChange) return;
    const next = new Set(selected);
    for (const id of visibleIds) checked ? next.add(id) : next.delete(id);
    onSelectedRowIdsChange([...next]);
  }

  function toggleRow(id: string, checked: boolean) {
    if (!onSelectedRowIdsChange) return;
    const next = new Set(selected);
    checked ? next.add(id) : next.delete(id);
    onSelectedRowIdsChange([...next]);
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="min-w-full divide-y divide-brand-100">
          <DataTableHeader
            columns={columns}
            selectable={selectable}
            hasActions={hasActions}
            allVisibleSelected={allVisibleSelected}
            someVisibleSelected={someVisibleSelected}
            loading={loading}
            rowsCount={sortedRows.length}
            activeSortKey={activeSortKey}
            activeSortDir={activeSortDir}
            onToggleAllVisible={toggleAllVisible}
            onSortToggle={handleSortToggle}
          />
          <DataTableBody
            columns={columns}
            rows={sortedRows}
            loading={loading}
            limit={limit}
            selectable={selectable}
            hasActions={hasActions}
            selected={selected}
            emptyText={emptyText}
            canEditRow={canEditRow}
            canDeleteRow={canDeleteRow}
            renderActions={renderActions}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleRow={toggleRow}
          />
        </table>
      </div>

      <DataTablePagination
        page={page}
        total={total}
        limit={limit}
        selectedCount={selected.size}
        onPage={onPage}
        onLimit={onLimit}
      />
    </div>
  );
}
