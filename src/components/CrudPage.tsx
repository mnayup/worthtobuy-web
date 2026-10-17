import { useMemo, useRef, useState } from 'react';
import { Download, Plus, Upload } from 'lucide-react';
import { api, errorMessage } from '~/lib/api';
import {
  validateMasterDataImport,
  type ValidationSummary,
} from '~/lib/master-data-validator';
import { DataTable } from './DataTable';
import { PageHeader } from './PageHeader';
import { CrudBulkActionsBar } from './crud-page/CrudBulkActionsBar';
import {
  handleDownloadSampleExcel,
  handleExportExcel,
} from './crud-page/crud-excel.helper';
import { CrudFilterBar } from './crud-page/CrudFilterBar';
import { resolveFilterOptions } from './crud-page/crud-filters.helper';
import { CrudModals } from './crud-page/CrudModals';
import type { CrudPageProps } from './crud-page/types';
import { useCrudData } from './crud-page/use-crud-data';
import { useSavedFilters } from './crud-page/use-saved-filters';

export function CrudPage({
  title,
  description,
  endpoint,
  columns,
  fields,
  canCreate = true,
  canEdit = true,
  canDelete = false,
  canEditRow,
  canDeleteRow,
  prepareInitial,
  prepareSubmit,
  renderActions,
  bulkStatus,
  importConfig,
  topContent,
  entityName,
  extraQuery,
  filters,
  searchPlaceholder,
  selectable,
}: CrudPageProps) {
  const {
    data,
    total,
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    columnFilters,
    setColumnFilters,
    loading,
    saving,
    modal,
    setModal,
    editing,
    setEditing,
    deleting,
    setDeleting,
    selectedIds,
    setSelectedIds,
    bulkDeleteOpen,
    setBulkDeleteOpen,
    bulkValue,
    setBulkValue,
    toast,
    setToast,
    load,
    save,
    remove,
    removeSelected,
    applyBulkStatus,
  } = useCrudData({ endpoint, fields, prepareSubmit, extraQuery, bulkStatus });

  const { savedFilters, saveFilter, deleteFilter } = useSavedFilters(endpoint);
  const fileRef = useRef<HTMLInputElement>(null);
  const [validationSummary, setValidationSummary] = useState<ValidationSummary | null>(null);

  const resolvedEntityType =
    importConfig?.entityType ||
    (endpoint === '/customers' || title.toLowerCase().includes('customer')
      ? 'customers'
      : undefined) ||
    (endpoint === '/products' || title.toLowerCase().includes('product')
      ? 'products'
      : undefined) ||
    (endpoint === '/periods' || title.toLowerCase().includes('event') ? 'events' : undefined);

  const resolvedFilters = useMemo(
    () => resolveFilterOptions(fields, filters),
    [filters, fields]
  );
  const hasActiveFilters = Boolean(
    search || Object.values(columnFilters).some((v) => Boolean(v) && v !== 'ALL')
  );

  async function downloadTemplate() {
    let activeEvents: any[] = [];
    if (resolvedEntityType === 'products') {
      try {
        const res = await api.get('/periods?limit=200');
        activeEvents = res.data.data || [];
      } catch { /* ignore */ }
    }
    handleDownloadSampleExcel(title, fields, resolvedEntityType, activeEvents);
  }

  async function previewExcel(file?: File) {
    if (!file || !resolvedEntityType) return;
    try {
      let events: any[] = [];
      if (resolvedEntityType === 'products') {
        const res = await api.get('/periods?limit=200');
        events = res.data.data || [];
      }
      const summary = await validateMasterDataImport(resolvedEntityType, file, { events });
      setValidationSummary(summary);
    } catch (caught) {
      setToast({
        message: errorMessage(caught),
        type: 'error',
        title: 'Failed to Read Excel File',
      });
    }
  }

  return (
    <div className="animate-rise space-y-5">
      <PageHeader
        title={title}
        description={description}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {importConfig && (
              <>
                <button className="btn-secondary" onClick={downloadTemplate}>
                  <Download size={15} className="text-brand-500" /> Template
                </button>
                <label className="btn-secondary cursor-pointer">
                  <Upload size={15} className="text-brand-500" /> Import
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                    onChange={(e) => previewExcel(e.target.files?.[0])}
                  />
                </label>
              </>
            )}
            <button
              className="btn-secondary"
              onClick={() => handleExportExcel(title, columns, data)}
            >
              <Download size={15} className="text-brand-500" /> Export Excel
            </button>
            {canCreate && (
              <button
                className="btn-primary"
                onClick={() => {
                  setEditing(null);
                  setModal(true);
                }}
              >
                <Plus size={16} /> New {entityName || title}
              </button>
            )}
          </div>
        }
      />

      {topContent}

      <CrudFilterBar
        title={title}
        searchPlaceholder={searchPlaceholder}
        search={search}
        onSearchChange={setSearch}
        columnFilters={columnFilters}
        onColumnFilterChange={(key, val) => {
          setColumnFilters((prev) => {
            const next = { ...prev };
            if (val) next[key] = val;
            else delete next[key];
            return next;
          });
        }}
        resolvedFilters={resolvedFilters}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={() => {
          setSearch('');
          setColumnFilters({});
          setPage(1);
        }}
        onSaveFilter={() => saveFilter(search, columnFilters)}
        savedFilters={savedFilters}
        onApplySavedFilter={(f) => {
          setSearch(f.search || '');
          setColumnFilters(f.filters || {});
        }}
        onDeleteSavedFilter={deleteFilter}
        total={total}
      />

      <CrudBulkActionsBar
        bulkStatus={bulkStatus}
        selectedIds={selectedIds}
        bulkValue={bulkValue}
        onBulkValueChange={setBulkValue}
        onApplyBulkStatus={applyBulkStatus}
        canDelete={canDelete}
        onBulkDeleteOpen={() => setBulkDeleteOpen(true)}
        saving={saving}
      />

      <DataTable
        columns={columns}
        rows={data}
        loading={loading}
        page={page}
        limit={limit}
        total={total}
        onPage={setPage}
        onLimit={(val) => {
          setLimit(val);
          setPage(1);
        }}
        selectedRowIds={selectedIds}
        onSelectedRowIdsChange={
          selectable === false || (!bulkStatus && !canDelete && selectable !== true)
            ? undefined
            : setSelectedIds
        }
        onEdit={
          canEdit
            ? (row) => {
                setEditing(row);
                setModal(true);
              }
            : undefined
        }
        onDelete={canDelete ? (row) => setDeleting(row) : undefined}
        canEditRow={canEditRow}
        canDeleteRow={canDeleteRow}
        renderActions={renderActions}
      />

      <CrudModals
        modal={modal}
        editing={editing}
        entityName={entityName}
        title={title}
        fields={fields}
        prepareInitial={prepareInitial}
        saving={saving}
        endpoint={endpoint}
        onModalClose={() => {
          setModal(false);
          setEditing(null);
        }}
        onSave={save}
        deleting={deleting}
        onDeleteCancel={() => setDeleting(null)}
        onDeleteConfirm={remove}
        bulkDeleteOpen={bulkDeleteOpen}
        selectedCount={selectedIds.length}
        onBulkDeleteCancel={() => setBulkDeleteOpen(false)}
        onBulkDeleteConfirm={removeSelected}
        validationSummary={validationSummary}
        onValidationClose={() => {
          setValidationSummary(null);
          if (fileRef.current) fileRef.current.value = '';
        }}
        onValidationSuccess={async (count) => {
          setValidationSummary(null);
          if (fileRef.current) fileRef.current.value = '';
          setToast({
            message: `Successfully imported ${count} records into ${
              entityName || title
            }.`,
            type: 'success',
            title: 'Import Successful',
          });
          await load();
        }}
        onValidationReupload={() => {
          setValidationSummary(null);
          if (fileRef.current) {
            fileRef.current.value = '';
            fileRef.current.click();
          }
        }}
        toast={toast}
        onToastClose={() => setToast(null)}
      />
    </div>
  );
}
