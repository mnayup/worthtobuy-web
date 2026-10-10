import { Download } from 'lucide-react';
import { api } from '~/lib/api';
import { PageHeader } from '~/components/PageHeader';
import { Toast } from '~/components/Toast';
import { ConfirmDialog } from '~/components/ConfirmDialog';
import {
  useInvoicesList,
  invoiceListLoader,
} from './hooks/use-invoices-list';
import { InvoicesInfoCards } from './components/invoices-info-cards';
import { InvoicesFilterBar } from './components/invoices-filter-bar';
import { InvoicesTable } from './components/invoices-table';
import { InvoicesPaginationBar } from './components/invoices-pagination-bar';

export async function loader(params?: {
  search?: string;
  status?: string;
  billingModel?: string;
  overdue?: string;
  outstanding?: string;
  page?: number;
  limit?: number;
}) {
  return invoiceListLoader(params);
}

export async function action(data: { intent: string; id?: number | string }) {
  if (data.intent === 'delete' && data.id) {
    return api.delete(`/invoices/${data.id}`);
  }
  return null;
}

export default function InvoicesRoute() {
  const {
    invoices,
    total,
    loading,
    error,
    search,
    setSearch,
    status,
    setStatus,
    billingModel,
    setBillingModel,
    page,
    setPage,
    limit,
    setLimit,
    sortCol,
    sortDir,
    activeTab,
    setActiveTab,
    deleting,
    setDeleting,
    selectedInvoiceIds,
    setSelectedInvoiceIds,
    bulkDeleteOpen,
    setBulkDeleteOpen,
    savingDelete,
    toast,
    setToast,
    sortedInvoices,
    canDeleteInvoices,
    allInvoicesSelected,
    someInvoicesSelected,
    handleSortToggle,
    removeInvoice,
    removeSelectedInvoices,
    toggleAllInvoices,
    toggleInvoice,
    exportInvoicesExcel,
  } = useInvoicesList();

  return (
    <div className="animate-rise space-y-5">
      <PageHeader
        title="Invoices & Billing"
        description="Consolidate customer orders across events into unified billing statements."
        actions={
          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary" onClick={exportInvoicesExcel}>
              <Download size={16} className="text-brand-500" /> Export Excel
            </button>
          </div>
        }
      />

      <InvoicesInfoCards total={total} invoices={invoices} />

      <div className="card overflow-hidden">
        <InvoicesFilterBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
          billingModel={billingModel}
          setBillingModel={setBillingModel}
          setPage={setPage}
          total={total}
          canDeleteInvoices={canDeleteInvoices}
          selectedCount={selectedInvoiceIds.length}
          onClearSelection={() => setSelectedInvoiceIds([])}
          onOpenBulkDelete={() => setBulkDeleteOpen(true)}
        />

        {error && (
          <div
            className={
              'm-4 rounded-2xl bg-cherry-50 border border-cherry-200 ' +
              'p-3.5 text-sm font-bold text-cherry-700'
            }
          >
            {error}
          </div>
        )}

        <InvoicesTable
          invoices={sortedInvoices}
          loading={loading}
          canDeleteInvoices={canDeleteInvoices}
          allInvoicesSelected={allInvoicesSelected}
          someInvoicesSelected={someInvoicesSelected}
          selectedInvoiceIds={selectedInvoiceIds}
          sortCol={sortCol}
          sortDir={sortDir}
          onSortToggle={handleSortToggle}
          onToggleAll={toggleAllInvoices}
          onToggleOne={toggleInvoice}
          onDeleteOne={canDeleteInvoices ? setDeleting : undefined}
        />

        {!loading && total > 0 && (
          <InvoicesPaginationBar
            page={page}
            limit={limit}
            total={total}
            setPage={setPage}
            setLimit={setLimit}
          />
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Move invoice to Trash?"
        message="This invoice will be moved to the Trash menu and can be restored at any time."
        onCancel={() => setDeleting(null)}
        onConfirm={removeInvoice}
        loading={savingDelete}
      />
      <ConfirmDialog
        open={bulkDeleteOpen}
        title={`Move ${selectedInvoiceIds.length} invoices to Trash?`}
        message="All selected invoices will be moved to the Trash menu and can be restored."
        onCancel={() => setBulkDeleteOpen(false)}
        onConfirm={removeSelectedInvoices}
        loading={savingDelete}
      />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
