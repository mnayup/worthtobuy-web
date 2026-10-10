import React from 'react';
import { Download } from 'lucide-react';
import { PageHeader } from '~/components/PageHeader';
import { ConfirmDialog } from '~/components/ConfirmDialog';
import { Toast } from '~/components/Toast';
import {
  useTrash,
  fetchTrashLoader,
  trashAction,
} from './hooks/use-trash';
import { TrashStatCards } from './components/trash-stat-cards';
import { TrashFilterBar } from './components/trash-filter-bar';
import { TrashTable } from './components/trash-table';
import { TrashPaginationBar } from './components/trash-pagination-bar';

export async function loader(params?: {
  search?: string;
  type?: string;
  page?: number;
  limit?: number;
}) {
  return fetchTrashLoader(params);
}

export async function action(data: {
  intent: 'restore' | 'delete';
  entityType: string;
  id: string | number;
}) {
  return trashAction(data);
}

export default function TrashRoute() {
  const {
    search,
    setSearch,
    type,
    setType,
    page,
    setPage,
    limit,
    setLimit,
    total,
    counts,
    loading,
    processing,
    permanent,
    setPermanent,
    selectedKeys,
    setSelectedKeys,
    bulkPermanentOpen,
    setBulkPermanentOpen,
    toast,
    setToast,
    sortCol,
    sortDir,
    handleSortToggle,
    filtered,
    allFilteredSelected,
    someFilteredSelected,
    toggleAllFiltered,
    toggleRow,
    restoreItem,
    restoreSelected,
    removePermanent,
    removeSelectedPermanent,
    exportTrashExcel,
  } = useTrash();

  return (
    <div className="animate-rise space-y-5">
      <PageHeader
        title="Trash / Recycle Bin"
        description="Safely restore accidentally removed records or permanently purge unnecessary data."
        actions={
          <button
            className="btn-secondary cursor-pointer"
            onClick={exportTrashExcel}
          >
            <Download size={16} className="text-brand-500" /> Export Excel
          </button>
        }
      />

      <TrashStatCards counts={counts} />

      <div className="card overflow-hidden">
        <TrashFilterBar
          search={search}
          setSearch={setSearch}
          type={type}
          setType={setType}
          setPage={setPage}
          selectedKeys={selectedKeys}
          setSelectedKeys={setSelectedKeys}
          processing={processing}
          onRestoreSelected={restoreSelected}
          onBulkPermanentOpen={() => setBulkPermanentOpen(true)}
        />

        <TrashTable
          filtered={filtered}
          loading={loading}
          processing={processing}
          selectedKeys={selectedKeys}
          allFilteredSelected={allFilteredSelected}
          someFilteredSelected={someFilteredSelected}
          sortCol={sortCol}
          sortDir={sortDir}
          onSortToggle={handleSortToggle}
          onToggleAll={toggleAllFiltered}
          onToggleRow={toggleRow}
          onRestoreItem={restoreItem}
          onPermanentDelete={(row) => setPermanent(row)}
        />

        {!loading && total > 0 && (
          <TrashPaginationBar
            page={page}
            setPage={setPage}
            limit={limit}
            setLimit={setLimit}
            total={total}
          />
        )}
      </div>

      <ConfirmDialog
        open={Boolean(permanent)}
        title="Permanently Delete?"
        message="This record will be permanently erased from the database and cannot be recovered."
        onCancel={() => setPermanent(null)}
        onConfirm={removePermanent}
        loading={processing}
      />

      <ConfirmDialog
        open={bulkPermanentOpen}
        title={`Permanently delete ${selectedKeys.length} items?`}
        message="All selected records will be permanently removed from the database and cannot be recovered."
        onCancel={() => setBulkPermanentOpen(false)}
        onConfirm={removeSelectedPermanent}
        loading={processing}
      />

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
